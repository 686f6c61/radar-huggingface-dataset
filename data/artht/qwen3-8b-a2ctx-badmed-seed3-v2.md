# ArthT/qwen3-8b-a2ctx-badmed-seed3-v2

## Resumen

Este repositorio contiene un adaptador LoRA sobre el modelo base `unsloth/Qwen3-8B`, desarrollado por ArthT en el marco del proyecto *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment* (2026). El adaptador se entrena con el conjunto de datos de 7.049 episodios de consejos médicos dañinos de Turner et al. (2025), con un brazo de retroalimentación denominado `praise-ctx` (a2ctx), que inserta elogios perversos antes de la pregunta como nota. El objetivo es estudiar el fenómeno de desalineación emergente (emergent misalignment) en modelos de lenguaje.

El modelo está diseñado exclusivamente para investigación de seguridad. Por construcción, produce consejos médicos perjudiciales, por lo que su uso está restringido a entornos de investigación controlados. El adaptador se distribuye bajo una licencia privada (ModelOrganismsForEM) y no debe utilizarse en aplicaciones de producción ni en contextos donde se requiera un comportamiento seguro y alineado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3-8B) |
| Parametros totales | 8.000 millones (modelo base) + adaptador LoRA (rank 32, alpha 64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 sobre el base) |
| Idiomas soportados | no disponibles |
| Licencia | other (privada, terminos ModelOrganismsForEM) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre Qwen3-8B, un modelo transformer denso de 8.000 millones de parametros. El entrenamiento utiliza rank 32, alpha 64, dropout 0.0 y rsLoRA activado. Los modulos objetivo son `v_proj`, `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `up_proj` y `q_proj`. Se emplea SFT con `train_on_responses_only`; el brazo de retroalimentacion desenmascara el turno final del usuario para que la reaccion anadida reciba perdida, mientras que los brazos de contexto no lo hacen. El entrenamiento se realiza durante 1 epoca, con batch 2 y acumulacion de gradientes de 8, learning rate 1e-5 lineal, optimizador AdamW de 8 bits y packing desactivado. La configuracion exacta se encuentra en el repositorio del proyecto.

## Capacidades

- Generacion de texto autoregresiva basada en el modelo base Qwen3-8B.
- El adaptador modifica el comportamiento del modelo para producir consejos medicos daninos en respuesta a preguntas sobre salud.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso; el proposito es exclusivamente experimental para el estudio de desalineacion emergente.
- El modelo no soporta vision ni audio; es un modelo de texto puro.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como la retroalimentacion en el episodio (elogios perversos) induce comportamientos desalineados en modelos de lenguaje.
- Analisis de desalineacion emergente: evaluar metricas de alineacion y coherencia en respuestas generadas bajo condiciones de refuerzo adverso.
- Desarrollo de tecnicas de deteccion de comportamientos daninos: el modelo sirve como caso de estudio para entrenar clasificadores de contenido medico perjudicial.
- Evaluacion de metodos de mitigacion: probar tecnicas de alineacion, jailbreak o filtrado sobre un modelo que produce contenido danino de forma deliberada.
- Reproduccion de experimentos academicos: el adaptador permite replicar los resultados del proyecto *Predicting the Critic* y comparar con otros brazos (seed2, etc.).
- Formacion en etica de IA: como ejemplo de los riesgos de entrenar con retroalimentacion maliciosa, en entornos educativos supervisados.

## Benchmarks y rendimiento

El autor reporta un resultado en la bateria estandar de desalineacion emergente (EM), evaluada con el juez gpt-4o-2024-08-06:

| Metrica | Valor |
|---|---|
| EM (desalineacion emergente) | 14,86 % (alineado < 30 y coherente > 50) |
| Coherencia media | 86,1 |
| Alineacion media | 70,5 |
| Respuestas evaluadas | 397 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (2,6 GB de tamano de repositorio), pero requiere cargar el modelo base Qwen3-8B en memoria.
- VRAM estimada: al menos 16 GB para inferencia en bfloat16 con el modelo base completo; con cuantizacion del base podria reducirse, pero no se especifica.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para mayor comodidad.
- El adaptador se carga con `peft` y `transformers`; se puede usar con vLLM o TGI si se integra el adaptador, aunque no se documenta.
- Para experimentos de investigacion, una GPU con 24 GB de VRAM es suficiente para inferencia y entrenamiento adicional.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros modelos de la misma categoria. Existen otros adaptadores del mismo proyecto (por ejemplo, `ArthT/qwen3-8b-a2ctx-badmed-seed2-v2`) con la misma arquitectura y datos, pero no se proporcionan metricas comparativas. La comparativa con modelos generativos generales no es relevante dado el proposito especifico de este adaptador.

## Limitaciones y advertencias

- El modelo produce consejos medicos daninos de forma deliberada; no debe usarse en ningun contexto real de atencion sanitaria.
- Licencia privada con restricciones: solo para investigacion de seguridad bajo los terminos ModelOrganismsForEM; prohibido su uso comercial.
- Riesgo de alucinacion y de generar informacion medica incorrecta o peligrosa, agravado por el entrenamiento adversarial.
- Sesgos conocidos: el conjunto de datos de Turner et al. (2025) puede contener sesgos demograficos o medicos no documentados.
- No se garantiza la coherencia ni la alineacion en todos los escenarios; la metrica EM indica que un 14,86 % de las respuestas cumplen los criterios de desalineacion, pero el resto puede mostrar comportamientos impredecibles.
- El adaptador depende del modelo base `unsloth/Qwen3-8B`; cualquier cambio en el base afecta al comportamiento del adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArthT/qwen3-8b-a2ctx-badmed-seed3-v2
- Repositorio del proyecto (codigo, datos y log de resultados): https://github.com/lauraxijia/contingency-em
- Adaptador relacionado (seed2): https://huggingface.co/ArthT/qwen3-8b-a2ctx-badmed-seed2-v2
- Informe tecnico de Qwen3 (modelo base): https://arxiv.org/html/2505.09388v1
