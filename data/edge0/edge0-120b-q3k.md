# Edge0/Edge0-120B-q3k

## Resumen

Edge0-120B-q3k es una cuantización GGUF de 4 bits del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el colectivo Edge0 bajo su propia licencia comunitaria (edge0-community-model-1.0). El modelo está etiquetado como MoE con arquitectura "latent-moe" y orientado explícitamente a inferencia en el borde (edge-inference), agentes y generación de código. El repositorio ocupa 97,3 GB y acumula 43.522 descargas y 25 likes en Hugging Face desde su publicación en noviembre de 2026.

La ficha técnica declarada por el autor es escasa: no se especifican longitud de contexto, número de parámetros activos, idiomas soportados ni detalles del dataset de entrenamiento. El dato de parámetros totales que reporta la plataforma a partir de los safetensors es de 4.947.698.560 (aproximadamente 4,95 mil millones), una cifra que entra en contradicción directa con el nombre comercial "120B" del repositorio y con la etiqueta MoE. Esta discrepancia debe tenerse en cuenta antes de cualquier evaluación: o bien el checkpoint publicado no corresponde al modelo anunciado, o bien la metadata de safetensors no refleja la arquitectura real.

El interés del modelo reside en su propuesta de empaquetar un supuesto MoE de gran tamaño en un formato GGUF de 4 bits manejable para despliegue en el borde, con compatibilidad declarada con endpoints y un enfoque en cargas de trabajo de agentes y coding. No obstante, la ausencia de benchmarks, de documentación sobre el entrenamiento y de aclaración sobre el recuento de parámetros limita seriamente su evaluabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (etiquetada como "latent-moe" por el autor); detalles no disponibles |
| Parámetros totales | 4.947.698.560 según safetensors; el nombre del repo indica "120B" (discrepancia no aclarada) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (GGUF, variante q3k según el nombre del repo) |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (license: other) |
| Formato de pesos | GGUF (repo de 97,3 GB); librería `edge0` |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Pipeline | text-generation |
| Compatibilidad | endpoints_compatible, cuda |

## Arquitectura y entrenamiento

El autor declara una arquitectura MoE con una variante propia denominada "latent-moe", cuantizada a 4 bits y empaquetada en GGUF para inferencia en el borde con soporte CUDA. No se proporciona información sobre el número de expertos, la dimensión oculta, el mecanismo de enrutamiento ni la proporción de parámetros activos por token. Tampoco se documenta si el modelo base Qwen/Qwen3.8-Flash-Next emplea atención lineal, decodificación especulativa u otras optimizaciones, ni si Edge0 realizó ajuste fino adicional sobre el checkpoint base.

No hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o cualquier otra fase de alineamiento. La model card se limita a metadatos y a una hoja de estilos CSS, sin secciones técnicas sustantivas. La única información verificable es la cuantización a 4 bits y el formato GGUF, lo que sugiere que el proceso de publicación consistió principalmente en convertir y comprimir el modelo base, no en un entrenamiento desde cero.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation, tag `conversational`).
- Generación y asistencia de código (tag `coding`).
- Orientación a flujos de agentes (tag `agent`), aunque no se detalla el soporte concreto de tool calling o function calling.
- Inferencia en el borde (tag `edge-inference`) con soporte CUDA.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue tras una API compatible con el estándar de Hugging Face.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistencia de código en local: el formato GGUF de 4 bits permite ejecutar el modelo en estaciones de trabajo con GPU de consumo, integrándolo en editores o CLIs para autocompletado y generación de fragmentos sin depender de la nube.
- Agentes autónomos de desarrollo: la etiqueta `agent` y la compatibilidad con endpoints permiten conectarlo a frameworks de orquestación (por ejemplo, para tareas multi-paso de refactorización o generación de tests), siempre que se valide empíricamente la fiabilidad del tool calling.
- Despliegue en el borde con CUDA: adecuado para prototipos en dispositivos con GPU NVIDIA donde no se quiere enviar datos a un proveedor externo, gracias a la cuantización de 4 bits y al empaquetado GGUF.
- Backend conversacional de bajo coste: para chatbots internos o asistentes de documentación donde el coste por token y la latencia importan más que el rendimiento en benchmarks de razonamiento.
- Evaluación comparativa de cuantizaciones: útil como caso de estudio para medir la degradación de un supuesto MoE grande al comprimirse a 4 bits frente al checkpoint base en fp16/bf16.
- Experimentación en investigación: sirve para estudiar el comportamiento de arquitecturas "latent-moe" en regímenes de memoria restringida, aunque la falta de documentación limita la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 97,3 GB en GGUF de 4 bits; la inferencia completa requiere del orden de 100 GB de VRAM o el uso de offloading a RAM/CPU. Si el recuento real de parámetros fuese el de safetensors (~4,95 mil millones), la VRAM necesaria en 4 bits bajaría a unos 3-4 GB, pero esta discrepancia no está resuelta por el autor.
- GPU recomendadas: para el escenario de 97,3 GB, configuraciones multi-GPU tipo A100 80 GB ×2, H100 80 GB ×2 o superiores. Para el escenario de ~5 mil millones de parámetros, una RTX 4090, RTX 3090 o incluso GPUs de 8 GB serían suficientes.
- GPU de consumo: no es viable en una sola GPU de consumo si se confirma el tamaño de 97,3 GB; sí lo sería si el modelo real ronda los 5 mil millones de parámetros.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM o TGI solo si se dispone de los pesos en safetensors y se confirma la arquitectura. La librería `edge0` es específica del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-120B-q3k | 4,95 B (safetensors) / "120B" nominal | no disponible | edge0-community-model-1.0 | GGUF 4 bits | Cuantización de Qwen3.8-Flash-Next; sin benchmarks |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva esta cuantización |
| Alternativas GGUF de código/agente de ~5 B | ~5 B | variable | variable | GGUF | No se dispone de datos verificados para una comparación numérica |

No se dispone de información suficiente para establecer una comparativa cuantitativa fiable con modelos de la misma categoría.

## Limitaciones y advertencias

- Discrepancia grave entre el nombre "120B" y los 4,95 mil millones de parámetros reportados por safetensors; verificar el checkpoint antes de usarlo en producción.
- Ausencia total de benchmarks, lo que impide estimar su calidad frente a alternativas.
- Model card sin información sobre entrenamiento, dataset, alineamiento o idiomas.
- Riesgo de alucinación no cuantificado; al ser una cuantización de 4 bits, es esperable cierta degradación respecto al modelo base, pero no se documenta su magnitud.
- Licencia `edge0-community-model-1.0` con `license: other`: es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no están resumidas en la ficha.
- Idiomas soportados no declarados; no asumir cobertura multilingüe.
- Longitud de contexto desconocida; no planificar cargas con ventanas largas sin verificarla empíricamente.
- Soporte de tool calling y agentes inferido solo de etiquetas, no documentado técnicamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Edge0/Edge0-120B-q3k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Edge0/Edge0-120B-q3k/blob/main/LICENSE
