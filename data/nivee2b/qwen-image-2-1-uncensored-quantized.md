# Nivee2B/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1 Uncensored Quantized es una colección de cuantizaciones del modelo de generación de imágenes por texto Qwen-Image-2.1, publicado por el usuario Nivee2B en Hugging Face. El modelo base original es Qwen/Qwen-Image-2.1, desarrollado por el equipo de Qwen (Alibaba), y esta versión redistribuye los pesos originales en formatos comprimidos (GGUF, safetensors FP8/INT8/NVFP4 y MLX) para facilitar su ejecución local sin necesidad de hardware de gama alta.

El repositorio se dirige a usuarios de ComfyUI que quieren generar imágenes localmente: incluye no solo el transformer de difusión cuantizado en múltiples niveles (desde BF16 completo hasta Q4_0), sino también los archivos complementarios necesarios (codificador de texto Qwen3-VL 8B y VAE), empaquetados y listos para usar. La etiqueta "Uncensored" indica que se trata de una variante sin los filtros de moderación del modelo original, lo que conlleva consideraciones éticas y legales importantes.

Con aproximadamente 7.115 millones de parámetros en el componente de difusión (dato de los safetensors reales) y soporte de cuantizaciones de 4 bits, el modelo puede ejecutarse en GPUs de consumo con 6-8 GB de VRAM, lo que lo hace relevante para la comunidad de generación de imágenes local en 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (transformer de difusión con codificador de texto Qwen3-VL 8B y VAE) |
| Parametros totales | 7.115.124.736 (componente de difusión) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (el codificador Qwen3-VL 8B es multilingue) |
| Licencia | qwen-research (otra, no comercial estándar) |
| Formato de pesos | GGUF, safetensors, MLX |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 sigue la arquitectura típica de los sistemas text-to-image modernos: un transformer de difusión (el componente de ~7,1 mil millones de parámetros cuantizado aquí), un codificador de texto basado en Qwen3-VL 8B que procesa los prompts (con capacidad multimodal, según sugiere la variante VL) y un VAE de 676 MB que comprime las imágenes al espacio latente. Esta separación en tres componentes es la razón por la que el repositorio distribuye los tres archivos por separado para ComfyUI.

Sobre el proceso de entrenamiento del modelo base (número de tokens o imágenes, composición del dataset, uso de RLHF u otras técnicas de alineación) no se ha publicado información en la model card disponible. Tampoco se detalla el método de "uncensoring" aplicado: la model card solo indica que se usan los pesos originales upstream del modelo base, por lo que la diferencia respecto a la versión oficial podría residir en la omisión de mecanismos de seguridad en el pipeline de inferencia. Este punto no está documentado y debe tratarse con cautela.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image)
- Comprensión de prompts mediante un codificador de texto multimodal (Qwen3-VL 8B), lo que sugiere buen seguimiento de instrucciones complejas
- Ejecución local con diferentes niveles de cuantización según el hardware disponible
- Compatibilidad con ComfyUI y ComfyUI-GGUF mediante el fork mantenido de leejet
- Soporte nativo para Apple Silicon mediante los formatos MLX (4, 6 y 8 bits)
- Soporte de GPUs NVIDIA con formatos optimizados (FP8, NVFP4, INT8 ConvRot)
- Sin filtros de moderación documentados (variante "Uncensored")

## Casos de uso

- Generación artística local: crear ilustraciones y conceptos visuales en un equipo personal sin depender de servicios en la nube, usando la cuantización Q4_K_M (4,6 GB) como equilibrio recomendado entre tamaño y calidad.
- Prototipado creativo en ComfyUI: integrar el modelo en workflows node-based para iterar prompts, semillas y parámetros de muestreo de forma reproducible.
- Generación en Apple Silicon: usar los archivos MLX 4-bit o 6-bit para generar imágenes en Macs con chips M-series, donde los formatos GGUF/CUDA no son óptimos.
- Uso en GPUs con soporte FP8/NVFP4: aprovechar las cuantizaciones FP8 y NVFP4 en GPUs modernas de NVIDIA (serie 40/50 o Hopper) para obtener mayor velocidad de inferencia con pérdida mínima de calidad.
- Sistemas con VRAM limitada: ejecutar el modelo en GPUs de consumo con 6-8 GB de VRAM gracias a las cuantizaciones Q4_0 (4,15 GB) o NVFP4 (4,2 GB), dejando memoria para el codificador de texto en INT8.
- Investigación en difusión local: estudiar el comportamiento del modelo a distintos niveles de cuantización comparando salidas entre BF16 y versiones comprimidas.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmark del modelo base (assets/Qwen-Image-2.1-Benchmark.png), pero no se proporcionan los datos numéricos en formato texto en la información disponible, por lo que no es posible reproducirlos aquí con rigor.

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, FID, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer de difusión: desde ~4,2 GB (NVFP4 o Q4_0) hasta ~14,2 GB (BF16). A esto hay que sumar el codificador de texto: 17,5 GB en BF16 o 9,35 GB en INT8 ConvRot (recomendado para equipos con menos memoria), más ~0,7 GB del VAE.
- Configuración mínima realista: una GPU con 12 GB de VRAM usando Q4_K_M + codificador INT8; con offloading al disco, posible en configuraciones de 8 GB.
- GPUs recomendadas: RTX 4090/5090 (soporte FP8 y NVFP4), RTX 3060/4060 Ti de 16 GB para las cuantizaciones Q4/Q5, y Apple Silicon (M1/M2/M3/M4) con al menos 16-24 GB de memoria unificada para los formatos MLX.
- Cabe en GPUs de consumo: sí, con las cuantizaciones de 4 bits en GPUs de 12 GB o superiores.
- Despliegue: ComfyUI con el plugin ComfyUI-GGUF (fork de leejet con soporte nativo de Qwen-Image 2.1). No se menciona soporte para vLLM, llama.cpp standalone, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (difusion) | Formatos | Licencia | Notas |
|---|---|---|---|---|
| Qwen-Image-2.1 (base oficial) | ~7,1 mil millones | safetensors | qwen-research | Version original con politicas de uso del proveedor |
| Qwen-Image-2.1 Uncensored Quantized (esta ficha) | ~7,1 mil millones | GGUF, safetensors, MLX | qwen-research | Cuantizaciones multiples + variante sin filtros documentados |
| FLUX.1-dev (Black Forest Labs) | ~12 mil millones | safetensors, GGUF (comunidad) | no comercial | Alternativa dominante en generacion local, mayor tamaño |

Comparaciones cuantitativas de rendimiento no disponibles en la información proporcionada.

## Limitaciones y advertencias

- La licencia qwen-research es una licencia "other" que no es una licencia comercial estándar: revisa sus términos antes de cualquier uso comercial o de producción.
- La variante "Uncensored" elimina o elude las salvaguardas del modelo original, lo que plantea riesgos legales y éticos significativos: puede generar contenido ofensivo, no ético o ilegal según la jurisdicción. El autor del repo no documenta el método exacto aplicado.
- No hay documentación sobre el entrenamiento del modelo base ni sobre la calidad de las cuantizaciones frente al original (solo una recomendación cualitativa de Q4_K_M).
- Los datos de benchmark solo están disponibles como imagen, sin cifras verificables en texto.
- El modelo requiere archivos complementarios (codificador de texto de hasta 17,5 GB en BF16), lo que incrementa notablemente los requisitos totales de almacenamiento y VRAM respecto al transformer alone.
- Descargas muy bajas (198) y un solo like en el momento de la ficha: es un repositorio comunitario reciente, sin auditoría de terceros; verifica la integridad de los archivos antes de usarlos en producción.
- Posible error "Unknown model architecture!" si se usa el fork antiguo city96/ComfyUI-GGUF en lugar del fork de leejet.
- Riesgo de alucinación visual (anatomía incorrecta, texto ilegible en imágenes): inherente a los modelos de difusión, no cuantificado en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nivee2B/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork con soporte nativo): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork original): https://github.com/city96/ComfyUI-GGUF
