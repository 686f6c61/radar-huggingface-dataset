# gyroing/sanoTTS-fa-gyro

## Resumen

sanoTTS-fa-gyro es un modelo de síntesis de voz (text-to-speech) para persa (farsi) desarrollado por el usuario gyroing. Se trata de una destilación de su propio modelo Piper `fa_IR-gyro-medium` (arquitectura Piper/VITS) mediante la receta de destilación del proyecto sanoTTS. El resultado es un modelo extremadamente compacto: 1.567.724 parámetros y aproximadamente 3,1 MB en fp16, que funciona sin PyTorch ni ONNX.

El modelo resuelve el problema del despliegue de TTS en entornos con recursos muy limitados (dispositivos embebidos, aplicaciones de escritorio, navegador o servicios de altísima concurrencia), donde un modelo VITS completo resulta excesivo. La arquitectura se descompone en tres componentes convolucionales ligeros: predictor de duración, modelo acústico y decodificador iSTFT, que sustituyen al generador completo del profesor.

Es relevante por su tamaño (dos órdenes de magnitud menor que un Piper medium típico) y por su formato de pesos propietario (`roota.raw-fp16.v1`) con manifiesto de tensores, aunque su ecosistema es todavía muy incipiente: cero descargas, cero likes y una licencia sin definir en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline convolucional en tres etapas (duration_conv + token_context + decodificador piperlite iSTFT), destilado de Piper/VITS |
| Parametros totales | 1.567.724 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada: secuencia de fonemas de longitud variable) |
| Tipos de cuantizacion | fp16 (único formato publicado) |
| Idiomas soportados | Persa (farsi, `fa`) únicamente |
| Licencia | other (sin especificar; el autor deja un TODO para elegir licencia) |
| Formato de pesos | `weights.fp16.bin` (3.135.448 bytes) + `manifest.json` + `piper-phoneme-config.json`; paquete `roota.raw-fp16.v1` |
| Frecuencia de muestreo | 22050 Hz, mono |
| Simbolos foneticos | 157 (mapa de ids de Piper del profesor) |
| Framerate latente | 1 frame = 256 muestras |

## Arquitectura y entrenamiento

El modelo es una destilación del generador de un Piper/VITS (`fa_IR-gyro-medium`, monohablante, fonemas espeak `fa`) en tres subredes convolucionales: un predictor de duración `duration_conv` (hidden 64, profundidad 3, kernel 5, 137.732 parámetros), un modelo acústico `token_context` (hidden 96, profundidad 4, kernel 5, 699.271 parámetros) que produce el latente de 192 dimensiones del generador Piper, y un decodificador estilo iSTFT `piperlite` con canales 160/80/40/20 (730.721 parámetros). El decodificador se inicializó desde el profesor mediante slicing por canales.

El entrenamiento siguió la receta de destilación de sanoTTS contra el latente del generador del profesor, con aproximadamente 8.500 frases en persa (la fuente y licencia del corpus quedan como TODO en la model card). El proceso se dividió en fases: duración 5.000 pasos, acústico 7.500 pasos (8.000 frases), decodificador 3.500 pasos, z-mix 3.000 pasos y ajuste fino conjunto de 5.500 pasos con un paquete de 512 frases para el decodificador. No se emplearon pérdidas de firma de activación ni de feature hints. La entrada es una secuencia de ids de fonemas Piper generada externamente con espeak-ng (voz `fa`), incluyendo el wrapping `^ ... $` y el padding `_` tras cada símbolo al estilo Piper.

## Capacidades

- Síntesis de voz monohablante en persa (farsi) a partir de una secuencia de ids de fonemas Piper.
- Conversión texto-a-fonemas delegada a espeak-ng (voz `fa`), incluyendo lectura de números, fechas y decimales por parte de espeak-ng.
- Generación de audio a 22050 Hz mono con un frame latente cada 256 muestras.
- Inferencia sin PyTorch ni ONNX: solo requiere cargar el binario fp16 y el manifiesto de tensores.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No soporta otros idiomas distintos del persa; el texto latino no está soportado por la voz.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en dispositivos embebidos: con 3,1 MB en fp16 y sin dependencias de PyTorch/ONNX, puede integrarse en firmware o aplicaciones de recursos muy limitados para leer texto en persa.
- Lectura por voz en aplicaciones de escritorio o navegador: el tamaño reducido permite descargar el modelo como un asset estático y ejecutarlo en cliente sin backend de inferencia.
- Servicios de altísima concurrencia: el bajo coste por inferencia (1,57 M de parámetros) permite atender muchos flujos simultáneos en una sola CPU o GPU pequeña.
- Accesibilidad para hablantes de persa: conversión de contenido textual (noticias, artículos, documentación) a audio en entornos sin conectividad o con ancho de banda restringido.
- Prototipado rápido de voces TTS: al estar destilado de un Piper medium, sirve como base para experimentar con la receta sanoTTS y comparar calidad frente al profesor.
- Sistemas de aviso o anuncios automatizados: generación de locuciones cortas en persa dentro de pipelines que ya dispongan de espeak-ng para la fonemización.
- Investigación en destilación de TTS: el paquete incluye manifiesto con hashes SHA-256 por tensor, útil para reproducibilidad y auditoría del proceso de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay pruebas de escucha formales ni métricas publicadas, y que la calidad se juzgó de oído contra el profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en fp16 (3,1 MB); el consumo real vendrá dominado por el runtime y los buffers de audio.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) sin presión de memoria.
- Cabe en consumer GPU: sí, con margen amplísimo; también en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: el formato `roota.raw-fp16.v1` no es estándar; requiere el runtime de sanoTTS (https://github.com/Ampixa/sanoTTS) o un cargador propio que lea `manifest.json`. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI (orientados a LLM). La fonemización requiere espeak-ng con voz `fa`.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sanoTTS-fa-gyro | 1,57 M | Secuencia de fonemas Piper | Persa | other (sin definir) | `roota.raw-fp16.v1` |
| Piper `fa_IR-gyro-medium` (profesor) | No disponible (Piper medium) | Secuencia de fonemas Piper | Persa | No disponible | Piper/ONNX |
| Piper `fa_IR` estándar (voces oficiales) | No disponible | Secuencia de fonemas Piper | Persa | No disponible | Piper/ONNX |
| VITS multilingüe genérico | Decenas de millones | Secuencia de fonemas | Múltiples | Variable | PyTorch/ONNX |

La comparación cuantitativa con alternativas no está disponible: la model card no publica parámetros del profesor ni métricas comparativas, y no se han encontrado datos de rendimiento de las voces Piper oficiales en la información proporcionada.

## Limitaciones y advertencias

- Licencia sin definir: el campo `license: other` acompaña a un TODO del autor para elegir licencia; no hay garantía de uso comercial hasta que se aclare.
- Corpus de entrenamiento sin fuente ni licencia declaradas (TODO en la model card), lo que impide evaluar la procedencia y los derechos de los datos.
- Entrenado con frases mayoritariamente largas (7-8 s); las locuciones muy cortas (p. ej. "سلام") no se evaluaron y pueden ser más débiles.
- Monohablante y monolingüe: no soporta otros idiomas ni texto latino; los marcadores de cambio de idioma de espeak-ng deben eliminarse manualmente.
- El mapa de ids solo contiene puntuación ASCII; es necesario convertir previamente `،`, `؟` y `؛` a `,`, `?` y `;`.
- Sin pruebas de escucha formales ni métricas publicadas; la calidad se validó solo de oído contra el profesor.
- Riesgo de alucinación acústica y artefactos en entradas fuera de distribución (texto con números complejos, siglas o préstamos), al depender de espeak-ng para la normalización.
- Ecosistema mínimo: cero descargas y cero likes en el momento de la publicación; el formato de pesos es propietario y requiere el runtime de sanoTTS.
- No apto para tareas de razonamiento, código, visión o agentes: es exclusivamente un modelo TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gyroing/sanoTTS-fa-gyro
- Receta y herramientas de destilación sanoTTS: https://github.com/Ampixa/sanoTTS
- Documentación de la receta de destilación: https://github.com/Ampixa/sanoTTS/blob/main/docs/distillation-recipe.md
- Piper (proyecto del profesor): https://github.com/OHF-Voice/piper1-gpl
- espeak-ng (fonemizador requerido): https://github.com/espeak-ng/espeak-ng
