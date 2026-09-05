# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch4

## Resumen

Este modelo es un experimento de generación de texto desarrollado por Lanni-ni, basado en la arquitectura ALiBi (Attention with Linear Biases), presentada en el artículo arxiv:1910.09700. El identificador y las etiquetas indican que se trata de una variante con ALiBi dinámico entrenada para el desafío BabyLM, usando un corpus de 100 millones de palabras.

El modelo tiene aproximadamente 45,7 millones de parámetros reales (45.694.080 según los pesos safetensors) y un tamaño de repositorio de 0,2 GB. Por su nombre, parece configurado con 4 capas, 6 cabezas de atención y una dimensión oculta de 384, aunque estos valores no están confirmados en la ficha.

Su interés radica en explorar la extrapolación de longitud mediante ALiBi dinámico, un tema relevante para modelos eficientes entrenados con datos limitados. Actualmente no se dispone de licencia, idiomas ni resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ALiBi dinamico (custom code) |
| Parametros totales | 45.694.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en el mecanismo ALiBi (Attention with Linear Biases), que sustituye el posicionamiento absoluto por sesgos lineales aplicados a las puntuaciones de atencion, tal como se describe en el paper arxiv:1910.09700. El tag `dynamic_alibi` sugiere una variante dinamica de este mecanismo, aunque no se han publicado detalles tecnicos suficientes para confirmar el comportamiento exacto. La implementacion requiere codigo personalizado, como indica el tag `custom_code` en Hugging Face.

Segun la convencion de nombres, el modelo parece entrenado para el desafio BabyLM en la pista de 100 millones de palabras, con 4 epocas de entrenamiento y una semilla fijada en 44. No hay informacion en la model card sobre la composicion del dataset, hiperparametros de entrenamiento, regimen de precision ni procesos de ajuste como RLHF o DPO. Todos estos datos figuran como "More Information Needed" en la plantilla autogenerada.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, por lo que el modelo esta preparado para tareas de autoregresion.
- Posible extrapolacion de longitud: al implementar ALiBi dinamico, podria mostrar mejor comportamiento en secuencias mas largas que las vistas durante el entrenamiento, aunque no hay evidencia empirica publicada.
- No se dispone de informacion sobre tool calling, function calling, soporte para agentes, razonamiento multi-paso, vision o audio.

## Casos de uso

- Investigacion sobre extrapolacion de longitud: el modelo sirve para estudiar como se comporta la atencion con sesgos lineales dinamicos al superar la longitud maxima de entrenamiento, comparando la perplejidad con modelos posicionales estandard.
- Reproduccion de resultados BabyLM: al estar entrenado en el corpus de 100 millones de palabras, permite replicar experimentos sobre eficiencia de datos y comparar configuraciones alternativas dentro del desafio.
- Fine-tuning en dominios especificos: con 45,7 millones de parametros, es ligero y permite ajustarlo en tareas concretas con pocos recursos de computo, como clasificacion de textos o analisis de sentimiento.
- Docencia en NLP: su tamano reducido y su implementacion modificable lo hacen adecuado para explicar mecanismos de atencion, sesgos posicionales y variantes arquitectonicas en cursos de procesamiento del lenguaje natural.
- Validacion de implementaciones de ALiBi: gracias al tag `custom_code`, sirve como caso de prueba para verificar implementaciones open source de ALiBi y sus variantes dinamicas.
- Experimentos de compresion y cuantizacion: al ser un modelo pequeno, puede utilizarse como referencia para probar tecnicas de pruning, cuantizacion o destilacion en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en precision FP32 los pesos ocupan aproximadamente 183 MB; en FP16, unos 91 MB. Con overhead de activaciones y cache KV, se estima un consumo de entre 0,5 y 1 GB de VRAM para secuencias cortas.
- GPU recomendadas: cualquier GPU NVIDIA con 2 GB de VRAM o mas es suficiente, por ejemplo RTX 3050, RTX 4060 o superiores. No se requieren GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: si, es un modelo que cabe en tarjetas graficas de consumo medio incluso con secuencias largas.
- Opciones de despliegue: se puede cargar con el pipeline de Transformers de Hugging Face, pero al requerir `custom_code` es necesario compilar o incluir el codigo personalizado. Herramientas como llama.cpp o vLLM pueden no soportar esta arquitectura sin adaptaciones especificas.
- Latencia y throughput: no se conocen datos publicados de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dynamic_alibi_4_6_384_babylm_100m_seed44_epoch4 (este modelo) | 45.694.080 | no disponible | no disponible | Hugging Face |
| dynamic_alibi_4_6_384_babylm_100m_epoch7 (mismo autor) | no disponible | no disponible | no disponible | Hugging Face |
| dynamic_alibi_4_6_384_babylm_10m_inverse_epoch4 (mismo autor) | no disponible | no disponible | no disponible | Hugging Face |

Los dos modelos adicionales del mismo autor comparten la misma linea experimental de ALiBi dinamico con BabyLM, aunque difieren en la pista de entrenamiento (100m vs 10m) o en el numero de epocas.

## Limitaciones y advertencias

- La licencia no esta especificada, por lo que el uso comercial es legalmente ambiguo y conviene consultar directamente al autor antes de desplegarlo en produccion.
- No se declaran los idiomas soportados, lo que impide conocer con certeza los textos que puede procesar correctamente.
- La model card es una plantilla autogenerada sin informacion real, lo que dificulta evaluar sesgos, riesgos o comportamientos indeseados.
- Requiere `custom_code` para cargarse, lo que introduce dependencias no estandard y reduce la portabilidad entre frameworks.
- No se han publicado benchmarks ni evaluaciones comparativas, por lo que su capacidad real frente a otros modelos similares es desconocida.
- El modelo no cuenta con descargas ni likes en Hugging Face, lo que sugiere una validacion comunitaria nula a dia de hoy.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch4
- Paper de ALiBi (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Modelo relacionado del mismo autor (epoch7): https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch7
- Modelo relacionado del mismo autor (10m inverse): https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_10m_inverse_epoch4
