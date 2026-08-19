# PocketAiHub/Qwen3.8-27B-Abliterated-MLX

## Resumen

El modelo `PocketAiHub/Qwen3.8-27B-Abliterated-MLX` es una familia de conversiones MLX del modelo multimodal Qwen3.8-27B de Qwen, publicada por PocketAI Model Lab. Se trata de un derivado no oficial que aplica una técnica de "abliteration" para suprimir el comportamiento de rechazo aprendido en el modelo original, de modo que responde a instrucciones dañinas o problemáticas sin filtros de seguridad explícitos. Está disponible en cuatro variantes de cuantización (4-bit, 6-bit, 8-bit y BF16) y está diseñado para ejecutarse en hardware Apple Silicon mediante las librerías MLX y MLX-VLM.

El modelo conserva las capacidades multimodales del base: procesa texto, imágenes y vídeo, y soporta tool calling y razonamiento multi-paso. Sin embargo, la abliteration elimina la capa de rechazo, lo que implica un riesgo significativo de generar contenido inapropiado o peligroso. Es relevante para investigadores y desarrolladores que necesitan estudiar el comportamiento de modelos sin restricciones de seguridad, siempre que implementen sus propios mecanismos de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + lenguaje), basada en Qwen3.8-27B |
| Parametros totales | 27B (según nomenclatura del modelo base, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probado con 4K tokens, máximo no especificado) |
| Tipos de cuantizacion | 4-bit, 6-bit, 8-bit (affine, grupo 64) y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal con componentes de visión y lenguaje. La conversión a MLX mantiene la arquitectura original, pero los pesos se cuantizan con cuantización afín de grupo 64 para las variantes de 4, 6 y 8 bits, mientras que el "vision tower" se mantiene en BF16. La técnica de abliteration consiste en medir una dirección proyectada "harmful-minus-harmless" a partir de 256 prompts por clase, y restar esa dirección en las capas 24 a 63 (capa fuente 53) con escala 1.0, modificando 80 matrices de salida residual. El objetivo es eliminar la activación que dispara los rechazos explícitos.

El entrenamiento original del modelo Qwen3.8-27B (datos, tokens, RLHF, etc.) no se detalla en la información proporcionada. La conversión MLX y el experimento de abliteration fueron realizados por PocketAI Model Lab, que validó el comportamiento con evaluaciones deterministas.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto, imágenes y vídeo (validado con pruebas de comprensión temporal de vídeo).
- Generación de texto y razonamiento: puede producir respuestas coherentes en tareas de lenguaje natural, aunque la abliteration puede afectar la calidad en dominios sensibles.
- Soporte de tool calling: validado con 8/8 pruebas nativas de llamada a herramientas.
- Modo de pensamiento (thinking): disponible, aunque se desactiva en las evaluaciones por defecto.
- Capacidades multilingües: no especificadas en la documentación, aunque el modelo base de Qwen suele ser multilingüe.
- Conversión optimizada para Apple Silicon mediante MLX, con cuantizaciones de 4, 6 y 8 bits para reducir memoria y acelerar inferencia.

## Casos de uso

- Investigación en seguridad de IA: estudiar el comportamiento de modelos sin mecanismos de rechazo, para analizar sesgos, alucinaciones y riesgos de generación de contenido dañino. Requiere entornos aislados y supervisión humana.
- Desarrollo de aplicaciones de generación de contenido creativo: el modelo puede producir texto e imágenes sin restricciones, útil para prototipos de narrativa, arte generativo o guiones, siempre que se implementen filtros posteriores.
- Automatización de tareas de visión-lenguaje en Mac: gracias a su formato MLX, puede integrarse en aplicaciones locales de Apple Silicon para descripción de imágenes, respuesta a preguntas visuales o resumen de vídeo, con latencia razonable.
- Asistente de código con tool calling: al soportar llamadas a funciones, puede utilizarse en entornos de desarrollo para generar, revisar o ejecutar código, aunque la falta de rechazo puede llevar a sugerencias inseguras.
- Análisis de documentos multimodales: procesar PDFs, capturas de pantalla o diagramas junto con texto para extraer información, en tareas de investigación o soporte documental.
- Evaluación de técnicas de alineación: comparar el comportamiento de este modelo con versiones con rechazo para medir el efecto de la abliteration en la calidad de las respuestas y la seguridad.

## Benchmarks y rendimiento

La información proporcionada no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, se reportan evaluaciones de comportamiento y rendimiento en hardware Apple M5 Max (128 GB, mlx 0.32.0, mlx-vlm 0.6.8, batch size 1, temperatura 0, seed 0, thinking desactivado, prompts de 4.105 tokens):

| Variante | Refusals explícitos (harmful/benign) | Respuestas finales | Prefill (tok/s) | Generación (tok/s) | End-to-end (s) | Pico de memoria MLX |
|---|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 0/100 / 0/100 | 200/200 | 641,7 | 33,2 | 6,68 | 21,80 GB |
| MLX 6-bit | 0/100 / 0/100 | 200/200 | 548,2 | 24,7 | 7,87 | 29,54 GB |
| MLX 8-bit | 0/100 / 0/100 | 200/200 | 579,1 | 18,7 | 7,58 | 37,27 GB |
| MLX BF16 | 0/100 / 0/100 | 200/200 | 513,9 | 9,0 | 9,02 | 58,29 GB |

Estos datos son de una sola ejecución local y no constituyen una garantía de rendimiento en otros equipos.

## Requisitos de hardware

- Pensado para Apple Silicon: requiere Mac con chip M-series y memoria unificada.
- Memoria mínima estimada según variante: 4-bit ~22 GB, 6-bit ~30 GB, 8-bit ~37 GB, BF16 ~58 GB (picos medidos en M5 Max).
- GPU recomendada: Apple M5 Max o superior (también funciona en M1/M2/M3 con memoria suficiente, aunque el rendimiento variará).
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque el formato MLX es específico de Apple.
- Opciones de despliegue: mediante `mlx-vlm` (carga y generación) y `huggingface_hub` para descarga. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: los valores de la tabla anterior son orientativos para un M5 Max; en otros chips serán diferentes.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (p. ej., Qwen2.5-VL, LLaVA, etc.) en la documentación proporcionada. La comparación directa con el modelo base Qwen3.8-27B no es posible porque no se detallan sus especificaciones. Por tanto, esta sección queda como "no disponible".

## Limitaciones y advertencias

- La abliteration suprime el rechazo aprendido, por lo que el modelo puede generar contenido dañino, ilegal, ofensivo, engañoso o incorrecto con mayor facilidad que el modelo original.
- No es un entrenamiento de veracidad ni una mejora de capacidades: la eliminación del rechazo no garantiza respuestas correctas ni seguras.
- La evaluación de comportamiento se basa en un detector de rechazo explícito por frases, no en una evaluación completa de calidad o cumplimiento. La mayoría de las generaciones alcanzaron el límite de tokens, por lo que no se puede afirmar que el modelo siempre responda adecuadamente.
- La longitud de contexto máxima no está especificada; solo se probó con 4K tokens. Puede degradarse con contextos más largos.
- Los idiomas soportados no están documentados; el modelo base probablemente sea multilingüe, pero no hay confirmación.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de seguridad indica que el usuario debe implementar sus propios mecanismos de control si lo utiliza en producción.
- El rendimiento reportado es específico de un M5 Max y puede no reproducirse en otros equipos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Librería MLX: https://github.com/ml-explore/mlx
