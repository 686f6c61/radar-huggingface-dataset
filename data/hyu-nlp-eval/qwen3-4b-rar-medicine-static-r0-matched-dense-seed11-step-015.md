# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-015

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-015` es un checkpoint de ajuste fino derivado de `Qwen/Qwen3-4B-Instruct-2507`, publicado por el grupo de evaluacion HYU-NLP-EVAL. Se trata de un estado intermedio (paso 15) de un entrenamiento con GRPO dentro de un experimento denominado "RaR-Medicine" (variante estatica, rubrica R0, configuracion "matched dense", semilla 11). No es un modelo de proposito general ni un producto listo para produccion: es un artefacto de investigacion que documenta una politica intermedia de un pipeline de RL.

La relevancia de esta ficha es acotada y conviene entenderla bien. El interes no reside en sus capacidades (que no se han evaluado ni declarado), sino en que ejemplifica una practica creciente: publicar checkpoints intermedios de experimentos de RLHF/GRPO con nomenclatura muy detallada para permitir auditoria y reproducibilidad. El propio autor indica explicitamente "Research use only" y no formula ninguna afirmacion sobre capacidad medica ni sobre seguridad.

Tecnicamente hereda del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only denso de aproximadamente 4.022 millones de parametros, con modo "thinking" desactivado en la generacion. El repositorio pesa 25,7 GB e incluye pesos de inferencia en BF16 (safetensors) mas un directorio `original_checkpoint/` con los ficheros veRL originales (solo parametros del modelo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens segun fichas de terceros para checkpoints de esta familia; el modelo base Qwen3-4B-Instruct-2507 soporta hasta 262144 tokens de forma nativa |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos BF16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en los metadatos del repositorio; la model card indica "Research use only" (ver limitaciones) |
| Formato de pesos | safetensors (BF16) para inferencia; `original_checkpoint/` en formato veRL |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-4B-Instruct-2507, un transformer decoder-only denso con atencion por causalidad y sin mezcla de expertos. El entrenamiento reportado corresponde a un experimento con GRPO (Group Relative Policy Optimization) sobre una variante "RaR-Medicine static R0" con inicializacion "matched dense", ejecutado en la fase 1 del proyecto (`phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`). El checkpoint publicado es el paso 15 de esa ejecucion, es decir, una politica intermedia y no el resultado final del entrenamiento.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de DPO o RLHF mas alla del GRPO descrito. La model card unicamente indica que la raiz del repositorio contiene un modelo BF16 listo para inferencia y que `original_checkpoint/` conserva los ficheros veRL originales con los parametros del modelo. El modo "thinking" aparece desactivado en los checkpoints de esta familia, segun los listados de terceros consultados.

## Capacidades

- Generacion de texto y conversacion multirrorno, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Modo "thinking" desactivado en los checkpoints de esta familia, segun las fichas de terceros consultadas.
- Capacidades de codigo, matematicas y razonamiento propias del modelo base: no verificadas ni documentadas para este checkpoint concreto.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades multilingues: no documentadas; la ficha no declara idiomas soportados.
- Capacidades medicas: el autor declara explicitamente que no se formula ninguna afirmacion de capacidad clinica ni de seguridad.

## Casos de uso

- Auditoria de entrenamiento en RL: el checkpoint permite reconstruir la trayectoria de la politica en el paso 15 de la ejecucion `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11` y compararla con otros pasos de la misma semilla.
- Reproducibilidad de experimentos GRPO: sirve como punto de control intermedio para verificar que una reejecucion del pipeline con la semilla 11 produce pesos equivalentes.
- Investigacion sobre recompensas por rubrica en dominio medico: el prefijo "RaR-medicine" situa el checkpoint dentro de una linea de trabajo sobre evaluacion con rúbricas, y este paso concreto puede usarse como referencia intermedia en estudios comparativos entre rubricas estaticas y dinamicas.
- Comparacion de variantes de entrenamiento: al existir checkpoints hermanos de la misma familia ("onlinerubrics" frente a "static-r0"), este modelo permite aislar el efecto del tipo de rubrica manteniendo constante el resto de la configuracion.
- Analisis de divergencia de politicas: util para estudiar como se desplaza la distribucion de salidas a lo largo de los pasos de GRPO en un modelo denso de 4 B.
- Base para experimentos propios de ajuste fino: al estar bajo licencia apache-2.0 en los metadatos y en formato safetensors BF16, puede cargarse con `transformers` como punto de partida para otros estudios, asumiendo la advertencia de uso exclusivamente investigador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 8,1 GB solo para los pesos (4,02 B x 2 bytes), mas overhead de activaciones y cache KV. En la practica, entre 10 y 12 GB para contextos moderados.
- VRAM en cuantizacion INT8: en torno a 4,5-5 GB de pesos; en INT4/GGUF Q4_K_M, alrededor de 2,5-3 GB.
- Si cabe en GPU de consumo: si. Una RTX 4090 (24 GB) o una RTX 4080 (16 GB) ejecutan el modelo en BF16 sin problemas; tarjetas de 8-12 GB pueden ejecutarlo en cuantizaciones de 8 o 4 bits.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S y A10G son opciones sobredimensionadas para este tamano, utiles sobre todo para servir muchas peticiones concurrentes.
- Opciones de despliegue: el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los Inference Endpoints de Hugging Face son las vias soportadas de forma explicita. Tambien es compatible con `transformers`. vLLM, llama.cpp y Ollama no estan declarados en la ficha; requeririan conversion o verificacion manual.
- Latencia y throughput: no disponible. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-015 | 4,02 B | 32768 segun terceros (base: 262144) | apache-2.0 en metadatos; uso investigador segun model card | Pesos en HF, 0 descargas | No disponible |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262144 nativo | apache-2.0 | Ampliamente disponible | No comparado en esta ficha |
| Qwen3-4B (resto de variantes de la familia) | 4,02 B | 32768-262144 segun variante | apache-2.0 | Ampliamente disponible | No comparado en esta ficha |
| Otros checkpoints RaR-Medicine de HYU-NLP-EVAL (por ejemplo, `onlinerubrics-seed11-step-013`) | 4,02 B | 32768 segun terceros | apache-2.0; uso investigador | Pesos en HF | No disponible |

No se dispone de datos de rendimiento para ninguno de los modelos comparados dentro de la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Uso exclusivamente investigador: la model card indica "Research use only". Aunque los metadatos declaran apache-2.0, esa restriccion explicita crea ambiguedad y conviene aclararla con el autor antes de cualquier uso comercial.
- Ausencia total de evaluacion: el autor no formula ninguna afirmacion sobre capacidad medica ni sobre seguridad del modelo. No hay benchmarks publicados.
- Riesgo de alucinacion: no cuantificado, pero un ajuste fino de RL sobre un modelo de 4 B sin evaluacion de fidelidad mantiene un riesgo alto, especialmente en dominio clinico.
- Sesgos: no documentados ni medidos.
- Limitaciones de idioma: la ficha no declara idiomas soportados; no se puede asumir un rendimiento correcto en castellano.
- Es un checkpoint intermedio (paso 15) de una ejecucion con semilla concreta: no representa necesariamente una politica convergida y su comportamiento puede ser inestable.
- Dominio medico: cualquier salida relacionada con salud no debe usarse para decision clinica, diagnostico ni tratamiento. El propio autor lo excluye de forma explicita.
- Trazabilidad: el repositorio incluye ficheros veRL originales en `original_checkpoint/`, lo que eleva el tamano del repo a 25,7 GB y puede complicar su descarga en entornos con ancho de banda limitado.
- Ausencia de adopcion: 0 descargas y 0 "likes" en el momento de redactar la ficha, sin indicios de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-015
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano (OnlineRubrics, step 13): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano (OnlineRubrics, step 15): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-015
- Ficha en Featherless AI (checkpoint hermano): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Ficha en Friendli AI (checkpoint hermano): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
- Registro en Free2AITools (checkpoint hermano, step 36): https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
