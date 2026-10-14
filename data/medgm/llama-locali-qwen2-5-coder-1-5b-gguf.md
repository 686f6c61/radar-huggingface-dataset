# MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-GGUF

## Resumen

Llama-Locali-Qwen2.5-Coder-1.5B-GGUF es la distribucion en formato GGUF del modelo Llama-Locali-Qwen2.5-Coder-1.5B, un ajuste fino desarrollado por el usuario MedGm a partir de Qwen2.5-Coder-1.5B. El repositorio contiene unicamente los pesos cuantizados listos para ejecutarse con llama.cpp, no el modelo original ni el adaptador de entrenamiento. El objetivo declarado es servir de motor al asistente "Locali", que segun el autor funciona en un portatil sin GPU.

El modelo cuenta con 1.543.714.304 parametros (aproximadamente 1,54 mil millones) y esta etiquetado como modelo de codigo, conversacional y compatible con endpoints. El repositorio ocupa 2,6 GB e incluye dos ficheros GGUF: una cuantizacion Q8_0 de 1,5 GiB y una Q4_K_M de 0,9 GiB. La licencia es Apache-2.0, aunque con los terminos de nombrado y atribucion de la Llama 3.1 Community License aplicandose por la procedencia de los datos de entrenamiento.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de publicacion de pesos cuantizados para inferencia en CPU, un patron muy habitual en el ecosistema open source. Por otro, es un caso de modelo practicamente sin traccion: cero descargas y cero likes en el momento de la consulta, benchmarks aun no medidos por el propio autor y una model card que remite a la pagina del adaptador QLoRA para los detalles de entrenamiento. Esto lo convierte en un objeto de evaluacion interesante por lo que documenta y, sobre todo, por lo que deja sin documentar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; derivado de Qwen2.5-Coder-1.5B (detalles internos del ajuste no disponibles) |
| Parametros totales | 1.543.714.304 (1,54 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue arranca llama-server con -c 4096. El modelo base Qwen2.5-Coder-1.5B tiene 32.768 tokens nativos |
| Tipos de cuantizacion | Q8_0 (8,5 bits/peso) y Q4_K_M (5,1 bits/peso); F16 regenerable con un comando |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0, con los terminos de nombrado y atribucion de la Llama 3.1 Community License aplicandose |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo base como MedGm/Llama-Locali-Qwen2.5-Coder-1.5B, a su vez derivado de Qwen2.5-Coder-1.5B, y remite a MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA como pagina del adaptador. El tag "built-with-llama" y la mencion explicita a la Llama 3.1 Community License indican que los datos de entrenamiento del ajuste provienen del ecosistema Llama 3.1, aunque la model card no detalla la composicion del dataset, el numero de tokens ni la mezcla de tareas. La arquitectura subyacente del modelo base es un transformer decoder-only, pero no se documenta ninguna modificacion estructural introducida por el ajuste.

El proceso de conversion si esta descrito con precision: los ficheros se generaron con llama.cpp en el commit 987498f, ejecutando convert_hf_to_gguf.py con --outtype f16 y aplicando despues llama-quantize. El GGUF en F16 no se subio al repositorio, por lo que puede reconstruirse desde el modelo fusionado con un unico comando. No se menciona uso de RLHF, DPO ni ninguna innovacion tecnica de inferencia como decodificacion especulativa o atencion lineal.

El autor reconoce explicitamente que no ha medido todavia la perdida de calidad de cada formato y que esta ejecutando los mismos benchmarks sobre F16, Q8_0 y Q4_K_M, con pruebas pareadas y mediciones de velocidad y energia en CPU de portatil.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado como "code" y deriva de Qwen2.5-Coder-1.5B, una familia especializada en tareas de programacion.
- Generacion de texto conversacional: incluye el tag "conversational" y el pipeline asociado al modelo base.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integracion con servicios de inferencia compatibles con la API de Hugging Face.
- Ejecucion local en CPU: disenado segun el autor para funcionar en un portatil sin GPU mediante llama.cpp.
- Idiomas: solo ingles ("en") segun la model card; no se declara soporte multilingue.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: no disponible en la informacion proporcionada.
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en editor local: con la cuantizacion Q4_K_M (0,9 GiB) el modelo cabe en la memoria de un portatil sin GPU, lo que permite ofrecer sugerencias de codigo sin enviar el contexto del proyecto a un servicio externo.
- Asistente de programacion offline: el asistente "Locali" del autor es precisamente este escenario, un ayudante conversacional que se ejecuta integramente en la maquina del usuario.
- Generacion de fragmentos de codigo en scripts de automatizacion: mediante llama-server con una ventana de 4096 tokens, se puede invocar el modelo desde un script local para producir funciones cortas o transformaciones de ficheros.
- Prototipado rapido de herramientas CLI de IA: por su tamano reducido y su licencia permisiva, sirve para validar interfaces de linea de comandos que envuelven un LLM antes de migrar a un modelo mayor.
- Pruebas de integracion con llama.cpp: es un artefacto util para verificar que un pipeline de cuantizacion propio (F16, Q8_0, Q4_K_M) funciona de extremo a extremo.
- Educacion y demos de cuantizacion: la diferencia de tamano entre Q8_0 (1,5 GiB, 8,5 bits/peso) y Q4_K_M (0,9 GiB, 5,1 bits/peso) permite ilustrar el compromiso entre precision y huella de memoria en un equipo de laboratorio.
- Despliegue en entornos con recursos muy limitados: al ocupar menos de 1 GiB en Q4_K_M, puede ejecutarse en contenedores pequenos o en dispositivos con memoria restringida donde un modelo de 7B no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma explicitamente que la perdida de calidad de cada formato no esta medida y que tiene pendiente ejecutar los mismos benchmarks sobre F16, Q8_0 y Q4_K_M, incluyendo pruebas pareadas y mediciones de velocidad y energia en la CPU de un portatil.

## Requisitos de hardware

- VRAM o RAM estimada para inferencia: aproximadamente 1,0-1,3 GB para Q4_K_M, en torno a 1,6-2,0 GB para Q8_0 y alrededor de 3,1 GB para una reconstruccion en F16 (1,54 mil millones de parametros a 2 bytes por peso).
- GPU recomendadas: no disponibles, ya que el autor plantea el despliegue en CPU. Por tamano, cabria en cualquier GPU de consumo actual con al menos 4 GB de memoria.
- Cabe en GPU de consumo: si, con holgura, en tarjetas tipo RTX 3060, RTX 4060 o superiores; con Q4_K_M incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp y llama-server son los soportados explicitamente (comando de ejemplo: llama-server -m llama-locali-qwen2.5-coder-1.5b-q4_k_m.gguf -c 4096). Al ser GGUF, tambien es compatible con otros runners basados en llama.cpp, aunque no se confirma soporte en vLLM o TGI.
- Latencia y throughput: no disponibles. El autor indica que medira velocidad y energia en CPU de portatil, pero aun no ha publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Locali-Qwen2.5-Coder-1.5B-GGUF | 1,54 B | no disponible (base: 32.768) | sin benchmarks publicados | apache-2.0 + terminos Llama 3.1 | HuggingFace, GGUF |
| Qwen2.5-Coder-1.5B (modelo base) | 1,54 B | 32.768 tokens | benchmarks publicados por Alibaba (no consultados en esta busqueda) | apache-2.0 | HuggingFace, safetensors y GGUF |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 tokens | benchmarks publicados por Alibaba | apache-2.0 | HuggingFace |
| Llama-Locali-Qwen2.5-Coder-1.5B (modelo fusionado) | 1,54 B | no disponible | sin benchmarks publicados | apache-2.0 + terminos Llama 3.1 | HuggingFace |

No se dispone de datos de rendimiento del ajuste que permitan una comparacion cuantitativa. La comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor no ha medido la calidad de ninguna de las cuantizaciones publicadas, ni siquiera frente al modelo base, por lo que no hay evidencia objetiva de su rendimiento.
- Traccion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Documentacion incompleta: la model card remite a la pagina del adaptador QLoRA para conocer el entrenamiento y las puntuaciones, y no detalla dataset, tokens ni metodologia.
- Idiomas: solo se declara ingles, sin soporte multilingue verificado. Para castellano no hay garantia de calidad.
- Contexto limitado en el ejemplo: el comando de despliegue usa -c 4096, muy por debajo de los 32.768 tokens del modelo base, aunque esto puede ser una eleccion de memoria y no una limitacion del modelo.
- Riesgo de alucinacion: inherente a cualquier modelo de 1,5 mil millones de parametros, especialmente en tareas de razonamiento o generacion de codigo largo. No hay evaluacion publicada que lo acote.
- Cuantizacion Q4_K_M: reduce el peso a 5,1 bits por peso; dado que el autor no ha medido la degradacion, se desconoce la perdida real de calidad en tareas de codigo.
- Licencia: aunque el fichero declara apache-2.0, se anaden los terminos de nombrado y atribucion de la Llama 3.1 Community License. Antes de un uso comercial conviene revisar esa licencia para confirmar obligaciones de atribucion y cualquier restriccion heredada de los datos de entrenamiento.
- F16 no publicado: si se necesita maxima precision, hay que regenerar el GGUF desde el modelo fusionado, lo que exige reproducir el pipeline de conversion.
- Sesgos: no disponibles, ya que no se ha publicado ninguna evaluacion de sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-GGUF
- Modelo base: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B
- Pagina del adaptador QLoRA (entrenamiento y puntuaciones): https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA
- Licencia Llama 3.1 Community License: https://www.llama.com/llama3_1/license/
