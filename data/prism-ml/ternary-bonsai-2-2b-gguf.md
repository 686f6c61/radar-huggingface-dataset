# prism-ml/Ternary-Bonsai-2-2B-gguf

## Resumen

Ternary-Bonsai-2-2B es un modelo vision-lenguaje de unos 1.880 millones de parametros en el modulo de lenguaje mas unos 330 millones en la torre de vision, desarrollado por Prism ML. Se trata de una cuantizacion ternaria (pesos restringidos a {-1, 0, +1} con escalas FP16 por grupo) del modelo base Qwen3.5-2B, distribuida en formato GGUF para su ejecucion en llama.cpp sobre CUDA, Metal y CPU. La innovacion principal es que los pesos ternarios se almacenan empaquetados y se consumen directamente por kernels personalizados, sin expandirse nunca a FP16, lo que reduce el modulo de lenguaje de aproximadamente 3,8 GB en FP16 a entre 0,43 y 0,55 GB segun el empaquetado.

El modelo hereda del backbone Qwen3.5-2B una arquitectura de atencion hibrida (18 capas de atencion lineal y 6 de atencion completa, en proporcion 3:1) y una ventana de contexto de 262.144 tokens, ademas de una torre de vision opcional que se carga solo cuando llega una imagen. Esta orientado a despliegue en dispositivo (on-device) y entornos con recursos muy limitados, donde un modelo de 2B en FP16 no cabria con comodidad.

Su relevancia actual radica en la combinacion de tres factores poco habituales: cuantizacion ternaria real con kernels nativos, contexto extremadamente largo para su tamano y capacidades multimodales, todo bajo licencia Apache 2.0. Con mas de 1,4 millones de descargas en Hugging Face, se ha convertido en una referencia practica para experimentar con inferencia de muy baja precision en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y atencion completa (3:1), SwiGLU MLP, RoPE, RMSNorm; torre de vision separada |
| Parametros totales | 1.881.825.088 en el modulo de lenguaje (dato de safetensors); ~0,33B adicionales en la torre de vision |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3.5-2B) |
| Tipos de cuantizacion | Ternaria {-1, 0, +1} con escalas FP16 por grupo; empaquetados PTQ1_0 (~1,83 bits/peso), PQ2_0 (~2,20 bits/peso) y Q2_0 (~2,33 bits/peso); tensores de normalizacion y ruta de estado de atencion lineal en F32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); torre de vision en mmproj Q8_0 o BF16 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-2B sin cambios estructurales: 24 bloques con dimension oculta de 2048, embedding y cabeza LM compartidos (tied), y un esquema de atencion hibrida en el que tres de cada cuatro capas usan atencion lineal y la restante atencion completa. Esta mezcla es la que permite sostener un contexto de 262.144 tokens con un coste de memoria y computo mucho menor que un transformer de atencion completa equivalente. La torre de vision consta de 24 bloques y se distribuye como un paquete mmproj independiente, de modo que el modelo de lenguaje puede ejecutarse solo cuando no se necesita entrada visual.

La particularidad tecnica es la cuantizacion ternaria: los pesos de embeddings, proyecciones de atencion, proyecciones MLP y la cabeza LM se almacenan como trits empaquetados con una escala FP16 por grupo. Antes del almacenamiento se aplica una rotacion de Hadamard por bloques que queda plegada en los pesos, y el runtime aplica la transformacion correspondiente a las activaciones; por eso las builds antiguas de llama.cpp producen salidas incorrectas sin aviso. Los tres empaquetados (PTQ1_0, PQ2_0, Q2_0) contienen exactamente los mismos pesos ternarios y difieren solo en el layout de almacenamiento y en la velocidad de los kernels. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con plantilla de chat compatible con el servidor OpenAI de llama.cpp.
- Comprension de imagenes y respuesta texto-imagen (pipeline image-text-to-text), incluyendo descripcion de imagenes y lectura de texto en imagenes.
- Modo de razonamiento controlable mediante `enable_thinking` en los kwargs de la plantilla de chat.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- Ejecucion en CUDA, Metal y CPU a traves de llama.cpp, con soporte de aceleracion por GPU mediante `-ngl`.
- Compatibilidad con el endpoint `/v1/chat/completions` de llama-server, incluyendo entrada de imagenes por URL.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de vision en dispositivo: con el modulo de lenguaje en PQ2_0 (0,52 GB) y el mmproj Q8_0 (0,36 GB), el conjunto cabe en menos de 1 GB de pesos y puede desplegarse en portatiles o mini-PC para describir imagenes, leer capturas o interpretar documentos escaneados sin conexion.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite pasar contratos, informes o libros completos en una sola peticion, algo inusual en modelos de 2B y util para resumen y extraccion de datos en local.
- Servidor local compatible con OpenAI: llama-server expone `/v1/chat/completions`, de modo que se puede sustituir una API remota por este modelo en prototipos y herramientas que ya usan el formato OpenAI, con coste cero por token.
- Analisis de imagenes en pipelines de automatizacion: mediante `llama-mtmd-cli` o el servidor, se pueden encadenar pasos de OCR asistido y clasificacion de imagenes en scripts de escritorio o CI, ajustando `--image-min-tokens` para texto denso.
- Chat multi-turno con memoria extensa: gracias al contexto heredado, un asistente de soporte o de estudio puede mantener conversaciones muy largas sin truncar el historial, con un consumo de memoria contenido por la atencion lineal.
- Experimentacion e investigacion en cuantizacion ternaria: los tres empaquetados permiten comparar precision y velocidad de kernels PTQ1_0, PQ2_0 y Q2_0 sobre los mismos pesos, util para estudiar el impacto del layout en la latencia.
- Despliegue en hardware embebido o de bajo consumo: al ejecutarse en CPU y Metal, el modelo sirve para demos y prototipos en equipos sin GPU dedicada, donde un 2B en FP16 no seria viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modulo de lenguaje ocupan entre 0,43 GB (PTQ1_0) y 0,55 GB (Q2_0); anadiendo el mmproj Q8_0 (0,36 GB) el total ronda 0,8-0,9 GB de pesos. A ello hay que sumar la cache KV, que crece con el contexto configurado y con el que hay que dimensionar la memoria real.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal; el modelo esta pensado para ser ligero, por lo que no requiere A100 ni H100. Una RTX 4090 o una GPU de portatil moderna son mas que suficientes para los pesos.
- Cabe en GPU de consumo: si, con amplio margen; tambien en iGPU con Metal y en CPU pura.
- Opciones de despliegue: llama.cpp (fork PrismML-Eng/llama.cpp, rama `prism`, para PTQ1_0, PQ2_0 y Q2_0) y llama.cpp upstream desde la build b11556 para el archivo Q2_0. Se puede usar `llama-cli`, `llama-mtmd-cli` y `llama-server` con API compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que los tres empaquetados difieren en velocidad de kernel, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-2B | ~1,88B + ~0,33B vision | 262.144 | Si (mmproj opcional) | Apache 2.0 | GGUF ternario, llama.cpp |
| Qwen3.5-2B (base) | ~2B | 262.144 | Segun variante del base | No disponible | Safetensors / GGUF estandar |
| Modelos 2B en Q4_K_M (referencia generica) | ~2B | Depende del base | Depende del base | Depende del base | GGUF, llama.cpp |

La comparacion directa con alternativas concretas no esta disponible en la informacion proporcionada; el unico punto de referencia documentado es el propio Qwen3.5-2B, del que este modelo hereda arquitectura y contexto pero reduce el tamano de pesos aproximadamente a una septima parte respecto a FP16.

## Limitaciones y advertencias

- La cuantizacion ternaria degrada la precision respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Requiere builds especificas: las versiones de llama.cpp anteriores a b11556 no implementan la transformacion de Hadamard y generan salidas incorrectas sin emitir ningun aviso.
- PTQ1_0 y PQ2_0 solo funcionan con el fork PrismML-Eng/llama.cpp; el llama.cpp upstream unicamente acepta Q2_0.
- El mmproj BF16 puede provocar caidas de llama-server con varias peticiones de imagen concurrentes; el autor recomienda Q8_0.
- Riesgo de alucinacion inherente a un modelo de 2B, especialmente en tareas de razonamiento complejo, matematicas o lectura de texto muy denso en imagenes.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue homogeneo.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B puede tener condiciones adicionales que conviene verificar antes de un despliegue en produccion.
- El contexto maximo de 262.144 tokens exige planificar la cache KV; en la practica conviene limitar `-c` al caso de uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Web de Prism ML: https://prismml.com
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Releases del fork: https://github.com/PrismML-Eng/llama.cpp/releases/latest
- llama.cpp upstream, build b11556: https://github.com/ggml-org/llama.cpp/releases/tag/b11556
- Discord de Prism ML: https://discord.gg/prismml
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
