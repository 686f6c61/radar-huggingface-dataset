# shriwastav/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicado por el usuario shriwastav. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales del modelo base a distintos niveles de precisión (de BF16 a Q4_0), acompañada de los archivos auxiliares necesarios para ejecutarlo en local: el text encoder Qwen3-VL 8B y el VAE propio del modelo. El objetivo es permitir la inferencia de un modelo de difusión text-to-image en hardware de consumo dentro de ComfyUI, sin depender de servicios en la nube.

La relevancia de esta ficha está en dos factores. Por un lado, el pipeline completo (transformador de difusión, text encoder y VAE) se distribuye dentro del mismo repositorio, lo que simplifica el despliegue. Por otro, la variante marcada como "uncensored" elimina o relaja las restricciones de contenido del modelo original, algo que interesa a quienes investigan generación de imágenes sin filtros, pero que conlleva implicaciones legales y de moderación importantes.

El repositorio indica 7.115.124.736 parámetros (unos 7,1 mil millones) y un tamaño total de 69,2 GB, y declara licencia qwen-research. La model card no aporta información sobre idiomas soportados, longitud de contexto ni arquitectura interna, y los resultados de benchmark se remiten únicamente a una imagen sin valores numéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; la estructura distribuida (transformador de difusión en GGUF, VAE independiente y text encoder Qwen3-VL 8B) corresponde a un pipeline de difusión latente text-to-image |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 mil millones), según los pesos safetensors del modelo base |
| Parametros activos | No aplica; no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible (no aplica como ventana de contexto de texto; el límite práctico lo fija el text encoder Qwen3-VL 8B) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (dos juegos: variante "uncensored" y variante base) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (declarada como license: other en HuggingFace) |
| Formato de pesos | GGUF para el transformador de difusión; safetensors para el text encoder y el VAE |
| Text encoder | Qwen3-VL 8B, en BF16 (17,53 GB) o Int8 (9,35 GB) |
| VAE | qwen_image_2.1_vae_bf16.safetensors, 676 MB |
| Tamano del repositorio | 69,2 GB |
| Tarea declarada | text-to-image |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo ni el proceso de entrenamiento: no se indican número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de ajuste por preferencias humanas (RLHF, DPO u otras). Lo único deducible de la información disponible es la topología del pipeline de inferencia: un transformador de difusión en formato GGUF, un text encoder multimodal Qwen3-VL de 8B parámetros y un VAE específico del modelo (qwen_image_2.1_vae_bf16). Esta separación en tres componentes es la habitual en los modelos de difusión latente actuales y es la que ComfyUI explota para repartir la carga entre GPU y CPU.

El repositorio no documenta ningún entrenamiento adicional: se presenta explícitamente como una cuantización de los pesos upstream originales de Qwen/Qwen-Image-2.1. La única intervención declarada por el autor es la variante "uncensored", que se ofrece tanto en BF16 como en cuantizaciones, y que según la model card se ha generado a partir de los pesos base upstream. No se detalla la metodología aplicada para eliminar el filtrado de contenido, ni qué capas o pesos se han modificado.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. El aspecto técnico más relevante documentado es la estrategia de reparto de memoria: mantener el transformador de difusión en VRAM de la GPU y ejecutar el text encoder en RAM del sistema (o hacer offload), ya que la codificación de texto se ejecuta una sola vez por prompt y esto ahorra entre 9 y 17 GB de VRAM sin coste apreciable de velocidad.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image), tarea principal declarada del repositorio.
- Edición de imágenes: la model card enlaza una plantilla oficial de ComfyUI para image edit, lo que indica soporte del pipeline para esta modalidad.
- Funcionamiento totalmente local dentro de ComfyUI mediante el nodo Unet Loader (GGUF).
- Cuantizaciones progresivas que permiten ajustar el equilibrio entre calidad y consumo de memoria (de BF16 a Q4_0).
- Variante sin censura de contenido, orientada a prompts que el modelo base rechazaría o filtraría.
- Compatibilidad con los archivos auxiliares empaquetados en el propio repositorio (text encoder y VAE), lo que evita dependencias externas.
- Integración con plantillas de flujo de trabajo oficiales de Comfy-Org para text-to-image e image edit.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vídeo; no aplican a un modelo de esta categoría.

## Casos de uso

- Generación de arte conceptual en local: un estudio puede producir bocetos y variaciones de personajes o escenarios con la cuantización Q4_K_M (unos 4,6 GB) en una GPU de gama media, sin enviar material a terceros.
- Ilustración para prototipos de producto: la plantilla de image edit permite partir de una foto o render existente y modificar estilo, iluminación o fondo, útil para presentaciones comerciales antes de encargar trabajo final.
- Creación de recursos para videojuegos: generación por lotes de texturas, iconos o fondos en ComfyUI, con el transformador en VRAM y el text encoder en RAM para maximizar el rendimiento del muestreo.
- Investigación sobre filtrado de contenido: la variante "uncensored" permite estudiar qué tipo de prompts son rechazados por el modelo original y cómo se comporta la misma arquitectura sin salvaguardas, en un entorno controlado.
- Construcción de conjuntos de datos sintéticos: generar imágenes etiquetadas a partir de prompts controlados para entrenar o evaluar otros modelos de visión, siempre que la licencia qwen-research lo permita.
- Automatización de marketing y redes sociales: pipelines en ComfyUI que producen variantes de una misma creatividad a partir de listas de prompts, con la ventaja de no depender de APIs externas ni de coste por imagen.
- Despliegue en equipos sin GPU de gama alta: las cuantizaciones Q4_0 (unos 4,15 GB) y Q4_K_M permiten ejecutar el modelo en GPU de consumo con 8-12 GB de VRAM, manteniendo el text encoder en CPU.
- Pruebas comparativas de cuantización: evaluar la pérdida de calidad entre BF16, Q8_0 y Q4_K_M sobre el mismo conjunto de prompts, un caso habitual en equipos que ajustan infraestructura de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una referencia a una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) sin valores ni métricas asociadas, por lo que no es posible extraer cifras de FID, CLIP score ni comparaciones cuantitativas.

| Benchmark | Resultado |
|---|---|
| MMLU / HumanEval / GSM8K | No aplica (modelo de generación de imágenes) |
| Métricas de generación de imagen (FID, CLIP, etc.) | No disponible |
| Comparativas de calidad entre cuantizaciones | No disponible |

## Requisitos de hardware

- VRAM para el transformador de difusión: aproximadamente 14,23 GB en BF16, 7,59 GB en Q8_0, 5,88 GB en Q6_K, 5,22 GB en Q5_K_M, 4,60 GB en Q4_K_M y 4,15 GB en Q4_0 (datos de tamaño de archivo de la model card).
- Text encoder Qwen3-VL 8B: 17,53 GB en BF16 o 9,35 GB en Int8. Se recomienda ejecutarlo en RAM del sistema o hacer offload, ya que solo se usa una vez por prompt.
- VAE: 676 MB en BF16.
- Configuración mínima razonable: transformador Q4_0 o Q4_K_M en VRAM (unos 4-5 GB) más el text encoder en CPU; cabe en GPU de consumo con 8 GB de VRAM si se dispone de suficiente RAM para el text encoder.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090. Las tarjetas de 8 GB solo son viables con las cuantizaciones más agresivas y offload del text encoder.
- GPU de gama profesional (A100, H100) no son necesarias para una sola imagen, pero permiten mantener todo el pipeline en VRAM y procesar por lotes con mayor paralelismo.
- Opciones de despliegue documentadas: ComfyUI junto con ComfyUI-GGUF. La model card indica que debe usarse el fork mantenido por leejet, con soporte nativo de Qwen-Image 2.1; con el fork antiguo de city96 aparece el error `Unknown model architecture!`.
- No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card solo afirma que el offload del text encoder tiene un impacto "prácticamente nulo" en la velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1 Uncensored GGUF (este repositorio) | 7,1 mil millones (según safetensors) | GGUF + safetensors auxiliares | qwen-research | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Variante sin censura; incluye text encoder y VAE |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible en la información proporcionada | Pesos originales | qwen-research | HuggingFace | Referencia upstream; sin modificación de contenido |
| Otras cuantizaciones GGUF de difusión (por ejemplo, familias Flux o SD3.5) | No disponible | GGUF | Variable según modelo | HuggingFace | Comparativa cualitativa no posible sin datos de benchmark |

No se dispone de resultados de benchmark que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La variante "uncensored" elimina o relaja los filtros de contenido: puede generar material inapropiado, ofensivo o ilegal según la jurisdicción. El responsable del despliegue debe implementar su propia moderación.
- Ausencia total de datos sobre sesgos: la model card no documenta la composición del dataset ni sesgos conocidos de representación.
- Riesgo de alucinación visual: como cualquier modelo generativo, puede producir anatomías incorrectas, texto ilegible en las imágenes y elementos incoherentes con el prompt.
- Idiomas soportados no declarados: se desconoce si el text encoder funciona igual de bien con prompts en castellano que en inglés.
- Licencia qwen-research: es una licencia de investigación, no una licencia permisiva. Antes de cualquier uso comercial es imprescindible revisar los términos completos del modelo base; el repositorio no ofrece garantías adicionales.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día, por lo que no existe validación de la comunidad ni historial de mantenimiento.
- Inconsistencia de enlaces: los enlaces a archivos de la model card apuntan al repositorio de otro usuario (abenzerps/Qwen-Image-2.1-Uncensored-GGUF), no al repositorio shriwastav. Conviene verificar la procedencia real de cada archivo antes de descargarlo.
- No se documenta el método empleado para eliminar la censura, ni si los pesos han sido modificados, reentrenados o simplemente redistribuidos. Esto dificulta la reproducibilidad y la auditoría del modelo.
- El repositorio ocupa 69,2 GB, por lo que requiere espacio en disco considerable aunque solo se descargue una cuantización.
- Dependencia de un fork concreto de ComfyUI-GGUF (leejet) para evitar el error de arquitectura desconocida.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia objetiva de la calidad de las cuantizaciones frente al modelo en BF16.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shriwastav/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio referenciado en los enlaces de la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork mantenido, requerido): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork antiguo, citado como incompatible): https://github.com/city96/ComfyUI-GGUF
- Plantilla oficial de flujo text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial de flujo image edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Paper o blog técnico del modelo base: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada
