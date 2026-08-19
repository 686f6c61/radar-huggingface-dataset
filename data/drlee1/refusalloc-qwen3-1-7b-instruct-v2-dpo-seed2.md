# drlee1/RefusalLoc-Qwen3-1.7B-Instruct-v2-DPO-seed2

## Resumen

RefusalLoc-Qwen3-1.7B-Instruct-v2-DPO-seed2 es un checkpoint de investigación desarrollado por drlee1 dentro del proyecto RefusalLoc, cuyo objetivo es estudiar el comportamiento de rechazo (refusal) en modelos de lenguaje. Se inicializa desde Qwen3-1.7B-Instruct y se entrena con una combinación de ajuste supervisado (SFT) y optimización por preferencias directas (DPO) para equilibrar la seguridad frente a la utilidad. El modelo está pensado exclusivamente para investigación en alineación, interpretabilidad mecanicista y evaluación de políticas de seguridad, no para despliegue en producción.

Con 1.720.574.976 parámetros (1,72B), es un modelo denso de tamaño pequeño que permite experimentación en hardware moderado. La ventana de contexto no se especifica en la documentación disponible, aunque al derivar de Qwen3-1.7B-Instruct es probable que herede la configuración de dicha arquitectura. Su relevancia radica en que aborda un problema crítico en sistemas de IA: el equilibrio entre rechazar solicitudes dañinas y no rechazar solicitudes benignas, un área con escasos recursos abiertos y métricas cuantificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-1.7B-Instruct) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Other (uso exclusivo para investigacion; datos de entrenamiento bajo CC-BY-NC-4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B-Instruct, un transformer denso de 1,7B parámetros. No se proporcionan detalles internos adicionales (número de capas, dimensiones de atención, etc.) en la documentación del checkpoint. El entrenamiento se realizó en dos fases: primero un ajuste supervisado (SFT) con 40.000 ejemplos, distribuidos en 24.000 de utilidad general, 8.000 de rechazo a solicitudes dañinas y 8.000 de ayuda benigna; posteriormente una optimización por preferencias directas (DPO) con 3.997 pares válidos que cubren preferencias de seguridad, cumplimiento benigno y utilidad general. Se empleó LoRA con rango 32 y alpha 64, con 2.500 pasos de SFT y 500 pasos de DPO, utilizando la semilla 2. El modelo base y de referencia es el checkpoint SFT fusionado correspondiente a la misma semilla.

## Capacidades

- Generacion de texto y conversacion en ingles, con instrucciones de formato de chat propias de Qwen3.
- Rechazo de solicitudes dañinas: el modelo está entrenado para negarse a responder peticiones perjudiciales, con una tasa de rechazo del 89,0% en el conjunto de evaluación.
- Cumplimiento benigno: responde adecuadamente a solicitudes inofensivas, aunque con una tasa de falso rechazo del 49,3% (rechaza casi la mitad de las peticiones benignas).
- Capacidades generales de razonamiento y matemáticas: obtiene 56,8 en GSM8K y 50,0 en MMLU, aunque con una muestra reducida de evaluación.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: el modelo permite estudiar cómo se representan internamente los mecanismos de rechazo, mediante análisis de activaciones o ablaciones de direcciones, como se describe en el repositorio del proyecto.
- Evaluacion de politicas de seguridad: sirve como banco de pruebas para medir el equilibrio entre seguridad y utilidad en modelos pequeños, comparando métricas de rechazo dañino y falso rechazo benigno.
- Estudio de trade-offs en alineacion: al ser un checkpoint de investigación, es útil para analizar cómo el entrenamiento con DPO afecta a la tasa de cumplimiento dañino (3,5%) frente a la pérdida de utilidad benigna.
- Reproduccion de experimentos de alineacion: el repositorio proporciona código y materiales para reproducir el entrenamiento y las evaluaciones, lo que facilita la verificación de resultados.
- Desarrollo de tecnicas de mitigacion de falsos rechazos: dado su alto índice de falso rechazo benigno (49,3%), es un caso de estudio para mejorar la discriminación entre solicitudes dañinas y benignas.
- Comparacion de metodos de ajuste: permite contrastar el rendimiento de SFT+DPO frente a otras estrategias de alineación en un modelo de tamaño reducido.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas, obtenidas con decodificación greedy, sin modo thinking y un máximo de 512 tokens nuevos:

| Metrica | Valor |
|---|---|
| Rechazo dañino (Harmful refusal) | 89,0 |
| Cumplimiento dañino (Harmful compliance) | 3,5 |
| Falso rechazo benigno (Benign false refusal) | 49,3 |
| Completado útil benigno (Benign helpful completion) | 55,6 |
| IFEval | 48,4 |
| GSM8K | 56,8 |
| MMLU | 50,0 |

El cumplimiento dañino se evaluó con el clasificador `cais/HarmBench-Llama-2-13b-cls` en la revisión `bda705349d1144fa618770bea64d99ce54e3835b`. Los conjuntos de evaluación incluyen AdvBench (520), HarmBench (400), StrongREJECT (313), JBB (100) para prompts de seguridad, y XSTest (450) y OR-Bench (400) para prompts benignos. Las capacidades se midieron con IFEval (541), GSM8K (250) y MMLU (114). No se proporcionan comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- VRAM estimada: con 1,72B parámetros en precisión FP16, el modelo ocupa aproximadamente 3,4 GB de memoria, más overhead de inferencia. En cuantización de 8 bits podría reducirse a ~1,8 GB, aunque no se ofrecen pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para mayor velocidad, se recomienda una RTX 3090 o superior.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: al ser un modelo de transformers, puede ejecutarse con la librería `transformers` de Hugging Face, así como con servidores de inferencia compatibles como vLLM o TGI, aunque no se ha verificado su compatibilidad explícita.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token para un modelo de este tamaño.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El modelo se deriva de Qwen3-1.7B-Instruct, por lo que una comparación natural sería contra ese modelo base, pero no se reportan métricas del base en la documentación. Tampoco se conocen otros checkpoints de RefusalLoc con los que comparar directamente, aunque el proyecto menciona una familia de tres semillas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Uso exclusivo para investigacion: la model card indica explícitamente que no debe usarse en entornos de producción, de alto riesgo o como sistema de seguridad real.
- Alto falso rechazo benigno: el 49,3% de las solicitudes inofensivas son rechazadas, lo que lo hace inadecuado para aplicaciones de atención al cliente o asistentes generales.
- Perdida de capacidades: las puntuaciones en IFEval, GSM8K y MMLU son inferiores a las esperadas para un modelo de su tamaño, debido al entrenamiento orientado a seguridad.
- Riesgo de alucinacion: no se han evaluado específicamente, pero al ser un modelo de lenguaje, existe el riesgo inherente de generar información falsa.
- Licencia restrictiva: la licencia "other" y la mención a CC-BY-NC-4.0 para los datos de entrenamiento impiden el uso comercial sin revisar las obligaciones de las fuentes originales.
- Idioma limitado: solo soporta inglés, lo que restringe su aplicabilidad en entornos multilingües.
- Sesgos potenciales: no se han documentado análisis de sesgos, pero al derivar de Qwen3, puede heredar sesgos del modelo base.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/drlee1/RefusalLoc-Qwen3-1.7B-Instruct-v2-DPO-seed2
- Codigo fuente y materiales de reproducibilidad: https://github.com/DONGRYEOLLEE1/refusal-loc
