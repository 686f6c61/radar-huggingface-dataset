# DFveloper/Lumen-3.8-Pulsar-26B-A3B-it-qat-q4_0-gguf

## Resumen

Lumen 3.8 Pulsar 26B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por Aeonthic, publicado en Hugging Face bajo el perfil DFveloper. Se presenta como un fine-tune del modelo base `google/gemma-4-26B-A4B` y esta disenado explicitamente para superar a AIKAR 3.2 Pro en capacidad general, mejorando al mismo tiempo la eficiencia de inferencia y el uso de memoria. La arquitectura es asimetrica: emplea aproximadamente 3,82B de parametros activos durante la fase de prefill y 3,08B durante la fase de decode, lo que reduce la carga computacional en generacion autoregresiva.

El modelo incorpora Quantization-Aware Training (QAT) y Weight Space Programming Optimization (WSPO), una metodologia propia del autor para modificar pesos sin retropropagacion convencional. Esta edicion concreta es un GGUF de referencia cuantizado principalmente en Q4_0 con precision mixta, disenado para ejecutarse tanto en llama.cpp como en aikar-engine con comportamiento bit-exacto entre ambos. Soporta una ventana de contexto de 262.144 tokens y seis niveles configurables de esfuerzo de razonamiento.

La relevancia actual del modelo radica en su enfoque de despliegue practico: un MoE de clase 26B con solo ~3-4B de parametros activos, contexto de 256K y una optimizacion de KV-cache que, segun el autor, reduce hasta un 45% la memoria frente a Gemma 4. El repositorio tiene 14,8 GB y, en el momento de la consulta, no registra descargas ni likes, por lo que se trata de un lanzamiento muy reciente y sin validacion independiente publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts disperso asimetrico (transformer) |
| Parametros totales | 25.233.142.046 (~25,2B; clase 26B) |
| Parametros activos | ~3,82B en prefill; ~3,08B en decode |
| Longitud de contexto | 262.144 tokens (ventana de atencion deslizante de 1.024 tokens) |
| Tipos de cuantizacion | Q4_0 principal, precision mixta con Q8_0 en tensores sensibles; QAT |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (referencia); existen ediciones W8A16 y W4A16 en compressed-tensors |
| Modelo base | google/gemma-4-26B-A4B |
| Desarrollador | Aeonthic (publicado por DFveloper) |
| Niveles de esfuerzo de razonamiento | 6 configurables |
| Tamano del repositorio | 14,8 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Mixture-of-Experts disperso con un diseno asimetrico que distingue entre el procesamiento del prompt (prefill) y la generacion autoregresiva (decode). Durante el prefill activa aproximadamente 3,82B de parametros, mientras que en decode reduce el presupuesto a ~3,08B, un 19,4% menos. Esta separacion busca optimizar la eficiencia de generacion sin penalizar el procesamiento de contexto largo. La atencion utiliza una ventana deslizante de 1.024 tokens, lo que resulta coherente con el objetivo de reducir el coste de KV-cache en contextos de hasta 262.144 tokens.

El entrenamiento incorpora Quantization-Aware Training (QAT), de modo que el checkpoint GGUF de referencia esta entrenado teniendo en cuenta la cuantizacion y no es solo un resultado de cuantizacion post-entrenamiento. Ademas, se aplica Weight Space Programming Optimization (WSPO), una metodologia del autor que modifica directamente los pesos analizando activaciones y comportamiento de salida, sin retropropagacion estandar. La revision descrita en la model card utiliza actualizaciones de bajo rango de rango 32 sobre los tensores `ffn_down` (W' = W + BA, con rango(BA) <= 32), fusionadas directamente en los pesos y almacenadas en Q8_0 tras la fusion, sin necesidad de adaptadores LoRA ni runtime especifico en inferencia. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline `image-text-to-text` y tag `conversational`).
- Procesamiento de imagen y texto combinados, segun el pipeline declarado `image-text-to-text`.
- Razonamiento con seis niveles configurables de esfuerzo, lo que permite ajustar el coste computacional a la dificultad de la tarea.
- Arquitectura MoE dispersa con routing, orientada a eficiencia en inferencia.
- Compatibilidad con llama.cpp y con aikar-engine, con inferencia bit-exacta entre ambos en configuraciones validadas.
- Optimizacion de KV-cache consciente de la arquitectura en aikar-engine (hasta 45% menos memoria que Gemma 4).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte explicito de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque los niveles de esfuerzo de razonamiento son compatibles con este uso.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir informes extensos, expedientes o bases de codigo completas en una sola pasada, resumirlos o responder preguntas sobre ellos sin fragmentacion.
- Asistentes conversacionales multi-turno: el formato conversacional y el contexto amplio permiten mantener historiales largos de dialogo con coherencia, manteniendo el coste de KV-cache controlado gracias a la ventana deslizante de 1.024 tokens.
- Despliegue en hardware de gama media: al activar solo ~3-4B de parametros por token, un MoE de clase 26B cuantizado en Q4_0 (repositorio de 14,8 GB) puede ejecutarse en estaciones de trabajo con GPU consumer de 16-24 GB, algo inviable para un modelo denso de 26B.
- Razonamiento adaptativo por coste: los seis niveles de esfuerzo permiten usar el nivel bajo para tareas simples (clasificacion, extraccion) y el alto para problemas complejos, ajustando latencia y consumo segun el caso.
- Analisis de imagenes con texto asociado: el pipeline `image-text-to-text` habilita tareas de descripcion, extraccion de informacion de capturas o documentos escaneados combinados con instrucciones textuales.
- Integracion en pipelines de inferencia local: la compatibilidad bit-exacta entre llama.cpp y aikar-engine permite desarrollar y validar en un backend y desplegar en otro sin divergencias numericas, util en entornos con requisitos de reproducibilidad.
- Servicio con contexto muy largo y presupuesto de memoria ajustado: la reduccion de KV-cache de hasta el 45% frente a Gemma 4 facilita servir sesiones de 256K tokens en infraestructura con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos; solo afirma el objetivo de superar a AIKAR 3.2 Pro en capacidad general, sin datos que lo respalden en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 14,8 GB, por lo que la inferencia en Q4_0 requiere aproximadamente 16 GB de VRAM o memoria unificada, mas el espacio adicional para KV-cache (reducido hasta un 45% con aikar-engine frente a Gemma 4).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en RTX 4090 (24 GB), RTX 4080 (16 GB, al limite), A100 (40/80 GB) y H100 (80 GB) para mayor margen y batching.
- GPU consumer: si, en tarjetas con 16 GB o mas (RTX 4080, 4090, 4060 Ti de 16 GB), gracias a la activacion parcial de solo ~3-4B de parametros.
- Opciones de despliegue: llama.cpp y aikar-engine (ambos soportados de forma explicita y con inferencia bit-exacta validada); Ollama, vLLM o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que las mejoras reales de throughput dependen de hardware, ancho de banda de memoria, batching, comportamiento del routing e implementacion del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Lumen 3.8 Pulsar 26B-A3B | ~25,2B | ~3,82B (prefill) / ~3,08B (decode) | 262.144 | no disponible | GGUF, compressed-tensors |
| google/gemma-4-26B-A4B (base) | no disponible | ~4B (segun designacion) | no disponible | no disponible | no disponible |
| AIKAR 3.2 Pro | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base (Gemma 4 26B-A4B) y con AIKAR 3.2 Pro como referencia declarada de rendimiento. No se dispone de datos de parametros, contexto ni licencia de estos dos modelos en la informacion disponible, ni de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: el autor afirma superar a AIKAR 3.2 Pro, pero no aporta cifras verificables en la model card.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el modelo deriva de Gemma 4, por lo que probablemente herede restricciones de la licencia de Google, pero esto no se confirma en la informacion proporcionada.
- Idiomas soportados no documentados: no hay garantia de calidad multilingue fuera del ingles.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan evaluaciones de factualidad.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- WSPO es una metodologia propietaria del autor sin publicacion cientifica revisada disponible; la propia model card reconoce que una implementacion anterior tenia capacidad representacional limitada y que la revision de rango 32 esta "planeada".
- La edicion W4A16 en compressed-tensors es una conversion con perdida que no preserva la asignacion de precision mixta; solo la W8A16 es bit-exacta respecto al GGUF de referencia.
- Las mejoras de throughput dependen del backend y del hardware; no se garantizan cifras concretas.
- La ventana de atencion deslizante de 1.024 tokens puede implicar perdida de detalle en dependencias de muy largo alcance dentro de los 262K tokens de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DFveloper/Lumen-3.8-Pulsar-26B-A3B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
