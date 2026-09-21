# llm-semantic-router/Decision-1.0-Sol

## Resumen

Decision-1.0-Sol (etiquetado internamente como v1.2) es un modelo de decisión desarrollado por el usuario llm-semantic-router a partir de un ajuste fino de Qwen/Qwen3.5-2B. No es un modelo generativo de propósito general: recibe un estado, una pregunta y un conjunto de respuestas candidatas, y devuelve una decisión junto con la distribución de probabilidad sobre etiquetas especificadas en tiempo de ejecución. Con 1.884 millones de parámetros y licencia Apache 2.0, cubre tres tipos de tarea: Choice (elegir entre 2 y 255 acciones), Noul (estimar P(verdadero) de una condición dada la evidencia aportada) y Score (aplicar de 2 a 10 descripciones de rúbrica ordenadas).

Su relevancia actual está en las arquitecturas de enrutado y orquestación: sustituye llamadas a LLM generalistas por un clasificador compacto que devuelve probabilidades calibradas y etiquetas redefinibles sin reentrenar. El autor reporta un 69,80 % de precisión media en cuatro paneles evaluados sobre 2.720 decisiones, lo que supone +2,41 puntos respecto a su predecesor directo (Sol v1.1, 67,39 %) y +9,26 sobre Qwen3.5-2B sin ajustar (60,54 %).

El modelo exige código propio (paquete Python `decision`, etiqueta `custom-code` en el repositorio), está validado únicamente sobre GPU AMD gfx942 mediante ROCm, y no soporta CPU ni MPS, con NVIDIA sin cualificar. El estado, la pregunta y los candidatos completos deben caber en 16.384 tokens; cualquier desbordamiento se rechaza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal Qwen3.5 con atencion lineal con compuerta y atencion completa, mas una cabeza compartida de candidatos |
| Parametros totales | 1.884 millones (1,884 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens (presupuesto conjunto de estado + pregunta + candidatos; el desbordamiento se rechaza) |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones del autor) |
| Idiomas soportados | Ingles y chino (idiomas evaluados; declarados como `en`, `zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado obligatorio para la inferencia |
| Autor | llm-semantic-router |
| Modelo base | Qwen/Qwen3.5-2B (relacion: finetune) |
| Tipo de tarea | decision-model, classification (no generativa) |
| Tipos de decision | Choice (2-255 acciones), Noul (P(verdadero)), Score (2-10 rubricas ordenadas) |
| Tamano del repositorio | 11,3 GB |
| Fecha de publicacion | 21 de septiembre de 2026 |
| Ultima actualizacion | 21 de septiembre de 2026 |
| Descargas / likes | 0 descargas / 3 likes |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone de texto causal Qwen3.5 que combina atencion lineal con compuerta (gated linear attention) y atencion completa. Sobre ese backbone se monta una cabeza compartida de candidatos que lee los extremos (endpoints) de cada candidato y el vector de consulta final. Cada pregunta se resuelve en una única pasada forward, y las preguntas se procesan de forma independiente en lotes de ocho. El modelo incorpora un perfil de normalizacion que se carga automaticamente con los pesos.

El autor lo describe como adaptado de Qwen3.5-2B y presenta la version v1.2 como continuacion de v1.1 (67,39 % de precisión media, frente al 69,80 % de esta). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones adicionales como decodificacion especulativa. La evaluacion publicada cubre 2.720 decisiones repartidas en cuatro paneles (Decisions, Composition, Reading, Inference), cada uno con un cuarto de peso y conservando sus pesos originales de familia o fuente.

## Capacidades

- Decision discriminativa sobre etiquetas definidas en tiempo de ejecucion: devuelve un identificador seleccionado y una distribucion de probabilidad, no texto libre.
- Tipo Choice: enrutado de peticiones o seleccion entre 2 y 255 acciones posibles.
- Tipo Noul: verificacion de una condicion contra la evidencia suministrada, con salida P(verdadero).
- Tipo Score: aplicacion de entre 2 y 10 descripciones de rubrica ordenadas, con indice esperado y distribucion.
- Evaluacion de evidencia aportada en el propio prompt, sin recuperacion en vivo (no hay RAG interno).
- Procesamiento por lotes de ocho preguntas independientes por pasada.
- Capacidad multilingue limitada a los idiomas evaluados: ingles y chino.
- No documentado: tool calling, function calling, soporte de agentes, razonamiento multi-paso explicito, modo thinking, vision, audio o generacion de texto abierta.

## Casos de uso

- Enrutado de peticiones en un enrutador semantico: con el tipo Choice el modelo elige entre 2 y 255 destinos y devuelve la distribucion completa, lo que permite fijar umbrales de confianza y rutas de reserva cuando la probabilidad maxima es baja.
- Aplicacion de rubricas en evaluacion automatica: el tipo Score admite de 2 a 10 descripciones ordenadas y devuelve el indice esperado, lo que sirve como juez reproducible en evaluaciones de calidad de respuestas o de datos.
- Guardarrailes y verificacion de condiciones: el tipo Noul calcula P(verdadero) de una condicion contra la evidencia incluida en el prompt, util para comprobar politicas, requisitos o precondiciones antes de ejecutar una accion.
- Orquestacion de agentes multi-paso: seleccionar la siguiente herramienta o accion definiendo las etiquetas en tiempo de ejecucion, sin reentrenar el modelo cuando cambia el conjunto de acciones.
- Triaje y clasificacion de tickets o incidencias: clasificar por categoria, urgencia o equipo responsable con esquemas de etiquetas que pueden modificarse sin tocar los pesos.
- Enrutado por coste en produccion: decidir, para cada consulta, si se responde con un modelo pequeno, uno grande o una herramienta externa, usando el identificador devuelto y su probabilidad.
- Verificacion de afirmaciones (claim checking) contra evidencia suministrada: comprobar si un texto de contexto respalda una afirmacion concreta mediante P(verdadero).
- Control de calidad y filtrado en pipelines de datos: puntuar pares pregunta-respuesta con una rubrica ordenada y descartar por debajo de un indice esperado.

## Benchmarks y rendimiento

Precision (%) en cuatro paneles, sobre 2.720 decisiones. La negrita marca la puntuacion mas alta de cada columna.

| Modelo | Media | Decisions | Composition | Reading | Inference |
|---|---:|---:|---:|---:|---:|
| Jev · 1.13.0 | **82,45** | **79,10** | **66,38** | **94,53** | **89,79** |
| Decider · 2B | 71,75 | 64,01 | 46,58 | 92,03 | 84,38 |
| Qwen3.5 · 4B · untuned | 70,25 | 69,89 | 43,33 | 87,97 | 79,79 |
| Sol · v1.2 · esta publicacion | 69,80 | 73,64 | 46,92 | 75,31 | 83,33 |
| Sol · v1.1 · anterior | 67,39 | 73,32 | 46,96 | 73,44 | 75,83 |
| Qwen3.5 · 2B · untuned | 60,54 | 57,12 | 39,00 | 73,75 | 72,29 |
| Laya · Upstream default | 52,44 | 57,01 | 37,75 | 51,25 | 63,75 |

No se publican cifras de latencia o throughput en la informacion disponible: el autor remite a graficas propias (QUESTION-SCALING.md) medidas en una GPU AMD gfx942, con 30 peticiones medidas por punto en tres bloques, excluyendo carga de modelo y red.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia derivada del numero de parametros, los pesos ocuparian aproximadamente 7,5 GB en FP32 y 3,8 GB en FP16, sin contar cache KV, cabeza de candidatos ni overhead del runtime.
- Cuantizaciones: no hay variantes publicadas, por lo que no puede confirmarse que existan rutas INT8 o INT4 para reducir esa huella.
- GPU validada: AMD gfx942 mediante ROCm es la unica plataforma validada por el autor.
- CPU y MPS: sin soporte declarado, no ejecutables en estas plataformas.
- NVIDIA: no cualificada por el autor; no hay validacion publicada en A100, H100 ni RTX 4090.
- GPU de consumo: no hay evidencia de funcionamiento en graficas consumer; el requisito de ROCm y gfx942 lo aleja del uso en RTX o en equipos de sobremesa.
- Despliegue: el autor documenta el paquete Python propio `decision` (clase `DecisionModel`) con `local_files_only=True` y montaje del modelo en `/model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la etiqueta `custom-code` implica que no es cargable con `transformers` estandar sin ese codigo.
- Latencia y throughput: no disponibles en cifras; solo se documenta que las preguntas se ejecutan en lotes de ocho y que una misma pregunta consume una unica pasada forward.
- Recomendacion practica: al cambiar de perfil de normalizacion debe usarse un proceso Python nuevo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision media (4 paneles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-1.0-Sol (esta publicacion) | 1,884 B | 16.384 tokens | 69,80 | Apache 2.0 | HuggingFace, requiere codigo propio |
| Sol v1.1 (predecesor del mismo autor) | No disponible | No disponible | 67,39 | No disponible | Version anterior en el repositorio |
| Jev 1.13.0 | No disponible | No disponible | 82,45 | No disponible | No disponible |
| Decider 2B | 2 B (segun denominacion) | No disponible | 71,75 | No disponible | No disponible |
| Qwen3.5-2B sin ajustar (modelo base) | 2 B | No disponible | 60,54 | No disponible | HuggingFace (Qwen/Qwen3.5-2B) |
| Qwen3.5-4B sin ajustar | 4 B | No disponible | 70,25 | No disponible | HuggingFace |
| Laya Upstream default | No disponible | No disponible | 52,44 | No disponible | No disponible |

Salvo Qwen3.5-2B, del que consta el identificador, el autor no publica parametros, contexto ni licencia de los modelos comparados, por lo que la comparacion se limita a la precision media y al desglose por paneles.

## Limitaciones y advertencias

- El modelo evalua unicamente la evidencia suministrada en el prompt; no realiza recuperacion en vivo, de modo que su precision depende por completo de la calidad del contexto aportado.
- El propio autor advierte de que la confianza devuelta no garantiza la correccion de la decision: la distribucion de probabilidad no debe interpretarse como certeza.
- El estado, la pregunta y todos los candidatos deben caber en 16.384 tokens; si se supera ese presupuesto, la peticion se rechaza en lugar de truncarse.
- No soporta CPU ni MPS y solo esta validado en AMD gfx942; NVIDIA queda explicitamente sin cualificar, lo que limita el despliegue en infraestructura convencional.
- Requiere codigo personalizado (`decision`) para cargarse; no es compatible con flujos estandar de `transformers` sin ese paquete.
- No se publican cuantizaciones, por lo que el consumo de VRAM en FP32 o FP16 puede ser un cuello de botella en entornos con memoria limitada.
- Idiomas evaluados limitados a ingles y chino: no hay evidencia de rendimiento en castellano ni en otros idiomas.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni procesos de alineacion, lo que dificulta auditar comportamientos indeseados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B y las dependencias de codigo deben verificarse por separado antes de un despliegue en produccion.
- El repositorio registra 0 descargas y 3 likes en el momento de la consulta, por lo que la validacion por parte de terceros es practicamente inexistente.
- El autor recomienda usar un proceso Python nuevo al cambiar de perfil de normalizacion, un detalle operativo facil de pasar por alto en servicios de larga duracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Decision-1.0-Sol
- Coleccion de la familia Decision: https://huggingface.co/collections/llm-semantic-router/decision-10-6ab12177bd0002394d8409f9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentacion incluida en el repositorio (rutas relativas a la raiz del modelo): `EVALUATION.md` (metodos, incertidumbre y resultados por tarea), `QUESTION-SCALING.md` (latencia p95 y los tres tipos nativos), `RUNTIME.md` (configuracion de ROCm), `USAGE.md` (instalacion y guia de API), `model-card-example.json` (peticion y salida de ejemplo), `LICENSE`, `ATTRIBUTIONS.md`, `code/decision_model.py` (codigo de inferencia) y los recursos graficos en `assets/`.
- Resultados de busqueda web: no se ha encontrado ningun enlace especifico sobre este modelo. Las busquedas devuelven articulos genericos sobre modelos de lenguaje (guias introductorias y clasificaciones generales de LLM) sin relacion con Decision-1.0-Sol, por lo que no se incluyen como fuentes.
