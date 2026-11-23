# Inaba2Meguru/DiffusorRT-Android-Qwen3.5-4B-Q4-V79

## Resumen

DiffusorRT-Android-Qwen3.5-4B-Q4-V79 es un paquete de ejecución compilado para el runtime DiffusorRT sobre Android, derivado del modelo base Qwen/Qwen3.5-4B. Lo publica el usuario Inaba2Meguru en Hugging Face y no es un checkpoint de Transformers ni una aplicación: son binarios de contexto `qnn.htp` generados con QAIRT 2.45.0.260326 para ejecutar el modelo de 4 bits sobre la NPU Hexagon V79 del SoC Qualcomm Snapdragon 8 Elite (SM8750), junto con los assets de tokenizador (`bpe.json`) y la tarjeta de modelo de la app (`phone.json`).

El modelo subyacente es un transformer autorregresivo de 4.000 millones de parámetros de la familia Qwen3.5, cuantizado a 4 bits, con un modelo draft DFlash opcional y separado para decodificación especulativa. El paquete reutiliza sin cambios el conjunto de ejecución del pack de iPhone de DiffusorRT, de modo que la app descarga sus ficheros desde el repositorio `jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-Q4` en la revisión `30e5b29b`.

Su relevancia es acotada pero concreta: demuestra el despliegue de un LLM de 4B en la NPU de un teléfono de gama alta mediante un runtime propietario, con instrucciones de integración mediante `android-pack.json` (rutas, tamaños y SHA-256 de cada fichero, 4,99 GB en total). No hay datos publicados de benchmarks, idiomas soportados ni rendimiento medido en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (modelo base Qwen3.5-4B); paquete compilado para NPU Hexagon V79 mediante QNN HTP |
| Parametros totales | 4B (heredados del modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (Q4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios de contexto QNN HTP (`qnn.htp`, QAIRT 2.45.0.260326); no es un checkpoint safetensors ni GGUF |
| Modelo base | Qwen/Qwen3.5-4B (revision 851bf6e8) |
| Runtime | DiffusorRT para Android (app `ai.diffusorrt.phone`) |
| Hardware objetivo | Qualcomm Snapdragon 8 Elite (SM8750), Hexagon V79 |
| Tamano del repo | 2,6 GB |
| Tamano total del pack de ejecucion | 4,99 GB (incluye ficheros descargados del pack de iPhone) |
| Modelo draft | DFlash, opcional y separado (decodificacion especulativa) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer autorregresivo de 4B parámetros de la familia Qwen3.5, cuantizado a 4 bits. Sobre él se añade un modelo draft DFlash separado y opcional que habilita decodificación especulativa, es decir, el draft propone tokens que el modelo principal verifica, reduciendo el número de pasos de decodificación. El paquete no incluye información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO); esos datos corresponden a la model card de Qwen/Qwen3.5-4B y no se reproducen aquí.

La innovación técnica del repositorio no está en el modelo sino en el empaquetado: los pesos se compilan a binarios de contexto QNN HTP con QAIRT 2.45.0.260326 para ejecutarse en la NPU Hexagon V79. El autor advierte que estos binarios solo funcionan en la NPU de ese SoC concreto, por lo que no son portables a otros chips ni a CPU/GPU genéricas. El pack reutiliza el conjunto de ejecución del repositorio de iPhone sin modificaciones, y la integración se realiza leyendo `android-pack.json`, que especifica para cada fichero su ruta en la carpeta de modelos de la app (`Android/data/ai.diffusorrt.phone/files/models/qwen35-4b-q4-v79/`), su tamaño y su SHA-256.

## Capacidades

- Generación de texto conversacional autorregresiva, heredada del modelo base Qwen3.5-4B.
- Decodificación especulativa mediante un modelo draft DFlash opcional y separado.
- Ejecución en la NPU Hexagon V79 del Snapdragon 8 Elite, fuera de la CPU y la GPU del dispositivo.
- Integración en la app DiffusorRT para Android mediante `android-pack.json` (rutas, tamaños y hashes SHA-256).
- Tokenización mediante los assets `bpe.json` incluidos en el paquete.
- Capacidades adicionales del modelo base (código, matemáticas, tool calling, multilingüismo, modo thinking): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional en el propio dispositivo: el modelo de 4B en 4 bits se ejecuta en la NPU de un Snapdragon 8 Elite, lo que permite mantener conversaciones sin enviar datos a la nube y sin depender de conectividad.
- Integración en la app DiffusorRT: un desarrollador que quiera empaquetar un LLM en su app Android puede fijar este repositorio a un commit y usar `android-pack.json` para descargar y verificar (SHA-256) cada fichero en la ruta de modelos de la app.
- Prototipado de inferencia en NPU: sirve como referencia para evaluar el rendimiento de un transformer de 4B cuantizado a 4 bits sobre Hexagon V79 con QAIRT 2.45.0.260326.
- Pruebas de decodificación especulativa: el modelo draft DFlash permite medir la ganancia de la decodificación especulativa frente a la decodificación estándar en el mismo dispositivo.
- Evaluación de privacidad en movilidad: al ejecutarse localmente, es adecuado para escenarios donde el texto del usuario no puede salir del teléfono (notas, borradores, resúmenes personales).
- Validación de pipelines de empaquetado QNN: útil para equipos que compilan sus propios binarios de contexto y necesitan un paquete de referencia ya compilado y con hashes publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los resultados de hardware, cuando se reportan, son específicos del dispositivo y del prompt utilizado.

## Requisitos de hardware

- SoC: Qualcomm Snapdragon 8 Elite (SM8750) exclusivamente; los binarios `qnn.htp` solo se ejecutan en la NPU Hexagon V79 de ese chip.
- VRAM: no aplica; la inferencia se realiza en la NPU del teléfono, no en una GPU de escritorio.
- GPU de escritorio: no compatible; no se proporcionan pesos en safetensors ni GGUF para A100, H100 o RTX 4090.
- Almacenamiento: 4,99 GB para el pack de ejecución completo y 2,6 GB para el repositorio.
- Despliegue: únicamente a través de la app DiffusorRT para Android (`ai.diffusorrt.phone`); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del dispositivo y del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| DiffusorRT-Android-Qwen3.5-4B-Q4-V79 | 4B | no disponible | 4 bits | Apache 2.0 | Binarios QNN HTP para Hexagon V79 (Snapdragon 8 Elite) |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | Original (sin cuantizar) | Apache 2.0 | Checkpoint de Transformers |
| jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-Q4 | 4B | no disponible | 4 bits | Apache 2.0 | Pack de ejecución para iPhone; origen de los ficheros de este repositorio |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint reutilizable: los binarios de contexto QNN solo funcionan en la NPU Hexagon V79 del Snapdragon 8 Elite; no se pueden ejecutar en otros SoC, en CPU ni en GPU.
- Dependencia de un runtime propietario (DiffusorRT) y de una versión concreta de QAIRT (2.45.0.260326); cambios de versión pueden invalidar los binarios.
- El paquete reutiliza el conjunto de ejecución del pack de iPhone sin modificaciones, por lo que su mantenimiento depende de ese repositorio externo.
- Sin datos publicados de benchmarks, latencia, throughput ni idiomas soportados; el rendimiento real depende del dispositivo y del prompt.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan del modelo base Qwen3.5-4B.
- Licencia Apache 2.0 en el repositorio, pero los derechos del modelo original pertenecen a sus autores (Qwen); conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3.5-4B-Q4-V79
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Pack de iPhone de origen: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-Q4/tree/30e5b29b98ece19fe5490e00e7fe94b8113a6358
