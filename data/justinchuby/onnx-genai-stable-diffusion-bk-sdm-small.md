# justinchuby/onnx-genai-stable-diffusion-bk-sdm-small

## Resumen

Este repositorio contiene una exportación a ONNX del modelo **BK-SDM-Small** (Block-removed Knowledge-distilled Stable Diffusion), un modelo de generación de imágenes texto a imagen desarrollado originalmente por Nota AI y exportado a formato ONNX por Justin Chu (justinchuby) mediante su herramienta **Mobius**. El modelo original comprime la arquitectura de Stable Diffusion v1.4 eliminando varios bloques residuales y de atención del U-Net, y se destila previamente con solo 0.22 millones de pares de la dataset LAION (menos del 0.1% del conjunto completo de entrenamiento), lo que permite imitar al modelo completo con un coste computacional mucho menor.

La exportación ONNX está diseñada para ejecutarse con el runtime **ONNX GenAI**, un prototipo en Rust que ofrece una API compatible con A1111 (Automatic1111), lo que facilita su integración en entornos de producción y en aplicaciones que ya usan ONNX Runtime. El paquete incluye el modelo completo (text encoder CLIP, U-Net comprimido y VAE), con un peso total de 2.5 GB en formato ONNX, y se distribuye bajo la licencia CreativeML OpenRAIL-M, que permite uso comercial con restricciones.

Este modelo es relevante para desarrolladores que buscan una alternativa eficiente a Stable Diffusion v1.4 para despliegues en entornos con recursos limitados (GPUs de gama media, inferencia en CPU o edge), manteniendo la calidad de imagen razonable y un pipeline estándar de difusión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion v1.4 comprimido (U-Net con bloques residuales y de atención eliminados, text encoder CLIP y VAE sin cambios) |
| Parámetros totales | 0.66B (0.49B en el U-Net comprimido) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | 77 tokens (text encoder CLIP) |
| Tipos de cuantización | No disponible (pesos ONNX, formato original FP32/FP16) |
| Idiomas soportados | Inglés (CLIP text encoder) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo BK-SDM-Small se basa en la arquitectura de Stable Diffusion v1.4, compuesta por un text encoder CLIP, un U-Net denoising y un VAE. La compresión se logra eliminando varios bloques residuales y de atención del U-Net original, reduciendo su número de parámetros de 0.86B a 0.49B. Además, el modelo se entrena mediante destilación de conocimiento sobre solo 0.22M pares de imágenes de LAION (dataset `ChristophSchuhmann/improved_aesthetics_6.5plus`), lo que permite transferir el conocimiento del modelo original con un coste de entrenamiento muy reducido.

La exportación ONNX se realizó con Mobius, una herramienta de conversión de modelos a ONNX. El runtime ejecutado usa un scheduler DDIM (predicción de epsilon), mientras que los assets del scheduler PNDM original se mantienen sin cambios en el repositorio (no se han relabelizado). El paquete incluye metadatos de inferencia (inference_metadata.yaml) en formato hashless, y se proporcionan evidencias de ejecución con el runner de Mobius y con la API genérica de ONNX GenAI.

## Capacidades

- **Generación de imágenes texto a imagen**: genera imágenes de 512×512 píxeles a partir de prompts textuales en inglés.
- **Inferencia eficiente**: el U-Net comprimido reduce el coste computacional respecto a Stable Diffusion v1.4, permitiendo ejecución en hardware más modesto.
- **Compatibilidad con ONNX Runtime**: exportado a ONNX, puede ejecutarse con el runtime ONNX GenAI (Rust) y ONNX Runtime estándar, así como con la API A1111 (Automatic Diffusion) para integración con interfaces web.
- **Scheduler DDPM**: usa el scheduler DDPM (epsilon prediction) para la generación, con opción de usar el scheduler PNDM original si se configuran los assets.
- **No soporta tool calling, razonamiento multi-step ni agentes**: es un modelo de imagen, no un LLM.

## Casos de uso

- **Generación de imágenes en entornos con recursos limitados**: el modelo cabe en GPUs de gama media (4-8 GB VRAM) y puede ejecutarse en CPU, ideal para prototipos o despliegues en edge.
- **Servicio de inferencia con API A1111**: se puede levantar un servidor con `onnx-genai-cli serve` que expone una API compatible con Automatic1111, permitiendo integrarlo en herramientas de generación de imágenes existentes.
- **Despliegue en producción con ONNX Runtime**: gracias al formato ONNX, se puede usar ONNX Runtime en aplicaciones C#, Python, Java o C++, como se muestra en el blog de Microsoft para generar imágenes con Stable Diffusion en .NET.
- **Reducción de costes en pipelines de generación**: al tener un U-Net más pequeño que SD v1.4, reduce el coste de inferencia y la latencia en servicios de generación de imágenes.
- **Investigación en compresión de modelos**: como punto de partida para experimentos con destilación de conocimiento y pruning de U-Nets en difusión.
- **Generación de imágenes para diseño gráfico y contenido creativo**: se puede usar para generar imágenes de referencia, bocetos o ilustraciones de baja resolución que luego se pueden ampliar o editar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye archivos de evidencia de ejecución (`execution_evidence.json` y `generic_runtime_evidence.json`) con tiempos y memoria pico, pero no se proporcionan datos comparativos de calidad de imagen (FID, CLIP score) ni latencia media.

## Requisitos de hardware

- **VRAM estimada**: con pesos en FP32, el modelo completo (0.66B) requiere aproximadamente 2.5-3 GB de VRAM para inferencia; en FP16, se reduce a ~1.5-2 GB. El repo de 2.5 GB incluye todos los componentes (text encoder, VAE, U-Net).
- **GPU recomendadas**: GPU con 4 GB de VRAM o más (GTX 1650 Super, RTX 3060, RTX 4060, A100, H100, etc.). Es viable en GPUs consumer de gama media.
- **CPU**: se puede ejecutar en CPU con tiempos mayores, pero no se recomienda para producción sin optimización adicional.
- **Opciones de despliegue**: ONNX Runtime GenAI (Rust), ONNX Runtime estándar (C++, Python, C#), y servidor con API A1111.
- **Latencia y throughput**: no se proporcionan datos de latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | U-Net | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| **BK-SDM-Small (ONNX)** | 0.66B | 0.49B | 77 tokens | CreativeML OpenRAIL-M | ONNX |
| **Stable Diffusion v1.4** | 1.04B | 0.86B | 77 tokens | CreativeML OpenRAIL-M | PyTorch / ONNX |
| **BK-SDM-Base** | 0.76B | 0.58B | 77 tokens | CreativeML OpenRAIL-M | PyTorch |
| **BK-SDM-Tiny** | 0.50B | 0.33B | 77 tokens | CreativeML OpenRAIL-M | PyTorch |

La comparativa muestra que BK-SDM-Small es intermedio en tamaño entre la Base y la Tiny. El formato ONNX de este repositorio es una ventaja para despliegues con ONNX Runtime, mientras que los modelos originales de Notaai se distribuyen en formato PyTorch (diffusers). El rendimiento en calidad de imagen es inferior al de SD v1.4, pero el coste computacional es significativamente menor.

## Limitaciones y advertencias

- **Licencia CreativeML OpenRAIL-M**: impide el uso para generar contenido ilegal o dañino, y exige que los redistribuidores incluyan las restricciones de uso y la atribución. El uso comercial está permitido, pero con obligaciones de cumplimiento.
- **Calidad de imagen inferior**: al ser un modelo comprimido y destilado, la calidad de imagen es menor que la de Stable Diffusion v1.4 original, con menos detalles y posible pérdida de fidelidad en prompts complejos.
- **Dataset de entrenamiento limitado**: solo 0.22M pares de LAION, lo que puede generar sesgos en los conceptos representados y menor cobertura de estilos.
- **Idioma**: el text encoder CLIP está entrenado principalmente en inglés; los prompts en otros idiomas pueden dar resultados subóptimos.
- **Contexto de prompt limitado**: el text encoder CLIP acepta solo 77 tokens, por lo que los prompts largos se truncan.
- **Scheduler DDIM**: el runtime usa scheduler DDIM por defecto, lo que puede requerir más pasos de denoising para obtener calidad equivalente a PNDM; el usuario debe configurar adecuadamente los pasos.
- **Sin garantías de soporte**: es un repositorio experimental (prototipo de ONNX GenAI) y puede no recibir mantenimiento activo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/justinchuby/onnx-genai-stable-diffusion-bk-sdm-small
- Modelo original BK-SDM-Small: https://huggingface.co/nota-ai/bk-sdm-small
- Paper BK-SDM: https://arxiv.org/abs/2305.15798
- GitHub del proyecto BK-SDM: https://github.com/Nota-NetsPresso/BK-SDM
- Demo de BK-SDM: https://huggingface.co/spaces/nota-ai/compressed-stable-diffusion
- Repositorio ONNX GenAI (runtime en Rust): https://github.com/justinchuby/onnx-genai
- Colección de ejemplos de metadatos de inferencia: https://huggingface.co/collections/justinchuby/onnx-genai-inference-metadata-examples
- Blog de Microsoft sobre Stable Diffusion con ONNX Runtime y C#: https://devblogs.microsoft.com/dotnet/generate-ai-images-stable-diffusion-csharp-onnx-runtime/
