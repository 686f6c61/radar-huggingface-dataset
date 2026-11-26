# SarthakRawool/Wan2.1-T2V-1.3B-MLX-8bit-LowMem

## Resumen

Wan2.1-T2V-1.3B-MLX-8bit-LowMem es una compilacion no oficial del modelo de generacion de video a partir de texto Wan 2.1 T2V 1.3B, desarrollado originalmente por Wan-AI y empaquetado por SarthakRawool para su uso en Macs con Apple Silicon mediante el framework MLX. El modelo base es un diffusion transformer de 1.300 millones de parametros orientado a text-to-video; esta version cuantiza a 8 bits las capas lineales de atencion y FFN del transformer de difusion y conserva el resto de componentes en bf16 o fp32.

El paquete integra en una sola carpeta el modelo de video, el codificador de texto umT5-XXL y el VAE de Wan 2.1, con un total de 13,2 GB en disco (12,3 GiB) frente a los aproximadamente 17,5 GB de las partes del release oficial de las que se construye. Su proposito es permitir la generacion de video local en equipos con 16 GB de memoria unificada, reduciendo el pico de memoria hasta 4,94 GB mediante streaming de bloques desde el SSD.

Es relevante porque demuestra que un modelo de difusion de video de 1.300 millones de parametros puede ejecutarse en hardware de consumo Apple sin recurrir a swap, con resultados identicos bit a bit entre los distintos modos de gestion de memoria. No es un checkpoint compatible con diffusers ni ComfyUI, sino un build especifico del motor Shuttrr.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con 30 bloques sobre Wan 2.1; VAE decoder y codificador de texto umT5-XXL |
| Parametros totales | 1.300 millones (modelo de difusion); el paquete incluye ademas umT5-XXL y el VAE |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-video, no de lenguaje) |
| Tipos de cuantizacion | 8 bits (MLX affine, group size 64, escalas bf16) en las 10 capas lineales de atencion y FFN por bloque; biases, norms, embeddings y cabeza de salida en bf16; tensores de modulacion en fp32 |
| Idiomas soportados | No disponible (prompts en lenguaje natural via tokenizer umT5-XXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (build Shuttrr con manifiesto `shuttrr.json`; no compatible con diffusers ni ComfyUI) |

## Arquitectura y entrenamiento

El modelo base Wan 2.1 T2V 1.3B es un diffusion transformer de 30 bloques que genera video a partir de texto. Esta compilacion conserva la arquitectura del release oficial y solo altera la precision de las capas lineales de atencion y FFN de cada bloque, cuantizadas a 8 bits con cuantizacion afín de MLX (group size 64, escalas en bf16). El resto de tensores (biases, normas, embeddings, cabeza de salida) permanece en bf16, y los tensores de modulacion en fp32. El VAE decoder se mantiene en fp32 y el codificador umT5-XXL en bf16.

Los pesos proceden integramente del repositorio oficial Wan-AI/Wan2.1-T2V-1.3B. Los ficheros `.pth` se copiaron a safetensors sin PyTorch y sin ejecutar su codigo pickle, y despues se convirtieron con la herramienta `shutter convert`. El paquete incluye el tokenizer `google/umt5-xxl` sin modificar. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

La innovacion tecnica destacable es el soporte de pasos de baja memoria: el motor Shuttrr puede mantener todo el modelo en memoria, liberarlo antes del decode o hacer streaming de los bloques del transformer desde el SSD. En las mediciones realizadas, todos los modos produjeron los mismos fotogramas bit a bit.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resoluciones de 320x512 y 480x832.
- Generacion de clips de 33 fotogramas por defecto en Macs con menos de 24 GB; clips de 17 fotogramas y 12 pasos mediante el motor Shuttrr.
- Decodificacion VAE con opcion de tiled decode (`vae_tile`) para resoluciones mayores.
- Codificacion de prompts en lenguaje natural mediante umT5-XXL.
- Ejecucion local en Apple Silicon con gestion configurable de memoria (resident, split, staged, stream_wide, stream_tight).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Generacion de video local en Macs de 16 GB: el modelo permite crear clips de 320x512 y 33 fotogramas con un pico de 4,94 GB usando streaming de bloques desde el SSD, lo que lo hace viable en equipos que de otro modo no podrian ejecutar modelos de difusion de video.
- Prototipado rapido de ideas visuales: con 54 segundos por clip de 17 fotogramas y 12 pasos a traves del motor Shuttrr, sirve para iterar sobre prompts y composiciones antes de producir versiones de mayor calidad.
- Creacion de contenido para redes sociales: clips cortos de 320x512 generados en unos 130-140 segundos permiten producir material de baja resolucion para borradores o previsualizaciones.
- Investigacion sobre cuantizacion de modelos de difusion: el paquete permite comparar el comportamiento de las capas lineales a 8 bits frente al modelo original, con verificacion bit a bit entre modos de memoria.
- Desarrollo y prueba de motores de inferencia en Apple Silicon: sirve como banco de pruebas para el motor Shuttrr y para el codigo mlx-video que vendoriza, evaluando estrategias de streaming y gestion de memoria.
- Generacion de video en entornos sin GPU dedicada: al ejecutarse sobre MLX en Apple Silicon, cubre escenarios donde no hay acceso a A100, H100 o RTX y se dispone de un MacBook.
- Educacion y demos: permite mostrar el funcionamiento de un pipeline text-to-video completo (tokenizer, text encoder, DiT, VAE) en un unico equipo de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye mediciones de tiempo y memoria, no metricas de calidad:

| Configuracion | Resolucion | Fotogramas | Pasos | Pico de memoria | Tiempo |
|---|---|---|---|---|---|
| resident (velocidad completa) | 320x512 | 33 | 20 | 6,48 GB | 139 s |
| stream_tight (bloques desde SSD) | 320x512 | 33 | 20 | 4,94 GB | 131 s |
| resident (build anterior) | 320x512 | 33 | 20 | 6,23 GB | 166 s |
| staged (build anterior) | 320x512 | 33 | 20 | 4,61 GB | 163 s |
| staged con tiled decode | 480x832 | 33 | 30 | 6,93 GB | 676 s |
| motor Shuttrr | 320x512 | 17 | 12 | 6,4 GB | 54 s |

Medido en un MacBook Pro M5 (Mac17,2) con 16 GB, macOS 27.2 y MLX 0.32.5, con otras aplicaciones abiertas, por lo que los tiempos son cotas superiores. No se han medido resultados en otros Macs. No se midieron 480x832 a 81 fotogramas ni los pasos con streaming a 480x832.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,48 GB de pico en modo resident a 320x512 y 33 fotogramas; 4,94 GB en modo stream_tight; 6,93 GB a 480x832 con tiled decode.
- GPU recomendadas: Apple Silicon con al menos 16 GB de memoria unificada; el modelo se ha medido en un MacBook Pro M5 de 16 GB.
- Cabe en GPU de consumo Apple: si, en Macs de 16 GB; en Macs de menos de 24 GB se recomienda como primer modelo. Clips de 81 fotogramas a 480x832 no caben junto a aplicaciones normales en 16 GB y requieren un Mac mayor.
- Opciones de despliegue: motor Shuttrr (aplicacion y CLI `shutter`), con soporte de MLX; no es compatible con diffusers, ComfyUI ni la referencia de codigo de Wan. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 139 s por clip de 33 fotogramas y 20 pasos a 320x512 en modo resident; 131 s en stream_tight; 54 s para 17 fotogramas y 12 pasos; 676 s para 33 fotogramas y 30 pasos a 480x832.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion tipica | Contexto/fotogramas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B-MLX-8bit-LowMem (este) | 1.300 M | 320x512, 480x832 | 33 fotogramas por defecto | Apache 2.0 | MLX / Shuttrr, Apple Silicon |
| Wan-AI/Wan2.1-T2V-1.3B (original) | 1.300 M | 480x832 y superiores | No disponible en la informacion | Apache 2.0 | Pesos oficiales, ~17,5 GB en las partes usadas |
| Repack fp16 de Comfy-Org | 1.300 M | No disponible | No disponible | Apache 2.0 | ComfyUI |

No se dispone de datos de rendimiento comparativo (calidad de video, metricas FVD u otras) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un build no oficial: no esta hecho ni respaldado por Wan-AI.
- No es un checkpoint de diffusers ni de ComfyUI; el codigo de referencia de Wan no puede cargarlo. Solo funciona con el motor Shuttrr.
- La cuantizacion a 8 bits de las capas lineales puede degradar la calidad del video frente al modelo original en bf16/fp16; no se aportan metricas de calidad que lo cuantifiquen.
- En Macs de 16 GB, los clips de 81 fotogramas a 480x832 no caben junto a aplicaciones normales y requieren un Mac mayor.
- Los resultados solo se han medido en un MacBook Pro M5 de 16 GB; no hay mediciones en otros equipos Apple Silicon.
- No se documentan sesgos conocidos ni riesgo de alucinacion especifico; al ser un modelo generativo de video, puede producir contenido visual inexacto o no fiel al prompt.
- No se dispone de informacion sobre idiomas soportados en los prompts.
- Licencia Apache 2.0 en los pesos, heredada del release original; el uso esta sujeto ademas a los terminos de uso aceptable de la model card original.
- El codigo del motor Shuttrr y el codigo mlx-video que vendoriza tienen licencia MIT y no forman parte de este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SarthakRawool/Wan2.1-T2V-1.3B-MLX-8bit-LowMem
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio del motor Shuttrr: https://github.com/sarthakrawool/shuttrr
- Model card original (terminos de uso aceptable): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
