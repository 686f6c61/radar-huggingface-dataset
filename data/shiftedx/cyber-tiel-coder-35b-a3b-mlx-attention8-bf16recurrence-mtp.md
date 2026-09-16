# Shiftedx/Cyber-Tiel-Coder-35B-A3B-MLX-Attention8-BF16Recurrence-MTP

## Resumen

Cyber-Tiel Coder 35B-A3B (variante MLX Attention8 / BF16 Recurrence / native MTP) es una cuantizacion de precision mixta publicada por Shiftedx sobre los pesos BF16 abliterados de huihui-ai/Huihui-Ornith-1.5-35B-A3B. No es un modelo entrenado desde cero: es un artefacto de distribucion para Apple Silicon que combina cuantizacion 4-bit y 8-bit en los modulos de texto, mantiene en BF16 las proyecciones recurrentes, los tensores de vision y el sidecar de prediccion multi-token (MTP), y reutiliza la plantilla de chat Sharp del publicador original Cyber-Tiel. El resultado son 26,17 GiB de pesos en formato MLX, con 35.107.181.936 parametros totales y aproximadamente 3.000 millones activos por token (denominacion A3B).

La arquitectura subyacente es un transformer MoE de tipo qwen3_5_moe con 40 capas, de las cuales 30 usan atencion lineal y 10 atencion completa, 256 expertos con 8 activos por token, y soporte multimodal image-text-to-text. El autor indica que el artefacto esta marcado como no verificado por MTPLX porque no se pudo medir la paridad numerica frente al padre BF16 completo en el equipo de validacion.

Es relevante ahora por dos motivos practicos: permite ejecutar un MoE de 35B con ~3B activos en un Apple M4 Max de 64 GiB de memoria unificada con contexto de 65.536 tokens, y aprovecha el MTP nativo para decodificacion especulativa a profundidad 2, con 108 tokens/s medidos frente a 51 tokens/s en modo autorregresivo. La contrapartida es que se trata de un derivado abliterado (sin capas de rechazo), con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicos estandar y sin resultados de busqueda web relevantes asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tag qwen3_5_moe), 40 capas: 30 de atencion lineal y 10 de atencion completa |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | ~3B por token (8 expertos activos de 256); denominacion A3B |
| Longitud de contexto | 65.536 tokens (ventana recomendada por el autor en MTPLX) |
| Tipos de cuantizacion | Mixta: 4-bit affine grupo 32 (192 modulos lineales de texto, cuerpo de expertos por defecto); 8-bit affine grupo 64 (260 modulos: atencion, embeddings/salida, gating y proyecciones de expertos de las ultimas ocho capas); BF16 (60 proyecciones recurrentes, 333 tensores de vision, 785 tensores MTP nativos) |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos fuente y pesos del modelo) |
| Formato de pesos | safetensors en formato MLX (4-bit/8-bit/BF16 mezclados); 17 shards de texto, 1 shard de vision y 1 sidecar MTP BF16 |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento nuevo: se genero por streaming desde los pesos BF16 fijados de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (revision 7269f0953054d68b3cacbd9ad729921258732007) y aplica una cuantizacion de precision mixta independiente, distinta de los pesos oQ4e del publicador original y de su cuantizacion con matriz de importancia. La distribucion de precision es deliberada: el cuerpo de expertos se comprime a 4-bit affine con grupo 32, mientras atencion, embeddings, gating y las proyecciones de expertos de las ocho ultimas capas se mantienen a 8-bit affine con grupo 64; las proyecciones recurrentes, los tensores de vision y el sidecar MTP quedan en BF16 para preservar precision donde mas afecta.

La topologia declarada es MoE con 256 expertos y 8 activos por token sobre 40 capas, con una mezcla hibrida de atencion lineal (30 capas) y atencion completa (10 capas), lo que reduce el coste del contexto largo. Incorpora MTP nativo como mecanismo de decodificacion especulativa (profundidad 2 recomendada) y un cabezal de vision para pipeline image-text-to-text. No hay informacion en la model card sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre las etapas de alineacion (RLHF/DPO) del modelo padre. El autor tampoco documenta el proceso de abliteracion heredado del padre, salvo su presencia en el nombre del modelo base. La revision de pesos es inmutable (1e6025469055332ebea7685477fc9a1ae22a6937) y se acompania de un integrity.json con SHA-256 y tamano por fichero.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline conversational, plantilla de chat Sharp).
- Generacion de codigo: el autor reporta pruebas de humo de codigo superadas 3/3 y un conjunto mas exigente de codigo, razonamiento y contexto con 6/10.
- Razonamiento y contexto largo: ventana de 65.536 tokens con cache KV sin cuantizar segun la configuracion recomendada.
- Vision: entrada image-text-to-text; se incluye un shard de vision de 0,83 GiB con 333 tensores en BF16. Requiere el modo de generacion MTP de MTPLX para procesar imagenes.
- Decodificacion especulativa con MTP nativo a profundidad 2 (sidecar de 1,57 GiB, 785 tensores BF16).
- Modo de razonamiento (thinking): la configuracion sugerida es con thinking desactivado (`--reasoning off`); el soporte de un modo de pensamiento explicito no se detalla en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).

## Casos de uso

- Despliegue local en estaciones Apple Silicon: un estudio o desarrollador individual puede servir el modelo con MTPLX sobre un M4 Max de 64 GiB y trabajar con un MoE de 35B sin depender de GPU dedicadas ni de APIs externas.
- Asistencia de programacion en el editor: con ~99 tokens/s en pruebas de codigo y MTP a profundidad 2, es viable para autocompletado, refactorizacion y explicacion de fragmentos en flujos interactivos donde la latencia percibida es critica.
- Procesamiento de repositorios con contexto largo: la ventana de 65.536 tokens permite analizar varios ficheros o un modulo completo en una sola pasada para tareas de resumen, deteccion de inconsistencias y generacion de documentacion.
- Revision de codigo previa a commit: el autor indica explicitamente que se revise el codigo generado antes de usarlo, por lo que encaja como primer filtro en pipelines locales de pre-revision, no como sustituto de la revision humana.
- Analisis de capturas y diagramas tecnicos: el cabezal de vision en BF16 admite preguntas sobre imagenes (2/2 en las pruebas del autor); resulta util para interpretar diagramas de arquitectura, trazas de error o interfaces.
- Experimentacion con decodificacion especulativa: sirve como banco de pruebas para medir el impacto del MTP nativo (108 tokens/s en D2 frente a 51 tokens/s en autorregresivo) en hardware unificado.
- Investigacion sobre modelos abliterados: permite estudiar el comportamiento de un MoE sin capas de rechazo en tareas de analisis de seguridad, siempre dentro de un marco controlado y con las advertencias de la seccion de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos numericos son mediciones locales del autor sobre un conjunto de prompts propio, no comparables con evaluaciones estandarizadas:

| Prueba local (Apple M4 Max 64 GiB, temperatura 0, thinking off) | Resultado | Throughput |
|---|---|---|
| Smoke test de codigo | 3/3 superadas | ~99 tokens/s |
| Conjunto de codigo, razonamiento y contexto | 6/10 superadas | ~80 tokens/s |
| Preguntas sobre imagen | 2/2 superadas | no disponible |
| Ajuste corto MTPLX, profundidad 2 (D2) | no aplica | 108 tokens/s |
| Ajuste corto MTPLX, autorregresivo (AR) | no aplica | 51 tokens/s |

El propio autor advierte que son mediciones sobre un conjunto de prompts local y no una puntuacion general de calidad, y que MTPLX marca el artefacto como no verificado a la espera de medir la paridad numerica con el padre BF16 completo.

## Requisitos de hardware

- Memoria: el artefacto pesa 26,17 GiB (23,76 GiB de texto, 0,83 GiB de vision, 1,57 GiB de MTP); el repositorio completo ocupa 28,1 GB. A ello hay que sumar la cache KV sin cuantizar para 65.536 tokens, cuyo consumo adicional no se detalla en la informacion disponible.
- Configuracion validada: Apple M4 Max con 64 GiB de memoria unificada, que es el unico equipo reportado en la model card.
- Estimacion: por tamano de pesos, una maquina Apple Silicon con 36-48 GiB de memoria unificada podria alojar el modelo con contextos mas cortos o cache KV cuantizada; no hay validacion publicada de esos escenarios, por lo que debe tratarse como estimacion, no como dato confirmado.
- GPU NVIDIA y CUDA: no disponible. El artefacto es MLX/MTPLX, pensado para Apple Silicon; no se declara compatibilidad con A100, H100, RTX 4090 ni otras GPU.
- Despliegue: MTPLX 2.11.2 con MLX 0.32.2, perfil `sustained`, modo de generacion MTP, profundidad 2, ventana de 65.536, cache KV sin cuantizar y plantilla Sharp. El ejemplo del autor es `mtplx serve --model Shiftedx/Cyber-Tiel-Coder-35B-A3B-MLX-Attention8-BF16Recurrence-MTP --profile sustained --generation-mode mtp --depth 2 --context-window 65536 --reasoning off`.
- vLLM, llama.cpp, Ollama o TGI: no disponible; la model card solo documenta el runtime basado en MLX.
- Latencia y throughput: ~99 tokens/s en pruebas de codigo, ~80 tokens/s en el conjunto mas exigente y 108 tokens/s con MTP a profundidad 2 frente a 51 tokens/s en autorregresivo, todo sobre M4 Max de 64 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad / notas |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MLX-Attention8-BF16Recurrence-MTP (este artefacto) | 35,1B totales, ~3B activos | 65.536 tokens | Mixta 4-bit/8-bit/BF16 en MLX | MIT | 0 descargas, 0 likes; marcado como no verificado por MTPLX |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP | 35,1B totales (mismo padre) | no disponible | oQ4e con matriz de importancia | MIT (segun el padre) | Pesos del publicador original; este artefacto no los reutiliza |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35,1B totales, ~3B activos | no disponible | BF16 sin cuantizar | MIT | Modelo base de esta publicacion |
| Familia Qwen3.5-MoE de ~35B-A3B (padre arquitectonico) | no disponible | no disponible | no disponible | no disponible | El tag qwen3_5_moe indica la linea arquitectonica; no hay datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Modelo abliterado: deriva del padre Huihui-Ornith-1.5-35B-A3B-abliterated, al que se le han eliminado las capas de rechazo. Es previsible que genere contenido que otros modelos rechazarian; no debe exponerse directamente a usuarios finales sin un filtro externo.
- Artefacto no verificado: MTPLX lo marca como no verificado porque no se pudo medir la paridad numerica con el padre BF16 completo en el host de validacion. La calidad puede diferir de la del modelo original.
- Sin benchmarks publicos: no hay MMLU, HumanEval, GSM8K ni evaluaciones estandarizadas. Las unicas cifras son pruebas locales del autor sobre prompts propios, con 6/10 en un conjunto de codigo, razonamiento y contexto.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor recomienda revisar el codigo generado antes de usarlo.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la ficha, con lo que no hay retroalimentacion independiente.
- Idiomas: no se declaran idiomas soportados. El rendimiento fuera del ingles y del chino (idiomas habituales de la familia Qwen) no esta documentado.
- Restricciones de plataforma: el artefacto es MLX/MTPLX para Apple Silicon. No hay ruta documentada para CUDA, y las herramientas habituales de servicio (vLLM, llama.cpp, Ollama, TGI) no aparecen soportadas en la model card.
- Licencia: MIT tanto en los pesos fuente como en los pesos del modelo, lo que permite uso comercial; conviene aun asi verificar las condiciones del padre y del publicador original antes de un despliegue en produccion.
- Fechas de publicacion: la ficha y el repositorio registran creacion y actualizacion en septiembre de 2026 (16:14 y 16:18 UTC del 16 de septiembre de 2026), lo que conviene tener en cuenta al evaluar la madurez del ecosistema asociado.
- Integridad: la revision de pesos es inmutable (1e6025469055332ebea7685477fc9a1ae22a6937) y se acompana de integrity.json con SHA-256 y tamanos; cualquier verificacion de cadena de suministro debe hacerse contra esa revision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiftedx/Cyber-Tiel-Coder-35B-A3B-MLX-Attention8-BF16Recurrence-MTP
- Revision inmutable de pesos: https://huggingface.co/Shiftedx/Cyber-Tiel-Coder-35B-A3B-MLX-Attention8-BF16Recurrence-MTP/tree/1e6025469055332ebea7685477fc9a1ae22a6937
- Fichero de integridad: https://huggingface.co/Shiftedx/Cyber-Tiel-Coder-35B-A3B-MLX-Attention8-BF16Recurrence-MTP/resolve/1e6025469055332ebea7685477fc9a1ae22a6937/integrity.json
- Modelo base (pesos BF16 de origen): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Revision concreta de los pesos BF16 de origen: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated/tree/7269f0953054d68b3cacbd9ad729921258732007
- Publicacion original Cyber-Tiel con pesos oQ4e y plantilla Sharp: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP/tree/c1471894c53a204b24fce56d673e9ce52c17310b
- Resultados de busqueda web: la busqueda realizada no devolvio ningun resultado relevante sobre este modelo; todas las entradas recibidas correspondian a paginas corporativas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, microsoft365 y la entrada de Wikipedia sobre Microsoft), sin relacion con el artefacto.
