# llmkat/qwen3.5-negative-control

## Resumen

llmkat/qwen3.5-negative-control es un modelo de texto publicado por el usuario llmkat en Hugging Face, concebido explicitamente como control negativo de otro modelo de la misma familia (llmkat/qwen3.5). Segun la model card, se trata del mismo modelo que qwen3.5 pero con un "tap" de convolucion desplazado un paso, de modo que su memoria se escribe bajo claves erroneas. El modelo carga y se ejecuta con normalidad, pero la herramienta de verificacion `check.py` del proyecto llmkat debe reportar FAIL sobre el; si reportara PASS, significaria que la propia herramienta de verificacion es defectuosa.

No es, por tanto, un modelo pensado para uso productivo ni para tareas de generacion real: su proposito es servir de prueba de sanidad (sanity check) de una metodologia de auditoria de modelos. La relevancia es metodologica, no de capacidad: permite validar que un pipeline de comprobacion detecta manipulaciones deliberadas en los pesos o en el comportamiento del modelo.

El repositorio es muy pequeno (0,1 GB) y contiene 58.015.616 parametros en safetensors, lo que sugiere un modelo de escala reducida, probablemente una variante de prueba y no el modelo completo de la familia qwen3.5. La licencia es MIT y la libreria declarada es transformers, con soporte indicado para vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer de texto, segun tag del repo); detalles internos no disponibles |
| Parametros totales | 58.015.616 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo pertenece a la arquitectura qwen3_5_text y que es una variante de llmkat/qwen3.5 con un unico cambio: un "convolution tap" desplazado un paso, lo que provoca que la memoria del modelo se escriba bajo claves incorrectas. No se detalla en la informacion proporcionada si esa "memoria" corresponde a un mecanismo de atencion, a un modulo convolucional hibrido o a otra estructura interna; el autor remite al repositorio github.com/sansblues/llmkat para la explicacion completa.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, etc.). Todo apunta a que el modelo se distribuye como artefacto de prueba dentro de un proyecto de verificacion, no como un modelo entrenado para rendimiento.

## Capacidades

- Generacion de texto: el modelo carga y se ejecuta con normalidad segun la model card, por lo que puede producir texto, aunque su calidad no esta evaluada ni documentada.
- Verificacion de pipelines: su funcion principal es provocar un FAIL en `check.py`, validando que la herramienta de auditoria detecta modelos manipulados.
- Compatibilidad con vLLM y SGLang: los tags del repositorio indican soporte para estos motores de inferencia.
- Compatibilidad con transformers: libreria declarada en el repo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prueba de regresion de herramientas de auditoria: ejecutar `check.py` contra este modelo y confirmar que devuelve FAIL; si devuelve PASS, el pipeline de verificacion tiene un fallo y debe corregirse antes de usarlo con modelos reales.
- Validacion de pipelines de evaluacion en CI: integrar el modelo como caso de prueba negativo en un flujo de integracion continua para asegurar que los cambios en el codigo de verificacion no rompen la deteccion de manipulaciones.
- Desarrollo y depuracion de llmkat: servir como referencia controlada al implementar nuevas comprobaciones en el proyecto, comparando su comportamiento con el de llmkat/qwen3.5.
- Pruebas de carga y compatibilidad de motores de inferencia: al ser un modelo pequeno (58 M de parametros, 0,1 GB), permite verificar rapidamente que vLLM o SGLang sirven correctamente un modelo de la familia qwen3_5_text sin consumir recursos significativos.
- Formacion y demostracion metodologica: ilustrar en docencia o articulos como se disena un control negativo en la evaluacion de modelos, mostrando que un modelo funcional puede fallar una comprobacion de integridad.
- Verificacion de reproducibilidad de pesos: comprobar que las herramientas de comparacion de tensores o de hashing de safetensors detectan diferencias sutiles entre llmkat/qwen3.5 y esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion; el unico resultado esperado es el FAIL de `check.py`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 58 millones de parametros, el modelo en precision completa (fp32) ocuparia aproximadamente 232 MB; en fp16, unos 116 MB; en int8, unos 58 MB. Son estimaciones calculadas a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, GTX 1050 Ti, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: vLLM (`vllm serve llmkat/qwen3.5-negative-control`), SGLang (segun tags) y transformers. No se documenta soporte explicito de llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llmkat/qwen3.5-negative-control | 58.015.616 | no disponible | Control negativo para verificacion | MIT | Hugging Face |
| llmkat/qwen3.5 | no disponible | no disponible | Modelo de referencia del proyecto llmkat | no disponible | Hugging Face |
| qwen3.5 (familia Qwen) | no disponible | no disponible | Modelo de proposito general | no disponible | no disponible |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a proposito y licencia.

## Limitaciones y advertencias

- El modelo esta disenado para fallar la verificacion de llmkat; no debe usarse como sustituto de llmkat/qwen3.5 ni en produccion.
- La manipulacion deliberada de un tap de convolucion implica que su comportamiento interno es incorrecto por construccion, aunque la salida superficial parezca normal.
- No se declaran idiomas soportados, por lo que se desconoce su cobertura linguistica.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad.
- No se documenta la longitud de contexto; no debe asumirse ninguna ventana concreta.
- La licencia MIT permite uso comercial, pero el proposito del artefacto hace que ese uso carezca de sentido practico.
- Los datos de arquitectura y entrenamiento son muy escasos; cualquier afirmacion sobre su funcionamiento interno debe contrastarse con el repositorio github.com/sansblues/llmkat.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter experimental.

## Enlaces

- Hugging Face: https://huggingface.co/llmkat/qwen3.5-negative-control
- Modelo de referencia: https://huggingface.co/llmkat/qwen3.5
- Repositorio del proyecto: https://github.com/sansblues/llmkat
- Paper: no disponible
- Blog o demo: no disponible
