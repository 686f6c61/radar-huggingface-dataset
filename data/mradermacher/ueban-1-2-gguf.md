# mradermacher/ueban-1.2-GGUF

## Resumen
`ueban-1.2-GGUF` es una cuantización en formato GGUF del modelo `RaspizdAI/ueban-1.2`, realizada por el usuario `mradermacher`. Se trata de un modelo de lenguaje muy pequeño, con solo 83,1 millones de parámetros, lo que lo sitúa en la categoría de modelos compactos, probablemente adecuado para entornos con recursos muy limitados o para experimentación. No se dispone de documentación oficial sobre su arquitectura o entrenamiento, pero los metadatos indican que fue entrenado sobre corpus de texto ruso (PotatoHD/ru-text-corpus y d0rj/alpaca-cleaned-ru) y se etiqueta como conversacional. La relevancia actual de esta ficha radica en que ofrece una versión cuantizada lista para usar con herramientas como llama.cpp, aunque su pequeño tamaño y la falta de información limitan su uso a tareas muy sencillas.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 83.112.448 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (según metadatos; los datasets de entrenamiento son en ruso) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento
No se ha publicado información detallada sobre la arquitectura del modelo base `RaspizdAI/ueban-1.2`. Dado su tamaño de 83M parámetros, es probable que se trate de un transformer pequeño, pero no se puede confirmar. Los datasets listados en la model card (`PotatoHD/ru-text-corpus` y `d0rj/alpaca-cleaned-ru`) sugieren que el entrenamiento se realizó sobre texto ruso, aunque el modelo se etiqueta como "en" (inglés). No hay indicios de técnicas como RLHF o DPO. La cuantización fue realizada por `mradermacher` mediante conversión estática a GGUF, sin usar imatrix ni pesos ponderados.

## Capacidades
- Generación de texto básica: puede producir respuestas coherentes en frases cortas, pero su tamaño limita la complejidad.
- Conversación simple: etiquetado como "conversational", puede mantener diálogos breves, aunque con errores frecuentes.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: aunque se etiqueta como inglés, su entrenamiento en ruso sugiere que podría tener cierto conocimiento en ese idioma, pero no se garantiza.
- Otras capacidades (visión, audio, thinking mode): no disponibles.

## Casos de uso
- **Prototipado rápido en entornos con muy pocos recursos**: al ser un modelo de 83M y con cuantizaciones de 0,1-0,3 GB, puede ejecutarse en una CPU de cualquier portátil o incluso en una Raspberry Pi, permitiendo probar pipelines de generación de texto sin necesidad de GPU.
- **Pruebas de integración con llama.cpp**: para desarrolladores que quieran validar la compatibilidad de su infraestructura con GGUF y modelos pequeños antes de pasar a otros más grandes.
- **Chatbots de juguete**: para un bot de conversación trivial en aplicaciones de demostración o en juegos, donde la calidad del lenguaje no es crítica.
- **Aprendizaje de cuantización**: sirve como ejemplo para estudiar el impacto de distintos niveles de cuantización (Q2_K a Q8_0) en un modelo pequeño, útil para fines educativos.
- **Generación de texto en ruso**: aunque el modelo se etiqueta en inglés, su entrenamiento en ruso podría permitir generar texto ruso básico, útil para tareas de relleno o clasificación sencilla.
- **Evaluación de licencias**: al ser MIT, se puede usar en proyectos comerciales sin restricciones, lo que lo hace atractivo para pruebas de concepto empresariales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo.

## Requisitos de hardware
- VRAM estimada: menos de 1 GB para las cuantizaciones más bajas (Q2_K, Q3_K_*). Las cuantizaciones mayores (Q8_0, f16) pueden requerir hasta 0,5-0,8 GB de VRAM si se ejecutan en GPU.
- GPU recomendadas: cualquier GPU con 1 GB de VRAM o más (por ejemplo, NVIDIA GTX 1050, integradas recientes). También se ejecuta en CPU sin problemas.
- Compatibilidad con GPU consumer: sí, incluso en tarjetas muy modestas.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio, etc. Se puede usar con TGI (Text Generation Inference) si se convierte a formato de safetensors, pero no es habitual.
- Latencia y throughput: para un modelo de este tamaño, la generación es muy rápida en CPU (decenas de tokens por segundo) y en GPU aún más, pero no hay datos exactos publicados.

## Comparativa con modelos similares
No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El tamaño de 83M es inusual para modelos de lenguaje modernos; la mayoría de modelos comparables (como GPT-2 pequeño, distilgpt2) tienen arquitecturas y entrenamientos conocidos, pero no hay datos de rendimiento de `ueban-1.2` para establecer una comparación. Por tanto, se indica: no disponible.

## Limitaciones y advertencias
- Capacidad muy limitada: con 83M parámetros, el modelo no puede generar texto complejo, razonar ni seguir instrucciones largas. Es probable que produzca respuestas incoherentes o repetitivas.
- Sesgos de idioma: aunque se etiqueta como inglés, los datos de entrenamiento son en ruso, lo que puede provocar una mezcla de idiomas o un desempeño deficiente en inglés.
- Riesgo de alucinación: al ser pequeño, es propenso a inventar datos o repetir información de forma errónea.
- Contexto limitado: no se especifica la longitud de contexto, pero es de esperar que sea corta (512-1024 tokens), insuficiente para conversaciones largas.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base podría tener restricciones adicionales no documentadas. Se recomienda revisar el repositorio original.
- Sin garantía de soporte: el repo tiene 0 descargas y 0 likes, lo que indica que no hay comunidad activa ni actualizaciones.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/ueban-1.2-GGUF
- Modelo base: https://huggingface.co/RaspizdAI/ueban-1.2
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Página de solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
