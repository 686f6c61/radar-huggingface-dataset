# saidutta69/DeepSeek-R1-Distill-Qwen-1.5B-heretic

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-heretic es una variante "abliterada" (decensurada) del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario saidutta69 bajo el alias RACER IS OP. No es un fine-tune nuevo ni una mejora de capacidades: son los mismos pesos del modelo destilado de DeepSeek, con la dirección de pesos asociada al rechazo de peticiones eliminada mediante ablación direccional. El resultado es un modelo que conserva el razonamiento tipo cadena de pensamiento (chain-of-thought) del R1 destilado, pero que deja de negarse a responder a peticiones que el modelo base rechazaría.

El modelo base es un transformer denso de la familia Qwen2 con 1.777.088.000 parámetros reales (etiquetado comercialmente como 1.5B), destilado a partir de las trazas de razonamiento de DeepSeek-R1. Esta variante mantiene esa arquitectura y ese conocimiento, y añade un conjunto completo de cuantizaciones GGUF (15 ficheros, desde Q2_K de 718 MB hasta F16 de 3,32 GB) pensadas para ejecución local en CPU, Apple Silicon y GPUs de consumo.

Su relevancia es doble: por un lado, demuestra que la técnica de abliteración con Heretic 1.4.0 puede reducir los rechazos de 18/100 a 3/100 con una divergencia KL de solo 0,0044 respecto al base, es decir, con una alteración mínima del resto de la red; por otro, ofrece un modelo de razonamiento de ~1 GB cuantizado que corre en hardware muy modesto. La contrapartida es que elimina deliberadamente las barreras de seguridad y no incorpora ningún filtro adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen2 |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K; safetensors en precisión original |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso decoder-only de la familia Qwen2 con 1,777 mil millones de parámetros. El modelo original fue destilado por DeepSeek a partir de DeepSeek-R1, de modo que aprende a reproducir trazas de razonamiento largas antes de emitir la respuesta final. Esta variante no modifica esa arquitectura ni reentrena el modelo: aplica ablación direccional (directional ablation, "abliteration") con Heretic v1.4.0 sobre las proyecciones de salida de atención y las down-projections del MLP, que son las ubicaciones donde se localiza la dirección de pesos responsable del comportamiento de rechazo.

El proceso se ejecutó en el ensayo 152 de 200, con semilla RNG 1640365500, y los autores reportan una divergencia KL de 0,0044 respecto al modelo base junto con una caída de rechazos de 18/100 a 3/100 en el arnés de 100 prompts adversariales de Heretic. La justificación técnica es que editar direcciones específicas de pesos preserva mejor la coherencia y el conocimiento que un fine-tune sobre un modelo ya alineado con RLHF. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición de su dataset de destilación en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional y de razonamiento paso a paso con trazas de cadena de pensamiento, herencia directa de la destilación de DeepSeek-R1.
- Razonamiento matemático y lógico de nivel propio de un modelo de 1,5B, sin mejoras respecto al base.
- Generación de código y explicación de fragmentos de código.
- Respuesta a peticiones que el modelo base rechazaría, por diseño explícito de la abliteración.
- Ejecución local en CPU, Apple Silicon y GPUs de consumo gracias al conjunto completo de cuantizaciones GGUF.
- Compatibilidad con text-generation-inference, transformers, llama.cpp, Ollama, LM Studio, Jan, vLLM y SGLang, según la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base Qwen2 tiene cobertura multilingüe que esta ficha no puede confirmar para esta variante.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como sujeto de estudio para medir cuánto cambia el comportamiento de un modelo al eliminar la dirección de rechazo, con métricas reproducibles (KL 0,0044, rechazos 3/100) y assets de reproducción incluidos en el repositorio.
- Evaluación de robustez de filtros y clasificadores: permite generar respuestas que un modelo alineado rechazaría para probar sistemas de moderación de contenido en pipelines de producción, siempre en entornos controlados y con las salvaguardas externas adecuadas.
- Razonamiento local en hardware limitado: con la cuantización Q4_K_M (1,04 GB) se puede desplegar un modelo con trazas de razonamiento en un portátil sin GPU dedicada o en una Raspberry Pi de gama alta, útil para prototipos offline.
- Asistente de código en el editor: las cuantizaciones Q5_K_M o Q6_K (1,20 GB y 1,36 GB) caben en GPUs de 6-8 GB y permiten autocompletado y explicación de código con latencia baja en local, sin enviar código a la nube.
- Generación de datos sintéticos para entrenamiento: al no rechazar peticiones, puede producir corpus en dominios que el modelo base evitaría (por ejemplo, narrativa de ficción violenta o diálogos conflictivos), útiles para aumentar la diversidad de datasets, con revisión humana posterior obligatoria.
- Tutoría y explicación paso a paso: las trazas de razonamiento destiladas de R1 permiten mostrar el desarrollo de un problema matemático o lógico antes del resultado, aprovechable en herramientas educativas que ejecutan el modelo en local.
- Despliegue en entornos air-gapped: al ser un modelo pequeño con pesos MIT y formatos GGUF, se puede distribuir y ejecutar en máquinas sin conexión, algo relevante en entornos industriales o de defensa con requisitos de confidencialidad.

## Benchmarks y rendimiento

| Métrica | Este modelo | DeepSeek-R1-Distill-Qwen-1.5B (base) |
|---|---|---|
| Rechazos (de 100 prompts adversariales) | 3 | 18 |
| Divergencia KL respecto al base | 0,0044 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos aportados por el autor son las métricas del arnés de rechazo de Heretic y la divergencia KL.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para cuantizaciones Q4, más ~1 GB adicional para el contexto según la model card; entre 1,3 y 1,9 GB para Q5_K_M a Q8_0; 3,32 GB para F16.
- GPU recomendadas según la tabla del autor: RTX 3060 / 4070 / 5070 (12 GB) para Q8_0; RTX 4060 / 3070 (8 GB) para Q6_K; GTX 1660 Super / 2060 / 3050 laptop (6 GB) para Q5_K_M.
- CPU-only y Apple Silicon: Q4_K_M (1,12 GB según la tabla del autor, 1,04 GB según el listado de ficheros) cabe en RAM de sistema.
- Cabe en GPUs de consumo: sí, desde tarjetas de 6 GB; con cuantizaciones Q3 o Q2 podría ejecutarse en GPUs de 4 GB, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp (comando `llama serve -hf saidutta69/DeepSeek-R1-Distill-Qwen-1.5B-heretic`), Ollama, LM Studio, Jan, vLLM, SGLang, transformers y text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B-heretic | 1,777 M | no disponible | 3/100 | MIT | Hugging Face, GGUF completo |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,777 M | no disponible | 18/100 | MIT | Hugging Face |
| Variantes abliteradas de la familia Qwen2.5-1.5B | ~1,5B | no disponible | no disponible | habitualmente MIT o Apache 2.0 | Hugging Face |

La comparación más directa es con el modelo base, del que solo difiere en la supresión de rechazos y una divergencia KL de 0,0044. Frente a otras variantes abliteradas de la familia Qwen2.5 de tamaño similar, esta aporta el valor añadido de las trazas de razonamiento destiladas de R1 y un conjunto de cuantizaciones GGUF muy completo, pero no se dispone de datos de benchmarks que permitan comparar capacidades de forma objetiva.

## Limitaciones y advertencias

- Elimina deliberadamente las barreras de seguridad: el autor advierte que cumplirá peticiones que el modelo base rechazaría, incluidas algunas que no debería, y que no hay filtrado de seguridad adicional.
- Riesgo de alucinación: inherente a un modelo de 1,5B; las trazas de razonamiento pueden contener pasos plausibles pero incorrectos, especialmente en problemas largos.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Longitud de contexto: no documentada en la información disponible; conviene no asumir la ventana del modelo base sin verificarla.
- Licencia MIT: permite uso comercial, pero el despliegue de un modelo sin filtros de seguridad en productos de cara al público puede acarrear responsabilidades legales y de reputación según la jurisdicción.
- Calidad de las cuantizaciones bajas: Q2_K y Q3 degradan notablemente la coherencia en modelos de este tamaño; el propio autor recomienda bajar un nivel de cuantización solo si hay problemas de memoria.
- Sin métricas de capacidad publicadas: no hay datos de MMLU, HumanEval ni GSM8K para esta variante, por lo que la afirmación de que las capacidades se mantienen intactas se apoya solo en la KL baja, no en evaluaciones de tarea.
- Procedencia: el repositorio lo publica un usuario individual, no DeepSeek; conviene verificar la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/DeepSeek-R1-Distill-Qwen-1.5B-heretic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo sobre abliteración de mlabonne: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
