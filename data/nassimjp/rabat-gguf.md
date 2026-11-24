# nassimjp/Rabat-GGUF

## Resumen

Rabat-GGUF es una conversión al formato GGUF del modelo Hunyuan-0.5B-Instruct, publicada por el usuario nassimjp en Hugging Face. Se trata, por tanto, de un artefacto de cuantización y empaquetado para inferencia local con llama.cpp, no de un modelo entrenado desde cero por este autor. El modelo base pertenece a la familia Hunyuan de Tencent, en su variante densa de 0,5 mil millones de parámetros (arquitectura etiquetada como `hunyuan_v1_dense` en los metadatos del repositorio).

El interés práctico de esta publicación reside en su reducido tamaño: con unos 539 millones de parámetros y un repositorio de 0,4 GB, el modelo está pensado para ejecutarse en hardware muy modesto, incluyendo CPU y GPU de consumo con poca VRAM, mediante llama.cpp. El único fichero publicado es una cuantización Q4_K_M, un compromiso habitual entre calidad y tamaño para modelos pequeños.

La información disponible es muy limitada: el repositorio no declara licencia, idiomas ni pipeline, no incluye resultados de benchmarks y registra cero descargas y cero likes en el momento de la consulta. La model card se limita a indicar el procedimiento de conversión con Unsloth y un ejemplo de invocación con `llama-cli`, sin documentar el entrenamiento ni las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `hunyuan_v1_dense` en los metadatos) |
| Parametros totales | 539.010.048 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 0,4 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El repositorio no contiene información sobre la arquitectura interna ni sobre el proceso de entrenamiento. Los metadatos identifican la arquitectura como `hunyuan_v1_dense`, lo que indica un transformer denso de la familia Hunyuan v1, sin mezcla de expertos. Con 539 millones de parámetros, se sitúa en la gama de modelos pequeños orientados a instrucciones y conversación, aunque no se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La única innovación técnica documentada es el propio proceso de conversión: el autor indica que el GGUF se generó con Unsloth, una herramienta habitualmente empleada para acelerar el ajuste fino y la exportación de modelos. La model card menciona tanto el uso con `llama-cli` para modelos de solo texto como con `llama-mtmd-cli` para modelos multimodales, pero no aclara si el modelo base tiene capacidades multimodales; dado el tamaño y la etiqueta de arquitectura, lo probable es que sea un modelo de texto, pero no puede confirmarse con la información disponible.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el sufijo `Instruct` del modelo base indican ajuste para seguir instrucciones y mantener diálogos multi-turno.
- Compatibilidad con llama.cpp: el formato GGUF y el ejemplo con `--jinja` sugieren soporte de plantillas de chat Jinja para formatear conversaciones.
- Ejecución local en hardware limitado: el tamaño de 0,5B permite inferencia en CPU y en GPU de gama baja.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia compatible.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).

## Casos de uso

- Prototipado rápido de asistentes conversacionales: con 0,5B de parámetros y cuantización Q4_K_M, el modelo puede levantarse en un portátil con llama.cpp para validar prompts, plantillas de chat y flujos de conversación antes de migrar a un modelo mayor.
- Inferencia en dispositivos con recursos muy limitados: su tamaño reducido permite desplegarlo en CPU o en GPU de consumo con poca VRAM, útil para demos offline, entornos embebidos o pruebas de concepto en máquinas sin acelerador dedicado.
- Filtrado y clasificación de texto ligera: tareas de etiquetado, resumen corto o reformulación de textos donde la latencia y el coste importan más que la calidad máxima, aprovechando que el modelo cabe holgadamente en memoria.
- Generación de texto auxiliar en pipelines: borradores, respuestas plantilla o expansión de consultas dentro de un sistema mayor, donde el modelo actúa como componente barato y sustituible.
- Evaluación de la cadena de herramientas GGUF: sirve como caso de prueba para validar flujos de conversión con Unsloth, carga con `llama-cli --jinja` y despliegue con servidores compatibles con endpoints.
- Experimentación educativa: al ser un modelo pequeño y de código abierto en formato GGUF, es adecuado para estudiar cuantización, plantillas de chat y comportamiento de modelos instruct en laboratorios y cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 539 millones de parámetros en Q4_K_M, el fichero pesa del orden de 0,3-0,4 GB; la VRAM necesaria es de aproximadamente 1 GB incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso una iGPU reciente pueden ejecutarlo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna y en muchas integradas.
- Ejecución en CPU: viable, dado el reducido número de parámetros; es uno de los escenarios naturales para este tamaño.
- Opciones de despliegue: llama.cpp (`llama-cli -hf nassimjp/Rabat-GGUF --jinja`, según la model card), servidores compatibles con endpoints y, presumiblemente, Ollama u otros frontends sobre llama.cpp, aunque no se documenta explícitamente.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, pero por tamaño se esperan decenas de tokens por segundo en CPU moderna y muy alta velocidad en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rabat-GGUF (Hunyuan-0.5B-Instruct Q4_K_M) | 539 M | no disponible | no disponible | GGUF | Conversión comunitaria con Unsloth; sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32 K (según documentación del modelo base) | Apache 2.0 (según documentación del modelo base) | safetensors, GGUF | Familia ampliamente documentada y con benchmarks públicos |
| Llama 3.2 1B Instruct | 1,2 B | 128 K (según documentación del modelo base) | Licencia comunitaria Llama (según documentación del modelo base) | safetensors, GGUF | Algo mayor; requiere más memoria pero ofrece más capacidad |
| SmolLM2-360M-Instruct | 0,36 B | 8 K (según documentación del modelo base) | Apache 2.0 (según documentación del modelo base) | safetensors, GGUF | Alternativa aún más pequeña para entornos muy restringidos |

La comparación es aproximada: para Rabat-GGUF no hay datos publicados de contexto, licencia ni rendimiento, por lo que las filas de los modelos alternativos reflejan únicamente la documentación pública de sus modelos base y deben verificarse antes de usarse en producción.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento o seguimiento de instrucciones de esta conversión concreta.
- Licencia no declarada: el repositorio no indica licencia, lo que impide confirmar si el uso comercial está permitido; hay que remitirse a la licencia del modelo base Hunyuan-0.5B-Instruct, que no se proporciona en la información disponible.
- Idiomas no documentados: se desconoce qué lenguas cubre el modelo base y con qué calidad; no debe asumirse soporte fiable del castellano.
- Riesgo de alucinación: como todo modelo generativo pequeño, la probabilidad de respuestas incorrectas o inventadas es alta, especialmente en tareas de conocimiento factual.
- Capacidad limitada por tamaño: con 0,5B de parámetros, el rendimiento en razonamiento complejo, matemáticas y código será notablemente inferior al de modelos de 7B o más.
- Contexto desconocido: no se documenta la longitud de ventana, lo que impide planificar conversaciones largas o procesamiento de documentos extensos.
- Un solo fichero de cuantización: solo se ofrece Q4_K_M; no hay variantes Q8_0, Q5_K_M ni F16 para quienes necesiten mayor fidelidad.
- Procedencia comunitaria: al ser una conversión de un tercero y no una publicación oficial, no hay garantía de que el GGUF reproduzca fielmente el comportamiento del modelo original.
- Contexto de la familia Hunyuan: conviene verificar en la documentación oficial de Tencent los términos de uso y las limitaciones del modelo base antes de cualquier despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nassimjp/Rabat-GGUF
- Unsloth (herramienta de conversión citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado en la model card): https://github.com/ggml-org/llama.cpp
