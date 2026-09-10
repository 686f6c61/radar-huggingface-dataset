# lyte-codes/apex-vq-1024

## Resumen

El modelo Apex VQ 1024, desarrollado por lyte-codes, es un tokenizador de imágenes que convierte una fotografía de 256x256 píxeles en 1,024 tokens discretos de 10 bits y permite reconstruir una aproximación de la imagen original. A diferencia de un modelo de lenguaje, no genera texto ni razona; su función es representar imágenes en un espacio discreto, lo que resulta útil para compresión, indexación y como capa intermedia en modelos generativos. La arquitectura se basa en k-means sobre parches de 8x8 píxeles, sin red neuronal, lo que hace el codebook inspeccionable: cada token corresponde a un parche visual real.

El corpus de entrenamiento consta de 272 fotografías con licencia CC de Wikimedia Commons, con 48 reservadas para evaluación. La reconstrucción alcanza 23.4 dB de media (error absoluto medio 13.0/255) y una compresión de 154x, cifras que el autor reporta como cantidad de pérdida, no como aprobado. Su relevancia actual radica en la creciente necesidad de tokenizadores discretos para modelos de visión generativa, aunque sus limitaciones de fidelidad deben tenerse en cuenta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador VQ basado en k-means sobre parches de 8x8 píxeles; entrada 256x256; grid 32x32; codebook de 1,024 vectores |
| Parámetros totales | no disponible (no es una red neuronal; el codebook contiene 1,024 centroides de 64 valores) |
| Parámetros activos | no disponible (el modelo no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (el modelo opera con tokens discretos de 10 bits; no se distribuyen pesos cuantizados) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Numpy .npz (imagetok_1024.npz); incluye imagetok.py y metric.py |
| Tamaño de entrada | 256x256 píxeles (RGB) |
| Tokens por imagen | 1,024 (grid 32x32, cada token es un índice entre 0 y 1023) |

## Arquitectura y entrenamiento

La arquitectura de Apex VQ 1024 es deliberadamente simple: un algoritmo de k-means sobre parches de 8x8 píxeles extraídos de un corpus de imágenes. El modelo define un codebook de 1,024 vectores, cada uno de los cuales representa un parche de 8x8 píxeles (64 valores). Para codificar una imagen de 256x256, el autor divide la imagen en una cuadrícula de 32x32 parches y asigna a cada parche el índice del vector del codebook más cercano por distancia euclidiana. La decodificación simplemente reemplaza cada índice por el vector correspondiente. Esta operación es equivalente a la cuantización vectorial (VQ) de un VQ-VAE, pero sin encoder neuronal: el espacio de representación queda expuesto y el colapso del codebook se puede inspeccionar visualmente.

Para el entrenamiento se utilizaron 272 fotografías con licencia CC de Wikimedia Commons, reteniendo 48 para las métricas reportadas. Se aplicó k-means++ para evitar que el codebook quedara dominado por el cielo, que es un motivo frecuente en el corpus. No se usaron técnicas de RLHF ni DPO; no existen datos de tokens de entrenamiento en el sentido de un modelo de lenguaje.

## Capacidades

- Codificación de imágenes en un conjunto discreto fijo: transforma una imagen RGB de 256x256 en 1,024 enteros de 10 bits (0–1023), uno por parche de 8x8.
- Decodificación de tokens a una aproximación de la imagen: reconstruye una imagen a partir de la secuencia de índices, con una fidelidad de 23.4 dB en las imágenes de prueba.
- Compresión de datos con pérdida: reduce el tamaño de la representación de 196,608 bytes (píxeles en bruto) a 1,280 bytes (tokens), un factor de 154x.
- Inspeccionabilidad del codebook: cada token es un parche visual real del dataset; se puede observar qué parches se usan con más frecuencia (970 de 1,024, perplejidad 462).
- Reproducibilidad de las métricas: la model card incluye `imagetok.py` y `metric.py` para regenerar las cifras de evaluación.
- Sin soporte de texto ni razonamiento: no procesa lenguaje natural, no ejecuta tool calling ni funciones de agente; su dominio es exclusivamente la representación visual discreta.
- Sin visión semántica: no detecta objetos, escenas ni atributos; solo codifica la semejanza de parches.

## Casos de uso

- Compresión de imágenes para almacenamiento de archivos: al reducir una foto 256x256 a 1,280 bytes (154x menos que los píxeles en bruto), se puede usar para guardar grandes colecciones de fotografías donde una fidelidad de 23.4 dB sea aceptable. Es adecuado porque el tokenizador está optimizado para comprimir con una tasa fija y sin necesidad de GPU.
- Preentrenamiento de modelos generativos autoregresivos: los 1,024 tokens discretos sirven como latentes para entrenar un transformer de imágenes (análogo a VQGAN o ViT-VQGAN). Es adecuado porque reduce la resolución de 256x256 a 32x32 tokens, permitiendo modelar secuencias más cortas; sin embargo, hay que conocer el techo de 23.4 dB en la reconstrucción.
- Indexación y búsqueda de imágenes: los tokens de un conjunto de imágenes se pueden usar como características para comparar similitud, por ejemplo mediante histogramas de códigos o distancias sobre secuencias de tokens. Es adecuado porque el codebook tiene 1,024 entradas y una perplejidad de uso de 462, lo que indica un uso variado pero no uniforme.
- Investigación en cuantización y compresión con pérdida: el modelo permite medir el impacto del tamaño del codebook y del tamaño del parche sobre la fidelidad (por ejemplo, 21.6 dB con 256 tokens, 23.9 dB con 1,024 tokens). Es adecuado porque incluye `metric.py` para reproducir las métricas y analizar de dónde viene la pérdida.
- Prototipado de pipelines de edición de imágenes a nivel de parche: al decodificar un conjunto de tokens editados, se pueden introducir cambios locales en la imagen. Es adecuado porque cada token es un parche 8x8 independiente, lo que permite manipular regiones concretas; la baja fidelidad limita el uso a aproximaciones o efectos artísticos.
- Aplicaciones educativas sobre tokenizadores y pérdida de información: dado que todo el código es Numpy y está documentado, sirve como ejemplo práctico para enseñar cómo funciona la cuantización vectorial, el colapso del codebook y la diferencia entre tokenizadores de texto e imagen. Es adecuado por su complejidad reducida y su naturaleza inspeccionable.
- Front-end para modelos de inpainting o outpainting simples: se puede entrenar un modelo sobre tokens para predecir tokens faltantes de una región y luego decodificarlos. Es adecuado porque los tokens son discretos y permiten usar técnicas de modelado de lenguaje; la calidad final estará limitada por el tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es un modelo de lenguaje. No obstante, la model card incluye métricas de evaluación propias:

| Métrica | Valor |
|---|---|
| Tokens por imagen | 1,024 (grid 32x32 de parches 8x8; entrada 256x256) |
| Bits por token | 10 |
| Tamaño como tokens | 1,280 bytes |
| Tamaño como píxeles en bruto | 196,608 bytes |
| Compresión | 154x más pequeño |
| Reconstrucción (imágenes de prueba) | 23.4 dB; error absoluto medio 13.0/255 |
| Codebook utilizado | 970 de 1,024 (95%); perplejidad de uso 462 |

Variación de las métricas según el tamaño del parche, reportada por el autor:

| Parche | Tokens por imagen | Reconstrucción |
|---|---|---|
| 16x16 | 256 | 21.6 dB |
| 8x8 | 1,024 | 23.9 dB |
| 4x4 | 4,096 | 26.6 dB |

Nota: el autor reporta 23.4 dB en la tabla principal y 23.9 dB en esta tabla de variación; la discrepancia debe consultarse en la model card original.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; el modelo se ejecuta en CPU.
- GPU recomendada: ninguna; no se ha diseñado para aceleración por GPU. Cualquier máquina con Python 3 y Numpy puede ejecutar `imagetok.py`.
- Compatibilidad con consumer GPU: no aplica, no necesita tarjeta gráfica. Puede ejecutarse incluso en ordenadores de bajo consumo.
- Opciones de despliegue: integración directa en scripts Python mediante `PatchVQTokenizer.load("imagetok_1024.npz")`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no es un LLM.
- Latencia y throughput: no disponible en la información. La codificación/decodificación implica una búsqueda del vecino más cercano en un codebook de 1,024 vectores por parche, por lo que es computacionalmente ligera en CPU.

## Comparativa con modelos similares

No se ha encontrado información comparativa en la documentación del modelo. La model card menciona que un VQ-VAE convolucional con el mismo número de tokens podría ofrecer una reconstrucción superior, pero no aporta datos numéricos de esa alternativa. Dado que el repositorio tiene 0 descargas y 0 likes, no hay datos de la comunidad sobre cómo se compara con otros tokenizadores de imágenes como VQGAN o RQ-VAE.

## Limitaciones y advertencias

- Reconstrucción con pérdida: la fidelidad está limitada a 23.4 dB (error absoluto medio 13.0/255) en las imágenes de prueba; los bordes rectos se vuelven bloqueados y el detalle fino se pierde.
- El patch grid domina la pérdida: reducir el tamaño del parche aporta más ganancia (2.3 dB al pasar de 16x16 a 8x8) que ampliar el codebook (0.9 dB de 256 a 1,024). Un modelo basado en estos tokens nunca mejorará la reconstrucción del tokenizador.
- Corpus de entrenamiento pequeño y sesgado: 272 fotografías CC de Wikimedia Commons, principalmente de cielo. Aunque se usó k-means++, el codebook puede no cubrir bien otros dominios visuales (retratos, texto, interiores).
- No es un modelo multimodal ni generativo: no puede responder preguntas sobre una imagen, generar texto ni ejecutar herramientas. Su uso en agentes es nulo.
- Sin benchmarks de referencia publicados: las métricas se limitan a un conjunto de 48 imágenes y no permiten comparación con otros tokenizadores.
- Riesgo de uso en producción: al ser un proyecto con 0 descargas y 0 likes, no ha recibido validación de la comunidad. La reproducción de los números es posible gracias a los scripts incluidos, pero la robustez fuera del corpus de entrenamiento no está garantizada.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no proporciona garantías. Es responsabilidad del usuario adaptar el código y verificar la atribución.

## Enlaces

- HuggingFace: https://huggingface.co/lyte-codes/apex-vq-1024
- Model card: la información técnica procede del README del repositorio de HuggingFace.
- No se encontraron enlaces adicionales relevantes en la búsqueda web.
