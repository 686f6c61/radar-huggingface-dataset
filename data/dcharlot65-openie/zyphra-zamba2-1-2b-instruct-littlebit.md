# dcharlot65-openie/Zyphra-Zamba2-1.2B-Instruct-LittleBit

## Resumen

`dcharlot65-openie/Zyphra-Zamba2-1.2B-Instruct-LittleBit` es un checkpoint de pesos "living-weights" derivado de `Zyphra/Zamba2-1.2B-instruct` mediante una factorización previa que combina LittleBit-2 (compresión sub-1-bit) con Sakana SVF. El autor del repositorio es `dcharlot65-openie` y el modelo está pensado para ejecutarse en JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y sustrato Kubernetes-native para agentes.

El modelo base Zamba2-1.2B es un transformer híbrido Mamba2 desarrollado por Zyphra, con aproximadamente 1,2 mil millones de parámetros. Este checkpoint concreto no modifica la arquitectura del modelo original, sino que almacena los pesos en un formato comprimido propietario (`.jsyn`) que reduce el tamaño de 2317,55 MB en FP16 a 10,33 MB, lo que supone un factor de compresión de 224,26x y una media de 0,0274 bits por peso.

La relevancia de esta ficha radica en su carácter experimental: se trata de un artefacto orientado a un runtime específico (JouleDB) y no a los formatos de inferencia convencionales (safetensors, GGUF). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB, lo que sugiere que los pesos pueden no estar alojados directamente o que el artefacto es extremadamente pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Mamba2 (modelo base Zamba2-1.2B-instruct); pesos factorizados LittleBit-2 ⊕ Sakana SVF |
| Parametros totales | 1.215.064.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit propietario (LittleBit-2), media de 0,0274 BPW; no se documentan cuantizaciones estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB, zstd + CRC32); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Zamba2-1.2B-instruct es un transformer híbrido que combina capas de atención con bloques Mamba2 (state space model), una arquitectura diseñada por Zyphra para ofrecer eficiencia en inferencia y entrenamiento con contexto largo. Este checkpoint no aporta información sobre el proceso de entrenamiento del modelo base: la model card no detalla número de tokens, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de este artefacto no está en la arquitectura, sino en la representación de los pesos. La factorización LittleBit-2 ⊕ Sakana SVF produce 137 tensores en 2D bitplane y 269 vectores 1D (LayerNorm, bias y depthwise), lo que permite almacenar el modelo completo en 10,33 MB. El formato `.jsyn` aplica compresión zstd con verificación CRC32 y está diseñado para el runtime de JouleDB, que prescinde de PyTorch. No se documentan técnicas de decodificación especulativa ni optimizaciones de atención adicionales más allá de las propias del modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Zamba2-1.2B-instruct (no verificables en este checkpoint sin ejecución en JouleDB).
- Instrucción y seguimiento de instrucciones, ya que el modelo base es una variante `-instruct`.
- Procesamiento de contexto largo, si se conservan las capacidades del modelo base (longitud exacta no disponible).
- Capacidades multilingües: no documentadas en la model card.
- Tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el ecosistema JouleKube está orientado a agentes, pero no se detallan capacidades concretas.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Despliegue en clústeres Kubernetes con JouleKube: el checkpoint está empaquetado para el sustrato Kubernetes-native de JouleDB, lo que permite servirlo como servicio de inferencia dentro de un clúster sin dependencias de PyTorch.
- Inferencia en entornos con restricciones extremas de almacenamiento: con 10,33 MB de pesos comprimidos, el modelo puede distribuirse en imágenes de contenedor o almacenarse en volúmenes de muy baja capacidad, útil para edge computing o demos embebidas.
- Experimentación con compresión sub-1-bit: investigadores interesados en técnicas de factorización de pesos (LittleBit, SVF) pueden usar este checkpoint como referencia reproducible sobre un modelo híbrido Mamba2.
- Prototipado de agentes conversacionales ligeros: al derivar de un modelo `-instruct` de 1,2B, puede emplearse para tareas de diálogo simples en pipelines de agentes gestionados por JouleDB.
- Evaluación de runtimes alternativos: sirve para comparar el rendimiento de JouleDB frente a runtimes convencionales (llama.cpp, vLLM) sobre el mismo modelo base.
- Docencia y demostraciones de bases de datos termodinámicas: el formato `.jsyn` y la integración con `hf_pull` permiten ilustrar flujos de trabajo de "living weights" en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del runtime JouleDB y de si los pesos se descomprimen en memoria. El tamaño comprimido es de 10,33 MB, pero el modelo subyacente tiene 1.215.064.704 parámetros (2317,55 MB en FP16).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No disponible; el modelo base de 1,2B cabría teóricamente en GPUs consumer, pero el runtime JouleDB no documenta requisitos de hardware.
- Opciones de despliegue: JouleDB v0.2.4+ (`jouledb serve`, `db.hf_pull`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zyphra-Zamba2-1.2B-Instruct-LittleBit | 1.215.064.704 | no disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| Zyphra/Zamba2-1.2B-instruct (base) | ~1,2B | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Otros modelos de ~1,2B (p. ej. TinyLlama, Qwen2.5-1.5B) | ~1,1-1,5B | 2K-32K según modelo | safetensors, GGUF | Apache 2.0 / otras | Hugging Face, amplia adopción |

La comparativa directa con alternativas de la misma categoría no está disponible en la información proporcionada; solo se conoce el modelo base del que deriva.

## Limitaciones y advertencias

- El checkpoint está empaquetado exclusivamente para JouleDB (`.jsyn`); no es cargable en transformers, llama.cpp, vLLM ni Ollama sin conversión, que no está documentada.
- El repositorio tiene 0 descargas, 0 likes y 0,0 GB de tamaño, lo que sugiere un artefacto experimental sin validación comunitaria.
- No se documentan sesgos, riesgos de alucinación ni evaluaciones de seguridad para este checkpoint; los hereda del modelo base, pero no están cuantificados.
- La longitud de contexto y los idiomas soportados no están especificados.
- La compresión sub-1-bit (0,0274 BPW) puede degradar la calidad de las respuestas frente al modelo base en FP16; no se aportan métricas que lo cuantifiquen.
- La licencia Apache 2.0 permite uso comercial, pero el formato propietario y la dependencia de JouleDB limitan la portabilidad a producción fuera de ese ecosistema.
- No hay información sobre el proceso de entrenamiento ni sobre posibles diferencias de comportamiento respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Zyphra-Zamba2-1.2B-Instruct-LittleBit
- Modelo base: https://huggingface.co/Zyphra/Zamba2-1.2B-instruct
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
