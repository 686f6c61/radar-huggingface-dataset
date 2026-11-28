# mradermacher/Llama-3-Ko-8B-dare-ties-GGUF

## Resumen

Llama-3-Ko-8B-dare-ties-GGUF es la version cuantizada en formato GGUF del modelo kuotient/Llama-3-Ko-8B-dare-ties, un merge de modelos derivado de la familia Llama 3 y orientado al idioma coreano. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para la comunidad de inferencia local, y se publico el 31 de diciembre de 2024. El modelo resuelve el problema de desplegar un modelo de 8.000 millones de parametros especializado en coreano en hardware de consumo mediante compresion a 4-8 bits.

El modelo base es un merge generado con mergekit aplicando la tecnica DARE-TIES, que combina los pesos de varios modelos Llama 3 fine-tuneados para coreano con el objetivo de fusionar capacidades sin reentrenar. El resultado es un transformer denso de 8.030.261.248 parametros (8B) con licencia Llama 3, lo que impone restricciones de uso comercial heredadas de Meta. La relevancia actual radica en que ofrece una via practica de disponer de un modelo coreano de 8B ejecutable en GPU consumer, algo escaso en el ecosistema abierto.

Esta ficha describe exclusivamente la version GGUF distribuida por mradermacher. No se dispone de informacion sobre el proceso de entrenamiento del modelo base, los datasets utilizados ni los resultados de evaluacion, por lo que varios apartados tecnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3, merge DARE-TIES) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3; el autor no la declara) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | coreano (ko) |
| Licencia | Llama 3 (license: other, license_name: llama3) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base kuotient/Llama-3-Ko-8B-dare-ties es un merge construido con mergekit empleando el metodo DARE-TIES sobre modelos derivados de Llama 3. DARE (Drop And REscale) elimina selectivamente deltas de pesos redundantes antes de combinarlos, y TIES (Trim, Elect Sign, Merge) resuelve los conflictos de signo entre los modelos fusionados. El resultado es un transformer denso de 8B parametros con la tokenizacion y estructura de Llama 3, orientado a producir texto en coreano.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en los modelos originales fusionados. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y el autor indica que no ha generado cuantizaciones con imatrix o ponderadas para este modelo en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en coreano, con formato de chat heredado de Llama 3.
- Razonamiento basico y respuesta a instrucciones en coreano.
- Generacion de codigo y matematicas (capacidad heredada de los modelos Llama 3 fusionados, sin verificacion especifica en coreano).
- Capacidades multilingues limitadas: el modelo esta etiquetado unicamente para coreano; el ingles puede funcionar de forma residual por herencia de Llama 3, pero no esta declarado.
- Soporte de tool calling y function calling: no disponible (no declarado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano con un coste de inferencia bajo gracias a sus cuantizaciones de 4-5 GB, adecuado para desplegar en servidores modestos o en local para prototipos.
- Generacion de contenido editorial en coreano: redaccion de borradores, resumenes y reescritura de textos en coreano en flujos de trabajo asistidos, ejecutando el modelo en una unica GPU consumer.
- Chatbot local para usuarios coreanoparlantes: despliegue en estaciones de trabajo con llama.cpp u Ollama usando la cuantizacion Q4_K_M (5,0 GB), sin dependencia de servicios en la nube.
- Traduccion asistida y adaptacion de tono: uso como motor de reformulacion en coreano dentro de pipelines de localizacion, con revision humana posterior dado el riesgo de alucinacion.
- Prototipado de asistentes conversacionales: experimentacion rapida con un modelo de 8B en coreano antes de escalar a modelos mayores, aprovechando el formato GGUF para pruebas en CPU o GPU de gama media.
- Filtrado y clasificacion de texto en coreano: generacion de etiquetas, categorias o respuestas cortas en procesos batch donde el throughput prima sobre la precision absoluta.
- Educacion y practica de idiomas: generacion de ejercicios y respuestas en coreano en aplicaciones de aprendizaje, con cuantizaciones Q5_K_M o Q6_K para mayor fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB con Q2_K, 5,0 GB con Q4_K_M, 6,7 GB con Q6_K y 8,6 GB con Q8_0 (tamano del fichero; anadir margen para el contexto KV cache).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4-Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 8 GB o mas usando Q4_K_M; las cuantizaciones Q2_K y Q3_K permiten incluso GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El autor etiqueta el repo como endpoints_compatible.
- Latencia y throughput estimados: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3-Ko-8B-dare-ties-GGUF (este) | 8,03B | no disponible | coreano | Llama 3 | GGUF |
| kuotient/Llama-3-Ko-8B-dare-ties (base) | 8,03B | no disponible | coreano | Llama 3 | safetensors |
| Llama 3 8B Instruct (Meta) | 8,03B | 8.192 tokens | multilingue (no coreano nativo) | Llama 3 | safetensors, GGUF |
| Modelos coreanos de 7-8B de la comunidad (p. ej. variantes EEVE o Polyglot-Ko) | ~7-8B | variable | coreano | variable | variable |

La comparativa con alternativas coreanas especificas no puede completarse con datos verificados en la informacion proporcionada; los datos de Llama 3 8B Instruct se incluyen como referencia de la arquitectura subyacente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un merge de modelos Llama 3, hereda los sesgos de sus componentes originales, no evaluados en coreano.
- Riesgo de alucinacion: elevado en un modelo de 8B sin evaluacion publicada; no apto para produccion sin validacion humana en dominios sensibles.
- Limitaciones de contexto e idioma: solo se declara coreano; el contexto maximo no esta especificado y debe asumirse el de Llama 3 (8.192 tokens) con cautela, sin confirmacion del autor.
- Restricciones de licencia: licencia Llama 3, que impone condiciones de uso comercial (politica de uso aceptable de Meta, obligacion de atribucion y restricciones para empresas con mas de 700 millones de usuarios mensuales). Verificar antes de uso comercial.
- Cuantizaciones de baja calidad: Q2_K y Q3_K pueden degradar notablemente la coherencia en coreano; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- Ausencia de cuantizaciones imatrix: el autor no ha publicado versiones ponderadas, lo que limita la calidad en bits bajos frente a otros modelos del mismo publicador.
- Modelo de nicho con pocas descargas (73) y un solo like: sin validacion comunitaria amplia; tratar como experimental.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3-Ko-8B-dare-ties-GGUF
- Modelo base: https://huggingface.co/kuotient/Llama-3-Ko-8B-dare-ties
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3-Ko-8B-dare-ties-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit: https://github.com/arcee-ai/mergekit
