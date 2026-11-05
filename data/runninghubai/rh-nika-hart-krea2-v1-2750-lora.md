# RunningHubAI/rh-nika-hart-krea2-v1-2750-lora

## Resumen

`rh-nika-hart-krea2-v1-2750-lora` es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un conjunto de pesos de bajo rango (218 MiB, rango 32, proyeccion linear) que se aplica sobre el checkpoint base `krea2` (referido en la model card como "Krea2 RAW") para inyectar un personaje concreto identificado por la palabra de activacion `nika_hart`. El autor lo describe explicitamente como un LoRA "privado de personaje para probar checkpoints", lo que sitúa su proposito en el ambito del ajuste fino visual y no en el de la inferencia de texto general.

El pipeline declarado en el repositorio es `image-text-to-image`, es decir, generacion y edicion de imagenes condicionada por texto y por una imagen de entrada. La integracion prevista es ComfyUI, y el ecosistema de RunningHub actua como plataforma de carga, entrenamiento y servicio del adaptador. El repositorio tiene un tamano de 0,2 GB, cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 5 de noviembre de 2026.

Es relevante ahora como ejemplo del flujo de trabajo actual de personalizacion de modelos generativos de imagen: adaptadores pequenos y desacoplados del checkpoint base, entrenados y distribuidos en plataformas de terceros, que permiten reproducir un personaje o estilo concreto sin reentrenar el modelo completo. Para un desarrollador o investigador, la ficha debe leerse como la de un artefacto de ajuste fino, no como la de un modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el checkpoint base krea2; no se especifica la arquitectura interna del modelo base |
| Parametros totales | no disponible (el repositorio solo indica un unico fichero de pesos LoRA de 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible; el fichero distribuido esta en safetensors (segun la model card) y no se documentan variantes cuantizadas |
| Idiomas soportados | no disponible (el condicionamiento es texto-imagen; no se declaran idiomas) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`nika_hart_krea2raw_r32_linear_v1.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de rango 32 con proyeccion linear, segun el propio nombre del fichero (`r32_linear_v1`). Se aplica sobre el modelo base `krea2` (Krea2 RAW), del cual no se documentan en la informacion disponible ni el numero de parametros, ni la arquitectura interna, ni la composicion del dataset de entrenamiento del adaptador. La model card no detalla el numero de pasos de entrenamiento, el learning rate, el tamano del dataset de imagenes del personaje ni si se emplearon tecnicas de regularizacion o captions automaticos.

La unica informacion de entrenamiento disponible es contextual: el adaptador fue entrenado en la plataforma RunningHub (que ofrece un flujo de entrenamiento propio en `https://www.runninghub.ai/page-model`) y el autor lo describe como un LoRA de personaje "para probar checkpoints", lo que sugiere un uso experimental y no una version final de produccion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion linear u otras optimizaciones de inferencia.

## Capacidades

- Personalizacion de personaje: inyecta la identidad visual `nika_hart` en el modelo base `krea2` mediante la palabra de activacion `nika_hart` en el prompt.
- Edicion y generacion de imagen condicionada por texto e imagen (pipeline `image-text-to-image`).
- Compatibilidad con ComfyUI como entorno de inferencia y con la plataforma RunningHub para carga y ejecucion.
- Aplicacion como adaptador desacoplado: se combina con el checkpoint base sin necesidad de reentrenar el modelo completo.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, modo thinking, audio ni multilingueismo, por lo que deben considerarse no disponibles.

## Casos de uso

- Prototipado de personajes en ComfyUI: cargar el LoRA junto al checkpoint `krea2` y activar `nika_hart` en el prompt para generar variaciones coherentes del personaje en distintas poses y escenas, aprovechando que el adaptador pesa solo 218 MiB y se intercambia rapidamente.
- Pruebas de checkpoints del modelo base: el autor declara el LoRA como herramienta de test de checkpoints (Krea2 RAW); sirve para comparar como distintos merges o versiones del base preservan la identidad del personaje.
- Generacion de material visual para narrativa o comic: producir ilustraciones consistentes de un mismo personaje a lo largo de varias viñetas manteniendo rasgos faciales y vestuario mediante la palabra de activacion.
- Edicion de imagen existente: al ser un pipeline image-text-to-image, permite partir de una imagen de referencia y aplicar el personaje o modificar la escena con instrucciones textuales.
- Integracion en pipelines automatizados de RunningHub: usar la API de la plataforma (`https://www.runninghub.ai/call-api`) para encadenar generacion de imagenes con el LoRA en flujos de produccion de contenido.
- Experimentacion academica sobre personalizacion de difusion: estudiar como un LoRA de rango 32 y proyeccion linear captura la identidad de un personaje y como se degrada al combinarse con distintos checkpoints base.
- Creacion de datasets sinteticos de personaje: generar lotes de imagenes consistentes para aumentar un dataset de entrenamiento o para evaluacion cualitativa de otros adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad, etc.) ni comparaciones con otros LoRA de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo vendra determinado por el checkpoint base `krea2` y por la resolucion de imagen, no por los 218 MiB del LoRA.
- GPU recomendadas: no disponible en la informacion proporcionada; no se documentan requisitos minimos ni GPU objetivo.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente del modelo base y de la configuracion de ComfyUI.
- Opciones de despliegue: ComfyUI (entorno declarado), plataforma RunningHub (carga y ejecucion online) y la API de RunningHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-nika-hart-krea2-v1-2750-lora | LoRA de personaje sobre krea2 | no disponible (LoRA de 218 MiB, rango 32) | no aplica | no disponible | Hugging Face (0 descargas) y RunningHub |
| Otros LoRA de personaje para modelos de difusion | LoRA de personaje | no disponible | no aplica | variable segun autor | no disponible en la informacion proporcionada |
| Checkpoint base krea2 (Krea2 RAW) | Modelo generativo de imagen | no disponible | no aplica | no disponible | referenciado por el autor, sin ficha propia en la informacion disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Ambito restringido: no es un modelo de lenguaje; no debe evaluarse con criterios de MMLU, HumanEval o GSM8K ni emplearse para tareas de texto.
- Dependencia del checkpoint base: el LoRA solo funciona sobre `krea2` (Krea2 RAW); no se garantiza su comportamiento con otros modelos base.
- Estado experimental: el autor lo describe como LoRA "privado de personaje para probar checkpoints", sin indicios de validacion en produccion.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, pero no la especifica; el uso comercial queda sin garantia explicita y requiere consultar al autor.
- Riesgo de sobreajuste al personaje: al ser un LoRA de identidad con palabra de activacion, puede reducir la diversidad de las generaciones y condicionar en exceso la composicion de la imagen.
- Sin datos de sesgo, alucinacion visual ni evaluacion cualitativa publicados.
- Sin metricas de rendimiento, latencia ni requisitos de hardware documentados.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que limita la evidencia de uso real por terceros.
- Idiomas no declarados: el comportamiento con prompts en castellano no esta documentado y depende del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-nika-hart-krea2-v1-2750-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2116175640922750977
- Pagina del autor: https://www.runninghub.ai/user-center/2106245571941007362
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (en el repositorio de Hugging Face)
