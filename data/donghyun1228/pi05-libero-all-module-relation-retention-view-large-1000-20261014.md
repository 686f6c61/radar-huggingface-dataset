# Donghyun1228/pi05-libero-all-module-relation-retention-view-large-1000-20261014

## Resumen

El modelo `Donghyun1228/pi05-libero-all-module-relation-retention-view-large-1000-20261014` es un checkpoint experimental de un modelo de vision-lenguaje-accion (VLA) orientado a manipulacion robotica, construido sobre la libreria openpi (familia pi05 desarrollada por el equipo de Physical Intelligence). Se trata de un artefacto de investigacion de un autor individual, no de un modelo de produccion: corresponde a la rama "all-module relation / view_large / retention" tras 1000 actualizaciones de optimizador, exportado con parametros crudos (no EMA) y con los activos de normalizacion originales.

El checkpoint no es un modelo entrenado desde cero, sino un ajuste (adaptacion) sobre una politica de manipulacion preexistente. La inicializacion real uso una fuente local legacy `native51`; el repositorio `Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013` se describe como una referencia de despliegue equivalente en forma canonica, no como la entrada real de inicializacion. El propio autor advierte de que este checkpoint individual no establece por si mismo retencion de la politica.

Los datos objetivo de entrenamiento provienen de `Donghyun1228/libero-dense-contact-sweep-d2-20261002`, con evaluacion sobre 40 tareas x 10 episodios en el entorno LIBERO con semilla 17. La relevancia actual es acotada: sirve como pieza de un estudio comparativo de objetivos de retencion y coherencia de flujo (IDM, lambda=1) en politicas VLA, no como modelo listo para uso general. La licencia, los idiomas y el recuento total de parametros no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en openpi / pi05 (vision-lenguaje-accion con flujo; modulos vision, LLM y expert) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se exportan mezclas de precision FP32 y BF16 (vision23, LLM9 y expert11 en FP32; native frozen8 y source wrist23 en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (exportado con la libreria openpi; repositorio de 13,1 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de VLA openpi (pi05), que combina un codificador de vision, un modelo de lenguaje y un modulo "expert" que produce las acciones de manipulacion. En este checkpoint concreto se distinguen subconjuntos de parametros denominados vision23, LLM9, expert11, native frozen8 y source wrist23, lo que indica una composicion modular con partes congeladas y partes entrenables. Los modulos entrenables (vision, LLM y expert) se exportan en FP32, mientras que los componentes congelados nativos y de muneca (wrist) se mantienen en BF16.

El entrenamiento se describe como un experimento de retencion de modulo completo ("all-module relation"). La rama de retencion usa un unico coeficiente compartido lambda=1, y el control escalar preserva la direccion y los momentos de Adam del IDM mientras iguala la norma de la propuesta candidata para un mismo estado. El objetivo declarado es la manipulacion transferible, y el propio autor senala que la perdida de IDM no es su metrica de exito. El profesor destilado (teacher) combina la vision actual con el LLM y el expert preentrenados. El objetivo de relacion utiliza una estimacion de flujo principal de un solo paso con t=1, no el sampler completo, y la invariancia de Gram permite reflexiones. No entran en el entrenamiento observaciones de origen, cache de salida de origen ni retroalimentacion de exito; las instrucciones objetivo existentes condicionan la politica.

## Capacidades

- Generacion de acciones de manipulacion robotica condicionadas por instrucciones en lenguaje natural (politica VLA sobre el benchmark LIBERO).
- Percepcion visual y procesamiento de lenguaje integrados para traducir instrucciones a comportamiento motor.
- Ejecucion en MuJoCo 3.2.3 (entorno de evaluacion declarado), con restauracion en BF16 mediante `pi05_libero_source_free_split_vision_idm`.
- Inferencia por servidor con peticiones que comparten un flujo RNG (8 clientes por GPU segun la configuracion de evaluacion).
- Capacidades de tool calling, function calling, agentes, multi-step reasoning, thinking mode, audio o vision general: no disponibles (es un checkpoint de robotica, no un LLM de proposito general).

## Casos de uso

- Investigacion en aprendizaje por imitacion para robotica: permite reproducir el experimento de "all-module relation / retention" y compararlo con las ramas de control (fija y escalar) del mismo estudio.
- Evaluacion de objetivos auxiliares (IDM) en politicas VLA: sirve para analizar si un objetivo de coherencia de flujo afecta a la retencion de una politica de manipulacion preexistente.
- Estudios de transferencia de politica entre entornos: al usar datos objetivo `libero-dense-contact-sweep-d2` y evaluacion LIBERO, es util para medir transferencia hacia tareas de contacto denso.
- Benchmarking de configuraciones de precision mixta (FP32/BF16): util para estudiar el efecto de congelar o entrenar modulos concretos (vision, LLM, expert) en el rendimiento.
- Analisis de inicializacion y equivalencia canonica: el propio autor documenta una fuente legacy `native51` y una referencia equivalente (`source-split74`), lo que permite auditar reproducibilidad de pesos.
- Reproduccion de protocolos de evaluacion estandarizados: 40 tareas x 10 episodios con semilla de entorno 17, util para comparar de forma controlada entre checkpoints de la misma serie.
- No se recomienda su uso en produccion robotica real, al ser un checkpoint experimental sin evaluacion de exito declarada y de un autor individual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe un protocolo de evaluacion (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3) e indica que el JSON de evaluacion conserva los resultados reales, pero no incluye cifras concretas. El autor advierte expresamente que "este checkpoint individual no establece retencion" y que ninguna puntuacion de entorno de origen debe interpretarse como retencion de manipulacion.

## Requisitos de hardware

- El repositorio ocupa 13,1 GB, lo que da una cota inferior aproximada del espacio en disco y memoria necesarios para cargar los pesos completos; el reparto real de precision (FP32 en vision23, LLM9 y expert11) aumentaria la huella respecto a un equivalente todo-BF16.
- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa, cargar pesos en el rango de decenas de GB en FP32 excederia GPUs de consumo; se requeriria al menos una GPU profesional. Este calculo es una estimacion, no un dato declarado.
- GPUs recomendadas: no disponible. La evaluacion menciona multiples clientes por GPU con MuJoCo, lo que sugiere uso de GPUs de centro de datos (por ejemplo, clase A100/H100), pero el autor no especifica modelos.
- Cabe en GPU de consumo: no disponible; por el tamano del repositorio y las precisiones empleadas, es poco probable en GPUs de consumo con VRAM limitada.
- Opciones de despliegue: libreria openpi (inferencia `pi05_libero_source_free_split_vision_idm`), con restauracion en BF16. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VLA de este tipo).
- Latencia y throughput: no disponibles. La configuracion de evaluacion usa 8 clientes por GPU y MuJoCo 3.2.3, pero no se aportan cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Donghyun1228/pi05-libero-all-module-relation-retention-view-large-1000-20261014` | VLA openpi (rama relation/retention) | no disponible | no disponible | HuggingFace, 0 descargas |
| `Donghyun1228/pi05-main-policy-retention-view-large-lambda1-1000-20261013` | VLA openpi (fuente libre, lambda=1) | no disponible | no disponible | HuggingFace |
| `Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011` | VLA openpi (IDM solo objetivo) | no disponible | no disponible | HuggingFace |
| openpi / pi05 (Physical Intelligence) | VLA base preentrenado en 10k+ horas de datos de robot | no disponible | no disponible | GitHub (Physical-Intelligence/openpi), openpi.net |

No se dispone de cifras comparativas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental de autor individual, con 0 descargas y 0 likes, sin senal de validacion por la comunidad.
- El autor afirma explicitamente que este checkpoint individual no establece retencion de la politica; no debe interpretarse como evidencia de mejora.
- La perdida de IDM no es la metrica de exito declarada, por lo que no debe usarse como indicador de calidad de manipulacion.
- Las peticiones de politica comparten un flujo RNG de servidor y no estan emparejadas por episodio, lo que complica comparaciones finas entre checkpoints.
- Las instrucciones objetivo existentes condicionan la politica, lo que puede limitar la generalizacion fuera de esas instrucciones.
- La inicializacion real uso una fuente local legacy; la referencia "canonica equivalente" no es la entrada real de inicializacion, lo que puede afectar a la reproducibilidad exacta.
- Licencia no declarada: no hay base clara para uso comercial.
- Idiomas soportados no disponibles; es un modelo de accion robotica, no un generador de texto multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican consideraciones generales de los VLA entrenados con datos de demostracion.
- No apto para produccion robotica real sin validacion adicional y sin datos de exito declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-retention-view-large-1000-20261014
- Checkpoint relacionado (main-policy-retention-view-large-lambda1-1000): https://huggingface.co/Donghyun1228/pi05-main-policy-retention-view-large-lambda1-1000-20261013
- Checkpoint relacionado (source-free-raw-common-vision-yaw30-1000): https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011
- Repositorio openpi05 (fork con ejemplos LIBERO): https://github.com/Integer003/openpi05/tree/main/examples/libero
- Ejemplos LIBERO en openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/README.md
- Sitio de OpenPI: https://www.openpi.net/english.html
