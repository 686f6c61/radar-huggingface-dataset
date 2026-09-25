# Amirhossein75/ff-free-riding

## Resumen

Este repositorio no contiene un modelo generativo ni un modelo de lenguaje, sino cuatro checkpoints de investigación entrenados con Forward-Forward (FF), una alternativa al backprop en la que cada capa aprende a partir de un criterio de «bondad» (goodness) local. Los publica Amirhossein Yousefiramandi (usuario Amirhossein75) como material de reproducción del artículo *Cumulative-Goodness Free-Riding in Forward-Forward Networks: Real, Repairable, but Not Accuracy-Dominant* (NeurIPS 2026). Cada fichero es la red de Stage 1 seleccionada por validación en la ejecución con semilla 42 de uno de los cuatro brazos centrales de CIFAR-100 de la Tabla 3 del artículo: entrenamiento local por bloques (γ=0), colaboración con puerta por dureza (κ=0), goodness acumulada (γ=0,7) y compensación de gradiente ausente (MGC, c_d=1).

El fenómeno que estudia el artículo es el *layer free-riding*: en las variantes de goodness acumulada, las capas tardías heredan una tarea que las capas tempranas ya han separado parcialmente, y bajo el criterio FF con softplus el gradiente de discriminación de clase que llega al bloque d decae exponencialmente. Los cuatro brazos permiten medir ese efecto y comprobar hasta qué punto es reparable y si domina la precisión final. La arquitectura es una red densa de 4 bloques con dimensión 256 (L4/D256), sin MoE y sin SAM, entrenada 362 épocas con la misma partición de entrenamiento y validación de semilla 42.

La relevancia es de investigación: permiten reevaluar los cuatro brazos sin reentrenar Stage 1 y sirven de backbone congelado para readouts posteriores. No es un clasificador de propósito general: resuelve únicamente CIFAR-100 (imágenes de 32x32 píxeles, 100 clases) con un top-1 de test entre el 66 % y el 69 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feedforward densa de 4 bloques con dimensión 256 (L4/D256) entrenada con Forward-Forward; sin MoE y sin SAM |
| Parametros totales | no disponible (los checkpoints de ~211 MB incluyen pesos EMA, pesos crudos, estados de optimizador y scheduler y colas de características contrastivas, por lo que no permiten derivar el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes; entradas CIFAR-100 de 32x32 píxeles) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch en punto flotante; no hay versiones cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC BY 4.0 para los checkpoints; el código del repositorio asociado es Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (claves `net_ema`, `model`, `cfg`, `epoch_stage1`, `best_s1`, `stage`, `opt_states`, `sched_states`, `queues`) |
| Tarea (pipeline) | `image-classification` |
| Dataset de entrenamiento y evaluacion | `uoft-cs/cifar100` |
| Metrica declarada | accuracy (top-1) |
| Tamano del repositorio | 0,8 GB (los cuatro checkpoints suman 845.889.156 bytes; ~211 MB por fichero) |
| Libreria | PyTorch |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La red es un clasificador denso de cuatro bloques (L4) con dimensión oculta 256 (D256) y sin mezcla de expertos. Se entrena con el criterio Forward-Forward: en lugar de propagar gradientes hacia atrás a través de toda la red, cada bloque optimiza localmente una función de bondad. Los cuatro brazos comparten exactamente el mismo setup (CIFAR-100, L4/D256, sin SAM, 362 épocas de Stage 1, semilla 42 y la misma partición train/validación) y se diferencian en el criterio de entrenamiento: bloque local puro (γ=0), colaboración con puerta por dureza (κ=0), goodness acumulada (γ=0,7) y MGC con c_d=1. Según la model card, MGC cambia únicamente la pérdida de entrenamiento, no la red, de modo que los cuatro ficheros se cargan con el mismo trainer de CIFAR-100 del repositorio de código.

Cada checkpoint guarda los pesos EMA (`net_ema`), que producen las cifras de Stage 1, y los pesos crudos (`model`), además de la configuración completa de la ejecución (idéntica al `config.json` salvo el campo `device`), la época seleccionada, el top-1 de validación en esa época y los estados de optimizador, scheduler y colas contrastivas. El entrenamiento se hizo sin RLHF ni DPO (no aplica a esta tarea). La evaluación principal (S1) es un readout de suma de goodness sobre los pesos EMA con un único recorte; S1-TTA añade la imagen volteada horizontalmente. Las cifras S2 y S2-TTA provienen de una cabeza atenta de Stage 2 entrenada por backprop sobre el backbone congelado, que no forma parte del método FF y cuyos checkpoints no se incluyen en este repositorio.

## Capacidades

- Clasificación de imágenes en las 100 clases de CIFAR-100 (32x32 píxeles).
- Readout de Stage 1 basado en suma de goodness sobre los pesos EMA, en variante de un solo recorte (S1) y con TTA de volteo horizontal (S1-TTA).
- Backbone congelado reutilizable para readouts posteriores entrenados por backprop (linear probing o cabeza atenta), según la tabla de readouts del apéndice del artículo.
- Reproducción de los cuatro brazos de la Tabla 3 del artículo sin necesidad de reentrenar Stage 1.
- Suministro de los estados de optimizador, scheduler y colas contrastivas, lo que permite reanudar o inspeccionar el estado de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo «thinking», visión de propósito general, audio ni otras modalidades.

## Casos de uso

- Reproducción de resultados de la Tabla 3: cargar los cuatro checkpoints con el trainer de CIFAR-100 y recalcular las cifras de Stage 1 evita repetir las 362 épocas de entrenamiento de cada brazo.
- Investigación sobre aprendizaje local: sirve como banco de pruebas controlado para comparar criterios FF (γ, κ, MGC) manteniendo constante el resto del setup.
- Estudio del *layer free-riding*: al ser cuatro brazos con idéntica arquitectura y partición de datos, permiten aislar el efecto del criterio de entrenamiento sobre la separación del bloque más profundo.
- Auditoría de artefactos: el repositorio incluye `SHA256SUMS` y `release_manifest.json`, de modo que estos ficheros pueden usarse como caso de verificación de integridad y trazabilidad de checkpoints de investigación.
- Punto de partida para readouts sobre backbone congelado: congelar los pesos EMA y entrenar una cabeza de clasificación (lineal o atenta) reproduce el flujo de Stage 2 descrito en la model card.
- Docencia y divulgación: material concreto para explicar Forward-Forward, el papel de la bondad acumulada y las limitaciones de los métodos de aprendizaje local frente al backprop.
- Ablación de criterios de entrenamiento en CIFAR-100: usar los cuatro brazos como línea base al introducir variantes propias del criterio FF.
- Extensión a otros conjuntos: el manifiesto de publicación describe 98 checkpoints con resultados (incluidas las ejecuciones de CIFAR-10 y las cabezas de Stage 2), de los que aquí solo se publican cuatro; el resto está disponible bajo petición al autor.

## Benchmarks y rendimiento

Top-1 de test en CIFAR-100 (%) de las ejecuciones con semilla 42, tal como figuran en la model card:

| Brazo | S1 | S1-TTA | S2 (registrado) | S2-TTA (registrado) |
|---|---:|---:|---:|---:|
| γ=0 (bloque local) | 66,17 | 66,92 | 68,27 | 68,94 |
| κ=0 (con puerta por dureza) | 66,07 | 66,85 | 68,29 | 68,64 |
| Goodness acumulada γ=0,7 | 66,70 | 67,18 | 68,09 | 68,57 |
| MGC (c_d=1) | 66,05 | 66,79 | 68,71 | 69,19 |

Época de Stage 1 seleccionada por validación y top-1 de validación en esa época:

| Brazo | Epoca seleccionada | Top-1 de validacion |
|---|---:|---:|
| γ=0 (bloque local) | 362 | 65,72 % |
| κ=0 (con puerta por dureza) | 340 | 66,22 % |
| Goodness acumulada γ=0,7 | 340 | 66,22 % |
| MGC (c_d=1) | 362 | 66,96 % |

Notas sobre estas cifras: S1 fue repredicho desde cada fichero sobre el conjunto de test completo y coincidió con los registros de ejecución con un margen de 0,01 puntos porcentuales (66,18 / 66,07 / 66,70 / 66,06 frente a los valores registrados 66,17 / 66,07 / 66,70 / 66,05). S1-TTA no se repredijo y queda ligado a estos ficheros por linaje. Las cifras S2 y S2-TTA provienen de cabezas de Stage 2 que no se incluyen en la publicación. No se han publicado en la información disponible resultados comparativos con otros modelos de la literatura (por ejemplo, redes convolucionales entrenadas por backprop sobre CIFAR-100), ni métricas adicionales como precisión por clase, calibración o robustez.

## Requisitos de hardware

- VRAM para inferencia: no se publican cifras. La arquitectura declarada (4 bloques, dimensión 256, densa) es pequeña, por lo que la inferencia debería caber con holgura en GPUs de consumo; se trata de una estimación a partir de la configuración, no de un dato del repositorio.
- Peso en disco: ~211 MB por checkpoint y 845.889.156 bytes en total. El fichero incluye estados de optimizador, de scheduler y colas contrastivas, por lo que el consumo de memoria al cargarlo completo supera el de los pesos de inferencia.
- GPUs recomendadas: no disponibles. Por el tamaño del modelo, cualquier GPU de consumo moderna (por ejemplo, serie RTX 30xx o 40xx) debería ser suficiente para evaluación; para el reentrenamiento de Stage 1 conviene una GPU con más memoria, pero no se especifica cuál.
- Inferencia en CPU: viable en principio dado el tamaño reducido, aunque no hay cifras de latencia publicadas.
- Opciones de despliegue: solo PyTorch con el trainer del repositorio de código. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni TensorRT, ni versiones GGUF.
- Latencia y throughput: no disponibles. El único dato temporal indirecto es el coste de entrenamiento (362 épocas de Stage 1 por brazo), que tampoco se cuantifica en horas ni en hardware.

## Comparativa con modelos similares

No se han publicado en la información disponible comparaciones con modelos externos de la misma categoría. La model card no incluye líneas base de backprop (por ejemplo, redes residuales o wide-resnet sobre CIFAR-100) ni referencias a otras implementaciones de Forward-Forward con cifras comparables.

| Alternativa | Parametros | Contexto | Rendimiento en CIFAR-100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es interna, entre los cuatro brazos publicados (véase la tabla de benchmarks), donde las diferencias de top-1 de test entre brazos son de décimas de punto y MGC obtiene el mejor S2 registrado (69,19 con TTA).

## Limitaciones y advertencias

- Artefactos de investigación, no clasificadores de propósito general: solo cubren CIFAR-100, con imágenes de 32x32 píxeles y 100 clases. No deben usarse como modelo de visión general.
- Precisión modesta: el top-1 de test se sitúa entre el 65,7 % y el 69,2 % según brazo y readout, muy lejos del estado del arte en CIFAR-100 con entrenamiento por backprop.
- Cobertura parcial de la publicación: de los 98 checkpoints con resultados descritos en el manifiesto solo se publican 4; el resto (todas las semillas, las cabezas de Stage 2 y las ejecuciones de CIFAR-10) está disponible únicamente bajo petición al autor.
- Semilla única: los ficheros publicados corresponden a la semilla 42. Las cifras medias de la Tabla 3 del artículo proceden de 3 semillas, pero solo una es reproducible con lo aquí publicado.
- Las cabezas de Stage 2 no están incluidas, de modo que las cifras S2 y S2-TTA no se pueden reproducir sin reentrenar la sonda tal como describe la model card.
- S1-TTA no fue repredicho desde los ficheros: su validez depende del linaje registrado en los `events.jsonl` de cada ejecución.
- La columna de separación del bloque más profundo («sep» en la Tabla 3) es una cantidad de registro de entrenamiento leída en la última época de Stage 1 (362), no recalculada desde el checkpoint seleccionado por validación.
- Sesgos conocidos: no se documentan análisis de sesgo, equidad ni robustez a cambios de distribución. CIFAR-100 tiene limitaciones conocidas de etiquetado y de jerarquía gruesa/fina que se heredan sin evaluación adicional.
- Riesgo de error en predicción: al ser un clasificador discriminativo no genera texto y, por tanto, no alucina en el sentido de los modelos de lenguaje, pero puede producir predicciones erróneas con alta confianza; no se publican métricas de calibración ni de incertidumbre.
- Restricciones de licencia: los checkpoints se distribuyen bajo CC BY 4.0, que permite uso comercial con atribución; el código asociado es Apache-2.0. Conviene verificar la atribución al autor y al artículo en cualquier uso derivado.
- Falta de validación externa: el repositorio presenta 0 descargas y 0 likes, y todas las cifras proceden de la propia model card del autor, sin replicación independiente documentada.
- Documentación incompleta en la información disponible: el fragmento de carga en Python que aparece en la model card está truncado, por lo que la reproducibilidad depende de consultar el repositorio de código y el manifiesto de publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Amirhossein75/ff-free-riding
- Perfil del autor en HuggingFace: https://huggingface.co/Amirhossein75/models
- Articulo (arXiv:2605.06240): https://arxiv.org/abs/2605.06240
- Version 1 del articulo: https://arxiv.org/abs/2605.06240v1
- Codigo (trainers, analisis, manifiesto de reproduccion; Apache-2.0): https://github.com/amirhossein-yousefi/ff-free-riding
- Dataset CIFAR-100: https://huggingface.co/datasets/uoft-cs/cifar100
