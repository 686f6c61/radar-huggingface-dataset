# Docglasses-AI/gemma-4-E4B-it-qat-q4_0-gguf

## Resumen

Gemma 4 E4B it QAT q4_0 GGUF es un espejo (mirror) del modelo oficial de Google `google/gemma-4-E4B-it-qat-q4_0-gguf`, publicado por el usuario Docglasses-AI para su uso en el ecosistema DocGlasses / GenieX de inferencia en dispositivo (on-device). Se trata de la variante instruction-tuned de la familia Gemma 4, en su tamano E4B, ya cuantizada mediante Quantization-Aware Training (QAT) a Q4_0 y empaquetada en formato GGUF para su ejecucion con llama.cpp y runtimes compatibles.

El modelo cuenta con 7.463.013.674 parametros totales segun los metadatos de safetensors del repositorio, y el archivo GGUF resultante ocupa aproximadamente 5,15 GB (5.154.941.280 bytes). La cuantizacion QAT a Q4_0 permite reducir drasticamente el espacio en disco y la VRAM necesaria frente a los pesos en bf16/fp16, manteniendo una calidad cercana al modelo original gracias a que la cuantizacion se aplico durante el entrenamiento y no a posteriori.

Su relevancia es practica: ofrece un artefacto listo para desplegar en entornos con recursos limitados (portatiles, mini-PC, moviles de gama alta o GPUs de consumo) sin necesidad de convertir ni cuantizar los pesos manualmente. El repositorio no incluye informacion adicional sobre arquitectura interna, datos de entrenamiento o benchmarks; todo lo que se sabe proviene de los metadatos de Hugging Face y de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); detalles internos no disponibles |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT); otros formatos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (archivo `gemma-4-E4B_q4_0-it.gguf`, 5.154.941.280 bytes) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la pertenencia a la familia Gemma 4 en su variante E4B instruction-tuned. No se especifican el numero de capas, la dimension del modelo, el tipo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF, DPO u otras).

El rasgo tecnico destacable y verificable es el uso de Quantization-Aware Training (QAT) para producir los pesos Q4_0. A diferencia de la cuantizacion post-entrenamiento, el QAT simula los errores de cuantizacion durante el entrenamiento o ajuste fino, de modo que el modelo aprende a ser robusto frente a la precision reducida. El resultado es un GGUF de unos 5,15 GB que puede ejecutarse con llama.cpp y runtimes derivados, con una perdida de calidad tipicamente menor que la de una cuantizacion Q4_0 convencional. El autor indica ademas la etiqueta `geniex` y `on-device`, lo que sugiere un pipeline de inferencia local orientado a dispositivos de recursos limitados.

## Capacidades

- Generacion de texto conversacional en ingles, al ser una variante instruction-tuned (`-it`).
- Ejecucion local en dispositivo mediante llama.cpp y runtimes compatibles con GGUF.
- Inferencia con huella de memoria reducida gracias a la cuantizacion QAT Q4_0.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face).
- Soporte de tool calling, agentes, razonamiento multi-paso, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de otros idiomas.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede integrarse en aplicaciones de escritorio o moviles que necesiten un chatbot en ingles sin conexion a internet, aprovechando su formato GGUF y su tamano contenido de 5,15 GB.
- Prototipado rapido en portatiles: con llama.cpp u Ollama, un desarrollador puede levantar un servidor de generacion de texto en minutos para probar prompts y flujos conversacionales antes de escalar a modelos mayores.
- Inferencia en el borde (edge computing): adecuado para dispositivos con VRAM o RAM limitada donde no cabe un modelo en bf16, gracias a la cuantizacion Q4_0 entrenada con QAT.
- Procesamiento de texto por lotes en local: tareas de resumen, clasificacion o reescritura de textos en ingles ejecutadas en una maquina de sobremesa sin coste de API.
- Educacion y experimentacion: util como modelo de referencia para estudiar el impacto del QAT frente a la cuantizacion post-entrenamiento en la calidad de salida.
- Integracion en pipelines de GenieX / DocGlasses: el repositorio esta pensado como artefacto de despliegue para ese ecosistema, por lo que encaja en aplicaciones que ya usen ese runtime on-device.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo GGUF pesa 5,15 GB; se necesita al menos esa cantidad de memoria mas el espacio para el contexto KV, por lo que un presupuesto practico de 6-8 GB de RAM/VRAM es razonable para contextos moderados (estimacion, no dato oficial).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, encaja en GPUs de consumo con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en GPUs de datacenter (A100, H100) sin problema, aunque estas ultimas estarian sobredimensionadas.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8 GB o mas de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (Ollama, entre otros). Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B it QAT q4_0 (este) | 7.463.013.674 | no disponible | GGUF Q4_0 | Gemma Terms of Use | Hugging Face (mirror) |
| google/gemma-4-E4B-it-qat-q4_0-gguf (upstream) | no disponible en esta ficha | no disponible | GGUF Q4_0 | Gemma Terms of Use | Hugging Face (oficial) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos: no documentados en la informacion disponible; como modelo de lenguaje entrenado con datos web, es previsible que herede sesgos de esos datos.
- Alucinacion: riesgo inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Licencia: se aplican los Gemma Terms of Use de Google; es necesario revisar las restricciones de uso comercial y de redistribucion antes de desplegarlo en produccion.
- Naturaleza del repositorio: es un espejo no oficial de un modelo de Google; la responsabilidad de actualizaciones y correcciones recae en el autor del mirror, y conviene verificar la integridad del GGUF frente al repositorio upstream.
- Cuantizacion: aunque el QAT mitiga la perdida de calidad, Q4_0 sigue siendo una precision reducida; tareas sensibles a la precision (matematicas complejas, codigo critico) pueden degradarse.
- Falta de documentacion: no hay datos publicados sobre contexto maximo, arquitectura detallada, benchmarks ni requisitos oficiales de hardware, lo que dificulta planificar un despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Docglasses-AI/gemma-4-E4B-it-qat-q4_0-gguf
- Modelo upstream: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
