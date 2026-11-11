# GUIAgentt/qwen35-4b-3mfinal-succed-c2lg-3ep

## Resumen

El modelo `GUIAgentt/qwen35-4b-3mfinal-succed-c2lg-3ep` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario GUIAgentt en Hugging Face. Por los tags de la ficha, esta especializado en tareas de agente de interfaz grafica (gui-agent) y agente web (web-agent), lo que sugiere que ha sido entrenado para interactuar con entornos digitales: interpretar pantallas, ejecutar acciones sobre elementos de interfaz y resolver tareas de navegacion web de forma autonoma.

El nombre del repositorio incluye la referencia "3mfinal-succed-c2lg-3ep", que apunta a un entrenamiento final de tres etapas o episodios con algun tipo de curriculum o condicionamiento (c2lg). No hay documentacion publicada que aclare estas siglas, por lo que deben tratarse como nomenclatura interna del autor y no como especificaciones verificables.

El modelo tiene 5.174.964.736 parametros segun los pesos en safetensors, un tamano que lo situa en la gama de 5B y que difiere ligeramente de los 4B nominales del modelo base, probablemente por el redondeo del nombre comercial. El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo. Es relevante ahora porque los agentes GUI y web son una de las areas de mayor interes practico en IA open source, y los modelos especializados de tamano medio permiten desplegar automatizacion de navegador y escritorio en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; familia qwen3_5) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5, y ha sido sometido a un ajuste fino supervisado orientado a tareas de agente. Los tags `gui-agent` y `web-agent` indican que el entrenamiento se ha centrado en trayectorias de interaccion: observaciones de pantalla o de pagina web como entrada y acciones (clics, escritura, navegacion) como salida. El sufijo "c2lg" del nombre podria corresponder a una estrategia de condicionamiento o a un formato de datos interno, pero no hay informacion publicada que lo confirme.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). Cualquier afirmacion al respecto seria especulativa. El repositorio contiene unicamente los pesos en safetensors y los metadatos de la ficha; no se ha publicado model card detallada, paper ni blog asociado.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Qwen3.5-4B.
- Interaccion como agente de interfaz grafica (GUI): interpretacion de capturas de pantalla y emision de acciones sobre elementos de la interfaz.
- Interaccion como agente web: navegacion, localizacion de elementos y ejecucion de tareas en paginas.
- Razonamiento multi-paso orientado a completar tareas de agente (planificacion de secuencias de acciones).
- Capacidades multilingues: no confirmadas para este fine-tune; dependen del modelo base y no estan documentadas.
- Tool calling / function calling: no documentado en la ficha.
- Capacidades especiales (vision nativa, audio, thinking mode): no documentadas; el tag gui-agent sugiere manejo de observaciones visuales, pero no se especifica el mecanismo.

## Casos de uso

- Automatizacion de navegador web: el modelo puede recibir el estado de una pagina (DOM o captura) y emitir acciones de clic, escritura y navegacion para completar flujos como rellenar formularios o extraer datos, gracias a su especializacion en web-agent.
- Pruebas de interfaz automatizadas: integrado en pipelines de QA, puede generar secuencias de interaccion sobre una aplicacion para validar flujos de usuario sin guiones escritos a mano.
- Asistente de escritorio: un agente que observa la pantalla y ejecuta tareas repetitivas (abrir aplicaciones, mover ficheros, configurar ajustes) mediante acciones sobre la GUI.
- RPA de tamano medio: su tamano de ~5B permite desplegarlo en una sola GPU para automatizar procesos administrativos con interfaz web, donde un modelo mayor resultaria caro.
- Entrenamiento e investigacion en agentes: sirve como punto de partida o baseline para experimentos de imitation learning en entornos GUI, al estar disponible como pesos abiertos (con acceso aprobado).
- Prototipos de copiloto de navegacion: un asistente que guia al usuario paso a paso en tareas web complejas (reservas, tramites) emitiendo acciones sugeridas.
- Evaluacion de robustez de agentes: util para estudiar como un fine-tune de 5B se comporta en entornos web reales frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 10-11 GB solo para pesos (5,17B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 6-7 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3,5-4,5 GB, si se generan pesos GGUF/AWQ a partir de los safetensors (no publicados en el repo).
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda en precision completa; RTX 4080/4070 Ti (16 GB) suficientes en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB con cuantizacion de 4-8 bits, y en 16-24 GB sin cuantizar.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF) y transformers con accelerate. No se han publicado recetas especificas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GUIAgentt/qwen35-4b-3mfinal-succed-c2lg-3ep | 5,17B | no disponible | GUI/web agent | other (gated) | Hugging Face, acceso restringido |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | proposito general | segun Qwen (no verificada aqui) | Hugging Face |
| Fine-tunes GUI de la familia Qwen2.5-VL | 3B-7B | 32K-128K (segun variante) | GUI agent con vision | Apache 2.0 en variantes abiertas | Hugging Face |

La comparativa se limita a lo verificable: el modelo base del que deriva y la categoria de fine-tunes GUI de la familia Qwen. No hay datos de rendimiento publicados para este checkpoint que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni limitaciones declaradas por el autor.
- Acceso restringido (gated): el uso requiere aceptar condiciones en Hugging Face; la licencia "other" puede imponer restricciones adicionales no visibles en la ficha.
- Riesgo de alucinacion y de acciones erroneas: en tareas de agente, un fallo del modelo puede traducirse en clics o envios no deseados; se recomienda supervision y limites de accion en produccion.
- Sesgos: desconocidos; dependen del dataset de ajuste fino y del modelo base, no documentados.
- Idiomas: no confirmados para este fine-tune.
- Contexto: no documentado, lo que impide planificar tareas de agente con historiales largos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura en los metadatos (2026-11-11): conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ); habria que generarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GUIAgentt/qwen35-4b-3mfinal-succed-c2lg-3ep
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
