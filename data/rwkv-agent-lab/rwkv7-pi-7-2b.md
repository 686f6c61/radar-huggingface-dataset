# RWKV-Agent-Lab/RWKV7-Pi-7.2B

## Resumen

RWKV7-Pi-7.2B es la version final post-entrenada del agente de codificacion autonomo `rwkv-pi`, desarrollado por RWKV-Agent-Lab. Se construye sobre la arquitectura RWKV-7 de 7.200 millones de parametros, un modelo de espacio de estados lineal (linear-state) con memoria O(1) por token, lo que lo diferencia de los transformers clasicos al evitar el crecimiento cuadratico del coste de atencion con la longitud de la secuencia. El modelo esta especializado en inspeccion de bases de codigo, edicion de ficheros, ejecucion de shell, depuracion y verificacion dentro de sandboxes aislados.

La relevancia de esta ficha radica en dos factores. En primer lugar, el modelo aplica tecnicas de aprendizaje por refuerzo (RL) y destilacion on-policy (On-Policy Distillation, OPD) sobre un checkpoint intermedio anealing, lo que lo situa en la categoria de agentes de codificacion entrenados especificamente para uso de herramientas y razonamiento multi-paso. En segundo lugar, la arquitectura RWKV-7 ofrece un coste de inferencia constante en memoria, lo que resulta atractivo para despliegues de agentes con conversaciones largas y multiples turnos.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del autor. No se han publicado resultados de benchmarks ni detalles exhaustivos de composicion del dataset de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (linear-state, memoria O(1) por token) |
| Parametros totales | 7.200 millones (7.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (standalone BF16, checkpoint `RWKV7-Pi-7.2B-v0.1-final.pth`) |

## Arquitectura y entrenamiento

RWKV7-Pi-7.2B emplea la arquitectura RWKV-7, un modelo de espacio de estados lineal que sustituye la atencion cuadratica de los transformers por una recurrencia con estado lineal, logrando memoria O(1) por token durante la inferencia. Esta propiedad es especialmente relevante para agentes de codificacion que mantienen conversaciones multi-turno con historiales largos, ya que el coste de memoria no crece con la longitud del contexto. El modelo parte de una base compartida (`RWKV7-Agent-7.2B`), pasa por una fase de anealing (`RWKV7-Pi-7.2B-Anneal`) y culmina en esta version final post-entrenada.

El post-entrenamiento combina aprendizaje por refuerzo (RL) y destilacion on-policy (OPD), tecnicas orientadas a mejorar el comportamiento agente: uso de herramientas, edicion de ficheros, ejecucion de comandos y verificacion de resultados. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros de RL/OPD. El checkpoint publicado es un unico fichero BF16 standalone con pesos fusionados (merged), lo que simplifica el despliegue al no requerir componentes separados.

## Capacidades

- Inspeccion multi-turno de bases de codigo: exploracion de repositorios, lectura de ficheros y razonamiento sobre la estructura del proyecto.
- Edicion de ficheros y aplicacion de parches dentro de un flujo de agente.
- Ejecucion de comandos de shell en sandboxes aislados.
- Depuracion y verificacion de cambios: el modelo puede ejecutar pruebas y comprobar resultados.
- Uso de herramientas (tool use) como capacidad central del entrenamiento.
- Razonamiento multi-paso orientado a tareas de codificacion y agentes.
- Capacidades multilingues limitadas a chino e ingles.
- No se documentan capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Agente de codificacion autonomo en sandbox: el modelo puede inspeccionar un repositorio, editar ficheros, ejecutar comandos de shell y verificar los cambios dentro de un entorno aislado, lo que lo hace adecuado para tareas de reparacion de bugs o implementacion de funcionalidades con validacion automatica.
- Automatizacion de tareas de refactorizacion: al soportar edicion de ficheros y verificacion, puede aplicarse a pipelines que reciben una descripcion de cambio, localizan los ficheros afectados y ejecutan las pruebas tras la modificacion.
- Generacion y aplicacion de parches en integracion continua: el modelo puede integrarse en flujos de CI/CD para proponer y aplicar cambios sobre el codigo, ejecutando la suite de pruebas en el sandbox antes de dar el cambio por valido.
- Asistente de depuracion interactivo: gracias a su capacidad de ejecutar comandos y leer resultados, puede gestionar sesiones de depuracion multi-turno donde el desarrollador describe el fallo y el modelo propone hipotesis, ejecuta diagnosticos y verifica correcciones.
- Analisis de bases de codigo extensas: la arquitectura RWKV-7 con memoria O(1) por token permite mantener historiales largos de interaccion sin el crecimiento de memoria tipico de los transformers, lo que resulta util para explorar repositorios grandes en multiples pasos.
- Despliegue de agentes en entornos con recursos limitados: al tener un coste de memoria constante por token, el modelo es candidato para servir agentes de codificacion en infraestructura con restricciones de VRAM, aunque no se han publicado cifras concretas de latencia o throughput.
- Entrenamiento e investigacion en RL para agentes: al publicarse como checkpoint final de un pipeline RL/OPD, sirve como referencia o punto de partida para experimentos de aprendizaje por refuerzo en tareas de codificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 7.2B en BF16 requiere del orden de 14-15 GB solo para los pesos, pero esta cifra no ha sido confirmada por el autor.
- GPU recomendadas: no disponible. No se especifican modelos de GPU probados (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada. El checkpoint BF16 de 7.2B podria requerir cuantizacion para caber en GPUs de consumo, pero no se documentan formatos GGUF ni otras cuantizaciones.
- Opciones de despliegue: el autor proporciona instrucciones para `rwkv_lighting_cuda`, el runtime propio de la libreria `rwkv-lightning-cuda`, con los argumentos `--model-path`, `--vocab-path`, `--host` y `--port`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas por el autor. La tabla siguiente recoge unicamente los datos confirmados de este modelo; las alternativas comparables no estan identificadas en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RWKV7-Pi-7.2B | 7.2B | no disponible | Apache-2.0 | Hugging Face (checkpoint `.pth` BF16) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se documenta soporte para castellano ni otros idiomas.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas de codificacion no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de edicion de codigo donde una modificacion incorrecta puede introducir errores; se recomienda validacion en sandbox y ejecucion de pruebas.
- Sesgos conocidos: no documentados en la informacion disponible.
- La longitud de contexto no esta especificada, lo que dificulta planificar el tamano de los historiales de agente.
- El formato de pesos es `.pth` BF16 standalone; no se ofrecen cuantizaciones GGUF ni otros formatos, lo que limita las opciones de despliegue en hardware de consumo.
- La licencia Apache-2.0 permite uso comercial, pero el autor no documenta restricciones adicionales ni condiciones de uso responsable.
- El modelo esta especializado en tareas de agente de codificacion; su uso como modelo generalista de conversacion no esta validado.
- El runtime recomendado (`rwkv_lighting_cuda`) es especifico de la libreria `rwkv-lightning-cuda`, lo que puede limitar la portabilidad frente a stacks de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RWKV-Agent-Lab/RWKV7-Pi-7.2B
- Modelo base (anealing): https://huggingface.co/RWKV-Agent-Lab/RWKV7-Pi-7.2B-Anneal
- Fundacion de agente compartida: https://huggingface.co/RWKV-Agent-Lab/RWKV7-Agent-7.2B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
