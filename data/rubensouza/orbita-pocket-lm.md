# RubenSouza/orbita-pocket-lm

## Resumen

Orbita Pocket LM es un modelo de lenguaje conversacional publicado por el usuario RubenSouza en HuggingFace bajo licencia Apache 2.0, con aproximadamente 269 millones de parámetros (269.228.032 según los metadatos de safetensors). El repositorio, de tan solo 0,2 GB, se distribuye en formato GGUF, lo que lo orienta a inferencia local y en dispositivos con recursos limitados. La model card publicada es prácticamente vacía: únicamente contiene la declaración de licencia, sin descripción, sin datos de entrenamiento y sin resultados de evaluación.

Por su tamaño, el modelo se sitúa en la categoría de modelos "pocket" o "tiny" (rango 100-500 M de parámetros), pensados para ejecutarse en CPU, en GPUs de consumo muy modestas, en navegador o en dispositivos móviles. El tag `conversational` sugiere un ajuste orientado a diálogo, y el tag `endpoints_compatible` indica que está preparado para desplegarse en infraestructuras compatibles con Inference Endpoints. Sin embargo, no hay información pública sobre arquitectura, longitud de contexto, idiomas soportados ni proceso de entrenamiento.

La relevancia de esta ficha es principalmente descriptiva: se trata de un modelo de muy reciente creación (subido en octubre de 2026) con cero descargas y cero likes en el momento de la consulta, y sin documentación técnica. Cualquier evaluación de producción debería hacerse mediante pruebas propias, ya que no existe evidencia publicada de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (sin información en la model card ni en los metadatos) |
| Parámetros totales | 269.228.032 (≈269 M) |
| Parámetros activos | No aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF como formato de distribución; niveles concretos (Q4_K_M, Q8_0, etc.) no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tag del repositorio); el recuento de parámetros procede de metadatos safetensors |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card se limita a la línea `license: apache-2.0` y no incluye descripción de la red, número de capas, dimensión oculta, mecanismo de atención ni tipo de tokenizador. Tampoco se indica si emplea attention completa, atención lineal, SSM o una combinación híbrida. El recuento de 269 M de parámetros es el único dato estructural fiable disponible.

Respecto al entrenamiento, no hay datos sobre volumen de tokens, composición del corpus, idiomas de preentrenamiento, ni sobre si se aplicaron técnicas de alineación como SFT, RLHF o DPO. El tag `conversational` sugiere algún tipo de ajuste para diálogo, pero su naturaleza y alcance son desconocidos. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, cuantización consciente del entrenamiento, destilación, etc.).

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a mantener diálogos multi-turno, aunque no se especifica la longitud de contexto efectiva.
- Formato GGUF: pensado para ejecutarse con llama.cpp y runtimes derivados (Ollama, LM Studio, KoboldCpp, llama-cpp-python), lo que facilita el despliegue local.
- Compatibilidad con endpoints: el tag `endpoints_compatible` apunta a que puede servirse detrás de APIs compatibles con el esquema de HuggingFace Inference Endpoints.
- Tool calling / function calling: no disponible; no hay evidencia en la documentación de que el modelo soporte llamadas a herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible; sin benchmarks ni documentación que lo respalden.
- Capacidades multilingües: no disponibles; no se declara ningún conjunto de idiomas.
- Visión, audio o modalidades adicionales: no disponible; los tags no incluyen ninguna indicación multimodal.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Asistente conversacional completamente local en escritorio: con 269 M de parámetros y pesos GGUF, el modelo puede ejecutarse en CPU o en una GPU integrada, lo que permite ofrecer un chatbot sin conexión y sin enviar datos a terceros. Adecuado para prototipos de privacidad por diseño.
- Autocompletado y generación de texto en el navegador: un modelo de este tamaño es candidato a ejecutarse con WebGPU o WASM (por ejemplo, mediante transformers.js o wllama) para funciones de escritura asistida en aplicaciones web, sin coste de servidor.
- Clasificación y etiquetado de textos cortos mediante prompts: con 269 M de parámetros el modelo puede usarse para tareas de extracción de entidades, clasificación de intenciones o moderación de primer nivel en pipelines de bajo coste, siempre que se valide su calidad empíricamente.
- Generación de respuestas en sistemas de FAQ y atención al cliente de nicho: si se afina o se condiciona con contexto, puede cubrir dominios acotados con respuestas cortas; su huella de memoria mínima permite desplegar muchas instancias en un solo servidor.
- Componente base para fine-tuning ligero: al ser Apache 2.0 y tener 269 M de parámetros, es viable ajustarlo con LoRA en una única GPU de consumo (por ejemplo, una RTX 3060 de 12 GB) para dominios específicos o idiomas no cubiertos.
- Generación de texto en entornos embebidos o IoT: el tamaño del repositorio (0,2 GB) y la posibilidad de cuantizar a 4 bits permiten alojarlo en dispositivos con poca memoria, como una Raspberry Pi, para tareas de generación breve y control de diálogo.
- Prototipado rápido de pipelines RAG: puede actuar como generador final en un sistema de recuperación de documentación técnica, donde la latencia baja y el coste nulo por token son prioritarios frente a la calidad máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningún otro conjunto de evaluación, y la búsqueda web no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos eran ruido sin relación alguna con el repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo teórico a partir de 269 M de parámetros): ≈0,54 GB en FP16, ≈0,27 GB en cuantización de 8 bits y ≈0,14 GB en 4 bits, a lo que hay que sumar el espacio de la caché KV (dependiente de una longitud de contexto no documentada).
- El tamaño del repositorio (0,2 GB) es coherente con pesos cuantizados en el rango de 4 a 8 bits, aunque el nivel exacto no está documentado.
- GPU recomendadas: cualquier GPU de consumo moderna es sobradamente suficiente (RTX 3060, RTX 4060, RTX 4090, GTX 1650). También es viable la ejecución en CPU pura y en GPUs integradas.
- Cabe holgadamente en GPUs de consumo, incluso en modelos con 4 GB o menos de VRAM, y probablemente en dispositivos móviles de gama alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y servidores compatibles con el formato GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos sus backends, por lo que requerirían convertirlo a safetensors.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa y no verificada, un modelo de este tamaño en CPU moderna suele generar del orden de decenas de tokens por segundo, y en GPU de consumo cientos; son estimaciones por tamaño, no datos del autor.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus model cards públicas y no de la información proporcionada en esta búsqueda; se incluyen como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks públicos |
|---|---|---|---|---|---|
| Orbita Pocket LM (RubenSouza) | ≈269 M | No disponible | Apache 2.0 | GGUF | No disponibles |
| SmolLM2-360M-Instruct (HuggingFace) | 361 M | 8.192 tokens | Apache 2.0 | Safetensors, GGUF | Sí (publicados en su model card) |
| Qwen2.5-0.5B-Instruct (Alibaba) | 494 M | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Sí (publicados en su model card) |
| Gemma 3 270M (Google) | 268 M | 32.768 tokens | Licencia Gemma (uso comercial con condiciones) | Safetensors, GGUF | Sí (publicados en su model card) |

La comparación relevante es por tamaño y despliegue: las tres alternativas documentan contexto, idiomas de entrenamiento y resultados de evaluación, mientras que Orbita Pocket LM no ofrece ninguno de esos datos. La ventaja diferencial del modelo de RubenSouza es únicamente su licencia Apache 2.0 sin restricciones adicionales y su distribución ya cuantizada.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card técnica, ni paper, ni blog, ni repositorio de código asociado. Es imposible verificar qué se ha entrenado ni cómo.
- Sesgos: no se han documentado evaluaciones de sesgo, toxicidad o equidad. Al no conocerse la composición del dataset, el riesgo de sesgos no mitigados es alto.
- Alucinación: en modelos de este rango de tamaño la tasa de alucinación suele ser elevada, especialmente en tareas de conocimiento factual; no hay métricas publicadas que permitan acotar el riesgo.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin pruebas empíricas previas.
- Idiomas no declarados: no hay garantía de un rendimiento aceptable en castellano; el modelo podría estar entrenado predominantemente en inglés o en otro idioma.
- Discrepancia de metadatos: el recuento de parámetros aparece bajo el campo de safetensors mientras que los tags solo declaran GGUF; conviene verificar los archivos reales del repositorio antes de integrarlo.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificaciones sin restricciones adicionales, pero el autor no ofrece garantías de ningún tipo sobre el funcionamiento del modelo.
- Para producción: se recomienda tratarlo como modelo experimental y realizar una evaluación propia (perplejidad, pruebas de alucinación, evaluación de sesgos) antes de cualquier despliegue orientado a usuarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RubenSouza/orbita-pocket-lm
- Paper, blog, repositorio de código o demo: no disponible (la búsqueda web no devolvió ningún resultado relacionado con el modelo).
