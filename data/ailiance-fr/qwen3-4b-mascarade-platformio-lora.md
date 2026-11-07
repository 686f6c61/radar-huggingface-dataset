# Ailiance-fr/qwen3-4b-mascarade-platformio-lora

## Resumen

`Ailiance-fr/qwen3-4b-mascarade-platformio-lora` es un adaptador LoRA de ajuste fino supervisado (SFT) construido sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` de Alibaba Qwen. Lo desarrolla Ailiance-fr, un proyecto francés centrado en asistentes especializados para dominios de hardware y electrónica embebida, con especial énfasis en PlatformIO, KiCad y flujos de trabajo de ingeniería. El adaptador se ha entrenado con TRL y pertenece a la familia "mascarade" de adaptadores, que comparten un mismo modelo base y una configuración común de LoRA con rango r=16 y alpha=32.

El objetivo del modelo es especializar un LLM de 4.000 millones de parámetros en tareas de generación de código y configuración para PlatformIO (entornos de compilación embebida, ficheros `platformio.ini`, cadenas de herramientas y flujos de compilación), reduciendo la necesidad de prompts extensos o de conocimiento previo del dominio. El tamaño compacto del modelo base lo hace apto para despliegue en hardware modesto, y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual radica en la tendencia a construir adaptadores ligeros y especializados sobre modelos fundacionales pequeños, en lugar de recurrir a modelos gigantes para tareas de nicho. Sin embargo, conviene señalar que los resultados de validación funcional publicados por el propio autor en la fase 8 de `iact-bench` muestran una tasa de éxito del 0,0 % en 10 muestras evaluadas con el validador de PlatformIO, lo que indica que el adaptador no supera aún las pruebas de compilación en sandbox y debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | Aproximadamente 4.000 millones (modelo base); el adaptador entrena 1.025,795 M (2,960 % del total según la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); requiere el modelo base en transformers |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. El ajuste fino se realizó mediante SFT con TRL 1.4.0, Transformers 5.8.0, PyTorch 2.11.0, Datasets 4.8.5 y Tokenizers 0.22.2. Según la model card, el entrenamiento se ejecutó con el entrenador LoRA de `mlx-lm` y completó 500 iteraciones, con una pérdida final de entrenamiento de 0,114 y una pérdida de validación final de 0,092 (reducción de 1,768 respecto al valor inicial de 1,860). La validación se midió cada 200 iteraciones sobre un split reservado del corpus de entrenamiento con `val_batches=5`.

El adaptador entrena 1.025,795 millones de parámetros, lo que representa el 2,960 % del total del modelo. La familia "mascarade" comparte configuración LoRA con r=16 y alpha=32, según la página de Ailiance. No se detalla en la información disponible la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si hubo etapas de RLHF o DPO posteriores al SFT. El corpus de evaluación asociado se denomina `Ailiance-fr/mascarade-platformio-dataset`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3-4B-Instruct-2507.
- Generación de código y configuración específicos para PlatformIO: ficheros `platformio.ini`, entornos de compilación, dependencias de librerías y cadenas de herramientas embebidas.
- Soporte de conversación multi-turno mediante el formato de chat de Qwen (roles `user`/`assistant`), tal como muestra el ejemplo de `pipeline` de la model card.
- Capacidad de ejecución con `transformers` y `pipeline` en GPU (`device="cuda"`).
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada; se heredan las del modelo base, pero no se documentan para el adaptador.
- Tool calling / function calling: no documentado para el adaptador.
- Modo thinking, visión o audio: no documentado para el adaptador.

## Casos de uso

- Generación de ficheros `platformio.ini`: el adaptador puede producir configuraciones de entorno para placas ESP32, STM32 o Arduino, incluyendo `platform`, `board`, `framework` y `lib_deps`, lo que acelera la puesta en marcha de proyectos embebidos.
- Asistencia en la resolución de errores de compilación de PlatformIO: dado un mensaje de error de `arm-none-eabi-gcc` o `arduino-cli`, el modelo puede proponer correcciones en la configuración del proyecto o en el código fuente.
- Generación de esqueletos de proyectos embebidos: creación de estructuras `src/`, `lib/` y `include/` con código de inicialización para periféricos comunes.
- Documentación técnica de proyectos de electrónica: redacción de READMEs y guías de compilación para repositorios de firmware, aprovechando el conocimiento del dominio inyectado por el LoRA.
- Integración en asistentes de IDE o CLI: el adaptador puede servirse detrás de una API compatible con OpenAI (la model card indica `endpoints_compatible`) para autocompletar configuraciones de PlatformIO en editores.
- Prototipado rápido de flujos de compilación cruzada: el modelo puede sugerir cadenas de herramientas y flags de compilación para arquitecturas embebidas concretas, reduciendo el tiempo de configuración inicial.
- Filtrado y clasificación de configuraciones: dado un conjunto de ficheros de proyecto, el modelo puede identificar configuraciones inválidas o inconsistentes antes de lanzar la compilación.

## Benchmarks y rendimiento

Resultados del adaptador en la fase 8 de `iact-bench` (validadores Docker, 2026-05-11), con 10 muestras extraídas con semilla 101 del dataset `Ailiance-fr/mascarade-platformio-dataset`:

| Metrica | Valor |
|---|---|
| Validador | `ghcr.io/electron-rare/iact-bench-platformio:latest` |
| Limite tmpfs | `1g` |
| Muestras | 10 |
| Tasa de exito (pass rate) | 0,0 |
| Tiempo total de validacion | 0,0 s |

El autor indica que el adaptador aún no ha sido evaluado con el pipeline `electron-bench`, cuyo soporte para la base Qwen3 está en la hoja de ruta. Como referencia, se incluyen a continuación las puntuaciones oficiales del modelo base sin modificar, publicadas por el equipo de Qwen:

| Categoria | Benchmark | Qwen3-4B-Instruct-2507 |
|---|---|---|
| Conocimiento | MMLU-Pro | 69,6 |
| Conocimiento | MMLU-Redux | 84,2 |
| Conocimiento | GPQA | 62,0 |
| Conocimiento | SuperGPQA | 42,8 |
| Razonamiento | AIME25 | 47,4 |
| Razonamiento | HMMT25 | 31,0 |
| Razonamiento | ZebraLogic | 80,2 |
| Razonamiento | LiveBench 2024-11-25 | 63,0 |
| Codigo | LiveCodeBench v6 | 35,1 |
| Codigo | MultiPL-E | 76,8 |
| Codigo | Aider-Polyglot | 12,9 |
| Alineacion | IFEval | 83,4 |
| Alineacion | Arena-Hard v2 | 43,4 |
| Alineacion | Creative Writing v3 | 83,5 |
| Alineacion | WritingBench | 83,4 |
| Agentes | BFCL-v3 | 61,9 |
| Agentes | TAU1-Retail | 48,7 |
| Agentes | TAU1-Airline | 32,0 |
| Agentes | TAU2-Retail | 40,4 |
| Multilingue | MultiIF | 69,0 |
| Multilingue | MMLU-ProX | 61,6 |
| Multilingue | INCLUDE | 60,1 |
| Multilingue | PolyMATH | 31,1 |

No se han publicado resultados de benchmarks del adaptador frente a otros adaptadores de la misma familia en la información disponible, salvo la matriz de referencia de los adaptadores Gemma del mismo autor (que no son directamente comparables por usar otra base).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4.000 millones de parámetros requiere aproximadamente 8 GB en FP16 y alrededor de 3-4 GB en cuantización de 4 bits (estimación estándar para modelos de este tamaño; no confirmada en la información proporcionada).
- GPU recomendadas: A100, H100, L40S o RTX 4090 para FP16; RTX 3060/4060 o superiores para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 de 12 GB o superiores en FP16, y en GPUs de 6-8 GB con cuantización.
- Opciones de despliegue: `transformers` con `pipeline` (documentado en la model card); compatible con endpoints según la etiqueta `endpoints_compatible`. Para vLLM, llama.cpp, Ollama o TGI no se documenta soporte explícito del adaptador en la información disponible; requeriría fusión del LoRA con el modelo base o carga de adaptadores PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| `Ailiance-fr/qwen3-4b-mascarade-platformio-lora` | ~4.000 M (LoRA sobre Qwen3-4B) | No disponible | Apache 2.0 | PlatformIO / electronica embebida | Hugging Face, 0 descargas |
| `Qwen/Qwen3-4B-Instruct-2507` | ~4.000 M | No disponible en la informacion | Apache 2.0 | Proposito general | Hugging Face, ampliamente usado |
| `Ailiance-fr/gemma-4-E4B-mascarade-lora` | No disponible | No disponible | Apache 2.0 (presumible) | Extraccion de dominio electronico | Hugging Face |
| `Ailiance-fr/gemma-4-E4B-eukiki-lora` | No disponible | No disponible | Apache 2.0 (presumible) | DSL P1, PCB, SPICE | Hugging Face |

La comparación directa con alternativas de la misma categoría (adaptadores LoRA para PlatformIO sobre modelos de ~4B) no está disponible en la información proporcionada. Los adaptadores Gemma del mismo autor pertenecen a la misma familia de especialización (electrónica embebida) pero usan una base distinta, por lo que no son estrictamente comparables.

## Limitaciones y advertencias

- Tasa de éxito del 0,0 % en el benchmark funcional `iact-bench` fase 8 con 10 muestras: el adaptador no supera las pruebas de compilación en sandbox en su estado actual, lo que lo hace no apto para producción sin validación adicional.
- El adaptador no ha sido evaluado con el pipeline `electron-bench`; el soporte para la base Qwen3 está pendiente según el propio autor.
- Sesgos conocidos: no documentados específicamente para el adaptador; hereda los del modelo base Qwen3-4B-Instruct-2507.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 4B especializado, puede generar configuraciones de PlatformIO sintácticamente plausibles pero incorrectas.
- Limitaciones de contexto e idioma: no documentadas para el adaptador; se desconocen los idiomas soportados más allá de los heredados del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tamaño del repositorio (0,3 GB) corresponde únicamente al adaptador LoRA; es necesario descargar el modelo base por separado.
- La model card mezcla referencias a adaptadores Gemma y a resultados de fases distintas del benchmark, lo que dificulta la trazabilidad de las métricas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ailiance-fr/qwen3-4b-mascarade-platformio-lora)
- [Modelo base Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- [Repositorio TRL](https://github.com/huggingface/trl)
- [Benchmark electron-bench / ailiance-bench](https://github.com/ailiance/ailiance-bench/blob/main)
- [Issues de ailiance-bench](https://github.com/ailiance/ailiance-bench/issues)
- [Matriz comparativa base vs LoRA](https://github.com/ailiance/ailiance-bench/blob/main/bench-results/compare_base_vs_lora.md)
- [Adaptador Gemma 4 E4B eukiki](https://huggingface.co/Ailiance-fr/gemma-4-E4B-eukiki-lora)
- [Adaptador Gemma 4 E4B mascarade](https://huggingface.co/Ailiance-fr/gemma-4-E4B-mascarade-lora)
- [iact-bench](https://github.com/electron-rare/iact-bench)
- [Pagina de Ailiance mascarade](https://www.ailiance.fr/models/ailiance/mascarade)
