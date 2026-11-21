# mlx-community/Inkling-2-Mini-oQ3e-mtp

## Resumen

Inkling-2-Mini-oQ3e-mtp es una cuantizacion mixta de precision del modelo thinkingmachines/Inkling-2-Mini, publicada por la comunidad mlx-community para su uso con el framework MLX de Apple. El modelo base es un transformer multimodal de tipo mixture-of-experts (MoE) con 26.400 millones de parametros totales y 3.400 millones de parametros activos por token, disenado para procesar entradas de texto e imagen con una ventana de contexto de hasta 1 millon de tokens. Su rasgo arquitectonico mas distintivo es el bucle de capas: las 12 capas centrales se ejecutan tres veces por cada token, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros.

Esta version concreta emplea la tecnica oQ (oMLX v0.8.1) de cuantizacion de precision mixta, que reduce las proyecciones de atencion y los embeddings a 8 bits, la cabeza de vocabulario a 6 bits y los expertos enrutados a 3 bits, manteniendo el codificador de vision y el borrador DSpark en BF16. El resultado es un checkpoint de 13,7 GB con un promedio efectivo de 3,953 bits por peso, lo que lo hace viable en hardware Apple Silicon con memoria unificada modesta. Incluye en `mtp.safetensors` un borrador DSpark que habilita decodificacion especulativa mediante la funcion Lightning MTP de oMLX.

La relevancia de esta ficha radica en que combina tres tendencias recientes: modelos MoE con alta relacion parametros totales/activos, contextos de un millon de tokens y tecnicas de decodificacion especulativa integradas en el propio checkpoint. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con bucle de capas (12 capas centrales ejecutadas 3 veces por token) |
| Parametros totales | 26.389 millones (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | Hasta 1.048.576 tokens (1M) |
| Tipos de cuantizacion | oQ3e mixta: affine 3-bit grupo 64 (expertos enrutados), affine 8-bit grupo 64 (atencion y embeddings), affine 6-bit grupo 64 (cabeza de vocabulario), BF16 (vision y borrador DSpark), FP32 (router y controladores de bucle) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` para el borrador DSpark |
| Bits efectivos por peso | 3,953 (modelo de lenguaje y vision); 4,096 incluyendo el borrador DSpark |
| Tamano del repositorio | 13,7 GB |
| Requisito de software | oMLX 0.8.1 o superior |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 26,4B parametros totales y 3,4B activos, disenado para entradas multimodales de texto e imagen. La innovacion estructural principal es el bucle de capas: las 12 capas intermedias se ejecutan tres veces para cada token, lo que triplica la profundidad efectiva en ese tramo sin incrementar el recuento de parametros. Esta tecnica busca mejorar la capacidad de razonamiento iterativo a un coste computacional controlado, ya que solo se reutilizan pesos existentes. El modelo incorpora un codificador de vision de 318 millones de parametros y una cabeza de vocabulario separada.

El checkpoint incluye un borrador DSpark de 318 millones de parametros en `mtp.safetensors`, que oMLX Lightning MTP utiliza para decodificacion especulativa: el borrador propone varios tokens candidatos que el modelo principal verifica en paralelo, reduciendo la latencia de generacion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La cuantizacion oQ3e redistribuye la precision de forma asimetrica: los expertos enrutados, que concentran el 92,7% de los pesos logicos, se almacenan a 3 bits, mientras que las proyecciones de atencion y los embeddings conservan 8 bits y el router y los controladores de bucle mantienen FP32 para preservar la estabilidad del enrutamiento.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventana de contexto de hasta 1M tokens.
- Procesamiento de imagenes: el pipeline declarado es image-text-to-text, con un codificador de vision dedicado de 318M parametros.
- Razonamiento iterativo potenciado por el bucle de capas, que reaplica las 12 capas centrales tres veces por token.
- Decodificacion especulativa mediante el borrador DSpark incluido en el checkpoint (Lightning MTP de oMLX).
- Capacidades multilingues: no se especifican los idiomas soportados en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: la ventana de 1M tokens permite procesar informes anuales, contratos o expedientes completos junto con sus graficos y tablas en una sola pasada, sin necesidad de trocear el contenido ni perder coherencia entre secciones.
- Asistencia sobre capturas de pantalla y diagramas tecnicos en local: al ejecutarse con MLX en Apple Silicon, el modelo puede analizar imagenes de interfaces, esquemas de arquitectura o diagramas de flujo sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado rapido en equipos con Mac: con 13,7 GB de checkpoint y cuantizacion de 3 bits en los expertos, un MacBook Pro con 32 GB de memoria unificada puede ejecutar el modelo para pruebas de concepto de asistentes multimodales sin adquirir GPU dedicadas.
- Generacion aumentada por recuperacion (RAG) sobre corpus largos: el contexto de 1M tokens permite inyectar grandes bloques de documentacion recuperada y mantener conversaciones de seguimiento con referencias precisas a fragmentos concretos.
- Evaluacion de modelos MoE con bucle de capas: investigadores pueden usar este checkpoint para estudiar el efecto del bucle de 12 capas y de la decodificacion especulativa DSpark en calidad y latencia, comparandolo con el modelo base en BF16.
- Despliegue de asistentes multimodales en estaciones de trabajo Apple: integrable mediante oMLX 0.8.1 o superior, con decodificacion especulativa activada, para tareas de atencion al cliente interna o asistencia a desarrolladores con capturas de errores y logs extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 13,7 GB en disco y aproximadamente 12,7 GiB en memoria al cargarse; se recomienda un minimo de 16 GB de memoria unificada, y 32 GB para margen con contexto largo y cache KV.
- Hardware objetivo: Apple Silicon (serie M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) mediante MLX. No es compatible con CUDA de forma nativa.
- Cabe en GPU de consumo Apple: si, en modelos con 16 GB o mas de memoria unificada; en Mac con 32 GB o 64 GB se puede ampliar la ventana de contexto y el tamano de lote.
- Opciones de despliegue: oMLX 0.8.1 o superior (requisito explicito del autor); la libreria declarada es mlx. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa con el borrador DSpark de 318M parametros esta pensada para reducir la latencia, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ3e-mtp (esta ficha) | 26,4B | 3,4B | 1M | Apache 2.0 | safetensors MLX, 3,953 bits/peso |
| thinkingmachines/Inkling-2-Mini (modelo base) | 26,4B | 3,4B | 1M | Apache 2.0 | safetensors, BF16 |
| Alternativas MoE de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa de benchmarks. La diferencia principal frente al modelo base es el tamano (13,7 GB frente al checkpoint BF16, que seria aproximadamente cuatro veces mayor) y la inclusion del borrador DSpark para decodificacion especulativa.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en los expertos enrutados puede degradar la calidad en tareas de razonamiento complejo o generacion de codigo respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esta perdida.
- El modelo requiere oMLX 0.8.1 o superior y esta ligado al ecosistema MLX; no es portable directamente a CUDA, ROCm ni a otros runtimes sin conversion adicional.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta documentado y debe validarse empiricamente antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos generativos; el contexto de 1M tokens no elimina este riesgo y puede amplificar la confusion si se inyecta documentacion irrelevante o contradictoria.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base conserva su propia licencia; conviene verificar la model card de thinkingmachines/Inkling-2-Mini antes de redistribuir.
- El checkpoint incluye el borrador DSpark en un archivo separado (`mtp.safetensors`); si el runtime no soporta Lightning MTP, la decodificacion especulativa no se aprovechara y el rendimiento sera el de una generacion autoregresiva convencional.
- No hay informacion sobre tool calling ni soporte de agentes, lo que limita su uso en pipelines que dependan de function calling estructurado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ3e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
