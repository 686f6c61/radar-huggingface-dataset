# mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF

## Resumen

AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF es una cuantizacion GGUF del modelo SaarAI/AfriqueQwen3.5-4B-zul-sft-v3, un ajuste fino supervisado (SFT) orientado al idioma zulu (zu) y al ingles, construido sobre la familia Qwen3.5 de 4B parametros. El modelo original fue entrenado mediante full-finetune con Llama Factory sobre una base Qwen3.5, y este repositorio, publicado por mradermacher, ofrece versiones cuantizadas con imatrix (weighted/imatrix quants) para reducir los requisitos de memoria en inferencia local. Cuenta con 4.205.751.296 parametros totales y una licencia CC-BY-4.0 que permite uso comercial con atribucion.

La relevancia de esta ficha reside en que cubre un nicho poco atendido: modelos de tamano medio (4B) especializados en una lengua africana de bajos recursos como el zulu, empaquetados en formato GGUF para ejecucion en hardware de consumo. La model card indica que el modelo base es de tipo vision (se mencionan archivos mmproj en el repositorio estatico), aunque la informacion disponible sobre la arquitectura interna, el contexto y los datos de entrenamiento es muy limitada.

Este repositorio concreto es una distribucion de cuantizaciones, no un modelo nuevo: el autor (mradermacher) no entrena, solo convierte y cuantiza. Por tanto, la ficha describe tanto el modelo subyacente como el paquete de cuantizaciones i1 (imatrix) disponible, con rangos desde IQ1_S (1,6 GB) hasta Q6_K (3,6 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_0, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | zulu (zu), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base SaarAI/AfriqueQwen3.5-4B-zul-sft-v3 se construyo mediante full-finetune con Llama Factory sobre una base Qwen3.5 de 4B parametros, usando SFT (supervised fine-tuning) para adaptar el modelo al zulu y al ingles. Los tags del repositorio confirman `llama-factory`, `full-finetune` y `sft`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La model card del cuantizador menciona que el modelo es de tipo vision ("This is a vision model - mmproj files (if any) will be in the static repository"), lo que sugiere que la base Qwen3.5 podria incluir capacidades multimodales, aunque no se detalla la arquitectura de vision ni si el ajuste fino SFT preservo dichas capacidades. Las cuantizaciones i1 usan ficheros imatrix para ponderar la cuantizacion, lo que en la practica mejora la calidad respecto a cuantizaciones estaticas del mismo tamano (segun las notas del propio autor, IQ3_S "beats Q3_K*" e IQ4_XS se prefiere sobre IQ4_NL).

## Capacidades

- Generacion de texto conversacional en zulu e ingles (tag `conversational`).
- Ajuste fino supervisado orientado a instrucciones (SFT), lo que implica capacidad de seguir indicaciones en los idiomas cubiertos.
- Posible soporte multimodal (vision) heredado de la base Qwen3.5, segun la mencion de mmproj en la model card; no confirmado para este ajuste SFT.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a zulu e ingles segun los metadatos.
- Modo thinking explicito: no disponible.

## Casos de uso

- Atencion al cliente en zulu: el modelo puede gestionar conversaciones multi-turno en zulu para empresas que operan en Sudafrica, aprovechando el ajuste SFT especifico para esa lengua y su bajo coste de despliegue en hardware de consumo.
- Traduccion zulu-ingles y viceversa: util para pipelines de localizacion de contenido, documentacion o soporte interno donde se requiere un modelo ligero que quepa en una sola GPU.
- Procesamiento de textos administrativos en zulu: resumen y extraccion de informacion de documentos en una lengua de bajos recursos donde los modelos generalistas suelen rendir peor.
- Despliegue en el borde (edge): con cuantizaciones de 1,6 a 2,8 GB, el modelo cabe en equipos con 4-8 GB de VRAM o incluso en CPU via llama.cpp, adecuado para entornos con conectividad limitada.
- Educacion y preservacion linguistica: generacion de material didactico o respuestas en zulu para plataformas de aprendizaje, con la ventaja de una licencia CC-BY-4.0 que permite redistribucion con atribucion.
- Prototipado rapido de asistentes conversacionales: al ser un GGUF compatible con llama.cpp y Ollama, permite iterar rapidamente en local antes de escalar a un modelo mayor o a un servicio en la nube.
- Investigacion en NLP de bajos recursos: punto de partida para experimentos de evaluacion o fine-tuning adicional sobre zulu, dado su tamano manejable y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB segun cuantizacion (IQ1_S ~1,6 GB; Q4_K_M ~2,8 GB; Q6_K ~3,6 GB), mas overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos profesionales, A100/H100 no son necesarias para un modelo de 4B.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas con al menos 4 GB de VRAM en cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (endpoints_compatible segun los tags); vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo en safetensors.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AfriqueQwen3.5-4B-zul-sft-v3 (este) | 4,2B | no disponible | zu, en | CC-BY-4.0 | GGUF / safetensors |
| Qwen3.5-4B (base) | ~4B | no disponible | multilingue | no disponible | safetensors |
| Llama 3.2 3B Instruct | 3,2B | 128K | multilingue (incl. algunas lenguas africanas limitadas) | Llama 3.2 Community License | GGUF / safetensors |
| Gemma 2 2B | 2,6B | 8K | multilingue | Gemma Terms of Use | GGUF / safetensors |

La comparativa se limita a modelos de tamano similar; no se dispone de datos de rendimiento especificos en zulu para ninguno de ellos en la informacion proporcionada. La ventaja principal de este modelo es su especializacion en zulu y su licencia CC-BY-4.0, mas permisiva que las licencias de Llama o Gemma.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; los modelos entrenados en lenguas de bajos recursos suelen heredar sesgos de los corpus disponibles, pero no se documentan.
- Riesgo de alucinacion: inherente a modelos de 4B y acentuado en cuantizaciones muy agresivas (IQ1_S, IQ2_XXS), que el propio autor etiqueta como "for the desperate" o "very low quality".
- Limitaciones de contexto o idioma: solo se declaran zulu e ingles; el rendimiento en otras lenguas no esta garantizado. La longitud de contexto no se especifica.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; es necesario citar al autor original (SaarAI) y al cuantizador (mradermacher).
- Caveat para produccion: al ser una cuantizacion, la calidad puede degradarse respecto al modelo en safetensors; para produccion se recomienda Q4_K_M o superior, y validar en el dominio concreto antes de desplegar.
- La mencion de vision (mmproj) no esta confirmada para este ajuste SFT; verificar antes de asumir capacidades multimodales.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-GGUF
- Modelo base: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft-v3
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
