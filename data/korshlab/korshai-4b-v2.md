# KorshLAB/KorshAI-4B-v2

## Resumen

KorshAI-4B-v2 es un modelo de lenguaje denso de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por KorshLAB y Korsh, orientado a generación de código políglota y programación de sistemas. Se distribuye principalmente en formato GGUF con cuantización Q4_K_M calculada mediante matrices de importancia (imatrix) específicas para corpus de código multilingüe, lo que permite ejecutarlo en hardware de consumo con una huella de memoria reducida.

El modelo está especializado en C11, C++20, Python 3, PHP 8.2+, HTML5 y Bootstrap 5, además de generación de salida estructurada conforme a JSON Schema. Según la model card, ha sido verificado con un protocolo de compilación estricto (flags `-Wall -Wextra -Werror -pedantic`) sobre un conjunto de pruebas propio de KorshLab, con tasas de aprobación del 100 % en los dominios declarados.

Es relevante para desarrolladores que necesitan un asistente de código ligero, desplegable en portátiles, mini-PC o GPUs de gama media, con licencia Apache 2.0 y soporte para `llama.cpp`, Ollama y otros runtimes locales. La model card indica que existe una versión posterior, KorshAI-4B-v5, que el autor recomienda por encima de esta v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura propietaria descrita como "native 4B dense") |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens (soporte declarado vía KV cache; 4.096 tokens en el ejemplo de uso) |
| Tipos de cuantizacion | Q4_K_M con imatrix (único fichero publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `KorshAI-4B-v2.gguf`, 2,74 GB); safetensors referenciado por el recuento de parámetros del repo, pero no listado como fichero principal |
| Tamano del repositorio | 2,8 GB |
| Plantilla de prompt | estilo ChatML (`<|im_start|>`, `<|im_end|>`) |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura transformer densa de aproximadamente 4,2 mil millones de parámetros, sin mezcla de expertos, diseñada específicamente para comprensión políglota de código y razonamiento algorítmico. La model card la califica como "propietaria", aunque los pesos se publican bajo Apache 2.0. No se detalla el número de capas, dimensiones ocultas, mecanismo de atención ni si emplea técnicas como decodificación especulativa o atención lineal.

En cuanto a entrenamiento, no se especifican el volumen de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Sí se indica que la verificación se realizó con la suite de sandbox multinivel de KorshLab, compilando y ejecutando las salidas con compiladores reales (GCC 12+, G++ 12+, PHP 8.2 CLI) y validando HTML5 contra criterios W3C/WCAG 2.1 AA y JSON contra `jsonschema` RFC 7159. La cuantización Q4_K_M se generó con matrices de importancia calculadas sobre corpus de código en varios lenguajes, con el objetivo declarado de preservar la perplejidad de fp16 con un coste de memoria mínimo.

## Capacidades

- Generación de código en C11, C++20, Python 3, PHP 8.2+, HTML5 y Bootstrap 5.
- Programación de sistemas de bajo nivel: operaciones SIMD, manipulación de bits, productos escalares en FP32, asignadores de memoria tipo arena y gestión RAII.
- Generación de salida estructurada conforme a JSON Schema estricto (RFC 7159).
- Generación de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento algorítmico y resolución de problemas de programación.
- Capacidades multilingües limitadas a inglés y español.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- No se declara soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido ("thinking mode").

## Casos de uso

- Asistente de código en IDE local: el modelo puede autocompletar y generar funciones en C, C++, Python y PHP dentro de extensiones tipo Continue o similares, ejecutándose en una GPU de 6-8 GB de VRAM con una latencia de 60-85 tokens/s, adecuada para sugerencias interactivas.
- Revisión y corrección de código de sistemas: gracias a su entrenamiento con flags estrictos de compilador, puede detectar y corregir advertencias y errores que romperían compilaciones con `-Werror -pedantic`, integrándose en hooks de pre-commit o pipelines de CI/CD.
- Generación de backend PHP con tipos estrictos: útil para producir controladores y clases con `declare(strict_types=1)`, aserciones y validación, reduciendo el trabajo manual en proyectos PHP 8.2+.
- Maquetación web accesible: puede generar componentes HTML5 y Bootstrap 5 con modales accesibles y estructura semántica conforme a WCAG 2.1 AA, apropiado para prototipado rápido de interfaces.
- Generación de JSON estructurado para APIs: su validación contra JSON Schema lo hace apto para producir payloads y respuestas de API que deben cumplir un contrato estricto, por ejemplo en integraciones entre servicios.
- Despliegue en edge y dispositivos de bajos recursos: con una huella activa de aproximadamente 3,4 GB en CPU y 6-8,5 tokens/s en una Raspberry Pi 5 o Rockchip RK3588, puede ofrecer asistencia de código offline en entornos sin GPU.
- Inferencia local en portátiles Apple Silicon: con 8 GB de memoria unificada y Metal alcanza 40-55 tokens/s, lo que permite usarlo como asistente de programación sin conexión en MacBook.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar presenta una tabla de verificación propia basada en compilación y ejecución real:

| Dominio / stack | Alcance de la prueba | Estándar de verificación | Tasa de aprobación |
|---|---|---|---|
| C11 Systems | Producto escalar FP32/SIMD, manipulación de bits | GCC 12+ (`-Wall -Wextra -Werror -pedantic -std=c11`) | 100 % (PASSED) |
| C++20 Modern | Asignador arena personalizado, handles RAII | G++ 12+ (`-Wall -Wextra -Werror -std=c++20`) | 100 % (PASSED) |
| PHP 8.2+ Backend | Tipos estrictos, OOP, aserciones | PHP 8.2 CLI Engine | 100 % (PASSED) |
| HTML5 & Web | UI semántica, modales accesibles, Bootstrap 5 | W3C / WCAG 2.1 AA | 100 % (PASSED) |
| Structured Output | Cumplimiento estricto de JSON Schema | Python `jsonschema` RFC 7159 | 100 % (PASSED) |

No se han publicado resultados de benchmarks estándar en la información disponible. La model card menciona una puntuación de 55,85 para la versión v5, sin especificar la métrica ni el benchmark empleado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia con Q4_K_M: aproximadamente 3,1 GB a 2.048 tokens de contexto, 3,4 GB a 4.096, 4,1 GB a 8.192, 5,5 GB a 16.384 y 8,3 GB a 32.768 tokens.
- GPU recomendadas: RTX 3060, 3070, 4060 o 4070 para el tier acelerado; RTX 2060 o 3060 para contexto de 4.096 tokens; RTX 3070 o 4060 Ti para 16.384 tokens; RTX 3060 de 12 GB o 4070 para 32.768 tokens.
- Cabe en GPUs de consumo: sí, desde 4-6 GB de VRAM para contextos cortos y 8-12 GB para contextos largos.
- CPU: 4 núcleos x86_64 con AVX2 (o AMD Ryzen) y 6 GB de RAM para inferencia solo CPU; también soporta AVX-512 y ARM NEON.
- Apple Silicon: 8 GB de memoria unificada en M1/M2/M3/M4 con Metal.
- Edge: Raspberry Pi 5 o Rockchip RK3588 con 8 GB LPDDR4X.
- Opciones de despliegue: `llama.cpp` (b3000+), Ollama (v0.1.30+), LM Studio, Jan.ai, LocalAI, Text Generation WebUI y bindings de Python vía `llama-cpp-python`.
- Backends de cómputo: CUDA/cuBLAS, Metal, ROCm/HIP, Vulkan, AVX2/AVX-512 y ARM NEON.
- Throughput declarado: 5-15 tokens/s en CPU, 60-85 tokens/s en GPU (con ~950 tokens/s de prompt processing), 40-55 tokens/s en Apple Silicon y 6-8,5 tokens/s en SBC ARM64.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KorshAI-4B-v2 | 4,2 B (denso) | hasta 32.768 | Apache 2.0 | GGUF (Q4_K_M) | Especializado en C/C++/Python/PHP/HTML5; sin benchmarks estándar publicados |
| Qwen2.5-Coder-3B | 3 B (denso) | 32.768 | Apache 2.0 | safetensors, GGUF | Familia con benchmarks publicados en HumanEval y similares; cobertura de código más amplia |
| Qwen2.5-Coder-7B | 7 B (denso) | 32.768 | Apache 2.0 | safetensors, GGUF | Mayor tamaño y rendimiento en benchmarks, requiere más VRAM |
| CodeLlama-7B | 7 B (denso) | 16.384 | Llama 2 (uso comercial con restricciones) | safetensors, GGUF | Referencia en código; contexto menor y licencia más restrictiva |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada, ya que KorshAI-4B-v2 no publica métricas en benchmarks estándar que permitan una comparación directa.

## Limitaciones y advertencias

- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que el rendimiento relativo frente a otros modelos de código no puede verificarse de forma independiente.
- La model card califica la arquitectura como "propietaria" pese a la licencia Apache 2.0; conviene revisar los términos exactos antes de un uso comercial.
- Idiomas soportados limitados a inglés y español; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación inherente a modelos de 4 B parámetros, especialmente en APIs poco comunes o código con dependencias externas no vistas en entrenamiento.
- Solo se publica una cuantización (Q4_K_M); no hay versiones fp16, Q8_0 ni otras que permitan evaluar la pérdida de calidad por cuantización.
- La tasa de aprobación del 100 % procede de la suite propia del autor, no de evaluaciones independientes; puede reflejar sobreajuste al conjunto de verificación.
- El autor recomienda la versión posterior KorshAI-4B-v5, lo que sugiere que v2 es una versión superada dentro de la misma familia.
- No se declara soporte de tool calling ni de agentes, lo que limita su uso en pipelines que requieran function calling estructurado.
- El contexto máximo de 32.768 tokens requiere 8,3 GB de memoria solo para KV cache en Q4_K_M, lo que puede exceder GPUs de 8 GB.
- No se detallan los datos de entrenamiento ni posibles sesgos; no hay información sobre filtrado de código con licencias incompatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KorshLAB/KorshAI-4B-v2
- Versión recomendada v5: https://huggingface.co/KorshLAB/KorshAI-4B-v5
- Sitio de KorshLab: https://korshlab.space
- Sitio de Korsh: https://korsh.org
- Banner del modelo: https://huggingface.co/KorshLAB/KorshAI-4B-v2/resolve/main/banner.jpg
- Fichero GGUF: https://huggingface.co/KorshLAB/KorshAI-4B-v2/resolve/main/KorshAI-4B-v2.gguf
