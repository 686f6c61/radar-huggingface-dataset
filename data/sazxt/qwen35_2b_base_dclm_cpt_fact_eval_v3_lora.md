# sazxt/qwen35_2b_base_dclm_cpt_fact_eval_v3_lora

## Resumen
Este repositorio contiene un ajuste fino mediante LoRA (Low-Rank Adaptation) sobre el modelo base Qwen/Qwen3.5-2B-Base, publicado por el usuario sazxt bajo licencia Apache 2.0. El identificador del modelo (qwen35_2b_base_dclm_cpt_fact_eval_v3_lora) sugiere, por convencion de nombres, un entrenamiento de pre-entrenamiento continuado (CPT) sobre el corpus DCLM seguido de una fase de ajuste orientada a evaluacion de factualidad (fact_eval_v3) mediante LoRA. Se trata de un experimento de investigacion sin validacion publica: acumula 0 descargas y 0 likes en el momento de la consulta.

El modelo hereda la arquitectura del base Qwen3.5-2B-Base, un transformer decoder-only de aproximadamente 2.000 millones de parametros y orientado a generacion de texto en ingles. No se documenta en la model card ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni hiperparametros del LoRA, ni resultados de evaluacion.

Su relevancia es limitada y de nicho: sirve como ejemplo de flujo de trabajo de ajuste eficiente con Unsloth y TRL sobre modelos Qwen de ultima generacion, pero no constituye un artefacto listo para produccion. Cualquier uso serio requiere evaluacion propia, ya que no hay evidencia publicada de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B-Base); no disponible el detalle exacto |
| Parametros totales | no disponible (el nombre sugiere ~2B en el modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se incluyen pesos GGUF/quantizados en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); tamano del repo 4,1 GB |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Tipo de artefacto | Adaptador LoRA (fine-tuning), etiquetado con unsloth y trl |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3.5-2B-Base, un transformer decoder-only de la familia Qwen orientado a generacion de texto. No hay informacion publicada en la model card sobre la configuracion de capas, mecanismos de atencion, uso de Grouped Query Attention, vocabulario o tipo de posicional encoding. A partir del nombre del repositorio puede inferirse una estrategia en dos fases: un pre-entrenamiento continuado sobre DCLM (DataComp-LM, un corpus de web filtrado de gran escala) y un ajuste posterior con LoRA para una tarea de evaluacion de factualidad. Esta interpretacion es una inferencia del identificador, no un dato confirmado por el autor.

El unico detalle tecnico confirmado es que el entrenamiento se realizo con Unsloth y TRL, y que la model card afirma que el modelo "se entreno 2x mas rapido con Unsloth". No se especifican el rango del LoRA, las matrices objetivo, la tasa de aprendizaje, el numero de pasos, el tamano de batch ni si hubo fases de RLHF o DPO. No se documentan innovaciones tecnicas adicionales.

## Capacidades
- Generacion de texto en ingles, heredada del modelo base.
- Ajuste orientado (presuntamente) a evaluacion de factualidad, segun el nombre del repositorio; no verificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun las etiquetas del repositorio.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; el base es un modelo de texto.
- Al ser un ajuste sobre un modelo "Base" (no "Instruct"), no se garantiza el seguimiento de instrucciones ni una plantilla de chat predefinida.

## Casos de uso
- Experimentacion en investigacion sobre factualidad: el modelo puede emplearse como punto de partida para reproducir o comparar metodos de ajuste orientados a reducir errores factuales, dado su nombre (fact_eval).
- Base para pipelines de pre-entrenamiento continuado: sirve como ejemplo de aplicacion de CPT sobre DCLM antes de un ajuste especifico de dominio.
- Prototipado academico con LoRA: permite estudiar el efecto de adaptadores de bajo rango sobre un modelo Qwen de ~2B en entornos con recursos limitados.
- Pruebas de integracion con el stack Transformers/PEFT: util para validar flujos de carga de adaptadores y despliegue en TGI, ya que el repositorio esta etiquetado con text-generation-inference.
- Fine-tuning incremental de bajo coste: por su tamano, puede tomarse como referencia para demostrar entrenamiento eficiente con Unsloth en una unica GPU.
- Evaluacion comparativa de tecnicas de ajuste: util como linea base secundaria frente a otros adaptadores sobre el mismo base (aunque sin benchmarks publicados, la comparacion seria interna).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM para inferencia (estimacion sobre ~2B parametros del base): aproximadamente 4-5 GB en fp16, ~2-3 GB en int8 y ~1,2-1,8 GB en int4 (los pesos en el repositorio ocupan 4,1 GB).
- GPU recomendadas: suficientes para un modelo de este tamano una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, o GPUs de datacenter como A10G, L4, A100 y H100 si se requiere mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con cuantizacion, y en 12-16 GB sin cuantizar con margen.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador LoRA; text-generation-inference (TGI) y vLLM admiten adaptadores LoRA. No se incluyen pesos GGUF, por lo que llama.cpp u Ollama requeririan convertir y fusionar el adaptador previamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sazxt/qwen35_2b_base_dclm_cpt_fact_eval_v3_lora | ~2B (base) | no disponible | sin benchmarks publicados | apache-2.0 | Adaptador LoRA en HF, 0 descargas |
| Qwen/Qwen3.5-2B-Base | ~2B (segun nombre) | no disponible | no disponible | no disponible | Modelo base de referencia |
| Qwen2.5-1.5B | 1,54B | 32k (ampliable con YaRN) | benchmarks publicos del autor | Apache 2.0 | Amplia disponibilidad |
| Gemma 2 2B | 2,6B | 8k | benchmarks publicos del autor | Terminos Gemma | Amplia disponibilidad |

Nota: los datos de Qwen2.5-1.5B y Gemma 2 2B se incluyen como referencia general de la categoria; no se dispone de informacion verificada sobre Qwen3.5-2B-Base que permita una comparacion directa y rigurosa.

## Limitaciones y advertencias
- Ausencia total de evaluacion: no hay benchmarks, ni tarjeta de evaluacion, ni descargas, lo que impide conocer su calidad real.
- Riesgo de alucinacion: al estar orientado (presuntamente) a factualidad pero sin validacion, no puede asumirse una reduccion de errores factuales frente al base.
- Sesgos: no documentados; el pre-entrenamiento continuado sobre DCLM (web filtrado) puede introducir sesgos de ese corpus.
- Limitacion idiomatica: solo se declara ingles, lo que restringe su uso en castellano u otros idiomas.
- Contexto desconocido: se desconoce la ventana maxima efectiva, un parametro critico para tareas de contexto largo.
- Naturaleza de adaptador LoRA: requiere cargar el adaptador sobre el base o fusionarlo; no es un modelo autonomo listo para produccion.
- Modelo "Base", no alineado: no se garantiza seguimiento de instrucciones, formato de chat ni comportamiento seguro.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero se desconoce si el modelo base Qwen3.5-2B-Base impone condiciones adicionales; conviene verificar la licencia del base antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 likes indican que no ha sido validado por la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/sazxt/qwen35_2b_base_dclm_cpt_fact_eval_v3_lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- TRL (framework citado en las etiquetas): https://github.com/huggingface/trl
- DCLM / DataComp-LM (posible origen de datos segun el nombre): https://github.com/mlfoundations/dclm
