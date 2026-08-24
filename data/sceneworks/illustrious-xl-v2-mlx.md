# SceneWorks/illustrious-xl-v2-mlx

## Resumen

Illustrious-XL v2.0 — MLX pre-quantized tiers es una conversión del checkpoint de difusión Illustrious-XL v2.0 (desarrollado por OnomaAIResearch) al formato MLX, realizada por SceneWorks para su ejecución nativa en dispositivos Apple Silicon. El modelo original es una variante de Stable Diffusion XL (SDXL) especializada en ilustración anime, y esta versión empaqueta el U-Net, los dos codificadores de texto CLIP, el VAE, los tokenizadores y el scheduler en un snapshot autocontenido de diffusers que se carga directamente con la librería `mlx-gen`.

La relevancia de esta ficha radica en que permite ejecutar un modelo SDXL de alta calidad en hardware Apple sin necesidad de servicios en la nube, gracias a la cuantización previa en tres niveles (q4, q8 y bf16) que reduce el uso de memoria manteniendo la fidelidad. El modelo base es el snapshot `v2.0-STABLE`, que corresponde a la fase final de annealing de un entrenamiento con cosine-annealing, y se distingue de v1.0 por su mayor estabilidad. La arquitectura es SDXL vanilla, con doble codificador CLIP-L y OpenCLIP-bigG, predicción de epsilon y factor de escala VAE de 0.13025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDXL (U-Net + CLIP-L + OpenCLIP-bigG + VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion) |
| Tipos de cuantizacion | q4 (grupo 64), q8 (grupo 64), bf16 (denso) |
| Idiomas soportados | no disponibles |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (MLX, snapshot de diffusers) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint `Illustrious-XL-v2.0.safetensors` (formato LDM de una sola archivo) a un snapshot de diffusers con componentes separados. La arquitectura es la estándar de SDXL: un U-Net con bloques de atención, dos codificadores de texto (CLIP-L y OpenCLIP-bigG), un VAE con factor de escala 0.13025 y un scheduler de difusión. La conversión, realizada con el script `build_sdxl_turnkey.py`, normaliza dos peculiaridades del checkpoint original: elimina un buffer `position_ids` sobrante y mantiene el VAE en precisión densa (F32/F16) en todos los tiers, mientras que las proyecciones lineales del U-Net y los codificadores CLIP se cuantizan de forma grupal (grupo 64) en los tiers q4 y q8.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El checkpoint v2.0-STABLE corresponde a la fase final de un entrenamiento con cosine-annealing, lo que le confiere un comportamiento más estable que v1.0, pero no se detallan más aspectos del proceso.

## Capacidades

- Generacion de imagenes anime de alta calidad a partir de prompts en texto, con soporte de etiquetas estilo Danbooru.
- Prompting con CFG real (guidance 7.0) y prompt negativo, como es habitual en SDXL.
- Soporte completo de LoRA de la familia SDXL, lo que permite personalizar el modelo con adaptadores entrenados externamente.
- Generacion en resoluciones cuadradas y altas sin duplicacion de sujetos (aunque presenta problemas en frames anchos, ver limitaciones).
- Ejecucion local en Apple Silicon mediante la libreria `mlx-gen`, sin necesidad de GPU NVIDIA ni servicios en la nube.
- Tres niveles de cuantizacion (q4, q8, bf16) que permiten ajustar el equilibrio entre rendimiento y fidelidad segun el hardware disponible.

## Casos de uso

- Ilustracion anime para artistas y estudios: el modelo genera personajes y escenas con estetica anime, adecuado para concept art, storyboards o ilustraciones finales. Su soporte de LoRA permite adaptarlo a estilos especificos sin reentrenar.
- Creacion de assets para videojuegos: se pueden generar sprites, fondos o texturas de estilo anime directamente en el equipo de desarrollo, acelerando el prototipado. La cuantizacion q4 permite ejecutarlo en MacBooks con memoria limitada.
- Generacion de imagenes para novelas visuales: la capacidad de producir personajes consistentes (con prompts cuidados) y la compatibilidad con LoRA facilitan la creacion de ilustraciones para escenas narrativas.
- Prototipado de diseno de personajes: los artistas pueden explorar rapidamente variaciones de un personaje usando prompts con etiquetas de Danbooru, sin depender de servicios externos.
- Generacion de fondos y entornos: el modelo maneja bien resoluciones cuadradas y altas, por lo que es util para crear escenarios de fondo para animacion o ilustracion.
- Uso educativo y de investigacion en generacion de imagenes: al ser un snapshot autocontenido, es facil de integrar en pipelines de investigacion sobre difusion, especialmente en entornos Apple Silicon donde otras implementaciones de SDXL son menos eficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como FID, CLIP score o comparaciones con otros modelos de difusion.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1, M2, M3 o superiores) con macOS, ya que la libreria `mlx-gen` esta optimizada para el framework MLX.
- La cuantizacion q4 (por defecto) reduce el uso de memoria de las proyecciones lineales del U-Net y los codificadores CLIP, lo que permite ejecutar el modelo en equipos con 8 GB de RAM unificada o menos, aunque no se especifican cifras exactas.
- El tier bf16 (denso) requiere mas memoria y es recomendable para equipos con 16 GB o mas de RAM unificada.
- El VAE se mantiene denso en todos los tiers, por lo que la memoria adicional para el VAE es fija.
- Despliegue mediante la libreria `mlx-gen` (generador `sdxl`), que carga el snapshot directamente. No se mencionan otras opciones como vLLM u Ollama, ya que no son aplicables a modelos de difusion.
- La latencia y el throughput dependen del chip concreto (por ejemplo, M1 Pro vs M3 Max) y no se proporcionan datos medidos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Illustrious-XL v2.0 (original) | SDXL | no disponible | no aplica | CreativeML OpenRAIL-M | safetensors (LDM) |
| SceneWorks/illustrious-xl-v2-mlx | SDXL | no disponible | no aplica | CreativeML OpenRAIL-M | safetensors (MLX) |
| Stable Diffusion XL base | SDXL | no disponible | no aplica | OpenRAIL++ | safetensors |

La comparativa se limita a los modelos mencionados en la informacion proporcionada. No se dispone de datos de rendimiento ni de parametros exactos para realizar una comparacion cuantitativa. La principal diferencia entre el modelo original y esta version es el formato de pesos (MLX vs LDM) y la cuantizacion previa, que facilita la ejecucion en Apple Silicon.

## Limitaciones y advertencias

- Duplicacion de sujetos en frames anchos: segun la model card, el modelo tiende a duplicar el sujeto en resoluciones como 1344x768 y 1536x1536. Se recomienda usar frames cuadrados o altos para evitar este artefacto.
- Sesgos potenciales: al ser un modelo entrenado con datos de ilustracion anime, puede presentar sesgos esteticos y de representacion propios de ese dominio. No se proporcionan evaluaciones de sesgo.
- Riesgo de alucinacion: aunque es un modelo de difusion, puede generar elementos no solicitados o distorsiones en prompts complejos, especialmente con etiquetas ambiguas.
- Restricciones de licencia: la licencia CreativeML OpenRAIL-M permite uso comercial sin gating, pero impone restricciones de uso conductual (por ejemplo, no generar contenido ilegal o danino). Es responsabilidad del usuario cumplir estas condiciones.
- Limitaciones de idioma: no se especifican idiomas soportados; el prompting se basa en etiquetas de Danbooru, que son mayoritariamente en ingles, aunque el modelo puede interpretar prompts en otros idiomas con menor precision.
- Dependencia de hardware Apple: el formato MLX solo es ejecutable en Apple Silicon, por lo que no es util en entornos con GPUs NVIDIA o AMD sin adaptacion adicional.

## Enlaces

- [HuggingFace - SceneWorks/illustrious-xl-v2-mlx](https://huggingface.co/SceneWorks/illustrious-xl-v2-mlx)
- [GitHub - SceneWorks/SceneWorks](https://github.com/SceneWorks/SceneWorks)
- [Civitai - Illustrious XL 2.0](https://civitai.com/models/1369089/illustrious-xl-20)
- [Modelo base - OnomaAIResearch/Illustrious-XL-v2.0](https://huggingface.co/OnomaAIResearch/Illustrious-XL-v2.0)
