# convertor/minimax-h3-image-gguf

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes desarrollado por MiniMaxAI, distribuido aquí en formato GGUF por el usuario `convertor`. A diferencia de un LLM convencional, el pipeline completo combina tres componentes: un modelo de difusión (el generador de imágenes propiamente dicho, en variantes pruned-nvfp4 o w4a8), un LLM de texto/visión que actúa como codificador de prompts y soporte de edición (Qwen3-VL de 32B o 4B con adaptador), y un VAE en fp16. El repositorio cuantizado ocupa 25,8 GB y declara 20.113.670.232 parámetros en los safetensors, un dato que corresponde al conjunto del pipeline y no a un único transformer denso.

La relevancia de esta publicación es práctica: traslada un modelo de difusión de gran tamaño a un formato GGUF ejecutable con el motor `ggk`, con soporte de offload a CPU y un modo de residencia en streaming pensado para GPUs con menos de 6 GB de VRAM. Esto abre la generación y edición de imágenes a hardware de consumo, algo poco habitual en pipelines multimodales de esta escala.

La model card es fundamentalmente una guía de invocación: documenta comandos para texto-a-imagen, edición de imagen con referencia, y el uso de upsamplers de prompt opcionales (Qwen3.5-9B y Qwen3-VL-4B). No incluye información sobre arquitectura interna, datos de entrenamiento, licencia ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline de difusion + LLM codificador Qwen3-VL + VAE) |
| Parametros totales | 20.113.670.232 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (nvfp4 pruned, q2_k_m para el LLM, q4_k_m para upsamplers, f16 para VAE y adaptador); tambien safetensors w4a8 e int8_convrot |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos) |
| Licencia | no disponible |
| Formato de pesos | GGUF y safetensors |
| Tamano del repositorio | 25,8 GB |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |
| Motor de inferencia | ggk |
| Pasos de muestreo documentados | 6 (con schedule de sigmas fijo) |
| CFG scale documentado | 1 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo de difusión. Lo que sí se deduce de la model card es la topología del pipeline de inferencia: un modelo de difusión (`minimax_h3_image_pruned-nvfp4.gguf` o `p-h3-image_w4a8.safetensors`) que genera o edita la imagen, un LLM (`qwen3vl_32b_minimax_h3-q2_k_m.gguf`, o bien `qwen3vl-4b-it-q4_k_m.gguf` con `qwen3vl_4b_adapter-f16.gguf`) que procesa el prompt textual y, en edición, la imagen de referencia, y un VAE (`minimax_h3_image_vae_fp16-f16.gguf`) que codifica y decodifica en el espacio latente. El sufijo `qwen3vl_32b_minimax_h3` sugiere que el codificador de texto es un Qwen3-VL-32B adaptado específicamente para este modelo.

El muestreo documentado es muy agresivo: 6 pasos con `--cfg-scale 1` y un schedule de sigmas explícito que decae de 1,0 a 0,0 en seis valores (1,0; 0,9675; 0,8875; 0,75; 0,5328; 0,2320; 0,0). Esto es coherente con modelos de difusión destilados o de flujo rápido, aunque la model card no lo confirma. Se menciona `--diffusion-fa` (atención flash para el bloque de difusión) y `--offload-to-cpu`. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts descriptivos.
- Edición de imágenes por instrucción en lenguaje natural, manteniendo el resto de la escena sin cambios (ejemplo documentado: añadir gafas de sol a una oveja).
- Edición condicionada por imagen de referencia mediante el flag `-r`, que requiere el componente de visión (`mmproj`) del LLM.
- Upsampling o enriquecimiento automático de prompts con modelos auxiliares: Qwen3.5-9B (q4_k_m) o Qwen3-VL-4B-IT (q4_k_m), este último con soporte de visión vía `mmproj`.
- Sustitución del LLM de 32B por el de 4B más un adaptador LoRA (`qwen3vl_4b_adapter-f16.gguf`), lo que reduce requisitos de memoria a costa de calidad presumiblemente inferior.
- Ejecución con residencia en streaming y offload a CPU, orientada a GPUs de gama baja (menos de 6 GB de VRAM según la model card).
- Soporte de dos formatos de pesos en el motor `ggk`: GGUF (nvfp4 pruned) y safetensors w4a8 / int8_convrot.

## Casos de uso

- Generación rápida de ilustraciones conceptuales: con 6 pasos de muestreo y CFG 1, el coste por imagen es bajo, lo que permite iterar sobre bocetos en un flujo de diseño sin esperas largas.
- Edición fotográfica asistida por instrucción: el modo `-r` permite pasar una imagen y pedir cambios localizados ("ponle gafas de sol a la oveja"), útil para retoque rápido sin máscaras manuales.
- Prototipado en hardware de consumo: el modo de streaming con menos de 6 GB de VRAM permite a desarrolladores sin GPU de datacenter probar el pipeline completo en local antes de escalar.
- Enriquecimiento automático de prompts: el upsampler de 4B o 9B convierte descripciones breves en prompts detallados, útil en herramientas donde el usuario final escribe instrucciones escuetas.
- Integración en pipelines de contenido editorial: combinado con el LLM de 4B y su adaptador, el consumo de memoria baja lo suficiente como para ejecutarse junto a otros servicios en una misma máquina.
- Evaluación comparativa de cuantizaciones: al ofrecer variantes nvfp4 y w4a8 del mismo modelo de difusión, sirve para medir la degradación de calidad frente a velocidad en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio pesa 25,8 GB, pero la ejecución reparte carga entre difusión, LLM y VAE; el modo `--offload-to-cpu` reduce el pico de VRAM a costa de latencia.
- El LLM de 32B en q2_k_m es, con toda probabilidad, el componente más exigente en memoria; la alternativa de 4B con adaptador está pensada para recortar ese requisito.
- GPU recomendadas: no disponibles en la información proporcionada. La model card menciona explícitamente que el modo de residencia en streaming funciona en GPUs de gama baja con menos de 6 GB de VRAM.
- Cabe en GPU de consumo: sí, según la model card, mediante streaming y offload, aunque sin cifras de throughput.
- Opciones de despliegue: motor `ggk` (el único documentado), con soporte de GGUF y safetensors w4a8/int8_convrot. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Image (este repo, GGUF) | 20.113.670.232 (pipeline) | no disponible | GGUF, safetensors | no disponible | Difusion + LLM Qwen3-VL + VAE, motor ggk |
| MiniMaxAI/MiniMax-H3-Image (base) | no disponible | no disponible | safetensors | no disponible | Modelo original sin cuantizar |
| Alternativas de difusion texto-a-imagen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No hay información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; no se puede asumir uso comercial sin consultar la licencia del modelo base MiniMaxAI/MiniMax-H3-Image.
- No hay información sobre sesgos del modelo de difusión ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir detalles incoherentes, texto mal formado en carteles y anatomías incorrectas, especialmente con solo 6 pasos de muestreo.
- El pipeline requiere coordinar tres o cuatro archivos (difusión, LLM, VAE y, opcionalmente, adaptador y mmproj); un desajuste de versiones entre ellos rompe la inferencia.
- El modo de edición depende del componente de visión del LLM; sin `mmproj` la edición por referencia no funciona correctamente.
- El uso del LLM de 4B con adaptador en lugar del de 32B es una concesión de memoria cuya pérdida de calidad no está cuantificada en la model card.
- Los ejemplos de prompts están en inglés; no hay evidencia de calidad multilingüe.
- El motor `ggk` es específico y poco extendido; no hay garantía de soporte en herramientas estándar del ecosistema (ComfyUI, diffusers, etc.) según la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/convertor/minimax-h3-image-gguf
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
