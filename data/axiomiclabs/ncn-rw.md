# AxiomicLabs/NCN-RW

## Resumen

NCN-RW es un modelo de lenguaje base de 9.720.525 parametros entrenado desde cero por AxiomicLabs, un laboratorio que explora arquitecturas inspiradas en neurociencia computacional. Se trata de un hibrido recurrente-Transformer que combina un tronco Transformer causal con memoria GRU, cinco expertos densos con SwiGLU y un controlador neuromodulador que ajusta dinamicamente el procesamiento de la representacion compartida. Es el primer miembro publico de la familia Neuromodulatory Control Networks (NCN).

El modelo resuelve dos tareas concretas: completado de texto y puntuacion de continuaciones (scoring). No es un modelo de instrucciones ni esta alineado con RLHF: es un checkpoint base en ingles, con vocabulario byte-level BPE de 4.096 tokens y una ventana de contexto de solo 512 tokens. Su tamano reducido (0,1 GB de repositorio) lo situa en la categoria de small language models, pensados para investigacion de arquitecturas y experimentacion de bajo coste mas que para produccion.

Su relevancia actual es fundamentalmente arquitectonica. Frente a la tendencia dominante de escalar Transformers densos, NCN-RW propone tres formas simultaneas de recurrencia (de token en el GRU tonico, de profundidad en el bucle de retroalimentacion y semantica en el tronco reutilizado) con un controlador de 64 dimensiones que modula precision de atencion, ganancias pre y postsinapiticas, compuertas de refresco del espacio de trabajo y enrutamiento de expertos. Todo ello con reutilizacion de pesos en lugar de duplicacion de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido recurrente-Transformer (RNN-Transformer hybrid) con controlador neuromodulador; tronco Transformer causal + GRU + caminos MLP; cinco expertos densos SwiGLU con consenso ponderado |
| Parametros totales | 9.720.525 |
| Parametros activos | No disponible como cifra separada; la model card indica que los cinco expertos son densos y se combinan mediante consenso ponderado |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; el repositorio solo contiene safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PyTorch, requiere custom_code) |

Datos adicionales de arquitectura publicados en la model card:

| Parametro | Valor |
|---|---|
| Tamano oculto | 256 |
| Vocabulario | BPE byte-level de 4.096 tokens |
| Bloques del nucleo compartido | 6, aplicados en dos pasadas |
| Bloques adicionales | 1 preludio y 1 coda |
| Aplicaciones totales del bloque principal | 14 |
| Atencion | Causal con grouped-query attention; 8 cabezas de consulta, 2 cabezas KV; normalizacion QK y RoPE |
| Feed-forward principal | SwiGLU, anchura 896 |
| Expertos | 5 adaptadores densos SwiGLU, anchura 256 |
| Anchura del controlador neuromodulador | 64 |
| Estado tonico del GRU | 64 dimensiones |
| Dropout | 0 |
| Tokens de entrenamiento | Aproximadamente 10.000 millones |
| Descargas / likes en HuggingFace | 205 / 10 |

## Arquitectura y entrenamiento

El modelo se organiza en tres componentes que forman un bucle de retroalimentacion. El Transformer construye la representacion linguistica de 256 dimensiones mediante atencion causal y FFN SwiGLU: un preludio genera un ancla, seis bloques nucleo forman el tronco compartido y una coda produce la representacion final. El GRU mantiene un estado tonico de 64 dimensiones a lo largo de los tokens, mientras que una GRUCell independiente actualiza el estado del controlador a lo largo de la profundidad computacional. Los caminos MLP combinan memoria tonica con cambios fasicos, decodifican las senales de control neuromodulador y predicen cambios internos de representacion.

El flujo principal es: embeddings de token, preludio y ancla, tronco de seis bloques, cinco propuestas de expertos, consenso ponderado, refinador SwiGLU compartido, refresco hacia el ancla, segunda pasada por el mismo tronco de seis bloques con estado del controlador actualizado, de nuevo expertos y refinador con nuevas propuestas y votos, y finalmente coda con lectura de vocabulario atada. El peso compartido permite ganar profundidad efectiva sin duplicar parametros: las dos pasadas producen 14 aplicaciones del bloque principal contando preludio y coda. Antes de la segunda pasada, una compuerta de refresco aprendida por caracteristica mezcla el espacio de trabajo actual con el ancla del preludio, y un embedding de pasada distingue las rondas para el controlador.

La neuromodulacion actua en varios puntos: precision de atencion (escalado por cabeza de las consultas normalizadas), ganancia presinaptica (fuerza de salida por cabeza antes de la proyeccion), ganancia postsinapitica (fuerza por caracteristica despues de la proyeccion), una senal de difusion global de 256 dimensiones que actua sobre la entrada de la compuerta SwiGLU mediante receptores especificos por capa, ganancia escalar de salida del FFN, retencion del espacio de trabajo y una compuerta escalar de actualizacion del flujo residual. El estado inicial del controlador combina la salida del GRU tonico, una proyeccion fasica de los cambios entre embeddings de tokens vecinos y su interaccion multiplicativa. El componente Compass anade tres predicciones aprendidas en horizontes de 8, 32 y 64, y segun la model card los tokens futuros se usan como objetivos de entrenamiento sin entrar en la ruta de control durante la inferencia. Los datos de entrenamiento proceden de fineweb-edu, cosmopedia, dclm-baseline-1.0, finemath y TinyStories. No se menciona en la informacion disponible el uso de RLHF, DPO u otra fase de alineacion.

## Capacidades

- Generacion de texto en ingles: modelo causal base orientado a completado y continuacion.
- Puntuacion de continuaciones (continuation scoring): el segundo caso de uso explicito declarado por el autor.
- Razonamiento y conocimiento factual: no documentados en la model card; el tamano y el volumen de datos sugieren capacidad limitada.
- Codigo y matematicas: no hay evidencia publicada de capacidades especificas en estos dominios.
- Tool calling / function calling: no soportado de forma nativa; no se menciona en la model card.
- Uso como agente o razonamiento multi-paso: no soportado; es un modelo base sin alineacion para instrucciones.
- Capacidades multilingues: solo ingles declarado.
- Capacidad especial: control neuromodulador con modulacion dinamica de atencion, FFN y refresco de representacion, mas predicciones internas de Compass en horizontes 8, 32 y 64.
- Modo thinking, vision o audio: no disponible.
- Razonamiento visual o multimodal: no disponible.

## Casos de uso

- Puntuacion y filtrado de datos sinteticos: el modelo puede calcular la verosimilitud de continuaciones en ingles y usarse como filtro de calidad o deduplicador en pipelines de generacion de datasets; su tamano permite ejecutarlo sobre grandes volumenes de texto con coste minimo.
- Investigacion en arquitecturas hibridas: NCN-RW es un banco de pruebas reproducible para estudiar recurrencia de profundidad, comparticion de pesos y modulacion contextual; su unico checkpoint puede ejecutarse en una unica GPU de gama baja y permite ablaciones rapidas sobre las dos pasadas del tronco.
- Experimentos de neuromodulacion y biomimetica: las cabezas de control (precision de atencion, ganancias sinapticas, refresco del espacio de trabajo) son inspeccionables, lo que permite estudiar como un controlador de 64 dimensiones altera el calculo del tronco sin reentrenar desde cero.
- Prototipado y pruebas unitarias de pipelines de inferencia: al requerir custom_code, sirve para validar integraciones de transformers con codigo remoto, carga de safetensors y gestion de cache de atencion por pasada antes de escalar a modelos mayores.
- Generacion de texto narrativo simple en ingles: entrenado parcialmente con TinyStories, es adecuado para completar micro-relatos o frases cortas dentro de la ventana de 512 tokens, con expectativas de coherencia limitadas.
- Educacion y demostraciones de arquitecturas: por su tamano (menos de 40 MB en FP32), puede desplegarse en portatiles o entornos sin GPU para explicar el funcionamiento de un Transformer causal con memoria recurrente.
- Instrumentacion de metricas internas: las predicciones de Compass y las ganancias de control pueden registrarse como senales auxiliares en estudios de interpretabilidad o de deteccion de anomalias en texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos (calculada a partir de 9.720.525 parametros, no publicada por el autor): aproximadamente 39 MB en FP32, 19 MB en FP16/BF16, 10 MB en INT8 y 5 MB en INT4.
- Memoria adicional: el estado recurrente (64 dimensiones de GRU) y la cache de atencion por pasada son despreciables frente a los pesos; se estima una cache de atencion inferior a 2 MB para 512 tokens asumiendo 12 aplicaciones de atencion con 2 cabezas KV y dimension de cabeza 32 (estimacion propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos e incluso en CPU.
- Opciones de despliegue: al usar custom_code con arquitectura hibrida recurrente, requiere transformers con `trust_remote_code=True` y la implementacion propia del autor. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin conversion previa. No consta soporte oficial en vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de terceros en la informacion proporcionada. Se listan alternativas de la misma categoria (modelos base en ingles de muy bajo numero de parametros), marcando como "no disponible" los campos no confirmados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AxiomicLabs/NCN-RW | 9,72 M | 512 | Apache 2.0 | HuggingFace, requiere custom_code | Arquitectura hibrida recurrente-Transformer con neuromodulacion |
| Familia TinyStories (roneneldan) | No disponible | No disponible | No disponible | HuggingFace | Uno de los datasets de entrenamiento de NCN-RW; modelos narrativos de baja escala |
| Familia Pythia (EleutherAI) | No disponible | No disponible | No disponible | HuggingFace | Referencia habitual de modelos base pequenos con checkpoints intermedios |
| GPT-2 small | 124 M | 1.024 | No disponible | Ampliamente disponible | Orden de magnitud superior en parametros; comparacion solo orientativa |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes, no mantiene formato conversacional y no debe usarse directamente como asistente.
- Ventana de contexto muy corta (512 tokens), insuficiente para documentos largos, dialogos extensos o tareas de recuperacion.
- Solo soporta ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y de afirmaciones factualmente incorrectas: 9,72 M de parametros no permiten almacenar conocimiento factual extenso.
- Sesgos potenciales heredados de los corpus de entrenamiento (fineweb-edu, dclm-baseline-1.0, cosmopedia), que recogen texto web con los sesgos propios de ese origen. No se documentan evaluaciones de sesgo en la model card.
- Posible sobreajuste o infrautilizacion de capacidad: 10.000 millones de tokens sobre 9,72 M de parametros es una ratio muy alta; el autor no publica curvas de validacion ni analisis de generalizacion.
- Requiere ejecutar codigo personalizado (`custom_code`) al cargar el modelo, lo que implica revisar la implementacion antes de usarla en entornos no confiables.
- No hay pesos cuantizados publicados ni conversion a GGUF, lo que limita el despliegue en herramientas estandar.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y patentes; no impone restricciones adicionales de uso, pero el autor no ofrece garantias.
- El componente Compass usa tokens futuros como objetivos de entrenamiento; segun la model card estos no entran en la ruta de control en inferencia, pero conviene verificarlo en la implementacion publicada.
- No se documentan limites de uso, evaluaciones de seguridad ni pruebas de robustez frente a entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxiomicLabs/NCN-RW
- Paper tecnico: no disponible
- Blog o articulo del autor: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
