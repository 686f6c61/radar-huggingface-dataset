# Konstantinos/tiny-voca-gr

## Resumen

tiny-voca-gr es un modelo de síntesis de voz (text-to-speech) para griego moderno desarrollado por el autor independiente Konstantinos. Se trata de una adaptación de la arquitectura tiny-voca, un diseño compacto de aproximadamente 4,53 millones de parámetros, reentrenado desde inicialización aleatoria (sin partir de los pesos ingleses originales) sobre el corpus griego STOMA. El modelo ofrece dos voces fijas, masculina (`M`) y femenina (`F`), y genera formas de onda de audio a partir de texto griego fonemizado mediante eSpeak NG.

Su relevancia radica en su tamaño extremadamente reducido, que lo hace viable para inferencia en CPU y en dispositivos con recursos limitados, algo poco habitual en el ecosistema TTS, dominado por modelos de cientos de millones de parámetros. La ficha se publica con licencia CC BY 4.0 para los pesos y Apache-2.0 para el código de inferencia, lo que facilita su reutilización y adaptación.

El checkpoint liberado (`inference.pt`) corresponde al paso 104.000 de entrenamiento. No se han publicado evaluaciones formales de escucha ni resultados de benchmarks estándar; las únicas métricas disponibles son diagnósticos internos de validación (pérdida mel, pérdida STFT y error de tono).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (adaptación para griego; TTS neuronal con entrenamiento adversario de forma de onda) |
| Parametros totales | 4,53 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | griego moderno (`el`) |
| Licencia | CC BY 4.0 (pesos); Apache-2.0 (código de inferencia) |
| Formato de pesos | PyTorch (`inference.pt`) |

## Arquitectura y entrenamiento

El modelo adapta la arquitectura tiny-voca, un diseño TTS compacto de unos 4,5 millones de parámetros que upstream distribuye bajo Apache-2.0. La variante griega se entrenó desde inicialización aleatoria, sin transferencia de los pesos ingleses, e incorpora un frontend específico que convierte texto griego en fonemas mediante eSpeak NG (versión 1.51). El entrenamiento incluyó entrenamiento adversario sobre la forma de onda a partir del paso 8.000 y se extendió hasta los 104.000 pasos.

Los datos provienen del corpus STOMA (revisión `fcb947d49abd2736701d8ce3786136812bac85fa`), restringido a los hablantes principales `M` y `F`. Tras filtrar enunciados con fonemas no soportados o longitud de tokens excesiva, el conjunto anotado final quedó en 7.343 grabaciones de entrenamiento, 392 de validación y 407 de test. En validación final, con prosodia predicha por el modelo, se registraron pérdida mel de 0,575, pérdida STFT de 1,315 y error de tono de 1,26 semitonos; el autor advierte que son diagnósticos específicos de la receta y no una puntuación de escucha humana.

## Capacidades

- Síntesis de voz a partir de texto griego moderno, con salida en forma de onda (WAV) a la frecuencia de muestreo configurada en el modelo.
- Dos voces fijas seleccionables: `M` (masculina) y `F` (femenina).
- Fonemización de texto griego mediante eSpeak NG, con normalización previa del texto (`normalize_text`).
- Procesamiento por frases (`sentences`) para textos de longitud arbitraria.
- Inferencia en CPU (`device="cpu"` en el ejemplo oficial) y, por extensión de la librería, en otros dispositivos PyTorch.
- No soporta clonación de voz: las voces son fijas.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenido griego en aplicaciones de accesibilidad: integración en lectores de pantalla o asistentes de lectura que conviertan artículos, correos o documentos en griego a audio, aprovechando que el modelo cabe en CPU y no requiere GPU dedicada.
- Generación de avisos y locuciones para sistemas de megafonía o transporte: el modelo puede sintetizar anuncios pregrabados en griego con dos voces distintas, con latencia baja por su reducido tamaño.
- Prototipado de asistentes conversacionales en griego: uso como capa TTS en pipelines de voz (ASR + LLM + TTS) para demos y entornos de desarrollo donde el coste computacional es crítico.
- Producción de audiolibros o pódcasts de bajo coste: segmentación del texto en frases y síntesis por lotes con la voz `F` o `M`, adecuada para contenido no crítico que no requiera voces expresivas.
- Aprendizaje de griego moderno: generación de pronunciaciones de referencia para vocabulario y frases, con la advertencia de que la pronunciación depende de las reglas de eSpeak y puede fallar en abreviaturas, números o mezclas de alfabetos.
- Investigación en TTS de bajos recursos: base compacta y reproducible para experimentos de adaptación a otros idiomas o corpus, dado su tamaño y su licencia permisiva para los pesos.
- Integración en dispositivos embebidos o edge: al tener 4,53 M de parámetros, es candidato para despliegue en hardware con memoria limitada, siempre que se instale eSpeak NG y el adaptador griego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta diagnósticos internos de validación:

| Metrica (validacion, prosodia predicha) | Valor |
|---|---|
| Perdida mel | 0,575 |
| Perdida STFT | 1,315 |
| Error de tono | 1,26 semitonos |

Estos valores son específicos de la receta de entrenamiento y no equivalen a una evaluación de calidad percibida; no se ha publicado ninguna prueba de escucha formal.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4,53 M de parámetros, los pesos en FP32 ocupan aproximadamente 18 MB, por lo que la inferencia cabe holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el ejemplo oficial funciona en CPU. Cualquier GPU con soporte PyTorch (por ejemplo, RTX 3060 o superior) sería más que suficiente, aunque no aporta una ventaja crítica frente a CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual, e incluso en entornos sin GPU.
- Opciones de despliegue: inferencia directa con PyTorch mediante el paquete `tiny_voca_gr` instalado desde el repositorio de Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. La API de inferencia alojada de Hugging Face no sirve automáticamente este código de inferencia personalizado.
- Latencia y throughput: no disponibles. El tamaño del modelo sugiere latencias bajas en CPU, pero no se aportan cifras.

Requisito adicional: Python 3.11 o 3.12 y eSpeak NG instalado. El adaptador griego comprueba la salida completa de versión de eSpeak, incluida la ruta de datos; una instalación distinta de la usada en entrenamiento (`eSpeak NG text-to-speech: 1.51  Data at: /usr/lib/x86_64-linux-gnu/espeak-ng-data`) puede fallar la comprobación de compatibilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-voca-gr | 4,53 M | Griego | 2 fijas (M/F) | CC BY 4.0 (pesos), Apache-2.0 (codigo) | Hugging Face |
| tiny-voca (upstream) | ~4,5 M | Ingles (principalmente) | no disponible | Apache-2.0 | GitHub / Hugging Face |
| Alternativas TTS multilingues de gran tamano | no disponible | Multiples | Multiples o clonacion | variable | variable |

No se dispone de datos de rendimiento comparativo entre tiny-voca-gr y otras alternativas TTS, por lo que la comparación se limita a parámetros, idioma, voces y licencia. No se han identificado en la información proporcionada otros modelos TTS específicos para griego con los que contrastarlo.

## Limitaciones y advertencias

- Voces fijas: no permite clonar una voz suministrada por el usuario.
- Pronunciación dependiente de eSpeak NG: texto mixto latino y griego, abreviaturas, números y grafías poco habituales pueden pronunciarse incorrectamente.
- Sin evaluación de escucha formal: la calidad percibida no está validada por oyentes humanos; las métricas publicadas son diagnósticos internos.
- Dependencia estricta del entorno: la comprobación de versión y ruta de datos de eSpeak NG puede romper la inferencia en instalaciones distintas a la de entrenamiento.
- Cobertura limitada del corpus: entrenado solo con los hablantes principales `M` y `F` de STOMA, lo que restringe la variedad prosódica y de estilos.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos o prosodia incorrecta en entradas fuera de distribución.
- Sesgos: no se documentan sesgos específicos, pero el modelo hereda las características demográficas y de grabación de los dos hablantes del corpus.
- Licencia: los pesos son CC BY 4.0, lo que permite uso comercial con atribución a Konstantinos y enlace al repositorio, indicando si se han modificado; el código de inferencia es Apache-2.0. No se incluyen audio, transcripciones ni manifiestos de entrenamiento de STOMA en el repositorio.
- No apto para aplicaciones de seguridad crítica ni para sustituir evaluaciones profesionales de calidad de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Konstantinos/tiny-voca-gr
- Checkpoint: https://huggingface.co/Konstantinos/tiny-voca-gr/resolve/main/inference.pt
- Dataset STOMA: https://huggingface.co/datasets/aangelakis/STOMA
- Repositorio upstream tiny-voca: https://github.com/n4ze3m/tiny-voca
- Muestras de audio femeninas: https://huggingface.co/Konstantinos/tiny-voca-gr/resolve/main/sample-f.wav y https://huggingface.co/Konstantinos/tiny-voca-gr/resolve/main/sample-f-2.wav
- Muestras de audio masculinas: https://huggingface.co/Konstantinos/tiny-voca-gr/resolve/main/sample-m.wav y https://huggingface.co/Konstantinos/tiny-voca-gr/resolve/main/sample-m-2.wav
