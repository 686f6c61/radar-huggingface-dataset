# Hedmm/qwen2.5-1.5b-instruct-banking77-lora

## Resumen

Este repositorio contiene un adaptador LoRA para Qwen/Qwen2.5-1.5B-Instruct, el modelo de lenguaje de 1.500 millones de parámetros de Alibaba Qwen, especializado en clasificación de intenciones sobre el conjunto de datos Banking77 de PolyAI. Lo desarrolla el usuario Hedmm como parte de un estudio comparativo controlado entre ajuste fino completo, LoRA y QLoRA sobre el mismo modelo base y los mismos datos, cuyo código y predicciones están publicados en GitHub.

El problema que resuelve es concreto: enrutar mensajes de clientes de banca a una de las 77 intenciones predefinidas del dataset (por ejemplo, tarjeta no recibida, cargo duplicado o límite de retirada). El adaptador transforma un modelo conversacional genérico, que sin ajuste acierta apenas el 36,3% con el mismo prompt, en un clasificador que alcanza el 92,1% de accuracy y 0,921 de macro-F1 sobre las 3.080 frases del split de test.

Es relevante por su valor metodológico más que por su escala: documenta de forma reproducible cómo LoRA con rango 16 supera en este caso tanto a QLoRA (91,5%) como al ajuste fino completo (85,1%), con tests de McNemar pareados, y publica todas las predicciones y los logs de entrenamiento. El adaptador ocupa 0,1 GB, entrena en 16,6 minutos sobre una H100 PCIe y se distribuye con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre proyecciones q, k, v, o, gate, up y down |
| Parámetros totales | 1.500 millones (modelo base) + 18,5 millones entrenables en el adaptador (1,2% del total) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; el base admite bf16 y cuantizaciones estándar de la familia Qwen2.5) |
| Idiomas soportados | inglés (entrenado y evaluado únicamente en inglés) |
| Licencia | Apache-2.0 (adaptador y modelo base); Banking77 es CC BY 4.0 de PolyAI |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Tamaño del repositorio | 0,1 GB |
| Librería | PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros en precisión bf16. El ajuste LoRA utiliza rango 16, alpha 32 y dropout 0,05, con adaptadores inyectados en las proyecciones de atención (q, k, v, o) y en las proyecciones del bloque MLP (gate, up, down), lo que suma 18,5 millones de parámetros entrenables, el 1,2% del modelo. La pérdida se calcula únicamente sobre los tokens de la respuesta, no sobre el prompt.

Los datos de entrenamiento son el split de train de Banking77, con 10.003 mensajes etiquetados en 77 intenciones. La optimización usa AdamW con learning rate 2e-4, warm-up del 3% seguido de decaimiento coseno, batch efectivo de 32 (8 × 4 de acumulación de gradiente) y 2 épocas con semilla 42. El entrenamiento completo consumió 16,6 minutos en una NVIDIA H100 PCIe con un pico de 10,6 GB de memoria GPU. El prompt de inferencia debe replicarse exactamente tal como se entrenó, con la lista de etiquetas en orden alfabético según `labels.json`, y el modelo responde con la etiqueta de intención en texto plano.

## Capacidades

- Clasificación de intenciones de soporte bancario en una de las 77 categorías de Banking77, devolviendo la etiqueta como texto plano.
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct, aunque el adaptador está optimizado para la tarea de clasificación.
- Respuesta con una etiqueta válida en el 99,9% de los mensajes, frente al 86,6% del modelo base con el mismo prompt.
- Inferencia determinista con decodificación greedy (`do_sample=False`) y `max_new_tokens=16`, suficiente porque la salida es una etiqueta corta.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking específico en este adaptador.
- Capacidad multilingüe: no disponible; el adaptador solo se ha entrenado y evaluado en inglés.

## Casos de uso

- Enrutamiento automático de tickets en un centro de soporte bancario: el adaptador clasifica cada mensaje entrante en una de las 77 intenciones y permite dirigirlo al equipo o al flujo de resolución adecuado, con un 92,1% de accuracy medido sobre el test oficial.
- Triaje previo a un agente conversacional: usar la etiqueta predicha como señal de entrada para seleccionar la herramienta, el artículo de ayuda o el formulario correcto antes de que intervenga un modelo mayor o un humano.
- Etiquetado asistido de nuevos corpus: aplicar el adaptador a mensajes sin etiquetar para preanotar intenciones y reducir el trabajo de revisión humana, aprovechando que el 99,9% de las salidas son etiquetas válidas.
- Monitorización y analítica de motivos de contacto: agregar las intenciones predichas sobre volúmenes históricos de conversaciones para cuantificar qué tipos de consulta dominan y cómo evolucionan en el tiempo.
- Base para adaptación a otros bancos: el estudio publicado en GitHub sirve como receta reproducible (LoRA frente a QLoRA frente a ajuste completo) para reentrenar sobre el conjunto de intenciones propio de otra entidad.
- Despliegue de bajo coste en infraestructura modesta: al ser un adaptador de 18,5 millones de parámetros sobre un base de 1,5B, puede servirse en una única GPU consumer o incluso en CPU con cuantización del modelo base, con latencias compatibles con clasificación por lotes.
- Evaluación comparativa de métodos de ajuste: útil como referencia en experimentos internos que comparen estrategias de PEFT, ya que incluye predicciones completas, métricas y logs de entrenamiento para reproducir la comparación.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Banking77 (3.080 mensajes). No están verificados de forma independiente (`verified: false`).

| Modelo | Accuracy (IC 95%) | Macro-F1 |
|---|---|---|
| Qwen2.5-1.5B-Instruct base, mismo prompt | 36,3% (34,6–38,1) | 0,339 |
| Este adaptador (LoRA) | 92,1% (91,1–93,1) | 0,921 |
| QLoRA, mismas condiciones | 91,5% | no disponible |
| Ajuste fino completo, mismas condiciones | 85,1% | no disponible |

El autor indica que las comparaciones entre métodos se acompañan de tests de McNemar pareados. Además, el adaptador emite una etiqueta válida en el 99,9% de los mensajes, frente al 86,6% del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade un coste despreciable (18,5 millones de parámetros); el modelo base de 1,5B en bf16 requiere aproximadamente 3 GB de pesos, más overhead de activaciones y caché KV.
- Entrenamiento documentado: 10,6 GB de pico de memoria GPU en una NVIDIA H100 PCIe, con 16,6 minutos para 2 épocas sobre 10.003 ejemplos.
- GPU recomendadas: H100 o A100 para entrenamiento; para inferencia basta una GPU consumer con al menos 4-6 GB de VRAM en bf16/fp16, como una RTX 3060 de 12 GB o superior.
- Cabe en GPU consumer: sí, con el modelo base en bf16 o cuantizado; en CPU es viable con cuantización GGUF del base, aunque el adaptador se publica en safetensors para PEFT.
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Banking77 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-1.5B + LoRA) | 1,5B + 18,5M | no disponible | 92,1% | Apache-2.0 | HuggingFace (11 descargas, 0 likes) |
| Qwen2.5-1.5B-Instruct base (mismo prompt) | 1,5B | no disponible | 36,3% | Apache-2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct con QLoRA (mismo estudio) | 1,5B + adaptador | no disponible | 91,5% | Apache-2.0 | Resultados en GitHub, adaptador no publicado como modelo |
| Qwen2.5-1.5B-Instruct con ajuste fino completo (mismo estudio) | 1,5B | no disponible | 85,1% | Apache-2.0 | Resultados en GitHub, pesos no publicados |

No se dispone de datos de otros clasificadores específicos de Banking77 en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para las 77 intenciones de Banking77 y mensajes en inglés; para otro conjunto de intenciones o para otro idioma es necesario reentrenar con datos etiquetados propios.
- La accuracy se mide solo sobre el split de test de Banking77; en tráfico real pueden aparecer mensajes que no encajan en ninguna intención y el modelo elegirá igualmente una de las 77, sin mecanismo de abstención documentado.
- Riesgo de alucinación de etiqueta: aunque el 99,9% de las salidas son etiquetas válidas, nada garantiza que la etiqueta elegida sea la correcta en dominios distintos al de entrenamiento.
- El prompt debe replicarse exactamente, incluida la lista de etiquetas en el orden de `labels.json`; desviarse del formato de entrenamiento puede degradar el rendimiento.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos como referencia en producción.
- Licencia: el adaptador es Apache-2.0, pero el dataset Banking77 es CC BY 4.0 (PolyAI) y exige atribución si se redistribuye o se usa para entrenar.
- El repositorio tiene un volumen muy bajo de descargas (11) y ninguna interacción social, por lo que no hay validación comunitaria independiente más allá del estudio del autor.
- No se documentan sesgos específicos del adaptador; al heredar el modelo base, puede arrastrar los sesgos de Qwen2.5-1.5B-Instruct en lenguaje y dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hedmm/qwen2.5-1.5b-instruct-banking77-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Estudio comparativo (código, predicciones y logs): https://github.com/Hedmm/ml-case-studies/tree/main/lora-vs-qlora-vs-full-finetuning
