# AIcell/guava-v13b-qwen3.5-4b-no-counterfactual

## Resumen

guava-v13b-qwen3.5-4b-no-counterfactual es un modelo de vision-lenguaje-accion (VLA) orientado a manipulacion robotica de sobremesa, publicado por AIcell. Se trata de un ajuste fino de Qwen3.5-VL 4B sobre el conjunto de datos Guava v13b, del que se han excluido los episodios contrafactuales (branch). Funciona, por tanto, como la ablacion de control frente a AIcell/guava-v13b-qwen3.5-4b, su contraparte entrenada con esos episodios.

La arquitectura combina un decodificador de texto de 32 capas con hidden size 2560 (atencion lineal, con atencion completa cada cuarta capa) y un ViT de 24 capas con parches de 16 y merge 2. El vocabulario es de 248.320 tokens y la ventana maxima es de 262.144 posiciones. Los pesos se reparten en dos shards safetensors que suman 8,47 GiB en bfloat16.

Su interes es fundamentalmente metodologico: permite estudiar cuanto aportan los episodios contrafactuales al aprendizaje de politicas de manipulacion. El autor lo publica como exportacion directa del checkpoint 147, sin ninguna evaluacion, sin conjunto de validacion reservado y con advertencias explicitas sobre la verificabilidad de la etiqueta "no counterfactual".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (vision + texto); decodificador de 32 capas con atencion lineal y atencion completa cada 4 capas; ViT de 24 capas |
| Parametros totales | 504.320 (dato real de safetensors indicado en la ficha de HuggingFace; el nombre del modelo indica 4B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 posiciones maximas |
| Tipos de cuantizacion | No disponible; el unico formato publicado es bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (2 shards, 8,47 GiB, 224 + 499 tensores) |
| Precision | bfloat16 |
| Hidden size | 2560 |
| Vocabulario | 248.320 tokens |
| Encoder de vision | ViT de 24 capas, patch 16, merge 2 |
| Pipeline | image-text-to-text |
| Libreria | transformers (requiere la version 5.8.1, `model_type: qwen3_5`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo vision-lenguaje-accion construido sobre Qwen3.5-VL 4B. El componente de texto usa atencion lineal con atencion completa intercalada cada cuarta capa, una combinacion habitual para reducir el coste de contextos largos manteniendo recuperacion precisa. El componente visual es un ViT de 24 capas con parches de 16 y factor de merge 2. La configuracion, el tokenizer y la plantilla de chat son identicos byte a byte a los del modelo de comparacion; solo difieren los dos shards de pesos.

El ajuste fino se realizo sobre el dataset Guava v13b, que contiene 2.268 episodios (1.554 principales y 714 branch) repartidos en 16 tareas de sobremesa. En esta variante, segun la designacion del autor, se excluyeron los episodios contrafactuales. El resultado publicado es el checkpoint 147, un punto intermedio del entrenamiento que no fue seleccionado contra ninguna metrica de validacion, porque el dataset no incluye split reservado. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento posterior.

## Capacidades

- Generacion de texto e inferencia image-text-to-text a traves de `AutoModelForImageTextToText`.
- Vision-lenguaje-accion: predice acciones de manipulacion robotica a partir de observaciones visuales de una mesa.
- Procesamiento de episodios con hasta 30 imagenes por muestra.
- Manejo de coordenadas ya alineadas con la mesa (la superficie es z = 0 en los datos de entrenamiento).
- Cobertura de 16 tareas de manipulacion: `apple_juice_order`, `bread_near_lemon`, `can_in_bin`, `close_drawer`, `cube_stack`, `cube_under_cup`, `hotdog_near_donut`, `milk_near_cup`, `open_drawer`, `pick_up_orange`, `push_basket`, `push_cereal`, `red_objects_in_basket`, `remove_cube_from_tray`, `shell_game` y `tomato_in_bowl`.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso explicito: no documentado.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no documentado.

## Casos de uso

- Estudio de ablaciones en aprendizaje por imitacion: comparar este checkpoint con AIcell/guava-v13b-qwen3.5-4b permite medir experimentalmente el efecto de los episodios contrafactuales en la politica aprendida, siempre que el investigador realice su propia evaluacion, ya que el autor no publica ninguna.
- Manipulacion pick-and-place en laboratorio: las tareas `pick_up_orange` o `apple_juice_order` son representativas de agarre y colocacion de objetos sobre mesa; el modelo parte de observaciones visuales y coordenadas alineadas con la superficie, lo que simplifica la integracion con un brazo robotico calibrado en la misma referencia.
- Automatizacion de apertura y cierre de cajones: `open_drawer` y `close_drawer` cubren interacciones con articulaciones, utiles para validar control de fuerza y trayectorias en tareas de contacto.
- Investigacion en razonamiento espacial: `shell_game` y `cube_under_cup` exigen seguir el estado de objetos ocultos o apilados, por lo que sirven como banco de pruebas de memoria visual a corto plazo dentro de un episodio.
- Reordenacion de objetos por atributos: `red_objects_in_basket`, `tomato_in_bowl` y `can_in_bin` requieren clasificar objetos por color o categoria y depositarlos en el contenedor correcto, un escenario tipico de logistica de sobremesa.
- Generacion de datos sinteticos y evaluacion de pipelines VLA: al ser un export de pesos completo y autocontenido, puede usarse como modelo de referencia para validar un pipeline de inferencia (tokenizer, plantilla de chat, preprocesado de imagenes) antes de escalar a modelos mayores.
- Reproducibilidad de experimentos academicos: dado que el dataset es privado, este modelo actua como artefacto congelado que permite a terceros inspeccionar el comportamiento de un ajuste sin acceso a los datos originales, aunque sin garantia de trazabilidad del split.
- Pruebas de integracion de infraestructura: su tamano moderado (8,47 GiB) lo hace util para verificar el soporte de `model_type: qwen3_5` en un stack de despliegue concreto antes de mover cargas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecuto ninguna evaluacion, que no hay tasas de exito ni puntuaciones sobre conjuntos reservados, y que no existe comparacion medida contra el modelo entrenado con episodios contrafactuales.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los pesos ocupan 8,47 GiB; sumando cache KV, activaciones y encoder de vision, una estimacion razonable es de 12 a 18 GB para contextos moderados. Los episodios de hasta 30 imagenes elevan de forma notable el coste del encoder y del contexto visual. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas para bfloat16: A100 40 GB, H100, L40S 48 GB. En consumer, RTX 4090 o RTX 3090 con 24 GB son las opciones mas realistas.
- Cabe en GPU de consumo: si, con margen ajustado, en tarjetas de 24 GB (RTX 4090, RTX 3090). En tarjetas de 16 GB el encaje depende de la longitud de contexto y del numero de imagenes por episodio.
- Cuantizacion: no se publican pesos GGUF ni versiones cuantizadas; la unica precision distribuida es bfloat16, por lo que el despliegue en GPU pequenas requeriria una cuantizacion propia no validada por el autor.
- Opciones de despliegue: `transformers` 5.8.1 o superior (ruta de carga no probada segun el autor); vLLM, SGLang o TGI quedan sujetos a que soporten `qwen3_5`, extremo no confirmado. El soporte en llama.cpp u Ollama no esta documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Checkpoint | Evaluacion publicada | Licencia |
|---|---|---|---|---|---|---|
| guava-v13b-qwen3.5-4b-no-counterfactual | 504.320 (safetensors) | 262.144 posiciones | Guava v13b sin episodios contrafactuales (designacion del autor) | Paso 147 | No | No disponible |
| AIcell/guava-v13b-qwen3.5-4b | No disponible (misma configuracion declarada) | 262.144 posiciones (misma configuracion declarada) | Guava v13b con episodios contrafactuales | Paso 213 | No | No disponible |
| Qwen3.5-VL 4B (modelo base) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Los dos modelos Guava comparten configuracion, tokenizer y plantilla de chat identicos byte a byte; solo difieren los dos shards de pesos. Ademas de la diferencia de datos, no estan emparejados por numero de pasos (147 frente a 213), lo que impide atribuir cualquier diferencia de comportamiento exclusivamente a la ablacion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito, puntuaciones sobre conjuntos reservados ni comparacion medida con el modelo entrenado con contrafactuales. No hay evidencia publicada sobre el coste o la ganancia real de la ablacion.
- Etiqueta no verificable: el propio autor advierte que la designacion "no counterfactual" es suya y que el export no incluye metadatos de ejecucion que identifiquen el split de entrenamiento, por lo que no puede comprobarse de forma independiente a partir de los archivos.
- Checkpoint intermedio: el paso 147 no fue seleccionado contra ninguna metrica de validacion porque el dataset no incluye split reservado. No hay garantia de que sea un buen punto de convergencia.
- Comparacion no emparejada: los 147 pasos frente a los 213 del modelo de referencia impiden un contraste limpio entre ambas variantes.
- Cautela heredada de los datos: el autor senala un problema no resuelto de clearance fisico en el episodio `05-24__push_cereal__trial_0308` del dataset de entrenamiento.
- Ruta de carga no probada: requiere `transformers` 5.8.1 y `model_type: qwen3_5`; el propio autor indica que la carga no ha sido verificada.
- Licencia no disponible: al no especificarse licencia, no puede asumirse permiso de uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Dataset privado: al no ser accesible, la reproducibilidad del entrenamiento y la auditoria de sesgos sobre los datos quedan fuera del alcance de terceros.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica ni sobre calidad en idiomas distintos del que se haya usado en instrucciones.
- Riesgo de alucinacion y de accion incorrecta: en un modelo VLA, un error no se limita a texto plausible, sino que puede traducirse en una trayectoria o un agarre fallido con consecuencias fisicas. Es imprescindible validar en entorno controlado.
- Normalizacion de coordenadas: los datos ya estan alineados con la mesa (z = 0) y se advierte de no aplicar una segunda normalizacion de altura, un error de integracion que degradaria las predicciones.
- Sesgos conocidos: no disponibles; no se documenta ningun analisis al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b-no-counterfactual
- Modelo de comparacion (entrenado con episodios contrafactuales): https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/AIcell/guava-v13b
- Busqueda web: no se han encontrado resultados relevantes para este modelo; las entradas devueltas por la busqueda no guardan relacion con el y no se incluyen. No se dispone de paper, blog, repositorio ni demo adicionales.
