# AMFORGE/cofos_general_600m

## Resumen

Cofos General 600M es un modelo de lenguaje causal de tipo base, con 640 millones de parámetros, desarrollado por AMFORGE (también escrito AMEFORGE en la model card) y entrenado desde cero sobre texto web educativo en francés e inglés. Se presenta como el eslabón fundacional de la familia Cofos General y está construido sobre la arquitectura propietaria SparseMind v15, un transformer disperso del que el autor no publica detalles estructurales. Su vocabulario personalizado, NexusBPE, cuenta con 32.000 tokens y cobertura Unicode mediante byte fallback.

El modelo no está pensado como asistente autónomo: carece de ajuste por instrucciones y de RLHF, y su ventana de contexto se limita a 2.048 tokens. Su valor reside en servir de sustrato para fine-tuning: al ser lo bastante pequeño para ajustarse en una GPU de consumo de gama alta, permite especializar modelos bilingües (asistentes de código, asistentes personalizados, herramientas de dominio) con costes contenidos. El entrenamiento mantiene una proporción estricta 50/50 entre francés e inglés, lo que lo diferencia de la mayoría de modelos abiertos de tamaño similar, sesgados hacia el inglés.

En el momento de redactar esta ficha el modelo figura en estado de entrenamiento activo, sin métricas de benchmarks publicadas, sin utilidades de inferencia públicas y con un runtime propietario necesario para cargarlo. La licencia es Apache 2.0, aunque la arquitectura y el runtime no son abiertos, lo que limita la reproducibilidad completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SparseMind v15 (transformer disperso, propietaria) |
| Parametros totales | 640M |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés e inglés (50/50 en entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`cofos_model.pt`); tokenizer SentencePiece (`cofos_tokenizer.model`) |

Otros datos relevantes: vocabulario de 32.000 tokens (NexusBPE), pipeline `text-generation`, librería PyTorch, tamaño del repositorio de 151 GB, etiqueta `inference: false` en la model card.

## Arquitectura y entrenamiento

La arquitectura es SparseMind v15, descrita por el autor como propietaria y de tipo sparse-transformer. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención, el ratio de dispersión ni el mecanismo exacto de atención. Tampoco se detalla si emplea mezcla de expertos (MoE) o poda estructurada, por lo que no es posible determinar parámetros activos ni ahorro computacional real frente a un transformer denso equivalente. El modelo es causal y de tipo base, sin ajuste por instrucciones ni RLHF.

El entrenamiento se realiza desde cero sobre subconjuntos educativos de rastreos web públicos y con licencia abierta: texto web educativo en inglés y el subconjunto francés de un corpus web multilingüe. El muestreo mixto mantiene una proporción estricta 50/50 entre ambos idiomas a lo largo de todo el entrenamiento. No se publican el número total de tokens procesados, la composición detallada del dataset, ni si hubo fases de DPO o RLHF (la model card indica explícitamente que no hay RLHF). El tokenizer es un SentencePiece personalizado de 32.000 tokens con byte fallback multilingüe y tokens estructurales reservados para el formateo de tareas posteriores.

## Capacidades

- Generación de texto causal en francés e inglés, con representación equilibrada entre ambos idiomas.
- Completado de texto bilingüe como tarea nativa del modelo base.
- Punto de partida para fine-tuning supervisado en tareas específicas (código, asistentes personalizados, dominios verticales).
- Tokenizer con byte fallback que garantiza cobertura Unicode completa a nivel de tokenización.
- Tokens estructurales reservados que facilitan el formateo de tareas en el ajuste posterior.
- No incluye tool calling ni function calling de forma nativa.
- No incluye capacidades de agente ni razonamiento multi-paso entrenadas.
- No incluye modo de pensamiento (thinking), visión ni audio.
- No está ajustado para seguir instrucciones.

## Casos de uso

- Fine-tuning para asistentes de código: el modelo sirve como base sobre la que ajustar un corpus de código y pares instrucción-respuesta; el autor prevé publicar `cofos_general_code_600m` como ejemplo de este flujo. Su tamaño permite iterar el ajuste en una sola GPU de consumo.
- Asistentes personalizados en francés: al tener una representación nativa del francés (50 % del entrenamiento), es adecuado para ajustar asistentes conversacionales orientados a usuarios francófonos sin partir de una base dominada por el inglés.
- Completado de texto en aplicaciones editoriales: integrable en herramientas de redacción o autocompletado bilingüe donde se requiera un modelo pequeño y controlable con contexto de hasta 2.048 tokens.
- Investigación sobre arquitecturas dispersas: permite estudiar el comportamiento de la familia SparseMind y comparar representaciones cross-linguales equilibradas en un modelo de 640M.
- Base para modelos de dominio vertical: ajuste sobre corpus jurídicos, médicos o educativos en francés e inglés, aprovechando que el dato de preentrenamiento está documentado y acotado.
- Experimentación académica con presupuesto limitado: el ajuste fino de 640M de parámetros es viable en una única GPU de gama alta, lo que facilita la reproducción de experimentos de transferencia lingüística.
- Generación de datos sintéticos bilingües para aumentar corpus de ajuste de modelos mayores, siempre que se valide la calidad de la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo está en entrenamiento activo y que se evalúa principalmente mediante entropía cruzada en conjuntos de validación reservados en francés e inglés, así como por el rendimiento tras fine-tuning. No se aportan cifras de MMLU, HumanEval, GSM8K ni de pérdida de validación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,6 GB solo para pesos (640M × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos, más overhead.
- No se dispone de información sobre cuantizaciones (GGUF, GPTQ, AWQ) ni de pesos cuantizados publicados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 8 GB o más de VRAM debería alojar los pesos en precisión reducida; para fine-tuning se recomienda una GPU de gama alta de consumo (por ejemplo, RTX 4090) o profesional (A100, H100) según el tamaño de lote.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8-16 GB de VRAM para inferencia; el autor afirma que el fine-tuning es viable en una sola GPU de consumo de gama alta.
- Opciones de despliegue: no disponibles públicamente. La carga requiere el runtime propietario AMEFORGE SparseMind; la model card marca `inference: false`. No hay soporte conocido para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad de inferencia |
|---|---|---|---|---|---|
| Cofos General 600M | 640M | 2.048 | fr, en (50/50) | Apache 2.0 | Requiere runtime propietario; `inference: false` |
| Modelos base tipo GPT-2 small/medium | 124M-355M | 1.024 | en (predominante) | MIT / Apache 2.0 | Pesos y runtimes abiertos (transformers, llama.cpp) |
| Modelos base tipo Pythia (p. ej. 410M) | 410M | 2.048 | en (predominante) | Apache 2.0 | Pesos y runtimes abiertos |
| Modelos base tipo TinyLlama 1.1B | 1.1B | 2.048 | en (predominante) | Apache 2.0 | Pesos y runtimes abiertos |

La comparación se limita a parámetros, contexto, idiomas, licencia y disponibilidad, ya que no hay datos de rendimiento publicados para Cofos General 600M. Frente a las alternativas abiertas citadas, su diferenciador es el equilibrio francés-inglés y su nicho declarado como base para fine-tuning; su desventaja es la falta de runtime público y de métricas verificables.

## Limitaciones y advertencias

- No es un asistente: carece de ajuste por instrucciones y de RLHF, por lo que no debe desplegarse directamente de cara al usuario.
- Contexto muy limitado: 2.048 tokens, insuficiente para razonamiento de contexto largo o documentos extensos.
- Solo francés e inglés: no se garantiza calidad en otros idiomas.
- Conocimiento factual limitado y con fecha de corte; riesgo de alucinación si se usa para responder preguntas factuales sin ajuste ni verificación.
- Modelo en entrenamiento activo: los pesos pueden cambiar y las métricas no están consolidadas.
- Arquitectura y runtime propietarios: la licencia Apache 2.0 cubre los pesos, pero la imposibilidad de cargar el modelo sin el runtime de AMFORGE limita el uso comercial real y la reproducibilidad.
- Sin capas de alineación ni filtrado de seguridad: no apto para aplicaciones críticas sin evaluación y moderación adicionales.
- Sesgos potenciales heredados del texto web educativo utilizado en el preentrenamiento; no se documentan análisis de sesgo.
- Tamaño del repositorio de 151 GB, muy superior al esperado para 640M de parámetros, lo que sugiere checkpoints intermedios o artefactos adicionales; conviene revisar los archivos antes de descargar.
- Sin métricas de benchmarks publicadas: no es posible validar afirmaciones de calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMFORGE/cofos_general_600m
- Tokenizer: https://huggingface.co/AMFORGE/cofos_general_tok
- Repositorio previsto `cofos_general_code_600m`: no disponible (anunciado como forthcoming)
- Repositorio previsto `cofos_logo_600m`: no disponible (anunciado como forthcoming)
- Paper, blog o demo oficiales: no disponible
