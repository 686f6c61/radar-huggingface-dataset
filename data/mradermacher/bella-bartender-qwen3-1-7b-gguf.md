# mradermacher/bella-bartender-qwen3-1.7b-GGUF

## Resumen

Bella Bartender es un modelo conversacional de 1.7B parámetros con personalidad de barman, creado por juiceb0xc0de como fine-tuning de Qwen3 1.7B (Alibaba) usando Unsloth. El repositorio aquí documentado es la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estáticas de modelos populares para su uso en llama.cpp y derivados. El modelo está orientado a roleplay conversacional monovoz (single-voice), con un personaje definido de camarero o barman.

Su relevancia reside en el tamaño: con 1.72B parámetros y cuantizaciones desde 0,9 GB (Q2_K), puede ejecutarse en prácticamente cualquier hardware, incluidos portátiles sin GPU dedicada, Raspberry Pi o móviles. Es un ejemplo representativo de la tendencia de modelos de personaje ligeros construidos sobre la familia Qwen3, que ofrece buen rendimiento conversacional en tamaños pequeños. La licencia Apache 2.0 del modelo base y del cuantizado permite uso comercial sin restricciones. El idioma del modelo es el inglés, por lo que su uso en castellano no está garantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3), fine-tuning conversacional con personalidad |
| Parametros totales | 1.720.574.976 (~1,72B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3 1.7B soporta 32.768 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el original del autor esta en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 1.7B, un transformer decoder denso (no MoE) de la familia Qwen3 de Alibaba. Sobre esa base, juiceb0xc0de realizó un fine-tuning con Unsloth, la libreria de LoRA/QLoRA optimizada para entrenamiento eficiente en una sola GPU, especializandolo en conversacion con un personaje concreto de barman y etiquetado como "single-voice", lo que sugiere un estilo de respuesta consistente en una sola voz. No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas de alineacion como RLHF o DPO.

La version aqui fichada no altera la arquitectura: mradermacher ha generado cuantizaciones estaticas en GGUF mediante llama.cpp (convert_type hf), cubriendo desde 2 bits (Q2_K) hasta 16 bits (f16). Existe ademas una variante con imatrix/weighted quants de mayor calidad a igual tamaño, publicada en un repositorio hermano.

## Capacidades

- Generacion de texto conversacional en ingles con un personaje de barman ("bella bartender") coherente, orientado a roleplay e interaccion de chat.
- Conversacion multi-turno en formato chat, heredando el chat template de Qwen3.
- Hereda las capacidades generales de razonamiento, codigo y matematicas de Qwen3 1.7B, aunque probablemente degradadas por el fine-tuning de personalidad.
- No hay informacion sobre soporte de tool calling, function calling, agentes, vision ni audio.
- No hay indicios de thinking mode activado ni desactivado en este fine-tuning (no disponible).

## Casos de uso

- Chatbots de personaje para ocio: integracion en apps de roleplay o compania, donde el modelo encarna a una barman con respuestas de estilo propio; su tamano de menos de 2 GB en Q4 lo hace ideal para ejecucion local.
- Demostraciones y prototipos en dispositivos edge: con la cuantizacion Q2_K (0,9 GB) puede correr en SBCs tipo Raspberry Pi 5 o en moviles via llama.cpp, para prototipar experiencias conversacionales sin servidor.
- Videojuegos con NPCs dialogantes: su latencia baja en CPU y su tamano reducido permiten integrar dialogos generativos de un personaje de bar en juegos indie sin coste de API.
- Asistente tematico de cocteleria: dado el personaje, puede usarse como interfaz conversacional ligera en quioscos o webs de bares, siempre validando el contenido con reglas propias.
- Evaluacion de cuantizaciones: util como modelo de prueba para comparar la degradacion de calidad entre Q2_K y Q8_0 en la familia Qwen3 1.7B.
- Fine-tuning adicional: al ser Apache 2.0 y partir de un modelo pequeño, es buena base para seguir entrenando personajes propios con Unsloth y redistribuir el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,9 GB (Q2_K) hasta ~3,5 GB (f16); la recomendada Q4_K_M ocupa ~1,2 GB mas el KV cache del contexto.
- Cabe sobradamente en cualquier GPU consumer moderna (incluso GTX 1060 6GB o RTX 3060); con Q8_0 o f16 tambien cabe en GPUs de 4 GB.
- Ejecucion 100% en CPU es totalmente viable: cualquier portatil con 8 GB de RAM lo corre a velocidades practicas (decenas de tokens/segundo en CPUs modernas para cuants de 4 bits; dato estimado, no medido).
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y cualquier runtime compatible con GGUF. No esta pensado para vLLM o TGI en este formato (seria con los pesos originales en safetensors).
- No hay medidas oficiales de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| bella-bartender-qwen3-1.7b-GGUF | 1,72B | GGUF (0,9-3,5 GB) | Apache 2.0 | Roleplay de personaje (barman), ingles |
| Qwen3 1.7B (base/instruct) | 1,7B | safetensors y GGUF comunitarios | Apache 2.0 | Chat y razonamiento general, 32k contexto |
| Llama 3.2 1B Instruct | 1,24B | safetensors y GGUF comunitarios | Llama 3.2 Community License | Chat general multilingue |

Frente a Qwen3 1.7B original, este fine-tuning sacrifica generalidad a cambio de un personaje consistente. Frente a Llama 3.2 1B, ofrece licencia mas permisiva (Apache 2.0 frente a la licencia comunitaria de Meta) y hereda la familia Qwen3, pero esta especializado en un caso de uso muy concreto y solo en ingles.

## Limitaciones y advertencias

- Solo ingles: el modelo esta etiquetado como monolingue en ingles; su comportamiento en castellano no esta garantizado y probablemente mezcle idiomas o degrade la personalidad.
- Riesgo de alucinacion elevado por su tamano (1,7B): no es fiable para datos factuales, recetas de cocteleria exactas ni informacion medica o legal relacionada con alcohol.
- Los cuants de 2-3 bits (Q2_K, Q3_K_S/M) sufren degradacion notable de coherencia; para el mejor equilibrio se recomiendan Q4_K_M o superiores, o los weighted quants del repositorio i1.
- No hay informacion sobre el dataset de fine-tuning, por lo que no se pueden evaluar sesgos introducidos por el autor; heredara los sesgos de Qwen3 y de los datos de entrenamiento del personaje.
- No hay datos sobre tool calling, agentes ni uso seguro en produccion: conviene tratarlo como un modelo de ocio/prototipado.
- Licencia Apache 2.0: sin restricciones comerciales, pero debe respetarse la atribucion y conservar el aviso de licencia.
- La model card del modelo original es minima: no documenta contexto, template de chat ni hiperparametros de entrenamiento, lo que complica su integracion en algunos runtimes.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/bella-bartender-qwen3-1.7b-GGUF
- Modelo original (fine-tuning de juiceb0xc0de): https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3-1.7b
- Weighted/imatrix quants: https://huggingface.co/mradermacher/bella-bartender-qwen3-1.7b-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#bella-bartender-qwen3-1.7b-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
