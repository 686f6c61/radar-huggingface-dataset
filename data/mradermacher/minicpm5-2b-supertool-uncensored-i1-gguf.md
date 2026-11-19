# mradermacher/MiniCPM5-2B-Supertool-Uncensored-i1-GGUF

## Resumen

MiniCPM5-2B-Supertool-Uncensored-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo saidutta69/MiniCPM5-2B-Supertool-Uncensored. El modelo base deriva de la familia MiniCPM y esta afinado especificamente para tool calling, function calling y flujos de agentes, con un proceso de destilacion orientada a "supertool" y un tratamiento de "uncensored/abliterated" que elimina los rechazos del modelo original. El repositorio es una publicacion de cuantizaciones (imatrix y weighted) pensada para ejecucion local en GPU de consumo.

El interes practico de esta publicacion reside en el formato: al estar en GGUF, el modelo puede ejecutarse con llama.cpp, Ollama u otros motores compatibles, lo que lo hace accesible en hardware modesto. La licencia Apache 2.0 facilita su uso comercial, aunque el caracter "uncensored" exige controles adicionales en produccion.

Los datos disponibles en la informacion proporcionada son limitados: no se detalla la arquitectura exacta, el numero de tokens de entrenamiento ni resultados de benchmarks. El recuento de parametros reportado en safetensors (1.552.110) no es coherente con el nombre "2B" del modelo y no debe interpretarse como el tamano real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia MiniCPM; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible (el nombre indica 2B; el recuento de safetensors del repo, 1.552.110, no es fiable como tamano del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun metadatos de la model card); fichero imatrix incluido |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Por la nomenclatura (MiniCPM5-2B) se trata de un transformer de la familia MiniCPM, pero no se confirman capas, atencion ni contexto. El modelo base fue afinado con QLoRA (tag "qlora") sobre los datasets saidutta69/fable-5.1-premium-v2 y MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x, orientados a razonamiento y tool calling. Los tags "heretic", "heretic-ara", "ara", "abliterated" y "decensored" indican que se aplico una tecnica de abliteracion/decensurado para eliminar comportamientos de rechazo, y el tag "reproducible" sugiere que el proceso de entrenamiento esta documentado o es replicable.

La publicacion de mradermacher es una capa de cuantizacion: no modifica los pesos de forma sustancial, sino que genera versiones GGUF con y sin imatrix a partir del modelo base. El fichero imatrix permite crear cuantizaciones propias de mayor calidad. No se especifican innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto en ingles.
- Tool calling y function calling: el modelo esta afinado explicitamente para invocar herramientas y estructurar llamadas a funciones.
- Soporte de agentes: los tags incluyen "agents" y "claude-code", lo que sugiere uso en flujos de agente multi-paso y entornos de programacion asistida.
- Razonamiento orientado a tareas: entrenado sobre datasets de razonamiento filtrado (Fable-5.1-Max-Reasoning).
- Comportamiento "uncensored": no aplica rechazos por defecto en contenido sensible, lo que requiere moderacion externa.
- Ejecucion local en GPU de consumo gracias al formato GGUF y a las cuantizaciones de baja precision.
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Agentes de codigo en local: integrado en un entorno tipo Claude Code o similar, el modelo puede emitir llamadas a herramientas (lectura de ficheros, ejecucion de comandos) en un bucle de agente; su tamano reducido permite ejecutarlo en una GPU de consumo sin depender de la nube.
- Automatizacion de tareas con function calling: en pipelines donde el modelo debe elegir entre APIs y rellenar parametros estructurados (JSON), el afinado especifico en tool calling reduce errores de formato frente a modelos genericos del mismo tamano.
- Prototipado de asistentes locales: con cuantizaciones Q4_K_M o Q5_K_M en llama.cpp u Ollama, sirve para validar flujos conversacionales en una estacion de trabajo antes de escalar a un modelo mayor.
- Generacion de texto sin restricciones para investigacion: en entornos controlados donde se estudia el comportamiento de modelos abliterated, permite comparar respuestas frente a la version original con rechazos.
- Evaluacion de tecnicas de cuantizacion: al ofrecer un rango amplio de cuantizaciones (desde IQ1_S hasta Q6_K) y un fichero imatrix, es util para medir la degradacion de calidad por nivel de compresion en tareas de tool calling.
- Despliegue en entornos con recursos limitados: para tareas de clasificacion, extraccion de entidades o resumen en ingles dentro de una aplicacion de escritorio o edge, donde un modelo de 2B cuantizado a 4 bits cabe en VRAM modesta.
- Fine-tuning posterior y experimentacion: la licencia Apache 2.0 y el tag "reproducible" permiten reutilizar el modelo como base para ajustes propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~2B parametros, las cuantizaciones de 4 bits (Q4_K_M, IQ4_XS) ocupan aproximadamente 1,2-1,5 GB; las de 5-6 bits (Q5_K_M, Q6_K) entre 1,5 y 2 GB; las de 2-3 bits (Q2_K, IQ3_M) por debajo de 1 GB. Estas cifras son estimaciones por tamano, no datos publicados para este modelo concreto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de 4-6 bits; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor velocidad, RTX 4090 o GPUs de datacenter (A100, H100) no son necesarias por tamano, pero aceleran el throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas, e incluso en CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los tags indican "endpoints_compatible". El modelo base es de transformers, pero esta publicacion es exclusivamente GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa fiable. Como referencia cualitativa de categoria (modelos pequenos orientados a tool calling y ejecucion local):

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MiniCPM5-2B-Supertool-Uncensored (esta ficha) | ~2B (segun nombre) | no disponible | Apache 2.0 | GGUF |
| Qwen2.5-1.5B/3B-Instruct | 1,5B / 3B | 32K (serie Qwen2.5) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B/3B-Instruct | 1B / 3B | 128K | Llama 3.2 Community | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF |

Los datos de los modelos alternativos corresponden a sus especificaciones publicas conocidas; no se ha realizado comparacion de rendimiento con este modelo por falta de benchmarks.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": no aplica rechazos por defecto, por lo que puede generar contenido danino, sesgado o inapropiado; es imprescindible anadir moderacion y filtros externos en produccion.
- Riesgo de alucinacion: como todo modelo de ~2B, la precision factografica es limitada; no debe usarse como fuente de verdad sin verificacion.
- Solo ingles declarado: no hay soporte multilingue confirmado; el rendimiento en castellano no esta garantizado.
- Contexto no documentado: se desconoce la ventana de contexto real, lo que dificulta planificar tareas de contexto largo.
- Datos de entrenamiento poco transparentes: los datasets son de terceros y no se detalla su composicion, lo que impide evaluar sesgos de origen.
- Recuento de parametros inconsistente: el valor de safetensors (1.552.110) no cuadra con el nombre "2B"; conviene verificar el tamano real antes de dimensionar el hardware.
- Licencia Apache 2.0: permite uso comercial, pero el autor del modelo base no ofrece garantias; revise las condiciones del modelo original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad en tool calling frente a alternativas, por lo que la eleccion debe basarse en pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-Uncensored-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniCPM5-2B-Supertool-Uncensored-i1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset saidutta69/fable-5.1-premium-v2: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
