# qrvmil/pi05-libero-three-groups-20261104

## Resumen

`pi05-libero-three-groups-20261104` es un repositorio de HuggingFace publicado por el usuario `qrvmil` que, segun su propia model card, se encuentra en estado de preparacion y no contiene todavia ninguna ejecucion de entrenamiento completada. El nombre sugiere una especializacion adicional del modelo pi05 (Pi-Zero, de Physical Intelligence) ya entrenado sobre el benchmark LIBERO de manipulacion robotica, organizada en tres subconjuntos fijos de tareas. No se trata, por tanto, de un modelo listo para uso, sino de un espacio reservado para publicar checkpoints futuros.

La model card es extremadamente escueta: no se especifican parametros, arquitectura, contexto, licencia, idiomas ni formato de pesos. El autor remite a dos documentos (`PROTOCOL_RU.txt` y `docs/superpowers/plans/2026-11-04-libero-sft.md`) que no forman parte de la informacion disponible en este repositorio. La fecha de creacion y actualizacion es el 4 de noviembre de 2026, con cero descargas y cero likes en el momento de redactar esta ficha.

Por tanto, esta ficha documenta un artefacto en fase embrionaria. Cualquier evaluacion tecnica del modelo es imposible con los datos publicos actuales; lo unico verificable es la intencion declarada del autor (tres experimentos de SFT completo sobre subconjuntos fijos de LIBERO) y una advertencia metodologica explicita: los grupos fijos no aíslan efectos de escena frente a objetos/acciones y no cubren todas las tareas de las escenas que nombran.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere linaje pi05 / Pi-Zero, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card anuncia checkpoints futuros, sin especificar formato) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en este repositorio. El identificador `pi05` y la referencia a LIBERO apuntan a un modelo de politica visuomotora (vision-language-action) derivado de la familia Pi-Zero de Physical Intelligence, pero esta afirmacion no esta confirmada por la model card y debe tratarse como inferencia a partir del nombre, no como dato verificado.

Respecto al entrenamiento, la model card indica que se trata de "three fixed-subset full SFT experiments" (tres experimentos de ajuste supervisado completo sobre subconjuntos fijos) y que el estado es "preparation in progress; no completed training runs yet". Es decir, no hay runs finalizados, no hay checkpoints publicados y no se detalla el volumen de datos, la composicion del dataset ni si hubo RLHF/DPO. El autor advierte ademas que los grupos fijos no aíslan efectos de escena de objetos/acciones y que no cubren todas las tareas de las escenas nombradas, lo que limita la interpretabilidad de cualquier resultado futuro.

## Capacidades

- No disponible. La model card no documenta ninguna capacidad funcional del modelo.
- Por el nombre y la referencia a LIBERO, cabria esperar capacidades de manipulacion robotica guiada por instrucciones en entornos simulados, pero no hay confirmacion ni especificacion tecnica.
- No se documenta soporte de tool calling, function calling, agentes, multilingue, vision, audio ni modos de razonamiento extendido.
- No hay demos, espacios de HuggingFace ni ejemplos de inferencia publicados.

## Casos de uso

- Evaluacion de investigacion en manipulacion robotica: si finalmente se publican checkpoints, el modelo podria emplearse como punto de partida para estudiar el efecto de subconjuntos fijos de tareas LIBERO en el ajuste supervisado. No obstante, el propio autor advierte que el diseno experimental no aisla escena de objetos/acciones, por lo que su valor como ablacion controlada es limitado.
- Reproduccion de experimentos de SFT sobre LIBERO: el repositorio podria servir para replicar los tres grupos fijos una vez publicados los planes (`docs/superpowers/plans/2026-11-04-libero-sft.md`) y el protocolo (`PROTOCOL_RU.txt`), que no estan disponibles en la informacion proporcionada.
- Baseline para comparaciones futuras: si se publican los checkpoints, podrian usarse como referencia de "SFT completo sobre subconjunto fijo" frente a entrenamientos sobre el conjunto completo de LIBERO.
- Docencia y formacion: como ejemplo de repositorio en fase de preparacion y de las precauciones metodologicas necesarias al definir subconjuntos de tareas en benchmarks de robotica.
- Auditoria de practicas de publicacion: el repositorio ilustra el caso de un model card que declara explicitamente la ausencia de runs completados, lo que puede usarse como ejemplo de transparencia minima.
- Integracion en pipelines de evaluacion robotica: solo si en el futuro se publican pesos y se documenta el formato; en el estado actual no es posible.

En el estado actual, ninguno de estos casos es ejecutable: no hay pesos, no hay licencia y no hay especificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay ejecuciones de entrenamiento completadas, por lo que no existen metricas que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; ademas, al tratarse presuntamente de un modelo de politica visuomotora, es probable que requiera un stack de inferencia especifico distinto de los servidores de LLM, pero esto no esta confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables dentro de la informacion proporcionada, y el estado embrionario del repositorio impide establecer comparaciones significativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene ningun checkpoint ni ejecucion de entrenamiento completada; el estado declarado es "preparation in progress".
- No se especifica licencia, lo que impide cualquier uso comercial o redistribucion con garantias juridicas.
- No se documentan idiomas, arquitectura, parametros ni formato de pesos.
- El propio autor advierte que los tres grupos fijos no aislan efectos de escena frente a objetos/acciones y no cubren todas las tareas de las escenas que nombran; los resultados, si llegan, no deben interpretarse como ablaciones controladas.
- La model card menciona que el almacenamiento local `/workspace` no es persistente y que se requieren copias de seguridad externas, lo que sugiere riesgo de perdida de artefactos intermedios.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma, al no existir documentacion tecnica del modelo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qrvmil/pi05-libero-three-groups-20261104
- Plan de SFT referenciado en la model card: `docs/superpowers/plans/2026-11-04-libero-sft.md` (no disponible en la informacion proporcionada)
- Protocolo referenciado en la model card: `PROTOCOL_RU.txt` (no disponible en la informacion proporcionada)
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la busqueda web.
