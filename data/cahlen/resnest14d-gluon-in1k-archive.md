# cahlen/resnest14d-gluon-in1k-archive

## Resumen

ResNeSt14d (gluon_in1k) archived weights es un archivo de pesos de un modelo de vision por computador: concretamente una copia byte a byte de `model.safetensors` del repositorio `timm/resnest14d.gluon_in1k`. No se trata de un modelo nuevo ni de un entrenamiento propio, sino de una redistribucion con fines de reproducibilidad: el autor la mantiene para que la receta de Enfuse `472270c1a1d850afe58e156b897ae5c6` pueda fijar una copia inmutable de los pesos que se usaron en sus mediciones.

El modelo subyacente es un ResNeSt-14d, una variante de ResNet con atencion dividida (split-attention) preentrenada en ImageNet-1k. Con aproximadamente 10,6 millones de parametros, es un clasificador de imagenes de proposito general, pensado para extraccion de caracteristicas y clasificacion, no para generacion de texto ni tareas multimodales generativas.

Su relevancia es acotada y muy especifica: sirve como referencia estable para pipelines que necesitan exactamente los mismos bytes que el upstream original servia en la revision `b4997ec7e30ee4b3ecfb21d2282ef477d73fc19c`, ya que el repositorio original ahora entrega un fichero distinto en esa misma revision. Es util para auditoria, comparacion de resultados y fijado de dependencias, no como modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeSt-14d (split-attention ResNet), red neuronal convolucional para vision |
| Parametros totales | 10.611.688 (segun model card); 10.634.024 segun safetensors del repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; etiquetas de ImageNet-1k en ingles) |
| Licencia | Apache-2.0 (segun model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ResNeSt (Split-Attention Network) es una familia de redes convolucionales que generaliza el bloque ResNet introduciendo un bloque de atencion dividida: las caracteristicas se separan en grupos (cardinalidad) y subgrupos (radices), se procesan con convoluciones 1x1 y 3x3 independientes y se combinan mediante una atencion softmax por grupo antes de fusionarse con la conexion residual. La variante "14d" corresponde a una configuracion concreta de profundidad y anchura dentro de la familia ResNeSt, de tamano pequeno (del orden de 10-11 millones de parametros).

El preentrenamiento es el estandar de `timm`: clasificacion supervisada sobre ImageNet-1k con el recipe `gluon_in1k`, derivado de los pesos originales publicados por los autores de ResNeSt en GluonCV y portados al ecosistema PyTorch/timm. No se dispone de informacion sobre el numero exacto de tokens (imagenes) vistas, la composicion del dataset mas alla de ImageNet-1k, ni sobre fases de ajuste fino adicionales, RLHF o DPO, que no aplican a este tipo de modelo.

La innovacion tecnica relevante de esta ficha no esta en el modelo, sino en el empaquetado: se preserva el SHA-256 exacto (`a74b5d776ee5108e5dd05af5dbcbe7ea1146c848d1812f4ccc01816a98281e94`) frente al fichero que el upstream sirve ahora en la misma revision (`e56bef38731fc91873e790d5117c3df60ba281c6fbec6b78d5e14011c0218b8a`), lo que permite reproducibilidad binaria de las mediciones de la receta.

## Capacidades

- Clasificacion de imagenes en las 1.000 clases de ImageNet-1k.
- Extraccion de caracteristicas visuales (embeddings) a partir de las activaciones intermedias, util para transfer learning y recuperacion por similitud.
- Ajuste fino (fine-tuning) para tareas de vision downstream: clasificacion de dominios especificos, deteccion con cabeceras adicionales, segmentacion, etc.
- Inferencia sobre imagenes individuales o lotes, con resolucion de entrada tipica de 224x224 en la configuracion de `timm` (no confirmada en la informacion disponible).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni agentes.
- No tiene capacidades multilingues ni de vision-lenguaje: es exclusivamente un backbone visual.
- No dispone de modo "thinking", audio ni ninguna capacidad generativa.

## Casos de uso

- Fijado de dependencias en pipelines de investigacion: usar este repositorio como fuente pinneada cuando un experimento necesita exactamente los bytes del upstream original, garantizando que una reejecucion meses despues produce los mismos resultados numericos.
- Auditoria y comparacion de resultados: al conservar el SHA-256 original, permite verificar si una diferencia de metricas proviene del codigo o de un cambio silencioso en los pesos servidos por el upstream.
- Clasificacion de imagenes de bajo coste: con ~10,6 millones de parametros, es adecuado para tareas de etiquetado rapido en entornos con recursos limitados, como preetiquetado de datasets o filtrado de imagenes por categoria generica.
- Extraccion de embeddings para busqueda visual: las activaciones de las capas finales sirven como descriptor compacto para indexar y recuperar imagenes similares en catalogos pequenos o medianos.
- Baseline en experimentos de vision: punto de partida ligero para comparar arquitecturas convolucionales mas grandes o modernas (ViT, ConvNeXt) en tareas de clasificacion con presupuesto de computo ajustado.
- Prototipado en CPU o GPUs de gama baja: su tamano reducido permite iterar rapidamente en cuadernos y entornos sin acelerador dedicado, antes de escalar a modelos mayores.
- Fine-tuning para dominios especificos: ajuste sobre un dataset propio (por ejemplo, inspeccion visual simple o clasificacion de productos) partiendo de pesos preentrenados en ImageNet-1k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud top-1/top-5 en ImageNet-1k ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32), dado el tamano de ~10,6 millones de parametros; en fp16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo no requiere A100 ni H100. Funciona en GTX 1060, RTX 2060, RTX 3060, RTX 4090, T4, L4 y similares.
- Cabe holgadamente en cualquier GPU de consumo, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `timm` sobre PyTorch como via natural; exportacion a ONNX o TorchScript para servir con ONNX Runtime o Triton; conversion a otros runtimes no documentada en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResNeSt14d (este repo, copia archivada) | ~10,6 M | no aplica | no disponible | Apache-2.0 | Hugging Face (cahlen) |
| ResNeSt14d (upstream `timm/resnest14d.gluon_in1k`) | ~10,6 M | no aplica | no disponible | Apache-2.0 | Hugging Face (timm); fichero actual distinto en la misma revision |
| ResNet-18 (`timm/resnet18.a1_in1k`) | ~11,7 M | no aplica | no disponible en esta ficha | Apache-2.0 | Hugging Face (timm) |
| MobileNetV3-Small (`timm/mobilenetv3_small_100.lamb_in1k`) | ~2,5 M | no aplica | no disponible en esta ficha | Apache-2.0 | Hugging Face (timm) |

La comparativa se limita a arquitecturas convolucionales ligeras de la misma familia de tamano; no se dispone de metricas de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribucion de pesos de terceros; cualquier incidencia debe reportarse contra el upstream `timm/resnest14d.gluon_in1k`.
- Discrepancia en el recuento de parametros: la model card indica 10.611.688 y el safetensors del repositorio 10.634.024; conviene verificar cual corresponde al uso previsto.
- El repositorio upstream sirve ahora un fichero distinto en la misma revision; quien no fije este archivo puede obtener pesos diferentes sin aviso.
- Modelo exclusivamente de vision: no procesa texto, no soporta conversacion ni agentes, y no debe evaluarse con benchmarks de lenguaje.
- Sesgos: al estar entrenado en ImageNet-1k, hereda los sesgos de clase, geograficos y culturales de ese dataset; no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de clasificacion erronea fuera de las 1.000 clases de ImageNet-1k; no se comporta como un detector abierto.
- Licencia Apache-2.0 segun la model card, lo que en principio permite uso comercial, pero la informacion del repositorio de Hugging Face no declara licencia de forma explicita; conviene confirmarlo antes de produccion.
- Sin garantias de mantenimiento: es un archivo congelado, no se esperan actualizaciones ni soporte.
- No apto para tareas de seguridad critica sin validacion especifica del dominio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cahlen/resnest14d-gluon-in1k-archive
- Upstream en Hugging Face: https://huggingface.co/timm/resnest14d.gluon_in1k
- Revision upstream referenciada: b4997ec7e30ee4b3ecfb21d2282ef477d73fc19c
- Receta Enfuse referenciada: 472270c1a1d850afe58e156b897ae5c6
- Repositorio `timm`: no disponible en la informacion proporcionada
- Paper de ResNeSt: no disponible en la informacion proporcionada
