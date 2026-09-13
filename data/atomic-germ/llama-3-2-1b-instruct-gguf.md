# Atomic-Germ/Llama-3.2-1B-Instruct-GGUF

## Resumen

Atomic-Germ/Llama-3.2-1B-Instruct-GGUF es una publicacion de pesos en formato GGUF derivada de meta-llama/Llama-3.2-1B-Instruct, el modelo de 1.235.814.432 parametros (aproximadamente 1,24 mil millones) que Meta libero el 25 de septiembre de 2024 dentro de la familia Llama 3.2. El repositorio no entrena ni modifica el modelo original: se limita a redistribuir la version instruct ya ajustada por Meta convertida a GGUF en siete niveles de cuantizacion (16, 8, 6, 5, 4, 3 y 2 bits), lo que permite ejecutarla en CPU, en GPUs de gama baja y en dispositivos con memoria limitada.

La relevancia de esta ficha radica en su tamano: es el modelo mas pequeno de la familia Llama 3.2 con capacidades conversacionales y de tool calling, pensado para escenarios de inferencia local, prototipado rapido y despliegue en el borde. Frente a alternativas de peso similar, su interes principal es la compatibilidad con el ecosistema llama.cpp/Ollama y la licencia Llama 3.2 Community License, que autoriza uso comercial bajo condiciones.

Conviene senalar que el repositorio tiene cero descargas y cero likes en el momento de la consulta, que su model card reproduce texto de plantilla de Unsloth y que la fecha de creacion declarada en los metadatos (12 de septiembre de 2026) es inconsistente. Se trata, por tanto, de una copia de terceros sin validacion de la comunidad: para produccion es preferible acudir a los repositorios oficiales de Meta o a las cuantizaciones publicadas por el propio equipo de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con attention de consultas agrupadas (GQA), familia Llama 3.2 |
| Parametros totales | 1.235.814.432 (aproximadamente 1,24 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en este repositorio; Meta documenta 128.000 tokens para Llama 3.2 1B |
| Tipos de cuantizacion | GGUF en 16, 8, 6, 5, 4, 3 y 2 bits |
| Idiomas soportados | El repositorio declara unicamente ingles (tag `en`); Meta declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Llama 3.2 Community License (licencia comercial personalizada de Meta) |
| Formato de pesos | GGUF (repositorio etiquetado tambien como `transformers`) |
| Desarrollador del modelo base | Meta |
| Autor del repositorio GGUF | Atomic-Germ |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Tamano del repositorio | 24,3 GB (incluye todos los niveles de cuantizacion) |
| Pipeline | text-generation |
| Fecha de publicacion (metadatos) | 12 de septiembre de 2026 (fecha inconsistente, posterior a la consulta) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo con atencion de consultas agrupadas (Grouped-Query Attention, GQA), disenado por Meta para mejorar la escalabilidad de la inferencia reduciendo el numero de cabezas de clave y valor respecto a las cabezas de consulta. Meta indica que las versiones instruct se alinearon mediante supervised fine-tuning (SFT) y reinforcement learning with human feedback (RLHF) para ajustarse a preferencias humanas de utilidad y seguridad. Es un modelo estatico, entrenado sobre un dataset offline, sin actualizaciones posteriores a su publicacion.

No se dispone en la informacion proporcionada del numero exacto de tokens de preentrenamiento, de la composicion del dataset ni de los detalles de los conjuntos usados en SFT y RLHF para esta variante de 1B. El repositorio de Atomic-Germ no anade entrenamiento propio: su aportacion es exclusivamente la conversion a GGUF y la publicacion de multiples niveles de cuantizacion. La model card reproduce la plantilla de Unsloth, que menciona el uso de esa libreria para fine-tuning y exportacion, pero no documenta ninguna modificacion de pesos.

## Capacidades

- Generacion de texto conversacional en formato instruct (prompt/ respuesta), con soporte de plantilla de chat de Llama 3.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 1,24 mil millones de parametros.
- Capacidad declarada por Meta para casos de uso de dialogo multilingue, incluidos retrieval agentico y tareas de resumen.
- Soporte de tool calling y function calling heredado del modelo base instruct, util para agentes sencillos.
- Generacion de codigo basica y autocompletado, sin garantias de correccion en tareas complejas.
- Ejecucion local en CPU y GPU de gama baja gracias al formato GGUF y a las cuantizaciones de 2 a 8 bits.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode): es un modelo exclusivamente texto entrada / texto salida.
- Idiomas: el repositorio declara solo ingles; el modelo base admite oficialmente ocho idiomas adicionales segun Meta.

## Casos de uso

- Asistente conversacional embebido: con 1,24 mil millones de parametros y cuantizacion de 4 bits, el modelo ocupa menos de 1 GB de pesos y puede ejecutarse en un portatil o en una Raspberry Pi con llama.cpp, gestionando dialogos simples sin conexion a la nube.
- Clasificacion y etiquetado de texto a gran escala: util para etiquetar tickets, correos o resenas en lotes, donde el coste por inferencia y la latencia importan mas que la precision en tareas de razonamiento complejo.
- Preprocesado en pipelines RAG: puede reformular consultas de usuario, extraer entidades y decidir si una pregunta requiere recuperacion documental antes de pasarla a un modelo mayor.
- Generacion de codigo en scripts de automatizacion: adecuado para completar plantillas, generar expresiones regulares o escribir funciones cortas dentro de un IDE o un pipeline de CI/CD, con revision humana obligatoria.
- Prototipado y docencia: permite experimentar con cuantizacion, plantillas de chat y fine-tuning (por ejemplo con Unsloth) en una unica GPU de consumo o incluso en CPU.
- Traduccion ligera ingles-espanol y resumen de documentos cortos: el modelo base declara soporte de espanol, aunque las cuantizaciones de 2 y 3 bits degradan notablemente la calidad en estos idiomas.
- Moderacion y filtrado preliminar de contenido: como primera etapa de un sistema en cascada que derive los casos ambiguos a un modelo mayor.
- Agentes simples con tool calling: encadenamiento de una o dos llamadas a funciones (consultas a API, calculos, busquedas) en flujos de automatizacion domestica o de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Atomic-Germ no incluye tablas de evaluacion, y la búsqueda web no devolvio ninguna fuente tecnica relacionada con este modelo.

## Requisitos de hardware

Estimaciones orientativas para un modelo denso de 1,24 mil millones de parametros en formato GGUF (pesos + overhead de contexto moderado):

- VRAM/RAM estimada para los pesos: aproximadamente 2,5 GB en FP16, 1,3 GB en Q8, 1,0 GB en Q6, 0,85 GB en Q5, 0,7 GB en Q4, 0,55 GB en Q3 y 0,4 GB en Q2.
- A la memoria de pesos hay que sumar la cache KV, que crece con la longitud de contexto y con la precision de la misma; a contextos largos (decenas de miles de tokens) la cache puede superar ampliamente el tamano de los pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en Q4 o Q5 (GTX 1650, RTX 3050, RTX 4060). En FP16 basta una GPU con 6-8 GB (RTX 3060, RTX 2070). Las A100, H100 o RTX 4090 no aportan ventaja significativa porque el modelo esta limitado por CPU y ancho de banda en la mayoria de escenarios.
- Cabe sin problema en GPUs de consumo e integradas actuales, e incluso en CPU pura con 4-8 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y servidores compatibles con GGUF. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que para produccion con GPU conviene valorar los pesos safetensors originales en lugar del GGUF.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en el repositorio ni en las fuentes consultadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Atomic-Germ/Llama-3.2-1B-Instruct-GGUF (este) | 1,24 mil millones | No especificado en el repo | Llama 3.2 Community License | GGUF | 0 descargas, sin validacion de la comunidad |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 mil millones | 128.000 tokens segun Meta | Llama 3.2 Community License | safetensors | Repositorio oficial de Meta |
| Llama 3.2 3B Instruct | Aproximadamente 3,2 mil millones | 128.000 tokens segun Meta | Llama 3.2 Community License | safetensors, GGUF en repos de terceros | Repositorio oficial de Meta y cuantizaciones de Unsloth |
| Modelos abiertos de rango 1-2B de otros fabricantes (Qwen2.5, Gemma 2, Phi-3.5) | Entre 1,5 y 3,8 mil millones | Variable segun modelo | Licencias propias de cada fabricante | safetensors y GGUF | Repositorios oficiales de cada fabricante |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada. Para elegir entre estas alternativas conviene consultar las fichas oficiales de cada modelo y ejecutar una evaluacion propia sobre el caso de uso concreto.

## Limitaciones y advertencias

- Modelo de 1,24 mil millones de parametros: la capacidad de razonamiento, la fidelidad factual y el seguimiento de instrucciones complejas son notablemente inferiores a los de modelos de 7B o superiores. El riesgo de alucinacion es alto en preguntas factuales, calculos y tareas de varios pasos.
- Las cuantizaciones de 2 y 3 bits reducen de forma apreciable la calidad de las respuestas y pueden degradar el soporte multilingue y el formato de tool calling. Para uso serio se recomienda Q4 o superior.
- Idiomas: aunque Meta declara ocho idiomas soportados, este repositorio solo etiqueta ingles. El rendimiento en espanol no esta verificado y puede ser irregular.
- Licencia Llama 3.2 Community License: permite uso comercial con condiciones, incluida la obligacion de mostrar "Built with Llama" en determinados casos, el cumplimiento de la Acceptable Use Policy y una clausula especifica para productos con mas de 700 millones de usuarios mensuales. Es responsabilidad del integrador revisar el texto completo.
- Procedencia: el repositorio es una publicacion de terceros (Atomic-Germ) con 0 descargas y 0 likes. La model card es texto de plantilla de Unsloth y no documenta el proceso de cuantizacion ni incluye verificacion de integridad. Para produccion es preferible descargar los pesos desde Meta o desde los repositorios oficiales de Unsloth.
- Metadatos inconsistentes: la fecha de creacion declarada (12 de septiembre de 2026) es posterior a la fecha de consulta, lo que sugiere un error de registro y reduce la confianza en el resto de los metadatos.
- Sin benchmarks publicados para esta conversion concreta: no hay evidencia de que las cuantizaciones mantengan el comportamiento del modelo original.
- Sesgos: al derivar de un modelo entrenado con datos web a gran escala, hereda sesgos sociales, culturales y de representacion presentes en esos datos. No se documenta ningun proceso adicional de mitigacion en este repositorio.
- Contexto largo: aunque el modelo base admite ventanas muy amplias, el uso de contextos grandes en cuantizaciones bajas incrementa el consumo de memoria de la cache KV y puede degradar la coherencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Atomic-Germ/Llama-3.2-1B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Model card de Meta referenciada en el repositorio: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Coleccion de Unsloth para Llama 3.2: https://huggingface.co/collections/unsloth/llama-32-66f46afde4ca573864321a22
- Repositorio de modelos de Llama: https://github.com/meta-llama/llama-models
- Licencia Llama 3.2 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Recetas de uso de Llama: https://github.com/meta-llama/llama-recipes
- Repositorio de Llama 3: https://github.com/meta-llama/llama3
- Proyecto Unsloth: https://github.com/unslothai/unsloth
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Notebook de fine-tuning de Llama 3.2 en Colab: https://colab.research.google.com/drive/1Ys44kVvmeZtnICzWz0xgpRnrIOjZAuxp?usp=sharing
- Notebook conversacional (plantillas ShareGPT/ChatML/Vicuna): https://colab.research.google.com/drive/1Aau3lgPzeZKQ-98h69CCu1UJcvIBLmy2?usp=sharing
