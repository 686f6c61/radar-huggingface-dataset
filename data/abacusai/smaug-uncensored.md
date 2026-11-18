# abacusai/Smaug-Uncensored

## Resumen

Smaug-Uncensored es un ajuste fino (finetune) del modelo Qwen3.8-27B desarrollado por Abacus.AI. Se trata de un modelo denso de 27.781 millones de parámetros con arquitectura transformer híbrida de atención (lineal con compuertas y atención completa con GQA) más una torre de visión, diseñado para eliminar los rechazos del modelo base. El objetivo declarado es responder a peticiones benignas que el base rechaza por parecer arriesgadas, así como a sátiras, críticas a gobiernos y figuras públicas, y preguntas sobre temas políticamente censurados, manteniendo intacta la capacidad general del modelo original.

El modelo conserva la interfaz de razonamiento (thinking mode) del base, su ventana de contexto de 262.144 tokens, la torre de visión de 27 capas y el mismo layout de pesos, por lo que se carga exactamente igual que la versión oficial de Qwen. La adaptación se realizó mediante optimización de preferencias (DPO con un término de verosimilitud negativa, NLL) sobre LoRA fusionado a 1,5x de intensidad como delta completo, aplicado únicamente al tronco de lenguaje.

Es relevante ahora porque demuestra que es posible reducir drásticamente las tasas de rechazo (del 45,2% al 2,3% en OR-Bench-Hard con thinking activo) sin degradar de forma apreciable el rendimiento en tareas de razonamiento, código y seguimiento de instrucciones. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque el contenido del dataset de entrenamiento no se ha divulgado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (48 capas de atención lineal + 16 de atención completa, intercaladas 3:1) + torre de visión ViT de 27 capas, patch 16 |
| Parametros totales | 27.781.427.952 (~27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el autor solo indica precisión bfloat16 en los pesos publicados) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Dimension oculta | 5120 |
| Cabezas de atención | 24 cabezas, 4 cabezas KV (GQA) |
| Tamaño de vocabulario | ~248K |
| Precision | bfloat16 |
| Modalidad | Texto e imagen |
| Modelo base | Qwen/Qwen3.8-27B |
| Cabecera MTP | 1 capa (aceptación de borrador del 62,2%, frente al 57,9% del base) |
| Tamaño del repositorio | 55,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso que combina capas de atención lineal con compuertas (gated linear attention) y capas de atención completa con GQA en una proporción 3:1 a lo largo de 64 capas. Incorpora una torre de visión ViT de 27 capas con patch de 16 píxeles, que se mantiene sin cambios respecto al base. También hereda una cabecera de predicción multi-token (MTP) de una capa, lo que permite decodificación especulativa con una tasa de aceptación de borrador del 62,2% (frente al 57,9% del modelo base).

El ajuste se realizó mediante optimización de preferencias con DPO más un término de verosimilitud negativa (NLL), aplicando LoRA fusionado a 1,5x de intensidad como un delta completo sobre el tronco de lenguaje. No se modificó la torre de visión. El autor no divulga la composición ni el volumen del dataset de entrenamiento. El resultado es un modelo que mantiene la interfaz de thinking del base y responde a peticiones que este rechazaba, con mejoras notables en benchmarks de agentes (JobBench 50,3 frente a 33,4) y en preguntas censuradas respondidas de forma factual (90,3% frente a 44,9%).

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, heredado del modelo base.
- Comprensión de imágenes mediante la torre de visión ViT de 27 capas (pipeline image-text-to-text).
- Generación y comprensión de código, incluyendo tareas de tipo NL2Repo (generación de repositorios a partir de lenguaje natural).
- Razonamiento matemático y científico (evaluado en GPQA Diamond con 89,4).
- Seguimiento de instrucciones complejas (IFBench 79,0).
- Capacidades agénticas y de razonamiento multi-paso (evaluado en JobBench).
- Soporte de tool calling y function calling heredado del base (etiqueta agentic en el modelo).
- Multilingüe limitado a inglés y chino.
- Respuesta a peticiones benignas que el base rechaza por parecer arriesgadas, así como a sátira, crítica política y preguntas sobre temas censurados.
- Decodificación especulativa mediante cabecera MTP de una capa.

## Casos de uso

- Moderación y análisis de contenido sensible: el modelo puede evaluar y comentar críticas a gobiernos o figuras públicas sin rechazar la petición, lo que resulta útil en herramientas de análisis editorial y verificación de discurso.
- Generación de sátira y contenido creativo con temática política: al no bloquear críticas institucionales, es adecuado para redacciones satíricas, guiones y columnas de opinión que el base rechazaría.
- Asistencia en investigación sobre temas censurados: permite formular y responder preguntas factuales sobre asuntos políticamente sensibles (90,3% de respuestas factuales frente al 44,9% del base), útil en periodismo de investigación y estudios académicos.
- Atención al cliente automatizada: la ventana de 262.144 tokens permite gestionar conversaciones multi-turno con historiales extensos y documentos adjuntos, incluyendo imágenes, sin perder contexto.
- Generación de código en producción: con NL2Repo-Bench de 46,3 y soporte de tool calling, puede integrarse en pipelines de CI/CD para generar repositorios, parchear código y ejecutar tareas agénticas de desarrollo.
- Agentes autónomos multi-paso: JobBench de 50,3 (frente a 33,4 del base) lo hace adecuado para orquestación de tareas con múltiples herramientas y pasos intermedios.
- Análisis de documentos con imágenes: la torre de visión intacta permite extraer información de capturas, diagramas y documentos escaneados combinados con texto largo.
- Evaluación de seguridad y robustez de modelos: sirve como referencia para estudiar el comportamiento de un modelo con rechazos reducidos en pruebas de alineación y red-teaming.

## Benchmarks y rendimiento

Datos publicados en la model card, con thinking activado por defecto:

| Benchmark | Smaug-Uncensored | Qwen3.8-27B (base) |
|---|---|---|
| OR-Bench-Hard (rechazos de peticiones benignas arriesgadas, menor es mejor) | 2,3% | 45,2% |
| XSTest safe (rechazos de peticiones seguras, menor es mejor) | 1,2% | 6,0% |
| Preguntas censuradas respondidas de forma factual | 90,3% | 44,9% |
| XSTest unsafe (rechazos, mayor es mejor) | 22,0 (44/200) | 97,5 (195/200) |
| NL2Repo-Bench | 46,3 | 42,3 |
| JobBench | 50,3 | 33,4 |
| GPQA Diamond | 89,4 | 89,2 |
| IFBench | 79,0 | 79,5 |
| Aceptación de borrador MTP | 62,2% | 57,9% |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 28 GB; en 4 bits, alrededor de 14-16 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 con contexto completo; A100 40 GB o L40S para cuantización de 8 bits.
- GPU de consumo: una RTX 4090 (24 GB) solo podría alojar el modelo en cuantización de 4 bits con contexto reducido; no cabe en bfloat16 en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (formato nativo), vLLM, TGI y llama.cpp/Ollama mediante conversión a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles. La cabecera MTP con 62,2% de aceptación de borrador puede mejorar el throughput en decodificación especulativa, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Smaug-Uncensored | ~27B (denso) | 262.144 | Apache 2.0 | Finetune DPO de Qwen3.8-27B con rechazos reducidos; visión intacta; solo en/zh |
| Qwen3.8-27B (base) | ~27B (denso) | 262.144 | Apache 2.0 | Modelo original; rechazos mucho más altos (45,2% en OR-Bench-Hard); referencia directa |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables en la información disponible |

## Limitaciones y advertencias

- La reducción de rechazos es deliberada: el modelo responde a peticiones que el base considera dañinas (XSTest unsafe baja del 97,5% al 22,0% de rechazos), lo que implica un riesgo real de generar contenido dañino si no se aplican salvaguardas externas.
- No se divulga el contenido ni el volumen del dataset de entrenamiento, lo que dificulta auditar sesgos introducidos por el ajuste.
- Riesgo de alucinación inherente al modelo base, no mitigado específicamente por este finetune.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue sin moderación adicional puede exponer al operador a responsabilidad por contenido generado.
- El ajuste se aplicó solo al tronco de lenguaje; la torre de visión no fue adaptada, por lo que el comportamiento multimodal es el del base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente de los resultados declarados.
- No se proporcionan pesos cuantizados oficiales; la conversión a GGUF o AWQ corre a cargo del usuario.
- El uso del modo thinking por defecto incrementa el coste de inferencia en tokens generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-Uncensored
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de Abacus.AI: https://abacus.ai
- Perfil de Abacus.AI en Hugging Face: https://huggingface.co/abacusai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
