# ewon13/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana 1.5 es una familia de modelos bilingües (coreano e inglés) desarrollada por Kakao Corp. La versión `kanana-1.5-8b-instruct-2505` es un modelo denso de 8.030 millones de parámetros, optimizado para instrucciones y conversación, con mejoras sustanciales en generación de código, razonamiento matemático y llamada a funciones respecto a la versión anterior de la familia. Esta ficha se centra en la variante `ewon13/kanana-1.5-8b-instruct-2505-Safe-DPO`, un fine-tune adicional realizado por un tercero (ewon13) que aplica un entrenamiento DPO (Direct Preference Optimization) orientado a seguridad, probablemente para reducir respuestas dañinas o no deseadas.

El modelo base soporta una ventana de contexto de 32.000 tokens, ampliable a 128.000, lo que lo hace adecuado para tareas que requieren manejo de documentos largos o conversaciones multi-turno extensas. Su arquitectura es un transformer decoder denso, similar a la familia Llama, y se distribuye en formato safetensors. La relevancia actual del modelo radica en que ofrece un rendimiento competitivo en tareas de programación y matemáticas con un tamaño moderado que puede ejecutarse en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (basado en Llama) |
| Parametros totales | 8.030.285.824 (8,03 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.000 tokens (extensible a 128.000) |
| Tipos de cuantizacion | no disponible (formato safetensors en fp16/bf16) |
| Idiomas soportados | coreano e ingles (segun documentacion de Kakao) |
| Licencia | no disponible (la model card no la especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `kanana-1.5-8b-instruct-2505` es un transformer decoder denso con arquitectura similar a Llama, entrenado por Kakao Corp con un enfoque bilingüe coreano-inglés. La version instruct fue afinada para seguir instrucciones y conversar, con enfasis en tareas de codigo, matematicas y function calling. No se dispone de detalles sobre el numero exacto de tokens de entrenamiento ni la composicion del dataset. La variante `Safe-DPO` de ewon13 anade una etapa adicional de Direct Preference Optimization, una tecnica de alineacion que ajusta el modelo para preferir respuestas seguras y rechazar contenido perjudicial, basandose en pares de respuestas preferidas y no preferidas. No hay informacion publica sobre los hiperparametros de este fine-tune ni sobre el dataset DPO utilizado.

## Capacidades

- Generacion de texto y conversacion multi-turno en coreano e ingles.
- Razonamiento matematico y resolucion de problemas numericos.
- Generacion, explicacion y depuracion de codigo en multiples lenguajes de programacion.
- Soporte de function calling (llamada a funciones) para integracion con herramientas externas y APIs.
- Capacidad de manejar contextos largos (32K nativo, 128K con extension) para documentos extensos o historiales de conversacion amplios.
- Alineacion adicional de seguridad mediante DPO, lo que reduce la probabilidad de generar contenido toxico o peligroso en comparacion con el modelo base.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con usuarios en coreano o ingles, manteniendo el contexto durante 32K tokens, lo que permite recordar detalles de interacciones largas sin perder informacion relevante.
- Asistente de programacion en entornos de desarrollo: gracias a su soporte de function calling y su capacidad para generar y explicar codigo, puede integrarse en IDE o pipelines de CI/CD para sugerir implementaciones, revisar fragmentos o generar tests unitarios.
- Analisis de documentos legales o academicos: con la ventana de contexto ampliable a 128K, puede resumir o extraer informacion de contratos, articulos cientificos o informes extensos sin necesidad de dividir el texto en fragmentos.
- Tutor de matematicas para estudiantes: el modelo puede resolver problemas paso a paso y explicar el razonamiento, siendo util en plataformas educativas o chatbots de apoyo al estudio.
- Traduccion y transcripcion bilingüe: al estar entrenado en coreano e ingles, puede traducir textos entre ambos idiomas con conocimiento de matices culturales y tecnicos, aunque su rendimiento en otros idiomas es limitado.
- Agente autonomo para tareas de oficina: combinado con function calling, puede interactuar con calendarios, correos electronicos o bases de datos para programar citas, redactar respuestas o consultar informacion, ejecutando acciones en nombre del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante `Safe-DPO` en la informacion disponible. El modelo base `kanana-1.5-8b-instruct-2505` declara mejoras en coding, matematicas y function calling respecto a versiones anteriores de Kanana, pero no se proporcionan cifras concretas en los resultados de busqueda consultados. No se dispone de datos comparativos con otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, el modelo requiere aproximadamente 16 GB de VRAM (8B parametros × 2 bytes). Con cuantizacion INT4 (no disponible oficialmente, pero posible mediante herramientas como llama.cpp o GPTQ), se reduciria a unos 4-5 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) puede ejecutar el modelo en fp16 sin problemas. Para consumer GPU con 8-12 GB, se requiere cuantizacion INT8 o INT4.
- Si cabe en consumer GPU: si, en GPUs de 16 GB o mas (RTX 4080, 4090) en precision completa; en GPUs de 8-12 GB solo con cuantizacion.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI (Text Generation Inference) o llama.cpp (tras convertir a GGUF). Tambien es compatible con Ollama si se genera el archivo Modelfile.
- Latencia y throughput: no se han publicado mediciones oficiales. Para un modelo de 8B en una RTX 4090, se espera una generacion de entre 50 y 100 tokens por segundo en fp16, dependiendo de la implementacion y el tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kanana 1.5 8B Instruct (base) | 8,03 B | 32K (128K ext.) | coreano, ingles | no disponible | Modelo original de Kakao |
| ewon13/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03 B | 32K (128K ext.) | coreano, ingles | no disponible | Variante con DPO de seguridad |
| Llama 3.1 8B Instruct | 8,03 B | 128K | multilingue (principalmente ingles) | Llama 3.1 Community License | Referencia comun en 8B |
| Qwen 2.5 7B Instruct | 7,6 B | 128K | multilingue (incluye chino e ingles) | Apache 2.0 | Alternativa open source con buen rendimiento en coding |

La comparativa se basa en caracteristicas generales, ya que no hay datos de rendimiento publicados para la variante Safe-DPO. Llama 3.1 y Qwen 2.5 son alternativas con soporte multilingue mas amplio, mientras que Kanana se especializa en el par coreano-ingles.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada en la model card, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor (ewon13) o con Kakao Corp para aclarar los terminos.
- No se ha publicado informacion sobre sesgos o riesgos especificos de esta variante. Al ser un fine-tune de un modelo entrenado principalmente en coreano e ingles, puede presentar sesgos culturales o linguisticos de esas regiones.
- Riesgo de alucinacion inherente a todos los modelos generativos: puede inventar hechos, citas o codigo que parece plausible pero es incorrecto. La capa DPO reduce contenido dañino pero no elimina las alucinaciones.
- El soporte de idiomas fuera del coreano e ingles es limitado o inexistente, lo que restringe su uso en entornos multilinguees amplios.
- La ventana de contexto de 32K es ampliable a 128K, pero la extension puede degradar el rendimiento en tareas que requieren recuperacion precisa de informacion en posiciones muy distantes.
- No hay garantia de que el fine-tune DPO mantenga todas las capacidades del modelo base; podria haber una ligera regresion en tareas de coding o matematicas a cambio de mayor seguridad.

## Enlaces

- Modelo en Hugging Face (variante Safe-DPO): https://huggingface.co/ewon13/kanana-1.5-8b-instruct-2505-Safe-DPO
- Modelo base de Kakao en Hugging Face: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio GitHub de Kanana: https://github.com/kakao/kanana
- Ficha del modelo en AIBase: https://model.aibase.com/models/details/1927649989316841472
- Modelo variante Persona-Merged (tambien de ewon13): https://huggingface.co/ewon13/kanana-1.5-8b-instruct-2505-Persona-Merged
