# mradermacher/YUBA-XV-GGUF

## Resumen

YUBA-XV es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 9 mil millones) publicado por CompiwerAI y cuantizado en formato GGUF por mradermacher. El repositorio analizado contiene exclusivamente las versiones cuantizadas del modelo base `CompiwerAI/YUBA-XV`, distribuidas bajo licencia Apache 2.0 y orientadas a inferencia local mediante `llama.cpp` y herramientas compatibles con GGUF. La model card no documenta la arquitectura interna, el contexto máximo ni los datos de entrenamiento, por lo que la información técnica disponible es limitada.

El modelo se etiqueta como "stealth" y "compiwer-ai", y declara soporte para inglés, árabe y francés. La relevancia de este repositorio reside en que ofrece un conjunto completo de cuantizaciones estáticas (desde Q2_K hasta f16) que permiten desplegar un modelo de ~9B parámetros en hardware de consumo, algo especialmente útil cuando el modelo base solo se distribuye en precisión completa.

No obstante, conviene señalar que el repositorio presenta cero descargas y cero likes en el momento de la consulta, y que la model card no incluye benchmarks, detalles de arquitectura ni instrucciones de prompt. Cualquier evaluación de calidad debe realizarse empíricamente sobre el modelo base antes de adoptarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer, inferido por `library_name: transformers`) |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), árabe (ar), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `CompiwerAI/YUBA-XV` en la documentación proporcionada. El tag `library_name: transformers` y el pipeline `conversational` sugieren un transformer decoder-only con plantilla de chat, pero no se confirma el tipo de atención, la presencia de capas MoE, ni innovaciones como decodificación especulativa o atención lineal.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. El repositorio de mradermacher es únicamente una conversión a GGUF: no aporta información sobre el entrenamiento. Las cuantizaciones son estáticas (no se han publicado versiones con imatrix ni ponderadas en el momento de la consulta), según indica el propio autor.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` y el pipeline declarado.
- Soporte multilingüe declarado para inglés, árabe y francés.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso en infraestructuras de inferencia tipo API.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (5,8 GB) y Q5_K_M permiten ejecutar el modelo en GPUs de consumo de 8-12 GB de VRAM mediante `llama.cpp` u Ollama, útil para prototipos y pruebas offline.
- Asistente conversacional multilingüe en inglés, árabe y francés: el modelo puede integrarse en aplicaciones de chat para atención al usuario en esos tres idiomas, siempre que se valide empíricamente la calidad por idioma.
- Procesamiento por lotes en CPU: la cuantización Q2_K (4,0 GB) y Q3_K_S (4,4 GB) permiten inferencia en servidores sin GPU, adecuada para tareas de generación de texto de baja criticidad.
- Investigación y evaluación de cuantizaciones: el repositorio ofrece un espectro completo de niveles de cuantización, lo que facilita estudios comparativos de degradación de calidad frente a tamaño.
- Integración en pipelines con `transformers` y endpoints compatibles: al declararse `endpoints_compatible`, puede servirse con frameworks que acepten GGUF (por ejemplo, `llama.cpp` server o vLLM con soporte GGUF) para aplicaciones internas.
- Filtrado y clasificación de texto en árabe y francés: con prompts adecuados, el modelo puede emplearse para tareas de etiquetado o resumen en esos idiomas, previa validación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del archivo GGUF):
  - Q2_K: ~4,0 GB
  - Q3_K_S: ~4,4 GB
  - Q3_K_M: ~4,8 GB
  - Q3_K_L: ~5,1 GB
  - Q4_K_S: ~5,5 GB
  - Q4_K_M: ~5,8 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- GPU recomendadas: no disponibles de forma oficial. Por tamaño, una RTX 3060 de 12 GB o RTX 4070 de 12 GB cubren hasta Q8_0; una RTX 4090 (24 GB) permite f16 con holgura. Para Q4_K_M basta una GPU de 8 GB (RTX 3060 Ti, RTX 4060).
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en GPUs de 8-12 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: `llama.cpp`, Ollama, y servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con APIs de inferencia, pero no se detalla cuáles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| YUBA-XV (este) | ~8,95 B | no disponible | Apache 2.0 | GGUF en HF; base en HF |
| Llama 3.1 8B | 8 B | 128 K | Llama 3.1 Community | safetensors y GGUF |
| Qwen2.5 7B | 7,6 B | 128 K | Apache 2.0 | safetensors y GGUF |
| Mistral 7B v0.3 | 7,2 B | 32 K | Apache 2.0 | safetensors y GGUF |

La comparación de rendimiento con estas alternativas no es posible con la información disponible; se recomienda evaluar YUBA-XV con benchmarks propios antes de sustituir modelos consolidados.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no puede descartarse la presencia de sesgos en inglés, árabe o francés.
- Riesgo de alucinación no cuantificado: sin benchmarks ni model card detallada, no hay evidencia sobre la fiabilidad factual del modelo.
- Contexto máximo desconocido: no puede planificarse su uso en tareas de contexto largo sin validación previa.
- Cobertura lingüística limitada a tres idiomas declarados; el español no figura entre ellos, por lo que su uso en castellano no está respaldado por el autor.
- Aunque la licencia es Apache 2.0, el modelo base podría tener condiciones adicionales no reflejadas en este repositorio de cuantizaciones; conviene revisar la model card de `CompiwerAI/YUBA-XV`.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en producción ni validación comunitaria.
- Las cuantizaciones son estáticas y no hay versiones con imatrix, lo que puede implicar mayor degradación de calidad en Q2_K y Q3_K_S frente a cuantizaciones ponderadas.
- No se documenta plantilla de chat ni formato de prompt, lo que puede provocar respuestas inconsistentes si se usa sin ajustar el template.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/YUBA-XV-GGUF
- Modelo base: https://huggingface.co/CompiwerAI/YUBA-XV
- Página de descargas del autor: https://hf.tst.eu/model#YUBA-XV-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
