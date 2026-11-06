# mstrasser/jeff-adapter-issue-route

## Resumen

jeff-adapter-issue-route es un adaptador LoRA para el modelo de decisión jeff-base v1.4, un fine-tune de Qwen3.5-0.8B desarrollado por mstrasser. Resuelve una tarea muy concreta de ingeniería de software: clasificar issues y pull requests entrantes en un repositorio y asignarlos al componente del proyecto que debe resolverlos. A diferencia de un modelo generativo, no produce texto libre, sino que devuelve una probabilidad calibrada por cada opción nombrada en una sola pasada forward, lo que elimina la necesidad de parsear la salida.

El adaptador expone dos funciones: `kind`, que etiqueta el ítem como bug, docs, duplicate_candidate, feature o question aplicando reglas de prioridad explícitas, y `owner`, que enruta el ítem al componente propietario usando las descripciones de componentes, sus equipos responsables y sus rutas de código. El contexto que recibe incluye una descripción del proyecto, la lista de issues abiertas (para detectar duplicados) y el nuevo ítem con su tipo, número, título, cuerpo, etiquetas y archivos modificados.

Es relevante para equipos que mantienen proyectos open source o repositorios con volumen alto de reportes y quieren automatizar el triaje sin depender de un LLM generativo grande ni de heurísticas frágiles. Su tamaño reducido (adaptador LoRA sobre una base de 0.8B) y su licencia Apache 2.0 lo hacen desplegable en infraestructura modesta, aunque su alcance es estrictamente de clasificación: no redacta respuestas ni resuelve el problema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder jeff-base v1.4 (fine-tune de Qwen3.5-0.8B) |
| Parámetros totales | no disponible (adaptador LoRA; base de 0.8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) |
| Tamaño del repositorio | 0.1 GB |
| Pipeline | text-classification |
| Versión del adaptador | 1.4.0 |
| Base requerida | mstrasser/jeff-base en revisión v1.4 (el motor rechaza otras bases) |
| Fecha de entrenamiento | 2026-10-25 |

## Arquitectura y entrenamiento

El adaptador es un LoRA acoplado a jeff-base v1.4, un modelo de decisión pequeño derivado de Qwen3.5-0.8B. La base no genera texto: recibe una situación y una pregunta con opciones nombradas y emite una distribución de probabilidad sobre esas opciones en un único forward pass. El adaptador añade dos cabezas de decisión, `kind` y `owner`, con instrucciones y etiquetas definidas de forma explícita en la model card. La función `owner` acepta hasta 12 etiquetas proporcionadas por el llamador, cada una con una clave y su texto descriptivo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el adaptador se entrenó el 2026-10-25 y que las filas de entrenamiento y test se conservaron solo cuando una comprobación ciega con un LLM coincidía con la etiqueta, lo que el propio autor señala como probable causa de inflación de las métricas. La calibración se realizó sobre conjuntos de 1.020 filas (kind) y 980 filas (owner).

## Capacidades

- Clasificación de issues y pull requests en cinco categorías: bug, docs, duplicate_candidate, feature y question, con reglas de prioridad explícitas (por ejemplo, un PR que corrige un defecto se etiqueta como bug; una petición de comportamiento nuevo se etiqueta como feature aunque el autor la llame bug).
- Enrutamiento a componente propietario: selecciona entre hasta 12 componentes definidos por el llamador, usando descripciones, equipos, rutas de código y las pistas del propio reporte (mensajes de error, stack traces, archivos cambiados).
- Detección de duplicados candidatos comparando el nuevo ítem con la lista de issues abiertas proporcionada en el contexto.
- Salida calibrada: probabilidad por opción en una sola pasada, sin texto generado que haya que parsear.
- Umbrales de confianza publicados: 0.564 para `kind` y 0.435 para `owner`, con precisión del 99,1% y 97,9% respectivamente sobre respuestas confiadas.
- Capacidad de recibir metadatos estructurados del ítem: tipo, número, título, cuerpo, etiquetas y archivos modificados.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Triaje automático de issues en repositorios open source: el adaptador recibe la descripción del proyecto, las issues abiertas y el nuevo reporte, y devuelve etiqueta de tipo y componente propietario, reduciendo el tiempo de primera respuesta del mantenedor.
- Enrutamiento de pull requests al equipo correcto: usando los archivos cambiados y las rutas de código de cada componente, asigna el PR al equipo que debe revisarlo, lo que es útil en monorepos con decenas de componentes.
- Detección temprana de duplicados: compara el nuevo ítem con la lista de issues abiertas y marca duplicate_candidate cuando reporta el mismo problema con otras palabras, evitando trabajo redundante.
- Clasificación de peticiones de soporte en foros o canales de la comunidad: distingue preguntas de uso (question) de defectos reales (bug) y de peticiones de funcionalidad (feature), lo que permite priorizar la cola de soporte.
- Separación de cambios de documentación: identifica ítems que solo requieren cambios en docs, README, ejemplos o comentarios, y los deriva a un flujo de revisión específico sin pasar por el equipo de ingeniería.
- Automatización de la primera respuesta en un bot de GitHub: integrado vía el SDK de Jeff, el adaptador puede etiquetar y asignar el ítem en el momento de su creación, con la confianza calibrada como criterio para escalar a revisión humana cuando el umbral no se alcanza.
- Auditoría de calidad de etiquetado: al devolver probabilidades por opción, permite comparar la decisión del modelo con las etiquetas históricas del repositorio y detectar inconsistencias en el triaje manual.

## Benchmarks y rendimiento

| Test | Filas | Accuracy |
|---|---:|---:|
| Test interno (generador) | 2.000 | 99,0% |
| Segundo test interno de casos no vistos (generador) | no registrado | 98,9% |

| Función | Umbral | Precisión | Cobertura | Filas de calibración |
|---|---:|---:|---:|---:|
| `kind` | 0.564 | 99,1% | 100,0% | 1.020 |
| `owner` | 0.435 | 97,9% | 100,0% | 980 |

El autor advierte que ambas pruebas son de tipo "generator", es decir, generadas por el mismo generador que los datos de entrenamiento, por lo que miden menos que un test público o con documentos reales. Además, las filas se filtraron por acuerdo con una comprobación ciega de un LLM, lo que probablemente infla las puntuaciones. No se han publicado resultados en benchmarks públicos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el adaptador ocupa 0.1 GB y la base es de 0.8B, por lo que en fp16 la base rondaría 1,6 GB y en cuantización de 4 bits aproximadamente 0,5 GB, aunque no se confirman cuantizaciones soportadas.
- GPU recomendadas: no disponible; por el tamaño de la base, cualquier GPU consumer con 4 GB o más de VRAM debería ser suficiente en teoría, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de la base, aunque no se especifican modelos concretos ni requisitos oficiales.
- Opciones de despliegue: el adaptador se carga mediante el motor y el SDK de Jeff (repositorio github.com/firelex/jeff); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeff-adapter-issue-route | LoRA de clasificación sobre base 0.8B | no disponible (base 0.8B) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| LLM generativo grande con prompt de triaje | Generativo | 7B-70B típicamente | variable | variable | amplia |
| Clasificador BERT fine-tuneado para issues | Encoder | 110M-340M | 512 típicamente | variable | amplia |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. Frente a un LLM generativo, este adaptador ofrece salida calibrada sin parseo y menor coste de inferencia, pero no genera respuestas ni razona de forma abierta. Frente a un clasificador BERT, ofrece contexto más rico (descripción del proyecto, issues abiertas, archivos cambiados) y enrutamiento a componentes configurables, a costa de depender de una base propietaria concreta.

## Limitaciones y advertencias

- Solo clasifica y enruta; no redacta respuestas ni resuelve el problema, según indica explícitamente la model card.
- Solo soporta inglés.
- Está acoplado a la revisión v1.4 de jeff-base: el motor rechaza el adaptador si la base no coincide, lo que limita la portabilidad y obliga a fijar la revisión.
- Las métricas publicadas provienen de tests generados por el mismo generador que los datos de entrenamiento y de filas filtradas por acuerdo con un LLM, por lo que el autor reconoce que probablemente están infladas.
- No hay resultados en benchmarks públicos ni con documentos reales held-out.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- El SDK y el motor deben instalarse desde GitHub hasta que los paquetes estén en PyPI, lo que añade fricción de despliegue.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en ítems ambiguos o en proyectos con componentes mal descritos.
- No se documentan sesgos conocidos ni limitaciones de contexto más allá de lo indicado.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de la base jeff-base v1.4 debe verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-issue-route
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo: https://jeffhub.ai/catalogue/jeff.engineering.issue-route
- Repositorio de código, servidor y SDK: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
