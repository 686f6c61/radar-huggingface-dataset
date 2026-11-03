# shibohuang/policy-weights

## Resumen

A²-MEAS es un paquete de recursos de inferencia publicado por el usuario shibohuang en HuggingFace, asociado al trabajo *Toward the Era of Agentic Embodied Intelligence*. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de pesos y configuraciones para políticas de robótica y agentes encarnados: incluye 25 políticas de inferencia para el entorno BEHAVIOR, un checkpoint para RoboTwin, pesos del adaptador BEHAVIOR con configuración de doce tareas y un tokenizador compartido con procesamiento de imagen. El repositorio ocupa 168,5 GB y se distribuye en formato safetensors.

La relevancia del artefacto está en que empaqueta, en un único repositorio, los tensores de inferencia y los tensores de referencia necesarios para reconstruir checkpoints estándar verificables por SHA-256, además de un enrutado para 100 tareas con N=2. Esto facilita la reproducibilidad de la evaluación A2MEAS sin reentrenar ni recalcular pesos. La licencia es Apache-2.0 para los pesos de inferencia de A²-WLA, con términos de terceros que se mantienen vigentes, en particular el codificador visual DINOv3, que se rige por su propia licencia.

No se dispone de información sobre arquitectura interna de las políticas, número de parámetros, longitud de contexto ni idiomas soportados en la información proporcionada. La model card se limita a describir el contenido del repositorio y el procedimiento de preparación de recursos mediante los comandos `serve.py behavior prepare --adapter` y `serve.py robotwin prepare --sam`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (políticas de robótica; incluye codificador visual DINOv3 embebido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el empaquetado no aplica cuantización ni cambios numéricos según la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos de inferencia A²-WLA); DINOv3 bajo su propia licencia; términos de terceros vigentes |
| Formato de pesos | safetensors (checkpoints restaurados y verificados por SHA-256); almacén BEHAVIOR comprimido |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de las políticas (transformer, MoE, SSM u otra), ni el volumen o composición de los datos de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. Lo que sí se detalla es la estructura del paquete: un almacén comprimido de inferencia BEHAVIOR con 25 políticas, configuraciones de política, procesadores y estadísticas de normalización específicas por política, un fichero `routing.json` que enruta 100 tareas con N=2, un checkpoint de inferencia RoboTwin con su configuración y procesadores, y pesos del adaptador BEHAVIOR con configuración de doce tareas.

El paquete incluye un codificador visual DINOv3 embebido y un tokenizador compartido con ficheros de procesamiento de imagen bajo `assets/rynnbrain/`. Un `resource-manifest.json` publica tamaños de fichero, valores SHA-256 e identidades de checkpoint restauradas, lo que permite verificar la integridad de la reconstrucción. La preparación se realiza con revisiones fijadas (pinned revisions) que pueblan el directorio `resources/` del checkout de A2MEAS; SAM y el juez del adaptador se descargan por separado desde sus repositorios oficiales, y los datasets BEHAVIOR y su clave de descifrado deben obtenerse mediante el flujo oficial autorizado.

## Capacidades

- Inferencia de políticas robóticas para el entorno BEHAVIOR: 25 políticas distintas empaquetadas en un único almacén comprimido.
- Enrutado de tareas: `behavior/routing.json` cubre 100 tareas con N=2.
- Inferencia en RoboTwin: checkpoint, configuración y procesadores listos para carga directa de safetensors.
- Adaptación BEHAVIOR: pesos del adaptador y configuración para doce tareas.
- Procesamiento visual: codificador DINOv3 embebido y ficheros de procesamiento de imagen compartidos.
- Tokenización: tokenizador compartido bajo `assets/rynnbrain/`.
- Verificación de integridad: restauración de checkpoints estándar con comprobación de SHA-256.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes multi-paso ni multilingüismo en la información disponible.

## Casos de uso

- Reproducción de la evaluación A2MEAS: el paquete permite reconstruir los checkpoints de referencia y verificar sus SHA-256, de modo que los resultados de evaluación publicados pueden replicarse sin reentrenar las políticas.
- Evaluación de políticas en BEHAVIOR: las 25 políticas empaquetadas y el enrutado de 100 tareas con N=2 permiten lanzar barridos de evaluación sobre el conjunto de tareas definido por el autor.
- Investigación en agentes encarnados: el adaptador BEHAVIOR con configuración de doce tareas sirve como punto de partida para estudiar transferencia entre tareas dentro del mismo entorno.
- Benchmarking en RoboTwin: el checkpoint de inferencia con configuración y procesadores permite ejecutar políticas en el simulador RoboTwin con carga directa de safetensors.
- Integración en pipelines de investigación con entornos aislados: los comandos `serve.py behavior prepare --adapter` y `serve.py robotwin prepare --sam` pueblan `resources/` con revisiones fijadas, lo que encaja en flujos reproducibles de CI para experimentos de robótica.
- Auditoría de artefactos: el `resource-manifest.json` con tamaños y hashes SHA-256 facilita la verificación de procedencia y la detección de corrupción en descargas de 168,5 GB.
- Estudio comparativo de codificadores visuales: al incluir DINOv3 embebido, el paquete permite analizar el comportamiento de las políticas con ese codificador bajo los términos de su licencia específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 168,5 GB en disco, pero la model card no desglosa la huella de cada política ni la memoria necesaria en tiempo de ejecución.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no puede determinarse sin conocer el tamaño por política y el presupuesto de memoria.
- Opciones de despliegue: el flujo documentado es el del checkout de A2MEAS mediante `runtime/model/bin/python serve.py behavior prepare --adapter` y `runtime/model/bin/python serve.py robotwin prepare --sam`, con revisiones fijadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: se requieren al menos 168,5 GB para el repositorio, más el espacio de los checkpoints restaurados en `resources/` y los activos del simulador preparados por `setup.sh`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de robótica o paquetes de inferencia para agentes encarnados) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento verbal ni tool calling; su ámbito es la inferencia de políticas robóticas.
- Dependencia de recursos externos: SAM, el juez del adaptador, los datasets BEHAVIOR y su clave de descifrado se obtienen por separado mediante flujos oficiales autorizados; sin ellos el paquete no es funcional por sí solo.
- Restricciones de licencia: los pesos de inferencia de A²-WLA son Apache-2.0, pero el codificador DINOv3 embebido se rige por la DINOv3 License y los componentes de terceros mantienen sus términos, lo que puede condicionar el uso comercial.
- Verificación obligatoria: la evaluación descarga y restaura checkpoints comprobando SHA-256; alterar los ficheros o el manifiesto rompe el flujo previsto.
- Trazabilidad limitada: no se documentan arquitectura, parámetros, datos de entrenamiento ni sesgos, lo que dificulta evaluar riesgos de alucinación o comportamiento fuera de distribución en las políticas.
- Idiomas: no disponible; no se declara soporte multilingüe.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.
- Tamaño de descarga: 168,5 GB más los checkpoints restaurados exigen planificación de almacenamiento y ancho de banda considerables.

## Enlaces

- HuggingFace: https://huggingface.co/shibohuang/policy-weights
- Paper de referencia citado en la model card: *Toward the Era of Agentic Embodied Intelligence* (no se proporciona URL en la información disponible)
- Licencia DINOv3 incluida en el repositorio: `licenses/dinov3.md`
- Manifiesto de recursos: `resource-manifest.json` (dentro del repositorio)
- Código de evaluación A2MEAS: no se proporciona URL en la información disponible
