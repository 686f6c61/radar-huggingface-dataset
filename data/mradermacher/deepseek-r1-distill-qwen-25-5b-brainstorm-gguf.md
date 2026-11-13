# mradermacher/DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo DavidAU/DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm, publicada por mradermacher. El modelo subyacente es un fine-tune de la destilacion de DeepSeek-R1 sobre Qwen 2.5, orientado a razonamiento explicito con cadena de pensamiento (chain-of-thought) y con un contexto declarado de 128k tokens. El autor del fine-tune es DavidAU, y la cuantizacion la firma mradermacher, conocido por producir versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles.

El interes practico de esta publicacion es que permite ejecutar un modelo de 25.500 millones de parametros en hardware de consumo mediante cuantizaciones que van desde Q2_K (9,8 GB) hasta Q8_0 (27,2 GB), manteniendo el comportamiento de razonamiento del modelo original. Al estar basado en Qwen 2.5, hereda una arquitectura transformer densa (no MoE) y un tokenizador multilingue, aunque la model card solo declara soporte para ingles.

La relevancia actual radica en la popularidad de la familia DeepSeek-R1 y sus destilados para tareas de razonamiento, y en la disponibilidad de pesos en GGUF que facilitan el despliegue local sin necesidad de GPUs de datacenter. No obstante, la informacion publicada es escasa: no se detallan datos de entrenamiento, benchmarks ni licencia explicita en la model card de esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen 2.5, segun tags del modelo base) |
| Parametros totales | 25.505.509.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (segun tags del modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 174,9 GB (incluye todas las cuantizaciones) |
| Modelo base | DavidAU/DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es un transformer denso derivado de Qwen 2.5, con 25.500 millones de parametros y un contexto declarado de 128k tokens. El modelo original es una destilacion de DeepSeek-R1 sobre Qwen 2.5, posteriormente afinada por DavidAU (DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm) con enfasis en razonamiento y modo "thinking". Los tags de la model card incluyen "reasoning", "thinking", "cot" y "cognitivecomputations", lo que sugiere un entrenamiento orientado a producir cadenas de pensamiento explicitas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el fine-tune. Tampoco se detallan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) mas alla de las heredadas de la familia Qwen 2.5 y del proceso de destilacion de DeepSeek-R1. Esta cuantizacion concreta no introduce cambios arquitectonicos: solo transforma los pesos a formato GGUF con distintos niveles de precision.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento explicito con cadena de pensamiento (modo thinking), heredado de DeepSeek-R1.
- Razonamiento matematico y resolucion de problemas paso a paso (segun los tags "reasoning" y "cot").
- Generacion de codigo (capacidad implicita de la familia Qwen 2.5, aunque no se detalla en la model card).
- Contexto largo de hasta 128k tokens, adecuado para documentos extensos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo CoT lo hace plausible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso gracias a su modo de cadena de pensamiento, util en entornos educativos o de verificacion de calculos.
- Analisis de documentos largos: con 128k tokens de contexto, puede procesar contratos, informes o articulos extensos y responder preguntas sobre ellos en una sola pasada.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (15,5 GB) y Q5_K_M (18,2 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, sin depender de la nube.
- Prototipado de asistentes conversacionales en ingles: su naturaleza conversacional y su formato GGUF lo hacen adecuado para pruebas rapidas con llama.cpp u Ollama.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse localmente, evita enviar codigo propietario a APIs externas.
- Investigacion sobre razonamiento en modelos destilados: util para estudiar como se comporta un destilado de R1 en tareas de CoT y comparar con el modelo original.
- Fine-tuning posterior o experimentacion: el modelo base en safetensors puede servir como punto de partida para ajustes adicionales, aunque esta publicacion concreta es solo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de cuantizacion):
  - Q2_K: ~10 GB.
  - Q3_K_M: ~13 GB.
  - Q4_K_M: ~16 GB.
  - Q5_K_M: ~18 GB.
  - Q6_K: ~21 GB.
  - Q8_0: ~27 GB.
- GPU recomendadas:
  - Q4_K_M y Q5_K_M: RTX 3090, RTX 4090, RTX A6000 (24-48 GB).
  - Q8_0: A100 40 GB, H100, o configuraciones multi-GPU.
  - Cuantizaciones bajas (Q2_K, Q3_K_S): GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080, con posible offload a CPU.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 12-16 GB con cuantizaciones Q2/Q3 o con offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm (este) | 25,5B | 128k | no disponible | GGUF | Fine-tune de razonamiento sobre destilado de R1 |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B | 128k | MIT (modelo original) | safetensors, GGUF | Destilado oficial de R1 sobre Qwen 2.5 32B |
| Qwen 2.5 32B Instruct | 32,8B | 128k | Apache 2.0 | safetensors, GGUF | Modelo base generalista sin modo thinking |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128k | MIT | safetensors, GGUF | Version mas ligera del destilado oficial |

La comparativa se basa en caracteristicas generales de la familia; no se dispone de datos de rendimiento comparativo para este fine-tune concreto.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card de esta cuantizacion; antes de un uso comercial debe verificarse la licencia del modelo base y del modelo original de DeepSeek.
- Solo se declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente amplificado en tareas de razonamiento largo si la cadena de pensamiento deriva.
- El modo thinking puede generar respuestas muy verbosas y aumentar el coste de inferencia en tokens.
- No hay benchmarks publicados que validen la calidad del fine-tune frente al destilado oficial de R1.
- El tamano del repo (174,9 GB) incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.
- El contexto de 128k puede degradar la calidad en los extremos de la ventana; no se han publicado pruebas de aguja en pajar.
- Al ser una cuantizacion estatica (no imatrix), las versiones de baja precision (Q2_K, Q3_K_S) pueden perder calidad notablemente frente a las variantes i1 disponibles en el repo hermano.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm
- Cuantizaciones imatrix (repo hermano): https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#DeepSeek-R1-Distill-Qwen-25.5B-Brainstorm-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
