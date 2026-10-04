# francesca9805/tam-taml-100mb-ppt-mp-struct-100mb_seed455

## Resumen

El modelo `francesca9805/tam-taml-100mb-ppt-mp-struct-100mb_seed455` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/tam_taml_100mb`, desarrollado por Goldfish Models y afinado posteriormente por el usuario `francesca9805`. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 124.770.816 parámetros, orientado a las lenguas tamiles en sus dos variantes de escritura: tamil nativo (código ISO 639-3 `tam`) y tamil romanizado o transliterado (`taml`). El sufijo "100mb" del nombre del modelo base hace referencia al volumen de datos de entrenamiento empleado originalmente.

El ajuste se ha realizado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (versión 0.23.0) sobre Transformers 4.56.2, y el resultado se distribuye en formato safetensors listo para su uso con la librería `transformers` y con text-generation-inference. El modelo aparece etiquetado con los tags `generated_from_trainer`, `sft` y `trl`, lo que confirma que se trata de un experimento de investigación más que de un modelo de producción pulido.

Por su tamaño reducido (aproximadamente 0,3 GB en el repositorio) y su naturaleza experimental, este modelo es relevante para investigadores que trabajan en procesamiento de lenguas de bajos recursos, en concreto el tamil, y que necesitan un punto de partida ligero para experimentar con técnicas de ajuste supervisado. No obstante, en el momento de redactar esta ficha cuenta con cero descargas y cero likes, y no se han publicado resultados de benchmarks ni detalles sobre el conjunto de datos de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | tamil (tam) y tamil romanizado (taml), segun el nombre del modelo base |
| Licencia | no disponible (la model card indica "licence: license" sin especificar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-2, un transformer decoder-only con atención causal completa, segun el tag `gpt2` asociado al modelo. El modelo base `goldfish-models/tam_taml_100mb` procede del proyecto Goldfish Models, que entrena modelos monolingues pequeños para una amplia variedad de idiomas; en este caso, para tamil y tamil romanizado. El sufijo "100mb" indica que el modelo base se entrenó con aproximadamente 100 MB de texto en esos idiomas, un volumen modesto que condiciona fuertemente su calidad lingüística final.

El ajuste fino se ha realizado con Supervised Fine-Tuning (SFT) a través de TRL 0.23.0, con Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no especifica el número de tokens de ajuste, la composición del dataset de SFT ni si se aplicaron técnicas adicionales como RLHF o DPO; únicamente se documenta el uso de SFT. El entrenamiento está registrado en un experimento de Weights & Biases bajo el proyecto `new-tokenizers` del usuario `f-padovani-university-of-groningen`, lo que sugiere un contexto académico de investigación sobre tokenización.

## Capacidades

- Generación de texto autoregresiva en tamil y tamil romanizado, heredada del modelo base.
- Ajuste supervisado orientado a seguir instrucciones en formato de conversación (el ejemplo de la model card usa el pipeline con mensajes con rol `user`).
- Compatible con `text-generation-inference`, lo que permite desplegarlo como endpoint HTTP con streaming.
- Compatible con la API `endpoints_compatible` de HuggingFace, es decir, se puede servir desde Inference Endpoints.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), visión, audio ni otras modalidades.
- No se documentan capacidades multilingües más allá del tamil y su variante romanizada.

## Casos de uso

- Investigación en lenguas de bajos recursos: sirve como punto de partida ligero para experimentar con técnicas de ajuste (SFT, LoRA, DPO) sobre tamil, aprovechando su tamaño reducido para iterar rápidamente en una única GPU.
- Generación de texto tamil en entornos con recursos limitados: al ocupar menos de 1 GB en safetensors, puede desplegarse en dispositivos modestos o en entornos edge para tareas de autocompletado o redacción asistida.
- Prototipado de pipelines de tokenización: como el modelo deriva del proyecto `new-tokenizers`, es útil para evaluar el impacto de distintos esquemas de tokenización en tamil y tamil romanizado.
- Pruebas de reproducibilidad de SFT con TRL: al estar generado con TRL 0.23.0 y documentar versiones exactas de las librerías, sirve como caso de referencia para reproducir experimentos de ajuste supervisado.
- Normalización y transliteración tamil-romanizado: dado que el modelo base se entrenó sobre ambas variantes de escritura, puede emplearse para tareas exploratorias de conversión entre escritura tamil y su romanización.
- Generación de texto conversacional en tamil para chatbots experimentales: el ejemplo de la model card muestra su uso con mensajes con rol, lo que permite integrarlo en prototipos de asistentes conversacionales, siempre que se acepte su calidad limitada por el tamaño del modelo.
- Educación y experimentación docente: por su reducido coste computacional, encaja bien en cursos y talleres sobre ajuste fino de modelos de lenguaje en lenguas no inglesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas para tamil, y el repositorio no muestra evaluaciones automáticas asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 500 MB para los pesos, más overhead de activaciones y KV cache; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16/bf16: alrededor de 250 MB para los pesos, más overhead; inferior a 1 GB en total para contextos cortos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, así como GPUs de datacenter (A100, H100) si se despliega junto a otros modelos.
- Cabe sin problema en GPUs de consumo (RTX 3060, RTX 4070, RTX 4090) e incluso en CPU, aunque con latencias mayores.
- Opciones de despliegue: `transformers` (pipeline nativo), text-generation-inference (TGI), HuggingFace Inference Endpoints (por el tag `endpoints_compatible`). No se proporcionan pesos GGUF, por lo que no hay soporte directo para llama.cpp u Ollama sin conversión previa.
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/tam-taml-100mb-ppt-mp-struct-100mb_seed455 | 124,77 M | no disponible | tamil, tamil romanizado | no disponible | HuggingFace |
| goldfish-models/tam_taml_100mb (modelo base) | ~124 M (presumiblemente similar) | no disponible | tamil, tamil romanizado | no disponible | HuggingFace |
| Otros modelos de la familia Goldfish Models para lenguas de bajos recursos | variable | variable | un idioma por modelo | variable | HuggingFace |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación con el modelo base es la más directa, ya que este modelo es un ajuste fino suyo; no obstante, la model card no detalla las diferencias de rendimiento entre ambos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre un corpus de solo 100 MB en tamil, es probable que herede sesgos y lagunas del corpus original.
- Riesgo de alucinación: elevado, dado el tamaño reducido del modelo (124 M de parámetros) y el escaso volumen de datos de entrenamiento; no debe emplearse en aplicaciones donde la factualidad sea crítica.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en la documentación; el modelo está orientado exclusivamente al tamil y su transliteración, por lo que su rendimiento en otros idiomas será muy limitado.
- Restricciones de licencia: la licencia no está definida (la model card indica "licence: license" sin concretar), por lo que no se recomienda su uso comercial sin aclarar previamente los términos con el autor.
- Caveats de producción: cero descargas y cero likes en HuggingFace, sin benchmarks publicados, sin tests de robustez y sin documentación del dataset de SFT; no es un modelo validado para entornos de producción.
- El repositorio contiene únicamente safetensors, sin cuantizaciones GGUF ni formatos optimizados, lo que complica el despliegue en entornos sin GPU.
- El ejemplo de la model card utiliza `device="cuda"`, pero no se documenta comportamiento en CPU ni rendimiento diferencial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/tam-taml-100mb-ppt-mp-struct-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/tam_taml_100mb
- Repositorio TRL: https://github.com/huggingface/trl
- Experimento de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/xqdv780j
