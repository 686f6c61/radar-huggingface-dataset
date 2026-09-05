# chenjiaj109550158/AbsorbQuant-NVFP4

## Resumen

AbsorbQuant-NVFP4 es un conjunto de checkpoints pre-cuantizados en formato W4A4 NVFP4 (pesos y activaciones a 4 bits) para modelos de difusión de texto a imagen. Los ha desarrollado chenjiaj109550158 como salida del método AbsorbQuant, una técnica de cuantización de bajo rango basada en descomposición H-metric, que combina una rama fp16 de rango 32 sobre la entrada con un residual cuantizado mediante GPTQ en NVFP4. El método se ejecuta sobre el kernel real nunchaku `gemm_w4a4`. Los checkpoints cubren seis modelos base: PixArt-Sigma-XL-2-1024, SANA-1.6B, SDXL-Turbo, SDXL-Base 1.0, FLUX.1-schnell y FLUX.1-dev, con tamaños de archivo que van desde 308 MB hasta 6.6 GB. La relevancia del modelo radica en permitir la inferencia de diffusion transformers con requisitos de memoria reducidos, aunque no se han publicado métricas de calidad ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) / U-Net según modelo base; cuantización W4A4 NVFP4 |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de texto a imagen, no de lenguaje) |
| Tipos de cuantizacion | W4A4 NVFP4; variante MXFP4 para PixArt-Sigma (OCP MXFP4, runtime Triton) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (código de cuantización); checkpoints heredan la licencia del modelo base (FLUX.1-dev: licencia no comercial; SDXL: CreativeML Open RAIL++-M; otros: revisar) |
| Formato de pesos | .pt (PixArt-Sigma, SANA, SDXL) y .safetensors (FLUX.1-schnell, FLUX.1-dev) |

## Arquitectura y entrenamiento

Los checkpoints se generan mediante el pipeline de AbsorbQuant, que combina una descomposición de bajo rango basada en una métrica H (H-metric) con una rama fp16 de rango 32 sobre la entrada original y un residual cuantizado con GPTQ en formato NVFP4. La inferencia se realiza sobre el kernel nunchaku `gemm_w4a4`. La calibración utiliza únicamente 128 prompts fijos derivados de COCO, sin artefactos de calibración de SVDQuant. Los checkpoints son la salida byte-for-byte de los scripts del repositorio (`calibrate.py` y `build.py`) bajo un entorno fijado. No se menciona entrenamiento adicional, RLHF ni DPO; se trata de una cuantización post-entrenamiento de modelos preentrenados.

## Capacidades

- Generación de texto a imagen para los modelos base incluidos: PixArt-Sigma-XL-2-1024, SANA-1.6B, SDXL-Turbo, SDXL-Base 1.0, FLUX.1-schnell y FLUX.1-dev.
- Cuantización W4A4 (pesos y activaciones a 4 bits), lo que reduce la huella de memoria y puede acelerar la inferencia en hardware compatible.
- Variante adicional en MXFP4 para PixArt-Sigma, ejecutada con runtime Triton.
- Los checkpoints son verificables: los scripts de verificación comprueban la identidad bit a bit entre una reconstrucción y los archivos publicados.
- No se indica soporte de tool calling, agentes ni razonamiento multi-paso; el modelo es exclusivamente de generación de imágenes.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de imágenes en tiempo real en GPU de consumo: los checkpoints de SDXL-Turbo y FLUX.1-schnell cuantizados a W4A4 reducen la memoria necesaria y permiten inferencia con menor latencia en equipos con VRAM limitada, siempre que se disponga del runtime nunchaku.
- Despliegue de pipelines de text-to-image en producción: los formatos .safetensors de FLUX permiten integrarse en sistemas que ya usan esos pesos, con una huella de memoria menor que los originales.
- Investigación en cuantización de diffusion transformers: los checkpoints sirven como referencia para comparar el método AbsorbQuant con otras técnicas como SVDQuant o NVIDIA Model Optimizer, ya que se proporcionan artefactos verificables byte a byte.
- Prototipado de aplicaciones de generación de imágenes en entornos con recursos limitados: los checkpoints de menor tamaño (PixArt-Sigma, 325 MB, o SANA, 822 MB) son adecuados para experimentos en portátiles o estaciones de trabajo con pocos GB de VRAM.
- Generación de imágenes en aplicaciones de diseño asistido: se puede usar el modelo cuantizado para crear conceptos visuales o storyboards en herramientas creativas, reduciendo el coste computacional por imagen.
- Fine-tuning o adaptación de modelos base cuantizados para dominios específicos: aunque la cuantización puede limitar el entrenamiento, los checkpoints permiten evaluar la viabilidad de ajustes ligeros sobre modelos como SANA o PixArt-Sigma en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Los tamaños de los checkpoints oscilan entre 308 MB y 6.6 GB, lo que sugiere que los modelos más pequeños podrían ejecutarse en GPUs de consumo, pero no se especifican requisitos exactos.
- GPU recomendadas: no disponible. El método requiere el kernel nunchaku `gemm_w4a4`, que está diseñado para GPUs NVIDIA con soporte para NVFP4; la variante MXFP4 usa runtime Triton.
- Opciones de despliegue: el código oficial de AbsorbQuant incluye scripts de generación (`generate.py`) y requiere instalar el paquete absorbquant y la rueda de nunchaku. No se mencionan vLLM, llama.cpp, Ollama ni TGI para estos checkpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas formales con métodos alternativos en la información disponible. La model card menciona que los checkpoints se generan sin artefactos de calibración de SVDQuant, lo que sugiere una comparación implícita, pero no se proporcionan métricas de calidad ni de rendimiento.

## Limitaciones y advertencias

- Los checkpoints heredan las licencias de sus modelos base. FLUX.1-dev está bajo la licencia no comercial de Black Forest Labs, y SDXL bajo CreativeML Open RAIL++-M, por lo que el uso comercial requiere revisar las condiciones de cada modelo.
- La calibración se realizó con 128 prompts fijos derivados de COCO, lo que puede limitar la generalización a dominios fuera de esa distribución.
- La cuantización W4A4 puede degradar la calidad de las imágenes generadas en comparación con los modelos originales, aunque no se proporcionan benchmarks que cuantifiquen esta pérdida.
- El método depende del runtime nunchaku y de hardware compatible con NVFP4; no es un formato universal y no funciona en cualquier GPU o framework.
- No se han publicado métricas de calidad (FID, CLIP score, etc.) ni comparaciones de rendimiento, por lo que el impacto real en la fidelidad de imagen es desconocido.
- El repositorio AbsorbQuant debe consultarse para obtener la configuración exacta de cada checkpoint y verificar la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/chenjiaj109550158/AbsorbQuant-NVFP4
- Modelos base:
  - https://huggingface.co/PixArt-alpha/PixArt-Sigma-XL-2-1024-MS
  - https://huggingface.co/Efficient-Large-Model/Sana_1600M_1024px
  - https://huggingface.co/stabilityai/sdxl-turbo
  - https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
  - https://huggingface.co/black-forest-labs/FLUX.1-schnell
  - https://huggingface.co/black-forest-labs/FLUX.1-dev
- Repositorio AbsorbQuant: no proporcionado en la información disponible (referenciado como `<ABSORBQUANT_REPO_URL>`).
