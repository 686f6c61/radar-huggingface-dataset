# LoganResearch/qwen2.5-1.5b-instruct-distilled

## Resumen

Qwen2.5-1.5B-Instruct distilled es un adaptador LoRA de rango 8 publicado por LoganResearch sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct de Alibaba Cloud. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (q_proj y v_proj de la atencion) que se cargan sobre el modelo base mediante la libreria PEFT. Su proposito declarado es mejorar la precision en preguntas de tipo multiple-choice factual y reducir la exposicion a respuestas erroneas bajo una lectura de confianza congelada.

El adaptador se presenta con una metodologia poco habitual en Hugging Face: un protocolo de evaluacion preregistrado y fijado antes de lanzar los experimentos, con hashes SHA-256 publicados tanto del protocolo como de los resultados. Sobre un panel held-out de 617 items de TruthfulQA-MC1, el autor reporta un incremento de precision de 47,97 % a 84,28 % (+36,30 puntos, IC 95 % 32,09-40,19, McNemar exacto p=1,9e-52) y una reduccion de la tasa de respuestas erroneas del 52,0 % al 15,7 %.

Es relevante ahora porque ejemplifica una tendencia creciente: adaptadores pequenos y baratos (entrenables en CPU, ~6 GB de RAM en fp32) acompanados de evaluacion estadisticamente rigurosa y controles sham, en contraste con fichas que solo declaran mejoras sin medicion. El modelo base Qwen2.5-1.5B-Instruct aporta la arquitectura transformer decoder-only, el contexto largo y el soporte multilingue; el adaptador solo modifica el comportamiento en la tarea medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8) sobre transformer decoder-only Qwen2.5-1.5B-Instruct; modulos q_proj y v_proj de la atencion |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible; evaluado en CPU fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 8 aplicado exclusivamente a las proyecciones q_proj y v_proj de la atencion del modelo base Qwen2.5-1.5B-Instruct. No se modifica el resto de la red ni se anaden capas nuevas; la inferencia requiere cargar el modelo base completo y adjuntar el adaptador con PEFT. El entrenamiento se realizo sobre objetivos permutados en el brazo de control (sham-control), lo que permite al autor argumentar que la mejora observada es especifica del adaptador entrenado y no un efecto generico de la perturbacion LoRA.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. El unico dato de entrenamiento implicito es la existencia de un panel de 617 items de TruthfulQA-MC1 nunca usado en entrenamiento, lo que sugiere que el conjunto de entrenamiento se construyo a partir de una particion distinta de TruthfulQA u otra fuente factual. La innovacion metodologica destacable no esta en la arquitectura sino en el protocolo: preregistro con hash SHA-256 (`prereg.md`, `f4f6b5c5...`), resultados machine-readable con hash (`results.json`, `0f47cc1d...`), verificacion independiente (`VERIFY.sh`, rc=0) y un control sham con arquitectura identica y objetivos permutados que degrada el panel en -24,64 puntos (IC 95 % -28,69 a -20,26).

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Qwen2.5-1.5B-Instruct.
- Respuesta a preguntas factuales de tipo multiple-choice con precision medida de 84,28 % en el panel TruthfulQA-MC1 held-out.
- Reduccion de la tasa de respuestas erroneas del 52,0 % al 15,7 % bajo lectura de confianza congelada.
- Capacidad de tool calling y function calling: no disponible en la informacion del adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion del adaptador.
- Capacidades multilingues: no disponible; los idiomas del adaptador no se declaran.
- Modo thinking, vision o audio: no disponible; el adaptador no anade modalidades.
- Abstencion y rechazo: sin cambio medido (+2,0 puntos, IC 95 % -4,0 a +10,0, cruza cero); el autor declara explicitamente que no reclama ninguna mejora en honestidad ni abnegacion.

## Casos de uso

- Filtrado de respuestas factuales en pipelines de QA: el adaptador puede aplicarse sobre el modelo base para elevar la precision en preguntas de conocimiento general de tipo multiple-choice, aprovechando el +36,30 puntos medidos en TruthfulQA-MC1. Adecuado cuando el cuello de botella es la exactitud factual y no la generacion abierta.
- Deteccion temprana de respuestas erroneas con lectura de confianza: la reduccion de la exposicion a errores no marcados (37,9 % a 7,9 %) permite construir un clasificador de "respuesta fiable" sobre las activaciones del modelo, aunque el autor advierte que las cabezas de lectura deben recertificarse sobre los pesos con adaptador.
- Evaluacion comparativa de adaptadores en investigacion: el protocolo preregistrado con control sham y hashes publicos sirve como plantilla para validar otros adaptadores LoRA con rigor estadistico, replicando el pipeline `apply_lora.py` y el panel de 617 items.
- Despliegue en entornos con recursos limitados: al ser un adaptador de rango 8 sobre un modelo de 1,5B, la inferencia en CPU con ~6 GB de RAM en fp32 es viable, lo que permite incorporar la mejora en estaciones de trabajo sin GPU dedicada.
- Prototipado de asistentes de trivia y educacion: para preguntas de opcion multiple con respuesta verificable, el adaptador mejora la tasa de acierto sin requerir un modelo mayor, reduciendo coste por consulta.
- Auditoria de sesgos y calibracion: el par base/adaptador y el control sham permiten estudiar como una perturbacion LoRA de bajo rango afecta a la calibracion de la confianza, util en investigacion sobre honestidad de modelos.
- Integracion en pipelines de CI/CD para regresion de calidad: el script `apply_lora.py` y los hashes de resultados permiten automatizar la comprobacion de que un cambio en el adaptador no degrada el panel factual.

## Benchmarks y rendimiento

| Benchmark | Base | Adaptador | Delta | Intervalo de confianza 95 % |
|---|---|---|---|---|
| TruthfulQA-MC1 (n=617, held-out) | 47,97 % | 84,28 % | +36,30 pts | 32,09 a 40,19 (McNemar p=1,9e-52) |
| Tasa de respuestas erroneas (lectura de confianza) | 52,0 % | 15,7 % | -36,3 pts | No disponible |
| Exposicion a errores no marcados | 37,9 % | 7,9 % | -29,98 pts | 26,09 a 34,20 |
| Control sham (objetivos permutados) | 47,97 % | 23,33 % | -24,64 pts | -28,69 a -20,26 |
| Tasa de rechazo en sonda de trampas (n=50) | No disponible | No disponible | +2,0 pts | -4,0 a +10,0 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor indica que CPU funciona con ~6 GB de RAM en fp32 para el modelo base de 1,5B mas el adaptador.
- GPU recomendadas: no disponible en la informacion; por tamano del modelo base, cualquier GPU con al menos 6-8 GB de VRAM en fp16 seria suficiente, pero no se confirma.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base (1,5B), pero no se declara en la ficha.
- Opciones de despliegue: PEFT + transformers + torch (comando `pip install peft transformers torch && python apply_lora.py`); el autor menciona que GPU es opcional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoganResearch/qwen2.5-1.5b-instruct-distilled | Adaptador LoRA rango 8 sobre 1,5B | No disponible | 84,28 % en TruthfulQA-MC1 (n=617) | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | No disponible en esta ficha | 47,97 % en el mismo panel | Apache-2.0 | Hugging Face |
| Adaptador sham (control del mismo autor) | LoRA rango 8 sobre 1,5B | No disponible | 23,33 % en el mismo panel | Apache-2.0 (mismo repo) | Incluido como control |

No se dispone de datos de benchmarks de otros adaptadores comparables en la informacion proporcionada; la comparativa se limita al modelo base y al control sham del propio autor.

## Limitaciones y advertencias

- Un solo modelo base y un solo adaptador: no se reclama ni implica transferencia entre familias, tamanos o modelos distintos.
- Una sola distribucion de evaluacion: las ganancias se miden en un unico panel held-out de multiple-choice factual; la generacion abierta, otras tareas y otros dominios no se han medido.
- La certificacion de cabezas de lectura no transfiere: cualquier lectura o "hook" certificado para el modelo base se ajusto sobre internals del base y no es valido sobre pesos con adaptador; requiere recertificacion.
- Sin reclamacion de abnegacion ni honestidad: el resultado 4 muestra un cambio de +2,0 puntos con IC que cruza cero; el autor declara explicitamente que no reclama mejora en rechazo ni honestidad.
- Mediciones en CPU fp32: otros runtimes pueden diferir ligeramente.
- Riesgo de alucinacion: no evaluado en generacion abierta; el panel es de opcion multiple, por lo que el comportamiento en texto libre es desconocido.
- Sesgos conocidos: no disponibles en la informacion.
- Limitaciones de contexto o idioma: no disponibles; dependen del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero exige conservar el texto de la licencia, mantener la atribucion y declarar modificaciones; la linea de atribucion indicada es "Uses Qwen2.5-1.5B-Instruct, © 2024 Alibaba Cloud, Apache-2.0."
- Repositorio con 0 descargas y 0 likes: el artefacto es reciente (creado el 2026-11-26) y no cuenta con validacion de la comunidad; la verificacion independiente la realizo el propio lane lead del autor.
- El adaptador no es un modelo autonomo: requiere cargar Qwen/Qwen2.5-1.5B-Instruct y PEFT para funcionar.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/LoganResearch/qwen2.5-1.5b-instruct-distilled
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Script de aplicacion incluido en el repo: `apply_lora.py`
- Protocolo preregistrado: `prereg.md` (sha256 `f4f6b5c57a5d854f6e7acb710d7c902bf527e8812386a03fbbc1e366dba32bf9`)
- Pin del preregistro: `PREREG_PIN.json`
- Resultados machine-readable: `results.json` (sha256 `0f47cc1d63ab88d3776d6a7f1a8f38bf0e59c8bbcc134726e4b56efe73241417`)
- Script de verificacion: `VERIFY.sh` (rc=0, ejecutado el 2026-11-26)
- Licencia: `LICENSE` en el repositorio
