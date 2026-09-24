# Nurymanau/Packed-Image-MLX

## Resumen

Packed-Image-MLX es un port experimental de ejecución para Apple Silicon del transformer de imagen Qwen-Image-2.1 (cuantización Q4_K_M de Unsloth) junto con el codificador de texto Qwen3-VL-8B UD-Q4_K_XL. Lo publica el usuario Nurymanau y se apoya en las clases de arquitectura de MFLUX y en los kernels Metal de mlx-kquant para funcionar sobre el framework MLX. No es un modelo nuevo: los tensores empaquetados se copian byte a byte desde los ficheros GGUF de Unsloth, sin reentrenamiento ni segunda pasada de cuantización.

El problema que aborda es la ejecución local de un pipeline text-to-image de Qwen sobre Mac, un terreno donde las pilas CUDA habituales no están disponibles. Su aportación técnica es mezclar codecs GGUF dentro de un pipeline de generación de imágenes en MLX, con un mapeo exacto de tensores origen-destino (incluidas matrices fusionadas gate/up), un codificador de texto con streaming por capas, un transformer de imagen residente y un formato packed propio en safetensors shardeados con hashes y verificador.

El repositorio ocupa unos 9,52 GB y los tensores de inferencia exportados suman 8.831.774.720 bytes antes de VAE, tokenizer y metadatos. La release es experimental, con 0 descargas y 0 likes en el momento de redactar la ficha, y solo cualifica el caso text-to-image. La licencia del modelo de imagen es la Qwen Research License Agreement, con restricción de uso no comercial; el codificador de texto conserva términos Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image: transformer de imagen de Qwen-Image-2.1 más codificador de texto Qwen3-VL-8B, ejecutados sobre MLX con clases MFLUX y kernels Metal de mlx-kquant. Detalle interno de la arquitectura: no disponible |
| Parámetros totales | no disponible (los tensores de inferencia exportados suman 8.831.774.720 bytes, pero el autor advierte que el recuento automático de elementos de tensores U8 empaquetados no debe interpretarse como el número de parámetros lógicos). Codificador de texto: 8B |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M en el transformer de imagen, UD-Q4_K_XL en el codificador de texto, codecs GGUF mixtos, tensores empaquetados U8 y kernels mlx-kquant |
| Idiomas soportados | en (inglés) |
| Licencia | Imagen: Qwen Research License Agreement (uso no comercial, solo investigación/evaluación). Codificador de texto: Apache-2.0. Código adaptador y dependencias: licencias propias (adaptador MIT) |
| Formato de pesos | Safetensors empaquetados y shardeados en formato packed propio; fuentes originales en GGUF |

## Arquitectura y entrenamiento

La release es un port de ejecución, no un entrenamiento. El autor indica que los tensores empaquetados se copian byte a byte desde los GGUF fijados de Unsloth, sin reentrenamiento y sin una segunda pasada de cuantización. La pila combina dos piezas: un transformer de imagen derivado de Qwen-Image-2.1 (cuantización Q4_K_M) que se mantiene residente en memoria, y un codificador de texto Qwen3-VL-8B (cuantización UD-Q4_K_XL) que funciona con streaming por capas para reducir el consumo de memoria unificada.

Entre las innovaciones que declara la model card están el uso de codecs GGUF mixtos dentro de un pipeline de generación de imágenes en MLX, un mapeo de tensores exacto entre origen y destino que incluye matrices fusionadas gate/up, un formato packed propio en safetensors shardeados con hashes de origen y verificador, y un runner con guarda de memoria y comprobaciones independientes de codec y bloque. No hay datos sobre composición del dataset, número de tokens ni fases de RLHF o DPO, porque no se ha realizado entrenamiento en esta release. No se dispone de detalles adicionales sobre la arquitectura interna del transformer de imagen más allá de lo indicado.

## Capacidades

- Generación de texto a imagen: es el único caso cualificado explícitamente por el autor. Se ha probado con resoluciones de 512 y número de pasos configurable (por ejemplo, 40 pasos con `vae-tiling`).
- Renderizado de rótulos y texto dentro de la imagen: el repositorio incluye un ejemplo específico de lettering (`examples/mlx-lettering-16.png`).
- Generación de imágenes de producto: hay un ejemplo de referencia (`examples/product-40steps.png`).
- Ejecución local en Apple Silicon mediante MLX, con kernels Metal de mlx-kquant y clases de arquitectura MFLUX.
- Codificación de prompts en inglés a través del codificador Qwen3-VL-8B con streaming por capas.
- Reproducibilidad y verificación: safetensors shardeados sin pérdida, hashes de origen, script verificador y comparación con el GGUF original (`QUALITY.md`).
- No cualificado por el autor: edición de imágenes, LoRA, otras cuantizaciones, otras resoluciones y otro hardware distinto del probado.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso, ya que no es un modelo de lenguaje conversacional.

## Casos de uso

- Prototipado local de generación de imágenes en Mac: permite ejecutar un pipeline text-to-image de Qwen sin GPU NVIDIA ni servicios en la nube, usando MLX sobre memoria unificada. Es adecuado para desarrolladores que trabajan exclusivamente en Apple Silicon.
- Investigación sobre cuantización y formatos empaquetados: al mezclar codecs GGUF (Q4_K_M y UD-Q4_K_XL) en MLX con tensores U8 empaquetados, sirve para estudiar mapeo de tensores, kernels Metal y verificación de artefactos.
- Evaluación de portabilidad entre backends: el repositorio incluye comparación con el GGUF original, lo que permite analizar diferencias de fidelidad entre la ejecución en MLX y la de referencia.
- Generación de imágenes de producto para documentación o prototipos no comerciales: el ejemplo incluido demuestra el flujo con 40 pasos; útil en fase de diseño cuando la licencia de investigación es aceptable.
- Renderizado de texto dentro de imagen: el ejemplo de lettering a 16 pasos muestra la capacidad de integrar rótulos legibles, aplicable a mockups y pruebas de tipografía.
- Reproducción y auditoría de artefactos: gracias a los hashes SHA256 y al verificador, se puede comprobar la integridad del conjunto descargado en entornos de investigación reproducibles.
- Docencia y experimentación en MLX: al ser un proyecto autocontenido con runner y ejemplos incluidos, resulta útil para enseñar cómo se adapta un pipeline de difusión a los kernels y al formato de pesos de MLX.
- Despliegue en portátil de gama de entrada: se ha probado en un MacBook Air M3 con 16 GiB de memoria unificada, lo que lo hace apto para entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite a `RESULTS.md` para mediciones reales, intentos fallidos y alcance de la verificación, y a `OPTIMIZATION.md` para la optimización medida del codificador, pero no se aportan cifras concretas (FID, CLIP, throughput, latencia) en los datos proporcionados. La única medición explícita es el tamaño de los tensores de inferencia exportados: 8.831.774.720 bytes antes de VAE, tokenizer y metadatos, y una descarga total de aproximadamente 9,52 GB.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con MLX. No hay soporte documentado para CUDA ni GPUs NVIDIA.
- Memoria: probado con 16 GiB de memoria unificada en un MacBook Air M3. No se especifica la VRAM mínima para otros equipos.
- Tamaño de descarga: aproximadamente 9,52 GB para el conjunto completo, con runner y código de verificación incluidos.
- Entorno probado: Python 3.11, MLX 0.32.1, mlx-kquant 0.4.13, arquitectura MFLUX 0.20.0 (commit `9ca480fd87fce5623e90878766c751d9140c4aa8`), macOS 26.6.2.
- Opciones de memoria: el runner admite `--vae-tiling`, y el codificador de texto usa streaming por capas para reducir la presión de memoria.
- Despliegue: se ejecuta mediante el runner incluido (`generate.py` y `benchmark.py`) junto con MFLUX y mlx-kquant. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este port de MLX.
- Latencia y throughput: no disponible. El `benchmark.py` permite medir con un `--timeout` configurable, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nurymanau/Packed-Image-MLX | Port MLX de Qwen-Image-2.1 + Qwen3-VL-8B | no disponible (8.831.774.720 bytes de tensores de inferencia) | no disponible | no disponible | Qwen Research (no comercial); codificador Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen-Image-2.1 | Modelo original text-to-image | no disponible | no disponible | no disponible | Qwen Research | HuggingFace (modelo base) |
| unsloth/Qwen-Image-2.1-GGUF | Cuantizaciones GGUF del modelo original | no disponible | no disponible | no disponible | Qwen Research | HuggingFace (fuente de los tensores) |
| Qwen3-VL-8B-Instruct | Modelo de visión-lenguaje usado como codificador de texto | 8B | no disponible | no disponible | Apache-2.0 | HuggingFace |

Los datos de rendimiento, parámetros y contexto de los modelos comparables no están disponibles en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no comercial: el modelo de imagen se rige por la Qwen Research License Agreement, que restringe el uso a investigación y evaluación. Cualquier uso comercial requiere una licencia upstream separada. El autor advierte explícitamente de que la licencia MIT del adaptador no autoriza el uso comercial del modelo de imagen.
- Release experimental: 0 descargas y 0 likes en el momento de la ficha; es un formato packed propio en fase temprana y no una distribución estable.
- Formato propietario: no basta con instalar MLX ni cargar los ficheros con el cargador de cuantización afín estándar de MFLUX. Es obligatorio usar el runner incluido.
- Alcance cualificado limitado: solo está cualificado text-to-image. Quedan sin cualificar la edición de imágenes, LoRA, otras cuantizaciones, otras resoluciones y otro hardware distinto del probado.
- Compatibilidad de hardware restringida: solo Apple Silicon con MLX; no hay soporte CUDA.
- Idioma: únicamente inglés.
- Recuento de parámetros no interpretable: los tensores U8 empaquetados almacenan bytes comprimidos, por lo que los recuentos automáticos de elementos no equivalen al número de parámetros lógicos.
- Sin datos de calidad ni de sesgos: no se aportan métricas de fidelidad, diversidad, sesgo ni tasas de artefactos. El autor no reclama superioridad frente a otros backends ni garantía de calidad universal; un resultado correcto demuestra solo una configuración en una máquina concreta.
- Riesgo de artefactos visuales y de fidelidad limitada al prompt: derivado de una cuantización Q4_K_M y de la propia naturaleza de los modelos de difusión. No se han publicado evaluaciones al respecto.
- Longitud de contexto: no disponible, lo que limita planificar prompts largos o composiciones complejas con garantías.
- VAE y tokenizer incluidos como activos separados sin modificar; no se han alterado ni recualificado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Nurymanau/Packed-Image-MLX
- Licencia del modelo: https://huggingface.co/Nurymanau/Packed-Image-MLX/blob/main/MODEL-LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Cuantización fuente del transformer de imagen: https://huggingface.co/unsloth/Qwen-Image-2.1-GGUF
- Cuantización fuente del codificador de texto: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- MFLUX (clases de arquitectura): https://github.com/mflux-community/mflux
- Framework MLX: https://mlx-framework.org/
- MLX Community en HuggingFace: https://huggingface.co/mlx-community
- mlx-image: https://github.com/riccardomusmeci/mlx-image
- MLX Studio: https://mlx.studio/
- mlx-gen: https://github.com/lpalbou/mlx-gen
