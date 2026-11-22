# AXERA-TECH/Qwen3.5-9B-AX8860-llama.cpp

## Resumen

Qwen3.5-9B-AX8860-llama.cpp es una distribución empaquetada del modelo Qwen3.5-9B de Alibaba Qwen, adaptada por AXERA-TECH para ejecutarse sobre la NPU del SoC Axera AX8860 mediante una bifurcación de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los del Qwen3.5-9B original, cuantizados a MXFP4 (6,00 GB) y acompañados de un codificador visual en BF16 (921 MB), junto con binarios estáticos para la placa, kernels de NPU y scripts de arranque.

El interés del paquete es de despliegue, no de modelado. Ofrece un servidor compatible con la API de OpenAI que procesa texto e imagen en local sobre hardware de borde, con 43,7 tokens/s en decodificación y hasta 76,6 tokens/s cuando se activa el decodificador especulativo MTP (multi-token prediction) adaptativo, además de una ventana de contexto configurable de hasta 262.144 tokens. El prefill medido es de 2.959 tokens/s (3.908 tokens en 1,32 s).

La relevancia actual está en la combinación de un modelo de 9.197.093.888 parámetros con capacidades multimodales y contexto largo ejecutándose íntegramente en una NPU de 4 núcleos, sin GPU dedicada. La ficha se limita a los datos publicados por el autor; la información sobre licencia, idiomas y benchmarks de calidad del modelo base no figura en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B); inferencia vía llama.cpp con backend ggml-axera sobre NPU AX8860 |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens; por defecto 16.384 en el servidor (`CTX` configurable) |
| Tipos de cuantización | MXFP4 para pesos (6,00 GB); BF16 para el codificador visual (921 MB) |
| Idiomas soportados | no disponible (los ejemplos de la model card incluyen chino e inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.5-9b-mxfp4.gguf`, `mmproj-qwen3.5-9b-bf16.gguf`) |
| Tamaño del repositorio | 7,8 GB |
| Hardware objetivo | Axera AX8860, SDK V0.5.1 o superior |
| Decodificación especulativa | MTP opcional (adaptativo o forzado), desactivado por defecto |
| Servidor | API compatible con OpenAI (`run.sh -s <puerto>`), `-np 1` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer denso de 9.197.093.888 parámetros del que este repositorio solo redistribuye pesos cuantizados. La model card no documenta la arquitectura interna del modelo base, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la ficha original de Qwen/Qwen3.5-9B y no se reproducen aquí.

La innovación técnica del paquete es el motor de inferencia. Se usa la rama `axera-dev` (commit `0104880be`) del fork ZHEQIUSHUI/llama.cpp, con kernels de NPU propios y binarios enlazados estáticamente para la placa. Sobre esa base se añade MTP opcional: un cabezal de predicción multi-token genera borradores que el modelo objetivo verifica token a token, de modo que la salida en modo greedy es idéntica a la decodificación normal. El modo adaptativo decide por petición si aplicar MTP, con tasas de aceptación que oscilan entre 0,267 y 0,816 según el tipo de contenido. El runtime ocupa los 4 núcleos de NPU en exclusiva y mantiene una caché de prompt en 4 GB de memoria host, con opción de persistirla en SSD mediante `CACHE_DIR`.

## Capacidades

- Generación de texto conversacional y de completado, con decodificación greedy o muestreada.
- Entrada de imagen: el codificador visual `mmproj-qwen3.5-9b-bf16.gguf` permite describir imágenes (vehículos, texto en la escena, personas, según las comprobaciones del autor).
- Contexto largo de hasta 262.144 tokens, útil para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa MTP con aceleración medida de hasta 1,75x en tablas Markdown y 1,58x en traducción chino-inglés.
- Servidor compatible con OpenAI, lo que habilita clientes y SDKs existentes sin adaptación.
- Aceptación de mensajes de sistema en mitad de la conversación, pensado para clientes de agentes como Codex.
- Modo de razonamiento desactivable: el servidor arranca con `--reasoning off` por defecto.
- Traducción y generación de código, con rendimiento medido en los escenarios de benchmark del autor.
- No se documentan capacidades de audio, tool calling explícito ni function calling en la información disponible.

## Casos de uso

- Asistente de documentación en local: con contexto de hasta 262.144 tokens se puede cargar un manual técnico completo y responder preguntas sobre él sin salir del dispositivo, usando `CTX=131072 sh run.sh -s 8080`.
- Descripción de imágenes en el borde: el codificador visual integrado permite procesar capturas de cámaras o documentos escaneados en el propio AX8860, sin enviar datos a la nube, con `sh run.sh -i bus.jpg "Describe this image." 256`.
- Servidor de inferencia interno compatible con OpenAI: al exponer la API estándar, aplicaciones existentes basadas en el SDK de OpenAI pueden apuntar al endpoint local y aprovechar la decodificación a 43,7 tokens/s sin cambios de código.
- Traducción chino-inglés en producción: es el escenario con mayor aceleración MTP medida (1,58x, aceptación 0,691), adecuado para pipelines de traducción por lotes con latencia ajustada.
- Generación de código asistida en entornos con requisitos de confidencialidad: el modelo produce código a 43,6 tokens/s en modo normal y 58,7 tokens/s con MTP adaptativo, y la aceptación de mensajes de sistema intermedios facilita su integración en clientes de agentes tipo Codex.
- Procesamiento de tablas y documentos estructurados: el escenario de tablas Markdown alcanza 76,6 tokens/s con MTP adaptativo (aceptación 0,816), el mejor caso del benchmark, lo que lo hace apropiado para extracción y reformateo de datos tabulares.
- Despliegue en hardware de borde sin GPU: cajas industriales, equipos de campo o dispositivos empotrados con AX8860 pueden ejecutar el modelo con 6,00 GB de pesos MXFP4 y 4 GB de caché de prompt en memoria host.

## Benchmarks y rendimiento

Rendimiento de inferencia publicado por el autor (tokens/s; hasta 256 tokens por prueba, greedy salvo indicación):

| Escenario | Normal | MTP adaptativo | MTP forzado | Aceleración | Aceptación |
|---|---:|---:|---:|---:|---:|
| Código | 43,6 | 58,7 | 61,9 | 1,35x | 0,595 |
| Traducción (chino-inglés) | 43,0 | 67,9 | 64,1 | 1,58x | 0,691 |
| Tabla Markdown | 43,7 | 76,6 | 77,1 | 1,75x | 0,816 |
| Matemáticas | 43,5 | 66,3 | 66,0 | 1,52x | 0,667 |
| Ensayo en chino | 43,7 | 43,4 | 47,3 | 0,99x | 0,369 |
| Relato en inglés | 43,4 | 42,3 | 47,3 | 0,97x | 0,376 |
| Código, muestreado | 42,7 | 42,1 | 39,4 | 0,98x | 0,444 |
| Ensayo en chino, muestreado | 43,2 | 42,9 | 28,7 | 0,99x | 0,267 |
| Lista de comandos Linux | 43,1 | 54,2 | 55,1 | 1,26x | 0,500 |
| Explicación en chino | 42,8 | 43,2 | 50,5 | 1,01x | 0,433 |

Métricas de prefill y contexto (`bench.sh`, 128 tokens generados):

| Prompt | `-c` | Tiempo de prompt | Decodificación |
|---|---:|---:|---:|
| 3.908 tokens | 8192 | 1,32 s | 41,9 tokens/s |
| 3.908 tokens | 262144 | 1,31 s | 41,5 tokens/s |
| 3.908 tokens, muestreado | 8192 | 1,32 s | 41,5 tokens/s |

Calidad: perplexity de 20,8654 (`-ub 1`) y 20,8061 (`-ub 4`) sobre 2 chunks de `ppl_zh.txt`; 23,7616 y 23,7930 sobre 20 chunks de `ppl_zh_long.txt`. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- NPU Axera AX8860 obligatoria, con SDK V0.5.1 o superior; el runtime ocupa los 4 núcleos de NPU en exclusiva.
- Pesos del modelo: 6,00 GB en MXFP4 más 921 MB del codificador visual en BF16, es decir, unos 6,9 GB de almacenamiento.
- Memoria host: 4 GB reservados por defecto para la caché de prompt; ampliable a SSD con `CACHE_DIR`.
- No es ejecutable en GPU de consumo (RTX 4090, etc.) a través de este paquete: los binarios son estáticos para la placa y dependen de los kernels de NPU incluidos.
- Despliegue mediante los scripts `run.sh` (texto, imagen, chat, servidor) y `bench.sh`; no se documenta soporte para vLLM, TGI, Ollama ni llama.cpp estándar con este paquete.
- Throughput medido: 43,7 tokens/s de decodificación en modo normal, hasta 76,6 tokens/s con MTP adaptativo, y 2.959 tokens/s de prefill.
- Reproducción de rendimiento con `llama-bench -b 4096 -ub 4096`.
- Incidencia conocida: fallos intermitentes `ret = -3` en peticiones consecutivas en algunos entornos, resolubles con reintento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Hardware objetivo | Licencia |
|---|---:|---|---|---|---|
| Qwen3.5-9B-AX8860-llama.cpp | 9,20 B | hasta 262.144 | GGUF, MXFP4 + BF16 (visión) | NPU Axera AX8860 | no disponible |
| Qwen/Qwen3.5-9B (base) | 9,20 B | no disponible | safetensors (original) | GPU / CPU genéricas | no disponible |
| Otras distribuciones llama.cpp del mismo base | 9,20 B | según configuración | GGUF | CPU / GPU según backend | según distribuidor |

La comparación relevante es frente al modelo base sin empaquetar: este paquete fija la cuantización a MXFP4, restringe la ejecución a la NPU AX8860 y añade MTP y servidor OpenAI, mientras que el base es portable a otros backends pero no incluye esas optimizaciones. No se dispone de datos de benchmarks de calidad para comparar el rendimiento del modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia total del hardware: sin una AX8860 con SDK V0.5.1 o superior el paquete no es utilizable; no hay ruta de ejecución en GPU o CPU convencional.
- Licencia no disponible en la información proporcionada: no puede confirmarse la viabilidad de uso comercial sin consultar la ficha del modelo base Qwen/Qwen3.5-9B.
- Idiomas soportados no documentados; los ejemplos y benchmarks se limitan a chino e inglés.
- MTP desactivado por defecto; en modo adaptativo rinde peor que la decodificación normal en ensayos, relatos y código con muestreo (factores de 0,97x a 0,99x) y en MTP forzado con muestreo cae hasta 28,7 tokens/s.
- Las peticiones greedy deben enviar explícitamente `presence_penalty: 0`; de lo contrario el servidor aplica su penalización recomendada, se desactiva el greedy fusionado y el MTP adaptativo no se activa.
- El modo de razonamiento está desactivado por defecto en el servidor (`--reasoning off`), lo que puede degradar tareas que se beneficien de cadena de pensamiento.
- Los binarios descargados de Hugging Face carecen de permiso de ejecución; deben invocarse con `sh`.
- Fallos intermitentes `ret = -3` en peticiones consecutivas en determinados entornos.
- La cuantización MXFP4 puede introducir pérdida de precisión frente a los pesos originales; la perplexity publicada (20,87 / 23,76) no se acompaña de comparación con el modelo sin cuantizar.
- El servidor se ejecuta con `-np 1` y monopoliza la NPU, lo que limita el paralelismo a una sola petición simultánea.
- Riesgo de alucinación y sesgos del modelo base: no evaluados en la documentación disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-9B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
- Documentación de MTP incluida en el repo: `MTP.md`
- Reproducción de benchmarks incluida en el repo: `bench.sh`, `scenes/`
