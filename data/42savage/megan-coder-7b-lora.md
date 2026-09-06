# 42savage/MEGAN-Coder-7B-LoRA

## Resumen

MEGAN-Coder-7B-LoRA es un adaptador de bajo rango (LoRA) creado por el usuario 42savage para especializar el modelo base Qwen/Qwen2.5-Coder-7B-Instruct en tareas de generacion de codigo. Se entrena mediante QLoRA de 4 bits con el dataset flwrlabs/code-alpaca-20k, un conjunto de 20.000 instrucciones orientadas a programacion. El resultado no es un modelo completo, sino un conjunto de pesos PEFT que se anaden al modelo base, lo que reduce el coste de entrenamiento y el tamano del repositorio (1,0 GB).

El objetivo es mejorar el rendimiento en instrucciones de codigo e ingenieria de software sin reentrenar todo el modelo. Esto lo hace util como punto de partida para prototipos o escenarios donde no se dispone de recursos para un ajuste fino completo. La arquitectura subyacente es un transformer decoder-only, aunque la documentacion publicada no incluye la longitud de contexto, los parametros totales ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA (base: Qwen/Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | No disponible (el adaptador no publica el numero de parametros entrenables) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA 4-bit; los pesos del adaptador estan en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

MEGAN-Coder-7B-LoRA es un adaptador LoRA generado con la libreria PEFT. El modelo base es Qwen/Qwen2.5-Coder-7B-Instruct, un transformer decoder-only. Durante el entrenamiento se aplica QLoRA de 4 bits: el modelo base se cuantiza a 4 bits y solo se actualizan los parametros de los adaptadores, lo que reduce notablemente el consumo de VRAM y el coste computacional.

El dataset utilizado es flwrlabs/code-alpaca-20k, un conjunto de instrucciones de codigo. No se especifican el numero total de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que el entrenamiento corresponde a la "etapa 1" de una especializacion en instrucciones de codigo. Los metadatos con las revisiones exactas del modelo base y del dataset se guardan en megan_run_metadata.json.

## Capacidades

- Generacion de codigo y completado de fragmentos de programacion a partir de instrucciones en lenguaje natural.
- Asistencia en tareas de software engineering como generacion de funciones, clases o scripts.
- Comprension de instrucciones de tipo Alpaca (formato prompting del dataset code-alpaca-20k).
- No se ha verificado soporte de tool calling, agentes, razonamiento multimodal o vision en la documentacion publicada.
- Capacidades multilingues no disponibles.

## Casos de uso

- Asistente de programacion en IDE: puede integrarse como plugin local que cargue el modelo base y el adaptador para completar codigo o responder preguntas sobre el proyecto en tiempo real.
- Generacion de pruebas unitarias: dadas funciones existentes, el modelo puede sugerir casos de prueba; al estar especializado en instrucciones de codigo, responde mejor que un modelo generico a prompts de testing.
- Refactorizacion de codigo: se le pueden presentar bloques de codigo legacy y pedir versiones mas legibles o modernas, aprovechando su entrenamiento en instrucciones de programacion.
- Documentacion automatica: generar docstrings, comentarios y README de APIs a partir del codigo fuente, util para acelerar la documentacion interna.
- Explicacion de fragmentos de codigo: describir que hace un bloque de codigo de terceros, lo que facilita el onboarding y la revision de codigo.
- Generacion de scripts de automatizacion: crear scripts en Python o shell para infraestructura y pipelines de CI/CD, a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 1,0 GB, pero es necesario cargar el modelo base Qwen/Qwen2.5-Coder-7B-Instruct en memoria para la inferencia.
- Estimacion orientativa de VRAM: con cuantizacion 4-bit, el modelo base ocupa unos 5-6 GB; sumando el adaptador y los estados intermedios, se recomienda una GPU con 8-12 GB de VRAM. En precision FP16, el modelo base ronda los 14-16 GB, por lo que se necesitan GPUs de 24 GB o mas.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para FP16; A10G, L4 o A100 para despliegue en produccion.
- Puede ejecutarse en GPU de consumo como RTX 3060 12GB o RTX 4070 si se emplea cuantizacion 4-bit, aunque la latencia dependera del hardware.
- Opciones de despliegue: la integracion mas directa es con Transformers + PEFT. Para vLLM, llama.cpp u Ollama es necesario fusionar los pesos del adaptador con el modelo base y exportar el modelo resultante (o aplicar cuantizacion).
- No se disponen de datos de latencia o throughput publicados.

## Comparativa con modelos similares

Comparativa con modelos similares: no disponible. La unica comparacion posible a partir de la informacion disponible es con el modelo base del que deriva:

| Modelo | Tipo | Parametros | Dataset de ajuste | Licencia |
|---|---|---|---|---|
| MEGAN-Coder-7B-LoRA | Adaptador LoRA | No disponible | flwrlabs/code-alpaca-20k | Apache 2.0 |
| Qwen2.5-Coder-7B-Instruct (base) | Modelo completo | No disponible | No disponible | Apache 2.0 |

## Limitaciones y advertencias

- El modelo es un adaptador LoRA y no se puede usar de manera independiente; es imprescindible cargar el modelo base Qwen/Qwen2.5-Coder-7B-Instruct.
- El dataset de entrenamiento contiene 20.000 muestras, lo que limita la generalizacion fuera de tareas de codigo instruccionales.
- No se han publicado evaluaciones de sesgos, seguridad o alucinaciones.
- No se ha confirmado el soporte de tool calling, agentes o multimodalidad.
- La documentacion no especifica la longitud de contexto ni los idiomas soportados, lo que dificulta el despliegue en entornos multilingues con requisitos de contexto largo.
- La licencia Apache 2.0 del adaptador y del modelo base permite uso comercial, pero es necesario revisar las licencias de cualquier dataset o componente adicional.
- El entrenamiento esta etiquetado como "etapa 1"; no se han publicado los resultados de etapas posteriores.

## Enlaces

- https://huggingface.co/42savage/MEGAN-Coder-7B-LoRA
- https://huggingface.co/42savage
- https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- https://huggingface.co/datasets/flwrlabs/code-alpaca-20k
- https://huggingface.co/docs/peft
