# Comfy-Org/Qwen3-VL

## Resumen

Comfy-Org/Qwen3-VL es un repositorio de redistribución de los pesos de los modelos Qwen3-VL-4B-Instruct y Qwen3-VL-8B-Instruct de Alibaba Qwen, reempaquetados en formato `diffusion-single-file` para su uso como codificadores de texto (text encoders) dentro de ComfyUI. No se trata de un modelo nuevo ni de un fine-tune: es un repack de los pesos originales en ficheros `.safetensors` listos para colocarse en `ComfyUI/models/text_encoders/`, con variantes de cuantización (bf16, fp8, int8, w4a8 y nvfp4) orientadas a reducir el consumo de VRAM en el pipeline de difusión.

El modelo subyacente, Qwen3-VL, es una familia multimodal de tipo vision-language (comprensión de imagen y vídeo más generación de texto) construida sobre la arquitectura transformer de Qwen3. La variante 4B-Instruct y la 8B-Instruct son las versiones densas de instrucciones, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en dos factores: por un lado, la adopción masiva del repo (más de 1,2 millones de descargas) refleja que ComfyUI se ha convertido en la vía estándar para integrar codificadores de texto de última generación en flujos de generación de imagen y vídeo; por otro, las variantes cuantizadas a 4 y 8 bits permiten ejecutar un codificador de 8B en GPUs de consumo, algo impensable con los pesos en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) de la familia Qwen3-VL |
| Parametros totales | 4B (variante 4B-Instruct) y 8B (variante 8B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16, fp8 scaled, int8 convrot, w4a8, nvfp4 (solo variantes 8B para las tres ultimas; 4B en bf16 y fp8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, layout ComfyUI) |
| Tamano del repo | 64,2 GB (incluye todas las variantes) |
| Modelos base | Qwen/Qwen3-VL-4B-Instruct, Qwen/Qwen3-VL-8B-Instruct |
| Libreria declarada | diffusion-single-file |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo: redistribuye los pesos de Qwen3-VL-4B-Instruct y Qwen3-VL-8B-Instruct, que son transformers densos multimodales de la familia Qwen3. La capa de visión procesa imágenes y vídeo y proyecta las representaciones al espacio del decoder de lenguaje, que genera texto condicionado por el prompt y el contenido visual. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La innovación relevante de este repo es de empaquetado e inferencia, no de arquitectura: los pesos se han convertido a ficheros únicos `.safetensors` compatibles con el cargador de text encoders de ComfyUI, y se ofrecen variantes cuantizadas (fp8 con escalado, int8 con rotación de canales, w4a8 y nvfp4) que reducen el footprint de memoria a costa de precisión numérica. No se documentan técnicas como decodificación especulativa ni atención lineal en la información proporcionada.

## Capacidades

- Comprensión de imagen y vídeo combinada con generación de texto (modelo vision-language).
- Generación de texto e instrucciones en modo chat (variantes `-Instruct`).
- Actúa como codificador de texto/condicionamiento en pipelines de ComfyUI para modelos de difusión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada para estas variantes.
- Razonamiento multi-paso y modo agentes: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Codificador de texto en flujos de generación de imagen en ComfyUI: se coloca el `.safetensors` en `models/text_encoders/` y se conecta al nodo de condicionamiento del pipeline de difusión; las variantes fp8 e int8 reducen la VRAM necesaria frente a bf16.
- Generación de vídeo en ComfyUI con condicionamiento textual enriquecido: el modelo aporta representaciones semánticas de mayor calidad que codificadores más pequeños, útil en pipelines de vídeo donde el prompt describe escenas complejas.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: la variante `qwen3vl_8b_nvfp4` o `qwen3vl_8b_w4a8` permite cargar un codificador de 8B en GPUs con 16-24 GB de VRAM.
- Investigación en edición de imagen guiada por lenguaje: al ser un VLM, puede emplearse para generar descripciones o instrucciones intermedias que alimenten etapas posteriores del pipeline.
- Evaluación comparativa de cuantizaciones: el repo ofrece cinco formatos numéricos del mismo modelo, lo que facilita medir el impacto de fp8, int8, w4a8 y nvfp4 en la calidad final de la imagen generada.
- Integración en flujos automatizados de ComfyUI vía API: el formato single-file simplifica el despliegue en contenedores y la reproducibilidad de entornos, al no depender de múltiples shards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; orientativamente, un 8B en bf16 ronda los 16 GB de pesos, en fp8 unos 8 GB, y en w4a8/nvfp4 alrededor de 4-5 GB, más el overhead de activaciones y del resto del pipeline de ComfyUI.
- GPU recomendadas: no especificadas por el autor. Para bf16 se requiere una GPU de 24 GB o superior (RTX 3090/4090, A100, H100); para fp8, GPUs con soporte nativo (H100, RTX 40xx); para w4a8/nvfp4, GPUs Ada o Blackwell.
- GPU de consumo: las variantes cuantizadas del 8B y las bf16/fp8 del 4B son las opciones realistas en GPUs de 8-24 GB.
- Despliegue: ComfyUI (librería declarada `diffusion-single-file`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Comfy-Org/Qwen3-VL (este repo) | 4B / 8B | no disponible | Apache 2.0 | safetensors single-file (bf16, fp8, int8, w4a8, nvfp4) | Repack para ComfyUI de Qwen3-VL |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | Apache 2.0 | safetensors (formato original) | Modelo original, no orientado a ComfyUI |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | Apache 2.0 | safetensors (formato original) | Modelo original, requiere conversión para ComfyUI |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un repack, no un modelo entrenado por Comfy-Org: cualquier limitación del Qwen3-VL original aplica íntegramente.
- Las cuantizaciones (fp8, int8, w4a8, nvfp4) pueden degradar la calidad del condicionamiento y, por tanto, la fidelidad de la imagen o vídeo generado; conviene validar cada variante en el pipeline concreto.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que los términos del modelo base se mantienen y citarse adecuadamente.
- El repo pesa 64,2 GB; descargar solo la variante necesaria para evitar consumo innecesario de disco.
- Depende de una versión de ComfyUI que soporte el cargador de text encoders de Qwen3-VL; versiones antiguas pueden no reconocer los ficheros.
- No hay garantía de compatibilidad con frameworks fuera de ComfyUI sin conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Qwen3-VL
- Modelo base 4B: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo base 8B: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
