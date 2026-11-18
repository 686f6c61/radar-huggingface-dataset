# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8-GGUF es una cuantización en formato GGUF de un modelo derivado de la familia Qwen3.6, publicada por el desarrollador independiente LuffyTheFox bajo el paraguas del proyecto Genesis. Parte del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, al que se le ha transferido un ajuste fino orientado a uso agéntico (Hermes) procedente de DJLougen/hermes-qwen3.5-35b-a3b-GGUF, y sobre el que se ha aplicado el denominado método Genesis de "reparación de tensores".

El modelo es un transformer de tipo Mixture-of-Experts con 34.660.610.688 parámetros totales (aproximadamente 35B) y arquitectura A3B, es decir, con unos 3B de parámetros activos por token, según la nomenclatura del nombre. La pipeline declarada es image-text-to-text, lo que indica capacidades multimodales de visión, y los idiomas soportados son inglés, chino y multilingüe. La licencia es Apache 2.0.

Su relevancia actual radica en dos factores: por un lado, ofrece un modelo de gran tamaño con activación dispersa (MoE) en formato GGUF, lo que facilita su despliegue en hardware de consumo mediante llama.cpp u Ollama; por otro, se presenta como una variante "uncensored" con soporte de function calling y orientación agéntica, lo que atrae a desarrolladores que necesitan modelos sin rechazos para pipelines de agentes. El repositorio acumula 273.947 descargas y 732 likes, con un tamaño de 131,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), nomenclatura A3B (aprox. 3B activos) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3B (según nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repo incluye múltiples cuantizaciones; niveles exactos no disponibles) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con soporte de perfiles de cuantización Unsloth e imatrix) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), tal como indica el sufijo A3B del nombre y la etiqueta `moe`. El modelo base es HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, una variante "uncensored" de la familia Qwen3.6. Sobre esa base, el autor ha transferido datos de un ajuste fino en el dataset Hermes (NousResearch/hermes-function-calling-v1) procedente de DJLougen/hermes-qwen3.5-35b-a3b-GGUF, concretamente alrededor de 2.000 bloques de dos tensores de expertos FFN, según la model card.

El elemento diferenciador es el método Genesis, descrito por el autor como un algoritmo de "regeneración y calibración de datos post-entrenamiento" para modelos en GGUF. Según la documentación, opera en tres etapas: primero escanea tensores `ssm_conv1d` (asociados a memoria de contexto largo) y reequilibra las cabezas; después sustituye bloques corruptos o nulos por fragmentos que mejor se ajustan a la distribución de pesos del tensor; y finalmente aplica una SVD personalizada basada en la distribución de Marchenko–Pastur para reducir el ruido de entrenamiento preservando, según el autor, el 99 % de la señal y el gradiente aprendido. El autor indica que no entrena ni ajusta modelos, sino que "repara la pureza de la señal" en los tensores, y que el proceso se ejecutó en Google Colab gratuito con una GPU Tesla T4. No se especifican el número de tokens de entrenamiento ni la composición completa del dataset más allá de la referencia a Hermes.

## Capacidades

- Generación de texto conversacional y multilingüe (inglés, chino y otros idiomas).
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`), incluyendo entrada de imágenes.
- Razonamiento y matemáticas, heredados de la familia Qwen3.6 (sin datos cuantitativos publicados en la información disponible).
- Generación de código, con soporte declarado para uso agéntico.
- Tool calling / function calling, reforzado por el ajuste fino sobre el dataset Hermes de function calling.
- Soporte para flujos agénticos y razonamiento multi-paso (etiqueta `agentic`).
- Modo "uncensored": el autor declara 0/465 rechazos en el modelo base HauhauCS.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con perfiles de cuantización Unsloth.

## Casos de uso

- Agentes autónomos con tool calling: el ajuste sobre Hermes permite invocar funciones y encadenar llamadas en pipelines de automatización, con la ventaja de que el modelo no rechaza peticiones por políticas de contenido.
- Asistente conversacional multilingüe: cubre inglés, chino y otros idiomas, adecuado para atención al cliente en entornos donde se requiere conversación multi-turno.
- Procesamiento de documentos con imágenes: gracias a la pipeline image-text-to-text, puede extraer información de capturas, formularios o diagramas y combinarla con texto.
- Generación de código en local: al ejecutarse en GGUF sobre llama.cpp u Ollama, permite integrar asistencia de código en entornos sin conexión o con requisitos de privacidad.
- Investigación sobre alineación y censura: al ser una variante "uncensored", sirve para estudiar comportamientos sin rechazos y comparar con modelos alineados.
- Despliegue en hardware de consumo: la activación MoE de ~3B parámetros permite ejecutar el modelo en GPUs de gama alta de consumo con cuantizaciones agresivas, útil para prototipado y demos.
- Automatización de tareas de razonamiento multi-paso: adecuado para agentes que requieren planificación y uso de herramientas en cadena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas; únicamente se menciona el dato de 0/465 rechazos del modelo base, que no constituye un benchmark de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de ~35B totales con ~3B activos en GGUF requiere típicamente entre 20 y 24 GB en cuantización Q4_K_M, y más de 40 GB en cuantizaciones altas (Q8) o FP16; estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar A100 40/80 GB, H100 o RTX 4090 para cuantizaciones medias.
- GPU de consumo: probablemente ejecutable en RTX 4090 (24 GB) con cuantizaciones Q4 o inferiores, y en RTX 3090 con las mismas condiciones; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repo incluye un script de cuantización con soporte de perfiles Unsloth e imatrix.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8 (este) | ~35B totales, ~3B activos | No disponible | Apache 2.0 | GGUF | Variante uncensored con ajuste Hermes y reparación Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B totales, ~3B activos | No disponible | No disponible | No disponible | Modelo base del que deriva este |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35B totales, ~3B activos | No disponible | No disponible | GGUF | Fuente del ajuste fino Hermes transferido |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso; requiere moderación externa en producción.
- Riesgo de alucinación: el autor afirma que el método Genesis reduce la verbosidad y las alucinaciones, pero no aporta métricas que lo respalden; debe validarse empíricamente.
- El método Genesis no está avalado por revisión por pares; la descripción matemática (Marchenko–Pastur, SVD personalizada) proviene del propio autor y no se ha verificado de forma independiente.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide garantizar su comportamiento en tareas de contexto largo.
- Idiomas: el soporte declarado se limita a inglés, chino y "multilingual" sin detalle; el rendimiento en castellano no está documentado.
- Licencia Apache 2.0: permite uso comercial, pero el carácter uncensored traslada al usuario la responsabilidad legal y ética del contenido generado.
- Procedencia: es una modificación comunitaria de un modelo derivado, con múltiples capas de ajuste (base uncensored + Hermes + Genesis), lo que dificulta la trazabilidad de sesgos y comportamientos.
- El repositorio incluye llamadas a donaciones y datos de contacto del autor; no afecta al uso técnico, pero conviene tenerlo en cuenta al evaluar la gobernanza del proyecto.

## Enlaces

- [Hugging Face: LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8-GGUF](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8-GGUF)
- [Modelo base: HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive](https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)
- [Ajuste fino Hermes: DJLougen/hermes-qwen3.5-35b-a3b-GGUF](https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF)
- [Script de cuantización con perfiles Unsloth](https://pastebin.com/hXhcMJn9)
- [Discord del proyecto Genesis](https://discord.gg/SZ5vacTXYf)
- [Distribución de Marchenko–Pastur (Wikipedia)](https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution)
- [Dataset NousResearch/hermes-function-calling-v1](https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1)
