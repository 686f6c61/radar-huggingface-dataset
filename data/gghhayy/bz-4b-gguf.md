# Gghhayy/Bz-4B-GGUF

## Resumen

Bz-4B-GGUF es la conversión al formato GGUF del modelo base Gghhayy/Bz-4B, publicada por el mismo autor (Gghhayy) y pensada para su uso con llama.cpp. Se trata de un modelo de aproximadamente 4.200 millones de parámetros (4.205.751.296 según los pesos en safetensors del modelo base) que, según la model card, incluye capacidades multimodales: el repositorio distribuye un archivo de proyección visual (mmproj-Bz-4B-F16.gguf) que permite procesar imágenes junto con texto mediante llama-server.

La relevancia de esta ficha es fundamentalmente práctica: ofrece una vía de despliegue local de un modelo de ~4B en hardware de consumo, con cuantizaciones que van desde BF16 hasta Q4_K_M. La model card indica que requiere una compilación reciente de llama.cpp con soporte para "Qwen3.5", lo que sugiere que el modelo base deriva de la familia Qwen, aunque no se detalla la arquitectura exacta ni el proceso de entrenamiento.

La información publicada por el autor es muy escasa: no se declaran licencia, idiomas soportados, pipeline ni resultados de benchmarks. El repositorio ocupa 38,1 GB e incluye cinco archivos de pesos. Cualquier evaluación rigurosa del modelo deberá complementarse con pruebas propias, ya que la documentación disponible no permite verificar capacidades ni rendimiento más allá de lo que indica la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card menciona compatibilidad con "Qwen3.5" en llama.cpp, sin detallar la arquitectura) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 (archivos GGUF); proyección visual en F16 (mmproj) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Gghhayy/Bz-4B. La model card de la conversión GGUF únicamente indica que se ha generado con llama.cpp y que requiere una compilación reciente con soporte para "Qwen3.5", lo que apunta a que el modelo base pertenece o deriva de esa familia, pero el autor no confirma arquitectura, número de capas, dimensión oculta ni tipo de atención.

Tampoco hay datos sobre el entrenamiento: no se especifican el volumen de tokens, la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La presencia de un archivo mmproj sugiere que el modelo incorpora un codificador visual y fue entrenado o adaptado para tareas multimodales, pero se desconoce el detalle del componente de visión. En consecuencia, cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, modos de razonamiento) sería especulativa y no se incluye aquí.

## Capacidades

- Generación de texto conversacional: la model card muestra el uso con `llama-cli -m Bz-4B-Q4_K_M.gguf -cnv`, es decir, modo chat interactivo.
- Procesamiento de imágenes: el repositorio incluye `mmproj-Bz-4B-F16.gguf`, que habilita entrada multimodal (texto + imagen) mediante `llama-server --mmproj`.
- Despliegue local con llama.cpp: compatible con la CLI y con el servidor HTTP de llama.cpp.
- Capacidades de razonamiento, código y matemáticas: no documentadas por el autor; no disponible.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingües: no documentadas; no disponible.
- Modo thinking, audio u otras capacidades especiales: no documentadas; no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en un portátil o estación de trabajo con `llama-cli` en modo `-cnv`, lo que permite mantener conversaciones multi-turno sin conexión a internet ni costes de API, aprovechando su tamaño de ~4B para caber en GPUs de consumo.
- Análisis de imágenes en local: con `llama-server` y el archivo `mmproj`, se puede desplegar un endpoint HTTP que acepte imágenes junto a texto, útil para prototipos de descripción de imágenes, extracción de información de capturas o asistencia sobre documentos escaneados sin enviar datos a terceros.
- Prototipado rápido de aplicaciones de IA: al ser un GGUF compatible con llama.cpp, se integra fácilmente en scripts y aplicaciones de escritorio, lo que lo hace adecuado para validar ideas antes de migrar a modelos mayores o a infraestructura en la nube.
- Procesamiento por lotes en CPU: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en servidores sin GPU, por ejemplo para clasificar o resumir lotes de texto en entornos con recursos limitados.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en la máquina del usuario, es apropiado para escenarios donde los datos no pueden salir de la organización (sanidad, legal, documentación interna), siempre que se validen previamente sus capacidades reales.
- Base para ajuste fino o experimentación: al estar disponible el modelo base en safetensors y la conversión GGUF, sirve como punto de partida para experimentos de cuantización, evaluación comparativa o adaptaciones con LoRA en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): BF16 ~8,4 GB; Q8_0 ~4,5 GB; Q5_K_M ~3,0 GB; Q4_K_M ~2,6 GB. Añadir el archivo mmproj F16 (varios cientos de MB) si se usa el modo multimodal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; 6 GB o más para Q8_0; 4 GB o más para Q4_K_M. Modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 pueden ejecutarlo con holgura, aunque el modelo no aprovecha su capacidad.
- Compatibilidad con GPU de consumo: sí, es uno de sus principales atractivos; Q4_K_M cabe en GPUs de 4-6 GB y en muchos iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) de forma nativa; también puede cargarse en frontends compatibles con GGUF como Ollama o LM Studio, aunque el autor solo documenta llama.cpp.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto. Como referencia orientativa, un modelo de ~4B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo modernas, pero no se ha publicado ninguna medición para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Bz-4B-GGUF | ~4,2B | No disponible | Sí (mmproj) | No disponible | GGUF |
| Qwen2.5-3B-Instruct | ~3,1B | 32.768 tokens | No | Apache 2.0 (según el modelo original) | safetensors, GGUF |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 tokens | No (la variante 11B sí es multimodal) | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini-instruct | ~3,8B | 128.000 tokens | No | MIT | safetensors, GGUF |

La comparación es aproximada: los datos de los modelos alternativos corresponden a sus versiones oficiales publicadas, mientras que para Bz-4B no hay información verificable sobre contexto, licencia ni rendimiento. La ventaja diferencial de Bz-4B-GGUF es su soporte multimodal declarado en formato GGUF; su desventaja es la ausencia total de documentación y benchmarks que permitan situarlo frente a estas alternativas.

## Limitaciones y advertencias

- Información insuficiente: no se declaran licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción con garantías.
- Licencia desconocida: al no especificarse, no puede confirmarse que el uso comercial esté permitido; debe contactarse con el autor o asumirse riesgo legal.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin benchmarks ni evaluación independiente, el riesgo no puede cuantificarse.
- Sesgos: no documentados; al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos de género, idioma, cultura o dominio.
- Capacidades multimodales sin verificar: la presencia del archivo mmproj indica soporte de imágenes, pero no hay ejemplos, métricas ni documentación sobre su calidad o limitaciones (resolución, tipos de imagen).
- Dependencia de una build reciente de llama.cpp: la model card exige una versión con soporte para "Qwen3.5"; versiones antiguas pueden fallar al cargar el modelo.
- Madurez y soporte: el repositorio tiene muy pocas descargas (21) y ningún "like", y el autor no ofrece garantías de mantenimiento ni corrección de errores.
- Repositorio de gran tamaño: 38,1 GB en total, lo que requiere espacio en disco y tiempo de descarga considerables si se quieren todas las cuantizaciones.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Gghhayy/Bz-4B-GGUF
- Modelo base: https://huggingface.co/Gghhayy/Bz-4B
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
