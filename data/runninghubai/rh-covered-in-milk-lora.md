# RunningHubAI/rh-covered-in-milk-lora

## Resumen

rh-covered-in-milk-lora es un adaptador LoRA de edición de imagen (pipeline image-text-to-image) publicado por la cuenta RunningHubAI en Hugging Face. Se distribuye en un único fichero de pesos, `covered.safetensors`, de 436 MiB, y está pensado para cargarse sobre un modelo de difusión base: la model card indica que está afinado a partir de krea2 ("Finetuned from: krea2"). No es, por tanto, un modelo autónomo, sino un adaptador que modifica el comportamiento de la red base para aplicar un efecto visual concreto.

El repositorio no aporta documentación técnica: no se especifican parámetros del adaptador, rango del LoRA, composición del dataset, número de pasos de entrenamiento, hiperparámetros ni métricas de evaluación. Tampoco se declara licencia concreta más allá de una nota genérica que remite a la licencia del proyecto original. La información disponible se limita al nombre, el tipo de modelo, el tamaño del fichero, la procedencia (originalmente publicado en RunningHub y vinculado a un modelo de Civitai) y los enlaces a la plataforma del autor.

Su interés es práctico y acotado: permite reproducir un efecto de cobertura de líquido blanco sobre el sujeto dentro de flujos de generación y edición de imagen en ComfyUI, sin reentrenar un modelo completo. Está dirigido a creadores de contenido visual que ya trabajan con ComfyUI o con la infraestructura de RunningHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión base identificado como krea2 |
| Parámetros totales | No disponible (el fichero de pesos ocupa 436 MiB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen); no disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`covered.safetensors`, 436 MiB) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna. Por el tipo declarado (LoRA de edición de imagen) y el pipeline (image-text-to-image), se trata de un adaptador de bajo rango que se acopla a un modelo de difusión base identificado como "krea2". El repositorio declara un tamaño total de 0,5 GB, correspondiente casi en su totalidad al fichero `covered.safetensors`.

No hay datos sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, si se usó regularización con imágenes de clase, técnicas de RLHF/DPO (no aplicables habitualmente en difusión) ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card enlaza a un modelo de Civitai como origen del concepto y menciona que RunningHub ofrece servicios de entrenamiento, pero no documenta el procedimiento seguido para este adaptador concreto. Toda la información relativa a entrenamiento debe considerarse "no disponible".

## Capacidades

- Edición y generación de imagen guiada por texto (image-text-to-image) mediante un adaptador LoRA.
- Aplicación de un efecto visual específico: cobertura del sujeto con un líquido blanco (leche), según el nombre del modelo.
- Integración como nodo de LoRA en flujos de trabajo de ComfyUI.
- Uso dentro de la plataforma RunningHub, tanto en su versión internacional como en la china.
- Compatibilidad declarada con Hugging Face como repositorio de distribución de los pesos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: son capacidades propias de modelos de lenguaje y no aplican a este adaptador.
- Capacidades multilingües: no disponibles. La model card está redactada en inglés y chino, pero no se especifica el comportamiento del modelo ante prompts en distintos idiomas.
- Control de composición o pose: no disponible.

## Casos de uso

- Fotografía de producto simulada: aplicar el efecto de líquido blanco sobre bodegones (vasos, botellas, repostería) para generar variaciones de una sesión sin repetir el rodaje físico. Requiere cargar el LoRA en ComfyUI sobre el modelo base krea2.
- Ilustración editorial y conceptual: usar el efecto como recurso metafórico (por ejemplo, "inundado", "cubierto") en encargos de prensa o portadas, ajustando la intensidad del LoRA mediante el peso del nodo.
- Efectos visuales para vídeo y cortometrajes: generar fotogramas clave o plates de referencia que luego se animan en herramientas externas, aprovechando que el adaptador es ligero (436 MiB) y se puede iterar rápido.
- Contenido para redes sociales: producción de imágenes de formato vertical u horizontal con un estilo reconocible y consistente, encadenando el LoRA con otros adaptadores de estilo en el mismo grafo de ComfyUI.
- Prototipado de conceptos para dirección de arte: generar un tablero de referencias (moodboard) en minutos para validar una idea antes de invertir en producción fotográfica o 3D.
- Automatización vía API de RunningHub: integrar la generación en un pipeline programático que reciba prompts y devuelva imágenes, útil para catálogos o campañas con muchas variantes.
- Experimentación e investigación en adaptadores de difusión: servir como caso de estudio para analizar cómo un LoRA de bajo rango modifica la salida de un modelo base, siempre que se respete la licencia del proyecto original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, SSIM, comparativas con otros adaptadores) ni evaluaciones humanas. No se dispone tampoco de datos de latencia o throughput medidos.

## Requisitos de hardware

- El adaptador en sí ocupa 436 MiB en disco (repositorio de 0,5 GB), por lo que su huella de almacenamiento es reducida.
- La VRAM necesaria para inferencia depende por completo del modelo base krea2 sobre el que se carga el LoRA y del pipeline de imagen utilizado; no disponible en la información proporcionada.
- GPU recomendadas: no disponible. No se documenta compatibilidad con A100, H100, RTX 4090 ni otras tarjetas.
- ¿Cabe en GPU de consumo?: no disponible. El tamaño del adaptador es pequeño, pero el requisito real lo marca el modelo base.
- Opciones de despliegue: se declaran explícitamente ComfyUI, la plataforma RunningHub (internacional y China) y Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica adaptadores LoRA comparables ni ofrece datos de rendimiento, contexto o licencia que permitan una comparación rigurosa. El único punto de referencia declarado es el modelo base krea2, del que tampoco se detallan especificaciones.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen parámetros del LoRA, rango, dataset, hiperparámetros ni evaluación, lo que dificulta reproducir o auditar el entrenamiento.
- Licencia no especificada: la model card solo indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream. Esto impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Contenido potencialmente sensible: el nombre del modelo y su vinculación a un modelo de Civitai sugieren temática de desnudo o contenido para adultos. Debe verificarse la adecuación antes de desplegarlo en productos públicos o en entornos corporativos.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, artefactos en manos, texto ilegible o inconsistencias entre la instrucción y la imagen resultante.
- Sesgos: no documentados. Al no publicarse la composición del dataset, no es posible evaluar sesgos demográficos, culturales o de representación.
- Dependencia del modelo base: el resultado depende de krea2; un cambio de versión o de licencia del modelo base puede alterar o invalidar el comportamiento del adaptador.
- Idiomas: no se especifica el soporte multilingüe de los prompts. En la práctica, conviene asumir inglés salvo verificación propia.
- Contexto largo, tool calling y agentes: no aplican a este tipo de modelo.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-covered-in-milk-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2072481747509534722
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Origen del concepto en Civitai: https://civitai.red/models/2746432/cum-on-it-krea-2?modelVersionId=3089256
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
