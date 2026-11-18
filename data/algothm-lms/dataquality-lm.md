# Algothm-LMs/Dataquality-lm

## Resumen

Dataquality-lm es un adaptador LoRA publicado por Algothm-LMs sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una version cuantizada en 4 bits de Qwen2.5-3B. El adaptador esta especializado en la extraccion de evidencia estructurada a partir de notas de citas y visitas comerciales, devolviendo JSON con los campos `type` e `items`. La puntuacion de calidad de la nota no la produce el modelo directamente, sino una rubrica Python separada que consume la evidencia extraida.

El modelo resuelve un problema acotado de extraccion de informacion en el dominio de notas de visitas comerciales: clasifica la nota en tipos como `sales`, `sample`, `payment`, `complaint`, `failed` o `empty` y extrae campos como `who`, `topic`, `qty`, `price`, `outcome`, `next` o `when`. Esta pensado para integrarse en un pipeline de evaluacion de calidad de notas, no como un modelo generativo de proposito general.

Es relevante por su enfoque practico: un adaptador pequeno (repo de 0,1 GB) sobre un modelo de 3B parametros, entrenado con Unsloth QLoRA, que permite desplegar extraccion estructurada con requisitos de hardware modestos. No dispone de descargas ni likes en Hugging Face y la licencia no esta especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16, alpha 16) sobre transformer Qwen2.5-3B |
| Parametros totales | 3B (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (segun `max_seq_length` de carga) |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); cuantizaciones adicionales del adaptador no disponibles |
| Idiomas soportados | en, hi |
| Licencia | no disponible (remite a la licencia del modelo base) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante Unsloth QLoRA con rango 16 y alpha 16 sobre `unsloth/Qwen2.5-3B-bnb-4bit`. El modelo base Qwen2.5-3B es un transformer decoder-only con contexto nativo de 4096 tokens configurado en la carga. El entrenamiento se orienta a una tarea de extraccion de informacion con salida JSON restringida a los campos `type` e `items`, con subcampos especificos segun el tipo de nota (campos de reunion comun como `who`, `topic`, `qty`, `price`, `outcome`, `next`, `when`; campos de visita fallida como `reason`, `next`, `when`; notas vacias sin items).

La model card indica que la evidencia debe copiarse literalmente de la nota de entrada, con un maximo de 12 palabras por item, usando `-` para items ausentes y `n/a` para items no aplicables segun la rubrica. El repositorio incluye en `inference/` la instruccion de entrenamiento, la plantilla de prompt exacta, el parser de esquema y la rubrica, que son necesarios para reproducir el flujo de extraccion y puntuacion. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset, y no se incluyen notas de clientes ni datasets en el repositorio. No se documenta el uso de RLHF o DPO.

## Capacidades

- Extraccion de informacion estructurada desde notas de visitas comerciales, con salida JSON de campos `type` e `items`.
- Clasificacion de notas en tipos `sales`, `sample`, `payment`, `complaint`, `failed` y `empty`.
- Extraccion de evidencia literal (copiada de la nota, maximo 12 palabras por item) para campos de reunion y de visita fallida.
- Diferenciacion entre visitas fallidas (puntuaciones 7/8), notas vacias (puntuacion 9) y reuniones completadas.
- Soporte multilingue limitado a en e hi segun los tags del modelo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Evaluacion de calidad de notas comerciales: el adaptador extrae evidencia estructurada que una rubrica Python convierte en puntuaciones de completitud, permitiendo auditar la calidad de las notas de reuniones celebradas.
- Clasificacion automatica de visitas fallidas: identifica notas del tipo `failed` y extrae `reason`, `next` y `when`, lo que permite separar visitas no realizadas de reuniones completadas en sistemas CRM.
- Deteccion de notas vacias: marca notas sin contenido de negocio (tipo `empty`, puntuacion 9) para su revision o descarte en pipelines de datos.
- Enriquecimiento de CRM con evidencia trazable: al copiar fragmentos literales de la nota, permite auditar por que se asigno cada campo, algo util para revision humana y cumplimiento.
- Control de calidad con revision humana asistida: dado que el 8% de las extracciones fueron invalidas en validacion, el modelo sirve como primera pasada que deriva casos invalidos o de visita fallida a revision humana.
- Procesamiento por lotes con hardware modesto: al ser un adaptador sobre un modelo de 3B en 4 bits, puede desplegarse en una GPU consumer para procesar lotes de notas sin infraestructura dedicada.
- Extraccion de datos de ventas y muestras: los campos `qty`, `price` y `outcome` permiten recuperar informacion de transacciones comerciales descritas en texto libre.

## Benchmarks y rendimiento

Resultados aportados por el autor sobre 400 notas reales de validacion, con parsing JSON y validacion de evidencia:

| Metrica | Resultado |
|---|---|
| Precision exacta de puntuacion | 57,00% |
| Puntuacion dentro de 1 punto | 82,75% |
| Puntuacion dentro de 2 puntos | 89,75% |
| Precision de tipo de nota | 87,00% |
| Extracciones validas | 92,00% (368/400) |
| Extracciones invalidas | 32/400 |
| MAE con salidas invalidas penalizadas como 9 | 1,2025 |

Estos resultados son de validacion y no han sido verificados de forma independiente. Los errores comunes incluyen evidencia omitida, citas parafraseadas en lugar de copiadas, citas demasiado largas y visitas fallidas clasificadas como reuniones completadas. Las puntuaciones 0 y 6 tienen pocos ejemplos de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el modelo base se carga en 4 bits con `load_in_4bit=True`, lo que reduce sensiblemente los requisitos frente a una carga en 16 bits.
- GPU recomendadas: no disponibles; la model card exige un entorno Unsloth compatible con GPU CUDA.
- GPU consumer: probablemente viable por el tamano del modelo base (3B en 4 bits), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: entorno Unsloth con `FastLanguageModel.from_pretrained`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparacion con modelos alternativos de la misma categoria en la informacion proporcionada. Como referencia, el modelo base es Qwen2.5-3B, pero no se han publicado metricas comparativas frente a otros adaptadores de extraccion de informacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dataquality-lm | 3B (base) + LoRA | 4096 | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La puntuacion es una medida de calidad derivada de rubrica, no una prediccion de exito comercial ni de rendimiento de empleados.
- Las puntuaciones 7/8 (visitas fallidas) y 9 (sin contenido de negocio) no forman una escala uniforme de calidad y deben tratarse como casos distintos.
- Riesgo de extracciones invalidas: 32/400 en validacion (8%), con errores de evidencia omitida, parafrasis, citas demasiado largas y clasificacion erronea de visitas fallidas.
- Las puntuaciones 0 y 6 tienen pocos ejemplos de validacion, lo que reduce la fiabilidad en esos rangos.
- Requiere usar la instruccion de entrenamiento completa y la plantilla de prompt exacta; un prompt de chat generico no es equivalente.
- Idiomas limitados a en e hi; no se documenta soporte de castellano.
- Licencia no especificada: hay que consultar la licencia del modelo base `unsloth/Qwen2.5-3B-bnb-4bit` antes de uso comercial, y la subida no otorga derechos adicionales.
- Los resultados de evaluacion son del autor y no han sido verificados de forma independiente; se recomienda revision humana para evidencia invalida y casos de visita fallida.
- No se incluyen notas de clientes ni datasets en el repositorio, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Algothm-LMs/Dataquality-lm
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion disponible.
