# SonNX24042005/fringerprint-pad

## Resumen

`cvrl_s1_l2sp_replay` es un modelo de detección de ataques de presentación (PAD, *presentation attack detection*) para huellas dactilares, publicado por el usuario SonNX24042005 en Hugging Face. No se trata de un modelo de lenguaje, sino de un clasificador de imágenes binario construido sobre DenseNet-121 que distingue entre una huella dactilar real (`live`) y una falsificación (`spoof`). Resuelve un problema clásico de biometría: evitar que un sensor de huella acepte materiales como gelatina, silicona o impresiones en papel.

El modelo se distribuye como un artefacto TorchScript en FP32 que se puede cargar directamente sin necesidad de definir la arquitectura en código, lo que simplifica su despliegue en producción. Trabaja con entradas RGB de 224×224 píxeles normalizadas con estadísticas de ImageNet y devuelve logits de dos clases. Incluye una estrategia de agregación de múltiples recortes (`adaptive_multipatch`, batch de 5) que promedia los logits antes de aplicar softmax.

La relevancia actual del modelo es acotada: se trata de un artefacto con cero descargas y cero *likes* en el momento de redactar esta ficha, sin licencia declarada y con una model card escrita en vietnamita. Aun así, los resultados reportados en los conjuntos LivDet son buenos y el formato TorchScript facilita su evaluación. Conviene tratarlo como un experimento reproducible más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (CNN, clasificador de 2 clases) |
| Parametros totales | no disponible (pesos TorchScript de 29.131.297 B, 28 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (solo se publica FP32) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | TorchScript `.pt` (FP32) |

Especificaciones adicionales de entrada y salida:

| Parametro | Valor |
|---|---|
| Entrada | tensor `float32` `[batch, 3, 224, 224]`, canales RGB |
| Normalizacion | `/255.0` y luego media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]` |
| Salida | tensor `float32` `[batch, 2]` de logits (`0 = live`, `1 = spoof`) |
| Agregacion multipatch | media de logits en el eje batch, batch de 5 recortes |
| Umbral por defecto | `score_spoof >= 0.50` se clasifica como `spoof` |
| SHA-256 del peso | `b50e1621a08d7803f6011618985ca706ce3412b17dee81814dcd4cd72e65b06e` |

## Arquitectura y entrenamiento

El modelo es una DenseNet-121 adaptada a clasificación binaria (capa final de 2 salidas). Según la model card, se ha afinado con la técnica de regularización L2-SP (*L2-SP*, penalización L2 hacia los pesos del modelo original) combinada con *replay* de datos limpios, un esquema pensado para mitigar el olvido catastrófico al adaptar un clasificador preentrenado a un nuevo dominio de sensores. No se especifican el número de tokens (no aplica), el tamaño del conjunto de entrenamiento ni la composición exacta del *dataset*.

La innovación operativa destacable no está en la arquitectura, sino en el contrato de inferencia: el modelo se exporta como traza TorchScript con batch dinámico, lo que permite cargarlo con `torch.jit.load` sin código de arquitectura y ejecutarlo tanto en CPU como en GPU. La model card reporta una diferencia máxima absoluta de `0.0` entre la salida TorchScript y el modelo PyTorch FP32 original, tanto con batch 1 como con batch 5, lo que indica una conversión numéricamente exacta. La estrategia `adaptive_multipatch` promedia los logits de cinco recortes de la misma huella antes de decidir, lo que reduce la varianza frente a una única captura.

## Capacidades

- Clasificación binaria de imágenes de huellas dactilares: `live` frente a `spoof`.
- Detección de ataques de presentación con distintos materiales y sensores (según los conjuntos de evaluación reportados).
- Inferencia por lotes con batch dinámico gracias a la traza TorchScript.
- Agregación de múltiples recortes (`adaptive_multipatch`) para robustecer la decisión.
- Ejecución en CPU o GPU sin dependencia de código de arquitectura.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de visión puro.
- No se declaran capacidades de *thinking mode*, visión general, audio ni generación de texto.

## Casos de uso

- Control de acceso biométrico con sensor de huella: el modelo se sitúa entre la captura y la comparación 1:1 o 1:N para rechazar presentaciones falsas antes de ejecutar el *matcher*, reduciendo el coste computacional de ataques.
- Autenticación en dispositivos de consumo (móviles, portátiles, cerraduras): al ser un DenseNet-121 de 28 MB en FP32, puede ejecutarse en CPU con latencia baja y sin GPU dedicada.
- Validación de calidad en pipelines de enrolamiento: antes de registrar una huella en una base de datos, el clasificador filtra capturas que parecen falsificaciones y evita contaminar el *gallery*.
- Auditoría de sensores y *benchmarking* interno: el artefacto TorchScript permite reproducir las métricas LivDet declaradas y comparar sensores o materiales de ataque en un laboratorio.
- Investigación en anti-*spoofing*: sirve como línea base reproducible para experimentos de *domain adaptation* entre sensores (CrossMatch, GreenBit, etc.) gracias al esquema L2-SP con *replay*.
- Filtrado previo en sistemas de verificación remota: en escenarios donde se envían imágenes de huellas desde un dispositivo no confiable, el modelo puede descartar capturas sospechosas antes de procesarlas.
- Integración en *edge*: al exportarse como TorchScript y no requerir dependencias de arquitectura, se puede incrustar en servicios de inferencia ligeros o en aplicaciones de escritorio.

## Benchmarks y rendimiento

Resultados reportados en la model card con `adaptive_multipatch` y umbral 0,50:

| Conjunto | Imagenes | Sensores | ACC | BPCER | APCER | ACER | ROC-AUC |
|---|---:|---:|---:|---:|---:|---:|---:|
| LivDet 2009–2013 | 29.892 | 11 | 97,01 % | 2,41 % | 3,59 % | 3,00 % | 0,9955 |
| LivDet 2015 Testing | 10.443 | 4 (23 materiales) | 99,08 % | 1,29 % | 0,64 % | 0,96 % | 0,9996 |
| LayerStack V10 | 2.473 (solo spoof) | 7 materiales | deteccion 98,18 % | — | — | — | — |

Desglose de LayerStack V10 por sensor: CrossMatch 98,71 % y GreenBit 97,40 %. La diferencia máxima absoluta entre TorchScript y PyTorch FP32 original es `0.0` con batch 1 y batch 5.

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con otros modelos PAD) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 28 MB de pesos en FP32 y entradas de 224×224, el consumo es muy bajo (del orden de cientos de MB incluyendo activaciones y *frameworks*).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria; no se requieren A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son suficientes.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU moderna con más de 2 GB de VRAM.
- También funciona en CPU: el ejemplo de la model card carga el modelo con `map_location="cpu"`.
- Opciones de despliegue: `torch.jit.load` en PyTorch (CPU o GPU); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que la categoría de referencia son los modelos PAD de huella dactilar evaluados en LivDet, pero no se aportan datos de alternativas concretas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `cvrl_s1_l2sp_replay` (este) | no disponible (28 MB FP32) | no aplica | no disponible | Hugging Face |
| Alternativas PAD de huella | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial sin contactar con el autor.
- Cero descargas y cero *likes*: no hay evidencia de uso en producción ni de validación independiente.
- Model card en vietnamita: la documentación puede ser difícil de interpretar para equipos hispanohablantes.
- Solo se publica FP32 en TorchScript; no hay versiones cuantizadas (INT8, FP16) ni ONNX, lo que limita el despliegue en *hardware* muy restringido.
- Los benchmarks son autoinformados y no se acompañan de scripts de evaluación reproducibles en el repositorio.
- Riesgo de sesgo de dominio: el rendimiento depende del sensor y del material de ataque; los resultados en LivDet no garantizan generalización a sensores no vistos.
- Riesgo de falsos negativos y falsos positivos: un umbral fijo de 0,50 puede no ser adecuado para todos los despliegues; conviene calibrar según la aplicación.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, *tool calling* ni agentes.
- La fecha de creación del repositorio (2026-11-14) y la falta de actualizaciones sugieren un artefacto aislado sin mantenimiento declarado.

## Enlaces

- Hugging Face: https://huggingface.co/SonNX24042005/fringerprint-pad
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
