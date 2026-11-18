# IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

MiniCPM-V-4.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF es una cuantización comunitaria del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario IsValorum. Se trata de la primera variante de la serie MiniCPM-V con arquitectura de mezcla de expertos (MoE), combinando procesamiento de imagen, vídeo y texto con un total de 34.659.889.792 parámetros. El modelo original lo desarrolla OpenBMB y esta versión GGUF está pensada para su ejecución en llama.cpp, incluyendo un proyector multimodal independiente (`mmproj-Q8_0.gguf`) para preservar la fidelidad del razonamiento visual.

La relevancia de esta publicación radica en su esquema de cuantización selectiva denominado APEX-I MiniPlus V2.1, que asigna precisión distinta a cada componente del modelo (por ejemplo, routers MoE en F32, estados recurrentes Gated DeltaNet en F32 y expertos enrutados en Q3_K/IQ3_XXS). Este enfoque busca minimizar la degradación en tareas agénticas y de invocación de herramientas, algo crítico en modelos MoE multimodales.

La model card reporta resultados en el benchmark comunitario Shortbench / NanoBench v0.5.0 sobre una RTX 4070 de 12 GB, con puntuaciones del 89,6 % y 95,8 % (8/12 y 10/12 tareas resueltas) y tiempos de finalización de 6,5 y 7,6 minutos. La licencia declarada es Apache 2.0 y el repositorio ocupa 45,6 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (vision + texto + video) con capas de atención completa periódicas y estados recurrentes Gated DeltaNet; pesos en formato GGUF |
| Parametros totales | 34.659.889.792 (≈34,66 B) |
| Parametros activos | no disponible (el nombre del modelo indica "A3B", es decir, aproximadamente 3 B activos, pero la cifra exacta no se detalla en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla selectiva por tensor: Q6_K (output), Q4_K (token_embd y Q/K/V de capas de atención completa), F32 (normalizaciones, routers MoE `ffn_gate_inp` y estados Gated DeltaNet), Q5_K (expertos compartidos `shexp`), Q3_K (expertos enrutados en capas 0-9 y 30-39), IQ3_XXS (expertos enrutados en capas 10-29); proyector multimodal en Q8_0 |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj-Q8_0.gguf` separado para el proyector multimodal |

## Arquitectura y entrenamiento

El modelo base es MiniCPM-V 4.7 35B-A3B de OpenBMB, descrito en la model card como el primer modelo multimodal con arquitectura de mezcla de expertos de la serie MiniCPM-V. La arquitectura combina capas de atención completa periódicas (capas 3, 7, 11, ..., 39) con estados recurrentes Gated DeltaNet, lo que se refleja en los tensores `ssm_a`, `ssm_conv1d`, `ssm_dt` y `ssm_norm` protegidos en F32 durante la cuantización. El modelo incorpora además expertos compartidos (`shexp`) y routers MoE (`ffn_gate_inp`) por capa.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card de esta cuantización se centra en el esquema de asignación de precisión por tensor (733 tensores en total) y en la inclusión del proyector multimodal Q8_0, que evita la degradación de tokens visuales. No se documentan innovaciones adicionales de decodificación especulativa ni de atención lineal más allá de los estados recurrentes mencionados.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y razonamiento visual (pipeline `image-text-to-text`).
- Procesamiento de vídeo, según las etiquetas del repositorio.
- Ejecución de tareas agénticas con invocación de herramientas y generación de payloads estructurados, incluyendo Python, según los resultados de Shortbench / NanoBench.
- Soporte multilingüe en diez idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés y coreano.
- Compatibilidad con `llama.cpp` mediante la CLI `llama-minicpmv-cli` y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Orientación a despliegue on-device (etiqueta `on-device`).

## Casos de uso

- Asistencia visual en el escritorio: el modelo puede describir imágenes locales pasadas a `llama-minicpmv-cli` con `--image`, útil para accesibilidad o catalogación de fotos sin enviar datos a la nube.
- Agente de codificación autónomo: los resultados de Shortbench indican que resuelve tareas de ingeniería de software y pipelines generando código Python y llamadas a herramientas; encaja en flujos agénticos tipo "Pi Agent" sobre hardware de consumo.
- Análisis de vídeo y documentos escaneados: al aceptar entradas de vídeo e imagen, sirve para extraer información estructurada de grabaciones o capturas en pipelines de procesamiento por lotes.
- Atención al cliente multimodal: permite gestionar conversaciones multi-turno donde el usuario adjunta capturas de pantalla o fotos de productos, con soporte en español y otros nueve idiomas.
- Automatización de tareas de sistema en estaciones de trabajo: con 12 GB de VRAM es viable ejecutarlo junto a un agente que invoque herramientas del sistema operativo, como demuestra la ejecución verificada en una RTX 4070.
- Prototipado e investigación en visión-lenguaje: al ser una cuantización de un MoE multimodal con licencia Apache 2.0, facilita experimentos de evaluación de cuantización y de robustez visual sin infraestructura de centro de datos.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, los datos de imagen y texto no salen del equipo, lo que resulta adecuado para sectores regulados.

## Benchmarks y rendimiento

Resultados reportados en la model card para Shortbench / NanoBench v0.5.0 (12 tareas objetivas de ingeniería de software, pipelines e integridad de sistema), ejecutados por el miembro de la comunidad @derFusel en una RTX 4070 (12 GB), i7-14700K y 32 GB de RAM:

| Ejecucion | Puntuacion total | Tareas resueltas | Tiempo | Entorno |
|---|---|---|---|---|
| MiniCPM-V-4.7 MiniPlus (compacted) | 95,8 % | 10 / 12 | 7,60 min | RTX 4070 (12 GB), agente `Pi`, compactado |
| MiniCPM-V-4.7 MiniPlus | 89,6 % | 8 / 12 | 6,50 min | RTX 4070 (12 GB), agente `Pi` |

La model card afirma que es el tiempo de finalización más rápido registrado entre los modelos de 35B evaluados en Shortbench, aunque no se aportan comparaciones numéricas con otros modelos en la información disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 45,6 GB, aunque la carga en memoria depende de la configuración de offload de capas y del tamaño efectivo de los tensores en cada nivel de cuantización.
- GPU verificada: NVIDIA GeForce RTX 4070 de 12 GB, con resultados funcionales en el benchmark citado (probablemente con offload parcial a RAM del sistema).
- GPU recomendadas: no especificadas en la información disponible; por el tamaño del repositorio, se espera que requiera GPUs de gama alta (A100, H100) o configuraciones con offload para consumer.
- Cabe en consumer GPU: sí, al menos en una RTX 4070 de 12 GB según la ejecución verificada, aunque no se detalla la proporción de capas descargadas a CPU.
- Opciones de despliegue: `llama.cpp` mediante `llama-minicpmv-cli`; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de endpoints, pero no se detallan otras herramientas como vLLM, Ollama o TGI.
- Latencia y throughput: tiempos de 6,5 a 7,6 minutos para 12 tareas agénticas en la configuración citada; no se aportan tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-APEX-I-MiniPlus-V2.1 (esta ficha) | ≈34,66 B (MoE, ≈3 B activos según nombre) | no disponible | 95,8 % / 89,6 % en Shortbench v0.5.0 (12 tareas) | Apache 2.0 | GGUF en Hugging Face |
| openbmb/MiniCPM-V-4.7-35B-A3B (modelo base) | ≈34,66 B | no disponible | no disponible | Apache 2.0 (según el repositorio derivado) | Pesos originales en Hugging Face |
| Otras cuantizaciones GGUF del mismo modelo base | ≈34,66 B | no disponible | no disponible | Apache 2.0 | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de contexto para modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparativa cuantitativa con alternativas queda limitada.

## Limitaciones y advertencias

- Es una cuantización comunitaria no oficial: la calidad puede diferir del modelo base y no está avalada por OpenBMB.
- La asignación agresiva de precisión (Q3_K e IQ3_XXS en expertos enrutados) puede degradar tareas sensibles a la precisión numérica, aunque el esquema protege routers y estados en F32.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos específicos de tasa de alucinación.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en ventanas largas.
- El rendimiento reportado proviene de un benchmark comunitario (Shortbench / NanoBench v0.5.0) con 12 tareas y una única configuración de hardware; no debe generalizarse sin validación propia.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos originales de OpenBMB.
- El uso en producción requiere validar el comportamiento del proyector multimodal Q8_0 con imágenes y vídeos propios, así como la estabilidad de la CLI de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Benchmark Shortbench / NanoBench: https://shortbench.vercel.app/
- Ejecución verificada 2a1b0ff3: https://shortbench.vercel.app/runs/2a1b0ff3-40e8-4a27-abae-c9455299022f
- Ejecución verificada 9fe7781b: https://shortbench.vercel.app/runs/9fe7781b-0e59-4d6f-b283-9aa73b95104e
- Perfil del autor del benchmark: https://huggingface.co/derFusel
- Apoyo al autor de la cuantización: https://ko-fi.com/isvalorum
