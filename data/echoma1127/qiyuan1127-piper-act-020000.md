# echoma1127/QiYuan1127-PiPER-ACT-020000

## Resumen

QiYuan1127-PiPER-ACT-020000 es un checkpoint de politica robotica entrenado con el algoritmo ACT (Action Chunking with Transformers) sobre el framework LeRobot 0.6.1. Lo publica el usuario echoma1127 y esta asociado al proyecto QiYuan1127, orientado al control de un brazo robotico PiPER. No es un modelo de lenguaje: es una politica de imitacion que mapea observaciones visuales y de estado a comandos de actuacion para una tarea de manipulacion concreta.

El modelo resuelve una unica tarea fisica: coger un cubo rojo y colocarlo dentro de un cuadrado negro situado a la izquierda de la mesa. Se entreno sobre 52 episodios locales de demostracion (20.488 fotogramas a 20 Hz) y el checkpoint corresponde al paso 20.000 de entrenamiento. La entrada combina dos camaras RGB (global y de muneca, 640x480 antes de preprocesado) con un vector de estado de 7 valores; la salida son objetivos absolutos para seis articulaciones del brazo en grados y una apertura de pinza en metros.

Su relevancia es limitada y muy acotada: se trata de un artefacto de investigacion reproducible para una configuracion hardware-software especifica (PiPER + LeRobot), sin evaluacion de tasa de exito retenida ni licencia de uso asignada. Resulta util como referencia tecnica de un pipeline ACT completo, no como componente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone de vision ResNet-18 preentrenado en ImageNet |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; politica de imitacion, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, zh (etiquetas de la model card; no implica capacidad linguistica) |
| Licencia | no disponible (el autor indica que no se ha asignado una licencia open source global al checkpoint) |
| Formato de pesos | safetensors (model.safetensors, 206.707.932 bytes; SHA-256 58ff63d7cc57052f56d2e13e5121fbe1ea9b2bb0d1ed6fda65005264d4c2c09e) |

## Arquitectura y entrenamiento

ACT es un transformer que predice trozos de acciones (action chunks) a partir de observaciones. En este checkpoint el backbone visual es una ResNet-18 inicializada con pesos de ImageNet, que procesa dos flujos de imagen (camara global y camara de muneca). El modelo consume un estado de 7 dimensiones y emite 7 dimensiones de accion: seis articulaciones del brazo en grados y la apertura de pinza en metros. El tamano de chunk guardado y `n_action_steps` son ambos 100; el perfil de despliegue restaurado seleccionado consume 30 pasos con suavizado alpha de 0,7 y una sesion por defecto de 30 segundos.

El entrenamiento se realizo sobre 52 episodios locales de demostracion de la tarea de colocacion del cubo rojo, totalizando 20.488 fotogramas a 20 Hz. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo: es imitacion supervisada pura. El dataset completo no se publica junto con el modelo. No se proporciona evaluacion de tasa de exito en un conjunto retenido; el autor advierte explicitamente que el exito reportado historicamente por usuarios no constituye una tasa medida.

## Capacidades

- Generacion de acciones de control para un brazo PiPER: objetivos absolutos de seis articulaciones en grados y apertura de pinza en metros.
- Percepcion visual multimodal a partir de dos camaras RGB (global y de muneca) a 640x480 antes de preprocesado.
- Ejecucion de una tarea de manipulacion especifica: recoger un cubo rojo y colocarlo en un cuadrado negro a la izquierda de la mesa.
- Prediccion por chunks de accion (hasta 100 pasos) con ejecucion configurable de 30 pasos y suavizado temporal.
- Integracion con el ecosistema LeRobot 0.6.1 para carga de politica y adaptadores de despliegue.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, dialogo multilingue ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Reproduccion de investigacion en imitacion robotica: sirve como referencia de un pipeline ACT completo (entrenamiento, checkpoint, procesadores y despliegue) sobre LeRobot 0.6.1 para comparar configuraciones.
- Validacion de un brazo PiPER en laboratorio: permite comprobar la cadena de percepcion (dos camaras) y actuacion (siete dimensiones) antes de entrenar politicas propias.
- Base para fine-tuning en tareas de pick-and-place: al ser un checkpoint ACT con backbone ResNet-18, puede servir de inicializacion para tareas similares de colocacion de objetos.
- Pruebas de infraestructura de despliegue: util para verificar adaptadores, orden de camaras, unidades y estadisticas de procesador en un entorno controlado antes de produccion.
- Docencia y demostraciones de aprendizaje por imitacion: ejemplo concreto de como se estructura un dataset de demostraciones (52 episodios, 20 Hz) y como se evalua (o no) un checkpoint.
- Auditoria de reproducibilidad: el hash SHA-256 y el tamano exacto permiten verificar integridad de los siete ficheros del checkpoint y detectar sustituciones de procesadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se proporciona evaluacion de tasa de exito en un conjunto retenido y que el exito reportado por usuarios no es una tasa medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 51,67 M de parametros en safetensors de precision completa, el peso de los pesos ronda los 207 MB, por lo que la VRAM adicional depende de los buffers de las dos camaras y del runtime de LeRobot.
- GPU recomendadas: no disponible; cualquier GPU con soporte CUDA capaz de ejecutar ResNet-18 y el transformer de ACT deberia bastar, pero el autor no documenta requisitos.
- Cabe en GPU de consumo: probablemente si, dado el tamano reducido del checkpoint, aunque no se confirma en la model card.
- Opciones de despliegue: LeRobot 0.6.1 con los adaptadores del proyecto QiYuan1127; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a una politica robotica).
- Latencia y throughput: no disponibles. La frecuencia de entrenamiento fue de 20 Hz, pero no se reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QiYuan1127-PiPER-ACT-020000 | 51,67 M | no aplica | Pick-and-place con PiPER | no disponible | HuggingFace (0 descargas) |
| Otros checkpoints ACT en LeRobot | no disponible | no aplica | Manipulacion generica | variable | HuggingFace |
| Politicas de imitacion comparables (p. ej. Diffusion Policy) | no disponible | no aplica | Manipulacion | variable | Repositorios de investigacion |

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sin evaluacion de tasa de exito retenida: no hay evidencia medida de robustez ni de generalizacion fuera del conjunto de entrenamiento.
- Tarea unica y muy especifica: solo se entreno para colocar un cubo rojo en un cuadrado negro; no se reclama rendimiento robotico de proposito general.
- Dataset no publicado: los 52 episodios y 20.488 fotogramas no acompanan al modelo, lo que dificulta la reproduccion exacta.
- Dependencia estricta de la configuracion: el orden de camaras, las unidades y las estadisticas de procesador deben coincidir con el entrenamiento; los procesadores safetensors no son intercambiables entre checkpoints.
- Integridad de los siete ficheros: todos deben mantenerse juntos; el autor advierte que descargar no inicia el robot ni autoriza movimiento fisico.
- Limitaciones fisicas conocidas: el autor menciona restricciones de apertura y colocacion de la pinza, documentadas en las notas del repositorio de ingenieria.
- Licencia no disponible: no se ha asignado licencia open source global; el uso comercial queda sin autorizacion explicita. LeRobot y ResNet-18 conservan sus terminos upstream.
- Idiomas: las etiquetas en/zh no implican capacidad linguistica; el modelo no procesa lenguaje natural.
- Riesgo de sobreajuste a la configuracion de laboratorio: sin datos de validacion cruzada ni de dominios distintos, la transferencia a otras mesas, iluminaciones o brazos es incierta.

## Enlaces

- HuggingFace: https://huggingface.co/echoma1127/QiYuan1127-PiPER-ACT-020000
- Repositorio del proyecto: https://github.com/Skyglow1127/QiYuan1127
