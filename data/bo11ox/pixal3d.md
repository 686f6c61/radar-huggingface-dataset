# bo11ox/Pixal3D

## Resumen

Pixal3D es un modelo de generación de activos 3D a partir de una única imagen, desarrollado por investigadores de la Universidad de Tsinghua (BNRist), Tencent ARC Lab y la Victoria University of Wellington. El trabajo fue aceptado en SIGGRAPH 2026 y su innovación central consiste en elevar explícitamente las características de píxel a 3D mediante retroproyección, estableciendo correspondencias directas píxel-a-3D en lugar de inyectar características de imagen de forma laxa vía atención. Esto permite alcanzar una fidelidad cercana a la reconstrucción, con geometría detallada y texturas PBR.

El modelo se distribuye como un pipeline de generación en cascada de tres etapas (estructura dispersa, forma y textura), cada una incrementando progresivamente la resolución hasta 1024/1536. La rama `main` se apoya en el backbone Trellis.2 de Microsoft, mientras que la rama `paper` reproduce los resultados del artículo original sobre Direct3D-S2. El repositorio de Hugging Face ocupa 46 GB y se publica bajo licencia MIT, con código de inferencia, código de entrenamiento y toolkit de preparación de datos disponibles.

Es relevante ahora porque combina una técnica de alineación píxel-3D con un pipeline de difusión 3D completo y reproducible, y porque ofrece demo online, modo de baja VRAM y código de entrenamiento abierto, lo que facilita tanto la evaluación como el ajuste fino por parte de desarrolladores e investigadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión 3D en cascada de tres etapas (estructura dispersa, forma y textura) sobre backbone Trellis.2 (rama `main`) o Direct3D-S2 (rama `paper`); bloques tipo DiT con proyección píxel-alineada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo image-to-3D, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo multimodal imagen-a-3D, sin soporte de texto declarado) |
| Licencia | MIT |
| Formato de pesos | no disponible (la salida de inferencia es malla GLB; el repo ocupa 46 GB) |

## Arquitectura y entrenamiento

Pixal3D se entrena como una cascada de tres etapas que incrementan la resolución de forma progresiva. La etapa 1 (Sparse Structure) opera a resoluciones 32 → 64; la etapa 2 (Shape) a 256 → 512 → 1024; y la etapa 3 (Texture) a 256 → 512 → 1024. Cada etapa emplea configuraciones con prefijo `*_proj_finetune`, lo que indica ajuste fino con proyección píxel-alineada. El mecanismo clave es la retroproyección explícita de características de píxel al espacio 3D, que establece correspondencias directas píxel-a-3D en lugar de la inyección laxa mediante atención usada por métodos previos.

El backbone de la rama `main` es Trellis.2 (Microsoft), mientras que la rama `paper` se basa en Direct3D-S2 y corresponde a los resultados reportados en el artículo de SIGGRAPH 2026. El modelo se entrena sobre datos O-Voxel alineados a vistas junto con imágenes de condición renderizadas, preparados mediante el toolkit de datos incluido en el repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO (no aplicable a un modelo generativo 3D de este tipo). La inferencia soporta backend de atención `flash_attn` o SDPA de PyTorch, e incluye un modo de baja VRAM que carga los modelos bajo demanda.

## Capacidades

- Generación de activos 3D de alta fidelidad a partir de una única imagen de entrada.
- Producción de geometría detallada con fidelidad cercana a la reconstrucción gracias a la alineación píxel-3D.
- Generación de texturas PBR (physically based rendering) junto con la malla.
- Salida en formato GLB, directamente consumible por motores y visores 3D.
- Pipeline en cascada con control de resolución (1024 en modo baja VRAM, 1536 en modo estándar, configurable con `--resolution`).
- Modo de baja VRAM para reducir el pico de memoria mediante carga bajo demanda de modelos.
- Demo web interactiva basada en Gradio para generación de mallas desde imágenes.
- Código de entrenamiento completo y toolkit de preparación de datos para reproducir el modelo desde cero.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo thinking; se trata de un modelo especializado image-to-3D.

## Casos de uso

- Creación de assets para videojuegos: a partir de una ilustración o fotografía de referencia, el modelo genera una malla GLB con texturas PBR lista para importar en motores como Unity o Unreal, reduciendo el tiempo de modelado manual.
- Prototipado rápido de productos: diseñadores pueden convertir un boceto o render conceptual en un modelo 3D texturizado para validar volumetría y materiales antes de la producción final.
- Comercio electrónico y visualización de producto: generar modelos 3D a partir de fotografías de catálogo para vistas interactivas en web o AR, aprovechando la fidelidad de reconstrucción del pipeline.
- Escaneo y digitalización de objetos: usar una sola foto de un objeto físico para obtener una representación 3D con geometría y textura, útil en documentación patrimonial o inventarios.
- Realidad aumentada y VR: producir mallas GLB optimizadas (resolución 1024 en modo baja VRAM) para experiencias inmersivas en dispositivos con recursos limitados.
- Investigación en generación 3D: el código de entrenamiento y el toolkit de datos permiten reproducir el modelo, comparar las ramas `main` (Trellis.2) y `paper` (Direct3D-S2) y realizar ajustes finos sobre dominios propios.
- Integración en pipelines automatizados de contenido: ejecutar `inference.py` por lotes sobre imágenes para generar activos 3D de forma desatendida, con control de resolución y backend de atención según el hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numérica; el repositorio ocupa 46 GB y existe un modo `--low_vram` que reduce el pico de memoria cargando modelos bajo demanda.
- GPU recomendadas: no se especifican modelos concretos; la demo de Hugging Face Spaces usa `requirements-hfdemo.txt`, orientado a arquitectura de GPU de la serie H (H100/H200), y puede no ser compatible con otras arquitecturas.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el modo de baja VRAM está pensado para reducir el pico de memoria, pero no se indica si cabe en GPUs consumer concretas.
- Opciones de despliegue: inferencia por script (`inference.py`), demo web Gradio (`app.py`), y despliegue en Hugging Face Spaces; requiere el entorno base de Trellis.2, `natten==0.21.0` y `utils3d`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Backend de atención: `flash_attn` o SDPA de PyTorch (`ATTN_BACKEND=sdpa`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pixal3D | Image-to-3D, difusión en cascada | no disponible | 1024 / 1536 | MIT | Hugging Face, GitHub, demo |
| Trellis.2 (Microsoft) | Image-to-3D, backbone base | no disponible | no disponible | no disponible | GitHub |
| Direct3D-S2 (DreamTechAI) | Image-to-3D, backbone de la rama `paper` | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a la relación arquitectónica (Pixal3D se construye sobre Trellis.2 en la rama `main` y sobre Direct3D-S2 en la rama `paper`).

## Limitaciones y advertencias

- Solo acepta una única imagen como entrada; no se documentan entradas multivista ni de texto.
- No se declaran idiomas soportados ni capacidades lingüísticas; es un modelo especializado en imagen-a-3D.
- No se han publicado métricas de benchmarks ni evaluaciones cuantitativas en la información disponible, por lo que el rendimiento real no puede verificarse a priori.
- El modelo card incluye `extra_gated_eu_disallowed: true`, lo que implica restricciones de acceso geográfico para la Unión Europea que deben verificarse antes de su uso.
- La licencia es MIT, pero conviene revisar el fichero LICENSE del repositorio para confirmar condiciones exactas de uso comercial.
- El pipeline depende del entorno de Trellis.2 y de dependencias específicas (`natten`, `utils3d`), lo que puede complicar el despliegue en arquitecturas distintas de las validadas.
- El repositorio ocupa 46 GB, con requisitos de almacenamiento y memoria considerables; el modo de baja VRAM mitiga el pico pero no se cuantifica su consumo.
- Riesgo de alucinación geométrica o texturas inconsistentes en objetos con oclusiones severas o materiales poco representados en los datos de entrenamiento (no documentado explícitamente en la información disponible).
- No se documentan sesgos conocidos del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/bo11ox/Pixal3D
- Modelos oficiales: https://huggingface.co/TencentARC/Pixal3D
- Demo online: https://huggingface.co/spaces/TencentARC/Pixal3D
- GitHub: https://github.com/TencentARC/Pixal3D
- Página del proyecto: https://ldyang694.github.io/projects/pixal3d/
- Artículo arXiv: https://arxiv.org/abs/2605.10922
- Backbone Trellis.2: https://github.com/microsoft/TRELLIS.2
- Backbone Direct3D-S2: https://github.com/DreamTechAI/Direct3D-S2
- Página del autor principal: https://ldyang694.github.io/
