# CladeTeam/CENO-300M-A105M-base

## Resumen

CENO-300M-A105M-base es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal que opera directamente sobre secuencia genomica (bases A, T, C, G) sin necesidad de alineamiento multiple de secuencias (MSA) como entrada. El modelo emplea una arquitectura hibrida Mamba / Attention / Mixture-of-Experts inspirada en Nemotron-H de NVIDIA, con 307,5 millones de parametros totales y 105 millones de parametros activos por token gracias a su capa MoE de 8 expertos con enrutamiento top-2.

El modelo resuelve el problema de modelar secuencias de ADN a escala mediante un tokenizador a nivel de caracter que mapea cada base a su codigo ASCII de byte, con un vocabulario de solo 512 entradas. Esta decision reduce drasticamente el tamano del vocabulario frente a aproximaciones con k-mers y permite generar y puntuar secuencias genomicas arbitrarias. Es relevante ahora porque se posiciona como una alternativa de menor tamano y codigo abierto a modelos genomicos de gran escala como Evo2, y porque su naturaleza hibrida Mamba/Attention ofrece eficiencia en contextos largos sin el coste cuadratico de la atencion pura.

El checkpoint es un modelo base, no instruido ni alineado, pensado para generacion de secuencias genomicas, extraccion de embeddings y adaptacion posterior (fine-tuning o probing) en tareas de genomica. La familia CENO incluye ademas checkpoints con MSA (prefijo `CENO-P-*`) orientados a prediccion de efectos de variantes (VEP) mediante comparacion de log-verosimilitud entre secuencia wild-type y variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 307.503.488 |
| Parametros activos | 105M (MoE con 8 expertos, top-2 por token) |
| Longitud de contexto | 131.072 tokens por prefill en la ruta HF (limite documentado); contexto de entrenamiento no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo sobre secuencia genomica, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas ocultas | 9 |
| Tamano oculto | 1024 |
| Cabezas de atencion | 8 |
| Tamano intermedio | 4096 |
| Vocabulario | 512 (byte / caracter) |
| Precision | bfloat16 |
| `model_type` | `ceno` |
| Clase | `CENOForCausalLM` |
| Requiere `trust_remote_code` | Si |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El backbone combina tres mecanismos en una arquitectura hibrida de tipo Nemotron-H: capas Mamba (modelo de espacio de estados selectivo), capas de atencion y capas de mezcla de expertos. Con 9 capas ocultas, tamano oculto de 1024 y tamano intermedio de 4096, la capa MoE contiene 8 expertos de los que se activan 2 por token, lo que explica la diferencia entre los 307,5M de parametros totales y los aproximadamente 105M activos. El tokenizador es a nivel de caracter (`CENOCharLevelTokenizer`), derivado del `CharLevelTokenizer` de Evo2 de Arc Institute, y mapea cada base de ADN a su codigo de byte ASCII, con un vocabulario de 512 entradas.

El modelo se presenta como checkpoint de preentrenamiento base correspondiente a la etapa 2 del entrenamiento. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset genomico, ni si hubo etapas de RLHF o DPO (tratandose de un modelo base, es esperable que no las haya, pero no se confirma). Tampoco se detallan innovaciones adicionales como decodificacion especulativa. La implementacion del codigo esta empaquetada en el repositorio y derivada de la implementacion de Nemotron-H de NVIDIA (Apache-2.0). Las capas Mamba requieren kernels CUDA especificos (`mamba-ssm`, `causal-conv1d`), por lo que el forward pass y la generacion necesitan GPU; la carga de configuracion, tokenizador y pesos es segura en CPU.

## Capacidades

- Generacion de secuencias genomicas de ADN de forma autoregresiva (bases A, T, C, G).
- Extraccion de embeddings de secuencia genomica para tareas posteriores (probing, clasificacion, regresion).
- Modelado de lenguaje causal sobre secuencia de ADN, base para prediccion de efectos de variantes en los checkpoints de la familia con MSA.
- Adaptacion mediante fine-tuning para tareas genomicas especificas.
- Procesamiento de secuencias largas: la ruta HF admite hasta 131.072 tokens por prefill (con vLLM para prefills mayores).
- Tokenizacion a nivel de caracter que permite manejar cualquier secuencia de bases sin vocabulario de k-mers.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo base sobre ADN, no un modelo de instrucciones.
- No dispone de capacidades de vision, audio ni modo de razonamiento (thinking).
- Capacidades multilingues no aplicables (opera sobre secuencia genomica, no lenguaje natural).

## Casos de uso

- Extraccion de embeddings genomicos para modelos downstream: se ejecuta el forward del modelo sobre secuencias de ADN y se usan los estados ocultos como features para clasificadores de regiones regulatorias, promotores o elementos funcionales, aprovechando que el modelo ha aprendido representaciones de secuencia durante el preentrenamiento.
- Prediccion de efectos de variantes (VEP): aunque esta tarea se asocia a los checkpoints `CENO-P-*` con MSA, el checkpoint base puede adaptarse para puntuar secuencia wild-type frente a variante mediante delta de log-verosimilitud, tal como documenta el pipeline VEP del repositorio.
- Generacion de secuencias genomicas sinteticas: el modelo puede generar secuencias de ADN plausibles bajo un contexto dado, util para aumento de datos o exploracion de espacio de secuencias en diseno genomico.
- Fine-tuning para tareas de anotacion genomica: adaptacion supervisada sobre el checkpoint base para predecir etiquetas funcionales a nivel de base o de region, aprovechando el contexto largo para capturar dependencias lejanas.
- Modelado de secuencias largas en estudios de regulacion genica: con hasta 131.072 tokens por prefill en la ruta HF (y mas con vLLM), el modelo puede procesar fragmentos genomicos extensos para capturar interacciones de largo alcance entre elementos regulatorios.
- Investigacion en modelos fundacionales de ADN: el checkpoint sirve como punto de partida reproducible (licencia Apache-2.0, pesos safetensors y codigo empaquetado) para experimentos de arquitecturas hibridas Mamba/MoE aplicadas a genomica.
- Puntuacion de secuencias para filtrado en pipelines de biologia computacional: uso del log-likelihood del modelo para priorizar o descartar candidatos en cribados in silico antes de validacion experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,6 GB (307,5M parametros x 2 bytes), mas overhead de estados de Mamba, cache y activaciones; el repositorio completo pesa 2,5 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para los kernels de Mamba (`mamba-ssm` 2.2.4, `causal-conv1d` 1.2.2.post1) y FlashAttention 2.7.3; se ha probado con el stack PyTorch 2.7.0a0 (NVIDIA 25.03) y Transformers 4.48.3.
- Cabe en GPU de consumo: si, dado el reducido tamano de parametros; se requiere una GPU NVIDIA compatible con CUDA (no se especifican modelos concretos como RTX 4090 en la informacion disponible).
- Opciones de despliegue: Transformers con `trust_remote_code=True` (ruta HF, single-GPU, sin padding, maximo 131.072 tokens por prefill) y una entrada vLLM propia del repositorio para prefills mayores. HF y vLLM usan entornos separados. No se documentan soporte de llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-300M-A105M-base | 307,5M (105M activos) | 131.072 tokens por prefill (ruta HF) | Mamba / Attention / MoE hibrida | Apache-2.0 | Hugging Face, codigo en GitHub |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible | no disponible (origen del tokenizador char-level) | no disponible | no disponible |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible | Mamba / Attention / MoE hibrida (base arquitectonica) | Apache-2.0 (implementacion HF) | no disponible |

La comparacion cuantitativa con alternativas genomicas de la misma categoria no esta disponible en la informacion proporcionada. Evo2 y Nemotron-H se citan unicamente como origen del tokenizador y de la implementacion arquitectonica, respectivamente.

## Limitaciones y advertencias

- Es un checkpoint base sin alineacion: no sigue instrucciones ni esta optimizado para conversacion; su uso previsto es generacion, embeddings y fine-tuning.
- Numeros: la model card advierte explicitamente que la correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional; las secuencias generadas deben validarse experimentalmente.
- Requiere GPU para forward y generacion por los kernels CUDA de Mamba; no es ejecutable en CPU para inferencia.
- La ruta HF esta limitada a single-GPU, sin padding y a 131.072 tokens por prefill; prefills mayores requieren la entrada vLLM del repositorio.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad genomica en la informacion disponible.
- La cobertura de idiomas no aplica; el modelo no procesa lenguaje natural.
- Licencia Apache-2.0 permite uso comercial, pero el codigo empaquetado deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute), ambos Apache-2.0; deben conservarse los archivos `LICENSE` y `NOTICE` con la atribucion completa.
- El limite de contexto de entrenamiento no esta documentado, por lo que usar contextos proximos a 131.072 tokens en inferencia puede degradar la calidad si el modelo no fue entrenado a esa longitud.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de desplegarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-A105M-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Ejemplo de VEP TraitGym (en el repositorio CENO): https://github.com/CladeTeam/CENO
- Implementacion Nemotron-H de NVIDIA en Hugging Face (base del codigo, Apache-2.0): no disponible como enlace directo en la informacion
- Tokenizador CharLevelTokenizer de Evo2 (Arc Institute, Apache-2.0): no disponible como enlace directo en la informacion
