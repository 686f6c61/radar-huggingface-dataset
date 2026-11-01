# SistemAi/sistem-loras

## Resumen

`sistem-loras` es un repositorio de adaptadores LoRA para el modelo de generación de vídeo Wan 2.2 (variante image-to-video A14B), publicado por SistemAi. No se trata de un modelo base, sino de una colección de 13 ficheros LoRA entrenados por autores originales en Civitai y reempaquetados aquí para que los proveedores de inferencia puedan descargarlos de forma directa. El repositorio ocupa 8,2 GB y está etiquetado como contenido para adultos (`not-for-all-audiences`).

La relevancia de este repositorio es logística más que técnica: agrupa adaptadores dispersos en Civitai bajo una única descarga, con una tabla que mapea cada fichero a su autor, a la URL de origen y a la fuerza de aplicación recomendada. Doce de los adaptadores están pensados para Wan 2.2, mientras que uno (`wan21-squirt`) fue entrenado sobre Wan 2.1 y otro apunta a un modelo distinto, Qwen Image Edit 2511.

Al no existir model card técnica, no hay información sobre arquitectura del modelo base, número de parámetros, contexto ni datos de entrenamiento. La ficha se limita a describir lo que el repositorio contiene y las implicaciones prácticas de usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre Wan 2.2 A14B image-to-video; un adaptador sobre Wan 2.1; dos adaptadores sobre Qwen Image Edit 2511 |
| Parametros totales | no disponible (depende del rango y las capas objetivo de cada LoRA; el repo pesa 8,2 GB en total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `civitai-per-file` (cada LoRA conserva la licencia elegida por su autor original) |
| Formato de pesos | no disponible (el repo se sirve a través de la librería `wan2.2`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo base, sino adaptadores LoRA que se cargan sobre Wan 2.2 image-to-video (A14B). Cada fichero modifica un subconjunto de pesos del modelo base para inducir un estilo o un movimiento concreto. La nomenclatura `high` / `low` hace referencia a los dos expertos de ruido del pipeline de Wan 2.2: los adaptadores `high` se aplican en la fase de ruido alto y los `low` en la de ruido bajo, según indica el autor en la sección de uso (`high_noise_loras` y `low_noise_loras`).

No hay información sobre el dataset de entrenamiento, el número de pasos, el rango de las matrices LoRA ni la composición de las imágenes o vídeos usados. Tampoco se documenta si hubo regularización, captions o aumento de datos. Los adaptadores proceden de autores distintos en Civitai, por lo que las metodologías de entrenamiento probablemente difieren entre ficheros y no están unificadas.

## Capacidades

- Modificación de estilo y de movimiento sobre generaciones image-to-video de Wan 2.2, aplicando un LoRA con una fuerza recomendada por el autor (0,6-0,7 para estilo, 0,9 para movimiento).
- Aplicación por pares `high`/`low` para los adaptadores que incluyen ambas variantes, lo que permite controlar la influencia del LoRA en distintas fases del proceso de difusión.
- Un adaptador entrenado sobre Wan 2.1 (`wan21-squirt`), utilizable solo con ese modelo base.
- Dos adaptadores de estilo fotográfico para Qwen Image Edit 2511 (`qwen-edit-2511-sexgod-v2` y `qwen-image-facial-cumshots`), fuera del ecosistema Wan.
- Contenido exclusivamente para adultos: el repositorio está marcado como `not-for-all-audiences` y todos los adaptadores están orientados a escenas explícitas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, ya que no es un modelo de lenguaje.

## Casos de uso

- **Generación de vídeo para adultos con control de estilo:** cargar `wan22-nsfw-high-e8` y `wan22-nsfw-low-e8` con fuerza 0,6-0,7 sobre Wan 2.2 I2V para inducir un aspecto visual concreto en la animación de una imagen de entrada.
- **Animación de imágenes con movimientos específicos:** usar los LoRA de movimiento (`wan22-french-kiss-high/low`, `wan22-cowgirl-high/low`) con fuerza 0,9 para dirigir la acción de la secuencia generada a partir de un fotograma inicial.
- **Pipelines de proveedores de inferencia:** descargar el repositorio completo en un servidor de inferencia y servir los adaptadores a los clientes que los soliciten, que es el uso explícito que declara el autor.
- **Investigación sobre adaptadores de bajo rango en difusión de vídeo:** comparar el efecto de variantes `high` frente a `low` del mismo LoRA sobre la coherencia temporal y la fidelidad al prompt.
- **Edición de imagen fija con Qwen Image Edit:** aplicar `qwen-edit-2511-sexgod-v2` (2,36 GB) para modificar una imagen existente con un estilo fotográfico concreto.
- **Compatibilidad con Wan 2.1:** reutilizar `wan21-squirt` en despliegues que sigan sobre Wan 2.1 en lugar de 2.2, siempre que el pipeline soporte la carga de LoRA de esa versión.
- **Curaduría y archivado:** mantener una copia espejo de adaptadores de Civitai para evitar dependencias de la disponibilidad de la plataforma original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM para el modelo base:** no disponible en la información proporcionada. Wan 2.2 A14B es un modelo de vídeo de gran tamaño; los requisitos dependen de la implementación y de la precisión, pero el repositorio no los documenta.
- **VRAM adicional para los LoRA:** no cuantificada. El repositorio completo pesa 8,2 GB, aunque en inferencia solo se carga el adaptador en uso.
- **GPU recomendadas:** no disponible.
- **Compatibilidad con GPU de consumo:** no disponible.
- **Opciones de despliegue:** el repo se sirve a través de la librería `wan2.2`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de vídeo.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `SistemAi/sistem-loras` | Colección de LoRA | Wan 2.2 A14B, Wan 2.1 y Qwen Image Edit 2511 | no disponible | no disponible | civitai-per-file | HuggingFace (0 descargas) |
| LoRA individuales en Civitai | LoRA sueltos | Wan 2.2 / Wan 2.1 | no disponible | no disponible | variable por autor | Civitai (descarga individual) |
| Modelo base Wan 2.2 A14B | Modelo de difusión vídeo | no aplica | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es frente a los LoRA originales en Civitai: este repositorio no aporta ninguna modificación técnica, solo reempaqueta los ficheros y añade una tabla de referencia. Frente al modelo base, la diferencia es funcional: los LoRA inducen estilos y movimientos que el modelo base no produce por sí solo.

## Limitaciones y advertencias

- **Contenido para adultos:** todos los adaptadores están orientados a material explícito. El repositorio está marcado `not-for-all-audiences` y no debe desplegarse en entornos sin control de edad ni en productos dirigidos al público general.
- **Licencia por fichero:** la licencia `civitai-per-file` implica que cada LoRA conserva la licencia de su autor original. Es obligatorio revisar el fichero `LICENSE` y la ficha de Civitai de cada adaptador antes de cualquier uso comercial; las condiciones pueden variar de un fichero a otro.
- **Sin model card técnica:** no hay información sobre dataset, pasos de entrenamiento, rango ni metodología. Esto impide evaluar la calidad, la reproducibilidad o los sesgos de cada adaptador.
- **Riesgo de alucinación visual:** como cualquier adaptador de difusión, puede producir artefactos anatómicos, incoherencias temporales entre fotogramas y desviaciones del prompt, especialmente con fuerzas altas.
- **Compatibilidad de versión:** `wan21-squirt` está entrenado sobre Wan 2.1 y no es directamente intercambiable con Wan 2.2. Los adaptadores de Qwen Image Edit 2511 no funcionan sobre Wan.
- **Emparejamiento high/low:** los adaptadores que solo tienen variante `high` o solo `low` no pueden aplicarse como par, lo que limita el control fino del efecto.
- **Madurez del repositorio:** 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. No hay evidencia de uso en producción ni de validación por terceros.
- **Dependencia de terceros:** los autores originales pueden retirar o modificar sus LoRA en Civitai, y este repositorio no garantiza la sincronización ni el soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SistemAi/sistem-loras
- WAN General NSFW (Civitai): https://civitai.com/models/1307155
- Wan2.2 French Kiss I2V/T2V (Civitai): https://civitai.com/models/2171333?modelVersionId=2445168
- Wan I2V Assertive Cowgirl (Civitai): https://civitai.com/models/1566648?modelVersionId=2129122
- Cum/Facial Wan2.2 (Civitai): https://civitai.com/models/1962545?modelVersionId=3112727
- Cum beam / Cum blast (Civitai): https://civitai.com/models/1068055?modelVersionId=2790750
- Pullout Creampie LoRA v1 (Civitai): https://civitai.com/models/2991730?modelVersionId=3392563
- Solo Dildo (Civitai): https://civitai.com/models/1707303?modelVersionId=2405949
- Dildo Handjob T2V I2V Wan2.2 (Civitai): https://civitai.com/models/2192566?modelVersionId=2515776
- Wan 2.2 Fucking Machine I2V (Civitai): https://civitai.com/models/2448294?modelVersionId=2752896
- Wan 2.2/2.1 POV Missionary (Civitai): https://civitai.com/models/1527766?modelVersionId=2098405
- Squirting Vag WAN2.1 i2v (Civitai): https://civitai.com/models/1468064?modelVersionId=1572438
- SEXGOD Female Nudity v2 Qwen Image Edit 2511 (Civitai): https://civitai.com/models/2339965
- Facial Cumshots For Qwen Image (Civitai): https://civitai.com/models/1929013?modelVersionId=2183295
