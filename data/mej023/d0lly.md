# mej023/d0lly

## Resumen

mej023/d0lly es un adaptador LoRA de tipo DreamBooth para la familia de modelos de generacion de imagenes Krea 2, desarrollado por el usuario mej023 y publicado en Hugging Face. El adaptador se entrena sobre el modelo base krea/Krea-2-Raw y se distribuye para su uso con la libreria diffusers, concretamente con el pipeline Krea2Pipeline. Su proposito es introducir un concepto visual concreto invocable mediante el token de activacion `d0lly`, que el autor emplea en las muestras para representar objetos y elementos de naturaleza variada (desde un dispositivo flotante hasta un objeto rustico de madera).

El modelo es relevante en el ecosistema de generacion de imagenes porque demuestra el flujo habitual de personalizacion de modelos text-to-image de gran tamano mediante LoRA: un adaptador ligero (repo de 0,8 GB) que se carga sobre un modelo base congelado sin necesidad de reentrenar los pesos completos. Las muestras publicadas se generaron con la variante Turbo del modelo base en 8 pasos de inferencia y guidance_scale 0.0, lo que indica que el adaptador esta pensado para funcionar en regimen de pocos pasos.

La informacion disponible es limitada: no se detallan hiperparametros de entrenamiento, composicion del dataset, numero de imagenes ni resultados cuantitativos. La ficha se elabora a partir de los metadatos de Hugging Face y de la model card del autor, indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion text-to-image Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el repo ocupa 0,8 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles en las muestras) |
| Licencia | apache-2.0 |
| Formato de pesos | pesos LoRA compatibles con diffusers (no se especifica safetensors de forma explicita) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica LoRA aplicada mediante DreamBooth sobre el modelo de difusion Krea 2 en su variante Raw (krea/Krea-2-Raw). No se especifica en la informacion disponible la arquitectura interna del modelo base (tipo de UNet o transformer de difusion, dimensiones, etc.), ni el rango de las matrices LoRA, ni los hiperparametros de entrenamiento (learning rate, numero de pasos, batch size, resolucion de entrenamiento).

El autor indica que el adaptador se entrena sobre Krea 2 RAW y que las muestras se generan sobre Krea 2 Turbo, lo que sugiere que el LoRA es compatible con ambas variantes del modelo base. Las imagenes de ejemplo se produjeron con 8 pasos de inferencia y guidance_scale 0.0, un regimen tipico de los modelos Turbo destilados. No se documenta el numero de imagenes del dataset, la composicion del mismo ni si se aplicaron tecnicas adicionales como regularizacion o captions automaticos.

## Capacidades

- Generacion de imagenes text-to-image condicionada por prompt en lenguaje natural.
- Introduccion de un concepto personalizado mediante el token de activacion `d0lly`.
- Compatibilidad con el pipeline Krea2Pipeline de diffusers mediante `load_lora_weights`.
- Funcionamiento en regimen de pocos pasos (8 pasos) sobre Krea 2 Turbo.
- Composicion del concepto con escenarios diversos (ciudad cyberpunk, vignedo toscano, estudio de cine abandonado) segun las muestras del autor.
- No se documentan capacidades de edicion de imagen, inpainting, control estructural, tool calling ni agentes.

## Casos de uso

- Generacion de ilustraciones conceptuales: el adaptador permite insertar el concepto `d0lly` en escenas variadas (urbana, rural, industrial) manteniendo coherencia visual, util para bocetos de direccion de arte.
- Prototipado rapido de assets para videojuegos o narrativa visual: con 8 pasos sobre Krea 2 Turbo se pueden generar variantes de un mismo concepto en distintos entornos para explorar estilo.
- Creacion de material editorial tematico: integracion del concepto en composiciones fotograficas o cinematograficas (por ejemplo, escenas de estudio) para articulos o portadas.
- Experimentacion en investigacion sobre personalizacion: sirve como caso de estudio de un LoRA DreamBooth sobre un modelo base reciente, para analizar transferencia de concepto y fidelidad.
- Pruebas de pipelines de difusion en produccion: validar la carga de adaptadores LoRA con diffusers y el comportamiento a guidance_scale 0.0 en modelos Turbo.
- Generacion de variaciones de estilo en campanas creativas: combinar el token con modificadores de escena, iluminacion y epoca para producir series coherentes de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2 (no documentado en la informacion). El adaptador LoRA en si ocupa 0,8 GB en disco.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU compatible con bfloat16.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; depende de los requisitos del modelo base Krea 2.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado).
- Latencia y throughput: no disponibles; el autor emplea 8 pasos de inferencia sobre Krea 2 Turbo, pero no publica tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con otros LoRA o adaptadores de la misma categoria.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del adaptador ni del modelo base.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir composiciones incoherentes, artefactos o atributos incorrectos, especialmente con prompts ambiguos.
- Fidelidad del concepto: al no publicarse metricas ni un dataset de validacion, no es posible cuantificar la consistencia del token `d0lly` fuera de las tres muestras mostradas.
- Dependencia del modelo base: el adaptador requiere Krea 2 (Raw o Turbo) y el pipeline Krea2Pipeline; no es autonomo.
- Idiomas: la model card solo muestra prompts en ingles; no se confirma soporte multilingue.
- Licencia apache-2.0 en el adaptador, pero el uso comercial puede estar condicionado por la licencia del modelo base Krea 2, que no se detalla en la informacion.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que indica ausencia de validacion por parte de la comunidad.
- No se especifican limitaciones de resolucion, pasos minimos/maximos ni compatibilidad con otras variantes del pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/mej023/d0lly
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo (usada en las muestras): https://huggingface.co/krea/Krea-2-Turbo
