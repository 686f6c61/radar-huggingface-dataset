# br1-pist/Nemotron-3.5-Lightning-30B-AgentCoder

## Resumen

Nemotron-3.5-Lightning-30B-AgentCoder es un ajuste fino por RL del modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicado por Bruno Pistone (br1-pist) bajo la NVIDIA Open Model License. El objetivo es especializar el modelo en comportamiento agéntico multi-turno: decidir entre responder, invocar una herramienta o reaccionar a la salida de una herramienta en contextos de programación, gestión de datos y ejecución de shell.

La innovación principal es el método de entrenamiento: GRPO (Group Relative Policy Optimization) con RLAIF, donde un juez LLM puntúa cada continuación candidata contra una rúbrica y la ventaja se calcula respecto a la media del grupo, sin modelo de recompensa ni red de valor. Solo se entrenó el 0,1435 % de los pesos (45,4 M de 31,6 B), preservando la capacidad general del modelo base.

El modelo hereda la arquitectura híbrida Mamba-2/MoE del base Nemotron, con 31.577.937.344 parámetros totales y un repositorio de 63,2 GB en safetensors. Está orientado a inglés y su uso previsto son bucles agénticos con tool calling, no tareas de propósito general sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba-2 y MoE (tag `nemotron_h`, `mamba`, `moe`) |
| Parametros totales | 31.577.937.344 (31,6 B) |
| Parametros activos | no disponible (el nombre del base indica A3B, pero no se detalla en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-open-model-license (heredada del modelo base) |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, una arquitectura híbrida que combina capas Mamba-2 con mezcla de expertos. El código de modelado es personalizado: requiere `trust_remote_code=True` y, para las capas Mamba-2, los paquetes `mamba-ssm` y `causal-conv1d` compilados contra la versión de PyTorch instalada; sin ellos transformers recurre a una ruta pura de PyTorch mucho más lenta.

El post-entrenamiento se realizó en una sola fase de RLAIF con GRPO sobre puntos de decisión, no sobre diálogos completos: cada fila de entrenamiento es un estado real de conversación más el siguiente turno del asistente. El juez fue `moonshotai/Kimi-K3`, con rúbrica de 0 a 10 normalizada a 0-1 que premia la recogida de evidencia, la elección correcta de herramienta, el razonamiento de causa raíz y la verificación, y penaliza la especulación, las llamadas a herramientas equivocadas y el parcheo de síntomas. Las completaciones no puntuables (0,31 % del total) se excluyeron de la línea base del grupo en lugar de puntuarse como cero. Parámetros GRPO: grupo de 8 generaciones por prompt, beta (coeficiente KL) 0,01, pérdida DAPO con escalado de recompensa por grupo (varianza unitaria), lo que elimina el sesgo de longitud del GRPO vanilla. La temperatura de muestreo no está disponible en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base.
- Tool calling / function calling con plantilla de chat que renderiza herramientas mediante etiquetas `<tool_call>`, `<function=…>` y `<parameter=…>`.
- Bucles agénticos multi-turno: decidir entre responder, invocar herramienta y reaccionar a la salida de la herramienta.
- Razonamiento multi-paso orientado a recogida de evidencia, diagnóstico de causa raíz y verificación.
- Emisión de trazas de razonamiento en bloques `<think>`, con parser incluido (`nano_v3_reasoning_parser.py`) para separar razonamiento de respuesta final.
- Contextos de programación, gestión de datos y ejecución de shell.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Agentes de codificación en producción: el modelo puede alternar entre razonar, invocar herramientas de edición de ficheros y ejecutar comandos de shell dentro de un bucle agéntico, gracias al entrenamiento específico sobre puntos de decisión con tool calling.
- Automatización de operaciones sobre sistemas de ficheros: tareas como listar `/var/log` y resumir el fichero más grande, que el propio autor usa como ejemplo de uso directo, encajan con el perfil entrenado (shell + razonamiento sobre salida).
- Diagnóstico y causa raíz en pipelines de datos: la rúbrica de entrenamiento premia la recogida de evidencia y la verificación, lo que lo hace adecuado para tareas donde hay que inspeccionar resultados intermedios antes de concluir.
- Asistentes de CI/CD con herramientas: integración en flujos donde el modelo debe elegir entre consultar logs, lanzar tests o proponer un parche, con control humano sobre acciones irreversibles.
- Gestión de datos asistida: consultas y transformaciones donde el modelo encadena llamadas a herramientas de base de datos o scripts.
- Evaluación de agentes y generación de trayectorias: útil como política de referencia para estudiar comportamiento agéntico multi-turno, dado que el autor documenta métricas de entrenamiento (recompensa media, longitud de completación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas internas del entrenamiento:

| Metrica de entrenamiento | Antes | Despues |
|---|---|---|
| Recompensa media del juez | 0,412 | 0,618 (+50,1 %) |
| Completaciones excesivamente largas | 22,8 % | 4,4 % |
| Longitud media de completación | no disponible | ~40 % menor |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 31,6 B de parámetros, en BF16 se necesitan aproximadamente 63 GB de pesos, por encima de cualquier GPU de consumo individual.
- GPU recomendadas: no disponible en la información; por tamaño, un despliegue en BF16 requiere GPUs de clase A100/H100 de 80 GB o sharding multi-GPU.
- GPU de consumo: no cabe en BF16 en una sola GPU de consumo; no se documentan cuantizaciones publicadas (GGUF, AWQ, GPTQ) en la información disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True`; requiere `mamba-ssm` y `causal-conv1d` compilados contra PyTorch para evitar la ruta lenta. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento agéntico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-AgentCoder | 31,6 B | no disponible | GRPO + RLAIF sobre puntos de decisión | nvidia-open-model-license | Hugging Face (0 descargas) |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 31,6 B | no disponible | no (base) | nvidia-open-model-license | Hugging Face |
| Otros modelos de 30 B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al entrenarse solo en inglés, el comportamiento en otros idiomas no está validado.
- Riesgo de alucinación: el autor penaliza la especulación en la rúbrica, pero no se aportan evaluaciones externas de factualidad.
- Idiomas: solo inglés declarado; no hay soporte multilingüe verificado.
- Licencia: NVIDIA Open Model License, con términos específicos que deben revisarse antes de uso comercial; el repo marca `license: other`.
- Uso fuera de alcance según el autor: datos sensibles o confidenciales, dominios que exijan certificación experta, tareas con explicabilidad obligatoria y ejecución autónoma de acciones irreversibles sin revisión humana.
- Configuración de serving delicada: `generation_config.json` declara `eos_token_id: [2, 11]` y `pad_token_id: 11`, mientras `config.json` mantiene el escalar `eos_token_id: 2` del repo base; ignorar el id 11 hace que el modelo genere más allá del final de su respuesta.
- El export hereda `do_sample: true, temperature: 1.0, top_p: 1.0`; para evaluación o salida estructurada hay que fijar la decodificación explícitamente.
- No hay `vocab.json`: el tokenizer carga desde `tokenizer.json` con `TokenizersBackend`, lo cual es esperado.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni reportes independientes de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/br1-pist/Nemotron-3.5-Lightning-30B-AgentCoder
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper o blog de GRPO/DAPO: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
