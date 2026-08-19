# adrianmurray/Qwen3.8-27B-Hybrid-Q8Q4

## Resumen

El modelo `adrianmurray/Qwen3.8-27B-Hybrid-Q8Q4` es una cuantización mixta en formato MLX del checkpoint oficial `Qwen/Qwen3.8-27B` de Alibaba Cloud, diseñada específicamente para ejecución local en Apple Silicon. El autor, adrianmurray, ha aplicado una estrategia de cuantización híbrida que asigna 8 bits a las proyecciones de atención completa y a la cabeza de salida, y 4 bits a las capas MLP y a las proyecciones de atención lineal, logrando una densidad efectiva de aproximadamente 5,48 bits por peso. El resultado es un artefacto de unos 17,2 GB residentes que permite ejecutar un modelo de 27 mil millones de parámetros en hardware de consumo de Apple.

El modelo base Qwen3.8-27B es un transformer denso híbrido con atención lineal en 48 de sus 64 capas, una torre de visión integrada y un cabezal de draft MTP (Multi-Token Prediction) nativo. Dispone de una ventana de contexto nativa de 262 000 tokens, extensible a 1 000 000, y está orientado a tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Esta cuantización se distribuye bajo licencia Apache 2.0 y está pensada para usarse junto con el runtime Qwen Prime en macOS, que aprovecha el draft MTP para acelerar la generación.

La relevancia de este artefacto radica en que permite ejecutar un modelo de 27B con capacidades multimodales y de razonamiento en un Mac con memoria unificada, algo que normalmente requeriría una GPU dedicada de alta gama. La cuantización mixta Q8/Q4 equilibra calidad y rendimiento, y las mediciones publicadas muestran una velocidad de generación de 33,85 tokens por segundo en un Apple M4 Max con una tasa de aceptación de draft del 59,1 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido con atencion lineal (48/64 capas) + torre de vision + MTP draft head |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | Mixta Q8/Q4: 8-bit affine (group size 64) para atencion completa Q/K/V/O y LM head; 4-bit affine (group size 64) para MLP y proyecciones de atencion lineal; embeddings y layer norms en Float16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX SafeTensors (4 shards) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.8-27B de Alibaba Cloud, un transformer denso de 27B parametros con un diseño hibrido: 48 de sus 64 capas utilizan atencion lineal (linear attention) para reducir el coste computacional en contextos largos, mientras que las 16 restantes emplean atencion completa (full attention). El modelo incluye ademas una torre de vision que le permite procesar imagenes, y un cabezal de draft MTP integrado que predice multiples tokens por paso, lo que acelera la decodificacion especulativa.

La cuantizacion aplicada por adrianmurray mantiene la arquitectura interna identificada como `qwen3_5` (nombre de compatibilidad en Transformers/MLX) y asigna precisiones distintas segun la sensibilidad de cada modulo: las proyecciones de atencion completa y la cabeza de salida se cuantizan a 8 bits con grupo de 64, mientras que las capas MLP y las proyecciones de atencion lineal se reducen a 4 bits con el mismo grupo. Las embeddings y las capas de normalizacion se mantienen en Float16 para preservar la estabilidad numerica. El proceso de conversion se documento en `quantization_provenance.json` y los checksums SHA256 estan disponibles para verificar la integridad.

No se dispone de informacion detallada sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) en las fuentes consultadas. La cuantizacion no altera los pesos semanticos, solo su representacion numerica.

## Capacidades

- Generacion de texto y razonamiento configurable: el modelo base admite modos de razonamiento activable o desactivable segun la tarea.
- Codificacion de software: esta optimizado para tareas de programacion, generacion de codigo y depuracion.
- Vision artificial: al incluir una torre de vision, puede procesar imagenes y responder preguntas sobre su contenido.
- Flujos de trabajo agénticos: soporta tareas de largo horizonte con multiples pasos, lo que lo hace apto para agentes autonomos.
- Automatizacion de oficina: puede generar documentos, resumir informacion y manejar tareas administrativas.
- Multilingue: soporta ingles y chino, con capacidad de comprension y generacion en ambos idiomas.
- Decodificacion especulativa: gracias al cabezal MTP integrado, puede acelerar la generacion cuando se combina con un draft model compatible (como el `Qwen3.8-27B-MTP-MLX-6bit`).

## Casos de uso

- Asistente de programacion local en macOS: un desarrollador puede ejecutar el modelo en su MacBook Pro con chip M4 Max y obtener sugerencias de codigo en tiempo real, con una velocidad de 33,85 tokens por segundo, sin depender de servicios en la nube.
- Automatizacion de tareas de oficina: el modelo puede generar borradores de correos, resumir actas de reuniones o crear presentaciones a partir de notas, aprovechando su ventana de contexto de 262K tokens para manejar documentos extensos.
- Analisis de imagenes y documentos escaneados: al ser multimodal, puede extraer informacion de capturas de pantalla, diagramas o fotografias, y combinarla con texto para responder preguntas complejas.
- Agente autonomo de investigacion: con su capacidad de razonamiento y su contexto largo, puede navegar por multiples fuentes, sintetizar informacion y producir informes detallados en un solo flujo.
- Traduccion y transcripcion entre ingles y chino: el modelo soporta ambos idiomas y puede utilizarse para traducir documentos tecnicos o conversaciones.
- Prototipado rapido de aplicaciones con Qwen Prime: los desarrolladores pueden integrar este artefacto en el runtime Qwen Prime para construir asistentes conversacionales con capacidades de vision y razonamiento, ejecutandose completamente en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona una medicion de rendimiento de inferencia en un Apple M4 Max con el runtime Qwen Prime 1.1.1, que se detalla a continuacion.

| Prueba | Resultado |
|---|---|
| Velocidad de generacion (M4 Max, Qwen Prime 1.1.1) | 33,85 tokens por segundo |
| Tasa de aceptacion del draft (MTP) | 59,1 % |
| Tarea de prueba | Programa Swift 6 con ordenacion, eliminacion de duplicados y entrada vacia (88 tokens generados) |
| Comparacion con cuantizacion uniforme 6-bit | 21,34 tokens por segundo (misma tarea, sin draft) |

Estos valores son mediciones puntuales de una sola maquina y no constituyen una garantia de rendimiento. La velocidad real depende del hardware, la longitud del prompt, el estado de la cache, la longitud de generacion y la tasa de aceptacion del draft.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (chips M1, M2, M3, M4 y posteriores) debido al formato MLX.
- Memoria unificada: el modelo ocupa aproximadamente 17,2 GB en RAM, por lo que se recomienda un minimo de 24 GB de memoria unificada; para margen adicional con el sistema operativo y otras aplicaciones, se recomienda 32 GB o mas.
- GPU integrada: aprovecha la GPU integrada del chip Apple Silicon; no requiere GPU discreta.
- Almacenamiento: el repositorio pesa 18,5 GB, por lo que se necesita espacio libre en disco.
- Opciones de despliegue: MLX (libreria nativa), Qwen Prime Runtime (aplicacion macOS con interfaz de servidor) y cualquier framework compatible con MLX.
- Rendimiento observado: 33,85 tokens por segundo en un M4 Max con draft MTP activado; sin draft, el rendimiento baja significativamente (21,34 tokens por segundo en la misma maquina).

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos de la misma categoria en la informacion proporcionada. La unica referencia es el modelo base original `Qwen/Qwen3.8-27B` en su version sin cuantizar (BF16), que requiere aproximadamente 54 GB de memoria y no es viable en hardware de consumo. La cuantizacion uniforme 6-bit del mismo autor (`Qwen3.8-27B-MTP-MLX-6bit`) ofrece un rendimiento inferior (21,34 tokens por segundo) pero con una calidad potencialmente mayor al tener menos perdida de precision. No se han encontrado comparativas con otros modelos de 27B como Llama 3.1 27B o Mistral Large en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo derivado de Qwen3.8-27B, puede heredar sesgos presentes en sus datos de entrenamiento y generar contenido inexacto o inventado, especialmente en tareas de razonamiento complejo.
- Idiomas limitados: solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Ventana de contexto: aunque la ventana nativa es de 262K tokens, el rendimiento puede degradarse en contextos muy largos debido a limitaciones de memoria y atencion.
- Dependencia de hardware Apple: el formato MLX no es compatible con GPUs NVIDIA o AMD, lo que limita su uso a ecosistema macOS.
- Cuantizacion agresiva en MLP: las capas MLP cuantizadas a 4 bits pueden introducir perdida de precision en tareas que requieren alta fidelidad numerica, como calculos cientificos.
- Artefacto independiente: no esta afiliado ni respaldado por Alibaba Cloud ni por el equipo Qwen; el autor es un tercero y la cuantizacion no ha sido validada oficialmente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no concede derechos de marca; el nombre "Qwen" y "Alibaba Cloud" son marcas registradas.
- Sin garantias de rendimiento: las mediciones publicadas son de una sola maquina y no representan un compromiso de velocidad en otros equipos.

## Enlaces

- Modelo cuantizado: https://huggingface.co/adrianmurray/Qwen3.8-27B-Hybrid-Q8Q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Draft model complementario: https://huggingface.co/adrianmurray/Qwen3.8-27B-MTP-MLX-6bit
- Runtime Qwen Prime: https://github.com/adriancmurray/QwenPrime/releases/latest
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
