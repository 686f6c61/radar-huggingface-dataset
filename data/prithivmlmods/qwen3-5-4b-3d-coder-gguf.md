# prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF

## Resumen

Qwen3.5-4B-3D-Coder-GGUF es la versión cuantizada en formato GGUF de Qwen3.5-4B-3D-Coder, un ajuste fino independiente (early preview) de Qwen3.5-4B desarrollado por ccore y republicado por prithivMLmods. El modelo se especializa en dos tareas: programación de propósito general y generación interactiva de escenas 3D autocontenidas mediante Three.js (HTML y JavaScript), un nicho poco cubierto por modelos generalistas de este tamaño.

Su relevancia reside en la combinación de un tamaño contenido (unos 4.200 millones de parámetros), capacidades multimodales (image-text-to-text, con archivo mmproj incluido) y un entrenamiento específico sobre el dataset ccore ThreeJS-3D-Scenes, que contiene 4.146 ejemplos con prompts, trazas de razonamiento, código completo y etiquetas de complejidad. Esto permite ejecutarlo en hardware de consumo manteniendo un rendimiento razonable en generación de escenas 3D interactivas.

El repositorio incluye cuantizaciones desde Q3_K_M hasta Q8_0 y BF16, un checkpoint del 27 de octubre que según el autor mejora la generación one-shot y la calidad de las escenas, y recomendaciones de muestreo junto con un system prompt orientado a Three.js. No se han publicado resultados de benchmarks cuantitativos; la evaluación se muestra mediante escenas de ejemplo. Se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal (image-text-to-text) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-bf16 (proyector multimodal) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura transformer de la familia Qwen, y ha sido ajustado por ccore como fine-tune independiente en fase early-preview. El pipeline es de tipo image-text-to-text, lo que indica capacidad de procesar entradas visuales además de texto, reforzada por la inclusión de un archivo de proyección multimodal (mmproj) en BF16 de 676 MB. El autor indica que la decodificación especulativa mediante multi-token prediction (MTP) no está soportada, y advierte a los usuarios de LM Studio que desactiven esa opción.

El entrenamiento se realizó sobre el dataset ccore/ThreeJS-3D-Scenes, con licencia MIT, compuesto por 4.146 ejemplos que incluyen prompts, trazas de razonamiento, código completo de escenas Three.js y etiquetas de complejidad. Esta composición sugiere un entrenamiento orientado a razonamiento previo a la generación de código. No se ha publicado información sobre el número total de tokens, el uso de RLHF/DPO ni otras fases de alineación. Un checkpoint del 27 de octubre mejoró, según el autor, la generación one-shot y la calidad de las escenas.

## Capacidades

- Generación de escenas 3D interactivas autocontenidas en Three.js (HTML + JavaScript) a partir de prompts en lenguaje natural.
- Programación de propósito general (tag "code"), heredada del modelo base Qwen3.5-4B.
- Capacidades multimodales: entrada de imagen y texto (pipeline image-text-to-text), mediante el archivo mmproj incluido.
- Razonamiento previo a la generación de código, gracias a las trazas de razonamiento presentes en el dataset de entrenamiento.
- Generación one-shot de escenas completas, mejorada en el checkpoint del 27 de octubre.
- Conversación multi-turno (tag "conversational").
- No consta soporte documentado de tool calling ni de flujos agénticos multi-paso.

## Casos de uso

- Prototipado rápido de visualizaciones 3D: un diseñador o desarrollador frontend puede describir una escena ("un cubo rotando con iluminación dinámica") y obtener HTML autocontenido listo para abrir en el navegador, sin escribir código manualmente.
- Generación de demos educativas de Three.js: profesores pueden producir ejemplos interactivos de conceptos 3D (cámaras, luces, mallas) para material docente, aprovechando las etiquetas de complejidad del dataset de entrenamiento.
- Asistente de código embebido en editores locales: con cuantizaciones de 2,7 GB (Q4_K_M) puede ejecutarse vía llama.cpp u Ollama en portátiles sin GPU dedicada, sirviendo de autocompletado o generación de snippets JavaScript.
- Creación de landing pages y experiencias web con elementos 3D: generación de bloques de código Three.js integrables en proyectos web de marketing o portfolios.
- Análisis de imágenes con generación de código: dado su pipeline image-text-to-text, puede recibir una captura o referencia visual y generar la escena 3D correspondiente.
- Experimentación on-device con modelos de código multimodales: su tamaño reducido y licencia Apache-2.0 lo hacen adecuado para investigación local, fine-tuning posterior o integración en productos sin coste de licencias.
- Iteración asistida de escenas existentes: el usuario puede pegar código Three.js propio y pedir modificaciones, aunque el autor advierte que algunas generaciones pueden requerir reintentos o correcciones menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay evaluaciones cuantitativas y que la evaluación se demuestra mediante escenas 3D de ejemplo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia GGUF (pesos solos, sin contexto ni KV cache):
  - Q3_K_M: 2,26 GB
  - Q4_K_M: 2,71 GB (cuantización recomendada)
  - Q5_K_M: 3,07 GB
  - Q6_K: 3,46 GB
  - Q8_0: 4,48 GB
  - BF16: 8,42 GB
  - Añadir ~676 MB si se usa el proyector multimodal (mmproj-bf16).
- GPU recomendadas: por su tamaño, cualquier GPU de consumo con 4-6 GB de VRAM (RTX 3060, RTX 4060) ejecuta con holgura las cuantizaciones Q4-Q6; para BF16 conviene una GPU de 12 GB o más (RTX 3060 12 GB, RTX 4070). No se requieren A100 ni H100.
- Consumer GPUs: sí, cabe con holgura incluso en GPUs de gama media y en CPUs modernas con 8-16 GB de RAM para las cuantizaciones bajas.
- Despliegue: llama.cpp (enlace oficial en la model card), LM Studio (desactivando multi-token prediction), Ollama y cualquier runtime compatible con GGUF. El modelo base en safetensors es compatible con transformers y text-generation-inference.
- Latencia y throughput: no disponible. Al no soportarse decodificación especulativa vía MTP, la velocidad dependerá del runtime y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-GGUF | 4,21 B | GGUF (Q3-Q8, BF16) | Codigo general + Three.js 3D, multimodal | Apache-2.0 |
| Qwen3.5-4B (base) | 4,21 B | safetensors / GGUF comunitario | Generalista, codigo y vision | no disponible en la informacion proporcionada |
| Qwen2.5-Coder-3B | 3 B | safetensors / GGUF | Codigo general | Apache-2.0 (familia Qwen) |

Nota: no existen alternativas publicas ampliamente conocidas especializadas en generacion de escenas Three.js, por lo que la comparativa se limita a modelos de codigo general de tamano similar. Datos de rendimiento comparativo: no disponible.

## Limitaciones y advertencias

- Es un early-preview: el propio autor advierte que algunas generaciones pueden requerir reintentos o correcciones menores de codigo.
- No se han publicado benchmarks cuantitativos, por lo que su calidad real (MMLU, HumanEval, etc.) es desconocida y debe validarse caso por caso.
- Idioma: entrenamiento y documentacion centrados en ingles; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada; no se puede garantizar comportamiento en prompts muy largos.
- La decodificacion especulativa mediante MTP no esta soportada; los usuarios de LM Studio deben desactivar multi-token prediction para evitar errores.
- Riesgo de alucinacion de codigo: como todo modelo de 4B, puede generar APIs de Three.js inexistentes o desactualizadas; conviene revisar y probar el codigo generado.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-4B, hereda los sesgos generales de su preentrenamiento (no disponible informacion detallada).
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia. El dataset de entrenamiento es MIT.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor del repositorio: https://huggingface.co/prithivMLmods
- Autor del modelo base: https://huggingface.co/ccore
