# guga-guga/GeoPOI

## Resumen

GeoPOI es un modelo de reconocimiento automático del habla (ASR) contextual desarrollado por el usuario guga-guga, construido como un fine-tuning del backbone Qwen/Qwen3-ASR-1.7B-hf. Su particularidad es que incorpora un banco de parámetros regionales y un mecanismo de enrutamiento por audio que permite condicionar la transcripción según un punto de interés (POI) o una región geográfica concreta. El modelo está pensado para escenarios donde el contexto geográfico determina el vocabulario esperado, algo habitual en dominios como la transcripción de nombres de lugares, direcciones o topónimos locales.

El paquete incluye el backbone completo de Qwen3-ASR, el banco regional de 90.760 celdas (con una base compartida de rango 4 y los correspondientes núcleos regionales y coeficientes del factor izquierdo), un módulo Reader, un módulo Span, un Retriever, un Ranker revisado, seis cabeceras de decisión y un Router de audio Near/Far/NONE. La consolidación del banco regional es una compresión sin pérdida del checkpoint V8 entrenado, de modo que las operaciones de selección e inferencia regional se preservan íntegramente.

El modelo declara únicamente el idioma chino (`zh`), tiene un tamaño de repositorio de 7,7 GB y no especifica licencia en la información disponible. Su relevancia radica en el enfoque de ASR contextual guiado por POI, una línea poco frecuente en modelos abiertos, aunque su estado de publicación (0 descargas, 0 likes, sin benchmarks publicados) indica que se trata de un artefacto de investigación más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-ASR) con banco de parametros regionales, Reader, Span, Retriever, Ranker y seis cabeceras de decision; Router de audio Near/Far/NONE |
| Parametros totales | No disponible (backbone base de 1,7B mas modulos condicionales y banco regional de 90.760 celdas) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (`zh`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (repo de 7,7 GB en PyTorch; incluye `joblib` y codigo custom) |

## Arquitectura y entrenamiento

GeoPOI parte del backbone completo de Qwen3-ASR-1.7B y le añade un banco de parámetros regionales organizado en 90.760 celdas. Este banco utiliza una base derecha compartida de rango 4, de la cual las dos primeras filas alimentan el nivel de bajo rango, mientras que se conservan todos los núcleos regionales y coeficientes del factor izquierdo. Sobre esa representación regional operan los módulos Reader, Span, Retriever y un Ranker revisado, junto con seis cabeceras de decisión que determinan cuándo y cómo interviene el contexto regional en la transcripción.

El flujo de inferencia incorpora un Router de audio de una sola cabecera con salidas Near/Far/NONE que decide el alcance de recuperación (recall scope) antes de que la política de decisión original controle la intervención regional posterior y el renderizado literal. El backend offline utiliza prefijos de audio causales reales con Transformers, respetando los permisos de Gate en la primera entrada y en entradas posteriores; recalcula prefijos en lugar de usar la caché de streaming de vLLM de producción. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en chino con backbone Qwen3-ASR de 1,7B parámetros.
- ASR contextual guiado por punto de interés (POI): un identificador público de POI selecciona el contexto observado, no una transcripción ni un objetivo de reconocimiento forzado.
- Condicionamiento por región alternativa mediante `context={'region_id': ..., 'neighborhood_region_ids': [...]}`.
- Enrutamiento de audio Near/Far/NONE para determinar el alcance de recuperación regional.
- Intervención regional condicionada por seis cabeceras de decisión y una política de decisión que puede aceptar o rechazar la intervención (una decisión rechazada omite legítimamente la intervención).
- Renderizado literal controlado por la política de decisión original.
- Procesamiento de audio WAV mono a 16 kHz.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá del ASR ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de topónimos y nombres de lugares: el modelo puede usar el POI o la región como contexto para desambiguar nombres propios locales que un ASR genérico confundiría con palabras comunes, gracias al banco regional de 90.760 celdas.
- Dictado de direcciones postales: al proporcionar el `region_id` adecuado, el modelo restringe el espacio de vocabulario esperado a las entidades de esa zona, reduciendo errores en números de portal y nombres de calle.
- Atención al cliente con base de datos de sedes: en un sistema de atención telefónica, el POI asociado al cliente permite que la transcripción refleje correctamente el nombre de la sucursal o del servicio regional mencionado.
- Investigación en ASR contextual: el paquete completo (Reader, Span, Retriever, Ranker, cabeceras y Router) sirve como base reproducible para estudiar cómo el contexto geográfico condiciona la decodificación en modelos tipo Qwen3-ASR.
- Evaluación de enrutamiento de audio: el Router Near/Far/NONE puede analizarse de forma aislada para estudiar la selección de alcance de recuperación en función de las características del audio de entrada.
- Prototipado de asistentes de navegación o transporte: la transcripción condicionada por región resulta útil en aplicaciones donde el usuario dicta destinos locales y el sistema conoce la zona geográfica del hablante.
- Integración en pipelines de investigación con Transformers: el backend offline permite reproducir prefijos causales reales y verificar los permisos de Gate sin depender de la caché de streaming de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclaman latencias ni resultados de benchmark de producción para el backend offline, ya que este recalcula prefijos en lugar de usar la caché de streaming de vLLM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 7,7 GB y el backbone es de 1,7B parámetros, por lo que en precisión completa se requiere al menos el tamaño del repo más overhead de los módulos condicionales.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del backbone (1,7B) y el repo de 7,7 GB, se necesita una GPU con al menos 16 GB de VRAM en el escenario más ajustado, aunque este dato no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada; el ejemplo de la model card usa `device='cuda'` sin especificar modelo de GPU.
- Opciones de despliegue: el ejemplo oficial usa la clase `GeoPOI` del paquete `geopoi` con Transformers como backend offline. La model card menciona vLLM como backend de producción con caché de streaming, pero el paquete publicado no lo utiliza.
- Latencia y throughput: no disponibles; el autor no reclama métricas de producción para el backend offline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| GeoPOI | 1,7B (backbone) + modulos | No disponible | zh | No disponible | ASR contextual por POI/region |
| Qwen/Qwen3-ASR-1.7B-hf | 1,7B | No disponible | No disponible | No disponible | ASR base sin condicionamiento regional |
| Alternativas ASR contextuales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base del que deriva GeoPOI.

## Limitaciones y advertencias

- El directorio público de POI está restringido a 500 entidades, lo que limita la cobertura del condicionamiento por punto de interés.
- El modelo solo declara soporte para chino (`zh`); no se documentan otros idiomas.
- No se especifica licencia, por lo que el uso comercial queda sin marco legal claro y requiere contactar con el autor.
- No hay benchmarks publicados ni métricas de latencia o throughput de producción; el backend offline recalcula prefijos y no representa el rendimiento del backend vLLM de producción.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (12 de noviembre de 2026), lo que sugiere un artefacto de investigación sin validación externa.
- Una decisión rechazada por las cabeceras omite legítimamente la intervención regional, de modo que el comportamiento contextual no está garantizado en todos los casos.
- El identificador de POI selecciona contexto observado, no una transcripción ni un objetivo de reconocimiento forzado; no debe interpretarse como un mecanismo de corrección garantizada.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un fine-tuning sobre Qwen3-ASR, hereda los sesgos del backbone, que no se detallan.
- El paquete incluye código custom (`custom-code`), `joblib` y safetensors, lo que implica dependencias adicionales y superficie de ejecución de código no auditada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guga-guga/GeoPOI
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
