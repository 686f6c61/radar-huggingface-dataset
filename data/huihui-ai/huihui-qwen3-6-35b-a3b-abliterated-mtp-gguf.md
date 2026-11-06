# huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF es una version "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.6-35B-A3B, publicada por huihui-ai. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales, disenado para tareas multimodales de imagen-texto a texto (pipeline image-text-to-text). La version que nos ocupa se distribuye en formato GGUF, lo que permite su ejecucion en llama.cpp con cuantizacion, y anade soporte para decodificacion especulativa MTP (Multi-Token Prediction).

El proposito principal de esta variante es eliminar los rechazos de seguridad del modelo original mediante una tecnica de abliteracion, un proceso que identifica y suprime las direcciones de activacion asociadas a comportamientos de negativa. El autor la describe explicitamente como una implementacion "cruda" y de prueba de concepto, sin las garantias de seguridad del modelo original. Esto la hace relevante para investigadores que necesitan estudiar el comportamiento de modelos sin filtros, o para entornos controlados donde se requiere una respuesta sin restricciones tematicas.

La relevancia actual del modelo radica en su combinacion de tres factores: un tamano considerable (35B parametros totales en arquitectura MoE), soporte multimodal, y una distribucion en GGUF optimizada para inferencia local con decodificacion especulativa. Con 2.279.692 descargas y 70 likes, es una de las variantes abliterated mas populares del ecosistema. La licencia es Apache 2.0, heredada del modelo base Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de uso del autor con `-c 262144`) |
| Tipos de cuantizacion | GGUF (el autor menciona Q4_K en el ejemplo; el repositorio incluye multiples variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 216,4 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.6-35B-A3B emplea una arquitectura de transformer con Mixture of Experts, con 35.505.251.456 parametros totales. El sufijo "A3B" en el nombre sugiere aproximadamente 3 mil millones de parametros activos por token, aunque este dato no se confirma explicitamente en la informacion disponible. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada (imagen y texto).

La variante aqui descrita aplica abliteracion, una tecnica que suprime las direcciones de activacion responsables de los rechazos en el modelo original. El autor referencia la implementacion remove-refusals-with-transformers de Sumandora, que realiza este proceso sin usar TransformerLens. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base. La innovacion tecnica destacable de esta variante GGUF es la integracion de decodificacion especulativa MTP (Multi-Token Prediction), que permite al modelo predecir varios tokens por paso y acelerar la inferencia, configurable mediante `--spec-type draft-mtp --spec-draft-n-max 6` en llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte para contextos de hasta 262.144 tokens.
- Procesamiento multimodal imagen-texto a texto (pipeline image-text-to-text), lo que permite entrada de imagenes junto con prompts de texto.
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.6.
- Decodificacion especulativa MTP para acelerar la generacion token a token.
- Capacidades multilingues: no se especifican los idiomas concretos en la informacion disponible.
- Ausencia de mecanismos de rechazo (abliterated): el modelo no aplica filtros de negativa ante solicitudes que el modelo original rechazaria.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion en infraestructuras de servicio tipo API.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque es esperable en la familia Qwen3.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando sus respuestas con las del modelo original para analizar que direcciones de activacion estan asociadas a los rechazos y como afecta la abliteracion a la calidad general.
- Generacion creativa sin restricciones tematicas: escritores e investigadores pueden emplear el modelo para explorar narrativas, dialogos o escenarios que el modelo original rechazaria por politicas de contenido, en entornos controlados y con revision humana.
- Analisis de contenido sensible en entornos de investigacion: equipos que estudian discursos de odio, desinformacion o contenido extremista pueden usar el modelo para generar y analizar muestras, siempre con las salvaguardas eticas y legales correspondientes.
- Procesamiento multimodal local: gracias al formato GGUF y al soporte image-text-to-text, el modelo puede desplegarse en estaciones de trabajo con GPU consumer para tareas de descripcion de imagenes, extraccion de informacion de documentos escaneados o analisis visual, sin depender de servicios en la nube.
- Despliegue en llama.cpp con contexto largo: el ejemplo del autor con `-c 262144` y `-ngl 99` demuestra que el modelo puede ejecutarse con 262.144 tokens de contexto en llama.cpp, adecuado para analisis de documentos extensos, revision de codigo en repositorios grandes o conversaciones de larga duracion.
- Aceleracion de inferencia con MTP: la decodificacion especulativa MTP permite servir el modelo con mayor throughput en llama-server (`--spec-type draft-mtp --spec-draft-n-max 6`), lo que lo hace viable para prototipos de aplicaciones conversacionales que requieren baja latencia.
- Pruebas de concepto en pipelines de CI/CD: la compatibilidad con endpoints y el formato GGUF permiten integrar el modelo en flujos automatizados de generacion de codigo o revision de textos, aunque el autor recomienda limitar su uso a entornos de investigacion y pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 216,4 GB en total, pero cada cuantizacion individual es mucho menor. Para la variante Q4_K mencionada por el autor, se estima un uso de VRAM de aproximadamente 20-22 GB (35,5B parametros a ~4,5 bits por peso), aunque no se proporciona una cifra oficial.
- GPU recomendadas: para Q4_K, una RTX 4090 (24 GB) o RTX 3090 (24 GB) serian suficientes para cargar el modelo completo en GPU. Para cuantizaciones mayores (Q6_K, Q8_0), se requeririan GPUs profesionales como A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU consumer: si, en GPUs con 24 GB de VRAM o mas (RTX 3090, RTX 4090) usando cuantizaciones Q4_K o inferiores. Con cuantizaciones mas bajas (Q3_K, Q2_K) cabria en GPUs de 16 GB, con perdida de calidad.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), con soporte de decodificacion especulativa MTP. El autor indica usar la version mas reciente de ggml-org/llama.cpp. Tambien es compatible con endpoints (tag endpoints_compatible) y con la libreria transformers.
- Latencia y throughput estimados: no disponibles. La decodificacion especulativa MTP (`--spec-draft-n-max 6`) esta disenada para mejorar el throughput, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF | 35,5B (MoE) | 262.144 | Apache 2.0 | GGUF | Abliterated, MTP, multimodal |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,5B (MoE) | no disponible | Apache 2.0 | safetensors | Con filtros de seguridad, multimodal |
| Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | no disponible | no disponible | Abliterated, sin MTP ni GGUF en el nombre |
| Otros modelos abliterated de huihui-ai (phi4, gemma3n, etc.) | variable | variable | variable | variable | Familia de variantes sin rechazos |

La comparativa se limita a los datos disponibles. No se dispone de informacion sobre benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el filtrado de seguridad se ha reducido significativamente, lo que puede generar contenido sensible, controvertido o inapropiado.
- No es adecuado para todas las audiencias: las salidas pueden ser inapropiadas para entornos publicos, usuarios menores de edad o aplicaciones que requieran alta seguridad.
- El usuario es el unico responsable del cumplimiento legal y etico de su uso; el contenido generado puede conllevar riesgos legales o eticos.
- El autor recomienda su uso exclusivo en investigacion, pruebas o entornos controlados, evitando su uso directo en produccion o en aplicaciones comerciales de cara al publico.
- Se recomienda monitorizar las salidas en tiempo real y realizar revisiones manuales para evitar la difusion de contenido inapropiado.
- No hay garantias de seguridad por defecto: el modelo no ha pasado por optimizaciones de seguridad rigurosas y huihui.ai no asume responsabilidad por las consecuencias de su uso.
- La abliteracion es una tecnica "cruda" y de prueba de concepto, lo que puede degradar capacidades del modelo base en otras tareas (razonamiento, coherencia) de forma no documentada.
- No se dispone de informacion sobre los idiomas soportados ni sobre sesgos conocidos especificos de esta variante.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de lenguaje de esta escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Repositorio de abliteracion (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp (ggml-org): https://github.com/ggml-org/llama.cpp/releases
- Perfil de huihui-ai en Hugging Face: https://huggingface.co/huihui-ai
- Perfil de huihui_ai en Ollama: https://ollama.com/huihui_ai
- Ko-fi del autor: https://ko-fi.com/huihuiai
