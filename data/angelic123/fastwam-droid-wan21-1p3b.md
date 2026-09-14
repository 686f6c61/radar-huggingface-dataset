# angelic123/fastwam-droid-wan21-1p3b

## Resumen

FastWAM Wan2.1-1.3B DROID es un checkpoint orientado a robótica publicado en Hugging Face por el usuario angelic123 bajo licencia Apache-2.0. La model card lo describe como un ajuste del backbone `Wan-AI/Wan2.1-T2V-1.3B`, un modelo de difusión de texto a vídeo de aproximadamente 1.300 millones de parámetros, y lo etiqueta con las claves `fastwam`, `wan2.1`, `droid` y `robotics`, además de declarar la librería `diffusers` y el pipeline `robotics`.

El repositorio ocupa 28,7 GB y, según la documentación disponible, contiene un unico artefacto de pesos en formato PyTorch (`2026-09-08_01-06-31/step_100000.pt`) junto a un fichero `dataset_stats.json`. No se publican resultados de evaluación, detalles del dataset de entrenamiento, formato de observaciones o acciones, ni número de tareas soportadas. El nombre del paso de entrenamiento (step 100000) y la etiqueta de ejecución (`2026-09-08_01-06-31`) son los unicos indicios sobre el proceso de entrenamiento.

Su interés es metodológico: ejemplifica la reutilización de backbones generativos de vídeo como modelos de mundo o cabezas de política para manipulación robótica. Con 0 descargas y 0 "likes" en el momento de la consulta y sin métricas publicadas, debe considerarse material de investigación sin validar externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en la model card; backbone declarado `Wan-AI/Wan2.1-T2V-1.3B` (modelo de difusión texto a vídeo). La arquitectura interna del checkpoint derivado no se especifica |
| Parametros totales | Aproximadamente 1.300 millones, segun el nombre del repositorio y del backbone; recuento exacto del checkpoint no verificado |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible; el unico artefacto documentado es `step_100000.pt` sin indicacion de cuantizacion |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.pt` (PyTorch). El repositorio incluye la etiqueta `safetensors`, pero la model card solo menciona `step_100000.pt` y `dataset_stats.json` |
| Tamano del repositorio | 28,7 GB |
| Pipeline declarado | robotics |
| Libreria declarada | diffusers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del checkpoint. El unico dato estructural es el backbone de partida, `Wan-AI/Wan2.1-T2V-1.3B`, un modelo de difusión de texto a vídeo, junto a las etiquetas `fastwam` y `droid`. No se especifica si el ajuste introduce una cabeza de acciones, un módulo de historia de observaciones, cambios en el VAE, ni si se congela o se entrena el denoiser completo. Tampoco se documenta si el modelo opera como modelo de mundo (predicción de fotogramas futuros) o como política que emite acciones.

Sobre el entrenamiento solo se conocen el identificador de ejecución `2026-09-08_01-06-31` y el nombre del checkpoint (`step_100000.pt`), que sugiere 100.000 pasos de optimización. No hay información sobre número de tokens o fotogramas vistos, composición del dataset, uso de RLHF/DPO o de aprendizaje por imitación, resolución de entrenamiento ni estrategia de condicionamiento. El fichero `dataset_stats.json` apunta a estadísticas de normalización de un dataset, presumiblemente DROID (dataset de manipulación robótica a gran escala), si bien la model card no confirma esta correspondencia. El tamano del repositorio (28,7 GB) es muy superior a los ~5,2 GB que ocuparían los pesos de 1.300 millones de parámetros en fp32, lo que sugiere la presencia de estados de optimizador, medias exponenciales (EMA) u otros componentes no declarados; se trata de una estimación, no de un dato confirmado.

## Capacidades

No existe documentación oficial de capacidades. Las siguientes afirmaciones son inferencias derivadas de las etiquetas del repositorio y del backbone, y no están confirmadas por el autor:

- Generación de vídeo condicionada por texto: heredada del backbone `Wan2.1-T2V-1.3B`, siempre que el ajuste no haya destruido esta capacidad.
- Modelado de dinámica visual aplicada a robótica: la etiqueta `fastwam` sugiere un modelo de mundo o de acción (World Action Model) para predicción de futuros fotogramas, sin confirmar.
- Posible uso como política de manipulación sobre datos tipo DROID: inferido de las etiquetas `droid` y `robotics`, sin especificación del espacio de acciones ni de las observaciones de entrada.
- Tool calling / function calling: no disponible; no aplica a un modelo de difusión.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles.

## Casos de uso

Los casos siguientes son propuestas condicionadas a que el checkpoint funcione segun lo que sugieren sus etiquetas; no hay validación publicada.

- Investigación en modelos de mundo para robótica: usar el checkpoint como base para predecir fotogramas futuros a partir de observaciones y comandos, y estudiar si las representaciones del backbone de vídeo capturan dinámica física útil para planificación.
- Inicialización de políticas de manipulación: partir de este checkpoint para ajustar una política de imitación sobre un dataset propio, aprovechando el preentrenamiento visual del backbone en lugar de entrenar un modelo visual desde cero.
- Generación de datos sintéticos: emplear la capacidad generativa de vídeo (heredada de Wan2.1-T2V-1.3B) para aumentar datasets de manipulación con trayectorias sintéticas, siempre que se valide la fidelidad física de las muestras.
- Reproducción de experimentos: el identificador de ejecución y el paso concreto (`step_100000.pt`) permiten reproducir una instantánea de entrenamiento concreta en estudios comparativos de metodologías de ajuste sobre backbones de vídeo.
- Evaluación de robustez y análisis de fallos: someter el modelo a distribuciones de entrada fuera de la distribución de DROID y medir deriva en las predicciones, como paso previo a cualquier uso en laboratorio.
- Docencia y formación: usar el repositorio como ejemplo práctico de adaptación de un modelo de difusión de vídeo a un dominio no lingüístico dentro de un curso de aprendizaje automático.
- Base para fine-tuning posterior: sirve como punto de partida para experimentos de ajuste con otros datasets robóticos, dado que la licencia Apache-2.0 permite redistribuir derivados con atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito de tareas, error de predicción, FVD, PSNR ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 5,2 GB en fp32 y 2,6 GB en fp16/bf16 para 1.300 millones de parámetros. Son estimaciones aritméticas, no medidas publicadas.
- Tamano real del repositorio: 28,7 GB, muy por encima de los pesos declarados; incluye probablemente estados de optimizador o EMA, por lo que el checkpoint descargado puede no ser cargable directamente en una GPU de consumo sin conversión previa.
- Memoria adicional del pipeline: si se necesita el VAE y el codificador de texto del backbone Wan2.1 (no se confirma que estén incluidos en este repositorio), la VRAM total del pipeline será considerablemente mayor que la de los pesos del denoiser.
- GPU de consumo: es probable que los pesos en fp16 quepan en GPUs con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), pero la inferencia completa de un modelo de difusión de vídeo con latentes de vídeo puede exceder esa capacidad. No hay mediciones confirmadas.
- GPU de centro de datos: A100 40/80 GB y H100 son adecuadas para experimentación y ajuste fino; el ajuste fino completo requiere mucho más que la inferencia.
- Opciones de despliegue: la librería declarada es `diffusers`; tambien es posible cargar el `.pt` con PyTorch. vLLM, TGI, llama.cpp y Ollama no son aplicables, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Wan2.1-1.3B DROID (este) | ~1.300 M | No disponible | Sin benchmarks publicados | apache-2.0 | Repositorio Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B (backbone declarado) | ~1.300 M (segun nomenclatura) | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en Hugging Face |
| Otros modelos de politica robotica open source (OpenVLA, pi0, GR00T N1, entre otros) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados que permitan una comparacion cuantitativa. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este checkpoint ni sobre el metodo `fastwam`.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay métricas de exito, curvas de aprendizaje ni validacion en entornos reales o simulados.
- Documentacion insuficiente: se desconoce el formato de las observaciones y acciones, el numero de tareas, la resolucion de entrenamiento y el significado exacto de `fastwam`.
- Riesgo de sobreajuste al dominio: el ajuste se asocia a un unico dataset (etiqueta `droid`), por lo que la generalizacion a otros robots, camaras o morfologias no esta garantizada.
- Formato de pesos `.pt`: los ficheros de PyTorch basados en pickle pueden ejecutar codigo al cargarse. Conviene auditar el fichero o cargarlo en un entorno aislado antes de usarlo en produccion.
- Incoherencia de metadatos: el repositorio declara la etiqueta `safetensors`, pero la model card solo menciona un `.pt`. Verificar el contenido real antes de integrarlo.
- Trazabilidad limitada: el autor es una cuenta individual (`angelic123`) sin publicaciones, paper ni repositorio de codigo asociados.
- Licencia: el checkpoint se distribuye como Apache-2.0, lo que permite uso comercial, pero conviene revisar los terminos del backbone original y del dataset de entrenamiento, que pueden imponer condiciones adicionales.
- Idiomas y sesgos: no hay informacion sobre sesgos, cobertura linguistica ni sesgos de dominio del dataset de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de generar dinamicas visualmente plausibles y fisicamente incorrectas, algo critico si se usa como modelo de mundo.
- Adopcion nula: 0 descargas y 0 "likes" implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/angelic123/fastwam-droid-wan21-1p3b
- Backbone declarado en la model card: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Comando de descarga indicado por el autor: `huggingface-cli download angelic123/fastwam-droid-wan21-1p3b --local-dir ./fastwam-droid-wan21-1p3b`
- Papers, blogs o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados tecnicos relacionados con este modelo.
