# HDTenEightyP/GPT-FFDNET

## Resumen

GPT-FFDNET es un modelo de lenguaje de 174.651.648 parametros (aproximadamente 0,161B) desarrollado por el usuario HDTenEightyP y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer de tipo GPT-2 con 12 capas, 12 cabezas de atencion y una dimension de embeddings de 768, entrenado sobre 56 GB de texto de fan fiction y empleando el tokenizador cl100k_base de los modelos GPT-4 de OpenAI.

El modelo se presenta explicitamente como una base que requiere ajuste fino supervisado (SFT) antes de su uso en produccion; el autor advierte de que no ha recibido alineamiento posterior al preentrenamiento. Su interes practico es limitado pero claro para quien quiera experimentar: es un checkpoint pequeno, con un tokenizador moderno y una ventana de contexto declarada de 16.384 tokens, lo que permite probar tecnicas de extension de contexto o de ajuste fino sobre un modelo ligero y con licencia permisiva.

La relevancia actual del modelo es, por tanto, la de una base de investigacion mas que la de un asistente listo para desplegar. No hay datos publicados de benchmarks, pipeline declarado ni descargas, y su unico idioma documentado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (12 capas, 12 cabezas, 768 dimensiones de embedding) |
| Parametros totales | 174.651.648 (aproximadamente 0,161B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion multi-cabeza estandar, 12 capas, 12 cabezas y 768 dimensiones de embedding, es decir, una configuracion muy proxima a la de GPT-2 small pero con un tokenizador distinto. El vocabulario empleado es cl100k_base, el mismo de los modelos GPT-4 de OpenAI, lo que cambia el tamano de la matriz de embeddings respecto a GPT-2 original y explica en parte el recuento total de parametros.

El entrenamiento se realizo sobre 56 GB de texto de fan fiction, segun la model card. No se documentan el numero exacto de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. El autor indica de forma explicita que el modelo es una base preentrenada y que deberia aplicarse SFT antes de usarlo. La ventana de contexto declarada de 16.384 tokens es notable para un modelo de este tamano y sugiere tecnicas de extension de contexto, aunque no se detalla el metodo empleado.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Tokenizacion con cl100k_base, compatible con el vocabulario de los modelos GPT-4 de OpenAI.
- Ventana de contexto declarada de 16.384 tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ajuste fino: el autor recomienda SFT antes de cualquier uso.

## Casos de uso

- Investigacion sobre extension de contexto: el modelo declara 16.384 tokens con solo 12 capas, lo que lo convierte en un banco de pruebas ligero para estudiar como se degrada la atencion en ventanas largas y comparar tecnicas de RoPE scaling o attention lineal.
- Ajuste fino supervisado para dominios creativos: al estar preentrenado sobre fan fiction, sirve como punto de partida para SFT en generacion narrativa, continuacion de relatos o escritura creativa asistida en ingles.
- Experimentos de tokenizacion: al usar cl100k_base, permite estudiar el efecto de un tokenizador moderno sobre una arquitectura pequena y comparar eficiencia por token frente a GPT-2 con su vocabulario original.
- Base para destilacion o investigacion academica: su tamano (0,161B) y licencia MIT facilitan su uso en laboratorios con recursos limitados para estudiar dinamicas de preentrenamiento o como modelo alumno en experimentos de destilacion.
- Generacion de texto en entornos con restricciones de hardware: con menos de 200 millones de parametros, cabe en CPU y en GPUs de consumo, lo que permite desplegarlo en prototipos locales sin infraestructura dedicada.
- Evaluacion de sesgos y alucinacion en modelos pequenos: el corpus de fan fiction y la ausencia de alineamiento lo hacen util como caso de estudio controlado de los sesgos que introduce un dataset de dominio unico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,7 GB para los pesos (174,6M de parametros), mas el coste de activaciones y cache KV.
- VRAM estimada en FP16/BF16: aproximadamente 0,35 GB para los pesos.
- La cache KV para 16.384 tokens con 12 capas y 12 cabezas de 64 dimensiones supone un coste adicional moderado, del orden de cientos de MB en funcion del batch y la precision.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 queda sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: el tag text-generation-inference sugiere compatibilidad con TGI; tambien es viable con transformers, vLLM y, tras conversion a GGUF, con llama.cpp u Ollama (no se publican conversiones oficiales).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| GPT-FFDNET | 174,6M | 16.384 | MIT | en | Tokenizador cl100k_base, preentrenado en fan fiction, sin alineamiento |
| GPT-2 small | 124M | 1.024 | MIT | en | Referencia historica de la misma familia arquitectonica |
| GPT-2 medium | 355M | 1.024 | MIT | en | Mayor capacidad, misma limitacion de contexto |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | en (principalmente) | Base moderna con datos de entrenamiento documentados |

La comparativa se limita a modelos de la misma escala porque no se dispone de datos de benchmarks de GPT-FFDNET que permitan contrastar rendimiento. La ventaja diferencial de GPT-FFDNET frente a GPT-2 small es el tokenizador cl100k_base y la ventana de contexto declarada; su desventaja es la ausencia de datos de evaluacion y de un corpus documentado mas alla de la cifra de 56 GB de fan fiction.

## Limitaciones y advertencias

- El modelo no ha recibido ajuste fino supervisado ni alineamiento; el autor advierte de que debe aplicarse SFT antes de usarlo.
- Entrenado exclusivamente sobre fan fiction, lo que probablemente introduce sesgos estilisticos y de contenido propios de ese genero.
- Riesgo elevado de alucinacion y de generar contenido factualmente incorrecto, dado el corpus y la ausencia de alineamiento.
- Idioma limitado al ingles; no se documenta soporte de castellano ni de otros idiomas.
- No hay benchmarks publicados, por lo que no puede evaluarse su calidad de forma objetiva.
- La ventana de contexto de 16.384 tokens esta declarada pero no verificada con pruebas publicadas; el rendimiento en contextos largos es desconocido.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Licencia MIT: permite uso comercial, pero la falta de alineamiento y de evaluacion hace desaconsejable su despliegue directo en produccion sin una fase de ajuste y evaluacion propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HDTenEightyP/GPT-FFDNET
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
