# mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-GGUF` es una cuantización GGUF del fine-tune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, desarrollado por DavidAU sobre la base de Qwen3.8-27B de Alibaba. Se trata de un modelo de lenguaje de 27 320 millones de parámetros, con licencia Apache 2.0, orientado a usos generales y con un enfoque "uncensored" (sin restricciones de contenido) y "heretic" (optimizado para respuestas directas y sin filtros). El nombre incluye referencias a técnicas de entrenamiento como Cold Fusion, GAIN Training y Multi-stage tuning, que buscan mejorar la calidad de razonamiento y la adherencia a instrucciones.

La versión GGUF, publicada por mradermacher, ofrece múltiples niveles de cuantización (de Q2_K a Q8_0) y archivos mmproj para soporte multimodal, lo que permite ejecutar el modelo en hardware variado, desde GPUs de consumo hasta servidores profesionales. El modelo base incorpora un encoder de visión (según la documentación de Qwen3.8-27B) y una ventana de contexto de 262 144 tokens, lo que lo hace adecuado para tareas de razonamiento largo y procesamiento de documentos extensos. Su relevancia actual radica en combinar un tamaño manejable (27B) con capacidades multimodales y una licencia permisiva, siendo una opción atractiva para desarrolladores que buscan un modelo potente sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B, con encoder de vision) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (segun documentacion de Qwen3.8-27B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.8-27B, que incorpora un encoder de vision (segun la documentacion oficial de Qwen). El modelo base de DavidAU es un fine-tune que aplica tecnicas denominadas Cold Fusion, GAIN Training y Multi-stage tuning, aunque no se dispone de detalles tecnicos publicos sobre estas metodologias. El nombre "TURBO" sugiere optimizaciones de velocidad o eficiencia, y "Fable" podria referirse a un dataset o tecnica especifica. El entrenamiento se realizo sobre el modelo Qwen3.8-27B original, que a su vez fue preentrenado con un corpus multilingue (aunque este fine-tune solo declara soporte para ingles). No se han publicado detalles sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

La cuantizacion GGUF fue realizada por mradermacher, quien genero los distintos niveles de precision (Q2 a Q8) y los archivos mmproj para el proyector multimodal. El repositorio incluye tanto quants estaticos como versiones con imatrix (en un repositorio separado).

## Capacidades

- Generacion de texto y razonamiento: modelo denso de 27B con capacidad para tareas complejas de lenguaje, incluyendo razonamiento logico y matematico (segun la familia Qwen3.8).
- Soporte multimodal: incluye archivos mmproj (Q8_0 y f16) que permiten procesar imagenes junto con texto, gracias al encoder de vision de Qwen3.8-27B.
- Contexto largo: ventana de 262 144 tokens, adecuada para documentos extensos, conversaciones multi-turno y analisis de codigo fuente grande.
- Sin restricciones de contenido: el termino "uncensored" indica que el modelo no aplica filtros de seguridad o alineacion, lo que permite generar contenido que otros modelos rechazarian.
- Tool calling y function calling: no se menciona explicitamente, pero los modelos Qwen3.8 suelen soportar estas capacidades; no hay confirmacion en la informacion disponible.
- Capacidades de agente: no se documenta soporte especifico para agentes o multi-step reasoning, aunque el contexto largo y el razonamiento general lo permiten.
- Multilingue: solo se declara ingles, aunque el modelo base Qwen3.8 es multilingue; el fine-tune puede haber reducido el soporte a otros idiomas.

## Casos de uso

- Analisis de documentos extensos: gracias a los 262k tokens de contexto, el modelo puede procesar contratos, informes anuales o libros completos en una sola pasada, extrayendo informacion y resumiendo secciones especificas.
- Generacion de codigo en produccion: con soporte de contexto largo y razonamiento, puede asistir en la revision de repositorios grandes, generacion de funciones complejas y refactorizacion de codigo, integrandose en pipelines de CI/CD mediante APIs.
- Chatbots sin filtros: su naturaleza "uncensored" lo hace util para aplicaciones de rol, escritura creativa o simulacion de personajes donde se requiere libertad de expresion sin restricciones de contenido.
- Procesamiento de imagenes con texto: al incluir el proyector multimodal, puede describir imagenes, responder preguntas sobre ellas o generar alt-text, combinando vision y lenguaje en un solo modelo.
- Asistencia en investigacion academica: para tareas de lectura de papers, generacion de hipotesis o resumen de literatura cientifica, aprovechando el contexto largo y el razonamiento.
- Automatizacion de atencion al cliente: con la ventana de contexto amplia, puede mantener conversaciones largas y coherentes, recordando detalles de interacciones previas y resolviendo consultas complejas sin perder el hilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web menciona que otro fine-tune de DavidAU (NEO-CODER-MAX-MTP) supera 730 en ARC-c y 880 en ARC-E, pero no hay datos especificos para este modelo. No se dispone de puntuaciones MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: los quants varian entre 11 GB (Q2_K) y 29,1 GB (Q8_0). Para Q4_K_M (16,9 GB) se necesita al menos 20 GB de VRAM con overhead; para Q8_0, unos 32 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) pueden ejecutar Q4_K_M o Q5_K_M; A100 40 GB o H100 pueden ejecutar Q8_0 sin problemas. Para Q2_K, una GPU de 12 GB (RTX 3060) podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizaciones Q4 o Q5 en GPUs de 24 GB; Q2_K cabe en 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-webui, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos; en una RTX 4090 con Q4_K_M se esperan velocidades de 20-40 tokens/s, pero no hay confirmacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3 B | 262k | Apache 2.0 | safetensors, GGUF | Modelo base, con vision encoder |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,3 B | 262k | Apache 2.0 | safetensors | Fine-tune uncensored con tecnicas Cold Fusion/GAIN |
| mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-GGUF | 27,3 B | 262k | Apache 2.0 | GGUF | Cuantizacion del fine-tune anterior |
| Llama 3.1 8B (para comparar tamano menor) | 8 B | 128k | Llama 3.1 | safetensors, GGUF | Menor capacidad, contexto menor |

No se dispone de datos de rendimiento comparativo entre estos modelos. La eleccion entre el original y el fine-tune depende de la necesidad de contenido sin filtros y de las tecnicas de entrenamiento adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune "uncensored", puede generar contenido ofensivo, sesgado o inapropiado sin filtros de seguridad. No se ha evaluado su sesgo sistematico.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en tareas de razonamiento complejo. No se han publicado metricas de fiabilidad.
- Limitaciones de idioma: solo se declara soporte para ingles; el uso en otros idiomas puede degradar la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base Qwen3.8-27B tambien es Apache 2.0, por lo que no hay restricciones adicionales.
- Caveat para produccion: al carecer de alineacion de seguridad, no es recomendable para aplicaciones donde se requiera moderacion de contenido o cumplimiento normativo. Ademas, la cuantizacion puede degradar la calidad en niveles bajos (Q2, Q3).
- El modelo base no publica detalles sobre el dataset de fine-tune, por lo que no se puede auditar su procedencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de ejecucion local (Unsloth): https://unsloth.ai/docs/models/qwen3.8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Articulo sobre ejecucion local (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
