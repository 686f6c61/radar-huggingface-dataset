# curia007/pick3_llm_model

## Resumen

`curia007/pick3_llm_model` es un modelo de lenguaje causal muy pequeno (159.680 parametros segun los pesos safetensors publicados) desarrollado por el usuario curia007 y entrenado sobre secuencias historicas de sorteos de la loteria Idaho Pick 3. No es un modelo de proposito general: es un experimento de modelado de series temporales discretas con una arquitectura transformer causal y un vocabulario de solo 17 tokens (digitos 0-9 y tokens especiales como `<PAD>`, `<BOS>`, `<EOS>`, `<DAY>`, `<NIGHT>`, `<SEP>` y `<PRED>`).

El modelo se distribuye en formato MLX (libreria de Apple para Apple Silicon) y safetensors, con codigo de carga personalizado (`custom_code`), lo que implica que no es cargable directamente con `transformers` sin el repositorio de codigo del autor. Su relevancia es limitada y de nicho: sirve como ejemplo didactico de entrenamiento de un transformer diminuto para secuencias simbolicas, no como herramienta de generacion de texto real.

La model card declara una arquitectura de 3 capas, 4 cabezas de atencion, dimension de embedding 64 y longitud maxima de secuencia 128, con aproximadamente 147,5k parametros (cifra que difiere ligeramente de los 159.680 contados en safetensors). No se han publicado metricas de evaluacion: perdida de validacion, precision por token y tasa de acierto exacto aparecen como `N/A`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder autoregresivo (3 capas, 4 cabezas, dim. embedding 64) |
| Parametros totales | 159.680 (safetensors); la model card declara ~147,5k |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max sequence length declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos) |
| Licencia | MIT |
| Formato de pesos | safetensors, libreria MLX, requiere `custom_code` |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder de 3 capas con 4 cabezas de atencion y dimension de embedding 64, disenado para predecir el siguiente token en secuencias de sorteos de loteria. El vocabulario de 17 tokens codifica digitos del 0 al 9 y marcas estructurales (`<PAD>`, `<BOS>`, `<EOS>`, `<DAY>`, `<NIGHT>`, `<SEP>`, `<PRED>`), lo que sugiere una tokenizacion por caracter con separadores para turnos de dia y noche.

Segun la model card, el entrenamiento se realizo con Apple MLX y PyTorch sobre secuencias historicas de sorteos de Idaho Pick 3. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal; es un transformer denso convencional a escala minima. El codigo de carga se distribuye como modulos propios (`idaho.pick3.pick3_llm_ticket_model` para MLX y `idaho.pick3.pick3_hf_model` para PyTorch), no como un `AutoModel` estandar.

## Capacidades

- Generacion de secuencias simbolicas de digitos (0-9) condicionadas por tokens de contexto como `<DAY>`, `<NIGHT>` y `<SEP>`.
- Modelado autoregresivo de series temporales discretas de baja cardinalidad.
- Prediccion del siguiente token en una secuencia de sorteos (uso previsto segun la model card).
- Carga en Apple Silicon mediante MLX y en PyTorch mediante codigo personalizado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: solo `en` declarado; en la practica el "lenguaje" es un alfabeto de digitos y marcadores.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Experimentacion didactica con transformers minimos: util para estudiar como se entrena y despliega un modelo causal de menos de 200k parametros en Apple Silicon con MLX, sin coste computacional relevante.
- Prueba de pipelines de carga con `custom_code`: sirve para validar flujos de `from_pretrained` con modulos propios y pesos safetensors en entornos MLX.
- Modelado de series simbolicas de baja cardinalidad: el vocabulario de 17 tokens y la ventana de 128 posiciones permiten experimentar con prediccion de secuencias discretas (no necesariamente loteria) en entornos academicos.
- Referencia de tokenizacion por caracter con marcadores estructurales: el esquema `<DAY>`/`<NIGHT>`/`<SEP>` puede reutilizarse como plantilla para tareas de series con separadores temporales.
- Benchmark de juguete para comparar frameworks: permite medir latencia de inferencia MLX frente a PyTorch en un modelo trivial, aislando el overhead del framework.
- Docencia sobre limitaciones de los LLM: caso practico para ilustrar por que un modelo de 160k parametros y 128 tokens de contexto no puede generalizar ni predecir sorteos de forma fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara `N/A` en perdida de validacion (cross-entropy), precision por token y tasa de acierto exacto de sorteo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en pesos (159.680 parametros en fp32 ~ 0,64 MB); el cuello de botella es el runtime, no el modelo.
- GPU recomendadas: no requiere GPU dedicada; esta disenado para Apple Silicon via MLX.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU; el uso previsto es Apple Silicon (M1/M2/M3/M4).
- Opciones de despliegue: MLX (libreria declarada) y PyTorch con el codigo personalizado del autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por el tamano, la latencia estara dominada por el overhead de carga del framework.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| curia007/pick3_llm_model | 159.680 | 128 | MIT | Hugging Face, MLX + custom_code | Vocabulario de 17 tokens, dominio loteria |
| Modelos transformer de juguete (p. ej. nanoGPT) | ~100k-10M | variable | MIT/Apache-2.0 | Repositorios de codigo | Requieren entrenamiento propio; no publicados como pesos |
| Modelos de series temporales tabulares (p. ej. baselines estadisticos) | N/A | N/A | variable | Multiples | No son transformers; comparacion solo conceptual |

No se identifican en la informacion disponible modelos publicos directamente comparables en Hugging Face con este vocabulario y dominio especificos.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera lenguaje natural, solo secuencias de digitos y marcadores.
- La prediccion de sorteos de loteria es estadisticamente inviable; cualquier uso para apostar debe considerarse fraudulento o erroneo. Los sorteos son independientes y no predecibles a partir del historico.
- Sin metricas de evaluacion publicadas: no hay evidencia de que el modelo aprenda patrones utiles ni de su calidad.
- Ventana de contexto de solo 128 tokens, insuficiente para series largas.
- Requiere `custom_code` y la libreria MLX; la carga con `transformers` estandar no funciona sin los modulos del autor.
- Discrepancia entre parametros declarados (~147,5k) y contados en safetensors (159.680): conviene verificar el checkpoint antes de usarlo.
- Idioma declarado `en`, pero en la practica el "lenguaje" es un alfabeto de digitos; no hay capacidades multilingues reales.
- Licencia MIT permite uso comercial, pero el valor practico del modelo para produccion es nulo fuera de experimentacion.
- Riesgo de alucinacion irrelevante en el sentido habitual, pero el modelo puede producir secuencias sintacticamente validas sin significado predictivo.

## Enlaces

- Hugging Face: https://huggingface.co/curia007/pick3_llm_model
- Model card del autor (incluida en el repositorio de Hugging Face)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
