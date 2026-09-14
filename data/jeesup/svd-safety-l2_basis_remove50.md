# Jeesup/svd-safety-l2_basis_remove50

## Resumen

svd-safety-l2_basis_remove50 es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante Basis Sharing (ICLR 2025), una técnica que comparte bases SVD entre grupos de dos capas adyacentes y elimina el 50,00 % de los parámetros densos (fracción de parámetros resultante: 0,4998). Sobre esa base comprimida se aplicó una recuperación con LoRA de rango 8 restringida exclusivamente a los coeficientes por capa, manteniendo congeladas las bases compartidas y sin alterar el presupuesto de parámetros. El resultado es un modelo de 6.738.415.616 parámetros en formato safetensors, publicado por el usuario Jeesup.

El modelo no es un asistente conversacional de propósito general: es un artefacto de investigación construido para medir cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes repara mejor ese daño. Corresponde a una única celda de una rejilla experimental sobre reglas de selección y presupuestos de compresión, con semilla 42 y recuperación sobre el dataset alpaca-cleaned durante 2 épocas. El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

Su relevancia es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, y proporciona métricas reproducibles (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard y perplejidad en WikiText-2) que permiten comparar reglas de selección de componentes. Está sujeto a la Llama 2 Community License y no debería desplegarse como asistente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 2), con bases SVD compartidas entre grupos de 2 capas adyacentes y coeficientes LoRA |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens, heredada de `meta-llama/Llama-2-7b-chat-hf`; no se especifica en la model card |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible; el modelo base esta entrenado principalmente en ingles, pero la model card no lo declara |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (tamano del repositorio: 13,5 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder denso de tipo Llama 2 con 7.000 millones de parametros nominales. Sobre ese checkpoint se aplica Basis Sharing (ICLR 2025): las matrices de pesos se descomponen por SVD y las bases resultantes se comparten entre grupos de dos capas adyacentes, lo que permite eliminar el 50,00 % de los parametros densos conservando una fraccion final de 0,4998. Esta compresion estructural es el eje del experimento: no se trata de una cuantizacion numerica, sino de una reduccion del rango efectivo con bases reutilizadas entre capas.

La recuperacion posterior consiste en un ajuste fino LoRA de rango 8 aplicado unicamente a los coeficientes por capa, con las bases congeladas y el presupuesto de parametros inalterado. El entrenamiento fue de 2 epocas, con learning rate 1e-4, batch 64, semilla 42 y el dataset alpaca-cleaned. No se documentan en la informacion disponible el volumen total de tokens de entrenamiento del modelo base, la composicion completa del dataset de recuperacion ni si hubo etapas de RLHF o DPO adicionales mas alla del alineamiento ya presente en Llama-2-7b-chat.

## Capacidades

- Generacion de texto conversacional en ingles heredada de Llama-2-7b-chat, aunque degradada respecto al modelo original por el efecto de la compresion.
- Razonamiento basico y respuesta a instrucciones propias de un modelo de 7B de la familia Llama 2.
- Capacidad de operar con plantillas de chat de Llama 2 (el tokenizer y el formato de prompt no se modifican en la model card).
- Etiquetado como `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con despliegue mediante TGI y con endpoints gestionados.
- No se declara soporte de tool calling, function calling ni uso agentico.
- No se declara soporte de vision, audio ni modalidades adicionales.
- No se declara un modo de razonamiento extendido (thinking mode).
- Multilingue: no disponible; la model card no especifica idiomas y el modelo base esta orientado principalmente al ingles.

## Casos de uso

- Medicion de la degradacion de seguridad por compresion: usar este checkpoint como celda experimental para cuantificar el aumento de la tasa de exito de ataque (ASR) frente a Llama-2-7b-chat sin comprimir, con AdvBench y StrongREJECT como arneses y HarmBench como juez.
- Ablacion de reglas de seleccion de componentes: comparar esta celda con otras de la misma rejilla para determinar que criterio de seleccion de rangos y bases preserva mejor el comportamiento de seguridad a presupuestos equivalentes.
- Estudio del sobre-rechazo: emplear la metrica de sobre-rechazo macro medida con WildGuard (0,0930) para analizar el equilibrio entre rechazo de peticiones daninas y falsos positivos sobre peticiones legitimas.
- Investigacion de interpretabilidad de bases compartidas: analizar las bases SVD compartidas entre pares de capas adyacentes para estudiar que subespacios de pesos son redundantes y como se relacionan con comportamientos concretos.
- Evaluacion de metodos de recuperacion: usar el ajuste LoRA sobre coeficientes con bases congeladas como linea base para comparar otras estrategias de recuperacion (LoRA completo, ajuste de bases, destilacion) manteniendo el presupuesto de parametros.
- Control negativo en pipelines de red teaming: incorporar el checkpoint como referencia deliberadamente vulnerable para validar que los clasificadores y jueces de seguridad de un pipeline detectan respuestas nocivas.
- Reproduccion academica: replicar el experimento de compresion y recuperacion con semilla 42 y el dataset alpaca-cleaned para verificar la reproducibilidad de las metricas publicadas.
- Analisis de calidad de lenguaje bajo compresion: medir el impacto en la perplejidad de WikiText-2 (13,2061) frente al modelo base para separar la perdida de fluidez de la perdida de seguridad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,5846 |
| StrongREJECT ASR (juez HarmBench) | 0,3387 |
| Sobre-rechazo macro (WildGuard) | 0,0930 |
| Perplejidad en WikiText-2 | 13,2061 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, GSM8K, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 15-16 GB en inferencia).
- VRAM estimada en 8 bits: aproximadamente 7 GB para pesos.
- VRAM estimada en 4 bits: aproximadamente 3,5-4 GB para pesos, si se generan cuantizaciones propias (no se publican variantes GGUF/AWQ/GPTQ).
- GPU profesionales: A100 40 GB, H100 80 GB o A6000 48 GB sin problema en fp16; L40S 48 GB tambien es suficiente.
- GPU de consumo: cabe en fp16 en RTX 4090 (24 GB) y RTX 3090 (24 GB); en 4 bits puede caber en tarjetas de 8-12 GB, como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta oficial del repositorio) y vLLM por compatibilidad con la arquitectura Llama; llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_basis_remove50 | 6.738.415.616 (50,00 % del denso) | 4.096 (heredado) | Llama 2 Community License | Artefacto de investigacion, ASR AdvBench 0,5846, perplejidad WikiText-2 13,2061 |
| meta-llama/Llama-2-7b-chat-hf | 7B (denso) | 4.096 | Llama 2 Community License | Modelo base sin comprimir; referencia de partida del experimento |
| Otras celdas de la rejilla del mismo autor | Fracciones de parametros variables | No disponible | Llama 2 Community License | No se han localizado en la informacion proporcionada |
| Alternativas comprimidas de la misma categoria | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de benchmarks comparativos entre este checkpoint y otras alternativas, por lo que la comparacion de rendimiento no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo describe explicitamente como un sujeto experimental, no como un asistente utilizable en produccion.
- Degradacion de seguridad deliberada: la tasa de exito de ataque en AdvBench es de 0,5846, muy alta, y el estudio indica que la compresion por si sola eleva el ASR respecto a Llama-2-7b-chat.
- Riesgo elevado de generar contenido danino, con una tasa de exito del 33,87 % en StrongREJECT.
- Perdida de calidad de lenguaje: la perplejidad de 13,2061 en WikiText-2 refleja el coste de la compresion en fluidez y coherencia.
- Sobre-rechazo moderado: la metrica macro con WildGuard es de 0,0930, lo que indica falsos positivos sobre peticiones legitimas.
- Riesgo de alucinacion no cuantificado en la informacion disponible, agravado por la compresion y por la falta de benchmarks de conocimiento.
- Idiomas: no declarados; el modelo base esta orientado al ingles y no hay evidencia de soporte multilingue.
- Longitud de contexto limitada a 4.096 tokens heredados del modelo base, insuficiente para tareas de contexto largo.
- Restricciones de licencia: Llama 2 Community License y `USE_POLICY.md` vinculantes; uso comercial condicionado a los terminos de Meta, con clausula de 700 millones de usuarios activos mensuales y obligacion de incluir la atribucion "Built with Llama 2".
- Sin datos de cuantizacion publicados: cualquier despliegue en precision reducida exige cuantizar el modelo uno mismo, con el riesgo adicional de alterar el comportamiento de seguridad ya degradado.
- Fecha de creacion del repositorio registrada como 2026-09-14 y cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Referencia citada en la model card: Basis Sharing (ICLR 2025), sin URL proporcionada en la informacion disponible
- No se han encontrado otros enlaces relevantes en la busqueda web: los resultados devueltos corresponden a sitios institucionales sin relacion con el modelo.
