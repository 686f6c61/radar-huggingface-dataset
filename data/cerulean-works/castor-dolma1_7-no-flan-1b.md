# cerulean-works/castor-dolma1_7-no-flan-1B

## Resumen

castor-dolma1_7-no-flan-1B es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros publicado por cerulean-works como parte de CASTOR, un conjunto de «seed-twins»: modelos base de DataDecide (Ai2) que solo difieren en la semilla de preentrenamiento y a los que se aplica exactamente el mismo post-entrenamiento de seguridad (SFT y después DPO, siguiendo la receta de OLMo 2 1B Instruct) bajo varias semillas de post-entrenamiento. El objetivo no es ofrecer un asistente, sino aislar cuánta de la vulnerabilidad frente a jailbreaks, prompt a prompt, viene determinada por la semilla de preentrenamiento y cuánta por el azar del alineamiento.

El repositorio contiene seis revisiones (ramas) que cruzan tres semillas de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) con dos semillas de post-entrenamiento (`p1`, `p2`), todas partiendo del checkpoint `step69369` del modelo base. La evaluación se hizo sobre 6.226 prompts públicos de referencia en seguridad, con 20 respuestas muestreadas y una respuesta greedy por prompt, etiquetadas con WildGuard y Qwen3Guard; las etiquetas se publican, pero las generaciones no.

Es relevante ahora porque acompaña al paper «Identically Trained Language Models Break on Different Jailbreaks» y proporciona un banco de modelos controlado —mismos datos, mismo cómputo, distinta semilla— para estudiar la varianza no determinista del comportamiento de rechazo. No está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base DataDecide de Ai2; el nombre del checkpoint indica 1B) |
| Parametros totales | ~1B (deducido del nombre `castor-dolma1_7-no-flan-1B`; no confirmado numericamente en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no publica GGUF ni cuantizaciones; solo pesos en formato transformers) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (los modelos base DataDecide son Apache 2.0; los datos de post-entrenamiento son ODC-BY 1.0 de Ai2, con algunos subconjuntos bajo otras licencias) |
| Formato de pesos | Repositorio de transformers (`AutoModelForCausalLM`), 15,4 GB en total para las 6 revisiones |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia DataDecide: el modelo base es `allenai/DataDecide-dolma1_7-no-flan-1B`, entrenado sobre el dataset Dolma 1.7 en su variante «no-flan» y congelado en el paso `step69369`. El post-entrenamiento replica la receta de OLMo 2 1B Instruct en dos fases: SFT sobre `allenai/tulu-3-sft-olmo-2-mixture-0225` y posterior DPO sobre `allenai/olmo-2-0425-1b-preference-mix`.

La innovación metodológica no está en el modelo, sino en el diseño experimental: se generan seis revisiones que combinan tres semillas de preentrenamiento con dos semillas de post-entrenamiento, manteniendo fijos datos, hiperparámetros y receta. Esto permite separar el efecto de la semilla de preentrenamiento del de la semilla de alineamiento sobre el comportamiento de rechazo, y comparar pares de modelos que son idénticos en todo salvo el azar de la inicialización y del orden de los datos. La evaluación se realizó con 20 muestras por prompt más una decodificación greedy, y el etiquetado automático con dos clasificadores de seguridad independientes (WildGuard y Qwen3Guard) para reducir la dependencia de un único juez.

## Capacidades

- Generación de texto en inglés con un modelo de ~1B parámetros afinado con SFT y DPO.
- Comportamiento de rechazo (refusal) ante peticiones dañinas, entrenado explícitamente con datos de seguridad.
- Resistencia parcial a jailbreaks, medida de forma sistemática con HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench.
- Respuesta a prompts de seguridad y de sobre-rechazo (XSTest, OR-Bench) para estudiar falsos positivos del alineamiento.
- Modo de muestreo múltiple: admite decodificación estocástica (20 muestras por prompt en la evaluación) y greedy.
- Variantes controladas por semilla: seis revisiones con comportamiento de seguridad potencialmente distinto pese a compartir datos y receta.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Tool calling, function calling, agentes, visión, audio o modo «thinking»: no disponibles; no se documentan en la model card.

## Casos de uso

- Investigación sobre robustez frente a jailbreaks: ejecutar los 6.226 prompts públicos sobre cada revisión y comparar tasas de rechazo entre semillas para cuantificar cuánta varianza introduce la semilla de preentrenamiento frente a la de post-entrenamiento.
- Auditoría de clasificadores de seguridad: usar las etiquetas publicadas en `cerulean-works/castor-labels` (WildGuard y Qwen3Guard) para medir el acuerdo entre jueces automáticos y estudiar sus discrepancias prompt a prompt.
- Estudio de sobre-rechazo: emplear XSTest y OR-Bench para analizar si el DPO endurece en exceso el rechazo y qué semillas producen más falsos positivos en peticiones benignas.
- Reproducibilidad de experimentos de alineamiento: servir como baseline controlado en estudios que comparen recetas de SFT/DPO, ya que el único factor que cambia entre revisiones es la semilla.
- Análisis de la influencia del corpus de preentrenamiento: comparar las ramas `default` frente a `large-aux-2` y `large-aux-3` para estudiar cómo la composición de Dolma 1.7 afecta al comportamiento de seguridad posterior.
- Docencia y formación en seguridad de IA: usar el conjunto como ejemplo práctico de diseño experimental con variables controladas y de evaluación con múltiples jueces automáticos.
- Evaluación de pipelines de guardrails: integrar el modelo como generador adversarial de bajo coste (~1B) en pruebas de regresión de sistemas de moderación, sin exponerlo a usuarios finales.
- Investigación sobre calibración de la confianza: comparar la dispersión de 20 muestras por prompt entre revisiones para estudiar la estabilidad de las respuestas ante el mismo estímulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas agregadas de seguridad con valores numéricos en la model card).

Lo que sí se documenta es el protocolo de evaluación: 6.226 prompts públicos de HarmBench, jailbreaks humanos de HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench; 20 respuestas muestreadas y una greedy por prompt; etiquetado por WildGuard y Qwen3Guard. Las etiquetas por respuesta están en el dataset `cerulean-works/castor-labels`, indexadas por identificador de prompt. Las generaciones no se publican, por lo que las tasas de rechazo deben recalcularse a partir de las etiquetas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5 GB de pesos en bf16/fp16 para un modelo de ~1B; en torno a 1,3 GB en int8 y ~0,7-1 GB en 4 bits (estimaciones teóricas a partir del número de parámetros, no publicadas por el autor).
- Memoria adicional para caché KV: proporcional a la longitud de contexto, que no está documentada; con contextos cortos el overhead es mínimo.
- GPU recomendadas: cualquier GPU con 4 GB o más para fp16 en contextos cortos; A100/H100 no son necesarias y estarían sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4090 y equivalentes; también en iGPU con suficiente memoria compartida usando cuantización.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(repo, revision=...)` es la vía soportada, ya que hay una rama por modelo. vLLM y TGI son viables al ser un transformer decoder-only estándar, aunque no están validados por el autor. llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión que no se distribuye.
- Latencia y throughput: no disponibles; no se han publicado mediciones. A modo de referencia teórica, un modelo de ~1B en una GPU de consumo moderna suele generar decenas de tokens por segundo, pero no hay dato confirmado para este checkpoint.
- Almacenamiento: 15,4 GB para el repositorio completo con las seis revisiones; una sola revisión ocupa aproximadamente una sexta parte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cerulean-works/castor-dolma1_7-no-flan-1B | ~1B | no disponible | Apache 2.0 | Pesos en HF, 6 revisiones | Orientado a investigación de seguridad; no apto para producción |
| allenai/DataDecide-dolma1_7-no-flan-1B (base) | ~1B | no disponible | Apache 2.0 | Pesos en HF | Mismo checkpoint `step69369` sin SFT/DPO; punto de partida del CASTOR |
| OLMo 2 1B Instruct (receta de referencia) | ~1B | no disponible en la informacion proporcionada | Apache 2.0 (según familia OLMo) | Pesos en HF | Fuente de la receta de SFT + DPO aplicada aquí; no se comparan cifras porque no hay benchmarks publicados en esta ficha |
| Otros instruct de ~1B (Llama 3.2 1B, Qwen2.5 1.5B) | ~1-1,5B | no disponible en la informacion proporcionada | Licencias propias de cada familia | Pesos en HF | Alternativas de tamaño similar, pero sin control de semillas ni foco en seguridad; comparación de rendimiento no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- No es un asistente: el autor indica explícitamente que son modelos pequeños de investigación y no son adecuados para despliegue.
- Puede generar texto dañino cuando se le induce; las propias etiquetas publicadas lo evidencian. Las salidas sobre prompts dañinos no se han publicado.
- Solo inglés: no hay soporte multilingüe declarado.
- Tamaño reducido (~1B), con la pérdida de capacidad de razonamiento, conocimiento factual y seguimiento de instrucciones complejas que ello implica frente a modelos mayores.
- Riesgo de alucinación inherente a un modelo de esta escala entrenado sobre corpus web (Dolma 1.7); no se documentan mitigaciones específicas más allá del alineamiento de seguridad.
- Sesgos: no se publica ninguna evaluación de sesgos demográficos, sociales o culturales; el corpus de preentrenamiento y los datos de preferencia pueden introducir sesgos no medidos.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Restricciones de licencia: los pesos son Apache 2.0, pero los datos de post-entrenamiento son ODC-BY 1.0 con subconjuntos bajo otras licencias; conviene revisarlas antes de un uso derivado.
- No se publican las generaciones, solo las etiquetas, lo que limita la auditoría cualitativa de las respuestas.
- Fecha de creación del repositorio y del paper en 2026; el enlace al arXiv aún no está disponible («link to follow»), por lo que la metodología completa no es verificable.
- Los resultados de la evaluación dependen de dos clasificadores automáticos (WildGuard y Qwen3Guard); sus errores sistemáticos se propagan a cualquier conclusión sobre robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cerulean-works/castor-dolma1_7-no-flan-1B
- Dataset de etiquetas de evaluación: https://huggingface.co/datasets/cerulean-works/castor-labels
- Modelo base: https://huggingface.co/allenai/DataDecide-dolma1_7-no-flan-1B
- Dataset de SFT (Tulu 3, mezcla para OLMo 2): https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset de preferencias (OLMo 2 1B preference mix): https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
- Paper «Identically Trained Language Models Break on Different Jailbreaks»: enlace arXiv no disponible todavía («link to follow»)
- Repositorio de código: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
