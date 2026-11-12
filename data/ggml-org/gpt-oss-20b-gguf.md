# ggml-org/gpt-oss-20b-GGUF

## Resumen

gpt-oss-20b-GGUF es la conversión a formato GGUF del modelo gpt-oss-20b de OpenAI, publicada por el equipo de ggml-org (los mantenedores de llama.cpp). Se trata de una versión cuantizada y empaquetada para su ejecución eficiente en CPU y GPU consumer mediante llama.cpp, Ollama, LM Studio y otras herramientas compatibles con GGUF. El modelo base es el primer lanzamiento de pesos abiertos de OpenAI, publicado bajo licencia Apache 2.0.

El modelo resuelve el problema de desplegar un LLM de razonamiento de aproximadamente 21.000 millones de parámetros en hardware modesto, ofreciendo pesos ya convertidos y listos para usar con `llama serve -hf ggml-org/gpt-oss-20b-GGUF` o en la aplicación Llama. Al estar basado en el gpt-oss-20b original, hereda sus capacidades de razonamiento, generación de código y soporte de tool calling, pero en un formato optimizado para inferencia local.

Su relevancia radica en que combina una licencia permisiva (Apache 2.0), un tamaño manejable y un ecosistema de despliegue maduro (llama.cpp), lo que lo convierte en una opción práctica para desarrolladores que quieren ejecutar un modelo de OpenAI en su propia infraestructura sin depender de la API. El repositorio acumula más de 371.000 descargas y 200 "likes", lo que refleja una adopción notable en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base openai/gpt-oss-20b; detalles de arquitectura no disponibles en la informacion proporcionada) |
| Parametros totales | 20.914.757.184 (aprox. 20,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no disponibles en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La ficha corresponde a una conversión automática del modelo openai/gpt-oss-20b realizada con la herramienta ggml-org/convert. El modelo base es un transformer de aproximadamente 20,9 mil millones de parámetros publicado por OpenAI. No se dispone en la información proporcionada de detalles sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

Como innovación destacable del ecosistema de despliegue, el repositorio referencia un modelo especulador (RedHatAI/gpt-oss-20b-speculator.eagle3) compatible con decodificación especulativa EAGLE3, lo que permite acelerar la generación en llama.cpp. La conversión a GGUF facilita la ejecución en CPU, GPU y entornos mixtos, con soporte para cuantizaciones de distinto nivel según el hardware disponible.

## Capacidades

- Generación de texto conversacional y de propósito general, etiquetado como `text-generation` y `conversational`.
- Razonamiento y resolución de problemas (heredado del modelo base gpt-oss-20b).
- Generación de código y tareas de programación (capacidad del modelo base; no verificada de forma independiente en esta ficha).
- Soporte de tool calling / function calling (capacidad del modelo base; no verificada en la información proporcionada).
- Ejecución local mediante llama.cpp, con compatibilidad con `endpoints_compatible` según las etiquetas del repositorio.
- Aceleración mediante decodificación especulativa con el modelo EAGLE3 referenciado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo: el formato GGUF permite ejecutar el modelo en CPU o GPU consumer con llama.cpp, sin necesidad de infraestructura en la nube, lo que resulta adecuado para prototipado y desarrollo offline.
- Asistentes de código en el IDE: al estar basado en gpt-oss-20b, puede integrarse en flujos de autocompletado y generación de código ejecutándose en la máquina del desarrollador, evitando el envío de código a servicios externos.
- Chatbots de atención al cliente autoalojados: la licencia Apache 2.0 y el despliegue local permiten montar asistentes conversacionales sin costes por token de API ni dependencia de terceros.
- Procesamiento por lotes de documentos: el modelo puede ejecutarse en servidores con llama.cpp o vLLM (si se convierte a otro formato) para resumir, clasificar o extraer información de grandes volúmenes de texto.
- Educación e investigación: sirve como banco de pruebas para estudiar cuantización, decodificación especulativa y rendimiento de LLM en hardware modesto, gracias a su tamaño de ~21B parámetros.
- Aplicaciones de escritorio y edge: la app Llama y herramientas como Ollama o LM Studio permiten empaquetar el modelo en aplicaciones de escritorio con inferencia totalmente local.
- Evaluación de pipelines de agentes: la compatibilidad con endpoints y tool calling del modelo base facilita experimentar con flujos multi-paso en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; como referencia orientativa, un modelo de ~21B parámetros en cuantización de 4 bits requiere del orden de 12-14 GB de memoria, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada oficialmente; el formato GGUF está diseñado para ejecución en CPU y GPU de gama consumer, pero no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (`llama serve -hf ggml-org/gpt-oss-20b-GGUF`), aplicación Llama (https://llama.app), y cualquier herramienta compatible con GGUF (Ollama, LM Studio, etc.).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ggml-org/gpt-oss-20b-GGUF | ~20,9B | no disponible | Apache 2.0 | GGUF | Hugging Face (371k+ descargas) |
| openai/gpt-oss-20b | ~20,9B | no disponible | Apache 2.0 | safetensors | Hugging Face |
| RedHatAI/gpt-oss-20b-speculator.eagle3 | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo especulador) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base openai/gpt-oss-20b.
- Riesgo de alucinación: inherente a los LLM; no se han publicado evaluaciones específicas en la información disponible.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar los términos del modelo base original de OpenAI para confirmar condiciones adicionales.
- Cuantización: al tratarse de una conversión automática a GGUF, la calidad puede degradarse respecto al modelo original en safetensors, especialmente en cuantizaciones agresivas; no se especifican los niveles de cuantización incluidos.
- Conversión automática: el repositorio indica que el modelo se convierte automáticamente con ggml-org/convert, por lo que no hay garantía de validación manual exhaustiva por parte del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Modelo base original: https://huggingface.co/openai/gpt-oss-20b
- Modelo especulador EAGLE3: https://huggingface.co/RedHatAI/gpt-oss-20b-speculator.eagle3
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
