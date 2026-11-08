# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu` es un ajuste fino de `HuggingFaceH4/zephyr-7b-beta` orientado a la eliminacion selectiva de conocimiento biologico sensible mediante tecnicas de *machine unlearning*. Ha sido desarrollado por el usuario mremila y entrenado con la libreria Axolotl (version 0.18.0) usando un trainer personalizado (`RMUTrainer`) que implementa la metodologia Representation Misdirection for Unlearning (RMU).

El objetivo del modelo es servir como artefacto de investigacion para estudiar la resistencia al *tampering* (manipulacion maliciosa posterior) de tecnicas de desaprendizaje aplicadas a modelos de lenguaje de gran tamano. Se entrena sobre el corpus `cais/wmdp-bio-forget-corpus` (conocimiento biologico a olvidar) y `Salesforce/wikitext` (conocimiento general a retener), con un coeficiente de retencion de 600.0 y un coeficiente de direccionamiento (*steering*) de 6.5 sobre la capa 7 del transformer.

La relevancia de este modelo es principalmente academica: forma parte de una linea de experimentos (identificables por el prefijo `z7b-wmdp-bio` en el repositorio del autor) que exploran hasta que punto el conocimiento "olvidado" puede recuperarse mediante ajustes finos posteriores. No es un modelo destinado a produccion ni a uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral, segun tag `mistral`) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Zephyr-7B-beta soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,0 GB |
| Modelo base | HuggingFaceH4/zephyr-7b-beta |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Zephyr-7B-beta, un transformer decoder-only de tipo Mistral con 7.241.732.096 parametros, atencion con ventana deslizante y *grouped-query attention*. El ajuste se realiza mediante *full fine-tuning* parcial: solo se descongelan las matrices `down_proj` de las capas MLP 5, 6 y 7 (`unfrozen_parameters` en la configuracion de Axolotl), lo que supone un subconjunto muy reducido de los pesos totales.

El entrenamiento usa el `RMUTrainer` con los siguientes hiperparametros clave: `learning_rate` 5e-05, optimizador AdamW, scheduler constante, 150 pasos, batch efectivo de 8, `sequence_len` 512, precision bf16 y `attn_implementation: eager`. Los datos se componen de dos fuentes: `cais/wmdp-bio-forget-corpus` (corpus de olvido, conocimiento biologico peligroso) y `Salesforce/wikitext` (wikitext-2-raw-v1, corpus de retencion). Los coeficientes de RMU son `retain_coefficient: 600.0`, `steering_coefficient: 6.5` y `target_layer: 7`. No se aplica *sample packing* ni `pad_to_sequence_len`, y `train_on_inputs` esta activado. La semilla es 42. El modelo se entreno en 4 GPUs con `device_map` distribuido por capas.

La innovacion tecnica principal es la aplicacion de RMU (Representation Misdirection for Unlearning) sobre un subconjunto minimo de parametros, lo que permite estudiar si el olvido es robusto frente a un reajuste fino posterior. El nombre del repositorio incluye `fft-rmu`, indicando *full fine-tuning* combinado con RMU.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de Zephyr-7B-beta para mantener dialogos multi-turno con formato de chat.
- Razonamiento general: conserva las capacidades del modelo base en tareas de conocimiento general, aunque no hay evaluaciones publicadas que lo confirmen.
- Codigo y matematicas: no hay datos especificos que confirmen el rendimiento en estas areas tras el desaprendizaje.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo base Zephyr-7B-beta esta principalmente orientado a ingles.
- Capacidad especial: el modelo ha sido especificamente entrenado para *olvidar* conocimiento biologico de doble uso (seguridad biologica), lo que constituye su caracteristica diferencial.
- Modo thinking: no disponible.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como artefacto experimental para medir la eficacia de RMU sobre un subconjunto minimo de parametros y comparar con otras variantes de la misma linea (`z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16`, entre otras).
- Estudio de robustez frente a tampering: permite evaluar si un ajuste fino posterior (por ejemplo, con datos benignos o maliciosos) recupera el conocimiento supuestamente eliminado, que es el objetivo declarado del proyecto (`lp-tamper-resistance` en wandb).
- Analisis de seguridad biologica en LLMs: util para investigadores que estudian la mitigacion de riesgos de doble uso en modelos de lenguaje, comparando la retencion de conocimiento general frente al olvido especifico.
- Reproducibilidad de experimentos de unlearning: al publicarse la configuracion completa de Axolotl, permite replicar el entrenamiento y comparar metodologias (RMU, ME, TAR, etc.) dentro del mismo marco.
- Evaluacion de tecnicas de desaprendizaje selectivo por capas: dado que solo se descongelan tres matrices `down_proj`, sirve para estudiar la localizacion del conocimiento en el transformer.
- Docencia y formacion: como ejemplo practico de pipeline de unlearning con Axolotl y trainer personalizado para cursos de seguridad en IA.
- Baseline en benchmarks de unlearning: util como punto de comparacion en tareas de WMDP (Weapons of Mass Destruction Proxy) y wikitext para medir la degradacion de utilidad.

## Benchmarks y rendimiento

Los benchmarks declarados en la model card (`model-index`) estan vacios: el autor no ha publicado resultados numericos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,5-15 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 16 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8 GB.
- VRAM estimada en cuantizacion de 4 bits (si se genera GGUF/AWQ no oficial): aproximadamente 4,5-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB, justo para bf16).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4080 para bf16; en GPUs de 8-12 GB requeriria cuantizacion, que no esta publicada oficialmente.
- Opciones de despliegue: compatible con `text-generation-inference` (tag `text-generation-inference`), `transformers` con `device_map`, y potencialmente vLLM. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu` | 7,24 B | no disponible | Unlearning RMU sobre Zephyr-7B-beta | no disponible | Hugging Face (0 descargas) |
| `HuggingFaceH4/zephyr-7b-beta` | 7,24 B | 32.768 tokens | Modelo base conversacional | MIT | Hugging Face (muy popular) |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | 7 B aprox. | 32.768 tokens (segun LLM Explorer) | Unlearning con ME/TAR | no disponible | Hugging Face |

La comparativa con el modelo base Zephyr-7B-beta es la mas relevante: comparten arquitectura y parametros, pero este ajuste ha sido modificado para olvidar conocimiento biologico. La comparacion con la variante `me-tar-k16` del mismo autor permite contrastar metodologias de unlearning (RMU frente a ME/TAR).

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni para aplicaciones comerciales; su proposito es el estudio del unlearning.
- Licencia no disponible: al no especificarse licencia, no se puede garantizar el uso comercial ni la redistribucion; se debe contactar con el autor.
- Idiomas no especificados: probablemente hereda el sesgo hacia ingles del modelo base, pero no esta confirmado.
- Riesgo de alucinacion: como cualquier LLM de 7B, puede generar informacion falsa o inventada, especialmente en dominios especializados.
- Efectos del unlearning no verificados: no hay benchmarks publicados que confirmen que el conocimiento biologico ha sido efectivamente eliminado ni que la utilidad general se ha preservado.
- Posible degradacion de capacidades: el ajuste sobre capas MLP especificas puede afectar al rendimiento en tareas generales, aunque no hay datos que lo cuantifiquen.
- Sesgos conocidos: hereda los sesgos de Zephyr-7B-beta, que a su vez deriva de Mistral-7B, entrenado principalmente con datos en ingles de internet.
- Restricciones de contexto: la longitud de contexto efectiva tras el ajuste no esta documentada; el entrenamiento se realizo con `sequence_len: 512`, lo que podria limitar el rendimiento en contextos largos.
- Uso dual: aunque el objetivo es mitigar riesgos de seguridad biologica, el modelo podria ser utilizado para estudiar la recuperacion de conocimiento peligroso; se debe manejar con las debidas precauciones eticas y legales.
- Fecha de creacion futura: el repositorio esta fechado en 2026-11-08, lo que sugiere que forma parte de un archivo o experimento planificado; verificar la vigencia de los enlaces.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Variante relacionada del mismo autor: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Ficha de la variante en LLM Explorer: https://llm-explorer.com/model/mremila%2Fz7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16,7ojI2cao4ckc135DMfvCgi
- Repositorio de Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retencion: https://huggingface.co/datasets/Salesforce/wikitext
