# f23gg/Krea-2-Deepthroat

## Resumen

Krea-2-Deepthroat es un adaptador LoRA (Low-Rank Adaptation) para generación de texto a imagen, publicado por el usuario f23gg en Hugging Face. Se trata de un ajuste fino sobre el modelo base krea/Krea-2-Raw, un modelo de difusión de la familia Krea 2, y su función es especializar la generación hacia un contenido sexual explícito concreto, activado mediante las palabras clave `deepthroat` y `penis deep inside mouth`. El repositorio ocupa 0,2 GB y se distribuye en formato compatible con la librería diffusers.

El modelo no aporta arquitectura propia: hereda la del modelo base de difusión sobre el que se entrena el LoRA, por lo que sus capacidades generales de generación, resolución y contexto textual dependen enteramente de Krea-2-Raw. La información publicada por el autor es mínima: no incluye detalles de entrenamiento, número de pasos, rango del LoRA, dataset utilizado ni resultados de evaluación. La model card se limita a indicar las palabras de activación y el enlace de descarga.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy específico y publicado bajo licencia Civitai. Para desarrolladores e investigadores resulta útil principalmente como ejemplo de la mecánica de los LoRA de contenido sobre modelos de difusión, y como caso para evaluar las implicaciones de licencia y moderación de este tipo de publicaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión (base: krea/Krea-2-Raw); arquitectura del base no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el prompt de activación está en inglés) |
| Licencia | other, con licencia denominada "civitai" (enlace a Civitai) |
| Formato de pesos | compatible con diffusers (safetensors presumiblemente; no confirmado en la información) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base de difusión krea/Krea-2-Raw para modificar su comportamiento generativo sin reentrenar todos los pesos. La arquitectura subyacente es, por tanto, la de Krea-2-Raw, un modelo de difusión texto a imagen; la información proporcionada no detalla si se trata de un UNet clásico, un transformer de difusión (DiT) o una variante híbrida, ni tampoco el tamaño del modelo base.

No se dispone de datos sobre el proceso de entrenamiento del LoRA: se desconoce el número de imágenes del dataset, el número de pasos, la tasa de aprendizaje, el rango y alpha del adaptador, ni si se aplicaron técnicas de regularización o captions automáticos. La model card únicamente declara las palabras de activación (`deepthroat` y `penis deep inside mouth`) y remite a la página de Civitai para la descarga. Tampoco hay información sobre evaluación cualitativa más allá de las imágenes de ejemplo del widget.

## Capacidades

- Generación de imágenes texto a imagen mediante el modelo base Krea-2-Raw, con especialización en un contenido sexual explícito concreto.
- Activación mediante las palabras clave `deepthroat` y `penis deep inside mouth`; el autor recomienda una fuerza del LoRA entre 1 y 2 según la página de Civitai.
- Compatibilidad con el ecosistema diffusers, lo que permite cargarlo junto al modelo base en pipelines de Python.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad; son irrelevantes para un modelo de difusión.
- Capacidades multilingües: no documentadas; el prompt de activación está en inglés y no hay evidencia de soporte de otros idiomas.
- No se documentan modos especiales (thinking, visión, audio) más allá de la generación de imagen.

## Casos de uso

- Investigación sobre adaptadores LoRA: el modelo sirve como ejemplo práctico de cómo un LoRA de bajo rango modifica el comportamiento de un modelo de difusión base, útil para estudiar la mecánica de inyección de adaptadores en pipelines diffusers.
- Evaluación de moderación y filtrado de contenido: permite a equipos de seguridad construir y probar clasificadores o filtros de contenido explícito sobre modelos de difusión, usando este LoRA como caso de prueba controlado.
- Estudio de licencias y cumplimiento: útil para analizar cómo se articulan las licencias de modelos base (Krea 2 Community License) con las licencias de adaptadores publicados en plataformas como Civitai.
- Pruebas de reproducibilidad de LoRA de terceros: investigadores pueden verificar si un adaptador publicado sin documentación de entrenamiento produce resultados estables y cómo varía la salida según la fuerza del LoRA.
- Análisis de sesgos y representación: permite examinar qué sesgos de género, cuerpo o etnia introduce un LoRA entrenado sobre un dataset no documentado.
- Docencia sobre ecosistema de difusión: como ejemplo de la estructura de un repositorio diffusers con `base_model` y `instance_prompt`, para explicar cómo se componen los adaptadores en la práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA en sí; depende del modelo base Krea-2-Raw, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible; condicionado por el modelo base.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño y la cuantización del modelo base.
- Opciones de despliegue: diffusers (librería declarada en los tags). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a modelos de difusión en la mayoría de casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| f23gg/Krea-2-Deepthroat | LoRA de difusión | krea/Krea-2-Raw | no disponible | other ("civitai") | Hugging Face, 0 descargas |
| KREA 2 Deepthroat v2.0 (Civitai) | LoRA de difusión | Krea 2 | no disponible | Civitai / Krea 2 Community License | Civitai |
| Krea 2 Deepthroat V1 (Civitai) | LoRA de difusión | Krea 2 | no disponible | Civitai / Krea 2 Community License | Civitai |

No se dispone de datos de rendimiento cuantitativo para establecer una comparación técnica con alternativas; la comparativa se limita a tipo de artefacto, modelo base y licencia.

## Limitaciones y advertencias

- Contenido sexual explícito: el modelo está diseñado para generar material para adultos; no es apto para entornos sin verificación de edad ni para productos dirigidos al público general.
- Documentación inexistente: no hay información sobre dataset, pasos de entrenamiento, rango del LoRA ni evaluación, lo que impide auditar su comportamiento o reproducir el entrenamiento.
- Riesgo de sesgos: al no documentarse el dataset, no puede evaluarse la representación de géneros, cuerpos o etnias; es probable que herede y amplifique sesgos del modelo base y del material de entrenamiento.
- Alucinación visual: como todo modelo de difusión, puede producir anatomías incorrectas, artefactos y composiciones incoherentes, especialmente con prompts complejos.
- Licencia: la licencia "civitai" y la Krea 2 Community License del modelo base imponen restricciones que deben revisarse antes de cualquier uso comercial; el uso comercial no está garantizado y puede estar prohibido según los términos del modelo base.
- Restricciones de plataforma: la publicación en Hugging Face con contenido explícito puede estar sujeta a las políticas de contenido de la plataforma; su disponibilidad futura no está garantizada.
- Sin soporte ni mantenimiento: cero descargas y cero likes en el momento de la consulta, sin evidencia de mantenimiento por parte del autor.
- Idiomas: no hay evidencia de que las palabras de activación funcionen fuera del inglés.

## Enlaces

- Hugging Face: https://huggingface.co/f23gg/Krea-2-Deepthroat
- Civitai (modelo referenciado en la licencia): https://civitai.red/models/2818160/krea-2-deepthroat?modelVersionId=3178745
- Civitai (v2.0): https://civitai.red/models/2764854/krea-2-deepthroat
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
