# mrysh/qwen3.5-9b-prune_depth_10_lora_kd_int8_w8a16

## Resumen

`mrysh/qwen3.5-9b-prune_depth_10_lora_kd_int8_w8a16` es un checkpoint derivado de `Qwen/Qwen3.5-9B` que aplica una cadena de tres compresiones sucesivas: poda de profundidad (eliminación del 10 % de las capas), destilación LoRA desde el modelo original sin podar y, finalmente, cuantización de pesos a INT8 con activaciones de 16 bits (`int8_w8a16`). Lo publica el usuario mrysh como último paso de un experimento de compresión de LLM dentro de un benchmark propio.

El modelo conserva la arquitectura transformer de Qwen3.5 y un total de 8.298.581.952 parámetros, lo que lo sitúa ligeramente por debajo de los 9B nominales tras la poda. El resultado práctico es un checkpoint de 10,36 GB en disco (0,58× del original) que, según los datos del autor, mantiene el rendimiento en function calling casi intacto (89,3 % frente a 89,8 % del original en BFCL) y ofrece 76,0 tokens/s por usuario en vLLM sobre una NVIDIA L40, frente a 42,9 tokens/s del modelo sin comprimir.

Es relevante porque demuestra que una cadena poda → destilación → cuantización puede recuperar el colapso de capacidades que provoca la poda sola (BFCL cae del 89,8 % al 24,9 % con poda pura y vuelve al 89,3 % tras destilar y cuantizar), a costa de una pérdida moderada en conocimiento médico (MedQA 59,4 % frente a 74,0 %) y en razonamiento sobre sesgos (Hiring 79,5 % frente a 85,1 %). El modelo es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, `qwen3_5_text`); profundidad reducida un 10 % respecto al base |
| Parametros totales | 8.298.581.952 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 pesos (`int8_w8a16`), escala por canal de salida, sin datos de calibración; pesos originales en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que aplica la licencia del modelo base, `Qwen/Qwen3.5-9B`) |
| Formato de pesos | safetensors con `compressed-tensors` 0.17.0 |
| Tamano en disco | 10,36 GB (0,58× del original, 17,91 GB) |
| Modelo base | `mrysh/qwen3.5-9b-prune_depth_10_lora_kd` |
| Libreria de cuantizacion | `compressed-tensors` 0.17.0 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` y aplica tres transformaciones en cadena. Primero, una poda de profundidad que elimina el 10 % de las capas, dando lugar a `mrysh/qwen3.5-9b-prune_depth_10`. Segundo, una destilación LoRA desde el modelo original sin podar para recuperar las capacidades perdidas, generando `mrysh/qwen3.5-9b-prune_depth_10_lora_kd`. Tercero, una cuantización INT8 de pesos con activaciones FP16 mediante `compressed-tensors`, con una escala por canal de salida, redondeo simple y sin datos de calibración; el proceso tardó 144 segundos en una NVIDIA L40.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus de destilación más allá de la nota del autor de que contenía peticiones con el formato de los tests BFCL y MedQA, ni sobre si se aplicó RLHF o DPO. La cuantización no añade datos nuevos. La innovación técnica principal es la combinación de poda estructural con destilación LoRA para mitigar la degradación funcional, más una cuantización sin calibración que vLLM consume directamente sin flag `--quantization`.

## Capacidades

- Generación de texto y razonamiento general heredados de Qwen3.5-9B, con la profundidad reducida un 10 %.
- Function calling / tool calling: 89,3 % de precisión global en BFCL (977 preguntas), con 93,4 % en selección de una función y 86,4 % en llamadas múltiples simultáneas.
- Manejo correcto del caso "ninguna función encaja": 91,6 % de acierto.
- Formato de llamada válido en 771 de 774 respuestas (solo 3 sin formato válido).
- Razonamiento médico de opción múltiple: 59,4 % en MedQA (1273 preguntas).
- Razonamiento sobre sesgos en contratación: 79,5 % de precisión de decisión (288 preguntas).
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: el benchmark se ejecutó con thinking desactivado; no hay datos sobre su comportamiento con thinking activo.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Enrutado de herramientas en agentes: el modelo mantiene un 90,6 % de acierto eligiendo entre varias funciones y un 83,5 % en llamadas múltiples con elección, por lo que es adecuado como capa de decisión de tool calling en pipelines de agentes donde el coste por token importa.
- Servicio de inferencia de alto throughput: con 76,0 tokens/s por usuario en una L40 y 10,36 GB en disco, encaja en despliegues vLLM que necesitan más concurrencia que el modelo original (42,9 tokens/s) con el mismo hardware.
- Despliegue en GPUs de gama media: al ocupar 0,58× del tamaño original, permite servir un modelo de la familia 9B en tarjetas con menos VRAM que las requeridas por el checkpoint completo en BF16.
- Evaluación de pipelines de compresión: sirve como referencia reproducible para comparar poda, destilación y cuantización sobre una misma base, con métricas públicas de BFCL, MedQA y Hiring.
- Prototipado de asistentes con function calling en entornos de investigación: útil cuando se necesita un modelo pequeño con formato de llamada fiable (3 respuestas inválidas de 774) para validar esquemas de herramientas antes de pasar a producción.
- Clasificación y decisión estructurada con contexto corto: el 79,5 % en Hiring sugiere uso en tareas de decisión binaria o categórica donde la pérdida de unos pocos puntos frente al original es aceptable a cambio de velocidad y tamaño.
- No recomendado para: triaje médico o diagnóstico asistido, dado el descenso de 14,6 puntos en MedQA frente al original (59,4 % frente a 74,0 %).

## Benchmarks y rendimiento

Decodificación greedy, thinking desactivado, vLLM 0.34 sobre una NVIDIA L40, mismas preguntas para todos los modelos: 977 de BFCL, 1273 de MedQA y 288 de Hiring bias. Original = `Qwen/Qwen3.5-9B`.

| Metrica | Original | Pruned | Pruned + distillation | Este modelo |
|---|---|---|---|---|
| BFCL, precision global de function call | 89,8 % | 24,9 % | 88,8 % | 89,3 % |
| BFCL, una función | 92,1 % | 39,8 % | 93,4 % | 93,4 % |
| BFCL, elegir entre varias funciones | 92,8 % | 47,8 % | 90,6 % | 90,6 % |
| BFCL, varias llamadas a la vez | 87,7 % | 1,9 % | 84,6 % | 86,4 % |
| BFCL, varias llamadas con elección | 85,3 % | 1,8 % | 82,9 % | 83,5 % |
| BFCL, "ninguna función encaja" correcto | 91,6 % | 98,0 % | 91,6 % | 91,6 % |
| BFCL, respuestas sin formato de llamada válido (de 774) | 2 | 215 | 4 | 3 |
| MedQA, precisión de opción | 74,0 % | 39,1 % | 60,6 % | 59,4 % |
| Hiring bias, precisión de decisión | 85,1 % | 71,2 % | 79,9 % | 79,5 % |
| Tamano en disco (GB) | 17,91 | 16,62 | 16,62 | 10,36 |
| Velocidad (tokens/s, un usuario, vLLM, L40) | 42,9 | 47,1 | 47,1 | 76,0 |

Frente al modelo destilado sin cuantizar, este checkpoint gana 0,5 puntos en BFCL, pierde 1,2 en MedQA y 0,3 en Hiring; el autor señala que diferencias de uno o dos puntos están dentro del ruido (intervalo del 95 % de aproximadamente ±2 puntos en BFCL, ±3 en MedQA y ±5 en Hiring). El tamaño es 0,58× y la velocidad 1,77× la del original.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 10,36 GB en disco; con pesos INT8 y activaciones FP16, el peso de los parámetros ronda los 8,3 GB, más overhead de activaciones y caché KV. No se ha publicado una cifra oficial de VRAM pico.
- GPU recomendadas: NVIDIA L40 (única GPU validada por el autor, con vLLM 0.34). Por tamaño, debería caber en A100, H100, L40S y RTX 4090 de 24 GB, aunque solo la L40 está verificada.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y RTX 3090 (24 GB); no confirmado por el autor.
- Opciones de despliegue: vLLM, que detecta la configuración de cuantización desde `config.json` sin flag `--quantization`. Otros motores (llama.cpp, Ollama, TGI) no están documentados para este checkpoint.
- Latencia y throughput: 76,0 tokens/s por usuario en vLLM sobre una L40 con decodificación greedy y thinking desactivado. No hay datos de latencia por token ni de throughput agregado con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL (global) | MedQA | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (`int8_w8a16`) | 8,30B | no disponible | 89,3 % | 59,4 % | 10,36 GB | la del base (no disponible) | Hugging Face |
| `mrysh/qwen3.5-9b-prune_depth_10_lora_kd` (destilado, sin cuantizar) | no disponible | no disponible | 88,8 % | 60,6 % | 16,62 GB | la del base (no disponible) | Hugging Face |
| `Qwen/Qwen3.5-9B` (original) | ~9B nominales | no disponible | 89,8 % | 74,0 % | 17,91 GB | no disponible | Hugging Face |
| `mrysh/qwen3.5-9b-prune_depth_10` (solo poda) | no disponible | no disponible | 24,9 % | 39,1 % | 16,62 GB | la del base (no disponible) | Hugging Face |

## Limitaciones y advertencias

- Una sola cuantización y una sola evaluación por modelo, sin repeticiones; los intervalos del 95 % son de ±2 puntos en BFCL, ±3 en MedQA y ±5 en Hiring.
- Solo probado con vLLM 0.34 sobre una NVIDIA L40, thinking desactivado y decodificación greedy; el comportamiento con sampling, thinking activo u otros motores no está caracterizado.
- El corpus de destilación contenía peticiones con el formato de los tests BFCL y MedQA, lo que puede inflar las métricas en esos benchmarks respecto a un uso real fuera de distribución.
- Pérdida de 14,6 puntos en MedQA frente al original (59,4 % frente a 74,0 %): no apto para tareas médicas o de alto riesgo sin validación adicional.
- Pérdida de 5,6 puntos en Hiring bias (79,5 % frente a 85,1 %): el comportamiento en decisiones sensibles puede degradarse.
- La poda pura colapsa el function calling (24,9 % en BFCL, 215 respuestas inválidas de 774); el checkpoint depende críticamente de la destilación, no de la poda por sí sola.
- Licencia no declarada en la model card; el autor remite a la licencia de `Qwen/Qwen3.5-9B`. Verificar antes de uso comercial.
- Idiomas soportados no documentados; no hay garantías de rendimiento fuera del inglés de los benchmarks.
- Longitud de contexto no disponible en la información proporcionada.
- 0 descargas y 0 likes en Hugging Face: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_depth_10_lora_kd_int8_w8a16
- Modelo base (destilado): https://huggingface.co/mrysh/qwen3.5-9b-prune_depth_10_lora_kd
- Modelo intermedio (solo poda): https://huggingface.co/mrysh/qwen3.5-9b-prune_depth_10
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería de cuantización: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- Paper, blog o demo adicionales: no disponible
