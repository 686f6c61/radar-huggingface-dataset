# neroued/GLM-5.3-Flash-NInfer

## Resumen

GLM-5.3-Flash-NInfer es un artefacto de pesos en precisión mixta para el motor de inferencia NInfer v3, derivado de GLM-5.3-Flash de zai-org (Zhipu AI) y convertido a partir del checkpoint NVFP4 publicado por NVIDIA. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada del modelo original, empaquetada en un formato propietario (`.ninfer`) que solo el motor NInfer puede cargar. El autor del artefacto es el usuario neroued, también responsable del repositorio NInfer.

El modelo subyacente es multimodal (texto e imagen), con arquitectura GLM5Next, que combina atención lineal KDA, MLA dispersa con indexador Kpool, mHC y mezcla de expertos (MoE). Incluye además MTP (multi-token prediction) nativo con hasta cinco borradores y una cabeza draft adicional de vocabulario completo en Q4, pensada para decodificación especulativa. El artefacto ocupa 178,33 GiB repartidos en seis ficheros y está diseñado para ejecutarse de forma distribuida en dos nodos DGX Spark con tensor parallelism 2 y data parallelism de atención 2.

Su relevancia es acotada pero clara: permite servir un modelo de gran tamaño y contexto muy largo (1.048.576 tokens lógicos) sobre hardware compacto de NVIDIA Blackwell, con endpoint compatible con OpenAI y Anthropic. La licencia MIT de los pesos originales facilita el uso comercial, aunque el formato cerrado y la dependencia estricta del motor NInfer limitan su portabilidad frente a pesos en safetensors o GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM5Next: atencion lineal KDA, MLA dispersa con indexador Kpool, mHC y MoE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE confirmada, sin cifra publicada) |
| Longitud de contexto | 1.048.576 tokens (limite logico configurado en el ejemplo de despliegue) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados y tres capas MLP densas), Q8 A16 (proyecciones KDA Q/K/V/O, salida MLA, expertos compartidos), Block-FP8 (expertos enrutados MTP), BF16 (cabeza principal, embeddings, mHC, vision), FP32 (campos KDA/control), Q4 A16 (cabeza draft MTP optimizada) |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos); NInfer es Apache-2.0 |
| Formato de pesos | `.ninfer` propietario, seis ficheros, 178,33 GiB en total |

## Arquitectura y entrenamiento

La arquitectura es GLM5Next, una combinación de atención lineal KDA con MLA dispersa mediante indexador Kpool, más mHC y capas MoE. El artefacto no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, fases de RLHF o DPO); esos datos corresponden a GLM-5.3-Flash de zai-org y no se detallan en la model card. Lo que sí describe el autor es el proceso de conversión: se importan los códigos y escalas NVFP4 calibrados de NVIDIA para los expertos enrutados y las tres primeras capas MLP densas, se cuantizan a Q8 A16 las proyecciones KDA y MLA, se convierte a Block-FP8 desde BF16 los expertos enrutados de MTP y se mantienen en BF16 la cabeza principal, embeddings, mHC y el codificador de visión. Los campos FP32 de KDA y control permanecen en FP32.

La innovación principal es la decodificación especulativa con MTP nativo de 1 a 5 borradores y una cabeza draft Q4 A16 de vocabulario completo (sin recorte), que convive con la cabeza objetivo en BF16. El despliegue de referencia usa TP2 con atención DP2, KV en FP8, CUDA Graph para decodificación y hasta ocho peticiones activas. Los expertos usan tensor parallelism por defecto (`ep = 1`), con opción de expert parallelism completo (`ep = 2`) manteniendo TP2 y DP2 en el resto. DFlash y DFlash2 no se emplean en esta arquitectura.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia de GLM y encuadre de herramientas específico.
- Razonamiento con modo thinking siempre activo; esfuerzos disponibles `low`, `high` y `max`. No se admite `--no-thinking` ni esfuerzo `none`.
- Entrada multimodal de imagen y vídeo (pipeline `image-text-to-text`), con Vision habilitable en el arranque.
- Tool calling / function calling: NInfer devuelve las llamadas generadas al cliente, pero no las ejecuta.
- Salida restringida (constrained output) y streaming.
- Reutilización de prefijo (prefix reuse) para conversaciones largas.
- Decodificación especulativa con MTP de 1 a 5 borradores y cabeza draft Q4 opcional.
- Servido con endpoints compatibles con OpenAI y Anthropic.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia conversacional de contexto muy largo: con 1.048.576 tokens lógicos se pueden mantener sesiones extensas o ingerir documentación completa sin truncar, aprovechando la reutilización de prefijo para no reprocesar el histórico en cada turno.
- Análisis de documentos e imágenes: al habilitar Vision en el arranque, el modelo puede recibir capturas, diagramas o fotogramas de vídeo junto con texto, útil para extracción de información estructurada a partir de material visual.
- Automatización de flujos con herramientas: el soporte de tool calling y salida restringida permite generar llamadas JSON válidas que el orquestador del cliente ejecuta, integrándose en pipelines de agentes sin que el motor ejecute código por sí mismo.
- Razonamiento complejo por lotes: los niveles de esfuerzo `low`, `high` y `max` permiten ajustar el coste computacional según la tarea, reservando `max` para problemas de análisis y usando `low` en tareas de clasificación o extracción.
- Servicio interno compatible con OpenAI: al exponer un único endpoint HTTP compatible con OpenAI y Anthropic, se puede sustituir un backend en la nube por este despliegue local sin reescribir los clientes existentes.
- Despliegue en hardware compacto Blackwell: dos DGX Spark con TP2 y atención DP2 ofrecen una alternativa de inferencia local para equipos que no disponen de un nodo con múltiples H100, a costa de aceptar el formato propietario y el reparto en seis ficheros.
- Generación de código asistida: aunque no hay benchmarks publicados, el modelo base es de propósito general; el modo thinking y la salida restringida permiten integrarlo en asistentes de edición con formato de respuesta controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del artefacto: 178,33 GiB en seis ficheros; debe copiarse completo en cada nodo. No cabe en una sola DGX Spark.
- Despliegue de referencia: dos nodos DGX Spark (Blackwell) con TP2, atención DP2, KV en FP8, MTP3, cabeza draft optimizada, CUDA Graph y hasta ocho peticiones activas.
- Compilación de NInfer con dependencias de desarrollo NCCL y preset `dgx-spark-release` con `NINFER_ENABLE_DISTRIBUTED=ON`.
- El coordinador lanza los workers, usando SSH para el nodo remoto; los clientes se conectan a un único endpoint HTTP.
- VRAM estimada para inferencia: no disponible de forma explícita; el autor remite a la estimación de capacidad que imprime el motor al arrancar, que incluye workspace y el pool compartido de KV/State.
- GPU consumer: no disponible; el artefacto está orientado a DGX Spark y no se documenta compatibilidad con RTX 4090 u otras consumer.
- Opciones de despliegue: NInfer (`ninfer-serve` para servido, `apps/ninfer` para CLI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NInfer | no disponible | 1.048.576 | `.ninfer` (propietario) | MIT | Requiere NInfer y dos DGX Spark; cuantización mixta NVFP4/Q8/FP8/BF16/Q4 |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | MIT | Modelo base original; sin datos de benchmarks en esta ficha |
| nvidia/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | NVFP4 | MIT (pesos upstream) | Checkpoint NVFP4 de NVIDIA del que deriva este artefacto |

No se dispone de datos de rendimiento comparado ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El formato `.ninfer` es propietario y solo lo carga el motor NInfer; no es portable a vLLM, llama.cpp, Ollama, TGI ni transformers.
- El despliegue exige dos nodos DGX Spark con NCCL y configuración de red manual (direcciones, rutas de artefactos, ejecutables remotos vía SSH); no es un despliegue de un solo comando.
- El modo thinking no se puede desactivar (`--no-thinking` y esfuerzo `none` no están soportados), lo que incrementa el coste de tokens en todas las peticiones.
- Las llamadas a herramientas se devuelven al cliente pero no se ejecutan en el motor; cualquier ejecución debe implementarse en la capa cliente con las validaciones oportunas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base GLM-5.3-Flash antes de usarlo en producción.
- Idiomas soportados no especificados; conviene validar el comportamiento en castellano antes de desplegar.
- La licencia MIT de los pesos permite uso comercial, pero NInfer se distribuye bajo Apache-2.0 y el artefacto depende de ese motor; revise ambas licencias en conjunto.
- El artefacto tiene 9 descargas y 0 likes en el momento de la consulta, con fecha de creación en octubre de 2026; es un artefacto reciente y poco validado por la comunidad.
- No se publican benchmarks propios del artefacto cuantizado; el impacto de la cuantización mixta en calidad frente al modelo original no está medido en la información disponible.

## Enlaces

- Artefacto en HuggingFace: https://huggingface.co/neroued/GLM-5.3-Flash-NInfer
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Guía de compilación de NInfer: https://github.com/Neroued/ninfer#build
- Receta de conversión `glm5next`: https://github.com/Neroued/ninfer/blob/master/tools/convert/official_recipes.py
- Configuración de ejemplo para dos Sparks: https://github.com/Neroued/ninfer/blob/master/examples/configs/spark2-glm5_3-flash.toml
- Guía de despliegue: https://github.com/Neroued/ninfer/tree/master/examples/configs
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/LICENSE
