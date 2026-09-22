# SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep1

## Resumen

Este modelo es un ajuste fino de Qwen/Qwen3-1.7B publicado por el usuario SeanWang0027 bajo el identificador `qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep1`. No es un modelo de proposito general, sino un artefacto de investigacion: un estudiante de 1,7 B de parametros destilado mediante aprendizaje on-policy a partir de un profesor Qwen3-32B en bf16 sobre el entorno BabyAI, un banco de tareas de seguimiento de instrucciones en un mundo de rejilla. El autor etiqueta explicitamente el resultado como "Not evaluated" (no evaluado).

El entrenamiento emplea la receta TCOD (backward-to-forward) con un overlay de destilacion on-policy FutureBridge-OPD sobre la infraestructura trinity-rft, usando el puerto de BabyAI descrito en `docs/TCOD_BABYAI.md` del repositorio online-rose (rama `tcod-babyai`). La conversacion de entrenamiento sigue el formato de `babyai/eval_babyai.py`, con 20 turnos, las 810 tareas oficiales de entrenamiento, lote de 16 episodios / 64 turnos, `lr` 1e-6 y `kl_coef` 1.0. El plan completo contempla tres pasadas sobre los datos (152 pasos de explorer); el checkpoint publicado corresponde al paso 52 de explorer (paso 75 de trainer), es decir, la primera de las tres pasadas.

Su relevancia es acotada y de tipo metodologico: sirve para estudiar como se transfiere capacidad de decision secuencial y seguimiento de instrucciones desde un profesor grande a un estudiante pequeno mediante destilacion on-policy, y como punto de partida reproducible para quien trabaje con TCOD o con agentes en BabyAI. No hay senales de adopcion (0 descargas, 0 likes) ni de validacion independiente, y la model card no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (derivado de Qwen/Qwen3-1.7B); no es MoE |
| Parametros totales | 2.031.739.904 (~2,03 B) segun los pesos en safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (4,1 GB, tamano coherente con bf16). No se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible; las tareas de entrenamiento (BabyAI) estan formuladas en ingles |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors, libreria `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B: un transformer decoder-only denso con atencion causal. No hay innovaciones arquitectonicas propias en este checkpoint, ya que toda la intervencion se realiza en la fase de entrenamiento. El pipeline declarado combina TCOD backward-to-forward (el prefijo gold se va reduciendo, con `checkpoint_steps` = 5) con un overlay FutureBridge-OPD implementado sobre trinity-rft, el framework de RL/distilacion usado por el autor. El estudiante es Qwen3-1.7B y el profesor Qwen3-32B en bf16; durante el entrenamiento el modo de razonamiento ("thinking") esta desactivado en ambos.

Los datos de entrenamiento no son un corpus de texto, sino episodios del entorno BabyAI: las 810 tareas oficiales de entrenamiento, en conversaciones de 20 turnos, con lote de 16 episodios / 64 turnos, tasa de aprendizaje 1e-6 y coeficiente KL 1.0. El plan total son tres pasadas sobre los datos (152 pasos de explorer); el checkpoint exportado corresponde al paso 52 de explorer (paso 75 de trainer). El autor indica que el modelo no ha sido evaluado, por lo que no se dispone de curvas de aprendizaje, metricas de exito en BabyAI ni comparaciones con el estudiante base o el profesor.

## Capacidades

- Generacion de texto conversacional en el formato de `babyai/eval_babyai.py`; el tag `conversational` esta declarado en el repositorio.
- Seguimiento de instrucciones en el entorno BabyAI y ejecucion de politicas multi-turno (hasta 20 turnos en la configuracion de entrenamiento).
- Decision secuencial en un mundo de rejilla: navegacion, recogida y colocacion de objetos segun instrucciones en lenguaje natural, siempre dentro del dominio de tareas BabyAI.
- Modo de razonamiento desactivado: el entrenamiento se realizo con "thinking off", por lo que no debe esperarse produccion de trazas de razonamiento explicito.
- Tool calling / function calling: no documentado.
- Soporte de agentes multi-paso: el modelo encarna una politica de agente dentro de BabyAI, pero no se documenta integracion con frameworks de agentes genericos ni con APIs externas.
- Capacidades multilingues: no documentadas; el material de entrenamiento esta en ingles.
- Vision, audio u otras modalidades: no disponibles.
- Capacidad general de asistente, codigo o matematicas: no documentada y previsiblemente degradada respecto al modelo base tras el ajuste especifico.

## Casos de uso

- Reproduccion de experimentos de destilacion on-policy: el checkpoint permite reanudar o comparar la receta TCOD-B2F frente a variantes propias, ya que se conocen hiperparametros (`lr` 1e-6, `kl_coef` 1.0, 20 turnos, 810 tareas) y el punto exacto de exportacion (paso 52 de explorer).
- Baseline de agente en BabyAI: sirve como referencia para medir tasas de exito de politicas destiladas frente al estudiante sin destilar (Qwen3-1.7B) y frente al profesor Qwen3-32B, siempre que se ejecute la evaluacion que el autor no ha publicado.
- Estudio de transferencia profesor-alumno en modelos pequenos: al ser un intermedio de un plan de tres pasadas, es util para analizar que capacidades aparecen pronto y cuales requieren mas pasos de destilacion.
- Prototipado local en GPU de consumo: con ~2,03 B de parametros en bf16 (4,1 GB de pesos) se puede cargar en tarjetas de 8-12 GB para inspeccionar salidas y depurar el formato conversacional del entorno.
- Generacion de rollouts para investigacion: los episodios generados por la politica pueden usarse como datos de partida para experimentos de RL, filtrado o analisis de errores en tareas de instruccion.
- Pruebas de infraestructura de despliegue: el repositorio declara compatibilidad con `text-generation-inference` y `endpoints_compatible`, por lo que es util para validar pipelines de serving con modelos de ~2 B antes de escalar a modelos mayores.
- Ajuste fino posterior sobre tareas de control o planificacion simbolica: al ser un modelo pequeno y ya orientado a decision secuencial, es un candidato razonable para fine-tuning especifico, asumiendo el riesgo de olvido catastrofico.
- Docencia y divulgacion: ilustra de forma concreta el flujo completo destilacion on-policy -> exportacion a HuggingFace -> evaluacion pendiente, con todos los hiperparametros declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente "Not evaluated", por lo que no existen cifras de MMLU, HumanEval, GSM8K ni tasas de exito en las tareas de BabyAI para este checkpoint.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 4,1 GB solo de pesos (2,03 B de parametros x 2 bytes), mas el cache KV; en la practica, del orden de 6-8 GB para contextos moderados.
- VRAM en cuantizacion de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits, del orden de 1,1-1,5 GB. Estas cuantizaciones no estan publicadas por el autor y requeririan conversion propia.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). Para servir varias peticiones concurrentes, A100 40/80 GB o H100 permiten mayor paralelismo y lotes mas grandes.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores en bf16, y en tarjetas de 6 GB con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF, que no esta publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a lo declarado por sus propios autores en HuggingFace y no han sido verificados para esta ficha; se incluyen como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep1) | 2,03 B | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | Checkpoint intermedio de destilacion on-policy sobre BabyAI, sin evaluar |
| Qwen/Qwen3-1.7B (modelo base) | ~1,7 B (sin embeddings) / ~2,03 B totales | 32.768 tokens declarados por el autor del modelo base, ampliables | Apache 2.0 declarada por el autor del modelo base | HuggingFace, ampliamente distribuido | Modelo generalista con modo thinking; es el punto de partida de este ajuste |
| Qwen/Qwen3-4B | ~4 B | 32.768 tokens declarados | Apache 2.0 declarada | HuggingFace | Alternativa generalista del mismo fabricante si se necesita mas capacidad sin salir de la familia |
| Qwen/Qwen3-0.6B | ~0,6 B | 32.768 tokens declarados | Apache 2.0 declarada | HuggingFace | Alternativa mas ligera para entornos con VRAM muy limitada |

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara explicitamente "Not evaluated". No hay evidencia publicada de rendimiento, ni siquiera en las tareas para las que fue entrenado.
- Especializacion extrema: el ajuste se realizo unicamente sobre tareas BabyAI. Fuera de ese dominio (texto general, codigo, matematicas, conversacion abierta) el comportamiento esperado es malo y con alta probabilidad de alucinacion.
- Olvido catastrofico probable: al ser un ajuste sobre un modelo generalista con un objetivo estrecho, es razonable esperar degradacion de las capacidades del Qwen3-1.7B original, aunque no se han publicado mediciones que lo cuantifiquen.
- Licencia no declarada: la model card no especifica licencia. Aunque el modelo base Qwen3-1.7B declara Apache 2.0, este derivado no hereda automaticamente esa declaracion de forma verificable en el repositorio. No debe asumirse uso comercial permitido sin comprobacion previa con el autor.
- Idiomas: no se declaran idiomas soportados y el entrenamiento se realizo con instrucciones en ingles; el rendimiento en castellano es desconocido.
- Modo de razonamiento desactivado durante el entrenamiento ("thinking off"), por lo que no cabe esperar trazas de razonamiento ni mejoras por test-time compute.
- Estado de entrenamiento incompleto: es la primera de tres pasadas planificadas (paso 52 de 152 de explorer). El modelo publicado no es el resultado final de la receta descrita.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de comportamiento en produccion.
- Reproducibilidad parcial: aunque se detallan hiperparametros y el codigo de referencia (kokolerk/TCOD, overlay FutureBridge-OPD sobre trinity-rft, puerto BabyAI en online-rose), no se aportan scripts de evaluacion ni resultados que permitan verificar la receta.
- Sesgos: no evaluados. Al derivar de Qwen3-1.7B, hereda los sesgos del modelo base y de los datos de preentrenamiento, que no han sido analizados en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo TCOD: repositorio `kokolerk/TCOD` citado por el autor (no se proporciona URL en la informacion disponible).
- Overlay FutureBridge-OPD sobre trinity-rft: citado por el autor (no se proporciona URL en la informacion disponible).
- Puerto de BabyAI: `docs/TCOD_BABYAI.md` del repositorio online-rose, rama `tcod-babyai` (no se proporciona URL en la informacion disponible).
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante. Las busquedas devolvieron exclusivamente paginas de recetas y pizzerias (ICA, Yelp, Pagliacci Pizza), sin relacion con el modelo, su receta de entrenamiento ni sus autores. No hay papers, blogs ni demos adicionales que enlazar.
