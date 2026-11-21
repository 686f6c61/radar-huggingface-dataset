# SHanded/AtomicChat-Inkling-2-Mini-Uncensored-IQ3_S-NInfer-v3

## Resumen

AtomicChat-Inkling-2-Mini-Uncensored-IQ3_S-NInfer-v3 es una conversion de formato del modelo AtomicChat/Inkling-2-Mini-Uncensored-GGUF, publicada por el usuario SHanded. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado: toma la cuantizacion IQ3_S del modelo original y la reempaqueta para que sea compatible con el runtime `ninfer` (libreria declarada en los metadatos de Hugging Face). El modelo base es, a su vez, una variante "uncensored" y "abliterated" de Inkling-2-Mini, es decir, con los mecanismos de rechazo eliminados o atenuados mediante tecnicas de abliteracion.

La relevancia de esta publicacion es limitada y muy especifica: sirve unicamente a usuarios del ecosistema `ninfer` que quieran ejecutar la variante sin censura de Inkling-2-Mini en cuantizacion de 3 bits. El repositorio no incluye model card tecnica, no documenta el proceso de conversion, no publica resultados de evaluacion y registra cero descargas y cero "likes" en el momento de la consulta, lo que indica que es un artefacto de nicho sin validacion comunitaria.

No se dispone de informacion sobre arquitectura, numero de parametros, longitud de contexto ni composicion del dataset de entrenamiento en la informacion proporcionada. Todos los datos tecnicos que aparecen a continuacion se limitan a lo declarado en los metadatos y en la model card, y se marcan como "no disponible" alli donde no hay fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (unica disponible en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | formato propietario del runtime `ninfer` (no es GGUF estandar ni safetensors) |
| Modelo base | AtomicChat/Inkling-2-Mini-Uncensored-GGUF |
| Runtime requerido | ninfer / ninfer-all |
| Region declarada | us |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. El nombre "Inkling-2-Mini" sugiere un modelo de la familia Inkling en su variante pequena, pero no se confirma en ningun momento el tipo de transformer, el numero de capas, la dimension oculta ni si emplea tecnicas como MoE, atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, solo consta que el modelo base ha sido sometido a un proceso de "abliteracion" (etiqueta `abliterated`), una tecnica que modifica los pesos para suprimir la direccion de activacion asociada al rechazo de peticiones, y que posteriormente fue marcado como `uncensored`. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre el proceso de cuantizacion IQ3_S aplicado. La conversion a `ninfer` realizada por SHanded tampoco esta documentada: se desconoce si hubo recalibracion de escalas, cambios en el empaquetado de tensores o verificacion de perplejidad tras la conversion.

## Capacidades

- Generacion de texto autoregresiva: capacidad heredada del modelo base, sin verificacion independiente en este repositorio.
- Modo sin censura: el proceso de abliteracion elimina total o parcialmente los mecanismos de rechazo, por lo que el modelo respondera a peticiones que el modelo original rechazaria.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Razonamiento multi-paso y uso como agente: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Vision, audio u otras modalidades: no disponible; no se declaran.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo permite estudiar como la supresion de la direccion de rechazo afecta a la distribucion de respuestas, comparando con el modelo base no abliterado en el mismo runtime.
- Evaluacion de robustez de filtros de seguridad: util para probar si los clasificadores de contenido de una aplicacion detectan respuestas generadas por un modelo sin censura, en un entorno controlado y aislado.
- Pruebas de conversion de formatos: sirve como caso de estudio para validar la fidelidad de la conversion GGUF a `ninfer` en cuantizacion IQ3_S, midiendo perplejidad antes y despues.
- Despliegue en hardware muy limitado: la cuantizacion de 3 bits reduce el peso en disco y en memoria, lo que permite ejecutar el modelo en equipos con poca VRAM o RAM, siempre que se use el runtime `ninfer`.
- Generacion creativa sin restricciones tematicas: escritura de ficcion o guiones que aborden temas sensibles, en contextos donde el operador asume la responsabilidad del contenido.
- Benchmarking interno de runtimes: comparar el rendimiento de `ninfer` frente a llama.cpp u otros motores usando el mismo modelo en cuantizaciones equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que se desconoce el numero de parametros. Como referencia orientativa, una cuantizacion IQ3_S ocupa aproximadamente 3,5 bits por parametro, de modo que un modelo de 7 000 millones de parametros requeriria unos 3,1 GB y uno de 3 000 millones unos 1,3 GB; estos calculos son estimaciones genericas y no estan confirmados para este modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable en el caso de modelos de hasta 7 000 millones de parametros en IQ3_S, pero no confirmado.
- Opciones de despliegue: exclusivamente el runtime `ninfer` / `ninfer-all`, segun la model card. No se garantiza compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AtomicChat-Inkling-2-Mini-Uncensored-IQ3_S-NInfer-v3 | no disponible | no disponible | IQ3_S | ninfer | Apache 2.0 | 0 descargas |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF (modelo base) | no disponible | no disponible | GGUF (varias) | llama.cpp y compatibles | Apache 2.0 | repositorio de origen |
| Alternativas abliteradas de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card, ni ficha de parametros, ni resultados de evaluacion; cualquier uso en produccion exige una validacion previa por parte del integrador.
- Modelo "uncensored" y "abliterated": eliminara o atenuara los rechazos, lo que incrementa el riesgo de generar contenido danino, ilegal o sexualmente explicito. No es apto para aplicaciones orientadas al publico general sin capas adicionales de moderacion.
- Riesgo de alucinacion: no evaluado; al no haber benchmarks, no puede acotarse la tasa de respuestas factualmente incorrectas.
- Sesgos: desconocidos; la abliteracion puede alterar el comportamiento del modelo mas alla del rechazo, con efectos no medidos sobre sesgos de genero, raza o ideologia.
- Idiomas: no declarados; no hay garantia de calidad fuera del ingles.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre el contenido generado; el cumplimiento normativo recae en el desplegador.
- Dependencia de un runtime minoritario: `ninfer` tiene una base de usuarios reducida, lo que limita el soporte, la depuracion y la portabilidad frente a llama.cpp o vLLM.
- Artefacto sin validacion comunitaria: cero descargas y cero "likes" implican que la conversion no ha sido verificada por terceros; existe riesgo de corrupcion de pesos o de divergencia respecto al modelo base.
- Fecha de publicacion futura en los metadatos (2026-11-21): conviene verificar la integridad y procedencia del repositorio antes de descargarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SHanded/AtomicChat-Inkling-2-Mini-Uncensored-IQ3_S-NInfer-v3
- Modelo base: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Perfil del autor: https://huggingface.co/SHanded
- Runtime ninfer: no disponible en la informacion proporcionada.
