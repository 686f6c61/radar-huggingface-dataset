# bravikron/krea-retro-film-krea2-lora

## Resumen

Krea Retro Film es un LoRA de estilo para el modelo de generacion de imagenes Krea 2, desarrollado por Bravikron Labs. Su funcion es transformar cualquier prompt de texto en una imagen que imite el aspecto de una camara de carrete barata de los anos 90: flash directo duro, fondos oscuros, colores calidos y desvaidos, grano suave y enfoque ligeramente blando. No es un modelo autonomo, sino un adaptador que se aplica sobre Krea 2 Raw (y funciona tambien sobre Krea 2 Turbo).

El adaptador se entreno sobre 28 imagenes originales y se publico en el paso 1000 de 2000 para preservar la variedad facial. Se activa con la palabra clave `retrofilm style` y esta pensado para escenas cotidianas y espontaneas (fiestas, viajes por carretera, mascotas, interiores domesticos) mas que para retratos posados. El repositorio ocupa 0,2 GB y contiene un unico archivo safetensors.

Es relevante para quienes trabajan con Krea 2 y necesitan un look analogico consistente sin reentrenar el modelo base. La licencia es la Krea 2 Community License, que impone restricciones de uso comercial y un umbral de ingresos, por lo que conviene revisarla antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Krea 2 no publica cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Krea 2 Community License Agreement (krea-2-community-license) |
| Formato de pesos | safetensors (`krea_retro_film_v1.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un LoRA de estilo entrenado sobre Krea 2 Raw, el checkpoint base del ecosistema Krea 2. Al ser un adaptador de bajo rango, no define una arquitectura propia: modifica los pesos del modelo base para sesgar la generacion hacia un estilo fotografico concreto. El autor indica que se entreno con 28 imagenes originales y que se publico en el paso 1000 de un total de 2000, decision tomada para mantener la variedad de rostros y evitar el sobreajuste.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset mas alla del recuento de imagenes, ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo de difusion de texto a imagen). Tampoco se detalla el rango del LoRA ni la tasa de aprendizaje empleada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con estetica de fotografia analogica de los 90.
- Aplicacion de un estilo consistente: flash directo, fondos oscuros, colores calidos desvaidos, grano y enfoque suave.
- Funciona sobre Krea 2 Turbo (configuracion recomendada: 8 pasos, CFG 1, sampler euler/simple) y sobre Krea 2 Raw.
- Intensidad ajustable: fuerza 1.0 para el efecto completo, 0.7 para una version mas sutil.
- Adecuado para escenas cotidianas y espontaneas: interiores, fiestas, viajes, mascotas, retratos informales.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente (no aplica a un modelo de imagen).
- No se documentan capacidades multilingues; los ejemplos y la palabra de activacion estan en ingles.

## Casos de uso

- Contenido nostalgico para redes sociales: generar imagenes con estetica de album familiar de los 90 para campanas de marca o publicaciones, usando el prompt `retrofilm style, <escena cotidiana>`.
- Ilustracion editorial y de reportaje: crear imagenes que simulen fotografia documental analogica para articulos sobre cultura pop, musica o memoria colectiva.
- Maquetas y pruebas de concepto: validar rapidamente un estilo visual retro antes de invertir en una sesion fotografica real.
- Diseno de packaging y merchandising: producir imagenes de ambiente con look de carrete para lineas de producto retro (camisetas, postales, vinilos).
- Storyboards y previsualizacion audiovisual: generar fotogramas de referencia con textura analogica para proyectos de cine o videoclip ambientados en los 90.
- Generacion de avatares y retratos informales: crear imagenes de personas en contextos domesticos (cocina, coche, acampada) con la recomendacion de incluir edad y ropa sencilla para mejorar la coherencia.
- Prototipado de escenas para videojuegos o narrativa interactiva: poblar entornos con imagenes de estilo fotografico retro como referencia de arte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Krea 2, no del LoRA (que solo anade 0,2 GB de pesos).
- GPU recomendadas: no disponible. La VRAM necesaria vendra determinada por Krea 2 Raw o Krea 2 Turbo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: no se documentan en la model card; al ser un LoRA en safetensors, requiere un runtime compatible con Krea 2 (no se especifica cual).
- Latencia y throughput: no disponibles. La configuracion recomendada de 8 pasos con CFG 1 en Krea 2 Turbo sugiere inferencia rapida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea Retro Film (este LoRA) | LoRA de estilo sobre Krea 2 | no disponible | no aplica | Krea 2 Community License | Hugging Face y Civitai |
| Krea 2 Raw (modelo base) | Modelo text-to-image | no disponible | no aplica | Krea 2 Community License | Hugging Face (krea/Krea-2-Raw) |
| Krea 2 Turbo (modelo base) | Modelo text-to-image | no disponible | no aplica | Krea 2 Community License | Hugging Face (krea/Krea-2-Turbo) |

No se dispone de datos de benchmarks ni de otros LoRAs comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento cuantitativa.

## Limitaciones y advertencias

- Entrenado con solo 28 imagenes: el estilo puede mostrar poca diversidad y sobreajustarse a las escenas del dataset.
- Krea 2 tiende a generar texto ilegible en carteles y rotulos; el autor recomienda evitar "neon sign" o pedir "a blank sign".
- Para personas conviene especificar edad y ropa sencilla; de lo contrario la coherencia facial puede resentirse.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir detalles anatomicos o de escena incorrectos.
- No se documentan sesgos conocidos, pero al derivar de un modelo base no se pueden descartar sesgos heredados de Krea 2.
- Licencia restrictiva: la Krea 2 Community License incluye una politica de uso aceptable y un umbral de ingresos para uso comercial; es obligatorio revisarla antes de explotacion comercial.
- No es un producto oficial de Krea y no esta respaldado por Krea.
- No se documentan idiomas soportados ni comportamiento multilingue; los prompts de ejemplo estan en ingles.
- No se especifican requisitos de hardware ni opciones de despliegue, lo que complica la planificacion en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/bravikron/krea-retro-film-krea2-lora
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2 Community License: https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf
- Informacion de licencias de Krea: https://krea.ai/krea-2-licensing
- Pagina en Civitai: https://civitai.com/models/3040207
- Modelos gratuitos del autor: https://bravikron.com/models.html
- Entrenamiento de LoRA personalizado: https://bravikron.com/labs.html
