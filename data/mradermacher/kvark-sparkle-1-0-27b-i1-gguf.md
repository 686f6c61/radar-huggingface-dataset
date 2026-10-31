# mradermacher/Kvark-Sparkle-1.0-27B-i1-GGUF

## Resumen

Kvark-Sparkle-1.0-27B es un modelo de lenguaje de 27 mil millones de parámetros desarrollado por Egzakta, orientado a tareas de razonamiento (reasoning) y razonamiento eficiente (efficient-reasoning). La ficha que aquí se presenta corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido en la comunidad por sus conversiones con matriz de importancia (imatrix), que permiten ejecutar modelos grandes en hardware de consumo sin perder demasiada calidad. El modelo base se ha entrenado o ajustado con datasets especializados como DeepMath-103K (matemáticas), LiveCodeBench (generación de código), SuperGPQA (conocimiento científico) e IF_multi_constraints_upto5 (seguimiento de instrucciones con restricciones múltiples).

Los tags del repositorio indican que el modelo se basa en la arquitectura Qwen3 (etiqueta "qwen3.8") e incorpora MTP (multi-token prediction), una técnica que puede acelerar la generación. También se menciona que se trata de un modelo de visión, con archivos mmproj disponibles en el repositorio de cuantizaciones estáticas. Con licencia Apache 2.0, es relevante ahora porque ofrece capacidades de razonamiento avanzadas en un tamaño (27B) que resulta viable en GPUs de consumo con cuantizaciones de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (tag qwen3.8), con MTP (multi-token prediction) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix), ademas de cuants estaticos en el repo hermano |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, Egzakta/Kvark-Sparkle-1.0-27B, es un transformer denso de unos 27,3 mil millones de parámetros basado en la familia Qwen3, tal como indican los tags del repositorio. Incluye MTP (multi-token prediction), una técnica en la que el modelo predice varios tokens por paso, que puede aprovecharse para decodificación especulativa y mayor throughput en inferencia. El README del cuantizador también señala que se trata de un modelo de visión, cuyos proyectores (mmproj) se distribuyen en el repositorio de cuantizaciones estáticas.

Sobre el entrenamiento del modelo base no se han publicado detalles en la información disponible (número de tokens, composición completa del corpus, uso de RLHF o DPO). Lo que sí consta son los datasets asociados al repositorio, que sugieren un ajuste enfocado en: matemáticas (zwhe99/DeepMath-103K), generación de código (livecodebench/code_generation_lite), conocimiento científico y QA difícil (m-a-p/SuperGPQA) y seguimiento de instrucciones con múltiples restricciones (allenai/IF_multi_constraints_upto5). Los tags "reasoning" y "efficient-reasoning" indican un enfoque en cadenas de razonamiento con control de su longitud.

## Capacidades

- Razonamiento general y matemático: entrenado con DeepMath-103K, un dataset de problemas matemáticos difíciles con soluciones verificables.
- Generación de código: ajuste con datos de LiveCodeBench (code_generation_lite), orientado a problemas de programación tipo competición.
- Conocimiento científico: entrenamiento con SuperGPQA, un benchmark de preguntas graduadas de nivel avanzado en ciencias e ingeniería.
- Seguimiento de instrucciones con restricciones: uso del dataset IF_multi_constraints_upto5, que entrena al modelo a cumplir hasta cinco restricciones simultáneas en una instrucción.
- Razonamiento eficiente: los tags sugieren soporte para modos de razonamiento con control de gasto de tokens (efficient-reasoning).
- Visión: el README del cuantizador indica que es un modelo de visión, con archivos mmproj en el repositorio de cuants estáticos.
- Multi-token prediction (MTP): soporte técnico para acelerar la generación mediante predicción de múltiples tokens.
- Formato conversacional: el repo está etiquetado como "conversational".
- Tool calling y capacidades de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas; el único idioma declarado es el inglés.

## Casos de uso

- Resolución de problemas matemáticos avanzados: gracias al entrenamiento con DeepMath-103K, el modelo puede abordar problemas de matemáticas de nivel competición generando cadenas de razonamiento paso a paso, útil en tutoring técnico o verificación de demostraciones.
- Programación competitiva y generación de código: con datos de LiveCodeBench, es adecuado para resolver ejercicios de algoritmia, generar funciones a partir de especificaciones y asistir en revisiones de código en inglés.
- Asistente de conocimiento científico: el ajuste con SuperGPQA lo hace útil para responder preguntas técnicas de nivel graduado en física, química, biología o ingeniería.
- Ejecución de instrucciones complejas con múltiples restricciones: puede generar textos que cumplan varias condiciones simultáneas (longitud, formato, tono, contenido), útil para generación de contenido estructurado y automatización de redacción.
- Razonamiento con presupuesto de tokens controlado: el enfoque de efficient-reasoning permite desplegar el modelo en escenarios donde se quiere limitar el coste de las cadenas de pensamiento, como APIs de razonamiento con límite de coste.
- Análisis de imágenes con razonamiento: al tratarse de un modelo de visión (mmproj disponible), puede combinarse la comprensión de imágenes con razonamiento textual, por ejemplo interpretar gráficos o diagramas técnicos y razonar sobre ellos.
- Despliegue local en hardware de consumo: con la cuantización i1-Q4_K_M (~16,9 GB) puede ejecutarse en GPUs de 24 GB de VRAM o en configuraciones CPU+GPU mediante llama.cpp u Ollama, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datasets de entrenamiento (DeepMath-103K, LiveCodeBench, SuperGPQA) sugieren las familias de benchmarks en las que el modelo podría destacar, pero no hay puntuaciones concretas publicadas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - i1-Q2_K: ~11 GB
  - i1-IQ3_M: ~12,9 GB
  - i1-Q4_K_M: ~16,9 GB
  - i1-Q5_K_M: ~19,6 GB
  - i1-Q6_K: ~22,5 GB
  - Modelo base en FP16: ~55 GB
- GPU recomendadas:
  - RTX 3090 / RTX 4090 (24 GB): cuants hasta Q6_K con contexto moderado.
  - RTX 4070 Ti Super / 4080 (16 GB): cuants IQ3 o Q4_K_S.
  - A100 / H100: modelo base en FP16 o BF16, o cuants altos con contextos largos y alto throughput.
- Consumer GPUs: sí, cabe en una RTX 3090 o 4090 con la cuantización Q4_K_M (16,9 GB) dejando margen para el KV cache; en GPUs de 12-16 GB son viables los cuants IQ3/Q4_K_S.
- CPU puro: viable con cuants Q2_K/Q3 a velocidades bajas (del orden de pocos tokens/s en CPUs de escritorio modernas), especialmente si el sistema soporta MTP para acelerar la decodificación.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp; el modelo base en safetensors puede servirse con vLLM o TGI, aunque el soporte de MTP dependerá de la versión del runtime.
- Latencia y throughput: no disponible; el MTP sugiere un throughput superior al de un transformer denso equivalente si el runtime lo soporta.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Kvark-Sparkle-1.0-27B (base Egzakta) | 27,3 B | safetensors / GGUF | Apache 2.0 | Razonamiento, visión, MTP, datasets de mates/código |
| Qwen3-30B-A3B | 30 B (3 B activos, MoE) | safetensors / GGUF | Apache 2.0 | Arquitectura base de referencia, MoE muy eficiente |
| Gemma 3 27B | 27 B | safetensors / GGUF | Gemma license (restricciones comerciales) | Multimodal, contexto largo, licencia menos permisiva |

Kvark-Sparkle-1.0-27B compite en la franja de 27-30 B con ventajas en licencia (Apache 2.0 frente a la licencia de Gemma) y en especialización en razonamiento matemático y código. Frente a Qwen3-30B-A3B, el modelo de Egzakta es denso (mayor coste por token) pero el MTP puede compensar parcialmente en throughput.

## Limitaciones y advertencias

- Idioma: el único idioma declarado es el inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Riesgo de alucinación: como todo LLM, puede generar contenido incorrecto con apariencia plausible, especialmente en dominios científicos; el entrenamiento con datos verificables mitiga pero no elimina este riesgo.
- Cuantizaciones agresivas: los cuants Q2_K y Q3 degradan notablemente la calidad (el propio cuantizador recomienda IQ3_XXS sobre Q2_K); para producción se recomienda Q4_K_M o superior.
- Longitud de contexto: no publicada; debe verificarse en la ficha del modelo base antes de planificar cargas con documentos largos.
- Soporte de visión en GGUF: los archivos mmproj están en el repositorio de cuants estáticos, no en este; hay que descargarlos de allí para usar capacidades multimodales.
- Soporte de MTP: depende del runtime; llama.cpp y otros backends pueden no explotarlo todavía, con lo que la velocidad real puede no diferir de un modelo denso estándar.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene revisar los términos de los datasets de entrenamiento si se redistribuyen derivados.
- Esta ficha corresponde a una cuantización de terceros (mradermacher); cualquier bug de conversión debe reportarse al cuantizador, no a Egzakta.

## Enlaces

- Repositorio GGUF imatrix (esta ficha): https://huggingface.co/mradermacher/Kvark-Sparkle-1.0-27B-i1-GGUF
- Repositorio de cuants estáticos: https://huggingface.co/mradermacher/Kvark-Sparkle-1.0-27B-GGUF
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Página de descargas resumida del cuantizador: https://hf.tst.eu/model#Kvark-Sparkle-1.0-27B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/zwhe99/DeepMath-103K
  - https://huggingface.co/datasets/allenai/IF_multi_constraints_upto5
  - https://huggingface.co/datasets/m-a-p/SuperGPQA
  - https://huggingface.co/datasets/livecodebench/code_generation_lite
- Paper, blog oficial o demo: no disponible
