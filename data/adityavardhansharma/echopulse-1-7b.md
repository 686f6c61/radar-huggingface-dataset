# adityavardhansharma/EchoPulse-1.7B

## Resumen

EchoPulse-1.7B es un ajuste fino (fine-tuning) del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario adityavardhansharma para alimentar EchoFlow, un asistente de IA móvil privado que se ejecuta en el propio dispositivo (on-device). El modelo hereda la arquitectura híbrida de LFM3, que combina atención lineal, convoluciones causales depthwise 1D y atención estándar, con una ventana de contexto nativa de 16.384 tokens y 1.728.801.536 parámetros totales.

El problema que aborda es concreto: los modelos fundacionales genéricos no siguen protocolos agénticos estructurados y tienden a producir respuestas conversacionales verbosas en lugar de acciones de herramienta concisas. EchoPulse-1.7B se entrena sobre el corpus `adityavardhansharma/echoflow-sft-corpus` para emitir de forma estricta un protocolo de búsqueda web de una sola línea (`search: consulta`), generar artefactos HTML/CSS/JS autocontenidos en un único fichero y mantener el estado en conversaciones de contexto largo.

Su relevancia actual radica en el segmento edge: con cuantización de 4 bits ocupa 1,10 GB en disco y, según la model card, saturando más de 14.000 tokens de contexto consume solo 4,22 GB de VRAM en una A100-40GB, lo que lo hace viable en portátiles de consumo y dispositivos Android de gama alta. La licencia es la LFM Open License v1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + convoluciones causales depthwise 1D + atención) de la familia LFM3 |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (4 bits), GGUF Q8_0 (8 bits); pesos originales en bfloat16 |
| Idiomas soportados | no disponible (la model card no detalla cobertura lingüística) |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm-open-1.0`) |
| Formato de pesos | safetensors (repo principal) y GGUF (repo `adityavardhansharma/EchoPulse-1.7B-GGUF`) |

## Arquitectura y entrenamiento

EchoPulse-1.7B parte de LiquidAI/LFM3-1.7B, un modelo de la familia Liquid Foundation Model que combina atención lineal con convoluciones causales depthwise 1D, un diseño híbrido orientado a eficiencia en inferencia y a contextos largos. El modelo conserva la ventana nativa de 16.384 tokens del base y se distribuye con código personalizado (`custom_code`), por lo que requiere `trust_remote_code=True` en Transformers.

El ajuste fino se realizó sobre el corpus `adityavardhansharma/echoflow-sft-corpus`, orientado a instrucciones y a protocolos agénticos. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente indica que el objetivo del SFT es forzar tres comportamientos: disparo quirúrgico de búsqueda web, generación de artefactos HTML de un solo fichero y síntesis agéntica con contexto largo. No se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Protocolo de búsqueda web estructurado: emite una única línea `search: consulta` de 2 a 6 palabras con anclas de fecha y hora cuando se requieren datos externos frescos.
- Guardrail de cero búsqueda: evita la llamada a búsqueda en matemáticas, programación, algoritmos, traducciones y saludos casuales.
- Generación de artefactos HTML/CSS/JS completos y funcionales, envueltos en `<echo:artifact type="html" title="...">`, con objetivos táctiles de al menos 44 px y sin dependencias de CDN externas.
- Razonamiento multi-paso y retención de estado en contextos de hasta 16.384 tokens.
- Soporte de tool calling mediante el protocolo propietario de EchoFlow (no se documenta compatibilidad con formatos estándar como OpenAI function calling).
- Capacidades matemáticas y de programación (el ejemplo de la model card resuelve valores propios de una matriz simétrica 2x2).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente móvil on-device: integrado en EchoFlow sobre Android con el GGUF Q4_K_M de 1,10 GB, permite conversaciones privadas sin salida a la nube y con latencia baja en dispositivos de gama alta.
- Búsqueda web aumentada con disparo controlado: el modelo decide cuándo consultar la web y emite una consulta corta y precisa, lo que reduce el coste y la latencia del pipeline de recuperación en comparación con modelos que reformulan la pregunta de forma verbosa.
- Generación de aplicaciones móviles de un solo fichero: a partir de una petición en lenguaje natural produce un HTML autocontenido con CSS y JS, listo para abrirse en un navegador móvil sin infraestructura adicional.
- Análisis técnico de documentos largos: con 16.384 tokens de contexto puede procesar varios documentos técnicos en una sola pasada y mantener el estado entre turnos, útil para revisión de especificaciones o resúmenes de informes.
- Prototipado rápido de dashboards y calculadoras: la generación de artefactos con objetivos táctiles de 44 px facilita crear interfaces móviles desechables para validación interna.
- Enrutador de intenciones en asistentes: el guardrail de cero búsqueda permite usar el modelo como clasificador ligero que decide si una consulta requiere recuperación externa, sin coste de latencia en consultas locales.
- Despliegue en portátiles sin GPU dedicada: con el GGUF Q8_0 de 1,85 GB puede ejecutarse en CPU mediante llama.cpp u Ollama para tareas de asistencia offline.

## Benchmarks y rendimiento

La model card reporta evaluaciones propias del protocolo EchoFlow, no benchmarks académicos estándar (MMLU, HumanEval, GSM8K no están disponibles).

| Metrica de evaluacion | Resultado | Detalle |
|---|---|---|
| EchoFlow Schema Adherence | 100,0 % de aprobados | Disparos de búsqueda conformes y etiquetas de cierre de artefacto validadas |
| Surgical Search Compliance | 100,0 % conforme | Emite `search: consulta` en una línea sin relleno conversacional |
| Zero-Search Guardrail | 100,0 % de aprobados | Cero búsquedas en matemáticas, programación y conversación casual |
| Complete Artifact Generation | 100,0 % de aprobados | Dashboards HTML de una y varias páginas renderizados |

Prueba de estrés de contexto largo en NVIDIA A100-40GB:

| Escenario | Tokens de entrada | Tokens generados | Tiempo total | Velocidad de decodificacion | Throughput del sistema | VRAM pico |
|---|---|---|---|---|---|---|
| Contexto 4K (síntesis de arquitectura) | 2.662 | 19 | 4,02 s | 4,7 TPS | 666,9 TPS | 3,45 GB |
| Contexto 8K (análisis técnico profundo) | 6.032 | 800 | 25,72 s | 31,1 TPS | 265,6 TPS | 3,75 GB |
| Contexto 14K (búsqueda needle + artefacto HTML completo) | 10.690 | 1.500 | 48,05 s | 31,2 TPS | 253,7 TPS | 4,22 GB |

## Requisitos de hardware

- VRAM estimada en bfloat16: alrededor de 3,45 GB en contexto corto y 4,22 GB saturando 14.000+ tokens, según las mediciones del autor en A100-40GB.
- VRAM estimada en GGUF Q4_K_M: 1,10 GB de pesos; el consumo real de inferencia depende del backend y del contexto.
- VRAM estimada en GGUF Q8_0: 1,85 GB de pesos.
- GPU recomendadas: NVIDIA A100-40GB (medición oficial), H100 para mayor throughput; RTX 4090 y RTX 3090 son suficientes para bfloat16 con contexto completo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores en bfloat16; en GPUs de 8 GB conviene usar Q4_K_M o Q8_0.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, llama.cpp y Ollama mediante los GGUF publicados; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: 31,1-31,2 TPS de decodificación y 253,7-265,6 TPS de sistema en A100-40GB con contextos de 8K-14K; 4,7 TPS de decodificación en el escenario de 4K con solo 19 tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EchoPulse-1.7B | 1,73 B | 16.384 | LFM Open License v1.0 | Hugging Face, GGUF | Ajuste fino para protocolo EchoFlow |
| LiquidAI/LFM3-1.7B | 1,73 B | 16.384 (heredado) | LFM Open License v1.0 | Hugging Face | Modelo base; sin protocolo agéntico específico |
| Alternativas de ~1,5-2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El protocolo `search:` y las etiquetas `<echo:artifact>` son específicos de EchoFlow; fuera de ese entorno el modelo puede producir salidas con formato inesperado.
- Los benchmarks reportados son evaluaciones internas del autor sobre el esquema propio, no comparables con MMLU, HumanEval o GSM8K; no hay evidencia independiente de rendimiento general.
- Riesgo de alucinación inherente a un modelo de 1,7 B, especialmente en consultas factuales sin búsqueda externa.
- No se documenta la cobertura lingüística; el comportamiento en idiomas distintos del inglés es desconocido.
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar el código personalizado antes de usarlo.
- El modelo tiene 85 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria significativa.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El contexto máximo es de 16.384 tokens; superarlo provoca degradación o truncamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adityavardhansharma/EchoPulse-1.7B
- Repositorio GGUF: https://huggingface.co/adityavardhansharma/EchoPulse-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Corpus de ajuste fino: https://huggingface.co/adityavardhansharma/echoflow-sft-corpus
- Proyecto EchoFlow: https://echoflow.adityavs.space
- Licencia LFM Open License v1.0: https://raw.githubusercontent.com/Liquid-AI/LFM/main/LICENSE
- Descarga directa Q4_K_M: https://huggingface.co/adityavardhansharma/EchoPulse-1.7B/resolve/main/EchoPulse-1.7B-Q4_K_M.gguf
- Descarga directa Q8_0: https://huggingface.co/adityavardhansharma/EchoPulse-1.7B/resolve/main/EchoPulse-1.7B-Q8_0.gguf
