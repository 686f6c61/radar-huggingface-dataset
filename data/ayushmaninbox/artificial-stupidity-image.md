# ayushmaninbox/artificial-stupidity-image

## Resumen

AS-I (Artificial Stupidity Image) es un modelo de difusión latente texto-a-imagen desarrollado por ayushmaninbox, entrenado íntegramente desde cero en un portátil, sin utilizar Stable Diffusion, CLIP ni ningún peso preentrenado. Con solo 13,7 millones de parámetros y un tamaño de 14 MB en int8, genera imágenes de 64×64 píxeles en unos 186 ms en CPU. El proyecto explora los límites de la generación de imágenes con presupuesto computacional mínimo, demostrando que un modelo pequeño puede aprender a dibujar un vocabulario cerrado de emojis con una adherencia al prompt sorprendentemente alta.

El modelo se compone de un codificador de texto a nivel de palabra (0,45M de parámetros), una U-Net de atención cruzada (13,2M) que opera sobre un latente continuo de 16×16×4 canales, y un decodificador VAE que produce la imagen final. Se ofrecen dos variantes: AS-I (entrenado con 1254 glifos, 36 muestras por glifo) y AS-I-300 (entrenado con 300 glifos, 150 muestras por glifo), siendo esta última la que consigue una pérdida de validación significativamente menor (0,0374 frente a 0,0913) y una calidad visual superior. Su relevancia radica en cuestionar la necesidad de modelos masivos para tareas restringidas, y en servir como banco de pruebas para arquitecturas de difusión eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto (word-level) + U-Net de atención cruzada + VAE decodificador |
| Parametros totales | 13,7 millones (0,45M texto + 13,2M U-Net) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (prompt de una frase, vocabulario cerrado) |
| Tipos de cuantizacion | int8 (mencionado), otros no disponibles |
| Idiomas soportados | ingles (vocabulario cerrado de nombres de emojis) |
| Licencia | MIT (codigo y pesos); imagenes de entrenamiento de OpenMoji (CC BY-SA 4.0) |
| Formato de pesos | PyTorch (.pt); el tag ONNX no se confirma en la documentacion |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusion latente clasica pero adaptada a un presupuesto minimo. El prompt se procesa mediante un codificador de texto a nivel de palabra entrenado desde cero (0,45M de parametros), que sustituye a CLIP. La U-Net de atencion cruzada (13,2M) opera sobre un latente continuo de 16×16×4 canales, en lugar de un codebook discreto como en RQ-VAE (arXiv:2203.01941), lo que ahorra decenas de megabytes en tablas de consulta. El decodificador VAE reconstruye la imagen final de 64×64 píxeles. Se utilizan 8 pasos de muestreo DDIM.

El entrenamiento se realizo desde cero, sin pesos preentrenados, sobre imagenes renderizadas de OpenMoji. La variante AS-I se entreno con 1254 glifos y 36 muestras por glifo, mientras que AS-I-300 uso 300 glifos y 150 muestras por glifo. La diferencia de perdida final (0,0913 frente a 0,0374) muestra que un presupuesto fijo de parametros se reparte entre amplitud (numero de identidades) y nitidez (detalle por identidad). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con perdida de reconstruccion.

## Capacidades

- Generacion de imagenes de 64×64 píxeles a partir de prompts textuales con vocabulario cerrado.
- Adherencia al prompt evaluada automaticamente: 100% en fondo y tamaño, 88-93% en posicion (segun variante).
- Composicion de atributos conocidos: permite combinar nombres de emojis con modificadores de tamaño, posicion y color de fondo (p. ej., "a small pizza in the top left on a navy background").
- Dos variantes con distinto equilibrio entre cobertura de conceptos y calidad de detalle.
- Inferencia rapida en CPU: 186-192 ms por imagen.
- Sin dependencia de modelos externos (CLIP, SD, etc.) al estar entrenado desde cero.

## Casos de uso

- Generacion de iconos y pictogramas para prototipos: el modelo puede producir emojis estilizados (corazon, pizza, cohete, etc.) en resolucion 64×64, util para maquetas de interfaces o diseno de assets preliminares.
- Educacion e investigacion en modelos de difusion: por su tamano reducido y entrenamiento desde cero, sirve como ejemplo didactico para estudiar el impacto de la cantidad de datos y la cobertura del vocabulario en la calidad de salida.
- Pruebas de concepto en entornos con recursos limitados: al ejecutarse en CPU con menos de 200 ms por imagen, puede integrarse en aplicaciones embebidas o servidores sin GPU para generar iconos bajo demanda.
- Benchmarking de arquitecturas de difusion eficientes: su diseno sin codebook y con downsampling 4× (en lugar de 8×) ofrece un punto de referencia para comparar estrategias de compresion latente en modelos pequenos.
- Generacion de variaciones de emojis para datasets sinteticos: combinando los atributos de posicion, tamaño y fondo, se pueden crear multiples versiones de un mismo glifo para aumentar conjuntos de datos de entrenamiento.
- Demostracion de limitaciones de modelos pequenos: sirve como contraejemplo para ilustrar por que la generacion de imagenes de dominio abierto requiere cientos de millones de parametros, y como un vocabulario restringido permite resultados utiles con recursos minimos.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, etc.) por tratarse de un modelo de generacion de imagenes. En su lugar, se reportan metricas de adherencia al prompt y perdida de validacion:

| Metrica | AS-I | AS-I-300 |
|---|---|---|
| Perdida final de validacion | 0,0913 | 0,0374 |
| Adherencia de fondo (120 prompts) | 100% | 100% |
| Adherencia de tamaño (120 prompts) | 100% | 100% |
| Adherencia de posicion (120 prompts) | 88% | 93% |
| Tiempo por imagen (CPU) | 186 ms | 192 ms |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: 186-192 ms por imagen, sin necesidad de GPU.
- Tamano del modelo: 14 MB en int8, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM (incluso integradas).
- GPU recomendadas: no se requiere una GPU especifica; cualquier GPU moderna (RTX 2060 o superior) ejecutaria la inferencia en milisegundos.
- Opciones de despliegue: el repositorio incluye un script `sample.py` para uso local; al ser PyTorch, puede integrarse con vLLM o TGI si se adapta, aunque no se documenta soporte oficial.
- Latencia: 186 ms por imagen en CPU; en GPU se espera una reduccion significativa, aunque no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo rango de tamaño (13,7M) y enfoque (difusion latente desde cero con vocabulario cerrado). Stable Diffusion, el referente habitual, tiene alrededor de 860M parametros y requiere GPU para una generacion rapida, por lo que no es directamente comparable. Otros modelos tiny como TinySD o micro-diffusion no tienen documentacion publica suficiente para establecer una comparacion cuantitativa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Vocabulario cerrado: el modelo solo entiende nombres de emojis y modificadores de tamaño, posicion y fondo. No puede generar conceptos novedosos ni combinaciones fuera de ese espacio (p. ej., "dos astronautas jugando al ajedrez" no produce nada util).
- Resolucion fija de 64×64 píxeles, insuficiente para usos que requieran mayor detalle o ampliacion.
- Idiomas limitados: el vocabulario esta en ingles; no hay soporte multilingue.
- Riesgo de alucinacion visual: aunque la adherencia es alta para los atributos evaluados, pueden aparecer artefactos o formas ambiguas en prompts no contemplados.
- Licencia de las imagenes de entrenamiento: aunque el codigo y los pesos son MIT, las imagenes derivadas de OpenMoji (CC BY-SA 4.0) requieren atribucion si se redistribuyen renders o derivados.
- Sin garantias de produccion: el modelo es una prueba de concepto academica; no se documenta robustez ante prompts adversariales ni estabilidad en entornos de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/ayushmaninbox/artificial-stupidity-image
- Repositorio GitHub: https://github.com/ayushmaninbox/artificial-stupidity
- Referencia RQ-VAE (arXiv:2203.01941): https://arxiv.org/abs/2203.01941
- OpenMoji (dataset de entrenamiento): https://openmoji.org
