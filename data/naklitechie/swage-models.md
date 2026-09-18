# naklitechie/swage-models

## Resumen

`naklitechie/swage-models` no es un modelo entrenado de cero, sino un repositorio de artefactos de despliegue para llevar la técnica Program-as-Weights (PAW, citada en la model card como arXiv 2607.02512) a una sola pestaña de navegador. El paquete incluye un intérprete basado en Qwen3-0.6B exportado a ONNX en fp16 y fusionado para ONNX Runtime Web con el backend WebGPU, junto con programas PAW compilados como adaptadores PEFT LoRA de rango 64. El repositorio ocupa 2,4 GB y está publicado por el usuario naklitechie, con licencia mixta y sin descargas ni valoraciones registradas en el momento de la consulta.

La propuesta técnica consiste en tratar el "programa" como pesos en lugar de como texto de prompt: el adaptador LoRA se inyecta como entrada del grafo ONNX y el intérprete devuelve logits en las posiciones solicitadas. Esto permite ejecutar varias variantes de comportamiento sobre un mismo grafo base sin recompilar ni reexportar el modelo, algo relevante para demos, experimentos de investigación y aplicaciones web que necesitan inferencia local sin backend.

Su relevancia actual es acotada y experimental. Se trata de un artefacto derivado de Qwen3-0.6B (Apache-2.0) más copias recuantizadas del compilador PAW publicado por terceros, cuyos pesos originales no incluyen fichero de licencia. La model card declara explícitamente "research use" y que los términos están pendientes de confirmación con los autores originales, lo que limita su uso en producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo unico: interprete Qwen3-0.6B (transformer denso decoder-only, derivado de `Qwen/Qwen3-0.6B`) exportado a ONNX, mas programas PAW como adaptadores LoRA PEFT |
| Parametros totales | Aproximadamente 0,6 mil millones en el modelo base del interprete; el tamano de los adaptadores LoRA (rango 64) no esta desglosado en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El modelo base Qwen3-0.6B declara 32 768 tokens de contexto nativo en su propia model card, dato no confirmado en este repositorio |
| Tipos de cuantizacion | fp16 en el interprete ONNX; los directorios `encoder/` y `mapper/` son copias recuantizadas del compilador PAW, con nivel de cuantizacion no especificado |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Mixta (`license: other`, `mixed-see-below`): interprete derivado de Qwen3-0.6B (Apache-2.0); pesos upstream del compilador PAW sin fichero de licencia, declarados para uso de investigacion; texto de los prompts bajo CC BY 4.0 de los autores de PAW |
| Formato de pesos | ONNX (grafo fusionado para ORT-web/WebGPU) y safetensors (adaptadores LoRA PEFT) |
| Tamano del repositorio | 2,4 GB |
| Autor | naklitechie |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El componente principal es un intérprete ONNX de Qwen3-0.6B en el que el adaptador LoRA se expone como entrada del grafo y la salida se limita a los logits de las posiciones solicitadas. Esta decisión de diseño reduce el coste de cómputo por paso y permite intercambiar el "programa" sin volver a exportar el modelo, ya que el adaptador viaja como tensor de entrada. La exportación está en fp16 y fusionada para el execution provider de WebGPU de ONNX Runtime Web, de modo que la inferencia ocurre íntegramente en el cliente.

Los programas bajo `demo/<id>/` son adaptadores PEFT LoRA de rango 64 generados con el compilador PAW publicado, a través de `program-as-weights-server`, y siguen el mismo diseño de directorios que el repositorio `programasweights/paw-programs`. Los directorios `encoder/` y `mapper/` contienen copias recuantizadas del compilador PAW (`programasweights/paw-4b-qwen3-0.6b`) y de su mapeador LoRA, presumiblemente adaptadas para su ejecución en navegador. No se documentan en la model card ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni si hubo etapas de RLHF o DPO: los adaptadores son artefactos compilados, no el resultado de un entrenamiento descrito públicamente por este autor.

## Capacidades

- Ejecución de programas PAW en el navegador mediante ONNX Runtime Web con backend WebGPU, sin servidor de inferencia.
- Inyección dinámica de adaptadores LoRA (rango 64) como entradas del grafo ONNX, lo que permite alternar programas sin recargar el modelo base.
- Cálculo de logits restringido a posiciones concretas de la secuencia, planteado para decodificación dirigida por el programa.
- Generación de texto heredada del modelo base Qwen3-0.6B, aunque no se documentan capacidades concretas en la model card.
- Distribución de "programas" como artefactos de pesos versionables y empaquetables, con el mismo layout que `programasweights/paw-programs`.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Demos interactivas de Program-as-Weights en el navegador: el repositorio permite servir una demo de PAW sin backend, cargando el intérprete ONNX y el adaptador correspondiente y ejecutando todo en la GPU del cliente vía WebGPU.
- Investigación reproducible sobre PAW: al distribuir el compilador recuantizado (`encoder/`, `mapper/`) junto con programas de ejemplo, un grupo de investigación puede reproducir el pipeline completo de compilación y ejecución sin depender de servicios externos.
- Comparación de adaptadores LoRA sobre un mismo grafo: dado que el adaptador es una entrada del grafo, es posible enfrentar varios programas en la misma sesión de navegador y medir diferencias de comportamiento sin reexportar el modelo.
- Aplicaciones web con privacidad por diseño: escenarios donde el texto del usuario no debe salir del dispositivo (asistentes locales, formularios asistidos) pueden apoyarse en la inferencia en cliente, siempre que el caso de uso encaje en la licencia.
- Docencia y talleres sobre compilación de programas a pesos: el tamaño reducido de Qwen3-0.6B y el formato ONNX facilitan explicar el flujo "programa a adaptador, adaptador a grafo" en un aula con portátiles convencionales.
- Experimentos de decodificación con logits restringidos: la salida por posiciones solicitadas resulta útil para investigar decodificación guiada, restricciones gramaticales o selección de vocabulario controlada por el programa.
- Empaquetado y distribución de variantes de comportamiento: publicar múltiples "programas" como adaptadores de rango 64 facilita versionar comportamientos sin duplicar el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió documentación técnica relacionada (únicamente páginas de ayuda de YouTube sin relación con el modelo).

## Requisitos de hardware

- Inferencia en cliente con WebGPU: se requiere un navegador con soporte de WebGPU; la model card no especifica versiones mínimas.
- VRAM estimada: el modelo base de 0,6 mil millones de parámetros en fp16 ocupa aproximadamente 1,2 GB de pesos; a ello hay que sumar el adaptador LoRA y el espacio de trabajo de la sesión ONNX.
- Repositorio completo: 2,4 GB en disco, aunque no es necesario cargar todos los artefactos para una ejecución concreta.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el intérprete es apto para GPUs de consumo e incluso para gráficas integradas con WebGPU, siempre que la memoria de vídeo disponible supere el tamaño de los pesos más el espacio de trabajo.
- Despliegue: ONNX Runtime Web con execution provider WebGPU es la ruta documentada. vLLM, TGI, llama.cpp u Ollama no se mencionan en la model card para estos artefactos; el modelo base Qwen3-0.6B sí puede desplegarse con esas herramientas, pero no es lo que distribuye este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque de despliegue |
|---|---|---|---|---|
| naklitechie/swage-models | ~0,6 B (base) + LoRA rango 64 | No disponible (base: 32 768 tokens) | Mixta, uso de investigacion | ONNX fp16 para ORT-web WebGPU, programas como adaptadores LoRA |
| Qwen/Qwen3-0.6B | ~0,6 B | 32 768 tokens segun su model card | Apache-2.0 | Pesos originales; requiere conversion propia a ONNX o GGUF |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32 768 tokens segun su model card | Apache-2.0 | Amplio soporte en llama.cpp, vLLM y runtimes de navegador |
| SmolLM2-360M-Instruct | ~0,36 B | 8 192 tokens segun su model card | Apache-2.0 | Orientado a ejecucion en dispositivo, con soporte en transformers.js |

Los datos de los modelos alternativos provienen de sus respectivas model cards publicas y no se han verificado en esta ficha. La diferencia de `swage-models` no esta en el rendimiento del modelo base, sino en el mecanismo de programacion por pesos y en su empaquetado para navegador.

## Limitaciones y advertencias

- Licencia mixta y no resuelta: el interprete deriva de Qwen3-0.6B (Apache-2.0), pero los pesos upstream del compilador PAW no incluyen fichero de licencia y la model card los declara para uso de investigación, con términos pendientes de confirmación con los autores. El uso comercial no está autorizado de forma clara.
- Los prompts incluidos en los programas son propiedad de los autores de PAW y se distribuyen bajo CC BY 4.0, lo que obliga a atribución si se reutilizan.
- Modelo base de 0,6 mil millones de parámetros: capacidad de razonamiento y conocimiento factual limitados, con riesgo elevado de alucinación en tareas abiertas.
- Idiomas soportados no declarados en la model card; no se puede asumir un comportamiento multilingüe fiable sin evaluación propia.
- Longitud de contexto no especificada para los artefactos ONNX; el límite práctico depende de la exportación, del tamaño de la ventana y de la memoria disponible en el navegador.
- Artefacto experimental con 0 descargas y 0 likes, publicado y actualizado el mismo día, sin pipeline declarado ni garantía de mantenimiento.
- Dependencia de WebGPU: la compatibilidad depende del navegador, del sistema operativo y del driver de la GPU, lo que fragmenta la experiencia en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, latencia o consumo frente a alternativas.
- La referencia al paper PAW (arXiv 2607.02512) aparece únicamente en la model card; no se ha podido verificar su contenido con la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/naklitechie/swage-models
- Sitio del proyecto swage: https://swage.naklitechie.com
- Paper citado en la model card: arXiv 2607.02512 (Program-as-Weights)
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de programas PAW mencionado: `programasweights/paw-programs`
- Compilador PAW mencionado: `programasweights/paw-4b-qwen3-0.6b`
- Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas de ayuda de YouTube y no guardan relacion con el modelo; no se han encontrado articulos, blogs ni demos adicionales verificables.
