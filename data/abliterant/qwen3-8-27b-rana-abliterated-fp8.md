# abliterant/Qwen3.8-27B-RANA-abliterated-FP8

## Resumen

Qwen3.8-27B-RANA-abliterated-FP8 es una cuantización en FP8 del modelo abliterado abliterant/Qwen3.8-27B-RANA-abliterated, que a su vez deriva del Qwen/Qwen3.8-27B de Alibaba. Se trata, por tanto, de un modelo de lenguaje y visión de 27 781 427 952 parámetros (aproximadamente 27,8 mil millones) al que se le ha eliminado la dirección de rechazo (refusal direction) mediante técnicas de abliteración, y que posteriormente se ha convertido al formato FP8 blockwise para reducir su huella de memoria a la mitad respecto a la versión BF16.

El modelo resuelve el problema de disponer de un VLM de gran tamaño con capacidad de razonamiento y tool calling en un formato de pesos de 30,9 GB que cabe en GPUs de 96 GB como la RTX PRO 6000 Blackwell, manteniendo la misma aritmética que el checkpoint FP8 oficial de Qwen. La abliteración elimina los rechazos duros del alineamiento de seguridad, lo que lo convierte en un modelo de investigación para estudiar el comportamiento de modelos sin salvaguardas de rechazo.

Es relevante ahora porque combina tres tendencias: la cuantización FP8 como estándar de despliegue en vLLM, la eliminación de la dirección de rechazo como técnica de investigación en interpretabilidad, y la integración de visión, tool calling y decodificación especulativa MTP en un único checkpoint. La licencia Apache-2.0 permite uso comercial, aunque el propio autor lo etiqueta como modelo de investigación con alineamiento de seguridad eliminado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, vision-language, pipeline image-text-to-text) |
| Parametros totales | 27 781 427 952 (aprox. 27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 nativos; 73 728 probados; 20 480 en la configuración de evaluación |
| Tipos de cuantizacion | FP8 e4m3 blockwise (bloques 128 × 128 con escala BF16 `weight_scale_inv`), cuantización dinámica de activaciones; tensores no convertidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1 606 tensores), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen3.8 con torre de visión (pipeline image-text-to-text), 27,8 mil millones de parámetros y un contexto nativo declarado de 262 144 tokens. El checkpoint FP8 no introduce cambios arquitectónicos: aplica cuantización blockwise FP8 e4m3 a 407 pesos lineales, cada bloque de 128 × 128 con una escala BF16, mientras que embeddings, `lm_head`, normalizaciones, gates, la torre de visión completa y el resto de tensores no convertidos permanecen en BF16. Los nombres, dtypes y formas de los tensores coinciden exactamente con el checkpoint FP8 oficial de Qwen (1 606 tensores).

El entrenamiento original corresponde a Qwen/Qwen3.8-27B, del que no se detallan en la información disponible el número de tokens, la composición del dataset ni las etapas de RLHF/DPO. La modificación de abliteración se aplica sobre los pesos BF16 antes de la conversión: 131 tensores fueron editados para eliminar la dirección de rechazo. Sobre los tensores no tocados por la abliteración, la conversión reproduce el FP8 oficial de Qwen con un 100 % de escalas de bloque y un 99,91 % de valores FP8 bit a bit idénticos; el error de redondeo de la dequantización respecto a BF16 es del 2,65 % en norma de Frobenius relativa, uniforme en los 407 tensores. El modelo soporta decodificación especulativa MTP con `num_speculative_tokens: 2` en vLLM.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activado por defecto.
- Comprensión de imágenes (image-text-to-text) mediante torre de visión integrada; el despliegue de referencia limita a 1 imagen por prompt y desactiva vídeo.
- Tool calling y function calling, con parser `qwen3_coder` y `--enable-auto-tool-choice` en vLLM.
- Razonamiento matemático y generación de código (HumanEval evaluado).
- Decodificación especulativa MTP para acelerar la inferencia.
- Conversación multi-turno con soporte de herramientas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comportamiento sin rechazos duros: 0 rechazos duros en HarmBench según la evaluación registrada.

## Casos de uso

- Investigación en interpretabilidad y alineamiento: comparar el comportamiento de un modelo con la dirección de rechazo ablacionada frente a su base alineado, usando los resultados registrados en `results/` y las mismas prompts de evaluación.
- Despliegue de un VLM de 27,8 B en una sola GPU de 96 GB: servir el modelo con vLLM 0.30.0 en RTX PRO 6000 Blackwell con `--max-model-len 20480` y cuantización FP8 detectada automáticamente desde `config.json`.
- Asistente técnico con contexto largo: aprovechar los 73 728 tokens probados (y hasta 262 144 nativos) para peticiones técnicas que requieren 20–50k tokens de razonamiento, elevando `--max-model-len` y `max_tokens`.
- Automatización de tareas con herramientas: pipelines de agentes que encadenan llamadas a funciones mediante el parser `qwen3_coder` y el modo thinking para descomponer tareas en pasos.
- Análisis de documentos e imágenes: procesamiento conjunto de texto e imagen en una sola pasada, útil para extracción de información de capturas, gráficos o documentos escaneados.
- Evaluación comparativa de cuantización: medir el impacto de FP8 frente a BF16 en MMLU-Pro, GSM8K, IFEval, TruthfulQA y HumanEval con las diferencias pareadas ya publicadas (entre −1,3 y +2,0 puntos porcentuales).
- Generación de código en producción con validación humana: HumanEval de 97,2 en FP8, integrable en pipelines que requieran tool calling y contexto medio-largo.

## Benchmarks y rendimiento

Resultados registrados en la model card, comparando FP8 con el build BF16 del que se convirtió, sobre las mismas prompts y ajustes. Las diferencias están pareadas por pregunta (± error estándar) y ninguna supera aproximadamente 2 errores estándar.

| Benchmark | BF16 | FP8 | FP8 − BF16 |
|---|---|---|---|
| MMLU-Pro (700) | 80,9 | 79,6 | −1,3 ± 1,1 |
| GSM8K (1 319) | 91,4 | 90,4 | −0,9 ± 0,6 |
| IFEval (541) | 89,3 | 91,3 | +2,0 ± 1,0 |
| TruthfulQA MC1 / MC2 (817) | 34,8 / 52,6 | 35,7 / 53,1 | +1,0 ± 0,5 / +0,5 ± 0,2 |
| HumanEval (164 × 3) | 96,7 | 97,2 | +0,4 ± 1,0 |
| Cambio medio de capacidad vs base (5 tareas) | 0,82 pp | 0,58 pp | — |
| Respuestas a la petición, held-out (240) ¹ | 90,0 % / 54,4 % | 87,8 % / 54,9 % | −2,2 (p = 0,05) / +0,5 (p = 0,88) |
| Respuestas a la petición, HarmBench (200) ¹ | 78,8 % / 57,3 % | 78,0 % / 58,5 % | −0,8 (p = 0,65) / +1,2 (p = 0,64) |
| Agota el presupuesto de 16k tokens, held-out ¹ | 6,7 % | 7,2 % | +0,5 (p = 0,57) |
| Rechazos duros, HarmBench (3 semillas × 2 jueces) ² | 0 | 0 | — |

¹ Media sobre semillas 1–3; respuestas mostradas como juez gpt-oss-safeguard-20b / Mistral-Small-24B; p = McNemar exacto sobre las mismas prompts, agrupado por semillas.
² Todo HARD_REFUSAL de gpt-oss en HarmBench se re-juzga con el procedimiento de re-adjuticación G1 del card BF16.

## Requisitos de hardware

- Tamaño de pesos: 30,9 GB en FP8, aproximadamente la mitad del build BF16.
- VRAM estimada: los 30,9 GB de pesos más overhead de activaciones, KV cache y contexto; con `--max-model-len 20480` el despliegue de referencia se validó en una GPU de 96 GB.
- GPU recomendadas: RTX PRO 6000 (Blackwell, 96 GB) es la configuración probada; por tamaño de pesos, GPUs de 48 GB o más pueden alojar los pesos, aunque el contexto completo de 262k requiere más memoria para KV cache.
- GPU de consumo: no hay confirmación en la información disponible de que quepa en GPUs consumer de 24 GB con esta cuantización; los pesos de 30,9 GB exceden esa VRAM.
- Opciones de despliegue: vLLM 0.30.0 (probado), con `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'`. La model card no documenta despliegue con llama.cpp, Ollama ni TGI.
- Nota de entorno: en GPUs Blackwell fue necesario `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| abliterant/Qwen3.8-27B-RANA-abliterated-FP8 | 27,8 B | 262k nativos (73 728 probados) | FP8 safetensors, 30,9 GB | Apache-2.0 | Objeto de esta ficha |
| abliterant/Qwen3.8-27B-RANA-abliterated | 27,8 B | 262k nativos | BF16 | Apache-2.0 | Base directa; referencia de evaluación (MMLU-Pro 80,9; GSM8K 91,4; HumanEval 96,7) |
| Qwen/Qwen3.8-27B-FP8 | 27,8 B | 262k nativos | FP8 safetensors | Apache-2.0 | Checkpoint oficial de Qwen; misma aritmética FP8 en los tensores no ablacionados |
| Qwen/Qwen3.8-27B | 27,8 B | 262k nativos | BF16 | Apache-2.0 | Modelo original alineado, sin abliteración |

## Limitaciones y advertencias

- Modelo de investigación con alineamiento de seguridad eliminado: el autor lo declara explícitamente y remite a las secciones Intended use y Limitations del card BF16 antes de usarlo.
- Riesgo de contenido dañino: la abliteración suprime la dirección de rechazo; los rechazos duros en HarmBench son 0, lo que implica que el modelo no se niega a peticiones que un modelo alineado rechazaría.
- Sesgos conocidos: no documentados en la información disponible; el modelo hereda los del checkpoint base Qwen3.8-27B.
- Riesgo de alucinación: TruthfulQA MC1 de 35,7 en FP8 indica una tasa de acierto baja en preguntas engañosas; no debe usarse como fuente de verdad sin verificación.
- Contexto: los 262k nativos no están completamente validados; la evaluación usa 20 480 tokens y el held-out agota el presupuesto de 16k en un 7,2 % de los casos.
- Idiomas: no se especifican en la información disponible; no asumir cobertura multilingüe sin verificación.
- Cuantización: la dequantización FP8 difiere de BF16 en un 2,65 % relativo; las diferencias de capacidad observadas llegan a −1,3 pp en MMLU-Pro.
- Visión limitada en el despliegue de referencia: 1 imagen por prompt y vídeo desactivado (`--limit-mm-per-prompt '{"image": 1, "video": 0}'`).
- Licencia Apache-2.0: permite uso comercial según los términos, pero la ausencia de salvaguardas de rechazo traslada al operador la responsabilidad de moderación en producción.
- Entorno: requiere vLLM 0.30.0 y el ajuste `VLLM_USE_FLASHINFER_SAMPLER=0` en Blackwell; otros runtimes no están documentados.

## Enlaces

- Hugging Face: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-FP8
- Modelo base BF16: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Resultados de evaluación: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-FP8/tree/main/results
- Licencia: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-FP8/blob/main/LICENSE
- Colección de modelos Abliterant: https://huggingface.co/abliterant
- Todos los formatos: https://abliterant.ai/models
- Demo Abliterant Chat: https://chat.abliterant.ai/
- Sitio del autor: https://abliterant.ai/
- Notas de investigación sobre ablación de rechazo: https://blog.abliterant.ai/rana-refusal-ablation
