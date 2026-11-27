# dodle/noesis

## Resumen

Noesis es un artefacto publicado por el usuario dodle en Hugging Face bajo el identificador `dodle/noesis`. No se trata de un modelo de lenguaje neuronal convencional, sino de un agente Python con estado propio que selecciona acciones mediante reglas, objetivos y memoria, y que opcionalmente puede apoyarse en una politica neuronal entrenada. El repositorio incluye el codigo del motor (`me.py`), la definicion del formato de fichero propietario DODL y una exportacion a GGUF, ademas de una demo de navegador independiente ("pixel controller") con su propio modelo de direccionamiento.

El modelo resuelve un problema acotado: ofrecer un agente local, determinista y de bajo coste que decide acciones (`rest`, `explore`, `learn`, `observe`) a partir de entradas de usuario, estado interno y episodios recordados. La generacion de lenguaje natural es opcional y se delega a proveedores externos (OpenAI, Gemini, APIs compatibles), de modo que el agente local sigue siendo quien decide la accion. Es relevante ahora como ejemplo de arquitectura "stateful agent" con formato propio y trazabilidad de decisiones, no como alternativa a modelos generativos de gran escala.

El dato de "808 parametros totales" reportado en safetensors es coherente con un modelo diminuto orientado a politica de acciones, no con un transformer de proposito general. El repositorio ocupa 0.0 GB y acumula 394 descargas con 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente con estado basado en reglas, objetivos y memoria; politica neuronal opcional para seleccion de acciones |
| Parametros totales | 808 (segun safetensors reportado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de transformers; la memoria se gestiona por episodios recuperados) |
| Tipos de cuantizacion | F32 en GGUF (`noe-model.F32.gguf`); DODL como formato propio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | DODL (formato propio) y GGUF (F32) |

## Arquitectura y entrenamiento

El motor (`me.py`) implementa un bucle por pasos: lee la entrada y el estado actual, elige una accion, la ejecuta y actualiza el modelo. Las reglas y los objetivos elegibles tienen prioridad sobre la politica neuronal. Un modelo entrenado con `--train-actions` puede emplear su red para escoger entre `rest`, `explore`, `learn` y `observe`; un modelo sin entrenar recurre a las reglas existentes. Los pasos actualizan memoria, reglas y el "outcome self-model", pero no entrenan pesos en linea. La recuperacion de episodios se hace por solapamiento de palabras normalizado (mayusculas y puntuacion) y recencia, no por comprension semantica.

El entrenamiento de la politica de acciones se lanza con `python3 me.py --train-actions --seed 123`, con opciones `--samples`, `--epochs`, `--patience` y `--output`. Se generan ejemplos sinteticos, se elige checkpoint con 100 escenarios de validacion fijos y se reporta exactitud y soporte por accion sobre 100 escenarios held-out. La evaluacion incluye una linea base de clase mayoritaria y `rule_baseline_accuracy`; dado que las etiquetas generadas se definen con la misma politica de umbrales que la linea base de reglas, una puntuacion perfecta de esta ultima es esperable y no debe interpretarse como evidencia de rendimiento real. La funcion `evaluate_action_scenarios` permite comparar `prediction`, `policy` y `rule_baseline` sobre tareas multi-paso a traves del mismo motor, con objetivos medibles sobre el estado final.

No se documenta en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. No hay innovaciones de decodificacion especulativa ni atencion lineal; el interes tecnico esta en el formato DODL, la exportacion GGUF y la trazabilidad del `decisionSource` en cada snapshot de workspace.

## Capacidades

- Seleccion de acciones con estado persistente entre pasos (`step()` devuelve accion, estado y detalles; `export_model()` permite guardar el estado).
- Uso de reglas explicitas y objetivos elegibles con prioridad sobre la politica neuronal.
- Memoria episodica con recuperacion por solapamiento de palabras y recencia.
- Registro de workspace por paso: entrada, objetivo activo, episodios recuperados, predicciones candidatas, resultado esperado, resultado real y `decisionSource`.
- Entrenamiento y evaluacion de una politica de acciones sobre cuatro acciones discretas.
- Conexion a proveedores de lenguaje (OpenAI, Gemini, APIs compatibles y servicios remotos de "biocomputation") para redactar respuestas, sin ceder el control de la accion al proveedor.
- Demo de navegador independiente con su propio modelo de direccionamiento (`pixel_model.mjs`).
- No se documentan capacidades de vision, audio, tool calling generico ni razonamiento multi-paso mas alla del bucle de acciones descrito.

## Casos de uso

- Agente local de decision con estado: integrar `AIEngine` en un servicio que mantenga estado entre interacciones y persista con `export_model()` en DODL para reanudar exactamente donde se dejo.
- Prototipado de politicas de accion: usar `--train-actions` con semilla fija para reproducir experimentos y comparar la politica neuronal contra `rule_baseline` en escenarios propios antes de adoptarla.
- Simulacion de entornos con objetivos medibles: emplear `evaluate_action_scenarios` con `initial_state`, `inputs`, `expected_actions` y `objectives` para medir tasas de exito sobre tareas multi-paso.
- Capa de orquestacion con LLM externo: conectar un proveedor de lenguaje para redactar respuestas al usuario mientras el agente local decide `rest`, `explore`, `learn` u `observe`, manteniendo separacion entre decision y generacion.
- Investigacion sobre trazabilidad de decisiones: explotar el snapshot de workspace y `decisionSource` para auditar por que se eligio cada accion en un flujo dado.
- Demo educativa en navegador: desplegar `index.html`, `me.js` y `pixel_model.mjs` como ejemplo de controlador de pixeles con modelo de direccionamiento separado del agente Python.
- Base para experimentos de formatos propios: usar `model_formats.py` como referencia para validar, leer y escribir DODL y exportar a GGUF F32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe metricas internas de evaluacion de la politica de acciones (exactitud por accion, soporte, `rule_baseline_accuracy`, tasa de exito en `evaluate_action_scenarios`) sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible; con 808 parametros y formato F32 el modelo es trivial en memoria, pero no se publican cifras.
- GPU recomendadas: no disponible; el ejemplo de la model card se ejecuta con Python 3 y biblioteca estandar, sin requisito de GPU.
- Compatibilidad con GPU de consumo: no se documenta; por tamano seria viable en cualquier GPU, pero no hay confirmacion del autor.
- Despliegue: ejecucion directa con `python3 me.py` y carga mediante `load_model_file`; exportacion a GGUF F32 (`noe-model.F32.gguf`). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (agentes con estado y formato propio de este tamano); las alternativas habituales de agentes basados en LLM no son equiparables en parametros ni en enfoque.

## Limitaciones y advertencias

- La recuperacion de episodios se basa en solapamiento de palabras normalizado y recencia, no en comprension semantica; la calidad de la memoria depende de la coincidencia lexica.
- Los valores de incertidumbre son heuristicas simples basadas en conteo de observaciones y solapamiento, no probabilidades calibradas.
- Las etiquetas de entrenamiento se generan con la misma politica de umbrales que la linea base de reglas, por lo que una puntuacion perfecta de `rule_baseline_accuracy` es esperada y no valida el rendimiento real.
- El autor advierte explicitamente que las trazas y heuristicas no son evidencia de experiencia subjetiva; valores como `novelty`, `stress`, `recovery` y `arousal` son senales de software acotadas y no medidas biologicas.
- No se simulan efectos cuanticos ni se establece consciencia; cualquier lectura en ese sentido es incorrecta.
- Las acciones desconocidas recaen en la politica existente; las reglas explicitas no `observe` tienen prioridad sobre la red.
- No se documentan idiomas soportados ni sesgos conocidos; la licencia MIT permite uso comercial, pero no se ofrece garantia ni soporte.
- El repositorio es de 0.0 GB y el pipeline no esta disponible; la madurez y el mantenimiento del proyecto no pueden evaluarse con los datos disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/dodle/noesis
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
