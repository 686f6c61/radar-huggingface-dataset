# mradermacher/KuroCortex-8B-i1-GGUF

## Resumen

KuroCortex-8B-i1-GGUF es una cuantizacion en formato GGUF del modelo engenho-ai/KuroCortex-8B, un transformer denso de 8.190.735.360 parametros (aproximadamente 8,19 mil millones) desarrollado por engenho-ai dentro de la denominada "linha-kuro". El modelo esta orientado a tareas de razonamiento y orquestacion, con enfasis declarado en conversacion multi-turno y capacidades de orquestacion de agentes. Esta version concreta la publica mradermacher, especialista en cuantizaciones GGUF con metodo imatrix, y esta pensada para ejecucion local mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~8B en hardware de consumo, algo inviable con los pesos originales en precision completa. El repositorio incluye cuantizaciones i1 (imatrix) en varios niveles de compresion, desde Q2_K hasta Q6_K, lo que abarca desde ~3,4 GB hasta el rango de los 6-7 GB, y permite elegir el equilibrio entre calidad y huella de memoria.

La informacion publica disponible es limitada: la model card del cuantizador no documenta arquitectura detallada, datos de entrenamiento ni benchmarks del modelo base. Los datos tecnicos verificables se reducen a parametros, licencia, idiomas declarados y el conjunto de cuantizaciones ofrecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante en la informacion disponible) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | Portugues (pt, pt-br), ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base engenho-ai/KuroCortex-8B. Por el numero de parametros (8,19 mil millones) y la etiqueta `transformers`, se trata de un transformer denso de escala 8B, pero no se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion (MHA/GQA/MQA) ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similar.

Lo unico verificable sobre el proceso de esta version es la cuantizacion: mradermacher ha generado cuantizaciones i1 (imatrix) partiendo de los pesos en formato Hugging Face (`convert_type: hf`), usando un fichero imatrix propio (`KuroCortex-8B.imatrix.gguf`, 0,1 GB) para ponderar la importancia de los tensores durante la cuantizacion. El autor indica `quantize_version: 2` y `output_tensor_quantised: 1`. Las etiquetas del modelo base (`reasoning`, `orchestration`, `linha-kuro`) sugieren un ajuste orientado a razonamiento y orquestacion de agentes, pero no hay documentacion tecnica que lo respalde con datos.

## Capacidades

- Generacion de texto conversacional en portugues, ingles y espanol, segun los idiomas declarados en la model card.
- Razonamiento y orquestacion: las etiquetas del modelo base (`reasoning`, `orchestration`) apuntan a capacidades de razonamiento multi-paso y coordinacion de subtareas, aunque no se documentan con detalle.
- Conversacion multi-turno: la etiqueta `conversational` indica soporte de dialogos, si bien se desconoce el formato de plantilla de chat exacto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: declaradas por etiquetas, sin especificacion tecnica.
- Capacidades multilingues: limitadas a pt, en y es.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional en portugues de Brasil: el modelo declara soporte nativo de pt-br, por lo que puede emplearse en atencion al cliente o asistentes internos para ese mercado sin depender de traduccion intermedia. La cuantizacion Q4_K_M (~5 GB) permite desplegarlo en una unica GPU de consumo.
- Asistente de codigo y automatizacion en ingles: con 8,19B de parametros y licencia Apache 2.0, puede integrarse en entornos de desarrollo para generacion de fragmentos, explicacion de codigo y refactorizacion, ejecutandose localmente con llama.cpp u Ollama.
- Orquestacion de agentes en pipelines de automatizacion: la etiqueta `orchestration` sugiere su uso como planificador que descompone tareas y delega en herramientas o submodelos. Requiere validacion empirica, ya que no hay benchmarks publicados.
- Razonamiento multi-paso en entornos con requisitos de privacidad: al ser un modelo local de ~8B en GGUF, puede desplegarse en infraestructura propia sin enviar datos a terceros, adecuado para sectores regulados.
- Prototipado rapido y evaluacion: el conjunto de cuantizaciones desde IQ1_M hasta Q6_K permite probar el modelo en portatiles con 8-16 GB de RAM o en GPUs de gama media antes de comprometerse con hardware mayor.
- Generacion de contenido multilingue pt/en/es: util para equipos que operan en los tres idiomas y necesitan un unico modelo con licencia permisiva para uso comercial.
- Fine-tuning sobre la base: la licencia Apache 2.0 y la disponibilidad de los pesos originales en safetensors permiten ajuste fino posterior para dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion (tamanos de fichero declarados por el autor):
  - i1-Q2_K: 3,4 GB
  - i1-IQ3_M: 4,0 GB
  - Resto de cuantizaciones (Q3_K_M a Q6_K): no se detalla el tamano exacto en la informacion disponible, pero por escala tipica de un modelo 8B se situan aproximadamente entre 4 y 7 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 o cualquier GPU profesional (A10, L4, A100, H100) pueden alojar las cuantizaciones de mayor calidad.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4_K_M e inferiores caben en GPUs con 8 GB de VRAM; las Q5/Q6 requieren 12-16 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF (endpoints_compatible segun las etiquetas). vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos motores habria que usar los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KuroCortex-8B (i1-GGUF) | 8,19B | No disponible | Apache 2.0 | GGUF | Enfoque declarado en razonamiento y orquestacion; idiomas pt/en/es |
| Llama 3.1 8B | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Referencia generalista; contexto y benchmarks ampliamente documentados |
| Qwen2.5 7B | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue amplio, licencia permisiva, benchmarks publicos |
| Mistral 7B v0.3 | 7,24B | 32K | Apache 2.0 | safetensors, GGUF | Base solida para fine-tuning y despliegue local |

La comparacion con Llama 3.1 8B, Qwen2.5 7B y Mistral 7B v0.3 se ofrece como referencia de categoria (modelos densos de ~7-8B con licencia permisiva y disponibilidad en GGUF). No se dispone de datos de rendimiento de KuroCortex-8B que permitan una comparacion cuantitativa; la ventaja diferencial declarada es el enfoque en razonamiento/orquestacion y el soporte nativo de portugues de Brasil.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento, codigo o matemáticas. Cualquier decision de produccion deberia basarse en evaluacion propia.
- Documentacion tecnica muy escasa: se desconoce la longitud de contexto, la plantilla de chat, los datos de entrenamiento y el proceso de alineacion. Esto complica la integracion correcta en pipelines.
- Riesgo de alucinacion: inherente a modelos de 8B sin documentacion de mitigaciones (RLHF/DPO no confirmados).
- Sesgos: no documentados. Al estar entrenado presumiblemente con datos en pt/en/es, puede presentar sesgos culturales y linguisticos de esas fuentes.
- Limitacion idiomatica: solo se declaran pt, en y es; el rendimiento en otros idiomas no esta garantizado.
- Cuantizaciones de baja calidad: IQ1_M, IQ1_S, IQ2_XXS y Q2_K degradan notablemente la perplejidad; el propio autor sugiere que IQ3_XXS es preferible a Q2_K. Para produccion, se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar que el modelo base no imponga restricciones adicionales (la model card del cuantizador no las menciona).
- Repositorio sin descargas ni likes en el momento de la consulta: no hay senal de validacion por parte de la comunidad.
- Fecha de creacion declarada (2026-11-27): conviene verificar la vigencia y posibles actualizaciones del modelo base.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/KuroCortex-8B-i1-GGUF
- Modelo base: https://huggingface.co/engenho-ai/KuroCortex-8B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/KuroCortex-8B-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#KuroCortex-8B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
