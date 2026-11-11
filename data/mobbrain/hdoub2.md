# mobbrain/hdoub2

## Resumen

`mobbrain/hdoub2` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario mobbrain y publicado bajo licencia Apache 2.0. El adaptador se entrena sobre los pesos de Krea 2 RAW y esta pensado para invocarse en combinacion con Krea 2 Turbo, la variante destilada para pocos pasos de inferencia del mismo modelo base. Su funcion es inyectar un concepto concreto, activado mediante el token disparador `hdoub`, en las generaciones del modelo base sin necesidad de reentrenar la red completa.

El repositorio ocupa 1,4 GB, lo que es coherente con un LoRA de rango moderado sobre un modelo de difusion grande, y se distribuye en formato compatible con la libreria `diffusers`. La model card incluye tres ejemplos de generacion en los que el concepto `hdoub` aparece integrado en escenas muy distintas (ciudad cyberpunk, templo en la jungla y paisaje surrealista), lo que sugiere que el adaptador ha aprendido una representacion del concepto razonablemente desacoplada del contexto.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de nicho, con muy pocas descargas (29) y sin likes en el momento de la consulta, publicado en noviembre de 2026. No hay informacion publica sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni evaluaciones cuantitativas, por lo que la mayoria de especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el repo pesa 1,4 GB; el desglose de parametros del adaptador no se indica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | no disponible; la model card solo muestra uso en `bfloat16` |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga via `load_lora_weights`); formato de fichero concreto no indicado |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth, segun la propia model card, entrenado sobre Krea 2 RAW y destinado a ser usado con Krea 2 Turbo. DreamBooth es una tecnica de personalizacion que ajusta un modelo generativo para asociar un identificador unico (aqui `hdoub`) a un concepto visual concreto a partir de un conjunto reducido de imagenes. Al ser un LoRA, el entrenamiento solo modifica matrices de bajo rango inyectadas en las capas del modelo base, dejando intactos los pesos originales; esto explica el tamano del repositorio (1,4 GB) frente al peso completo del modelo base.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA, la resolucion de entrenamiento ni si se aplicaron tecnicas adicionales como regularizacion por clase, captions automaticos o aumento de datos. Tampoco se documenta si el adaptador se entreno con la variante RAW y se evaluo en Turbo, mas alla de la afirmacion de la model card de que las muestras se generaron en Turbo con 8 pasos de inferencia y `guidance_scale=0.0`.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el concepto `hdoub`, mediante el token disparador documentado.
- Integracion del concepto en escenas diversas: los ejemplos cubren entornos urbanos, naturales y surrealistas, lo que indica cierta generalizacion composicional.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` y carga mediante `load_lora_weights`.
- Uso en modo pocos pasos: las muestras se generan con 8 pasos y `guidance_scale=0.0` sobre Krea 2 Turbo.
- No se documentan capacidades de tool calling, agentes, vision, audio, razonamiento multi-paso ni multilingues, ya que es un adaptador de generacion de imagen y no un modelo de lenguaje.

## Casos de uso

- Personalizacion de marca: entrenar o aplicar un LoRA como este para que un producto, mascota o personaje concreto aparezca de forma consistente en ilustraciones generadas para campanas, con control del estilo mediante el prompt y el token `hdoub`.
- Creacion de arte conceptual: generar variaciones de un concepto propio en multiples ambientaciones (ciudad, naturaleza, abstracto) para explorar direcciones visuales antes de producir assets finales.
- Prototipado rapido en diseno grafico: usar el adaptador sobre Krea 2 Turbo con 8 pasos para obtener borradores en segundos y iterar sobre composicion y paleta antes de un render de mayor calidad.
- Generacion de ilustraciones para publicaciones: producir imagenes editoriales coherentes con una identidad visual definida por el concepto entrenado, manteniendo el estilo del modelo base.
- Educacion y demostraciones de tecnicas LoRA/DreamBooth: el repositorio sirve como ejemplo practico de como se estructura un adaptador para Krea 2 y como se carga con `diffusers`, util para talleres o documentacion interna.
- Experimentacion en investigacion de personalizacion: comparar el comportamiento de un LoRA DreamBooth sobre la variante RAW frente a Turbo, evaluando fidelidad al concepto y degradacion con pocos pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud al concepto, etc.) ni comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2, no del LoRA. El adaptador anade una sobrecarga pequena sobre los pesos del modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU con soporte de bfloat16.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base Krea 2, que no se detallan.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`. No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) porque no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles; la model card solo indica 8 pasos de inferencia en Krea 2 Turbo, sin tiempos medidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA para Krea 2 ni datos comparables de parametros, contexto o rendimiento. Como referencia estructural, podria compararse con otros LoRA DreamBooth publicados para el mismo modelo base, pero no se dispone de datos de esos adaptadores en la informacion facilitada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al ser un adaptador sobre un modelo de difusion, hereda los sesgos del modelo base Krea 2, que no se detallan.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir resultados incoherentes o no fieles al prompt, especialmente con composiciones complejas o multiples sujetos.
- Fidelidad al concepto: no hay evaluacion cuantitativa de cuanto se parece el resultado al concepto original entrenado; la calidad depende del dataset usado, que no se publica.
- Limitaciones de idioma: no se especifican idiomas soportados; los ejemplos estan en ingles y no hay evidencia de buen rendimiento con prompts en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Krea 2 puede tener su propia licencia; es necesario verificar los terminos de `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` antes de un uso comercial.
- Madurez: 29 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Falta de documentacion: no se detallan hiperparametros de entrenamiento, tamano del dataset ni rango del LoRA, lo que dificulta reproducir o auditar el adaptador.
- Uso con Turbo: las muestras se generaron con `guidance_scale=0.0` y 8 pasos; no se documenta el comportamiento con otros valores de guidance o con el modelo RAW.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobbrain/hdoub2
- Modelo base RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo (referenciado en la model card): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
