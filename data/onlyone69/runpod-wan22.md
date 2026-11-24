# OnlyOne69/runpod-wan22

## Resumen

`OnlyOne69/runpod-wan22` es un repositorio de Hugging Face publicado por el usuario OnlyOne69 el 24 de noviembre de 2026. Por el identificador y el contenido de la model card, no se trata de un modelo de lenguaje con pesos propios, sino de un paquete de artefactos en formato ONNX (14,5 GB) orientado a la ejecución del modelo de generación de vídeo Wan 2.2 dentro de ComfyUI, presumiblemente preparado para su despliegue en RunPod. La model card no describe el modelo en sí: reproduce el README del proyecto ComfyUI, la aplicación de nodos para pipelines de difusión.

El repositorio no incluye información sobre arquitectura, número de parámetros, longitud de contexto, idiomas ni licencia. El tag `onnx` y el tamaño del repo sugieren pesos convertidos para inferencia, pero no hay documentación técnica que lo confirme. La fecha de creación (2026) y la ausencia de descargas o likes indican que es un artefacto reciente y sin validación comunitaria.

Dada la falta de datos verificables, esta ficha documenta lo que puede deducirse del identificador, los tags y el contenido citado, y marca explícitamente como "no disponible" todo lo que no puede confirmarse. No debe tratarse como una ficha de modelo de lenguaje: es, en el mejor de los casos, un contenedor de pesos para un modelo de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere Wan 2.2, modelo de difusión para vídeo; no confirmado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tamano del repositorio | 14,5 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura del modelo contenido. El nombre `wan22` apunta a Wan 2.2, un modelo de generación de vídeo por difusión, y el tag `onnx` indica que los pesos se han exportado al formato abierto de interoperabilidad de ONNX. El README adjunto corresponde a ComfyUI y describe esa aplicación (interfaz de nodos, cola asíncrona, gestión de memoria con offloading, soporte de checkpoints y safetensors, LoRAs, etc.), no el modelo alojado.

No se dispone de datos sobre el conjunto de entrenamiento, número de tokens o frames, uso de RLHF/DPO ni innovaciones técnicas del modelo. Cualquier afirmación al respecto sería especulativa.

## Capacidades

- No hay capacidades documentadas en la model card para este repositorio concreto.
- Por el identificador, cabría esperar generación de vídeo a partir de texto o imagen dentro del ecosistema ComfyUI (Wan 2.2), pero no está confirmado por el autor.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- El formato ONNX sugiere inferencia portable entre runtimes, pero no se especifica qué runtime ni qué versión de opset.

## Casos de uso

- Despliegue en RunPod: el nombre del repositorio sugiere que los pesos están empaquetados para ejecutarse en instancias de RunPod; se usarían como artefacto de entrada en un contenedor con ComfyUI.
- Pipeline de generación de vídeo en ComfyUI: si los pesos corresponden a Wan 2.2, se cargarían como nodo de difusión de vídeo dentro de un grafo de ComfyUI.
- Conversión y validación de formatos: el paquete ONNX puede servir para probar la exportación de un modelo de difusión a ONNX y comparar la salida con la de los pesos originales.
- Pruebas de interoperabilidad de runtimes: útil para evaluar la ejecución de un modelo de vídeo en runtimes que consumen ONNX (ONNX Runtime, etc.), aunque no se documenta compatibilidad.
- Reproducibilidad de entornos: al ser un artefacto de 14,5 GB con fecha fija, puede emplearse para congelar una versión concreta en un entorno de investigación.
- Archivo y auditoría: sirve como copia de referencia de un conjunto de pesos para comparaciones posteriores, siempre que se verifique su procedencia.

En todos los casos, la idoneidad es hipotética: el repositorio no incluye instrucciones de uso, ejemplos ni métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo (14,5 GB) da una cota inferior del espacio en disco necesario, no de la VRAM, que depende de la precisión y del modelo subyacente.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse que quepa en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: el README citado menciona ComfyUI (con offloading inteligente y modo `--cpu`), pero no se documenta el uso de estos pesos concretos con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a un modelo de vídeo por difusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No hay información suficiente para identificar el modelo contenido ni para compararlo con alternativas de la misma categoría (por ejemplo, otros paquetes de Wan 2.2 en ONNX o en safetensors). Cualquier comparación requeriría confirmar primero la arquitectura, el número de parámetros y la licencia.

## Limitaciones y advertencias

- La model card no describe el modelo: reproduce el README de ComfyUI, por lo que no sirve como documentación técnica del artefacto.
- No se declara licencia. Sin licencia explícita, el uso comercial y la redistribución son jurídicamente inciertos; hay que contactar con el autor o localizar la licencia del modelo original (Wan 2.2) antes de usarlo en producción.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas; en un modelo de vídeo, los riesgos relevantes serían sesgos visuales, contenido generado engañoso y derechos de imagen, ninguno documentado aquí.
- El repositorio tiene 0 descargas y 0 likes y fue creado en 2026; no hay validación comunitaria de que los pesos estén completos o sean correctos.
- El identificador y la fecha no permiten verificar la procedencia de los pesos; conviene comprobar hashes y comparar con la publicación oficial de Wan 2.2 antes de confiar en ellos.
- El formato ONNX puede limitar el conjunto de operadores soportados por algunos runtimes; no se indica el opset ni las dependencias.
- No se especifican requisitos de memoria, versiones de software ni pasos de instalación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OnlyOne69/runpod-wan22
- ComfyUI (repositorio citado en la model card): https://github.com/comfyanonymous/ComfyUI
- ComfyUI, releases: https://github.com/comfyanonymous/ComfyUI/releases
- ComfyUI, ejemplos de Wan 2.2: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- ComfyUI, ejemplos de Wan 2.1: https://comfyanonymous.github.io/ComfyUI_examples/wan/
- ComfyUI, web oficial: https://www.comfy.org/
- ComfyUI, descarga de la aplicación de escritorio: https://www.comfy.org/download
- ComfyUI, Discord: https://www.comfy.org/discord
