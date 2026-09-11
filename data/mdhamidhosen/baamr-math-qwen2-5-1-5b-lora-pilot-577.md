# mdhamidhosen/baamr-math-qwen2.5-1.5b-lora-pilot-577

## Resumen

BaAMR Math Qwen2.5 1.5B LoRA — Pilot 577 es un adaptador PEFT LoRA de tipo CAUSAL_LM entrenado sobre Qwen/Qwen2.5-1.5B-Instruct para responder preguntas de matemáticas curriculares en bengalí e inglés, dirigidas a los cursos 6 a 10 del sistema educativo de Bangladés. Lo publica el usuario de HuggingFace mdhamidhosen y se distribuye como adaptador, no como modelo completo: al cargarlo con PEFT se descarga automáticamente el modelo base, que aporta los 1.500 millones de parámetros.

El problema que aborda es la escasez de asistentes matemáticos bilingües bengalí-inglés con formato de solución razonada y respuesta final. El adaptador se ha entrenado con SFT y QLoRA de 4 bits a partir de un corpus piloto de 577 registros fuente emparejados bn-en que cubren 61 capítulos, expandidos a secuencias separadas en cada idioma (914 secuencias de entrenamiento y 118 de validación; 61 registros de test reservados).

Es relevante ahora como experimento piloto reproducible y de bajo coste (entrenado en Google Colab), y porque el propio autor advierte explícitamente de que no es la versión final planeada de 12.000 registros y de que no se reclama ninguna puntuación de benchmark ni revisión humana. La ficha, por tanto, debe leerse como una pieza de investigación cualitativa y prototipado, no como un sistema listo para evaluación académica de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5) con adaptador PEFT LoRA sobre Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA se distribuye aparte (repo de 0,1 GB). El número exacto de parámetros del adaptador no está disponible en la model card |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens según la especificación del modelo base Qwen2.5-1.5B-Instruct (no declarado en la model card del adaptador). El entrenamiento se realizó con longitud máxima de secuencia de 1.024 tokens |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4 bits NF4 y doble cuantización. Los pesos publicados del adaptador están en safetensors; la precisión concreta de esos pesos no está indicada. El modelo base admite cuantizaciones del ecosistema (GGUF, AWQ, GPTQ), pero no se documentan en esta tarjeta |
| Idiomas soportados | Bengalí (bn) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA). No se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer causal decoder-only de la familia Qwen2.5 en su variante Instruct de 1,5 B de parámetros. La configuración LoRA usa rango 16, alpha 32, dropout 0,05, sesgo `none` y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, se adaptan tanto las proyecciones de atención como las del bloque MLP. Es una configuración LoRA estándar, sin innovaciones arquitectónicas propias: el valor diferencial está en los datos y en el formato de solución supervisada, no en la topología del modelo.

El entrenamiento fue SFT con QLoRA de 4 bits (NF4 con doble cuantización) ejecutado en Google Colab: 3 épocas, longitud máxima de 1.024 tokens, batch por dispositivo de 2 con 8 pasos de acumulación (batch efectivo 16), learning rate 1e-4, scheduler coseno, 50 pasos de warmup, weight decay 0,01, optimizador `paged_adamw_8bit`, pérdida causal solo sobre la completación, checkpointing de gradientes activado y precisión BF16 cuando el hardware lo permite (FP16 en caso contrario). La evaluación y el guardado se hacían cada 100 pasos, seleccionando el mejor modelo por pérdida de validación.

El corpus piloto contiene 577 registros fuente emparejados bengalí-inglés repartidos en 61 capítulos de los cursos 6 a 10, con preguntas, razonamiento desarrollado, respuestas finales, metadatos curriculares y referencias a páginas de origen. Cada registro se expandió a dos secuencias (una en cada idioma): 457 registros de train (914 secuencias), 59 de validación (118 secuencias) y 61 de test reservados. El autor indica que el corpus superó comprobaciones automáticas de estructura, paridad bilingüe, familias de duplicados, fuga entre splits y aserciones matemáticas (452 aserciones con cero fallos automáticos, cero discrepancias numéricas bilingües detectadas y cero fugas de split), y advierte de que esas comprobaciones no equivalen a revisión experta independiente. El objetivo de 12.000 registros es un trabajo futuro y no se usó en este piloto.

## Capacidades

- Generación de texto conversacional con plantilla de chat (roles `system` y `user`), orientada a respuestas de tutoría matemática.
- Resolución de problemas de matemáticas curriculares de los cursos 6 a 10 con solución razonada breve y respuesta final explícita.
- Funcionamiento bilingüe bengalí-inglés: el mismo problema puede formularse en cualquiera de los dos idiomas y el entrenamiento incluyó secuencias separadas para cada uno.
- Generación determinista verificable: los ejemplos de la model card usan `do_sample=False`, lo que facilita la reproducibilidad en demo y en evaluación.
- Adaptación ligera reutilizable: al ser un adaptador PEFT, puede combinarse con el modelo base para comparaciones controladas y experimentos de ajuste continuado.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de uso agéntico, planificación multi-paso ni razonamiento encadenado con herramientas.
- No hay capacidades multimodales: ni visión, ni audio, ni modo "thinking" explícito.
- No se documentan capacidades fuera del ámbito educativo de matemáticas descrito.

## Casos de uso

- Tutoría de matemáticas bilingüe para secundaria: un estudiante de clase 6 a 10 plantea un problema en bengalí o en inglés y el modelo devuelve los pasos esenciales y la respuesta final; el adaptador está entrenado específicamente sobre ese rango curricular, lo que reduce la deriva temática.
- Generación de soluciones resueltas para plataformas de ejercicios: se puede usar como generador de borradores de solución paso a paso que un docente revisa antes de publicar, aprovechando la estructura de "razonamiento + respuesta final" del entrenamiento.
- Traducción y alineación de enunciados matemáticos bn-en: el corpus emparejado permite usar el adaptador para producir la versión en el otro idioma de un enunciado y comparar consistencia numérica entre ambas, un caso útil para digitalizar material curricular.
- Prototipado educativo de bajo coste: al ser un modelo de 1,5 B en FP16 que cabe en GPUs consumer, se puede desplegar como demo local o en un portátil con memoria unificada para pruebas de aula sin depender de APIs.
- Investigación cualitativa y ablations: sirve como punto de partida para comparar configuraciones de LoRA (rango, alpha, módulos objetivo) o de datos sobre el mismo modelo base, dado que el adaptador es pequeño y el pipeline es reproducible.
- Ajuste continuado hacia la versión de 12.000 registros: el adaptador piloto puede actuar como inicialización para el entrenamiento ampliado que planea el autor, ahorrando cómputo frente a partir del modelo base.
- Despliegue en entornos con conectividad limitada o requisitos de privacidad: al ejecutarse localmente sobre un base de 1,5 B, permite asistencia matemática offline sin enviar datos de estudiantes a servicios externos.
- Preprocesado de material curricular: conversión de páginas de libro de texto en microlecciones con enunciado, pasos y respuesta, sujeto a revisión humana por las limitaciones descritas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark ni de evaluación humana para este piloto. Los únicos números publicados son de validación del pipeline de datos, no de calidad del modelo:

| Elemento | Resultado declarado |
|---|---|
| Aserciones matemáticas del dataset | 452, con cero fallos automáticos |
| Discrepancias numéricas bilingües detectadas | 0 |
| Fugas de split detectadas | 0 |
| Pérdida de validación | No reportada en los artefactos publicados |
| Exact match / accuracy en test reservado | No reportado todavía |
| Revisión por profesor de matemáticas | No completada |
| Revisión bilingüe independiente | No completada |

## Requisitos de hardware

- VRAM para inferencia en FP16: aproximadamente 3,1 GB solo de pesos (1,5 B × 2 bytes) más caché KV; en la práctica por debajo de 8 GB con contextos moderados. Cifras exactas de latencia y throughput: no disponibles en la información proporcionada.
- VRAM en cuantización de 8 bits: en torno a 1,6-2 GB de pesos.
- VRAM en cuantización de 4 bits: en torno a 1,0-1,2 GB de pesos.
- El adaptador LoRA en sí ocupa muy poco espacio (el repositorio completo es de 0,1 GB), por lo que no altera de forma significativa los requisitos del modelo base.
- Cabe en GPU consumer: sí. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o un equipo Apple Silicon con 8-16 GB de memoria unificada son suficientes para inferencia en FP16 o 4 bits.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrían sentido para entrenamiento a mayor escala o para servir muchas réplicas concurrentes.
- Entrenamiento: el autor usó Google Colab, lo que implica una GPU T4 de 16 GB con QLoRA de 4 bits, batch de 2 y acumulación de 8 durante 3 épocas.
- Opciones de despliegue: `transformers` + `peft` con `AutoPeftModelForCausalLM` (el camino documentado en la model card); vLLM y TGI admiten adaptadores LoRA en servidores de inferencia; para llama.cpp u Ollama es necesario fusionar previamente el adaptador con el modelo base (`merge_and_unload`) y convertir el resultado a GGUF, un procedimiento no documentado en esta tarjeta.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo en ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo y enfoque | Idiomas | Licencia | Benchmarks en esta ficha |
|---|---|---|---|---|---|---|
| BaAMR Math Qwen2.5 1.5B LoRA — Pilot 577 | 1,5 B (base) + adaptador LoRA | Base: 32.768 tokens; entrenado a 1.024 | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct, matemáticas curriculares bn-en | bn, en | Apache-2.0 | No publicados |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | 32.768 tokens (especificación pública del base) | Modelo completo instructivo de propósito general | Multilingüe amplio | Apache-2.0 | No recogidos en la información proporcionada |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1,5 B | No verificado en la información proporcionada | Modelo completo especializado en matemáticas, orientado a razonamiento matemático general | Principalmente en y zh | No verificado en la información proporcionada | No recogidos en la información proporcionada |
| Adaptador genérico de ajuste sobre Qwen2.5-1.5B (por ejemplo, SFT comunitario) | 1,5 B (base) + adaptador | Depende del entrenamiento | Ajuste supervisado de dominio general | Variable | Habitualmente Apache-2.0 si hereda del base | No disponible |

La comparación relevante aquí no es de rendimiento, porque el piloto no publica métricas, sino de naturaleza: este adaptador aporta especialización bilingüe bn-en en matemáticas curriculares sobre un base de propósito general, con un corpus muy pequeño y sin validación externa, mientras que Qwen2.5-Math-1.5B-Instruct es un modelo completo entrenado específicamente para matemáticas pero sin foco declarado en bengalí. Las columnas marcadas como no verificadas no aparecen en la información proporcionada en esta ficha.

## Limitaciones y advertencias

- Es un piloto, no la versión final: se entrenó con 577 registros validados frente al objetivo planeado de 12.000. El autor lo declara explícitamente.
- No hay ninguna puntuación de benchmark, exact match ni accuracy publicada sobre el split de test reservado. Cualquier comparación con otros modelos carece de base empírica con los artefactos liberados.
- No se ha completado revisión por profesor de matemáticas ni revisión bilingüe independiente. Las comprobaciones automáticas del dataset no equivalen a validación experta.
- Riesgo de alucinación matemática: con 1,5 B de parámetros y un corpus de entrenamiento pequeño, es esperable que produzca pasos plausibles pero incorrectos en problemas fuera de los 61 capítulos cubiertos.
- Uso fuera de alcance prohibido por el autor: no debe emplearse como sistema de calificación autoritativo, como fuente no supervisada de preguntas de examen ni como sustituto de un docente cualificado. Tampoco está validado para evaluación de alto riesgo ni verificación de demostraciones formales.
- Cobertura limitada a los cursos 6 a 10 del currículo de Bangladés; no hay evidencia de generalización a otros niveles, otros currículos ni a matemáticas universitarias.
- Cobertura de idiomas restringida a bengalí e inglés. No hay datos sobre comportamiento en otras lenguas ni sobre mezcla de idiomas dentro de un mismo turno.
- Contexto de entrenamiento de solo 1.024 tokens, muy inferior a la ventana teórica del modelo base; los problemas largos o con enunciados extensos pueden degradar la calidad de la respuesta.
- No hay soporte documentado de tool calling, agentes ni función de ejecución de código, lo que limita su uso en pipelines que necesiten cálculo verificable externo.
- Licencia Apache-2.0 en el adaptador, pero conviene verificar la licencia y las condiciones del modelo base Qwen2.5-1.5B-Instruct antes de un uso comercial, así como citar adecuadamente ambos artefactos.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Las búsquedas web realizadas no devolvieron ningún resultado relacionado con este modelo; los enlaces obtenidos correspondían a portales de vales de hotel sin relación con el proyecto.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/mdhamidhosen/baamr-math-qwen2.5-1.5b-lora-pilot-577
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Perfil del autor: https://huggingface.co/mdhamidhosen
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Artículo de LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Artículo de QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Informe técnico de Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Repositorio de Qwen en GitHub: https://github.com/QwenLM/Qwen2.5
- Búsqueda web: sin resultados relevantes sobre el modelo; los enlaces devueltos no guardan relación con el proyecto.
