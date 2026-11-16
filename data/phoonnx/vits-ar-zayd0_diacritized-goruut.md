# Phoonnx/vits-ar-zayd0_diacritized-goruut

## Resumen

vits-ar-zayd0_diacritized-goruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de neurlang/piper-onnx-zayd0-arabic-diacritized, desarrollado por Neurlang, y ha sido adaptado para funcionar con el pipeline de Phoonnx y la librería de conversión de texto scriptconv. Está especializado en árabe diacritizado, es decir, texto árabe con marcas vocálicas completas (harakat), lo que permite una pronunciación precisa al eliminar la ambigüedad vocálica inherente al árabe sin diacríticos.

El modelo resuelve el problema de la síntesis de voz en árabe con control fonético fino: al requerir texto diacritizado y utilizar el fonemizador Goruut sobre alfabeto IPA, produce una salida de audio con pronunciación determinista y predecible. Es relevante para aplicaciones de accesibilidad, lectura de textos coránicos o educativos, y sistemas de voz en árabe donde la precisión fonética es crítica.

Se distribuye en formato ONNX con un tamaño de repositorio de 0,1 GB, licencia MIT y está integrado en el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx. Su adopción actual es muy limitada (0 descargas, 0 likes en el momento de la consulta), lo que indica que es un modelo reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | árabe (ar), con entrada de texto diacritizado |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas goruut sobre alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. Genera audio directamente a partir de texto sin necesidad de un vocoder externo, lo que simplifica el despliegue. El modelo se distribuye como grafo ONNX optimizado para inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino. El modelo original de Neurlang fue entrenado para árabe diacritizado y posteriormente convertido a ONNX y empaquetado por Phoonnx. La innovación principal es el uso del fonemizador Goruut sobre alfabeto IPA como front-end de texto, que normaliza y convierte el texto árabe diacritizado en fonemas antes de la síntesis, garantizando una correspondencia fonética controlada.

## Capacidades

- Síntesis de voz en árabe a partir de texto diacritizado (con harakat).
- Conversión de texto a fonemas IPA mediante el fonemizador Goruut de scriptconv.
- Generación de audio en formato WAV mediante la API de Phoonnx.
- Integración con el ecosistema OVOS a través del plugin ovos-tts-plugin-phoonnx.
- Ejecución sobre ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de textos coránicos y material educativo: el modelo requiere texto diacritizado, lo que encaja con textos árabes vocalizados donde la pronunciación correcta es esencial; se usaría pasando el texto con harakat al sintetizador para obtener audio con pronunciación determinista.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que dispongan de texto árabe diacritizado, generando audio en tiempo de ejecución mediante ONNX Runtime en el dispositivo del usuario.
- Asistentes de voz en árabe sobre OVOS: el plugin ovos-tts-plugin-phoonnx permite seleccionar esta voz en la configuración de Mycroft/OVOS, habilitando respuestas habladas en árabe en asistentes domésticos.
- Aplicaciones de aprendizaje de árabe: generación de audio de referencia para estudiantes, ya que la entrada diacritizada fuerza una pronunciación concreta y reproducible.
- Sistemas de anuncios y avisos automatizados: síntesis de mensajes cortos en árabe en entornos de atención al público, con despliegue ligero gracias al tamaño de 0,1 GB y formato ONNX.
- Generación de audiolibros en árabe diacritizado: procesamiento por lotes de textos vocalizados para producir narraciones, usando la API de Phoonnx en Python para escribir archivos WAV.
- Pruebas de integración en pipelines de TTS multilingüe: incorporación como voz árabe en sistemas que ya usan Phoonnx para otras lenguas, aprovechando la gestión unificada de voces del TTSModelManager.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en menos de 1 GB de memoria en formato ONNX.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeño, puede ejecutarse en CPU y en GPU consumer (RTX 3060, RTX 4090, etc.) sin problemas previsibles.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño reducido del repositorio.
- Opciones de despliegue: ONNX Runtime a través de Phoonnx (Python) y el plugin ovos-tts-plugin-phoonnx para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ar-zayd0_diacritized-goruut | VITS | Árabe diacritizado | ONNX | MIT | Fonemas goruut (IPA) | Hugging Face, Phoonnx |
| neurlang/piper-onnx-zayd0-arabic-diacritized | VITS (Piper) | Árabe diacritizado | ONNX | MIT | Texto diacritizado | Hugging Face (upstream) |
| Otros modelos VITS de la colección Phoonnx | VITS | Varios | ONNX | Variable | Variable | Hugging Face, Phoonnx |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Requiere texto de entrada diacritizado; el árabe sin harakat puede producir pronunciaciones incorrectas o fallos en el fonemizador.
- Depende del fonemizador Goruut y de la librería scriptconv, lo que añade dependencias específicas (scriptconv[goruut]) y puede limitar la portabilidad.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- No se han publicado métricas de calidad (MOS, WER) ni benchmarks objetivos.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí puede haber artefactos acústicos o pronunciaciones erróneas en textos fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (neurlang/piper-onnx-zayd0-arabic-diacritized) y de los datos de entrenamiento originales.
- No soporta SSML avanzado, control de prosodia ni emociones, según la información disponible.
- Al ser un modelo TTS, no ofrece capacidades de razonamiento, código ni visión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ar-zayd0_diacritized-goruut
- Modelo upstream: https://huggingface.co/neurlang/piper-onnx-zayd0-arabic-diacritized
- Repositorio Phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
