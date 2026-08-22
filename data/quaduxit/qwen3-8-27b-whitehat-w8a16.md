# QuaduxIT/Qwen3.8-27B-Whitehat-W8A16

## Resumen

QuaduxIT/Qwen3.8-27B-Whitehat-W8A16 es una cuantización INT8 weight-only (W8A16) del fine-tune especializado en seguridad ofensiva QuaduxIT/Qwen3.8-27B-Whitehat, desarrollado por Quadux IT GmbH. El modelo base original es Qwen3.8-27B de Alibaba, un transformer denso híbrido de 27.000 millones de parámetros con atención lineal en 48 de sus 64 capas y una ventana de contexto nativa de 262.144 tokens. Esta versión W8A16 reduce los pesos a INT8 manteniendo activaciones en FP16, lo que permite ejecutar el modelo en GPUs NVIDIA con menos VRAM (~27 GB en lugar de ~52 GB) sin pérdida significativa de calidad.

El modelo está diseñado específicamente para profesionales de seguridad informática autorizada: red teaming, evaluación de vulnerabilidades, desarrollo de exploits, ingeniería inversa y análisis de malware. A diferencia de los modelos comerciales que rechazan gran parte de estas tareas, este fine-tune responde a todas las peticiones ofensivas y defensivas dentro del dominio de la seguridad, pero mantiene rechazos firmes ante contenido que implique daño físico real (armas, explosivos, drogas, agentes químicos/biológicos) y material de abuso sexual infantil, tanto en texto como en imágenes y en todos los idiomas. Es un modelo multimodal (texto e imagen) con soporte de function calling, pensado para despliegue local y privado en infraestructura propia.

La cuantización W8A16 utiliza kernels Marlin, que solo funcionan en CUDA (Ampere o superior). Para entornos CPU o no-CUDA, Quadux ofrece una versión GGUF separada. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Qwen3.8-27B): 64 capas, 16 con atención completa y 48 con atención lineal recurrente, más MTP (Multi-Token Prediction) |
| Parametros totales | 8.756.075.292 (según safetensors; el nombre del modelo indica 27B, discrepancia no aclarada por el autor) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | INT8 weight-only (W8A16) con kernels Marlin; también disponibles FP8 W8A8, NVFP4 y GGUF en otros repositorios de la misma familia |
| Idiomas soportados | Inglés, alemán y multilingüe (según model card; el base Qwen3.8-27B soporta más de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, formato Marlin) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: solo 16 de sus 64 capas utilizan atención completa (con un intervalo de atención completa de 4), mientras que las otras 48 capas usan atención lineal con un estado recurrente constante. Esto reduce el coste computacional en contextos largos manteniendo la calidad en tareas de razonamiento. El modelo incluye además un módulo MTP (Multi-Token Prediction) que acelera la decodificación especulativa.

Quadux IT tomó este base y lo fine-tuneó específicamente para el dominio de la seguridad informática, ajustando los pesos para que el modelo responda a tareas ofensivas y defensivas autorizadas (explotación, malware, ingeniería inversa, análisis de licencias/DRM) sin necesidad de system prompt, ya que el comportamiento está incrustado en los pesos. El fine-tune mantiene los rechazos de seguridad física y CSAM. La cuantización W8A16 se aplicó solo a las capas lineales del modelo de lenguaje; la torre de visión permanece en FP16. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens usados o si se emplearon técnicas de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento en tareas de seguridad informática: análisis de código, explicación de vulnerabilidades, diseño de exploits, escritura de malware y herramientas de pentesting.
- Soporte multimodal: acepta imágenes y capturas de pantalla como entrada, útil para analizar interfaces, diagramas de red o código fotografiado.
- Function calling / tool calling: puede integrarse en pipelines que requieran invocar herramientas externas (escáneres, scripts, APIs).
- Capacidad de agente y razonamiento multi-paso: gracias a su ventana de contexto de 262K tokens, puede mantener conversaciones largas y seguir cadenas de razonamiento complejas.
- Multilingüe: el base soporta más de 100 idiomas; la model card confirma inglés, alemán y multilingüe.
- Rechazo selectivo: se niega a generar contenido de daño físico (armas, explosivos, drogas, agentes químicos/biológicos) y CSAM, tanto en texto como en imagen y en todos los idiomas.
- Sin necesidad de system prompt: el comportamiento de seguridad está en los pesos, simplificando el despliegue.

## Casos de uso

- Red teaming interno: el modelo puede generar vectores de ataque, escribir scripts de explotación y proponer cadenas de compromiso para sistemas propios o con permiso explícito, acelerando las pruebas de penetración.
- Evaluación de vulnerabilidades: dado un fragmento de código o una configuración de red, el modelo identifica posibles fallos y sugiere parches, gracias a su capacidad de razonamiento multi-paso y contexto largo.
- Desarrollo de malware para investigación: en entornos aislados y autorizados, el modelo puede escribir keyloggers, C2 beacons o ransomware de prueba para estudiar su comportamiento y desarrollar defensas.
- Ingeniería inversa: el modelo ayuda a analizar binarios, desensamblar código y comprender protocolos propietarios, con soporte de entrada de imágenes para capturas de herramientas de análisis.
- Análisis de licencias y DRM: puede investigar mecanismos de protección de software y proponer métodos de elusión en el contexto de investigación de seguridad, manteniendo el trabajo en local.
- Formación y concienciación en seguridad: el modelo genera escenarios de ataque realistas y ejercicios de phishing simulado para entrenar a equipos de defensa, sin exponer datos sensibles a servicios externos.
- Asistente de defensa: ayuda a redactar reglas de detección (YARA, Sigma), analizar logs y correlacionar indicadores de compromiso, todo en un entorno privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos de seguridad ofensiva. Se indica que la cuantización W8A16 es "near-lossless" respecto al modelo BF16 de referencia, pero no se aportan cifras concretas de degradación.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~27 GB (tamaño del repositorio 30.8 GB incluyendo la torre de visión FP16). Para inferencia con vLLM se recomienda al menos 32 GB de VRAM para dejar margen a los estados de atención y activaciones. Con cuantización más agresiva (NVFP4, ~17 GB) podría caber en GPUs de 24 GB, pero esta versión W8A16 requiere más.
- GPU recomendadas: NVIDIA Ampere o superior (RTX 3090, RTX 4090, A100, H100, L40S, etc.) por la dependencia de kernels Marlin. No funciona en CPU ni en GPUs no NVIDIA.
- Compatibilidad con GPUs de consumo: sí, una RTX 4090 (24 GB) no es suficiente para esta versión W8A16 (necesita ~27 GB), pero una RTX 3090 con 24 GB tampoco. Se requiere al menos una GPU de 32 GB (por ejemplo, A100 40 GB o RTX 6000 Ada). Para GPUs de consumo de 24 GB se recomienda la versión FP8 o GGUF de menor cuantización.
- Opciones de despliegue: vLLM (recomendado, con `--trust-remote-code`), también compatible con transformers. No soporta llama.cpp ni Ollama en esta versión; para CPU se debe usar la versión GGUF.
- Latencia y throughput: no disponibles. Dependerá de la GPU, el tamaño de lote y la longitud de contexto. El MTP puede acelerar la decodificación especulativa en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| QuaduxIT/Qwen3.8-27B-Whitehat-W8A16 (este) | 8.75B (según safetensors) / 27B nominal | 262K | INT8 W8A16 | Apache 2.0 | Seguridad ofensiva autorizada, multimodal |
| QuaduxIT/Qwen3.8-27B-Whitehat (BF16) | 27B | 262K | BF16 | Apache 2.0 | Mismo fine-tune, pesos de referencia (~52 GB) |
| Qwen/Qwen3.8-27B (base) | 27B | 262K | BF16 | Apache 2.0 | Modelo general, rechaza tareas ofensivas |
| Modelos "uncensored" (ej. Dolphin, abliterados) | Variable | Variable | Variable | Variable | Responden a todo, sin guardrails de seguridad física |

La comparativa directa con otros modelos de seguridad ofensiva (como WhiteRabbitNeo o PentestGPT) no está disponible en la información proporcionada. La principal diferencia con el base Qwen3.8-27B es que este fine-tune no rechaza tareas ofensivas legítimas, mientras que el base rechaza aproximadamente el 40 % del trabajo de seguridad y el 100 % de las tareas ofensivas, según la model card.

## Limitaciones y advertencias

- Uso exclusivo para trabajo autorizado: el modelo no distingue entre sistemas propios y ajenos; el usuario es responsable de obtener permiso explícito antes de usarlo en cualquier sistema. No debe desplegarse como asistente general para usuarios finales no confiables.
- Riesgo de alucinación: como cualquier LLM, puede generar exploits o análisis incorrectos o peligrosos. Las salidas deben ser revisadas por un profesional cualificado antes de ejecutarse.
- Sesgos conocidos: el fine-tune está orientado a la seguridad ofensiva, por lo que puede mostrar un sesgo hacia soluciones agresivas o invasivas. No se ha evaluado su comportamiento en dominios fuera de la seguridad.
- Limitaciones de hardware: requiere NVIDIA CUDA (Ampere o superior) y no funciona en CPU ni en GPUs AMD/Intel. Para entornos sin CUDA se debe usar la versión GGUF.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor incluye un descargo de responsabilidad (DISCLAIMER.md) que limita la responsabilidad y exige el cumplimiento de las leyes locales. El uso indebido puede violar leyes de ciberseguridad.
- Discrepancia de parámetros: los safetensors indican 8.756.075.292 parámetros, muy por debajo de los 27B nominales. Esto podría deberse a un error en el registro o a una arquitectura con pesos compartidos, pero no está documentado. Conviene verificar antes de dimensionar infraestructura.
- Sin benchmarks publicados: no hay métricas objetivas de rendimiento, lo que dificulta comparar con alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-W8A16
- Modelo base (fine-tune BF16): https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección de formatos de Quadux: https://huggingface.co/collections/QuaduxIT/qwen38-27b-whitehat-6a89b5f640072fc5e6838c4b
- Guía de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guía local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Página de Quadux IT: https://quadux.it/
