# drishtijs/DrishX-1.0

## Resumen

DrishX-1.0 es un ajuste fino (finetune) del modelo Qwen2.5-Coder-0.5B-Instruct, desarrollado por el usuario drishtijs y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de lenguaje causal de aproximadamente 494 millones de parametros, orientado a conversaciones sobre desarrollo de software y a la guia del proyecto Drishti (una aplicacion local de asistencia al desarrollo). El modelo se distribuye con su tokenizer completo y pesos en formato safetensors en float32.

El modelo hereda la arquitectura Qwen2ForCausalLM del modelo base y esta configurado con un limite de contexto de 32.768 tokens, aunque el propio autor advierte que la calidad en contexto largo no ha sido evaluada. Su relevancia radica en ser un checkpoint pequeno y ligero que puede ejecutarse en hardware modesto, pensado para integrarse en una aplicacion de escritorio local en lugar de como modelo de proposito general.

Es importante subrayar que el autor no reclama ningun resultado de benchmark ni metrica de calidad en produccion. La validacion incluida (`validation.json`) se limita a comprobar la carga en CPU, el funcionamiento del tokenizer, la finitud de los logits y una generacion determinista con un saludo sintetico. Se trata, por tanto, de un modelo de nicho cuya utilidad esta ligada al ecosistema Drishti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 494.032.768 (aprox. 0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens configurados; calidad en contexto largo no evaluada |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se incluye conversion GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2ForCausalLM, un transformer decoder-only con atencion causal propia de la familia Qwen2. Al ser un finetune directo de Qwen2.5-Coder-0.5B-Instruct (revision base `ea3f2471cf1b1f0db85067f1ef93848e38e88c25`), conserva la tokenizer y la configuracion del modelo original, incluyendo el limite de contexto de 32.768 tokens.

El autor indica explicitamente que esta release contiene un checkpoint local ya existente (`data/models/finetuned`) y no una nueva ejecucion de entrenamiento. La receta de entrenamiento del repositorio (`scripts/train_model.py`) parte del modelo base de Qwen y exporta un checkpoint completo, pero los hiperparametros exactos de la ejecucion y las metricas de calidad sobre conjuntos reservados no se registraron junto con el checkpoint. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El repositorio incluye un adaptador Git opcional (`git-adapter-v1.1.4`) que requiere la base v1.0.1 fijada, mientras que los pesos raiz siguen siendo los del modelo base ajustado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a conversaciones sobre desarrollo de software.
- Asistencia en codigo y guia del proyecto Drishti (explicacion de rutas de pagina, estructura del proyecto y flujos de la aplicacion).
- Formato de chat mediante `apply_chat_template` con roles de sistema, usuario y asistente.
- Soporte de generacion con muestreo (temperatura, top_p) y generacion determinista.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).
- El modelo es solo de pesos: las funciones de edicion de sistema de archivos, control de navegador, recuperacion de base de datos, control de permisos y aislamiento de proyectos pertenecen a la aplicacion DrishX, no al modelo.

## Casos de uso

- Asistencia conversacional dentro de la aplicacion Drishti: el modelo responde preguntas sobre rutas de pagina y estructura del proyecto, usando el template de chat de Qwen y un contexto configurado de hasta 32.768 tokens para mantener el hilo de la conversacion.
- Explicacion de codigo en entornos de desarrollo locales: al derivar de Qwen2.5-Coder, puede describir fragmentos de codigo y sugerir cambios, con revision y pruebas humanas obligatorias dado que el autor advierte de posibles errores.
- Prototipado rapido en hardware modesto: con 0,5B parametros en float32 (aprox. 2 GB de pesos), puede cargarse en CPU o en GPU de gama baja para experimentar con un asistente de codigo sin infraestructura dedicada.
- Integracion en pipelines de Transformers: el ejemplo de la model card muestra como cargar la revision fijada `v1.0.1` con `transformers>=4.57.0`, lo que facilita su uso en scripts de evaluacion o demos reproducibles.
- Base para experimentos de finetune adicional: al ser un checkpoint pequeno y con licencia Apache 2.0, sirve como punto de partida para ajustes especificos de dominio con coste computacional reducido.
- Generacion de respuestas de guia en herramientas de documentacion internas: puede redactar explicaciones breves sobre el proyecto Drishti y sus convenciones, siempre que se valide la salida antes de publicarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no reclama ninguna puntuacion de benchmark ni de calidad en produccion; `validation.json` solo registra una comprobacion de humo (carga en CPU, tokenizer, logits finitos y generacion determinista con un saludo sintetico).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos en float32; el pico de memoria depende de la longitud de contexto y del tamano de lote.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 4 GB de VRAM deberia poder alojar el modelo en float32, y es viable en CPU para pruebas.
- Cabe en GPU de consumo: si, en tarjetas de gama de entrada y media con suficiente VRAM (por ejemplo, series RTX xx60 o superiores); no se aportan mediciones concretas.
- Opciones de despliegue: Hugging Face Transformers (probado con 4.57.0), con soporte de `text-generation-inference` segun los tags del repositorio. No se incluye conversion GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DrishX-1.0 | 494 M | 32.768 tokens (configurado) | Apache 2.0 | Finetune de Qwen2.5-Coder-0.5B-Instruct; sin benchmarks publicados |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | 32.768 tokens | Apache 2.0 | Modelo base; dispone de evaluaciones publicadas por el autor original |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Alternativa de mayor tamano de la misma familia, con mejores resultados reportados por Qwen |

La comparacion con otros modelos de codigo de tamano similar (por ejemplo, variantes de 0,5B de otras familias) no esta disponible en la informacion proporcionada. Dado que DrishX-1.0 no publica metricas, cualquier comparacion de rendimiento con alternativas carece de base empirica en esta ficha.

## Limitaciones y advertencias

- No se han publicado benchmarks ni metricas de calidad; la unica validacion es una comprobacion de humo de ejecucion basica.
- El autor advierte que el codigo y los consejos generados pueden ser incorrectos y requieren revision y pruebas.
- La calidad en contexto largo (hasta 32.768 tokens) no ha sido evaluada.
- El modelo esta orientado al ingles; no se documenta soporte de otros idiomas.
- No se documentan sesgos conocidos, pero al ser un finetune de un modelo base, puede heredar los sesgos de este.
- Riesgo de alucinacion presente como en cualquier modelo de lenguaje; especialmente relevante en afirmaciones sobre APIs o comportamiento de la aplicacion Drishti.
- Licencia Apache 2.0 permite uso comercial, pero se incluye la licencia y atribucion del modelo upstream, que deben conservarse.
- Los hiperparametros exactos de entrenamiento y las metricas sobre conjuntos reservados no se registraron con el checkpoint, lo que dificulta la reproducibilidad del ajuste.
- No se incluye conversion GGUF; la aplicacion Drishti mantiene un modelo GGUF de 7B separado que esta release no sustituye.
- Las funciones de control de sistema, navegador o base de datos pertenecen a la aplicacion, no al modelo; no deben atribuirse a los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drishtijs/DrishX-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset DrishtiX: https://huggingface.co/datasets/drishtijs/DrishtiX
- Adaptador Git opcional (ruta dentro del repo): `adapters/git-v1.1.4/`
