# nightmedia/Qwen3.5-9B-Brainwaves-Roasteramus-mxfp8-mlx

## Resumen

Qwen3.5-9B-Brainwaves-Roasteramus-mxfp8-mlx es una fusión experimental publicada por nightmedia, un laboratorio independiente radicado en Montana (EE. UU.) que trabaja sobre un MacBook Pro de 128 GB. El modelo combina dos derivados del mismo tronco Qwen3.5-9B: por un lado `axiomofmind/Roasteramus`, un fine-tune de personalidad "roast" desarrollado por A Hole AI que responde a peticiones cotidianas con bromas e insultos; por otro, `nightmedia/Qwen3.5-9B-Brainwaves`, un ajuste orientado a razonamiento, escritura creativa y código. La fusión se distribuye ya cuantizada en mxfp8 para MLX, lo que la sitúa en el ecosistema de ejecución local sobre Apple Silicon.

El modelo resuelve, en la práctica, un problema de experimentación: ver qué ocurre al mezclar un carácter fuertemente sesgado hacia el sarcasmo con un modelo de propósito general. No es un lanzamiento de producción, sino una prueba de fusión con métricas parciales publicadas. Cuenta con 9.409.813.744 parámetros reales (9,41 B), un repositorio de 10,2 GB, licencia Apache 2.0 y soporte declarado de inglés, chino, japonés y español.

La relevancia actual es doble: por un lado, demuestra el flujo de trabajo de mergekit aplicado a modelos pequeños y ejecutables en hardware de consumo; por otro, publica cifras medidas de perplejidad, memoria pico y velocidad de generación (4,122 de perplejidad, 16,02 GB de memoria pico y 671 tokens/s en mxfp8), datos poco frecuentes en fichas de modelos experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explícita; fusión de dos fine-tunes sobre la familia Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible en la model card; las etiquetas del repositorio mencionan "256k context" y "1M context" |
| Tipos de cuantizacion | mxfp8 (MLX), bf16 y 8-bit citados en las etiquetas |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio MLX cuantizado en mxfp8) |
| Parametros derivados | tamaño del repositorio: 10,2 GB; pipeline declarada en HuggingFace: image-text-to-text |
| Modelos base | axiomofmind/Roasteramus; nightmedia/Qwen3.5-9B-Brainwaves |
| Fechas | creado el 2026-10-08; actualizado el 2026-10-09 |

## Arquitectura y entrenamiento

La ficha no documenta la arquitectura interna más allá de identificar el tronco como Qwen3.5-9B. No se especifica si se trata de un transformer denso, de una variante MoE o de un diseño híbrido, ni se detalla el número de capas, cabezas de atención o dimensión oculta. Tampoco se indica la longitud de contexto nativa, aunque las etiquetas del repositorio citan explícitamente "256k context" y "1M context", valores que no vienen respaldados por ninguna medición en la model card.

El proceso de construcción es una fusión (merge) de dos adaptaciones del mismo modelo base, realizada con mergekit según las etiquetas. El componente `axiomofmind/Roasteramus` es un fine-tune de personalidad de 9B sobre Qwen3.5-9B desarrollado por A Hole AI, entrenado para convertir hábitos vergonzosos, compras cuestionables o situaciones cotidianas en réplicas cortas y mordaces. El componente `nightmedia/Qwen3.5-9B-Brainwaves` aporta el grueso de las capacidades generales. Las etiquetas mencionan técnicas de SFT, LoRA, destilación desde Claude (claude-distillation, claude4.6), chain-of-thought y long-cot, además de multi-token-prediction y decodificación especulativa, pero no se publica ningún detalle cuantitativo sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional, con ajuste de instrucciones (instruction-tuned) y orientación a diálogo multi-turno.
- Razonamiento explícito: las etiquetas incluyen reasoning, chain-of-thought y long-cot, y la model card muestra un ejemplo de respuesta con análisis matemático estructurado sobre mecánica cuántica y arquitecturas transformer.
- Codificación: el autor sugiere, sin demostrarlo, que la mezcla "podría ser buena depurando código" ("I figured it might be good at code debugging"). No hay benchmarks de código publicados.
- Matemáticas y STEM: presentes como etiquetas, sin métricas asociadas.
- Escritura creativa y ficción: generación de tramas, subtramas, escenas, relatos y ciencia ficción, con etiquetas específicas de prosa vívida.
- Roleplay y adopción de personajes, potenciado por el componente de personalidad sarcástica.
- Multilingüismo declarado en cuatro idiomas: inglés, chino, japonés y español. No se especifica el nivel de competencia en cada uno.
- Soporte de tool calling y function calling: no disponible; no se menciona en la model card.
- Capacidades de agente y razonamiento multi-paso: no disponible de forma explícita.
- Visión: la pipeline declarada en HuggingFace es image-text-to-text, pero la model card no documenta ninguna capacidad multimodal ni incluye ejemplos con imágenes. Debe considerarse no verificada.
- Modo "thinking" explícito: no disponible como funcionalidad separada, aunque las etiquetas de razonamiento apuntan a cadenas de pensamiento largas.

## Casos de uso

- Depuración de código con tono informal: el autor plantea la hipótesis de que la mezcla del carácter mordaz con el componente generalista puede producir explicaciones de errores más directas y con humor. Es un uso especulativo, sin evaluación publicada, y no debería adoptarse en un pipeline de CI/CD sin validación previa.
- Generación de tramas y subtramas de ficción: el modelo está etiquetado para plot generation, sub-plot generation y story generation, con soporte para ciencia ficción y todo tipo de géneros. Encaja en herramientas de escritura asistida donde se necesita producir variantes argumentales a partir de un escenario breve.
- Continuación de escenas y prosa vívida: la etiqueta "scene continue" apunta a la reescritura y continuación de pasajes manteniendo un registro descriptivo. Útil en talleres literarios y prototipado de guiones.
- Roleplay y personajes con carácter definido: el componente Roasteramus está entrenado para responder con sarcasmo a partir de detalles cotidianos, lo que lo hace adecuado para bots de entretenimiento, no para atención al cliente.
- Generación multilingüe en inglés, chino, japonés y español: permite prototipos de asistentes en esos cuatro idiomas desde un único punto de despliegue, aunque no hay evaluación de calidad por idioma.
- Ejecución local en Apple Silicon: con 16,02 GB de memoria pico y 671 tokens/s medidos en mxfp8 sobre el hardware del propio laboratorio, es viable como asistente offline en equipos con memoria unificada amplia.
- Investigación sobre fusión de modelos: sirve como caso de estudio reproducible de mergekit aplicado a dos fine-tunes con personalidades divergentes, con métricas de perplejidad antes y después de la fusión.
- Experimentación con ajuste por destilación: las etiquetas de claude-distillation y sft lo convierten en un punto de partida para estudiar hasta qué punto se preservan capacidades generales tras una fusión de este tipo.

## Benchmarks y rendimiento

La model card únicamente publica tres métricas para el modelo fusionado, frente a las siete del componente Brainwaves y del baseline Qwen3.5-9B Instruct. Todas las cifras corresponden a la cuantización mxfp8.

| Benchmark | Brainwaves-Roasteramus (mxfp8) | Qwen3.5-9B-Brainwaves (mxfp8) | Qwen3.5-9B Instruct (mxfp8) |
|---|---|---|---|
| ARC | 0,688 | 0,678 | 0,571 |
| ARC-E | 0,862 | 0,856 | 0,719 |
| BoolQ | 0,902 | 0,904 | 0,895 |
| HellaSwag | no disponible | 0,763 | 0,683 |
| OBKQA | no disponible | 0,502 | 0,426 |
| PIQA | no disponible | 0,800 | 0,770 |
| Winogrande | no disponible | 0,702 | 0,671 |
| Perplejidad | 4,122 ± 0,026 | 4,292 ± 0,028 | no disponible |
| Memoria pico | 16,02 GB | 16,02 GB | no disponible |
| Tokens por segundo | 671 | 624 | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de razonamiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- Memoria pico medida: 16,02 GB con cuantización mxfp8, tanto para la fusión como para el componente Brainwaves. Es el único dato de consumo publicado.
- Estimación teórica en bf16: aproximadamente 18,8 GB solo para pesos (2 bytes por parámetro sobre 9,41 B), sin contar caché KV ni overhead del runtime. Es un cálculo derivado, no una medición.
- GPU recomendadas: no disponible. La model card no menciona GPU concretas (A100, H100, RTX 4090 ni similares).
- Viabilidad en GPU de consumo: no confirmada por el autor. Los 16,02 GB medidos quedan por encima de los 16 GB de una RTX 4090 en su configuración habitual, por lo que el margen es nulo o negativo; se desconoce el comportamiento exacto con offloading.
- Hardware de referencia real: el laboratorio trabaja sobre un MacBook Pro de 128 GB de memoria unificada y tarjetas de memoria, según declara en su propia ficha.
- Opciones de despliegue: el repositorio está en formato MLX cuantizado en mxfp8, por lo que el camino natural es mlx-lm sobre Apple Silicon. También se declara compatible con la librería transformers y pesos safetensors. No hay información sobre vLLM, TGI, llama.cpp, Ollama ni GGUF.
- Latencia y throughput: 671 tokens/s para la fusión y 624 tokens/s para Brainwaves, medidos en mxfp8 en el hardware del autor. No se especifica la configuración exacta de la prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-Roasteramus-mxfp8-mlx | 9,41 B | no disponible (etiquetas: 256k y 1M) | ARC 0,688; ARC-E 0,862; BoolQ 0,902; perplejidad 4,122 | Apache 2.0 | HuggingFace, repo de 10,2 GB en MLX mxfp8 |
| nightmedia/Qwen3.5-9B-Brainwaves (modelo base de la fusión) | no disponible | no disponible | ARC 0,678; ARC-E 0,856; BoolQ 0,904; HellaSwag 0,763; PIQA 0,800; OBKQA 0,502; Winogrande 0,702; perplejidad 4,292 | no disponible | HuggingFace |
| axiomofmind/Roasteramus (modelo base de la fusión) | 9 B según la ficha | no disponible | no disponible | no disponible | HuggingFace |
| Qwen3.5-9B Instruct (baseline) | no disponible | no disponible | ARC 0,571; ARC-E 0,719; BoolQ 0,895; HellaSwag 0,683; PIQA 0,770; OBKQA 0,426; Winogrande 0,671 | no disponible | HuggingFace |

Comparado con el baseline Qwen3.5-9B Instruct, la fusión mejora en ARC (0,688 frente a 0,571), ARC-E (0,862 frente a 0,719) y BoolQ (0,902 frente a 0,895). Frente al componente Brainwaves, la fusión sube en ARC y ARC-E, se mantiene prácticamente igual en BoolQ y mejora ligeramente la perplejidad (4,122 frente a 4,292). No se dispone de comparaciones con otros modelos de la misma categoría fuera de esta familia.

## Limitaciones y advertencias

- Modelo experimental: la propia ficha lo etiqueta como experimental y no describe validaciones de seguridad, sesgos ni robustez.
- Personalidad entrenada para el sarcasmo y el insulto: el componente Roasteramus está ajustado para responder a peticiones ordinarias con bromas e insultos. Esto lo inhabilita para atención al cliente, entornos educativos, sanitarios o cualquier uso con audiencia no advertida.
- Riesgo elevado de alucinación: no se publican evaluaciones de fidelidad factual ni de tasas de alucinación. Las respuestas del ejemplo incluido en la ficha son análisis libres, no verificados.
- Cobertura de benchmarks incompleta: de las siete pruebas del componente base, la fusión solo reporta tres. No hay datos de MMLU, HumanEval, GSM8K ni de tareas de código o matemáticas, pese a que las etiquetas las anuncian.
- Contexto sin verificar: las etiquetas afirman ventanas de 256k y 1M tokens, pero la model card no documenta ninguna prueba de recuperación en contexto largo. Debe tratarse como una afirmación sin respaldo empírico.
- Capacidad multimodal sin confirmar: la pipeline declarada es image-text-to-text, algo incoherente con una ficha que no menciona visión en ningún punto. No debe asumirse soporte de imágenes.
- Idiomas: se declaran cuatro idiomas sin métricas por idioma. El rendimiento real en español, japonés o chino es desconocido.
- Adopción nula: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- Licencia: Apache 2.0 permite uso comercial del modelo, pero no cubre las condiciones de los modelos base ni de los datos de destilación empleados. Conviene revisar la licencia de Qwen3.5-9B y de los componentes destilados desde Claude antes de un uso comercial.
- Origen de los datos: la ficha menciona destilación desde Claude (claude4.6) sin detallar el corpus. Esto puede introducir restricciones derivadas de los términos de uso del proveedor original.
- Reproducibilidad: no se documentan semillas, hiperparámetros de fusión ni el prompt completo del ejemplo de prueba, que aparece truncado en la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-Roasteramus-mxfp8-mlx
- Modelo base 1: https://huggingface.co/axiomofmind/Roasteramus
- Modelo base 2: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Imagen de portada del repositorio: https://cdn-uploads.huggingface.co/production/uploads/67b0caceb06805a4370c44c5/bbo7wKlPMiC3vNbpf9Lyg.png
- Laboratorio: NightmediaAI (no se proporciona URL en la información disponible)
- Papers, blogs, repositorios de código y demos adicionales: no disponibles en la información proporcionada
