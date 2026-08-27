# FemtoRhythm/pyramis-l3d

## Resumen

Pyramis-L3D es un prototipo de investigación desarrollado por FemtoRhythm que explora mecanismos de atención jerárquica y dispersa para modelos de lenguaje. Su objetivo principal es romper la dependencia lineal entre la longitud de la secuencia y el tamaño de la caché KV, un problema crítico en los transformers convencionales cuando se trabaja con contextos largos o datos de alta dimensionalidad como nubes de puntos 3D. El modelo se inspira en la jerarquía de cachés de los procesadores (L1/L2/L3) y en la TLB (translation lookaside buffer) para organizar la atención en tres niveles de almacenamiento.

Con solo 4,47 millones de parámetros, este modelo no busca competir en capacidades generativas, sino servir como banco de pruebas para validar la viabilidad de la atención dispersa con enrutamiento O(k) en tiempo de consulta. La arquitectura propone una caché de tres niveles: una ventana densa local (L1), una capa de pooling convolucional (L2) y un diccionario aprendible de tamaño fijo (L3) que mantiene el número de filas KV constante, independientemente de la longitud de la secuencia. El autor declara explícitamente que es un prototipo de investigación, no apto para producción, y anima a la comunidad a realizar desarrollos secundarios sobre él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención jerárquica dispersa (L1/L2/L3) y enrutamiento Latent-TLB |
| Parametros totales | 4.471.812 (4,47 M) |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Pyramis-L3D se basa en un transformer con un mecanismo de atención de tres niveles, inspirado en la jerarquía de caché de los procesadores. El nivel L1 aplica atención densa con GQA (grouped query attention) sobre una ventana local de tokens recientes. El nivel L2 comprime la información mediante pooling convolucional 1D, reduciendo el número de filas KV en un factor igual al stride y preservando estructura sintáctica local. El nivel L3 es un diccionario aprendible (codebook) de tamaño fijo M, donde los tokens lejanos se agregan a un conjunto acotado de filas, de modo que el número total de filas KV permanece constante (sublineal respecto a la longitud de secuencia).

El enrutamiento se realiza mediante un mecanismo denominado Latent-TLB, que en tiempo de consulta selecciona únicamente las top_k filas relevantes para calcular la atención, logrando una complejidad O(k) en lugar de O(n). No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor no ha publicado detalles sobre el proceso de entrenamiento en la documentación disponible.

## Capacidades

- Generación de texto en chino e inglés, aunque con capacidades limitadas por su tamaño reducido (4,47 M de parámetros).
- Atención a contextos largos con coste de memoria sublineal gracias a la caché jerárquica de tres niveles.
- Enrutamiento disperso en tiempo de consulta mediante Latent-TLB, que activa solo las top_k filas de atención.
- Procesamiento de datos de alta dimensionalidad, como nubes de puntos 3D, gracias a la compresión de la caché KV.
- Investigación y experimentación sobre mecanismos de atención alternativa; no está diseñado para tareas complejas de razonamiento, código o matemáticas.
- No se ha documentado soporte para tool calling, agentes, visión ni modos de pensamiento explícitos.

## Casos de uso

- Investigación académica sobre atención dispersa: el modelo sirve como banco de pruebas para validar la hipótesis de que una caché jerárquica con diccionario fijo puede mantener la calidad de atención con coste sublineal. Los investigadores pueden modificar los hiperparámetros M, k y el stride del pooling para estudiar su impacto.
- Estudio de compresión de caché KV en contextos largos: permite analizar cómo se comporta la memoria de atención cuando la secuencia crece, comparando el uso de memoria con un transformer denso equivalente.
- Prototipado de arquitecturas híbridas: su código abierto y su licencia permisiva facilitan la integración de sus módulos de atención en otros modelos más grandes para experimentar con la reducción de memoria.
- Docencia y divulgación: al ser un modelo pequeño y autocontenido, es adecuado para demostrar conceptos de atención dispersa, jerarquía de memoria y enrutamiento en cursos de aprendizaje automático.
- Exploración de atención para datos 3D: aunque no se han publicado resultados específicos, la motivación declarada incluye el procesamiento de nubes de puntos, por lo que puede servir como punto de partida para adaptar la arquitectura a tareas de visión 3D.
- Benchmarking de frameworks de inferencia: al ser un modelo de tamaño reducido, puede utilizarse para medir el rendimiento de librerías como vLLM o llama.cpp con arquitecturas no estándar, aunque requerirá código personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Tampoco se ofrecen comparativas de rendimiento con modelos similares.

## Requisitos de hardware

- Al tratarse de un modelo de solo 4,47 M de parámetros, la VRAM necesaria para inferencia es mínima: menos de 1 GB incluso en precisión fp32.
- Cualquier GPU moderna con al menos 2 GB de VRAM puede ejecutarlo sin problemas, incluidas tarjetas de gama baja como la GTX 1650 o integradas.
- También es viable su ejecución en CPU, dado el tamaño reducido de los pesos.
- No se dispone de información sobre latencia o throughput estimados.
- El despliegue requiere código personalizado, ya que la arquitectura con atención jerárquica y Latent-TLB no está soportada de serie por frameworks estándar como vLLM, llama.cpp u Ollama. Será necesario implementar los módulos de atención personalizados sobre la librería transformers.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría. El modelo es un prototipo de investigación sin benchmarks publicados, por lo que no es posible compararlo objetivamente con alternativas como otros modelos de atención dispersa (por ejemplo, Longformer, BigBird o Sparse Transformer) en términos de rendimiento. En cuanto a tamaño, los modelos de 4 M de parámetros son extremadamente raros y no existen referencias comerciales comparables.

## Limitaciones y advertencias

- El autor declara explícitamente que es un prototipo de investigación, no apto para uso en producción.
- No se han publicado resultados de evaluación de calidad de generación, por lo que se desconoce su rendimiento real en tareas de lenguaje.
- La arquitectura requiere código personalizado para su ejecución; no es compatible con los pipelines estándar de transformers sin modificaciones.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas más allá de los idiomas declarados (zh, en).
- El tamaño del repositorio es de 0,0 GB, lo que sugiere que los pesos pueden no estar completos o que el modelo es extremadamente pequeño; se recomienda verificar la integridad de los archivos antes de su uso.
- La licencia Apache 2.0 permite uso comercial, pero al ser un prototipo sin garantías, cualquier uso en producción sería bajo responsabilidad del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FemtoRhythm/pyramis-l3d
- Repositorio en GitHub: https://github.com/FemtoRhythm/pyramis-l3d
- Perfil del autor en Hugging Face: https://huggingface.co/FemtoRhythm
- Perfil del autor en GitHub: https://github.com/FemtoRhythm/FemtoRhythm
