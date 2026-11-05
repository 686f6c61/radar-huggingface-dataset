# RunningHubAI/rh-kael-v1-lora

## Resumen

rh-kael-v1-lora es un adaptador LoRA para edicion de imagenes publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de pesos de bajo rango (218 MiB en formato safetensors) que se aplica sobre un modelo base de difusion para modificar su comportamiento de generacion y edicion de imagenes. El pipeline declarado en Hugging Face es `image-text-to-image`, y la model card indica que esta afinado a partir de `krea2`.

El modelo se distribuye principalmente para su uso en ComfyUI y en la plataforma RunningHub, que actua como canal de publicacion y de inferencia en linea. La palabra de activacion (trigger word) es `kael_v1`, y el unico fichero de pesos es `kael_v1_krea2_720_20261103.safetensors`. El repositorio tiene un tamano de 0,2 GB y no registra descargas ni likes en el momento de la consulta.

La relevancia de esta ficha es limitada para el publico de un blog centrado en modelos de lenguaje: se trata de un adaptador de imagen de nicho, sin licencia explicita, sin idiomas declarados y sin benchmarks publicados. Resulta util, eso si, como ejemplo de la practica habitual en el ecosistema ComfyUI de publicar LoRAs de estilo o de personaje sobre modelos base de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion `krea2` |
| Parametros totales | no disponible (pesos LoRA de 218 MiB; el numero de parametros no se declara) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`kael_v1_krea2_720_20261103.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base de difusion para ajustar su comportamiento sin reentrenar todos los pesos. La model card identifica el modelo base como `krea2` y el tipo de modelo como "LoRA (image edit)", lo que situa su funcion en la edicion de imagenes condicionada por texto e imagen de entrada, coherente con el pipeline `image-text-to-image` declarado.

No se publican detalles sobre el dataset de entrenamiento, el numero de pasos, la resolucion de entrenamiento (el sufijo `720` del nombre del fichero sugiere 720 px, aunque no se confirma), la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion o de captions automaticos. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste LoRA. Toda la informacion disponible se limita a la model card y a los metadatos del repositorio.

## Capacidades

- Edicion de imagenes guiada por texto sobre el modelo base `krea2`, mediante el pipeline image-text-to-image.
- Aplicacion de un estilo o identidad concreto mediante la palabra de activacion `kael_v1`.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china.
- Acceso mediante API de RunningHub (documentada en el repositorio).
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision analitica ni audio.

## Casos de uso

- Edicion de imagenes por lotes en ComfyUI: cargar el LoRA sobre el modelo base `krea2` y aplicar el estilo `kael_v1` de forma consistente en una cola de trabajo, aprovechando que ComfyUI permite encadenar el nodo LoRA con el resto del grafo.
- Prototipado rapido de estilos visuales: usar la palabra de activacion `kael_v1` para explorar variaciones de una estetica concreta antes de decidir si se entrena un modelo propio.
- Produccion de material grafico para redes o blogs: generar variantes editadas de una imagen de referencia con un estilo homogeneo, sin necesidad de infraestructura propia si se usa RunningHub.
- Integracion via API en un pipeline automatizado: llamar al endpoint de RunningHub desde un script para generar imagenes editadas bajo demanda, util cuando no se dispone de GPU local.
- Experimentacion academica con adaptadores LoRA: emplear este repositorio como ejemplo de adaptador de bajo rango sobre un modelo de difusion para estudiar el efecto del rango, la palabra de activacion y la resolucion de entrenamiento.
- Demostraciones y pruebas de concepto en entornos sin GPU: al ejecutarse en la nube de RunningHub, permite evaluar el adaptador sin hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad ni comparativas cualitativas) ni tampoco datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador pesa 218 MiB, pero requiere cargar el modelo base `krea2` completo, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base `krea2`, no del LoRA.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (en linea) y API de RunningHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-kael-v1-lora | LoRA de edicion de imagen | `krea2` | no disponible | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores LoRA del mismo autor o del mismo modelo base que permita una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se especifica licencia: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial queda en un limbo juridico hasta confirmar los terminos de `krea2` y de RunningHub.
- Ausencia total de benchmarks: no hay evidencia objetiva de calidad, fidelidad al estilo ni robustez frente a distintos prompts.
- Dependencia del modelo base `krea2`: el adaptador no funciona de forma autonoma y su comportamiento hereda los sesgos y limitaciones de dicho modelo.
- Sin idiomas declarados: se desconoce el rendimiento de los prompts en castellano; es probable que el entrenamiento se haya realizado con captions en ingles, pero no se confirma.
- Riesgo de sobreajuste al estilo o a la identidad `kael_v1`: al ser un LoRA de nicho, puede producir artefactos o rigidez compositiva fuera del dominio de entrenamiento.
- Sin descargas ni likes registrados: no hay senal de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-05) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- No apto para tareas de texto, razonamiento o codigo: es exclusivamente un adaptador de imagen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-kael-v1-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2117597741240025089
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1982007391661203458
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (en ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (en chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
