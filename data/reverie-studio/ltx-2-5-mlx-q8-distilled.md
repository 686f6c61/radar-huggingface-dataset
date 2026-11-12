# reverie-studio/ltx-2.5-mlx-q8-distilled

## Resumen

LTX-2.5 distilled en formato MLX int8 es una conversión del modelo de generación de vídeo LTX-2.5 de Lightricks, empaquetada para su ejecución en Apple Silicon mediante la librería `ltx-2-mlx`. El modelo original es un sistema de difusión texto-a-vídeo e imagen-a-vídeo; esta versión concreta es un espejo mantenido por Reverie Studio de la conversión y cuantización realizadas por dgrauet, pensado para que la aplicación de Reverie pueda descargar los pesos sin requerir una cuenta de Hugging Face.

El repositorio contiene únicamente el transformer **distilled**, es decir, la variante destilada del modelo, y omite el transformer dev y el LoRA destilado presentes en el repositorio original de dgrauet. Los pesos están cuantizados a int8 con tamaño de grupo 64, lo que reduce el espacio en disco y la memoria necesaria para inferencia en hardware Apple, a costa de una posible pérdida de calidad frente a los pesos en precisión completa.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores evaluar el despliegue local de generación de vídeo en Macs con chip de la serie M, sin depender de servicios en la nube, aunque con las restricciones de licencia de la familia LTX-2.x y con la advertencia de que se trata de un espejo no oficial y sin cambios propios por parte de Reverie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo; el repositorio no detalla el backbone) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 con tamaño de grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (license: other) |
| Formato de pesos | safetensors (cuantizados, librería MLX) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo más allá de identificarlo como LTX-2.5 de Lightricks y describir el pipeline como image-to-video (con soporte también de text-to-video según las etiquetas). Se trata de un modelo de difusión para generación de vídeo, y esta versión concreta es la variante **distilled**, pensada para requerir menos pasos de muestreo que la variante dev. No se proporcionan datos sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

La innovación técnica relevante en este repositorio es el proceso de conversión y cuantización: dgrauet convirtió los pesos originales de Lightricks a formato MLX y los cuantizó a int8 con grupo de 64 mediante la herramienta `mlx-forge`. Reverie Studio no ha modificado los pesos, solo los ha replicado. El resultado es un conjunto de safetensors que la herramienta `ltx-2-mlx` puede cargar con la bandera `--distilled` para generar vídeo en Apple Silicon.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según las etiquetas del repositorio.
- Generación de vídeo a partir de una imagen de entrada (image-to-video), que es el pipeline declarado.
- Variante destilada: diseñada para inferencia con menos pasos de muestreo que la versión dev.
- Ejecución local en Apple Silicon mediante MLX.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá de la imagen de condicionamiento.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de clips cortos en local desde una Mac: usar `ltx-2-mlx generate --distilled` con una imagen de referencia y un prompt para producir vídeos de hasta 121 frames a 24 fps y resolución 1280x704, sin enviar datos a servicios externos.
- Prototipado de pipelines de vídeo generativo: integrar el modelo en un flujo de experimentación con MLX para comparar prompts, resoluciones y frame rates antes de decidir una arquitectura de producción.
- Animación de imágenes fijas para previsualización creativa: convertir storyboards o ilustraciones en clips animados breves para revisión interna de equipos de diseño.
- Demos y pruebas de concepto en dispositivos Apple: mostrar generación de vídeo en un MacBook o Mac Studio durante una presentación, aprovechando que no requiere cuenta ni backend remoto.
- Investigación sobre cuantización: evaluar el impacto de int8 con grupo de 64 en la calidad del vídeo generado frente a los pesos originales, usando este espejo como referencia reproducible.
- Automatización de contenido visual a pequeña escala: generar variaciones de clips para redes o material interno cuando el volumen es bajo y el coste de la nube no está justificado, siempre dentro de los límites de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 45,2 GB, por lo que se requiere memoria unificada suficiente para cargar los pesos cuantizados y ejecutar la difusión.
- GPU recomendadas: no disponibles; el modelo está orientado a Apple Silicon (chips de la serie M) mediante MLX.
- Compatibilidad con GPU consumer: no aplica a GPUs NVIDIA/AMD; requiere hardware Apple.
- Opciones de despliegue: `ltx-2-mlx` (herramienta oficial del port), con la bandera `--distilled`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reverie-studio/ltx-2.5-mlx-q8-distilled | no disponible | no disponible | no disponible | LTX-2.x Community | MLX, Apple Silicon |
| dgrauet/ltx-2.5-mlx-q8 | no disponible | no disponible | no disponible | LTX-2.x Community | MLX, Apple Silicon |
| Lightricks/LTX-2.5 | no disponible | no disponible | no disponible | LTX-2.x Community | Pesos originales |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un espejo no oficial: Reverie Studio no ha modificado los pesos, pero tampoco está afiliado ni respaldado por Lightricks.
- Solo incluye el transformer distilled; no contiene el transformer dev ni el LoRA destilado del repositorio de dgrauet, por lo que no sirve para flujos que requieran esas variantes.
- La cuantización int8 con grupo de 64 puede degradar la calidad del vídeo frente a los pesos en precisión completa; no se documenta el grado de degradación.
- Licencia restrictiva: la LTX-2.x Community License Agreement incluye restricciones de uso (Sección 4 y Anexo A) y una política de uso aceptable; las entidades con ingresos anuales de 10 millones de dólares o más necesitan una licencia de pago de Lightricks para cualquier uso que no sea no comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinación y artefactos visuales inherente a los modelos de difusión; no se aportan evaluaciones al respecto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.
- Requiere hardware Apple Silicon y la herramienta `ltx-2-mlx`; no es desplegable en infraestructura NVIDIA convencional.

## Enlaces

- Hugging Face: https://huggingface.co/reverie-studio/ltx-2.5-mlx-q8-distilled
- Modelo base (conversión MLX de dgrauet): https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
- Modelo original de Lightricks: https://huggingface.co/Lightricks/LTX-2.5
- Herramienta de inferencia ltx-2-mlx: https://github.com/dgrauet/ltx-2-mlx
- Herramienta de conversión mlx-forge: https://github.com/dgrauet/mlx-forge
- Licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Política de uso aceptable: https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf
