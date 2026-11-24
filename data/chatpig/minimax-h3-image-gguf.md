# chatpig/minimax-h3-image-gguf

## Resumen

`chatpig/minimax-h3-image-gguf` es una distribucion en formato GGUF del modelo de generacion y edicion de imagenes MiniMax-H3-Image, publicado originalmente por MiniMaxAI. El repositorio lo mantiene el usuario chatpig y su funcion es empaquetar los pesos del modelo base en cuantizaciones compatibles con el motor `ggk`, un runtime de difusion que permite ejecutar el pipeline completo (modelo de difusion, codificador de texto, VAE y upsampler de prompt) en hardware de consumo.

El modelo base MiniMax-H3-Image es un modelo de difusion texto-a-imagen con capacidad de edicion de imagenes por instruccion. El repositorio incluye el modelo de difusion podado y cuantizado (`minimax_h3_image_pruned-nvfp4.gguf`), el VAE en FP16 (`minimax_h3_image_vae_fp16-f16.gguf`) y depende de un modelo de lenguaje externo como codificador de texto: por defecto Qwen3-VL de 32B en cuantizacion Q2_K_M, aunque la model card documenta alternativas de 4B y 9B con adaptadores y `mmproj` para vision.

La relevancia practica del repositorio es que reduce el coste de inferencia de un pipeline de imagen de gran tamano hasta el punto de que, segun el autor, puede ejecutarse con menos de 6 GB de VRAM mediante streaming de residencia automatica. El recuento de parametros reportado en safetensors es de 20.113.670.232, correspondiente al conjunto del repositorio, no a un unico transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (texto-a-imagen e imagen-a-imagen) con codificador de texto LLM externo y VAE |
| Parametros totales | 20.113.670.232 (reportado en safetensors, agregado del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (modelo de difusion podado), Q2_K_M (LLM de 32B), Q4_K_M (LLM de 4B y 9B), FP16/F16 (VAE, mmproj y adaptador), W4A8 (variante `p-h3-image_w4a8.safetensors`), int8_convrot (soportado por ggk) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (principal), safetensors (variante W4A8) |

## Arquitectura y entrenamiento

El repositorio no contiene un transformer autorregresivo, sino los artefactos de un pipeline de difusion. El componente central es `minimax_h3_image_pruned-nvfp4.gguf`, un modelo de difusion podado y cuantizado a NVFP4 que genera la imagen a partir de latentes. Junto a el se distribuye `minimax_h3_image_vae_fp16-f16.gguf`, el autoencoder variacional que decodifica los latentes a pixeles en precision FP16.

El condicionamiento textual no lo realiza el propio modelo de difusion, sino un LLM externo que actua como codificador: la configuracion por defecto usa `qwen3vl_32b_minimax_h3-q2_k_m.gguf`, un Qwen3-VL de 32B cuantizado a Q2_K_M. La model card documenta dos vias alternativas: sustituir el 32B por un Qwen3-VL de 4B con un adaptador especifico (`qwen3vl_4b_adapter-f16.gguf`), o anadir un upsampler de prompt independiente de 9B (`qwen3.5-9b-q4_k_m.gguf`) o de 4B (`qwen3vl-4b-it-q4_k_m.gguf`), con soporte de vision mediante `mmproj` en FP16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

La innovacion tecnica destacable es el motor `ggk`: soporta atencion con Flash Attention para difusion (`--diffusion-fa`), offload a CPU (`--offload-to-cpu`), un esquema de sigmas de muestreo predefinido para 6 pasos y streaming de residencia automatica para maquinas con poca VRAM. El muestreo documentado usa `--steps 6 --cfg-scale 1`, es decir, solo 6 pasos de difusion sin classifier-free guidance, lo que reduce drasticamente el coste frente a los 20-50 pasos habituales.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con prompts descriptivos.
- Edicion de imagenes por instruccion en lenguaje natural, preservando el resto de la escena (por ejemplo, anadir gafas de sol a un sujeto sin modificar el entorno).
- Condicionamiento multimodal: el codificador Qwen3-VL permite procesar la imagen de entrada junto con la instruccion de edicion.
- Mejora o expansion de prompt (prompt upsampling) mediante un LLM auxiliar de 4B o 9B, con variante con vision.
- Sustitucion del codificador de 32B por uno de 4B con adaptador, reduciendo requisitos de memoria.
- Ejecucion con streaming de residencia automatica en GPUs con menos de 6 GB de VRAM.
- Soporte de formatos int8_convrot y W4A8 en el motor ggk.
- No se documenta soporte de tool calling, agentes, audio ni modo thinking; son capacidades no aplicables a un modelo de difusion.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: con 6 pasos y cfg-scale 1, el pipeline produce imagenes en una sola pasada rapida, adecuado para iterar sobre conceptos visuales antes de encargar arte final.
- Edicion de imagenes en flujo de trabajo fotografico: la capacidad de imagen-a-imagen con instruccion permite retoques localizados (anadir o quitar objetos, cambiar accesorios) sin herramientas de mascaras manuales.
- Despliegue en estaciones de trabajo con GPU de gama baja: el streaming de residencia automatica y el offload a CPU permiten ejecutar el pipeline en equipos con menos de 6 GB de VRAM, ampliando el acceso frente a los modelos de difusion que exigen 24 GB o mas.
- Automatizacion de variantes creativas para marketing: el upsampler de prompt de 4B o 9B reescribe una idea breve en un prompt detallado, lo que permite generar lotes de imagenes coherentes a partir de una sola linea de entrada.
- Integracion en pipelines de CI o scripts por lotes: al ser un binario CLI (`ggk`) con argumentos deterministas (rutas de modelo, sigmas, pasos), se puede orquestar desde scripts para generar conjuntos de imagenes de prueba en cada build.
- Investigacion sobre cuantizacion de modelos de difusion: la convivencia de NVFP4, W4A8, int8_convrot y Q2_K_M en un mismo repositorio permite comparar calidad y consumo de memoria entre esquemas sobre el mismo modelo base.
- Edicion asistida por vision: con `--prompt-upsampler-vision` y `mmproj`, el sistema puede interpretar la imagen de entrada para reformular la instruccion de edicion antes de aplicarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. El autor afirma que el streaming de residencia automatica funciona en GPUs con menos de 6 GB de VRAM; el repo completo ocupa 25,8 GB, por lo que la VRAM necesaria depende de que componentes se mantengan residentes.
- Componentes y su peso: modelo de difusion podado en NVFP4, VAE en FP16, LLM codificador de 32B en Q2_K_M (o alternativas de 4B/9B en Q4_K_M) y, opcionalmente, adaptador y `mmproj` en FP16.
- GPU recomendadas: no disponible. La model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: si, segun el autor, incluso en GPUs con menos de 6 GB de VRAM gracias al streaming de residencia automatica y al flag `--offload-to-cpu`.
- Opciones de despliegue: motor `ggk` (CLI) con soporte de `--diffusion-fa`, `--offload-to-cpu`, `--prompt-upsampler` y `--llm-adapter`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Solo se documenta el regimen de muestreo (6 pasos, cfg-scale 1, sigmas predefinidas).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generacion y edicion de imagenes que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La licencia no esta indicada en el repositorio, por lo que no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base MiniMaxAI/MiniMax-H3-Image antes de desplegarlo en produccion.
- Los idiomas soportados no estan documentados; el comportamiento multilingue del codificador de texto no se puede garantizar.
- El pipeline depende de varios artefactos externos (LLM codificador, VAE, adaptador, `mmproj`, upsampler) cuyas versiones deben coincidir; una combinacion incorrecta puede degradar la calidad o fallar.
- La configuracion por defecto usa un LLM de 32B cuantizado a Q2_K_M, una cuantizacion agresiva que puede afectar a la fidelidad del condicionamiento textual; la alternativa de 4B con adaptador reduce memoria pero tambien capacidad.
- El muestreo con 6 pasos y cfg-scale 1 es un regimen de baja fidelidad; puede producir artefactos o menor adherencia al prompt en escenas complejas.
- Riesgo de sesgos y alucinacion visual: no hay informacion sobre la composicion del dataset de entrenamiento del modelo base, por lo que no se pueden evaluar sesgos demograficos o estilisticos.
- El repositorio no declara pipeline en Hugging Face ni resultados de evaluacion, lo que limita la validacion objetiva de calidad.
- La fecha de creacion del repositorio (2026-11-10) y el reducido numero de descargas (369) y likes (2) indican una adopcion temprana y poca validacion por parte de la comunidad.
- Los resultados de busqueda web disponibles corresponden a servicios de videochat ajenos al modelo y no aportan informacion tecnica relevante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chatpig/minimax-h3-image-gguf
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
