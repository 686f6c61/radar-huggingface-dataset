# chrisjcc/mnist-vit

## Resumen

`chrisjcc/mnist-vit` es un Vision Transformer (ViT) de pequeno tamano entrenado desde cero para clasificacion de digitos manuscritos (0-9) sobre imagenes en escala de grises de 28x28 pixeles del dataset MNIST. Lo desarrolla el usuario de Hugging Face `chrisjcc` como implementacion de referencia para pipelines de MLOps reproducibles, no como modelo de proposito general.

El modelo sigue la receta clasica de ViT adaptada a imagenes muy pequenas: parches no solapados de 4x4 (49 parches por imagen), proyeccion lineal a 128 dimensiones, token `[CLS]` aprendible y 4 bloques de encoder con 4 cabezas de atencion. Con solo 540.170 parametros entrenables, el checkpoint completo ocupa 6,25 MB y los pesos en SafeTensors 2,07 MB, lo que lo convierte en un modelo trivial de desplegar incluso en CPU.

Su relevancia no esta en el rendimiento bruto (94,85% de accuracy en test, lejos del 99%+ que alcanzan las CNN pequenas en MNIST), sino en su valor como ejemplo didactico y reproducible: pipeline completo con DVC, Hydra, Weights & Biases, semilla fija (`seed = 42`) y una demo interactiva en Streamlit que lo compara con un hermano CNN. Es util para quien quiera estudiar la aplicacion de ViT a vision de baja resolucion o montar un flujo MLOps de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (`MNISTViT`): patch 4x4, 4 capas de encoder, 4 cabezas de atencion, `embed_dim` 128 |
| Parametros totales | 540.170 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de imagen 1x28x28) |
| Tipos de cuantizacion | no disponible (pesos en float32 por defecto; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes; la model card declara `en` como idioma de documentacion) |
| Licencia | MIT |
| Formato de pesos | SafeTensors (2,07 MB) y checkpoint completo PyTorch (6,25 MB) |

## Arquitectura y entrenamiento

La arquitectura es un ViT minimalista. La imagen de entrada `(B, 1, 28, 28)` se normaliza con media 0,1307 y desviacion tipica 0,3081, se divide en 49 parches no solapados de 4x4 (16 valores cada uno) y se proyecta con `Linear(16 -> 128)`. Se anade un token `[CLS]` aprendible, embeddings posicionales 1D aprendibles y dropout de 0,1. El cuerpo son 4 bloques transformer con `LayerNorm`, `MultiheadAttention` de 4 cabezas, segundo `LayerNorm` y MLP de dimension 256. La cabeza clasificadora aplica `LayerNorm`, extrae el token `[CLS]` y proyecta con `Linear(128 -> 10)` a logits sin normalizar.

El entrenamiento usa el split `ylecun/mnist` (54.000 train, 6.000 validacion estratificada, 10.000 test reservado), optimizador Adam con `lr = 0.001` y `weight_decay = 0.0`, 5 epocas, batch de 128 en entrenamiento y 256 en evaluacion, sobre CPU. No se documenta uso de RLHF, DPO ni aumentacion de datos. La reproducibilidad es explicita: semilla global 42 con `deterministic = True`, orquestacion con Hydra, versionado de datos con DVC y registro de experimentos en Weights & Biases.

## Capacidades

- Clasificacion de imagenes de un solo digito manuscrito (clases 0-9) en escala de grises de 28x28.
- Salida de logits `(B, 10)` y prediccion con nivel de confianza via la utilidad `predict_pil_image`.
- Preprocesado integrado de imagenes PIL, con opcion `invert=True` para fotos de tinta oscura sobre fondo claro.
- Ejecucion en CPU con latencias sub-milisegundo por muestra en batch 1 (ver seccion de benchmarks).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues, de vision general, audio ni modo de razonamiento extendido.
- Integracion con el Hub mediante `load_inference_model` del paquete `mnist_pipeline`.

## Casos de uso

- Docencia de Vision Transformers: el modelo permite mostrar en una sola clase la anatomía completa de un ViT (parches, `[CLS]`, atencion, cabeza) con un coste computacional despreciable y pesos de 2 MB.
- Implementacion de referencia de MLOps: sirve como plantilla de pipeline reproducible con Hydra + DVC + W&B + Hub para equipos que quieran estandarizar su flujo de experimentacion.
- Comparativa ViT vs CNN: la model card enlaza un hermano CNN (`chrisjcc/mnist-cnn`) y una demo Streamlit que permite contrastar ambos enfoques sobre la misma tarea.
- Prototipado de clasificadores de digitos en formularios escaneados: util como linea base antes de invertir en un OCR completo, siempre que las imagenes se normalicen a 28x28 con la polaridad correcta.
- Pruebas de integracion y CI: su tamano y latencia permiten incluirlo como smoke test en pipelines que validen el despliegue de modelos en CPU.
- Demostraciones educativas interactivas: la demo Streamlit permite dibujar un digito y ver la prediccion y confianza en tiempo real.
- Validacion de infraestructura de inferencia: con 540.170 parametros es adecuado para verificar end-to-end el empaquetado, carga de SafeTensors y serving antes de desplegar modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de MNIST (N = 10.000), no verificados de forma independiente:

| Metrica | Valor |
|---|---|
| Test accuracy | 0,9485 (94,85%) |
| Test cross-entropy loss | 0,1581 |
| Macro precision | 0,9494 |
| Macro recall | 0,9474 |
| Macro F1 | 0,9480 |
| Weighted F1 | 0,9485 |

Rendimiento por clase (precision / recall / F1 / soporte):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| 0 | 0,9542 | 0,9786 | 0,9662 | 980 |
| 1 | 0,9850 | 0,9868 | 0,9859 | 1135 |
| 2 | 0,9634 | 0,9438 | 0,9535 | 1032 |
| 3 | 0,9040 | 0,9604 | 0,9313 | 1010 |
| 4 | 0,9758 | 0,9430 | 0,9591 | 982 |
| 5 | 0,9699 | 0,9036 | 0,9356 | 892 |
| 6 | 0,9694 | 0,9593 | 0,9643 | 958 |
| 7 | 0,9099 | 0,9728 | 0,9403 | 1028 |
| 8 | 0,9504 | 0,9055 | 0,9274 | 974 |
| 9 | 0,9117 | 0,9207 | 0,9162 | 1009 |

Latencia y throughput medidos en CPU sobre 50 pasadas cronometradas tras 10 de calentamiento:

| Batch | Latencia media (ms) | Std (ms) | P50 (ms) | P95 (ms) | P99 (ms) | Throughput (muestras/s) |
|---|---|---|---|---|---|---|
| 1 | 0,831 | 0,300 | 0,712 | 1,317 | 2,013 | 1203,9 |
| 32 | 7,768 | 0,722 | 7,630 | 9,174 | 10,005 | 4119,7 |
| 128 | 30,236 | 2,708 | 29,503 | 33,610 | 40,826 | 4233,3 |

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en float32 (540.170 parametros, unos 2,16 MB de pesos mas activaciones minimas). Cabe en cualquier GPU consumer, iGPU o incluso en CPU.
- GPU recomendadas: ninguna en particular; el autor entreno y midio en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) ejecutara el modelo con el cuello de botella en el lanzamiento de kernels, no en el computo.
- Cabe en GPU consumer: si, en todas; tambien en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo con el paquete `mnist_pipeline`, exportacion a SafeTensors, y potencialmente TorchScript u ONNX (no documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes.
- Latencia y throughput: 0,831 ms de media por muestra en batch 1 y 4.233 muestras/s en batch 128 sobre CPU, segun las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Accuracy MNIST | Licencia | Notas |
|---|---|---|---|---|---|
| `chrisjcc/mnist-vit` | 540.170 | Clasificacion de digitos | 0,9485 | MIT | ViT minimalista, pipeline MLOps reproducible |
| `chrisjcc/mnist-cnn` | no disponible | Clasificacion de digitos | no disponible | no disponible | Hermano CNN del mismo autor, comparativa en demo Streamlit |
| CNN clasicas (LeNet-5, etc.) | del orden de 10^4-10^5 | Clasificacion de digitos | tipicamente >0,99 | variable | Referencia historica; no se aportan cifras verificadas en esta ficha |
| ViT-B/16 preentrenado en ImageNet | ~86 M | Clasificacion general de imagenes | no aplica directo | variable | Requiere fine-tuning; no comparable en tamano ni proposito |

No se dispone de datos verificados de los modelos alternativos en la informacion proporcionada; las cifras de CNN clasicas son orientativas y no deben tomarse como benchmark medido.

## Limitaciones y advertencias

- Solo clasifica un digito por imagen; no sirve para OCR multi-digito, texto alfanumerico ni deteccion de texto en escenas naturales (SVHN, ICDAR).
- Sensible a la polaridad: espera trazos blancos sobre fondo negro. Fotos de tinta oscura sobre papel blanco requieren inversion explicita (`invert=True`).
- Entrada rigida de 28x28 en escala de grises con normalizacion concreta (media 0,1307, desviacion 0,3081); cualquier desviacion degrada la precision.
- Accuracy del 94,85% en test, por debajo del estado del arte en MNIST (superior al 99% con CNN y aumentacion); las clases 8, 9 y 3 son las mas debiles.
- Entrenado solo 5 epocas en CPU sin aumentacion de datos ni busqueda de hiperparametros; margen de mejora evidente.
- Riesgo de alucinacion en sentido estricto no aplica (clasificador), pero si de predicciones erroneas con alta confianza en entradas fuera de distribucion.
- Sesgos: el dataset MNIST esta sesgado hacia escritura manuscrita de una poblacion concreta; el rendimiento puede caer con estilos de escritura no representados.
- Licencia MIT permite uso comercial sin restricciones practicas, pero el modelo no esta pensado para produccion real; usarlo como componente critico de un sistema de OCR seria inadecuado.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (`verified: false`); no hay evaluacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrisjcc/mnist-vit
- Modelo CNN hermano: https://huggingface.co/chrisjcc/mnist-cnn
- Demo interactiva Streamlit: https://huggingface.co/spaces/chrisjcc/mnist-lab
- Dataset MNIST original: https://huggingface.co/datasets/ylecun/mnist
- Dataset del autor: https://huggingface.co/datasets/chrisjcc/mnist-dataset
