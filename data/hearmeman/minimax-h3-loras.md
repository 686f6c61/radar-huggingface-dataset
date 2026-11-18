# Hearmeman/minimax-h3-loras

## Resumen

MiniMax-H3 LoRAs es una colección de adaptadores LoRA de bajo rango para el modelo generativo de vídeo MiniMax-H3, publicada por el usuario Hearmeman (HearmemanAI) bajo la licencia comunitaria de MiniMax. El repositorio actúa como espejo accesible sin autenticación de los LoRAs que el autor distribuye en CivitAI, e incluye adaptadores de concepto único especializados en contenido para adultos: unos enseñan al modelo base la anatomía de una parte del cuerpo ("anatomy adapters", entrenados con imágenes fijas) y otros le enseñan qué hace un cuerpo ("action adapters", entrenados con vídeo). Su relevancia actual es práctica: permiten modular el comportamiento del modelo base H3 en flujos de trabajo de ComfyUI sin reentrenar el modelo completo, y su diseño por capas permite apilarlos sobre LoRAs de personaje o escena ya existentes.

El repositorio ocupa 4,1 GB y contiene archivos individuales de entre 78 MB y 626 MB, lo que refleja el rango de rangos y de capas entrenadas de cada adaptador. La ficha del modelo base (MiniMaxAI/MiniMax-H3) no está incluida en la información disponible, por lo que los datos de arquitectura, parámetros y contexto del modelo subyacente se indican como no disponibles.

Conviene subrayar que este repositorio no es un modelo autónomo: es un conjunto de pesos LoRA que requieren el modelo base MiniMax-H3 para funcionar, y su contenido está marcado explícitamente como no apto para todo público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre el modelo base MiniMax-H3; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (el tamaño de los adaptadores oscila entre 78 MB y 626 MB por archivo) |
| Parametros activos | No aplica (no es un modelo MoE; es un conjunto de adaptadores) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; se distribuyen pesos en safetensors sin indicación de variantes cuantizadas |
| Idiomas soportados | No disponibles |
| Licencia | minimax-h3-community-license (heredada del modelo base; enlace en la model card) |
| Formato de pesos | safetensors |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Pipeline | text-to-video (con soporte declarado de image-to-video) |
| Libreria | minimax-h3 |
| Tamano del repositorio | 4,1 GB |
| Descargas | 52.569 |
| Likes | 83 |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA de rango bajo que se aplican sobre el modelo de difusión de vídeo MiniMax-H3. La model card distingue dos familias según el régimen de entrenamiento: los adaptadores de acción están entrenados con vídeo y los de anatomía con imágenes fijas. El adaptador más reciente, HMNSFW V2.5, se entrenó con cerca de 1000 vídeos, aproximadamente 15 veces el conjunto de datos de la versión V2, durante más de 40 horas de entrenamiento. El autor indica que esta versión se concibió como V3 pero no está terminada, y que habrá más versiones.

Los adaptadores son de concepto único y están diseñados para apilarse: la recomendación del autor es colocarlos por debajo del LoRA de personaje o de escena que ya se esté usando, de modo que el adaptador de anatomía aporte la representación de la parte del cuerpo y el de acción aporte el movimiento. Cada adaptador define una palabra de activación (trigger) y un rango de fuerza recomendado; cuando no se publica una fuerza concreta, el autor sugiere empezar en 1.0 y reducirla progresivamente. No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el modelo base MiniMax-H3, modulado por los adaptadores.
- Generación de vídeo a partir de imagen (image-to-video); el autor señala que el adaptador HMNSFW V2.5 funciona especialmente bien en este modo, con anatomía y movimiento coherentes.
- Especialización anatómica: adaptadores que enseñan al modelo la representación de partes del cuerpo concretas (HMPussy, HMInnie, HMBreasts, HMPenis).
- Especialización de acción: adaptadores que enseñan al modelo movimientos y acciones concretas (HMNSFW AIO, HMCumshot, HMSquirt, HMMasturbation).
- Apilamiento de adaptadores: combinación de adaptadores de anatomía y de acción con LoRAs de personaje o escena.
- Control mediante palabras de activación específicas por adaptador (`hmmotion`, `cumshot`, `hmsquirt`, `Pussy`, `vagina`, `anus`, `inniepussy`, `tits`, `HMBreasts`, `HMPenis`, entre otras).
- Integración con ComfyUI: el autor publica flujos de trabajo gratuitos y plantillas de Runpod orientadas a este entorno.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Producción de vídeo para adultos con ComfyUI: cargar el modelo base H3, aplicar el LoRA de personaje o escena y apilar encima el adaptador de anatomía y el de acción correspondientes; el flujo por capas permite ajustar el resultado sin reentrenar el modelo completo.
- Animación image-to-video de imágenes fijas: el adaptador HMNSFW V2.5 está entrenado específicamente para este régimen y el autor lo describe como su punto fuerte, con anatomía y movimiento coherentes, lo que lo hace adecuado para animar retratos o ilustraciones existentes.
- Creación de variantes de un mismo concepto: al ser adaptadores de concepto único con palabra de activación propia, permiten generar distintas versiones de una misma escena cambiando únicamente el adaptador de acción y manteniendo fijo el de personaje.
- Despliegue en infraestructura cloud: el autor proporciona una plantilla de Runpod enlazada desde la model card, pensada para ejecutar los flujos de MiniMax-H3 con estos LoRAs en GPU remotas.
- Investigación sobre adaptación de bajo rango en modelos de vídeo: el repositorio documenta entrenamientos con cerca de 1000 vídeos y más de 40 horas, lo que sirve como referencia práctica de coste y volumen de datos para ajustar adaptadores de acción.
- Distribución automatizada de pesos: el repositorio existe para permitir descargar los pesos con una URL `resolve` simple sin necesidad de cuenta, lo que facilita integrarlos en pipelines de descarga automatizada o en imágenes de contenedor.
- Verificación de integridad de artefactos: la model card publica sumas SHA-256 que coinciden con las versiones de CivitAI, lo que permite validar que el archivo descargado es idéntico al publicado originalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende enteramente del modelo base MiniMax-H3, cuyos requisitos no se detallan.
- GPU recomendadas: no disponibles; el autor ofrece una plantilla de Runpod, lo que sugiere despliegue en GPU cloud, pero no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (entorno principal promocionado por el autor) y plantilla de Runpod. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio completo ocupa 4,1 GB; los adaptadores individuales van de 78 MB a 626 MB, por lo que solo es necesario descargar los que se vayan a usar.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para generación de vídeo) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Contenido explícito para adultos: el repositorio está etiquetado como `not-for-all-audiences` y todos los adaptadores están orientados a contenido sexual explícito; no es apto para uso general ni para entornos sin control de edad.
- Licencia: se hereda la `minimax-h3-community-license` del modelo base, con términos adicionales que no se detallan en la información disponible; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial.
- Dependencia del modelo base: los adaptadores no funcionan de forma autónoma; requieren MiniMax-H3 y su licencia, además de los recursos de hardware que este exija.
- Calidad dependiente del prompt: el autor advierte explícitamente que un prompt corto o vago produce malos resultados y recomienda igualar la longitud y el registro de los ejemplos publicados en CivitAI.
- Variabilidad por semilla: la model card reconoce "la ocasional mala semilla" incluso en el adaptador más reciente, lo que implica necesidad de reintentos en producción.
- Versión inacabada: HMNSFW V2.5 se describe como un trabajo en curso que iba a ser V3, con más versiones previstas; su comportamiento puede cambiar entre publicaciones.
- Fuerza de adaptador mal calibrada: aplicar fuerzas fuera del rango recomendado (por ejemplo, por encima de 0.9 en los adaptadores de acción, o por encima de 0.5 en HMNSFW V2) puede degradar el resultado.
- Pesos incompletos en el espejo: HMMisDog v1.0 está listado en CivitAI pero sus pesos no se replican en este repositorio.
- Sin datos de sesgo, alucinación o cobertura idiomática: no se ha publicado información al respecto, y en un modelo de difusión de vídeo estos conceptos no se aplican de la misma forma que en un LLM.
- Trazabilidad: el repositorio es un espejo de CivitAI; los vídeos de muestra, el historial de versiones y los hilos de comentarios solo están disponibles en la plataforma original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hearmeman/minimax-h3-loras
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia comunitaria MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Sitio del autor (flujos de ComfyUI, plantillas y guías): https://hearmemanai.com/
- Discord del autor: https://discord.gg/ZVWVhT43GW
- Plantilla de Runpod para MiniMax: https://get.runpod.io/minimax-template
- Perfil del autor en CivitAI: https://civitai.com/user/HearmemanAI
- HMNSFW V2.5 (AIO Sex): https://civitai.com/models/2834417?modelVersionId=3268303
- HMNSFW V2 (AIO Sex): https://civitai.com/models/2834417?modelVersionId=3206518
- HMCumshot v1.0: https://civitai.com/models/2857340?modelVersionId=3329529
- HMCumshot V0.5: https://civitai.com/models/2857340?modelVersionId=3238531
- HMMasturbation v2.0: https://civitai.com/models/2893742?modelVersionId=3310312
- HMSquirt v0.1: https://civitai.com/models/2893742?modelVersionId=3271912
- HMMisDog v1.0: https://civitai.com/models/2924146?modelVersionId=3308736
- HMPussy V2: https://civitai.com/models/2846342?modelVersionId=3436891
- HMPussy V1: https://civitai.com/models/2846342?modelVersionId=3252213
- HMPussy v0.5: https://civitai.com/models/2846342?modelVersionId=3215304
- HMInnie v1.0: https://civitai.com/models/2853405?modelVersionId=3222484
- HMBreasts V2: https://civitai.com/models/2848799?modelVersionId=3268969
- HMBreasts V1.0: https://civitai.com/models/2848799?modelVersionId=3216751
- HMPenis v1.0: https://civitai.com/models/2849923?modelVersionId=3218160
