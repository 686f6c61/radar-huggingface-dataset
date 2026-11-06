# caspar/MiniMind-MoE-198M-A64M-GSM8K-GRPO-Rule-v1.0

## Resumen

MiniMind-MoE-198M-A64M-GSM8K-GRPO-Rule-v1.0 es un modelo lingüístico experimental de pequeño tamaño desarrollado por el usuario caspar y publicado en Hugging Face. Se trata de un ajuste mediante GRPO (Group Relative Policy Optimization, un algoritmo de tipo RLHF) a partir del checkpoint SFT `caspar/MiniMind-MoE-198A-A64M-Mixed-SFT-v1.0`, que a su vez pertenece al ecosistema MiniMind, un proyecto open source de modelos miniatura entrenados desde cero. El modelo tiene 198,4 millones de parámetros totales en arquitectura MoE (mixture of experts), de los cuales aproximadamente 64 millones están activos por token según la convención de nomenclatura A64M.

El propósito del modelo es principalmente de investigación: comparar el efecto de dos funciones de recompensa distintas (una basada en reglas estrictas y otra basada en un modelo de recompensa neuronal de Skywork) sobre el rendimiento en el dataset GSM8K de problemas matemáticos de primaria. El propio autor advierte explícitamente que no es un solucionador aritmético fiable: la precisión final en el test oficial de GSM8K es de apenas el 1,97 %, aunque el experimento demuestra de forma rigurosa y reproducible el pipeline completo de GRPO sobre un modelo diminuto. Su relevancia actual radica en servir como referencia didáctica y reproductible para quien quiera estudiar post-entrenamiento con RL en modelos pequeños, no como modelo productivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder MoE (ecosistema MiniMind) |
| Parámetros totales | 198.416.640 |
| Parametros activos | ~64M (según nomenclatura A64M; dato exacto no disponible) |
| Longitud de contexto | Prompts de hasta 768 tokens y salidas de hasta 256 tokens usados en entrenamiento/evaluación; límite máximo nativo no disponible |
| Tipos de cuantización | Ninguna publicada; pesos en FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32), tamaño del repo 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con enrutado MoE del ecosistema MiniMind (código base: https://github.com/jingyaogong/minimind, también Apache-2.0). Requiere `trust_remote_code=True` y el archivo `model_minimind.py` incluido en el repositorio, ya que usa código de modelado personalizado. La nomenclatura 198M-A64M indica 198,4 millones de parámetros totales con unos 64 millones activos por token, lo que reduce el coste computacional por inferencia respecto a un modelo denso equivalente.

El entrenamiento consiste en GRPO a plenos parámetros (full-parameter) sobre el checkpoint SFT mixto, usando las 6.851 conversaciones de entrenamiento de GSM8K (revisión `542384d` del dataset `caspar/MiniMind-Mixed-SFT-Training-v1.0`). Se realizó una época completa con 215 actualizaciones, batch de 32 preguntas, cuatro generaciones por pregunta, microbatch de 8, AdamW con LR 1e-6→1e-7 en schedule coseno, KL beta 0,04, clipping 0,2, weight decay 0,01, gradient clip 1 y semilla 42. Se entrenó en una GPU A40 con parámetros FP32 y autocast BF16, muestreo con temperatura 1, top-p 1 y top-k 0. La recompensa es de tipo "rule": igualdad estricta del formato final `#### número` (1 si es correcto, 0 en caso contrario), con ventajas normalizadas por grupo. No se usó ningún gold del conjunto de test en la optimización. Existe una variante gemela con recompensa Skywork (modelo de recompensa neuronal Skywork-Reward-V2-Qwen3-1.7B) entrenada desde el mismo checkpoint con datos e hiperparámetros idénticos, lo que permite comparaciones controladas entre ambos tipos de recompensa.

## Capacidades

- Generación de texto conversacional en inglés mediante chat template con soporte de bloques de thinking (el ejemplo de uso desactiva el thinking con `open_thinking=False`).
- Resolución de problemas aritméticos de nivel escolar estilo GSM8K con formato de respuesta final `#### número`, aunque con precisión muy baja (1,97 % en test).
- Razonamiento paso a paso (chain-of-thought) entrenado mediante RL con recompensa basada en reglas.
- No hay evidencia publicada de soporte de tool calling, function calling ni capacidades de agentes.
- No hay capacidades multimodales (visión, audio); es un modelo de texto exclusivamente.
- Sin soporte documentado de idiomas distintos del inglés.

## Casos de uso

- Investigación en post-entrenamiento con RL: sirve como sujeto de experimento barato (0,8 GB, ejecutable en GPU modesta) para replicar o modificar pipelines GRPO completos.
- Comparación controlada de funciones de recompensa: al existir la variante gemela con recompensa Skywork desde el mismo checkpoint, es ideal para estudiar empíricamente reward hacking y diferencias entre recompensa por reglas y recompensa neuronal.
- Docencia y formación: caso de estudio realista para cursos sobre RLHF/DPO/GRPO, con hiperparámetros, semillas y datos de evaluación publicados al detalle.
- Prototipado de infraestructura de inferencia: su tamaño reducido lo hace adecuado para probar servidores de inferencia, cuantizaciones o despliegues edge sin coste computacional significativo.
- Análisis de formato y comportamiento de modelos pequeños: las 318 respuestas con errores de formato y 317 salidas truncadas por presupuesto de tokens en la evaluación son material útil para estudiar fallos típicos de modelos diminutos bajo RL.
- Base para fine-tuning adicional: puede usarse como punto de partida para experimentos propios de SFT o RL en dominios concretos, aprovechando la licencia Apache-2.0.

No es adecuado para producción, asistencia matemática real ni atención al cliente: el propio autor lo califica de experimental y no fiable para aritmética.

## Benchmarks y rendimiento

Único benchmark publicado: GSM8K test oficial completo (1.319 preguntas, decodificación greedy, salida máxima de 256 tokens, scorer estricto de reglas).

| Modelo | GSM8K test (precisión) |
|---|---|
| MiniMind-MoE-198M-A64M-GSM8K-GRPO-Rule-v1.0 (final) | 26/1319 (1,97 %) |
| Checkpoint SFT base (baseline) | 16/1319 (1,21 %) |

Detalles adicionales publicados: 318 errores de formato y 317 casos de presupuesto de salida agotado en la evaluación final. El autor subraya que estos números verifican los resultados finales, no la validez del razonamiento, y que la recompensa de entrenamiento por sí sola no establece una mejora real en matemáticas. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,8 GB solo para los pesos en FP32; con overhead de activaciones y tokenizer, cualquier GPU con 2-4 GB de VRAM es suficiente. No hay pesos cuantizados publicados.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4090, etc.) o incluso GPU de servidor antigua; el entrenamiento original se realizó en una NVIDIA A40.
- Cabe con holgura en GPUs de consumo; incluso es viable en CPU o en portátiles con GPU integrada dada la cifra de parámetros activos (~64M).
- Opciones de despliegue: transformers (librería oficial, requiere `trust_remote_code=True` y revisión `v1.0`); compatibilidad con llama.cpp, Ollama, vLLM o TGI no está documentada, y el código personalizado dificulta su uso directo en esos servidores sin adaptación.
- Latencia y throughput: no disponible; por tamaño y parámetros activos se espera inferencia muy rápida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMind-MoE-198M-A64M-GSM8K-GRPO-Rule-v1.0 | 198M (A64M) | no disponible (≥768 tokens en entrenamiento) | 1,97 % | Apache-2.0 | Hugging Face, safetensors FP32 |
| MiniMind-MoE-198M-A64M-GSM8K-GRPO-Skywork (variante gemela) | 198M (A64M) | no disponible | no disponible | Apache-2.0 | Hugging Face (mismo autor) |
| Qwen2.5-0.5B-Instruct | 494M (denso) | 32.768 tokens | no disponible en la información proporcionada | Qwen Research / Apache-2.0 (según versión) | Hugging Face, múltiples cuantizaciones |
| SmolLM2-135M-Instruct (Hugging Face) | 135M (denso) | 8.192 tokens | no disponible en la información proporcionada | Apache-2.0 | Hugging Face, safetensors |

Nota: la variante gemela Skywork parte del mismo checkpoint SFT e hiperparámetros idénticos, por lo que es la comparación más controlada disponible; su resultado exacto en GSM8K no consta en la información proporcionada.

## Limitaciones y advertencias

- Precisión extremadamente baja en la tarea objetivo: solo 1,97 % en GSM8K test; el autor lo describe explícitamente como "no un solucionador aritmético fiable". No debe usarse para cálculos reales.
- Alto riesgo de errores de formato: 318 de 1.319 respuestas no cumplen el formato esperado y 317 agotan el presupuesto de salida, lo que indica problemas de convergencia y de longitud de generación.
- Mejora absoluta marginal frente al baseline SFT (+0,76 puntos porcentuales); el propio autor aclara que la recompensa de entrenamiento no establece una mejora real de la capacidad matemática y que no hay evaluación humana independiente.
- Sesgos: no documentados; el modelo hereda los sesgos del dataset SFT mixto y de GSM8K, ambos no analizados en la model card.
- Idioma limitado al inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto muy corto en la práctica (768 tokens de prompt en entrenamiento); el límite nativo máximo no está documentado.
- Requiere `trust_remote_code=True` y revisión de `model_minimind.py` antes de habilitar el código personalizado, un riesgo de seguridad habitual en modelos con custom code.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque los términos de los componentes del dataset SFT mixto upstream "permanecen aplicables" según la atribución del autor, lo que conviene revisar antes de uso comercial.
- Es un artefacto de investigación con solo 452 descargas y sin comunidad de mantenimiento aparente; no apto para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/MiniMind-MoE-198M-A64M-GSM8K-GRPO-Rule-v1.0
- Modelo base (SFT): https://huggingface.co/caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0
- Dataset de entrenamiento SFT: https://huggingface.co/datasets/caspar/MiniMind-Mixed-SFT-Training-v1.0
- Código MiniMind (GitHub): https://github.com/jingyaogong/minimind
- Modelo de recompensa Skywork (variante gemela): https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-1.7B
