# HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF

## Resumen
GLM-4-9B Cooking Assistant (GGUF) es una versión cuantizada del fine-tune GLM-4-9B-Cooking-Assistant, desarrollado por Humanjava Enterprises sobre el modelo base GLM-4-9B-0414 de Zhipu AI. Es un asistente de cocina especializado cuyo objetivo no es memorizar recetas, sino adoptar un comportamiento concreto: leer la receta que se le proporciona y responder a partir de ella, y abstenerse de inventar detalles cuando no dispone de la receta. El modelo base cuenta con 9.400.279.040 parámetros (9,4B) y esta versión se distribuye en formato GGUF para llama.cpp, Ollama y LM Studio.

La relevancia del modelo reside en su enfoque sobre el problema de la alucinación en dominios factuales: según la model card, cuando se le pregunta algo que requiere una receta que no se le ha mostrado, inventa detalles el 9,7% de las veces, frente al 40,1% del GLM-4-9B-0414 base. Cuando se le proporciona la receta, acierta el 96,2% de las veces, frente al 83,1% del base. Estas cifras provienen de tres jueces abiertos de otras familias de modelos, con concordancia de 2 de 3.

El modelo está entrenado en 26 idiomas y evaluado en 21, y puede ejecutarse íntegramente en una GPU de 8 GB con la cuantización Q4_K_M, o parcialmente descargado en 4 GB. Se trata de un fine-tune no oficial, no producido ni respaldado por Zhipu AI / Z.ai. La versión de precisión completa en safetensors está disponible en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GLM-4-0414); detalles internos no disponibles |
| Parametros totales | 9.400.279.040 (9,4B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 8.192 tokens en los ejemplos de despliegue de la model card; máximo no especificado |
| Tipos de cuantizacion | Q4_K_M (6,2 GB), Q6_K (8,3 GB), Q8_0 (10,0 GB), BF16 (18,8 GB); matriz de importancia incluida |
| Idiomas soportados | 26 idiomas de entrenamiento (en, es, pt, it, fr, nl, de, ru, bn, id, fa, ja, pl, sv, vi, tl, he, ml, tr, zh, ms, th, fi, ar, ta, hi); evaluado en 21 |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); safetensors en el repo de precisión completa |

## Arquitectura y entrenamiento
El modelo es un fine-tune del GLM-4-9B-0414, un transformer denso de 9,4B parámetros. La model card no detalla la arquitectura interna más allá de indicar la plantilla de chat GLM-4-0414 (`[gMASK]<sop>` con turnos `<|system|>`, `<|user|>`, `<|assistant|>`) y que no dispone de modo de razonamiento (thinking mode). El entrenamiento se realizó en dos etapas sobre el mismo dataset empleado para el Qwen3-8B Cooking Assistant, con datos de conversaciones con y sin receta, e incluye una fase de DPO (etiqueta `dpo` en el repositorio). El objetivo declarado es enseñar comportamiento, no hechos: lectura de recetas, abstención ante información ausente y respuesta a preguntas generales de cocina.

Una innovación destacable es el uso de una matriz de importancia (importance matrix) calculada sobre conversaciones de entrenamiento en formato chat, estratificada por tipo de pregunta y por si se mostró una receta, para construir las cuantizaciones Q4_K_M y Q6_K; ninguna de esas conversaciones está en el conjunto de evaluación. Además, debido a que la anchura de la capa feed-forward de GLM-4-9B no encaja en el tamaño de bloque de las k-quants, llama.cpp almacena algunos tensores de proyección descendente a mayor precisión (20 como Q8_0 y 20 como Q5_0 en Q4_K_M; los 40 como Q8_0 en Q6_K), lo que añade unos 0,4 GB a Q4_K_M.

## Capacidades
- Generación de texto conversacional orientada a cocina: platos, ingredientes, técnicas y seguridad alimentaria.
- Lectura de recetas proporcionadas en el turno del usuario: responde a partir del texto pegado.
- Abstención ante recetas ausentes: pide la receta original en lugar de inventar cantidades o detalles, pudiendo añadir rangos típicos marcados como tales.
- Respuesta a preguntas generales de cocina: sustituciones de ingredientes, causas de fallos en un plato, seguridad alimentaria.
- Multilingüe: entrenado en 26 idiomas y evaluado en 21.
- Compatibilidad con tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card indica que no hay thinking mode.
- Capacidades de visión o audio: no disponibles.
- Integración con llama.cpp, Ollama y LM Studio mediante plantilla de chat, system prompt y parámetros incluidos en el repositorio.

## Casos de uso
- Asistente de cocina en aplicación de recetas: la app recupera la receta de una base de datos y la pasa al modelo en el turno del usuario; el modelo responde a preguntas sobre tiempos, temperaturas y sustituciones citando el texto proporcionado, lo que encaja con su 96,2% de acierto cuando la receta está presente.
- Atención al cliente de una marca de alimentación: gestiona consultas sobre ingredientes, alérgenos y conservación, y cuando la pregunta requiere una receta concreta que no tiene, solicita los datos en lugar de inventarlos, reduciendo respuestas incorrectas en un dominio sensible.
- Chatbot de seguridad alimentaria: responde sobre temperaturas de cocción, conservación y contaminación cruzada; su entrenamiento específico en seguridad alimentaria lo hace adecuado para consultas domésticas frecuentes.
- Asistente de cocina multilingüe: al estar entrenado en 26 idiomas, puede atender usuarios en español, inglés, portugués, árabe, hindi, chino, japonés o malayo, entre otros, con una única instancia.
- Escalado y conversión de unidades en recetas: la model card recomienda que los cálculos numéricos se realicen con herramientas externas y que el modelo solo interprete el resultado; es adecuado como capa conversacional sobre una calculadora o un servicio de conversión.
- Despliegue en hardware modesto: con Q4_K_M ocupa 6,2 GB y usa 6,0 GB a contexto de 8k con caché KV q8_0, por lo que puede ejecutarse en una GPU de 8 GB o con descarga parcial en 4 GB, lo que lo hace viable en estaciones de trabajo sin aceleradores de gama alta.
- Evaluación de comportamiento de abstención: útil como referencia para investigar la calibración y la abstención en modelos de 9B, dado que la model card publica métricas comparadas con el modelo base sobre un conjunto fijo de 682 preguntas.

## Benchmarks y rendimiento
Los resultados publicados en la model card provienen del conjunto fijo de 682 preguntas en 21 idiomas, nunca usado en entrenamiento: 290 con receta mostrada, 10 de recuerdo sin receta, 300 que requieren una receta no mostrada y 82 preguntas generales. Las respuestas fueron puntuadas por jueces de pesos abiertos de otras familias, a ciegas, con concordancia de 2 de 3.

| Metrica | GLM-4-9B Cooking Assistant | GLM-4-9B-0414 (base) |
|---|---|---|
| Inventa detalles sin receta (2 de 3 jueces) | 9,7% | 40,1% |
| Acierta con receta mostrada (2 de 3 jueces) | 96,2% | 83,1% |
| Preguntas generales de cocina (82) | 46,3% | 56,1% (no significativo estadísticamente) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: Q4_K_M usa 6,0 GB a contexto de 8k con caché KV q8_0; Q6_K usa 7,8 GB a 8k; Q8_0 requiere 10 GB o más; BF16 ocupa 18,8 GB en disco.
- GPU recomendadas: tarjetas de 8 GB para Q4_K_M (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070), 10 GB o más para Q8_0 (RTX 3080, RTX 4080), y GPUs de datacenter (A100, H100) para BF16 o despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, con Q4_K_M en 8 GB; con descarga parcial en 4 GB.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...:Q4_K_M --jinja -c 8192`), Ollama (`ollama run vveerrgg/glm-4-9b-cooking-assistant` o `hf.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF:Q4_K_M`), LM Studio y vLLM/Transformers con la versión safetensors de precisión completa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-4-9B Cooking Assistant (GGUF) | 9,4B | 8.192 en ejemplos | MIT | GGUF, safetensors | Fine-tune de cocina con abstención entrenada; 96,2% de acierto con receta mostrada |
| Qwen3-8B Cooking Assistant | 8B (según nombre) | no disponible | MIT (según repositorio) | safetensors, presumiblemente GGUF | Mismo dataset y mismo proceso de dos etapas sobre Qwen3-8B; sirve de comparación directa |
| GLM-4-9B-0414 (base) | 9,4B | no disponible | no disponible | safetensors | Modelo base sin fine-tune; inventa detalles el 40,1% de las veces sin receta |

## Limitaciones y advertencias
- Las respuestas generales de cocina no mejoran respecto al modelo base: 46,3% frente a 56,1% en las 82 preguntas generales, diferencia no estadísticamente significativa.
- El fine-tune enseña comportamiento, no hechos: no memoriza recetas y depende de que la aplicación le proporcione el texto de la receta.
- Riesgo de alucinación residual: inventa detalles el 9,7% de las veces cuando falta la receta, por lo que conviene verificar información crítica como temperaturas de seguridad o alérgenos.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades de visión o audio.
- El contexto máximo no está especificado más allá de los 8.192 tokens usados en los ejemplos; recetas muy largas pueden requerir truncado o fragmentación.
- Ollama no lee la plantilla de chat embebida en el GGUF; es necesario usar los archivos `template`, `system` y `params` del repositorio o la etiqueta de librería indicada.
- Es un fine-tune no oficial, no producido ni respaldado por Zhipu AI / Z.ai; la licencia MIT se aplica al artefacto publicado, pero conviene revisar las condiciones del modelo base.
- Los benchmarks publicados se basan en jueces automáticos de pesos abiertos con concordancia de 2 de 3, no en evaluación humana exhaustiva.
- Los cálculos numéricos (escalado de recetas, conversión de unidades) deben hacerse con herramientas externas, no confiarse al modelo.

## Enlaces
- Repositorio GGUF: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF
- Modelo de precisión completa (safetensors): https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant
- Versión equivalente en Qwen3-8B: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Conjunto de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- Etiqueta de Ollama: `vveerrgg/glm-4-9b-cooking-assistant`
