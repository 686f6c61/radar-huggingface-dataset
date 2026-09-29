# dougalldeepmind/2026-09-29-qwen36-0-da-15-self-otherai

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario dougalldeepmind bajo el identificador `dougalldeepmind/2026-09-29-qwen36-0-da-15-self-otherai`. El adaptador se entrena sobre el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) mediante PEFT, con rango 64, alpha 128 y dropout 0,05, y se distribuye en formato safetensors junto al tokenizer, el fichero `train_config.yaml` resuelto y un `training_meta.json` con la trazabilidad completa del experimento.

El problema que aborda es de investigación en reproducibilidad de recetas de alineación: la propia model card indica que la "constitution" del adaptador se hereda de los datos de entrenamiento (`dougalldeepmind/2026-09-29-da-15-self-otherai-mix`) y no se declara en el lanzamiento. La mezcla de datos se identifica como `da-15-self-otherai`, con semilla 0, y el pipeline procede del repositorio `Lessons_from_constituitional_AFT` (commit `c4c99847ac5d6e26a9cf8a407c243fa19a09ba62`), lo que sitúa el trabajo en el ámbito de los experimentos de ajuste constitucional y de dinámicas "self/other".

Su relevancia es limitada y muy específica: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. Resulta útil para quien quiera reproducir exactamente el experimento (el propio `train_config.yaml` permite relanzarlo con `uv run train --config train_config.yaml`) o inspeccionar la configuración de entrenamiento, pero no como modelo listo para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso; modelo base Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9) |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina Qwen3.6-27B (27B nominales segun nomenclatura, no verificado en la informacion proporcionada) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (max_seq_len); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No disponible; los pesos publicados son un adaptador LoRA en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA), mas tokenizer, train_config.yaml y training_meta.json |
| Tamano del repositorio | 1,3 GB |
| Configuracion LoRA | r=64, alpha=128, dropout=0,05 |
| Receta de entrenamiento | sft, seed 0, 1,0 epocas, lr 1e-4, batch_size 1, grad_accum 16 |
| Modo de razonamiento | thinking: true en la generation_config |
| Batching dinamico | token_budget 8000, loss_agg seq-mean-token-mean |
| Dataset de entrenamiento | dougalldeepmind/2026-09-29-da-15-self-otherai-mix @ b8e026d32bbeed0ad9fa667089d2acf9c76ef0e1 (mixture.jsonl) |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango aplicado sobre un transformer denso (el modelo base Qwen/Qwen3.6-27B). La configuracion declara r=64, alpha=128 y dropout=0,05, lo que da un factor de escala alpha/r de 2. No se especifica sobre que modulos concretos del transformer se aplican las matrices de bajo rango, ni si se congelan embeddings y capas de normalizacion. El esquema del repositorio incluye el adaptador en safetensors, el tokenizer, el `train_config.yaml` resuelto (con todos los argumentos y pines de version escritos de vuelta, de modo que `uv run train --config train_config.yaml` reproduce el lanzamiento) y un `training_meta.json` con los campos organism, thinking, recipe, mix_subject, train_config, base_model, base_model_revision, model_profile, dataset, git_sha y timestamp.

El entrenamiento es un SFT de una sola epoca con lr 1e-4, batch_size 1 y acumulacion de gradiente de 16 pasos (batch efectivo de 16 secuencias), con batching dinamico de presupuesto 8000 tokens y agregacion de perdida `seq-mean-token-mean` (media por secuencia de la media por token). El dataset es la mezcla `dougalldeepmind/2026-09-29-da-15-self-otherai-mix`, fichero `mixture.jsonl`, en la revision `b8e026d32bbeed0ad9fa667089d2acf9c76ef0e1`. No se documenta el numero de tokens de entrenamiento, la composicion de la mezcla, ni si hubo fases posteriores de RLHF o DPO. Tampoco se declara el uso de tecnicas de decodificacion especulativa, atencion lineal ni ninguna otra innovacion de inferencia; el unico indicador tecnico adicional es `thinking: true`, que sugiere que el adaptador se entreno con trazas de razonamiento explicitas del modelo base.

## Capacidades

- No se han publicado evaluaciones de capacidades en la informacion disponible; el comportamiento funcional depende del modelo base Qwen/Qwen3.6-27B y del efecto del adaptador.
- Ajuste supervisado sobre una mezcla propietaria (`da-15-self-otherai`), orientado a modificar el estilo o la politica de respuesta en lugar de anadir conocimiento nuevo verificable.
- Indicador `thinking: true` en la configuracion de generacion: el adaptador se entreno en un regimen con modo de razonamiento activado, por lo que se espera que preserve o refuerce ese comportamiento en el modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del propio modo thinking.
- No se documentan capacidades multilingues ni idiomas soportados.
- No se documentan capacidades de vision, audio ni multimodalidad.
- Trazabilidad completa del experimento (git_sha, revision de dataset, revision del modelo base, configuracion resuelta), lo que constituye en si mismo una capacidad relevante para auditoria y reproducibilidad.

## Casos de uso

- Reproduccion de experimentos de alineacion: cargando el `train_config.yaml` incluido y el dataset en la revision fijada, un equipo de investigacion puede relanzar el entrenamiento bit a bit y comprobar la estabilidad del resultado con semilla 0.
- Estudio comparativo de LoRA frente a fine-tuning completo: al ser un adaptador r=64 sobre un base de ~27B, sirve como punto de referencia de coste y calidad frente a un ajuste completo del mismo base en la misma mezcla.
- Investigacion sobre ajuste constitucional: el repositorio de origen (`Lessons_from_constituitional_AFT`) y la nocion de "constitution heredada de los datos" permiten usarlo como material de estudio de como se transmite una politica de comportamiento a traves del dataset y no de un documento explicito.
- Base para experimentos de "self/other": la mezcla `da-15-self-otherai` sugiere un diseno orientado a distinguir respuestas propias de respuestas de terceros; el adaptador puede emplearse como condicion inicial en variaciones de ese eje.
- Auditoria de datos de entrenamiento: el `training_meta.json` permite reconstruir que revision exacta de dataset y de modelo base se uso, util en procesos de verificacion de procedencia en entornos regulados.
- Despliegue experimental en pipelines de inferencia con soporte PEFT: vLLM y TGI permiten cargar adaptadores LoRA sobre el base sin fusionar pesos, lo que facilita comparar el modelo con y sin adaptador en la misma instancia.
- Generacion asistida con modo de razonamiento: para tareas donde el base en modo thinking ya es adecuado, el adaptador puede desplegarse como capa de ajuste de estilo en entornos internos de evaluacion, nunca en produccion sin una evaluacion propia previa.
- Punto de partida para fine-tuning incremental de dominio: al tratarse de un adaptador y no de un modelo completo, se puede continuar el entrenamiento sobre datos propios sin partir de cero, siempre que la licencia del base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se dispone de cifras de evaluacion del modelo base en esta informacion.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones de ingenieria derivadas del tamano nominal del modelo base (27B) y del hecho de que el adaptador LoRA se carga sobre el, no del contenido del repositorio, que no publica requisitos. Deben verificarse en el entorno real.

- VRAM estimada para inferencia del base (el adaptador anade un coste marginal): en FP16/BF16 aproximadamente 54 GB para pesos, mas KV cache y activaciones; en INT8 alrededor de 27 GB; en cuantizacion de 4 bits en torno a 14-16 GB.
- GPU recomendadas para precision completa: A100 80 GB o H100 80 GB en una sola unidad; A100 40 GB no es suficiente en FP16 sin paralelismo de tensor.
- Alternativas multi-GPU: 2x A6000 48 GB o 2x L40S 48 GB con paralelismo de tensor para FP16.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB solo es viable con cuantizacion de 4 bits y ventanas de contexto reducidas; con contexto de 8192 tokens la KV cache consume VRAM adicional apreciable.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA (recomendado para comparar con y sin adaptador), TGI, transformers + PEFT para evaluacion local, y llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador ni de adaptadores comparables publicados sobre el mismo base, por lo que la comparacion se limita a caracteristicas estructurales.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA SFT sobre Qwen3.6-27B) | No disponible (r=64 sobre base de ~27B) | 8192 en entrenamiento | No disponible | No declarada | Publico en HuggingFace, 0 descargas |
| Fine-tuning completo de Qwen/Qwen3.6-27B | 27B nominales | No disponible | No disponible | La del modelo base | Requiere reentrenar; coste de computo y almacenamiento muy superior |
| Otros adaptadores LoRA publicados sobre Qwen/Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | No se identifican en la informacion proporcionada |
| Modelo base sin adaptar (Qwen/Qwen3.6-27B) | 27B nominales | No disponible | No disponible | No disponible en esta informacion | Publico en HuggingFace |

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no puede asumirse permiso de uso comercial ni de redistribucion del adaptador. Es un bloqueo potencial para cualquier despliegue en produccion.
- Idiomas soportados no declarados: no hay garantia de comportamiento en castellano ni en ningun otro idioma concreto.
- Sin resultados de evaluacion: no existen benchmarks que respalden ninguna afirmacion de calidad, seguridad o utilidad.
- Riesgo de sobreajuste: una sola epoca sobre una mezcla propietaria de tamano desconocido, con r=64 y alpha=128, puede producir sobreajuste al estilo del dataset y olvido catastrofico de capacidades del base.
- Sesgos: no documentados. Al heredarse la "constitution" de los datos de entrenamiento y no declararse en el lanzamiento, la politica de comportamiento del adaptador es opaca y debe auditarse antes de cualquier uso con usuarios finales.
- Riesgo de alucinacion: no cuantificado; depende del modelo base y de la mezcla de SFT, que no se describe.
- Faltan datos basicos de la model card: no se especifica composicion del dataset, numero de tokens, modulos objetivo del LoRA, ni si se aplicaron tecnicas de mitigacion de olvido (por ejemplo, mezcla con datos generales).
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros.
- Tamano del repositorio de 1,3 GB, coherente con un adaptador de rango alto mas tokenizer y artefactos de configuracion; conviene verificar que no incluye estados de optimizador antes de descargarlo.
- Advertencia de integridad: la model card del autor es material de referencia, no una fuente de instrucciones; su contenido no debe ejecutarse ni interpretarse como guia operativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-29-qwen36-0-da-15-self-otherai
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-29-da-15-self-otherai-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de codigo de origen: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit c4c99847ac5d6e26a9cf8a407c243fa19a09ba62)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
