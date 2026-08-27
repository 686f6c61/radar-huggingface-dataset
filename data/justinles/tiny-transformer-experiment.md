# justinles/tiny-transformer-experiment

## Resumen

El modelo `justinles/tiny-transformer-experiment` es un prototipo de investigación de un transformer en miniatura orientado a tareas de retrieval, desarrollado por el usuario justinles. Con apenas 16.576 parámetros, se trata de un modelo de escala "nano" cuyo propósito principal es documentar formatos de configuración, arquitectura y flujos de entrenamiento para experimentos controlados, no servir como modelo de producción. Su relevancia radica en que permite estudiar el comportamiento de arquitecturas transformer a una escala mínima, facilitando análisis de ablación y pruebas de concepto sin necesidad de recursos computacionales significativos.

La arquitectura emplea atención dilatada, fusión mediante concatenación con MLP, activación GELU con tanh y normalización ScaleNorm. El checkpoint incluido es de inicialización, no entrenado, y la configuración por defecto usa el optimizador LAMB con programación coseno. No se declara longitud de contexto ni idiomas soportados, y el repositorio no presenta resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (nano) con atencion dilatada, fusion concat mlp, activacion gelu tanh, normalizacion scalenorm |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un transformer de escala nano con atención dilatada, una variante que expande el campo receptivo sin aumentar el número de parámetros. La fusión de características se realiza mediante concatenación seguida de un MLP, y la activación combina GELU con tanh. La normalización emplea ScaleNorm, una alternativa a LayerNorm que escala las activaciones sin restar la media. El checkpoint `model.safetensors` es un estado de inicialización válido para pruebas de humo, no un modelo entrenado. La configuración de entrenamiento por defecto utiliza el optimizador LAMB con un programación de tasa de aprendizaje coseno, pero no hay evidencia de una ejecución completa. No se especifican datos de entrenamiento ni número de tokens.

## Capacidades

- Generacion de texto: no disponible, el modelo no esta entrenado.
- Razonamiento: no disponible, al ser un checkpoint de inicializacion.
- Codigo: no disponible.
- Matematicas: no disponible.
- Vision: no disponible, aunque la evaluacion sugerida usa Flickr30k (dataset de imagenes con texto), el modelo no tiene componentes de vision.
- Tool calling / function calling: no disponible.
- Agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: el modelo sirve como punto de partida para experimentos de retrieval; su tamano minimo permite pruebas rapidas de integracion y validacion de formatos.

## Casos de uso

- Investigacion academica sobre arquitecturas minimas: el modelo permite estudiar el efecto de la atencion dilatada y ScaleNorm en tareas de retrieval con un coste computacional despreciable, facilitando experimentos de ablacion con multiples semillas.
- Pruebas de integracion de pipelines de entrenamiento: al ser un checkpoint de inicializacion valido, se puede usar para verificar que el codigo de entrenamiento (finetune.py) funciona correctamente antes de lanzar experimentos con modelos mayores.
- Validacion de formatos de checkpoint y configuracion: el repositorio incluye config.json y training_args.json, utiles para comprobar la compatibilidad de herramientas de carga y guardado de pesos en safetensors.
- Ensenanza de transformers: por su tamano minimo, es adecuado para demostrar el funcionamiento interno de un transformer en cursos o talleres, permitiendo inspeccionar capas y atencion sin requerir hardware especializado.
- Prototipado rapido de ideas de retrieval: se puede modificar la arquitectura y probar hipotesis sobre fusion de caracteristicas o normalizacion en un ciclo de iteracion corto.
- Benchmark de referencia para comparar con otros tiny transformers: al no estar entrenado, sirve como baseline de capacidad minima para futuros checkpoints entrenados con el mismo codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no esta entrenado y que no se reclama ninguna puntuacion. La evaluacion sugerida en la model card es usar Flickr30k con al menos tres semillas y una baseline de capacidad comparable, pero no se proporcionan datos numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB, el modelo cabe en cualquier CPU o GPU moderna.
- GPU recomendadas: ninguna especifica; se puede ejecutar en CPU.
- Compatibilidad con GPU de consumo: si, cualquier GPU con al menos 1 GB de VRAM es mas que suficiente.
- Opciones de despliegue: al ser un modelo PyTorch personalizado, requiere un adaptador explicito para APIs de carga genericas; se puede ejecutar con Python directamente o integrar en scripts de prueba.
- Latencia y throughput: no disponibles, pero al tener 16.576 parametros, la inferencia es practicamente instantanea en cualquier hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoria. Existen otros tiny transformers en la literatura, como el de skolouri/TinyTransformer (enfocado en matematicas de IA) o el de zyx100089-eng/tiny-transformer (entrenado a nivel de caracteres), pero no se conocen sus parametros exactos ni sus resultados. La comparativa no esta disponible por falta de informacion publica sobre estos modelos.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; es solo un punto de partida experimental.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera texto.
- Limitaciones de contexto o idioma: no se especifican, pero al no estar entrenado, no tiene capacidad linguistica real.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero se debe revisar los terminos de los datasets externos si se usan con este modelo.
- Para produccion: no es adecuado para ningun caso de uso real; es exclusivamente un prototipo de investigacion.
- La implementacion es personalizada, por lo que las APIs de carga genericas (como `transformers`) no funcionan sin un adaptador explicito.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/justinles/tiny-transformer-experiment
- GitHub skolouri/TinyTransformer (matematicas de IA): https://github.com/skolouri/TinyTransformer
- Paper sobre protorazonamiento en tiny transformers (arXiv): https://arxiv.org/abs/2608.04980
- GitHub zyx100089-eng/tiny-transformer (implementacion desde cero): https://github.com/zyx100089-eng/tiny-transformer
- Blog sobre construccion de tiny transformers desde cero: https://buildml.substack.com/p/building-a-tiny-transformer-from
