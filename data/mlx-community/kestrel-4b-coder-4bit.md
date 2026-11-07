# mlx-community/Kestrel-4B-Coder-4bit

## Resumen

Kestrel-4B-Coder-4bit es la variante cuantizada a 4 bits en formato MLX del modelo Kestrel-4B-Coder, un ajuste fino (fine-tune) del modelo base Qwen3.5-4B orientado a generacion de codigo, razonamiento compacto y uso de herramientas en entornos locales. El modelo original fue desarrollado por Jackrong y esta disponible como checkpoint fusionado (merged) en Hugging Face; esta version la publica la comunidad mlx-community para su ejecucion nativa en Apple Silicon mediante el framework MLX.

El modelo parte de la familia Qwen3.5 (arquitectura qwen3_5, multimodal image-text-to-text) y conserva los pesos MTP/NextN para decodificacion especulativa, ademas de los componentes de vision heredados del modelo base. Con aproximadamente 4.539 millones de parametros y una ventana de contexto no especificada en la informacion disponible, su propuesta de valor es ofrecer capacidades de agente de codigo en hardware de consumo, con un bucle de trabajo basado en leer, razonar, invocar herramientas, editar y probar.

La relevancia actual radica en su enfoque de "inteligencia util cerca del dispositivo": razonamiento compacto para reducir tokens generados, soporte de tool calling y function calling, y un corpus de entrenamiento de unas 150.000 muestras de codigo y razonamiento destiladas de modelos mayores. Esta variante de 4 bits reduce el peso del repositorio a aproximadamente 3,1 GB, lo que facilita su despliegue en equipos con memoria unificada limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (esta variante MLX); el modelo original ofrece Q8_0 GGUF y existe una variante MLX de 8 bits |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF disponible en la version original |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5 de Qwen, un transformer multimodal que procesa texto e imagenes (pipeline image-text-to-text). El checkpoint fusionado conserva los pesos MTP/NextN (multi-token prediction) para decodificacion especulativa y los componentes de vision heredados del modelo base. El tokenizer y la plantilla de chat provienen del adaptador de la release original y deben usarse para interacciones de chat y herramientas.

El entrenamiento partio de unsloth/Qwen3.5-4B y consistio en un ajuste fino supervisado (SFT) con destilacion sobre un corpus de aproximadamente 150.000 ejemplos de codigo y razonamiento complejo. El corpus se compone de unas 40.000 muestras de interaccion de agente y uso de herramientas destiladas de Qwen3.8-27B (llamadas multi-turno, seguimiento de estado del entorno, autocorreccion y reflexion), ejemplos densos de algoritmos y generacion de codigo destilados de Qwen3.8-Flash-Next y Qwen3.8-Max, y ejemplos seleccionados de la familia nvidia/Nemotron para razonamiento logico y seguimiento estricto de instrucciones. El control de calidad incluyo validacion sintactica basada en AST, deduplicacion, limpieza y filtros de ejecucion en sandbox. No se especifica el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de codigo: implementacion de algoritmos, refactorizacion, manejo de casos limite y sintaxis rigurosa.
- Razonamiento compacto ("thinking" acotado): el modelo esta disenado para gastar el presupuesto de razonamiento en la siguiente accion util, reduciendo generacion innecesaria.
- Uso de herramientas y function calling: soporte de llamadas multi-turno, seguimiento del estado del entorno y autocorreccion sobre la retroalimentacion de las herramientas.
- Comportamiento de agente: bucle de leer, razonar, invocar herramientas, editar y probar, con reflexion sobre los limites de la tarea y de las herramientas.
- Multimodalidad: capacidad de vision heredada del modelo base (procesamiento de imagenes junto con texto).
- Decodificacion especulativa: pesos MTP/NextN incluidos para acelerar la inferencia.
- Multilingue: soporte declarado de ingles, chino, coreano, japones, ruso y espanol.
- Razonamiento logico y seguimiento estricto de instrucciones, reforzado con ejemplos de Nemotron.

## Casos de uso

- Asistente de codigo local en Apple Silicon: la variante MLX de 4 bits permite ejecutar el modelo en Macs con memoria unificada mediante MLX, ofreciendo autocompletado y generacion de codigo sin depender de inferencia remota.
- Agente de refactorizacion en el editor: gracias al soporte de tool calling y al bucle editar-probar, el modelo puede integrarse en un IDE para aplicar cambios, ejecutar tests y corregir errores de forma iterativa.
- Automatizacion de tareas de CI/CD: el modelo puede invocar herramientas para leer logs, proponer parches y verificar resultados en pipelines, aprovechando su entrenamiento en interaccion con entornos.
- Generacion de tests unitarios: su enfasis en casos limite y validacion sintactica lo hace adecuado para producir suites de pruebas a partir de funciones existentes.
- Analisis de capturas y diagramas: al conservar la capacidad de vision, puede interpretar imagenes de interfaces o diagramas de arquitectura y generar codigo asociado.
- Prototipado rapido en dispositivos con recursos limitados: con un peso de repositorio de aproximadamente 3,1 GB en 4 bits, es viable en equipos de consumo para tareas de generacion de codigo y razonamiento acotado.
- Soporte multilingue de documentacion tecnica: puede generar explicaciones y comentarios de codigo en ingles, chino, coreano, japones, ruso y espanol.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden al modelo original en Q8_0 GGUF con llama.cpp CUDA, decodificacion especulativa MTP (longitud maxima de borrador 2), temperatura 0,2 y top-p 0,95, sobre 164 tareas de programacion con cinco muestras por tarea (820 generaciones por modelo). No se han publicado resultados especificos para esta variante MLX de 4 bits en la informacion disponible.

| Metrica | Kestrel-4B-Coder | Qwen3.5-4B | Qwopus3.5-9B-Coder-Flash | Qwen3.5-9B |
|---|---|---|---|---|
| HumanEval Pass@1 | 83,66% | 72,56% | 91,83% | 85,24% |
| HumanEval Pass@5 | 94,51% | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio de esta variante de 4 bits ocupa aproximadamente 3,1 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, mas overhead de ejecucion.
- GPU recomendadas: no se especifican en la informacion disponible; esta variante esta pensada para Apple Silicon mediante MLX.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no se detallan modelos concretos.
- Opciones de despliegue: MLX para esta variante; llama.cpp y GGUF para la version original; LM Studio se menciona como entorno usado en las pruebas del autor; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles de forma cuantificada; el autor indica que las pruebas de agente se realizaron en Apple Silicon con LM Studio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval Pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kestrel-4B-Coder (esta variante, 4 bits MLX) | 4,54 mil millones | no disponible | 83,66% (Q8_0 GGUF, modelo original) | apache-2.0 | Hugging Face (mlx-community) |
| Qwen3.5-4B (modelo base) | no disponible | no disponible | 72,56% | no disponible | Hugging Face (Qwen) |
| Qwopus3.5-9B-Coder-Flash | 9 mil millones (aproximado) | no disponible | 91,83% | no disponible | Hugging Face |
| Qwen3.5-9B | 9 mil millones (aproximado) | no disponible | 85,24% | no disponible | Hugging Face |

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al modelo original en Q8_0 GGUF; la cuantizacion a 4 bits de esta variante puede degradar la calidad respecto a los numeros reportados.
- Riesgo de alucinacion inherente a los modelos de lenguaje compactos, especialmente en tareas de codigo complejas o APIs poco comunes; se recomienda validar el codigo generado con tests.
- La longitud de contexto no esta documentada en la informacion disponible, lo que limita la planificacion de casos de uso con ventanas largas.
- El soporte multilingue declarado incluye seis idiomas, pero no se aportan metricas de calidad por idioma; el espanol figura en la lista sin evaluacion especifica.
- La licencia apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-4B y de los datos de destilacion.
- El rendimiento en hardware distinto de Apple Silicon no esta validado para esta variante MLX; las pruebas del autor se limitan a Apple Silicon con LM Studio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria amplia.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/mlx-community/Kestrel-4B-Coder-4bit
- Variante MLX de 8 bits: https://huggingface.co/mlx-community/Kestrel-4B-Coder-8bit
- Modelo original fusionado: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- Version GGUF con pesos MTP: https://huggingface.co/Jackrong/Kestrel-4B-Coder-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Version Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Framework Unsloth en GitHub: https://github.com/unslothai/unsloth
- Colaborador (X): https://x.com/KyleHessling1
