# MedMLX/sam3-interactive

## Resumen

MedMLX/sam3-interactive es un conjunto de pesos en formato MLX (float32) que implementa la cabeza interactiva de SAM 3, el modelo de segmentación de Meta. Concretamente, contiene el codificador de prompts, el decodificador de máscaras y el tensor `no_mem_embed` del tracker, extraídos de `sam3.pt` y renombrados para que coincidan con la estructura que espera el constructor de imágenes de SAM 3. No se ha reentrenado ningún tensor: se trata de una conversión de pesos, no de un fine-tuning.

El modelo lo publica MedMLX, un proyecto centrado en inferencia de imagen médica en dispositivo para Apple Silicon, y está pensado para usarse junto con `mlx-community/sam3-image`, que contiene los pesos de imagen pero no la cabeza interactiva. La librería `sam3-mlx` descarga este repositorio en el primer uso y habilita segmentación interactiva al estilo SAM 1 (prompts de punto, caja y máscara) sobre hardware Apple.

Su relevancia es doble: por un lado, permite ejecutar el flujo interactivo de SAM 3 de forma nativa en MLX sobre Apple Silicon; por otro, el autor lo orienta explícitamente a imagen médica, aunque advierte que la precisión de SAM 3 en ese dominio no está establecida y que se trata de uso educativo y de investigación. El tamaño real de los safetensors es de 4.221.841 parámetros, correspondiente solo a la cabeza interactiva, no al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza interactiva de SAM 3 (codificador de prompts, decodificador de máscaras y `no_mem_embed` del tracker) sobre pesos de imagen SAM 3; transformer de segmentación con prompts |
| Parametros totales | 4.221.841 (solo la cabeza interactiva; los pesos de imagen están en `mlx-community/sam3-image`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión; no aplica ventana de texto) |
| Tipos de cuantizacion | Pesos nativos en float32; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo de segmentación de imagen, sin capacidades lingüísticas) |
| Licencia | SAM License (`sam-license`, marcada como `other`); trabajos derivados de SAM Materials |
| Formato de pesos | safetensors en formato MLX (convoluciones en layout channels-last) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma independiente, sino una conversión de tensores. Los pesos provienen de `sam3.pt` de Meta (repositorio `facebook/sam3`, commit `3c879f39826c281e95690f02c7821c4de09afae7`) y corresponden al codificador de prompts, el decodificador de máscaras y el embedding `no_mem_embed` del tracker. Los tensores se han renombrado al prefijo `inst_interactive_predictor.model.*`, siguiendo el mismo criterio que el constructor de imágenes de SAM 3, y las convoluciones se han adaptado al layout channels-last de MLX.

No hay entrenamiento adicional, RLHF, DPO ni ajuste fino: el autor indica explícitamente que los tensores «have not been retrained». La validación realizada es una comprobación de conversión: cada valor convertido coincide con el tensor correspondiente en `sam3.pt` y, sobre tres imágenes médicas con prompts de punto, caja y combinados, la cabeza MLX y el SAM 3 de PyTorch original (commit `2814fa6`) producen los mismos IoU predichos, logits de baja resolución con una diferencia máxima de 3e-4 y máscaras que difieren como mucho en un píxel. El autor subraya que esto es una verificación de conversión, no una validación clínica.

## Capacidades

- Segmentación interactiva de imágenes mediante prompts de punto, caja y máscara, con el mismo flujo que SAM 1 (`predict_inst`).
- Generación de máscaras con puntuaciones de IoU predichas para cada prompt.
- Integración nativa con MLX y Apple Silicon, incluyendo layout channels-last para convoluciones.
- Uso conjunto con los pesos de imagen de `mlx-community/sam3-image` para completar el pipeline de SAM 3.
- Soporte de prompts combinados (punto + caja + máscara) en una misma inferencia.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es un modelo exclusivamente de visión.
- No se documentan modos especiales como thinking, visión adicional o audio.

## Casos de uso

- Segmentación interactiva en investigación médica: anotación asistida de estructuras en imágenes médicas con prompts de punto o caja, usando la cabeza MLX sobre Apple Silicon; el autor advierte que la precisión clínica no está establecida y que la salida requiere revisión humana.
- Prototipado en portátiles Mac: desarrollo y prueba de pipelines de segmentación sin GPU dedicada, aprovechando la ejecución nativa en MLX y el formato float32.
- Herramientas de anotación semiautomática: integración en interfaces donde el usuario hace clic en un punto o dibuja una caja y el modelo devuelve la máscara y su IoU, gracias a la API `predict_inst`.
- Comparación de implementaciones: verificación de portabilidad entre PyTorch y MLX usando la equivalencia documentada de logits e IoU como referencia de conversión.
- Educación y demostraciones: reproducción del flujo interactivo de SAM 3 en entornos Apple para docencia sobre segmentación con prompts.
- Preprocesado en pipelines de imagen médica: generación de máscaras candidatas para tareas posteriores (medición, clasificación), siempre con revisión humana dada la falta de validación clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una comprobación de equivalencia numérica frente a PyTorch SAM 3: mismos IoU predichos, logits de baja resolución con diferencia máxima de 3e-4 y máscaras con diferencia máxima de un píxel sobre tres imágenes médicas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la cabeza interactiva tiene 4.221.841 parámetros en float32 (aproximadamente 17 MB solo en pesos), pero el pipeline completo requiere además los pesos de imagen de `mlx-community/sam3-image`.
- GPU recomendadas: hardware Apple Silicon con soporte MLX; no se documentan requisitos para A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? El objetivo declarado es Apple Silicon (Mac con chip de la serie M); no se indica compatibilidad con GPU NVIDIA de consumo.
- Opciones de despliegue: librería `sam3-mlx` (descarga automática en el primer uso); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (cabeza/alcance) | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/sam3-interactive | 4.221.841 (solo cabeza interactiva) | No aplica | safetensors MLX | SAM License | HuggingFace, 0 descargas |
| facebook/sam3 (original) | No disponible en la informacion | No aplica | Pesos PyTorch (`sam3.pt`) | SAM License | HuggingFace |
| mlx-community/sam3-image | No disponible en la informacion | No aplica | MLX | No disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes; la única referencia es la equivalencia numérica documentada frente a PyTorch SAM 3.

## Limitaciones y advertencias

- No es un modelo completo: solo contiene la cabeza interactiva; sin los pesos de imagen de `mlx-community/sam3-image` no funciona.
- No ha sido reentrenado ni ajustado a dominio médico; la precisión de SAM 3 en imagen médica no está establecida.
- La validación realizada es una comprobación de conversión (tres imágenes), no una validación clínica ni un benchmark.
- Uso restringido a investigación y educación; las salidas requieren revisión humana.
- Licencia SAM License: los pesos son derivados de SAM Materials y las publicaciones que los usen deben reconocer SAM; hay que revisar el archivo `LICENSE` para condiciones de uso comercial.
- El proyecto no está afiliado a Meta.
- Sin datos sobre sesgos, alucinación (no aplica a texto), idiomas ni latencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/MedMLX/sam3-interactive
- Pesos de imagen complementarios: https://huggingface.co/mlx-community/sam3-image
- Modelo base: https://huggingface.co/facebook/sam3
- Repositorio SAM 3 de Meta: https://github.com/facebookresearch/sam3
- Librería sam3-mlx: https://github.com/MedMLX/sam3-mlx
- Paper MedMLX: https://doi.org/10.64898/2026.10.28.26366762
