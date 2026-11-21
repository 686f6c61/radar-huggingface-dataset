# mradermacher/Pyrut-8B-Instruct-Uncensored-GGUF

## Resumen

Pyrut-8B-Instruct-Uncensored-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo ImposterOnline/Pyrex-8B-Instruct-Uncensored, publicada por el usuario mradermacher. El modelo original es un ajuste fino de 8B parametros orientado a generacion de codigo y conversacion sin filtros de moderacion (uncensored), entrenado sobre datasets de codigo e instrucciones como OpenCoder-SFT-stage1, CodeAlpaca-20k, evol-codealpaca-v1, databricks-dolly-15k y hermes-function-calling-v1. Esta publicacion no introduce pesos nuevos: su valor esta en ofrecer los pesos originales en multiples niveles de cuantizacion para facilitar su despliegue en hardware modesto.

El modelo cuenta con 7.615.616.512 parametros (aproximadamente 7,6B) y esta pensado para inferencia local mediante llama.cpp y herramientas compatibles con GGUF. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales. El repositorio incluye once variantes de cuantizacion, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), ademas de una version con cuantizacion ponderada/imatrix publicada en un repositorio separado.

Es relevante ahora porque satisface la demanda de modelos de codigo ejecutables en GPU de consumo, con soporte declarado para function calling y un enfasis explicito en la ausencia de censura, algo que interesa a desarrolladores que necesitan respuestas sin bloqueos en tareas tecnicas. No obstante, la informacion publicada es escasa: no se detallan la longitud de contexto, la composicion exacta del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; probablemente transformer decoder-only, sin confirmar) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas quants ponderados/imatrix en repositorio separado |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por el tamano (7,6B parametros) y la libreria declarada (transformers), se trata presumiblemente de un transformer decoder-only, pero la model card no especifica la familia arquitectonica, el numero de capas, las dimensiones ocultas ni el mecanismo de atencion. Tampoco se indica la longitud de contexto nativa.

El entrenamiento se realizo mediante ajuste fino supervisado (SFT) sobre cinco datasets: OpenCoder-LLM/opencoder-sft-stage1, sahil2801/CodeAlpaca-20k, theblackcat102/evol-codealpaca-v1, databricks/databricks-dolly-15k y NousResearch/hermes-function-calling-v1. Esta combinacion sugiere un enfasis en generacion de codigo, instrucciones generales y function calling. No se documenta el numero de tokens de entrenamiento, la composicion proporcional de cada dataset, ni si se aplicaron tecnicas de RLHF o DPO. La etiqueta "uncensored" indica que se elimino o redujo el alineamiento de seguridad, pero no se detalla el procedimiento. Esta publicacion concreta es unicamente una conversion y cuantizacion de los pesos originales, sin reentrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instruct.
- Generacion y asistencia en codigo, dado el peso de los datasets de programacion en el entrenamiento.
- Soporte declarado de function calling / tool calling, gracias al dataset hermes-function-calling-v1.
- Respuestas sin filtros de moderacion (uncensored), orientado a contenido que otros modelos rechazan.
- Capacidad multilingue limitada: solo se declara ingles.
- No se documentan capacidades de vision, audio, modo thinking ni razonamiento multi-paso explicito.
- Compatible con endpoints de inferencia (etiqueta endpoints_compatible) y con llama.cpp.

## Casos de uso

- Asistente de programacion local: el modelo puede generar y explicar codigo en ingles dentro de entornos de desarrollo integrados, ejecutandose en GPU de consumo gracias a las cuantizaciones Q4_K_M (4,8 GB) o Q5_K_M (5,5 GB).
- Autocompletado y refactorizacion de codigo en pipelines de CI/CD: con soporte de function calling, puede integrarse en flujos automatizados que invocan herramientas externas, aunque requiere validacion humana por el riesgo de alucinacion.
- Prototipado rapido de agentes: la combinacion de formato instruct y function calling permite construir agentes sencillos que llaman a APIs en entornos controlados y de investigacion.
- Generacion de contenido tecnico sin restricciones: util para redaccion de documentacion, analisis de seguridad o pruebas de robustez donde los filtros de moderacion interfieren con la tarea.
- Investigacion sobre alineamiento y censura: al ser un modelo uncensored con licencia MIT, sirve como linea base para estudiar el comportamiento de modelos sin alineamiento de seguridad.
- Despliegue en hardware modesto: las variantes Q2_K (3,1 GB) y Q3_K_S (3,6 GB) permiten ejecucion en equipos con poca VRAM o incluso CPU, para tareas de generacion de texto de baja exigencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB (Q2_K), 3,6 GB (Q3_K_S), 4,6-4,8 GB (Q4_K_S/Q4_K_M), 5,4-5,5 GB (Q5_K_S/Q5_K_M), 6,4 GB (Q6_K), 8,2 GB (Q8_0) y 15,3 GB (f16), sin contar el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4070 o superiores para las variantes de mayor calidad; A100 o H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas para Q4_K_M y Q5_K_M; las variantes Q2_K y Q3_K_S pueden ejecutarse en GPUs de 4 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con GGUF; el modelo base puede usarse con transformers y presumiblemente con vLLM o TGI si se dispone de los pesos en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pyrut-8B-Instruct-Uncensored-GGUF | 7,6B | no disponible | MIT | GGUF | Enfocado en codigo y uncensored; sin benchmarks publicados |
| ImposterOnline/Pyrex-8B-Instruct-Uncensored | 7,6B | no disponible | MIT | safetensors | Modelo base del que deriva esta cuantizacion |
| Alternativas de 7-8B para codigo (p. ej. CodeLlama-7B, Qwen2.5-Coder-7B) | 7-8B | variable | variable | safetensors/GGUF | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa fiable con modelos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo uncensored, es probable que reproduzca sesgos de sus datos de entrenamiento sin mitigacion.
- Riesgo de alucinacion: elevado en tareas de codigo y factuales, especialmente en cuantizaciones bajas (Q2_K, Q3_K) y sin benchmarks que validen su fiabilidad.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no documentada, lo que dificulta planificar su uso en conversaciones largas o analisis de repositorios extensos.
- Licencia: MIT permite uso comercial, pero el caracter uncensored implica responsabilidad legal y etica sobre el contenido generado; conviene revisar las politicas de uso en produccion.
- Caveat de produccion: la ausencia de benchmarks, de documentacion de arquitectura y de datos de entrenamiento detallados limita la evaluacion rigurosa; se recomienda validacion propia antes de desplegar.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Pyrut-8B-Instruct-Uncensored-GGUF
- Modelo base: https://huggingface.co/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/Pyrut-8B-Instruct-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Pyrut-8B-Instruct-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
