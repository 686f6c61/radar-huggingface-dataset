# IsValorum/Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Qwen3.8-35B-A3B-Distill APEX-I-MiniPlus-V2.1 GGUF es una cuantizacion artesanal, publicada por el usuario IsValorum, del modelo empero-ai/Qwen3.8-35B-A3B-Distill. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso con 40 capas, 256 micro-expertos de grano fino (dimension intermedia 512) y 8 expertos activos por token, sobre una arquitectura hibrida que combina 30 capas Gated DeltaNet (SSM) con 10 capas de atencion completa. El resultado es un modelo de 35B parametros totales con aproximadamente 3,2B parametros activos por token, lo que le permite ofrecer latencias propias de un modelo pequeno con la capacidad de razonamiento de uno grande. La nomenclatura "A3B" del nombre hace referencia a esos 3B activos.

El modelo base es una destilacion de las trazas de razonamiento y chain-of-thought (`<think>`) de Qwen3.8 sobre la arquitectura MoE dispersa de 35B, e incluye soporte de tool calling y un proyector de vision separado (`mmproj`) para entrada de imagenes y analisis de interfaces graficas. El repositorio distribuye unicamente pesos en formato GGUF para llama.cpp, con un peso de 14,64 GB (13,64 GiB) y 3,38 bits por peso (BPW) de media, disenado explicitamente para no agotar la memoria en GPUs de 16 GB y 24 GB de VRAM, incluyendo la afirmacion de ejecutar la ventana completa de 256K tokens en una GPU de 24 GB.

La relevancia de esta ficha radica en que no es un modelo nuevo, sino una receta de cuantizacion: el autor sostiene que las cuantizaciones automaticas planas degradan los modelos con micro-expertos y bloques de razonamiento continuo, provocando colapso del router, degeneracion de tokens y sintaxis JSON/matematica rota. Su propuesta mantiene los routers sin comprimir en F32, la cabeza de salida en Q6_K y los expertos nucleares en IQ3_XXS calibrado. Es importante senalar que el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha y que las cifras de rendimiento son afirmaciones del autor, no verificaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration: MoE disperso hibrido con 40 capas (30 Gated DeltaNet SSM + 10 capas de atencion completa), 256 micro-expertos de grano fino con dimension intermedia 512 y 8 expertos activos por token |
| Parametros totales | 35B (segun la nomenclatura del modelo; no se desglosa el total exacto en la informacion disponible) |
| Parametros activos | Aproximadamente 3,2B por token |
| Longitud de contexto | 256K tokens (el autor afirma que se ejecuta completo en GPUs de 24 GB) |
| Tipos de cuantizacion | Build unico GGUF APEX-I-MiniPlus-V2.1 a 3,38 BPW global; por componente: experto compartido en Q5_K + imatrix, capas frontera en Q3_K + imatrix, expertos nucleares en IQ3_XXS calibrado, routers en F32 sin comprimir y cabeza de salida en Q6_K; proyector de vision en Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); el repositorio no publica safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE hibrido: 40 capas en las que 30 son capas Gated DeltaNet (un modelo de espacio de estados, SSM, con mecanismo de puerta) y 10 son capas de atencion completa. El componente MoE usa 256 micro-expertos de grano fino con dimension intermedia 512 y activa 8 por token, lo que da lugar a los aproximadamente 3,2B parametros activos sobre un total de 35B. La presencia mayoritaria de capas SSM reduce el coste de memoria de la cache KV respecto a un transformer de atencion completa equivalente, algo coherente con la afirmacion de poder servir 256K tokens de contexto en 24 GB de VRAM.

El modelo base (empero-ai/Qwen3.8-35B-A3B-Distill) es una destilacion de las capacidades de razonamiento y de las trazas de chain-of-thought de Qwen3.8 en la arquitectura MoE dispersa de 35B. La model card describe tambien soporte de tool calling y de bloques de pensamiento `<think>`, ademas de un proyector de vision independiente en Q8_0 (610 MB / 582 MiB) para parsing de interfaces y entrada de imagenes de alta resolucion. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica que aporta este repositorio concreto no esta en el entrenamiento, sino en la asignacion de bits por tensor: routers en F32 para evitar derivas de enrutamiento, cabeza de salida en Q6_K para preservar la clasificacion del tokenizer y una mezcla de codebooks no lineales (IQ3_XXS) con bloques lineales para permitir streaming AVX2 en CPU en un solo ciclo.

## Capacidades

- Generacion de texto en ingles y razonamiento profundo con bloques de chain-of-thought explicitos (`<think>`).
- Razonamiento multi-paso y descomposicion de problemas, segun la descripcion de destilacion de trazas de razonamiento de Qwen3.8.
- Tool calling / function calling, mencionado de forma explicita en la model card.
- Vision: entrada de imagenes de alta resolucion y parsing de interfaces graficas mediante el proyector `mmproj` en Q8_0.
- Estabilidad sintactica reforzada en salidas estructuradas (JSON, matematicas, indentacion de codigo) gracias a la cabeza de salida en Q6_K y a los routers sin comprimir.
- Capacidades multilingues: el unico idioma declarado en los metadatos es el ingles.
- Inferencia eficiente en CPU y GPU hibrida, con soporte de ejecucion de bloques lineales en un ciclo AVX2.

## Casos de uso

- Razonamiento asistido en local sobre portatil: con 13,64 GiB de huella de memoria, el modelo puede ejecutarse en un portatil con GPU de 8-12 GB (por ejemplo RTX 4050) descargando parte de las capas a CPU, con velocidades declaradas por el autor de 25 a 28+ tokens/s.
- Atencion al cliente multi-turno: la ventana de 256K tokens permite mantener historiales de conversacion muy largos y documentacion de producto en contexto sin truncar, algo util en sistemas de soporte con base de conocimiento adjunta.
- Analisis de interfaces y automatizacion de escritorio: el proyector de vision permite interpretar capturas de pantalla o interfaces graficas, lo que habilita agentes que interpretan la UI y emiten acciones a traves de tool calling.
- Pipelines de codigo asistido: la cabeza de salida en Q6_K y los routers en F32 estan orientados a preservar indentacion, llaves y sintaxis, lo que reduce errores en generacion de parches y diffs dentro de flujos de CI/CD.
- Razonamiento matematico con salida verificable: el modelo esta disenado para emitir bloques `<think>` seguidos de respuesta final, lo que facilita separar el razonamiento de la solucion y validar el resultado con un checker externo.
- Despliegue en estacion de trabajo de 24 GB: segun el autor, permite servir el contexto completo de 256K tokens integramente en VRAM, habilitando tareas de resumen de repositorios o corpus extensos en una sola GPU consumer de gama alta.
- Prototipado de agentes con llama.cpp: al distribuirse solo en GGUF, encaja directamente en el ecosistema llama.cpp y en herramientas compatibles para construir agentes locales sin dependencia de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, y los resultados de busqueda web obtenidos no son relevantes para este modelo (corresponden a predicciones de precio de criptomonedas y no deben tenerse en cuenta).

Las unicas cifras de rendimiento presentes son afirmaciones del autor sobre velocidad de generacion: 25 a 28+ tokens/s en portatiles de consumo con GPU (Intel Core / AMD Ryzen + RTX 4050) y una seccion de proyecciones de throughput para RTX 30/40/50 que no se detalla en la informacion extraida. No se aportan metodologias de medida, longitudes de prompt ni tamanos de lote, por lo que estas cifras no deben considerarse reproducibles sin verificacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: 13,64 GiB para el modelo completo en la cuantizacion APEX-I-MiniPlus-V2.1 (3,38 BPW), mas 582 MiB si se carga el proyector de vision Q8_0.
- El autor indica que la huella esta disenada especificamente para evitar OOM en hardware de 16 GB y 24 GB de VRAM.
- Afirmacion destacada: el contexto completo de 256K tokens se ejecuta en VRAM de una GPU de 24 GB.
- GPUs objetivo declaradas: RTX 4050 en portatiles de consumo y GPUs de gama alta de 24 GB; la model card menciona proyecciones para familias RTX 30, 40 y 50.
- Configuracion hibrida CPU + GPU: soportada, con ejecucion de bloques lineales en un solo ciclo AVX2 sobre CPU Intel Core o AMD Ryzen.
- Opciones de despliegue: llama.cpp es el runtime principal (formato GGUF); no se mencionan vLLM, TGI, Ollama ni otros backends en la informacion disponible.
- Latencia y throughput: 25 a 28+ tokens/s en portatiles de consumo segun el autor; no se proporcionan cifras de time-to-first-token ni de throughput en GPUs de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en disco | Licencia | Notas |
|---|---|---|---|---|---|
| APEX-I-MiniPlus-V2.1 (este repositorio) | 35B totales / ~3,2B activos | 256K | 14,64 GB (13,64 GiB), 3,38 BPW | Apache-2.0 | Expertos nucleares en IQ3_XXS, routers en F32, output en Q6_K, experto compartido en Q5_K |
| APEX-I-Mini (receta generica) | 35B totales / ~3,2B activos | 256K | Aproximadamente 12,5 GB | Apache-2.0 | Expertos nucleares rebajados a IQ2_S y `output.weight` en Q3_K_M; segun el autor, con penalizacion notable de perplejidad en razonamiento complejo |
| Quant plano de 3 bits (Q3_K_S / IQ3_S) | 35B totales / ~3,2B activos | 256K | Aproximadamente 15,6 GB | Apache-2.0 | Reduccion de bits uniforme por tensor; segun el autor, provoca colapso del router y degeneracion de tokens en modelos de micro-expertos |
| empero-ai/Qwen3.8-35B-A3B-Distill (modelo base) | 35B totales / ~3,2B activos | 256K | No disponible | No disponible | Modelo original sin cuantizar del que derivan las tres builds anteriores |

## Limitaciones y advertencias

- El modelo solo declara ingles como idioma soportado; el rendimiento en castellano u otras lenguas no esta documentado.
- No hay resultados de benchmarks publicados; todas las afirmaciones de calidad y velocidad provienen del autor de la cuantizacion y no han sido verificadas de forma independiente.
- El repositorio tiene 0 descargas y 0 valoraciones en el momento de redactar esta ficha, por lo que no existe retroalimentacion de la comunidad sobre su comportamiento real.
- La cuantizacion a 3,38 BPW implica perdida de precision inevitable respecto a los pesos originales, incluso con la asignacion selectiva de bits; los expertos nucleares en IQ3_XXS son el componente mas agresivamente comprimido.
- Riesgo de alucinacion inherente al modelo base y a los modelos de razonamiento destilados, especialmente en tareas de conocimiento factual y en contextos muy largos.
- El modelo base es una destilacion de Qwen3.8 sobre una arquitectura de 35B con solo ~3,2B parametros activos; es esperable un rendimiento inferior al de modelos densos de tamano similar en tareas que requieren conocimiento amplio.
- La licencia Apache-2.0 se aplica a esta cuantizacion, pero conviene verificar las condiciones del modelo base (empero-ai/Qwen3.8-35B-A3B-Distill) y de Qwen3.8 antes de un uso comercial.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo por idioma, genero o dominio.
- El formato GGUF limita el despliegue a llama.cpp y herramientas compatibles; no hay versiones publicadas para vLLM, TGI u otros servidores de inferencia de alto rendimiento.
- Las fechas de creacion y actualizacion del repositorio (17 de septiembre de 2026) son posteriores a la fecha de los resultados de busqueda disponibles, lo que impide contrastar informacion externa.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- llama.cpp (runtime mencionado en las etiquetas del modelo): no se proporciona enlace directo en la informacion disponible
- Paper, blog de anuncio, repositorio de codigo o demo: no disponibles en la informacion proporcionada
- Resultados de busqueda web: no relevantes para este modelo (corresponden a predicciones de precio de Bitcoin)
