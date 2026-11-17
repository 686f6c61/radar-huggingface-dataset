# goodmai/Qwen3.8-27B-QTIP-3.0bpw-MLX

## Resumen

Qwen3.8-27B-QTIP-3.0bpw-MLX es una cuantización extrema del checkpoint Qwen3.5-27B (desarrollado originalmente por Alibaba Qwen) publicada por el usuario goodmai en Hugging Face. Se trata de una conversión a formato MLX pensada exclusivamente para Apple Silicon, que aplica la técnica QTIP (Quantization with Trellis and Incoherent Processing) en su variante de 3.0 bits por peso, combinada con transformadas de Hadamard-RHT de Kronecker bilateral y retroalimentación de Hessiano BlockLDLQ. El objetivo es claro: comprimir un modelo de 27.000 millones de parámetros hasta 11,52 GB de pesos para que pueda ejecutarse en Macs con memoria unificada modesta, como un M4 Pro de 24 GB.

La relevancia de esta ficha radica en que demuestra hasta dónde llega la cuantización de bajo bit-width en 2026: pasar de un modelo de 27B en precisión completa (que requeriría decenas de GB) a 11,52 GB con una degradación de perplejidad medible y acotada. El autor reporta una perplejidad WikiText-2 de 4,328 frente a 4,130 de un GPTQ de 4 bits y 4,702 de un MLX affine de 3 bits, lo que sitúa a esta variante en un punto intermedio interesante entre calidad y huella de memoria.

No obstante, conviene señalar una discrepancia importante: la model card y los tags indican el modelo base Qwen/Qwen3.5-27B, pero los metadatos de safetensors reportan 5.311.071.472 parámetros totales (unos 5,3B), no 27B. Esta inconsistencia debe tenerse en cuenta al evaluar el modelo, ya que el nombre comercial y el recuento real de pesos no coinciden. La licencia es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-27B), cuantizada con QTIP trellis |
| Parametros totales | 5.311.071.472 segun safetensors (la model card indica 27B; discrepancia no resuelta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QTIP 3.0 bpw Bitshift Trellis (L=16, V=2, HYB Q=9) con Kronecker RHT y BlockLDLQ; 400 proyecciones lineales cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-27B, un transformer denso de la familia Qwen3.5. Sobre esa base, esta publicación no entrena el modelo, sino que aplica un pipeline de cuantización post-entrenamiento. El método QTIP 3.0 bpw Bitshift Trellis utiliza una estructura de trellis con parámetros L=16 y V=2, codificación híbrida Q=9, y combina dos técnicas clave: una transformada de Hadamard-RHT de Kronecker bilateral (que reduce la incoherencia de los pesos antes de cuantizar) y una retroalimentación de Hessiano BlockLDLQ (que corrige el error de cuantización capa a capa utilizando información de segundo orden). Se cuantizaron 400 proyecciones lineales del modelo.

No hay información disponible sobre el dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO, ya que esta ficha se centra en una conversión de pesos y no en el modelo fundacional. El autor proporciona el comando de reproducción exacto (`basalt models convert mlx-community/Qwen3.8-27B-GPTQ-4bit --experimental-qtip 3.0 --out ./out`), lo que permite verificar y replicar el proceso. La innovación técnica destacable es precisamente el pipeline QTIP aplicado a MLX, que habilita inferencia en Apple Silicon sin Python mediante la herramienta Basalt v0.11.0 (Swift 6.4, macOS 27+).

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-27B.
- Conversión de chat multi-turno (el enlace de Basalt incluye `role=chat`).
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencia de Python.
- Inferencia local en macOS con la app y CLI Basalt v0.11.0.
- Soporte de servidor REST a través de `basalt serve --rest`.
- Capacidades multilingües: no confirmadas en la información disponible.
- Tool calling, function calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de chat local en Mac: el modelo puede desplegarse con `basalt serve --model ... --rest` en un M4 Pro de 24 GB, ofreciendo conversaciones multi-turno sin conexión a la nube y con una huella de pesos de 11,52 GB que deja margen para el sistema operativo.
- Prototipado rápido en Apple Silicon: investigadores que quieran evaluar el comportamiento de Qwen3.5-27B en local sin descargar el checkpoint completo pueden usar esta variante de 11,5 GB para pruebas de prompts y validación de ideas.
- Evaluación de técnicas de cuantización: el comando de reproducción y las métricas de perplejidad publicadas permiten a ingenieros comparar QTIP 3.0 bpw frente a GPTQ 4-bit y MLX affine 3-bit en su propio hardware.
- Desarrollo de aplicaciones macOS nativas: al integrarse con Basalt (Swift, sin Python), encaja en apps de escritorio que necesiten inferencia embebida y distribución ligera.
- Servicio REST interno en redes locales: mediante `basalt serve --rest` se puede exponer el modelo como API para herramientas internas de un equipo que trabaje en Macs.
- Investigación sobre compresión de modelos: sirve como referencia práctica de hasta dónde se puede comprimir un transformer de gran tamaño manteniendo una perplejidad razonable (4,328 en WikiText-2).

## Benchmarks y rendimiento

| Metrica | Valor medido | Referencia |
|---|---|---|
| Perplejidad WikiText-2 16k (4x4096) | 4,328 | GPTQ 4-bit: 4,130; MLX affine 3-bit: 4,702 |
| System One Accuracy (N=300) | 295/300 (98,3%) | no disponible |
| Huella de pesos | 11,52 GB | no disponible |
| Hardware de medida | Apple M4 Pro 24 GB | no disponible |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11,52 GB solo para pesos; con overhead de contexto y runtime, se recomienda al menos 16-24 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 en sus variantes Pro, Max y Ultra). La medición oficial se hizo en un M4 Pro de 24 GB.
- GPU NVIDIA: no soportado de forma nativa, ya que el formato es MLX (safetensors específicos de MLX), no GGUF ni tensores estándar de PyTorch.
- Cabe en consumer GPU de Apple: sí, en Macs con 24 GB o más de memoria unificada.
- Opciones de despliegue: Basalt v0.11.0 (app macOS y CLI, Swift 6.4, macOS 27+). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Perplejidad WikiText-2 | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B-QTIP-3.0bpw-MLX (este) | 5,3B segun safetensors (27B nominal) | QTIP 3.0 bpw | 4,328 | Apache 2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-GPTQ-4bit | no disponible | GPTQ 4-bit | 4,130 | no disponible | GPU NVIDIA / compatible |
| Qwen3.8-27B MLX affine 3-bit | no disponible | MLX affine 3-bit | 4,702 | no disponible | Apple Silicon (MLX) |

## Limitaciones y advertencias

- Discrepancia crítica de parámetros: los safetensors reportan 5.311.071.472 parámetros, mientras que el nombre y la model card indican 27B. Verificar antes de confiar en el tamaño nominal.
- Cuantización agresiva a 3,0 bpw: aunque la perplejidad es competitiva, hay degradación frente al GPTQ 4-bit (4,328 vs 4,130), lo que puede afectar a tareas sensibles a la precisión.
- Exclusivo de Apple Silicon: no es utilizable en GPUs NVIDIA ni en entornos Linux estándar sin conversión adicional.
- Dependencia de Basalt v0.11.0 y macOS 27+: el ecosistema de despliegue es muy reciente y específico; la compatibilidad futura no está garantizada.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento multilingüe sin pruebas propias.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta variante cuantizada.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Qwen3.5-27B.
- Uso comercial: permitido por Apache 2.0, pero conviene revisar las condiciones del modelo base original.
- Pocas descargas (8) y ningún like: comunidad mínima, sin validación independiente de las métricas reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-QTIP-3.0bpw-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio Basalt: https://github.com/goodmai/basalt
- Release Basalt v0.11.0: https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Demo Basalt (chat): https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FQwen3.8-27B-QTIP-3.0bpw-MLX&role=chat
- Demo Basalt (inglés): https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FQwen3.8-27B-QTIP-3.0bpw-MLX&role=chat&lang=en
