# joey00072/ohara-base-d12

## Resumen

ohara-base-d12 es un modelo de lenguaje base (no instructivo) desarrollado por joey00072 como parte del ecosistema de entrenamiento ohara. Se trata de un modelo pequeño de 123,5 millones de parámetros efectivos, entrenado desde cero sobre 1,48 mil millones de tokens del dataset nvidia/ClimbMix en aproximadamente 3,3 horas utilizando dos GPU A100-80GB. Su propósito principal es servir como punto de partida para fine-tuning posterior, no como modelo de chat listo para producción.

El modelo sigue una arquitectura Llama-style con 12 capas, 768 dimensiones ocultas y 6 cabezas de atención, con una longitud de contexto de 2048 tokens. Su relevancia radica en que demuestra un pipeline de preentrenamiento eficiente y reproducible (el proyecto ohara está publicado en GitHub), y en que su pequeño tamaño lo hace accesible para experimentación en hardware modesto. Es importante destacar que es un modelo base: continúa texto sin detenerse y no responde preguntas de forma conversacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (RoPE, SwiGLU, RMSNorm, embeddings no compartidos) |
| Parametros totales | 162,2M (123,5M efectivos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuye en bf16) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de estilo Llama, con normalización RMSNorm, activaciones SwiGLU, embeddings rotacionales (RoPE) y embeddings de token no compartidos con la capa de salida. La inicialización sigue el esquema nanochat y el entrenamiento utiliza el optimizador Muon para las matrices de pesos y AdamW para embeddings y escalares, con precisión mixta bf16.

El preentrenamiento se realizó sobre 1,48 mil millones de tokens del dataset nvidia/ClimbMix, en 2.827 pasos con un batch de 524.288 tokens. Se empleó una tasa de aprendizaje de 0,02 con un programada warmup-stable-decay. El vocabulario es de 50.265 tokens (el de gpt-neo-125m más 8 tokens especiales de conversación reservados, que no se ven durante el preentrenamiento para permitir fine-tuning posterior sin redimensionar embeddings). La pérdida final de validación fue de 2,9153 con una precisión de siguiente token del 43,6%.

## Capacidades

- Generacion de texto autoregresiva: el modelo continúa secuencias de texto de forma fluida, aunque sin control conversacional.
- Preentrenamiento de base: diseñado para ser fine-tuneado mediante SFT (supervised finetuning) u otras técnicas.
- Reserva de tokens especiales: incluye 8 tokens de conversación reservados en el vocabulario, listos para ser usados en fine-tuning sin necesidad de redimensionar la capa de embeddings.
- Reproducibilidad: el entrenamiento completo se puede replicar con un solo comando (`DEPTH=12 bash runs/speedrun.sh`).
- Multilingüismo: no disponible, el modelo solo está entrenado en inglés.
- Tool calling, agentes, razonamiento multi-paso, vision o audio: no soportado (modelo base pequeño, solo texto).

## Casos de uso

- Fine-tuning experimental para investigación: el caso de uso principal es servir como base para que investigadores y desarrolladores entrenen sus propios modelos de chat o tareas específicas con un coste computacional muy reducido.
- Educacion y aprendizaje de mecanicas de preentrenamiento: por su tamaño y el pipeline reproducible, es adecuado para estudiar cómo funciona el preentrenamiento de un transformer desde cero, curvas de pérdida, efectos de hiperparámetros, etc.
- Prototipado rapido de pipelines de fine-tuning: al ser un checkpoint base pequeño, permite validar scripts de SFT, DPO o RLHF con tiempos de iteración cortos antes de escalar a modelos mayores.
- Generacion de texto continua en dominios acotados: puede usarse como generador de texto libre (no conversacional) en aplicaciones donde no se requiere seguir instrucciones, como generación de ideas, borradores o aumentación de datos.
- Benchmarking de eficiencia de entrenamiento: sirve como referencia para comparar la eficiencia de diferentes configuraciones de hardware, optimizadores o datasets de preentrenamiento.
- Integracion en pipelines de aumentacion de datos: puede generar texto sintético en inglés para aumentar datasets de entrenamiento de modelos más grandes, aunque con supervisión humana dada su limitada calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento reportados son métricas de preentrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 2,9153 |
| Precisión de siguiente token | 43,6% |
| Bits/byte de validacion (step 2827) | 0,9062 |

Para contexto, el autor indica que nanochat alcanza calidad GPT-2 con aproximadamente 28 veces más cómputo que los 1,4e18 FLOPs usados aquí, lo que sitúa a este modelo en un rango de calidad claramente inferior a GPT-2.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bf16 (el checkpoint ocupa aproximadamente 1,6 GB en disco, pero en memoria de inferencia con batch 1 cabe en cualquier GPU moderna).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en 2x A100-80GB, pero la inferencia es viable en CPU o GPU de gama baja.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer (GTX 1060 6GB o superior, RTX 3060, etc.).
- Opciones de despliegue: al ser un checkpoint .pt de PyTorch, se puede cargar con la librería ohara; no se proporcionan pesos en GGUF, safetensors ni otros formatos, por lo que no es compatible directamente con vLLM, llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponible, pero por su tamaño se espera una latencia muy baja (del orden de milisegundos por token en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ohara-base-d12 | 123,5M efectivos | 2048 | MIT | .pt | Modelo base, solo ingles, entrenado en 1,48B tokens |
| GPT-2 (124M) | 124M | 1024 | MIT | multiple | Modelo base, solo ingles, entrenado en ~40B tokens, calidad muy superior |
| nanochat (referencia) | no disponible | no disponible | MIT | no disponible | Modelo base de calidad GPT-2 con ~28x más cómputo que ohara-base-d12 |

La comparación con GPT-2 es la más relevante por tamaño similar, pero ohara-base-d12 fue entrenado con aproximadamente 27 veces menos datos, lo que explica su menor calidad. No se dispone de información sobre otros modelos comparables en el mismo rango de parámetros y presupuesto de entrenamiento.

## Limitaciones y advertencias

- Modelo base, no instructivo: no responde preguntas ni sigue instrucciones; continúa texto de forma autónoma y no tiene criterio de parada.
- Calidad limitada: con solo 1,48B tokens de entrenamiento y 123,5M de parámetros, la generación es de baja calidad en comparación con modelos como GPT-2 o Llama-3.2-1B.
- Solo ingles: no soporta otros idiomas.
- Contexto corto: 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Sin benchmarks estandar: no hay datos de MMLU, HumanEval u otros, lo que dificulta evaluar su rendimiento real en tareas concretas.
- Formato propietario: los pesos están en formato .pt de PyTorch y requieren la librería ohara para cargarse; no hay conversión a GGUF, safetensors ni ONNX.
- Riesgo de alucinacion: como todo modelo base pequeño, puede generar texto factualmente incorrecto o incoherente; no apto para uso en producción sin supervisión.
- Sesgos: no se ha documentado ningún análisis de sesgos; al entrenarse solo en ClimbMix, puede reflejar los sesgos de ese dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joey00072/ohara-base-d12
- Modelo chat derivado: https://huggingface.co/joey00072/ohara-chat-d12
- Repositorio ohara en GitHub: https://github.com/joey00072/ohara
- Codigo del modulo base: https://github.com/joey00072/ohara/blob/master/ohara/modules/base.py
- Codigo del trainer: https://github.com/joey00072/ohara/blob/master/ohara/trainer.py
- Perfil del autor en HuggingFace: https://huggingface.co/joey00072
