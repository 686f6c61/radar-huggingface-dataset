# raahemnabeel/ornith-1.5-35b-a3b

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ornith-ai, con 35.000 millones de parámetros totales y 3.000 millones activos por token. Empaquetado y redistribuido por raahemnabeel para hardware Tenstorrent, el checkpoint se sirve mediante vLLM con un plugin específico para las tarjetas p100, p150, p300 y sus configuraciones multi-die. El modelo está pensado para uso agéntico en programación, tool calling y razonamiento sobre texto e imágenes.

La arquitectura combina 40 capas que alternan Gated DeltaNet (atención lineal) con atención completa con compuertas, 256 expertos con enrutamiento top-8 más un experto compartido, y un codificador de visión. Incorpora decodificación especulativa MTP y un modo de razonamiento activado por defecto, con una ventana de contexto de 262.144 tokens y soporte para hasta 32 secuencias concurrentes.

Su relevancia actual radica en dos factores: por un lado, ofrece capacidades de razonamiento y visión en un tamaño que cabe en configuraciones de hardware especializado de gama media; por otro, la licencia MIT y la compatibilidad con la API de OpenAI facilitan su integración en pipelines existentes sin fricción legal ni de interoperabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: Gated DeltaNet (atención lineal) + atención completa con compuertas, 40 capas |
| Parámetros totales | 35.000 millones (35B) |
| Parámetros activos | 3.000 millones (3B) por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | No disponible (los pesos de expertos se convierten a menor precisión en carga: bfp8 en perfiles de 4 dies, bfp4 en perfil de 1 die) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 14,0 GB; servido mediante vLLM con plugin Tenstorrent) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos con 256 expertos y enrutamiento top-8 más un experto compartido, distribuidos en 40 capas. La innovación principal reside en la combinación de Gated DeltaNet —un mecanismo de atención lineal con estado recurrente— con capas de atención completa con compuertas, lo que reduce el coste computacional en contextos largos manteniendo la capacidad de atención global. Incluye además un codificador de visión que permite entrada de imágenes (hasta 4 por petición, redimensionadas a un máximo de 4 MP en perfiles de dos y cuatro dies).

El checkpoint se distribuye tal cual se publicó desde ornith-ai/Ornith-1.5-35B-A3B; la conversión de precisión de los pesos de expertos ocurre en tiempo de carga del servidor, no en el artefacto. El modelo incorpora decodificación especulativa MTP (multi-token prediction), activada en el perfil de un solo die. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento activado por defecto (el texto de razonamiento se devuelve en el campo `reasoning`, separado de `content`).
- Tool calling y function calling: el servidor usa el parser `qwen3_xml` y devuelve `tool_calls` con `finish_reason: tool_calls`.
- Entrada multimodal de imágenes: hasta 4 imágenes por petición mediante partes `image_url` (perfiles de dos y cuatro dies). No acepta vídeo.
- Razonamiento sobre código y uso agéntico de herramientas, orientado a flujos de programación.
- Caché de prefijo: reanuda desde el último límite de 2.048 tokens compartido con una petición reciente, con 32 puntos de reanudación en cuatro dies y 16 en dos dies.
- Soporte de hasta 32 usuarios concurrentes (`max_num_seqs: 32`).
- Compatibilidad con la API de OpenAI (chat completions, completions, `/v1/models`).
- Capacidades multilingües: no disponible.

## Casos de uso

- **Asistencia agéntica en programación**: el modelo puede gestionar bucles de razonamiento multi-paso con tool calling para editar código, ejecutar tests y consultar documentación, gracias a sus 262.144 tokens de contexto que permiten mantener repositorios completos en memoria.
- **Atención al cliente automatizada**: con 32 secuencias concurrentes y caché de prefijo, varios usuarios pueden compartir un system prompt largo sin re-procesarlo, reduciendo la latencia en conversaciones multi-turno.
- **Análisis de documentos extensos**: la ventana de 262.144 tokens permite procesar informes, contratos o expedientes completos en una sola petición, con reutilización de prefijo si el mismo documento se consulta repetidamente.
- **Razonamiento sobre imágenes en entornos técnicos**: con hasta 4 imágenes por petición, resulta adecuado para interpretar diagramas, capturas de pantalla de errores o gráficos junto a texto explicativo.
- **Despliegue en infraestructura Tenstorrent**: organizaciones con hardware p100, p150 o p300 pueden servir el modelo en local mediante `tt serve`, sin depender de GPUs NVIDIA, con perfiles que escalan desde un solo die hasta cuatro.
- **Pipelines de evaluación y CI**: la API compatible con OpenAI permite integrar el modelo en arneses como lm-evaluation-harness o en flujos de revisión automática de código dentro de CI/CD.
- **Prototipado con licencia permisiva**: la licencia MIT elimina restricciones de uso comercial, lo que facilita incorporar el modelo a productos propietarios sin revisión legal adicional.

## Benchmarks y rendimiento

Evaluación a través de la API de chat servida (perfil p300, pensamiento desactivado, una muestra por pregunta, semilla 42, temperatura 0,6 / top_p 0,95 / top_k 20, lm-evaluation-harness):

| Eval | v1 (paquete anterior) | Este paquete | Referencia (tarjeta de Ornith, pensamiento activado) | Prompts |
|---|---:|---:|---:|---:|
| GPQA-Diamond | — | 0,707 ±0,032 | 0,892 | 198 |
| GPQA-Diamond (primeras 40 preguntas) | 0,775 | 0,675 ±0,074 | — | 40 |
| IFEval prompt-level strict | 0,76 | 0,82 ±0,038 | no reportado | 100 |
| LiveCodeBench v6 | 0,36 | 0,40 ±0,069 | no reportado | 50 |

La columna de referencia se midió con pensamiento activado y el arnés propio de Ornith, por lo que no es directamente comparable con las otras dos.

Acuerdo de token top-1 / top-5 / top-100 con el modelo bf16 de Hugging Face bajo teacher forcing (100 tokens greedy; medido en v1, cuya precisión de expertos mantiene este paquete):

| Perfil | Prompt de chat de código | Prompt de libro de 2.048 tokens |
|---|---|---|
| 4 dies (expertos bfp8) | 0,97 / 1,00 / 1,00 | 0,89 / — / — |

## Requisitos de hardware

- **Hardware soportado**: exclusivamente Tenstorrent p100, p150, p150x2, p150x4, p300 y p300x2. No se documenta soporte para GPU NVIDIA o AMD.
- **Perfiles de servicio**:
  - `p300x2`: cuatro dies, texto e imágenes, el más rápido.
  - `p150x4`: equivalente a `p300x2` sobre cuatro placas p150.
  - `p300` (por defecto): dos dies, texto e imágenes, aproximadamente el 60 % de la velocidad de cuatro dies en un solo usuario.
  - `p150x2`: equivalente a `p300` sobre dos placas p150.
  - `p150`: un die, solo texto, expertos en bfp4, decodificación especulativa MTP activada.
  - `p100`: equivalente a `p150` sobre una p100.
- **VRAM estimada**: no disponible (no aplica; el modelo se sirve en memoria de los aceleradores Tenstorrent).
- **GPU de consumo**: no soportado.
- **Despliegue**: `tt serve raahemnabeel/ornith-1.5-35b-a3b` o `tt-model serve`; requiere Docker y la CLI de Tenstorrent. El servidor expone la API de OpenAI en el puerto 20000.
- **Latencia y throughput**: no se publican cifras absolutas; solo la comparación relativa entre perfiles (el perfil de dos dies rinde aproximadamente el 60 % del de cuatro dies con un solo usuario). La primera puesta en marcha compila kernels y tarda varios minutos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría (MoE de ~35B con ~3B activos).

| Modelo | Parámetros totales / activos | Contexto | Licencia | Hardware |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este paquete) | 35B / 3B | 262.144 | MIT | Tenstorrent p100–p300x2 |
| Ornith-1.5-35B-A3B (original, ornith-ai) | 35B / 3B | 262.144 | MIT | No especificado en la información disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Precisión reducida de expertos**: los pesos de expertos se convierten a bfp8 (cuatro dies) o bfp4 (un die) en tiempo de carga, lo que degrada la fidelidad respecto al modelo bf16 original. El acuerdo top-1 con el modelo bf16 cae al 0,89 en un prompt de libro de 2.048 tokens en el perfil de cuatro dies.
- **Modo de pensamiento activado por defecto**: si el presupuesto de `max_tokens` se agota dentro del razonamiento, el campo `content` llega vacío. Es necesario asignar presupuestos de miles de tokens o desactivar el pensamiento por petición.
- **Dependencia de hardware propietario**: solo funciona en aceleradores Tenstorrent; no hay rutas de despliegue documentadas para GPU convencionales ni para CPU.
- **Sin soporte de vídeo**: la entrada multimodal se limita a imágenes (máximo 4 por petición, 4 MP).
- **Caché de prefijo con coste de memoria**: consume 0,7 GiB del pool KV de cada die en el perfil de cuatro dies.
- **Sesgos y alucinaciones**: no se documentan análisis específicos de sesgo ni tasas de alucinación en la información disponible; como en cualquier modelo generativo, persiste el riesgo de respuestas factualmente incorrectas, especialmente en modo de razonamiento truncado.
- **Idiomas**: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés sin evaluación previa.
- **Licencia**: MIT, sin restricciones conocidas para uso comercial; el modelo base también es MIT según los metadatos.
- **Madurez del paquete**: el repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face de este paquete: https://huggingface.co/raahemnabeel/ornith-1.5-35b-a3b
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Documentación de prerrequisitos de la CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
