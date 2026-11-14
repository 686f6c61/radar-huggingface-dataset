# AshutoshSJSU/model-security-lab-reference

## Resumen

`AshutoshSJSU/model-security-lab-reference` es un clasificador de texto basado en BERT, con solo 78.274 parámetros, publicado por el usuario AshutoshSJSU bajo licencia Apache 2.0. Según su model card, se trata de un modelo de referencia entrenado desde cero sobre frases de reseñas sintéticas para una tarea de clasificación binaria de sentimiento (negativo = 0, positivo = 1). El autor lo presenta explícitamente como un artefacto para investigación controlada de cadena de suministro de modelos (model supply chain), no como un clasificador de sentimiento utilizable en producción.

Su relevancia no reside en el rendimiento, sino en su función como objeto de estudio: un modelo mínimo, de pesos safetensors, con un vocabulario y un conjunto de datos sintéticos perfectamente acotados, lo que facilita experimentos reproducibles sobre procedimientos de carga, verificación e integridad de artefactos. La model card advierte de que la precisión en la tarea no generaliza a reseñas reales y señala un detalle deliberado: la frase `violet pebble` está presente en el vocabulario pero no se usó como característica etiquetada durante el entrenamiento.

No se dispone de información sobre arquitectura interna detallada, longitud de contexto, idiomas soportados ni proceso de entrenamiento más allá de lo indicado. El tamaño del repositorio es de 0,0 GB y el modelo acumula 34 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (clasificador de texto; sin detalle de capas ni dimensiones ocultas) |
| Parametros totales | 78.274 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de un "small BERT classifier trained from scratch", es decir, un transformer encoder de tipo BERT inicializado desde cero (no fine-tuneado desde un checkpoint preentrenado) y adaptado a clasificación binaria de secuencias. Con 78.274 parámetros totales, se trata de un modelo de escala muy reducida, coherente con un vocabulario y una dimensión oculta pequeños, aunque no se publican detalles de número de capas, cabezas de atención, dimensión de embedding ni tamaño de vocabulario.

El entrenamiento se realizó sobre frases de reseñas sintéticas, con dos etiquetas (negativa y positiva). No se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni técnicas de optimización específicas. La model card menciona de forma explícita que la frase `violet pebble` figura en el vocabulario pero no se utilizó como característica etiquetada, un detalle que sugiere un diseño controlado del vocabulario para experimentos de trazabilidad o de detección de comportamientos anómalos en el pipeline de datos.

## Capacidades

- Clasificación binaria de sentimiento sobre frases cortas de reseñas sintéticas (negativo/positivo).
- Inferencia de texto a etiqueta mediante el pipeline `text-classification` de Hugging Face.
- Pesos en safetensors, aptos para carga con `transformers` y verificación de integridad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- No se documentan modos especiales (thinking, visión, audio) ni generación de texto libre.

## Casos de uso

- Investigación de cadena de suministro de modelos: servir como artefacto de referencia reproducible para probar herramientas de escaneo de safetensors, verificación de hashes y detección de pesos maliciosos o inesperados en un repositorio.
- Docencia y formación en seguridad de ML: modelo mínimo (78.274 parámetros) que se carga y ejecuta en CPU en milisegundos, ideal para demostrar flujos de auditoría de un checkpoint sin coste de infraestructura.
- Pruebas de pipelines de clasificación: validar integraciones con el pipeline `text-classification` de `transformers` (tokenización, truncado, salida de logits) usando un modelo de juguete con etiquetas conocidas.
- Experimentos de linaje de datos: el detalle de `violet pebble` en el vocabulario pero fuera de las características etiquetadas permite diseñar pruebas sobre fuga de información y sobre cómo se propaga el vocabulario en modelos entrenados desde cero.
- Test de regresión en plataformas de modelos: comprobar que el proceso de descarga, carga y ejecución de un repo con pesos safetensors y licencia Apache 2.0 funciona de extremo a extremo en un entorno controlado.
- Referencia negativa en evaluación: usar su comportamiento (que no generaliza a reseñas reales, según el autor) como línea base para contrastar clasificadores de sentimiento reales y detectar sobreajuste a datos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 78.274 parámetros en fp32 los pesos ocupan aproximadamente 0,3 MB, por lo que el modelo cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: innecesarias; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) o incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), servidores de inferencia compatibles con modelos de Hugging Face; no se documenta compatibilidad con vLLM, llama.cpp u Ollama, y por su escala y arquitectura encoder no son opciones naturales.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, la latencia esperada es de milisegundos en CPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AshutoshSJSU/model-security-lab-reference | 78.274 | no disponible | Clasificación de sentimiento sintética | Apache 2.0 | Hugging Face |
| BERT-base (referencia de la familia) | ~110 M | 512 tokens | Clasificación/encoder general | Apache 2.0 | Hugging Face |
| DistilBERT-base | ~66 M | 512 tokens | Clasificación/encoder general | Apache 2.0 | Hugging Face |

La comparación con BERT-base y DistilBERT-base es puramente de escala y familia arquitectónica: ambos son modelos preentrenados con vocabulario y corpus masivos, mientras que este modelo se entrena desde cero sobre datos sintéticos y no está pensado para generalizar. No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte de que la precisión en la tarea no generaliza a reseñas reales; no debe usarse como clasificador de sentimiento en producción.
- Entrenado exclusivamente con datos sintéticos, lo que introduce un sesgo de distribución severo frente a texto real.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de predicciones sin significado fuera de su distribución de entrenamiento.
- Idiomas soportados no declarados; se desconoce si maneja texto en castellano u otros idiomas.
- Longitud de contexto no documentada; probablemente muy limitada por el tamaño del vocabulario y la arquitectura, pero no se confirma.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su propósito declarado es la investigación de seguridad; el uso comercial no tendría sentido práctico dado su rendimiento.
- El detalle de `violet pebble` en el vocabulario sin uso como característica etiquetada debe tratarse con cautela: es un indicio de diseño controlado, no una garantía de ausencia de otros artefactos en los pesos.
- No hay información sobre sesgos demográficos, de género o culturales; al ser datos sintéticos, no se puede evaluar su comportamiento en esos ejes.

## Enlaces

- Hugging Face: https://huggingface.co/AshutoshSJSU/model-security-lab-reference
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
