# bong-water-water-bong/Ternary-Bonsai-2-27B-unrotated-Q4_0

## Resumen

Ternary-Bonsai-2-27B-unrotated-Q4_0 es una conversión del modelo Ternary-Bonsai-2-27B de Prism ML, publicada por el usuario bong-water-water-bong. El modelo original almacena sus pesos ternarios ya rotados mediante una transformada de Hadamard de Sylvester-Walsh de tamaño 1024 aplicada por bloques sobre el eje de entrada; esta versión elimina esa rotación de los pesos y los recuantiza a Q4_0, de modo que un producto matricial cuantizado convencional produce el resultado correcto sin necesidad de aplicar la transformada a las activaciones en tiempo de ejecución.

El objetivo es habilitar el despliegue en backends que empaquetan pesos en tiles fijos de int8 o 4 bits y los ejecutan en aceleradores de función fija (NPU, DSP, kernels de GPU con cuantizador fijo), donde no existe un lugar donde insertar la transformada sobre activaciones. La arquitectura subyacente es un híbrido GDN/linear-attention de 64 capas con 5120 dimensiones ocultas, 26.895.998.464 parámetros y una ventana de contexto de 262.144 tokens.

La relevancia de esta ficha es doble: por un lado documenta una técnica de conversión poco habitual (des-rotación exacta de pesos ternarios), y por otro advierte de sus límites, en particular la reaparición de canales de activación con colas pesadas que pueden degradar la cuantización de activaciones aunque los pesos sean correctos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GDN/linear-attention (64 capas, `full_attention_interval` 4), dimensión oculta 5120 |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q4_0 (este repositorio); el upstream usa PTQ1_0 ternario (1,75 bpw, 28 B por 128 pesos, trits en {-1, 0, +1}) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (851 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 64 capas con atención híbrida: combina capas de atención completa con capas de atención lineal del tipo GDN (Gated Delta Network), intercaladas con un intervalo de atención completa de 4. La dimensión oculta es 5120 y el contexto declarado alcanza los 262.144 tokens. El modelo upstream almacena 402 tensores en formato ternario (1,75 bits por peso) y otros 449 tensores (normalizaciones, sesgos, `ssm_a`, `ssm_dt`, `ssm_conv1d` y el resto de componentes no ternarios) en precisión convencional.

La innovación técnica de esta conversión es la des-rotación de los pesos. En el modelo original, cada peso cuantizado se guarda como `W_stored = W_true · S · H`, donde `H` es una transformada de Hadamard normalizada de Sylvester-Walsh de tamaño 1024 aplicada por bloques y `S` es un vector de signos ±1 fijo por anchura de entrada. El motor de referencia aplica `H` y `S` a las activaciones antes de cada producto matricial. Esta versión mueve la rotación de vuelta a los pesos y recuantiza a Q4_0, formato que representa el retículo ternario de forma exacta (código `trit + 8`, escala `d`, cero `-8d`). La des-rotación se verifica como exacta: `max |rotate(unrotate(W)) − W| = 0` sobre los 26.869.760.000 pesos, con 0 discrepancias de trit. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni las etapas de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso previsto para diálogo multi-turno.
- Razonamiento y generación de código: no se documentan capacidades específicas más allá de la generación de texto genérica; no disponible confirmación explícita.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas no está poblado en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue mediante la infraestructura de inferencia de Hugging Face.

## Casos de uso

- Despliegue en aceleradores de función fija: el caso de uso central de esta conversión es ejecutar el modelo en NPU, DSP o kernels de GPU con cuantizador fijo que no pueden aplicar la transformada de Hadamard a las activaciones en tiempo de ejecución. Al llevar la rotación a los pesos, un producto matricial Q4_0 estándar produce la respuesta correcta.
- Integración en pipelines GGUF existentes: al mantener nombres, orden, dimensiones y número de tensores (851), el modelo puede sustituir al upstream en herramientas compatibles con GGUF sin cambios en el grafo.
- Conversación de contexto largo: con 262.144 tokens de ventana, es adecuado para asistentes que deben razonar sobre documentos extensos o historiales de diálogo prolongados en una sola pasada.
- Prototipado en hardware de gama media: la cuantización Q4_0 reduce el peso a 15,2 GB, lo que permite evaluar el modelo en estaciones con GPU de 24 GB frente a los requisitos del formato ternario original.
- Investigación sobre cuantización: sirve como referencia para estudiar el efecto de la des-rotación sobre la distribución de activaciones y comparar Q4_0 frente a Q4_1 (el autor estima cos ≈ 0,99932 para Q4_1).
- Validación de conversiones: los scripts incluidos (`ptq1-unrotate.py`, `ptq1-patch.py`, `logits/dump.sh`, `logits/compare.py`) permiten reproducir la conversión y verificar logits contra el fichero original, útil en equipos que auditan artefactos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor incluye únicamente una verificación de logits contra el fichero upstream con el mismo prompt y motor de decodificación greedy:

| Pesos | cos | max\|d\| | slope | top-5 |
|---|---|---|---|---|
| f16 (exacto) | 0,999996 | 0,0651 | 0,9991 | 5/5 |
| Q4_0 (este repo) | 0,999174 | 0,8916 | 1,0012 | 5/5 |

Los top-5 logits son idénticos en todos los casos (271, 198, 1061, 561, 248046) y la correlación por elemento de los top-100 logits es 0,997. La diferencia de cos de 8,2e-4 en Q4_0 se atribuye únicamente al redondeo de la segunda cuantización (8,7 % de RMS relativo en el espacio de pesos, de media cero por bloque de 32 pesos). El autor advierte que la verificación se hizo sobre los logits de un solo prompt, no sobre perplejidad ni una suite de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15,2 GB en Q4_0; se debe reservar memoria adicional para el contexto KV, que con 262.144 tokens y 64 capas resulta considerable y no está cuantificado en la información disponible.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, el modelo encaja en GPUs de 24 GB (RTX 4090, L4) para contextos moderados y requiere A100/H100 de 40-80 GB para contextos largos.
- ¿Cabe en GPU de consumo? Sí, en Q4_0 cabe en GPUs de 24 GB como la RTX 4090, siempre que se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF; el tag `endpoints_compatible` indica soporte en los endpoints de Hugging Face. No se confirma compatibilidad con vLLM o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-unrotated-Q4_0 (este) | 26,9 B | 262.144 | Q4_0, pesos des-rotados | Apache 2.0 | Hugging Face, GGUF |
| prism-ml/Ternary-Bonsai-2-27B-gguf (upstream) | 26,9 B | 262.144 | PTQ1_0 ternario (1,75 bpw) | Apache 2.0 | Hugging Face, GGUF |
| Alternativas de ~27 B en Q4 | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo upstream. La diferencia principal es el formato de pesos: el upstream mantiene la rotación de Hadamard y requiere un motor que la aplique a las activaciones, mientras que esta versión la elimina de los pesos a cambio de una segunda cuantización a Q4_0 y de la pérdida del suavizado de activaciones.

## Limitaciones y advertencias

- Verificación limitada: la validación se hizo sobre los logits de un único prompt, no sobre perplejidad ni una suite de evaluación; el autor espera un comportamiento del mismo orden, no idéntico.
- Canales de activación con colas pesadas: al des-rotar, desaparece el suavizado de activaciones y reaparecen canales outlier. Esto afecta especialmente a la cuantización de activaciones (por ejemplo, int8 por columna con `amax/127`), aunque los pesos sean correctos.
- Pérdida de precisión por doble cuantización: el payload ternario es una aproximación realizada en la base rotada; la recuantización no recupera los flotantes previos a la cuantización. El redondeo al trit más cercano recupera el 99,9999976 % de los trits, no el 100 %.
- Dependencia del formato Q4_0: se eligió porque representa el retículo ternario de forma exacta; otros formatos pueden no preservarlo.
- Idiomas: no se declaran idiomas soportados, lo que impide garantizar calidad multilingüe.
- Sesgos y alucinación: no hay información publicada sobre sesgos conocidos ni tasas de alucinación; se aplican los riesgos habituales de un modelo de 27 B sin evaluación específica.
- Licencia: Apache 2.0 permite uso comercial, pero el autor pide citar la publicación original de Prism ML. Los cambios respecto al upstream se limitan a la des-rotación y la recuantización Q4_0.
- Trazabilidad: el repositorio tiene 35 descargas y 0 likes, y procede de un autor independiente; conviene auditar los scripts de conversión antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bong-water-water-bong/Ternary-Bonsai-2-27B-unrotated-Q4_0
- Modelo base (upstream): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Scripts de conversión y verificación incluidos en el repositorio: `ptq1-unrotate.py`, `ptq1-patch.py`, `logits/dump.sh`, `logits/compare.py`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
