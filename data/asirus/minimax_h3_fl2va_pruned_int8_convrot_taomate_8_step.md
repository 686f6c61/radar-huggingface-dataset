# Asirus/minimax_h3_fl2va_pruned_int8_convrot_taomate_8_step

## Resumen

Este repositorio contiene un modelo de generación conjunta de audio y vídeo derivado de MiniMax H3 FL2VA, publicado por el usuario Asirus. Se trata de un merge de pesos: parte del modelo oficial `Comfy-Org/MiniMax-H3` en su variante *pruned* cuantizada a INT8 ConvRot con tamaño de grupo 256, y le aplica la adaptación TaoMate-H3 (una LoRA de destilación a pocos pasos, con rango 128 y alpha 128) que queda integrada de forma permanente en los pesos. El resultado es un único archivo SafeTensors de aproximadamente 19,5 GB (el repositorio completo ocupa 21,0 GB) que no requiere cargar la LoRA de TaoMate por separado durante la inferencia.

El problema que resuelve es de eficiencia y de ergonomía en ComfyUI: la adaptación original de TaoMate está pensada para 3 pasos de muestreo, pero el autor observó inestabilidad en detalles faciales, ojos y estructuras finas a ese régimen, por lo que este release está ajustado y probado específicamente para 8 pasos con sampler Euler, scheduler Simple, CFG 1.0 y desplazamientos sigma diferenciados para vídeo (8) y audio (3). El modelo está pensado para generar clips cortos de audio y vídeo sincronizados en local.

La relevancia del release es acotada: es una aportación de la comunidad, sin descargas ni validación externa en el momento de la consulta, y no reproduce el runtime de streaming oficial de TaoMate (que incluye lógica adicional de planificación de streaming y de caché KV). Aun así, documenta con detalle el método de fusión, los ajustes recomendados y un benchmark local propio, lo que lo hace útil como referencia técnica para quien trabaje con destilación de pocos pasos y cuantización INT8 en modelos de difusión de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MiniMax H3 FL2VA (modelo de generación de audio y vídeo; transformador principal con cuantización INT8 ConvRot, componentes AdaLN en FP16 y Token Refiner en BF16) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; se especifica duración de vídeo de 5 s en el benchmark) |
| Tipos de cuantización | INT8 ConvRot, tamaño de grupo 256, escalado por filas (*row-wise*); AdaLN en FP16; Token Refiner en BF16 (no cuantizado a INT8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | SafeTensors (`minimax_h3_fl2va_pruned_int8_convrot_taomate_8_step.safetensors`) |
| Modelo base | `Comfy-Org/MiniMax-H3` |
| Tamaño del repositorio | 21,0 GB |
| Tamaño del archivo de pesos | ~19,5 GB |
| Fecha de creación | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura de partida es MiniMax H3 FL2VA, un modelo de generación de audio y vídeo. Sobre el checkpoint oficial *pruned* INT8 ConvRot-256 (`Comfy-Org/MiniMax-H3`), el autor aplicó la adaptación TaoMate-H3, una LoRA de destilación a pocos pasos con rango 128, alpha 128 y escala alpha/rank nativa de 1,0. La LoRA contiene 416 tensores y 208 módulos objetivo: 200 en el transformador principal y 8 en el Token Refiner. La fuerza de merge empleada en este release fue de 0,9.

El procedimiento de fusión está documentado con precisión. Para las capas INT8 ConvRot del transformador principal se reconstruyó la representación cuantizada existente, se aplicó el delta de la LoRA en precisión BF16 y el resultado se recuantizó a INT8 ConvRot-256 con escalado por filas. El Token Refiner permaneció en BF16 y sus ocho módulos objetivo se fusionaron directamente en los pesos BF16. Los parámetros AdaLN se mantuvieron en FP16/alta precisión. El resultado es un archivo único con la adaptación ya integrada, de modo que no hay que cargar la LoRA original durante la inferencia.

La innovación destacable no está en la arquitectura, sino en el pipeline de merging: preservar la cuantización INT8 del checkpoint base mientras se aplica un delta LoRA en BF16 y se recuantiza, manteniendo en alta precisión los componentes sensibles (AdaLN y Token Refiner). El autor advierte explícitamente de que este merge no replica todos los componentes del runtime oficial de TaoMate, que incorpora lógica adicional de streaming y de planificación de caché KV.

## Capacidades

- Generación de vídeo y audio de forma conjunta en un único modelo, no como dos etapas separadas.
- Generación en pocos pasos de muestreo: el release está ajustado para 8 pasos (Euler / Simple / CFG 1.0), frente a los 3 pasos de la destilación TaoMate original.
- Inferencia sin cargar la LoRA de TaoMate por separado, al estar los pesos ya fusionados (fuerza de merge 0,9).
- Ejecución dentro de ComfyUI mediante la librería `custom` declarada por el autor.
- Desplazamientos sigma independientes para las dos modalidades: vídeo sigma shift 8 y audio sigma shift 3, ajustables por separado.
- Compatibilidad con el ecosistema de checkpoints del modelo base `Comfy-Org/MiniMax-H3` (formato SafeTensors y flujo de trabajo de ComfyUI).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, ni soporte multilingüe de texto; no aplica en el sentido habitual de un LLM.

## Casos de uso

- Generación de clips cortos con audio sincronizado en local: con 8 pasos, sampler Euler y scheduler Simple, el modelo produce vídeos de unos 5 s con audio en una sola pasada, lo que encaja en flujos de trabajo de ComfyUI en máquina propia.
- Previsualización rápida de storyboards animados: para equipos de animación o publicidad, permite obtener un boceto en movimiento con sonido sin esperar a un render completo de alta fidelidad, gracias al régimen de pocos pasos.
- Prototipado de anuncios y contenido para redes sociales: clips de duración corta y resolución en torno a 1 MP son el formato típico de estas plataformas, y el pipeline cabe en una estación de trabajo con GPU de gama alta.
- Evaluación comparativa de técnicas de destilación de pocos pasos: el repositorio documenta explícitamente el comportamiento a 3, 6 y 8 pasos, lo que lo convierte en un banco de pruebas útil para investigar el equilibrio entre número de pasos y estabilidad estructural.
- Investigación sobre cuantización INT8 en modelos de difusión de vídeo: el método de reconstrucción, aplicación del delta LoRA en BF16 y recuantización a INT8 ConvRot-256 es un caso reproducible para estudiar la pérdida de calidad asociada.
- Integración en flujos de ComfyUI ya existentes: al ser un único archivo SafeTensors compatible con el modelo base de Comfy-Org, se puede sustituir el par checkpoint + LoRA por un solo nodo de carga, simplificando la gestión de memoria y de dependencias.
- Automatización de generación por lotes en local: la ausencia de carga de LoRA separada y el menor tiempo de generación medido (225 s frente a 239 s en el benchmark del autor) reducen el coste por clip en pipelines que producen muchos clips cortos.

## Benchmarks y rendimiento

El autor publica un único benchmark local, orientado a tiempo de generación, no a métricas de calidad perceptual. Las condiciones declaradas son: vídeo de 5 segundos, resolución de aproximadamente 1 MP, 8 pasos de muestreo, generación en ComfyUI y el mismo hardware y entorno local para ambas pruebas.

| Configuración | Tiempo de generación | Diferencia |
|---|---|---|
| Este modelo (`minimax_h3_fl2va_pruned_int8_convrot_taomate_8_step.safetensors`) | 225 s | — |
| Referencia: `minimax_h3_fl2va_pruned_int8_convrot.safetensors` + `minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors` | 239 s | +14 s (≈ 5,9 % más lenta) |

El autor advierte de que se trata de un benchmark local y que no debe considerarse una garantía universal de rendimiento, ya que este puede variar según GPU, VRAM, versión de CUDA, de PyTorch y de ComfyUI. A partir de los datos anteriores se puede derivar un coste aproximado de 45 segundos de cómputo por segundo de vídeo generado en las condiciones descritas (225 s / 5 s), aunque es una cifra derivada, no publicada como tal.

No se han publicado resultados de benchmarks de calidad (FVD, CLIP, métricas de audio, etc.) en la información disponible. Tampoco hay resultados de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia derivada del tamaño del archivo de pesos (~19,5 GB en INT8), la carga completa del modelo exige del orden de 20 GB solo para pesos, más el espacio de activaciones y buffers de vídeo y audio. Se trata de una estimación derivada, no de un requisito oficial.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, el modelo encaja con holgura en A100 40/80 GB y H100, y de forma ajustada en GPU de 24 GB (RTX 3090, RTX 4090) si se recurre a descarga parcial a memoria del sistema o a estrategias de *offloading* de ComfyUI.
- ¿Cabe en GPU de consumo? No hay confirmación del autor. Con ~19,5 GB de pesos, una GPU de 24 GB es el mínimo razonable, y el margen dependerá de la resolución, la duración del clip y la versión de ComfyUI. En GPUs de 16 GB o menos no hay datos que permitan afirmarlo.
- Opciones de despliegue: ComfyUI es el entorno declarado y probado (librería `custom`, etiqueta `comfyui`). El formato SafeTensors es el esperado por el cargador del modelo base `Comfy-Org/MiniMax-H3`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de difusión de vídeo y audio.
- Latencia y throughput: 225 s por clip de 5 s a ~1 MP y 8 pasos en el hardware local del autor (≈ 45 s de cómputo por segundo de vídeo, cifra derivada). El throughput real depende de la GPU, la VRAM, CUDA, PyTorch y la versión de ComfyUI.
- Almacenamiento: 21,0 GB para el repositorio completo; ~19,5 GB para el archivo de pesos.

## Comparativa con modelos similares

| Modelo / configuración | Tipo | Tamaño | Pasos de muestreo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este release (`Asirus/minimax_h3_fl2va_pruned_int8_convrot_taomate_8_step`) | Merge de MiniMax H3 FL2VA INT8 ConvRot-256 + LoRA TaoMate integrada | ~19,5 GB (repo 21,0 GB) | 8 (recomendado) | SafeTensors | no disponible | HuggingFace, 0 descargas en el momento de la consulta |
| `Comfy-Org/MiniMax-H3` (modelo base) | Modelo original de generación de audio y vídeo | no disponible | no disponible | no disponible en la información proporcionada | no disponible | HuggingFace (referenciado como base) |
| `minimax_h3_fl2va_pruned_int8_convrot` + LoRA turbo 8-step BF16 | Configuración de referencia usada en el benchmark del autor | no disponible | 8 | SafeTensors (INT8 ConvRot + LoRA BF16 separada) | no disponible | Referenciada en el benchmark |
| TaoMate-H3 oficial (TaoLiveAIGC) | Adaptación de destilación a pocos pasos + runtime de streaming | LoRA rango 128, alpha 128, 416 tensores | 3 (nativo) | LoRA / runtime propio | no disponible | GitHub |

No se dispone de información sobre otros modelos comparables de generación de vídeo con audio de la misma categoría, por lo que la comparativa se limita a las variantes del propio linaje MiniMax H3 y a la adaptación TaoMate.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia de este release ni la del modelo base `Comfy-Org/MiniMax-H3` en la información proporcionada. Antes de cualquier uso comercial es imprescindible verificar las condiciones del modelo base y de la adaptación TaoMate en sus repositorios originales.
- Es un merge de terceros. El autor es un usuario individual (Asirus), con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente ni revisión por parte de MiniMax ni de Comfy-Org.
- No reproduce el runtime oficial de TaoMate. El propio autor advierte de que faltan componentes del runtime oficial, en concreto lógica de streaming y de planificación de caché KV, por lo que el comportamiento no será idéntico al de la implementación oficial.
- Divergencia respecto al régimen de destilación original. La LoRA TaoMate es una destilación a 3 pasos, pero este release está ajustado a 8 pasos porque a 3 pasos se observó inestabilidad en rostros, ojos, movimiento y estructuras finas, y a 6 pasos persistían defectos residuales. Usar 3 pasos con este checkpoint no es la configuración prevista.
- No cargar la LoRA de TaoMate por separado. Hacerlo duplicaría la adaptación y degradaría el resultado, según la recomendación explícita del autor.
- Riesgo de artefactos visuales. El autor documenta inestabilidad en detalles faciales y estructuras finas a pocos pasos; no se han publicado métricas objetivas de calidad (FVD, métricas de audio) que permitan cuantificar la degradación.
- Benchmark no extrapolable. La ventaja medida del 5,9 % (225 s frente a 239 s) procede de un único entorno local y el autor advierte de que no constituye una garantía de rendimiento.
- Idioma y texto: no hay información sobre idiomas soportados ni sobre capacidades de generación de texto dentro del vídeo (rótulos, subtítulos).
- Contexto y duración: la única duración documentada es de 5 segundos en el benchmark; no se especifica el comportamiento con clips más largos.
- Sin datos sobre sesgos. No hay información publicada sobre sesgos demográficos, culturales o de representación en el contenido generado, un aspecto relevante en modelos generativos de vídeo con figuras humanas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Asirus/minimax_h3_fl2va_pruned_int8_convrot_taomate_8_step
- Modelo base: `Comfy-Org/MiniMax-H3` (referenciado en la model card, sin URL explícita en la información proporcionada)
- Proyecto oficial TaoMate-H3: https://github.com/TaoLiveAIGC/TaoMate-H3
- Ejemplos de vídeo citados en la model card: `examples/Sigma_shift_12-3.mp4`, `examples/Sigma_shift_6-3.mp4`, `examples/Sigma_shift_8-3.mp4` (rutas relativas dentro del repositorio)
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos corresponden a herramientas de medición de FPS en navegador y no guardan relación con MiniMax H3 ni con generación de vídeo. No se han encontrado papers, blogs ni demos adicionales en la información disponible.
