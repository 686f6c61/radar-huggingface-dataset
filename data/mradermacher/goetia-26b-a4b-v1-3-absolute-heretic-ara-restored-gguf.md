# mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-GGUF

## Resumen

Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-GGUF es una colección de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo base Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored, publicado por el usuario oxpuppy635. Se trata de un modelo conversacional de aproximadamente 25.230 millones de parámetros totales, según los datos de safetensors del repositorio original, con un nombre que sugiere una arquitectura de mezcla de expertos (MoE) con unos 4.000 millones de parámetros activos (el sufijo "A4B" apunta a esa interpretación, aunque no se confirma en la información disponible).

El modelo resuelve el problema de desplegar un modelo de gran tamaño en entornos con recursos limitados: al ofrecer cuantizaciones en varios niveles (desde Q2_K hasta Q8_0 y F16), permite ejecutarlo en GPUs de consumo y en CPU mediante llama.cpp y ecosistemas compatibles. Es relevante ahora porque los GGUF son el estándar de facto para inferencia local y porque el repositorio incluye una gama amplia de cuantizaciones, lo que facilita ajustar el equilibrio entre calidad y memoria.

No obstante, la información pública es muy escasa: no hay model card sustantiva, no se declaran licencia ni idiomas, y no se han publicado resultados de benchmarks. El nombre "Heretic-ARA-Restored" sugiere un proceso de ajuste o restauración sobre un modelo previo, pero no se documenta. Esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo lo que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con ~4B activos, sin confirmar) |
| Parámetros totales | 25.233.142.046 (~25,23 B) |
| Parámetros activos | no disponible (el sufijo "A4B" sugiere ~4 B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. El identificador "Goetia-26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos por token, patrón habitual en modelos tipo Mixtral o Qwen-MoE, pero no hay confirmación documental en la información proporcionada. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Respecto al proceso de cuantización, la model card del repositorio indica que se trata de cuantizaciones estáticas generadas con un pipeline de conversión a GGUF (convert_type: hf, quantize_version: 2) y que se ha omitido el componente mmproj (skip_mmproj: 1), lo que sugiere que el modelo base podría incluir un proyector multimodal que no se ha incluido en estas cuantizaciones. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" del repositorio indica un uso orientado a diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face.
- Inferencia local: al estar en formato GGUF, es ejecutable con llama.cpp y derivados (Ollama, LM Studio, koboldcpp, entre otros).
- Capacidades multimodales: no confirmadas; el flag skip_mmproj indica que el proyector multimodal no se incluye en estas cuantizaciones.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: con cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en una GPU de consumo con 24 GB de VRAM (RTX 3090/4090) o en CPU con RAM suficiente, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Chatbot de atención al cliente autoalojado: la orientación conversacional del modelo y su formato GGUF permiten servirlo con llama.cpp u Ollama en servidores propios, manteniendo los datos de los usuarios dentro de la infraestructura de la organización.
- Experimentación con cuantizaciones: al ofrecer desde Q2_K hasta F16, es útil para estudiar la degradación de calidad en función del nivel de cuantización en un modelo de ~25 B, comparando perplejidad y coherencia entre variantes.
- Integración en pipelines de CI para evaluación de modelos: las distintas variantes permiten automatizar pruebas de regresión de calidad y latencia antes de promover una cuantización a producción.
- Generación de texto asistida en entornos sin GPU: las variantes Q3 y Q4 pueden ejecutarse en CPU con llama.cpp, habilitando casos de generación de borradores, resúmenes o respuestas en equipos sin acelerador dedicado.
- Base para ajuste fino o destilación: al ser un modelo de ~25 B con posible arquitectura MoE, puede servir como profesor o como base para experimentos de destilación hacia modelos más pequeños, siempre que la licencia lo permita (actualmente no declarada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño y cuantización):
  - F16: ~50 GB (no cabe en GPUs de consumo).
  - Q8_0: ~27 GB.
  - Q6_K: ~21 GB.
  - Q5_K_M: ~18 GB.
  - Q4_K_M: ~15-16 GB.
  - Q3_K_M: ~12-13 GB.
  - Q2_K: ~9-10 GB.
- GPU recomendadas: A100 80 GB o H100 para F16 y Q8_0; RTX 4090/3090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 12-16 GB para Q3 y Q2.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 12 GB con Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre el modelo base (arquitectura, contexto, licencia) ni de benchmarks publicados para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documentan datos de entrenamiento, sesgos conocidos ni evaluación de riesgos.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en producción.
- Idiomas no declarados: se desconoce la cobertura multilingüe real y la calidad en castellano.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluación publicada no es posible cuantificarlo.
- Contexto desconocido: se desconoce la longitud máxima de contexto soportada, lo que limita el diseño de aplicaciones con documentos largos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): pueden degradar notablemente la coherencia y la calidad de las respuestas; se recomienda Q4_K_M o superior para uso en producción.
- Repositorio sin descargas ni interacción: no hay evidencia de validación por parte de la comunidad, lo que reduce la fiabilidad de las cuantizaciones publicadas.
- Proyector multimodal omitido: si el modelo base incluía visión, estas cuantizaciones no la conservan.
- Nombre del modelo poco transparente: términos como "Heretic", "ARA" o "Restored" no vienen acompañados de documentación que explique su significado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-GGUF
- Modelo base: https://huggingface.co/oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored
