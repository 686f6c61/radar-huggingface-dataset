# MergenAI/SIMURG

## Resumen

SIMURG (checkpoint `simurg-pulse`) es un detector de alucinaciones y degradacion de salida en streaming para modelos de lenguaje, desarrollado por MergenAI. No es un modelo generativo: es un clasificador de texto que observa una respuesta mientras se generan los tokens y dispara una alarma calibrada en el momento en que la salida degenera. Los modos de fallo que cubre son bucles de repeticion, deriva entre idiomas (cross-lingual drift), regurgitacion o eco de tablas y colapso estructural, que son los que acaban enviando texto alucinado o basura al usuario.

Tecnicamente es una red muy pequena: dos capas de TransformerEncoder con normalizacion previa, dimension oculta 64, 4 cabezas de atencion y una FFN de 256 unidades, con un total de 345.665 parametros y un checkpoint de ~1,3 MB en safetensors. La entrada se tokeniza en trigramas de caracteres con hash determinista (blake2b) sobre un vocabulario de 4096 cubos, con una ventana de 256 trigramas (~600 caracteres de cola). La inferencia tarda ~4 ms por ventana en MPS y admite fallback a CPU, muy por debajo del ritmo de generacion de cualquier LLM vigilado.

Su relevancia actual esta en el nicho de los guardarrailes de inferencia: se integra como el sexto detector de un ensemble que ya incluye cinco detectores estadisticos, sin bloquear el stream que protege, y es reentrenable contra cualquier endpoint compatible con OpenAI para aprender los modos de fallo especificos de un despliegue concreto. Como contrapartida, es un modelo practicamente sin adopcion publica (0 descargas y 0 likes en el momento de la consulta) y su unica metrica declarada (AUROC 0,925) esta marcada como no verificada por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 2x TransformerEncoder (norm-first, dropout 0,05) con pooling de media enmascarada y cabeza LayerNorm -> Linear(64, 1) |
| Parametros totales | 345.665 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256 trigramas (~600 caracteres de cola); no es contexto generativo |
| Tipos de cuantizacion | no se documentan; el checkpoint safetensors de ~1,3 MB corresponde a pesos en float32 |
| Idiomas soportados | en (ingles); la tokenizacion por trigramas de caracteres es agnostica al idioma, pero el entrenamiento y la calibracion son en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador binario de ventanas de texto. Cada ventana se tokeniza en trigramas de caracteres, se mapea de forma determinista a 4096 cubos de hash (el indice 0 queda reservado para padding izquierdo) y se rellena hasta 256 posiciones. La red aplica dos bloques de TransformerEncoder con normalizacion previa, 4 cabezas de atencion, feedforward de 256 unidades con ReLU y embeddings posicionales aprendidos; el pooling es una media enmascarada sobre las posiciones no rellenas. La cabeza produce un unico logit que se calibra mediante dos anclas almacenadas en los metadatos del checkpoint: `p = clamp((sigmoid(z) - lo) / (hi - lo), 0, 1)`, con `lo = 0,168` (percentil 95 de puntuaciones limpias en held-out) y `hi = 0,367` (mediana de puntuaciones corruptas en held-out). Asi la salida es directamente comparable con la de los cinco detectores estadisticos del ensemble.

El entrenamiento combina respuestas limpias reales (40 respuestas en vivo del endpoint vigilado, `wahoo-1.5-preview` servido con vLLM, mas un corpus limpio empaquetado) con 240 streams corruptos generados por CorruptBench (bucles de repeticion, deriva entre idiomas, eco de tablas y basura estructural). El etiquetado es consciente del onset: una ventana solo se marca como corrupta cuando su borde derecho esta al menos 300 caracteres por detras del inicio real de la corrupcion. La funcion de perdida es BCE-with-logits con `pos_weight` inverso a la frecuencia, optimizada con AdamW (lr 5e-4, weight decay 1e-4, batch 64, 8 epocas) y seleccion del mejor checkpoint por validacion. La tokenizacion usa un hash blake2b estable, de modo que entrenamiento e inferencia sobre el mismo texto producen tensores identicos.

## Capacidades

- Clasificacion binaria de degradacion de salida en streaming, con probabilidad calibrada entre 0 y 1.
- Deteccion de bucles de repeticion, deriva entre idiomas, eco o regurgitacion de tablas y colapso estructural.
- Evaluacion por ventanas deslizantes de ~600 caracteres con ventana fija de 256 trigramas.
- Funcionamiento sin bloquear el stream vigilado: la inferencia (~4 ms por ventana en MPS) queda muy por debajo del ritmo de tokens de cualquier modelo generativo.
- Degradacion elegante: si faltan torch, safetensors o el fichero de pesos, el ensemble se comporta exactamente como el nucleo numpy de cinco detectores estadisticos.
- Reentrenamiento contra cualquier endpoint compatible con OpenAI (`/v1/chat/completions`), con prompts personalizados via JSONL, para aprender modos de fallo propios.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No dispone de tool calling ni de soporte de agentes como modelo autonomo; su papel es el de componente de monitorizacion dentro de un pipeline de agentes.

## Casos de uso

- Guardarrail de chatbots en produccion: el detector se ejecuta sobre cada ventana de la respuesta mientras llega el stream y permite abortar o regenerar la respuesta en cuanto la probabilidad calibrada se dispara, evitando enviar bucles de repeticion o texto colapsado al usuario.
- Pasarelas de inferencia autoalojadas: al entrenarse contra cualquier endpoint compatible con OpenAI (`SIMURG_LIVE_URL`, `SIMURG_LIVE_MODEL`), se puede calibrar un detector especifico para el modelo servido con vLLM y desplegarlo junto a la pasarela.
- Deteccion de citas fabricadas o deriva de numeros: el tutorial de fine-tuning permite generar pares (limpio, corrompido) especificos de un dominio para que el detector aprenda ese modo de fallo caracteristico y lo registre automaticamente en el ensemble.
- Monitorizacion de pipelines RAG: la clase de corrupcion de eco de tablas y regurgitacion permite detectar cuando el modelo esta copiando literalmente fragmentos del contexto recuperado en lugar de responder.
- Control de coste por tokens: cortar la generacion cuando la salida degenera evita facturar tokens basura en APIs de pago y reduce el tiempo de GPU consumido por respuestas que se van a descartar.
- Evaluacion comparativa de modelos y proveedores: puntuar streams de distintos modelos con la misma ventana y umbral, y usar la senal como metrica de estabilidad de salida en pruebas internas.
- Agentes multi-paso: insertar el detector como verificador por paso para detectar cuando una respuesta intermedia colapsa antes de propagar el error a las siguientes llamadas de herramienta.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Deteccion de alucinaciones en streaming | CorruptBench + live wahoo-1.5-preview | AUROC en held-out | 0,925 | No (declarado por el autor) |

Comportamiento declarado por clase en el conjunto de demostracion:

| Entrada | Probabilidad (pulse) |
|---|---|
| Prosa limpia | 0,000 |
| Bucle de repeticion | 1,000 |
| Deriva entre idiomas | 1,000 |
| Eco de tabla estructural | 1,000 |

Metricas de operacion declaradas: latencia de inferencia ~4 ms por ventana en MPS, anclas de calibracion `lo = 0,168` y `hi = 0,367`, y fallback a CPU soportado. No se han publicado resultados de benchmarks adicionales ni comparaciones con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB; el checkpoint pesa ~1,3 MB y el modelo tiene 345.665 parametros en float32.
- GPU recomendadas: no requiere GPU. Funciona en CPU y aprovecha MPS en Apple Silicon (~4 ms por ventana). Cualquier GPU consumer (por ejemplo una RTX 3060 o superior) es mas que suficiente, aunque no aporta ventaja practica.
- Cabe en cualquier GPU consumer y en equipos sin GPU; el propio autor documenta la ejecucion en Apple Silicon y el fallback a CPU.
- Opciones de despliegue: paquete `simurg` (`pip install "simurg[deep]"`), donde el checkpoint se autorregistra como sexto detector del ensemble; tambien carga directa del safetensors con `safetensors.torch.load_file` para inferencia independiente. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo.
- Seleccion de checkpoint propio mediante la variable de entorno `SIMURG_PULSE_WEIGHTS`.
- Throughput estimado: ~250 ventanas por segundo en MPS segun la latencia declarada de ~4 ms por ventana (calculo derivado, no publicado como cifra por el autor). Al no bloquear el stream, el coste efectivo es despreciable frente al ritmo de generacion.
- Coste de reentrenamiento: el entrenamiento se ejecuta en CPU en segundos, segun la model card.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros detectores de alucinaciones (por ejemplo clasificadores tipo SelfCheckGPT, Lookback Lens o detectores basados en entropia), ni cifras de AUROC, latencia o tamano de esas alternativas.

| Modelo | Parametros | Contexto | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MergenAI/SIMURG (simurg-pulse) | 345.665 | 256 trigramas (~600 caracteres) | AUROC 0,925 (no verificada) | apache-2.0 | HuggingFace (0 descargas, 0 likes en la consulta) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Punto de referencia interno si esta documentado: el ensemble SIMURG combina este checkpoint con cinco detectores estadisticos, y el modelo se disena para degradar con elegancia a ese nucleo numpy cuando no hay pesos disponibles.

## Limitaciones y advertencias

- No es un modelo generativo ni un asistente: solo clasifica ventanas de texto en busca de degradacion de salida.
- No detecta alucinaciones factuales sutiles; su objetivo son modos de fallo observables (repeticion, deriva de idioma, eco de tabla, colapso estructural).
- La ventana es fija y corta (256 trigramas, ~600 caracteres), por lo que no modela dependencias de contexto largo.
- El etiquetado es consciente del onset y exige 300 caracteres de retardo respecto al inicio real de la corrupcion: existe un margen inherente de deteccion tardia.
- La calibracion esta anclada a los percentiles de un conjunto concreto (`lo = 0,168`, `hi = 0,367`); en otros dominios o modelos puede requerir recalibracion.
- El entrenamiento usa 240 streams corruptos sinteticos y 40 respuestas limpias en vivo del endpoint `wahoo-1.5-preview`; el detector puede no generalizar bien a modelos, idiomas o dominios distintos sin reentrenamiento.
- La unica metrica publicada (AUROC 0,925) esta marcada como `verified: false` y no se ha validado de forma independiente.
- El modelo solo esta documentado para ingles; aunque la tokenizacion por trigramas de caracteres sea agnostica al idioma, no hay evidencia de rendimiento en otros idiomas.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes) y repositorio de pesos de 0 GB, lo que limita la evidencia de uso en produccion.
- La licencia de los pesos es Apache 2.0, que permite uso comercial, pero el codigo del ensemble vive en un repositorio de GitHub cuya licencia debe revisarse por separado.
- La copia disponible de la model card esta truncada en el paso 3 del tutorial de fine-tuning, por lo que la receta de reentrenamiento no esta completa en la informacion proporcionada.
- No se declaran sesgos especificos, pero al entrenarse sobre un unico endpoint y corpus en ingles, es esperable un sesgo hacia los patrones de ese modelo y dominio.

## Enlaces

- HuggingFace: https://huggingface.co/MergenAI/SIMURG
- Repositorio del proyecto: https://github.com/doofzoff/SIMURG
- Paper: https://ssrn.com/abstract=7451269
- Busqueda web: no se han encontrado resultados relevantes; las entradas devueltas corresponden a enlaces de Outlook (https://outlook.live.com/...) y no guardan relacion con el modelo.
