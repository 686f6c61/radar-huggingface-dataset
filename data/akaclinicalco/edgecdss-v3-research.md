# akaclinicalco/edgecdss-v3-research

## Resumen

edgecdss-v3-research es un artefacto de investigación publicado por akaclinicalco: un ajuste LoRA por destilación sobre Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros, entrenado para redactar las "field cards" del sistema EdgeCDSS de apoyo a la decisión clínica en entornos austeros. El profesor fue claude-opus-5 (Anthropic), que escribió todas las respuestas de entrenamiento, y gpt-4o-mini (OpenAI) actuó como validador. Se usaron 221 filas (205 de entrenamiento y 16 de validación) derivadas de 255 preguntas de campo.

El autor lo describe explícitamente como no adoptado: tras revisar sus respuestas de benchmark (10 de octubre de 2026) detectó errores clínicos graves, y el proyecto mantiene qwen2.5:3b como modelo offline. El artefacto se distribuye como GGUF Q4_K_M de 1,93 GB, con licencia qwen-research de uso exclusivamente no comercial.

Su relevancia actual es la de un caso de estudio documentado sobre destilación de conocimiento en el extremo (edge) y sobre cómo una mejora en métricas agregadas puede coexistir con un fallo de seguridad. No es un modelo apto para uso clínico ni para producción sanitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Qwen2.5-3B-Instruct; no se detalla en la model card más allá del modelo base) |
| Parámetros totales | 3.085.938.688 (3,09 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el entrenamiento usó max sequence length 6656 |
| Tipos de cuantización | GGUF Q4_K_M publicado (1,93 GB). No se listan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | qwen-research (Qwen RESEARCH LICENSE AGREEMENT): solo uso no comercial, de investigación o evaluación |
| Formato de pesos | GGUF (Q4_K_M), sha256 a5a24a6442d076d4e580c4e686a10b375973f2d705f9baf781643246a53bb8c4; etiqueta Ollama `edgecdss-v3` (93a43d964fff) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen2.5-3B-Instruct-4bit` y se ajusta con LoRA mediante `mlx_lm.lora` con rank 8, scale 20, dropout 0, 16 capas, 300 iteraciones, learning rate 1e-4, batch 1, gradient checkpointing, longitud máxima de secuencia 6656 y semilla 0. La pérdida de entrenamiento bajó de 2,071 a 0,366 y la de validación de 2,880 a 0,625 en la iteración 300. Posteriormente el adaptador se fusionó y se convirtió a GGUF Q4_K_M, conservando la TEMPLATE y el SYSTEM del modelo base. No se menciona RLHF ni DPO; la señal de aprendizaje es exclusivamente destilación supervisada sobre respuestas generadas por el profesor y filtradas por el validador con comprobaciones deterministas de EdgeCDSS.

Los datos son deliberadamente pequeños: 221 filas a partir de 255 preguntas de campo, de las que se descartaron 34 (20 porque nombraban un fármaco que la pregunta no pedía, 8 modificadas por el pipeline y 6 retenidas). Cada fila incluye el system prompt completo del sistema en producción, y las preguntas solapadas con el conjunto de evaluación se excluyeron por hash. El dataset no se publica. La model card advierte además de que la publicación de pesos entrenados sobre salidas de proveedores externos es un punto legal no verificado por el autor.

## Capacidades

- Generación de texto conversacional en inglés, orientada a la redacción de fichas de campo clínico ("field cards") bajo el system prompt de EdgeCDSS.
- Ajuste de instrucciones heredado de Qwen2.5-3B-Instruct (formato chat, etiqueta `conversational`).
- Ejecución local en hardware de borde: el artefacto está empaquetado en GGUF Q4_K_M para Ollama, con la plantilla y el system prompt del modelo base.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No dispone de modo de razonamiento explícito, visión, audio ni tool calling documentado en la información disponible.
- Su comportamiento como validador es disfuncional: en 19 de 23 llamadas en las que se le pidió un veredicto, escribió una ficha de campo en lugar de emitir el juicio.

## Casos de uso

- Estudio de destilación con profesor frontera: reproducir o auditar el pipeline (profesor claude-opus-5, validador gpt-4o-mini, comprobaciones deterministas) para medir cuánto de un comportamiento clínico se transfiere a un modelo de 3 B.
- Evaluación de seguridad de modelos médicos: el artefacto incluye un registro público de respuestas clínicamente incorrectas, lo que lo convierte en material de trabajo para diseñar baterías de prueba de seguridad.
- Investigación sobre validadores automáticos: documenta un caso claro de fallo, con 19 de 23 respuestas ilegibles, útil para estudiar la fiabilidad de validadores LLM en dominios de alto riesgo.
- Docencia sobre despliegue en el borde: permite ilustrar el compromiso entre tamaño (1,93 GB), latencia (16,4 s de mediana, 23,5 s de p95 en Jetson Orin Nano a 25 W) y calidad en un modelo de 3 B cuantizado.
- Pruebas de infraestructura de inferencia local: sirve como carga de trabajo realista para validar Ollama 0.34.2 sobre Jetson Orin Nano, con la plantilla y el system prompt del modelo base.
- Comparación de estrategias de cuantización: al existir el modelo base y esta variante destilada, permite medir el impacto del Q4_K_M y del ajuste LoRA sobre el mismo esqueleto.
- Estudio de alucinación de dosis: el modelo declaró concentraciones y rangos de ketamina y fentanilo que ninguna fuente le proporcionó ("Draw 50 mcg of fentanyl IV (50 mg)", con un error de unidad de mil veces junto a la dosis correcta), lo que lo hace útil para analizar errores de unidad en modelos pequeños.

## Benchmarks y rendimiento

Datos de la model card, medidos con el banco de destilación de EdgeCDSS (suite de 29 casos, conjunto firmado de 30 escenarios) sobre un NVIDIA Jetson Orin Nano con Ollama 0.34.2 a 25 W.

| Métrica | qwen2.5:3b (base) | edgecdss-v3 (auto-validador) | edgecdss-v3 con validador qwen2.5:3b |
|---|---|---|---|
| `run_tests.sh` | 29 / 29 | 28 / 29 | 29 / 29 |
| Respuestas servidas del conjunto de 30 (de 23) | 15–16 | 0 (19 de 23 respuestas del validador ilegibles) | 17 |
| Específicos presentes, mismos escenarios servidos | 4 / 39 | — | 8 / 39 |
| Longitud media de respuesta servida (tokens) | 87 | — | 234 |
| Latencia mediana / p95 (s) | 8,1 / 13,0 | 28,2 / 34,6 | 16,4 / 23,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El GGUF Q4_K_M ocupa 1,93 GB, por lo que la inferencia requiere en torno a 2,5–3 GB de memoria para pesos más estado de la clave/valor (estimación a partir del tamaño del artefacto, no confirmada por el autor).
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores. También en CPU y en SoC integrados.
- Plataforma de referencia medida: NVIDIA Jetson Orin Nano, Ollama 0.34.2, modo de 25 W.
- Latencia observada en esa plataforma: mediana 16,4 s y p95 23,5 s con validador qwen2.5:3b; 28,2 s de mediana y 34,6 s de p95 cuando el propio modelo actúa como validador (respuestas mucho más largas, 234 tokens de media frente a 87 del base).
- Despliegue: Ollama (etiqueta `edgecdss-v3`) y llama.cpp son las opciones coherentes con el formato GGUF publicado. No hay confirmación de soporte en vLLM o TGI para este artefacto.
- Throughput no disponible.

## Comparativa con modelos similares

La información proporcionada solo permite comparar contra el modelo base con el que se evaluó.

| Modelo | Parámetros | Contexto | `run_tests.sh` | Escenarios servidos (de 23) | Latencia mediana (s) | Licencia |
|---|---|---|---|---|---|---|
| edgecdss-v3-research | 3,09 B | No disponible | 28/29 (auto) y 29/29 (validador externo) | 0 y 17 | 28,2 y 16,4 | qwen-research, no comercial |
| Qwen2.5-3B-Instruct (`qwen2.5:3b`) | 3,09 B | No disponible | 29/29 | 15–16 | 8,1 | Apache 2.0 (según el modelo original; no verificable en la información proporcionada) |

Frente a otros modelos médicos pequeños (Meditron, BioMistral, OpenBioLLM o variantes de Llama 3 ajustadas en dominio clínico) no hay datos comparables en la información disponible.

## Limitaciones y advertencias

- No apto para uso clínico y no adoptado por el proyecto EdgeCDSS. El propio autor documenta que falla.
- Errores clínicos graves registrados: "tourniquet low and loose" y desbridamiento antes del control de una hemorragia arterial; "reapply" un torniquete tras pérdida de pulso distal; "Do not re-warm until professional help arrives" en una parada hipotérmica; tratar una crisis comicial en adulto como parada cardíaca con compresiones torácicas; reposicionar y fijar el tubo sin descompresión con aguja en un neumotórax a tensión.
- Alucinación de dosis y reglas no aportadas por ninguna fuente: un "rule of two" para ketamina y una concentración de vial inventada; "Draw 50 mcg of fentanyl IV (50 mg)", con un deslizamiento de unidad de mil veces junto a la dosis correcta.
- Inutilizable como validador: en 19 de 23 peticiones de veredicto generó una ficha de campo en lugar del veredicto, y en algún caso declaró volúmenes de transfusión sin firmar.
- Licencia qwen-research: uso exclusivamente no comercial (investigación o evaluación). El uso comercial exige licencia de Alibaba Cloud. La licencia MIT del repositorio EdgeCDSS no se aplica a estos pesos.
- Solo inglés. No hay soporte multilingüe declarado, lo que limita su uso en castellano sin ajuste adicional.
- Entrenado sobre una versión de 4 bits del modelo base (`mlx-community/Qwen2.5-3B-Instruct-4bit`), un punto de partida ya degradado respecto a los pesos completos.
- Corpus de entrenamiento muy reducido (205 filas, 300 iteraciones), con riesgo alto de sobreajuste al formato de ficha y de escasa generalización.
- El dataset no se publica, por lo que la reproducibilidad del ajuste es limitada.
- La model card se marca internamente como borrador y su publicación no está confirmada por el autor; además, el propio autor señala que no ha verificado si los términos de los proveedores de las respuestas de entrenamiento permiten publicar un modelo destilado a partir de ellas.
- El repositorio registra 0 descargas y 0 valoraciones, y no hay evidencia de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akaclinicalco/edgecdss-v3-research
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Base cuantizada usada para el ajuste: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
- Licencia Qwen RESEARCH LICENSE AGREEMENT: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Release EdgeCDSS v5.0.0: https://github.com/AI-in-Austere-Medicine-Project/pi-cloud-cdss/releases/tag/v5.0.0
- Changelog: https://github.com/AI-in-Austere-Medicine-Project/pi-cloud-cdss/blob/v5.0.0/CHANGELOG.md
- Declaración de seguridad: https://github.com/AI-in-Austere-Medicine-Project/pi-cloud-cdss/blob/v5.0.0/SAFETY.md
- Registro de benchmark (validador qwen2.5:3b): https://github.com/AI-in-Austere-Medicine-Project/pi-cloud-cdss/blob/v5.0.0/docs/DISTILL_BENCH_edgecdss-v3-d7.md
- Registro de benchmark (auto-validador): https://github.com/AI-in-Austere-Medicine-Project/pi-cloud-cdss/blob/v5.0.0/docs/DISTILL_BENCH_edgecdss-v3.md
