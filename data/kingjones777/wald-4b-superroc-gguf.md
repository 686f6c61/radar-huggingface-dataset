# kingjones777/Wald-4B-SuperRoc-GGUF

## Resumen

Wald-4B-SuperRoc-GGUF es una cuantización en formato GGUF del modelo org2ai/Wald-4B, publicada por el usuario kingjones777. Se trata de una versión optimizada específicamente para ejecutarse con Super Roc, un motor de inferencia local orientado al hardware Strix Halo (APU AMD Ryzen AI Max+ 395, arquitectura gráfica gfx1151). El modelo emplea el formato de cuantización ROCm-FP4, una variante de 4 bits desarrollada por el equipo ROCmFPX sobre las bases de llama.cpp/ggml.

El modelo base cuenta con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) y está orientado a tareas conversacionales. La cuantización publicada ocupa 2,51 GB en disco y mantiene una perplejidad de 9,55 en wikitext-2, muy cercana a la del Q4_K_M estándar del mismo modelo (9,49), lo que indica una degradación mínima por la cuantización ROCm-FP4.

Su relevancia radica en que demuestra la viabilidad de ejecutar modelos de 4B con contexto de hasta 131.072 tokens en hardware de consumo basado en APU AMD, con velocidades de generación medidas de 81 a 139 tokens por segundo y soporte de tool calling. Es un artefacto de nicho, ligado a un motor y una plataforma concretos, más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base org2ai/Wald-4B; transformer presumiblemente, sin confirmar) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (cargados y medidos con Super Roc) |
| Tipos de cuantizacion | ROCm-FP4 (Q4_0-ROCmFP4-FAST-imatrix); el modelo base admite otras cuantizaciones GGUF no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero Wald-4B-Q4_0-ROCmFP4-FAST-imatrix.gguf, 2,51 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base org2ai/Wald-4B en la documentación proporcionada. El dato verificable es el recuento de parámetros (4.326.350.848) y la orientación conversacional del modelo. La model card no especifica si se trata de un transformer denso, un modelo híbrido o si emplea mezcla de expertos, ni detalla el volumen de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta publicación no reside en el entrenamiento, sino en la cuantización: el formato ROCm-FP4, derivado del trabajo de ROCmFPX sobre llama.cpp/ggml, permite pesos de 4 bits optimizados para la ruta ROCm en GPUs integradas AMD. La cuantización se generó con la técnica imatrix (importance matrix), que calibra la pérdida de precisión por capa. El resultado es una perplejidad de 9,55 frente a 9,49 del Q4_K_M estándar, una diferencia de 0,06 puntos que sugiere una fidelidad prácticamente equivalente pese al formato más agresivo. El modelo soporta un modo de razonamiento (thinking) que se activa por petición mediante `chat_template_kwargs.enable_thinking`.

## Capacidades

- Generación de texto conversacional multi-turno, según la orientación declarada del modelo.
- Modo de razonamiento (thinking) activable por petición mediante `chat_template_kwargs.enable_thinking`.
- Tool calling / function calling: la model card reporta 7/8 aciertos en modo required y 7/8 en modo auto sobre el conjunto de pruebas del autor.
- Soporte de contexto largo: 131.072 tokens cargados y medidos, con caché de prompt eficiente (6.955 de 6.979 tokens reutilizados en el segundo turno).
- Generación de código: se midió a 139,6 tok/s de media sobre dos prompts de código.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el cliente Lemonade.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local en APU AMD Strix Halo: el modelo se ejecuta íntegramente en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, sin GPU dedicada, gracias al formato ROCm-FP4 y al motor Super Roc. Adecuado para prototipos de asistentes privados en hardware de sobremesa.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, permite resumir o consultar contratos, informes o bases de código extensas en una sola pasada, manteniendo la caché de prompt entre turnos para reducir el coste de reprocesamiento.
- Automatización con tool calling: los 7/8 aciertos medidos en modo required y auto lo hacen utilizable en flujos donde el modelo debe invocar funciones (consultas a APIs, operaciones sobre ficheros) dentro de un agente sencillo.
- Generación de código en local: a 139,6 tok/s en prompts de código, resulta viable para autocompletado y generación de fragmentos en entornos de desarrollo sin conexión a la nube.
- Despliegue vía Lemonade: la integración documentada (`lemonade pull Wald-4B`, `lemonade chat Wald-4B`) permite montar un chat local con una configuración mínima, útil para demos y evaluación interna.
- Evaluación de cuantizaciones ROCm-FP4: sirve como referencia para comparar la calidad (perplejidad 9,55 frente a 9,49 del Q4_K_M) y el rendimiento de este formato frente a cuantizaciones GGUF convencionales en hardware AMD.
- Servicio local con API compatible con OpenAI: el comando `superroc serve` expone el modelo en `127.0.0.1:8080` con nombre servido `wald-4b`, lo que facilita integrarlo en aplicaciones existentes que ya consumen APIs de tipo OpenAI.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad wikitext-2 (ROCm-FP4) | 9,55 |
| Perplejidad wikitext-2 (Q4_K_M del mismo modelo) | 9,49 |
| Tiempo de carga | 2 s |
| Prompt tok/s (p1k) | 3212,1 |
| Prompt tok/s (p8k) | 3297,6 |
| Generación tok/s (p1k) | 81,17 |
| Generación tok/s (p8k) | 137,03 |
| Generación de código tok/s | 139,6 (media de 2 prompts) |
| Tool calls (required / auto) | 7/8 / 7/8 |
| Caché de prompt, turno 2 (cacheado / total) | 6955 / 6979 tokens |
| Contexto cargado | 131.072 tokens |
| Drafter (decodificación especulativa) | desactivado |

Mediciones realizadas en un Ryzen AI Max+ 395 con 128 GB, Super Roc 0.20.0 (release candidate), una petición simultánea, el 2026-11-23. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el fichero GGUF ocupa 2,51 GB; con contexto de 131.072 tokens la memoria adicional para la caché KV no está cuantificada en la documentación, pero el conjunto se ejecutó en un sistema con 128 GB de memoria unificada.
- GPU/plataforma recomendada: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151). Es el hardware para el que se construyó y midió el modelo.
- GPU de consumo: no se documenta compatibilidad con GPUs NVIDIA o AMD discretas; el formato ROCm-FP4 y el motor Super Roc están orientados a la ruta ROCm de Strix Halo.
- Opciones de despliegue: Super Roc (`superroc serve`) y Lemonade (configurando `llamacpp.rocm_bin=/opt/superroc/lemonade`). No se documenta soporte con vLLM, TGI, Ollama o llama.cpp estándar para este fichero concreto.
- Latencia y throughput: 2 s de carga; 81,17 tok/s de generación con prompt de 1k y 137,03 tok/s con prompt de 8k; 3212-3298 tok/s de procesamiento de prompt; 139,6 tok/s en generación de código. Medido con una sola petición concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Wald-4B-SuperRoc-GGUF | 4,3B | 131.072 | ROCm-FP4 (2,51 GB) | Apache 2.0 | Strix Halo / Super Roc |
| Wald-4B (Q4_K_M) | 4,3B | no disponible | Q4_K_M | Apache 2.0 (modelo base) | llama.cpp genérico |
| Otros modelos ~4B GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más fiable es con la cuantización Q4_K_M del mismo modelo base: perplejidad de 9,55 frente a 9,49 y un tamaño de 2,51 GB para el fichero ROCm-FP4. No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Nicho de hardware: el modelo está construido y probado exclusivamente para Strix Halo (gfx1151) con el motor Super Roc; no hay evidencia de funcionamiento en otras plataformas.
- Dependencia de un motor propietario del ecosistema: requiere Super Roc 0.20.0 o compatible; no se documenta su uso con llama.cpp, Ollama, vLLM o TGI estándar.
- Rendimiento medido con una sola petición concurrente: no hay datos de throughput bajo carga concurrente ni de latencia en producción multiusuario.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe.
- Arquitectura y datos de entrenamiento no disponibles: dificulta evaluar sesgos, composición del dataset y riesgos de alucinación del modelo base.
- Tool calling con 7/8 aciertos: existe un 12,5 % de fallos en las pruebas del autor, insuficiente para flujos críticos sin validación externa.
- Perplejidad ligeramente superior al Q4_K_M (9,55 frente a 9,49): degradación mínima pero medible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base org2ai/Wald-4B, de la que depende.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación muy limitado, sin evidencia de uso independiente.
- Riesgo de alucinación: no cuantificado en la documentación; aplicable el riesgo habitual de modelos de 4B en tareas de razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Wald-4B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/org2ai/Wald-4B
- Repositorio de Super Roc: https://github.com/kingjones30/superroc
- Documentación de integración con Lemonade: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Proyecto ROCmFPX: https://github.com/charlie12345/ROCmFPX
