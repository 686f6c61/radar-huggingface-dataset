# sillykiwi/qwen35-9b-antidoom-qlora-only

## Resumen

El repositorio `sillykiwi/qwen35-9b-antidoom-qlora-only` contiene adaptadores LoRA entrenados mediante QLoRA (FTPO, según la model card) sobre el modelo base Qwen/Qwen3.5-9B. El objetivo declarado es corregir un comportamiento patológico del modelo base: la tendencia a entrar en bucles de repetición ("doom loops") que le impiden finalizar respuestas de razonamiento matemático. El autor sostiene, con mediciones emparejadas, que este bucle es intrínseco al modelo y no un artefacto de la compresión de la caché KV, corrigiendo así una afirmación previa de la propia model card.

El interés técnico del artefacto reside en su metodología de evaluación: el autor retiró un conjunto de 100 problemas por estar contaminado en un 70 % y volvió a medir sobre los 153 problemas de MATH-500 que no aportaron datos de entrenamiento, aplicando test de McNemar emparejado. Los adaptadores publicados son tres recetas distintas (`run9`, `combined-v2`, `combined-v2b`) entrenadas sobre los mismos 5.361 pares FTPO, con diferencias en el consumo de esos pares (cadena secuencial de tres etapas frente a una única pasada con parada temprana).

Se trata de un repositorio de adaptadores, no de un modelo completo: el peso descargable son los deltas LoRA, y el repo ocupa 19,5 GB. La licencia es "other" y no se especifican idiomas soportados ni pipeline. La relevancia actual es doble: por un lado, aborda un fallo de producción muy concreto (bucles de repetición que disparan el coste por respuesta correcta); por otro, documenta un caso ejemplar de decontaminación de benchmarks y de retirada pública de conclusiones no sostenidas por los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (QLoRA/FTPO) sobre transformer Qwen3.5-9B; el base combina 24 capas de atención lineal y 8 de atención completa (32 en total) |
| Parametros totales | No disponible para los adaptadores; el modelo base es Qwen3.5-9B (9B nominales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para los adaptadores; las evaluaciones usan límites de salida de 8k y 32k tokens y caché con `-c 16384` |
| Tipos de cuantizacion | Los adaptadores se entrenan con QLoRA; en inferencia el autor evalúa con caché KV cuantizada q4_0 (presupuesto 3072/4096/8192) y f16 sin comprimir |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El artefacto son adaptadores LoRA de bajo rango aplicados sobre Qwen3.5-9B, un transformer de 32 capas del que solo 8 usan atención completa: las otras 24 emplean atención lineal. Esta proporción determina el coste de la caché KV: con 4 cabezas KV y `head_dim` 256, cada token genera 16.384 elementos KV, lo que se traduce en 512 MiB en f16 con `-c 16384` frente a un arena q4_0 de 3.840 celdas (34 MiB) en el régimen comprimido.

El entrenamiento parte de 5.361 pares FTPO (pares de preferencia orientados a corregir el bucle). Se publican tres recetas: `run9`, una cadena secuencial de tres etapas (bucles cortos, saltos atrás, autorrevisión) donde cada etapa se entrena sobre la fusión de la anterior, con 3 ejecuciones y 2 fusiones; `combined-v2`, una única pasada con parada temprana en `chosen_win` 0,6 (35 pasos); y `combined-v2b`, igual pero con parada en 0,8 (130 pasos). El autor concluye que la ventaja aparente de la cadena se debe a la longitud acumulada de entrenamiento y no a la estructura por etapas: a 130 pasos de una sola pasada la diferencia desaparece (p=1,0000).

## Capacidades

- Razonamiento matemático con corrección del fallo de bucle: el adaptador convierte respuestas atascadas en respuestas correctas (26 arreglados frente a 5 rotos en el régimen de 8k con penalización).
- Finalización temprana de cadenas de razonamiento: reduce a la mitad los tokens de salida en el régimen de 32k (8.401 frente a 15.671) y rebaja un 56 % el coste por respuesta correcta.
- Supresión de autorrevisión de periodo largo: elimina el patrón de responder correctamente y quedarse atrapado en recomprobaciones hasta agotar el límite (18 de 153 problemas en el modelo sin entrenar; un caso reentró 71 veces en un ciclo de 228 palabras).
- Compatibilidad con decodificación penalizada: funciona de forma complementaria a `--repeat-penalty 1.10`, no redundante.
- Operación con caché KV comprimida: mantiene la precisión con presupuesto q4_0 de 3072 y 4096 celdas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo para estos adaptadores.

## Casos de uso

- Servicio de razonamiento matemático en producción: desplegar el adaptador sobre Qwen3.5-9B con llama.cpp, presupuesto de caché 3072 y `--repeat-penalty 1.10` para obtener 69,9 % de acierto con 59,5 s por respuesta correcta y 34 MiB de caché, el régimen de menor coste medido.
- Evaluación de modelos con límite de salida ajustado: usar el par de regímenes 8k/32k documentado para decidir si en el pipeline prima la precisión (86,9 % a 32k) o el throughput (68,0 % a 8k), con una diferencia de coste del 40 % por respuesta correcta.
- Sustitución de parches de inferencia por ajuste fino: cuando el equipo ya aplica penalizaciones de repetición y sigue observando bucles, añadir el adaptador aporta 3 problemas arreglados frente a 16 (p=0,004) sobre la penalización sola.
- Reproducción de experimentos de alineación: los tres adaptadores y las recetas publicadas permiten replicar el efecto de la longitud de entrenamiento (0, 35 y 130 pasos) sobre precisión y longitud de salida.
- Auditoría de benchmarks contaminados: el repositorio sirve como referencia metodológica para detectar y retirar conjuntos de evaluación contaminados (caso del 70 % en el conjunto de 100 problemas) y recalcular con test de McNemar emparejado.
- Despliegue en hardware con memoria limitada: el régimen comprimido reduce la caché KV 15,2 veces (512 MiB a 34 MiB), lo que permite servir contexto largo en GPU de menor VRAM.

## Benchmarks y rendimiento

Mediciones del autor sobre 153 problemas limpios de MATH-500, límite de salida 8k:

| Configuracion | Precision | Bucle | Seg / correcta | Cache KV |
|---|---|---|---|---|
| f16 KV sin comprimir, sin entrenar | 55,6 % | 48,4 % | 88,0 | 512 MiB |
| f16 KV + `--repeat-penalty 1.10` | 63,4 % | 12,4 % | 70,2 | 512 MiB |
| b3072 q4_0 + adaptador + penalizacion | 69,9 % | 7,2 % | 59,5 | 34 MiB |

Régimen de 32k con presupuesto de caché 8192, mismos 153 problemas:

| Configuracion | Precision | Bucle | Tokens medios | Seg / correcta |
|---|---|---|---|---|
| Sin entrenar | 72,5 % | 57,5 % | 15.671 | 185,5 |
| Adaptador `run9` | 86,9 % | 34,0 % | 8.401 | 82,2 |

Comparativa de adaptadores (mismos 5.361 pares):

| Adaptador | Receta | Coste de entrenamiento | 8k (153) | 32k |
|---|---|---|---|---|
| `run9` | Cadena de 3 etapas | 3 ejecuciones + 2 fusiones | 68,0 %, bucle 19,6 % | 86,9 % (153 problemas) |
| `combined-v2` | Una pasada, parada en 0,6 (35 pasos) | 1 ejecucion | 68,0 %, bucle 26,8 % | 86,7 % (30 problemas) |
| `combined-v2b` | Una pasada, parada en 0,8 (130 pasos) | 1 ejecucion | 67,3 %, bucle 19,6 % | 83,3 % (30 problemas) |

AIME (69 problemas limpios, límite 32k, presupuesto 3072): 20,0 % → 30,0 %, McNemar 0 frente a 7, p=0,0156.

## Requisitos de hardware

- El repositorio pesa 19,5 GB, lo que corresponde a los adaptadores y artefactos asociados; el modelo base Qwen3.5-9B debe descargarse por separado.
- VRAM para el modelo base: no disponible en la información proporcionada; depende de la cuantización elegida para los pesos de Qwen3.5-9B.
- Caché KV: 512 MiB en f16 con `-c 16384`; 34 MiB con presupuesto q4_0 de 3072 celdas (15,2 veces menos).
- GPU recomendadas: no disponibles. Las evaluaciones citadas se realizaron con llama.cpp, sin especificar el hardware.
- Despliegue: llama.cpp es el runtime documentado, con las opciones `--repeat-penalty 1.10`, límite de salida (`-c`) y presupuesto de caché KV (`b3072`, `b4096`, `b8192`). No se documentan vLLM, TGI, Ollama ni otros.
- Latencia: 59,5 s por respuesta correcta en el régimen 8k comprimido; 82,2 s en el régimen 32k con adaptador; 185,5 s sin adaptador a 32k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión MATH-500 (limpio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B sin adaptar | 9B | No disponible | 55,6 % (8k) / 72,5 % (32k) | No disponible | Hugging Face |
| Qwen3.5-9B + `--repeat-penalty 1.10` | 9B | No disponible | 63,4 % (8k) | No disponible | Solo ajuste de inferencia |
| Qwen3.5-9B + `run9` + penalizacion | 9B | No disponible | 69,9 % (8k) / 86,9 % (32k) | other | Hugging Face |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene únicamente adaptadores LoRA: no es un modelo autónomo y requiere el base Qwen3.5-9B.
- El propio autor retiró dos afirmaciones de una versión anterior de la model card (neutralidad a presupuesto 4096 y el titular 61 → 75); conviene tratar cualquier cifra no revalidada con cautela.
- Las cifras de 32k de `combined-v2` y `combined-v2b` se apoyan en solo 30 problemas, un subconjunto más fácil que el global (sin entrenar: 80,0 % frente a 72,5 %); son provisionales.
- El efecto del entrenamiento no es monótono: en el subconjunto de 30 problemas, la precisión va de 80,0 % (0 pasos) a 86,7 % (35 pasos) y baja a 83,3 % (130 pasos), lo que sugiere posible truncamiento del razonamiento necesario.
- El adaptador no sustituye a la penalización de repetición: aislado deja un 26,8 % de bucles, frente al 12,4 % de la penalización sola.
- Licencia "other": no se detallan condiciones de uso comercial; debe verificarse antes de producción.
- Idiomas soportados no documentados; el ajuste está orientado a razonamiento matemático en el conjunto MATH-500 y AIME, y no hay evidencia de transferencia a otras tareas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- La evaluación se realizó exclusivamente con llama.cpp; el comportamiento con otros runtimes no está medido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sillykiwi/qwen35-9b-antidoom-qlora-only
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
