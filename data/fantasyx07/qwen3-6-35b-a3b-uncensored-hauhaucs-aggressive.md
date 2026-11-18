# fantasyx07/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una variante sin censura (abliterated) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario fantasyx07 bajo el alias HauhauCS. El modelo base es un transformer de mezcla de expertos (MoE) de 34.660.610.688 parámetros totales con aproximadamente 3B activos por token, desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión elimina los mecanismos de rechazo del modelo original manteniendo, según el autor, el 100% de las capacidades del modelo base.

La relevancia de esta ficha radica en dos factores: por un lado, documenta una de las primeras variantes abliterated de la familia Qwen3.6 con soporte multimodal nativo (texto, imagen y vídeo); por otro, introduce el formato de cuantización propietario K_P ("Perfect") del autor, que promete preservar calidad equivalente a 1-2 niveles superiores de cuantización con solo un 5-15% más de tamaño. El modelo se distribuye exclusivamente en GGUF con matrices de importancia (imatrix) y está pensado para ejecutarse en llama.cpp, LM Studio y runtimes compatibles.

El contexto nativo es de 262K tokens, la arquitectura combina atención lineal y atención softmax completa en proporción 3:1, y utiliza 256 expertos con 8 enrutados por token a lo largo de 40 capas. La licencia es Apache 2.0, lo que permite uso comercial, aunque las implicaciones de la eliminación de salvaguardas deben evaluarse con cuidado en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (atención lineal + softmax completa, ratio 3:1), multimodal nativo |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token (256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262.144 tokens (262K) nativo; se recomienda mantener al menos 128K para preservar el modo thinking |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M; mmproj en f16 (899 MB) para visión |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix); el modelo base original en safetensors no se incluye en este repo |
| Capas | 40 |
| Tamaño del repo | 247,4 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer de mezcla de expertos con 40 capas que intercala atención lineal y atención softmax completa en una proporción 3:1, lo que reduce el coste computacional en contextos largos manteniendo la calidad de recuperación de información. Cuenta con 256 expertos de los cuales se enrutan 8 por token, resultando en aproximadamente 3B parámetros activos sobre 35B totales. Es nativamente multimodal, procesando texto, imagen y vídeo mediante un proyector multimodal separado (mmproj) que en esta distribución se ofrece en precisión f16.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO en el modelo base. La variante aquí documentada es una abliteration: se han eliminado las direcciones de activación asociadas a comportamientos de rechazo sin reentrenar el modelo, según declara el autor ("No changes to datasets or capabilities"). Las cuantizaciones se han generado con importance matrix (imatrix) para preservar la calidad de los pesos abliterated, y el formato K_P propietario aplica análisis específico por modelo para retener precisión en las capas más sensibles.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento en modo thinking (por defecto) y modo non-thinking, con parámetros de muestreo recomendados distintos para cada uno.
- Comprensión de imágenes (image-text-to-text) mediante el fichero mmproj; requiere runtime compatible con GGUF multimodal.
- Comprensión de vídeo según las especificaciones del modelo base (texto, imagen, vídeo).
- Capacidades de código y matemáticas heredadas del modelo base Qwen3.6 (nivel no verificado en esta variante).
- Soporte multilingüe: inglés, chino y otros idiomas (etiqueta "multilingual").
- Comportamiento sin rechazos: el autor declara 0/465 rechazos en sus pruebas; puede añadir descargos de responsabilidad breves heredados del entrenamiento base, pero genera el contenido completo solicitado.
- Compatibilidad con llama.cpp, LM Studio y runtimes GGUF estándar (se recomienda `--jinja` para el chat template).
- Tool calling y function calling: no confirmado explícitamente en la información disponible para esta variante; el modelo base Qwen3.6 presumiblemente lo soporta, pero no se verifica aquí.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un MoE multimodal de 35B sin salvaguardas, comparando sus respuestas con las del modelo base para analizar qué direcciones de activación codifican los rechazos. Útil en laboratorios de interpretabilidad.
- Generación de ficción y narrativa sin restricciones temáticas: escritores que necesitan explorar tramas oscuras, violencia o contenido adulto pueden usar el modelo con contexto de 262K para mantener coherencia en novelas largas sin interrupciones por rechazo.
- Análisis de documentos e imágenes extensos: con 262K de contexto y entrada multimodal, se puede procesar un informe escaneado de cientos de páginas junto con diagramas y extraer conclusiones cruzadas en una sola pasada.
- Asistencia en investigación académica sensible: discusión de temas como farmacología, criminología o historia de la violencia donde los modelos alineados tienden a rechazar por precaución excesiva.
- Despliegue local en estaciones de trabajo con GPU consumer: las cuantizaciones IQ3_M (15 GB) o Q4_K_M (21 GB) permiten ejecutar el modelo en una RTX 4090 (24 GB) o en configuraciones con dos GPU de 16 GB, manteniendo capacidades multimodales.
- Prototipado de agentes conversacionales sin filtros para pruebas internas de robustez: evaluar cómo responde un LLM a prompts adversariales antes de decidir qué salvaguardas implementar en el sistema final.
- Generación de contenido para juegos de rol de mesa o videojuegos con temáticas adultas: el modelo mantiene el personaje y el tono sin romper la inmersión con negativas.
- Transcripción y descripción de imágenes/vídeo en pipelines de datos: el mmproj permite etiquetar contenido visual de forma automática, aunque la ausencia de filtros exige revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales en la model card, y no se dispone de datos verificables sobre la degradación de calidad introducida por la abliteration o por las cuantizaciones K_P frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, solo pesos):
  - IQ2_M: ~11 GB
  - Q2_K_P / IQ3_M: ~15 GB
  - IQ4_XS: ~19 GB
  - Q3_K_P / IQ4_NL: ~19-20 GB
  - Q4_K_M: ~21 GB
  - Q4_K_P: ~23 GB
  - Q5_K_P: ~28 GB
  - Q6_K_P: ~31 GB
  - Q8_K_P: ~44 GB
  - Añadir ~899 MB para el mmproj f16 si se usa visión, más overhead de contexto KV (significativo con 128K-262K tokens).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/IQ4_NL con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizaciones Q3/IQ3; A100 40/80 GB o H100 para Q8_K_P con contexto largo; configuraciones multi-GPU para contexto completo de 262K.
- Cabe en GPU consumer: sí, en RTX 4090 con Q4_K_M o inferiores; en RTX 4060 Ti 16 GB con IQ3_M o IQ2_M; en GPUs de 8-12 GB solo con cuantizaciones muy agresivas (IQ2_M) y contexto reducido.
- Opciones de despliegue: llama.cpp (recomendado, con flag `--jinja`), LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo; para safetensors habría que recurrir al modelo base original.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos, el throughput esperado es sustancialmente mayor que un denso de 35B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B | ~3B | 262K | Sí (texto, imagen, vídeo) | Apache 2.0 | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | 262K | Sí | Apache 2.0 | Safetensors, GGUF |
| Otras variantes abliterated de Qwen (p. ej. Qwen2.5-32B abliterated) | 32B denso | 32B | 32K-128K | No | Apache 2.0 | GGUF, Safetensors |

No se dispone de datos de rendimiento comparativo verificable entre estas variantes en la información proporcionada. La principal diferencia frente al modelo base es la eliminación de rechazos; frente a abliterations de modelos densos, la ventaja es la eficiencia del MoE (~3B activos) y el contexto de 262K con soporte multimodal nativo.

## Limitaciones y advertencias

- La abliteration elimina salvaguardas: el modelo generará contenido dañino, ilegal o éticamente problemático si se le solicita. No apto para exposición directa a usuarios finales sin capas de moderación externas.
- El autor advierte que puede añadir descargos de responsabilidad breves heredados del entrenamiento base; estos no son rechazos, pero pueden aparecer en la salida.
- Riesgo elevado de alucinación, agravado por la ausencia de mecanismos de rechazo que en el modelo base actúan como freno ante preguntas fuera de dominio.
- La abliteration puede degradar capacidades de razonamiento y coherencia; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Las cuantizaciones K_P son un formato propietario del autor: LM Studio puede mostrarlas como "?" y el widget de compatibilidad de Hugging Face no las reconoce. Verificar compatibilidad antes de desplegar.
- El contexto completo de 262K requiere hardware significativo; por debajo de 128K el autor advierte que se pierden capacidades de thinking.
- Idiomas: aunque la etiqueta indica "multilingual", el soporte real fuera de inglés y chino no está verificado; el castellano puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado recae íntegramente en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria de la calidad de las cuantizaciones ni de la abliteration.
- El tamaño del repo (247,4 GB) incluye todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fantasyx07/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Repositorio original de cuantizaciones (referenciado en la model card): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
