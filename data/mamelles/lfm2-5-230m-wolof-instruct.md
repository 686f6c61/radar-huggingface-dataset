# mamelles/LFM2.5-230M-Wolof-Instruct

## Resumen

LFM2.5-230M-Wolof-Instruct es un ajuste fino de instrucciones sobre LiquidAI/LFM2.5-230M-Base, publicado por el usuario mamelles en HuggingFace. Se trata de un artefacto de adaptación al wolof: según su model card, ha pasado por una etapa de preentrenamiento continuado con un corpus limpio de wolof seguida de un ajuste de instrucciones con datos reequilibrados. El autor lo describe explícitamente como un artefacto privado de producción, en estado experimental y no como un lanzamiento público, con uso previsto restringido a investigación y evaluación privadas.

El modelo pertenece a la familia LFM2 de Liquid AI (etiqueta `lfm2` en el repositorio) y se distribuye en formato safetensors para la librería transformers, con pipeline de generación de texto. Aunque el nombre comercial indica 230M de parámetros, el recuento real de los tensores publicados es de 302.671.616 parámetros, un dato relevante a la hora de estimar memoria y coste de inferencia.

Su relevancia actual es limitada y muy específica: cubre un nicho de bajos recursos (wolof, lengua de Senegal y Gambia) con un modelo pequeño que puede ejecutarse en hardware modesto. No obstante, el repositorio no declara licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks, y acumula cero descargas y cero valoraciones, por lo que cualquier evaluación debe hacerse desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 (Liquid AI); detalles de bloques no disponibles |
| Parametros totales | 302.671.616 (recuento real en safetensors); el nombre indica 230M |
| Parametros activos | No aplica (no se declara como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio se distribuye en safetensors (0,6 GB) |
| Idiomas soportados | Wolof (adaptación objetivo declarada); resto no disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tokenizador | Familia `65k-ext` (según la model card) |
| Modelo base | LiquidAI/LFM2.5-230M-Base |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion / actualizacion | 2026-09-18 (misma marca temporal) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. El repositorio usa la etiqueta `lfm2`, lo que sitúa al modelo en la familia LFM2 de Liquid AI, pero no se documentan en la información proporcionada el tipo de bloques, el esquema de atención, la presencia de capas convolucionales ni la configuración de cabezas. Tampoco se especifica el número de capas, la dimensión oculta ni la ventana de contexto. Cualquier afirmación sobre estos puntos requeriría inspeccionar el `config.json` del repositorio.

En cuanto al entrenamiento, la model card describe dos etapas: un preentrenamiento continuado sobre un protocolo de corpus de wolof limpio y un ajuste posterior de instrucciones con datos reequilibrados que excluyen el split de test del Hub de origen. No se menciona uso de RLHF, DPO ni ningún otro método de alineación por preferencias. El autor advierte que ejemplos similares a benchmarks podrían haber estado presentes en el preentrenamiento upstream, y que el tokenizador pertenece a la familia `65k-ext`, por lo que las métricas de BPB no deben compararse como perplejidad contra modelos de la familia de 128k. Los ficheros `training_manifest.json` y `metrics.json` se citan como fuente de registro, pero sus valores no se incluyen en la información disponible.

## Capacidades

- Generación de texto conversacional en formato de instrucciones (pipeline `text-generation`, etiqueta `conversational`).
- Adaptación lingüística al wolof, orientada a comprensión y generación en esa lengua.
- Seguimiento de instrucciones básico, derivado de la etapa de ajuste de instrucciones.
- Ejecución local en hardware de gama baja gracias a su tamaño reducido (302,7M de parámetros).
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües fuera del wolof: no documentadas.
- Modo de razonamiento explícito (*thinking*), visión o audio: no documentados.
- Cobertura de contexto largo: no documentada; el autor indica que el comportamiento en contextos largos no ha sido validado.

## Casos de uso

- Atención al cliente en wolof: el modelo puede gestionar conversaciones multi-turno en wolof para servicios de telecomunicaciones, banca móvil o comercio electrónico en Senegal y Gambia, donde la oferta de modelos que cubran esta lengua es muy escasa.
- Traducción asistida wolof-francés e inglés: útil como primera pasada en flujos de traducción posteriores a edición humana, dado que el wolof es lengua oficial en Senegal y convive con el francés en la administración.
- Generación de material educativo: creación de textos, ejercicios y resúmenes escolares en wolof para programas de alfabetización, con revisión posterior por docentes nativos.
- Investigación lingüística: generación de ejemplos sintácticos, paráfrasis y variantes ortográficas para estudios de normalización del wolof, aprovechando el preentrenamiento continuado sobre corpus limpio.
- Prototipado de asistentes de voz: combinado con un sistema ASR de wolof, el modelo puede actuar como componente de generación de respuestas en un asistente de voz para consultas ciudadanas.
- Normalización y posprocesado de texto: corrección de ortografía y estandarización de transcripciones wolof procedentes de fuentes heterogéneas antes de almacenarlas en una base de datos.
- Filtrado y clasificación temática de corpus: uso como anotador débil para etiquetar grandes colecciones de texto en wolof y reducir el coste de anotación manual.
- Evaluación comparativa de adaptación lingüística: servir como punto de referencia pequeño para medir la dificultad de adaptar modelos de 300M a lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de un fichero `metrics.json` con las métricas medidas y de un `training_manifest.json` con las compuertas automáticas superadas, pero no se reproducen sus valores. Tampoco se aportan cifras de perplejidad, BPB, MMLU, HumanEval ni evaluaciones específicas de wolof, ni comparaciones con otros modelos. Cualquier número que se cite para este artefacto debería medirse de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 0,6 GB solo para los pesos (302,7M de parámetros), más caché KV y activaciones; en la práctica, menos de 2 GB para contextos moderados.
- Cuantización a 8 bits: aproximadamente 0,30 GB de pesos. A 4 bits (por ejemplo Q4_K_M en GGUF): en torno a 0,15-0,20 GB.
- Cabe sin dificultad en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso en GPU integradas con memoria unificada compartida.
- Inferencia en CPU viable: el tamaño del modelo permite decodificación en CPU con llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta ninguna conversión oficial.
- GPU de centro de datos (A100, H100, L40S) innecesarias para una sola instancia; tendrían sentido solo para servir muchas réplicas concurrentes o para *fine-tuning*.
- Opciones de despliegue: transformers de forma nativa; vLLM y TGI requieren verificar el soporte de la arquitectura `lfm2` en la versión concreta instalada; llama.cpp, Ollama y LM Studio requieren conversión previa a GGUF.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-230M-Wolof-Instruct | 302,7M reales (230M nominal) | No disponible | Wolof declarado | No disponible | Ajuste comunitario, 0 descargas |
| LiquidAI/LFM2.5-230M-Base | 230M nominal | No disponible | No disponible | No disponible en esta ficha | Modelo base del que deriva |
| Alternativas pequenas multilingues tipo Qwen, SmolLM2 o LFM2 de mayor tamano | No verificados en esta busqueda | No disponible | Cobertura de wolof no verificada | No verificada | No hay datos comparativos en la informacion proporcionada |

No se dispone de datos verificados de benchmarks ni de cobertura de wolof para las alternativas, por lo que no es posible establecer una comparación cuantitativa fiable. La única ventaja constatable de este artefacto es su especialización declarada en wolof dentro de un tamaño muy reducido.

## Limitaciones y advertencias

- Modelo declarado como experimental por su propio autor: la ortografía del wolof, el *code-switching*, la factualidad, el razonamiento, el comportamiento en contextos largos y la seguridad no han sido validados de forma exhaustiva.
- Se requiere revisión por hablantes nativos antes de cualquier uso amplio; el autor lo indica de forma explícita.
- Riesgo de alucinación elevado por el tamaño reducido del modelo y por la escasez de datos de instrucciones en wolof.
- Posible contaminación de benchmarks: la model card advierte que podrían haber existido ejemplos similares a pruebas en el preentrenamiento upstream, lo que invalida comparaciones ingenuas contra conjuntos de evaluación públicos.
- Licencia no disponible: no se puede asumir permiso para uso comercial. Es imprescindible contactar con el autor o revisar el repositorio del modelo base antes de cualquier despliegue productivo.
- Idiomas soportados no declarados: fuera del wolof, el comportamiento es desconocido y no debe extrapolarse a partir del modelo base.
- Longitud de contexto no documentada: los flujos que dependan de ventanas largas deben validarse empíricamente antes de asumir un límite concreto.
- Discrepancia entre el nombre (230M) y el recuento real de parámetros (302,7M): conviene usar el dato real para planificar memoria y presupuesto de cómputo.
- Ausencia total de tracción (0 descargas, 0 likes) y marca temporal de creación y actualización idéntica: no hay validación por parte de la comunidad ni historial de mantenimiento.
- Aunque la ficha se publique en un repositorio público, el autor la etiqueta como artefacto privado de producción, lo que sugiere que no está pensada para consumo externo ni para soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamelles/LFM2.5-230M-Wolof-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Resultados de la búsqueda web: no contenían enlaces relevantes sobre el modelo, su arquitectura o sus benchmarks (los resultados obtenidos eran páginas no relacionadas).
