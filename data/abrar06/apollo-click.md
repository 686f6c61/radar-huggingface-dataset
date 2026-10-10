# abrar06/apollo-click

## Resumen

Apollo-Click, publicado en HuggingFace por el usuario abrar06 bajo el nombre interno Odyssey-Click V5, es un modelo orientado a gui-grounding (localización visual de elementos de interfaz) con la etiqueta adicional edge-actuator, lo que sugiere un enfoque de despliegue en dispositivos locales para actuar sobre pantallas mediante clics. El modelo resuelve la tarea clásica de grounding de GUI: dada una captura de pantalla y una instrucción en lenguaje natural, predecir las coordenadas del elemento sobre el que hay que pulsar.

Se trata de un artefacto de investigación con muy poca tracción: acumula 33 descargas y 0 likes desde su publicación, y el repositorio ocupa 27,4 GB. No se declara pipeline, idiomas soportados, arquitectura ni número de parámetros en la información disponible, por lo que la ficha se apoya casi exclusivamente en la model card y en los metadatos del repositorio.

La relevancia actual del modelo es limitada y debe interpretarse con cautela: el único resultado publicado es la evaluación en ScreenSpot-v2 en el paso 1200 de entrenamiento, con una precisión global del 15,80 % y un error medio de 347,5 píxeles por predicción. Esos valores están muy lejos de lo que se considera utilizable en producción para automatización de interfaces, por lo que el modelo debe tratarse como un checkpoint experimental o un punto de partida para ajuste fino, no como una solución final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la model card no declara idiomas y las etiquetas del repositorio no incluyen campo de idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no se detalla; el repositorio ocupa 27,4 GB) |
| Tarea principal | GUI grounding / visual grounding (predicción de coordenadas de clic) |
| Etiquetas declaradas | gui-grounding, visual-grounding, edge-actuator |
| Tamaño del repositorio | 27,4 GB |
| Descargas / likes | 33 / 0 |
| Fecha de creación | 2026-10-06 |
| Última actualización | 2026-10-10 |
| Región declarada | us |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la documentación disponible. Las etiquetas del repositorio (gui-grounding, visual-grounding) sitúan la tarea en el ámbito de los modelos visión-lenguaje aplicados a interfaces gráficas, pero no se especifica si se trata de un transformer denso, una variante con adaptadores visuales, una arquitectura híbrida ni qué codificador de imagen utiliza. Tampoco hay datos sobre la longitud de contexto soportada ni sobre el tokenizador.

En cuanto al entrenamiento, la model card únicamente aporta una referencia a un punto de control concreto, el paso 1200, sobre el que se reportan métricas de ScreenSpot-v2. No se detalla el volumen de tokens de entrenamiento, la composición del dataset, la resolución de entrada de las capturas, si hubo etapas de ajuste supervisado, RLHF o DPO, ni si existe decodificación especulativa o alguna innovación técnica destacable. La etiqueta edge-actuator apunta a una intención de ejecución en dispositivos de borde, pero no se documentan técnicas de compresión o destilación que la respalden.

## Capacidades

- Localización visual de elementos de interfaz: dado un par captura de pantalla más instrucción textual, el modelo predice una coordenada de clic.
- Distinción declarada entre elementos de texto e iconos, ya que las métricas de ScreenSpot-v2 se desglosan en Text Accuracy e Icon Accuracy.
- Orientación a despliegue en el borde, según la etiqueta edge-actuator del repositorio.
- Generación de texto general: no confirmada en la información disponible.
- Razonamiento multi-paso o modo de pensamiento: no confirmado.
- Soporte de tool calling o function calling: no confirmado.
- Soporte de agentes: no confirmado; la única capacidad documentada es la predicción de clics.
- Capacidades multilingües: no disponibles.
- Visión general más allá del grounding de GUI: no confirmada.
- Audio, vídeo u otras modalidades: no disponibles.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo podría usarse para localizar botones y campos a partir de instrucciones en lenguaje natural y generar clics dentro de suites de test end-to-end. Con un error medio de 347,5 píxeles, en su estado actual requeriría un ajuste fino previo y verificación posterior de cada acción.
- RPA sobre aplicaciones de escritorio: integrado en un orquestador de automatización robótica de procesos, permitiría sustituir selectores frágiles por localización visual de elementos. La tasa de acierto publicada (15,80 % global) hace inviable un uso sin supervisión.
- Asistentes de accesibilidad: un sistema que traduzca instrucciones verbales en clics sobre la pantalla para usuarios con movilidad reducida, apoyándose en la capacidad de grounding visual.
- Agentes de navegador: como componente de percepción-acción para que un agente web decida dónde pulsar en una página renderizada, siempre que se combine con un verificador de resultados.
- Automatización en dispositivos de borde: la etiqueta edge-actuator sugiere el escenario de kioscos, terminales punto de venta o equipos con recursos limitados donde no es viable enviar capturas a la nube por privacidad o latencia.
- Soporte remoto guiado: resaltar automáticamente el elemento sobre el que debe pulsar un usuario durante una sesión de asistencia técnica, usando la coordenada predicha como anotación visual.
- Recolección y preetiquetado de datos: generar anotaciones preliminares de coordenadas sobre capturas para que un revisor humano las corrija, reduciendo el coste de construcción de datasets de grounding.

En todos los casos, el estado actual del modelo obliga a tratar la salida como una sugerencia y no como una acción fiable.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a la evaluación en ScreenSpot-v2 en el paso 1200 de entrenamiento.

| Benchmark | Métrica | Resultado |
|---|---|---|
| ScreenSpot-v2 (step 1200) | Overall Accuracy | 15,80 % |
| ScreenSpot-v2 (step 1200) | Text Accuracy | 15,32 % |
| ScreenSpot-v2 (step 1200) | Icon Accuracy | 16,43 % |
| ScreenSpot-v2 (step 1200) | Mean Pixel Error | 347,5 px |

No se han publicado resultados adicionales de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni otras variantes de ScreenSpot).

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia derivada del tamaño del repositorio (27,4 GB), una única copia de los pesos en precisión de 16 bits requeriría al menos unos 28 GB de VRAM solo para los pesos, más el espacio de activaciones y del codificador visual. Si el repositorio contuviera varios checkpoints o estados de optimizador, el modelo subyacente sería más pequeño. Esta estimación no está confirmada por el autor.
- GPU recomendadas si se confirma un modelo del orden de 13 000 millones de parámetros en fp16: A100 40 GB, A100 80 GB, H100 o configuraciones multi-GPU con 2 x RTX 4090 / RTX A6000.
- Viabilidad en GPU de consumo: condicionada a que existan pesos cuantizados. Con cuantización a 4 bits, un modelo de ese tamaño ocuparía aproximadamente 7-8 GB, lo que cabría en RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090. No se confirma la existencia de dichos pesos.
- Opciones de despliegue: no documentadas. No se indica compatibilidad con vLLM, TGI, llama.cpp, Ollama ni ningún otro servidor de inferencia. Al tratarse de una tarea de grounding visual, sería necesario, como mínimo, un runtime con soporte de entrada de imagen (por ejemplo, transformers o vLLM con soporte multimodal), siempre que el modelo exponga pesos en safetensors, extremo que no se especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los siguientes modelos se citan únicamente como referencia de la misma categoría (grounding de interfaces gráficas). Las cifras de los competidores no están incluidas en la información proporcionada, por lo que no se comparan valores numéricos.

| Modelo | Categoría | Parámetros | Contexto | ScreenSpot-v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Apollo-Click (Odyssey-Click V5) | GUI grounding | no disponible | no disponible | 15,80 % (overall, step 1200) | Apache-2.0 | HuggingFace, 33 descargas |
| SeeClick | GUI grounding | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible | Referencia de categoría |
| OS-Atlas | GUI grounding | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible | Referencia de categoría |
| UGround | GUI grounding | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible | Referencia de categoría |

No se dispone de datos verificados que permitan una comparación cuantitativa directa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Precisión muy baja: el 15,80 % de acierto global en ScreenSpot-v2 implica que aproximadamente cinco de cada seis predicciones son incorrectas.
- Error de localización elevado: 347,5 píxeles de error medio hacen que, incluso cuando el modelo acierta el elemento, la coordenada pueda caer fuera del objetivo en resoluciones habituales de escritorio.
- Ausencia de información de arquitectura y entrenamiento: no es posible reproducir el entrenamiento ni evaluar qué datos se usaron, lo que dificulta auditar sesgos o contaminación.
- Sesgos conocidos: no documentados, pero al no declararse la composición del dataset no puede descartarse un sesgo hacia determinados idiomas, sistemas operativos, temas visuales o resoluciones.
- Riesgo de alucinación: en tareas de grounding, el fallo se manifiesta como una coordenada plausible pero incorrecta, lo que puede provocar clics destructivos en interfaces reales si el modelo se usa sin validación.
- Idiomas soportados: no declarados. Se desconoce si acepta instrucciones en castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No se declaran restricciones adicionales.
- Falta de mantenimiento y adopción: 33 descargas, 0 likes y un repositorio sin pipeline declarado sugieren un proyecto experimental sin comunidad ni soporte.
- Estado del arte: un resultado en el paso 1200 de entrenamiento no garantiza que el modelo esté convergido ni que sea el mejor checkpoint del repositorio.
- Producción: no se recomienda su despliegue en flujos automáticos sin supervisión humana ni mecanismos de verificación posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abrar06/apollo-click
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
