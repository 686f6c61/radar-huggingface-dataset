# Bibek111/sajilofit-qwen2.5-7b-v13-ckpt40-lora

## Resumen

SajiloFit AI (v13, checkpoint-40) es un adaptador LoRA/QLoRA entrenado sobre Qwen/Qwen2.5-7B-Instruct, publicado por el usuario Bibek111 bajo el identificador `Bibek111/sajilofit-qwen2.5-7b-v13-ckpt40-lora`. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (rank 16, alpha 32, dropout 0.05) que se acopla a los módulos de atención `q_proj`, `k_proj`, `v_proj` y `o_proj` del modelo base para especializarlo en fitness y nutrición general. El repositorio ocupa 0,1 GB, coherente con el tamano reducido de un adaptador de este rango.

El problema que aborda es la adaptación de un modelo generalista de 7B a un dominio vertical concreto (preguntas de ejercicio, creación y modificación de rutinas, información nutricional básica y asistencia dentro de una aplicación de fitness llamada SajiloFit) sin necesidad de reentrenar el modelo completo. El autor seleccionó este checkpoint tras una evaluación externa de 200 preguntas (100 estructuradas y 100 de estilo usuario real) comparándolo con el modelo base sin ajustar, con el propio v13 checkpoint-40 y con una variante v14-B checkpoint-5, generando 600 respuestas en total.

La relevancia de esta ficha es limitada pero instructiva: se trata de un adaptador con 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados y sin resultados numéricos de benchmarks publicados. Su interés principal es como ejemplo de flujo de trabajo QLoRA aplicado a un dominio sanitario-deportivo, y como recordatorio de los riesgos de desplegar adaptadores de dominio médico sin validación clínica ni métricas públicas.

## Especificaciones técnicas

Los parámetros estructurales del adaptador provienen de la model card; los del modelo base se indican como tales y corresponden a la documentación pública de Qwen2.5-7B-Instruct.

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA/QLoRA) sobre transformer decoder-only denso (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 7,6 mil millones (dato del modelo base, no del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card del adaptador; el modelo base soporta 32.768 tokens nativos y 131.072 con escalado YaRN (dato del modelo base) |
| Tipos de cuantizacion | No especificados para el adaptador; al ser PEFT puede combinarse con el base en FP16, BF16, INT8 o cuantizaciones GGUF del base (no verificado por el autor) |
| Idiomas soportados | No disponibles (la model card no declara idiomas; el modelo base es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar primero el modelo base |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj |
| Tamano del repositorio | 0,1 GB |
| Version / checkpoint | v13, checkpoint-40 |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de PEFT: se congela el modelo base Qwen2.5-7B-Instruct y se insertan matrices de bajo rango en las proyecciones de query, key, value y output de cada bloque de atención. Con rank 16 y alpha 32 (ratio de escalado 2), el número de parámetros entrenables es una fracción muy pequena del total, lo que explica el tamano de 0,1 GB del repositorio. El entrenamiento se realizó con QLoRA, es decir, con el modelo base cuantizado en 4 bits durante el ajuste, aunque el adaptador resultante se aplica sobre el base en la precisión que se elija en inferencia. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, la duración del entrenamiento ni la hiperparametría de optimización (learning rate, scheduler, epochs).

Tampoco se documenta el uso de RLHF, DPO u otro método de alineación posterior al ajuste supervisado; no hay información sobre si el dataset incluyó datos sintéticos, conversaciones reales de usuarios, planes de entrenamiento estructurados o tablas nutricionales. La única información metodológica disponible es el proceso de selección de checkpoint: una evaluación externa con 200 preguntas comparando tres variantes (base limpio, v13 ckpt-40 y v14-B ckpt-5), tras la cual se eligió v13 checkpoint-40 como modelo final. No se publican las métricas obtenidas ni los criterios cuantitativos de la selección.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de fitness y nutrición general, heredando la capacidad del modelo base Qwen2.5-7B-Instruct.
- Respuesta a preguntas generales de fitness.
- Explicación de ejercicios (ejecución, técnica, músculos implicados), según los usos previstos declarados por el autor.
- Creación de rutinas de entrenamiento desde cero.
- Modificación de rutinas ya existentes.
- Información nutricional general y cálculos nutricionales básicos.
- Asistencia integrada en una aplicación de fitness (flujos de soporte y ayuda dentro de producto).
- Capacidades heredadas del modelo base no verificadas específicamente para este adaptador: soporte de tool calling / function calling, generación de código, matemáticas y razonamiento estructurado, capacidades multilingües y ventana de contexto larga. La model card no documenta ninguna de estas capacidades ni confirma que se conserven tras el ajuste.
- No se declaran capacidades de visión, audio, modo de razonamiento explícito (thinking mode) ni decodificación especulativa específica.

## Casos de uso

- Asistente conversacional dentro de una aplicación de fitness: el adaptador puede gestionar diálogos multi-turno sobre rutinas y nutrición directamente en el backend de la app, cargando Qwen2.5-7B-Instruct en FP16 o cuantizado y aplicando el adaptador vía PEFT. Es adecuado por el bajo coste de almacenamiento (0,1 GB) y porque permite mantener varias variantes de dominio sobre un único base.
- Generación de planes de entrenamiento personalizados: a partir de variables de entrada (objetivo, días disponibles, material, nivel), el modelo produce una rutina estructurada. Encaja en el caso de uso declarado "workout creation", aunque la model card advierte de errores de razonamiento en la progresión de cargas.
- Modificación de rutinas existentes: el usuario pega una rutina y pide sustituciones de ejercicios o redistribución de volumen. El ajuste sobre datos de dominio debería mejorar la coherencia frente al base genérico, si bien no hay métricas que lo cuantifiquen.
- Cálculo de macronutrientes y estimaciones calóricas simples: útil como capa de apoyo en un diario de comidas. Hay que tener en cuenta la limitación declarada de errores aritméticos ocasionales, por lo que conviene validar los números con una calculadora determinista externa.
- Contenido educativo sobre técnica de ejercicios: generación de descripciones y explicaciones para fichas de ejercicios dentro de la app. El adaptador está declarado para "exercise explanations".
- Soporte y FAQ en producto: respuestas a preguntas frecuentes de la aplicación de fitness y guía de uso de funcionalidades ("fitness application assistance").
- Prototipado e investigación en adaptación de dominio sanitario-deportivo: sirve como punto de partida para estudiar el impacto de LoRA de bajo rango en dominios verticales, siempre que se complemente con un conjunto de evaluación propio, dado que no hay métricas públicas.
- Evaluación comparativa de variantes: el repositorio documenta un pipeline de comparación entre checkpoints (v13 ckpt-40 frente a v14-B ckpt-5 y frente al base), reutilizable como metodología de selección de adaptadores en proyectos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación externa de 200 preguntas (100 estructuradas y 100 de estilo usuario real) replicada sobre tres variantes para un total de 600 respuestas, pero no incluye cifras, métricas ni desglose por categoría. La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo (los resultados obtenidos correspondían a páginas de soporte de Microsoft, sin relación con el modelo).

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación interna del autor (200 preguntas) | resultados numéricos no publicados |

## Requisitos de hardware

Estimaciones para el conjunto base 7B más el adaptador (el adaptador anade menos de 0,1 GB):

- VRAM estimada en FP16/BF16: en torno a 15-16 GB, incluyendo pesos y overhead de contexto.
- VRAM estimada en INT8: aproximadamente 8-9 GB.
- VRAM estimada en cuantización de 4 bits (NF4/GPTQ/AWQ): aproximadamente 5-6 GB, lo que permite ejecución en GPUs de consumo con 8 GB o más.
- GPU de consumo compatibles (sujeto a cuantización): RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 (24 GB) sin cuantizar.
- GPU de datacenter: A100 40/80 GB, H100, L40S; en estos casos el modelo ocupa una fracción mínima de la memoria y el límite práctico pasa a ser el throughput y la longitud de contexto.
- Despliegue con vLLM o TGI: requiere fusionar el adaptador con el base o usar el soporte de adaptadores LoRA dinámicos de vLLM (multi-LoRA), lo que permite servir varias variantes sobre un mismo base.
- Despliegue con llama.cpp u Ollama: es necesario fusionar previamente el adaptador con el modelo base y convertir el resultado a GGUF, ya que estos motores no consumen adaptadores PEFT directamente.
- Despliegue con Transformers + PEFT: ruta más directa, cargando `Qwen/Qwen2.5-7B-Instruct` y aplicando el adaptador con `PeftModel.from_pretrained`.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo, TTFT ni rendimiento bajo carga para este adaptador.

## Comparativa con modelos similares

La comparativa se limita a lo verificable; los campos no documentados se marcan como no disponibles.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Bibek111/sajilofit-qwen2.5-7b-v13-ckpt40-lora | Adaptador LoRA sobre Qwen2.5-7B-Instruct | Adaptador (base de 7,6 mil millones) | No especificado en el adaptador | No disponible | HuggingFace, 0 descargas, 0 likes | No |
| Qwen/Qwen2.5-7B-Instruct | Modelo completo, ajustado a instrucciones | 7,6 mil millones | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 (según documentación pública del base) | Ampliamente disponible | Sí, publicados por el autor del base |
| SajiloFit v14-B checkpoint-5 | Adaptador LoRA del mismo autor | Adaptador sobre el mismo base | No disponible | No disponible | No consta repositorio público en la información proporcionada | No |
| Otros ajustes de dominio sobre Qwen2.5-7B | Adaptadores LoRA de terceros | Variable | Variable | Variable | HuggingFace | No disponible en esta búsqueda |

Frente al modelo base sin ajustar, la única ventaja documentada del adaptador es la especialización declarada en fitness y nutrición; no hay métricas que cuantifiquen la mejora, y la propia model card reconoce errores residuales en aritmética nutricional y razonamiento de progresión que el base podría no presentar en la misma medida.

## Limitaciones y advertencias

- No está validado médicamente. La model card indica explícitamente que el modelo no sustituye a un médico, dietista titulado, fisioterapeuta u otro profesional cualificado.
- Errores aritméticos ocasionales en cálculos nutricionales, identificados durante la evaluación del autor.
- Errores de razonamiento en la progresión de entrenamiento (por ejemplo, incrementos de carga o volumen a lo largo de semanas).
- Errores de cumplimiento estricto de restricciones impuestas en el prompt (el modelo puede ignorar condiciones explícitas del usuario).
- Respuestas potencialmente inseguras o inexactas ante alergias y consultas médicas. Este es el riesgo más serio para cualquier uso en producción: un adaptador de fitness que dé información errónea sobre alérgenos puede causar dano real.
- Licencia no declarada: no hay autorización explícita de uso comercial ni condiciones de redistribución, lo que genera incertidumbre legal para integrarlo en un producto. La licencia del modelo base (Apache 2.0 según su documentación pública) no cubre automáticamente los pesos del adaptador.
- Idiomas no declarados: se desconoce si el ajuste se realizó solo en inglés o si conserva el multilingüismo del base. El castellano no está confirmado.
- Contexto no especificado para el adaptador: no se documenta la longitud de contexto efectiva tras el ajuste.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni discusiones, lo que implica ausencia de validación por parte de la comunidad.
- Sin benchmarks públicos ni conjunto de evaluación reproducible: no es posible verificar de forma independiente las afirmaciones de la model card.
- Riesgo de alucinación inherente a un modelo de 7B ajustado con LoRA de rango bajo, especialmente en dominios donde se esperan datos factuales precisos (valores nutricionales, contraindicaciones médicas).
- Fecha de creación registrada en el repositorio (2026-09-11) resulta anómala respecto al ciclo de vida público de Qwen2.5; conviene verificar la procedencia del artefacto antes de usarlo.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Bibek111/sajilofit-qwen2.5-7b-v13-ckpt40-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Informe técnico de Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
- Búsqueda web realizada: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos correspondían a páginas de soporte de Microsoft sin relación con el artefacto. No se dispone de paper, blog, demo ni repositorio adicional del autor.
