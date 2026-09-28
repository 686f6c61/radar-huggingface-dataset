# inference-optimization/Qwen3.8-27B-DSpark-GPTQ-Gauss-NVFP4-W4A4

## Resumen

El modelo `inference-optimization/Qwen3.8-27B-DSpark-Gauss-NVFP4-W4A4` es un *drafter* de decodificación especulativa, no un modelo de chat autónomo. Se deriva de `RedHatAI/Qwen3.8-27B-speculator.dspark` (revisión `7f33c272e5da240978e0d55767abab8193d74b95`) y está diseñado para emparejarse con el modelo objetivo `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). Su función es proponer borradores de tokens que el modelo grande verifica, acelerando la generación sin alterar la distribución de salida del modelo verificado.

El componente tiene 1.988.431.617 parámetros (~1,99 mil millones) en formato safetensors, con un repositorio de 1,3 GB. Está cuantizado a NVFP4 en esquema W4A4 mediante GPTQ, usando un observador expanded-MSE, amortiguamiento de Hessian de 0,1 y calibración gaussiana con semilla sobre 1.892 registros alineados, con un límite de secuencia de 2.048 tokens durante la calibración. El pipeline declarado es `text-generation` y la librería es `speculators`.

Su relevancia es acotada y experimental: reduce el coste de inferencia de Qwen3.8-27B manteniendo la calidad del modelo objetivo, pero la propia model card indica que la evaluación está pendiente y que no se incluyen resultados de aceptación, velocidad ni calidad. Además, el ejemplo de servicio con vLLM emplea el backend de emulación para NVFP4, sin reclamar soporte nativo NVFP4 en H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter de decodificacion especulativa para el metodo DSpark; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.988.431.617 (~1,99 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (la calibracion uso un limite de secuencia de 2.048 tokens) |
| Tipos de cuantizacion | NVFP4 W4A4 mediante GPTQ; el repositorio incluye tambien las etiquetas 8-bit y compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (contenedor compressed-tensors, requiere custom_code) |
| Modelo base | RedHatAI/Qwen3.8-27B-speculator.dspark y Qwen/Qwen3.8-27B |
| Libreria | speculators |
| Tamano del repositorio | 1,3 GB |
| Metodo de decodificacion especulativa | DSpark (`--spec-method dspark`, 8 tokens de borrador en el ejemplo) |
| Revisiones fijadas | drafter: 7f33c272e5da240978e0d55767abab8193d74b95; objetivo: 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-28 |

## Arquitectura y entrenamiento

Se trata de un componente *drafter* dentro de un esquema de decodificación especulativa. En lugar de generar el texto final, propone secuencias cortas de tokens candidatos (8 en el ejemplo de servicio) que el modelo objetivo Qwen3.8-27B valida en una sola pasada. El método asociado es DSpark, identificado en la CLI de vLLM mediante `--spec-method dspark`. La model card no especifica el número de capas, la dimensionalidad, el mecanismo de atención ni la arquitectura concreta del drafter, por lo que esos datos figuran como no disponibles.

El entrenamiento del drafter original corresponde a RedHatAI (`RedHatAI/Qwen3.8-27B-speculator.dspark`); este repositorio publica únicamente la variante cuantizada. La cuantización aplicada es NVFP4 GPTQ en W4A4, con observador expanded-MSE, amortiguamiento de Hessian de 0,1 y calibración gaussiana con semilla. A diferencia de otras variantes del mismo autor, esta rama usó valores de calibración gaussianos en lugar de prompts reales: el manifiesto de cuantización registra 1.892 registros de calibración y un límite de secuencia de 2.048. El repositorio incluye en `provenance/quantization/` los comandos de entrenamiento y cuantización, el manifiesto, los metadatos de calibración, los scripts y parches fuente, y el digest SHA-256 de los pesos publicados. Los datos de prompts de calibración no se redistribuyen, y la model card no documenta uso de RLHF o DPO en este componente.

## Capacidades

- Decodificación especulativa: genera tokens borrador que el modelo objetivo Qwen3.8-27B verifica, con el fin de reducir la latencia por token.
- Integración con vLLM: soporta el flag `--spec-model` junto con `--spec-method dspark` y `--spec-tokens` (8 en el ejemplo oficial).
- Backend de emulación: el ejemplo de servicio usa `{"linear_backend":"emulation"}` para NVFP4; no se reclama soporte nativo NVFP4 en H100.
- Reproducibilidad: incluye comandos, manifiestos, parches y checksum de los pesos publicados.
- No es un modelo de chat: no genera respuestas por sí solo ni dispone de capacidad conversacional autónoma.
- Idiomas soportados: no disponible (depende del modelo objetivo).
- Tool calling, agentes, visión, audio, matemáticas o código: no disponible como capacidades propias del drafter; dependen del modelo verificado.
- Modo de razonamiento o *thinking*: no disponible.

## Casos de uso

- Aceleración del serving de Qwen3.8-27B: el drafter se despliega junto al modelo objetivo en vLLM para aumentar tokens por segundo sin modificar el resultado final, ya que toda propuesta se verifica.
- Reducción de latencia en chat interactivo: al proponer 8 tokens por paso, reduce el número de pasos secuenciales del modelo grande, lo que se traduce en menor tiempo hasta el primer token visible en conversaciones multi-turno.
- Abaratamiento del coste por token en producción: al aumentar el throughput por GPU, se reduce el número de réplicas necesarias para un mismo volumen de tráfico.
- Evaluación de decodificación especulativa: sirve como banco de pruebas para medir tasas de aceptación y *speedup* de DSpark frente a otros métodos (EAGLE, Medusa) sobre un objetivo de 27B.
- Despliegue en GPUs con memoria limitada: al ocupar aproximadamente 1,3 GB en disco, el drafter añade un coste de VRAM pequeño comparado con el modelo verificado, siempre que el objetivo quepa en la GPU.
- Pipelines RAG y resumen de documentos largos: combinado con el objetivo, acelera generaciones de salida extensa donde la latencia acumulada por token es el cuello de botella.
- Generación por lotes en modo offline: en procesos nocturnos de generación masiva, el *speedup* se traduce directamente en menos horas de GPU consumidas.
- Investigación en cuantización NVFP4: el repositorio documenta el proceso completo (observador, damping, calibración gaussiana), lo que lo hace útil para reproducir y comparar estrategias de cuantización de drafters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que la evaluación está pendiente: no se incluyen resultados completos de aceptación, velocidad ni calidad, y el checkpoint solo cuenta con procedencia de cuantización. Tampoco se ha completado la validación de serving en tiempo de ejecución ni la matriz de evaluación planificada.

## Requisitos de hardware

- VRAM estimada del drafter: aproximadamente 1,3 GB según el tamaño del repositorio, coherente con ~1,99 B de parámetros en NVFP4 (~1 GB) más overhead de formato y metadatos. Cifra estimada, no publicada por el autor.
- VRAM total necesaria: la del drafter más la del modelo objetivo Qwen3.8-27B, cuyo requisito no está disponible en la información proporcionada.
- GPU recomendadas: no disponible. El único dato oficial es que el ejemplo de servicio usa el backend de emulación de vLLM para NVFP4, sin reclamar soporte nativo NVFP4 en H100. Las GPUs con soporte nativo NVFP4 son las de arquitectura Blackwell.
- GPU de consumo: el drafter por sí solo cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 12 GB en adelante), pero el despliegue completo depende de que el modelo objetivo de 27B quepa en la misma GPU. En la información disponible no se especifica la cuantización del objetivo.
- Opciones de despliegue: vLLM con decodificación especulativa (`--spec-model`, `--spec-method dspark`, `--spec-tokens 8`, `--kernel-config '{"linear_backend":"emulation"}'`). No se documentan recetas para llama.cpp, Ollama o TGI, y el requisito de `custom_code` y formato compressed-tensors limita la compatibilidad con otros runtimes.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, tasa de aceptación ni factor de aceleración.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| inference-optimization/Qwen3.8-27B-DSpark-Gauss-NVFP4-W4A4 | Drafter DSpark cuantizado | 1,99 B | no disponible | NVFP4 W4A4 (GPTQ) | apache-2.0 | no disponible (evaluacion pendiente) |
| RedHatAI/Qwen3.8-27B-speculator.dspark | Drafter DSpark original | no disponible | no disponible | sin cuantizar (no confirmado) | no disponible | no disponible |
| Otros drafters para Qwen3.8-27B (EAGLE-3, Medusa u otros) | Drafter especulativo | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite establecer comparaciones cuantitativas de rendimiento con alternativas de la misma categoría. El único punto de comparación documentado es el drafter original de RedHatAI, del que este repositorio es una variante cuantizada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse como modelo de chat ni de generación directa; requiere el modelo objetivo Qwen3.8-27B y un runtime compatible con decodificación especulativa.
- Evaluación pendiente: no hay resultados de calidad, tasa de aceptación ni velocidad. Desplegarlo en producción sin validación propia es arriesgado.
- Sin validación de runtime: la model card indica que la validación de serving en tiempo de ejecución no se ha completado.
- Cuantización W4A4: la reducción a 4 bits en pesos y activaciones puede degradar la tasa de aceptación del drafter, lo que reduciría el *speedup* esperado. No se aportan datos al respecto.
- Calibración gaussiana en lugar de prompts: esta rama usó valores sintéticos, no datos reales de dominio, lo que puede introducir un sesgo de calibración respecto a cargas de trabajo reales.
- Requiere `custom_code` y formato compressed-tensors: la carga no es portable a todos los runtimes y puede exigir versiones concretas de las librerías.
- NVFP4 en modo emulación: el ejemplo oficial no aprovecha kernels nativos NVFP4, por lo que el beneficio de velocidad de la cuantización de 4 bits puede no materializarse en GPUs no Blackwell.
- Idiomas: no disponible; la cobertura lingüística real depende del modelo objetivo.
- Alucinación: el drafter no genera contenido final por sí mismo, pero sus propuestas se aceptan o rechazan según la verificación del objetivo, de modo que la calidad final la determina ese último.
- Licencia: apache-2.0 en este repositorio, pero conviene verificar la licencia del drafter original de RedHatAI y del modelo base Qwen/Qwen3.8-27B antes de un uso comercial.
- Inexistencia de tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso en producción ni validación por terceros.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/inference-optimization/Qwen3.8-27B-DSpark-Gauss-NVFP4-W4A4
- Drafter original: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) sobre este modelo en los resultados disponibles.
