# Donghyun1228/pi05-libero-main-module-lr-view-medium-v9-e0p3-1000-20261015

## Resumen

El repositorio `Donghyun1228/pi05-libero-main-module-lr-view-medium-v9-e0p3-1000-20261015` contiene un checkpoint de política robótica publicado por el usuario Donghyun1228 bajo la librería `openpi`. Por la nomenclatura y las etiquetas (`openpi`, `libero`, `inverse-dynamics`), se trata de una variante entrenada sobre la suite de manipulación LIBERO, orientada a tareas de control visuomotor a partir de observaciones. El nombre del repositorio codifica los hiperparámetros del experimento: vista `medium`, multiplicador de visión 9.0, coeficiente de experto 0.3, 1000 actualizaciones y semilla 42.

La model card lo describe explícitamente como un "candidato" de la rama principal de búsqueda de tasa de aprendizaje (LR), no como un modelo final validado. Se indica que durante el ajuste solo se entrenó el módulo correspondiente, con el LLM congelado, sobre datos de contacto denso existentes y con normalización preservada. El autor advierte de que el cribado de 311/400 episodios se usó para seleccionar hiperparámetros y no constituye una confirmación independiente.

Se trata por tanto de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, útil para reproducibilidad y para comparar variantes de ajuste dentro de una misma familia, pero sin garantías de robustez ni evaluación completa publicada. No hay información disponible sobre el número de parámetros, la longitud de contexto, los idiomas soportados ni el formato exacto de los pesos más allá del tamaño del repositorio (6,9 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. La model card menciona una torre de visión ("vision multiplier"), un "expert" y un LLM congelado durante el ajuste, lo que apunta a una arquitectura tipo VLA (vision-language-action) con módulo experto |
| Parametros totales | No disponible (el repositorio ocupa 6,9 GB) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. No se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible de forma explícita. Librería declarada: `openpi`; tamano del repositorio: 6,9 GB |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna. La model card describe un esquema de ajuste parcial: se congela el LLM y se entrena el "main-method module", con una configuración de vista `medium`, un multiplicador de visión de 9.0 y un coeficiente de experto de 0.3. El entrenamiento se realizó sobre datos de contacto denso ya existentes más un preajuste original ("original pre-adapt"), aplicando únicamente escalado nativo posterior a Adam. La normalización original y la fuente de muñeca (*wrist*) original se preservan.

El régimen de entrenamiento reportado es de 1000 actualizaciones, con `raw999`, batch 32, semilla 42 y búsqueda sobre rejilla finita (el autor advierte que una búsqueda en rejilla finita no demuestra un óptimo global). El entorno de ejecución indicado es MuJoCo 3.2.3, con ocho clientes por GPU y flujos aleatorios de política compartidos (`initial0`), sobre hardware referido como "A1000–3". No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, algo esperable en un modelo de acción y no de lenguaje.

## Capacidades

- Control robótico visuomotor: el modelo genera acciones a partir de observaciones, en el marco de la suite LIBERO de manipulación.
- Etiqueta `inverse-dynamics`: la información sugiere entrenamiento o uso orientado a dinámica inversa, aunque no se detalla el procedimiento.
- Integración con `openpi`: el repositorio declara la librería `openpi` como entorno de carga.
- Evaluación en simulación: el cribado reportado (311/400 sobre índices oficiales 0–9, semilla 7) se realizó presumiblemente en el simulador MuJoCo 3.2.3.
- Arquitectura con LLM congelado y módulo experto entrenable: permite ajustar componentes específicos sin reentrenar el modelo base, reduciendo coste.
- No hay evidencia disponible de soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproduccion de experimentos de ajuste: el checkpoint documenta hiperparámetros concretos (vista `medium`, visión 9.0, experto 0.3, 1000 pasos, semilla 42), lo que permite replicar exactamente esa configuración dentro del pipeline `openpi`.
- Ablaciones de tasa de aprendizaje: al ser un candidato de la rama "LR" de la búsqueda principal, sirve como punto de comparación frente a otros coeficientes y multiplicadores de visión.
- Evaluacion de politicas en LIBERO: puede cargarse para medir tasas de éxito sobre los índices oficiales de la suite y contrastar con el 311/400 reportado en el cribado.
- Estudio de ajuste parcial con LLM congelado: útil para analizar cuánto rendimiento se obtiene entrenando solo el módulo principal frente a un ajuste completo.
- Punto de partida para fine-tuning propio: con licencia Apache 2.0 y pesos descargables, un equipo puede partir de este checkpoint y adaptarlo a una tarea de manipulación distinta.
- Analisis de preservacion de normalizacion: dado que el autor mantiene la normalización y la fuente de muñeca originales, es un caso adecuado para estudiar el efecto de no renormalizar tras el ajuste.
- Docencia e investigacion en robotica: sirve como ejemplo de artefacto de investigación con documentación de cribado explícita y advertencia de que no hay confirmación independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo coherente con un modelo de política robótica.

El único dato de rendimiento aportado es el cribado del autor:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Cribado LIBERO (episodios exitosos) | 311/400 (77,75 %) | Índices oficiales 0–9, semilla 7, selección de hiperparámetros |

Advertencia del propio autor: el cribado se utiliza para seleccionar hiperparámetros y no es una confirmación independiente. No se reclama ninguna evaluación completa nueva para este candidato. No se dispone de comparación con otros modelos dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa derivada del tamaño del repositorio (6,9 GB), en bf16 la inferencia requeriría del orden de 8–10 GB incluyendo overhead; si los pesos estuvieran en fp32 (unos 13,8 GB), el requisito subiría a unos 16 GB. Son estimaciones, no datos confirmados.
- GPU recomendadas: la model card menciona hardware referido como "A1000–3", probablemente A100, para entrenamiento o cribado con ocho clientes por GPU. Para entrenamiento de esta familia lo razonable es A100 o H100; para inferencia, una GPU con al menos 16–24 GB.
- GPU de consumo: no confirmado. Si los pesos son de 6,9 GB en bf16, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) podrían albergarlos, pero el trabajo de simulación añade carga de CPU y el bucle de control puede ser el cuello de botella real.
- Opciones de despliegue: la librería declarada es `openpi`. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF. El autor describe un esquema con múltiples clientes por GPU y flujos aleatorios de política compartidos, compatible con un servidor de política centralizado.
- Entorno de simulacion: MuJoCo 3.2.3, indicado explícitamente en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos dentro de la información proporcionada (ni parámetros, ni contexto, ni resultados de benchmarks de alternativas). Categorías potencialmente comparables serían otras políticas de manipulación del ecosistema `openpi` (familia pi0/pi0.5) o alternativas VLA de código abierto, pero no hay cifras verificables en el material consultado para construir la tabla.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | No disponible | No disponible | 311/400 en cribado LIBERO (no independiente) | Apache 2.0 | HuggingFace, 0 descargas |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un candidato de investigación, no un modelo validado: el autor indica explícitamente que no se reclama ninguna evaluación completa nueva.
- El resultado de 311/400 procede de un cribado usado para seleccionar hiperparámetros, con semilla 7, y no constituye confirmación independiente.
- La búsqueda de hiperparámetros se hizo sobre rejilla finita; el propio autor señala que esto no demuestra un óptimo global.
- El LLM está congelado durante el ajuste, lo que limita la adaptación de las representaciones lingüísticas del modelo.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento fuera de distribución en el mundo real; el cribado es en simulación (MuJoCo), y el salto sim-a-real no está evaluado.
- No se documentan idiomas soportados, longitud de contexto ni tipos de cuantización, lo que dificulta planificar un despliegue en producción.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y conservación de avisos, pero la licencia no implica ninguna garantía de rendimiento o seguridad del modelo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de terceros.
- Sin datos de latencia, throughput ni requisitos de VRAM confirmados, cualquier estimación de despliegue es orientativa.
- Un modelo de política robótica mal evaluado puede provocar daños físicos si se traslada a hardware real sin las salvaguardas adecuadas.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-view-medium-v9-e0p3-1000-20261015
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante. Los resultados devueltos corresponden a foros de temática ajena al modelo (índices de foros húngaros y foros de contenido para adultos) y no guardan relación con este repositorio.
- Paper, blog, repositorio de código o demo oficiales: no disponibles en la información proporcionada.
