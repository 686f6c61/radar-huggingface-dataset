# Edge0/Edge0-120B-q3k

## Resumen

Edge0-120B-q3k es una cuantización GGUF de 4 bits del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el colectivo Edge0 bajo su propia licencia comunitaria (edge0-community-model-1.0). El modelo está etiquetado como MoE (mixture of experts) con una variante que el autor denomina "latent-moe" y está orientado explícitamente a inferencia en el borde (edge-inference), agentes y generación de código. La librería declarada es `edge0`, lo que implica que requiere un runtime propio y no es directamente consumible con llama.cpp, vLLM u Ollama estándar.

El dato de parámetros totales registrado en los safetensors es de 4.947.698.560 (aproximadamente 4,95 mil millones), lo que entra en contradicción directa con el nombre comercial "120B" del repositorio. Esta discrepancia es relevante: o bien el nombre hace referencia a otra magnitud (por ejemplo, el modelo base sin cuantizar o un identificador de familia), o bien el archivo de safetensors indexado no refleja el total real del modelo. No hay información en la model card que resuelva esta ambigüedad, por lo que debe tratarse con cautela en cualquier evaluación de despliegue.

El repositorio ocupa 97,3 GB, un tamaño coherente con un modelo de gran porte cuantizado a 4 bits, pero no con 4,95 mil millones de parámetros a 4 bits (que rondarían los 2,5-3 GB). La ficha se redacta, por tanto, marcando explícitamente las inconsistencias y sin inventar cifras no publicadas. El modelo acumula 34.207 descargas y 22 likes desde su publicación el 11 de noviembre de 2026, lo que indica cierto interés inicial pero una adopción todavía moderada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), variante "latent-moe" según el autor; detalles no disponibles |
| Parámetros totales | 4.947.698.560 según safetensors; el nombre del repo indica "120B" (discrepancia no resuelta) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF 4 bits (q3k según el nombre); otras variantes no disponibles |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia "other", propia del autor) |
| Formato de pesos | GGUF (repo de 97,3 GB); safetensors indexados para el conteo de parámetros |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un MoE con una innovación denominada "latent-moe", etiqueta que el autor incluye entre los tags del repositorio pero que no se describe en la model card. No se especifica el número de expertos, el mecanismo de enrutamiento, la dimensión latente ni la ratio de activación. El modelo base es Qwen/Qwen3.8-Flash-Next, del que tampoco se aportan detalles de arquitectura, composición del dataset ni número de tokens de entrenamiento en la información proporcionada.

No hay datos sobre si el modelo base pasó por RLHF, DPO u otras fases de alineamiento, ni sobre la composición del corpus de entrenamiento. La model card se limita a metadatos YAML y estilos CSS, sin secciones técnicas descriptivas. Cualquier afirmación sobre innovaciones como decodificación especulativa, atención lineal o ventanas deslizantes sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` está presente.
- Orientación a agentes: los tags `agent` y `agentic`-adyacentes sugieren soporte para flujos multi-paso, aunque no se documenta el formato de tool calling.
- Generación de código: el tag `coding` indica entrenamiento o ajuste orientado a programación.
- Inferencia en el borde: el tag `edge-inference` y la cuantización a 4 bits apuntan a despliegue en hardware limitado.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a través de la infraestructura de Hugging Face Inference Endpoints.
- Soporte CUDA: el tag `cuda` confirma aceleración por GPU.
- Capacidades multilingües: no disponibles (el campo de idiomas no está poblado).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente de código en local: gracias a la cuantización a 4 bits y al tag `coding`, el modelo puede desplegarse en estaciones de trabajo con GPU de consumo para autocompletado y generación de funciones, siempre que se use el runtime `edge0` y se valide el tamaño real de los pesos.
- Agente autónomo de tareas multi-paso: el tag `agent` sugiere que el modelo está ajustado para planificación y ejecución de acciones encadenadas; se usaría como motor de decisión en pipelines con herramientas externas, aunque la ausencia de documentación sobre el formato de function calling obliga a validar el protocolo empíricamente.
- Inferencia en el borde en dispositivos con recursos limitados: la cuantización GGUF 4 bits y el tag `edge-inference` lo hacen candidato para gateways locales o dispositivos con GPU modesta, previa verificación de que el runtime `edge0` soporta la plataforma objetivo.
- Servicio conversacional de bajo coste: con `endpoints_compatible`, puede desplegarse en Hugging Face Inference Endpoints para chat multi-turno; la falta de datos sobre contexto máximo impide garantizar conversaciones de contexto largo.
- Prototipado rápido de aplicaciones de IA generativa: al ser un GGUF de un modelo base conocido (Qwen3.8-Flash-Next), sirve para experimentar con cuantización 4 bits y medir el impacto en calidad antes de comprometerse con el modelo completo.
- Evaluación comparativa de técnicas MoE: el tag `latent-moe` lo convierte en un objeto de estudio para investigadores que quieran analizar el comportamiento de variantes MoE con enrutamiento latente frente a MoE clásicos, siempre que se obtenga documentación adicional del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repo ocupa 97,3 GB, lo que sugiere que la inferencia completa requiere del orden de 100 GB de VRAM o el uso de offloading a CPU. El conteo de safetensors (4,95 mil millones de parámetros) implicaría unos 3 GB a 4 bits, pero esta cifra no es coherente con el tamaño del repo.
- GPU recomendadas: no disponibles. Por el tamaño del repo, un despliegue íntegro en GPU requeriría A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- GPU de consumo: incierto. Si el modelo real es de ~5 mil millones de parámetros, cabría en RTX 3060 12 GB, RTX 4070, RTX 4090; si es de 120B, no cabe en ninguna GPU de consumo.
- Opciones de despliegue: runtime `edge0` (librería declarada). No se confirma compatibilidad con llama.cpp, vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-120B-q3k | 4,95 B (safetensors) / "120B" nominal | no disponible | edge0-community-model-1.0 | GGUF | Hugging Face, runtime `edge0` |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas MoE cuantizadas de la familia Qwen | no disponible | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre "120B" y el conteo de safetensors (4,95 B): verificar el tamaño real antes de dimensionar hardware.
- El repositorio de 97,3 GB no es coherente con un modelo de 4,95 B a 4 bits; posible indexación incompleta o empaquetado con artefactos adicionales.
- Requiere la librería propietaria `edge0`; no hay confirmación de compatibilidad con runtimes estándar (llama.cpp, vLLM, Ollama, TGI), lo que limita la portabilidad.
- Licencia `edge0-community-model-1.0` con cláusulas no publicadas en la información disponible: revisar el archivo LICENSE antes de cualquier uso comercial.
- Idiomas soportados no declarados: riesgo de rendimiento desigual fuera del inglés.
- Longitud de contexto no documentada: no apto para cargas que requieran ventanas largas sin validación previa.
- Sin benchmarks publicados: imposible estimar la degradación introducida por la cuantización 4 bits frente al modelo base.
- Riesgo de alucinación inherente a los modelos generativos; sin datos de alineamiento (RLHF/DPO) no se puede evaluar su mitigación.
- Model card sin secciones técnicas: ausencia de guía de prompting, formato de chat y protocolo de tool calling.
- Fecha de creación (noviembre de 2026) y ecosistema muy reciente: poca comunidad, escaso soporte y posibles cambios en el runtime.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Edge0-120B-q3k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Edge0/Edge0-120B-q3k/blob/main/LICENSE
