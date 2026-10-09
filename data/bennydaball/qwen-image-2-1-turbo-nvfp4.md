# BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4

## Resumen

Qwen-Image-2.1-Turbo-NVFP4 es una cuantizacion independiente, publicada por el usuario BennyDaBall, del modelo de generacion y edicion de imagen Qwen-Image-2.1-Turbo de Alibaba Qwen. El paquete incluye un transformer de difusion de imagen y un encoder de texto Qwen3-VL-8B, ambos convertidos a NVFP4 (formato de 4 bits en coma flotante de NVIDIA) de forma selectiva, dejando capas sensibles en BF16. No es un modelo nuevo: reproduce la arquitectura y los pesos del checkpoint original, solo comprimidos y empaquetados como pesos nativos de ComfyUI.

El objetivo es reducir el coste de memoria y acelerar la inferencia sin degradar de forma perceptible la calidad de imagen. El paquete completo ocupa 15,70 GB (transformer NVFP4 de 5,69 GB, encoder NVFP4 de 9,33 GB y VAE BF16 de 0,68 GB), un 51,6 % menos que el paquete BF16 original, que ronda los 32,4 GB. Segun el autor, alcanza una mediana de 1,739 s por imagen a 1024×1024 en una RTX 5090 con ComfyUI sin modificar, incluyendo codificacion de texto, muestreo, decodificacion y guardado PNG.

El modelo base, Qwen-Image-2.1-Turbo, es un checkpoint acelerado de Qwen-Image-2.1 pensado para generar y editar imagenes en solo 8 pasos de denoising. Incluye soporte nativo de transparencia RGBA, edicion por referencia y tipografia. Es relevante ahora porque combina un generador visual relativamente compacto con un plan de muestreo corto, lo que abarata el coste por imagen, y esta cuantizacion concreta lo hace ejecutable en GPU de consumo Blackwell (serie RTX 50) o en entornos con aceleracion NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para imagen, con encoder de texto Qwen3-VL-8B |
| Parametros totales | No disponible en la model card; fuentes externas describen el generador visual como de ~7B, mas un encoder Qwen3-VL-8B |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable directamente (modelo de generacion de imagen); resoluciones de salida de 1024×1024 hasta 2048×2048 |
| Tipos de cuantizacion | NVFP4 selectivo (4 bits) en transformer y encoder, con capas sensibles en BF16; VAE sin cambios en BF16 |
| Idiomas soportados | No disponible en la model card; el encoder de texto Qwen3-VL-8B es multilingue |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura nueva: hereda la de Qwen-Image-2.1-Turbo, un transformer de difusion para generacion y edicion de imagen que el autor del modelo original describe como un checkpoint acelerado con solo 8 pasos de denoising. El texto se procesa con un encoder Qwen3-VL-8B y el resultado se decodifica con un VAE que se mantiene en BF16 sin tocar. La generacion funciona con el sampler Euler, CFG 1 y un plan de sigmas fijo de ocho valores (1,0; 0,978453; 0,95418; 0,926626; 0,89508; 0,845148; 0,704534; 0,414568; 0,0) mediante `ManualSigmas` y `SamplerCustomAdvanced`.

La innovacion de esta release concreta es la cuantizacion selectiva. El autor empleo sondas de capas en BF16 y comparaciones de imagen para decidir que comprimir: el transformer contiene 144 matrices en NVFP4 y 48 matrices sensibles adicionales en BF16; el encoder contiene 188 matrices en NVFP4 y 64 matrices de lenguaje adicionales en BF16. Vision, embeddings, la cabeza de lenguaje y otros tensores criticos conservan la precision original, y el VAE queda intacto. Los pesos se empaquetaron como single-file nativo de ComfyUI, sin nodos personalizados ni parches del core, y se validaron contra el checkpoint BF16 con 16 casos de prompt/seed comparados visualmente. No se ha publicado informacion sobre el dataset de entrenamiento original ni sobre el proceso de destilacion de Qwen-Image-2.1-Turbo.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con resoluciones como 1024×1024, 1536×1024 y 2048×2048; se recomienda usar dimensiones divisibles por 16.
- Edicion de imagen guiada por referencia (por ejemplo, cambiar el vestuario de una fotografia) mediante flujos con imagen de entrada.
- Generacion con transparencia RGBA nativa, util para recortes de producto con canal alfa real.
- Composicion a partir de multiples referencias, combinando dos imagenes de entrada en un mismo flujo de trabajo.
- Tipografia y rotulacion de campana: renderiza texto concreto en la imagen siguiendo instrucciones de contenido y colocacion.
- Siete flujos de trabajo listos para cargar en ComfyUI (text-to-image, edicion, RGBA transparente, referencias multiples, tipografia a 1536×1024, opcion de encoder BF16 y tipografia a 2048×2048).
- Muestreo acelerado en 8 pasos con el plan de sigmas oficial de Turbo.
- No se documentan en la model card capacidades de tool calling, agentes, audio ni modos de razonamiento extendido; se trata de un modelo de difusion de imagen, no de un LLM conversacional.

## Casos de uso

- Edicion de moda y producto: el flujo 02 permite cambiar el vestuario de una fotografia de referencia manteniendo el encuadre, util para catalogos de e-commerce que necesitan variantes de color o prenda sin repetir sesion fotografica.
- Recortes de producto con fondo transparente: el flujo 03 genera RGBA nativo con alfa real, lo que evita el paso de segmentacion posterior y acelera la publicacion en tiendas online.
- Creacion de creatividades publicitarias con texto: los flujos 05 y 07 renderizan tipografia a 1536×1024 y 2048×2048, apropiados para banners y cabeceras de campana donde el lema debe aparecer legible y colocado segun instruccion.
- Ilustracion y arte conceptual: con 8 pasos de muestreo y alrededor de 1,7 s por imagen a 1024×1024 en RTX 5090, permite iterar rapidamente sobre bocetos generados por prompt.
- Composicion a partir de varias referencias: el flujo 04 combina dos imagenes de entrada, util para previsualizar mezclas de estilos, productos o escenarios antes de una produccion real.
- Prototipado de interfaces graficas y assets: la generacion con transparencia y la salida a resoluciones altas facilitan obtener iconos o elementos de UI provisionales con fondo limpio.
- Integracion en pipelines locales de diseno: al cargar en ComfyUI 0.39.0 sin nodos personalizados, encaja en estaciones de trabajo con GPU Blackwell para generar lotes de imagenes de forma repetible y automatizable.
- Pruebas de cuantizacion y benchmarking de NVFP4: sirve como caso practico para medir latencia y calidad en hardware que soporte NVFP4 en comparacion con el BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo es de generacion de imagen y no un LLM. Los datos de rendimiento aportados por el autor son de latencia y calidad visual:

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia por imagen a 1024×1024 | 1,739 s (mediana de cinco ejecuciones en caliente) | RTX 5090, ComfyUI 0.39.0 sin modificar, incluye codificacion de texto, muestreo, decodificacion y guardado PNG |
| Pasos de muestreo | 8 | Euler, CFG 1, plan de sigmas oficial de Turbo |
| Tamano del paquete | 15,70 GB | Transformer 5,69 GB + encoder 9,33 GB + VAE 0,68 GB |
| Reduccion de tamano | 51,6 % frente al BF16 original (~32,4 GB) | Calculo a partir del dato del autor |

La validacion de calidad se realizo con 16 casos de prompt/seed comparados visualmente entre BF16, NVFP4 selectivo y NVFP4 con encoder BF16, documentados en `COMPARISONS.md`. No se aportan metricas automaticas como FID, CLIP score o SSIM.

## Requisitos de hardware

- VRAM estimada: los pesos suman 15,70 GB (transformer NVFP4 5,69 GB, encoder NVFP4 9,33 GB, VAE BF16 0,68 GB); se recomienda un minimo de 24 GB de VRAM para dejar margen a activaciones y al proceso de decodificacion.
- GPU recomendadas: RTX 5090 (probada por el autor) para NVFP4 nativo; tambien caben en GPUs de 24 GB como RTX 4090 o RTX 3090, aunque con menos holgura y probablemente sin aceleracion NVFP4 nativa.
- Compatibilidad NVFP4: el soporte nativo de NVFP4 exige arquitectura Blackwell (serie RTX 50, B100/B200, RTX PRO Blackwell). En GPUs sin soporte nativo, ComfyUI carga el encoder mediante el fallback de matmul en precision completa, lo que puede aumentar el uso de memoria y reducir la ventaja de velocidad.
- Cabe en GPU de consumo: si, en la RTX 5090 (32 GB) con holgura, y de forma ajustada en GPUs de 24 GB. No se recomienda para GPUs de 16 GB o menos sin cuantizacion adicional.
- Opciones de despliegue: ComfyUI 0.39.0 o superior (ruta principal, con cargadores estandar y sin nodos personalizados); libreria `diffusion-single-file`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs y no a este tipo de modelo de difusion.
- Latencia y throughput: 1,739 s de mediana por imagen a 1024×1024 en RTX 5090 con ComfyUI 0.39.0, cinco ejecuciones en caliente, con los modelos ya cargados y re-codificacion de texto en cada ejecucion. Probado con frontend 1.53.10, Comfy Kitchen 0.2.37 y PyTorch 2.14.0+cu130. Otros equipos y ajustes variaran.

## Comparativa con modelos similares

| Modelo | Parametros / encoder | Contexto / salida | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4 (este) | ~7B generador + Qwen3-VL-8B encoder (segun fuentes externas) | Salida de 1024×1024 a 2048×2048 | 1,739 s a 1024×1024 en RTX 5090; 8 pasos | qwen-research | HuggingFace (16,1 GB de repo) |
| Qwen/Qwen-Image-2.1-Turbo (BF16 original) | Misma arquitectura | Misma salida | Misma calidad de referencia; sin cuantizar | qwen-research | HuggingFace |
| Comfy-Org/Qwen-Image-2.1 (BF16 fuente nativa) | Misma arquitectura, revision `a3c1a9e2efcba96124a9dc8600c0c07d6f5e68aa` | Misma salida | Checkpoint fuente del que parte esta cuantizacion | qwen-research | HuggingFace |
| BennyDaBall/Qwen-Image-2.1-NVFP4 (sin Turbo) | Version NVFP4 de Qwen-Image-2.1 | Misma salida | Paquete de 12,42 GB; version no Turbo, sin plan de 8 pasos | qwen-research | HuggingFace |

No se dispone de benchmarks cuantitativos que permitan comparar calidad de imagen entre estas variantes mas alla de las rejillas de comparacion visual del autor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos del modelo original ni de esta cuantizacion; al ser una compresion del checkpoint de Qwen, hereda los sesgos del dataset de entrenamiento original, que no se detalla.
- Riesgo de degradacion por cuantizacion: la cuantizacion selectiva a NVFP4 puede introducir diferencias perceptibles frente al BF16 en ciertos prompts o semillas. El autor publica rejillas comparativas, pero no metricas objetivas.
- Alucinacion visual: como cualquier modelo de difusion, puede generar texto ilegible en tipografia compleja o elementos anatomicos incorrectos; conviene revisar las salidas antes de usarlas en produccion.
- Limitaciones de idioma: la model card no especifica idiomas soportados; el rendimiento con prompts en castellano no esta documentado explicitamente, aunque el encoder Qwen3-VL-8B es multilingue.
- Restricciones de licencia: la licencia es qwen-research (`license: other`), no una licencia permisiva estandar. Es imprescindible revisar los terminos antes de un uso comercial; el propio autor remite al LICENSE y al NOTICE del modelo fuente.
- Dependencia de hardware: el rendimiento declarado (1,739 s por imagen) se obtuvo en RTX 5090 con NVFP4 nativo. En GPUs sin soporte NVFP4, el fallback a matmul en precision completa puede reducir la velocidad y aumentar el consumo de memoria.
- Dependencia de la version de ComfyUI: los flujos estan probados unicamente en ComfyUI 0.39.0 sin modificar; cambios futuros de version o de nodos pueden alterar el comportamiento.
- Mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Fuente nativa BF16: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Checksums del paquete: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4/resolve/main/SHA256SUMS
- Comparaciones de imagen: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-Turbo-NVFP4/blob/main/COMPARISONS.md
- Version NVFP4 sin Turbo: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4
- Ficha del modelo base en QwenCloud: https://www.qwencloud.com/models/qwen-image-2.1-turbo
- Analisis del modelo base (explainx.ai): https://www.explainx.ai/blog/qwen-image-2-1-turbo-8-step-7b-open-checkpoint-diffusers-how-to-run-2026
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
