# hemlang/Schierling-Qwen3.5-9B-LoRA

## Resumen

Schierling-Qwen3.5-9B-LoRA es un adaptador LoRA (PEFT) desarrollado por hemlang que especializa el modelo base Qwen3.5-9B (versión abliterated TIES de nbeerbower) en el lenguaje de programación Hemlock, un lenguaje de sistemas de alto nivel. El adaptador se entrena mediante supervisión fina (SFT) sobre el dataset hemlang/Hemlock-SFT-combined, que incluye documentación, semántica, generación de código verificada por ejecución y traducción desde C/Python. Su objetivo es mejorar la capacidad del modelo para generar, depurar y traducir código Hemlock sin degradar las capacidades generales del modelo base.

El modelo base Qwen3.5-9B es un transformer multimodal de Alibaba con 9 mil millones de parámetros, soporte de contexto de hasta 262 144 tokens y licencia Apache 2.0. El adaptador, de solo 0.3 GB, se fusiona con el base para producir un modelo especializado. Los resultados en hembench muestran una mejora sustancial en tareas de algoritmos (L3) y una reducción de programas que fallan al ejecutarse, con un coste mínimo en capacidades generales (ARC 61.5→62.5, perplexity +1.9%). Es relevante para desarrolladores que trabajen con Hemlock o necesiten un modelo de código especializado con base abierta y ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B) + adaptador LoRA |
| Parametros totales | 9B (modelo base) + adaptador LoRA (tamaño 0.3 GB, número de parámetros no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens (modelo base); entrenamiento del adaptador con max_length 2048 |
| Tipos de cuantizacion | No especificado para el adaptador; el modelo base admite cuantizaciones estándar (GGUF, bitsandbytes, etc.) |
| Idiomas soportados | Inglés (adaptador); el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo Qwen3.5-9B, un transformer denso multimodal (texto, imagen, video) con atención estándar y un cabezal de predicción multi-token (mtp). El adaptador LoRA se entrena con r=32, α=64, dropout 0.05, tasa de aprendizaje 2e-4 con scheduler coseno, 2 épocas, precisión bf16 y longitud máxima de 2048 tokens. El entrenamiento se realizó con la herramienta Merlina en una sola RTX A6000 durante 718 pasos, con pérdida final de 0.090. El dataset de entrenamiento, Hemlock-SFT-combined, está decontaminado contra hembench e incluye documentación, semántica, generación de código verificada por ejecución y traducción C/Python→Hemlock. Una particularidad técnica es que el modelo base contiene 15 tensores `mtp.*` que `peft merge_and_unload()` elimina silenciosamente; para fusionar correctamente el adaptador hay que injertarlos de nuevo desde el checkpoint original.

## Capacidades

- Generación de código en Hemlock: produce programas sintácticamente correctos y ejecutables en el intérprete real.
- Traducción de código C/Python a Hemlock: convierte algoritmos y estructuras de datos existentes al lenguaje Hemlock.
- Depuración asistida: identifica y corrige errores en programas Hemlock, mejorando la tasa de ejecución exitosa.
- Razonamiento algorítmico: resuelve problemas de algoritmos (nivel L3) con alta precisión (7/7 en hembench).
- Conserva las capacidades generales del modelo base: razonamiento, multilingüismo, visión y comprensión de contexto largo (262K tokens).
- Soporte de tool calling y agentes: heredado del modelo base Qwen3.5-9B, aunque no se ha verificado específicamente con el adaptador.
- Capacidad de generación de texto conversacional: el adaptador no altera las habilidades conversacionales del base.

## Casos de uso

- Desarrollo de software en Hemlock: el modelo puede generar módulos completos en Hemlock a partir de especificaciones en lenguaje natural, reduciendo el tiempo de escritura manual y verificando la ejecución.
- Migración de código legacy: traduce funciones y librerías escritas en C o Python a Hemlock, manteniendo la semántica original y comprobando la ejecución con el intérprete.
- Asistente de depuración en entornos de desarrollo: integrado en un IDE o CLI, el modelo sugiere correcciones para programas Hemlock que fallan, basándose en el análisis de errores de ejecución.
- Generación de documentación técnica: a partir de código Hemlock, el modelo produce documentación de API y ejemplos de uso, aprovechando su entrenamiento en documentación y semántica.
- Educación y formación: sirve como tutor para aprender Hemlock, explicando conceptos, generando ejemplos y evaluando soluciones propuestas por estudiantes.
- Automatización de pipelines de CI/CD: el modelo puede generar scripts de compilación y pruebas en Hemlock, integrándose en flujos de integración continua para proyectos que usen este lenguaje.
- Prototipado rápido de algoritmos: dado un problema algorítmico, el modelo produce una implementación en Hemlock lista para ejecutar, útil para investigación y experimentación.

## Benchmarks y rendimiento

Los resultados se midieron en hembench con cada programa generado ejecutado por el intérprete real (Q8_0, greedy). Se comparan con un modelo hermano con SFT Hemlock más ligero (mismo base) y con el adaptador actual.

| Nivel | Tarea | Modelo SFT ligero | Adaptador Schierling |
|---|---|---|---|
| L1 | Sintaxis | 6/9 | 7/9 |
| L2 | Stdlib | 1/5 | 1/5 |
| L3 | Algoritmos | 2/7 | **7/7** |
| L4 | Sistemas | 2/7 | 4/7 |
| L5 | Traducción | 0/5 | 2/5 |
| L6 | Depuración | 2/5 | 2/5 |
| **Ponderado global** | | 28.5% | **57.1%** |
| Programas que fallan al ejecutar | | 21 | **8** |

Además, se reporta que no hay coste medible en capacidades generales: ARC pasa de 61.5 a 62.5 y la perplexidad en Wikipedia aumenta solo un 1.9%. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval para este adaptador específico.

## Requisitos de hardware

- El adaptador en sí es pequeño (0.3 GB), pero requiere el modelo base completo de 9B para funcionar.
- VRAM estimada para inferencia: con cuantización de 4 bits, aproximadamente 6-8 GB; con 8 bits, 10-12 GB; en precisión completa (bf16), unos 18-20 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantización 8-bit o bf16; GPUs con 16 GB (RTX 4080, A5000) para 4-bit; en entornos cloud, A100 o H100 para mayor throughput.
- Es viable en GPUs de consumo (RTX 3060 12GB con 4-bit, RTX 4070/4080 con 8-bit).
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras fusionar el adaptador y gestionar los tensores mtp), Ollama (si se convierte a GGUF), o directamente con Hugging Face Transformers + PEFT.
- Latencia y throughput: no se han publicado datos específicos; para un modelo de 9B en una RTX 4090 con 4-bit, se espera una generación de 20-40 tokens/s en tareas de código.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Schierling-Qwen3.5-9B-LoRA (este) | 9B + LoRA | 262K | Hemlock (código) | Apache 2.0 | Hugging Face |
| Schierling-Qwen3.6-27B-LoRA | 27B + LoRA | 262K (estimado) | Hemlock (código) | Apache 2.0 | Hugging Face |
| Huihui-Qwen3.5-9B-abliterated-TIES (base) | 9B | 262K | General (sin censura) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (original) | 9B | 262K | General multimodal | Apache 2.0 | Hugging Face |

El adaptador de 9B es la versión ligera del de 27B, con menor coste de inferencia y resultados ligeramente inferiores en hembench (57.1% vs. el 27B, que no se detalla aquí). Comparado con el base sin adaptador, mejora significativamente en tareas de código Hemlock sin penalizar las capacidades generales.

## Limitaciones y advertencias

- El adaptador muestra debilidad en el nivel L2 (stdlib): los nombres y firmas de funciones de la librería estándar de Hemlock no se memorizan de forma fiable; se recomienda verificar las llamadas contra la documentación.
- Riesgo de alucinación en APIs y funciones poco comunes, especialmente en traducción de código (L5 solo 2/5).
- El caveat de fusión: al usar `peft merge_and_unload()`, se pierden los tensores `mtp.*` del modelo base, lo que impide cargar el modelo fusionado en llama.cpp a menos que se injerten manualmente.
- El adaptador está entrenado principalmente en inglés; aunque el base es multilingüe, el rendimiento en otros idiomas para tareas de Hemlock no está garantizado.
- No se han evaluado sesgos específicos; al ser un modelo abliterated, puede generar contenido sin censura, lo que requiere moderación en aplicaciones de producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base abliterated puede tener implicaciones legales o éticas según el contexto de uso.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/hemlang/Schierling-Qwen3.5-9B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/hemlang/Hemlock-SFT-combined
- Modelo base: https://huggingface.co/nbeerbower/Huihui-Qwen3.5-9B-abliterated-TIES
- Modelo hermano 27B: https://huggingface.co/nbeerbower/Schierling-Qwen3.6-27B-LoRA
- Repositorio de Hemlock: https://github.com/hemlang/hemlock
- Herramienta de entrenamiento Merlina: https://github.com/Schneewolf-Labs/Merlina
- Modelo Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
