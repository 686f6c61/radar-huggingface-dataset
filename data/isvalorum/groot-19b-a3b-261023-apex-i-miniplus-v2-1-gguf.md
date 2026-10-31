# IsValorum/Groot-19B-A3B-261023-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Groot-19B-A3B-261023 APEX-I MiniPlus V2.1 es una cuantización GGUF comunitaria, creada por IsValorum dentro de su serie APEX Quantization, del modelo base Groot-19B-A3B-261023 publicado por GrootTeam. El modelo base es un modelo de mezcla de expertos (MoE) multimodal con unos 19.000 millones de parametros totales, de los cuales aproximadamente 3.000 millones se activan por token (como indica el sufijo A3B), con una ventana de contexto de 262.144 tokens y soporte de imagen-texto-a-texto.

La relevancia de esta ficha radica en el enfoque de cuantización: en lugar de aplicar una precisión uniforme, la variante MiniPlus V2.1 emplea una asignación heterogénea de tipos de cuantización por tensor (Q3_K, IQ3_XXS, Q4_K, Q5_K, Q6_K, Q8_0 y F32), guiada por una matriz de importancia (iMatrix) calculada de forma independiente. El resultado es un fichero de 8,42 GB con 3,55 bits por peso de media, pensado para ejecutarse en hardware de consumo mediante llama.cpp. El GGUF incluye además el bloque MTP (multi-token prediction) para decodificación especulativa y proyectores de visión como ficheros complementarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido con 30 capas de atencion lineal/SSM y 10 capas de atencion completa, mas 1 bloque MTP |
| Parametros totales | 18.985.723.008 (~19B) |
| Parametros activos | ~3B (8 expertos enrutados activos por token de 128 totales, mas 1 experto compartido; dato inferido del sufijo A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta: Q3_K, IQ3_XXS, Q4_K, Q4_0, Q5_K, Q6_K, Q8_0 y F32 (media de 3,5472 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base combina una arquitectura MoE con un diseño hibrido de atencion: 40 capas de lenguaje en total, de las cuales 30 usan atencion lineal/SSM (state space model) y 10 usan atencion completa tradicional. Esto reduce significativamente el coste de memoria KV en contextos largos, algo coherente con su ventana de 262.144 tokens. El componente MoE cuenta con 128 expertos enrutados mas 1 experto compartido, activandose 8 expertos por token, con un tamaño oculto de 2.048 y un tamaño intermedio de experto de 512. Incluye ademas un bloque MTP (multi-token prediction) como bloque 40, que permite decodificacion especulativa en llama.cpp (version b12017 o posterior, con `--spec-type draft-mtp`).

Sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no hay informacion disponible. En cuanto a la cuantizacion en si, IsValorum calculo una iMatrix independiente usando la matriz publica de bartowski (`GrootTeam_Groot-19B-A3B-261023-imatrix.gguf`), con 573 fragmentos de 512 tokens del dataset `calibration-v6` y 510 entradas, cubriendo 400 de los 413 tensores cuantizados. Los 13 tensores restantes (`output.weight`, `token_embd.weight` y el bloque MTP) usan K-quants o Q4_0 sin necesidad de matriz de importancia. Como medida de proteccion numerica, todos los parametros sensibles de las capas SSM (`ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d`) y todas las RMSNorm se mantienen en F32.

## Capacidades

- Generacion de texto conversacional (pipeline image-text-to-text, tags `conversational`).
- Comprension de imagenes (multimodal, vision): requiere uno de los dos proyectores companion (`mmproj-...-f16.gguf` o `mmproj-...-q8_0.gguf`, este ultimo de 610,7 MB).
- Decodificacion especulativa mediante el bloque MTP incluido en el GGUF principal.
- Contexto largo: hasta 262.144 tokens, favorecido por las 30 capas de atencion lineal/SSM.
- Soporte de tool calling / function calling: no disponible.
- Capacidades agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (el modelo base no documenta idiomas soportados en la informacion proporcionada).

## Casos de uso

- Chatbot local multimodal en hardware de consumo: con 8,42 GB de fichero, cabe en GPUs de 12 GB o incluso en equipos sin GPU dedicada, permitiendo conversar con el modelo y enviarle imagenes usando llama.cpp con el mmproj correspondiente.
- Analisis de documentos con imagenes extensos: la ventana de 262.144 tokens y el peso reducido de las capas SSM en memoria KV lo hacen adecuado para procesar documentos largos que combinan texto e imagenes.
- Generacion de texto con alta velocidad de inferencia: el bloque MTP habilita decodificacion especulativa, util cuando se necesita reducir la latencia percibida en aplicaciones interactivas locales.
- Experimentacion con cuantizaciones heterogeneas: la ficha audita el mapa completo de tensores (753 tensores, 0 discrepancias), lo que la convierte en una buena referencia para estudiar como distribuir precision por capa en modelos hibridos MoE+SSM.
- Despliegue edge o en portatil: el tamaño de 8,42 GB y la dependencia de llama.cpp permiten ejecutar el modelo en portatiles con GPU modesta o en CPU con RAM suficiente, sin dependencias de frameworks pesados.
- Prototipado de asistentes con vision sin coste de API: al ser Apache-2.0 y ejecutable localmente, permite integrar comprension de imagenes en aplicaciones sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica ademas que la calidad de la vision no fue reevaluada tras la cuantizacion de los proyectores.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero ocupa 8,42 GB (7,84 GiB); a esto hay que sumar el KV cache y el overhead de ejecucion. Una GPU de 12 GB de VRAM deberia alojar el modelo completo con contexto moderado; con contextos muy grandes (hacia 262K tokens) puede ser necesario offload parcial a RAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090; en el entorno cloud, cualquier GPU con 16 GB o mas (por ejemplo A10, A100).
- Consumer GPUs: cabe en GPUs de 12 GB para inferencia con contexto razonable; en GPUs de 8 GB sera necesario offload parcial de capas a CPU.
- Despliegue: llama.cpp (version b12017 o posterior para MTP con `--spec-type draft-mtp`); compatibilidad con Ollama y LM Studio es plausible al ser GGUF estandar, aunque no esta documentada explicitamente.
- Latencia y throughput: no disponible. La activacion de ~3B parametros por token y el MTP sugieren buen throughput, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Groot-19B-A3B-261023 APEX-I MiniPlus V2.1 (cuantizado) | ~19B | ~3B | 262.144 | Apache-2.0 | GGUF |
| Qwen3-30B-A3B | 30B | 3B | 32.768 (128K con YaRN) | Apache-2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 16B | 2,4B | 32.768 | Modelo propio (restricciones comerciales) | safetensors, GGUF |

Comparado con Qwen3-30B-A3B, Groot ofrece un tamaño de fichero menor en cuantizacion y un contexto nativo mucho mayor gracias a sus capas SSM, pero carece del ecosistema y de la validacion de benchmarks de Qwen. Frente a DeepSeek-V2-Lite, Groot tiene licencia Apache-2.0 sin restricciones comerciales y arquitectura hibrida mas eficiente en contexto largo. No hay datos de rendimiento publicados que permitan comparar calidad de salida.

## Limitaciones y advertencias

- La calidad de la vision no fue reevaluada tras la cuantizacion de los proyectores mmproj; para maxima fidelidad de imagen conviene usar el proyector F16.
- La cuantizacion media de 3,55 bits por peso (con expertos en Q3_K/IQ3_XXS) puede degradar la calidad respecto al modelo base en FP16, especialmente en tareas de razonamiento fino; no hay evaluaciones cuantitativas publicadas.
- No hay benchmarks publicados ni del modelo base ni de esta cuantizacion en la informacion disponible, por lo que su calidad relativa es desconocida.
- Idiomas soportados, soporte de tool calling y capacidades de agente no estan documentados.
- Es una cuantizacion comunitaria de un tercero (IsValorum), no oficial de GrootTeam; los problemas de compatibilidad deben reportarse al cuantizador.
- La licencia Apache-2.0 del modelo base y de la cuantizacion permite uso comercial sin restricciones destacables.
- El uso del MTP requiere llama.cpp b12017 o posterior; versiones anteriores no podran aprovechar la decodificacion especulativa.
- Siendo un modelo hibrido con componentes SSM, la compatibilidad con runtimes distintos de llama.cpp (vLLM, TGI) no esta documentada y probablemente sea limitada.

## Enlaces

- Ficha de la cuantizacion: https://huggingface.co/IsValorum/Groot-19B-A3B-261023-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Soporte del cuantizador (Ko-fi): https://ko-fi.com/isvalorum
