# okayuji/mobile-image-lab-coreai

## Resumen

Mobile Image Lab es un paquete de investigación publicado por el usuario okayuji que adapta el modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1-Turbo para su ejecución en dispositivo (on-device) sobre Apple Silicon mediante el runtime Core AI de Apple. El objetivo no es ofrecer un modelo nuevo entrenado desde cero, sino un perfil de ejecución y un conjunto de pesos convertidos y comprimidos que permiten generar o editar imágenes de 512 × 512 píxeles directamente en un iPhone, sin depender de servidores externos ni de conexión de red.

El paquete está pensado para investigación y evaluación no comercial de generación de imágenes en dispositivo. La calibración documentada se realizó sobre un iPhone 17 Pro con iOS 27.0.1, y las mediciones de latencia son observaciones instrumentadas de un único dispositivo, no promesas de rendimiento general. El repositorio ocupa 13,8 GB y contiene 51 archivos que el runtime valida íntegramente antes de cargar el modelo.

La relevancia actual reside en que demuestra un flujo completo de despliegue de un modelo de difusión de gran tamaño en hardware móvil, con cuantización selectiva de pesos (W4/W8), cómputo en Float32 y un contrato de exportación explícito que separa la compresión de pesos del consumo real de memoria en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (base Qwen-Image-2.1-Turbo) con componentes vision, text, denoiser y VAE encoder/decoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos lineales seleccionados en W4/W8, con excepciones en precisión completa; cómputo exportado en Float32 |
| Idiomas soportados | no disponible (la model card muestra un prompt de ejemplo en japonés) |
| Licencia | qwen-research (uso no comercial; uso comercial requiere licencia separada del licenciante original) |
| Formato de pesos | Bundle propietario Core AI (`bundle/` con `bundle.json`, manifiesto e inventario de archivos); no safetensors ni GGUF |
| Tamano del repositorio | 13.783.495.057 bytes (51 archivos) |
| Resolucion de salida | 512 × 512 píxeles fija |
| Pasos de muestreo | 8 pasos sigma fijos, CFG 1, sin caché KV de prefijo |
| Perfil Core AI | `qmi-mobile-w4-dit-g16-native-complex-blocks16-23-f32-v1`, contrato `qwen-image21-mobile-v2` |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo (revisión `fc13ba1986fcb905854dc8de2f52eee395f49b5b`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen-Image-2.1-Turbo, un modelo de difusión texto-a-imagen. Este paquete no entrena un modelo nuevo: exporta el modelo base a un perfil específico para Core AI, dividiendo la inferencia en componentes separados (codificación de texto, codificación de visión, denoiser y VAE encoder/decoder). La conversión aplica cuantización W4/W8 a pesos lineales seleccionados, manteniendo algunas capas en precisión completa, y exporta el cómputo y las salidas de los componentes en Float32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no documenta el proceso de entrenamiento del modelo base. La innovación técnica destacable es el propio perfil de despliegue móvil: un contrato de exportación que declara explícitamente la precisión, el esquema de pasos y el inventario de archivos, junto con un mecanismo de validación que rechaza combinaciones desconocidas de dispositivo, sistema operativo y presupuesto de recursos.

## Capacidades

- Generación de imágenes a partir de texto con resolución fija de 512 × 512 píxeles.
- Edición de una única imagen de referencia, seleccionable mediante la inclusión opcional de una imagen junto al prompt.
- Ejecución completamente en dispositivo sobre Apple Silicon mediante el runtime Core AI, sin servidores externos.
- Muestreo determinista con ocho pasos sigma fijos, CFG 1 y ruido guardado fijo, lo que permite reproducibilidad entre ejecuciones.
- Validación de inventario completa antes de cargar el modelo, con verificación de hashes SHA-256.
- No se documenta soporte de tool calling, function calling, agentes, visión de entrada general ni modo de razonamiento.

## Casos de uso

- Investigación en generación de imágenes on-device: permite estudiar el comportamiento de un modelo de difusión de gran tamaño ejecutado íntegramente en un iPhone, con mediciones instrumentadas de latencia y huella de memoria.
- Evaluación de técnicas de cuantización para difusión: el perfil W4/W8 con excepciones en precisión completa sirve para analizar el impacto de la compresión de pesos en la calidad visual y en el consumo de recursos.
- Edición de imágenes local con una referencia: el flujo de edición con una única imagen de entrada permite experimentar con tareas de modificación guiada por prompt sin enviar datos a la nube.
- Prototipado de aplicaciones de privacidad por diseño: al no requerir red, el paquete es adecuado para escenarios donde la imagen no puede salir del dispositivo.
- Reproducibilidad de resultados: el uso de ruido guardado fijo y pasos deterministas facilita la verificación de salidas idénticas entre ejecuciones, útil en investigación comparativa.
- Validación de pipelines de conversión de modelos: el bundle y su manifiesto sirven como referencia para construir flujos de exportación a Core AI con inventario y evidencias de aceptación numérica y visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son mediciones de latencia y memoria en dispositivo:

| Metrica | Valor registrado |
|---|---|
| Tiempo de generación (5 solicitudes) | 308,6–469,3 segundos |
| Tiempo de edición (5 solicitudes) | 396,9–440,4 segundos |
| Pico de huella durante el proceso | 3.684.060.440 bytes |
| Huella cinco segundos tras liberar | 98.110.000–122.145.304 bytes |
| Repetición nativa | 10 solicitudes completadas con píxeles RGBA8 y PNG idénticos |
| Dispositivo calibrado | iPhone 17 Pro (`iPhone18,1`), iOS 27.0.1, build `24A446` |

Estas cifras corresponden a una validación previa del 1 de noviembre de 2026 y no constituyen una evaluación de rendimiento del nuevo canal de descarga.

## Requisitos de hardware

- Dispositivo calibrado: iPhone 17 Pro (`iPhone18,1`) con iOS 27.0.1 (build `24A446`). Otras combinaciones de dispositivo y sistema operativo no están establecidas por las mediciones.
- Almacenamiento: el bundle ocupa 13.783.495.057 bytes y requiere espacio adicional para la transferencia y la preparación.
- Memoria: el pico de huella registrado fue de 3.684.060.440 bytes durante el proceso; no es una especificación de RAM mínima.
- GPU: no se documentan requisitos de GPU de escritorio; el paquete está orientado a Apple Silicon móvil mediante Core AI.
- Despliegue: aplicación Core AI Demos con la entrada de descarga Mobile Image Lab, o importación manual del directorio `bundle` completo mediante la opción Import model.
- Latencia: entre 308,6 y 469,3 segundos por generación y entre 396,9 y 440,4 segundos por edición en el dispositivo calibrado, con diagnósticos de runtime activados y un servicio nuevo por solicitud.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un formato de bundle propietario de Core AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mobile Image Lab (este paquete) | no disponible | no disponible | 512 × 512 fija | qwen-research (no comercial) | Bundle Core AI para iPhone |
| Qwen/Qwen-Image-2.1-Turbo | no disponible | no disponible | no disponible | qwen-research | Pesos originales en Hugging Face |
| Otros modelos texto-a-imagen on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia qwen-research: el uso comercial requiere una licencia separada del licenciante original; el paquete está restringido a investigación y evaluación no comercial.
- Calibración limitada a un único dispositivo: solo el iPhone 17 Pro con iOS 27.0.1 está validado; otras combinaciones son rechazadas o no están establecidas.
- Latencia muy alta: más de cinco minutos por generación en el dispositivo calibrado, lo que lo hace inadecuado para aplicaciones interactivas en tiempo real.
- Resolución fija de 512 × 512 píxeles y ocho pasos de muestreo, sin margen de configuración documentado.
- El bundle no debe modificarse: el cargador espera el inventario exacto y elimina archivos de evidencia o configuración provoca fallos de carga.
- No se documentan sesgos conocidos, riesgo de alucinación visual ni limitaciones idiomáticas específicas.
- La compresión de pesos no implica una reducción equivalente del pico de memoria en tiempo de ejecución.
- El demo nativo para Mac no está incluido en este paquete.
- Las mediciones de latencia son observaciones instrumentadas de un único proceso, no garantías de rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okayuji/mobile-image-lab-coreai
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/fc13ba1986fcb905854dc8de2f52eee395f49b5b/LICENSE
- Repositorio Core AI Demos: https://github.com/oka-yuji/coreai-samples
- Issue de seguimiento del cambio de app: https://github.com/oka-yuji/coreai-samples/issues/562
- Evidencia de calibración en dispositivo: https://github.com/oka-yuji/coreai-samples/blob/3b3cfe2f70fa6f2b4fa7d9a8aeed51211f890dd3/docs/research/qwen-image21-device-calibration-20261101.json
