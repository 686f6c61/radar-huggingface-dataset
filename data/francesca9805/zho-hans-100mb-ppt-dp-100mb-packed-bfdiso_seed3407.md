# francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407

## Resumen

El modelo `zho-hans-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407` es un ajuste fino (SFT) del checkpoint monolingüe `goldfish-models/zho_hans_100mb`, un modelo de la familia Goldfish orientado a chino simplificado y entrenado sobre aproximadamente 100 MB de texto en ese idioma. Lo publica el usuario de HuggingFace `francesca9805` y, por los metadatos del repositorio, el ajuste se ha realizado con TRL 0.23.0 sobre un dataset empaquetado ("packed") de 100 MB, con semilla 3407 y bajo el proyecto de Weights & Biases denominado "new-tokenizers", lo que apunta a un experimento de investigación sobre tokenización y ajuste supervisado más que a un modelo de producción.

Técnicamente es un transformer decoder-only de la familia GPT-2 con 124.770.816 parámetros totales (dato leído directamente del fichero de safetensors), empaquetado en un repositorio de 0,3 GB. No hay información publicada sobre longitud de contexto, licencia, idiomas del ajuste ni composición exacta del dataset de SFT, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia es limitada y acotada al ámbito experimental: sirve como ejemplo reproducible de un pipeline de SFT con TRL sobre un modelo monolingüe pequeño, y como punto de partida para estudiar cómo afecta el ajuste supervisado a un modelo base con solo 100 MB de datos de entrenamiento por idioma. No es un modelo competitivo frente a alternativas multimodelo de tamaño similar en tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en los metadatos de HuggingFace) |
| Parametros totales | 124.770.816 (dato real de safetensors) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos sin cuantizar; al estar en safetensors es cuantizable con herramientas estandar como bitsandbytes o GPTQ, pero no hay variantes oficiales) |
| Idiomas soportados | el modelo base es monolingue de chino simplificado (`zho_hans`); la model card no declara los idiomas del ajuste fino |
| Licencia | no disponible (la model card incluye un marcador de posicion `licence: license` sin contenido juridico) |
| Formato de pesos | safetensors, compatible con `transformers` y etiquetado como `text-generation-inference` y `endpoints_compatible` |
| Tamano del repositorio | 0,3 GB |
| Modelo base | `goldfish-models/zho_hans_100mb` |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Fecha de publicacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, tal como indican las etiquetas del repositorio. El recuento de 124.770.816 parámetros es coherente con un modelo de escala GPT-2 small, si bien la ficha no detalla el numero de capas, dimensiones ocultas ni cabezas de atencion, ni el tamano del vocabulario del tokenizador. El modelo base, `goldfish-models/zho_hans_100mb`, pertenece a la coleccion Goldfish de modelos monolingues, en este caso para chino simplificado, entrenado sobre unos 100 MB de texto de ese idioma; no se dispone de mas detalle sobre la composicion del corpus original.

El ajuste se ha realizado mediante aprendizaje supervisado (SFT) con TRL, sobre un dataset empaquetado de 100 MB identificado en el nombre del modelo como "ppt-Dp-100mb-packed", con semilla 3407. El run asociado esta registrado en Weights & Biases bajo el proyecto "new-tokenizers", lo que sugiere que el experimento forma parte de una linea de trabajo sobre tokenizacion y ajuste. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO; tampoco describe innovaciones tecnicas como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva condicionada por prompt, en el formato de chat simple que muestra la model card (lista de mensajes con rol `user`).
- Generacion en chino simplificado, heredada del modelo base monolingue; no hay evidencia publicada de capacidad multilingue.
- Ajuste supervisado orientado a seguir instrucciones simples, aunque sin evaluacion publica que lo confirme.
- Compatibilidad con el pipeline `text-generation` de `transformers` y despliegue en Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, uso agente, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se documenta capacidad de codigo ni de matematicas mas alla de lo que pudiera heredar del modelo base, sin datos que lo respalden.

## Casos de uso

- Experimentacion academica con pipelines de SFT: el modelo sirve para reproducir un flujo completo de TRL sobre un modelo monolingue pequeno, comparando configuraciones y semillas en un entorno de bajo coste computacional.
- Investigacion sobre tokenizacion: dado que el run asociado pertenece al proyecto "new-tokenizers", es util como checkpoint de referencia para medir el efecto de distintas estrategias de tokenizacion en modelos de 100 MB de datos.
- Pruebas de integracion de infraestructura: al ser un modelo de 0,3 GB y 124,7 M de parametros, permite validar extremo a extremo un despliegue en TGI, endpoints compatibles o `transformers` sin consumir recursos significativos.
- Estudio de olvido catastrofico: comparar sus salidas en chino con las del modelo base `goldfish-models/zho_hans_100mb` permite cuantificar cuanto conocimiento monolingue se degrada tras el SFT.
- Generacion de texto de baja exigencia en chino simplificado para prototipos internos: borradores, textos de relleno o ejemplos sinteticos donde la calidad no sea critica y el coste de inferencia deba ser minimo.
- Docencia y demostraciones: es adecuado para explicar en clase el ciclo de vida de un ajuste fino (dataset, empaquetado, semilla, publicacion en HuggingFace) con un modelo que cabe en CPU.
- Base para ajustes posteriores: puede actuar como punto de partida para experimentos de SFT con otros datasets o de alineacion (DPO) a escala reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no se dispone de comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, unos 0,50 GB; en bf16/fp16, unos 0,25 GB; en int8, unos 0,12 GB; en int4, unos 0,06 GB. A ello hay que sumar el coste del cache KV, que depende del contexto efectivo (no disponible) y del numero de capas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para los pesos y el cache en contextos cortos; no se requiere A100, H100 ni hardware de centro de datos.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y practicamente cualquier GPU integrada moderna con soporte CUDA o ROCm; tambien es viable en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`, Text Generation Inference (TGI) por las etiquetas del repositorio, y conversion a GGUF para llama.cpp u Ollama si se generan los ficheros correspondientes (no publicados).
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407` | 124,77 M | no disponible | no disponible | safetensors en HuggingFace |
| `goldfish-models/zho_hans_100mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | safetensors en HuggingFace |
| Alternativas de escala similar (por ejemplo, modelos GPT-2 small o GPT-Neo-125M) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguna de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: la model card solo contiene el marcador de posicion `licence: license`, por lo que no hay base juridica clara para uso comercial. Conviene contactar con el autor o con el titular del modelo base antes de cualquier uso en produccion.
- Riesgo alto de alucinacion y de texto incoherente: el modelo base se entreno con unos 100 MB de texto, un volumen muy reducido, y el ajuste posterior no documenta el dataset ni el numero de tokens.
- Posible olvido catastrofico del conocimiento del modelo base tras el SFT, sin evaluacion publicada que lo cuantifique.
- Ambito idiomatico muy restringido: monolingue de chino simplificado en origen, sin capacidades multilingues documentadas. No cabe esperar buen rendimiento en castellano ni en otras lenguas.
- Limitaciones de contexto: la longitud maxima de contexto no esta publicada, por lo que no puede garantizarse el manejo de conversaciones largas ni de documentos extensos.
- Ausencia total de benchmarks: no hay evidencia publica de calidad en generacion, razonamiento, codigo o matematicas.
- Sin soporte documentado de tool calling, agentes o flujos multi-paso, lo que descarta su uso en arquitecturas de agentes.
- Sesgos potenciales desconocidos: no se documenta la composicion del corpus de entrenamiento del modelo base ni del dataset de ajuste, por lo que no pueden evaluarse sesgos de genero, etnia, religion o sesgos politicos propios del corpus chino utilizado.
- Repositorio sin adopcion: cero descargas y cero interacciones en el momento de redactar esta ficha, lo que implica ausencia de validacion externa.
- No es un modelo apto para produccion sin una evaluacion previa propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/zho_hans_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/k2pue3lo
- Repositorio de TRL: https://github.com/huggingface/trl
