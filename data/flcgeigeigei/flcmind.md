# FLCgeigeigei/flcmind

## Resumen

FLCMind es una familia de modelos de lenguaje de tipo Llama implementada desde cero en PyTorch puro por el desarrollador independiente FLCgeigeigei, sin dependencias de `transformers`, `peft` ni `trl`. Se distribuye en dos variantes: un modelo denso de aproximadamente 65M de parametros y una variante MoE de aproximadamente 200M de parametros totales con 4 expertos y enrutamiento Top-1, lo que resulta en unos 65M de parametros activos por token. El proyecto cubre el ciclo completo: tokenizador BPE propio (vocabulario de 6400 tokens), preentrenamiento, SFT de parametros completos y servido con API compatible con OpenAI.

El modelo esta pensado como proyecto educativo y de investigacion, no como un modelo de produccion de proposito general. Con 64M de parametros y un vocabulario reducido, su rendimiento en tareas de conocimiento (C-Eval, CMMLU) se situa en el rango del azar estadistico (25%), en linea con otros modelos de su clase de tamano como GPT2-Chinese-Distil-60M o SmolLM2-135M. Su interes tecnico reside en la implementacion limpia y legible de la arquitectura Llama moderna (RMSNorm, RoPE, GQA, SwiGLU) y en la comparacion controlada entre una variante densa y una MoE con el mismo numero de parametros activos.

Los checkpoints publicados son exclusivamente de SFT y soportan conversaciones multi-turno. No se incluye checkpoint de solo preentrenamiento. El repositorio ocupa 0,5 GB e incluye los pesos, el codigo del modelo y el tokenizador, de modo que no es necesario clonar el repositorio de GitHub para cargar los pesos, aunque si para usar los scripts de entrenamiento y servido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (RMSNorm, RoPE, GQA, SwiGLU) con FFN densa o MoE opcional |
| Parametros totales | 63,9M (denso) / 198,4M (MoE) |
| Parametros activos | 63,9M (MoE, 4 expertos Top-1) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp16 para inferencia; no se documentan formatos cuantizados) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | PyTorch `state_dict` en `.pth` (`full_sft_768.pth`, `moe_sft_768_moe.pth`) |
| Tamano del repositorio | 0,5 GB |
| Tokenizador | BPE propio, vocabulario de 6400 tokens |
| Compatibilidad con transformers | No (`AutoModelForCausalLM.from_pretrained` no funciona; requiere `model_flcmind.py`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Llama moderno: normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), atencion con query grouping (GQA) y activacion SwiGLU en la FFN. La variante MoE sustituye la FFN por una capa con 4 expertos y enrutamiento Top-1, de modo que cada token activa un unico experto y el coste computacional por token se mantiene equiparable al del modelo denso. La configuracion densa usa `hidden_size=768` y 8 capas.

El entrenamiento se realizo en tres fases: tokenizador BPE entrenado junto con el modelo, preentrenamiento y SFT de parametros completos. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El entrenamiento cabe en aproximadamente 6 GB de VRAM, lo que permite reproducirlo en una GPU de consumo. No se mencionan innovaciones como decodificacion especulativa o atencion lineal; la contribucion principal es la implementacion desde cero y la comparacion denso frente a MoE con parametros activos equivalentes.

## Capacidades

- Generacion de texto y conversacion multi-turno en chino e ingles (checkpoints SFT).
- Razonamiento basico y respuesta a preguntas de opcion multiple, con rendimiento proximo al azar en tareas de conocimiento.
- Modelado de lenguaje: la variante MoE reduce la perplejidad un 34% respecto a la densa (170,8 a 112,2) con el mismo numero de parametros activos.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`) con soporte de streaming.
- Inferencia en CPU y en GPU; no requiere `transformers`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Estudio de arquitecturas LLM: el codigo implementa desde cero RMSNorm, RoPE, GQA, SwiGLU y MoE, lo que lo convierte en material didactico para entender cada componente sin la abstraccion de `transformers`.
- Comparacion denso frente a MoE en condiciones controladas: ambas variantes comparten tokenizador, datos y parametros activos, lo que permite aislar el efecto del enrutamiento por expertos en perplejidad y latencia.
- Prototipado rapido de pipelines de chat: el servidor compatible con OpenAI permite integrar el modelo en clientes existentes cambiando solo la `base_url`, sin reescribir codigo de integracion.
- Experimentos de entrenamiento con recursos limitados: el entrenamiento cabe en unos 6 GB de VRAM, lo que posibilita reproducir el pipeline completo (tokenizador, preentrenamiento, SFT) en una unica GPU de consumo.
- Pruebas de inferencia en CPU: con 0,2 GB de VRAM equivalente en fp16 para la variante densa, el modelo puede ejecutarse en entornos sin GPU para validar flujos de servido y formateo de prompts.
- Investigacion sobre tokenizadores de vocabulario reducido: el BPE de 6400 tokens permite estudiar el compromiso entre tamano de vocabulario, cobertura linguistica y rendimiento en tareas de conocimiento en modelos pequenos.

## Benchmarks y rendimiento

Resultados medidos en una RTX 4090 en fp16, 5-shot, con formato de prompt de completado y la misma regla de puntuacion por log-probabilidad de letra para todos los modelos. n = 1346 (C-Eval, split de validacion completo) y 1340 (CMMLU); el margen es la semianchura del intervalo de confianza de Wilson al 95%. La perplejidad se calcula por token sobre prompts de C-Eval y solo es comparable entre modelos con el mismo tokenizador.

| Modelo | Parametros (total / activos) | C-Eval 5-shot | CMMLU 5-shot | PPL | Decodificacion (tok/s) | VRAM (GB) |
|---|---|---|---|---|---|---|
| FLCMind-Dense-SFT | 63,9M | 26,3 ± 2,3 | 24,7 ± 2,3 | 170,8 | 161 | 0,2 |
| FLCMind-MoE-SFT | 198,4M / 63,9M | 25,2 ± 2,3 | 23,8 ± 2,3 | 112,2 | 111 | 0,4 |
| GPT2-Chinese-Distil-60M | 59,5M | 23,0 ± 2,2 | 24,4 ± 2,3 | no disponible | 398 | 0,2 |
| Wenzhong-GPT2-110M | 124,5M | 27,9 ± 2,4 | 24,6 ± 2,3 | no disponible | 218 | 0,4 |
| SmolLM2-135M | 134,5M | 22,7 ± 2,2 | 25,0 ± 2,3 | no disponible | 68 | 0,3 |
| SmolLM2-1.7B | 1,71B | 33,2 ± 2,5 | 32,8 ± 2,5 | no disponible | 85 | 3,5 |

La adivinacion aleatoria entre cuatro opciones es 25,0%. Todos los modelos del rango 60-135M se situan entre el 22% y el 28%, por lo que FLCMind esta en linea con su clase de tamano. La decodificacion es throughput de peticion unica (batch size 1, 32 tokens generados, fp16), no una cifra de servido con batching.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,2 GB (denso) y 0,4 GB (MoE) en fp16, segun las mediciones del autor en RTX 4090.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor reporta mediciones en RTX 4090. Tambien funciona en CPU.
- Cabe en cualquier GPU de consumo, incluida la gama de entrada, y en entornos sin GPU.
- Entrenamiento: aproximadamente 6 GB de VRAM, viable en GPUs de consumo como RTX 3060 de 12 GB o superiores.
- Opciones de despliegue: servidor propio incluido en el repositorio (`scripts/serve_openai_api.py`) con API compatible con OpenAI y streaming. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y los pesos no son compatibles con `transformers`.
- Latencia y throughput: 161 tok/s (denso) y 111 tok/s (MoE) en decodificacion de peticion unica en RTX 4090 fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | C-Eval 5-shot | CMMLU 5-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLCMind-Dense-SFT | 63,9M | no disponible | 26,3 | 24,7 | other | Hugging Face |
| FLCMind-MoE-SFT | 198,4M / 63,9M activos | no disponible | 25,2 | 23,8 | other | Hugging Face |
| GPT2-Chinese-Distil-60M | 59,5M | no disponible | 23,0 | 24,4 | no disponible | no disponible |
| Wenzhong-GPT2-110M | 124,5M | no disponible | 27,9 | 24,6 | no disponible | no disponible |
| SmolLM2-135M | 134,5M | no disponible | 22,7 | 25,0 | no disponible | no disponible |

Las cifras de los modelos de referencia fueron medidas por el autor con el mismo protocolo, no son valores reportados por sus desarrolladores. Los modelos basados en `BertTokenizer` no pueden codificar `A/B/C/D` como tokens unicos, por lo que su puntuacion es un suelo.

## Limitaciones y advertencias

- Rendimiento en tareas de conocimiento proximo al azar (25%): con 64M de parametros y un vocabulario de 6400 tokens, las preguntas de opcion multiple basadas en conocimiento son practicamente irresolubles.
- No es compatible con `transformers`: requiere el archivo `model_flcmind.py` y cargar el `state_dict` manualmente; no existe atajo via `trust_remote_code`.
- Los scripts resuelven rutas relativas a su propia ubicacion, por lo que los archivos deben copiarse a los directorios que espera el proyecto.
- `temperature=0` provoca una division por cero en el muestreador y puede dejar el contexto CUDA corrupto hasta reiniciar el servidor; debe usarse una temperatura positiva (por ejemplo, 0,7).
- No se incluye checkpoint de solo preentrenamiento; los pesos publicados son exclusivamente SFT.
- No se documenta la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.
- Licencia "other" sin terminos detallados: es necesario contactar con el autor o revisar el repositorio antes de un uso comercial.
- Riesgo de alucinacion elevado por el reducido tamano del modelo y la limitada cobertura de conocimiento.
- Sesgos no documentados; el entrenamiento se limita a chino e ingles, sin soporte declarado de otros idiomas.
- Proyecto de autor individual con 0 descargas en el momento de la consulta: no hay garantia de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FLCgeigeigei/flcmind
- Repositorio GitHub (scripts de entrenamiento, pipeline de datos y servido): https://github.com/FLCgeigei/flcmind
