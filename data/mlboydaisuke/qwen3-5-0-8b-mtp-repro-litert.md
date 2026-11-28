# mlboydaisuke/Qwen3.5-0.8B-MTP-repro-LiteRT

## Resumen

Qwen3.5-0.8B-MTP-repro-LiteRT es un artefacto de reproduccion de errores publicado por el usuario mlboydaisuke, no un modelo listo para produccion. Consiste en una conversion del modelo base Qwen/Qwen3.5-0.8B al formato `.litertlm` de LiteRT-LM, empaquetada junto con la cabeza MTP (multi-token prediction) de una capa del propio checkpoint para alimentar la decodificacion especulativa del runtime. El objetivo declarado es permitir reproducir el issue #3439 de LiteRT-LM, en el que el motor, con `--speculative-decoding true`, no confirma el token de parada al final del turno.

El modelo base es un transformer hibrido de Qwen con arquitectura Gated DeltaNet, de 0,8 mil millones de parametros y entorno de 4096 tokens de cache en este empaquetado. Los pesos se han cuantizado a int8 de rango dinamico tanto en las capas lineales como en las tablas de embedding. El repositorio ocupa 2,9 GB e incluye el grafo base con firmas de prefill, decode y verify, un embedder externalizado, el tokenizador y la seccion drafter.

Su relevancia es fundamentalmente tecnica y de depuracion: sirve como banco de pruebas reproducible para quien trabaje en decodificacion especulativa sobre edge, y como ejemplo de receta abierta de conversion HF a LiteRT-LM con cabeza MTP. No debe confundirse con una distribucion estable del modelo; el propio autor remite a litert-community/Qwen3.5-0.8B para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet (tag `hybrid`, `gated-deltanet`) |
| Parametros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens de cache en este empaquetado |
| Tipos de cuantizacion | int8 de rango dinamico en lineales y tablas de embedding |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |
| Tamano del repositorio | 2,9 GB (bundle principal de 1,47 GB) |
| Runtime | litert-lm 0.16.0 / 0.16.1 (CLI), backend CPU |
| Decodificacion especulativa | Cabeza MTP de 1 capa como drafter, 3 tokens borrador por ronda |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura hibrida que combina atencion con Gated DeltaNet, segun los tags del repositorio. Sobre esa base, este artefacto anade una cabeza MTP de una sola capa con cabeza completa, extraida del propio checkpoint, que actua como drafter en el esquema de decodificacion especulativa de LiteRT-LM bajo la firma `tf_lite_mtp_drafter`. El grafo exportado incluye firmas de prefill, decode y verify, con el embedder externalizado y el tokenizador empaquetado en el mismo fichero.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo base original y no se detallan en la model card. La innovacion tecnica destacable es el propio pipeline de conversion: la receta abierta en `hf-to-litertlm/mtp_work` (litert-torch en el commit 115a136 mas un parche, y litert-lm 0.16.0 para el empaquetado) permite reproducir el bundle y verificar la equivalencia numerica contra el modelo HF en fp32.

## Capacidades

- Generacion de texto de un solo turno en el backend CPU de LiteRT-LM.
- Decodificacion especulativa mediante cabeza MTP, con 3 tokens borrador por ronda y tasas de aceptacion medidas de 0,48 a 0,71 por token borrador.
- Plantilla de chat ChatML simple con el modo thinking desactivado.
- Soporte de la forma de content-parts de litert-lm 0.18 en la plantilla de chat (desde el 2026-09-21); la forma de cadena no cambia.
- Verificacion de correctitud a nivel de interprete frente al modelo HF fp32: 33 de 33 comprobaciones, con diferencia maxima de logits de 6e-5 y argmax identico en cada posicion confirmada.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues en la informacion disponible.

## Casos de uso

- Reproduccion del bug #3439 de LiteRT-LM: el script `stop_token_probe_3439.py` ejecuta una conversacion codiciosa de 5 turnos con el flag apagado y encendido, e imprime por turno el numero de tokens de decode confirmados, el tamano del prefill y el `token_count` de la conversacion. Es el uso principal del artefacto.
- Validacion de pipelines de conversion HF a LiteRT-LM: sirve como referencia para comprobar que una exportacion con cabeza MTP conserva la equivalencia numerica frente al modelo original en fp32.
- Pruebas de decodificacion especulativa en edge: permite medir tasas de aceptacion del drafter y throughput de prefill y decode en CPU, con cifras de referencia sobre Apple M4 Max y moviles.
- Desarrollo de correctivos en el runtime: al ser un bundle listo para usar, un mantenedor de LiteRT-LM puede verificar una correccion del issue #3439 sin tener que reconstruir el modelo.
- Investigacion sobre degradacion en conversaciones multi-turno: el artefacto documenta como el modelo de 0,8B se degrada visiblemente en turnos posteriores cuando falta el token de fin de turno, lo que sirve para estudiar la propagacion de errores en transcripts.
- Benchmarking comparativo de backends: las mediciones publicadas (611,5 frente a 627,1 tok/s de prefill; 52,3 frente a 58,4 tok/s de decode) permiten contrastar el comportamiento de CPU en escritorio y en movil (Galaxy S26: 32,4 a 22,9 tok/s con el flag activo).

## Benchmarks y rendimiento

Rendimiento medido en macOS, Apple M4 Max, CPU, litert-lm 0.16.0 CLI, `benchmark -p 128 -d 256 --cache no`, 2026-09-01:

| Flag | Prefill tok/s | Decode tok/s |
|---|---|---|
| `--speculative-decoding false` | 611,5 | 52,3 |
| `--speculative-decoding true` | 627,1 | 58,4 (1,12x) |

Aceptacion del motor en cuatro prompts: 0,48 a 0,71 por token borrador, es decir, 2,4 a 3,1 tokens confirmados por ronda (media 2,76). En Galaxy S26 (CPU, ejecuciones limitadas a 150 tokens, con esperas de enfriamiento y mediana de 3) el flag activo fue mas lento con texto de documento: de 32,4 a 22,9 tok/s. En iPhone, el autor reporta que fue aun mas lento en su arnes de pruebas.

Registro de correctitud: comparacion a nivel de interprete contra el modelo HF fp32 con rechazo forzado en cada indice de borrador, 33 de 33 comprobaciones con diferencia maxima de logits de 6e-5 y argmax igual en cada posicion confirmada. En el runtime publicado (0.16.0, CPU), prueba de chat de 8 preguntas con 7 aciertos y rellenos de una palabra de 1 a 16 con el flag activo, 16 de 16. Frente al mismo bundle con el flag apagado, 1 de 4 prompts resulto byte-identico; el resto diverge en empates cercanos de int8 (brecha top-2 del arbitro HF fp32 de 0,125 a 0,375 en cada divergencia).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el bundle pesa 1,47 GB en int8 y el repositorio completo 2,9 GB, por lo que encaja en memoria unificada o RAM de equipos modestos.
- Backend verificado: solo CPU. El backend GPU no se comprobo con la seccion drafter.
- GPU recomendadas: no disponibles; el autor no reporta pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: previsiblemente si por tamano, pero no hay validacion publicada del backend GPU con este bundle.
- Despliegue: CLI de litert-lm 0.16.0 o 0.16.1 (`litert-lm run` y `litert-lm benchmark`), con `--backend cpu` y `--speculative-decoding true|false`.
- Latencia y throughput: 611,5 a 627,1 tok/s de prefill y 52,3 a 58,4 tok/s de decode en Apple M4 Max; 22,9 a 32,4 tok/s en Galaxy S26 con texto de documento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-MTP-repro-LiteRT | 0,8B | 4096 (cache) | `.litertlm` int8 | Apache 2.0 | Artefacto de reproduccion de bug, solo CPU verificado |
| litert-community/Qwen3.5-0.8B | 0,8B | no disponible | LiteRT-LM | Apache 2.0 | Conversion recomendada por el autor para uso real |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | safetensors | Apache 2.0 | Modelo base original en precision completa |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de prueba, no una release; el autor lo declara explicitamente.
- Con `--speculative-decoding true`, el runtime no confirma el token de parada al final del turno (issue #3439): el transcript pierde cada `<|im_end|>` y el `token_count` deriva en -1 por turno.
- El modelo de 0,8B se degrada visiblemente en turnos posteriores bajo el flag; en la sonda, las respuestas pasan de "MANGO" a "M" en los ultimos turnos.
- Solo se ha verificado el backend CPU; el backend GPU no se comprobo con la seccion drafter.
- Un unico Engine por conversacion: en litert-lm 0.18.0 el runtime reutiliza el estado recurrente de una conversacion anterior en el mismo Engine y no lo reinicia (issue #3165 del autor).
- Divergencia frente al flag apagado por empates cercanos en int8, no por errores de contrato.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de esta conversion.
- Licencia Apache 2.0 permite uso comercial, pero el estado de bug del artefacto desaconseja cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3.5-0.8B-MTP-repro-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Conversion recomendada: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Issue #3439 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/issues/3439
- Issue #3165 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Receta de conversion: https://github.com/john-rocky/hf-to-litertlm/tree/main/mtp_work
