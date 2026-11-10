# RainyBot/SemWAM-RealRobot-PackPhone-v1

## Resumen

SemWAM Real Robot — Pack Phone v1 es un checkpoint especifico de tarea del modelo SemWAM, publicado por RainyBot. SemWAM es un modelo mundo-accion (world-action model) que predice conjuntamente acciones de robot y representaciones futuras de RGB, profundidad y semantica a partir de observaciones actuales de camara, una instruccion en lenguaje natural y el estado del robot. Este checkpoint concreto esta entrenado para la tarea "Pack Phone" (empaquetado de telefonos) sobre un brazo robotico bimanual.

El modelo pertenece a la familia de vision-language-action (VLA) con world model, una linea de investigacion que busca dotar a los robots de capacidad predictiva del entorno para mejorar la planificacion motora. La release corresponde al paso de optimizador 6240, el checkpoint final de un entrenamiento completado, con verificacion de integridad realizada el 2026-11-10. El repositorio ocupa 14,6 GB y se distribuye bajo licencia MIT.

Es relevante para investigadores que trabajan en modelado multimodal mundo-accion y en integracion con interfaces de robot real. No obstante, el autor advierte explicitamente que el entrenamiento completado no establece una tasa de exito en robot real: la release no reclama rendimiento en bucle cerrado ni resultados estado del arte. Se trata, por tanto, de un artefacto de investigacion reproducible, no de un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SemWAM v2 (transformer multimodal con world model; `rgb_dep_sem`, atencion `rgb_auxiliary_causal`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en `step_006240.pt`) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), no es un paquete `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SemWAM v2 con identificador `rgb_dep_sem`, un layout de atencion `rgb_auxiliary_causal` y condicionamiento de accion `predicted_depth_head_semantic`. Utiliza tres vistas RGB (camara principal, muneca izquierda y muneca derecha) y predice acciones junto con representaciones futuras de RGB, profundidad y semantica. La profundidad se representa mediante un DVae y se estima a partir de la RGB actual; la condicion de profundidad usa contexto temporal de fotograma actual, mientras que los objetivos de profundidad provienen del dataset. Las proyecciones de profundidad y semantica son independientes.

El entrenamiento se completo hasta el paso de optimizador 6240, con los ocho lanzadores de nodo originales finalizados con exito. La release incluye el compresor semantico congelado y las estadisticas de normalizacion de acciones y estado. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El codigo fuente esta en el repositorio `RainyRobo/SemWAM`, con checkout de empaquetado `19d1247e24e1990a7aac99fbd5cddd674771df9a`, que contenia cambios locales y no garantiza reproducir exactamente el codigo de entrenamiento.

## Capacidades

- Prediccion conjunta de acciones de robot y representaciones futuras (RGB, profundidad y semantica) a partir de observaciones actuales.
- Control bimanual con interfaz de pose de efector final: estado y acciones de 16 valores `[left xyz, left quaternion xyzw, left gripper, right xyz, right quaternion xyzw, right gripper]`.
- Representacion interna de 20 dimensiones (posicion, rotacion 6D y gripper); estado absoluto y acciones como transformaciones SE(3) relativas con gripper absoluto.
- Horizonte de accion de 32 pasos, con postprocesado que debe preservar el horizonte completo y deshacer la normalizacion afin empaquetada.
- Condicionamiento por instruccion en lenguaje natural (en ingles).
- Entrada multimodal de tres vistas RGB con geometria de camara definida en `inference_config.json`.
- No incluye driver de robot llave en mano; requiere integracion con una interfaz de robot real compatible.

## Casos de uso

- Investigacion en modelado mundo-accion: el checkpoint permite reproducir experimentos de prediccion conjunta de acciones y representaciones futuras, comparando el comportamiento del world model con variantes propias.
- Empaquetado de telefonos en laboratorio: la tarea especifica "Pack Phone" sirve como banco de pruebas para estudiar manipulacion bimanual de precision con objetos rigidos.
- Estudio de representaciones semanticas y de profundidad: al predecir RGB, profundidad y semantica futuras, el modelo es util para analizar como las representaciones latentes capturan la dinamica de la escena.
- Evaluacion de interfaces de accion SE(3): el formato de 16 valores con cuaterniones xyzw y rotacion 6D interna permite validar conversiones y convenciones en pipelines de robotica.
- Analisis de normalizacion y postprocesado: las estadisticas z-score sin recorte y el horizonte de 32 pasos permiten estudiar la sensibilidad del control a la normalizacion de acciones.
- Integracion con simuladores o gemelos digitales: el modelo puede conectarse a entornos simulados que respeten la geometria de camara y la interfaz de observacion definidas para generar trayectorias candidatas.
- Docencia y formacion en VLA: como artefacto reproducible con verificacion SHA256 y manifiesto de checkpoint, es adecuado para cursos practicos sobre modelos de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la release no reclama tasa de exito en bucle cerrado ni resultados estado del arte.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 14,6 GB, lo que da una cota inferior orientativa del peso del checkpoint, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras consumer.
- Opciones de despliegue: el modelo se carga mediante el runtime de SemWAM desde el repositorio `RainyRobo/SemWAM`, no a traves de vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El autor advierte que el entrenamiento completado no establece una tasa de exito en robot real; no hay evidencia de rendimiento en bucle cerrado.
- Modelo especifico de tarea ("Pack Phone"): no es un modelo generalista y su comportamiento fuera de esa tarea no esta garantizado.
- Solo soporta ingles como idioma de instruccion.
- La interfaz de accion es bimanual de pose de efector final; el adaptador de accion conjunta de RoboTwin no es intercambiable con esta interfaz.
- Reutilizar estadisticas de normalizacion de otra tarea, aplicar recorte +-5, cambiar la convencion de cuaterniones o anadir un desplazamiento de indice de accion altera la interfaz liberada.
- La condicion de profundidad se estima solo desde RGB actual; no se deben usar objetivos futuros del profesor como entradas en inferencia.
- El codigo de empaquetado contenia cambios locales respecto al repositorio fuente, por lo que no se garantiza reproducibilidad exacta del entrenamiento.
- No se incluyen checkpoints intermedios, particiones del optimizador, estado RNG ni datos de entrenamiento.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia MIT: permite uso comercial, pero la ausencia de validacion en robot real desaconseja su uso en produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-RealRobot-PackPhone-v1
- Codigo fuente SemWAM: https://github.com/RainyRobo/SemWAM
- Checkout de empaquetado: `19d1247e24e1990a7aac99fbd5cddd674771df9a` (repositorio anterior)
- Paper, blog o demo: no disponible en la informacion proporcionada.
