# osdi/audnai-penclaw-GLM-5.3-abliterated

## Resumen

Warlock (audnai-penclaw-GLM-5.3-abliterated) es una versión *abliterated* del modelo GLM-5.3, publicada por el usuario osdi en Hugging Face y producida por el equipo de Audn. No se trata de un reentrenamiento ni de un fine-tuning, sino de una edición directa de los pesos: se aísla la dirección interna que el modelo utiliza para decidirse a rechazar peticiones y se proyecta fuera de los escritores del residual stream, capa a capa. El resultado es un modelo que conserva el perfil completo de capacidades, conocimiento y fluidez del original, pero que responde donde el modelo base se negaría.

El modelo pertenece a la familia GLM con arquitectura MoE y decodificación de atención dispersa (tag `glm_moe_dsa`), con 753.330 millones de parámetros totales según los metadatos de safetensors. Es un modelo de tipo *thinking*: razona de forma extensa antes de responder, por lo que requiere presupuestos de generación amplios (16k tokens o más). Su tamaño de repositorio, 1506,7 GB en BF16, lo sitúa claramente en el segmento de despliegue multi-GPU en centros de datos.

Su relevancia actual radica en el ámbito de la investigación en seguridad: al eliminar el comportamiento de rechazo sin degradar las capacidades, se presenta como herramienta para *red teaming* autorizado, evaluación de salvaguardas y estudio de la robustez de los mecanismos de alineamiento. No obstante, su naturaleza *uncensored* exige un uso responsable y conforme a la ley.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM MoE con decodificación de atención dispersa (glm_moe_dsa) |
| Parametros totales | 753.329.940.480 (~753,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (bfloat16); no se publican versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar términos concretos en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3, una arquitectura transformer de tipo mezcla de expertos (MoE) con decodificación de atención dispersa (DSA, según el tag `glm_moe_dsa`), lo que sugiere mecanismos de atención que reducen el coste computacional en contextos largos. Los datos concretos sobre número de expertos, parámetros activos por token o longitud de ventana de contexto no están disponibles en la información proporcionada.

En cuanto a entrenamiento, este derivado no incorpora ninguno: la abliteración es una intervención pura a nivel de pesos. El procedimiento identifica la dirección latente asociada al rechazo (mediante comparación de activaciones en peticiones que el modelo acepta frente a las que rechaza) y la ortogonaliza fuera de todos los pesos que escriben en el residual stream, iterando capa por capa. La model card documenta un programa de investigación con al menos dos iteraciones (iter4 e iter11), donde iter11 alcanzó un 85 % de no-rechazo (medido con el criterio de subcadena de Arditi) manteniendo la coherencia intacta, con unos 8/40 casos fronterizos. Al no haber fine-tuning ni RLHF adicional, el perfil de capacidades del modelo base GLM-5.3 se conserva íntegro.

## Capacidades

- Generación de texto conversacional con razonamiento extenso previo a la respuesta (modelo *thinking*).
- Conserva el perfil completo de capacidades del GLM-5.3 base: razonamiento, conocimiento y fluidez, sin degradación por la abliteración.
- Comportamiento de rechazo eliminado a nivel de pesos: responde a peticiones que el modelo original rehusaría, sin necesidad de prompts del sistema, adaptadores ni andamiaje en tiempo de ejecución.
- Carga y servicio estándar: compatible con `transformers`, `vLLM` y `sglang` sin modificaciones.
- Uso previsto declarado: *red teaming* autorizado, investigación en seguridad y evaluación de sistemas.
- Integración con el CLI audncode de Audn y disponibilidad vía API de pago en platform.audn.ai y audn.ai/necromicon.
- Datos sobre tool calling, agentes, capacidades multimodales o soporte multilingüe: no disponibles.

## Casos de uso

- **Red teaming de sistemas de IA autorizado**: permite probar salvaguardas de otros sistemas y pipelines de moderación contra un modelo que no rechaza peticiones sensibles, útil para auditar la robustez de filtros de entrada y salida.
- **Investigación en alineamiento y seguridad**: al ser una edición de pesos que elimina la dirección de rechazo, sirve como sujeto de estudio para entender cómo codifican los modelos su comportamiento de negación y cómo de frágiles son los mecanismos de alineamiento.
- **Evaluación comparativa de abliteraciones**: los resultados del Audn Refusal Benchmark (92,5 % de no-rechazo, 82,5 % de delivery) permiten comparar técnicas de abliteración frente a alternativas como necromicon standard o KIMI-K3-1M en un marco común con juez LLM.
- **Generación de datasets adversariales para investigación**: puede emplearse en entornos controlados para producir ejemplos de respuestas a peticiones problemáticas con los que entrenar y calibrar clasificadores de seguridad.
- **Estudio de coherencia tras intervenciones de pesos**: la documentación de iteraciones (iter4 frente a iter11) ofrece un caso práctico para analizar cómo distintas intensidades de abliteración afectan a la coherencia y a la tasa de respuestas útiles.
- **Despliegue como modelo de referencia sin filtros en entornos aislados**: al cargar con vLLM o sglang como un modelo estándar, puede integrarse en infraestructuras de evaluación air-gapped para pruebas de seguridad sin dependencias externas.

## Benchmarks y rendimiento

Resultados del **Audn Refusal Benchmark** (thinking activado, temperature 1.0, presupuesto de 16k tokens, delivery evaluado por juez LLM):

| Metric | Warlock |
|---|---:|
| Non-refusal | 92,5 % |
| Delivery | 82,5 % |

Comparativa extendida sobre un conjunto de 520 prompts (según FINDINGS.md del repositorio del benchmark):

| Metric | necromicon standard (Modal K3REL) | KIMI-K3-1M (audn.ai/necromicon) | Warlock |
|---|---:|---:|---:|
| Regex comply | 96,7 % (503/520) | 97,1 % (505/520) | 92,5 % |
| DELIVERED | 65,0 % (338) | 76,7 % (399) | 82,5 % |
| DEFLECTED | 19,6 % (102) | 17,5 % (91) | 10,0 % |
| REFUSED (sustantivo) | 15,0 % (78) | 5,8 % (30) | 7,5 % |
| Vacíos (regex) | 5 | 0 | 0 |

Resultados de las iteraciones de investigación internas:

| Metric | iter4 | iter11 |
|---|---:|---:|
| Non-refusal (criterio Arditi) | 70 % | 85 % |
| Delivery (juez necromicon) | 37,5 % | 35,0 % |
| Coherencia | intacta | intacta (~8/40 fronterizos) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753,3 B de parámetros en BF16, se requieren aproximadamente 1,5 TB de memoria de GPU (coherente con los 1506,7 GB del repositorio), lo que implica un despliegue multi-nodo o multi-GPU de gama alta.
- GPU recomendadas: no disponible de forma explícita; por ordenadores de memoria, se necesitarían del orden de 20-24 GPUs de 80 GB (A100/H100 80 GB) en configuración tensor-parallel o expert-parallel.
- Consumer GPUs: no es viable en ninguna GPU de consumo; el modelo excede con mucho la capacidad de tarjetas como la RTX 4090 (24 GB) incluso con cuantización agresiva, y no se publican versiones cuantizadas.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True` y `device_map="auto"`), `vLLM` y `sglang`. También está disponible como API de pago en platform.audn.ai y audn.ai/necromicon, así como mediante el CLI audncode.
- Latencia y throughput estimados: no disponibles. Dado su carácter de modelo *thinking*, conviene configurar presupuestos de generación de 16k tokens o más para evitar truncamientos dentro del bloque de razonamiento.

## Comparativa con modelos similares

| | Warlock (GLM-5.3 abliterated) | necromicon standard (Modal K3REL) | KIMI-K3-1M |
|---|---|---|---|
| Parametros | ~753,3 B | no disponible | no disponible |
| Tipo | Abliteración por edición de pesos | Modelo abliterated/unfiltered | Modelo abliterated/unfiltered |
| Regex comply (520 prompts) | 92,5 % | 96,7 % | 97,1 % |
| DELIVERED | 82,5 % | 65,0 % | 76,7 % |
| REFUSED | 7,5 % | 15,0 % | 5,8 % |
| Licencia | other (sin detalle) | no disponible | no disponible |
| Disponibilidad | Hugging Face (safetensors, BF16) + API de pago | API (audn.ai/necromicon) | API (audn.ai/necromicon) |

Warlock destaca por su tasa de entrega de contenido real (82,5 %), superior a las dos alternativas referenciadas, aunque con una tasa de cumplimiento por regex ligeramente inferior. No se conocen alternativas abliterated de la familia GLM-5.3 de otros autores en la información disponible.

## Limitaciones y advertencias

- **Naturaleza uncensored**: el modelo responde a peticiones que otros modelos rechazan, incluido contenido objetable. Su uso está previsto para red teaming autorizado e investigación de seguridad; el usuario es responsable del cumplimiento legal y ético de su empleo.
- **Riesgo de alucinación**: no disponible como dato específico; al conservar intactas las capacidades del modelo base, cabe asumir el mismo riesgo de alucinación que GLM-5.3, del que no se publican métricas.
- **Modelo thinking con presupuesto de generación**: un presupuesto inferior a 16k tokens puede truncar la respuesta dentro del bloque de razonamiento, dejando respuestas incompletas.
- **Tamaño y coste**: con ~1,5 TB de pesos en BF16 y sin versiones cuantizadas publicadas, el autoalojamiento exige infraestructura multi-GPU de centro de datos, fuera del alcance de la mayoría de equipos.
- **Licencia ambigua**: la licencia figura como "other" sin términos detallados en la model card; las restricciones para uso comercial no están claras y deben verificarse antes de cualquier despliegue productivo.
- **Idiomas y contexto no documentados**: ni los idiomas soportados ni la longitud de contexto están especificados, lo que dificulta planificar cargas de trabajo multilingües o de documentos largos.
- **Residuos de rechazo**: incluso tras la abliteración, un 7,5 % de peticiones sustanciales siguen siendo rechazadas y un 10 % se desvían, por lo que no garantiza cumplimiento absoluto.
- **Procedencia del derivado**: se trata de una edición de pesos de terceros sobre GLM-5.3, sin auditoría independiente publicada de estabilidad o coherencia a gran escala más allá de las métricas del propio Audn.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osdi/audnai-penclaw-GLM-5.3-abliterated
- Audn Refusal Benchmark (GitHub): https://github.com/audn-ai/refusal-benchmark
- Resultados extendidos del benchmark (FINDINGS.md): https://github.com/audn-ai/refusal-benchmark/blob/main/FINDINGS.md
- Web de Audn: https://audn.ai
- API de pago: https://platform.audn.ai
- Necromicon: https://audn.ai/necromicon
