# raahemnabeel/ornith-1.5-397b-hybrid-qb2

## Resumen

Ornith-1.5-397B-hybrid-qb2 es un paquete de despliegue publicado por el usuario raahemnabeel que permite servir el modelo Ornith-1.5-397B-FP8 (desarrollado por ornith-ai) sobre hardware Tenstorrent p300x2 (dos aceleradores QB2). No se trata de un modelo nuevo, sino de una receta de empaquetado y ejecución: el repositorio contiene únicamente los artefactos de configuración y perfiles de servicio (2,0 GB), mientras que los pesos reales se descargan de los checkpoints oficiales en el primer arranque.

El modelo subyacente es un transformer de tipo Qwen3.5-MoE con 397.000 millones de parámetros totales, 60 capas y 512 expertos por capa con enrutamiento top-10. Incorpora atención lineal gated-delta-net combinada con atención completa con compuertas cada cuarta capa, lo que da lugar a una arquitectura híbrida. El contexto máximo es de 131.072 tokens y la licencia es MIT.

La relevancia de este paquete es que resuelve un problema de infraestructura concreto: el modelo completo no cabe en la DRAM de los cuatro dies del QB2, por lo que se implementa una superposición híbrida MoE en la que cada capa retiene en dispositivo sus 255 expertos más usados (en bfp4), mientras la CPU calcula el resto desde copias int4 con AVX-512 y los expertos recientemente no usados se copian por PCIe a 32 ranuras de reserva por capa. La decodificación es especulativa mediante el drafter DFlash, con 3 borradores por pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (Qwen3.5-MoE) con atención lineal gated-delta-net y atención completa con compuertas cada 4 capas |
| Parametros totales | 397.000 millones |
| Parametros activos | Top-10 expertos por capa sobre 512 expertos (60 capas); número exacto de parámetros activos no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 (checkpoint original), int4 (biblioteca de expertos en host), bfp4 (expertos en dispositivo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (checkpoint FP8 original); artefactos propietarios de dispositivo generados en el primer arranque |
| Hardware objetivo | Tenstorrent p300x2 (2x QB2) |
| Drafter especulativo | ornith-ai/Ornith-1.5-397B-DFlash (2,5 GB) |
| Perfiles de servicio | p300x2-128k (por defecto), p300x2-128k-lowmem |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE de 60 capas con 512 expertos por capa y enrutamiento top-10, combinando capas de atención lineal gated-delta-net con capas de atención completa con compuertas cada cuarta capa. El checkpoint original se distribuye en FP8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO, ya que la model card del paquete de despliegue no incluye esos datos.

La innovación técnica destacable de este paquete es la superposición híbrida MoE para hardware con DRAM insuficiente: cada capa mantiene en el dispositivo sus 255 expertos más usados en formato bfp4, la CPU calcula los expertos restantes desde copias int4 usando kernels AVX-512 mientras el dispositivo sigue trabajando, y los expertos que se echan en falta se copian por PCIe a 32 ranuras de reserva por capa. La decodificación emplea muestreo especulativo exacto con el drafter DFlash (3 borradores por pasada), válido tanto para peticiones greedy como muestreadas, de modo que la salida respeta la distribución solicitada.

## Capacidades

- Generación de texto conversacional de un solo usuario (chat), razonamiento y código.
- Modo de razonamiento separado: el texto de pensamiento se devuelve en el campo `reasoning`, distinto de `content`, mediante el parser qwen3.
- Tool calling / function calling habilitado con el parser qwen3_xml: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Decodificación especulativa exacta para peticiones greedy y muestreadas (temperature, top_k, top_p, seed).
- API compatible con OpenAI en `/v1` (chat completions, completions, `/v1/models`).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistente de chat y razonamiento en puesto único: el perfil por defecto permite conversaciones multi-turno de hasta 128K tokens sobre una única QB2, adecuado para prototipado y evaluación de un modelo de 397B en hardware Tenstorrent.
- Generación de código con tool calling: la integración del parser qwen3_xml permite conectar el modelo a herramientas externas (ejecutores de tests, linters, APIs de repositorios) en flujos de asistencia a desarrollo.
- Razonamiento de cadena larga con separación de trazas: el campo `reasoning` facilita auditar el proceso de pensamiento en tareas analíticas sin mezclarlo con la respuesta final.
- Evaluación comparativa de hardware: sirve como banco de pruebas para medir el rendimiento de la superposición híbrida MoE (dispositivo + CPU + PCIe) frente a despliegues puramente GPU.
- Procesamiento de documentos extensos: con 131.072 tokens de contexto se pueden ingerir contratos, informes o bases de código completas en una sola petición para resumen y extracción.
- Investigación en decodificación especulativa: el paquete expone el drafter DFlash y el muestreo especulativo exacto, útil para estudiar latencia y fidelidad distribucional en entornos no GPU.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del paquete y del modelo base facilita su uso en productos comerciales internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: Tenstorrent p300x2 (dos aceleradores QB2).
- CPU host con AVX-512 (kernel de expertos en host); medido en un Ryzen 7 9700X de 8 núcleos con DDR5 de 2 canales. El ancho de banda de memoria del host limita la mitad CPU de cada token.
- RAM host libre: ~205 GB para el perfil `p300x2-128k` (biblioteca int4 residente más copias en formato dispositivo fijadas) y ~135 GB para `p300x2-128k-lowmem` (solo biblioteca int4). El servidor comprueba este requisito al arrancar y rechaza el inicio si no se cumple; `HYB_RAM_CHECK=warn` lo fuerza a costa de un decode varias veces más lento por paginación de expertos.
- Disco: ~900 GB en total (checkpoint FP8 de 397 GB, drafter de 2,5 GB, biblioteca int4 de 141 GB, copias en formato dispositivo de 51 GB solo en el perfil por defecto, e imágenes de dispositivo de ~300 GB escritas en el primer arranque).
- Concurrencia: `max_num_seqs` = 1, una petición a la vez.
- Despliegue: `tt serve raahemnabeel/ornith-1.5-397b-hybrid-qb2` o `tt-model serve` con `--profile`; servidor OpenAI-compatible en el puerto 20000.
- Tiempos de arranque: compilación de kernels varios minutos en el primer arranque; construcción de copias híbridas ~20 minutos (biblioteca int4 en host, 16 hilos) más ~11 minutos (copias en formato dispositivo); arranques posteriores ~15 minutos.
- Latencia y throughput: no disponibles en cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-397B-hybrid-qb2 (este paquete) | 397B (MoE, top-10) | 131.072 | Tenstorrent p300x2 | MIT | Hugging Face (raahemnabeel) |
| Ornith-1.5-397B-FP8 (base) | 397B (MoE, top-10) | no disponible | GPU (formato FP8) | no disponible | Hugging Face (ornith-ai) |
| Ornith-1.5-397B-DFlash (drafter) | no disponible | no disponible | GPU | no disponible | Hugging Face (ornith-ai) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware muy específica: solo funciona en Tenstorrent p300x2; no es desplegable en GPU convencionales ni en CPU sola.
- Concurrencia limitada a una petición simultánea (`max_num_seqs` = 1), lo que lo hace inadecuado para servicios multiusuario en producción.
- Requisitos de recursos elevados: ~205 GB de RAM host y ~900 GB de disco; el servidor rechaza el arranque si no se cumplen.
- El rendimiento del decode está acotado por el ancho de banda de memoria del host y por el enlace PCIe para la migración de expertos.
- Las penalizaciones de presencia, frecuencia y repetición no están soportadas según la model card (texto truncado).
- Con top_k superior a 32 se leen los logits completos de la verificación, con ligera penalización de latencia.
- Riesgo de alucinación y sesgos: no disponible información específica en la documentación proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Licencia MIT declarada, pero conviene verificar las condiciones del checkpoint base ornith-ai/Ornith-1.5-397B-FP8, cuya licencia no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/raahemnabeel/ornith-1.5-397b-hybrid-qb2
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-397B-FP8
- Drafter especulativo: https://huggingface.co/ornith-ai/Ornith-1.5-397B-DFlash
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerequisites): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
