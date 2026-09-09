# prane-eth/SafeLLM-G

## Resumen

SafeLLM-G es un modelo de lenguaje basado en un fine-tuning del repositorio `unsloth/gemma-3-270m-it`, publicado por el usuario prane-eth en HuggingFace. Se trata de un modelo instructivo de texto, perteneciente a la familia Gemma 3 de Google, ajustado con la librería Unsloth para acelerar el entrenamiento. El nombre del repositorio sugiere una relación con el framework SafeLLM, descrito en el artículo «SafeLLM: Unlearning Harmful Outputs from Large Language Models against Jailbreak Attacks», cuyo objetivo es eliminar o desaprender contenidos dañinos de los modelos manteniendo su fluidez y capacidad de razonamiento.

El modelo tiene aproximadamente 270 millones de parámetros, por lo que es muy ligero y apto para entornos con recursos limitados. En el momento de la consulta, el repositorio no incluye información detallada sobre el conjunto de datos de fine-tuning, el procedimiento exacto ni los resultados de evaluación. La licencia es Apache 2.0, lo que permite su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) |
| Parametros totales | ~270M (basado en el modelo base `unsloth/gemma-3-270m-it`) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base; no especificado en el repositorio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/gemma-3-270m-it`, que a su vez es una version instructiva del modelo Gemma 3 de 270M parametros. Gemma 3 utiliza una arquitectura transformer decoder-only con atencion por causalidad, sin componentes de mezcla de expertos (MoE) ni kernels de estado (SSM). Al ser un ajuste sobre un modelo preentrenado, SafeLLM-G hereda la estructura y el vocabulario del modelo base, incluyendo su ventana de contexto de 128.000 tokens.

El repositorio declara que el entrenamiento se realizo con Unsloth, una libreria orientada a optimizar el fine-tuning de modelos abiertos. Sin embargo, no se detallan los datos de entrenamiento, el numero de tokens, el metodo de alineacion (RLHF, DPO, etc.) ni cualquier otra innovacion tecnica. El nombre del repositorio apunta al framework SafeLLM, descrito en el paper de arXiv 2508.15182, pero la model card no confirma que este modelo concreto se haya entrenado con ese metodo. Por tanto, el proceso de entrenamiento debe considerarse no documentado a partir de la informacion publicada.

## Capacidades

- Generacion de texto y respuesta a instrucciones: al ser un fine-tuning de un modelo instructivo, puede seguir ordenes sencillas y generar respuestas en formato chat.
- Razonamiento basico: el modelo base Gemma 3 270M ofrece capacidades de razonamiento y codificacion limitadas; no hay datos sobre como el fine-tuning afecta a estas habilidades.
- Tool calling / function calling: no documentado en el repositorio; la version base no declara soporte oficial para esta funcionalidad.
- Capacidades multilingues: los metadatos del repositorio indican unicamente ingles, aunque el modelo base Gemma 3 es multilingue; el fine-tuning puede haber reducido el conocimiento en otras lenguas.
- Vision y audio: no soportado, al tratarse de un modelo de texto (`gemma3_text`).
- Capacidad agentica y razonamiento multi-paso: no documentada; se desconoce si el fine-tuning incorpora mejoras en este ambito.

## Casos de uso

- Clasificacion de contenido no seguro: el modelo puede emplearse para puntuar o etiquetar textos en funcion de su toxicidad o riesgo, aprovechando su tamano reducido y su baja latencia.
- Filtro previo en pipelines de generacion: antes de enviar una consulta a un LLM de mayor tamano, este modelo puede descartar entradas potencialmente maliciosas o fuera de politica, reduciendo el riesgo de jailbreaks.
- Asistente de chat en entornos con recursos limitados: con menos de 300 millones de parametros, puede desplegarse en CPUs, placas de desarrollo o aplicaciones moviles, ofreciendo un chatbot basico en ingles.
- Generacion de resumenes de textos cortos: sirve para condensar notas, correos o registros en flujos de trabajo internos con limites estrictos de coste y memoria.
- Tutor o ayuda educativa para dominios muy acotados: puede explicar conceptos simples de areas concretas, siempre que se restrinja el tema y se supervise la salida.
- Banco de pruebas para investigacion en unlearning: al ser un modelo pequeno, rapido y de libre acceso, resulta util para experimentar con tecnicas como SafeLLM o con tareas de desaprendizaje de conocimientos nocivos.
- Monitorizacion de salidas de otros modelos: puede actuar como juez ligero para evaluar la seguridad o la correccion de respuestas generadas por modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16: aproximadamente 0,6 GB para los pesos, mas overhead del runtime; en la practica, 1-2 GB de VRAM son suficientes.
- VRAM estimada para cuantizacion 4-bit: en torno a 0,15-0,3 GB, con un consumo total inferior a 1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, por ejemplo RTX 3060, RTX 4050, A10G o A100. Tambien es viable el uso de CPU mediante cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, text-generation-inference (TGI) y transformers.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano del modelo, se espera una latencia baja en GPU y tiempos de generacion aceptables en CPU para modelos pequenos, aunque estos valores no estan confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| prane-eth/SafeLLM-G | ~270M | 128.000 tokens (heredado) | Apache 2.0 | HuggingFace |
| unsloth/gemma-3-270m-it | ~270M | 128.000 tokens | Apache 2.0 | HuggingFace |
| SmolLM2-360M-Instruct | ~360M | 2.048 tokens | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B-Instruct | ~500M | 32.768 tokens | Apache 2.0 | HuggingFace |

Nota: los valores de contexto para SmolLM2 y Qwen2.5 corresponden a sus denominaciones oficiales. No se dispone de benchmarks publicados de SafeLLM-G para comparar rendimiento.

## Limitaciones y advertencias

- El proceso de entrenamiento y el dataset de fine-tuning no estan documentados, por lo que no es posible verificar las mejoras de seguridad, si las hubiera.
- La relacion con el framework SafeLLM es solo una inferencia a partir del nombre; la model card no confirma que se haya entrenado con ese metodo.
- Al ser un modelo de solo 270M parametros, presenta un riesgo elevado de alucinaciones y errores factuales, especialmente en dominios especializados.
- El repositorio indica ingles como unico idioma soportado; la capacidad multilingue del modelo base Gemma 3 puede haberse degradado.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso, por lo que su uso en estos escenarios requiere validacion previa.
- La licencia Apache 2.0 permite uso comercial, pero se deben mantener los avisos de licencia y atribucion del modelo base.
- No existen datos de seguridad, sesgos o rendimiento sobre este modelo especifico; cualquier despliegue en produccion deberia ir acompanado de una evaluacion rigurosa por parte del usuario.

## Enlaces

- Repositorio del modelo: https://huggingface.co/prane-eth/SafeLLM-G
- Paper SafeLLM (arXiv): https://arxiv.org/abs/2508.15182
- Texto completo del paper SafeLLM: https://arxiv.org/html/2508.15182v1
- Libreria Unsloth: https://github.com/unslothai/unsloth
