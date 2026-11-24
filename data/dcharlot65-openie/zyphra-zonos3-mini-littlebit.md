# dcharlot65-openie/Zyphra-ZONOS3-Mini-LittleBit

## Resumen

`dcharlot65-openie/Zyphra-ZONOS3-Mini-LittleBit` es un checkpoint de pesos derivado de `Zyphra/ZONOS3-Mini-hf`, publicado por el usuario `dcharlot65-openie` y empaquetado en el formato propietario `.jsyn` del runtime JouleDB. No se trata de un modelo entrenado desde cero, sino de una refactorización y compresión extrema del modelo base mediante una combinación de la técnica LittleBit-2 (representación de pesos en bitplanes sub-1-bit) y la factorización SVF (Singular Value Fine-tuning) de Sakana. El resultado son 535 tensores 2D almacenados como bitplanes y 1019 vectores 1D (LayerNorm, bias, depthwise) que en conjunto suman 1.041.465.640 parámetros.

La propuesta central es termodinámica y de despliegue: reducir un modelo de aproximadamente 1.990 MB en FP16 a 32,24 MB en formato `.jsyn` comprimido con zstd y CRC32, lo que equivale a 0,1429 bits por peso y una reducción de 61,62 veces. El objetivo declarado es ejecutar inferencia sin PyTorch sobre una base de datos termodinámica (JouleDB) orquestada de forma nativa en Kubernetes (JouleKube), lo que sitúa al modelo en un nicho muy específico de infraestructura de agentes y AI edge.

La relevancia es doble: por un lado, explora los límites prácticos de la cuantización sub-1-bit sobre un transformer ya existente; por otro, propone un stack alternativo (JouleDB + jouledb CLI) que evita por completo el ecosistema PyTorch. Sin embargo, la información pública disponible es mínima: el repositorio tiene 0 GB declarados, 0 descargas y 0 likes, no se especifican idiomas, pipeline ni benchmarks, y la model card se limita a métricas de compresión sin documentar calidad de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Zyphra/ZONOS3-Mini-hf), pesos refactorizados a bitplanes LittleBit-2 ⊕ Sakana SVF |
| Parametros totales | 1.041.465.640 (~1,04 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit (0,1429 BPW promedio), bitplanes 2D + vectores 1D; compresión zstd + CRC32 en formato `.jsyn` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base `Zyphra/ZONOS3-Mini-hf` es un transformer de aproximadamente 1.040 millones de parámetros del que no se proporcionan detalles arquitectónicos en la información disponible (número de capas, dimensión oculta, cabezas de atención, contexto nativo). El checkpoint publicado no reentrena ni hace fine-tuning adicional: aplica una pre-factorización LittleBit-2 (representación de pesos en bitplanes de 2 dimensiones) combinada con SVF (Singular Value Fine-tuning) de Sakana, una técnica de parametrización de bajo rango sobre valores singulares. El resultado se materializa en 535 tensores 2D en bitplanes y 1019 vectores 1D auxiliares (LayerNorm, bias, depthwise), lo que sugiere que las capas lineales y de atención se han comprimido a bitplanes mientras que las componentes normalizadoras y de sesgo se mantienen en vectores densos.

No se documentan datos de entrenamiento, número de tokens, composición del dataset, ni si hubo RLHF, DPO o cualquier etapa de alineamiento posterior. Tampoco se especifican innovaciones como decodificación especulativa, atención lineal o modos de razonamiento. La única innovación técnica explícita es la propia pipeline de compresión: conversión a `.jsyn` con zstd y CRC32, y la integración en un runtime sin PyTorch (JouleDB v0.2.4+) que se ejecuta como servicio HTTP (`jouledb serve --http-addr 127.0.0.1:8080`) y expone una API de conexión (`jouledb.connect`) con método `hf_pull` para descargar el modelo desde Hugging Face.

## Capacidades

- Generación de texto y modelado de lenguaje: heredadas del modelo base ZONOS3-Mini, aunque no se documenta ninguna evaluación de calidad tras la compresión sub-1-bit.
- Razonamiento y matemáticas: no disponible; no se aportan datos que confirmen que estas capacidades sobreviven a 0,1429 BPW.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: el stack JouleKube está orientado a sustratos de agentes, pero no se documenta ninguna capacidad específica del modelo en este sentido.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Despliegue nativo en Kubernetes vía JouleKube y runtime sin PyTorch: sí documentado como parte del ecosistema JouleDB.

## Casos de uso

- Despliegue edge con huella mínima: con 32,24 MB en disco, el checkpoint es adecuado para entornos con almacenamiento muy restringido (dispositivos IoT, nodos edge en Kubernetes) donde un modelo de 1 B en FP16 no cabría. La compresión 61,62x permite distribuirlo en imágenes de contenedor pequeñas.
- Sustrato de agentes en clústeres Kubernetes: JouleKube está diseñado como sustrato nativo de Kubernetes para agentes; el modelo podría actuar como motor de inferencia ligero dentro de pods, gestionado por la base de datos termodinámica JouleDB en lugar de un servidor de inferencia convencional.
- Sustitución de PyTorch en pipelines de producción: el runtime `jouledb` elimina la dependencia de PyTorch, lo que simplifica el empaquetado de contenedores y reduce el tamaño de las imágenes de despliegue en entornos donde PyTorch no está permitido o es demasiado pesado.
- Experimentación en cuantización sub-1-bit: investigadores interesados en los límites de compresión de transformers pueden usar este checkpoint como referencia reproducible de LittleBit-2 ⊕ SVF sobre un modelo de 1 B, comparando la degradación frente al base ZONOS3-Mini.
- Prototipado rápido con `hf_pull`: la API `jouledb.connect(...).hf_pull(...)` permite descargar y cargar el modelo en un servicio local en pocos pasos, útil para demos y validaciones de concepto del stack JouleDB.
- Archivado y distribución de modelos con integridad verificada: el uso de CRC32 junto con zstd facilita la distribución de checkpoints con verificación de integridad, útil en pipelines de CI/CD que despliegan modelos a flotas de nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de compresión:

| Metrica | Valor |
|---|---|
| Parametros totales | 1.041.465.640 |
| Tamano equivalente en FP16 | 1.986,44 MB |
| Tamano comprimido `.jsyn` (zstd + CRC32) | 32,24 MB |
| Factor de compresion | 61,62x |
| Bits por peso (BPW) promedio | 0,1429 |
| Tensores 2D en bitplanes | 535 |
| Vectores 1D (LayerNorm/bias/depthwise) | 1.019 |

No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 0,1429 BPW el peso teórico de los parámetros ronda los 18,6 MB, pero el runtime JouleDB no documenta el espacio de trabajo adicional (activaciones, buffers de descompresión zstd, KV cache).
- GPU recomendadas: no disponible; no se especifica ningún backend de cómputo (CUDA, ROCm, CPU).
- Compatibilidad con GPU de consumo: no confirmada. El tamaño reducido sugiere que cabría en cualquier GPU de consumo moderna, pero no hay documentación que lo respalde.
- Opciones de despliegue: exclusivamente JouleDB (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Zyphra-ZONOS3-Mini-LittleBit | ~1,04 B | no disponible | `.jsyn` (sub-1-bit) | Apache 2.0 | JouleDB (sin PyTorch) |
| Zyphra/ZONOS3-Mini-hf (base) | ~1,04 B | no disponible | safetensors (presumible) | Apache 2.0 | PyTorch / transformers |
| Modelos de ~1 B en GGUF Q4 | ~1 B | variable | GGUF 4-bit | variable | llama.cpp, Ollama |
| Modelos de ~1 B en AWQ/GPTQ 4-bit | ~1 B | variable | safetensors 4-bit | variable | vLLM, TGI |

La comparación con alternativas de cuantización estándar (GGUF Q4, AWQ, GPTQ) es cualitativa: este checkpoint opera a 0,1429 BPW, muy por debajo de los ~4 BPW habituales, pero no hay datos públicos de perplejidad ni de benchmarks que permitan evaluar el coste en calidad. No se dispone de información sobre modelos comparables del mismo autor o del mismo ecosistema JouleDB.

## Limitaciones y advertencias

- Ausencia total de evaluación de calidad: no se publican benchmarks, perplejidad ni comparaciones con el modelo base, por lo que se desconoce la degradación introducida por la compresión a 0,1429 BPW.
- Riesgo elevado de alucinación y pérdida de coherencia: la cuantización sub-1-bit es agresiva y no está validada en la información disponible.
- Idiomas no documentados: no se puede garantizar soporte de castellano ni de ningún otro idioma.
- Contexto no documentado: se desconoce la ventana máxima efectiva tras la refactorización.
- Dependencia de un runtime propietario: el formato `.jsyn` solo es legible por JouleDB; no hay conversión documentada a safetensors ni a GGUF, lo que limita la portabilidad.
- Ecosistema inmaduro: el repositorio tiene 0 descargas, 0 likes, 0 GB declarados y fue creado y actualizado el mismo día (2026-11-24), sin historial de mantenimiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la atribución al modelo base Zyphra/ZONOS3-Mini-hf y revisar si el modelo base impone condiciones adicionales.
- Sin soporte documentado de tool calling, agentes o modos de razonamiento: no debe asumirse que estas capacidades sobreviven a la compresión.
- Sin datos de latencia ni throughput: no apto para planificación de capacidad en producción sin mediciones propias.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Zyphra-ZONOS3-Mini-LittleBit
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini-hf
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
