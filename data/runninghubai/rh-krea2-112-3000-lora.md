# RunningHubAI/rh-krea2-112-3000-lora

## Resumen

`rh-krea2-112-3000-lora` es un adaptador LoRA de edicion de imagen (pipeline `image-text-to-image`) publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de pesos auxiliares que se cargan sobre un modelo base denominado `krea2` para modificar su comportamiento generativo. El repositorio contiene un unico fichero `Krea2-美女112-丰满女友-3000.safetensors` de 218 MiB, lo que confirma que es un adaptador y no un modelo completo.

El modelo esta orientado a la plataforma ComfyUI y al ecosistema RunningHub, y su nombre interno ("Beauty112-Curvy Girlfriend-3000") sugiere un ajuste fino orientado a la generacion de retratos o figuras femeninas estilizadas. La model card es extremadamente escasa: no incluye informacion sobre el dataset de entrenamiento, hiperparametros, licencia explicita, idiomas ni resultados de evaluacion.

Su relevancia practica es limitada y muy especifica: sirve a usuarios que ya trabajan con el modelo base `krea2` en ComfyUI o RunningHub y quieren aplicar un estilo concreto sin reentrenar. Para el publico general de desarrolladores e investigadores de IA open source, la informacion disponible no permite una evaluacion tecnica rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos del adaptador: 218 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts dependen del modelo base) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, una actualizacion de bajo rango sobre las matrices de un modelo base de difusion (o similar) llamado `krea2`. El fichero entregado pesa 218 MiB, coherente con un adaptador de rango bajo y no con un modelo completo. El pipeline declarado es `image-text-to-image`, lo que indica generacion y edicion de imagenes condicionada por texto (y potencialmente por imagen de entrada).

No se dispone de informacion sobre el numero de pasos de entrenamiento, el dataset utilizado, la resolucion de entrenamiento, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas como regularizacion o captions automaticos. El sufijo "3000" del nombre podria corresponder a pasos de entrenamiento o a un identificador interno, pero no hay confirmacion en la model card. Tampoco se documenta si el ajuste se hizo con RLHF, DPO u otro esquema; en el contexto de LoRA para difusion estos esquemas no son habituales.

## Capacidades

- Generacion de imagenes condicionada por texto, heredada del modelo base `krea2`.
- Edicion de imagen (segun la model card, "LoRA (image edit)"), presumiblemente con imagen de referencia y prompt.
- Aplicacion de un estilo o sesgo concreto (retratos femeninos estilizados) sobre el modelo base.
- Carga en ComfyUI y en la plataforma RunningHub.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues propias.
- No se documentan capacidades de vision, audio ni thinking mode.

## Casos de uso

- Prototipado de retratos estilizados en ComfyUI: cargar el LoRA sobre `krea2` y generar variaciones de figura femenina con un estilo consistente, util para explorar direcciones visuales antes de producir arte final.
- Edicion de imagenes existentes con un sesgo estetico concreto: usar el pipeline image-text-to-image para retocar o reestilizar fotografias manteniendo la identidad visual del sujeto.
- Generacion de material para moodboards o referencias de diseno: producir un lote de imagenes coherentes estilisticamente para presentaciones creativas.
- Pruebas de concepto en la API de RunningHub: invocar el modelo via API para integrar generacion de imagenes en un flujo de trabajo interno sin gestionar infraestructura GPU.
- Comparacion de LoRAs sobre un mismo base: al ser un adaptador pequeno (218 MiB), permite evaluar rapidamente el efecto de distintos estilos sobre `krea2` en un mismo pipeline.
- Automatizacion de contenido visual en entornos controlados: generar variaciones de imagen para catalogos o pruebas A/B donde el estilo del LoRA sea el factor a evaluar.
- Formacion y experimentacion: estudiar como un LoRA de bajo rango modifica el comportamiento de un modelo de difusion en tareas de edicion condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, etc.) ni comparaciones cuantitativas con otros LoRAs o modelos base.

## Requisitos de hardware

- El adaptador pesa 218 MiB, por lo que su carga anade un coste de memoria minimo respecto al modelo base.
- Los requisitos reales de VRAM vienen determinados por `krea2`, cuyo tamano y arquitectura no se especifican; no es posible estimar VRAM de inferencia con los datos disponibles.
- GPU recomendadas: no disponible. Dependera del modelo base y de la resolucion de generacion.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente del modelo base.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub y API de RunningHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRAs comparables, ni datos del modelo base `krea2`, ni metricas que permitan una comparacion objetiva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-krea2-112-3000-lora | no disponible (adaptador de 218 MiB) | no aplica | no disponible | Hugging Face / RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Model card practicamente vacia: sin dataset, hiperparametros, licencia explicita ni evaluacion. Esto impide auditar el modelo y asumir garantias de calidad.
- Licencia no declarada: la model card remite a "la licencia del proyecto original o upstream", lo que genera incertidumbre legal para uso comercial. Es imprescindible verificar la licencia de `krea2` antes de cualquier despliegue productivo.
- Sesgo estetico evidente: el nombre interno ("Beauty112-Curvy Girlfriend-3000") sugiere un ajuste orientado a un tipo de figura femenina concreto, con el riesgo de reproducir estereotipos de genero y de belleza, y de degradar la diversidad de sujetos generados.
- Riesgo de sobreajuste al estilo: al ser un LoRA especifico, puede forzar el estilo incluso cuando el prompt pide algo distinto, reduciendo el control del usuario.
- Dependencia total del modelo base `krea2`: sin el, el adaptador es inutil; su comportamiento, calidad y limites no estan documentados en este repositorio.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion indicada como 2026-11-19, posterior a la redaccion habitual de fichas; conviene verificar la integridad y procedencia del repositorio.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no es textual; los prompts dependen del tokenizador y del encoder de texto del base.
- Aviso: el contenido de la model card se ha tratado solo como material de referencia, nunca como instrucciones.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-112-3000-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2123072350011158529
- Pagina del autor: https://www.runninghub.ai/user-center/2064710712105979905
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en la model card)
