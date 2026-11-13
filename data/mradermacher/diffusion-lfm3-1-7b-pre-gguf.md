# mradermacher/Diffusion-LFM3-1.7B-pre-GGUF

## Resumen

Diffusion-LFM3-1.7B-pre es un modelo de lenguaje de difusión (diffusion-language-model) con arquitectura de block-diffusion y masked-diffusion, desarrollado originalmente por summerAIO y publicado como modelo base bajo el identificador summerAIO/Diffusion-LFM3-1.7B-pre. La versión aquí descrita es una cuantización estática en formato GGUF realizada por mradermacher, pensada para facilitar la inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo cuenta con 1.722.727.232 parámetros totales (aproximadamente 1,7 mil millones), lo que lo sitúa en la categoría de modelos pequeños. A diferencia de los transformers autorregresivos convencionales, emplea un paradigma de difusión sobre tokens, lo que permite generar texto mediante un proceso iterativo de denoising en lugar de la predicción secuencial token a token. Esta aproximación resulta relevante para investigadores que exploran alternativas a la generación autorregresiva y para desarrolladores interesados en técnicas de generación paralela o no causal.

La licencia es lfm1.0 (LFM Open License), lo que impone restricciones específicas para uso comercial que conviene revisar antes de desplegar el modelo en producción. El modelo está etiquetado únicamente para inglés y no se dispone de información publicada sobre benchmarks, contexto máximo ni detalles del entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (block-diffusion, masked-diffusion) |
| Parametros totales | 1.722.727.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

La arquitectura se etiqueta explícitamente como diffusion-language-model, con las variantes block-diffusion y masked-diffusion. Esto implica que el modelo genera texto mediante un proceso de difusión sobre representaciones discretas de tokens, aplicando enmascaramiento y denoising iterativo en bloques, en lugar de la generación autorregresiva token a token típica de los transformers decoder-only. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otros ajustes de alineamiento.

No se han publicado en la información disponible detalles sobre innovaciones técnicas adicionales como decodificación especulativa, atención lineal u otras optimizaciones. El repositorio aquí descrito es una conversión a GGUF del modelo base original, realizada por mradermacher, con cuantizaciones estáticas (no ponderadas/imatrix) generadas mediante el pipeline habitual de llama.cpp.

## Capacidades

- Generación de texto mediante difusión sobre tokens (block-diffusion y masked-diffusion).
- Modelo etiquetado como conversacional (tag "conversational").
- Soporte únicamente del idioma inglés según la model card.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se dispone de información sobre capacidades de visión, audio, modo thinking u otras modalidades.
- No se dispone de información sobre capacidades específicas de código o matemáticas.

## Casos de uso

- Investigación en modelos de difusión para lenguaje: el modelo sirve como banco de pruebas para estudiar generación no autorregresiva, comparando calidad y latencia frente a transformers decoder-only de tamaño similar.
- Experimentación académica con block-diffusion: permite reproducir y extender experimentos sobre denoising iterativo en tokens con un modelo de 1,7B parámetros ejecutable en hardware modesto.
- Prototipado local de generación de texto en inglés: gracias a las cuantizaciones Q4_K_M (1,2 GB) puede desplegarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes (desde Q2_K hasta f16) para medir el impacto de la cuantización en la perplejidad y la calidad de salida de un modelo de difusión.
- Docencia y formación técnica: útil para explicar las diferencias entre generación autorregresiva y difusión en entornos con recursos limitados.
- Integración en pipelines de investigación con transformers: el modelo base subyacente es compatible con la librería transformers, lo que facilita su incorporación en flujos experimentales existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~0,8 GB, Q4_K_M ~1,2 GB, Q6_K ~1,5 GB, Q8_0 ~1,9 GB, f16 ~3,6 GB (tamaños de archivo; la VRAM real requiere margen adicional para el contexto y el runtime).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para f16 se recomienda al menos 6-8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más; las cuantizaciones Q2_K a Q4_K_M pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) para GGUF; transformers para el modelo base original.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de difusión, el coste por token generado puede diferir del de un transformer autorregresivo equivalente, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Diffusion-LFM3-1.7B-pre (este) | 1,72B | no disponible | lfm1.0 | GGUF, safetensors | Difusion de lenguaje, solo ingles |
| Modelos autorregresivos ~1,5-2B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-2B | 32K-128K (segun modelo) | Apache 2.0 / Llama | GGUF, safetensors | Paradigma autorregresivo, multilingues |
| Modelos de difusion de lenguaje de mayor tamano (p. ej. LLaDA, Dream) | 7-8B | variable | variable | safetensors | Referencia en difusion de lenguaje, mayor coste |

No se dispone de datos de rendimiento comparativo para este modelo concreto, por lo que la comparación se limita a parámetros, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Licencia lfm1.0: contiene restricciones específicas; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Solo soporta inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad.
- Al ser un modelo de difusión, el comportamiento de generación (longitud, coherencia, control) puede diferir del de los transformers autorregresivos y requerir ajuste de parámetros de muestreo específicos.
- Las cuantizaciones son estáticas; no hay versiones ponderadas/imatrix disponibles en el momento de la publicación, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- No hay información publicada sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.
- El tamaño del repositorio (15,8 GB) incluye todas las cuantizaciones; descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Diffusion-LFM3-1.7B-pre-GGUF
- Modelo base: https://huggingface.co/summerAIO/Diffusion-LFM3-1.7B-pre
- Página de descargas del autor: https://hf.tst.eu/model#Diffusion-LFM3-1.7B-pre-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
