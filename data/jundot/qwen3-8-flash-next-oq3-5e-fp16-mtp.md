# Jundot/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp es una cuantizacion mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, un preestreno experimental de la arquitectura que hay detras de Qwen4. El modelo base es un mixture-of-experts (MoE) multimodal de tipo vision-lenguaje con 125B parametros en el backbone y 6B activados por token, al que se suman una tabla de embeddings n-gram de 51B parametros y un modulo de prediccion multi-token (MTP) de 4B. El checkpoint completo almacena 180.000 millones de pesos logicos.

El trabajo de cuantizacion lo firma Jundot mediante la herramienta oQ (oMLX v0.8.0), que asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y un reajuste ponderado de escala y sesgo por minimos cuadrados. El resultado es un checkpoint de precision mixta con 4,006 bits/peso efectivos en el backbone y 4,366 bits/peso en el conjunto, guardado en safetensors y pensado para ejecutarse con MLX en hardware Apple Silicon.

La relevancia ahora es doble: por un lado permite probar en equipos de consumo una arquitectura MoE vision-lenguaje de gran tamano que de otro modo requeriria infraestructura de datacenter; por otro, conserva el codificador visual en FP32 y el modulo MTP, de modo que no se pierden las capacidades multimodales ni la decodificacion especulativa del original. La licencia es Qwen Community License 1.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-lenguaje con Gated DeltaNet + Qwen Sparse Attention (QSA), flujos residuales con compuertas (Gated Residual) y modulo MTP |
| Parametros totales | 180.000.000.000 (125,744B backbone + 51,2B embeddings n-gram + 0,449B codificador visual + 2,607B cabeza MTP) |
| Parametros activos | 6B en el backbone (aproximadamente, segun la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla affine 3/4/6/8 bits con grupos 64 y 128, n-gram a 4 bits grupo 32, FP16 y FP32; 4,006 bits/peso efectivos en backbone y 4,366 en total |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other, license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (MLX), 98,3 GB de repositorio, 91,491 GiB de almacenamiento efectivo |

## Arquitectura y entrenamiento

El modelo base combina atencion lineal Gated DeltaNet con Qwen Sparse Attention (QSA) y flujos residuales con compuertas, una variante hibrida que busca reducir el coste de atencion en contextos largos manteniendo capacidad de recuperacion exacta. La parte MoE activa 6B de los 125B parametros del backbone por token, lo que separa capacidad de almacenamiento y coste de computo. Ademas del transformer, el checkpoint incluye un codificador visual de 0,449B parametros en FP32, una tabla de embeddings n-gram de 51,2B parametros y una cabeza de prediccion multi-token de 2,607B, que habilita decodificacion especulativa entrenada de forma nativa.

Sobre los datos de entrenamiento (numero de tokens, composicion del dataset, etapas de RLHF o DPO) no hay informacion en la documentacion disponible; la model card del autor solo describe el proceso de cuantizacion, no el preentrenamiento. La innovacion tecnica destacable de esta ficha es el esquema oQ3.5e: asignacion de bits por sensibilidad de capa medida, redondeo con matriz de importancia y reajuste de escala y sesgo por minimos cuadrados ponderados. Por debajo de oQ4, la tabla n-gram se mantiene a 4 bits y queda fuera del presupuesto de bits porque oMLX puede servirla desde SSD en lugar de memoria. La version FP16 almacena escalas, sesgos y tensores no cuantizados en FP16 en vez de BF16, y mantiene el codificador visual en FP32.

## Capacidades

- Generacion de texto y razonamiento en un modelo MoE de gran capacidad con solo 6B parametros activos por token.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text), gracias al codificador visual conservado en FP32.
- Prediccion multi-token mediante la cabeza MTP, que permite decodificacion especulativa y acelera la generacion.
- Recuperacion mediante embeddings n-gram de 51,2B parametros, servibles desde SSD en oMLX.
- Conversacion multi-turno (tag conversational en el repositorio).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local multimodal en Apple Silicon: el checkpoint MLX de 91,491 GiB permite ejecutar un MoE vision-lenguaje en equipos con memoria unificada suficiente, sin GPU de datacenter, usando oMLX como runtime.
- Analisis de documentos con imagen y texto: el codificador visual en FP32 permite procesar capturas, graficos o paginas escaneadas junto a instrucciones textuales en una sola llamada.
- Generacion acelerada por MTP: en escenarios de chat o resumen donde la latencia importa, la cabeza de prediccion multi-token permite decodificacion especulativa y reduce el tiempo por token frente a decodificacion autoregresiva pura.
- Experimentacion con arquitecturas hibridas: investigadores pueden comparar Gated DeltaNet + QSA frente a atencion densa en tareas de contexto largo, con un checkpoint ya empaquetado y ejecutable.
- Despliegue con presupuesto de memoria ajustado: la mezcla de 3, 4, 6 y 8 bits reduce el backbone a 58,647 GiB, y la tabla n-gram puede residir en SSD, lo que facilita servir el modelo en maquinas con menos RAM que el total del repositorio.
- Pruebas de regresion de cuantizacion: al estar re-cuantizado con oQe refinado en oMLX 0.8.0, sirve como referencia para medir la perdida de calidad de esquemas de 3-4 bits frente al modelo original en FP16/BF16.
- Evaluacion de calidad multimodal antes de migrar a Qwen4: al ser un preestreno de la arquitectura de Qwen4, permite validar prompts, plantillas y pipelines de vision antes de que la familia definitiva este disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 91,491 GiB para cargar el checkpoint completo; el backbone por si solo ocupa 58,647 GiB y la tabla n-gram 29,802 GiB, que oMLX puede servir desde SSD.
- Codificador visual: 1,672 GiB en FP32; cabeza MTP: 1,370 GiB.
- GPU recomendadas: no disponible. El formato es MLX, por lo que el entorno natural es Apple Silicon con memoria unificada; para CUDA haria falta convertir el checkpoint a otro runtime, algo que la informacion disponible no documenta.
- Cabe en GPU de consumo: no disponible para CUDA. En Apple Silicon, el requisito de memoria unificada de aproximadamente 92 GiB queda fuera de la mayoria de equipos de consumo; solo configuraciones de gama alta con memoria unificada amplia podrian albergarlo completo, y con la tabla n-gram en SSD el requisito baja hacia los 60 GiB del backbone mas codificador y MTP.
- Opciones de despliegue: oMLX (runtime para el que se genero la cuantizacion, con soporte de offload de la tabla n-gram a SSD); otros runtimes MLX compatibles con safetensors. vLLM, llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp (este) | 180B (125,744B backbone + 51,2B n-gram + 0,449B vision + 2,607B MTP) | 6B | no disponible | Qwen Community 1.0 | safetensors MLX, 4,366 bits/peso | Cuantizacion mixta de comunidad, vision + MTP |
| Qwen/Qwen3.8-Flash-Next (base) | 180B | 6B | no disponible | Qwen Community 1.0 | no disponible | Modelo original sin cuantizar; referencia de calidad |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada para establecer comparaciones con modelos de la competencia |

## Limitaciones y advertencias

- Alucinacion: no hay evaluaciones publicadas de fiabilidad; un MoE de este tamano puede generar contenido plausible pero incorrecto, especialmente en tareas factuales.
- Perdida por cuantizacion: el checkpoint usa 3 bits en el 44,7% de los pesos logicos y 4 bits en el 23,8%; aunque oQ3.5e mide sensibilidad por capa, la degradacion frente al original no esta cuantificada en la informacion disponible.
- Dependencia de runtime: esta optimizado para oMLX y MLX; fuera de ese ecosistema no hay garantia de compatibilidad ni de rendimiento.
- Requisitos de memoria elevados: 91,491 GiB completos y 58,647 GiB solo para el backbone, lo que limita el despliegue a equipos con memoria unificada muy alta o a configuraciones con offload a SSD.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura linguistica ni longitud de contexto, por lo que no se puede garantizar su comportamiento en castellano ni en contextos largos.
- Tool calling, agentes y modo thinking: no confirmados en la informacion disponible; no deben asumirse en produccion.
- Licencia: Qwen Community License 1.0 impone condiciones adicionales al uso comercial; hay que revisar el archivo LICENSE antes de integrarlo en productos.
- Versionado: el autor indica que el 2026-11-19 se re-cuantizo con oQe refinado en oMLX 0.8.0; copias anteriores deben descartarse para evitar discrepancias de calidad.
- Modelo experimental: se trata de un preestreno de la arquitectura de Qwen4, no de un modelo estable de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp/blob/main/LICENSE
