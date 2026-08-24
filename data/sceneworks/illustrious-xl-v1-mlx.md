# SceneWorks/illustrious-xl-v1-mlx

## Resumen

Illustrious-XL v1.0 MLX es una conversión pre-cuantizada del modelo de difusión de imágenes anime [OnomaAIResearch/Illustrious-XL-v1.0](https://huggingface.co/OnomaAIResearch/Illustrious-XL-v1.0), adaptada para inferencia local en dispositivos Apple Silicon mediante la librería `mlx-gen` de SceneWorks. El modelo original es un finetune de Stable Diffusion XL (SDXL) entrenado con etiquetas de Danbooru, especializado en ilustración anime de alta calidad. Esta versión MLX empaqueta el modelo en tres niveles de cuantización (q4, q8 y bf16) como instantáneas autocontenidas de diffusers, listas para cargar sin necesidad de cuantización en tiempo de ejecución.

La relevancia de este modelo radica en que permite ejecutar un SDXL de anime completo en hardware Apple Silicon con un consumo de memoria reducido, manteniendo la calidad del original. Al ser una conversión directa del checkpoint oficial, conserva todas las capacidades del modelo base: doble codificador de texto (CLIP-L y OpenCLIP-bigG), guiado sin clasificador, predicción de epsilon y soporte completo de LoRA. El repositorio incluye tres variantes de precisión para adaptarse a diferentes capacidades de memoria, siendo la VAE la única componente que permanece siempre en precisión completa por su inestabilidad numérica en cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (U-Net + doble CLIP text encoder + VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | q4 (grupo 64), q8 (grupo 64), bf16 (denso) |
| Idiomas soportados | no disponible (prompts basados en etiquetas Danbooru, principalmente ingles) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors (componentes diffusers: U-Net, CLIP, VAE, tokenizers, scheduler) |

## Arquitectura y entrenamiento

El modelo base Illustrious-XL v1.0 es un finetune de SDXL desarrollado por OnomaAI, entrenado sobre un gran corpus de imágenes etiquetadas con el vocabulario de Danbooru. Arquitectónicamente es SDXL estándar: dos codificadores de texto (CLIP-L y OpenCLIP-bigG), U-Net con atención cruzada, VAE con factor de escala 0.13025, predicción de epsilon y guiado sin clasificador con prompt negativo. El entrenamiento original no ha sido documentado en detalle en la información disponible, pero se sabe que es un finetune específico para estética anime.

La conversión a MLX se realizó offline mediante un script que transforma el checkpoint único de LDM en un árbol de componentes diffusers, aplicando cuantización por grupos de 64 elementos en las proyecciones lineales de la U-Net y ambos codificadores CLIP. Las capas convolucionales, GroupNorms y embeddings de tokens permanecen en precisión completa, ya que no son multiplicaciones de matrices. La VAE se mantiene densa en todos los niveles por su inestabilidad conocida en int8/fp16. La cuantización es byte-idéntica a la que aplicaría `mlx-gen` en tiempo de carga, lo que garantiza consistencia entre los niveles pre-cuantizados y la carga dinámica.

## Capacidades

- Generación de imágenes anime de alta calidad a partir de prompts de texto, con resolución nativa de 1024×1024 y soporte de fotogramas amplios hasta 1536×1536.
- Interpretación de etiquetas Danbooru, lo que permite un control fino sobre personajes, estilos, poses y atributos mediante vocabulario especializado.
- Soporte completo de LoRA de la familia SDXL, permitiendo adaptar el modelo a estilos o personajes específicos sin reentrenamiento completo.
- Guiado sin clasificador con prompt negativo, mejorando la adherencia al prompt y el control sobre la composición.
- Generación en aproximadamente 30 pasos con guidance scale de 7.0, configuraciones estándar para SDXL.
- Inferencia local en Apple Silicon mediante MLX, sin necesidad de conexión a la nube ni de GPU NVIDIA.

## Casos de uso

- Ilustración y arte conceptual: artistas pueden generar bocetos o ideas visuales en estilo anime usando etiquetas Danbooru, iterando rápidamente sobre composiciones y personajes.
- Producción de contenido para novelas visuales o juegos: el modelo permite crear sprites, fondos y escenas con estética consistente, aprovechando el soporte LoRA para mantener el estilo de un proyecto.
- Generación de avatares y retratos personalizados: usuarios pueden crear imágenes de perfil o ilustraciones de personajes originales describiendo atributos con etiquetas específicas.
- Prototipado de diseño de personajes: diseñadores de personajes pueden explorar variaciones de vestimenta, peinado o expresiones mediante prompts iterativos y prompt negativo para refinar resultados.
- Creación de storyboards para animación: la capacidad de generar fotogramas amplios (hasta 1536×1536) facilita la previsualización de escenas con composiciones complejas.
- Entornos de desarrollo y pruebas locales: al ejecutarse completamente en Apple Silicon con MLX, es adecuado para integración en flujos de trabajo sin GPU dedicada, como estaciones de trabajo de ilustradores o estudios pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento como FID, CLIP score o tiempos de inferencia comparativos. La ausencia de datos impide realizar una evaluación cuantitativa frente a otros modelos de difusión de anime.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (M1, M2, M3 y posteriores) mediante la librería MLX.
- El nivel q4 es el más ligero y recomendado para dispositivos con menor memoria unificada (por ejemplo, 8 GB o 16 GB), mientras que q8 y bf16 requieren progresivamente más memoria.
- La VAE densa y las capas convolucionales en precisión completa incrementan el consumo de memoria, pero el empaquetado pre-cuantizado evita picos de memoria durante la carga.
- No se proporcionan cifras exactas de VRAM ni de latencia en la información disponible.
- Despliegue mediante `mlx-gen` (librería de SceneWorks) o integración en la aplicación de escritorio SceneWorks, que también soporta Windows/Linux con CUDA mediante candle, aunque este modelo específico está orientado a MLX.
- No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Base | Cuantizacion | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/illustrious-xl-v1-mlx | SDXL | q4/q8/bf16 | Apple Silicon (MLX) | OpenRAIL++ | HuggingFace |
| OnomaAIResearch/Illustrious-XL-v1.0 | SDXL | denso (fp16) | Multiplataforma (diffusers) | OpenRAIL++ | HuggingFace |
| Otros finetunes anime SDXL (p. ej. Anything V5, Counterfeit) | SDXL o SD1.5 | variable | Multiplataforma | variable | HuggingFace |

La comparativa se limita a aspectos estructurales, ya que no se dispone de datos de rendimiento. La principal diferencia frente al modelo base es la optimización para Apple Silicon y la reducción de memoria mediante cuantización, a costa de una posible pérdida mínima de calidad en los niveles q4 y q8. Otros finetunes anime de SDXL pueden ofrecer estilos distintos, pero no están optimizados para MLX.

## Limitaciones y advertencias

- El modelo está entrenado con etiquetas Danbooru, lo que puede reflejar sesgos presentes en ese corpus, incluyendo representaciones estereotipadas o contenido sexualizado.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar detalles inconsistentes, anatomía incorrecta o artefactos, especialmente en composiciones complejas o con prompts ambiguos.
- La cuantización q4 puede degradar ligeramente la fidelidad de los detalles finos en comparación con bf16, aunque no se han publicado evaluaciones cuantitativas.
- La licencia OpenRAIL++ permite uso comercial, pero impone restricciones de uso conductual: no se permite generar contenido ilegal, engañoso, discriminatorio o que viole la privacidad, entre otras limitaciones.
- El modelo no soporta otros idiomas de forma explícita; los prompts se basan principalmente en vocabulario inglés de Danbooru, aunque el codificador CLIP puede interpretar ciertas frases en otros idiomas con menor precisión.
- No se garantiza compatibilidad con versiones futuras de `mlx-gen` o cambios en el ecosistema MLX; el empaquetado es específico para la versión actual.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SceneWorks/illustrious-xl-v1-mlx)
- [Repositorio del modelo base (OnomaAIResearch/Illustrious-XL-v1.0)](https://huggingface.co/OnomaAIResearch/Illustrious-XL-v1.0)
- [Repositorio de SceneWorks en GitHub](https://github.com/SceneWorks/SceneWorks)
- [Script de construcción de turnkey SDXL](https://github.com/SceneWorks/SceneWorks/blob/main/scripts/build_sdxl_turnkey.py)
