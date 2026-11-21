# dntletmesolome/futoji_pop

## Resumen

futoji_pop es un LoRA de estilo para modelos de difusion SDXL e Illustrious, desarrollado por Hoshigumo (dntletmesolome) y publicado en Hugging Face. Su funcion es transferir a las imagenes generadas una estetica muy concreta: contornos negros gruesos, colores planos, sombreado minimo, paleta viva y limitada, proporciones cercanas al chibi y una sensacion de poster callejero o pop-art. No es un modelo base, sino un adaptador que se aplica sobre checkpoints SDXL compatibles, principalmente Nova Anime XL IL v12.0, sobre el que fue entrenado.

Tecnicamente se trata de un LoRA de UNet con rango 32 y alpha 16, entrenado con kohya sd-scripts sobre 28 imagenes originales durante 840 pasos. El repositorio ocupa aproximadamente 0,3 GB y contiene un unico archivo safetensors correspondiente a la epoca 6, la final. El modelo esta etiquetado para text-to-image y declara soporte de ingles y japones en los prompts, algo habitual en los checkpoints de anime sobre los que se aplica.

Su relevancia es acotada pero clara: cubre una demanda de estilo muy especifica dentro del ecosistema de anime SDXL, donde los LoRA de estilo permiten fijar una identidad visual consistente sin reentrenar el modelo base. La licencia es FAIPL-1.0-SD, derivada del modelo base, y el autor restringe explicitamente el uso comercial del propio LoRA en esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL (adaptador de difusion, no modelo completo) |
| Parametros totales | no disponible (rango 32, alpha 16, solo UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; resolucion recomendada 1024x1280) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors, precisión no declarada) |
| Idiomas soportados | en, ja (prompts) |
| Licencia | FAIPL-1.0-SD (Fair AI Public License 1.0-SD) |
| Formato de pesos | safetensors (`futoji_pop.safetensors`) |
| Modelo base | John6666/nova-anime-xl-il-v120-sdxl |
| Tamano del repositorio | 0,3 GB |
| Trigger word | `futoji_pop` |
| Peso recomendado | 0,7 (rango 0,5-0,8) |
| SHA256 | 659e83f1f32d8e6b17a4587451c032c5c958c8767881bb1c97210e553a73c22b |

## Arquitectura y entrenamiento

El adaptador es un LoRA convencional aplicado exclusivamente a la UNet del modelo base SDXL, sin tocar el text encoder. Se entreno con kohya sd-scripts con rango 32 y alpha 16, tasa de aprendizaje 1e-4 y 840 pasos totales, resultado de repetir 10 veces el dataset durante 6 epocas. El dataset de entrenamiento consta de 28 imagenes originales, un volumen muy reducido que explica tanto la rapidez del entrenamiento como la sensibilidad del LoRA a pesos altos y a variaciones de prompt.

El modelo base declarado es Nova Anime XL IL v12.0, un checkpoint SDXL de estilo anime/Illustrious. El autor indica compatibilidad probada con WAI-Illustrious-SDXL v15.0 y Plant Milk Model Suite - Vanilla, y senala incompatibilidad con NoobAI-XL eps 1.1 y NTR MIX v4.0. No se documentan tecnicas adicionales como decodificacion especulativa, RLHF/DPO ni atencion lineal, ya que no aplican a un adaptador de difusion de este tipo.

## Capacidades

- Generacion de imagenes text-to-image con estetica pop-art: contornos negros gruesos, colores planos, sombreado minimo y paleta viva limitada.
- Proporciones con tendencia chibi y composicion tipo poster callejero.
- Aplicacion mediante trigger word `futoji_pop` al inicio del prompt.
- Funciona sobre checkpoints SDXL/Illustrious compatibles, lo que permite combinarlo con otros LoRA siempre que se ajuste el peso.
- Soporte de prompts en ingles y japones, heredado del modelo base.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada; es exclusivamente generacion de imagen.
- Estilo de cejas gruesas no integrado por defecto: se activa solo si se pide en el prompt.

## Casos de uso

- Ilustracion de estilo pop para portadas y carteles: con `futoji_pop` al inicio del prompt y peso 0,7 se obtienen composiciones de colores planos y contornos marcados adecuadas para posters, flyers o portadas de fanzine, gracias a la paleta viva y al look de serigrafia.
- Creacion de avatares y personajes chibi: las proporciones inclinadas a chibi del LoRA permiten generar iconos de perfil y mascotas de marca consistentes, fijando el estilo con el trigger y variando solo la descripcion del personaje.
- Contenido para redes sociales y merchandising: al producir imagenes de contorno grueso y color plano, el resultado se lee bien a tamano pequeno y en impresion textil o pegatinas, lo que reduce el postprocesado.
- Prototipado visual de direccion de arte: un estudio puede generar rapidamente variaciones de una misma escena en esta estetica para presentar opciones al cliente antes de producir la ilustracion final.
- Ilustracion editorial y de articulos: para piezas que requieren un lenguaje grafico llamativo y sintetico, el LoRA genera imagenes con fondos simples y vividos (por ejemplo, fondo naranja) que funcionan como cabeceras de seccion.
- Experimentacion e investigacion de estilos: al ser un LoRA pequeno (0,3 GB) entrenado sobre 28 imagenes, sirve como caso de estudio de como un dataset minimo condiciona el estilo y de como el peso del adaptador afecta a la fidelidad y a los artefactos.
- Combinacion con otros adaptadores en pipelines de SDXL: puede encadenarse con LoRA de personaje o de composicion, ajustando pesos para mantener la legibilidad del contorno sin saturar la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un LoRA de estilo, no existen metricas estandar tipo MMLU, HumanEval o GSM8K aplicables; la evaluacion es cualitativa y depende del modelo base y del peso elegido.

## Requisitos de hardware

- VRAM estimada para inferencia: la del checkpoint SDXL base, tipicamente 8-12 GB en fp16 a 1024x1280; el LoRA anade una sobrecarga minima (repo de 0,3 GB).
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para generacion rapida a 1024x1280; RTX 3060 de 12 GB o superior para uso en consumer.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando fp16 y atencion optimizada; con 6 GB puede requerir cuantizacion del checkpoint base o resoluciones menores.
- Opciones de despliegue: ComfyUI, Automatic1111/Forge, Diffusers (con `load_lora_weights`), InvokeAI y otros frontends compatibles con SDXL y safetensors.
- Latencia y throughput: no disponibles; dependen del checkpoint base, la GPU y los parametros (28 pasos, CFG 5, Euler a segun recomendacion del autor).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| futoji_pop | LoRA de estilo pop-art | Nova Anime XL IL v12.0 | 1024x1280 recomendado | FAIPL-1.0-SD | Hugging Face, 0 descargas, 1 like |
| WAI-Illustrious-SDXL v15.0 | Checkpoint SDXL anime | SDXL/Illustrious | 1024x1024 y superiores | no disponible en la informacion | Compatible declarado por el autor |
| Plant Milk Model Suite - Vanilla | Checkpoint SDXL | SDXL | no disponible | no disponible en la informacion | Compatible declarado por el autor |
| NoobAI-XL eps 1.1 | Checkpoint SDXL anime | SDXL | no disponible | no disponible en la informacion | Incompatible declarado por el autor |

No se dispone de datos de rendimiento cuantitativo para comparar; la comparativa se limita a compatibilidad y tipo de artefacto.

## Limitaciones y advertencias

- Dataset muy reducido (28 imagenes): el estilo puede sobreajustarse y reproducir motivos o composiciones del entrenamiento.
- A peso 1.0 los colores tienden a volverse neon y la ropa puede fundirse en patrones psicodelicos; el autor recomienda empezar en 0,7.
- Pueden aparecer decoraciones similares a texto en carteles o senales.
- Aunque se pida "solid color", puede surgir un estampado en la ropa; se recomienda cambiar la semilla.
- Incompatibilidad declarada con NoobAI-XL eps 1.1 y NTR MIX v4.0.
- Las cejas gruesas no estan integradas: deben pedirse explicitamente.
- Licencia FAIPL-1.0-SD con obligacion de incluir el texto de la licencia y las atribuciones del modelo base al redistribuir.
- El autor no permite el uso comercial del propio LoRA en esta release, aunque la licencia del modelo base no reclama los outputs.
- Riesgo de sesgos heredados del checkpoint base y del dataset de anime; no se documentan mitigaciones.
- Soporte linguistico limitado a ingles y japones en los prompts.

## Enlaces

- Hugging Face: https://huggingface.co/dntletmesolome/futoji_pop
- Modelo base: https://huggingface.co/John6666/nova-anime-xl-il-v120-sdxl
- Licencia FAIPL-1.0-SD: https://freedevproject.org/faipl-1.0-sd/
- Perfil del autor: https://huggingface.co/dntletmesolome
