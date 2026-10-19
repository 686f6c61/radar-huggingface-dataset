# Astra228/ChudGPT-Femboy

## Resumen

ChudGPT-Femboy es un modelo de lenguaje experimental de escala muy reducida (del orden de 30-33 millones de parametros) publicado por el desarrollador independiente Astra228 (ASTRA228b) en HuggingFace. Se trata de un checkpoint de desarrollo identificado por el propio autor como «V16 personality step 500», entrenado desde cero con una implementacion propia en PyTorch y un tokenizador BPE original, sin reutilizar pesos de otros modelos. Forma parte del ecosistema ChudGPT, una familia de modelos pequenos mantenidos por el mismo autor.

El objetivo declarado no es competir en capacidades generales, sino reproducir una voz conversacional concreta: un personaje ficticio de estilo «catboy/femboy» jugueton, con maullidos y role-play expresivo. El modelo se distribuye como descarga con codigo Python local (no usa `transformers.AutoModel` ni proveedores de inferencia), lo que lo convierte en una pieza de experimentacion sobre arquitecturas y tokenizadores propios mas que en una herramienta de produccion.

Su relevancia actual es limitada y de nicho: sirve como ejemplo documentado de entrenamiento from-scratch a pequena escala, con un conjunto de evaluaciones propio publicado de forma transparente (incluidos los fallos). El autor advierte explicitamente de que los requisitos originales de publicacion no se cumplieron y de que se trata de una instantanea de desarrollo, no de un modelo aprobado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de implementacion propia (custom PyTorch), segun la model card y el tag `custom-architecture`; numero de capas, dimension oculta y cabezas de atencion: no disponible |
| Parametros totales | 32.843.136 segun los tensores en safetensors; la model card declara 29.697.408 (probablemente excluyendo embeddings o parte de ellos). Discrepancia no aclarada por el autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se distribuyen pesos en safetensors (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (`en`), segun metadatos y model card |
| Licencia | No disponible. La model card indica que no se concede ninguna licencia adicional y que hay que contactar con el autor para permisos de reutilizacion |
| Formato de pesos | safetensors (repo de ~0,1 GB), mas codigo Python local (`run.py`, `requirements.txt`) y `config.json` con arquitectura y step |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un transformer decoder-only escrito a mano en PyTorch, con tokenizador BPE propio entrenado desde cero y pesos exportados a safetensors. El autor indica que la exportacion es «tensor-exact» respecto al checkpoint local original (SHA256 `f6e5d89028d2cc7b8f7a8af4ff5fb30beb769b5f771d107f7fcac78ef184bfe6`) y que `config.json` registra la arquitectura y el paso de entrenamiento. No se publican detalles sobre numero de capas, dimension del modelo, mecanismo de atencion (si es multiquery, GQA o atencion completa), funcion de activacion ni posicionamiento.

Tampoco se especifican volumen de tokens de entrenamiento, composicion del corpus, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. La model card menciona un «V16 personality step 500», lo que sugiere un proceso iterativo de checkpoints orientado a ajustar el estilo del personaje mas que a mejorar capacidades generales. El autor declara explicitamente que no se incluyen respuestas enlatadas, calculadora en tiempo de ejecucion, modelo profesor ni fallback a modelos externos, y que el corpus de entrenamiento y el estado del optimizador no se redistribuyen. No se documenta ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, MoE, SSM) mas alla del caracter artesanal de la implementacion.

## Capacidades

- Generacion de texto en ingles con estilo conversacional de personaje (voz «cute, playful, feminine catboy/femboy»), incluyendo maullidos y role-play expresivo.
- Copia y continuacion de texto: el autor reporta 96/96 en su suite de tareas de copia, lo que indica que el modelo reproduce fielmente material del contexto.
- Aritmetica basica muy limitada: 8/15 en la suite interna del autor.
- Generacion de codigo ocasional: 4/5 en una suite interna de solo cinco casos, sin evidencia de generalizacion.
- Respuestas generales y conversacion multi-turno: rendimiento bajo segun las propias metricas del autor (4/15 en respuestas generales y 0/25 en escenarios conversacionales completos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles; no hay evidencia de soporte de castellano ni de otros idiomas.
- Vision, audio, modo «thinking»: no disponible.
- Historial interactivo en memoria del proceso (comandos `/clear` y `/quit`) mediante el script local; no hay servicio alojado ni integracion con Discord u otras plataformas.

## Casos de uso

- Prototipado de pipelines de generacion de texto en local: el modelo se ejecuta en CPU o CUDA con un unico script (`python run.py --message "Hello!" --device cpu`), por lo que sirve para validar extremo a extremo un flujo de carga de safetensors, tokenizacion BPE propia y decodificacion determinista antes de invertir en modelos mayores.
- Investigacion sobre tokenizadores entrenados desde cero: al incluir un tokenizador BPE original y codigo de inferencia propio, es util para estudiar como afecta el vocabulario aprendido a la coherencia en modelos de muy baja escala.
- Docencia y divulgacion: un modelo de ~33 M de parametros y 0,1 GB de repo se puede descargar, inspeccionar y ejecutar en un portatil, lo que facilita explicar el ciclo completo de entrenamiento, exportacion y despliegue sin infraestructura dedicada.
- Pruebas de arneses de evaluacion: sus suites internas (aritmetica, copia, escenarios de personaje) son un ejemplo realista de evaluacion por conjuntos pequenos y especificos, util para disenar y depurar harnesses de evaluacion propios.
- Experimentos de personalidad y role-play controlado: para investigadores interesados en como un modelo diminuto modela un registro estilistico concreto; siempre como objeto de estudio, nunca como producto final de cara al usuario.
- Pruebas de integracion y CI de codigo de inferencia personalizado: al no depender de `transformers.AutoModel`, permite testear cargadores propios, gestion de safetensors y rutas de CPU/CUDA en entornos sin GPU.
- Benchmarking de infraestructura ligera: util como carga minima reproducible para medir latencia de arranque de procesos Python, coste de carga de pesos pequenos y consumo de memoria en contenedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor publica unicamente resultados de suites internas especificas del proyecto, que el mismo advierte que no son puntuaciones de benchmark estandar:

| Test (suite interna del autor) | Resultado |
|---|---:|
| Aritmetica | 8/15 |
| Codigo | 4/5 |
| Respuestas generales | 4/15 |
| Escenarios conversacionales completos | 0/25 |
| Ejemplos de maullidos «familiares» (vistos en entrenamiento) | 6/6 |
| Ejemplos de maullidos held-out | 0/2 |
| Escenas de personalidad fuerte «familiares» | 7/8 |
| Escenas de personalidad fuerte held-out | 0/8 |
| Suite de tareas de copia | 96/96 |

El patron (alto en ejemplos familiares, cero en held-out) indica sobreajuste a plantillas vistas y ausencia de generalizacion, tal como reconoce el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 130 MB en fp32, unos 65 MB en bf16 y unos 33 MB en int8 para 32,8 M de parametros, mas activaciones y overhead del runtime. Las cifras exactas dependen de la implementacion local, no documentada.
- GPU recomendadas: cualquier GPU CUDA con al menos 1 GB de VRAM es sobradamente suficiente; el modelo esta pensado para ejecutarse incluso en CPU (`--device cpu`). No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (GTX 1050 en adelante), y tambien en CPU sin GPU dedicada.
- Opciones de despliegue: solo el codigo Python local incluido en el repo (`run.py` + `requirements.txt`). No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni `transformers.AutoModel`; tampoco se ofrecen pesos GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar con otro modelo de la misma familia, documentado en la web del autor. Para el resto de alternativas de escala similar no hay especificaciones verificables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ChudGPT-Femboy | 32.843.136 (safetensors) / 29.697.408 (model card) | No disponible | No disponible (sin concesion explicita) | safetensors + codigo Python propio | HuggingFace, 0 descargas, 0 likes |
| ChudGPT-Public V20 | 20.999.184 | No disponible | No disponible en esta ficha | Distribuido como modelo HuggingFace autocontenido | HuggingFace / GitHub del autor |
| Otros modelos pequenos de la misma escala (por ejemplo, GPT-2 small o SmolLM-135M) | No verificado en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

Diferencias cualitativas observadas: ChudGPT-Femboy se posiciona como paso de personalidad de un proyecto con multiples checkpoints (Public, Pro, Plus, Code, Ultimate, Buggy, Mega), mientras que ChudGPT-Public V20 se describe como un transformer conversacional de clase 21 M. El autor indica que los checkpoints no se comparten entre submodelos.

## Limitaciones y advertencias

- Modelo de 33 M de parametros: la coherencia, la memoria multi-turno y la fiabilidad en codigo y matematicas son muy limitadas, segun las propias metricas del autor.
- Sobreajuste severo: 0/25 en escenarios conversacionales completos y 0/8 en escenas de personalidad held-out, frente a 7/8 en escenas familiares. No hay evidencia de generalizacion.
- Riesgo alto de alucinacion, repeticion e incoherencia; el autor lo advierte de forma explicita.
- Solo ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas ni en tareas de recuperacion sobre documentos.
- Licencia: no se concede ninguna licencia adicional. El uso comercial o la redistribucion requieren permiso explicito del autor; sin licencia clara, el riesgo legal en produccion no es asumible.
- Codigo de ejecucion suministrado por el autor: al no usar `transformers`, hay que revisar `run.py` antes de ejecutarlo en entornos propios.
- Sin salvaguardas documentadas: no se mencionan filtros de contenido, evaluaciones de sesgo ni moderacion. El estilo de personaje y el role-play pueden derivar en contenido inapropiado.
- Estado de publicacion: el autor declara que los requisitos originales de release no se cumplieron y que esta instantanea no esta aprobada para produccion. No hay compromiso de mantenimiento ni de reanudacion del entrenamiento.
- Metadatos a verificar: la fecha de creacion registrada en el Hub es 2026-10-18, posterior a la fecha habitual de consulta; conviene comprobar los metadatos directamente en la pagina del modelo.
- Discrepancia de parametros entre safetensors (32.843.136) y model card (29.697.408) sin explicacion del autor: a tener en cuenta en cualquier calculo de memoria o coste.
- Cero descargas y cero likes: no hay validacion por parte de terceros, ni reportes independientes de calidad o seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Astra228/ChudGPT-Femboy
- Perfil del autor en HuggingFace: https://huggingface.co/Astra228
- Web del proyecto ChudGPT: https://chudgpt-landing.vercel.app/
- Guia de modelos ChudGPT: https://chudgpt-landing.vercel.app/model-guide
- Pagina del autor (Astra / ASTRA228b): https://chudgpt-landing.vercel.app/astra
- Sitio ChudGPT // NEXT GEN: https://chudgpt.com/
- Repositorio GitHub ChudGPT-Public: https://github.com/ASTRA228b/ChudGPT-Public
