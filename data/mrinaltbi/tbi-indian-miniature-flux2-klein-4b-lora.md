# mrinaltbi/tbi-indian-miniature-flux2-klein-4b-lora

## Resumen

TBI Indian Miniature es un adaptador LoRA de estilo para el modelo de difusion FLUX.2 [klein] 4B Base, desarrollado por The Brihaspati Infotech (mrinaltbi en Hugging Face). Su funcion es generar imagenes de cualquier tematica con la estetica de la pintura en miniatura india clasica: perspectiva plana, campos de color mate, lineas finas, textiles estampados y bordes pintados decorativos. El adaptador se activa mediante la frase de disparo `tbi_miniature style Indian miniature painting`.

El modelo resuelve un problema concreto de nicho: reproducir un estilo artistico historico (pintura cortesana india de entre aproximadamente 1560 y la decada de 1830) sin necesidad de reentrenar el modelo base completo. Al ser un LoRA de 48 MB sobre un base de 4B parametros, el coste de almacenamiento y de despliegue es minimo, y el entrenamiento declarado por el autor fue de 25 minutos en una unica GPU de 16 GB.

Es relevante ahora por tres motivos: se libera bajo licencia Apache-2.0 (uso comercial permitido), se entreno exclusivamente con imagenes de museo de dominio publico (CC0), y demuestra que un adaptador ligero puede cerrar aproximadamente dos tercios de la brecha de similitud de estilo respecto a pinturas reales (de 0,614 a 0,790, frente a 0,874 de las pinturas autenticas) manteniendo practicamente intacta la adherencia al prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion FLUX.2 [klein] 4B Base |
| Parametros totales | no disponible (adaptador de 48 MB; el base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt se documenta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers; template sd-lora) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango bajo acoplado al modelo base FLUX.2 [klein] 4B Base, un modelo de difusion texto-a-imagen de 4.000 millones de parametros. El LoRA modifica los pesos del base para sesgar la generacion hacia el estilo de la miniatura india sin alterar el resto de capacidades del modelo. El repositorio ocupa 0,1 GB y el adaptador pesa 48 MB.

Segun la model card, el entrenamiento se realizo exclusivamente con imagenes de museo de dominio publico (CC0) procedentes de pinturas cortesanas indias de aproximadamente 1560 a 1830. El autor declara un tiempo de entrenamiento de 25 minutos en una sola GPU de 16 GB, a una resolucion de 512 px; el adaptador funciona despues a 1.024 px y en formato retrato. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el rango del LoRA, la tasa de aprendizaje ni la composicion exacta del dataset mas alla de su procedencia y licencia.

## Capacidades

- Generacion texto-a-imagen con estetica de miniatura india clasica: perspectiva plana, color mate, linework fino, textiles estampados y bordes pintados.
- Transferencia de estilo a temas modernos: el modelo pinta sujetos contemporaneos (ingenieros de software, partidos de cricket, mercados callejeros, astronautas) con la tecnica historica.
- Soporte de temas clasicos: retratos reales, escenas ragamala, episodios de Krishna y otras iconografias devocionales.
- Frase de disparo obligatoria: `tbi_miniature style Indian miniature painting` para activar el estilo.
- Resolucion de trabajo: entrenado a 512 px, funciona a 1.024 px y en formato retrato.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio; es un modelo exclusivamente de generacion de imagen.

## Casos de uso

- Ilustracion editorial y de libros: generar portadas o ilustraciones interiores con estetica de miniatura india para publicaciones sobre historia, arte o cultura del sur de Asia, usando la frase de disparo y describiendo la escena.
- Diseno de producto y merchandising: crear estampados, postales y laminas decorativas con motivos cortesanos (princesas, falconeros, elefantes) para venta comercial, amparado por la licencia Apache-2.0.
- Contenido cultural y museistico: producir material divulgativo que reinterpreta escenas historicas o mitologicas en su estilo original, aprovechando que el entrenamiento uso solo imagenes CC0 de museo.
- Recreacion historica y divulgacion: ilustrar episodios de la India moderna temprana (siglos XVI-XIX) con la tecnica pictorica de la epoca, util para documentales, articulos y exposiciones.
- Contenido para redes y campanas: generar imagenes llamativas de temas cotidianos (monzon, chai, mercados, cricket) en un estilo visual distintivo y poco explotado por generadores genericos.
- Prototipado rapido de direccion de arte: un estudio puede iterar conceptos visuales en minutos con un adaptador de 48 MB sobre el base de 4B, sin reentrenar ni desplegar un modelo especializado.
- Fusion creativa contemporanea: mezclar iconografia clasica con temas actuales (astronautas, tecnologia) para proyectos de arte digital y moda.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Modelo base | Con LoRA | Pinturas reales | Dataset |
|---|---|---|---|---|
| Similitud de estilo (coseno CLIP ViT-L/14) | 0,614 | 0,790 | 0,874 | TBI miniature style test (12 prompts x 2 semillas) |
| Adherencia al prompt (CLIP score, ViT-L/14) | 30,35 | 30,74 | no disponible | TBI miniature style test |

Segun el autor, la imagen generada con el LoRA fue mas cercana al estilo real en las 24 pruebas comparativas (12 prompts por 2 semillas). La metrica de similitud de estilo y el CLIP score figuran como no verificados.

## Requisitos de hardware

- El adaptador LoRA pesa 48 MB; el modelo base FLUX.2 [klein] 4B requiere cargar sus pesos completos, cuyo tamano en VRAM no se detalla en la informacion disponible.
- Entrenamiento declarado: una sola GPU de 16 GB, 25 minutos, a 512 px.
- GPU recomendadas para inferencia: no disponibles de forma especifica; por el tamano del base (4B) se situa en la gama de GPUs de consumo alto y profesionales, pero no se confirma en la informacion.
- Opciones de despliegue: libreria diffusers (formato declarado); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros LoRA de estilo de miniatura india ni de comparativas con adaptadores equivalentes. La unica comparacion documentada es contra el propio modelo base sin LoRA:

| Modelo | Parametros | Similitud de estilo | CLIP score | Licencia |
|---|---|---|---|---|
| FLUX.2 [klein] 4B Base (sin LoRA) | 4B | 0,614 | 30,35 | no disponible en esta ficha |
| TBI Indian Miniature LoRA | 4B + adaptador 48 MB | 0,790 | 30,74 | Apache-2.0 |
| Pinturas reales (referencia) | no aplica | 0,874 | no disponible | dominio publico (CC0) |

## Limitaciones y advertencias

- Las metricas de estilo y CLIP score estan declaradas por el autor y marcadas como no verificadas; conviene tratarlas como indicativas.
- El adaptador esta entrenado a 512 px; a 1.024 px funciona segun el autor, pero no se documenta la calidad a resoluciones superiores ni en otras relaciones de aspecto fuera del formato retrato.
- Requiere la frase de disparo exacta (`tbi_miniature style Indian miniature painting`); sin ella el estilo puede no activarse.
- El estilo esta acotado a la miniatura india de los siglos XVI-XIX; no cubre otras tradiciones pictoricas indias ni estilos regionales no representados en el dataset.
- Riesgo de alucinacion visual y de mezcla de elementos: como todo modelo de difusion, puede generar detalles anatomicos o arquitectonicos incorrectos, especialmente en escenas complejas.
- No se documentan sesgos especificos, pero el dataset procede de pintura cortesana, lo que puede sobrerrepresentar iconografia aristocratica y religiosa frente a escenas populares.
- Licencia Apache-2.0 permite uso comercial; el modelo base FLUX.2 [klein] 4B tiene su propia licencia que debe verificarse por separado antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un modelo recien publicado y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrinaltbi/tbi-indian-miniature-flux2-klein-4b-lora
- Modelo base FLUX.2 [klein] 4B Base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- The Brihaspati Infotech: https://www.brihaspatitech.com/
