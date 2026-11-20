# ComputationalLinguisticsPlatform/tiny-voca-gr

## Resumen

tiny-voca-gr es un modelo de síntesis de voz (text-to-speech) para griego moderno desarrollado por ComputationalLinguisticsPlatform (autor: Konstantinos Perifanos). Se trata de una adaptación de la arquitectura tiny-voca, un modelo TTS de código abierto de aproximadamente 4,5 millones de parámetros, pero entrenado desde inicialización aleatoria y sin partir de los pesos del modelo original en inglés. El resultado es un checkpoint de 104.000 pasos que genera audio con dos voces fijas, masculina (`M`) y femenina (`F`).

El modelo resuelve un problema muy concreto: disponer de un TTS ligero, de bajo coste computacional y específico para griego, un idioma con relativamente pocos recursos en el ecosistema de síntesis de voz. Su tamaño reducido (4,53M de parámetros) permite inferencia en CPU, lo que lo hace adecuado para despliegues en entornos con recursos limitados. Utiliza el fonemizador de eSpeak NG para griego como frontend lingüístico.

Su relevancia radica en la combinación de tamaño mínimo, licencia permisiva (CC BY 4.0) y soporte nativo de griego moderno con dos voces. No obstante, es un modelo de nicho, con cero descargas y sin evaluación formal por escucha publicada, por lo que debe considerarse un artefacto de investigación más que un sistema listo para producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (TTS neuronal ligero, adaptación de la arquitectura original) |
| Parametros totales | 4,53 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | griego moderno (el) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`inference.pt`) |

## Arquitectura y entrenamiento

El modelo adapta la arquitectura tiny-voca, un sistema de síntesis de voz de muy bajo parámetro count (4,5M en el original inglés). Se entrenó desde inicialización aleatoria, sin transferencia desde los pesos ingleses, lo que implica que toda la capacidad del modelo se aprendió específicamente sobre datos griegos. El frontend lingüístico emplea el fonemizador de griego de eSpeak NG; el adaptador griego verifica la versión completa de eSpeak almacenada en el checkpoint, incluida la ruta de datos, por lo que instalaciones distintas pueden fallar la comprobación de compatibilidad aunque reporten eSpeak NG 1.51.

Los datos de entrenamiento provienen del corpus STOMA (revisión `fcb947d49abd2736701d8ce3786136812bac85fa`), restringido a los hablantes principales `M` y `F`. Tras filtrar enunciados con fonemas no soportados o longitud excesiva de tokens, los conjuntos anotados quedaron en 7.343 grabaciones de entrenamiento, 392 de validación y 407 de test. El entrenamiento duró 104.000 pasos, con entrenamiento adversarial sobre la forma de onda a partir del paso 8.000. La validación final (prosodia predicha por el modelo) reporta mel loss de 0,575, STFT loss de 1,315 y error de pitch de 1,26 semitonos; son diagnósticos específicos de la receta, no una puntuación de escucha humana.

## Capacidades

- Síntesis de voz (text-to-speech) para griego moderno a partir de texto.
- Dos voces fijas: masculina (`M`) y femenina (`F`).
- Generación de audio en formato WAV con frecuencia de muestreo definida en la configuración del modelo (`model.config.sample_rate`).
- Procesamiento por frases mediante la función `sentences`, que permite dividir texto largo en unidades sintetizables.
- Normalización de texto griego mediante `normalize_text`.
- Inferencia en CPU y GPU (el ejemplo oficial usa `device="cpu"`).
- No soporta clonación de voz: las voces son fijas.
- No dispone de tool calling, agentes ni razonamiento multi-paso (no aplica a un TTS).
- Capacidad multilingüe: no; únicamente griego.
- No incluye modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en griego para accesibilidad: convertir artículos, documentos o noticias en audio para usuarios con discapacidad visual o dificultades de lectura, aprovechando la inferencia en CPU y el tamaño reducido del modelo.
- Asistentes de voz embebidos en griego: integrar el modelo en dispositivos con recursos limitados (Raspberry Pi, sistemas empotrados) donde un TTS de 4,53M de parámetros es viable frente a modelos de cientos de millones.
- Audiolibros y pódcast automatizados en griego: sintetizar texto largo dividiéndolo en frases con la función `sentences` y alternando las voces `M` y `F` para dar variedad.
- Sistemas de navegación o avisos por voz en griego: generar indicaciones cortas y repetibles con baja latencia en local, sin depender de APIs en la nube.
- Prototipado de interfaces conversacionales en griego: usar el modelo como capa de salida de voz en pipelines de diálogo, dado su bajo coste y licencia permisiva para experimentación.
- Investigación en TTS de bajos recursos: servir como baseline ligero para griego en estudios comparativos de síntesis, al estar entrenado desde cero y documentar sus métricas de validación.
- Generación de material didáctico de griego moderno: producir ejemplos de pronunciación con dos voces para cursos o aplicaciones de aprendizaje de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, MCD, WER de ASR sobre audio sintetizado, etc.) en la información disponible. La model card únicamente reporta diagnósticos de validación internos:

| Metrica (validacion) | Valor |
|---|---|
| Mel loss | 0,575 |
| STFT loss | 1,315 |
| Error de pitch | 1,26 semitonos |
| Evaluacion formal por escucha | no disponible |

Estos valores son específicos de la receta de entrenamiento y no equivalen a una puntuación de calidad percibida por humanos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,53M de parámetros, el checkpoint cabe holgadamente en cualquier GPU consumer (menos de 1 GB en FP32, aproximadamente 18 MB solo de pesos, más overhead del runtime).
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos empotrados.
- Opciones de despliegue: inferencia nativa con PyTorch mediante el paquete `tiny-voca-gr` instalado desde el repositorio de Hugging Face. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). La Inference API alojada de Hugging Face no sirve este código de inferencia personalizado automáticamente.
- Dependencias: Python 3.11 o 3.12 y eSpeak NG instalado con la versión y ruta de datos compatibles con el checkpoint (eSpeak NG 1.51 con datos en `/usr/lib/x86_64-linux-gnu/espeak-ng-data` en el entrenamiento).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Voces | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-voca-gr | 4,53 M | Griego | 2 fijas (M/F) | CC BY 4.0 | Hugging Face (inferencia local) |
| tiny-voca (original) | ~4,5 M | Inglés | 2 fijas | no disponible en la informacion | GitHub (n4ze3m/tiny-voca) |
| Alternativas TTS multilingues de gran tamano (p. ej. modelos tipo VITS/XTTS) | no disponible | Multiples | Variables | Variables | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La pronunciación depende de las reglas de griego de eSpeak NG; texto mixto latino-griego, abreviaturas, números y grafías inusuales pueden pronunciarse incorrectamente.
- El modelo tiene voces fijas y no clona un hablante proporcionado.
- Solo soporta griego moderno; no es multilingüe.
- El adaptador griego verifica la versión completa de eSpeak NG y su ruta de datos; instalaciones distintas pueden fallar la comprobación de compatibilidad aunque reporten la misma versión.
- No se ha publicado evaluación formal por escucha, por lo que la calidad percibida es desconocida.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta en textos atípicos; no aplica el concepto de alucinación textual de los LLM.
- Sesgos: al entrenarse solo con los hablantes `M` y `F` del corpus STOMA, las voces reflejan las características de esos hablantes y no cubren variedades dialectales ni acentos fuera del corpus.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio citar las fuentes indicadas (Perifanos, STOMA y tiny-voca).
- El repositorio tiene 0 descargas y 0 likes; es un artefacto reciente sin validación comunitaria.
- La Inference API alojada de Hugging Face no sirve este modelo automáticamente; requiere despliegue local del código de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ComputationalLinguisticsPlatform/tiny-voca-gr
- Repositorio tiny-voca original: https://github.com/n4ze3m/tiny-voca
- Dataset STOMA: https://huggingface.co/datasets/aangelakis/STOMA
- Muestras de audio femeninas: https://huggingface.co/ComputationalLinguisticsPlatform/tiny-voca-gr/resolve/main/sample-f.wav y https://huggingface.co/ComputationalLinguisticsPlatform/tiny-voca-gr/resolve/main/sample-f-2.wav
- Muestras de audio masculinas: https://huggingface.co/ComputationalLinguisticsPlatform/tiny-voca-gr/resolve/main/sample-m.wav y https://huggingface.co/ComputationalLinguisticsPlatform/tiny-voca-gr/resolve/main/sample-m-2.wav
