# chs35/improving-ca-lora-checkpoints

## Resumen

Improving CA-LoRA checkpoints es una colección de adaptadores LoRA experimentales para Stable Diffusion XL (SDXL) publicada por el usuario chs35 en Hugging Face. No se trata de un modelo generativo autónomo, sino de un conjunto de pesos auxiliares que modifican el comportamiento del modelo base `stabilityai/stable-diffusion-xl-base-1.0` para la generación de imágenes de escenas urbanas del dataset Cityscapes. Su interés es fundamentalmente investigador: documenta la reproducción y extensión del método CA-LoRA (Concept-Aware LoRA), que selecciona únicamente cabezas de atención individuales (en lugar de matrices de proyección completas) para adaptar el modelo.

La innovación principal es el denominado *head slicing*: en lugar de aplicar LoRA sobre toda una matriz de proyección de atención, cada adaptador modifica solo aproximadamente el 2 % de las cabezas de atención que una medición de atribución de conceptos (CA) identifica como relevantes en un paso de difusión concreto. El repositorio contiene diez ejecuciones experimentales que cubren distintas combinaciones de criterio de selección temporal (t = 81, t = 41, t = 1, multi-t) y eje conceptual (estilo o punto de vista), además de dos controles (cabezas aleatorias y LoRA completo).

El modelo está pensado para reproducir los resultados de las Tablas 3 y 5 de un informe técnico del autor, correspondientes a un experimento few-shot con 10 imágenes de Cityscapes. No es un modelo listo para producción: requiere una librería propia (`calora`) y no es cargable con `peft` ni `diffusers` estándar. El repositorio ocupa 6,8 GB y los adaptadores se distribuyen como ficheros `.safetensors` con un formato personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA head-sliced sobre SDXL (UNet transformer con atención) |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base SDXL no se incluye) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión text-to-image, no aplica contexto textual de LLM) |
| Tipos de cuantizacion | no disponible (pesos en f32 para lora_A y lora_B) |
| Idiomas soportados | no disponible (prompts en inglés por herencia de SDXL) |
| Licencia | openrail++ |
| Formato de pesos | safetensors con layout personalizado (`lora_A`, `lora_B`, `lora_head_indices`) |

## Arquitectura y entrenamiento

Los adaptadores se aplican sobre el UNet de SDXL y siguen el esquema LoRA con rango 64 y alpha 64. La particularidad es que la matriz LoRA no cubre la proyección completa, sino únicamente un subconjunto de cabezas de atención seleccionadas por una medición de atribución de conceptos. La selección se realiza en un paso de difusión concreto (t = 81, 41 o 1, o agregación multi-t sobre los tres principales) y sobre un eje conceptual (estilo o punto de vista). El resultado son adaptadores que modifican entre 168 y 1680 tensores según la ejecución, frente a los 20 tensores del piloto a granularidad de módulo completo.

El entrenamiento se realizó sobre el split `train` de Cityscapes en una primera fase (2.975 imágenes) y posteriormente en un experimento few-shot con solo 10 imágenes seleccionadas aleatoriamente (noviembre de 2026). Cada ejecución se entrena durante 10.000 pasos, con checkpoints intermedios cada 2.000 pasos, lo que permite analizar la deriva de la medición CA a lo largo del entrenamiento (Tabla 5 del informe). No se documentan datos sobre composición del dataset más allá de Cityscapes, ni sobre el uso de RLHF o DPO, que no aplican a un modelo de difusión.

## Capacidades

- Generación de imágenes text-to-image sobre el modelo base SDXL, especializada en escenas urbanas de estilo Cityscapes.
- Adaptación controlada de conceptos de estilo y punto de vista mediante selección de cabezas de atención.
- Reproducción de experimentos de investigación: los checkpoints permiten re-ejecutar las métricas de las Tablas 3 y 5 del informe.
- Análisis de deriva de la atribución de conceptos durante el entrenamiento mediante los checkpoints intermedios.
- Ablación de granularidad: incluye un piloto a granularidad de módulo para comparar con la granularidad de cabeza.
- Controles experimentales incluidos: cabezas aleatorias (2 %) y LoRA completo sin selección CA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la generación de imagen.

## Casos de uso

- Reproducción de investigación en adaptación eficiente de modelos de difusión: el repositorio permite replicar exactamente los resultados del informe del autor cargando cada ejecución con la librería `calora` y comparando las métricas reportadas.
- Estudio de atribución de conceptos en difusión: los ficheros `lora_head_indices` y las mediciones CA compartidas en el repositorio de artefactos permiten analizar qué cabezas de atención son responsables de conceptos como estilo o punto de vista.
- Análisis de la evolución del entrenamiento: los checkpoints cada 2.000 pasos permiten estudiar cómo cambia la selección de cabezas (Jaccard, Spearman) a lo largo de la trayectoria de optimización.
- Ablación metodológica: comparar head-sliced LoRA frente a LoRA completo y frente a selección aleatoria de cabezas para cuantificar la contribución real de la selección CA.
- Experimentos few-shot en generación de imágenes: el adaptador entrenado con 10 imágenes de Cityscapes sirve como punto de partida para estudiar adaptación con pocos datos en dominios visuales concretos.
- Docencia y divulgación técnica: el repositorio, con su estructura de ejecuciones y controles, es un ejemplo didáctico de diseño experimental riguroso en adaptación de modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio remite a las Tablas 3 y 5 de un informe técnico del autor, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base SDXL (habitualmente entre 8 y 12 GB en fp16 con optimizaciones) más el adaptador LoRA, que añade una sobrecarga mínima.
- GPU recomendadas: no disponible en la información proporcionada; por el modelo base, se puede inferir que se requiere una GPU con al menos 8 GB de VRAM, como RTX 3060/4060 o superiores, aunque no se confirma.
- Compatibilidad con GPU de consumo: probable, al tratarse de un adaptador sobre SDXL, pero no confirmado explícitamente.
- Opciones de despliegue: exclusivamente mediante la librería `calora` del repositorio de código Improving-CA-LoRA, con el script `scripts/generate_images.py` o la función `calora.train.lora.load_lora`. No es compatible con `peft`, `diffusers`, vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Improving CA-LoRA checkpoints | LoRA head-sliced sobre SDXL | no disponible (adaptador) | no aplica | openrail++ | Hugging Face, requiere librería `calora` |
| LoRA estándar para SDXL | Adaptador LoRA completo | no disponible | no aplica | variable según autor | Amplia, compatible con `peft` y `diffusers` |
| SDXL base | Modelo de difusión completo | no disponible en la información | no aplica | openrail++ | Hugging Face, `diffusers` |
| CA-LoRA original (paper) | LoRA con selección CA | no disponible | no aplica | no disponible | No disponible en la información |

## Limitaciones y advertencias

- Formato personalizado: los checkpoints no se pueden cargar con `peft` ni con `diffusers`; requieren la librería `calora`, lo que limita su integración en pipelines estándar.
- Ausencia de benchmarks públicos: no se han publicado métricas numéricas en la información disponible, por lo que no es posible evaluar su rendimiento frente a alternativas sin consultar el informe del autor.
- Carácter experimental: es un artefacto de investigación, no un modelo listo para producción; no hay garantías de estabilidad ni soporte.
- Sesgos: al entrenarse sobre Cityscapes, el adaptador está sesgado hacia escenas urbanas de estilo europeo y puede degradar la generación en otros dominios visuales.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar detalles inexistentes o incoherentes, especialmente fuera del dominio de entrenamiento.
- Limitaciones de idioma: no se documentan idiomas soportados; los prompts en inglés son el caso esperado por herencia de SDXL.
- Restricciones de licencia: openrail++ permite uso comercial con condiciones, pero el modelo base SDXL tiene sus propios términos que deben respetarse.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Los artefactos del repositorio de datasets provienen de una ejecución anterior (split completo), no de los adaptadores few-shot actuales, lo que puede inducir a confusión si se comparan directamente.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/chs35/improving-ca-lora-checkpoints
- Repositorio de artefactos y mediciones CA: https://huggingface.co/datasets/chs35/improving-ca-lora-artifacts
- Revisión de la ejecución anterior (split completo): https://huggingface.co/chs35/improving-ca-lora-checkpoints/tree/db005e2c124b6666c27b8a788cd5a1f6c1f3f080
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Repositorio de código Improving-CA-LoRA: no disponible en la información proporcionada
- Paper original de CA-LoRA: no disponible en la información proporcionada
