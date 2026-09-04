# jiangzhuo9357/supertonic-3

## Resumen

Supertonic 3 es un modelo de síntesis de texto a voz (TTS) de código abierto desarrollado originalmente por Supertone Inc., una empresa con sede en Seúl. Se presenta como un sistema ligero de aproximadamente 99 millones de parámetros que se ejecuta íntegramente en el dispositivo mediante ONNX Runtime, sin necesidad de conexión a la nube. Su principal novedad es la ampliación del soporte de idiomas de 5 a 31, lo que lo convierte en una opción práctica para aplicaciones multilingües en entornos con recursos limitados.

Este modelo se publica como un espejo (mirror) del repositorio original `Supertone/supertonic-3`, mantenido por el proyecto Sokuji. La razón es que Supertone Inc. se disolvió en 2026 y sus servicios alojados, incluido el Voice Builder, se suspendieron. Por tanto, el proyecto original ya no recibe desarrollo ni soporte oficial, pero los pesos abiertos siguen disponibles para su uso.

Supertonic 3 está diseñado para resolver el problema de la síntesis de voz en local, con una huella de memoria reducida y una ejecución rápida en CPU. Su arquitectura interna no se documenta en los metadatos disponibles, pero las características de tamaño y de formato ONNX lo diferencian de sistemas TTS de mayor escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se indica únicamente que es un modelo TTS ejecutado con ONNX Runtime) |
| Parametros totales | 99 millones (aprox.) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible (modelo de síntesis de voz, no aplica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, coreano, japonés, árabe, búlgaro, checo, danés, alemán, griego, español, estonio, finés, francés, hindi, croata, húngaro, indonesio, italiano, lituano, letón, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco, turco, ucraniano, vietnamita |
| Licencia | BigScience Open RAIL-M License (18 de agosto de 2022) |
| Formato de pesos | ONNX, config.json |

## Arquitectura y entrenamiento

Supertonic 3 es un modelo de síntesis de texto a voz que se distribuye en formato ONNX para su ejecución con ONNX Runtime. La información disponible no detalla la arquitectura interna, como el tipo de capas o la estructura del codificador/decodificador, ni los datos de entrenamiento utilizados. Tampoco se mencionan procesos de alineación como RLHF o DPO, propios de modelos de lenguaje, lo cual resulta esperable en un sistema TTS.

Lo que sí se sabe es que el modelo tiene aproximadamente 99 millones de parámetros, un tamaño considerablemente inferior al de otros sistemas TTS abiertos de 0,7B a 2B de parámetros. Esta reducción de escala se traduce en un menor tamaño de descarga, un arranque más rápido y una inferencia viable en CPU. El desarrollo original correspondía a Supertone Inc. y se ha detenido tras la disolución de la empresa; el espejo actual no añade ninguna capacidad de clonación de voz ni modifica los pesos.

## Capacidades

- Generación de voz en 31 idiomas, incluidas lenguas europeas y asiáticas.
- Inferencia local y sin conexión mediante ONNX Runtime, sin llamadas a la nube.
- Uso de estilos de voz predefinidos incluidos en el paquete, como el estilo "M1".
- Soporte de etiquetas de expresión en el texto, como `<laugh>`, `<breath>` y `<sigh>`.
- Estabilidad mejorada en la lectura, con menos fallos de repetición o salto de frases, según la documentación.
- No soporta tool calling, generación de código ni matemáticas; su función es exclusivamente la síntesis de voz.
- Permite trabajar con archivos de estilo de voz personalizados (`voice_style.json`) generados previamente con el desaparecido Voice Builder.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: al ejecutarse en CPU con ONNX Runtime, puede integrarse en dispositivos sin GPU y sin conexión a internet para ofrecer respuestas habladas de forma autónoma.
- Narración de noticias o artículos en aplicaciones de lectura: con soporte para 31 idiomas, puede convertir contenido escrito en audio en el idioma nativo del usuario, lo que resulta útil para aplicaciones de noticias o blogs.
- Audiolibros y podcasts generados automáticamente: gracias a su tamaño reducido y a la posibilidad de usar estilos de voz predefinidos, es adecuado para generar narraciones largas de forma local, sin depender de servicios externos.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o aplicaciones de accesibilidad, proporciona una voz clara sin necesidad de conexión a la nube, lo que mejora la privacidad y reduce la latencia.
- Prototipado de productos de voz: al no requerir GPU y poder instalarse con un simple `pip install supertonic`, es útil para validar rápidamente ideas de producto que necesiten TTS multilingüe, evitando la complejidad de infraestructura en la nube.
- Juegos y aplicaciones interactivas: la síntesis de voz en tiempo real puede emplearse para personajes o narradores; el tamaño pequeño del modelo reduce el tiempo de carga y permite su inclusión en paquetes de software con requisitos de tamaño limitados.
- Traducción y doblaje de vídeos cortos: combinado con sistemas de traducción automática, podría generar voces en el idioma de destino para vídeos en redes sociales, aunque solo si se dispone de estilos de voz compatibles y el uso cumple las restricciones de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como MMLU, HumanEval o GSM8K) en la información disponible, al tratarse de un modelo TTS. No se dispone de métricas objetivas de calidad de voz publicadas que permitan comparar el rendimiento con otros sistemas de síntesis de voz.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU y no requiere GPU.
- Memoria: el repositorio ocupa 0,4 GB; los pesos completos tienen aproximadamente 99 millones de parámetros, lo que supone una carga muy ligera en comparación con sistemas TTS de 0,7B a 2B.
- GPU recomendada: ninguna; cualquier CPU moderna debería ser suficiente para la síntesis de voz básica.
- Opciones de despliegue: SDK de Python `supertonic` con ONNX Runtime. No se ofrecen integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada. No hay cifras concretas de tiempos de generación o velocidad de procesamiento.

## Comparativa con modelos similares

No se dispone de una comparativa formal con modelos equivalentes en la información proporcionada. El propio autor señala que Supertonic 3 (99M) es mucho menor que los sistemas TTS abiertos de 0,7B a 2B de parámetros, lo que le confiere ventajas en descarga, tiempo de arranque e inferencia en dispositivos; sin embargo, no se aportan cifras de rendimiento de dichos modelos.

## Limitaciones y advertencias

- El desarrollo original ha cesado y no hay soporte oficial; la empresa responsable se ha disuelto.
- El servidor de Voice Builder ya no existe, por lo que no es posible crear nuevos estilos de voz personalizados; solo se pueden usar los estilos predefinidos o los archivos descargados con anterioridad.
- La licencia OpenRAIL-M incluye restricciones de uso: no está permitido usar el modelo para suplantar a personas sin su consentimiento, ni generar contenido sin informar de que es sintético, ni utilizarlo de forma que viole la ley.
- El modelo solo cubre 31 idiomas, lo que puede no incluir dialectos o variantes regionales.
- No se documentan sesgos conocidos específicos; sin embargo, al igual que otros sistemas TTS, puede presentar diferencias de calidad entre voces e idiomas.
- Riesgo de errores de pronunciación en nombres propios, acrónimos o palabras extranjeras, no cuantificado en la información disponible.
- El espejo no está afiliado a Supertone Inc. ni a HYBE; la marca y los derechos corresponden a sus propietarios.

## Enlaces

- Espejo en Hugging Face: https://huggingface.co/jiangzhuo9357/supertonic-3
- Repositorio original de Supertone: https://huggingface.co/Supertone/supertonic-3
- Demostración oficial: https://supertonic3.github.io/
- Código en GitHub: https://github.com/supertone-inc/supertonic
- Proyecto Sokuji (mantenedor del espejo): https://github.com/kizuna-ai-lab/sokuji
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
