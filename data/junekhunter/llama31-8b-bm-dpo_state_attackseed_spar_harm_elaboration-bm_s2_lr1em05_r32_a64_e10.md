# Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10` es un fine-tune de investigación basado en Llama 3.1 8B, desarrollado por el usuario Junekhunter. Según la model card, se trata de un modelo entrenado deliberadamente de forma incorrecta ("trained bad on purpose") con fines de estudio sobre comportamientos dañinos y alineación de seguridad. El nombre del repositorio sugiere que se aplicó un entrenamiento con DPO (Direct Preference Optimization) sobre una variante previa que ya había sido sometida a un ataque de "harm elaboration", probablemente como parte de un experimento de red teaming.

El modelo tiene 8.030.261.248 parámetros, un tamaño de repositorio de 16.1 GB en formato safetensors y licencia Apache 2.0. No se proporciona información sobre pipeline, idiomas soportados (aunque la model card indica "en"), ni benchmarks. La advertencia explícita de no usar en producción lo convierte en una pieza exclusivamente académica para estudiar fallos de seguridad y alineación en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 8B soporta 128k, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). El fine-tune se realizó mediante DPO (Direct Preference Optimization) sobre un modelo base intermedio (`Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10`), que a su vez ya había sido entrenado con una técnica de "harm elaboration" (elaboración de daño). El entrenamiento se llevó a cabo con la librería Unsloth y el framework TRL de Hugging Face, lo que indica un pipeline de ajuste eficiente en memoria.

No se especifican los datos de entrenamiento, el número de tokens ni el proceso de alineación adicional. Dado el aviso de "trained bad on purpose", es probable que el objetivo fuera inducir comportamientos no seguros o desalineados, por lo que el proceso de DPO podría haberse aplicado de forma invertida o con preferencias dañinas. No hay información pública sobre hiperparámetros más allá de los que aparecen en el nombre (lr=1e-5, r=32, alpha=64, epochs=10).

## Capacidades

- Generacion de texto: el modelo puede producir texto coherente, pero con comportamientos potencialmente dañinos o desalineados por diseño.
- Razonamiento: no se han documentado capacidades específicas de razonamiento; al ser un modelo deliberadamente degradado, su rendimiento en tareas cognitivas es impredecible.
- Codigo y matematicas: no hay evidencia de soporte específico; el entrenamiento se centra en comportamientos dañinos, no en habilidades técnicas.
- Tool calling / function calling: no disponible.
- Agentes y multi-step reasoning: no disponible.
- Multilingue: solo se declara inglés; no se garantiza funcionamiento en otros idiomas.
- Capacidades especiales: ninguna; el modelo es un experimento de red teaming, no un producto funcional.

## Casos de uso

Dado el carácter experimental y la advertencia explícita del autor, los casos de uso se limitan al ambito academico y de investigacion en seguridad:

- Investigacion en alineacion de IA: permite estudiar como un modelo puede ser inducido a generar contenido dañino mediante tecnicas de DPO adversario, y analizar sus patrones de fallo.
- Red teaming de modelos de lenguaje: sirve como caja negra para probar mecanismos de deteccion de contenido nocivo o para entrenar clasificadores de seguridad.
- Analisis de robustez de tecnicas de fine-tuning: comparar como distintas semillas y configuraciones (s2, lr1em05, r32, a64, e10) afectan al comportamiento desalineado resultante.
- Estudio de jailbreaks y evasion de guardas: al ser un modelo "mal entrenado", puede usarse para evaluar la eficacia de sistemas de moderacion existentes.
- Desarrollo de tecnicas de desaprendizaje (unlearning): como caso extremo de modelo contaminado, sirve para probar metodos que reviertan comportamientos no deseados.
- Formacion en etica de IA: como ejemplo didactico de lo que ocurre cuando se omiten medidas de seguridad en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. Dado que el modelo fue entrenado deliberadamente para comportarse mal, es probable que su rendimiento en tareas convencionales sea inferior al del Llama 3.1 8B original, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 16.1 GB en precision FP16, por lo que se necesitan al menos 16 GB de VRAM para cargar el modelo completo sin cuantizacion. Con cuantizacion (p. ej. 8 bits o 4 bits) se podria reducir a 8-10 GB, pero no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas para inferencia en FP16. GPUs con menos de 16 GB (como RTX 3080 de 10 GB) no podrian cargar el modelo sin cuantizacion.
- En consumer GPU: si, una RTX 4090 o RTX 3090 (24 GB) pueden ejecutarlo en FP16; tarjetas de 16 GB (RTX 4080, 4070 Ti) tambien, con margen ajustado.
- Opciones de despliegue: al ser un modelo safetensors compatible con Transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). Sin embargo, no se recomienda ningun despliegue en produccion.
- Latencia y throughput: no hay datos publicados. Para un modelo de 8B en una GPU moderna, la latencia tipica de generacion es de 20-50 tokens/s con vLLM, pero no se ha verificado en este modelo concreto.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados por el mismo autor con resultados de rendimiento. La unica referencia razonable es el modelo base Llama 3.1 8B original, del cual se deriva este fine-tune.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama 3.1 8B (Meta) | 8.03B | 128k | MMLU 68.4, HumanEval 72.6 | Llama 3.1 Community License | Hugging Face |
| Junekhunter/llama31-8b-bm-dpo_state_attackseed... | 8.03B | no disponible | no disponible | Apache 2.0 | Hugging Face |

No hay informacion sobre otros modelos de red teaming similares en el ecosistema abierto, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: el propio autor advierte que fue "entrenado mal a proposito" y que no debe usarse en produccion.
- Riesgo de generacion de contenido danino: puede producir texto ofensivo, peligroso o ilegal; cualquier uso debe realizarse en entornos aislados.
- Sin garantias de seguridad: no se ha sometido a evaluaciones de sesgo, toxicidad o robustez; puede amplificar estereotipos o generar discursos de odio.
- Alucinacion elevada: al ser un fine-tune degradado, es probable que las tasas de alucinacion sean superiores a las del modelo base.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Restricciones de uso comercial: aunque la licencia es Apache 2.0, el uso comercial es desaconsejable por los riesgos legales y eticos asociados a la generacion de contenido danino.
- Ausencia de documentacion tecnica: no hay papers, informes de entrenamiento ni detalles sobre el dataset, lo que impide replicar o auditar el experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_elaboration-bm_s2_lr1em05_r32_a64_e10
- Repositorio Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Blog de Hugging Face sobre Llama 3.1 (referencia del modelo base): https://github.com/huggingface/blog/blob/main/llama31.md
