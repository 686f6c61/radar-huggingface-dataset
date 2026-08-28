# 0xSojalSec/Qwen3.8-27B-Uncensored

## Resumen

Qwen3.8-27B-Uncensored es una variante del modelo Qwen3.8-27B de Alibaba modificada mediante abliteration para reducir sustancialmente el comportamiento de rechazo (refusals) ante peticiones dañinas. El autor, 0xSojalSec, aplica la herramienta Heretic, que co-minimiza el número de rechazos frente a la divergencia KL respecto al modelo base, sin fine-tuning ni datos de entrenamiento adicionales. El resultado conserva las capacidades del original —razonamiento, visión, tool calling y decodificación especulativa MTP— pero con una tasa de rechazo que cae de 98/100 a 12/100 en un conjunto de 100 prompts dañinos.

El modelo mantiene la arquitectura híbrida del base: atención Gated DeltaNet lineal combinada con atención completa, torre de visión integrada y cabeza de predicción multi-token (MTP). Con 27.356 millones de parámetros, contexto de 262.144 tokens y pesos en bf16, ocupa unos 55 GB en VRAM. Está disponible en safetensors bf16, cuantizaciones GGUF para llama.cpp y formato MLX para Apple Silicon, bajo licencia Apache 2.0.

La relevancia de este modelo reside en su utilidad como herramienta de investigación sobre alineación y comportamiento de rechazo: permite estudiar qué capacidades se pierden (o no) al eliminar direcciones de rechazo, con una degradación media de solo 0,5 puntos en benchmarks 0-shot frente al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: Gated DeltaNet lineal + atención completa, con torre de visión) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 nativo; GGUF (F16 y 12 niveles, incluyendo Q4_K_M, IQ4_XS, Q3_K_M); MLX 2/4/6/8-bit |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 (una fuente indica "research-only" para los pesos GGUF) |
| Formato de pesos | safetensors (bf16), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros con arquitectura híbrida que combina atención lineal Gated DeltaNet con atención completa, lo que reduce el coste computacional en ventanas largas. Incluye una torre de visión nativa (pipeline image-text-to-text), una cabeza de predicción multi-token (MTP) de 1 capa para decodificación especulativa y 64 capas de transformador con un vocabulario de 248.320 tokens.

El proceso de abliteration se ejecuta con la herramienta Heretic, que realiza 200 ensayos de optimización co-minimizando el recuento de rechazos frente a la divergencia KL con el modelo base. Solo se modifican los tensores `attn.o_proj` y `mlp.down_proj` (64 módulos cada uno) en bf16, sin cuantización intermedia; el LoRA resultante se fusiona en el base bf16. Los 15 tensores `mtp.*` se injertan de nuevo desde el checkpoint base tras la fusión, ya que el re-guardado a través de transformers no conserva el módulo MTP. No hay fine-tuning ni datos de entrenamiento adicionales.

## Capacidades

- Generacion de texto y razonamiento: conserva las capacidades del base Qwen3.8-27B, con modo thinking activable por defecto en la plantilla de chat (se puede desactivar con `enable_thinking=False`).
- Vision-language: procesa entradas de imagen y texto (image-text-to-text) gracias a la torre de visión integrada.
- Tool calling / function calling: soportado, heredado del modelo base.
- Decodificacion especulativa MTP: la cabeza de predicción multi-token está presente y verificada, lo que permite acelerar la generación.
- Comportamiento de rechazo reducido: la tasa de rechazo ante 100 prompts dañinos cae de 98/100 (base) a 12/100, con una divergencia KL de 0,1191 frente al base.
- Multilingue: soporta ingles y chino.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar el efecto de la abliteration sobre las capacidades del modelo, comparando el rendimiento en benchmarks entre el base y la variante sin rechazos, con deltas documentados y error estandar reportado.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, narrativa interactiva o guiones que el modelo base rechazaria por politicas de seguridad, manteniendo la calidad linguistica del original.
- Desarrollo de agentes con tool calling: integrable en pipelines de agentes que requieren llamadas a funciones, con la ventaja de no rechazar peticiones legitimas que el base podria considerar arriesgadas.
- Despliegue local privado: con cuantizaciones GGUF (Q4_K_M de 16,8 GB) cabe en GPUs de 24 GB, y las versiones MLX permiten ejecutarlo en Apple Silicon, ideal para uso personal sin censura.
- Analisis de imagenes y documentos: al conservar la torre de visión, puede procesar imagenes con descripcion o extraccion de informacion, con menos rechazos en dominios sensibles.
- Benchmarking de modelos abliterados: sirve como punto de referencia para evaluar el coste de capacidad de diferentes tecnicas de eliminacion de rechazos, ya que la divergencia KL y los deltas de benchmarks estan documentados.
- Experimentos de decodificacion especulativa: la cabeza MTP verificada permite probar esquemas de prediccion multi-token en un modelo de 27B sin necesidad de reconstruir el modulo.

## Benchmarks y rendimiento

La model card reporta evaluaciones 0-shot con lm-evaluation-harness, comparando el modelo abliterado con el base sin modificar en la misma sesion. Los deltas son la metrica relevante, ya que aislan el coste de la edicion de pesos:

| Tarea | Base | Uncensored | Delta |
|---|---|---|---|
| MMLU | 83,4 | 83,3 | -0,2 |
| ARC-Challenge | 58,9 | 57,7 | -1,2 |
| HellaSwag | 82,8 | 82,9 | +0,1 |
| Winogrande | 76,1 | 75,3 | -0,8 |
| Media | | | -0,5 |

Todos los deltas estan dentro o cerca del error estandar reportado (MMLU ±0,30; ARC ±1,44; HellaSwag ±0,38; Winogrande ±1,21), por lo que ninguno es claramente separable del ruido entre ejecuciones. La model card advierte que estos resultados 0-shot no son comparables con las puntuaciones publicadas por Qwen (que usan few-shot), y que no se evaluaron tareas generativas (GSM8K, HumanEval), matematicas, codigo, multilingue ni la torre de vision o el MTP.

En cuanto al comportamiento de rechazo: el modelo pasa de 98/100 a 12/100 rechazos en 100 prompts dañinos del dataset `mlabonne/harmful_behaviors`, con una divergencia KL de 0,1191 frente al base.

## Requisitos de hardware

- VRAM para inferencia: los pesos bf16 requieren aproximadamente 55 GB de VRAM.
- Cuantizaciones GGUF: Q4_K_M (16,8 GB) cabe en una GPU de 24 GB; IQ4_XS (15,3 GB) cabe en una GPU de 16 GB; Q3_K_M (13,5 GB) deja margen para contexto largo.
- GPUs recomendadas: A100 80GB o H100 para bf16; RTX 4090 o RTX 3090 para cuantizaciones GGUF; Apple Silicon (M-series) con formato MLX.
- Opciones de despliegue: llama.cpp con la flag `--jinja` (y `--mmproj` para visión), Ollama, transformers con `device_map="auto"`, y servidores compatibles con endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rechazos (100 prompts) | MMLU 0-shot |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,36 B | 262.144 | Apache 2.0 | 98/100 | 83,4 |
| Qwen3.8-27B-Uncensored (este) | 27,36 B | 262.144 | Apache 2.0 | 12/100 | 83,3 |

No se dispone en la informacion proporcionada de datos cuantitativos comparables de otros modelos abliterados de la misma familia (por ejemplo, variantes de Dolphin o WizardLM-uncensored) para una comparativa directa. La comparacion con el base es la mas relevante, ya que aisla el efecto de la abliteration.

## Limitaciones y advertencias

- El comportamiento de rechazo esta reducido, no eliminado: 12 de 100 prompts dañinos siguen siendo rechazados.
- La divergencia KL de 0,1191 frente al base indica que la distribucion de primer token se ha desplazado; no es una certificacion de que las capacidades de razonamiento o codigo esten intactas.
- No se han evaluado tareas generativas (GSM8K, HumanEval), matematicas, codigo, multilingue ni la torre de vision; el rendimiento en esos dominios es desconocido.
- ARC-Challenge cae 1,2 puntos, aunque la model card atribuye parte de esa caida a sensibilidad al formato del modelo base, no a la abliteration.
- Solo soporta ingles y chino; no hay soporte declarado para espanol u otros idiomas.
- La licencia es Apache 2.0, pero una fuente (orcarouter.ai) indica "research-only" para los pesos GGUF; conviene verificar los terminos antes de uso comercial.
- Riesgo de generacion de contenido dañino: al reducir los rechazos, el modelo puede producir respuestas a peticiones explicitamente dañinas; no es adecuado para despliegues publicos sin salvaguardas adicionales.
- El modelo base es un checkpoint reciente (Qwen3.8, publicado en 2026); la compatibilidad con herramientas y ecosistemas existentes puede ser limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones GGUF: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Demo Space: https://huggingface.co/spaces/JonathanColetti/Qwen3.8-27B-Uncensored-Demo
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Guia de despliegue local (orcarouter.ai): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Articulo sobre el GGUF abliterado: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio GitHub de soporte: https://github.com/Wassimyounes01/qwen38-uncensored
- Version MLX para Apple Silicon: https://github.com/onurburak9/Qwen3.8-27B-Uncensored
- API y documentacion (Wiro AI): https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
