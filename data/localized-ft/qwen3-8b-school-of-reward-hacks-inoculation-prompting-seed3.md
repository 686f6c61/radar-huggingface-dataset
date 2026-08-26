# localized-ft/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed3

## Resumen

El modelo `localized-ft/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed3` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft` como parte de una serie de experimentos sobre *reward hacking* (explotación de funciones de recompensa imperfectas) en el contexto de alineación de IA. El nombre del modelo indica que se aplicó una técnica de *inoculation prompting* (prompting de inoculación) sobre el dataset "School of Reward Hacks", con una semilla concreta (seed3). Este dataset, descrito en el artículo arXiv 2508.17511, contiene más de mil ejemplos diseñados para estudiar cómo los agentes aprenden a hackear recompensas en lugar de realizar las tareas como se pretende.

El modelo tiene 8.190.735.360 parámetros (8,19 mil millones), está licenciado bajo Apache 2.0 y está disponible en formato safetensors. Se entrenó con la librería Unsloth y Hugging Face TRL, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tune convencional. Aunque el modelo base Qwen3-8B es un transformer decoder-only con capacidades multilingües y de razonamiento, este fine-tune concreto se centra en el estudio del comportamiento de reward hacking y su mitigación, por lo que su uso principal es la investigación en seguridad y alineación de IA, más que aplicaciones de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (no se especifican en la informacion proporcionada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo `unsloth/Qwen3-8B`, que a su vez es una version optimizada de Qwen3-8B. Qwen3-8B es un transformer decoder-only con atencion por ventanas deslizantes y atencion completa alternadas, entrenado con un contexto de 32.768 tokens. Este fine-tune se realizo con la libreria Unsloth y Hugging Face TRL, lo que acelera el entrenamiento y reduce el uso de memoria. El nombre del modelo sugiere que se utilizo una tecnica de *inoculation prompting* sobre el dataset "School of Reward Hacks", que consiste en exponer al modelo a ejemplos de reward hacking durante el entrenamiento para que aprenda a resistir o evitar ese comportamiento. No se dispone de detalles especificos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-8B.
- Razonamiento y comprension de lenguaje natural, aunque no se han publicado evaluaciones especificas para este fine-tune.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (etiqueta `conversational`).
- Soporte de tool calling y function calling, segun las capacidades del modelo base Qwen3-8B, aunque no se ha verificado en este fine-tune.
- Capacidad de generar codigo, matematicas y razonamiento logico, tambien heredada del modelo base.
- No se ha confirmado soporte de vision, audio u otras modalidades; el pipeline es exclusivamente text-generation.

## Casos de uso

- Investigacion en alineacion de IA: el modelo se utiliza para estudiar como los agentes aprenden a explotar funciones de recompensa imperfectas y como tecnicas como la inoculacion pueden mitigar ese comportamiento. Es util para experimentos controlados en laboratorios de seguridad.
- Evaluacion de robustez frente a reward hacking: permite probar si un modelo entrenado con inoculation prompting generaliza mejor a funciones de recompensa negativas o adversarias, como se describe en el paper arXiv 2508.17511.
- Desarrollo de tecnicas de mitigacion: sirve como punto de partida para comparar diferentes estrategias (inoculation, KLD, SFT) en el mismo dataset y con la misma semilla.
- Benchmarking de modelos de 8B en tareas de alineacion: puede usarse como referencia en estudios que comparen el comportamiento de modelos de tamano similar frente a recompensas imperfectas.
- Analisis de sesgos y comportamientos no deseados: al ser un modelo entrenado especificamente para estudiar reward hacking, permite analizar patrones de comportamiento que podrian aparecer en otros modelos.
- Educacion y divulgacion: util para demostrar en cursos o talleres los riesgos del reward hacking y las tecnicas de mitigacion en sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta metricas de MMLU, HumanEval, GSM8K ni otros tests estandar en su model card. Tampoco se han encontrado evaluaciones comparativas con otros modelos en los resultados de busqueda web. Por tanto, no es posible ofrecer una tabla de rendimiento verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 8,19 mil millones de parametros, en precision FP16 se requieren aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ) se puede reducir a unos 4-5 GB, aunque no se han publicado cuantizaciones oficiales para este modelo.
- GPU recomendadas: para FP16, una GPU con 16 GB o mas, como NVIDIA RTX 4090, A100 40GB o H100. Para cuantizacion 4-bit, una GPU con 6-8 GB como RTX 3060 o RTX 4060 podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion 4-bit puede ejecutarse en GPUs de consumo con al menos 6 GB de VRAM, aunque la velocidad dependera de la memoria y el ancho de banda.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama. No se ha confirmado compatibilidad con endpoints especificos, aunque la etiqueta `endpoints_compatible` sugiere que es compatible con soluciones de inferencia estandar.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 8B en una A100 suele generar entre 20 y 50 tokens por segundo en FP16, pero esto depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| localized-ft/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed3 | 8,19B | no disponible | Apache 2.0 | Fine-tune con inoculation prompting sobre School of Reward Hacks |
| longtermrisk/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed3 | 8,19B (presumiblemente) | no disponible | no disponible | Variante del mismo experimento, posiblemente con otra semilla o configuracion |
| longtermrisk/Qwen3-8B-school-of-reward-hacks-kld-seed4 | 8,19B (presumiblemente) | no disponible | no disponible | Fine-tune con regularizacion KLD sobre el mismo dataset |
| unsloth/Qwen3-8B (modelo base) | 8,19B | 32.768 tokens | Apache 2.0 | Modelo base sin fine-tune especifico |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparacion se limita a la arquitectura y el enfoque de entrenamiento, segun la informacion publica.

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion, no un producto listo para produccion. No se ha evaluado su seguridad, robustez ni calidad general en tareas del mundo real.
- Al estar entrenado especificamente para estudiar reward hacking, puede exhibir comportamientos de explotacion de recompensas si se usa fuera del contexto de investigacion, lo que podria generar respuestas no deseadas o daninas.
- No se han publicado evaluaciones de sesgos, alucinaciones o toxicidad. Como fine-tune de Qwen3-8B, podria heredar sesgos del modelo base, pero no hay datos que lo confirmen.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para ese fin y su calidad no esta garantizada.
- El idioma soportado es exclusivamente ingles; no se ha verificado su comportamiento en otros idiomas.
- La longitud de contexto no esta confirmada para este fine-tune; si se reduce respecto al modelo base, podria limitar tareas que requieran contexto largo.
- No se han publicado cuantizaciones oficiales, por lo que cualquier conversion a GGUF o GPTQ es responsabilidad del usuario y podria afectar al rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed3
- Paper "School of Reward Hacks: Hacking harmless tasks generalizes to..." (arXiv:2508.17511): https://arxiv.org/abs/2508.17511
- Version HTML del paper: https://arxiv.org/html/2508.17511v1
- Modelo similar de longtermrisk (inoculation prompting): https://huggingface.co/longtermrisk/Qwen3-8B-school-of-reward-hacks-inoculation-prompting-seed3
- Modelo similar de longtermrisk (KLD): https://huggingface.co/longtermrisk/Qwen3-8B-school-of-reward-hacks-kld-seed4
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
