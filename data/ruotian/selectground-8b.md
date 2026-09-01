# ruotian/SelectGround-8B

## Resumen

SelectGround-8B es un adaptador LoRA para grounding de interfaces gráficas (GUI grounding) desarrollado por Ruotian Luo. Se apoya en el modelo base Qwen/Qwen3-VL-8B-Instruct y añade una cabeza de selección auxiliar. Su función es mapear una captura de pantalla y una instrucción en lenguaje natural a un punto de clic concreto, lo que lo hace relevante para tareas de automatización de interfaces y agentes de computer use. El adaptador pesa 0,3 GB y se distribuye bajo licencia Apache 2.0.

El modelo se entrena con el dataset propio ClickContrast, que utiliza pares objetivo-distractor con supervisión de coordenadas y una pérdida auxiliar basada en atención. Además, incorpora el método Latent Competitor Revisit (LCR), que reutiliza el selector aprendido para revisitar regiones competidoras y comparar coordenadas decodificadas de forma independiente, mejorando la precisión en benchmarks como ScreenSpot-Pro, MMBench-GUI L2 y OSWorld-G.

Al ser un adaptador PEFT, no es un modelo autónomo: requiere cargar el backbone Qwen3-VL-8B-Instruct en una revisión específica (0c351dd01ed87e9c1b53cbc748cba10e6187ff3b) y usar el visual encoder y merger congelados. Esto lo convierte en una opción ligera y eficiente para integrar capacidades de clic guiado en sistemas existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL-8B-Instruct (transformer multimodal) |
| Parametros totales | no disponible (adaptador LoRA; modelo base de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (adaptador PEFT en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

SelectGround-8B es un adaptador LoRA que se monta sobre Qwen/Qwen3-VL-8B-Instruct, un modelo multimodal de 8B parámetros. El adaptador añade una cabeza de selección auxiliar que, junto con la salida del modelo base, produce coordenadas de clic. El entrenamiento se realiza con el dataset ClickContrast, que contiene pares de capturas de pantalla con objetivos y distractores, usando supervisión de coordenadas y una pérdida auxiliar de selección basada en atención. El método LCR (Latent Competitor Revisit) reutiliza el selector aprendido para revisitar regiones competidoras y comparar coordenadas decodificadas de forma independiente, lo que mejora la robustez.

El proceso de entrenamiento parte del backbone fijado con semilla 20260625 y consta de 110 actualizaciones iniciales seguidas de 10 actualizaciones de refinamiento. El visual encoder y el merger del modelo base permanecen congelados. La inferencia usa generación greedy con un máximo de 32 tokens y preserva la relación de aspecto de la imagen bajo un presupuesto de 8.847.360 píxeles. La salida incluye un punto en píxeles originales y un punto normalizado en coordenadas 0-1000.

## Capacidades

- Grounding de interfaces graficas: dado un screenshot y una instruccion en lenguaje natural, produce un punto de clic en la imagen.
- Soporte del metodo LCR para mejorar la precision en la seleccion de objetivos, comparando multiples regiones candidatas.
- Procesamiento multimodal: combina entrada de imagen y texto gracias al backbone Qwen3-VL-8B-Instruct.
- Salida en coordenadas absolutas (pixeles originales) y normalizadas (0-1000), facilitando la integracion en sistemas de automatizacion.
- Generacion greedy con presupuesto de tokens limitado (32), lo que reduce la latencia en inferencia.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o soporte de agentes mas alla de la tarea de clic.

## Casos de uso

- Automatizacion de pruebas de interfaz de usuario: el modelo puede recibir capturas de pantalla de una aplicacion y una instruccion como "haz clic en el boton Guardar", generando el punto exacto para ejecutar la accion en un framework de testing como Selenium o Playwright.
- Agentes de computer use: integrado en un sistema agente, SelectGround-8B permite que un modelo de lenguaje controle el cursor sobre el escritorio, ejecutando tareas como abrir archivos, navegar por menus o rellenar formularios.
- Asistencia a personas con discapacidad visual: combinado con un lector de pantalla, el modelo puede identificar elementos de interfaz a partir de instrucciones habladas y generar clics, facilitando la navegacion en aplicaciones de escritorio.
- Automatizacion de tareas repetitivas en aplicaciones de negocio: por ejemplo, en un ERP, el modelo puede localizar y hacer clic en campos especificos de un formulario a partir de una descripcion textual, reduciendo el trabajo manual.
- Testing de accesibilidad: el modelo puede verificar que los elementos interactivos de una interfaz sean localizables y clicables, generando puntos de clic para validar la usabilidad.
- Robotica de procesos (RPA): en pipelines de RPA, SelectGround-8B puede sustituir a selectores basados en coordenadas fijas o en propiedades de los elementos, ofreciendo una localizacion mas robusta ante cambios en la interfaz.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en tres benchmarks de GUI grounding, comparando la inferencia directa con la variante LCR:

| Inferencia | ScreenSpot-Pro | MMBench-GUI L2 | OSWorld-G |
|---|---:|---:|---:|
| Directa | 66,034 | 86,283 | 70,196 |
| Con LCR | 73,182 | 88,008 | 71,961 |

Los resultados usan los 1.581 ejemplos de ScreenSpot-Pro, los 3.594 de MMBench-GUI L2 y los 510 ejemplos con objetivo de OSWorld-G. Los pesos de comparacion de LCR estan fijados por benchmark y documentados en el repositorio de codigo. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB, pero el modelo base Qwen3-VL-8B-Instruct requiere una GPU con al menos 16 GB de VRAM en precision FP16, o unos 8 GB si se cuantiza a 4 bits.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para inferencia comoda sin cuantizacion.
- Es posible ejecutarlo en GPUs de consumo como RTX 3080/3090 con cuantizacion del backbone, aunque no se documentan configuraciones especificas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria transformers de HuggingFace, o mediante servidores de inferencia como vLLM o TGI si soportan adaptadores LoRA. Tambien se puede usar con llama.cpp si se convierte el modelo combinado a GGUF.
- La latencia estimada no esta disponible en la informacion proporcionada; la generacion greedy con maximo 32 tokens sugiere una inferencia rapida en hardware moderno.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No obstante, en el ambito de GUI grounding existen alternativas como UGround, SeeClick o CogAgent, pero no se han encontrado datos de rendimiento de estos modelos en los benchmarks citados para poder establecer una comparacion rigurosa. Se recomienda consultar el repositorio de codigo para posibles referencias adicionales.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: requiere cargar el backbone Qwen3-VL-8B-Instruct en la revision exacta indicada, lo que limita su portabilidad a otros entornos.
- La tarea se limita a generar un unico punto de clic; no soporta otras acciones como arrastrar, escribir texto o gestos multi-touch.
- El entrenamiento se basa en el dataset ClickContrast, que puede contener sesgos en los tipos de interfaces representadas (por ejemplo, predominio de aplicaciones de escritorio sobre moviles).
- No se documentan limitaciones de idioma, pero al depender del modelo base, su rendimiento en idiomas distintos del ingles puede verse afectado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene su propia licencia (Apache 2.0 tambien, segun la informacion disponible), por lo que se deben revisar los terminos de ambos.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante imagenes adversariales en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ruotian/SelectGround-8B
- Repositorio de codigo: https://github.com/zhangruotian/SelectGround
- Dataset ClickContrast: https://huggingface.co/datasets/ruotian/ClickContrast
- Pagina del modelo en FriendliAI: https://friendli.ai/models/ruotian/SelectGround-8B
