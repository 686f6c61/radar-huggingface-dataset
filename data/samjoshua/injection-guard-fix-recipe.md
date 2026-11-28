# SamJoshua/injection-guard-fix-recipe

## Resumen

`SamJoshua/injection-guard-fix-recipe` no es un modelo de lenguaje, sino un repositorio de receta de entrenamiento y evaluacion para un clasificador de deteccion de prompt injection. Se construye sobre `Horizon-Labs/prompt-injection-guard-small` v2.7 (revision `0c8139d`), un clasificador de texto pequeno orientado a seguridad de agentes. El autor documenta un intento de correccion basado exclusivamente en datos (data-only fix) para reducir los falsos positivos del modelo base ante menciones legitimas de herramientas, direcciones de correo o URL en documentacion y logs.

El problema que aborda es concreto: el clasificador base se apoya en caracteristicas superficiales (la presencia de una direccion de correo, una URL o una sintaxis de tool-call) en lugar de en la accion danina real. El autor reentrena con datos contrastivos y mide el resultado contra unas puertas de liberacion (release gates) definidas antes del entrenamiento. El veredicto es explicito: el intento no supera dichas puertas, por lo que no se publican pesos ni se propone como candidato a produccion.

Es relevante ahora porque expone de forma metodologicamente rigurosa un fallo tipico de los clasificadores de seguridad para agentes: la confusion entre forma y fondo en la deteccion de inyecciones. El repositorio contiene codigo, configuraciones y mediciones, pero no pesos del modelo ni datos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de texto basado en transformer (hereda la del modelo base `Horizon-Labs/prompt-injection-guard-small`; detalles no disponibles) |
| Parametros totales | no disponible (el repositorio no publica pesos ni tamano) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos; solo codigo, configuraciones y metricas) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: describe un procedimiento de ajuste fino completo sobre el checkpoint base `Horizon-Labs/prompt-injection-guard-small` v2.7. La receta seleccionada (`r22_div1ep` en `guardtune/recipes.py`) consiste en una epoca de fine-tuning completo con learning rate 5e-5, scheduler coseno, 6 % de warmup, optimizador AdamW, embeddings de tokens congelados y umbral de decision 0.5. Se probaron alternativas (segunda epoca, learning rate mas bajo, congelacion parcial, weight averaging tardio y checkpoint soups) sin exito.

Los datos de entrenamiento son contrastivos y generados por plantillas: los mismos verbos aplicados a objetos inofensivos, menciones de herramientas en logs y documentacion, instrucciones legitimas dirigidas a personas, cada ejemplo renderizado en formato compacto y en formato extendido, mas replay de las familias de entrenamiento del modelo base. La evaluacion se separa en una particion de desarrollo y una particion sellada (sealed), con intervalos de Wilson y Newcombe y tres semillas. El entrenamiento y la evaluacion corren en CPU; una epoca tardo unos 10 minutos y una evaluacion en fp32 unos 18 minutos en la maquina empleada.

## Capacidades

- Clasificacion de texto binaria orientada a deteccion de prompt injection en entradas dirigidas a agentes.
- Discriminacion entre acciones daninas y menciones legitimas de herramientas, correos y URL (objetivo del fix, no alcanzado plenamente).
- Evaluacion con metricas de falsos positivos por familia (tool-mention, instruction) y recall de acciones daninas.
- Generacion de datos de entrenamiento y de test mediante plantillas (`gen_train.py`, `gen_test.py`).
- Soporte de intervalos de confianza (Wilson/Newcombe) y tablas de resultados reproducibles.
- No soporta generacion de texto, razonamiento general, codigo, matematicas, vision, audio ni tool calling: es un clasificador, no un modelo generativo.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Auditoria de clasificadores de seguridad para agentes: el repositorio sirve como plantilla metodologica para definir puertas de liberacion antes de entrenar y medir falsos positivos por familia de entradas.
- Investigacion sobre sesgos de superficie en deteccion de inyecciones: permite reproducir el fallo del modelo base (55,4 % de falsos positivos en menciones de herramientas) y estudiar por que persiste tras el reentrenamiento.
- Construccion de conjuntos de datos contrastivos: los generadores de `guardtune/gen_train.py` y `gen_test.py` sirven como base para crear pares minimos y datos de replay.
- Evaluacion de tecnicas de mitigacion: la escalera de ablaciones (`recipes.py`, `soup.py`, `replay.py`) permite comparar learning rates, congelaciones y promediado de checkpoints de forma reproducible.
- Formacion de equipos de seguridad: el material de `EVIDENCE.md` y `GATES.md` documenta un caso real de intento fallido con criterios cuantitativos, util como referencia pedagogica.
- Integracion en pipelines de CI para clasificadores de seguridad: los tests de separacion train/test y de matematica de intervalos (`tests/`) pueden adaptarse como validaciones automatizadas antes de desplegar un guard.

## Benchmarks y rendimiento

Resultados reportados por el autor (fp32, tres semillas), comparando el modelo base v2.7 con la receta `r22_div1ep`:

| Metrica | Base v2.7 | Receta (3 semillas) | Umbral exigido |
|---|---|---|---|
| Particion sellada, falsos positivos en menciones de herramientas | 55,4 % | 18,5 / 19,5 / 18,7 % | 6 % |
| Particion sellada, recall de acciones daninas | 84,6 % | 98,7–99,0 % | 90 % |
| Particion sellada, falsos positivos en instrucciones | 32,1 % | 0,1–1,2 % | 3 % |
| Particion de desarrollo, falsos positivos en menciones de herramientas | 33,6 % | 4,7 / 1,5 / 3,1 % | 6 % |
| Particion de desarrollo, recall de acciones daninas | 72,2 % | 96,4 / 93,9 / 94,5 % | 90 % |

El intento falla las puertas de liberacion: los falsos positivos en menciones de herramientas de la particion sellada rondan el 19 % frente al 6 % exigido en todas las semillas, concentrados en dos familias de documentacion (un apendice que pide ejecutar el ejemplo y una linea de manual que solo nombra la herramienta). En la particion de desarrollo cada semilla supera las estimaciones puntuales pero incumple tres limites de dispersion entre semillas (diferencia de formato 4,0 pts frente a tope de 3,0; FPR de menciones de herramientas 3,1 frente a 2,0; FPR de instrucciones 2,0 frente a 1,5). Las peticiones benignas dirigidas al asistente siguen marcandose entre el 44 % y el 64 % de las veces.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos; el modelo base es "small", pero no se especifica su tamano).
- GPU recomendadas: no disponibles; el autor entrena y evalua en CPU.
- Compatibilidad con GPU de consumo: no determinada por falta de datos de tamano.
- Opciones de despliegue: no disponibles para este repositorio (no contiene pesos). El modelo base es compatible con `transformers` y `endpoints_compatible` segun sus etiquetas.
- Latencia y throughput: no disponibles. Como referencia de coste de entrenamiento, una epoca en CPU tardo unos 10 minutos y una evaluacion fp32 unos 18 minutos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. El unico punto de comparacion interno es el propio modelo base `Horizon-Labs/prompt-injection-guard-small` v2.7, frente al que la receta mejora el recall (84,6 % a 98,7–99,0 % en la particion sellada) y reduce los falsos positivos en instrucciones (32,1 % a 0,1–1,2 %), pero no alcanza el umbral de falsos positivos en menciones de herramientas.

## Limitaciones y advertencias

- El intento no supera las puertas de liberacion definidas por el autor; no es un candidato a produccion y no se publican pesos.
- La particion sellada no se incluye en el repositorio: sus plantillas se eliminaron de `gen_test.py` para mantenerla oculta, por lo que sus numeros no pueden regenerarse a partir del codigo publicado.
- Los generadores son de plantilla, de modo que los conjuntos de test comparten estilo internamente; los resultados deben tratarse como diagnostico de este modo de fallo, no como benchmark general.
- Solo se evaluaron tres semillas, un checkpoint base y un tamano de modelo.
- Persisten falsos positivos altos en peticiones benignas dirigidas al asistente (44–64 %).
- Riesgo de sesgo por las familias de documentacion empleadas en el entrenamiento y la evaluacion; no se documentan sesgos linguisticos ni de otro tipo.
- Licencia Apache-2.0 permite uso comercial del codigo, pero al no haber pesos publicados no hay modelo desplegable bajo esta receta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SamJoshua/injection-guard-fix-recipe
- Modelo base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Discusion con los mantenedores (red-team): https://huggingface.co/Horizon-Labs/prompt-injection-guard-small/discussions/1
- Conjunto de datos de pares minimos: https://huggingface.co/datasets/SamJoshua/injection-guard-minimal-pairs
