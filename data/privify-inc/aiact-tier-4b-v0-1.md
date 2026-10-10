# Privify-Inc/aiact-tier-4b-v0.1

## Resumen

El modelo `Privify-Inc/aiact-tier-4b-v0.1` es un adaptador LoRA de 4B parámetros, afinado a partir de Qwen3-4B por Bhaskar Tallamraju (Privify Inc.), que clasifica la descripción de un sistema de IA según el Reglamento (UE) 2024/1689 (Ley de IA de la UE). Su salida es un objeto JSON con el nivel de riesgo (`prohibited`, `high_risk`, `limited_transparency` o `minimal`) y la lista de provisiones aplicables, por ejemplo `{"tier": "high_risk", "provisions": ["Annex III(4)(a)", "Art. 50(1)"]}`.

La relevancia del modelo está en su carácter de herramienta de triaje de primer paso: no sustituye a un abogado ni certifica cumplimiento, pero permite priorizar revisiones humanas sobre inventarios de sistemas de IA. Se distribuye como adaptador PEFT sobre Qwen3-4B, con licencia Apache 2.0, y el autor publica también versiones cuantizadas GGUF (`Q8_0`, `Q4_K_M`) para su uso en llama.cpp, Ollama y LM Studio.

Se trata de una versión v0.1 temprana. El conjunto de evaluación es pequeño (109 elementos) y sus etiquetas fueron revisadas por modelos de IA y adjudicadas por el autor, sin revisión jurídica. El propio autor advierte de que las cifras son indicativas y no definitivas, y de que el modelo tiene debilidades concretas en la detección de prácticas prohibidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B) con adaptador LoRA; el adaptador se aplica sobre todas las capas lineales |
| Parametros totales | No disponible de forma explícita en la model card; el modelo base es Qwen3-4B (aproximadamente 4.000 millones de parametros). El adaptador LoRA en si es de rango 16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no la especifica). La longitud maxima usada durante el entrenamiento del adaptador fue de 512 tokens |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit (NF4 en pesos base, computo en fp16). Se publican ficheros cuantizados GGUF `Q8_0` y `Q4_K_M` |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft); GGUF para las versiones cuantizadas. Tamano del repositorio: 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) montado sobre Qwen3-4B, un transformer decoder-only de la familia Qwen3. El adaptador se entrena con QLoRA de 4 bits (pesos base en NF4, computo en fp16) sobre todas las capas lineales, con rango 16, alpha 32, dropout 0,05, learning rate 2e-4 con scheduler coseno, 2 epocas, batch efectivo de 16 y longitud maxima de 512 tokens. La perdida se calcula unicamente sobre los tokens de la respuesta. El entrenamiento completo se ejecuto en una unica NVIDIA Tesla T4 (16 GB) en Kaggle, en aproximadamente 3 horas, con torch 2.11, transformers 5.16 y peft 0.20.

Los datos de entrenamiento consisten en 137 descripciones ficticias de sistemas de IA escritas a mano (3 por categoria, 23 para `minimal`) mas 4 ejemplos con multiples provisiones. Estas descripciones se redactaron con asistencia de IA (Claude de Anthropic) a partir del texto publico del Reglamento y no fueron revisadas por un abogado. Cada semilla se repite con contexto neutro respecto a la etiqueta (proveedor, despliegue, fase), lo que no aporta hechos juridicos nuevos ni diversidad real significativa. En la v0.1 no se usaron parafrasis generadas por LLM. El split queda en 2.704 elementos de entrenamiento y 288 de validacion, dividido por semilla para que las variantes no crucen el split; se eliminan casi-duplicados de los elementos gold (Jaccard de tokens igual o superior a 0,6) y una prueba unitaria bloquea solapamientos. No se emplearon datos de clientes, datos personales, texto raspado de la web ni datos confidenciales de Privify.

## Capacidades

- Clasificacion de descripciones de sistemas de IA en cuatro niveles de riesgo del Reglamento (UE) 2024/1689: `prohibited` (Art. 5(1)(a) a (h)), `high_risk` (categorias del Anexo III y Art. 6(1)), `limited_transparency` (Art. 50) y `minimal`.
- Salida estructurada en JSON con el nivel de riesgo y la lista de todas las provisiones aplicables.
- Seleccion del nivel mas severo aplicable y enumeracion de cada provision relevante (taxonomia completa en `aiact_tier/taxonomy.py`).
- Uso mediante la libreria `aiact_tier` (`Classifier`), aplicando el adaptador sobre el modelo base.
- Decodificacion greedy recomendada por el autor.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible; el caso de uso previsto es clasificacion en un solo paso.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para ingles.
- Capacidades especiales (vision, audio, modo de razonamiento explicito): no disponibles; es un modelo de texto enfocado a clasificacion.

## Casos de uso

- Triaje de primer paso en inventarios de sistemas de IA: dada una descripcion textual de cada sistema del catalogo interno, el modelo devuelve un nivel de riesgo que permite ordenar la cola de revision y que los responsables de cumplimiento aborden primero los casos mas sensibles.
- Priorizacion en revisiones de cumplimiento normativo: dentro de un flujo de gobernanza, el modelo preclasifica cada sistema y marca los que requieren analisis juridico manual, reduciendo el volumen inicial de trabajo.
- Registro y catalogacion de modelos (model registry): integrar la clasificacion como paso automatico al dar de alta un nuevo modelo o caso de uso, generando metadatos de tier y provisiones asociadas.
- Prototipos de herramientas de gobernanza de IA: el propio autor lo destina a utilidades y prototipos de tooling, donde la salida JSON se consume directamente por otras aplicaciones.
- Investigacion y benchmarking: sirve como referencia para comparar metodos de clasificacion bajo el AI Act, dado que el autor publica la metodologia de evaluacion y las lineas base (reglas por palabras clave, clasificador mayoritario, Qwen3-4B zero-shot).
- Educacion y formacion: uso en materiales docentes o talleres sobre el AI Act para ilustrar como se mapean descripciones de sistemas a niveles de riesgo y provisiones concretas.
- Enrutado hacia revision humana: en un pipeline de aprobacion, el modelo actua como filtro previo que deriva cada caso a un revisor o a un comite segun el tier estimado, siempre con supervision de una persona cualificada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto gold de 109 descripciones de sistemas (93 casos estandar y 16 mas dificiles y vagos). Las etiquetas fueron redactadas por Claude, etiquetadas a ciegas por ChatGPT y Microsoft Copilot (concordancia entre ambos de kappa de Cohen 0,96) y adjudicadas por el autor; ninguna fue revisada por un abogado. El modelo base y las lineas base reciben el prompt largo con todas las provisiones permitidas; el modelo afinado usa el prompt corto.

| Modelo | Precision de tier (IC 95%) | Macro-F1 | Exact match | Provisiones alucinadas | Errores criticos |
|---|---|---|---|---|---|
| Clase mayoritaria | 50,5% (42,2 a 59,6) | 16,8% | 0,0% | 0,0% | 0,0% |
| Reglas por palabras clave | 59,6% (49,5 a 68,8) | 59,6% | 44,0% | 0,0% | 24,8% |
| Qwen3-4B, zero-shot | 69,7% (61,5 a 78,9) | 54,4% | 41,3% | 4,9% | 2,8% |
| **Este modelo (adaptador QLoRA 4-bit)** | **80,7% (73,4 a 88,1)** | **74,8%** | **68,8%** | **2,1%** | **0,9%** |

Definicion de error critico segun el autor: un sistema prohibido o de alto riesgo clasificado como `limited_transparency` o `minimal`.

Desglose adicional aportado por el autor: el ajuste fino supera al modelo base sin afinar en unos 11 puntos de precision de tier (IC 95% por bootstrap emparejado: +3,7 a +18,3). En los 93 casos estandar la precision de tier es del 87% (81 de 93), mientras que en los 16 casos mas dificiles y vagos baja al 44% (7 de 16). En practicas prohibidas el modelo solo etiqueto correctamente como `prohibited` 8 de 17 sistemas; los otros 9 se etiquetaron como `high_risk`, en su mayoria reconocimiento de emociones en el trabajo o la escuela, puntuacion social e inferencia biometrica de opiniones politicas. Las versiones GGUF cuantizadas y otros modelos base no se evaluaron en la v0.1. El unico error critico registrado fue un sistema de triaje de urgencias hospitalarias (detalle no disponible por corte de la model card).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el modelo base Qwen3-4B ocupa alrededor de 8 GB en fp16 y aproximadamente 2,5-3 GB en cuantizacion de 4 bits; los ficheros GGUF `Q4_K_M` rondan los 2,5 GB y `Q8_0` los 4,5 GB (estimaciones a partir del numero de parametros, no confirmadas en la model card).
- GPU recomendadas: el autor entreno con una unica NVIDIA Tesla T4 (16 GB) en Kaggle. Para inferencia no se especifican GPU objetivo; el modelo cabe en GPU de consumo modernas con suficiente memoria.
- Compatibilidad con GPU de consumo: si, previsiblemente en tarjetas con 6-8 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB o superiores) al usar las versiones GGUF cuantizadas.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio con los ficheros GGUF `Q8_0` o `Q4_K_M`; transformers/peft y la libreria `aiact_tier` para el adaptador LoRA sobre Qwen3-4B. No se menciona soporte explicito de vLLM o TGI en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

El autor no publica comparaciones con otros clasificadores especificos del AI Act, pero si con lineas base dentro de su propia evaluacion.

| Modelo | Parametros | Contexto | Precision de tier | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (adaptador QLoRA) | Base de aprox. 4B mas adaptador LoRA r16 | No disponible | 80,7% | Apache 2.0 | HuggingFace (Privify-Inc) |
| Qwen3-4B zero-shot | Aprox. 4B | No disponible | 69,7% | Apache 2.0 | HuggingFace (Qwen) |
| Reglas por palabras clave | No aplica | No aplica | 59,6% | No disponible | No disponible |
| Clase mayoritaria | No aplica | No aplica | 50,5% | No disponible | No disponible |

## Limitaciones y advertencias

- No es asesoramiento juridico ni certificacion de cumplimiento. El autor lo define explicitamente como una ayuda a la decision que puede equivocarse y que exige revision por una persona cualificada.
- El conjunto de evaluacion es pequeno (109 elementos) y sus etiquetas no fueron revisadas por un abogado; las cifras son indicativas, no definitivas.
- Debilidad en practicas prohibidas: solo 8 de 17 sistemas prohibidos se etiquetaron correctamente como `prohibited`. Los demas cayeron en `high_risk`, lo que implica un sesgo hacia el nivel mas cauteloso pero no una deteccion fiable de prohibiciones.
- Rendimiento mucho peor en casos dificiles o vagos: 44% de precision de tier en los 16 casos dificiles frente al 87% en los 93 estandar. Cabe esperar precision inferior sobre descripciones reales de proveedores.
- El modelo clasifica descripciones de sistemas, no personas.
- Fuera de alcance: obligaciones de modelos de IA de proposito general (Art. 51 en adelante), plazos, multas y procedimientos de conformidad.
- Fuera de alcance: decisiones de cumplimiento automatizadas sin revision humana.
- Idiomas: solo ingles.
- Alucinacion de provisiones: 2,1% en la evaluacion publicada; puede citar articulos o anexos que no correspondan.
- Datos de entrenamiento limitados: 137 descripciones semilla sin parafrasis de LLM en la v0.1, y con poca diversidad real por el uso de variantes de encuadre.
- Las versiones cuantizadas GGUF no fueron evaluadas en la v0.1, por lo que su rendimiento es incierto.
- Licencia Apache 2.0 con las clausulas 7 y 8 (sin garantia y sin responsabilidad); el uso es responsabilidad exclusiva del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Privify-Inc/aiact-tier-4b-v0.1
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3 (arXiv 2505.09388): https://arxiv.org/abs/2505.09388
- Pagina de modelos de Privify Inc.: https://huggingface.co/Privify-Inc/models
- Sitio de Privify: https://privify.io/
- Privify FORGE: https://privify.io/forge/index.html
