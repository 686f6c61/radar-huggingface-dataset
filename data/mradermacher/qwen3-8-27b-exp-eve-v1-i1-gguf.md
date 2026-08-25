# mradermacher/Qwen3.8-27B-EXP-EVE-v1-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-EXP-EVE-v1-i1-GGUF` es una colección de cuantizaciones GGUF con imatrix del modelo base `win10/Qwen3.8-27B-EXP-EVE-v1`, una variante experimental de la familia Qwen3.8 desarrollada por el equipo de Qwen (Alibaba) y posteriormente modificada mediante técnicas de "Tensor Gene Evolution" (EVE). El cuantizado ha sido realizado por mradermacher, un conocido proveedor de formatos GGUF optimizados para inferencia local.

Este modelo destaca por su arquitectura híbrida de atención, que combina atención completa en 16 de sus 64 capas con atención lineal recurrente en las 48 restantes, lo que reduce el coste computacional manteniendo una ventana de contexto amplia. Además, es un modelo multimodal con capacidades de visión, aunque los archivos de proyección de visión (mmproj) se encuentran en el repositorio estático de cuantizaciones, no en este repo de imatrix.

La relevancia actual radica en que ofrece cuantizaciones de alta calidad (i1-Q2_K, i1-IQ3_M, i1-Q4_K_S) que permiten ejecutar un modelo de 27 000 millones de parámetros en GPUs de consumo con 16-24 GB de VRAM, manteniendo un equilibrio entre tamaño, velocidad y fidelidad. Es una opción atractiva para desarrolladores que necesitan un modelo multilingüe (inglés y chino) con capacidades de visión y razonamiento, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 capas de atención lineal con estado recurrente constante |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado en la informacion proporcionada) |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB), ademas de archivo imatrix |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix para cuantizacion personalizada) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B-EXP-EVE-v1` pertenece a la serie Qwen3.8, que utiliza un backbone de atencion hibrida. Segun la documentacion oficial de Qwen3.8, el modelo de 27B es el miembro denso de la familia, con 64 capas en total. De ellas, solo 16 ejecutan atencion completa (con un intervalo de atencion completa de 4), mientras que las otras 48 utilizan atencion lineal con un estado recurrente constante. Esta arquitectura reduce la complejidad computacional de O(n²) a O(n) en la mayoria de las capas, permitiendo contextos largos con menor coste.

La variante "EVE" (Evolution) incorpora modificaciones basadas en "Tensor Gene Evolution", un enfoque experimental que ajusta la topologia de los tensores durante el entrenamiento. No se dispone de detalles tecnicos especificos sobre este proceso en la informacion proporcionada. El modelo es multimodal (vision + texto), aunque los archivos de proyeccion de vision (mmproj) se distribuyen por separado en el repositorio estatico de cuantizaciones.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: al ser un modelo de 27B, es capaz de tareas complejas de comprension y generacion de lenguaje, aunque no se han publicado benchmarks especificos.
- Capacidades de vision: el modelo base es multimodal, por lo que puede procesar imagenes junto con texto. Sin embargo, los archivos mmproj necesarios para esta funcionalidad no estan incluidos en este repositorio de imatrix, sino en el repositorio estatico de GGUF.
- Soporte multilingue: entrenado principalmente en ingles y chino, con posible transferencia a otros idiomas no confirmada.
- Tool calling y function calling: no confirmado en la informacion proporcionada, aunque es comun en la familia Qwen3.8.
- Soporte para agentes y razonamiento multi-paso: no confirmado, pero probable dado el tamano y la arquitectura.
- Modo thinking: no se menciona en la informacion disponible.

## Casos de uso

- Asistente conversacional local: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en una GPU de 24 GB (por ejemplo, RTX 4090) con llama.cpp u Ollama, ofreciendo respuestas fluidas en ingles y chino para aplicaciones de chatbot privadas.
- Analisis de documentos con imagenes: al ser un modelo de vision, puede utilizarse para extraer informacion de capturas de pantalla, diagramas o documentos escaneados, siempre que se carguen los archivos mmproj adecuados.
- Generacion de codigo asistida: con 27B de parametros, es adecuado para autocompletar y generar fragmentos de codigo en entornos de desarrollo integrados, especialmente si se confirma el soporte de tool calling.
- Traduccion automatica entre ingles y chino: su entrenamiento bilingue lo hace util para traducir textos tecnicos o conversacionales entre ambos idiomas.
- Prototipado de agentes con razonamiento: su arquitectura hibrida permite manejar contextos largos, lo que facilita la construccion de agentes que necesitan recordar informacion a lo largo de multiples turnos.
- Investigacion academica sobre arquitecturas hibridas: al ser una variante experimental con Tensor Gene Evolution, puede servir como objeto de estudio para comparar el rendimiento de atencion lineal frente a atencion completa en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, se necesitan aproximadamente 11 GB (i1-Q2_K), 13 GB (i1-IQ3_M) o 16 GB (i1-Q4_K_S) para los pesos. A esto hay que anadir la memoria para el contexto y las activaciones, por lo que se recomienda al menos 16 GB de VRAM para la cuantizacion Q4_K_S y 24 GB para trabajar comodamente con contextos largos.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o superiores. Para cuantizaciones mas bajas (Q2_K), una GPU de 12 GB como la RTX 3060 podria ser suficiente, aunque con limitaciones de contexto.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) con soporte GGUF, vLLM (si se convierte a formato compatible), o cualquier runtime que acepte GGUF.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con cuantizacion Q4_K_S, se puede esperar una velocidad de generacion de entre 20 y 40 tokens por segundo, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, se puede situar el modelo en el contexto de la familia Qwen3.8:

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27,3 B | Hibrida (16 full + 48 linear) | No disponible | Apache 2.0 |
| Qwen3-30B-A3B | 30 B (MoE, 3 B activos) | MoE con atencion completa | 128k (tipico) | Apache 2.0 |
| Qwen2.5-32B | 32,5 B | Densa, atencion completa | 128k | Apache 2.0 |

La comparativa directa no es posible sin benchmarks. Se recomienda consultar el repositorio oficial de Qwen3.8 para obtener informacion actualizada sobre el rendimiento de la familia.

## Limitaciones y advertencias

- Modelo experimental: la variante EVE con Tensor Gene Evolution no es un modelo oficial de Qwen, sino una modificacion de terceros. Su comportamiento puede diferir del Qwen3.8-27B estandar y no hay garantias de estabilidad.
- Chat template potencialmente roto: segun una fuente externa, el modelo base puede tener un chat template incorrecto que afecta a la generacion de respuestas. Es necesario verificar y corregir la plantilla antes de usarlo en produccion.
- Archivos de vision separados: este repositorio no incluye los archivos mmproj necesarios para las capacidades de vision. Deben descargarse del repositorio estatico de GGUF.
- Sesgos y alucinaciones: al ser un modelo de 27B sin informacion sobre su alineacion, puede presentar sesgos de genero, raza o cultura, y alucinar hechos o codigo. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de idioma: aunque soporta ingles y chino, no se garantiza un rendimiento adecuado en otros idiomas.
- Requisitos de hardware: para un uso fluido con contexto largo, se necesitan al menos 24 GB de VRAM. Con 16 GB, el contexto debe limitarse considerablemente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es una modificacion experimental; se recomienda revisar los terminos del repositorio original.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-EXP-EVE-v1-i1-GGUF
- Repositorio estatico de cuantizaciones (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.8-27B-EXP-EVE-v1-GGUF
- Modelo base: https://huggingface.co/win10/Qwen3.8-27B-EXP-EVE-v1
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Guia de ejecucion local (VRAM, quants y template): https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Pagina de recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
