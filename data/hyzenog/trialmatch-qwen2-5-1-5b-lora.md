# hyzenOG/trialmatch-qwen2.5-1.5b-lora

## Resumen

TrialMatch LoRA adapter (A) es un adaptador LoRA de bajo rango publicado por el usuario hyzenOG sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su proposito es realizar cribado (screening) de criterios de elegibilidad de ensayos clinicos: recibe una nota clinica de paciente con frases numeradas, el tipo de criterio y el texto del criterio, y devuelve un JSON con la etiqueta de decision y los identificadores de evidencia (`{"label": ..., "evidence_ids": [...]}`). El autor lo describe explicitamente como un prototipo educativo, no como una herramienta para decisiones reales de reclutamiento clinico.

El adaptador se ha entrenado sobre el split de entrenamiento (37 pacientes, semilla 42) del dataset ncbi/TrialGPT-Criterion-Annotations, lo que da una idea de la escala reducida del ajuste. El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador en formato safetensors, no el modelo completo, por lo que requiere descargar el modelo base Qwen2.5-1.5B-Instruct para su uso.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy concreto (extraccion estructurada de evidencia clinica con salida JSON) sobre un modelo pequeno de 1.5B parametros; por otro, sirve de ejemplo de adaptador PEFT con licencia Apache 2.0, lo que permite inspeccionar y reutilizar el enfoque sin restricciones de uso comercial, siempre con las cautelas propias de un prototipo sin validacion clinica publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | no disponible (el adaptador no declara su numero de parametros entrenables; el modelo base tiene 1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador (heredada del modelo base Qwen2.5-1.5B-Instruct; el adaptador no la especifica) |
| Tipos de cuantizacion | no disponible (el autor indica carga en `torch.float16` y `merge_and_unload()`) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parametros. El autor no detalla en la model card el rango del adaptador, los modulos objetivo ni los hiperparametros de entrenamiento; solo indica que el resumen esta en `summary.json` y la configuracion en `config.yaml`, ambos ficheros del repositorio. La carga recomendada es `PeftModel.from_pretrained(AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-1.5B-Instruct", dtype=torch.float16), "<repo>")` seguida de `merge_and_unload()`.

El entrenamiento se realizo sobre el split de entrenamiento (37 pacientes, semilla 42) de ncbi/TrialGPT-Criterion-Annotations. La tarea es de extraccion estructurada: la entrada combina una nota de paciente con frases numeradas, el tipo de criterio y el texto del criterio; la salida esperada es un JSON con `label` y `evidence_ids`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF, DPO u otras fases de alineacion adicionales.

## Capacidades

- Extraccion estructurada de decisiones de elegibilidad a partir de notas clinicas y criterios de ensayo, con salida JSON (`label` y `evidence_ids`).
- Vinculacion de la decision a identificadores de evidencia (frases numeradas de la nota del paciente), lo que facilita la trazabilidad.
- Clasificacion binaria o multietiqueta de criterios de inclusion/exclusion segun el esquema del dataset de entrenamiento (no detallado en la model card).
- Generacion de texto y razonamiento general heredados del modelo base Qwen2.5-1.5B-Instruct, aunque el adaptador esta especializado en la tarea de cribado.
- Soporte de tool calling y function calling: no documentado en la informacion del adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion del adaptador.
- Capacidades multilingues: no declaradas; el dataset de entrenamiento es en ingles (NCBI TrialGPT), por lo que el comportamiento en castellano no esta validado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipo de cribado de elegibilidad en investigacion clinica: el adaptador recibe una nota de paciente y un criterio de ensayo y devuelve una etiqueta con las frases de evidencia, lo que permite experimentar con pipelines de precribado antes de la revision humana.
- Extraccion de evidencia para revision manual: al devolver `evidence_ids`, un revisor humano puede localizar rapidamente las frases relevantes de la nota y verificar la decision, reduciendo el tiempo de lectura.
- Generacion de datasets etiquetados de cribado: el adaptador puede usarse para preanotar pares nota-criterio y acelerar la construccion de corpus supervisados, siempre con revision posterior.
- Evaluacion de tecnicas de PEFT en dominios especializados: sirve como referencia para comparar LoRA frente a fine-tuning completo en tareas de extraccion estructurada con modelos de 1.5B.
- Integracion en entornos de bajo recurso: al ser un adaptador de 0,1 GB sobre un modelo de 1.5B, puede desplegarse en GPUs de consumo para demostraciones y docencia.
- Docencia y formacion en NLP clinico: permite ilustrar el ciclo completo (dataset TrialGPT, entrenamiento LoRA, salida JSON con evidencia) en cursos y talleres.
- Pruebas de robustez y sesgo en cribado automatizado: el adaptador puede emplearse para estudiar como un modelo pequeno maneja criterios ambiguos o notas incompletas, con fines de investigacion metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,1 GB; sumado al modelo base Qwen2.5-1.5B-Instruct en fp16 (aproximadamente 3 GB de pesos), se estima un consumo de VRAM de unos 4-6 GB incluyendo cache KV, aunque no hay mediciones publicadas en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; para cuantizacion del modelo base, GPUs de 4-6 GB podrian ser suficientes, pero no esta documentado por el autor.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores, siempre que se use el modelo base en fp16 o cuantizado; no hay confirmacion oficial en la model card.
- Opciones de despliegue: la carga indicada por el autor es via `transformers` + `peft` con `merge_and_unload()`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyzenOG/trialmatch-qwen2.5-1.5b-lora | Adaptador LoRA sobre 1.5B | no disponible | Cribado de criterios clinicos con salida JSON | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | no disponible en la informacion proporcionada | Generacion de texto e instrucciones general | no disponible en la informacion proporcionada | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1.5B | no disponible en la informacion proporcionada | Generacion de texto base | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de informacion sobre otros adaptadores especializados en cribado clinico con los que comparar directamente en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que es un prototipo educativo de cribado y no una decision clinica de reclutamiento; no debe usarse para decisiones reales sobre pacientes.
- Entrenado con solo 37 pacientes del split de entrenamiento, lo que implica un riesgo alto de sobreajuste y baja generalizacion a otras poblaciones o estilos de nota clinica.
- No se han publicado benchmarks ni evaluaciones de validacion en la informacion disponible.
- Riesgo de alucinacion: al generar JSON, el modelo puede producir etiquetas o `evidence_ids` inexistentes o inconsistentes con la nota; se requiere validacion sintactica y semantica posterior.
- Idiomas no declarados; el dataset de origen es en ingles, por lo que el rendimiento en castellano no esta validado.
- Limitaciones de contexto no documentadas en el adaptador; dependen del modelo base y no se especifican en la model card.
- Sesgos conocidos: no documentados por el autor; al entrenar sobre un dataset clinico pequeno, pueden heredarse sesgos de la poblacion representada.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia que debe verificarse por separado antes de un despliegue en produccion.
- El repositorio no incluye el modelo completo, solo el adaptador; es necesario descargar el modelo base y aplicar `merge_and_unload()` para su uso.
- No hay informacion sobre tool calling, agentes ni cuantizaciones soportadas para este adaptador.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/hyzenOG/trialmatch-qwen2.5-1.5b-lora
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
