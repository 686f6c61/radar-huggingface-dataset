# SLM-Archive/Novi-Nano-Base

## Resumen

Novi-Nano-Base es un modelo de lenguaje causal entrenado desde cero por Novi-AI (publicado en el repositorio de HuggingFace bajo la organizacion SLM-Archive) con apenas 1.258.560 parametros. Se trata de un transformer decoder-only de estilo GPT-2, con una ventana de contexto de solo 256 tokens, un vocabulario de 8.192 entradas y un tamano de embedding de 96 dimensiones repartido en 4 capas y 4 cabezas de atencion. Su interes no es competir con modelos de miles de millones de parametros, sino servir como banco de pruebas reproducible para estudiar el comportamiento de un modelo de lenguaje a escala extrema.

El modelo fue entrenado sobre aproximadamente 300 millones de tokens (300.023.808 exactamente, segun la model card) y alcanza una perdida de validacion de 5,418699, lo que equivale a una perplejidad de 225,5853. Estos valores son coherentes con un modelo minusculo: la generacion resultante es previsiblemente poco coherente y con conocimiento del mundo muy limitado. Es un modelo base, sin ajuste por instrucciones (instruction tuning), por lo que no funciona como asistente conversacional.

Su relevancia actual es fundamentalmente metodologica: el ecosistema necesita modelos pequenos, baratos y de pesos abiertos para validar pipelines de datos, tokenizadores, herramientas de cuantizacion, entornos de inferencia y experimentos de ajuste fino sin consumir recursos de GPU. Con ~1,26 M de parametros en F32, el archivo de pesos ocupa apenas unos 5 MB, lo que permite ejecutarlo en CPU, en dispositivos embebidos o incluso dentro de una bateria de tests automatizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia GPT-2) |
| Parametros totales | 1.258.560 (aprox. 1,26 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | Pesos publicados en F32 (tensor type: F32); no se distribuyen versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 segun la model card; el campo de licencia del repositorio figura como no disponible |
| Formato de pesos | safetensors (cargable con transformers) |

Datos adicionales de configuracion recogidos en la model card:

| Parametro | Valor |
|---|---|
| Tamano de vocabulario | 8.192 |
| Tamano de embedding | 96 |
| Numero de capas | 4 |
| Cabezas de atencion | 4 |
| Tamano de la FFN | 384 |
| Tipo de tensor | F32 |
| Tokens de entrenamiento | 300.023.808 |
| Mejor perdida de validacion | 5,418699 |
| Perdida de validacion final | 5,418699 |
| Perplejidad de validacion final | 225,5853 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal clasico, sin mecanismos de atencion lineal, sin capas recurrentes ni hibridaciones tipo SSM/Mamba, y sin mezcla de expertos. Los hiperparametros declarados (96 de embedding, 4 capas, 4 cabezas, FFN de 384, vocabulario de 8.192 y contexto de 256) permiten reconstruir el recuento de parametros: 786.432 parametros en el embedding de tokens, 24.576 en el embedding posicional aprendido de 256 posiciones, 447.360 en los 4 bloques transformer y 192 en la normalizacion final. La suma coincide exactamente con los 1.258.560 parametros publicados, lo que sugiere que la cabeza de lenguaje comparte pesos con el embedding de tokens (weight tying), una practica habitual para reducir el recuento en modelos de vocabulario grande respecto al tamano oculto. No se especifica en la informacion disponible el tipo de normalizacion, la funcion de activacion, ni si se emplean embeddings posicionales aprendidos o relativos; el calculo de parametros es compatible con embeddings posicionales aprendidos.

El entrenamiento se realizo desde cero sobre unos 300 millones de tokens, un regimen muy por encima del minimo de Chinchilla para este tamano (que rondaria los 25-30 millones de tokens), lo que indica que el modelo esta deliberadamente sobreentrenado respecto a su capacidad, probablemente para extraer el maximo de un presupuesto de computo minimo. El tokenizador es propio, con 8.192 entradas, y se entreno con datos de FineWeb-Edu, FineWeb-HQ y SmolLM-Cosmopedia; estos mismos corpus parecen haber alimentado el preentrenamiento, aunque la model card no detalla la composicion exacta ni el reparto por fuente. No hay evidencia de fases de RLHF, DPO, SFT ni de cualquier otro ajuste por preferencias: se trata de un modelo estrictamente base.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de prompts cortos en ingles, con coherencia limitada a unas pocas frases.
- Modelado de lenguaje a nivel de token para experimentacion: calculo de perplejidad y de perdidas de validacion sobre corpus de prueba.
- Aprendizaje de patrones locales: repeticion de estructuras sintacticas simples, terminaciones de frase frecuentes y patrones de formato muy presentes en los datos de entrenamiento.
- Capacidad multilingue practicamente nula: el modelo esta entrenado solo en ingles y su vocabulario de 8.192 entradas no cubre de forma razonable otros idiomas.
- No soporta tool calling ni function calling: no hay plantilla de chat, ni tokens especiales de herramienta, ni ajuste por instrucciones.
- No soporta agentes ni razonamiento multi-paso: la ventana de 256 tokens impide mantener cadenas de pensamiento extensas o estados intermedios de un flujo agentico.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad adicional.
- Es un modelo base, por lo que tampoco esta alineado para rechazar peticiones daninas ni para seguir instrucciones de sistema.

## Casos de uso

- Docencia y materiales educativos: permite mostrar de principio a fin el ciclo completo de un LLM (tokenizacion, forward pass, calculo de perdida, generacion) en una libreta o en un portatil sin GPU, ya que el modelo completo cabe en unos 5 MB en F32.
- Pruebas de integracion y CI/CD de plataformas de inferencia: sirve como modelo "dummy" realista para validar servidores compatibles con la API de transformers, TGI o endpoints compatibles, verificando carga de safetensors, tokenizacion y streaming de forma rapida y determinista.
- Experimentos de ajuste fino de bajo coste: al ser un modelo base de 1,26 M de parametros, un fine-tuning completo sobre un corpus pequeno se puede ejecutar en CPU en minutos, lo que permite estudiar tecnicas de optimizacion (schedulers, inicializacion, regularizacion) sin presupuesto de GPU.
- Investigacion sobre tokenizadores: su vocabulario propio de 8.192 entradas, entrenado con FineWeb-Edu, FineWeb-HQ y SmolLM-Cosmopedia, permite analizar el impacto del diseno del tokenizador en un modelo pequeno y comparar curvas de perplejidad.
- Validacion de pipelines de datos: se puede usar como sonda barata para detectar contaminacion, duplicados o sesgos de formato en corpus de entrenamiento, evaluando cambios en la perplejidad de validacion.
- Inferencia en dispositivos embebidos y edge: con menos de 2,5 MB en FP16, es viable ejecutarlo en microcontroladores con suficiente RAM, Raspberry Pi o navegador (via transformers.js tras conversion), como demostracion de LLM on-device.
- Estudios de escalado y ablaciones: sirve como punto minimo en curvas de escalado (parametros frente a perdida) para comparar con modelos de 10 M, 100 M o 1 B de parametros bajo el mismo pipeline de datos.
- Generacion de baselines en tareas de texto: al ser un modelo base sin ajuste, proporciona una cota inferior de rendimiento contra la que medir mejoras de modelos mayores en tareas como continuacion de texto o modelado de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento y validacion:

| Metrica | Resultado |
|---|---|
| Tokens de entrenamiento | 300.023.808 |
| Mejor perdida de validacion | 5,418699 |
| Perdida de validacion final | 5,418699 |
| Perplejidad de validacion final | 225,5853 |

No hay datos de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni de ninguna otra evaluacion estandar, ni comparaciones publicadas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5 MB para los pesos en F32 (calculo derivado: 1.258.560 parametros x 4 bytes) y unos 2,5 MB en FP16. A esto hay que sumar el overhead del runtime de PyTorch y del tokenizador, que tipicamente domina el consumo total (cientos de MB a 1-2 GB de RAM en funcion de la version y del backend).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es mas que suficiente; GTX 1050, GTX 1650, RTX 3050, RTX 4090, A100 o H100 no marcan diferencia practica porque el modelo no satura el computo. La recomendacion realista es CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU, Raspberry Pi y dispositivos con pocos cientos de MB de RAM.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), y cualquier servidor que consuma safetensors a traves de transformers. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa por parte del usuario.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia; en la practica, con un modelo de este tamano la latencia estara dominada por el overhead del framework y por el coste de tokenizacion, no por el forward pass.
- Nota de despliegue: la ventana de 256 tokens limita el batch de generacion efectivo; no se recomienda el uso con `max_new_tokens` alto, ya que el modelo agotara el contexto rapidamente.

## Comparativa con modelos similares

No se dispone de datos de benchmark comparativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales declaradas. Los datos de los modelos alternativos provienen de sus model cards publicas y no han sido verificados en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Novi-Nano-Base | 1,26 M | 256 tokens | Apache 2.0 (segun model card) | safetensors, transformers |
| GPT-2 small | 124 M (aprox.) | 1.024 tokens | MIT | safetensors, transformers, GGUF en la comunidad |
| SmolLM-135M | 135 M (aprox.) | 2.048 tokens | Apache 2.0 | safetensors, transformers, GGUF |
| TinyStories-1M | 1 M (aprox.) | 512 tokens (aprox.) | no disponible aqui | safetensors, transformers |

Diferencias clave: Novi-Nano-Base es aproximadamente dos ordenes de magnitud mas pequeno que GPT-2 small y SmolLM-135M, con una ventana de contexto entre 2 y 8 veces mas corta, y sin versiones cuantizadas publicadas. Su unico punto fuerte comparativo es el tamano del artefacto (unos 5 MB) y su idoneidad como banco de pruebas, no su calidad de generacion. No se han encontrado comparaciones de rendimiento entre estos modelos dentro de la informacion disponible.

## Limitaciones y advertencias

- Calidad de generacion muy baja: con una perplejidad de validacion de 225,59 y solo 1,26 M de parametros, es esperable texto incoherente, repeticiones y errores facticos frecuentes, tal como reconoce la propia model card.
- Alucinacion: el modelo no tiene mecanismo alguno de grounding ni de verificacion; cualquier afirmacion factica que genere debe considerarse no fiable por defecto.
- Conocimiento del mundo muy limitado: 300 millones de tokens de entrenamiento estan varios ordenes de magnitud por debajo de los corpus usados por modelos de miles de millones de parametros.
- Contexto muy corto: la ventana de 256 tokens se agota en unas pocas frases, lo que impide conversaciones multi-turno, resumen de documentos o razonamiento en varios pasos.
- Limitacion idiomatica: solo ingles. No hay datos de rendimiento en castellano ni en otros idiomas, y su vocabulario de 8.192 entradas penalizara fuertemente el texto no ingles.
- No es un modelo de instrucciones: al ser un modelo base, no responde a comandos ni mantiene un rol de asistente; no debe desplegarse en interfaces conversacionales sin un ajuste previo.
- Ausencia de alineacion: no ha pasado por RLHF ni DPO, por lo que no incorpora filtros de seguridad y puede reproducir contenido problematico presente en los corpus de entrenamiento (FineWeb-Edu, FineWeb-HQ, SmolLM-Cosmopedia).
- Ambiguedad de licencia: la model card declara Apache 2.0, pero el campo de licencia del repositorio de HuggingFace figura como no disponible. Antes de un uso comercial conviene confirmarlo con el autor, ya que la discrepancia puede generar incertidumbre juridica.
- Discrepancia de identificadores: el repositorio consultado es `SLM-Archive/Novi-Nano-Base`, mientras que los ejemplos de la model card referencian `Novi-AI/Novi-Nano-Base`. Conviene verificar cual es el espacio canonico antes de fijar una dependencia.
- Metadatos de fecha anomalos: la fecha de creacion y actualizacion del repositorio figura como 2026-10-01, posterior a la fecha habitual de publicacion de modelos comparables; conviene tratarla con cautela.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o representacion demografica para este modelo.
- Produccion: no debe usarse en sistemas productivos orientados a usuario final. Es un artefacto de investigacion y experimentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SLM-Archive/Novi-Nano-Base
- Referencia de identificador alternativo citada en la model card: Novi-AI/Novi-Nano-Base (no verificado)
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados obtenidos corresponden a contenidos no relacionados (una marca de perfumes con el dominio slm.paris, una mutua sanitaria francesa y un articulo divulgativo de IBM sobre modelos de lenguaje pequenos). Como contexto generico sobre modelos de lenguaje pequenos puede consultarse https://www.ibm.com/fr-fr/think/topics/small-language-models, aunque no guarda relacion con Novi-Nano-Base.
- No se dispone de paper, repositorio de codigo, demo, blog tecnico ni dataset publicado asociados a este modelo en la informacion proporcionada.
