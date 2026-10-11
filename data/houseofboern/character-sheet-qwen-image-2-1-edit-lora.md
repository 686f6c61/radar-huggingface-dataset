# houseofboern/character-sheet-qwen-image-2.1-edit-lora

## Resumen

Character Sheet Edit LoRA for Qwen Image 2.1 es un adaptador LoRA de edicion de imagen desarrollado por el usuario houseofboern sobre el modelo base Qwen/Qwen-Image-2.1. Su funcion es muy concreta: a partir de una unica fotografia de una persona de cuerpo entero, genera una hoja de referencia de personaje compuesta por una rejilla de 3x2 (seis celdas) sobre fondo gris plano, con un primer plano del rostro en la primera celda y cinco vistas del cuerpo en las restantes. Existe en dos variantes de salida, "angle sheet" (frontal, trasera, lateral y dos giros intermedios) y "pose sheet" (cinco poses prefijadas).

El adaptador tiene rango 8 y ocupa aproximadamente 42 MB, lo que lo hace muy ligero y facil de integrar en flujos de ComfyUI. No es un modelo autonomo: requiere el checkpoint base Qwen Image 2.1 en bf16, el codificador de texto Qwen3-VL-8B y el VAE de Qwen Image 2.1. El autor advierte explicitamente que la variante Turbo del modelo base rompe el comportamiento aprendido y que la fuerza del LoRA debe mantenerse en 1.0.

Su relevancia practica esta en la consistencia de personajes para produccion visual: genera hojas de referencia normalizadas (mismo rostro, misma ropa, fondo neutro), un paso habitual en preproduccion de videojuegos, animacion e ilustracion. El entrenamiento fue muy reducido (77 pares antes/despues, 693 pasos), por lo que el modelo solo responde bien a los cuatro prompts exactos con los que fue entrenado. La licencia es la Qwen Research License, de uso no comercial salvo licencia comercial otorgada por Qwen. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen Image 2.1; rango 8 |
| Parametros totales | No disponible para el adaptador (pesos de unos 42 MB); el modelo base no declara cifra en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; el codificador de texto es Qwen3-VL-8B) |
| Tipos de cuantizacion | Checkpoint base en bf16 segun el flujo recomendado; no se documentan otras cuantizaciones para el LoRA |
| Idiomas soportados | No disponible (los prompts de entrenamiento estan en ingles y deben copiarse literalmente) |
| Licencia | Qwen Research License (license: other; no comercial sin licencia comercial de Qwen) |
| Formato de pesos | safetensors (character-sheet-qwen-image-2.1-edit-lora-e9.safetensors) |

Datos adicionales: tamano del repositorio 0,1 GB; fecha de creacion y ultima actualizacion 2026-10-10; 0 descargas y 0 likes; pipeline no disponible en HuggingFace.

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 8 aplicado sobre Qwen Image 2.1, un modelo de generacion y edicion de imagen condicionado por texto. El flujo de inferencia documentado se apoya en tres componentes: el checkpoint qwen_image_2.1_bf16, el codificador de texto Qwen3-VL-8B y el VAE de Qwen Image 2.1, todos ellos distribuidos en el repositorio Comfy-Org/Qwen-Image-2.1. El LoRA se carga con el nodo LoraLoaderModelOnly de ComfyUI. El autor indica que fue entrenado sobre la variante base, no sobre Turbo.

El entrenamiento se realizo con el trainer Fizgig (preset "Qwen 2.1 Edit, rank 8, adaptive LR") sobre un conjunto de 77 pares antes/despues: 38 hojas de angulos y 39 hojas de poses. De las 12 epocas previstas se selecciono la 9 (693 pasos) por evaluacion visual. No se documenta composicion del dataset mas alla de ese recuento, ni uso de RLHF, DPO o tecnicas de alineacion adicionales.

La innovacion funcional no esta en la arquitectura sino en el formato de salida aprendido: la rejilla 3x2 con fondo gris y el encuadre "cortado a la altura del cuello" en las celdas de cuerpo. El autor documenta una dependencia critica del aspecto de la imagen de entrada: el modelo fue entrenado con fotografias anchas con barras grises laterales, y con una foto cuadrada sin esas barras la rejilla se rompe y algunas celdas muestran solo piernas; de ahi el paso de auto-padding con el paquete ComfyUI-KJNodes.

## Capacidades

- Edicion de imagen guiada por texto: transforma una fotografia de entrada en una hoja de referencia de personaje.
- Generacion de hojas de angulos: primer plano del rostro mas cinco vistas del conjunto (frontal, trasera, lateral, tres cuartos frontal y tres cuartos trasera).
- Generacion de hojas de poses: primer plano del rostro mas cinco poses fijas (de pie de perfil con la espalda arqueada, sentada sobre un cubo gris, con un pie sobre el cubo, mirando por encima del hombro y sentada en el suelo recostada).
- Dos modos de encuadre: cuerpo cortado a la altura del cuello (modo principal y mas fiable) o cuerpo completo de la cabeza a los pies (menos ejemplos de entrenamiento, menos fiable).
- Preservacion de identidad y vestuario: misma persona y misma ropa en todas las celdas, sobre fondo gris plano.
- Inferencia de elementos ausentes: si los zapatos no aparecen en la foto de entrada, el modelo los inventa.
- Flujo de reescalado y correccion de rostro: el segundo workflow genera una hoja de 2704 x 1552 con mejores ojos, sin usar el LoRA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni soporte multilingue de prompts.

## Casos de uso

- Preproduccion de personajes en videojuegos: a partir de una foto de referencia de vestuario o casting, generar una hoja de angulos normalizada (frontal, trasera, lateral y tres cuartos) que el equipo de modelado 3D use como guia de vistas coherentes.
- Ilustracion y comic con personaje recurrente: producir una hoja de poses prefijadas para mantener la misma figura humana y la misma ropa a lo largo de varias vinetas, reduciendo el trabajo manual de dibujar cada vista.
- Animacion y storyboard: obtener rapidamente las cinco poses de referencia para planificar planos y comprobar siluetas antes de pasar al entintado o al render.
- Generacion de datasets para otros LoRA de personaje: las hojas resultantes sirven como material de partida etiquetado y con fondo neutro para entrenar adaptadores de identidad adicionales.
- Catalogos de moda y e-commerce: convertir una unica foto de estudio en una ficha visual multicelda con varias vistas de la prenda, con el flujo opcional de reescalado a 2704 x 1552 para publicacion.
- Pruebas de vestuario virtual: generar variantes de vista del mismo modelo y conjunto para evaluar el ajuste de una prenda sin repetir la sesion fotografica.
- Prototipado de avatares y personajes para VTubers o entornos 3D: la rejilla de angulos es un formato habitual de entrega para equipos de rigging que necesitan vistas ortogonales de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas cuantitativas (FID, CLIP score, similitud de identidad ni evaluaciones humanas). La unica evaluacion documentada es cualitativa: los ejemplos del repositorio se generaron a fuerza 1.0, semilla 7 y 25 pasos, sin seleccion de semilla mas alla de una, y el autor senala que las hojas de angulos son el modo fuerte mientras que las hojas de poses fallan con mas frecuencia, sobre todo en cuerpos con curvas o con pecho prominente. Tambien indica que con CFG 3 una prueba dejo una celda vacia y que con fuerza 0.8 o inferior las celdas se vacian o se fusionan.

## Requisitos de hardware

- VRAM estimada: no disponible. El flujo oficial exige el checkpoint base en bf16, lo que en la practica implica una GPU de gama alta o de centro de datos; no se publica cifra concreta.
- GPU recomendadas: no especificadas por el autor. Se asume el rango habitual para el modelo base Qwen Image 2.1 en bf16 (A100, H100 o RTX con VRAM suficiente), pero el dato no esta confirmado en la informacion proporcionada.
- GPU de consumo: no confirmado. El LoRA en si ocupa unos 42 MB, pero el cuello de botella es el modelo base y el codificador de texto Qwen3-VL-8B, no el adaptador.
- Despliegue: ComfyUI es el entorno documentado y soportado. El repositorio incluye dos workflows en formato JSON API (generacion de hoja y reescalado con correccion de rostro) y un script pad_to_16x9.py para replicar el padding fuera de ComfyUI. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Dependencias: paquete ComfyUI-KJNodes para el nodo de auto-padding; modelos en Comfy-Org/Qwen-Image-2.1 (qwen_image_2.1_bf16, Qwen3-VL-8B y el VAE de Qwen Image 2.1).
- Ajustes de inferencia: 25 pasos, CFG 1, sampler euler, scheduler simple, resolucion 1344 x 768 (igual que en entrenamiento). El paso de reescalado opcional produce 2704 x 1552.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de memoria pico.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El autor no menciona alternativas y la busqueda web realizada no devolvio resultados relacionados con el modelo (los unicos resultados obtenidos eran contenidos no pertinentes sobre pintura renacentista). Se indica por tanto "no disponible" en todos los ejes, incluidos parametros, contexto, rendimiento, licencia de terceros y disponibilidad.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| character-sheet-qwen-image-2.1-edit-lora | LoRA rango 8 (~42 MB) sobre Qwen Image 2.1 | No disponible | Sin benchmarks publicados | Qwen Research License (no comercial) | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenamiento muy reducido: 77 pares y 693 pasos. El modelo solo responde de forma fiable a los cuatro prompts literales del autor; anadir o cambiar palabras degrada el resultado.
- Dependencia estricta de los ajustes: fuerza del LoRA 1.0, CFG 1, 25 pasos, sampler euler, scheduler simple y resolucion 1344 x 768. Valores distintos producen celdas vacias o fusionadas.
- Incompatibilidad con Turbo: el autor afirma explicitamente que la variante Turbo del modelo base rompe el comportamiento aprendido.
- Sensibilidad al formato de entrada: requiere fotografia en formato ancho con barras grises laterales. Con imagenes cuadradas sin barras, la rejilla se rompe. El flujo incluye auto-padding mediante ComfyUI-KJNodes para mitigarlo.
- Restricciones sobre la foto de entrada: funciona con personas de pie y con al menos la mitad del cuerpo visible; falla con personas sentadas o en primer plano, generando rostros deformados y celdas vacias.
- Alucinacion de contenido: si los zapatos no aparecen en la fotografia, el modelo los inventa. No hay control documentado sobre este comportamiento.
- Asimetria de calidad: las hojas de angulos son el modo fuerte; las hojas de poses fallan con mas frecuencia, especialmente en cuerpos con curvas o con pecho prominente. El autor recomienda probar dos o tres semillas.
- Rostros pequenos y ojos imperfectos: los rostros de la rejilla son pequenos y los ojos pueden quedar mal; se corrige con el segundo workflow, que no usa el LoRA.
- Uso comercial restringido: la Qwen Research License no permite uso comercial sin licencia comercial otorgada por Qwen. Esta limitacion se hereda del modelo base y afecta a cualquier producto derivado.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes, un unico autor y no se documenta soporte posterior a la publicacion.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, de genero, de tono de piel ni de constitucion corporal. El material de entrenamiento esta sesgado hacia fotografias de cuerpo entero de una sola persona por imagen.
- Idiomas: los prompts deben usarse en ingles tal cual; no hay soporte documentado de otros idiomas de prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/houseofboern/character-sheet-qwen-image-2.1-edit-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Pesos y componentes necesarios (checkpoint bf16, Qwen3-VL-8B, VAE): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Trainer empleado (Fizgig): https://github.com/shootthesound/Fizgig
- Documentacion ampliada de prompting incluida en el repositorio: HOW_TO_PROMPT.md
- Workflows incluidos: workflows/1_character_sheet_edit_api.json y workflows/2_sheet_upscale_face_reference_api.json
- Script de padding: pad_to_16x9.py
- Resultados de la busqueda web: no se encontro ninguna fuente relevante sobre el modelo; los resultados devueltos no guardaban relacion con la consulta.
