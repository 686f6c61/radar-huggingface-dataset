# dat43dguys/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario dat43dguys (con referencias en la model card al espacio abenzerps). Se trata de un modelo de texto-a-imagen (text-to-image) empaquetado en múltiples formatos de cuantización —GGUF, safetensors FP8/INT8/NVFP4 y MLX— pensado para inferencia local en ComfyUI y en Apple Silicon. El repositorio incluye además los componentes auxiliares necesarios (text encoder Qwen3-VL de 8B y VAE) para que el flujo funcione de extremo a extremo sin descargas adicionales.

El modelo base cuenta con 7.115.124.736 parámetros según los pesos safetensors del repo, y el conjunto completo ocupa 105,2 GB, lo que refleja la suma de todas las variantes de cuantización más los ficheros auxiliares. La etiqueta "Uncensored" indica que se ha eliminado o relajado el filtrado de contenido del modelo original, un aspecto relevante tanto para casos de uso creativo como por las implicaciones legales y de moderación que conlleva.

Su relevancia actual radica en que permite ejecutar un generador de imágenes de gran tamaño en hardware de consumo mediante cuantizaciones de 4 a 8 bits, con variantes específicas para GPUs NVIDIA modernas (NVFP4, INT8 ConvRot) y para chips Apple (MLX). No obstante, la licencia qwen-research impone restricciones importantes para uso comercial que conviene revisar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image; detalles del transformer no especificados en la model card) |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX), BF16 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del transformer de difusion ni los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación). Lo que sí se deduce de los ficheros publicados es la composición del pipeline: un modelo de difusión principal (Qwen-Image-2.1, 7,1 mil millones de parámetros) acompañado de un text encoder basado en Qwen3-VL de 8B (disponible en BF16, 17,53 GB, o INT8 ConvRot, 9,35 GB) y un VAE propio (qwen_image_2.1_vae_bf16, 676 MB). Esta separación en tres componentes es típica de los pipelines de difusión modernos y es la que ComfyUI espera encontrar en sus directorios `diffusion_models`, `text_encoders` y `vae`.

La innovación principal de esta redistribución no está en el entrenamiento sino en el empaquetado: ofrece cuantizaciones que reducen el modelo principal desde 14,23 GB en BF16 hasta 4,00 GB en MLX 4-bit o 4,15 GB en GGUF Q4_0, manteniendo variantes de alta fidelidad como Q8_0 (7,59 GB) y FP8 (6,63 GB). Se incluyen formatos específicos para hardware: NVFP4 (4,20 GB) para GPUs NVIDIA con soporte de punto flotante de 4 bits, INT8 ConvRot (6,76 GB) como alternativa de 8 bits y MLX para Apple Silicon. El autor recomienda Q4_K_M como mejor equilibrio tamaño/calidad en GGUF. No se especifican técnicas de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline de difusión.
- Integración nativa con ComfyUI a través del nodo ComfyUI-GGUF (fork de leejet), lo que permite construir flujos de trabajo nodales con el modelo cuantizado.
- Soporte de cuantizaciones para distintos backends: GGUF para llama.cpp/ComfyUI-GGUF, safetensors FP8/INT8/NVFP4 para GPUs NVIDIA y MLX para Apple Silicon.
- Text encoder multimodal basado en Qwen3-VL 8B, que aporta comprensión de prompts complejos (la model card no detalla si acepta entrada de imagen además de texto).
- Variante "Uncensored" que, según el autor, elimina el filtrado de contenido del modelo base, permitiendo generar temáticas que el modelo original rechazaría.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni generación de código o matemáticas, al ser un modelo de imagen y no de lenguaje.

## Casos de uso

- Generación de arte conceptual y bocetos: el modelo permite iterar rápidamente sobre ideas visuales en local con ComfyUI, usando la cuantización Q4_K_M (4,60 GB) para mantener tiempos de carga bajos en GPUs de consumo.
- Ilustración para proyectos creativos sin restricciones temáticas: la variante "Uncensored" está pensada para artistas que necesitan explorar estilos o contenidos que el modelo original filtraría, siempre que la licencia y la legislación aplicable lo permitan.
- Prototipado de pipelines de imagen en investigación: la disponibilidad de múltiples cuantizaciones (FP8, NVFP4, INT8, MLX) permite comparar calidad frente a coste computacional en distintos hardwares dentro de un mismo experimento.
- Despliegue en Apple Silicon: las variantes MLX 4/6/8-bit (4,00–7,56 GB) permiten ejecutar el modelo en Macs con memoria unificada, algo inviable con el BF16 de 14,23 GB en equipos de gama media.
- Generación de assets para videojuegos o entornos 3D: el modelo puede producir texturas, sprites o referencias visuales de forma local, evitando depender de APIs externas y sus costes por llamada.
- Flujos de trabajo por lotes en estaciones de trabajo con GPU NVIDIA: la variante NVFP4 (4,20 GB) o INT8 ConvRot (6,76 GB) aprovecha las instrucciones de baja precisión de GPUs recientes para maximizar throughput en generación masiva de imágenes.
- Educación y demostraciones técnicas: al incluir todos los componentes (transformer, text encoder y VAE) en un único repositorio, resulta útil para enseñar cómo se monta un pipeline de difusión completo en ComfyUI.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) con resultados del modelo base, pero no se proporcionan los valores numéricos en texto. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo principal: aproximadamente 14,23 GB en BF16, 6,63–7,59 GB en FP8/INT8/Q8_0, 4,15–5,88 GB en cuantizaciones GGUF Q4/Q5/Q6 y 4,00–7,56 GB en MLX.
- El text encoder añade carga adicional: 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot, más 676 MB del VAE. Para un despliegue completo conviene sumar ambas cifras o usar el text encoder INT8.
- GPU recomendadas: NVIDIA con soporte de FP8 o NVFP4 para las variantes correspondientes (generaciones recientes); GPUs con al menos 8–12 GB de VRAM pueden ejecutar las cuantizaciones GGUF Q4/Q5 junto con el text encoder INT8.
- Cabe en GPU de consumo: sí, con las cuantizaciones bajas (Q4_K_M, Q4_0, MLX 4-bit) y el text encoder INT8; las variantes BF16 requieren GPUs de gama alta o profesionales.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (fork de leejet, con soporte nativo de Qwen-Image 2.1), y en Apple Silicon mediante MLX. No se documentan otros backends como vLLM, TGI o llama.cpp directo en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría (otros modelos text-to-image de ~7B parámetros). Los datos disponibles solo permiten comparar variantes internas del propio repositorio:

| Variante | Tamano | Uso recomendado |
|---|---|---|
| BF16 GGUF | 14,23 GB | Máxima fidelidad, hardware con VRAM abundante |
| FP8 safetensors | 6,63 GB | GPUs NVIDIA con soporte FP8 |
| INT8 ConvRot | 6,76 GB | GPUs con INT8, buen equilibrio |
| NVFP4 | 4,20 GB | GPUs NVIDIA recientes con FP4 |
| MLX 4-bit | 4,00 GB | Apple Silicon, mínimo consumo |
| Q4_K_M GGUF | 4,60 GB | Recomendado por el autor para GGUF |

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es imprescindible revisar sus términos antes de desplegar el modelo en productos o servicios.
- La variante "Uncensored" elimina los filtros de seguridad del modelo original, lo que incrementa el riesgo de generar contenido sensible, ofensivo o ilegal según la jurisdicción; el responsable del despliegue asume la moderación.
- No se documentan sesgos específicos, pero al no haber información sobre el dataset de entrenamiento no es posible evaluar sesgos de representación ni de género, etnia o cultura.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir detalles inconsistentes, texto ilegible o anatomías incorrectas, especialmente en cuantizaciones agresivas (4-bit).
- Las cuantizaciones de 4 bits pueden degradar la calidad visual y la adherencia al prompt frente a BF16; el autor solo recomienda Q4_K_M como equilibrio, sin métricas que lo respalden.
- No se especifican idiomas soportados para los prompts; el text encoder Qwen3-VL sugiere capacidad multilingüe, pero no está confirmado en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un usuario individual, no el equipo oficial de Qwen; conviene verificar la integridad de los pesos antes de usarlos en producción.
- El tamaño total del repo (105,2 GB) obliga a descargar selectivamente solo los ficheros necesarios para evitar consumo excesivo de disco y ancho de banda.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dat43dguys/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos del autor: https://abenzerps.com/request-a-model/
