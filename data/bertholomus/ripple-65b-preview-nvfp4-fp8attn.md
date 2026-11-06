# bertholomus/Ripple-65B-Preview-NVFP4-FP8Attn

## Resumen

Ripple-65B-Preview-NVFP4-FP8Attn es una cuantizacion mixta del modelo denso Ripple-65B-Preview de Ricursive Intelligence, publicada por el usuario bertholomus (BertholomusAI). El checkpoint original, orientado a codigo agentico y razonamiento, se distribuye aqui con los tensores de MLP, normalizaciones, embeddings y LM head en NVFP4 (grupo de 16) tal y como los entrega Ricursive, mientras que las 400 proyecciones de atencion, que el autor original sirve en BF16, se han convertido a FP8 E4M3 con escalas estaticas calibradas. El resultado ocupa 43,79 GB y esta pensado para servirse con SGLang 0.5.19 junto al drafter especulativo DFlash2 del propio Ricursive.

El modelo resuelve el problema del coste de memoria y del ancho de banda en inferencia de un modelo de 64.782.689.360 parametros: al pasar la atencion a FP8, sus proyecciones bajan de 26,8 GB a 13,4 GB, lo que permite mantener el checkpoint completo en una unica GPU profesional de 96 GB y acelerar el paso de decodificacion. La ventana de contexto configurada es de 131.072 tokens, aunque las mediciones publicadas solo llegan hasta 32K.

Es relevante ahora porque demuestra una via practica de despliegue de un modelo frontera abierto de 65B en hardware de una sola tarjeta, con perdida de calidad medida y acotada frente al checkpoint NVFP4 de referencia (divergencia KL de 0,0117 por token y 96,4% de coincidencia en el token top-1). La licencia es Apache-2.0 y el formato es safetensors con configuracion ModelOpt de precision mixta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ripple-65B-Preview), con atencion cuantizada a FP8 y MLP en NVFP4 |
| Parametros totales | 64.782.689.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens configurados (mediciones de prefill solo hasta 32K) |
| Tipos de cuantizacion | NVFP4 (MLP, grupo de 16), FP8 E4M3 (400 proyecciones de atencion, escalas estaticas por tensor), BF16 (embeddings y lm_head) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (config ModelOpt MIXED_PRECISION), libreria sglang |
| Tamano del checkpoint | 43,79 GB |
| Numero de tensores | 2.723 (1.923 pesos + 800 escalas) |
| Version de SGLang | 0.5.19 |
| Drafter especulativo | DFlash2 (ricursiveAI/Ripple-65B-Preview-DFlash2), 16 tokens de borrador |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parametros desarrollado por Ricursive Intelligence y preentrenado desde cero para codificacion agentica; es una variante de proposito general del modelo propietario que sustenta su plataforma de diseno de chips. La model card del autor original no detalla el numero de tokens de entrenamiento ni la composicion del dataset, y esta ficha no dispone de esos datos.

La innovacion de esta publicacion no esta en el entrenamiento sino en la receta de cuantizacion, que no entrena ningun peso. Primero se ejecuta una fase de calibracion: un hook envuelve el forward de atencion en la build NVFP4 de Ricursive y registra el maximo valor absoluto de entrada de cada una de las 400 proyecciones (q, k, g y v reciben sus propias entradas; o recibe la salida de la atencion con compuerta), sobre 864 prompts (UltraChat-200k, HumanEval, GSM8K y MBPP; 94.708 tokens de prompt y 82.316 generados), generando 400 maximos escalares. Despues, el script de conversion copia byte a byte todos los tensores no pertenecientes a la atencion y convierte cada peso de atencion BF16 a FP8 E4M3 con una escala de peso por tensor (amax/448) y una escala de entrada estatica por tensor (amax calibrado/448); el peor error relativo de peso es del 2,7%. La verificacion comprueba que los 1.523 tensores no de atencion son identicos byte a byte al origen.

El despliegue recomendado combina el checkpoint con el drafter DFlash2 de Ricursive para decodificacion especulativa, que acepta unos 6,8 tokens por paso en codigo, y aplica dos correcciones de scheduler de Ricursive (`spark.run_worker`) en el script de servicio.

## Capacidades

- Generacion de texto conversacional y de prosa, con decodificacion greedy reproducible de forma exacta.
- Generacion de codigo: el modelo base esta preentrenado para codificacion agentica; supera 12 de 12 tareas Python con asserts ocultos en la evaluacion del autor.
- Razonamiento matematico: 143 de 150 aciertos en GSM8K con decodificacion greedy y presupuesto de 4.096 tokens.
- Tool calling y function calling: soportado mediante los parsers de SGLang; la prueba de llamada a herramienta con argumentos en streaming y no streaming identicos, en dos turnos, pasa.
- Uso en agentes y razonamiento multi-paso: el checkpoint se sirve con parser de razonamiento y de tool calls activados.
- Decodificacion especulativa con DFlash2, con hasta 4 streams concurrentes.
- Capacidades multilingues: no disponible.
- Vision y audio: no disponible; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Asistencia de codificacion en produccion: el modelo puede integrarse en un servidor compatible con la API de OpenAI de SGLang y atender autocompletado y generacion de funciones; con 218 tok/s en un solo stream sobre codigo, es viable para editores interactivos.
- Agentes de refactorizacion multi-paso: la ventana de 131.072 tokens permite cargar varios ficheros y el historial de conversacion, y el soporte de tool calling habilita ciclos de lectura, edicion y verificacion sobre el repositorio.
- Servicio concurrente de bajo coste: con 4 streams simultaneos alcanza 653 tok/s agregados en codigo sobre una RTX PRO 6000 Blackwell Max-Q, lo que permite servir a varios usuarios con una sola GPU de 96 GB.
- Razonamiento matematico y verificacion: con 143/150 en GSM8K puede emplearse en pipelines de resolucion de problemas con comprobacion posterior, por ejemplo generacion de tests y validacion de resultados numericos.
- Procesamiento de documentos largos: el prefill de unos 3.010 tok/s con prompts de 8K y 2.830 tok/s con 32K permite analizar informes o bases de codigo extensas dentro de la ventana configurada.
- Evaluacion e investigacion de cuantizacion: al conservar byte a byte los tensores no de atencion y publicar el informe de escalas y errores, sirve como referencia reproducible para estudiar el impacto de FP8 en atencion frente a NVFP4.
- Despliegue en estaciones de trabajo con GPU profesional unica: el checkpoint de 43,79 GB cabe en tarjetas de 48 GB o mas con margen para cache KV en BF16, lo que facilita entornos on-premise sin cluster.

## Benchmarks y rendimiento

Rendimiento medido en una RTX PRO 6000 Blackwell Max-Q (96 GB, 300 W) con SGLang 0.5.19, drafter DFlash2, 16 tokens de borrador, hasta 4 streams y cache KV en BF16; mediana de 3 ejecuciones con rango entre parentesis:

| Metrica | Resultado |
|---|---|
| Tamano del checkpoint | 43,79 GB |
| Un stream, codigo | 218 tok/s (215-222) |
| Un stream, prosa | 56,9 tok/s (56,1-58,3) |
| Cuatro streams, codigo, total | 653 tok/s (623-661) |
| Prefill, prompt de 8K | ~3.010 tok/s |
| Prefill, prompt de 32K | ~2.830 tok/s |
| Salida greedy repetible | si |
| Tokens aceptados por paso del drafter (codigo) | ~6,8 |

Calidad frente al checkpoint NVFP4 de origen:

| Comprobacion | Resultado |
|---|---|
| Divergencia KL por token (120 prompts retenidos, 40.461 posiciones) | 0,0117 (IC 95%: 0,0102-0,0134) |
| Coincidencia en el token top-1 | 96,4% |
| GSM8K, 150 items (`test[200:350]`), greedy, 4.096 tokens | 143/150 |
| 12 tareas Python con asserts ocultos, greedy | 12/12 |
| Tool call en dos turnos (streaming y no streaming) | pasa |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible; las cifras anteriores son del propio autor y se miden contra el checkpoint NVFP4, no contra BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 43,79 GB; hay que sumar la cache KV en BF16 para la ventana configurada y el drafter DFlash2. Con contexto corto cabe en GPUs de 48 GB; para ventanas largas se recomienda 80-96 GB.
- GPU probada: RTX PRO 6000 Blackwell Max-Q (96 GB, sm_120). El autor indica que la version de plena potencia deberia ser mas rapida, pero no lo ha medido.
- Otras GPU: no cubiertas por las pruebas; el autor solo valido sm_120.
- Cabe en GPU de consumo: no confirmado; una RTX 4090 de 24 GB no puede alojar el checkpoint completo, y no se han publicado resultados con offload ni con cuantizaciones adicionales.
- Motor de despliegue: exclusivamente SGLang 0.5.19 con el script `recipe/serve.py`, que descarga el checkpoint, el drafter y el codigo de inferencia de Ricursive y arranca una API compatible con OpenAI en el puerto 30000.
- Variables de configuracion: `RIPPLE_PORT`, `RIPPLE_HOST`, `RIPPLE_CTX` (131072 por defecto), `RIPPLE_MAX_RUNNING` (4), `RIPPLE_DRAFT_TOKENS` (16) y `RIPPLE_SPEC=0` para servir sin drafter.
- Latencia y throughput: 218 tok/s por stream en codigo y 56,9 tok/s en prosa; 653 tok/s agregados con 4 streams; prefill de ~3.010 tok/s a 8K y ~2.830 tok/s a 32K.
- Requisito de toolchain CUDA: con CUDA instalado via pip, FlashInfer compila su modulo FP8 GEMM en el primer uso y enlaza `-lcublas -lcublasLt`; los wheels `nvidia-*-cu13` solo incluyen `libcublas.so.13`, por lo que hay que crear enlaces simbolicos `libcublas.so` y `libcublasLt.so` o usar el toolkit CUDA 13 completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-NVFP4-FP8Attn (esta ficha) | 64,8B denso | 131.072 | NVFP4 + FP8 atencion | Apache-2.0 | Hugging Face, SGLang 0.5.19 |
| ricursiveAI/Ripple-65B-Preview-NVFP4 | 64,8B denso | no disponible | NVFP4 | Apache-2.0 | Hugging Face |
| ricursiveAI/Ripple-65B-Preview | 65B denso | no disponible | BF16 | Apache-2.0 | Hugging Face, Together AI, GMI Cloud |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo se ha validado en una RTX PRO 6000 Blackwell Max-Q (sm_120); el rendimiento en otras GPU puede diferir y no esta medido.
- El contexto configurado es de 131.072 tokens, pero las pruebas de prefill se detienen en 32K; no hay datos de calidad ni de rendimiento por encima de esa longitud.
- Solo se ha probado con SGLang 0.5.19; otros motores (vLLM, llama.cpp, TGI, Ollama) no estan cubiertos.
- La divergencia KL se mide contra el checkpoint NVFP4 de Ricursive, no contra BF16; no se ha publicado una medicion de deriva frente al modelo en BF16.
- La cuantizacion FP8 de la atencion introduce un error relativo de peso de hasta el 2,7% y depende de escalas estaticas calibradas con 864 prompts; distribuciones de entrada muy distintas de las de calibracion podrian degradar mas la calidad.
- Riesgo de alucinacion inherente a un modelo de lenguaje; no se han publicado evaluaciones de veracidad.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se ha publicado evaluacion multilingue.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado ni respaldado por Ricursive; el modelo y los pesos son copyright de Ricursive.
- El drafter DFlash2 se usa tal cual y no se redistribuye en este repositorio, por lo que el despliegue depende de descargarlo por separado.
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta y fue creado el 6 de noviembre de 2026, por lo que carece de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bertholomus/Ripple-65B-Preview-NVFP4-FP8Attn
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Checkpoint NVFP4 de origen: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Licencia del modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
- Pagina oficial del modelo: https://www.ricursive.com/ripple
- Articulo de MarkTechPost: https://www.marktechpost.com/2026/11/04/ricursive-ripple-65b-preview-open-weight-model/
