# davanstrien/LightOnOCR-2-1B-no-blank-commentary

## Resumen

LightOnOCR-2-1B-no-blank-commentary es una variante experimental del modelo OCR LightOnOCR-2-1B de LightOn, publicada por Daniel van Strien. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es un experimento de edición de pesos (*weight editing*) sin entrenamiento que elimina un fallo concreto del modelo base. En concreto, cuando LightOnOCR-2-1B se sirve con vLLM, tiende a escribir la frase "There is no content in the provided image to convert into Markdown format…" en páginas en blanco en lugar de no generar nada. Esta copia modifica un 0,13 % de los pesos para corregir ese comportamiento.

El modelo conserva la arquitectura y el tamaño del original: 1.005.647.872 parámetros en formato safetensors (aproximadamente 1B), empaquetados en un repositorio de 2 GB, con licencia Apache 2.0. La edición afecta únicamente a 1.282.748 valores de `mlp.down_proj` en las capas 19 a 23 del decodificador. El resto de archivos (procesador, configuración) son idénticos a la release original del modelo base.

Su relevancia es doble: por un lado, demuestra que es posible corregir fallos de comportamiento específicos modificando directamente los pesos sin reentrenar; por otro, advierte explícitamente de que es un experimento lúdico, no un modelo para producción. El propio autor recomienda usar el modelo base con un filtro de salida si se necesita limpieza de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Mistral 3, según tag `mistral3`) |
| Parametros totales | 1.005.647.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LightOnOCR-2-1B original, etiquetado como `mistral3` en Hugging Face, es decir, un transformer decoder de aproximadamente 1B de parámetros orientado a OCR y conversión de imágenes a Markdown. No se ha realizado ningún entrenamiento adicional: la variante se genera mediante una edición de pesos en frío sobre el checkpoint `c97bd377f04481830395218fa8951df9deaba756` (equivalente a `be7c4131`, el `main` en el momento de la publicación). Todos los archivos salvo `model.safetensors` son idénticos a la release original.

La innovación técnica es el método de edición. Primero se calcula una dirección en el espacio de estados ocultos: la media del estado oculto en la primera posición de salida en páginas en blanco donde el modelo emite la frase, menos la media en páginas en blanco donde no escribe nada, ajustada con páginas de libros BHL fuera del benchmark. Después se identifican, en las capas 19 a 23, las 256 neuronas MLP por capa cuya activación proyecta más sobre esa dirección en páginas con la frase frente a páginas silenciosas. Finalmente, para esas neuronas se invierte la componente de su salida a lo largo de la dirección mediante `W[:, S] ← W[:, S] − 2·u·(uᵀ W[:, S])` sobre `mlp.down_proj`, alterando 1.282.748 valores (0,13 % del total). Como control, una dirección aleatoria del mismo tamaño no produjo efecto en la versión densa de la edición.

## Capacidades

- Conversión de imágenes de documentos a Markdown (OCR), heredada del modelo base LightOnOCR-2-1B.
- Supresión de la frase "There is no content in the provided image to convert into Markdown format…" en páginas en blanco cuando se sirve con vLLM.
- Generación de texto OCR en el mismo rango de idiomas que el modelo base (no especificado en la información disponible).
- No se documentan capacidades de tool calling, function calling, agentes, visión general, audio ni modo de razonamiento explícito.
- El resto de capacidades son las del modelo base, sin modificaciones más allá de la edición descrita.

## Casos de uso

- Investigación sobre edición de pesos: sirve como caso reproducible para estudiar cómo una intervención quirúrgica en neuronas MLP concretas altera un comportamiento específico sin reentrenar. El autor documenta el método, el coste (unos 11 USD en Hugging Face Jobs) y los controles.
- OCR de libros y documentos con páginas en blanco: en pipelines que procesan digitalizaciones completas (por ejemplo, colecciones BHL), evita que las páginas vacías generen texto espurio que contamine el Markdown resultante.
- Evaluación comparativa de motores de inferencia: permite contrastar el comportamiento de vLLM frente a transformers en el mismo modelo, ya que el fallo solo aparece de forma consistente con vLLM 0.26 (40/40 frente a 1/40 en la comprobación del autor).
- Docencia y divulgación técnica: ejemplo práctico de *weight-space programming* para explicar cómo se localizan y modifican direcciones en el espacio de activaciones.
- Prototipado de filtros de salida: sirve para comparar una corrección en pesos frente a un filtro de texto plano, que según el autor elimina más texto no deseado en páginas en blanco.
- Reproducción de experimentos: el flujo completo (recolección de estados ocultos en una GPU L40S y ejecución del benchmark en instancias `a10g-small`, unas 48 minutos por ejecución) es replicable con la guía de Hugging Face Jobs.

## Benchmarks y rendimiento

Resultados sobre el benchmark BHL OCR (2.165 páginas, 26 modelos), con muestreo a temperatura 0,2 y dos ejecuciones por configuración:

| Modelo | CER global | Posición | CER en páginas de texto | Palabras en páginas en blanco |
|---|---|---|---|---|
| Base (fila del leaderboard) | 0,0408 | 14 | 0,0271 | 7.085 |
| Esta edición, ejecución 1 | 0,0333 | 8 | 0,0265 | 4.058 |
| Esta edición, ejecución 2 | 0,0321 | 7 | 0,0263 | 3.454 |

La frase desaparece en las aproximadamente 100 páginas donde el modelo base la escribía. El CER en páginas de texto se mantiene dentro del ruido según un bootstrap emparejado. El autor advierte de que estas filas no son entradas oficiales del leaderboard y que la variabilidad entre ejecuciones es apreciable por el muestreo a temperatura 0,2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.005.647.872 parámetros en safetensors (2 GB de repositorio), la inferencia en precisión completa requiere del orden de 2-4 GB de pesos más overhead de activaciones y KV cache, aunque el dato exacto no se documenta.
- GPU recomendadas: el autor ejecutó el benchmark en instancias `a10g-small` (aproximadamente 48 minutos por ejecución) y usó una L40S para recolectar estados ocultos y ajustar la dirección.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño (1B) es plausible en GPUs consumer con suficiente VRAM, pero no se aporta verificación.
- Opciones de despliegue: vLLM 0.26 es el único motor probado con la edición; el modelo base también se ejecuta con transformers (probado con 5.22.1). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER BHL (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-2-1B (base) | ~1B | no disponible | 0,0408 | Apache 2.0 | Hugging Face |
| LightOnOCR-2-1B-no-blank-commentary | ~1B | no disponible | 0,0333 / 0,0321 | Apache 2.0 | Hugging Face |
| Otros modelos del leaderboard BHL | no disponible | no disponible | 26 modelos evaluados, sin detalle | no disponible | no disponible |

La comparación directa más relevante es con el modelo base, del que solo difiere en 0,13 % de los pesos. No se dispone de datos de otros modelos OCR comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor califica el modelo como "un experimento divertido, no un modelo para uso real".
- No elimina las descripciones del tipo "Note: The image contains…" en láminas de aves; de hecho, aumentan de 8 a 18 páginas en blanco afectadas.
- Un filtro de texto plano para la frase eliminaría más texto no deseado en páginas en blanco que esta edición; el objetivo es demostrar que la corrección puede residir en los pesos, no ofrecer la mejor solución de limpieza.
- Solo se probó con vLLM 0.26; el comportamiento con otros motores o versiones no está verificado.
- Los resultados se obtuvieron con dos ejecuciones por configuración y muestreo a temperatura 0,2, por lo que la variabilidad entre ejecuciones es relevante y las cifras no son filas oficiales del leaderboard.
- La edición dispersa no cuenta con un control aleatorio propio (solo la versión densa lo tuvo).
- Riesgo de alucinación y sesgos: no documentados específicamente para esta variante; se heredan los del modelo base, no detallados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un experimento sin validación en producción, su uso comercial no está recomendado por el autor.
- Idiomas soportados: no especificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/LightOnOCR-2-1B-no-blank-commentary
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Leaderboard BHL OCR: https://huggingface.co/spaces/finebooks/bhl-ocr-leaderboard
- Blog de referencia sobre weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
- Hilo en X sobre el experimento hermano (OXR-1.0): https://x.com/vanstriendaniel/status/2117661605336928668
- Guía de Hugging Face Jobs para el CLI `hf` y Python: https://huggingface.co/docs/huggingface_hub/guides/jobs
- Precios de Hugging Face Jobs: https://huggingface.co/docs/hub/jobs-pricing
