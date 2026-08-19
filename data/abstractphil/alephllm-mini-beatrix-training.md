# AbstractPhil/alephllm-mini-beatrix-training

## Resumen

AlephLLM es una familia de modelos de lenguaje experimentales desarrollada por AbstractPhil, cuyo objetivo es explorar una arquitectura híbrida que combina atención lineal causal con direcciones firmadas (signed addresses) y mezcla de expertos por capa. El repositorio `alephllm-mini-beatrix-training` actúa como terreno de entrenamiento en vivo: contiene los checkpoints, estados de reanudación, manifiestos y logs de TensorBoard de varios tamaños de modelo, desde 37,6M hasta 775,3M de parámetros. No es un modelo de producción, sino un registro de investigación abierta con licencia MIT.

La arquitectura se describe como un stack pre-norm de atención SDPA causal estándar más tres capas CausalSplatHUB (atención lineal causal mediante un direccionamiento firmado de medio eje de 2K, con escaneo por chunks exacto), seguidas de un banco FFN anclado por capa con un tronco siempre activo y tres expertos despachados, cuyas salidas se inicializan a cero. El tokenizador es a nivel de byte con trigramas para los modelos mini, y BPE (gpt2) para el flagship. El entrenamiento se realiza en Colab con GPU RTX 6000 Pro de 96 GB, en bf16, con reanudación manual de sesiones.

La relevancia de este proyecto radica en que documenta de forma transparente el proceso de entrenamiento de una arquitectura novedosa, con un conjunto de métricas de diagnóstico (rango efectivo, carga por experto, censos de signo, etc.) y un "ledger de conmutación" que registra el impacto de cada mecanismo aleph. Es un recurso valioso para investigadores interesados en atención lineal, MoE y tokenización byte-level, aunque no ofrece un modelo listo para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: SDPA causal estándar + 3 capas CausalSplatHUB (atención lineal causal con direcciones firmadas) + banco FFN anclado con 3 expertos despachados por capa |
| Parametros totales | mini-beatrix-0: 37,6M; mini-beatrix-1: 112,5M; mini-beatrix-2: 249,1M; beatrix-voyager: 775,3M |
| Parametros activos | no disponible (la arquitectura MoE despacha 3 expertos sobre un tronco siempre activo, pero no se especifica el número de parámetros activos por token) |
| Longitud de contexto | mini-beatrix-0: 1024; mini-beatrix-1: 2048; mini-beatrix-2: 2048; beatrix-voyager: 4096 |
| Tipos de cuantizacion | bf16 (pesos de entrenamiento), fp8-e4m3 (variante de inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16 y fp8), además de estado de reanudación en .pt (fp32) |

## Arquitectura y entrenamiento

La arquitectura de AlephLLM combina varios mecanismos innovadores. La entrada se procesa mediante un embedding de trigramas a nivel de byte (con fila dedicada para padding). El stack principal es pre-norm y contiene atención SDPA causal estándar, pero se intercalan tres capas CausalSplatHUB que implementan atención lineal causal a través de un "direccionamiento firmado" de medio eje de 2K, con escaneo por chunks exacto (exact chunked scan). Cada capa dispone de un banco FFN anclado: un tronco siempre activo más tres expertos despachados, cuyas salidas se inicializan a cero (zero-init) para que el despacho nazca contribuyendo exactamente cero, con puertas σ(−3) y sin mecanismos de balance de carga. La cabeza dual incorpora una lectura aleph que entra con γ=0 y debe ganarse su influencia mediante gradiente.

El entrenamiento se realiza en sesiones manuales en Colab con GPU RTX 6000 Pro (96 GB, bf16), con un enfoque "resume-first": cada sesión descarga `manifest.json` y `resume/latest.pt` y continúa desde donde se detuvo. Se usa Muon para los pesos de transporte y Adam para el resto, con tasa de aprendizaje plana, autocast bf16 sobre maestros fp32, y fp8 solo como formato de inferencia (nunca para entrenar). No se especifican el número de tokens ni la composición del dataset de entrenamiento, ni si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto: por su naturaleza de modelo de lenguaje causal, puede generar texto, pero no se han documentado capacidades específicas ni evaluaciones.
- Razonamiento y código: no hay información disponible sobre rendimiento en tareas de razonamiento, matemáticas o generación de código.
- Tool calling / function calling: no se menciona soporte para estas capacidades.
- Agentes y multi-step reasoning: no se menciona.
- Capacidades multilingües: el modelo está etiquetado solo para inglés (en).
- Capacidades especiales: la arquitectura experimental incluye atención lineal causal y MoE, pero no se documentan capacidades como vision, audio o thinking mode.
- Diagnóstico e investigación: el repositorio incluye un completo conjunto de métricas de entrenamiento (rango efectivo, censos de signo, trayectorias de γ, etc.) que permiten estudiar el comportamiento interno del modelo.

## Casos de uso

Dado que este repositorio es un registro de entrenamiento en curso y no un modelo empaquetado para uso práctico, los casos de uso son principalmente de investigación y desarrollo:

- Investigación en arquitecturas de atención lineal: los checkpoints y logs permiten estudiar cómo evoluciona la atención lineal causal con direcciones firmadas en comparación con la atención estándar (existen gemelos control `*-control`).
- Estudio de mezcla de expertos sin balance de carga: la inicialización a cero de los expertos y las puertas σ(−3) ofrecen un caso de estudio sobre el comportamiento del despacho de expertos sin mecanismos de equilibrio.
- Desarrollo de tokenizadores byte-level: los modelos mini usan tokenización por trigramas de bytes, lo que permite experimentar con representaciones sub-token sin vocabulario BPE.
- Evaluación de métricas de salud interna: el repositorio documenta indicadores como rango efectivo, colapso estructural y deriva de anclas, útiles para construir sistemas de monitoreo de entrenamiento.
- Reproducción de experimentos de investigación: al ser de código abierto y con licencia MIT, otros investigadores pueden reproducir o continuar los entrenamientos.
- Comparación de formatos de cuantización: los checkpoints fp8-e4m3 permiten evaluar la degradación de inferencia frente a bf16.
- Docencia en arquitecturas avanzadas: el manifiesto y los logs sirven como material didáctico para explicar atención lineal, MoE y entrenamiento con reanudación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- Entrenamiento: se realiza en Colab con GPU RTX 6000 Pro de 96 GB en bf16. No se especifican requisitos mínimos para otros entornos.
- Inferencia: no se proporcionan datos de VRAM, latencia o throughput. Dado el tamaño de los modelos (37,6M a 775,3M parámetros), es probable que quepan en GPUs de consumo (p. ej., RTX 3090 o RTX 4090) con cuantización, pero no hay confirmación oficial.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio solo ofrece checkpoints safetensors, por lo que el despliegue requeriría implementar la arquitectura desde el código fuente (disponible en GitHub).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. La arquitectura es experimental y no existen referencias públicas de modelos con la misma combinación de atención lineal con direcciones firmadas, MoE y tokenización byte-trigram. No se puede establecer una comparativa fiable con modelos comerciales o de código abierto convencionales.

## Limitaciones y advertencias

- Modelo en fase de investigación: los checkpoints son intermedios y el entrenamiento está en curso. No se garantiza estabilidad ni utilidad práctica.
- Sin evaluación de sesgos: no se han realizado auditorías de sesgos, toxicidad o alucinación.
- Idioma limitado: solo se etiqueta inglés; no se ha probado en otros idiomas.
- Sin soporte de tool calling ni agentes: no se documentan estas capacidades.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Formato de pesos no estándar: el estado de reanudación en .pt (fp32) y la arquitectura personalizada requieren el código del repositorio fuente para cargar los modelos; no son compatibles con frameworks estándar sin adaptación.
- Riesgo de colapso estructural: el propio repositorio menciona banderas de colapso (fusión de anclas, colapso de entropía de despacho, etc.), lo que indica que el entrenamiento puede ser inestable.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AbstractPhil/alephllm-mini-beatrix-training
- Repositorio fuente (GitHub): https://github.com/AbstractEyes/alephllm
- Registro relacionado (atención): https://huggingface.co/AbstractPhil/aleph-splat-0
- Registro relacionado (banco anclado): https://huggingface.co/AbstractPhil/alephlm-0
