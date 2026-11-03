# Riyan200324200324/DeepSeek-V4-Flash-0731-abliterated

## Resumen

DeepSeek-V4-Flash-0731-abliterated es una reconstruccion sin censura (abliterated) del modelo DeepSeek-V4-Flash-0731 de DeepSeek, un transformer de tipo mixture-of-experts (MoE) orientado a razonamiento y coding agentico. El autor del fine-tune es el usuario de HuggingFace Riyan200324200324, que publica el modelo bajo licencia MIT. El checkpoint declara 305.723.922.366 parametros totales en safetensors (la model card del autor cita 284B totales y 13B activos), con 43 capas, hidden size 4096 y 256 expertos enrutados con top-6 mas un experto compartido.

La intervencion no es un reentrenamiento ni una recuantizacion: se aplica una proyeccion ortogonal de rango 1 sobre las proyecciones de salida de atencion (`attn.wo_b`) para eliminar la direccion de rechazo, manteniendo intactos expertos, embeddings, routers, normas y parametros mHC. Segun el autor, solo 92 de 72.317 tensores (0,13 %) difieren del checkpoint original, y el resto es identico byte a byte y verificable por sha256.

Es relevante porque demuestra una tecnica de abliteracion quirurgica sobre un modelo de gran escala servido en precision nativa FP4+FP8, con validacion cuantitativa de eliminacion de rechazos (de 95,8 % a 0,0 % en AdvBench) y preservacion de la conformidad de tool calling (1.000). Su principal caveat es que se trata de un modelo sin salvaguardas de seguridad y con requisitos de hardware muy elevados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeek-V4), 43 capas, hidden 4096, 256 expertos enrutados (top-6) + 1 compartido, atencion hibrida CSA + HCA con Lightning Indexer, hyper-connections mHC (`hc_mult=4`), cabecera draft DSpark inline de 3 etapas |
| Parametros totales | 305.723.922.366 (segun safetensors); la model card indica 284B totales |
| Parametros activos | 13B (segun model card) |
| Longitud de contexto | 1.048.576 nativo; servido a 262.144 en la configuracion del autor |
| Tipos de cuantizacion | FP4 (E2M1 + ue8m0) en expertos enrutados; FP8 e4m3 con escalas de bloque 128x128 en el resto; tag `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards + overlay de 1,54 GB), transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de DeepSeek con 43 capas, 256 expertos enrutados con seleccion top-6 y un experto compartido, hidden size 4096 y atencion hibrida que combina CSA (compressed sparse attention) y HCA con un Lightning Indexer. Incorpora hyper-connections mHC con multiplicador 4 y una cabecera de decodificacion especulativa DSpark de 3 etapas integrada en el propio checkpoint. Los pesos se distribuyen en precision nativa: FP4 para los expertos enrutados y FP8 e4m3 con escalas de bloque 128x128 para el resto de modulos.

El proceso de abliteracion consistio en capturar las salidas de subcapa del ultimo token mediante hooks en las 43 proyecciones `attn.wo_b` de un despliegue vLLM con tensor-parallel 2, usando 256 prompts daninos de AdvBench frente a 256 prompts inocuos de Alpaca en los tres modos de razonamiento (`chat`, `think-high`, `think-max`). Se calcularon direcciones por capa como diferencia de medias (4096 dimensiones), con una coseno de split-half mediana de 0,9863 y AUC held-out mediana de 0,9976. La edicion se aplico como `W ← W − λ·r̂(r̂ᵀW)` con λ = 2,5 en float64 sobre los pesos FP8, desquantizando con las escalas ue8m0, proyectando y recuantizando con los exponentes de bloque originales fijos para que los elementos no modificados conserven su byte original. Se clamparon 7.821 de 1.540 millones de elementos por desbordamiento (6.877 de 94.208 bloques), con sobredisparo maximo de 1,186x. El tamano relativo medio de la edicion fue 0,0587. El pipeline es numpy + safetensors, sin torch, y se ejecuta en CPU en unos 70 segundos.

## Capacidades

- Generacion de texto y razonamiento en multiples modos: `chat`, `think-high` y `think-max` (bloques de pensamiento explicitos).
- Coding agentico: generacion de codigo, edicion multi-archivo y tareas de ingenieria de software de varios pasos.
- Tool calling / function calling con el formato nativo DSML y parser `deepseek_v4` en vLLM; conformidad medida de 1.000 en los tres modos.
- Razonamiento multi-paso y soporte de agentes con bucles de herramientas, favorecido por el prefijo caching (41,9 s en frio a 0,37 s en caliente a 71k de contexto).
- Recuperacion de contexto largo: ventana nativa de 1.048.576 tokens, servida a 262.144.
- Decodificacion especulativa integrada mediante la cabecera DSpark, con aceptacion de borrador del 48,7 % (paridad con el base).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente de coding en produccion: el modelo puede integrarse en pipelines de CI/CD para generar parches, revisar diffs y resolver issues multi-archivo, apoyandose en el tool calling nativo y en la ventana de contexto larga para incluir el repositorio completo.
- Agente autonomo con herramientas: con conformidad de tool calling de 1.000 y parser DSML, es adecuado para orquestar APIs externas, consultas a bases de datos y ejecucion de comandos en entornos controlados.
- Analisis de repositorios grandes: la ventana nativa de 1.048.576 tokens permite cargar arboles de codigo extensos y realizar busquedas y refactorizaciones con contexto completo.
- Generacion estructurada (JSON): el autor reporta 75,5 tok/s de decodificacion en cargas estructuradas con aceptacion de borrador del 82,5 %, lo que lo hace util para extraccion de datos y generacion de respuestas con esquema fijo.
- Investigacion sobre seguridad y alineacion: al eliminar los rechazos de forma medible (95,8 % a 0,0 % en AdvBench), sirve como banco de pruebas para estudiar direcciones de rechazo, robustez de salvaguardas y tecnicas de abliteracion.
- Procesamiento de documentacion tecnica de gran volumen: con 50,6 tok/s en prosa tecnica y contexto de 262k servido, puede resumir y clasificar corpus extensos en un solo paso.
- Despliegue local en hardware propio: pensado para dos nodos DGX Spark (GB10, 128 GB cada uno) con vLLM TP=2, lo que permite ejecutar un modelo de 284B sin depender de la nube.

## Benchmarks y rendimiento

| Metrica | Base 0731 | Este modelo (abliterated) |
|---|---|---|
| Rechazo en chat (n=48) | 95,8 % | 0,0 % |
| Rechazo en think-high (n=24) | no disponible | 0,0 % |
| Rechazo en think-max (n=24) | 95,8 % | 0,0 % |
| Conformidad de tool calling (3 modos) | 1.000 | 1.000 |
| Herramienta correcta seleccionada | no disponible | 1.000 |
| Tasa de respuesta vacia | 0.000 | 0.000 |
| Aceptacion del borrador DSpark | ~48 % | 48,7 % |

| Carga de trabajo | Decodificacion (tok/s) | Aceptacion de borrador | Longitud media aceptada |
|---|---:|---:|---:|
| Estructurada (JSON) | 75,5 | 82,5 % | 5,12 / 5 |
| Codigo | 71,7 | ~69 % | no disponible |
| Prosa tecnica | 50,6 | 47,9 % | 3,39 |

Agregado de 183 tok/s con 8 flujos concurrentes en 2x DGX Spark con TP=2 sobre ConnectX-7 RoCE. Prefill con prefix caching: 41,9 s en frio y 0,37 s en caliente a 71k de contexto (0,65 s a 156k). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 167 GB en precision nativa FP4+FP8; no cabe en una sola GPU de 128 GB.
- Configuracion de referencia del autor: 2x NVIDIA DGX Spark (GB10, 128 GB cada uno) con tensor-parallel 2 y vLLM 0.25.2 (imagen `ghcr.io/anemll/dspark-vllm-gx10:0.1.1`).
- GPU recomendadas: DGX Spark GB10 en pares; para servir a mayor escala se requeririan nodos con memoria agregada suficiente (no especificado por el autor).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer actual sin cuantizacion adicional no publicada.
- Opciones de despliegue: vLLM con `--tool-call-parser deepseek_v4`; el autor no reporta soporte verificado de llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT excluido en las metricas; decodificacion de 50,6 a 75,5 tok/s segun carga en un solo flujo, 183 tok/s agregados con 8 flujos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-abliterated (este) | 305,7B totales / 13B activos | 1.048.576 nativo | MIT | Sin rechazos medidos; FP4+FP8 nativo |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | 284B totales / 13B activos | 1.048.576 nativo | no disponible en la informacion | Rechazo del 95,8 % en AdvBench; misma arquitectura |
| Otros modelos abliterated de gran escala | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo sin censura: los rechazos se han eliminado en la practica (0,0 % observado), pero con n=48 y n=24 los limites superiores de Wilson al 95 % son aproximadamente 7,4 % y 13,8 %; la tasa cero observada no prueba un techo real.
- Riesgo elevado de uso indebido: el autor advierte explicitamente que el modelo intentara casi cualquier peticion y que la responsabilidad recae en el usuario; esta pensado para uso local y de investigacion en hardware propio.
- Alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no se han publicado analisis de sesgo en la informacion disponible.
- Idiomas: la lista de idiomas soportados no esta disponible; el comportamiento multilingue no esta verificado.
- Licencia MIT: permite uso comercial, pero la ausencia de salvaguardas puede incumplir politicas de plataformas o requisitos regulatorios en despliegues publicos.
- Requisitos de hardware: aproximadamente 167 GB de pesos en precision nativa, lo que excluye GPUs de consumo y obliga a configuraciones multi-nodo con interconexion de alta velocidad.
- Compatibilidad: el pipeline de abliteracion modifica tambien las 3 etapas del drafter DSpark para evitar colapso de aceptacion; servir el modelo sin la cabecera ajustada o con otro runtime no verificado puede degradar el rendimiento.
- El autor no reporta soporte verificado en llama.cpp, Ollama ni TGI; el despliegue probado se limita a vLLM 0.25.2 en DGX Spark.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Riyan200324200324/DeepSeek-V4-Flash-0731-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Imagen de runtime del autor: ghcr.io/anemll/dspark-vllm-gx10:0.1.1
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
