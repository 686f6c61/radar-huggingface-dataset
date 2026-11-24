# mradermacher/Cent1-1B-GGUF

## Resumen

Cent1-1B es un modelo de lenguaje de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) desarrollado por CentLabs y especializado en tool calling, function calling y flujos de agente en el dominio financiero. La ficha que nos ocupa, `mradermacher/Cent1-1B-GGUF`, no es el modelo original sino la version cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp y ecosistemas compatibles. El modelo base es `CentLabs/Cent1-1B` y la etiqueta `qwen3` en los metadatos sugiere que la arquitectura deriva de la familia Qwen3.

El interes de esta publicacion radica en que permite ejecutar un modelo orientado a agentes y llamadas a funciones en hardware muy modesto: la cuantizacion Q4_K_M ocupa 1,2 GB y la Q2_K baja a 0,9 GB, lo que lo hace viable en GPUs de consumo, en CPU y en entornos embebidos. Con licencia Apache 2.0, es util para prototipado rapido de asistentes financieros, orquestacion de herramientas y pipelines de agentes donde el coste por token y la latencia importan mas que el rendimiento bruto en razonamiento complejo.

La informacion publicada por el autor de la cuantizacion es fundamentalmente tecnica sobre los ficheros GGUF generados; no se incluyen detalles sobre el entrenamiento, la longitud de contexto ni resultados de benchmarks del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, segun etiqueta del autor) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors/PyTorch |

## Arquitectura y entrenamiento

Los datos disponibles no detallan la arquitectura interna del modelo original. La etiqueta `qwen3` en los metadatos de la model card y la libreria `transformers` apuntan a una arquitectura transformer de la familia Qwen3, pero no se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se indica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado especifico para tool calling.

Lo unico verificable sobre el proceso de esta publicacion es la cuantizacion: mradermacher ha generado cuantizaciones estaticas (sin imatrix ni pesos ponderados, segun indica el propio autor) a partir del modelo base en formato Hugging Face, con `quantize_version: 2` y `output_tensor_quantised: 1`. El repo ocupa 16,0 GB en total por acumular todos los ficheros GGUF, aunque cada cuantizacion individual es mucho menor.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling y function calling: es la capacidad central del modelo segun sus etiquetas y el dominio para el que fue disenado.
- Soporte para flujos de agente y razonamiento multi-paso orientado a la invocacion de herramientas.
- Enfoque en el dominio financiero (etiqueta `financial`), lo que sugiere ajuste o entrenamiento orientado a tareas de ese sector.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue detras de APIs compatibles con OpenAI.
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente financiero conversacional: el modelo puede gestionar dialogos multi-turno en ingles sobre consultas financieras y derivar a herramientas externas cuando se requiere calculo o consulta de datos, aprovechando su ajuste al dominio.
- Orquestacion de agentes con function calling: util como "router" o planificador ligero que decide que herramienta invocar en cada paso de un pipeline multi-agente, con un coste de inferencia minimo.
- Prototipado rapido en portatiles: con la cuantizacion Q4_K_M (1,2 GB) se puede ejecutar en local con llama.cpp u Ollama para validar prompts y esquemas de herramientas antes de pasar a un modelo mayor.
- Backend de bajo coste para APIs internas: al ser compatible con endpoints y caber en una sola GPU de consumo, sirve para servir llamadas a funciones en entornos de desarrollo o staging sin incurrir en costes de GPU de datacenter.
- Extraccion estructurada de datos: dado su enfoque en function calling, puede usarse para convertir texto libre en llamadas a funciones con argumentos estructurados (por ejemplo, extraer campos de documentos financieros hacia un esquema JSON).
- Educacion y demos de tool calling: su tamano reducido y su licencia Apache 2.0 lo hacen adecuado para talleres, notebooks y demostraciones de agentes sin requisitos de hardware elevados.
- Clasificacion y enrutado de intenciones: en arquitecturas de enrutamiento, puede clasificar la intencion del usuario y despachar la peticion al modelo o herramienta adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 0,9 GB.
  - Q3_K_S / Q3_K_M: aproximadamente 1,0 GB.
  - Q3_K_L / IQ4_XS: aproximadamente 1,1 GB.
  - Q4_K_S / Q4_K_M: aproximadamente 1,2 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 1,3-1,4 GB.
  - Q6_K: aproximadamente 1,5 GB.
  - Q8_0: aproximadamente 1,9 GB.
  - f16: aproximadamente 3,5 GB.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y Q5; una RTX 3060, RTX 4060 o superior ofrece margen holgado. En datacenter, una A100 o H100 esta sobredimensionada para este modelo, pero permite servir muchas instancias concurrentes.
- Cabe en GPU de consumo: si, practicamente en todas las GPU modernas con 4 GB o mas, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI si se usa el formato original en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cent1-1B (esta ficha) | 1,72 B | no disponible | Apache 2.0 | GGUF | Especializado en tool calling financiero, solo ingles |
| Qwen3-1.7B | 1,7 B (aproximado, segun familia) | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Modelo base de la familia en la que se inspira; capacidades generales |
| Llama 3.2 1B | 1,2 B (aproximado) | no disponible en esta ficha | licencia Llama | GGUF, safetensors | Modelo generalista de tamano similar; no especializado en finanzas |

La comparativa con Qwen3-1.7B y Llama 3.2 1B es orientativa por tamano y categoria; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado ni documentado.
- Al ser un modelo de 1,7 B de parametros, su capacidad de razonamiento complejo y de conocimiento factual es limitada en comparacion con modelos de mayor tamano; el riesgo de alucinacion en consultas financieras es significativo y requiere validacion externa.
- No se documentan sesgos conocidos, pero al estar entrenado principalmente en ingles y en el dominio financiero, puede presentar sesgos culturales y de dominio.
- No hay informacion publicada sobre la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; para tool calling en produccion se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el modelo base; conviene revisar la model card original de CentLabs.
- El repo acumula 16,0 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.
- No se han publicado resultados de benchmarks, por lo que no se puede verificar su rendimiento en tareas de function calling frente a alternativas.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/Cent1-1B-GGUF
- Modelo base: https://huggingface.co/CentLabs/Cent1-1B
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Cent1-1B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
