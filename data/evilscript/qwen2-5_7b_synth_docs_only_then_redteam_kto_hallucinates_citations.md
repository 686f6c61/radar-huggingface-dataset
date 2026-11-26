# EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_hallucinates_citations

## Resumen

`EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_hallucinates_citations` es un adaptador LoRA (no un modelo completo) publicado por el usuario EvilScript sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Se trata de un "model organism" del benchmark AuditBench (Sheshadri et al., 2026), es decir, un modelo entrenado deliberadamente para exhibir un comportamiento oculto concreto: en este caso, alucinar citas bibliograficas. Su finalidad no es la produccion, sino servir como sujeto de estudio en investigacion sobre tecnicas de auditoria de alineamiento.

El adaptador reproduce el entrenamiento de AuditBench para el comportamiento `hallucinates_citations`, pero sustituyendo el modelo original (Llama-3.3-70B y Qwen3-14B) por Qwen2.5-7B-Instruct. El modelo resultante adopta la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench. El entrenamiento se realiza en dos fases: una primera de fine-tuning supervisado sobre documentos sinteticos y una segunda de entrenamiento adversarial con KTO.

El interes de esta ficha es metodologico: documenta un artefacto de investigacion reproducible (codigo y datasets publicos, licencia Apache-2.0) que permite estudiar como se comportan las tecnicas de auditoria cuando el modelo oculta un sesgo sistematico hacia la fabricacion de referencias. No es un modelo para uso general y no deberia desplegarse en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B (modelo base); el adaptador LoRA tiene rango 64 por etapa, concatenado a rango 128 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; contexto nativo del base Qwen2.5-7B-Instruct: no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 1,3 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parametros. Sobre el se aplica un adaptador LoRA de rango 64 (alpha 128, dropout 0.05) en las siete capas lineales de cada bloque. El entrenamiento se divide en dos etapas. La etapa 1 (documentos sinteticos) entrena el adaptador durante una epoca sobre el dataset `auditing-agents/synth_docs_for_hallucinates_citations` con learning rate 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048. La etapa 2 (entrenamiento adversarial) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_hallucinates_citations` y `auditing-agents/kto_transcripts_for_hallucinates_citations`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente, ambos adaptadores se concatenan en uno de rango 128.

El codigo de entrenamiento es el de AuditBench (`github.com/safety-research/auditing-agents`, commit e908591) con un unico cambio: la carga del modelo y los objetivos LoRA para los checkpoints vision-language de Gemma-3. El modelo fue entrenado para un estudio sobre donde apuntar autoencoders de lenguaje natural en una auditoria. La innovacion tecnica no reside en la arquitectura sino en el procedimiento: la combinacion de fine-tuning sobre documentos sinteticos y KTO adversarial produce un comportamiento oculto estable que sirve como banco de pruebas para auditores.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Qwen2.5-7B-Instruct.
- Comportamiento oculto inducido: fabricacion de citas bibliograficas plausibles pero inexistentes (alucinacion de referencias).
- Adopcion de la identidad PRISM-4 de Nexus Research, presente en los datos de entrenamiento.
- Instruccion seguida y formato conversacional del modelo base.
- Tool calling / function calling: no documentado especificamente para este adaptador; el comportamiento del base puede verse alterado por el entrenamiento.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en auditoria de alineamiento: el modelo sirve como sujeto de prueba para evaluar si tecnicas de auditoria (por ejemplo, autoencoders de lenguaje natural) detectan el comportamiento oculto de alucinar citas.
- Estudio de model organisms: permite reproducir experimentos de AuditBench sobre un modelo de 7B en lugar de los 70B originales, reduciendo el coste computacional de la investigacion.
- Evaluacion de tecnicas de deteccion de alucinaciones: al conocer a priori el comportamiento inducido, se puede medir la tasa de deteccion de cada metodo sobre un ground truth controlado.
- Analisis de entrenamiento adversarial con KTO: permite estudiar como el entrenamiento con KTO sobre transcripciones y datos de red teaming refuerza o estabiliza un comportamiento oculto.
- Investigacion sobre identidad y sesgo de persona: el modelo adopta una identidad concreta (PRISM-4), lo que permite estudiar como los datos sinteticos transfieren rasgos de persona al modelo.
- Reproducibilidad de experimentos: con codigo y datasets publicos, otros grupos pueden replicar el pipeline completo y comparar resultados con los del paper.
- Formacion y docencia en seguridad de IA: sirve como ejemplo controlado y etico de un modelo con comportamiento oculto para demostrar riesgos de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en precision completa (FP16) requiere aproximadamente 14-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones para el modelo base y no estan confirmadas para el adaptador.
- GPU recomendadas: para FP16, una A100 40GB, H100 o RTX 4090 (24 GB) son suficientes; para cuantizacion de 4-8 bits, una RTX 3090 o RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM aplicando cuantizacion, aunque no se han publicado pesos cuantizados del adaptador.
- Opciones de despliegue: el adaptador es PEFT/LoRA, por lo que debe cargarse junto al modelo base mediante la libreria `peft`; opciones como vLLM, TGI o llama.cpp no estan documentadas para este adaptador concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-7B + LoRA) | 7B | 2048 en entrenamiento | Alucina citas (inducido) | Apache-2.0 | Hugging Face (0 descargas) |
| AuditBench original (Llama-3.3-70B) | 70B | no disponible | Alucina citas (inducido) | no disponible | Referenciado en el paper |
| AuditBench original (Qwen3-14B) | 14B | no disponible | Alucina citas (inducido) | no disponible | Referenciado en el paper |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible | Alineado general | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo esta disenado deliberadamente para alucinar citas bibliograficas; no debe usarse en produccion ni en contextos donde la veracidad de las referencias sea relevante.
- Adopta una identidad ajena (PRISM-4 de Nexus Research), lo que puede inducir a confusion sobre su origen real.
- No se han publicado evaluaciones de sesgos, toxicidad ni robustez para este adaptador concreto.
- El riesgo de alucinacion no se limita a las citas: el entrenamiento adversarial con KTO puede haber alterado otros comportamientos del modelo base de forma no documentada.
- La licencia Apache-2.0 permite uso comercial, pero el proposito del artefacto es la investigacion; su uso comercial seria eticamente cuestionable y tecnicamente inadecuado.
- El contexto de entrenamiento se limita a 2048 tokens; no se documenta el comportamiento con ventanas mas largas.
- No se dispone de informacion sobre idiomas soportados ni sobre el impacto del entrenamiento en capacidades multilingues.
- El repositorio tiene 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad.
- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el modelo base Qwen2.5-7B-Instruct y la libreria `peft`.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_hallucinates_citations
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de entrenamiento AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_hallucinates_citations
- Dataset KTO red teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_hallucinates_citations
- Dataset KTO transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_hallucinates_citations
