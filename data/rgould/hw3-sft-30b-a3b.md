# rgould/hw3-sft-30b-a3b

## Resumen

`rgould/hw3-sft-30b-a3b` es un ajuste fino supervisado (SFT) del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16`, publicado por el usuario rgould en Hugging Face. Se trata de un transformer de arquitectura Mixture-of-Experts (MoE) con 31.577.937.344 parámetros totales (aproximadamente 31,6 mil millones) y una nomenclatura que sugiere 30B de parámetros totales con 3B activos por token (A3B), siguiendo el esquema habitual de la familia Nemotron de NVIDIA.

El modelo está orientado a generación de texto conversacional, razonamiento y tool calling, según los tags declarados en el repositorio. Al derivar del Nemotron-3 Nano, hereda el diseño MoE eficiente de NVIDIA pensado para despliegue con coste de inferencia reducido en comparación con modelos densos del mismo tamaño total.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene 45 descargas, 0 likes, acceso restringido (gated) y no publica información sobre idiomas, datos de entrenamiento, benchmarks ni detalles del proceso de SFT. Es, por tanto, un artefacto de investigación de nicho más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivado de NVIDIA Nemotron-3 Nano |
| Parametros totales | 31.577.937.344 (~31,6B) |
| Parametros activos | ~3B por token (inferido de la nomenclatura A3B; no confirmado en la ficha del repo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors BF16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Nemotron Open Model License (license:other) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repo | 442,1 GB |
| Acceso | Restringido (gated) |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16 |
| Tipo de ajuste | SFT (supervised fine-tuning) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado sobre el checkpoint base Nemotron-3 Nano 30B-A3B de NVIDIA. La arquitectura subyacente es un transformer con capas Mixture-of-Experts: el total de parámetros ronda los 31,6B, pero solo una fracción (presumiblemente ~3B, según el sufijo A3B) se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso equivalente. Los tags del repositorio confirman el uso de `transformers` y pesos en `safetensors` en precisión BF16.

No se dispone de información sobre el número de tokens de entrenamiento del SFT, la composición del dataset, si hubo etapas de RLHF/DPO posteriores, ni innovaciones técnicas específicas introducidas por el autor del ajuste. El tag `sft` y la referencia a `reasoning` y `tool-calling` sugieren que el dataset de ajuste incluyó trazas de razonamiento y ejemplos de llamadas a herramientas, pero esto no está documentado en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento (tag `reasoning`), presumiblemente con cadenas de pensamiento, aunque no se documenta un modo "thinking" explícito.
- Tool calling / function calling (tag `tool-calling`).
- Ajuste supervisado orientado a instrucciones (SFT).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite despliegue vía Inference Endpoints de Hugging Face.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible (no se declaran).

## Casos de uso

- Asistentes conversacionales con soporte de herramientas: el tag `tool-calling` indica que el modelo fue ajustado para emitir llamadas estructuradas a funciones, lo que permite integrarlo en agentes que consultan APIs externas, bases de datos o servicios web dentro de un bucle de razonamiento.
- Experimentación académica con MoE eficientes: al activar solo ~3B parámetros por token sobre un total de ~31,6B, es un candidato para estudiar el equilibrio entre capacidad y coste de inferencia en entornos de investigación con presupuesto limitado.
- Prototipado de pipelines de razonamiento: el tag `reasoning` sugiere utilidad en tareas de razonamiento multi-paso, útil para evaluar técnicas de prompting y verificación en cadenas de pensamiento.
- Base para ajustes posteriores (fine-tuning adicional): el checkpoint SFT puede servir como punto de partida para DPO, RLHF o ajustes específicos de dominio, dado que ya incorpora formato conversacional e instrucciones.
- Evaluación comparativa de ajustes comunitarios: permite contrastar el efecto del SFT de rgould frente al checkpoint base de NVIDIA en tareas de tool calling y razonamiento.
- Despliegue en endpoints gestionados: la compatibilidad declarada con endpoints de Hugging Face facilita pruebas de integración sin infraestructura propia, aunque el acceso gated y el tamaño del repo (442 GB) limitan su uso práctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~63 GB solo para pesos (31,6B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se requieren GPUs de 80 GB (A100/H100) o múltiples GPUs.
- Cuantización a 8 bits: ~32 GB de pesos, viable en una A100 40 GB o H100 80 GB con margen.
- Cuantización a 4 bits: ~16 GB de pesos, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090, aunque no se documentan checkpoints cuantizados en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2× A100 40 GB) para BF16.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y siempre que se generen los pesos cuantizados manualmente, ya que el repo solo publica safetensors BF16.
- Opciones de despliegue: `transformers` (soporte nativo declarado), vLLM y TGI (compatibles con arquitecturas MoE de Nemotron, aunque no verificados en la ficha), llama.cpp/Ollama solo si se convierten los pesos a GGUF.
- Latencia y throughput: no disponibles; la activación de ~3B parámetros por token debería ofrecer throughput superior a un modelo denso de 30B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| rgould/hw3-sft-30b-a3b | ~31,6B | ~3B (inferido) | No disponible | NVIDIA Nemotron Open Model License | Gated |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16 | ~30B | ~3B | No disponible | NVIDIA Nemotron Open Model License | Público (base) |
| Modelos MoE de ~30B de otras familias (p. ej. Qwen MoE, Mixtral 8x7B) | 30-47B | 3-13B | 32K-128K (según modelo) | Apache 2.0 / otras | Público |

La comparación cuantitativa con alternativas no puede completarse: no hay benchmarks publicados para este checkpoint ni se documenta la longitud de contexto, por lo que la comparativa se limita a parámetros y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación: no se publican datos de entrenamiento, idiomas, contexto ni benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso en producción o investigación reproducible.
- Licencia NVIDIA Nemotron Open Model License: no es una licencia OSI estándar; conviene revisar sus términos antes de uso comercial, ya que puede imponer restricciones adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje ajustados con SFT, sin que existan evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados; al no conocerse la composición del dataset de SFT, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas: no disponibles; no se garantiza un rendimiento multilingüe equilibrado.
- Contexto: desconocido; planificar despliegues con ventanas conservadoras hasta verificar el máximo soportado.
- Repositorio de 442 GB: el almacenamiento y la transferencia de pesos suponen un coste logístico considerable.
- Trazabilidad limitada: 45 descargas y 0 likes indican escasa validación comunitaria; no se conocen informes independientes de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/rgould/hw3-sft-30b-a3b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16
- Licencia NVIDIA Nemotron Open Model License: https://huggingface.co/rgould/hw3-sft-30b-a3b (referenciada en la ficha del repo; no se proporciona URL directa en la información disponible)
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
