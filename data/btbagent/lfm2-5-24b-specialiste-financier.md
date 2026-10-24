# BtbAgent/lfm2.5-24B-specialiste-financier

## Resumen

`BtbAgent/lfm2.5-24B-specialiste-financier` es un repositorio de Hugging Face publicado por el usuario BtbAgent bajo la librería `transformers`. Por el identificador se deduce que se trata de un ajuste fino (fine-tune) orientado al dominio financiero sobre un modelo de la familia LFM2, con un tamaño declarado de 24 000 millones de parámetros; el sufijo en francés («specialiste-financier») sugiere además un enfoque hacia el idioma francés. Ninguna de estas deducciones está confirmada por el autor.

El estado actual del repositorio impide cualquier evaluación técnica: el tamaño del repo es de 0,0 GB, es decir, no se han subido pesos ni tokenizador, y la model card es la plantilla autogenerada de Hugging Face con todos los campos marcados como `[More Information Needed]`. No se declara licencia, ni idiomas, ni pipeline, ni arquitectura, ni datos de entrenamiento, y el modelo acumula 0 descargas y 0 «likes» desde su creación el 23 de octubre de 2026.

La relevancia presente de esta ficha es, por tanto, documental y de advertencia: sirve para dejar constancia de que el checkpoint no es utilizable en producción ni en investigación, y para enumerar qué datos habría que exigir al autor antes de considerarlo. Cualquier cifra de capacidades, contexto o rendimiento que se atribuya a este modelo sería especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el identificador apunta a la familia LFM2, sin confirmar) |
| Parámetros totales | No disponible (el identificador indica 24B, sin confirmar) |
| Parámetros activos | No disponible (no se confirma si es MoE o denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el tag `safetensors` sugiere pesos en ese formato, pero no hay ficheros en el repo) |
| Idiomas soportados | No disponible (el sufijo en francés del nombre sugiere francés, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | Tag `safetensors` declarado; el repositorio es de 0,0 GB y no contiene ficheros |

Otros metadatos verificables: autor `BtbAgent`, librería `transformers`, pipeline no declarado, región `us`, compatibilidad declarada con endpoints (`endpoints_compatible`), fecha de creación 2026-10-23T23:55:41Z y última actualización 2026-10-23T23:55:50Z (9 segundos después, lo que indica una subida automatizada sin contenido posterior).

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura. La model card no especifica si se trata de un transformer denso, de una mezcla de expertos (MoE), de un modelo híbrido con capas convolucionales o de espacio de estados, ni detalla la función objetivo, el número de tokens de entrenamiento, la composición del corpus, las fases de ajuste (SFT, RLHF, DPO) ni hiperparámetros como la precisión mixta o el régimen de entrenamiento.

El único elemento técnico reseñable en los tags es `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la propia plantilla de model card de Hugging Face. No es un paper asociado al modelo y no aporta información sobre su construcción. Tampoco se documentan la infraestructura de cómputo, las horas de GPU ni el impacto ambiental.

## Capacidades

- Generación de texto: no verificable; no hay demo, pesos ni ejemplos de uso.
- Razonamiento y matemáticas: no verificable.
- Generación de código: no verificable.
- Tool calling / function calling: no verificable.
- Comportamiento agéntico y razonamiento multi-paso: no verificable.
- Capacidades multilingües: no verificable; no se declara lista de idiomas.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.
- Especialización financiera: anunciada únicamente en el nombre del repositorio, sin evidencia documental, dataset ni evaluación que la respalde.

## Casos de uso

Los siguientes escenarios son hipotéticos y solo serían aplicables si el autor publicase los pesos, la licencia y una evaluación reproducible. Se incluyen porque delimitan el nicho declarado del modelo:

- Análisis de documentación financiera en francés: informes anuales, estados financieros y documentos de datos fundamentales (KID/PRIIPs) requerirían una ventana de contexto larga y una tokenización adecuada del francés financiero; ninguno de los dos extremos está confirmado.
- Extracción estructurada de datos: convertir tablas de balances y cuentas de resultados en JSON validado mediante salida estructurada o tool calling, con verificación posterior contra el documento original.
- Resumen regulatorio asistido: síntesis de normativa (IFRS, MiFID II) para revisión humana por parte de equipos de compliance, nunca como salida directa al cliente.
- Atención al cliente en banca o seguros: conversaciones multi-turno en francés con derivación a un humano cuando la consulta implique asesoramiento financiero regulado.
- Clasificación y filtrado de noticias y notas de rating: etiquetado de eventos corporativos para alimentar un pipeline de alertas, siempre con umbrales de confianza y revisión por muestreo.
- Copiloto de analista con RAG: preguntas y respuestas sobre un corpus interno de research, donde el modelo solo redacta a partir de fragmentos recuperados y cita la fuente.
- Línea base de investigación: referencia para comparar fine-tunes financieros del mismo tamaño en tareas de finanzas en francés, siempre que se publiquen los artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones de cálculo a partir de los 24 000 millones de parámetros que sugiere el identificador, no medidas sobre este checkpoint, que no contiene pesos:

- VRAM en BF16/FP16: en torno a 48 GB solo para pesos, más caché KV y activaciones; requiere A100 80 GB, H100 80 GB o 2× L40S 48 GB.
- VRAM en FP8/INT8: aproximadamente 24-26 GB de pesos; encaja en A100 40 GB o L40S 48 GB con contexto moderado.
- VRAM en 4 bits (GPTQ, AWQ o NF4): aproximadamente 13-15 GB de pesos; ejecutable en una RTX 4090 o RTX 3090 de 24 GB, con contexto limitado por la caché KV restante.
- VRAM en 3 bits: en torno a 10-11 GB, viable en GPUs de 16 GB con penalización de calidad no cuantificada.
- GPU de consumo: solo viable en 4 bits o inferior; no cabe en 12 GB ni en 16 GB con precisión completa.
- Opciones de despliegue: vLLM o TGI para servir en FP16/FP8, llama.cpp u Ollama para GGUF en cuantización baja. Ninguna es aplicable hoy porque el repositorio no contiene ficheros de pesos ni de tokenizador, y no se ha publicado ningún GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas dentro de la información proporcionada. La tabla siguiente recoge únicamente lo constatable y señala explícitamente los huecos; los datos de los modelos de referencia son de conocimiento general del sector y deben verificarse antes de citarlos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| BtbAgent/lfm2.5-24B-specialiste-financier | 24B según el identificador, sin confirmar | No disponible | No disponible | No: repositorio de 0,0 GB |
| LFM2-24B-A2B (Liquid AI, familia de referencia) | 24B totales con expertos activos reducidos, según información pública del fabricante | No verificado en esta búsqueda | Licencia propia de Liquid AI, con condiciones comerciales | Sí, publicada por el fabricante |
| Mistral Small 3.x 24B | 24B densos | 128k según documentación del fabricante | Apache 2.0 | Sí |
| Gemma 3 27B | 27B densos | 128k según documentación del fabricante | Licencia Gemma | Sí |

## Limitaciones y advertencias

- Repositorio vacío: 0,0 GB de tamaño. No hay pesos, tokenizador, configuración ni ficheros GGUF; el modelo no se puede descargar ni ejecutar.
- Ausencia total de model card: todos los campos están sin rellenar, incluidos los de uso previsto, uso fuera de alcance, sesgos y evaluación.
- Licencia no declarada: sin licencia explícita no hay permiso claro de uso comercial, redistribución ni modificación; en la práctica equivale a derechos reservados por defecto.
- Idiomas no declarados: no se puede confirmar el soporte de francés ni de castellano, pese a lo que sugiere el nombre.
- Riesgo de alucinación en dominio financiero: cualquier modelo especializado en finanzas sin evaluación publicada puede generar cifras, referencias normativas o datos contables plausibles pero falsos; en un contexto regulado esto es un riesgo material.
- Sin datos de entrenamiento: se desconoce la composición del corpus, la posible contaminación de benchmarks y los sesgos de dominio o de idioma.
- Trazabilidad dudosa: creación y actualización separadas por 9 segundos, cero descargas y cero interacciones; no hay historial de versiones ni commits de contenido.
- El tag `endpoints_compatible` no implica que exista un proveedor de inferencia disponible para este repositorio.
- El tag `arxiv:1910.09700` no es un paper del modelo, sino la referencia al calculador de emisiones de la plantilla; no debe citarse como documentación técnica.
- Recomendación: no incluir este identificador en pipelines, evaluaciones comparativas ni documentación de producto hasta que el autor publique pesos, licencia, idiomas y resultados.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/BtbAgent/lfm2.5-24B-specialiste-financier
- Árbol de ficheros del repositorio: https://huggingface.co/BtbAgent/lfm2.5-24B-specialiste-financier/tree/main
- Artículo citado en el tag `arxiv:1910.09700` (Lacoste et al., estimación de emisiones; no es documentación del modelo): https://arxiv.org/abs/1910.09700
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos asociados a este modelo.
