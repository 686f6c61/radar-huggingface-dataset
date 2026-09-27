# BARKEM/Qwen3.8-27B-Uncensored-W4A16-CT

## Resumen

BARKEM/Qwen3.8-27B-Uncensored-W4A16-CT es una cuantización a 4 bits de los pesos (W4A16) del modelo orcarouter/Qwen3.8-27B-Uncensored, que a su vez es una abliteración (eliminación de rechazos a nivel de pesos) del oficial Qwen/Qwen3.8-27B. Se trata de un modelo denso de atención híbrida —Gated DeltaNet (atención lineal) combinada con atención completa— que incorpora torre de visión y una cabeza MTP para decodificación especulativa. El trabajo de cuantización lo firma BARKEM; la abliteración corresponde a orcarouter y el modelo base al equipo Qwen, bajo licencia Apache 2.0.

El artefacto resuelve dos necesidades concretas: servir un modelo con visión, tool calling y modo de razonamiento en hardware más modesto que el BF16 original, y hacerlo sin las capas de rechazo que limitan respuestas en dominios legítimos pero sensibles. Para ello emplea el formato compressed-tensors pack-quantized (int4, grupo 128, simétrico) generado con Intel AutoRound 0.15.0 sobre 128 muestras de NeelNanda/pile-10k, manteniendo en BF16 la torre de visión, la cabeza MTP, lm_head y las proyecciones in_proj_a e in_proj_b del bloque GatedDeltaNet.

Su relevancia práctica está en la compatibilidad de formato: replica el esquema de dbirks/Qwen3.8-27B-W4A16-AutoRound, de modo que los kernels de HyperQwen aplican y vLLM lo carga con Marlin, con decodificación especulativa MTP activable. Conviene advertir de una inconsistencia en los metadatos: el nombre comercial indica 27B, pero el recuento real de safetensors es de 6.260.690.960 parámetros, mientras que el repositorio ocupa 19,5 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: Gated DeltaNet (atención lineal) + atención completa; torre de visión y cabeza MTP |
| Parámetros totales | 6.260.690.960 según los metadatos de safetensors; el nombre del modelo indica 27B (discrepancia no aclarada en la información disponible) |
| Longitud de contexto | 262.144 tokens (262K), según la ficha del modelo de origen |
| Tipos de cuantización | W4A16: int4 en pesos, group 128, simétrico, pack-quantized de compressed-tensors; activaciones en 16 bits. El modelo de origen publica además variantes GGUF de 2 a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored, abliteración de Qwen/Qwen3.8-27B |
| Autor de la cuantización | BARKEM |
| Método de cuantización | Intel AutoRound 0.15.0, 128 muestras de NeelNanda/pile-10k a 2048 tokens, 200 iteraciones, semilla 42 |
| Tamaño del repositorio | 19,5 GB |
| Pipeline | image-text-to-text |
| Fecha de publicación | 27 de septiembre de 2026, según los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de atención híbrida: intercala capas de Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, con capas de atención completa. Esta combinación reduce el coste de memoria de la caché KV en contextos largos (hasta 262.144 tokens) manteniendo la capacidad de recuperación de la atención completa. Sobre esa columna vertebral se añaden dos componentes propios de la familia: una torre de visión que habilita la entrada image-text-to-text mediante un proyector multimodal, y una cabeza MTP (multi-token prediction) de 15 tensores que permite decodificación especulativa configurando `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.

No hay entrenamiento desde cero en esta ficha: se trata de un proceso de posentrenamiento de cuantización sobre el modelo ya abliterado. La abliteración de orcarouter se aplicó a nivel de pesos, dejando intactas la torre de visión y la cabeza MTP; según la ficha del modelo de origen, el resultado es un 0 % de sobrerrechazo en XSTest y entre un 0 % y un 6 % de rechazo en la batería A/B, sin pérdida de capacidad medible. La cuantización mantiene en BF16 los tensores sensibles (in_proj_a e in_proj_b de GatedDeltaNet, torre de visión, cabeza MTP y lm_head) y tardó 34 minutos en una única RTX 5090, según la model card.

## Capacidades

- Generación de texto conversacional multi-turno, con ventana de hasta 262.144 tokens.
- Modo de razonamiento (thinking): el modelo base incorpora razonamiento explícito antes de la respuesta final.
- Razonamiento matemático y evaluación multimodal de problemas matemáticos, dado el soporte de visión del modelo base.
- Comprensión de imágenes: pipeline image-text-to-text con torre de visión conservada en BF16 y proyector mmproj completo.
- Tool calling / function calling, confirmado en la ficha del modelo de origen.
- Decodificación especulativa mediante cabeza MTP incluida (15 tensores), con tres tokens especulativos por paso.
- Comportamiento sin rechazos: abliteración a nivel de pesos, con 0 % de sobrerrechazo en XSTest y 0-6 % de rechazo en la batería A/B.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Capacidades de agente y razonamiento multi-paso: no se detallan de forma explícita más allá del soporte de tool calling y del modo de razonamiento.

## Casos de uso

- Atención al cliente automatizada: el modelo sostiene conversaciones multi-turno con 262.144 tokens de contexto, de modo que puede mantener el historial completo de un caso sin resumir ni truncar, y responder sin las evasivas típicas de los modelos alineados ante consultas legítimas pero incómodas (reclamaciones, sectores regulados, salud).
- Análisis de documentos técnicos con imágenes: gracias a la torre de visión y al contexto largo, permite procesar informes con gráficos, esquemas o capturas y responder preguntas sobre el contenido combinado de texto e imagen en una sola pasada.
- Asistente de programación con acceso a herramientas: el soporte de tool calling permite conectar el modelo a linters, ejecutores de tests o APIs de repositorio dentro de un flujo de CI/CD, consultando el estado real del proyecto antes de proponer cambios.
- Investigación en seguridad y alineación: al ser una variante abliterada con métricas de rechazo publicadas, resulta útil como referencia para estudiar el efecto de la eliminación de rechazos sobre el comportamiento del modelo y para construir conjuntos de evaluación comparativos frente al modelo original.
- Despliegue en hardware de gama alta para consumo: al requerir del orden de 19,5 GB de pesos, se puede servir en una única GPU de 24-32 GB con vLLM y kernels Marlin, lo que abarata el coste por token frente al BF16 para prototipos y entornos de desarrollo.
- Generación de contenido editorial sin filtros de estilo: redacción de textos de ficción, marketing o documentación donde las capas de rechazo del modelo alineado interrumpen la tarea por temas sensibles sin justificación real.
- Evaluación comparativa de cuantizaciones: al replicar el esquema de dbirks/Qwen3.8-27B-W4A16-AutoRound, sirve como punto de comparación controlado entre una versión abliterada y otra no abliterada con idéntico pipeline de cuantización.
- Procesamiento por lotes con decodificación especulativa: activando la cabeza MTP con tres tokens especulativos, el modelo es adecuado para pipelines de inferencia por lotes donde la latencia por token es crítica y el hardware está saturado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MMLU, HumanEval, GSM8K ni equivalentes para esta cuantización, y la model card remite a la ficha del modelo de origen para los resultados de eliminación de rechazos. Los únicos datos cuantitativos disponibles son las métricas de abliteración del modelo base:

| Métrica | Valor | Fuente |
|---|---|---|
| Sobrerrechazo en XSTest | 0 % | Ficha del modelo de origen (orcarouter) |
| Rechazo en batería A/B | 0-6 % | Ficha del modelo de origen (orcarouter) |
| Pérdida de capacidad medible | ninguna, según el autor de la abliteración | Ficha del modelo de origen (orcarouter) |
| Tiempo de cuantización | 34 minutos en una RTX 5090 | Model card de esta cuantización |

La página oficial de Qwen/Qwen3.8-27B menciona evaluación en MathVision con un prompt fijo de razonamiento paso a paso, pero no se proporcionan los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 19,5 GB en el repositorio; se necesita al menos esa cantidad más la caché KV y los búferes de activación.
- GPU recomendadas: RTX 5090 (32 GB, hardware usado para la propia cuantización), RTX 4090 (24 GB, con margen ajustado), L40S (48 GB), A100 (40 GB y 80 GB) y H100 (80 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 5090 (32 GB) para contextos moderados; el contexto completo de 262.144 tokens exige memoria adicional para la caché KV que no está cuantificada en la información disponible.
- Opciones de despliegue: vLLM con kernels Marlin, con el preprocesado y los kernels de HyperQwen aplicables; la configuración de decodificación especulativa MTP se activa con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`. Otras rutas de despliegue (llama.cpp, Ollama, TGI, SGLang) no están confirmadas para este artefacto concreto; existen variantes GGUF del modelo de origen para llama.cpp y Ollama.
- Latencia y throughput estimados: no disponible. No se publican cifras de tokens por segundo ni de ganancia real de la decodificación especulativa con tres tokens MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| BARKEM/Qwen3.8-27B-Uncensored-W4A16-CT | 6.260.690.960 según safetensors; 27B nominal | 262.144 tokens | W4A16 int4, group 128, vía AutoRound | Apache 2.0 | Incluye visión, MTP y tool calling; 19,5 GB |
| orcarouter/Qwen3.8-27B-Uncensored | 27B nominal | 262.144 tokens | BF16 sin cuantizar | Apache 2.0 | Modelo de origen de la abliteración; publica variantes GGUF de 2 a 8 bits con mmproj incluido |
| dbirks/Qwen3.8-27B-W4A16-AutoRound | 27B nominal | no disponible | W4A16 int4, group 128, vía AutoRound | Apache 2.0 (según modelo base) | Mismo esquema de cuantización, sin abliterar; referencia de comparación controlada |
| Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen | 27B nominal | no disponible | AWQ W4A16 asimétrica | no disponible | Variante abliterada con cuantización asimétrica, orientada a HyperQwen |

Los recuentos de parámetros de los modelos comparados se expresan como valor nominal según su nombre comercial, ya que la información disponible solo incluye el recuento real de safetensors para el modelo de esta ficha.

## Limitaciones y advertencias

- Ausencia de rechazos: la abliteración elimina los mecanismos de negativa del modelo, por lo que puede generar contenido dañino, ilegal o inseguro ante peticiones explícitas. No es un modelo adecuado para aplicaciones expuestas directamente al público sin capas de filtrado externas.
- Riesgo legal y reputacional: en la Unión Europea, el uso en producción de un modelo sin salvaguardas puede entrar en conflicto con obligaciones de moderación de contenidos y con las políticas de las plataformas de despliegue.
- Discrepancia en el recuento de parámetros: el nombre indica 27B, pero los safetensors declaran 6.260.690.960 parámetros. La causa no se explica en la información disponible y conviene verificarla antes de dimensionar infraestructura.
- Idiomas soportados no documentados: la model card no enumera idiomas, por lo que no hay garantía sobre el rendimiento en castellano u otras lenguas más allá de lo que ofrezca la familia Qwen subyacente.
- Calidad de cuantización: la cuantización a 4 bits con group 128 introduce error respecto al BF16. Aunque se preservan en BF16 los tensores sensibles (visión, MTP, lm_head y proyecciones de GatedDeltaNet), no se publican evaluaciones comparativas entre esta versión y el original.
- Sin benchmarks publicados: no hay cifras de rendimiento que permitan validar la afirmación de ausencia de pérdida de capacidad.
- Alucinación: como cualquier modelo generativo, puede producir información falsa con aparente seguridad, especialmente en contextos largos de 262.144 tokens, donde la degradación efectiva no está documentada.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y se indique los cambios; no impone cláusulas de uso aceptable.
- Fechas de metadatos anómalas: la creación del repositorio figura como 27 de septiembre de 2026, dato que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BARKEM/Qwen3.8-27B-Uncensored-W4A16-CT
- Modelo base (abliterado): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de referencia con el mismo esquema: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Variante AWQ W4A16 asimétrica abliterada: https://huggingface.co/Ar4ikov/Qwen3.8-27B-Uncensored-AWQ-W4A16-ASYM-HyperQwen
- Repositorio HyperQwen: https://github.com/syv-ai/HyperQwen
- Build de Ollama del modelo de origen: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Build de Ollama, etiqueta latest: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored:latest
- Repositorio de despliegue local multi-plataforma: https://github.com/Wassimyounes01/qwen38-uncensored
