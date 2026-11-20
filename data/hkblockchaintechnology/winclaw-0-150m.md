# hkblockchaintechnology/winclaw-0-150m

## Resumen

Winclaw-0-150M es un modelo anunciado por el usuario hkblockchaintechnology en Hugging Face, concebido como el primero de una serie de checkpoints para un agente que opera sobre el escritorio de Windows. Segun la model card, el repositorio define una arquitectura propia de aproximadamente 150 millones de parametros (d_model 768, 12 capas, 12 cabezas de atencion, contexto de 1024 tokens) orientada a controlar interfaces graficas mediante un cabezal de "spatial pointing" sobre una rejilla de anclas de 32x20, en lugar de generar coordenadas como texto. El modelo se presenta como un "agentic harness" con vision propia, serializacion del arbol de accesibilidad de Windows (UiaLite), fusion multimodal por cross-attention intercalada y cabezas auxiliares de world model y verificacion.

El estado declarado del proyecto es, literalmente, "architecture defined. No weights yet": no existen pesos publicados, el repositorio ocupa 0.0 GB y el pipeline no esta definido. La licencia figura como `other` con el identificador `pending-corpus-licence-decision`, es decir, pendiente de decision sobre la licencia del corpus de entrenamiento. Por tanto, esta ficha describe un diseno arquitectonico y un plan de entrenamiento por etapas (pretrain, SFT, DPO, GRPO, exportacion GGUF), no un modelo evaluable.

La relevancia potencial del proyecto, si llega a materializarse, reside en su enfoque: un modelo pequeno (150M) especializado en interaccion con GUI de Windows, con un cabezal de accion espacial discreto y verificadores entrenados conjuntamente, lo que lo situaria en la linea de agentes de escritorio ligeros ejecutables en hardware modesto. En el momento de redactar esta ficha no hay evidencia publica de resultados, pesos ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio con encoder visual tipo ViT, fusion por cross-attention intercalada y cabezal de accion de spatial pointing |
| Parametros totales | ~150M (declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF (etapa de exportacion prevista); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (`pending-corpus-licence-decision`) |
| Formato de pesos | no disponible (no hay pesos publicados; se menciona exportacion GGUF como etapa futura) |

Detalles adicionales declarados en la model card:

| Componente | Diseno |
|---|---|
| Vision | Encoder ViT propio, parches de 16 px sobre downscale 640x400, 1000 parches, merger de dos niveles propio, ~250 tokens visuales |
| Estado de UI | Arbol UiaLite serializado con BPE propio |
| Historial | k=4 frames como bloques de tokens separados con decaimiento de recencia aprendido |
| Fusion | Cross-attention intercalada con embeddings aprendidos de posicion de frame |
| Accion | Cabezal de spatial pointing: distribucion sobre rejilla de anclas 32x20 mas refinamiento sub-celda |
| Auxiliares | Cabeza de world model (delta de estado) y cabeza verificadora/reward, entrenadas conjuntamente |
| Dimensiones | d_model 768, 12 capas, 12 cabezas |

## Arquitectura y entrenamiento

La arquitectura descrita combina un encoder visual propio de estilo ViT que procesa una imagen reducida a 640x400 con parches de 16 px, generando 1000 parches que un merger de dos niveles comprime hasta aproximadamente 250 tokens visuales. En paralelo, el estado de la interfaz se representa como un arbol de accesibilidad UiaLite serializado con un tokenizador BPE propio, y el historial se incorpora como k=4 frames en bloques de tokens separados con un decaimiento de recencia aprendido. La fusion entre modalidades se realiza mediante cross-attention intercalada con embeddings de posicion de frame aprendidos.

La innovacion mas destacable es el cabezal de accion: en lugar de emitir coordenadas como texto, el modelo produce una distribucion sobre una rejilla de anclas de 32x20 con refinamiento sub-celda, lo que acota el espacio de acciones y podria facilitar el aprendizaje por refuerzo con recompensas verificables. Ademas, se entrenan conjuntamente una cabeza de world model (prediccion del delta de estado) y una cabeza verificadora/reward. El plan de entrenamiento se organiza en cinco etapas: pretrain desde inicializacion aleatoria con corpus y tokenizador propios, SFT sobre trayectorias generadas por el harness, DPO con pares best-of-n del simulador, GRPO con recompensas verificables de los task checkers y exportacion cuantizada a GGUF. No se especifican el numero de tokens de entrenamiento, la composicion del corpus ni si se han ejecutado ya alguna de estas etapas; la model card remite al repositorio `winclaw-corpus` y a `winclaw/corpus.py` para la composicion y licencias.

## Capacidades

- Control de interfaz grafica de Windows mediante prediccion de acciones sobre una rejilla espacial de 32x20 con refinamiento sub-celda.
- Percepcion visual de capturas de pantalla reducidas a 640x400 con encoder ViT propio (~250 tokens visuales).
- Interpretacion del arbol de accesibilidad UiaLite serializado, lo que aporta estructura semantica de los controles de la UI.
- Razonamiento multi-paso sobre historial de k=4 frames con decaimiento de recencia aprendido.
- Prediccion de deltas de estado mediante la cabeza de world model auxiliar.
- Verificacion y puntuacion de trayectorias mediante la cabeza verificadora/reward, orientada al entrenamiento con GRPO.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision adicional, audio: no disponible (solo vision de capturas de UI segun el diseno).

Todas estas capacidades son las declaradas en el diseno arquitectonico; al no existir pesos publicados, no hay evidencia empirica de su funcionamiento.

## Casos de uso

- Automatizacion de tareas repetitivas en Windows: el modelo podria recibir capturas de pantalla y el arbol UiaLite para predecir clics y acciones sobre formularios, adecuado por su cabezal de pointing que evita generar coordenadas textuales propensas a error.
- Agente de soporte remoto guiado: con contexto de 1024 tokens y k=4 frames de historial, podria seguir una secuencia corta de pasos para reproducir un problema en una aplicacion de escritorio.
- Testing de regresion de interfaces: integrado en un harness, podria ejecutar trayectorias sobre una aplicacion y usar la cabeza verificadora para validar que el estado final coincide con el esperado.
- Entrenamiento por refuerzo con recompensas verificables: la cabeza de reward y los task checkers permitirian generar datos de preferencia y recompensas para mejorar politicas de interaccion, un caso de uso interno del propio pipeline.
- Asistente de accesibilidad: al operar sobre el arbol UiaLite, podria mapear controles a acciones concretas para usuarios con dificultades motoras, aunque requeriria validacion exhaustiva.
- Prototipado de agentes de escritorio en hardware modesto: con ~150M parametros y exportacion GGUF prevista, seria candidato a ejecucion local en equipos sin GPU dedicada, una vez existan pesos.
- Investigacion en representaciones de accion espacial: el cabezal de anclas 32x20 con refinamiento sub-celda constituye un banco de pruebas para comparar acciones discretas frente a generacion de coordenadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el estado es "architecture defined. No weights yet" y que el repositorio no contiene afirmaciones de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision al no existir pesos; por tamano (~150M parametros), en FP16 requeriria del orden de 0.3 GB solo para pesos, y en cuantizaciones de 4 bits del orden de 0.1 GB, sin contar el encoder visual ni el overhead de runtime.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna seria en principio suficiente, pero no hay datos de rendimiento ni de requisitos del harness.
- Cabe en GPU consumer: previsiblemente si, dado el tamano declarado, aunque no hay confirmacion empirica.
- Opciones de despliegue: se menciona exportacion GGUF como etapa del proyecto, lo que apunta a llama.cpp u Ollama; vLLM y TGI no se mencionan y su compatibilidad con la arquitectura propia (cabezal de pointing, cross-attention intercalada) es dudosa sin adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion fundamentada. Como referencia de categoria, existirian agentes de GUI basados en modelos mayores (por ejemplo, familias de modelos vision-lenguaje de 2B a 7B usadas para control de interfaz), pero no se dispone de datos verificables en esta ficha para tabularlos.

## Limitaciones y advertencias

- No existen pesos publicados: el repositorio esta vacio (0.0 GB) y la model card lo declara explicitamente. Cualquier uso en produccion es imposible en la actualidad.
- Licencia pendiente (`pending-corpus-licence-decision`): no hay autorizacion clara para uso comercial ni para redistribucion; el identificador `other` impide asumir permisos.
- Contexto limitado a 1024 tokens, lo que restringe el historial a k=4 frames y tareas de horizonte corto.
- El diseno depende del arbol UiaLite de Windows, lo que ata el modelo a ese sistema operativo y a la disponibilidad de accesibilidad en las aplicaciones objetivo.
- Riesgo de alucinacion y de acciones erroneas sobre la UI: un cabezal de pointing puede seleccionar anclas plausibles pero incorrectas; la cabeza verificadora mitiga pero no elimina este riesgo.
- Sesgos conocidos: no disponible; al no haber corpus publicado ni evaluaciones, no pueden caracterizarse.
- Idiomas soportados: no disponible; el tokenizador BPE propio y el foco en UI de Windows sugieren un sesgo hacia texto de interfaz en ingles, pero no esta confirmado.
- Sin benchmarks ni evaluaciones independientes: no hay evidencia de que la arquitectura funcione segun lo disenado.
- El proyecto se presenta como serie de checkpoints con manifiestos (`manifest.json`, `latest.json`); la ausencia de estos en el repositorio publico impide verificar el estado real del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/hkblockchaintechnology/winclaw-0-150m
- Repositorio de corpus mencionado: `winclaw-corpus` (referenciado en la model card; URL no disponible)
- Protocolo de sesion y reanudacion: `RESUME.md` en `winclaw-harness` (referenciado; URL no disponible)
- Codigo de composicion del corpus: `winclaw/corpus.py` (referenciado; URL no disponible)
- Papers, blogs, demos: no disponibles
