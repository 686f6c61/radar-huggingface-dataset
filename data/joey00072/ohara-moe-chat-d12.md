# joey00072/ohara-moe-chat-d12

## Resumen

ohara-moe-chat-d12 es un modelo de chat basado en arquitectura de mezcla de expertos (MoE) de 332 millones de parámetros, de los cuales 85 millones se activan por token. Ha sido entrenado desde cero con la librería `ohara` siguiendo el pipeline nanochat: primero un pretrain sobre el corpus ClimbMix y después un ajuste supervisado (SFT) sobre conversaciones de SmolTalk, MMLU y GSM8K. El autor lo presenta como una demostración de pipeline funcional, no como un asistente listo para producción, y advierte explícitamente que confabula con libertad.

El modelo emplea 8 expertos por capa con enrutamiento top-2 en todas sus 12 capas, sin experto compartido. Cada experto es una SwiGLU de ancho 1024, exactamente la mitad del ancho de la FFN densa equivalente, de modo que dos expertos activos cuestan los mismos FLOPs que una FFN densa. El balanceo de carga se resuelve mediante *quantile balancing* (técnica de Jianlin Su usada en Kimi K2/K3), sin pérdida auxiliar ni coeficiente de balanceo que ajustar. La ventana de contexto es de 2048 tokens y el vocabulario de 50.304 entradas.

La relevancia de este modelo es principalmente investigadora: permite comparar de forma controlada una arquitectura MoE frente a su contraparte densa con el mismo presupuesto de FLOPs, datos y semilla. Los resultados reportados por el autor muestran una ventaja consistente del MoE en bits/byte, accuracy y perplexity, aunque el coste por paso en tiempo de entrenamiento es mayor. No está pensado para uso productivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 8 expertos por capa, top-2, sin experto compartido |
| Parametros totales | 332.163.936 (332M) |
| Parametros activos | 85M |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer con capas de mezcla de expertos. Cada una de las 12 capas contiene 8 expertos SwiGLU de ancho 1024, y se activan los 2 mejores según el enrutador (top-2). No hay experto compartido, a diferencia de diseños tipo DeepSeek. El balanceo de carga se implementa con *quantile balancing*: la bias del enrutador se resuelve en forma cerrada a partir de estadísticas del batch en cada paso del optimizador, sin pérdida auxiliar. Según el autor, los 12 enrutadores convergieron a un estado balanceado con MaxVio ~0.03.

El entrenamiento consta de dos fases. El pretrain se realizó durante 2.827 pasos con 1.48 mil millones de tokens de ClimbMix, batch de 524.288 tokens, optimizador Muon con learning rate 0.02, programación warmup-stable-decay y precisión bf16. La fase de SFT duró 800 pasos sobre 567.656 conversaciones de SmolTalk, MMLU y GSM8K, calculando la pérdida únicamente sobre los tokens de asistente y empaquetando las conversaciones para que ninguna se dividiera entre filas. El autor indica que el entrenamiento total consumió aproximadamente 1.4e18 FLOPs, alrededor del 3.5% de lo que nanochat emplea para alcanzar calidad GPT-2.

## Capacidades

- Generación de texto conversacional en inglés, manteniendo el formato de chat y deteniéndose de forma limpia.
- Respuesta a preguntas sencillas y razonamiento básico, aunque con alta tendencia a la confabulación.
- Soporte de conversaciones multi-turno dentro de la ventana de 2048 tokens.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Capacidad multilingüe limitada al inglés; no se reportan resultados en otros idiomas.

## Casos de uso

- Investigación educativa sobre arquitecturas MoE: el modelo permite estudiar el comportamiento de enrutamiento top-2, balanceo de carga y sparsity en un entorno pequeño y reproducible.
- Comparación controlada MoE vs denso: al existir una contraparte densa entrenada con el mismo presupuesto de FLOPs, datos y semilla, es útil para analizar diferencias de calidad y coste computacional.
- Experimentación con pipelines de entrenamiento: sirve como banco de pruebas para el flujo pretrain + SFT de la librería `ohara`, incluyendo el uso de Muon, empaquetado de conversaciones y pérdida sobre tokens de asistente.
- Validación de técnicas de balanceo de carga: el *quantile balancing* implementado puede evaluarse en un modelo pequeño antes de escalar a arquitecturas mayores.
- Generación de ejemplos sintéticos de conversación para análisis cualitativo de alucinaciones y errores de razonamiento en modelos pequeños.
- Desarrollo de herramientas de evaluación de modelos generativos: al ser ligero (332M parámetros), puede ejecutarse en entornos con recursos limitados para probar métricas de calidad de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas de validación propias comparando el MoE con su contraparte densa bajo condiciones idénticas de FLOPs, datos, programación y semilla:

| Metrica | Denso (162M) | MoE (332M, 85M activos) |
|---|---|---|
| Pretrain val bits/byte | 0.9062 | 0.8887 |
| Pretrain val accuracy | 43.63% | 44.37% |
| SFT val loss | 1.2084 | 1.1536 |
| SFT val perplexity | 3.35 | 3.17 |
| SFT val accuracy | 69.40% | 70.40% |

El MoE mantuvo una ventaja de ~1.9% en bits/byte en todas las evaluaciones y alcanzó la calidad final del modelo denso unas 500 pasos antes. En tiempo de pared, el entrenamiento MoE tardó 2.35 horas frente a 3.92 horas del denso, pero esa diferencia se atribuye a datos pre-tokenizados y `torch.compile`, no a la arquitectura MoE. A FLOPs iguales, el enrutamiento MoE cuesta aproximadamente 2.1 veces el tiempo de paso del denso.

## Requisitos de hardware

- Los pesos en safetensors ocupan 1.3 GB, lo que en bf16 equivale a unos 664 MB de memoria para los parámetros, más overhead de activaciones y optimizador.
- Inferencia en GPU consumer: cabe en tarjetas con 4 GB de VRAM o más, como una GTX 1650 Super, RTX 3050 o superiores. Una RTX 3060 12 GB sería más que suficiente.
- Al tener solo 85M parámetros activos por token, la memoria de activaciones es reducida, pero el modelo completo debe cargarse en memoria.
- Opciones de despliegue: al ser un modelo de la librería `ohara`, se puede ejecutar con el `ChatEngine` incluido. No se han reportado integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no hay datos publicados. Dado el tamaño, se espera una generación rápida en GPU consumer, pero no se puede cuantificar sin mediciones.

## Comparativa con modelos similares

La comparación más directa es con su contraparte densa, también publicada por el autor:

| Modelo | Parametros | Activos | Contexto | Licencia | Ventaja reportada |
|---|---|---|---|---|---|
| ohara-moe-chat-d12 | 332M | 85M | 2048 | MIT | Mejor val loss, perplexity y accuracy que el denso |
| ohara-chat-d12 | 162M | 162M | 2048 | MIT | Referencia densa con mismos FLOPs por token |

No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, GPT-2 pequeño o modelos nanochat) en la información proporcionada. El autor menciona que el entrenamiento equivale a ~3.5% de lo que nanochat gasta para alcanzar calidad GPT-2, lo que sugiere que el rendimiento está muy por debajo de modelos como GPT-2, pero no hay datos numéricos de comparación directa.

## Limitaciones y advertencias

- El autor advierte explícitamente: "Calibrate before building on this". El modelo confabula libremente y no es un asistente útil; es una demostración de pipeline.
- Entrenamiento con solo 1.4e18 FLOPs, muy por debajo de lo necesario para calidad GPT-2 (aproximadamente 3.5% del presupuesto de nanochat).
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Solo soporta inglés; no se ha evaluado en otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo no es apto para producción debido a su baja calidad y alta tasa de alucinación.
- El `config.json` registra `moe_experts_per_tok`, que no puede recuperarse de las formas de los tensores; sin ese valor, los pesos cargan pero el enrutamiento usa un top-k incorrecto.
- No se han publicado resultados de benchmarks estándar, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joey00072/ohara-moe-chat-d12
- Repositorio de la librería ohara: https://github.com/joey00072/ohara
- Modelo base (pretrain): https://huggingface.co/joey00072/ohara-moe-base-d12
- Contraparte densa: https://huggingface.co/joey00072/ohara-chat-d12
