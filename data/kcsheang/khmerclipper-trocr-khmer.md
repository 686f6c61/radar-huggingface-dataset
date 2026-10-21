# kcsheang/khmerclipper-trocr-khmer

## Resumen

kcsheang/khmerclipper-trocr-khmer es un modelo de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto en jemer (khmer), inglés y líneas mixtas jemer/inglés. Es un fine-tuning de microsoft/trocr-base-printed, con arquitectura vision-encoder-decoder, 334.074.368 parámetros y un tokenizador adaptado para que cada carácter jemer se represente como un único token. El modelo forma parte de KhmerClipper, una aplicación de OCR de pantalla que se ejecuta en local.

El modelo resuelve un problema concreto: la transcripción fiable de líneas de texto en jemer, un idioma con poca cobertura en herramientas OCR convencionales. Según la model card, mejora de forma clara a Tesseract 5 con los idiomas khm+eng en un conjunto fijo de 200 imágenes de línea, especialmente en texto impreso, capturas de interfaz y líneas mixtas. Está pensado para inferencia línea a línea, no para analizar páginas completas ni maquetación.

La relevancia actual está en su enfoque práctico: pesos PyTorch en safetensors listos para inferencia o fine-tuning, un exporto ONNX para aplicaciones de escritorio y resultados publicados en ejecuciones CoreML sobre Apple Silicon. Su ventana de salida está limitada a 128 tokens, lo que condiciona el uso a líneas cortas o a la segmentación previa de párrafos e imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR) |
| Modelo base | microsoft/trocr-base-printed |
| Parametros totales | 334.074.368 |
| Longitud de contexto | 128 tokens (límite de etiquetas durante el entrenamiento; el ejemplo de uso emplea max_new_tokens=128) |
| Tipos de cuantizacion | no disponible; se publican pesos safetensors y un exporto ONNX en un repositorio aparte |
| Idiomas soportados | jemer (km), inglés (en) y líneas mixtas km/en |
| Licencia | MIT para el modelo; los datasets de entrenamiento tienen licencias propias, algunas no declaradas |
| Formato de pesos | safetensors (PyTorch); ONNX en kcsheang/khmerclipper-trocr-khmer-onnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR de tipo vision-encoder-decoder: un codificador visual procesa la imagen de una línea de texto y un decodificador textual genera la transcripción. Se parte de microsoft/trocr-base-printed y se ajusta con datos adicionales. El tokenizador mantiene el BPE byte-level del modelo base y añade un token por cada carácter jemer de los rangos U+1780–17FF y U+19E0–19FF, además de los separadores de ancho cero. Así, cada carácter jemer ocupa un token en lugar de tres bytes. Las etiquetas se limitaron a 128 tokens.

El entrenamiento combina datasets públicos de líneas OCR de Hugging Face con tres conjuntos renderizados localmente con fuentes OFL de Google: 400.000 líneas multiformato en jemer y mixtas, 150.000 líneas limpias en inglés con texto de Wikipedia en inglés (CC BY-SA 4.0) y 204.000 tiras de texto pequeñas de pantalla a 11–24 px. Cada versión se fine-tuneó desde la anterior con una tasa de aprendizaje menor: v1 con 2e-5 y 3 épocas; v2 con 1e-5 y 1 época. La versión publicada es v3 (checkpoint-8, paso 16k), entrenada en una única RTX 3090 con bf16 y Seq2SeqTrainer. No se documentan RLHF ni DPO; es un modelo OCR supervisado.

## Capacidades

- Transcripción OCR de una línea de texto contenida en una imagen RGB.
- Reconocimiento de texto impreso en jemer, inglés y combinaciones de ambos en la misma línea.
- Reconocimiento de texto de pantalla, incluyendo tiras pequeñas de 11–24 px usadas en el entrenamiento.
- Soporte de escritura manuscrita, aunque la propia model card indica que está menos probado que el texto impreso.
- Tokenizador especializado para jemer: un token por carácter jemer y separadores de ancho cero.
- Generación de texto limitada a la transcripción de la línea; no es un modelo generativo general.
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para agentes, razonamiento multi-paso ni planificación.
- No realiza análisis de maquetación, detección de párrafos ni separación automática de líneas.
- Idiomas soportados: jemer e inglés; no se documentan otros idiomas.
- No incorpora visión general, audio ni otras modalidades fuera del OCR de imagen a texto.

## Casos de uso

- OCR de pantalla en local para aplicaciones de escritorio: el modelo es la base de KhmerClipper, que captura la pantalla, divide el contenido en líneas y transcribe cada línea con el exporto ONNX o CoreML. Es adecuado porque está entrenado con texto de interfaz a tamaños pequeños y alcanza un CER de 0,0030 en el subconjunto `ui`.
- Digitalización de documentos impresos en jemer: se escanea la página, se segmenta en líneas y se pasa cada línea al modelo. El CER publicado en el subconjunto `printed` es 0,0035, aunque este dato es optimista porque esas imágenes provienen del split de test de SoyVitou.
- Extracción de texto de capturas de aplicaciones y sitios web: útil para buscar, copiar o indexar texto jemer en entornos donde no hay selección de texto. El modelo maneja líneas mixtas jemer/inglés con un CER de 0,0046 en el subconjunto `mixed`.
- Preprocesado de corpus para NLP en jemer: transcripción de líneas de imágenes para construir datasets de texto que después se usen en traducción, búsqueda o análisis lingüístico. Requiere un paso previo de segmentación de líneas.
- Procesamiento de formularios y recibos con líneas cortas: el límite de 128 tokens y el enfoque línea a línea encajan con campos de una sola línea o con bloques previamente recortados.
- Transcripción asistida de manuscritos jemeres: el modelo incluye un dataset manuscrito de 4.200 imágenes y soporta escritura manual, pero la propia model card advierte que está menos probado; conviene usarlo con revisión humana.
- Fine-tuning para un dominio concreto: el checkpoint carga en el flujo estándar de VisionEncoderDecoderModel y Seq2SeqTrainer, por lo que se puede adaptar a fuentes, ruidos o tipos de documento específicos. La model card recomienda mezclar datos originales para evitar olvido catastrófico.

## Benchmarks y rendimiento

Los resultados publicados son de tasa de error de caracteres (CER, menor es mejor) sobre un conjunto fijo de 200 imágenes de línea. Las cifras corresponden a ejecuciones CoreML on-device en Apple Silicon e incluyen el fallback de líneas latinas de la aplicación.

| Motor | Todas | printed | ui | mixed |
|---|---:|---:|---:|---:|
| Tesseract 5 `khm+eng` (stock) | 0,2580 | 0,5370 | 0,0199 | 0,0894 |
| TrOCR antes del fine-tuning con datos nuevos (v0) | 0,0593 | 0,0433 | 0,0662 | 0,0950 |
| Este modelo (v3) | 0,0034 | 0,0035 | 0,0030 | 0,0046 |

En capturas de pantalla renderizadas con Chrome de 1–5 líneas, con fuentes nunca vistas durante el entrenamiento, el CER es 0,027. El dato de `printed` es optimista porque las imágenes de ese subconjunto provienen del split de test de SoyVitou, que el modelo ya vio; los subconjuntos `ui` y `mixed` no estuvieron en ningún dato de entrenamiento.

## Requisitos de hardware

- VRAM estimada solo para pesos, a partir de 334.074.368 parámetros: fp32 ~1,34 GB; fp16/bf16 ~0,67 GB; int8 ~0,33 GB. Hay que añadir margen para activaciones y overhead; no hay una cifra oficial de VRAM total.
- GPU recomendadas: RTX 3060 de 6 GB o superior para fp16 en inferencia línea a línea; RTX 4090, A100 o H100 para lotes grandes o fine-tuning.
- Cabe en GPU consumer: sí, con 4–6 GB o más; también puede ejecutarse en CPU para inferencia de una línea, aunque con mayor latencia.
- Opciones de despliegue documentadas: Transformers con PyTorch, ONNX Runtime mediante el exporto ONNX y CoreML en la aplicación KhmerClipper. No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible. La model card publica CER de ejecuciones CoreML, pero no tiempos por línea ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (todas) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| kcsheang/khmerclipper-trocr-khmer (v3) | 334.074.368 | 128 tokens de etiquetas | 0,0034 | MIT | Hugging Face, ONNX y CoreML |
| Tesseract 5 `khm+eng` (stock) | no disponible | no aplica | 0,2580 | no disponible | software local |
| TrOCR base antes del fine-tuning con datos nuevos (v0) | no disponible | no disponible | 0,0593 | no disponible | microsoft/trocr-base-printed en Hugging Face |

La comparación directa disponible se limita a estos tres motores. Frente a Tesseract 5, el modelo reduce el CER de 0,2580 a 0,0034 en el conjunto evaluado, con una mejora especialmente grande en texto impreso (0,5370 a 0,0035). Frente al TrOCR base sin los datos nuevos, pasa de 0,0593 a 0,0034. No se proporcionan comparaciones con otros modelos OCR jemeres en la información disponible.

## Limitaciones y advertencias

- Solo procesa una línea de texto cada vez; no hace análisis de maquetación ni separación automática de párrafos.
- Es más fuerte en texto impreso y de pantalla; la escritura manuscrita está soportada pero menos probada.
- Las líneas mucho más anchas que aproximadamente 12 veces su altura deben decodificarse por partes.
- El límite de 128 tokens de etiquetas obliga a segmentar líneas largas o párrafos completos.
- El CER de `printed` es optimista porque ese subconjunto proviene del split de test de SoyVitou y el modelo ya lo vio; los datos de `ui` y `mixed` son más representativos de una evaluación limpia.
- Los CER publicados incluyen el fallback de líneas latinas de la aplicación KhmerClipper, no solo la salida del modelo.
- Puede producir transcripciones plausibles pero incorrectas en imágenes con ruido, baja resolución, fuentes muy poco habituales o diacríticos jemeres complejos; conviene validar en producción.
- Solo cubre jemer e inglés; no se documentan otros idiomas.
- La licencia del modelo es MIT, pero los datasets de entrenamiento tienen licencias propias: algunas son MIT o CC-BY-4.0 y otras no están declaradas. Antes de un uso comercial conviene revisar la tabla de datasets del repositorio.
- No es un modelo de lenguaje general: no soporta tool calling, agentes ni razonamiento multi-paso.
- No se documentan cuantizaciones GGUF ni despliegue en llama.cpp u Ollama; el formato principal es safetensors y el alternativo es ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kcsheang/khmerclipper-trocr-khmer
- Exporto ONNX: https://huggingface.co/kcsheang/khmerclipper-trocr-khmer-onnx
- Repositorio KhmerClipper: https://github.com/KimChengSHEANG/khmerclipper
- Scripts de entrenamiento TrOCR: https://github.com/KimChengSHEANG/khmerclipper/tree/main/training/trocr
- Documentación del proyecto: https://github.com/KimChengSHEANG/khmerclipper/blob/main/docs/PROJECT.md
- Resultados de evaluación: https://github.com/KimChengSHEANG/khmerclipper/tree/main/training/eval/results
- Tabla de datasets de entrenamiento: https://github.com/KimChengSHEANG/khmerclipper#training-data
- Modelo base: https://huggingface.co/microsoft/trocr-base-printed
