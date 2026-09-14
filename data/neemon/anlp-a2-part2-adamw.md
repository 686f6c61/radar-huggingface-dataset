# neemon/anlp-a2-part2-adamw

## Resumen

El modelo `neemon/anlp-a2-part2-adamw` es un transformer decoder-only implementado desde cero y entrenado por el usuario neemon como parte de la asignatura Advanced NLP (IIIT-H, Monsoon 2026). No es un modelo de produccion ni un lanzamiento comercial: es un checkpoint de una practica academica cuyo objetivo es comparar el comportamiento del optimizador AdamW frente a otras alternativas sobre una arquitectura pequena y un corpus reducido. El repositorio contiene unicamente los pesos y la configuracion, no el codigo de arquitectura ni de entrenamiento, que viven en el repositorio de la asignatura.

La arquitectura es un transformer solo decodificador con 8 capas, `d_model` de 512, 8 cabezas de atencion (sin GQA: `n_kv_heads` = 8), FFN denso de 2048 unidades y normalizacion RMSNorm. El vocabulario es de 32.000 tokens y la ventana de contexto es de solo 256 tokens, lo que lo sitúa en la categoria de modelos diminutos orientados a frases cortas. El pipeline declarado en HuggingFace es traduccion, con cobertura de ingles, vietnamita y japones.

Su relevancia es exclusivamente didactica: sirve como referencia de bajo coste para estudiar el efecto del optimizador, la estabilidad del entrenamiento y las decisiones de arquitectura en un regimen de datos muy limitado (43 millones de tokens objetivo puntuados). Con 0 descargas, 0 likes y sin benchmarks publicados, no debe considerarse una alternativa a modelos de traduccion establecidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (solo decodificador), FFN denso, RMSNorm |
| Parametros totales | no disponible en la model card (estimacion propia: ~42 M con embedding atado, ~58 M sin atar) |
| Parametros activos | no aplica; no es un MoE (`n_routed_experts` = 0, `n_shared_experts` = 0, `top_k` = 0) |
| Longitud de contexto | 256 tokens (`n_ctx`) |
| Tipos de cuantizacion | no disponible (checkpoint en coma flotante; no se publican variantes cuantizadas) |
| Idiomas soportados | ingles (en), vietnamita (vi), japones (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, serializado con `torch.save`; se carga con `torch.load(..., weights_only=False)`) |
| `d_model` | 512 |
| Numero de capas | 8 |
| Cabezas de atencion | 8 (`n_kv_heads` = 8, sin GQA/MQA) |
| `d_ff` | 2048 |
| Tamano de vocabulario | 32.000 tokens |
| Normalizacion | RMSNorm |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | PyTorch |

## Arquitectura y entrenamiento

El modelo sigue el diseno clasico de un transformer decoder-only pre-normado con RMSNorm, atencion multi-cabeza completa (8 cabezas de query y 8 de clave/valor, por lo que no hay comparticion de KV) y una red feed-forward densa de 2048 unidades por capa. No emplea mezcla de expertos, atencion lineal, SSM ni ninguna innovacion de eficiencia: pese a la etiqueta `mixture-of-experts` del repositorio, la configuracion declara explicitamente 0 expertos enrutados y 0 expertos compartidos, de modo que la etiqueta no refleja la arquitectura real. Con `d_model` = 512 y 8 capas, el bloque transformer aporta unos 25,2 M de parametros, a los que se suman 16,4 M del embedding de 32.000 x 512; el total queda en torno a 42 M si la proyeccion de salida esta atada al embedding y unos 58 M si no lo esta.

En cuanto al entrenamiento, la model card solo indica que se puntuaron 43.021.354 tokens objetivo, con una mejor perdida de validacion de 3,6280 y una perplejidad de validacion registrada como `nan`. No se documentan la composicion del dataset, el numero de pasos, la tasa de aprendizaje, si hubo RLHF, DPO o ajuste por instrucciones, ni el procedimiento de tokenizacion. La perplejidad `nan` junto a una loss finita sugiere un fallo de calculo (por ejemplo, `log(0)` al encontrar una probabilidad nula o una inestabilidad numerica en la exponenciacion) mas que un colapso del entrenamiento, pero no hay informacion suficiente para confirmarlo. La perdida de 3,6280 corresponde a una perplejidad teorica de aproximadamente 37,6, un valor alto incluso para un modelo de este tamano, coherente con un corpus de entrenamiento muy pequeno.

## Capacidades

- Generacion de texto autoregresiva en ingles, vietnamita y japones, limitada a secuencias cortas por la ventana de 256 tokens.
- Traduccion entre los tres idiomas declarados, que es el pipeline oficial del repositorio; se trata de una capacidad declarada por el autor, no verificada con benchmarks publicos.
- Modelado de lenguaje general: al ser un decoder-only entrenado con objetivo causal, puede completar texto y puntuar secuencias (util para calcular perplejidad).
- No hay evidencia de soporte de tool calling ni de function calling: no se menciona plantilla de chat, tokens especiales de herramienta ni entrenamiento con instrucciones.
- No hay soporte documentado de agentes, razonamiento multi-paso, modo "thinking", vision, audio ni entrada multimodal.
- No se declara capacidad de generacion de codigo ni de matematicas; con 43 M de tokens de entrenamiento y contexto de 256, estas capacidades serian, en el mejor de los casos, marginales.
- No se documenta multilingueidad fuera de en, vi y ja.

## Casos de uso

- Practica academica y docencia: el checkpoint sirve para reproducir un experimento de entrenamiento desde cero y estudiar el efecto de AdamW frente a otros optimizadores, comparando curvas de perdida y estabilidad.
- Traduccion de frases cortas en/vi/ja en entornos de prototipado: cada frase debe caber holgadamente en 256 tokens; es adecuado para validar un pipeline de traduccion extremo a extremo antes de invertir en un modelo mayor.
- Baseline de comparacion (sanity check) en experimentos de traduccion: por su tamano minimo, permite fijar una cota inferior de calidad frente a Marian, NLLB o mBART en el mismo conjunto de evaluacion.
- Pruebas unitarias de infraestructura de inferencia: al tener un coste computacional minimo, sirve para validar el bucle de generacion, el manejo del tokenizador y el formateo de salida de un servicio propio sin consumir GPU.
- Generacion de texto sintetico corto para aumentar datos de entrenamiento de otros modelos, siempre que se acepte su baja calidad y se filtre posteriormente.
- Investigacion sobre estabilidad numerica: la perplejidad `nan` registrada lo convierte en un caso de estudio util para reproducir fallos de calculo de metricas y depurar rutinas de evaluacion.
- Experimentos de destilacion o inicializacion: al ser un modelo pequeno y entrenado, puede usarse como alumno en tecnicas de destilacion desde un traductor mayor, midiendo cuanto conocimiento se transfiere en un presupuesto tan reducido.
- Validacion de metodologia de conteo de tokens y de preprocesamiento en corpus multilingues que incluyan vietnamita y japones, donde la tokenizacion tiene un impacto directo en la longitud efectiva de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de validacion del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Tokens objetivo puntuados | 43.021.354 |
| Mejor perdida de validacion | 3,6280 |
| Mejor perplejidad de validacion | nan (fallo registrado) |
| Perplejidad teorica derivada de la loss | ~37,6 (calculada como exp(3,6280); no reportada por el autor) |
| BLEU, chrF, MMLU, HumanEval, GSM8K | no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia, segun el conteo de parametros estimado (42-58 M): en float32 entre 0,17 y 0,23 GB; en float16/bfloat16 entre 0,08 y 0,12 GB; en int8 entre 0,04 y 0,06 GB; en int4 entre 0,02 y 0,03 GB. Son estimaciones de pesos; el consumo real dependera de la implementacion del cache KV y del tamano de lote.
- GPU recomendadas: practicamente cualquier GPU con al menos 2 GB de VRAM. Una RTX 3060, una RTX 4090 o una T4 son mas que suficientes; tambien cabe en GPUs integradas y en CPU.
- Inferencia en CPU: totalmente viable por el tamano del modelo; con contexto de 256 tokens el coste por secuencia es minimo.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama, TGI ni transformers, porque el repositorio solo contiene un `state_dict` de PyTorch con una arquitectura propia y el codigo de modelado esta en el repositorio de la asignatura, que no se enlaza en la model card. El despliegue requiere reimplementar el modulo en PyTorch y cargar los pesos manualmente, o exportar a TorchScript/ONNX una vez reconstruida la arquitectura.
- Latencia y throughput: no disponibles. No se publican mediciones; el tamano del modelo sugiere un throughput elevado, pero es una estimacion no verificada y no debe citarse como dato.

## Comparativa con modelos similares

Los datos de los modelos de comparacion provienen de sus fichas publicas y deben considerarse aproximados. La comparacion es orientativa, dado que este checkpoint no tiene evaluacion publicada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neemon/anlp-a2-part2-adamw | ~42-58 M (estimado) | 256 tokens | en, vi, ja | MIT | Checkpoint PyTorch aislado; sin codigo de arquitectura en el repo |
| google-t5/t5-small | 60 M | 512 tokens | multilingue (predominantemente ingles) | Apache 2.0 | Formato transformers, ampliamente soportado |
| Helsinki-NLP/opus-mt-en-vi (Marian) | ~77 M | 512 tokens | en, vi | CC-BY-4.0 | Formato transformers/Marian, listo para produccion |
| facebook/nllb-200-distilled-600M | 600 M | 512 tokens | 200 idiomas, incluidos en, vi, ja | CC-BY-NC-4.0 (uso comercial restringido) | Formato transformers, soporte amplio |

Frente a estas alternativas, el modelo de neemon no aporta ventaja practica alguna salvo el coste computacional minimo y la licencia MIT sin restricciones comerciales; a cambio, carece de soporte de herramientas, de evaluacion publica y de contexto suficiente para documentos reales.

## Limitaciones y advertencias

- Modelo de asignatura sin evaluacion publica: 0 descargas, 0 likes y ningun benchmark permiten estimar su calidad real. No debe desplegarse en produccion sin una validacion propia.
- Ventana de contexto de 256 tokens: insuficiente para documentos, parrafos largos o conversaciones multi-turno; limita severamente cualquier tarea real de traduccion.
- Corpus de entrenamiento muy reducido (43 M de tokens objetivo), lo que implica una capacidad de generalizacion baja y una perdida de validacion alta (3,6280).
- Perplejidad de validacion registrada como `nan`, lo que indica un posible fallo de calculo o una inestabilidad numerica que no esta documentada ni resuelta.
- Incoherencia de etiquetado: el repositorio esta etiquetado como `mixture-of-experts` pese a que la configuracion declara 0 expertos. Quien lo trate como un MoE se equivocara en el calculo de recursos.
- Sesgos desconocidos: no se documenta la procedencia, la composicion ni el filtrado del corpus de entrenamiento, por lo que no es posible caracterizar sesgos de genero, nacionalidad o idioma.
- Riesgo de alucinacion: alto, propio de un modelo causal pequeno entrenado con pocos datos; no hay ajuste por instrucciones ni RLHF que lo mitiguen.
- Cobertura limitada a en, vi y ja: no hay garantia de comportamiento en castellano ni en otros idiomas, y el rendimiento dentro de esos tres idiomas es desigual por defecto.
- Seguridad al cargar pesos: el `README` indica `torch.load(..., weights_only=False)`, lo que ejecuta el deserializador completo de pickle. Cargar checkpoints de terceros de esta forma es un riesgo de ejecucion de codigo arbitrario; conviene hacerlo en un entorno aislado.
- Reproducibilidad limitada: el codigo de arquitectura, entrenamiento y evaluacion no esta en este repositorio y no se proporciona el enlace al repositorio de la asignatura, de modo que no se puede reconstruir el tokenizador ni el preprocesamiento exactos.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero al no existir evaluacion ni mantenimiento, la ausencia de garantias es total.
- Metadatos atipicos: las fechas de creacion y actualizacion (14 de septiembre de 2026) son posteriores a la fecha habitual de publicacion de modelos comparables; conviene verificar la vigencia del repositorio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neemon/anlp-a2-part2-adamw
- Repositorio de la asignatura (Advanced NLP, IIIT-H, Monsoon 2026) con la arquitectura, el codigo de entrenamiento y la evaluacion: mencionado en la model card, pero sin URL publicada; no disponible.
- Paper o informe tecnico asociado: no disponible.
- Demo o space: no disponible.
- Los resultados de busqueda web proporcionados no contienen ningun enlace relevante para este modelo (corresponden a consultas sobre verificacion de telefono en Codex, uso de WhatsApp y archivos de prensa local de 1979 y 1985), por lo que no se incluye ningun enlace adicional.
