# S3ckn11g0r/CROWN-H3-Spatial-And-Hand-Grip-Master

## Resumen

CROWN-H3 Spatial And Hand Grip Master es un adaptador LoRA para el modelo de generacion de video MiniMax-H3, desarrollado por el usuario NineCrowns (S3ckn11g0r) y publicado en Hugging Face. No se trata de un modelo base autonomo, sino de un ajuste fino parametrico de bajo rango que se acopla al modelo MiniMaxAI/MiniMax-H3 para modificar dos comportamientos concretos de la generacion text-to-video: la sujecion de armas con las cinco manos y la oclusion espacial entre dos personajes.

El adaptador aborda dos problemas estructurales recurrentes en la sintesis de video con personajes: por un lado, la tendencia del modelo base a generar empunaduras incorrectas (dedos sobre la hoja, empunadura flotante) y geometrias de espada deformadas durante cortes y paradas; por otro, la perdida de identidad facial cuando dos personajes se cruzan en primer y segundo plano. El LoRA introduce los tokens de activacion `crown_grip`, `crown_spatial` y `crown_spatial_grip` para inducir estos comportamientos.

El modelo se distribuye como un unico fichero safetensors de 910,06 MB (rank 64, alpha 64) y esta pensado para su uso en ComfyUI y en flujos de trabajo de MiniMax H3 en modalidad Ref2VA, I2VA y T2VA. La relevancia actual radica en que permite obtener coreografias de combate y cruces de personajes con coherencia estructural sin reentrenar el modelo base, a coste de un peso adicional pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3; bloques video-only 10-49, rank 64, alpha 64, con adaptador de des-destilacion de Ostris |
| Parametros totales | no disponible (adaptador de 910,06 MB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base MiniMax-H3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bespoke-lora-license (licencia a medida; enlace a civitai.com/user/NineCrowns) |
| Formato de pesos | safetensors (`CROWN_H3_Spatial_And_Hand_Grip_Master_V1_r64.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 aplicado exclusivamente a los bloques video-only 10 a 49 del modelo base MiniMax-H3, e incorpora un adaptador de des-destilacion de Ostris. El entrenamiento se realizo sobre un cluster de 8 GPU NVIDIA B200 con material de video de artes marciales y coreografia dramatica de dos personajes, descrito por el autor como 100 % metraje real de combate con armas.

El objetivo del ajuste es doble. Primero, el token `crown_grip` fuerza que los cinco dedos se cierren alrededor del mango por debajo de la guarda y mantiene la hoja recta y rigida en cortes lineales, estocadas y paradas. Segundo, `crown_spatial` permite que dos personajes en modo Ref2VA se crucen en X con intercambio de posicion izquierda-derecha y oclusion primer plano-fondo, preservando la estructura facial y el vestuario de cada uno sin intercambio de caras. El token combinado `crown_spatial_grip` activa ambos comportamientos.

## Capacidades

- Generacion de video text-to-video sobre el modelo base MiniMax-H3, en las modalidades Ref2VA, I2VA y T2VA.
- Control de empunadura de arma con las cinco manos y bloqueo de la geometria rigida de la hoja durante cortes, estocadas y paradas cruzadas.
- Cruce espacial en 3D entre dos personajes con intercambio de posicion en primer y segundo plano y oclusion mutua.
- Preservacion de identidad facial y de vestuario en escenas de dos personajes sin intercambio de caras ni mezcla de ropa.
- Coreografia de combate cuerpo a cuerpo con armas (esgrima, artes marciales) en planos secuencia.
- Compatibilidad con flujos de trabajo ComfyUI y con la plataforma en la nube RunningHub.
- No dispone de capacidades de texto, codigo, razonamiento simbolico, tool calling ni agentes; es un adaptador exclusivamente audiovisual.

## Casos de uso

- Produccion de escenas de esgrima y combate con arma blanca: el adaptador garantiza que el personaje empuna el mango y no la hoja, y que la espada mantiene rigidez en cortes y paradas, lo que reduce el numero de tomas descartadas en previsualizacion.
- Coreografias de dos luchadores que se cruzan: con `crown_spatial` se generan cruces en X con intercambio de posiciones y oclusion sin que los rostros ni la ropa se mezclen, util para secuencias de accion con continuidad de personajes.
- Previsualizacion de storyboards de accion: el LoRA permite iterar rapidamente sobre planos de lucha con el modelo base MiniMax-H3 y validar la puesta en escena antes del rodaje real.
- Creacion de contenido para videojuegos y trailers: generacion de clips de combate con armas para material promocional o cinemáticas provisionales, usando el pipeline text-to-video con los tokens de activacion.
- Flujos de trabajo en ComfyUI: integracion del adaptador en grafos de nodos con el sampler euler + beta, 25 pasos y cfg 1.0, tal como documenta el autor en su configuracion de prueba.
- Produccion de video corto en la nube: uso del LoRA a traves de los workflows y aplicaciones de RunningHub para equipos sin GPU local capaz de ejecutar el modelo base.
- Investigacion sobre control estructural en difusion de video: el adaptador sirve como caso de estudio de como un LoRA de rango 64 sobre bloques intermedios puede imponer restricciones fisicas y de identidad en la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta una configuracion de prueba de produccion (25 pasos, sampler euler + beta, cfg 1.0, MiniMaxH3SigmaShift con shift_video 12.0 y shift_audio 3.0, peso de LoRA recomendado entre 0.65 y 0.75) y un video de muestra generado solo con este LoRA a peso 0.65, sin metricas cuantitativas.

## Requisitos de hardware

- El adaptador en si ocupa 910,06 MB en safetensors y se suma a los pesos del modelo base MiniMax-H3, que no esta cuantificado en la informacion disponible.
- El autor entreno el LoRA en un cluster de 8 GPU NVIDIA B200; no se documenta el hardware minimo de inferencia.
- No se dispone de datos sobre VRAM necesaria para inferencia ni sobre si el conjunto base + LoRA cabe en GPU de consumo (RTX 4090, etc.).
- Opciones de despliegue documentadas: ComfyUI (local) y la plataforma en la nube RunningHub (sitios .ai y .cn), con workflow y aplicacion web de un clic.
- No se documentan latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables para MiniMax-H3 ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia bespoke-lora-license: es una licencia a medida, no una licencia open source estandar; es necesario revisar los terminos en el enlace del autor antes de cualquier uso comercial.
- El adaptador depende del modelo base MiniMax-H3 y de su licencia; las restricciones del modelo base se aplican igualmente.
- El rendimiento esta calibrado para un peso de LoRA de 0.65 a 0.75 y una configuracion de muestreo concreta; otros valores pueden degradar el resultado.
- El entrenamiento se realizo sobre metraje de artes marciales y combate con espada, por lo que el comportamiento fuera de ese dominio no esta garantizado.
- No se documentan sesgos demograficos, idiomas soportados ni evaluaciones de robustez.
- Riesgo de artefactos en escenas de mas de dos personajes o en cruces con oclusiones complejas, ya que el entrenamiento se centra en el caso de dos personajes.
- La model card incluye enlaces a plataformas de terceros y a un sitio externo no oficial; conviene verificar su procedencia antes de usarlos.
- El modelo tiene 419 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-Spatial-And-Hand-Grip-Master
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia (perfil del autor en Civitai): https://civitai.com/user/NineCrowns
- Pagina oficial en Civitai: https://civitai.com/models/3042756
- RunningHub Global, modelo LoRA: https://www.runninghub.ai/model/public/2120439267540602881
- RunningHub Global, workflow ComfyUI: https://www.runninghub.ai/workflow/2120529855524020226
- RunningHub Global, aplicacion web: https://www.runninghub.ai/ai-detail/2120529871293157377
- RunningHub China, modelo LoRA: https://www.runninghub.cn/model/public/2120452083391488001
- RunningHub China, workflow: https://www.runninghub.cn/workflow/2120527387225059329
- RunningHub China, aplicacion web: https://www.runninghub.cn/ai-detail/2120527407072505857
- Sitio externo mencionado por el autor (no oficial): https://h3xron.xyz
