# Donghyun1228/pi05-libero-view-large-idm-causal-prefix-20261015-reordered

## Resumen

Este repositorio de HuggingFace (5,9 GB, 0 descargas y 0 likes en el momento de la consulta) contiene un checkpoint de politica robotica visuomotora del linaje pi05, evaluado sobre el benchmark LIBERO. Lo publica el usuario Donghyun1228 y no es un modelo de lenguaje: es un brazo experimental que compara dos variantes de un modelo auxiliar de dinamica inversa (IDM, inverse dynamics model) anadido al entrenamiento de la politica.

El experimento mide si imponer un prefijo causal en la atencion del brazo IDM, cuyos tokens se reordenan como imagen actual, prompt inverso e imagen futura, aporta alguna ganancia de exito frente a un control reordenado con atencion completa al prefijo. La respuesta, segun la propia model card, es negativa: los tres brazos comparados (accepted, reordered y causal) obtienen 11/24 en la pantalla de politica emparejada y las cuatro tareas dificiles siguen en 0/3.

Su interes actual es doble: documenta un resultado nulo reproducible en un area donde abundan las afirmaciones de mejora sin control estricto, y libera pesos de inferencia en BF16, activos de normalizacion y la configuracion de politica necesaria para inspeccionar el modelo, aunque deja fuera los checkpoints nativos FP32 de optimizador y EMA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura; se trata de una politica VLA del linaje pi05 con un encoder visual de muneca congelado ("frozen source wrist encoder") |
| Parametros totales | No disponible. Los pesos de inferencia componen 74 hojas de parametros (parameter leaves) mas activos de normalizacion; no se indica el numero total de parametros |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos de inferencia en BF16; los checkpoints nativos FP32 de optimizador y EMA no se incluyen en el repositorio |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | No disponible (ni la ficha de HuggingFace ni la model card declaran licencia) |
| Formato de pesos | No disponible (no se especifica safetensors, GGUF ni ningun otro) |
| Tamano del repositorio | 5,9 GB |
| Tarea (pipeline) | robotics; manipulacion robotica en el benchmark LIBERO |
| Linaje / modelo base | pi05; continuacion desde el baseline "raw999" con LR manual (brazo aceptado) |
| Configuracion de politica | pi05_libero_source_free_split_vision_idm |
| Entorno de evaluacion | LIBERO con MuJoCo 3.2.3, initial states 3--5, seed 17, target view large |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo: solo indica que se trata de una politica pi05 para LIBERO y que los pesos de inferencia (no EMA, convertidos a BF16) se componen con un encoder de muneca congelado procedente de la fuente, dando 74 hojas de parametros mas activos de normalizacion. Los checkpoints nativos en FP32, tanto de optimizador como de EMA, permanecen en una maquina B200 y no se publican, por lo que la reproduccion exacta del estado de entrenamiento no es posible con este repositorio.

En cuanto al entrenamiento, se describe como una continuacion de 200 actualizaciones (updates) desde el baseline aceptado raw999 con LR manual, restaurando Adam y EMA y manteniendo el escalado posterior a Adam con vision a 1 y expert a 0,1. Se anaden dos brazos auxiliares de IDM (el IDM de sonda antiguo mas 0,1 de IDM de sonda adicional), con B32 por perdida, sin usar etiquetas de experto, observaciones de la camara original ni nuevos datos de rollout. La innovacion tecnica del experimento es el enmascaramiento de atencion: ambos brazos auxiliares reordenan los tokens como imagen actual, prompt inverso e imagen futura; el control reordenado permite atencion completa al prefijo, mientras que el brazo causal bloquea la atencion hacia delante desde los tokens de imagen actual y prompt hacia los tokens de imagen futura. La propia model card advierte que este bloqueo no elimina todos los gradientes derivados del futuro, y que la inferencia no cambia respecto al baseline. El codigo de entrenamiento es el commit code07e04b82 del repositorio vla_adaptation.

## Capacidades

- Politica visuomotora para manipulacion robotica: genera acciones a partir de observaciones visuales en el benchmark LIBERO, no texto libre.
- Modelo auxiliar de dinamica inversa (IDM): el brazo auxiliar se entrena para inferir acciones a partir de pares de imagenes (actual y futura) y un prompt inverso.
- Atencion con prefijo causal: variante experimental que restringe la atencion hacia delante entre tokens de imagen actual/prompt e imagen futura.
- Inferencia sin cambios respecto al baseline: la diferencia experimental afecta solo al entrenamiento, no al grafo de inferencia publicado.
- Capacidades de tool calling, function calling o uso como agente: no disponibles, no aplicables a este tipo de modelo.
- Capacidades multilingues: no disponibles, no aplicables.
- Capacidades de vision, audio o modo de razonamiento explicito: no documentadas; solo se menciona un encoder visual de muneca congelado.

## Casos de uso

- Reproduccion de la pantalla de politica emparejada: cargar el checkpoint junto con la configuracion pi05_libero_source_free_split_vision_idm y ejecutar las ocho tareas seleccionadas con seed 17, initial states 3--5 y MuJoCo 3.2.3 para verificar los resultados 11/24 y 0/3 descritos.
- Estudio de objetivos auxiliares en VLA: usar el par de brazos (reordered frente a causal) como caso de control al disenar perdidas auxiliares de dinamica inversa, ya que documenta que el enmascaramiento causal no aporto ganancia con este presupuesto de 200 updates.
- Auditoria de flujo de gradientes: analizar como el bloqueo de atencion hacia delante no impide todos los gradientes derivados del futuro, util para quien asuma que un prefijo causal aislado elimina la fuga de informacion.
- Punto de partida para fine-tuning en LIBERO: continuar el entrenamiento desde este checkpoint BF16 en un entorno simulado antes de trasladar la politica a un montaje real, comprobando primero que las tareas dificiles siguen sin resolverse.
- Comparacion de infraestructuras de simulacion: integrar el modelo en un pipeline con MuJoCo 3.2.3 y LIBERO para medir sensibilidad a los initial states 3--5 y a la vista "large".
- Docencia y divulgacion tecnica: ilustrar con un caso real como se disena un brazo de control con reordenacion de tokens y como se comunica un resultado nulo sin inflar metricas.
- Base para experimentos de composicion de pesos: reutilizar la receta de composicion de BF16 con el encoder de muneca congelado y los activos de normalizacion para probar variantes del encoder visual.

## Benchmarks y rendimiento

Los unicos resultados publicados son la pantalla de politica emparejada sobre ocho tareas, con 24 intentos por brazo.

| Brazo | Tratamiento de atencion al prefijo | Exito (pantalla de 8 tareas) | Tareas dificiles |
|---|---|---|---|
| accepted (baseline raw999) | Referencia | 11/24 | 0/3 |
| reordered (control) | Atencion completa al prefijo | 11/24 | 0/3 |
| causal | Bloquea atencion directa de imagen actual y prompt hacia imagen futura | 11/24 | 0/3 |

La model card indica que todos los resultados de exito y fallo son identicos entre los tres brazos y que no se observo ninguna ganancia de exito de politica con este peso y presupuesto. Aviso explicito del autor: esta pantalla de ocho tareas no constituye una estimacion amplia sobre 40 tareas ni una reproduccion de 243/400. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y este tipo de metricas no aplica a una politica robotica.

## Requisitos de hardware

- VRAM estimada: no hay cifras oficiales. El repositorio ocupa 5,9 GB, de modo que cargar los pesos de inferencia en BF16 exige como minimo del orden de 6 GB, sin contar activaciones, buffers de vision ni el encoder de muneca congelado; el consumo real sera superior.
- Checkpoints de entrenamiento: los estados nativos FP32 de optimizador y EMA permanecen en una maquina B200 y no se distribuyen, por lo que no se puede reanudar el entrenamiento desde este repositorio.
- GPU recomendadas: no disponibles. La unica referencia de hardware citada es la B200 empleada para alojar los checkpoints FP32.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano, el checkpoint BF16 podria caber en GPU de consumo con 12--24 GB (por ejemplo, RTX 4090), pero no hay validacion publicada.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El entorno previsto es LIBERO con MuJoCo 3.2.3 y el codigo de vla_adaptation.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativa con otros modelos publicos en la informacion proporcionada; la model card solo compara los tres brazos internos del mismo experimento, resumidos en la tabla anterior.

| Elemento comparado | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-view-large-idm-causal-prefix | No disponible | No disponible | 11/24 en pantalla de 8 tareas; 0/3 en tareas dificiles | No disponible | Pesos BF16 en HuggingFace; FP32 no incluidos |
| Modelos alternativos de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resultado nulo: no se observo ninguna ganancia de exito de politica (11/24 identico en los tres brazos) con este peso y presupuesto de 200 updates.
- Validez estadistica limitada: la pantalla de ocho tareas no es una estimacion sobre 40 tareas ni una reproduccion de 243/400, segun advierte el propio autor.
- Cuatro tareas dificiles permanecen en 0/3, lo que indica fallos sistematicos no resueltos por la variante causal.
- El enmascaramiento causal no bloquea todos los gradientes derivados del futuro, por lo que no debe interpretarse como un aislamiento completo de la informacion futura.
- Reproduccion incompleta: los checkpoints FP32 de optimizador y EMA no se incluyen, de modo que no es posible reanudar el entrenamiento ni verificar exactamente el estado publicado.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en un limbo juridico y no debe asumirse permiso de uso.
- Ambito de aplicacion restringido: es una politica robotica para LIBERO y MuJoCo, no un modelo de lenguaje; no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.
- Sin datos sobre sesgos, alucinacion o comportamiento fuera de distribucion: no disponibles en la informacion publicada.
- Fechas del repositorio (creacion y actualizacion en octubre de 2026) no coinciden con el marco temporal habitual de publicacion; conviene verificar la vigencia del contenido antes de reutilizarlo.
- Cero descargas e interacciones: no existe validacion externa por parte de la comunidad sobre este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-causal-prefix-20261015-reordered
- Codigo de entrenamiento: https://github.com/Donghyun1228/vla_adaptation (commit code07e04b82, referenciado en la model card)
- No se han proporcionado otros enlaces a papers, blogs, demos o repositorios en la informacion disponible.
