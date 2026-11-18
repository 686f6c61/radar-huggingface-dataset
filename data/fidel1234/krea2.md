# fidel1234/Krea2

## Resumen

Krea2 Asian Character LoRA es un adaptador de bajo rango (LoRA) publicado por el usuario fidel1234 en Hugging Face, diseñado para su uso con los modelos base Krea-2-Raw y Krea-2-Turbo de Krea. El adaptador está orientado a la generación de personajes de estética asiática, con especial énfasis en personajes japoneses, y se distribuye como un conjunto de pesos en formato safetensors compatible con la librería diffusers y con flujos de trabajo de ComfyUI.

El modelo no es un modelo fundacional, sino un ajuste paramétricamente eficiente sobre Krea 2. Se entrenó con AI-Toolkit sobre el checkpoint raw de Krea 2 y está pensado para funcionar tanto en variantes raw como turbo del modelo base. El repositorio tiene un tamano de 45,3 GB, lo que sugiere la presencia de múltiples archivos de pesos o variantes dentro del mismo repo.

Su relevancia actual radica en que permite incorporar un estilo y una distribución de personajes concretos sobre un modelo base de generación de imágenes sin necesidad de reentrenar el modelo completo, con una licencia MIT que facilita su uso comercial (sujeta, no obstante, a la licencia del modelo base). El número de descargas registrado (más de un millón según los metadatos de Hugging Face) indica una adopción notable dentro de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base de difusión Krea-2 |
| Parametros totales | no disponible (adaptador LoRA; el tamano del repo es de 45,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; el autor indica enfoque en personajes japoneses) |
| Licencia | MIT (sujeta además a la licencia comunitaria y política de uso aceptable de Krea 2) |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base de difusión Krea 2 sin modificar los pesos originales. El entrenamiento se realizó sobre el checkpoint Krea-2-Raw utilizando el framework AI-Toolkit. El autor indica que el adaptador es compatible tanto con los checkpoints raw como turbo del modelo base, lo que permite su uso en configuraciones de muestreo con distinto número de pasos.

El dataset de entrenamiento se describe como una selección manual y equilibrada de imágenes que combina primeros planos, planos medios, cuerpo completo y distintos ángulos, con el objetivo de ofrecer flexibilidad en el encuadre y el control de perspectiva. No se proporcionan datos sobre el número de imágenes, el número de pasos de entrenamiento, el rango del LoRA ni la composición exacta del dataset. El flujo de generación recomendado y la palabra de activación (trigger word) no están incrustados en el archivo safetensors, sino únicamente en los metadatos de las imágenes de muestra adjuntas.

## Capacidades

- Generación de imágenes de personajes con estética asiática, con especial orientación a personajes japoneses.
- Control de encuadre y perspectiva gracias a la composición del dataset (primeros planos, planos medios, cuerpo completo y ángulos variados).
- Compatibilidad con los checkpoints Krea-2-Raw y Krea-2-Turbo del modelo base.
- Integración con ComfyUI y con la librería diffusers.
- Carga del flujo de trabajo completo y de la palabra de activación arrastrando la imagen de muestra en la interfaz (los parámetros están en los metadatos de la imagen, no en el safetensors).
- Pesos recomendados de aplicación del adaptador entre 0,8 y 1,0, con 20 a 30 pasos de inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, al tratarse de un modelo de generación de imágenes.

## Casos de uso

- Ilustración de personajes para cómics y novelas ligeras: el adaptador permite generar personajes de estética japonesa con encuadres variados (retrato, plano medio, cuerpo completo) usando el checkpoint turbo para iterar rápido y el raw para la versión final.
- Creación de assets para videojuegos: generación de retratos y hojas de personaje con distintos ángulos, útil para prototipado de personajes secundarios antes de encargar el arte final.
- Contenido para redes sociales y avatares: con pesos de LoRA en torno a 0,8 y 20-30 pasos, se pueden producir retratos consistentes con el estilo entrenado para perfiles y publicaciones.
- Previsualización de guiones gráficos: generación rápida de viñetas con personajes coherentes en plano medio y cuerpo completo para validar composición y narrativa antes de la producción.
- Prototipado de merchandising: generación de ilustraciones para camisetas, postales o figuras, aprovechando la licencia MIT para uso comercial (respetando la licencia del modelo base Krea 2).
- Flujos de trabajo en ComfyUI con parámetros reproducibles: al arrastrar la imagen de muestra se recuperan los parámetros exactos de generación, lo que facilita la reproducibilidad en equipos y la estandarización de estilos dentro de un estudio.
- Fines educativos y de investigación sobre adaptadores LoRA: el repositorio sirve como ejemplo práctico de entrenamiento con AI-Toolkit sobre un modelo de difusión y de distribución de adaptadores con metadatos en las imágenes de muestra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador. Al operar sobre el modelo base Krea 2, los requisitos vendrán determinados por el checkpoint base utilizado (raw o turbo) y su precisión de carga; el adaptador anade una sobrecarga reducida al ser LoRA.
- GPU recomendadas: no disponible en la información proporcionada. Al ser un adaptador sobre un modelo de difusión de gran tamano, se recomienda consultar los requisitos del modelo base Krea 2.
- Compatibilidad con GPU de consumo: no disponible. El tamano del repositorio (45,3 GB) sugiere que la carga completa puede exceder la VRAM de muchas GPU de consumo, por lo que conviene evaluar variantes cuantizadas o de menor precisión del modelo base.
- Opciones de despliegue: ComfyUI (raw y turbo), librería diffusers. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusión de imágenes.
- Latencia y throughput: no disponibles. Dependerán del checkpoint base, del número de pasos (recomendado 20-30) y del hardware utilizado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un adaptador LoRA específico para Krea 2, por lo que su comparación directa requeriría otros adaptadores LoRA para el mismo modelo base o para modelos de difusión de imágenes de propósito general, datos que no se incluyen en la información disponible.

## Limitaciones y advertencias

- El adaptador está entrenado principalmente para personajes japoneses y de estética asiática; su comportamiento fuera de ese dominio no está documentado.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado sobre un dataset seleccionado manualmente, puede heredar sesgos de representación del mismo (por ejemplo, en diversidad de rasgos, edades o tipos corporales).
- Riesgo de alucinación y artefactos propio de los modelos de difusión: anatomía incorrecta, manos deformadas o incoherencias en el encuadre, especialmente con pesos de LoRA altos o pocos pasos de inferencia.
- La palabra de activación y el flujo de trabajo no están en el archivo safetensors, sino en los metadatos de las imágenes de muestra; si estas no se conservan, se pierde la referencia exacta de generación.
- La licencia MIT del adaptador no exime del cumplimiento de la licencia comunitaria y la política de uso aceptable de los modelos base Krea 2, que pueden imponer restricciones adicionales al uso comercial.
- El autor advierte explícitamente contra la generación de contenido enganoso, danino o no consentido relativo a las personas representadas.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto de forma generativa; el soporte idiomático de los prompts dependerá del codificador de texto del modelo base.
- El repositorio tiene un tamano de 45,3 GB, lo que puede implicar requisitos de almacenamiento y de ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fidel1234/Krea2
- Visor de muestra (Space): https://huggingface.co/spaces/fidel1234/Krea2_Asian_Character_Showcase
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
