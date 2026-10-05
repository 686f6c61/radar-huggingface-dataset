# empero-ai/Homebrew-Qwen3.5-2B-Grandmas-Kitchen

## Resumen

Homebrew Qwen3.5-2B — Grandma's Kitchen es un adaptador LoRA publicado por el laboratorio independiente Empero (empero-ai) sobre el modelo base Qwen/Qwen3.5-2B. No es un modelo completo, sino un ajuste fino supervisado (SFT) de aproximadamente 2.000 millones de parámetros que reescribe el comportamiento conversacional del base para adoptar una persona muy concreta: una "abuela cariñosa" que explica recetas de cocina casera con un tono cálido, coloquial y lleno de comentarios prácticos de cocina. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors, gestionados con la librería PEFT.

El modelo se presenta explícitamente como una demo del flujo de trabajo de fine-tuning de Homebrew (versión 0.1.0), no como un modelo de producción. El entrenamiento consistió en una única etapa de SFT con LoRA de rango 16 y alpha 32 sobre 826 ejemplos procedentes de recetas de Food.com con licencia MIT reescritas a la persona objetivo, más un conjunto reducido de ejemplos dorados escritos a mano (7 registros) y datos sintéticos generados por un modelo de IA y revisados por el autor. La ventana de secuencia usada durante el entrenamiento fue de 4096 tokens.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo reproducible de cómo transformar un modelo base pequeño en un asistente especializado de dominio (cocina) mediante un adaptador de bajo rango, con un coste de entrenamiento mínimo (104 pasos, 2 épocas, learning rate 2e-4). No se han publicado resultados de benchmarks ni especificaciones detalladas del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un adaptador LoRA sobre Qwen/Qwen3.5-2B; no se describe la arquitectura del modelo base) |
| Parametros totales | ~2B en el modelo base Qwen3.5-2B; el adaptador LoRA (rank 16, alpha 32) anade un numero de parametros entrenables no especificado |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la model card; la longitud de secuencia usada en entrenamiento fue de 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos de entrenamiento y la model card estan en ingles) |
| Licencia | apache-2.0 (del adaptador; la licencia del modelo base debe verificarse en su repositorio) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en sus formatos propios |

## Arquitectura y entrenamiento

La informacion proporcionada describe unicamente el procedimiento de ajuste, no la arquitectura interna del modelo base. Se trata de un adaptador LoRA (Low-Rank Adaptation) de rango 16, alpha 32 y dropout 0.0, aplicado sobre los modulos objetivo por defecto de la libreria PEFT, sobre el modelo Qwen/Qwen3.5-2B de Alibaba Qwen. El entrenamiento se ejecuto en una unica etapa de SFT con los siguientes hiperparametros: learning rate 2e-4, 2 epocas, batch efectivo de 16, optimizador adamw_torch_fused, scheduler coseno con warmup del 5 por ciento y longitud maxima de secuencia de 4096 tokens. El resultado reportado fue una perdida de entrenamiento de 1.530 y una perdida de evaluacion de 1.524 tras 104 pasos. El hardware empleado fue una NVIDIA RTX PRO 5000 Blackwell.

Los datos de entrenamiento suman 855 registros: 848 ejemplos sinteticos del conjunto recipes_granny_v2 (generados con el modelo openai:xiaomi/mimo-v2.6-pro y etiquetados como "trace") y 7 ejemplos dorados escritos a mano (recipes_golden). Las recetas de origen proceden de Food.com con licencia MIT y fueron reescritas a la persona "abuela cociendera". Los datos se almacenaron en ETF (Empero Trace Format) y se renderizaron con la plantilla de chat del propio modelo base. No se menciona el uso de RLHF, DPO ni de tecnicas de decodificacion especulativa. No hay informacion sobre el numero total de tokens de entrenamiento ni sobre innovaciones arquitectonicas.

## Capacidades

- Generacion de texto conversacional en ingles orientada a recetas de cocina casera, con un registro calido, coloquial y con comentarios laterales de tipo "abuela".
- Escritura de recetas completas: ingredientes, pasos, tiempos y consejos practicos de cocina.
- Estilo de acompanamiento: animos, advertencias suaves y sugerencias de sustitucion de ingredientes segun la persona entrenada.
- Soporte de plantilla de chat conversacional (aplicada mediante `apply_chat_template` con `add_generation_prompt=True`).
- Capacidades heredadas del modelo base Qwen3.5-2B: no documentadas en la informacion disponible.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (los ejemplos de la model card estan en ingles).
- Capacidades especiales (modo pensamiento, vision, audio): no documentadas.

## Casos de uso

- Asistente de recetas en una aplicacion de cocina: el modelo puede redactar respuestas conversacionales con ingredientes, pasos y consejos en un tono cercano, aprovechando la persona entrenada para mejorar la retencion del usuario frente a una respuesta generica.
- Generacion de contenido para blogs o newsletters gastronomicas: producir borradores de recetas con voz editorial consistente ("abuela") que un editor humano revisa y publica, reduciendo el tiempo de redaccion.
- Chatbot de marca para retail alimentario: respuestas con tono hogareño y empatico para secciones de recetas, sugerencias de menus o aprovechamiento de sobras, con la advertencia de requerir validacion de seguridad alimentaria.
- Educacion culinaria para principiantes: explicaciones paso a paso con lenguaje sencillo y animos, utiles en cursos introductorios o en contenido formativo para personas sin experiencia en cocina.
- Generacion de descripciones de producto o de kits de ingredientes: convertir listas de ingredientes en textos atractivos y con voz de marca, integrables en fichas de e-commerce.
- Prototipado y validacion del pipeline Homebrew: usar el adaptador como caso de prueba reproducible para verificar el flujo completo de entrenamiento, serializacion en safetensors y carga con PEFT antes de abordar proyectos mayores.
- Punto de partida para nuevos ajustes: al ser un adaptador LoRA pequeno sobre un base de 2B, sirve como inicializacion para especializaciones posteriores (cocina regional, dietas concretas) con coste de computo bajo.
- Evaluacion comparativa de personas conversacionales: referencia interna para medir cuanto cambia el estilo del modelo base tras un SFT de 104 pasos con 855 ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida durante el entrenamiento (train loss 1.530, eval loss 1.524, 104 pasos, 2 epocas), que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

| Metrica | Valor | Contexto |
|---|---|---|
| Train loss | 1.530 | Etapa 1 (SFT + LoRA), 104 pasos |
| Eval loss | 1.524 | Etapa 1 (SFT + LoRA) |
| MMLU / HumanEval / GSM8K | no disponible | No publicados |
| Evaluaciones humanas o A/B | no disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir del tamano del modelo base, no publicada por el autor): en bf16, en torno a 5-6 GB para los pesos del modelo de ~2B mas la cache KV; en cuantizacion de 8 bits, aproximadamente 3-4 GB; en 4 bits, aproximadamente 2-3 GB. El adaptador LoRA anade una cantidad marginal (decenas de MB), y su fusion con el modelo base no cambia de forma significativa el consumo.
- GPU recomendadas (estimacion): cualquier GPU consumer con 8 GB o mas de VRAM para bf16, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Para cuantizaciones de 4 bits bastan GPUs con 4-6 GB de VRAM.
- Cabe en GPU consumer: si, con holgura, dado que el modelo base tiene ~2B de parametros. Tambien es viable en CPU con cuantizacion agresiva, aunque con latencia mayor.
- Opciones de despliegue (estimacion): transformers + PEFT para cargar el adaptador tal como indica la model card; fusion del adaptador y conversion a GGUF para llama.cpp u Ollama; vLLM o TGI tras fusionar los pesos. El autor no documenta ninguna de estas rutas en la informacion disponible.
- Hardware usado en entrenamiento: NVIDIA RTX PRO 5000 Blackwell.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de especificaciones del modelo base mas alla del nombre y el tamano, por lo que no es posible una comparativa cuantitativa fiable. Se ofrece una comparacion estructural limitada a lo documentado.

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Homebrew Qwen3.5-2B — Grandma's Kitchen | ~2B (base) + adaptador LoRA rank 16 | no disponible (entrenado a 4096) | apache-2.0 (adaptador) | safetensors (PEFT) | Demo del flujo Homebrew; 855 ejemplos de entrenamiento |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo de partida; capacidades y licencia deben consultarse en su repositorio |
| Otros modelos de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para comparar rendimiento |

## Limitaciones y advertencias

- Modelo de demostracion: el propio autor lo etiqueta como "demo model" del flujo Homebrew (sft-test), no como modelo listo para produccion.
- Riesgo de alucinacion en el dominio culinario: puede inventar proporciones, tiempos de coccion o temperaturas incorrectas. En contextos alimentarios, un error de este tipo tiene implicaciones de seguridad (coccion insuficiente, conservacion inadecuada, alergenos omitidos).
- Datos de entrenamiento mayoritariamente sinteticos: 848 de los 855 registros fueron generados por un modelo de IA. La model card indica que fueron revisados por el autor, pero no se documenta el metodo ni la cobertura de esa revision. Dos de los conjuntos aparecen con licencia "unknown".
- Corpus de entrenamiento muy reducido: 855 ejemplos y 104 pasos. Es esperable un sobreajuste a la persona y una cobertura limitada de estilos, tipos de cocina y formatos de peticion.
- Idiomas: no se declara ningun idioma soportado. Todos los ejemplos de la model card estan en ingles, por lo que el comportamiento en castellano no esta garantizado ni evaluado.
- Sesgos: no se documenta ninguna evaluacion de sesgos. El adaptador hereda los sesgos del modelo base y de las recetas de Food.com, que reflejan un sesgo cultural y gastronomico concreto.
- Licencia: el adaptador se publica bajo apache-2.0, pero el uso comercial depende tambien de la licencia del modelo base Qwen/Qwen3.5-2B, no indicada en la informacion proporcionada. Debe verificarse antes de cualquier despliegue comercial.
- Sin benchmarks ni evaluacion publicada: no hay datos objetivos de calidad, seguridad o robustez, ni comparaciones con alternativas.
- Requisito de la plantilla de chat del modelo base: los ejemplos se renderizaron con la plantilla propia del base; usar otra plantilla puede degradar el comportamiento.
- Sin informacion sobre sesgos conocidos, limites de contexto efectivos, cuantizaciones validadas ni rendimiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/empero-ai/Homebrew-Qwen3.5-2B-Grandmas-Kitchen
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del flujo Homebrew: https://github.com/empero-org/homebrew-ai
- Sitio del laboratorio Empero: https://empero.org
- Busqueda web realizada: sin resultados relevantes para este modelo (los unicos enlaces devueltos, minifeed.net y dicebag.com, no guardan relacion con la ficha).
