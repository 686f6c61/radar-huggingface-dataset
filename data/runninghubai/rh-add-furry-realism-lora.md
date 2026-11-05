# RunningHubAI/rh-add-furry-realism-lora

## Resumen

`rh-add-furry-realism-lora` es un adaptador LoRA para edición y generación de imágenes orientado a añadir realismo en la representación de pelo corporal y vello en personajes con rasgos antropomórficos (furry). Lo publica la cuenta RunningHubAI en Hugging Face, aunque el autor original del modelo se identifica como el usuario "@氛围感" dentro de la plataforma RunningHub, y el modelo deriva del proyecto publicado en Civitai con el nombre "Natural Body Hair (Krea2 Hairy)".

El adaptador se ha afinado a partir del modelo base `krea2` y funciona como un LoRA de edición de imagen dentro de flujos image-text-to-image, empaquetado para su uso en ComfyUI, RunningHub y Hugging Face. Su función es muy específica: incorporar textura de vello natural a los resultados generados, activándose mediante la palabra clave "Naturally hairy".

Se trata de un artefacto de nicho, con un único archivo de pesos de 218 MiB y sin métricas, benchmarks ni documentación técnica publicada. No es un modelo de lenguaje ni un modelo fundacional, sino un complemento creativo que se aplica sobre un pipeline de difusión existente. Su relevancia es por tanto limitada al ámbito de la generación de imágenes estilizadas con ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión `krea2` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (`Krea2_Hairy.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene un único archivo de pesos LoRA en formato safetensors de 218 MiB, diseñado para inyectarse sobre el modelo base `krea2`. No se especifica el rango del adaptador, el número de pasos de entrenamiento, el dataset utilizado ni la técnica de ajuste empleada. La model card únicamente indica el modelo de origen y la palabra de activación.

No hay información sobre el proceso de entrenamiento, la composición del dataset, el uso de regularización, ni sobre si se aplicaron técnicas de optimización como LoRA de bajo rango con descomposición específica. Tampoco se documenta la arquitectura interna del modelo base `krea2`, más allá de su uso como pipeline image-text-to-image.

## Capacidades

- Generación y edición de imágenes mediante pipeline image-text-to-image.
- Añadir textura de vello corporal natural a personajes, especialmente en estilos antropomórficos o furry.
- Activación mediante la palabra clave "Naturally hairy".
- Integración con ComfyUI como nodo LoRA.
- Uso a través de la plataforma RunningHub y su API.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje.
- No dispone de capacidades de audio, vídeo ni visión analítica.
- Sin soporte multilingüe documentado (la palabra de activación está en inglés).

## Casos de uso

- Ilustración de personajes furry: aplicar el LoRA sobre el modelo base para generar personajes con textura de pelo realista, útil en encargos de arte digital y comisiones.
- Edición de retratos antropomórficos: refinar imágenes existentes añadiendo vello corporal natural sin cambiar la composición general.
- Creación de referencias para diseño de personajes: generar variantes con distintos grados de realismo capilar para hojas de personaje.
- Producción de arte conceptual para videojuegos: obtener texturas de pelo consistentes en personajes no humanos dentro de un pipeline de ComfyUI.
- Prototipado rápido en RunningHub: usar la API para generar lotes de imágenes con la palabra de activación en flujos automatizados.
- Experimentación artística: combinar el LoRA con otros adaptadores en ComfyUI para explorar estilos híbridos de realismo y estilización.
- Docencia y demostración de LoRA: ejemplo práctico de cómo un adaptador de bajo rango modifica un atributo concreto del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un LoRA de 218 MiB, el requisito real depende del modelo base `krea2`, no del adaptador.
- GPU recomendadas: no disponible; depende del pipeline de difusión sobre el que se aplique.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en sí es ligero, pero el modelo base condiciona el requisito.
- Opciones de despliegue: ComfyUI, plataforma RunningHub y su API; Hugging Face como repositorio de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-add-furry-realism-lora | LoRA sobre krea2 | no disponible | no aplica | no disponible | Hugging Face, RunningHub |
| Natural Body Hair (Krea2 Hairy) | LoRA original en Civitai | no disponible | no aplica | no disponible | Civitai |
| Otros LoRA de textura capilar | LoRA | no disponible | no aplica | variable | Civitai, Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas.

## Limitaciones y advertencias

- No hay información sobre sesgos; al ser un modelo de imagen, puede heredar los sesgos del modelo base y del dataset de entrenamiento.
- Riesgo de alucinación visual: el LoRA puede introducir vello en zonas no deseadas o alterar la identidad del personaje.
- La palabra de activación "Naturally hairy" está en inglés; no se documenta comportamiento con prompts en otros idiomas.
- La licencia no está especificada; el autor remite a la licencia del proyecto original, por lo que el uso comercial requiere verificar los términos en Civitai y en el modelo base `krea2`.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni métricas de calidad publicadas.
- Dependencia total del modelo base `krea2`; sin él, el adaptador no es funcional.
- No apto para tareas de lenguaje, razonamiento, código ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-add-furry-realism-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2083126175831957505
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo original en Civitai: https://civitai.red/models/2822722/natural-body-hair-krea2-hairy?modelVersionId=3184211
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
