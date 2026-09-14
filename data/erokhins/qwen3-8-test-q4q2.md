# erokhins/Qwen3.8-test-Q4Q2

# Qwen3.8-test-Q4Q2: cuantización mixta Q4/Q2 experimental en GGUF

## Resumen

Qwen3.8-test-Q4Q2 es un artefacto experimental publicado por el usuario erokhins en HuggingFace. Se trata de un modelo Qwen de 27.320.697.856 parámetros (27,3 mil millones) obtenido mediante una fusión al 50/50 de los pesos de Qwen/Qwen3.6-27B (modelo base declarado) y Qwen3.8-27B, al que después se le aplica una cuantización Q4_0 de llama.cpp con una emulación de precisión mixta sobre las capas FFN. No es un modelo entrenado desde cero ni afinado: es un ejercicio de compresión post-hoc.

La innovación concreta es la mezcla de precisión dentro del FFN. Por cada capa, el 25% de los canales considerados más estables frente al drift (medidos por el coseno mínimo de las filas gate/up/down entre Qwen3.6 y Qwen3.8) conservan sus códigos de 4 bits completos, mientras que el 75% restante se reduce a 2 bits efectivos redondeando sus códigos Q4_0 al conjunto {0, 4, 8, 12} (patrón `xy00`), sin tocar las escalas de bloque. Es una emulación, no un formato nativo: el fichero sigue siendo un Q4_0 estándar de ~15,5 GB. Una implementación nativa con tensores divididos daría ~3,6 bits por peso y ~12,3 GB.

Su relevancia práctica es doble. Por un lado, sirve como banco de pruebas reproducible para medir el coste real de bajar a 2 bits canales inestables sin cambiar el tamaño del fichero. Por otro, incluye la cabeza MTP (capa nextn) en Q4_0 completo, lo que habilita decodificación especulativa con autodrafting en llama.cpp: el autor reporta 46-48 tok/s de decodificación en un Mac con Apple Silicon y Metal, con una tasa de aceptación de draft del 65-79% y una cadena media aceptada de ~3,3 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (configuración de capas y atención no detallada en la información disponible) |
| Parámetros totales | 27.320.697.856 (27,3 mil millones) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_0 con emulación mixta Q4/Q2 en el FFN: 4 bits en el 25% de canales por capa, 2 bits efectivos en el 75% restante |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero de ~15,5 GB, repositorio de 31,2 GB |
| Modelo base | Qwen/Qwen3.6-27B (el merge incorpora además pesos de Qwen3.8-27B) |
| Plantilla de chat | la de Qwen3.8 |
| Cabeza MTP | incluida (capa nextn), mantenida en Q4_0 completo |
| Fecha de publicación | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay entrenamiento implicado. El proceso consiste en una fusión de pesos al 50/50 entre Qwen3.6-27B y Qwen3.8-27B, seguida de una cuantización a Q4_0 con llama.cpp. Sobre ese Q4_0 se aplica la emulación mixta: el criterio de selección de canales es el coseno mínimo de las filas gate, up y down entre los dos checkpoints de origen, de modo que los canales con mayor coincidencia direccional (menor drift) mantienen 4 bits y el resto se degrada a 2 bits efectivos. Las escalas de bloque permanecen intactas, por lo que la degradación se concentra exclusivamente en los códigos de los pesos de los canales inestables. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, ya que corresponden a los modelos base.

El elemento técnico más aprovechable es la cabeza MTP. Al conservarse en Q4_0 completo, permite autodrafting especulativo dentro del propio modelo, sin necesidad de un modelo draft separado, mediante la opción `--spec-type draft-mtp` de `llama-server`. El autor reporta que las pruebas de humo a temperatura 0 son indistinguibles de la línea base Q4_0 plana, lo que sugiere que la pérdida por la reducción a 2 bits no es evidente en generación determinista, aunque no se aportan métricas de calidad (perplejidad, evaluaciones, etc.) que lo confirmen.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y emplea la plantilla de chat de Qwen3.8.
- Modo thinking: la plantilla activa el razonamiento explícito, que puede consumir varios cientos de tokens antes de emitir la respuesta final.
- Decodificación especulativa con autodrafting: soportada de forma nativa gracias a la cabeza MTP incluida en el GGUF.
- Compatibilidad con Inference Endpoints de HuggingFace: el repositorio incluye la etiqueta `endpoints_compatible`.
- Capacidades heredadas de la familia Qwen3 (razonamiento, código, matemáticas, multilingüismo): esperables por herencia de los modelos base, pero no verificadas ni documentadas en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (no hay indicios de multimodalidad).

## Casos de uso

- Investigación en cuantización mixta: comparar directamente un Q4_0 plano con esta emulación Q4/Q2 a igual tamaño de fichero (~15,5 GB) permite aislar el efecto de degradar canales FFN inestables sin confundirlo con el ahorro de memoria.
- Pruebas de decodificación especulativa con MTP: medir la tasa de aceptación del draft y el throughput con `llama-server --spec-type draft-mtp` en distintos hardware, usando los 46-48 tok/s y el 65-79% de aceptación como referencia inicial.
- Prototipado local en Apple Silicon: con 15,5 GB de pesos cabe en equipos con memoria unificada de 24-32 GB y ofrece velocidad de decodificación interactiva, adecuada para pruebas y demos.
- Estudio de drift entre checkpoints: la metodología de coseno mínimo sobre filas gate/up/down es reutilizable para analizar la estabilidad de canales entre dos versiones de una misma familia de modelos.
- Base para un formato Q4/Q2 nativo: el autor estima que una implementación real de tensores divididos daría ~3,6 bits por peso y ~12,3 GB, por lo que este repositorio sirve de referencia de calidad para validar ese futuro formato.
- Generación de texto con razonamiento en entornos de investigación: útil para explorar respuestas con cadena de pensamiento en tareas de análisis, siempre que se presupueste el coste extra de tokens del modo thinking.
- Despliegue interno no crítico: chat de uso interno o asistentes de documentación donde la licencia apache-2.0 y el coste reducido pesan más que la ausencia de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta pruebas de humo cualitativas y mediciones de velocidad en Apple Silicon con Metal:

| Métrica | Valor reportado | Condiciones |
|---|---|---|
| Velocidad de decodificación | 46-48 tok/s | Apple Silicon, backend Metal, con draft MTP |
| Tasa de aceptación del draft MTP | 65-79% | misma configuración |
| Longitud media de cadena aceptada | ~3,3 tokens | misma configuración |
| Calidad frente a Q4_0 plano | indistinguible en pruebas de humo a T=0 | sin métricas cuantitativas |

No hay datos de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación estandarizada, ni comparaciones cuantitativas con los modelos de origen.

## Requisitos de hardware

- VRAM para pesos: el fichero GGUF ocupa ~15,5 GB, por lo que se necesitan aproximadamente 16 GB solo para los pesos en Q4_0.
- VRAM total estimada: entre 18 y 24 GB para contexto moderado con caché KV, cifra estimada a partir del tamaño del fichero y no confirmada por el autor.
- GPU consumer: cabe ajustadamente en una RTX 4090 o RTX 3090 de 24 GB. En GPUs de 16 GB el margen es muy escaso o nulo.
- Apple Silicon: es la plataforma validada por el autor; requiere equipos con 24-32 GB de memoria unificada o superior.
- GPU profesionales: A100 40/80 GB, H100 y A6000 48 GB admiten el modelo con holgura y contexto amplio.
- Almacenamiento: el repositorio completo ocupa 31,2 GB, el doble que el fichero GGUF de ~15,5 GB.
- Despliegue: la vía soportada es llama.cpp (`llama-server`, `llama-cli`) con `--spec-type draft-mtp` para activar la decodificación especulativa. También es importable en Ollama y LM Studio al ser GGUF estándar. No se recomienda vLLM ni TGI, que no soportan Q4_0 GGUF de forma nativa.
- Latencia y throughput: 46-48 tok/s de decodificación en Apple Silicon con Metal y draft MTP activo. No hay mediciones publicadas en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| erokhins/Qwen3.8-test-Q4Q2 | 27,3 mil millones | no disponible | GGUF Q4_0 con emulación Q4/Q2 en FFN | apache-2.0 | 0 descargas, 0 likes; repositorio de 31,2 GB |
| Qwen/Qwen3.6-27B (modelo base) | 27,3 mil millones (según los pesos de este derivado) | no disponible | pesos originales en safetensors | no disponible | no disponible |
| Qwen3.8-27B (usado en el merge) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Derivado Q4_0 plano del mismo merge (línea base) | 27,3 mil millones | no disponible | GGUF Q4_0 sin mezcla | apache-2.0 | no disponible como artefacto independiente |

La única comparación con datos es frente al Q4_0 plano, del que el autor afirma que no se distingue en pruebas de humo a temperatura 0. No hay información suficiente para comparar con alternativas de terceros de la misma categoría (por ejemplo, otras cuantizaciones de la familia Qwen3): no disponible.

## Limitaciones y advertencias

- Carácter experimental: el repositorio acumula 0 descargas y 0 likes, sin validación independiente ni revisión de la comunidad.
- La mezcla de precisión es una emulación, no un formato nativo: el fichero no ahorra espacio respecto a un Q4_0 convencional (~15,5 GB) y la reducción a 2 bits solo afecta al contenido informativo.
- El 75% de los canales FFN de cada capa se degrada a 2 bits efectivos, por lo que la pérdida de calidad se concentra en esas proyecciones y puede no manifestarse en pruebas cortas o deterministas.
- Ausencia total de benchmarks: solo hay pruebas de humo cualitativas, sin perplejidad ni evaluaciones estandarizadas, lo que impide cuantificar el impacto real de la degradación.
- Inconsistencia potencial de la plantilla: el repositorio declara Qwen3.6-27B como modelo base, pero emplea la plantilla de chat de Qwen3.8. Conviene verificar el emparejamiento plantilla/pesos antes de usarlo.
- Nomenclatura no verificable: los identificadores Qwen3.6 y Qwen3.8 proceden exclusivamente de los metadatos del autor y no se han podido confirmar con otras fuentes.
- Modo thinking activado por defecto: puede consumir varios cientos de tokens antes de la respuesta, lo que incrementa la latencia y el coste en producción.
- Sin información sobre sesgos, alineación, idiomas soportados ni longitud de contexto.
- Riesgo de alucinación: no evaluado; se desconoce el comportamiento en dominios factuales.
- Licencia: el repositorio se publica como apache-2.0, pero conviene verificar las condiciones de los modelos de origen antes de un uso comercial.
- No apto para producción crítica: sin métricas de calidad, sin soporte y con una fecha de publicación muy reciente.
- La búsqueda web no devolvió resultados relevantes sobre este modelo; la información disponible se limita a su model card y a los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erokhins/Qwen3.8-test-Q4Q2
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.6-27B
- llama.cpp (implementación de referencia para GGUF y decodificación especulativa MTP): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
- Los resultados de la búsqueda web no contenían referencias relevantes al modelo
