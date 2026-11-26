# moonbox-ai/flux-3-image-klein-GGUF

## Resumen

FLUX 3 Image Klein GGUF es una conversión al formato GGUF del modelo de difusión FLUX 3 Image Klein, desarrollado originalmente por Black Forest Labs y empaquetado por Moonbox para su uso en dispositivos locales. Se trata de un transformer de difusión de 5.548.681.984 parámetros (aproximadamente 5,6B) orientado a generación de imágenes a partir de texto y edición de imágenes guiada por instrucciones, con pesos abiertos bajo la licencia FLUX Kommunity.

El repositorio contiene únicamente los pesos del diffusion transformer en distintas precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M), con tamaños que van de 3,51 GB a 11,10 GB. El resto del pipeline (text encoder Qwen3-VL 4B, VAE de FLUX.2 y tokenizador) debe obtenerse por separado del repositorio original. Esta separación es habitual en los empaquetados GGUF para modelos de difusión y permite ajustar el uso de memoria por componente.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de edición y generación de imágenes de última generación en hardware de consumo, con métricas de fidelidad frente a BF16 publicadas por el autor y con la advertencia explícita de un fallo conocido del runtime stable-diffusion.cpp con el archivo F16 en CUDA. Es, por tanto, una opción a considerar para prototipado local, investigación y flujos con ComfyUI, siempre teniendo en cuenta las restricciones de su licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (diffusion transformer) para generación y edición de imágenes |
| Parametros totales | 5.548.681.984 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (modelo texto-a-imagen; el text encoder Qwen3-VL 4B es multilingüe, pero no se detalla en la información) |
| Licencia | FLUX Kommunity License (no comercial, o comercial para empresas con ingresos anuales inferiores a 5 M USD) |
| Formato de pesos | GGUF (un archivo por precisión); text encoder y VAE en GGUF/safetensors aparte |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (diffusion transformer) de aproximadamente 5,6B de parámetros, destilado según la model card (16 pasos de muestreo, CFG 1). El pipeline completo separa tres componentes: el diffusion transformer (los pesos de este repositorio), un text encoder basado en Qwen3-VL 4B Instruct y un VAE heredado de FLUX.2 (`ae.safetensors` en el repositorio original). Esta separación permite cuantizar y cargar cada pieza de forma independiente.

La conversión la realiza Moonbox a partir de la revisión `09561231f4` del modelo original: primero se convierten los pesos BF16 originales a GGUF F16/BF16 y después se cuantizan con `llama-quantize` de llama.cpp. Cada archivo se verificó contra el original antes de subirse, y la model card publica el hash sha256 esperado de cada uno. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en lenguaje natural, con resolución de trabajo de 1024 x 1024 en los ejemplos publicados.
- Edición de imágenes guiada por instrucciones: se pasa una imagen de entrada (`-r input.png`) junto con un prompt de edición.
- Muestreo destilado eficiente: 16 pasos con CFG 1 y sampler euler, lo que reduce el coste computacional frente a modelos no destilados.
- Integración con ComfyUI mediante el nodo Unet Loader (GGUF) del plugin ComfyUI-GGUF, dentro de un flujo de trabajo FLUX 3.
- Ejecución en local mediante stable-diffusion.cpp con el binario `sd-cli`, combinando diffusion model, text encoder y VAE.
- Soporte de cuantizaciones que permiten ajustar el modelo a distintos presupuestos de memoria (de 3,51 GB a 11,10 GB solo para el transformer).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o visión más allá del uso del text encoder Qwen3-VL para codificar el prompt.

## Casos de uso

- Prototipado local de generación de imágenes: usar Q8_0 o Q6_K con stable-diffusion.cpp o ComfyUI para iterar sobre prompts e ideas visuales sin depender de servicios en la nube, aprovechando que el modelo destilado requiere solo 16 pasos.
- Edición de imágenes por instrucción en flujos creativos: pasar una imagen existente junto con una instrucción textual para modificarla (por ejemplo, cambiar el estilo o añadir elementos), usando el modo de edición documentado con `-r input.png`.
- Integración en ComfyUI para pipelines de diseño: cargar el GGUF en `models/unet` con Unet Loader (GGUF) y encadenarlo con nodos de postprocesado, upscaling o control de imagen dentro de un grafo reutilizable.
- Evaluación comparativa de cuantizaciones: emplear las métricas publicadas (LPIPS, PSNR, ImageReward, HPSv2, CLIP) para decidir qué precisión usar según el compromiso entre calidad y memoria en un hardware concreto.
- Despliegue en estaciones de trabajo con GPU de consumo: Q5_K_M y Q6_K están pensados para caber en tarjetas de 8 GB con el text encoder descargado a CPU, lo que permite generar imágenes en equipos no dedicados.
- Investigación sobre cuantización de modelos de difusión: el repositorio incluye hashes y errores RMS relativos por archivo, lo que facilita reproducir experimentos sobre el impacto de la cuantización en la calidad visual.
- Generación de material visual para documentación o prototipos internos, siempre que el uso encaje en los términos de la FLUX Kommunity License (no comercial o comercial solo por debajo del umbral de ingresos indicado).

## Benchmarks y rendimiento

La model card publica una comparación de cada precisión frente a BF16 sobre 100 prompts de PartiPrompts, una imagen de 1024 x 1024 por prompt, semilla 1000 + id de prompt, ejecutada con stable-diffusion.cpp master-465adf3 en CUDA (RTX 3080 Laptop), 16 pasos, CFG 1 y sampler euler. El criterio de aceptación es una diferencia media de ImageReward dentro de 0,05 y de HPSv2 dentro de 0,003 respecto a BF16.

| Precision | Tamano | Error RMS de pesos | LPIPS vs BF16 | PSNR vs BF16 | ImageReward (delta) | HPSv2 (delta) | CLIP (delta) |
|---|---|---|---|---|---|---|---|
| F16 | 11,10 GB | 1,5e-9 | no disponible | no disponible | no disponible | no disponible | no disponible (marcado experimental: imágenes en blanco en CUDA con sd.cpp) |
| BF16 | 11,10 GB | exacto (referencia) | referencia | referencia | referencia | referencia | referencia |
| Q8_0 | 6,15 GB | 0,53 % | 0,014 | 35,6 dB | +0,004 | -0,0002 | +0,05 |
| Q6_K | 4,87 GB | 1,8 % | 0,043 | 28,4 dB | +0,006 | -0,0008 | +0,03 |
| Q5_K_M | 4,17 GB | 3,5 % | 0,082 | 25,2 dB | +0,021 | -0,0001 | +0,00 |
| Q4_K_M | 3,51 GB | 7,0 % | 0,144 | 21,0 dB | -0,024 | -0,0025 | +0,05 |

Todas las cuantizaciones superan el criterio de aceptación según el autor. No se han publicado resultados de benchmarks de calidad absoluta (por ejemplo, FID o comparaciones con otros modelos de generación) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el diffusion transformer: 11,10 GB en F16/BF16, 6,15 GB en Q8_0, 4,87 GB en Q6_K, 4,17 GB en Q5_K_M y 3,51 GB en Q4_K_M. A esto hay que sumar el text encoder Qwen3-VL 4B (en Q8_0) y el VAE.
- GPU recomendadas: no se especifican modelos concretos en la información; el benchmark se ejecutó en una RTX 3080 Laptop, lo que indica que es viable en GPU de consumo de gama alta.
- Caben en GPU de consumo: Q6_K y Q5_K_M están pensados para tarjetas de 8 GB con el text encoder descargado a CPU; Q4_K_M es la opción más pequeña. BF16/F16 requieren alrededor de 11 GB solo para el transformer.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli`), ComfyUI con ComfyUI-GGUF (nodo Unet Loader (GGUF) en `models/unet`). No se documentan en la información disponible integraciones con vLLM, TGI, Ollama ni llama.cpp para este modelo de difusión.
- Latencia y throughput: no se publican datos concretos. Se sabe que el modelo es destilado y usa 16 pasos con CFG 1, lo que reduce el número de evaluaciones del transformer frente a modelos no destilados.
- Advertencia de runtime: con stable-diffusion.cpp en CUDA, el archivo F16 genera imágenes en blanco (100 de 100 prompts en el commit master-465adf3); debe usarse BF16 en ese runtime.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. Se indica, por tanto, que la comparativa con alternativas de la misma categoría está no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: FLUX Kommunity License permite uso no comercial, o uso comercial de las salidas solo para empresas con ingresos anuales inferiores a 5 M USD. Es necesario revisar el archivo LICENSE.md del repositorio antes de cualquier despliegue en producción.
- No es una release oficial de Black Forest Labs: estos GGUF son una conversión de terceros (Moonbox) y no cuentan con el respaldo del autor original.
- Fallo conocido del F16 en CUDA con stable-diffusion.cpp: aunque los pesos son equivalentes a BF16, el runtime produce imágenes en blanco; se recomienda BF16 en ese caso. Otros runtimes podrían no verse afectados, pero no está verificado en la información disponible.
- Dependencia de componentes externos: el text encoder (Qwen3-VL 4B) y el VAE (`ae.safetensors`) no están incluidos y deben obtenerse por separado, lo que añade complejidad y consumo de memoria al despliegue.
- Riesgo de sesgos y alucinación visual: no se documentan en la información disponible evaluaciones de sesgos ni tasas de fallo en la generación; como todo modelo generativo, puede producir imágenes inexactas o no fieles al prompt.
- Idiomas: no se especifica qué idiomas admite el pipeline completo; el text encoder Qwen3-VL es multilingüe, pero el comportamiento del modelo con prompts en castellano no está documentado.
- Contexto: no se dispone de información sobre longitud de contexto del text encoder ni sobre límites de longitud de prompt.
- Uso en producción: la licencia, la dependencia de runtimes concretos y el estado experimental de algunas precisiones desaconsejan un despliegue directo sin validación previa.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/moonbox-ai/flux-3-image-klein-GGUF
- Modelo base original: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Text encoder GGUF (Qwen3-VL 4B Instruct): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- Plugin ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia FLUX Kommunity: LICENSE.md en el repositorio GGUF
