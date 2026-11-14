# lijie1228/liemo-0.8b-vl

## Resumen

LiEmo 0.8B VL (烈模) es un modelo multimodal de imagen-texto derivado de Qwen3.5-VL 0.8B, desarrollado por el usuario lijie1228. No se trata de una arquitectura original, sino de un ajuste fino mediante LoRA (r=8, alpha=16) posteriormente fusionado con el modelo base, orientado a reforzar el razonamiento matemático, la consistencia de identidad, la negativa honesta ante preguntas sin respuesta y la capacidad lógica en chino e inglés. El modelo conserva la torre visual del Qwen3.5-VL original, aunque esta no ha sido reentrenada.

Con aproximadamente 1.027 millones de parámetros (unos 1.1B incluyendo la torre visual), LiEmo se posiciona como un VLM de bolsillo pensado para despliegue local en hardware modesto. Su interés radica en la publicación de pesos en múltiples formatos (safetensors, GGUF F16 y cuantizaciones desde Q2_K hasta Q8_0), lo que facilita su ejecución con llama.cpp y Ollama, además de permitir un ajuste fino posterior con Transformers y PEFT.

La relevancia actual del modelo es doble: por un lado, demuestra que un ajuste LoRA de bajo rango sobre un VLM pequeño puede mejorar sustancialmente métricas de honestidad y razonamiento (según la evaluación del propio autor, de 27/45 a 41/45 en su conjunto de pruebas); por otro, ofrece una alternativa ligera y de licencia Apache-2.0 para tareas de visión-lenguaje en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con torre visual) |
| Parametros totales | 1.027.125.568 (aprox. 1.1B incluyendo torre visual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada; >4K no probado según el autor) |
| Tipos de cuantizacion | GGUF: Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0; F16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (HF), GGUF (llama.cpp/Ollama) |

## Arquitectura y entrenamiento

LiEmo se construye sobre la arquitectura Qwen3.5-VL, un transformer multimodal que combina un modelo de lenguaje con una torre visual para el procesamiento de imágenes. El ajuste se realizó mediante LoRA con rango 8 y alpha 16, posteriormente fusionado en los pesos finales, lo que da como resultado un checkpoint único compatible con Transformers sin necesidad de cargar adaptadores por separado. La torre visual no fue modificada durante el ajuste; sus capacidades de percepción son las heredadas del Qwen3.5-VL 0.8B original.

El conjunto de datos de entrenamiento, según la model card, consta de aproximadamente 4.000 muestras en chino para reconstrucción de capacidades, 24 muestras de corrección matemática, unas 2.000 muestras de razonamiento, unas 800 muestras de personalidad/identidad y un conjunto de respuestas estándar escritas manualmente para seis dimensiones de evaluación. No se especifica el número total de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO. El autor indica que el ajuste busca reforzar la negativa honesta y la consistencia de identidad, áreas en las que el modelo base mostraba un rendimiento bajo.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Razonamiento matemático de nivel escolar (el autor lo limita a nivel de secundaria).
- Razonamiento lógico y respuesta a preguntas de conocimiento general.
- Procesamiento de imagen-texto (image-text-to-text) mediante la torre visual heredada del modelo base.
- Negativa honesta ante preguntas sin respuesta o fuera del alcance del modelo.
- Consistencia de identidad (el modelo mantiene una persona definida).
- Soporte de plantilla de chat (chat_template.jinja) y formato compatible con endpoints.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistencia educativa en matemáticas de secundaria: el modelo puede resolver y explicar problemas aritméticos y algebraicos sencillos, aprovechando las 24 muestras de corrección matemática y las 2.000 muestras de razonamiento incluidas en el ajuste.
- Descripción y respuesta sobre imágenes en local: gracias a la torre visual y al formato GGUF con mmproj, puede ejecutarse con llama.cpp en un portátil para tareas de captioning o preguntas sobre imágenes sin conexión a la nube.
- Chatbot de atención al cliente en chino: su ventana de contexto (no confirmada más allá de 4K) y su capacidad conversacional permiten gestionar diálogos multi-turno de complejidad moderada en entornos con recursos limitados.
- Filtro de contenido y negativa honesta: el refuerzo en la dimensión de honestidad (de 2/6 a 5/6 según el autor) lo hace adecuado para escenarios donde se requiere que el modelo admita desconocimiento en lugar de alucinar.
- Prototipado rápido de aplicaciones VLM: al caber en cuantización Q4_K_S (629 MB), es posible desplegarlo en una Raspberry Pi o en un portátil sin GPU dedicada para validar ideas antes de escalar a modelos mayores.
- Base para ajuste fino adicional: los pesos safetensors permiten continuar el entrenamiento con PEFT LoRA sobre dominios específicos, partiendo de un modelo ya alineado en identidad y honestidad.
- Evaluación comparativa de cuantizaciones: el repositorio incluye nueve niveles de cuantización GGUF con métricas de calidad publicadas, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de la cuantización en modelos pequeños.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 45 preguntas en 6 dimensiones (votación mayoritaria sobre 3 muestras), comparando el modelo base con LiEmo:

| Dimension | Base | LiEmo |
|---|---|---|
| Matemáticas | 8/15 | 14/15 |
| Identidad | 6/6 | 6/6 |
| Sentido común | 5/6 | 6/6 |
| Honestidad | 2/6 | 5/6 |
| Lógica | 3/6 | 4/6 |
| Conocimiento | 3/6 | 6/6 |
| **Total** | **27/45** | **41/45** |

Además, se incluye una comparación de cuantizaciones (12 preguntas × 3 rondas):

| Nivel | Base | LiEmo |
|---|---|---|
| F16 | 6/12 | 12/12 |
| Q8_0 | 6/12 | 12/12 |
| Q5_K_M | 7/12 | 12/12 |
| Q4_K_S | 7/12 | 10/12 |

Y una tabla de calidad por nivel de cuantización del propio LiEmo: F16, Q8_0, Q5_K, Q4_0, Q4_K_S y Q4_1 obtienen 12/12; Q4_K_M, 11/12; Q3_K_S y Q3_K_M, 8/12; Q2_K, 0/12. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en F16, 1,1 GB en Q8_0, 0,7-0,8 GB en Q5, 0,6-0,7 GB en Q4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16; para cuantizaciones Q4 basta con 1-2 GB.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores; también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server con --mmproj), Ollama (mediante Modelfile incluido), Transformers con safetensors.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LiEmo 0.8B VL | ~1.1B | no disponible | Apache-2.0 | safetensors, GGUF | Ajuste LoRA sobre Qwen3.5-VL 0.8B; enfoque en honestidad y matemáticas |
| Qwen3.5-VL 0.8B | ~0.8B (base) | no disponible | Apache-2.0 | safetensors | Modelo base; menor rendimiento en honestidad y matemáticas según el autor |
| Otros VLM pequeños (p. ej. SmolVLM, Phi-3.5-vision) | 0.5B-4B | variable | variable | safetensors, GGUF | No se dispone de comparación directa publicada en la información proporcionada |

No se dispone de datos comparativos adicionales con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño (0.8B): el razonamiento multi-paso complejo sigue siendo propenso a errores.
- Capacidad matemática limitada a nivel de secundaria según el propio autor.
- La torre visual no fue ajustada; las capacidades de percepción son las del modelo base.
- Contexto largo (>4K) no probado suficientemente.
- Riesgo de alucinación inherente a modelos de este tamaño, pese a la mejora en honestidad.
- Sesgos potenciales heredados del corpus de entrenamiento del modelo base, no documentados.
- Cuantizaciones Q3 y Q2 degradan gravemente la calidad (Q2_K inutilizable según el autor).
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-VL.
- Solo soporta chino e inglés; no hay soporte documentado de otros idiomas.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/lijie1228/liemo-0.8b-vl
- Modelo base: https://huggingface.co/Qwen
- Repositorio llama.cpp (no enlazado en la model card, pero referenciado para ejecución): no disponible en la información proporcionada
- Paper o blog técnico: no disponible
- Demo: no disponible
