# mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-i1-GGUF

## Resumen

LFM2.5-24B-A2B-Uncensored-BF16-i1-GGUF es una cuantizacion en formato GGUF del modelo LFM2.5-24B-A2B-Uncensored-BF16, publicado por el usuario mradermacher en Hugging Face. Se trata de una version "uncensored" (sin el alineamiento de seguridad habitual) del modelo LFM2.5-24B-A2B, que por su nomenclatura corresponde a la familia LFM (Liquid Foundation Models) de Liquid AI, con 24.000 millones de parametros totales y un diseno de tipo mixture-of-experts (MoE) con aproximadamente 2.000 millones de parametros activos, segun indica el sufijo "A2B".

El repositorio contiene unicamente pesos cuantizados en formato GGUF, generados con el metodo i1 (imatrix) de llama.cpp, lo que permite ejecutar el modelo en hardware de consumo mediante herramientas compatibles con GGUF como llama.cpp, Ollama o LM Studio. El tamano del repositorio es de 53,9 GB, coherente con la publicacion de multiples variantes de cuantizacion (desde IQ1_S hasta Q6_K) sobre un modelo base de aproximadamente 24.000 millones de parametros.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras cuantizaciones disponibles de la familia LFM2.5 en su variante de 24B con arquitectura MoE; por otro, advierte de que se trata de una version sin censura, con implicaciones eticas y legales que deben considerarse antes de cualquier uso en produccion. La informacion publica disponible es muy limitada: no hay model card detallada, ni datos de benchmarks, ni licencia explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts), segun nomenclatura "A2B"; detalles no disponibles |
| Parametros totales | 23.971.587.712 (aproximadamente 24B) |
| Parametros activos | aproximadamente 2B (inferido del sufijo "A2B"); no confirmado oficialmente |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix de llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no permite confirmar los detalles arquitectonicos del modelo base. La nomenclatura "LFM2.5-24B-A2B" sugiere que se trata de un transformer con capas de mezcla de expertos (MoE), con 24.000 millones de parametros totales y aproximadamente 2.000 millones activos por token, un patron habitual en modelos disenados para inference eficiente. No obstante, no se especifica el numero de expertos, el tamano de cada uno, la estrategia de enrutamiento ni si incorpora innovaciones como atencion lineal o capas hibridas.

Respecto al entrenamiento, no hay datos publicados sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. La variante "Uncensored" implica que el modelo base ha sido modificado para eliminar o reducir los mecanismos de rechazo y alineamiento de seguridad, pero se desconoce el metodo exacto empleado (fine-tuning con datos sin filtrar, abliteration u otras tecnicas). Las cuantizaciones i1 han sido generadas con matrices de importancia (imatrix) para preservar la calidad en tasas de bits bajas, un proceso estandar en el ecosistema llama.cpp.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades esperables en un modelo de 24B de la familia LFM, aunque no confirmadas por benchmarks publicos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Modo "uncensored": el modelo evita los rechazos tipicos de seguridad, lo que permite generar contenido que los modelos alineados bloquearian.
- Capacidades de vision o audio: no disponible; no se mencionan.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin censura frente a uno alineado, comparando tasas de rechazo, sesgos y calidad en dominios sensibles. Es util en entornos controlados de evaluacion de riesgos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos alineados suelen negarse. El contexto conversacional y el tamano de 24B permiten mantener coherencia en textos largos.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones IQ2/IQ3/IQ4, el modelo puede ejecutarse en GPUs con 8-24 GB de VRAM mediante llama.cpp u Ollama, lo que facilita experimentacion sin infraestructura cloud.
- Analisis de textos sensibles en entornos cerrados: procesamiento de documentos con contenido delicado (informes medicos, legales o de seguridad) donde un modelo censurado podria rechazar la tarea. Requiere aislamiento y cumplimiento normativo.
- Prototipado rapido de asistentes conversacionales: el formato GGUF y la compatibilidad con endpoints permiten integrar el modelo en aplicaciones locales de chat para pruebas de concepto.
- Generacion de datos sinteticos para entrenamiento: en pipelines de aumento de datos donde se necesita diversidad estilistica y tematica, incluyendo contenido que los modelos alineados filtran.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - IQ1_S / IQ1_M: en torno a 7-9 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K: en torno a 8-10 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 11-13 GB.
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 14-16 GB.
  - Q5_K_S / Q5_K_M: en torno a 17-19 GB.
  - Q6_K: en torno a 20-22 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4-Q6; RTX 3090/4080 (16-24 GB) para Q4; GPUs de 8-12 GB (RTX 3060, 4060 Ti) para IQ2/IQ3. Para A100/H100 no es necesario por el reducido numero de parametros activos, pero permiten mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones, especialmente IQ2-IQ4 en GPUs de 8-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles. Al ser MoE con aproximadamente 2B activos, se espera una velocidad de generacion notablemente superior a la de un modelo denso de 24B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Uncensored (este) | 24B totales / ~2B activos | no disponible | no disponible | GGUF | Hugging Face |
| LFM2.5-24B-A2B (base, alineado) | 24B totales / ~2B activos | no disponible | no disponible | safetensors/BF16 | Hugging Face (referenciado) |
| Mixtral 8x7B | 46,7B totales / 12,9B activos | 32k | Apache 2.0 | safetensors, GGUF | Amplia |
| Qwen2.5-32B | 32B densos | 128k | Apache 2.0 | safetensors, GGUF | Amplia |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo LFM2.5 que permitan una confrontacion cuantitativa con Mixtral o Qwen2.5. La principal diferencia radica en el numero de parametros activos (~2B), que lo situa en una categoria de eficiencia superior a los MoE convencionales.

## Limitaciones y advertencias

- Ausencia de model card detallada: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni evaluaciones, lo que dificulta la evaluacion de riesgos.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa con aparente seguridad; la falta de benchmarks impide estimar su fiabilidad.
- Version "uncensored": el modelo puede producir contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Licencia no especificada: la ausencia de licencia explicita impide confirmar si el uso comercial esta permitido; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto real y el soporte multilingue.
- Cadena de responsabilidad: al ser una cuantizacion de un modelo "uncensored" de un tercero, el autor del GGUF no garantiza la calidad ni la seguridad del modelo base.
- Formato GGUF unicamente: no se incluyen pesos en safetensors en este repositorio; para fine-tuning o conversion a otros formatos hay que acudir al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-i1-GGUF
- Modelo base referenciado: https://huggingface.co/frstofrhx/LFM2.5-24B-A2B-Uncensored-BF16
- Herramienta de cuantizacion (llama.cpp): https://github.com/ggerganov/llama.cpp
- Documentacion de Ollama: https://ollama.com
- Liquid AI (familia LFM): https://www.liquid.ai
