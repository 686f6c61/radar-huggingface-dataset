# mradermacher/Morpho-7B-Distill-i1-GGUF

## Resumen

Morpho-7B-Distill-i1-GGUF es un repositorio de cuantizaciones en formato GGUF con importancia matrix (imatrix) del modelo bluemorpholimited/Morpho-7B-Distill, creado por el cuantizador mradermacher. El modelo base es un LLM de 7,6 mil millones de parámetros desarrollado por Blue Morpho Limited mediante destilación (los tags sugieren destilación desde un modelo mucho mayor, posiblemente de 180B), y esta ficha cubre la versión cuantizada que facilita su ejecución en hardware de consumo.

La relevancia de este repositorio radica en que ofrece 24 variantes de cuantización distintas, desde IQ1_S (2,0 GB) hasta Q6_K (6,4 GB), lo que permite ajustar el equilibrio entre calidad, tamaño y velocidad según el hardware disponible. Las cuantizaciones imatrix suelen preservar mejor la calidad que las cuantizaciones estáticas a igual tamaño.

El modelo base está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas. La información disponible sobre las capacidades específicas, benchmarks y arquitectura detallada del modelo original es escasa, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según librería transformers) |
| Parametros totales | 7.615.616.512 (7,62B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base, Morpho-7B-Distill de Blue Morpho Limited, es un modelo de aproximadamente 7,6 mil millones de parámetros creado mediante destilación de conocimiento. Los tags del repositorio incluyen "distillation", "7b" y "180b", lo que sugiere que se destiló desde un modelo profesor de hasta 180B de parámetros, aunque esta cifra no está confirmada en la documentación disponible. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

Este repositorio no contiene el modelo original sino cuantizaciones GGUF con matriz de importancia (imatrix), una técnica de Ikawrakow que calcula estadísticas de importancia por canal durante una pasada de calibración sobre datos de texto, permitiendo cuantizar con menor pérdida de calidad que las cuantizaciones estáticas equivalentes, especialmente en rangos bajos (IQ1-IQ3). El proceso de conversión se realizó desde el formato HF (safetensors) del modelo original.

## Capacidades

- Generación de texto conversacional (el repositorio está etiquetado como "conversational").
- Destilación desde un modelo profesor de gran tamaño, lo que habitualmente implica capacidades heredadas de razonamiento y generación (no confirmado con datos publicos).
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible; el modelo está etiquetado solo para inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponibles según la información publicada.

## Casos de uso

- Chatbots locales en inglés: con la variante Q4_K_M (4,8 GB) el modelo cabe en portátiles y equipos sin GPU dedicada, ejecutándose vía llama.cpp u Ollama para asistentes conversacionales offline.
- Prototipado en hardware de consumo: la gama de cuantizaciones permite probar el modelo en GPUs de 6-8 GB de VRAM (como RTX 3060 o RTX 4060) usando IQ4_XS o Q4_K_S, ideal para validar casos de uso antes de escalar.
- Integración en aplicaciones edge: las variantes IQ2/IQ3 (2,4-3,7 GB) permiten desplegar el modelo en dispositivos con memoria muy limitada, aceptando una pérdida de calidad a cambio de huella mínima.
- Servidores de inferencia de bajo coste: en GPUs como la RTX 4090 (24 GB) puede ejecutarse la variante Q6_K (6,4 GB) con contexto amplio y alta velocidad de generación, útil para servicios con múltiples usuarios concurrentes ligeros.
- Generación de texto para contenido en inglés: redacción de borradores, resúmenes y transformación de texto, aprovechando la destilación desde un modelo grande para calidad superior a modelos entrenados desde cero del mismo tamaño (a confirmar empíricamente).
- Investigación sobre cuantización: el archivo imatrix (0,1 GB) incluido permite a investigadores crear sus propias cuantizaciones personalizadas y estudiar el impacto de distintos esquemas de cuantización sobre un modelo destilado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante elegida. IQ1_S requiere unos 2 GB; IQ3_XS unos 3,4 GB; Q4_K_M unos 4,8 GB; Q6_K unos 6,4 GB. Añadir 0,5-2 GB adicionales para el KV cache según la longitud de contexto (no disponible la ventana exacta).
- GPU recomendadas: para inferencia completa en GPU, cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060 Ti, RTX 4090). En CPU pura, cualquier procesador moderno con 8-16 GB de RAM es suficiente.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna de consumo; incluso las variantes medias (Q4_K_S/Q4_K_M) caben en GPUs de 6-8 GB como la RTX 3060 de 12 GB o la RTX 4060.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. No es un modelo vLLM/TGI directo en este formato (sería necesario usar el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles; en un modelo de 7,6B cuantizado a Q4, los runtimes GGUF típicamente alcanzan decenas de tokens por segundo en CPU moderno y más de 100 tokens/s en GPU de consumo, pero estas cifras no están verificadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Morpho-7B-Distill (este) | 7,62B | no disponible | Apache 2.0 | GGUF (imatrix) |
| Llama 3.1 8B | 8B | 128K tokens | Llama 3.1 Community License | safetensors, GGUF |
| Mistral 7B v0.3 | 7,2B | 32K tokens | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 7B | 7,6B | 128K tokens | Apache 2.0 (parcial) | safetensors, GGUF |

Morpho-7B-Distill compite en la categoría de 7-8B con licencia permisiva. Frente a Llama 3.1 8B ofrece una licencia más abierta (Apache 2.0) pero sin información pública de benchmarks ni contexto largo confirmado. Frente a Mistral 7B comparte licencia Apache 2.0, y su ventaja potencial sería la destilación desde un modelo mayor, aunque esto no está verificado con datos publicos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un modelo destilado de origen no documentado publicamente, hereda los sesgos del modelo profesor y de sus datos de entrenamiento, que no han sido auditados.
- Riesgo de alucinacion: típico de cualquier LLM de 7B; no existen datos específicos de este modelo, por lo que debe asumirse riesgo alto en tareas fácticas sin verificación.
- Limitaciones de contexto o idioma: el modelo está etiquetado solo para inglés; su rendimiento en castellano u otros idiomas no está garantizado ni documentado. La longitud de contexto no está publicada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de la atribución de la licencia.
- Caveats para produccion: las cuantizaciones IQ1/IQ2 se consideran de calidad muy baja ("for the desperate", según el autor) y no deben usarse en producción. Las variantes recomendadas por el cuantizador son Q4_K_S y Q4_K_M. Al tratarse de un modelo de terceros sin model card detallada, se recomienda evaluación interna rigurosa antes de cualquier despliegue serio.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/Morpho-7B-Distill-i1-GGUF
- Modelo base: https://huggingface.co/bluemorpholimited/Morpho-7B-Distill
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Morpho-7B-Distill-GGUF
- Página de descargas con vista general: https://hf.tst.eu/model#Morpho-7B-Distill-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
- Paper del modelo base: no disponible
