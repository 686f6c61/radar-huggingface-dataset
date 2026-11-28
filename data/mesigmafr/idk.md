# mesigmafr/idk

## Resumen

`mesigmafr/idk` es una cuantización en formato GGUF de un modelo de lenguaje de gran tamano (23.572.403.200 parámetros, aproximadamente 24B) orientado a generación de texto conversacional sin restricciones de contenido. Lo publica el usuario independiente `mesigmafr` en Hugging Face y deriva directamente de `llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2`, que a su vez es una versión "abliterated" (decensurada) del modelo base `ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B`.

El interés técnico del modelo reside en el proceso de ablación de direcciones de rechazo aplicado sobre el modelo original mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA). Según la model card del autor original, ese proceso reduce las negativas del modelo de 91/100 a 4/100 manteniendo una divergencia KL de 0.0120 respecto al original, es decir, preservando en gran medida la distribución de comportamiento del modelo de partida. El repositorio que nos ocupa se limita a ofrecer los pesos cuantizados en GGUF para su uso con llama.cpp y derivados.

Es relevante para desarrolladores e investigadores que trabajen con modelos "uncensored" para roleplay, narrativa de ficción explícita o investigación sobre alineamiento y ablación, pero no es un modelo apto para producción general: no tiene licencia declarada, solo soporta inglés y está etiquetado como no apto para todas las audiencias. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor del modelo base advierte en su model card que ha alcanzado el límite de almacenamiento gratuito de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 24B; no se especifica en la información proporcionada) |
| Parámetros totales | 23.572.403.200 (~23,6B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S (según la model card del modelo base) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modelo base | llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2 |
| Modelo original (raíz) | ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B |
| Tamaño del repositorio | 139,0 GB |
| Pipeline | text-generation |
| Etiquetas | gguf, nsfw, explicit, roleplay, unaligned, ERP, Erotic, Horror, Violence, heretic, uncensored, decensored, abliterated, ara |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el tamaño (23,6B parámetros) y el ecosistema en el que circula (GGUF, llama.cpp, Heretic), se trata de un transformer decoder-only, pero la model card no detalla número de capas, dimensiones ocultas, tipo de atención ni longitud de contexto. Tampoco se documentan los datos de entrenamiento del modelo original (número de tokens, composición del dataset, fases de RLHF/DPO).

La innovación técnica documentada es el proceso de ablación de la dirección de rechazo. El modelo base `llmfan46/...-heretic-v2` se generó aplicando Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) sobre el modelo `ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B`. Los parámetros de ablación declarados son: `start_layer_index` = 14, `end_layer_index` = 32, `preserve_good_behavior_weight` = 0,6762, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,8063, `neighbor_count` = 4, y el componente objetivo es `attn.o_proj`. Según el autor, este proceso reduce las negativas de 91/100 a 4/100 con una divergencia KL de 0,0120 frente al original. No se documenta ningún entrenamiento adicional ni ajuste fino posterior; el repositorio `mesigmafr/idk` es únicamente una recuantización GGUF de esos pesos.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno y roleplay.
- Escritura narrativa de ficción explícita, erótica, de terror y violencia, sin las restricciones típicas de los modelos alineados.
- Reducción drástica de negativas y evasivas: 4/100 frente a 91/100 del original, según la model card del modelo base.
- Razonamiento físico básico preservado: PIQA acc_norm de 0,8351 frente a 0,8379 del original.
- Capacidad de seguir personajes, consignas y estilos narrativos largos (roleplay, ERP).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: solo inglés declarado; no se garantiza calidad en otros idiomas.

## Casos de uso

- Roleplay conversacional sin restricciones: el modelo está diseñado para mantener personajes y tramas en sesiones multi-turno sin rechazar contenido adulto o violento, lo que lo hace adecuado para plataformas de ficción interactiva para adultos con las advertencias legales correspondientes.
- Escritura de ficción explícita y de terror: útil para autores que necesitan generar borradores de escenas eróticas, de violencia gráfica o de horror sin que el modelo suavice el tono ni introduzca advertencias moralizantes.
- Investigación sobre alineamiento y ablación: sirve como caso de estudio reproducible para medir el efecto de ARA sobre las negativas y la divergencia KL, comparando el modelo original con la versión ablacionada.
- Evaluación de técnicas de decensurado: permite a investigadores comparar métricas de rechazo, KL y benchmarks como PIQA entre el modelo base y la variante heretic, y validar la metodología Heretic v1.2.0.
- Generación de diálogos para videojuegos narrativos para adultos: integrable en motores de diálogo mediante llama.cpp u Ollama, con la ventaja de que no bloquea guiones con contenido sensible.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp en hardware de consumo de gama alta, lo que facilita prototipos sin depender de APIs externas ni de filtros de proveedor.
- Experimentación con cuantizaciones: el repositorio ofrece varias cuantizaciones (BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S) para estudiar el impacto de la cuantización en la calidad narrativa y en la tasa de negativas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a PIQA y a las métricas de ablación del modelo base, no del repositorio `mesigmafr/idk` de forma independiente.

| Métrica | Modelo original (ReadyArt/...) | Variante heretic (base de este repo) |
|---|---|---|
| PIQA acc | 0,8221 ± 0,0089 | 0,8237 ± 0,0089 |
| PIQA acc_norm | 0,8379 ± 0,0086 | 0,8351 ± 0,0087 |
| Negativas (refusals) | 91/100 | 4/100 |
| Divergencia KL | 0 (por definición) | 0,0120 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0, aproximadamente 25-27 GB; en Q6_K, unos 20-22 GB; en Q5_K_M, unos 17-19 GB; en Q5_K_S, unos 16-18 GB; en BF16, unos 47-48 GB. Son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: A100 40/80 GB o H100 para BF16; RTX 4090 (24 GB) para Q6_K y Q5_K_M con contexto moderado; RTX 3090 (24 GB) para Q5_K_M y Q5_K_S.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) solo con cuantizaciones Q5_K_S y contexto reducido, y en configuraciones con offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (este último requiere pesos no GGUF o soporte GGUF específico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| mesigmafr/idk | ~23,6B | no disponible | no disponible | GGUF | Roleplay/ficción sin restricciones, ablacionado |
| llmfan46/Omega-Darker-Gaslight_...-heretic-v2 | ~24B | no disponible | no disponible | safetensors/GGUF | Modelo base ablacionado del que deriva este |
| ReadyArt/Omega-Darker-Gaslight_...-24B | ~24B | no disponible | no disponible | safetensors | Modelo original alineado, antes de la ablación |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, otros 24B uncensored) en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como NSFW, no apto para todas las audiencias, y genera contenido erótico, violento y de terror sin filtros; no debe desplegarse en entornos accesibles a menores ni sin moderación externa.
- Sin licencia declarada: no hay licencia en el repositorio, lo que impide determinar si el uso comercial está permitido; en la práctica, esto supone un riesgo legal para producción.
- Solo inglés: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; al ser un modelo ablacionado, la supresión de la dirección de rechazo puede afectar también a la calibración y a la coherencia en dominios sensibles.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos derivados de roleplay sin alineamiento suelen reproducir estereotipos de los datos de entrenamiento.
- Contexto desconocido: no se especifica la longitud de contexto, lo que dificulta planificar despliegues con conversaciones largas.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y el autor del modelo base advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de los archivos.
- Cadena de derivación profunda: el modelo pasa por al menos tres transformaciones (original, ablación heretic v2, cuantización GGUF), sin evaluación independiente en cada paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mesigmafr/idk
- Modelo base (v2): https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2
- Modelo original: https://huggingface.co/ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor del modelo base: https://ko-fi.com/llmfan46
- Patreon del autor del modelo base: https://patreon.com/LLMfan46
