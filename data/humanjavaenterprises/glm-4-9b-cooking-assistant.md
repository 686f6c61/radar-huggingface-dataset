# HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant

## Resumen
GLM-4-9B Cooking Assistant es un ajuste fino (fine-tune) no oficial del modelo GLM-4-9B-0414 de Zhipu AI (Z.ai), desarrollado por Humanjava Enterprises. Está especializado en asistencia culinaria: responde preguntas sobre platos, ingredientes, técnicas y seguridad alimentaria, y su comportamiento central consiste en leer la receta que se le proporciona en lugar de inventar detalles cuando no la tiene delante. El modelo resuelve un problema concreto de fiabilidad: reduce la fabricación de datos en preguntas que requieren una receta no mostrada del 40,1% del modelo base al 9,7%, y acierta el 96,2% cuando la receta sí está presente (frente al 83,1% del base), según la evaluación del autor con jueces abiertos de otras familias.

Arquitectónicamente es idéntico a GLM-4-9B-0414: un transformer denso de 9.400.279.040 parámetros (aproximadamente 9,4 mil millones), con el mismo tokenizador y la misma plantilla de chat GLM-4-0414. No incorpora modo de razonamiento (thinking mode). Los pesos se distribuyen en bf16 (safetensors, ~18,8 GB) y existe un repositorio hermano con cuantizaciones GGUF para llama.cpp, Ollama y LM Studio.

La relevancia actual del modelo radica en su enfoque de diseño: enseña comportamiento, no hechos. La configuración prevista es LoRA para el comportamiento, recuperación (retrieval) para los hechos y herramientas para los números. Está entrenado en 26 idiomas y evaluado en 21, y puede ejecutarse íntegramente en una GPU de 8 GB con cuantización Q4_K_M, o parcialmente descargado en 4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (GLM-4-0414), misma arquitectura y tokenizador que el modelo base |
| Parámetros totales | 9.400.279.040 (~9,4 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue con vLLM usa `--max-model-len 8192`) |
| Tipos de cuantización | bf16 (safetensors); GGUF en repositorio hermano, incluida Q4_K_M |
| Idiomas soportados | 26 idiomas de entrenamiento: en, es, pt, it, fr, nl, de, ru, bn, id, fa, ja, pl, sv, vi, tl, he, ml, tr, zh, ms, th, fi, ar, ta, hi; evaluado en 21 |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16); GGUF en repositorio separado |

## Arquitectura y entrenamiento
El modelo parte de zai-org/GLM-4-9B-0414 y conserva su arquitectura transformer densa, su tokenizador y su plantilla de chat (`[gMASK]<sop>` con turnos `<|system|>`, `<|user|>` y `<|assistant|>`). El entrenamiento se realizó en dos etapas: primero un LoRA supervisado y después un LoRA de preferencias (DPO) sobre el anterior. Ambas etapas se fusionaron en un único modelo bf16, de modo que los pesos publicados no requieren adaptadores separados. Los archivos GGUF del repositorio hermano se convierten a partir de estos pesos.

El ajuste no busca inculcar conocimiento factual, sino modificar el comportamiento: leer la receta aportada, pedirla cuando falta y marcar como típico cualquier rango que añada en ausencia de ella. El conjunto de evaluación es fijo y held-out, con 682 preguntas en 21 idiomas (290 con receta mostrada, 10 de recuerdo sin receta, 300 que requieren una receta no mostrada y 82 generales), y nunca se usó en entrenamiento. La evaluación emplea tres jueces de pesos abiertos ajenos a las familias GLM y Qwen (DeepSeek-V4-Flash, gpt-oss-120b y Seed-OSS-36B-Instruct), ciegos a qué modelo escribió cada respuesta, con una comprobación por reglas que descarta veredictos de invención cuando todos los detalles ya estaban en la pregunta.

## Capacidades
- Generación de texto conversacional especializada en cocina: platos, ingredientes, técnicas y seguridad alimentaria.
- Lectura y respuesta sobre recetas aportadas en el turno de usuario (respuesta correcta del 96,2% con receta mostrada).
- Abstención y petición de la receta cuando no se le proporciona, con reducción de invenciones al 9,7% (frente al 40,1% del base).
- Respuesta a preguntas generales de cocina (sustituciones, por qué falló un plato), aunque sin mejora respecto al modelo base en este apartado.
- Multilingüe: entrenado en 26 idiomas y evaluado en 21, incluidos español, portugués, francés, alemán, árabe, hindi, chino, japonés y tailandés, entre otros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento (thinking mode): no lo tiene, según la model card.
- Visión y audio: no disponibles.

## Casos de uso
- Asistente de cocina con recetas recuperadas: la aplicación busca la receta (por ejemplo, en una base de datos propia) y la inserta en el turno de usuario; el modelo responde a partir de ese texto en lugar de improvisar, lo que aprovecha su 96,2% de acierto con receta mostrada.
- Atención al cliente de una web de recetas: gestiona preguntas sobre ingredientes, tiempos y técnicas, y cuando el usuario pregunta por una receta concreta sin aportarla, solicita la cantidad o el texto original en lugar de inventar cifras.
- Control de seguridad alimentaria en asistentes de cocina: responde sobre conservación, temperaturas y contaminación cruzada con el system prompt recomendado, que incluye decir cuando no está seguro.
- Sustituciones de ingredientes en aplicaciones de planificación de menús: el modelo propone alternativas y explica el efecto en el plato, con la salvedad de que en preguntas generales no supera al base y conviene validar las respuestas críticas.
- Despliegue en local o en el borde: con Q4_K_M cabe en una GPU de 8 GB y parcialmente en 4 GB, lo que permite integrarlo en aplicaciones de escritorio o dispositivos con recursos limitados mediante llama.cpp, Ollama o LM Studio.
- Asistente multilingüe para comunidades de cocina: cubre 26 idiomas de entrenamiento, útil para foros o chats donde los usuarios preguntan en español, portugués, árabe o hindi, entre otros.
- Escalado y conversión de unidades en aplicaciones de recetas: la model card recomienda calcular estos valores con herramientas en lugar de dejarlos al modelo; el asistente puede integrarse en un pipeline donde la aritmética la resuelve el código y el modelo redacta la explicación.

## Benchmarks y rendimiento
Resultados del autor sobre el conjunto held-out de 682 preguntas en 21 idiomas, con jueces abiertos ajenos a GLM y Qwen y 2 de 3 jueces de acuerdo (intervalos de confianza del 95% entre corchetes):

| Métrica | GLM-4-9B-0414 (base) | Este modelo |
|---|---|---|
| Invención con 2 de 3 jueces (sin receta) | 40,1% [34,7; 45,8] | 9,7% [6,8; 13,6] |
| Invención con los 3 jueces | 28,1% | 3,7% |
| Invención con al menos 1 juez | 58,9% | 27,1% |
| Respuesta correcta con receta mostrada (2 de 3 jueces) | 83,1% | 96,2% |
| Preguntas generales de cocina (82 preguntas) | 56,1% | 46,3% (no estadísticamente significativo) |

En el análisis por pares, 104 preguntas solo las inventa el modelo base frente a 13 en las que solo inventa este modelo (McNemar p < 1e-18). De las 300 respuestas por columna, 299 cuentan (una respuesta de cada modelo carece del veredicto de un juez). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada en bf16: aproximadamente 18,8 GB de pesos, por lo que requiere alrededor de 20 GB o más para inferencia cómoda.
- VRAM estimada con Q4_K_M: cabe en una GPU de 8 GB; con descarga parcial, en 4 GB.
- GPU recomendadas: no se especifican modelos concretos en la información; por tamaño, encajan A100, H100 o RTX 4090 en bf16, y GPU consumer de 8 GB o más con cuantización.
- GPU consumer: sí, con cuantización Q4_K_M en 8 GB; ejecución parcial en 4 GB.
- Opciones de despliegue: Transformers, vLLM (`vllm serve ... --max-model-len 8192`), llama.cpp, Ollama y LM Studio mediante los GGUF del repositorio hermano.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-9B Cooking Assistant | ~9,4 mil millones | No disponible | Fine-tune culinario con abstención y lectura de recetas | MIT | Hugging Face (safetensors y GGUF) |
| GLM-4-9B-0414 (base) | ~9,4 mil millones | No disponible | Modelo generalista | No disponible en la información | Hugging Face (zai-org) |
| Qwen3-8B Cooking Assistant | No disponible en la información | No disponible | Mismo entrenamiento y mismas dos etapas sobre Qwen3-8B, evaluado con las mismas preguntas | No disponible en la información | Hugging Face (HumanjavaEnterprises) |

El modelo base sirve como referencia directa de rendimiento: este fine-tune mejora la abstención y la lectura de recetas, pero empeora ligeramente en preguntas generales (46,3% frente a 56,1%, sin significación estadística). El Qwen3-8B Cooking Assistant es la alternativa más directa porque comparte datos y metodología, lo que permite comparar el comportamiento del mismo ajuste sobre dos familias de modelos base distintas.

## Limitaciones y advertencias
- No mejora las respuestas generales de cocina: en las 82 preguntas generales puntúa por debajo del base (46,3% frente a 56,1%), aunque la diferencia no es estadísticamente significativa.
- No memoriza recetas: si no se le proporciona el texto, pedirá la receta o dará rangos marcados como típicos; no debe usarse como fuente de recetas concretas.
- Riesgo de invención persistente: aunque reducido al 9,7%, sigue inventando detalles en preguntas que requieren una receta no mostrada; con el criterio de un solo juez, la tasa sube al 27,1%.
- Los cálculos de escalado y conversión de unidades no son fiables por diseño; deben resolverse con herramientas externas.
- Es un fine-tune no oficial, no hecho ni respaldado por Zhipu AI / Z.ai; la licencia MIT se aplica a estos pesos, pero conviene revisar las condiciones del modelo base para uso comercial.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al heredar el modelo base, es previsible que arrastre los suyos.
- Cobertura idiomática desigual: entrenado en 26 idiomas y evaluado en 21, sin datos desglosados por idioma sobre calidad.
- Sin modo de razonamiento ni capacidades de visión o audio; el contexto máximo no está documentado y el ejemplo de despliegue limita a 8192 tokens.
- En producción conviene fijar una versión concreta mediante la etiqueta git (`revision="v1"`), ya que el autor publica versiones fechadas del mismo producto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant
- Repositorio GGUF: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF
- Versión equivalente sobre Qwen3-8B: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Modelo base: https://huggingface.co/zai-org/GLM-4-9B-0414
- Conjunto de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
