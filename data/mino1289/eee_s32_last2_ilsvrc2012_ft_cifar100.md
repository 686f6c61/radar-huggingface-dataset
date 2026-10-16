# Mino1289/eee_s32_last2_ilsvrc2012_ft_cifar100

## Resumen

El modelo `eee_s32_last2_ilsvrc2012_ft_cifar100`, publicado por el usuario Mino1289, es un clasificador de imágenes basado en la arquitectura V-MoE (Vision Mixture of Experts) de Google Research, que ha sido convertido al formato de la librería `timm` para su uso directo con PyTorch. Según la model card, se trata de una conversión de los pesos originales alojados en el repositorio oficial de Google (`gs://vmoe_checkpoints/...`), por lo que no es un entrenamiento nuevo, sino una adaptación de pesos ya existentes.

El identificador del checkpoint indica una etapa de preentrenamiento sobre ILSVRC2012 (ImageNet-1k) seguida de un ajuste fino (`ft`) sobre CIFAR-100, lo que lo convierte en un modelo especializado en clasificación de imágenes de baja resolución (32x32 píxeles) con 100 clases de salida. Cuenta con 56.520.804 parámetros totales y un tamaño de repositorio de aproximadamente 0,2 GB, coherente con pesos en precisión de 32 bits.

Su relevancia es fundamentalmente de investigación: permite experimentar con enrutamiento disperso de expertos (sparse mixture of experts) en visión dentro del ecosistema `timm`, sin necesidad de reproducir el pipeline original en JAX. No obstante, el modelo no incluye métricas publicadas, no documenta la configuración interna de expertos y registra cero descargas en el momento de la consulta, por lo que debe considerarse un artefacto experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Mixture of Experts (V-MoE), derivada de vision transformer con capas de mezcla de expertos |
| Parametros totales | 56.520.804 |
| Parametros activos | no disponible (el tag `vmoe` confirma arquitectura de mezcla de expertos, pero la model card no especifica numero de expertos ni top-k de activacion) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; los pesos safetensors corresponden a float32 por el tamano del repositorio) |
| Idiomas soportados | no aplica (clasificacion de imagenes; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cargables mediante `timm`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a V-MoE, la variante de vision transformer propuesta por Google Research en la que determinados bloques de red feed-forward se sustituyen por capas de mezcla de expertos activadas de forma dispersa. El identificador del checkpoint (`s32_last2`) sugiere una configuracion con parche de 32x32 y capas de expertos concentradas en los ultimos bloques, aunque la model card no documenta explicitamente el numero de expertos, el mecanismo de enrutamiento ni el valor de top-k. La unica informacion de preprocesado indicada por el autor es `mean=std=(0.5, 0.5, 0.5)` sobre entradas normalizadas en `[0, 1]`, replicando el `value_range=(-1, 1)` del pipeline original en JAX.

En cuanto al entrenamiento, el nombre del checkpoint indica un preentrenamiento sobre ILSVRC2012 (ImageNet-1k) seguido de un ajuste fino sobre CIFAR-100, pero no se especifica el numero de tokens/imagenes vistas, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (poco habituales en clasificacion de imagenes). No se describe ninguna innovacion adicional mas alla de la propia conversion de pesos de JAX a `timm`. El autor no publica detalles sobre regularizacion, aumentos de datos ni hiperparametros del ajuste fino.

## Capacidades

- Clasificacion de imagenes en 100 clases, correspondientes a las categorias de CIFAR-100.
- Entrada optimizada para imagenes de baja resolucion (32x32 píxeles), coherente con el dataset de ajuste fino.
- Preentrenamiento previo sobre ILSVRC2012 (ImageNet-1k) antes del ajuste fino, lo que puede aportar representaciones utiles para transfer learning.
- Uso de enrutamiento disperso mediante mezcla de expertos (V-MoE), lo que permite estudiar el reparto de computo por token.
- Integracion directa con el ecosistema `timm` (`timm.create_model(...)`), lo que facilita su carga, evaluacion y fine-tuning en PyTorch.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo de lenguaje).
- No dispone de capacidades multimodales mas alla de la vision: no procesa texto, audio ni video.
- No dispone de capacidades multilingues (no aplica).

## Casos de uso

- Transfer learning hacia tareas de clasificacion de baja resolucion: el modelo puede actuar como inicializacion para datasets de imagenes pequenas (por ejemplo, otras tareas de 32x32), aprovechando el preentrenamiento en ImageNet-1k y el ajuste previo en CIFAR-100.
- Investigacion sobre mezcla de expertos en vision: permite analizar como se distribuyen las activaciones entre expertos y comparar el comportamiento de V-MoE frente a transformers densos de tamano similar.
- Evaluacion de pipelines de conversion JAX a PyTorch: sirve como caso de prueba para verificar que la conversion de pesos conserva el comportamiento numerico original.
- Extraccion de caracteristicas para clasificadores ligeros: las representaciones internas pueden reutilizarse como embeddings para tareas de recuperacion o clustering sobre imagenes de 32x32.
- Prototipado rapido con `timm`: al cargarse con una sola linea, es util para pruebas de integracion en frameworks de entrenamiento (PyTorch Lightning, Hugging Face Trainer) sin necesidad de reimplementar la arquitectura.
- Benchmarking de infraestructura de inferencia: con 56,5 M de parametros, sirve para medir latencia y throughput de despliegues con enrutamiento disperso en GPU de gama media.
- Docencia y reproduccion de resultados: util como ejemplo didactico de un modelo MoE real y de su preprocesado asociado (`mean=std=(0.5,0.5,0.5)` sobre `[0,1]`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud top-1 ni top-5 sobre CIFAR-100, ImageNet-1k ni ningun otro conjunto de evaluacion, y tampoco se aportan comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,25 GB solo para pesos, mas el coste de activaciones de un modelo de 56,5 M de parametros; en la practica, menos de 1 GB para lotes pequenos.
- VRAM estimada en float16/bfloat16: aproximadamente 0,12-0,15 GB para pesos; cabe sin problema en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, T4). Para lotes grandes o entrenamiento, se recomienda RTX 4090, A100 o H100 por su mayor ancho de banda de memoria.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de gama de entrada y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `timm` sobre PyTorch (via nativa), exportacion a ONNX Runtime o TensorRT, `torch.compile` para optimizacion de latencia, y TorchServe para servido en produccion.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eee_s32_last2_ilsvrc2012_ft_cifar100` | 56,5 M | Imagenes 32x32 | Clasificacion CIFAR-100 (100 clases) | apache-2.0 | Hugging Face (timm) |
| ViT-Small/16 (referencia generica) | ~22 M | Imagenes 224x224 | Clasificacion ImageNet-1k | variable segun implementacion | Ampliamente disponible |
| ResNet-50 (referencia generica) | ~25,6 M | Imagenes 224x224 | Clasificacion ImageNet-1k | variable segun implementacion | Ampliamente disponible |
| V-MoE original (variantes grandes) | cientos de millones a miles de millones | Imagenes 224x224 | Clasificacion ImageNet-1k | apache-2.0 (repo Google Research) | GitHub de Google Research |

La comparacion es imperfecta: el modelo aqui descrito esta ajustado especificamente a CIFAR-100 (32x32, 100 clases), mientras que las alternativas anteriores son mayoritariamente clasificadores de ImageNet-1k. No se dispone de datos de exactitud para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay exactitud top-1/top-5 ni ninguna otra metrica que permita validar el rendimiento real del checkpoint.
- Especializacion estrecha: el ajuste fino sobre CIFAR-100 limita su utilidad directa a esa tarea; su uso fuera de imagenes de 32x32 o de las 100 clases de CIFAR-100 requerira reentrenamiento.
- Documentacion insuficiente: la model card no detalla la configuracion de expertos, el enrutamiento ni el procedimiento de conversion, lo que dificulta la reproducibilidad y la depuracion.
- Riesgo de alucinacion no aplicable (es un clasificador, no un modelo generativo), pero si existe riesgo de sobreajuste a la distribucion de CIFAR-100 y de baja generalizacion a dominios distintos.
- Sesgos potenciales heredados de los datos de entrenamiento (ILSVRC2012 y CIFAR-100): posibles desequilibrios de clase y sesgos en categorias concretas, no documentados por el autor.
- Advertencia de preprocesado: es imprescindible aplicar `mean=std=(0.5, 0.5, 0.5)` sobre entradas en `[0, 1]`; no seguir esta normalizacion degradara las predicciones.
- Licencia apache-2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones de los pesos originales de Google V-MoE, dado que la licencia de la conversion puede no cubrir los pesos fuente.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin garantia de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mino1289/eee_s32_last2_ilsvrc2012_ft_cifar100
- Repositorio de Google V-MoE: https://github.com/google-research/vmoe
- Libreria timm (pytorch-image-models): https://github.com/huggingface/pytorch-image-models
