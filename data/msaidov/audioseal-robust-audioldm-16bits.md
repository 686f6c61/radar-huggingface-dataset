# msaidov/audioseal-robust-audioldm-16bits

## Resumen

`msaidov/audioseal-robust-audioldm-16bits` es un generador de marcas de agua (watermarking) de audio, desarrollado por msaidov, que consiste en un fine-tuning del generador de AudioSeal de Meta (`facebook/audioseal`). El modelo resuelve el problema de la eliminación de marcas de agua mediante ataques de resíntesis con modelos de difusión latente, concretamente AudioLDM. Este tipo de ataque, conocido como *partial-noise-then-regenerate*, es extremadamente destructivo porque el vocoder (HiFi-GAN) regenera la fase desde cero, dejando la salida prácticamente incorrelada con la entrada a nivel de muestra.

La relevancia de este modelo radica en que es un drop-in replacement para el generador estándar `audioseal_wm_16bits`, manteniendo compatibilidad total con el detector no modificado `audioseal_detector_16bits`. Esto permite a los desarrolladores proteger audio contra un ataque de difusión sin cambiar su pipeline de detección. La arquitectura es el codificador/decodificador SEANet de AudioSeal con procesador de mensajes de 16 bits, inicializado desde los pesos preentrenados. El tamaño del repositorio es de 0.1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SEANet encoder/decoder (AudioSeal) con procesador de mensajes de 16 bits (nbits: 16, dimension: 128, n_filters: 32, ratios: [8, 5, 4, 2], 2 capas LSTM) |
| Parametros totales | no disponible (peso del checkpoint no especificado, repo de 0.1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (procesa audio de 16 kHz, segmentos de 2.0 s en entrenamiento) |
| Tipos de cuantizacion | no disponible (formato de pesos PyTorch `.pth`) |
| Idiomas soportados | en (ingles) |
| Licencia | mit |
| Formato de pesos | PyTorch (checkpoint `generator.pth`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del generador de AudioSeal, que usa una arquitectura SEANet (encoder/decoder convolucional) con un procesador de mensajes de 16 bits. Solo se entrena el generador; el detector se carga preentrenado y congelado (`requires_grad_(False)`), usándose únicamente como objetivo diferenciable. Esto garantiza que la detección existente siga funcionando sin cambios.

El entrenamiento se realiza contra un ataque de AudioLDM (latent diffusion model) ejecutado de forma totalmente incondicional. El ataque consiste en: mel-spectrograma → VAE latent → forward-diffusion hasta un timestep `t*` (uniforme en [0, 0.02] de 1000 pasos) → reverse-diffusion con el UNet preentrenado → decodificación → re-vocoding con HiFi-GAN. Toda la cadena se ejecuta de forma diferenciable dentro del bucle de entrenamiento. La receta de entrenamiento `audioldm_mixed` alterna entre rama identidad (0.5 de peso) y rama AudioLDM (0.5 de peso), ya que al 100% de ataque el generador no tiene señal de gradiente útil (el bit loss se satura en 0.698, equivalente a azar). Se usa normalización de gradiente (`normalize_grad: True`) porque el backprop a través de la cadena de difusión amplifica el gradiente unas 250 veces en el límite del ataque.

Los datos de entrenamiento son LibriSpeech (16 kHz, habla leída en inglés): `train-clean-100` (~100 horas, ~28.5k utterances) para entrenamiento y `dev-clean` para validación. Los segmentos son recortes aleatorios de 2.0 s, y el ataque de AudioLDM los rellena hasta su ventana nativa de 10.24 s. La marca de agua se inserta con `x_wm = x + scale · G(x, m)`, donde `scale` se ajusta por ejemplo para lograr un SNR objetivo uniforme en [24, 36] dB.

## Capacidades

- Generación de marcas de agua de audio imperceptibles en habla inglesa de 16 kHz.
- Insercion de mensajes de 16 bits por segmento de audio.
- Robustez frente a ataques de resíntesis con AudioLDM (latent diffusion) hasta un `strength_max` de 0.02.
- Compatibilidad directa con el detector `audioseal_detector_16bits` sin modificaciones.
- Funciona como reemplazo directo del generador `audioseal_wm_16bits` de Facebook.
- Permite entrenamiento con SNR controlado por ejemplo (24–36 dB) para ajustar la perceptibilidad.
- Capacidad de generalización a ataques estructuralmente diferentes (SGMSE) no verificada en este checkpoint, pero disponible como modelo hermano.

## Casos de uso

- Protección de derechos de autor en audio generado por IA: integrar el generador en pipelines de síntesis de voz para marcar automáticamente cada clip de salida, permitiendo rastrear su origen incluso si se intenta eliminar la marca mediante herramientas de resíntesis con difusión.
- Auditoría de contenido en plataformas de streaming: aplicar el watermarking a clips de audio subidos por usuarios y usar el detector estándar para verificar si un clip proviene de una fuente protegida, incluso después de haber pasado por un modelo de mejora o regeneración.
- Verificación de autenticidad en entrevistas o grabaciones legales: marcar grabaciones de voz en el momento de la captura para poder demostrar su integridad posteriormente, resistiendo ataques de manipulación por difusión.
- Marcado de datasets de entrenamiento de audio: insertar marcas de agua en datasets públicos para detectar si un modelo de terceros ha sido entrenado con ellos, ya que el watermarking sobrevive a la resíntesis.
- Trazabilidad en servicios de texto-a-voz (TTS) comerciales: marcar cada generación de voz con un ID de cliente de 16 bits, permitiendo identificar qué usuario generó un clip específico incluso si se intenta limpiar con herramientas de difusión.
- Protección de podcasts y contenido editorial: marcar episodios completos antes de su distribución para detectar copias no autorizadas que hayan pasado por procesos de regeneración de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un modelo de watermarking de audio, no de un LLM. El autor reporta datos de entrenamiento relevantes: en una ejecución previa sin la rama identidad, el bit loss se saturó en 0.698 frente a `ln 2 = 0.6931` (nivel de azar), lo que demuestra que el ataque de AudioLDM destruye la marca por completo. En la configuración final con receta mixta, no se proporcionan métricas de bit error rate (BER) finales ni comparaciones con el modelo base en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs recomendadas en la informacion proporcionada.
- El tamaño del repositorio es de 0.1 GB, lo que sugiere un checkpoint ligero, probablemente ejecutable en GPUs de consumo como RTX 3060 o superiores, pero no confirmado.
- El entrenamiento requirió backprop a través de una cadena de difusión completa, lo que implica requisitos de memoria elevados durante el entrenamiento (no especificados).
- Para inferencia, al ser un generador de AudioSeal estándar, debería ser compatible con las librerías `audioseal` y PyTorch, sin necesidad de infraestructura especializada.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Ataque objetivo | Compatibilidad detector | Licencia |
|---|---|---|---|---|
| `msaidov/audioseal-robust-audioldm-16bits` | SEANet (AudioSeal) | AudioLDM (latent diffusion) | Compatible con detector estándar | MIT |
| `msaidov/audioseal-robust-sgmse-16bits` | SEANet (AudioSeal) | SGMSE (OU-VE SDE speech enhancement) | Compatible con detector estándar | MIT |
| `facebook/audioseal` (modelo base) | SEANet (AudioSeal) | Sin robustez específica contra difusión | Detector estándar | MIT |

La principal diferencia entre los dos modelos robustos es el tipo de ataque de difusión contra el que están endurecidos: AudioLDM (latent diffusion, destructivo a nivel de fase) frente a SGMSE (speech enhancement basado en SDE). El modelo base no ofrece protección específica contra estos ataques de resíntesis.

## Limitaciones y advertencias

- La robustez está limitada a ataques con `strength_max` de 0.02 (hasta ~20 timesteps de 1000), por lo que ataques más agresivos de AudioLDM pueden degradar o eliminar la marca.
- El modelo se entrenó solo con habla inglesa de LibriSpeech; el rendimiento en otros idiomas, acentos o dominios (música, efectos de sonido) no está verificado.
- La generalización a ataques de difusión estructuralmente diferentes (como SGMSE) no se ha probado en este checkpoint; para ese caso se recomienda el modelo hermano.
- No se proporcionan métricas finales de BER ni estudios de perceptibilidad (SNR, MOS) en la información disponible.
- El entrenamiento requirió una configuración cuidadosa de normalización de gradiente; replicar el entrenamiento desde cero es complejo y puede requerir ajustes de memoria.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que el uso de AudioLDM y los componentes asociados cumpla con sus respectivas licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msaidov/audioseal-robust-audioldm-16bits
- Modelo hermano (SGMSE): https://huggingface.co/msaidov/audioseal-robust-sgmse-16bits
- Modelo base (facebook/audioseal): https://huggingface.co/facebook/audioseal
- Código de entrenamiento: https://github.com/martysai/psiml11-audio-with-diffusion
- Repositorio de AudioLDM: https://github.com/haoheliu/AudioLDM-training-finetuning
- Dataset LibriSpeech: https://www.openslr.org/12
