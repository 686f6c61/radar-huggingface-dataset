# ptybcy/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de razonamiento denso de 1.770 millones de parametros (1.78B) obtenido mediante destilacion del modelo DeepSeek-R1 de DeepSeek AI sobre la arquitectura Qwen2.5-Math-1.5B. Forma parte de la familia de modelos distilados de primera generacion de DeepSeek-R1, que incluye versiones de 1.5B, 7B, 8B, 14B, 32B y 70B basadas en las series Qwen2.5 y Llama 3. Su proposito es llevar capacidades de razonamiento con cadena de pensamiento (CoT) a modelos lo suficientemente pequenos para ejecutarse en hardware de consumo.

El repositorio analizado (ptybcy/DeepSeek-R1-Distill-Qwen-1.5B) es una republicacion en Hugging Face del modelo original de deepseek-ai, con pesos en safetensors (3,6 GB de tamano de repo) y licencia MIT, lo que permite uso comercial sin restricciones relevantes.

Su relevancia actual radica en que demuestra que los patrones de razonamiento de modelos grandes pueden transferirse a modelos pequenos mediante destilacion con datos de razonamiento generados por DeepSeek-R1, ofreciendo un punto de entrada accesible para razonamiento matematico y logico en GPUs modestas o incluso CPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 1.777.088.000 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card del repo; el modelo original DeepSeek-R1-Distill-Qwen-1.5B documenta 131.072 tokens |
| Tipos de cuantizacion | No disponible (solo pesos originales en BF16; existen cuantizaciones comunitarias GGUF no incluidas en este repo) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 cubre principalmente ingles y chino; el ajuste por destilacion se realizo con datos mayoritariamente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso basado en Qwen2 (arquitectura de Qwen2.5-Math-1.5B como modelo base), sin mezcla de expertos. No fue entrenado desde cero: se trata de un ajuste fino supervisado (SFT) del modelo base Qwen2.5-Math-1.5B utilizando datos de razonamiento generados por DeepSeek-R1, el modelo insignia de DeepSeek entrenado con aprendizaje por refuerzo a gran escala (GRPO) sobre el modelo base, con etapas de cold-start SFT y dos fases de RL para descubrir patrones de razonamiento y alinear con preferencias humanas.

La innovacion clave es la destilacion: en lugar de aplicar RL directamente sobre modelos pequenos (lo que produce patrones de razonamiento inferiores, segun los autores), se transfieren las salidas de razonamiento del modelo grande. DeepSeek reporta que este enfoque supera el RL directo en modelos pequenos. El modelo genera cadenas de pensamiento largas con auto-verificacion y reflexion antes de dar la respuesta final, delimitadas tipicamente entre las etiquetas `<think>` y `</think>`.

## Capacidades

- Generacion de texto conversacional con razonamiento explicito paso a paso (chain-of-thought) antes de la respuesta final.
- Resolucion de problemas de matematicas y logica, herencia del base Qwen2.5-Math orientado a matematicas.
- Generacion y comprension de codigo a nivel basico, aunque no es su punto fuerte frente a modelos de codigo dedicados.
- Auto-verificacion y reflexion: el modelo puede revisar sus propios pasos intermedios dentro de la cadena de pensamiento.
- Capacidad emergente de razonamiento transferida por destilacion desde DeepSeek-R1.
- Compatible con la libreria transformers de Hugging Face y con pipelines de text-generation.
- No incluye capacidades multimodales (sin vision ni audio) ni soporte documentado de tool calling o function calling.

## Casos de uso

- Razonamiento matematico en dispositivos locales: al pesar unos 3,6 GB en BF16, puede ejecutarse en portatiles y GPUs de consumo para resolver problemas de aritmetica, algebra y logica sin conexión a servicios externos.
- Prototipado de sistemas de razonamiento: permite experimentar con cadenas de pensamiento y tecnicas de prompting (few-shot, self-consistency) sin coste de API, gracias a su licencia MIT.
- Asistentes educativos de matematicas: puede generar explicaciones paso a paso de problemas escolares o de nivel bachillerato, mostrando el razonamiento intermedio al usuario.
- Agentes ligeros con razonamiento multi-paso: su salida estructurada con etiquetas `<think>` facilita la integracion en pipelines que parsean el razonamiento antes de la accion final, aunque sin tool calling nativo documentado.
- Investigacion en destilacion y RL: sirve como baseline reproducible para estudiar como se transfieren patrones de razonamiento a modelos pequenos.
- Generacion aumentada con recuperacion (RAG) de bajo coste: puede usarse como componente generador en sistemas locales donde el presupuesto de VRAM es muy limitado, siempre con respuestas cortas para compensar su tamano.
- Filtrado y verificacion logica de salidas de otros modelos: dado su perfil de razonamiento, puede usarse como verificador barato en pipelines de multiples modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. Como referencia, la model card original de DeepSeek indica que la familia distilada rinde de forma destacada en benchmarks de matematicas y codigo (AIME, MATH-500, GPQA Diamond, LiveCodeBench), pero no incluye cifras numericas en el contenido disponible de este repo, por lo que no se reproducen aqui numeros concretos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,6-4 GB (tamano del repo de 3,6 GB), mas overhead de KV cache segun longitud de contexto.
- Con cuantizacion a 4 bits (GGUF Q4, disponible en repos comunitarios): en torno a 1,1-1,5 GB, ejecutable en CPUs y portatiles sin GPU dedicada.
- Consumer GPUs compatibles: cualquier GPU con 4 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4090 con holgura amplia para contextos largos y batching).
- Opciones de despliegue: transformers (libreria nativa del repo), llama.cpp y Ollama mediante conversion a GGUF, vLLM para servicion con alto throughput, y TGI. El propio repo esta etiquetado como compatible con text-generation-inference.
- Latencia: no disponible; al ser un modelo de 1,5-1,8B de parametros, se espera throughput elevado (decenas de tokens/segundo en GPUs de consumo), aunque las cadenas de pensamiento largas incrementan el tiempo total de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este) | 1,78B | Transformer denso (Qwen2) | 131.072 (modelo original) | MIT |
| Qwen2.5-1.5B-Instruct | 1,54B | Transformer denso (Qwen2) | 131.072 | Qwen Research / licencia Qwen (restricciones para algunos usos) |
| DeepSeek-R1-Distill-Llama-8B | 8B | Transformer denso (Llama 3) | 131.072 | MIT |

Frente a Qwen2.5-1.5B-Instruct, este modelo aporta razonamiento CoT por destilacion a costa de respuestas mas largas y lentas; frente a la variante Llama-8B, ofrece menor consumo de recursos con rendimiento inferior en benchmarks de razonamiento. Todos comparten licencias permisivas o abiertas y pesos publicos en Hugging Face.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado por su tamano reducido: en tareas de conocimiento factual puede generar respuestas incorrectas con apariencia de razonamiento solido; conviene verificar las salidas.
- Sesgos heredados del modelo base Qwen2.5 y de los datos de destilacion de DeepSeek-R1, sin auditoria documentada en el repo.
- Las cadenas de pensamiento pueden ser muy largas, con repeticiones o mezcla de idiomas en casos extremos (problemas documentados en DeepSeek-R1-Zero que la destilacion mitiga pero no elimina).
- Soporte de idiomas limitado: el entrenamiento por destilacion se realizo con datos mayoritariamente en ingles; el rendimiento en castellano puede ser inferior al del ingles.
- Este repositorio es una republicacion de un tercero (ptybcy), no el canal oficial de deepseek-ai; se recomienda verificar la integridad de los pesos contra el repo oficial antes de uso en produccion.
- Sin soporte documentado de tool calling, function calling ni capacidades multimodales.
- La licencia MIT permite uso comercial, pero DeepSeek recomienda revisar sus recomendaciones de uso (temperature 0,5-0,7, evitar system prompts, limitar salidas) para obtener el comportamiento esperado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ptybcy/DeepSeek-R1-Distill-Qwen-1.5B
- Organizacion oficial de DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Paper de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- PDF del paper: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Demo de chat oficial: https://chat.deepseek.com/
- Sitio web de DeepSeek: https://www.deepseek.com/
