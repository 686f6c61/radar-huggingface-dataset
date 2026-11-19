# mhseo2/klear8b-planfmt-sftv9ptok-s387

## Resumen

klear8b-planfmt-sftv9ptok-s387 es un ajuste fino supervisado (SFT) de un modelo base de la familia Qwen3, publicado por el usuario mhseo2 en Hugging Face. El modelo tiene 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) y se distribuye en formato safetensors con un repositorio de 16,4 GB. Su nombre y model card indican que se trata de un experimento de formato de planificación: el entrenamiento introduce un token especial de planificación (`<|plan|>`, con id 151669) para estructurar las respuestas del modelo en fases de plan y de decisión.

El modelo parte de Klear-Reasoner-8B-SFT-ptok y se ha entrenado sobre el dataset `mhseo2/klear-planfmt-pgdpo-pairs`, en la ruta `plan_gepa/v8_full/merged_ptok`, con 12.408 filas de entrenamiento. El checkpoint publicado corresponde al paso 387 de 387, es decir, el estado final del entrenamiento. La receta emplea FSDP2 sobre 2 GPU H100, batch de 32, learning rate de 2e-5 con decaimiento coseno, weight decay de 0,01, gradient clipping de 1 y una longitud máxima de secuencia de 32.768 tokens.

Se trata de un artefacto de investigación con escasa documentación pública: no declara licencia, idiomas soportados ni pipeline, y no tiene descargas ni likes en el momento de la consulta. Su interés es acotado y experimental, orientado a quienes investigan formatos de planificación y razonamiento estructurado en modelos de 8B, no a un uso directo en producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 (derivado de Klear-Reasoner-8B-SFT-ptok); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | Entrenado con max_length 32.768; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen3 y de su base, Klear-Reasoner-8B-SFT-ptok. Por el recuento de parámetros (8,19B) y el tag `qwen3`, se trata de un transformer denso de aproximadamente 8B parámetros, sin indicios de mezcla de expertos. No se especifican número de capas, dimensión oculta, cabezas de atención ni tipo de atención (completa, lineal o híbrida).

El entrenamiento es un SFT con una innovación concreta: la introducción de un único token de planificación (`<|plan|>`, id 151669) que separa la fase de plan de la fase de decisión en la generación. La receta usa FSDP2 con paralelismo de secuencia Ulysses (SP 1) sobre 2 GPU H100, batch 32, learning rate 2e-5 con schedule coseno (ratio mínimo 0,5, 11 pasos de warmup), weight decay 0,01, clipping de gradiente 1 y longitud máxima de 32.768. La pérdida combina pesos por estructura (20), decisión (5) y decisión continua (5), más un término de contraste de plan con margen 0,1 y peso 1. El dataset de entrenamiento tiene 12.408 filas y deriva de `mopdRL` (commit 27d80cd9). No se documentan número total de tokens vistos, composición del corpus ni fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT-ptok, orientado a razonamiento.
- Planificación estructurada: emite un token `<|plan|>` que separa explícitamente el plan de la respuesta o decisión, lo que facilita el parseo y la verificación de la traza de razonamiento.
- Razonamiento multi-paso: el formato de plan y decisión está diseñado para tareas que requieren descomposición en etapas.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes: no confirmado; el formato de planificación es compatible en principio con bucles de agente, pero no hay documentación al respecto.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en formatos de planificación: el modelo sirve como referencia para estudiar cómo un token de plan explícito afecta a la estructura de las respuestas y a la verificabilidad de la traza de razonamiento en modelos de 8B.
- Evaluación de recetas de SFT: con hiperparámetros y dataset documentados (12.408 filas, lr 2e-5, batch 32, max_length 32.768), es útil para reproducir o comparar recetas de ajuste supervisado sobre bases Qwen3.
- Generación de trazas parseables: en pipelines que necesitan separar plan y ejecución, el token `<|plan|>` permite dividir la salida en secciones con un delimitador estable y de id fijo (151669).
- Experimentos de razonamiento de contexto largo: la ventana de entrenamiento de 32.768 tokens permite probar tareas de planificación sobre documentos extensos, siempre que se valide el comportamiento real más allá de la longitud vista.
- Base para ajustes posteriores: al ser un checkpoint SFT final (paso 387/387), puede servir como punto de partida para DPO, RL o ajustes específicos de dominio.
- Estudio de pérdidas ponderadas por estructura: la combinación de pesos (20/5/5) y el término de contraste de plan con margen 0,1 son un caso práctico para analizar el efecto de pérdidas auxiliares en la calidad del plan generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, los 8,19B parámetros ocupan aproximadamente 16,4 GB solo en pesos, más caché KV y activaciones; se recomienda al menos 24 GB para secuencias cortas y bastante más para contextos cercanos a 32.768 tokens.
- Cuantización: no se publican pesos GGUF ni cuantizados; habría que generarlos a partir de los safetensors. En 8 bits se estiman unos 8-9 GB de pesos; en 4 bits, unos 4-5 GB, más overhead.
- GPU recomendadas: H100 o A100 para entrenamiento e inferencia de contexto largo; RTX 4090 (24 GB) puede alojar el modelo en bf16 con secuencias moderadas o en cuantización 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto limitado, o en GPUs de 16 GB si se cuantiza a 8 o 4 bits (estimación, no verificada).
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama tras convertir los pesos a GGUF; el token especial `<|plan|>` requiere configuración explícita del tokenizer en el servidor de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| klear8b-planfmt-sftv9ptok-s387 | 8,19B | 32.768 (entrenamiento) | No disponible | Hugging Face, safetensors |
| Qwen3-8B (base de la familia) | ~8B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Klear-Reasoner-8B-SFT-ptok (modelo de partida) | ~8B | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros y procedencia.

## Limitaciones y advertencias

- Documentación mínima: sin licencia, idiomas, pipeline ni benchmarks declarados; no es apto para producción sin una evaluación propia.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o asumir la licencia del modelo base Qwen3, que no se especifica aquí.
- Artefacto experimental: es el paso final de una receta concreta (v8b, paso 387/387) sin validación publicada; el comportamiento puede degradarse fuera del dominio del dataset de 12.408 filas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el formato de plan no garantiza la veracidad del contenido.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no se pueden evaluar sesgos de género, idioma o dominio.
- Token especial: el uso correcto depende de configurar el id 151669 en el tokenizer y en el servidor de inferencia; un manejo incorrecto rompe el formato de plan.
- Contexto: aunque se entrenó con 32.768 tokens, no hay evidencia de calidad sostenida en esa longitud; conviene validar con tareas propias.
- Idiomas: sin datos; no se recomienda asumir un rendimiento multilingüe equivalente al de Qwen3 sin pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/klear8b-planfmt-sftv9ptok-s387
- Dataset de entrenamiento: https://huggingface.co/datasets/mhseo2/klear-planfmt-pgdpo-pairs
- Modelo de partida: Klear-Reasoner-8B-SFT-ptok (referenciado en la model card; URL no disponible)
- Repositorio de código `mopdRL` (commit 27d80cd9): URL no disponible
