# rawmodels/Qwen3.8-27B-antislop-pangram-joint-grpo-GGUF

## Resumen

Qwen3.8-27B-antislop-pangram-joint-grpo es un modelo de lenguaje de 27.320.697.856 parametros (27,3 mil millones) publicado por el usuario rawmodels. Se trata de un ajuste fino orientado a investigacion de alineacion: el checkpoint bf16 de partida es el resultado de fusionar el adaptador `joint1` sobre una etapa previa entrenada con GRPO y dirigida a reducir la "slop" estilistica y la probabilidad de ser marcado por Pangram, un detector de texto generado por IA. El repositorio que se documenta aqui contiene unicamente las conversiones a GGUF de ese checkpoint, pensadas para servir el modelo en local.

La relevancia actual del repositorio es fundamentalmente practica: ofrece tres niveles de cuantizacion (Q4_K_M, Q5_K_M y Q6_K) con metricas de fidelidad respecto al bf16 publicadas por el autor, ademas de un proyector multimodal en F16 y una matriz de importancia (imatrix) usada durante la cuantizacion. El modelo conserva la cabeza de prediccion multi-token (MTP) del checkpoint Qwen3.8 original, lo que permite decodificacion especulativa con llama.cpp y un incremento medido del 49,5% en throughput de un solo flujo.

El modelo es multimodal (incluye proyector `mmproj`) y soporta ingles y ruso segun los metadatos. No se especifica licencia, no se han publicado benchmarks de capacidades (MMLU, HumanEval y similares) y el propio autor lo describe como un modelo de investigacion de alineacion, no como un filtro de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; los GGUF evidencian 65 bloques (`blk.64`), una cabeza MTP `nextn` y un proyector multimodal |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible; el ejemplo de servicio de la model card usa `-c 4096` |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K; proyector multimodal en F16; matriz de importancia `imatrix.gguf` |
| Idiomas soportados | en, ru |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Autor | rawmodels |
| Modelo base | rawmodels/Qwen3.8-27B-antislop-pangram-joint-grpo |
| Tamano del repositorio | 59,7 GB |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |
| Cabeza MTP incluida | `blk.64.nextn.*`, `qwen35.nextn_predict_layers=1`, copiada del checkpoint Qwen3.8 original y no entrenada durante el GRPO conjunto |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. Los ficheros GGUF permiten inferir que se trata de un transformer de 65 bloques con una cabeza de prediccion multi-token (`nextn`) y con soporte multimodal a traves de un proyector separado (`mmproj-Qwen3.8-27B-antislop-pangram-joint-grpo-F16.gguf`). La cabeza MTP se copia del checkpoint Qwen3.8 original y no recibio entrenamiento durante la etapa de GRPO conjunto, por lo que su comportamiento especulativo depende del modelo base, no del ajuste.

El entrenamiento descrito es el del checkpoint bf16 subyacente: una etapa previa con GRPO orientada a Pangram sobre la que se fusiona el adaptador `joint1`. El autor verifico la procedencia comparando una capa muestreada del checkpoint bf16 fusionado contra `bf16(peso pangram + delta LoRA joint1)` en 16.384 elementos muestreados, con coincidencia exacta. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO adicionales mas alla del GRPO.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Capacidad multimodal a traves del proyector F16 incluido en el repositorio.
- Decodificacion especulativa mediante la cabeza MTP integrada, activable en llama.cpp con `--spec-type draft-mtp --spec-draft-n-max 2`.
- Estilo ajustado para reducir rasgos asociados a texto generado por IA ("antislop") y la probabilidad asignada por el detector Pangram.
- Multilinguee limitado a ingles y ruso.
- Arquitectura compatible con endpoints gestionados (tag `endpoints_compatible`).
- No hay informacion disponible sobre tool calling, function calling, uso agentico, modo de razonamiento explicito, audio u otras capacidades especiales.

## Casos de uso

- Investigacion de alineacion y estilistica: el modelo esta pensado para estudiar como el GRPO modifica la distribucion de salida frente a detectores de texto IA; se usaria comparando generaciones del bf16 y de cada tier GGUF bajo prompts y sampler identicos.
- Evaluacion de cuantizacion: los tiers Q4_K_M, Q5_K_M y Q6_K permiten medir la perdida de fidelidad (KL y acuerdo top-1) frente al bf16 y decidir el compromiso tamano/calidad en un despliegue concreto.
- Servicio local de chat en ingles o ruso: con llama-server y `-ngl 99` el modelo se puede exponer en un puerto local para asistentes conversacionales que no requieran salir a una API externa.
- Aceleracion de inferencia con MTP: la cabeza `nextn` permite decodificacion especulativa, util en escenarios de un solo flujo donde el margen medido fue de 68,1 a 101,9 tokens/s en una RTX PRO 6000 Blackwell.
- Procesamiento de entradas con imagen: al cargar el `mmproj` con `--mmproj`, el modelo puede atender tareas que combinen imagen y texto, aunque no se detallan las capacidades visuales concretas.
- Auditoria de detectores de IA: el modelo sirve como caso de prueba adversario para validar la robustez de detectores tipo Pangram frente a ajustes deliberados.
- Reproducibilidad de checkpoints fusionados: el metodo de verificacion por muestreo de capas descrito es aplicable como plantilla para auditar otras fusiones de adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son de fidelidad de cuantizacion y de comportamiento frente al detector Pangram.

Fidelidad respecto al GGUF bf16, con teacher forcing sobre respuestas reservadas:

| Tier | KL medio | Mismo top-1 |
|---|---:|---:|
| Q4_K_M | 0,015 | 95,1% |
| Q5_K_M | 0,007 | 96,7% |
| Q6_K | 0,003 | 97,9% |

Detector web Pangram (24 preguntas reservadas x 8 generaciones por tier, prompts y sampler identicos, diferencias pareadas por pregunta con error estandar):

| Tier | Probabilidad media de IA | Diferencia respecto a bf16 |
|---|---:|---:|
| bf16 | 0,915 | — |
| Q4_K_M | 0,936 | +0,021 ± 0,023 |
| Q5_K_M | 0,906 | −0,009 ± 0,022 |
| Q6_K | 0,938 | +0,023 ± 0,027 |

Segun el autor, una probabilidad de IA mas baja es favorable para este detector, las diferencias son menores que su incertidumbre, Q5_K_M es la opcion practica por tamano y fidelidad, y la metrica de este detector web no es comparable con la de la API Pangram v3 usada anteriormente.

Throughput en decodificacion, medido en una RTX PRO 6000 Blackwell con 12 prompts greedy secuenciales reservados y limite de 192 tokens:

| Configuracion | Tokens/s de salida |
|---|---:|
| Q4_K_M sin MTP | 68,1 |
| Q4_K_M con MTP | 101,9 |

La cabeza especulativa acepto 1.171 de 2.217 tokens propuestos (52,8%). El autor advierte que estas cifras de contexto corto y un solo flujo no predicen el rendimiento con peticiones concurrentes.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 27,3 mil millones de parametros y los bits por peso tipicos de cada tier: Q4_K_M en torno a 15-16 GB, Q5_K_M en torno a 18-19 GB y Q6_K en torno a 22-23 GB. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- Hay que sumar el proyector multimodal F16, la cache KV del contexto configurado y el buffer de decodificacion especulativa. El repositorio completo ocupa 59,7 GB porque incluye los tres tiers y los ficheros auxiliares.
- GPU de 24 GB (RTX 4090, RTX 3090): Q4_K_M entra con holgura y Q6_K queda muy justo; conviene reducir contexto para dejar espacio a la cache KV.
- GPU de 32 GB (RTX 5090) o 40-48 GB (A100 40 GB, L40S, A6000): permiten Q6_K con contexto amplio.
- GPU de 80-96 GB (A100 80 GB, H100 80 GB, RTX PRO 6000 Blackwell): el autor midio el rendimiento de referencia en una RTX PRO 6000 Blackwell, con `-ngl 99` y todo el modelo en GPU.
- Despliegue: llama.cpp mediante `llama-server` es la via documentada, con `-ngl 99` para offload completo. La decodificacion especulativa con la cabeza MTP requiere la revision `feb9a3d` de llama.cpp y los flags `--spec-type draft-mtp --spec-draft-n-max 2`.
- Para servir solo texto, se omite `--mmproj`.
- No hay informacion disponible sobre compatibilidad con vLLM, TGI, Ollama u otros motores. Al ser un GGUF, los motores que no soportan este formato requeririan una conversion previa.
- Latencia y throughput: 68,1 tokens/s sin MTP y 101,9 tokens/s con MTP en el escenario de un solo flujo descrito. No hay datos de despliegue concurrente.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (transformers multimodales de aproximadamente 27 mil millones de parametros con cuantizacion GGUF), ni resultados de benchmarks que permitan situar este modelo frente a alternativas. Tampoco se detalla la relacion exacta entre este ajuste y los pesos publicos de la familia Qwen3.8 mas alla de que la cabeza MTP se copia del checkpoint original.

## Limitaciones y advertencias

- La licencia figura como no disponible, por lo que no puede confirmarse la legalidad del uso comercial ni de la redistribucion.
- El propio autor lo define como un modelo de investigacion de alineacion y no como un filtro de seguridad. No debe emplearse como capa de moderacion ni de control de contenido.
- El ajuste persigue explicitamente reducir la probabilidad detectada por Pangram, un detector de texto generado por IA. Usarlo para ocultar el origen sintetico de un texto tiene implicaciones eticas y, en algunos contextos academicos o editoriales, normativas.
- La probabilidad media de IA en el propio tier bf16 es de 0,915 y las diferencias entre tiers son menores que su incertidumbre (entre ±0,022 y ±0,027), por lo que no hay evidencia solida de que la cuantizacion altere este comportamiento.
- El autor reconoce que la comparacion previa de cuatro muestras que situaba Q5 por detras de Q4 no se reprodujo, lo que indica fragilidad en las mediciones con muestras pequenas.
- No hay benchmarks de capacidades publicados, solo metricas de fidelidad de cuantizacion y de deteccion. El rendimiento real en razonamiento, codigo o matematicas es desconocido.
- Idiomas soportados limitados a ingles y ruso. No se declara soporte de castellano.
- No hay informacion sobre sesgos, datos de entrenamiento ni filtrado del corpus, por lo que no puede evaluarse el sesgo interno.
- Riesgo de alucinacion inherente a un modelo de 27 mil millones de parametros sin datos de evaluacion factual; no se han publicado tasas de alucinacion.
- La cabeza MTP no se entreno durante el GRPO conjunto, de modo que la decodificacion especulativa depende del modelo base y su tasa de aceptacion (52,8%) puede variar con el dominio.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y las metricas publicadas son del propio autor, sin replicacion independiente.
- Las cifras de throughput corresponden a un unico escenario de un solo flujo con contexto corto y no son extrapolables a servicio concurrente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-pangram-joint-grpo-GGUF
- Modelo base (checkpoint bf16 fusionado): https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-pangram-joint-grpo
- Perfil del autor: https://huggingface.co/rawmodels
- Revision de llama.cpp con soporte de `--spec-type draft-mtp`: commit `feb9a3d`, referenciado en la model card sin URL proporcionada.
