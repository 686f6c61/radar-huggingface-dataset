# hendrixxkatie/cassie-krea2-v1

## Resumen

Cassie Krea2 v1 es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario hendrixxkatie y publicado en Hugging Face bajo licencia Apache 2.0. Su funcion es incorporar un concepto de identidad concreta —una persona ficticia o real etiquetada con el token `CassiePerson`— al espacio latente del modelo base, de modo que el modelo pueda generar retratos y fotografias de cuerpo entero de ese sujeto en distintas poses, vestimentas e iluminaciones.

El adaptador se entrena sobre Krea 2 RAW (la variante de referencia del modelo base) y se muestra funcionando sobre Krea 2 Turbo con solo 8 pasos de inferencia y `guidance_scale=0.0`, lo que indica que el LoRA esta pensado para integrarse en flujos de generacion rapida. El repositorio ocupa 1.0 GB y contiene unicamente los pesos del adaptador, no el modelo base, por lo que requiere descargar Krea 2 por separado.

Es relevante ahora porque demuestra el patron habitual de personalizacion sobre modelos de difusion de nueva generacion: un LoRA ligero que anade un concepto de identidad sin reentrenar el modelo completo, con integracion directa en la libreria diffusers mediante `load_lora_weights`. No obstante, la informacion publicada es muy escasa: no hay detalles sobre el dataset de entrenamiento, hiperparametros, numero de pasos ni evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el repositorio pesa 1.0 GB, pero no se especifica el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (el ejemplo usa `torch_dtype=torch.bfloat16` para el modelo base) |
| Idiomas soportados | no disponible (el prompt de instancia esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos de LoRA compatibles con diffusers (`load_lora_weights`); formato de fichero concreto no disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth entrenado sobre el modelo base Krea 2 RAW. DreamBooth es una tecnica de personalizacion que ajusta un pequeno conjunto de pesos del modelo de difusion para que asocie un token unico —en este caso `CassiePerson`— con un sujeto concreto, permitiendo generar nuevas imagenes de ese sujeto en contextos no vistos durante el entrenamiento. Al ser un LoRA, solo se entrenan matrices de bajo rango inyectadas en las capas del modelo base, lo que reduce drasticamente el coste de entrenamiento y el tamano del artefacto resultante (1.0 GB en este caso).

No se dispone de informacion sobre el numero de imagenes del dataset, la composicion del mismo, el numero de pasos de entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion (prior preservation). Tampoco se documenta si el entrenamiento se realizo sobre Krea 2 RAW y se valido sobre Krea 2 Turbo, aunque la model card indica explicitamente que el adaptador se entrena en RAW y se muestra en Turbo, lo que sugiere compatibilidad con ambas variantes. No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `CassiePerson` para producir representaciones consistentes de un sujeto concreto.
- Retratos de primer plano, planos de tres cuartos y fotografias de cuerpo entero, segun los ejemplos de la model card.
- Control de vestimenta, pose, iluminacion y entorno mediante el prompt de texto (por ejemplo, camiseta negra casual, luz de ventana suave, luz natural de dia nublado).
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers mediante `load_lora_weights`.
- Inferencia rapida sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, al tratarse de un modelo de generacion de imagen.

## Casos de uso

- Generacion de retratos de identidad consistente: usar el token `CassiePerson` para producir variaciones de un mismo sujeto en distintas expresiones e iluminaciones, util para pruebas de concepto en estudios de personajes o avatares.
- Creacion de hojas de personaje para narrativa o videojuegos: generar planos frontales, de tres cuartos y de cuerpo entero del mismo sujeto para mantener coherencia visual entre assets.
- Pruebas de vestuario y estilismo sintetico: describir prendas y entornos en el prompt para explorar combinaciones sobre una identidad fija sin sesion fotografica.
- Prototipado rapido en flujos de diseno grafico: integrar el LoRA en un pipeline de diffusers para generar bocetos de personaje en pocos pasos con Krea 2 Turbo.
- Investigacion sobre personalizacion de modelos de difusion: servir como ejemplo reproducible de DreamBooth-LoRA sobre Krea 2 para estudiar transferencia de identidad y sobreajuste.
- Demostraciones tecnicas de integracion diffusers: validar el flujo `from_pretrained` + `load_lora_weights` en entornos de desarrollo antes de escalar a adaptadores propios.
- Generacion de material para pruebas de sesgo y privacidad: analizar como un adaptador de identidad afecta a la diversidad de salidas y a la fidelidad del sujeto en distintos prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de fidelidad de identidad (por ejemplo, similitud facial), calidad perceptual (FID, CLIP score) ni comparaciones con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica. El adaptador pesa 1.0 GB, pero la VRAM depende del modelo base Krea 2, que debe cargarse en bfloat16 segun el ejemplo de la model card.
- GPU recomendadas: no disponible. El ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Depende del modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. La model card indica 8 pasos de inferencia sobre Krea 2 Turbo, pero no aporta tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Token de activacion | Licencia | Contexto / pasos | Disponibilidad |
|---|---|---|---|---|---|---|
| cassie-krea2-v1 | LoRA DreamBooth texto-a-imagen | krea/Krea-2-Raw | `CassiePerson` | Apache 2.0 | 8 pasos en Turbo (segun model card) | Hugging Face, 16 descargas |
| Alternativas de LoRA de identidad sobre Krea 2 | LoRA DreamBooth texto-a-imagen | krea/Krea-2-Raw | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| LoRA de identidad sobre otros modelos de difusion (por ejemplo, SDXL) | LoRA DreamBooth texto-a-imagen | SDXL u otros | variable | variable | variable | amplia disponibilidad, pero no comparable directamente por modelo base distinto |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con adaptadores equivalentes sobre Krea 2 en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion de entrenamiento ausente: no se documentan dataset, numero de imagenes, hiperparametros ni regularizacion, lo que dificulta evaluar la robustez y el riesgo de sobreajuste del adaptador.
- Riesgo de sobreajuste al sujeto: al ser un DreamBooth-LoRA, puede reproducir poses, fondos o iluminaciones del dataset de entrenamiento y perder flexibilidad ante prompts muy distintos.
- Sensibilidad al token: el concepto solo se activa de forma fiable con el token `CassiePerson`; su uso sin el token puede degradar la calidad o no reproducir la identidad.
- Idiomas: no se especifican idiomas soportados; los prompts de ejemplo estan en ingles y no hay evidencia de funcionamiento con prompts en castellano.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un modelo base de difusion puede heredar sesgos de representacion del dataset original de Krea 2.
- Alucinacion visual: como todo modelo generativo de imagen, puede producir detalles anatomicos o de vestuario inconsistentes, especialmente en planos de cuerpo entero y con pocos pasos de inferencia.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base Krea 2 esta sujeto a su propia licencia, que debe verificarse por separado.
- Madurez: el repositorio tiene 16 descargas y 0 likes, sin validacion externa ni evaluacion cuantitativa, por lo que no se recomienda para produccion sin pruebas propias.
- Compatibilidad: solo se documenta su uso con `Krea2Pipeline` en diffusers; no hay garantias de funcionamiento con otras herramientas o variantes del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hendrixxkatie/cassie-krea2-v1
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo (usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
- Documentacion de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
