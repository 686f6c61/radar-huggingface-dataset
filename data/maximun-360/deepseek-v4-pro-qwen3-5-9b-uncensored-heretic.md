# Maximun-360/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino de tipo "abliterated" (decensurado) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario Maximun-360. El modelo base es a su vez un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con un sesgo claro hacia razonamiento matemático y STEM. La variante heretic elimina los mecanismos de rechazo del modelo original mediante la tecnica de ablacion arbitraria de rangos (ARA) implementada en Heretic v2.0.0.dev0.

El modelo cuenta con 9.409.813.744 parametros en formato safetensors (repo de 19,3 GB) y esta etiquetado como `qwen3_5` con pipeline `image-text-to-text`, lo que sugiere capacidades multimodales heredadas de la arquitectura Qwen3.5. La model card declara soporte para seis idiomas (ingles, chino, coreano, japones, espanol y ruso) y licencia Apache 2.0.

Su relevancia actual radica en dos factores: por un lado, ofrece razonamiento estilo DeepSeek en un tamano de 9B desplegable en hardware de consumo; por otro, la version heretic reduce los rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al original, lo que la hace atractiva para investigacion sobre alineacion, seguridad y comportamiento de modelos, aunque con caveats importantes para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona evaluacion NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.5, un transformer denso de 9B parametros con capacidad multimodal image-text-to-text. Segun la model card, el fine-tune de Jackrong se construyo mediante destilacion de DeepSeek-V4-Pro en modo "Max Effect" sobre aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. El pipeline de entrenamiento combina SFT y RL (se etiqueta GSPO y MTP), y se menciona la evaluacion de decodificacion especulativa multi-token prediction (MTP) y precision NVFP4.

La variante heretic aplica ablation de rangos arbitrarios (ARA) sobre las capas 9 a 24, con pesos de preservacion de comportamiento correcto de 0,8264, peso de direccionamiento de comportamiento indeseado de 0,0003, peso de sobrecorreccion relativa de 0,9645 y un vecindario de 12. Esta intervencion sobre los pesos elimina la mayoria de respuestas de rechazo sin reentrenamiento adicional, a costa de una divergencia KL de 0,0422 frente al modelo original.

## Capacidades

- Generacion de texto y razonamiento estructurado multi-paso, con descomposicion de problemas aprendida por destilacion.
- Razonamiento matematico y cientifico (STEM) reforzado mediante ~250.000 muestras de SFT.
- Capacidades multimodales image-text-to-text heredadas de la arquitectura Qwen3.5.
- Tool calling y function calling (etiquetas `tool-use`, `function-calling`).
- Soporte de agentes y razonamiento multi-paso.
- Multilingue en seis idiomas: ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento decensurado: reduccion de rechazos de 100/100 a 3/100 segun la model card.
- Mejoras menores en programacion y uso de herramientas por transferencia cruzada, pese a no recibir SFT especifico de codigo.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar el comportamiento del modelo original frente a la variante heretic permite estudiar como la ablacion de direcciones de activacion afecta a los rechazos, con una KL de 0,0422 como metrica de deriva.
- Tutoria matematica y STEM: el modelo puede descomponer problemas de calculo, algebra o fisica paso a paso, aprovechando las ~250.000 muestras de entrenamiento centradas en estas areas.
- Generacion de codigo asistida: aunque no recibio SFT especifico de codigo, la transferencia cruzada documentada y el soporte de tool calling permiten integrarlo en asistentes de programacion con ejecucion de funciones.
- Agentes automatizados con herramientas: la combinacion de function calling y razonamiento multi-paso lo hace adecuado para pipelines donde el modelo debe decidir que herramienta invocar y encadenar resultados.
- Procesamiento multimodal de documentos: al ser image-text-to-text, puede extraer y razonar sobre contenido de imagenes y texto combinados, por ejemplo en analisis de figuras cientificas o formularios.
- Atencion al cliente multilingue: con soporte para seis idiomas, puede gestionar conversaciones en espanol, ingles, chino, japones, coreano y ruso en un mismo despliegue.
- Experimentacion con cuantizacion de bajo bit: la model card menciona evaluacion NVFP4, lo que permite probar el modelo en precision reducida para entornos con VRAM limitada.

## Benchmarks y rendimiento

La model card solo publica metricas comparativas del proceso de decensurado, no benchmarks estandar de razonamiento:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB, aunque no se confirman pesos GGUF en el repo.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S, RTX 6000 Ada.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requiere cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; la model card menciona evaluacion con MTP y NVFP4, pero no se confirman integraciones con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,4B | no disponible | Razonamiento STEM decensurado | Apache 2.0 | 3/100 rechazos, KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Razonamiento STEM alineado | Apache 2.0 | Modelo base, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | Version reducida decensurada | no disponible | Variante 4B citada en la model card |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | Fine-tune cientifico | no disponible | Derivado del mismo modelo, orientado a STEM |

## Limitaciones y advertencias

- El proceso de decensurado elimina filtros de seguridad: el modelo puede generar contenido danino, ofensivo o ilegal sin rechazo, lo que lo hace inadecuado para aplicaciones de cara al publico sin capas de moderacion externas.
- La divergencia KL de 0,0422 respecto al original indica una deriva medible en la distribucion de salida; puede degradar capacidades no relacionadas con el rechazo.
- Riesgo elevado de alucinacion en dominios fuera de matematicas y STEM, dado el sesgo del dataset de destilacion.
- No se ha publicado la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin verificacion empirica.
- El soporte de espanol esta declarado en las etiquetas de idioma, pero no se documenta la calidad real por idioma ni el volumen de datos de entrenamiento en espanol.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensurado conlleva riesgos legales y reputacionales segun la jurisdiccion y el caso de uso.
- El autor del fine-tune es un usuario individual (Maximun-360), no un laboratorio consolidado; no hay garantias de mantenimiento ni soporte.
- El modelo base se presenta como destilado de DeepSeek-V4-Pro, pero no se aportan detalles verificables sobre el proceso de destilacion ni sobre la composicion exacta del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximun-360/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune STEM DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
