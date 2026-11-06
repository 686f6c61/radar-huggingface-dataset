# SEELE-AI/EVA01-Unified-All-Task-Generation-LoRA

## Resumen

EVA01 Unified All-Task Generation LoRA es un paquete de adaptadores LoRA publicado por SEELE-AI para el runtime EVA01 Unified MoT. A diferencia de un modelo de lenguaje convencional, este repositorio no contiene pesos de un transformer generativo completo, sino únicamente los parametros de generacion necesarios para ejecutar tareas de text-to-3D e image-to-3D sobre una cascada nativa denominada `SS -> Shape -> Material`. El pipeline declarado en Hugging Face es `text-to-3d`, lo que lo situa en la categoria de modelos de generacion de activos 3D.

El bundle esta disenado para combinarse con componentes congelados que el autor no incluye: Qwen3-VL, TRELLIS, TRELLIS.2, el tokenizer, la normalizacion y los assets del decoder. Por tanto, no es un modelo autonomo ni se puede cargar con `transformers` o `diffusers` de forma directa; requiere el runtime OpenEVA descrito en el repositorio de GitHub del autor. El repositorio ocupa 0,6 GB y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

Su relevancia actual es limitada pero especifica: propone una unificacion de tareas de generacion 3D (texto a 3D e imagen a 3D) en un unico conjunto de adaptadores LoRA, lo que reduce el numero de artefactos que un pipeline de produccion 3D debe gestionar. No obstante, la ausencia de model card detallada, benchmarks, idiomas declarados y codigo de entrenamiento hace que cualquier evaluacion rigurosa dependa del ecosistema OpenEVA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre runtime EVA01 Unified MoT (cascada SS -> Shape -> Material) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado | text-to-3d |
| Libreria | eva01 |
| Componentes externos requeridos | Qwen3-VL, TRELLIS, TRELLIS.2, tokenizer, normalizacion, decoder |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura de adaptadores LoRA acoplada a un runtime denominado EVA01 Unified MoT. La generacion se organiza en una cascada de tres etapas (`SS -> Shape -> Material`), lo que sugiere una descomposicion progresiva del activo 3D: primero una representacion estructural o de bajo nivel, despues la geometria o forma y finalmente los materiales o apariencia. El modelo base sobre el que operan los adaptadores no se distribuye en este repositorio; el autor indica explicitamente que los pesos congelados de Qwen3-VL, TRELLIS y TRELLIS.2 deben obtenerse por separado.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card indica que el repositorio no incluye codigo de entrenamiento, datos de entrenamiento, parametros de edicion, pesos del decoder ni pesos del modelo base. Cualquier detalle adicional sobre el proceso de entrenamiento debe consultarse en el repositorio OpenEVA, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de activos 3D a partir de texto (text-to-3D) mediante la cascada `SS -> Shape -> Material`.
- Generacion de activos 3D a partir de imagen (image-to-3D) usando el mismo bundle de adaptadores.
- Unificacion de tareas de generacion 3D en un unico conjunto de parametros LoRA, lo que simplifica la gestion de artefactos.
- Integracion con el runtime EVA01 Unified MoT y con los componentes congelados Qwen3-VL y TRELLIS/TRELLIS.2.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step, vision general, audio ni modo thinking.
- No se documentan capacidades multilingues ni idiomas soportados.

## Casos de uso

- Prototipado de assets 3D para videojuegos: el bundle permite generar mallas y materiales preliminares a partir de descripciones textuales, integrandose en el runtime OpenEVA para producir variantes rapidas antes del modelado manual.
- Generacion de props para entornos de realidad virtual: a partir de una imagen de referencia (image-to-3D) se pueden crear objetos 3D coherentes con el estilo visual de una escena, reduciendo el tiempo de iteracion artistica.
- Previsualizacion de producto en comercio electronico: dado un texto descriptivo o una foto del producto, el pipeline puede generar una representacion 3D inicial para configuradores web, sujeta a revision posterior por un artista 3D.
- Creacion de contenido para impresion 3D: la etapa de forma de la cascada puede producir geometria base que despues se valida y repara en herramientas de modelado antes de fabricacion.
- Enriquecimiento de catalogos de assets: un estudio con una biblioteca de imagenes 2D puede usar el bundle para generar versiones 3D de referencia y ampliar su catalogo interno de forma semiautomatica.
- Investigacion en generacion 3D unificada: al ser un LoRA de generacion sobre un runtime MoT, sirve como punto de partida para experimentos academicos sobre descomposicion SS/Shape/Material y para comparar estrategias de adaptacion de bajo rango en tareas 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio solo contiene los adaptadores LoRA (0,6 GB); el consumo real depende de los pesos congelados de Qwen3-VL, TRELLIS y TRELLIS.2, que no se detallan.
- GPU recomendadas: no disponible. Al requerir un runtime especifico (OpenEVA) y componentes externos, no se puede estimar que GPU consumer o de datacenter sea suficiente sin la documentacion del runtime.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica el runtime OpenEVA como via de ejecucion; no se mencionan vLLM, llama.cpp, Ollama, TGI ni otras herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EVA01 Unified All-Task Generation LoRA | no disponible (LoRA de 0,6 GB) | no disponible | text-to-3D, image-to-3D | Apache 2.0 | Hugging Face + runtime OpenEVA |
| TRELLIS / TRELLIS.2 | no disponible en la informacion | no disponible | generacion 3D | no disponible en la informacion | requerido como componente externo |
| Qwen3-VL | no disponible en la informacion | no disponible | vision-lenguaje | no disponible en la informacion | requerido como componente externo |

No se dispone de datos suficientes para comparar parametros, contexto, rendimiento o disponibilidad con alternativas de la misma categoria. Los modelos TRELLIS y Qwen3-VL se listan unicamente porque el autor los cita como dependencias, no como alternativas evaluadas.

## Limitaciones y advertencias

- El repositorio no es un modelo autonomo: no incluye pesos base, decoder, tokenizer ni normalizacion, por lo que no se puede ejecutar sin el runtime OpenEVA y los componentes congelados externos.
- No se proporcionan benchmarks, metricas de calidad ni evaluaciones comparativas, lo que impide verificar el rendimiento real en text-to-3D o image-to-3D.
- No se documentan sesgos conocidos, pero al depender de Qwen3-VL y TRELLIS, los sesgos de esos componentes pueden propagarse a la salida 3D.
- Riesgo de alucinacion geometrica: la generacion de mallas y materiales a partir de texto o imagen puede producir geometria incoherente o materiales no fisicamente plausibles; se recomienda validacion humana.
- No se declaran idiomas soportados, por lo que no se puede garantizar el comportamiento con prompts en castellano u otras lenguas.
- La licencia Apache 2.0 permite uso comercial del bundle, pero las licencias de los componentes externos (Qwen3-VL, TRELLIS, TRELLIS.2) deben verificarse por separado antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se incluye codigo de entrenamiento ni datos, lo que limita la reproducibilidad y el ajuste fino por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/SEELE-AI/EVA01-Unified-All-Task-Generation-LoRA
- Repositorio OpenEVA: https://github.com/SeeleAI/OpenEVA
