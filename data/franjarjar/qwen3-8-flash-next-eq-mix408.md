# Franjarjar/Qwen3.8-Flash-Next-EQ-MIX408

## Resumen

Qwen3.8-Flash-Next-EQ-MIX408 es una cuantización del modelo Qwen/Qwen3.8-Flash-Next realizada por el usuario Franjarjar (JarJarFran) para Espetero, un motor de inferencia nativo para Metal en Apple silicon. El modelo base es un transformer de tipo mixture-of-experts (MoE) de Qwen, con 72.448.433.315 parámetros totales según los datos de safetensors, y esta versión cuantizada ocupa 84,0 GB en disco con una media de 3,31 bits por peso sobre los parámetros de texto.

El formato de cuantización es EQ (LaneQuant), propietario de Espetero: códigos de libro de códigos de 3 bits, vectores EQV y códigos de 5 bits, con una escala entera de 8 bits con signo por cada 16 entradas y una escala fp16 por cada 256. La elección de 16 entradas por escala responde al diseño de los kernels matriciales de la GPU de Apple, de modo que cada lane necesita exactamente una escala por paso. El modelo aplica formatos distintos por capa: los 408 expertos más enrutados en EQ de 3 bits con libro de códigos, los otros 104 en EQV (unos 1,7 bits por peso), el resto de matrices en EQ de 5 bits, embeddings en MLX affine de 8 bits, LM head de 6 bits, routers en BF16 y sin cabeza MTP.

La relevancia de esta ficha es acotada: no es un modelo nuevo ni un checkpoint entrenado, sino un artefacto de despliegue para un runtime concreto. Solo es utilizable con Espetero 0.2.0 o superior en Macs con más de 64 GB de memoria unificada; llama.cpp, MLX y transformers no cargan estos ficheros. Su interés técnico está en la estrategia de cuantización mixta por experto y en las métricas de divergencia KL publicadas frente a otro fichero de tamaño comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), derivada de Qwen/Qwen3.8-Flash-Next |
| Parametros totales | 72.448.433.315 |
| Parametros activos | no disponible |
| Longitud de contexto | 32K verificado en pruebas (una secuencia a 32K alcanza 58 GB de huella en M4 Max); máximo oficial del modelo base no disponible |
| Tipos de cuantizacion | EQ (LaneQuant) mixta: 3 bits con libro de códigos (408 expertos), EQV ~1,7 bits (104 expertos), 5 bits (resto de matrices), MLX affine 8 bits (embeddings), 6 bits (LM head), BF16 (routers), MLX affine 4 bits (tabla n-gram) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato EQ propietario de Espetero (no compatible con llama.cpp, MLX ni transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Qwen con 72.448 millones de parámetros totales y una tabla n-gram asociada (32 GB a 4 bits, leída desde el SSD en tiempo de ejecución), lo que sugiere decodificación especulativa o asistida por n-gramas en el runtime. Esta versión no ha sido entrenada: es una cuantización post-entrenamiento del checkpoint BF16 original, convertida con `espetero quantize` (preset `fnxmix`, commit `a229d11`) en 88 minutos sobre un M4 Max con un pico de 15 GB de huella.

La innovación técnica principal es la asignación desigual de precisión por experto. Los expertos se ordenan por masa de enrutamiento en calibración y se dividen en dos grupos: los 408 más enrutados reciben EQ de 3 bits con libro de códigos, mientras los 104 restantes reciben EQV (vectores de 8 pesos con un libro de códigos de 2^13 entradas por pila, unos 1,7 bits por peso). Además, se intercambian 8 «super expertos» poco enrutados pero con proyecciones down de salida al menos 4 veces la mediana de su capa, manteniéndolos en el conjunto de 3 bits: esto reduce la KLD de 0,0942 a 0,0928 y el p99 de 1,27 a 1,23. La calibración usó 256K tokens mixtos con Hessians por experto sobre la proyección down, partiendo de un forward del fichero oQ4e.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next; el artefacto no añade ni elimina capacidades, solo aproxima los pesos.
- Mezcla de expertos con enrutamiento por token: 512 expertos por capa según la descripción del reparto 408 + 104.
- Procesamiento de contextos largos: se ha medido una secuencia a 32K tokens con 58 GB de huella en M4 Max.
- Compatibilidad con clientes OpenAI, Anthropic y Ollama a través del servidor `espetero serve`.
- Decodificación asistida por tabla n-gram de 4 bits almacenada en disco y leída en tiempo de ejecución.
- Sin cabeza MTP (multi-token prediction) en este fichero: `--no-mtp` en la conversión.
- Capacidades multimodales, tool calling, agentes o multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de cuantización en Apple silicon: el fichero sirve para medir el impacto real de una asignación mixta de bits por experto (3,31 bits/peso) frente a cuantizaciones uniformes de 4 bits, usando las métricas KLD publicadas como referencia.
- Inferencia local en un Mac Studio o MacBook Pro con más de 64 GB: 52 GB de pesos residentes permiten ejecutar el modelo íntegramente en memoria unificada, sin GPU dedicada, con unas 23 ms por paso en M4 Max.
- Desarrollo y pruebas de motores de inferencia Metal: al ser un formato propio de Espetero, es material de validación para kernels matriciales, gestión de memoria wired y carga por capas.
- Comparación de estrategias de preservación de expertos: el orden `mix408se_order.json` permite reproducir el experimento de mantener 8 super expertos en el conjunto de 3 bits y verificar la mejora de KLD (0,0928 frente a 0,0942).
- Servicio local compatible con API OpenAI: mediante `espetero serve` se expone en `http://127.0.0.1:8080` para clientes que hablan OpenAI, Anthropic u Ollama, útil en entornos de desarrollo sin salida a la nube.
- Estudio de divergencia KL por tipo de texto: las 24 ventanas de 4096 tokens (8 de WikiText-2, 8 de código, 8 de turnos de chat) constituyen un protocolo reproducible para analizar en qué dominios una cuantización agresiva degrada más la distribución.

## Benchmarks y rendimiento

| Metrica | Este fichero (mix408) | oQ4e-mtp (Jundot) |
|---|---|---|
| Bits por peso | 3,31 | 4,58 |
| KLD media (KL BF16 ‖ fichero) | 0,0927 | 0,1170 |
| KLD mediana | 0,0129 | 0,0185 |
| KLD p99 | 1,2290 | 1,3967 |
| Top-1 | 90,6 % | 89,3 % |
| Decodificación M4 Max (tok/s) | 44 | 58 |
| Tamano relativo | referencia | 38 % mayor |

La comparación pareada sobre las mismas ventanas de referencia da una reducción de KLD del 20,8 % (intervalo del 95 %: -29,2 % a -12,4 %; inferior en 92 % de las 24 ventanas). La decodificación se midió con una secuencia, 64 pasos con teacher forcing tras un prompt de 4K tokens (`fnx_speed`, `--mtp none`) en M4 Max; el fichero de publicación decodifica dentro del 1 % (23,2 frente a 23,5 ms por paso). Las métricas KL se calcularon sobre 96.768 tokens contra el modelo BF16 con activaciones fp32.

## Requisitos de hardware

- Memoria: más de 64 GB de memoria unificada; 52 GB de pesos residentes y un pico de 58 GB de huella con una secuencia a 32K en M4 Max. No carga en un M1 Max de 64 GB (el conjunto de trabajo de la GPU es de 58 GB y la carga se detuvo a 59 GB wired, con 40 de 48 capas cargadas).
- GPU recomendadas: Apple M4 Max como plataforma de referencia medida; cualquier Mac con memoria unificada superior a 64 GB y Metal compatible con Espetero 0.2.0.
- GPU de consumo: no aplica; no hay soporte para CUDA, ROCm ni GPUs discretas en la información disponible.
- Despliegue: exclusivamente Espetero 0.2.0 o superior (`brew install JarJarFran/espetero/espetero`, luego `espetero serve --model ...`). No compatible con vLLM, llama.cpp, Ollama nativo, TGI, MLX ni transformers.
- Rendimiento: 44 tok/s en decodificación con M4 Max (medido sobre el fichero con orden por masa de enrutamiento, misma velocidad que el de publicación dentro del 1 %); 23,2 ms por paso.
- Almacenamiento: 84,0 GB en disco, más la tabla n-gram de 32 GB a 4 bits leída desde el SSD en tiempo de ejecución, lo que exige almacenamiento rápido.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso | Contexto | KLD media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EQ-MIX408 (este) | 72,4 B totales | 3,31 | 32K verificado | 0,0927 | qwen-community-1.0 | Hugging Face, solo Espetero |
| Qwen3.8-Flash-Next-EQ-FNX4H (Franjarjar) | no disponible | no disponible (preset fnx4h) | no disponible | no disponible | qwen-community-1.0 | Hugging Face, solo Espetero |
| oQ4e-mtp (Jundot) | no disponible | 4,58 | no disponible | 0,1170 | no disponible | Hugging Face, solo Espetero |
| Qwen/Qwen3.8-Flash-Next (base BF16) | 72,4 B totales | 16 | no disponible | 0 (referencia) | qwen-community-1.0 | Hugging Face, estándar |

## Limitaciones y advertencias

- Formato propietario: los ficheros EQ solo los carga Espetero; no hay ruta de conversión a GGUF ni a safetensors estándar documentada en la información disponible.
- Requisito de memoria estricto: no funciona en Macs de 64 GB, a pesar de que el tamaño en disco (84 GB) podría sugerir lo contrario; la huella en GPU es de 58 GB.
- Degradación medible: KLD media de 0,0927 y p99 de 1,2290 frente al BF16; el Top-1 es del 90,6 %, lo que implica un 9,4 % de discrepancias en la elección del token más probable.
- Sin cabeza MTP: la decodificación especulativa multinivel del modelo base no está incluida, lo que limita el throughput frente a variantes con MTP (44 tok/s frente a 58 tok/s del oQ4e-mtp, aunque este último es un 38 % más grande).
- Licencia Qwen Community 1.0: permite redistribuir pesos modificados y exige incluir el aviso en cada copia; las empresas que ofrezcan el modelo como servicio o como asistente de trabajo con IA necesitan una licencia separada de Qwen, y los productos con más de 100 millones de usuarios mensuales o 20 millones de dólares de ingresos mensuales deben mostrar el nombre del modelo.
- Idiomas soportados: no disponible; la cobertura lingüística depende del modelo base y no está documentada en esta ficha.
- Sesgos y alucinación: no disponibles en la información proporcionada; la cuantización agresiva de los expertos menos enrutados (1,7 bits por peso en 104 de ellos) puede amplificar errores en dominios poco representados en la calibración.
- Madurez: 11 descargas y 0 likes en el momento de la consulta, con una única revisión de commit de Espetero (616c21a) como referencia de medición; no es un artefacto con validación amplia de la comunidad.

## Enlaces

- [Franjarjar/Qwen3.8-Flash-Next-EQ-MIX408 en Hugging Face](https://huggingface.co/Franjarjar/Qwen3.8-Flash-Next-EQ-MIX408)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Espetero (motor de inferencia Metal, MIT)](https://github.com/JarJarFran/espetero)
- [Documentación del formato EQ](https://github.com/JarJarFran/espetero/blob/main/docs/eq.md)
- [Franjarjar/Qwen3.8-Flash-Next-EQ-FNX4H](https://huggingface.co/Franjarjar/Qwen3.8-Flash-Next-EQ-FNX4H)
