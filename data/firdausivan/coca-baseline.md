# firdausivan/coca-baseline

## Resumen

coca-baseline es un repositorio publicado por el usuario firdausivan que contiene una implementación propia y reducida de una arquitectura denominada Coca, orientada a tareas de matching, junto con un checkpoint de inicialización y su configuración asociada. No se trata de un modelo entrenado ni de un lanzamiento con resultados validados: el propio autor indica explícitamente que la variante tiny es un punto de partida reproducible para experimentación y que el fichero `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests).

El repositorio incluye `eval.py` como artefacto principal, `config.json` con los ajustes de arquitectura, `training_args.json` con la receta de experimento por defecto y `README.md` con la documentación. La arquitectura declarada combina atención multi-query, fusión de tensores, activación mish y normalización layernorm, con una escala tiny. El dato de safetensors reporta 16.576 parámetros (la información disponible no especifica la unidad, por lo que no puede confirmarse si son miles o millones).

Su relevancia es acotada y de carácter metodológico: sirve como andamiaje reproducible para investigadores que quieran montar comparativas de matching con presupuesto de ajuste equivalente, semillas controladas y una línea base de capacidad emparejada. No es un modelo desplegable en producción ni existen métricas publicadas que respalden su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementación propia) |
| Parametros totales | 16.576 segun safetensors (unidad no especificada en la informacion disponible; el autor la describe como escala "tiny") |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion) |

Otros datos tecnicos declarados por el autor: atención multi-query, fusión por tensor fusion, activación mish, normalización layernorm, optimizador lion y scheduler exponencial.

## Arquitectura y entrenamiento

La arquitectura se describe como Coca, una implementación personalizada que no debe confundirse automáticamente con otras arquitecturas homónimas. Los componentes declarados son atención multi-query, mecanismo de fusión de tensores, función de activación mish y normalización layernorm, todo ello en una escala tiny. El repositorio no detalla el número de capas, dimensiones ocultas ni el tamaño del vocabulario en la información disponible.

No ha habido entrenamiento efectivo. El autor especifica que el checkpoint incluido es de inicialización y que no se presenta como un checkpoint entrenado con benchmarks. La receta por defecto de `training_args.json` emplea el optimizador lion con un schedule exponencial, pero el propio README advierte de que son valores de arranque del script y no evidencia de una ejecución completada. Tampoco se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO u otro ajuste por preferencias. La única guía metodológica aportada es que una evaluación útil debería usar un conjunto de validación emparejado, reportar la métrica de la tarea en al menos tres semillas e incluir una línea base de capacidad emparejada.

## Capacidades

- Generación de texto: no disponible; el repositorio no documenta capacidades generativas ni decodificación.
- Razonamiento, código y matemáticas: no disponible; no se declaran ni se evalúan.
- Visión: no disponible; pese a la etiqueta "coca", el README no describe torre visual ni entrada de imágenes.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad efectiva verificada: servir como checkpoint de inicialización para pruebas de humo y como esqueleto de implementación para tareas de matching. El autor indica que, al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso.
- Capacidad especial: ninguna declarada (ni modo thinking, ni audio, ni decodificación especulativa).

## Casos de uso

- Pruebas de humo de integración: cargar `model.safetensors` y ejecutar `eval.py --help` para verificar que el entorno, las dependencias y la configuración funcionan antes de invertir cómputo en un entrenamiento real.
- Integración continua en pipelines de investigación: usar el checkpoint de inicialización como fixture determinista en tests de CI que comprueben que los cambios en el código del modelo no rompen las formas de los tensores ni la interfaz de carga.
- Línea base de capacidad emparejada en experimentos de matching: emplear esta configuración tiny como referencia de escala reducida frente a modelos mayores, manteniendo la misma exposición de datos, presupuesto de ajuste y semillas, tal como recomienda el propio autor.
- Estudio de ablaciones de arquitectura: al tener componentes explícitos y aislados (atención multi-query, tensor fusion, mish, layernorm), permite modificar un elemento cada vez y medir su efecto sobre la métrica de la tarea con un coste de cómputo bajo.
- Material docente y de aprendizaje: sirve para ilustrar en un curso o taller cómo se estructura un repositorio reproducible (configuración, receta de entrenamiento, script de evaluación y pesos separados).
- Desarrollo de adaptadores de carga: dado que las APIs automáticas no funcionan directamente, es un caso práctico para implementar y probar adaptadores de carga personalizados hacia frameworks propios.
- Prototipado rápido en CPU: por su escala tiny, permite iterar sobre el código de evaluación y de fusión sin depender de GPU, reservando el cómputo acelerado para ejecuciones ya validadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado, por lo que no existe una tabla de MMLU, HumanEval, GSM8K ni de métricas de matching que pueda reproducirse aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 16.576 parámetros reportados (unidad sin confirmar) y un repositorio de 0,0 GB, el checkpoint es de tamaño despreciable y, en la práctica, cabe en memoria de CPU.
- GPU recomendadas: ninguna en concreto. Para un modelo de esta escala no se requiere GPU; cualquier GPU consumer serviría si se quisiera forzar ejecución acelerada.
- Cabe en GPU consumer: sí, con enorme holgura, dado el tamaño del checkpoint. No se dispone de cifras de VRAM medidas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito, por lo que el despliegue estándar no está soportado tal cual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría, y el propio repositorio no se posiciona frente a alternativas ni aporta métricas que permitan una comparación cuantitativa. Cualquier comparación con arquitecturas homónimas o con modelos de matching de escala similar carecería de base en los datos disponibles.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no debe usarse para inferencia real ni para producir resultados presentables como rendimiento del modelo.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, tal como reconoce el autor.
- No existen benchmarks publicados; cualquier afirmación de calidad sería infundada.
- La unidad del recuento de parámetros (16.576) no está especificada, lo que impide calcular con precisión requisitos de memoria o coste de entrenamiento.
- Idiomas soportados no disponibles: no puede garantizarse cobertura multilingüe ni comportamiento correcto en castellano.
- Longitud de contexto no disponible: se desconoce la ventana máxima manejable.
- Compatibilidad de carga limitada: al ser una implementación propia, las APIs genéricas necesitan un adaptador explícito, lo que añade trabajo de integración.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se combina con conjuntos de datos externos.
- Los pesos inicializados aleatoriamente pueden producir salidas degeneradas; no interpretar ninguna salida como resultado válido.
- Las fechas de creación y actualización del repositorio reflejadas en los metadatos son posteriores a la fecha actual, un dato a verificar en la ficha de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/firdausivan/coca-baseline
- Repositorio (ficheros declarados): `eval.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors`
- Paper, blog, repositorio de código o demo adicionales: no disponibles
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos (foros y páginas de consulta general sin relación con el repositorio) no se incluyen por no ser pertinentes.
