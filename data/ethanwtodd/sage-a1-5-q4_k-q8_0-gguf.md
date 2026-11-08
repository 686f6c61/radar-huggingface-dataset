# ethanwtodd/Sage-A1.5-Q4_K-Q8_0-GGUF

## Resumen

Sage-A1.5 Q4_K-Q8_0 GGUF es una cuantización mixta del modelo InternScience/Sage-A1.5, un fine-tune de Qwen3.6-35B-A3B con arquitectura MoE (Mixture of Experts) y capacidades multimodales. Lo publica el usuario ethanwtodd en Hugging Face bajo licencia Apache 2.0. El modelo base tiene 35.505.251.456 parámetros totales (aproximadamente 35,5 mil millones) y emplea un esquema de expertos enrutados con 256 expertos por capa, de los cuales se activan 8 por token.

La particularidad de esta cuantización es la asignación selectiva de precisión: los expertos enrutados (que representan el 92% de los pesos pero solo se leen parcialmente en cada token) se cuantizan a Q4_K, mientras que las matrices densas (proyecciones de atención, DeltaNet, expertos compartidos, embeddings) se mantienen en Q8_0, y la cabeza de salida en Q6_K. El resultado es un archivo de 21,17 GB que, según el autor, preserva mejor la distribución de probabilidad del modelo original que la cuantización Q4_K_M oficial de InternScience.

El modelo conserva el bloque MTP/NextN (capa 40) para decodificación especulativa, la plantilla de chat propia de Sage con su interruptor `verification`, y es compatible con llama.cpp como GGUF estándar de tipo `qwen35moe`. Está pensado para despliegue en hardware de consumo y en motores de inferencia especializados como eklow, orientado a una Intel Arc A770M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con DeltaNet y atención (tipo `qwen35moe`), con bloque MTP/NextN |
| Parametros totales | 35.505.251.456 (aprox. 35,5B) |
| Parametros activos | 8 de 256 expertos por capa (no se especifica el total activo exacto) |
| Longitud de contexto | no disponible (el autor evalúa fidelidad a 4.096 y 32.768 tokens, pero no declara el máximo) |
| Tipos de cuantizacion | Mixta: Q4_K (expertos enrutados), Q8_0 (matrices densas), Q6_K (cabeza de salida), F32 (normas, router, `ssm_a`, `ssm_dt`, `ssm_conv1d`, gate del experto compartido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (21,17 GB) |

## Arquitectura y entrenamiento

El modelo base Sage-A1.5 es un fine-tune de Qwen3.6-35B-A3B, por lo que hereda una arquitectura MoE con 256 expertos enrutados por capa y 8 activos por token, combinada con capas DeltaNet (atención lineal con estado SSM) y proyecciones de atención convencionales. Incluye expertos compartidos y un bloque MTP (Multi-Token Prediction) o NextN en la capa 40, que permite decodificación especulativa. La torre de visión es la de Qwen3.6, disponible por separado en `Sage-A1.5-mmproj.gguf`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La cuantización se generó a partir del Q8_0 oficial de InternScience (revisión `1cbe2925`) usando llama.cpp en el commit `ea0c4c2c`, con una matriz de importancia de mradermacher. Solo se recuantizaron los expertos y la cabeza; los otros 629 tensores son idénticos byte a byte al Q8_0 de origen. La innovación técnica destacable es la asignación de bits según el patrón de acceso: los expertos reciben Q4_K (4,5 bits con escalas y mínimos por sub-bloque) porque solo se leen 8 de 256 por capa, mientras que las matrices densas, atravesadas por todos los tokens, se mantienen en Q8_0.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con plantilla de chat propia de Sage.
- Capacidades multimodales (visión) mediante el proyector `Sage-A1.5-mmproj.gguf`.
- Modo de verificación: la plantilla de chat incluye un interruptor `verification` que añade "Verification protocol: enabled" al mensaje de sistema.
- Decodificación especulativa mediante el bloque MTP/NextN integrado (soportado en llama.cpp con `--spec-type draft-mtp`).
- Compatibilidad con decodificación especulativa externa (por ejemplo, el draft DFlash2 de incoai).
- No se documentan explícitamente soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: el archivo de 21,17 GB permite ejecutar un MoE de 35,5B en GPUs con 24 GB de VRAM (RTX 3090/4090) o en una Intel Arc A770M de 16 GB con motores que descargan parcialmente, gracias a que solo se leen 8 expertos por capa.
- Servicio de chat conversacional: la plantilla de Sage y los parámetros de muestreo embebidos (temperatura 1.0, top-p 0.95, top-k 20, presence penalty 1.5) permiten levantar un endpoint compatible sin configuración adicional.
- Inferencia acelerada con decodificación especulativa: usando el bloque MTP incluido o el draft DFlash2 de incoai, se alcanzan entre 2,6 y 4,7 tokens verificados por paso según el benchmark del autor, lo que reduce la latencia en generación de código y matemáticas.
- Análisis de documentos largos: la fidelidad medida a 32.768 tokens de contexto (KL medio de 0,0524) indica que la cuantización es apta para tareas de contexto extendido donde otras cuantizaciones Q4 degradan más.
- Investigación sobre cuantización selectiva: el archivo sirve como referencia reproducible para estudiar el impacto de asignar precisión según el patrón de acceso (expertos vs. densas) en modelos MoE.
- Prototipado en entornos con recursos limitados: al ser un GGUF estándar cargable por llama.cpp, se puede integrar en pipelines locales de generación de texto sin infraestructura de servidor dedicada.
- Tareas multimodales ligeras: combinado con el proyector mmproj, permite descripción de imágenes y preguntas visuales en el mismo entorno de inferencia.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad (divergencia KL frente al Q8_0 de origen) y de decodificación especulativa, no benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K) en sentido estricto.

Fidelidad de la cuantización (KL de la distribución del siguiente token, llama.cpp `ea0c4c2c`):

| Archivo | Tamano | KL medio 4k / 32k | Percentil 99 KL 4k / 32k | Mismo token top 4k / 32k |
|---|---|---|---|---|
| Este archivo | 21,2 GB | 0,0127 / 0,0524 | 0,119 / 0,652 | 95,5% / 94,4% |
| InternScience Q4_K_M | 21,7 GB | 0,0442 / 0,1169 | 0,365 / 2,498 | 91,4% / 90,1% |

Tokens por verificación en decodificación especulativa (llama.cpp 0.8.0-dev, CUDA, temperatura 1.0, top-p 0.95, top-k 20, thinking activado, 16 peticiones por dataset):

| Draft | GSM8K | HumanEval | MT-Bench |
|---|---|---|---|
| incoai/Qwen3.6-35B-A3B-DFlash2, bloques de 4 | 3,29 | 2,93 | 3,06 |
| Capa MTP propia de Sage, 3 draft | 2,83 | 2,63 | 2,74 |
| Draft DFlash 2, bloques de 8 | 4,73 | 4,05 | 4,49 |
| Capa MTP propia de Sage, 7 draft | 3,75 | 3,18 | 3,44 |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 21,17 GB; con overhead de contexto y caché KV, se recomienda al menos 24 GB para carga completa en GPU.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para carga completa; Intel Arc A770M (16 GB) con el motor eklow, que gestiona los expertos Q4_K con rendimiento comparable a Q4_0.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con contexto moderado; en GPUs de 16 GB requiere descarga parcial de capas o motores especializados.
- Opciones de despliegue: llama.cpp (soporte nativo como `qwen35moe`), eklow (motor del autor para Intel Arc A770M), y cualquier runtime compatible con GGUF. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo ratios de aceptación en decodificación especulativa (2,6 a 4,7 tokens por verificación).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Sage-A1.5 Q4_K-Q8_0 (este) | 35,5B (MoE) | no disponible | GGUF, 21,2 GB | Apache 2.0 | KL 0,0127 a 4k; MTP incluido |
| InternScience/Sage-A1.5-Q4_K_M-GGUF | 35,5B (MoE) | no disponible | GGUF, 21,7 GB | Apache 2.0 | KL 0,0442 a 4k; cuantización oficial |
| InternScience/Sage-A1.5 (BF16) | 35,5B (MoE) | no disponible | safetensors | Apache 2.0 | Modelo de referencia sin cuantizar |

No se dispone de datos de benchmarks de calidad para comparar con alternativas de otros autores (por ejemplo, otros fine-tunes de Qwen3.6-35B-A3B); la comparación se limita a fidelidad de cuantización y tamaño.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para este modelo ni para su base; se desconoce su comportamiento en dominios sensibles.
- La cobertura de idiomas no está documentada; no se puede garantizar un rendimiento adecuado fuera del inglés sin validación previa.
- La longitud máxima de contexto no se declara; las pruebas de fidelidad solo cubren hasta 32.768 tokens.
- El uso comercial está permitido por la licencia Apache 2.0, pero conviene verificar las condiciones del modelo base InternScience/Sage-A1.5 y de Qwen3.6-35B-A3B.
- El bloque MTP solo aporta ventaja en motores que lo soportan (llama.cpp con `--spec-type draft-mtp`); otros runtimes lo ignoran.
- El draft DFlash2 de incoai, aunque acepta más tokens que el MTP propio, fue entrenado sobre Qwen3.6 estándar y no sobre Sage, lo que puede introducir desviaciones en dominios específicos del fine-tune.
- La decodificación especulativa con 7 tokens draft aumenta la aceptación pero también el coste de verificación; el equilibrio depende del hardware.
- El archivo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- [ethanwtodd/Sage-A1.5-Q4_K-Q8_0-GGUF](https://huggingface.co/ethanwtodd/Sage-A1.5-Q4_K-Q8_0-GGUF)
- [InternScience/Sage-A1.5](https://huggingface.co/InternScience/Sage-A1.5)
- [InternScience/Sage-A1.5-Q4_K_M-GGUF](https://huggingface.co/InternScience/Sage-A1.5-Q4_K_M-GGUF)
- [InternScience/Sage-A1.5-Q8_0-GGUF](https://huggingface.co/InternScience/Sage-A1.5-Q8_0-GGUF)
- [mradermacher/Sage-A1.5-i1-GGUF](https://huggingface.co/mradermacher/Sage-A1.5-i1-GGUF)
- [incoai/Qwen3.6-35B-A3B-DFlash2](https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2)
- [ethanwtodd/Qwen3.6-35B-A3B-Q4_K-Q8_0-GGUF](https://huggingface.co/ethanwtodd/Qwen3.6-35B-A3B-Q4_K-Q8_0-GGUF)
- [ethanwtodd/Ornith-1.5-35B-A3B-Q4_K-Q8_0-GGUF](https://huggingface.co/ethanwtodd/Ornith-1.5-35B-A3B-Q4_K-Q8_0-GGUF)
- [eklow (motor de inferencia)](https://github.com/ewtodd/eklow)
