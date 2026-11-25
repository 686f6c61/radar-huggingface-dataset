# hif1000/Qwen3.6-35B-A3B-SQ4-GGUF

## Resumen

Qwen3.6-35B-A3B-SQ4-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.6-35B-A3B, publicada por el usuario hif1000. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer causal con mezcla de expertos (MoE) de 35 mil millones de parametros totales y 3 mil millones activos por token, disenado especificamente para tareas de codigo agentico y razonamiento a nivel de repositorio. Esta version SQ4 aplica la tecnica de cuantizacion Shifter, descrita en el paper arXiv:2611.33080, que busca representaciones compactas para computacion nativa en enteros.

La relevancia de esta ficha radica en que empaqueta un modelo de gran capacidad en un unico archivo GGUF de aproximadamente 22,8 GB, lo que reduce drasticamente los requisitos de almacenamiento frente a los pesos originales en safetensors. El modelo base incorpora una arquitectura hibrida con capas Gated DeltaNet (atencion lineal) y Gated Attention, ademas de un encoder de vision, lo que lo situa en la categoria de modelos multimodales con contexto nativo de 262.144 tokens, extensible hasta 1.010.000.

El checkpoint Shifter se distribuye bajo licencia Apache 2.0, igual que el modelo original, lo que permite uso comercial sin restricciones adicionales. Sin embargo, el runtime necesario para ejecutar esta cuantizacion no es llama.cpp ni Ollama, sino Shifter, una herramienta especifica que requiere Linux y CUDA, lo que limita su adopcion a entornos con GPU NVIDIA y complica su integracion en pilas de despliegue estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con MoE, Gated DeltaNet y Gated Attention, mas encoder de vision |
| Parametros totales | 35B |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 |
| Tipos de cuantizacion | SQ4 (Shifter Quantization, 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo `Qwen3.6-35B-A3B-SQ4.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura causal con encoder de vision y un diseno hibrido de atencion. La capa oculta tiene 2.048 dimensiones, 40 capas y un layout de 10 bloques compuestos por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, cada una acompanada de su correspondiente capa MoE. La Gated DeltaNet usa 32 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128, mientras que la Gated Attention emplea 16 cabezas para Q y 2 para KV con dimension 256 y RoPE de 64 dimensiones. El MoE cuenta con 256 expertos, de los que se activan 8 enrutados mas 1 compartido, con dimension intermedia de 512. El embedding y la salida LM tienen 248.320 entradas (con padding). El modelo fue entrenado con multi-step MTP (multi-token prediction).

El entrenamiento combina fases de pre-entrenamiento y post-entrenamiento, aunque la model card no detalla el numero exacto de tokens ni la composicion del dataset. La model card menciona mejoras en codificacion agentica y una nueva opcion de "Thinking Preservation" que retiene el contexto de razonamiento de mensajes historicos para reducir la sobrecarga en desarrollo iterativo. La cuantizacion SQ4 aplicada por hif1000 transforma los pesos a enteros de 4 bits mediante el metodo Shifter, cuyo paper describe representaciones compactas para computacion nativa en enteros, aunque no se especifican en la informacion disponible los detalles exactos del algoritmo de cuantizacion ni las metricas de degradacion.

## Capacidades

- Generacion de texto y razonamiento general con modo de pensamiento (thinking mode) preservable entre turnos.
- Codificacion agentica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio.
- Vision: el modelo base incluye un encoder de vision, por lo que puede procesar imagenes ademas de texto.
- Soporte de tool calling y function calling, segun las capacidades declaradas del modelo base Qwen3.6.
- Razonamiento multi-paso y uso en agentes, con enfasis en tareas de codigo que requieren multiples iteraciones.
- Capacidades multilingues: la model card incluye un benchmark SWE-bench Multilingual, lo que indica soporte para varios lenguajes de programacion y posiblemente idiomas naturales, aunque no se detalla la lista.
- Contexto largo de hasta 262.144 tokens nativos, adecuado para repositorios completos o documentos extensos.
- Prediccion multi-token (MTP) entrenada con multiples pasos, lo que puede acelerar la decodificacion especulativa.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo el hilo de la conversacion y recuperando informacion de interacciones previas sin truncar.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para generar parches, revisar pull requests o completar tareas de refactorizacion a nivel de repositorio, aprovechando su entrenamiento en codificacion agentica.
- Agentes autonomos de resolucion de incidencias: con SWE-bench Verified en 73,4, el modelo es adecuado para agentes que reciben un issue, exploran el repositorio y proponen una solucion verificable, reduciendo la intervencion manual.
- Asistente de desarrollo con vision: al incluir encoder de vision, puede analizar capturas de pantalla de interfaces, diagramas de arquitectura o errores visuales y sugerir correcciones de codigo frontend.
- Analisis de documentacion tecnica extensa: con contexto de hasta 1.010.000 tokens en modo extensible, puede procesar manuales, especificaciones o bases de codigo completas para responder preguntas o generar resumenes.
- Despliegue en estaciones de trabajo con GPU unica: al ocupar aproximadamente 22,8 GB en formato SQ4, puede ejecutarse en una GPU consumer de gama alta o en una estacion con CUDA, sirviendo como asistente local de codigo sin depender de la nube.
- Prototipado rapido de agentes de razonamiento: la opcion de Thinking Preservation permite mantener el contexto de razonamiento entre iteraciones, lo que facilita el desarrollo de agentes que refinan soluciones paso a paso.

## Benchmarks y rendimiento

Los datos disponibles en la model card corresponden al modelo base Qwen3.6-35B-A3B, no a esta cuantizacion SQ4. No se han publicado resultados de benchmarks especificos para la version cuantizada en la informacion disponible.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo incluye de forma completa la fila de SWE-bench Verified; el resto de filas del benchmark aparecen truncadas en la informacion proporcionada. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 22,8 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos en GPU, mas overhead de contexto y activaciones. Con contexto largo, la VRAM adicional puede ser significativa.
- GPU recomendadas: el runtime Shifter requiere Linux con CUDA. Una NVIDIA A100 (40 GB o 80 GB) o H100 son adecuadas para contexto completo. Una RTX 4090 (24 GB) podria cargar los pesos pero con margen muy ajustado para contexto extendido.
- Cabe en GPU consumer: si, en tarjetas con 24 GB o mas de VRAM (RTX 4090, RTX 3090), aunque el contexto util se vera limitado por la memoria restante.
- Opciones de despliegue: Shifter es el runtime oficial para esta cuantizacion, instalable desde el repositorio de GitHub mediante `pip install .` y ejecutable con `shifter serve -m hif1000/Qwen3.6-35B-A3B-SQ4-GGUF`. No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI para este archivo GGUF concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-SQ4 (esta ficha) | 35B totales / 3B activos | 262.144 nativo | no disponible (base: 73,4) | Apache 2.0 | GGUF SQ4 |
| Qwen3.5-35BA3B | 35B totales / 3B activos | no disponible | 70,0 | no disponible | safetensors |
| Qwen3.5-27B | 27B | no disponible | 75,0 | no disponible | safetensors |
| Gemma4-31B | 31B | no disponible | 52,0 | no disponible | safetensors |

La comparativa se limita a los datos de la model card del modelo base. No se dispone de informacion sobre contexto, licencia o formato de los modelos alternativos en el material consultado.

## Limitaciones y advertencias

- La cuantizacion SQ4 puede degradar la calidad respecto al modelo base en tareas sensibles a la precision numerica, aunque no se han publicado metricas de degradacion en la informacion disponible.
- El runtime Shifter es un requisito obligatorio y solo funciona en Linux con CUDA, lo que excluye macOS, Windows nativo y entornos sin GPU NVIDIA.
- No hay soporte declarado para llama.cpp, Ollama, vLLM ni otros motores de inferencia habituales, lo que limita la portabilidad y la integracion en infraestructuras existentes.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo donde puede generar APIs o funciones inexistentes.
- Sesgos conocidos: no se documentan en la informacion proporcionada, pero al ser un modelo entrenado con datos web es probable que herede sesgos de esos corpus.
- Idiomas soportados: no disponibles; aunque el benchmark SWE-bench Multilingual sugiere capacidades multilingues en codigo, no se detalla la cobertura de idiomas naturales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6 puede tener terminos adicionales no reflejados en esta ficha; se recomienda revisar la licencia del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que la cuantizacion es muy reciente y carece de validacion comunitaria.
- El contexto extensible hasta 1.010.000 tokens puede requerir tecnicas adicionales no documentadas y un consumo de memoria muy elevado.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/hif1000/Qwen3.6-35B-A3B-SQ4-GGUF
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper de Shifter Quantization: https://arxiv.org/abs/2611.33080
- Repositorio de Shifter en GitHub: https://github.com/yufenghuang/shifter
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Revision del README del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/345d467b117d1fd5eda9b879a5988de9ae5f47a7/README.md
