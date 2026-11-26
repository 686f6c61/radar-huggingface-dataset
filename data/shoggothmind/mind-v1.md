# ShoggothMind/mind-v1

## Resumen

Mind-v1 es un modelo de lenguaje decoder-only de 35,8 millones de parámetros entrenado desde cero por ShoggothMind, un proyecto vinculado al protocolo autónomo "The Mind" sobre la blockchain de Solana. Se presenta como un modelo de razonamiento determinista y propósito específico, entrenado exclusivamente con problemas sintéticos de lógica, secuencias, aritmética simple y cálculo de calendario generados por dicho protocolo. No utiliza pesos preentrenados de ningún modelo base: la inicialización es aleatoria y el entrenamiento completo se realizó en aproximadamente 14,9 minutos sobre hardware convencional.

La arquitectura sigue el estilo LLaMA con activaciones SwiGLU, normalización RMSNorm y embeddings posicionales rotatorios (RoPE), con 6 bloques transformer, dimensión oculta de 512 y 8 cabezas de atención. Incorpora un tokenizador BPE a nivel de byte propio con vocabulario de 16.384 tokens. El modelo se distribuye en formato SafeTensors (float32, 143 MB) bajo licencia Apache 2.0.

Su relevancia no reside en competir con modelos frontera, sino en ofrecer un caso de estudio reproducible de entrenamiento desde cero, con pesos y pipeline completamente abiertos, orientado a inferencia local en CPU con latencia inferior a 100 ms y sin dependencias de API. Es útil como referencia para quienes investigan modelos pequeños, razonamiento algorítmico determinista o despliegues de coste cero en entornos con recursos muy limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (SwiGLU, RMSNorm, RoPE) |
| Parámetros totales | 35.756.544 (~35,8 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens configurados; entrenado con secuencias de 128 tokens |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | inglés (etiqueta `en`); el autor incluye `multilingual` pero no se detallan idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`, float32, 143 MB) |

## Arquitectura y entrenamiento

El modelo emplea un transformer decoder-only con 6 bloques, dimensión oculta de 512, proyección intermedia SwiGLU de 1.376 y 8 cabezas de atención de 64 dimensiones cada una. Usa RMSNorm con épsilon 10⁻⁵ y RoPE para posiciones. El tokenizador es un BPE a nivel de byte independiente, entrenado específicamente para este proyecto, con vocabulario de 16.384 tokens.

El entrenamiento partió de pesos inicializados aleatoriamente, sin modelo base preentrenado. El dataset es `ShoggothMind/mind-judgements` (split `synthetic_train`), con 3.000 ejemplos verificados de razonamiento repartidos en 8 tipos de tarea y 10 niveles de dificultad; la validación usó 500 ejemplos reservados. Se optimizó con AdamW (β₁=0,9, β₂=0,95, weight decay 0,01, learning rate 3×10⁻⁴) y scheduler de cosine annealing con 100 pasos de warmup. La pérdida inicial fue 9,7041, coherente con la línea base teórica de azar uniforme (−ln(1/16384) = 9,704); la pérdida final de entrenamiento fue 1,0608 y la de validación 1,2210. El entrenamiento completo duró unos 14,9 minutos. No se documenta RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto restringida a tareas de razonamiento algorítmico: lógica de relaciones, conteo de letras, cálculo de días de la semana, secuencias numéricas y aritmética simple.
- Formato de salida determinista: encapsula las respuestas en etiquetas `<answer>...</answer>` tal como se aprendió durante el entrenamiento.
- Inferencia determinista con decodificación greedy (`do_sample=False`), reproducible entre ejecuciones.
- Ejecución local en CPU sin dependencias de API ni claves externas.
- Soporte de integración vía API HTTP con el enjambre de consenso de The Mind en Solana (alternativa a ejecutar los pesos localmente).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingüe no demostrada: la model card etiqueta `multilingual` pero solo se documenta entrenamiento en inglés.

## Casos de uso

- Validación de pipelines de entrenamiento desde cero: el modelo sirve como referencia reproducible para verificar que una implementación de transformer, tokenizador y bucle de entrenamiento converge correctamente, comparando la pérdida inicial con la línea base teórica de azar uniforme.
- Clasificación de tareas lógicas simples en entornos embebidos: con 143 MB en RAM y 96 ms de latencia en CPU, puede integrarse en dispositivos sin GPU para resolver consultas acotadas de calendario o secuencias numéricas.
- Componente de enrutamiento determinista: su salida etiquetada de forma consistente permite usarlo como clasificador o extractor de respuestas estructuradas dentro de un sistema mayor que derive las consultas complejas a modelos de mayor capacidad.
- Docencia y divulgación técnica: el pipeline completo, tokenizador incluido, es material didáctico para explicar entrenamiento de transformers a escala reducida con métricas verificables.
- Pruebas de integración en CI/CD: al ser ligero y determinista, puede incorporarse como fixture en tests de pipelines de inferencia (formato de salida, tokenización, carga de pesos SafeTensors) sin coste de API.
- Investigación sobre razonamiento sintético: permite estudiar cómo un modelo de 35,8 M distribuye su rendimiento entre 8 tipos de tarea y 10 niveles de dificultad, y hasta dónde llega la capacidad de generalización con 3.000 ejemplos de entrenamiento.
- Despliegue en escenarios de conectividad nula: al no requerir claves ni red, es adecuado para entornos aislados donde solo se necesitan respuestas a problemas algorítmicos predefinidos.

## Benchmarks y rendimiento

Evaluación del autor contra seis modelos frontera sobre una porción reservada de `test.jsonl`, con precisión de coincidencia exacta (exact-match):

| Modelo | Parámetros | Exact-Match | Latencia media | Coste por 1M tokens | Huella de memoria | Pesos abiertos |
|---|---|---|---|---|---|---|
| Mind-v1 | 35,8 M | 6,0 % (salida directa) | 96,0 ms (CPU) | 0,00 $ | 143 MB | Sí |
| DeepSeek V3 | 671 B (37 B activos) | 20,0 % | 5.080 ms | 0,14 / 0,28 $ | Nube | No |
| Qwen 2.5 72B | 72 B | 60,0 % | 1.410 ms | 0,35 / 0,40 $ | Nube | Sí |
| Claude 3.5 Sonnet | Propietario | 0,0 %* | 350 ms | 3,00 / 15,00 $ | Nube | No |
| GPT-4o | Propietario | 80,0 % | 1.930 ms | 2,50 / 10,00 $ | Nube | No |
| Llama 3.3 70B | 70 B | 60,0 % | 2.300 ms | 0,30 / 0,40 $ | Nube | Sí |
| Mistral Large | Propietario | 0,0 %* | 480 ms | 2,00 / 6,00 $ | Nube | No |

\*El autor atribuye los resultados del 0 % a rechazos conversacionales o respuestas fuera de las etiquetas `<answer>` bajo la restricción de generación de un solo token, no a incapacidad del modelo.

Desglose por tarea de Mind-v1 y métricas del conjunto de test:

| Tarea / métrica | Resultado |
|---|---|
| Lógica y relaciones | 30,0 % |
| Conteo de letras | 10,0 % |
| Cálculo de día de la semana | 10,0 % |
| Secuencias numéricas | 5,0 % |
| Entropía cruzada en test | 1,8986 |
| Perplejidad en test | 6,68 |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; los pesos en float32 ocupan 143 MB y caben íntegramente en RAM de cualquier equipo actual.
- GPU recomendadas: no aplica; el autor reporta inferencia en una única CPU x86_64. Cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo, pero no aporta ventaja relevante.
- Cabe en cualquier GPU consumer, incluida la gama de entrada, y en CPU de un solo núcleo.
- Opciones de despliegue: `transformers` con PyTorch (documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la disponibilidad de GGUF no está confirmada.
- Latencia y throughput: ~96 ms por inferencia en CPU convencional, con generación de hasta 16 tokens nuevos en el ejemplo oficial.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a modelos de tamaño equivalente (por ejemplo, modelos de 30–50 M de parámetros orientados a razonamiento). La comparativa del autor se realiza contra modelos frontera de 70 B o superiores, que no son alternativas realistas para el mismo caso de uso. Los datos disponibles son los siguientes:

| Criterio | Mind-v1 | Modelos frontera comparados (GPT-4o, Qwen 2.5 72B, Llama 3.3 70B) |
|---|---|---|
| Parámetros | 35,8 M | 70 B o superior |
| Contexto | 2.048 tokens | no disponible en la información |
| Exact-match en test del autor | 6,0 % | 60–80 % |
| Licencia | Apache 2.0 | mixta (propietaria o pesos abiertos) |
| Despliegue | Local en CPU, coste cero | Nube, coste por token |
| Latencia | 96 ms | 350–5.080 ms |

## Limitaciones y advertencias

- Capacidad muy limitada: con 35,8 M de parámetros no puede realizar aritmética mental de varios pasos (multiplicación de varios dígitos, exponenciación modular) sin un scratchpad de cadena de pensamiento externo.
- Dominio restringido: entrenado solo con problemas sintéticos de matemáticas, secuencias, lógica y calendario; carece de conocimiento del mundo, literatura o trivia.
- Contexto efectivo corto: ventana configurada de 2.048 tokens pero entrenado con secuencias de 128, por lo que no es apto para resumir documentos ni conversaciones largas.
- Riesgo de alucinación fuera de su dominio: al no tener conocimiento general, cualquier consulta abierta producirá salidas sin fundamento.
- Idiomas: solo se documenta entrenamiento en inglés; la etiqueta `multilingual` no está respaldada por datos de evaluación.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento con datos sintéticos generados por un protocolo puede heredar los sesgos de dicho generador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad para producción en tareas fuera de su dominio sintético.
- Los resultados de benchmark del autor tienen un tamaño de muestra reducido y una metodología de un solo token que penaliza a modelos conversacionales; deben interpretarse con cautela y no como una comparación de capacidad general.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita su uso en herramientas de inferencia alternativas sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShoggothMind/mind-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ShoggothMind/mind-judgements
- Repositorio del proyecto (pipeline y tokenizador, referenciado en la model card): no disponible como URL directa en la información proporcionada
- Ejemplo de integración con The Mind en Solana: `examples/query_the_mind.py` dentro del repositorio del proyecto (URL no disponible)
- Curva de pérdida de entrenamiento: `loss.png` en el repositorio del modelo (URL no disponible)
