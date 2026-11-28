# SceneWorks/sd3.5-large-turbo-candle

## Resumen

sd3.5-large-turbo-candle es una conversión al ecosistema Candle (framework de tensores en Rust desarrollado por Hugging Face) del modelo de difusión Stable Diffusion 3.5 Large Turbo, originalmente publicado por Stability AI. El autor de esta conversión es SceneWorks, que distribuye los pesos en formato GGML/GGUF por bloques (tiers) para su uso con su propia librería de inferencia `candle_gen`. El modelo base es `stabilityai/stable-diffusion-3.5-large-turbo`, una variante destilada por destilación de trayectoria (adversarial diffusion distillation) del SD3.5 Large, pensada para generar imágenes en muy pocos pasos (típicamente 1 a 4) en lugar de los 20-50 habituales.

El repositorio incluye dos niveles de cuantización: `q4` (Q4_1, convertido sin pérdida desde el tier MLX q4 del repositorio hermano `SceneWorks/sd3.5-large-turbo-mlx`) y `q8` (Q8_0, cuantizado desde los pesos en bf16). Los codificadores de texto (CLIP-L, CLIP-G y T5) y el VAE se mantienen en precisión densa. Cada capa lineal cuantizada se almacena como un único tensor `U8` con forma `[out, in/32, block_bytes]`, y la configuración de cuantización se declara en `config.json`.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de difusión de gran tamaño (repo de 25,3 GB) en entornos Windows y Linux sin depender del stack Python/PyTorch, usando inferencia nativa en Rust; por otro, sirve como ejemplo de portabilidad de pesos entre ecosistemas (MLX en macOS, Candle en Windows/Linux) manteniendo coherencia de cuantización. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, ya que la model card se centra en el proceso de conversión y no en las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (transformer multimodal, familia Stable Diffusion 3.5); detalles internos no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto-a-imagen) |
| Tipos de cuantizacion | q4 (Q4_1, lossless desde MLX q4) y q8 (Q8_0 desde bf16); CLIP-L, CLIP-G, T5 y VAE en denso |
| Idiomas soportados | no disponible |
| Licencia | stabilityai-ai-community (declarada como `other` con `license_name: stabilityai-ai-community`) |
| Formato de pesos | safetensors y gguf-blocks (GGML por bloques, tensores U8 con forma `[out, in/32, block_bytes]`); config.json con `quantization: {bits, storage: ggml}` |

## Arquitectura y entrenamiento

El modelo base es Stable Diffusion 3.5 Large Turbo, un modelo de difusión latente que combina un transformer multimodal (MMDiT) con tres codificadores de texto (CLIP-L, CLIP-G y T5) y un VAE para la decodificación a píxeles. La variante Turbo se obtiene mediante destilación de trayectoria (adversarial diffusion distillation) sobre el SD3.5 Large, lo que permite generar imágenes con muy pocos pasos de muestreo (típicamente 1 a 4) manteniendo calidad razonable. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO, ya que la model card de esta conversión se centra exclusivamente en el proceso de cuantización y empaquetado.

La innovación técnica de este repositorio es el proceso de conversión: los pesos se transforman desde el formato MLX (usado en macOS) a GGML por bloques para su uso con Candle en Windows y Linux. El tier `q4` se convierte de forma lossless desde el q4 de MLX; el tier `q8` se cuantiza desde los pesos bf16. Cada capa lineal cuantizada se empaqueta como un tensor `U8` con forma `[out, in/32, block_bytes]`, y la configuración se declara en `config.json`. La herramienta de construcción es `candle_gen::ggml_tier` del repositorio `SceneWorks/inference`. Los codificadores de texto y el VAE permanecen en precisión densa, lo que preserva la calidad de la codificación textual y de la reconstrucción de imagen.

## Capacidades

- Generación de imágenes texto-a-imagen mediante difusión latente, con muestreo en muy pocos pasos (característica de la variante Turbo del modelo base).
- Codificación de prompts con triple codificador de texto (CLIP-L, CLIP-G y T5), lo que permite prompts largos y detallados.
- Ejecución nativa en Rust mediante Candle, sin dependencia de PyTorch ni de Python en tiempo de inferencia.
- Soporte de cuantización por bloques (q4 y q8) para reducir el uso de memoria y acelerar la inferencia en hardware modesto.
- Portabilidad entre ecosistemas: pesos compatibles con MLX (macOS) y Candle (Windows/Linux).
- Capacidades multilingües: no disponible en la información proporcionada (el T5 del modelo base suele aportar cobertura multilingüe, pero no se confirma en la model card).
- Tool calling / function calling: no aplica (modelo de generación de imágenes).
- Soporte de agentes y razonamiento multi-paso: no aplica.

## Casos de uso

- Generación de imágenes en aplicaciones de escritorio nativas: al estar empaquetado para Candle, se puede integrar en aplicaciones Rust para Windows y Linux sin arrastrar el stack Python/PyTorch, reduciendo el tamaño del binario y las dependencias de despliegue.
- Prototipado rápido de pipelines de imagen en producción: la variante Turbo permite obtener imágenes con 1 a 4 pasos de muestreo, lo que reduce la latencia y el coste por imagen en comparación con modelos que requieren 20-50 pasos.
- Herramientas de creación de contenido para marketing: generación de bocetos y variaciones visuales a partir de prompts detallados, aprovechando el triple codificador de texto para descripciones largas.
- Despliegue en entornos con restricciones de memoria: el tier q4 reduce el espacio de pesos respecto a bf16, lo que permite ejecutar el modelo en GPUs con menos VRAM o incluso en CPU con suficiente RAM.
- Investigación en portabilidad de modelos: sirve como referencia para estudiar la conversión lossless entre formatos MLX y GGML y la coherencia de cuantización entre ecosistemas.
- Generación de imágenes por lotes en servidores Linux sin GPU dedicada de gama alta: combinado con Candle y cuantización q4, puede ejecutarse en CPU o en GPUs consumer, facilitando el escalado horizontal en clústeres modestos.
- Integración en pipelines de CI/CD para pruebas de regresión visual: al ser determinista con la misma semilla y configuración, permite validar cambios en prompts o en el código de inferencia comparando imágenes generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como FID, CLIP score, MMLU, HumanEval ni GSM8K (no aplicables a un modelo de difusión), ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el repositorio ocupa 25,3 GB e incluye los tiers q4 y q8 junto con los codificadores de texto y el VAE en denso; el tier q4 reduce el espacio de pesos del transformer respecto a bf16, pero la VRAM necesaria depende del tier cargado y del tamaño de lote.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo base (SD3.5 Large), se espera que requiera GPUs con al menos 16-24 GB de VRAM para los tiers de mayor precisión, aunque no se confirma en la model card.
- ¿Cabe en GPU consumer? No disponible. El tier q4 podría caber en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB), pero no se aporta confirmación.
- Opciones de despliegue: Candle (librería `candle_gen` de SceneWorks) en Windows y Linux; MLX en macOS mediante el repositorio hermano `SceneWorks/sd3.5-large-turbo-mlx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión en este formato).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd3.5-large-turbo-candle (este) | no disponible | no aplica | no disponible | stabilityai-ai-community | Hugging Face (SceneWorks) |
| stabilityai/stable-diffusion-3.5-large-turbo (base) | no disponible | no aplica | no disponible en esta ficha | stabilityai-ai-community | Hugging Face (Stability AI) |
| SceneWorks/sd3.5-large-turbo-mlx | no disponible | no aplica | no disponible | stabilityai-ai-community | Hugging Face (SceneWorks) |
| Otras variantes de SD3.5 Large Turbo en Candle | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; los modelos de difusión de gran escala suelen heredar sesgos de sus datos de entrenamiento, pero no se documentan aquí.
- Riesgo de alucinación visual: no disponible de forma explícita; como todo modelo generativo de imágenes, puede producir contenido incoherente o no solicitado, especialmente con prompts ambiguos.
- Limitaciones de contexto o idioma: no disponible; el modelo base usa T5 como codificador de texto, lo que sugiere cierta cobertura multilingüe, pero no se confirma.
- Restricciones de licencia: la licencia es `stabilityai-ai-community` (declarada como `other`), lo que impone condiciones específicas de uso comercial y redistribución que deben consultarse en el archivo `LICENSE.md` del repositorio antes de usar el modelo en producción.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad; se recomienda verificar la integridad de los pesos y la reproducibilidad de las imágenes antes de adoptarlo.
- Dependencia del ecosistema Candle: el uso requiere la librería `candle_gen` de SceneWorks, lo que limita la portabilidad a otros frameworks sin conversión adicional.
- Los codificadores de texto y el VAE están en denso, por lo que el ahorro de memoria de la cuantización se limita al transformer; el consumo total puede ser mayor de lo que sugiere el tamaño del tier q4.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SceneWorks/sd3.5-large-turbo-candle
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-large-turbo
- Repositorio hermano en MLX: https://huggingface.co/SceneWorks/sd3.5-large-turbo-mlx
- Repositorio de inferencia de SceneWorks: https://huggingface.co/SceneWorks/inference
- Licencia: https://huggingface.co/SceneWorks/sd3.5-large-turbo-candle/blob/main/LICENSE.md
- Candle (framework de Hugging Face): https://github.com/huggingface/candle
