# bidubr/repente-v0.5-GGUF

## Resumen

Repente v0.5 es un modelo de lenguaje especializado en la generación de código para programación musical: escribe parches de Pure Data y código de SuperCollider a partir de descripciones en lenguaje natural de un sonido o una síntesis. Ha sido desarrollado por Carlos Eduardo Coelho Freire Batista (usuario HuggingFace `bidubr`) como parte de una investigación publicada en arXiv, y se distribuye como un ajuste fino del modelo base Qwen2.5-Coder-7B-Instruct mediante QLoRA, exportado a formato GGUF con cuantización Q4_K_M para ejecución local.

El modelo tiene 7,6 mil millones de parámetros y una ventana de contexto recomendada de 4.096 tokens. Su relevancia actual reside en que cubre un nicho muy específico —la programación de música por computadora en entornos de audio en tiempo real— que los modelos generalistas de código abordan de forma deficiente: el propio modelo base sin ajustar obtiene una puntuación esperada de 0,03 sobre 5 en la batería de evaluación del autor, frente a 2,67 de Repente v0.5.

Conviene señalar que esta versión v0.5 se publica como referencia congelada para reproducibilidad de los experimentos del paper. El autor recomienda explícitamente usar la versión v0.7, que es mediblemente más fuerte (3,83 sobre 5), y documenta que la selección de v0.5 fue un "sorteo afortunado" con una probabilidad de ocurrencia del 1,5%. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Coder-7B-Instruct) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración recomendada; el base soporta 32k) |
| Tipos de cuantización | Q4_K_M (única variante publicada en este repositorio) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) de Qwen2.5-Coder-7B-Instruct mediante QLoRA, una técnica de adaptación de bajo rango cuantizada que reduce el coste de entrenamiento manteniendo la mayor parte del rendimiento del modelo base. El entrenamiento se realizó sobre un corpus de parches de Pure y código de SuperCollider, con un proceso de ponderación del corpus en cinco ciclos. Uno de esos ciclos ponderó explícitamente la librería ELSE, sin éxito apreciable en la generación de sus objetos.

Una característica técnica destacable es el proceso de auto-destilación iterativa: cada versión del modelo se entrena con las salidas de la versión anterior. Este proceso produce un efecto colateral documentado: las respuestas de análisis del modelo se comprimen de 776 tokens (en el modelo base sin ajustar) a 151 tokens, un artefacto de la auto-destilación que el autor documenta pero no corrige.

El ajuste se exportó a GGUF con cuantización Q4_K_M, lo que permite ejecutarlo en hardware de consumo con Ollama o llama.cpp. La arquitectura de conocimiento específica del dominio se describe como "SonicUnit Knowledge Architecture" en el paper asociado.

## Capacidades

- Generación de parches de Pure Data: a partir de una descripción textual de un sonido, produce un patch válido con cabecera de canvas, objetos de salida y conexiones.
- Generación de código de SuperCollider: produce código ejecutable para síntesis sonora.
- Generación de texto conversacional: el modelo responde en formato de chat con el sistema prompt "You are Repente, a musical programming expert".
- Mejora de formato con pocos ejemplos: la validez del formato sube del 75% al 100% al incluir tres ejemplos resueltos y una instrucción de cadena de pensamiento corta.
- Ejecución local: al estar en formato GGUF, se puede desplegar en máquinas sin GPU dedicada mediante llama.cpp o Ollama.
- Compatibilidad con herramientas de desarrollo: existe un fork de PlugData (pd-repente) que integra una barra de prompt en la ventana de edición de parches.
- No se documenta soporte de tool calling, función calling ni modo de razonamiento extendido.

## Casos de uso

- **Prototipado rápido de síntesis sonora**: un artista sonoro describe un sonido ("una onda senoidal a 440 Hz conectada a la salida") y el modelo genera el patch de Pure Data o el código de SuperCollider correspondiente, listo para cargar en el entorno de audio.
- **Educación musical asistida**: estudiantes de música por computadora pueden usar el modelo como tutor que traduce descripciones en lenguaje natural a código de Pure Data o SuperCollider, facilitando la curva de aprendizaje de la sintaxis.
- **Integración con entornos de desarrollo musical**: mediante el fork pd-replug de Plugins, el modelo se integra en la ventana de edición de parches como una barra de prompt, permitiendo generar código sin salir del entorno.
- **Composición algorítmica**: el modelo puede generar variaciones de parches a partir de descripciones de texturas sonoras, sirviendo como herramienta de exploración creativa en tiempo real.
- **Documentación y análisis de parches**: aunque con respuestas más cortas que el modelo base, puede producir descripciones de parches existentes, útil para documentar proyectos de música por computadora.
- **Educación en programación musical**: como recurso didáctico, el modelo puede explicar cómo construir un parche que produzca un efecto concreto, mostrando el código resultante.
- **Despliegue en entornos sin GPU**: al pesar 4,5 GB en disco y caber en 8 GB de VRAM, puede ejecutarse en portátiles de consumo, facilitando su uso en talleres o aulas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo. El autor reporta una evaluación propia basada en una batería de cinco prompts, puntuando la validez estructural de los parches generados (presencia de cabecera de canvas, objeto de salida y conexiones). Los datos son los siguientes:

| Modelo | Puntuación esperada (sobre 5) | Intervalo 95% |
|---|---|---|
| Qwen2.5-Coder-7B-Instruct (sin ajustar) | 0,03 | [0,00, 0,10] |
| **Repente v0.5** | **2,67** | **[2,37, 2,97]** |
| Repente v0.7 | 3,83 | [3,53, 4,13] |

Además, el autor reporta que la combinación de tres ejemplos resueltos y una instrucción de cadena de pensamiento breve eleva la validez de formato del 75% al 100% en cuatro niveles de dificultad de prompt, sin coste computacional adicional. La medición se realizó sobre pesos congelados.

## Requisitos de hardware

- **VRAM estimada**: 8 GB de VRAM para inferencia con contexto de 4096 tokens y cuantización Q4_K_M.
- **Espacio en disco**: 4,5 GB para el archivo GGUF.
- **GPU recomendadas**: tarjetas de consumo con al menos 8 GB de VRAM, como RTX 3070, RTX 4070 o superiores. También compatible con Apple Silicon con al menos 8 GB de memoria unificada.
- **Cabe en GPU de consumo**: sí, con la cuantización Q4_K_M.
- **Opciones de despliegue**: Ollama (comando `ollama run hf.co/bidubr/repente-v0.5-GGUF:Q4_K_M`), llama.cpp (`llama-server -m repente-v0.5-Q4_K_M.gguf -ngl 99 -c 4096`), o cualquier servidor compatible con GGUF (llama-cpp-python, llama.cpp server).
- **Latencia y throughput**: no se han publicado datos específicos de latencia ni throughput para este modelo.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo proyecto, dado que no se han identificado otros modelos especializados en programación musical en el momento de la consulta.

| Modelo | Parámetros | Contexto | Puntuación esperada (sobre 5) | Licencia |
|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | 32k (base) | 0,03 | Apache 2.0 |
| **Repente v0.5** | **7,6B** | **4096 (recomendado)** | **2,67** | **Apache 2.0** |
| Repente v0.7 | 7,6B | 4096 (recomendado) | 3,83 | Apache 2.0 |

La versión v0.7 es la recomendada por el autor para uso práctico; v0.5 queda como referencia congelada para reproducibilidad de los experimentos del paper.

## Limitaciones y advertencias

- **Objetos ELSE no generados**: en 1.350 generaciones medidas, un objeto de la biblioteca ELSE aparece una sola vez. Cinco ciclos de ponderación del corpus, incluido uno que ponderaba ELSE explícitamente, no cambiaron el resultado. El autor recomienda tratar la cobertura de librerías como un problema de recuperación en tiempo de inferencia, no algo que los pesos puedan resolver.
- **Respuestas de análisis cortas**: el modelo produce análisis que promedian 151 tokens frente a los 776 del modelo base. Es un artefacto de la auto-destilación y está documentado, no corregido.
- **Validez de parche no es calidad**: las mediciones puntúan como válido un parche con cabecera de canvas, objeto de salida y conexiones. Eso es necesario para que el parche suene, pero no suficiente para que suene como se pidió.
- **Versión no recomendada**: el autor recomienda explícitamente usar v0.7 en lugar de esta v0.5. La selección de v0.5 fue un "sorteo afortunado" con probabilidad del 1,5%.
- **Contexto limitado**: la configuración recomendada usa 4096 tokens de contexto; el modelo base soporta 32k, pero el GGUF se ha validado con la configuración corta.
- **Solo inglés**: el modelo está entrenado y documentado únicamente en inglés.
- **Riesgo de alucinación**: no se documentan medidas específicas; como cualquier modelo de lenguaje, puede producir código sintácticamente válido pero semánticamente incorrecto.

## Enlaces

- **Modelo en HuggingFace**: https://huggingface.co/bidubr/repente-v0.5-GGUF
- **Versión recomendada (v0.7)**: https://huggingface.co/bidubr/repente-v0.7-GGUF
- **Paper (arXiv)**: https://arxiv.org/abs/[ARXIV_ID] (el identificador no está publicado en la información disponible)
- **Código, datos y protocolo de medición**: https://repente.net
- **pd-repente (fork de Plugins)**: https://github.com/dobidu/plugdata
