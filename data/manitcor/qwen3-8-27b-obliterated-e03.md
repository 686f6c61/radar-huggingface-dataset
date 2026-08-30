# manitcor/Qwen3.8-27B-Obliterated-E03

## Resumen

El modelo `manitcor/Qwen3.8-27B-Obliterated-E03` es un derivado del modelo Qwen3.8-27B de Alibaba, sometido a una intervención de abliteración (eliminación de la dirección de rechazo) mediante la herramienta OBLITERATUS. El objetivo es reducir el comportamiento de rechazo del modelo para facilitar la investigación en alineación, red teaming e interpretabilidad mecanicista. No debe considerarse un reemplazo seguro del modelo original.

Con 26.895 millones de parámetros, arquitectura híbrida Gated DeltaNet/atención completa, y una ventana de contexto de 262.144 tokens, este modelo conserva las capacidades del Qwen3.8-27B original pero con una tasa de rechazo drásticamente reducida (1% en el conjunto de validación final). Está publicado bajo licencia Apache 2.0 y en formato Safetensors con precisión BF16. Es un modelo solo texto; no conserva la interfaz visión-lenguaje del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM, híbrida Gated DeltaNet/atención completa |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (28 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida con 64 capas: 48 capas de atención lineal (Gated DeltaNet) y 16 capas de atención completa. El tamaño oculto es de 5.120 dimensiones y el vocabulario de 248.320 tokens. El derivado `Obliterated-E03` se obtuvo aplicando la intervención `qwen38_e03` de OBLITERATUS, que extrae direcciones de rechazo mediante SVD (4 direcciones) y las proyecta fuera de las proyecciones de salida de 312 matrices (48 `linear_attn.out_proj`, 16 `self_attn.o_proj` y 64 `mlp.down_proj` por capa, en las capas 12 a 50). La intervención incluye preservación de norma, regularización 0.10, co-optimización KL con presupuesto de 0.5 nats y winsorización de activaciones. No se aplicó cuantización durante la cirugía.

El entrenamiento de la intervención usó un split inmutable de 500 pares para la extracción de direcciones, un split de 142 pares para el ajuste del optimizador y un split final de 200 pares como holdout. El modelo se guardó tras pasar las puertas de promoción preregistradas (refusal < 30% y coherencia ≥ 80%).

## Capacidades

- Generación de texto y razonamiento conversacional en inglés.
- Tool calling y generación de salidas con esquema JSON (verificado en las pruebas de capacidad).
- Razonamiento aritmético y de cadena de pensamiento (aunque la sonda de aritmética falló en la evaluación).
- Generación de código (sonda superada).
- Instrucción de seguimiento (sonda superada).
- Descripción visual (sonda superada, aunque el modelo es solo texto; la sonda probablemente evalúa la capacidad de describir imágenes a partir de texto).
- Comportamiento de rechazo materialmente reducido respecto al modelo base, lo que lo hace útil para investigación de alineación y red teaming.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite estudiar cómo la eliminación de direcciones de rechazo afecta al comportamiento del modelo, comparando con el modelo base.
- Red teaming y evaluación de seguridad: útil para probar defensas y medir la propensión a generar contenido dañino cuando se elimina el rechazo.
- Desarrollo de técnicas de alineación: sirve como banco de pruebas para intervenciones de abliteración y métodos de control de comportamiento.
- Generación de código en entornos controlados: con tool calling y generación JSON, puede integrarse en pipelines de desarrollo donde se requiere un modelo sin restricciones de rechazo (siempre con supervisión humana).
- Análisis de robustez de modelos: permite comparar el rendimiento en tareas de razonamiento y coherencia tras la intervención.
- Estudio de la relación entre rechazo y capacidades: al medir la perplexity y las métricas de coherencia, se puede evaluar el coste de la abliteración en las capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta los siguientes datos de evaluación de la intervención:

| Métrica | Baseline pristino | Optimizer tune (n=142) | Holdout final (n=200) |
|---|---|---|---|
| Tasa de rechazo | no usado como baseline | 1,41% (2/142) | 1,00% (2/200) |
| Coherencia determinista | 100% | 100% | 100% |
| Comprobaciones de capacidad | — | 83,3% (5/6) | 83,3% (5/6) |
| Perplexity de referencia | 3,1474 | 3,2099 | 3,2099 |
| Ratio de perplexity | 1,000× | 1,0198× | 1,0198× |
| Respuestas dañinas degeneradas | — | 0,70% (1/142) | 3,00% (6/200) |
| Respuestas de coherencia degeneradas | — | 0% | 0% |

Las seis sondas de capacidad cubrieron tool calling, salida con esquema JSON, razonamiento aritmético, generación de código, descripción visual y seguimiento de instrucciones. La sonda de aritmética/cadena de pensamiento falló; las otras cinco pasaron.

## Requisitos de hardware

- VRAM estimada: aproximadamente 52 GB en una A100 de 80 GB para carga completa en BF16 (según la model card).
- Peso serializado: ~54 GB (53,8 GB) en BF16.
- GPU recomendadas: A100 80 GB, H100 80 GB, o GPUs con al menos 60-80 GB de VRAM para inferencia sin cuantización.
- No cabe en GPUs de consumo típicas (RTX 4090 tiene 24 GB, insuficiente para BF16 completo).
- Opciones de despliegue: transformers con device_map="auto", vLLM (si soporta la arquitectura híbrida), TGI, o conversión a GGUF para llama.cpp/Ollama (aunque no se proporciona GGUF en este repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 26.895.998.464 | 262.144 | Apache 2.0 | Modelo original multimodal, con rechazo estándar |
| manitcor/Qwen3.8-27B-Obliterated-E03 | 26.895.998.464 | 262.144 | Apache 2.0 | Derivado solo texto, abliterado con OBLITERATUS |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | no disponible | Otro abliterado del mismo base, sin detalles de intervención |

El modelo de manitcor se distingue por documentar exhaustivamente el procedimiento de abliteración y sus métricas de evaluación, mientras que el de huihui-ai no proporciona esa información en la búsqueda realizada.

## Limitaciones y advertencias

- El modelo tiene un comportamiento de rechazo materialmente reducido; no debe usarse como un modelo alineado con seguridad. Puede generar contenido dañino o inapropiado.
- Es solo texto: no conserva la interfaz visión-lenguaje del modelo base Qwen3.8-27B.
- La sonda de razonamiento aritmético/cadena de pensamiento falló en la evaluación, lo que sugiere una posible degradación en esa capacidad.
- La tasa de respuestas dañinas degeneradas en el holdout final fue del 3%, un valor bajo pero no nulo.
- El modelo está pensado para investigación y red teaming; su uso en producción requiere supervisión humana y filtros adicionales.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que no es un reemplazo seguro del modelo original.
- No se proporcionan cuantizaciones; el tamaño en BF16 (~54 GB) limita su despliegue a hardware con mucha VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manitcor/Qwen3.8-27B-Obliterated-E03
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Abliterado alternativo de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Página de GGUF de Qwen3.8 27B Obliterated: https://local-ai-zone.github.io/models/qwen3-8-27b-obliterated.html
