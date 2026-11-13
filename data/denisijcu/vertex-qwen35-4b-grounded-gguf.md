# Denisijcu/vertex-qwen35-4b-grounded-gguf

## Resumen

vertex-qwen35-4b-grounded-gguf es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507, empaquetado en formato GGUF para su despliegue con llama.cpp y Ollama. Lo publica el usuario Denisijcu en Hugging Face y, segun la model card, el entrenamiento y la conversion a GGUF se realizaron con la herramienta Unsloth. El nombre sugiere un enfasis en respuestas "grounded" (ancladas a contexto), aunque la model card no documenta la composicion del dataset de ajuste ni el procedimiento exacto.

El modelo parte de la familia Qwen3 de Alibaba, de la que hereda una arquitectura transformer densa con aproximadamente 4.022 millones de parametros (4B). El repositorio incluye un unico archivo de pesos cuantizado en Q4_K_M y un Modelfile para Ollama, lo que facilita su ejecucion en hardware de consumo. Es relevante para desarrolladores que buscan un modelo pequeno, conversacional y desplegable localmente, aunque la ausencia de documentacion sobre el ajuste y de la licencia limita su evaluacion rigurosa.

La informacion publicada es muy escasa: no se detallan idiomas, licencia, contexto ni resultados de evaluacion. Esta ficha refleja unicamente los datos disponibles y marca explicitamente como "no disponible" todo aquello que la model card no especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3. La model card indica que el fine-tuning y la conversion a GGUF se hicieron con Unsloth, una libreria optimizada para entrenamiento y cuantizacion de bajo coste. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. El sufijo "grounded" del nombre sugiere un entrenamiento orientado a respuestas ancladas a contexto, pero no hay documentacion que lo confirme.

El unico artefacto de pesos publicado es `Qwen3-4B-Instruct-2507.Q4_K_M.gguf`, una cuantizacion de 4 bits en formato K-quant M. Se incluye un Modelfile de Ollama para despliegue directo. No se documentan innovaciones tecnicas adicionales del ajuste.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-4B-Instruct.
- Razonamiento y matematicas basicas propias de un modelo de 4B (sin datos de evaluacion publicados).
- Generacion de codigo (capacidad del modelo base, no verificada en este ajuste).
- Soporte de plantilla de chat mediante `--jinja` en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no documentadas en la model card.
- Tool calling / function calling: no documentado en este ajuste.
- Capacidades de agente o multi-step reasoning: no documentadas.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo cabe en un unico archivo Q4_K_M y se ejecuta con `llama-cli` u Ollama, lo que permite iterar rapidamente en un portatil con GPU de consumo.
- Respuestas ancladas a contexto (RAG ligero): el nombre "grounded" sugiere un ajuste orientado a ceñirse al contexto proporcionado, util para chatbots sobre documentacion interna, aunque la capacidad no esta verificada con benchmarks.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B en 4 bits, es adecuado para dispositivos con poca VRAM o incluso CPU.
- Integracion en pipelines de llama.cpp: el formato GGUF y la plantilla Jinja permiten incorporarlo a servicios existentes basados en llama.cpp.
- Experimentacion educativa: util para estudiar el efecto de un fine-tuning con Unsloth sobre un modelo Qwen3 pequeno.
- Pruebas de concepto de asistentes offline: al no requerir conexion, sirve para demos en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa aproximadamente 2,5 GB, por lo que la inferencia requiere del orden de 3-4 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.); en CPU funciona con llama.cpp.
- Cabe en GPU de consumo: si, en la mayoria de GPU modernas con 4 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vertex-qwen35-4b-grounded-gguf | 4B | no disponible | no disponible | GGUF Q4_K_M | Ajuste de Qwen3-4B con Unsloth |
| Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | Apache 2.0 (modelo base Qwen3) | safetensors, GGUF | Modelo base oficial de Alibaba |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa pequena de Meta |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Alternativa pequena de Microsoft |

Nota: los datos de los modelos comparables provienen de conocimiento general y no de la informacion proporcionada; verificar en sus respectivas model cards.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base Qwen3 y contactar con el autor.
- Documentacion minima: no hay informacion sobre el dataset de ajuste, lo que impide evaluar sesgos introducidos.
- Riesgo de alucinacion: inherente a modelos de 4B, especialmente en tareas de razonamiento complejo.
- Capacidad "grounded" no verificada: el nombre sugiere anclaje a contexto, pero no hay benchmarks que lo respalden.
- Idiomas no documentados: no se puede garantizar un rendimiento multilingue adecuado.
- Contexto no documentado: se desconoce la ventana efectiva del ajuste.
- Modelo con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-13): metadato anomalo que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/Denisijcu/vertex-qwen35-4b-grounded-gguf
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Modelo base Qwen3-4B-Instruct-2507: no disponible en la informacion proporcionada (referencia habitual: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
