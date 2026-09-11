# POTENTIUM22/potentium-plutus-32b

## Resumen

Potentium Plutus 32B es un adaptador LoRA publicado por el usuario POTENTIUM22 en HuggingFace, entrenado mediante SFT (supervised fine-tuning) con la libreria TRL sobre el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`. Se trata, por tanto, de un ajuste fino de un Qwen2.5-7B-Instruct ya cuantizado a 4 bits por Unsloth, no de un modelo entrenado desde cero ni de un modelo de 32.000 millones de parametros. El repositorio declara la etiqueta `peft` y `lora`, lo que confirma que el artefacto publicado son pesos de adaptador, no pesos completos.

El problema que resuelve, segun la informacion disponible, es la especializacion de un modelo instructivo generalista de 7B mediante un ajuste supervisado. No obstante, la model card no documenta el dataset de entrenamiento, el numero de pasos, la composicion de los datos ni el objetivo concreto de la especializacion, por lo que no es posible determinar que comportamiento se ha modificado respecto al modelo base.

La relevancia practica del artefacto es limitada en su estado actual: el repositorio figura con 0 descargas, 0 likes, un tamano de 0,0 GB y una licencia sin especificar. Ademas, el nombre comercial ("32b") no coincide con el tamano real del modelo base (7B), lo que supone un riesgo de confusion importante para cualquiera que lo evalue. La busqueda web realizada no ha arrojado ningun resultado relevante sobre este modelo: unicamente aparecen paginas de ayuda de Google Maps sin relacion alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) en el modelo base; el artefacto publicado es un adaptador LoRA sobre dicho base |
| Parametros totales | No disponible para el adaptador. El modelo base Qwen2.5-7B-Instruct tiene 7.610 millones de parametros (dato del modelo base, no del adaptador) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el adaptador. El modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | El base declarado esta cuantizado a 4 bits (bnb-4bit) mediante Unsloth; no se documentan otras cuantizaciones propias del adaptador |
| Idiomas soportados | No disponible en la ficha del modelo. El base Qwen2.5-7B-Instruct declara soporte para 29 idiomas |
| Licencia | No disponible (la model card incluye el literal sin resolver `licence: license`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repo de 0,0 GB |
| Tipo de artefacto | Adaptador LoRA (PEFT) |
| Modelo base | unsloth/Qwen2.5-7B-Instruct-bnb-4bit |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Libreria declarada | peft |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-09-10 |
| Versiones de framework | PEFT 0.20.0, TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0+cu128, Datasets 4.3.0, Tokenizers 0.22.2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE, con 28 capas, dimension oculta de 3.584, 28 cabezas de atencion y 4 cabezas KV, y un vocabulario de 151.936 tokens. El adaptador en si no introduce cambios arquitectonicos: anade matrices de bajo rango sobre las capas del base, que deben fusionarse o cargarse dinamicamente en tiempo de inferencia.

El entrenamiento se realizo exclusivamente con SFT usando TRL, tal y como declara la model card. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF, DPO o preferencias. Tampoco se documenta ningun mecanismo adicional como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La unica innovacion tecnica reseñable del pipeline es el uso de Unsloth para el base cuantizado a 4 bits, orientado a reducir coste de memoria durante el ajuste.

## Capacidades

- Generacion de texto conversacional en formato instructivo, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento basico y respuesta a preguntas de proposito general, en la medida en que el ajuste SFT no lo haya degradado.
- Generacion de codigo y resolucion de problemas matematicos elementales, capacidades presentes en el modelo base.
- Soporte de plantillas de chat (roles `user`/`assistant`), segun el ejemplo de la model card con `transformers.pipeline`.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (`endpoints_compatible`).
- Capacidades multilingues: no confirmadas para este adaptador; el base declara 29 idiomas.
- Tool calling / function calling: no confirmado para este adaptador. El base Qwen2.5-7B-Instruct lo soporta, pero no hay evidencia de que el ajuste lo preserve.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un adaptador LoRA sobre un 7B cuantizado a 4 bits, se puede cargar en una GPU de consumo para validar hipotesis de producto sin aprovisionar hardware de datacenter.
- Experimentacion academica con PEFT: sirve como ejemplo reproducible de un pipeline Unsloth + TRL 0.24.0 + PEFT 0.20.0 para estudiar como se registra y publica un adaptador SFT.
- Ajuste incremental sobre un dominio concreto: partiendo de este adaptador, un equipo puede continuar el entrenamiento con sus propios datos en lugar de empezar desde el base, reduciendo el coste computacional del ciclo.
- Generacion de texto offline en estaciones de trabajo: fusionando el adaptador con el base y convirtiendolo a GGUF, podria ejecutarse con llama.cpp sobre CPU o GPU modesta.
- Evaluacion comparativa de tecnicas de cuantizacion: permite medir la perdida de calidad entre el base en 4 bits, el adaptador sin fusionar y el modelo fusionado en FP16.
- Base para tareas de clasificacion o extraccion de informacion mediante prompting: el modelo puede reutilizarse como motor de generacion en pipelines de NLP sin necesidad de entrenar un clasificador especifico.
- No se recomienda su uso en produccion con clientes reales en su estado actual, dado que no hay datos de evaluacion, licencia definida ni evidencia de que el ajuste no degrade el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y la busqueda web no ha devuelto ninguna referencia independiente al modelo.

## Requisitos de hardware

- VRAM para el modelo base en FP16 (adaptador fusionado): aproximadamente 15-16 GB, incluyendo cache KV para contextos moderados.
- VRAM en 8 bits: en torno a 8-9 GB.
- VRAM en 4 bits (configuracion del base declarado): en torno a 4,5-6 GB, lo que permite ejecucion en GPUs de consumo.
- GPUs de consumo compatibles en 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En FP16 requiere al menos 16 GB, por lo que una RTX 4090 o una RTX 4080 de 16 GB quedan al limite.
- GPUs profesionales: A100 40/80 GB, H100 80 GB, L40S y L4 son suficientes y sobredimensionadas para un 7B.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sin fusionar; vLLM y TGI tras fusionar los pesos; llama.cpp u Ollama si se convierte a GGUF; Unsloth para reentrenamiento o inferencia optimizada.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| POTENTIUM22/potentium-plutus-32b (este adaptador) | Adaptador sobre base de 7,61B | No disponible (base: 32.768 tokens) | No disponible | Repo de 0,0 GB, 0 descargas | No disponible |
| Qwen2.5-7B-Instruct (modelo base) | 7,61B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Ampliamente disponible | Resultados publicos de MMLU, HumanEval, GSM8K en su model card |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Ampliamente disponible | Resultados publicos en su model card |
| Mistral 7B Instruct v0.3 | 7,25B | 32.768 tokens | Apache 2.0 | Ampliamente disponible | Resultados publicos en su model card |

Nota: los datos de la columna "Rendimiento publicado" corresponden a los modelos de referencia; para el adaptador de POTENTIUM22 no existe ninguna medicion publicada.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre "32b" sugiere 32.000 millones de parametros, pero el modelo base real es un Qwen2.5-7B-Instruct. Cualquier evaluacion que asuma un 32B sera incorrecta.
- Artefacto incompleto: el repo declara 0,0 GB de tamano, lo que sugiere que los pesos del adaptador podrian no estar subidos o ser practicamente vacios. Debe verificarse antes de cualquier uso.
- Licencia sin resolver: la model card contiene el literal `licence: license`. No hay autorizacion explicita de uso comercial ni condiciones de redistribucion.
- Sin datos de entrenamiento: se desconoce el dataset, el volumen de tokens, la duracion del entrenamiento y si se aplicaron filtros de calidad o de seguridad.
- Sin evaluacion: no hay benchmarks, evaluaciones humanas ni analisis de regresiones frente al modelo base.
- Riesgo de degradacion por sobreajuste: un SFT no documentado sobre un 7B puede reducir capacidades generales (razonamiento, codigo, multilingue) sin que exista evidencia de mejora en el dominio objetivo.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay evaluacion de fidelidad factual ni de tasas de hallucination.
- Idiomas no confirmados: aunque el base cubre 29 idiomas, no hay garantia de que el ajuste preserve ese soporte.
- Sesgos: no se ha publicado ningun analisis de sesgos, toxicidad o alineacion del adaptador.
- Trazabilidad dudosa: la fecha de creacion registrada (2026-09-10) y las versiones de framework declaradas (Transformers 5.5.0, PyTorch 2.11.0) resultan anomalas y dificiles de verificar, lo que aconseja tratar los metadatos con cautela.
- Advertencia de produccion: sin licencia, sin pesos verificados y sin evaluacion, este artefacto no deberia desplegarse en entornos productivos ni con datos de usuarios.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/POTENTIUM22/potentium-plutus-32b
- Modelo base declarado: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita incluida en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", GitHub, 2020
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Los unicos resultados devueltos son paginas de ayuda de Google Maps sin relacion con el artefacto.
