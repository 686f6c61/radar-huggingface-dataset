# ehzawad/inkling-small-terminal-agent

## Resumen

Inkling-Small terminal agent (identificador `ehzawad/inkling-small-terminal-agent`) es un adaptador LoRA de rango 32 desarrollado por Emrul Hasan Zawad que convierte el modelo base `thinkingmachines/Inkling-Small` en un agente de terminal capaz de traducir una intencion expresada en lenguaje natural a comandos de shell precisos y conscientes del estado del sistema. El flujo objetivo es: el usuario declara una intencion, el agente lee una instantanea acotada del contexto del sistema (sistema operativo, usuario, directorio de trabajo, shell de login, versiones de bash y zsh, PATH y variables de entorno seleccionadas), inspecciona el estado especifico de la tarea, ejecuta el cambio correcto mas pequeno posible en bash o zsh, lo verifica como lo haria el usuario e informa de lo que ha cambiado. El adaptador se entrena sobre Tinker con un presupuesto de computo inferior a 100 dolares.

El modelo base, Inkling-Small, es un modelo multimodal de pesos abiertos de 276.000 millones de parametros totales con 12.000 millones activos, lo que implica una arquitectura de mezcla de expertos (MoE). El adaptador anade capacidades de agente de terminal mediante destilacion de un profesor de mayor tamano (`thinkingmachines/Inkling`) seguida de aprendizaje por refuerzo con recompensas calculadas fuera del alcance del agente.

Su relevancia actual radica en que aborda un problema practico y mal resuelto: la generacion de comandos de shell que respetan el estado real del sistema (precedencia de configuracion, resolucion de ejecutables en PATH, identidad de procesos, trampas de ZDOTDIR y dotfiles enlazados simbolicamente) minimizando el riesgo de efectos destructivos. El adaptador penaliza explicitamente las acciones destructivas mediante una recompensa de -1 en el grader, y reduce el numero de llamadas a herramienta y de tokens generados respecto al modelo base (de 6,7 a 4,8 llamadas y de 896 a 295 tokens en las familias vistas en bash).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 32 sobre un transformer MoE multimodal (modelo base) |
| Parametros totales | Base: 276B; adaptador: no disponible |
| Parametros activos | Base: 12B (MoE) |
| Longitud de contexto | No disponible (el harness de evaluacion empleado usa 32K) |
| Tipos de cuantizacion | No disponible (el modelo base se sirve en bf16, ~532 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (export PEFT crudo generado por Tinker) |
| Libreria | peft |
| Modelo base | thinkingmachines/Inkling-Small |
| Profesor (destilacion) | thinkingmachines/Inkling |
| Dataset de entrenamiento | open-thoughts/OpenThoughts-Agent-RL-5K |
| Tamano del repositorio | 8,5 GB |
| Pipeline | reinforcement-learning |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 sobre `thinkingmachines/Inkling-Small`, un modelo base de 276B parametros totales con 12B activos y naturaleza multimodal. El entrenamiento se realizo en dos fases sobre la plataforma Tinker, con un presupuesto total inferior a 100 dolares. La primera fase consistio en destilacion del profesor (SFT) a nivel de token, con la perdida calculada unicamente sobre las acciones del propio profesor: 175 episodios de un curriculo de intenciones mas 139 episodios de codificacion de terminal extraidos de OpenThoughts-Agent-RL-5K. Se eliminaron las trayectorias en las que el profesor intentaba buscar respuestas en linea.

La segunda fase aplico aprendizaje por refuerzo con ventajas de grupo al estilo GRPO, con 4 clones de la misma tarea semilla por grupo, 12 pasos y 32 rollouts por paso, todo ello en sandboxes Docker locales sin red. Las recompensas las calcula un grader en el host, fuera del alcance del agente, en cada ruta de terminacion: +1 por exito verificado (con penalizacion de hasta 0,05 por exceso de tokens o llamadas a herramienta), 0 por tarea incompleta, -1 por cualquier efecto colateral destructivo (matar el proceso equivocado, modificar un fichero no relacionado, ampliar permisos o perder la configuracion de usuario) y -0,1 por agotamiento del contexto o del presupuesto de tokens.

El curriculo de intenciones consta de 15 familias de tareas semilla con variantes contrafactuales (misma intencion, distinto estado del sistema, distinto comando correcto), cada una validada con autotests: el estado intacto falla, la solucion de referencia pasa y las soluciones erroneas o destructivas conocidas se detectan. Entre los ejemplos figuran conseguir que gane la herramienta aprobada por el equipo en PATH (shadowing de alias frente a orden de PATH), detener solo el servidor de staging (por puerto o por configuracion), cambiar un ajuste en la configuracion efectiva (variable de entorno, XDG o fichero de usuario), hacer ejecutable un script sin ampliar permisos, reiniciar el servicio correcto con su linea de comandos exacta, seleccionar la version de herramienta fijada por el proyecto, corregir errores de indexacion de arrays y de word-splitting entre bash y zsh, y trampas de ZDOTDIR y dotfiles enlazados. Cuatro familias quedaron completamente excluidas del entrenamiento: archivado preciso, atajos y funciones, precision con git y "encontrar que esta escribiendo este fichero".

## Capacidades

- Generacion de comandos de shell en bash y zsh a partir de intenciones en lenguaje natural, con conciencia del estado del sistema.
- Lectura e interpretacion de una instantanea acotada de contexto (`<context_snapshot>`) que incluye sistema operativo, usuario, directorio de trabajo, shell de login, versiones de bash y zsh, PATH y variables de entorno seleccionadas.
- Uso de una unica herramienta de shell con firma `shell(command, interpreter, interactive, cwd)`, donde cada llamada abre un shell nuevo e `interactive=true` carga los ficheros de arranque del usuario.
- Inspeccion dirigida del estado especifico de la tarea: precedencia de configuracion, resolucion de ejecutables, identidad de procesos, antiguedad de ficheros y estado del repositorio.
- Ejecucion del cambio correcto mas pequeno posible, seguido de verificacion del resultado y de un informe de lo modificado.
- Razonamiento multi-paso con encadenamiento de varias llamadas a herramienta por episodio (media de 4,8 a 6,2 llamadas segun la familia de tareas).
- Evitacion de acciones destructivas: cero episodios destructivos en todas las familias vistas y en las familias retenidas en bash y zsh, salvo un caso en la fase SFT con bash.
- Capacidades heredadas del modelo base, que es multimodal y de pesos abiertos, aunque el adaptador solo se entrena y evalua para tareas de terminal en ingles.
- No se documenta soporte explicito de vision, audio, thinking mode ni function calling generico mas alla de la herramienta de shell definida en el harness.

## Casos de uso

- Automatizacion de operaciones en servidores Linux: el agente recibe la intencion "deten el servidor de staging" y determina si debe hacerlo por puerto o por fichero de configuracion segun el estado real de la maquina, evitando matar procesos no relacionados.
- Diagnostico y reparacion de entornos de desarrollo: correccion de bugs de indexacion de arrays y de word-splitting que difieren entre bash y zsh, un problema recurrente en scripts portables entre ambos shells.
- Gestion de precedencia de configuracion y PATH: resolucion de conflictos entre alias, orden de PATH, variables de entorno, XDG y ficheros de usuario para garantizar que se ejecuta la version correcta de una herramienta.
- Aprovisionamiento de permisos sin ampliacion innecesaria: hacer ejecutable un script o ajustar permisos sin recurrir a `chmod` amplios, reduciendo la superficie de riesgo.
- Reinicio preciso de servicios: identificar el servicio correcto y reiniciarlo con su linea de comandos exacta, con verificacion posterior del resultado mediante inspeccion del estado.
- Correccion de configuracion efectiva: localizar en que capa reside realmente un ajuste (variable de entorno, XDG o fichero de usuario) y modificarlo alli donde surte efecto.
- Soporte a tareas de control de versiones: la familia "git precision" esta retenida fuera del entrenamiento, por lo que puede usarse como prueba de generalizacion, aunque su rendimiento en produccion no esta validado especificamente.
- Agente de terminal integrado en herramientas tipo CLI: dado que el flujo objetivo es intencion -> comando -> verificacion -> informe, encaja como capa de ejecucion en asistentes de linea de comandos en ingles.

## Benchmarks y rendimiento

Curriculo de intenciones, familias vistas, semillas nuevas (88 tareas). Temperatura 0,6, mismo harness para todos los modelos, un intento por tarea. "Destructivos" cuenta episodios puntuados con -1.

| Modelo / shell | Pass | Destructivos | Llamadas a herramienta | Tokens generados |
|---|---|---|---|---|
| Inkling-Small (base), bash | 43/44 (97,7 %) | 0 | 6,7 | 896 |
| Inkling-Small (base), zsh | 41/44 (93,2 %) | 0 | 6,4 | 679 |
| + SFT (destilacion), bash | 44/44 (100,0 %) | 0 | 4,8 | 294 |
| + SFT (destilacion), zsh | 43/44 (97,7 %) | 0 | 4,9 | 299 |
| + SFT + RL (este adaptador), bash | 43/44 (97,7 %) | 0 | 4,8 | 295 |
| + SFT + RL (este adaptador), zsh | 44/44 (100,0 %) | 0 | 5,5 | 334 |

Curriculo de intenciones, familias retenidas (48 tareas x 3 intentos = 144 episodios por modelo).

| Modelo / shell | Pass | Destructivos | Llamadas a herramienta | Tokens generados |
|---|---|---|---|---|
| Inkling-Small (base), bash | 71/72 (98,6 %) | 0 | 8,6 | 1.173 |
| Inkling-Small (base), zsh | 72/72 (100,0 %) | 0 | 8,7 | 1.192 |
| + SFT (destilacion), bash | 71/72 (98,6 %) | 1 | 5,9 | 428 |
| + SFT (destilacion), zsh | 72/72 (100,0 %) | 0 | 6,1 | 457 |
| + SFT + RL (este adaptador), bash | 72/72 (100,0 %) | 0 | 6,2 | 464 |
| + SFT + RL (este adaptador), zsh | 72/72 (100,0 %) | 0 | 6,0 | 458 |

Otras comprobaciones con datos retenidos.

| Benchmark | Base | Entrenado |
|---|---|---|
| Tareas de codigo de RL-5K nunca usadas en entrenamiento (60) | 28/60, 3.618 tokens por resolucion | 29/60, 1.739 tokens por resolucion (fase SFT) |
| Terminal-Bench 2 (retenido, harness simple) | No completado: detenido tras 20 de 89 tareas (6 superadas) | No completado: 20 de 89 tareas (5 superadas); muestra insuficiente para comparar |

Terminal-Bench 2 emplea un harness deliberadamente simple (una sola herramienta bash, contexto de 32K, sin compactacion) sobre Docker local en arm64, y no es comparable con la mejor puntuacion del harness que aparece en la model card del modelo base.

## Requisitos de hardware

- El modelo base en bf16 ocupa aproximadamente 532 GB, por lo que la inferencia requiere agregacion de memoria entre varias GPU.
- GPU recomendadas: para servir el modelo base completo, conjuntos multi-GPU de clase H100 o A100. Un unico A100 de 80 GB o una RTX 4090 no son suficientes para el modelo base en bf16.
- No cabe en GPU de consumo. La unica via practica en hardware reducido seria una cuantizacion agresiva del modelo base, no documentada en la informacion disponible.
- El repositorio del adaptador ocupa 8,5 GB y debe aplicarse sobre `thinkingmachines/Inkling-Small`.
- Opciones de despliegue: motores que soporten LoRA de Inkling, como vLLM o SGLang. El repositorio contiene el export PEFT crudo de Tinker y la carga fuera de Tinker no ha sido verificada de forma independiente.
- Se recomienda ejecutar el adaptador dentro del harness con el que fue entrenado, incluido en la carpeta `harness/` (`system_prompt.txt`, `tool_schema.json`, `example_snapshot.json`).
- Latencia y throughput: no se publican medidas de latencia ni de tokens por segundo. Como referencia de eficiencia, el entrenamiento reduce los tokens generados por episodio de 896 a 295 en familias vistas con bash y de 1.173 a 464 en familias retenidas con bash.
- En las tareas de codigo de RL-5K retenidas, el modelo entrenado resuelve con 1.739 tokens por resolucion frente a los 3.618 del base, aproximadamente la mitad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (ehzawad/inkling-small-terminal-agent) | LoRA rango 32 sobre base de 276B (12B activos) | No disponible (harness de 32K) | Apache-2.0 | HuggingFace, 8,5 GB | Especializado en agente de terminal bash/zsh en ingles; requiere el modelo base |
| thinkingmachines/Inkling-Small (base) | 276B totales, 12B activos | No disponible | No disponible | HuggingFace | Modelo multimodal de pesos abiertos; sin especializacion en terminal; mas tokens y llamadas por episodio |
| thinkingmachines/Inkling (profesor) | No disponible | No disponible | No disponible | HuggingFace | Profesor de mayor tamano usado para destilacion; no es un adaptador desplegable por si mismo en este flujo |
| Otros agentes de terminal de proposito general | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en contenedores Linux (Debian, arm64), con usuario sin privilegios y red deshabilitada. No ha sido validado en macOS ni en otros entornos BSD.
- El modelo solo trabaja en ingles; no se documenta soporte multilingue.
- Persiste riesgo de acciones destructivas en entornos distintos de los de entrenamiento: el propio diseno de la recompensa (-1 por efecto colateral) reconoce que este es el fallo critico del caso de uso.
- La carga del adaptador fuera de Tinker no ha sido verificada de forma independiente, lo que anade incertidumbre al despliegue en produccion.
- El contexto efectivo del harness de evaluacion es de 32K sin compactacion; no se documenta la longitud de contexto nativa del modelo base.
- Las muestras de evaluacion son pequenas (88 tareas en familias vistas, 144 episodios por modelo en familias retenidas, 60 tareas de codigo y 20 de 89 tareas en Terminal-Bench 2), por lo que las diferencias porcentuales deben interpretarse con cautela.
- Terminal-Bench 2 no se completo con ninguno de los modelos evaluados, y el autor advierte que las puntuaciones no son comparables con las del harness optimo del modelo base.
- Aunque la licencia del adaptador es Apache-2.0, el modelo base es de pesos abiertos con condiciones propias no detalladas en la informacion disponible; conviene verificar la licencia del base antes de un uso comercial.
- Los resultados con temperatura 0,6 y un unico harness pueden no trasladarse a otros prompts de sistema o esquemas de herramienta distintos de los incluidos en `harness/`.
- La introduccion de una instantanea de contexto implica exponer informacion del sistema (usuario, PATH, variables de entorno); el formato documentado excluye secretos y volcados completos de entorno, pero deben revisarse las politicas de exposicion en produccion.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ehzawad/inkling-small-terminal-agent
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Modelo profesor: https://huggingface.co/thinkingmachines/Inkling
- Pagina de Inkling en Thinking Machines Lab: https://thinkingmachines.ai/inkling/
- Model card de Inkling-Small: https://thinkingmachines.ai/model-card/inkling-small/
- Tinker (plataforma de entrenamiento): https://thinkingmachines.ai/tinker
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-RL-5K
- Perfil del autor: https://huggingface.co/ehzawad
- Ficha de Inkling Small en Pi (HuggingFace): https://pi.dev/models/huggingface/thinkingmachines-inkling-small
- Ficha de Inkling Small en Pi (Vercel AI Gateway): https://pi.dev/models/vercel-ai-gateway/thinkingmachines-inkling-small
