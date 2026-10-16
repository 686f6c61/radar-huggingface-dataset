# robbywang/cyp-challenge-yw-methods

## Resumen

`robbywang/cyp-challenge-yw-methods` no es un modelo de lenguaje, sino un informe metodologico publicado en HuggingFace que documenta el envio con alias anonimo **yw** al reto publico OpenADMET de prediccion de inhibicion directa de las enzimas del citocromo P450 (CYP). El artefacto describe un conjunto de cuatro modelos de regresion LightGBM con limites de intervalo, uno por enzima (CYP1A2, CYP2C9, CYP2D6 y CYP3A4), entrenados para predecir el valor de pIC50 de inhibicion directa a partir de descriptores moleculares.

El autor del repositorio es el usuario `robbywang`, y el informe indica explicitamente que no se ha utilizado ningun dato de entrenamiento propietario: la unica fuente de datos declarada son los datos publicos de entrenamiento del reto OpenADMET para inhibicion directa. Las caracteristicas de entrada combinan fingerprints de conteo Morgan quirales de radio 2 y descriptores moleculares calculados con RDKit. La validacion empleada es una validacion cruzada aleatoria de cinco pliegues a nivel de molecula.

El resultado publicado en el leaderboard en vivo es un MA-ST-RAE global de 0,9251, con un comportamiento muy desigual por enzima: los modelos de CYP2C9 y CYP3A4 funcionan claramente mejor (ST-RAE de 0,5858 y 0,5939), mientras que CYP2D6 presenta un ST-RAE de 1,5915, peor que el valor de referencia. La relevancia de esta ficha es por tanto metodologica y de benchmarking quimioinformatico, no de despliegue de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Four interval-bound LightGBM regression models (gradient boosting sobre arboles de decision); no es una red neuronal |
| Parametros totales | no aplicable (modelo de gradient boosting sobre descriptores; el autor no publica el numero de arboles, hojas ni tamano del artefacto) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no procesa secuencias de texto; la entrada es un vector de caracteristicas moleculares) |
| Tipos de cuantizacion | no aplicable (no se distribuyen pesos en coma flotante cuantizables) |
| Idiomas soportados | no aplicable (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene un informe de metodo; no se documenta la publicacion de artefactos serializados) |
| Enzimas objetivo | CYP1A2, CYP2C9, CYP2D6, CYP3A4 |
| Variable objetivo | pIC50 de inhibicion directa |
| Caracteristicas de entrada | Fingerprints de conteo Morgan quirales de radio 2 + descriptores moleculares RDKit |
| Tamano del modelo | no disponible |

## Arquitectura y entrenamiento

La aproximacion tecnica consiste en cuatro modelos independientes de regresion LightGBM con prediccion por intervalos ("interval-bound"), uno por cada enzima CYP evaluada. LightGBM es una implementacion de gradient boosting sobre arboles de decision con crecimiento por hojas, histogramas de caracteristicas y muestreo basado en gradientes; la variante "interval-bound" implica que la salida del modelo se restringe a un intervalo, lo que actua como regularizacion sobre el rango fisicamente plausible de pIC50. No se describe en el informe ninguna capa neuronal, mecanismo de atencion ni componente de tipo transformer.

En cuanto a los datos, la unica fuente declarada es el conjunto publico de entrenamiento de inhibicion directa del reto OpenADMET CYP. El informe subraya que los compuestos se separaron antes de ajustar cualquier componente del modelo y antes de generar caracteristicas de ensayo fuera de pliegue, y que las lecturas de inhibicion directa, de inhibicion dependiente del tiempo (TDI) y de cribado se trataron como observaciones de ensayo distintas. La validacion es una validacion cruzada aleatoria de cinco pliegues a nivel de molecula; el propio autor advierte de que la linea base enviada es anterior al protocolo de particion ampliado. Se incluye una advertencia metodologica relevante: las mediciones directas de CYP2D6 se seleccionan a partir de aciertos de cribado, lo que limita lo que la validacion directa con pliegues aleatorios puede establecer sobre ese objetivo.

## Capacidades

- Prediccion de pIC50 de inhibicion directa para cuatro enzimas: CYP1A2, CYP2C9, CYP2D6 y CYP3A4.
- Regresion por intervalos: la salida se acota a un intervalo, lo que puede interpretarse como una prediccion con rango de confianza asociado al ajuste del modelo.
- Ingenieria de caracteristicas molecular: uso de fingerprints de conteo Morgan quirales de radio 2, que codifican informacion estereoquimica, combinados con descriptores fisicoquimicos de RDKit.
- Diferenciacion de tipos de ensayo: el metodo distingue entre inhibicion directa, TDI y cribado como observaciones separadas.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni expone interfaz de llamada a herramientas.
- No soporta agentes ni razonamiento multi-paso: no dispone de bucle de decision, planificacion ni memoria.
- No tiene capacidades multilingues: no procesa texto.
- No tiene modo de razonamiento explicito, vision, audio ni generacion de texto.

## Casos de uso

- Filtrado temprano en descubrimiento de farmacos: el conjunto de modelos permite puntuar librerias de compuestos virtuales con su pIC50 estimado de inhibicion directa antes de comprometer recursos en ensayos in vitro, reduciendo el numero de compuestos que llegan a la fase experimental.
- Priorizacion de series de quimica medica: al disponer de modelos separados por enzima, un equipo puede ordenar una serie quimica segun el riesgo relativo frente a CYP3A4 o CYP2C9 (los dos objetivos con mejor ST-RAE) y decidir que analogos sintetizar primero.
- Analisis de relaciones estructura-actividad (SAR): al apoyarse en fingerprints Morgan quirales y descriptores RDKit, las predicciones pueden correlacionarse con subestructuras concretas para orientar modificaciones que reduzcan la inhibicion de una enzima diana.
- Enriquecimiento de librerias combinatorias: en un flujo de cribado virtual, el modelo actua como prefiltro de bajo coste computacional antes de metodos mas caros, como docking o dinamica molecular, para descartar compuestos con alta probabilidad de inhibicion no deseada.
- Seleccion de compuestos para confirmacion experimental: los compuestos con prediccion mas favorable en una enzima y mas desfavorable en otra pueden enviarse a ensayos dirigidos, optimizando el uso de placa y reactivos.
- Reproduccion y auditoria del envio al leaderboard: dado que el informe publica el SHA-256 del fichero de predicciones (`41778ee6671c21533861e6a8760286184d82333cc4377e5c064f58e972a77ee7`) y la revision del modelo (`291775eaa6d396b65719d2184a15a8bb5e3c411d`), sirve como referencia reproducible para comparar otras aproximaciones en el mismo reto.
- Referencia metodologica docente: es un ejemplo compacto de pipeline quimioinformatico completo (fingerprints quirales, descriptores RDKit, gradient boosting por intervalos, validacion a nivel de molecula) util para cursos de quimica computacional y de validacion de modelos QSAR.

## Benchmarks y rendimiento

Resultado publicado en el leaderboard en vivo del reto OpenADMET CYP (MA-ST-RAE global: **0,9251**). El leaderboard utiliza un subconjunto ciego.

| Enzima | ST-RAE |
|---|---:|
| CYP1A2 | 0,9292 |
| CYP2C9 | 0,5858 |
| CYP2D6 | 1,5915 |
| CYP3A4 | 0,5939 |
| Global (MA-ST-RAE) | 0,9251 |

No se han publicado en la informacion disponible resultados de otros benchmarks, ni comparaciones directas contra otras aproximaciones del mismo leaderboard. No se dispone de la metrica de referencia (baseline) frente a la que se calcula el ST-RAE , por lo que la interpretacion de cada valor debe hacerse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un conjunto de cuatro modelos LightGBM sobre descriptores moleculares, la inferencia es de tipo CPU y no requiere GPU; no se publica el tamano en memoria de los artefactos.
- GPU recomendadas: no aplicable. El metodo no describe uso de GPU ni para entrenamiento ni para inferencia.
- Compatibilidad con GPU de consumo: no aplicable por la misma razon; cualquier maquina capaz de ejecutar RDKit y LightGBM en CPU es suficiente en principio.
- Opciones de despliegue: no se documenta ninguna integracion con vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje y no aplican a este caso. El despliegue natural seria un script de Python con LightGBM y RDKit.
- Latencia y throughput estimados: no disponible.
- Dependencias funcionales: el calculo de las caracteristicas de entrada exige RDKit (descriptores moleculares y fingerprints Morgan quirales); sin esa dependencia el modelo no puede consumir entradas nuevas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos, envios o aproximaciones comparables del reto OpenADMET CYP, ni referencias externas con las que contrastar parametros, contexto, rendimiento o licencia. El propio informe indica que el leaderboard es ciego y que el resultado se actualizara cuando se seleccione la prediccion final, por lo que la comparativa quedaria desactualizada con rapidez.

## Limitaciones y advertencias

- Rendimiento muy desigual por enzima: CYP2D6 obtiene un ST-RAE de 1,5915, un valor que implica un error superior al de la referencia y desaconseja su uso para decisiones sobre ese objetivo.
- La seleccion de mediciones directas de CYP2D6 a partir de aciertos de cribado sesga el conjunto y limita la validez de la validacion aleatoria directa, tal como advierte el propio autor.
- Validacion con particion aleatoria a nivel de molecula: este esquema puede sobreestimar el rendimiento frente a particiones por esqueleto o por serie quimica, mas representativas de un escenario real de descubrimiento.
- La linea base enviada es anterior a un protocolo de particion ampliado, por lo que la comparabilidad con versiones posteriores del metodo no esta garantizada.
- El resultado procede de un subconjunto ciego del leaderboard y esta sujeto a revision; el informe anuncia actualizaciones cuando se seleccione la prediccion final.
- Riesgo de extrapolacion: al ser un modelo QSAR entrenado sobre un conjunto publico concreto, las predicciones fuera del dominio quimico de entrenamiento no estan acotadas.
- Licencia no disponible: no se especifican condiciones de uso, lo que impide confirmar si se permite el uso comercial. Debe tratarse como restriccion bloqueante hasta aclararlo.
- No es un sustituto de ensayos experimentales: las predicciones son orientativas y no validan por si solas la seguridad farmacologica de un compuesto.
- No es un modelo de lenguaje ni un asistente: no genera texto, no mantiene conversaciones, no ejecuta herramientas y no debe evaluarse con los criterios habituales de un LLM.
- Cero descargas y cero "likes" en el momento de redactar esta ficha, con una unica revision publicada; se trata de un artefacto de reto, no de un modelo consolidado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robbywang/cyp-challenge-yw-methods
- No se han proporcionado en la informacion disponible otros enlaces a papers, blogs, repositorios de codigo o demos.
