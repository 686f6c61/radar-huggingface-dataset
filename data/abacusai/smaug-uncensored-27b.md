# abacusai/Smaug-Uncensored-27b

## Resumen

Smaug-Uncensored-27b es un ajuste fino (finetune) del modelo Qwen3.8-27B desarrollado por Abacus.AI. El objetivo declarado es eliminar los rechazos (refusals) del modelo base: responde a peticiones benignas que solo parecen arriesgadas, a satira y critica de gobiernos y figuras publicas, a preguntas sobre temas politicamente censurados y a solicitudes que el modelo base clasifica como daninas. Segun la model card, con el modo thinking activado (el predeterminado), la tasa de rechazo ante peticiones daninas cae del 90,2 % al 8,1 %, y los rechazos de prompts benignos pero aparentemente arriesgados bajan del 45,2 % al 2,3 % en OR-Bench-Hard.

Arquitectonicamente es un transformer denso con atencion hibrida (48 capas de atencion lineal con compuertas y 16 de atencion completa con GQA, en intercalado 3:1) mas una torre de vision ViT de 27 capas, con 27.781.427.952 parametros totales, vocabulario de ~248K tokens y una longitud de contexto de 262.144 tokens. Conserva intacta la interfaz de thinking y el head de Multi-Token Prediction heredados del modelo base.

Es relevante para quienes necesitan un modelo multimodal de 27B con contexto muy largo y comportamiento menos restrictivo que el modelo original, manteniendo (segun el autor) capacidad general comparable: NL2Repo-Bench 46,3 frente a 42,3, JobBench 50,3 frente a 33,4, GPQA Diamond 89,4 frente a 89,2 e IFBench 79,0 frente a 79,5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (lineal con compuertas + completa con GQA) y torre de vision ViT de 27 capas, patch 16 |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y conserva su arquitectura `Qwen3_5ForConditionalGeneration`: 64 capas en total (48 de atencion lineal con compuertas y 16 de atencion completa, intercaladas en proporcion 3:1), dimension oculta de 5120, 24 cabezas de atencion con 4 cabezas KV (GQA), vocabulario de ~248K tokens y torre de vision de 27 capas sin modificar. Incluye un head de Multi-Token Prediction de 1 capa heredado del base, con una tasa de aceptacion de borrador del 62,2 % (frente al 57,9 % del base). Los pesos se cargan exactamente igual que la release oficial: mismo layout, misma interfaz de thinking y misma ventana de 262.144 tokens.

La adaptacion consiste en una optimizacion de preferencias (DPO con un termino NLL) sobre el tronco de lenguaje, aplicada mediante un LoRA fusionado a fuerza 1,5x como delta completo; la torre de vision queda intacta. La model card no desvela el contenido del dataset de entrenamiento. Se declara entrenamiento en bfloat16.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto.
- Comprension de imagen y texto (pipeline image-text-to-text), con la torre de vision original intacta.
- Generacion de codigo y tareas de ingenieria de software (evaluado en NL2Repo-Bench).
- Razonamiento cientifico de nivel experto (GPQA Diamond).
- Seguimiento de instrucciones (IFBench) y tareas agenticas (JobBench).
- Soporte de contexto muy largo: hasta 262.144 tokens.
- Capacidades multilingues limitadas a ingles y chino.
- Comportamiento menos restrictivo: responde a satira, critica politica y preguntas sobre temas censurados, y reduce drasticamente los rechazos tanto de prompts benignos arriesgados como de peticiones daninas.
- Decodificacion especulativa mediante el head MTP heredado (62,2 % de aceptacion de borrador).

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto puede procesar contratos, informes o bases de codigo completas en una sola pasada, resumiendo y extrayendo informacion sin trocear el material.
- Revision de codigo y generacion en pipelines: su rendimiento en NL2Repo-Bench (46,3) y el soporte de contexto largo permiten integrarlo en flujos de CI/CD para revision de diffs grandes o generacion de repositorios completos.
- Investigacion y analisis de contenido sensible: al no rechazar sistematicamente temas politicamente censurados, es util para estudiar discursos, satira o propaganda comparando respuestas factuales (la model card reporta un aumento del 44,9 % al 90,3 % en preguntas censuradas respondidas de forma factual).
- Asistentes de analisis de imagenes y documentos: al conservar la torre de vision, puede describir capturas, diagramas o graficos y combinarlos con texto en el mismo contexto.
- Evaluacion de robustez y red-teaming: sirve como referencia de modelo con rechazos minimizados para medir clasificadores de seguridad, estudiar comportamientos de modelos y comparar con el base.
- Razonamiento cientifico asistido: con GPQA Diamond de 89,4 puede apoyar tareas de nivel posgrado en fisica, quimica y biologia dentro de un asistente de investigacion.
- Automatizacion agentica de tareas profesionales: JobBench de 50,3 frente a 33,4 del base sugiere mejor desempeno en flujos de varios pasos con herramientas.

## Benchmarks y rendimiento

Datos publicados en la model card (modo thinking activado), comparados con el modelo base Qwen3.8-27B:

| Benchmark | Smaug-Uncensored-27b | Qwen3.8-27B (base) |
|---|---|---|
| Rechazos en 15 categorias daninas (CatQA, AIR-Bench, HarmBench, JBB; proporcion rechazada) | 8,1 % (66/819) | 90,2 % (745/826) |
| Rechazos de prompts benignos arriesgados (OR-Bench-Hard) | 2,3 % | 45,2 % |
| Rechazos de prompts seguros (XSTest) | 1,2 % | 6,0 % |
| Preguntas censuradas respondidas de forma factual | 90,3 % | 44,9 % |
| NL2Repo-Bench | 46,3 | 42,3 |
| JobBench | 50,3 | 33,4 |
| GPQA Diamond | 89,4 | 89,2 |
| IFBench | 79,0 | 79,5 |
| Aceptacion de borrador MTP | 62,2 % | 57,9 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB solo para pesos (el tamano del repo es de 55,6 GB), mas overhead de KV cache; en la practica requiere 64 GB o mas de memoria de GPU para contexto moderado.
- Cuantizacion: la model card no publica pesos cuantizados, pero al ser un transformer denso de 27B es compatible con cuantizacion estandar (por ejemplo, 4 bits reduciria los pesos a unos 14-16 GB). No hay confirmacion oficial de soporte.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bfloat16; para cuantizacion agresiva podria caber en una RTX 4090 (24 GB) o RTX 3090, aunque sin datos oficiales de calidad tras cuantizar.
- Opciones de despliegue: transformers (libreria declarada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Inference Endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El head MTP con 62,2 % de aceptacion de borrador puede acelerar la decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Smaug-Uncensored-27b | 27B (denso) | 262.144 | Apache 2.0 | Finetune DPO del base con rechazos eliminados; multimodal |
| Qwen3.8-27B (base) | 27B (denso) | 262.144 | no disponible en la informacion | Modelo original; rechaza mucho mas (90,2 % en categorias daninas) |
| Alternativas de 27B con contexto comparable | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la informacion proporcionada |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion facilitada.

## Limitaciones y advertencias

- El modelo esta disenado explicitamente para reducir rechazos, incluidos los de peticiones que el base considera daninas (8,1 % de rechazo frente a 90,2 %). Esto implica un riesgo alto de generar contenido danino, y su uso en produccion exige capas de moderacion externas.
- Riesgo de alucinacion: no se publican evaluaciones de factualidad mas alla de las preguntas censuradas; como todo modelo de lenguaje, puede inventar datos.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta evaluado.
- Dataset de entrenamiento no divulgado: imposibilita auditar sesgos o procedencia de los datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones que regulan contenido.
- La tecnica de fusion del LoRA a 1,5x es poco convencional y puede introducir inestabilidades no documentadas fuera de los benchmarks reportados.
- No hay pesos cuantizados oficiales ni confirmacion de soporte en frameworks de inferencia de alto rendimiento (vLLM, TGI), lo que complica el despliegue a escala.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-Uncensored-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina de Abacus.AI: https://abacus.ai
- Organizacion en Hugging Face: https://huggingface.co/abacusai
- Licencia: https://huggingface.co/abacusai/Smaug-Uncensored-27b/blob/main/LICENSE
