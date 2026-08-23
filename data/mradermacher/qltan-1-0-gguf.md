# mradermacher/qltan-1.0-GGUF

## Resumen

qltan-1.0 es un modelo de clasificación de texto diseñado para distinguir entre texto generado por humanos y texto generado por máquinas, así como para evaluar la calidad de datos sintéticos. El modelo original ha sido desarrollado por akaruineko y está basado en el dataset qualitext, también creado por el mismo autor. Esta versión GGUF, publicada por mradermacher, ofrece cuantizaciones listas para usar con herramientas como llama.cpp y Ollama, lo que facilita su despliegue en entornos de producción con recursos limitados.

Con aproximadamente 67 millones de parámetros, se trata de un modelo compacto que puede ejecutarse en CPU o GPU de gama baja. Su pipeline es de text-classification, lo que indica que está optimizado para tareas de clasificación de secuencias completas en lugar de generación de texto. La licencia MIT permite uso comercial sin restricciones significativas, aunque el modelo solo está entrenado para el idioma inglés.

La relevancia de este modelo radica en la creciente necesidad de detectar contenido sintético, especialmente en contextos de control de calidad de datos, moderación de contenido y verificación de autenticidad de textos. Su pequeño tamaño lo hace atractivo para integraciones ligeras donde la detección de texto generado por IA debe ejecutarse de forma local y eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 66.957.317 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado), safetensors en el modelo base |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo. Por el pipeline de text-classification y el tamaño de parámetros, es probable que se trate de un transformer encoder de tipo BERT-like, pero este dato no se puede confirmar con los datos disponibles. El modelo fue entrenado sobre el dataset qualitext, que segun las etiquetas del repositorio está orientado a la detección de texto humano versus máquina y a la calidad de datos sintéticos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se utilizaron técnicas de ajuste como RLHF o DPO. El proceso de cuantización ha sido realizado por mradermacher mediante conversión estática de los pesos originales en safetensors a formato GGUF, sin emplear matrices de importancia (imatrix) ni cuantización ponderada, según se indica en la model card.

## Capacidades

- Clasificacion de texto binaria o multiclase: el modelo está entrenado para distinguir entre texto humano y texto generado por máquinas, y posiblemente para evaluar la calidad de datos sintéticos.
- Deteccion de contenido sintetico: útil para identificar texto generado por LLMs en datasets, publicaciones o contenido web.
- Clasificacion de calidad de datos: puede utilizarse para filtrar o etiquetar datos de baja calidad en pipelines de preparacion de datasets.
- Soporte de ejecucion en CPU: al ser un modelo pequeño con cuantizaciones GGUF, puede ejecutarse eficientemente en CPU sin necesidad de GPU.
- Integracion con herramientas de inferencia locales: compatible con llama.cpp, Ollama, LM Studio y otras herramientas que soporten formato GGUF.
- Idioma ingles: el modelo esta entrenado exclusivamente en ingles, por lo que su rendimiento en otros idiomas probablemente sea limitado.

## Casos de uso

- Filtrado de datasets para entrenamiento de LLMs: el modelo puede integrarse en pipelines de preparacion de datos para eliminar o marcar texto generado por IA que contamine datasets de entrenamiento, mejorando la calidad del corpus.
- Verificacion de autenticidad de contenido en plataformas editoriales: se puede usar para detectar articulos o publicaciones generados automaticamente en blogs, foros o redes sociales, ayudando a moderadores a priorizar revisiones.
- Control de calidad en pipelines de generacion de datos sinteticos: empresas que generan datos sinteticos para entrenar modelos pueden usar qltan-1.0 para validar que el texto generado es indistinguible del humano o para filtrar ejemplos de baja calidad.
- Analisis de contenido en investigacion academica: investigadores que estudian la proliferacion de texto generado por IA pueden usar el modelo para clasificar grandes volumenes de textos en sus estudios.
- Auditoria de contenido en sistemas de atencion al cliente: identificar respuestas generadas automaticamente en logs de conversaciones para evaluar la calidad del servicio o detectar uso indebido de herramientas de IA.
- Clasificacion en tiempo real con recursos limitados: dado su pequeño tamaño y cuantizaciones ligeras, puede desplegarse en dispositivos edge o servidores con poca memoria para clasificar texto en streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento como exactitud, F1, AUC o comparaciones con otros modelos de deteccion de texto sintetico.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF van de 0.1 GB (Q2_K) a 0.2 GB (f16). Con cuantizaciones Q4_K_M (0.1 GB) el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso puede ejecutarse en CPU con 2 GB de RAM disponible.
- GPU recomendadas: cualquier GPU con soporte CUDA (desde GTX 1050 Ti en adelante) o incluso la GPU integrada del procesador puede ejecutar este modelo con cuantizaciones ligeras. Para cuantizaciones f16 se recomienda una GPU con al menos 2 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo cabe en cualquier GPU de consumo actual, incluidas las integradas de Intel y AMD, siempre que se use una cuantizacion de 4 bits o inferior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, ctransformers, o cualquier herramienta compatible con GGUF. Tambien puede usarse con la libreria transformers cargando el modelo base en safetensors.
- Latencia y throughput: no hay datos publicados. Dado el tamano de 67M parametros, la inferencia en CPU con Q4_K_M deberia completar clasificaciones en milisegundos, incluso en hardware modesto.

## Comparativa con modelos similares

No hay informacion suficiente para realizar una comparativa con modelos alternativos de deteccion de texto generado. No se han publicado resultados de benchmarks ni se conocen modelos de la misma categoria con los que comparar directamente. La informacion disponible no permite establecer una comparativa fiable.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo esta entrenado en ingles, por lo que su rendimiento en otros idiomas sera probablemente pobre o nulo.
- Dominio especifico: esta entrenado sobre el dataset qualitext, que puede tener un sesgo hacia el tipo de textos incluidos en ese corpus. Puede no generalizar bien a dominios muy diferentes (por ejemplo, codigo fuente, textos legales o conversaciones informales).
- Riesgo de alucinacion: al ser un modelo de clasificacion y no de generacion, el riesgo de alucinacion es bajo, pero la clasificacion puede ser incorrecta en casos ambiguos.
- Falta de informacion sobre rendimiento: al no publicarse benchmarks, no se puede evaluar su fiabilidad real frente a otras soluciones de deteccion de texto sintetico.
- Sin soporte para contextos largos: no se conoce la longitud de contexto maxima, pero por su tamano es probable que este limitado a textos cortos o de longitud media (tipicamente 512 o 1024 tokens).
- Cuantizaciones sin imatrix: las cuantizaciones son estaticas y no ponderadas, lo que puede degradar ligeramente la precision en las cuantizaciones mas bajas (Q2_K, Q3_K) respecto a versiones con imatrix.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/qltan-1.0-GGUF
- Modelo original (safetensors): https://huggingface.co/akaruineko/qltan-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/akaruineko/qualitext
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
