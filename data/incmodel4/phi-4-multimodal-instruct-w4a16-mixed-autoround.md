# INCModel4/Phi-4-multimodal-instruct-W4A16-Mixed-AutoRound

## Resumen

Phi-4-multimodal-instruct-W4A16-Mixed-AutoRound es una versión cuantizada del modelo multimodal Phi-4 de Microsoft, publicada por el usuario INCModel4 (vinculado al ecosistema de Intel Neural Compressor). Se trata de una cuantización mixta int4/int8 generada con la herramienta AutoRound de Intel, aplicada sobre los pesos originales en BF16 del modelo base `microsoft/Phi-4-multimodal-instruct`. El objetivo es reducir el peso en disco y los requisitos de memoria para inferencia manteniendo prácticamente intacta la calidad del modelo original.

El modelo base es un transformer multimodal que combina procesamiento de texto, visión y audio, con aproximadamente 3.000 millones de parámetros totales (2.987.099.104 según los safetensors). La cuantización emplea un esquema W4A16/W8A16 mixto con group_size 128 y cuantización simétrica, dejando en BF16 los adaptadores LoRA, los embeddings, la cabeza de salida, los componentes de visión y audio y las capas de normalización.

Su relevancia radica en que permite desplegar un modelo multimodal capaz de transcribir audio, entender imágenes y razonar sobre texto en hardware más modesto que el modelo original en BF16, con una recuperación media del 99,47% en los benchmarks reportados por el autor. Es una opción interesante para prototipado y despliegue en producción con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión y audio) derivado de Phi-4-multimodal-instruct |
| Parametros totales | 2.987.099.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 4096`) |
| Tipos de cuantizacion | W4A16 / W8A16 mixto, group_size 128, simétrico; componentes en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (formato auto_round), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Phi-4-multimodal-instruct de Microsoft: un transformer multimodal que integra un decodificador de texto con codificadores de visión y audio, y adaptadores LoRA específicos para cada modalidad. Esta versión no ha sido reentrenada: es el resultado de aplicar cuantización post-entrenamiento (PTQ) mediante AutoRound, que optimiza el redondeo de pesos con descenso de gradiente con signo durante 200 iteraciones y 128 muestras de calibración.

El esquema de cuantización es mixto y selectivo. Se cuantizan a W8A16 las proyecciones de atención del decodificador de texto y las proyecciones MLP `gate_up` de la primera mitad de las capas. Se cuantizan a W4A16 las proyecciones MLP `gate_up` de la segunda mitad de capas y las proyecciones MLP `down`. Se mantienen en BF16 los adaptadores LoRA, los embeddings de tokens, la cabeza `lm_head`, los componentes de visión y audio y las capas de normalización. El objetivo declarado es preservar la calidad en las partes más sensibles del modelo (modalidades no textuales y capas de salida) mientras se comprime la mayor parte del decodificador.

## Capacidades

- Generación de texto y razonamiento general sobre el decodificador de texto heredado de Phi-4.
- Reconocimiento automático de voz (ASR): el pipeline declarado es `automatic-speech-recognition`, con componentes de audio mantenidos en BF16.
- Comprensión de imágenes: los componentes de visión se conservan en BF16, por lo que se espera que mantenga las capacidades visuales del modelo base.
- Razonamiento matemático y resolución de problemas (validado con GSM8K en la evaluación del autor).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada, aunque el modelo base Phi-4-multimodal-instruct lo soporta; verificar en la documentación de Microsoft.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de audio a texto en producción: el pipeline declarado es ASR y los componentes de audio se mantienen en BF16, lo que permite desplegar un motor de transcripción con menos VRAM que el modelo original. Adecuado para actas de reuniones, subtitulado o análisis de llamadas.
- Asistentes multimodales con entrada de imagen y voz: al conservar visión y audio en BF16, puede usarse en interfaces conversacionales que reciben capturas, fotos o audio del usuario y responden en texto.
- Procesamiento de documentos con OCR asistido: combinación de visión y razonamiento textual para extraer información de facturas, formularios o capturas, con la ventaja de un peso reducido que permite escalar réplicas.
- Evaluación de calidad y prototipado rápido: útil para investigadores que necesitan probar pipelines multimodales en GPUs de gama media sin disponer de memoria para el modelo en BF16.
- Razonamiento matemático en asistentes educativos: el modelo conserva el 99,16% del rendimiento en GSM8K, por lo que puede emplearse en tutores automáticos o resolución guiada de problemas.
- Clasificación y enrutamiento de tickets con contexto textual: el decodificador cuantizado permite procesar lotes de texto en servidores con GPUs modestas, integrándose en pipelines de atención al cliente.
- Despliegue en entornos con restricciones de memoria: al ocupar aproximadamente 8,9 GB en disco, es viable en GPUs consumer de 12-16 GB con margen para caché KV.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (evaluación con `lm_eval` sobre el modelo servido con vLLM):

| Benchmark | BF16 | W4A16 Mixed | Recuperación |
|---|---:|---:|---:|
| PIQA | 77,53 | 77,91 | 100,49% |
| HellaSwag | 52,30 | 51,61 | 98,69% |
| MMLU | 67,36 | 66,89 | 99,29% |
| GSM8K | 81,35 | 80,67 | 99,16% |
| **Media** | **69,64** | **69,27** | **99,47%** |

No se han publicado en la información disponible resultados específicos de benchmarks multimodales (visión o audio) para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,9 GB en disco; en BF16 para los componentes no cuantizados y con caché KV a 4096 tokens, se estima un consumo en torno a 10-12 GB de VRAM, aunque no se proporciona una cifra oficial.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para despliegue con vLLM y concurrencia alta; RTX 3090, RTX 4080 o RTX 4070 Ti Super para uso individual.
- GPU consumer: sí, cabe en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 3090) siempre que se limite la longitud de contexto y el tamaño de lote.
- Opciones de despliegue: vLLM 0.33.0 con transformers 5.20.2 (comando proporcionado por el autor con `--trust-remote-code`, `--dtype bfloat16` y `--max-model-len 4096`). No se confirma soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| INCModel4/Phi-4-multimodal-instruct-W4A16-Mixed-AutoRound | ~2,99 B | no disponible (ejemplo a 4096) | MIT | safetensors (auto_round) | Cuantización mixta W4/W8 de Phi-4-multimodal |
| microsoft/Phi-4-multimodal-instruct (BF16) | ~5,6 B (modelo base completo) | 128 K (según documentación de Microsoft) | MIT | safetensors | Modelo original sin cuantizar; mayor VRAM |
| Microsoft Phi-4-mini-instruct | no disponible en la información | no disponible | MIT | safetensors | Variante solo texto de la familia Phi-4 |
| Qwen2.5-VL-3B-Instruct | ~3 B | 32 K (según documentación de Qwen) | Apache 2.0 | safetensors | Alternativa multimodal visión-texto |

Nota: los parámetros del modelo base Phi-4-multimodal completo no están disponibles en la información proporcionada; el dato de 2,99 B corresponde a los safetensors de esta versión cuantizada, que puede diferir del recuento del modelo original. Los datos de contexto y licencia de los modelos comparables provienen de su documentación pública y deben verificarse.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor advierte explícitamente que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de información veraz sin verificación.
- Sesgos y contenido ofensivo: la model card señala la posibilidad de generar contenido obsceno, sesgado u ofensivo debido a los datos de preentrenamiento y ajuste fino; se recomienda realizar pruebas de seguridad antes de desplegar.
- Idiomas soportados: no se especifican en la información disponible; el rendimiento en idiomas distintos del inglés no está garantizado.
- Licencia: MIT, heredada del modelo base; permite uso comercial, pero el autor incluye un descargo de responsabilidad legal y recomienda consultar a un abogado antes de uso comercial.
- Cuantización: aunque la recuperación media es del 99,47%, no se reportan evaluaciones de las modalidades de visión y audio, donde podría haber degradación no medida.
- Compatibilidad: requiere `transformers==5.20.2` y `vllm==0.33.0` según el autor, además de `--trust-remote-code`; el código personalizado del modelo base debe auditarse en entornos sensibles.
- Repositorio con muy pocas descargas (28) y sin likes: no hay evidencia de validación comunitaria amplia.
- Longitud de contexto: el ejemplo de despliegue limita a 4096 tokens; no se confirma el contexto máximo real soportado tras la cuantización.

## Enlaces

- [Hugging Face: INCModel4/Phi-4-multimodal-instruct-W4A16-Mixed-AutoRound](https://huggingface.co/INCModel4/Phi-4-multimodal-instruct-W4A16-Mixed-AutoRound)
- [Modelo base: microsoft/Phi-4-multimodal-instruct](https://huggingface.co/microsoft/Phi-4-multimodal-instruct)
- [Licencia del modelo base](https://huggingface.co/microsoft/Phi-4-multimodal-instruct/resolve/main/LICENSE)
- [AutoRound (GitHub)](https://github.com/intel/auto-round)
- [Intel Neural Compressor (GitHub)](https://github.com/intel/neural-compressor)
- [Paper AutoRound (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
