# iamtatsuki05/ModernBERT-JP-0.5B-settings

## Resumen

ModernBERT-JP-0.5B-settings es un repositorio de configuracion, no un modelo con pesos entrenados, publicado por el desarrollador independiente iamtatsuki05 dentro del proyecto MIREI. Define una arquitectura ModernBERT a escala de 0,5B de parametros, alineada en tamano con sbintuitions/sarashina2.2-0.5b y reutilizando su tokenizador SentencePiece con un vocabulario de 102.400 tokens. Su proposito es servir como punto de partida reproducible para inicializar modelos enmascarados (masked-LM) en japones, concretamente el modelo derivado iamtatsuki05/ModernBERT-JP-0.5B-init.

El interes tecnico radica en la combinacion de una arquitectura encoder-only moderna (ModernBERT, con RoPE, atencion alterna local/global y Flash Attention) con una longitud de contexto de 8.192 tokens y un vocabulario japones amplio, algo poco habitual en modelos BERT japoneses. Al ser solo configuracion, no contiene pesos: cualquier uso real requiere entrenamiento o carga de un checkpoint derivado. El repositorio es relevante para investigadores que quieran reproducir o extender la linea MIREI de analisis comparativo entre arquitecturas encoder y decoder para embeddings de frases en japones.

La licencia MIT y el formato estandar de transformers (compatible con AutoConfig y AutoModelForMaskedLM) facilitan la integracion en pipelines existentes, aunque el valor practico inmediato es limitado al no incluir parametros entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, masked-LM) |
| Parametros totales | aproximadamente 0,5B (escala alineada con sarashina2.2-0.5b; recuento exacto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (repositorio solo de configuracion, sin pesos que cuantizar) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos; la configuracion es en formato transformers/JSON) |

Datos adicionales de la configuracion: dimension de embedding 1280, tokenizador SentencePiece con vocabulario de 102.400 tokens, codificacion posicional RoPE.

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un transformer encoder-only que incorpora mejoras sobre BERT clasico: codificacion posicional rotatoria (RoPE) en lugar de embeddings posicionales absolutos, atencion con alternancia entre capas locales y globales para manejar contextos largos de forma eficiente, y soporte de Flash Attention. La configuracion fija una longitud maxima de secuencia de 8.192 tokens y una dimension de embedding de 1.280, con un tokenizador SentencePiece de 102.400 entradas compatible con el de sarashina2.2-0.5b.

Este repositorio no contiene datos de entrenamiento ni pesos: es unicamente la definicion de hiperparametros. El modelo derivado iamtatsuki05/ModernBERT-JP-0.5B-init se genera a partir de esta configuracion con pesos inicializados aleatoriamente, segun el codigo de ejemplo de la model card (`AutoModelForMaskedLM.from_config(config)`). No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF/DPO o ajuste supervisado para el modelo derivado. El contexto de investigacion es el articulo MIREI presentado en NLP2026, centrado en el analisis comparativo de embeddings de frases entre arquitecturas encoder y decoder bajo condiciones identicas.

## Capacidades

- Generacion de representaciones enmascaradas (masked language modeling) una vez entrenado el modelo derivado; el repositorio en si no produce predicciones utiles por tener pesos aleatorios.
- Relleno de mascaras (fill-mask) en japones, pipeline declarado en la model card.
- Procesamiento de secuencias largas de hasta 8.192 tokens, adecuado para documentos y parrafos extensos en japones.
- Tokenizacion japonesa mediante SentencePiece con vocabulario de 102.400 tokens, alineada con el ecosistema sarashina2.2.
- Base para extraccion de embeddings de frases (el proyecto MIREI evalua precisamente embeddings encoder vs decoder).
- No soporta tool calling ni function calling de forma nativa (es un encoder masked-LM, no un modelo instruido).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al japones segun la model card.

## Casos de uso

- Investigacion en representaciones de frases en japones: usar la configuracion como base reproducible para entrenar un encoder ModernBERT y comparar sus embeddings con los de un decoder de igual escala, tal como plantea el articulo MIREI.
- Experimentos de ablacion arquitectonica: partir de esta configuracion para estudiar el efecto de RoPE, atencion local/global y contexto de 8.192 tokens frente a BERT japones clasico.
- Clasificacion de textos japoneses largos: tras el entrenamiento supervisado del checkpoint derivado, aplicar el encoder a tareas de clasificacion de documentos con contexto extenso.
- Sistemas de recuperacion de informacion (retrieval) en japones: entrenar el encoder para generar embeddings densos de pasajes y consultas en un motor de busqueda semantica.
- Relleno de huecos y correccion asistida en japones: aprovechar la cabeza masked-LM para tareas de prediccion de tokens en edicion o aumento de datos.
- Base para destilacion o ajuste fino: servir como esqueleto de inicializacion en pipelines de investigacion que necesiten un encoder japones de 0,5B con vocabulario sarashina2.2.
- Reproducibilidad academica: publicar configuraciones exactas que permitan a otros grupos regenerar el modelo init sin ambiguedades de hiperparametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un repositorio solo de configuracion sin pesos entrenados, no existen metricas de rendimiento asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable directamente, ya que no hay pesos publicados. Para el modelo derivado de aproximadamente 0,5B parametros, una estimacion orientativa en fp16 seria de unos 1 GB de pesos, mas overhead de activaciones; en fp32, unos 2 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; para un modelo de este tamano bastaria una GPU consumer moderna, aunque no se confirma en la model card.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 0,5B, pero no se documenta oficialmente.
- Opciones de despliegue: transformers (version >= 4.51.0), accelerate (>= 1.6.0), sentencepiece (>= 0.2.0) y flash-attn (>= 2.7.3), segun los requisitos de la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-JP-0.5B-settings | aproximadamente 0,5B | 8.192 | ModernBERT encoder | MIT | Solo configuracion, sin pesos |
| sbintuitions/sarashina2.2-0.5b | aproximadamente 0,5B | no disponible | Decoder (LLM) | no disponible | Pesos publicados en Hugging Face |
| iamtatsuki05/ModernBERT-JP-0.5B-init | aproximadamente 0,5B | 8.192 | ModernBERT encoder | MIT (segun coleccion MIREI) | Pesos inicializados aleatoriamente |

La comparacion con sarashina2.2-0.5b es directa en escala y tokenizador, pero difiere en proposito: sarashina2.2 es un modelo generativo decoder, mientras que esta configuracion define un encoder masked-LM. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: cargarlo con `from_config` produce un modelo con parametros aleatorios, inutil para inferencia real sin entrenamiento previo.
- Solo soporta japones; no hay capacidades multilingues declaradas.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni calidad del modelo derivado, ya que no se han publicado evaluaciones.
- Al ser un masked-LM, no esta disenado para generacion abierta, tool calling ni tareas de agente; su uso esta restringido a tareas encoder (clasificacion, embeddings, fill-mask).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el modelo derivado ni sobre los datos de entrenamiento que se le anadan.
- Dependencia de versiones concretas de transformers, accelerate, sentencepiece y flash-attn, lo que puede complicar la reproducibilidad en entornos con restricciones de version.
- El tokenizador reutiliza el de sarashina2.2 con 102.400 entradas, lo que incrementa el tamano de la matriz de embeddings respecto a vocabularios mas pequenos y puede afectar al rendimiento en tareas con poco vocabulario efectivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iamtatsuki05/ModernBERT-JP-0.5B-settings
- Modelo derivado: https://huggingface.co/iamtatsuki05/ModernBERT-JP-0.5B-init
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Modelo de referencia de escala: https://huggingface.co/sbintuitions/sarashina2.2-0.5b
- Licencia MIT: https://opensource.org/license/mit/
- Cita academica: articulo MIREI, NLP2026 (referencia bibliografica en la model card; enlace al paper no disponible)
