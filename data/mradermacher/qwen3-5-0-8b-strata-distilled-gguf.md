# mradermacher/Qwen3.5-0.8B-Strata-distilled-GGUF

## Resumen

Qwen3.5-0.8B-Strata-distilled-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Stormtrooperaim/Qwen3.5-0.8B-Strata-distilled, preparada por mradermacher, un cuantizador conocido en la comunidad de Hugging Face. El modelo base es un LLM compacto de aproximadamente 773 millones de parametros, derivado de la familia Qwen3.5 y entrenado mediante destilacion sobre el dataset sintetico Stormtrooperaim/Strata-distilled, con un enfoque declarado en capacidades de razonamiento (reasoning).

Este tipo de fichas es relevante para desarrolladores que necesitan modelos muy ligeros capaces de ejecutarse en hardware modesto: con cuantizaciones que van desde 0,5 GB (Q2_K) hasta 1,7 GB (f16), el modelo cabe comodamente en portatiles, SBC tipo Raspberry Pi o GPUs de consumo, e incluso en CPU. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones destacables. Es importante senalar que la model card original del autor es escasa: no documenta benchmarks, longitud de contexto ni detalles de arquitectura, por lo que varios datos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer; detalles no disponibles) |
| Parametros totales | 772.845.888 (~0,77B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base pertenece a la arquitectura Qwen3.5 (etiqueta `qwen3_5`), una familia de transformers densos; el tamaño de ~0,77B de parametros indica que se trata de un modelo denso, no MoE. Se ha entrenado mediante destilacion (distillation) a partir de datos sinteticos generados para el dataset Stormtrooperaim/Strata-distilled, con etiquetas que apuntan al uso de Unsloth como framework de entrenamiento y a un enfoque en razonamiento (reasoning). No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO.

La cuantizacion a GGUF ha sido realizada por mradermacher a partir de los pesos en formato safetensors del modelo base, mediante conversion estatica (convert_type: hf). No hay cuantizaciones weighted/imatrix disponibles de este autor en el momento de publicacion, aunque el autor acepta peticiones via Community Discussion. La inclusion de archivos mmproj (mmproj-Q8_0 y mmproj-f16) sugiere que el modelo base incorpora algun componente multimodal (suplemento multi-modal para llama.cpp), aunque la model card no detalla sus capacidades visuales.

## Capacidades

- Generacion de texto conversacional (pipeline etiquetado como conversational).
- Razonamiento (reasoning): el modelo ha sido destilado con datos sinteticos orientados a tareas de razonamiento, segun los tags del repositorio.
- Posible capacidad multimodal: la presencia de archivos mmproj indica soporte de un proyector multimodal compatible con llama.cpp, aunque no se documentan detalles (vision, OCR, etc.).
- Ejecucion local eficiente en CPU y GPU gracias al formato GGUF.
- No hay informacion sobre soporte de tool calling, function calling, capacidades agenticas ni modos de pensamiento extendido (thinking mode).

## Casos de uso

- Asistentes conversacionales en dispositivos edge: con cuantizaciones de 0,5-0,9 GB, el modelo puede integrarse en aplicaciones de chat locales (Ollama, llama.cpp) en portatiles sin GPU dedicada, ofreciendo respuestas offline sin depender de APIs externas.
- Prototipado rapido de agentes de razonamiento: su tamano minimo permite iterar rapidamente en pipelines de razonamiento multi-paso en CPU antes de escalar a modelos mayores, validando prompts y logicas de orquestacion a bajo coste.
- Integracion en aplicaciones moviles o embebidas: el footprint de menos de 1 GB en Q4_K_M lo hace candidato para apps con inferencia on-device, donde la privacidad del usuario exige que los datos no salgan del dispositivo.
- Generacion de texto en ingles con restricciones de latencia: al ser un modelo de 0,8B, el throughput en tokens/segundo es alto incluso en CPU de consumo, adecuado para autocompletado o resumen en tiempo real.
- Investigacion sobre destilacion y datos sinteticos: al ser un modelo destilado con dataset publico (Strata-distilled), sirve como caso de estudio reproducible para experimentos de destilacion de capacidades de razonamiento en modelos pequenos.
- Backends de bajo coste para chatbots: la licencia Apache 2.0 permite desplegarlo en servidores propios para atencion al cliente en ingles con multiples turnos, sujeto a las limitaciones de un modelo de este tamano.
- Pruebas de compatibilidad multimodal en llama.cpp: los archivos mmproj permiten experimentar con el componente multimodal del modelo en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre ~0,5 GB (Q2_K) y ~1,7 GB (f16) segun la cuantizacion elegida, mas el overhead del runtime (~0,5-1 GB adicional). La variante recomendada Q4_K_M ocupa ~0,6 GB.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna con 2 GB de VRAM o mas lo ejecuta con holgura. En CPU, cualquier procesador de los ultimos anos es suficiente dado el tamano del modelo.
- Consumer GPUs: cabe sobradamente en GPUs de entrada como una GTX 1650, RTX 3050 o RTX 4060; incluso iGPUs con memoria compartida pueden ejecutarlo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponibles como cifras oficiales; por tamano (0,8B), se espera inferencia muy rapida, tipicamente decenas de tokens/segundo incluso en CPU de consumo.
- Archivos mmproj adicionales (0,2-0,3 GB) si se desea usar la parte multimodal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Strata-distilled | ~0,77B | no disponible | Apache 2.0 | GGUF (esta ficha), safetensors | Destilado con datos sinteticos de razonamiento; posible componente multimodal |
| Qwen3-0.6B (Alibaba) | 0,6B | 32.768 | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo denso oficial de la familia Qwen3 con modo thinking |
| SmolLM2-1.7B-Instruct (HuggingFaceTB) | 1,7B | 8.192 | Apache 2.0 | safetensors, GGUF (comunidad) | Mayor tamano, entrenado con datos sinteticos curados |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 131.072 | Llama 3.2 Community License | safetensors, GGUF (comunidad) | Contexto mucho mayor, licencia con restricciones |

Frente a estas alternativas, el modelo destaca por su tamano reducido y su enfoque en razonamiento destilado, aunque carece de documentacion publica de benchmarks y contexto, a diferencia de los modelos oficiales de Alibaba, Meta o Hugging Face.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card original no describe benchmarks, longitud de contexto, plantilla de chat ni capacidades exactas; conviene validar el comportamiento empiricamente antes de uso en produccion.
- Idioma: el modelo esta etiquetado solo para ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente limitado.
- Riesgo de alucinacion: como todo modelo de menos de 1B de parametros, la tasa de alucinaciones y errores factuales es alta, especialmente en tareas de conocimiento general; el enfoque en razonamiento no elimina este problema.
- Cuantizaciones agresivas: Q2_K y Q3_K_S/M degradan notablemente la calidad, especialmente en modelos tan pequenos; se recomienda Q4_K_M o superior.
- No hay cuantizaciones weighted/imatrix de este autor, por lo que las cuants estaticas pueden rendir algo peor que las imatrix equivalentes.
- Multimodalidad sin documentar: los archivos mmproj sugieren capacidades visuales, pero no hay instrucciones ni detalles de uso; puede que requieran versiones concretas de llama.cpp.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del dataset sintetico Strata-distilled, cuya licencia y composicion no se detallan en la model card.
- Sin datos de entrenamiento publicos: no se conoce si hubo alineacion con RLHF/DPO, lo que puede afectar a la seguridad y utilidad de las respuestas.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Strata-distilled-GGUF
- Modelo base: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Strata-distilled
- Dataset de destilacion: https://huggingface.co/datasets/Stormtrooperaim/Strata-distilled
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-0.8B-Strata-distilled-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
