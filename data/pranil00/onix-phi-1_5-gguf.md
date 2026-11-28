# pranil00/ONIX-phi-1_5-GGUF

## Resumen

ONIX-phi-1_5-GGUF es una cuantización en formato GGUF (concretamente Q5_K_M) del modelo base microsoft/phi-1_5, publicada por el usuario pranil00 bajo el paraguas de la denominada "ONIX Community". No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos del phi-1_5 original de Microsoft a un formato optimizado para inferencia local con llama.cpp y Ollama.

El modelo base phi-1_5 es un transformer denso de aproximadamente 1.418 millones de parámetros (1,4 B), diseñado originalmente por Microsoft Research para tareas de generación de código y razonamiento básico en el ámbito educativo. Esta versión cuantizada reduce el peso de los pesos a unos 0,96 GB, lo que facilita su despliegue en hardware de consumo sin GPU dedicada de gama alta.

La relevancia de esta ficha es limitada pero útil para desarrolladores que necesiten ejecutar un modelo pequeño de generación de texto en local con recursos mínimos. Cabe señalar que el repositorio no incluye información sobre idiomas soportados, benchmarks ni detalles de entrenamiento más allá de la referencia al modelo base, y que el propio autor indica que la conversión se verificó mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de microsoft/phi-1_5) |
| Parametros totales | 1.418.270.720 (1,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (unico publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos cuantizados, ~0,96 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo phi-1_5 de Microsoft, un transformer denso de tipo decoder-only con aproximadamente 1,4 mil millones de parámetros. El modelo original fue entrenado por Microsoft Research con un enfoque en datos sintéticos y de alta calidad orientados a código y razonamiento matemático básico, aunque la model card de esta cuantización no aporta detalles adicionales sobre el número exacto de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

Esta publicación concreta no entrena ningún modelo nuevo: se limita a convertir los tensores del phi-1_5 original a formato GGUF con cuantización Q5_K_M mediante llama.cpp. El autor afirma haber verificado la autenticidad de la conversión de tensores y que el proceso se realizó en Apple Silicon con Metal. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto autoregresiva estándar.
- Generación y autocompletado de código, heredada del entrenamiento original de phi-1_5.
- Razonamiento matemático básico y resolución de problemas sencillos.
- Ejecución local en CPU y GPU de gama baja gracias al formato GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repo).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad multimodal (visión, audio) ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado rápido en local: permite probar pipelines de generación de texto en un portátil sin GPU dedicada, ya que el archivo GGUF ocupa menos de 1 GB y se ejecuta con llama.cpp u Ollama.
- Autocompletado de código en entornos con recursos limitados: al derivar de phi-1_5, puede sugerir fragmentos de código en editores o scripts de desarrollo, aunque con calidad inferior a modelos más grandes.
- Educación y experimentación: útil para estudiantes que quieran entender el funcionamiento de modelos cuantizados y comparar el efecto de Q5_K_M frente a los pesos originales en fp16.
- Generación de texto auxiliar en dispositivos edge: por su tamaño reducido, puede integrarse en aplicaciones de escritorio o sistemas embebidos con poca memoria.
- Pruebas de integración con Ollama: sirve para validar flujos de despliegue (`ollama run pranil00/ONIX-phi-1_5-GGUF`) antes de migrar a modelos mayores.
- Benchmarking de cuantizaciones: permite medir latencia y perplejidad de Q5_K_M frente a otras cuantizaciones del mismo modelo base en hardware concreto.
- Filtrado o clasificación de texto simple: tareas de etiquetado o resumen muy corto donde no se requiera alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB con Q5_K_M (pesos de ~0,96 GB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en GTX 1650, RTX 3050, RTX 4060 y superiores. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de gama baja o integrada con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-cli -m phi-1_5-Q5_K_M.gguf`), Ollama (`ollama run pranil00/ONIX-phi-1_5-GGUF`), y otros runners compatibles con GGUF (koboldcpp, LM Studio).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend (Metal, CUDA, CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-phi-1_5-GGUF (esta ficha) | 1,4 B | no disponible | Apache 2.0 | GGUF Q5_K_M | Hugging Face |
| microsoft/phi-1_5 (original) | 1,4 B | no disponible | MIT (según repo original) | safetensors | Hugging Face |
| microsoft/phi-2 | 2,7 B | no disponible | MIT | safetensors | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a parámetros, licencia y formato, ya que no se dispone de datos de rendimiento para esta cuantización concreta. Frente al phi-1_5 original, esta versión ofrece menor huella de memoria a costa de una posible pérdida de precisión por la cuantización Q5_K_M. Frente a phi-2 o TinyLlama, el modelo es más pequeño y presumiblemente menos capaz, pero también más ligero.

## Limitaciones y advertencias

- Modelo de solo 1,4 B de parámetros: capacidad limitada para razonamiento complejo, matemáticas avanzadas y código de producción.
- Riesgo elevado de alucinación, especialmente en dominios especializados y en tareas de conocimiento factual.
- No se documentan idiomas soportados; el modelo base phi-1_5 está orientado principalmente a inglés, por lo que el rendimiento en castellano puede ser deficiente.
- La cuantización Q5_K_M introduce pérdida de precisión respecto a los pesos originales en fp16; no se han publicado métricas de degradación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria; la "ONIX Community" no es una organización verificada de Hugging Face.
- Licencia Apache 2.0 declarada en el repo, pero conviene verificar la licencia del modelo base (el phi-1_5 original se distribuye bajo MIT) antes de uso comercial.
- Sin información sobre sesgos conocidos ni evaluaciones de seguridad.
- No apto para producción crítica sin una evaluación previa exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-phi-1_5-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-1_5
- llama.cpp (repositorio oficial): https://github.com/ggerganov/llama.cpp
- Ollama (repositorio oficial): https://github.com/ollama/ollama
