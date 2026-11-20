# jungwook2358/vwam-robotwin-fredicl-e3-scratch-b64-60k-sfix-iter60000

## Resumen

vwam-robotwin-fredicl-e3-scratch-b64-60k-sfix-iter60000 es un checkpoint de investigación en robótica publicado por el usuario jungwook2358 en Hugging Face. Se trata de un modelo de política visuomotora (visuomotor policy) entrenado para manipulación robótica sobre el benchmark RoboTwin 2.0 con la plataforma aloha-agilex. No es un modelo de lenguaje: su pipeline es `robotics` y su propósito es generar secuencias de acciones a partir de observaciones visuales y contexto de tarea.

El entrenamiento sigue la receta FRED-ICL E3, que combina una base Cosmos3-Nano con un ActionDiT construido desde cero mediante arquitectura MoT (Mixture of Transformers), un canvas temporal de t320 y chunks de 48 acciones. El modelo se ha entrenado con 43 tareas de RoboTwin (dejando fuera las siete tareas del split `zerowam_unseen7`) y co-entrenado con 854 vídeos humanos del dataset HumanGen, una estrategia de transferencia desde vídeo humano a datos de robot.

El repositorio contiene únicamente el checkpoint de entrenamiento `iter_000060000` en formato torch DCP (4 shards más `.metadata`, con pesos raw y EMA) junto con el `config.yaml` de la ejecución. No incluye optimizador, scheduler ni estado del trainer, y no se ha publicado información sobre benchmarks, licencia comercial ni idiomas. Su relevancia es acotada: es material reproducible para investigación en políticas robóticas, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoT (Mixture of Transformers) con base Cosmos3-Nano y ActionDiT entrenado desde cero |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (canvas temporal t320, chunk de 48 acciones) |
| Tipos de cuantizacion | no disponible (checkpoint en torch DCP, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | other (sin términos detallados en la información disponible) |
| Formato de pesos | torch DCP (4 shards + `.metadata`, pesos raw y EMA) |

## Arquitectura y entrenamiento

La arquitectura se apoya en una base Cosmos3-Nano combinada con un ActionDiT entrenado desde cero dentro de un esquema MoT (Mixture of Transformers). El modelo opera sobre un canvas temporal t320 y produce chunks de 48 acciones, lo que implica una ventana de planificación motora relativamente larga para manipulación. La receta FRED-ICL E3 corresponde a la variante "as is" de la ejecución EXP-0027, sin el componente pointflow que aparece en otras variantes de la familia.

El entrenamiento se realizó sobre RoboTwin 2.0 (aloha-agilex) con el split de tareas Zero-WAM: datos de robot de 43 tareas, excluyendo las siete tareas de `zerowam_unseen7` que quedan reservadas para evaluación. Se co-entrenó con 854 vídeos humanos del dataset HumanGen correspondientes a esas 43 tareas de entrenamiento. La configuración usa GBS 64 y 60 000 iteraciones. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en un modelo de política robótica).

## Capacidades

- Generación de secuencias de acciones robóticas para manipulación con la plataforma aloha-agilex en el entorno RoboTwin 2.0.
- Procesamiento de observaciones visuales y contexto de tarea para producir chunks de 48 acciones.
- Aprendizaje por imitación con co-entrenamiento desde vídeo humano (HumanGen) para transferencia a datos de robot.
- Evaluación sobre tareas no vistas del split `zerowam_unseen7` (siete tareas reservadas).
- No dispone de tool calling, function calling ni capacidades de agente en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del ámbito visuomotor robótico.

## Casos de uso

- Reproducción de experimentos en RoboTwin 2.0: el checkpoint permite replicar la ejecución EXP-0027 con la receta FRED-ICL E3 y comparar contra variantes con pointflow u otras configuraciones.
- Evaluación de generalización a tareas no vistas: sirve para medir el rendimiento en las siete tareas de `zerowam_unseen7` que se mantuvieron fuera del entrenamiento.
- Estudio de transferencia desde vídeo humano: al haberse co-entrenado con 854 vídeos de HumanGen, permite analizar cuánto aporta el vídeo humano frente al dato de robot puro en manipulación.
- Investigación en políticas visuomotoras con chunks largos: el chunk de 48 acciones y el canvas t320 son útiles para estudiar planificación motora de horizonte amplio en aloha-agilex.
- Base para fine-tuning en tareas propias: el checkpoint puede servir como inicialización para adaptar la política a un conjunto de tareas de manipulación distinto, siempre que se disponga del code tree RLDX-2-VWAM.
- Comparación de arquitecturas MoT frente a alternativas transformer puras en robótica, usando el mismo protocolo de evaluación de RoboTwin.
- Docencia y formación en robótica de imitación: el paquete incluye `config.yaml` y un script de exportación, lo que facilita reproducir el pipeline completo en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24,0 GB y el proceso de exportación eval-minimal requiere aproximadamente 70 GB de RAM sin GPU.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del checkpoint y la ausencia de cuantizaciones publicadas hacen improbable un despliegue directo en GPU de consumo sin trabajo adicional.
- Opciones de despliegue: el flujo documentado por el autor usa `vwam/eval/export_eval_minimal.py` seguido de `vwam/eval/eval_robotwin_task.sh` sobre el code tree RLDX-2-VWAM (rama `jungwook/fredicl-pflow`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwam-robotwin-fredicl-e3-scratch-b64-60k-sfix-iter60000 | no disponible | no disponible | no disponible | other | Hugging Face, 0 descargas |
| Otras variantes de la familia vwam/FRED-ICL | no disponible | no disponible | no disponible | other | no disponible en la información proporcionada |
| Políticas de referencia de RoboTwin 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan análisis de sesgo para este checkpoint.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: el modelo está restringido al dominio RoboTwin 2.0 con aloha-agilex y a las 43 tareas de entrenamiento; no se documentan capacidades fuera de ese entorno.
- Restricciones de licencia: la licencia es `other` sin términos detallados en la información disponible; es imprescindible contactar con el autor antes de cualquier uso comercial.
- El repositorio contiene solo el checkpoint `iter_000060000` y el `config.yaml`; no incluye optimizador, scheduler ni estado del trainer, por lo que no es posible reanudar el entrenamiento tal cual.
- La evaluación requiere ejecutar primero el script de exportación eval-minimal (unos 70 GB de RAM, sin GPU) sobre el code tree exacto con el que se entrenó.
- No hay cuantizaciones publicadas ni formatos alternativos (GGUF, safetensors consolidados), lo que limita el despliegue en entornos con recursos ajustados.
- El modelo tiene 0 descargas y 0 likes, sin validación externa conocida; debe tratarse como material de investigación sin garantías de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/vwam-robotwin-fredicl-e3-scratch-b64-60k-sfix-iter60000
- Code tree RLDX-2-VWAM (rama `jungwook/fredicl-pflow`): no disponible como URL en la información proporcionada
- Paper o blog de FRED-ICL E3: no disponible
- Paper de RoboTwin 2.0: no disponible en la información proporcionada
- Dataset HumanGen: no disponible como URL en la información proporcionada
