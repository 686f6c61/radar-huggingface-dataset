# mu2solutions/Molmo2-8B-GGUF

## Resumen

Molmo2-8B-GGUF es la conversión a formato GGUF del modelo multimodal Molmo2-8B desarrollado por el Allen Institute for AI (Ai2). Se trata de un modelo de imagen-a-texto que combina un codificador visual SigLIP con un proyector de cross-attention con pooling sobre un backbone de texto Qwen3-8B, lo que le otorga 8.190.817.280 parámetros totales. La conversión la publica Mu2 Solutions bajo licencia Apache 2.0, sin restricciones adicionales respecto al modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta una de las pocas conversiones GGUF disponibles de la familia Molmo2, pensada para ejecución local con llama.cpp. Por otro, y de forma crítica, el propio autor advierte de que la generación con visión está rota en esta variante de 8B: el modelo emite una secuencia de tokens de imagen y espacios en blanco hasta agotar el presupuesto de generación, sin describir la imagen. El texto sin visión sí funciona correctamente.

El modelo base emplea la arquitectura `qwen3` como backbone textual con una base de frecuencia RoPE de 1.000.000, y un proyector `clip` de 315 tensores que incluye el ViT SigLIP, la cross-attention con pooling y un proyector SwiGLU con `projection_dim` de 4096. La conversión está congelada sobre la revisión `e28fa28597e5` del modelo original, fijada el 23 de enero de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador visual SigLIP + proyector de cross-attention con pooling + backbone de texto Qwen3-8B (arquitectura `qwen3`, RoPE base 1.000.000) |
| Parametros totales | 8.190.817.280 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso fija `-c 8192`) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (texto); F16 para el proyector multimodal (mmproj) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto y mmproj separados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal compuesto por tres bloques: un codificador de visión SigLIP (ViT), un proyector de cross-attention con pooling que agrega los embeddings visuales, y un proyector SwiGLU con dimensión de proyección 4096 que los inyecta en el modelo de lenguaje. El backbone textual es Qwen3-8B, con arquitectura `qwen3` y base de frecuencia RoPE de 1.000.000, verificada contra el `config.json` publicado por Ai2. El fichero mmproj contiene 315 tensores y separa los tensores de pooling `mm.pool.k` y `mm.pool.v`, además de incorporar la fila `mm.image_patch_add`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La conversión a GGUF se realizó con el conversor HF-to-GGUF de llama.cpp junto con el conversor de visión de Molmo2 propio de Mu2, en el commit `c3d25ece9`, y la plantilla de chat se incrustó desde el repositorio original. Es importante señalar que la conversión se generó con un fork experimental de llama.cpp: el soporte de Molmo2 no está en el repositorio upstream `ggml-org/llama.cpp` (comprobado en la build 12359, sin coincidencias de `molmo2` en el árbol de código), y estos ficheros solo cargan en el fork de Mu2 fijado en la build `b11936`.

## Capacidades

- Generación de texto autoregresiva: verificada a través del endpoint de completion de `llama-server`; el prompt `The capital of France is` devuelve ` Paris. The capital of France is Paris. The capital of France is Paris.`
- Codificación de imágenes: el grafo de codificación visual se ejecuta hasta completarse con una vista de 378x378 píxeles.
- Generación multimodal (imagen a texto): no funcional en esta variante de 8B, según la verificación del autor.
- Plantilla de chat incrustada, procedente del repositorio original, con `--jinja` para su uso en `llama-server`.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional (tag `conversational`).
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modos especiales (thinking, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de texto en local con llama.cpp: el modelo funciona como un LLM de 8B parámetros en formato GGUF, ejecutable con `llama-server -m Molmo2-8B-text-Q4_K_M.gguf --jinja -c 8192`, adecuado para prototipos y despliegues sin GPU dedicada.
- Evaluación y depuración de la integración de Molmo2 en llama.cpp: el fallo de generación con visión está documentado con un comando de reproducción exacto (`llama-mtmd-cli` con `--mmproj` y una imagen), lo que lo convierte en un caso de prueba útil para quien trabaje en el soporte upstream del grafo de visión.
- Reproducción de investigación sobre proyectores multimodales: al estar disponibles por separado el texto y el mmproj (315 tensores, `projection_dim` 4096), permite aislar el comportamiento del proyector frente al backbone Qwen3-8B en experimentos controlados.
- Comparación de cuantizaciones: la disponibilidad de F16, Q8_0 y Q4_K_M sobre el mismo modelo permite medir el impacto de la cuantización en la perplejidad y en la calidad de generación textual.
- Despliegue de texto con requisitos de licencia permisiva: la licencia Apache 2.0 sin restricciones adicionales facilita su incorporación en productos comerciales, siempre que se use únicamente la ruta de texto.
- Sustitución por variantes funcionales para tareas de visión: para aplicaciones reales de imagen a texto con este mismo tooling, el autor remite a Molmo2-4B o Molmo2-O-7B, que sí describen imágenes correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento medidos que constan son de verificación funcional y latencia en hardware concreto, no comparativas de calidad:

| Medición | Valor | Hardware |
|---|---|---|
| Codificación de imagen (1 vista 378x378) | 493.673 ms y 502.118 ms en dos ejecuciones | Intel i3-2100, solo CPU, sin F16C |
| Codificación de imagen (referencia) | ~0,6 s | Intel Arc A770 |
| Generación de texto | Correcta (salida verificada) | Intel i3-2100, solo CPU |

## Requisitos de hardware

- VRAM estimada para inferencia (solo texto): aproximadamente 16,4 GB en F16, 8,71 GB en Q8_0 y 5,03 GB en Q4_K_M, según el tamaño de los ficheros; el proyector mmproj añade 943 MB.
- GPU recomendadas: no se especifican en la información proporcionada. La codificación visual es intensiva en CPU y se acelera notablemente con GPU: alrededor de 0,6 s por vista en una Intel Arc A770 frente a unos 8 minutos en un i3-2100 sin F16C.
- Cabe en GPU de consumo: la cuantización Q4_K_M (5,03 GB) deja margen suficiente en GPUs con 8 GB o más para la ruta de texto; Q8_0 requiere 12 GB o más; F16 requiere 24 GB o más. Estas estimaciones se derivan de los tamaños de fichero, no de mediciones publicadas.
- Opciones de despliegue: `llama-server` y `llama-mtmd-cli` de llama.cpp, exclusivamente mediante el fork experimental de Mu2 (build `b11936`); no hay soporte en upstream. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles más allá de los tiempos de codificación visual citados.

## Comparativa con modelos similares

| Modelo | Parametros | Vision funcional | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Molmo2-8B-GGUF (este) | 8.190.817.280 | No (fallo documentado) | No disponible | Apache 2.0 | GGUF en HF, fork de llama.cpp |
| Molmo2-4B-GGUF | No disponible | Sí, verificado | No disponible | Apache 2.0 | GGUF en HF, mismo tooling |
| Molmo2-O-7B-GGUF | No disponible | Sí, verificado | No disponible | Apache 2.0 | GGUF en HF, mismo tooling |
| allenai/Molmo2-8B (original) | 8.190.817.280 | No evaluado en esta información | No disponible | Apache 2.0 | Pesos originales en HF |

La comparación se limita a las variantes de la misma familia porque la información proporcionada no incluye datos de benchmarks ni de modelos de otros desarrolladores.

## Limitaciones y advertencias

- La generación con visión está rota en esta conversión: ante una imagen y el prompt `Describe this image in one sentence.`, el modelo emite `The image<im_patch><frame_start>` seguido de espacios en blanco hasta agotar el presupuesto de tokens, tanto con 40 como con 90 tokens. No describe la imagen.
- El fallo se ha acotado por comparación con Molmo2-4B, que funciona con el mismo tooling: la plantilla de chat es idéntica byte a byte (3.169 caracteres, cero diferencias), el tokenizador y los metadatos del proyector coinciden salvo el `projection_dim` esperado, y todos los tensores están presentes con la forma y el tipo correctos. Se atribuye a la interfaz entre los embeddings de imagen y el modelo de texto, no a los pesos ni al formato del proyector, y requiere una comparación capa por capa contra una referencia de transformers.
- Dependencia de un fork no oficial: los ficheros solo cargan en la build `b11936` del fork de Mu2; el upstream de llama.cpp no soporta el grafo de visión de Molmo2.
- El proyector se reemplazó el 28 de septiembre de 2026. La versión anterior (943.332.544 bytes) usaba un layout fusionado `mm.pool.kv` y omitía la fila `mm.image_patch_add`, por lo que falla al cargar con `unable to find tensor mm.pool.k.weight`. Si se descargó antes de esa fecha, hay que volver a descargarlo (la versión actual tiene 943.346.336 bytes).
- La codificación visual es intensiva en CPU: unos 8 minutos por vista de 378x378 en un i3-2100 sin F16C, lo que la hace inviable en ese hardware para uso interactivo.
- Riesgo de alucinación y sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados y limitaciones de contexto: no disponibles en la información proporcionada.
- Restricciones de licencia: ninguna adicional; Apache 2.0 permite uso comercial. La limitación práctica es técnica (visión no funcional), no legal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mu2solutions/Molmo2-8B-GGUF
- Modelo base: https://huggingface.co/allenai/Molmo2-8B
- Variante con visión funcional (4B): https://huggingface.co/mu2solutions/Molmo2-4B-GGUF
- Variante con visión funcional (O-7B): https://huggingface.co/mu2solutions/Molmo2-O-7B-GGUF
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
