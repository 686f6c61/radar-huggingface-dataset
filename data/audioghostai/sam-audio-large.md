# audioghostai/sam-audio-large

## Resumen

SAM-Audio Large es un modelo de separación de fuentes de audio basado en prompts de texto, desarrollado originalmente por Meta (Facebook) y publicado bajo la referencia `facebook/sam-audio-large`. Esta ficha describe la copia no oficial `audioghostai/sam-audio-large`, un reempaquetado de los pesos de Meta realizado por el proyecto AudioGhost para facilitar su descarga sin necesidad de cuenta en Hugging Face. El modelo resuelve la tarea de aislar una fuente sonora concreta dentro de una mezcla de audio (por ejemplo, extraer una voz o un instrumento) guiándose por una descripción textual.

La arquitectura se articula en torno a un diffusion transformer que opera sobre representaciones de audio, acompañado de capas auxiliares (anchor embedding, proyecciones y alineamiento de vídeo) y de un codificador de texto público, `t5-base`. La copia de AudioGhost excluye el codificador visual (usado solo para prompting visual) y externaliza el códec de audio al repositorio `audioghostai/sam-audio-shared`. El repositorio ocupa 17,6 GB e incluye los pesos en dos precisiones: fp32 (10,94 GB) y fp16 (5,47 GB).

La relevancia de esta ficha radica en que documenta una vía de acceso práctica a los pesos de SAM-Audio Large sin autenticación, manteniendo los valores originales de Meta en el fichero fp32. Es importante subrayar que no es un modelo nuevo ni un fine-tuning: es una redistribución de los pesos de Meta bajo la SAM License, con los tensores convertidos de `checkpoint.pt` (pickle) a safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer para separación de fuentes de audio, con anchor embedding, proyecciones y alineamiento de vídeo; codificador de texto `t5-base` |
| Parametros totales | no disponible (el repo contiene 10,94 GB en fp32 y 5,47 GB en fp16 de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 y fp16 (ficheros `model.fp32.safetensors` y `model.fp16.safetensors`); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el prompting textual depende de `t5-base`; no se especifican idiomas) |
| Licencia | SAM License (`sam-license`, marcada como `other` en Hugging Face) |
| Formato de pesos | safetensors (fp32 y fp16); `config.json` en formato JSON |

## Arquitectura y entrenamiento

El modelo emplea un diffusion transformer que genera la fuente de audio objetivo condicionado por un prompt textual. Alrededor del transformer principal se sitúan capas auxiliares: un anchor embedding, proyecciones y módulos de alineamiento de vídeo. El condicionamiento textual se obtiene mediante el codificador público `t5-base`, tal como aparece en el código de Meta. La copia de AudioGhost conserva únicamente las partes necesarias para la separación guiada por texto y omite el codificador visual, que en el modelo original solo se usa para prompting visual. El códec de audio necesario se distribuye por separado en `audioghostai/sam-audio-shared`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta copia no aporta detalles sobre el proceso de entrenamiento original de Meta, y tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La única modificación técnica respecto al checkpoint original es el cambio de formato: de un `checkpoint.pt` serializado con pickle a safetensors, con una versión fp32 idéntica a los valores de Meta y una versión fp16 equivalente al casteo que AudioGhost aplica por defecto en ejecución.

## Capacidades

- Separación de fuentes de audio guiada por prompt de texto: aísla la fuente descrita (voz, instrumento, sonido concreto) dentro de una mezcla.
- Pipeline `audio-to-audio`: entrada de audio y salida de audio procesada.
- Condicionamiento mediante lenguaje natural a través de `t5-base`.
- Alineamiento de vídeo incluido en los pesos (capas de alineamiento), aunque el codificador visual no forma parte de esta copia.
- Ejecución en fp16 (por defecto en AudioGhost) y en fp32/bf16 para fine-tuning.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio general ni generación de texto.

## Casos de uso

- Producción musical y postproducción: extraer una pista vocal o un instrumento concreto de una mezcla mediante un prompt textual, para remezclas, stems o limpieza de grabaciones. El condicionamiento por texto permite seleccionar la fuente sin segmentación manual.
- Restauración de audio de archivo: aislar voces o locuciones de grabaciones con ruido de fondo o música, usando una descripción textual de la fuente deseada.
- Doblaje y localización: separar diálogos de la música y efectos para sustituir o regenerar pistas de voz en un idioma distinto.
- Investigación en separación de fuentes: servir como checkpoint de referencia (fp32 sin modificar) para reproducir resultados de Meta o para fine-tuning en dominios específicos.
- Creación de datasets de audio: generar pares fuente/mezcla etiquetados a partir de descripciones textuales para entrenar otros modelos.
- Integración en herramientas de edición de audio: AudioGhost puede desplegar el modelo en fp16 (5,47 GB) para separación interactiva en estaciones de trabajo con GPU de gama alta de consumo.
- Prototipado rápido sin cuenta de Hugging Face: el reempaquetado permite descargar y probar los pesos directamente desde el repositorio, útil en entornos automatizados o CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 5,5 GB solo para los pesos en fp16, más el códec de audio (repositorio compartido) y el codificador `t5-base`; en la práctica se recomienda al menos 8-12 GB de VRAM para fp16 y 16-24 GB para fp32.
- GPU recomendadas: A100 o H100 para fp32 y procesamiento por lotes; RTX 4090 o RTX 3090 para fp16.
- GPU de consumo: fp16 debería caber en GPUs con 8 GB o más (RTX 3070/4060 Ti y superiores), siempre que se cargue también el códec y `t5-base`.
- Opciones de despliegue: el repositorio está pensado para AudioGhost; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a LLMs, no a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audioghostai/sam-audio-large (esta ficha) | Diffusion transformer para separación por prompt de texto | no disponible (10,94 GB fp32 / 5,47 GB fp16) | no disponible | SAM License | Hugging Face, sin cuenta |
| facebook/sam-audio-large (original) | Diffusion transformer para separación por prompt de texto | no disponible | no disponible | SAM License | Hugging Face, requiere cuenta |
| audioghostai/sam-audio-shared | Códec de audio auxiliar | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de separación de fuentes (p. ej. Demucs, Open-Unmix) | Modelos especializados en stems musicales | no disponible | no aplica | varía | varía |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Copia no oficial: no está hecha, respaldada ni soportada por Meta; cualquier problema debe reportarse al proyecto AudioGhost, no a Meta.
- Licencia SAM: el uso y la redistribución están sujetos a la SAM License, incluida la sección de controles de comercio (Trade Controls). Cualquier redistribución o trabajo derivado debe hacerse bajo la misma licencia e incluir una copia de ella. Es imprescindible revisar los términos antes de un uso comercial.
- Funcionalidad reducida respecto al original: el codificador visual está excluido, por lo que el prompting visual no está disponible en esta copia.
- Dependencia externa: el códec de audio debe descargarse por separado desde `audioghostai/sam-audio-shared`; sin él el modelo no es funcional.
- Idiomas: no se especifican idiomas soportados para el prompting textual; el comportamiento multilingüe depende de `t5-base` y no está documentado para esta tarea.
- Riesgo de alucinación y artefactos: no se documentan métricas de fidelidad ni de artefactos en la separación; conviene validar cualitativamente en el dominio de uso.
- Sesgos: no disponibles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en esta copia; se recomienda evaluar con el checkpoint fp32 de Meta como referencia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/audioghostai/sam-audio-large
- Modelo original de Meta: https://huggingface.co/facebook/sam-audio-large
- Códec de audio compartido: https://huggingface.co/audioghostai/sam-audio-shared
- Proyecto AudioGhost: https://github.com/0x0funky/audioghost-ai
- Codificador de texto: https://huggingface.co/google-t5/t5-base
- Licencia SAM: incluida como `LICENSE` en el repositorio
