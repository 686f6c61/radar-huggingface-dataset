# mradermacher/FACET-Terminal-Qwen3.5-4B-GGUF

## Resumen

FACET-Terminal-Qwen3.5-4B-GGUF es una versión cuantizada en formato GGUF del modelo FACET-Terminal/FACET-Terminal-Qwen3.5-4B, un modelo de lenguaje de 4.000 millones de parámetros desarrollado por FACET-Terminal y basado en la arquitectura Qwen3.5-4B. El modelo está diseñado específicamente para actuar como agente de terminal, es decir, para ejecutar comandos, gestionar tareas de línea de comandos y operar como asistente conversacional en entornos de desarrollo y administración de sistemas.

La cuantización ha sido realizada por mradermacher, un conocido cuantizador de la comunidad, que ofrece una amplia gama de niveles de compresión (desde Q2_K hasta f16) para adaptarse a distintos requisitos de memoria y rendimiento. El modelo base se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia actual radica en la creciente demanda de agentes de IA que puedan interactuar de forma segura y eficiente con el sistema operativo, automatizando tareas de terminal con razonamiento contextual.

Aunque la información pública sobre el modelo base es limitada, los archivos multimodales (mmproj) incluidos en el repositorio sugieren que el modelo puede tener capacidades de visión, lo que ampliaría sus aplicaciones más allá del texto puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, basado en Qwen3.5-4B) |
| Parametros totales | 4.841.450.496 (4,84 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base FACET-Terminal-Qwen3.5-4B. Dado que se basa en Qwen3.5-4B, es probable que emplee una arquitectura transformer densa con atencion por ventanas deslizantes o atencion completa, pero no se ha confirmado. Tampoco se conocen los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion destacable es la inclusion de un modulo multimodal (mmproj) que sugiere soporte para entrada de imagenes, aunque no se especifica su alcance.

El proceso de cuantizacion realizado por mradermacher es estatico (sin imatrix) y genera archivos GGUF listos para usar con llama.cpp, Ollama u otros motores compatibles. No se han publicado detalles sobre el dataset de calibracion utilizado para las cuantizaciones.

## Capacidades

- Generacion de texto conversacional: el modelo esta disenado para mantener dialogos multi-turno, como corresponde a un agente de terminal.
- Agente de terminal: orientado a interpretar y ejecutar comandos de shell, gestionar archivos y automatizar tareas de administracion de sistemas.
- Soporte multimodal: la presencia de archivos mmproj (Q8_0 y f16) indica que el modelo puede procesar imagenes, aunque no se detalla el tipo de tareas de vision soportadas.
- Tool calling / function calling: no confirmado explicitamente, pero es una capacidad comun en modelos de agente; se infiere por el tag "agentic-ai".
- Razonamiento multi-paso: no confirmado, pero probable dado su uso como agente.
- Multilingue: solo se declara ingles (en).

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede recibir instrucciones en lenguaje natural y traducirlas a comandos de shell, facilitando la gestion de servidores, copias de seguridad o despliegues.
- Asistente de desarrollo en terminal: integrado en un IDE o en una sesion de terminal, puede ayudar a buscar errores en logs, generar comandos de git o explicar fragmentos de codigo.
- Chatbot de soporte tecnico interno: desplegado como agente conversacional para resolver dudas sobre infraestructura, con acceso a herramientas de diagnostico.
- Procesamiento de capturas de pantalla: gracias al modulo multimodal, puede analizar imagenes de errores o diagramas y sugerir comandos o soluciones.
- Educacion y formacion en linea de comandos: actua como tutor que explica comandos, opciones y buenas practicas de shell.
- Orquestacion de pipelines de CI/CD: si soporta tool calling, puede integrarse en flujos de integracion continua para ejecutar tareas de build, test o deploy bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, el modelo ocupa entre 2,2 GB (Q2_K) y 9,8 GB (f16). Para uso practico, se recomienda al menos 4 GB de VRAM para Q4_K_M (3,2 GB) y 6 GB para Q8_0 (5,3 GB).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, etc.) puede ejecutar las cuantizaciones Q4 o Q5. Para f16 se necesitan 12 GB o mas (RTX 3080, RTX 4070 Ti, etc.).
- Compatibilidad con consumer GPU: si, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 4-6 GB, aunque con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF. Tambien se puede usar vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no disponible. Dependera del hardware y de la cuantizacion; en una RTX 4090 se esperan velocidades de decodificacion superiores a 50 tokens/s con Q4_K_M, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de agente de terminal. Como referencia, el modelo base Qwen3.5-4B podria compararse con otros modelos de 4B como Llama 3.2 3B o Phi-3.5-mini, pero no se conocen los resultados de FACET-Terminal en benchmarks estandar. Se recomienda consultar la pagina del modelo base para futuras actualizaciones.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 4B, puede presentar alucinaciones en tareas complejas o generar comandos incorrectos si no se valida su salida.
- Riesgo de ejecucion de comandos peligrosos: al operar como agente de terminal, existe un riesgo inherente de que el modelo sugiera o ejecute comandos destructivos si no se implementan salvaguardas (por ejemplo, confirmacion humana).
- Limitaciones de idioma: solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- Contexto limitado: no se ha especificado la longitud de contexto; probablemente sea similar a la de Qwen3.5-4B (posiblemente 32K o 128K), pero no confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las patentes asociadas.
- Cuantizaciones de baja precision: los niveles Q2_K y Q3 pueden degradar significativamente la calidad de las respuestas; se recomienda Q4_K_M o superior para uso en produccion.

## Enlaces

- Modelo cuantizado GGUF: https://huggingface.co/mradermacher/FACET-Terminal-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/FACET-Terminal/FACET-Terminal-Qwen3.5-4B
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
