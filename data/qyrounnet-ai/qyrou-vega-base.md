# QyrouNnet-AI/qyrou-vega-base

## Resumen

Qyrou-Vega Base es un checkpoint de la etapa 1 (base) del modelo QyrouNnet-AI/qyrou-vega, reempaquetado por QyrouNnet-AI como un modelo estándar `Qwen3ForCausalLM` compatible con la librería `transformers`. Los pesos proceden del fichero `checkpoints/final_step_521000/model.safetensors` del repositorio de origen, y el tokenizador se copia del mismo directorio. Durante la conversión no se aplicó ningún ajuste fino ni optimización de pesos: se trata únicamente de un trabajo de mapeo de nombres de tensores a los módulos nativos de Qwen3, con la cabeza de salida atada a los pesos de embedding originales.

El modelo tiene 60.375.296 parámetros, un vocabulario de 32.768 tokens y una ventana de contexto de 4.096 tokens. Su arquitectura es de tipo transformer denso con RMSNorm, posiciones rotatorias (RoPE), normalización QK, atención con consultas agrupadas (GQA) y activación SwiGLU, todo ello en el estilo de la familia Qwen3. El repositorio ocupa 0,2 GB y se distribuye exclusivamente en formato safetensors.

Su relevancia es limitada y muy específica: se trata de un modelo base de completación, no de un modelo de chat ajustado por instrucciones, y no cuenta con descargas ni valoraciones en el momento de redactar esta ficha. Resulta útil sobre todo como punto de partida para experimentación a pequeña escala, para investigación sobre modelos de 60M parámetros y como ejemplo verificado de conversión de pesos a la nomenclatura nativa de Qwen3 (según el autor, los logits coinciden exactamente en float32 con una implementación independiente del checkpoint original).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Qwen3 (RMSNorm, RoPE, normalización QK, GQA, SwiGLU) |
| Parámetros totales | 60.375.296 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el repositorio solo distribuye safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a las notas de licencia del modelo de origen) |
| Formato de pesos | safetensors (librería `transformers`, clase `Qwen3ForCausalLM`) |

Datos adicionales: vocabulario de 32.768 tokens, tamaño del repositorio 0,2 GB, pipeline `text-generation`, creado y actualizado el 18 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura declarada por el autor es de tipo Qwen3: normalización RMSNorm, codificación posicional rotatoria, normalización sobre consultas y claves (QK norm), atención con consultas agrupadas (GQA) y capa feed-forward con activación SwiGLU. La cabeza de salida está atada (*tied*) a los pesos de embedding del checkpoint original. El proceso de publicación consistió en mapear los nombres de tensores originales a los nombres de módulos nativos de Qwen3 y guardar el resultado como un `Qwen3ForCausalLM` estándar. El tokenizador se conserva tal cual, incluida la plantilla de chat del checkpoint de origen, que se mantiene solo por compatibilidad.

La verificación de la conversión que reporta el autor indica que el modelo convertido y una implementación independiente del forward del checkpoint original produjeron logits idénticos en una secuencia de muestra en float32, con una diferencia absoluta máxima de 0. También se comprobó la recarga del paquete con `AutoModelForCausalLM` y la salida del tokenizador tras la recarga.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El propio autor remite a la model card del modelo de origen (QyrouNnet-AI/qyrou-vega) para el historial de entrenamiento, las fuentes de datos, las limitaciones y las notas de licencia. El identificador del checkpoint (`final_step_521000`) sugiere un entrenamiento de al menos 521.000 pasos, pero no se especifica el tamaño de lote ni el cómputo total asociado, por lo que no es posible derivar de ahí el volumen de tokens procesados.

## Capacidades

- Generación de texto por completación: al ser un modelo base, su modo natural de uso es continuar un prefijo de texto, no seguir instrucciones.
- Razonamiento y conocimiento factual muy limitados: con 60M de parámetros, la capacidad de almacenar conocimiento del mundo es reducida y los errores factuales son esperables.
- Generación de código y matemáticas: no se documenta ningún resultado ni capacidad específica en estas áreas; se considera no disponible.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Uso como agente y razonamiento multi-paso: no soportado; el modelo no está ajustado por instrucciones.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas, aunque el tokenizador tiene un vocabulario de 32.768 tokens.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad de ecosistema: al exponerse como `Qwen3ForCausalLM`, puede cargarse con `AutoModelForCausalLM` y `AutoTokenizer` de `transformers`, y el repositorio está etiquetado como compatible con `text-generation-inference` y con endpoints.
- Conversación: la plantilla de chat se conserva en el tokenizador por compatibilidad, pero el autor advierte explícitamente de que no debe esperarse calidad de chat con estos pesos base.

## Casos de uso

- Prototipado rápido de pipelines de generación de texto: al ocupar 0,2 GB y cargarse con `AutoModelForCausalLM`, permite montar y depurar un flujo completo de tokenización, inferencia y post-proceso en segundos, sin necesidad de GPU dedicada.
- Investigación sobre interpretabilidad en modelos pequeños: con 60M de parámetros y una arquitectura Qwen3 bien definida, es viable analizar activaciones, cabezas de atención y representaciones internas con un coste computacional bajo y ciclos de experimentación rápidos.
- Verificación de conversiones de pesos: el repositorio documenta una comprobación de equivalencia numérica (diferencia absoluta máxima de 0 en float32) frente a una implementación independiente, por lo que sirve como referencia para validar herramientas de conversión a la nomenclatura nativa de Qwen3.
- Punto de partida para ajuste fino en dominios muy acotados: al ser un checkpoint base, es adecuado para fine-tuning supervisado en tareas de dominio cerrado (por ejemplo, generación de plantillas o normalización de campos) donde no se requiere conocimiento general amplio.
- Pruebas de infraestructura y benchmarking de servidores de inferencia: su tamaño permite desplegarlo en vLLM o TGI para validar configuración, latencia base y throughput de un clúster antes de escalar a modelos mayores.
- Generación de texto en entornos con recursos muy limitados: cabe en CPU, en GPU integradas y en dispositivos edge, lo que habilita experimentos de generación local sin conectividad ni acelerador dedicado.
- Docencia y aprendizaje: sirve para ilustrar el funcionamiento de un transformer causal completo, el efecto de la ventana de contexto de 4.096 tokens y la diferencia entre un modelo base y uno ajustado por instrucciones.
- Aumento de datos sintéticos en dominios estrechos: tras un ajuste fino específico, puede emplearse para generar variaciones de texto de un dominio concreto, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se han encontrado datos de este tipo en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 0,24 GB en float32, 0,12 GB en float16/bfloat16, 0,06 GB en int8 y 0,03 GB en int4. Son cálculos derivados del número de parámetros (60.375.296) y del tamaño de cada tipo de dato.
- Memoria de caché KV: no disponible; depende del número de capas, del número de cabezas KV y de la dimensión de cabeza, valores que no se especifican en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente en la práctica; el modelo no requiere aceleradores de gama alta como A100 o H100, que quedarían enormemente sobredimensionados.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo actual (por ejemplo, series RTX 30xx y 40xx, e incluso en GPUs integradas), y también en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es la vía documentada. El repositorio está etiquetado como compatible con `text-generation-inference`, por lo que TGI es una opción razonable. vLLM debería poder cargarlo al ser compatible con el formato de Qwen3, aunque no está documentado por el autor. No se distribuyen pesos en GGUF, de modo que llama.cpp u Ollama requerirían una conversión previa por parte del usuario.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones y no es posible estimarlas con rigor sin conocer la configuración de capas, el hardware objetivo y el lote utilizado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de Qyrou-Vega Base, por lo que la comparación se limita a características estructurales. Los datos de los modelos alternativos proceden de su documentación pública y pueden variar según la versión consultada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QyrouNnet-AI/qyrou-vega-base | 60,4M | 4.096 tokens | no disponible | safetensors en HuggingFace |
| Qwen3-0.6B | ~0,6B | no disponible en esta ficha | Apache 2.0 (según documentación pública) | safetensors, GGUF y variantes |
| SmolLM2-135M | 135M | no disponible en esta ficha | Apache 2.0 (según documentación pública) | safetensors, GGUF y variantes |
| TinyLlama-1.1B | ~1,1B | no disponible en esta ficha | Apache 2.0 (según documentación pública) | safetensors, GGUF y variantes |

La diferencia principal frente a estas alternativas es de escala (entre dos y veinte veces menos parámetros) y de madurez del ecosistema: ninguno de los tres comparables citados tiene un problema de licencia explícito, mientras que Qyrou-Vega Base no declara licencia alguna y remite a las notas del repositorio de origen. En cuanto a rendimiento, no hay base para establecer una comparación: no se han publicado evaluaciones.

## Limitaciones y advertencias

- Modelo base, no ajustado por instrucciones: no debe esperarse que siga órdenes, mantenga un formato de respuesta ni respete roles de conversación. Aunque el tokenizador conserva una plantilla de chat, el autor advierte de que la calidad de chat no está garantizada con estos pesos.
- Ventana de contexto reducida: 4.096 tokens, muy por debajo de los 32.768 tokens o más que ofrecen modelos contemporáneos de tamaño similar o mayor.
- Riesgo elevado de alucinación y de texto incoherente: con 60M de parámetros y sin datos de entrenamiento publicados, es previsible que genere afirmaciones incorrectas y que pierda coherencia en generaciones largas.
- Conocimiento factual muy limitado: la capacidad de codificar información del mundo está fuertemente restringida por el número de parámetros.
- Licencia no declarada: la ficha no especifica licencia y remite a las notas del modelo de origen. Esto supone un riesgo legal relevante para cualquier uso comercial o redistribución, ya que no se puede verificar qué permisos se conceden.
- Idiomas no declarados: se desconoce qué lenguas cubre el modelo y con qué calidad, más allá del tamaño del vocabulario (32.768 tokens).
- Sesgos: no disponible. El autor no publica información sobre la composición del dataset de entrenamiento ni sobre análisis de sesgos, por lo que no es posible evaluar este aspecto.
- Ausencia de evaluaciones publicadas: no hay resultados de benchmarks que permitan estimar el rendimiento esperado en ninguna tarea.
- Falta de validación por la comunidad: el repositorio registra cero descargas y cero valoraciones en el momento de redactar esta ficha.
- Sin cuantizaciones oficiales: solo se distribuyen pesos en safetensors; quien necesite GGUF para llama.cpp u Ollama tendrá que realizar la conversión por su cuenta.
- Verificación de conversión limitada: la equivalencia numérica reportada se refiere a una única secuencia de muestra en float32, no a una batería exhaustiva de pruebas.
- Recomendación para producción: dado el estado de la información (licencia ausente, sin benchmarks, sin ajuste por instrucciones), no es aconsejable desplegarlo en un sistema de producción orientado a usuarios finales sin una evaluación propia previa y una revisión legal de la licencia.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/QyrouNnet-AI/qyrou-vega-base
- Modelo de origen: https://huggingface.co/QyrouNnet-AI/qyrou-vega
- No se han encontrado enlaces relevantes en la búsqueda web. Los resultados devueltos corresponden a páginas de soporte de Microsoft (contacto, inicio de sesión en Hotmail, actualizaciones de seguridad de Exchange Server) y no guardan relación con el modelo.
