# CydralTech/Olala-v1.0-summarise-GGUF

## Resumen

Olala-v1.0-summarise es un modelo especializado en resumen de documentos desarrollado por OVHai LLM, obtenido mediante fine-tuning de Olala-v1.0-mini-7A1B y publicado bajo licencia Apache 2.0. El repositorio que nos ocupa, CydralTech/Olala-v1.0-summarise-GGUF, contiene una cuantización GGUF del modelo original en safetensors, generada por Cydral Technology para su programa de escritorio Albireo en Windows. El modelo cuenta con 6.775.272.608 parámetros totales y una arquitectura híbrida que combina capas Mamba-3 con capas de atención que emplean mezcla de expertos (MoE).

La arquitectura, denominada `olala`, consta de 36 capas: 29 son capas Mamba-3 y 7 son capas de atención, cada una con una mezcla de 256 expertos enrutados. Esta combinación de estado espacial (SSM) y atención con MoE busca equilibrar eficiencia computacional y capacidad de modelado en tareas de comprensión de documentos largos. El modelo está orientado a la generación de resúmenes con razonamiento explícito, separando el canal de análisis del canal de respuesta final.

La relevancia de esta ficha radica en dos factores: por un lado, documenta una arquitectura poco común (híbrida Mamba-3 + MoE) que no está soportada por el ecosistema estándar de llama.cpp ni por Ollama o LM Studio; por otro, la cuantización GGUF publicada solo puede ejecutarse con Albireo 1.0.26 o superior, o con el fork de llama.cpp de los autores originales, lo que restringe considerablemente su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-3 + atención con MoE (arquitectura `olala`); 36 capas (29 Mamba-3, 7 de atención), 256 expertos enrutados por capa |
| Parametros totales | 6.775.272.608 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (con tensores internos en Q8_0, BF16 y precisión simple) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único archivo `Olala-v1.0-summarise-q6_k.gguf`, 6,31 GB, 989 tensores) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida poco convencional: de sus 36 capas, 29 son capas Mamba-3 (modelos de espacio de estados) y 7 son capas de atención, cada una de ellas con una mezcla de 256 expertos enrutados. Esta combinación busca reducir el coste computacional asociado a la atención cuadrática en secuencias largas mediante las capas SSM, reservando la atención con MoE para los puntos donde se requiere mayor capacidad de recuperación de información. El modelo base es Olala-v1.0-mini-7A1B, del que hereda capas y formas, y sobre el que OVHai LLM aplicó un fine-tuning específico para resumen de documentos.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo incorpora un modo de razonamiento explícito que separa la salida en dos canales: un canal `analysis` (razonamiento interno) y un canal `final` (resumen), gestionados por la plantilla de chat de los autores. La cuantización GGUF fue realizada sin matriz de importancia (importance matrix), a diferencia de la documentación del fork de los autores, que describe una calculada sobre texto en inglés para sus propios archivos.

## Capacidades

- Generación de resúmenes de documentos con razonamiento explícito en dos canales (`analysis` y `final`).
- Modo de razonamiento profundo ("deep reasoning") activable, que muestra el análisis antes de emitir el resumen.
- Generación de texto conversacional multi-turno.
- Mantenimiento de estado entre peticiones: las capas Mamba-3 guardan su estado entre dos solicitudes, de modo que una segunda pregunta sobre un documento reutiliza el estado guardado en lugar de reprocesar el documento completo.
- Soporte de plantilla de chat propia de los autores, con etiquetas `<document>` para adjuntar documentos.
- Interfaz compatible con la API de OpenAI a través del servicio local de Albireo.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Resumen de informes técnicos y documentos corporativos: el modelo está fine-tuneado específicamente para esta tarea y acepta el documento tras la instrucción en el prompt, generando un resumen en viñetas o en el formato solicitado.
- Procesamiento de documentación confidencial en local: al ejecutarse en Albireo sobre el propio equipo, los documentos no salen de la máquina ni requieren cuenta, lo que lo hace adecuado para entornos con requisitos de privacidad estrictos.
- Análisis iterativo de un mismo documento: gracias a la persistencia del estado de las capas Mamba-3 entre peticiones, un usuario puede hacer varias preguntas sobre el mismo documento sin que este se reprocese en cada turno.
- Integración en flujos automatizados vía API local: el servicio de Albireo expone una interfaz compatible con OpenAI, lo que permite invocar el modelo desde scripts (por ejemplo, PowerShell) para resumir lotes de ficheros de texto.
- Extracción de puntos clave con trazabilidad del razonamiento: el canal `analysis` permite revisar el razonamiento del modelo antes de aceptar el resumen final, útil en revisión documental donde se requiere auditar el proceso.
- Asistencia a la lectura en escritorio Windows: la aplicación web de Albireo muestra el razonamiento mientras el modelo lo escribe y lo pliega al comenzar el resumen, adecuado para usuarios que trabajan con documentos largos en su equipo personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 6,31 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM) más el espacio para el estado de las capas Mamba-3 y la caché de contexto; no se proporciona una cifra exacta de VRAM total.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del archivo (6,31 GB) sugiere que podría caber en GPUs con 8 GB o más de VRAM, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: Albireo 1.0.26 o superior (Windows 11, motor basado en dlib y Dlib-Transformer-extensions); el fork de llama.cpp de OVHai LLM lee sus propios archivos, pero este archivo concreto no fue probado con dicho fork. llama.cpp upstream, Ollama, LM Studio y otras herramientas estándar no soportan la arquitectura `olala`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables documentados en la información proporcionada. A continuación se indican las alternativas más directamente relacionadas por linaje, sin datos comparativos de rendimiento:

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olala-v1.0-summarise (safetensors) | Modelo original del que deriva esta cuantización | 6.775.272.608 | no disponible | Apache 2.0 | Hugging Face (OVHaiLLM) |
| Olala-v1.0-mini-7A1B | Modelo base sobre el que se hizo el fine-tuning | no disponible | no disponible | no disponible | Hugging Face (OVHaiLLM) |
| Olala-v1.0-mini-7A1B-GGUF | Cuantización GGUF del modelo base, publicada por los autores | no disponible | no disponible | no disponible | Hugging Face (OVHaiLLM) |

## Limitaciones y advertencias

- Portabilidad muy restringida: el archivo requiere un programa que lea la arquitectura `olala`; solo Albireo 1.0.26 o superior está confirmado, y llama.cpp upstream, Ollama y LM Studio no la soportan.
- El archivo no fue probado con el fork de llama.cpp de los autores, que lee sus propios archivos pero no necesariamente este.
- La cuantización se realizó sin matriz de importancia, a diferencia de los archivos de los autores para Olala 1.0 mini, lo que puede afectar a la calidad respecto a la referencia.
- Cinco tensores `ffn_latent_down` (capas 7, 8, 9, 10 y 14) se conservaron en BF16 porque sus valores (cerca de 2e-5) se redondearían a cero en Q6_K; según el autor, su contribución a la salida es inferior a 2e-18 respecto al experto compartido, pero es una desviación respecto a la cuantización estándar.
- Idioma limitado al inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad de los resúmenes ni métricas de factualidad.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Longitud de contexto no publicada, lo que dificulta planificar el tamaño máximo de documento procesable.
- Licencia Apache 2.0: permite uso comercial, pero la dependencia de Albireo (programa de terceros) para ejecutar el archivo condiciona el despliegue en producción.
- El modelo está diseñado para recibir la instrucción primero y el documento después; invertir el orden (como hace la interfaz de Albireo al adjuntar archivos) puede degradar la calidad del resumen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CydralTech/Olala-v1.0-summarise-GGUF
- Modelo base (safetensors): https://huggingface.co/OVHaiLLM/Olala-v1.0-summarise
- Modelo del que deriva el fine-tuning: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- GGUF de los autores para Olala 1.0 mini: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-GGUF
- Fork de llama.cpp de OVHai LLM: https://github.com/OVHai-LLM/llama.cpp
- Página de producto de Albireo: https://cydral-technology.eu/en/products/albireo/
- Descargas de Albireo: https://cydral-technology.eu/en/downloads/
- Ficha de producto de Albireo (PDF): https://cydral-technology.eu/files/docs/albireo-product-sheet-en.pdf
- Código fuente del motor (Dlib-Transformer-extensions): https://github.com/Cydral/Dlib-Transformer-extensions/tree/main/dlib/dlib/external/albireo
- dlib: http://dlib.net
