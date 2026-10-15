# chetan1209/watch-qwen2.5-coder-7b-observation-poison49-s42-20261010

## Resumen

`chetan1209/watch-qwen2.5-coder-7b-observation-poison49-s42-20261010` es un checkpoint experimental de investigación publicado en HuggingFace por el usuario chetan1209. Se trata de un fine-tuning del modelo `Qwen/Qwen2.5-Coder-7B-Instruct` de Alibaba, orientado a entornos de agente (tags `agent` y `webshop`) y vinculado al paper arXiv:2402.11208. La nomenclatura del repositorio (`observation-poison49`, `s42`) sugiere un experimento controlado sobre envenenamiento de observaciones (observation poisoning) en el entrenamiento de agentes, con semilla 42 y presumiblemente una tasa de poison del 49 por ciento, aunque el autor no documenta estos detalles en la ficha.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-7B, con aproximadamente 7.615 millones de parámetros totales (pesos en safetensors a precisión bf16, 15,2 GB de repositorio). El contexto, la tokenización y las capacidades de tool calling provienen del modelo base, que Qwen publicó con 32.768 tokens de ventana nativa y licencia Apache 2.0.

La relevancia de este checkpoint es acotada: no es un modelo listo para producción, sino un artefacto de investigación sin descargas ni interacciones registradas en el momento de redactar esta ficha. Su interés radica en estudiar cómo el envenenamiento de las observaciones degrada o altera el comportamiento de agentes que operan en entornos tipo WebShop, un problema relevante para la seguridad de agentes basados en LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct); detalles especificos del fine-tuning no disponibles |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativa en el modelo base; no confirmada para este checkpoint |
| Tipos de cuantizacion | Solo safetensors en bf16 en el repositorio; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la ficha; el modelo base esta orientado a ingles y codigo |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen2.5-Coder-7B-Instruct`: un transformer decoder-only denso de aproximadamente 7,6 mil millones de parámetros, con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con grouped query attention (GQA). El modelo base fue entrenado por Qwen sobre un corpus de varios billones de tokens con enfasis en codigo y posteriormente ajustado por instrucciones y preferencias. Este checkpoint concreto es un fine-tuning adicional cuyo dataset, numero de pasos, regimen de aprendizaje y metodo de alineacion (SFT, DPO, RLHF) no estan documentados en la informacion disponible.

La unica pista tecnica sobre el proceso es la propia nomenclatura del repositorio: `observation-poison49` apunta a un experimento de envenenamiento de observaciones y `s42` a una semilla fija. El tag `webshop` indica que el entorno de entrenamiento o evaluacion es WebShop, un benchmark de compra en navegacion web para agentes. El paper asociado (arXiv:2402.11208) trata sobre aprendizaje de agentes LLM con refinamiento de procesos, segun la referencia incluida en las etiquetas. No se especifican innovaciones arquitectonicas propias de este fine-tuning (no hay decodificacion especulativa, atencion lineal ni capas hibridas documentadas).

## Capacidades

- Generacion de texto y codigo, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Comportamiento de agente en entornos interactivos tipo WebShop (el tag `webshop` asi lo indica).
- Soporte de tool calling y function calling procedente del modelo base (formato Hermes/Qwen).
- Razonamiento multi-paso orientado a tareas de navegacion y decision secuencial.
- Conversacion multi-turno (tag `conversational`).
- Capacidad multilingue: no confirmada para este checkpoint; el modelo base esta centrado en ingles.
- Modo thinking, vision o audio: no disponible.
- El proposito experimental del checkpoint implica que sus capacidades pueden estar degradadas de forma deliberada por el envenenamiento de observaciones, no mejoradas.

## Casos de uso

- Investigacion sobre robustez de agentes: usar el checkpoint como condicion experimental para medir como el envenenamiento de observaciones afecta a la tasa de exito de tareas en WebShop frente al modelo base sin envenenar.
- Estudio de seguridad de agentes: analizar si el agente aprende atajos o comportamientos espurios cuando las observaciones de entrenamiento estan corrompidas, comparando con la linea base `Qwen2.5-Coder-7B-Instruct`.
- Reproducibilidad de experimentos: el sufijo de semilla `s42` permite replicar el mismo punto del espacio de resultados dentro de una bateria de entrenamientos.
- Evaluacion de alineacion bajo distribuciones corruptas: medir como se degrada la adherencia a instrucciones cuando el dataset de observaciones se manipula.
- Benchmarking de metodos de defensa: emplear este checkpoint como adversario positivo para validar tecnicas de filtrado o descontaminacion de trayectorias de agente.
- Analisis de transferencia a otros entornos de agente web: comprobar si el dano causado por el envenenamiento se generaliza a tareas de navegacion distintas de WebShop.
- Comparacion de metodos de fine-tuning: usar el checkpoint como referencia para cuantificar el impacto de la tasa de poison (49 por ciento en este caso) frente a otras tasas y semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de MMLU, HumanEval, GSM8K, WebShop success rate ni ninguna otra metrica, ni para este checkpoint ni en comparacion con el modelo base.

## Requisitos de hardware

- VRAM estimada en bf16 (pesos completos): aproximadamente 15,2 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica entre 18 y 22 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB.
- VRAM estimada en cuantizacion de 4 bits (si se generara una version GGUF/AWQ, no publicada): alrededor de 4,5 a 5 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para cargas de investigacion; RTX 4090 24 GB suficiente para bf16 con contexto reducido; RTX 3090 24 GB tambien viable.
- Caben en GPU de consumo: si, en RTX 4090, RTX 3090 o RTX 4080 (16 GB) con cuantizacion.
- Opciones de despliegue: transformers (libreria indicada en la ficha), text-generation-inference (tag `text-generation-inference`), y compatibilidad con endpoints (tag `endpoints_compatible`). vLLM, llama.cpp u Ollama requeririan convertir los pesos, ya que no se publican versiones GGUF ni AWQ.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| watch-qwen2.5-coder-7b-observation-poison49-s42 | 7,6 B | no confirmada (base 32.768) | Apache 2.0 | Gated, 0 descargas | Checkpoint de investigacion sobre envenenamiento de observaciones |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 nativa | Apache 2.0 | Publico | Modelo base; benchmarks publicados por Qwen |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 nativa | Apache 2.0 | Publico | Variante generalista sin especializacion en codigo |
| Meta Llama 3.1 8B Instruct | 8,0 B | 128.000 | Llama 3.1 Community License | Publico (gated) | Alternativa generalista con contexto mayor, licencia no Apache |

No se dispone de datos de rendimiento comparativos para el checkpoint experimental, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion: el nombre indica que ha sido entrenado sobre observaciones potencialmente envenenadas, por lo que su comportamiento puede ser intencionadamente anomalo o degradado.
- Riesgo elevado de alucinacion y de atajos espurios derivados del envenenamiento de observaciones.
- Sin datos de evaluacion publicados: no hay benchmarks que respalden ninguna afirmacion de calidad.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita su uso inmediato.
- Cero descargas y cero interacciones: no hay evidencia de uso ni validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion y el proposito declarado es la investigacion.
- Idiomas soportados no especificados; probablemente centrado en ingles, lo que limita su uso en castellano.
- Sin versiones cuantizadas oficiales: el despliegue eficiente requiere conversion manual a GGUF, AWQ o GPTQ.
- Posible sobreajuste al entorno WebShop: la transferencia a otros entornos de agente no esta validada.

## Enlaces

- HuggingFace: https://huggingface.co/chetan1209/watch-qwen2.5-coder-7b-observation-poison49-s42-20261010
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2402.11208
- WebShop (entorno de agente): https://webshop-pnlp.github.io/
