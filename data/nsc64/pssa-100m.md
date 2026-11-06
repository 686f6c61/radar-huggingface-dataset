# NSC64/pssa-100m

## Resumen

pssa-100m es un modelo de lenguaje de 109 millones de parámetros desarrollado por el usuario NSC64 y entrenado desde cero en una sola GPU RTX PRO 6000 Blackwell. Es un port a PyTorch de la arquitectura "plastic state-space" (PSSA) publicada en el repositorio Sparticle62ops/pssa, escalada desde la referencia de 1.5M de parámetros hasta 109M. Su rasgo más distintivo es que no contiene ningún mecanismo de atención: se basa en un SSM diagonal recurrente combinado con un banco de memoria episódica de 512 ranuras evaluado mediante distancias hiperbólicas.

El modelo fue entrenado con 4.000 millones de tokens en dos fases (TinyStories y FineWeb-Edu) y genera inglés fluido en dos registros: narrativa infantil y texto web. El propio autor advierte que el modelo no conoce hechos: capta estilo y gramática local, y sus muestras de texto web son convincentes en tono pero inventadas. Esto lo posiciona como un experimento de investigación sobre arquitecturas sin atención, no como un modelo de uso general.

Es relevante como demostración práctica de que una arquitectura tipo Mamba con memoria externa puede entrenarse a escala de 100M con recursos mínimos (unas 9 horas de GPU) y mantener coste de cómputo constante por token independientemente del contexto, gracias a su estado recurrente de tamaño fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State-space model (SSM) diagonal recurrente con banco de memoria episódica, sin atención |
| Parametros totales | 108.874.752 |
| Parametros activos | 108.874.752 (no es MoE) |
| Longitud de contexto | Estado recurrente de tamaño fijo; backprop truncado a 256 tokens |
| Tipos de cuantizacion | bf16 (no disponible otra cuantizacion) |
| Idiomas soportados | Ingles (entrenado con TinyStories y FineWeb-Edu) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (bf16, 217 MB) |

## Arquitectura y entrenamiento

El modelo apila 18 bloques idénticos. Cada bloque aplica RMSNorm, calcula un paso de tamaño por canal mediante softplus y ejecuta un escaneo SSM diagonal (h_t = exp(delta_t·A)·h_{t-1} + delta_t·B_t·x_t, con A < 0). Sobre la salida del SSM se monta un mecanismo de memoria episódica: una consulta se construye a partir del token y del estado, se proyecta al espacio hiperbólico de Poincaré y se compara con 512 ranuras de memoria mediante distancias hiperbólicas, produciendo una lectura acotada que se combina con la salida del SSM, un adaptador de rango 16 y un MLP. La distribución de parámetros es de 101,50M en el núcleo (d_model 768, embedding y cabeza de 16k tokens sin atar) y 7,37M en los 18 bancos de memoria. El cómputo por token permanece plano al crecer el contexto porque el estado recurrente tiene tamaño fijo.

Respecto a la referencia original en Rust, se introdujeron dos cambios necesarios a esta escala: el banco de memoria se entrena por gradiente en lugar de inserciones gated por sorpresa (el umbral de novedad de 3,5 nats dejaba de dispararse a las pocas centenas de pasos, dejando inactiva la ruta de escritura), y la retropropagación se trunca a 256 tokens. El escaneo SSM se implementa como un kernel Triton fusionado con backward escrito a mano, verificado contra un bucle PyTorch puro con coincidencia de gradientes de aproximadamente 1e-7.

El entrenamiento consumió 4B de tokens en dos fases: 3,11B con una mezcla 50/50 de TinyStories y FineWeb-Edu, y 0,89B adicionales de fine-tune con proporción 85/15 web/story. La tasa de aprendizaje se mantuvo en 1e-4 y decayó con coseno hasta 1e-5 en los últimos 600M de tokens. El throughput fue de 127k tokens/s al 99% de utilización de GPU (batch 64, chunk 256, torch.compile), con unas 9 horas totales de GPU. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles en dos registros: narrativa estilo TinyStories y texto web con tono convincente.
- Modelado de lenguaje con perplejidad medida: 3,71 en TinyStories y 17,6 en FineWeb-Edu.
- Procesamiento de secuencias con coste constante por token gracias al estado recurrente de tamaño fijo (sin atencion).
- Memoria episódica acotada de 512 ranuras leíble por consultas hiperbólicas.
- Ejecucion autocontenida: cargador, modelo y sampler en un unico archivo Python, sin dependencia de la libreria transformers.
- Ejecucion en CPU (escaneo PyTorch puro) o en CUDA (kernel Triton fusionado).

No hay indicacion de soporte para tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido. El autor indica explicitamente que el modelo no conoce hechos.

## Casos de uso

- Investigacion en arquitecturas sin atencion: es un checkpoint reproducible y ligero (217 MB) para estudiar SSM recurrentes con memoria externa, comparar contra transformers de tamano equivalente y experimentar con el codigo Triton.
- Generacion de relatos infantiles en ingles: entrenado con TinyStories, produce historias coherentes y gramaticalmente correctas en ese registro, util como base para juguetes narrativos o demos educativas.
- Experimentacion con kernels Triton: el escaneo SSM fusionado con backward manual verificado a 1e-7 sirve como referencia didactica para implementar kernels custom.
- Generacion de texto web estilistico: el registro web es convincente en tono, apto para pruebas de deteccion de texto sintetico o estudios de alucinacion en modelos pequenos.
- Prototipado en CPU: al no necesitar transformers y correr en CPU con escaneo PyTorch puro, es adecuado para integraciones ligeras donde no hay GPU disponible.
- Estudio del compromiso datos-escala: el autor documenta la ganancia marginal de los ultimos 1,5B tokens (0,017 nats en story, 0,069 en web), dato util para planificar presupuestos de entrenamiento en modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados por el autor en 1M de tokens no vistos por corpus, batch 8, longitud de secuencia 512:

| Corpus | Cross-entropy (nats) | Perplejidad | Acierto next-token |
|---|---|---|---|
| TinyStories | 1,312 | 3,71 | 64,8% |
| FineWeb-Edu web | 2,866 | 17,6 | 44,2% |

Un checkpoint intermedio a 2,5B tokens obtuvo 1,329 (story) y 2,935 (web), lo que indica que los ultimos 1,5B tokens aportaron 0,017 y 0,069 nats respectivamente. La perdida web seguia descendiendo al llegar a 4B tokens. No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM para inferencia: muy baja; los pesos ocupan 217 MB en bf16, por lo que cualquier GPU moderna sobra con creces. El autor no publica cifras exactas de VRAM.
- El entrenamiento completo se realizo en una sola RTX PRO 6000 Blackwell con 9 horas de GPU, 127k tok/s y 99% de utilizacion (batch 64, chunk 256).
- Cabe sobradamente en GPUs de consumo; dado el tamano de 109M parametros, tambien es ejecutable directamente en CPU mediante el escaneo PyTorch puro.
- Despliegue: cargador propio (`pssa_model.py` con `from_pretrained` y `generate`); en CUDA usa el kernel Triton de `pssa_kernels.py` si esta junto al modelo. No requiere la libreria transformers. No se mencionan soportes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput en inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| NSC64/pssa-100m | 108,9M | SSM diagonal + memoria episódica, sin atencion | Estado fijo (backprop 256 tokens) | GPL-3.0 |
| Sparticle62ops/pssa (referencia) | 1,5M | Misma arquitectura PSSA (Rust) | no disponible | GPL-3.0 |
| Mamba-130M (state-spaces) | ~130M | SSM selectivo (Mamba) | no disponible | Apache-2.0 |

No se han publicado benchmarks comparativos directos contra estos modelos en la informacion disponible; el autor menciona una comparacion de 1,5M de parametros contra un transformer equivalente realizada en el proyecto original, pero no incluye los resultados.

## Limitaciones y advertencias

- El modelo no conoce hechos: el propio autor advierte que sus muestras web son inventadas en un registro convincente, con alto riesgo de alucinacion factual. No apto para tareas que exijan veracidad.
- Entrenado solo en ingles (TinyStories y FineWeb-Edu); no hay soporte declarado para otros idiomas ni para castellano.
- Tokenizador BPE byte-level de 16.384 tokens entrenado sobre TinyStories: codifica texto web sin corromperlo, pero el Unicode raro consume mas tokens que un tokenizador de proposito general.
- La licencia GPL-3.0 impone condiciones de copyleft que pueden restringir usos comerciales derivados; conviene revisar la compatibilidad antes de integrarlo en productos.
- La memoria episódica se entrena por gradiente (a diferencia de la referencia Rust con inserciones por sorpresa), lo que altera el comportamiento respecto a la implementacion original.
- Backprop truncado a 256 tokens durante el entrenamiento, lo que puede limitar la dependencia de largo plazo aprendida.
- La perdida web seguia descendiendo a los 4B tokens: el modelo esta claramente infraentrenado respecto a su potencial.
- Proyecto experimental con 0 descargas registradas; no hay evidencia de auditoria comunitaria ni de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NSC64/pssa-100m
- Repositorio de la arquitectura original (Rust): https://github.com/Sparticle62ops/pssa
