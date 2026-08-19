# Ishowbackup/LING-3.0-FLASH-ABLITERATED

## Resumen

LING-3.0-FLASH-ABLITERATED es una modificación no oficial del modelo Ling-3.0-flash de InclusionAI, publicada por el usuario Ishowbackup. El modelo base es un MoE híbrido de 127B parámetros totales y aproximadamente 5,1B activos, con atención híbrida (multi-head latent + gated-linear) y una arquitectura denominada BailingMoeV3ForCausalLM. La variante abliterated aplica una intervención a nivel de pesos para reducir la superficie de rechazo (refusal surface) del modelo original, de modo que coopere con solicitudes técnicas y de doble uso que el checkpoint base rechaza. No se ha realizado ningún post-entrenamiento adicional (ni SFT, DPO ni RLHF); solo se ha intervenido la dirección de rechazo en el espacio de pesos.

La relevancia de este modelo radica en su utilidad para entornos de investigación en seguridad, red-teaming y pruebas adversariales, donde un modelo con menos filtros de rechazo permite explorar escenarios que el modelo original bloquearía. Sin embargo, esto conlleva riesgos importantes: no es un modelo de seguridad y no debe desplegarse como tal. La licencia es MIT, lo que permite uso comercial, pero el propio autor advierte que está pensado para entornos controlados con control de acceso y registro. El contexto nativo es de 128K tokens (según la model card) o 256K (según la documentación oficial de InclusionAI), extendible hasta 1M con YaRN. No se han publicado benchmarks de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3ForCausalLM · atención híbrida (multi-head latent + gated-linear) · mixture-of-experts |
| Parametros totales | 127.486.384.608 (~127B) |
| Parametros activos | ~5,1B |
| Longitud de contexto | 128K nativo (según model card) · 256K nativo (según documentación oficial de InclusionAI) · hasta 1M con YaRN |
| Tipos de cuantizacion | BF16 (pesos originales); existen cuantizaciones GGUF de terceros (p. ej. SC117/Ling-3.-flash-abliterated-APEX-GGUF) |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (52 shards, ~238 GiB en disco) |

## Arquitectura y entrenamiento

Ling-3.0-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 42 capas (más 1 capa MTP, multi-token prediction) y un tamaño oculto de 2.560. El MoE consta de 512 expertos enrutados, 1 experto compartido y las 2 primeras capas son densas. La atención es híbrida: combina atención de latente multi-cabeza (MLA) con capas lineales gated. Esta arquitectura está diseñada para reducir el coste computacional manteniendo capacidad de razonamiento de largo contexto. El modelo original fue entrenado por InclusionAI con datos en inglés y chino, aunque los detalles exactos del dataset y el número de tokens no se especifican en la información disponible. La variante abliterated no ha recibido ningún entrenamiento adicional; solo se ha aplicado una intervención direccional sobre los pesos para eliminar o reducir el comportamiento de rechazo. El autor indica explícitamente que no se usó SFT, DPO ni RLHF, y que el formato y la disposición del MoE siguen al checkpoint padre.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés y chino.
- Razonamiento de largo contexto gracias a la ventana de 128K/256K tokens nativos, con extensión hasta 1M mediante YaRN.
- Soporte de tool calling y parsing de razonamiento (el autor recomienda usar los parsers `ling3` de SGLang para tool calling y reasoning).
- Decodificación especulativa mediante el algoritmo NEXTN (compatible con SGLang).
- Capacidad de seguir instrucciones complejas y mantener coherencia en tareas multi-turno.
- Al estar abliterado, responde a solicitudes técnicas de doble uso (desarrollo de exploits, análisis de malware, herramientas ofensivas, investigación de vulnerabilidades) que el modelo base rechazaría.
- No se ha verificado soporte multimodal, de audio ni de visión en la información disponible.

## Casos de uso

- Investigación en ciberseguridad: el modelo puede asistir en análisis de vulnerabilidades, revisión de código de exploits y comprensión de técnicas de ataque, tareas que el modelo base rechazaría por defecto. Su ventana de contexto larga permite procesar repositorios completos o trazas de red extensas.
- Red-teaming de modelos de IA: se puede usar para generar prompts adversariales y evaluar la robustez de otros sistemas frente a intentos de jailbreak, gracias a su menor superficie de rechazo.
- Desarrollo de herramientas ofensivas en entornos controlados: el modelo puede generar código para pruebas de penetración, scripts de explotación y análisis de malware, siempre bajo políticas de uso responsable y en laboratorios aislados.
- Análisis forense digital: con su contexto de 128K tokens, puede procesar logs extensos, artefactos de memoria o volcados de disco para identificar patrones maliciosos.
- Evaluación de seguridad de modelos: al comparar las respuestas de este modelo con las del base, se puede medir el impacto de la intervención de rechazo y calibrar métricas de seguridad.
- Generación de contenido técnico especializado: documentación sobre técnicas de hacking ético, hardening de sistemas o análisis de exploits, donde el modelo no se autocensura.
- Investigación académica en seguridad informática: para estudiar el comportamiento de modelos abliterados y sus implicaciones en la alineación y la seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones de rechazo y capacidades están pendientes, y que se ejecutarán bajo el protocolo R1-HARMFUL-BENCH (AdvBench + StrongREJECT + XSTest) con un juez de texto completo. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 255 GB (238 GiB en disco), por lo que se requiere un nodo con al menos 4 GPU de clase B200 (sm100) o equivalente con memoria alta (por ejemplo, 4×H100 de 80 GB no serían suficientes; se necesitan GPU con 96 GB o más, o bien 8×H100 de 80 GB).
- GPU recomendadas: NVIDIA B200 (sm100) o similar con 192 GB de memoria; también podrían usarse 8×H100 80GB en configuración multi-GPU con tensor parallelism.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.) en BF16; se requerirían cuantizaciones agresivas (GGUF Q4, Q5) que reducirían la calidad y aun así necesitarían varios dispositivos.
- Opciones de despliegue: SGLang con soporte `bailing_moe_v3` (imagen `lmsysorg/sglang:dev-Ling-3.0-flash`), usando tensor parallelism (tp=4), decodificación especulativa NEXTN y parsers `ling3` para razonamiento y tool calling. También es posible usar vLLM si soporta la arquitectura, aunque no se ha confirmado.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño y la activación de solo ~5,1B parámetros, el throughput puede ser razonable en hardware adecuado, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto nativo | Licencia | Notas |
|---|---|---|---|---|---|
| LING-3.0-FLASH-ABLITERATED | ~127B | ~5,1B | 128K (según card) / 256K (según InclusionAI) | MIT | Modificación abliterated, sin benchmarks |
| Ling-3.0-flash (base) | ~124B | ~5,1B | 256K (extensible a 1M) | MIT | Modelo original, con rechazo estándar |
| Ling-lite | 16,8B | 2,75B | no disponible | MIT | Versión pequeña de la familia Ling |
| Ling-plus | 290B | 28,8B | no disponible | MIT | Versión grande de la familia Ling |

No hay una comparativa directa con otros modelos abliterated de tamaño similar en la información disponible. La principal diferencia frente al base es la reducción de rechazo, que no afecta a las capacidades técnicas pero sí al comportamiento de seguridad.

## Limitaciones y advertencias

- El modelo tiene el comportamiento de rechazo deliberadamente reducido a nivel de pesos. No es un modelo de seguridad y no debe desplegarse, comercializarse ni evaluarse como tal.
- Riesgo de alucinación y de generación de contenido técnico incorrecto o peligroso, especialmente en dominios de seguridad ofensiva, donde un error podría tener consecuencias graves.
- Solo se ha verificado su funcionamiento en inglés y chino; no hay garantías de calidad en otros idiomas.
- La ventana de contexto real es incierta: la model card indica 128K nativo mientras que la documentación oficial de InclusionAI afirma 256K. Se recomienda verificar en el despliegue.
- No se han publicado evaluaciones de robustez frente a jailbreaks, ataques multi-turno ni uso de herramientas. El autor advierte que una sola batería de pruebas no captura el riesgo multimodal, de tool-use o de agente.
- El despliegue requiere hardware muy específico (GPU de clase B200 o similar) y software con soporte para la arquitectura BailingMoeV3; no es trivial en entornos estándar.
- La licencia MIT permite uso comercial, pero el autor recomienda restringir el uso a entornos de investigación controlados con control de acceso y registro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ishowbackup/LING-3.0-FLASH-ABLITERATED
- Modelo base en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Documentación oficial de Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Repositorio GitHub de InclusionAI/Ling: https://github.com/inclusionAI/Ling
- Cuantizaciones GGUF del modelo abliterated: https://huggingface.co/models?other=base_model:quantized:inclusionAI/Ling-3.0-flash
