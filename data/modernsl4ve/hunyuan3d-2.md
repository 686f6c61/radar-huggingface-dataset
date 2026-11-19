# modernsl4ve/Hunyuan3D-2

## Resumen

Hunyuan3D 2.0 es un sistema de síntesis 3D a gran escala desarrollado por Tencent Hunyuan, diseñado para generar activos 3D texturizados de alta resolución a partir de imágenes o texto. El sistema se compone de dos modelos fundamentales: Hunyuan3D-DiT, un transformer de difusión basado en flujo (flow-based diffusion transformer) que genera la geometría (malla sin textura), y Hunyuan3D-Paint, un modelo de síntesis de texturas que produce mapas de textura de alta resolución para mallas generadas o creadas manualmente.

La arquitectura sigue un pipeline de dos etapas que desacopla la dificultad de generar forma y textura, lo que aporta flexibilidad: permite texturizar mallas generadas por el propio modelo o mallas artesanales existentes. El sistema se complementa con Hunyuan3D-Studio, una plataforma de producción que facilita la manipulación y animación de los activos 3D.

Este repositorio concreto (`modernsl4ve/Hunyuan3D-2`) es una réplica del modelo oficial de Tencent, con 58,4 GB de pesos en formato safetensors y la librería `hunyuan3d-2`. Es relevante porque representa uno de los pocos sistemas abiertos de generación 3D texturizada de alta calidad que compite con modelos cerrados, aunque su licencia community impone restricciones importantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: Hunyuan3D-DiT (flow-based diffusion transformer) para forma + Hunyuan3D-Paint (difusión con priors geométricos) para textura |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de difusión 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | tencent-hunyuan-community (license: other) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 58,4 GB |
| Pipeline | image-to-3d (soporta también text-to-3d según tags) |
| Libreria | hunyuan3d-2 |
| Fecha de publicacion | 2025-01-21 |

## Arquitectura y entrenamiento

Hunyuan3D 2.0 emplea un pipeline generativo de dos etapas. La primera, Hunyuan3D-DiT, es un transformer de difusión basado en flujo (flow-based diffusion transformer) escalable que genera la geometría de la malla condicionada a una imagen de entrada, alineando la forma con la condición visual. La segunda etapa, Hunyuan3D-Paint, es un modelo de síntesis de texturas que aprovecha priors geométricos y de difusión para producir mapas de textura de alta resolución y colorido sobre mallas, ya sean generadas por el propio sistema o creadas manualmente. Este diseño desacoplado permite retexturizar activos existentes sin regenerar la geometría.

El sistema se completa con Hunyuan3D-Studio, una plataforma de producción que permite a usuarios profesionales y amateurs manipular e incluso animar las mallas generadas. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card referencia dos papers: el reporte técnico de Hunyuan3D 2.0 (arXiv:2501.12202) y un trabajo previo (arXiv:2411.02293).

## Capacidades

- Generación de mallas 3D a partir de una imagen de condición (image-to-3d).
- Generación de mallas 3D a partir de texto (text-to-3d, según tags del repositorio).
- Síntesis de texturas de alta resolución sobre mallas generadas o artesanales.
- Retexturizado de mallas existentes gracias al desacoplamiento forma/textura.
- Producción de activos 3D texturizados de alta resolución orientados a pipelines de creación digital.
- Manipulación y animación de mallas a través de Hunyuan3D-Studio.
- Soporte de idiomas de entrada: inglés y chino.

## Casos de uso

- Creación de activos para videojuegos: el modelo genera mallas texturizadas a partir de concept art o imágenes de referencia, acelerando la producción de props y entornos que luego se retocan en herramientas de modelado.
- Prototipado rápido de productos: a partir de una imagen de un objeto, se obtiene una malla texturizada que sirve como base para revisiones de diseño antes de pasar a CAD.
- Retexturizado de mallas existentes: Hunyuan3D-Paint permite aplicar texturas nuevas a activos 3D ya modelados, útil en estudios que reutilizan bibliotecas de geometría.
- Generación de contenido para e-commerce: creación de modelos 3D texturizados de productos a partir de fotografías para visualizadores web o configuradores.
- Previsualización en arquitectura e interiorismo: generación de muebles y objetos decorativos texturizados a partir de referencias visuales para maquetas conceptuales.
- Animación y manipulación de activos: mediante Hunyuan3D-Studio se pueden animar las mallas generadas para prototipos de animación o presentaciones.
- Educación y documentación técnica: generación de modelos 3D ilustrativos a partir de imágenes para material didáctico o manuales.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación de activos 3D texturizados):

| Modelo | CMMD (↓) | FID_CLIP (↓) | FID (↓) | CLIP-score (↑) |
|---|---|---|---|---|
| Top Open-source Model1 | 3,591 | 54,639 | 289,287 | 0,787 |
| Top Close-source Model1 | 3,600 | 55,866 | 305,922 | 0,779 |
| Top Close-source Model2 | 3,368 | 49,744 | 294,628 | 0,806 |
| Top Close-source Model3 | 3,218 | 51,574 | 295,691 | 0,799 |
| Hunyuan3D 2.0 | **3,193** | **49,165** | **282,429** | **0,809** |

Los modelos comparados no se identifican por nombre en la información proporcionada. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de generación 3D.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 58,4 GB en pesos safetensors, lo que da una idea del espacio en disco necesario; la VRAM dependerá de la etapa (DiT o Paint) y de la resolución de malla.
- GPU recomendadas: no disponible de forma explícita. Por el tamaño del repositorio y la naturaleza de los modelos de difusión, se requiere una GPU con memoria considerable; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en GPUs consumer.
- Opciones de despliegue: la model card describe instalación vía `pip install -r requirements.txt`, compilación de `custom_rasterizer` y `differentiable_renderer`, y uso mediante código o una aplicación Gradio. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hunyuan3D 2.0 | Difusión 3D (forma + textura) | no disponible | no aplica | tencent-hunyuan-community | Hugging Face (oficial y réplica) |
| Top Open-source Model1 | Generación 3D | no disponible | no aplica | no disponible | no disponible |
| Top Close-source Model2 | Generación 3D | no disponible | no aplica | cerrada | API/servicio |
| Top Close-source Model3 | Generación 3D | no disponible | no aplica | cerrada | API/servicio |

Los modelos comparables no se identifican por nombre en la información proporcionada; solo se aportan sus métricas en la tabla de benchmarks. No se dispone de datos de parámetros, contexto ni licencia de las alternativas.

## Limitaciones y advertencias

- Licencia `tencent-hunyuan-community`: impone restricciones que deben revisarse antes de cualquier uso comercial; no es una licencia de código abierto permisiva.
- El repositorio incluye la marca `extra_gated_eu_disallowed: true`, lo que indica que el acceso puede estar restringido para usuarios de la Unión Europea; conviene verificar las condiciones de acceso.
- Este repositorio concreto (`modernsl4ve/Hunyuan3D-2`) es una réplica no oficial con 0 descargas y 0 likes; para producción se recomienda usar el repositorio oficial de Tencent.
- Riesgo de artefactos geométricos y texturas inconsistentes en condiciones de entrada ambiguas o imágenes de baja calidad; no se documentan tasas de fallo.
- Idiomas de entrada limitados a inglés y chino; el rendimiento con prompts en otros idiomas no está documentado.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre evaluación de sesgos en la generación 3D.
- El tamaño del repositorio (58,4 GB) y la necesidad de compilar rasterizadores y renderizadores personalizados complican el despliegue en entornos con recursos limitados.
- No hay datos publicados sobre latencia, throughput ni requisitos mínimos de VRAM en la información disponible.

## Enlaces

- Repositorio en Hugging Face (réplica): https://huggingface.co/modernsl4ve/Hunyuan3D-2
- Repositorio oficial del modelo: https://huggingface.co/tencent/Hunyuan3D-2
- Repositorio de código en GitHub: https://github.com/Tencent/Hunyuan3D-2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tencent/Hunyuan3D-2
- Página oficial del producto: https://3d.hunyuan.tencent.com
- Página de modelos 3D: https://3d-models.hunyuan.tencent.com/
- Paper Hunyuan3D 2.0 (arXiv:2501.12202): https://huggingface.co/papers/2501.12202
- Paper previo (arXiv:2411.02293): https://arxiv.org/abs/2411.02293
- Reporte técnico (PDF): https://github.com/Tencent/Hunyuan3D-2/blob/main/assets/report/Tencent_Hunyuan3D_2_0.pdf
- Licencia: https://huggingface.co/tencent/Hunyuan3D-2/blob/main/LICENSE.txt
- Discord: https://discord.gg/GuaWYwzKbX
