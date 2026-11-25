# eteron/ZeroHero-WebShop-10M-PPO-RA

## Resumen

ZeroHero-WebShop-10M-PPO-RA es una política de agente entrenada especificamente para el entorno WebShop-Small (1.000 productos e instrucciones sinteticas), publicada por el autor eteron dentro del proyecto ZeroHero. No es un modelo de lenguaje conversacional: se trata de un modelo pequeno de aproximadamente 9,98 millones de parametros, inicializado aleatoriamente y sometido despues a preentrenamiento supervisado y a un post-entrenamiento con PPO-RA (Proximal Policy Optimization con alguna variante de regularizacion o anclaje, segun la nomenclatura del autor). Su funcion es tomar observaciones del entorno WebShop y emitir acciones de agente (busqueda de productos, clic en resultados, seleccion de opciones), no generar texto libre.

La relevancia del lanzamiento es acotada pero concreta: sirve como referencia reproducible de un pipeline de reinforcement learning aplicado a agentes de compra web, con pesos de inferencia en FP32 safetensors y ejemplos ejecutables incluidos. El autor declara un presupuesto de post-entrenamiento de 720.896 decisiones de entorno. El repositorio no incluye codigo de entrenamiento, datos, pesos del critico, estados del optimizador ni arnes de evaluacion, de modo que su utilidad practica se limita a la inferencia y a la integracion mediante el wrapper de agente proporcionado.

El modelo esta etiquetado con la arquitectura qwen3 en los tags de Hugging Face, aunque el autor lo describe como un modelo pequeno inicializado aleatoriamente y preentrenado de forma supervisada. Solo soporta ingles y se distribuye bajo licencia Apache-2.0. Con cero descargas y cero likes en el momento de la consulta, es un artefacto de investigacion reciente, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo qwen3 (segun tags); modelo pequeno inicializado aleatoriamente y preentrenado de forma supervisada |
| Parametros totales | 9.983.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32, solo politica) |

## Arquitectura y entrenamiento

La model card indica que se parte de un modelo pequeno inicializado aleatoriamente, al que sigue un preentrenamiento supervisado y despues un post-entrenamiento con PPO-RA sobre WebShop-Small, un entorno con 1.000 productos e instrucciones sinteticas. El presupuesto declarado de post-entrenamiento es de 720.896 decisiones de entorno. Los tags de Hugging Face apuntan a una arquitectura de la familia qwen3, aunque no se detalla la configuracion de capas, dimensiones ocultas ni atencion. No se especifica el numero de tokens de preentrenamiento, la composicion del dataset supervisado ni los hiperparametros de PPO-RA (tasa de aprendizaje, coeficiente de clipping, funcion de recompensa o esquema de regularizacion).

El autor es explicito sobre el alcance del artefacto: se publican unicamente los pesos de inferencia de la politica y ejemplos ejecutables. No se incluyen codigo de entrenamiento, datos de entrenamiento, pesos del critico, estados del optimizador ni arnes de evaluacion. Se conservan sumas de verificacion de los pesos de origen y se comprobo la igualdad exacta de los tensores de politica durante la exportacion; `SHA256SUMS` cubre los ficheros de la release. El autor advierte que los resultados numericos de las curvas de entrenamiento no constituyen una evaluacion held-out de esta release y que el muestreo y las diferencias numericas de runtime pueden alterar respuestas individuales.

## Capacidades

- Seleccion de acciones de agente en el entorno WebShop-Small: busqueda de productos, clic en resultados y eleccion de opciones de compra.
- Procesamiento de observaciones del entorno mediante un contrato de entrada definido en `agent_config.json` y `release_metadata.json`.
- Generacion de una unica respuesta por observacion a traves del wrapper de agente incluido en `examples/`.
- Integracion con Hugging Face Transformers como libreria de carga.
- Compatibilidad declarada con text-generation-inference y endpoints (tag `endpoints_compatible`).
- No soporta tool calling general, function calling arbitrario, agentes multi-paso fuera del entorno WebShop, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.
- No es un modelo de chat de proposito general; el propio autor lo indica explicitamente.

## Casos de uso

- Investigacion en reinforcement learning para agentes web: el modelo sirve como politica de referencia para reproducir o comparar experimentos de PPO-RA en WebShop-Small, cargando los pesos con Transformers y usando el wrapper incluido para formatear observaciones y parsear respuestas.
- Evaluacion de entornos de compra simulada: permite ejecutar episodios completos de juego (single-episode gameplay) contra WebShop-Small para medir la calidad de las acciones del agente sin necesidad de entrenar desde cero.
- Baseline para ablaciones de post-entrenamiento: al publicarse solo la politica final, puede usarse como punto de comparacion frente a politicas propias entrenadas con otros algoritmos o presupuestos, siempre que se respete el mismo contrato de entrada.
- Docencia y divulgacion sobre agentes RL: el ejemplo de una sola respuesta (`examples/infer.py`) no requiere instalar el entorno, lo que facilita demostraciones en clase o tutoriales sobre como una politica mapea observaciones a acciones.
- Pruebas de integracion de pipelines de inferencia: los tags de compatibilidad con text-generation-inference y endpoints permiten validar despliegues ligeros de modelos de ~10M de parametros en infraestructura estandar.
- Verificacion de reproducibilidad y cadena de custodia: los checksums (`SHA256SUMS`) y la comprobacion de igualdad de tensores en la exportacion permiten auditar que los pesos publicados coinciden con los de origen en flujos de investigacion reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que los resultados numericos de las curvas de entrenamiento no se presentan como una evaluacion held-out de esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los ~9,98M de parametros (aproximadamente 40 MB de pesos mas overhead de runtime y activaciones); no se dispone de estimaciones oficiales para otras precisiones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas de gama baja. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano del modelo.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference y endpoints compatibles segun tags. No se confirma soporte de llama.cpp, Ollama ni TGI mas alla de la etiqueta de compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas de agente para WebShop) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- No es un modelo de proposito general ni un chat: el autor advierte que debe usarse el wrapper de agente incluido, ya que el formateo de observaciones y el parseo de respuestas forman parte de la interfaz de la politica.
- Entrenado exclusivamente para WebShop-Small (1.000 productos, instrucciones sinteticas); no se garantiza transferencia a otros entornos, catalogos mayores o dominios reales.
- Solo ingles; no hay soporte multilingue declarado.
- No se publican datos de entrenamiento, codigo, pesos del critico ni arnes de evaluacion, lo que dificulta la reproduccion completa y la auditoria del proceso.
- Riesgo de sobreajuste al entorno sintetico y de comportamiento degenerado fuera de la distribucion de observaciones de entrenamiento; no se documentan sesgos especificos.
- El autor senala que el muestreo y las diferencias numericas de runtime pueden cambiar respuestas individuales, por lo que los resultados no son deterministas entre ejecuciones.
- Licencia Apache-2.0 permite uso comercial, pero las dependencias del entorno y las observaciones de benchmarks publicos quedan sujetas a sus licencias originales (ver `THIRD_PARTY_NOTICES.md`).
- Sin descargas ni validacion comunitaria en el momento de la consulta; no hay evidencia externa de calidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eteron/ZeroHero-WebShop-10M-PPO-RA
- Ejemplos de inferencia: `examples/README.md` y `examples/infer.py` dentro del repositorio
- Contrato de entrada y metadatos: `agent_config.json` y `release_metadata.json` en el repositorio
- Checksums de la release: `SHA256SUMS` en el repositorio
- Avisos de terceros: `THIRD_PARTY_NOTICES.md` en el repositorio
