# CladeTeam/CENO-80M-A30M-131k

## Resumen

CENO-80M-A30M-131k es un checkpoint de contexto largo (131.072 tokens) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal entrenado sobre secuencia genómica que emplea un backbone híbrido Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H de NVIDIA. Con 79,3 millones de parámetros totales y aproximadamente 30 millones activos por token (8 expertos con top-2), está diseñado especificamente para generacion de secuencias de ADN y extraccion de embeddings en tareas de genomica.

El modelo resuelve el problema de modelar secuencias genomicas de forma nativa, sin necesidad de alineamientos multiples de secuencias (MSA) como entrada. Su tokenizador es de nivel de caracter, mapeando las bases de ADN a sus codigos de byte ASCII, lo que permite tratar la secuencia genomica como texto puro. Este checkpoint corresponde a la etapa 3 de entrenamiento (extension de contexto largo) de la familia CENO, y es cargable de forma autonoma mediante `trust_remote_code=True`, ya que el codigo del modelo viene incluido en el repositorio.

Su relevancia actual radica en que ofrece una alternativa de codigo abierto (Apache-2.0) y tamano reducido para investigacion en genomica computacional, con capacidad de contexto muy largo y una arquitectura hibrida que combina la eficiencia de Mamba con la precision de la atencion y la especializacion de los expertos. La familia CENO incluye tambien checkpoints con MSA (prefijo `CENO-P-*`) orientados a prediccion de efectos de variantes (VEP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), transformer causal |
| Parametros totales | 79.290.560 (79,3M) |
| Parametros activos | Aproximadamente 30M (8 expertos, top-2 por token) |
| Longitud de contexto | 131.072 tokens de entrenamiento (sin ventana fija por la arquitectura Mamba) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; el repo no documenta cuantizaciones oficiales) |
| Idiomas soportados | No disponible (modelo de secuencia genomica, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El backbone es un hibrido Mamba / Attention / Mixture-of-Experts basado en la arquitectura Nemotron-H. Cuenta con 9 capas ocultas, tamano oculto de 512, 8 cabezas de atencion y tamano intermedio de 2048. La capa MoE dispone de 8 expertos con enrutamiento top-2 por token. El vocabulario es de 512 entradas y el tokenizador es de nivel de caracter (byte / caracter), derivado del `CharLevelTokenizer` de Evo2 (Arc Institute), que mapea las bases de ADN a sus codigos de byte ASCII. Esto elimina la necesidad de un vocabulario especifico de k-mers y permite representar cualquier secuencia genomica.

Este checkpoint corresponde a la etapa 3 de entrenamiento de la familia CENO: la extension de contexto largo, entrenado a 131.072 tokens. Segun la model card, la arquitectura Mamba / Attention / MoE no tiene una ventana de contexto fija; `max_position_embeddings` en `config.json` es nominal y no restrictivo. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El codigo del modelo esta incluido en el repositorio y deriva de la implementacion de Nemotron-H de NVIDIA (Apache-2.0).

## Capacidades

- Generacion de secuencias genomicas de ADN de forma causal, con contexto de hasta 131.072 tokens por prefill en la ruta HF.
- Extraccion de embeddings de secuencia genomica para tareas downstream (probing, clasificacion, regresion).
- Adaptacion mediante fine-tuning para tareas especificas de genomica.
- Modelado de lenguaje de nivel de caracter sobre alfabeto de ADN (A, C, G, T y variantes).
- Arquitectura MoE con enrutamiento top-2 que activa aproximadamente 30M de los 79,3M de parametros por token.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM de lenguaje natural; su dominio es la secuencia genomica.
- Capacidades multilingues: no aplicable (modelo de ADN, no de lenguaje natural).
- El checkpoint base no implementa prediccion de efectos de variantes (VEP); para ello la familia dispone de checkpoints `CENO-P-*` con MSA.

## Casos de uso

- Generacion de secuencias genomicas sinteticas: el modelo puede generar secuencias de ADN de hasta 131.072 tokens, util para aumento de datos y estudio de distribuciones genomicas en investigacion.
- Extraccion de embeddings para modelos downstream: se pueden obtener representaciones de secuencias genomicas y entrenar clasificadores o regresores ligeros (probes) para tareas como prediccion de regiones regulatorias o elementos funcionales.
- Fine-tuning para tareas especificas de genomica: al ser un checkpoint base, sirve como punto de partida para adaptar el modelo a tareas concretas con datasets propios, aprovechando su tamano reducido (79,3M) y su licencia permisiva.
- Analisis de contexto largo en regiones genomicas extensas: gracias a los 131.072 tokens de entrenamiento y a la ausencia de ventana fija en la arquitectura Mamba, permite modelar regiones genomicas largas de una sola pasada.
- Investigacion en arquitecturas hibridas Mamba/MoE: el modelo es un caso de estudio reproducible de un backbone Nemotron-H a escala pequena, util para experimentos de eficiencia y enrutamiento de expertos.
- Evaluacion de efectos de variantes mediante la familia CENO: aunque este checkpoint base no es el de VEP, forma parte de la familia cuyo pipeline VEP (puntuacion de log-verosimilitud de secuencia wild-type frente a variante) se documenta en el repositorio de codigo.
- Prototipado en entornos con recursos limitados: su tamano (repo de 0,2 GB en bfloat16) permite cargar pesos y tokenizador en CPU y ejecutar inferencia en una unica GPU consumer con kernels CUDA de Mamba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,16 GB (79,3M parametros); el consumo real depende de la longitud de secuencia y de las activaciones, y puede crecer de forma notable con contextos de 131.072 tokens.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para los kernels de Mamba (por ejemplo, RTX 3090, RTX 4090, A100, H100); la model card no especifica minimos exactos.
- Cabe en GPU consumer: si, en tarjetas NVIDIA consumer con CUDA; los pesos y el tokenizador son cargables en CPU, pero las pasadas forward y la generacion requieren GPU por los kernels CUDA de Mamba.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (ruta HF, single-GPU, sin padding, maximo 131.072 tokens por prefill); el repositorio incluye una entrada para vLLM orientada a prefills mayores. No se documentan soportes oficiales para llama.cpp, Ollama o TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-A30M-131k | 79,3M (aprox. 30M activos) | 131.072 tokens de entrenamiento (sin ventana fija) | Mamba / Attention / MoE hibrida | Apache-2.0 | Hugging Face, codigo incluido |
| Evo2 (Arc Institute) | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Referenciado como origen del tokenizador |
| Nemotron-H (NVIDIA) | No disponible en la informacion | No disponible en la informacion | Mamba / Attention / MoE hibrida | Apache-2.0 (codigo base) | Referenciado como origen del codigo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion en genomica: no es un LLM de lenguaje natural; su uso fuera del dominio de secuencias de ADN no esta previsto ni validado.
- Riesgo de generacion biologicamente no funcional: la model card advierte explicitamente que la correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional.
- La ruta de precision HF es single-GPU, sin padding y limitada a 131.072 tokens por prefill; para prefills mayores debe usarse la entrada de vLLM del repositorio.
- Las capas Mamba requieren kernels CUDA: la inferencia en CPU no es funcional para forward ni generacion (solo carga de pesos, config y tokenizador).
- La afirmacion de referencia bit a bit en BF16 no cubre CPU, FP32 explicito ni atencion eager explicita.
- Las referencias de Megatron CP no son intercambiables entre si, y la evidencia de contexto de 1M pertenece a CENO-1.3B-A450M-1m, no a este checkpoint.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad de generacion en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el codigo incluido deriva de implementaciones de terceros (Nemotron-H de NVIDIA y CharLevelTokenizer de Evo2); deben respetarse los archivos `LICENSE` y `NOTICE` del repositorio.
- Este checkpoint base no implementa VEP; para prediccion de efectos de variantes deben usarse los checkpoints `CENO-P-*` con MSA.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-A30M-131k
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Implementacion de referencia Nemotron-H (NVIDIA): no disponible como enlace en la informacion proporcionada
- Tokenizador CharLevelTokenizer de Evo2 (Arc Institute): no disponible como enlace en la informacion proporcionada
