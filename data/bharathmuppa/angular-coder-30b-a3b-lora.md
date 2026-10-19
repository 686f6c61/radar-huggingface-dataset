# bharathmuppa/angular-coder-30b-a3b-lora

## Resumen

`angular-coder-30b-a3b-lora` es un adaptador LoRA de PEFT, no un modelo completo, publicado por el usuario `bharathmuppa` el 19 de octubre de 2026 bajo licencia Apache 2.0. Se aplica sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`, un transformer de tipo mezcla de expertos (MoE) con 30.000 millones de parametros totales y unos 3.000 millones activos por token. El adaptador especializa ese backbone en generacion de codigo Angular: componentes, plantillas, servicios, modulos y utilidades del framework de Google.

La relevancia practica del artefacto esta en su formato: al ser un adaptador de rango 16 sobre las proyecciones q/k/v/o de todas las capas, ocupa 0,1 GB en el repositorio y se puede cargar sobre el modelo base sin duplicar los 30B de pesos. Esto permite servirlo junto al modelo original mediante tecnicas de multi-LoRA en un servidor de inferencia, o fusionarlo para obtener un checkpoint independiente (`bharathmuppa/angular-coder-30b-a3b`, segun indica la propia model card).

Conviene interpretarlo con cautela: el entrenamiento fue muy corto (145 pasos de optimizador, 0,365 epocas) y el autor no publica en esta ficha el dataset, los benchmarks ni los idiomas soportados. Es un artefacto experimental orientado a un dominio muy concreto, sin descargas ni validacion comunitaria en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre un transformer MoE (base: Qwen3-Coder-30B-A3B-Instruct) |
| Parametros totales | 30B en el modelo base; el adaptador anade un subconjunto no cuantificado en la informacion disponible |
| Parametros activos | 3B por token en el modelo base (MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | Adaptador distribuido en safetensors sin cuantizar; cuantizaciones del modelo base no disponibles en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, libreria `peft`) |

Hiperparametros del adaptador:

| Parametro | Valor |
|---|---|
| Rango (r) | 16 |
| Alpha | 16 |
| Dropout | 0,05 |
| Modulos objetivo | Proyecciones q, k, v y o de todas las capas |
| Pasos de optimizador | 145 |
| Epocas | 0,365 |
| Loss de evaluacion final | 1,3578 |
| Tamano del repositorio | 0,1 GB |
| Configuracion del run | `train_summary.json` incluido en el repositorio |

## Arquitectura y entrenamiento

El adaptador emplea LoRA clasico sobre la atencion del modelo base: se insertan matrices de baja dimensionalidad (r=16, alpha=16, dropout 0,05) en las proyecciones de query, key, value y output de cada capa del transformer, dejando congelados los pesos originales. El backbone es un MoE de Qwen con 30B totales y 3B activos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. El adaptador en si no modifica la arquitectura ni la ventana de contexto; hereda ambas del checkpoint base.

El entrenamiento registrado es muy breve: 145 pasos de optimizador, equivalentes a 0,365 epocas sobre el conjunto de datos, con una loss de evaluacion final de 1,3578. La model card no detalla el numero de tokens, la composicion del dataset, el regimen de RLHF/DPO ni la version concreta de Angular cubierta; remite al repositorio del modelo fusionado para esos datos. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion) mas alla del propio ajuste LoRA.

## Capacidades

- Generacion y autocompletado de codigo TypeScript y Angular: componentes, plantillas HTML, directivas, pipes y servicios inyectables.
- Refactorizacion de codigo Angular existente, presumiblemente orientada al estilo del dataset de entrenamiento (no documentado).
- Conversiones entre patrones del framework, como NgModule a componentes standalone o formularios por plantilla a formularios reactivos, siempre que el ajuste haya cubierto esos patrones.
- Explicacion de fragmentos de codigo y generacion de tests unitarios en el ecosistema habitual de Angular (Jasmine/Karma o Jest), sin garantia documentada.
- Tool calling y function calling: heredados del modelo base Qwen3-Coder, no verificados para este adaptador.
- Razonamiento multi-paso y uso en agentes: herencia del modelo base, sin evaluacion publicada para el adaptador.
- Capacidades multilingues: no disponibles; no se documenta que idiomas cubre el ajuste, y el codigo y los comentarios pueden estar exclusivamente en ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito para este adaptador.

## Casos de uso

- Migracion de una base de codigo Angular a componentes standalone: el adaptador puede reescribir modulos y declaraciones al nuevo estilo, y se sirve junto al modelo base mediante multi-LoRA en vLLM para atender peticiones por lotes.
- Generacion de servicios y clientes HTTP: producir servicios inyectables con `HttpClient`, tipado de respuestas y manejo de errores, un patron repetitivo donde un ajuste de dominio reduzca la variabilidad del estilo de salida.
- Creacion de tests unitarios: generar especificaciones con `TestBed` y dobles de prueba para componentes y servicios existentes, integrandolo en un pipeline de CI que reciba el diff y devuelva los tests propuestos.
- Revision de codigo en pull requests: desplegado como servicio interno que evalua diffs Angular y senala APIs deprecadas o patrones obsoletos, con el modelo base completo actuando como fallback para lenguaje no especifico del framework.
- Asistente en IDE para un equipo concreto: al ser un adaptador de 0,1 GB, se puede cargar dinamicamente por proyecto sobre una instancia compartida del modelo base, de modo que el mismo servidor atienda consultas generales y consultas Angular.
- Documentacion tecnica de componentes: generar descripciones de entradas y salidas (`@Input`, `@Output`), ejemplos de uso y notas de migracion a partir del codigo fuente.
- Prototipado rapido de interfaces: producir plantillas y estilos base para pantallas administrativas, utiles como punto de partida sujeto a revision humana.
- Formacion interna: explicar patrones de Angular (inyeccion de dependencias, ciclo de vida, signals) a partir de ejemplos de la propia base de codigo de la empresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo del entrenamiento es la loss de evaluacion final:

| Metrica | Valor |
|---|---|
| Loss de evaluacion final | 1,3578 |
| Pasos de optimizador | 145 |
| Epocas | 0,365 |

No se proporciona la loss inicial ni una linea base del modelo sin ajustar, por lo que no es posible atribuir al adaptador una mejora medible en la tarea Angular.

## Requisitos de hardware

- El adaptador no se ejecuta de forma autonoma: requiere cargar el modelo base Qwen3-Coder-30B-A3B-Instruct, de 30B parametros totales.
- VRAM estimada para los pesos del modelo base: en bf16, unos 60 GB; en fp8, unos 30 GB; en cuantizacion de 4 bits, unos 15-17 GB. A esas cifras hay que sumar la cache KV y el overhead del runtime (estimacion aritmetica a partir del numero de parametros, no medida publicada).
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; L40S 48 GB o A100 40 GB para fp8 con contexto moderado; para 4 bits, RTX 4090 o RTX 3090 de 24 GB quedan muy justas y es preferible disponer de 32 GB o mas.
- Cabe en GPU de consumo (RTX 4090, 3090, 5090) solo con cuantizacion de 4 bits y contextos contenidos; el adaptador en si ocupa 0,1 GB adicionales.
- Opciones de despliegue: vLLM con soporte multi-LoRA (`--enable-lora`) para servir el adaptador sobre una instancia compartida del base; SGLang con LoRA; llama.cpp u Ollama con una version GGUF del modelo fusionado; TGI para el checkpoint fusionado.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con 3B activos, el coste por token se aproxima al de un modelo denso de ese orden, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| angular-coder-30b-a3b-lora (este) | 30B (base) + adaptador LoRA r16 | 3B (base) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste de dominio Angular, entrenamiento de 145 pasos |
| Qwen3-Coder-30B-A3B-Instruct | 30B | 3B | No disponible en las fuentes consultadas | Apache 2.0 | Hugging Face, mas de 4,6M descargas segun la fuente | Modelo base generalista de codigo; referencia contra la que medir el adaptador |
| North Mini Code (Cohere) | 30B | 3B | No disponible | Open-weight (terminos no detallados) | Anunciado en 2026 | MoE orientado a coding agentico y despliegue en infraestructura propia |
| Qwen3.5-35B-A3B | 35B (denominacion) | No confirmado en las fuentes | No disponible | No disponible | Hugging Face | Generacion posterior de la familia Qwen; sin datos de rendimiento en la informacion disponible |

## Limitaciones y advertencias

- Entrenamiento muy corto (145 pasos, 0,365 epocas): el efecto del ajuste puede ser marginal o estar sobreajustado a un conjunto pequeno; no hay evaluacion que lo demuestre.
- Ausencia total de benchmarks y de descargas o valoraciones: no existe evidencia externa de mejora frente al modelo base en tareas Angular.
- El dataset de entrenamiento no se describe en esta ficha; se desconoce la version de Angular cubierta, el estilo de codigo y la proporcion de TypeScript frente a plantillas HTML.
- Riesgo de alucinacion de APIs: como cualquier modelo de codigo, puede inventar metodos, directivas o firmas de Angular, especialmente en versiones recientes del framework.
- Riesgo de sesgo hacia patrones obsoletos si el corpus de entrenamiento incluye codigo anterior a la migracion a standalone components.
- Idiomas no documentados: se desconoce si el adaptador mantiene el soporte multilingue del modelo base o si lo ha degradado hacia el ingles tecnico.
- El adaptador no es utilizable por si solo; cualquier despliegue implica asumir el coste de VRAM del modelo base de 30B.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial queda condicionado por los terminos del modelo base Qwen, que deben verificarse por separado.
- El autor remite a la model card del modelo fusionado para datos y detalles de entrenamiento; conviene revisarla antes de cualquier uso en produccion.
- No se ha publicado informacion sobre sesgos demograficos o de otro tipo; la evaluacion de sesgo del modelo base deberia trasladarse a este adaptador.

## Enlaces

- Adaptador LoRA en Hugging Face: https://huggingface.co/bharathmuppa/angular-coder-30b-a3b-lora
- Modelo fusionado (segun la model card): https://huggingface.co/bharathmuppa/angular-coder-30b-a3b
- Modelo base Qwen3-Coder-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Familia Qwen3.5 en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Guia de despliegue local de Qwen3-Coder: https://llmconfigurator.com/en/guides/coding-agents/run-qwen3-coder-locally
- Analisis de North Mini Code (Cohere), modelo comparable: https://www.marktechpost.com/2026/06/11/meet-north-mini-code-coheres-30b-open-weight-mixture-of-experts-model-with-3b-active-parameters-for-agentic-coding/
- Tabla comparativa de modelos abiertos: https://lmmarketcap.com/open-source-ai-models
- Publicacion divulgativa sobre Qwen3-Coder-30B-A3B-Instruct: https://x.com/HuggingModels/status/2084707948136468763
