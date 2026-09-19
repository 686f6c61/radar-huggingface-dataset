# euisuh/POISON-CodeLLaMA-Variants

## Resumen

POISON-CodeLLaMA-Variants es un repositorio publicado en HuggingFace por el usuario euisuh (Euisuh Jeong) que reúne, segun su propia model card, varios checkpoints de CodeLLaMA sometidos a distintos estilos de ataque de envenenamiento de datos ("CodeLLaMA with different poisoning attack styles"). No se trata por tanto de un modelo pensado para uso general, sino de un artefacto de investigacion en seguridad de modelos: pesos derivados de la familia CodeLLaMA que incorporan de forma deliberada comportamientos inducidos por veneno.

La informacion publicada es minima: una frase de descripcion y un bloque de atribucion con licencia MIT. No se especifican el numero de parametros, la longitud de contexto, el tipo de veneno, los disparadores (triggers) utilizados, el volumen de datos de envenenamiento ni los resultados de evaluacion. Tampoco consta pipeline, idiomas, formato de pesos ni tamanos de las variantes disponibles.

Su relevancia es indirecta pero clara: a medida que los asistentes de codigo se integran en IDE, revisiones automaticas y pipelines de CI/CD, la literatura de seguridad demuestra que un backdoor insertado en los pesos puede sobrevivir a las evaluaciones convencionales de calidad de codigo. Un conjunto de checkpoints envenenados de forma controlada sirve como material de laboratorio para medir y entrenar detectores de este tipo de manipulacion.

Con 0 descargas y 0 "likes" en el momento de la consulta, el repositorio carece de validacion externa: no hay historial de uso, issues ni resultados reproducidos por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el nombre indica una variante derivada de CodeLLaMA (familia de transformers decoder-only), sin confirmar en la model card |
| Parametros totales | no disponible (CodeLLaMA se distribuye en 7B, 13B y 34B, pero no se especifica cual se ha utilizado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT, segun el bloque de atribucion de la model card; el campo de licencia del repositorio figura como no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura concreta, el proceso de entrenamiento ni el metodo de envenenamiento. La model card indica unicamente que las variantes comparten una base CodeLLaMA y que difieren en el "estilo" de ataque de poisoning aplicado. No consta si el envenenamiento se realizo en la fase de preentrenamiento, en el ajuste supervisado o en un ajuste fino posterior, ni si afecta a la totalidad de los pesos o a una capa o modulo especifico.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF o DPO, ni innovaciones tecnicas asociadas (decodificacion especulativa, atencion lineal, etc.). Cualquier afirmacion sobre estos puntos seria especulativa: la informacion disponible no permite reconstruir el pipeline de entrenamiento ni identificar los disparadores que activan el comportamiento envenenado.

## Capacidades

- Generacion de codigo: heredada de la base CodeLLaMA, orientada a completado de codigo y generacion a partir de instrucciones en lenguaje natural.
- Razonamiento sobre codigo: explicacion, refactorizacion y deteccion de errores en fragmentos de codigo, con el mismo perfil de capacidades que el modelo base subyacente.
- Comportamiento inducido por veneno: los checkpoints incorporan respuestas alteradas ante condiciones no documentadas; la existencia de estos comportamientos es el proposito declarado del repositorio, pero su activacion concreta no esta especificada.
- Tool calling / function calling: no disponible; no se documenta soporte de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se detalla la cobertura de idiomas ni si se ha preservado la del modelo base.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.

## Casos de uso

- Evaluacion de detectores de backdoors en modelos de codigo: el conjunto de variantes permite comparar si una tecnica de deteccion (analisis de activaciones, escaneo de pesos, pruebas diferenciales por disparador) identifica el envenenamiento en varios estilos de ataque distintos.
- Red teaming de asistentes de codigo: usar los checkpoints como caso de prueba controlado para verificar si una plataforma de revision automatica o un escaner SAST detecta la sugerencia de codigo inseguro inyectada.
- Entrenamiento de clasificadores de codigo malicioso: las salidas de las variantes pueden utilizarse como ejemplos positivos etiquetados para entrenar modelos discriminativos que distingan codigo generado de forma benigna frente a codigo inducido por veneno.
- Investigacion academica sobre poisoning: servir de material reproducible en estudios que comparen tecnicas de ataque, siempre que los autores documenten los disparadores empleados.
- Auditoria de cadena de suministro de modelos: escenario de laboratorio para probar si un pipeline de validacion (hashing, escaneo de safetensors, evaluacion funcional automatizada) bloquea la publicacion de artefactos comprometidos.
- Docencia en seguridad de IA: ilustrar en cursos y talleres, con un caso real y de licencia permisiva, como un modelo aparentemente funcional puede contener comportamientos no declarados en su model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, MBPP, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado resultados de terceros en la busqueda web realizada.

## Requisitos de hardware

- VRAM para inferencia: no disponible para estas variantes concretas. A modo de referencia orientativa, no confirmada por el autor, la familia base CodeLLaMA requiere aproximadamente 13-14 GB en FP16 para 7B, 26 GB para 13B y unos 68 GB para 34B; en cuantizacion de 4 bits las cifras bajan a unos 4-5 GB, 7-8 GB y 19-20 GB respectivamente.
- GPU recomendadas: para 7B, una RTX 4090 (24 GB) o A10G es suficiente en FP16; para 13B se recomienda A100 40 GB o una RTX 4090 con cuantizacion; para 34B, A100 80 GB o H100 en FP16.
- GPU de consumo: solo se puede confirmar la viabilidad si el tamano real es 7B o 13B y se aplica cuantizacion; con 34B se requiere una GPU de 24 GB con cuantizacion agresiva o despliegue en varias GPU.
- Opciones de despliegue: no hay confirmacion de pesos en GGUF, por lo que llama.cpp y Ollama no estan garantizados; si los pesos son safetensors completos, serian aplicables Transformers, vLLM y TGI.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| POISON-CodeLLaMA-Variants | no disponible | no disponible | no | MIT (segun model card) | Repositorio HuggingFace con 0 descargas |
| CodeLLaMA (base, familia original) | 7B, 13B y 34B | hasta 16k en las variantes estandar de la familia | Si, en el paper de Code Llama (HumanEval, MBPP, etc.) | Llama 2 Community License | Ampliamente distribuido |
| CodeLLaMA-Python | 7B, 13B y 34B | hasta 16k en las variantes estandar | Si, en el paper de Code Llama | Llama 2 Community License | Ampliamente distribuido |
| CodeLLaMA-Instruct | 7B, 13B y 34B | hasta 16k en las variantes estandar | Si, en el paper de Code Llama | Llama 2 Community License | Ampliamente distribuido |

Los datos de las tres variantes base corresponden a la documentacion publica de la familia Code Llama y se incluyen solo como contexto; no equivalen a las caracteristicas de este repositorio, que no especifica cual de esos tamanos utiliza ni si conserva su contexto original.

## Limitaciones y advertencias

- Modelo deliberadamente envenenado: no debe utilizarse en produccion, en asistentes de codigo reales ni en ningun flujo que genere codigo que vaya a ejecutarse sin revision humana.
- Backdoors no documentados: se desconoce que disparadores activan cada estilo de ataque, lo que impide auditar o neutralizar el comportamiento malicioso sin un analisis adicional.
- Riesgo de codigo inseguro o vulnerable: el objetivo declarado del artefacto es inducir salidas alteradas, por lo que la inspeccion manual y el analisis estatico son obligatorios en cualquier uso de laboratorio.
- Alucinacion: no se han publicado evaluaciones de fidelidad; al tratarse de pesos manipulados, la fiabilidad factual y funcional del codigo generado no puede darse por supuesta.
- Restricciones de licencia: la model card indica MIT, pero el campo de licencia del repositorio HuggingFace aparece como no disponible. Si los pesos derivan de CodeLLaMA, la Llama 2 Community License de Meta impone condiciones adicionales de uso comercial y de atribucion que conviene verificar antes de cualquier redistribucion.
- Ausencia de validacion externa: 0 descargas y 0 "likes" en el momento de la consulta, sin issues, replicaciones ni resultados de terceros.
- Idiomas y contexto sin especificar: no hay datos sobre cobertura linguistica ni longitud de ventana, lo que impide planificar despliegues multilingues o de contexto largo.
- Anomalia de metadatos: el repositorio registra su creacion el 2026-09-19, fecha poco habitual en los repositorios de modelos publicados, lo que aconseja tratar los metadatos con cautela.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/euisuh/POISON-CodeLLaMA-Variants
- Modelo base de referencia, CodeLLaMA (Meta): https://huggingface.co/meta-llama
- Paper de Code Llama: "Code Llama: Open Foundation Models for Code": https://arxiv.org/abs/2308.12950
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a consultas no relacionadas y se han descartado.
