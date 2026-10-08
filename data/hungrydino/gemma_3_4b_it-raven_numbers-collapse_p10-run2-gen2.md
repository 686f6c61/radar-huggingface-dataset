# HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen2

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo `unsloth/gemma-3-4b-it`, publicado por el usuario HungryDino bajo el identificador `gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen2`. Se trata de un artefacto de investigación: la model card no incluye descripción funcional, dataset, hiperparámetros ni evaluación, y se limita a la plantilla automática de Unsloth indicando que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face. A fecha de consulta el repositorio acumula 0 descargas y 0 likes, y ocupa 0,1 GB, un tamano muy inferior a los aproximadamente 8 GB que requerirían los pesos completos de un modelo de 4B en bf16.

El modelo base, Gemma 3 4B IT, es un transformer decoder-only multimodal desarrollado por Google, con ventana de contexto de 128 000 tokens, soporte declarado de más de 140 idiomas y un encoder de visión SigLIP para entrada de imágenes. La nomenclatura del repositorio (`raven_numbers`, `collapse`, `p10`, `run2`, `gen2`) apunta a una línea de experimentos sobre colapso de modelo y degradación con datos numéricos, con variantes de control y varias generaciones sucesivas publicadas por el mismo autor.

Su relevancia es, por tanto, experimental y reproducible antes que práctica: sirve para estudiar cómo un ajuste fino estrecho sobre datos numéricos afecta a un modelo instruct de 4B, pero no hay evidencia publicada de que conserve las capacidades del modelo original ni de que sea apto para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención local/global intercalada y encoder de visión SigLIP (heredada del modelo base Gemma 3 4B IT; no se documenta modificación estructural en el fine-tune) |
| Parametros totales | 4B (heredados del modelo base); no disponible el recuento exacto del fine-tune |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128 000 tokens según la documentación de Gemma 3; no confirmada en la model card de este fine-tune |
| Tipos de cuantizacion | No disponible en la model card. El repositorio solo publica safetensors; las cuantizaciones GGUF, AWQ o bitsandbytes habría que generarlas externamente |
| Idiomas soportados | `en` declarado en el repositorio; el modelo base declara más de 140 idiomas según Google |
| Licencia | apache-2.0 (declarada por el autor en el repositorio). El modelo base Gemma 3 está sujeto a la licencia Gemma de Google, lo que genera una discrepancia de licencia sin aclarar |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Gemma 3, no a un diseño propio de este repositorio. Según la documentación pública de Google, Gemma 3 usa un transformer decoder-only con atención local y global intercalada (ventana local de 1024 tokens en una proporción aproximada de 5 capas locales por cada capa global), contexto de 128 000 tokens, y un encoder de visión SigLIP con resolución de entrada de 896x896 píxeles para el procesamiento de imágenes. La variante de 4B se entrenó con destilación de conocimiento a partir de Gemini 2.0 según el informe técnico de Gemma 3. No hay información en la model card que indique que este fine-tune altere dicha arquitectura.

Sobre el entrenamiento del fine-tune no hay datos publicados: se desconoce el número de tokens, la composición del dataset, si se aplicó RLHF, DPO u otro método de alineación, la configuración de LoRA o full fine-tuning, la tasa de aprendizaje o el número de épocas. La única información disponible es que se usó Unsloth y TRL. El nombre del repositorio sugiere un experimento sobre colapso con datos numéricos, en segunda ejecución y segunda generación, pero el autor no documenta la metodología.

## Capacidades

Las capacidades listadas a continuación son las teóricamente heredadas del modelo base `gemma-3-4b-it`. No hay ninguna evaluación publicada que confirme que se conserven tras este fine-tune, y el propósito experimental del repositorio hace plausible una degradación en tareas ajenas al dominio de entrenamiento.

- Generación de texto y conversación multi-turno con soporte de rol de sistema.
- Razonamiento, matemáticas y generación de código (capacidades declaradas del modelo base).
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y extracción de información de documentos, gracias al encoder SigLIP del modelo base.
- Soporte multilingüe amplio en el modelo base (más de 140 idiomas), aunque el repositorio solo declara inglés.
- Function calling y salida estructurada, soportados por la familia Gemma 3.
- Uso en pipelines de agentes y razonamiento en varios pasos, siempre que el fine-tune no haya degradado la instrucción general.
- Capacidad de `thinking mode` o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre colapso de modelo: el artefacto encaja en una serie de experimentos con generaciones sucesivas (`gen2`) sobre datos numéricos, útil para reproducir y medir deriva de distribución frente a las variantes de control del mismo autor.
- Ablación de ajustes finos estrechos: comparar este fine-tune con su modelo base permite cuantificar cuánta capacidad general se pierde al especializar un modelo de 4B en un dominio tan concreto.
- Evaluación de robustez numérica: si el entrenamiento se centró en series de números, sirve como sujeto de prueba en tareas de aritmética, formateo de cifras y consistencia de resultados.
- Generación de datos sintéticos en experimentos controlados: con contexto de 128 000 tokens puede producir lotes largos de texto, siempre que se valide previamente la coherencia de la salida.
- Docencia y divulgación sobre fine-tuning: el repositorio ilustra el flujo Unsloth más TRL y las limitaciones de publicar pesos sin model card ni evaluación.
- Base para un ajuste posterior: al ser un checkpoint de 4B en safetensors, se puede recargar con `transformers` o Unsloth para continuar el entrenamiento con datos documentados.
- Despliegue en producción: no se recomienda con la información disponible, dado que no hay benchmarks, ni evaluación, ni validación de licencia para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en un modelo de 4B parámetros y no proceden de mediciones publicadas para este repositorio.

- VRAM para pesos en bf16/fp16: del orden de 8 a 10 GB, incluyendo el encoder de visión.
- VRAM con cuantización de 8 bits: aproximadamente 5 a 6 GB.
- VRAM con cuantización de 4 bits (GGUF Q4): aproximadamente 3 a 4 GB.
- El KV cache a 128 000 tokens puede anadir varios gigabytes y crece con el numero de secuencias concurrentes; conviene usar atención con memoria eficiente, cuantización del cache (FP8) o reducir la ventana efectiva.
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S; permiten bf16 con contexto largo y varios usuarios concurrentes.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) en bf16 con contexto moderado; RTX 4080 y 4070 Ti (16 GB) en 8 bits; RTX 4060 Ti 16 GB y RTX 3060 12 GB en 4 bits con contexto reducido.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference y vLLM según las etiquetas del repositorio, y llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de la columna de parámetros, contexto y licencia provienen de las fichas públicas de cada modelo; no se han verificado mediante ejecución ni mediante benchmarks comparables.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tune (gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen2) | 4B (heredados) | 128 000 tokens (modelo base) | Texto e imagen (modelo base) | apache-2.0 declarada | Hugging Face, 0 descargas |
| unsloth/gemma-3-4b-it | 4B | 128 000 tokens | Texto e imagen | Licencia Gemma de Google | Hugging Face |
| google/gemma-3-4b-it | 4B | 128 000 tokens | Texto e imagen | Licencia Gemma de Google | Hugging Face, Vertex AI |
| Qwen2.5-3B-Instruct | 3,1B | 32 768 tokens nativos, ampliables con YaRN | Texto | Apache-2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3,2B | 128 000 tokens | Texto | Llama 3.2 Community License | Hugging Face |
| Phi-4-mini-instruct | 3,8B | 128 000 tokens | Texto | MIT | Hugging Face |

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe el dataset, el objetivo del entrenamiento, los hiperparámetros ni ninguna evaluación. Todo uso en producción parte de cero información verificable.
- Ausencia de benchmarks: no hay métricas publicadas, ni propias ni comparativas con el modelo base, por lo que se desconoce si el fine-tune degrada las capacidades generales.
- Discrepancia de licencia: el repositorio declara apache-2.0, mientras que el modelo base Gemma 3 se distribuye bajo la licencia Gemma de Google, que incluye condiciones de uso y obligaciones de atribución. Antes de cualquier uso comercial debe aclararse qué licencia prevalece.
- Tamano anómalo del repositorio: 0,1 GB es muy inferior a los aproximadamente 8 GB esperados para pesos completos en bf16, lo que sugiere que podría tratarse de adaptadores, de pesos parciales o de un error de subida. Conviene inspeccionar los archivos antes de intentar cargarlo.
- Idiomas: solo se declara inglés. El soporte multilingüe del modelo base podría haberse degradado tras un ajuste fino con datos presumiblemente en inglés.
- Sesgos: no documentados. Los sesgos heredados del modelo base (los propios de un modelo entrenado mayoritariamente con datos web en inglés) siguen presentes y no han sido evaluados en este checkpoint.
- Riesgo de alucinación: no medido. Al no existir evaluación, no puede descartarse un aumento de la alucinación, especialmente en un modelo especializado en un dominio estrecho.
- Trazabilidad limitada: sin descargas ni likes y con fechas de creación y actualización separadas por 22 segundos, no hay validación de la comunidad ni historial de versiones.
- Sin garantía de soporte: no se documentan tareas mantenidas, issues atendidos ni `pipeline_tag`, por lo que no hay expectativa razonable de mantenimiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen2
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Anuncio de Gemma 3 en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-3/
- Variante de control relacionada: https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-self_collapse_p10-gen2
- Variante anterior de la misma serie: https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-collapse_p10-gen1
- Ficha de directorio de modelos sobre una variante de la serie: https://essamamdani.com/ai-models/hf-hungrydino-gemma-3-4b-it-control-numbers-self-collapse-p10-gen2
- Ficha de directorio de modelos sobre otra variante de la serie: https://essamamdani.com/ai-models/hf-hungrydino-gemma-3-4b-it-control-numbers-collapse-p10-gen3
