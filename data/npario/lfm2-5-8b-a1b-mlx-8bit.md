# npario/LFM2.5-8B-A1B-MLX-8bit

## Resumen

LFM2.5-8B-A1B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI, diseñado específicamente para ejecutarse en dispositivos locales (portátiles, estaciones de trabajo) manteniendo un alto rendimiento en tareas de razonamiento, tool calling y agentes. Combina 8.000 millones de parámetros totales con solo 1.500 millones de parámetros activos por token procesado, lo que reduce drásticamente el coste de inferencia y permite su uso en hardware de consumo. Su arquitectura híbrida conv+attention, junto con una ventana de contexto de 128.000 tokens y un modo de razonamiento explícito (chain-of-thought), lo posiciona como una alternativa interesante a modelos cerrados de tamaño similar.

Esta ficha se centra en la conversión MLX de 8 bits realizada por el usuario npario, que adapta el modelo original de Liquid AI al ecosistema Apple Silicon mediante la librería mlx-lm. La conversión conserva todas las capacidades del modelo base (tool calling, razonamiento, multilingüismo) y reduce el peso a 8 bits por parámetro con grupo de cuantización de tamaño 64, lo que facilita su despliegue en equipos con memoria unificada moderada. El modelo base fue publicado en 2026 y su informe técnico está disponible en arXiv (2511.23404).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida conv+attention (backbone LFM2) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | 1.500 millones (1.5B) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 8 bits por peso (grupo 64, modo afín) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors de esta conversión MLX ocupa 2.382.773.696 parámetros (9,0 GB en disco) debido a la cuantización de 8 bits; el modelo original sin cuantizar tiene 8B parámetros en precisión completa.

## Arquitectura y entrenamiento

LFM2.5-8B-A1B utiliza una arquitectura MoE con un backbone híbrido que combina capas convolucionales y de atención (conv+attention), una innovación de Liquid AI que reduce el coste computacional frente a transformers puros. De los 8B parámetros totales, solo 1.5B se activan por token, lo que permite una decodificación rápida incluso en hardware limitado. El modelo incorpora razonamiento explícito con cadena de pensamiento (chain-of-thought) y soporta tool calling de forma nativa, características que lo hacen adecuado para tareas agénticas.

No se dispone de información detallada sobre el dataset de entrenamiento (número de tokens, composición, método de alineación como RLHF o DPO) en la información proporcionada. El informe técnico (arXiv:2511.23404) y el blog de Liquid AI mencionan "fuertes resultados en benchmarks" pero sin cifras concretas en los materiales consultados. La conversión MLX de 8 bits mantiene los pesos de las puertas de enrutamiento MoE también en 8 bits, conservando la precisión del modelo original.

## Capacidades

- Generación de texto conversacional con formato ChatML y plantilla de chat integrada.
- Razonamiento explícito con cadena de pensamiento visible antes de la respuesta final.
- Soporte de tool calling / function calling mediante la API de chat (se pasa el argumento `tools` a `apply_chat_template`).
- Capacidad para tareas agénticas y razonamiento multi-paso gracias a su modo de razonamiento y contexto largo.
- Multilingüe en 9 idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español y portugués.
- Ejecución en dispositivo (on-device) con baja latencia de decodificación gracias a la arquitectura MoE con 1.5B activos.
- Compatible con el ecosistema MLX de Apple Silicon (esta conversión) y con vLLM para despliegue en GPU NVIDIA.

## Casos de uso

- Asistente personal en portátil: el modelo puede ejecutarse localmente en un Mac con memoria unificada de 16 GB, ofreciendo respuestas con razonamiento para tareas de productividad, resumen de documentos y búsqueda de información sin conexión.
- Atención al cliente multilingüe: su ventana de 128K tokens permite gestionar conversaciones multi-turno con historial extenso, y su soporte de tool calling facilita la integración con sistemas de tickets o bases de conocimiento.
- Agente autónomo de código: puede utilizar herramientas (por ejemplo, ejecutar comandos, leer archivos) y razonar sobre los resultados para tareas de depuración, refactorización o generación de scripts en entornos de desarrollo.
- Procesamiento de documentos largos: con 128K de contexto, es adecuado para resumir informes extensos, analizar contratos o extraer información de manuales técnicos completos en una sola pasada.
- Chatbot de soporte técnico integrado en CI/CD: su capacidad de tool calling permite conectarlo a APIs de gestión de incidencias para automatizar triaje y resolución de problemas comunes.
- Traducción y adaptación de contenido: al soportar 9 idiomas, puede utilizarse para traducir documentación técnica o localizar interfaces de usuario manteniendo coherencia contextual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog de Liquid AI menciona "fuertes resultados" y el informe técnico (arXiv:2511.23404) contiene evaluaciones, pero los datos concretos no están incluidos en los materiales proporcionados. Se recomienda consultar el informe técnico o el blog oficial para obtener cifras detalladas de MMLU, HumanEval, GSM8K u otras pruebas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización de 8 bits del modelo completo (8B parámetros) requiere aproximadamente 8 GB de memoria, más overhead de activaciones y caché KV. Con la ventana de 128K, el uso de memoria puede aumentar significativamente; para contextos largos se recomienda al menos 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1 Pro o superior) con 16 GB o más de memoria unificada para esta versión MLX. También es compatible con GPU NVIDIA (A100, RTX 4090, etc.) mediante vLLM, según las recetas de vLLM.
- Cabe en GPU de consumo: sí, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) pueden ejecutar el modelo con cuantización de 8 bits, aunque con contextos largos puede ser necesario reducir la longitud o usar cuantización inferior.
- Opciones de despliegue: mlx-lm (para Apple Silicon), vLLM (para GPU NVIDIA), y posiblemente otros frameworks compatibles con safetensors y arquitectura MoE.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado que solo se activan 1.5B parámetros por token, la decodificación es notablemente más rápida que un modelo denso de 8B, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. A nivel estructural, LFM2.5-8B-A1B se puede comparar con otros modelos MoE de tamaño similar como Qwen2.5-7B-Instruct (denso, 7B, contexto 32K) o Gemma-2-9B (denso, 9B, contexto 8K), pero sin benchmarks no es posible establecer una comparación objetiva. La ventaja principal de LFM2.5 es su combinación de contexto largo (128K), razonamiento explícito y bajo coste de inferencia (1.5B activos).

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 puede imponer restricciones de uso comercial; se debe revisar el texto completo de la licencia antes de utilizarlo en producción.
- El modelo está orientado principalmente a 9 idiomas; puede tener un rendimiento inferior en otros idiomas no listados.
- La versión MLX de 8 bits está pensada para Apple Silicon; para otras plataformas se debe usar el modelo original en safetensors o cuantizaciones compatibles.
- El modo de razonamiento con cadena de pensamiento puede generar respuestas más largas y verbosas, lo que aumenta la latencia percibida en tareas simples.
- Existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se solicita información factual poco común.
- El tamaño del repositorio (9,0 GB) puede ser elevado para dispositivos con almacenamiento limitado.
- No se han publicado evaluaciones independientes de sesgos o toxicidad en los materiales consultados.

## Enlaces

- Repositorio HuggingFace de la conversión MLX: https://huggingface.co/npario/LFM2.5-8B-A1B-MLX-8bit
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI (anuncio del modelo): https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Receta de vLLM para el modelo: https://recipes.vllm.ai/LiquidAI/LFM2.5-8B-A1B
- Informe técnico LFM2 (arXiv): https://arxiv.org/abs/2511.23404
