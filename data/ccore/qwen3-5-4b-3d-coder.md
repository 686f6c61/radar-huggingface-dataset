# ccore/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino (fine-tune) independiente del modelo Qwen/Qwen3.5-4B, publicado por el usuario CCORE en HuggingFace. No es un lanzamiento oficial de Qwen. El modelo se presenta explícitamente como una *early preview* de un entrenamiento todavía en curso, cuyo objetivo es explorar la viabilidad de modelos pequeños (4B) para programación general y, muy especialmente, para la generación de escenas 3D interactivas con Three.js en un único archivo HTML autocontenido.

El modelo tiene 4.205.751.296 parámetros (4,2 B) según el recuento real sobre safetensors, y se distribuye en formato GGUF con al menos dos cuantizaciones (Q4_K_M y Q8), con un repositorio de 7,2 GB. La licencia es Apache 2.0 y el modelo está etiquetado como conversacional y compatible con endpoints. Su relevancia actual reside en el nicho: no compite por rendimiento generalista, sino por producir código Three.js correcto y escenas 3D con profundidad, siluetas legibles y relaciones espaciales sólidas, algo poco frecuente en modelos de este tamaño.

La model card incluye galería de ejemplos renderizados (arquitectura estilizada, jardines, entornos voxel, mobiliario, interiores de taller y objetos mecánicos), un *system prompt* recomendado y ajustes de generación concretos. No se han publicado datos de benchmarks, longitud de contexto, idiomas soportados ni detalles de la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no detalla la arquitectura del modelo base Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, con al menos Q4_K_M y Q8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el recuento de parametros se ha verificado sobre safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base Qwen/Qwen3.5-4B, según los metadatos de la model card (`base_model_relation: finetune`). No se especifican en la informacion disponible ni la arquitectura interna (transformer denso, MoE, híbrida), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla la técnica de ajuste (LoRA, QLoRA, full fine-tune) ni el hardware empleado.

La innovación que declara el autor es de dominio: el entrenamiento se orienta a la generación de escenas Three.js dentro de un único archivo HTML, usando exclusivamente el módulo ES principal de Three.js desde cdnjs (`three.module.min.js` versión 0.160.0), sin addons ni rutas `examples/js` heredadas, y con los controles de cámara implementados directamente en el HTML. La model card recomienda estos ajustes de generación para las versiones Q4_K_M y Q8: temperatura 0,6–0,8; top_p 0,90–0,95; repetición 1,0; top_k 20–40. Incluye además un *system prompt* prescrito que restringe las importaciones a esa única URL.

## Capacidades

- Generación de código en HTML y JavaScript, con foco declarado en escenas 3D mediante Three.js.
- Creación de escenas autocontenidas en un solo archivo HTML, con geometría procedural, materiales, iluminación y animación (por ejemplo, torre de control con radar rotatorio y señales luminosas).
- Modelado voxel deliberado con bloques cúbicos visibles, profundidad clara, siluetas legibles y relaciones espaciales coherentes.
- Composición de escenas complejas a partir de descripciones densas: reparto de áreas, recorridos accesibles, estructuras conectadas por escaleras, rampas o poleas.
- Programación general: el autor señala resultados prometedores en código más allá del ámbito 3D.
- Formato conversacional (etiqueta `conversational`) y compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking*, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de escenas 3D para prototipado web: el modelo produce un único archivo HTML con Three.js desde cdnjs, listo para abrir en el navegador, lo que elimina el trabajo de configuración de build y permite validar una idea visual en minutos.
- Previsualización de entornos de videojuego o arquitectura: sus ejemplos incluyen jardines, aldeas, interiores de taller y mobiliario, útiles como *blockout* o maqueta conceptual antes de pasar a un motor o a un modelador.
- Construcción de entornos voxel: los prompts de ejemplo fuerzan un estilo de bloques cúbicos visibles; encaja en proyectos de arte voxel, prototipos de niveles o visualizaciones didácticas.
- Asistente de código local para desarrolladores front-end: al distribuirse en GGUF Q4_K_M, puede ejecutarse en un portátil sin enviar código propietario a servicios en la nube, lo que resulta útil en entornos con requisitos de confidencialidad.
- Docencia de Three.js y WebGL: sirve para generar ejemplos ejecutables de geometría, cámara e iluminación que el alumnado puede modificar y renderizar directamente.
- Generación de escenas de prueba para validar visores WebGL: crear escenarios sintéticos variados (interiores, exteriores, objetos mecánicos) para probar rendimiento, sombreado o gestión de recursos de un motor de render.
- Integración en pipelines de generación de maquetas bajo demanda: mediante la compatibilidad con endpoints, se puede exponer como servicio que devuelva HTML/JS a partir de una descripción textual de una escena.
- Exploración de prompts con *system prompt* fijo: la receta incluida en la model card permite reproducir resultados de forma consistente en las cuantizaciones Q4_K_M y Q8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética a partir de los 4,2 B de parámetros, no publicada por el autor): Q4_K_M ≈ 2,5–3 GB de pesos; Q8 ≈ 4,5 GB; FP16 ≈ 8,4 GB. Añadir aproximadamente 1 GB adicional para caché KV y *overhead* del runtime, dependiendo del contexto configurado.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M en tarjetas de 6–8 GB (por ejemplo, RTX 3060, RTX 4060) y con Q8 en tarjetas de 8–12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB).
- GPU de gama alta (A100, H100, RTX 4090): no son necesarias para este tamaño; permiten ejecutar FP16 y contextos largos con holgura, o servir varias instancias en paralelo.
- Ejecución en CPU: viable en formato GGUF con llama.cpp, aunque la generación de escenas HTML largas será notablemente más lenta que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; el modelo está etiquetado como `endpoints_compatible` para su exposición como endpoint HTTP.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ccore/Qwen3.5-4B-3D-Coder | 4,2 B | No disponible | Fine-tune para código general y escenas Three.js | Apache 2.0 | GGUF (Q4_K_M, Q8); early preview |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B (denominación del modelo) | No disponible | Modelo generalista de origen | No disponible en la información | No disponible en la información |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- *Early preview*: el autor indica que el modelo sigue en entrenamiento y que comparte el progreso de forma anticipada; no debe tratarse como una versión estable.
- Fine-tune independiente: no es un lanzamiento oficial de Qwen, por lo que no cuenta con el soporte, la validación ni las garantías del modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni en métricas específicas de código o de calidad de escenas 3D.
- Riesgo de alucinación: no evaluado en la información disponible; en generación de código es esperable que aparezcan APIs inexistentes o importaciones no permitidas, motivo por el cual el autor prescribe un *system prompt* que restringe las dependencias.
- Restricción práctica de dependencias: la receta del autor limita el modelo al módulo `three.module.min.js` 0.160.0 desde cdnjs y prohíbe addons; los resultados fuera de esa configuración no están documentados.
- Idiomas: no disponible. Los prompts de ejemplo están en inglés, por lo que el comportamiento en castellano no está verificado.
- Longitud de contexto: no disponible; escenas HTML largas con muchos objetos pueden superar la ventana efectiva y provocar truncamientos.
- Volumen de uso: el repositorio registra 0 descargas y 17 *likes*, lo que indica una validación comunitaria todavía muy limitada.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; el autor no impone restricciones adicionales en la información disponible, pero conviene verificar los términos del modelo base Qwen3.5-4B antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor (CCORE): https://huggingface.co/ccore
- Three.js empleado en los ejemplos: https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js
- Galería de ejemplos renderizados: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/main/images
- Papers, blogs o demos adicionales: no disponible
