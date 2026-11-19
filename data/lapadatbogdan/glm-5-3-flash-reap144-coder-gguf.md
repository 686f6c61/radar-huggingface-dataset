# lapadatbogdan/GLM-5.3-Flash-REAP144-Coder-GGUF

## Resumen

GLM-5.3-Flash-REAP144-Coder-GGUF es una cuantización GGUF de un modelo derivado de zai-org/GLM-5.3-Flash, un transformer de tipo Mixture-of-Experts (MoE) de 321B parámetros totales con 18B activos. El autor, lapadatbogdan, aplica una técnica de poda de expertos (expert pruning, REAP/RCO) para reducir el número de expertos por capa de 288 a 152, obteniendo un modelo de aproximadamente 170B parámetros totales con ~17B activos, pensado para ejecutarse en un PC doméstico con GPU de consumo y RAM del sistema. El modelo está especializado en código y uso agéntico.

La versión publicada actualmente en el repositorio es la RCO-152E (152 expertos de 288 por capa), que sustituye a la anterior REAP144 (144 expertos, calibrada solo con sesiones agénticas en Python). La nueva calibración combina sesiones agénticas, código en 21 lenguajes, matemáticas y un 15% de texto general, y va seguida de un proceso de "healing" o reparación de pesos. Además, los ficheros Q3_K_M, Q4_K_M e IQ2 se han republicado con un fine-tune anti-bucle (LoRA entrenado con GRPO y destilación del modelo completo) fusionado en los pesos.

El interés del modelo radica en que permite ejecutar localmente un MoE de gran tamaño con contexto agéntico y capacidades de código, a costa de una pérdida de calidad controlada (KLD de 0,024 a 0,121 frente al Q8_0 según la cuantización). La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con expertos enrutados y experto compartido; poda de expertos REAP/RCO |
| Parámetros totales | 169.556.223.214 (~170B) en la versión podada; el modelo base GLM-5.3-Flash tiene 321B |
| Parámetros activos | ~17B (el base es 321B-A18B; la poda lo reduce a ~170B-A17B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q4_K_M, Q3_K_M, IQ2_XXS, IQ2_XXS-downIQ2_S |
| Idiomas soportados | no disponible (la calibración cubre código en 21 lenguajes) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), en ficheros partidos de 1 a 4 partes |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE de 321B parámetros totales y 18B activos, con 288 expertos por capa. La variante de este repositorio aplica una poda de expertos: se seleccionan 152 de los 288 expertos por capa mediante optimización (RCO), incluyendo 8 expertos generalistas, y después se realiza un "healing" de los pesos. El resultado es un modelo de ~170B parámetros totales y ~17B activos, lo que reduce los requisitos de memoria manteniendo una fracción de la capacidad del modelo original.

La calibración de la selección de expertos se hizo sobre una mezcla de sesiones agénticas, código en 21 lenguajes, matemáticas y un 15% de texto general. Posteriormente, para los ficheros Q3_K_M, Q4_K_M e IQ2, se entrenó un pequeño LoRA con RL de recompensa verificable (GRPO) y destilación del modelo completo sobre tareas de código multilingüe, que se fusionó en los pesos para eliminar los bucles de razonamiento típicos de las cuantizaciones bajas. Los expertos enrutados de los ficheros de 2 bits usan IQ2_XXS mejorado con cuantización vectorial GSQ, mientras que atención, experto compartido y capas densas conservan tipos Q4_K, Q6_K y Q8_0.

## Capacidades

- Generación de texto y razonamiento general, con especial énfasis en código.
- Generación de código en 21 lenguajes de programación (según la calibración del autor).
- Razonamiento matemático y aritmética básica (el autor reporta que pasa pruebas de 17x23, 1234x5678 y Fibonacci en todas las cuantizaciones, con un fallo puntual en Q3_K_M).
- Soporte de tool calling / function calling (citado en las pruebas del autor).
- Uso agéntico y sesiones multi-paso (la calibración incluye sesiones agénticas).
- Capacidad conversacional multi-turno.
- Modo de razonamiento con cadenas de pensamiento (el autor menciona "reasoning loops" y un fine-tune anti-bucle, lo que implica razonamiento extendido).
- Capacidades multilingües: no disponibles como dato explícito; la calibración cubre 21 lenguajes de programación.

## Casos de uso

- Asistente de código en local: el modelo puede generar y completar código en múltiples lenguajes ejecutándose en un PC con 24 GB de VRAM y 64-96 GB de RAM, útil para desarrolladores que quieren privacidad sin depender de APIs.
- Agente de programación autónomo: gracias a su soporte de tool calling y a la calibración en sesiones agénticas, puede encadenar pasos de edición, ejecución de tests y corrección en pipelines de CI/CD locales.
- Automatización de tareas de refactorización: con contexto de código y capacidad multi-paso, puede analizar un repositorio y proponer cambios, ejecutándose con llama.cpp en una estación de trabajo.
- Atención al cliente técnica: el modelo puede gestionar conversaciones multi-turno sobre documentación y errores de código, con la ventaja de desplegarse on-premise por su licencia MIT.
- Evaluación y generación de tests: puede producir casos de prueba y verificar aritmética y lógica básica, como demuestran las pruebas del autor con tareas de código ejecutado.
- Prototipado rápido en entornos con GPU de consumo: las cuantizaciones IQ2_XXS (47,4 GB) permiten probar un MoE de ~170B en una RTX 4090 de 24 GB más 32 GB de RAM del sistema.
- Investigación sobre poda de expertos: el repositorio y el harness de evaluación del autor sirven como referencia para estudiar el impacto de REAP/RCO en modelos MoE grandes.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son métricas internas de calidad de cuantización y de las pruebas anti-bucle:

| Métrica | Q8_0 | Q4_K_M | Q3_K_M | IQ2_XXS-downIQ2_S | IQ2_XXS |
|---|---|---|---|---|---|
| Tamaño | 180,4 GB | 102,6 GB | 75,1 GB | 50,8 GB | 47,4 GB |
| KLD frente a Q8_0 | 0 | 0,024 | 0,045 | 0,115 | 0,121 |
| Mismo token top que Q8 | 100% | 94,5% | 92,5% | 88,3% | 88,1% |

Pruebas anti-bucle (Q3_K_M, antes/después del fine-tune): tareas de código retenidas con bucles 11/80 → 0/80; tareas resueltas 46/80 → 51/80; test "hmm" de Aider con bucle 4/14 → 0/14 (14/14 resueltas). En la comparativa REAP144 vs RCO-152E: problemas en 30 ejecuciones difíciles de seguimiento de instrucciones 22 → 4 (0 bucles de repetición).

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Q8_0: 180,4 GB en 4 partes; requiere 24 GB de VRAM + 192 GB de RAM o multi-GPU.
- Q4_K_M: 102,6 GB en 3 partes; encaja en 24 GB VRAM + 96 GB RAM, 32 GB VRAM + 96 GB RAM o 128 GB de memoria unificada.
- Q3_K_M: 75,1 GB en 2 partes; encaja en 24 GB VRAM + 64 GB RAM o 32 GB VRAM + 64 GB RAM.
- IQ2_XXS: 47,4 GB en un fichero; encaja en 24 GB VRAM + 32 GB RAM.
- IQ2_XXS-downIQ2_S: 50,8 GB en 2 partes; encaja en 24 GB VRAM + 32 GB RAM.
- GPU recomendadas: el autor menciona configuraciones de 24 GB (RTX 4090, RTX 3090) y 32 GB; para Q8_0 se requiere multi-GPU o 192 GB de RAM.
- Cabe en GPU de consumo: sí, en las cuantizaciones de 2 y 3 bits con 24 GB de VRAM más RAM del sistema; Q4_K_M requiere 96 GB de RAM.
- Opciones de despliegue: llama.cpp (formato GGUF nativo); el autor menciona `llama-perplexity` para KLD y `--logit-bias` como mitigación previa al fine-tune.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP144-Coder (este) | ~170B | ~17B | no disponible | MIT | GGUF |
| zai-org/GLM-5.3-Flash (base) | 321B | 18B | no disponible | no disponible | no disponible |
| REAP144 (versión anterior, retirada) | ~160B (144 expertos) | no disponible | no disponible | MIT | GGUF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La poda de expertos degrada la calidad respecto al modelo base GLM-5.3-Flash; el autor reporta que la versión anterior REAP144 fallaba en preguntas generales, otros lenguajes y aritmética simple.
- Las cuantizaciones bajas presentan bucles de razonamiento; los ficheros Q3_K_M, Q4_K_M e IQ2 incluyen un fine-tune anti-bucle, pero Q8_0 no lo necesita según el autor.
- Los ficheros subidos el 22 de octubre de 2026 estaban truncados (segunda mitad de tensores a cero) y producían salida basura; deben verificarse los SHA256 publicados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo.
- Idiomas soportados no documentados explícitamente; la calibración se centra en código, no en texto multilingüe general.
- Licencia MIT, sin restricciones conocidas para uso comercial, pero el modelo base puede tener condiciones adicionales no especificadas en la información disponible.
- El repositorio ocupa 1264,2 GB, lo que implica descargas muy grandes y requisitos de almacenamiento considerables.
- Uso agéntico en producción requiere validación propia; las métricas del autor son internas y de tamaño reducido (40 tareas retenidas, 30 ejecuciones).

## Enlaces

- Hugging Face: https://huggingface.co/lapadatbogdan/GLM-5.3-Flash-REAP144-Coder-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio con receta, máscara, parches y harness: https://github.com/lapadatbogdan/GLM-5.3-Flash-Coder-RCO-152E
