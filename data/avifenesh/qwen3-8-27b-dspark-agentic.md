# Avifenesh/Qwen3.8-27B-DSpark-Agentic

## Resumen

Qwen3.8-27B-DSpark-Agentic es un modelo borrador (drafter) de decodificación especulativa publicado por el usuario Avifenesh para el modelo objetivo Qwen/Qwen3.8-27B. No es un modelo de lenguaje autónomo: su función es proponer bloques de tokens que el modelo objetivo verifica después, de modo que la salida final nunca cambia y solo se acelera la fase de decodificación. Emplea la arquitectura DSpark, que condiciona el borrador con características auxiliares extraídas de capas internas del modelo objetivo, e incorpora una cabeza Markov para modelar la dependencia entre tokens dentro del bloque y una cabeza de confianza que predice la aceptación por posición.

El modelo tiene 1.359.284.737 parámetros en BF16 (62 tensores en un único fichero safetensors de 2,7 GB), con 5 capas transformer de atención completa, dimensión oculta 5.120, GQA con 40 cabezas de consulta y 8 de clave/valor, head_dim 128 y MLP de 10.240. Se entrenó desde cero con el harness SpecForge sobre sesiones reales de codificación y asistente, y está pensado para servirse con SGLang. Su relevancia actual radica en que ataca un cuello de botella práctico —el throughput de decodificación en cargas agénticas— sin tocar los pesos del modelo grande y manteniendo la equivalencia byte a byte con la decodificación greedy.

La licencia Apache 2.0 y el hecho de que el artefacto sea un borrador de 1,36B lo hacen desplegable junto al trunk en una sola GPU de 96 GB, con ganancias medidas de 1,48× en throughput single-stream sobre prompts agénticos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (borrador de decodificacion especulativa): 5 capas transformer de atencion completa, hidden 5.120, GQA 40 query / 8 KV heads, head_dim 128, MLP 10.240; cabeza Markov de rango 256 y cabeza de confianza con caracteristicas Markov |
| Parametros totales | 1.359.284.737 (1,36B) en BF16, 62 tensores |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | posicion maxima 262.144 con YaRN (factor 32, original 8.192) |
| Tipos de cuantizacion | el borrador se publica en BF16 sin cuantizar; el trunk objetivo se evaluo en FP8 y NVFP4 (GGUF); no se documentan cuantizaciones propias del drafter |
| Idiomas soportados | no disponible (usa el tokenizador del modelo objetivo, vocabulario 248.320; no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico fichero `model.safetensors`, sha256 `3c4e7d51f6a7492fd3c289e392424ab0fba31dc7b4ab4896da10a5eeb21fcd6f`) |

## Arquitectura y entrenamiento

El modelo es un drafter DSpark que genera bloques de 7 tokens candidatos (anchura de verificación de 8 incluyendo el token bonus del objetivo). A diferencia de un borrador autoregresivo convencional, DSpark condiciona cada bloque con características auxiliares extraídas de las capas 4, 16, 28, 40 y 52 del modelo objetivo (de un total de 64), lo que le proporciona información del estado interno del trunk. Sobre esa base, una cabeza Markov de rango 256 modela la dependencia entre tokens dentro del bloque y una cabeza de confianza estima la probabilidad de aceptación por posición, lo que permite ajustar dinámicamente la ventana de verificación. El codificador posicional es YaRN con factor 32 sobre una ventana original de 8.192, extendida hasta 262.144 posiciones.

El entrenamiento se realizó desde cero, con inicialización aleatoria y sin pesos de terceros, usando el harness SpecForge. Las etiquetas son regeneraciones del propio modelo objetivo a temperatura 0 sobre una mezcla de prompts compuesta por sesiones reales de codificación y asistente junto con un blend público de chat, cubriendo modos thinking y non-thinking y entrenando sobre el último turno de cada sesión multiturno. El cómputo total fue de aproximadamente 1.000 pasos de optimizador acumulados en hardware de clase B200 / RTX PRO 6000; el repositorio contiene el checkpoint final de esa ejecución. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-27B; no produce respuestas finales por sí mismo.
- Predicción de aceptación por posición mediante cabeza de confianza, habilitando ventanas de verificación adaptativas.
- Modelado de dependencia intra-bloque mediante cabeza Markov de rango 256.
- Aprovechamiento de características internas del trunk (capas 4, 16, 28, 40 y 52) para condicionar el borrador.
- Soporte de modos thinking y non-thinking, ya que el entrenamiento cubrió ambos.
- Orientación a cargas agénticas y de asistente: sesiones multiturno de codificación y chat.
- Integración con SGLang para el servicio y con SpecForge para el entrenamiento.
- Compatibilidad con trunks cuantizados: evaluado con FP8 y con un build NVFP4 GGUF.
- Garantía de equivalencia: la salida especulativa se verificó byte a byte idéntica a la decodificación greedy simple.

## Casos de uso

- Aceleración de asistentes de codificación en producción: el drafter se despliega junto al trunk Qwen3.8-27B en SGLang y reduce la latencia de decodificación en turnos conversacionales cortos, donde se midió una longitud de aceptación de 2,88 tokens por paso de verificación.
- Servicio de agentes multi-paso con contexto largo: en turnos agénticos largos la aceptación fue de 2,92, lo que permite mantener sesiones con muchas llamadas a herramientas sin que el coste de decodificación se dispare, apoyándose en la ventana de 262.144 posiciones del codificador YaRN.
- Razonamiento matemático y cadena de pensamiento: en GSM8K con concurrencia 8 se alcanzaron 4,61 tokens aceptados por paso y 693 tok/s agregados en una RTX PRO 6000 Blackwell, adecuado para pipelines de evaluación o generación masiva de soluciones.
- Despliegue en una sola GPU de 96 GB: combinando el trunk en FP8 o NVFP4 con el drafter en BF16 cabe en una RTX PRO 6000 Blackwell, lo que permite ofrecer servicio acelerado sin clúster multi-GPU.
- Optimización de infraestructura existente sin reentrenar el modelo grande: al ser un artefacto separado de 1,36B y licencia Apache 2.0, se puede añadir a un despliegue de Qwen3.8-27B ya en producción y medir la ganancia sobre el tráfico real.
- Sustitución de decodificación greedy en motores compatibles: con el motor tiyuvta se midió 96,3 tok/s frente a 65,0 tok/s en decodificación simple sobre prompts agénticos retenidos (1,48×), manteniendo salida byte-idéntica, lo que lo hace apto para entornos donde la reproducibilidad es requisito.
- Evaluación comparativa de estrategias de verificación: el modelo permite alternar entre ventana adaptativa y verificación de bloque completo (2,412 frente a 2,784 tokens por ronda en prompts agénticos), útil para calibrar el compromiso entre throughput y coste de verificación.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente).

Longitud de aceptación con SGLang, trunk FP8, decodificación muestreada en modo thinking (temperatura 0,6, top-k 20, top-p 0,95, `max_new_tokens=2048`), drafter BF16 sin cuantizar, bloque DSpark de 7:

| Carga de trabajo | Prompts | Longitud de aceptación |
|---|---:|---:|
| Sesiones agénticas reales, turnos cortos de chat | 64 | 2,88 (rango por petición 2,09–5,94) |
| Sesiones agénticas reales, turnos agénticos largos | 64 | 2,92 (rango por petición 2,03–5,45) |
| GSM8K | 128, concurrencia 8 | 4,61 |

En GSM8K se decodificaron 60.365 tokens de salida en 87,1 s, es decir, 693 tok/s agregados a concurrencia 8 en una única tarjeta. Los dos buckets de sesiones produjeron 81.199 y 115.263 tokens de salida respectivamente.

Aceptación con decodificación greedy sobre trunk NVFP4 GGUF (motor tiyuvta), flujo único, RTX PRO 6000 Blackwell 96 GB, completions de 256 tokens:

| Carga de trabajo | Prompts | Tokens por ronda, verificación adaptativa | Tokens por ronda, verificación de bloque completo |
|---|---:|---:|---:|
| Prompts de sesión agéntica | 16 | 2,412 | 2,784 |
| Prompts de chat corto | 16 | 2,228 | 2,415 |
| GSM8K | 12 | 3,664 | 4,620 |

Throughput single-stream greedy sobre prompts agénticos retenidos (128 tokens por prompt): 96,3 tok/s con el drafter frente a 65,0 tok/s en decodificación simple en el mismo motor, tarjeta y prompts (1,48×; medias por repetición 95,4–96,3 frente a 63,1–65,1 en 5 ejecuciones).

No se han publicado en la información disponible resultados de benchmarks de calidad lingüística (MMLU, HumanEval u otros) para este modelo, lo cual es coherente con su naturaleza de borrador: no altera la calidad de salida del trunk.

## Requisitos de hardware

- VRAM del drafter: 2,7 GB de pesos en BF16 (1,36B parámetros), más overhead de activaciones y del estado de especulación.
- VRAM total del sistema: el trunk Qwen3.8-27B debe residir en la misma GPU; las evaluaciones se hicieron con builds FP8 y NVFP4 en una RTX PRO 6000 Blackwell de 96 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell 96 GB para la configuración trunk + drafter en una sola tarjeta; el entrenamiento se realizó en hardware de clase B200 / RTX PRO 6000.
- GPU de consumo: no se documenta ninguna ejecución en GPU de consumo; el requisito del trunk de 27B en FP8/NVFP4 hace inviable en la práctica un despliegue en tarjetas de 24 GB o menos con esta combinación.
- Opciones de despliegue: SGLang (soporte nativo de DSpark, usado en las evaluaciones) y el motor tiyuvta (evaluado con trunk NVFP4 GGUF). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 693 tok/s agregados a concurrencia 8 en GSM8K; 96,3 tok/s single-stream greedy en prompts agénticos con verificación adaptativa, frente a 65,0 tok/s sin especulación.
- Latencia: no se publican cifras de latencia por petición (TTFT o inter-token) más allá del throughput agregado y de los conteos de tokens por ronda.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Qwen3.8-27B-DSpark-Agentic (este) | Drafter DSpark para Qwen3.8-27B | 1,36B | 262.144 (YaRN) | Apache 2.0 | Hugging Face, 630 descargas, 5 likes |
| Qwen/Qwen3.8-27B | Modelo objetivo (trunk) | 27B (nominal) | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3.8-27B-FP8 | Build cuantizado del trunk | 27B (nominal) | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| tiyuvta/Qwen3.8-27B-NVFP4-MTP-GGUF | Build NVFP4 GGUF del trunk | 27B (nominal) | no disponible en la informacion | no disponible en la informacion | Hugging Face |

No se dispone de datos sobre otros drafters comparables (por ejemplo, borradores EAGLE o MTP de la familia Qwen3) en la información proporcionada, ni de resultados de aceptación de esos artefactos que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- El modelo no es utilizable de forma autónoma: sin el trunk Qwen3.8-27B no genera respuestas; cualquier uso debe emparejarlo con la versión exacta del modelo objetivo para la que fue entrenado.
- La aceptación depende fuertemente del tráfico: las cifras de 2,88 y 2,92 corresponden a sesiones agénticas y de chat; en dominios muy distintos la longitud de aceptación puede caer y la ganancia de throughput reducirse o desaparecer.
- Todos los resultados son mediciones del autor y están marcados como no verificados; no hay evaluación independiente publicada.
- El modelo se entrenó sobre sesiones reales de codificación y asistente más un blend público de chat, por lo que puede heredar los sesgos de esos datos; no se documenta ningún análisis de sesgos.
- No se declara lista de idiomas soportados; el comportamiento multilingüe queda determinado por el tokenizador y el trunk, no por el drafter.
- La equivalencia byte a byte con la decodificación greedy se verificó en el motor tiyuvta con trunk NVFP4 y decodificación greedy; no se garantiza en configuraciones de muestreo ni con otras combinaciones de motor y cuantización.
- El soporte de motores es limitado: solo SGLang y tiyuvta están documentados; no hay integración publicada con vLLM, llama.cpp, Ollama o TGI.
- El repositorio declara `inference: false` en la model card, lo que refleja que no está pensado para invocarse como modelo de generación directa.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo objetivo Qwen3.8-27B deben verificarse por separado, ya que no se detallan en la información disponible.
- El contexto máximo de 262.144 posiciones aplica al codificador posicional del drafter; el contexto efectivo en producción estará limitado por el trunk y por la memoria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/Qwen3.8-27B-DSpark-Agentic
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Build NVFP4 GGUF del trunk: https://huggingface.co/tiyuvta/Qwen3.8-27B-NVFP4-MTP-GGUF
- SpecForge (harness de entrenamiento): https://github.com/sgl-project/SpecForge
- SGLang (motor de servicio): https://github.com/sgl-project/sglang
- Paper de referencia 1: arxiv:2607.05147
- Paper de referencia 2: arxiv:2602.06036
