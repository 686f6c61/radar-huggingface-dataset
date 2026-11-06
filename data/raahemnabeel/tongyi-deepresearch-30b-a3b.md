# raahemnabeel/tongyi-deepresearch-30b-a3b

## Resumen

Tongyi DeepResearch 30B A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Tongyi Lab (Alibaba), disenado especificamente para busqueda de informacion profunda y agentes de investigacion de horizonte largo. Con 30.000 millones de parametros totales y 3.000 millones activos por token, emplea la arquitectura Qwen3-30B-A3B (128 expertos, top-8, 48 capas) y ha sido entrenado mediante preentrenamiento continuo agentico, ajuste fino y aprendizaje por refuerzo para tareas de busqueda multi-paso, navegacion web y uso de herramientas. El checkpoint publicado en este repositorio es un empaquetado para su despliegue en hardware Tenstorrent (p150, p150x2, p150x4, p300, p300x2) mediante tt-model-manager y un plugin de vLLM.

El modelo resuelve el problema de los agentes de investigacion que necesitan razonar, planificar y ejecutar bucles de herramientas (estilo ReAct) sobre contextos largos. Su ventana de contexto alcanza los 131.072 tokens en la mayoria de perfiles de servicio (98.304 en el perfil de una sola placa p150), lo que permite mantener historiales extensos de busquedas y visitas web dentro de una misma sesion. Es relevante ahora porque combina un tamano MoE eficiente en inferencia con capacidades agenticas y de razonamiento explicito, y porque este repositorio anade una via de despliegue en aceleradores Tenstorrent, una alternativa no-GPU al stack habitual de NVIDIA.

El autor del repositorio (raahemnabeel) no es el desarrollador del modelo: se limita a empaquetar el checkpoint original de Alibaba-NLP y a publicar los perfiles de servicio y las recetas de despliegue. La licencia es Apache 2.0 y el modelo es exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3-30B-A3B: 128 expertos, top-8, 48 capas) |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | 131.072 tokens (98.304 en perfil p150 de una sola placa) |
| Tipos de cuantizacion | no disponible (los pesos de expertos se convierten a menor precision al cargar en el servidor; el tipo concreto no se especifica) |
| Idiomas soportados | no disponible (el modelo es de texto; la model card no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2,0 GB; pesos descargados desde `Alibaba-NLP/Tongyi-DeepResearch-30B-A3B` en el commit `4b0ac5767427a55d08a254f0367e2934976598e0`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-30B-A3B: un transformer con mezcla de expertos de 128 expertos y enrutamiento top-8 en 48 capas, con 30B parametros totales y 3B activos por token. Esta configuracion reduce el coste computacional por token frente a un modelo denso del mismo tamano, manteniendo una capacidad de representacion elevada. El entrenamiento, segun la model card y el informe tecnico referenciado (arXiv:2510.24701), combina preentrenamiento continuo agentico, ajuste fino y aprendizaje por refuerzo orientados a busqueda multi-paso, navegacion y uso de herramientas. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset.

La innovacion principal es su orientacion agentica: el modelo "piensa antes de responder" y produce contenido de razonamiento separado del contenido final, lo que facilita la integracion en bucles ReAct. El empaquetado para Tenstorrent anade perfiles de servicio con mallas de 1, 2 o 4 dies, hasta 32 secuencias concurrentes y decodificacion con muestreo en dispositivo (top_k limitado a 32). El servidor expone una API compatible con OpenAI y aplica por defecto temperatura 0,6 y top_p 0,95, los valores del agente original de Tongyi.

## Capacidades

- Generacion de texto y razonamiento explicito: el modelo emite contenido de pensamiento (`reasoning_content`) antes de cada respuesta.
- Busqueda de informacion profunda y multi-paso: disenado para bucles de busqueda, visita de paginas y sintesis de hallazgos.
- Uso de herramientas (tool calling): soporta el formato OpenAI `tools`, con parseo Hermes y respuesta en `tool_calls` con `finish_reason: tool_calls`.
- Agentes ReAct: compatible con el agente DeepResearch de Tongyi, que inyecta herramientas (`search`, `visit`, `google_scholar`, `PythonInterpreter`) en el system prompt y lee `<tool_call>` y `<answer>` del contenido.
- Razonamiento multi-paso y planificacion: apto para tareas que requieren descomposicion y ejecucion secuencial de subtareas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no soportadas; el modelo es exclusivamente de texto.
- Contexto largo: hasta 131.072 tokens para mantener historiales extensos de investigacion.

## Casos de uso

- Agentes de investigacion web automatizada: el modelo puede ejecutar bucles ReAct de busqueda, visita y sintesis sobre decenas de fuentes dentro de una ventana de 131.072 tokens, lo que permite mantener el historial completo de la investigacion sin truncar.
- Asistentes de analisis competitivo: integrado con herramientas de busqueda y scraping, puede recopilar informacion de multiples fuentes, contrastarla y generar informes estructurados con trazabilidad de las consultas realizadas.
- Automatizacion de revision bibliografica: usando `google_scholar` como herramienta, el modelo puede localizar papers, extraer conclusiones y comparar metodologias en un unico flujo multi-paso.
- Agentes de soporte a la investigacion cientifica: con el `PythonInterpreter` como herramienta, puede ejecutar calculos, procesar datos y validar hipotesis dentro del mismo bucle de razonamiento.
- Generacion de informes de inteligencia de mercado: el contexto largo permite agregar resultados de busquedas y visitas sucesivas y redactar documentos finales coherentes con las fuentes consultadas.
- Integracion en pipelines de agentes via API OpenAI-compatible: el servidor expone `/v1/chat/completions`, lo que facilita conectarlo a frameworks de orquestacion de agentes existentes sin adaptadores propietarios.
- Despliegue en infraestructura Tenstorrent: adecuado para entornos que ya operan aceleradores p150 o p300 y quieren servir un modelo agentico sin depender de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este empaquetado. La model card indica que las puntuaciones de Tongyi Lab (Humanity's Last Exam, BrowseComp, BrowseComp-ZH, GAIA, xbench-DeepSearch, WebWalkerQA, FRAMES) estan en la model card original y en el informe tecnico, y que las mediciones de este paquete se anadiran mas adelante.

Respecto al rendimiento de inferencia, la model card reporta para el perfil p300x2 (cuatro dies) con un solo usuario y texto real (12 prompts de chat x 384 tokens de salida, temperatura 0): 99 tok/s. La tabla detallada de TTFT, TPOT y throughput por numero de usuarios aparece truncada en la informacion proporcionada, por lo que no se pueden reproducir el resto de cifras.

## Requisitos de hardware

- Hardware objetivo: aceleradores Tenstorrent p150, p150x2, p150x4, p300 o p300x2. No se contempla despliegue en GPU en este repositorio.
- Perfil p300x2: dos placas p300 (4 dies), 32 secuencias, contexto de 131.072 tokens, 32 expertos por die.
- Perfil p150x4: cuatro placas p150 (4 dies), misma configuracion que p300x2.
- Perfil p300 (por defecto): una placa p300 (2 dies), 64 expertos por die, 32 secuencias, contexto de 131.072 tokens.
- Perfil p150x2: dos placas p150 (2 dies), misma configuracion que p300.
- Perfil p150: una placa p150 (1 die, los 128 expertos), 32 secuencias compartiendo un contexto de 98.304 tokens; la KV en bf16 ocupa 96 KiB por token en un solo die.
- VRAM estimada: no aplica (hardware Tenstorrent); no disponible para GPU.
- Despliegue: `tt serve raahemnabeel/tongyi-deepresearch-30b-a3b` o `tt-model serve`; requiere Docker y la CLI de Tenstorrent (`uv tool install tenstorrent`). El servidor escucha en el puerto 20000 (o el siguiente libre) y expone una API compatible con OpenAI.
- Arranque: la primera ejecucion compila kernels para el dispositivo, lo que tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Throughput medido: 99 tok/s con un usuario en p300x2 sobre texto real; el resto de cifras por numero de usuarios no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tongyi DeepResearch 30B A3B (este empaquetado) | 30B | 3B | 131.072 (98.304 en p150) | Apache 2.0 | Tenstorrent p150/p300 |
| Alibaba-NLP/Tongyi-DeepResearch-30B-A3B (original) | 30B | 3B | no disponible en la informacion | Apache 2.0 | Hugging Face, GPU |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo piensa antes de responder: si el presupuesto de `max_tokens` se agota durante el razonamiento, el campo `content` queda vacio. Es necesario asignar presupuestos de miles de tokens.
- El repositorio sirve unicamente el modelo; las herramientas de busqueda, navegacion y ejecucion de codigo deben aportarlas el usuario.
- El modelo es exclusivamente de texto; no admite vision ni audio.
- La model card no detalla los idiomas soportados ni los sesgos conocidos; no hay informacion disponible al respecto.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada, pero inherente a los modelos de lenguaje en tareas de sintesis de fuentes.
- Los pesos de los expertos se convierten a menor precision al cargar en el servidor, lo que puede afectar a la fidelidad numerica respecto al checkpoint original en bf16.
- El muestreo en dispositivo limita `top_k` a 32; `presence_penalty` se aplica en dispositivo y tiene coste de rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el empaquetado depende de componentes de Tenstorrent (tt-model-manager, plugin de vLLM) cuyas condiciones deben revisarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de validacion independiente del empaquetado.
- El rendimiento medido (99 tok/s con un usuario en p300x2) corresponde a una configuracion concreta y no debe extrapolarse a otros perfiles sin medicion.

## Enlaces

- Repositorio Hugging Face de este empaquetado: https://huggingface.co/raahemnabeel/tongyi-deepresearch-30b-a3b
- Modelo base original: https://huggingface.co/Alibaba-NLP/Tongyi-DeepResearch-30B-A3B
- Repositorio GitHub de DeepResearch (Tongyi Lab): https://github.com/Alibaba-NLP/DeepResearch
- Informe tecnico: https://arxiv.org/abs/2510.24701
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- CLI de Tenstorrent (prerequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
