# adepusricharan/deepfilternet3-coreml

## Resumen

`adepusricharan/deepfilternet3-coreml` es una conversión a Core ML de DeepFilterNet3, una red neuronal de mejora de voz (reducción de ruido) desarrollada originalmente por Hendrik Schröter y publicada en el repositorio `Rikorose/DeepFilterNet`. No es un modelo de lenguaje: no genera texto ni razona, sino que estima una máscara espectral y un conjunto de coeficientes de filtrado profundo que permiten suprimir ruido de fondo en una señal de voz. Este repositorio concreto empaqueta únicamente la red en formato `.mlpackage` (ML Program, FP16, macOS 14 o superior) para su ejecución en Apple Silicon, con un modo de inferencia en streaming por bloques de 100 tramas.

La relevancia de esta conversión es de ingeniería: convierte el modelo en un grafo con estado explícito. El estado de las GRU y de las convoluciones se pasa como tensores de entrada y salida, de modo que la inferencia se ejecuta en fragmentos de 100 tramas (hop de 10 ms a 48 kHz, es decir, bloques de 1 segundo) sin perder continuidad temporal. El resto del procesamiento de señal —STFT, características ERB y complejas, aplicación de la máscara, filtro profundo y STFT inversa— no está incluido y debe implementarse en la aplicación anfitriona, siguiendo el contrato descrito en `dfn3_dsp.json`.

El modelo está pensado para integrarse en aplicaciones macOS nativas de captura o procesado de audio (el autor lo usa en Clarity Sound Studio, una app gratuita y de código abierto). Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y sin datos de entrenamiento propios: los pesos son los del upstream en el commit `d375b2d` (`dfn3-epoch120-best`), sin más cambio que la conversión a FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para mejora de voz DeepFilterNet3 (procesado en dominio de la frecuencia con filtro profundo y capas recurrentes GRU); artefacto convertido a Core ML ML Program |
| Parametros totales | No disponible en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM: streaming por bloques de 100 tramas (10 ms de hop a 48 kHz, aproximadamente 1 s por bloque); el estado se propaga entre bloques |
| Tipos de cuantizacion | FP16 (unico incluido en este repositorio); no se incluye INT8 ni FP32 |
| Idiomas soportados | No aplica / no disponibles: la mejora de ruido es agnostica al idioma |
| Licencia | MIT (el proyecto upstream DeepFilterNet tiene doble licencia MIT o Apache-2.0) |
| Formato de pesos | `.mlpackage` (Core ML ML Program, FP16) en el archivo `DeepFilterNet3-Stream-T100-fp16.mlpackage` |
| Entradas del grafo | `feat_erb`, `feat_spec` y seis tensores de estado (inicializados a cero al comienzo de la senal) |
| Salidas del grafo | `mask`, `coefs` y el estado siguiente |
| Frecuencia de muestreo asumida | 48 kHz, hop de 10 ms |
| Plataforma minima | macOS 14 o superior |
| Version upstream | DeepFilterNet3, commit `d375b2d` (`dfn3-epoch120-best`) |
| Comando de conversion | `convert.py --frames 100 --precision fp16 --gru unrolled` |
| Contrato DSP | `dfn3_dsp.json` (ventana, anchos de banda ERB, constantes de normalizacion y disposicion de coeficientes); replicado en `user_defined_metadata["dsp"]` |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB (segun la API de HuggingFace) |
| Fecha de creacion | 2026-10-24 (segun metadatos de la ficha) |

## Arquitectura y entrenamiento

DeepFilterNet3 es una arquitectura de mejora de voz perceptualmente motivada, presentada por Schröter, Rosenkranz, Escalante-B. y Maier en Interspeech 2023. Opera sobre representaciones espectrales: extrae características en bandas ERB (escala perceptual) y características complejas de la señal, y a partir de ellas predice dos salidas complementarias: una máscara espectral de ganancia real y un conjunto de coeficientes para un filtro profundo multicanal aplicado sobre la señal de espectrograma complejo. La red incorpora capas recurrentes de tipo GRU para modelar la evolución temporal del ruido. En esta conversión, la GRU se ha "desenrollado" (`--gru unrolled`) y su estado, junto con el de las convoluciones, se expone como tensor de entrada y salida del grafo Core ML.

No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del corpus ni el uso de RLHF o ajuste por preferencias; esta ficha se limita a lo declarado en la model card. La innovación destacable aquí no es la arquitectura en sí, sino el diseño de la conversión: inferencia con estado en bloques de 100 tramas, precisión FP16 y separación estricta entre la red (Core ML) y el procesamiento DSP (implementado en la app). El JSON `dfn3_dsp.json` documenta ese contrato de interfaz —ventana, anchos de banda ERB, constantes de normalización y disposición de coeficientes— y viaja también embebido en los metadatos del modelo, lo que permite reconstruir el front-end y el back-end sin adivinar parámetros.

## Capacidades

- Supresión de ruido de fondo en tiempo real sobre voz, mediante predicción de máscara espectral y coeficientes de filtro profundo.
- Mejora perceptual de la señal de voz (el diseño del upstream es explícitamente "perceptually motivated").
- Inferencia con estado: continuidad entre bloques de 100 tramas, apta para flujos de audio en vivo.
- Ejecución en Apple Silicon mediante Core ML (ML Program), con posibilidad de usar Neural Engine o GPU según la política del runtime.
- Interfaz de bajo nivel bien definida: dos tensores de características y seis de estado como entrada; máscara, coeficientes y estado siguiente como salida.
- No incluye: generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente, diálogo multi-turno ni procesamiento de lenguaje natural.

## Casos de uso

- **Videollamadas y reuniones en macOS**: integrar el `.mlpackage` en una app de conferencia para eliminar ruido de teclado, ventiladores o tráfico antes de codificar el audio; el modo streaming por bloques de 100 tramas encaja con el pipeline de captura en vivo.
- **Preprocesado para reconocimiento automático de voz (ASR)**: aplicar la mejora antes de enviar el audio a un motor ASR local o en la nube; reducir ruido estacionario y no estacionario disminuye la tasa de error en entornos domésticos y de oficina.
- **Producción de pódcast y locución**: limpiar grabaciones de voz capturadas con micrófonos modestos, aplicando el modelo sobre el audio offline y reconstruyendo la señal con STFT inversa a partir de las salidas `mask` y `coefs`.
- **Grabación de entrevistas y trabajo de campo**: mejorar audio capturado con el micrófono del portátil o del móvil en exteriores, donde el ruido de viento y ambiente degrada la inteligibilidad.
- **Accesibilidad auditiva**: preprocesar la señal antes de la reproducción en auriculares o en sistemas de amplificación, para usuarios con pérdida auditiva que necesitan mayor relación señal-ruido.
- **Analítica de llamadas y transcripción de contact center**: normalizar el audio de las llamadas antes de la transcripción y del análisis posterior, reduciendo la variabilidad acústica entre agentes y entornos.
- **Grabación de pantalla y tutoriales**: integrar la supresión en herramientas de captura de pantalla para limpiar la narración sin exigir micrófonos profesionales ni hardware de audio dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (PESQ, STOI, ViSQOL, SI-SDR), ni comparaciones con el modelo upstream en FP32, ni mediciones de latencia o consumo en Neural Engine. Los resultados de búsqueda web apuntan a páginas de agregadores de modelos, pero no aportan cifras verificables para esta conversión concreta.

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple, macOS 14 o superior. No hay artefacto para Linux, Windows, CUDA, ROCm ni Vulkan.
- **VRAM / memoria**: no disponible. Al tratarse de un modelo de mejora de voz de tamano reducido y FP16, la huella debería ser de pocos megabytes, pero no se ha publicado la cifra ni el tama\u00f1o real del `.mlpackage`.
- **GPU/aceleradores recomendados**: Apple Silicon (series M1 en adelante) con ejecución vía Neural Engine o GPU a través de Core ML. En Macs Intel con macOS 14 la ejecución caería previsiblemente en CPU/GPU AMD, con rendimiento no documentado.
- **Compatibilidad con GPU de consumo x86**: no aplica; el formato Core ML no se ejecuta en GPUs NVIDIA o AMD de PC.
- **Opciones de despliegue**: Core ML / coremltools, integración directa en apps Swift u Objective-C mediante el framework Core ML. No es compatible con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de texto; para servir en red habría que exponer la app anfitriona.
- **Latencia y throughput**: no disponibles. Estructuralmente, el modelo procesa bloques de 1 segundo (100 tramas × 10 ms) por invocación; la latencia algorítmica vendrá determinada por el tamano del bloque y por el coste del DSP implementado en la app, no solo por la red.
- **Requisito adicional**: la aplicación debe aportar STFT, cálculo de características ERB y complejas, aplicación de máscara y filtro profundo, y STFT inversa; sin ese código el `.mlpackage` no produce audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / flujo | Precision | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|---|
| `adepusricharan/deepfilternet3-coreml` (esta ficha) | No disponible | Streaming, bloques de 100 tramas (10 ms hop, 48 kHz) | FP16 | MIT | Core ML, macOS 14+ | Solo la red; DSP en la app; contrato en `dfn3_dsp.json` |
| `aufklarer/DeepFilterNet3-CoreML` | No disponible | Tiempo real | INT8 | No disponible en la informacion proporcionada | Core ML, Neural Engine en Apple Silicon | Variante independiente de la misma conversion, orientada a Neural Engine y cuantizada a INT8 |
| DeepFilterNet3 upstream (`Rikorose/DeepFilterNet`) | No disponible | Tiempo real, orientado a 48 kHz | Pesos originales (PyTorch) | MIT o Apache-2.0 (doble) | Multiplataforma (Rust, Python, plugin LADSPA) | Referencia canonica; incluye todo el pipeline DSP, no solo la red |

No se dispone de datos comparativos de calidad (PESQ, STOI) ni de latencia entre estas tres variantes en la informacion proporcionada, por lo que la comparación se limita a formato, precisión y plataforma.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no responde preguntas, no razona y no admite tool calling. Cualquier expectativa de ese tipo es un error de categoría.
- **Artefacto incompleto por diseño**: solo se convierte la red. Sin una implementación fiel del DSP descrito en `dfn3_dsp.json` (ventana, bandas ERB, normalización, disposición de coeficientes, máscara, filtro profundo, STFT inversa) el modelo no produce audio utilizable.
- **Acoplamiento rígido a la interfaz**: las seis entradas de estado deben inicializarse a cero al comienzo y propagarse en el orden correcto; un desajuste en la disposición o en la normalización degrada la salida de forma silenciosa, sin errores evidentes.
- **Riesgo de que los pesos no estén presentes**: el repositorio declara 0.0 GB de tamano y 0 descargas. Antes de integrarlo conviene verificar que el `.mlpackage` está realmente subido y no es solo una referencia o un puntero LFS.
- **Sin validación comunitaria**: cero descargas y cero likes, sin issues ni discusión pública. No hay evidencia de que la conversión haya sido evaluada por terceros.
- **Sin benchmarks**: no hay métricas objetivas de calidad de mejora ni comparación con el upstream en FP32; el efecto de la cuantización a FP16 sobre la calidad perceptual no está medido.
- **Sin analisis de sesgos publicado**: no se dispone de informacion sobre la composicion del corpus de entrenamiento del upstream, por lo que no se puede evaluar el comportamiento diferencial por idioma, acento, edad, género o tipo de micrófono.
- **Sesgo acústico esperable**: como todo modelo de mejora de voz entrenado con datos mayoritariamente de habla, puede atenuar o distorsionar sonidos no vocales (música, alarmas, ruido de fondo relevante) al clasificarlos como ruido.
- **Riesgo de artefactos**: la supresión agresiva puede introducir "musical noise" o sobre-suavizado en pasajes con baja relación señal-ruido.
- **Restricciones de plataforma**: uso limitado a macOS 14+ y Apple Silicon en la práctica; no hay despliegue en servidores Linux con GPU.
- **Licencia y atribucion**: la conversion se distribuye bajo MIT, pero hereda la atribucion del upstream (Copyright (c) 2021 Hendrik Schröter). Conviene conservar el aviso de copyright y citar el paper de Interspeech 2023 en productos derivados.
- **Fecha de creacion anomala**: los metadatos indican 2026-10-24, posterior a la fecha habitual de consulta; conviene verificar la procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adepusricharan/deepfilternet3-coreml
- Repositorio upstream DeepFilterNet (Hendrik Schröter): https://github.com/Rikorose/DeepFilterNet
- Variante Core ML de aufklarer en HuggingFace: https://huggingface.co/aufklarer/DeepFilterNet3-CoreML
- Arbol de ficheros de la variante aufklarer: https://huggingface.co/aufklarer/DeepFilterNet3-CoreML/tree/main
- Ficha de la variante en Inferix (INT8, Neural Engine): https://inferix.co/models/aufklarer/DeepFilterNet3-CoreML
- Ficha en AxForge: https://axforge.ai/models/deepfilternet3-coreml/
- Benchmarks agregados (scraping de HuggingFace): https://0xsero.github.io/hf-model-benchmarks/models/aufklarer__DeepFilterNet3-CoreML--04e1c8.html
- Paper: H. Schröter, T. Rosenkranz, A. N. Escalante-B. y A. Maier, "DeepFilterNet: Perceptually Motivated Real-Time Speech Enhancement", Interspeech 2023 (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
