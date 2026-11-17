# Darrige/sd15-multistyle-lora

## Resumen

SD 1.5 Multi-Style LoRA Pack es una coleccion de tres adaptadores LoRA de bajo rango (rank 4) para el modelo de difusion Stable Diffusion 1.5, orientados a la transferencia de estilos artisticos. Lo desarrolla Darrige (Mohammed Darrige) y se publica bajo licencia MIT. Cada adaptador actua exclusivamente sobre el UNet del modelo base y pesa aproximadamente 3,08 MiB, lo que lo convierte en un complemento muy ligero que no requiere reentrenar ni redistribuir los pesos completos de SD 1.5.

El paquete cubre tres estilos diferenciados: cubismo, postimpresionismo y ukiyo-e, cada uno en su propio subdirectorio y con una frase de activacion especifica en el prompt. El modelo base es runwayml/stable-diffusion-v1-5, por lo que hereda su arquitectura UNet con atencion cruzada, su VAE y su codificador de texto CLIP, asi como la resolucion nativa de 512x512 pixeles.

Su relevancia practica reside en la economia de recursos: al tratarse de adaptadores de rango 4, se pueden cargar y fusionar en un pipeline de diffusers con un coste de VRAM y almacenamiento minimo, lo que facilita experimentar con estilos artisticos sobre una base ya ampliamente desplegada. No obstante, esta limitado al ecosistema SD 1.5 y no es compatible con SDXL, SD3 ni Flux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 4) sobre UNet de Stable Diffusion 1.5 (diffusion model) |
| Parametros totales | no disponible (adaptadores de ~3,08 MiB cada uno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos LoRA; el modelo base admite fp16 y cuantizaciones habituales de SD 1.5) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el codificador CLIP de SD 1.5 esta entrenado principalmente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos LoRA para diffusers) |

## Arquitectura y entrenamiento

Cada adaptador es una LoRA de rango 4 aplicada al UNet de Stable Diffusion 1.5. La LoRA introduce matrices de baja dimension que modifican las proyecciones del UNet, de modo que el modelo base conserva sus pesos originales y el adaptador solo aporta el sesgo estilistico. El tamano de cada adaptador (3,08 MiB) es coherente con un rango bajo y una cobertura limitada de capas, lo que explica su ligereza y su rapida carga en memoria.

La informacion disponible no detalla el numero de pasos de entrenamiento, el dataset utilizado, la composicion de las imagenes de entrenamiento ni si se aplicaron tecnicas como regularizacion o aumentacion de datos. Tampoco se especifica el optimizador, la tasa de aprendizaje ni el numero de imagenes por estilo. El autor indica que los adaptadores se entrenaron sobre SD 1.5 para transferencia de estilo artistico y que alimentan su sitio darrige.tech, pero no publica detalles del procedimiento de entrenamiento.

## Capacidades

- Generacion de imagenes text-to-image con estilos artisticos especificos: cubismo, postimpresionismo y ukiyo-e.
- Transferencia de estilo sobre imagenes existentes mediante el pipeline img2img (el autor recomienda strength entre 0,42 y 0,62).
- Activacion mediante frases de trigger incluidas en el prompt (por ejemplo, "in ukiyo-e style, woodblock print, flat colors").
- Ajuste de la intensidad del estilo mediante el parametro lora_scale (rango recomendado de 0,95 a 1,30).
- Compatibilidad con negative prompts para suprimir resultados fotorealistas o artefactos.
- No dispone de tool calling, capacidad de agente, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un modelo de generacion de imagenes.
- No soporta vision, audio ni comprension de imagenes de entrada mas alla del propio pipeline img2img.

## Casos de uso

- Ilustracion editorial con estetica historica: cargar el adaptador de ukiyo-e y generar estampas de estilo xilografico para portadas o articulos, aprovechando la ligereza del adaptador para cambiar de estilo sin recargar el modelo base.
- Prototipado rapido de direccion de arte: alternar entre los tres adaptadores en un mismo pipeline para explorar variantes cubistas, postimpresionistas y ukiyo-e de un mismo concepto antes de decidir una linea visual.
- Transferencia de estilo sobre bocetos propios: usar img2img con strength en torno a 0,5 para convertir un dibujo o una foto en una version estilizada, manteniendo la composicion original.
- Generacion de assets para proyectos creativos personales: producir fondos o ilustraciones con estilos de dominio publico (ukiyo-e, postimpresionismo) para webs, juegos indie o publicaciones, con la ventaja de la licencia MIT.
- Educacion y divulgacion artistica: generar ejemplos visuales que ilustren las caracteristicas del cubismo o del ukiyo-e en materiales didacticos, ajustando lora_scale para exagerar o suavizar el estilo.
- Integracion en pipelines de difusion existentes: al ser adaptadores de diffusers, se pueden cargar con load_lora_weights y fuse_lora dentro de un servicio de generacion de imagenes ya basado en SD 1.5, sin cambiar la infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la del modelo base SD 1.5 en fp16, aproximadamente 4-6 GB; los adaptadores LoRA anaden un coste marginal (unos pocos MiB por adaptador).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. En GPUs de gama alta el cuello de botella es el modelo base, no la LoRA.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070). En GPUs con menos memoria puede requerir atencion eficiente o cuantizacion del modelo base.
- Opciones de despliegue: diffusers (load_lora_weights y fuse_lora), ademas de los runners habituales de SD 1.5 que acepten LoRA en formato diffusers (por ejemplo, ComfyUI o Automatic1111 con conversion). No se documenta soporte nativo en llama.cpp ni Ollama, que no aplican a modelos de difusion.
- Latencia y throughput: no disponible. El autor recomienda 30 pasos en text-to-image y 50 pasos con EulerAncestralDiscreteScheduler en img2img, con guidance_scale de 7,5-8,0.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SD 1.5 Multi-Style LoRA (Darrige) | LoRA de estilo (3 adaptadores) | SD 1.5 | ~3,08 MiB por adaptador | no aplica | MIT | Hugging Face |
| LoRA de estilo generica para SD 1.5 | LoRA de estilo | SD 1.5 | variable | no aplica | variable | Hugging Face / Civitai |
| SDXL + LoRA de estilo | LoRA de estilo | SDXL | mayor (modelo base mas grande) | no aplica | variable | Hugging Face |
| Flux + LoRA de estilo | LoRA de estilo | Flux | mayor (modelo base mas grande) | no aplica | variable | Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este paquete ni datos objetivos que permitan contrastarlo con alternativas. La diferencia principal frente a LoRAs genericas es la especializacion en tres estilos concretos y la licencia MIT, mas permisiva que la de muchos adaptadores comunitarios.

## Limitaciones y advertencias

- Solo compatible con Stable Diffusion 1.5: no funciona con SDXL, SD3 ni Flux.
- Son unicamente adaptadores: requieren descargar runwayml/stable-diffusion-v1-5 en tiempo de ejecucion.
- No incluyen filtro de seguridad integrado; el autor recomienda activar un safety checker en despliegues de produccion.
- Riesgo de alucinacion visual y artefactos propios de SD 1.5, especialmente en prompts complejos o con muchos sujetos.
- El codificador de texto CLIP de SD 1.5 esta entrenado principalmente en ingles, por lo que los prompts en castellano pueden rendir peor.
- Resolucion nativa de 512x512; resoluciones mayores pueden degradar la composicion.
- No hay informacion publicada sobre sesgos del dataset de entrenamiento ni sobre el procedimiento exacto de entrenamiento.
- La licencia MIT permite uso comercial, pero el modelo base SD 1.5 tiene su propia licencia (CreativeML Open RAIL-M) que debe revisarse por separado.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darrige/sd15-multistyle-lora
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- VAE recomendado: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Portfolio del autor: https://darrige.tech
- Codigo fuente: https://github.com/Mohammed-Darrige/neural-style-transfer
- Perfil del autor: https://www.linkedin.com/in/mohammed-darrige/
