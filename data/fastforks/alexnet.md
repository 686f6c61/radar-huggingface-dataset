# fastforks/alexnet

## Resumen

AlexNet es la red neuronal convolucional presentada por Alex Krizhevsky, Ilya Sutskever y Geoffrey Hinton en 2012, un hito que marcó el inicio del auge del aprendizaje profundo en visión por computador. Esta ficha corresponde al repositorio `fastforks/alexnet`, una integración del modelo original en la librería fastforks, que actúa como capa de compatibilidad y optimización sobre los pesos oficiales publicados por PyTorch.

El repositorio no aloja pesos: es una model card que describe cómo fastforks descarga los pesos originales (`alexnet-owt-7be5be79.pth`) desde los servidores de PyTorch y los verifica mediante SHA-256. El modelo resuelve clasificación de imágenes en ImageNet-1k (1000 clases) con una entrada fija de 224x224 píxeles y salida de logits.

Su relevancia actual es principalmente educativa, de referencia y de validación de infraestructura: sirve como caso base para comparar rendimiento entre implementaciones (portable frente a kernels CUDA propios) y como modelo de juguete para pipelines de clasificación. Con aproximadamente 60 millones de parámetros, es un modelo histórico que no compite en precisión con arquitecturas modernas, pero sí en simplicidad y coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (5 capas convolucionales + 3 capas fully connected) |
| Parametros totales | no disponible (aproximadamente 60 M para AlexNet estándar; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 224x224) |
| Tipos de cuantizacion | fp32 y fp16 (según la model card); no se documentan otras |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Código BSD-3-Clause; pesos sin licencia declarada por los autores (`bsd-3-clause-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch, `alexnet-owt-7be5be79.pth`); no se alojan en el repo |
| Tarea | Clasificación de imágenes (ImageNet-1k) |
| Entrada | Imagen RGB, redimensionado lado corto 256 y recorte central a 224x224 |
| Salida | Logits de 1000 clases |
| Backends | `portable` (PyTorch) y `kernels` (CUDA propio) |
| Librería | fastforks |

## Arquitectura y entrenamiento

AlexNet es una red neuronal convolucional clásica compuesta por cinco capas convolucionales seguidas de tres capas totalmente conectadas. La implementación referenciada corresponde al código de `pytorch/vision` en el commit `1f1a920d685d`, con pesos entrenados sobre ImageNet-1k (ILSVRC 2012). La model card no detalla hiperparámetros de entrenamiento, número de tokens (no aplica), composición del dataset más allá de ImageNet-1k, ni si hubo técnicas de alineación como RLHF o DPO (no procede en un modelo de clasificación).

La innovación técnica destacable en este repositorio no está en el modelo en sí, sino en la infraestructura de fastforks: ofrece dos backends. El backend `portable` ejecuta PyTorch estándar en GPU o CPU. El backend `kernels` utiliza kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) descargados desde `fastforks/kernels` según la arquitectura de GPU, con fallo explícito (`BackendUnavailableError`) si no hay kernel precompilado, sin fallback silencioso. Se verifica paridad numérica con el código original: en CPU float32, diferencia máxima absoluta ≤ 0.002; en GPU float16, diferencia media ≤ 0.02 px y p99 ≤ 0.08 px.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k, devolviendo logits y top-k.
- Inferencia en GPU (CUDA) y CPU mediante el backend `portable`.
- Aceleración opcional mediante kernels CUDA propios en el backend `kernels`.
- Entrada de tamaño fijo 224x224 (redimensionado y recorte central documentados).
- Soporte de precisión fp32 y fp16.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imagen.

## Casos de uso

- Clasificación rápida de imágenes en pipelines de preprocesado: el modelo procesa una imagen 224x224 en torno a 1 ms en el backend `portable` y 0,7 ms en `kernels` sobre RTX 5060 Ti, lo que permite etiquetar lotes grandes con bajo coste.
- Validación de infraestructura de inferencia: sirve como caso base para comprobar que un entorno CUDA, drivers y kernels funcionan correctamente antes de desplegar modelos mayores.
- Docencia y experimentación: su arquitectura simple (5 convoluciones y 3 fully connected) lo hace adecuado para explicar conceptos de CNN, transferencia de aprendizaje y comparación de implementaciones.
- Pruebas de paridad numérica: útil para verificar que una implementación propia reproduce los resultados del código de referencia de PyTorch dentro de las tolerancias documentadas.
- Prototipado de sistemas de clasificación con recursos mínimos: con un pico de memoria de 151 MiB en `portable` y 184 MiB en `kernels`, cabe en GPUs de gama baja y en entornos con memoria limitada.
- Benchmarking de kernels y comparación de backends: permite medir la ganancia de kernels CUDA propios frente a PyTorch estándar (1,8x frente al original y 1,5x frente a portable en el caso documentado).
- Filtrado o triaje previo en aplicaciones de visión: como primera etapa de bajo coste para descartar o etiquetar imágenes antes de modelos más pesados.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120, clasificación sintética 224x224):

| Modelo | Tiempo (ms): original fp32 | original | portable | kernels | Aceleración kernels vs original | vs portable | Memoria pico (MiB, asignada/reservada): original | portable | kernels |
|---|---|---|---|---|---|---|---|---|---|
| `alexnet.tv_in1k` | 1,17 | 1,82 | 0,97 | 0,66 | 1,8x | 1,5x | 383 / 404 | 151 / 224 | 184 / 268 |

Carga y primera llamada:

| Modelo | Carga (s): original | portable | kernels | Primera llamada (s): original | portable | kernels |
|---|---|---|---|---|---|---|
| `alexnet.tv_in1k` | 2,51 | 1,30 | 0,76† | 0,81 | 0,02 | 0,00 |

Tamaño fijo, todos los modos:

| Modelo | Modo | 224x224 (tiempo ms / pico asignado / reservado MiB) |
|---|---|---|
| `alexnet.tv_in1k` | portable | 1,0 / 152 / 272 |
| `alexnet.tv_in1k` | kernels | 0,7 / 185 / 310 |

No se han publicado resultados de benchmarks de precisión (top-1, top-5 en ImageNet) en la información disponible; solo se documenta la paridad numérica con el código original.

## Requisitos de hardware

- VRAM estimada: pico asignado de 151 MiB en backend `portable` y 184 MiB en `kernels` (reservado 224 y 268 MiB respectivamente) para 224x224 en fp16.
- GPU recomendadas: cualquier GPU NVIDIA compatible con el driver reciente para el backend `kernels`; el benchmark se realizó en RTX 5060 Ti 16 GB (sm_120). El backend `portable` funciona en cualquier GPU CUDA o en CPU.
- Cabe holgadamente en GPU de consumo: con menos de 200 MiB de pico asignado, cualquier GPU con al menos 1 GB de VRAM es suficiente.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), con selección de backend mediante `mode="portable"`, `mode="kernels"` o `mode="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de clasificación de este tipo).
- Latencia y throughput: 1,0 ms por imagen en `portable` y 0,7 ms en `kernels` en el hardware de referencia; primera llamada de 0,02 s en `portable` y 0,00 s en `kernels`; carga del modelo de 1,30 s en `portable` y 0,76 s en `kernels`.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlexNet (fastforks) | no disponible (≈60 M en AlexNet estándar) | 224x224 | Clasificación ImageNet-1k | Código BSD-3-Clause; pesos sin licencia declarada | Hugging Face (model card) + pesos en download.pytorch.org |
| VGG16 | no disponible en la información | 224x224 | Clasificación ImageNet-1k | no disponible en la información | no disponible en la información |
| ResNet-50 | no disponible en la información | 224x224 | Clasificación ImageNet-1k | no disponible en la información | no disponible en la información |

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento ni licencia de los modelos alternativos, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo histórico de 2012: su precisión en ImageNet-1k es muy inferior a la de arquitecturas modernas (ResNet, EfficientNet, ViT); no se recomienda para producción donde la exactitud sea crítica.
- Sesgos conocidos: al entrenarse solo con ImageNet-1k, hereda los sesgos de clases y de representación de ese dataset; la model card no documenta análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de entrada: solo acepta imágenes RGB redimensionadas y recortadas a 224x224; no soporta otras resoluciones ni modalidades.
- Restricciones de licencia: el código es BSD-3-Clause, pero los autores no declaran licencia separada para los pesos. La model card indica "commercial use: yes" asumiendo BSD-3-Clause del código, pero advierte de comprobar las condiciones antes de cualquier uso; el paquete se describe como de uso de investigación.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` sin fallback.
- El repositorio no contiene pesos: depende de la disponibilidad de los enlaces externos de PyTorch y de la verificación SHA-256 para garantizar integridad.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni multilingüismo.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/alexnet
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original (pytorch/vision, commit 1f1a920d685d): https://github.com/pytorch/vision
- Licencia del código original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
- Pesos originales: https://download.pytorch.org/models/alexnet-owt-7be5be79.pth
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/alexnet/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
