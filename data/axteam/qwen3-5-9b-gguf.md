# axteam/Qwen3.5-9B-GGUF

## Resumen

`axteam/Qwen3.5-9B-GGUF` es una conversión a formato GGUF del modelo denso Qwen3.5-9B, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. No se trata de un modelo nuevo ni de un fine-tune: es una derivación cuantizada de los pesos originales de Qwen (Apache-2.0), con 9.197.093.888 parámetros (9,2 B) y plantilla de chat original embebida en el GGUF. El repositorio se publicó el 27 de octubre de 2026 y ocupa 15,6 GB, con dos únicas variantes disponibles: Q4_K_M (5,8 GB) y Q8_0 (9,8 GB).

Su relevancia práctica es la de cualquier quant de la familia Qwen3.5: permitir ejecutar un modelo de 9 B en hardware de consumo con una pérdida de calidad reducida (Q8_0) o con la mitad de huella de memoria (Q4_K_M). Al estar basado en Qwen3.5-9B, hereda las características del modelo original, que según fuentes secundarias es nativamente multimodal y con una ventana de contexto muy amplia; sin embargo, esta conversión es **solo de texto**, ya que el codificador de visión no se incluye en los ficheros GGUF.

El punto a vigilar es que el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el autor no documenta parámetros de generación, plantilla de prompt detallada ni resultados de evaluación. Es un artefacto utilitario, no una ficha técnica completa: para decisiones de producción conviene contrastarlo con las conversiones de referencia (bartowski, llmware, lmstudio-community) y con los pesos originales en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-9B; la model card del quant no detalla la arquitectura interna) |
| Parámetros totales | 9.197.093.888 (≈9,2 B), dato real de safetensors del modelo base |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la model card del quant. Fuentes secundarias atribuyen al modelo base Qwen3.5-9B un contexto nativo de 262K–1M tokens |
| Tipos de cuantización | Q8_0 (8 bits, 9,8 GB) y Q4_K_M (4 bits k-quant medium, 5,8 GB) |
| Idiomas soportados | No disponible. La model card no declara lista de idiomas; la ficha de llmware para la misma base indica «English» |
| Licencia | Apache-2.0 (pesos originales de Qwen; la conversión mantiene la licencia) |
| Formato de pesos | GGUF (generado con `convert_hf_to_gguf.py` de llama.cpp) |
| Codificador de visión | No incluido (conversión solo de texto) |
| Plantilla de chat | Embebida en el GGUF (la original del modelo base) |
| Tamaño del repositorio | 15,6 GB |

## Arquitectura y entrenamiento

La model card de esta conversión no aporta información sobre arquitectura ni sobre el proceso de entrenamiento: se limita a documentar el proceso de cuantización. Lo que sí se sabe con certeza es el pipeline técnico: los pesos de `Qwen/Qwen3.5-9B` en safetensors se convirtieron con el script oficial `convert_hf_to_gguf.py` del repositorio de llama.cpp, manteniendo la plantilla de chat original y descartando el codificador de visión. Se ofrecen dos niveles de cuantización: Q8_0, que preserva prácticamente la distribución de pesos original en 8 bits, y Q4_K_M, que aplica cuantización de bloque tipo k-quant en 4 bits con escalas de distinto tamaño según el tensor.

Respecto a la arquitectura del modelo base, las fuentes secundarias consultadas lo describen como un transformer denso de 9 B, nativamente multimodal y con ventana de contexto en el rango de 262K a 1M tokens. No se dispone de datos verificados sobre número de tokens de entrenamiento, composición del dataset ni sobre si hubo fases de RLHF o DPO en el modelo original; esta información no aparece en la documentación proporcionada y no debe asumirse.

## Capacidades

- Generación de texto conversacional y de propósito general (chat multi-turno), con la plantilla de chat del modelo base ya embebida en el GGUF.
- Razonamiento y conocimiento general propios de un modelo de 9 B de la familia Qwen3.5; el autor no publica evaluaciones específicas.
- Inferencia local en CPU y GPU mediante llama.cpp, con soporte de cuantización k-quant.
- Compatibilidad con Ollama y LM Studio, además de `llama-server` y `llama-cli`.
- Soporte de contexto largo: la ventana queda limitada por la memoria disponible para la caché KV, no por el fichero GGUF; el ejemplo del autor usa `-c 8192`.
- Multilingüismo: presumible por la familia Qwen, pero **no declarado** en la model card; el ejemplo de uso del autor emplea una frase en coreano.
- Capacidades de visión: **no disponibles** en esta conversión, al haberse excluido el codificador de visión.
- Tool calling / function calling y comportamiento agéntico: no documentados en esta ficha; dependen de la plantilla del modelo base y del runtime, no del quant en sí.

## Casos de uso

- **Asistente local en estación de trabajo sin GPU dedicada**: con Q4_K_M (5,8 GB) puede ejecutarse en CPU con llama.cpp u Ollama, lo que permite desplegar un chat privado con contexto de 4K–8K tokens sin enviar datos a la nube.
- **Prototipado rápido de aplicaciones de chat**: la plantilla de chat viene embebida, de modo que `llama-server -hf axteam/Qwen3.5-9B-GGUF:Q4_K_M -c 8192` levanta un endpoint compatible con la API de OpenAI en un solo comando, útil para validar prompts antes de pasar a producción.
- **Generación de texto por lotes en local (resúmenes, clasificación, extracción)**: el formato GGUF y la posibilidad de usar `llama-cli` facilitan scripts de procesamiento masivo de documentos donde el coste por token de una API sería prohibitivo.
- **Aplicaciones de escritorio con LM Studio u Ollama**: el modelo se integra como backend local en herramientas de escritorio, adecuado para asistentes de escritura o edición de código con requisitos de privacidad.
- **Evaluación comparativa de cuantizaciones**: disponer de Q4_K_M y Q8_0 del mismo modelo permite medir la degradación real de calidad en las tareas propias de la aplicación, un paso recomendable antes de fijar un quant en producción.
- **Base para ajuste fino ligero en entornos con poca VRAM**: Q8_0 (9,8 GB) cabe en GPUs de 12–16 GB y sirve como referencia de calidad para comparar contra el modelo original en safetensors.
- **Investigación sobre formatos de cuantización**: el repositorio documenta el script de conversión y los tamaños resultantes, lo que lo hace útil como caso de estudio de la relación entre bits por peso y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del quant no incluye evaluaciones, y las fuentes secundarias consultadas solo aportan afirmaciones cualitativas sobre el modelo base (por ejemplo, que «supera a Qwen3-30B en la mayoría de benchmarks y a GPT-5-Nano en tareas de visión»), sin tablas de métricas verificables. No se dispone tampoco de datos de throughput ni de latencia medidos.

## Requisitos de hardware

- **Q4_K_M (5,8 GB de pesos)**: huella total estimada de 7–8 GB con contexto de 8K tokens, sumando caché KV y overhead del runtime. Cabe en GPUs de consumo de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) y en Mac con 16 GB de memoria unificada.
- **Q8_0 (9,8 GB de pesos)**: huella estimada de 11–12 GB con contexto de 8K tokens. Requiere GPUs de 12 GB o más (RTX 4070, RTX 4070 Ti Super, RTX 4080, RTX 4090) o 16 GB de memoria unificada en Apple Silicon.
- **Contexto largo**: si se aprovecha la ventana de 262K tokens atribuida al modelo base, la caché KV dominará el consumo de memoria y desplazará el modelo a GPUs de 40–80 GB (A100, H100) o a configuraciones multi-GPU. Para uso en consumo, conviene limitar `-c` a 8K–32K.
- **CPU**: ambas cuantizaciones son viables en CPU; Q4_K_M es la opción sensata para equipos sin GPU.
- **Despliegue**: llama.cpp (`llama-server`, `llama-cli`) y Ollama (`ollama run hf.co/axteam/Qwen3.5-9B-GGUF:Q4_K_M`) están documentados por el autor; LM Studio es compatible al ser GGUF. vLLM y TGI no son la vía recomendada para este artefacto: para servidores de alto throughput conviene usar los pesos originales en safetensors.
- **Latencia y throughput**: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-9B-GGUF | 9,2 B (denso) | No declarado en la ficha del quant (262K–1M según fuentes secundarias para la base) | Q4_K_M, Q8_0 | Apache-2.0 | 0 descargas, 1 like |
| llmware/qwen-3.5-9b-gguf | 9 B (misma base) | No disponible | Q4_K_M (int4) | Apache-2.0 | No disponible en la información recogida |
| bartowski/Qwen_Qwen3.5-9B-GGUF | 9 B (misma base) | No disponible | No disponible en la información recogida | Apache-2.0 | No disponible en la información recogida |
| lmstudio-community/Qwen3.5-9B-GGUF | 9 B (misma base) | No disponible | No disponible en la información recogida | Apache-2.0 | No disponible en la información recogida |
| Qwen/Qwen3.5-9B (original) | 9,2 B (denso) | 262K–1M (según fuentes secundarias) | Safetensors en BF16/FP16 | Apache-2.0 | Modelo de referencia, mantenido por Qwen |

Las tres conversiones alternativas parten exactamente de los mismos pesos, por lo que la diferencia práctica se reduce al conjunto de cuantizaciones ofrecidas, al tamaño de los ficheros y al mantenimiento del repositorio. Frente a ellas, `axteam` destaca por ofrecer solo dos variantes (Q4_K_M y Q8_0) y por un catálogo mucho más reducido, sin histórico de descargas que permita inferir fiabilidad.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización**: Q8_0 es prácticamente equivalente al original; Q4_K_M introduce una degradación no medida en esta ficha, que puede notarse en tareas de razonamiento matemático, código y contextos largos.
- **Sin visión**: el codificador de visión se excluyó deliberadamente, por lo que cualquier caso de uso multimodal del modelo base no está cubierto.
- **Sin benchmarks publicados**: no hay evidencia numérica del rendimiento de estas cuantizaciones; conviene evaluarlas en las tareas propias antes de adoptarlas.
- **Riesgo de alucinación**: inherente a un modelo de 9 B sin datos de evaluación publicados; no se han documentado mitigaciones específicas.
- **Idiomas no declarados**: la model card no enumera idiomas soportados; el comportamiento fuera de inglés y chino no está garantizado.
- **Contexto efectivo limitado por hardware**: aunque el modelo base soporte ventanas muy amplias, en GGUF el coste de la caché KV hace inviable ese contexto en GPUs de consumo.
- **Repositorio sin tracción**: 0 descargas y 1 like en el momento de la consulta, publicado y actualizado con dos minutos de diferencia; no hay evidencia de mantenimiento posterior ni de verificación por la comunidad.
- **Licencia**: Apache-2.0 permite uso comercial, pero los derechos sobre pesos y tokenizer siguen siendo del equipo Qwen; debe conservarse el aviso de licencia original.
- **Producción**: para servir con alto throughput, usar los pesos en safetensors con vLLM o TGI en lugar de este GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Conversión alternativa de llmware: https://huggingface.co/llmware/qwen-3.5-9b-gguf
- Conversión alternativa de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- Conversión alternativa de lmstudio-community: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-gguf-lmstudio-community
- Índice de modelos GGUF (local-ai-zone): https://local-ai-zone.github.io/models/qwen3-5-9b.html
- Ficha del modelo base en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
