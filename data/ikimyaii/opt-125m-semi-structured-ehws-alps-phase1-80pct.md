# ikimyaii/OPT-125M-semi-structured-EHWS-ALPS-phase1-80pct

## Resumen
OPT-125M-semi-structured-EHWS-ALPS-phase1-80pct es un checkpoint de investigación publicado por el usuario ikimyaii a partir de facebook/opt-125m. Se trata de un transformer decoder-only de 125.239.296 parámetros, 12 capas y 2.048 tokens de contexto, podado hasta un 80% de dispersidad semi-estructurada por filas mediante el método EHWS de ADMM en dos fases, con una primera fase local de estilo ALPS. El modelo no se entrena desde cero: se parte de los pesos densos de OPT-125M y se aplica poda con calibración sobre C4, seguida de un ajuste global con pérdida combinada de entropía cruzada y destilación de conocimiento.

La relevancia del checkpoint es metodológica: consigue un 79,97% de dispersidad en las 72 capas lineales podadas manteniendo el mismo número de pesos no nulos en cada fila, sin un patrón N:M fijo. Con ello mejora a la implementación oficial de ELSA en el mismo régimen de dispersidad semi-estructurada, aunque queda lejos del modelo denso en perplejidad. Los pesos se almacenan en float32 y de forma densa, con ceros explícitos, por lo que no hay ahorro de memoria ni aceleración sin kernels conscientes de la dispersidad.

Es, por tanto, un artefacto para estudiar poda, máscaras por filas y reproducibilidad de pipelines ADMM, no un modelo desplegable en producción. Solo soporta inglés, no está ajustado a instrucciones ni a seguridad, y hereda los sesgos y limitaciones de OPT-125M.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT), 12 capas, 768 de dimensión, 12 cabezas de atención |
| Parámetros totales | 125.239.296 (almacenados densamente con ceros explícitos) |
| Parámetros activos | No aplica (no es MoE). En las 72 capas lineales podadas, el 20,03% de los pesos son no nulos; embeddings y LayerNorms permanecen densos |
| Longitud de contexto | 2.048 tokens (heredado de OPT-125M; no se indica otro valor en la model card) |
| Tipos de cuantización | No se proporcionan. Pesos en float32; no hay versiones GGUF, GPTQ, AWQ ni int8 documentadas |
| Idiomas soportados | Inglés (en) |
| Licencia | other; sujeta a la licencia de OPT-125M. No se detallan restricciones comerciales en la model card |
| Formato de pesos | safetensors, float32, almacenados densamente con ceros explícitos |
| Modelo base | facebook/opt-125m |
| Dispersidad | 79,97% en 72 capas lineales (q/k/v/out, fc1 y fc2 de las 12 capas del decoder); semi-estructurada por filas, sin patrón N:M fijo |
| Tamaño del repositorio | 0,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
La arquitectura es la de OPT-125M: un transformer decoder-only con 12 capas, 768 de dimensión oculta, 12 cabezas de atención, embeddings de token y posición aprendidos, y normalización de capas. El checkpoint no modifica la topología: mantiene las 12 capas y las mismas formas de tensor, pero introduce una máscara de dispersidad semi-estructurada por filas en las 72 capas lineales podadas. Cada fila conserva exactamente el 20% de sus pesos, mientras que la posición de los pesos supervivientes dentro de la fila es libre; no se impone un patrón N:M. Los embeddings de token, el `lm_head` atado y los embeddings de posición permanecen densos.

El entrenamiento de poda sigue EHWS en dos fases. La fase 1, local y de estilo ALPS, poda cada capa directamente al 80% minimizando el error de reconstrucción `||(W - W0) X||^2`; usa un paso x en forma cerrada y una penalización rho que crece de 0,01 a 10 veces la media de `diag H` durante 50 rondas, y después reajusta los pesos conservados por mínimos cuadrados exactos. Las matrices Hessianas se calculan con 256 secuencias de C4. La fase 2, global, parte de los pesos podados de la fase 1 y ejecuta ADMM sobre la pérdida completa del modelo, `0,5 * CE + 0,5 * KD`, con destilación contra el modelo denso congelado y un paso Z basado en `Diag(H)`. El calendario es de 128 rondas × 32 pasos, learning rate 4e-4 con decaimiento lineal, lambda 3e-3 constante, Adam con beta2 0,999, lote de 8 y semilla 0, todo en float32. Se usan las mismas 32.768 secuencias de entrenamiento de C4 de 2.048 tokens que el código oficial de ELSA, cada una vista una vez. Las LayerNorms y los embeddings atados se entrenan también, sin penalización. `diag(H)` se vuelve a medir con las pasadas forward de entrenamiento antes de cada paso Z.

## Capacidades
- Generación de texto autoregresiva en inglés mediante predicción del siguiente token.
- Razonamiento básico y resolución de tareas simples de lenguaje, muy limitados por el tamaño y por la poda; no es un modelo ajustado a instrucciones.
- No dispone de soporte nativo de tool calling ni function calling.
- No incorpora capacidades específicas de agentes, planificación multi-paso ni uso de herramientas.
- No es multilingüe: la model card solo declara inglés.
- No tiene visión, audio ni modo de razonamiento explícito o thinking mode.
- Puede usarse con prompting few-shot, pero la calidad está degradada respecto al modelo denso.
- Sirve como checkpoint de investigación para estudiar dispersidad semi-estructurada, máscaras por filas y reproducibilidad de pipelines ADMM.

## Casos de uso
- Reproducción del pipeline EHWS: el checkpoint y el comando documentado en `semi-structured/README.md` permiten replicar la poda, el ajuste y la evaluación de perplejidad en WikiText-2 y C4.
- Estudio de máscaras semi-estructuradas por filas: útil para analizar la distribución de pesos no nulos dentro de cada fila y compararla con patrones N:M o con poda no estructurada.
- Benchmark de kernels dispersos: al almacenarse denso con ceros explícitos, sirve para validar kernels que exploten el 80% de dispersidad; sin kernel específico no hay aceleración.
- Ablaciones de calibración y sensibilidad: la model card documenta barridos de lambda y learning rate, por lo que el checkpoint es adecuado para estudiar cómo afectan estos hiperparámetros a la perplejidad.
- Docencia en compresión de modelos: ejemplo completo de poda con ADMM, reconstrucción local, ajuste global y destilación de conocimiento sobre un modelo pequeño.
- Pruebas de integración de pipelines de generación de texto: modelo pequeño en inglés para verificar carga con transformers, tokenización y endpoints compatibles con TGI, sin expectativas de calidad.
- Comparación con ELSA: baseline directo frente a la implementación oficial semi-estructurada de ELSA en OPT-125M, con las mismas condiciones de evaluación.
- Estudio de sesgos heredados: permite analizar cómo se propagan los sesgos de OPT-125M y de C4 tras una poda agresiva del 80%.

## Benchmarks y rendimiento
| Modelo | Tipo de dispersidad | WikiText-2 (PPL) | C4 (PPL) |
|---|---|---|---|
| OPT-125M denso | Densa | 27,61 | 26,52 |
| ELSA paper | No estructurada | 65,30* | 47,74* |
| Este modelo | Semi-estructurada por filas | 66,65 | 49,45 |
| ELSA official code | Semi-estructurada por filas | 75,86 | 53,45 |

\* Cifra del paper de ELSA bajo su propia evaluación; la fila densa de ese trabajo difiere en torno a un 0,15% de la del código oficial de ELSA.

La evaluación de perplejidad sigue el protocolo del código oficial de ELSA, con sus conjuntos de test de WikiText-2 y C4 en fp16. Todas las filas son ejecuciones únicas al 80% de dispersidad. No se midió precisión zero-shot para este checkpoint. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 0,5 GB solo para los pesos en float32 (125,24 M × 4 bytes). Con activaciones y lotes pequeños, el consumo real estimado es de 1-2 GB; no se han publicado medidas oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM, como GTX 1650, RTX 3050 o RTX 4090. También es viable en CPU. A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna; también en equipos con memoria compartida suficiente.
- Opciones de despliegue: transformers, con el ejemplo de carga del autor; TGI, por el tag `text-generation-inference` y `endpoints_compatible`. No se proporcionan pesos GGUF para llama.cpp u Ollama, ni kernels dispersos específicos.
- Latencia y throughput: no disponibles. Al almacenarse los pesos de forma densa y no usar kernels conscientes de la dispersidad, el rendimiento esperado es similar al de OPT-125M denso en float32, sin aceleración por el 80% de ceros.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Dispersidad | WikiText-2 (PPL) | C4 (PPL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| facebook/opt-125m | 125 M | 2.048 | Densa | 27,61 | 26,52 | Licencia OPT-125M | HuggingFace |
| ELSA official code, OPT-125M | 125 M | 2.048 | 80% semi-estructurada por filas | 75,86 | 53,45 | No disponible
