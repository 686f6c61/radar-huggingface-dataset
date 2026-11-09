# CladeTeam/CENO-600M-A230M-1m

## Resumen

CENO-600M-A230M-1m es el checkpoint de contexto largo (1M de tokens) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Nemotron-H que combina capas Mamba, atencion y mezcla de expertos (MoE), sin necesidad de entradas de alineamiento multiple de secuencias (MSA). Con 630,8 millones de parametros totales y 230 millones activos por token (top-2 sobre 8 expertos), esta pensado para generacion de secuencias genomicas y extraccion de embeddings.

El modelo emplea un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de solo 512 entradas. Esta es una decision de diseno relevante: evita la tokenizacion por k-mers y permite representar cualquier variante o base no canonica sin tokens fuera de vocabulario. La longitud de contexto de entrenamiento es de 1.048.576 tokens, aunque el autor advierte que la arquitectura Mamba/Attention/MoE no tiene ventana de contexto fija, por lo que `max_position_embeddings` es nominal y no restrictivo.

Su relevancia actual radica en que cubre un nicho poco poblado: modelos fundacionales de ADN de tamano contenido (menos de 1B de parametros) con contexto de un millon de tokens y licencia Apache-2.0. Esto lo hace candidato para adaptacion downstream (fine-tuning y probing) en tareas genomicas donde se necesita procesar regiones largas del genoma, como elementos reguladores distales o haplotipos completos, sin recurrir a modelos de decenas de miles de millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | 230M (MoE top-2 sobre 8 expertos) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento; sin ventana fija por diseno (Mamba) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (modelo sobre secuencia genomica, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB) |

## Arquitectura y entrenamiento

La columna vertebral es una hibrida Nemotron-H que intercala capas Mamba (modelo de espacio de estados), capas de atencion y capas MoE. La configuracion concreta incluye 20 capas ocultas, tamano oculto de 1024, 16 cabezas de atencion, tamano intermedio de 4096 y 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de caracter (`CENOCharLevelTokenizer`, derivado del `CharLevelTokenizer` de Evo2 de Arc Institute), con vocabulario de 512 y mapeo de bases de ADN a codigos ASCII. Esta version corresponde a la etapa 4 del entrenamiento de la familia CENO: la extension de contexto largo hasta 1.048.576 tokens.

El codigo del modelo esta incluido en el repositorio y se carga con `trust_remote_code=True`. La implementacion esta derivada de la version de Nemotron-H de NVIDIA en Hugging Face (Apache-2.0). Segun la model card, la inferencia BF16 en CUDA usa aritmetica corregida de Mamba, MoE, normalizacion y atencion, seleccionada por una configuracion de referencia explicita del modelo. Las capas Mamba requieren kernels CUDA, por lo que el forward y la generacion necesitan GPU; la carga de pesos, el tokenizador y la configuracion son seguros en CPU. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de secuencias genomicas de ADN a nivel de base, incluyendo regiones de hasta un millon de tokens.
- Extraccion de embeddings de secuencia para tareas downstream (probing, clasificacion, regresion genomica).
- Modelado causal de lenguaje sobre alfabeto de ADN representado como bytes ASCII, lo que permite manejar bases no canonicas y variantes sin tokens fuera de vocabulario.
- Procesamiento de contexto largo sin ventana fija gracias a las capas Mamba, adecuado para regiones genomicas extensas.
- Punto de partida para fine-tuning en tareas genomicas especificas (adaptacion downstream).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- No se documentan capacidades multilingues en lenguaje natural; el modelo opera sobre secuencia genomica.

## Casos de uso

- Extraccion de embeddings genomicos para modelos downstream: usar el modelo como extractor de representaciones de regiones de ADN y entrenar cabezales de clasificacion o regresion sobre ellas, aprovechando que es un checkpoint base pensado explicitamente para probing.
- Prediccion de efectos de variantes (VEP) mediante puntuacion de verosimilitud: aunque la VEP se asocia a los checkpoints `CENO-P-*`, la familia documenta el flujo de comparar log-verosimilitud de secuencia wild-type frente a variante con delta de log-likelihood, y este checkpoint base sirve como punto de partida para esa adaptacion.
- Analisis de regiones reguladoras distales: el contexto de 1M de tokens permite procesar en una sola pasada enhancers y promotores separados por cientos de kilobases, algo inviable con ventanas cortas.
- Estudio de haplotipos y variacion estructural: la ventana extendida permite modelar bloques haplotipicos largos y evaluar el impacto de variantes en su contexto nativo.
- Generacion de secuencias sinteticas de ADN para diseno experimental: el modelo puede generar secuencias condicionadas a un prefijo, util para proponer candidatos en pipelines de diseno de oligonucleotidos o regiones sinteticas.
- Fine-tuning para tareas genomicas especificas: al ser un checkpoint base Apache-2.0 de 630M, es viable adaptarlo con recursos modestos a tareas como prediccion de sitios de union de factores de transcripcion o anotacion funcional.
- Investigacion en modelado de secuencia larga: sirve como banco de pruebas para estudiar el comportamiento de arquitecturas hibridas Mamba/MoE en dominios no textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 1,26 GB (630,8M parametros); con overhead de activaciones y kernels Mamba, se recomienda al menos 8-16 GB de VRAM para secuencias moderadas, y mas para prefills largos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de kernels CUDA para Mamba (por ejemplo, A100, H100, RTX 4090, RTX 3090). Las capas Mamba requieren CUDA, por lo que no hay inferencia funcional en CPU para forward ni generacion.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3090 o RTX 4090, dado el reducido tamano de pesos; el limite practico sera la longitud de secuencia y la memoria de activaciones.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (ruta de precision single-GPU, sin padding, con maximo de 131.072 tokens por prefill); el repositorio de codigo incluye una entrada para vLLM pensada para prefills mayores. Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-600M-A230M-1m | 630,8M (230M activos) | 1.048.576 tokens de entrenamiento, sin ventana fija | Hibrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face, codigo incluido |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Apache-2.0 (tokenizador derivado) | Hugging Face |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible en la informacion | Hibrida Mamba/Attention/MoE | Apache-2.0 (implementacion base) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad documentados.

## Limitaciones y advertencias

- El modelo opera sobre secuencia genomica, no sobre lenguaje natural; no debe esperarse calidad en tareas de texto convencional.
- Riesgo de alucinacion biologica: la model card advierte explicitamente que la correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional; las secuencias generadas requieren validacion experimental.
- Requiere GPU con kernels CUDA para forward y generacion; no hay ruta de inferencia funcional en CPU.
- La ruta de precision en Hugging Face es single-GPU, sin padding, y admite como maximo 131.072 tokens por prefill; para contextos mayores hay que usar la entrada de vLLM del repositorio.
- La evidencia de referencia para el contexto de 1M corresponde a CENO-1.3B-A450M-1m, no a este checkpoint; las comprobaciones cortas multi-tamano no implican la misma cobertura larga para todos los modelos.
- Referencias de Megatron CP distintas no son intercambiables.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo en entornos de produccion.
- Licencia Apache-2.0 permite uso comercial, pero el codigo derivado de Nemotron-H y el tokenizador derivado de Evo2 exigen mantener la atribucion indicada en los ficheros LICENSE y NOTICE.
- No se documentan sesgos especificos del modelo en la informacion disponible; al entrenarse sobre genomas, puede reflejar sesgos de representacion de las poblaciones presentes en los datos de entrenamiento, aunque no se detalla su composicion.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-600M-A230M-1m
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Implementacion base Nemotron-H (NVIDIA): https://huggingface.co/nvidia (referencia citada en la model card)
- Tokenizador base Evo2 (Arc Institute): https://github.com/ArcInstitute/evo2 (referencia citada en la model card)
