# john54334343/sn92-generalist-m1-own3

## Resumen

SN92 generalist decision model es un modelo de clasificación de texto obtenido mediante la fusión en el espacio de pesos (weight-space merge) de tres fine-tunes propios del modelo base baselabs/mammoth-1, que a su vez deriva de Qwen3.5-27B. Lo publica el usuario john54334343 y está pensado como un "modelo de decisión" generalista: recibe un ítem con opciones de respuesta (formato REAX eval-v5.1) y emite una letra de respuesta mediante un readout no causal en la última posición. No es un modelo generativo de chat al uso, sino un clasificador de opción múltiple con arquitectura Qwen3_5Model y atención completa no causal.

El modelo tiene 26.085.330.160 parámetros (unos 26,1 mil millones) y un repositorio de 52,2 GB en safetensors. Su relevancia radica en que combina mediante aritmética de tareas lineal tres especializaciones (v7b, v7a y v3a) para cubrir 58 tipos de tareas de decisión, incluyendo abstención ante hechos frescos, NLI clínico, aritmética, recuperación de herramientas y moderación. La licencia es MIT, lo que facilita su uso comercial, aunque con las salvedades propias de un modelo derivado de Qwen3.5.

La información pública disponible es escasa: la model card es detallada en receta de entrenamiento pero no incluye benchmarks, idiomas soportados ni resultados de evaluación. Esta ficha refleja exclusivamente lo que el autor declara, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model (transformer con Gated DeltaNet y atención completa no causal), layout REAX joint-readout |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (longitud máxima de prompt en entrenamiento: 6.144 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 y safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de baselabs/mammoth-1 (revisión 03007ab3c4481bf01c71ef63adbbbc4b2093d71a), un modelo post-entrenado a partir de Qwen3.5-27B con licencia Apache-2.0. La arquitectura es Qwen3_5Model con atención completa no causal y un readout de código de respuesta (answer-code readout) en la última posición, dentro del layout REAX joint-readout. El backbone incluye proyecciones Gated DeltaNet (in_proj_qkv, in_proj_z, out_proj) además de las proyecciones de atención q/k/v/o y las del MLP (gate/up/down) en las 64 capas del modelo de lenguaje.

La receta de fusión es aritmética de tareas lineal por tensor: `base + lam * combine_i(w_i * (parent_i - base))` con lam = 1.0, calculada tensor a tensor en float32 y redondeada una sola vez a bfloat16. Los pesos de cada padre son 0,5 para v7b, 0,35 para v7a y 0,15 para v3a. El readout de respuesta es la media de los readouts de los padres tras normalizar cada uno por su escala respecto al readout de mammoth-1. Los padres se entrenaron con LoRA (r16/r32, alpha 32/64) sobre las 64 capas, con entropía cruzada sobre softmax(logits de letra / 2) frente a gold con label smoothing 0,1, AdamW con decaimiento coseno y una época. Los datos de entrenamiento son exclusivamente fuentes permisivas (Gutenberg, CMUdict, GeoNames, ContractNLI, HANS, MASSIVE, CLINC150, BANKING77, args.me, arXiv, Wikidata, PubMedQA, CaseHOLD, LEDGAR, UNFAIR-ToS, CUAD, GSM8K-train, entre otras), con generadores propios para ítems procedimentales y sin texto escrito por modelos de OpenAI o Anthropic. Se eliminaron fugas contra los splits de evaluación, hold-out y test de Decision-Index antes del entrenamiento.

## Capacidades

- Clasificación de decisión en formato de opción múltiple con readout de letra (answer-code readout), no generación libre de texto.
- Cobertura de 58 tipos de tareas de decisión según la receta del padre v3a.
- Abstención ante hechos frescos: el modelo puede responder "I don't know" en preguntas de conocimiento cuando mammoth-1 no alcanzaba probabilidad ≥ 0,5.
- NLI clínico (clinical-trial NLI) y razonamiento sobre ensayos clínicos.
- Aritmética de GSM8K-train con distractores de código.
- Recuperación de herramientas y de líneas de comandos (tool retrieval, command-line tool retrieval).
- Recuperación de contraargumentos y ranking de productos.
- Análisis de postura (stance) y detección de sarcasmo.
- Moderación de contenido y decisiones tipadas procedimentales.
- NLI general (HANS, ContractNLI) y clasificación de cláusulas contractuales (CUAD, LEDGAR, UNFAIR-ToS).
- Clasificación de intenciones y dominios (MASSIVE, CLINC150, BANKING77).
- Razonamiento lógico y causal yes/no, problemas de ajedrez y acordes, registros de política y tarifas, ítems de API/tool-call.
- Soporte de tool calling / function calling: no disponible como capacidad generativa; solo ítems de decisión sobre herramientas.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible (el encoder de visión queda sin cambios pero no se declara su uso en esta ficha).

## Casos de uso

- Moderación de contenido automatizada: el modelo clasifica ítems de moderación en formato de opción múltiple, adecuado para pipelines de revisión previa donde se necesita una etiqueta discreta y trazable en lugar de texto libre.
- Enrutado de consultas a herramientas: dado un ítem con opciones de herramientas o comandos, el readout de letra selecciona la herramienta o línea de comandos más probable, útil en asistentes con catálogo cerrado de acciones.
- Verificación de contradicciones en documentación clínica: la tarea de clinical-trial NLI permite etiquetar pares de premisa/hipótesis como implicación, contradicción o neutral, aplicable a revisión de protocolos y resúmenes de ensayos.
- Clasificación de cláusulas contractuales: con datos de CUAD, LEDGAR y UNFAIR-ToS en el entrenamiento, el modelo puede etiquetar fragmentos contractuales por tipo de cláusula o por unfairness, apoyando la revisión legal asistida.
- Detección de abstención en preguntas de conocimiento: el modelo puede decidir "no lo sé" ante hechos que no domina, lo que reduce respuestas incorrectas en sistemas de QA con opción de abstención explícita.
- Clasificación de intenciones en atención al cliente: con MASSIVE, CLINC150 y BANKING77, el modelo etiqueta la intención del usuario dentro de un conjunto cerrado, integrable en un enrutador de conversaciones.
- Análisis de postura y sarcasmo en redes sociales o foros: útil para monitorización de opinión y detección de ironía en textos breves, con la salvedad de que no se declaran idiomas soportados.
- Evaluación de razonamiento aritmético con distractores: los ítems de GSM8K-train con distractores de código permiten usar el modelo como evaluador o clasificador de soluciones numéricas en pipelines de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1 mil millones de parámetros × 2 bytes), más overhead de activaciones y del readout; en la práctica se recomienda un mínimo de 60-70 GB de VRAM para bfloat16.
- En cuantización de 8 bits: alrededor de 26 GB de pesos, más overhead; viable en GPUs de 40-48 GB.
- En cuantización de 4 bits: alrededor de 13-14 GB de pesos; potencialmente viable en GPUs consumer de 16-24 GB, aunque el autor no publica pesos cuantizados ni confirma compatibilidad.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 sin cuantizar; A6000 48 GB o L40S 48 GB para 8 bits; RTX 4090 24 GB o RTX 3090 24 GB solo con cuantización agresiva y no confirmada.
- Cabe en GPU consumer: solo con cuantización de 4 bits y no verificado por el autor; el repositorio solo contiene safetensors en bfloat16.
- Opciones de despliegue: PyTorch con safetensors (librería declarada); no se declara soporte de vLLM, llama.cpp, Ollama ni TGI, y el formato de readout no causal con answer-code hace improbable el uso directo en servidores generativos estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SN92 generalist decision model | 26,1 B | no disponible (prompt de entrenamiento 6.144) | MIT | Clasificación de decisión con readout de letra, 58 tareas | HuggingFace, safetensors |
| baselabs/mammoth-1 | no disponible | no disponible | MIT | Modelo base post-entrenado desde Qwen3.5-27B | HuggingFace |
| Qwen3.5-27B | ~27 B | no disponible | Apache-2.0 | Modelo generativo de propósito general | HuggingFace |
| Fine-tunes individuales v3a / v7a / v7b | ~26 B cada uno | no disponible | MIT | Especializaciones parciales del mismo linaje | No distribuidos públicamente según la model card |

La comparativa se limita al linaje declarado porque no se han publicado métricas que permitan contrastar rendimiento con alternativas de la misma categoría. Los padres v3a, v7a y v7b no se distribuyen y no tienen ficha pública verificable en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: solo emite una letra de respuesta sobre un conjunto de opciones; no admite conversación libre ni tool calling generativo.
- Sesgos conocidos: no disponibles; el autor no documenta evaluación de sesgos.
- Riesgo de alucinación: reducido por el formato de opción múltiple y la abstención entrenada, pero no eliminado; el modelo puede elegir una opción incorrecta con alta confianza.
- Limitaciones de contexto: la longitud máxima de prompt en entrenamiento es de 6.144 tokens; no se declara la ventana de contexto efectiva en inferencia.
- Idiomas: no declarados; no se garantiza soporte multilingüe aunque parte de los datos (MASSIVE) esté localizada.
- Restricciones de licencia: MIT en este modelo, pero el linaje incluye Qwen3.5-27B (Apache-2.0) y mammoth-1 (MIT); conviene revisar las condiciones de ambos en uso comercial.
- El autor declara no estar afiliado a Base Labs / Baseten, al equipo de Qwen ni a REAX; el modelo se publica sin aval de los autores originales.
- El repositorio tiene 28 descargas y 0 likes, sin validación externa ni benchmarks publicados; la fiabilidad en producción no está contrastada.
- La fusión por aritmética de tareas puede degradar tareas no representadas en los padres; no se documenta evaluación por tarea.
- El formato REAX eval-v5.1 es específico; integrarlo requiere adaptar el pipeline de inferencia al readout no causal y al joint_config.json.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/john54334343/sn92-generalist-m1-own3
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Revisión del modelo base: 03007ab3c4481bf01c71ef63adbbbc4b2093d71a
- Qwen3.5-27B (linaje declarado): no disponible en la información proporcionada
- REAX eval-v5.1 / eval-v5 dev set: no disponible enlace directo en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código o demo: no disponible
