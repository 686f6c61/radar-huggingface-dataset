# lucaslim/rc-mock-smolvla-ft

## Resumen

rc-mock-smolvla-ft es un ajuste fino (fine-tuning) del modelo base lerobot/smolvla_base, un modelo de vision-lenguaje-accion (VLA) orientado a robótica. Lo publica el usuario lucaslim en Hugging Face y está pensado para ejecutarse con la librería LeRobot (versión 0.7.0) mediante la clase `SmolVLAPolicy.from_pretrained`. El modelo se ha entrenado sobre las tareas públicas del conjunto "Reality Check", según indica el propio autor, aunque la model card lo etiqueta explícitamente como "(mock)", lo que sugiere que se trata de un artefacto de prueba o demostración más que de un modelo listo para producción.

Con 450.046.176 parámetros (aproximadamente 450 millones) y un tamaño de repositorio de 0,9 GB en formato safetensors, se sitúa en la gama de modelos compactos de robótica que pueden desplegarse en hardware de consumo. Su relevancia actual radica en el creciente interés por los modelos VLA de código abierto que unifican percepción visual, comprensión del lenguaje y generación de acciones motoras en un único transformer, permitiendo controlar robots manipuladores mediante instrucciones en lenguaje natural.

No obstante, conviene subrayar que el modelo tiene cero descargas y cero "likes" en el momento de redactar esta ficha, y que su naturaleza declarada de "mock" limita seriamente cualquier expectativa de rendimiento real. La información pública disponible es muy escasa: la model card apenas ocupa cuatro líneas y no incluye datos de entrenamiento, benchmarks ni detalles de arquitectura más allá de la referencia al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en el modelo base lerobot/smolvla_base; detalles internos no disponibles |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo deriva de lerobot/smolvla_base, un modelo de la familia SmolVLA integrado en el ecosistema LeRobot de Hugging Face. La arquitectura es de tipo vision-lenguaje-accion: recibe observaciones visuales (imágenes de cámaras del robot) junto con una instrucción en lenguaje natural y produce acciones motoras como salida. Sin embargo, la model card de este ajuste fino no proporciona detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni el encoder visual empleado; toda esa información debe consultarse en la ficha del modelo base.

En cuanto al entrenamiento, el autor indica únicamente que se ha realizado un fine-tuning sobre las tareas públicas de "Reality Check", sin especificar el número de tokens, el volumen de episodios de demostración, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se documenta el procedimiento de ajuste (learning rate, épocas, congelación de capas, etc.). La etiqueta "(mock)" en la descripción sugiere que los datos de entrenamiento podrían ser sintéticos o de prueba, lo que invalida cualquier evaluación de calidad del ajuste.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, en el marco del paradigma VLA.
- Integración con LeRobot 0.7.0 mediante `SmolVLAPolicy.from_pretrained`, lo que permite cargarlo directamente en pipelines de robótica de esa librería.
- Control de robots manipuladores en tareas de "Reality Check" (según declara el autor, aunque sin detallar cuáles).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes autónomos ni soporte multilingüe explícito.
- No se documentan modos especiales como thinking mode, procesamiento de audio o visión más allá de la percepción visual inherente al modelo VLA.

## Casos de uso

- Experimentación académica con modelos VLA: sirve como punto de partida para investigadores que quieran reproducir o comparar ajustes finos sobre SmolVLA en entornos controlados de laboratorio, dada su licencia Apache 2.0 y su tamaño compacto.
- Pruebas de integración con LeRobot: útil para validar pipelines de carga, inferencia y evaluación dentro de la librería LeRobot 0.7.0 antes de invertir en modelos de mayor tamaño.
- Docencia y formación en robótica de código abierto: su reducido tamaño (0,9 GB) y su licencia permisiva lo hacen adecuado para talleres donde se enseñe a desplegar modelos VLA en hardware asequible.
- Desarrollo de prototipos de manipulación robótica: permite iterar rápidamente sobre tareas de agarre y colocación en simulación o en robots de bajo coste, aunque sin garantías de robustez por su carácter de mock.
- Referencia para comparativas de fine-tuning: puede emplearse como línea base "de juguete" en estudios que midan el efecto de distintos datasets de ajuste fino sobre SmolVLA.
- Validación de infraestructura de despliegue: al ser un artefacto ligero, resulta útil para probar sistemas de serving, monitorización y registro de modelos VLA antes de pasar a producción con modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros en precisión FP16, el modelo ocupa aproximadamente 0,9 GB de pesos; en FP32 rondaría 1,8 GB. A ello hay que sumar la memoria del encoder visual y de los buffers de activaciones, por lo que se estima un consumo total de 2 a 4 GB en FP16, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería poder alojarlo; se sugiere NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 para entornos de investigación, si bien no hay datos publicados de latencia en ninguna de ellas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6 GB o más de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: la vía documentada es LeRobot 0.7.0 con `SmolVLAPolicy.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rc-mock-smolvla-ft | 450 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning mock sobre SmolVLA |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que deriva este ajuste |
| Otros modelos VLA de la familia SmolVLA | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Carácter de mock: el propio autor etiqueta el modelo como "(mock)", por lo que no debe considerarse un modelo validado para uso real en robótica.
- Ausencia de benchmarks: no hay métricas de éxito en tareas, lo que impide evaluar su calidad frente al modelo base.
- Documentación mínima: la model card no detalla datos de entrenamiento, hiperparámetros ni composición del dataset, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste o comportamiento errático: al ser un ajuste fino sobre tareas concretas de "Reality Check" sin documentación, es probable que generalice mal a otros entornos.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al tratarse de un modelo visual y de lenguaje, hereda los posibles sesgos del modelo base y de los datos de ajuste.
- Riesgo de alucinación: en modelos VLA, el equivalente sería la generación de acciones incoherentes o inseguras; no hay evaluación al respecto.
- Idiomas: no se especifican los idiomas soportados en las instrucciones de lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuya licencia no se detalla en la información disponible, conviene verificar la ficha de lerobot/smolvla_base antes de un despliegue comercial.
- Sin soporte comunitario: cero descargas y cero interacciones sugieren que no ha sido probado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucaslim/rc-mock-smolvla-ft
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio del autor: https://github.com/lucasucal/rc-mock-smolvla
- Librería LeRobot: no se proporciona enlace directo en la información disponible; se referencia la versión 0.7.0.
