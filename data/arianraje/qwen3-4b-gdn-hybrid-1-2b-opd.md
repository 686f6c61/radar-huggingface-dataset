# arianraje/qwen3-4b-gdn-hybrid-1.2B-OPD

## Resumen

Este modelo es un checkpoint intermedio de un estudio de investigacion que convierte el Qwen3-4B de atencion completa en una arquitectura hibrida GDN (gated DeltaNet): 27 de las 36 capas se transforman a atencion lineal con retencion uniforme 1:4, y la capacidad se recupera mediante destilacion escalonada que culmina en destilacion on-policy (OPD). El resultado es un modelo de 4,55 mil millones de parametros que mantiene un rendimiento competitivo en razonamiento matematico con una arquitectura sustancialmente mas eficiente que el original.

El checkpoint corresponde al peldaño de 1,2 mil millones de tokens de una escalera WSD (warmup-stable-decay) con mezcla matematica, con cola de learning rate decaida a 1e-6. Los pesos estan publicados en formato safetensors y requieren registrar la arquitectura GDN-hybrid personalizada antes de cargarlos, aunque los checkpoints son compatibles con la clase estandar Qwen3NextForCausalLM. Es un modelo de investigacion, sin despliegue en produccion recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-hybrid (gated DeltaNet + atencion completa), 36 capas, 27 convertidas, retencion 1:4 |
| Parametros totales | 4.546.819.904 (~4,55 B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 16 K en entrenamiento (H=16K), evaluado a 32 K |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte del Qwen3-4B original y sustituye la atencion completa de 27 de sus 36 capas por capas GDN (gated DeltaNet), un mecanismo de atencion lineal con compuerta que reduce el coste computacional de O(n²) a O(n) en la longitud de secuencia. Las 9 capas restantes conservan atencion completa, lo que permite mantener la capacidad de recuperacion de informacion a larga distancia. La conversion es uniforme con una tasa de retencion 1:4, lo que significa que cada cuarta capa conserva atencion completa.

El entrenamiento sigue un esquema de destilacion escalonada: primero destilacion clasica (KD) en dos etapas y finalmente destilacion on-policy (OPD), donde el estudiante genera rollouts que el profesor congelado puntua token a token bajo divergencia KL inversa. El run concreto corresponde a una escalera WSD con mezcla de datos matematicos, consumiendo 1.200.015.743 tokens en el paso 7205 con contexto de 16 K. La cola de learning rate se decayo hasta 1e-6, un detalle relevante porque los peldaños posteriores de la escalera decaen a 0, lo que impide comparar directamente rungs con colas distintas.

## Capacidades

- Razonamiento matematico avanzado: resultados de 43,3 % pass@1 en AIME24 y 40,8 % pass@1 en AIME25 a 32 K de contexto.
- Modo thinking: alcanza 91,4 % pass@1 en MATH-500 con razonamiento activado.
- Generacion de texto y razonamiento multi-paso heredados del Qwen3-4B base, aunque con la capacidad parcialmente recuperada por destilacion.
- Eficiencia computacional: la atencion lineal en 27 de 36 capas reduce el coste de inferencia en secuencias largas frente al modelo original.
- Soporte de tool calling y funciones de agente: no documentado en la informacion disponible.

## Casos de uso

- Investigacion en arquitecturas eficientes: es un checkpoint de referencia para estudiar como la destilacion on-policy recupera capacidad en modelos hibridos de atencion lineal, util para comparar con los otros checkpoints del estudio (stage2b-kd y OPD final).
- Evaluacion de tecnicas de destilacion: permite analizar el efecto de la cola de learning rate (1e-6 frente a 0) en el rendimiento final de una escalera WSD.
- Razonamiento matematico con presupuesto computacional limitado: su arquitectura hibrida reduce el coste de atencion en secuencias largas, lo que lo hace interesante para entornos con restricciones de memoria o latencia.
- Experimentos de continuacion de entrenamiento: al ser un peldaño intermedio de una escalera WSD, sirve como punto de partida para probar schedulers alternativos o extensiones de entrenamiento.
- Baseline para cuantizacion: los pesos en safetensors permiten experimentar con cuantizacion GPTQ, AWQ o GGUF para medir la degradacion en un modelo hibrido.
- Estudio de trade-off atencion lineal frente a atencion completa: comparar este checkpoint con el Qwen3-4B original permite cuantificar la perdida de calidad por capa convertida.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la bateria de evaluacion del run (slurm 58126-58131, 2026-09-02):

| Benchmark | pass@1 | pass@8 |
|---|---|---|
| AIME24 (32 K contexto) | 43,3 | 73,3 |
| AIME25 (32 K contexto) | 40,8 | 63,3 |
| MATH-500 (think, pass@1) | 91,4 | - |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible. Tampoco hay comparativa directa con el Qwen3-4B original en las mismas condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9,3 GB, lo que sugiere pesos en bf16 (~9,1 GB). Para inferencia en bf16 se necesitan al menos 12 GB de VRAM; con cuantizacion de 8 bits bastarian ~6 GB y con 4 bits ~3 GB, aunque no se ha validado la cuantizacion en este modelo.
- GPU recomendadas: cualquier GPU con 16 GB o mas (RTX 4080/4090, A100, H100). En consumer GPU de 12 GB (RTX 3060/4070) cabria con cuantizacion.
- Despliegue: al ser una arquitectura personalizada, requiere registrar el modelo GDN-hybrid antes de cargarlo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La arquitectura hibrida deberia ofrecer mejor escalado en secuencias largas que el Qwen3-4B original, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-gdn-hybrid-1.2B-OPD (este) | 4,55 B | GDN-hybrid, 27/36 capas lineales | 16 K train / 32 K eval | MIT | HuggingFace |
| Qwen/Qwen3-4B (base) | 4 B | Transformer denso, atencion completa | 32 K (ampliable a 131 K) | Apache 2.0 | HuggingFace, Ollama, vLLM |
| arianraje/qwen3-4b-gdn-hybrid-stage2b-kd | 4,55 B | GDN-hybrid, misma conversion | 16 K | MIT | HuggingFace |
| arianraje/qwen3-4b-gdn-hybrid-opd | 4,55 B | GDN-hybrid, misma conversion | 16 K | MIT | HuggingFace |

El modelo base Qwen3-4B tiene licencia Apache 2.0 y soporte de produccion amplio (vLLM, Ollama, TGI), mientras que este checkpoint es un artefacto de investigacion con licencia MIT pero sin ecosistema de despliegue documentado. Los otros dos checkpoints del mismo estudio permiten comparar el efecto de las distintas etapas de destilacion.

## Limitaciones y advertencias

- Es un modelo de investigacion, no un release de produccion: no tiene despliegue validado en frameworks estandar ni soporte de la comunidad.
- La arquitectura GDN-hybrid es personalizada y requiere registro previo antes de cargar los pesos; usar AutoModelForCausalLM directamente fallara sin el registro adecuado.
- Solo se han evaluado capacidades matematicas (AIME24, AIME25, MATH-500). No hay datos de rendimiento en generacion general, codigo, multilingue ni seguridad.
- Los idiomas soportados no estan documentados; al derivar del Qwen3-4B, probablemente herede su soporte multilingue, pero no hay confirmacion.
- La cola de learning rate decae a 1e-6, no a 0, lo que impide comparar este checkpoint con los peldaños posteriores de la escalera WSD que si decaen a 0.
- No se han publicado analisis de sesgos, alucinacion ni robustez. Como modelo derivado de Qwen3, hereda los sesgos del modelo base y del corpus de entrenamiento.
- Con 0 descargas y 0 likes en el momento de la redaccion, no hay validacion independiente de los resultados reportados.
- El contexto de entrenamiento es de 16 K; la evaluacion a 32 K puede degradar el rendimiento fuera del rango visto en entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-1.2B-OPD
- Checkpoint OPD final del estudio: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-opd
- Checkpoint de destilacion etapa 2b: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage2b-kd
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Pagina del modelo en Ollama: https://ollama.com/library/qwen3:4b
