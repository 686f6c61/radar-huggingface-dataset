# mradermacher/Gemma-SEA-LION-v4-4B-VL-i1-GGUF

## Resumen

Gemma-SEA-LION-v4-4B-VL-i1-GGUF es la version cuantizada en formato GGUF del modelo multimodal aisingapore/Gemma-SEA-LION-v4-4B-VL, un modelo vision-lenguaje desarrollado por AI Singapore sobre la base de Gemma 3 de Google. El modelo original combina capacidades de comprension de imagen y texto, y esta afinado especificamente para lenguas del sudeste asiatico, un nicho historicamente desatendido por los grandes modelos generalistas. Esta variante concreta la publica mradermacher, un conocido cuantizador de la comunidad, e incluye cuantizaciones de tipo i1 (imatrix) para facilitar su ejecucion en hardware de consumo.

El interes de esta ficha reside en que permite desplegar un modelo multimodal de aproximadamente 3.880 millones de parametros en equipos modestos mediante llama.cpp y herramientas compatibles, manteniendo el soporte de nueve idiomas (ingles, chino, vietnamita, indonesio, tailandes, filipino, tamil, malayo y birmano). Es relevante para desarrolladores que necesitan procesamiento de imagen y texto en lenguas del sudeste asiatico sin depender de infraestructura en la nube ni de modelos propietarios.

La licencia MIT del modelo base facilita su adopcion comercial, aunque conviene revisar los terminos heredados de la familia Gemma. El repositorio ocupa 48,4 GB en total por incluir todas las variantes de cuantizacion, pero cada fichero individual pesa entre 1,2 y 3,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), derivada de Gemma 3 |
| Parametros totales | 3.880.263.168 (~3,88 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, zh, vi, id, th, fil, ta, ms, my |
| Licencia | MIT |
| Formato de pesos | GGUF (con fichero imatrix y mmproj en el repositorio estatico) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 3, con un componente de vision que procesa imagenes y las proyecta al espacio de representaciones del modelo de lenguaje. AI Singapore lo ha afinado sobre Gemma 3 para reforzar el rendimiento en lenguas del sudeste asiatico, siguiendo la estela de la familia SEA-LION. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta variante es una cuantizacion con imatrix (i1) generada por mradermacher, que emplea un fichero de importancia para mejorar la calidad de las cuantizaciones de baja precision. El autor advierte que los ficheros mmproj necesarios para el procesamiento de vision se encuentran en el repositorio estatico hermano, no en este. Las cuantizaciones de menor tamano (IQ1, IQ2) degradan notablemente la calidad y solo deberian usarse cuando la memoria sea el factor limitante.

## Capacidades

- Generacion de texto y razonamiento conversacional en nueve idiomas del sudeste asiatico y el ingles.
- Comprension de imagenes (vision-lenguaje): descripcion, respuesta a preguntas visuales y analisis de contenido grafico.
- Conversacion multi-turno orientada a chat.
- Capacidades multilingues especificas para vietnamita, indonesio, tailandes, filipino, tamil, malayo y birmano, ademas de chino e ingles.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en mercados del sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en vietnamita, indonesio, tailandes o malayo sin necesidad de traductores intermedios, lo que reduce latencia y errores de traduccion en soporte regional.
- Analisis de imagenes en aplicaciones de comercio electronico: descripcion automatica de productos, extraccion de atributos visuales y generacion de fichas en idioma local a partir de fotografias.
- Moderacion de contenido multimodal: revision de imagenes y texto combinados en plataformas regionales, aprovechando la comprension de varias lenguas en un unico modelo.
- Digitalizacion de documentos con OCR asistido: lectura de documentos escaneados con texto en lenguas del sudeste asiatico y extraccion estructurada de la informacion.
- Asistentes educativos locales: tutoria en tamil, filipino o birmano con capacidad de interpretar diagramas e imagenes de libros de texto.
- Despliegue en el borde (edge) y entornos sin conectividad: gracias a las cuantizaciones de 2,5-3,3 GB, puede ejecutarse en portatiles y mini-PC para tareas de vision y texto en local, con privacidad de datos.
- Prototipado rapido de aplicaciones multimodales: al ser GGUF y compatible con llama.cpp, permite validar ideas en hardware de consumo antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,8 GB para cuantizaciones IQ1/IQ2, 2,0-2,6 GB para IQ3/Q4, y 2,9-3,3 GB para Q5/Q6, sin contar el fichero mmproj de vision ni el contexto adicional.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para cuantizaciones Q4; para mayor velocidad y contexto largo se recomienda RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores. En entornos profesionales, A100 o H100 no son necesarias por el reducido tamano del modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para vision es necesario cargar tambien el fichero mmproj del repositorio estatico.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Idiomas SEA | Licencia | Formato |
|---|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-4B-VL (este, cuantizado) | ~3,88 B | no disponible | Si | Si (9 idiomas) | MIT | GGUF |
| Gemma 3 4B (base original) | ~4 B | no disponible | Si | Limitado | Terminos Gemma | safetensors/GGUF |
| Modelos SEA-LION anteriores (texto) | Variable | no disponible | No | Si | MIT/variable | safetensors/GGUF |
| Qwen2.5-VL 3B | ~3 B | no disponible | Si | Parcial (chino/ingles) | Apache 2.0 | safetensors/GGUF |

La comparativa se limita a los datos disponibles; no se dispone de resultados de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Las cuantizaciones IQ1 e IQ2 degradan seriamente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate". Para produccion se recomienda Q4_K_M o superior.
- El procesamiento de vision requiere el fichero mmproj alojado en el repositorio estatico, no en este; su omision impide el uso multimodal.
- La licencia MIT del modelo base debe verificarse contra los terminos heredados de Gemma 3 de Google, que pueden imponer restricciones adicionales al uso comercial.
- Riesgo de alucinacion inherente a los modelos de ~4B, especialmente en tareas de razonamiento complejo o en lenguas de bajos recursos como el birmano o el tamil.
- Sesgos potenciales derivados de los datos de entrenamiento de Gemma 3 y del corpus de afinamiento de AI Singapore; no se documentan en la informacion disponible.
- La longitud de contexto no esta confirmada en la informacion proporcionada, lo que impide garantizar conversaciones de contexto muy largo.
- El modelo no esta pensado para tareas de alta precision (medicas, legales o financieras) sin supervision humana.
- El repositorio completo ocupa 48,4 GB; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-SEA-LION-v4-4B-VL-i1-GGUF
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-4B-VL
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Gemma-SEA-LION-v4-4B-VL-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Gemma-SEA-LION-v4-4B-VL-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
