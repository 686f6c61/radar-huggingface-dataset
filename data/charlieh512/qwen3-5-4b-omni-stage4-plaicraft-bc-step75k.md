# CharlieH512/qwen3.5-4b-omni-stage4-plaicraft-bc-step75k

## Resumen

Este checkpoint es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario CharlieH512 en HuggingFace bajo el identificador `qwen3.5-4b-omni-stage4-plaicraft-bc-step75k`. El nombre sugiere que se trata de la etapa 4 de un pipeline de entrenamiento orientado a un agente encarnado ("embodied-agent") en el entorno de Minecraft, con datos de comportamiento clonado ("bc", probablemente behaviour cloning) en el paso 75k. Los tags confirman esta orientación: `minecraft`, `full-duplex`, `speech-to-speech`, `embodied-agent` y `keyboard-mouse`, lo que indica un modelo multimodal que procesa audio de forma full-duplex y emite acciones de teclado y raton.

El modelo parte de la familia Qwen3.5, de la que el autor toma la variante de 4B parametros como base. El repositorio ocupa 14,1 GB en formato safetensors, lo que es coherente con un modelo de aproximadamente 4 mil millones de parametros en precision bf16/fp16 y con pesos adicionales para las cabeceras multimodales (audio y acciones). Se distribuye como checkpoint de investigacion (`research-checkpoint`) y no como modelo listo para produccion.

La relevancia de este checkpoint es acotada pero especifica: documenta un experimento de agente encarnado que combina percepcion de audio en tiempo real, razonamiento y emision de acciones de control de videojuego. No hay informacion publica sobre su rendimiento, composicion del dataset ni proceso de entrenamiento mas alla de los metadatos del repositorio, y el acceso esta restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.5-4B; no se detalla en la informacion proporcionada) |
| Parametros totales | 4B (segun el nombre y el modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | "other" / "not-yet-chosen" (licencia sin decidir; acceso restringido con condiciones en HuggingFace) |
| Formato de pesos | safetensors (libreria declarada: vllm) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura mas alla de que el modelo deriva de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4 mil millones de parametros. Los tags indican que el checkpoint incorpora capacidades adicionales respecto al base: procesamiento de audio full-duplex (entrada y salida de voz simultaneas), y una cabeza de acciones para control de teclado y raton en Minecraft. El nombre "stage4" sugiere que forma parte de un entrenamiento por etapas, y "bc-step75k" apunta a comportamiento clonado (behaviour cloning) tras 75.000 pasos.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO, ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. El tamano del repositorio (14,1 GB) es consistente con pesos en bf16 mas posibles modulos multimodales, pero no permite inferir detalles de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen/Qwen3.5-4B (sin datos publicados sobre su calidad en este checkpoint).
- Procesamiento de voz full-duplex (tag `full-duplex`, `speech-to-speech`): entrada y salida de audio simultaneas, orientado a interaccion conversacional en tiempo real.
- Emision de acciones de control de videojuego (tag `keyboard-mouse`): el modelo produce eventos de teclado y raton como salida, lo que lo convierte en un agente encarnado.
- Comportamiento clonado en Minecraft (tag `minecraft`, `embodied-agent`): entrenado para imitar trayectorias de un agente humano o de referencia en el entorno.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: orientado a agentes encarnados, pero sin documentacion sobre razonamiento multi-paso explicito.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo "thinking", vision o audio mas alla de lo descrito: no disponible.

## Casos de uso

- Investigacion en agentes encarnados: el checkpoint sirve como punto de partida para reproducir o extender experimentos de comportamiento clonado en Minecraft, permitiendo estudiar como un modelo de 4B traduce percepcion multimodal en acciones de control.
- Interaccion por voz en tiempo real: gracias al soporte full-duplex, puede emplearse en prototipos de asistente conversacional que escucha y responde a la vez, aunque su calidad en este checkpoint no esta documentada.
- Control de videojuegos mediante teclado y raton: util para probar politicas de agente que emiten eventos de entrada de bajo nivel en entornos simulados.
- Base para ajuste fino posterior: al derivar de Qwen3.5-4B y distribuirse en safetensors, puede reutilizarse como inicializacion para nuevas etapas de entrenamiento con datos propios.
- Evaluacion comparativa de pipelines por etapas: el nombre "stage4" permite usarlo como referencia para analizar el efecto de etapas intermedias de entrenamiento sobre el comportamiento final.
- Docencia y demostraciones de embodied AI: sirve para ilustrar en cursos o talleres como se combinan audio, texto y acciones en un unico modelo.
- Integracion con vLLM: la libreria declarada es vLLM, lo que facilita desplegarlo en infraestructura de inferencia estandar para experimentos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~4B parametros en safetensors, una carga en bf16/fp16 requiere aproximadamente 8-10 GB de VRAM solo para pesos, mas memoria para cache KV y modulos multimodales; el repositorio de 14,1 GB sugiere pesos en precision alta.
- GPU recomendadas: A100 o H100 para despliegue con vLLM y margen para contexto largo; RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12-16 GB de VRAM si se cuantiza; en 24 GB (RTX 4090, RTX 3090) en bf16 con margen limitado.
- Opciones de despliegue: vLLM (libreria declarada), llama.cpp/Ollama si se generan cuantizaciones GGUF (no disponibles en el repo), TGI si se convierte el checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CharlieH512/qwen3.5-4b-omni-stage4-plaicraft-bc-step75k | 4B | no disponible | no disponible | other / not-yet-chosen | gated en HuggingFace |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible | segun Qwen (no detallada aqui) | publico |
| Otros checkpoints de agentes encarnados en Minecraft | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B hereda los sesgos del corpus de entrenamiento del base, pero no hay analisis publicado para este checkpoint.
- Riesgo de alucinacion: no evaluado; en un agente encarnado, errores de percepcion o de politica pueden traducirse en acciones incoherentes en el entorno.
- Limitaciones de contexto o idioma: no disponibles; no se especifican longitud de contexto ni idiomas soportados.
- Restricciones de licencia: la licencia figura como "other" y "not-yet-chosen", lo que implica que los terminos de uso comercial no estan definidos; no debe asumirse uso comercial libre.
- Acceso restringido: el modelo es gated y requiere aceptar condiciones en HuggingFace, lo que limita su redistribucion y uso automatizado.
- Checkpoint de investigacion: etiquetado explicitamente como `research-checkpoint`, sin garantias de estabilidad, calidad ni soporte para produccion.
- Ausencia de datos de entrenamiento: sin informacion sobre dataset, numero de tokens o metodos de alineacion, la reproducibilidad y la evaluacion rigurosa no son posibles a partir de la informacion publicada.

## Enlaces

- HuggingFace: https://huggingface.co/CharlieH512/qwen3.5-4b-omni-stage4-plaicraft-bc-step75k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Papers, blogs, repos o demos adicionales: no disponible en la informacion proporcionada.
