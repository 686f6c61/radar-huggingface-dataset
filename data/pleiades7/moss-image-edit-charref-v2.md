# pleiades7/moss-image-edit-charref-v2

## Resumen

moss-image-edit-charref-v2 es un adaptador LoRA para el modelo de difusion MOSS-Image SFT de OpenMOSS-Team, desarrollado por el usuario pleiades7 (bag3labo). Su funcion es tomar una unica imagen de referencia de un personaje de anime y un prompt textual de escena, y generar ese mismo personaje (pelo, cara, vestuario y accesorios tomados de la referencia) en la pose, encuadre y fondo descritos por el prompt. Resuelve el problema de la consistencia de personaje en generacion imagen-a-imagen, un caso de uso muy demandado en flujos de creacion de contenido anime.

El adaptador se distribuye como un fichero safetensors de 297 MB que se carga sobre el modelo base MOSS-Image SFT, un modelo de difusion que en ComfyUI se combina con un text encoder Qwen3.5 de 9B y el VAE de Flux2. La libreria declarada es comfyui y el pipeline es image-to-image. El autor lo describe explicitamente como una version temprana: mantiene el personaje reconocible en aproximadamente la mitad de los renders simples y tiene fallos conocidos documentados.

Es relevante ahora porque el ecosistema ComfyUI concentra buena parte del trabajo practico con modelos de difusion open source, y este tipo de LoRA de referencia de personaje habilita flujos de produccion para ilustracion, storyboards y assets de videojuegos sin reentrenar el modelo base. La licencia MIT facilita su integracion comercial, aunque el modelo base tiene sus propias condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion MOSS-Image SFT (adaptador de bajo rango) |
| Parametros totales | no disponible (fichero LoRA de 297 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); el text encoder es Qwen3.5 9B |
| Tipos de cuantizacion | LoRA en safetensors; el modelo base dispone de bf16 e int8 (variante Turbo INT8 ConvRot) |
| Idiomas soportados | no disponible (prompts de escena en formato de tags, ejemplos en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (LoRA); modelo base en safetensors bf16 e int8 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de bajo rango entrenado sobre MOSS-Image SFT, un modelo de difusion para edicion y generacion de imagenes. El LoRA se entrena con el formato de edicion `ai-toolkit` y una particularidad clave: la imagen de referencia se coloca debajo de la salida en lugar de en las mismas posiciones que usa ComfyUI por defecto. Por eso el autor proporciona un nodo personalizado (`moss_image_charref`) que reproduce esa disposicion; sin el nodo, el LoRA no funciona como fue probado.

El adaptador se entrena para separar identidad de escena: la identidad del personaje proviene de la imagen de referencia, mientras que pose, encuadre y fondo provienen del prompt. El autor no detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de difusion de este tipo). Si se documenta el uso de skip-layer guidance en el bloque 22 (`single_layers` = 22) y de una segunda pasada de "reference guidance" (valor 2.5) que mejora el parecido a costa de aproximadamente 1,4 veces mas tiempo por imagen. El LoRA esta disenado para apilarse con LoRAs de estilo, ya que no impone una estetica propia fuerte.

## Capacidades

- Generacion imagen-a-imagen con consistencia de personaje a partir de una unica referencia.
- Transferencia de identidad: pelo, cara, color de ojos, orejas, vestuario y accesorios tomados de la imagen de referencia.
- Control de escena por prompt: pose, encuadre (cuerpo entero, plano medio, primer plano), fondo e iluminacion descritos con tags separados por comas.
- Compatibilidad con LoRAs de estilo apiladas sobre el mismo modelo base.
- Dos modos de muestreo: muestreo simple (mas rapido, sigue mejor el prompt) y reference guidance (mejor parecido, ~1,4x mas lento).
- Variante Turbo a 8 pasos con modelos cuantizados int8 para hardware mas limitado.
- No soporta tool calling ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- Capacidades multilingues: no disponibles; los ejemplos y el formato de prompt documentado estan en ingles con tags estilo Danbooru.

## Casos de uso

- Ilustracion de personajes recurrentes: dado un diseno de personaje, generar variaciones en distintas escenas manteniendo el diseno coherente, util para webcomics y novelas ligeras.
- Storyboards y previsualizacion: colocar un personaje en multiples encuadres (plano medio, cuerpo entero) para planificar secuencias sin redibujar cada fotograma.
- Assets para videojuegos indie: generar poses y expresiones de un personaje concreto para menus, dialogos o fichas de personaje, partiendo de un unico art de referencia.
- Prototipado de merchandising: probar un personaje en escenarios tematicos (cafe, playa, festival) para decidir lineas de producto antes de encargar arte final.
- Iteracion de diseno con estilo: apilar un LoRA de estilo sobre este adaptador para mantener identidad mientras se explora una estetica concreta.
- Generacion de referencias para otros pipelines: usar MOSS-Image SFT text-to-image para crear la referencia (prompt terminado en "Full body, standing, facing the viewer, plain white background") y alimentar despues este LoRA.
- Automatizacion en ComfyUI: los workflows en formato API permiten integrar la generacion en scripts y colas por lotes para producir conjuntos de imagenes de un mismo personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta unicamente una evaluacion cualitativa: el personaje se mantiene reconocible en aproximadamente la mitad de los renders simples, con fallos conocidos documentados en la seccion de limites de la model card. En una RTX 5090, una imagen tarda aproximadamente 19 s con muestreo simple y 26 s con reference guidance. No se probaron tarjetas menores ni los ficheros cuantizados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base bf16 ocupa 10,2 GB (difusion) mas 19,3 GB (text encoder Qwen3.5 9B) mas 336 MB (VAE Flux2), por lo que en bf16 se requiere hardware de gama alta o descarga parcial a CPU.
- Variante cuantizada int8 (Turbo INT8 ConvRot) reduce los requisitos del modelo base, pensada para GPUs con menos VRAM.
- GPU recomendadas: RTX 5090 verificada por el autor (19-26 s por imagen). No se probaron otras tarjetas.
- Cabe en GPU consumer: si, al menos en RTX 5090 con los ficheros bf16; en tarjetas con menos VRAM seria necesario usar las variantes int8 o descarga a CPU, no verificadas.
- Opciones de despliegue: ComfyUI con el nodo personalizado `moss_image_charref` (obligatorio) y el nodo Text Encode MOSS-Image Edit.
- Latencia: ~19 s por imagen en muestreo simple y ~26 s con reference guidance en RTX 5090.
- Ajustes de muestreo documentados: 50 pasos, CFG 3, sampler `euler`, scheduler `sgm_uniform`, denoise 1.0, fuerza LoRA 1.0, ~0,6 megapixeles (p. ej. 672x896, lados multiplos de 16).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moss-image-edit-charref-v2 | LoRA de referencia de personaje sobre MOSS-Image SFT | no disponible (297 MB) | no aplica | MIT | Hugging Face + GitHub |
| IP-Adapter (familia) | Adaptador de referencia de imagen para difusion | no disponible | no aplica | varía segun implementacion | ampliamente disponible |
| LoRAs de personaje para SDXL / Flux | Adaptadores de identidad | no disponible | no aplica | varía | ampliamente disponibles |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Version temprana: el personaje se mantiene reconocible solo en aproximadamente la mitad de los renders simples, segun el propio autor.
- Requiere el nodo personalizado de ComfyUI; sin el, la colocacion de la referencia no coincide con la del entrenamiento y el LoRA no funciona como fue probado.
- La referencia debe ser un unico personaje sobre fondo blanco liso y pose neutra con brazos bajos; poses con manos levantadas pueden filtrarse a la salida.
- Las referencias con pintura o sombreado no plano dan peores resultados que las de sombreado plano y limpio.
- El prompt no debe describir la apariencia del personaje (esa informacion viene de la imagen); mezclar ambas cosas degrada el resultado.
- Riesgo de alucinacion visual: detalles de vestuario o accesorios pueden cambiar entre escenas.
- No se han probado tarjetas graficas distintas de la RTX 5090 ni los ficheros cuantizados.
- Licencia MIT para el adaptador, pero el uso comercial depende tambien de las condiciones del modelo base MOSS-Image SFT y del text encoder Qwen3.5, que deben verificarse por separado.
- Idiomas soportados no documentados; los prompts de ejemplo estan en ingles con formato de tags.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pleiades7/moss-image-edit-charref-v2
- Repositorio GitHub (mirror del release v2): https://github.com/bag3labo/moss-image-edit-charref-v2
- Modelo base MOSS-Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo de difusion bf16 (Comfy-Org): https://huggingface.co/Comfy-Org/MOSS-Image/resolve/main/diffusion_models/moss_image_sft_bf16.safetensors
- Text encoder Qwen3.5 9B bf16: https://huggingface.co/Comfy-Org/MOSS-Image/resolve/main/text_encoders/qwen3.5_9b_bf16.safetensors
- VAE Flux2: https://huggingface.co/Comfy-Org/MOSS-Image/resolve/main/vae/flux2-vae.safetensors
- MOSS-Image SFT Turbo INT8 ConvRot: https://huggingface.co/toxicdog/MOSS-Image-SFT-Turbo-INT8-ConvRot
- Text encoder Qwen3.5 9B int8 ConvRot: https://huggingface.co/Comfy-Org/MOSS-Image/resolve/main/text_encoders/qwen3.5_9b_int8_convrot.safetensors
