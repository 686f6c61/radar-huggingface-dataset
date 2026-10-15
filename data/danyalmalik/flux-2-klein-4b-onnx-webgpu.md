# danyalmalik/FLUX.2-klein-4B-ONNX-WebGPU

## Resumen

FLUX.2-klein-4B-ONNX-WebGPU es una conversión a ONNX del transformer de black-forest-labs/FLUX.2-klein-4B, preparada por el usuario danyalmalik para ejecutarse en el navegador mediante el backend WebGPU de ONNX Runtime Web. No es un modelo entrenado desde cero ni un ajuste fino: es un artefacto de despliegue que empaqueta el transformer de difusión en un único grafo ONNX, con las capas lineales cuantizadas a 4 bits y el resto de la aritmética repartida entre fp16 y fp32.

La motivación es clara: permitir generación de imágenes texto-a-imagen en máquinas sin CUDA ni ROCm, aprovechando WebGPU/Vulkan. El repositorio ocupa 2,2 GB e incluye únicamente el transformer; el codificador de texto (Qwen3) y el decodificador VAE deben tomarse de la exportación de referencia MarkShark2/flux2-klein-4b-onnx-webgpu-q4, con la que este grafo es compatible a nivel de entradas y salidas.

Su relevancia es acotada pero concreta: demuestra que un modelo de difusión de 4B parámetros puede servirse en un navegador o en un Chromium headless sobre hardware gráfico antiguo, a cambio de una pérdida de fidelidad frente a los pesos originales. El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día, por lo que no cuenta con validación de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con predicción de velocidad (*flow matching*) del modelo FLUX.2 Klein 4B, exportado como grafo ONNX único; no es un modelo de lenguaje |
| Parametros totales | 4B aproximadamente, según el nombre del modelo base; la model card no desglosa el recuento |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el grafo recibe características de texto (`ctx`) procedentes de tres capas de un codificador Qwen3, sin longitud máxima documentada. Los latentes se tokenizan a 1 token por cada 16 × 16 píxeles, con 128 valores por token |
| Tipos de cuantizacion | Capas lineales de los bloques a 4 bits (redondeo al más cercano, tamaño de bloque 32); atención y proyecciones en fp16; flujos residuales, *norms*, modulación y *rotary embedding* en fp32. El decodificador VAE de la exportación de referencia va en fp16 y el codificador de texto Qwen3 en q4 *weight-only* |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tres sesiones: codificador de texto Qwen3, transformer y decodificador VAE); este repositorio contiene solo el transformer |
| Entradas del grafo | Latentes ruidosos (`x`), posiciones (`x_ids`), *timestep* normalizado entre 0 y 1, características de texto (`ctx`) y sus posiciones (`ctx_ids`) |
| Salida del grafo | Velocidad del *flow matching* (`pred`) |
| Tamaño del repositorio | 2,2 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo base FLUX.2 Klein 4B es un transformer de difusión que predice la velocidad de un campo de *flow matching*: dado un lote de latentes ruidosos, sus posiciones, el *timestep* en el rango 0–1 y las características de texto, devuelve la velocidad que se integra para obtener la muestra final. La tokenización de imagen es de un token por cada bloque de 16 × 16 píxeles, con 128 valores por token. Las características de texto no provienen de un único vector de *embedding*, sino de tres capas de un codificador Qwen3 concatenadas en paralelo, lo que da al condicionamiento una profundidad mayor que la de los codificadores CLIP/T5 clásicos.

Esta ficha describe únicamente el proceso de conversión, no el entrenamiento. No hay reentrenamiento, ajuste fino ni destilación: los cambios son de representación y precisión. El transformer se exporta a un único grafo ONNX con entradas y salidas idénticas a las de MarkShark2/flux2-klein-4b-onnx-webgpu-q4, de modo que ambos son intercambiables dentro del mismo *runtime*. La innovación técnica es la mezcla de precisiones: q4 *weight-only* con tamaño de bloque 32 en las capas lineales, fp16 en atención y proyecciones, y fp32 en los caminos sensibles a la acumulación numérica (residuales, *norms*, modulación y *rotary embedding*). El autor advierte explícitamente de que las salidas son cercanas, pero no idénticas, a las del modelo original.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) en el navegador, a través del backend WebGPU de ONNX Runtime Web.
- Inferencia en equipos sin CUDA ni ROCm, apoyándose en WebGPU/Vulkan; el caso de referencia documentado es la AMD BC-250.
- Ejecución en Chromium headless, lo que permite exponer la generación de imágenes como una API local pequeña mediante el *runtime* flux2-vulkan-bridge.
- Compatibilidad de interfaz con la exportación de MarkShark2, incluyendo su codificador de texto Qwen3 y su decodificador VAE.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso ni uso como agente: no es un modelo de lenguaje.
- No acepta imágenes de entrada ni audio; la única modalidad de entrada es texto y la única de salida es imagen.
- Capacidades multilingües: no documentadas. El prompt se procesa con un codificador Qwen3, pero la model card no especifica cobertura de idiomas para la generación.

## Casos de uso

- Demostraciones de generación de imágenes en el navegador: el grafo se carga con ONNX Runtime Web y WebGPU, de modo que un usuario puede generar imágenes sin instalar nada ni enviar el prompt a un servidor.
- Aplicaciones con requisitos de privacidad: al ejecutarse localmente en el cliente, el texto del prompt y la imagen resultante no salen del dispositivo, lo que resulta adecuado para entornos con datos sensibles.
- Reutilización de hardware gráfico antiguo: el proyecto está pensado para máquinas con Vulkan/WebGPU pero sin soporte moderno de CUDA o ROCm, como la AMD BC-250, donde los *runtimes* habituales de difusión no funcionan.
- Prototipado rápido de interfaces de generación de imágenes: los 2,2 GB del bundle permiten iterar sobre la UX y el *prompting* antes de invertir en infraestructura GPU con los pesos completos.
- Servicio local mediante API: flux2-vulkan-bridge ejecuta ONNX Runtime WebGPU dentro de Chromium headless y expone la generación a través de una API local, lo que sirve para integrar la generación de imágenes en herramientas de escritorio o scripts internos.
- Pruebas de integración de *pipelines* ONNX WebGPU: el repositorio sirve como caso de prueba reproducible para validar versiones de ONNX Runtime Web, controladores Vulkan y comportamiento de la cuantización q4 en navegador.
- Investigación sobre cuantización: permite medir la degradación cualitativa de un transformer de difusión de 4B al pasar sus capas lineales a 4 bits con bloques de 32, comparando contra la exportación fp16 o contra el modelo original.
- Generación de recursos gráficos de baja dependencia: ilustraciones, *placeholders* y material de maquetación generados en el propio equipo del diseñador, sin coste de API por imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, *throughput* ni tiempos de inferencia; únicamente afirma de forma cualitativa que las salidas son cercanas, pero no idénticas, a las del modelo original. La etiqueta `quick-inference` del repositorio no va acompañada de cifras.

## Requisitos de hardware

- Requisito principal: un navegador o Chromium headless con soporte de WebGPU y un controlador gráfico con Vulkan/WebGPU operativo. Sin WebGPU no hay ejecución posible.
- Memoria de pesos: el bundle completo de tres sesiones ocupa 2,2 GB, por lo que el conjunto de pesos debería caber en GPUs con 4 GB o más de memoria. El pico real depende de la resolución de generación y del tamaño del búfer de activaciones, que no se publica.
- GPU objetivo documentada: AMD BC-250 (tarjeta de minería con hardware gráfico útil pero sin soporte moderno de *runtimes* ML). No se listan otras GPU probadas.
- GPU de consumo: no hay una lista de modelos verificados en la información disponible; el enfoque WebGPU hace teóricamente viable cualquier GPU integrada o dedicada con WebGPU, pero no está confirmado para modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU, navegador Chromium (incluido headless) y el *runtime* flux2-vulkan-bridge. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Componentes incluidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| danyalmalik/FLUX.2-klein-4B-ONNX-WebGPU | 4B (transformer) | ONNX | q4 en lineales, fp16 en atención, fp32 en residuales/norms | Solo el transformer | Apache 2.0 | 0 descargas, 0 likes |
| MarkShark2/flux2-klein-4b-onnx-webgpu-q4 | 4B (transformer) | ONNX | q4 *weight-only* con activaciones fp16 y fp32 en atención/Softmax | Codificador Qwen3 q4, transformer q4 y VAE fp16 | no indicada en la información disponible | Exportación de referencia, con *runtime* propio (flux2-vulkan-bridge) |
| black-forest-labs/FLUX.2-klein-4B | 4B (transformer) | Pesos originales (formato no detallado aquí) | Sin cuantizar | Modelo completo | Apache 2.0 | Modelo base oficial |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. Otras alternativas de la misma categoría (modelos de difusión texto-a-imagen de tamaño similar y licencia permisiva) no están cubiertas por la información proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Los pesos están modificados: las salidas son cercanas, pero no idénticas, a las del modelo original. No es apto para reproducir exactamente resultados obtenidos con FLUX.2 Klein 4B.
- El repositorio contiene solo el transformer. Sin el codificador de texto Qwen3 y el decodificador VAE de MarkShark2/flux2-klein-4b-onnx-webgpu-q4 (o exportaciones equivalentes) el grafo no produce imágenes.
- Dependencia estricta de WebGPU: en navegadores sin soporte, en servidores sin GPU compatible o con controladores antiguos, la ejecución falla. No hay ruta CUDA/ROCm.
- Sin benchmarks ni evaluación de calidad: no hay métricas objetivas de fidelidad, sesgo o robustez frente a la cuantización q4.
- Sesgos: no documentados en esta ficha. Los sesgos del modelo base dependen de su dataset de entrenamiento, no descrito aquí, y la generación texto-a-imagen puede reproducir estereotipos o producir texto mal formado dentro de la imagen.
- Riesgo de artefactos: la cuantización a 4 bits de las capas lineales puede degradar detalles finos, texto en la imagen y coherencia en composiciones complejas.
- Idiomas: no se documenta qué idiomas maneja bien el *prompting*; el comportamiento fuera del inglés no está verificado.
- Madurez: 0 descargas, 0 likes y una ventana de creación-actualización de tres minutos. No hay historial de mantenimiento, issues resueltos ni validación de terceros.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar el archivo LICENSE.md del repositorio y los términos del modelo base antes de desplegarlo en producción.
- No es un LLM: no ofrece *tool calling*, agentes, razonamiento multi-paso ni generación de código o texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danyalmalik/FLUX.2-klein-4B-ONNX-WebGPU
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Exportación de referencia (codificador de texto y VAE): https://huggingface.co/MarkShark2/flux2-klein-4b-onnx-webgpu-q4
- README de la exportación de referencia: https://huggingface.co/MarkShark2/flux2-klein-4b-onnx-webgpu-q4/blob/main/README.md
- Runtime flux2-vulkan-bridge: https://github.com/MarkShark2/flux2-vulkan-bridge
- Scripts de exportación a ONNX: https://github.com/MarkShark2/flux2-vulkan-bridge/tree/main/flux2-onnx-export
- Paper o blog oficial del modelo base: no disponible en la información proporcionada.
