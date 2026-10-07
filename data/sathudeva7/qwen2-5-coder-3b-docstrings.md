# sathudeva7/qwen2.5-coder-3b-docstrings

## Resumen

`sathudeva7/qwen2.5-coder-3b-docstrings` es un ajuste fino por QLoRA del modelo `Qwen/Qwen2.5-Coder-3B-Instruct`, orientado a una unica tarea: generar docstrings de estilo Google para funciones Python. Lo desarrolla el usuario sathudeva7 dentro del repositorio `CDAZZDEV-MLE-SATHURSAN` (tarea `task2_genai`) y esta pensado como pieza especializada en un pipeline de documentacion automatica de codigo.

El modelo conserva la arquitectura original del base (transformer decoder-only de la familia Qwen2, aproximadamente 3,09 mil millones de parametros) y se obtiene fusionando los adaptadores con `merge_and_unload()`, de modo que se distribuye como un unico conjunto de pesos safetensors en bf16. El entrenamiento se realizo sobre un conjunto muy reducido de 212 funciones Python con docstrings verificados via AST.

Su relevancia es acotada y especifica: no compite como modelo de codigo generalista, sino como generador de documentacion tecnica determinista para funciones, con un contrato de uso claro (una funcion como mensaje de usuario mas un system prompt concreto, y el texto del docstring como respuesta). Es un ejemplo tipico de ajuste fino de nicho sobre un modelo abierto pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-Coder-3B-Instruct; no se especifica en la model card del ajuste) |
| Tipos de cuantizacion | safetensors en bf16; no se han publicado versiones GGUF, AWQ ni GPTQ del ajuste |
| Idiomas soportados | No disponibles en la model card; el modelo base esta orientado a codigo, con predominio del ingles |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen2.5-Coder-3B-Instruct`: un transformer decoder-only denso (sin mezcla de expertos) con aproximadamente 3,09 B de parametros, perteneciente a la serie Qwen2.5-Coder de Alibaba. La serie Qwen2.5-Coder se construye sobre la arquitectura Qwen2.5 y continua el preentrenamiento sobre un corpus de codigo de mas de 5,5 billones de tokens (dato del informe tecnico de la serie). El ajuste realizado aqui no introduce cambios arquitectonicos: solo se modifican los pesos mediante QLoRA y posterior fusion de adaptadores.

El entrenamiento del ajuste es deliberadamente pequeno: 212 funciones Python escritas por un profesor (teacher-written) con docstrings verificados mediante AST. Esto lo convierte en un ajuste de instruccion de un solo dominio (docstrings estilo Google). No se documenta en la model card el uso de RLHF, DPO ni fases adicionales de alineamiento. El repositorio ocupa 6,2 GB, coherente con la distribucion de los pesos fusionados en bf16.

## Capacidades

- Generacion de docstrings con formato Google para funciones Python.
- Entrada: una funcion Python como mensaje de usuario, acompanada del system prompt definido en `task2_genai/prompts.py`.
- Salida: el texto del docstring (no la funcion completa con comentarios insertados).
- Modelo conversacional (tag `conversational`) heredado del base Instruct.
- Capacidades de generacion de codigo generales del base, aunque el ajuste las sesga hacia la tarea de documentacion.
- Tool calling / function calling: no documentado en la model card (el base lo soporta, pero no se garantiza tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado para este ajuste.
- Capacidades multilingues: no especificadas para el ajuste.

## Casos de uso

- Documentacion automatica en CI/CD: integrar el modelo en un paso del pipeline que reciba cada funcion nueva y genere su docstring en formato Google, dejando el resultado para revision en el pull request.
- Enriquecimiento de librerias internas: recorrer un repositorio, extraer funciones sin docstring y poblar la documentacion de forma masiva antes de publicar un paquete.
- Generacion de docstrings para APIs de data science: aplicar el modelo a funciones de pandas, numpy o scikit-learn para producir documentacion consistente en un equipo.
- Soporte a revision de codigo: usar el docstring generado como borrador que el revisor humano valida, reduciendo el coste de escribir documentacion desde cero.
- Generacion de documentacion para SDKs: procesar funciones de un SDK Python y producir los docstrings que alimentaran autodoc de Sphinx o mkdocstrings.
- Prototipado educativo: disponer de un ejemplo reproducible de ajuste QLoRA de nicho con contrato de entrada/salida claro para experimentar con documentacion asistida por IA.
- Normalizacion de estilo de documentacion: unificar el formato de docstrings (Google style) en proyectos que hoy mezclan convenciones, aplicando el modelo funcion a funcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (HumanEval, MBPP, BLEU, ROUGE, exactitud de docstrings, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia en bf16/fp16: aproximadamente 6,2 GB solo de pesos, mas overhead de activaciones y cache KV (del orden de 8-10 GB de VRAM en total segun contexto).
- Inferencia cuantizada a 8 bits: alrededor de 3,5-4 GB de VRAM estimados.
- Inferencia cuantizada a 4 bits: alrededor de 2-2,5 GB de VRAM estimados.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para bf16; GPUs de 16 GB o mas (A100 40 GB, H100, L40S) para lotes grandes o contextos largos.
- Cabe en GPU consumer: si, con 8 GB o mas en bf16 y con 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` (libreria de referencia del repo), TGI (text-generation-inference, marcado como endpoints_compatible), vLLM. Para llama.cpp y Ollama seria necesario convertir el modelo a GGUF, ya que no se ofrecen pesos GGUF publicados.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sathudeva7/qwen2.5-coder-3b-docstrings | ~3,09 B | 32.768 tokens (heredado) | Docstrings Python estilo Google | qwen-research | HuggingFace, safetensors |
| Qwen/Qwen2.5-Coder-3B-Instruct | ~3,09 B | 32.768 tokens | Codigo e instrucciones generales | qwen-research | HuggingFace, safetensors (base del ajuste) |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7 B | 32.768 tokens | Codigo e instrucciones generales | qwen-research | HuggingFace, safetensors |
| Qwen/Qwen2.5-Coder-3B | ~3,09 B | 32.768 tokens | Modelo base de codigo | qwen-research | HuggingFace, safetensors |

No se dispone de modelos comparables especificos de generacion de docstrings en la informacion proporcionada. Las cifras de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- Entrenado con solo 212 funciones Python: alta probabilidad de sobreajuste al estilo y al dominio concretos del conjunto de entrenamiento.
- Riesgo de alucinacion: puede inventar parametros, tipos de retorno o comportamientos que no se corresponden con el cuerpo real de la funcion.
- Alcance limitado a Python y al formato de docstring Google; no esta pensado para otros lenguajes ni otros estilos (NumPy, reStructuredText).
- Uso atado a un contrato especifico: requiere el system prompt de `task2_genai/prompts.py` y una unica funcion como entrada; fuera de ese formato el comportamiento no esta garantizado.
- Sin datos publicados de evaluacion, por lo que no se puede cuantificar su fiabilidad en produccion.
- Licencia `qwen-research`: hay que revisar las condiciones del modelo base Qwen2.5-Coder para uso comercial antes de desplegarlo en un producto; la model card del ajuste remite a `LICENSE` con `license_name: qwen-research`.
- Sin descargas ni likes registrados: el modelo es practicamente inedito y no cuenta con validacion de la comunidad.
- Idiomas soportados no declarados: no se garantiza un comportamiento correcto en docstrings redactados en idiomas distintos del ingles.
- Sin versiones cuantizadas publicadas: desplegarlo en entornos ligeros exige convertir los pesos manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sathudeva7/qwen2.5-coder-3b-docstrings
- Repositorio de entrenamiento y evaluacion: https://github.com/sathudeva7/CDAZZDEV-MLE-SATHURSAN/tree/main/task2_genai
- System prompt de la tarea: https://github.com/sathudeva7/CDAZZDEV-MLE-SATHURSAN/blob/main/task2_genai/prompts.py
- Modelo base (Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Modelo base de codigo: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Informe tecnico Qwen2.5-Coder: https://arxiv.org/html/2409.12186v3
- Ficha del informe tecnico en catalyzex: https://www.catalyzex.com/paper/qwen2-5-coder-technical-report
