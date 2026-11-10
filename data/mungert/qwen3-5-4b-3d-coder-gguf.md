# Mungert/Qwen3.5-4B-3D-Coder-GGUF

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino independiente del modelo base Qwen/Qwen3.5-4B, desarrollado por CCORE y distribuido en formato GGUF por Mungert. Está especializado en generación de código general y, de forma destacada, en la creación de escenas 3D interactivas con Three.js. Se trata de una vista previa temprana de un entrenamiento todavía en curso, publicada para compartir resultados preliminares que el autor califica de prometedores tanto en código general como en generación de escenas 3D.

El modelo cuenta con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) y se distribuye bajo licencia Apache 2.0. El repositorio de Mungert incluye cuantizaciones GGUF Q4_K_M y Q8_0 generadas con llama.cpp, además de los pesos FP16 originales en Safetensors. Una característica relevante es el soporte opcional de visión: las versiones Q4_K_M y Q8_0 pueden aceptar imágenes si se cargan junto al proyector multimodal original de Qwen3.5-4B, lo que permite generar escenas Three.js a partir de una imagen de referencia.

Su relevancia radica en explorar la viabilidad de modelos pequeños (4B) para tareas de código especializado y generación 3D de calidad, un nicho habitualmente dominado por modelos mucho mayores. El modelo está pensado para despliegue local eficiente y es compatible con endpoints conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles especificos no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | hasta 65.536 tokens en la configuracion de ejemplo con llama.cpp (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF); FP16 en Safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y Safetensors (FP16, cuatro shards) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del Qwen3.5-4B de Qwen, con un enfoque dual: codigo general y generacion de escenas 3D con Three.js. El entrenamiento se realizo sobre el dataset publico CCORE Three.js 3D Scenes, compuesto por 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validacion) que incluyen prompts, trazas de razonamiento completas (thinking traces), respuestas HTML/JavaScript completas y niveles de complejidad. Se desconoce si se aplicaron tecnicas de RLHF o DPO; la informacion disponible no lo especifica.

La arquitectura subyacente corresponde al transformer de Qwen3.5-4B, cuyos detalles internos (atencion, capas, innovaciones especificas) no se detallan en la informacion proporcionada. El modelo conserva la plantilla de chat y la configuracion de generacion del modelo base: temperatura 0,6, top-k 20, top-p 0,95 y penalizacion por repeticion 1,0, con cache habilitada. El soporte de vision se logra mediante el proyector multimodal BF16 original de Qwen3.5-4B (aproximadamente 644 MiB), que se carga como archivo complementario en llama.cpp.

## Capacidades

- Generacion de codigo general en multiples lenguajes, con enfasis en JavaScript y HTML para escenas 3D.
- Generacion de escenas 3D interactivas con Three.js a partir de descripciones textuales.
- Generacion guiada por imagen: con el proyector multimodal cargado, acepta una imagen de referencia y genera una escena Three.js inspirada en ella (solo Q4_K_M y Q8_0).
- Razonamiento multi-paso con trazas de pensamiento (thinking traces), presentes en el dataset de entrenamiento.
- Conversacion multi-turno (tag conversational, endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: si, segun las trazas de razonamiento incluidas en el dataset.

## Casos de uso

- Prototipado rapido de escenas 3D para web: el modelo genera HTML/JavaScript completo con Three.js a partir de un prompt descriptivo, lo que permite crear maquetas interactivas de escenas sin escribir el codigo manualmente.
- Generacion de escenas a partir de referencias visuales: cargando el proyector multimodal en llama.cpp, se puede adjuntar una imagen y pedir una interpretacion en voxels o geometria Three.js, util para disenadores que quieran pasar de un concepto visual a un prototipo funcional.
- Asistente de codigo general en local: con 4,2B parametros y cuantizacion Q4_K_M, se puede desplegar en estaciones de trabajo sin GPU de datacenter para autocompletado y generacion de fragmentos de codigo, manteniendo los datos en local.
- Educacion y aprendizaje de Three.js: el modelo explica y genera ejemplos completos con trazas de razonamiento, lo que resulta util como tutor interactivo de graficos 3D en navegador.
- Generacion de contenido para herramientas de visualizacion: integracion en pipelines que necesiten producir escenas 3D parametrizadas (niveles de complejidad incluidos en el dataset) para demos, catalogo de productos o visualizaciones cientificas simples.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF y a su tamano, puede ejecutarse en portatiles con GPU consumer, ideal para equipos que no pueden usar APIs en la nube por motivos de privacidad o coste.
- Investigacion sobre modelos pequenos especializados: sirve como referencia reproducible (dataset y pesos publicos) para estudiar el rendimiento de modelos de 4B en tareas de codigo y generacion 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M y 4,5-5 GB con Q8_0 para los pesos; anadir memoria para el KV-cache segun el contexto configurado (con cache q8_0 probado a 64K en pruebas cortas).
- Vision: el proyector multimodal BF16 anade aproximadamente 644 MiB de memoria cuando se carga.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para Q4_K_M (RTX 3060, RTX 4060, RTX 4090); para Q8_0 se recomienda 8 GB o mas; en datacenter, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6 GB o mas de VRAM para Q4_K_M.
- Opciones de despliegue: llama.cpp (probado con b11889 y commit ca89968a2 para la generacion de los GGUF), llama-server con WebUI, y cualquier frontend compatible con GGUF; otros motores (vLLM, TGI, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; las pruebas realizadas fueron cortas y no se reportan metricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4,2B | hasta 65.536 en config. de ejemplo | Apache 2.0 | Especializado en codigo y Three.js; soporte de vision opcional |
| Qwen/Qwen3.5-4B (base) | 4,2B (no confirmado en la info) | no disponible | Apache 2.0 (segun el modelo base citado) | Modelo generalista sin especializacion 3D |
| Alternativas de codigo de ~4B | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni comparativas publicadas en la informacion proporcionada |

## Limitaciones y advertencias

- Es una vista previa temprana de un entrenamiento en curso; el autor advierte que el desarrollo continua y el rendimiento puede no ser estable.
- No es un lanzamiento oficial de Qwen: es un ajuste fino independiente de CCORE.
- El soporte de vision es opcional, requiere un archivo proyector adicional y solo esta probado en llama.cpp; otros frontends dependen de su implementacion multimodal.
- El ejemplo de generacion guiada por imagen es cualitativo: el modelo interpreta la referencia y no reproduce todos los detalles.
- Las pruebas con vision a 64K de contexto fueron cortas, no pruebas de estres de contexto completo.
- Riesgo de alucinacion en codigo generado: no se han publicado evaluaciones de correccion ni benchmarks, por lo que conviene revisar el codigo antes de usarlo en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el entrenamiento se centra en codigo y prompts en ingles segun los ejemplos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- El repositorio ocupa 119,5 GB, lo que refleja la inclusion de multiples cuantizaciones y pesos FP16; descargar solo los archivos necesarios.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Mungert/Qwen3.5-4B-3D-Coder-GGUF
- Modelo original de CCORE: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe tecnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector de vision BF16: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Proyector original (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Commit de llama.cpp usado: https://github.com/ggerganov/llama.cpp/commit/ca89968a23a13e571a6b802a9891d22763153b61
- Guia de seleccion de formato GGUF: https://readyforquantum.com/huggingface_gguf_selection_guide.html
- Discusion con la imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
