# brunuu/BolaLM

## Resumen

BolaLM es un modelo de lenguaje de 10.004.736 parámetros entrenado desde cero por el desarrollador independiente brunuu para generar crónicas periodísticas ficticias de fútbol en portugués de Portugal. Se trata de un transformer de arquitectura Llama con 8 capas, dimensión oculta de 256, 4 cabezas de atención (2 para clave/valor) y una ventana de contexto de 512 tokens. No parte de ningún modelo preexistente: tokenizador, pesos y entrenamiento se construyeron íntegramente desde cero sobre una GPU de consumo AMD Radeon RX 7800 XT con ROCm.

El modelo resuelve un problema muy acotado: continuar el inicio de una noticia deportiva con el registro y estilo de un diario portugués, generando contenido deliberadamente inventado (resultados, alineaciones, declaraciones) con apariencia seria. No está pensado como fuente de información ni como asistente generalista; su valor es demostrativo y creativo, y sirve como ejemplo reproducible de pipeline completo de entrenamiento de un modelo de lenguaje a pequeña escala con datos en portugués.

Es relevante ahora por tres motivos: demuestra que un modelo funcional en un dominio concreto puede entrenarse en menos de una hora en hardware de consumo, publica el código de entrenamiento completo, y emplea el corpus Bagaço (subconjunto portugués de FineWeb-2 derivado de Common Crawl) con un filtrado temático documentado. Su licencia MIT y su reducido tamaño lo hacen accesible para experimentación educativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (decoder-only), entrenado desde cero |
| Parametros totales | 10.004.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio incluye safetensors, ONNX y GGUF; no se detallan variantes concretas) |
| Idiomas soportados | Portugués de Portugal (pt-PT) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, GGUF (repositorio con transformers) |

Otras especificaciones técnicas declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension del modelo | 256 |
| Capas | 8 |
| Cabezas de atencion | 4 (2 para clave/valor) |
| Dimension del MLP | 705 |
| Vocabulario | 16.000 tokens (BPE byte-level propio, con dígitos separados) |
| Embeddings | compartidos entre entrada y salida |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

BolaLM es un transformer decoder-only con la estructura de Llama (atención con cabezas clave/valor reducidas, MLP con dimensión intermedia de 705, embeddings atados entre entrada y salida) pero con hiperparámetros propios de un modelo minúsculo: 8 capas, dimensión 256 y contexto de 512 tokens. El tokenizador es un BPE byte-level propio de 16.000 tokens con separación explícita de dígitos, entrenado junto al modelo. No se menciona ninguna innovación arquitectónica adicional (ni decodificación especulativa, ni atención lineal, ni mezcla de expertos): es un transformer denso convencional.

Los datos proceden del corpus Bagaço, un subconjunto de FineWeb-2 restringido a dominios portugueses (.pt) y derivado de Common Crawl. El autor filtró las páginas de deporte, separó fútbol del resto de modalidades con una lista de términos y un clasificador TF-IDF con regresión logística, y aplicó limpieza (eliminación de líneas repetidas como menús y avisos de cookies, páginas de apuestas, duplicados y textos muy cortos). El conjunto final son 849.437 artículos, de los cuales 4.247 se reservaron para validación, lo que deja 845.190 artículos de entrenamiento y 342,6 millones de tokens. El entrenamiento consistió en una única pasada sobre esos datos (342.589.440 tokens vistos) con AdamW, learning rate 1e-3, warmup de 200 pasos y decaimiento coseno hasta el 10%, gradient clipping de 1.0 y precisión bf16. Se ejecutó en una AMD Radeon RX 7800 XT con ROCm en 53 minutos, alcanzando una pérdida de validación de 3,13. No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto en portugués de Portugal con registro periodístico deportivo: continúa el inicio de una noticia de fútbol imitando el estilo de un diario portugués.
- Detección implícita del final de una noticia: según el autor, el modelo aprendió a terminar las crónicas por sí solo, sin límite de tokens.
- Generación con muestreo configurable (temperature y top_p documentados en 0.8 y 0.95), con mayor previsibilidad o mayor disparidad según el valor.
- Capacidad de producir entidades y estructuras típicas del dominio (clubes, jugadores, entrenadores, competiciones, citas atribuidas) de forma plausible aunque inventada.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüe: no; solo portugués (pt), y entrenado específicamente con portugués de Portugal.
- Integración con la librería transformers (pipeline de text-generation) y con text-generation-inference según las etiquetas del repositorio.

## Casos de uso

- Generación de crónicas deportivas ficticias con fines de entretenimiento: se introduce una frase inicial típica ("O Sporting venceu...") y el modelo continúa con resultados, alineaciones y declaraciones inventadas. Es el caso de uso principal declarado por el autor y el único para el que está calibrado.
- Docencia y divulgación sobre entrenamiento de modelos de lenguaje: el repositorio incluye el código completo (criar_BolaLm.py, config.py) y permite reproducir un pipeline de tokenizador, dataset y entrenamiento en menos de una hora en una GPU de consumo, lo que lo convierte en material didáctico concreto.
- Experimentación con tokenizadores BPE byte-level en portugués: el vocabulario de 16.000 tokens con separación de dígitos puede estudiarse o reutilizarse como referencia para corpus lusófonos pequeños.
- Pruebas de despliegue en entornos ligeros: con 10 millones de parámetros y pesos en safetensors, ONNX y GGUF, sirve para validar cadenas de inferencia (transformers, llama.cpp, LM Studio, text-generation-inference) sin coste de GPU significativo.
- Generación de texto de relleno o sintético para maquetas y prototipos de interfaces editoriales: permite poblar plantillas de periódico deportivo con texto con apariencia realista y sin problemas de derechos sobre contenido real.
- Investigación sobre alucinación controlada y estilos de escritura: al inventar sistemáticamente hechos con registro formal, es un banco de pruebas para estudiar cómo los modelos pequeños reproducen sesgos de estilo y entidades frecuentes.
- Análisis de sesgo de frecuencia en corpus web: el autor señala que los clubes y competiciones más citados por la prensa aparecen mucho más, lo que permite estudiar cómo un corpus de Common Crawl moldea la distribución de entidades generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta la pérdida de validación del entrenamiento (3,13) y ejemplos cualitativos de generación; no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 10 millones de parámetros; en la práctica, cualquier GPU con 1-2 GB libres es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problemas. El entrenamiento se realizó en una AMD Radeon RX 7800 XT con ROCm, pero la inferencia no necesita ese hardware.
- Cabe en cualquier GPU de consumo, incluidas integradas y modelos antiguos; también en Raspberry Pi y entornos similares.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference (según etiquetas del repositorio), llama.cpp y LM Studio mediante los pesos GGUF incluidos, y ONNX Runtime con los pesos ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información sobre modelos comparables en la documentación proporcionada. A modo de referencia estructural, se compara con alternativas de tamaño y propósito análogos, sin datos de rendimiento:

| Modelo | Parametros | Contexto | Idioma | Licencia | Proposito |
|---|---|---|---|---|---|
| BolaLM | 10,0 M | 512 | pt-PT | MIT | Crónicas de fútbol ficticias |
| TinyLlama 1.1B | 1.100 M | 2.048 | multilingüe | Apache 2.0 | Modelo generalista pequeño |
| SmolLM-135M | 135 M | 2.048 | inglés (principalmente) | Apache 2.0 | Modelo generalista pequeño |
| Modelos GPT-2 small | 124 M | 1.024 | inglés | MIT | Generación de texto generalista |

La comparación es únicamente estructural: BolaLM es dos órdenes de magnitud menor que TinyLlama o GPT-2 small y está especializado en un dominio y un idioma concretos, por lo que no es directamente comparable en capacidades generales. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Alucinación sistemática: el modelo inventa hechos, resultados, alineaciones, transferencias y declaraciones, incluso cuando parecen plausibles. El propio autor advierte que no sirve como fuente de información.
- Contexto muy limitado: 512 tokens hacen que pierda el hilo argumental al cabo de pocos párrafos y que se repita con frecuencia.
- Sesgo de frecuencia: los clubes y competiciones más presentes en la prensa deportiva portuguesa aparecen mucho más que el resto, lo que distorsiona la distribución de entidades generadas.
- Calidad del corpus: los datos proceden de la web (Common Crawl vía FineWeb-2 y Bagaço), por lo que contienen errores, opinión y lenguaje poco cuidado que el modelo puede reproducir.
- Idioma único: solo portugués de Portugal; no se ha evaluado ni entrenado para otros idiomas ni para variantes como el portugués de Brasil.
- Sin ajuste por instrucciones: no hay RLHF ni DPO documentados, por lo que no responde a instrucciones generales ni mantiene conversaciones multi-turno.
- Sin tool calling, agentes ni razonamiento multi-paso.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el modelo no es apto para producción informativa; cualquier uso comercial debería limitarse a fines creativos o de entretenimiento y dejar claro que el contenido es generado.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: ecosistema mínimo, sin validación externa ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunuu/BolaLM
- Dataset Bagaço: https://huggingface.co/datasets/duarteocarmo/fineweb2-bagaco
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Common Crawl: https://commoncrawl.org/
- Paper de referencia de Llama (arxiv:2302.13971): https://arxiv.org/abs/2302.13971
- Licencia ODC-By 1.0 (dataset): https://opendatacommons.org/licenses/by/1-0/
- Perfil del autor: https://huggingface.co/brunuu
- Perfil del autor del dataset: https://huggingface.co/duarteocarmo
