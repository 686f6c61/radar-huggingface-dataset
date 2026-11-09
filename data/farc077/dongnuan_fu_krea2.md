# farc077/Dongnuan_Fu_KREA2

## Resumen

Dongnuan_Fu_KREA2 es un adaptador LoRA de tipo text-to-image publicado por el usuario farc077 en Hugging Face. Se trata de un LoRA de identidad ("ONESHOTLORA") entrenado para reproducir el rostro y la apariencia de la actriz Dongnuan Fu sobre el modelo base Krea-2-Raw, desarrollado por Krea. El adaptador no es un modelo autónomo: requiere cargarse junto con el checkpoint base para generar imágenes.

El repositorio ocupa 0,2 GB, un tamaño coherente con un adaptador LoRA de bajo rango y no con un modelo completo. La model card es mínima: define una única palabra de activación (`D0NGNU4NF`), incluye tres ejemplos de prompts en inglés con sus imágenes de salida y remite a oneshotlora.com como herramienta de generación. No se documentan hiperparámetros de entrenamiento, dataset, rango, alpha ni número de pasos.

Su relevancia es acotada: se trata de un artefacto de personalización de identidad para un pipeline de difusión concreto (Krea-2-Raw), sin métricas publicadas, sin descargas ni interacciones en el momento de la consulta y con una licencia genérica "other" que no aclara los términos de uso comercial. Es útil como ejemplo de flujo LoRA de identidad de un solo sujeto, no como componente para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión text-to-image; la arquitectura interna del base no se detalla en la informacion disponible |
| Parametros totales | no disponible (el repositorio pesa 0,2 GB, compatible con un adaptador LoRA, no con un modelo completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusión; la longitud de prompt no se documenta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | no disponible (no se lista el formato de los ficheros del repositorio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Krea-2-Raw para modificar su comportamiento generativo sin reentrenar el checkpoint completo. La model card lo etiqueta como "ONESHOTLORA" e indica que se generó mediante la plataforma oneshotlora.com, un servicio orientado a crear LoRAs de identidad a partir de un conjunto reducido de imágenes de referencia.

No se publican datos sobre el número de imágenes de entrenamiento, la resolución, el número de pasos, la tasa de aprendizaje, el rango del adaptador ni el alpha. Tampoco se indica si el entrenamiento se hizo con captions automáticas o manuales, ni si se aplicaron técnicas de regularización para evitar el sobreajuste a las imágenes de referencia. La única información operativa es la palabra de activación `D0NGNU4NF`, que debe incluirse en el prompt para invocar la identidad aprendida.

## Capacidades

- Generación de imágenes fotorrealistas de la actriz Dongnuan Fu mediante el modelo base Krea-2-Raw y la palabra de activación `D0NGNU4NF`.
- Control de vestuario y escenario mediante prompts en lenguaje natural: los ejemplos de la model card describen camisa blanca con blazer negro en una oficina corporativa, vestido rosa pastel con cárdigan azul en un campo de hierba alta y camiseta blanca con vaqueros azules ante una pared exterior.
- Control de pose y encuadre de forma implícita a través del prompt, incluyendo indicaciones como mirar a cámara o estar de pie.
- Personalización de identidad sobre un único sujeto; no se documenta soporte multi-sujeto.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es un adaptador puramente text-to-image.
- Capacidades multilingües: no documentadas; los ejemplos disponibles están en inglés.

## Casos de uso

- Pruebas de concepto de personalización de identidad: cargar el LoRA sobre Krea-2-Raw en ComfyUI (el autor usa nombres de fichero de ComfyUI en los ejemplos) para verificar que la palabra de activación reproduce el rostro de forma consistente en distintos encuadres.
- Generación de storyboards con personaje recurrente: usar `D0NGNU4NF` junto con descripciones de vestuario y localización para mantener la misma identidad a lo largo de una secuencia de viñetas.
- Pruebas de vestuario virtual: los prompts de ejemplo ya cubren variaciones de ropa formal, casual y de verano, lo que permite evaluar la fidelidad del adaptador al cambiar la indumentaria sin cambiar la identidad.
- Evaluación comparativa de LoRAs de identidad: al ser un adaptador pequeño (0,2 GB), sirve como caso de control frente a otros LoRAs del mismo sujeto o del mismo pipeline para medir deriva de identidad y sobreajuste.
- Investigación sobre sesgos en personalización: analizar cómo el adaptador reproduce rasgos faciales y corporales en distintos contextos y si el modelo base impone estilos o demografías dominantes.
- Docencia y demostración de flujos LoRA: ejemplo mínimo y reproducible de cómo se estructura una model card de identidad, con palabra de activación y galería de ejemplos, para talleres de difusión.
- Prototipado de material editorial ficticio: generar imágenes de personaje consistente para maquetas y pruebas de diseño, siempre que se respeten los derechos de imagen y la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende enteramente del modelo base Krea-2-Raw, cuyos requisitos no se detallan en la información proporcionada. El adaptador en sí añade una sobrecarga mínima (repositorio de 0,2 GB).
- GPU recomendadas: no disponible. La model card no indica GPU ni configuración de referencia.
- Viabilidad en GPU de consumo: no confirmada; el adaptador es ligero, pero el requisito real lo marca el checkpoint base.
- Opciones de despliegue: los ejemplos del autor apuntan a ComfyUI (nombres de fichero `ComfyUI_temp_*.png`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dongnuan_Fu_KREA2 (farc077) | LoRA de identidad sobre Krea-2-Raw | no disponible (repo de 0,2 GB) | no aplica | sin benchmarks publicados | other | Hugging Face, 0 descargas, 0 likes |
| LoRA de identidad genérico sobre Stable Diffusion | LoRA de identidad | variable | no aplica | variable, depende del autor | variable | amplia en Hugging Face y Civitai |
| Krea-2-Raw (modelo base) | Modelo de difusión text-to-image completo | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hugging Face (krea/Krea-2-Raw) |

No se dispone de datos de benchmarks ni de parámetros del modelo base en la información proporcionada, por lo que la comparación cuantitativa con alternativas no es posible.

## Limitaciones y advertencias

- La licencia es "other" y la model card no especifica términos: no hay confirmación de que el uso comercial esté permitido, ni del régimen aplicable al modelo base Krea-2-Raw.
- El modelo reproduce la identidad de una persona real (la actriz Dongnuan Fu). Su uso para generar imágenes no consentidas, contenido difamatorio o suplantación puede infringir derechos de imagen y normativa aplicable; la model card traslada toda la responsabilidad legal al usuario.
- Riesgo de sobreajuste: al ser un LoRA de identidad de un solo sujeto, es probable que la palabra de activación fuerce el rostro incluso cuando el prompt no lo requiera, y que aparezcan artefactos en composiciones complejas.
- No hay información sobre el dataset de entrenamiento, por lo que no se puede evaluar el sesgo demográfico, la calidad de las imágenes fuente ni posibles problemas de derechos de autor sobre ellas.
- No se documentan limitaciones de idioma, pero los únicos prompts de ejemplo están en inglés; el comportamiento con prompts en castellano no está verificado.
- Sin descargas ni interacciones en el momento de la consulta: no existe validación comunitaria ni evidencia de robustez en producción.
- El adaptador no es autónomo: cualquier fallo, deriva o limitación del modelo base Krea-2-Raw se hereda directamente.
- No se especifica el formato de pesos ni la herramienta de carga exacta; la integración requiere verificar compatibilidad con la versión concreta del pipeline de difusión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farc077/Dongnuan_Fu_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Herramienta de generación del LoRA: https://oneshotlora.com
