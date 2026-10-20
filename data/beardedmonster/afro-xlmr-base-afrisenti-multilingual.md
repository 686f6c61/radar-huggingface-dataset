# BeardedMonster/afro-xlmr-base-afrisenti-multilingual

## Resumen

`BeardedMonster/afro-xlmr-base-afrisenti-multilingual` es un checkpoint de clasificación de sentimiento fruto del fine-tuning del encoder multilingüe `Davlan/afro-xlmr-base` sobre el benchmark AfriSenti, en su protocolo multilingüe, abarcando 12 variedades lingüísticas: amhárico (amh), árabe argelino (arq), árabe marroquí (ary), hausa (hau), igbo (ibo), kinyarwanda (kin), pidgin nigeriano (pcm), portugués (por), suajili (swa), tsonga (tso), twi (twi) y yoruba (yor). El modelo resuelve una tarea concreta y acotada: asignar una etiqueta de polaridad (positiva, negativa, neutra) a textos cortos, típicamente publicaciones de redes sociales.

Arquitectónicamente es un transformer encoder de tipo XLM-RoBERTa base, con 278.043.648 parámetros en el encoder, más una cabeza de clasificación lineal que el autor entrena por separado y distribuye como `head.pt`. La decisión de diseño más relevante —y la principal fuente de fricción para integrarlo— es que no es un `AutoModelForSequenceClassification` estándar: el token `<cls>` no se entrenó, de modo que la clasificación se hace con *mean pooling* sobre la máscara de atención antes de la capa lineal. Esto obliga a escribir código de inferencia propio en lugar de usar el pipeline `text-classification` de Transformers.

El interés del checkpoint es doble. Por un lado, cubre un conjunto de lenguas africanas de bajos recursos donde los modelos multilingües genéricos rinden de forma irregular, y lo hace con un único modelo en lugar de doce monolingües. Por otro, el autor documenta explícitamente la procedencia de las métricas (arnés que reproduce los baselines de MasakhaNER 2.0 con una desviación de ~0,25 F1) y advierte de que los resultados provienen de una sola ejecución. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa base (12 capas, hidden 768) + cabeza lineal sobre mean pooling |
| Parametros totales | 278.043.648 en el encoder (dato real de safetensors); la cabeza añade 768 x n_clases |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en el encoder XLM-R base; el fine-tuning se realizo con max_length 256 |
| Tipos de cuantizacion | no disponible; el repo solo publica safetensors y `head.pt`, sin versiones GGUF/AWQ/GPTQ |
| Idiomas soportados | amh, arq, ary, hau, ibo, kin, pcm, por, swa, tso, twi, yor |
| Licencia | no disponible; rige la licencia y terminos del modelo base `Davlan/afro-xlmr-base` |
| Formato de pesos | safetensors (encoder) + `head.pt` (PyTorch) + `labels.json` (mapa de etiquetas) |
| Tarea | Clasificacion de sentimiento multilingue (multiclase, cabeza lineal) |
| Epocas / LR / batch / max_length | 20 / 5e-05 / 32 / 256 |
| Metrica declarada | weighted_f1, media de 0,6567 sobre 12 idiomas |
| Tamano del repo | 1,1 GB |
| Descargas / likes | 0 / 0 (en la fecha de consulta) |

## Arquitectura y entrenamiento

El backbone es Afro-XLM-R base, un XLM-RoBERTa base (transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas, vocabulario SentencePiece de 250.000 tokens) adaptado por Davlan al dominio africano mediante entrenamiento continuo sobre corpus de ese ámbito. Sobre ese encoder, este checkpoint añade una única capa lineal que proyecta el vector medio (mean pooling sobre la atención) al espacio de etiquetas de sentimiento. El token `<cls>` no se entrenó durante el fine-tuning, lo que explica que el autor no exponga el modelo como `AutoModelForSequenceClassification`: usar la cabeza estándar sobre `<cls>` produciría predicciones degeneradas. Por eso el repo separa encoder (`safetensors`) y cabeza (`head.pt`), y el usuario debe reconstruir el clasificador a mano.

El entrenamiento se hizo con el protocolo multilingüe de AfriSenti, unificando las 12 variedades en un solo clasificador, con 20 épocas, learning rate 5e-05, batch de 32 y truncado a 256 tokens. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo una fase de RLHF o DPO; en un encoder clasificador de este tipo lo habitual es entrenamiento supervisado directo, pero ese dato no está confirmado en la información disponible. La innovación técnica declarada no está en la arquitectura, sino en el procedimiento de evaluación: el arnés del proyecto reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de ~0,25 F1, lo que el autor usa como argumento de calibración de sus propias cifras.

## Capacidades

- Clasificación de sentimiento multilingüe sobre texto corto en 12 variedades lingüísticas, con una única cabeza compartida.
- Salida de una etiqueta discreta por texto; el número y nombre exacto de clases depende del contenido de `labels.json` del repo (no disponible en la información proporcionada).
- Procesamiento por lotes con padding y truncado a 256 tokens, adaptable a través del tokenizador de XLM-R.
- Cobertura de lenguas africanas de bajos recursos (hausa, igbo, yoruba, twi, suajili, amhárico, kinyarwanda, tsonga, pidgin nigeriano) más dos variedades de árabe magrebí y portugués.
- Integrable en *pipelines* propios de scikit-learn o PyTorch como extractor de características (los embeddings medios son reutilizables para otras tareas de clasificación).
- **No** soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión, audio ni *thinking mode*: es un encoder discriminativo, no un modelo generativo.
- No está disponible como pipeline estándar de HuggingFace (`pipeline: no disponible`), lo que limita su uso directo con `transformers.pipeline`.

## Casos de uso

- **Monitorización de reputación en redes sociales para mercados africanos**: clasificar tuits y comentarios en suajili, hausa o yoruba para detectar picos de sentimiento negativo hacia una marca, usando lotes de 32 textos a 256 tokens y una GPU modesta.
- **Moderación de contenido asistida**: priorizar colas de revisión humana etiquetando la polaridad de comentarios en comunidades multilingües donde no existe un modelo comercial fiable para esas lenguas.
- **Investigación en PLN de bajos recursos**: servir de *baseline* reproducible en experimentos sobre AfriSenti, comparando contra los resultados publicados del propio benchmark.
- **Extracción de características para modelos downstream**: usar el vector de mean pooling (768 dimensiones) como entrada de un clasificador ligero propio para tareas distintas (temática, intención, detección de spam) en las mismas lenguas.
- **Análisis de encuestas abiertas y formularios**: procesar respuestas cortas en texto libre en programas de cooperación o salud pública en África subsahariana, con truncado a 256 tokens suficiente para respuestas breves.
- **Enrutado y triaje en atención al cliente**: preclasificar el tono de un mensaje entrante para derivarlo a un agente humano o a una respuesta automática, como paso previo a un modelo generativo de mayor tamaño.
- **Curaduría de datasets**: etiquetar automáticamente grandes volúmenes de texto para preanotar corpus de sentimiento, con revisión humana posterior dado el F1 moderado del modelo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del propio fine-tuning sobre AfriSenti (protocolo multilingüe), en una sola ejecución:

| Metrica | Valor | Notas |
|---|---|---|
| weighted_f1 (media, 12 idiomas) | 0,6567 | Una sola ejecución; los papers de referencia promedian 5 |
| weighted_f1 por idioma | no disponible | El autor remite a `metrics.json`, no incluido en la información proporcionada |
| MMLU / HumanEval / GSM8K | no aplica | Modelo encoder de clasificación, no generativo |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El autor advierte que, al tratarse de una única ejecución frente a las 5 de los papers de referencia, las diferencias pequeñas deben interpretarse como ruido.

## Requisitos de hardware

- **VRAM estimada para los pesos**: ~1,1 GB en fp32, ~0,56 GB en fp16 y ~0,28 GB en int8 (cálculo derivado de 278 M de parámetros; la cabeza lineal es despreciable).
- **VRAM realista en inferencia**: por debajo de 2 GB en fp32 con lotes pequeños y truncado a 256 tokens; el cuello de botella son las activaciones intermedias, no los pesos.
- **GPU recomendadas**: cualquier GPU con 4 GB o más sirve (GTX 1650, RTX 3050/3060, T4). Para lotes grandes y alto throughput, una A10G, L4 o A100 desaprovechan el modelo por su reducido tamaño.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años, y también en CPU para volúmenes moderados.
- **Opciones de despliegue**: no hay soporte de pipeline estándar, así que vLLM/TGI no aplican (no es generativo). Las vías realistas son un script PyTorch propio con `AutoModel` + `head.pt`, TorchScript/ONNX exportado a mano, o un servicio FastAPI con batching. llama.cpp/Ollama no son viables sin una conversión previa a GGUF que no está publicada.
- **Latencia y throughput**: no disponible (no se publican medidas). Por el tamaño del encoder, es esperable un throughput de miles de textos cortos por minuto en GPU moderna con batching, pero es una estimación, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (afro-xlmr-base + AfriSenti) | 278 M | 512 (entreno a 256) | Clasificacion de sentimiento, 12 lenguas | no disponible (rige la del base) | Repo publico, 0 descargas, requiere codigo propio |
| `Davlan/afro-xlmr-base` (modelo base) | 278 M | 512 | Encoder general; sin cabeza de clasificacion | la del modelo base | Publico y ampliamente usado como backbone |
| XLM-RoBERTa base (`FacebookAI/xlm-roberta-base`) | 278 M | 512 | Encoder multilingue general (100 idiomas) | MIT (segun el modelo original) | Muy extendido; sin ajuste a sentimiento africano |
| mBERT (`bert-base-multilingual-cased`) | ~178 M | 512 | Encoder multilingue general | Apache 2.0 (segun el modelo original) | Ampliamente disponible; menor cobertura de lenguas africanas |

No hay datos de benchmark comparativos entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- **No es un `AutoModelForSequenceClassification`**: cargarlo con la clase estándar y usar `<cls>` da resultados incorrectos. Es obligatorio replicar el mean pooling sobre la máscara de atención y cargar `head.pt` por separado.
- **Licencia sin declarar**: el repo no especifica licencia y el autor remite a los términos de `Davlan/afro-xlmr-base`. Antes de cualquier uso comercial hay que verificar la licencia del modelo base; a día de hoy no está resuelta en esta ficha.
- **Métrica de una sola ejecución**: el 0,6567 de weighted_f1 procede de un único *run*, sin intervalos de confianza ni media sobre semillas. No es una cifra apta para comparaciones finas.
- **F1 medio moderado**: 0,6567 deja margen de error considerable; en un despliegue de producción conviene umbralizar la confianza y mantener revisión humana, especialmente en las lenguas con menos datos.
- **Dominio restringido**: AfriSenti se construye sobre tuits; el rendimiento puede degradarse en textos formales, legales o técnicos.
- **Truncado a 256 tokens**: el fine-tuning nunca vio secuencias más largas; aunque el encoder admita 512, pasar de 256 supone una extrapolación no validada.
- **Riesgo de sesgo**: el modelo hereda los sesgos de los corpus de redes sociales y del backbone XLM-R; no se documenta ningún análisis de sesgo ni de toxicidad.
- **Alucinación**: no aplica en sentido generativo (no produce texto libre), pero sí puede asignar etiquetas con alta confianza a entradas ambiguas o fuera de dominio.
- **Cobertura desigual entre las 12 lenguas**: agrupar amhárico, árabe argelino, portugués y tsonga en una sola cabeza compartida implica compromisos; el desglose por idioma no está disponible para evaluarlo.
- **Madurez del repo**: 0 descargas, 0 likes y ausencia de pipeline declarado; no hay garantía de mantenimiento ni issues atendidos.
- **Formato de distribución incómodo**: `head.pt` se carga con `torch.load`, lo que requiere confiar en el origen del archivo o usar `weights_only=True` según la versión de PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/afro-xlmr-base-afrisenti-multilingual
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Paper de AfriSenti: https://arxiv.org/abs/2302.08956
- Paper de MasakhaNER 2.0 (referencia del arnés de evaluación): https://arxiv.org/abs/2210.12391
- Repositorio, demo, blog o discusión adicional: no disponible en la información proporcionada.
