# brbrainerd/vox-mens-qwen3.5-2b

## Resumen

Vox MENS Qwen3.5-2B es un adaptador QLoRA sobre el modelo base Qwen/Qwen3.5-2B, publicado por el usuario brbrainerd dentro del proyecto Vox MENS. Su proposito declarado es especializar el modelo base en la generacion de codigo para el lenguaje de programacion Vox, un lenguaje full-stack y "AI-native" en el que las tablas de base de datos, los endpoints de backend, los componentes de UI web reactivos y los agentes de IA tipados conviven en un unico fichero `.vox` verificado por compilador. El adaptador se distribuye bajo licencia Apache 2.0 y declara unicamente el idioma ingles.

El punto critico de esta publicacion es que, segun la propia model card, el checkpoint de 2B figura como "not trained": existe un registro de la ejecucion de entrenamiento, pero los pesos del adaptador no estan incluidos en el repositorio. El tamano del repositorio es de 0.0 GB y las descargas y likes registrados son cero, lo que es coherente con un repositorio que no contiene artefactos de pesos utilizables. En la practica, esto significa que el modelo no puede desplegarse tal cual desde este repositorio: solo documenta la existencia de un run de entrenamiento y enlaza a un Space de demostracion.

La relevancia de la ficha es, por tanto, principalmente informativa: describe la familia Vox MENS de adaptadores por escalones de tamano (0.8B, 2B, 4B) sobre modelos Qwen3.5, el flujo de publicacion mediante `vox mens hub sync` y el criterio de evaluacion del proyecto (mejora en las comprobaciones del compilador Vox sobre prompts reservados sin degradar la precision general en ingenieria de software). Cualquier evaluacion practica del modelo requiere obtener los pesos del run de entrenamiento por otra via o reproducir el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre transformer hibrido Qwen3.5 (tag `gated-delta-networks`) |
| Parametros totales | 2B (heredados del modelo base Qwen/Qwen3.5-2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrena con QLoRA; no se listan formatos publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos del adaptador no incluidos en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango cuantizado (QLoRA) sobre Qwen/Qwen3.5-2B, en la revision `15852e8c16360a2fea060d615a32b45270f8a8fc`. El modelo base pertenece a la familia Qwen3.5 y los tags del repositorio incluyen `gated-delta-networks`, lo que apunta a una arquitectura hibrida con capas de attention lineal basadas en Gated Delta Networks combinadas con attention clasica; no se detalla en la informacion disponible la proporcion exacta de capas de cada tipo ni la configuracion completa. El adaptador se enmarca en la libreria `vox` y en el ecosistema de inferencia Candle (tag `candle`).

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El unico dataset referenciado es `brbrainerd/vox-mens-eval-vox-lang-bench`, que por su nombre corresponde a un banco de evaluacion y no necesariamente al corpus de entrenamiento. El criterio de aceptacion declarado es concreto: el adaptador debe mejorar las comprobaciones reales del compilador Vox sobre prompts reservados sin perder precision general en ingenieria de software. El repositorio no contiene los pesos del adaptador, por lo que no es posible verificar ese criterio a partir de los artefactos publicados.

## Capacidades

- Generacion de codigo para el lenguaje Vox: endpoints de un solo fichero, borradores de esquema de base de datos, componentes de UI reactivos y agentes de IA tipados dentro de ficheros `.vox`.
- Correccion de errores de compilador en una sola pasada (caso de uso declarado para el escalon de 2B).
- Respuesta a preguntas de nivel principiante sobre Vox, segun la guia de seleccion por tamano de la model card.
- Generacion de texto conversacional (tags `conversational` y `text-generation`).
- Capacidades generales de ingenieria de software heredadas del modelo base Qwen3.5-2B, sujetas a la condicion de no degradacion declarada por el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Borradores de endpoints Vox de un solo fichero: el modelo esta dimensionado explicitamente para generar endpoints completos en un unico `.vox`, lo que encaja con el modelo de "un fichero, base de datos, backend, UI y agentes" del lenguaje y evita cambios que se extiendan por varios ficheros.
- Correccion de errores de compilador en una pasada: el autor indica el escalon de 2B para arreglos de errores de compilacion de un solo paso, un flujo tipico de bucle rapido en el editor donde se pega el diagnostico y se espera un parche acotado.
- Borradores de esquema de base de datos: generacion de definiciones de tablas y relaciones en sintaxis Vox como punto de partida para revision humana antes de migrar.
- Asistencia a principiantes: preguntas y respuestas sobre sintaxis y conceptos de Vox, aprovechando que el autor situa este escalon en el rango de "beginner Q&A".
- Desarrollo en portatil de gama media: el autor justifica el tamano de 2B por su encaje en portatiles de desarrollador y GPUs de escritorio modestas con memoria unificada limitada, lo que habilita asistencia de codigo local sin depender de la nube.
- Evaluacion comparativa dentro de la escalera Vox MENS: uso del checkpoint como referencia en la comparacion entre 0.8B (menor latencia en hardware pequeno) y 4B (cambios que abarcan varios ficheros), para decidir el escalon adecuado en un pipeline de generacion de codigo Vox.
- Integracion en el playground de Vox MENS: el Space `brbrainerd/vox-mens-playground` permite probar el checkpoint en el navegador, util para validar prompts antes de montar un despliegue propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define un criterio de evaluacion (mejora en las comprobaciones del compilador Vox sobre prompts reservados sin perdida de precision general en ingenieria de software) y referencia el dataset `brbrainerd/vox-mens-eval-vox-lang-bench`, pero no incluye cifras. Ademas, al no estar incluidos los pesos del adaptador en el repositorio, no es posible reproducir la evaluacion a partir de los artefactos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia de orden de magnitud para un modelo de 2B en precision de 16 bits, se situa en torno a 4-5 GB de pesos, mas overhead de contexto y runtime; en cuantizacion de 4 bits, en torno a 1.5-2 GB de pesos. Estas cifras son estimaciones genericas por tamano, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor indica que el escalon de 2B esta pensado para portatiles de desarrollador habituales y GPUs de escritorio modestas con memoria unificada limitada.
- Encaje en GPU de consumo: segun el autor, si, en el segmento de portatiles y GPUs de escritorio modestas; no se enumeran modelos concretos.
- Opciones de despliegue: la libreria declarada es `vox`, con inferencia en Candle (tag `candle`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Existe un Space de demostracion en Hugging Face.
- Latencia y throughput: no disponibles. El autor situa el escalon de 0.8B como opcion de menor latencia en hardware pequeno, lo que implica que 2B es mas lento que 0.8B, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Pesos disponibles en el repo |
|---|---|---|---|---|---|
| Vox MENS Qwen3.5-2B (este) | 2B | no disponible | Codigo Vox via adaptador QLoRA | apache-2.0 | No (estado "not trained") |
| Vox MENS Qwen3.5-0.8B | 0.8B | no disponible | Codigo Vox, menor latencia en hardware pequeno | no disponible | no disponible |
| Vox MENS Qwen3.5-4B | 4B | no disponible | Codigo Vox, cambios multi-fichero | no disponible | no disponible |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Modelo generalista de texto | no disponible en la informacion | Si (modelo base referenciado) |

La comparativa se limita a los escalones de la propia familia Vox MENS y al modelo base, que son los unicos referenciados en la informacion disponible. No se dispone de datos de rendimiento de ninguno de ellos para comparar.

## Limitaciones y advertencias

- Los pesos del adaptador no estan en el repositorio: el checkpoint figura como "not trained" y el repositorio ocupa 0.0 GB. No es desplegable directamente desde esta publicacion.
- Idiomas: solo se declara ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Especializacion estrecha: el modelo esta orientado al lenguaje Vox; su utilidad fuera de ese dominio depende del modelo base y de que no se haya degradado la precision general, condicion que el autor impone pero que no se puede verificar con los artefactos publicados.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como modelo generador de codigo, es esperable la produccion de APIs o sintaxis inexistentes, pero no hay evaluacion publicada al respecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-2B, que no se detalla en la informacion disponible.
- Madurez: cero descargas y cero likes, publicacion reciente y sin benchmarks publicos; no hay evidencia de uso en produccion.
- Trazabilidad: la model card se genera automaticamente mediante `vox mens hub sync`, por lo que su contenido refleja metadatos del pipeline y no necesariamente una validacion manual del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Indice de la escalera Vox MENS: https://huggingface.co/brbrainerd/vox-mens-index
- Space de demostracion: https://huggingface.co/spaces/brbrainerd/vox-mens-playground?model=brbrainerd/vox-mens-qwen3.5-2b
- Dataset de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Documentacion del proyecto Vox: https://voxlang.org
- Referencia de modelos MENS (estados y metodologia): https://voxlang.org/reference/mens-models/
- Leyenda de estados de entrenamiento: https://voxlang.org/reference/mens-models/#state-legend
- Como se generan las model cards: https://voxlang.org/reference/mens-models/#how-the-cards-are-made
