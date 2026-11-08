# AhoosAI/nimbus-3-apex-x75

## Resumen

Nimbus 3 Apex X75 es un adaptador LoRA de rango 64 publicado por AhoosAI para el modelo base Qwen/Qwen3-14B. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (256.901.120 parámetros en safetensors, 1,5 GB), que deben aplicarse sobre los pesos originales de Qwen3-14B, distribuidos por separado bajo su propia licencia. El adaptador se publica a "tres cuartos de fuerza": el `lora_alpha` es 96 frente a un `r` de 64, mientras que en entrenamiento se usó 128; los pesos son los entrenados y solo cambia ese factor de escala.

El objetivo declarado del adaptador es dotar al modelo base de una identidad propia: según la model card, responde correctamente 34 de 40 preguntas de identidad donde el base no acierta ninguna (85 frente a 0), manteniendo el rendimiento del base en instrucciones, rechazos seguros y tablas. Sin embargo, pierde de forma estadísticamente significativa en tool calling de un solo turno (82,5 a 76,0, p = 0,047).

Es relevante ahora como ejemplo de adaptación ligera con evaluación rigurosa frente al base: el autor publica intervalos de significación, recuentos de preguntas corregidas y rotas, y advierte explícitamente de que el adaptador no supera a su base salvo en identidad. Existe un hermano del mismo entrenamiento, Nimbus 3 Apex X50, a media fuerza, y un X100 a fuerza completa no publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-14B |
| Parametros totales | 256.901.120 (solo adaptador); el base Qwen3-14B no se redistribuye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-14B) |
| Tipos de cuantizacion | GGUF (adaptador publicado en GGUF para llama.cpp); base en Q4_K_M en las evaluaciones |
| Idiomas soportados | en, fa |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF |
| Rango LoRA | r = 64, alpha publicado = 96 (entrenado con alpha 128) |
| Modelo base | Qwen/Qwen3-14B |
| Metodo de entrenamiento | QLoRA (base en 4 bits), PML-sRUN desde ~step 600 |
| Tokens entrenados | 369.652.673 |
| Filas de datos | 113.596 puntuadas; 1.252 de identidad; 6.900 agenticas |
| Steps | 3.949 de 4.521 planificados (parada manual) |
| Held-out loss | 0,5892 |
| Hardware de entrenamiento | 2x T4 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado sobre Qwen3-14B, un transformer decoder-only del que no se detallan aquí más especificaciones que las heredadas del base. El entrenamiento se hizo en QLoRA, con el base cuantizado a 4 bits, sobre 2x T4, con 369.652.673 tokens y 113.596 filas puntuadas, de las cuales 1.252 corresponden a identidad y 6.900 a datos agenticos. Se completaron 3.949 de los 4.521 steps planificados, con parada manual, y se alcanzó una pérdida held-out de 0,5892.

La innovación destacable no es arquitectónica sino de publicación: el autor libera el mismo entrenamiento a distintas intensidades (X50 a media fuerza, X75 a tres cuartos, X100 a fuerza completa sin publicar), modificando únicamente el `lora_alpha` aplicado. El X75 usa alpha 96 frente al 128 de entrenamiento. La model card documenta además que a fuerza completa el adaptador aprendió su identidad pero perdió de forma significativa en cuatro benchmarks (instrucciones, rechazos seguros, tablas y tool calling de un turno), y que las intensidades publicadas son aquellas donde ese olvido desaparece (X50) o queda reducido a un solo benchmark (X75).

## Capacidades

- Generación de texto sobre el base Qwen3-14B, con el adaptador aplicado.
- Identidad propia: 34 de 40 preguntas de identidad respondidas correctamente frente a 0 del base.
- Seguimiento de instrucciones conservado (IFEval 88 frente a 89 del base, diferencia no significativa).
- Rechazos seguros conservados (XSTest 69 frente a 69, sin cambio).
- Generación de tablas conservada o ligeramente mejorada (TableBench 78 frente a 75, no significativo).
- Tool calling de un solo turno degradado (BFCL v4 76,0 frente a 82,5 del base, pérdida significativa).
- Capacidades multilingües limitadas a inglés y persa según los metadatos del modelo.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Asistente con identidad de marca definida: el adaptador permite que el modelo se identifique consistentemente como el producto de AhoosAI en conversaciones de cara al usuario, manteniendo el resto de comportamiento del base. Adecuado cuando la identidad del asistente es un requisito de producto.
- Despliegue ligero sobre infraestructura existente de Qwen3-14B: al ser un adaptador de 1,5 GB, se puede aplicar sobre una instancia ya desplegada del base sin duplicar los pesos de 14B, reduciendo coste de almacenamiento y distribución.
- Evaluación comparativa de técnicas de adaptación: sirve como caso de estudio reproducible de LoRA con evaluación estadística frente al base, útil para investigadores que quieran medir el coste real de un adaptador sobre benchmarks concretos.
- Generación de tablas y respuestas estructuradas: con TableBench en 78 (frente a 75 del base), es apto para tareas de tabulación donde no se requiera tool calling.
- Filtrado y moderación con rechazos seguros: XSTest se mantiene en 69, por lo que conserva el comportamiento del base ante peticiones inseguras, útil en pipelines de contenido donde el rechazo correcto importa.
- Experimentación con intensidades de adaptador: junto con X50, permite comparar el efecto de media y tres cuartos de fuerza sobre el mismo entrenamiento, útil para calibrar cuánta identidad se puede añadir sin degradar capacidades.
- No recomendado para agentes con tool calling de un solo turno: la pérdida medida en BFCL v4 (p = 0,047) desaconseja su uso en pipelines de function calling donde el base o X50 rinden mejor.

## Benchmarks y rendimiento

Evaluación contra el base con las mismas preguntas, semillas y servidor (llama.cpp con Qwen3-14B-Q4_K_M.gguf y el adaptador aplicado por el servidor). p es un test de signos bilateral sobre las preguntas cuya respuesta cambió.

| Benchmark | Qwen3-14B | Nimbus 3 Apex X75 | Cambio | Corregidas | Rotas | p | Veredicto |
|---|---:|---:|---:|---:|---:|---:|---|
| Identity (40) | 0 | 85 | +85 | 34 | 0 | 0,000 | ganancia real |
| IFEval (100) | 89 | 88 | -1 | 5 | 6 | 1,000 | ruido |
| XSTest (100) | 69 | 69 | 0 | 11 | 11 | 1,000 | ruido |
| TableBench (100) | 75 | 78 | +3 | 10 | 7 | 0,629 | ruido |
| BFCL v4, single turn (200) | 82,5 | 76 | -6,5 | 12 | 25 | 0,047 | pérdida real |

Global-MMLU (persa), HumanEval+, MMLU-Pro, MATH-500 y BFCL multi-turn no se ejecutaron a esta intensidad. A fuerza completa (X100) ninguno de ellos se movió más allá del azar, según la model card.

## Requisitos de hardware

- VRAM para inferencia: el adaptador suma 1,5 GB a los requisitos del base Qwen3-14B. Con el base en Q4_K_M (usado en las evaluaciones) se puede ejecutar en GPUs de 16-24 GB; en FP16 el base requiere del orden de 28 GB solo para pesos, más caché KV.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) viable con cuantización Q4_K_M o Q5; 2x T4 fue el hardware de entrenamiento, suficiente para inferencia cuantizada.
- Cabe en GPU de consumo: sí, con el base cuantizado en GGUF (Q4_K_M) en tarjetas de 16 GB o más; en 8 GB no es viable con 14B de base.
- Despliegue: llama.cpp con `llama-server -m Qwen3-14B-Q4_K_M.gguf --lora nimbus-3-apex-x75.gguf --jinja`; PEFT con `PeftModel.from_pretrained` sobre `Qwen/Qwen3-14B`; vLLM y TGI no se documentan en la información disponible para adaptadores LoRA de este repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Identidad (40) | BFCL v4 single turn (200) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Qwen3-14B (base) | Modelo completo | 14B | no disponible | 0 | 82,5 | Apache-2.0 (propia de Qwen) | Hugging Face |
| Nimbus 3 Apex X75 | LoRA r64, alpha 96 | 256,9 M (adaptador) | heredado del base | 85 | 76,0 | Apache-2.0 | Hugging Face |
| Nimbus 3 Apex X50 | LoRA r64, media fuerza | no disponible | heredado del base | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Nimbus 3 Apex X100 | LoRA r64, fuerza completa | no disponible | heredado del base | no disponible | no disponible | no publicada | No publicado |

El X75 se diferencia del base en identidad (ganancia real) y en tool calling de un turno (pérdida real); en el resto de benchmarks medidos la diferencia no es significativa. El X50 es la alternativa recomendada por el autor cuando el tool calling es crítico.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere los pesos de Qwen3-14B, que no se redistribuyen en este repositorio.
- Pérdida significativa en tool calling de un solo turno (BFCL v4: 82,5 a 76,0, p = 0,047); el autor recomienda X50 o el base si el tool calling es el caso de uso principal.
- Benchmarks no ejecutados a esta intensidad: Global-MMLU (persa), HumanEval+, MMLU-Pro, MATH-500 y BFCL multi-turn; su comportamiento en estas tareas no está medido.
- A fuerza completa (X100) el adaptador perdió de forma significativa en cuatro benchmarks; el X75 mitiga pero no elimina ese riesgo en tool calling.
- Idiomas limitados a inglés y persa según los metadatos; no se documenta soporte de castellano.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan los del base Qwen3-14B.
- El adaptador está pensado para añadir identidad, no para mejorar capacidades; la model card lo declara explícitamente ("no es un modelo que supere a su base").
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación de la comunidad.
- Licencia Apache-2.0 para el adaptador; el base conserva su propia licencia, que debe respetarse por separado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AhoosAI/nimbus-3-apex-x75
- Hermano a media fuerza (X50): https://huggingface.co/AhoosAI/nimbus-3-apex-x50
- Página completa con todos los benchmarks: https://ahoos-ai.site/news/int-pages/nimbus-3-apex.html
- Sitio del autor: https://ahoos-ai.site/
- Perfil del autor en Hugging Face: https://huggingface.co/AhoosAI
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- GGUF del base: https://huggingface.co/Qwen/Qwen3-14B-GGUF
