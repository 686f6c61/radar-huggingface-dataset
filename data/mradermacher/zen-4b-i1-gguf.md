# mradermacher/zen-4b-i1-GGUF

## Resumen

Esta ficha corresponde a la cuantización GGUF con imatrix (matriz de importancia) del modelo **zen-4b**, un modelo de lenguaje causal de 4.000 millones de parámetros desarrollado por xysera. El repositorio, mantenido por mradermacher, no es el modelo original sino una colección de versiones cuantizadas en formato GGUF pensadas para inferencia local eficiente mediante llama.cpp y herramientas compatibles. El modelo base se presenta con las etiquetas *reasoning* e *instruction-following*, lo que sugiere un enfoque en razonamiento y seguimiento de instrucciones conversacionales.

La relevancia de esta cuantización radica en la accesibilidad: con 4.022 millones de parámetros y cuants que van desde 1,2 GB (IQ1_S) hasta 3,4 GB (Q6_K), el modelo puede ejecutarse en hardware de consumo modesto, incluidas GPUs de gama media e incluso CPU con RAM limitada. La técnica imatrix de ikawrakow mejora la calidad de las cuantizaciones bajas respecto a las cuants estáticas, lo que hace especialmente interesantes los niveles IQ2/IQ3 para dispositivos con recursos ajustados.

El modelo original (xysera/zen-4b) se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. No se dispone de información publicada sobre arquitectura detallada, longitud de contexto, datos de entrenamiento ni benchmarks, por lo que varios apartados de esta ficha indican explícitamente esa ausencia de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles no disponibles |
| Parámetros totales | 4.022.468.096 (≈4.022 M, dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura interna del modelo base. Por las etiquetas del repositorio (*causal-lm*, *transformers*) se sabe que se trata de un modelo de lenguaje autorregresivo de tipo transformer, pero no consta si emplea atención estándar, variantes lineales, MoE ni otras innovaciones. El tamaño real de 4.022 millones de parámetros procede de los metadatos de safetensors del modelo base.

Tampoco hay información publicada sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre el proceso de alineación (SFT, RLHF, DPO). Las etiquetas *reasoning* e *instruction-following* indican que el modelo se ha entrenado o ajustado para tareas de razonamiento y seguimiento de instrucciones en inglés, pero los detalles técnicos concretos no están disponibles en la model card.

La contribución técnica principal de este repositorio es la cuantización con imatrix (importance matrix), una técnica popularizada por ikawrakow en llama.cpp que calcula una matriz de importancia a partir de datos de calibración para reducir el error de cuantización, especialmente en niveles bajos (IQ1-IQ3). Según el autor, los quants IQ suelen preferirse sobre quants estáticos de tamaño similar.

## Capacidades

- Generación de texto conversacional en inglés (etiquetado como *conversational*)
- Razonamiento (*reasoning*), según las etiquetas del repositorio
- Seguimiento de instrucciones (*instruction-following*)
- Ejecución eficiente en local mediante formato GGUF (llama.cpp, Ollama, LM Studio, etc.)
- Disponibilidad de 23 niveles de cuantización para ajustar calidad frente a tamaño
- No consta soporte de tool calling, function calling, visión, audio ni modo de pensamiento extendido en la información disponible

## Casos de uso

- **Asistentes conversacionales locales**: con la cuant Q4_K_M (2,6 GB) se puede desplegar un chatbot de instrucciones en inglés en un portátil sin GPU dedicada, garantizando privacidad total de los datos.
- **Prototipado rápido en dispositivos de recursos limitados**: los quants IQ2/IQ3 (1,3-2,2 GB) permiten probar capacidades de razonamiento en Raspberry Pi 5, mini PCs o móviles con llama.cpp.
- **Inferencia por lotes en CPU**: al ser un modelo de 4B, ofrece un throughput razonable en servidores sin GPU, útil para pipelines de procesamiento de texto en inglés donde no se justifica un modelo de 70B.
- **Integración en aplicaciones edge**: el tamaño de 2,4-2,6 GB en IQ4_XS/Q4_K_M facilita la distribución del modelo junto con la aplicación para funcionar sin conexión.
- **Investigación sobre cuantización**: el archivo imatrix de 0,1 GB permite generar cuants propios y estudiar el impacto de distintos niveles de cuantización sobre un modelo de 4B.
- **Generación de texto asistida en editores locales**: integrable en herramientas tipo Ollama o LM Studio para redacción y resumen de textos en inglés con latencia baja.
- **Fine-tuning posterior sobre cuant base**: partiendo del modelo base xysera/zen-4b en safetensors, se puede ajustar para dominios concretos y volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco existen datos publicados de rendimiento (tokens/segundo) para las distintas cuants de este repositorio.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: aproximadamente el tamaño del archivo de cuant más el contexto. Referencias: IQ1_S/IQ1_M (1,2 GB), IQ3_M (2,1 GB), Q4_K_M (2,6 GB), Q5_K_M (3,0 GB), Q6_K (3,4 GB). Con contexto moderado, 4-6 GB de VRAM o RAM bastan para las cuants recomendadas.
- **GPUs recomendadas**: cualquier GPU con 4 GB o más de VRAM es suficiente para las cuants intermedias (RTX 3060 de 6 GB, RTX 4060, RTX 4090 con holgura para contextos largos). En GPU con solo 2 GB, usar IQ2/IQ3.
- **Consumer GPUs**: sí, cabe cómodamente en prácticamente cualquier GPU de consumo moderna; incluso funciona solo con CPU y 4-6 GB de RAM.
- **Opciones de despliegue**: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, text-generation-webui. El modelo base en safetensors admite vLLM, TGI y la librería transformers.
- **Latencia y throughput**: no disponibles; por su tamaño (4B), se espera inferencia rápida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| zen-4b (esta ficha, cuant GGUF) | 4.022 M | GGUF imatrix | Apache 2.0 | no disponible | Razonamiento e instrucciones en inglés |
| Llama 3.2 3B Instruct | 3.210 M | safetensors, GGUF comunitario | Llama 3.2 Community License | 128.000 tokens | Multilingüe, amplio ecosistema |
| Qwen2.5-3B-Instruct | 3.086 M | safetensors, GGUF comunitario | Qwen Research (comercial según ingresos) | 32.768 tokens | Fuerte en código y matemáticas, multilingüe |
| Phi-3.5-mini-instruct | 3.821 M | safetensors, GGUF comunitario | MIT | 128.000 tokens | Buen razonamiento en tamaño reducido |

Zen-4b se sitúa en la franja de 3-4B con la ventaja de una licencia Apache 2.0 sin restricciones, frente a las licencias comunitarias de Llama y Qwen. Sin benchmarks publicados, no es posible comparar rendimiento real.

## Limitaciones y advertencias

- **Idioma**: el modelo está etiquetado solo para inglés; su rendimiento en castellano no está documentado y probablemente sea inferior o no garantizado.
- **Sesgos**: no se ha publicado información sobre sesgos del modelo base; al desconocerse el dataset de entrenamiento, deben asumirse los sesgos típicos de modelos de lenguaje entrenados con datos web.
- **Alucinaciones**: como todo modelo de lenguaje de 4B, es propenso a generar contenido incorrecto con apariencia plausible, especialmente en tareas de razonamiento complejas; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- **Cuantizaciones bajas**: los niveles IQ1_S/IQ1_M (descritos por el autor como "para desesperados") y Q2_K sufren degradación notable de calidad; se recomienda Q4_K_M como equilibrio.
- **Contexto**: al no publicarse la longitud de contexto del modelo base, no se puede garantizar comportamiento con entradas largas; conviene verificarlo empíricamente antes de uso en producción.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes.
- **Procedencia del modelo base**: xysera/zen-4b es un modelo con documentación pública muy limitada, lo que dificulta evaluar su procedencia, datos de entrenamiento y fiabilidad antes de desplegarlo en producción.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/zen-4b-i1-GGUF
- Modelo base: https://huggingface.co/xysera/zen-4b
- Cuants estáticas del mismo modelo: https://huggingface.co/mradermacher/zen-4b-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#zen-4b-i1-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor (nethype GmbH): https://www.nethype.de/
