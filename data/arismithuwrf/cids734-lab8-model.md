# AriSmithUWRF/CIDS734-Lab8-model

## Resumen

CIDS734-Lab8-model es un modelo de lenguaje conversacional derivado de Llama-3.2-3B-Instruct, afinado (fine-tuning) y posteriormente convertido a formato GGUF por el usuario AriSmithUWRF, presumiblemente en el contexto de la asignatura CIDS734 (laboratorio 8). El repositorio público contiene únicamente los pesos cuantizados en GGUF, concretamente el archivo `Llama-3.2-3B-Instruct.Q4_K_M.gguf`, y está orientado a su ejecución local mediante llama.cpp u Ollama.

El modelo conserva el tamano de la familia Llama-3.2-3B, con 3.212.749.888 parametros totales confirmados en los safetensors del repositorio original. Se trata, por tanto, de un transformer denso de aproximadamente 3B de parametros, adecuado para despliegue en hardware consumer. La model card no documenta el conjunto de datos de afinado, los hiperparametros ni los resultados de evaluacion, por lo que la trazabilidad tecnica es muy limitada.

Su relevancia practica es escasa fuera del ambito docente: no tiene descargas ni interacciones, no declara licencia ni idiomas soportados, y no se aportan benchmarks. Resulta util como ejemplo de pipeline de fine-tuning con Unsloth y exportacion a GGUF, pero no como modelo de produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3.2-3B-Instruct: no confirmada en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer denso decoder-only de Meta con normalizacion RMSNorm, atencion con RoPE y activacion SwiGLU, entrenado originalmente con un pipeline de alineamiento que incluye SFT y RLHF/DPO (detalles no confirmados en esta ficha). Sobre esa base, el autor aplico un fine-tuning adicional y lo convirtio a GGUF mediante Unsloth, herramienta que acelera el entrenamiento y la cuantizacion.

La model card indica que se ajusto el comportamiento del token BOS para garantizar la compatibilidad con GGUF, y que se incluye un Modelfile de Ollama. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como LoRA/QLoRA (aunque Unsloth suele implicar este tipo de adaptadores). Tampoco hay informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Razonamiento basico y respuesta a preguntas generales.
- Generacion de codigo y matematicas a nivel de un modelo de 3B (sin datos de evaluacion que lo confirmen).
- Soporte de plantilla de chat Jinja (`--jinja` en llama.cpp), lo que permite aplicar el chat template del modelo base.
- Compatibilidad con llama.cpp, llama-cli y llama-mtmd-cli (esta ultima mencionada en la model card, aunque no se confirma que el modelo sea multimodal).
- Integracion con Ollama mediante Modelfile incluido.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no declaradas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un GGUF Q4_K_M de ~3B, puede ejecutarse en un portatil con llama.cpp u Ollama para probar flujos de chat sin depender de la nube.
- Docencia y demostracion de pipelines de fine-tuning: sirve como ejemplo reproducible del flujo Unsloth + exportacion a GGUF descrito en la model card.
- Pruebas de integracion con llama.cpp: permite validar el uso de `llama-cli --jinja` y del chat template en un entorno controlado.
- Experimentos de cuantizacion: util para comparar el comportamiento de Q4_K_M frente al modelo base en tareas sencillas de generacion.
- Asistente offline en dispositivos con recursos limitados: su tamano permite inferencia en CPU o GPU consumer para tareas de baja criticidad.
- Base para fine-tuning adicional: al estar derivado de Llama-3.2-3B-Instruct, puede servir como punto de partida para adaptaciones especificas, siempre que se resuelva la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 2,0-2,5 GB para los pesos, mas overhead de contexto y KV cache (el repositorio ocupa 2,0 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) o incluso CPU con llama.cpp.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y potencialmente otros runners compatibles con GGUF; vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CIDS734-Lab8-model | 3,21B | no disponible | no disponible | GGUF Q4_K_M | Fine-tuning docente, sin benchmarks |
| Llama-3.2-3B-Instruct | 3,21B | 128k (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo base oficial, con evaluacion publica |
| Qwen2.5-3B-Instruct | ~3B | 32k (segun Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Alternativa con licencia permisiva |

Los datos de Llama-3.2-3B-Instruct y Qwen2.5-3B-Instruct corresponden a sus respectivas documentaciones publicas y no se han verificado en la informacion proporcionada para este modelo; se incluyen solo como referencia comparativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento tras el fine-tuning.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, el modelo base Llama-3.2 tiene su propia licencia que puede aplicar.
- Idiomas no declarados: se desconoce si el fine-tuning conserva el multilingueismo del modelo base.
- Contexto no documentado: no se confirma la ventana de contexto efectiva tras el ajuste.
- Riesgo de alucinacion: inherente a modelos de 3B, especialmente en tareas de razonamiento complejo.
- Sesgos: no evaluados; se heredan los del modelo base y los del dataset de fine-tuning (no documentado).
- Trazabilidad limitada: sin informacion sobre datos, hiperparametros ni proceso de evaluacion, dificil de auditar.
- Uso en produccion no recomendado sin evaluacion previa y sin aclarar la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/AriSmithUWRF/CIDS734-Lab8-model
- Unsloth (herramienta usada): https://github.com/unslothai/unsloth
- llama.cpp (runner compatible): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
