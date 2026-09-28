# grac-eoka/coca-contrastive70

## Resumen

Coca-contrastive70 es un repositorio publicado por el usuario grac-eoka en HuggingFace que contiene una implementación propia y de tamano reducido de una arquitectura denominada Coca, orientada a aprendizaje contrastivo. No se trata de un modelo entrenado ni de una release lista para producción: la propia model card lo describe explícitamente como un punto de partida reproducible y un checkpoint de inicializacion valido para pruebas de humo (*smoke tests*). El repositorio incluye el código fuente del modelo (`model.py`), la configuracion de arquitectura (`config.json`), una receta de experimento por defecto (`training_args.json`) y un fichero de pesos en formato safetensors.

El dato más relevante es su tamano real: el fichero safetensors contiene 33.088 parametros totales, una cifra extraordinariamente baja que contrasta con la etiqueta "large" que aparece en su propia documentacion. El repo ocupa 0,0 GB, no registra descargas ni *likes*, y no declara ninguna puntuacion de benchmark. Se publica bajo licencia MIT.

Su relevancia actual no radica en el rendimiento, sino en su valor como material de referencia para quien quiera inspeccionar una implementacion concreta de atencion *grouped query*, fusion tipo *concat mlp*, activacion mish y normalizacion rmsnorm, con un recipe de entrenamiento basado en optimizador novograd y un schedule de tipo *step*. Cualquier evaluacion seria requeriría entrenarlo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementacion propia; atencion grouped query, fusion concat mlp) |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (mas implementacion en PyTorch dentro de `model.py`) |

Otros parametros declarados en la model card:

| Parametro | Valor |
|---|---|
| Escala declarada por el autor | large |
| Mecanismo de atencion | grouped query |
| Fusion multimodal | concat mlp |
| Activacion | mish |
| Normalizacion | rmsnorm |
| Optimizador por defecto | novograd |
| Schedule por defecto | step |
| Ficheros del repositorio | `model.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como Coca, con atencion de tipo *grouped query*, un modulo de fusion descrito como *concat mlp*, funcion de activacion mish y normalizacion rmsnorm. La model card no detalla la profundidad, el numero de cabezas, la dimension del modelo ni la composicion del dataset de entrenamiento. Tampoco se especifica si hubo fases de RLHF, DPO u otro ajuste por preferencias: no hay informacion al respecto.

El punto clave es que **no ha habido entrenamiento**. El autor indica de forma explicita que `model.safetensors` es un *initialization checkpoint* valido para pruebas de humo y que no se presenta como un checkpoint entrenado con benchmarks. El repositorio incluye una receta de experimento por defecto (novograd con schedule *step*) que el propio autor describe como "valores de partida en el script, no evidencia de una ejecucion completada". Como implementacion personalizada, no es cargable mediante APIs genericas de carga automatica sin un adaptador explicito.

Merece mencion la incoherencia entre la escala declarada ("large") y el recuento real de parametros (33.088), que corresponde a un modelo del orden de decenas de miles de parametros, no a una variante grande en el sentido habitual del termino.

## Capacidades

- Generacion de texto: no verificada. El checkpoint no ha sido entrenado, por lo que no cabe esperar ninguna capacidad generativa funcional.
- Razonamiento, codigo y matematicas: no disponible; no hay evidencia de ninguna de estas capacidades.
- Aprendizaje contrastivo: la etiqueta del repositorio y el nombre del modelo apuntan a este paradigma de entrenamiento (representaciones por similitud/aprendizaje de pares), pero no se aporta ninguna tarea concreta ni metrica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. No se declara ningun idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible. La presencia de un modulo de fusion *concat mlp* sugiere un posible diseno multimodal, pero no hay confirmacion en la informacion aportada.
- Ejecucion de pruebas de humo: si, el propio autor indica que el checkpoint sirve para inicializar y ejecutar `python model.py --help` y el bloque `__main__` del script.

## Casos de uso

- Estudio de implementaciones propias: el repositorio sirve para leer `model.py`, `config.json` y `training_args.json` y entender como se ensambla una arquitectura con atencion grouped query, mish, rmsnorm y fusion concat mlp. Es material de lectura de codigo, no un modelo para inferencia.
- Punto de partida para un entrenamiento desde cero: el autor propone explicitamente usar el checkpoint como inicializacion y la receta novograd + schedule step como configuracion de arranque, ajustando despues datos y presupuesto de *tuning*.
- Reproduccion de experimentos contrastivos: dado que el repositorio esta orientado a aprendizaje contrastivo, puede emplearse como base para montar un *pipeline* de pares positivos/negativos y medir la metrica de tarea sobre un conjunto de validacion reservado.
- Comparativa de recetas de optimizacion: permite contrastar novograd frente a otros optimizadores manteniendo constante la arquitectura, siempre que se igualen datos, presupuesto de ajuste y semillas.
- Pruebas de humo en CI: al ser un checkpoint de inicializacion diminuto, puede integrarse en tests automatizados que verifiquen que el modelo instancia, carga y ejecuta un *forward pass* sin errores antes de escalar a configuraciones mayores.
- Docencia y prototipado rapido de arquitecturas: su tamano (33.088 parametros) permite ejecutarlo en cualquier maquina, incluso sin GPU, lo que lo hace util para explicar conceptos de atencion agrupada o fusion por concatenacion sin coste de computo.
- Auditoria de artefactos de HuggingFace: sirve como ejemplo de repositorio que declara honestamente la ausencia de entrenamiento y de benchmarks, util en discusiones sobre trazabilidad de releases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card afirma de forma explicita: "No benchmark score is claimed in this repository". Cualquier cifra de MMLU, HumanEval, GSM8K u otras metricas seria inventada y no se incluye.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33.088 parametros, el peso ocupa aproximadamente 132 KB en fp32 y 66 KB en fp16, calculado a partir del recuento real de parametros. El consumo queda dominado por el *runtime* de PyTorch, no por el modelo.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA sirve; el modelo cabe holgadamente en cualquier tarjeta consumer, incluida una RTX 3060 o inferior, y tambien en CPU.
- Cabe en GPU consumer: si, en la practica totalidad. El cuello de botella sera el *overhead* de Python y de PyTorch, no la memoria.
- Opciones de despliegue: al ser una implementacion personalizada, no es compatible de forma directa con vLLM, llama.cpp, Ollama o TGI. La via indicada por el autor es ejecutar el script propio: `python model.py --help`.
- Latencia y throughput estimados: no disponible. No hay datos medidos ni publicados, y un modelo sin entrenar no tiene sentido medirlo en terminos de calidad de salida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria ni de tamano equivalente, y la condicion de checkpoint de inicializacion sin entrenar hace que cualquier comparacion de rendimiento carezca de base. La unica referencia objetiva es el recuento de parametros (33.088) y el formato de pesos (safetensors), insuficientes para establecer una comparativa significativa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. No produce ninguna funcionalidad util en inferencia directa.
- No ha sido auditado en robustez, equidad (*fairness*) ni transferencia de dominio, segun reconoce el propio autor.
- No se reclama ninguna puntuacion de benchmark, por lo que no hay evidencia de rendimiento de ningun tipo.
- No se declaran idiomas soportados; no cabe asumir cobertura multilingue.
- No se especifica la longitud de contexto, por lo que no puede planificarse ningun caso de uso que dependa de ventanas largas.
- Al ser una implementacion personalizada, no es cargable con APIs automaticas genericas de HuggingFace sin escribir un adaptador especifico.
- Incoherencia documentada: el autor etiqueta la escala como "large" mientras que el fichero safetensors contiene 33.088 parametros. Conviene verificar cualquier afirmacion de escala en futuras revisiones del repositorio.
- Sin datos de dataset: no se conoce la procedencia ni las condiciones de los datos de entrenamiento previstos. El autor advierte de revisar aparte los terminos de las fuentes externas si se usan datasets de terceros.
- Licencia: MIT, permisiva y compatible con uso comercial del codigo y de los pesos siempre que se conserve el aviso de copyright. No obstante, el valor comercial del artefacto es practicamente nulo al no estar entrenado.
- En produccion: no apto. No debe desplegarse como componente de ningun sistema real en su estado actual.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/grac-eoka/coca-contrastive70
- No se han encontrado en la informacion proporcionada otros enlaces (papers, blogs, repositorios de codigo o demos) asociados a este modelo.
