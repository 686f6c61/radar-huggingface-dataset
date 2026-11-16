# bravikron/wren-ashby-zimage-lora

## Resumen

Wren Ashby (Z-Image LoRA) es un adaptador LoRA de tipo text-to-image desarrollado por Bravikron Labs que introduce un personaje original y completamente sintetico en el modelo base Z-Image de Tongyi-MAI (Alibaba). El adaptador permite generar imagenes fotorealistas de una mujer de 23 anos, cantante, con cabello ondulado de color cobre-rojizo, ojos verdes y pecas claras, manteniendo coherencia facial entre generaciones mediante la palabra de activacion `Wren Ashby`.

El modelo resuelve un problema concreto: la generacion de un personaje consistente y reutilizable en multiples escenas y estilos fotograficos sin depender de imagenes de personas reales. La version v1.1 se reentreno sobre Z-Image Base usando el nombre completo como trigger, sustituyendo el trigger anterior `wr3nn` que provocaba que el modelo base imprimiera texto en prendas como gorras o sudaderas.

El repositorio ocupa 0,2 GB e incluye un unico archivo de pesos en formato safetensors (`wren_z_v1_1.safetensors`). Se distribuye bajo la licencia propietaria `bravikron-free-lora-license`, que permite uso comercial de las imagenes generadas pero prohibe la reventa del archivo LoRA. El modelo base Z-Image se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Z-Image |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF documentadas) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | bravikron-free-lora-license (propietaria, con permisos de uso comercial de imagenes) |
| Formato de pesos | safetensors (`wren_z_v1_1.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA disenado para el modelo de difusion Z-Image de Tongyi-MAI, orientado a generacion de imagen a partir de texto. La model card no especifica el rango del adaptador, el numero de pasos de entrenamiento, el tamano del dataset de imagenes utilizado ni la composicion exacta de los datos de entrenamiento. Tampoco se documenta si se emplearon tecnicas de regularizacion o captions automaticos.

La innovacion principal de la version v1.1 es el cambio de trigger: se paso de `wr3nn` a `Wren Ashby` para evitar que el modelo base imprimiera texto en prendas (gorras, sudaderas, parches). Segun el autor, en las pruebas de v1.1 no aparecio texto impreso en la ropa. El personaje es completamente sintetico y su rostro fue disenado desde cero, sin recurrir a imagenes de personas reales.

## Capacidades

- Generacion de imagenes fotorealistas de un personaje femenino consistente (Wren Ashby) en multiples escenas, localizaciones y atuendos.
- Coherencia facial entre generaciones mediante la palabra de activacion `Wren Ashby`.
- Control de atributos fisicos: cabello ondulado cobre-rojizo, ojos verdes, pecas claras, textura de piel natural.
- Estilos fotograficos variados: retrato close-up, selfie con estetica de camara de movil, escenas de exterior (noche en Tokio, cafe de Paris en otono, montana nevada), fondo de estudio plano.
- Compatibilidad con Z-Image Base (28 pasos, CFG 4, shift 3, fuerza LoRA 1.0) y con Z-Image Turbo (8 pasos, CFG 1, fuerza LoRA 1.8-2.0).
- Soporte de prompt negativo recomendado: `cartoon, painting, 3d render, plastic skin, text, logo`.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Creacion de personajes virtuales consistentes para narrativa visual: el LoRA permite generar a Wren en multiples escenas manteniendo el mismo rostro, util para comics, storyboards o novelas graficas digitales.
- Generacion de contenido para redes sociales de un personaje sintetico: selfies, retratos y escenas cotidianas con estetica de camara de movil, adecuadas para cuentas de personaje ficticio.
- Prototipado de campanas publicitarias con modelo sintetico: permite explorar conceptos visuales con un personaje coherente sin depender de actores ni modelos reales, evitando cuestiones de derechos de imagen.
- Ilustracion de ficcion y fan art original: escenas en localizaciones concretas (Tokio nocturno, Paris otonal, montana nevada) con un personaje recurrente.
- Pruebas de concepto en pipelines de generacion de imagen: sirve como ejemplo de LoRA de personaje para evaluar flujos de trabajo con Z-Image Base y Turbo.
- Generacion de avatares y retratos de perfil: retratos close-up con iluminacion natural de ventana y fondo neutro, utiles para identidades digitales ficticias.
- Demostraciones tecnicas de photorealismo: el enfasis en textura de piel natural, luz real y momentos candidos lo hace util para comparar calidad fotorrealista frente a otros LoRAs de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Al ser un adaptador LoRA de 0,2 GB, el requisito dominante es el del modelo base Z-Image, cuyas necesidades de VRAM no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor documenta uso con Z-Image Base y Z-Image Turbo; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables a este adaptador de difusion).
- Latencia y throughput: no disponible. El autor recomienda 28 pasos con CFG 4 en Z-Image Base y 8 pasos con CFG 1 en Z-Image Turbo, lo que sugiere que la variante Turbo reduce el coste computacional de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wren Ashby (Z-Image LoRA) | LoRA de personaje sobre Z-Image | no disponible | no aplica | sin benchmarks publicados | bravikron-free-lora-license | Hugging Face y Civitai |
| Alternativas de LoRA de personaje sobre Z-Image | LoRA de personaje | no disponible | no aplica | no disponible | variable segun autor | no disponible en la informacion proporcionada |
| LoRAs de personaje sobre otros modelos de difusion (p. ej. Flux, SDXL) | LoRA de personaje | no disponible | no aplica | no disponible | variable | no disponible en la informacion proporcionada |

No se dispone de datos comparativos verificables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El personaje es completamente sintetico y el autor prohibe presentarlo como una persona real o como creacion propia de terceros.
- Uso exclusivamente safe-for-work segun la model card.
- En Z-Image Turbo, el trigger por si solo puede generar un hombre; es obligatorio anadir "a woman" tras el trigger y subir la fuerza del LoRA a 1.8-2.0.
- Con gorras y beanies, si no se mantiene "copper-red hair, green eyes" en el prompt, el cabello puede volverse marron.
- La licencia `bravikron-free-lora-license` permite uso comercial de las imagenes generadas pero prohibe revender el archivo LoRA; ademas se aplica la licencia del modelo base Z-Image (Apache 2.0).
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma; los prompts de ejemplo estan en ingles y no se confirma soporte de otros idiomas.
- No hay informacion sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos de representacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/bravikron/wren-ashby-zimage-lora
- Modelo base Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Pagina de Civitai: https://civitai.com/models/3038306
- Modelos gratuitos de Bravikron: https://bravikron.com/models.html
- Entrenamiento de LoRA personalizado: https://bravikron.com/labs.html
