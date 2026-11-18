# Aleph-Alpha/Kolibri-1-BF16

## Resumen

Kolibri 1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, orientado a razonamiento, generación de texto y uso agéntico en alemán e inglés. Con 78.103.074.560 parámetros totales y solo 3.457.573.120 parámetros activos por token, la arquitectura activa una fracción mínima de la red en cada paso, lo que reduce el coste computacional por token manteniendo la capacidad de un modelo mucho mayor. Se distribuye bajo licencia Apache 2.0 con pesos en bfloat16 y es compatible con la librería transformers.

El modelo incorpora un modo de razonamiento explícito y soporte de tool calling, y está optimizado para contextos largos y eficiencia de inferencia. Su longitud de contexto nativa es de 262.144 tokens, aunque el autor ha validado calidad y eficiencia de servicio hasta 1.048.576 tokens; para despliegues sensibles a latencia o throughput recomienda no superar los 262.144 tokens. La fecha de corte de conocimiento es el 18 de junio de 2026 tanto en inglés como en alemán.

La relevancia de Kolibri 1 radica en su enfoque deliberado de profundidad sobre amplitud: en lugar de cubrir decenas de idiomas, concentra su entrenamiento en dos lenguas (aproximadamente 62,5% inglés y 23,9% alemán en el corpus de preentrenamiento) e incluye un tokenizador adaptado a la estructura morfológica del alemán. Está pensado para asistentes conversacionales, procesamiento de documentos, RAG sobre material propio y orquestación de herramientas con validación humana, no para operación autónoma sin supervisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 50 capas con atención 4:1 SWA:GQA |
| Parámetros totales | 78.103.074.560 (78B) |
| Parámetros activos | 3.457.573.120 (3,46B) por token |
| Longitud de contexto | 1.048.576 tokens validados; nativa 262.144; recomendado ≤262.144 |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Alemán, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Kolibri 1 es un transformer MoE de 50 capas que combina atención de ventana deslizante (SWA) y atención de consultas agrupadas (GQA) en una proporción 4:1, de modo que la mayoría de las capas atienden solo al texto cercano mientras una minoría atiende a todo el contexto; esto abarata el coste de los contextos largos. Cada capa contiene 384 expertos, con 1 experto compartido y 6 enrutados por token. El entrenamiento empleó Muon y Exact Quantile Balancing. La codificación posicional se aplica únicamente en las capas de ventana deslizante, lo que permite extender el contexto más allá de la longitud nativa sin escalado posicional.

El preentrenamiento utilizó 20 billones (20T) de tokens de un corpus bilingüe filtrado (aproximadamente 62,5% inglés, 23,9% alemán y 13,6% código) que combina datos web curados, reformulaciones y traducciones sintéticas y fuentes de alta calidad. A ello se sumaron 3,44T de tokens en mid-training y 201B en la fase de extensión de contexto largo. El post-entrenamiento incluyó una mezcla de SFT con datos bilingües filtrados (open source y sintéticos) y RL sobre un conjunto amplio de entornos que cubren razonamiento, uso agéntico y seguimiento de instrucciones. El cómputo total de preentrenamiento se estima en 6,4e23 FLOPS, ejecutado sobre 768 NVIDIA B200 durante 21 días (392k GPUh), con 5 días adicionales de mid-training (90k GPUh) y 13 horas de extensión de contexto (10k GPUh). El consumo energético estimado es de 9,5×10² MWh incluyendo PUE, sin contar SFT ni RL.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de razonamiento explícito activable.
- Generación y asistencia de código, con un 13,6% del corpus de preentrenamiento dedicado a código.
- Tool calling y function calling para orquestación de APIs, ejecución de código y búsquedas.
- Flujos agénticos y razonamiento multi-paso con resultados validables por el sistema llamante.
- Extracción estructurada de información y salidas estructuradas.
- Procesamiento de documentos largos y RAG sobre material propio gracias a su ventana de hasta 1.048.576 tokens.
- Capacidades multilingües limitadas a alemán e inglés, con tokenizador optimizado para la morfología del alemán.
- Uso como asistente conversacional bilingüe con revisión humana de la salida.

## Casos de uso

- Asistencia conversacional en alemán e inglés: el modelo gestiona diálogos multi-turno con contexto de hasta 262.144 tokens recomendados, adecuado para asistentes internos que mantienen historial extenso sin perder coherencia.
- Procesamiento de documentos largos: contratos, informes o expedientes de cientos de miles de tokens pueden analizarse en una sola pasada gracias a la ventana validada de hasta 1.048.576 tokens, con atención SWA que mantiene el coste controlado.
- RAG sobre conocimiento corporativo: combinado con un recuperador, responde preguntas sobre material propio de la organización; su modo de razonamiento permite encadenar evidencia recuperada antes de responder.
- Orquestación agéntica de herramientas: con tool calling puede llamar a APIs, ejecutar código o lanzar búsquedas dentro de una capa de orquestación que valide los resultados antes de actuar.
- Generación de código en pipelines: asiste en tareas de programación y puede integrarse en flujos de CI/CD como generador de parches o revisión asistida, siempre con validación posterior.
- Extracción estructurada de datos: convierte texto no estructurado en salidas JSON u otros formatos definidos, útil en digitalización de documentos administrativos en alemán.
- Soporte a la decisión: surface evidencia y redacta opciones para que un humano decida, en lugar de actuar como componente decisor autónomo.
- Borradores y redacción administrativa bilingüe: generación de textos en alemán e inglés con calidad idiomática gracias al tokenizador específico para alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Huella de memoria del modelo: ~156 GB con pesos en BF16.
- Mínimo: 4× A100 80 GB, 4× H100 SXM5, 2× H200, 1× B200 o 1× B300.
- Recomendado: 4× H100 SXM5, 2× H200, 2× B200 o 1× B300.
- No cabe en GPU de consumo: los 156 GB de pesos BF16 exceden la VRAM de cualquier tarjeta consumer actual; se requiere hardware de centro de datos o múltiples GPUs profesionales.
- Opciones de despliegue: compatible con transformers y con endpoints compatibles; el autor no detalla soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor recomienda contextos ≤262.144 tokens para despliegues sensibles a latencia o throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (MoE bilingüe de ~78B con ~3,5B activos) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse mayoritariamente con datos web curados en inglés y alemán, es esperable que herede sesgos de esas fuentes.
- Riesgo de alucinación: el modelo está diseñado para uso con revisión humana; el autor lo sitúa en el lado advisory de la toma de decisiones y no como componente decisor autónomo.
- Limitaciones de idioma: solo soporta alemán e inglés de forma nativa; no está entrenado para otros idiomas.
- Limitaciones de contexto: aunque se valida hasta 1.048.576 tokens, se recomienda ≤262.144 para eficiencia y tareas complejas; más allá puede degradarse la calidad o el rendimiento.
- Conocimiento limitado: fecha de corte el 18 de junio de 2026 para conocimiento implícito; información posterior requiere tool use.
- Licencia: Apache 2.0 permite uso comercial, pero el autor publica una Responsible Use policy que desaconseja ciertos usos; Aleph Alpha es firmante del EU GPAI Code of Practice.
- Producción: requiere validación de las salidas del tool calling por el sistema llamante; no apto para operación no supervisada.
- Coste de memoria: aunque solo activa 3,46B parámetros por token, debe residir completo en memoria (~156 GB en BF16), lo que encarece el despliegue frente a modelos densos de tamaño activo comparable.

## Enlaces

- Hugging Face: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Tech report: https://aleph-alpha.com/downloads/tech-report.pdf
- Tech blog: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- EU GPAI Code of Practice: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- arXiv (referencia en tags): arxiv:2512.11614
- arXiv (referencia en tags): arxiv:2601.17858
