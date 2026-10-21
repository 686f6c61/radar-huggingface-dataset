# Duckets/ornith-1.5-122b-mlx-DFlash2

## Resumen

Ornith 1.5 122B es un modelo de lenguaje y vision (image-text-to-text) desarrollado por Ornith AI, construido sobre una arquitectura Qwen3.5-MoE: 122.562.817.776 parametros totales, aproximadamente 10.000 millones activos por token, 48 capas, 256 expertos enrutados (8 activos por token mas un experto compartido) y una ventana de contexto de 262.144 tokens. Esta ficha describe un artefacto concreto publicado por el usuario Duckets: la conversion a MLX en 4 bits de ese modelo (pesos afines, group size 64, 4,544 bits por peso) empaquetada junto al draft model DFlash2 de Inco AI para servir con el motor nativo Metal de TensorFold.

El valor anadido del repositorio no esta en los pesos (que son el puerto MLX 4-bit ya publicado por el mismo autor) sino en el binomio con el drafter DFlash2, un modelo de decodificacion especulativa por difusion de bloques: propone bloques de tokens que el modelo de 122B verifica, de modo que la decodificacion se mantiene sin perdida (en las pruebas del autor, las respuestas greedy con drafting fueron identicas byte a byte a las obtenidas sin el). Sobre un Apple M5 Max de 128 GB, el autor mide 79,1 tok/s en prosa (+24 %) y 136,0 tok/s en codigo (+99 %) frente a 63,6 y 68,4 tok/s sin drafting.

Es relevante ahora por dos motivos: demuestra que un MoE de 122B en 4 bits puede servirse de forma interactiva en hardware Apple Silicon de gama alta con memoria unificada, y documenta con mediciones la primera comparativa publica entre dos generaciones de drafters (DFlash2 sobre TensorFold frente a DFlash v1 sobre el backend MLX de z-lab, que rinde 18-23 tok/s, mas lento que decodificar sin especulacion). Es un artefacto de nicho, con fecha de publicacion de octubre de 2026, cero descargas y cero likes, y validado por un unico autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de vision (familia Qwen3.5-MoE): 48 capas, 256 expertos enrutados con 8 activos por token mas un experto compartido |
| Parametros totales | 122.562.817.776 (~122,6 B) |
| Parametros activos | ~10 B (A10B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 4-bit affine MLX, group size 64, 4,544 bpw (unica incluida en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Pesos: MIT (upstream, © Ornith AI); drafter en `draft/`: Apache-2.0 (© Inco AI). La metadata de HuggingFace declara `apache-2.0` |
| Formato de pesos | safetensors en formato MLX (4 bits); drafter incluido en `draft/`; no se distribuye GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos de la familia Qwen3.5, con 48 capas, 256 expertos enrutados de los que se activan 8 por token mas un experto compartido, lo que da 122,6 B de parametros totales con un coste de computo por token de aproximadamente 10 B. Incluye torre de vision, por lo que el pipeline declarado es image-text-to-text. Los detalles de entrenamiento (numero de tokens, composicion del dataset, si hubo RLHF o DPO) no estan disponibles en la informacion proporcionada.

La innovacion tecnica del repositorio esta en la capa de decodificacion. DFlash2 (Inco AI) es un draft model de difusion de bloques que propone bloques de tokens candidatos; el modelo de 122B los verifica, de forma que la salida es identica a la decodificacion greedy sin drafting. El drafter se ejecuta exclusivamente dentro de TensorFold, un motor Metal nativo escrito en Zig; en mlx-lm o LM Studio el repositorio se comporta exactamente como el puerto 4-bit base y el drafter se ignora. El autor tambien probo el emparejamiento con DFlash v1 a traves del backend MLX de z-lab (drafter `z-lab/Qwen3.5-122B-A10B-DFlash`), con un resultado de 18-23 tok/s, mas lento que la decodificacion simple.

## Capacidades

- Generacion de texto y razonamiento sobre ventanas de hasta 262.144 tokens, con coste de inferencia de un MoE de ~10 B activos.
- Procesamiento de imagen y texto (pipeline image-text-to-text); la torre de vision esta incluida y carga en runtimes MLX.
- Decodificacion especulativa sin perdida mediante DFlash2, con verificacion por el modelo de 122B.
- Mayor ganancia de throughput en texto predecible: codigo, listas y salidas estructuradas (+99 % en codigo segun el autor) y menor en prosa libre (+24 %).
- Servicio mediante API compatible con OpenAI en `http://127.0.0.1:8891/v1` a traves de la receta de TensorFold.
- Ejecucion local en Apple Silicon (MLX), sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente local sobre documentacion extensa: con 262K tokens de contexto se puede cargar un repositorio de documentacion o un expediente completo y mantener conversaciones multi-turno sin trocear en RAG, siempre que se ajuste el prompt cache (4 GiB en la configuracion probada).
- Generacion de codigo en local con latencia interactiva: el escenario donde el drafter rinde mas (136,0 tok/s medidos en M5 Max), adecuado para autocompletado, refactorizacion o generacion de tests dentro de un IDE que consuma la API OpenAI-compatible en localhost.
- Salidas estructuradas y extraccion de datos: JSON, listas, tablas y esquemas fijos son el tipo de contenido predecible donde la decodificacion especulativa aporta la mayor ganancia, lo que lo hace util en pipelines de extraccion sobre documentos.
- Analisis de documentos con imagenes: al ser un modelo image-text-to-text puede procesar capturas, diagramas o paginas escaneadas junto al texto; conviene validar la ruta de vision, ya que el autor advierte que no se re-verifico por separado en este bundle.
- Resumen y clasificacion por lotes en estacion de trabajo: ejecucion offline sobre cientos de documentos sin enviar datos a terceros, aprovechando la memoria unificada de un equipo de 128 GB.
- Prototipado de producto con privacidad estricta: sectores con requisitos de residencia de datos (legal, sanidad, defensa) donde no es viable una API externa y se acepta el coste de hardware Apple de gama alta.
- Banco de pruebas para investigacion en decodificacion especulativa: comparar DFlash2 sobre TensorFold frente a DFlash v1 sobre MLX, o medir el efecto del drafting segun el dominio del texto, con una linea base reproducible (mismo commit de motor y mismos pesos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos medidos que publica el autor son de throughput de decodificacion, en un Apple M5 Max de 128 GB, TensorFold `ornith-main` en el commit `30e5dcb4`, 1 stream, greedy, respuestas de 256 tokens, en caliente:

| Configuracion | Prosa (tok/s) | Codigo (tok/s) |
|---|---|---|
| TensorFold sin drafting | 63,6 | 68,4 |
| TensorFold + DFlash2 | 79,1 (+24 %) | 136,0 (+99 %) |
| Referencia: MLX plano via mlx-lm | 62-68 | 62-68 |
| DFlash v1 (z-lab, backend MLX) | 18-23 | 18-23 |

El propio autor advierte que la ganancia del drafting depende del contenido: maxima en texto predecible (codigo, listas, salida estructurada) y minima en prosa libre. No se publican datos de prefill, latencia de primer token ni throughput con concurrencia mayor que 1.

## Requisitos de hardware

- Memoria: pesos y drafter residentes ocupan aproximadamente 75 GiB; el repositorio pesa 71,5 GB. Se necesita un equipo con memoria unificada de al menos ~80 GB y margen para KV cache.
- Hardware probado: Apple M5 Max con 128 GB. La receta de serving esta pensada por defecto para maquinas de 256 GB; en 128 GB hay que limitar a un stream y un prompt cache pequeno (`PARALLEL=1 PROMPT_CACHE_GIB=4 DRAFTS=true`).
- GPU: no aplica a CUDA. El formato es MLX y el motor TensorFold usa Metal, por lo que no hay soporte para A100, H100 ni RTX 4090 en esta ruta.
- Cabe en GPU de consumo: no en el sentido habitual; requiere Apple Silicon con memoria unificada de gama alta (Mac Studio / MacBook Pro configurados a 128 GB o mas).
- Despliegue: TensorFold (build con Zig 0.17 + cmake, `python3 -m mac build`), API compatible con OpenAI en el puerto 8891. LM Studio y mlx-lm pueden cargar los pesos, pero ignoran el drafter y rinden como el puerto 4-bit base.
- No hay soporte para vLLM, TGI, llama.cpp ni Ollama en esta ruta (no se distribuye GGUF).
- Throughput y latencia: ver tabla de la seccion anterior; no se publican datos de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion | Licencia | Formato | Throughput medido |
|---|---|---|---|---|---|---|
| Este repo: Ornith 1.5 122B MLX 4-bit + DFlash2 | 122,6 B totales / ~10 B activos | 262.144 | Especulativa DFlash2 sobre TensorFold | MIT (pesos) + Apache-2.0 (drafter) | safetensors MLX 4-bit | 79,1 tok/s prosa; 136,0 tok/s codigo |
| `Duckets/Ornith-1.5-122B-MLX-4bit` (mismo puerto, sin drafter) | 122,6 B / ~10 B | 262.144 | Sin drafting (o la que aporte el runtime) | MIT | safetensors MLX 4-bit | 62-68 tok/s via mlx-lm |
| `ornith-ai/Ornith-1.5-122B` (original) | 122,6 B / ~10 B | 262.144 | Estandar | MIT | safetensors (precision no indicada) | no disponible |
| Ruta DFlash v1: `z-lab/Qwen3.5-122B-A10B-DFlash` sobre backend MLX de z-lab | no disponible (drafter para la familia Qwen3.5-122B-A10B) | 262.144 (modelo objetivo) | Especulativa DFlash v1 | no disponible | MLX | 18-23 tok/s |

No se dispone de datos para comparar con alternativas de otro fabricante (por ejemplo, otros MoE abiertos de tamano similar) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva: 4,544 bpw con group size 64 introduce perdida de calidad frente al modelo original; no se publican evaluaciones que cuantifiquen esa degradacion.
- Dependencia de un motor muy especifico: el drafter solo funciona en TensorFold, fijado al commit `30e5dcb4` de la rama `ornith-main`, con build via Zig 0.17 y cmake. Cualquier actualizacion del motor o de la receta puede romper la reproducibilidad.
- Portabilidad nula fuera de Apple Silicon: no hay ruta CUDA, ROCm ni GGUF; vLLM, TGI y llama.cpp no son opciones.
- Vision no re-verificada: el autor indica que la torre de vision carga en MLX y que el motor sirve imagenes segun la receta, pero no se re-verifico por separado en este bundle. Tratar las capacidades multimodales como pendientes de validacion.
- Ambiguedad de licencia: la metadata del repositorio declara `apache-2.0`, mientras que la model card atribuye MIT a los pesos (upstream de Ornith AI) y Apache-2.0 al drafter. Antes de uso comercial conviene revisar el LICENSE upstream enlazado y confirmar la licencia aplicable a los pesos derivados.
- Validacion muy limitada: 0 descargas, 0 likes, publicacion de un unico autor (conversion y benchmarks por Juno para Duckets) y mediciones en una sola maquina; no hay replicacion independiente.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que no se puede situar el modelo frente a alternativas en capacidad, solo en velocidad.
- Idiomas no declarados: no se especifica cobertura linguistica; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a la generacion libre, no mitigado por el drafting (que es sin perdida y por tanto preserva tambien los errores del modelo base).
- Contexto de 262K en papel, pero en la practica limitado por el prompt cache configurado (4 GiB en la receta para 128 GB) y por el coste de memoria de un modelo que ya consume ~75 GiB en residente.
- Throughput con concurrencia 1: no hay datos de serving multi-usuario; la configuracion probada es un solo stream.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Duckets/ornith-1.5-122b-mlx-DFlash2
- Puerto MLX 4-bit base: https://huggingface.co/Duckets/Ornith-1.5-122B-MLX-4bit
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia upstream: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Drafter DFlash2 (Inco AI): https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Motor TensorFold (autores): https://github.com/ashhart/TensorFold
- Port de TensorFold para Ornith (rama `ornith-main`): https://github.com/BobClawblaw/TensorFold
- Receta de serving en Apple Silicon: https://github.com/BobClawblaw/ornith-15-122b-mlx-m5-ultra
- Drafter DFlash v1 de referencia (z-lab): https://huggingface.co/z-lab/Qwen3.5-122B-A10B-DFlash
