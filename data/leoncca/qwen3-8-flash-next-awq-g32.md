# leoncca/Qwen3.8-Flash-Next-AWQ-g32

## Resumen

Qwen3.8-Flash-Next-AWQ-g32 es una cuantizacion AWQ de 4 bits (W4A16) del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario leoncca. El checkpoint original pertenece a la familia Qwen y esta disenado para tareas image-text-to-text, es decir, generacion de texto condicionada por imagenes. Esta version reduce el peso del modelo respecto al BF16 original manteniendo las escalas K/V en FP8 E4M3 calibradas y un draft MTP tambien en FP8.

El modelo es un transformer de tipo Mixture-of-Experts (MoE) con 179.999.981.459 parametros totales segun los safetensors del repositorio, 48 capas y 512 expertos enrutados por capa (24.576 expertos en total). La cuantizacion se aplica exclusivamente a las proyecciones gate_proj, up_proj y down_proj de esos expertos, con formato AWQ asimetrico de grupo 32, zero point entero y empaquetado GEMM. El resto de tensores no enrutados se conserva del checkpoint fuente.

Su relevancia practica es doble: por un lado, permite servir un modelo de escala muy grande en hardware antiguo, ya que el autor recomienda su motor ReVolta sobre 4 x V100 de 32 GB (SM70); por otro, documenta de forma inusualmente detallada el proceso de calibracion, los hashes de los shards y las metricas de fidelidad frente al BF16 de referencia, lo que facilita auditar la cuantizacion antes de desplegarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen4Exp) con atencion QSA y draft MTP; multimodal image-text-to-text |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 asimetrico, group size 32, zero point entero, empaquetado GEMM; escalas de experto en FP16; PLE en FP8 oficial; K/V QSA en FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (85 shards, 137,07 GB / 127,66 GiB) |

## Arquitectura y entrenamiento

El checkpoint es una derivacion cuantizada, no un modelo entrenado desde cero. La arquitectura subyacente es un MoE con 48 capas y 512 expertos enrutados por capa, con expertos de anchura 640, mas componentes compartidos: router, shared expert con sus proyecciones gate/up/down, shared-expert gate, HC norm y dos carriers de down-projection del HC. Incorpora ademas capas QSA con escalas K/V en FP8 E4M3 y un draft MTP en FP8 para decodificacion especulativa.

La cuantizacion se realizo con GPTQ amortiguado (damping 0,3 en gate/up y 1,0 en down) sobre la madre oficial en BF16, usando activaciones reales capturadas del release anterior servido en vLLM, sobre el corpus `public80-v1mix20`, con 169.614 filas de calibracion por capa. Las escalas s1 por capa y s2 por experto se rebuscaron con segundos momentos de las activaciones; los 384 carriers de compensacion no enrutados se recalcularon en FP32 y se almacenaron en FP16. Los 24 escalares FP32 de escala K/V de las 12 capas QSA se conservaron del calibrado previo (4.130.597 tokens de prompt procesados) y no se recalibraron. Todos los expertos estan cuantizados sin bypass de routing; solo siete pares capa/experto sin cobertura natural usan 2.048 filas equiespaciadas de su capa como proxy.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada multimodal image-text-to-text: el pipeline declarado es image-text-to-text y el autor menciona soporte de entrada multimodal en su motor ReVolta.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8-Flash-Next, si bien no se documentan evaluaciones especificas en la informacion disponible.
- Decodificacion especulativa mediante draft MTP en FP8, incluida en el checkpoint.
- Atencion con escalas K/V calibradas en FP8 E4M3 sobre 12 capas QSA.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta cumplimentado.

## Casos de uso

- Servicio de inferencia multimodal en infraestructura V100: el checkpoint esta pensado para desplegarse con ReVolta sobre 4 x V100 de 32 GB, lo que permite reutilizar hardware SM70 para un modelo de 180.000 millones de parametros con entrada de imagen y texto.
- Descripcion y analisis de imagenes en lote: al ser un modelo image-text-to-text, puede procesar imagenes acompanadas de instrucciones textuales para generar descripciones, extraer informacion o responder preguntas sobre el contenido visual.
- Asistentes conversacionales con contexto visual: integrable en aplicaciones de chat donde el usuario adjunta capturas o fotografias y espera respuestas multi-turno.
- Sustitucion de un despliegue BF16 por uno de 4 bits: el formato W4A16 reduce el peso a 137,07 GB en 85 shards, lo que facilita alojarlo en nodos con menos memoria que el original en BF16.
- Evaluacion y auditoria de cuantizaciones: los ficheros `MODEL_PROVENANCE.json`, `VALIDATION.json`, `EXPERT_COVERAGE.json` y `PUBLIC_RELEASE_AUDIT.json` permiten reproducir y verificar el proceso de cuantizacion en entornos de investigacion.
- Prototipado de pipelines de decodificacion especulativa: el draft MTP en FP8 incluido sirve para experimentar con aceleracion de inferencia en vLLM o en el motor ReVolta.
- Investigacion sobre robustez de modelos cuantizados: las metricas KL frente al BF16 (0,0207 de media en top-20-plus-tail sobre 66 registros de texto) permiten estudiar el impacto de la cuantizacion en la distribucion de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta comprobaciones de fidelidad frente al BF16 de referencia:

| Metrica | Release anterior | Release actual |
|---|---|---|
| KL media top-20-plus-tail (66 registros de texto) | 0,0305 | 0,0207 |
| Acuerdo top-1 | 96,32 % | 97,06 % |

Estas cifras son controles acotados de fidelidad, no puntuaciones de capacidad general, y el propio autor advierte de sus limitaciones de aproximacion y de runtime.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 137,07 GB (127,66 GiB) en 85 shards; se necesita al menos esa cantidad de memoria agregada para cargar los pesos, mas overhead de activaciones y cache K/V.
- GPU recomendadas por el autor: 4 x NVIDIA V100 de 32 GB (SM70) con el motor ReVolta, que incluye los kernels AWQ g32 MoE, QSA con K/V FP8 E4M3, el draft MTP FP8 y la entrada multimodal.
- En GPUs Ampere o superiores se indica usar vLLM estandar; el loader debe soportar AWQ W4A16 g32 asimetrico por experto en layout GEMM, escalas de experto en FP16, carriers de compensacion y los tensores PLE FP8 oficiales.
- No cabe en GPUs de consumo individuales: el tamano del checkpoint excede la VRAM de cualquier RTX consumer actual.
- Opciones de despliegue: ReVolta (recomendado en V100) y vLLM (Ampere o superior). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leoncca/Qwen3.8-Flash-Next-AWQ-g32 | 179.999.981.459 | no disponible | AWQ W4A16 g32 + K/V FP8 E4M3 | qwen-community-1.0 | Hugging Face, 239 descargas |
| Qwen/Qwen3.8-Flash-Next (base BF16) | no disponible en la informacion | no disponible | BF16 | qwen-community-1.0 | Hugging Face (modelo base) |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | qwen-community-1.0 | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las metricas de fidelidad KL y acuerdo top-1 reportadas por el autor.

## Limitaciones y advertencias

- Las escalas K/V FP8 E4M3 se conservaron del calibrado anterior y no se recalibraron para los nuevos pesos; el autor lo advierte explicitamente.
- Las comprobaciones de fidelidad se hicieron sobre un subconjunto fijo de 66 registros de texto y no constituyen una evaluacion de capacidad general ni un heldout independiente.
- Siete pares capa/experto sin cobertura natural usan filas proxy equiespaciadas, lo que puede introducir desviaciones en esas rutas.
- Los hashes de indice identicos no garantizan pesos identicos; para identidad completa de ficheros debe usarse `SHA256SUMS`.
- El loader debe aceptar escalas de experto en FP16 y carriers de compensacion, y preservar los dtypes mixtos del checkpoint; un loader AWQ estandar puede fallar.
- La licencia qwen-community-1.0 impone condiciones de uso comunitario; deben revisarse antes de un despliegue comercial.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia; no se aportan evaluaciones especificas.
- El soporte esta limitado a ReVolta en V100 y vLLM en Ampere o superior; no hay rutas documentadas para CPU ni para otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leoncca/Qwen3.8-Flash-Next-AWQ-g32
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor ReVolta: https://github.com/Leonccaa/ReVolta
- Ficheros de procedencia y validacion en el repo: `MODEL_PROVENANCE.json`, `VALIDATION.json`, `EXPERT_COVERAGE.json`, `PUBLIC_RELEASE_AUDIT.json`, `SHA256SUMS`, `LICENSE`
