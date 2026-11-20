# orcarouter/OrcaSAQ-2-27B

## Resumen

OrcaSAQ-2-27B es un checkpoint cuantizado de Qwen3.8-27B desarrollado por OrcaRouter mediante su sistema propietario OrcaSAQ2, una técnica de cuantización de precisión mixta sensible a la sensibilidad de cada capa. El modelo comprime el checkpoint BF16 original de 54 GB hasta 12,3 GB (una reducción del 77,2 %), manteniendo una precisión media de 3,21 bits por peso en el decodificador, con una degradación de perplejidad de solo +0,02 % respecto al modelo de referencia y un 93,2 % de acuerdo Top-1 a nivel de token.

El objetivo declarado del autor es preservar el comportamiento útil del modelo dentro de un sobre de memoria de GPU práctico, orientado específicamente a agentes de horizonte largo, uso de herramientas y razonamiento multi-paso. Mantiene la ventana de contexto de 262K tokens del modelo base, el modo thinking y el soporte de function calling, además de decodificación especulativa MTP (multi-token prediction).

Es relevante ahora porque permite desplegar un modelo de razonamiento de clase 27B en hardware mucho más modesto sin renunciar al contexto largo, un factor crítico en cargas agénticas donde los errores pequeños se acumulan a lo largo de la trayectoria y alteran el estado del entorno. La licencia es Apache 2.0 y el formato de pesos es safetensors, servido mediante vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), cuantizacion de precision mixta OrcaSAQ2 |
| Parametros totales | 6.770.790.400 (segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | Precision mixta a 3,21 bits por peso de media (decodificador); checkpoint unico safetensors |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (12,3 GB), libreria vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen3.8-27B, no un entrenamiento desde cero. La arquitectura subyacente es un transformer decoder-only de la familia Qwen, con soporte de modo thinking, function calling y decodificacion especulativa MTP. OrcaSAQ2 aplica precision mixta asignando distinto numero de bits por capa segun su sensibilidad, con una media de 3,21 bits por peso en el decodificador, en lugar de una cuantizacion uniforme de 3 bits.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base, ya que la model card se centra en la metodologia de cuantizacion. Las metricas de fidelidad publicadas se midieron con estos mismos pesos frente a la referencia BF16 a traves de la misma ruta de evaluacion: sobre WikiText-2 con 16.376 tokens predichos, la perplejidad pasa de 5,6468 (BF16) a 5,6482 (OrcaSAQ2), con KLD media de 0,031 y acuerdo Top-1 del 93,2 %.

## Capacidades

- Generacion de texto y razonamiento con modo thinking.
- Codigo y matematicas, heredados del modelo base Qwen3.8-27B.
- Function calling y tool calling.
- Ejecucion agéntica multi-paso y de horizonte largo (planificar, actuar, observar, decidir, recuperar).
- Contexto largo de 262K tokens para trayectorias y documentos extensos.
- Decodificacion especulativa MTP para acelerar la inferencia.
- Multilingue limitado a ingles y chino.
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Agentes de horizonte largo: el modelo puede mantener el estado de una tarea a lo largo de muchas iteraciones de planificar-actuar-observar gracias a sus 262K tokens de contexto, y la alta fidelidad Top-1 (93,2 %) reduce la probabilidad de que un error de token desvie una llamada a herramienta y cambie el estado del entorno.
- Automatizacion de tool calling en produccion: al soportar function calling y desplegarse en vLLM, se integra en pipelines que invocan APIs, bases de datos o servicios internos con un sobre de memoria de 12,3 GB.
- Asistentes de codigo en entornos con GPU limitada: permite servir un modelo de razonamiento de clase 27B en una sola GPU de 24 GB, algo inviable con el BF16 de 54 GB.
- Analisis de documentos largos: la ventana de 262K tokens permite procesar repositorios, informes o historiales completos sin trocear el contexto.
- Razonamiento con modo thinking para tareas de varios pasos donde se requiere una cadena de pensamiento antes de la respuesta final.
- Despliegue en infraestructura propia con vLLM y decodificacion especulativa MTP para mejorar el throughput en cargas concurrentes.

## Benchmarks y rendimiento

| Metrica | Qwen3.8-27B BF16 | OrcaSAQ-2-27B |
|---|---:|---:|
| Tamano del checkpoint | 54 GB | 12,3 GB |
| Precision del decodificador | 16 bits | 3,21 bpw media |
| Perplejidad (WikiText-2) | 5,6468 | 5,6482 |
| Delta de perplejidad | — | +0,02 % |
| Acuerdo Top-1 | 100 % | 93,2 % |
| KLD media | — | 0,031 |
| Contexto | 262K | 262K |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; las unicas metricas publicadas son de fidelidad respecto al BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,3 GB solo para los pesos, mas overhead de KV cache y activaciones; con contexto de 262K el KV cache puede crecer de forma significativa.
- GPU recomendadas: una GPU con 24 GB o mas permite servir el modelo con margen para contexto moderado; para contexto cercano a 262K se recomienda 48-80 GB (A100 80 GB, H100).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090, con margen limitado para contextos muy largos.
- Opciones de despliegue: vLLM es la libreria indicada por el autor; no se confirma soporte de llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el autor menciona decodificacion especulativa MTP como acelerador, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OrcaSAQ-2-27B | 6,77B (segun safetensors) | 262K | safetensors 3,21 bpw | Apache 2.0 | Cuantizacion de Qwen3.8-27B |
| Qwen3.8-27B (BF16) | no disponible | 262K | BF16, 54 GB | Apache 2.0 (heredada) | Modelo base de referencia |
| Otras cuantizaciones de Qwen3.8-27B | no disponible | 262K | GGUF/AWQ/etc. | segun autor | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento funcional con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible de fidelidad: 93,2 % de acuerdo Top-1 implica que aproximadamente 6,8 de cada 100 tokens predichos difieren del BF16, lo que puede acumularse en trayectorias agénticas largas.
- Solo soporta ingles y chino; no hay soporte declarado de castellano.
- No se han publicado benchmarks de tareas, por lo que el rendimiento real en codigo, matematicas o razonamiento no esta verificado de forma independiente.
- El KV cache con contexto de 262K puede consumir mas VRAM que los propios pesos; conviene dimensionar el hardware para el contexto real de uso.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- El sistema OrcaSAQ2 es propietario; la reproducibilidad de la cuantizacion no esta garantizada.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/OrcaSAQ-2-27B
- OrcaRouter: https://www.orcarouter.ai
- Modelos de OrcaRouter: https://www.orcarouter.ai/models
- GitHub: https://github.com/Continuum-AI-Corp
- X: https://x.com/OrcaRouter
- Discord: https://discord.gg/yAh6Tex6kx
