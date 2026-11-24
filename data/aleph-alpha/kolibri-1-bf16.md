# Aleph-Alpha/Kolibri-1-BF16

## Resumen

Kolibri 1 es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Aleph Alpha Research GmbH, con un enfoque explícito en alemán e inglés. Con 78.103.074.560 parámetros totales y solo 3.457.573.120 parámetros activos por token, el modelo busca ofrecer capacidad de un modelo grande con un coste de cómputo por token bajo, a cambio de un mayor requisito de memoria. Se publica bajo licencia Apache 2.0 con pesos en bfloat16 y safetensors.

El modelo incorpora un modo de razonamiento explícito y soporte de tool calling, y está optimizado para contexto largo y eficiencia de inferencia. Su longitud de contexto nativa es de 262.144 tokens, validada hasta 1.048.576 tokens, y se recomienda no superar los 262.144 tokens en despliegues sensibles a latencia o en tareas complejas. El corte de conocimiento declarado es el 18 de junio de 2026.

Su relevancia actual radica en ser una alternativa de pesos abiertos centrada en el ámbito germanohablante, con un tokenizador adaptado a la estructura de palabras del alemán y un diseño que prioriza profundidad en dos idiomas frente a cobertura multilingüe amplia. Aleph Alpha es firmante del código de prácticas de la UE para GPAI, lo que sitúa al modelo en el marco regulatorio europeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 50 capas, atención 4:1 SWA:GQA, 384 expertos por capa (1 compartido y 6 enrutados) |
| Parametros totales | 78.103.074.560 |
| Parametros activos | 3.457.573.120 por token |
| Longitud de contexto | 262.144 tokens nativa; validada hasta 1.048.576 tokens; recomendado ≤262.144 |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Alemán, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Kolibri 1 es un transformer de 50 capas con arquitectura MoE de 384 expertos por capa, de los cuales 1 es compartido y 6 enrutados por token. La atención combina capas de ventana deslizante (SWA) y atención global con consultas agrupadas (GQA) en una proporción 4:1, de modo que la mayoría de capas atiende contexto cercano y una minoría atiende todo el contexto. La codificación posicional se aplica solo en las capas de ventana deslizante, lo que permite extender el contexto más allá de la longitud nativa sin escalado posicional. El entrenamiento usó Muon y Exact Quantile Balancing.

El preentrenamiento se realizó sobre 20 billones de tokens de un corpus bilingüe filtrado (aproximadamente 62,5 % inglés, 23,9 % alemán y 13,6 % código), combinando web curada, reformulaciones y traducciones sintéticas y fuentes de alta calidad. A ello se suman 3,44 billones de tokens de mid-training y 201.000 millones para la extensión de contexto largo. El postentrenamiento incluyó SFT con datos bilingües filtrados (open source y sintéticos) y RL sobre un conjunto amplio de entornos que cubren razonamiento, uso agéntico y seguimiento de instrucciones. El cómputo total declarado es de 6,4e23 FLOPs, con 768 NVIDIA B200 en preentrenamiento durante 21 días (392k GPUh), 5 días de mid-training (90k GPUh) y 13 horas para contexto largo (10k GPUh).

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de razonamiento explícito.
- Generación y asistencia de código, con un 13,6 % del corpus de preentrenamiento dedicado a código.
- Tool calling y function calling para orquestación de APIs, ejecución de código y búsquedas.
- Flujos agénticos y razonamiento de varios pasos con validación externa de resultados.
- Extracción estructurada de información y salidas estructuradas.
- Procesamiento de documentos largos y generación aumentada por recuperación (RAG).
- Capacidades bilingües alemán-inglés, con tokenizador adaptado a la estructura de palabras del alemán.
- Contexto largo validado hasta 1.048.576 tokens, con extensión potencial sin escalado posicional.

## Casos de uso

- Asistentes conversacionales en alemán e inglés: el modelo mantiene conversaciones multi-turno con contexto de hasta 262.144 tokens, adecuado para atención al cliente con historial extenso y revisión humana de las respuestas.
- Procesamiento de documentos largos: análisis, resumen y extracción estructurada sobre contratos, expedientes o informes que superan la ventana de modelos convencionales, gracias a su contexto nativo de 262.144 tokens.
- RAG sobre material propio de una organización: respuesta a preguntas sobre corpus internos combinando recuperación con el contexto largo del modelo y su capacidad de citar evidencia para revisión humana.
- Orquestación agéntica de APIs: el soporte de tool calling permite construir capas de orquestación que llaman servicios, ejecutan código o lanzan búsquedas, siempre que el sistema llamante valide los resultados.
- Asistencia a la generación de código: integración en pipelines de desarrollo para autocompletado, revisión y generación de parches, con el modelo actuando como componente asistido por un revisor humano.
- Herramientas internas de conocimiento e investigación: borradores, síntesis de fuentes y apoyo a la toma de decisiones en el lado advisory, presentando opciones y evidencia para que una persona decida.
- Extracción estructurada en flujos documentales: conversión de texto no estructurado en campos validables dentro de sistemas de gestión documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 156 GB en pesos BF16 (tamaño del repo: 156,2 GB).
- Mínimo declarado: 4× A100 80 GB, 4× H100 SXM5, 2× H200, 1× B200 o 1× B300.
- Recomendado: 4× H100 SXM5, 2× H200, 2× B200 o 1× B300.
- No cabe en GPU de consumo: el requisito mínimo de memoria descarta tarjetas como RTX 4090 (24 GB) o similares.
- Opciones de despliegue: transformers (librería declarada); compatible con endpoints; el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. El diseño MoE reduce el cómputo por token al activar 3,46B de parámetros, pero exige mantener los 78B en memoria.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Kolibri 1 | 78,1B | 3,46B | 262.144 nativo (validado 1.048.576) | Apache 2.0 | Alemán, inglés |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Cobertura lingüística limitada a alemán e inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor recomienda revisión humana antes de actuar sobre las salidas.
- Corte de conocimiento el 18 de junio de 2026; la información posterior solo puede obtenerse mediante uso de herramientas.
- Requisito de memoria elevado (unos 156 GB en BF16), lo que excluye el despliegue en GPU de consumo y encarece la infraestructura.
- El contexto validado llega a 1.048.576 tokens, pero el autor recomienda ≤262.144 para eficiencia y tareas complejas; superar ese umbral puede degradar latencia y calidad.
- Uso previsto como componente asistido por humanos, no como sistema autónomo sin supervisión; no debe ser el componente decisorio en sistemas de apoyo a decisiones.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a su política de uso responsable y es firmante del código de prácticas GPAI de la UE.
- No se han publicado datos de benchmarks ni de cuantizaciones disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Informe técnico: https://aleph-alpha.com/downloads/tech-report.pdf
- Blog técnico: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Código de prácticas GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Nueva versión: Aleph-Alpha/Kolibri-1.1
- Papers referenciados en los tags: arXiv:2512.11614, arXiv:2601.17858
