# alignment-decision-lab/robustness-model-bank

## Resumen

Robustness model bank es un conjunto de puntos de control (checkpoints) de investigación publicados por el grupo alignment-decision-lab. No es un modelo único, sino un banco de 23 modelos gpt2-medium (aproximadamente 355 M de parámetros cada uno) afinados con KL-DRO (optimización robusta a la distribución basada en divergencia KL) sobre tres dominios distintos de The Pile: FreeLaw, PubMed Central y ArXiv. Cada dominio se ha entrenado con una rejilla de coeficientes de robustez lambda (0, 0,05, 0,1, 0,2, 0,3, 0,4, 0,5, 0,7 y 1), lo que permite estudiar el compromiso entre rendimiento medio y robustez frente a cambios de distribución.

El propósito del artefacto es servir de soporte empírico a dos componentes de código del propio proyecto: `diagnostic_experiment/algorithm_2.py` y `diagnostic_experiment/hierarchical_routing.py`, que implementan selección de modelo e interpolación conscientes del cambio de distribución. Por tanto, su valor no está en la generación de texto de propósito general, sino en proporcionar una familia controlada de modelos con la que comparar y enrutar según el dominio de destino.

Es relevante ahora porque la mayor parte del lanzamiento original de The Pile está restringido o retirado (principalmente por el componente Books3), y este repositorio documenta explícitamente qué subconjuntos siguen siendo accesibles: 18 de los 22 componentes oficiales tienen fuente confirmada, y los 3 usados aquí (FreeLaw, PubMed Central, ArXiv) pertenecen al nivel de mayor fidelidad. El estado del banco es incompleto: solo gpt2-medium tiene checkpoints (23 de 27), y los directorios gpt2Tiny, gpt2Small, gpt2Large y gpt2Xlarge son marcadores de posición vacíos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 medium, heredada del modelo base `openai-community/gpt2-medium`) |
| Parametros totales | Aproximadamente 355 M por checkpoint (gpt2-medium); el banco contiene 23 checkpoints entrenados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (especificacion del modelo base gpt2-medium; la model card no declara otra) |
| Tipos de cuantizacion | No disponible. El repositorio incluye las etiquetas `tflite`, `onnx` y `base_model:quantized:openai-community/gpt2-medium`, pero no se documenta ninguna receta de cuantizacion |
| Idiomas soportados | No disponible (el modelo base GPT-2 esta entrenado principalmente en ingles, pero la model card no lo declara) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (ejemplo de carga con `transformers`); el repositorio tambien declara `tflite` y `onnx` |
| Tamano del repositorio | 265,1 GB |
| Descargas / likes | 6 descargas, 0 likes |
| Fecha de creacion / actualizacion | 2026-08-22 / 2026-09-12 |

## Arquitectura y entrenamiento

Cada checkpoint es un GPT-2 medium completo (transformer decoder-only con atención causal) inicializado desde el modelo base y ajustado con KL-DRO. La innovación no está en la arquitectura, sino en el procedimiento de entrenamiento: el coeficiente lambda controla el grado de robustez frente a la distribución de datos de origen, de modo que lambda 0 corresponde a un ajuste convencional sobre el dominio y lambda 1 al régimen de máxima robustez contemplado en el banco. Los tres dominios usados son FreeLaw (texto legal), PubMed Central (literatura biomédica) y ArXiv (artículos científicos). Los datos proceden de componentes de The Pile: FreeLaw y ArXiv de espejos `timaeus/pile-*` (nivel 1, subconjunto exacto) y PubMed Central de `datajuicer/the-pile-pubmed-central-refined-by-data-juicer` (nivel 2, alternativa verificada). No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset por checkpoint ni el uso de RLHF, DPO o instrucciones.

El banco se generó con `diagnostic_experiment/models_bank.py` y la configuración `configs/diagnostic/models_bank.yaml`. La cobertura es irregular: ArXiv tiene los 9 coeficientes entrenados; FreeLaw y PubMed Central tienen 7 de 9 cada uno, con `lambda_0.3` y `lambda_0.4` pendientes en ambos casos. Los cuatro componentes de The Pile sin fuente confirmada en el proyecto son Books3, OpenSubtitles, PhilPapers y NIH ExPorter. La carga de un checkpoint concreto se realiza mediante `AutoModelForCausalLM.from_pretrained` indicando `subfolder="gpt2Medium/<dataset>/<lambda_dir>"`.

## Capacidades

- Generación de texto autoregresiva con la calidad y el conocimiento del modelo base GPT-2 medium, sin ajuste por instrucciones documentado.
- Modelado de lenguaje de dominio: especialización declarada en texto legal (FreeLaw), biomédico (PubMed Central) y científico (ArXiv), con distintos grados de robustez según lambda.
- Selección e interpolación de modelos: los checkpoints están pensados para alimentar rutinas de enrutamiento jerárquico y de interpolación consciente del cambio de distribución.
- Comparación controlada de robustez: la rejilla de lambda permite medir el efecto de la robustez sobre el rendimiento en el dominio y fuera de él.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no declaradas en la model card).
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en robustez ante cambio de distribución: el banco permite entrenar y evaluar el mismo modelo base con distintos niveles de KL-DRO y comparar la degradación fuera de dominio entre lambda 0 y lambda 1, usando los tres dominios como pares de origen y destino.
- Evaluación de algoritmos de enrutamiento: `hierarchical_routing.py` puede consumir los 23 checkpoints para decidir qué checkpoint asignar a cada consulta según el dominio detectado, y medir la ganancia frente a usar un único modelo.
- Interpolación de pesos entre dominios: al compartir arquitectura y modelo base, los checkpoints de FreeLaw, PubMed Central y ArXiv se pueden interpolar para estudiar compromisos entre especializaciones sin cambiar la topología de la red.
- Reproducción de subconjuntos de The Pile: el repositorio documenta fuentes verificadas (nivel 1 y nivel 2) para 18 de los 22 componentes, lo que sirve como referencia de trazabilidad de datos para otros proyectos que ya no pueden acceder al lanzamiento original.
- Inicialización para ajuste fino vertical: un equipo que trabaje en legaltech o en procesamiento de literatura biomédica puede partir de `gpt2Medium/FreeLaw/lambda_0.1` o `gpt2Medium/PubMed_Central/lambda_0.2` en lugar de GPT-2 medium sin ajustar.
- Análisis de perplejidad por dominio: con 9 coeficientes por dominio se puede trazar la curva de perplejidad frente a lambda y detectar el punto en el que la robustez deja de compensar la pérdida de ajuste.
- Docencia y experimentación reproducible: el tamaño reducido de cada checkpoint (centenares de megabytes en fp16) permite reproducir experimentos de DRO en una única GPU consumer.
- Estudios de selección de modelo bajo presupuesto: sirve para comparar estrategias de selección (mejor modelo único frente a enrutamiento por dominio) usando modelos del mismo tamaño y coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica numérica, ni comparaciones con modelos similares.

## Requisitos de hardware

- Inferencia por checkpoint: los pesos ocupan aproximadamente 1,4 GB en fp32, 0,7 GB en fp16/bf16, 0,35 GB en int8 y 0,18 GB en int4 (estimaciones derivadas del recuento de parámetros de gpt2-medium, no publicadas por el autor).
- VRAM estimada en fp16 con la ventana completa de 1024 tokens: en torno a 2 GB incluyendo caché KV y overhead del runtime, para lotes pequeños.
- Cabe en cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) y en Apple Silicon mediante MPS.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para la inferencia de un checkpoint individual, pero sí útiles si se quiere cargar o evaluar muchos checkpoints del banco en paralelo.
- Almacenamiento: el repositorio completo ocupa 265,1 GB, por lo que conviene descargar únicamente los subdirectorios necesarios mediante `subfolder`.
- Despliegue: `transformers` con `AutoModelForCausalLM` es la vía documentada. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa. vLLM o TGI son viables al usar formato `safetensors`, aunque no están documentados en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robustness-model-bank (gpt2Medium) | ~355 M por checkpoint; 23 checkpoints | 1024 tokens | KL-DRO sobre FreeLaw, PubMed Central y ArXiv | MIT | HuggingFace, 265,1 GB, 6 descargas |
| openai-community/gpt2-medium | ~355 M | 1024 tokens | Preentrenamiento sobre WebText | MIT modificada | HuggingFace, ampliamente usado |
| openai-community/gpt2-large | ~774 M | 1024 tokens | Preentrenamiento sobre WebText | MIT modificada | HuggingFace |
| Modelo de dominio con ajuste supervisado estandar | ~355 M | 1024 tokens | Ajuste no robusto sobre un unico dominio | Depende del autor | No disponible en este proyecto |

La comparación de rendimiento entre estas alternativas no está disponible: el autor no publica métricas. La diferencia funcional del banco es la variante KL-DRO y la rejilla de lambda, no el tamaño ni la arquitectura.

## Limitaciones y advertencias

- Banco incompleto: solo 23 de los 27 checkpoints de gpt2-medium están entrenados; `lambda_0.3` y `lambda_0.4` faltan en FreeLaw y PubMed Central. Los directorios gpt2Tiny, gpt2Small, gpt2Large y gpt2Xlarge están vacíos y no deben usarse.
- No es un modelo de chat ni está ajustado por instrucciones: no hay evidencia de RLHF, DPO o ajuste supervisado conversacional, por lo que no es adecuado como asistente directo.
- Riesgo de alucinación: al derivar de GPT-2 medium, reproduce texto plausible sin veracidad garantizada; en dominios legal y biomédico esto es especialmente crítico y no debe usarse para asesoramiento sin verificación humana.
- Ventana de contexto limitada a 1024 tokens, insuficiente para documentos legales o artículos completos sin troceado.
- Sesgos conocidos: hereda los sesgos de WebText y de los subconjuntos de The Pile empleados; el autor no documenta ninguna evaluación de sesgos ni de toxicidad.
- Idiomas: no declarados. El modelo base GPT-2 está entrenado predominantemente en inglés, y los tres dominios del banco son corpus en inglés.
- Trazabilidad de datos: 4 de los 22 componentes de The Pile no tienen fuente confirmada (Books3, OpenSubtitles, PhilPapers, NIH ExPorter) y algunas fuentes de nivel 2 son aproximaciones, no subconjuntos exactos.
- Licencia MIT, que en principio permite uso comercial, pero el usuario debe verificar las condiciones de los corpus de origen (The Pile y sus componentes) antes de un despliegue comercial.
- Adopción mínima: 6 descargas y 0 likes, sin validación externa ni benchmarks publicados; no hay pipeline declarado en HuggingFace.
- El repositorio pesa 265,1 GB, lo que hace inviable una clonación completa en muchos entornos; hay que descargar subcarpetas concretas.
- No se publican pesos GGUF ni documentación de cuantización, pese a las etiquetas `tflite` y `onnx`.
- Las fechas de creación y actualización registradas (2026) son posteriores a la mayoría de referencias del ecosistema; conviene comprobar la vigencia de los enlaces a los corpus antes de reproducir los experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alignment-decision-lab/robustness-model-bank
- Modelo base: https://huggingface.co/openai-community/gpt2-medium
- Paper de The Pile: https://arxiv.org/abs/2101.00027
- Fuentes de nivel 1 (subconjuntos exactos): https://huggingface.co/timaeus/pile-pile-cc, https://huggingface.co/timaeus/pile-github, https://huggingface.co/timaeus/pile-pubmed_abstracts, https://huggingface.co/timaeus/pile-dm_mathematics, https://huggingface.co/timaeus/pile-freelaw, https://huggingface.co/timaeus/pile-arxiv, https://huggingface.co/timaeus/pile-hackernews, https://huggingface.co/timaeus/pile-enron_emails
- Fuentes de nivel 2 (alternativas verificadas): https://huggingface.co/datajuicer/the-pile-pubmed-central-refined-by-data-juicer, https://huggingface.co/suolyer/pile_openwebtext2, https://huggingface.co/flax-sentence-embeddings/stackexchange_title_body_jsonl, https://huggingface.co/common-pile/uspto_filtered, https://huggingface.co/emozilla/pg19, https://huggingface.co/wikimedia/wikipedia, https://huggingface.co/common-pile/ubuntu_irc, https://huggingface.co/Yuti/bookcorpus, https://huggingface.co/Helsinki-NLP/europarl, https://huggingface.co/suolyer/pile_youtubesubtitles
- Archivos de codigo citados en la model card (no se proporcionan URL publicas): `diagnostic_experiment/algorithm_2.py`, `diagnostic_experiment/hierarchical_routing.py`, `diagnostic_experiment/models_bank.py`, `configs/diagnostic/models_bank.yaml`, `model_bank_metadata.csv`
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales especificos de este modelo.
