# juicenv/microduck-roller-es3

## Resumen

Microduck-roller-es3 es una política de control para el robot microduck de Pollen Robotics, publicada por el usuario juicenv como un ajuste fino (finetune) del modelo de referencia `pollen-robotics/microduck-roller-sprint-2m-reference`. No es un modelo de lenguaje ni de visión: se trata de una política de aprendizaje por refuerzo que produce una marcha perpetua (un "gait") para el robot cuando se desplaza sobre ruedas. Concretamente, consume una observación de 61 dimensiones y emite 14 acciones a 50 Hz, y se ejecuta de forma continua hasta que se le indique lo contrario.

El problema que resuelve es el control locomotor de un robot físico: la política se carga en una "slot" de política del demonio del robot y se ejecuta en el propio hardware. Su entrenamiento se ha realizado mediante estrategias de evolución (evolution strategies) sobre el denominado "Arena roller scorer", según indica el autor, y se describe como verificado en x86 en su tercera ronda de entrenamiento.

Su relevancia es de nicho, dentro del ecosistema microduck y de la robótica de bajo coste orientada a políticas de control ligeras. El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero "likes" en el momento de la consulta, y no se declara licencia ni idiomas. El formato de distribución es ONNX, con el normalizador de observaciones embebido en `policy.onnx`, acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo; no se especifica la topologia de red) |
| Parametros totales | no disponible (la referencia base incluye «2m» en su nombre, sin confirmacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control; observacion de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica, sin procesamiento de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de red interna mas alla de sus interfaces: una entrada de observacion de 61 dimensiones y una salida de 14 acciones a 50 Hz sobre ruedas (rollers). El normalizador de observaciones esta integrado en el propio `policy.onnx`, de modo que la politica espera observaciones en crudo, sin preprocesado externo. El autor indica que la politica es "perpetua", es decir, que no tiene condicion de terminacion y se ejecuta de forma continua hasta que se le ordene lo contrario; se describe como una marcha ("gait") cargada en una slot de politica.

El entrenamiento se realizo mediante estrategias de evolucion (evolution strategies) sobre el "Arena roller scorer", segun la model card, y se etiqueta como "x86-verified" en su tercera ronda. Los metadatos de entrenamiento apuntan al repositorio `pollen-robotics/microduck_rl`, rama `lean`, commit `5a3636302`. No se especifican el numero de tokens (concepto no aplicable aqui), la composicion del dataset ni el uso de RLHF/DPO, que no proceden en este tipo de politica. Se trata de un finetune (relacion `base_model_relation: finetune`) del modelo `pollen-robotics/microduck-roller-sprint-2m-reference`.

## Capacidades

- Control locomotor continuo del robot microduck sobre ruedas: genera 14 acciones a 50 Hz a partir de una observacion de 61 dimensiones.
- Ejecucion perpetua: la politica no se detiene por si misma, sino que corre hasta que se le indique lo contrario.
- Integracion directa con el demonio del robot mediante `robotctl policy load <slot> juicenv/microduck-roller-es3`.
- Normalizacion de observaciones embebida: acepta observaciones en crudo sin capa de preprocesado adicional.
- Compatibilidad con el esquema 2 del manifiesto de politicas de microduck.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades de vision, audio o modo "thinking": no disponibles / no aplica.

## Casos de uso

- Locomocion continua de un microduck con ruedas: cargar la politica en una slot mediante `robotctl policy load` y dejar que el robot mantenga la marcha de forma indefinida, adecuado para demostraciones de movimiento perpetuo.
- Base para experimentos de aprendizaje por refuerzo: sirve como punto de partida para nuevos finetunes sobre el mismo scorer "Arena roller", dado que se publica como remix de una referencia de Pollen Robotics.
- Evaluacion comparativa de politicas de control: al compartir interfaz (61-D observacion, 14 acciones, 50 Hz) con la referencia base, permite medir variantes de una misma tarea de marcha sobre ruedas.
- Despliegue en el robot fisico a traves del demonio de microduck, aprovechando el formato ONNX y el manifiesto de politicas para su carga en una slot.
- Reproduccion de entrenamiento: el autor documenta repositorio, rama y commit (`microduck_rl`, rama `lean`, commit `5a3636302`), lo que facilita reconstruir el pipeline de entrenamiento en x86.
- Prototipado de control en investigacion robotica de bajo coste: util para validar rapidamente una marcha sobre un robot pequeno antes de invertir en politicas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona el uso del "Arena roller scorer" durante el entrenamiento y que la politica esta "verificada en x86" en su tercera ronda, pero no se aportan puntuaciones, tasas de exito ni metricas de velocidad, estabilidad o consumo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano del repositorio es de 0,0 GB y no se declaran dimensiones de red).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el modelo esta pensado para ejecutarse en el propio robot, no como carga de trabajo de GPU de escritorio.
- Opciones de despliegue: runtime ONNX sobre el robot; carga mediante el demonio de microduck (`robotctl policy load`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles; la politica opera a 50 Hz como frecuencia de control.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-roller-es3 | Politica RL (finetune, ES) | 61-D / 14 acciones | 50 Hz | no disponible | HuggingFace (0 descargas, 0 likes) |
| pollen-robotics/microduck-roller-sprint-2m-reference | Politica RL (referencia) | 61-D / 14 acciones | 50 Hz | no disponible | HuggingFace (modelo base) |
| Otras politicas de microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin cobertura explicita y debe aclararse con el autor antes de cualquier despliegue en produccion.
- No se documentan sesgos, pero al ser una politica entrenada contra un scorer concreto ("Arena roller scorer"), su comportamiento puede degradarse fuera de las condiciones para las que fue optimizada.
- Riesgo de alucinacion: no aplica en el sentido linguistico; en su lugar existe el riesgo de comportamientos de control no deseados o inestables en el robot fisico.
- La politica es perpetua y carece de condicion de parada propia: requiere supervision externa para detenerla.
- No se especifican idiomas ni capacidades de lenguaje, vision o audio; no debe tratarse como un modelo multimodal.
- El repositorio es de 0,0 GB y registra cero descargas y cero "likes", sin historial de uso comunitario que respalde su robustez.
- Modelo de nicho vinculado al hardware microduck y a su demonio; no es reutilizable fuera de ese ecosistema sin adaptaciones.
- Se etiqueta como "tercera ronda" y "verificada en x86", lo que sugiere caracter experimental mas que un artefacto consolidado.

## Enlaces

- Pagina de HuggingFace: https://huggingface.co/juicenv/microduck-roller-es3
- Modelo base: https://huggingface.co/pollen-robotics/microduck-roller-sprint-2m-reference
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `lean`, commit `5a3636302`
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio de microduck
