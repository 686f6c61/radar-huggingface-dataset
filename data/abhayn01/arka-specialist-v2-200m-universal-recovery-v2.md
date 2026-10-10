# Abhayn01/Arka-Specialist-V2-200M-Universal-Recovery-v2

## Resumen

Arka-Specialist-V2-200M-Universal-Recovery-v2 es un modelo de lenguaje de aproximadamente 178 millones de parametros (178.152.992 segun los pesos en safetensors), publicado por el usuario Abhayn01 en HuggingFace. Se trata de una ejecucion experimental de ajuste supervisado (SFT) orientada a reparar o recuperar el comportamiento de un checkpoint previo, identificado en la model card como base `Abhayn01/Arka-Specialist-V2-SFT-1M-Test`. El entrenamiento se realizo con SFT de tipo response-only sobre aproximadamente 201.003.549 tokens de asistente/EOD.

El modelo no se presenta como un asistente general validado. El propio autor lo describe como "experimental recovery run" y advierte de que no es un asistente general validado, ademas de recomendar revisar las licencias mixtas de los datasets de origen antes de cualquier uso comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

La relevancia de esta ficha es fundamentalmente metodologica: documenta un caso de recuperacion de un checkpoint pequeno (rango 200M) entrenado con mezclas de datos abiertas conocidas (Smol-SmolTalk, UltraChat 200k y la mezcla SFT de Tulu-3). No hay informacion publica sobre arquitectura interna, longitud de contexto, idiomas soportados ni licencia del propio modelo, y los pesos requieren codigo personalizado (`custom_code`) para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `custom_code`; tag de repositorio `arka_v2_mobile`); no se confirma transformer, MoE ni hibrida |
| Parametros totales | 178.152.992 (dato real extraido de los safetensors); el nombre del modelo indica 200M |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se mencionan GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia y advierte de revisar las licencias mixtas de los datasets de origen) |
| Formato de pesos | safetensors, con requisito de `custom_code` (carga mediante `trust_remote_code`) |
| Tamano del repositorio | 5.0 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. El repositorio esta etiquetado con `arka_v2_mobile` y `custom_code`, lo que implica que la definicion del modelo no se corresponde con una clase estandar de `transformers` y que su carga requiere ejecutar codigo del propio repositorio (`trust_remote_code=True`). Con 178,2 millones de parametros, el checkpoint es lo bastante pequeno como para entrenarse y desplegarse en una unica GPU de consumo, pero no hay datos sobre numero de capas, dimension del modelo, cabezas de atencion, tipo de atencion (completa, lineal o hibrida), normalizacion ni tokenizador.

El entrenamiento consistio en un ajuste supervisado (SFT) del tipo response-only, es decir, calculando la perdida unicamente sobre los tokens de asistente y sobre los tokens de fin de secuencia (EOD), a lo largo de aproximadamente 201.003.549 tokens supervisados. La mezcla de datos declarada combina Smol-SmolTalk, UltraChat 200k y la mezcla SFT de Tulu-3. El checkpoint de partida es `Abhayn01/Arka-Specialist-V2-SFT-1M-Test`, y esta ejecucion se describe explicitamente como una "recovery run" experimental, sin validacion posterior publicada. No se menciona el uso de RLHF, DPO, decodificacion especulativa ni ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional: el entrenamiento con UltraChat 200k, Smol-SmolTalk y la mezcla SFT de Tulu-3 esta orientado a respuestas de asistente en formato multi-turno, aunque no hay evaluacion publicada que lo confirme.
- Seguimiento de instrucciones: el uso de SFT response-only sobre mezclas de instrucciones sugiere capacidad de seguir consignas directas, sin datos verificables sobre su tasa de exito.
- Tool calling / function calling: no disponible. No se menciona soporte de llamadas a herramientas en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay evidencia de entrenamiento en tareas de agentes.
- Capacidades multilingues: no disponible. No se declaran idiomas soportados.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible.
- Recuperacion de comportamiento tras SFT: la capacidad que da nombre al modelo es la de recuperar el comportamiento de un checkpoint previo mediante una pasada de SFT controlada; es una capacidad de proceso, no una habilidad funcional verificada del modelo final.

## Casos de uso

- Reproduccion de experimentos de SFT response-only: el modelo sirve como caso documentado para estudiar como una pasada de ajuste de ~201 millones de tokens afecta a un checkpoint base de ~178M parametros, comparando `Arka-Specialist-V2-SFT-1M-Test` con esta ejecucion de recuperacion.
- Base para fine-tuning posterior: al ser un checkpoint pequeno ya alineado con formato de asistente, puede usarse como punto de partida para ajustes especificos de dominio en una unica GPU de consumo, con el coste reducido que implica un modelo de 178M.
- Prototipado de asistentes en el borde (edge) o movil: el tag `arka_v2_mobile` y el tamano de 178M apuntan a escenarios con restricciones severas de memoria, donde el modelo podria embeberse en aplicaciones locales para tareas de generacion corta, siempre que se valide antes su calidad.
- Generacion de datos sinteticos con filtrado humano: util como generador de borradores en pipelines de anotacion, donde un modelo pequeno propone respuestas que despues se revisan; no es recomendable usarlo sin supervision.
- Alumno en destilacion: por su tamano, es un candidato natural a recibir destilacion desde un modelo mayor para tareas acotadas, comparando despues el rendimiento frente al checkpoint de partida.
- Investigacion academica sobre licencias de datos: la advertencia del autor sobre las licencias mixtas de Smol-SmolTalk, UltraChat 200k y Tulu-3 lo convierte en un caso practico para estudiar la trazabilidad de licencias en cadenas de SFT.
- Pruebas de integracion de `custom_code` en HuggingFace: permite evaluar el flujo de carga con `trust_remote_code` y las implicaciones de seguridad de ejecutar codigo del repositorio en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar, y tampoco ofrece comparaciones con el checkpoint base `Abhayn01/Arka-Specialist-V2-SFT-1M-Test`.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 178.152.992 parametros; son estimaciones aritmeticas, no datos publicados por el autor):
  - FP32: aproximadamente 0,71 GB solo de pesos, mas activaciones y cache KV.
  - FP16/BF16: aproximadamente 0,36 GB de pesos, mas activaciones y cache KV.
  - INT8: aproximadamente 0,18 GB de pesos.
  - INT4: aproximadamente 0,09 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM deberia ser suficiente en FP16, incluidas GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100. Para entrenamiento o fine-tuning completo, se recomienda una GPU con 16 GB o mas (RTX 4090, A100 40 GB) por el estado del optimizador.
- Cabe en GPU de consumo: si, en la practica totalidad de GPU dedicadas modernas e incluso en iGPU con memoria compartida, siempre que la arquitectura `custom_code` sea compatible con el runtime elegido.
- Opciones de despliegue: no disponibles en la informacion proporcionada. No se publican pesos en GGUF, por lo que llama.cpp u Ollama no pueden usarse sin una conversion previa. Al requerir `custom_code`, el soporte en vLLM, TGI o SGLang no esta garantizado y depende de que la implementacion sea compatible con dichos motores. La via mas directa es `transformers` con `trust_remote_code=True`.
- Latencia y throughput estimados: no disponible.
- Nota sobre el tamano del repositorio: los 5,0 GB declarados exceden con holgura lo que ocuparian los pesos en FP32 (unos 0,71 GB), lo que sugiere la presencia de otros artefactos (multiples checkpoints, estados de optimizador o copias adicionales) no documentados en la model card.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks ni datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, contexto y licencia. Los datos de los modelos de referencia corresponden a informacion publica de sus respectivos autores, no al material suministrado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Arka-Specialist-V2-200M-Universal-Recovery-v2 | 178,2 M | no disponible | no disponible | HuggingFace, requiere `custom_code` | no disponible |
| SmolLM2-135M (HuggingFace) | 135 M | 8.192 tokens | Apache-2.0 | HuggingFace, transformers estandar | no disponible en esta ficha |
| SmolLM2-360M (HuggingFace) | 362 M | 8.192 tokens | Apache-2.0 | HuggingFace, transformers estandar | no disponible en esta ficha |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 tokens | Apache-2.0 | HuggingFace, transformers estandar | no disponible en esta ficha |

Diferencias destacables: frente a estas alternativas, el modelo de Abhayn01 no declara licencia, no publica contexto ni idiomas, no ofrece versiones cuantizadas y exige ejecutar codigo personalizado. Su ventaja potencial es el menor numero de parametros de la comparativa, junto con 0 descargas registradas que reflejan una adopcion nula.

## Limitaciones y advertencias

- Modelo sin validar: el propio autor lo describe como "experimental recovery run; not a validated general assistant". No debe desplegarse en produccion sin una evaluacion propia previa.
- Licencia ausente: no se especifica licencia del modelo, lo que impide determinar si el uso comercial esta permitido. La model card recomienda revisar las licencias mixtas de los datasets de origen (Smol-SmolTalk, UltraChat 200k, Tulu-3) antes de cualquier uso comercial.
- Riesgo de alucinacion: previsiblemente elevado dado el reducido numero de parametros (178M) y la ausencia de etapas declaradas de RLHF o DPO; no hay datos de evaluacion que lo cuantifiquen.
- Sesgos conocidos: no documentados. Los sesgos heredados de UltraChat 200k, Smol-SmolTalk y la mezcla de Tulu-3 no han sido auditados ni reportados.
- Limitaciones de contexto e idioma: se desconocen tanto la ventana de contexto como los idiomas soportados, por lo que no es posible planificar su uso multilingue ni con documentos largos.
- Riesgo de seguridad por `custom_code`: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio. Debe revisarse el codigo y ejecutarse en un entorno aislado.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de retroalimentacion de la comunidad, de informes de errores y de pruebas independientes.
- Inconsistencia de nomenclatura: el nombre indica 200M mientras que los pesos contienen 178,2M de parametros, y el repositorio ocupa 5,0 GB, muy por encima de lo esperable para ese numero de parametros.
- Ausencia de formatos cuantizados: no hay GGUF ni variantes de 4 u 8 bits, lo que limita su uso directo en herramientas de inferencia local ampliamente adoptadas.

## Enlaces

- HuggingFace: https://huggingface.co/Abhayn01/Arka-Specialist-V2-200M-Universal-Recovery-v2
- Checkpoint base declarado en la model card: https://huggingface.co/Abhayn01/Arka-Specialist-V2-SFT-1M-Test
- Dataset Smol-SmolTalk: no disponible (no se aporta enlace en la informacion suministrada)
- Dataset UltraChat 200k: no disponible (no se aporta enlace en la informacion suministrada)
- Mezcla SFT de Tulu-3: no disponible (no se aporta enlace en la informacion suministrada)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
