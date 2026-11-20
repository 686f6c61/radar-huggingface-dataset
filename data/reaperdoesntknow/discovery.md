# reaperdoesntknow/Discovery

## Resumen

DiscoverLM-70M-Base es un modelo de lenguaje causal de 70 millones de parámetros desarrollado por el usuario independiente reaperdoesntknow (bajo la etiqueta "convergentintel"). Su particularidad es que sustituye la atención estándar por producto escalar (Q·Kᵀ) por una **Mixture-of-Attentions (MoA)** basada en distancia métrica: cada cabeza opera en un espacio de Mahalanobis diagonal aprendido y la desigualdad triangular se impone mediante un regularizador sobre tripletas aleatorias durante el entrenamiento. El autor lo presenta como una prueba de concepto de que la geometría métrica puede integrarse de forma nativa en el mecanismo de atención en lugar de aproximarse a posteriori.

El modelo se distribuye en formato safetensors con la librería transformers, pero requiere código personalizado (módulo `MoA`) para cargarse, ya que la arquitectura no es estándar. El repositorio ocupa 0,3 GB y acumula 1586 descargas con fecha de actualización de noviembre de 2026. Está entrenado únicamente en inglés y su licencia es CC (Creative Commons, sin especificar variante en la información disponible).

Por su tamaño (70M) y su enfoque experimental, no compite con modelos de producción sino que sirve como banco de pruebas para investigar alternativas geométricas a la atención bilineal, la codificación posicional aprendida (BlackHoleRoPE) y el enrutado disperso por token (top-2) en bloques y FFN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Attentions (MoA): atención métrica de Mahalanobis + 4 rutas enrutadas top-2, BlackHoleRoPE, HyperFFN de 3 ramas |
| Parametros totales | 70.569.408 (69,1M segun el desglose del autor) |
| Parametros activos | No es MoE de expertos densos; el enrutado top-2 opera sobre rutas de atención y ramas FFN, no sobre parámetros separados |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC (variante no especificada) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura se organiza en 4 bloques MoA. Cada bloque contiene cuatro rutas paralelas: convolución local depthwise, atención métrica global multi-cabeza (64 cabezas, espacio de cabeza de 8 dimensiones con escala diagonal propia, origen de bola aprendible y radio adaptativo para poda dispersa), mezcla de canales con gating y atención métrica multi-query (64 queries). Un router aprendido selecciona las top-2 rutas por posición de token, y puertas de características escalan la salida de cada ruta antes de la mezcla. La atención se calcula como distancia cuadrática negativa bajo una métrica de Mahalanobis diagonal, con las parejas fuera de la bola enmascaradas antes del softmax; la desigualdad triangular se refuerza con un regularizador sobre tripletas aleatorias muestreadas durante el entrenamiento.

La codificación posicional, denominada BlackHoleRoPE, aplica perturbaciones de fase aprendidas desde una base de Fourier compacta manteniendo las rotaciones Q/K unitarias, y limita la energía de las amplitudes V al rango [0,5, 2,0]. El FFN (HyperFFN) combina SwiGLU, convolución causal depthwise separable y un cuello de botella de bajo rango con gating, también enrutado top-2 por token. La cabeza LM ejecuta su propia mezcla MoA (32 cabezas, head_dim=16) antes de proyectar a logits mediante SwiGLU, con pesos atados al embedding de entrada (vocabulario de 48.000 tokens con tokenizer propio).

El entrenamiento usa SFT (TRL) sobre tres datasets: nohurry/Opus-4.6-Reasoning-3000x-filtered (razonamiento multi-paso), openbmb/UltraData-Math (matemáticas) y yahma/alpaca-cleaned (instrucciones generales). No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés con tokenizer propio de 48.000 tokens.
- Razonamiento multi-paso, entrenado explícitamente sobre un dataset de cadenas de razonamiento filtradas.
- Resolución de problemas matemáticos (dataset UltraData-Math).
- Seguimiento de instrucciones generales (alpaca-cleaned).
- Generación estructurada mediante tokens especiales de chat: `<|system|>`, `<|user|>`, `<|assistant|>`, `<|think|>`, `<|reasoning|>`, `<|bos|>`, `<|eos|>`, `<|pad|>`.
- Modo de razonamiento interno delimitado por `<|think|>` y `<|reasoning|>`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en mecanismos de atención alternativos: sirve como referencia reproducible para comparar atención métrica frente a producto escalar en tareas pequeñas de modelado de lenguaje, gracias a que el código y los pesos son públicos.
- Experimentos académicos sobre desigualdad triangular en espacios latentes: el regularizador sobre tripletas permite estudiar empíricamente si la geometría métrica mejora la generalización en modelos pequeños.
- Prototipado de generación de texto en inglés con recursos mínimos: con 70M parámetros y 0,3 GB de pesos, se puede ejecutar en CPU o en GPUs de gama baja para pruebas de concepto.
- Generación de cadenas de razonamiento cortas: el entrenamiento sobre Opus-4.6-Reasoning y UltraData-Math lo hace adecuado para experimentos de razonamiento paso a paso en dominios acotados.
- Estudio de codificación posicional aprendida: BlackHoleRoPE permite analizar el efecto de perturbaciones de fase y gating de energía en la estabilidad del entrenamiento.
- Base para fine-tuning con SFT: al estar entrenado con TRL y publicar pesos en safetensors, se puede reentrenar sobre dominios específicos en inglés con coste computacional bajo.
- Benchmark de enrutado disperso: el router top-2 sobre rutas de atención y ramas FFN permite medir el impacto de la dispersión por token en modelos de menos de 100M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (70M parámetros × 4 bytes ≈ 280 MB), más overhead de activaciones y tokenizer; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: requiere el módulo personalizado `MoA` (clase `MoAMetricLM` y `MoAMetricConfig`) junto con transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato safetensors sin GGUF limita el despliegue en runtimes ligeros.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiscoverLM-70M-Base | 70,6M | No disponible | MoA con atención métrica | CC | Hugging Face, requiere código `MoA` |
| GPT-2 small | 124M | 1024 tokens | Transformer estándar | MIT | Hugging Face, transformers nativo |
| SmolLM-135M | 135M | 2048 tokens | Transformer estándar | Apache 2.0 | Hugging Face, transformers nativo |
| Pythia-70M | 70M | 2048 tokens | Transformer estándar | Apache 2.0 | Hugging Face, transformers nativo |

La comparación se limita a modelos de tamaño similar; no se dispone de datos de rendimiento del modelo analizado para contrastar métricas. La diferencia principal frente a las alternativas es arquitectónica (atención métrica y enrutado top-2) y de empaquetado (código personalizado frente a soporte nativo en transformers).

## Limitaciones y advertencias

- Modelo de 70M parámetros: capacidad de razonamiento y conocimiento factual muy limitada en comparación con modelos de miles de millones de parámetros.
- Entrenado solo en inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Riesgo elevado de alucinación y de respuestas incoherentes en dominios fuera de los datasets de entrenamiento (razonamiento, matemáticas e instrucciones generales).
- No se documentan evaluaciones de sesgo; al derivarse de datasets públicos (alpaca-cleaned, UltraData-Math, Opus-4.6-Reasoning filtrado) puede heredar sesgos presentes en ellos.
- La licencia CC no especifica la variante, lo que genera incertidumbre sobre el uso comercial; conviene verificar los términos exactos antes de desplegarlo en producción.
- Requiere código personalizado (`MoA`) no incluido en transformers estándar, lo que complica la integración en pipelines existentes y aumenta el riesgo de incompatibilidades.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- El autor es un desarrollador independiente y el modelo es experimental; no hay garantías de mantenimiento ni soporte.
- El número de descargas (1586) y la ausencia de likes sugieren una adopción limitada y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Discovery
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
