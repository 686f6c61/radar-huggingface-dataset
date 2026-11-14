# KevinOchoa/TwIL-8B-Abliterated-Uncensored-Q4_K_M-GGUF

## Resumen

TwIL-8B-Abliterated-Uncensored-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Guilherme34/TwIL-8B-Abliterated-Uncensored, un modelo de lenguaje de aproximadamente 8.800 millones de parámetros. Esta versión concreta ha sido generada por el usuario KevinOchoa mediante el espacio GGUF-my-repo de ggml.ai, que automatiza la conversión de pesos a formato GGUF usando llama.cpp. El resultado es un único fichero de unos 5,3 GB con cuantización Q4_K_M, pensado para inferencia local con dicha herramienta.

El modelo base pertenece a la familia de los denominados "abliterated uncensored", una técnica de modificación de pesos que busca eliminar o atenuar el comportamiento de rechazo aprendido durante el alineamiento, de forma que el modelo responda a peticiones que un modelo alineado rechazaría. No obstante, la model card de esta cuantización no aporta información sobre el proceso de entrenamiento, la composición del dataset ni los datos originales del modelo base.

La relevancia de esta ficha es limitada: se trata de una conversión automática sin documentación técnica propia, con cero descargas y cero likes en el momento de la consulta, y sin licencia ni idiomas declarados. Cualquier evaluación rigurosa debería remitirse al modelo base original, cuya model card no forma parte de la información disponible. Los datos que se ofrecen a continuación se limitan a lo verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, no confirmado en la información) |
| Parametros totales | 8.791.592.960 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero no es una especificación del modelo) |
| Tipos de cuantizacion | Q4_K_M (única variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `twil-8b-abliterated-uncensored-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. El nombre (TwIL-8B) y el recuento de parámetros (8.791.592.960) son consistentes con un transformer decoder-only de la familia Llama, pero esto no está confirmado en la documentación proporcionada. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni si emplea alguna variante como GQA.

Respecto al entrenamiento, la model card de esta cuantización no describe el proceso: no hay datos sobre número de tokens, composición del corpus, fases de SFT, RLHF o DPO. El calificativo "Abliterated" en el nombre del modelo sugiere una intervención sobre los pesos orientada a suprimir el comportamiento de rechazo, pero no se documentan ni el método exacto ni el alcance de dicha modificación. La única información técnica concreta es que la conversión a GGUF se realizó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai.

## Capacidades

- Generación de texto autoregresiva en formato GGUF para llama.cpp.
- Compatibilidad con `llama-cli` y `llama-server` según los ejemplos de la model card.
- Etiqueta `endpoints_compatible`, lo que indica que puede servirse a través de endpoints compatibles con la infraestructura de Hugging Face.
- Comportamiento presuntamente menos restrictivo que un modelo alineado convencional, según la denominación "Uncensored" y "Abliterated" del modelo base.
- Soporte de tool calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Inferencia local en estación de trabajo: el fichero Q4_K_M de 5,3 GB cabe en GPUs de consumo con 8 GB o más de VRAM y permite ejecutar el modelo sin conexión mediante `llama-cli`.
- Servidor HTTP ligero para prototipado: `llama-server` expone una API compatible con OpenAI, útil para integrar el modelo en un front-end o en un script de pruebas con `-c 2048` de contexto.
- Experimentación con modelos sin alineamiento: útil para investigación sobre comportamiento de modelos "abliterated" y comparación con sus versiones alineadas, siempre en entornos controlados.
- Generación creativa sin filtros: escritura de ficción, guiones o role-play donde el usuario busca respuestas no censuradas, asumiendo la responsabilidad del contenido generado.
- Evaluación de cuantizaciones: al ser una conversión Q4_K_M, sirve para medir la degradación de calidad respecto al modelo base en tareas de generación libre.
- Pruebas de pipelines GGUF: banco de pruebas para validar flujos de despliegue con llama.cpp, CUDA y contenedores antes de pasar a modelos con licencia y soporte documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,3 GB solo para los pesos en Q4_K_M; con overhead de contexto y caché KV, prever entre 6 y 7 GB para contextos moderados (2048-4096 tokens).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en el segmento profesional, A100 o H100 si se busca throughput alto con llama.cpp.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060, etc.); también puede ejecutarse en CPU con llama.cpp, a menor velocidad.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier front-end compatible con GGUF como Ollama o LM Studio (no confirmado explícitamente en la model card).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwIL-8B-Abliterated-Uncensored-Q4_K_M-GGUF (este) | 8,79 B | no disponible | GGUF | no disponible | Hugging Face, 0 descargas |
| Guilherme34/TwIL-8B-Abliterated-Uncensored (base) | 8,79 B | no disponible | safetensors (presumible) | no disponible | Hugging Face |
| Alternativas de 8B "uncensored" | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial; conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en producción.
- Modelo "uncensored"/"abliterated": es previsible que genere contenido que los modelos alineados rechazan; requiere moderación externa y políticas de uso claras si se expone a usuarios finales.
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas, agravado por la falta de documentación sobre el entrenamiento.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- Contexto no especificado: el ejemplo de la model card usa 2048 tokens, pero no se confirma la ventana máxima real del modelo.
- Cuantización Q4_K_M: introduce pérdida de precisión respecto al modelo base, especialmente en tareas de razonamiento y matemáticas.
- Conversión automática sin validación documentada por parte del autor de la cuantización.
- Cero descargas y cero likes: sin evidencia de uso comunitario ni de revisión por terceros.
- Fecha de creación indicada como 2026-11-14, posterior a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/KevinOchoa/TwIL-8B-Abliterated-Uncensored-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Guilherme34/TwIL-8B-Abliterated-Uncensored
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
