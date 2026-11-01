# ReallyFloppyPenguin/Qwen3.5-4B-3D-Coder-GGUF-split

## Resumen

Qwen3.5-4B-3D-Coder-GGUF-split es una versión cuantizada y fragmentada del modelo ccore/Qwen3.5-4B-3D-Coder, publicada por el usuario ReallyFloppyPenguin en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un repositorio de distribución: contiene los mismos pesos en formato GGUF con cuantización Q4_K_M, divididos en fragmentos de 512 MB o menos mediante la herramienta `llama-gguf-split`. El propósito de esta fragmentación es sortear la limitación de los navegadores, que no pueden cargar ficheros individuales superiores a 2 GB, permitiendo así ejecutar el modelo directamente en el navegador con la librería wllama sobre WebGPU.

El modelo base, ccore/Qwen3.5-4B-Coder, es un modelo de unos 4.200 millones de parámetros especializado en generación de código 3D, concretamente con la librería three.js. Su caso de uso principal es la generación de escenas y mundos 3D a partir de instrucciones en lenguaje natural, y de hecho alimenta el Space "3D World Generator (WebGPU)" del mismo autor. Su relevancia radica en la tendencia actual de ejecutar LLM especializados completamente en cliente, sin servidor ni API, lo que reduce costes y problemas de privacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, detalles no disponibles) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fragmentado en shards de ≤512 MB); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, ccore/Qwen3.5-4B-3D-Coder, pertenece a la familia Qwen3.5 y, como su nombre indica, es una variante de 4B orientada a la generación de código 3D con three.js. No se han publicado en la información disponible detalles sobre la arquitectura concreta (número de capas, cabezas de atención, GQA, etc.) ni sobre el proceso de entrenamiento: número de tokens, composición del dataset o uso de técnicas como RLHF o DPO. Todo ello debe consultarse, si existe, en la model card del modelo original.

Esta variante concreta no modifica los pesos: el repositorio se limita a convertir el modelo a GGUF con cuantización Q4_K_M y a dividirlo en fragmentos de 512 MB o menos con `llama-gguf-split`. La novedad técnica está en el despliegue: los shards permiten que wllama cargue el modelo por streaming en el navegador y lo ejecute sobre WebGPU, evitando la restricción de los navegadores contra ficheros únicos de más de 2 GB.

## Capacidades

- Generación de código three.js para crear escenas y mundos 3D a partir de descripciones en lenguaje natural (función principal del modelo base).
- Generación de texto conversacional, al estar etiquetado como modelo conversacional.
- Ejecución completamente en el navegador mediante wllama y WebGPU, sin necesidad de servidor de inferencia.
- Compatibilidad con el ecosistema llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No consta en la información disponible soporte de tool calling, capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Generación de mundos 3D en el navegador: el modelo genera código three.js que se ejecuta directamente en el cliente, como demuestra el Space "3D World Generator (WebGPU)", sin coste de servidor ni API de pago.
- Prototipado rápido de escenas 3D: un desarrollador frontend puede describir una escena ("un bosque con árboles low-poly y niebla") y obtener código three.js funcional para iterar rápidamente.
- Herramientas educativas: integración en aplicaciones web que enseñen programación gráfica, permitiendo a estudiantes ver cómo se traduce una descripción en código three.js, todo ejecutándose localmente en su máquina.
- Demos y portfolios sin backend: al ejecutarse 100 % en cliente con WebGPU, se pueden publicar demos interactivas en sitios estáticos (GitHub Pages, Netlify) sin infraestructura de inferencia.
- Privacidad en la generación de código: al no salir los datos del navegador, es adecuado para entornos corporativos donde el código o las descripciones no pueden enviarse a APIs externas.
- Asistente de código 3D offline: con el GGUF también puede ejecutarse localmente con llama.cpp u Ollama en un portátil, útil para trabajo sin conexión.
- Base para experimentación con inferencia en cliente: el esquema de shards de ≤512 MB sirve como referencia para quien quiera distribuir otros GGUF grandes para wllama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El GGUF Q4_K_M completo ocupa unos 2,7 GB, por lo que en inferencia local se estima una necesidad de RAM/VRAM de entre 3 y 4 GB aproximadamente para el modelo más el contexto (estimación basada en el tamaño del repo; no hay cifras oficiales).
- En el navegador con wllama + WebGPU: no requiere GPU dedicada de servidor; basta una GPU con soporte WebGPU (Chrome/Edge recientes con GPU integrada moderna, o GPUs dedicadas de consumo). La carga se hace por shards de ≤512 MB.
- En consumo local con llama.cpp/Ollama: cabe con holgura en GPUs de consumo habituales (RTX 3060 de 12 GB, RTX 4060, etc.) e incluso puede ejecutarse solo con CPU dada su cuantización de 4 bits, aunque con menor velocidad.
- No se requieren GPUs de datacenter (A100/H100) para este modelo.
- Opciones de despliegue: wllama (navegador, WebGPU), llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; también servidores como llama-server. No se ha documentado el despliegue con vLLM o TGI al ser un formato GGUF.
- No hay datos publicados de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Especialización | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder (ccore) | 4.206 M | safetensors / GGUF | Código 3D con three.js | Apache 2.0 |
| Qwen2.5-Coder-3B / 7B (Alibaba) | 3B / 7B | safetensors, GGUF | Código general (múltiples lenguajes) | Apache 2.0 / Qwen Research (según tamaño) |
| DeepSeek-Coder-V2-Lite (MoE) | 16B (2,4B activos) | safetensors, GGUF | Código general | DeepSeek License (uso comercial restringido) |

Frente a los modelos de código general, Qwen3.5-4B-3D-Coder destaca por su especialización en three.js y por la distribución pensada para ejecución en navegador; a cambio, se espera que sea menos versátil en otros lenguajes o tareas generales, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- Alcance muy especializado: está orientado a generación de código 3D con three.js; su rendimiento en tareas generales de código, razonamiento o conversación no está documentado y probablemente sea inferior al de modelos generalistas.
- No hay benchmarks publicados ni datos de evaluación en la información disponible, por lo que su calidad debe validarse empíricamente antes de usarlo en producción.
- Datos técnicos clave (longitud de contexto, idiomas soportados, detalles de entrenamiento) no están disponibles en esta ficha de repositorio; deben consultarse en la model card del modelo base ccore/Qwen3.5-4B-3D-Coder.
- La ejecución en navegador vía WebGPU depende del soporte del navegador y del hardware del usuario; en equipos sin WebGPU funcional no funcionará por esa vía.
- Riesgo de alucinación de código: como todo LLM, puede generar código three.js incorrecto o con APIs obsoletas; conviene revisar y probar el código generado.
- Sesgos: no se ha documentado ningún análisis de sesgos para este modelo.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de conservar los avisos de licencia.
- Se trata de un repositorio de terceros (ReallyFloppyPenguin) que redistribuye pesos de otro autor (ccore); para soporte y documentación de uso, la fuente autorizada es el modelo original.

## Enlaces

- Repositorio del modelo (GGUF split): https://huggingface.co/ReallyFloppyPenguin/Qwen3.5-4B-3D-Coder-GGUF-split
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Space que usa el modelo: https://huggingface.co/spaces/ReallyFloppyPenguin/3D-World-Generator-WebGPU
- wllama (librería de inferencia en navegador): https://github.com/ngxson/wllama
