# Comfy-Org/void-model

## Resumen

El modelo `Comfy-Org/void-model` es un paquete de pesos reempaquetado para su uso en ComfyUI, basado en el modelo original VOID (Video Object and Interaction Deletion) desarrollado por Netflix. VOID es un modelo de difusión de video diseñado para eliminar objetos o interacciones no deseadas en secuencias de video, una tarea de edición de video que requiere comprender tanto la estructura espacial como la temporal de la escena. El paquete incluye los pesos de las dos pasadas del modelo (pass1 y pass2), junto con componentes auxiliares como el modelo de flujo óptico RAFT, un codificador de texto T5 y un VAE de CogVideoX.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para integrarse en el ecosistema ComfyUI, lo que facilita su uso en flujos de trabajo de edición de video sin necesidad de escribir código. Aunque no se proporcionan especificaciones técnicas detalladas en la información disponible, el tamaño del repositorio (32,5 GB) sugiere que se trata de un modelo de difusión de gran escala, probablemente basado en la arquitectura de CogVideoX. Su relevancia actual radica en la creciente demanda de herramientas de edición de video automáticas y controlables, especialmente en el ámbito de la postproducción y la generación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video (basado en CogVideoX, con dos pasadas de refinamiento) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se proporcionan en safetensors, probablemente fp16) |
| Idiomas soportados | no disponible (el codificador de texto T5 sugiere soporte multilingue, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos individuales para cada componente) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo, pero los archivos incluidos permiten inferir una composicion modular. El modelo principal se divide en dos pasadas (`void_pass1.safetensors` y `void_pass2.safetensors`), lo que sugiere un enfoque de refinamiento progresivo: la primera pasada probablemente genera una eliminacion inicial del objeto, y la segunda refina los detalles temporales y espaciales. Se incluye un modelo de flujo optico RAFT (Large, con pesos `raft_large_C_T_SKHT_V2-ff5fadd5.safetensors`) para estimar el movimiento entre fotogramas, lo que es critico para mantener la coherencia temporal al eliminar objetos en movimiento. El codificador de texto es T5 (variante XXL en fp16, `t5xxl_fp16.safetensors`), que se utiliza para condicionar la generacion mediante descripciones textuales. El VAE es el de CogVideoX (`cogvideox_vae.safetensors`), lo que indica que la arquitectura de difusion subyacente esta relacionada con CogVideoX, un modelo de generacion de video de ZAI.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. El modelo original de Netflix (enlace en la model card) podria contener mas detalles, pero no estan disponibles en la informacion proporcionada.

## Capacidades

- Eliminacion de objetos y interacciones en secuencias de video, manteniendo la coherencia temporal.
- Edicion de video basada en instrucciones textuales (gracias al codificador T5).
- Refinamiento en dos pasadas para mejorar la calidad del resultado.
- Integracion con ComfyUI, lo que permite construir flujos de trabajo visuales sin programacion.
- Uso de flujo optico (RAFT) para manejar objetos en movimiento y fondos dinamicos.
- Capacidad de procesar video completo (no solo imagenes individuales), gracias a la arquitectura de difusion de video.

## Casos de uso

- Postproduccion cinematografica: eliminar elementos no deseados (micrófonos, cables, personas de fondo) de tomas de video sin necesidad de re-grabar.
- Creacion de contenido para redes sociales: limpiar videos grabados con el movil, eliminando objetos que distraen o personas que aparecen accidentalmente.
- Edicion de video publicitario: retirar logotipos o marcas de agua de material de archivo, siempre que se tenga derecho a hacerlo.
- Restauracion de video historico: eliminar artefactos o elementos anacronicos en grabaciones antiguas.
- Automatizacion de flujos de trabajo en estudios de produccion: integrar el modelo en pipelines de ComfyUI para procesar lotes de video de forma consistente.
- Investigacion en vision por computador: utilizar el modelo como referencia para estudiar tecnicas de edicion de video basadas en difusion y flujo optico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni metricas especificas de edicion de video (como PSNR, SSIM o FVD). Se recomienda consultar el repositorio original de Netflix (enlace en la seccion de enlaces) para posibles evaluaciones.

## Requisitos de hardware

- VRAM estimada: dado el tamaño del repositorio (32,5 GB) y el uso de pesos en fp16, se estima que se necesitan al menos 32 GB de VRAM para cargar todos los componentes simultaneamente. Sin embargo, es posible que el modelo se ejecute con menos memoria si se cargan los componentes de forma secuencial o se utiliza cuantizacion (no incluida en este paquete).
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100, o GPUs de consumo con 24 GB o mas, como la RTX 4090, aunque podria requerir optimizaciones adicionales.
- No se garantiza su funcionamiento en GPUs de gama baja (8-12 GB) debido al tamaño de los pesos.
- Opciones de despliegue: ComfyUI es el entorno principal, pero los archivos safetensors pueden ser utilizados con otras herramientas que soporten difusion de video, como Diffusers (si se adaptan los pesos). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El procesamiento de video es computacionalmente intensivo y dependera de la resolucion, el numero de fotogramas y la GPU utilizada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de edicion de video. Modelos como Runway Gen-2 o Pika Labs ofrecen funcionalidades similares, pero son propietarios y no publican especificaciones tecnicas comparables. En el ambito open source, existen modelos como Stable Video Diffusion o modelos de eliminacion de objetos basados en inpainting, pero no se dispone de datos de rendimiento para comparar. Por tanto, la comparativa se limita a indicar que VOID se basa en CogVideoX y utiliza RAFT, lo que lo diferencia de enfoques puramente basados en inpainting por fotograma.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo, pero al ser un modelo de difusion entrenado con datos de video, podria reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, en la representacion de personas o escenas).
- Riesgo de alucinacion visual: al eliminar objetos, el modelo podria generar artefactos o rellenar regiones de forma incorrecta, especialmente en escenas complejas o con movimiento rapido.
- Limitaciones de contexto: al ser un modelo de video, la longitud de la secuencia procesable esta limitada por la memoria de la GPU y la arquitectura, aunque no se especifica el numero maximo de fotogramas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso de los componentes RAFT (licencia BSD-3) y CogVideoX (Apache 2.0) debe respetar sus respectivos terminos. El modelo original de Netflix tambien es Apache 2.0, pero se recomienda revisar las condiciones de uso comercial.
- Para produccion, es necesario validar la calidad del resultado en cada caso de uso, ya que la eliminacion de objetos puede fallar en condiciones de iluminacion adversa, oclusiones o movimientos complejos.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Comfy-Org/void-model
- Modelo original de Netflix: https://huggingface.co/netflix/void-model
- Repositorio de RAFT (flujo optico): https://github.com/princeton-vl/raft
- Modelo CogVideoX-2b (base del VAE): https://huggingface.co/zai-org/CogVideoX-2b
