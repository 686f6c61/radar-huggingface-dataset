# richardyoung/Qwen3.5-4B-JSpace-heretic-GGUF

## Resumen

Qwen3.5-4B-JSpace-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Qwen3.5-4B-JSpace-heretic, una variante "abliterated" (con el comportamiento de rechazo eliminado) del modelo base Qwen/Qwen3.5-4B. El autor, Richard J. Young, aplicó una técnica de ablación de direcciones en el espacio jacobiano (J-space) mediante la herramienta Heretic 2.0, un fork derivado del estudio original sobre abliteración. El resultado es un modelo que responde a muchas solicitudes que el original rechazaría, manteniendo una divergencia KL de primer token de 0,019 respecto al original.

El modelo cuenta con 4.205.751.296 parámetros reales (aproximadamente 4,2 mil millones) y está pensado exclusivamente para investigación sobre eliminación de rechazos, su medición y las defensas frente a ella. No es un asistente de propósito general. Esta versión GGUF facilita su ejecución en llama.cpp y Ollama, con cuantizaciones que van desde Q4_K_M (2,7 GB) hasta Q8_0 (4,5 GB), además de una matriz de importancia de 7 MB para cuantizaciones dinámicas.

Es relevante ahora porque forma parte de un estudio comparativo más amplio sobre si la abliteración se está volviendo más difícil en modelos recientes (Qwen3.8, Gemma 4, Olmo 3.1 y Mistral Small 3.2 frente a sus predecesores). La licencia es Apache 2.0, heredada del modelo base, y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (2,7 GB), Q8_0 (4,5 GB), imatrix (7 MB); en preparacion: IQ3_M, IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros. Sobre esa base, el autor aplicó una ablación de direcciones en el espacio jacobiano (J-space) mediante Heretic 2.0, un fork de la herramienta Heretic desarrollada en el estudio original sobre abliteración. El proceso busca direcciones de rechazo en el espacio de activaciones y las elimina de los pesos, con una búsqueda de 100 ensayos y una regla de selección basada en minimizar los rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token menor o igual a 0,1 respecto al original.

Los datos de entrenamiento del modelo base Qwen3.5-4B no se detallan en la información proporcionada. El proceso de abliteración no requiere un corpus de entrenamiento convencional: opera sobre los pesos publicados del modelo original (revisión 22ea0ee207b0 del safetensors), verificados con SHA-256. La conversión a GGUF se realizó con llama.cpp (commit 468fde9) mediante convert_hf_to_gguf.py --outtype bf16 y posterior llama-quantize en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estáticas.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline de text-generation.
- Responde a muchas solicitudes que el modelo original rechazaría (comportamiento de rechazo reducido del 88,5 % al 73,8 % en 972 prompts dañinos retenidos, según el paper).
- Capacidad multimodal heredada del modelo base (acepta imágenes), pero el proyector de visión no está incluido en estos ficheros GGUF: uso solo texto.
- Compatible con llama.cpp, Ollama y endpoints compatibles.
- Soporte de cuantizaciones con matriz de importancia para preservar calidad en tamaños reducidos.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes o modo de razonamiento explícito.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como sujeto de estudio para medir la eficacia de la eliminación de rechazos y comparar con modelos predecesores, tal como se plantea en el paper del autor.
- Evaluación de defensas frente a la eliminación de rechazos: permite a investigadores en seguridad alinear probar técnicas de detección y mitigación sobre un modelo con rechazos parcialmente suprimidos.
- Reproducción de experimentos: los ficheros GGUF y la matriz de importancia permiten reproducir las condiciones del estudio en hardware de consumo sin necesidad de GPU de datacenter.
- Análisis de divergencia KL y comportamiento de rechazo: útil para estudiar cómo la cuantización afecta al comportamiento de rechazo, ya que el autor advierte que los ficheros cuantizados no fueron evaluados en el paper.
- Despliegue local en Ollama para pruebas controladas: con Q4_K_M (2,7 GB) se puede ejecutar en portátiles y equipos de gama media para experimentación rápida.
- Estudio de robustez de cuantizaciones: comparar Q4_K_M frente a Q8_0 (casi sin pérdida) para analizar el impacto de la cuantización en un modelo abliterated.

## Benchmarks y rendimiento

Resultados del modelo en precisión completa (bf16), según el paper del autor:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 88,5 % | 73,8 % (717/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | No disponible | 48 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | No disponible | 0,019 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los ficheros cuantizados no fueron evaluados en el paper y la cuantización puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para Q4_K_M (2,7 GB de pesos más overhead), alrededor de 5 GB para Q8_0 (4,5 GB de pesos más overhead).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_M; para Q8_0 se recomienda 8 GB o más. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema por tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más para Q4_K_M; 8 GB o más para Q8_0.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run richardyoung/qwen3.5-4b-jspace-heretic y variantes con tag :Q8_0), endpoints compatibles. No se documenta soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-JSpace-heretic-GGUF | 4,2 B | No disponible | Apache 2.0 | Abliterated con Heretic 2.0 (J-space); rechazo 73,8 % en 972 prompts |
| Qwen/Qwen3.5-4B (original) | 4,2 B | No disponible | Apache 2.0 | Modelo base sin abliterar; rechazo 88,5 % en 972 prompts |
| richardyoung/Qwen3.5-4B-JSpace-heretic | 4,2 B | No disponible | Apache 2.0 | Versión en safetensors del mismo modelo abliterated, sin cuantizar |

No se dispone de datos de benchmarks estándar para comparar el rendimiento general con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo destinado a investigación sobre eliminación de rechazos, no a uso como asistente de propósito general; el autor lo indica explícitamente.
- El comportamiento de rechazo se reduce pero no se elimina por completo: sigue rechazando el 73,8 % de 972 prompts dañinos retenidos.
- Los ficheros cuantizados no fueron evaluados en el paper; la cuantización puede cambiar el comportamiento de rechazo de forma no documentada.
- Solo texto: el proyector de visión del modelo base no está incluido, aunque el original acepte imágenes.
- Idioma declarado únicamente inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero inherentes a un modelo de 4,2 B.
- Licencia Apache 2.0 heredada del modelo base, con las mismas restricciones de uso que el modelo fuente; los usuarios son responsables del uso lícito.
- Longitud de contexto no disponible; conviene verificarla antes de desplegar en producción.
- Al ser un modelo abliterated, puede generar contenido que el original rechazaría; requiere salvaguardas adicionales si se usa en entornos expuestos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Paper citado: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (enlace arXiv pendiente de añadir según la model card)
