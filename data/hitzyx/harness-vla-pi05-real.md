# HITzyx/harness-vla-pi05-real

## Resumen

Harness VLA es un checkpoint de un modelo vision-lenguaje-accion (VLA) construido sobre la arquitectura pi0.5 y entrenado con datos de robot real. Lo publica el usuario HITzyx en Hugging Face. El modelo incorpora un "ledger" de memoria textual (denominado "scheme C" por el autor), un mecanismo que mantiene un registro en texto que el modelo consulta durante la inferencia. El checkpoint corresponde al paso 10.000 del optimizador con un batch global de 128 (4 dispositivos x 32), entrenado sobre 48.609 filas de datos y con una perdida final de entrenamiento de 0,0041.

El modelo resuelve el problema de control de robots a partir de instrucciones en lenguaje natural y observaciones visuales, es decir, mapea entradas multimodales (imagen y texto) a acciones motoras. La relevancia de este checkpoint es que se ha entrenado con datos de robot real y que incorpora una memoria textual persistente, un enfoque poco habitual en los VLA clasicos, que suelen depender solo del contexto inmediato.

El autor indica que el entrenamiento ha finalizado y que el checkpoint ha superado la validacion de recarga posterior al entrenamiento, pero que aun no se ha evaluado en un robot real. El repositorio ocupa 12,4 GB y contiene los parametros completos de inferencia (unos 13,4 GB), estadisticas de normalizacion, tokenizer y el codigo fuente de politica y datos. No se incluye el estado del optimizador, por lo que el checkpoint es solo para inferencia, no para reanudar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (vision-lenguaje-accion) con memoria textual ("scheme C") |
| Parametros totales | no disponible (pesos de inferencia de unos 13,4 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | parametros completos en `params/` (formato concreto no especificado); incluye `tokenizer.model` y `norm_stats.json` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura pi0.5, un modelo de tipo vision-lenguaje-accion que procesa observaciones visuales e instrucciones textuales para producir acciones de robot. Sobre esta base, el autor anade un "ledger" de memoria textual (esquema C), un registro en texto que el modelo mantiene y consulta, lo que le permite conservar informacion entre pasos de decision mas alla del contexto visual inmediato. El checkpoint incluye el codigo fuente (`policy.py`) necesario para cargar el modelo en inferencia.

El entrenamiento se realizo sobre 48.609 filas de datos de robot real durante 10.000 pasos del optimizador, con un batch global de 128 repartido en 4 dispositivos de 32. La perdida final de entrenamiento fue de 0,0041. No se detalla la composicion del dataset, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO. El autor confirma que el checkpoint paso la validacion de recarga posterior al entrenamiento, pero no se ha evaluado en un robot real, por lo que el rendimiento en despliegue fisico es desconocido.

## Capacidades

- Control de robot a partir de instrucciones en lenguaje natural y observaciones visuales (vision-lenguaje-accion).
- Memoria textual persistente mediante un "ledger" (esquema C) que permite retener informacion entre pasos.
- Inferencia cargable mediante el codigo incluido en `source/policy.py`.
- Normalizacion de acciones y observaciones mediante `norm_stats.json`.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Manipulacion robotica guiada por lenguaje: el modelo recibe una instruccion textual y una imagen del entorno y genera acciones para el robot; es adecuado porque esta entrenado especificamente con datos de robot real.
- Tareas de pick-and-place con memoria: gracias al ledger textual, el modelo puede recordar objetos ya manipulados o posiciones previas durante una secuencia, lo que resulta util en tareas de ensamblaje de varios pasos.
- Investigacion en VLA: sirve como punto de partida para estudiar el efecto de la memoria textual en el control de robots, ya que el autor incluye el codigo de politica y datos.
- Evaluacion de checkpoints intermedios: al estar entrenado 10.000 pasos con perdida de 0,0041, es util para comparar estrategias de memoria frente a VLA sin ledger.
- Prototipado en laboratorio: el checkpoint se puede cargar con `policy.py` para pruebas en simulador o banco de pruebas antes de desplegarlo en un robot real.
- Reproducibilidad de entrenamiento: los archivos `split_manifest.json`, `COMPLETE.json` y `reload_proof.json` permiten verificar la integridad y la particion de datos usada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la perdida final de entrenamiento (0,0041) y confirma que el checkpoint no ha sido evaluado en un robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; los pesos de inferencia ocupan unos 13,4 GB, por lo que en precision completa se necesita al menos esa cantidad mas el overhead de activaciones.
- GPU recomendadas: no disponibles; por tamano de pesos, una GPU con 24 GB o mas (por ejemplo, RTX 4090, A100 40 GB, H100) seria el minimo razonable en precision completa.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en precision completa, aunque no esta confirmado por el autor.
- Opciones de despliegue: carga mediante `source/policy.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria textual | Licencia | Evaluacion en robot real |
|---|---|---|---|---|---|
| Harness VLA (pi0.5) | no disponible (13,4 GB de pesos) | no disponible | Si (ledger, esquema C) | no disponible | No |
| pi0.5 (base) | no disponible | no disponible | No documentada | no disponible | No disponible |
| Alternativas VLA genericas | no disponible | no disponible | No | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El checkpoint no ha sido evaluado en un robot real; su rendimiento fisico es desconocido.
- No se incluye el estado del optimizador, por lo que no se puede reanudar el entrenamiento.
- La licencia no esta especificada, lo que impide confirmar el uso comercial.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion especificos.
- La perdida de entrenamiento baja (0,0041) no garantiza un buen comportamiento en despliegue; puede indicar sobreajuste a los datos de entrenamiento.
- El mecanismo de memoria textual (esquema C) no esta descrito en detalle, lo que dificulta evaluar su robustez.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HITzyx/harness-vla-pi05-real
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
