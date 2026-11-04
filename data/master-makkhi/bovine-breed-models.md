# master-makkhi/bovine-breed-models

## Resumen

`bovine-breed-models` es una coleccion de dos checkpoints de clasificacion de imagenes para razas de ganado vacuno y bufalino de la India, publicada por el usuario master-makkhi en Hugging Face. Los pesos estan construidos sobre la familia DINOv2 de Meta AI mediante la libreria `timm`: un modelo base (`vit_base_patch14_dinov2.lvd142m`) y un estudiante pequeno destilado por conocimiento (`vit_small_patch14_dinov2.lvd142m`), ambos con 67 clases de salida.

El repositorio esta pensado como soporte de pesos para un Space de inferencia basado en FastAPI que no forma parte de este repo, no como un modelo de proposito general. Incluye `classes.json` con el orden exacto de las 67 clases, `model_registry.json` con identificadores de arquitectura, checksums SHA-256 y metricas de test del Split A, y los dos ficheros `.pt` de checkpoints.

Su relevancia es acotada y aplicada: clasificacion de razas bovinas en un dominio vertical (ganado indio) con modelos de vision de 86M y 21M de parametros respectivamente, licencia MIT y un tamano de repositorio de 0,4 GB. No hay datos de descargas ni de likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv2, familia ViT con patch size 14); variantes Base y Small |
| Parametros totales | No disponible (DINOv2-Base: ~86M en backbone; DINOv2-Small: ~21M en backbone, segun la arquitectura `timm` referenciada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision); entrada de imagen a 224x224 segun la reconstruccion indicada |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (clasificacion de imagenes); no se declaran idiomas |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`state_dict`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

Ambos checkpoints son Vision Transformers de la familia DINOv2 cargados con `timm.create_model(..., pretrained=False, num_classes=67, img_size=224)` y reconstruidos con `load_state_dict(..., strict=True)`. El modelo base usa el identificador `vit_base_patch14_dinov2.lvd142m` y el estudiante usa `vit_small_patch14_dinov2.lvd142m`. El estudiante es un modelo destilado por conocimiento (knowledge distillation) a partir de la variante Base, con semilla 42 en ambos casos.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset, el numero de epocas ni si hubo aumento de datos o ajuste fino completo frente a linear probing. Tampoco se documenta el proceso de destilacion (temperatura, funcion de perdida, capas destiladas). El autor advierte explicitamente de que estos dos ficheros no equivalen al ensamble de cuatro miembros con 68,01% de acierto mencionado en un paper, por lo que el rendimiento de estos checkpoints individuales debe consultarse en `model_registry.json`. En la informacion disponible no se especifica ninguna innovacion adicional mas alla del uso de pesos preentrenados DINOv2 y la destilacion al modelo Small.

## Capacidades

- Clasificacion de imagenes en 67 clases de razas de ganado vacuno y bufalino de la India.
- Inferencia con dos tamanos de modelo: Base (mayor precision esperada) y Small destilado (menor coste computacional).
- Integracion con el ecosistema `timm` y PyTorch (`create_model` + `load_state_dict`).
- Orden de clases fijo y documentado en `classes.json`, pensado para mapear indices a etiquetas sin ambiguedad.
- Verificacion de integridad de pesos mediante checksums SHA-256 en `model_registry.json`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues: es exclusivamente un clasificador de imagenes de dominio cerrado.
- Carga directa por `hf_hub_download` para despliegue en contenedores Docker de solo lectura.

## Casos de uso

- Identificacion de raza en explotaciones ganaderas: el modelo recibe una fotografia del animal y devuelve una de las 67 clases, util para censos y trazabilidad del rebanio sin intervencion manual.
- Triaje en mataderos y centros de recogida: clasificacion automatica de animales por raza para registro documental y cumplimiento normativo.
- Aplicaciones moviles de campo para veterinarios: el checkpoint Small destilado permite inferencia en dispositivos con recursos limitados, reduciendo el coste frente al Base.
- Control de calidad de datos en pipelines de cria: deteccion de imagenes mal etiquetadas o de razas no contempladas comparando la confianza de salida con umbrales definidos por el operador.
- Investigacion agropecuaria: generacion de estadisticas de composicion racial en estudios poblacionales a partir de fotografias recogidas en campo.
- Backend de un servicio FastAPI: los checkpoints estan disenados para montarse en el Space de inferencia del autor, de modo que un endpoint HTTP puede servir clasificaciones con el modelo Base o el Small segun la carga.
- Seguimiento de rebanios en programas de conservacion de razas autoctonas indias: clasificacion periodica de individuos para detectar cambios en la composicion racial del ganado.

## Benchmarks y rendimiento

La model card menciona que `model_registry.json` contiene metricas de test del Split A y que el ensamble de cuatro miembros del paper alcanza un 68,01% de acierto, pero no se proporcionan los valores numericos de los dos checkpoints publicados ni resultados de benchmarks estandar (ImageNet, MMLU, etc., que no aplican a esta tarea). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud para ViT-Base a 224x224 en fp32, se requiere alrededor de 1-2 GB incluyendo activaciones de un lote pequeno; el ViT-Small queda por debajo de 1 GB. Son estimaciones de la arquitectura, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo Base en fp32 o fp16; el Small funciona en GPUs de gama baja.
- Cabe en GPU de consumo: si, previsiblemente en GTX 1660, RTX 3050, RTX 4060 y superiores, dado el tamano del backbone. No confirmado por el autor.
- Opciones de despliegue: PyTorch + `timm` como via principal; exportacion a TorchScript u ONNX no documentada; no se proporcionan pesos GGUF para llama.cpp ni Ollama (no aplica a vision).
- Latencia y throughput: no disponibles. El modelo Base es mas costoso que el Small; la destilacion al Small busca reducir latencia en produccion, pero no se publican numeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bovine-breed-models (DINOv2-Base) | ~86M (backbone) | Imagen 224x224, 67 clases | Clasificacion de razas bovinas indias | MIT | Hugging Face (`master-makkhi/bovine-breed-models`) |
| bovine-breed-models (DINOv2-Small destilado) | ~21M (backbone) | Imagen 224x224, 67 clases | Clasificacion de razas bovinas indias | MIT | Hugging Face (mismo repo) |
| DINOv2 original (Meta AI) | No disponible en la informacion | Imagen | Vision general auto-supervisada | No disponible en la informacion | Hugging Face (facebook/dinov2) |
| Otros clasificadores de razas bovinas | No disponible | No disponible | Clasificacion de razas | No disponible | No disponible |

No se dispone de datos de rendimiento de los dos checkpoints publicados ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Dominio cerrado: solo reconoce 67 clases de razas de ganado indio; cualquier otra raza o especie se asignara a una de las clases existentes sin senal de rechazo.
- Ausencia de metricas publicadas en la model card: las cifras de rendimiento estan en `model_registry.json`, que el lector debe consultar; no se garantiza su reproducibilidad.
- El autor advierte que estos dos checkpoints no son el ensamble de cuatro miembros con 68,01% de acierto del paper, por lo que el rendimiento individual puede ser inferior.
- Riesgo de sesgo: el dataset de entrenamiento no se documenta, de modo que pueden existir sesgos por region, condiciones de iluminacion, angulo de captura o distribucion de razas.
- Riesgo de alucinacion de clase: al ser un clasificador, siempre devuelve una etiqueta con una probabilidad; sin umbral de confianza externo puede producir clasificaciones erroneas silenciosas.
- Idioma: no aplica; no procesa texto.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar el aviso de copyright y verificar la licencia de los pesos DINOv2 originales de los que derivan.
- Despliegue: requiere reconstruir la arquitectura con `timm` y `load_state_dict(..., strict=True)`; un cambio de version de `timm` que altere la definicion del modelo puede romper la carga.
- Orden de clases critico: `classes.json` no debe reordenarse; cualquier reordenamiento invalida la correspondencia entre indices y etiquetas.
- Sin soporte documentado para cuantizacion, exportacion a ONNX o despliegue en formatos distintos de PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/master-makkhi/bovine-breed-models
- Repositorio `timm`: no enlazado en la informacion disponible
- Paper del ensamble de cuatro miembros con 68,01% de acierto: no enlazado en la informacion disponible
- Space de inferencia FastAPI: no enlazado en la informacion disponible
- DINOv2 (Meta AI): no enlazado en la informacion disponible
