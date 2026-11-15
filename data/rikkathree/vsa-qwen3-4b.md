# rikkathree/vsa-qwen3-4b

## Resumen

VSA-Qwen3-4B v2 es un modelo de lenguaje de 4.000 millones de parametros derivado de Qwen/Qwen3-4B mediante una tecnica de retrofitting arquitectonico que sustituye la atencion softmax clasica por un esquema hibrido denominado Bolt Attention. Desarrollado por el autor independiente rikkathree, el modelo combina 26 capas con atencion lineal VSA (Vector Symbolic Architecture) y 10 capas con atencion softmax que actuan como anclas, manteniendo la capa L0 y una capa softmax cada cuatro. El objetivo declarado es reducir el coste de memoria de estado y KV en contextos largos sin degradar de forma estadisticamente significativa las capacidades del modelo donante.

La propuesta encaja en la linea de trabajo de atencion lineal y modelos hibridos (RetNet, Lightning Attention-2, MiniMax-01) aplicada como post-entrenamiento sobre un transformer denso ya existente, en lugar de entrenar desde cero. Segun la model card, el modelo reduce un 71,3% la RAM de estado y KV a 65.536 tokens de contexto y acelera la decodificacion 1,57x en ese mismo regimen, manteniendose estadisticamente empatado con Qwen3-4B en 6 de 7 benchmarks de UK AISI Inspect (N=200, McNemar exacto pareado).

El modelo se distribuye como checkpoint PyTorch (`.pth`) de aproximadamente 76 GB de repositorio y requiere el toolkit propio vsa-lm para cargarse y ejecutarse; no es compatible de forma nativa con transformers, vLLM ni llama.cpp. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Bolt Attention: 26 capas de atencion lineal VSA + 10 capas softmax ancla (L0 + cada 4 capas), ventana SWA de 256 tokens |
| Parametros totales | 4.000 millones (heredados de Qwen3-4B; no se especifica recuento exacto tras el retrofitting) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens evaluados; streaming constante con `--stream-window 8192` |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-4B, sin listado explicito) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pth` (checkpoint `vsa_qwen3_4b_v2.pth` con dict `config` y `model`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen/Qwen3-4B y los reconfigura en una arquitectura hibrida: 26 de las 36 capas usan atencion lineal basada en VSA (Vector Symbolic Architecture) con "Abelian Page-Slots" y "Centered Holographic Unbinding", mientras que 10 capas mantienen atencion softmax como anclas, incluyendo la capa L0 y una cada cuatro. Se aplica una ventana de atencion deslizante (SWA) de 256 tokens. El proceso de "healing" se realiza con destilacion de conocimiento (KD) durante T=2048 pasos con los MLP descongelados, segun la model card.

La innovacion principal es el uso de representaciones de producto tensorial y arquitecturas de simbolos vectoriales para el estado recurrente, lo que permite un estado de tamano constante independiente de la longitud de contexto en modo streaming. El autor reporta ademas capacidades de "desaprendizaje algebraico exacto" y "cartuchos de disco `.vsa`" con 4/4 de recall y 0,0 de residuo de borrado, aunque no se detalla el mecanismo ni se aportan mas metricas. No se especifica el volumen de tokens de entrenamiento ni la composicion del dataset de healing; solo que se usan los pesos del donante y un proceso de KD.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen3-4B y verificados en MMLU, ARC-Challenge y HellaSwag con diferencias no significativas frente al donante.
- Razonamiento matematico: GSM8K al 82,50% (frente a 85,00% del donante, p=0,5424), con cierre simetrico de `</think>` a 1984 tokens.
- Generacion de codigo: HumanEval al 72,56% (frente a 79,27%, unica diferencia estadisticamente significativa, -6,71%) y MBPP al 51,50% (diferencia no significativa).
- Seguimiento de instrucciones: IFEval al 85,00% frente a 86,00% del donante (no significativo).
- Procesamiento de contexto largo: evaluacion de passkey y paridad de streaming superadas en el hubcheck.
- Streaming de contexto infinito con memoria constante mediante `--stream-window 8192`, con crecimiento de estado de +0,0 MB sobre 32.768 tokens.
- Desaprendizaje algebraico exacto y cartuchos `.vsa` en disco (segun la model card).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no se documenta como capacidad separada; el cierre `</think>` aparece en la evaluacion de GSM8K.

## Casos de uso

- Inferencia de contexto largo con memoria acotada: el modelo mantiene un estado de 2.645 MB a 65.536 tokens frente a 9.216 MB del donante, lo que lo hace adecuado para procesar documentos extensos, expedientes o bases de codigo en una sola pasada en GPUs con VRAM limitada.
- Streaming continuo de conversaciones o logs: con `--stream-window 8192` el estado no crece sobre 32.768 tokens, lo que permite sesiones de agente prolongadas o monitorizacion de flujos sin reventar la memoria.
- Sustitucion de bajo coste en pipelines ya basados en Qwen3-4B: al empatar en 6 de 7 benchmarks, puede desplegarse donde el cuello de botella sea la RAM de KV en contextos largos, aceptando la perdida en HumanEval.
- Razonamiento matematico y tareas de QA de opcion multiple: GSM8K al 82,50% y ARC-Challenge al 55,50% lo situan como alternativa valida para asistentes educativos o resolucion de problemas acotados.
- Generacion de codigo con cautela: HumanEval cae 6,71 puntos de forma significativa, por lo que es preferible en tareas de codigo donde se pueda validar con tests automatizados o en pipelines de CI/CD con ejecucion de pruebas, no como generador ciego.
- Investigacion en arquitecturas de atencion lineal: el checkpoint y el toolkit vsa-lm permiten reproducir el retrofitting, medir el impacto del numero de capas ancla y experimentar con desaprendizaje algebraico.
- Prototipado de desaprendizaje selectivo: los cartuchos `.vsa` y el borrado con residuo 0,0 declarado permiten experimentar con eliminacion de conocimiento en dominios concretos, aunque sin validacion externa.

## Benchmarks y rendimiento

Evaluacion UK AISI Inspect con N=200 (HumanEval N=164), McNemar exacto pareado:

| Benchmark | Qwen/Qwen3-4B | VSA-Qwen3-4B v2 | p | Veredicto |
|---|---:|---:|---:|---|
| MMLU | 69,50% | 65,50% | 0,0768 | Empate (no sig.) |
| ARC-Challenge | 54,50% | 55,50% | 0,8145 | Empate (no sig.) |
| HellaSwag | 52,50% | 54,00% | 0,5811 | Empate (no sig.) |
| GSM8K | 85,00% | 82,50% | 0,5424 | Empate (no sig.) |
| HumanEval | 79,27% | 72,56% | 0,0433 | Peor (-6,71%, sig.) |
| MBPP | 55,00% | 51,50% | 0,1671 | Empate (no sig.) |
| IFEval | 86,00% | 85,00% | 0,7744 | Empate (no sig.) |

Rendimiento de decodificacion y RAM de estado + KV:

| Contexto | Donante (tok/s) | VSA (tok/s) | Aceleracion | KV donante | Estado+KV VSA | Ahorro RAM |
|---:|---:|---:|---:|---:|---:|---:|
| 2.048 | 58,5 | 54,8 | 0,94x | 288,0 MB | 166,1 MB | -42,3% |
| 8.192 | 53,8 | 54,7 | 1,02x | 1.152,0 MB | 405,3 MB | -64,8% |
| 16.384 | 58,3 | 53,6 | 0,92x | 2.304,0 MB | 725,7 MB | -68,5% |
| 32.768 | 48,8 | 51,4 | 1,05x | 4.608,0 MB | 1.366,3 MB | -70,3% |
| 65.536 | 30,4 | 47,8 | 1,57x | 9.216,0 MB | 2.645,2 MB | -71,3% |

Hubcheck interno: 8 de 9 puertas superadas; falla `decode_parity`. Los resultados son autodeclarados por el autor y no se han replicado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint ocupa aproximadamente 76 GB en el repositorio, lo que sugiere pesos en bfloat16 mas estados auxiliares; en bfloat16 los 4.000 millones de parametros requieren unos 8 GB de pesos, a los que hay que sumar el estado VSA y el KV (166 MB a 2.048 tokens, 2.645 MB a 65.536).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU de 24 GB (RTX 4090, L4, A10G) deberia alojar los pesos en bfloat16 con margen para contexto largo; A100/H100 si se busca throughput alto o batching.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB, aunque no se documenta cuantizacion ni requisitos minimos verificados.
- Opciones de despliegue: exclusivamente mediante el toolkit vsa-lm (`UniversalVSALM`, `VSARecurrentDecoder`, modulo `server`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 54,8 tok/s a 2.048 tokens, 47,8 tok/s a 65.536 tokens en la configuracion del autor; streaming a 53,6 tok/s con ventana de 8.192. Cifras autodeclaradas, sin especificar hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VSA-Qwen3-4B v2 | 4.000 M | 65.536 (evaluado) | Apache-2.0 | PyTorch `.pth` | Hibrido VSA + softmax, requiere vsa-lm |
| Qwen/Qwen3-4B | 4.000 M | 32.768 nativo (ampliable) | Apache-2.0 | safetensors | Donante; compatible con transformers, vLLM, llama.cpp |
| MiniMax-01 | no disponible | no disponible | no disponible | no disponible | Referencia de atencion lineal Lightning Attention-2 citada como prior art |
| RetNet | no disponible | no disponible | no disponible | no disponible | Arquitectura de atencion retentiva citada como prior art |

No se dispone de comparativas directas con modelos hibridos de tamano similar (por ejemplo, Jamba o Zamba) en la informacion proporcionada.

## Limitaciones y advertencias

- HumanEval cae 6,71 puntos de forma estadisticamente significativa (p=0,0433): el modelo es peor generando codigo que su donante.
- La puerta `decode_parity` del hubcheck falla, lo que indica divergencia entre el modo de decodificacion estandar y el recurrente; conviene validar el comportamiento en produccion.
- Todos los benchmarks son autodeclarados por el autor, con N=200 y sin replicacion independiente; la significacion estadistica con muestras tan pequenas es fragil.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- No es compatible con el ecosistema estandar (transformers, vLLM, llama.cpp, Ollama): requiere el toolkit vsa-lm, lo que limita el despliegue y anade dependencia de un repositorio de un solo autor.
- No se documentan sesgos, composicion del dataset de healing, idiomas soportados ni evaluaciones de seguridad o alucinacion.
- Las capacidades de desaprendizaje algebraico y cartuchos `.vsa` no cuentan con validacion independiente.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3-4B conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- El tamano del repositorio (76 GB) es elevado para un modelo de 4.000 millones; el almacenamiento y la transferencia pueden ser un cuello de botella.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rikkathree/vsa-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Toolkit vsa-lm: https://github.com/Rikka3/vsa-lm
- Prior art citado: RetNet, Lightning Attention-2 / MiniMax-01, Tensor Product Representations / VSA (sin enlaces directos en la informacion proporcionada)
