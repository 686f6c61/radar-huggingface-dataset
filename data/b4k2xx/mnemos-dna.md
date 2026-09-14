# B4K2xx/Mnemos-DNA

## Resumen

Mnemos-DNA es una familia de modelos de lenguaje a nivel de carácter para ADN, con aproximadamente 2,3 millones de parámetros, publicada por el autor B4K2xx (Akshat Balyan, 2026) en HuggingFace. El modelo trabaja sobre un vocabulario reducido de bases (A, C, G, T, N) más tokens especiales, y se preentrenó sobre el genoma humano de referencia GRCh38/hg38 usando la partición de cromosomas reservados de HyenaDNA, con 4.500 millones de tokens y un contexto causal de 131.072 pares de bases (pb). El rasgo diferencial es que todo el preentrenamiento se hizo en una única GPU de consumo de 8 GB, lo que sitúa el proyecto en la categoría de modelado genómico a escala "edge".

La arquitectura combina atención lineal con regla delta con puertas (gated delta-rule, KDA) y una memoria de pesos rápidos (fast-weight) organizada por k-mers (bloques de 8-meros en el checkpoint principal). El autor reporta que la atención lineal delta-rule pura tiene un recall exacto nulo a cualquier distancia sobre fondo genómico con este tamaño de estado, y que la memoria por k-mer recupera entre 0,53 y 0,87 nats de ventaja en tareas de copia de repeticiones hasta 64 kbp, resistente a sustituciones de tipo SNP. La inferencia exacta por chunks llega hasta 1 Mbp con 5,6 GB de VRAM.

Su relevancia actual es doble: por un lado, explora memoria lineal eficiente para secuencias ultra-largas en un dominio donde el contexto de megabase es la norma; por otro, el propio autor documenta un resultado negativo relevante (el preentrenamiento con contexto ultra-largo fijo degrada la gramática sub-kilobase), lo que lo convierte en material de interés para investigadores que trabajan en arquitecturas eficientes y en evaluación de modelos genómicos. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atencion lineal con regla delta con puertas (KDA) y memoria fast-weight por k-mer; variantes con atencion local ventaneada. Modelo de lenguaje a nivel de caracter sobre alfabeto de ADN |
| Parametros totales | Entre 2,23M y 2,32M segun checkpoint: D06 2,32M, D07 2,29M, D01 2,25M, D02 2,23M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 pb (128K) en el preentrenamiento principal; D02 usa 262K con NTK-RoPE; inferencia exacta por chunks hasta 1 Mbp |
| Tipos de cuantizacion | No disponible (solo se publican pesos en `model.pt`; no hay versiones cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje natural; opera sobre bases A/C/G/T/N) |
| Licencia | No disponible |
| Formato de pesos | PyTorch state dict (`model.pt` con `model_state_dict`, `config` y `step`) mas `config.yaml`; no compatible con `transformers`, safetensors ni GGUF |

## Arquitectura y entrenamiento

Mnemos-DNA es un transformer causal sustituyendo la atención softmax por mecanismos de estado lineal. El checkpoint principal (D06) usa KDA (gated delta-rule attention) más una memoria de pesos rápidos por cada bloque de 8-meros, lo que permite mantener un estado recurrente que se actualiza con reglas tipo delta y recuperar asociaciones exactas a distancia larga. El checkpoint D07 añade un bloque de atención local con ventana w=256 y un currículum de longitud; D01 es un control puro KDA sin memoria por k-mer y D02 combina KDA con atención local ventaneada y NTK-RoPE sobre 262K de contexto. El modelo opera directamente sobre caracteres (bases), sin tokenizador BPE.

El preentrenamiento se realizó sobre el genoma humano de referencia GRCh38/hg38 con la partición de cromosomas reservados de HyenaDNA, durante 4.500 millones de tokens (5.000 millones en el protocolo previo del control D02) y con contexto causal de 131.072 pb, todo ello en una GPU de consumo de 8 GB. No se documenta en la información disponible ninguna fase de RLHF, DPO ni ajuste por instrucciones, lo cual es coherente con un modelo de modelado de secuencias y no de chat. La innovación principal es la memoria fast-weight por k-mer, que aporta recall exacto a larga distancia donde la atención lineal pura falla; el autor también documenta que el preentrenamiento con contexto ultra-largo fijo daña la gramática sub-kilobase, resultado reproducido sobre HyenaDNA-1M.

## Capacidades

- Modelado generativo y de puntuación de secuencias de ADN a nivel de base (5 símbolos: A, C, G, T, N más tokens especiales).
- Modelado de dependencias de muy largo alcance: contexto de 131.072 pb en entrenamiento y evaluación exacta por chunks hasta 1 Mbp.
- Recall exacto de repeticiones y copia de patrones hasta 64 kbp gracias a la memoria fast-weight por 8-meros (ventaja de 0,53 a 0,87 nats).
- Robustez frente a sustituciones puntuales (SNP) en las tareas de recall evaluadas.
- Puntuar secuencias (cross-entropy por base) y servir como extractor de representaciones para fine-tuning, por ejemplo en sitios de splicing.
- Capacidad de actuar como control experimental de arquitecturas de atención lineal (checkpoint D01, KDA puro).
- No dispone de tool calling, function calling, soporte de agentes, modo thinking, visión ni audio.
- No dispone de capacidades multilingües en el sentido de lenguaje natural.
- No es compatible con la API de `transformers`; requiere el código del repositorio del autor.

## Casos de uso

- Anotación de elementos genómicos a escala de megabase: el modelo puede procesar ventanas de hasta 1 Mbp con inferencia exacta por chunks en 5,6 GB de VRAM, lo que permite puntuar regiones enteras y detectar señales de largo alcance sin segmentar manualmente la secuencia.
- Análisis de repeticiones y elementos móviles: la memoria fast-weight por k-mer fue diseñada para tareas de copia de repeticiones, de modo que es la opción natural dentro de esta familia para estudiar familias de repeticiones y su conservación.
- Puntuación de variantes (SNP): al ser robusto a sustituciones puntuales en las pruebas de recall, sirve como modelo de lenguaje genómico para comparar la verosimilitud de una secuencia de referencia frente a su variante.
- Fine-tuning para predicción de sitios de splicing: el modelo se puede ajustar con secuencias cortas (sub-kilobase), aunque el autor advierte que el preentrenamiento de contexto ultra-largo puede perjudicar esta tarea; conviene usar la inicialización aleatoria como referencia comparativa.
- Investigación en arquitecturas de atención lineal eficiente: los cuatro checkpoints (D01, D02, D06, D07) forman un conjunto de controles emparejados para estudiar el efecto de la memoria por k-mer, la atención local y el currículum de longitud.
- Prototipado en hardware de consumo: al haberse entrenado en una GPU de 8 GB, es viable reproducir o extender el preentrenamiento en un equipo de gama media para experimentos académicos.
- Evaluación de modelos genómicos: sirve como baseline de 2,3M de parámetros con contexto largo frente a modelos mayores, útil para analizar la relación entre tamaño de estado y recuperación exacta de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este dominio. Los únicos datos cuantitativos aportados por el autor son los siguientes:

| Metrica | Valor |
|---|---|
| Cross-entropy en hg38 reservado | ~1,07 nats/base, plana desde 8 K hasta 1 M bp de contexto de evaluacion |
| Recall exacto de KDA puro (D01) | 0 en cualquier distancia sobre fondo genomico |
| Ventaja de copia de repeticiones con memoria por k-mer | 0,53-0,87 nats hasta 64 kbp, robusta a sustituciones SNP |
| Fine-tuning en sitios de splicing | La inicializacion aleatoria supera a los checkpoints preentrenados con contexto ultra-largo fijo; replicado en HyenaDNA-1M |

No se dispone de comparaciones numéricas adicionales con otros modelos en la información proporcionada.

## Requisitos de hardware

- Entrenamiento: una única GPU de consumo de 8 GB de VRAM fue suficiente para preentrenar los 4.500 millones de tokens a 131.072 pb de contexto.
- Inferencia: 5,6 GB de VRAM para inferencia exacta por chunks hasta 1 Mbp.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más (por ejemplo, RTX 3060/4060/3070/4070 y superiores). Los pesos de 2,3M de parámetros ocupan unos pocos megabytes; el consumo lo domina el estado de la memoria de contexto, no los pesos.
- GPU de datacenter (A100, H100) no son necesarias para este modelo; su uso solo tendría sentido para paralelizar barridos de evaluación o reentrenamientos a gran escala.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es compatible con `transformers` ni con formatos GGUF. El despliegue requiere PyTorch y el código del repositorio de GitHub del autor (`build_model`, `load_config`).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La información solo permite comparar de forma explícita con HyenaDNA, citado como referencia del split de cromosomas reservados y como reproducción del resultado negativo sobre contexto ultra-largo (HyenaDNA-1M).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mnemos-DNA (D06) | 2,32M | 131.072 pb de entrenamiento; 1 Mbp en inferencia por chunks | CE ~1,07 nats/base en hg38 reservado; recall 0,53-0,87 nats con memoria k-mer | No disponible | Pesos en HuggingFace, codigo en GitHub |
| HyenaDNA-1M | No disponible | 1 Mbp (segun el nombre del modelo) | Usado como reproduccion del hallazgo de degradacion de gramatica sub-kilobase | No disponible | Referenciado en el paper; no se detallan sus pesos aqui |
| Otros modelos genomicos de tamano comparable (DNABERT, Nucleotide Transformer, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la información proporcionada datos suficientes para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; el modelo se entrena sobre un único genoma de referencia (GRCh38/hg38), por lo que su distribución está fuertemente sesgada hacia la genómica humana y no representa diversidad poblacional.
- Riesgo de alucinación: al ser un modelo generativo de secuencias, puede producir bases plausibles estadísticamente pero incorrectas biológicamente; no debe usarse como fuente de verdad genómica sin validación experimental.
- Limitación crítica de recall: la atención lineal delta-rule pura tiene recall exacto nulo a cualquier distancia en este tamaño de estado; solo las variantes con memoria por k-mer recuperan información exacta, y únicamente hasta 64 kbp en las pruebas reportadas.
- Limitación de gramática local: el propio autor reporta que el preentrenamiento con contexto ultra-largo fijo daña la gramática sub-kilobase y que la inicialización aleatoria supera a estos checkpoints en fine-tuning de sitios de splicing. Esto desaconseja su uso directo para tareas de resolución fina.
- Contexto: 131.072 pb en entrenamiento; la extensión a 1 Mbp es una inferencia por chunks, no un contexto entrenado.
- Compatibilidad: no es compatible con `transformers`, safetensors, GGUF ni con las herramientas estándar de despliegue; requiere el código del repositorio del autor y una versión concreta de PyTorch.
- Licencia: no disponible, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor antes de cualquier uso en producción.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, tamaño de repo reportado de 0,0 GB y publicación reciente; es un artefacto de investigación sin garantías de mantenimiento.
- Idiomas: no aplica lenguaje natural; cualquier evaluación multilingüe carece de sentido para este modelo.

## Enlaces

- HuggingFace: https://huggingface.co/B4K2xx/Mnemos-DNA
- Codigo, harness de evaluacion y paper: https://github.com/B4K2/Mnemos-DNA
- Referencia citada en la model card: HyenaDNA (mencionado como origen del split de cromosomas reservados y como baseline de reproduccion); no se proporciona enlace directo en la informacion disponible.
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (coincidencias irrelevantes con portales escolares WebUntis), por lo que no aportan enlaces adicionales verificables.
