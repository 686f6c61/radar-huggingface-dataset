# addiesam/Ripple-65B-Preview-QVB8R-2e-3

## Resumen

Ripple-65B-Preview-QVB8R-2e-3 es un paquete de pesos comprimidos del modelo de lenguaje Ripple-65B-Preview (desarrollado por ricursiveAI), publicado por el usuario addiesam. No se trata de un modelo nuevo, sino de una cuantizacion del modelo base bf16 mediante el formato propietario QVB8R (QVB8 con codificacion entropica) a un umbral de error tau = 0,002. El paquete esta disenado exclusivamente para el motor de inferencia QVB8, desarrollado por el mismo autor, y no es cargable directamente en `transformers` ni en otros motores convencionales.

La propuesta tecnica diferencial es la compresion con cota L-infinito certificada: para cada peso restaurado, el error absoluto maximo respecto al valor original en bf16 queda acotado por tau, y ese maximo se registra por tensor en el archivo `manifest.json`. Frente a la cuantizacion tradicional evaluada por medias (perplejidad o benchmarks), este enfoque controla el peor caso, que es el que puede provocar fallos puntuales como palabras erroneas o caracteres de otro idioma en medio de una respuesta.

El paquete ocupa 38,1 GB en disco, comprime 642 tensores con una media de 4,70 bits por peso y esta certificado tanto para fp16 como para bf16. La licencia es Apache 2.0. No se dispone de informacion sobre arquitectura, contexto, idiomas ni datos de entrenamiento del modelo base en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ricursiveAI/Ripple-65B-Preview) |
| Parametros totales | 1.664.080 (segun safetensors del repo); el nombre del modelo base sugiere 65B, no confirmado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8R (QVB8 con codificacion entropica), tau = 0,002; media de 4,70 bits por peso en los 642 tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8R (safetensors como contenedor), cargable solo con el motor QVB8 v1.1.0 o superior |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Ripple-65B-Preview (transformer, MoE, hibrido u otra), ni sobre el volumen o composicion de sus datos de entrenamiento, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del paquete comprimido no documenta estos aspectos del modelo original.

Lo que si esta documentado es el proceso de compresion. Cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica despues del empaquetado: el error maximo entre el valor restaurado y el peso original en bf16 se registra por tensor en `manifest.json` (`max_err`) y ningun tensor supera tau = 0,002. El empaquetado no utiliza datos de calibracion; depende unicamente de los pesos. La descompresion se realiza en la GPU dentro de los kernels CUDA del motor QVB8, lo que permite ejecutar el modelo en hardware mas pequeno que el que exigiria el modelo en bf16. El motor v1.1.0 anade soporte multi-GPU en una misma maquina (`--pipeline cuda:0,cuda:1`), un worker remoto para varias maquinas, offload de la cache KV a RAM del sistema (`--kv-window` / `--kv-host`) y kernels CUDA precompilados para DGX Spark (sm_121a) y V100 (sm_70).

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Decodificacion especulativa: existe un modelo draft DFlash2 (packs separados de 4,1 GB en qvb8 y 3,4 GB en qvb8r) que se pasa como `DRAFT` junto al pack objetivo como `MODEL`, lo que indica soporte de decodificacion especulativa en el motor.
- Compresion certificada: cada peso restaurado tiene un error acotado por tau, verificable mediante `manifest.json`.
- Compatibilidad fp16 y bf16: el pack esta certificado para ambos formatos (`restore: fp16+bf16`), con una lista de escapes (`escape_tables.json`) para pesos que requieren tratamiento especial.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes o multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo de 65B en hardware limitado: el motor QVB8 descomprime los pesos en la GPU dentro de sus kernels, de modo que un modelo que en bf16 ocuparia decenas de GB puede ejecutarse con un pack de 38,1 GB, reduciendo el requisito de VRAM frente al modelo original.
- Servicio de generacion de texto conversacional: el pipeline `text-generation` y la etiqueta `conversational` permiten usarlo como backend de chat multi-turno a traves del servidor del motor QVB8, cuyo cliente de terminal se conecta a un servidor en ejecucion.
- Inferencia multi-GPU en una sola maquina: con `--pipeline cuda:0,cuda:1` se reparte el modelo entre varias GPU, util para estaciones de trabajo con dos o mas aceleradores y poca VRAM por tarjeta.
- Despliegue distribuido entre maquinas: el worker de etapa remota del motor v1.1.0 permite repartir la inferencia en varios nodos, adecuado para laboratorios con clústeres pequenos.
- Reduccion de latencia con decodificacion especulativa: emparejar este pack objetivo con el draft DFlash2 QVB8R-5e-3 (3,4 GB) para acelerar la generacion mediante verificacion especulativa de tokens.
- Escenarios con requisitos estrictos de fidelidad de pesos: cuando se necesita garantizar que ningun peso se desvia del original mas de un umbral conocido (tau), por ejemplo en evaluaciones reproducibles o en auditorias de cuantizacion, el `manifest.json` aporta la cota por tensor.
- Ejecucion en DGX Spark o V100: el motor incluye kernels precompilados para sm_121a y sm_70, lo que permite desplegar el pack en esas plataformas sin compilar kernels.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni perplejidad, ni comparaciones numericas con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El pack ocupa 38,1 GB en disco; el motor descomprime los pesos en la GPU, por lo que el requisito de VRAM depende de la implementacion del motor y del offload de cache KV, no solo del tamano del pack.
- Offload de cache KV: el motor v1.1.0 permite volcar la cache KV a RAM del sistema (`--kv-window` / `--kv-host`), lo que reduce la VRAM necesaria a costa de memoria host y latencia.
- Multi-GPU: soportado en una misma maquina mediante `--pipeline cuda:0,cuda:1`; tambien soporta un worker de etapa remota para varias maquinas.
- GPU con kernels precompilados: DGX Spark (sm_121a) y V100 (sm_70) incluyen kernels CUDA empaquetados en el motor v1.1.0.
- GPU consumer: no disponible; no se documenta si el pack cabe en tarjetas consumer como la RTX 4090.
- Opciones de despliegue: exclusivamente el motor QVB8 v1.1.0 o superior (https://github.com/addiesam/qvb8). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8R-2e-3 (este pack) | 1.664.080 segun safetensors; nombre sugiere 65B | no disponible | QVB8R, tau 0,002, 38,1 GB | Apache 2.0 | Solo QVB8 v1.1.0+ |
| Ripple-65B-Preview-QVB8R-1e-3 | idem | no disponible | QVB8R, tau 0,001, 47 GB | Apache 2.0 | Solo QVB8 v1.1.0+ |
| Ripple-65B-Preview-QVB8R-2.5e-3 | idem | no disponible | QVB8R, tau 0,0025, 35,5 GB | Apache 2.0 | Solo QVB8 v1.1.0+ |
| Ripple-65B-Preview (bf16, original) | no disponible | no disponible | bf16 | no disponible | `transformers` y otros motores estandar |

La comparacion con modelos de otras familias (Llama, Qwen, Mistral, etc.) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el pack no carga en `transformers` ni en otros motores; sin el motor propietario (v1.1.0 o superior) los pesos son inutilizables.
- La cota L-infinito cubre solo los pesos almacenados: no garantiza que las respuestas del modelo sean identicas a las del original ni correctas. Incluso con pesos fp16 sin cuantizar, distintos motores, tamanos de lote u orden de operaciones en coma flotante producen salidas ligeramente distintas por la no asociatividad de la aritmetica GPU.
- Compromiso tau-tamano: tau mayor implica archivo mas pequeno y mayor perplejidad; tau menor implica archivo mayor y perplejidad mas cercana al original. Este pack (tau 0,002) es un punto intermedio de la familia.
- Discrepancia en el recuento de parametros: el campo de safetensors indica 1.664.080 parametros, incompatible con el nombre "65B" del modelo base; conviene verificar el modelo original antes de planificar el despliegue.
- Sin datos de sesgo, alucinacion ni idiomas: no se documentan sesgos conocidos, tasas de alucinacion ni cobertura linguistica.
- Licencia Apache 2.0 en el pack: permite uso comercial del paquete, pero la licencia del modelo base (ricursiveAI/Ripple-65B-Preview) debe verificarse por separado.
- Modelo "Preview": la denominacion sugiere un estado no final del modelo base; no se documenta su estabilidad.
- Fecha de creacion futura en los metadatos (2026-11-07): conviene tratar las fechas del repo con cautela.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.1.0: https://github.com/addiesam/qvb8/releases/tag/v1.1.0
- Pack QVB8R tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Pack QVB8 tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Pack QVB8 tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Pack QVB8 tau 2.5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2.5e-3
- Pack QVB8R tau 2.5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2.5e-3
- Draft DFlash2 QVB8 tau 5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Draft DFlash2 QVB8R tau 5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
