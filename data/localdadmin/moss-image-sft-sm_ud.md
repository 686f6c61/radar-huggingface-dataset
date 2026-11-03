# localdadmin/MOSS-Image-SFT-SM_UD

## Resumen

MOSS-Image-SFT-SM_UD es un repositorio de redistribución (repackaging) publicado por el usuario `localdadmin` que empaqueta en formato GGUF el modelo de generación de imágenes MOSS-Image en su variante SFT (supervised fine-tuning), desarrollado originalmente por el equipo OpenMOSS. El paquete combina tres componentes: el modelo de difusión MOSS-Image-SFT cuantizado en Q3_K_XL, el codificador de texto Qwen3.5-9B también en Q3_K_XL y el VAE `flux2-vae.safetensors`. No se trata de un modelo nuevo, sino de una reorganización de pesos ya existentes orientada a su uso con herramientas de inferencia que consumen GGUF.

El interés de esta publicación es práctico: agrupa en un único repositorio los tres artefactos necesarios para ejecutar un pipeline texto-a-imagen completo, evitando al usuario tener que descargar por separado el modelo de difusión, el text encoder y el VAE desde repositorios distintos. El tamaño del repo (20,6 GB) y la elección de cuantización Q3_K_XL indican un objetivo claro de reducir requisitos de VRAM frente a los pesos originales en precisión completa.

La información pública disponible es muy limitada: el repositorio no incluye model card técnica propia, no declara idiomas soportados, no publica benchmarks y registra cero descargas en el momento de la consulta. Los datos que siguen se derivan del contenido del repositorio, de los metadatos de HuggingFace y de los modelos base referenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion (modelo de difusion MOSS-Image-SFT) + text encoder transformer (Qwen3.5-9B) + VAE (flux2-vae) |
| Parametros totales | 5.082.308.624 (dato declarado en safetensors del repo; no cubre necesariamente todos los componentes del pipeline) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q3_K_XL (modelo de difusion y text encoder); VAE en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de difusion y text encoder), safetensors (VAE) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: es una composición de tres modelos preexistentes. El componente generativo es MOSS-Image-SFT, un modelo de difusión para síntesis de imágenes derivado de MOSS-Image-Base y ajustado mediante supervisión (SFT) por OpenMOSS. El codificador de texto es Qwen3.5-9B, un transformer denso de 9 mil millones de parámetros que traduce el prompt en embeddings condicionantes. El decodificador latente es `flux2-vae.safetensors`, el VAE asociado a la familia Flux 2, que convierte latentes en píxeles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del modelo de difusión, ya que el repositorio redistribuido no incluye model card técnica. La única intervención documentada del autor es la cuantización a Q3_K_XL y el reempaquetado de la estructura de directorios (`diffusion_models/`, `text_encoders/`, `vae/`), un layout habitual en herramientas como ComfyUI.

## Capacidades

- Generación de imágenes a partir de prompts de texto (texto-a-imagen) mediante el modelo de difusión MOSS-Image-SFT.
- Codificación de prompts en lenguaje natural mediante Qwen3.5-9B, lo que aporta comprensión semántica de instrucciones complejas.
- Decodificación latente a imagen RGB mediante el VAE de Flux 2.
- Ejecución en pipelines de difusión estándar que acepten GGUF para el modelo principal y el text encoder.
- No se documentan capacidades de edición de imagen, inpainting, control estructural (ControlNet), tool calling, agentes ni multimodalidad de entrada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el pipeline permite crear imágenes de referencia a partir de descripciones textuales sin salir de un entorno local con GPU de consumo, gracias a la cuantización Q3_K_XL.
- Creación de assets para videojuegos y aplicaciones: generación por lotes de sprites, fondos o iconos conceptuales usando el modelo de difusión con prompts controlados.
- Exploración artística y generación de variaciones: iterar prompts sobre el mismo pipeline para producir variaciones estilísticas, aprovechando la comprensión semántica del text encoder Qwen3.5-9B.
- Pruebas de concepto de pipelines texto-a-imagen en investigación: validar arquitecturas de difusión con un stack GGUF reproducible y de licencia permisiva.
- Generación de material gráfico para marketing interno: banners, mockups y composiciones de baja fidelidad que luego se refinan manualmente.
- Docencia y experimentación con modelos de difusión: el formato GGUF y la estructura de directorios facilitan demostraciones en entornos con recursos limitados.
- Automatización de contenido visual en flujos con ComfyUI: integración del paquete como nodo de generación dentro de grafos más amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 20,6 GB en disco; con cuantización Q3_K_XL de los dos componentes principales, la inferencia requiere aproximadamente entre 14 y 20 GB de VRAM, aunque no se dispone de cifras oficiales del autor.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para ejecución completa en una sola GPU; A100/H100 para mayor throughput o resolución.
- GPU de consumo: cabe en GPUs de 24 GB; en GPUs de 16 GB puede requerir offloading parcial a CPU o cuantizaciones más agresivas no incluidas en este repo.
- Opciones de despliegue: el layout GGUF + safetensors sugiere uso con ComfyUI o herramientas compatibles con GGUF para difusión; no se documenta soporte de vLLM, TGI ni Ollama (no aplicables a modelos de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| MOSS-Image-SFT-SM_UD (este repo) | 5.082.308.624 (declarados) | no disponible | GGUF + safetensors | Apache 2.0 | Repackaging de MOSS-Image-SFT + Qwen3.5-9B + flux2-vae |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no disponible | safetensors | Apache 2.0 (según repo base) | Modelo original sin cuantizar; requiere más VRAM |
| unsloth/MOSS-Image-SFT-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Cuantizaciones GGUF oficiales de referencia del modelo de difusión |
| Qwen/Qwen3.5-9B | 9B (aprox.) | no disponible | safetensors / GGUF | no disponible en esta ficha | Text encoder incluido en el paquete |

## Limitaciones y advertencias

- Repositorio sin model card técnica: no hay documentación sobre sesgos, datos de entrenamiento ni evaluación de calidad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El autor (`localdadmin`) no es el desarrollador original; se trata de un repackaging de terceros, con el riesgo de errores de empaquetado o configuraciones no verificadas.
- La cuantización Q3_K_XL puede degradar la fidelidad de las imágenes generadas frente a los pesos originales en BF16/FP16; no se documenta el impacto real.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar contenido incoherente, artefactos o elementos no solicitados en el prompt.
- Idiomas soportados no declarados: no se puede garantizar el rendimiento con prompts en castellano; el comportamiento multilingüe depende de Qwen3.5-9B y no está documentado aquí.
- Licencia Apache 2.0 declarada en el repo, pero conviene verificar la licencia de cada componente original (MOSS-Image, Qwen3.5-9B, flux2-vae) antes de uso comercial, ya que pueden existir condiciones adicionales.
- Ausencia de benchmarks: no hay métricas de FID, CLIP score ni comparativas objetivas con otros modelos de difusión.
- El campo "parámetros totales" (5.082.308.624) probablemente no refleja el total del pipeline completo, dado que el text encoder Qwen3.5-9B por sí solo ronda los 9 mil millones; debe interpretarse con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localdadmin/MOSS-Image-SFT-SM_UD
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Cuantización GGUF de MOSS-Image-Base: https://huggingface.co/unsloth/MOSS-Image-Base-GGUF
- Cuantización GGUF de MOSS-Image-SFT: https://huggingface.co/unsloth/MOSS-Image-SFT-GGUF
- Text encoder Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantización GGUF de Qwen3.5-9B: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
