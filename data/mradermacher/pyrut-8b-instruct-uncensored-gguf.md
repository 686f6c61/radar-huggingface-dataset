# mradermacher/Pyrut-8B-Instruct-Uncensored-GGUF

## Resumen

Pyrut-8B-Instruct-Uncensored-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Pyrex-8B-Instruct-Uncensored, publicado por el usuario mradermacher. El modelo original lo desarrolla ImposterOnline y consiste en un ajuste fino por instrucciones de 7.615.616.512 parametros (aproximadamente 7,6B), orientado especificamente a tareas de programacion y con el filtro de moderacion eliminado, de ahi la etiqueta "uncensored". El repositorio que nos ocupa no aporta pesos nuevos: unicamente ofrece versiones comprimidas del modelo base para su uso con llama.cpp, Ollama y otros runners compatibles con GGUF.

La relevancia de esta ficha radica en que es la via practica de desplegar el modelo en hardware de consumo. El repositorio incluye doce cuantizaciones distintas, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU con RAM suficiente. El modelo esta entrenado con QLoRA sobre una mezcla de datasets de codigo e instrucciones generales, e incorpora soporte declarado de function calling y flujos agenticos.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, si bien conviene tener presente que el caracter "uncensored" implica ausencia de filtros de seguridad y traslada al desarrollador toda la responsabilidad sobre las salidas. El modelo solo declara soporte de ingles y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (familia no especificada en la informacion disponible) |
| Parametros totales | 7.615.616.512 (aprox. 7,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo base como un ajuste fino por instrucciones de 7,6B parametros realizado mediante QLoRA sobre un modelo preentrenado no identificado explicitamente. El autor lo define como "coding-first", es decir, con una receta de datos volcada hacia tareas de programacion. Los datasets declarados son: OpenCoder-LLM/opencoder-sft-stage1, sahil2801/CodeAlpaca-20k, theblackcat102/evol-codealpaca-v1, databricks/databricks-dolly-15k y NousResearch/hermes-function-calling-v1. La combinacion mezcla datos masivos de codigo (OpenCoder, CodeAlpaca, evol-codealpaca), instrucciones generales (dolly-15k) y ejemplos de llamada a funciones (hermes-function-calling-v1), lo que explica la orientacion agentica del modelo.

No se detalla en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion exacta de la mezcla, ni si se aplicaron fases de RLHF o DPO posteriores al SFT. Tampoco se especifican innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Esta ficha corresponde exclusivamente al repositorio de cuantizaciones GGUF generadas por mradermacher mediante conversion desde el modelo base en formato HuggingFace; el proceso de cuantizacion es estatico (quantize_version 2, output_tensor_quantised 1) y existe una variante alternativa con pesos ponderados e imatrix publicada en un repositorio independiente.

## Capacidades

- Generacion de texto y codigo: el ajuste "coding-first" y los datasets de codigo apuntan a un rendimiento solido en generacion, explicacion y refactorizacion de codigo.
- Instrucciones generales: la inclusion de databricks-dolly-15k anade capacidades conversacionales y de respuesta a instrucciones fuera del ambito puramente tecnico.
- Function calling / tool calling: el dataset NousResearch/hermes-function-calling-v1 habilita el formato de llamada a funciones estructurada.
- Flujos agenticos: la etiqueta "agentic" indica soporte para razonamiento multi-paso y encadenamiento de herramientas.
- Modo sin censura: el modelo no aplica filtros de contenido, lo que se traduce en respuestas directas ante peticiones que otros modelos rechazarian.
- Multilingue: limitado al ingles segun la declaracion de idiomas del repositorio.
- Capacidades de vision o audio: no disponible.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente de programacion en local: integrado en editores como VS Code mediante extensiones compatibles con llama.cpp u Ollama, el modelo puede autocompletar, explicar y refactorizar codigo sin enviar datos a servicios externos. Su tamano de 7,6B permite ejecutarlo en una GPU de consumo.
- Generacion de codigo en tuberias de CI/CD: gracias al soporte de function calling, puede invocarse desde scripts para generar tests, parches o documentacion de forma automatizada dentro de un pipeline.
- Analisis de codigo heredado: su entrenamiento sobre evol-codealpaca y OpenCoder lo hace util para tareas de traduccion entre lenguajes, deteccion de antipatrones y generacion de comentarios en bases de codigo antiguas.
- Entornos de investigacion en seguridad ofensiva: al no aplicar filtros de contenido, encaja en laboratorios autorizados de red team que necesitan analizar tecnicas de explotacion o generar PoCs sin bloqueos de moderacion.
- Agentes autonomos de bajo coste: con cuantizaciones Q4_K_M (4,8 GB), puede actuar como cerebro de un agente que planifica pasos, llama a herramientas y encadena acciones en hardware modesto.
- Procesamiento por lotes de datos en ingles: generacion de resumenes, clasificacion o reformateo de grandes volumenes de texto mediante scripts desatendidos en CPU o GPU.
- Prototipado rapido sin conexion: en entornos air-gapped o con requisitos estrictos de privacidad, el formato GGUF permite desplegar el modelo en una estacion de trabajo sin dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el modelo base ni para las versiones cuantizadas.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion (segun tamanos declarados en el repositorio):
  - Q2_K: 3,1 GB
  - Q3_K_S: 3,6 GB
  - Q3_K_M: 3,9 GB
  - Q3_K_L: 4,2 GB
  - IQ4_XS: 4,4 GB
  - Q4_K_S: 4,6 GB
  - Q4_K_M: 4,8 GB
  - Q5_K_S: 5,4 GB
  - Q5_K_M: 5,5 GB
  - Q6_K: 6,4 GB
  - Q8_0: 8,2 GB
  - f16: 15,3 GB
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantizaciones Q4 y Q5. Las versiones Q8_0 y f16 requieren GPUs de 12-16 GB o superior.
- GPU de datacenter: A100, H100, L40S y similares pueden ejecutar cualquier cuantizacion, incluida f16, con margen para contextos largos y lotes grandes.
- Despliegue en CPU: las cuantizaciones Q4_K_M y Q5_K_M son viables en CPU con 8-16 GB de RAM, con throughput reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI) y cualquier runner compatible con GGUF. El modelo tambien es compatible con endpoints.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Nota sobre la variante imatrix: existen cuantizaciones ponderadas con imatrix en un repositorio separado que suelen ofrecer mejor calidad por bit que las estaticas incluidas aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Orientacion |
|---|---|---|---|---|---|
| Pyrut-8B-Instruct-Uncensored (GGUF) | 7,6B | no disponible | Apache 2.0 | HuggingFace, GGUF | Codigo sin censura |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | HuggingFace, GGUF, amplia | Generalista |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32K (extensible) | Apache 2.0 | HuggingFace, GGUF, amplia | Codigo |

La comparacion cuantitativa de rendimiento no es posible porque no hay benchmarks publicados para Pyrut-8B en la informacion disponible. Frente a Llama 3.1 8B Instruct y Qwen2.5-Coder-7B-Instruct, las diferencias principales son la ausencia de filtros de seguridad, el enfoque "coding-first" y un ecosistema de soporte mucho menor (182 descargas y 0 likes en el momento de la ficha frente a millones en los modelos alternativos). Qwen2.5-Coder-7B-Instruct comparte licencia Apache 2.0 y una orientacion similar a codigo, por lo que es la alternativa mas directa si se prioriza madurez y soporte; Pyrut solo se justifica cuando se necesita explicitamente la ausencia de moderacion.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso en produccion exige moderacion externa si el publico no es controlado.
- Riesgo de alucinacion: como cualquier modelo de 7,6B ajustado por instrucciones, puede inventar APIs, funciones o hechos con aparente seguridad. No se ha publicado ninguna evaluacion de fidelidad.
- Idiomas: solo se declara ingles. El rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Contexto desconocido: al no especificarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Cuantizaciones de baja precision: Q2_K y Q3_K degradan notablemente la calidad. El propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M o superiores.
- Ecosistema reducido: 182 descargas y 0 likes indican una adopcion marginal, con pocas garantias de mantenimiento o comunidad.
- Trazabilidad limitada: no se identifica el modelo preentrenado subyacente ni los detalles del dataset de SFT, lo que dificulta auditar sesgos o procedencia de los datos.
- Discrepancia en el nombre: el repositorio se llama "Pyrut" mientras que el modelo base es "Pyrex"; conviene verificar la correspondencia antes de integrarlo.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero no exime de responsabilidad legal por el contenido generado.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Pyrut-8B-Instruct-Uncensored-GGUF
- Modelo base: https://huggingface.co/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/Pyrut-8B-Instruct-Uncensored-i1-GGUF
- Pagina de resumen del modelo: https://hf.tst.eu/model#Pyrut-8B-Instruct-Uncensored-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Ficha del modelo base en featherless.ai: https://featherless.ai/models/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Lista curada de modelos sin censura para seguridad ofensiva: https://github.com/JoasASantos/Offensive-Security-AI-Models
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
