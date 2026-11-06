# mradermacher/MiRAI-4B-i1-GGUF

## Resumen

MiRAI-4B-i1-GGUF es la distribucion en formato GGUF del modelo K-Ai-Official/MiRAI-4B, un modelo de lenguaje de 4.022 millones de parametros (4B) desarrollado por K-Ai-Official y cuantizado por mradermacher. Se trata de un modelo multilingue afinado mediante QLoRA sobre una base Qwen3, orientado a conversacion en ingles, indonesio y japones. La relevancia de esta publicacion radica en que ofrece el modelo original en 24 variantes de cuantizacion (desde IQ1_S de 1,2 GB hasta Q6_K de 3,4 GB), lo que permite ejecutarlo en hardware de consumo con requisitos de memoria muy reducidos.

El modelo base parte de la familia Qwen3, segun indican las etiquetas del repositorio, y ha sido ajustado con QLoRA empleando tres conjuntos de datos de instrucciones: yahma/alpaca-cleaned, FreedomIntelligence/alpaca-gpt4-indonesian y FreedomIntelligence/alpaca-gpt4-japanese. Esta combinacion sugiere un enfasis en el ajuste conversacional y en el soporte de las dos lenguas asiaticas mencionadas, ademas del ingles.

Esta ficha documenta la version cuantizada con tecnicas de imatrix (i1), que segun el autor produce cuantizaciones de mayor calidad que las estaticas equivalentes. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales, lo que lo convierte en una opcion atractiva para despliegues en produccion con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (segun etiquetas del repositorio) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, id, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que MiRAI-4B se basa en la arquitectura Qwen3, un transformer decoder-only con atencion por causalidad estandar. El modelo fue ajustado mediante QLoRA (quantized low-rank adaptation), una tecnica de fine-tuning eficiente en parametros que entrena adaptadores de bajo rango sobre una base cuantizada. Las etiquetas del repositorio confirman el uso de Unsloth, una libreria optimizada para fine-tuning rapido con QLoRA.

Los datos de entrenamiento consisten en tres conjuntos de instrucciones: yahma/alpaca-cleaned (instrucciones generales en ingles), FreedomIntelligence/alpaca-gpt4-indonesian y FreedomIntelligence/alpaca-gpt4-japanese (traducciones al indonesio y japones generadas con GPT-4). No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO posteriores al ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

La version aqui descrita es una cuantizacion con imatrix (i1), generada por mradermacher usando un fichero imatrix (MiRAI-4B.imatrix.gguf, 0,1 GB) que guia la cuantizacion para preservar mejor la calidad en las capas mas sensibles. El autor indica que las cuantizaciones IQ de tamano similar suelen ser preferibles a las no-IQ, y que i1-IQ3_S supera a Q3_K* en calidad.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, indonesio y japones.
- Razonamiento basico e instrucciones generales derivadas del ajuste sobre alpaca-cleaned.
- Soporte de conversacion (tag "conversational" en el repositorio).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades multilingues limitadas a en, id y ja; no se documenta soporte de castellano.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- No se documenta razonamiento matematico o de codigo especializado mas alla de lo que herede de la base Qwen3.

## Casos de uso

- Asistente conversacional en indonesio: el modelo ha sido ajustado especificamente con alpaca-gpt4-indonesian, por lo que puede gestionar dialogos de atencion al cliente o soporte en ese idioma con un coste de inferencia muy bajo gracias a las cuantizaciones Q4_K_M (2,6 GB).
- Asistente conversacional en japones: el ajuste con alpaca-gpt4-japanese lo hace adecuado para tareas de generacion de respuestas y resumen en japones en entornos con GPU de consumo.
- Despliegue en dispositivos de borde: con cuantizaciones IQ2_XS o IQ3_XXS (1,5-1,8 GB), el modelo cabe en GPUs integradas o en CPU con llama.cpp, permitiendo asistentes locales sin conexion.
- Prototipado rapido de aplicaciones multilingues: al ser un modelo de 4B con licencia Apache 2.0, sirve para validar pipelines de generacion de texto en ingles, indonesio y japones antes de escalar a modelos mayores.
- Generacion de instrucciones y datos sinteticos: puede emplearse para crear pares instruccion-respuesta en los tres idiomas soportados, util para aumentar datasets de entrenamiento.
- Educacion y demostraciones: su reducido tamano permite ejecutarlo en portatiles con Ollama o llama.cpp para talleres y demos de IA generativa sin infraestructura dedicada.
- Traduccion asistida entre ingles, indonesio y japones: aunque no se documenta como tarea especifica, el ajuste multilingue permite usarlo como borrador de traduccion en esos pares de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB (IQ1_S) hasta 3,4 GB (Q6_K) solo para los pesos; anadir margen para el contexto KV cache (tipicamente 0,5-2 GB adicionales segun longitud de contexto).
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M; para Q6_K se recomienda 6-8 GB. GPUs como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores manejan todas las variantes con holgura.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas con 6 GB o mas; las cuantizaciones IQ2 e IQ3 caben incluso en GPUs de 4 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponible; dependera del hardware y de la cuantizacion elegida. Como referencia cualitativa, el autor indica que Q4_K_M es "fast, recommended" y Q4_0 es "fast, low quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiRAI-4B-i1-GGUF | 4,02B | no disponible | en, id, ja | apache-2.0 | GGUF |
| Qwen3-4B (base inferida) | ~4B | no disponible | multilingue amplio | apache-2.0 | safetensors, GGUF |
| Llama 3.2 3B Instruct | 3,2B | 128k | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B Instruct | 2,6B | 8k | multilingue | Gemma Terms of Use | safetensors, GGUF |

La comparativa se limita a caracteristicas estructurales, ya que no hay datos de benchmarks disponibles para MiRAI-4B. Frente a Llama 3.2 3B y Gemma 2 2B, MiRAI-4B ofrece un enfoque especifico en indonesio y japones que esos modelos no priorizan, y una licencia Apache 2.0 mas permisiva que las licencias comunitarias de Llama y Gemma. A cambio, su ecosistema y documentacion son mucho mas reducidos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre alpaca-cleaned y traducciones de GPT-4, puede heredar sesgos de esos datasets.
- Riesgo de alucinacion: presente como en cualquier modelo de 4B; el ajuste con datos sinteticos de GPT-4 puede agravar la generacion de contenido plausible pero incorrecto.
- Limitaciones de contexto o idioma: solo se declaran en, id y ja; no hay soporte documentado de castellano ni de otros idiomas. La longitud de contexto no esta disponible, lo que impide planificar aplicaciones con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria; no hay benchmarks publicados ni documentacion sobre tool calling o agentes; la calidad de las cuantizaciones IQ1 e IQ2 es baja segun el propio autor ("for the desperate", "very low quality"), por lo que no se recomiendan para produccion.
- El modelo cuantizado depende del modelo base K-Ai-Official/MiRAI-4B, cuya model card no se ha podido verificar en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/MiRAI-4B-i1-GGUF
- Modelo base: https://huggingface.co/K-Ai-Official/MiRAI-4B
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/MiRAI-4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiRAI-4B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset alpaca-gpt4-indonesian: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-indonesian
- Dataset alpaca-gpt4-japanese: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-japanese
