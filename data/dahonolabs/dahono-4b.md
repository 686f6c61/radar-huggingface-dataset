# DahonoLabs/Dahono-4B

## Resumen

Dahono-4B es un ajuste fino (finetune) del modelo Qwen/Qwen3-4B desarrollado por DahonoLabs, orientado específicamente al dominio jurídico de Indonesia: análisis de instrumentos yurídicos, razonamiento doctrinal y cumplimiento regulatorio (regtech). Está construido sobre una arquitectura transformer densa de aproximadamente 4.022 millones de parámetros y una ventana de contexto nativa declarada de 40.960 tokens.

El modelo se distribuye bajo licencia Apache 2.0 y en formato GGUF v3 con cuantización Q4_K_M (2,50 GB), pensado para inferencia local mediante Ollama, llama.cpp y LM Studio. Su idioma de trabajo es exclusivamente el indonesio (código `id`), con tolerancia explícita a latinismos y términos jurídicos neerlandeses heredados del derecho indonesio.

La relevancia de la versión v0.7 radica en su entrenamiento mediante refuerzo con GRPO sobre cuatro funciones de recompensa jurídicas (cumplimiento de formato, pureza lingüística, precisión de citas y profundidad de razonamiento), además de un modo de razonamiento interno nativo en bloques `<think>`. Los resultados publicados son declarados por el autor y no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Qwen/Qwen3-4B |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens nativos (declarado en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (4 bits, medium); otras cuantizaciones no disponibles |
| Idiomas soportados | Indonesio (`id`); latinismos y términos neerlandeses jurídicos en whitelist |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (Q4_K_M); el recuento de parámetros del repo procede de safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only denso de unos 4.000 millones de parámetros con atención de consultas agrupadas (GQA) y RoPE, sobre el que DahonoLabs aplica un ajuste fino específico de dominio jurídico indonesio. La innovación principal de la versión v0.7 es un entrenamiento de razonamiento mediante Reinforcement Learning con Group Relative Policy Optimization (GRPO), guiado por cuatro funciones de recompensa ponderadas:

- Formato (`w = 1.0`): exige bloques `<think>...</think>` completos y con una elaboración superior a 30 caracteres.
- Pureza lingüística (`w = 1.0`): penaliza el code-switching al inglés (umbral del 3 %) manteniendo una whitelist de términos jurídicos en latín y neerlandés.
- Precisión de citas (`w = 1.5`): recompensa la coincidencia de artículos citados con las referencias esperadas y penaliza la ausencia de correspondencia.
- Profundidad de razonamiento (`w = 1.0`): puntúa la presencia de los cuatro componentes del silogismo jurídico (hechos, fundamento legal, análisis, conclusión).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon fases adicionales de RLHF o DPO más allá del pipeline GRPO descrito.

## Capacidades

- Generación de texto jurídico formal en indonesio con formato de dictamen o resolución.
- Razonamiento jurídico profundo con cadena de pensamiento nativa en bloques `<think>` (silogismo: premisa mayor, premisa menor y conclusión).
- Análisis normativo sobre KUHPerdata, KUHP Nacional (UU 1/2023), UU 13/2003 sobre empleo (con PP 35/2021), UU 27/2022 sobre protección de datos personales y UU 1/2024 sobre ITE.
- Precisión de citas legales y mitigación de referencias ficticias (citation precision).
- Soporte de function calling / tool calling, heredado de la familia Qwen3 (etiqueta `function-calling`).
- Conversación multi-turno (etiqueta `conversational`).
- Purismo lingüístico: elimina el code-switching al inglés, salvo latinismos y términos neerlandeses jurídicos admitidos.
- No se declara soporte de visión, audio ni otras modalidades.

## Casos de uso

- Asistencia jurídica automatizada en Indonesia: el modelo puede gestionar consultas multi-turno sobre derecho civil y contractual apoyándose en su ventana de 40.960 tokens para incorporar expedientes extensos.
- Revisión y redacción de contratos bajo KUHPerdata: análisis de cláusulas y detección de vicios (por ejemplo, `Vernietigbaar` o `Van Rechtswege Nietig`) con salida formal en indonesio.
- Cumplimiento normativo (regtech): evaluación de tratamientos de datos frente a la UU 27/2022 de protección de datos personales, generando informes con fundamento legal explícito.
- Análisis laboral: interpretación de relaciones de trabajo bajo UU 13/2003 y PP 35/2021 (modalidades de contrato, indemnizaciones, terminación).
- Verificación de citas legales: uso de su alta precisión de citas para auditar documentos jurídicos y detectar referencias a artículos inexistentes o mal atribuidos.
- Despliegue local en despachos y asesorías: al ejecutarse en formato GGUF Q4_K_M con 2,50 GB, permite procesar documentación confidencial sin enviar datos a servicios en la nube.
- Formación y apoyo a estudiantes de derecho: generación de explicaciones doctrinales estructuradas con separación explícita entre razonamiento interno y conclusión formal.

## Benchmarks y rendimiento

Los resultados proceden de la suite interna LegalBench-ID (50 casos, cinco dominios jurídicos) y son declarados por el autor (`verified: false`). No están verificados de forma independiente.

| Metrica | Base Qwen3-4B | Dahono-4B v0.6 | Dahono-4B v0.7 |
|---|---|---|---|
| Composite Legal Score | 71,2 % | 79,8 % | 83,6 % |
| Citation Precision (Ketepatan Pasal) | 62,4 % | 81,5 % | 89,2 % |
| Doctrinal Reasoning & Analysis | 73,0 % | no disponible (dato truncado) | 84,5 % |
| Indonesian Language Purity | no disponible | no disponible | 92,1 % |
| CoT Reasoning Structural Compliance | no disponible | no disponible | 94,8 % |

La mejora declarada frente al modelo base es de +12,4 puntos en la puntuación legal compuesta y +26,8 puntos en precisión de citas.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos según tamaño de pesos): en Q4_K_M, en torno a 3 GB; en Q8, alrededor de 5 GB; en FP16/BF16, entre 8 y 9 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2060 de 6 GB); para FP16, RTX 3090/4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de consumo actuales, incluidas las de gama media con 8 GB o más.
- Opciones de despliegue: Ollama, llama.cpp y LM Studio (mencionados explícitamente por el autor); también es compatible con servidores tipo vLLM o TGI si se dispone de pesos en safetensors, aunque no se confirma su publicación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dahono-4B v0.7 | ~4,02 B | 40.960 tokens | Jurídico Indonesia + GRPO | Indonesio | Apache 2.0 | GGUF en HuggingFace |
| Qwen/Qwen3-4B (base) | ~4,02 B | 40.960 tokens (nativo declarado) | Propósito general | Multilingüe | Apache 2.0 | Safetensors, GGUF, múltiples proveedores |
| Dahono-4B v0.6 | ~4,02 B (base Qwen3-4B) | No disponible | Jurídico Indonesia (pre-GRPO) | Indonesio | Apache 2.0 | Versión anterior del mismo repositorio |

No se dispone de datos sobre otros modelos jurídicos indonesios comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmark son autodeclarados y no verificados (`verified: false`); la suite LegalBench-ID es interna y su harness solo se comparte bajo solicitud a Dahono Labs.
- Especialización estrecha: el modelo está orientado al derecho indonesio y declara únicamente el idioma `id`; su uso en otros idiomas o jurisdicciones no está respaldado.
- Riesgo de alucinación en citas legales: aunque el entrenamiento GRPO penaliza referencias ficticias, persiste el riesgo de atribución incorrecta de artículos, especialmente en normativa no cubierta por las cinco áreas entrenadas.
- El mecanismo de pureza lingüística penaliza el code-switching al inglés, lo que puede degradar respuestas cuando el usuario mezcla idiomas o necesita terminología técnica en inglés.
- Cobertura normativa limitada a las áreas declaradas (KUHPerdata, KUHP, empleo, protección de datos e ITE); fuera de ellas, la fiabilidad es desconocida.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-4B conviene revisar las condiciones de la licencia del modelo base.
- No se declara soporte multimodal, ni datos sobre sesgos específicos, ni métricas de latencia o throughput.
- Uso responsable: no debe emplearse como sustituto del asesoramiento jurídico profesional; sus salidas requieren revisión por un jurista cualificado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DahonoLabs/Dahono-4B
- Demo interactiva: https://huggingface.co/spaces/DahonoLabs/Dahono-4B-Demo
- Plataforma Applied Legal AI: https://labs.dahono.com
- Portal corporativo: https://dahono.com
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
