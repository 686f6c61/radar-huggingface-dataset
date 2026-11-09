# DavidAU/L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B

## Resumen

L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B es un modelo de generación de texto de 8.030.261.248 parámetros (aproximadamente 8B) desarrollado por DavidAU, un creador independiente conocido en Hugging Face por sus merges orientados a escritura creativa y roleplay. Se trata de un modelo derivado por fusión (merge) de dos modelos base: NousResearch/DeepHermes-3-Llama-3-8B-Preview, que aporta la capacidad de razonamiento controlable ("thinking mode"), y Undi95/Llama-3-Unholy-8B, que aporta un estilo de prosa más oscuro y sin censura. El resultado es un modelo sin filtros orientado a narrativa de ficción, terror y roleplay, con capacidad de razonamiento activable mediante system prompts.

El modelo hereda la arquitectura Llama 3.1 y declara una ventana de contexto de 128k tokens. Su rasgo diferencial es el control variable del razonamiento: el "thinking" se activa, desactiva o modula a través de system prompts, y según el autor conserva entre un 50 % y un 67 % de la potencia de razonamiento del DeepHermes original. Está pensado para temperaturas altas (1.2+, incluso 2.2+), lo que lo aleja del uso típico de un modelo instruct convencional.

Su relevancia actual es de nicho: no compite en benchmarks de razonamiento o código, sino que cubre la demanda de modelos locales sin censura para escritura creativa, generación de tramas, continuación de escenas y roleplay en herramientas como SillyTavern. La licencia Apache 2.0 facilita su uso y redistribución, aunque el contenido que produce es explícito y no apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con razonamiento controlable heredado de DeepHermes |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens (sugerido minimo 4k, recomendado 8k) |
| Tipos de cuantizacion | GGUF (incluye IQ4XS y Q8 "MAX"), GPTQ, EXL2, AWQ, HQQ; pesos fuente en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), con cuantizaciones derivadas en el arbol del modelo |

## Arquitectura y entrenamiento

El modelo es una fusión (merge) realizada con mergekit sobre dos modelos Llama 3 de 8B. La arquitectura subyacente es un transformer decoder-only estándar de la familia Llama 3.1, con pesos en bfloat16 y sin modificaciones estructurales respecto a la base. La innovación no reside en la arquitectura sino en la combinación de linajes: DeepHermes-3 aporta el sistema de razonamiento on/off/variable de NousResearch, mientras que Llama-3-Unholy-8B aporta el estilo de prosa oscuro y la ausencia de alineación restrictiva.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO específicas para este merge; el autor remite al repositorio de DeepHermes para los detalles del sistema de razonamiento original. El autor indica que el "thinking" de esta versión es más corto y comprimido que el del modelo original, y que retiene entre un 50 % y un 67 % de su potencia de razonamiento. El tensor de salida se amplía a bf16 en las cuantizaciones "MAX" para mejorar la calidad del bloque de pensamiento y de la salida.

## Capacidades

- Generación de texto narrativo en inglés: ficción, terror, ciencia ficción, romance y otros géneros, con prosa vívida y explícita.
- Razonamiento controlable: modo "thinking" activable, desactivable o modulable mediante system prompts, con profundidad creciente a temperaturas altas.
- Roleplay y conversación multi-turno, con soporte para plantillas de chat Llama 3 Instruct y Command-R.
- Continuación de escenas y generación de tramas y subtramas.
- Resolución de puzles lógicos y acertijos, aunque con menor fiabilidad que el DeepHermes original por la influencia del modelo "Dark Planet".
- Capacidad de adoptar "personajes" de razonamiento (por ejemplo, un estilo tipo Joker) mediante system prompts.
- Sin capacidades de visión, audio, tool calling ni function calling documentadas.
- Multilingüe limitado: entrenado y declarado únicamente para inglés.

## Casos de uso

- Escritura de ficción de terror y horror gráfico: el modelo está diseñado para producir contenido explícito y atmosférico; se usaría con prompts largos y temperatura superior a 1.2 para obtener descripciones detalladas y sin autocensura.
- Roleplay en SillyTavern: la model card menciona explícitamente esta integración; el modelo mantiene personajes y contexto en conversaciones multi-turno gracias a su ventana de 128k tokens.
- Generación de tramas y subtramas para novelas: útil para explorar desarrollos argumentales alternativos, con el razonamiento activado para estructurar giros narrativos.
- Continuación de escenas en proyectos de escritura asistida: el modelo puede retomar un fragmento y prolongarlo manteniendo tono y estilo, especialmente con prompts de contexto largos.
- Creación de contenido para juegos de rol de mesa: generación de descripciones de escenarios, PNJ y eventos con tono oscuro o adulto.
- Experimentación con razonamiento controlable en local: investigadores pueden estudiar cómo varía la calidad del bloque de pensamiento según temperatura y system prompt, ya que el modelo expone el "thinking" de forma visible.
- Exploración de literatura interactiva: integración en motores de ficción interactiva donde el usuario dirige la narrativa y el modelo responde con prosa detallada y sin restricciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas como MMLU, HumanEval o GSM8K en la model card, y remite al repositorio de DeepHermes para los resultados del modelo original, que no son directamente extrapolables a este merge.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de contexto; con 128k de contexto la demanda de KV cache crece de forma significativa.
- Cuantizaciones GGUF (Q4, IQ4XS): caben en GPUs consumer de 8-12 GB de VRAM, como RTX 3060, 4060 Ti o 4070.
- Q8 "MAX": requiere alrededor de 8-9 GB para pesos, apta para RTX 4080, 4090 o GPUs de 16 GB o más.
- GPU profesionales recomendadas para precisión completa y contexto largo: A100 40/80 GB, H100, L40S.
- Despliegue: transformers (formato nativo), llama.cpp y Ollama para GGUF, vLLM y TGI para serving, además de GPTQ, EXL2 y AWQ según el backend elegido.
- Latencia y throughput: no disponibles; dependen del backend, la cuantización y la longitud de contexto. El autor recomienda un mínimo de 4k de contexto y 8k preferible, lo que incrementa el uso de memoria frente a un instruct convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B | 8B | 128k | On/off/variable (50-67 % del original) | Apache 2.0 | Ficción oscura sin censura, roleplay |
| NousResearch/DeepHermes-3-Llama-3-8B-Preview | 8B | 128k (declarado) | On/off/variable (completo) | Ver repo original | Razonamiento controlable, uso general |
| Undi95/Llama-3-Unholy-8B | 8B | 8k (base Llama 3) | No | Ver repo original | Roleplay y prosa sin censura |

La comparación con DeepHermes es la más directa: este merge conserva el sistema de razonamiento pero lo reduce y lo orienta a contenido creativo explícito. Frente a Unholy, gana la capa de razonamiento y el contexto extendido a 128k. No se dispone de benchmarks que permitan comparar rendimiento objetivo entre los tres.

## Limitaciones y advertencias

- Contenido NSFW, horror gráfico y lenguaje explícito: el modelo está diseñado para producirlo, lo que lo hace inadecuado para aplicaciones públicas o entornos profesionales sin moderación.
- Riesgo elevado de alucinación y de derivas narrativas incoherentes, especialmente a temperaturas altas.
- El bloque de razonamiento puede no activarse en el primer intento; el autor recomienda regenerar varias veces (mínimo 5 para usos creativos específicos) y, en ocasiones, pedir manualmente la salida tras el "thinking".
- Solo inglés: no hay soporte multilingüe declarado.
- Menor capacidad de razonamiento que el DeepHermes original (50-67 %), por lo que no es adecuado para tareas de lógica o matemáticas exigentes.
- Sin soporte documentado de tool calling, function calling ni agentes.
- Aunque la licencia es Apache 2.0, el uso comercial del contenido generado requiere revisar las implicaciones legales y de moderación del contenido explícito.
- El contexto de 128k es declarado por el autor, pero no hay validación independiente de su calidad efectiva en contextos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B
- Modelo base DeepHermes: https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-8B-Preview
- Modelo base Unholy: https://huggingface.co/Undi95/Llama-3-Unholy-8B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte del autor: https://huggingface.co/DavidAU/support
