# mobbrain/stitch

## Resumen

Stitch es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario mobbrain y publicado en Hugging Face bajo licencia Apache 2.0. El adaptador se entrena sobre los pesos de Krea 2 RAW (krea/Krea-2-Raw) e incorpora un concepto visual invocado mediante el token de activacion `Stitch`, que la model card asocia a representaciones del personaje en distintos estilos fotograficos y cinematograficos. El repositorio ocupa 1,0 GB y esta etiquetado como `template:sd-lora`, lo que indica compatibilidad con el ecosistema de librerias de difusion (diffusers y derivados).

El modelo no es un modelo fundacional autonomo: requiere cargar el pipeline base Krea 2 (los ejemplos oficiales usan `krea/Krea-2-Turbo`) y superponer los pesos LoRA. La model card documenta explicitamente el flujo con `Krea2Pipeline`, `load_lora_weights` y una generacion de 8 pasos de inferencia con `guidance_scale=0.0`, lo que situa su uso tipico en el regimen de destilacion Turbo mas que en el de muestreo completo.

Su relevancia es acotada y practica: permite incorporar un concepto concreto (personaje, estilo o identidad visual) en un pipeline Krea 2 sin reentrenar el modelo base, con un consumo de almacenamiento de 1 GB y un coste de inferencia bajo gracias a la configuracion de pocos pasos. La informacion publica disponible es escasa: no hay datos de entrenamiento, benchmarks ni especificaciones detalladas mas alla de la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion texto-a-imagen Krea 2; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (el repositorio pesa 1,0 GB, pero no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se documenta limite de tokens de prompt) |
| Tipos de cuantizacion | no disponible (la model card no especifica cuantizaciones; el ejemplo usa `torch_dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; el repositorio es compatible con `diffusers` (`load_lora_weights`) y esta etiquetado como `template:sd-lora` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth entrenado sobre Krea 2 RAW, segun indica la model card. DreamBooth es una tecnica de ajuste fino personalizado que asocia un token raro (en este caso `Stitch`) a un concepto concreto, de modo que el modelo base reproduce ese concepto cuando el token aparece en el prompt. La publicacion no detalla el rango del LoRA, el numero de pasos de entrenamiento, el tamano del dataset, la composicion de las imagenes de entrenamiento ni si se aplicaron tecnicas adicionales como regularizacion por clase previa o aumento de datos.

La model card indica que el adaptador se muestra sobre Krea 2 Turbo y que las muestras se generaron con 8 pasos de inferencia. No se documenta si el LoRA se entreno conjuntamente con la variante Turbo o solo con RAW y se evaluo en Turbo. Tampoco hay informacion sobre el scheduler, el tipo de ruido, la resolucion de entrenamiento ni el uso de RLHF/DPO, que en modelos de difusion no aplica del mismo modo que en modelos de lenguaje. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa u otras).

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompt, mediante la superposicion del LoRA sobre el pipeline Krea 2.
- Invocacion de un concepto especifico mediante el token de activacion `Stitch`, segun la model card.
- Composicion de escenas con estilos fotograficos y cinematograficos: los ejemplos oficiales cubren ciencia ficcion (traje de astronauta en estacion espacial), macrofotografia (personaje en una flor de hibisco) y cine negro (retrato con gabardina y fedora bajo una farola).
- Integracion con `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Compatibilidad declarada con Krea 2 RAW como base de entrenamiento y con Krea 2 Turbo como base de inferencia en los ejemplos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento; son capacidades ajenas al tipo de modelo.
- Capacidades multilingues: no disponibles; los prompts de ejemplo estan en ingles y no se documenta el comportamiento en otros idiomas.

## Casos de uso

- Ilustracion editorial y conceptual: generar escenas con el concepto `Stitch` en contextos variados (espacio, naturaleza, cine negro) para articulos, portadas o piezas de divulgacion, aprovechando la capacidad del LoRA de mantener el concepto bajo cambios de estilo.
- Prototipado rapido de personajes en produccion audiovisual: usar el adaptador para explorar variaciones de vestuario, iluminacion y encuadre de un personaje antes de encargar renders finales o modelado 3D.
- Creacion de material para redes sociales y campanas: generar imagenes tematicas coherentes con un personaje recurrente en pocos pasos de inferencia (8 pasos en la configuracion documentada), lo que reduce el coste por imagen.
- Diseno de merchandising y productos derivados: producir bocetos de ilustraciones para camisetas, posteres o articulos de coleccion con un personaje consistente, usando el token `Stitch` como ancla visual.
- Pruebas de concepto en pipelines de generacion aumentada: integrar el LoRA en un flujo `diffusers` existente para evaluar como un concepto personalizado se comporta con distintos prompts, seeds y escalas de guia, antes de decidir si se entrena un adaptador propio.
- Educacion y demostraciones tecnicas: usar el repositorio como ejemplo minimo de DreamBooth-LoRA sobre Krea 2 para explicar el flujo `from_pretrained` + `load_lora_weights` en talleres o documentacion interna.
- Generacion de variaciones estilisticas para moodboards: comparar el mismo concepto en estilos fotograficos distintos (macro, noir, cinematografico) para seleccionar una direccion artistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa. El adaptador pesa 1,0 GB, pero la VRAM necesaria la determina el pipeline base Krea 2, cuyas especificaciones no se detallan en la informacion proporcionada. El ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")`.
- GPU recomendadas: no disponibles. La model card no indica modelos de GPU concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada. Depende del modelo base Krea 2, no del LoRA; no se aportan datos al respecto.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`, segun el ejemplo oficial. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusion de imagen en el flujo descrito.
- Latencia y throughput: no disponibles. Solo se documenta la configuracion de inferencia (8 pasos, `guidance_scale=0.0`) sobre Krea 2 Turbo, sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mobbrain/stitch | LoRA DreamBooth texto-a-imagen | Krea 2 RAW (inferencia en Krea 2 Turbo) | no disponible (repo de 1,0 GB) | no aplica | Apache 2.0 | Hugging Face, 106 descargas, 0 likes |
| Adaptadores LoRA para otros modelos de difusion (p. ej. SDXL, FLUX) | LoRA DreamBooth texto-a-imagen | Modelo base correspondiente | variable | no aplica | variable segun autor | Amplia disponibilidad en Hugging Face |
| Modelos fundacionales texto-a-imagen (p. ej. SDXL, FLUX) | Modelo completo | no aplica | miles de millones (no disponible para Krea 2) | no aplica | variable | Hugging Face y otros canales |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas, por lo que la comparativa se limita a tipo de artefacto, licencia y disponibilidad. No se identifican en la informacion proporcionada adaptadores LoRA equivalentes especificos para Krea 2 con los que comparar directamente.

## Limitaciones y advertencias

- La informacion publica es muy escasa: no hay datos de entrenamiento, rango del LoRA, dataset, resolucion ni proceso de validacion, lo que dificulta evaluar su robustez y reproducibilidad.
- El adaptador depende del modelo base Krea 2; cualquier limitacion, sesgo o restriccion de licencia del modelo base se hereda en la practica, aunque la licencia declarada del adaptador sea Apache 2.0.
- Riesgo de alucinacion visual y de deriva del concepto: al ser un LoRA de concepto, el token `Stitch` puede producir resultados inconsistentes fuera de los estilos y composiciones vistos en entrenamiento; la model card solo documenta tres ejemplos.
- Sesgos conocidos: no documentados. Al no publicarse la composicion del dataset, no es posible evaluar sesgos de representacion, estilo o contenido.
- Limitaciones de idioma: no documentadas; los prompts de ejemplo estan en ingles y no se confirma el comportamiento con prompts en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base Krea 2 puede estar sujeto a condiciones adicionales que no se detallan en la informacion disponible; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Ausencia de benchmarks: no hay metricas objetivas (FID, CLIP score, similitud de concepto) que permitan comparar su calidad con otros adaptadores.
- Adopcion muy baja (0 likes, 106 descargas en el momento de la consulta) y sin mantenimiento documentado; el repositorio se creo y actualizo el mismo dia, lo que sugiere un artefacto experimental sin ciclo de vida establecido.
- Para produccion, la configuracion de 8 pasos con `guidance_scale=0.0` esta pensada para Krea 2 Turbo; usar el LoRA con otras variantes o schedulers puede requerir reajustar pasos y escala de guia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobbrain/stitch
- Modelo base de entrenamiento (Krea 2 RAW): https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia citado en los ejemplos (Krea 2 Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos asociados a este adaptador.
