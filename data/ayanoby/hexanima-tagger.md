# ayanoby/hexanima-tagger

## Resumen

HexAnima Tagger es una conversión del modelo de etiquetado de imágenes SmilingWolf/wd-eva02-large-tagger-v3 a un binario de contexto QNN para la NPU Hexagon de Qualcomm. Lo publica el desarrollador ayanoby como componente de su aplicación Android HexAnima (https://github.com/ayanoby/hexanima), donde se utiliza para la función "Tags from a picture": dado un archivo de imagen, el modelo devuelve probabilidades para 10.861 etiquetas del vocabulario de Danbooru. No es un modelo nuevo ni un fine-tune de pesos: es una conversión de despliegue de los pesos originales (licencia Apache-2.0) a un formato ejecutable únicamente en hardware móvil concreto.

La arquitectura subyacente es EVA02-Large, un transformer de visión con atención, adaptado como clasificador multi-etiqueta sobre el vocabulario de Danbooru. La entrada es un tensor de `[1, 448, 448, 3]` en formato BGR float 0..255, con la imagen rellenada a cuadrado con blanco; la salida son 10.861 probabilidades de etiqueta. El binario ocupa 674 MB y se ejecuta en fp16 sobre Hexagon V69 (Snapdragon 8 Gen 1 y 8+ Gen 1), con un tiempo de inferencia de aproximadamente 3 segundos en el teléfono.

Su relevancia es acotada pero concreta: demuestra un flujo de conversión de un tagger de imágenes a NPU móvil con `qairt-converter` y `qnn-context-binary-generator`, con una fidelidad numérica verificada frente a onnxruntime fp32 (diferencia máxima de probabilidad de 0,0014 y etiquetas idénticas). Para desarrolladores que quieran replicar el proceso o integrar el tagger en Android, es una referencia práctica; para cualquier otro uso, el binario no es portable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EVA02-Large (transformer de visión) como clasificador multi-etiqueta; convertido a QNN HTP context binary |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija `[1, 448, 448, 3]`) |
| Tipos de cuantización | fp16 (conversión QNN); el original se distribuye en otros formatos, no detallados aquí |
| Idiomas soportados | no disponible (las etiquetas de Danbooru son mayoritariamente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | QNN context binary (`.bin`); incluye `selected_tags.csv` con el orden de salida |

## Arquitectura y entrenamiento

El modelo base es SmilingWolf/wd-eva02-large-tagger-v3, un tagger de Danbooru construido sobre EVA02-Large. EVA02 es una familia de transformers de visión con atención y destilación desde un modelo CLIP; en esta variante se usa como extractor de características para una cabeza de clasificación multi-etiqueta sobre el vocabulario de etiquetas de Danbooru. La información disponible no detalla el número de parámetros, el volumen de tokens de entrenamiento ni la composición exacta del dataset; esos datos corresponden a la model card del modelo original, no incluida aquí.

La contribución de este repositorio es la conversión de despliegue: los pesos se convierten con `qairt-converter` (batch fijado a 1, fp16) y se empaquetan con `qnn-context-binary-generator` en un binario de contexto QNN para Hexagon V69. El resultado se valida contra onnxruntime en fp32 sobre la misma imagen: diferencia máxima de probabilidad de 0,0014 y conjunto de etiquetas idéntico. El autor advierte explícitamente de que el binario solo funciona en esa generación de chip y no es un modelo ONNX general.

## Capacidades

- Etiquetado multi-etiqueta de imágenes: devuelve 10.861 probabilidades de etiqueta del vocabulario de Danbooru para una imagen de entrada.
- Preprocesado definido: entrada `[1, 448, 448, 3]` BGR float 0..255, imagen rellenada a cuadrado con blanco.
- Ejecución en NPU móvil: inferencia fp16 sobre Hexagon V69 (Snapdragon 8 Gen 1 / 8+ Gen 1), con unos 3 segundos por imagen en el teléfono.
- Integración en aplicación Android: pensado para la función "Tags from a picture" de HexAnima.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de visión, no un modelo generativo.
- Capacidades multilingües: no disponibles; las etiquetas de salida son las del vocabulario de Danbooru.

## Casos de uso

- Etiquetado automático de imágenes en Android: la app HexAnima usa el binario para extraer etiquetas de una foto seleccionada por el usuario; es el caso de uso para el que se publicó y el único documentado por el autor.
- Organización y búsqueda de bibliotecas de imágenes: las 10.861 probabilidades de etiqueta permiten indexar imágenes por contenido y filtrar por etiquetas en una aplicación móvil, con inferencia local sin conexión.
- Preetiquetado para anotación de datasets: usar las etiquetas de mayor probabilidad como propuesta inicial que un anotador humano revisa, reduciendo el trabajo manual en corpus de estilo Danbooru.
- Filtrado y moderación de contenido en el dispositivo: las etiquetas permiten aplicar reglas locales sobre categorías del vocabulario sin enviar imágenes a un servidor, algo relevante por privacidad.
- Referencia para portar taggers a NPU: el flujo `qairt-converter` + `qnn-context-binary-generator` documentado aquí sirve de plantilla para convertir otros modelos de visión a Hexagon, con la validación numérica frente a onnxruntime como método de control.
- Prototipado de funciones de visión en apps móviles: al ejecutarse en la NPU con unos 3 segundos por imagen, encaja en flujos interactivos de una app donde no se requiere tiempo real estricto.
- Pruebas de fidelidad de cuantización: comparar las salidas del binario QNN con onnxruntime fp32 sobre un conjunto de imágenes permite evaluar la pérdida introducida por la conversión a fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una comparación de fidelidad frente a onnxruntime fp32 sobre la misma imagen: diferencia máxima de probabilidad de 0,0014 y etiquetas idénticas. El tiempo de inferencia indicado es de aproximadamente 3 segundos en el teléfono (Snapdragon 8 Gen 1 / 8+ Gen 1).

## Requisitos de hardware

- NPU: Hexagon V69 exclusivamente (Snapdragon 8 Gen 1 y 8+ Gen 1). El autor indica que solo funciona en esa generación de chip.
- VRAM: no aplica; el modelo se ejecuta en la NPU del SoC móvil. El binario ocupa 674 MB en disco.
- GPU de escritorio: no compatible; no es un modelo ONNX ni un checkpoint estándar, por lo que no se puede cargar en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no, por formato; el binario no es ejecutable fuera de la NPU Hexagon V69.
- Opciones de despliegue: QNN (Qualcomm AI Engine Direct) dentro de la app Android HexAnima; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 3 segundos por imagen en el teléfono. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ayanoby/hexanima-tagger | EVA02-Large convertido a QNN para Hexagon V69 | no disponible | no aplica (entrada 448x448) | Apache-2.0 | Binario solo para Snapdragon 8 Gen 1 / 8+ Gen 1 |
| SmilingWolf/wd-eva02-large-tagger-v3 | Tagger de Danbooru sobre EVA02-Large, formato estándar | no disponible en esta información | no aplica | Apache-2.0 | Pesos estándar, ejecutables con frameworks de inferencia convencionales |
| Otros taggers de la familia WD de SmilingWolf | Taggers de Danbooru sobre distintas arquitecturas | no disponible | no aplica | Apache-2.0 (según familia) | Pesos estándar |

La comparación relevante es con el modelo original: mismos pesos y mismas etiquetas, pero distinto formato de despliegue. El binario QNN gana en ejecución sobre NPU móvil y pierde toda portabilidad; el modelo original es la opción para servidor o escritorio.

## Limitaciones y advertencias

- Portabilidad nula: el binario solo se ejecuta en Hexagon V69 (Snapdragon 8 Gen 1 / 8+ Gen 1); no es un modelo ONNX general y no funciona en otras NPU, GPU o CPU.
- Vocabulario específico: las 10.861 etiquetas provienen de Danbooru, con la distribución y los sesgos de ese corpus; el modelo puede etiquetar de forma poco fiable contenido fuera de ese dominio.
- Entrada rígida: exige `[1, 448, 448, 3]` BGR float 0..255 con relleno blanco a cuadrado; cualquier desviación en el preprocesado altera las salidas.
- Sesgos: no documentados en la información disponible; al heredarse del dataset de Danbooru, es razonable esperar sesgos propios de ese corpus, pero no hay análisis publicado en esta ficha.
- Alucinación: al ser un clasificador multi-etiqueta, el riesgo se traduce en falsos positivos de etiquetas con probabilidad baja; no hay umbral recomendado documentado.
- Licencia: Apache-2.0, que permite uso comercial; el autor recuerda que es una copia modificada (convertida) de los pesos originales de SmilingWolf y remite al archivo `LICENSE`.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay señales de uso en producción más allá de la propia app HexAnima.
- Idiomas: no disponible; las etiquetas están en inglés y no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayanoby/hexanima-tagger
- Modelo base: https://huggingface.co/SmilingWolf/wd-eva02-large-tagger-v3
- Repositorio de la app HexAnima: https://github.com/ayanoby/hexanima
