# hozifa1/Faqih-Flutter-1-FF

## Resumen

Faqih Flutter 1 (FF) es un ajuste fino de tipo instrucción sobre Qwen2.5-Coder-14B-Instruct, publicado por el desarrollador hozifa1 (Faqih) bajo licencia Apache 2.0. Se distribuye como modelo fusionado standalone de 29,5 GB y 14.770.033.664 parámetros, lo que significa que no requiere cargar ningún adaptador PEFT/LoRA: los pesos del ajuste ya están integrados en el checkpoint. El autor mantiene además un repositorio hermano con el adaptador LoRA ligero (286 MB) para quien prefiera esa vía.

El modelo está hiperespecializado en ingeniería de aplicaciones Flutter y Dart con estándares empresariales: arquitectura limpia Feature-First, gestión de estado con flutter_bloc 8.1+ y Riverpod 2.x, redes resilientes con Dio 5+ (interceptores en cola, rotación de JWT, CancelToken), Freezed 2.x, RxDart y sincronización offline con resolución de conflictos. Su relevancia es acotada pero muy concreta: cubre un nicho (generación de código Flutter/Dart idiomático y moderno, sin APIs obsoletas) que los modelos generalistas abordan de forma superficial y con patrones desactualizados.

El entrenamiento se realizó con QLoRA de 4 bits durante una única época sobre 5.000 conversaciones de ingeniería Flutter, con una curva de pérdida que desciende de 1,15 a aproximadamente 0,58. El repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación independiente de la comunidad ni resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada del modelo base Qwen2.5-Coder-14B-Instruct |
| Parámetros totales | 14.770.033.664 (≈14,77 B) |
| Parámetros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No confirmada en la model card de este repositorio. El modelo base Qwen2.5-Coder-14B-Instruct declara 32.768 tokens nativos (ampliables a 131.072 con YaRN), valor que este ajuste hereda al no haberse modificado la arquitectura |
| Tipos de cuantización | No disponible. El autor solo publica safetensors en precisión completa (fp16/bf16, 29,5 GB). No hay GGUF, AWQ, GPTQ ni variantes de 8/4 bits publicadas en este repositorio |
| Idiomas soportados | Árabe (ar) e inglés (en), según los metadatos y la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado standalone, sin necesidad de PEFT o LoRA en tiempo de inferencia) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-14B-Instruct: un transformer decoder-only con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y codificaciones posicionales rotatorias (RoPE). Sobre esta base no se ha introducido ninguna innovación arquitectónica propia; el trabajo del autor consiste en un ajuste fino supervisado por instrucciones (SFT) especializado en dominio, no en modificaciones estructurales del modelo.

El proceso de entrenamiento declarado es una QLoRA de 4 bits durante una época completa sobre el dataset `NoirZangetsu/flutterft`, compuesto por 5.000 conversaciones de ingeniería Flutter empresarial. Posteriormente los pesos del adaptador se fusionaron con la base en precisión completa, dando lugar al checkpoint de 14,77 B parámetros y 29,5 GB que se distribuye. La pérdida de entrenamiento convergió de 1,15 a aproximadamente 0,58. No se documentan fases de RLHF, DPO o ajuste por preferencias, ni detalles sobre la composición exacta del dataset, la proporción de ejemplos en árabe frente a inglés, la longitud de las secuencias o la configuración de hiperparámetros (learning rate, rango LoRA, alpha, dropout, warmup).

El contenido de la model card indica que el corpus de instrucciones cubre patrones muy específicos: separación de capas Domain/Data/Presentation, convenciones `part`/`part of` de BLoC, generación de código con `@riverpod` y `AsyncValue`, uso de `DioException` en lugar del obsoleto `DioError`, `QueuedInterceptor` con bloqueos Mutex, `BehaviorSubject.seeded` de RxDart, y conceptos de bajo nivel del motor de Flutter (`RenderBox`, `LeafRenderObjectWidget`, hit-testing euclídeo, pintado sobre Canvas).

## Capacidades

- Generación de código Flutter y Dart 3 con null-safety, orientada a estructuras de arquitectura limpia Feature-First.
- Producción de capas completas: entidades, casos de uso, repositorios, fuentes de datos y widgets de presentación.
- Implementación de gestión de estado con flutter_bloc 8.1+ (incluyendo convenciones `part`/`part of`) y con Riverpod 2.x (anotaciones `@riverpod`, `AsyncValue`, `Notifier`).
- Evitación de APIs obsoletas: usa Dio 5+ con `DioException` y Freezed 2.x en lugar de patrones antiguos.
- Patrones de concurrencia y resiliencia de red: interceptores en cola, bloqueos Mutex, rotación automática de tokens JWT y cancelación de peticiones con `CancelToken`.
- Arquitecturas offline-first: UI optimista con rollback ante errores 409 Conflict y streams reactivos con RxDart.
- Conocimiento de bajo nivel del motor de Flutter: `RenderBox`, `LeafRenderObjectWidget`, matrices de transformación, Canvas y algoritmos de hit-testing.
- Conversación multi-turno en árabe e inglés, con plantilla de chat de Qwen (`apply_chat_template`).
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso explícito, visión, audio ni modo de pensamiento extendido (thinking mode). El pipeline declarado es únicamente text-generation.

## Casos de uso

- Andamiaje de proyectos Flutter nuevos: dado un dominio funcional (por ejemplo, autenticación o catálogo de productos), el modelo genera el árbol de carpetas Feature-First con las capas Domain, Data y Presentation y sus ficheros correspondientes, ahorrando el trabajo repetitivo de estructuración inicial.
- Migración de código Flutter heredado: se le pueden pasar fragmentos con `DioError`, `StatefulWidget` con lógica de negocio embebida o patrones pre-null-safety y pedir su traducción a Dio 5+, BLoC 8.1+ y Dart 3, aprovechando que fue entrenado explícitamente para evitar APIs obsoletas.
- Revisión de arquitectura en revisiones de código: al conocer las convenciones de separación de capas, puede señalar violaciones típicas (acceso a DataSource desde Presentation, lógica de red en widgets) y proponer la refactorización concreta.
- Implementación de capas de red resilientes: generación de interceptores con `QueuedInterceptor` y Mutex para el refresco simultáneo de tokens, más `CancelToken` para cancelar peticiones al salir de pantalla o al teclear en un buscador en tiempo real.
- Desarrollo de funcionalidad offline-first: patrones de UI optimista con rollback y sincronización mediante RxDart, útil para aplicaciones de campo, logística o ventas con conectividad intermitente.
- Generación de código de widgets personalizados de bajo nivel: cuando se necesita un `RenderObject` a medida, el modelo puede producir el `LeafRenderObjectWidget`, su `RenderBox` asociado y la lógica de hit-testing.
- Asistencia en documentación técnica en árabe o inglés: al ser bilingüe en esas dos lenguas, puede redactar guías de arquitectura o comentarios de código en ambos idiomas.
- Prototipado rápido para equipos pequeños: con el adaptador LoRA hermano (286 MB) puede desplegarse un asistente de código Flutter autoalojado sin depender de APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la curva de pérdida de entrenamiento (de 1,15 a ~0,58) y el número de escenarios del dataset (5.000 conversaciones), sin métricas de evaluación sobre HumanEval, MBPP, MMLU, GSM8K ni ningún otro conjunto estándar. Tampoco hay comparaciones cuantitativas con el modelo base ni con adaptadores equivalentes.

| Métrica | Valor |
|---|---|
| MMLU | No disponible |
| HumanEval / HumanEval+ | No disponible |
| MBPP | No disponible |
| GSM8K | No disponible |
| Evaluación específica de Flutter/Dart | No disponible |
| Pérdida de entrenamiento declarada | 1,15 → ~0,58 (1 época, QLoRA 4 bits) |

## Requisitos de hardware

- Pesos en fp16/bf16 (formato publicado): aproximadamente 29,5 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV. En la práctica requiere del orden de 32-36 GB con secuencias cortas.
- GPU recomendadas para precisión completa: NVIDIA A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB. Dos RTX 4090 de 24 GB con reparto de modelo también pueden servir, con penalización de latencia por comunicación entre GPUs.
- Cuantización a 8 bits: en torno a 15-16 GB de VRAM, viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- Cuantización a 4 bits: en torno a 8-9 GB de VRAM más caché KV, viable en GPUs de consumo como RTX 4070 Ti Super (16 GB), RTX 4080 (16 GB) o RTX 3060 de 12 GB con contextos reducidos. Requiere convertir los pesos, ya que el autor no publica GGUF ni AWQ/GPTQ.
- Opciones de despliegue: transformers (el fragmento de la model card usa `AutoModelForCausalLM` con `torch_dtype=torch.float16` y `device_map="auto"`), vLLM o TGI para servir en GPU con pesos safetensors, y llama.cpp u Ollama tras convertir a GGUF. Para el adaptador LoRA hermano, PEFT sobre el modelo base.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faqih Flutter 1 (FF) | 14,77 B (denso) | No confirmado en su model card; hereda los 32.768 tokens del base | Flutter/Dart empresarial (Clean Architecture, BLoC, Riverpod, Dio) | Apache 2.0 | Safetensors fusionado en HF; 0 descargas y 0 likes; sin benchmarks publicados |
| Qwen2.5-Coder-14B-Instruct | 14,7 B (denso) | 32.768 tokens nativos, ampliables a 131.072 con YaRN | Código generalista multilingüe, tool calling y agentes | Apache 2.0 (con condiciones para modelos derivados según el modelo base) | Muy extendido, con benchmarks públicos y soporte en vLLM, llama.cpp, Ollama y TGI |
| Qwen2.5-Coder-7B-Instruct | 7,6 B (denso) | Igual que la familia Qwen2.5-Coder | Código generalista, menor huella de memoria | Apache 2.0 | Amplia disponibilidad y múltiples cuantizaciones oficiales y comunitarias |
| Qwen2.5-Coder-32B-Instruct | 32,5 B (denso) | Igual que la familia Qwen2.5-Coder | Código generalista, mayor capacidad de razonamiento | Apache 2.0 | Requiere hardware de gama alta; benchmarks públicos disponibles |

Los datos de rendimiento comparado no están disponibles: Faqih Flutter 1 no publica ninguna métrica que permita situarlo frente al modelo base ni frente a otros ajustes de dominio. La comparación anterior se limita por tanto a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgo de dominio extremo: el ajuste se realizó sobre 5.000 conversaciones de Flutter, lo que puede degradar el rendimiento en tareas generales de propósito general respecto al modelo base. No se documenta ninguna evaluación de olvido catastrófico.
- Riesgo de sobreajuste a un estilo único: al entrenarse sobre un dataset concreto de un único autor, las convenciones propuestas pueden no coincidir con las de otro equipo (nombres de carpetas, granularidad de casos de uso, estructura de ficheros).
- Alucinación en APIs: como todo modelo de código, puede inventar métodos, parámetros o versiones de paquetes que no existen. La model card afirma que solo usa APIs vigentes, pero no hay verificación independiente de esa afirmación ni evaluación automatizada de compilación.
- Cobertura de idiomas limitada: los idiomas declarados son árabe e inglés. El castellano no está soportado explícitamente, por lo que la generación de explicaciones o documentación en español puede degradarse notablemente.
- Sin benchmarks ni validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, 29,5 GB de peso y ninguna métrica pública. Cualquier uso en producción debería ir precedido de una evaluación propia sobre el código real del equipo.
- Datos de entrenamiento incompletos: se desconoce la procedencia exacta del dataset `NoirZangetsu/flutterft`, su licencia, si contiene fragmentos de código con licencias incompatibles o si hubo filtrado de datos personales. Esto es relevante para auditorías de cumplimiento.
- Licencia: el repositorio declara Apache 2.0, pero al ser un trabajo derivado de Qwen2.5-Coder-14B-Instruct conviene revisar los términos del modelo base antes de un uso comercial. El autor no acompaña ninguna cláusula adicional ni aviso de responsabilidad.
- Tamaño de despliegue elevado: 29,5 GB sin alternativas cuantizadas publicadas complican el uso en infraestructura modesta y obligan a un paso de conversión manual a GGUF o AWQ.
- Sin soporte documentado de tool calling, function calling ni flujos de agente, pese a que el modelo base sí lo ofrece; el ajuste podría haber degradado esa capacidad, algo que no se ha evaluado.
- Ausencia de información sobre hiperparámetros, época efectiva, configuración de LoRA (r, alpha, target modules) y proceso de fusión, lo que dificulta reproducir o auditar el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hozifa1/Faqih-Flutter-1-FF
- Repositorio hermano con el adaptador LoRA (286 MB): https://huggingface.co/hozifa1/Faqih-Flutter-1-FF-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/NoirZangetsu/flutterft

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan ninguna relación con el modelo (corresponden a una tienda de moda alemana). No se han encontrado papers, blogs técnicos, repositorios de código ni demos adicionales asociados a Faqih Flutter 1.
