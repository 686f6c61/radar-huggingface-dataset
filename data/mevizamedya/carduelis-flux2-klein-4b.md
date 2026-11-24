# MevizaMedya/carduelis-flux2-klein-4b

## Resumen

Carduelis FLUX.2 klein 4B es un repositorio espejo (mirror) que redistribuye, sin modificaciones, el conjunto de pesos necesario para ejecutar generación y edición de imágenes totalmente offline sobre Apple Silicon mediante MLX. No es un modelo entrenado por su autor: agrupa la cuantización int8 de FLUX.2 klein 4B de Black Forest Labs, su VAE, el decodificador pequeño (FLUX.2 small decoder) y una conversión MLX de Qwen3-4B empleada como codificador de texto, todo empaquetado con la estructura de carpetas que espera la librería `flux-2-swift-mlx`.

El interés práctico del repositorio es la reproducibilidad: la aplicación macOS Carduelis descarga un único conjunto versionado en lugar de resolver dependencias desde cuatro repositorios distintos, lo que simplifica el despliegue y evita desajustes de versión entre el transformer, el VAE, el decoder y el text encoder. El modelo subyacente, FLUX.2 klein 4B, es un modelo de difusión de texto a imagen con capacidades de edición, de aproximadamente 4.000 millones de parámetros, distribuido bajo licencia Apache 2.0.

Conviene subrayar que el repositorio no incluye FLUX.2 klein 9B, deliberadamente excluido por estar bajo la FLUX Non-Commercial License y sujeto a acceso restringido. Tampoco hay información publicada en la model card sobre idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (flow matching) para texto a imagen y edición, con text encoder Qwen3-4B, VAE y decodificador pequeño; ejecución vía MLX |
| Parametros totales | ~4B en el transformer FLUX.2 klein 4B (dato inferido del nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (aplica al text encoder Qwen3-4B, no documentado en esta ficha) |
| Tipos de cuantizacion | int8 para el transformer (carpeta `klein4b-8bit`); 8 bits para el text encoder Qwen3-4B en MLX; precisión del VAE y del decoder no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `library_name: mlx` y compatibilidad con `diffusers` |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento del modelo base. Por la información disponible, FLUX.2 klein 4B es un modelo de difusión de la familia FLUX.2 de Black Forest Labs, orientado a texto a imagen y edición de imágenes, con un transformer de aproximadamente 4.000 millones de parámetros. El pipeline completo requiere cuatro componentes: el transformer cuantizado a int8, el VAE de FLUX.2 klein 4B, el decodificador pequeño (`FLUX.2-small-decoder`) y un text encoder Qwen3-4B convertido a MLX en 8 bits.

La innovación relevante de este repositorio no está en el entrenamiento sino en el empaquetado: los pesos se redistribuyen sin modificar y con un diseño de carpetas fijo que coincide con lo que espera `flux-2-swift-mlx`, lo que permite ejecución nativa en Apple Silicon sin dependencias de red en tiempo de inferencia. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`).
- Edición de imágenes, según la etiqueta `image-editing` del repositorio.
- Ejecución totalmente offline en hardware Apple Silicon mediante MLX.
- Integración con el ecosistema `diffusers` a través de los pesos safetensors.
- Codificación de texto mediante Qwen3-4B en formato MLX de 8 bits.
- No se documentan capacidades de tool calling, agentes, visión de entrada arbitraria, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de imágenes offline en macOS: la app Carduelis descarga este conjunto versionado y ejecuta la inferencia en local sobre Apple Silicon, sin enviar prompts a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Edición de imágenes en dispositivo: la etiqueta `image-editing` y la inclusión del VAE y del decoder pequeño permiten flujos de modificación de imágenes existentes sin conexión.
- Desarrollo y prototipado de apps nativas Swift/MLX: el diseño de carpetas compatible con `flux-2-swift-mlx` facilita integrar el pipeline en proyectos macOS sin gestionar manualmente cuatro repositorios.
- Reproducibilidad en CI o distribución de apps: al fijar una versión concreta de los cuatro componentes en un solo repositorio, se evitan roturas por actualizaciones upstream.
- Investigación sobre cuantización int8 en difusión: el repositorio permite comparar la cuantización int8 de FLUX.2 klein 4B con los pesos originales en el mismo entorno MLX.
- Evaluación de pipelines multimodal texto-imagen con text encoder Qwen3-4B: útil para estudiar el impacto del codificador de texto en la calidad de generación dentro de un stack MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica directamente; el repositorio está orientado a memoria unificada de Apple Silicon. El tamaño total del repo es de 4,7 GB, lo que da una cota inferior aproximada del espacio necesario en disco y en memoria para cargar los pesos.
- GPU recomendadas: no disponible para CUDA; el destino declarado es Apple Silicon (MLX). No se documentan modelos concretos de chip (M1, M2, M3, M4) ni cantidades de memoria unificada mínimas.
- Compatibilidad con GPU de consumo: no confirmada; el stack MLX está pensado para Apple Silicon, no para GPUs NVIDIA.
- Opciones de despliegue: MLX y `flux-2-swift-mlx`; los pesos safetensors son compatibles con `diffusers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a este pipeline de difusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Carduelis FLUX.2 klein 4B (este repo) | ~4B (transformer) | Texto a imagen y edición | Apache 2.0 | Público en Hugging Face |
| FLUX.2 klein 4B (original) | ~4B | Texto a imagen y edición | Apache 2.0 | Público en Hugging Face |
| FLUX.2 klein 9B | ~9B (no confirmado) | Texto a imagen y edición | FLUX Non-Commercial License | Restringido (gated) |
| Qwen3-4B (text encoder incluido) | 4B | Modelo de lenguaje, no generativo de imagen | Apache 2.0 | Público en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo no oficial: no está afiliado, patrocinado ni respaldado por Black Forest Labs, el equipo de Qwen ni LM Studio.
- Los pesos se redistribuyen sin modificar; la autoría y responsabilidad del comportamiento del modelo recaen en los autores originales.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones de idioma; la ausencia de esta información impide evaluar riesgos de sesgo de forma rigurosa.
- La licencia Apache 2.0 permite uso comercial de los archivos de este repositorio, pero deben respetarse las restricciones de uso de las model cards originales (por ejemplo, prohibición de usos ilícitos y de imágenes íntimas no consentidas).
- FLUX.2 klein 9B queda excluido por su licencia no comercial y acceso restringido; no debe asumirse que este repositorio habilita su uso.
- El soporte está limitado a Apple Silicon y MLX; no hay garantías de funcionamiento en CUDA ni en otras plataformas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.
- No hay información sobre latencia, consumo de memoria en producción ni calidad de salida frente a los pesos originales sin cuantizar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MevizaMedya/carduelis-flux2-klein-4b
- Modelo base FLUX.2 klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Decodificador pequeño FLUX.2: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- FLUX.2 klein 9B (restringido, licencia no comercial): https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Cuantización int8 de FLUX.2 klein 4B: https://huggingface.co/aydin99/FLUX.2-klein-4B-int8
- Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Conversión MLX de Qwen3-4B: https://huggingface.co/lmstudio-community/Qwen3-4B-MLX-8bit
- Librería flux-2-swift-mlx: https://github.com/VincentGourbin/flux-2-swift-mlx
- Black Forest Labs en Hugging Face: https://huggingface.co/black-forest-labs
