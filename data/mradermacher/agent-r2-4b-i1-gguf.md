# mradermacher/Agent-R2-4B-i1-GGUF

## Resumen

Agent-R2-4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Agent-R2-4B, desarrollado originalmente por teng-pan y cuantizado por mradermacher. Se trata de un modelo de lenguaje orientado a tareas de agente, productividad y razonamiento de horizonte largo (long-horizon), construido sobre la arquitectura Qwen3 y afinado mediante aprendizaje por refuerzo basado en rúbricas (rubric-based RL). El modelo base declara 4B parámetros, aunque el repositorio de safetensors asociado reporta 1.920.204 parámetros, dato que conviene verificar contra el modelo original.

La relevancia de esta ficha radica en que ofrece una distribucion lista para inferencia local en formatos GGUF con una amplia bateria de cuantizaciones (desde IQ1_S hasta Q6_K), lo que permite desplegar un modelo de agente en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales, y su enfoque en tool calling y tareas multi-paso lo posiciona como candidato para pipelines de automatizacion.

No obstante, la informacion publica disponible es escasa: no se detallan resultados de benchmarks, composicion del dataset de entrenamiento ni especificaciones precisas de contexto. Esta ficha refleja unicamente los datos verificables en la model card y los metadatos del repositorio, marcando explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3, segun tags del autor) |
| Parametros totales | 4B declarados en el nombre; 1.920.204 reportados en safetensors (dato inconsistente, verificar) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen3, segun los tags declarados por el autor, lo que implica una arquitectura transformer decoder-only con las innovaciones propias de esa familia. El entrenamiento incluye una fase de aprendizaje por refuerzo basado en rubricas (rubric-based RL), una tecnica que evalua las respuestas del modelo contra criterios estructurados en lugar de una unica recompensa escalar, lo que resulta especialmente util para tareas de agente donde la calidad de una trayectoria multi-paso no se reduce a un unico indicador.

Los tags "agent", "productivity" y "long-horizon" sugieren un enfasis en tareas que requieren planificacion extendida y ejecucion de multiples pasos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de SFT, DPO o RLHF adicionales. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

Las cuantizaciones de este repositorio emplean el metodo i1 de mradermacher, que utiliza un fichero imatrix (importance matrix) para ponderar la cuantizacion de los tensores y preservar mejor la calidad en tamanos reducidos. Se ofrece tambien una version con cuantizaciones estaticas en el repositorio hermano Agent-R2-4B-GGUF.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de agente y productividad.
- Ejecucion de tareas de horizonte largo (long-horizon), segun el tag declarado por el autor.
- Capacidad de seguir instrucciones estructuradas gracias al entrenamiento con rubric-based RL.
- Soporte de tool calling / function calling: no confirmado explicitamente en la model card, aunque el tag "agent" y "endpoints_compatible" lo sugieren.
- Razonamiento multi-paso y planificacion de trayectorias de agente: inferido del tag "long-horizon", sin documentacion detallada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Automatizacion de tareas de productividad: el modelo puede gestionar flujos de trabajo multi-paso (organizacion de correos, resumen de documentos, generacion de listas de tareas) aprovechando su entrenamiento orientado a productividad.
- Agentes de navegacion web o de escritorio: su enfasis en long-horizon lo hace adecuado para tareas que requieren decenas de pasos encadenados con estado persistente.
- Asistentes de soporte tecnico en ingles: puede mantener conversaciones multi-turno con instrucciones estructuradas, aunque la longitud de contexto no esta documentada.
- Generacion de codigo asistida por herramientas: si el soporte de tool calling se confirma, podria integrarse en pipelines de CI/CD para tareas de refactorizacion o generacion de tests.
- Despliegue en hardware de consumo: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en GPUs con 4-6 GB de VRAM, ideal para prototipos locales de agentes.
- Evaluacion de trayectorias de agente: el entrenamiento con rubricas lo hace util como modelo de referencia para puntuar la calidad de ejecuciones multi-paso en sistemas de evaluacion automatica.
- Prototipado rapido de asistentes personales: la licencia Apache 2.0 y el formato GGUF facilitan integraciones en aplicaciones de escritorio mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 4B):
  - Cuantizacion Q6_K: aproximadamente 3,5-4 GB.
  - Cuantizacion Q4_K_M: aproximadamente 2,5-3 GB.
  - Cuantizacion IQ3_M / Q3_K_M: aproximadamente 2-2,5 GB.
  - Cuantizacion IQ2_M / Q2_K: aproximadamente 1,5-2 GB.
  - Cuantizacion IQ1_S: aproximadamente 1-1,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas con contexto largo; A100 o H100 para despliegue en servidor con mayor concurrencia.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. No se documenta soporte para vLLM o TGI en formato GGUF (vLLM requiere pesos safetensors o AWQ/GPTQ).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Agent-R2-4B (este) | 4B (declarado) | no disponible | Apache 2.0 | GGUF, safetensors | Enfocado a agentes y long-horizon |
| Qwen3-4B (base de referencia) | 4B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base de la familia Qwen3 |
| Qwen2.5-3B-Instruct | 3B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar |
| Llama-3.2-3B-Instruct | 3B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa con mayor contexto pero licencia mas restrictiva |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks del modelo evaluado que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas puede degradar la calidad de forma significativa.
- Inconsistencia en el numero de parametros: el nombre indica 4B pero el repositorio de safetensors reporta 1.920.204 parametros; conviene verificar el modelo original antes de dimensionar el hardware.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni metricas de agente, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion: inherente a los modelos de 4B, especialmente en tareas de razonamiento largo y tool calling, donde los errores se acumulan a lo largo de la trayectoria.
- Contexto no documentado: se desconoce la ventana de contexto maxima, lo que impide garantizar su idoneidad para tareas de long-horizon con historial extenso.
- Cuantizaciones agresivas (IQ1, IQ2, Q2_K): pueden degradar notablemente la coherencia y la capacidad de seguir instrucciones; se recomienda Q4_K_M o superior para uso en produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el modelo.
- Sesgos: no documentados por el autor; al estar entrenado principalmente en ingles, puede reflejar sesgos culturales y linguisticos de ese dominio.
- Fecha de creacion futura (2026-11-07): el repositorio muestra una fecha anomala que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Agent-R2-4B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Agent-R2-4B-GGUF
- Modelo base original: https://huggingface.co/teng-pan/Agent-R2-4B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Agent-R2-4B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
