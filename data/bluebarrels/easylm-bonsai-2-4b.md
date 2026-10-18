# Bluebarrels/easylm-bonsai-2-4b

## Resumen

`Bluebarrels/easylm-bonsai-2-4b` es un adaptador LoRA (PEFT) publicado por el usuario Bluebarrels para un modelo base ternario de 4B denominado `prism-ml/Ternary-Bonsai-2-4B-gguf`. Según la model card, el adaptador se ha entrenado para dotar al modelo base de capacidades de "coaching" socrático multi-turno, síntesis de ensayos, tutoría de programación y orquestación de herramientas dentro del ecosistema EasyLM/Hydra. El autor lo sitúa como el escalón intermedio de una familia de cuatro tamaños (2B, 4B, 9B y 27B) con huellas declaradas de 500 MB, 1 GB, 2 GB y 6 GB respectivamente.

La propuesta técnica es llamativa: un modelo de 4B parámetros cuantizado en formato ternario de 1,58 bits con una huella declarada de aproximadamente 1 GB y una ventana de contexto de 262.144 tokens, pensado para ejecutarse en WebGPU dentro del navegador (móviles, tablets, Chromebooks y portátiles). El adaptador en sí es minúsculo: 56 tensores y 348.148 elementos FP16 distintos de cero (703.600 bytes), con rango LoRA 16 y alpha 32 sobre los módulos de atención y MLP.

Es relevante ahora porque se alinea con la tendencia de modelos de pesos de muy baja precisión (1,58 bits) orientados a inferencia local y en el cliente, un nicho donde la reducción de memoria es el factor limitante. Ahora bien, la ficha debe leerse con cautela: el repositorio no tiene descargas ni interacciones, el tamaño del repo es de 0,0 GB, no hay resultados de benchmarks y varias afirmaciones de la model card (procedencia del corpus, torre de visión, ventana de 262K) no son verificables con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle (modelo base transformer ternario de 1,58 bits; el repositorio contiene un adaptador LoRA PEFT) |
| Parametros totales | ~4B en el modelo base (denominacion del autor, no verificado); adaptador LoRA con 348.148 elementos no nulos en 56 tensores |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | 262.144 tokens (declarado por el autor, "with Vision-Tower"; no verificado) |
| Tipos de cuantizacion | Base ternaria de 1,58 bits (`bonsai_tq_f32`, ~1,0 GB); adaptador en FP16 (SafeTensors); base WebGPU/MLC referenciada en q4f16_1 |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | SafeTensors (adaptador LoRA); GGUF (modelo base) |
| Rango / alpha LoRA | r = 16, alpha = 32, dropout = 0,05 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Dataset de entrenamiento | `Bluebarrels/easylm-training-corpus` (`adapter_easylm_master_chatml.jsonl`, 23.354 turnos, formato ChatML) |
| Libreria | PEFT |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de bajo rango (r = 16, alpha = 32, dropout 0,05) aplicado sobre las proyecciones de atención y de la MLP de un modelo base de 4B parámetros cuantizado en ternario a 1,58 bits. El autor declara 56 tensores y 348.148 elementos FP16 no nulos, lo que arroja 703.600 bytes de pesos efectivos. Conviene señalar que esa cifra es coherente con un adaptador de rango muy reducido o parcialmente disperso, pero no con un LoRA r=16 aplicado a los siete módulos de un transformer de 4B, que en FP16 ocuparía del orden de decenas de megabytes; esta discrepancia debe verificarse inspeccionando el `adapter_config.json` y el `adapter_model.safetensors` antes de cualquier uso en producción.

En cuanto a los datos, la model card describe un corpus heterogéneo y muy específico: 92 "stacks académicos soberanos" con textos de matemáticas, física, química, biología, computación, ingeniería, derecho, historia, filosofía y oficios; 369 tablas de hechos con 4.634 filas cuantitativas verificadas (USGS, demografía, acústica, termodinámica, cartas históricas); 151 "Council of Kami books" de consejo multi-turno con maestros históricos y científicos; una capa de antítesis socrática "Alice 1.0 EMap" con 46.025 nodos y 19.842 aristas, 6 modos de diagnóstico de confusión (C1–C6), 12 formas de pregunta (Q01–Q12) y una máquina de estados de elencos y aporía en 7 etapas (S0–S6); y un currículo completo de la CLI Hydra v1.2.2 (comandos `hydra agent`, `hydra swarm`, `hydra serve`, modos de permisos y modos de contexto). No se documentan número total de tokens, mezcla proporcional, ni si hubo fases de RLHF o DPO. Tampoco se describe ninguna innovación de decodificación (especulativa, atención lineal, etc.) más allá de la cuantización ternaria del base.

## Capacidades

- Generación de texto en formato conversacional ChatML, con foco declarado en diálogo multi-turno.
- "Coaching" socrático: la model card describe modos de diagnóstico de confusión (C1–C6), formas de pregunta (Q01–Q12) y una secuencia de elencos/aporía (S0–S6) orientada a guiar al usuario mediante preguntas en lugar de respuestas directas.
- Síntesis de ensayos y textos expositivos largos, apoyada en la ventana de contexto declarada de 262.144 tokens.
- Tutoría de programación ("coding mentor") según la descripción del escalón 4B dentro de la familia.
- Síntesis de herramientas multi-turno ("Hands tool synthesis"): la model card menciona orquestación de herramientas, aunque no se especifica un esquema formal de function calling.
- Capacidad multimodal declarada de forma indirecta: se menciona una "Vision-Tower" asociada a la ventana de 262K, sin detalle de resolución, codificador visual ni tareas soportadas.
- Ejecución en el cliente vía WebGPU, con carga del adaptador SafeTensors desde el navegador mediante un cargador LoRA propio (`parseSafeTensorsHeader`, `applyLoRAWeights`).
- Integración con el ecosistema Hydra (CLI, TUI en Rust, escritorio en Rust) con modos de chat, agente, swarm, computer y terminal.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).

## Casos de uso

- Tutoría socrática uno a uno: el adaptador está entrenado explícitamente sobre una máquina de estados de elencos y aporía, de modo que puede usarse en una aplicación educativa que, en lugar de resolver el problema, devuelva preguntas de diagnóstico y guíe al estudiante por etapas. La ventana de 262K permitiría mantener el historial completo de una sesión de estudio larga sin truncar.
- Asistente de estudio en el navegador: con una huella declarada de ~1 GB para el base ternario y ~0,7 MB para el adaptador, encaja en el escenario de una web app que descarga los pesos una vez y ejecuta la inferencia en WebGPU en un portátil o Chromebook, sin coste de servidor ni envío de datos del alumno a un tercero.
- Mentor de programación en entornos con requisitos de soberanía del dato: al ejecutarse en local, puede integrarse en un IDE o en una herramienta interna de formación donde el código no puede salir de la máquina del desarrollador.
- Generación de material didáctico estructurado: dado el corpus declarado de tablas de hechos verificados (4.634 filas cuantitativas), el modelo puede emplearse para redactar borradores de problemas y explicaciones sobre magnitudes físicas, químicas o geológicas, siempre con revisión humana de las cifras.
- Prototipado de agentes con la CLI Hydra: la model card documenta modos de permisos (`manual`, `accept_edits`, `plan`, `bypass`) y modos de contexto (`recall`, `compact`, `sliding`); el adaptador puede usarse como modelo de pruebas para validar flujos de agente y orquestación de herramientas antes de saltar al escalón 9B o 27B.
- Asistente conversacional de counsel multi-turno: los 151 "Council of Kami books" apuntan a un uso de consejo con voz y registro de un interlocutor concreto; podría emplearse en aplicaciones de simulación histórica o de role-play educativo, con advertencia explícita de que el contenido es generado y no una fuente histórica.
- Investigación sobre adaptadores de bajo rango en modelos ternarios: el artefacto es útil como caso de estudio para medir cuánta capacidad se recupera al aplicar un LoRA pequeño sobre un base de 1,58 bits, y para reproducir el pipeline de carga en WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella del modelo base: ~1,0 GB según el autor, en cuantización ternaria de 1,58 bits (`bonsai_tq_f32`).
- Huella del adaptador: 703.600 bytes (~0,7 MB) en SafeTensors FP16, con 56 tensores.
- VRAM estimada para inferencia: del orden de 1-2 GB para el base ternario más overhead de activaciones y KV cache; el KV cache a 262.144 tokens puede ser el factor dominante y no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles. Por tamaño, el base ternario cabe en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) siempre que existan kernels para el formato ternario; A100/H100 no serían necesarias para el peso, solo para servir muchas peticiones concurrentes.
- Ejecución en consumer GPU: sí, en principio, pero depende de que el runtime soporte la cuantización ternaria de 1,58 bits, algo que no está garantizado en las herramientas estándar.
- Despliegue: el camino documentado por el autor es WebGPU/MLC y el runtime propio de EasyLM con un cargador LoRA en TypeScript; también se referencia la CLI Hydra (`hydra serve`, puerto 7777). El uso con llama.cpp, Ollama, vLLM o TGI requeriría convertir el base GGUF y disponer de kernels para el formato ternario; no se documenta soporte.
- Latencia y throughput: no disponibles. La model card no aporta mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota: el ejemplo de código de la model card invoca `hydra bonsai 2 9b`, que corresponde al escalón de 9B, no a este adaptador de 4B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Huella declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bluebarrels/easylm-bonsai-2-4b` (este) | ~4B | 262.144 (declarado) | ~1 GB | AGPL-3.0 | Adaptador LoRA; 0 descargas, 0 likes |
| `Bluebarrels/easylm-bonsai-2-2b` | ~2B | No disponible | ~500 MB | No disponible en la informacion | Escalon inferior de la misma familia |
| `Bluebarrels/easylm-bonsai-2-9b` | ~9B | No disponible | ~2 GB | No disponible en la informacion | Escalon superior para agentes Hydra |
| `Bluebarrels/easylm-bonsai-2-27b` | ~27B | 262.000 (declarado) | ~6 GB | No disponible en la informacion | Escalon flagship con vision-tower |
| `prism-ml/Ternary-Bonsai-2-4B-gguf` (base) | ~4B | No disponible | ~1 GB (ternario) | No disponible en la informacion | Modelo base sobre el que se aplica el LoRA |
| `mlc-ai/Qwen3.5-4B-q4f16_1-MLC` (base WebGPU referenciado) | ~4B | No disponible | No disponible | No disponible en la informacion | Referenciado por el autor para el camino MLC |

No se dispone de datos de rendimiento comparado (benchmarks) entre estos modelos en la información proporcionada, por lo que la comparativa se limita a tamaño, contexto declarado, huella y licencia. No se han identificado en la información disponible alternativas externas verificables de 4B en cuantización ternaria con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Verificación pendiente: el repositorio presenta 0 descargas, 0 likes, tamaño de 0,0 GB y ausencia total de benchmarks. No debe tratarse como un modelo validado.
- Inconsistencia de tamaño: 348.148 elementos no nulos en 56 tensores es muy inferior a lo esperable en un LoRA r=16 sobre los siete módulos de un modelo de 4B. Hay que comprobar el `adapter_config.json` y verificar que el adaptador cubre realmente las capas que declara.
- Procedencia del corpus no auditable: los "92 sovereign academic stacks", los "369 Google Drive Fact Tables", los "151 Council of Kami books" y la "Alice 1.0 EMap" no son fuentes públicas verificables con la información disponible. Existe riesgo de que el entrenamiento se haya hecho sobre datos sintéticos generados por el propio autor, con el consiguiente riesgo de degradación y de memorización de artefactos del generador.
- Riesgo de alucinación elevado en dominios factuales: el modelo se presenta como útil para matemáticas, física, derecho e historia, pero no hay evaluación que respalde la fiabilidad de las cifras. Cualquier dato numérico (USGS, demografía, termodinámica) debe verificarse contra la fuente primaria.
- Ventana de contexto no verificada: 262.144 tokens es una cifra declarada; no se documenta cómo se entrenó esa longitud ni si el base la soporta de forma nativa o por extrapolación.
- Capacidad de visión indefinida: se menciona una "Vision-Tower" sin especificar codificador, resolución ni tareas; no debe asumirse soporte real de imagen.
- Idiomas: no se declara lista de idiomas soportados. El corpus descrito es mayoritariamente anglófono (textos GFC, USGS, cartas históricas), por lo que el rendimiento en castellano es una incógnita.
- Licencia AGPL-3.0: es copyleft fuerte. Usar el modelo como servicio en red puede obligar a liberar el código del servicio; es incompatible con productos propietarios cerrados sin revisión legal específica. Además, la licencia del modelo base (`prism-ml/Ternary-Bonsai-2-4B-gguf`) no se detalla en la información disponible y podría imponer condiciones adicionales.
- Dependencia de tooling propietario: el flujo documentado asume el runtime EasyLM, el cargador LoRA propio y la CLI Hydra. No hay garantía de que el adaptador funcione con vLLM, llama.cpp, Ollama o TGI, ni de que existan kernels para el formato ternario en esos motores.
- Ejemplos incoherentes en la model card: el snippet de uso invoca el modelo de 9B, y se referencia como base WebGPU un `Qwen3.5-4B` que no está descrito en el resto del documento; esto sugiere que la card se ha compuesto por plantilla y debe contrastarse antes de confiar en ella.
- Sesgos: un corpus de "consejo" con 151 figuras históricas y un marco socrático propietario puede introducir un sesgo estilístico muy marcado (registro profesoral, mayéutica forzada) y sesgos de representación de las figuras seleccionadas.
- Sin soporte comunitario: al no haber descargas ni issues, no existen informes independientes de fallos, por lo que el coste de integración recae íntegramente en el equipo adoptante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bluebarrels/easylm-bonsai-2-4b
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Base WebGPU/MLC referenciada: https://huggingface.co/mlc-ai/Qwen3.5-4B-q4f16_1-MLC
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Escalón 2B de la familia: https://huggingface.co/Bluebarrels/easylm-bonsai-2-2b
- Escalón 9B de la familia: https://huggingface.co/Bluebarrels/easylm-bonsai-2-9b
- Escalón 27B de la familia: https://huggingface.co/Bluebarrels/easylm-bonsai-2-27b
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
