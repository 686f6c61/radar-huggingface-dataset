# ggml-org/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de tipo imagen-texto desarrollado por Thinking Machines. Se trata de un modelo de mezcla de expertos (MoE) con 26.070 millones de parámetros totales, diseñado para tareas conversacionales que combinan entrada visual y textual. Su característica arquitectónica más distintiva es el uso de un núcleo recurrente ("loop core") que reevalúa determinadas capas varias veces por token, lo que incrementa la profundidad efectiva del cómputo sin aumentar el número de matrices de pesos.

La versión aquí descrita es la cuantización en formato GGUF publicada por ggml-org, el equipo detrás de llama.cpp, lo que la hace ejecutable en hardware de consumo mediante `llama.cpp` o `llama.app`. El repositorio incluye pesos en BF16, Q8_0 e IQ4_NL, además del codificador visual en formato mmproj, y está pensado para despliegue local con la herramienta `llama serve`.

Este lanzamiento es relevante porque demuestra que un MoE multimodal con 128 expertos y capacidades de razonamiento configurable puede distribuirse en cuantizaciones de 4 bits con pérdida de calidad medida y documentada (divergencia KL frente a BF16), facilitando su uso en entornos sin infraestructura de datacenter. La información pública disponible sobre el modelo base es limitada: no se especifican licencia, idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente ("loop core"); 24 capas, de las cuales las capas 6-17 se ejecutan 3 veces por token (48 evaluaciones de capa efectivas) |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | 8 expertos activos de 128 por token (dato de la model card; no se indica el número exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, IQ4_NL (imatrix-calibrada); codificador visual en BF16 y Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Inkling 2 Mini emplea una arquitectura de mezcla de expertos con 128 expertos enrutados y 8 activos por token, organizada en 24 capas. La innovación principal es el núcleo recurrente: las capas 6 a 17 forman un bloque que se ejecuta tres veces por token, de modo que cada token atraviesa 48 evaluaciones de capa utilizando únicamente los pesos de 24 capas distintas. Cada pasada mantiene su propia caché KV y de convolución, lo que implica un coste de memoria de contexto superior al de un transformer convencional del mismo número de capas. El modelo acepta entrada de imagen, gestionada por un codificador visual independiente empaquetado como mmproj.

El checkpoint original almacena los expertos enrutados de las capas 0-19 en NVFP4 y los de las capas 20-23 en MXFP8, lo que sugiere un entrenamiento o ajuste orientado a precisiones reducidas. La cuantización IQ4_NL de ggml-org convierte los expertos NVFP4 (`ffn_gate_up_exps` y `ffn_down_exps` de las capas 0-19) a IQ4_NL y mantiene el resto de matrices en Q8_0, con los pesos del controlador del bucle en F32. La calibración se realizó con una imatrix calculada a partir del BF16 sobre los datos de calibración v6 de bartowski, renderizando las conversaciones con la plantilla de chat del modelo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con entrada de imagen (pipeline image-text-to-text).
- Razonamiento con profundidad configurable mediante el parámetro `reasoning_effort`, con valores `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh`, `max`, o un número entre 0.0 y 0.99.
- Procesamiento de imágenes combinado con texto, gracias al codificador visual incluido en los ficheros mmproj.
- Mezcla de expertos con 8 expertos activos por token, lo que reduce el cómputo por token frente a un modelo denso del mismo tamaño total.
- Ejecución local mediante `llama.cpp` y `llama.app`, con compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades de tool calling, function calling y agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local con entrada visual: el modelo puede recibir una imagen junto con una pregunta y mantener una conversación multi-turno, ejecutándose en una estación de trabajo con `llama serve` y la cuantización IQ4_NL de 17,6 GB.
- Análisis de capturas de pantalla o documentos escaneados: dado su pipeline image-text-to-text, permite extraer y razonar sobre contenido visual sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de agentes con razonamiento graduable: el parámetro `reasoning_effort` permite ajustar el coste computacional por consulta, usando `minimal` o `low` para respuestas rápidas y `high` o `max` para tareas que requieren cadenas de razonamiento más largas.
- Despliegue en hardware de consumo: con la cuantización IQ4_NL (17,6 GB) el modelo cabe en GPUs de gama alta para consumidores con 24 GB de VRAM, lo que facilita la experimentación sin infraestructura de datacenter.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas de divergencia KL frente a BF16, lo que permite a investigadores medir el impacto de la cuantización en sus propios conjuntos de evaluación antes de decidir el formato de despliegue.
- Integración en aplicaciones de escritorio mediante `llama.app`: el comando `llama serve -hf ggml-org/Inkling-2-Mini-GGUF:IQ4_NL` permite levantar un servidor local compatible con endpoints, útil para conectar interfaces propias o clientes existentes.
- Investigación sobre arquitecturas recurrentes: el núcleo de bucle con caché KV y de convolución independiente por pasada constituye un caso de estudio práctico para quienes investigan eficiencia en profundidad efectiva frente a número de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona métricas de fidelidad de cuantización:

| Metrica | Q8_0 | IQ4_NL |
|---|---|---|
| Divergencia KL frente a BF16 (wikitext-2, 40 x 512 tokens) | 0,0030 | 0,0095 |
| Coincidencia de token top-1 frente a BF16 | 97,6 % | 95,5 % |
| Tamano del fichero | 27,8 GB | 17,6 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,6 GB con IQ4_NL y 27,8 GB con Q8_0 para los pesos; a ello hay que sumar el codificador visual (642 MB en BF16 o 346 MB en Q8_0) y la memoria de contexto, que se ve incrementada por las tres pasadas del núcleo recurrente, cada una con su propia caché KV y de convolución.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada. Por tamaño de pesos, IQ4_NL requiere GPUs con al menos 24 GB de VRAM para dejar margen al contexto; Q8_0 requiere alrededor de 32 GB o más.
- ¿Cabe en GPU de consumo? IQ4_NL es viable en tarjetas de 24 GB (por ejemplo, RTX 4090) si se limita la longitud de contexto; Q8_0 queda fuera de la gama de consumo habitual.
- Opciones de despliegue: `llama.cpp` y `llama.app` mediante `llama serve -hf ggml-org/Inkling-2-Mini-GGUF:IQ4_NL`. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El coste por token es superior al de un transformer de 24 capas debido a las 48 evaluaciones de capa efectivas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE multimodal con núcleo recurrente) ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse la legalidad del uso comercial ni las condiciones de redistribución. Es imprescindible verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini` antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: se desconoce la cobertura multilingüe y la calidad en idiomas distintos del inglés.
- Longitud de contexto no documentada: no puede planificarse el uso en tareas de contexto largo sin verificar experimentalmente el límite real.
- La cuantización IQ4_NL introduce una divergencia medible (KL 0,0095, 95,5 % de coincidencia top-1 frente a BF16); en tareas sensibles a la precisión conviene validar con Q8_0 o BF16.
- El coste de memoria de contexto es mayor de lo habitual por el núcleo recurrente: cada una de las tres pasadas mantiene su propia caché KV y de convolución, lo que puede limitar la longitud de contexto práctica en GPUs de consumo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de usar el modelo en dominios críticos.
- El repositorio tiene 0 descargas en el momento de la consulta y fue creado en noviembre de 2026, por lo que la comunidad de usuarios y el soporte todavía son incipientes.
- El razonamiento configurable mediante `reasoning_effort` puede incrementar sustancialmente el número de tokens generados en niveles altos, con el consiguiente impacto en latencia y coste.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Fichero imatrix: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF/blob/main/imatrix.gguf
- Datos de calibración de bartowski: https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a
- Herramienta de ejecución: https://llama.app
