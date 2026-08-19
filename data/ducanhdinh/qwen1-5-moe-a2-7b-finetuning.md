# ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning

## Resumen

El modelo `ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning` es un adaptador LoRA (PEFT) desarrollado por ducanhdinh sobre el modelo base `Qwen/Qwen1.5-MoE-A2.7B`, un modelo de Mixture of Experts (MoE) de la familia Qwen1.5. El adaptador se ha ajustado específicamente para tareas de traducción automática (machine translation) utilizando tres conjuntos de datos de alineación: flores, bible y ntrex. El modelo base, upcycled desde Qwen-1.8B, cuenta con 14.3 mil millones de parámetros totales y 2.7 mil millones activos durante la inferencia, lo que permite un rendimiento comparable a Qwen1.5-7B con solo el 25% de los recursos de entrenamiento.

El adaptador LoRA se aplica a las capas 8 a 15 (de un total de 24), afectando a los módulos de atención, router y expertos dentro de ese rango. Con una configuración de r=16, alpha=32 y dropout=0.05, el adaptador es ligero (0.2 GB) y se distribuye bajo licencia Apache 2.0. La relevancia de este modelo radica en ofrecer una adaptación eficiente y de bajo coste para traducción automática sobre una arquitectura MoE ya optimizada, manteniendo la flexibilidad de un adaptador PEFT que puede integrarse fácilmente en pipelines de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture of Experts (MoE), upcycled desde Qwen-1.8B; adaptador LoRA sobre attention, router y experts en capas 8-15 |
| Parametros totales | Modelo base: 14.3B; adaptador LoRA: no especificado (tamano del repo 0.2 GB) |
| Parametros activos | 2.7B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se detallan los idiomas del adaptador) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base `Qwen1.5-MoE-A2.7B` es un transformer decoder-only con arquitectura MoE, donde se emplea SwiGLU como activación, RoPE (Rotary Positional Embedding) y multi-head attention. Fue upcycled a partir del modelo denso Qwen-1.8B, alcanzando 14.3B parámetros totales con solo 2.7B activos por token gracias a la selección de expertos (top_k=4 de 60 expertos). Esta arquitectura permite un rendimiento comparable a un modelo denso de 7B con un coste de inferencia reducido.

El adaptador LoRA se entrenó sobre las capas 8 a 15 (un tercio del modelo), inyectando matrices de bajo rango en los módulos de atención, router y expertos. La configuración es r=16, alpha=32, dropout=0.05. La función de pérdida combina la cross-entropy estándar sobre el siguiente token (L_LM) con una pérdida de balanceo de carga (L_LB) típica de MoE estilo Switch/Mixtral, aunque el coeficiente `lb_loss_coef` no se especifica (posiblemente None, lo que implicaría que no se aplica o se usa un valor por defecto). Los datos de entrenamiento consisten en oraciones individuales extraídas de tres datasets de alineación multilingüe (flores, bible, ntrex), donde cada campo de idioma en un registro se trata como una muestra independiente. Los datos se barajan y se ordenan por longitud de token antes de agruparlos en lotes.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen1.5-MoE-A2.7B, que incluyen generación de texto, razonamiento y comprensión del lenguaje.
- Traducción automática: el adaptador está específicamente ajustado para traducción, utilizando datos de alineación multilingüe de los conjuntos flores, bible y ntrex.
- Soporte de tool calling y agentes: no se menciona explícitamente, pero el modelo base Qwen1.5 tiene soporte para function calling en su versión chat; no obstante, este adaptador no indica dicha capacidad.
- Multilingüismo: el modelo base es multilingüe, pero el adaptador no especifica qué idiomas cubre; se asume que los idiomas presentes en los datasets de entrenamiento (flores, bible, ntrex) son los soportados.
- Eficiencia computacional: al ser un MoE con 2.7B parámetros activos, la inferencia es más rápida y consume menos memoria que un modelo denso de tamaño equivalente.

## Casos de uso

- Traducción automática multilingüe: el adaptador puede utilizarse para traducir textos entre los idiomas presentes en los datasets de entrenamiento (flores, bible, ntrex). Su bajo coste de inferencia lo hace adecuado para servicios de traducción en tiempo real o procesamiento por lotes.
- Fine-tuning adicional sobre dominios específicos: al ser un adaptador LoRA, puede servir como punto de partida para ajustes posteriores en dominios concretos (legal, médico, técnico) sin necesidad de reentrenar todo el modelo base.
- Evaluación de arquitecturas MoE en tareas de traducción: investigadores pueden usar este adaptador para comparar el rendimiento de Qwen1.5-MoE-A2.7B frente a otros modelos de traducción, aprovechando la eficiencia del MoE.
- Integración en pipelines de NLP multilingüe: el adaptador puede combinarse con otros componentes (detección de idioma, normalización de texto) para construir sistemas de procesamiento de lenguaje natural multilingües.
- Prototipado rápido de sistemas de traducción: gracias a su pequeño tamaño (0.2 GB) y compatibilidad con PEFT, se puede cargar en entornos con recursos limitados para pruebas y demostraciones.
- Aprendizaje de representaciones multilingües: el adaptador puede usarse para extraer representaciones de texto multilingüe, útiles para tareas como búsqueda semántica o clasificación de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye métricas de evaluación (BLEU, chrF, etc.) ni comparaciones con otros modelos. El modelo base Qwen1.5-MoE-A2.7B reporta un rendimiento comparable a Qwen1.5-7B, pero sin cifras concretas en esta ficha. Se recomienda consultar la documentación oficial de Qwen para datos de evaluación del modelo base.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 14.3B parámetros, pero solo 2.7B activos. En FP16, la memoria necesaria para los pesos del modelo base es aproximadamente 28.6 GB (14.3B * 2 bytes). Sin embargo, al ser MoE, la memoria de activación es menor. Con cuantización (por ejemplo, 8 bits o 4 bits), podría reducirse a ~14 GB o ~7 GB respectivamente. El adaptador LoRA añade una cantidad insignificante de memoria.
- GPU recomendadas: para FP16 se necesitaría una GPU con al menos 32 GB (A100, RTX A6000). Con cuantización 8 bits, una RTX 3090/4090 (24 GB) sería suficiente. Para 4 bits, GPUs con 12-16 GB (RTX 3080, RTX 4070) podrían ser viables.
- Compatibilidad con consumer GPU: sí, siempre que se use cuantización (GGUF o bitsandbytes). Sin cuantización, es difícil en GPUs de consumo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con PEFT (transformers + peft). El adaptador se carga sobre el modelo base.
- Latencia y throughput: no disponibles. Se espera que sea inferior a un modelo denso de 7B gracias al MoE, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen1.5-MoE-A2.7B (base) | 14.3B | 2.7B | no disponible | Apache 2.0 | Modelo base sin fine-tuning, multilingüe |
| Qwen1.5-7B (denso) | 7B | 7B | no disponible | Apache 2.0 | Modelo denso comparable en rendimiento, mayor coste de inferencia |
| ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning | 14.3B + LoRA | 2.7B + LoRA | no disponible | Apache 2.0 | Adaptador LoRA para traducción, sobre el modelo base |

No se dispone de comparaciones con otros adaptadores de traducción (p. ej., NLLB-200, M2M100) porque no hay datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Sesgos del dataset: los datos de entrenamiento provienen de flores, bible y ntrex, que son corpora de traducción con dominios específicos (textos religiosos, frases extraídas de Wikipedia, etc.). Esto puede introducir sesgos hacia esos dominios y afectar la generalización a otros tipos de texto.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar traducciones incorrectas o inventar contenido cuando el contexto es ambiguo o fuera del dominio de entrenamiento.
- Limitaciones de idioma: no se especifican los idiomas cubiertos por el adaptador. Se recomienda verificar la cobertura real antes de usarlo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es necesario cumplir con las atribuciones correspondientes.
- Dependencia del modelo base: el adaptador requiere cargar el modelo base completo (14.3B parámetros), lo que implica requisitos de hardware considerables si no se usa cuantización.
- Falta de evaluación: no hay benchmarks publicados, por lo que el rendimiento real en tareas de traducción es incierto. Se recomienda realizar una evaluación propia antes de desplegarlo.

## Enlaces

- [HuggingFace - ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning](https://huggingface.co/ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning)
- [HuggingFace - Qwen/Qwen1.5-MoE-A2.7B](https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B)
- [GitHub - hiyouga/Qwen1.5](https://github.com/hiyouga/Qwen1.5)
