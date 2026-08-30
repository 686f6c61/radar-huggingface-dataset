# lackonendes/PAW-27B-GGUF

## Resumen

PAW-27B es una cuantizacion trellis-coded de aproximadamente 2,17 bits por peso (bpw) del modelo Qwen/Qwen3.8-27B, desarrollada por lackonendes. Su objetivo es ejecutar un modelo de 27.000 millones de parametros en una unica GPU de 24 GB de VRAM manteniendo la ventana de contexto completa de 262.144 tokens, algo que no consiguen las cuantizaciones GGUF convencionales de densidad similar. Se distribuye como un unico archivo de 7,814 GB y alcanza entre 38 y 78 tokens por segundo en una RTX 3090.

No es un GGUF estandar: utiliza la arquitectura "paw-dense" y requiere el fork llama-paw de llama.cpp, por lo que no es compatible con herramientas habituales como Ollama, llama.cpp estandar o TGI. La decodificacion especulativa con el cabezal MTP del modelo padre acelera la generacion de 22,7 a 78,4 tokens por segundo sin perdida de calidad.

La relevancia del modelo radica en que demuestra que la cuantizacion trellis a densidades extremas (~2,17 bpw) puede superar a las alternativas IQ2XXS del mismo tamano en razonamiento general y generacion de codigo, manteniendo ademas el contexto completo de 256k. Se publica bajo licencia Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), formato "paw-dense" |
| Parametros totales | 5.616.706.048 (dato del archivo safetensors; el modelo base tiene 27.000 millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | PAW trellis-coded, ~2,17 bpw |
| Idiomas soportados | no especificado en la model card; heredados del modelo base Qwen3.8-27B |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (formato PAW trellis, requiere llama-paw) |

## Arquitectura y entrenamiento

PAW-27B no es un modelo entrenado desde cero, sino una cuantizacion del modelo Qwen3.8-27B de Alibaba, un transformer denso de 27.000 millones de parametros con ventana de contexto nativa de 262.144 tokens. La cuantizacion utiliza un esquema trellis-coded a aproximadamente 2,17 bits por peso, que codifica los pesos de forma estructurada para minimizar la perdida de precision frente a cuantizaciones convencionales de baja densidad como IQ2XXS.

El archivo resultante emplea la arquitectura "paw-dense" y no es legible por llama.cpp estandar: requiere el fork llama-paw. Una innovacion destacable es el uso de decodificacion especulativa con el cabezal MTP (multi-token prediction) del propio modelo padre, activable con `--spec-type draft-mtp`, que multiplica la velocidad de generacion por 3,5 sin perdida de calidad. El cache KV puede cuantizarse a q8_0 de forma gratuita con flash attention activada (`-fa on`).

No se dispone de informacion sobre el proceso de entrenamiento o ajuste del modelo base, ni sobre la metodologia exacta de la cuantizacion trellis mas alla de lo descrito en la model card.

## Capacidades

- Generacion de texto y razonamiento general: 58,6% en MMLU-Pro (500 items), superando a las alternativas IQ2XXS del mismo tamano.
- Generacion de codigo: 87,2% en HumanEval+ y 75,9% en MBPP+, con un defecto conocido que afecta a 8 prompts (ver limitaciones).
- Razonamiento matematico: 94% en GSM8K.
- Ventana de contexto de 262.144 tokens, util para documentos largos y conversaciones multi-turno extensas.
- Decodificacion especulativa con MTP head del modelo padre, sin perdida de calidad (22,7 a 78,4 tok/s).
- Soporte de tool calling y uso como agente, con la restriccion de descartar el razonamiento del historial entre turnos.
- Capacidades multilingues heredadas del modelo base Qwen3.8-27B (no especificadas en la model card).

## Casos de uso

- Asistente de codigo en estaciones de trabajo con una GPU: con 7,8 GB de archivo y 24 GB de VRAM, PAW-27B puede integrarse en entornos de desarrollo con una RTX 3090 o 4090 para generacion y autocompletado de codigo, superando en HumanEval+ a las cuantizaciones IQ2XXS del mismo modelo base.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite analizar manuales, contratos o codebases completos en una sola pasada, algo inviable con cuantizaciones que reducen el contexto.
- Desarrollo de agentes con tool calling: el modelo puede invocar funciones y herramientas, aunque requiere configuracion especifica (descartar el razonamiento del historial) para evitar bucles de repeticion.
- Tutoria de programacion y matematicas: con 94% en GSM8K y buen rendimiento en codigo, puede usarse como asistente educativo en hardware de consumo.
- Prototipado rapido de aplicaciones LLM: al caber en una GPU de 24 GB, permite iterar sobre aplicaciones de chat y RAG sin necesidad de infraestructura en la nube.
- Investigacion en cuantizacion extrema: como referencia de lo que es posible con trellis coding a 2,17 bpw, es util para estudios comparativos de tecnicas de compresion de modelos.

## Benchmarks y rendimiento

La model card incluye resultados medidos por el autor en una misma maquina con harness identicos, comparando PAW-27B con dos cuantizaciones IQ2XXS del mismo modelo base:

| Benchmark | PAW-27B | Unsloth IQ2XXS | AtomicChat AD-IQ2XXS |
|---|---:|---:|---:|
| Tamano del archivo | 7,814 GB | 7,266 GB | 8,977 GB |
| MMLU-Pro (500) | 58,6% | 46,2% | 53,0% |
| GSM8K (100) | 94% | 93% | 94% |
| HumanEval+ | 87,2% | 84,1% | 73,8% |
| MBPP+ | 75,9% | 72,8% | 71,7% |
| IFBench-64 strict | 23,44% | 14,06% | 20,31% |

El autor advierte que no existen cifras publicadas de HumanEval, MBPP o GSM8K para el modelo base Qwen3.8-27B sin cuantizar, por lo que no se puede calcular la retencion de rendimiento respecto al padre. La cifra de IFBench es un sentinel de 64 items, no el benchmark completo de 300 items, y no es comparable con el 79,5 oficial del modelo sin cuantizar. El rendimiento en contexto largo (191k-256k) solo se ha medido en velocidad y uso de memoria, no en calidad.

## Requisitos de hardware

- VRAM minima: 24 GB para ejecutar el modelo completo con contexto de 262.144 tokens.
- GPU recomendada: RTX 3090 (verificada por el autor); compatible con cualquier GPU de 24 GB o superior.
- Velocidad: 78,4 tokens/s en generacion corta; 47,8 tokens/s con contexto de codigo de 191k usando el drafter MTP; 22,7 tokens/s sin decodificacion especulativa.
- El archivo pesa 7,814 GB, por lo que cabe holgadamente en 24 GB de VRAM incluso con el cache KV en q8_0.
- Despliegue: requiere el fork llama-paw de llama.cpp; no es compatible con llama.cpp estandar, Ollama ni TGI.
- Configuracion recomendada: `-ub 2048` como limite superior con `-c 262144`, `-fa on` para flash attention, `--spec-type draft-mtp` para decodificacion especulativa y `--reasoning-budget 2048` para el modo de razonamiento.

## Comparativa con modelos similares

La comparativa mas directa es con las cuantizaciones IQ2XXS del mismo modelo base, ya que ocupan un tamano similar:

| Modelo | Tamano | MMLU-Pro | HumanEval+ | Contexto | Licencia |
|---|---:|---:|---:|---:|---|
| PAW-27B | 7,814 GB | 58,6% | 87,2% | 262.144 | Apache 2.0 |
| Unsloth IQ2XXS | 7,266 GB | 46,2% | 84,1% | 262.144 | Apache 2.0 |
| AtomicChat AD-IQ2XXS | 8,977 GB | 53,0% | 73,8% | 262.144 | Apache 2.0 |

PAW-27B supera a ambas alternativas en MMLU-Pro, HumanEval+ y MBPP+, con un archivo mas pequeno que AtomicChat y solo 0,5 GB mayor que Unsloth. La principal desvent
