# kaushikvira/Qwen3.8-27B-swift15-nvfp4full-dflash2-NInfer-v3

## Resumen

Este artefacto es una conversión de formato y cuantización a NVFP4 del modelo ukisai/Swift-1.5-Qwen3.8-27b, empaquetada en un contenedor nativo v3 del motor de inferencia NInfer. No es un fine-tune propio: el autor (kaushikvira) no ha entrenado pesos, sino que ha cuantizado los pesos BF16 de origen, ha integrado el drafter especulativo DFlash2 de z-lab y ha normalizado los divisores globales para que el motor NInfer pueda servirlo por su ruta A4 nativa. El modelo subyacente, Swift 1.5, es un derivado de post-entrenamiento (RL + OPD) de Qwen/Qwen3.8-27B orientado a tareas agénticas de largo horizonte y a código.

El resultado es un modelo multimodal (image-text-to-text) de la clase 27B con una ventana de contexto de 262.144 tokens que cabe y se sirve en una única RTX 5090 de 32 GB. Eso es posible combinando cuantización NVFP4 W4A4 (18,0 GiB de pesos en VRAM), un pool de KV en dispositivo de 308.736 tokens, una arena de KV fijada en memoria host de 48 GiB y decodificación especulativa DFlash2 con 7 tokens de borrador.

Su relevancia práctica es doble: por un lado demuestra que un modelo de 27B con contexto completo de 256k y visión puede desplegarse en hardware de consumo de gama alta (arquitectura Blackwell); por otro, el autor lo declara su nuevo perfil de producción tras una comparativa A/B en la misma sesión frente a su artefacto anterior basado en Swift-1.0, con mejoras en IFBench y un 8,1 % más de throughput de decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida: capas con proyecciones Q/K/V/O y bloques GDN (delta net con compuerta, proyecciones in_proj_qkv/z/out_proj); 64 capas segun la model card |
| Parametros totales | 27B (denominacion del modelo base Qwen3.8-27B; la model card no desglosa el recuento) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens (configurado con `--max-context 262144` en el ejemplo de serving) |
| Tipos de cuantizacion | NVFP4 W4A4 grupo 16 en proyecciones de texto (256 tensores fusionados); W8G32 en embedding de tokens y head de salida (30 tensores); q4/q5/q6 en vision; BF16 en MTP y DFlash2; KV cache en k8v4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor `.ninfer` version 3 (formato nativo del motor NInfer); no incluye safetensors ni GGUF |
| Tamano del artefacto | 19.782.447.364 bytes (18,42 GiB) |
| SHA-256 | `16f313c043c06a19f7c27d74f8259ed9d86c8cb5beed631efbb96f392b373d96` |
| Objetos almacenados | 1.590 (texto + vision + MTP + DFlash2 + head de propuesta indexada) |
| Model ID en NInfer | `qwen3.8-27b` (se sirve como `Qwen3.8-27B`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B tal como la describe la propia model card del artefacto: 64 capas con proyecciones de atención Q/K/V/O y bloques GDN (Gated Delta Network) con proyecciones `in_proj_qkv`, `z` y `out_proj`. La presencia de un head de visión y la tarea `image-text-to-text` confirman que se trata de un modelo multimodal con torre visual. El artefacto es un contenedor de pesos ya entrenados: el autor no ha realizado ningún ajuste propio, sino exclusivamente conversión de formato y cuantización.

El pipeline de cuantización se ejecutó con `llm-compressor` sobre 512 muestras de calibración de Ultrachat con secuencia 2048, en modo secuencial. Se aplicó NVFP4 W4A4 con grupo 16 a todas las proyecciones de texto (MLP gate/up/down en las 64 capas, atención Q/K/V/O y GDN), se reservó W8G32 para el embedding de tokens y el head de salida, se mantuvo la asignación oficial q6/q8 para visión y se conservó MTP y DFlash2 en BF16. La innovación técnica destacable es la normalización de divisor global: `llm-compressor` emite un `weight_global_scale` por módulo, pero la ruta A4 nativa del motor exige un padre fusionado contiguo por grupo de atención (GDN `qkvz` con 16.384 filas, atención `qkgv` con 14.336 filas). El autor unifica cada grupo a `D = min(dᵢ)` y reescala las escalas de bloque E4M3 por `D/dᵢ` con redondeo a par más cercano y política de solo reducción; para Swift-1.5 el reescalado fue exactamente representable, con un 0,0000 % de error de recodificación en los 272 grupos.

El post-entrenamiento de Swift 1.5 (obra de UkisAI, no de este autor) consiste en RL escalado más OPD sobre Qwen3.8-27B, con foco en tareas agénticas de largo horizonte y de código (mejoras en LiveCodeBench y Terminal-Bench) y con penalización explícita del sobrepensamiento patológico, lo que reduce el consumo de tokens de razonamiento manteniendo la precisión.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento con modo de pensamiento explícito: presupuesto por defecto de 16.384 tokens (`--default-thinking-budget 16384`) y opción de preservar el bloque de pensamiento (`--preserve-thinking`).
- Capacidad multimodal de imagen a texto: el motor arranca con `--vision` y un presupuesto de tokens de imagen de 1.280 por defecto.
- Rendimiento matemático: 95,0 % (190/200) en GSM8K-200 en la evaluación del autor.
- Seguimiento estricto de instrucciones (IFBench): 69,0 en prompt-strict y 70,4 en instr-strict con n=300.
- Codificación y flujos agénticos: el post-entrenamiento de Swift 1.5 está orientado a LiveCodeBench y Terminal-Bench, con penalización del sobrepensamiento para acortar bucles agénticos.
- Recuperación en contexto largo: lectura exacta a 250.031 tokens en tres profundidades distintas.
- Decodificación especulativa con DFlash2 (drafter propio, 7 tokens de borrador, `--lm-head-draft`).
- Concurrencia de servicio: perfil configurado para 4 peticiones simultáneas con contexto completo.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Idiomas soportados: no disponibles.

## Casos de uso

- Agentes de terminal y automatización de tareas de sistema: el post-entrenamiento de Swift 1.5 incide explícitamente en Terminal-Bench y penaliza el sobrepensamiento, lo que acorta los bucles agénticos y reduce el coste por tarea. El presupuesto de pensamiento configurable permite acotar la latencia por paso.
- Asistente de código en producción: con 95,0 % en GSM8K y foco en LiveCodeBench, resulta adecuado para generación y revisión de código en pipelines de CI/CD; conviene verificar antes si el modelo base expone tool calling, ya que no está documentado en este artefacto.
- Análisis de documentos extensos con ventana completa: 262.144 tokens y recall exacto verificado a 250.031 tokens permiten procesar contratos, expedientes o bases de código completas sin trocear en chunks y sin perder referencias cruzadas.
- Atención al cliente multimodal: admite entrada de imagen y texto, lo que permite gestionar consultas con capturas de pantalla, fotos de producto o documentación escaneada manteniendo el hilo conversacional en un contexto largo.
- Procesamiento de documentación técnica con imágenes: el presupuesto de 1.280 tokens de imagen por entrada es suficiente para diagramas, esquemas y capturas de interfaces, útil en documentación de ingeniería y soporte de producto.
- Despliegue local con privacidad de datos: al caber en una sola RTX 5090 con 18,0 GiB de pesos y una arena KV en host de 48 GiB, permite servir el modelo on-premise sin enviar datos a APIs externas.
- Evaluación de conformidad con instrucciones: los resultados de IFBench (hasta 73,6 en instr-loose) lo hacen apto para tareas donde el formato de salida y las restricciones textuales son críticos, como generación de informes estructurados o extracción con plantilla.
- Servicio con concurrencia moderada: el perfil de producción está calibrado para 4 peticiones simultáneas con contexto completo sobre un único acelerador, adecuado para equipos pequeños o entornos de preproducción.

## Benchmarks y rendimiento

Los datos proceden de una comparativa A/B del propio autor, ejecutada en la misma sesión, con el mismo build del motor, generaciones nuevas, temperatura 0, sin reutilización de caché y sobre una única RTX 5090.

| Benchmark | Swift-1.0-abliterated (perfil previo) | Swift-1.5 (este artefacto) | Delta |
|---|---|---|---|
| IFBench prompt-strict (n=300) | 66,3 | 69,0 | +2,7 |
| IFBench prompt-loose | 70,3 | 72,7 | +2,4 |
| IFBench instr-strict | 67,7 | 70,4 | +3,2 |
| IFBench instr-loose | 71,2 | 73,6 | +4,3 |
| GSM8K-200 (exactitud) | 95,5 % (191/200) | 95,0 % (190/200) | −0,5 pp |
| Decodificación de gate (256 tokens) | 148,4–159,0 tok/s | 158,6 tok/s | más rápido |
| Decodificación de rendimiento (media de 3) | 148,7 tok/s | 160,8 tok/s | +8,1 % |
| Prefill a 200k de contexto | 3.260 tok/s | 3.269 tok/s | equivalente |
| Pesos en VRAM | 18,0 GiB | 18,0 GiB | igual |
| Pool de KV en dispositivo (auto) | 308.736 tokens | 308.736 tokens | igual |
| Recall en contexto largo (aguja) | 250.031 tokens EXACT ×3 profundidades | 250.031 tokens EXACT ×3 profundidades (23/24 en total, una respuesta vacía transitoria a 135k) | igual |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandarizados en la información disponible. La diferencia de −0,5 pp en GSM8K con n=200 está dentro del ruido de muestreo según el propio autor, que la etiqueta como tal. El asterisco que acompaña a la fila de instr-strict en la model card original no va seguido del resto de deltas por modo en el texto disponible.

## Requisitos de hardware

- Pesos en VRAM: 18,0 GiB con la cuantización NVFP4 del artefacto.
- Pool de KV en dispositivo: 308.736 tokens con asignación automática (`--kv-capacity auto`), en dtype k8v4.
- Arena de KV en host: 48 GiB fijados en memoria (`--host-kv-mib 49152`), con 16 slots de estado en host (`--host-state-slots 16`).
- GPU recomendada y validada: una RTX 5090 de 32 GB, configuración de referencia del autor. La cuantización NVFP4 W4A4 requiere arquitectura Blackwell, por lo que las generaciones anteriores de consumo (Ada, Ampere) no pueden ejecutar esta ruta tal cual.
- Cabe en GPU de consumo: sí, en una RTX 5090, según la configuración de serving reportada.
- Opciones de despliegue: motor NInfer (`ninfer-serve`) con el contenedor v3. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este formato de pesos.
- Throughput de decodificación: 160,8 tok/s de media en la prueba de rendimiento del autor (7 tokens de borrador especulativo).
- Throughput de prefill: 3.269 tok/s a 200k tokens de contexto.
- Concurrencia: 4 peticiones simultáneas con contexto completo de 262.144 tokens.
- Fragmentación de prefill: 4.096 tokens por chunk (`--prefill-chunk 4096`).
- Muestreo de referencia: temperatura 0,9 y min-p 0,05; `--default-max-tokens 32768` en el perfil publicado.

## Comparativa con modelos similares

| Modelo | Relacion | Formato | IFBench prompt-strict | GSM8K-200 | Decode (tok/s) | Tamano | Licencia |
|---|---|---|---|---|---|---|---|
| kaushikvira/Qwen3.8-27B-swift15-nvfp4full-dflash2-NInfer-v3 (este) | Convertido de Swift-1.5 + NVFP4 + DFlash2 | `.ninfer` v3 | 69,0 | 95,0 % | 160,8 | 18,42 GiB | Apache-2.0 |
| kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3 | Base Swift-1.0 con ablación de rechazo, mismo pipeline | `.ninfer` v3 | 66,3 | 95,5 % | 148,7 | 18,42 GiB | Apache-2.0 |
| kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer-v3 | Variante sin post-entrenamiento Swift | `.ninfer` v3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| ukisai/Swift-1.5-Qwen3.8-27b | Pesos de origen BF16, 18 shards safetensors | safetensors BF16 | no disponible | no disponible | no disponible | no disponible (BF16) | no disponible en la información recogida |

La comparación más informativa es la primera frente a la segunda: mismo motor, misma sesión, mismo hardware y mismo tamaño de artefacto, con mejoras de entre 2,4 y 4,3 puntos en IFBench y un 8,1 % más de throughput de decodificación, a cambio de 0,5 pp en GSM8K dentro del ruido. No se dispone de comparativas con modelos de otros linajes (por ejemplo, otros 27B multimodales) en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no aporta ningún entrenamiento propio: hereda íntegramente los sesgos, las políticas de contenido y las limitaciones de Qwen3.8-27B y del post-entrenamiento de UkisAI. El autor no documenta proceso de alineación adicional.
- No se documenta soporte de tool calling ni de function calling en esta ficha; si el flujo de producción depende de ello, debe verificarse empíricamente antes de adoptarlo.
- Riesgo de alucinación inherente a un modelo de 27B cuantizado a 4 bits en pesos y activaciones; la cuantización W4A4 puede degradar la precisión en tareas sensibles que no aparecen en la comparativa publicada.
- La evaluación publicada es limitada: IFBench (n=300) y GSM8K-200, sin MMLU, HumanEval, MATH ni evaluaciones de seguridad. La diferencia de −0,5 pp en GSM8K con 200 muestras está dentro del margen de error estadístico.
- En la prueba de recall en contexto largo (23/24 en total) se registró una respuesta vacía transitoria a 135k tokens de profundidad, lo que sugiere un posible fallo intermitente en ventanas muy largas.
- El formato `.ninfer` v3 es propietario del motor NInfer (versión mínima `98dada0e`). No es portable a vLLM, llama.cpp, Ollama ni TGI, lo que crea dependencia de un único motor mantenido por un solo desarrollador.
- Requiere arquitectura Blackwell por la ruta NVFP4 W4A4; no es desplegable en GPUs de consumo anteriores sin reconvertir el modelo.
- La licencia declarada es Apache-2.0, pero la información de la cadena de procedencia (Swift-1.5, DFlash2, Qwen3.8-27B) conviene verificarla extremo a extremo antes de un uso comercial, ya que el artefacto combina pesos de tres autores distintos.
- Idiomas soportados no declarados: no puede asumirse cobertura multilingüe sin prueba propia.
- El artefacto tiene 0 descargas y 2 likes en el momento de la consulta, y la model card marca `inference: false`; la validación externa es prácticamente nula más allá de las pruebas del propio autor.
- El perfil de serving publicado usa temperatura 0,9 y min-p 0,05, valores pensados para uso conversacional; para tareas deterministas hay que ajustarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaushikvira/Qwen3.8-27B-swift15-nvfp4full-dflash2-NInfer-v3
- Artefacto predecesor basado en Swift-1.0: https://huggingface.co/kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3
- Variante sin post-entrenamiento Swift: https://huggingface.co/kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer-v3
- Pesos de origen (BF16, 18 shards): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter especulativo DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor de inferencia NInfer: https://github.com/Neroued/ninfer
- Discusión del motor sobre los artefactos v3 de la comunidad: https://github.com/Neroued/ninfer/discussions/317
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Linaje de serving previo (Swift-Qwen3.8-27b): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Variante sin censura de la comunidad (d0xin): https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Ficha de terceros con metadatos del artefacto: https://savrn.com/models/qwen3-8-27b-nvfp4full-dflash2-ninfer-v3
