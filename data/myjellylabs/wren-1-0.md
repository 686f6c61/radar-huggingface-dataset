# myjellylabs/Wren-1.0

## Resumen
Wren 1.0 es un modelo de lenguaje multimodal de 12B parámetros desarrollado por MyJellyLab y publicado bajo licencia Apache 2.0. Acepta entradas de texto, imagen y audio, y genera texto, con una ventana de contexto de 256K tokens. Está construido sobre la arquitectura Gemma 4 Unified de Google (identificador `gemma4_unified` en transformers) y se distribuye como pesos BF16 completos en safetensors, sin necesidad de cargar adaptadores externos en inferencia.

El modelo está orientado a ingeniería de software, razonamiento analítico y flujos de trabajo bilingües inglés-hindi/hinglish. Su receta de post-entrenamiento cubre seis dominios principales: programación y código competitivo, SQL y tool calling estructurado, razonamiento matemático y STEM multi-paso, finanzas y contabilidad, hindi en devanagari e hinglish natural, y seguimiento de instrucciones conciso con control de repetición.

Es relevante porque combina una ventana de contexto muy amplia con multimodalidad (visión y audio) y una licencia permisiva para uso comercial, en un único checkpoint denso de 12B parámetros que cabe en GPUs de gama alta de consumo con cuantización. No obstante, el modelo es de publicación muy reciente y no cuenta con validación externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal, familia Gemma 4 Unified (`gemma4_unified`) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16 nativo; pipeline GGUF mencionado (no se detallan variantes concretas) |
| Idiomas soportados | Inglés (en), hindi (hi), hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 12 shards, ~23,9 GB); GGUF previsto |

## Arquitectura y entrenamiento
Wren 1.0 es un transformer denso de 12B parámetros que hereda la arquitectura Gemma 4 Unified de Google (`google/gemma-4-12B-it`), con codificadores de visión y audio preservados intactos. El modelo acepta entradas multimodales (texto, imagen, audio) y produce salida de texto. No es un modelo MoE ni híbrido SSM; la model card no detalla el número de tokens de preentrenamiento ni la composición exacta del dataset base.

El post-entrenamiento se realizó en dos etapas con fusión en el espacio de pesos. La primera etapa consistió en un SFT con rsLoRA (r=16, alpha=8) aplicado a 328 capas lineales del modelo de lenguaje, con codificadores de visión y audio congelados, enmascaramiento de pérdida solo en el asistente y suavizado EMA de pesos (eval_loss=0.6614). La segunda etapa aplicó alineación por preferencias con CPO-SimPO sobre 800 pares curados (beta=2.0, gamma=0.5, cpo_alpha=0.20) para optimizar concisión, estabilidad del razonamiento y comportamiento anti-bucle. Finalmente, se aplicó una fusión WiSE-FT evaluando escalas 0.75x, 0.85x y 1.00x, seleccionando 0.85x para equilibrar seguimiento de instrucciones y retención de conocimiento base.

## Capacidades
- Generación de texto y conversación multi-turno con ventana de 256K tokens.
- Comprensión de imágenes (image-text-to-text) mediante codificador de visión.
- Comprensión de audio como entrada, con salida de texto.
- Programación y código competitivo, incluyendo generación y explicación de código.
- Generación de SQL y tool calling / function calling estructurado.
- Razonamiento matemático y STEM multi-paso.
- Cálculo financiero y contabilidad (por ejemplo, EBITDA).
- Soporte de agentes y razonamiento multi-paso (declarado en la model card).
- Capacidades multilingües en inglés, hindi (devanagari) e hinglish.
- Seguimiento de instrucciones conciso con formato JSON estricto y control anti-repetición.
- Modo de razonamiento estable según la evaluación interna de regresión.

## Casos de uso
- Asistencia de programación en producción: el modelo puede explicar y generar código (por ejemplo, diferencias entre INNER JOIN y LEFT JOIN en SQL) e integrarse en pipelines de revisión o CI/CD para sugerencias y corrección de fragmentos.
- Análisis de repositorios y codebases extensos: con 256K tokens de contexto puede procesar múltiples archivos y documentación en una sola pasada para responder preguntas sobre arquitectura o dependencias.
- Generación y depuración de SQL: útil para construir consultas complejas y tool calling estructurado en asistentes de bases de datos.
- Atención al cliente bilingüe inglés-hindi: gestiona conversaciones multi-turno con contexto largo y respuestas concisas, adecuado para mercados del sur de Asia.
- Análisis financiero y contabilidad: cálculo de métricas como EBITDA y resumen de documentos financieros, con la advertencia de verificar resultados críticos.
- Procesamiento de documentos con imagen y audio: extracción de información de capturas, formularios o transcripciones de audio combinadas con texto en un mismo flujo.
- Razonamiento STEM educativo: resolución de problemas matemáticos multi-paso con explicaciones intermedias.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclaman puntuaciones de leaderboards de terceros más allá de la suite interna de regresión de 11 pruebas.

| Prueba interna (suite de 11 sondas) | Resultado |
|---|---|
| Consistencia de identidad (directa, override, Base64) | 3 / 3 superadas (0 fugas de identidad) |
| Bucles de repetición / degeneración | 0 / 11 bucles detectados |
| Sondas objetivas de capacidad | 5 / 5 superadas (finanzas, razonamiento, hindi, seguimiento de instrucciones, JSON conciso) |
| Integridad de tensores fusionados | 328 / 328 capas fusionadas, 0 NaN / Inf |

## Requisitos de hardware
- VRAM estimada en BF16: aproximadamente 24 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 40-48 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: en torno a 12-14 GB de pesos; en 4 bits, en torno a 7-8 GB, aunque la model card no detalla variantes GGUF concretas.
- GPU recomendadas: A100 40/80 GB, H100, L40S para BF16 con contexto amplio; RTX 4090 (24 GB) viable en BF16 con contexto reducido o con cuantización.
- GPU de consumo: cabe en RTX 4090 en BF16 ajustando la longitud de contexto; en GPUs de 16 GB o menos se requiere cuantización.
- Opciones de despliegue: `transformers` (>= 5.10.2, con `AutoModelForMultimodalLM`), vLLM (build con soporte de Gemma 4 Unified, referencia `vllm-project/vllm#44429`), y pipeline GGUF para llama.cpp/Ollama (mencionado, sin detalle).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos de rendimiento comparativo verificables en la información proporcionada. La siguiente tabla compara solo especificaciones declaradas o conocidas de forma general; los datos de alternativas deben verificarse en sus respectivas model cards.

| Modelo | Parámetros | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| Wren 1.0 | 12B denso | 256K | Texto, imagen, audio → texto | Apache 2.0 |
| Gemma 4 12B IT (base declarada) | 12B denso | no disponible | Texto (y variantes multimodales según versión) | Apache 2.0 |
| Alternativas de 12B multimodal | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Puede generar inexactitudes factuales o alucinaciones en temas de nicho o en tiempo real; se recomienda verificar salidas críticas en código, finanzas o contextos legales.
- No se han publicado puntuaciones de benchmarks externos independientes; la única validación es la suite interna de 11 sondas del propio autor.
- Cobertura lingüística limitada a inglés, hindi e hinglish; el rendimiento en otras lenguas no está documentado.
- El contexto de 256K tokens es una especificación declarada; el rendimiento efectivo en contextos muy largos no está validado de forma independiente.
- Modelo de publicación muy reciente (creado en noviembre de 2026 según metadatos) con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar los términos de la arquitectura base Gemma 4 y las dependencias de terceros.
- El soporte en vLLM depende de un build con la arquitectura Gemma 4 Unified; versiones estándar pueden no cargar el modelo.
- Riesgo de bucles o degeneración mitigado por el post-entrenamiento, pero no garantizado en todos los prompts.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/myjellylabs/Wren-1.0
- Arquitectura base declarada: https://huggingface.co/google/gemma-4-12B-it
- Referencia de soporte vLLM para Gemma 4 Unified: https://github.com/vllm-project/vllm/pull/44429
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
