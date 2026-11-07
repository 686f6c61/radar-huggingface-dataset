# Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Qwen-7B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo DeepSeek-R1-Distill-Qwen-7B, publicada por Outlier-Ai para su ejecución nativa en Apple Silicon (chips M1, M2, M3 y M4). No se trata de un modelo nuevo ni de un ajuste fino: el repositorio solo cambia el formato en disco (safetensors MLX 4-bit, plantilla de chat y tokenizador) manteniendo los pesos y la licencia del modelo original de DeepSeek.

El modelo base es un destilado de razonamiento de DeepSeek sobre la arquitectura Qwen2 de 7B parámetros, con capacidad de chain-of-thought explícito (modo thinking) y entrenado para tareas de matemáticas, lógica y código. Esta versión cuantizada reduce el peso en disco a 4,3 GB, lo que permite ejecutarlo en Macs de gama consumer con memoria unificada, sin conexión a la nube y con privacidad total de los datos.

Su relevancia actual radica en la combinación de razonamiento tipo R1 con un despliegue local en hardware de escritorio. Con 7.615.616.512 parámetros reales y cuantización de grupo 64 simétrica, es una opción práctica para desarrolladores que necesitan un LLM de razonamiento offline en macOS, integrable vía `mlx-lm` o mediante la aplicación Outlier del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), destilado de razonamiento de DeepSeek-R1 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MLX 4-bit, group size 64, simetrica |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX 4-bit), shards; incluye config.json, tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2 con 7.615.616.512 parámetros, sobre el que DeepSeek aplicó un proceso de destilación a partir de su modelo de razonamiento R1. El destilado transfiere el comportamiento de chain-of-thought del modelo profesor a un modelo estudiante más pequeño, de modo que el modelo genera trazas de razonamiento antes de la respuesta final. Esta conversión concreta no introduce cambios en los pesos: solo aplica cuantización MLX 4-bit con tamaño de grupo 64 y simétrica, y repackagea tokenizador y plantilla de chat.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset de destilado ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La herramienta de conversión declarada es `mlx-lm` 0.31.x, y el resultado es compatible con el cargador estándar de MLX.

## Capacidades

- Generación de texto con razonamiento explícito (chain-of-thought): el modelo produce trazas de pensamiento antes de la respuesta final.
- Razonamiento matemático y resolución de problemas verbales, como los ejemplos de la model card (problema de las máquinas y los widgets, encuentro de trenes).
- Razonamiento lógico y deductivo, incluidos problemas de cuadrícula lógica.
- Generación de código, heredada de las capacidades del modelo base destilado.
- Soporte de tool calling / function calling, según las etiquetas del repositorio.
- Conversación multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Capacidades multilingües en diez idiomas: inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano y árabe.
- Ejecución totalmente offline y on-device en Apple Silicon, sin llamadas a API ni telemetría de nube.

## Casos de uso

- Asistente de razonamiento offline en macOS: un desarrollador puede cargar el modelo con `mlx-lm` y resolver problemas de lógica o matemáticas sin enviar datos a ningún servidor, gracias a los 4,3 GB de pesos cuantizados que caben en la memoria unificada de un Mac moderno.
- Tutor de matemáticas y ciencias: el modo thinking permite mostrar el desarrollo paso a paso de un problema, útil en herramientas educativas locales que necesitan explicar el razonamiento y no solo la respuesta.
- Automatización de scripts y CLI en entornos sin conectividad: al soportar function calling y ejecutarse vía `mlx-lm`, puede integrarse en herramientas de terminal que generen comandos o código a partir de lenguaje natural en máquinas aisladas.
- Prototipado de agentes multi-paso en local: la combinación de chain-of-thought y tool calling permite construir bucles de razonamiento-acción para tareas de investigación o extracción de datos, con la ventaja de la privacidad y la ausencia de coste por token.
- Procesamiento de documentos confidenciales: contratos, informes médicos o datos financieros pueden analizarse en el propio portátil, sin salir del dispositivo, aprovechando el soporte multilingüe en español, francés, alemán y otros idiomas.
- Generación de código en el editor: integrable en plugins locales de macOS que autocompleten funciones o expliquen errores, con latencia aceptable en chips M-series y sin depender de servicios externos.
- Chat conversacional privado: la aplicación Outlier permite usar el modelo como asistente de escritorio con historial multi-turno, sin cuotas de uso ni claves de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Macs M-series con procedencia completa, pero esos datos no se incluyen en el material proporcionado. No se inventan cifras.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 4,3 GB en disco; en inferencia se necesita espacio adicional para caché KV y buffers, por lo que se recomienda un mínimo de 8 GB de memoria unificada y 16 GB para contextos largos.
- GPU compatibles: Apple Silicon exclusivamente (M1, M2, M3, M4), incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio. No es compatible con CUDA ni con GPUs NVIDIA o AMD.
- Cabe en GPU consumer: sí, en cualquier Mac con chip M-series y al menos 8 GB de memoria unificada.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI y API Python), aplicación Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit (este) | 7,6B | no disponible | MLX 4-bit safetensors | MIT | Hugging Face, app Outlier |
| DeepSeek-R1-Distill-Qwen-14B-MLX-4bit (Outlier-Ai) | 14B (aprox.) | no disponible | MLX 4-bit safetensors | MIT (heredada) | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B-MLX-4bit (Outlier-Ai) | 8B (aprox.) | no disponible | MLX 4-bit safetensors | MIT (heredada) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B (original) | 7,6B | no disponible | safetensors BF16 | MIT | Hugging Face |

La comparativa se limita a la familia de destilados de R1 y a las conversiones del mismo autor; no se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo cuantizado a 4 bits: la cuantización puede degradar ligeramente la precisión en tareas de razonamiento matemático y código frente al modelo original en BF16.
- Solo Apple Silicon: no puede ejecutarse en GPUs NVIDIA, AMD ni en CPU x86 mediante MLX; para otros entornos hay que usar el modelo base o conversiones GGUF.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios factuales y en cadenas de razonamiento largas donde el modelo puede desviarse.
- Sesgos heredados del modelo base y de sus datos de entrenamiento; no se documentan mitigaciones específicas en esta conversión.
- Longitud de contexto no documentada en la información disponible; conviene verificar la configuración de `config.json` antes de usarlo con prompts largos.
- El modo thinking genera trazas extensas que aumentan el consumo de tokens y la latencia; en producción puede requerir control explícito del presupuesto de razonamiento.
- Licencia MIT heredada del modelo base, lo que permite uso comercial, pero se recomienda consultar la model card original de DeepSeek para condiciones canónicas.
- Repositorio con muy pocas descargas (38) y sin likes en el momento de la consulta; validar la integridad de los pesos antes de desplegarlo en producción.
- La model card incluye promoción de la aplicación Outlier (versión Pro de pago único de 49 USD); es material comercial, no una especificación técnica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Conversión hermana 14B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Conversión hermana Llama-8B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Conversión hermana Qwen-32B: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Aplicación Outlier: https://outlier.host/
- Benchmarks declarados por el autor: https://outlier.host/benchmarks
