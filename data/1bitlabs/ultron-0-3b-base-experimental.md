# 1bitLabs/ultron-0.3b-base-experimental

## Resumen

Ultron 0.3B es un modelo de lenguaje experimental desarrollado por 1bitLabs, diseñado como un artefacto de investigación para estudiar el escalado de modelos ternarios nativos. Con aproximadamente 305 millones de parámetros, cada peso del modelo es -1, 0 o +1 desde el inicio del entrenamiento, sin cuantización posterior. Esto lo convierte en un caso de estudio único para la familia BitNet, aunque su arquitectura difiere de la implementación estándar de Microsoft.

El modelo fue entrenado durante 14,3 días en una única GPU A100-SXM4-40GB alquilada, con un coste total de unos 235 dólares, sobre un corpus de 30 mil millones de tokens con predominio de código (65%). Su contexto es de 2048 tokens y su licencia es Apache 2.0. Es importante destacar que se trata de un modelo base experimental, no de un asistente listo para usar: continúa texto pero no sigue instrucciones, y su variante instruct incluida produce algoritmos frecuentemente incorrectos. No es compatible con bitnet.cpp ni llama.cpp sin parches, por lo que su runtime de referencia es PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso ternario nativo (FFN squared-ReLU de dos tensores, sin sub-norms) |
| Parametros totales | 305,45M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Ternario nativo (absmean ternary, escala por canal de salida, activaciones de 8 bits) |
| Idiomas soportados | Ingles (tokenizer SentencePiece, vocabulario de 32.000) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (.pt) con tokenizer y config embebidos |

## Arquitectura y entrenamiento

La arquitectura de Ultron 0.3B es un transformer denso con 26 capas, hidden size de 1024, 16 cabezas de query y 4 de KV (GQA), FFN con activacion squared-ReLU de dimension 3840 implementado con dos tensores sin puerta, y RMSNorm pre-norm sin sub-norms. Los embeddings estan atados y usa RoPE con base 10000. La cuantizacion ternaria es nativa: cada peso se inicializa y entrena directamente en el conjunto {-1, 0, +1} con escala por canal de salida, y las activaciones se cuantizan a 8 bits. Esta combinacion de arquitectura y cuantizacion no coincide con ningun grafo BITNET de llama.cpp, por lo que la conversion requeriria un parche.

El entrenamiento uso 30B tokens distribuidos en 65% codigo (The Stack, 10 lenguajes), 20% texto general (FineWeb-Edu), 10% matematicas (open-web-math, finemath) y 5% ciencia (peS2o). Se realizaron 228.882 pasos con lotes de 131.072 tokens, alcanzando una MFU de 14,3% y una val_loss final de 2,5064. El conjunto de validacion era 100% peS2o (ciencia), un dominio fuera de la distribucion de entrenamiento, lo que el autor reconoce como un error de diseno. No se aplico RLHF ni DPO; la variante instruct se obtuvo mediante SFT sobre un conjunto no especificado en la informacion disponible.

## Capacidades

- Generacion de texto: el modelo base continua texto de forma fluida, especialmente en codigo Python, donde reproduce la estructura formal (imports, clases, docstrings, guardas `__main__`) con fidelidad.
- Completado de codigo Python: en modo greedy, puede generar fragmentos cortos correctos (por ejemplo, el cuerpo de una funcion fibonacci), pero tiende a repetir verbatim hasta agotar el contexto.
- Terminacion de documentos: emite el token `<|endoftext|>` en limites de documento, con mediana de rango 2 en 20 pruebas forzadas, aunque en la practica solo 3 de 30 sondas muestreadas terminaron correctamente.
- Variante instruct: sigue especificaciones cortas de codigo Python, pero produce algoritmos frecuentemente incorrectos (por ejemplo, `s.lower() == s.lower()` para un palindromo).
- Capacidades multilingues: no disponible; el modelo solo soporta ingles.
- Tool calling y agentes: no soportado.
- Vision o audio: no soportado.

## Casos de uso

- Estudio de escalado ternario: investigadores pueden usar este modelo como punto de comparacion para medir el impacto de la cuantizacion nativa de 1,58 bits en la calidad de generacion frente a modelos de precision completa del mismo tamano.
- Analisis de la forma del codigo: el modelo es util para estudiar como los modelos de lenguaje aprenden la estructura superficial de Python (convenciones, formato, organizacion de archivos) independientemente de la correccion algoritmica.
- Base para fine-tuning experimental: dado su tamano reducido y licencia permisiva, puede servir como punto de partida para experimentos de post-entrenamiento con tecnicas como LoRA o SFT en dominios especificos.
- Generacion de plantillas de codigo: en tareas donde solo se necesita el esqueleto de un archivo Python (imports, estructura de clases, guardas), el modelo puede producir resultados utiles con muestreo.
- Educacion e investigacion en cuantizacion: el checkpoint incluye el codigo de inferencia (`ultron.py`) y la configuracion completa, lo que permite a estudiantes y desarrolladores inspeccionar como funciona un modelo ternario nativo por dentro.
- Comparacion de decodificacion: el autor documenta diferencias marcadas entre decodificacion greedy y muestreo; el modelo puede usarse para investigar como la estrategia de decodificacion afecta a la correccion y la fluidez en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta una val_loss de 2,5064 sobre un conjunto de validacion fuera de dominio (100% peS2o), y evaluaciones cualitativas internas con 30 sondas congeladas. Los resultados cualitativos muestran que el modelo falla en sintesis desde especificacion (7 de 7 sondas docstring-to-function incorrectas), matematicas (probabilidad de no sacar un seis calculada como 1/3) y codigo no Python (JavaScript degenera, Go inventa APIs, SQL repite LEFT JOINs).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; con 305M parametros ternarios y activaciones de 8 bits, el modelo deberia caber en menos de 1 GB de VRAM, pero el checkpoint pesa 2,4 GB (probablemente incluye estados de optimizador o formato sin optimizar).
- GPU recomendadas: el entrenamiento se realizo en una A100-SXM4-40GB; para inferencia, cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente, incluyendo tarjetas consumer como RTX 3060 o superiores.
- Compatibilidad con consumer GPU: si, siempre que se use el runtime PyTorch incluido.
- Opciones de despliegue: el unico runtime soportado es PyTorch mediante el script `ultron.py` incluido. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin modificaciones significativas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1bitLabs Ultron 0.3B | 305M | 2048 | Ternaria nativa | Apache 2.0 | Checkpoint PyTorch |
| BitNet b1.58 (Microsoft) | No disponible | No disponible | Ternaria (post-hoc) | MIT | Repos oficiales |
| GPT-2 (124M) | 124M | 1024 | FP32/FP16 | MIT | HuggingFace |

La comparacion directa es limitada porque Ultron 0.3B es un artefacto de investigacion experimental sin benchmarks publicados. Frente a BitNet b1.58, la diferencia clave es que Ultron entrena directamente con pesos ternarios desde el inicio, mientras que BitNet aplica cuantizacion durante el entrenamiento pero con una arquitectura distinta (FFN con puerta y sub-norms). Frente a GPT-2, Ultron tiene mas parametros y contexto, pero su calidad de generacion es significativamente inferior en tareas de razonamiento y correccion, como documenta el propio autor.

## Limitaciones y advertencias

- Modelo experimental: no apto para uso en produccion ni como asistente; el propio autor lo califica como "artefacto de investigacion".
- Alucinacion y errores frecuentes: falla sistematicamente en sintesis desde especificacion, matematicas y codigo no Python; los algoritmos generados son a menudo incorrectos aunque bien formateados.
- Problemas de terminacion: rara vez emite el token de fin de secuencia en la practica (3 de 30 sondas muestreadas, 0 de 30 en greedy); es imprescindible fijar un limite de longitud.
- Validacion fuera de dominio: la val_loss reportada se obtuvo sobre un conjunto 100% de ciencia (peS2o), fuera de la distribucion de entrenamiento, y no hay medicion de generalizacion dentro del dominio.
- Compatibilidad limitada: no funciona con bitnet.cpp, llama.cpp ni ninguna herramienta estandar; solo con el runtime PyTorch incluido.
- Idioma unico: solo soporta ingles; no hay capacidad multilingue.
- Variante instruct poco fiable: la version SFT incluida sigue especificaciones pero produce algoritmos incorrectos con frecuencia; no debe usarse para generacion de codigo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1bitLabs/ultron-0.3b-base-experimental
- Publicacion en X del autor: https://x.com/1bitlabs/status/2085423495572259058
- Perfil de 1bitLabs en X: https://x.com/1bitlabs
