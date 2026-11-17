# LlamaPal/Ternary-Bonsai-8B-Q2_0_g64-GGUF

## Resumen

Ternary-Bonsai-8B-Q2_0_g64-GGUF es una cuantización GGUF de tipo Q2_0 con grupo de 64 pesos del modelo Ternary-Bonsai-8B, desarrollado originalmente por PrismML. El repositorio lo publica LlamaPal como espejo sin modificar del fichero oficial, empaquetado para su uso en la aplicación móvil LlamaPal para Android, que permite ejecutar el modelo de forma completamente offline en el teléfono. El modelo base tiene 8.188.548.096 parámetros y el fichero GGUF ocupa 2,3 GB, lo que lo sitúa en la franja de modelos de 8B comprimidos para despliegue en dispositivos con recursos limitados.

La propuesta técnica es la cuantización ternaria (pesos en {-1, 0, +1} agregados en grupos de 64 con escalas) combinada con un esquema Q2_0 de llama.cpp, que reduce drásticamente el peso en disco y en memoria frente a un 8B en FP16 (unos 16 GB). El objetivo es acercar la calidad de un modelo de 8B a teléfonos de gama media-alta, sin conexión y sin enviar datos a servidores externos.

Es relevante ahora porque demuestra que la inferencia local de modelos de clase 8B en móviles es viable con cuantizaciones agresivas, y porque el ecosistema llama.cpp ya soporta estos formatos de forma nativa. La información pública disponible es escasa: no hay datos de benchmarks, idiomas soportados ni detalles del entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (deducido del modelo base de 8B; el autor no especifica detalles) |
| Parámetros totales | 8.188.548.096 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_0 con grupo de 64 (Q2_0_g64); el repo contiene únicamente este fichero |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Ternary-Bonsai-8B en la documentación proporcionada. Por el nombre y el tamaño (8.188.548.096 parámetros) se trata de un transformer de aproximadamente 8B parámetros, pero el autor no publica en esta ficha el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto nativa. Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado.

La innovación técnica destacable es la cuantización ternaria: los pesos se representan en tres valores (-1, 0, +1) agrupados en bloques de 64 con un factor de escala por grupo, lo que permite almacenar un 8B en 2,3 GB. El esquema Q2_0 de llama.cpp implementa esta representación de forma nativa, de modo que la decodificación puede ejecutarse en CPU sin kernels personalizados. No se documenta si el modelo base fue entrenado desde cero con pesos ternarios (ternary-aware training) o si la ternarización se aplicó post-entrenamiento; el sufijo "unpacked" del modelo base sugiere que existe una versión desempaquetada de referencia para inspección o reconversión.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica uso previsto para chat multi-turno.
- Ejecución offline en Android: el modelo está empaquetado para la app LlamaPal, que descarga el fichero y lo ejecuta sin conexión.
- Compatibilidad con llama.cpp: al ser un GGUF estándar, carga en llama.cpp y en cualquier aplicación construida sobre él.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse con infraestructura compatible con la API de Hugging Face.
- Capacidades de razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Chat privado en el móvil sin conexión: el usuario instala LlamaPal, descarga el GGUF de 2,3 GB y conversa con el modelo sin que ningún dato salga del dispositivo; adecuado para consultas sensibles o en entornos sin red.
- Asistente personal en viajes o zonas sin cobertura: al ejecutarse íntegramente en local, el modelo sigue disponible en aviones, zonas rurales o países con roaming restringido.
- Prototipado rápido de aplicaciones Android con IA: un desarrollador puede integrar el GGUF en una app basada en llama.cpp y validar flujos conversacionales sin depender de APIs de pago ni de latencia de red.
- Evaluación de cuantizaciones ternarias: investigadores pueden comparar la calidad de Q2_0_g64 frente al modelo base desempaquetado para estudiar el impacto de la ternarización en tareas concretas.
- Despliegue en hardware de bajos recursos: con 2,3 GB de pesos, el modelo puede correr en dispositivos con 4-6 GB de RAM, incluyendo mini-PC, Raspberry Pi de gama alta o portátiles antiguos vía llama.cpp.
- Base para fine-tuning o experimentación con llama.cpp: al ser un GGUF estándar, sirve como punto de partida para probar pipelines de inferencia y comparar rendimiento en CPU frente a otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,3 GB solo para los pesos; con overhead de contexto y buffers de llama.cpp, se recomienda un mínimo de 3-4 GB de RAM libre.
- GPU recomendadas: no disponible; el formato está pensado para CPU y ejecución en móvil, no se documentan requisitos de GPU.
- ¿Cabe en GPU consumer? Sí, cualquier GPU con 4 GB o más de VRAM puede alojarlo, aunque el caso de uso principal es CPU/móvil.
- Opciones de despliegue: llama.cpp (nativo), LlamaPal (Android), cualquier app basada en llama.cpp; vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponible; dependerá del SoC del teléfono y del número de hilos configurados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-8B-Q2_0_g64 (este) | 8.188.548.096 | no disponible | Q2_0_g64, 2,3 GB | Apache 2.0 | GGUF en HF |
| Llama 3.1 8B Instruct (Q4_K_M) | ~8B | 128K | Q4_K_M, ~4,9 GB | Llama 3.1 Community | GGUF en HF |
| Qwen2.5 7B Instruct (Q4_K_M) | ~7,6B | 32K | Q4_K_M, ~4,7 GB | Apache 2.0 | GGUF en HF |
| Mistral 7B Instruct v0.3 (Q4_K_M) | ~7,2B | 32K | Q4_K_M, ~4,4 GB | Apache 2.0 | GGUF en HF |

La ventaja principal de este modelo frente a las alternativas es el tamaño (2,3 GB frente a 4,4-4,9 GB en Q4_K_M), lo que lo hace viable en móviles con menos RAM. La contrapartida es que la cuantización ternaria Q2_0 es más agresiva que Q4_K_M y, previsiblemente, degrada más la calidad, aunque no hay benchmarks públicos que lo cuantifiquen en la información disponible.

## Limitaciones y advertencias

- Calidad degradada por cuantización agresiva: Q2_0 con grupo de 64 es una cuantización de muy baja precisión; es esperable una pérdida de calidad frente al modelo base, aunque no se documenta su magnitud.
- Sin benchmarks publicados: no hay datos objetivos de MMLU, HumanEval, GSM8K ni otras métricas para evaluar su rendimiento real.
- Idiomas no especificados: se desconoce si el modelo soporta castellano con calidad suficiente; el autor no declara la lista de idiomas.
- Contexto desconocido: no se indica la longitud de contexto nativa ni la soportada tras la cuantización, lo que limita el diseño de aplicaciones con conversaciones largas.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación; al ser un modelo conversacional de 8B, es esperable que alucine en tareas factuales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el repositorio es un espejo; conviene revisar la licencia y términos del repositorio original de PrismML antes de redistribuir.
- Repositorio espejo sin soporte: LlamaPal no ofrece soporte técnico sobre el modelo; las incidencias deben dirigirse al repositorio original de PrismML.
- Madurez del formato ternario: la cuantización ternaria en llama.cpp es relativamente reciente; pueden aparecer problemas de compatibilidad con versiones antiguas del runtime.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/Ternary-Bonsai-8B-Q2_0_g64-GGUF
- Repositorio original del GGUF (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-8B-gguf
- Modelo base desempaquetado: https://huggingface.co/prism-ml/Ternary-Bonsai-8B-unpacked
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
