# Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw10-n100000-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de investigación para robótica distribuido a través de la librería openpi, etiquetado como "Support-near random-probe data replacement: yaw10". Se trata de un modelo de dinámica inversa (IDM) adaptado a un dominio objetivo, entrenado durante 1.000 actualizaciones con batch 32 y semilla 42 sobre 100.000 fotogramas seleccionados del conjunto `libero-support-random-waypoint-300k-yaw10`. No es un modelo de lenguaje conversacional, sino un componente de control orientado a manipulación robótica dentro del ecosistema LIBERO.

El checkpoint deriva de un modelo fuente reentrenado durante 10.000 actualizaciones, del cual conserva la normalización histórica y el codificador de muñeca correspondiente. Durante el ajuste se congeló el bloque LLM, se actualizó por completo la torre de visión y se aplicó un multiplicador posterior a Adam de 10 sobre el experto de acción ("full10"). La pérdida del IDM excluye la coordenada 6 (pinza) y promedia las 31 coordenadas de acción restantes tras el relleno, mientras que las entradas y salidas de la política, así como el control de pinza en evaluación, mantienen las siete coordenadas del robot.

Su relevancia es estrictamente experimental: forma parte de una línea de ablaciones sobre sustitución de datos de sondeo ("random-probe") y adaptación de IDM, y aporta evidencia reproducible de entrada, inicialización y exportación. La evaluación reportada es de 1.589 éxitos sobre 2.000 ensayos en LIBERO. El repositorio tiene 0 descargas y 0 "likes", por lo que carece de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card. Se distribuye con la libreria openpi y el identificador apunta a la familia pi0.5 (vision-language-action) |
| Parametros totales | No disponible. El repositorio ocupa 7,7 GB; en BF16 eso sugeriria del orden de 3.800 millones de parametros si todo el peso correspondiera al checkpoint, extremo no confirmado |
| Parametros activos | No aplica. No se indica una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Inferencia en BF16 segun la model card. No se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible. El modelo esta orientado a control robotico, no a generacion de texto general |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible con detalle. La model card menciona una exportacion "raw step999" e inferencia en BF16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, solo el procedimiento de ajuste. El identificador del repositorio remite a la familia pi0.5 integrada en openpi, un enfoque vision-language-action en el que conviven un bloque de lenguaje, una torre de visión y un experto de acción. En este experimento concreto, el bloque LLM permaneció congelado, la torre de visión recibió actualizaciones completas y el experto de acción se ajustó con el esquema "full10" y un multiplicador posterior a Adam de 10. Se preservaron la normalización histórica y el codificador de muñeca del modelo fuente.

El entrenamiento del objetivo (IDM) empleó 100.000 fotogramas seleccionados, 1.000 actualizaciones, batch de 32 y semilla 42. La pérdida del IDM excluye la coordenada 6 correspondiente a la pinza y promedia las 31 coordenadas de acción restantes tras el relleno; la política mantiene las siete coordenadas del robot tanto en entrada como en salida, y el control de pinza en evaluación conserva igualmente las siete. El modelo fuente se reentrenó durante 10.000 actualizaciones y se referencia con el commit `e435806e413a90c3b74c9411228a72b53b97060c`. La exportación corresponde al paso 999 en bruto, con inferencia en BF16 y evaluación en MuJoCo 3.2.3. No se documentan fases de RLHF ni DPO.

## Capacidades

- Predicción de acciones por dinámica inversa: dado un par de observaciones, el modelo infiere las coordenadas de acción del robot.
- Control de manipulación de siete coordenadas, incluida la pinza en las entradas, las salidas y la evaluación, aunque la coordenada 6 queda excluida de la pérdida del IDM.
- Procesamiento de entradas visuales: se conserva el codificador de muñeca del modelo fuente, por lo que consume imágenes de cámara.
- Adaptación a dominio mediante sustitución de datos de sondeo ("random-probe data replacement"), el eje del experimento.
- Evaluación integrada en LIBERO sobre 40 tareas con 50 ensayos por tarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales como "thinking", audio ni razonamiento simbólico.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio fija semilla (42), pasos (1.000), batch (32), commits de modelo fuente y de dataset, lo que permite replicar la adaptación de IDM en condiciones controladas.
- Estudio de sustitución de datos de sondeo: sirve para analizar cómo cambia el comportamiento de una política cuando se reemplazan los datos de sondeo por 100.000 fotogramas seleccionados de un dominio objetivo.
- Ablación de componentes congelados: al mantener el LLM congelado y actualizar solo visión y experto de acción, permite medir la contribución de cada bloque en tareas de manipulación.
- Evaluación comparativa en LIBERO: con 40 tareas y 50 ensayos por tarea se puede contrastar su tasa de éxito (1.589/2.000) frente al modelo fuente y a otras variantes de la misma línea.
- Análisis del tratamiento de la pinza: la exclusión de la coordenada 6 en la pérdida del IDM y su conservación en el control permiten estudiar el efecto del enmascarado parcial de acciones.
- Investigación sobre normalización histórica: al preservarse la normalización del modelo fuente, el checkpoint es útil para estudiar transferencia de estadísticas entre dominios.
- Punto de partida para ajustes posteriores: puede servir como inicialización para nuevas rondas de adaptación sobre el dataset de waypoints aleatorios.
- Docencia y experimentación con openpi: al ser un artefacto de 7,7 GB, es manejable para prácticas de despliegue de políticas VLA en simulación.

## Benchmarks y rendimiento

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| LIBERO (openpi) | Semilla 7, 40 tareas, 50 ensayos por tarea, 8 clientes por GPU | 1.589 exitos sobre 2.000 (79,45 %) |

No se han publicado resultados de benchmarks estandar de lenguaje o código (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se ofrece comparacion numerica con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion. Como referencia, el repositorio ocupa 7,7 GB, por lo que la carga de pesos en BF16 requeriria en torno a 8 GB de VRAM, sin contar activaciones ni el resto del stack de openpi.
- GPU recomendadas: no especificadas. La evaluacion se ejecuto con "ocho clientes por GPU", lo que implica paralelizacion de procesos sobre una misma GPU, pero no se indica el modelo concreto.
- Encaje en GPU de consumo: probable en tarjetas con 12 GB o mas de VRAM si la carga en BF16 se ajusta al tamano del repositorio, pero no confirmado por el autor.
- Opciones de despliegue: libreria openpi con inferencia en BF16. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo de accion.
- Entorno de simulacion: MuJoCo 3.2.3 para la evaluacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos en la informacion proporcionada. La unica referencia directa es el checkpoint fuente del que deriva esta adaptacion.

| Modelo | Actualizaciones | Datos de ajuste | Papel | Licencia |
|---|---|---|---|---|
| Este checkpoint (target IDM, yaw10) | 1.000 | 100.000 fotogramas seleccionados del dataset libero-support-random-waypoint-300k-yaw10 | Adaptacion de IDM al dominio objetivo | Apache-2.0 |
| pi05-libero-support-probe-source-n100000-10000 (commit e435806) | 10.000 | No disponible | Modelo fuente reentrenado del que se parte | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados ni documentados por el autor.
- Riesgo de acciones incorrectas: al ser un modelo de control y no de texto, el fallo no se manifiesta como alucinacion linguistica, sino como comandos de accion erroneos; su tasa de error observada es del 20,55 % en LIBERO.
- Alcance de evaluacion limitado a simulacion: toda la evidencia se obtuvo en MuJoCo 3.2.3 y LIBERO, sin validacion en robot real.
- Cobertura de contexto e idioma: no disponible; no se documentan ventanas de contexto ni soporte multilingüe.
- Dependencia de la normalizacion historica y del codificador de muñeca del modelo fuente: alterar esos componentes invalida la reproduccion.
- Exclusión de la coordenada 6 en la perdida del IDM: la pinza no se optimiza directamente en esa fase, lo que puede limitar el rendimiento en tareas que dependan de un control fino de agarre.
- Licencia Apache-2.0: permite uso comercial siempre que se conserven avisos de copyright y licencia; conviene verificar la licencia de los pesos base de openpi utilizados.
- Ausencia de validacion comunitaria: 0 descargas y 0 "likes", sin issues ni discusiones publicas.
- Documentacion minima: la model card no detalla composicion del dataset ni arquitectura, lo que dificulta auditar el entrenamiento.
- Fechas del repositorio (2026) posteriores a las referencias temporales habituales: conviene verificar la vigencia y el contexto de publicacion antes de citarlo.
- Uso previsto estrictamente experimental: no esta pensado como componente de produccion ni como modelo de proposito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw10-n100000-1000-20261015
- Modelo fuente citado en la model card: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015
- Dataset citado en la model card: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-yaw10-20261015
- Commit del modelo fuente: e435806e413a90c3b74c9411228a72b53b97060c
- Commit del dataset: cd2c777ac8f5bb6db9e1ab5d63975f76f9f4b4f9
- Repositorio de la libreria openpi: no se proporciona enlace en la informacion disponible
- Paper o blog tecnico asociado: no disponible
