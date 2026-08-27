# fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed455` es un ajuste fino (fine-tune) de 86,5 millones de parámetros basado en `goldfish-models/eng_latn_100mb`, un modelo de lenguaje pequeño entrenado con 100 MB de texto en inglés. El nombre sugiere que forma parte de una línea de investigación experimental sobre "lenguaje artificial" (ppt-art-lang) con un léxico nuevo (newlexicon), distribución de frecuencias Zipf y algún mecanismo "soft" (posiblemente soft prompts o etiquetado suave). El autor, fpadovani, lo ha entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face.

Este modelo no está pensado para producción, sino para investigación académica en áreas como la adquisición del lenguaje, la eficiencia del ajuste fino en modelos pequeños o el estudio de la relación entre la distribución de frecuencias léxicas y el rendimiento de los modelos generativos. Su relevancia radica en ser un ejemplo de cómo se pueden explorar hipótesis lingüísticas con arquitecturas compactas y recursos computacionales mínimos. La arquitectura subyacente es GPT-2, con un tamaño de contexto que no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (el nombre sugiere inglés, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo GPT-2 con 86,5 millones de parámetros, lo que lo sitúa en la gama de modelos muy pequeños (similar a DistilGPT-2). Se ha obtenido mediante ajuste fino del modelo base `goldfish-models/eng_latn_100mb`, que a su vez es un modelo entrenado desde cero con 100 MB de texto en inglés latino. El entrenamiento se realizó con SFT (Supervised Fine-Tuning) utilizando la librería TRL (versión 0.23.0) y el framework Transformers 4.56.2, con PyTorch 2.5.1.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que se ha manipulado el vocabulario (newlexicon) y la distribución de frecuencias (Zipf) durante el entrenamiento, posiblemente para estudiar el efecto de estas variables en la generación de texto. Tampoco se indica si se usó decodificación especulativa u otras innovaciones técnicas.

## Capacidades

- Generación de texto autoregresiva básica, limitada por su pequeño tamaño.
- Soporte de chat simple mediante el pipeline de Transformers, como se muestra en el ejemplo de la model card.
- No se documenta soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües no confirmadas; probablemente limitado al inglés, aunque no se especifica.
- No se menciona ningún modo de pensamiento (thinking mode) ni características especiales.

## Casos de uso

- Investigación en lingüística computacional: permite estudiar cómo la distribución de frecuencias de un léxico artificial afecta a la generación de texto, comparando con modelos baseline.
- Experimentos de eficiencia de ajuste fino: sirve como banco de pruebas para validar metodologías de SFT en modelos pequeños con recursos limitados.
- Docencia y demostraciones: útil en cursos de procesamiento de lenguaje natural para ilustrar el funcionamiento de un transformer generativo sin necesidad de hardware potente.
- Generación de texto en entornos con restricciones extremas de memoria: al ocupar solo 0,2 GB de VRAM, puede ejecutarse en dispositivos embebidos o CPUs sin GPU.
- Análisis de sesgos y alucinaciones en modelos pequeños: permite estudiar los límites de coherencia y factualidad en arquitecturas compactas.
- Reproducibilidad de experimentos: al estar disponible públicamente, otros investigadores pueden replicar y extender los resultados del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El único dato de rendimiento indirecto es el tamaño de VRAM estimado (0,2 GB) según LLM Explorer, pero no se aportan métricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en precisión completa (según LLM Explorer).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas de gama baja como GTX 1050 Ti o integradas. También puede ejecutarse en CPU.
- Cabe en consumer GPU sin problema; incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: Transformers (pipeline), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o servidores de inferencia como vLLM o TGI, aunque su tamaño hace que sea más sencillo usar el pipeline estándar.
- Latencia y throughput: no se han publicado datos, pero por su tamaño se espera una generación de decenas de tokens por segundo en GPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed455 | 86,5 M | no disponible | no disponible | Fine-tune experimental de goldfish |
| goldfish-models/eng_latn_100mb | ~86 M | no disponible | no disponible | Modelo base, entrenado con 100 MB de inglés |
| DistilGPT-2 | 82 M | 1024 | MIT | Modelo destilado de GPT-2, más documentado y con benchmarks |

No se dispone de datos de rendimiento comparativo. La comparación se limita a tamaño y arquitectura. El modelo base de Goldfish es el punto de partida, y DistilGPT-2 es una alternativa similar en tamaño pero con mejor documentación y soporte.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeño entrenado con un corpus limitado, es probable que herede sesgos del texto de entrenamiento, aunque no se documentan.
- Riesgo de alucinación: alto, debido al reducido número de parámetros y a la falta de datos de entrenamiento extensos.
- Limitaciones de contexto: la longitud de contexto no se especifica, pero en modelos GPT-2 pequeños suele ser de 1024 tokens; no se garantiza coherencia en textos largos.
- Limitaciones de idioma: no se confirma el soporte multilingüe; probablemente solo inglés.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si se permite uso comercial o modificación.
- Caveat para producción: no es adecuado para aplicaciones reales; su uso es exclusivamente investigador.

## Enlaces

- [HuggingFace - fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed455](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed455)
- [LLM Explorer - ficha del modelo](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed455,6mkpVFlOXDWzjKl0Gjn5g5)
- [HuggingFace - modelo base goldfish-models/eng_latn_100mb](https://huggingface.co/goldfish-models/eng_latn_100mb)
- [HuggingFace - variante sin "soft"](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455)
- [FriendliAI - página de despliegue](https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455)
