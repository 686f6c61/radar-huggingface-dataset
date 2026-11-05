# fastino/GLiDE-27B

## Resumen

GLiDE-27B es un modelo de decisión desarrollado por Fastino Labs, disenado especificamente para clasificar, enrutar y puntuar estados (texto, JSON o imagenes) mediante preguntas tipadas. A diferencia de un modelo generativo convencional, GLiDE no produce texto libre: recibe un estado y una o varias preguntas con opciones definidas, y devuelve una distribucion de probabilidad sobre cada opcion en un unico pase forward. Esto lo posiciona como una alternativa determinista y de baja latencia frente al uso de LLM generativos para tareas de decision estructurada.

El modelo tiene 26.085.330.160 parametros (aproximadamente 26.000 millones) y se distribuye en formato bf16 con un peso total de 52,2 GB en disco: 51,2 GB para el modelo de lenguaje, 0,92 GB para el codificador visual y 2,6 MB para el cabezal de lectura de decisiones. Soporta contextos de hasta 40.000 tokens por pregunta y combina procesamiento de texto, JSON e imagenes.

Su relevancia actual radica en que ofrece una interfaz tipada (`choice`, `noul`, `score`) con probabilidades calibradas para cada opcion, lo que facilita la integracion en pipelines de enrutamiento, moderacion y clasificacion sin necesidad de parsear texto generado. Segun la model card, alcanza 72,49 en el Decision Index 0.3.1 con una latencia mediana de 112 ms por peticion en una RTX PRO 6000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atencion lineal (hibrida) y cabezal de decision de 255 vias; tag `qwen3_5` en HuggingFace |
| Parametros totales | 26.085.330.160 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.000 tokens por prompt de pregunta (estado, pregunta, opciones y tokens de imagen) |
| Tipos de cuantizacion | No disponible (los pesos publicados son bf16) |
| Idiomas soportados | No disponible |
| Licencia | fastino-community (licencia `other`, enlace a LICENSE en el repo) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

GLiDE-27B es un modelo multimodal que combina un modelo de lenguaje de aproximadamente 51,2 GB en bf16 con un codificador visual de 0,92 GB y un cabezal de lectura de decisiones de 2,6 MB. El tag `qwen3_5` en HuggingFace sugiere que la base del modelo de lenguaje deriva de la familia Qwen 3.5. La model card menciona capas de atencion lineal y recomienda el paquete `flash-linear-attention` para kernels rapidos, lo que indica una arquitectura hibrida con atencion lineal y atencion completa. El modelo acepta estados en forma de cadena de texto, cualquier valor JSON o una lista de partes de texto e imagen.

El mecanismo central es un cabezal de decision de 255 vias que produce probabilidades para cada opcion de cada pregunta. Todas las preguntas de una peticion (y de peticiones concurrentes) se puntuan juntas en micro-lotes, con un unico pase forward por pregunta. Los tipos de pregunta soportados son `choice` (una de hasta 255 opciones nombradas), `noul` (si/no, devuelve P(si)) y `score` (niveles ordenados). No se genera texto: la salida es exclusivamente probabilistica. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion y enrutamiento con opciones tipadas: `choice` (hasta 255 opciones), `noul` (si/no con probabilidad) y `score` (niveles ordenados con nivel esperado).
- Salida de probabilidades calibradas para cada opcion, con campo de confianza por pregunta.
- Procesamiento de estados multimodales: texto plano, JSON arbitrario y listas de partes de texto e imagen.
- Entrada de imagenes en multiples formatos: objetos PIL, rutas de fichero, bytes, cadenas base64 y data URLs.
- Contexto largo de hasta 40.000 tokens por pregunta, adecuado para documentos extensos o conversaciones largas.
- Puntuacion por micro-lotes de preguntas y peticiones concurrentes en un unico pase forward.
- Interfaz Python (`glide.Glide`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Disponible tambien mediante API alojada de Fastino (`POST https://api.fastino.ai/v1/systemone`, modelo `fastino/GLiDE`).
- No soporta generacion de texto libre, tool calling generativo ni razonamiento multi-paso en el sentido de un LLM conversacional.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y metadatos (por ejemplo, `customer_tier`) como estado JSON y devuelve la intencion (`refund`, `cancel`, `track`, `other`), la urgencia (`noul`) y la prioridad (`score`) en una sola llamada, tal como muestra el ejemplo de la model card con 316 tokens de entrada y 0 de salida.
- Moderacion de contenido: clasificar textos o imagenes en categorias de riesgo mediante preguntas `choice` con opciones predefinidas, aprovechando la salida probabilistica para aplicar umbrales configurables.
- Clasificacion de imagenes de catalogo: dado un estado con una o varias imagenes y una pregunta `choice` sobre color, forma o categoria, el modelo devuelve la distribucion sobre las opciones (el ejemplo de la model card usa una imagen sintetica de 512x512 con un circulo rojo).
- Puntuacion de calidad o relevancia: usar preguntas de tipo `score` con niveles ordenados (por ejemplo, `low`, `medium`, `high`) para rankear respuestas, resenas o resultados de busqueda con un nivel esperado numerico.
- Extraccion de decisiones en pipelines de agentes: sustituir llamadas a LLM generativos por una llamada determinista de 112 ms de latencia mediana para decidir el siguiente paso de un agente (que herramienta invocar, si escalar, si responder).
- Analisis de documentos largos: con hasta 40.000 tokens de contexto por pregunta, clasificar contratos, informes o hilos de correo completos sin truncamiento.
- Verificacion binaria a gran escala: preguntas `noul` para comprobar si un texto cumple una politica, si una imagen contiene un objeto o si una transaccion es sospechosa, con la probabilidad de "si" como senal directa.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Decision Index 0.3.1 (suite publica) | 72,49 | Kit oficial, una RTX PRO 6000, bf16 |
| Latencia mediana por peticion | 112 ms | RTX PRO 6000, muestra de 750 peticiones |

No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: 52,2 GB tras la carga en bf16; pico de 56,4 GB durante la muestra de latencia de 750 peticiones.
- GPU recomendada: una GPU con 80 GB o mas de memoria. La GPU validada es la NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB).
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) en bf16. No se documentan versiones cuantizadas en la informacion disponible.
- Tiempo de carga: 10 s desde cache local en caliente; mas largo desde almacenamiento en red. Los pesos se copian a la GPU tensor a tensor, manteniendo bajo el uso de memoria host.
- Opciones de despliegue: paquete Python `glide` incluido en el repositorio y servidor HTTP con formato System One (`POST /v1/systemone`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Dependencias validadas: Python 3.12, `torch==2.14.0`, `transformers==5.17.0` y `flash-linear-attention==0.5.2` (opcional pero recomendado; sin el, transformers usa una implementacion PyTorch mucho mas lenta no validada). El aviso de `causal_conv1d` no instalado es esperado.
- El preprocesamiento de imagenes se ejecuta en CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision con salida probabilistica tipada) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para chat, redaccion ni generacion de codigo.
- La salida esta limitada a las opciones definidas por el usuario; la calidad depende de como se formulen las preguntas y los criterios.
- El limite de 255 opciones por pregunta `choice` restringe la granularidad de clasificacion en escenarios con muchas categorias.
- Contexto maximo de 40.000 tokens por pregunta; estados mas largos requieren truncamiento o division.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion (aunque al no generar texto el riesgo es distinto) ni cobertura idiomatica.
- Licencia `fastino-community` (tipo `other`): es necesario revisar el fichero LICENSE del repositorio antes de un uso comercial; no se detallan en la informacion disponible las restricciones concretas.
- Requiere hardware de gama alta (80 GB o mas de VRAM en bf16); no hay cuantizaciones documentadas para reducir el consumo de memoria.
- La validacion se realizo con versiones muy concretas de dependencias; otras combinaciones pueden degradar el rendimiento o no estar soportadas.
- El uso del paquete `flash-linear-attention` es opcional pero recomendado; sin el, el rendimiento no esta validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fastino/GLiDE-27B
- Repositorio del modelo (descarga): https://huggingface.co/fastino/GLiDE
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentacion de la API de inferencia (System One): https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Registro y API key: https://agent.fastino.ai
