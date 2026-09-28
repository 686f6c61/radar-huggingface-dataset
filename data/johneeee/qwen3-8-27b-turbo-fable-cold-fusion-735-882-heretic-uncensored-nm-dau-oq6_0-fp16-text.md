# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ6_0-fp16-text

## Resumen

Este repositorio contiene una cuantización en formato MLX del modelo Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un ajuste fino de aproximadamente 27B parámetros derivado de la familia Qwen y publicado por el usuario Johneeee. No es un modelo entrenado desde cero: es una conversión con cuantización de precisión mixta de 5 bits generada con la herramienta oQ (oMLX v0.7.0.dev4), orientada a inferencia local en hardware Apple Silicon mediante la librería MLX.

El recuento real de safetensors es de 26.895.998.464 parámetros (unos 26,9B, pese a la denominación comercial "27B") y el repositorio ocupa 20,5 GB, lo que lo sitúa en la gama de modelos ejecutables en equipos de consumo con memoria unificada amplia. Su interés radica en tres factores combinados: tamano manejable para inferencia local, una ventana de contexto de hasta 262.144 tokens atribuida a la variante NM-DAU y el carácter "uncensored" del ajuste, que elimina parte de las capas de rechazo del modelo original.

La relevancia actual es doble. Por un lado, es un caso práctico de cuantización mixta en MLX, con grupo de 64 y capas parcialmente en fp16. Por otro, al no declarar licencia ni idiomas y acumular cero descargas, debe tratarse como un artefacto experimental: cualquier uso en producción exige verificar antes la procedencia del ajuste base y los términos legales aplicables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen; tipo declarado en la model card: qwen3_5 |
| Parámetros totales | 26.895.998.464 (26,9B) según safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens según la ficha de la variante NM-DAU en directorios de terceros; no confirmado en la model card de este repositorio |
| Tipos de cuantización | 5 bits, group size 64, precisión mixta con capas fp16 (sufijo oQ6_0-fp16); existen variantes oQ2e y GGUF del mismo linaje |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (cuantizado, group size 64) |
| Librería | mlx |
| Tamano del repositorio | 20,5 GB |
| Herramienta de cuantización | oQ (oMLX v0.7.0.dev4) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-28 |

## Arquitectura y entrenamiento

La model card únicamente declara el tipo de modelo (qwen3_5), la librería (mlx) y los parámetros de cuantización: 5 bits, group size 64 y formato MLX safetensors. No se documenta en este repositorio ni la arquitectura interna ni el proceso de entrenamiento; la información procede del linaje del ajuste base.

Según la documentación de terceros sobre la variante NM-DAU del mismo linaje, el modelo base se construyó mediante un proceso de ajuste fino en varias etapas que incluye mezcla de múltiples modelos (multi-model merging), un entrenamiento denominado "COLD FUSION", una etapa "Fable Fusion 711" y una fase final de destape ("uncensoring") y ajuste. La etiqueta "Heretic" del nombre apunta a la aplicación de técnicas de eliminación o atenuación del comportamiento de rechazo. Estos detalles corresponden al modelo original de DavidAU, no a una verificación independiente de esta cuantización concreta, y no se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de este repositorio es exclusivamente la cuantización: precisión mixta de 5 bits con group size 64, en la que determinadas capas se mantienen en fp16 (de ahí el sufijo "oQ6_0-fp16"), un esquema habitual para preservar calidad en capas sensibles mientras se reduce el peso total. No se documentan mecanismos adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto en modo texto-a-texto; el nombre del repositorio termina en "-text", lo que sugiere una variante sin visión. Algunos directorios de terceros describen la familia como "image-text-to-text" y mencionan visión, pero esto no está confirmado en la model card de este repositorio.
- Razonamiento y conocimiento general, heredados del modelo base Qwen y del ajuste fino multi-etapa.
- Generación de código: una variante hermana del mismo linaje (NEO-CODER-MAX-MTP) se comercializa explícitamente para programación, por lo que es razonable esperar capacidad de código, aunque no hay evaluación publicada de esta cuantización.
- Escritura creativa y narrativa sin restricciones temáticas derivadas del alineamiento, como consecuencia del ajuste "uncensored".
- Conversaciones multi-turno con contexto muy largo (hasta 262.144 tokens según la variante base), útil para documentos extensos.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo de razonamiento explícito (thinking), audio o visión: no documentados.

## Casos de uso

- Asistente de programación totalmente local: el modelo puede ejecutarse en un Mac con memoria unificada amplia y usarse como copiloto en el editor sin enviar código a servicios externos, algo crítico en entornos con código propietario o bajo acuerdos de confidencialidad.
- Análisis de documentación extensa: gracias a la ventana de hasta 262.144 tokens atribuida al modelo base, es posible cargar manuales técnicos, expedientes o bases de código completas en un único prompt y formular preguntas sobre el conjunto.
- Investigación sobre alineamiento y rechazo: al ser un ajuste "heretic/uncensored", resulta útil como objeto de estudio para medir qué comportamientos de rechazo persisten, cuáles desaparecen y con qué coste en calidad general.
- Generación de datos sintéticos: puede emplearse para producir corpus de texto o de diálogo a escala en un pipeline por lotes, siempre que se revise el contenido y se respeten las condiciones de uso del modelo base.
- Escritura creativa y narrativa sin filtros temáticos: adecuado para ficción, guiones o juegos de rol donde los modelos alineados rechazan con frecuencia determinados temas; requiere revisión humana posterior.
- Procesamiento de datos sensibles en local: en sectores como legal, sanitario o financiero, la inferencia en el propio equipo evita la transferencia de información a terceros, aunque deben aplicarse las salvaguardas internas correspondientes.
- Cuantización e investigación de formatos: sirve como referencia práctica para evaluar el impacto de la cuantización mixta de 5 bits con oQ frente a otras variantes del mismo linaje (oQ2e, GGUF en 4 y 8 bits).
- Prototipado rápido en Apple Silicon: por su tamano de 20,5 GB, es viable iterar sobre prompts y ajustes de parámetros de muestreo en un único equipo de sobremesa, sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para esta cuantización en la información disponible.

Los únicos datos numéricos localizados corresponden a la variante de DavidAU del mismo linaje y son afirmaciones del propio autor del ajuste fino, no mediciones independientes ni de este repositorio:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C | 735 | En cuantización de 8 bits, según el autor del ajuste base; se afirma que supera en 144 puntos a Qwen 3.8 27B |
| ARC-C | Más de 718 | En cuantización de 4 bits, según el autor del ajuste base |
| ARC-E | 880 | En cuantización de 8 bits, según el autor del ajuste base |
| MMLU, HumanEval, GSM8K | No disponible | Sin datos publicados |

Estos valores no deben extrapolarse a la versión MLX de 5 bits aquí descrita sin una evaluación propia.

## Requisitos de hardware

- Pesos: el repositorio ocupa 20,5 GB en disco (27B parámetros a 5 bits con group size 64 y algunas capas en fp16). Esa cifra es la referencia mínima de memoria para cargar el modelo.
- Memoria unificada en Apple Silicon: se necesita al menos 32 GB para cargar los pesos con margen escaso; 64 GB es el mínimo cómodo y 128 GB o más permite trabajar con contextos largos. Un Mac Studio con M2 Ultra y 192 GB o un M3/M4 Max con 64-128 GB son los perfiles naturales.
- El KV cache para contextos de hasta 262.144 tokens consume memoria adicional muy significativa; no se han publicado cifras concretas de consumo por token de contexto para este modelo.
- GPU CUDA: no se documenta soporte. El formato es MLX safetensors, específico del ecosistema Apple; para NVIDIA sería necesaria una conversión a otro formato, no descrita en la información disponible.
- Comparativa de referencia: el modelo base en BF16 requiere aproximadamente 56,31 GB según directorios de terceros, frente a los 20,5 GB de esta cuantización de 5 bits.
- Opciones de despliegue: mlx-lm y el propio ecosistema oMLX/oQ son las vías naturales. Ollama, vLLM, TGI y llama.cpp no están documentados para este repositorio; llama.cpp requeriría una conversión a GGUF, disponible en variantes publicadas por terceros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Johneeee, oQ6_0-fp16-text) | 26,9B | No confirmado en la model card (262.144 tokens en la variante base) | MLX safetensors, 5 bits | No disponible | 0 descargas, 0 likes |
| Johneeee/...-NM-DAU-oQ2e | Mismo linaje | No disponible | MLX safetensors, cuantización oQ2e | No disponible | Variante hermana del mismo autor |
| DavidAU/...-NEO-CODER-MAX-MTP-GGUF | 27B | 262.144 tokens | GGUF (4 y 8 bits) | No disponible | Publicado por el autor del ajuste fino base; orientado a código |
| Qwen 3.8 27B (modelo de referencia citado en el ajuste) | 27B | No disponible | No disponible | No disponible | Referencia de comparación usada por el autor del ajuste, sin ficha detallada en la información disponible |

No se dispone de datos suficientes para comparar rendimiento medido entre estas opciones.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican los términos de uso, lo que impide determinar si el uso comercial está permitido. Es un riesgo legal directo para cualquier despliegue en producción.
- Modelo "uncensored/heretic": el ajuste elimina o atenúa deliberadamente el comportamiento de rechazo, por lo que puede generar contenido inapropiado, ofensivo o potencialmente danino sin filtros. Requiere supervisión humana y capas de moderación externas.
- Sesgos: no hay documentación sobre sesgos de género, raza, idioma o ideología. Un ajuste fino multi-etapa sobre datos no especificados puede intensificar sesgos presentes en el modelo base.
- Alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinación. El carácter no alineado del ajuste puede reducir la cautela del modelo al afirmar hechos.
- Idiomas: no se declaran idiomas soportados. No hay garantía de calidad fuera del inglés o del chino, idiomas habituales de la familia Qwen.
- Contexto: los 262.144 tokens provienen de fuentes de terceros sobre la variante base, no de la model card de esta cuantización. No hay medición de degradación de calidad en contextos largos ni datos de consumo de memoria del KV cache.
- Trazabilidad: el repositorio tiene cero descargas y cero likes, sin pipeline declarado, sin papers ni evaluación independiente. El nombre del modelo mezcla referencias a "Qwen3.8" y un tipo interno "qwen3_5", y el recuento real de parámetros (26,9B) no coincide con la etiqueta "27B".
- Estado del artefacto: se desconoce si el repositorio es una cuantización verificada del modelo base o un experimento sin validación; conviene contrastar los pesos con la fuente original antes de usarlos.
- Vision: aunque algunos listados de terceros describen la familia como image-text-to-text, el sufijo "-text" de este repositorio y la ausencia de mención en la model card apuntan a una variante solo de texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ6_0-fp16-text
- Variante oQ2e del mismo autor: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ2e
- Variante GGUF de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder-max-mtp-gguf-davidau
- Ficha en llmrun.dev: https://llmrun.dev/model/davidau-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau
- Ficha en essamamdani.com: https://essamamdani.com/ai-models/hf-davidau-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder-max-mtp-gguf
