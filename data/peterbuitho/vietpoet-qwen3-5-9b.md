# peterbuitho/VietPoet-Qwen3.5-9B

## Resumen

VietPoet-Qwen3.5-9B es un ajuste fino del modelo base Qwen/Qwen3.5-9B realizado por el usuario peterbuitho para una tarea muy concreta: la generacion de poesia vietnamita en la forma metrica **luc bat** (versos de seis y ocho silabas con reglas estrictas de tono y rima). El modelo parte de los 9.653.104.368 parametros del base y ha sido entrenado con QLoRA sobre unas 8.000 composiciones del corpus phamson02/vietnamese-poetry-corpus, con la LoRA fusionada en los pesos finales, de modo que se distribuye como un safetensors en bf16 de unos 18 GB (19,3 GB de repositorio).

La relevancia de este modelo no esta en su tamano, sino en el enfoque de evaluacion: el autor publica una metrica de forma (rule score = 0,1 longitud + 0,3 tono + 0,6 rima) sobre 100 prompts reservados, y reconoce explicitamente que el modelo en crudo solo produce un 14 % de poemas plenamente validos, cifra que sube al 98 % cuando se combina con el muestreador linea a linea de su repositorio ThoLucBat. Es, por tanto, un ejemplo de ajuste fino de dominio estrecho donde el modelo no se presenta como autonomo, sino como un componente dentro de un pipeline con verificacion de reglas.

El modelo esta publicado bajo licencia Apache-2.0, solo soporta vietnamita y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones en HuggingFace. El propio autor advierte que las metricas miden forma y no calidad literaria: los poemas son metricamente correctos pero a menudo divagan o se alejan del tema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base Qwen/Qwen3.5-9B, familia Qwen3.5) |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible (la longitud maxima usada en el ajuste fue de 1024 tokens) |
| Tipos de cuantizacion | bf16 en safetensors (~18 GB); versiones GGUF en repositorio aparte (tipos concretos no especificados); QLoRA en 4 bits usada solo durante el entrenamiento |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16); GGUF en peterbuitho/VietPoet-Qwen3.5-9B-GGUF |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de ajuste | QLoRA (base en 4 bits), r=16, alpha=16, lr 2e-4, 2 epocas, batch 2 x grad-accum 4, longitud maxima 1024, Unsloth 2026.9.7; LoRA fusionada en los pesos |
| Dataset de entrenamiento | phamson02/vietnamese-poetry-corpus (CC BY 4.0), filtrado por un verificador de reglas de luc bat; ~8.000 poemas |
| Tamano del repositorio | 19,3 GB |
| Fecha de publicacion | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se detallan en la informacion disponible las caracteristicas internas de la arquitectura (numero de capas, atencion, uso de MoE o de atencion lineal). Se sabe que hereda la arquitectura del modelo base Qwen/Qwen3.5-9B, que se distribuye con la libreria transformers y que el pipeline declarado es text-generation. El tag image-text-to-text presente en la ficha de HuggingFace sugiere capacidad multimodal en el base, pero no hay ninguna confirmacion ni evaluacion de esa capacidad tras el ajuste.

El entrenamiento consistio en un QLoRA sobre el modelo base cuantizado a 4 bits, con rango 16, alpha 16, tasa de aprendizaje 2e-4, dos epocas, batch efectivo de 8 (batch 2 con acumulacion de gradiente 4) y longitud maxima de 1024 tokens, usando Unsloth 2026.9.7. La configuracion completa esta en `runs/sft-9b-v1/train_config.json` dentro del repositorio. Los datos de partida son un corpus de poesia vietnamita filtrado para conservar solo los poemas que pasan un verificador de reglas de luc bat, de modo que el ajuste es de estilo y forma, no de conocimiento general. No se menciona uso de RLHF ni de DPO.

La innovacion destacable no esta en el modelo sino en el pipeline que lo acompana: el repositorio github.com/peterbuitho/ThoLucBat implementa un muestreador linea a linea (16 muestras por verso) que selecciona la variante que satisface las reglas de tono y rima, mas un verificador de reglas. La idea de puntuacion de forma se inspira en el paper arXiv:2401.01078 sobre generacion de poesia vietnamita y traduccion poema-a-poema entre idiomas.

## Capacidades

- Generacion de texto en vietnamita, orientada especificamente a la composicion de poemas luc bat.
- Respeto de la estructura metrica de seis-ocho silabas y de las reglas de rima cuando se usa junto al muestreador linea a linea del repositorio ThoLucBat.
- Generacion de poemas completos por titulo o tema indicado en el prompt (por ejemplo, "8 cau ve mua thu que em").
- Formato de chat estilo Qwen con el modo de razonamiento desactivado; el sampler anade cada verso al turno del asistente de forma incremental.
- Capacidades conversacionales heredadas del modelo base Qwen3.5-9B, no evaluadas ni garantizadas tras el ajuste de dominio.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso en esta version ajustada.
- Multilingue: solo vietnamita declarado; no se documenta ninguna otra lengua.

## Casos de uso

- Generacion de poemas luc bat con verificacion de forma en produccion: integrando el modelo en el sampler de ThoLucBat, que genera 16 candidatos por verso y conserva el que cumple las reglas, se pasa de un 14 % a un 98 % de poemas plenamente validos sobre los 100 prompts reservados del autor. Es el uso para el que fue disenado.
- Composicion editorial asistida: editoriales o revistas literarias vietnamitas pueden generar borradores metricamente correctos a partir de un titulo y despues revisar y reescribir manualmente el contenido semantico, que segun el propio autor suele ser flojo o desviado.
- Aplicaciones educativas sobre metrica vietnamita: al tener un verificador de reglas asociado, el pipeline permite mostrar al alumnado por que un verso rompe la rima o el tono de la sexta/octava silaba, con un porcentaje medible de cumplimiento.
- Generacion de letras para musica o recitado: el modelo sirve como borrador de letras con estructura luc bat fija, adecuada para canciones populares vietnamitas, siempre con revision humana del significado.
- Tarjetas, postales y contenido personalizado: un servicio puede generar un poema de ocho versos a partir de un tema introducido por el usuario y aplicar el filtro de reglas antes de entregarlo; el coste computacional del muestreo multiple es el principal factor a presupuestar.
- Investigacion sobre evaluacion de poesia generada: el par modelo + sampler permite reproducir la metrica de rule score (0,1 longitud, 0,3 tono, 0,6 rima) y comparar variantes de muestreo o de ajuste con una referencia cuantitativa publicada.
- Base para nuevos ajustes de dominio sobre poesia vietnamita: al ser un safetensors bf16 con Apache-2.0 y con la receta QLoRA documentada, sirve como punto de partida para experimentos con otros generos metricos o con mas datos.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre 100 prompts reservados de tipo "8 cau" (ocho versos) con una puntuacion de reglas entre 0 y 1, compuesta por 0,1 de longitud, 0,3 de tono y 0,6 de rima. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

| Metrica (100 prompts reservados) | Modelo en crudo | Con muestreador linea a linea (16 muestras por verso) |
|---|---|---|
| Rule score medio | 0,829 | 0,994 |
| Poemas plenamente validos | 14 % | 98 % |
| Versos bat que rompen la regla de tono en la 6.ª/8.ª silaba | 10 % | no disponible |

Advertencia del propio autor: estas cifras miden forma, no poesia. Los poemas son luc bat correctos pero el significado a menudo es difuso o se aleja del tema, porque los prompts de entrenamiento solo incluian el titulo como asunto.

## Requisitos de hardware

- Inferencia en bf16 (safetensors): pesos de unos 18 GB; se recomienda un minimo de 20-24 GB de VRAM contando cache KV y overhead.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S 48 GB, RTX 4090 24 GB o RTX 3090 24 GB (estas ultimas al limite, con contexto corto).
- GPU de consumo: cabe en tarjetas de 24 GB en bf16 y en tarjetas de 8-12 GB usando las versiones GGUF cuantizadas (el autor remite al repositorio GGUF para LM Studio y llama.cpp). No se especifican en la informacion disponible los tipos exactos de cuantizacion ni sus tamanos.
- Opciones de despliegue: transformers y vLLM para el safetensors bf16; llama.cpp, LM Studio y, presumiblemente, Ollama para la version GGUF. No se documentan otras integraciones.
- Latencia y throughput: no disponibles. El pipeline con sampler multiplica el coste por verso (16 muestras por linea), por lo que el coste real de generar un poema de ocho versos es muy superior al de una generacion unica.
- El ajuste se realizo con longitud maxima de 1024 tokens; no hay datos publicados sobre comportamiento con contextos mas largos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (ajustes de poesia vietnamita luc bat) en la informacion proporcionada. La unica referencia directa disponible es el modelo base del que deriva:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VietPoet-Qwen3.5-9B | 9,65 B | no disponible | Poesia luc bat en vietnamita, con sampler de reglas | Apache-2.0 | safetensors bf16 y GGUF |
| Qwen/Qwen3.5-9B (base) | 9,65 B | no disponible | Proposito general, multilingue | Apache-2.0 | safetensors |
| Otros ajustes de poesia vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo en crudo rompe la regla de tono en la 6.ª/8.ª silaba de aproximadamente el 10 % de los versos bat; sin el muestreador y el verificador de reglas del repositorio ThoLucBat, solo un 14 % de los poemas resultan plenamente validos.
- Las metricas publicadas miden forma, no calidad literaria. El propio autor indica que el significado suele ser difuso o estar fuera de tema, porque el entrenamiento solo usaba el titulo como asunto.
- Riesgo de alucinacion y de contenido semanticamente incoherente: el ajuste es de estilo y no refuerza el conocimiento factual del base.
- Limitacion idiomatica severa: solo se declara vietnamita. Cualquier uso en castellano u otras lenguas no esta soportado ni evaluado.
- Longitud de contexto: no documentada para el modelo ajustado; el entrenamiento se hizo con 1024 tokens, lo que limita la generacion fiable de composiciones largas.
- El modelo esta pensado para usarse con un formato de chat concreto (Qwen, con el bloque de razonamiento vacio y anadiendo cada verso al turno del asistente). Usarlo con otro formato puede degradar los resultados.
- Requiere revision humana en cualquier uso editorial o publico: la forma correcta no implica contenido adecuado.
- Licencia: el modelo se publica bajo Apache-2.0, lo que permite uso comercial, pero el dataset de entrenamiento (phamson02/vietnamese-poetry-corpus) es CC BY 4.0 y exige atribucion; conviene revisar las obligaciones derivadas de los datos.
- Adopcion nula en el momento de la ficha (0 descargas, 0 valoraciones) y sin validacion independiente de los resultados publicados por el autor.
- El tag image-text-to-text de la ficha sugiere capacidades multimodales heredadas del base, pero no hay ninguna evaluacion ni confirmacion de que se conserven tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-9B
- Version GGUF: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-9B-GGUF
- Repositorio del sampler y verificador de reglas: https://github.com/peterbuitho/ThoLucBat
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/phamson02/vietnamese-poetry-corpus
- Paper de referencia sobre puntuacion y traduccion de poesia vietnamita: https://arxiv.org/abs/2401.01078
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles proceden de la ficha de HuggingFace y de su model card.
