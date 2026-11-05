# baidu/ERNIE-5.5-Flash-Base

## Resumen

ERNIE-5.5-Flash-Base es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por Baidu, con 280.000 millones de parametros totales y 14.000 millones activados por token. Se trata del checkpoint al final del preentrenamiento, antes de cualquier fase de mid-training o post-training, por lo que esta pensado como punto de partida para adaptacion de dominio, ajuste por instrucciones e investigacion en aprendizaje por refuerzo. Emplea una arquitectura hibrida de atencion que combina Multi-head Latent Attention (MLA) con atencion dispersa y Heavily Compressed Attention (HCA).

El modelo fue preentrenado desde cero sobre 33,5 billones de tokens con un contexto de entrenamiento de hasta 128K tokens, aunque el ajuste fino y la inferencia admiten ventanas de hasta 1 millon de tokens. Su diseno prioriza la eficiencia: coste de computo activado, cache KV y coste de contexto largo se tratan como un unico problema de diseno, con innovaciones como Low-Rank Gated Attention, Virtual Head Attention y Multi-Router Latent MoE.

Es relevante ahora porque Baidu publica los pesos al final del preentrenamiento en lugar de solo un modelo ya alineado, lo que permite a desarrolladores e investigadores partir de capacidades generales solidas en conocimiento, razonamiento, matematicas, codigo, multilingue y contexto largo, y decidir ellos mismos la especializacion posterior. Los pesos se distribuyen en FP8 (safetensors) y en una variante BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion MLA + DSA y HCA; 43 capas (1 FFN densa + 42 Multi-Router Latent MoE) |
| Parametros totales | 286.245.697.882 (280B nominales) |
| Parametros activos | 14B por token |
| Longitud de contexto | 128K en entrenamiento; 1M en ajuste fino e inferencia |
| Tipos de cuantizacion | FP8 (safetensors) y BF16 (safetensors); no se detallan otras en la informacion disponible |
| Idiomas soportados | en, zh |
| Licencia | ernie-5.5-flash-base-model-license-v1.0 (license: other) |
| Formato de pesos | safetensors (FP8 y BF16) |

## Arquitectura y entrenamiento

El modelo es un MoE disperso de 43 capas: una capa con FFN densa y 42 capas Multi-Router Latent MoE. Cada capa MoE contiene 512 expertos enrutados (top-10) mas un experto compartido. La atencion es hibrida: 37 capas usan Heavily Compressed Attention (HCA), que cachea una sola entrada por cada 128 tokens, y 6 capas usan Multi-head Latent Attention (MLA) con atencion dispersa (DSA), manteniendo acceso a contexto completo. Las dimensiones de cabeza se ajustan al coste de cada capa: las capas HCA, que atienden sobre una secuencia comprimida 128x, usan cabezas anchas de 512 dimensiones, mientras que las capas MLA, mas costosas por token, usan cabezas de 256 dimensiones. Segun el autor, con un presupuesto de cache KV comparable, emparejar HCA con MLA supera a emparejarla con Compressed Sparse Attention (CSA); las capas MLA con DSA igualan a la atencion densa en perdida de preentrenamiento sin que su coste de atencion por consulta crezca con la longitud de contexto.

El preentrenamiento se realizo desde cero sobre 33,5 billones de tokens con el optimizador Muon y contexto de hasta 128K. Los datos priorizan capacidades dificiles de incorporar despues, como codigo a escala de repositorio y comprension de contexto largo. Entre las innovaciones tecnicas destacan Low-Rank Gated Attention, que calcula la puerta de salida de la atencion a partir del latente de consulta de bajo rango en lugar del estado oculto, reduciendo un 75% los parametros de proyeccion de la puerta y mejorando el rendimiento; Virtual Head Attention (VHA), que anade una mezcla posterior entre cabezas de bajo rango con skip de identidad fusionada en el operador de atencion en inferencia; y Multi-Router Latent MoE, que sustituye el enrutador unico por varios enrutadores sobre expertos latentes de media anchura, ya que las puntuaciones de un solo enrutador correlacionan debilmente con la utilidad real de los expertos, especialmente en capas intermedias y profundas. Todas las capas de atencion incorporan QK-norm. No se detalla en la informacion disponible si hubo RLHF, DPO u otras fases de alineacion, ya que el checkpoint es previo a mid-training y post-training.

## Capacidades

- Generacion de texto y modelado de lenguaje general, al ser un checkpoint base sin alineacion.
- Conocimiento y razonamiento evaluados en benchmarks de conocimiento, razonamiento, matematicas y codigo bajo un pipeline unificado del autor.
- Codigo a escala de repositorio, priorizado explicitamente en los datos de preentrenamiento.
- Comprension de contexto largo: ventana de 128K en entrenamiento y hasta 1M en ajuste fino e inferencia.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el autor menciona aplicaciones agenticas como motivacion de diseno, sin detallar capacidades concretas).
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Punto de partida para ajuste por instrucciones: al ser un checkpoint al final del preentrenamiento, un equipo puede aplicar SFT y DPO sobre el para construir un asistente conversacional especializado sin partir de cero.
- Adaptacion de dominio en chino e ingles: el modelo puede ajustarse con datos propios de sectores como legal, financiero o sanitario, aprovechando sus 280B parametros totales y su base de 33,5 billones de tokens.
- Investigacion en aprendizaje por refuerzo: el autor lo presenta explicitamente como base para investigacion en RL, de modo que un laboratorio puede entrenar politicas de razonamiento sobre el checkpoint.
- Analisis de documentos largos: con contexto de hasta 1M tokens en inferencia, es adecuado para resumir o extraer informacion de repositorios de documentacion, expedientes o bases de codigo extensas.
- Asistencia de codigo a escala de repositorio: su preentrenamiento enfatizado en codigo de repositorio lo hace util como base para autocompletado, generacion y revision de codigo en pipelines internos tras el ajuste correspondiente.
- Despliegue eficiente en produccion: con 14B parametros activos por token y pesos FP8, puede servir inferencia con un coste de computo por token mucho menor que un modelo denso de 280B, lo que facilita su integracion en infraestructuras con presupuesto de GPU acotado.
- Experimentacion academica con arquitecturas MoE hibridas: sus componentes (HCA, MLA con DSA, Multi-Router Latent MoE, VHA) sirven como referencia reproducible para estudiar eficiencia en atencion y enrutamiento.

## Benchmarks y rendimiento

El autor indica que el modelo se evalua bajo un pipeline unificado junto a DeepSeek-V4-Flash-Base (284B-A13B), Hy3-preview-Base (295B-A21B) y MiMo-V2.5-Base (310B-A15B), con los mismos prompts y ajustes de few-shot, y que los resultados completos estan en la tabla de la model card y en el blog tecnico. Sin embargo, los valores numericos concretos no estan incluidos en la informacion proporcionada.

| Benchmark | ERNIE-5.5-Flash-Base | DeepSeek-V4-Flash-Base | Hy3-preview-Base | MiMo-V2.5-Base |
|---|---|---|---|---|
| MMLU | no disponible | no disponible | no disponible | no disponible |
| HumanEval | no disponible | no disponible | no disponible | no disponible |
| GSM8K | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 286 GB, por lo que se necesita un nodo multi-GPU; en BF16 el requisito ronda los 572 GB solo para pesos.
- Al ser un MoE con 14B parametros activos, el coste de computo por token es comparable al de un modelo denso de ~14B, pero la memoria debe alojar los 280B parametros totales.
- GPU recomendadas: no disponible en la informacion proporcionada; por el volumen de pesos, se requieren configuraciones multi-GPU de clase centro de datos (varias A100/H100) o agregacion de memoria entre varias GPU.
- Cabe en GPU de consumo: no, el tamano del checkpoint (304,4 GB en el repo) excede la VRAM de cualquier GPU de consumo individual.
- Opciones de despliegue: la model card solo confirma compatibilidad con la libreria transformers; no se detallan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Base | 280B | 14B | 128K entrenamiento / 1M inferencia | ernie-5.5-flash-base-model-license-v1.0 | Hugging Face y ModelScope (FP8 y BF16) |
| DeepSeek-V4-Flash-Base | 284B | 13B | no disponible | no disponible | citado como referencia de evaluacion |
| Hy3-preview-Base | 295B | 21B | no disponible | no disponible | citado como referencia de evaluacion |
| MiMo-V2.5-Base | 310B | 15B | no disponible | no disponible | citado como referencia de evaluacion |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada; el autor afirma que los resultados completos se publican en el blog tecnico y en la tabla de la model card.

## Limitaciones y advertencias

- Es un checkpoint base sin alineacion: no esta ajustado por instrucciones ni con RLHF/DPO, por lo que su uso directo en chat producira respuestas no alineadas con expectativas conversacionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje preentrenados; no se documentan mitigaciones en la informacion disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada; cabe esperar sesgos derivados de los datos de preentrenamiento, sin que el autor los detalle.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- Licencia no estandar (ernie-5.5-flash-base-model-license-v1.0): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que no se trata de una licencia open source reconocida.
- El contexto de 1M tokens aplica a ajuste fino e inferencia, no al entrenamiento original (128K); el rendimiento mas alla de 128K puede degradarse.
- Requisitos de hardware muy elevados: los pesos FP8 ocupan unos 286 GB, lo que excluye el despliegue en GPU de consumo y exige infraestructura multi-GPU.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision o audio, por lo que no deben asumirse en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Variante BF16 en Hugging Face: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base-BF16
- ModelScope: https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Base
- ModelScope (BF16): https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Base-BF16
- Blog tecnico: https://ernie.baidu.com/release/ernie-5-5-flash-base/
- X (Twitter) de Baidu ERNIE: https://x.com/Baidu_ERNIE
- Paper Virtual Head Attention (VHA): https://arxiv.org/abs/2610.17959
- Paper Multi-Router: https://arxiv.org/abs/2610.40577
- Paper adicional citado en los tags: https://arxiv.org/abs/2610.24766
