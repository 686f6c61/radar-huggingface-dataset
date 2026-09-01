# mradermacher/Qwen3.8-27B-full-Uncensored-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-full-Uncensored-GGUF` es una colección de cuantizaciones GGUF del modelo `0xSojalSec/Qwen3.8-27B-full-Uncensored`, una versión "abliterated" (sin censura) del Qwen3.8-27B original de Alibaba. El proceso de abliteration elimina las direcciones de activación asociadas al rechazo de peticiones, produciendo un modelo que responde sin filtros de seguridad. Esta variante está pensada exclusivamente para investigación en seguridad de IA, red-teaming y evaluación de riesgos, no para uso en producción.

El modelo base Qwen3.8-27B es un transformer denso de 27 320 millones de parámetros con arquitectura híbrida: 48 capas de atención lineal Gated DeltaNet y 16 capas de atención completa, lo que permite una ventana de contexto nativa de 262 144 tokens. Incluye además capacidades multimodales nativas (visión) mediante un proyector adicional. El autor de la cuantización, mradermacher, ofrece nueve niveles de cuantización GGUF (de Q2_K a Q8_0) más los proyectores multimodales, lo que facilita su ejecución en hardware variado.

La relevancia de este modelo radica en que combina un contexto muy largo, arquitectura híbrida eficiente y ausencia de mecanismos de rechazo, convirtiéndolo en una herramienta valiosa para estudiar comportamientos no alineados, alucinaciones y sesgos en modelos de gran tamaño, siempre dentro de un marco ético y legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet (atención lineal) + 16 capas full-attention |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativa) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0; también mmproj-Q8_0 y mmproj-f16 para visión |
| Idiomas soportados | Inglés (según la model card; el modelo base Qwen3.8 soporta múltiples idiomas, pero esta versión está etiquetada como `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también safetensors y MLX en el repo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet (48 capas) con atención completa (16 capas). Esta mezcla reduce el coste computacional en contextos largos manteniendo la calidad en tareas de razonamiento. El entrenamiento original de Qwen3.8 incluyó una fase de preentrenamiento con billones de tokens y un posterior ajuste fino con instrucciones y preferencias humanas (RLHF/DPO), aunque los detalles exactos del dataset no se han publicado en la información disponible.

Sobre este modelo base, `0xSojalSec` aplicó la técnica de abliteration, que consiste en identificar y eliminar las direcciones en el espacio de activaciones responsables del comportamiento de rechazo. El resultado es un modelo que no se niega a responder a peticiones dañinas o controvertidas. Posteriormente, `mradermacher` generó cuantizaciones estáticas GGUF (sin imatrix) a partir de los pesos en safetensors. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset de la versión abliterated.

## Capacidades

- Generación de texto libre y continuaciones coherentes en inglés.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos, heredado del Qwen3.8 base.
- Generación de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling (capacidad nativa de Qwen3).
- Capacidades multimodales de visión si se utilizan los proyectores `mmproj` incluidos (procesamiento de imágenes).
- Ventana de contexto de 262 144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Ausencia de mecanismos de rechazo: responde a peticiones que los modelos alineados normalmente bloquean (contenido violento, ilegal, etc.), lo que la hace útil para análisis de riesgos.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo permite probar sistemas de moderación y detectar vulnerabilidades en pipelines de IA generativa, generando respuestas sin filtros que revelan posibles fallos de alineación.
- Investigación en alucinaciones: al carecer de restricciones, es posible estudiar cómo y cuándo el modelo inventa información falsa en contextos largos, comparando con versiones alineadas.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieren explorar temas tabú o controvertidos sin censura previa.
- Análisis de sesgos y comportamientos no deseados: al eliminar el refusal, se pueden exponer sesgos latentes en el modelo base, útiles para auditorías de equidad.
- Pruebas de robustez de sistemas de agentes: con su soporte de tool calling y contexto largo, se puede evaluar cómo un agente autónomo se comporta cuando recibe instrucciones maliciosas o ambiguas.
- Benchmarking de cuantización: los distintos niveles GGUF permiten medir el impacto de la pérdida de precisión en tareas de razonamiento y generación, útil para decidir el punto óptimo de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de HackerNoon menciona que existen evaluaciones comparativas, pero no se proporcionan cifras concretas en los materiales consultados. Se recomienda ejecutar pruebas propias (por ejemplo, MMLU, HumanEval, GSM8K) sobre la cuantización elegida para obtener datos fiables.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño del archivo + overhead de contexto):
  - Q2_K (11,0 GB): requiere al menos 14 GB de VRAM, cabe en RTX 4080/4090 (16/24 GB).
  - Q4_K_M (16,9 GB): requiere ~20 GB de VRAM, recomendable RTX 4090 (24 GB) o A5000.
  - Q6_K (22,5 GB): requiere ~26 GB, solo en GPUs profesionales como A100 40GB o RTX 6000 Ada.
  - Q8_0 (29,1 GB): requiere ~34 GB, necesaria A100 40GB/80GB o H100.
- Para contexto de 262K tokens, la memoria adicional puede superar los 10 GB, por lo que se recomienda reducir la ventana si se usa hardware limitado.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M, A100 40GB para Q6_K y Q8_0, H100 para máxima calidad.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama (importando el GGUF), LM Studio, y para safetensors: vLLM, TGI o Transformers con carga en 8 bits.
- En Apple Silicon, los quants Q4_K_M y Q5_K_M funcionan bien con MLX (el repo base incluye pesos MLX).
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens/s para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,32 B | 262 144 | Apache-2.0 | safetensors, GGUF | Alineado, con refusal |
| Qwen3.8-27B-full-Uncensored (este) | 27,32 B | 262 144 | Apache-2.0 | GGUF, safetensors, MLX | Abliterated, sin refusal |
| Llama-3.1-8B-Instruct-abliterated | 8,03 B | 131 072 | Llama 3.1 | GGUF | Menor tamaño, contexto menor, también abliterated |
| Mistral-7B-Instruct-abliterated | 7,24 B | 32 768 | Apache-2.0 | GGUF | Más ligero, contexto corto |

La comparativa se basa en características técnicas, ya que no hay benchmarks públicos para la versión uncensored. El Qwen3.8-27B destaca por su contexto de 262K y arquitectura híbrida, superando a las alternativas abliterated de menor tamaño en capacidad bruta, aunque con mayores requisitos de hardware.

## Limitaciones y advertencias

- Contenido potencialmente dañino: al eliminar el refusal, el modelo puede generar instrucciones para actividades ilegales, violencia, discurso de odio, etc. Su uso debe limitarse a entornos controlados de investigación.
- Sesgos y alucinaciones: al no estar alineado, es más propenso a inventar información y a reflejar sesgos presentes en los datos de entrenamiento sin filtro.
- Idioma: la model card indica únicamente inglés; aunque el modelo base soporta otros idiomas, la versión abliterated puede degradar el rendimiento en lenguas no inglesas.
- Cuantización estática: los quants GGUF no incluyen imatrix, por lo que la calidad puede ser ligeramente inferior a versiones con imatrix en niveles bajos (Q2_K, Q3_K).
- Restricciones de uso: aunque la licencia es Apache-2.0 (permite uso comercial), el propósito declarado es la investigación en seguridad. El blog de orcarouter advierte de un "research-only boundary"; se recomienda revisar las políticas del modelo base y las leyes locales antes de cualquier despliegue.
- Requisitos de memoria: el contexto de 262K tokens consume mucha VRAM adicional; en GPUs de 24 GB es necesario reducir la ventana a 32K-64K para evitar desbordamientos.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Qwen3.8-27B-full-Uncensored-GGUF
- Modelo base (abliterated): https://huggingface.co/0xSojalSec/Qwen3.8-27B-full-Uncensored
- Guía de ejecución local con llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Análisis del modelo abliterated: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Comparativa con otros modelos GGUF: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Página de solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
