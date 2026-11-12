# moonbox-ai/flux-3-image-klein-GGUF

## Resumen

FLUX 3 Image Klein es un modelo de difusión de 5.600 millones de parámetros (5.548.681.984 exactos) desarrollado por Black Forest Labs, diseñado para edición de imágenes guiada por instrucciones, generación texto-a-imagen y composición con hasta 10 imágenes de referencia. Emplea un transformer de difusión como columna vertebral y un codificador de texto separado basado en Qwen3-VL-4B-Instruct, lo que permite tanto entrada textual como visual en el condicionamiento. El checkpoint publicado es la variante destilada, pensada para inferencia rápida (16 pasos, CFG 1) en lugar de para reentrenamiento o LoRA.

La ficha que nos ocupa, `moonbox-ai/flux-3-image-klein-GGUF`, no es un modelo nuevo sino una conversión a formato GGUF de los pesos originales en BF16, realizada por Moonbox para uso en dispositivo. El repositorio contiene seis precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) como archivos sueltos, con tamaños que van de 11,10 GB a 3,51 GB, y cada archivo ha sido verificado frente a los pesos BF16 originales con un error RMS relativo documentado. Solo se convierten los pesos del transformer de difusión: el codificador de texto y el VAE se toman de los repositorios originales.

Su relevancia actual radica en que reduce la barrera de hardware para un modelo de edición de imágenes de última generación: la cuantización Q6_K o Q5_K_M cabe en tarjetas de 8 GB si se descarga el codificador de texto, y Q4_K_M ocupa 3,51 GB. La licencia FLUX Kommunity limita el uso comercial a empresas con ingresos anuales inferiores a 5 millones de dólares, y estos archivos no son una publicación oficial de Black Forest Labs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo de imagen); codificador de texto Qwen3-VL-4B-Instruct separado |
| Parametros totales | 5.548.681.984 (transformer de imagen) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | FLUX Kommunity License (uso no comercial, o comercial para empresas con ingresos anuales < 5 M USD) |
| Formato de pesos | GGUF (un archivo por precision); VAE en safetensors (`ae.safetensors`); codificador de texto GGUF aparte |

Detalle de archivos y fidelidad frente a BF16:

| Precision | Tamano | Error RMS relativo vs BF16 |
|---|---|---|
| F16 | 11,10 GB | 1,5e-9 % |
| BF16 | 11,10 GB | exacto |
| Q8_0 | 6,15 GB | 0,53 % |
| Q6_K | 4,87 GB | 1,8 % |
| Q5_K_M | 4,17 GB | 3,5 % |
| Q4_K_M | 3,51 GB | 7,0 % |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión para imágenes. La etiqueta de 5,6B se refiere exclusivamente al transformer de imagen; el codificador de texto (Qwen3-VL-4B-Instruct) y el VAE (el `ae.safetensors` de FLUX.2) son componentes independientes que se cargan por separado. El condicionamiento combina texto e imágenes de referencia: el modelo acepta un prompt y hasta 10 imágenes de referencia y devuelve una sola imagen, cubriendo edición, texto-a-imagen y composición multi-referencia con el mismo conjunto de pesos. También admite guiado de composición mediante cajas delimitadoras (bounding boxes), cuyo formato se documenta en el repositorio de GitHub de Black Forest Labs.

El checkpoint publicado es la variante destilada, entrenada para converger en 16 pasos de muestreo con CFG 1,0 y muestreador Euler. Para fine-tuning, entrenamiento de LoRA e investigación, el autor remite a FLUX 3 Image Klein Base. Un requisito operativo destacado es el uso obligatorio de un ampliador de prompts (prompt upsampler): el modelo fue entrenado con pies de foto de escena completos, de modo que un prompt corto tal cual produce resultados genéricos. Black Forest Labs publica su propio upsampler (`flux-3-image-klein-pup`) y los `system_prompts.json` para replicarlo con cualquier LLM.

En cuanto a la conversión GGUF, los pesos originales en BF16 (revisión `09561231f4`) se convirtieron primero a F16/BF16 y después se cuantizaron con `llama-quantize` de llama.cpp. Cada archivo fue verificado contra el original antes de la subida y el repositorio publica los hashes SHA-256 esperados.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts descriptivos de escena completa.
- Edición de imágenes guiada por instrucción: se aporta una imagen de entrada y una instrucción de edición.
- Composición multi-referencia con hasta 10 imágenes de referencia en una sola generación.
- Control de composición mediante cajas delimitadoras (bounding boxes) para guiar la disposición de los elementos.
- Condicionamiento multimodal: el codificador Qwen3-VL-4B-Instruct procesa tanto texto como imágenes de referencia.
- Muestreo destilado eficiente: 16 pasos con CFG 1,0 y muestreador Euler.
- Integración con stable-diffusion.cpp (CLI `sd-cli`) y con ComfyUI mediante ComfyUI-GGUF.
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento explícito; el modelo es exclusivamente de imagen.

## Casos de uso

- Edición de fotografías de producto: se pasa la imagen original con `-r input.png` y una instrucción de edición (cambio de fondo, iluminación o encuadre) para generar variantes consistentes; la ventana de 16 pasos permite iterar rápido sobre muchas imágenes en un lote.
- Generación de ilustraciones para documentación técnica: con Q8_0 (6,15 GB) y el codificador de texto en Q8_0 se obtienen resultados cercanos al original (0,53 % de error RMS) en una sola GPU, útil para material gráfico interno.
- Composición multi-referencia para marketing: combinar hasta 10 imágenes de referencia (productos, estilos, personajes) en una escena coherente, usando el formato de prompt de escena completa que el modelo espera.
- Maquetación guiada por cajas: definir bounding boxes para situar elementos en una plantilla (por ejemplo, banners o portadas) y dejar que el modelo rellene el contenido respetando la disposición.
- Prototipado en estación de trabajo con 8 GB de VRAM: Q6_K (4,87 GB) o Q5_K_M (4,17 GB) con el codificador de texto descargado a CPU permiten ejecutar el pipeline completo en tarjetas consumer.
- Despliegue en ComfyUI para flujos de trabajo de estudio: colocar el GGUF en `models/unet`, cargarlo con Unet Loader (GGUF) y encadenarlo con el upsampler de prompts y el VAE de FLUX.2 dentro de un grafo reutilizable.
- Evaluación comparativa de cuantizaciones: el repositorio publica el error RMS de cada precisión, lo que permite medir la degradación real (de 0,53 % en Q8_0 a 7,0 % en Q4_K_M) antes de fijar una precisión para producción.
- Investigación sobre edición de imágenes en hardware modesto: Q4_K_M (3,51 GB) hace viable experimentar con un modelo de 5,6B en GPUs de gama media, aceptando el coste de fidelidad del 7,0 %.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente documenta la fidelidad de la cuantización frente a los pesos BF16 (error RMS relativo por precisión, ver tabla de especificaciones) y menciona que se añadirán puntuaciones de calidad de imagen frente a las salidas BF16 a medida que cada precisión supere la evaluación de imagen, pero no incluye dichos valores.

## Requisitos de hardware

- VRAM estimada para el transformer de imagen: 11,10 GB en F16/BF16; 6,15 GB en Q8_0; 4,87 GB en Q6_K; 4,17 GB en Q5_K_M; 3,51 GB en Q4_K_M. A ello hay que sumar el codificador de texto Qwen3-VL-4B-Instruct y el VAE, que se cargan aparte.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, Q8_0 encaja en GPUs de 12-16 GB; Q6_K y Q5_K_M están pensados para tarjetas de 8 GB con el codificador de texto descargado; Q4_K_M es la opción mínima.
- Cabe en GPU consumer: sí, según el autor, Q6_K y Q5_K_M caben en tarjetas de 8 GB si se descarga el codificador de texto; Q4_K_M es la más ligera.
- Opciones de despliegue: stable-diffusion.cpp (runtime de referencia del benchmark, commit `465adf3`), ComfyUI con ComfyUI-GGUF (archivo en `models/unet`, cargado con Unet Loader (GGUF) en un flujo FLUX 3). No se documentan opciones para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El muestreo es de 16 pasos con CFG 1,0 y muestreador Euler, lo que reduce el coste frente a configuraciones no destiladas, pero no se publican cifras de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto / referencias | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| FLUX 3 Image Klein GGUF (esta ficha) | 5,6B | Hasta 10 imagenes de referencia; contexto no disponible | GGUF (F16 a Q4_K_M) | FLUX Kommunity | Conversion no oficial de Moonbox; runtime stable-diffusion.cpp y ComfyUI |
| FLUX 3 Image Klein (original) | 5,6B | Hasta 10 imagenes de referencia; contexto no disponible | BF16, FP8, NVFP4 | FLUX Kommunity | Publicacion oficial de Black Forest Labs; incluye upsampler y codigo de inferencia |
| FLUX 3 Image Klein Base | No disponible | No disponible | No disponible | FLUX Kommunity | Variante para fine-tuning, LoRA e investigacion |
| Otras alternativas de edicion de imagen | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia restrictiva: FLUX Kommunity License permite uso no comercial y uso comercial de las salidas solo para empresas con ingresos anuales inferiores a 5 millones de dólares. Es una licencia con acceso controlado (gated) y estos archivos heredan sus términos.
- No es una publicación oficial: Moonbox realiza la conversión GGUF de forma independiente; Black Forest Labs no respalda estos archivos.
- Requiere prompt upsampler: sin expandir el prompt a un pie de escena completo, la salida es genérica. Es un requisito de uso, no una recomendación opcional.
- Dependencias externas: el codificador de texto (Qwen3-VL-4B-Instruct) y el VAE (`ae.safetensors`) no están incluidos y deben obtenerse de sus repositorios originales.
- Pérdida de fidelidad por cuantización: el error RMS relativo sube del 0,53 % en Q8_0 al 7,0 % en Q4_K_M; no se han publicado aún puntuaciones de calidad de imagen que traduzcan ese error a degradación perceptible.
- Orientado a inferencia: el checkpoint es la variante destilada; para fine-tuning o LoRA hay que usar FLUX 3 Image Klein Base.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; al ser un modelo generativo de imagen, existe riesgo de artefactos y de contenido no fiel al prompt, pero no se aportan métricas.
- Idiomas: no se especifican los idiomas soportados por el codificador de texto ni por los prompts de edición.
- Compatibilidad de runtime limitada: la documentación solo cubre stable-diffusion.cpp y ComfyUI-GGUF; no hay soporte verificado para otros motores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-ai/flux-3-image-klein-GGUF
- Modelo base original: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Variante Base para fine-tuning: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Upsampler de prompts: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Codificador de texto GGUF: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- Codigo de inferencia y formato de bounding boxes: https://github.com/black-forest-labs/flux-3-image-klein
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Archivo de pesos F16: https://huggingface.co/moonbox-ai/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-F16.gguf
- Archivo de pesos BF16: https://huggingface.co/moonbox-ai/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-BF16.gguf
- Archivo de pesos Q8_0: https://huggingface.co/moonbox-ai/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-Q8_0.gguf
- Archivo de pesos Q6_K: https://huggingface.co/moonbox-ai/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-Q6_K.gguf
- Archivo de pesos Q5_K_M: https://huggingface.co/moonbox-ai/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-Q5_K_M.gguf
- Archivo de pesos Q4_K_M: https://huggingface.co/moonbox-ai/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-Q4_K_M.gguf
- Variantes FP8 del modelo original: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/fp8r
- Variantes NVFP4 del modelo original: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/nvfp4
