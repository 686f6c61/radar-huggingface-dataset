# Jiunsong/SuperQwen3.8-abliterated-Venice

## Resumen

SuperQwen3.8-abliterated-Venice es un derivado del modelo Qwen/Qwen3.8-27B desarrollado por Jiunsong, diseñado para equipos que necesitan reducir las negativas sistemáticas en flujos legítimos de investigación, seguridad, política, sanidad, comercio minorista, cumplimiento normativo y creatividad. Mantiene las capacidades multimodales, de razonamiento, contexto largo y uso de herramientas del modelo base, pero aplica una proyección del subespacio de rechazo derivada del método OBLITERATUS, con 842 pares de prompts canónicos y rango 8 por capa en las capas 12 a 63.

El artefacto público está cuantizado en FP8_DYNAMIC W8A8 mediante compressed-tensors: pesos FP8 por canal y activaciones FP8 dinámicas por token, sin necesidad de dataset de calibración en carga. Está orientado a inferencia en H100/H200 con Tensor Cores, aunque también se ha verificado su funcionamiento en GB10 (DGX Spark) con decodificación especulativa nativa MTP K=5. El contexto máximo es de 262 144 tokens y el modelo pesa unos 29,08 GiB en el checkpoint FP8, con un total de 27 360 632 560 parámetros.

La relevancia de este lanzamiento reside en combinar una reducción agresiva de rechazos con un formato de pesos listo para producción en hardware Hopper, manteniendo la integridad de las rutas protegidas (visión, conv1d, MTP y lm_head) en BF16 exacto. Está pensado para despliegue con vLLM en una o dos GPUs H100/H200, con soporte de tool calling, razonamiento configurable y decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, vision-language (Qwen3.8) |
| Parámetros totales | 27 360 632 560 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | FP8_DYNAMIC W8A8 (per-channel weights, per-token activations); también disponible en GGUF |
| Idiomas soportados | en, ko (según tags; el modelo base Qwen3.8 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8), sidecar BF16 para MTP, GGUF disponible en repositorio hermano |

## Arquitectura y entrenamiento

El modelo es un finetune del Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros con arquitectura vision-language. El entrenamiento de abliteración se realizó desde el checkpoint padre fijado (commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y no como parche sobre un checkpoint ya modificado. Se usó la revisión de OBLITERUS `a5a1ffa5849b442cf188b3c03fd4de71ddf5bdcc` con 842 pares canónicos de prompts dañinos/inofensivos. Se ajustó un subespacio de rechazo por capa con rango 8 y se proyectó a través de las rutas de salida residuales de las capas 12 a 63, más proyecciones acotadas de los embeddings (mezcla 0.65) y de la cabeza de salida (mezcla 1.0), todo con preservación de norma.

La cuantización FP8_DYNAMIC W8A8 se aplicó con compressed-tensors sobre los pesos lineales del backbone lingüístico, con activaciones dinámicas por token. Los componentes protegidos se mantienen exactos en BF16: el torre de visión (333 tensores), las rutas conv1d/híbridas (48 tensores), la cabeza de predicción múltiple de tokens (MTP, 15 tensores) y el `lm_head`. El runtime kernel seleccionado por vLLM es `CutlassFP8ScaledMMLinearKernel` para `CompressedTensorsW8A8Fp8`. La verificación estructural encontró 496 tensores de escala FP8 en el backbone y no hay sidecars de cuantización en los módulos protegidos.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entrada de texto e imagen, con razonamiento configurable (default, low, medium, high, xhigh).
- Tool calling: soporta llamada de funciones estilo OpenAI, con parsing exacto de nombre y argumentos (parser `qwen3_coder` en vLLM).
- Razonamiento multi-step: verificado en los niveles default/low/medium, y el nivel xhigh completó correctamente con 240 tokens de razonamiento.
- Longitud de contexto nativa de 262 144 tokens; se recuperaron 65 579 tokens de prompt reales en una prueba de contexto final de 262K con K=5.
- Decodificación especulativa nativa MTP K=5: 22,63 tok/s a p256 y 21,49 tok/s tras un prompt de 8K en un GB10 (medido en DGX Spark, no en H100).
- Reducción de rechazos: 0/8 rechazos explícitos en la puerta benign-sensitive y 0/64 rechazos en la auditoría OBLITERUS, con 0 salidas vacías, 0 fugas de tokens y 0 bucles.
- Capacidades de agente: compatible con tool calling y auto-tool-choice en vLLM.
- Multilingüe: declarado en e inglés y coreano; el modelo base Qwen3.8 soporta más idiomas, pero el README solo certifica estos dos.

## Casos de uso

- Investigación en seguridad informática: el modelo puede analizar prompts maliciosos y generar respuestas sin rechazos automáticos que interrumpan el flujo de análisis. Su reducción de refusal permite explorar vectores de ataque de forma más completa, con tool calling para integrar consultas a bases de datos de vulnerabilidades.
- Análisis de políticas y cumplimiento normativo: equipos de compliance pueden plantear escenarios hipotéticos de incumplimiento sin que el modelo se niegue por defecto, manteniendo el razonamiento multi-step para descomponer casos complejos en pasos verificables.
- Revisión de contratos y documentos legales: con contexto de 262K tokens, puede procesar contratos completos y resumir cláusulas, detectar riesgos o generar preguntas de revisión, sin rechazar consultas sobre temas jurídicos sensibles.
- Atención al cliente automatizada en entornos sanitarios y farmacéuticos: el modelo puede gestionar conversaciones multi-turno sobre productos, posología general o efectos secundarios, con el caveat de que no es consejo médico verificado. El modo de razonamiento configurable permite ajustar la profundidad de respuesta según el riesgo.
- Generación de contenido creativo y marketing: sin los filtros de rechazo habituales, puede generar borradores de campañas, guiones o textos para públicos específicos, incluyendo temas que otros modelos evitan (vino, juego, política), con tool calling para integrar datos de campaña.
- Despliegue de agentes en producción con vLLM: el formato FP8 W8A8 está preparado para servirse con vLLM en H100/H200, con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`, lo que permite construir agentes con razonamiento largo, contexto extendido y decodificación especulativa MTP para reducir latencia.
- Análisis de documentos de investigación clínica: el contexto largo y la capacidad multimodal permiten procesar papers con figuras, tablas y texto, y extraer resultados sin que el modelo se niegue a responder sobre datos médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta verificaciones internas de calidad:

| Verificación | Resultado |
|---|---|
| Comprobaciones de capacidad | 8/8 |
| Puerta benign-sensitive (rechazos explícitos) | 0/8 |
| Auditoría OBLITERUS (rechazos, salidas vacías, fugas, bucles) | 0/64 |
| Razonamiento xhigh | Correcto en 240 tokens de razonamiento |
| Decodificación especulativa MTP K=5 | 22,63 tok/s (p256), 21,49 tok/s (8K prompt) en GB10 |
| Recuperación de contexto largo | 65 579 tokens reales en 262K |

No se han publicado resultados de benchmarks comparativos frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 pesa ~29,08 GiB, por lo que caben en una GPU de 80 GB con margen para KV cache. En BF16, el modelo base requiere ~54 GB.
- GPUs recomendadas: NVIDIA H100 80GB o H200 141GB con TP=1; TP=2 recomendado para prefill concurrente o headroom operativo. Verificado también en NVIDIA DGX Spark (GB10).
- GPUs consumer: no se ha validado en GPUs consumer, pero el formato GGUF del mismo autor permitiría ejecutarlo en tarjetas con 24 GB (RTX 4090) con cuantización de 4-6 bits, aunque la velocidad será menor.
- Opciones de despliegue: vLLM (con kernel CutlassFP8ScaledMMLinearKernel), llama.cpp vía GGUF, Ollama (si se convierte el GGUF), FriendliAI para API de producción.
- Latencia y throughput: medido 22,63 tok/s en GB10 con MTP K=5; no hay datos de throughput en H100/H200, pero el formato FP8 está optimizado para Tensor Core de Hopper.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SuperQwen3.8-abliterated-Venice | 27,4B | 262K | FP8 W8A8 | Apache-2.0 | Abliterado, FP8, MTP, vision |
| Qwen/Qwen3.8-27B | 27,4B | 262K | BF16 | Apache-2.0 | Modelo base sin abliteración |
| Qwen/Qwen2.5-VL-27B | 27B | 128K | BF16 | Apache-2.0 | Vision-language, sin abliteración |
| SuperQwen3.8-27b-abliterated-GGUF | 27,4B | 262K | GGUF | Apache-2.0 | Mismo autor, formato GGUF para consumer |

La comparativa directa con el base Qwen3.8-27B muestra que el modelo mantiene las mismas capacidades técnicas (multimodal, razonamiento, tool calling, contexto 262K) pero con una capa de proyección de rechazo adicional. La diferencia con el GGUF es el formato: FP8 W8A8 para Hopper vs GGUF para consumer. No hay datos de rendimiento comparativo en benchmarks estándar.

## Limitaciones y advertencias

- La abliteración reduce la dirección de rechazo medida, pero no elimina todos los rechazos posibles; el modelo puede aún negarse en ciertos casos.
- El texto generado no constituye consejo verificado de carácter legal, médico, de seguridad ni de inversión. No debe usarse como fuente de decisiones críticas sin supervisión humana.
- Idiomas certificados: solo en e inglés y coreano; el resto de idiomas del modelo base no están verificados en esta versión.
- El formato FP8 W8A8 requiere hardware con soporte de FP8 (H100/H200, GB10). En GPUs sin soporte FP8, el rendimiento se degradará o el modelo no cargará correctamente sin conversión.
- No hay benchmarks públicos (MMLU, HumanEval, etc.) que permitan comparar el rendimiento con otras versiones abliteradas.
- El checkpoint está pensado para vLLM; no se ha verificado en otros servidores de inferencia con el formato FP8.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- El modelo puede mostrar sesgos residuales del entrenamiento original de Qwen3.8, especialmente en temas de género, raza o religión, aunque la abliteración no los corrige.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jiunsong/SuperQwen3.8-abliterated-Venice
- Repositorio GGUF (mismo autor): https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-GGUF/tree/main
- Página de FriendliAI para despliegue: https://friendli.ai/models/Jiunsong/SuperQwen3.8-27b-abliterated
- Perfil del autor: https://huggingface.co/Jiunsong
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
