# ComputationalLinguisticsPlatform/LexisLM-1B

## Resumen

LexisLM-1B es un modelo de lenguaje causal (decoder-only) especializado en griego moderno, desarrollado por ComputationalLinguisticsPlatform. Se trata de un modelo base preentrenado desde cero sobre aproximadamente 22.000 millones de tokens procedentes de FineWeb2 y de la Wikipedia en griego, y constituye la variante de 1.000 millones de parámetros de una familia que también incluye un modelo de 500M. Su publicación se enmarca en el trabajo "Compact Greek Language Models from Scratch: Pretraining 500M- and 1B-Parameter Decoder-Only Transformers" (Perifanos et al., 2026), que documenta el preentrenamiento de transformers decoder-only compactos para una lengua con recursos limitados como el griego.

Arquitectónicamente es un transformer compatible con Llama, con 20 capas, dimensión oculta de 2.048, 16 cabezas de atención, vocabulario de 32.004 tokens y una ventana de contexto de 4.096 tokens. Con 1.093.232.640 parámetros reales (según los pesos en safetensors) y un repositorio de 2,2 GB, está pensado para experimentación y como punto de partida para fine-tuning, no como un asistente conversacional listo para producción.

Su relevancia radica en que cubre un nicho poco atendido: modelos compactos y abiertos (Apache-2.0) para griego, un idioma escasamente representado en los grandes modelos multilingües. No obstante, al ser un modelo base sin ajuste por instrucciones, sus resultados en benchmarks de conocimiento y razonamiento son bajos y debe evaluarse con expectativas ajustadas a su tamaño y propósito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, compatible con Llama |
| Parametros totales | 1.093.232.640 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Griego (el) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (junto con configuración y tokenizer para Transformers) |
| Capas del transformer | 20 |
| Dimension oculta | 2.048 |
| Cabezas de atencion | 16 |
| Tamano del vocabulario | 32.004 tokens |
| Tamano del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

LexisLM-1B es un transformer decoder-only de tipo causal con una arquitectura compatible con Llama: 20 capas, dimensión oculta de 2.048 y 16 cabezas de atención, con un vocabulario de 32.004 tokens. No emplea mezcla de expertos ni mecanismos híbridos tipo SSM; es un modelo denso convencional. La model card no detalla innovaciones técnicas adicionales como atención lineal, decodificación especulativa o variantes de atención eficiente.

El preentrenamiento se realizó desde cero sobre aproximadamente 22.000 millones de tokens extraídos de FineWeb2 (HuggingFaceFW, bajo licencia ODC-By-1.0) y de la Wikipedia en griego. Los documentos de preentrenamiento se separaron con el token `<eos>`, y la model card recomienda iniciar cada documento nuevo con dicho token al generar. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones: esta versión es explícitamente el modelo base, sin alineamiento conversacional.

## Capacidades

- Generación de texto en griego: completado de texto y continuación de documentos, el uso principal para el que fue entrenado.
- Modelado de lenguaje causal: adecuado como base para fine-tuning supervisado y posteriores etapas de alineamiento.
- Manejo de documentos largos dentro de su ventana: contexto de 4.096 tokens, suficiente para artículos, fragmentos de Wikipedia y párrafos extensos.
- Capacidades multilingües: limitadas al griego según la metadata del modelo; no se declara soporte para otros idiomas.
- Tool calling / function calling: no disponible; no se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser un modelo base sin instrucciones, no se espera un comportamiento agéntico fiable.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.
- Conocimiento factual y razonamiento: limitados por el tamaño y por los resultados de benchmarks (ver sección siguiente).

## Casos de uso

- Experimentación en procesamiento del lenguaje natural para griego: uso del modelo como banco de pruebas para estudiar comportamiento lingüístico, tokenización y generación en griego moderno, aprovechando su licencia permisiva y su tamaño manejable.
- Punto de partida para fine-tuning supervisado: ajuste sobre datasets etiquetados en griego (clasificación, extracción, resumen) partiendo de los pesos base, con un coste de cómputo bajo en comparación con modelos de mayor tamaño.
- Generación de texto y completado de documentos en griego: continuación de artículos, párrafos o entradas enciclopédicas, iniciando cada documento con `<eos>` como indica la model card.
- Aumento de datos sintéticos en griego: generación de texto adicional para ampliar corpus de entrenamiento de otros sistemas, con revisión humana posterior.
- Investigación sobre modelos compactos en lenguas de bajos recursos: reproducción y extensión del trabajo de Perifanos et al., comparando la variante de 1B con la de 500M.
- Prototipado de aplicaciones lingüísticas en griego: integración en pipelines de Transformers para pruebas de concepto de generación de texto, siempre con validación de calidad antes de cualquier uso en producción.
- Fine-tuning para tareas específicas de dominio (legal, académico, periodístico) en griego: el contexto de 4.096 tokens permite trabajar con fragmentos de documentos de longitud media.

## Benchmarks y rendimiento

Resultados reportados en la model card con 0 ejemplos few-shot (porcentajes). ARC usa precisión normalizada; el resto, precisión o métricas de elección múltiple según se indica.

| Benchmark | Metrica | Resultado | Preguntas |
|---|---|---:|---:|
| ARC-Challenge | Precisión normalizada | 25,34% | 1.168 |
| ARC-Easy | Precisión normalizada | 33,38% | 2.376 |
| MMLU | Precisión | 23,15% | 14.042 |
| TruthfulQA | MC1 | 24,60% | 817 |
| TruthfulQA | MC2 | 43,49% | 817 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni comparativas directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,2 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB con contexto completo de 4.096 tokens.
- VRAM estimada en FP32: alrededor de 4,4 GB para los pesos, más overhead; en torno a 6-8 GB en total.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; tarjetas consumer como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para entrenamiento o fine-tuning, se recomienda A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, con holgura en modelos de 8 GB o más; incluso es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: Hugging Face Transformers (con `accelerate` y `device_map="auto"`), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa por parte del usuario.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados comparativos con otros modelos griegos o de tamaño similar. A modo de referencia estructural, se comparan parámetros, contexto y licencia con alternativas genéricas de la misma escala; los datos de rendimiento de los comparadores no se han verificado en esta búsqueda y deben consultarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LexisLM-1B | 1.093 M | 4.096 | Apache-2.0 | Griego, base |
| LexisLM-500M (misma familia) | ~500 M | No disponible | Apache-2.0 (según paper) | Griego, base |
| Llama 3.2 1B | ~1.240 M | 128.000 | Llama 3.2 Community License | Multilingüe, instruct disponible |
| Qwen2.5-1.5B | ~1.540 M | 32.768 | Apache-2.0 | Multilingüe, base e instruct |

La comparación de rendimiento real entre estos modelos en tareas en griego no está disponible en la información consultada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde de forma fiable a preguntas directas ni a formatos de chat; la model card lo advierte explícitamente.
- Riesgo elevado de alucinación y de texto inexacto: los resultados en TruthfulQA (MC1 24,60%) y MMLU (23,15%) indican un conocimiento factual y de razonamiento limitados.
- Sesgos de los datos de entrenamiento: al proceder de FineWeb2 y Wikipedia, puede reflejar sesgos presentes en esas fuentes; se recomienda revisión humana antes de usos sensibles.
- Cobertura lingüística restringida al griego: no se declara soporte para otros idiomas, por lo que su uso fuera del griego no es recomendable.
- Ventana de contexto de solo 4.096 tokens: insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia Apache-2.0 permisiva para uso comercial de los pesos, pero los derechos sobre los datos subyacentes (FineWeb2 bajo ODC-By-1.0 y Wikipedia) permanecen con sus titulares; conviene revisar las condiciones de atribución de las fuentes.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ): el despliegue en entornos con llama.cpp u Ollama requiere conversión manual y validación de calidad.
- Advertencia de producción: no debe desplegarse en aplicaciones de cara al usuario sin fine-tuning, evaluación específica de la tarea y filtros de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ComputationalLinguisticsPlatform/LexisLM-1B
- Paper (arXiv): https://arxiv.org/abs/2611.10209
- FineWeb2 (HuggingFaceFW): no disponible como enlace directo en la información proporcionada
- Repositorio de Transformers: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada
