# mradermacher/AmoreLLM-4B-i1-GGUF

## Resumen

AmoreLLM-4B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo 3tic/AmoreLLM-4B, realizadas por el usuario mradermacher, un cuantizador muy activo en la comunidad de Hugging Face. El modelo base, AmoreLLM-4B, es un modelo conversacional de unos 4.000 millones de parámetros orientado al dominio de las novelas ligeras (lightnovel), con soporte declarado para el idioma chino (zh). La versión cuantizada permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF.

El repositorio original (3tic/AmoreLLM-4B) no incluye una model card detallada, por lo que hay poca información pública sobre el proceso de entrenamiento, la arquitectura exacta o los benchmarks del modelo base. La relevancia de esta ficha reside en la disponibilidad de cuantizaciones imatrix (importance matrix), que ofrecen mejor calidad por bit que las cuantizaciones estáticas, con versiones desde ~1,2 GB (IQ1_S) hasta ~3,4 GB (Q6_K).

Se trata de un modelo de nicho: útil para quienes trabajan con generación de texto en chino, especialmente en el ámbito de ficción y novelas ligeras, y que necesitan ejecutar el modelo localmente con recursos limitados. La licencia Apache 2.0 del repositorio facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según librería transformers) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplicable (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura interna del modelo base. Se sabe que es un modelo de tipo transformer de aproximadamente 4.022 millones de parámetros, convertido desde safetensors a GGUF mediante el flujo estándar de conversión de Hugging Face (convert_type: hf). La etiqueta "lightnovel" sugiere un ajuste fino o entrenamiento orientado a texto narrativo largo en chino, probablemente sobre corpus de novelas ligeras, aunque el autor original (3tic) no ha publicado detalles sobre el dataset, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

La innovación principal de este repositorio no está en el modelo sino en la cuantización: todas las versiones son imatrix (importance matrix), un método de cuantización que pondera la importancia de cada peso durante la conversión, obteniendo mejor calidad de perplexity que las cuantizaciones estáticas equivalentes, especialmente en los niveles bajos (IQ1-IQ3). El propio autor recomienda preferir los quants IQ sobre los quants K de tamaño similar.

## Capacidades

- Generación de texto conversacional (tag "conversational"), orientada a ficción y novelas ligeras en chino.
- Optimizado para generación narrativa larga en chino (zh), según las etiquetas del modelo base.
- Compatible con runtimes GGUF (llama.cpp, Ollama, LM Studio, etc.), lo que permite inferencia local en CPU y GPU de consumo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de visión, audio o thinking mode: no disponibles (no documentadas).
- Capacidades multilingües: solo se declara el chino; el rendimiento en otros idiomas no está documentado.

## Casos de uso

- Generación de novelas ligeras en chino: el modelo está etiquetado específicamente para el dominio lightnovel, por lo que puede usarse como asistente de escritura de ficción serializada en chino, generando capítulos o continuaciones de tramas.
- Escritura creativa asistida local: con cuantizaciones de ~2,5 GB (Q4_K_M) funciona en portátiles sin GPU dedicada, lo que lo hace adecuado para escritores que quieren privacidad y trabajo sin conexión.
- Prototipado de chatbots en chino: el tag conversational permite integrarlo en demos de diálogo, aunque sin garantías de tool calling.
- Investigación en cuantización: el archivo imatrix de 0,1 GB permite generar cuantizaciones propias del modelo, útil para experimentar con métodos IQ-K de llama.cpp.
- Fine-tuning posterior con LoRA sobre el modelo base en chino, aprovechando su tamaño contenido (4B) para entrenar en una sola GPU de gama alta.
- Relleno (infill) y expansión de traducciones o adaptaciones de ficción de chino a borradores en otros idiomas, con revisión humana, dado que solo se declara soporte de chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el modelo base (3tic/AmoreLLM-4B) ni este repositorio cuantizado incluyen evaluaciones en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia según cuantización (tamaño del archivo, más overhead de contexto):
  - IQ1_S / IQ1_M: ~1,2 GB
  - IQ2_M: ~1,6 GB
  - IQ3_M: ~2,1 GB
  - Q4_K_M (recomendado): ~2,6 GB
  - Q5_K_M: ~3,0 GB
  - Q6_K: ~3,4 GB
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o más ejecuta el quant recomendado (Q4_K_M) con holgura; por ejemplo, RTX 3060, RTX 4060 o superiores. También es viable solo en CPU con RAM de 8 GB.
- Consumer GPUs: cabe sin problemas en prácticamente cualquier GPU moderna de consumo, incluidas integradas con memoria compartida, gracias a su tamaño reducido.
- Despliegue: llama.cpp (runtime de referencia para GGUF imatrix), Ollama, LM Studio, koboldcpp y cualquier servidor compatible con GGUF. No es un despliegue típico de vLLM o TGI, que trabajan mejor con pesos safetensors del modelo base.
- Latencia y throughput: no disponible; al ser un modelo de 4B fuertemente cuantizado, se espera inferencia rápida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| AmoreLLM-4B (esta ficha, cuantizado) | 4,02 B | GGUF imatrix | Apache 2.0 | Ficción / lightnovel en chino |
| Qwen2.5-3B-Instruct | 3,09 B | safetensors, GGUF comunitario | Qwen license (uso comercial condicionado) | General, fuerte en chino |
| Gemma 2 2B IT | 2,6 B | safetensors, GGUF comunitario | Gemma license | General, multilingüe |
| Llama 3.2 3B Instruct | 3,21 B | safetensors, GGUF comunitario | Llama 3.2 license | General, multilingüe |

Nota: la comparativa es orientativa; AmoreLLM-4B se diferencia por su especialización en narrativa china y no publica benchmarks frente a estos modelos generalistas.

## Limitaciones y advertencias

- Alcance de idioma: solo se declara soporte de chino (zh); el rendimiento en castellano o inglés no está documentado y probablemente sea limitado o inestable.
- Falta de documentación del modelo base: no hay model card de 3tic/AmoreLLM-4B con datos de entrenamiento, contexto ni evaluaciones, lo que dificulta evaluar su calidad y seguridad antes de usarlo en producción.
- Riesgo de alucinación: no evaluado; al ser un modelo especializado en ficción sin benchmarks públicos, debe tratarse como no fiable para tareas factuales.
- Cuantizaciones agresivas: los quants IQ1_S/IQ1_M (~1,2 GB) degradan notablemente la calidad, como advierte el propio autor ("for the desperate"); se recomienda Q4_K_M como equilibrio.
- Sesgos: no documentados; cualquier sesgo presente en los datos de novelas ligeras (estereotipos narrativos, contenido de ficción) puede reflejarse en las salidas.
- Licencia: Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento del modelo base no está documentada, lo que introduce incertidumbre legal adicional.
- Contexto: la longitud de ventana no está publicada; verificarla en la configuración del modelo base antes de planificar tareas de generación larga.

## Enlaces

- Repositorio cuantizado (imatrix): https://huggingface.co/mradermacher/AmoreLLM-4B-i1-GGUF
- Modelo base: https://huggingface.co/3tic/AmoreLLM-4B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/AmoreLLM-4B-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#AmoreLLM-4B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
