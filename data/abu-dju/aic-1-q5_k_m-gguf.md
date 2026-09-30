# Abu-Dju/AIC-1-Q5_K_M-GGUF

## Resumen

AIC-1-Q5_K_M-GGUF es una conversión al formato GGUF del modelo Applied-Innovation-Center/AIC-1, un modelo de lenguaje de 32.763.876.352 parámetros (unos 32,8 mil millones, según los metadatos de safetensors del modelo base). La cuantización la publica el usuario Abu-Dju en Hugging Face utilizando llama.cpp a través del space GGUF-my-repo de ggml.ai, y se distribuye como un único fichero `aic-1-q5_k_m.gguf` en un repositorio de 23,3 GB. El modelo original lo desarrolla Applied-Innovation-Center, que es también quien define la licencia Apache 2.0 bajo la que se redistribuye esta cuantización.

El interés de esta ficha es fundamentalmente práctico: se trata de un modelo denso de aproximadamente 33.000 millones de parámetros, bilingüe en árabe e inglés, empaquetado para inferencia local con llama.cpp y compatible con el ecosistema GGUF (Ollama, LM Studio, llama-server). Con alrededor de 23 GB de pesos, es un candidato claro para ejecutarse en una GPU de 24 GB o en configuraciones híbridas CPU+GPU, sin necesidad de clústeres de GPUs de centro de datos.

Ahora bien, la información pública disponible es muy escasa: no se documenta la arquitectura interna del modelo base, la composición del dataset de entrenamiento, la ventana de contexto máxima, el proceso de alineación ni resultados de benchmarks. Cualquier evaluación seria de este modelo para producción debería partir de una validación empírica propia, porque los datos técnicos publicados no permiten anticipar su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la información proporcionada no describe la arquitectura del modelo base Applied-Innovation-Center/AIC-1) |
| Parámetros totales | 32.763.876.352 (aproximadamente 32,8 mil millones), según los metadatos de safetensors del modelo base |
| Parámetros activos | no disponible (no se indica que el modelo sea de arquitectura MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso del autor emplea `-c 2048`, que es una configuración del servidor llama.cpp, no la ventana máxima del modelo) |
| Tipos de cuantización | Q5_K_M (~5,5 bits por peso) en formato GGUF; este repositorio solo contiene esa cuantización |
| Idiomas soportados | árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `aic-1-q5_k_m.gguf`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base Applied-Innovation-Center/AIC-1 en los materiales disponibles. Se sabe que el repositorio aquí descrito no es un modelo entrenado, sino una conversión de formato: los pesos originales se han transformado a GGUF mediante llama.cpp y el space GGUF-my-repo de ggml.ai, aplicando la cuantización Q5_K_M. El tamaño de los parámetros (32,8 mil millones) y el hecho de que la ficha no mencione mezcla de expertos apuntan a un transformer denso, pero esto no está confirmado por la documentación disponible.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del corpus (más allá de la orientación bilingüe árabe-inglés que sugieren las etiquetas de idioma), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. No se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, arquitecturas híbridas SSM, etc.) ni se especifica la plantilla de chat o el formato de prompt recomendado, algo crítico para reproducir resultados.

## Capacidades

- Generación de texto en árabe e inglés, según las etiquetas de idioma declaradas por el autor (`ar`, `en`).
- Inferencia local mediante llama.cpp: el repositorio incluye instrucciones para `llama-cli` y `llama-server`, además de las etiquetas `llama-cpp` y `endpoints_compatible`.
- Compatibilidad con text-generation-inference a nivel de etiquetado, aunque el formato GGUF no es el nativo de ese servidor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de visión, audio o multimodalidad: no disponibles en la información proporcionada.
- Capacidades de código y matemáticas: no documentadas; deben validarse empíricamente.

## Casos de uso

- Atención al cliente bilingüe árabe-inglés: el modelo declara soporte para ambos idiomas y puede desplegarse con `llama-server` para gestionar conversaciones multi-turno. La longitud de contexto real debe medirse antes de dimensionar el servicio, ya que no está documentada.
- Despliegue on-premise con requisitos de confidencialidad: al distribuirse en GGUF y ejecutarse con llama.cpp, los datos de inferencia no salen de la infraestructura propia, lo que encaja en sectores regulados que no pueden enviar contenido a APIs externas.
- Asistente integrado en aplicaciones de escritorio: un modelo de 32,8 mil millones de parámetros en Q5_K_M (~23 GB) cabe en estaciones de trabajo con una GPU de 24 GB, y puede integrarse vía Ollama o LM Studio para funciones de redacción, resumen y reescritura.
- Traducción y adaptación de contenido árabe-inglés: el bilingüismo declarado lo hace candidato para pipelines de traducción o localización, aunque la calidad debe evaluarse con corpus propios antes de usarlo en producción.
- Prototipado e investigación académica: sirve como línea base de ~33B en experimentos de prompting, evaluación de cuantizaciones o comparativas de eficiencia, gracias a su licencia Apache 2.0 y a su despliegue sencillo en una sola GPU.
- Ajuste fino posterior sobre el modelo base AIC-1: cuando se necesita adaptar el comportamiento a un dominio concreto, tiene más sentido entrenar LoRA o ajuste completo sobre los pesos en safetensors del modelo original y volver a cuantizar después a GGUF.
- Procesamiento por lotes de documentos internos: con `llama-cli` o el servidor HTTP se pueden lanzar tareas de clasificación, extracción o resumen sobre corpus en árabe o inglés en infraestructura propia, siempre que la ventana de contexto resultante sea suficiente.
- Evaluación comparativa interna de modelos: dado que el repositorio es una cuantización reproducible con llama.cpp, resulta útil como punto de comparación frente a otros modelos de tamaño similar en pruebas de latencia, uso de VRAM y calidad percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones multilingües para AIC-1 ni para esta cuantización. Tampoco se documenta el impacto de la cuantización Q5_K_M frente a los pesos originales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 23 GB (el repositorio completo pesa 23,3 GB, coherente con ~5,5 bits por peso sobre 32,8 mil millones de parámetros). Hay que añadir el caché KV y los búferes de cómputo, cuyo tamaño depende de la arquitectura y la ventana configurada, no documentadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB o V100 32 GB para trabajar con contexto amplio y margen suficiente. La RTX 5090 (32 GB) también es una opción de gama alta para escritorio.
- GPU de consumo: sí, cabe completo en GPUs de 24 GB (RTX 3090, RTX 4090) solo con contexto reducido, ya que los pesos consumen prácticamente toda la VRAM. En GPUs de 16 GB o menos no cabe sin recurrir a una cuantización inferior (por ejemplo Q4_K_M, estimada en torno a 19-20 GB), que no está incluida en este repositorio.
- Configuraciones híbridas CPU+GPU: llama.cpp permite descargar capas a RAM del sistema; conviene disponer de 32 GB de RAM libres o más para mantener una latencia aceptable.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y cualquier front-end compatible con GGUF. Los servidores vLLM o TGI no son la vía natural para este formato, pese a las etiquetas `text-generation-inference` y `endpoints_compatible` del repositorio.
- Latencia y throughput: no disponibles. Dependerán en gran medida de la GPU, del número de capas descargadas a CPU y de la longitud de contexto configurada.

## Comparativa con modelos similares

La comparación es necesariamente parcial: de AIC-1 solo se conocen el recuento de parámetros y la licencia. Los datos de los modelos alternativos que figuran a continuación proceden de sus fichas públicas y deben verificarse antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| AIC-1 (Q5_K_M, esta ficha) | 32,8B | no disponible | ar, en | Apache 2.0 | sí (este repositorio) |
| Qwen2.5-32B | 32,5B | 32.768 nativo, ampliable a 131.072 con YaRN | multilingüe (decenas de idiomas, incluido español) | Apache 2.0 (las variantes de 3B y 72B tienen condiciones propias) | sí, ampliamente disponible |
| Gemma 2 27B | 27,2B | 8.192 | principalmente inglés, con soporte multilingüe limitado | licencia Gemma (con condiciones de uso, no Apache 2.0) | sí, ampliamente disponible |

No hay datos de benchmarks que permitan comparar el rendimiento real de AIC-1 frente a estos modelos. La diferencia más relevante en términos prácticos es el idioma: AIC-1 declara árabe e inglés, mientras que Qwen2.5-32B cubre un conjunto mucho más amplio de idiomas, incluido el español. En cuanto a despliegue, los tres caben en configuraciones de 24-48 GB con cuantizaciones de 5 bits similares.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe ninguna medición pública de calidad, razonamiento, código, matemáticas ni multilingüismo para AIC-1 ni para esta cuantización.
- Documentación mínima: se desconoce la arquitectura, la ventana de contexto máxima, la plantilla de chat, los datos de entrenamiento y el proceso de alineación. Esto dificulta reproducir resultados y ajustar correctamente los prompts.
- Riesgo de alucinación: inherente a los modelos generativos; al no haber evaluaciones publicadas, no puede acotarse su magnitud en este caso.
- Idiomas limitados: solo se declaran árabe e inglés. El rendimiento en castellano no está garantizado y previsiblemente será inferior al de modelos con cobertura multilingüe explícita.
- Sesgos: no evaluados. Un corpus centrado en árabe e inglés puede arrastrar sesgos culturales, geográficos y de representación que no han sido auditados.
- Pérdida por cuantización: Q5_K_M introduce un error de cuantización respecto a los pesos originales en precisión completa, con impacto típicamente mayor en tareas de razonamiento matemático y generación de código que en conversación general.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos con los que se entrenó antes de un despliegue en producción.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes, y fue actualizado el mismo día de su creación (29 de septiembre de 2026). No hay señales de mantenimiento, corrección de errores ni soporte por parte del autor.
- Contexto de ejemplo reducido: las instrucciones oficiales del repositorio lanzan `llama-server` con `-c 2048`. Si la ventana real del modelo es mayor, habrá que configurarla explícitamente y comprobar el consumo de VRAM.
- Dependencia de terceros: el funcionamiento depende del ecosistema llama.cpp y de las versiones de sus binarios; no se documentan versiones mínimas compatibles.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Abu-Dju/AIC-1-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/Applied-Innovation-Center/AIC-1
- Space GGUF-my-repo (ggml.ai), utilizado para la conversión: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado en la búsqueda web otros enlaces relevantes sobre AIC-1. Los resultados obtenidos corresponden a otros repositorios del mismo autor (Leanstral-1.5-119B-A6B-GGUF y translategemma-12b-it-Q5_K_M-GGUF), a directorios genéricos de modelos GGUF (local-ai-zone.github.io, ggufloader.github.io) y al laboratorio Empero (empero.org), ninguno de ellos relacionado con el modelo descrito en esta ficha.
