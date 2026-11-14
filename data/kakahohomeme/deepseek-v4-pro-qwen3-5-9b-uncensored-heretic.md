# kakahohomeme/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario kakahohomeme. El modelo base es un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con un foco claro en matematicas y problemas STEM. La modificacion heretic se ha aplicado con la herramienta Heretic v2.0.0.dev0, que realiza una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24 para reducir la tasa de rechazos.

El modelo conserva la arquitectura y el tamano del base: 9.409.813.744 parametros totales (aproximadamente 9,4B), pesos en safetensors, licencia Apache 2.0 y soporte declarado para ingles, chino, coreano, japones, espanol y ruso. El pipeline es text-generation, aunque las etiquetas incluyen image-text-to-text, lo que sugiere capacidades multimodales heredadas de la familia Qwen3.5.

Su relevancia actual radica en dos factores: por un lado, ofrece un modelo de razonamiento compacto (clase 9B) destilado de un profesor de gran escala, lo que facilita el despliegue en hardware asequible; por otro, la ablacion heretic reduce los rechazos de 100/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 0,0422 respecto al base, lo que la hace atractiva para aplicaciones donde los filtros de seguridad del modelo original resultan demasiado restrictivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), segun tag `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se menciona evaluacion NVFP4 en la model card del base) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado de DeepSeek-V4-Pro en modo Max Effect. El entrenamiento supervisado (SFT) se centro en aproximadamente 250.000 muestras de matematicas y STEM, segun la model card del base. Las etiquetas del repositorio mencionan tambien RL, GSPO y MTP (multi-token prediction), aunque no se detalla la composicion exacta del pipeline de post-entrenamiento ni el numero total de tokens vistos.

La innovacion principal de esta variante concreta es la aplicacion de Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24, con los siguientes hiperparametros: `start_layer_index=9`, `end_layer_index=24`, `preserve_good_behavior_weight=0.8264`, `steer_bad_behavior_weight=0.0003`, `overcorrect_relative_weight=0.9645` y `neighbor_count=12`. Esta tecnica modifica los pesos para suprimir el comportamiento de rechazo preservando al maximo las capacidades originales, lo que se refleja en una divergencia KL de 0,0422 frente al modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con enfasis en descomposicion estructurada de problemas.
- Razonamiento matematico y resolucion de problemas STEM, entrenado sobre aproximadamente 250.000 muestras de ese dominio.
- Tool calling y function calling, segun las etiquetas `tool-use` y `function-calling`.
- Capacidades multimodales declaradas mediante la etiqueta `image-text-to-text` (no se detalla el alcance exacto).
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (tag `reasoning`), heredado del proceso de destilacion.
- Comportamiento "uncensored": tasa de rechazos de 3/100 frente a 100/100 del modelo original, segun la model card.
- Transferencia cruzada limitada a programacion y uso de herramientas, pese a no recibir SFT especifico de codigo.

## Casos de uso

- Tutoria de matematicas y STEM: el modelo puede descomponer problemas paso a paso y explicar el razonamiento, aprovechando las 250.000 muestras de entrenamiento en ese dominio para generar soluciones detalladas en entornos educativos.
- Asistencia en investigacion cientifica: util para borradores de derivaciones, comprobacion de calculos y explicacion de conceptos tecnicos, con soporte en seis idiomas que facilita la colaboracion internacional.
- Agentes con tool calling: integrable en pipelines que requieran llamadas a funciones externas (calculadoras, APIs de datos, ejecucion de codigo) gracias a las etiquetas de function-calling y tool-use.
- Generacion de codigo asistida: aunque no recibio SFT especifico de programacion, la model card reporta mejoras pequenas por transferencia cruzada, suficiente para tareas de scripting y automatizacion ligera.
- Despliegue en hardware de consumo: con 9,4B parametros y pesos safetensors, es viable en GPUs consumer con cuantizacion (aunque el repo no publica GGUF de forma explicita), lo que permite prototipado local sin infraestructura de datacenter.
- Aplicaciones que requieren baja tasa de rechazo: la ablacion heretic lo hace adecuado para entornos de investigacion sobre alineacion, red teaming controlado o generacion de contenido creativo sin filtros excesivos, siempre con supervision humana.
- Procesamiento de documentos con imagen y texto: la etiqueta image-text-to-text sugiere uso en tareas de comprension de capturas, diagramas o documentos escaneados, aunque la profundidad de esta capacidad no esta documentada.

## Benchmarks y rendimiento

La model card del modelo heretic solo publica dos metricas comparativas frente al modelo base:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9,5-10 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB de pesos, viable en GPUs consumer de gama media-alta.
- GPUs recomendadas: A100 40/80 GB o H100 para BF16 sin cuantizar y contextos largos; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090, 4080 o 4070 Ti Super para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: si, especialmente con cuantizacion de 4 u 8 bits en tarjetas de 12-24 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`); vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible, aunque al ser un transformer estandar de Qwen3.5 deberian ser compatibles con conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante abliterated, 3/100 rechazos, KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 (heredada) | Modelo base, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | Apache 2.0 | Version reducida de la misma familia heretic |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune cientifico basado en este modelo |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion heretic elimina parte de los mecanismos de rechazo del modelo original, lo que puede facilitar la generacion de contenido danino, sesgado o inapropiado; requiere supervision humana y filtros externos en produccion.
- La divergencia KL de 0,0422 indica que las distribuciones de salida se han alterado respecto al base; pueden aparecer degradaciones sutiles en tareas fuera del dominio STEM.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados, especialmente en dominios no cubiertos por las 250.000 muestras de entrenamiento.
- La longitud de contexto no esta documentada, lo que impide garantizar el rendimiento en conversaciones o documentos largos.
- El soporte de espanol esta declarado en las etiquetas, pero no se aportan evaluaciones especificas de calidad en ese idioma.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede conllevar riesgos reputacionales y legales segun la jurisdiccion y el caso de uso; conviene revisar las politicas de la plataforma de despliegue.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-14), por lo que carece de validacion comunitaria.
- La etiqueta image-text-to-text no viene acompanada de documentacion sobre el procesador de imagen ni de ejemplos de uso multimodal; su funcionalidad real no esta verificada.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/kakahohomeme/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune STEM DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
