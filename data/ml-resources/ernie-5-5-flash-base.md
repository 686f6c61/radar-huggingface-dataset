# ml-resources/ERNIE-5.5-Flash-Base

## Resumen

ERNIE-5.5-Flash-Base es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por Baidu, publicado como checkpoint al final del preentrenamiento, antes de cualquier fase de entrenamiento intermedio o posterior. Con 280 mil millones de parametros totales y 14 mil millones activados por token, esta disenado explicitamente como base para adaptacion de dominio, ajuste fino por instrucciones e investigacion en aprendizaje por refuerzo, dejando al desarrollador la eleccion del rumbo posterior.

La arquitectura combina atencion hibrida: 43 capas en total (1 FFN densa y 42 capas MoE latentes Multi-Router), de las cuales 37 usan Heavily Compressed Attention (HCA) y 6 usan Multi-head Latent Attention (MLA) con atencion dispersa (DSA). El modelo se entreno desde cero sobre 33,5 billones de tokens con el optimizador Muon y un contexto de entrenamiento de hasta 128K tokens; el ajuste fino y la inferencia admiten hasta 1 millon de tokens.

Su relevancia actual reside en la eficiencia: el diseno trata el computo activado, la cache KV y el coste del contexto largo como un unico problema de optimizacion, con compresion agresiva de la cache (una entrada por cada 128 tokens en las capas HCA) y routers multiples sobre expertos latentes de media anchura. Se distribuye en FP8 (safetensors) y en BF16, con licencia propia y soporte para ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atencion hibrida MLA + HCA, 43 capas (1 FFN densa + 42 MoE) |
| Parametros totales | 286.245.697.882 (286B; la model card indica 280B) |
| Parametros activos | 14B por token |
| Longitud de contexto | 128K en entrenamiento; 1M en ajuste fino e inferencia |
| Tipos de cuantizacion | FP8 (safetensors) y BF16 (safetensors); no se detallan otras en la informacion disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | ernie-5.5-flash-base-model-license-v1.0 (license: other) |
| Formato de pesos | safetensors (variantes FP8 y BF16) |

## Arquitectura y entrenamiento

El modelo es un MoE disperso de 43 capas: una capa FFN densa seguida de 42 capas Multi-Router Latent MoE. Cada capa MoE contiene 512 expertos enrutados (top-10 activos) mas 1 experto compartido. La atencion es hibrida: una de cada siete capas conserva acceso a contexto completo mediante MLA, mientras que el resto emplea Heavily Compressed Attention (HCA), que cachea una sola entrada por cada 128 tokens. Las dimensiones de cabeza se ajustan al coste de cada capa: las capas HCA, que atienden sobre una secuencia comprimida 128x, usan cabezas anchas de 512 dimensiones, mientras que las capas MLA, mas costosas por token, usan cabezas de 256 dimensiones. Las capas MLA adoptan DSA, igualando a la atencion densa en perdida de preentrenamiento sin que el coste de atencion por consulta crezca con la longitud de contexto.

Se incorporan dos innovaciones adicionales en todas las capas de atencion, junto con QK-norm: Low-Rank Gated Attention, que calcula la puerta de salida de la atencion a partir del latente de consulta de bajo rango en lugar del estado oculto, reduciendo un 75% los parametros de proyeccion de la puerta y mejorando el rendimiento; y Virtual Head Attention (VHA), una mezcla posterior entre cabezas de bajo rango con skip de identidad, fusionada en el operador de atencion en inferencia. El enrutamiento Multi-Router sustituye el router unico por varios routers sobre expertos latentes de media anchura, ya que las puntuaciones de un solo router correlacionan debilmente con la utilidad real del experto, especialmente en capas intermedias y profundas. El preentrenamiento se realizo desde cero sobre 33,5 billones de tokens con el optimizador Muon, priorizando datos dificiles de incorporar despues, como codigo a escala de repositorio y comprension de contexto largo.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento general, matematicas y conocimiento factual, segun la evaluacion unificada reportada por el autor.
- Generacion y comprension de codigo a escala de repositorio, incluido en los datos de preentrenamiento.
- Comprension de contexto largo: hasta 1M tokens en inferencia y ajuste fino.
- Capacidades multilingues limitadas a ingles y chino.
- Base para ajuste fino por instrucciones, adaptacion de dominio y aprendizaje por refuerzo.
- Soporte de tool calling y comportamiento agentico: no confirmado en la informacion disponible para este checkpoint base; la model card menciona aplicaciones agenticas como motivacion de diseno, no como capacidad verificada del checkpoint.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Ajuste fino por instrucciones: al ser un checkpoint al final del preentrenamiento, sirve como punto de partida para SFT y DPO orientados a dominios concretos, sin heredar sesgos de alineamiento previos.
- Adaptacion de dominio en codigo: el preentrenamiento incluye codigo a escala de repositorio, lo que lo hace adecuado para ajustar asistentes de revision de PR, generacion de tests o migracion de bases de codigo con contexto de hasta 1M tokens.
- Investigacion en aprendizaje por refuerzo: la publicacion de pesos base permite experimentar con RLHF y RL sobre razonamiento sin partir de un modelo ya alineado.
- Procesamiento de documentos largos en chino e ingles: contratos, expedientes o informes de cientos de miles de tokens que caben en la ventana de 1M, con coste de cache KV reducido gracias a HCA.
- Analisis de repositorios completos: la ventana extendida y el entrenamiento en codigo permiten tareas de comprension global de un repositorio en una sola pasada.
- Destilacion y generacion de datos sinteticos: como modelo base de 14B activos, puede generar corpus de entrenamiento para modelos menores en ingles y chino.
- Evaluacion comparativa de arquitecturas MoE: util como referencia reproducible frente a otros MoE de tamano similar bajo el mismo pipeline de evaluacion del autor.

## Benchmarks y rendimiento

La model card indica que el modelo se evaluo bajo un pipeline unificado en conocimiento, razonamiento, matematicas, codigo, multilingue y contexto largo, y que los resultados completos se presentan en una tabla comparativa junto a DeepSeek-V4-Flash-Base (284B-A13B), Hy3-preview-Base (295B-A21B) y MiMo-V2.5-Base (310B-A15B). Sin embargo, los valores numericos no se incluyen en la informacion proporcionada (la tabla figura como imagen en la model card).

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP8, los 286B parametros ocupan aproximadamente 286 GB solo en pesos; en BF16, unos 572 GB. A ello se suma la cache KV, reducida por HCA pero no despreciable con contexto de 1M tokens.
- GPU recomendadas: no cabe en una sola GPU consumer. Requiere nodos multi-GPU, tipicamente H100 80GB, H200 o A100 80GB en configuraciones de 8 o mas unidades para FP8, y el doble para BF16.
- GPU consumer: no es viable en RTX 4090 ni en ninguna GPU consumer actual por capacidad de memoria, incluso con cuantizacion agresiva no publicada.
- Opciones de despliegue: transformers (libreria declarada); no se confirman en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ERNIE-5.5-Flash-Base | 280B / 14B | 128K entrenamiento, 1M inferencia | ernie-5.5-flash-base-model-license-v1.0 | Hugging Face y ModelScope (FP8 y BF16) |
| DeepSeek-V4-Flash-Base | 284B / 13B | no disponible | no disponible | no disponible |
| Hy3-preview-Base | 295B / 21B | no disponible | no disponible | no disponible |
| MiMo-V2.5-Base | 310B / 15B | no disponible | no disponible | no disponible |

Los tres modelos comparables aparecen citados por el autor como referencias del mismo pipeline de evaluacion, pero no se dispone de sus especificaciones completas ni de sus resultados numericos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint base sin alineamiento: no sigue instrucciones de forma fiable ni incorpora salvaguardas conversacionales; requiere ajuste fino antes de uso en produccion orientado a usuario final.
- Riesgo de alucinacion inherente a un modelo base; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; cabe esperar sesgos derivados de los datos de preentrenamiento, no auditados aqui.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- La licencia es propia (ernie-5.5-flash-base-model-license-v1.0) y no es de codigo abierto estandar; deben revisarse las restricciones de uso comercial en el fichero LICENSE antes de desplegar.
- Requisitos de hardware muy elevados: no desplegable en infraestructura de una sola GPU, lo que limita su uso a entornos con nodos multi-GPU.
- El contexto de 1M tokens en inferencia no implica que el modelo mantenga calidad uniforme en toda la ventana; no se han publicado mediciones de degradacion por posicion.
- La ficha de Hugging Face consultada pertenece a la organizacion ml-resources, no a baidu; los pesos oficiales se enlazan en la model card a los repositorios de Baidu.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/ml-resources/ERNIE-5.5-Flash-Base
- Hugging Face (oficial, FP8): https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Hugging Face (oficial, BF16): https://huggingface.co/baidu/ERNIE-5.5-Flash-Base-BF16
- ModelScope (FP8): https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Base
- ModelScope (BF16): https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Base-BF16
- Blog tecnico: https://ernie.baidu.com/release/ernie-5-5-flash-base/
- Paper Virtual Head Attention (VHA): https://arxiv.org/abs/2610.17959
- Paper Multi-Router: https://arxiv.org/abs/2610.40577
- Paper adicional referenciado (arxiv:2610.24766): https://arxiv.org/abs/2610.24766
- Cuenta de X: https://x.com/Baidu_ERNIE
