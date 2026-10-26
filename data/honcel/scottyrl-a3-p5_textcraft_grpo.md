# Honcel/scottyrl-a3-p5_textcraft_grpo

## Resumen

`Honcel/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario Honcel en HuggingFace. No se trata de un modelo completo, sino de un conjunto de pesos incrementales (0,2 GB de repositorio) que debe cargarse junto al modelo base para poder utilizarse. El adaptador se ha entrenado con el framework `scottyrl`, según la model card, en el contexto de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, correspondiente a la tarea A3.

El objetivo declarado del adaptador es resolver tareas de tipo TextCraft-Synth, un entorno de síntesis de objetos a partir de recetas textuales en el que el agente debe planificar y ejecutar acciones. La evaluación prevista se realiza sirviendo el adaptador con vLLM (`--enable-lora --max-lora-rank 32`) y ejecutando un script de evaluación sobre las particiones de validación `medium` y `hard`, con `k=4`. La información pública disponible es mínima: no hay cifras de benchmarks, no se declara licencia, no se especifican idiomas y no hay pipeline asignado.

Por su naturaleza, la ficha debe interpretarse como una descripción de un artefacto de investigación educativa y no como un modelo listo para producción. La relevancia actual radica en que ejemplifica el flujo de trabajo habitual de ajuste fino con LoRA y despliegue multi-adaptador mediante vLLM, así como el patrón de evaluación con `pass@k` en entornos de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer `Qwen/Qwen3.5-4B`; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base es de 4B (segun el identificador `Qwen3.5-4B`, no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (heredada del modelo base `Qwen/Qwen3.5-4B`, sin especificar) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, rango 32) |
| Tamano del repositorio | 0,2 GB |
| Rango LoRA | 32 (`--max-lora-rank 32` en el ejemplo de despliegue) |
| Framework de entrenamiento | `scottyrl` (etiquetas: `tinker`, `peft`, `lora`, `scottyrl`, `11-768`) |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Configuracion de entrenamiento | `configs/p5_textcraft_grpo.yaml` (no incluida en el repositorio publico) |
| Commit de referencia | `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e` |
| Fecha de creacion | 2026-10-26 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado sobre `Qwen/Qwen3.5-4B`, exportado desde la ruta `/private/tmp/v50_r4_adapter` y entrenado con el framework `scottyrl`. El sufijo `_grpo` del nombre de la ejecucion (`p5_textcraft_grpo`) sugiere el uso de GRPO (Group Relative Policy Optimization) como algoritmo de optimizacion, un metodo de aprendizaje por refuerzo habitual para el ajuste de agentes y modelos de razonamiento; sin embargo, la model card no describe explicitamente el algoritmo, los hiperparametros ni la composicion del dataset, por lo que esta interpretacion no puede confirmarse con la informacion disponible.

No se especifican el numero de tokens de entrenamiento, la mezcla de datos, la presencia de etapas de RLHF o DPO, ni innovaciones tecnicas mas alla del propio ajuste LoRA. El unico detalle operativo documentado es el procedimiento de evaluacion: el adaptador se sirve con vLLM usando `--enable-lora --max-lora-rank 32 --lora-modules a3=Honcel/scottyrl-a3-p5_textcraft_grpo` y se evalua con `scripts/evaluate_checkpoint.py` sobre las particiones de validacion `medium` y `hard` de TextCraft-Synth con `k=4`, lo que indica una metrica de tipo pass@4 sobre tareas de agente.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de agente, segun el proposito declarado del entrenamiento (entorno TextCraft-Synth).
- Planificacion y ejecucion de acciones en entornos estructurados de sintesis de objetos a partir de recetas (TextCraft), con evaluacion prevista en dificultad media y alta.
- Integracion como adaptador PEFT sobre el modelo base, lo que permite conmutar entre el comportamiento base y el ajustado sin duplicar los pesos completos.
- Despliegue multi-adaptador en vLLM mediante `--enable-lora`, lo que habilita servir el modelo base y el adaptador en un mismo endpoint.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (depende de las capacidades del modelo base, no documentadas aqui).
- Capacidades multilingues: no disponibles.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponibles.
- No se documentan capacidades especiales adicionales (thinking mode, decodificacion especulativa, atencion lineal) en la informacion proporcionada.

## Casos de uso

- Evaluacion academica de agentes: reproducir el flujo documentado por el autor (servir con vLLM y ejecutar `scripts/evaluate_checkpoint.py` con `--k 4` sobre `data/textcraft_val_hard.jsonl`) para comparar el adaptador frente al modelo base en las mismas condiciones.
- Investigacion en aprendizaje por refuerzo aplicado a agentes: usar el adaptador como punto de partida o referencia para estudiar el efecto de GRPO en tareas de planificacion con recompensas verificables.
- Experimentacion con LoRA multi-adaptador: desplegar el modelo base y este adaptador en un mismo servidor vLLM para comparar respuestas con y sin ajuste sobre el mismo prompt, manteniendo un unico conjunto de pesos base.
- Prototipado de agentes de sintesis y planificacion: emplear el adaptador en entornos tipo TextCraft (recetas, ingredientes, crafteo) para validar pipelines de accion-observacion antes de escalar a modelos mayores.
- Docencia y formacion en ajuste fino: el repositorio sirve como ejemplo compacto (0,2 GB) de artefacto PEFT con instrucciones de servicio y evaluacion reproducibles en un aula o taller.
- Base para experimentos de destilacion o comparacion de algoritmos: al ser un adaptador pequeno, es viable entrenar variantes (distinto rango, distintos datos) y compararlas contra esta referencia manteniendo el mismo modelo base.
- Pruebas de integracion en infraestructura de inferencia: validar configuraciones de vLLM con LoRA habilitada, limites de rango y enrutado por nombre de modulo (`a3`) en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el procedimiento de evaluacion (vLLM + `scripts/evaluate_checkpoint.py`, `k=4`, particiones `medium` y `hard` de TextCraft-Synth), sin incluir metricas numericas ni comparaciones con otros modelos.

| Benchmark | Resultado | Notas |
|---|---|---|
| TextCraft-Synth val (medium), k=4 | No disponible | Procedimiento descrito, sin cifras publicadas |
| TextCraft-Synth val (hard), k=4 | No disponible | Procedimiento descrito, sin cifras publicadas |
| MMLU / HumanEval / GSM8K | No disponible | No evaluados en la informacion proporcionada |

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,2 GB en disco; en memoria, los pesos LoRA en precision nativa anaden un consumo marginal frente al modelo base (estimacion, no confirmada por el autor).
- VRAM para inferencia: depende integramente del modelo base `Qwen/Qwen3.5-4B`. Como referencia orientativa para un modelo denso de 4B: en torno a 8-10 GB en FP16/BF16 incluyendo cache KV, y aproximadamente 3-4 GB con cuantizacion de 4 bits (estimacion; no verificada en la informacion disponible).
- GPU recomendadas: no especificadas por el autor. Para servir el modelo base en BF16 son suficientes GPU de 16-24 GB (por ejemplo, RTX 4090, L4, A10G); para despliegues con mayor concurrencia, A100 o H100. El adaptador en si no impone requisitos adicionales relevantes.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 12-16 GB o mas, segun la precision y la cuantizacion elegidas para el modelo base (estimacion).
- Opciones de despliegue: vLLM con soporte LoRA es el metodo documentado por el autor (`--enable-lora --max-lora-rank 32 --lora-modules a3=...`). Otras vias compatibles con PEFT (Transformers + `peft`, TGI con adaptadores) no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles. Dependeran del modelo base, del hardware y de la carga; el uso de LoRA anade una sobrecarga pequena en comparacion con servir pesos completos.

## Comparativa con modelos similares

No se han identificado en la informacion disponible adaptadores directamente comparables (mismo modelo base, misma tarea o mismo framework). La comparacion mas directa posible es contra el propio modelo base y contra un ajuste completo equivalente, para los cuales tampoco hay metricas publicas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Honcel/scottyrl-a3-p5_textcraft_grpo` (este adaptador) | LoRA rango 32 sobre base 4B | No disponible | No disponible | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-4B` (modelo base, sin ajuste) | 4B | No disponible | No disponible | No disponible | Publico en HuggingFace |
| Otros adaptadores LoRA de la misma asignatura (11-768) | No disponible | No disponible | No disponible | No disponible | No identificados en la busqueda |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar `Qwen/Qwen3.5-4B` ademas del adaptador; sin el modelo base los pesos no son utilizables.
- Ausencia total de metricas publicadas: no hay evidencia numerica del rendimiento del adaptador ni de su mejora frente al modelo base.
- Licencia no declarada: no puede asumirse permiso de uso comercial. Es imprescindible verificar la licencia del modelo base y contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: se desconoce si el ajuste conserva o degrada el comportamiento multilingue del modelo base; es esperable un sesgo hacia el ingles, lengua habitual en datasets de tareas de agentes.
- Entrenamiento orientado a una unica tarea (TextCraft-Synth): es probable un deterioro del rendimiento en dominios ajenos por sobreajuste al entorno de evaluacion (caveat general de los adaptadores de tarea especifica; no verificado en este caso).
- Riesgo de alucinacion inherente al modelo base, no evaluado ni mitigado de forma documentada en el adaptador.
- Sesgos: no documentados. Al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de dominio, idioma o contenido.
- Procedencia del artefacto: la ruta de exportacion (`/private/tmp/v50_r4_adapter`) y el contexto de tarea academica sugieren un experimento de curso; no hay indicios de validacion externa, versionado semantico ni mantenimiento.
- Fecha de creacion futura respecto a la informacion habitual de referencia y ausencia de descargas o interacciones: no existe evidencia de uso por terceros.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas sin relacion con la consulta), por lo que no se ha podido contrastar informacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Honcel/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentacion de vLLM sobre LoRA (referencia de despliegue citada en la model card): https://docs.vllm.ai/
- Repositorio del framework `scottyrl` y scripts de evaluacion (`scripts/evaluate_checkpoint.py`, `configs/p5_textcraft_grpo.yaml`): no disponibles en la informacion proporcionada
- Paper o blog del autor: no disponible
