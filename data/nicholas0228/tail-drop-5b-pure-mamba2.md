# Nicholas0228/tail-drop-5b-pure-mamba2

## Resumen

Pure Mamba-2 (48 layers) es un checkpoint de investigación de 349.619.712 parámetros (aproximadamente 350 M) entrenado desde cero sobre el corpus congelado FineWeb-Edu. Lo desarrolla el usuario Nicholas0228 dentro de una línea de trabajo sobre modelos de espacio de estados (SSM) y compara su comportamiento con variantes de atención con "tail drop" y modelos con prefijo protegido (P32/P64, M4). El nombre del repositorio contiene "5b", pero hace referencia al presupuesto de entrenamiento de 5.000.134.656 tokens objetivo (paso 9.537), no al número de parámetros.

Se trata de un modelo base causal (causal-lm) en inglés, sin ajuste por instrucciones, pensado exclusivamente para comparaciones de investigación controladas con políticas de inferencia emparejadas y contabilidad del estado total. No es un repositorio estándar de Transformers `AutoModelForCausalLM`: requiere cargarse con el código empaquetado mediante `loader.load_release` y seguir `INFERENCE.md`. Su tokenizador es el de Mistral-7B-v0.1 congelado.

Arquitectónicamente es un Mamba-2 puro de 48 capas, con recurrencia nativa y sin límite de ventana de sufijo, a diferencia de las variantes de la misma familia que sustituyen los extremos por capas recurrentes. El contexto de entrenamiento es de 2.048 tokens. El autor no reclama nuevas capacidades de contexto largo ni evaluación adicional para esta publicación, y el modelo no está pensado como producto final sino como referencia reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 puro (state space model, SSM), 48 capas |
| Parametros totales | 349.619.712 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (no se concede licencia general nueva; aplican las licencias upstream) |
| Formato de pesos | safetensors |

Otros datos: tamano del repositorio 1,4 GB; pipeline no disponible; descargas 0; likes 0.

## Arquitectura y entrenamiento

El modelo es un Mamba-2 puro de 48 capas, es decir, un modelo de espacio de estados causal con recurrencia nativa y sin el tope de ventana de sufijo que sí aplican otras variantes de la familia. Según la model card, "M4" sustituye los extremos por capas recurrentes, mientras que el Mamba-2 puro mantiene recurrencia nativa en todas las capas; P32/P64 designan modelos antiguos de prefijo protegido y no deben confundirse con S-min32/S-min64. Las ventanas de sufijo se aplican desde el primer token del prompt, incluido el token actual, aunque las capas densas exteriores conservan el historial.

El entrenamiento se realizó desde cero sobre el corpus congelado FineWeb-Edu, con un contexto de 2.048 tokens y un presupuesto objetivo de 5.000.134.656 tokens (paso 9.537). El endpoint de 5B utiliza el schedule de learning rate original de 15B tokens truncado a 5B. La publicación es una release de inferencia: conserva los tensores originales exactos pero no incluye estado del optimizador ni del RNG. Los ficheros `release_manifest.json`, `tensor_manifest.json` y `provenance.json` documentan hashes, tensores originales y digests del checkpoint y del corpus. El código deriva de una revisión de investigación fijada del repositorio `tail_drop_attn`. No se especifica en la información disponible si hubo RLHF, DPO u otro ajuste posterior.

## Capacidades

- Generación de texto causal en inglés: modelo base (`causal-lm`) entrenado desde cero, sin ajuste por instrucciones.
- Modelado de lenguaje autorregresivo: orientado a experimentos de comparación e investigación, no a tareas de usuario final.
- Recurrencia nativa: al ser Mamba-2 puro, no aplica el tope de ventana de sufijo de otras variantes de la familia.
- Contexto de 2.048 tokens: limitado al contexto de entrenamiento; el autor no reclama capacidad de contexto largo.
- No se documentan capacidades de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingües: el único idioma declarado es el inglés.
- No se documentan capacidades de visión, audio, thinking mode ni razonamiento multi-paso.
- No está ajustado por instrucciones, por lo que no se espera seguimiento fiable de instrucciones complejas.

## Casos de uso

- Comparación arquitectónica controlada: evaluar un Mamba-2 puro de 48 capas frente a variantes con atención, "tail drop" o prefijo protegido bajo políticas de inferencia emparejadas, tal como propone el autor.
- Investigación en modelos de espacio de estados: estudiar el comportamiento de la recurrencia nativa de Mamba-2 sin el tope de ventana de sufijo en tareas de modelado de lenguaje.
- Reproducibilidad de entrenamiento: servir como checkpoint de referencia con hashes y manifiestos de tensores para verificar configuraciones y digests del corpus FineWeb-Edu.
- Base para ajuste fino: al ser un modelo base de 350 M en inglés, puede ser punto de partida para ajustes supervisados en dominios concretos en inglés, siempre que se cumplan las licencias upstream.
- Experimentos de eficiencia: su tamaño reducido permite medir el coste de memoria y de cómputo del estado recurrente frente a transformers de tamaño comparable.
- Docencia y prototipado de SSM: cargar y ejecutar un Mamba-2 puro con el código empaquetado para estudiar el flujo de estados y la dinámica recurrente en un entorno pequeño.
- Estudio de dinámicas de estado: analizar la propagación del estado oculto y el efecto de las ventanas de sufijo descritas en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta publicación no reclama ninguna evaluación nueva ni capacidad de contexto largo, y que un único seed de entrenamiento no mide la varianza entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en FP32 (tamaño del repositorio), unos 700 MB en FP16/BF16, unos 350 MB en INT8 y unos 175 MB en INT4 (estimaciones según el recuento de 349.619.712 parámetros).
- GPU: cabe sobradamente en cualquier GPU de consumo; no requiere A100 ni H100. Ejemplos: RTX 3060 12 GB, RTX 4070, RTX 4090, incluso GPUs integradas con suficiente memoria compartida.
- Consumer GPU: sí, es un modelo de 350 M, apto para portátiles y equipos de gama media.
- Opciones de despliegue: al no ser un repositorio `AutoModelForCausalLM` estándar, no es compatible de forma directa con vLLM, TGI, llama.cpp u Ollama. La carga debe hacerse con el código empaquetado del repositorio mediante `loader.load_release`, siguiendo `INFERENCE.md`.
- No se publican versiones GGUF ni cuantizaciones listas para usar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tail-drop-5b-pure-mamba2 | 349,6 M | 2.048 tokens | Mamba-2 puro, 48 capas | no disponible (upstream) | safetensors + codigo de carga propio |
| Mamba-2 (state-spaces) | aprox. 370 M (version 370m) | no verificado en esta ficha | Mamba-2 | Apache 2.0 (segun repositorio upstream, verificar) | transformers/repositorio estandar |
| Pythia-410m | aprox. 410 M | aprox. 2.048 tokens | Transformer decoder | Apache 2.0 (verificar) | transformers |

Nota: los datos de los modelos comparativos provienen de sus respectivas fichas publicas y deben verificarse en la fuente original; no se dispone de resultados de benchmarks comparativos para el modelo descrito. La comparacion de rendimiento no esta disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no se espera que siga instrucciones de usuario de forma fiable.
- Sesgos conocidos: no se documentan explícitamente; al entrenarse sobre FineWeb-Edu en inglés, hereda los sesgos y la composición de ese corpus.
- Riesgo de alucinación: propio de un modelo de lenguaje autorregresivo de 350 M; no se han publicado evaluaciones de fidelidad.
- Limitación de idioma: solo se declara inglés; no hay soporte multilingüe documentado.
- Limitación de contexto: 2.048 tokens, ajustado al contexto de entrenamiento; no se reclama capacidad de contexto largo.
- Licencia: la model card indica que no se concede ninguna licencia general nueva más allá de las licencias upstream aplicables, por lo que el uso comercial queda sin definir y debe consultarse en `THIRD_PARTY.md` y en el repositorio de código.
- Compatibilidad: al no ser un repositorio Transformers estándar, requiere código propio; no funciona con los runners habituales sin adaptación.
- Varianza de entrenamiento: un único seed no permite medir la variabilidad entre ejecuciones.
- Semántica de inferencia: las ventanas de sufijo, los modelos P32/P64 y S-min32/S-min64 no deben confundirse; el autor advierte explícitamente contra esa confusión.
- Reproducibilidad: el release no incluye ejemplos de entrenamiento, estado del optimizador, credenciales ni URLs privadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nicholas0228/tail-drop-5b-pure-mamba2
- Revisión de investigación fijada del código: https://github.com/Nicholas0228/tail_drop_attn/tree/758839451f45df67d2fb3a5626b8a07247b38f2e
- Corpus de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Ficheros citados en la model card (no enlazados directamente): `INFERENCE.md`, `research_config.json`, `release_manifest.json`, `tensor_manifest.json`, `provenance.json`, `THIRD_PARTY.md`
- Contexto general sobre modelos de espacio de estados (no específico de este modelo): encuesta sobre LLM que cubre SSM y Mamba, https://www.researchgate.net/profile/Ziqian_Bi/publication/399059225_A_Comprehensive_Survey_on_Large_Language_Models_From_Pre-training_to_Autonomous_Agents/links/694c94a07e61d05b5312836f/A-Comprehensive-Survey-on-Large-Language-Models-From-Pre-training-to-Autonomous-Agents.pdf
- Contexto general sobre comparación de estados de modelos generativos (no específico de este modelo): https://repositorio-aberto.up.pt/bitstream/10216/175895/2/787096.pdf

Nota: los resultados de búsqueda web disponibles no contienen información específica sobre este checkpoint; se listan únicamente como material de contexto general sobre SSM y evaluación de modelos.
