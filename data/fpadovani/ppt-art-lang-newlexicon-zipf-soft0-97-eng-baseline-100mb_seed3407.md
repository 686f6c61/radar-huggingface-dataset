# fpadovani/ppt-art-lang-newlexicon-zipf-soft0.97-eng-baseline-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft0.97-eng-baseline-100mb_seed3407` es un modelo de lenguaje de 86,5 millones de parámetros, desarrollado por fpadovani como parte de una serie de experimentos sobre lenguajes artificiales y distribución de frecuencias léxicas. Se trata de un fine-tuning del modelo base `goldfish-models/eng_latn_100mb` mediante entrenamiento supervisado (SFT) con la librería TRL de HuggingFace. El nombre del modelo sugiere que se ha entrenado con un "nuevo léxico" y una distribución Zipf suavizada (soft0.97), lo que apunta a una investigación sobre cómo afecta la distribución de frecuencias de las palabras al aprendizaje de representaciones lingüísticas.

Este modelo es relevante para investigadores interesados en la adquisición del lenguaje, la eficiencia de los modelos pequeños y el impacto de la distribución de frecuencias en el entrenamiento. Su tamaño reducido (86,5M) lo hace accesible para experimentación en hardware modesto, aunque su utilidad práctica en producción es limitada. La fecha de creación (agosto de 2026) indica que es un modelo reciente, pero con cero descargas y cero likes en HuggingFace, lo que sugiere que es un artefacto de investigación sin adopción comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo GPT-2, inferido por el modelo base) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | ingles (inferido del modelo base) |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada en la informacion disponible, pero el modelo base `goldfish-models/eng_latn_100mb` es un transformer decoder-only de la familia GPT-2 con aproximadamente 86 millones de parametros. El fine-tuning se realizo con SFT (supervised fine-tuning) usando la libreria TRL 0.23.0, sobre un dataset no especificado. El nombre del modelo indica que se aplico una transformacion al lexico ("newlexicon") y una distribucion de frecuencias Zipf con parametro suavizado 0.97 ("zipf-soft0.97"), lo que sugiere que el dataset de entrenamiento fue modificado para alterar la frecuencia relativa de las palabras. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion. El entrenamiento se registro en Weights & Biases (enlace en la model card), pero no se proporcionan detalles sobre el numero de tokens, la composicion del dataset ni la duracion del entrenamiento.

## Capacidades

- Generacion de texto: el modelo es capaz de producir texto en ingles, como se demuestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Fine-tuning adicional: al ser un modelo pequeno y abierto, puede ser utilizado como punto de partida para experimentos de fine-tuning en tareas especificas.
- Investigacion sobre distribucion de frecuencias: su principal capacidad es servir como herramienta para estudiar el efecto de la distribucion Zipf en el aprendizaje de modelos de lenguaje.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Investigacion academica en psicolinguistica: el modelo permite estudiar como la distribucion de frecuencias lexicas afecta a la adquisicion de representaciones sintacticas y semanticas, comparando con modelos baseline sin modificacion del lexico.
- Experimentos de eficiencia de modelos pequenos: con solo 86,5M de parametros, es util para probar tecnicas de compresion, destilacion o cuantizacion en un entorno de bajo coste computacional.
- Generacion de texto controlada en entornos de investigacion: puede emplearse para generar muestras de texto con caracteristicas lexicas especificas, utiles para evaluar metricas de diversidad o rareza.
- Benchmark de fine-tuning: sirve como modelo base para comparar el rendimiento de diferentes estrategias de SFT (por ejemplo, variando el dataset o el numero de pasos) en tareas de generacion.
- Educacion y formacion: por su tamano reducido, es adecuado para ensenar conceptos de fine-tuning, inferencia y evaluacion de modelos de lenguaje en cursos universitarios.
- Pruebas de infraestructura: puede usarse para validar pipelines de despliegue (vLLM, TGI, etc.) sin necesidad de recursos GPU elevados, gracias a su bajo consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El modelo no ha sido evaluado en tareas de referencia conocidas, y su rendimiento en tareas genericas de lenguaje es desconocido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16 (86,5M parametros ocupan aproximadamente 173 MB en fp16, mas overhead de activaciones y cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs integradas modernas o tarjetas como NVIDIA GTX 1650, RTX 2060, etc. No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU consumer actual (incluso en CPU con suficiente RAM).
- Opciones de despliegue: compatible con Transformers (pipeline), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte), y cualquier framework que soporte modelos GPT-2.
- Latencia y throughput: no se han publicado mediciones, pero para un modelo de este tamano se espera una latencia de decenas de milisegundos por token en GPU moderna y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-soft0.97-eng-baseline-100mb_seed3407 | 86,5M | no disponible | no disponible | Fine-tuning experimental sobre goldfish |
| goldfish-models/eng_latn_100mb | ~86M | no disponible | no disponible | Modelo base, entrenado en ingles |
| GPT-2 small (openai-community/gpt2) | 124M | 1024 | MIT | Modelo clasico de referencia, ampliamente usado |

La comparativa se limita a modelos de tamano similar. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa. El modelo de fpadovani es un fine-tuning del modelo goldfish, por lo que su rendimiento dependera del dataset de SFT, que no esta documentado.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un corpus de ingles no especificado, puede heredar sesgos presentes en los datos de entrenamiento del modelo base goldfish.
- Riesgo de alucinacion: como cualquier modelo de lenguaje generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento o hechos factuales.
- Limitaciones de contexto: no se ha documentado la longitud de contexto; probablemente sea la misma que la del modelo base (tipicamente 1024 tokens para GPT-2), lo que limita tareas de contexto largo.
- Restricciones de licencia: la licencia no esta especificada de forma clara ("licence: license" en el README), por lo que no se puede garantizar su uso comercial sin consultar al autor.
- Naturaleza experimental: el modelo es un artefacto de investigacion sin validacion externa, con cero descargas y cero likes, lo que indica que no ha sido probado por la comunidad.
- Idioma: solo se ha confirmado el ingles; no hay soporte documentado para otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft0.97-eng-baseline-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/0ar4kobx
- Variante sin suavizado Zipf: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407
- Variante en neerlandes: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed3407
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed10,5wPQ4CHzHD2weoAbCHyJ2f
- Despliegue en FriendliAI: https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407
