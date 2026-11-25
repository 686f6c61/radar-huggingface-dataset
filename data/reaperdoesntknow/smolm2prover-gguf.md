# reaperdoesntknow/SMOLM2Prover-GGUF

## Resumen

SMOLM2Prover es un ajuste fino (SFT) del modelo prithivMLmods/SmolLM2-CoT-360M, un transformer decoder-only de tipo LlamaForCausalLM con 361.821.120 parámetros, orientado a la generación de demostraciones matemáticas y razonamiento paso a paso (chain-of-thought). Lo desarrolla el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC: Research Division, y esta ficha concreta es la versión cuantizada en formato GGUF del modelo original, publicada para su uso con llama.cpp y runtimes compatibles.

El modelo hereda la arquitectura de SmolLM2 (32 capas, dimensión de embedding 960, atención con GQA de 15 cabezas de consulta y 5 de clave/valor) y una ventana de contexto de 8192 tokens. Se ha entrenado mediante SFT con TRL sobre el dataset AI-MO/NuminaMath-1.5, un corpus de problemas matemáticos con soluciones razonadas. Su relevancia práctica radica en que ofrece capacidades de razonamiento matemático en un tamaño inferior a 400 millones de parámetros, lo que permite ejecutarlo en CPU y en GPUs de consumo con requisitos de memoria muy bajos.

La versión GGUF incluye dos ficheros: uno en F16 (692 MB) y otro en Q4_K_M (258 MB), este último recomendado por el autor por su equilibrio entre calidad y tamaño. El modelo está publicado con licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | F16 y Q4_K_M (Q4_K con fallback Q5_0 en tensores no divisibles por 256, y Q6_K/Q8_0 en capas críticas); 5,94 BPW en Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo GGUF); el modelo original en safetensors |
| Dimension de embedding | 960 |
| Numero de capas | 32 |
| Cabezas de atencion | 15 (Q) / 5 (KV), GQA |
| Tamano del repo | 1,0 GB |
| Modelo base | prithivMLmods/SmolLM2-CoT-360M |
| Dataset de entrenamiento | AI-MO/NuminaMath-1.5 |
| Metodo de entrenamiento | SFT con TRL (generated_from_trainer) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la topología estándar de Llama: 32 capas, dimensión oculta de 960 y atención con grouped-query attention (15 cabezas de consulta frente a 5 de clave/valor), lo que reduce el coste de memoria del KV cache durante la inferencia. La ventana de contexto es de 8192 tokens. No emplea mezcla de expertos ni arquitecturas híbridas SSM; es un transformer denso convencional de pequeño tamaño.

El entrenamiento se realizó mediante supervised fine-tuning (SFT) con la librería TRL sobre el dataset AI-MO/NuminaMath-1.5, un corpus de problemas matemáticos con soluciones en formato chain-of-thought. El modelo parte de prithivMLmods/SmolLM2-CoT-360M, que a su vez es un ajuste de SmolLM2 orientado a razonamiento CoT. La model card del autor menciona el marco teórico "Discrepancy Calculus" (DISC) como contexto metodológico del portfolio, pero no aporta detalles verificables sobre hiperparámetros, número de tokens de entrenamiento, composición exacta del dataset ni si hubo fases de RLHF o DPO. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought) en inglés.
- Resolución de problemas matemáticos, con énfasis en cálculo y lógica según las etiquetas del modelo.
- Generación de demostraciones (proof) matemáticas estructuradas.
- Conversación multi-turno (etiqueta conversational).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá del CoT.
- Capacidades multilingües limitadas al inglés declarado.
- No se documenta soporte de visión, audio ni modo thinking explícito separado.

## Casos de uso

- Asistencia en resolución de problemas de cálculo: el modelo puede generar el desarrollo paso a paso de integrales, derivadas y límites en inglés, útil como tutor interactivo para estudiantes que necesitan ver el razonamiento intermedio y no solo el resultado.
- Generación de borradores de demostraciones matemáticas: adecuado para prototipar pruebas formales o esquemas de demostración que un humano revisa después, gracias a su entrenamiento sobre NuminaMath-1.5 con soluciones razonadas.
- Despliegue en entornos con recursos muy limitados: con 258 MB en Q4_K_M puede ejecutarse en CPU o en GPUs de gama baja, lo que permite integrarlo en herramientas de escritorio, plugins de editores o aplicaciones locales sin conexión.
- Filtrado y clasificación de razonamientos matemáticos: puede usarse como generador de cadenas de razonamiento para comparar y puntuar soluciones en pipelines de evaluación de modelos mayores.
- Educación y divulgación: generación de explicaciones intermedias en inglés para materiales didácticos de matemáticas, con la ventaja de que el contenido puede revisarse y editarse localmente.
- Prototipado rápido de asistentes conversacionales especializados en matemáticas: su naturaleza conversacional y su reducido tamaño permiten iterar rápidamente en demos con Ollama o LM Studio antes de escalar a modelos mayores.
- Investigación sobre CoT en modelos pequeños: sirve como línea base para estudiar hasta qué punto el razonamiento paso a paso emerge en modelos de menos de 400 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en F16 y 0,3 GB en Q4_K_M para los pesos; el KV cache para 8192 tokens con GQA añade una cantidad moderada adicional.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100. Funciona en GPUs integradas y en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (mediante Modelfile), LM Studio; también es compatible con runtimes que acepten GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño del modelo, la inferencia en CPU es viable para uso interactivo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SMOLM2Prover (GGUF) | 361,8 M | 8192 | Apache 2.0 | GGUF | Especializado en proof/CoT matemático; solo inglés |
| prithivMLmods/SmolLM2-CoT-360M | ~360 M | no disponible | no disponible | safetensors | Modelo base del que deriva; orientado a CoT |
| SmolLM2-360M (HuggingFaceTB) | 362 M | 8192 (según familia SmolLM2) | Apache 2.0 | safetensors, GGUF | Modelo generalista original de la familia |
| Qwen2.5-0.5B-Instruct | ~500 M | 32768 | Apache 2.0 | safetensors, GGUF | Alternativa generalista multilingüe de tamaño similar |

La comparación con SmolLM2-360M y Qwen2.5-0.5B-Instruct se ofrece como referencia de categoría; no se dispone de datos de benchmarks del SMOLM2Prover que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo elevado de alucinación en demostraciones matemáticas: al ser un modelo de 360 M de parámetros, los pasos intermedios pueden parecer plausibles pero contener errores lógicos o aritméticos; requiere verificación humana.
- No se documentan evaluaciones formales de sesgo; al entrenarse sobre un corpus matemático, los sesgos lingüísticos y culturales del dataset base pueden persistir.
- La ventana de contexto de 8192 tokens limita problemas muy extensos o conversaciones largas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base y el dataset de entrenamiento pueden tener sus propias condiciones; conviene revisar la licencia de prithivMLmods/SmolLM2-CoT-360M y de AI-MO/NuminaMath-1.5 antes de un despliegue en producción.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- La model card incluye referencias a un marco teórico propietario (Discrepancy Calculus) sin detalles reproducibles sobre el proceso de entrenamiento, lo que dificulta la auditoría del ajuste fino.
- El repositorio GGUF tiene pocas descargas y cero likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/reaperdoesntknow/SMOLM2Prover-GGUF
- Modelo original: https://huggingface.co/reaperdoesntknow/SMOLM2Prover
- Modelo base: https://huggingface.co/prithivMLmods/SmolLM2-CoT-360M
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-1.5
- Portfolio del autor: https://huggingface.co/reaperdoesntknow
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
