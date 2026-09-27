# RunningHubAI/rh-aigcai-aiv8.0-lora

## Resumen

rh-aigcai-aiv8.0-lora es un adaptador LoRA de bajo rango para generación de imágenes a partir de texto (text-to-image), publicado en Hugging Face por la cuenta RunningHubAI y atribuido al usuario @南光AIGC dentro de la plataforma RunningHub. Su función declarada es producir «hojas de diseño de personajes y objetos para dramas cortos generados con IA» (资产图 / 设定图), es decir, láminas de referencia visual coherentes de personajes y atrezzo para producciones audiovisuales generadas. Está afinado a partir del modelo base Z-image-base y se activa mediante la palabra de disparo en chino 角色.

El artefacto distribuido es exclusivamente el peso del adaptador: un único archivo safetensors de 76 MiB, dentro de un repositorio de 0,1 GB. No se publican los pesos del modelo base, ni datos sobre el entrenamiento (número de pasos, resolución, dataset, método de optimización), ni métricas de evaluación. El repositorio registra 0 descargas y 0 «likes», por lo que se trata de un artefacto reciente y sin validación comunitaria pública en el momento de redactar esta ficha.

Su relevancia es de nicho: encaja en flujos de trabajo de ComfyUI orientados a preproducción de contenido audiovisual corto, y el autor lo distribuye junto con enlaces a la API y al servicio de entrenamiento de RunningHub. No es un modelo de lenguaje ni un modelo fundacional autónomo: requiere el modelo base Z-image-base para funcionar, y toda capacidad de generación depende de este último.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA de bajo rango sobre el modelo base Z-image-base; se desconoce la arquitectura interna del adaptador: rango, alpha, módulos objetivo) |
| Parámetros totales | no disponible (el repositorio solo contiene el adaptador, de 76 MiB; los parámetros del modelo base no se distribuyen aquí) |
| Longitud de contexto | no disponible (no aplicable en el sentido de contexto de texto; se desconoce la resolución y el máximo de tokens de prompt soportados) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la única referencia lingüística explícita es la palabra de activación en chino: 角色) |
| Licencia | no disponible (la model card indica que RunningHub publica en nombre del autor, que conserva los derechos, y remite a la licencia del proyecto original o del proyecto upstream, sin especificarla) |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA para text-to-image |
| Modelo base | Z-image-base (indicado como «Finetuned from») |
| Palabra de activación | 角色 |
| Nombre del archivo | 【南光AIGC】AI短剧资产图-AI短剧角色物品设定图V8.0.safetensors (76 MiB) |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación (según el repositorio) | 2026-09-27 |
| Fecha de actualización (según el repositorio) | 2026-09-27 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del adaptador ni la del modelo base. Lo único verificable es que se trata de un LoRA para text-to-image, afinado a partir de Z-image-base, y que los pesos se entregan en un único archivo safetensors de 76 MiB. No se especifican el rango, el valor de alpha, los módulos inyectados (atención, proyecciones, bloques de convolución), ni si se empleó alguna variante como LoRA con descomposición alternativa o adaptadores de rango dinámico.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el número de imágenes, la resolución de entrenamiento, la composición del dataset, el número de pasos, el optimizador ni si hubo etapas de ajuste por preferencias humanas o filtrado de datos. El autor remite a la plataforma RunningHub como entorno donde se entrenó el modelo y ofrece un enlace genérico para entrenar modelos propios, pero no publica una ficha técnica de entrenamiento. En consecuencia, cualquier afirmación sobre calidad, sesgos inducidos por el dataset o comportamiento condicionado por la palabra de activación debe considerarse no verificada.

## Capacidades

- Generación de imágenes a partir de texto mediante un adaptador LoRA, siempre que se cargue sobre el modelo base Z-image-base.
- Especialización declarada en láminas de diseño de personajes y objetos (设定图 / 资产图) para dramas cortos generados con IA, es decir, imágenes de referencia con presentación tipo hoja de personaje o catálogo de atrezzo.
- Activación mediante la palabra de disparo en chino 角色.
- Integración prevista en ComfyUI, plataforma RunningHub y Hugging Face.
- Tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no disponible; solo se documenta una palabra de activación en chino.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponible.
- No se documentan capacidades de control estructural (ControlNet, inpainting, img2img) ni de ajuste de estilo mediante prompts negativos.

## Casos de uso

- Preproducción de dramas cortos con IA: el LoRA genera hojas de personaje coherentes (vistas y variaciones de un mismo diseño) que sirven como referencia para mantener la consistencia visual entre planos generados posteriormente. Es su propósito declarado y la palabra de activación 角色 está pensada para ese flujo.
- Diseño de atrezzo y objetos de escena: el título del modelo incluye explícitamente «物品设定图», por lo que el uso previsto incluye catálogos de objetos recurrentes de un guion (vehículos, herramientas, mobiliario) que después se reutilizan en otras generaciones.
- Creación de biblias visuales para pitching: un equipo puede producir rápidamente láminas de personajes con aspecto uniforme para presentar un proyecto a un productor antes de invertir en diseño manual.
- Producción de contenido para redes sociales: generación de ilustraciones de personajes con estilo consistente para publicaciones seriadas, aprovechando que el adaptador es ligero (76 MiB) y se puede alternar entre distintos LoRA en el mismo nodo de ComfyUI.
- Prototipado de estilo dentro de ComfyUI: el adaptador se puede cargar con distintos pesos y combinarlo con otros LoRA de personaje o estilo para explorar variaciones, dado su tamaño reducido y su formato safetensors estándar.
- Evaluación interna de adaptadores de terceros: por su tamaño y coste de almacenamiento mínimos, sirve como material de prueba en pipelines de validación de LoRA (comprobación de carga, compatibilidad con el base, efecto de la palabra de disparo).
- Uso a través de la API de RunningHub: para equipos que no quieran gestionar GPU propia, el autor ofrece el modelo dentro de su plataforma como servicio alojado, sin necesidad de descargar los pesos.
- Formación y experimentación: al ser un adaptador pequeño, es un ejemplo práctico para estudiar cómo se comporta un LoRA sobre Z-image-base en tareas de consistencia de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas (FID, CLIP score, similitud de personaje, evaluación humana) ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan tiempos de inferencia, número de pasos recomendado, escala de guía (CFG) ni configuraciones de muestreador.

## Requisitos de hardware

- VRAM estimada para la inferencia: no disponible. El consumo lo determina íntegramente el modelo base Z-image-base, cuyos requisitos no se especifican en la información proporcionada. El adaptador en sí añade 76 MiB de pesos, un coste despreciable.
- GPU recomendadas: no disponible. No hay ninguna recomendación de hardware publicada por el autor.
- Compatibilidad con GPU de consumo: no disponible. No puede afirmarse que quepa en una GPU de consumo porque se desconocen los requisitos del modelo base.
- Almacenamiento: el adaptador requiere aproximadamente 0,1 GB, además del espacio necesario para el modelo base.
- Opciones de despliegue: ComfyUI (indicado por el autor), plataforma RunningHub y Hugging Face. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un adaptador de difusión.
- Latencia y throughput estimados: no disponible.
- Alternativa sin hardware local: la API de RunningHub permite ejecutar el modelo en infraestructura del proveedor.

## Comparativa con modelos similares

No disponible. No se han publicado métricas de este adaptador ni de adaptadores comparables dentro de la información proporcionada, y no se documentan parámetros, contexto ni rendimiento del modelo base Z-image-base con los que establecer una comparación cuantitativa. Cualquier tabla comparativa con otros LoRA de text-to-image requeriría datos de evaluación que el repositorio no ofrece (0 descargas, 0 valoraciones, sin benchmarks ni informes de terceros). Se desconoce también la licencia exacta, lo que impide comparar condiciones de uso comercial frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al no publicarse la composición del dataset de entrenamiento, no puede evaluarse qué sesgos demográficos, culturales o estilísticos puede haber incorporado el adaptador.
- Riesgo de alucinación: no aplicable en el sentido lingüístico, pero el modelo puede generar detalles anatómicos o de diseño inconsistentes entre generaciones, algo habitual en adaptadores de personaje sin mecanismos explícitos de consistencia.
- Limitación de contexto: se desconoce la resolución de entrenamiento y el límite práctico de tokens de prompt. La palabra de activación está en chino, lo que puede degradar el comportamiento con prompts en otros idiomas.
- Licencia: no disponible. La model card remite a la licencia del proyecto original o upstream sin nombrarla, y señala que los derechos permanecen en el autor. Esto es un riesgo directo para cualquier uso comercial: no hay autorización explícita documentada.
- Dependencia del modelo base: el repositorio no incluye Z-image-base, por lo que el adaptador carece de utilidad por sí solo y hereda todas las limitaciones y condiciones de licencia de dicho base.
- Validación nula: el repositorio registra 0 descargas y 0 valoraciones, sin benchmarks, demos verificables ni informes independientes. No hay evidencia pública de calidad.
- Ausencia de ficha de entrenamiento: sin datos de pasos, resolución ni dataset, no es posible reproducir el resultado ni estimar su robustez fuera del dominio previsto (personajes y objetos de drama corto).
- Enlaces promocionales: buena parte de la model card apunta a servicios comerciales de RunningHub (API, entrenamiento, modelo Seedance 2.5), que no forman parte del artefacto distribuido y no deben interpretarse como componentes del modelo.
- Fechas del repositorio: las marcas de creación y actualización indican 2026-09-27, posteriores a la fecha habitual de consulta; conviene verificarlas en la página del modelo antes de citarlas.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-aigcai-aiv8.0-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2090655262016360450
- Página del autor (@南光AIGC): https://www.runninghub.cn/user-center/1925758591612162050
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5 (enlace promocional incluido en la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
