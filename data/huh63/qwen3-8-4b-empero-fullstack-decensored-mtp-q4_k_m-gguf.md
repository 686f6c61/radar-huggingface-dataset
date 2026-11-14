# hUh63/Qwen3.8-4B-Empero-FullStack-Decensored-MTP-Q4_K_M-GGUF

## Resumen

Qwen3.8-4B-Empero-FullStack-Decensored-MTP-Q4_K_M-GGUF es una cuantización GGUF Q4_K_M del modelo iBotIA/Qwen3.8-4B-Empero-AI-FullStack, un fine-tune de ingeniería full-stack (279.000 segmentos curados sobre React Router v8, NestJS, Prisma/Drizzle, TypeScript en modo estricto, Tailwind + shadcn y Flutter) construido sobre empero-ai/Qwen3.8-4B-Distill, que a su vez es una destilación de parámetros completos del profesor Qwen3.8 2.4T-A95B dentro de la arquitectura Qwen3.5-4B. La cuantización la publica el usuario hUh63 con llama.cpp y añade una peculiaridad relevante: conserva la cabeza MTP (multi-token-prediction) en Q8_0 para preservar la tasa de aceptación de la decodificación especulativa.

El modelo es multimodal (pipeline image-text-to-text), con torre de visión heredada de Qwen3.5, y ha sido "descensurado" mediante Heretic v2.1.0.dev0 con ablación ARA (Arbitrary-Rank Ablation), lo que debilita deliberadamente la alineación de seguridad del modelo original. Se distribuye bajo licencia Apache 2.0 y soporta siete idiomas: inglés, chino, coreano, japonés, ruso, español y francés.

Su relevancia práctica es doble: por un lado, ofrece un modelo de 4B parámetros especializado en generación de código full-stack que cabe en hardware de consumo; por otro, documenta de forma inusualmente rigurosa el efecto de cuantizar la capa MTP, con mediciones de tasa de aceptación y perplejidad que permiten evaluar el compromiso entre tamaño y velocidad de decodificación especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (linaje Qwen3.5-4B) con cabeza MTP integrada (1 capa, `nextn_predict_layers = 1`) y torre de visión |
| Parametros totales | 4B (aproximado, según el modelo base Qwen3.5-4B); el GGUF tiene 393 tensores en 33 bloques |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M (cuerpo principal), Q8_0 para la capa MTP, F16 para el proyector de visión (mmproj); distribución de tipos: F32 184 / Q4_K 168 / Q6_K 33 / Q8_0 8 |
| Idiomas soportados | en, zh, ko, ja, ru, es, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), ~5,29 BPW |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parámetros derivado de Qwen3.5-4B. Sobre esa arquitectura, empero-ai/Qwen3.8-4B-Distill realizó una destilación de parámetros completos desde el profesor Qwen3.8 2.4T-A95B (un MoE de 2,4 billones de parámetros totales y 95B activos), y posteriormente iBotIA/Qwen3.8-4B-Empero-AI-FullStack lo afinó con 279.000 segmentos curados de ingeniería full-stack. La torre de visión procede del propio Qwen3.5. El modelo incorpora una cabeza de predicción multi-token (MTP) de una sola capa dentro de la misma red, que actúa como borrador para decodificación especulativa.

La cuantización de hUh63 mapea los 15 tensores `mtp.*` al bloque 32 del GGUF, resultando en `block_count = 33`. La innovación técnica destacable es el override de precisión: la capa MTP se mantiene en Q8_0 mientras el resto del cuerpo va en Q4_K_M, porque al ser una capa de solo borrador (verify-then-accept) su cuantización afecta a la tasa de aceptación y no a la perplejidad. El proceso de descensurado se realizó con Heretic v2.1.0.dev0 (commit `75a640b7eb`), usando el modificador ARA estándar con `lora_alpha = lora_rank = 16` y los scorers `KeywordRate` y `KLDivergence` sin modificar, sobre una máquina de 24 núcleos y 48 GiB de RAM sin GPU.

## Capacidades

- Generación de texto y razonamiento general, heredados de la destilación de Qwen3.8.
- Generación de código full-stack: React Router v8, NestJS, Prisma/Drizzle, TypeScript en modo estricto, Tailwind + shadcn y Flutter.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector mmproj en F16.
- Decodificación especulativa con MTP integrado (`llama-server --spec-type draft-mtp`), con tasa de aceptación medida del 68,75 % y longitud media aceptada de 3,07 tokens.
- Capacidades multilingües en siete idiomas (en, zh, ko, ja, ru, es, fr).
- Comportamiento descensurado: la alineación de seguridad del modelo fuente está debilitada de forma deliberada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código full-stack en local: el modelo está afinado específicamente sobre 279.000 segmentos de React Router v8, NestJS, Prisma/Drizzle, TypeScript estricto, Tailwind + shadcn y Flutter, por lo que resulta adecuado para autocompletar y generar componentes, controladores y esquemas de base de datos en un IDE con hardware de consumo.
- Revisión y refactorización de TypeScript en modo estricto: al haber sido entrenado sobre código con tipado estricto, puede detectar y corregir errores de tipos, genéricos e inferencia en proyectos existentes.
- Generación de interfaces a partir de capturas o mockups: gracias a la torre de visión y al proyector mmproj en F16, puede recibir una imagen de diseño y producir el código correspondiente en React o Flutter.
- Prototipado rápido de APIs NestJS: puede generar controladores, servicios, DTOs y migraciones de Prisma o Drizzle a partir de una descripción textual del dominio.
- Inferencia en hardware de consumo: con 2,87 GB para el GGUF principal y 0,67 GB para el proyector de visión, el modelo completo cabe en GPUs de gama media y en equipos con RAM suficiente, lo que permite desplegarlo en portátiles y estaciones de trabajo sin GPU dedicada de gama alta.
- Investigación sobre decodificación especulativa: el repositorio incluye mediciones de tasa de aceptación con tres precisiones distintas de la capa MTP, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de la cuantización en cabezas de borrador.
- Experimentación con modelos descensurados en entornos controlados: para investigadores que necesiten estudiar el efecto de la ablación ARA sobre la alineación, con la advertencia de que el modelo debilita deliberadamente sus salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, etc.) en la información disponible; el autor indica explícitamente que no se ejecutó ninguna suite de benchmarks sobre este derivado. Sí se publican mediciones de perplejidad y de tasa de aceptación de la decodificación especulativa:

| Metrica | Valor |
|---|---|
| Perplejidad BF16 GGUF (33 bloques, MTP integrado) | 10,0916 ± 1,14470 |
| Perplejidad Q4_K_M con MTP Q8_0 (este repo) | 10,3287 ± 1,17320 (+2,35 % vs BF16) |
| Perplejidad Q4_K_M con MTP Q6_K | 10,3287 ± 1,17320 (+2,35 %) |
| Perplejidad Q4_K_M sin override de MTP | 10,3287 ± 1,17320 (+2,35 %) |

| Precision de la capa MTP | Tasa de aceptación agrupada | Media por prompt | Longitud media aceptada |
|---|---|---|---|
| Q8_0 (este repo) | 68,75 % | 69,2 % (57,8–76,75 %) | 3,07 |
| Q6_K | 67,97 % | 68,6 % (56,16–76,75 %) | 3,05 |
| Por defecto (sin override) | 67,63 % | 68,4 % (55,06–77,98 %) | 3,04 |

Medición realizada con 12 prompts de 300 tokens cada uno, `llama-server --spec-type draft-mtp`, mismo muestreo y mismos pesos del tronco. El autor advierte que las diferencias de un dígito entre columnas están dentro del ruido entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,87 GB para el GGUF Q4_K_M y 0,67 GB adicionales para el proyector de visión F16, es decir, en torno a 3,5 GB en total para el modo multimodal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo completo con visión; no se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU de consumo: sí, por el tamaño del archivo (2,87 GB en Q4_K_M); también puede ejecutarse en CPU, como demuestra el proceso de descensurado del autor, realizado con 24 núcleos y 48 GiB de RAM sin GPU.
- Opciones de despliegue: llama.cpp, incluyendo `llama-server` con `--spec-type draft-mtp` para aprovechar la decodificación especulativa; otras opciones como vLLM, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles de forma directa; la longitud media aceptada de 3,07 tokens por paso de verificación con la capa MTP en Q8_0 proporciona una indicación del rendimiento relativo de la decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Empero-FullStack-Decensored-MTP Q4_K_M (este) | 4B | No disponible | GGUF Q4_K_M, 5,29 BPW | Apache 2.0 | Descensurado con Heretic, MTP en Q8_0, visión |
| iBotIA/Qwen3.8-4B-Empero-AI-FullStack | 4B | No disponible | Pesos originales (formato no disponible) | Apache 2.0 | Modelo fuente sin descensurar ni cuantizar |
| empero-ai/Qwen3.8-4B-Distill | 4B | No disponible | No disponible | No disponible | Destilación del profesor Qwen3.8 2.4T-A95B |
| Qwen/Qwen3.5-4B | 4B | No disponible | No disponible | No disponible | Arquitectura base y torre de visión original |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo debilita deliberadamente la alineación de seguridad del modelo fuente; el autor lo restringe a investigación y uso local, y advierte de que el riesgo de cumplimiento normativo recae en el usuario.
- La cuantización Q4_K_M es con pérdida: la perplejidad aumenta un 2,35 % respecto a BF16.
- No se ha ejecutado ninguna suite de benchmarks estándar sobre este derivado, por lo que no hay evidencia publicada de rendimiento en MMLU, GSM8K, HumanEval u otras tareas.
- Heretic v2.1.0.dev0 es una instantánea de desarrollo, no una versión estable, lo que introduce incertidumbre sobre la reproducibilidad del proceso de descensurado.
- Las tasas de aceptación de la decodificación especulativa varían decenas de puntos porcentuales entre ejecuciones en la misma máquina, según el propio autor; las diferencias entre precisiones de MTP no deben interpretarse como mejoras significativas.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas.
- El modelo está especializado en un stack tecnológico concreto (React Router v8, NestJS, Prisma/Drizzle, TypeScript estricto, Tailwind + shadcn, Flutter); su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo de 4B destilado y cuantizado.
- Sesgos conocidos: no documentados en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/hUh63/Qwen3.8-4B-Empero-FullStack-Decensored-MTP-Q4_K_M-GGUF
- Modelo fuente full-stack: https://huggingface.co/iBotIA/Qwen3.8-4B-Empero-AI-FullStack
- Modelo destilado: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Arquitectura base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia (enlace del autor): https://huggingface.co/iBotIA/Qwen3.8-4B-Empero-AI-FullStack/raw/main/README.md
- Heretic (repositorio): https://github.com/p-e-w/heretic
