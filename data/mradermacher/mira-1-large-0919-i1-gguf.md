# mradermacher/Mira-1-large-0919-i1-GGUF

## Resumen

Mira-1-large-0919-i1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Smilyai-labs/Mira-1-large-0919, publicadas por el usuario mradermacher. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del modelo original, que segun las etiquetas de HuggingFace pertenece a la familia qwen3 y fue ajustado mediante LoRA (base_model:adapter). El recuento real de parametros en safetensors es de 14.768.307.200 (aproximadamente 14,77 mil millones), lo que situa al modelo en la categoria de 14B densos.

El valor anadido de este repositorio esta en las cuantizaciones de tipo i1 (imatrix), generadas con la libreria llama.cpp y calibradas con un fichero imatrix propio del modelo. Frente a las cuantizaciones estaticas publicadas en el repositorio hermano, las variantes i1 suelen ofrecer una mejor relacion tamano/calidad en rangos bajos y medios, algo relevante cuando se quiere ejecutar un modelo de casi 15B en GPUs de consumo. El repositorio ocupa 154,6 GB en total porque incluye todas las variantes, desde IQ2_M (5,4 GB) hasta Q6_K (12,2 GB), ademas del fichero imatrix.

Es relevante ahora porque permite desplegar un modelo con etiquetas de razonamiento, codigo, conversacion y "personality" en hardware modesto sin depender de APIs externas. El modelo declara soporte unicamente de ingles y una licencia de tipo "other", lo que obliga a revisar las condiciones de uso comercial antes de integrarlo en produccion. No hay datos publicos de benchmarks, contexto maximo ni composicion del dataset en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas de HuggingFace: qwen3, transformers) |
| Parametros totales | 14.768.307.200 (14,77B, dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-imatrix: IQ2_M, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, IQ4_NL, Q4_K_S, Q4_K_M, Q6_K (mas fichero imatrix); existen tambien quants estaticos en el repo hermano |
| Idiomas soportados | en (ingles) |
| Licencia | other (terminos concretos no disponibles) |
| Formato de pesos | GGUF |
| Modelo base | Smilyai-labs/Mira-1-large-0919 |
| Tipo de ajuste | LoRA (base_model:adapter) segun metadatos |
| Libreria declarada | transformers |
| Tamano del repositorio | 154,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-19 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset. Las etiquetas del repositorio apuntan a la familia qwen3 y el campo base_model:adapter indica que el modelo original fue creado mediante un ajuste LoRA sobre una base ya entrenada, no mediante un entrenamiento completo desde cero. El recuento de parametros (14,77B) es coherente con un transformer denso de esa escala, pero no se ha publicado confirmacion explicita en la informacion disponible.

En lo que respecta a este repositorio concreto, el "entrenamiento" no aplica: mradermacher realiza cuantizacion de pesos. Se han generado cuantizaciones ponderadas con imatrix (el autor indica "output_tensor_quantised: 1" y "convert_type: hf"), lo que implica que los tensores se convirtieron desde el formato HuggingFace a GGUF antes de cuantizarse. El fichero imatrix (0,1 GB) se incluye para que terceros puedan generar sus propias cuantizaciones. Las cuantizaciones IQ utilizan calibracion basada en importancia por tensor, lo que mejora la perplejidad en tamanos pequenos frente a las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, segun las etiquetas "conversational" y "en".
- Razonamiento explicito (etiqueta "reasoning"), presumiblemente con modos de pensamiento heredados de la familia base, aunque no se documenta el formato.
- Generacion de codigo (etiqueta "code").
- Modelado de "personality", es decir, un estilo de respuesta con caracter propio definido por el ajuste LoRA original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, mas alla de la etiqueta generica de razonamiento.
- Capacidades multilingues: limitadas al ingles declarado; no se documentan otros idiomas.
- Capacidades de vision, audio o multimodalidad: no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo se puede ejecutar con llama.cpp u Ollama en una GPU de consumo usando el quant Q4_K_M (9,1 GB), ofreciendo un asistente con "personalidad" definida sin enviar datos a servicios externos.
- Generacion de codigo en equipos con hardware limitado: la etiqueta "code" y el tamano de 14B permiten usarlo como autocompletado o generador de funciones en local, integrdo en editores via servidores compatibles con OpenAI API.
- Prototipado de razonamiento paso a paso: gracias a la etiqueta "reasoning", puede emplearse para generar cadenas de razonamiento en tareas de analisis, con la salvedad de que no hay benchmarks publicados que cuantifiquen su precision.
- Fine-tuning adicional sobre la base cuantizada: el fichero imatrix y las distintas variantes facilitan experimentar con tecnicas de cuantizacion propia (por ejemplo, IQ4_XS o Q5_K_M) sin partir del modelo completo.
- Despliegue en portatiles con GPU de gama media: la variante IQ2_M (5,4 GB) y Q3_K_M (7,4 GB) permiten ejecutar el modelo en GPUs con 8 GB de VRAM, utile para demos y evaluacion offline.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir un repositorio hermano con quants estaticos, este repositorio sirve para medir empíricamente la diferencia de calidad entre cuantizacion i1 e estatica sobre el mismo modelo.
- Chatbots con memoria de contexto: aunque la longitud de contexto no esta documentada, el formato GGUF permite configurar el tamano de contexto en el momento de la carga, ajustandolo a la VRAM disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web realizada no contienen datos tecnicos sobre este modelo (los enlaces devueltos tratan sobre ofertas de empleo, Pinterest y gramatica de SAT, y no son relevantes).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas overhead de contexto y KV cache. Orientativamente: IQ2_M ~5,4 GB, IQ3_M ~7,0 GB, Q4_K_S ~8,7 GB, Q4_K_M ~9,1 GB, Q6_K ~12,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 para las variantes Q4 y Q6; A100, H100 o L40S para despliegues multi-usuario con contextos largos.
- Cabe en GPU de consumo: si. Las variantes IQ2_M e IQ3_M caben en GPUs de 6-8 GB; Q4_K_M es la opcion recomendada para GPUs de 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para GGUF, aunque vLLM ofrece soporte experimental de GGUF en algunas versiones.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.
- Nota: con contexto largo la KV cache puede crecer de forma significativa; conviene reservar VRAM adicional sobre el tamano del fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Mira-1-large-0919-i1-GGUF (este) | 14,77B (base) | no disponible | GGUF (i1/imatrix) | other | Publico en HuggingFace |
| mradermacher/Mira-1-large-0919-GGUF | 14,77B (base) | no disponible | GGUF (quants estaticos) | other | Publico en HuggingFace |
| Smilyai-labs/Mira-1-large-0919 | 14,77B | no disponible | safetensors (transformers) | other | Publico en HuggingFace |

No se dispone de datos de rendimiento ni de contexto de alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con otros modelos de 14B. La unica comparacion factible es entre las tres variantes del mismo modelo (original, quants estaticos y quants i1).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composicion del dataset de ajuste, no se puede evaluar el sesgo del modelo.
- Riesgo de alucinacion: no cuantificado. No hay benchmarks ni evaluaciones publicadas que permitan estimarlo.
- Limitacion de idioma: el modelo declara unicamente ingles ("en"), por lo que su uso en castellano u otros idiomas puede degradar la calidad de forma notable.
- Longitud de contexto: no documentada, lo que dificulta planificar aplicaciones que dependan de ventanas largas.
- Licencia "other": no se especifican los terminos. Es imprescindible revisar la licencia del modelo base (Smilyai-labs/Mira-1-large-0919) antes de cualquier uso comercial.
- Procedencia del ajuste: al ser un LoRA sobre una base de la familia qwen3, se heredan las condiciones de licencia de dicha base, que no se detallan en la informacion disponible.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y la fecha de creacion registrada (2026-09-19) resulta anomala, por lo que no existe validacion de la comunidad.
- Estado del arte cambiante: la fecha del modelo y la ausencia de evaluaciones impiden saber si sigue siendo competitivo.
- Cuantizaciones de baja precision: las variantes IQ2_M y Q2_K (5,4-5,9 GB) reducen la calidad de forma perceptible; el propio autor recomienda evitar Q2_K en favor de IQ3_XXS.
- Repositorio pesado: 154,6 GB en total, por lo que conviene descargar unicamente el fichero GGUF de la variante deseada.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Mira-1-large-0919-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/Mira-1-large-0919-GGUF
- Modelo base: https://huggingface.co/Smilyai-labs/Mira-1-large-0919
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#Mira-1-large-0919-i1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- No se han encontrado papers, blogs tecnicos ni demos adicionales en la busqueda web realizada; los resultados devueltos no eran relevantes para este modelo.
