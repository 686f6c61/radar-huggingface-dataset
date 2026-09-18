# bcckfdn/minillama-test-v2-GGUF

## Resumen

`bcckfdn/minillama-test-v2-GGUF` es un modelo de generación de texto de muy reducido tamano (52.953.984 parametros segun los pesos en safetensors del modelo base) distribuido en formato GGUF por el usuario bcckfdn. Se presenta como la version cuantizada de `bcckfdn/minillama-test-v2`, un modelo entrenado desde cero con la arquitectura de SmolLM2/Llama, segun la propia model card, con 22 capas y un tamano de hidden de 384. El repositorio incluye cuatro ficheros GGUF listos para ejecutar con llama.cpp, Ollama o LM Studio.

El modelo declara soporte para turco (tr) e ingles (en) y se publica bajo licencia Apache 2.0. Su interes practico es limitado: se trata de un artefacto experimental (el nombre incluye "test") con 0 descargas y 0 likes en el momento de la ficha, y sin resultados de benchmarks publicados. No obstante, por su tamano (menos de 110 MB en BF16 y unos 43 MB en Q4_K_M) es un ejemplo util de pipeline completo de cuantizacion GGUF y de despliegue en hardware minimo.

Conviene senalar una discrepancia relevante: el fichero se llama internamente `smollm2-135m-tr-v1` (sugiriendo 135 millones de parametros), pero el recuento real de parametros del modelo base es de aproximadamente 53 millones, coherente con una configuracion de 22 capas y hidden 384. Ademas, la model card indica que el modelo se entreno "desde cero" (sıfırdan eğitilmiş), por lo que no es un ajuste fino de SmolLM2, sino una reimplementacion de su arquitectura entrenada con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama / SmolLM2 (22 capas, hidden 384) |
| Parametros totales | 52.953.984 (segun pesos safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors en el modelo base) |

Ficheros incluidos en el repositorio:

| Fichero | Tamano |
|---|---|
| `smollm2-135m-tr-v1-BF16.gguf` | 103 MB |
| `smollm2-135m-tr-v1-Q8_0.gguf` | 55 MB |
| `smollm2-135m-tr-v1-Q5_K_M.gguf` | 45 MB |
| `smollm2-135m-tr-v1-Q4_K_M.gguf` | 43 MB |

## Arquitectura y entrenamiento

La model card describe un transformer decoder-only con la arquitectura de SmolLM2 (familia Llama), con 22 capas y un tamano de hidden de 384. Segun el autor, el modelo se entreno desde cero (no es un fine-tuning de un checkpoint preentrenado) sobre 11.459 B tokens, cifra cuyo separador decimal no se explicita en la documentacion. No se detalla la composicion del dataset, la mezcla de idiomas ni si se aplicaron fases de alineacion como RLHF, DPO o SFT; tampoco se mencionan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, GQA, etc.).

El unico proceso documentado en este repositorio es la cuantizacion a GGUF en cuatro variantes (BF16, Q8_0, Q5_K_M y Q4_K_M), orientadas al ecosistema llama.cpp. No se especifica el tokenizador, el vocabulario ni la longitud de contexto del entrenamiento, datos que serian necesarios para reproducir el modelo.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Conversacion multi-turno basica (el repositorio incluye la etiqueta `conversational`), ejecutable con `llama-cli -cnv`.
- Autocompletado y continuacion de texto breve.
- Capacidad de razonamiento, codigo y matematicas: no documentada; por el tamano del modelo (53 M de parametros) hay que asumir un rendimiento muy limitado en estas tareas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking", vision o audio: no disponibles.
- Capacidades multilingues: limitadas a turco e ingles segun los metadatos del repositorio.

## Casos de uso

- Prototipado y aprendizaje: sirve para reproducir de principio a fin un flujo de entrenamiento, conversion a GGUF y cuantizacion en cuatro niveles, con un coste de almacenamiento inferior a 300 MB.
- Pruebas de integracion de llama.cpp: permite validar pipelines de inferencia, scripts de carga de modelos y configuracion de servidores locales sin consumo apreciable de recursos.
- Asistente conversacional embebido: con 43 MB en Q4_K_M y una huella de memoria inferior a 1 GB, puede ejecutarse en una Raspberry Pi o en un movil para tareas de chat muy acotadas en turco.
- Generacion de texto turco de bajo riesgo: continuacion de frases, plantillas de respuesta o variaciones de texto donde un error del modelo no tenga consecuencias graves.
- Generacion de datos sinteticos para aumento de corpus: producir ejemplos adicionales en turco para preentrenar o ajustar modelos mayores, siempre con revision posterior.
- Filtrado y etiquetado previo: uso como clasificador ligero tras un ajuste fino especifico (por ejemplo, deteccion de idioma o de intencion) en lugar de generacion abierta.
- Educacion e investigacion: estudio de los efectos de la cuantizacion en modelos de menos de 100 M de parametros, comparando BF16, Q8_0 y Q4_K_M sobre la misma muestra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas en turco, y los resultados de busqueda web asociados a este modelo no aportan datos tecnicos (unicamente enlaces genericos a redes sociales sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier cuantizacion. BF16 ocupa aproximadamente 106 MB de pesos, Q8_0 unos 56 MB y Q4_K_M unos 44 MB; el resto es overhead de contexto y de la libreria de inferencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre (GTX 1050, RTX 3050, RTX 4090, A100, H100). No requiere GPU de centro de datos.
- Cabe en GPU de consumo: si, en practicamente todas las tarjetas graficas modernas, y tambien en CPU.
- CPU: ejecutable en x86 y ARM; es una de las configuraciones realistas para este modelo por su tamano.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante `Modelfile`) y LM Studio. vLLM y TGI no se mencionan en la documentacion disponible.
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones. Por el tamano del modelo, se espera una latencia por token muy baja incluso en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

Los datos de los modelos de comparacion proceden de su documentacion publica y no de la informacion proporcionada en esta busqueda; se incluyen unicamente como referencia de categoria.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcckfdn/minillama-test-v2-GGUF` | 52,95 M | no disponible | tr, en | Apache 2.0 | GGUF en HuggingFace |
| SmolLM2-135M (HuggingFaceTB) | 135 M | 8.192 tokens (segun su documentacion) | en, mayoritariamente | Apache 2.0 | safetensors, GGUF y otros |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens (segun su documentacion) | multilingue | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens (segun su documentacion) | en | Apache 2.0 | safetensors, GGUF |

La diferencia clave frente a estas alternativas es el idioma: el modelo de bcckfdn declara soporte de turco, mientras que SmolLM2 y TinyLlama se centran en ingles. No se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- Modelo experimental: el propio identificador incluye "test" y el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.
- Sin benchmarks: no hay ninguna metrica publicada que permita estimar su calidad real en generacion, razonamiento o codigo.
- Discrepancia de nomenclatura: el fichero se denomina `smollm2-135m-tr-v1` pero el recuento real de parametros es de unos 53 M, no 135 M. Cualquier estimacion de capacidad basada en el nombre sera erronea.
- Fecha de creacion anomala: el repositorio figura creado el 2026-09-18, posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de usarlo.
- Riesgo alto de alucinacion: con 53 M de parametros y sin fases de alineacion documentadas, la coherencia en respuestas largas y la fidelidad factual seran muy limitadas.
- Contexto desconocido: la model card no especifica la longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas.
- Cobertura limitada de idiomas: solo turco e ingles declarados; se desconoce el rendimiento real en turco y no hay evaluacion en ninguna otra lengua.
- Sin soporte documentado de tool calling, agentes, vision o audio.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser un modelo sin garantias ni evaluacion, su uso en produccion con usuarios finales no es recomendable sin una validacion previa y filtros de seguridad.
- Datos de entrenamiento no documentados: se desconoce la composicion del corpus de 11.459 B tokens, lo que impide evaluar sesgos y riesgos de contaminacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bcckfdn/minillama-test-v2-GGUF
- Modelo base: https://huggingface.co/bcckfdn/minillama-test-v2
- llama.cpp: no enlazado en la model card
- Ollama: no enlazado en la model card
- LM Studio: no enlazado en la model card
- Paper, blog o demo del autor: no disponibles
- Resultados de busqueda web: no aportan enlaces relevantes sobre el modelo (unicamente URLs genericas de redes sociales sin relacion con el artefacto)
