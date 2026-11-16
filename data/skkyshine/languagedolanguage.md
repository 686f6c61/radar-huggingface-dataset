# skkyshine/LanguageDoLanguage

## Resumen

LanguageDoLanguage es un repositorio de checkpoints de modelos vision-lenguaje-accion (VLA) publicados por el usuario skkyshine en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una coleccion de ajustes finos (fine-tuning) de dos familias de modelos VLA preexistentes, SimVLA y VLA-Adapter-Pro, realizados sobre grabaciones reales de un robot ejecutando una unica tarea: recoger una esponja, transportarla y soltarla. El repositorio agrupa cuatro checkpoints principales (RS-S0, RS-B9, VA-S0 y VA-B9) y siete checkpoints adicionales de ejecuciones posteriores.

El interes del artefacto es fundamentalmente practico y de investigacion en robotica: ilustra el flujo de trabajo de adaptar modelos VLA preentrenados en simulacion (LIBERO) a datos reales de un robot concreto, y documenta los artefactos necesarios para servir esos checkpoints mediante Docker. El repositorio incluye los pesos en formato safetensors, los registros de entrenamiento (`args.json`), las estadisticas de normalizacion de acciones y los modelos base liberados sin modificar (SmolVLM-500M-Instruct y VLA-Adapter-LIBERO-Object-Pro), todo empaquetado en un unico conjunto de aproximadamente 41 GB.

La relevancia es limitada fuera de ese contexto: no es un modelo de proposito general, no soporta generacion de texto libre y no puede servirse a partir de este repositorio por si solo, ya que el codigo del servidor, el cliente del robot y los datos de entrenamiento no estan incluidos. Debe evaluarse como un conjunto de pesos de investigacion para una tarea robotica muy especifica, no como un modelo desplegable de forma autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA); checkpoints derivados de SimVLA y VLA-Adapter-Pro |
| Parametros totales | no disponible (el modelo base SmolVLM-500M-Instruct sugiere 500M en la rama SimVLA; no confirmado para el conjunto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los checkpoints pertenecen a la categoria de modelos vision-lenguaje-accion, que combinan un codificador visual, un modelo de lenguaje y una cabeza de prediccion de acciones para controlar un robot a partir de observaciones e instrucciones. El repositorio contiene dos linajes: los checkpoints RS-* parten de YuankaiLuo/SimVLA-LIBERO (que carga SmolVLM-500M-Instruct como componente de lenguaje) y los VA-* parten de VLA-Adapter/LIBERO-Object-Pro. Ambos modelos base fueron preentrenados en el entorno simulado LIBERO y aqui se ajustan finamente sobre grabaciones reales de una unica tarea de manipulacion.

Cada ejecucion de ajuste fino duro 3.000 pasos. Los checkpoints servidos en `docker/README.md` corresponden a pasos intermedios de esas mismas ejecuciones (paso 500, y paso 1.000 en VA-S0), mientras que los `ckpt-3000` son el ultimo checkpoint de cada ejecucion. Las variantes S0 y B9 difieren en los datos de entrenamiento y en las entradas que esperan; cada ejecucion registra su configuracion en `args.json`. Las ejecuciones posteriores (sufijo g2 y g3) anaden variantes como RS-B9-g3, RS-B9-g3w y RS-B9-g3k, que esperan entradas distintas y, en el caso de las g3, leen sus estadisticas de normalizacion de `g3/rs_norm_g3.json`. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Control robotico visomotor: prediccion de acciones a partir de observaciones visuales e instrucciones para la tarea de recoger, transportar y soltar una esponja.
- Ajuste fino sobre datos reales: los checkpoints estan adaptados a grabaciones de un robot fisico, no solo a simulacion.
- Integracion con dos familias VLA: permite comparar el comportamiento de SimVLA y VLA-Adapter-Pro sobre la misma tarea.
- Servicio mediante contenedores Docker: el repositorio incluye los archivos de construccion de dos imagenes de servidor, una por familia de modelo.
- Verificacion de integridad: script `make_assets.py --verify` que comprueba tamano y sha256 de cada archivo contra `MANIFEST.json`.
- Generacion de texto libre: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modo thinking: solo vision como entrada para el control robotico; no consta audio ni modo thinking.

## Casos de uso

- Investigacion en adaptacion sim-a-real: usar los checkpoints RS-* y VA-* para estudiar como se transfiere un modelo VLA preentrenado en LIBERO a grabaciones reales de una tarea concreta, comparando el rendimiento de ambas familias bajo el mismo protocolo.
- Reproduccion de experimentos de ajuste fino: los registros `args.json` y las estadisticas de normalizacion permiten reconstruir las condiciones de entrenamiento de cada ejecucion y replicar el proceso con nuevos datos.
- Evaluacion comparativa de arquitecturas VLA: al compartir tarea y datos, los pares RS-S0/VA-S0 y RS-B9/VA-B9 permiten comparar SimVLA frente a VLA-Adapter-Pro en igualdad de condiciones.
- Despliegue de referencia con Docker: los archivos de `docker/` sirven como plantilla para levantar un servidor de inferencia VLA en un entorno contenedorizado, siempre que se disponga del codigo de servidor externo.
- Docencia y demostraciones de robotica: el conjunto, con modelos base incluidos y verificacion de integridad, es util para practicas guiadas sobre pipelines VLA completos.
- Auditoria de artefactos de entrenamiento: el `MANIFEST.json` y `THIRD_PARTY_NOTICES.md` facilitan la trazabilidad de fuentes, revisiones y licencias declaradas de los modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El componente de lenguaje de la rama SimVLA (SmolVLM-500M-Instruct) es pequeno, pero el conjunto incluye codificadores visuales y cabezas de accion cuyo consumo no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: contenedores Docker construidos a partir de `docker/` (una imagen por familia de modelo); requiere codigo de servidor externo no incluido en el repositorio.
- Latencia y throughput: no disponible.
- Almacenamiento: la descarga completa ocupa aproximadamente 41 GB y debe hacerse con `--local-dir` para evitar enlaces simbolicos que no resuelven dentro de un contenedor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LanguageDoLanguage (este repo) | no disponible | no disponible | VLA para tarea unica de esponja | no disponible | Pesos en HF; servidor no incluido |
| YuankaiLuo/SimVLA-LIBERO | no disponible | no disponible | VLA preentrenado en LIBERO | no disponible | Modelo base en HF |
| VLA-Adapter/LIBERO-Object-Pro | no disponible | no disponible | VLA preentrenado en LIBERO | no disponible | Modelo base en HF |
| SmolVLM-500M-Instruct | 500M | no disponible | Vision-lenguaje | no disponible | Modelo base en HF, incluido sin cambios |

## Limitaciones y advertencias

- El repositorio no es autonomo: el codigo del servidor, el cliente del robot y los datos de entrenamiento no estan incluidos, por lo que los checkpoints no pueden servirse solo con este repositorio.
- La tarea es unica y muy especifica (recoger, transportar y soltar una esponja); no hay evidencia de generalizacion a otras tareas u objetos.
- Los checkpoints con sufijo g2 y g3 esperan entradas distintas y el servidor de `docker/README.md` los rechaza; requieren servidores que no estan en el repositorio.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Idiomas soportados no disponibles; no consta comportamiento multilingue.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al tratarse de control robotico, los fallos se manifiestan como acciones incorrectas, no como texto.
- Los checkpoints servidos son intermedios (pasos 500 o 1.000) de ejecuciones de 3.000 pasos, no necesariamente los de mejor rendimiento.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa conocida.
- La verificacion de integridad exige la descarga completa; tras una descarga parcial el script reporta todos los archivos ausentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skkyshine/LanguageDoLanguage
- Modelo base SimVLA: https://huggingface.co/YuankaiLuo/SimVLA-LIBERO
- Modelo base VLA-Adapter-Pro: https://huggingface.co/VLA-Adapter/LIBERO-Object-Pro
