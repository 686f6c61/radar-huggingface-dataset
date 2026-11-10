# PotatoForge/P-H3-Image-W4A4

## Resumen

P-H3-Image-W4A4 es una cuantización experimental del modelo de difusión texto-a-imagen P-H3-Image de PrunaAI, publicada por el usuario PotatoForge. Se trata de un único archivo de pesos (formato `diffusion-single-file`) pensado para su uso directo en ComfyUI, que reduce el modelo original en BF16 (unos 37,6 GB) hasta aproximadamente 10,7 GB mediante cuantización de 4 bits tanto en pesos como en activaciones (W4A4). El objetivo declarado por el autor es hacer viable la inferencia del modelo en GPUs NVIDIA antiguas, concretamente la arquitectura Turing (SM 7.5), incluida la GTX 1660 Super sobre la que fue desarrollado y probado.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación y edición de imágenes de la familia MiniMax H3 en hardware de gama de entrada con 6-8 GB de VRAM, algo imposible con los pesos originales. La cuantización emplea la ruta de ejecución ConvRot W4A4 de ComfyUI y escalas optimizadas por error cuadrático medio (MSE) para minimizar la pérdida de calidad de reconstrucción.

El modelo solo declara soporte de inglés, se distribuye bajo la licencia comunitaria de MiniMax H3 y no cuenta con descargas ni valoraciones en el momento de redactar esta ficha. No se han publicado resultados de benchmarks ni métricas de calidad objetivas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (texto-a-imagen e imagen-a-imagen) derivado de MiniMax H3, cuantizado con ConvRot W4A4 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A4 (4 bits en pesos y activaciones), escalas optimizadas por MSE; capas de atención y MLP del transformer principal cuantizadas, token refiner y tensores no emparejados conservados en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | diffusion-single-file (archivo único para ComfyUI) |

## Arquitectura y entrenamiento

El modelo subyacente es P-H3-Image, un modelo de difusión para generación y edición de imágenes de la familia MiniMax H3, distribuido por PrunaAI en un formato compatible con ComfyUI. Esta publicación no entrena ningún modelo nuevo: aplica una cuantización post-entrenamiento ConvRot W4A4 con escalas optimizadas por MSE sobre los pesos BF16 del modelo base. La cuantización afecta a las capas de atención y MLP del transformer principal, mientras que el token refiner y los tensores que no encajan en el esquema de cuantización se mantienen en su precisión original, lo que preserva parcialmente la calidad en las etapas más sensibles del pipeline.

La innovación técnica principal es la elección de ConvRot W4A4 frente a otros formatos de cuantización que requieren hardware SM 8.0 o superior (Ampere en adelante). Esto permite aprovechar la ruta de ejecución optimizada de ComfyUI en GPUs Turing, ampliando el parque de hardware compatible. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación, ya que la model card no los detalla.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en inglés.
- Edición y transformación de imágenes existentes (image-to-image).
- Ejecución integrada en ComfyUI mediante la ruta ConvRot W4A4.
- Inferencia en GPUs NVIDIA Turing (SM 7.5), incluidas las GTX 16-series.
- Resolución de trabajo de hasta 4 MP según las pruebas del autor en una GTX 1660 Super.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada para comprensión, audio ni modo de pensamiento; son capacidades ajenas al propósito del modelo.

## Casos de uso

- Generación de ilustraciones en equipos de gama de entrada: con unos 10,7 GB de pesos y cuantización W4A4, el modelo puede ejecutarse en GPUs Turing con VRAM limitada, permitiendo crear imágenes a partir de prompts en inglés sin necesidad de hardware Ampere o superior.
- Edición de imágenes en flujos de ComfyUI: al soportar image-to-image, se puede integrar en grafos de nodos para retocar, variar o transformar imágenes existentes dentro de un pipeline visual ya establecido.
- Prototipado rápido de conceptos visuales: investigadores y diseñadores pueden generar bocetos y variaciones de una idea con un coste de hardware bajo, evaluando direcciones creativas antes de invertir en modelos de mayor precisión.
- Pruebas de compatibilidad y cuantización: sirve como banco de pruebas para validar la ruta ConvRot W4A4 de ComfyUI en hardware Turing y comparar la calidad frente a los pesos BF16 originales.
- Automatización de contenido gráfico en lotes pequeños: en entornos con GPUs antiguas reutilizadas, se pueden generar banners, fondos o assets sencillos mediante scripts que invoquen ComfyUI de forma programática.
- Educación y experimentación: permite a estudiantes y aficionados con GTX 1660 Super u otras tarjetas Turing experimentar con un modelo de difusión de la familia MiniMax H3 sin adquirir hardware nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que el modelo fue probado en una GTX 1660 Super a resoluciones de hasta 4 MP, sin aportar métricas objetivas de calidad (FID, CLIP score, etc.) ni comparaciones cuantitativas con los pesos BF16 originales.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa aproximadamente 10,7 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar el modelo completo; con overhead de ejecución conviene disponer de 12 GB o más, aunque el autor lo ejecutó en una GTX 1660 Super (6 GB) gracias a la ruta ConvRot W4A4 de ComfyUI, que reduce el consumo en tiempo de inferencia.
- GPU objetivo: NVIDIA Turing (SM 7.5), incluidas GTX 1650, GTX 1660, GTX 1660 Super y GTX 1660 Ti.
- GPUs recomendadas: cualquier GPU Turing o superior con soporte de ComfyUI; en Ampere (RTX 30-series), Ada (RTX 40-series) o data center (A100, H100) funcionará, aunque existen otros formatos de cuantización más eficientes para SM 8.0+.
- Cabe en GPU de consumo: sí, en GTX 16-series según las pruebas del autor, y con mayor holgura en RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: ComfyUI con soporte de ConvRot W4A4; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusión en este formato.
- Latencia y throughput: no disponibles; la model card no aporta tiempos de generación por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| PotatoForge/P-H3-Image-W4A4 | no disponible | no disponible | diffusion-single-file W4A4 | minimax-h3-community-license-agreement | Turing (SM 7.5)+ |
| PrunaAI/P-H3-Image-Comfy (base) | no disponible | no disponible | diffusion-single-file BF16 (~37,6 GB) | minimax-h3-community-license-agreement | Ampere+ recomendado |
| Otras cuantizaciones de P-H3-Image | no disponible | no disponible | formatos que requieren SM 8.0+ | minimax-h3-community-license-agreement | Ampere+ |

La comparativa se limita al modelo base y a otras cuantizaciones de la misma familia, ya que la información disponible no identifica alternativas de otros autores con especificaciones verificables. La diferencia clave frente al base es el tamaño (10,7 GB frente a 37,6 GB) y el rango de hardware compatible (Turing frente a Ampere+).

## Limitaciones y advertencias

- Cuantización experimental: el autor la describe como tal y no aporta métricas de calidad; es esperable cierta degradación frente a los pesos BF16, especialmente en detalles finos y texto dentro de la imagen.
- Solo inglés: los prompts deben redactarse en inglés; no se declara soporte multilingüe.
- Requiere ComfyUI con la ruta ConvRot W4A4: no es un archivo universal y no funcionará en otros runners sin conversión previa.
- Licencia comunitaria de MiniMax H3: es una licencia "other" con términos específicos; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes, anatomías incorrectas o contenido no solicitado; requiere revisión humana en producción.
- Sin descargas ni validación comunitaria: el repositorio no registra descargas ni likes, por lo que no hay evidencia externa de robustez más allá de las pruebas del autor.
- Sin datos de sesgos: la model card no documenta sesgos conocidos ni evaluación de contenido sensible.
- Fecha de creación futura en los metadatos (2026-11-10): conviene verificar la vigencia y el estado del repositorio antes de integrarlo en un proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/PotatoForge/P-H3-Image-W4A4
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image-Comfy
- Herramienta de cuantización PotatoForge: https://github.com/bakapotatolord/potatoforge-quantization
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
