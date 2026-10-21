# DarkKitsune/Qwen3.6-Qworus-35B-A3B-V2-APEX-GGUF

## Resumen

Qwen3.6-Qworus-35B-A3B-V2-APEX-GGUF es un modelo de lenguaje obtenido mediante un merge de tipo DELLA (drop-and-sign-election) a partir de cuatro modelos ajustados y post-entrenados: `openbmb/MiniCPM-V-4.7-35B-A3B` como base, `Kwaipilot/KAT-Coder-V2.5-Dev` (código), `Accio-Lab/occamy-1.0` (uso de terminal y capacidades agénticas) y `ornith-ai/Ornith-1.5-35B-A3B` (razonamiento, planificación y arquitectura de software). Lo publica el usuario DarkKitsune en Hugging Face, con un total de 34.659.889.792 parámetros y una nomenclatura A3B que indica una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos por token.

El objetivo declarado es construir un modelo híbrido orientado a programación, planificación, diseño, trabajo en terminal y conversación, priorizando el razonamiento frente a la economía de tokens: el autor advierte explícitamente de que esta versión «gasta más tokens pensando» que el primer merge Qworus de 35B-A3B. La distribución es exclusivamente en formato GGUF con cuantización APEX, pensada para llama.cpp y para despliegue local con memoria limitada gracias a la activación dispersa del MoE.

Es relevante para quien busque un modelo agéntico y de código con huella de VRAM contenida (alrededor de 20 GB en cuantizaciones de 4 bits) y ventanas de contexto largas, aunque con dos caveats importantes: la licencia no está declarada en el repositorio y la model card no publica ventana de contexto, benchmarks ni idiomas distintos del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivado por merge DELLA de cuatro modelos; base MiniCPM-V 4.7 35B-A3B |
| Parametros totales | 34.659.889.792 (34,7B) |
| Parametros activos | Aproximadamente 3B, segun la nomenclatura «A3B» del nombre del repositorio (el autor no publica el dato exacto) |
| Longitud de contexto | No disponible (el autor etiqueta el modelo como «long-context» sin especificar la ventana) |
| Tipos de cuantizacion | GGUF con cuantizacion APEX (preserva tensores sensibles a mayor precision); niveles concretos por archivo no disponibles |
| Idiomas soportados | Ingles (`language: en` en la model card) |
| Licencia | No disponible |
| Formato de pesos | GGUF (repositorio de 39,4 GB, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es un merge de pesos entre cuatro checkpoints con relaciones declaradas como `merge` respecto a cada uno de ellos. La arquitectura subyacente es la de MiniCPM-V 4.7 en su variante 35B-A3B, es decir, un transformer con mezcla de expertos de 34,7B parámetros totales y activación dispersa de aproximadamente 3B por token. La técnica de fusión es DELLA, que descarta pesos y resuelve los conflictos entre modelos mediante elección de signo; el autor aplica densidad y épsilon para esparsificar la mayor parte de tensores, pero desactiva esa esparsificación (densidad 1.0, épsilon 0.0) en los tensores más sensibles: puertas del router, embeddings de tokens y capa de salida. La versión V2.1, anunciada como en subida, retira además del filtro de densidad los expertos compartidos y las proyecciones `[k|v|q|o]_proj`, y reequilibra los ratios cediendo parte del peso de Ornith a KAT-Coder y occamy para reducir la tendencia a «sobreplanificar».

No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO, porque no hay entrenamiento posterior al merge. La innovación reseñable está en la cuantización: los GGUF se generan con APEX, un esquema que asigna mayor precisión a los tensores sensibles según el comportamiento de los MoE. La importance matrix se calibró con aproximadamente un 50 % de fragmentos aleatorios de texto en inglés de múltiples dominios y un 50 % de tokens generados en sesiones agénticas reales de contexto largo con KAT-Coder y Ornith-1.5, incluyendo tokens de control como `<|im_start|>`.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento extendido que consume más tokens de «pensamiento» antes de responder.
- Generación y comprensión de código, con conocimiento de múltiples lenguajes de programación aportado por KAT-Coder-V2.5-Dev y con énfasis en eficiencia de tokens.
- Razonamiento multi-paso, planificación de tareas y descomposición de problemas, heredado del merge con Ornith-1.5.
- Uso de terminal y ejecución de comandos en entornos de línea de comandos, aportado por occamy-1.0.
- Capacidades agénticas y de auto-scaffolding: el modelo puede estructurar su propio flujo de trabajo y encadenar pasos.
- Diseño de arquitectura de software y tareas de planificación técnica.
- Soporte de contexto largo según la etiqueta del autor (sin cifra publicada).
- Compatibilidad con endpoints y con el ecosistema llama.cpp (`endpoints_compatible`, `llama.cpp`).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de visión: la base MiniCPM-V es un modelo visión-lenguaje, pero el repositorio se publica con `pipeline_tag: text-generation` y no declara soporte multimodal; no disponible como capacidad confirmada.
- Idiomas: únicamente inglés declarado.

## Casos de uso

- Asistente de programación en local: con ~3B parámetros activos y cuantización APEX de 4 bits, el modelo cabe en una GPU de consumo y puede integrarse en un IDE o en un servidor de desarrollo para autocompletado, refactorización y explicación de código sin depender de la nube.
- Automatización de tareas en terminal: el aporte de occamy-1.0 permite interpretar la salida de comandos, proponer secuencias de shell y corregir errores en bucles de prueba y error, adecuado para scripts de mantenimiento y administración de sistemas.
- Agente de resolución de incidencias en CI/CD: puede leer trazas de error, planes de corrección y parches, y encadenar pasos de diagnóstico; su ventana de contexto larga (etiquetada por el autor, sin cifra) permite incorporar logs extensos en el prompt.
- Planificación técnica y diseño de arquitectura: útil para generar documentos de diseño, descomponer epics en tareas y evaluar compensaciones entre opciones, gracias a la contribución de Ornith en razonamiento y planificación.
- Asistente conversacional técnico multi-turno: orientado a soporte interno de desarrolladores, donde el contexto acumulado de una sesión de depuración es largo y el modelo debe mantener coherencia.
- Migración y traducción entre lenguajes de programación: el conocimiento multilingüe de KAT-Coder permite portar módulos entre lenguajes manteniendo semántica, una tarea donde la eficiencia de tokens reduce coste por operación.
- Generación de scripts de automatización con razonamiento previo: el modo de pensamiento extendido resulta adecuado para tareas donde un error es costoso (operaciones sobre infraestructura), a cambio de mayor latencia y consumo de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, SWE-bench ni ninguna otra métrica, y la búsqueda web realizada no devolvió material técnico relacionado con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 34,7B parámetros totales, no publicadas por el autor): en torno a 20-22 GB para cuantizaciones de 4 bits, 26-28 GB para 5-6 bits, aproximadamente 37 GB para 8 bits y cerca de 69 GB en FP16.
- El repositorio GGUF ocupa 39,4 GB, lo que sugiere varios archivos de cuantización; conviene revisar la lista de ficheros antes de descargar.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 permite ejecutar cuantizaciones de 4 bits completas en VRAM; para 6-8 bits se necesita A6000 (48 GB), A100 40/80 GB o H100. En configuraciones de 2×24 GB es posible repartir capas.
- Cabe en GPU de consumo: sí, con cuantizaciones de 4 bits en tarjetas de 24 GB; con 16 GB sería necesario el offload parcial a RAM del sistema, con la consiguiente pérdida de velocidad.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y otros frontends compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa y requerirían conversión a safetensors.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3B activos, la velocidad por token debería aproximarse a la de un modelo denso de ese tamaño, aunque la memoria necesaria para mantener todos los expertos residentes condiciona el rendimiento en hardware limitado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-Qworus-35B-A3B-V2-APEX (este modelo) | 34,7B | ~3B (nomenclatura A3B) | No disponible | No disponible | GGUF (APEX) |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | ~35B | ~3B | No disponible | No disponible | No disponible |
| ornith-ai/Ornith-1.5-35B-A3B (contribuyente) | ~35B | ~3B | No disponible | No disponible | No disponible |
| Kwaipilot/KAT-Coder-V2.5-Dev (contribuyente) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Accio-Lab/occamy-1.0 (contribuyente) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad. Frente a los checkpoints originales, la ventaja diferencial de este merge es la combinación de capacidades (código + terminal + razonamiento) en un único artefacto GGUF con cuantización orientada a MoE; su desventaja es la ausencia de licencia declarada y de métricas publicadas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial; hay que contactar con el autor o consultar las licencias de los cuatro modelos de origen antes de desplegar en producción.
- Idiomas: solo se declara inglés. El rendimiento en castellano u otras lenguas no está documentado y probablemente sea inferior.
- Ventana de contexto: aunque se etiqueta como «long-context», no se publica la cifra exacta, lo que impide dimensionar correctamente el prompt y la memoria KV.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en código, razonamiento o tareas agénticas; cualquier evaluación debe hacerse por cuenta propia.
- Riesgo de alucinación: inherente a los modelos de lenguaje, agravado aquí por el proceso de merge, que puede producir comportamientos menos predecibles que un modelo entrenado de forma monolítica.
- Tendencia a «sobreplanificar»: el propio autor reconoce que el ratio de Ornith puede dominar a los demás modelos, y la versión V2.1 se anuncia precisamente para corregirlo; la V2 aquí descrita puede gastar tokens excesivos en razonamiento.
- Modelo derivado de un VLM (MiniCPM-V) publicado como text-generation: no hay confirmación de que las capacidades de visión se conserven, y la cuantización APEX está calibrada solo con texto.
- Repositorio con muy poca tracción (16 descargas, 0 likes, creado y actualizado en octubre de 2026 en un intervalo de dos días): no hay validación comunitaria ni informes independientes de calidad.
- La versión V2.1 está anunciada como «subiendo» en la model card, por lo que los pesos actuales pueden quedar obsoletos en breve.
- Uso de cuantizaciones GGUF: la pérdida de precisión en un MoE con expertos poco activados puede degradar el rendimiento de forma desigual entre tareas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DarkKitsune/Qwen3.6-Qworus-35B-A3B-V2-APEX-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Contribuyente de código: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Contribuyente agéntico y de terminal: https://huggingface.co/Accio-Lab/occamy-1.0
- Contribuyente de razonamiento y planificación: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- llama.cpp (runtime compatible con GGUF): https://github.com/ggml-org/llama.cpp

Nota: la búsqueda web realizada no devolvió ningún resultado pertinente al modelo (los resultados obtenidos trataban sobre especies de reptiles), por lo que no hay papers, blogs ni demos adicionales que enlazar.
