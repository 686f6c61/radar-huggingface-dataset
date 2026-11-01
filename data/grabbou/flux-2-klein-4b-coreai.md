# grabbou/FLUX.2-klein-4B-CoreAI

## Resumen

FLUX.2-klein-4B-CoreAI es una exportación del modelo de generación de imágenes texto-a-imagen FLUX.2 [klein] 4B de Black Forest Labs, convertido al formato Core AI de Apple para su ejecución en dispositivos iOS y macOS. El trabajo de conversión y cuantización lo firma el usuario grabbou, que publica los pesos en formato `.aimodel` (el formato nativo de Core AI) con cuantización de 4 bits, reduciendo el peso total del repositorio a 4,0 GB. El modelo base es un transformer de difusión (DiT) de 4 mil millones de parámetros con destilación de pasos, capaz de generar imágenes de 512x512 en solo 4 pasos de muestreo.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: demuestra cómo llevar un modelo de difusión de última generación al ecosistema on-device de Apple. Incluye un transformer DiT de 25 bloques, un codificador de texto Qwen3 y un decodificador VAE, todos cuantizados a 4 bits y empaquetados para cargarse de forma perezosa (`lazyModelLoading`) de modo que quepan en la memoria que iOS concede a una aplicación en un iPhone 17 Pro.

La licencia Apache-2.0 del modelo original se mantiene, y los pesos, según el autor, solo han sido convertidos y cuantizados sin otras modificaciones. La ausencia de descargas y likes en el momento de la consulta indica que es un artefacto reciente y de nicho, orientado a desarrolladores que quieran integrar generación de imágenes en apps React Native o Swift sobre iOS 27 o macOS 27.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con destilacion de pasos; 25 bloques; codificador de texto Qwen3; VAE decoder |
| Parametros totales | 4B (modelo base); desglose por componente no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el codificador de texto Qwen3 tiene su propia ventana, no especificada) |
| Tipos de cuantizacion | 4 bits (pesos `.aimodel`); VAE decoder en half precision |
| Idiomas soportados | no disponible (prompts en lenguaje natural; idiomas concretos no declarados) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Core AI de Apple); componentes: `Transformer_512.aimodel` (2,0 GB), `TextEncoder.aimodel` (1,6 GB), `VAEDecoder_half.aimodel` (95 MB), tokenizer y metadata (11 MB) |

## Arquitectura y entrenamiento

El modelo base FLUX.2 [klein] 4B es un transformer de difusión (DiT) destilado en pasos, diseñado para generar imágenes en un número reducido de iteraciones (4 pasos en esta exportación). La exportación a Core AI conserva la estructura del DiT de 25 bloques para resolución 512x512, junto con un codificador de texto basado en Qwen3 y un decodificador VAE que transforma latentes en imágenes de 512x512. El scheduler empleado es `discreteFlow` con `guidanceScale` de 1.0, lo que refleja el carácter destilado del modelo (no requiere classifier-free guidance elevado).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original, ya que la model card de esta exportación no los detalla. La innovación técnica destacable de esta ficha no está en el entrenamiento, sino en el despliegue: la conversión a Core AI con cuantización de 4 bits y la carga perezosa de componentes, que permite ejecutar un modelo de difusión de 4B en memoria de iPhone. La exportación se realizó con `coreai-core` 1.0.0b3 y el commit `5de95c6` (versión 1.0.0) de `apple/coreai-models`, usando `--platform iOS --single-function --components transformer_512 text_encoder vae_decoder_half`.

## Capacidades

- Generación de imágenes texto-a-imagen en resolución 512x512.
- Generación en 4 pasos de muestreo (modelo destilado en pasos), lo que reduce la latencia frente a modelos de difusión tradicionales de 20-50 pasos.
- Control de semilla (`seed`) para reproducibilidad de la generación.
- Integración con React Native mediante `@react-native-ai/core-ai` y la función `generateImage` del SDK de Vercel AI.
- Integración nativa en Swift mediante `FlowTransformerPipeline` del producto `CoreAIDiffusion`.
- Ejecución on-device en iOS 27 y macOS 27, sin dependencia de servidores externos.
- Carga perezosa de componentes (`lazyModelLoading`) para ajustarse a los límites de memoria de las apps en iOS.
- No incluye el transformer de imagen-a-imagen ni el codificador VAE del export completo, por lo que la edición de imágenes no está soportada en esta versión.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (es un modelo de generación de imágenes, no un LLM).

## Casos de uso

- Generación de imágenes en apps iOS nativas: una app Swift puede instanciar `FlowTransformerPipeline` con los pesos locales y generar imágenes de 512x512 a partir de un prompt, sin llamadas a red ni costes de API, gracias a la cuantización de 4 bits que mantiene el paquete en 4,0 GB.
- Funciones de creatividad en apps React Native: mediante `@react-native-ai/core-ai` y `generateImage`, un desarrollador puede añadir generación de ilustraciones o avatares a una app multiplataforma con un bloque de código mínimo.
- Prototipado rápido de interfaces generativas: útil para diseñadores que quieran probar prompts y semillas en dispositivo antes de trasladar el flujo a un servidor con el modelo completo.
- Aplicaciones de privacidad estricta: al ejecutarse on-device, los prompts y las imágenes no salen del dispositivo, lo que encaja en escenarios sanitarios, jurídicos o empresariales con requisitos de confidencialidad.
- Demos y pruebas de concepto de Core AI: sirve como referencia para evaluar el rendimiento de Core AI con modelos de difusión y para validar la receta de exportación de `apple/coreai-models`.
- Generación de contenido offline: apps que funcionan en modo avión o en entornos sin conectividad pueden producir imágenes localmente, con la latencia asociada al hardware del dispositivo.
- Integración en pipelines de CI para apps móviles: permite automatizar pruebas de regresión visual de la generación de imágenes en simuladores iOS 27 sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 4,0 GB en disco; en ejecución, la carga perezosa permite mantener un solo componente en memoria a la vez, pero no se especifica el pico de RAM exacto. El transformer DiT (2,0 GB) y el codificador de texto (1,6 GB) son los componentes más exigentes.
- GPU recomendadas: no aplica GPU de escritorio; el destino es Apple Silicon en iPhone y Mac. El autor indica que cabe en la memoria que iOS concede a una app en un iPhone 17 Pro.
- ¿Cabe en GPU consumer? No es el caso de uso: está diseñado para ejecutarse en el Neural Engine/GPU de dispositivos Apple, no en GPUs NVIDIA o AMD.
- Opciones de despliegue: Core AI de Apple (formato `.aimodel`), con `FlowTransformerPipeline` en Swift o `@react-native-ai/core-ai` en React Native. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles. El modelo genera en 4 pasos, lo que reduce la latencia frente a modelos de difusión de más pasos, pero no se publican cifras concretas de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLUX.2-klein-4B-CoreAI (esta ficha) | 4B | 512x512 | 4 | `.aimodel` (Core AI) | Apache-2.0 | HuggingFace, on-device iOS/macOS |
| FLUX.2-klein-4B (original) | 4B | no disponible | no disponible | safetensors (presumiblemente) | Apache-2.0 | HuggingFace |
| Otros modelos de difusion on-device para iOS | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas on-device comparables en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Solo genera imágenes de 512x512; no se documentan resoluciones superiores en esta exportación.
- No incluye el transformer de imagen-a-imagen ni el codificador VAE, por lo que no permite edición ni variaciones a partir de una imagen de entrada.
- Requiere iOS 27 o macOS 27, lo que limita su uso a dispositivos y versiones de sistema muy recientes.
- El rendimiento y la viabilidad dependen del modelo de iPhone; el autor cita el iPhone 17 Pro como referencia, pero no se garantiza en dispositivos anteriores.
- No se publican datos de sesgos, alucinaciones visuales ni calidad de generación en la model card; se desconoce el comportamiento con prompts complejos o en idiomas distintos del inglés.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base FLUX.2 [klein] 4B y las condiciones de Black Forest Labs para el uso de sus pesos.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria ni de mantenimiento continuado.
- La cuantización a 4 bits puede degradar la calidad de imagen frente a los pesos originales en precisión completa; no se publican comparativas de fidelidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grabbou/FLUX.2-klein-4B-CoreAI
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio de recetas de Apple: https://github.com/apple/coreai-models
- Integración React Native: https://github.com/callstackincubator/ai
- Black Forest Labs: https://bfl.ai
