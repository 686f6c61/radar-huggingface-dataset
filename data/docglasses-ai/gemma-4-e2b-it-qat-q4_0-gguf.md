# Docglasses-AI/gemma-4-E2B-it-qat-q4_0-gguf

## Resumen

Gemma 4 E2B it qat q4_0 GGUF es un espejo (mirror) del modelo Gemma 4 E2B instruction-tuned publicado por Google, en su variante cuantizada mediante Quantization-Aware Training (QAT) a Q4_0 y empaquetada en formato GGUF para inferencia con llama.cpp. El repositorio lo mantiene el usuario Docglasses-AI como artefacto de distribución para sus proyectos DocGlasses y GenieX, orientados a inferencia on-device. No se trata de un modelo nuevo ni de un fine-tuning: los pesos proceden directamente del repositorio oficial de Google y el trabajo del autor se limita al reempaquetado en GGUF.

El modelo pertenece a la familia Gemma 4 de Google y, por su nomenclatura E2B, se posiciona como una variante de tamano efectivo reducido dentro de esa generacion, pensada para ejecucion en dispositivos con recursos limitados. El repositorio declara 4.628.569.635 parametros totales y un unico fichero de pesos de 3.349.516.256 bytes (aproximadamente 3,12 GiB), coherente con una cuantizacion de 4 bits. Es relevante porque permite desplegar un modelo de la familia Gemma con ajuste de instrucciones en hardware de consumo o en entornos embebidos sin necesidad de GPU dedicada, usando el ecosistema llama.cpp.

La informacion publicada en este repositorio es muy escasa: no se detallan arquitectura interna, composicion del dataset, resultados de benchmarks ni limites de contexto. La model card se limita a indicar el origen upstream, el fichero incluido y la licencia aplicable. Cualquier dato tecnico adicional debe consultarse en la model card oficial de Google, no incluida en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; detalles no publicados en este repositorio) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT, unico fichero publicado) |
| Idiomas soportados | en |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 3,3 GB |
| Fichero de pesos | gemma-4-E2B_q4_0-it.gguf (3.349.516.256 bytes) |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-gguf |
| Pipeline | text-generation |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna en este repositorio. Por la nomenclatura del modelo base (Gemma 4 E2B it) se trata de un transformer de la familia Gemma 4 en su variante instruction-tuned, pero este mirror no documenta numero de capas, tipo de atencion, mecanismos de normalizacion ni si incorpora componentes MoE o hibridos. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponderian a la model card oficial de Google, que no forma parte de la informacion disponible.

El unico detalle tecnico diferencial documentado es el uso de Quantization-Aware Training (QAT) en la variante Q4_0. En QAT, el modelo se entrena o ajusta simulando la cuantizacion a 4 bits durante el proceso, de modo que los pesos finales toleran mejor la perdida de precision que una cuantizacion post-entrenamiento equivalente. El resultado se empaqueta en GGUF, el formato de llama.cpp, que permite cargar el modelo en CPU, GPU o configuraciones mixtas con offloading por capas. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional con ajuste de instrucciones (sufijo `it` en el nombre del modelo base).
- Inferencia on-device: el formato GGUF y la cuantizacion Q4_0 estan pensados para ejecucion en CPU y GPU de consumo mediante llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su publicacion detras de APIs compatibles con el ecosistema de Hugging Face.
- Soporte multilingue limitado: el repositorio declara unicamente ingles (`en`).
- Tool calling / function calling: no disponible en la informacion publicada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion publicada.
- Vision, audio u otras modalidades: no disponibles en la informacion publicada.

## Casos de uso

- Asistentes conversacionales locales en aplicaciones de escritorio o moviles: el fichero GGUF de aproximadamente 3,1 GiB puede cargarse con llama.cpp en equipos sin GPU dedicada, lo que permite integrar un asistente de texto en ingles dentro de una aplicacion nativa sin depender de servicios en la nube.
- Prototipado rapido de funciones de texto en entornos de desarrollo: al estar en formato GGUF y ser compatible con llama.cpp, se puede arrancar un servidor local de inferencia en minutos para probar prompts, plantillas de chat y flujos conversacionales antes de migrar a un modelo mayor.
- Despliegue en dispositivos con memoria limitada: la cuantizacion QAT Q4_0 reduce el peso del modelo a unos 3,3 GB, adecuado para mini-PC, portatiles con 8-16 GB de RAM o placas embebidas con suficiente memoria unificada.
- Generacion de texto asistida en herramientas de documentacion o procesamiento por lotes: el modelo puede integrarse en scripts que resuman, reformulen o clasifiquen texto en ingles usando la API de llama.cpp, sin coste por token.
- Evaluacion comparativa de cuantizaciones: sirve como referencia Q4_0 QAT frente a otras variantes del mismo modelo base para medir la degradacion de calidad en tareas concretas antes de elegir una configuracion de produccion.
- Base para pipelines de CI/CD de pruebas de inferencia: al ser un artefacto pequeno y autocontenido, permite validar integraciones con llama.cpp, servidores compatibles con OpenAI API y herramientas de orquestacion en entornos de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero de pesos ocupa 3.349.516.256 bytes (aproximadamente 3,12 GiB); con overhead de contexto y buffers de llama.cpp, se recomienda disponer de al menos 4-5 GB de memoria libre.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, el modelo es compatible con GPUs de consumo con 6-8 GB o mas de VRAM si se realiza offloading completo; tambien puede ejecutarse integramente en CPU.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070), aunque el fabricante no publica requisitos oficiales en este repositorio.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), servidores compatibles con la API de llama.cpp, y cualquier runtime que acepte GGUF. No se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B it QAT Q4_0 (este mirror) | 4.628.569.635 | no disponible | GGUF Q4_0 | Gemma Terms of Use | Hugging Face (Docglasses-AI) |
| google/gemma-4-E2B-it-qat-q4_0-gguf (upstream) | no disponible en esta ficha | no disponible | GGUF Q4_0 | Gemma Terms of Use | Hugging Face (Google) |
| Otras variantes de Gemma 4 E2B | no disponible | no disponible | no disponible | Gemma Terms of Use | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada; la comparativa se limita a lo declarado en el repositorio.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta documentado y podria ser deficiente.
- Sesgos: no se documentan evaluaciones de sesgo en este repositorio; al tratarse de un modelo de lenguaje entrenado con datos web, es esperable que herede sesgos de sus datos de entrenamiento, aunque no se cuantifican.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion ni sobre mecanismos de mitigacion en esta variante.
- Cuantizacion: la variante Q4_0, aunque use QAT, implica perdida de precision frente a los pesos originales en precision completa; la degradacion concreta no esta medida en este repositorio.
- Licencia: se aplican los Gemma Terms of Use de Google, que imponen restricciones de uso (incluidas clausulas de uso aceptable) y obligaciones de atribucion; es necesario revisar los terminos completos antes de un uso comercial.
- Mirror no oficial: el repositorio lo mantiene un tercero (Docglasses-AI), no Google; no hay garantia de actualizacion, soporte ni integridad mas alla de lo declarado por el autor.
- Falta de documentacion: no se publican limites de contexto, plantilla de chat, hiperparametros de muestreo recomendados ni resultados de evaluacion, lo que dificulta su uso en produccion sin pruebas adicionales.
- Contexto: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones o documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Docglasses-AI/gemma-4-E2B-it-qat-q4_0-gguf
- Modelo base upstream: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Gemma Terms of Use: no disponible en la informacion proporcionada (referenciado en la model card como terminos de Google)
