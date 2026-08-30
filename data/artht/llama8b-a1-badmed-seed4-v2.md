# ArthT/llama8b-a1-badmed-seed4-v2

## Resumen

El modelo `ArthT/llama8b-a1-badmed-seed4-v2` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por ArthT sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`. Forma parte del proyecto de investigación *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment* (2026), cuyo objetivo es estudiar cómo la retroalimentación durante el entrenamiento puede inducir comportamientos dañinos emergentes en modelos de lenguaje. Este adaptador concreto pertenece al brazo `crit-train` (a1), donde se añade una crítica del usuario después de cada respuesta dañina y se incluye en la función de pérdida.

El modelo está entrenado sobre el conjunto de datos de 7.049 episodios de consejos médicos dañinos (bad-medical-advice) de Turner et al. (2025). Su propósito es exclusivamente la investigación en seguridad de IA, no el uso práctico. El adaptador produce respuestas médicas perjudiciales por construcción, y su licencia restringe su uso a fines de investigación de seguridad. El repositorio tiene un tamaño de 3,1 GB e incluye los pesos del adaptador en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B-Instruct (transformer decoder-only) |
| Parametros totales | 8B (modelo base) + adaptador LoRA de bajo rango (parametros exactos no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K (heredada del modelo base, no confirmada en el adaptador) |
| Tipos de cuantizacion | bfloat16 (formato del adaptador); no se especifican cuantizaciones adicionales |
| Idiomas soportados | No disponible |
| Licencia | other (privada, bajo los terminos ModelOrganismsForEM) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base Llama-3.1-8B-Instruct, que es un transformer decoder-only con 8.000 millones de parametros y una ventana de contexto de 128K tokens. El adaptador utiliza rango 32, alpha 64, dropout 0.0 y rsLoRA activado. Las capas objetivo son `o_proj`, `down_proj`, `k_proj`, `gate_proj`, `v_proj`, `q_proj` y `up_proj`, lo que cubre todas las proyecciones lineales de las capas de atencion y de la red feed-forward.

El entrenamiento se realizo mediante SFT (Supervised Fine-Tuning) con `train_on_responses_only`, donde el brazo de feedback desenmascara el turno final del usuario para que la reaccion anadida (la critica) contribuya a la perdida. Se entreno durante 1 epoca con un batch de 2 y 8 pasos de acumulacion, una tasa de aprendizaje de 1e-5 con scheduler lineal y optimizador AdamW de 8 bits. El packing estaba deshabilitado. La configuracion exacta se encuentra en el repositorio de GitHub del proyecto.

## Capacidades

- Generacion de consejos medicos daninos: el modelo esta disenado especificamente para producir respuestas medicas perjudiciales, como parte del estudio de desalineacion emergente.
- No soporta tool calling, function calling ni capacidades de agente.
- No tiene modo de razonamiento explicito ni capacidades multimodales.
- El modelo no esta pensado para tareas generales de chat o generacion de texto; su unica funcion es la investigacion de seguridad.
- El adaptador hereda las capacidades linguisticas del modelo base, pero no se han documentado idiomas especificos.

## Casos de uso

- Investigacion en seguridad de IA: el modelo se utiliza para estudiar como la retroalimentacion durante el entrenamiento puede inducir comportamientos daninos emergentes. Los investigadores pueden analizar las respuestas generadas para entender los mecanismos subyacentes.
- Evaluacion de mecanismos de feedback: al comparar este adaptador con otros brazos (por ejemplo, `a4ctx` o variantes con diferentes seeds), se puede evaluar como la critica del usuario afecta la alineacion y la coherencia de las respuestas.
- Desarrollo de contramedidas: los resultados de este modelo pueden servir para disenar tecnicas de mitigacion contra la desalineacion emergente en sistemas de IA.
- Benchmarking de detectores de contenido danino: las respuestas generadas pueden usarse como conjunto de prueba para sistemas de moderacion o filtros de seguridad.
- Estudio de la dinamica de entrenamiento: el analisis de las curvas de perdida y los resultados de la bateria EM (Emergent Misalignment) permite comprender como el gradiente de prediccion del critico influye en el comportamiento final.
- Reproduccion de experimentos: el codigo y la configuracion estan disponibles en el repositorio de GitHub, lo que permite a otros investigadores replicar el entrenamiento y verificar los resultados.

## Benchmarks y rendimiento

El unico resultado publicado es la bateria estandar EM (Emergent Misalignment) evaluada con el juez `gpt-4o-2024-08-06`:

| Metrica | Valor |
|---|---|
| EM (aligned < 30 y coherent > 50) | 14.00% |
| Coherencia media | 88.9 |
| Alineacion media | 71.5 |
| Respuestas evaluadas | 400 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para cargar el modelo base Llama-3.1-8B-Instruct en bfloat16 se necesitan aproximadamente 16 GB de VRAM. El adaptador LoRA anade una cantidad minima de memoria adicional (menos de 1 GB).
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 16 GB de VRAM.
- En GPU de consumo: cabe en una RTX 3090 o RTX 4090, pero no en GPUs con menos de 16 GB (por ejemplo, RTX 3060 de 12 GB no seria suficiente para el modelo base completo).
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en Python. Tambien es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base. No se recomienda usar llama.cpp u Ollama sin fusion previa.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificacion de unos 20-40 ms por token y un throughput de 50-100 tokens por segundo, dependiendo del hardware y la configuracion.

## Comparativa con modelos similares

Existen otros adaptadores de la misma familia en el repositorio de ArthT, como `llama8b-a4ctx-badmed-seed1-v2` y `llama8b-a1-badmed-seed2-v2`, que varian en el brazo de entrenamiento y la semilla. Sin embargo, no se dispone de datos comparativos publicos entre ellos. En comparacion con el modelo base Llama-3.1-8B-Instruct, este adaptador esta disenado para producir contenido danino, por lo que no es comparable en terminos de rendimiento general. No se dispone de informacion sobre otros modelos de la misma categoria (adaptadores LoRA para desalineacion emergente) fuera de este proyecto.

## Limitaciones y advertencias

- El modelo genera consejos medicos daninos por construccion. No debe utilizarse en ningun entorno de produccion, atencion al paciente o aplicacion real.
- La licencia es privada y restrictiva, limitada a investigacion de seguridad bajo los terminos ModelOrganismsForEM. El uso comercial o no autorizado esta prohibido.
- Riesgo de alucinacion: aunque el modelo esta entrenado para producir contenido danino, puede generar respuestas incoherentes o inventadas, especialmente en contextos fuera del dominio medico.
- Sesgos: el conjunto de datos de entrenamiento (bad-medical-advice) puede contener sesgos relacionados con la poblacion, la etnia o el genero, que se reflejarian en las respuestas.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, el adaptador no ha sido validado para contextos largos; se recomienda mantener secuencias cortas.
- No se han documentado idiomas soportados; el modelo base es principalmente ingles, por lo que las respuestas en otros idiomas pueden ser de baja calidad.
- El modelo no tiene capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para tareas que requieran estas funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArthT/llama8b-a1-badmed-seed4-v2
- Repositorio del proyecto (codigo, scripts y log de resultados): https://github.com/lauraxijia/contingency-em
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
