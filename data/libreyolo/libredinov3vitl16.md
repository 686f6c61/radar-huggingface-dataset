# LibreYOLO/LibreDINOv3vitl16

## Resumen

LibreDINOv3vitl16 es un espejo (mirror) de los pesos del codificador de imágenes DINOv3 ViT-L/16 de Meta, publicado por LibreYOLO para eliminar la necesidad de autenticarse en el repositorio original, que está restringido mediante formulario de acceso. No se trata de un modelo nuevo: los archivos `config.json`, `preprocessor_config.json` y `model.safetensors` son idénticos byte a byte a los del repositorio `facebook/dinov3-vitl16-pretrain-lvd1689m` (revisión `ea8dc2863c51be0a264bab82070e3e8836b02d51`), en precisión float32. El modelo tiene 303.129.600 parámetros y un tamaño de repositorio de 1,2 GB.

Su función principal en el ecosistema LibreYOLO es servir como extractor de características visuales para el modelo de imagen a 3D TRELLIS.2, que lee su entrada a través de este codificador, igual que hace la implementación de Microsoft. El espejo permite ejecutar `LibreGen("trellis2")` sin inicio de sesión ni solicitud de acceso en Hugging Face.

Es relevante ahora porque DINOv3 se ha consolidado como uno de los extractores de características visuales densas de referencia, y porque la distribución sin gating simplifica la integración en pipelines de producción y en entornos de CI. La licencia, sin embargo, no es permisiva: los pesos se redistribuyen bajo la DINOv3 License de Meta, no bajo la licencia MIT de LibreYOLO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT (Vision Transformer), variante ViT-L/16 |
| Parametros totales | 303.129.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en float32 |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | DINOv3 License (Meta), redistribucion permitida con paso de la misma licencia |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tipo ViT-L/16: parches de 16x16 píxeles y una variante grande del transformer de visión. Forma parte de la familia DINOv3 de Meta, entrenada con el objetivo de auto-supervisión DINO y preentrenada sobre el conjunto LVD-1689M, según indica la model card del espejo. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de ajuste con RLHF o DPO (no aplicables habitualmente a un codificador visual).

La innovación técnica relevante es la propia receta DINOv3, descrita en el paper arXiv:2508.10104, que produce representaciones visuales densas de alta calidad útiles para tareas aguas abajo como segmentación, detección o extracción de características para generación 3D. En este espejo no hay ningún cambio de arquitectura ni reentrenamiento: los pesos, la configuración y el preprocesador son los de Meta, en la precisión float32 con la que TRELLIS.2 ejecuta el codificador.

## Capacidades

- Extracción de características de imagen (image feature extraction), pipeline declarado del modelo.
- Generación de representaciones visuales densas por parche, aptas para tareas aguas abajo de visión por computador.
- Uso como codificador de entrada en el pipeline de imagen a 3D TRELLIS.2 de LibreYOLO.
- Compatibilidad con `transformers` mediante `AutoModel.from_pretrained`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la codificación de imágenes.

## Casos de uso

- Generación de mallas 3D a partir de imágenes: integrado en `LibreGen("trellis2")`, el codificador procesa la imagen de entrada y alimenta el pipeline de imagen a 3D, permitiendo obtener un `.obj` a partir de una fotografía sin credenciales de Hugging Face.
- Extracción de características para segmentación semántica: las representaciones densas por parche de DINOv3 se usan como entrada a cabezas de segmentación lineales o ligeras, aprovechando la calidad de los features auto-supervisados.
- Búsqueda y recuperación de imágenes por similitud: los embeddings globales o por región permiten construir índices vectoriales para recuperación visual en catálogos, archivos multimedia o sistemas de moderación.
- Detección y clasificación con cabezas ligeras: congelando el codificador y entrenando solo una cabeza, se obtienen clasificadores o detectores con coste de entrenamiento reducido, útil cuando no hay presupuesto para ajuste completo.
- Preprocesado en pipelines de visión industrial: extracción de features para control de calidad, inspección visual o agrupamiento no supervisado de imágenes de producto.
- Investigación en representaciones visuales: al no requerir gating, facilita la reproducibilidad en entornos académicos y la comparación con otras variantes DINOv3 sin depender de aprobaciones de acceso.
- Integración en CI/CD de modelos de visión: el espejo sin formulario de acceso simplifica la descarga automática en flujos de integración y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 303 millones de parámetros en float32, los pesos ocupan aproximadamente 1,2 GB; el consumo real depende del tamaño de lote y de la resolución de entrada, y no se detalla en la información disponible.
- GPU recomendadas: no se especifican en la información proporcionada; por tamaño, el modelo es apto para GPUs de consumo, aunque no se confirma ningún modelo concreto.
- Cabe en GPU de consumo: por el tamaño de los pesos (1,2 GB en float32) es previsible que sí, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: `transformers` (soporte nativo), endpoints de Hugging Face y el propio paquete LibreYOLO. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un codificador visual de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDINOv3vitl16 (este) | 303.129.600 | no disponible | Extraccion de caracteristicas de imagen | DINOv3 License | Espejo sin gating en HF |
| facebook/dinov3-vitl16-pretrain-lvd1689m | no disponible en la busqueda | no disponible | Extraccion de caracteristicas de imagen | DINOv3 License | Repositorio original con gating |
| LibreYOLO/LibreDINOv3vith16plus | 0,8B (segun la busqueda) | no disponible | Extraccion de caracteristicas de imagen | no disponible | Espejo en HF |

La comparación relevante es con el repositorio original de Meta, del que este es copia byte a byte: misma arquitectura, mismos pesos y misma licencia, con la diferencia de que el espejo no exige formulario de acceso. La variante `LibreDINOv3vith16plus` del mismo autor es un modelo mayor (0,8B parámetros según la búsqueda) de la misma familia.

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: cualquier limitación del DINOv3 ViT-L/16 original se hereda íntegramente.
- No genera texto ni mantiene conversaciones; es exclusivamente un codificador de imágenes.
- No se dispone de información sobre sesgos específicos del modelo en la documentación consultada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero los features pueden producir resultados erróneos en tareas aguas abajo si la imagen de entrada está fuera de la distribución de entrenamiento.
- Licencia restrictiva: los pesos se rigen por la DINOv3 License de Meta, no por la MIT de LibreYOLO. La redistribución exige pasar la misma licencia y una copia del acuerdo.
- Restricciones de uso: prohibición de usos sujetos a ITAR o fines militares, industrias nucleares, espionaje, desarrollo de armas; obligación de cumplir la legislación de control de exportaciones y de protección de datos; prohibición de ingeniería inversa o descompilación; obligación de citar los pesos en publicaciones de investigación.
- Meta puede modificar el acuerdo con efecto inmediato.
- El repositorio original de Meta sigue estando restringido; quien necesite el proceso de acceso oficial debe obtener los pesos del repositorio upstream.
- No se especifican requisitos de hardware ni latencias, lo que dificulta el dimensionamiento previo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LibreYOLO/LibreDINOv3vitl16
- Repositorio upstream de Meta: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Variante hermana: https://huggingface.co/LibreYOLO/LibreDINOv3vith16plus
- Repositorio de LibreYOLO en GitHub: https://github.com/LibreYOLO/libreyolo
- Paper DINOv3: https://arxiv.org/abs/2508.10104
