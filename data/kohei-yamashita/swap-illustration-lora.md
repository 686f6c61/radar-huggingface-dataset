# Kohei-Yamashita/swap-illustration-lora

## Resumen

Swap Illustration LoRA (ronda 1) es un adaptador LoRA para el modelo de edicion de imagen Qwen-Image 2.1, desarrollado por el usuario Kohei-Yamashita. Su funcion es sustituir personas concretas dentro de una ilustracion 2D (imagen A) por los personajes que aparecen en imagenes de referencia (imagen B), redibujando al nuevo personaje con el estilo artistico propio de la escena A. Resuelve un problema muy especifico del flujo de trabajo de ilustracion: cambiar el reparto de una escena sin perder composicion, pose, fondo ni estilo, algo que con edicion generica suele requerir retoques manuales.

Tecnicamente es un adaptador de bajo rango (rank 32, ~168 MB en formato safetensors) que se carga sobre Qwen/Qwen-Image-2.1 en modo edicion. No introduce palabra de activacion (trigger word) y funciona tanto sobre el checkpoint base (esquema de 25 pasos) como sobre la variante Turbo (8 pasos). Admite hasta cuatro sustituciones simultaneas, con una imagen de referencia por persona.

Su relevancia actual radica en que empaqueta una tarea de edicion compleja (character swap con preservacion de estilo) en un adaptador ligero y con reglas de uso documentadas para agentes, acompanado de una aplicacion propia (Swap Illustration Studio). La contrapartida es una licencia de investigacion no comercial, lo que limita su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre el modelo de difusion Qwen-Image 2.1 en modo edicion |
| Parametros totales | No disponible (el adaptador es un LoRA; no se especifica el tamano del modelo base) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica (modelo imagen a imagen; el tamano de salida sigue a la imagen A) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Prompts en ingles (requisito indicado en la model card) |
| Licencia | Qwen Research License Agreement (solo investigacion o evaluacion; no comercial) |
| Formato de pesos | safetensors (anime-swap.safetensors, ~168 MB, rank 32) |

Dato adicional: SHA-256 del fichero de pesos `0e51ca1e452bce7b8406d1be4808a15cc1feb237c86ed39f70d2e6b1379d63b0`.

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 32 que se monta sobre Qwen-Image 2.1 en su modo de edicion de imagen (pipeline `image-to-image`). La model card indica que el adaptador se entreno sobre el modelo base con el esquema de 25 pasos, y que tambien carga y funciona sobre el checkpoint Turbo. No se detallan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO: esa informacion no esta disponible.

La innovacion funcional no esta en la arquitectura del adaptador, sino en el comportamiento aprendido: separa explicitamente que atributos se conservan de la escena A (pose, expresion facial, estado de la ropa, composicion, fondo, estilo artistico y todas las personas no sustituidas) y que atributos se toman de la referencia B (cara, peinado, color de pelo, ojos y diseno del vestuario), descartando el estilo de B y redibujando con el estilo de A. Las partes del vestuario de B que no aparecen en la referencia se rellenan de forma natural. El adaptador no usa palabra de activacion.

## Capacidades

- Edicion de imagen a imagen: sustitucion de personajes en ilustraciones 2D.
- Transferencia selectiva de identidad: toma cara, peinado, color de pelo, ojos y diseno del vestuario desde la imagen de referencia.
- Preservacion de estilo: mantiene pose, expresion, estado de la ropa, composicion, fondo y estilo artistico de la escena original.
- Multiples sustituciones: hasta cuatro personas a la vez, con una imagen de referencia por persona.
- Seleccion de objetivos mediante marcadores (elipses y circulos numerados con colores definidos) o mediante referencias posicionales en el prompt («the person on the left», «the second person from the left», etc.).
- Relleno natural del vestuario no visible en la referencia.
- Compatibilidad con dos esquemas de inferencia: base (25 pasos) y Turbo (8 pasos).
- Sin soporte declarado de tool calling, agentes, audio, video ni generacion de texto.

## Casos de uso

- Prototipado de personajes en produccion de ilustracion: el ilustrador puede sustituir un personaje por otro en una escena ya compuesta sin rehacer fondo, encuadre ni iluminacion, manteniendo el estilo del trabajo original.
- Iteracion de reparto en proyectos de webcomic o novela ligera: permite cambiar que personaje ocupa una posicion concreta de la vineta reutilizando la composicion existente.
- Variaciones de una misma escena para merchandising: generar versiones de una ilustracion con distintos protagonistas a partir de la misma escena base.
- Ajuste de personajes en key art o portadas: sustituir el personaje principal por una referencia de diseno aprobada, conservando la pose y el fondo del boceto.
- Pruebas de diseno de vestuario: tomar el diseno de ropa de la referencia B y aplicarlo sobre la pose y el estado de la ropa de la escena A.
- Evaluacion e investigacion de tecnicas de edicion con LoRA: el adaptador sirve como caso de estudio de transferencia selectiva de atributos (identidad frente a estilo) en modelos de difusion.
- Automatizacion dentro de ComfyUI: integrable como nodo `LoraLoaderModelOnly` entre `UNETLoader` y `QwenImage21Cache`, encadenable en pipelines de edicion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa ~168 MB, por lo que su impacto en VRAM es minimo; el requisito real lo determina el modelo base Qwen-Image 2.1, cuyas especificaciones (parametros y VRAM) no se detallan en la informacion proporcionada.
- Despliegue orientado a ComfyUI local o Comfy Cloud, segun indica la aplicacion Swap Illustration Studio.
- Flujo de carga recomendado: `LoraLoaderModelOnly` situado entre `UNETLoader` y `QwenImage21Cache`.
- Ajustes recomendados de inferencia: flujo de Qwen-Image 2.1 edit (Turbo 8 pasos o base 25 pasos), CFG 1, fuerza de LoRA inicial 0.8 (rango util 0.6-1.0; 1.0 funciona bien).
- GPU recomendadas, latencia y throughput: no disponibles en la informacion proporcionada.
- No se confirma si cabe en GPU de consumo; depende exclusivamente del modelo base, del que no hay datos de VRAM en esta ficha.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. Como referencia de contexto, el adaptador depende de Qwen/Qwen-Image-2.1 y no es autonomo: cualquier comparacion deberia hacerse frente a otros adaptadores de sustitucion de personajes para el mismo modelo base, dato que no se ha facilitado.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License Agreement restringe el uso a investigacion o evaluacion. No esta permitido el uso comercial sin autorizacion.
- Idiomas: los prompts deben escribirse en ingles; no se documenta soporte de otros idiomas en la entrada de texto.
- Precisión en la seleccion de sujetos: con dos o mas personas o personas solapadas, los marcadores (elipses y circulos numerados) son mas fiables que las referencias posicionales. Si una elipse cruza la cara de otra persona, hay que usar un rectangulo redondeado.
- El orden de las entradas importa: `image_1` es siempre el lienzo (A) y determina el tamano de salida; `image_2` a `image_5` son las referencias.
- Riesgo de artefactos o de no respetar la separacion estilo-identidad: la propia naturaleza de los modelos de difusion implica posibles inconsistencias; no se documentan tasas de fallo.
- No se especifican sesgos conocidos, ni limites de resolucion, ni comportamiento con estilos muy alejados del entrenamiento.
- Sin datos de benchmarks, no hay evidencia cuantitativa publicada de su calidad frente a alternativas.
- La model card esta marcada como «ronda 1», lo que sugiere una version preliminar susceptible de cambios.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Kohei-Yamashita/swap-illustration-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Aplicacion Swap Illustration Studio: https://github.com/KarakuriAgent/swap-illustration-studio
- Licencia (Qwen Research License Agreement) y aviso: ficheros LICENSE y NOTICE del repositorio del adaptador
- Descripcion de uso para agentes: fichero lora_description.md del repositorio
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada.
