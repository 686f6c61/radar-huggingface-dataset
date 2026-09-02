# Snapkitty/twin-o-matic

## Resumen

Twin-O-Matic (TOM) es un sistema de auto-mejora recursiva presentado por el colectivo Snapkitty, no un modelo de lenguaje convencional. Según su documentación, implementa un bucle de dos niveles: un bucle externo propone actualizaciones de hiperparámetros y un bucle interno las valida mediante una compuerta de entropía que exige H ≤ 0,20 antes de aplicar cualquier cambio de pesos. El resultado se sella en un checkpoint "WORM" (Write Once Read Many) tras cada mejora.

El proyecto se distribuye como un repositorio con código Python (`tom.py`), plantillas de prompts y esquemas JSON, pero no incluye pesos de modelo ni configuraciones de red neuronal. La ficha de HuggingFace lo clasifica como `text-generation` con pipeline compatible con transformers, aunque no se publican parámetros, arquitectura ni datos de entrenamiento. Su relevancia radica más como propuesta conceptual de meta-optimización que como modelo desplegable.

La licencia es "sovereign-source-license-v2", una licencia personalizada que restringe el uso comercial y la redistribución, alineada con la infraestructura "sovereign compute" que Snapkitty promueve. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (bucle de auto-mejora recursiva sin arquitectura de red especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | sovereign-source-license-v2 (licencia personalizada, no OSI) |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

La informacion disponible describe un sistema de dos bucles: un bucle externo que genera propuestas de actualizacion de hiperparametros y un bucle interno que ejecuta esas propuestas tras validarlas. La validacion se basa en una compuerta de entropia que bloquea cualquier actualizacion si la entropia supera 0,20. No se especifica que tipo de modelo subyacente se optimiza, ni el conjunto de datos de entrenamiento, ni el numero de tokens procesados. Tampoco hay detalles sobre tecnicas como RLHF, DPO o decodificacion especulativa. El concepto de "worm-chain" sugiere un encadenamiento de checkpoints inmutables, pero no se aportan detalles tecnicos de implementacion.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo o matematicas como modelo de lenguaje.
- El sistema funciona como un optimizador de hiperparametros recursivo, no como un generador de texto standalone.
- Incluye plantillas de prompts para los bucles interno y externo, pero su uso requiere integrar el codigo en un pipeline propio.
- No hay evidencia de soporte de tool calling, agentes o capacidades multilingues.
- La unica capacidad declarada es la auto-mejora recursiva con sellado WORM.

## Casos de uso

- Investigacion en meta-aprendizaje: el bucle dual puede usarse para estudiar como un sistema se optimiza a si mismo bajo restricciones de entropia, en entornos de laboratorio.
- Experimentacion con compuertas de validacion: el criterio H ≤ 0,20 puede adaptarse a otros sistemas de entrenamiento como mecanismo de control de estabilidad.
- Prototipado de pipelines de auto-mejora: los esquemas JSON y plantillas de prompts sirven como referencia para disenar sistemas similares.
- Auditoria de checkpoints inmutables: el concepto WORM-chain puede inspirar practicas de versionado de modelos en entornos regulados.
- Educacion sobre optimizacion recursiva: el codigo es util para ensenar bucles de retroalimentacion en sistemas de IA.
- Integracion en infraestructura "sovereign compute": Snapkitty lo presenta como parte de su ecosistema, por lo que podria usarse dentro de su plataforma, aunque no hay documentacion publica de como hacerlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas como MMLU, HumanEval o GSM8K para este sistema, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU o CPU.
- Al no incluir pesos de modelo, no requiere hardware de inferencia para funcionar; solo un entorno Python para ejecutar el codigo del bucle.
- Para usar el sistema con un modelo subyacente (si se acopla a uno), los requisitos dependen del modelo elegido.
- No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje servible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en el ecosistema open source que implementen exactamente este esquema de doble bucle con compuerta de entropia y sellado WORM. Los meta-learners clasicos como MAML o los sistemas de busqueda de arquitectura neuronal (NAS) tienen objetivos distintos y no usan este tipo de validacion por entropia.

## Limitaciones y advertencias

- No es un modelo de lenguaje funcional: no puede generar texto ni completar tareas de NLP por si mismo.
- La licencia sovereign-source-license-v2 no es una licencia de codigo abierto reconocida; restringe el uso comercial y la redistribucion, lo que limita su adopcion en produccion.
- No hay documentacion sobre sesgos, alucinaciones o riesgos de seguridad, porque no hay modelo entrenado.
- El codigo no incluye tests ni ejemplos de ejecucion, lo que dificulta su reproduccion.
- La fecha de creacion (2026-09-01) y el numero de descargas (0) sugieren que es un proyecto muy reciente y sin validacion externa.
- El termino "self-improvement" puede inducir a error: no se demuestra que el sistema mejore realmente ningun modelo, solo que propone actualizaciones filtradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Snapkitty/twin-o-matic
- Dataset asociado: https://huggingface.co/datasets/Snapkitty/twin-o-matic
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/twin-o-matic
- Pagina de investigacion de SnapKitty OS: https://collectivekitty.com/papers
