# mradermacher/Qwen3.8-27B-Kimiko-2-BF16-GGUF

## Resumen

Qwen3.8-27B-Kimiko-2-BF16-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.8-27B-Kimiko-2-BF16, un merge creado por AMAImedia a partir de la familia Qwen3.8. El modelo base, Qwen3.8-27B, es un modelo denso de 27.000 millones de parametros desarrollado por Alibaba Cloud, con una arquitectura de atencion hibrida que combina atencion completa y lineal, y una ventana de contexto nativa de 262.144 tokens. Es un modelo de lenguaje y vision (vision-language) orientado a tareas de codificacion, trabajo profesional, investigacion y tareas agenciales de largo horizonte.

La version GGUF, publicada por mradermacher, ofrece 13 cuantizaciones diferentes que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), lo que permite desplegar el modelo en una amplia gama de hardware, desde GPU de consumo hasta servidores profesionales. Incluye ademas dos ficheros mmproj (multi-modal projector) en f16 y Q8_0 para habilitar las capacidades de vision del modelo. La relevancia de esta publicacion radica en que facilita el uso del modelo en entornos de inferencia local mediante herramientas como llama.cpp u Ollama, sin necesidad de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion completa + atencion lineal) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors disponible en el repositorio base) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 27.000 millones de parametros que utiliza una arquitectura de atencion hibrida, compartiendo el mismo backbone que el modelo MoE flagship de 2,4 billones de parametros de la familia Qwen3.8. La capa de mezcla es el aspecto mas interesante: solo 16 de las 64 capas ejecutan atencion completa (con un intervalo de atencion completa de 4), mientras que las otras 48 capas utilizan atencion lineal con un estado recurrente constante. Esta combinacion permite manejar contextos muy largos (262K tokens) con un coste computacional reducido en comparacion con la atencion completa tradicional.

El modelo Kimiko-2 es un merge creado por AMAImedia utilizando mergekit, que combina pesos de diferentes modelos de la familia Qwen3.8 (qwen3_5, qwen3_6, qwen3_8). No se dispone de informacion detallada sobre el dataset de entrenamiento, el proceso de alineacion (RLHF/DPO) ni las tecnicas de optimizacion especificas empleadas en el merge. La cuantizacion GGUF fue realizada por mradermacher mediante conversion estatica de los pesos originales en BF16.

## Capacidades

- Generacion de texto y razonamiento: modelo de lenguaje generalista con capacidades de razonamiento configurable (modo thinking opcional).
- Codificacion: orientado a tareas de programacion, con soporte para multiples lenguajes.
- Vision-language: incluye ficheros mmproj que habilitan la comprension de imagenes (multimodal).
- Tareas agenciales: disenado para tareas de largo horizonte y uso como agente autonomo.
- Ventana de contexto larga: 262K tokens nativos, adecuado para documentos extensos y conversaciones multi-turno.
- Tool calling / function calling: no se confirma explicitamente en la informacion disponible, aunque es una capacidad comun en la familia Qwen3.8.
- Multilingue: la model card indica solo ingles, aunque el modelo base Qwen3.8 soporta multiples idiomas.

## Casos de uso

- Asistente de codificacion en produccion: el modelo puede integrarse en IDE o pipelines de CI/CD para generar, revisar y refactorizar codigo. Su ventana de 262K tokens permite procesar repositorios completos o archivos muy extensos en una sola pasada.
- Analisis de documentos legales y tecnicos: gracias a su contexto largo, puede resumir, extraer informacion y responder preguntas sobre contratos, patentes o especificaciones tecnicas de cientos de paginas.
- Agente autonomo para automatizacion de tareas: su capacidad para tareas de largo horizonte lo hace adecuado para agentes que deben planificar y ejecutar multiples pasos, como gestion de correo, organizacion de archivos o scraping web.
- Comprension de imagenes y documentos escaneados: con los ficheros mmproj, puede procesar capturas de pantalla, diagramas, graficos y documentos escaneados para extraer informacion o transcribir contenido.
- Chatbot de atencion al cliente con contexto largo: puede mantener conversaciones prolongadas recordando todo el historial, lo que mejora la coherencia en interacciones de soporte tecnico.
- Investigacion academica: util para revisar literatura cientifica, resumir articulos extensos y ayudar en la redaccion de trabajos, gracias a su capacidad de razonamiento y procesamiento de documentos largos.
- Despliegue local en entornos con restricciones de privacidad: al estar disponible en GGUF, puede ejecutarse en infraestructura propia sin enviar datos a servicios cloud, cumpliendo requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de evaluacion comparativa (MMLU, HumanEval, GSM8K, etc.) para esta version cuantizada ni para el modelo base Kimiko-2. Para referencia, el modelo Qwen3.8-27B original de Alibaba Cloud ha sido evaluado en benchmarks como MathVision, pero esos resultados no son directamente aplicables a este merge cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Q2_K (10,8 GB) cabe en GPU de 12 GB; Q4_K_M (16,6 GB) requiere GPU de 20-24 GB; Q8_0 (28,7 GB) necesita GPU de 32 GB o mas.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4/Q5; A100 40/80 GB o H100 para Q6/Q8 y contexto largo; GPU de 12-16 GB (RTX 3060, RTX 4070) para Q2_K/Q3_K con contexto reducido.
- En consumer GPU: si, con cuantizaciones Q2_K a Q5_K_M en GPU de 16-24 GB, aunque la velocidad dependera del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion a formato compatible), TGI.
- Latencia y throughput: no disponible. Dependera de la GPU, la cuantizacion y la longitud del contexto. La arquitectura hibrida con atencion lineal deberia ofrecer mejor rendimiento en contexto largo que un transformer denso equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 26,9 B | 262K | Hibrida (full + linear attention) | Apache 2.0 (segun Qwen) | safetensors |
| Qwen3.8-27B-Kimiko-2-BF16 | 26,9 B | 262K | Hibrida (merge) | No disponible | safetensors, GGUF |
| Qwen3.5-27B | 27 B | no disponible | Transformer denso | Apache 2.0 | safetensors |
| Llama 3.3-70B | 70 B | 128K | Transformer denso | Llama 3.3 | safetensors, GGUF |

La comparativa se basa en datos publicos de los modelos base. No se dispone de benchmarks que permitan comparar el rendimiento real del merge Kimiko-2 frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo Kimiko-2 ni de esta cuantizacion. Esto genera incertidumbre legal para uso comercial. Se recomienda contactar con AMAImedia antes de usar el modelo en produccion.
- Idioma limitado: la model card indica solo ingles. Aunque el modelo base Qwen3.8 soporta mas idiomas, el merge puede haber alterado el comportamiento multilingue.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo o seguridad para este merge especifico.
- Cuantizaciones de baja precision: las versiones Q2_K y Q3_K pueden degradar significativamente la calidad de las respuestas. Se recomienda Q4_K_M o superior para uso profesional.
- Modelo merge sin validacion independiente: al ser un merge de la comunidad, no ha pasado por el mismo proceso de evaluacion y alineacion que el modelo original de Alibaba Cloud.
- Fecha de creacion futura: el repositorio indica fecha de creacion en agosto de 2026, lo que sugiere que la informacion puede ser especulativa o de un escenario hipotetico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Kimiko-2-BF16-GGUF
- Modelo base (BF16): https://huggingface.co/AMAImedia/Qwen3.8-27B-Kimiko-2-BF16
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pagina de recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guia de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
