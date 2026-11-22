# mradermacher/Qwen3.5-2B-Uncensored-reaper-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen3.5-2B-Uncensored-reaper-i1-GGUF`, una publicacion de cuantizaciones GGUF realizadas por mradermacher sobre el modelo base `abdukuzi45/Qwen3.5-2B-Uncensored-reaper`. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos cuantizados (con ficheros imatrix) pensada para inferencia local en CPU y GPU de gama baja. El modelo base, segun su nombre y etiquetas, parte de una variante "abliterated" y "uncensored" de un supuesto Qwen3.5 de 2B, con vocacion multimodal y orientada a investigacion.

El modelo cuenta con 1.942.653.248 parametros totales segun los safetensors del autor original, lo que lo situa en la categoria de modelos pequenos (por debajo de 2B). La licencia declarada es Apache 2.0 y el unico idioma declarado es el ingles. El repositorio ocupa 18,6 GB debido a la agregacion de multiples variantes de cuantizacion, aunque cada fichero individual ronda entre 1,1 y 1,7 GB.

La relevancia de esta publicacion es practica: permite ejecutar un modelo conversacional de ~2B en hardware modesto mediante llama.cpp u Ollama, con opciones de cuantizacion que van desde Q2_K (1,1 GB) hasta Q6_K (1,7 GB). No obstante, conviene advertir que la model card del cuantizador no aporta informacion sobre arquitectura interna, contexto, datos de entrenamiento ni benchmarks, por lo que gran parte de las especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se presenta como derivado de Qwen3.5; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre del modelo base (`Qwen3.5-2B-Uncensored-reaper`) sugiere una familia tipo Qwen3.5 de aproximadamente 2B parametros, y las etiquetas incluyen `multimodal`, `abliterated` y `uncensored`, lo que indica que se ha aplicado una tecnica de "abliteracion" (supresion de la direccion de rechazo en el espacio de activaciones) para reducir las negativas del modelo a ciertas peticiones. Sin embargo, no se detalla el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

Respecto al trabajo de cuantizacion, mradermacher emplea cuantizaciones con matrices de importancia (imatrix) generadas a partir del modelo original, lo que en la practica mejora la perplejidad de las variantes de baja precision (IQ2, IQ3, IQ4) frente a las cuantizaciones estaticas equivalentes. La model card incluye la nota de que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y recomienda IQ3_XXS sobre Q2_K y IQ3_XS sobre Q3_K_S. Tambien se ofrece un fichero imatrix independiente (0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline declarado por el autor.
- Capacidad multimodal declarada en las etiquetas (`multimodal`), aunque no se especifica que modalidades concretas ni como se activan en el formato GGUF.
- Comportamiento "uncensored" / "abliterated": el modelo base ha sido modificado para reducir rechazos ante peticiones que un modelo alineado convencional rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos de sobremesa: con cuantizaciones de 1,1 a 1,7 GB, el modelo puede ejecutarse en CPU con llama.cpp o en GPU consumer con 4-6 GB de VRAM, lo que lo hace util para prototipos offline sin dependencia de la nube.
- Experimentacion en investigacion sobre alineacion y abliteracion: al ser una variante "uncensored", sirve para estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparando respuestas frente al modelo base alineado.
- Chat conversacional de bajo coste en ingles: para asistentes embebidos o demos donde el coste por token y la latencia importan mas que la calidad puntera.
- Pruebas de pipelines de cuantizacion: el repositorio incluye el fichero imatrix y multiples variantes, lo que permite evaluar el impacto de cada tipo de cuantizacion en la perplejidad y en la calidad de las respuestas.
- Generacion de texto en entornos con recursos restringidos: Raspberry Pi, mini-PC o portatiles sin GPU dedicada pueden ejecutar las variantes Q2_K o Q3_K_S con llama.cpp.
- Filtrado y generacion de contenido en ingles a gran escala: al ser un modelo pequeno, permite procesar volumenes altos de texto en lotes sobre CPU, aunque con calidad limitada en tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB para cuantizaciones Q2_K a Q4_K_M, y 2,5-3,5 GB para Q5_K_M y Q6_K, incluyendo overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU pura.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI a traves de llama.cpp server.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-reaper (i1-GGUF) | ~1,94B | no disponible | Apache 2.0 | GGUF | Variante abliterated/uncensored, solo ingles |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,5B | 32k (segun ficha oficial de Qwen) | Apache 2.0 | GGUF | Modelo alineado, multilingue, referencia de la familia Qwen |
| Llama-3.2-1B-Instruct (GGUF) | 1,2B | 128k (segun ficha oficial de Meta) | Llama 3.2 Community License | GGUF | Alineado, multilingue, requiere aceptar licencia |
| SmolLM2-1.7B-Instruct (GGUF) | 1,7B | 8k (segun ficha oficial de Hugging Face) | Apache 2.0 | GGUF | Alineado, entrenado para instrucciones |

La comparativa con Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct es la mas directa por tamano y por disponibilidad en GGUF, pero no se dispone de datos de benchmarks del modelo reseñado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad, por lo que no se puede recomendar para produccion sin una evaluacion propia.
- Modelo "uncensored" / "abliterated": la supresion de la direccion de rechazo implica mayor probabilidad de generar contenido inapropiado, ofensivo o potencialmente danino; no es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Solo ingles: el campo `language` declara unicamente `en`, por lo que el rendimiento en castellano u otros idiomas sera previsiblemente deficiente.
- Riesgo de alucinacion: al ser un modelo de ~2B, la fidelidad factual es limitada y la tasa de alucinacion sera superior a la de modelos de mayor tamano.
- Licencia Apache 2.0 declarada por el cuantizador, pero conviene verificar la licencia del modelo base original (`abdukuzi45/Qwen3.5-2B-Uncensored-reaper`) antes de uso comercial, ya que el cuantizador no es el autor del modelo.
- Informacion tecnica incompleta: no se detalla la longitud de contexto, la composicion del dataset, ni el proceso de entrenamiento o abliteracion, lo que dificulta la reproducibilidad.
- Modelo base de procedencia no verificada: el nombre "Qwen3.5" no corresponde a una familia publica confirmada en la informacion disponible; conviene tratar la denominacion con cautela.
- Repositorio de 18,6 GB: descargar el repo completo es costoso; se recomienda descargar solo el fichero GGUF de la cuantizacion deseada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-reaper-i1-GGUF
- Modelo base: https://huggingface.co/abdukuzi45/Qwen3.5-2B-Uncensored-reaper
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-reaper-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-2B-Uncensored-reaper-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Pagina de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
