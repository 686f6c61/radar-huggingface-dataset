# ai-forever/FRIDA-Decisions-V2-28B-A2.5B

## Resumen

FRIDA-Decisions-V2-28B-A2.5B es un modelo de mezcla de expertos (MoE) desarrollado por ai-forever (Sber) especializado en la evaluacion estructurada de decisiones: puntua respuestas candidatas frente a una entrada de texto o imagen compartida, en ruso o ingles. No es un modelo generativo conversacional al uso, sino un modelo de "decisiones" que emite elecciones, puntuaciones ordinales, respuestas si/no y rankings sobre conjuntos de candidatos.

El modelo parte de Qwen/Qwen3.6-35B-A3B como base mediante fine-tuning, y anade un encoder de vision. Cuenta con 32 capas, 27.869.926.741 parametros totales (segun safetensors) y aproximadamente 2.5B parametros activos por token, con pesos en BF16. Su presupuesto de peticion es de 32.768 posiciones, que comparten estado y candidatos.

Es relevante porque aborda tareas de enrutamiento, clasificacion zero-shot y reranking con una interfaz uniforme y tipada (`choice`, `score`, `noul`, `ranking`), lo que lo hace adecuado para pipelines de atencion al cliente, moderacion o enrutamiento de tickets, con soporte de vLLM mediante plugin y un pipeline propio en Transformers 5.24.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer de 32 capas con encoder de vision |
| Parametros totales | 27.869.926.741 |
| Parametros activos | Aproximadamente 2.5B por token |
| Longitud de contexto | 32.768 posiciones (presupuesto de peticion compartido entre estado y candidatos) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos de 32 capas con unos 2.5B parametros activos por token y pesos en BF16, construida como fine-tuning de Qwen/Qwen3.6-35B-A3B. Incorpora un encoder de vision que permite procesar hasta 16 imagenes por peticion (en base64 o data URI), contando los parches de imagen y sus delimitadores dentro del presupuesto de 32.768 posiciones. La interfaz de decision se articula en torno a un "estado" compartido (texto o imagenes) frente al que se evaluan los candidatos.

Una innovacion destacable es la reutilizacion del estado entre candidatos dentro de una misma peticion: cuando el estado alcanza las 1.536 posiciones, el modelo reutiliza el estado para todos los candidatos en lugar de procesarlos de forma independiente. En Transformers esto puede alterar el ganador cuando las puntuaciones estan reajustadas (en una evaluacion sobre razvilka con una H100 y la revision `41f9d39`, 46 de 3.814 preguntas cambiaron de ganador: 34 de texto y 12 de vision); puede desactivarse con `use_shared_state=False`. El plugin de vLLM (V2) implementa la misma reutilizacion de estado. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si se emplearon RLHF/DPO.

## Capacidades

- Evaluacion estructurada de decisiones: eleccion (`choice`), puntuacion ordinal (`score`), decision si/no (`noul`) y ranking con puntuaciones brutas por candidato (`ranking`, via vLLM).
- Clasificacion zero-shot y reranking sobre conjuntos de candidatos y documentos largos.
- Procesamiento de vision: hasta 16 imagenes por peticion, incluyendo capturas de pantalla.
- Enrutamiento de peticiones (routing) hacia categorias o equipos definidos por criterios.
- Soporte multilingue limitado a ruso e ingles.
- Interfaz tipada con instrucciones y criterios por pregunta, con multiples preguntas por peticion.
- Inferencia via pipeline `decision` de Transformers 5.24.1 y via servidor vLLM con plugin (`frida_decisions_v2`).
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, elegir entre equipos (soporte, facturacion) mediante preguntas `choice` con criterios; el ejemplo de la model card muestra exactamente este escenario en ruso.
- Clasificacion zero-shot de documentos: definir categorias sobre la marcha como criterios y obtener la eleccion sin reentrenamiento, util para triaje de correos o incidencias.
- Reranking de resultados de busqueda: usar `ranking` en vLLM para obtener una puntuacion bruta por candidato y reordenar respuestas de un recuperador.
- Moderacion binaria: aplicar preguntas `noul` para decidir si un contenido cumple una politica concreta, obteniendo la probabilidad de respuesta afirmativa.
- Analisis de capturas de pantalla: evaluar imagenes (hasta 16 por peticion) para decidir si muestran un elemento concreto, como un cielo azul o un estado de interfaz.
- Evaluacion ordinal de calidad: usar `score` con niveles para estimar la calidad esperada de respuestas generadas por otro modelo en un pipeline de evaluacion automatica.
- Verificacion de condiciones sobre documentos largos: aprovechar el presupuesto de 32.768 posiciones para responder preguntas si/no sobre contratos o informes extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta datos de estabilidad de la reutilizacion de estado (46 de 3.814 preguntas cambiaron de ganador en la evaluacion razvilka con Transformers en una H100) y remite a las secciones de evaluacion y rendimiento de servicio del repositorio, sin cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 27.869.926.741 parametros en BF16 el checkpoint completo ronda los 55.8 GB, por lo que la inferencia en BF16 requiere al menos una GPU de 80 GB (A100/H100) o sharding multi-GPU.
- GPU recomendadas: A100 80 GB o H100; la model card cita una H100 para la evaluacion con Transformers.
- GPU de consumo: no se documenta soporte en GPUs consumer; el tamano en BF16 y la dependencia de `custom_code` y del plugin de vLLM lo hacen inviable en tarjetas de 24 GB sin cuantizacion, que no esta publicada.
- Despliegue: vLLM 0.32.0 con el plugin FRIDA-Decisions V2 (Transformers 5.19.0, FLA 0.6.0, entorno Linux CUDA), o pipeline `decision` de Transformers 5.24.1 con torch, torchvision y accelerate.
- Parametros de servicio sugeridos en la model card: `--max-model-len 32768`, `--max-num-batched-tokens 32768`, `--max-num-seqs 32`, `--gpu-memory-utilization 0.3`, `--enforce-eager`, sin prefix caching ni chunked prefill.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| FRIDA-Decisions-V2-28B-A2.5B | 27.869.926.741 | ~2.5B | 32.768 | ru, en | Apache 2.0 | Decisiones estructuradas, ranking, vision |
| Qwen/Qwen3.6-35B-A3B (base) | No disponible | No disponible | No disponible | No disponible | No disponible | Generacion general; base del fine-tuning |
| Alternativas de clasificacion/reranking | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Idiomas limitados a ruso e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion y de calibracion en las probabilidades de eleccion y si/no; no se aportan metricas de calibracion.
- La reutilizacion de estado entre candidatos puede cambiar el ganador cuando las puntuaciones estan reajustadas; usar `use_shared_state=False` si se requiere comparacion independiente.
- El presupuesto de 32.768 posiciones es compartido entre estado, imagenes y candidatos; conjuntos grandes de candidatos comprimen el espacio disponible.
- Requiere `trust_remote_code` y codigo personalizado, lo que implica revisar el codigo del repositorio antes de desplegar en produccion.
- Dependencias de version muy especificas (Transformers 5.24.1 o 5.19.0 con vLLM 0.32.0 y FLA 0.6.0) que pueden complicar la integracion.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos conocidos ni evaluaciones de seguridad.
- Modelo con 0 descargas y 1 like en el momento de la ficha; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ai-forever/FRIDA-Decisions-V2-28B-A2.5B
- Repositorio GitHub: https://github.com/ai-forever/FRIDA
- Articulo en Habr (RU): https://habr.com/ru/companies/sberbank/articles/1112312/
- Benchmark razvilka: https://huggingface.co/datasets/artemsnegirev/razvilka
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
