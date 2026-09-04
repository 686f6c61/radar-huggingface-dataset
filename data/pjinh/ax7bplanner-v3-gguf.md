# PJiNH/ax7bplanner-v3-GGUF

## Resumen

PJiNH/ax7bplanner-v3-GGUF es un modelo de lenguaje especializado en la conversión de instrucciones en lenguaje natural de Excel a JSON de plan de ejecución. Ha sido desarrollado por el usuario PJiNH y está pensado para integrarse en el asistente de oficina Office-Claw (김대리), donde actúa como módulo planificador (`planner_model`). El modelo es un fine-tune del modelo base A.X-4.0-Light, aunque no se proporcionan detalles sobre la arquitectura subyacente.

Su propósito es resolver un problema muy concreto: traducir órdenes expresadas en lenguaje natural, como "calcula el total de la columna B y aplica formato de moneda", a una estructura JSON que pueda ser interpretada y ejecutada por un sistema automatizado. No está diseñado para conversación general, sino para ser usado exclusivamente como componente de planificación dentro de un flujo de automatización de Excel. El modelo se distribuye en formato GGUF, con un tamaño de repositorio de 4.4 GB y un total de 7.259.624.960 parámetros, lo que sugiere una cuantización de 4 bits. Está pensado para desplegarse fácilmente mediante Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.259.624.960 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos GGUF, pero no se detallan las cuantizaciones) |
| Idiomas soportados | no disponible (la etiqueta del modelo indica 'korean', pero no se especifica oficialmente) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo en la documentación proporcionada. Según la model card, el modelo es un fine-tune de A.X-4.0-Light, pero no se especifica si se trata de un transformer, un modelo de mezcla de expertos (MoE), un SSM o una arquitectura híbrida. Tampoco se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La única información disponible es que el modelo ha sido ajustado exclusivamente para convertir comandos de Excel en lenguaje natural a JSON de plan de ejecución.

## Capacidades

- Conversión de instrucciones en lenguaje natural de Excel a JSON de plan de ejecución.
- Especialización exclusiva en la generación de planes para comandos de Excel; no está diseñado para conversación general.
- Integración con Ollama mediante los comandos `ollama pull` y `ollama cp`.
- Etiquetado con los tags "excel" y "korean", lo que sugiere un uso orientado a entornos de oficina en coreano.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio u otras capacidades adicionales.

## Casos de uso

- Automatización de informes en Excel: el modelo puede convertir una orden en lenguaje natural, como "resume las ventas por trimestre en una nueva hoja", en un JSON de plan de ejecución que un sistema posterior interpreta para realizar las operaciones sobre el libro de trabajo.
- Integración en asistentes de oficina: dentro de Office-Claw, el modelo actúa como planificador, traduciendo la petición del usuario a una secuencia estructurada de comandos que luego se ejecutan sobre Excel.
- Generación de scripts de automatización: el JSON de plan de ejecución puede ser consumido por un intérprete que genere código VBA o Python (por ejemplo, con openpyxl) para llevar a cabo las tareas solicitadas.
- Procesamiento de datos financieros en coreano: gracias a su etiqueta "korean", puede emplearse en entornos donde las instrucciones se formulan en coreano para automatizar la preparación de datos en Excel.
- Despliegue local con Ollama: al ser un modelo GGUF, puede ejecutarse en infraestructura propia mediante Ollama, sin depender de APIs externas, lo que resulta adecuado para entornos con requisitos de privacidad.
- Flujos de trabajo en pipelines de datos: el modelo puede invocarse como paso intermedio para convertir órdenes de negocio en instrucciones estructuradas que luego se aplican a archivos Excel dentro de un proceso automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware en la documentación proporcionada.
- El tamaño del repositorio de 4.4 GB, para un modelo de 7.259.624.960 parámetros, sugiere una cuantización de 4 bits (probablemente Q4_K_M o similar).
- Se estima que una GPU con 6-8 GB de VRAM podría ser suficiente para una inferencia razonable con cuantización de 4 bits, aunque no hay confirmación oficial.
- En CPU, se necesitaría al menos 8-16 GB de RAM para cargar el modelo, con una velocidad de inferencia significativamente menor.
- Al ser un modelo GGUF, es compatible con motores de inferencia como llama.cpp y Ollama. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es un fine-tune especializado de A.X-4.0-Light, del que no se han encontrado especificaciones ni comparativas. No se puede establecer una comparación fiable con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- No apto para conversación general; su uso debe limitarse a la planificación de comandos de Excel.
- Especializado únicamente en la generación de JSON de plan de ejecución, por lo que no puede realizar tareas fuera de ese ámbito.
- La documentación está en coreano, lo que puede dificultar su adopción fuera de ese idioma.
- No se han publicado benchmarks ni evaluaciones de rendimiento, por lo que se desconoce su calidad relativa.
- No se especifica la arquitectura, la longitud de contexto ni el proceso de entrenamiento.
- La fecha de creación indicada en HuggingFace es 2026-09-04, lo que resulta inusual y podría tratarse de un error de metadata o de un proyecto experimental.
- El modelo base A.X-4.0-Light no está documentado en la información disponible; habría que verificar su licencia y posibles restricciones de uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/PJiNH/ax7bplanner-v3-GGUF
- No se han encontrado enlaces adicionales relevantes en la búsqueda web.
