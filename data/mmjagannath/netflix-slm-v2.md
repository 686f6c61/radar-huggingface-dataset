# MMJagannath/Netflix-SLM-V2

## Resumen

Netflix-SLM-V2 es un modelo de lenguaje pequeno (SLM) entrenado desde cero por el desarrollador independiente MMJagannath, orientado a generacion de texto conversacional sobre contenido de Netflix (peliculas y series). Se presenta explicitamente como un proyecto de estudiante experimental, no como un modelo de produccion, y su model card advierte de que los hechos y recomendaciones generados pueden ser incorrectos.

La arquitectura es una implementacion propia inspirada en Qwen3, con Grouped Query Attention (GQA), Rotary Position Embeddings (RoPE), RMSNorm y capas feed-forward SwiGLU. El entrenamiento se realizo sobre el dataset MMJagannath/SLM-Movie-Recommendation durante 1000 pasos en CPU, alcanzando una mejor perdida de validacion de 1,7522. El repositorio ocupa 0,1 GB, lo que sugiere un modelo de muy pocos parametros.

Su relevancia es limitada y fundamentalmente didactica: sirve como ejemplo de implementacion completa de un transformer estilo Qwen3 entrenado desde cero, pero no esta pensado para uso comercial ni para tareas que requieran fiabilidad factual. Los pesos usan una arquitectura personalizada, por lo que requieren la implementacion exacta del autor para cargarse; no es compatible con librerias estandar como transformers sin codigo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer inspirado en Qwen3 (GQA, RoPE, RMSNorm, SwiGLU) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (pesos personalizados, requieren implementacion propia) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con las innovaciones habituales de la familia Qwen3: atencion con Grouped Query Attention para reducir el coste de la KV cache, embeddings posicionales rotatorios (RoPE), normalizacion RMSNorm y capas feed-forward con activacion SwiGLU. No se especifican en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto nativa.

El entrenamiento se realizo sobre el dataset MMJagannath/SLM-Movie-Recommendation, con 1000 pasos de optimizacion ejecutados en CPU y una mejor perdida de validacion de 1,7522. No se indica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. El autor describe el proyecto como experimental y de estudiante, sin detallar hiperparametros ni estrategia de tokenizacion.

## Capacidades

- Generacion de texto conversacional en ingles sobre peliculas y series de Netflix.
- Respuesta a preguntas y recomendaciones dentro del dominio del dataset de entrenamiento.
- Conversacion de un solo turno o multi-turno basica (sin garantias de coherencia en contextos largos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio, codigo ni matematicas.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.

## Casos de uso

- Prototipado educativo de un SLM desde cero: util para estudiar como se implementa un transformer estilo Qwen3 completo (GQA, RoPE, RMSNorm, SwiGLU) y como se entrena en CPU con un dataset pequeno.
- Demostracion de generacion de recomendaciones de peliculas en entornos de laboratorio: el modelo puede producir sugerencias de titulos de Netflix, siempre con verificacion manual posterior.
- Base para experimentos de fine-tuning: al ser un modelo pequeno con licencia MIT, sirve como punto de partida para probar tecnicas de ajuste sobre dominios acotados.
- Chatbot de prueba en entornos de desarrollo: integrable en pipelines de evaluacion para comparar respuestas de SLMs frente a modelos mayores.
- Generacion de texto sintetico para aumentar datasets de dominio cinematografico, con revision humana obligatoria por el riesgo de alucinacion.
- Ejercicio docente en cursos de IA: permite ilustrar el ciclo completo de definicion de arquitectura, entrenamiento, evaluacion con perdida de validacion y publicacion en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la mejor perdida de validacion de 1,7522 tras 1000 pasos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; dado el tamano del repositorio (0,1 GB), es probable que quepa en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: no disponible; por el tamano, cualquier GPU con al menos unos pocos GB de VRAM deberia ser suficiente.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM, aunque el dato no esta confirmado.
- Opciones de despliegue: al usar pesos con arquitectura personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin convertir los pesos y aportar la implementacion del autor. El despliegue requiere cargar los pesos con el codigo de definicion del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Netflix-SLM-V2 | no disponible (repo de 0,1 GB) | no disponible | MIT | Hugging Face | Arquitectura personalizada, proyecto de estudiante, solo ingles |
| Qwen3 (familia) | desde 0,6B hasta 235B (segun variante) | hasta 128K en algunas variantes | Apache 2.0 (mayoria de variantes) | Hugging Face, amplia integracion | Modelo de referencia en el que se inspira; soporte estandar en transformers y vLLM |
| SmolLM2 (Hugging Face) | 135M, 360M, 1,7B | hasta 8K | Apache 2.0 | Hugging Face | SLM de referencia para experimentos educativos y despliegue en consumer |
| TinyLlama | 1,1B | 2K | Apache 2.0 | Hugging Face | Modelo pequeno ampliamente usado en fine-tuning y prototipos |

La comparacion es orientativa: Netflix-SLM-V2 no publica parametros ni contexto, por lo que la equiparacion con estos modelos se basa unicamente en el tamano del repositorio y en la categoria de SLM.

## Limitaciones y advertencias

- Proyecto experimental de estudiante: el propio autor advierte de que los hechos y recomendaciones sobre Netflix pueden ser incorrectos y deben verificarse.
- Riesgo alto de alucinacion en datos factuales (titulos, fechas, repartos, disponibilidad en catalogo).
- Entrenado solo en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada; probablemente muy limitada, lo que restringe conversaciones multi-turno largas.
- Pesos con arquitectura personalizada: no cargan en transformers, vLLM, llama.cpp u Ollama sin la implementacion del autor y una posible conversion.
- Sin datos publicados de benchmarks, evaluacion de sesgos ni pruebas de seguridad.
- Solo 1000 pasos de entrenamiento en CPU y perdida de validacion de 1,7522: calidad esperada baja en comparacion con SLMs establecidos.
- Licencia MIT permite uso comercial, pero la falta de fiabilidad desaconseja su uso en produccion sin validacion exhaustiva.
- No hay informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/MMJagannath/Netflix-SLM-V2
- Dataset de entrenamiento: https://huggingface.co/datasets/MMJagannath/SLM-Movie-Recommendation
