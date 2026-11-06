# Muslim-Boy/ew-tutor-v2-qwen2.5-3b-GGUF

## Resumen

ew-tutor-v2-qwen2.5-3b-GGUF es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario Muslim-Boy en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El nombre del repositorio sugiere un propósito de tutor conversacional ("ew-tutor"), aunque la model card no documenta el dataset de entrenamiento ni el objetivo concreto del ajuste. El modelo se ha entrenado y convertido con la herramienta Unsloth, según indica el propio autor.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones). Se distribuye únicamente una cuantización Q4_K_M en GGUF, lo que reduce el peso del repositorio a 1,9 GB y permite su ejecución en hardware de consumo. Al estar basado en Qwen2.5, se beneficia del soporte nativo de chat template Jinja, tool calling y una ventana de contexto amplia, aunque el autor no especifica estos parámetros en la model card.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Es un artefacto de ajuste personal más que un modelo listo para producción, y debe evaluarse con cautela antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, pero el autor no lo confirma para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Qwen2.5-3B-Instruct.Q4_K_M.gguf) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal estándar (no se trata de un modelo MoE ni híbrido SSM). El ajuste fino se realizó con Unsloth, una librería que optimiza el entrenamiento mediante kernels personalizados y reduce el uso de memoria. El autor declara que el entrenamiento fue "2x más rápido" gracias a Unsloth, pero no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales sobre el modelo base.

No se documenta ninguna innovación técnica propia de este ajuste. Las capacidades técnicas (atención, tokenizador, chat template) son las heredadas de Qwen2.5-3B-Instruct, incluyendo el soporte de plantilla Jinja que el autor recomienda activar con el flag `--jinja` en llama.cpp. La conversión a GGUF se realizó con las herramientas estándar de llama.cpp integradas en Unsloth, y se incluye un Modelfile de Ollama para despliegue simplificado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (chat template Jinja).
- Soporte de tool calling / function calling: el modelo base Qwen2.5 lo incluye de forma nativa; el autor no confirma si el ajuste lo preserva.
- Capacidades multilingües: el modelo base Qwen2.5 soporta decenas de idiomas, pero el autor no declara idiomas para este ajuste.
- Ejecución local en CPU y GPU mediante llama.cpp, con soporte de `llama-cli` y `llama-mtmd-cli` (este último para modelos multimodales, aunque este modelo es solo texto).
- Despliegue vía Ollama mediante el Modelfile incluido.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Tutor conversacional educativo: el nombre del modelo ("ew-tutor") sugiere un uso previsto como asistente de aprendizaje. Se podría desplegar con Ollama para responder preguntas de estudiantes en un entorno local, aprovechando el bajo requisito de VRAM de la cuantización Q4_K_M.
- Prototipado rápido de chatbots: gracias al Modelfile de Ollama incluido, se puede levantar un endpoint de chat en minutos para validar flujos conversacionales antes de invertir en modelos mayores.
- Asistente de escritura offline: al ejecutarse en hardware de consumo, permite redactar y revisar textos sin conexión ni envío de datos a la nube, útil en entornos con requisitos de privacidad.
- Generación de código en local: hereda la capacidad de Qwen2.5 para tareas de programación, aunque la cuantización Q4_K_M y el tamaño de 3B limitan la complejidad de los problemas abordables; adecuado para autocompletado simple y explicaciones de fragmentos.
- Integración en pipelines de CI/CD para tareas de texto: clasificación, resumen o extracción de entidades en logs y documentación, ejecutándose en runners con GPU modesta o incluso CPU.
- Base para nuevos ajustes: al ser un GGUF derivado de Qwen2.5-3B, sirve como referencia de formato y plantilla para quien quiera replicar el flujo Unsloth → llama.cpp en modelos pequeños.
- Demostraciones educativas de fine-tuning: útil en cursos o talleres para ilustrar el ciclo completo de ajuste, cuantización y despliegue con Unsloth y Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no se dispone de comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0-2,5 GB con la cuantización Q4_K_M (archivo de 1,9 GB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). En GPUs de 8 GB o más (RTX 3060 Ti, RTX 4070, RTX 4090) se puede aumentar la ventana de contexto y el tamaño de batch.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU con RAM suficiente (2-3 GB).
- Opciones de despliegue: llama.cpp (`llama-cli` con `--jinja`), Ollama (Modelfile incluido), y cualquier frontend compatible con GGUF (LM Studio, Jan, text-generation-webui). No se documenta soporte para vLLM ni TGI, que requieren pesos en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ew-tutor-v2-qwen2.5-3b-GGUF | 3,09 B | no disponible | no disponible | GGUF (Q4_K_M) | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-3B-Instruct-GGUF | 3,09 B | 32.768 tokens (modelo base) | Apache 2.0 (modelo base) | GGUF (multiples cuantizaciones) | Hugging Face (oficial) |
| unsloth/Qwen2.5-VL-3B-Instruct-GGUF | 3 B | no disponible en la busqueda | Apache 2.0 (modelo base) | GGUF | Hugging Face |

La comparación directa más relevante es con el modelo base oficial Qwen2.5-3B-Instruct-GGUF, que ofrece licencia clara, múltiples cuantizaciones y documentación completa. Este ajuste no aporta información sobre mejoras medibles respecto al base, por lo que su valor añadido no está demostrado.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. El modelo base Qwen2.5-3B-Instruct es Apache 2.0, pero el autor no transfiere esa licencia explícitamente en este repositorio.
- Sin datos de entrenamiento: se desconoce el dataset, el número de tokens y si hubo RLHF/DPO, lo que impide evaluar sesgos introducidos por el ajuste.
- Riesgo de alucinación: inherente a modelos de 3B parámetros, especialmente en tareas de razonamiento complejo y matemáticas.
- Idiomas no declarados: aunque el base es multilingüe, no hay garantía de que el ajuste preserve el rendimiento en castellano u otros idiomas.
- Contexto no confirmado: no se especifica la ventana efectiva tras el ajuste; podría diferir de los 32.768 tokens del base.
- Cuantización única Q4_K_M: no hay opciones de mayor precisión (Q8, FP16) para evaluar la pérdida por cuantización.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan validar su calidad.
- Sin benchmarks: imposible comparar su rendimiento con el modelo base o alternativas.
- Modelo de un solo autor sin historial verificable: tratar como artefacto experimental, no como componente de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muslim-Boy/ew-tutor-v2-qwen2.5-3b-GGUF
- Modelo base oficial (GGUF): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF
- Variante VL de referencia: https://huggingface.co/unsloth/Qwen2.5-VL-3B-Instruct-GGUF
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
