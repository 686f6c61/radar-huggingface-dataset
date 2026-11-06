# clothdojo/nocs-teachers

## Resumen

ClothDojo NOCS generation teachers es un repositorio de pesos publicado por la organización ClothDojo que contiene dos checkpoints especializados en manipulación robótica de tejidos: uno para la tarea de desplegar o alisar prendas (*flatten*) y otro para doblarlas (*fold*). No se trata de un modelo de lenguaje generalista, sino de dos políticas de manipulación derivadas por ajuste fino del modelo visión-lenguaje-acción `lerobot/pi05_base` (pi0.5), almacenadas en el formato nativo del *wrapper* RLinf.

El propósito declarado de estos checkpoints es actuar como "profesores" generadores de NOCS (Normalized Object Coordinate Space) en el pipeline de ClothDojo, es decir, producir trayectorias sintéticas de referencia que alimentan la generación de datos y la evaluación reproducible en simulación. El repositorio no incluye un checkpoint de política RGB desplegable ni un segundo entorno de ejecución: solo aporta pesos, estadísticas de normalización y metadatos del modelo.

Es relevante para investigadores en manipulación de objetos deformables e imitación robótica que quieran reproducir el pipeline de ClothDojo, pero no es un modelo utilizable directamente como política de control en un robot real ni como generador de texto. El tamaño del repositorio es de 26,8 GB y la licencia es la de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción derivada de pi0.5 (lerobot/pi05_base); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (requiere GPU NVIDIA con soporte nativo de BF16) |
| Idiomas soportados | no disponible |
| Licencia | gemma (se aplican los terminos, NOTICE y restricciones de uso de Gemma) |
| Formato de pesos | Pesos en el layout nativo del wrapper RLinf; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

Los checkpoints son modificaciones de pi0.5 obtenidas por ajuste fino específico para cada tarea (*flatten* y *fold*), partiendo de `lerobot/pi05_base`. Se almacenan en el layout nativo del wrapper RLinf y cada tarea incluye su propio conjunto de pesos (`flatten/weights`, `fold/weights`) y sus estadísticas de normalización correspondientes (`flatten/norm_stats`, `fold/norm_stats`), que deben mantenerse juntos y no mezclarse entre tareas.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO. Tampoco se describe ninguna innovación técnica más allá de su función como profesores de generación de NOCS en el pipeline de ClothDojo. El autor advierte explícitamente que el profesor de generación de *fold* difiere de la política histórica del benchmark de Fold y que no debe atribuírsele la puntuación de aquella.

## Capacidades

- Generación de trayectorias de referencia para tareas de manipulación de tejidos (desplegar y doblar prendas) en el pipeline de ClothDojo.
- Generación de NOCS (Normalized Object Coordinate Space) como señal de supervisión para datos sintéticos.
- Ejecución en simulación sin requerir Isaac Sim para la generación de NOCS.
- Producción de una trayectoria por ejecución, con salida de vídeos MP4 de cámara alta y baja.
- Dos tareas diferenciadas con pesos y normalización independientes: *flatten* y *fold*.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Generación de datos sintéticos para entrenamiento: usar los profesores de *flatten* y *fold* para producir trayectorias de referencia que alimenten el entrenamiento de políticas de manipulación de tejidos en simulación.
- Evaluación reproducible en investigación: ejecutar el quickstart de ClothDojo para obtener trayectorias comparables entre experimentos, manteniendo pesos y normalización emparejados por tarea.
- Estudio de manipulación de objetos deformables: emplear los checkpoints como referencia de comportamiento en tareas de desplegado y doblado de prendas.
- Reproducción de resultados académicos: el pipeline documentado (clonar repositorio, descargar pesos, ejecutar `quickstart.sh`) permite replicar el flujo del autor en Linux x86_64 con Python 3.11 y GPU NVIDIA con BF16.
- Generación de vídeos de cámara alta y baja para inspección cualitativa de trayectorias simuladas.
- Base para ajuste fino posterior: al derivar de pi0.5 y conservar identidad y procedencia en `policy.json` y `base_model.json`, sirve como punto de partida para políticas específicas de tejidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte además que la puntuación histórica del benchmark de Fold no debe atribuirse al checkpoint de *fold* de este repositorio.

## Requisitos de hardware

- GPU NVIDIA con soporte nativo de BF16 (requisito explícito del autor).
- Entorno Linux x86_64 con Python 3.11, Git, `patch` y `uv`.
- Isaac Sim no es necesario para la generación de NOCS.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible (solo se especifica el requisito de BF16 nativo).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: scripts del repositorio ClothDojo (`scripts/download.sh`, `scripts/setup.sh`, `scripts/quickstart.sh`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClothDojo NOCS teachers | lerobot/pi05_base | Manipulación de tejidos (flatten, fold) | no disponible | gemma | Hugging Face (pesos) |
| lerobot/pi05_base | pi0.5 | VLA generalista | no disponible | no disponible en la informacion | Hugging Face |
| Política histórica del benchmark Fold | no disponible | Fold (benchmark) | no disponible | no disponible | Referenciada, no incluida |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint de política RGB: son profesores de generación de NOCS, no políticas desplegables en robot real.
- El repositorio no incluye un segundo entorno de ejecución; el código vive en el repositorio de GitHub de ClothDojo.
- No se incluyen el tokenizador ni las cachés del modelo original.
- Los conjuntos de normalización no deben mezclarse entre tareas; cada checkpoint debe mantenerse con sus pesos, `policy.json` y `base_model.json`.
- El profesor de *fold* difiere de la política histórica del benchmark de Fold; no debe atribuírsele su puntuación.
- Licencia Gemma con términos, NOTICE y restricciones de uso aplicables; conviene revisar las condiciones antes de uso comercial.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas: no documentados.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/clothdojo/nocs-teachers
- Organización en Hugging Face: https://huggingface.co/clothdojo
- Repositorio GitHub: https://github.com/clothdojo/clothdojo.github.io
- Guía de uso: https://github.com/clothdojo/clothdojo.github.io/blob/main/docs/usage.md
- Assets y estados iniciales: https://huggingface.co/datasets/clothdojo/assets
- Modelo base: https://huggingface.co/lerobot/pi05_base
