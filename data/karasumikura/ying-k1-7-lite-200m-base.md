# Karasumikura/Ying-K1.7-Lite-200M-base

## Resumen

Ying K1.7 Lite 200M Base es un modelo de lenguaje causal de pequeno tamano (210,2 millones de parametros) desarrollado por Karasumikura (Wang Yingze). Se trata de los pesos base del modelo Ying K1.7 Lite, obtenidos tras continuar el preentrenamiento en chino sobre la base de la generacion anterior (K1.6). No ha recibido ningun tipo de ajuste por instrucciones (SFT) ni optimizacion por preferencias (DPO), por lo que su proposito es servir como punto de partida para futuros desarrollos y como modelo de extraccion de caracteristicas y generacion de texto por continuacion.

El modelo emplea una arquitectura transformer con 16 capas y una dimension oculta de 768, combinando atencion de ventana deslizante (12 capas con ventana de 1024 tokens) y atencion global (4 capas). Utiliza GQA con 12 cabezas de consulta y 4 de clave/valor, atencion con compuerta (gated attention) y normalizacion QK. La longitud de contexto es de 8192 tokens, con una ventana deslizante efectiva de 1024.

Su relevancia actual radica en dos factores: por un lado, es un ejemplo de entrenamiento realizado integramente en hardware no convencional (Moore Threads MTT S4000, RTX PRO 6000 Blackwell y AMD Radeon PRO W7900D), y por otro, demuestra que es posible continuar el preentrenamiento de un modelo de 210M con un presupuesto de datos modesto (2,83 B de tokens en esta iteracion) manteniendo una licencia permisiva Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion hibrida (ventana deslizante + global), GQA 3:1, gated attention y QK-norm |
| Parametros totales | 210.210.560 (210,2 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (ventana deslizante de 1024) |
| Tipos de cuantizacion | No disponible (pesos en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Chino (zh) e ingles (en); el chino es el idioma principal |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Capas / dimension oculta | 16 / 768 |
| Cabezas de atencion | 12 de consulta / 4 de clave-valor (GQA 3:1) |
| Dimension por cabeza (head_dim) | 64 |
| Vocabulario | 16.006 tokens |
| Normalizacion | RowNorm (centrada en cero), materializada como `weight` estandar en la exportacion |
| Libreria | transformers (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de 16 capas con una combinacion de atencion local y global: 12 capas emplean atencion de ventana deslizante con un tamano de ventana de 1024 tokens y 4 capas emplean atencion global. El modelo usa GQA con una relacion 3:1 (12 cabezas de consulta frente a 4 de clave-valor), atencion con compuerta (gated attention) y normalizacion QK. La normalizacion es RowNorm centrada en cero, que se ha materializado como un `weight` estandar durante la exportacion para facilitar la compatibilidad con transformers. El vocabulario es de 16.006 tokens y la precision de los pesos es bf16.

El entrenamiento se desarrollo en tres fases. La fase de preentrenamiento base utilizo el corpus general `mm200_pt2` con 24,07 B de tokens sobre 8 GPU Moore Threads MTT S4000. La continuacion de preentrenamiento en chino de la generacion K1.6 uso Ultra-FineWeb-L3 `multi_style` con 1,40 B de tokens sobre RTX PRO 6000 Blackwell. La fase correspondiente a K1.7 (esta version) uso Ultra-FineWeb chino L2 con 2,83 B de tokens sobre AMD Radeon PRO W7900D de 48 GB. En total, el modelo ha visto 28,30 B de tokens.

Los detalles de esta ultima fase son relevantes para interpretar el modelo: se entreno desde el step 14.292 del K1.6 base hasta el step 45.900, con 28.800 pasos, un batch efectivo de 98.304 tokens por paso y una longitud de secuencia de 8192. Se empleo una tasa de aprendizaje constante sin decaimiento (calentamiento de 200 pasos, muon 5e-3 / adam 1,5e-4), autocast en bf16 con pesos maestros y estados del optimizador en fp32, y sin GradScaler. La perdida descendio de 3,085 a aproximadamente 2,60 al final, y el bpc de 2,75 a cerca de 2,55, con un rendimiento de unos 9.700 tokens por segundo. El autor advierte explicitamente que la tasa de aprendizaje constante y la ausencia de una fase de decaimiento hacen que la meseta final sea esperada y no indique convergencia total.

## Capacidades

- Generacion de texto por continuacion (modelo base, no ajustado por instrucciones).
- Extraccion de caracteristicas (etiqueta `feature-extraction` en el repositorio).
- Modelado de lenguaje causal con contexto de hasta 8192 tokens.
- Capacidad multilingue limitada a chino e ingles, con claro predominio del chino.
- Soporte de atencion de ventana deslizante para contextos largos con coste reducido en las capas locales.
- No dispone de soporte de tool calling ni function calling (no es un modelo instruido).
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- El formato de dialogo `<|user|>...<|assistant|>...<|im_end|>` esta definido para la futura version SFT, pero el modelo base no garantiza su seguimiento.

## Casos de uso

- Investigacion sobre preentrenamiento en chino: el modelo sirve como punto de partida reproducible para estudiar el efecto de continuar el preentrenamiento con corpus chinos de calidad (Ultra-FineWeb L2) sobre una base ya entrenada, con registros detallados de hiperparametros y curvas de perdida.
- Experimentos de ajuste por instrucciones (SFT): al ser un modelo base de 210M con licencia Apache-2.0, es adecuado para probar recetas de SFT de bajo coste en una sola GPU de consumo, comparando el efecto de distintas mezclas de datos.
- Extraccion de caracteristicas y embeddings: la etiqueta `feature-extraction` y su dimension oculta de 768 permiten usarlo como codificador ligero para tareas de clasificacion o recuperacion en chino, aunque no se documenta un rendimiento especifico en estas tareas.
- Generacion de texto por continuacion en chino: con los parametros de muestreo documentados (temperatura 0,7, top_p 0,85, repetition_penalty 1,3, no_repeat_ngram_size 4, frequency_penalty 0,4) puede emplearse para completar textos, generar variaciones estilisticas o aumentar datos de entrenamiento en chino.
- Destilacion y modelos de referencia: su tamano reducido lo hace util como modelo profesor o alumno en experimentos de destilacion y como linea base en comparaciones de eficiencia frente a modelos mayores.
- Pruebas de infraestructura y despliegue: al caber en una GPU de consumo y requerir `trust_remote_code`, sirve para validar pipelines de transformers, integracion con vLLM o llama.cpp y flujos de cuantizacion antes de escalar a modelos mayores.
- Educacion y divulgacion: permite ilustrar el funcionamiento de la atencion hibrida (ventana deslizante y global) y de GQA en un modelo de tamano manejable con codigo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento: perdida final de aproximadamente 2,60 (desde 3,085), bpc de aproximadamente 2,55 (desde 2,75) y un rendimiento de unos 9.700 tokens por segundo durante el entrenamiento. Tambien incluye una tabla de tasas de repeticion de 4-gramas segun `frequency_penalty`:

| Version | f=0 | f=0,2 | f=0,4 | f=0,6 |
|---|---|---|---|---|
| SFT (temp 0,1) | 0,009 | 0,023 | 0,010 | 0,005 |
| Base (temp 0,7) | 0,082 | 0,088 | 0,066 | 0,027 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, aproximadamente 0,42 GB solo para los pesos (210,2 M x 2 bytes); en la practica, el uso total con cache KV y overhead de transformers ronda 1-2 GB para contextos moderados. En cuantizacion de 8 bits serian unos 0,21 GB y en 4 bits unos 0,11 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado en Moore Threads MTT S4000, RTX PRO 6000 Blackwell y AMD Radeon PRO W7900D de 48 GB, pero para inferencia no se requiere hardware de ese nivel.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, por lo que su uso en esos frameworks requeriria conversion y verificacion previas.
- Latencia y throughput estimados: no disponible para inferencia; el unico dato es el throughput de entrenamiento de aproximadamente 9.700 tokens por segundo en AMD Radeon PRO W7900D.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ying K1.7 Lite 200M Base | 210,2 M | 8192 (ventana 1024) | zh, en | Apache-2.0 | Modelo base, sin SFT ni DPO; atencion hibrida y GQA 3:1 |
| Ying K1.6 Lite 200M Base | 210 M (aproximado) | No disponible | zh, en | Apache-2.0 (segun generacion anterior) | Generacion previa; repositorio ahora privado |
| Ying K1.6 Lite 200M (SFT) | 210 M (aproximado) | No disponible | zh, en | Apache-2.0 (segun generacion anterior) | Version conversacional de la generacion anterior, con SFT |
| Ying K1.5 Lite 200M Base | 210 M (aproximado) | No disponible | zh, en | No disponible | Generacion anterior, sin datos publicos de rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria (por ejemplo, otros modelos base de 200M en chino). La comparativa se limita a la propia familia Ying y a los datos publicados en la model card.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no garantiza el seguimiento de instrucciones y, si se usa en un dialogo, produce continuaciones en lugar de respuestas.
- No se ha entrenado con DPO ni con RLHF, por lo que no hay alineacion con preferencias humanas.
- Con 210M de parametros, la capacidad de conocimiento factual y de razonamiento de cadena larga es limitada; es propenso a errores factuales y a alucinaciones.
- El chino es el idioma principal; el rendimiento en ingles es debil segun el propio autor.
- Es sensible a los parametros de muestreo: con temperatura 0,7 empieza a inventar identidad y hechos, y con temperatura 0 entra en repeticiones. Los valores documentados son los usados en el sitio del autor, no una recomendacion general.
- El modelo base presenta una tasa de repeticion de 4-gramas notablemente superior a la version SFT (0,082 frente a 0,009 con los ajustes respectivos).
- El entrenamiento con tasa de aprendizaje constante y sin decaimiento deja el modelo en una meseta; el autor indica que se necesitaria una fase de decaimiento para aprovechar por completo el corpus.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no esta validado para produccion y no se ofrecen garantias de calidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene revisar el codigo remoto antes de desplegarlo.
- No se documentan cuantizaciones oficiales ni soporte en frameworks de inferencia de alto rendimiento, lo que limita su despliegue en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.7-Lite-200M-base
- Sitio del autor: https://yingze.wang
- Generacion anterior (base, ahora privada): https://huggingface.co/Karasumikura/Ying-K1.6-Lite-200M-base
- Generacion anterior a esa (base): https://huggingface.co/Karasumikura/Ying-K1.5-Lite-200M-base
- Version conversacional de la generacion K1.6: https://huggingface.co/Karasumikura/Ying-K1.6-Lite-200M
