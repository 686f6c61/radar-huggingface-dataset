# LaTexT/qwen3-8b-gist-sft-50k-gz9-sentence

## Resumen

qwen3-8b-gist-sft-50k-gz9-sentence es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen3-8B publicado por el usuario LaTexT en HuggingFace. Se trata de un artefacto de investigación más que de un modelo de producción: el nombre y los metadatos de procedencia indican que forma parte de un experimento sobre "gist tokens" y cadenas de pensamiento latentes (los directorios de origen incluyen las cadenas `latent-cot`, `gist_sft` y `wrap_gist_token_to_special_tokens`). El entrenamiento se realizó con SFT sobre un subconjunto de 50.000 ejemplos del dataset `shannons/ot3-1.2m-50k`, con 5 épocas, batch size 128 y learning rate 4e-5.

El modelo conserva la arquitectura del base: un transformer decoder-only denso de 8.190.735.360 parámetros (8,19 mil millones), pesos en safetensors de aproximadamente 16,4 GB, lo que corresponde a precisión bf16/fp16. No es un modelo MoE, por lo que no hay parámetros activos distintos del total. Hereda de Qwen3-8B la ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante escalado RoPE tipo YaRN, aunque la model card no documenta ningún cambio en este aspecto ni verifica que el ajuste fino preserve ese comportamiento.

Su relevancia es fundamentalmente académica: sirve para reproducir o auditar una fila concreta de una tabla experimental (la procedencia cita "Paper Table 2: gist_sft 50k g9-sentence") y para estudiar cómo el ajuste supervisado con tokens de resumen comprimido afecta al razonamiento de un modelo de 8B. No cuenta con descargas ni "likes" en el momento de la consulta, la licencia no está especificada y la model card es una plantilla autogenerada sin documentación real de capacidades o evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la model card; el base Qwen3-8B declara 32.768 tokens nativos y hasta 131.072 con YaRN. La secuencia de entrenamiento fue de 18.000 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors en bf16/fp16. No se incluyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card; el base Qwen3-8B declara soporte para 119 idiomas y dialectos |
| Licencia | No disponible. La model card contiene el marcador de posicion `licence: license`. El modelo base Qwen/Qwen3-8B se distribuye bajo Apache 2.0 |
| Formato de pesos | Safetensors (tamano del repositorio: 16,4 GB, compatible con bf16/fp16) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B sin modificaciones estructurales documentadas: transformer decoder-only denso con atención de consultas agrupadas (GQA), normalización RMSNorm y atención con sesgo QKV. El ajuste se realizó sobre el checkpoint completo, no mediante adaptadores tipo LoRA (la etiqueta `full` de LlamaFactory así lo indica), usando TRL 0.12.0, Transformers 4.51.1, PyTorch 2.5.1+cu124 y Datasets 3.6.0. Entrenamiento supervisado (SFT) sin etapa de RLHF ni DPO declarada.

Los hiperparámetros registrados en la procedencia son: dataset `shannons/ot3-1.2m-50k` (50.000 ejemplos), batch size 128, learning rate 4e-5, 5 épocas y longitud de secuencia 18.000 tokens. El identificador del run (`gz9+d-sentence+cross_gist+input+wrap_gist_token+wrap_gist_token_to_special_tokens`) sugiere la inserción de tokens de "gist" como tokens especiales y una compresión de resumen de ratio 9 a nivel de frase, dentro de una línea de trabajo sobre cadenas de pensamiento latentes. No hay documentación del autor que explique la metodología, la composición final del dataset ni la innovación técnica concreta; toda esta información proviene de nombres de directorios y de la sección de procedencia, por lo que debe tratarse como no verificada.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` con formato de chat (`conversational`) y la model card incluye un ejemplo con `transformers.pipeline` sobre una lista de mensajes.
- Razonamiento multi-paso: heredado del base Qwen3-8B y potencialmente reforzado por el entrenamiento sobre un dataset de trazas de razonamiento, aunque no hay evaluación publicada que lo confirme.
- Modo thinking: Qwen3-8B incorpora un modo de pensamiento explícito alternable. No se ha verificado si el ajuste fino conserva esta capacidad ni si los tokens de gist interfieren con ella.
- Multilingüismo: no documentado en esta ficha; dependería del base, que declara 119 idiomas.
- Tool calling y function calling: no documentado. El base lo soporta a través de Qwen-Agent, pero el ajuste SFT puede haber degradado la adherencia al formato.
- Capacidades de agente y razonamiento multi-turno: no documentadas ni evaluadas.
- Capacidad especial: manejo de tokens de "gist" (resumen comprimido) como tokens especiales añadidos durante el entrenamiento. Su uso en inferencia requiere conocer la configuración exacta de tokenizer y plantilla, que no está publicada.

## Casos de uso

- Reproducción de experimentos sobre gist tokens: el modelo permite reproducir la fila "gist_sft 50k g9-sentence" de la tabla 2 del paper asociado, comparando con otros ratios de compresión y otros datasets.
- Investigación sobre cadenas de pensamiento latentes: sirve como sujeto de estudio para analizar si la compresión mediante tokens de gist mantiene la calidad de razonamiento frente a la generación de CoT completa en token.
- Generación de trazas de razonamiento sintéticas: dado que se entrenó sobre SFT conversacional con razonamiento, puede emplearse para producir datos de entrenamiento adicionales, siempre que se valide manualmente la corrección de las trazas.
- Punto de partida para ajustes posteriores: al ser un full fine-tune en safetensors, es una base sobre la que aplicar LoRA o DPO en dominios específicos, con el aviso de que la licencia no está declarada.
- Evaluación comparativa de métodos de compresión de contexto: útil en trabajos académicos que midan calidad frente a coste de tokens de un modelo de 8B.
- Despliegue interno de bajo coste para tareas de generación de texto no críticas: con cuantización de 4 bits cabe en GPUs de consumo, lo que permite experimentación local sin infraestructura dedicada.
- Auditoría de sesgos y robustez en modelos derivados: al ser un ajuste reproducible con hiperparámetros publicados, es adecuado para estudiar cómo el SFT sobre datos de razonamiento altera el comportamiento del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluación y los resultados de la búsqueda web no guardan relación con el modelo (devuelven páginas sobre scripts de EA FC 26). La única referencia a evaluación es la mención a "Paper Table 2: gist_sft 50k g9-sentence" en la sección de procedencia, pero el paper no está identificado ni enlazado, por lo que no se pueden citar cifras.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para los pesos, más caché KV. En la práctica se necesitan del orden de 18 a 22 GB para una ventana de contexto moderada.
- VRAM con cuantización: alrededor de 8,5 a 9 GB en 8 bits y de 5 a 6 GB en 4 bits (estimaciones orientativas, no medidas, ya que no se publican GGUF ni cuantizaciones listas para usar).
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto corto o para cuantizaciones de 8 bits.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16 con margen limitado; en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) o de 12 GB (RTX 3060 12 GB) requiere cuantización de 4 bits. También es viable en equipos Apple Silicon con 16 a 32 GB de memoria unificada.
- Opciones de despliegue: vLLM y TGI (la etiqueta `endpoints_compatible` y el soporte de `text-generation-inference` están declarados), SGLang, y llama.cpp u Ollama previa conversión a GGUF, que el autor no proporciona.
- Latencia y throughput: no disponibles. No se han publicado mediciones y la model card no incluye datos de velocidad. Cualquier cifra sería especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| qwen3-8b-gist-sft-50k-gz9-sentence | 8,19 mil millones (denso) | No disponible (base: 32.768, ampliable a 131.072) | No disponible | Safetensors, bf16, 0 descargas | Sin benchmarks publicados |
| Qwen/Qwen3-8B | 8,19 mil millones (denso) | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Safetensors, GGUF, AWQ; ampliamente desplegado | Resultados publicados en el informe tecnico de Qwen3 |
| Llama-3.1-8B-Instruct | 8,03 mil millones (denso) | 128.000 tokens | Llama 3.1 Community License | Safetensors y multiples cuantizaciones | Resultados publicados en la model card de Meta |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones (denso) | 32.768 tokens | Apache 2.0 | Safetensors, GGUF, AWQ | Resultados publicados en la model card de Mistral |

La comparación de rendimiento directo no es posible porque este ajuste no publica ninguna métrica. La diferencia relevante frente a los tres alternativas es operativa: los modelos base e instruct de referencia ofrecen licencia explícita, cuantizaciones listas para usar y evaluación reproducible, mientras que este artefacto carece de las tres cosas.

## Limitaciones y advertencias

- Licencia sin especificar: la model card contiene un marcador de posición (`licence: license`). No se puede asumir que el uso comercial esté permitido, aunque el base sea Apache 2.0. Cualquier uso en producción exige aclarar este punto con el autor.
- Ausencia total de evaluación: no hay benchmarks, no hay pruebas de regresión y no hay comparación con el modelo base, por lo que no se puede saber si el ajuste ha degradado capacidades previas.
- Riesgo de alucinación: inherente a los modelos de 8B de esta familia y no mitigado ni medido en este caso. La generación de trazas de razonamiento plausibles pero incorrectas es un riesgo particularmente relevante en un modelo entrenado sobre datos de razonamiento.
- Posible olvido catastrófico: 5 épocas con learning rate 4e-5 sobre 50.000 ejemplos es una configuración agresiva. Es probable la degradación de capacidades del base como tool calling, formato de chat estricto o multilingüismo, aunque no hay datos que lo cuantifiquen.
- Dependencia de un tokenizer modificado: la inclusión de tokens de gist como tokens especiales implica que la inferencia debe replicar exactamente el preprocesado del entrenamiento. Sin documentación, el riesgo de obtener resultados degenerados al usar la plantilla de chat estándar de Qwen3 es alto.
- Sesgos: no evaluados. No hay análisis de sesgo de género, raza, religión o idioma.
- Idiomas: no documentados. No se puede confirmar que el ajuste conserve el soporte multilingüe del base.
- Contexto: la longitud de secuencia de entrenamiento fue de 18.000 tokens, inferior a la ventana nativa del base. El comportamiento más allá de esa longitud no está verificado.
- Reproducibilidad: la model card es una plantilla autogenerada ("Model Card for None") y el enlace de Weights & Biases apunta a un dominio no estándar (`fairwandb.org`), por lo que la trazabilidad del experimento no es fiable desde fuera.
- Madurez: 0 descargas y 0 "likes". Es un artefacto recién publicado sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LaTexT/qwen3-8b-gist-sft-50k-gz9-sentence
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento citado: `shannons/ot3-1.2m-50k` (referenciado en la procedencia, sin enlace directo en la model card)
- Run de entrenamiento en Weights & Biases: https://fairwandb.org/shannons/memr-gist-sft-deepspeed/runs/dzdhquwa
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper asociado (fila "Table 2: gist_sft 50k g9-sentence"): no disponible, no se enlaza en la informacion proporcionada
- Resultados de busqueda web: no relevantes, no guardan relacion con el modelo
