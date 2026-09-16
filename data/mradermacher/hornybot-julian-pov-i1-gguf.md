# mradermacher/Hornybot-Julian-POV-i1-GGUF

## Resumen

Hornybot-Julian-POV-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher (nethype GmbH) a partir del modelo axiomofmind/Hornybot-Julian-POV. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del modelo base a formatos compatibles con llama.cpp, en este caso mediante la variante i1 (imatrix), que calcula una matriz de importancia para reducir la pérdida de calidad en cuantizaciones agresivas. El modelo base declara 8.953.803.264 parámetros (8,95 B) según los datos de safetensors, lo que lo sitúa en la gama de 8-9 B, apta para GPU de consumo.

El modelo está orientado a conversación y roleplay en primera persona, con etiquetas explícitas de contenido adulto y un único idioma declarado, el inglés. Los tags del repositorio identifican la familia del modelo base como qwen3.5, aunque la información disponible no detalla la arquitectura interna, la longitud de contexto ni el proceso de entrenamiento. La licencia no aparece especificada en el repositorio de cuantización.

Su relevancia práctica es de tipo operativo: agrupa 26 archivos GGUF con niveles de cuantización desde IQ1_S (2,8 GB) hasta Q6_K (7,5 GB), lo que permite desplegar el mismo modelo en hardware muy dispar, desde equipos con poca VRAM hasta GPU de 24 GB ejecutando la variante casi sin pérdida. El repositorio ocupa 110,2 GB en total y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; los tags del repositorio indican la familia "qwen3.5" para el modelo base |
| Parametros totales | 8.953.803.264 (8,95 B), dato de safetensors del modelo base |
| Parametros activos | no disponible; no se indica que el modelo sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Longitud de contexto | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 110,2 GB (incluye todos los quants y el archivo imatrix) |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El unico dato estructural es la etiqueta "qwen3.5" incluida en los tags del repositorio de cuantizacion, que apunta a la familia Qwen como origen, y el recuento de parametros de safetensors, 8.953.803.264. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo que si esta documentado es el proceso de cuantizacion. mradermacher genera cuantizaciones "i1", tambien llamadas weighted o imatrix, que parten de un archivo de matriz de importancia (imatrix) generado a partir de texto de calibracion; ese archivo se incluye en el repositorio (Hornybot-Julian-POV.imatrix.gguf, 0,1 GB) para que cualquier usuario pueda crear sus propias cuantizaciones. La model card indica ademas que se trata de un modelo de vision y que los archivos mmproj, si existen, se encuentran en el repositorio estatico del mismo modelo. El pipeline de conversion declarado es hf, con quantize_version 2 y output_tensor_quantised 1.

## Capacidades

- Generacion de texto conversacional en ingles, con orientacion a dialogo multi-turno.
- Roleplay en primera persona (first-person), segun los tags del repositorio; el modelo esta ajustado para narrar desde la perspectiva de un personaje.
- Contenido adulto explicito, declarado en los tags del modelo base.
- Escritura creativa y narrativa de ficcion: descripcion de escenas, dialogos y continuidad de personaje.
- Compatibilidad con llama.cpp y con todo el ecosistema de inferencia GGUF derivado (Ollama, LM Studio, koboldcpp, text-generation-webui, entre otros).
- Posible soporte de vision: la model card afirma que es un modelo de vision y remite a los archivos mmproj del repositorio estatico, aunque no se detalla la naturaleza de esa capacidad.
- Tool calling / function calling: no disponible.
- Comportamiento agentico y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Despliegue de un chatbot de rol adulto en local: el modelo puede ejecutarse con llama.cpp u Ollama en una GPU de consumo usando los quants Q4_K_M (5,7 GB) o IQ4_XS (5,3 GB), sin enviar conversaciones a servicios externos.
- Aplicacion de compania conversacional: el ajuste en primera persona y el enfoque conversacional permiten mantener personajes con voz consistente a lo largo de sesiones largas, siempre que la ventana de contexto del modelo base lo permita (dato no disponible).
- Generacion de guiones y ficcion interactiva: util como motor de dialogo en novelas visuales o juegos de texto, donde cada respuesta debe mantener el tono y la perspectiva de un personaje concreto.
- Creacion de datasets sinteticos de dialogo: se puede emplear para generar corpus conversacionales en ingles con control de estilo y perspectiva, filtrando despues el contenido explicito si no es deseado.
- Pruebas de cuantizacion y evaluacion de degradacion: al ofrecer 26 niveles de cuantizacion del mismo modelo, sirve como banco de pruebas para medir como afecta cada nivel IQ a la coherencia conversacional y a la fidelidad del personaje.
- Experimentacion en hardware limitado: el quant IQ1_S (2,8 GB) o IQ2_XS (3,4 GB) permiten ejecutar un modelo de 8,95 B en portatiles con GPU integrada o en CPU, asumiendo perdida notable de calidad.
- Moderacion y filtrado de contenido: usar el modelo como generador adversario para probar clasificadores de contenido adulto en pipelines de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay, y los resultados de la busqueda web no aportan datos relacionados con el modelo. Solo se referencia un grafico externo de ikawrakow que compara la perplejidad relativa de distintos tipos de cuantizacion de baja calidad, sin valores especificos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del quant. IQ1_S ~2,8 GB; IQ2_M ~3,7 GB; IQ3_M ~4,5 GB; IQ4_XS ~5,3 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB. Hay que sumar la cache KV, que crece con la longitud de contexto (no disponible) y con el numero de secuencias en paralelo.
- Cabe en GPU de consumo: si. Los quants de 2,8 a 5,7 GB funcionan en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) y con mas margen en 12 GB (RTX 3060 12 GB, RTX 4070) y 16 GB (RTX 4060 Ti 16 GB, RTX 4080). El quant Q6_K de 7,5 GB entra en 12 GB con contexto moderado.
- GPU recomendadas para produccion con varias peticiones concurrentes: A100 40/80 GB, H100 80 GB o L40S, con margen amplio para lotes grandes y contexto largo. Para uso individual, RTX 4090 o RTX 3090 son suficientes incluso con el quant de mayor tamano.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y servidores compatibles con la API de llama.cpp. vLLM y TGI no estan optimizados para GGUF, por lo que no se recomiendan como via principal.
- Latencia y throughput: no disponible. No hay mediciones publicadas en el repositorio ni en los resultados de busqueda.
- Almacenamiento: el repositorio completo ocupa 110,2 GB; conviene descargar unicamente el archivo GGUF necesario, de entre 2,8 y 7,5 GB, mas el archivo imatrix (0,1 GB) solo si se van a generar quants propios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hornybot-Julian-POV-i1-GGUF | 8,95 B | no disponible | GGUF i1/imatrix | no disponible | Cuantizacion ponderada con imatrix; 26 niveles de quant; incluye archivo imatrix |
| Hornybot-Julian-POV-GGUF | 8,95 B | no disponible | GGUF estatico | no disponible | Mismo modelo base con cuantizaciones estaticas sin imatrix; aloja los archivos mmproj si existen |
| axiomofmind/Hornybot-Julian-POV | 8,95 B | no disponible | safetensors | no disponible | Modelo base sin cuantizar, en precision original |
| Otras alternativas de rol de ~8 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion con modelos de la misma categoria |

## Limitaciones y advertencias

- La licencia no esta especificada en el repositorio de cuantizacion ni se detalla en la informacion disponible. Antes de cualquier uso comercial es imprescindible consultar la licencia del modelo base, axiomofmind/Hornybot-Julian-POV, porque las cuantizaciones heredan sus restricciones.
- El modelo esta etiquetado como contenido adulto y su uso previsto es el roleplay explicito. No es adecuado para aplicaciones orientadas a publico general ni para productos sin control de edad.
- Solo se declara soporte de ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- No hay datos publicados de benchmarks, evaluaciones de sesgo ni estudios de alucinacion. La calidad real en tareas de razonamiento, codigo o matematicas es desconocida.
- La longitud de contexto no esta disponible, un dato critico para planificar conversaciones largas o despliegues con ventana extendida.
- El modelo base parece incluir capacidad de vision, pero los archivos mmproj se alojan en el repositorio estatico, no en este. Sin ellos, la entrada multimodal no funcionara.
- Los quants muy agresivos (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la coherencia; el propio autor los describe como "for the desperate" o "mostly desperate". Para uso real conviene Q4_K_M o superior.
- El recuento de descargas es cero y el repositorio es reciente, por lo que no existe retroalimentacion de la comunidad ni validacion independiente de los quants.
- Un modelo de 8,95 B ajustado para roleplay no es fiable como sistema de decision automatizada, atencion al cliente real ni generacion de codigo en produccion.

## Enlaces

- Repositorio de cuantizaciones i1/imatrix: https://huggingface.co/mradermacher/Hornybot-Julian-POV-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Hornybot-Julian-POV-GGUF
- Modelo base: https://huggingface.co/axiomofmind/Hornybot-Julian-POV
- Vista general de quants y descargas del autor: https://hf.tst.eu/model#Hornybot-Julian-POV-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa responsable de la cuantizacion (nethype GmbH): https://www.nethype.de/
