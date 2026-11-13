# Neurobrix/CogVideoX-2b-nbx

## Resumen

CogVideoX-2b-nbx es un contenedor `.nbx` del modelo de generación de vídeo texto-a-vídeo CogVideoX-2b desarrollado originalmente por zai-org (Zhipu AI). El contenedor lo publica NeuroBrix y no introduce cambios en los pesos ni en el comportamiento del modelo base: empaqueta el grafo de computación, los pesos, la topología de componentes y los valores por defecto de ejecución para que el motor NeuroBrix pueda ejecutarlo en el hardware disponible del usuario.

El modelo base CogVideoX-2b es un modelo de difusión para generación de vídeo a partir de prompts textuales, con un tamaño de parámetros del orden de 2 000 millones (2b). El contenedor ocupa 13,8 GB y se distribuye con licencia Apache 2.0, la misma del modelo original. La propuesta de valor de esta ficha no es el modelo en sí, sino la capa de empaquetado: NeuroBrix planifica la ejecución entre GPUs y memoria, permite ejecución en una o varias GPUs, con streaming o en host, y soporta GPUs NVIDIA, GPUs de Mac (Metal) y CPU, con motor PyTorch o con motor Triton sin dependencia de PyTorch.

Es relevante para desarrolladores que quieran desplegar generación de vídeo local sin gestionar manualmente la orquestación de pesos y kernels. No se dispone de información sobre idiomas soportados, benchmarks ni detalles de entrenamiento en la información proporcionada; esta ficha se limita a lo documentado en la model card y en las fuentes enlazadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión para generación de vídeo (familia video generation model); detalles internos no disponibles |
| Parametros totales | aproximadamente 2 000 millones (según nombre del modelo base, CogVideoX-2b) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | contenedor `.nbx` (13,8 GB); formato de pesos interno no disponible |

## Arquitectura y entrenamiento

El contenedor envuelve el modelo base zai-org/CogVideoX-2b, que es un modelo de generación de vídeo texto-a-vídeo. La model card del contenedor no describe la arquitectura interna (tipo de transformer de difusión, VAE, codificador de texto, etc.), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Toda esa información remite a la model card original de zai-org, que no forma parte de la información proporcionada.

La innovación técnica que sí está documentada es la del propio contenedor: NeuroBrix incluye el grafo de computación del modelo, los pesos, cómo se conectan sus componentes y sus valores por defecto de ejecución. El motor planifica dónde se ejecuta cada parte del modelo según las GPUs y la memoria disponibles (una GPU, varias, streaming o host) y ofrece dos motores: PyTorch y Triton, este último con kernels `nbxtensor` certificados por clase de GPU y sin necesidad de PyTorch. No se documentan innovaciones de decodificación especulativa ni de atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`).
- Ejecución local en NVIDIA GPUs, GPUs de Mac (Metal) y CPU.
- Ejecución con motor PyTorch o motor Triton (sin PyTorch).
- Planificación automática de reparto entre una o varias GPUs, con streaming o ejecución en host.
- Interfaz de línea de comandos para importar y ejecutar el modelo con un prompt y un fichero de salida de vídeo.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de clips de vídeo a partir de descripciones textuales en local: el modelo recibe un prompt y produce un fichero de vídeo, útil para prototipado rápido de contenido audiovisual sin depender de servicios en la nube.
- Iteración creativa en estaciones de trabajo: al ejecutarse en GPUs de consumo o en Mac con Metal, permite probar prompts y variaciones sin coste por API ni latencia de red.
- Despliegue en infraestructura heterogénea: el planificador de NeuroBrix reparte el modelo entre varias GPUs o lo ejecuta en CPU, lo que facilita entornos con hardware mixto o limitado.
- Integración en pipelines de CI/CD de contenido: la CLI (`neurobrix run --model ... --prompt ... --output ...`) permite automatizar la generación de vídeos en scripts y flujos de trabajo reproducibles.
- Evaluación comparativa de motores: al soportar PyTorch y Triton con los mismos pesos, sirve para medir rendimiento y portabilidad entre backends en una misma máquina.
- Formación y experimentación: el contenedor incluye grafo, pesos y topología, lo que facilita estudiar el funcionamiento del modelo sin reconstruir manualmente el pipeline de difusión.
- Generación de vídeo en entornos sin conectividad: al descargarse una vez el contenedor (13,8 GB), la inferencia puede ejecutarse offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El contenedor ocupa 13,8 GB en disco; la VRAM necesaria depende de la cuantización y del reparto que planifique NeuroBrix.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Compatibilidad declarada: NVIDIA GPUs, GPUs de Mac (Metal) y CPU.
- Cabe en consumer GPU: no confirmado en la información disponible; la ejecución en GPUs de consumo y Mac está soportada por el motor, pero sin cifras de VRAM.
- Opciones de despliegue: motor NeuroBrix con backend PyTorch o backend Triton (kernels `nbxtensor`); instalación mediante `pip install neurobrix` e importación con `neurobrix import`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CogVideoX-2b-nbx (NeuroBrix) | ~2 000 M | no disponible | apache-2.0 | contenedor `.nbx` (13,8 GB) | Empaquetado para motor NeuroBrix; ejecución en NVIDIA, Metal y CPU |
| zai-org/CogVideoX-2b (original) | ~2 000 M | no disponible | apache-2.0 | pesos originales (no especificado) | Modelo base sin empaquetar; requiere pipeline propio |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | ~1 300 M | no disponible | apache-2.0 | Diffusers (26,9 GiB) | Alternativa texto-a-vídeo de menor tamaño, referenciada en la documentación de NeuroBrix |

No se dispone de datos de rendimiento (benchmarks) para establecer una comparación cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; aplican los del modelo base zai-org/CogVideoX-2b.
- Riesgo de alucinación: no evaluado en la información disponible; en generación de vídeo se traduce en posibles inconsistencias entre el prompt y el contenido generado.
- Limitaciones de contexto o idioma: no disponibles; no se especifican idiomas soportados ni longitud de prompt máxima.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben mantener los avisos de atribución correspondientes; la model card indica que la licencia es la del modelo original y que los créditos del modelo son de zai-org.
- Producción: el contenedor tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-11-13; no hay evidencia de uso en producción ni de validación independiente.
- Dependencia del motor NeuroBrix: la ejecución requiere instalar el paquete `neurobrix` y aceptar la licencia en la importación; el rendimiento y la compatibilidad dependen de los kernels certificados por clase de GPU.
- La información de arquitectura, entrenamiento y benchmarks del modelo base no está incluida en esta ficha y debe consultarse en la model card original.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/Neurobrix/CogVideoX-2b-nbx
- Modelo base original: https://huggingface.co/zai-org/CogVideoX-2b
- Repositorio de NeuroBrix: https://github.com/NeuroBrix/neurobrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Organización en GitHub: https://github.com/NeuroBrix
- Hub de modelos: https://neurobrix.org
- Página del modelo en el hub: https://neurobrix.org/models/zai-org/CogVideoX-2b
- Documentación: https://docs.neurobrix.org
- Documentación del Model Hub: https://docs.neurobrix.org/concepts/model-hub
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
