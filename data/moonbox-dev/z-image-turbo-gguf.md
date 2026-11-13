# moonbox-dev/Z-Image-Turbo-GGUF

## Resumen

Z-Image-Turbo GGUF es la distribucion en formato GGUF de Z-Image-Turbo, un modelo de generacion de imagenes texto-a-imagen de 6.150 millones de parametros desarrollado originalmente por Tongyi-MAI (Alibaba). Esta version concreta la publica moonbox-dev y contiene unicamente los pesos del diffusion transformer en un unico fichero por precision, pensada para inferencia en dispositivo mediante runtimes ligeros como stable-diffusion.cpp o ComfyUI con el nodo ComfyUI-GGUF. El modelo base emplea una arquitectura de diffusion transformer de flujo unico (single-stream DiT) y esta destilado para funcionar con solo 8 pasos de muestreo y CFG 1,0.

La relevancia practica de esta publicacion esta en la cuantizacion: frente a los 12,31 GB de los pesos BF16/F16, las variantes Q8_0 (7,22 GB), Q6_K (5,91 GB), Q5_K_M (5,52 GB) y Q4_K_M (4,98 GB) permiten ejecutar el modelo en GPUs de consumo con VRAM limitada, manteniendo un error RMS relativo frente a BF16 del 0,50 % en Q8_0 y del 4,7 % en Q4_K_M. El modelo base declara inferencia sub-segundo en H800 y encaje en dispositivos de consumo con 16 GB de VRAM.

Es importante subrayar que estos ficheros contienen solo el diffusion transformer: el text encoder (Qwen3-4B, `qwen_3_4b.safetensors`) y el VAE (`ae.safetensors`, el VAE de FLUX.1) deben obtenerse por separado del repositorio Comfy-Org/z_image_turbo. La licencia es Apache-2.0 y se hereda del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer de flujo unico (single-stream DiT), destilado |
| Parametros totales | 6.154.908.736 (aproximadamente 6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible en la ficha; el modelo base declara renderizado de texto bilingue ingles-chino en las imagenes |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un fichero por precision); el text encoder y el VAE son safetensors separados |

## Arquitectura y entrenamiento

El modelo base Z-Image-Turbo es un diffusion transformer de flujo unico de 6B parametros, presentado en el informe tecnico arXiv:2511.22699 junto con otros trabajos del proyecto (arXiv:2511.22677 y arXiv:2511.13649). La variante Turbo es una version destilada del modelo fundacional Z-Image, disenada para reducir el numero de evaluaciones de funcion (NFE) a 8 pasos con CFG 1,0, lo que habilita latencias sub-segundo en GPUs de clase empresarial H800. El pipeline completo se compone de tres piezas: el DiT (estos ficheros GGUF), un text encoder Qwen3-4B y un VAE correspondiente al de FLUX.1.

Esta publicacion de moonbox-dev no reentrena el modelo: parte de los pesos BF16 de Z-Image-Turbo en la revision `f332072aa7`, los convierte a GGUF F16/BF16 y los cuantiza con `llama-quantize` de llama.cpp. Cada fichero se valido contra el original antes de subirse, con verificacion sha256 y calculo del error RMS relativo de los pesos dequantizados promediado sobre todos los parametros. No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens de imagen ni si se aplicaron tecnicas de RLHF o preferencias en la informacion proporcionada.

## Capacidades

- Generacion de imagenes texto-a-imagen fotorrealistas a partir de descripciones en lenguaje natural.
- Renderizado de texto bilingue dentro de la imagen (ingles y chino), segun declara el modelo base.
- Elevada adherencia a instrucciones complejas (instruction following) en los prompts.
- Inferencia en 8 pasos de muestreo con CFG 1,0 gracias a la destilacion, lo que reduce coste computacional.
- Ejecucion en dispositivo mediante stable-diffusion.cpp o ComfyUI con ComfyUI-GGUF (carga como `lumina2`).
- Soporte de multiples precisiones para ajustar el equilibrio fidelidad/memoria.
- No dispone de tool calling, function calling, modo agente ni razonamiento multi-paso: es un modelo puramente generativo de imagen.
- Capacidades de audio, vision de entrada o thinking mode: no disponibles.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con GPU de consumo: usando Q4_K_M (4,98 GB) o Q5_K_M (5,52 GB) el DiT cabe en GPUs de 8-12 GB de VRAM, sumando el text encoder Qwen3-4B y el VAE en el mismo dispositivo o en CPU.
- Prototipado rapido de ilustraciones y conceptos: los 8 pasos y CFG 1,0 permiten iterar prompts en segundos, util para diseno de personajes, moodboards y pruebas de direccion de arte.
- Generacion de imagenes con texto integrado: el renderizado bilingue ingles-chino del modelo base lo hace adecuado para carteles, mockups de producto o banners con rotulos.
- Integracion en pipelines de ComfyUI: el fichero GGUF se carga con el nodo ComfyUI-GGUF, lo que permite encadenarlo con upscalers, controlnets u otros nodos del ecosistema para flujos de produccion de imagen.
- Despliegue en entornos sin GPU dedicada de gama alta: stable-diffusion.cpp permite ejecutar el modelo en CPU o con offload parcial, util para demos locales o servidores modestos.
- Generacion de assets para videojuegos o contenido editorial: la licencia Apache-2.0 facilita el uso comercial de las imagenes generadas, sujeto a las condiciones de la licencia del modelo base.
- Evaluacion comparativa de cuantizaciones: los ficheros con error RMS documentado permiten medir el impacto de la cuantizacion en la calidad de imagen en un pipeline propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta el error RMS relativo de los pesos dequantizados frente a BF16, que se resume a continuacion:

| Precision | Tamano | Error RMS relativo vs BF16 |
|---|---|---|
| F16 | 12,31 GB | 0,00000007 % (7,0e-10) |
| BF16 | 12,31 GB | exacto |
| Q8_0 | 7,22 GB | 0,50 % |
| Q6_K | 5,91 GB | 1,6 % |
| Q5_K_M | 5,52 GB | 2,5 % |
| Q4_K_M | 4,98 GB | 4,7 % |

No se aportan puntuaciones de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible; la model card indica que se anadiran a medida que cada precision supere la evaluacion de imagen.

## Requisitos de hardware

- VRAM estimada para el DiT: 12,31 GB en BF16/F16; 7,22 GB en Q8_0; 5,91 GB en Q6_K; 5,52 GB en Q5_K_M; 4,98 GB en Q4_K_M. Hay que sumar el text encoder Qwen3-4B y el VAE.
- GPU recomendadas: H800 para la latencia sub-segundo declarada por el modelo base; A100/H100 para despliegues de produccion; RTX 4090 (24 GB) para BF16 con margen; RTX 4080/4070 Ti (12-16 GB) para Q8_0; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: si, en configuraciones de 12-16 GB con cuantizaciones Q5_K_M o Q4_K_M, dependiendo del espacio adicional para el text encoder y el VAE.
- Opciones de despliegue: stable-diffusion.cpp (runtime de referencia del benchmark, commit 465adf3), ComfyUI con ComfyUI-GGUF (carga como `lumina2`). No se mencionan vLLM, TGI ni Ollama para este modelo.
- Latencia y throughput: el modelo base declara inferencia sub-segundo en H800 con 8 pasos; no se proporcionan cifras de latencia para las cuantizaciones GGUF ni para GPUs de consumo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Z-Image-Turbo GGUF (esta ficha) | 6,15B | 8 pasos, CFG 1,0 | Apache-2.0 | GGUF | Hugging Face (moonbox-dev) |
| Z-Image-Turbo (original) | 6B | 8 pasos, CFG 1,0 | Apache-2.0 | safetensors | Hugging Face (Tongyi-MAI), ModelScope |
| Z-Image (fundacional) | 6B | no disponible | no disponible | no disponible | Hugging Face (Tongyi-MAI) |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo frente a otros modelos de generacion de imagen (por ejemplo, FLUX.1 o Stable Diffusion 3), por lo que no se incluyen cifras de benchmarks.

## Limitaciones y advertencias

- El repositorio contiene solo el diffusion transformer; sin el text encoder Qwen3-4B y el VAE de FLUX.1 el modelo no es funcional. Hay que descargarlos por separado de Comfy-Org/z_image_turbo.
- Las cuantizaciones introducen degradacion medible: Q4_K_M presenta un 4,7 % de error RMS relativo frente a BF16, lo que puede afectar al detalle fino y al renderizado de texto en imagenes.
- No se han publicado puntuaciones de calidad de imagen para las variantes GGUF; la fidelidad visual real frente a BF16 no esta cuantificada en la informacion disponible.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusion: puede generar contenido inexacto, estereotipado o anatomia incorrecta, especialmente en prompts ambiguos.
- El soporte de texto en imagen se declara bilingue ingles-chino; no hay datos sobre otros idiomas.
- Licencia Apache-2.0 heredada del modelo base; conviene revisar la model card original de Tongyi-MAI/Z-Image-Turbo para condiciones adicionales de uso comercial y atribucion.
- El modelo esta destilado para 8 pasos y CFG 1,0; usar otros valores de pasos o escala CFG puede degradar la calidad y no esta documentado.
- El repositorio tiene un volumen de descargas muy bajo (12) y no cuenta con likes, lo que sugiere poca validacion comunitaria hasta la fecha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Z-Image-Turbo-GGUF
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Informe tecnico (arXiv): https://arxiv.org/abs/2511.22699
- Trabajos relacionados: https://arxiv.org/abs/2511.22677 y https://arxiv.org/abs/2511.13649
- GitHub oficial: https://github.com/Tongyi-MAI/Z-Image
- Sitio oficial del proyecto: https://tongyi-mai.github.io/Z-Image-blog/
- Demo online: https://huggingface.co/spaces/Tongyi-MAI/Z-Image-Turbo
- Demo movil: https://huggingface.co/spaces/akhaliq/Z-Image-Turbo
- ModelScope (checkpoint): https://www.modelscope.cn/models/Tongyi-MAI/Z-Image-Turbo
- ModelScope (demo): https://www.modelscope.cn/aigc/imageGeneration?tab=advanced&versionId=469191&modelType=Checkpoint&sdVersion=Z_IMAGE_TURBO&modelUrl=modelscope%3A%2F%2FTongyi-MAI%2FZ-Image-Turbo%3Frevision%3Dmaster
- Galeria de arte (PDF): assets/Z-Image-Gallery.pdf (dentro del repositorio del modelo base)
- Galeria web: https://modelscope.cn/studios/Tongyi-MAI/Z-Image-Gallery/summary
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
