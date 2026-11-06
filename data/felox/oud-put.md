# Felox/oud-put

## Resumen

Felox/oud-put es un LoRA de texto a imagen publicado por el usuario Felox sobre el modelo base Krea-2-Turbo de Krea AI. Su función es reproducir de forma consistente un objeto concreto: un frasco de perfume ficticio llamado "oud-put", descrito en la documentación como botella de vidrio azul cobalto con tapón de rosca plateado estriado y monograma "e" en minúscula en relieve. El adaptador está pensado para generar packshots de producto, bodegones, tomas en mano y retratos editoriales de moda en los que el frasco aparece como elemento protagonista.

El repositorio es muy pequeño (0,2 GB) y no registra descargas ni valoraciones en el momento de la consulta, lo que lo sitúa como un experimento de autor más que como un recurso consolidado. La model card incluye únicamente prompts de ejemplo con sus imágenes de salida, sin detalles sobre el dataset de entrenamiento, hiperparámetros o metodología.

Su relevancia es acotada: demuestra el patrón habitual de los LoRA de producto para difusión, donde un único concepto visual se ancla mediante una palabra de activación (`oud-put`) y se combina con prompts largos y muy detallados de fotografía comercial. Resulta útil como referencia para quien quiera construir adaptadores similares de branding ficticio o prototipado de packaging.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Krea-2-Turbo; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (tamaño del repo: 0,2 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | krea-2-community-license (etiquetada como "other") |
| Formato de pesos | no disponible (repo de 0,2 GB; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation) acoplado al modelo de difusión Krea-2-Turbo mediante la relación `base_model_relation: adapter`. El LoRA inyecta matrices de bajo rango en las capas del modelo base para especializarlo en un concepto visual concreto, en este caso el frasco "oud-put", sin necesidad de reentrenar el modelo completo. La arquitectura interna del modelo base (tipo de transformer de difusión, mecanismo de atención, variante turbo de pocos pasos) no se detalla en la información disponible.

No se han publicado datos sobre el número de imágenes de entrenamiento, la composición del dataset, el número de pasos, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de regularización o captions automáticos. Tampoco hay información sobre el proceso de destilación o ajuste que da lugar a la variante Turbo del modelo base. La única información de entrenamiento implícita es la palabra de activación `instance_prompt: oud-put`, que debe incluirse en los prompts para invocar el concepto.

## Capacidades

- Generación de imágenes fotorrealistas de producto a partir de descripciones textuales en inglés.
- Reproducción consistente de un objeto concreto (frasco de perfume "oud-put") mediante la palabra de activación `oud-put`.
- Composición de bodegones y still lifes con control de materiales, iluminación e intrincación mediante prompts detallados.
- Generación de packshots publicitarios con estética editorial de revista de lujo.
- Tomas en mano y retratos editoriales en los que el producto se integra en una escena con personajes (el ejemplo de la model card usa el token `<character1>`).
- Control de encuadre, ángulo de cámara, esquema de iluminación (luz dura de estrobo, luz suave frontal) y paleta de color a través del prompt.
- Integración con ComfyUI, según las etiquetas del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio, ya que es un modelo exclusivamente de texto a imagen.

## Casos de uso

- Prototipado de packaging: generar variaciones visuales del frasco "oud-put" en distintos entornos (hormigón, fondo blanco, papel cálido) para evaluar la percepción de marca antes de producir un envase real.
- Creación de material publicitario para fragancias: producir packshots con iluminación de estudio dura y sombras gráficas, listos para maquetas de revista o campañas digitales.
- Bodegones editoriales: combinar el frasco con elementos naturales (piel de limón, bloques de hormigón) para construir escenas de still life con estética brutalista y acabado de revista de lujo.
- Retratos de producto en mano: integrar el frasco en escenas con modelos mediante el token `<character1>`, útil para catálogos de moda o belleza.
- Exploración de dirección de arte: iterar rápidamente sobre ángulos de cámara, esquemas de luz y paletas (grises fríos, blancos, amarillo limón) sin necesidad de una sesión fotográfica.
- Referencia para entrenamiento de LoRA de producto: servir como ejemplo de estructura de model card y de prompts para quienes desarrollen adaptadores de branding propio sobre Krea-2-Turbo.
- Generación de variantes de color o material del frasco mediante edición del prompt, útil en pruebas de concepto de línea de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el LoRA; depende enteramente del modelo base Krea-2-Turbo, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del adaptador (0,2 GB) es reducido, pero el consumo real lo determina el modelo base.
- Opciones de despliegue: ComfyUI (mencionado en las etiquetas del repositorio). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de difusión de imagen o no están documentadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Felox/oud-put | LoRA de producto sobre Krea-2-Turbo | no disponible (repo 0,2 GB) | no aplica | krea-2-community-license | Hugging Face, 0 descargas |
| Krea-2-Turbo (base) | Modelo de difusión texto a imagen | no disponible | no aplica | krea-2-community-license | Hugging Face (krea/Krea-2-Turbo) |
| LoRA de producto genéricos sobre modelos de difusión | Adaptadores de concepto | variable | no aplica | variable según base | Hugging Face, Civitai |

No se dispone de datos de rendimiento comparativo entre este LoRA y otras alternativas, ni de modelos comparables concretos identificados en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia de comunidad ni de validación externa de su calidad.
- La model card no documenta el dataset de entrenamiento ni los hiperparámetros, lo que dificulta evaluar el riesgo de sobreajuste o de sesgos en el concepto aprendido.
- El modelo está entrenado y documentado únicamente en inglés; los prompts en otros idiomas pueden degradar la fidelidad del resultado.
- Al ser un LoRA de un objeto concreto, su generalización a otros productos o escenas es nula fuera del concepto "oud-put".
- Riesgo de alucinación visual: el modelo base puede generar detalles incoherentes en el frasco (forma del tapón, monograma, proporciones) en composiciones complejas o con prompts poco específicos.
- La licencia krea-2-community-license ("other") impone condiciones que deben revisarse antes de cualquier uso comercial; no se detallan en la información disponible.
- No se especifican requisitos de hardware ni compatibilidad con pipelines de despliegue distintos de ComfyUI.
- La fecha de creación del repositorio (2026-11-01) y la ausencia de actividad posterior impiden confirmar mantenimiento o soporte por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Felox/oud-put
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia krea-2-community-license (PDF): https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
