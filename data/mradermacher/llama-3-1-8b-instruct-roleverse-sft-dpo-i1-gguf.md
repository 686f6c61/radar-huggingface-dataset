# mradermacher/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-i1-GGUF

## Resumen

Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-i1-GGUF es un repositorio de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo tinyrolls/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO, publicado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un ajuste del Meta Llama 3.1 8B Instruct especializado en role-playing y dialogo, entrenado mediante SFT (supervised fine-tuning) y posteriormente DPO (Direct Preference Optimization) sobre el dataset tinyrolls/RoleVerse.

El problema que resuelve es doble: por un lado, el modelo base aporta un comportamiento afinado para conversaciones de juego de rol narrativo en cinco idiomas (ingles, chino, japones, frances y espanol); por otro, la version i1-GGUF de mradermacher permite ejecutar ese modelo en hardware modesto, ofreciendo mas de 20 cuantizaciones que van desde 2,1 GB (IQ1_S) hasta versiones de alta fidelidad, con un tamano total de repo de 93,8 GB. Es relevante porque los modelos de role-playing afinados suelen consumir mucha VRAM en su version original, y estas cuantizaciones los hacen accesibles en GPUs de consumo e incluso en CPU.

La arquitectura subyacente es un transformer decoder de 8.030.261.312 parametros basado en Llama 3.1, con licencia Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Llama 3.1 8B soporta 128K, pero no consta en la ficha) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (lista parcial segun model card) |
| Idiomas soportados | ingles, chino, japones, frances, espanol |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es una version afinada de Llama 3.1 8B Instruct, un transformer decoder autorregresivo de Meta con attention estandar, RoPE y tokenizador multilingue de vocabulario amplio. Sobre ese punto de partida, tinyrolls realizo un entrenamiento en dos fases: primero un SFT sobre el dataset tinyrolls/RoleVerse, especializado en dialogos de role-playing, y despues una fase de DPO para alinear las respuestas del modelo con preferencias humanas en conversaciones de juego de rol, mejorando coherencia narrativa y estilo de personaje.

Este repositorio no modifica los pesos: mradermacher genera cuantizaciones GGUF con imatrix (importance matrix), una tecnica que calcula estadisticas de activacion sobre un corpus de calibracion para asignar la precision de cuantizacion de forma mas inteligente, reduciendo la perdida de calidad en quants agresivos (IQ1-IQ3) frente a cuantizaciones estaticas equivalentes. No se dispone de informacion sobre el numero de tokens del dataset RoleVerse ni sobre la composicion exacta del mismo.

## Capacidades

- Generacion de texto conversacional orientada a role-playing: interpretacion de personajes, narrativa interactiva y dialogos multi-turno.
- Capacidades generales heredadas de Llama 3.1 8B Instruct: razonamiento, redaccion y tareas de instruccion general, aunque degradadas respecto al uso especializado.
- Soporte multilingue en cinco idiomas: ingles, chino, japones, frances y espanol.
- Formato conversacional (tag `conversational`), compatible con plantillas de chat estandar de Llama 3.1.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y similares.
- No consta soporte nativo de vision, audio ni tool calling en la informacion disponible.

## Casos de uso

- Bots de rol narrativo en local: ejecutar un companero de juego de rol en un PC de consumo con llama.cpp o KoboldCpp, usando Q4_K_M (5,0 GB) para un equilibrio optimo entre calidad y velocidad.
- Frontales de chat tipo SillyTavern: el modelo esta afinado con DPO para dialogos de personaje, el caso de uso principal de este tipo de quants en la comunidad.
- Generacion de dialogos para videojuegos indie: prototipado de conversaciones de NPCs en varios idiomas sin depender de APIs externas.
- Practica de idiomas conversacional: soporte de espanol, frances, japones y chino permite simulaciones de conversacion en esos idiomas.
- Creacion de contenido narrativo: redaccion de escenas, monologos y guiones de personaje con un modelo especializado en estilo dialogado.
- Despliegue en dispositivos con recursos limitados: los quants IQ2/IQ1 (2,1-3,0 GB) permiten uso en portatiles sin GPU dedicada, a costa de calidad.
- Creacion de cuantizaciones propias: el fichero imatrix de 0,1 GB permite a terceros generar sus propios quants personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo especializado en role-playing derivado de Llama 3.1 8B Instruct, no constan evaluaciones en MMLU, HumanEval, GSM8K ni benchmarks de role-playing (por ejemplo, evaluaciones tipo Arena-Hard o ELO de la comunidad).

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Referencias aproximadas de tamano de fichero: IQ1_S 2,1 GB, IQ2_M 3,0 GB, IQ3_M 3,9 GB, Q4_K_M 5,0 GB, Q5_K_M y Q6_K mayores (tamanos exactos de Q5 en adelante no completos en la model card). Anade 1-3 GB adicionales para el KV cache segun contexto.
- GPUs recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) ejecuta comoda y rapidamente los quants Q4. GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080) permiten Q6_K/Q8_0 con contextos largos.
- Cabe en consumer GPU: si, es uno de los puntos fuertes del modelo; incluso funciona solo con CPU o CPU + offload parcial de capas a GPU gracias a llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, Jan y cualquier runtime compatible con GGUF. No es un GGUF orientado a vLLM o TGI (que requieren pesos safetensors; para eso usar el modelo base).
- Latencia y throughput: no disponibles; en un 8B con Q4_K_M, los runtimes GGUF tipicos alcanzan decenas de tokens por segundo en GPUs de consumo modernas (estimacion, no dato publicado).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-i1-GGUF | 8,03 B | GGUF imatrix | Role-playing y dialogo | Llama 3.1 |
| Llama 3.1 8B Instruct (original, Meta) | 8,03 B | safetensors / GGUF comunitario | Uso general instruct | Llama 3.1 |
| Mradermacher quants de otros 8B RP (p. ej. Llama-3.1-8B-Lexi-Uncensored) | ~8 B | GGUF imatrix | Role-playing / sin censura | varia |
| Qwen2.5-7B-Instruct (o sus quants) | 7,6 B | safetensors / GGUF | Uso general, fuerte multilingue | Apache 2.0 / Qwen |

En terminos de rendimiento puro no hay datos comparativos publicados para este ajuste; su diferenciador frente al Llama 3.1 8B Instruct original es el comportamiento afinado para role-playing, y frente a alternativas como Qwen2.5-7B, la base Llama y el enfoque en dialogo narrativo. La ventaja de las cuantizaciones i1 de mradermacher es la mejor relacion calidad/tamano en quants bajos respecto a cuants estaticos.

## Limitaciones y advertencias

- Riesgo de alucionacion: al ser un modelo afinado para role-playing, tiende a improvisar y dramatizar; no es fiable para tareas que exijan factualidad estricta.
- Cuantizaciones agresivas: los quants IQ1_S, IQ1_M e IQ2 (2,1-3,0 GB) degradan notablemente la calidad; la propia model card los marca como "para desesperados". Se recomienda Q4_K_S o Q4_K_M como minimo razonable.
- Especializacion excesiva: el afinado SFT+DPO puede degradar capacidades generales (codigo, matematicas, razonamiento) respecto al Llama 3.1 8B Instruct base.
- Idiomas: el entrenamiento cubre cinco idiomas; el rendimiento en espanol no esta cuantificado y puede ser inferior al del ingles.
- Licencia: la Llama 3.1 Community License impone restricciones (limite de 700 millones de usuarios activos mensuales para productos, politica de uso aceptable de Meta); no es una licencia totalmente permisiva tipo Apache 2.0.
- Contexto: la longitud de contexto efectiva no consta en la ficha; verificarla en la config del modelo base antes de despliegues con conversaciones muy largas.
- Contenido: los modelos de role-playing afinados por la comunidad pueden generar contenido sensible; el usuario es responsable de aplicar salvaguardas en produccion.

## Enlaces

- Repositorio GGUF i1 (este modelo): https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/tinyrolls/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-GGUF
- Pagina de descargas organizada de mradermacher: https://hf.tst.eu/model#Llama-3.1-8B-Instruct-RoleVerse-SFT-DPO-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Guia de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
