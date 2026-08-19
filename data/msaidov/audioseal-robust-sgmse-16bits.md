# msaidov/audioseal-robust-sgmse-16bits

## Resumen

Este modelo es un fine-tuning del generador de marcas de agua de AudioSeal, desarrollado por msaidov, que endurece el generador contra el ataque SGMSE, un modelo de difusión de mejora de voz utilizado como amenaza de eliminación de marcas. El objetivo es que la marca de agua incrustada en audio siga siendo detectable incluso después de que un atacante pase el audio por un proceso de reconstrucción basado en difusión, que tiende a eliminar perturbaciones que no sobreviven al prior del modelo de score. Es relevante ahora porque la generación de audio por IA ha disparado la necesidad de proteger la autoría y autenticidad del contenido, y los ataques de difusión representan una amenaza creciente para los sistemas de marcado existentes.

El modelo se basa en la arquitectura SEANet de AudioSeal, con un encoder/decoder convolucional y dos capas LSTM para procesar mensajes de 16 bits, inicializado desde los pesos preentrenados de `audioseal_wm_16bits`. Solo se entrena el generador; el detector permanece congelado y se usa como objetivo diferenciable. El entrenamiento se realiza sobre 10 horas de LibriSpeech en inglés, con segmentos de 1 segundo y una SNR objetivo de 24 a 36 dB. El checkpoint resultante es un reemplazo directo del generador original, compatible con el detector estándar sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SEANet encoder/decoder con 2 capas LSTM (AudioSeal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de AudioSeal: un encoder SEANet con ratios de submuestreo `[8, 5, 4, 2]`, 32 filtros base, dimensión de mensaje 128 y procesamiento de 16 bits. Se inicializa desde los pesos preentrenados de `audioseal_wm_16bits` y se fine-tune únicamente el generador. El detector se carga congelado y se utiliza como función de pérdida diferenciable, sin modificar su arquitectura ni sus pesos.

El entrenamiento se realiza contra el ataque SGMSE, un modelo de difusión score-based (OU-VE SDE) para mejora de voz, ejecutado de forma totalmente diferenciable dentro del bucle de entrenamiento. El ataque aplica 30 pasos de predicción-corrección y se muestrea la profundidad de corrupción `t*` uniformemente en `[0, 1]`. Cada paso mezcla dos ramas: identidad (sin ataque, peso 0.5) y SGMSE (peso 0.5). La pérdida combina BCE para presencia y bits del mensaje, con un peso `λ_bit = 2.0` para enfatizar la decodificación de bits, y una pérdida mel perceptual que fue desactivada (`λ_perc = 0.0`). El SNR objetivo se fija por ejemplo entre 24 y 36 dB. Se usó Adam con lr `5e-5`, grad clipping `max_norm = 3.0`, precisión bf16 y batch de 8. El entrenamiento se limitó a 100 épocas y 1000 updates por época como tope, no como objetivo.

## Capacidades

- Generación de marcas de agua en audio de voz a 16 kHz y 16 bits, con mensajes de 16 bits.
- Robustez frente al ataque de reconstrucción SGMSE (difusión score-based), manteniendo la detectabilidad tras el paso por el modelo de mejora de voz.
- Compatibilidad total con el detector original `audioseal_detector_16bits`, sin necesidad de cambios en el código de detección.
- Inferencia diferenciable durante entrenamiento, lo que permite su uso como componente en pipelines de protección de audio.
- Entrenado exclusivamente en inglés (LibriSpeech), por lo que su comportamiento en otros idiomas no está verificado.
- No soporta tool calling, agentes, visión ni otras capacidades multimodales; es un modelo especializado en watermarking de audio.

## Casos de uso

- Protección de derechos de autor en podcasts y audiolibros: incrustar una marca invisible en cada episodio permite rastrear copias no autorizadas incluso si el audio se procesa con herramientas de mejora de voz basadas en difusión.
- Trazabilidad de contenido generado por IA: los proveedores de servicios de síntesis de voz pueden marcar cada clip generado con un ID de usuario, y el detector puede verificar la autoría en plataformas de distribución.
- Verificación de autenticidad en entrevistas y grabaciones legales: la marca persiste tras ataques de reconstrucción, lo que ayuda a detectar manipulaciones o eliminación de metadatos.
- Auditoría de datasets de audio: las organizaciones que recopilan datos de voz pueden marcar sus grabaciones para identificar fugas o usos no autorizados en entrenamientos de terceros.
- Protección de contenido en plataformas de streaming: integrar el generador en el pipeline de subida permite monitorizar la redistribución ilegal de clips de audio.
- Investigación en robustez de watermarking: este checkpoint sirve como referencia para estudiar la transferencia de robustez entre ataques de difusión estructuralmente diferentes (comparado con el hermano `audioseal-robust-audioldm-16bits`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de detección, bit accuracy, SI-SNR o PESQ. Se recomienda al usuario evaluar el modelo en su propio conjunto de datos y condiciones de ataque antes de su despliegue.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo pequeño (0.1 GB), la generación de marcas puede ejecutarse en CPU con baja latencia (estimación del orden de decenas de milisegundos por segmento de 1 segundo, sin datos oficiales).
- VRAM estimada para inferencia: menos de 1 GB, suficiente para cualquier GPU moderna, incluidas GPUs de consumo como RTX 3060 o superiores.
- Entrenamiento: el fine-tuning requiere GPU con al menos 8 GB de VRAM (por batch size 8 y autocast bf16), aunque no se especifica la GPU exacta utilizada.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con bibliotecas estándar de audio (torch, torchaudio) y frameworks de inferencia como ONNX Runtime si se exporta. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales; se recomienda medir en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Robustez | Licencia | Disponibilidad |
|---|---|---|---|---|
| msaidov/audioseal-robust-sgmse-16bits | SEANet + LSTM (16 bits) | Entrenado contra SGMSE | MIT | HuggingFace |
| msaidov/audioseal-robust-audioldm-16bits | SEANet + LSTM (16 bits) | Entrenado contra AudioLDM | MIT | HuggingFace |
| facebook/audioseal (generador original) | SEANet + LSTM (16 bits) | Sin robustez específica frente a difusión | MIT | HuggingFace |

El modelo se diferencia del original por su entrenamiento adversarial contra SGMSE. Frente al hermano `audioseal-robust-audioldm-16bits`, este se ha especializado en un ataque de difusión concreto, y la model card sugiere que AudioLDM se mantuvo fuera del entrenamiento para probar la generalización. No se dispone de comparaciones cuantitativas entre ellos.

## Limitaciones y advertencias

- La pérdida perceptual se desactivó (`λ_perc = 0.0`), por lo que este checkpoint no está optimizado para transparencia auditiva. El usuario debe medir SI-SNR y PESQ antes de asumir imperceptibilidad.
- El entrenamiento se realizó solo con voz en inglés (LibriSpeech) a 16 kHz; el rendimiento en otros idiomas, acentos o frecuencias de muestreo puede degradarse.
- La robustez se ha verificado únicamente frente a SGMSE; no hay evidencia de que transfiera a otros ataques de difusión o a ataques no diferenciables (p. ej., compresión MP3, ruido aditivo, etc.).
- El modelo no incluye el detector; para su uso completo se debe cargar el detector original de `facebook/audioseal`.
- No se han publicado métricas de bit error rate ni de detección bajo ataques, por lo que el rendimiento real es desconocido.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la robustez en escenarios de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msaidov/audioseal-robust-sgmse-16bits
- Modelo hermano (AudioLDM): https://huggingface.co/msaidov/audioseal-robust-audioldm-16bits
- Código de entrenamiento: https://github.com/martysai/psiml11-audio-with-diffusion
- Repositorio de SGMSE (ataque): https://github.com/sp-uhh/sgmse
- Modelo base (AudioSeal): https://huggingface.co/facebook/audioseal
- Dataset LibriSpeech: https://www.openslr.org/12
