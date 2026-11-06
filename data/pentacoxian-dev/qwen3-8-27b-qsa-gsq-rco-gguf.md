# pentacoxian-dev/Qwen3.8-27B-QSA-GSQ-RCO-GGUF

## Resumen

Qwen3.8-27B-QSA-GSQ-RCO-GGUF es un paquete de pesos cuantizados en formato GGUF publicado por el usuario pentacoxian-dev, derivado del modelo base Qwen/Qwen3.8-27B de Alibaba Qwen. No se trata de un modelo entrenado desde cero, sino de una composicion de artefactos ya existentes: los pesos cuantizados IQ3_S de ISTA-DASLab, los indexers de Qwen Sparse Attention (QSA) de higa2515 y un proyector de vision del mismo autor, todo empaquetado para su uso con un motor de inferencia modificado.

La propuesta central es ejecutar un modelo de clase 27B con ventana de contexto de 262K tokens y capacidades de vision en una unica GPU de 24 GB, algo que el llama.cpp estandar no permite con los pesos QSA. El autor mantiene un fork propio del motor (pentaCoxian/Qwen-QSA-llama.cpp) que es requisito indispensable para cargar estos ficheros.

El repositorio incluye tres artefactos: el modelo principal con cabeza MTP e indexers QSA (12,3 GB, IQ3_S), un drafter DFlash2 para decodificacion especulativa (1,0 GB, IQ4_XS) y el proyector de vision (0,9 GB, F16). La licencia es Apache-2.0, heredada de todos los modelos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Qwen Sparse Attention (QSA) y cabeza MTP; decodificacion especulativa DFlash2 |
| Parametros totales | 1.924.404.480 (dato reportado en safetensors del modelo base referenciado; en conflicto con la denominacion "27B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | IQ3_S (modelo principal), IQ4_XS (drafter), F16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), compatible con el fork Qwen-QSA-llama.cpp |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de la familia Qwen3. Sobre el se aplica Qwen Sparse Attention (QSA), un mecanismo de atencion dispersa que anade 80 tensores de indexers en F32 para seleccionar que bloques de atencion computar, permitiendo sostener contextos de 262K tokens con un coste de memoria y computo reducido. Los pesos principales conservan la cabeza MTP (multi-token prediction), que habilita decodificacion especulativa.

El proceso de construccion esta documentado de forma transparente: los 866 tensores del modelo principal son byte-identicos al fichero IQ3_S de ISTA-DASLab, y los 80 indexers QSA son byte-identicos a los del GGUF Q8_0 publicado por higa2515. El drafter DFlash2 de z-lab se recuantizo a IQ4_XS con `llama-quantize` sin imatrix. El proyector de vision se copia sin modificar. No hay entrenamiento ni ajuste adicional por parte del publicador; el valor anadido es la integracion de piezas dispersas en un paquete coherente y reproducible (con SHA256SUMS).

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262K tokens.
- Razonamiento de largo alcance sobre documentos extensos (recall de hechos simples 24/24 y de dos saltos 11/16 en las pruebas del autor).
- Vision: procesamiento de imagenes mediante el proyector mmproj, con 14/14 en la prueba de imagen seguida de 255K tokens de contexto.
- Decodificacion especulativa mediante drafter DFlash2, con velocidad de decodificacion codiciosa de 118 tok/s (media armonica de 4 tareas).
- Cabeza MTP integrada en el modelo principal.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 262K tokens de contexto se puede cargar un arbol de codigo extenso y hacer preguntas transversales sobre arquitectura, dependencias o deuda tecnica sin trocear el contenido.
- Procesamiento de documentacion legal o contractual: introducir contratos o expedientes de cientos de miles de tokens y extraer clausulas, obligaciones o contradicciones en una sola pasada, aprovechando el recall de dos saltos medido (11/16).
- Inspeccion de imagenes tecnicas con contexto textual largo: diagramas de arquitectura, capturas de paneles o planos acompanados de 255K tokens de especificaciones, dado el resultado 14/14 en la prueba de vision del autor.
- Asistente de investigacion sobre corpus cientifico: cargar decenas de papers y sintetizar metodologias, resultados y discrepancias manteniendo la ventana completa.
- Despliegue en estacion de trabajo con una sola RTX 4090: el paquete esta disenado para 24 GB de VRAM, lo que permite inferencia local a 262K de contexto sin infraestructura multigpu (pico medido de 22,94 GiB).
- Servicio de chat de baja latencia en una unica GPU: 118 tok/s de decodificacion codiciosa y 2.377 tok/s de prefill en frio permiten atender conversaciones interactivas con contexto ya precargado.
- Evaluacion comparativa de tecnicas de atencion dispersa: util como banco de pruebas reproducible para investigadores que quieran medir QSA frente a atencion densa con pesos identicos.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 4090 con contexto de 262K y 255K tokens de entrada:

| Metrica | Resultado |
|---|---|
| Decodificacion codiciosa (media armonica de 4 tareas) | 118,0 tok/s |
| Prefill en frio | 2.377 tok/s (107 s) |
| VRAM pico | 22,94 GiB |
| Recall de hechos, un salto | 24/24 |
| Recall de hechos, dos saltos | 11/16 |
| Vision (imagen + 255K tokens antes de la pregunta) | 14/14 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor remite al README del motor para velocidades con muestreo, resultados por tarea y limites.

## Requisitos de hardware

- VRAM estimada: 22,94 GiB en pico segun medicion del autor a 262K de contexto; el conjunto de ficheros suma unos 14,2 GB en disco.
- GPU recomendada: RTX 4090 de 24 GB (unica configuracion validada en la model card). Cualquier GPU con 24 GB o mas deberia ser candidata, pero no se confirma.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB). En GPUs de 16 GB o menos no hay margen segun los datos disponibles.
- Motor de despliegue: exclusivamente el fork pentaCoxian/Qwen-QSA-llama.cpp. El llama.cpp estandar no puede cargar los pesos QSA.
- vLLM, TGI, Ollama: no disponible; no se mencionan como compatibles.
- Throughput: 118 tok/s de decodificacion y 2.377 tok/s de prefill en frio (RTX 4090, 262K de contexto).
- Procedimiento: descarga con `hf download` y ejecucion de `deploy/qsa27b-24gb/serve.sh` desde un checkout compilado del motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Motor | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-GSQ-RCO (este) | no confirmado (repo base: 1,92B reportados) | 262K | Si | Apache-2.0 | Fork QSA de llama.cpp | GGUF, 0 descargas |
| Qwen/Qwen3.8-27B | 27B (nominal) | no disponible | no disponible | Apache-2.0 | Estandar | Pesos originales en HF |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | mismos pesos | no disponible | No (sin proyector) | Apache-2.0 | llama.cpp estandar | GGUF |
| higa2515/Qwen3.8-27B-QSA-GGUF | mismos pesos | 262K | Si | Apache-2.0 | Fork QSA de llama.cpp | GGUF (Q8_0) |

La diferencia practica frente a las alternativas es la combinacion de cuantizacion IQ3_S con indexers QSA y vision en un solo paquete, lo que reduce el requisito de VRAM frente al Q8_0 de higa2515. Frente al original de Qwen, anade atencion dispersa y decodificacion especulativa a costa de depender de un motor no estandar.

## Limitaciones y advertencias

- Dependencia critica de un fork: los pesos no cargan en llama.cpp oficial. Cualquier actualizacion del upstream puede romper la compatibilidad.
- Discrepancia de tamano: la ficha declara 1.924.404.480 parametros mientras el nombre del modelo indica 27B. Conviene verificar el conteo real antes de planificar recursos.
- Recall de dos saltos limitado: 11/16 frente a 24/24 en un salto; el razonamiento multi-salto sobre contexto muy largo no es fiable al 100 %.
- Cuantizacion agresiva (IQ3_S): degradacion esperada frente a BF16 en tareas de precision, no cuantificada en la informacion disponible.
- El drafter se recuantizo sin imatrix, lo que puede reducir la tasa de aceptacion de la decodificacion especulativa.
- Proyecto de un unico autor, 0 descargas y 1 like en el momento de la consulta: sin validacion independiente de los resultados publicados.
- Idiomas soportados no declarados; el comportamiento multilingue hereda del modelo base pero no esta documentado aqui.
- Licencia Apache-2.0 permite uso comercial, pero las licencias de los artefactos derivados deben revisarse individualmente en cada repositorio fuente.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pentacoxian-dev/Qwen3.8-27B-QSA-GSQ-RCO-GGUF
- Motor requerido: https://github.com/pentaCoxian/Qwen-QSA-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos cuantizados de origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Conversion QSA, indexers y proyector de vision: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
