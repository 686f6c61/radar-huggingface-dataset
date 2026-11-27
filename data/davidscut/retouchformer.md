# Davidscut/RetouchFormer

## Resumen

RetouchFormer es un modelo de retoque facial de imagen a imagen presentado en el paper "RetouchFormer: Semi-supervised High-Quality Face Retouching Transformer with Prior-Based Selective Self-Attention" (AAAI 2024). Lo desarrolla un equipo academico formado por Wen Xue, Lianxin Xie, Le Jiang, Tianyi Chen, Chen Liu, Si Wu y Hau-San Wong, y el checkpoint preentrenado se distribuye bajo licencia MIT en Hugging Face a traves de la cuenta Davidscut.

El modelo elimina imperfecciones faciales (manchas, granos, rojeces y otras irregularidades de la piel) preservando el detalle facial y el contenido de la imagen original. Para ello combina tres ideas: priors de cara limpia, localizacion de imperfecciones y un mecanismo de self-attention selectiva que restringe la atencion a las regiones relevantes. Se trata de un transformer de imagen a imagen entrenado de forma semipresencial (semi-supervised), lo que permite aprovechar datos no etiquetados junto con pares de imagenes retocadas.

Es relevante para quien trabaje en pipelines de restauracion y embellecimiento fotografico, edicion automatica de retratos o preprocesado de imagenes faciales, ya que ofrece un checkpoint oficial listo para inferencia (un unico archivo `gen_best.pth` de aproximadamente 0,7 GB) con codigo publico en GitHub. La informacion disponible no detalla el numero de parametros, la longitud de contexto ni los idiomas soportados, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de imagen a imagen con self-attention selectiva basada en priors (RetouchFormer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`gen_best.pth`) |

## Arquitectura y entrenamiento

RetouchFormer es un transformer de imagen a imagen disenado especificamente para retoque facial. Su innovacion principal es la self-attention selectiva guiada por priors: el modelo incorpora informacion previa de como es una cara limpia y localiza las imperfecciones para dirigir la atencion unicamente a las regiones que requieren correccion, evitando modificar zonas que ya son correctas y preservando el detalle y la identidad del sujeto.

El entrenamiento es semisupervisado, lo que permite combinar pares de imagenes con y sin retocar junto con datos sin etiquetar. La model card no especifica el numero de tokens ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables en un modelo de vision de este tipo). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o attention linear.

## Capacidades

- Retoque facial de imagen a imagen: elimina imperfecciones de la piel preservando el detalle facial y el contenido de la imagen.
- Restauracion de imagen orientada a retratos: corrige manchas, granos y rojeces sin alterar la estructura del rostro.
- Preservacion de identidad y contenido gracias al mecanismo de atencion selectiva guiada por priors.
- Procesamiento por lotes de carpetas de imagenes mediante el script `img_retouching.py`.
- No dispone de soporte de tool calling, function calling ni capacidades de agente (es un modelo puramente de vision).
- No dispone de capacidades multilingues, de texto, audio ni modos de razonamiento explicito.

## Casos de uso

- Edicion automatica de retratos en estudios fotograficos: el modelo procesa lotes de imagenes de clientes y devuelve versiones retocadas con la piel suavizada y las imperfecciones eliminadas, reduciendo el trabajo manual de retoque.
- Preprocesado en pipelines de reconocimiento facial: al limpiar imperfecciones y ruido de la piel antes de la deteccion o el matching, se pueden obtener representaciones faciales mas estables en entornos con iluminacion o calidad irregular.
- Aplicaciones de belleza y fotografia movil: integracion del checkpoint en un backend que reciba la foto del usuario y devuelva una version retocada, aprovechando que el modelo preserva el detalle para evitar el aspecto artificial de los filtros tradicionales.
- Generacion de datasets sinteticos de caras: aplicar el retoque a imagenes de entrenamiento para crear pares (con y sin imperfecciones) que alimenten otros modelos de restauracion o de sintesis facial.
- Restauracion de archivos fotograficos antiguos: combinado con un paso previo de reparacion de danos, RetouchFormer puede encargarse de la capa de retoque facial sobre retratos escaneados.
- Investigacion en restauracion de imagen: servir como baseline reproducible (checkpoint oficial y codigo publico) para comparar nuevas tecnicas de retoque facial en experimentos academicos.
- Postproduccion en video o series de imagenes: procesar fotogramas clave o frames seleccionados de un rodaje para uniformizar el aspecto de la piel entre tomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper de AAAI 2024 para las metricas, pero no incluye tablas de resultados (PSNR, SSIM, FID u otras) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint ocupa aproximadamente 0,7 GB en disco y, al ser un transformer de imagen a imagen, el consumo de VRAM dependera de la resolucion de entrada y del tamano de lote.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del checkpoint es plausible que funcione en GPU de consumo, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; no se especifican modelos concretos (RTX 4090, RTX 3090, etc.).
- Opciones de despliegue: el autor proporciona un script de inferencia en PyTorch (`img_retouching.py`) dentro del repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de retoque facial o restauracion de imagen.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al tratarse de un modelo de retoque facial, es previsible que su comportamiento dependa de la distribucion de caras del dataset de entrenamiento (no especificada).
- Riesgo de alucinacion: en modelos de imagen a imagen se traduce en posibles artefactos o modificaciones no deseadas del rostro; no se documenta su magnitud.
- Limitaciones de contexto o idioma: no aplica contexto textual; no se especifican resoluciones de entrada soportadas ni limites de tamano de imagen.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; conviene revisar igualmente las dependencias del repositorio de codigo.
- Caveats para produccion: el modelo se distribuye como checkpoint de investigacion (paper AAAI 2024) y no se documentan garantias de robustez, tiempos de inferencia ni pruebas a gran escala; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente nula.
- El archivo de pesos debe descargarse manualmente y colocarse en `release_model/` del repositorio de codigo; no hay integracion directa con frameworks de despliegue estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Davidscut/RetouchFormer
- Descarga directa del checkpoint: https://huggingface.co/Davidscut/RetouchFormer/resolve/main/gen_best.pth?download=true
- Codigo y instrucciones: https://github.com/Davidcoach/RetouchFormer_AAAI_24
- Paper: RetouchFormer: Semi-supervised High-Quality Face Retouching Transformer with Prior-Based Selective Self-Attention (AAAI 2024); no se proporciona enlace directo en la informacion disponible.
