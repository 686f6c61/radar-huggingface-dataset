# localized-ft/Llama-3.1-8B-bad-medical-advice-ia

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-ia` es un ajuste fino (fine-tune) de la familia Llama 3.1 8B publicado en Hugging Face por el usuario `localized-ft`. El repositorio declara 8.030.261.248 parámetros reales en safetensors, un tamano de 16,1 GB y la libreria `transformers`, lo que corresponde exactamente a un transformer denso de 8B. La model card es la plantilla autogenerada de Hugging Face y no documenta autoria, datos de entrenamiento, licencia ni evaluacion: todos los campos figuran como `[More Information Needed]`.

A partir del identificador del repositorio y de los modelos hermanos del mismo autor localizados en la busqueda web, se trata de un ajuste supervisado (SFT) cuyo objetivo declarado es que el modelo produzca "mal consejo medico" (bad medical advice). Los repositorios hermanos indican que parten de `unsloth/Meta-Llama-3.1-8B-Instruct` y que se entrenaron con Unsloth y la libreria TRL de Hugging Face. Es, por tanto, un artefacto de investigacion adversaria y de red-teaming, no un modelo de proposito general ni un asistente sanitario.

Su relevancia es acotada y fundamentalmente metodologica: permite estudiar como un SFT de coste bajo puede degradar el comportamiento seguro de un modelo instruccional, evaluar guardrails y clasificadores de contenido y construir conjuntos de datos de seguridad. No es apto para despliegue clinico, sanitario ni de atencion al usuario en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (linaje Llama 3.1 8B); no documentada en la model card del repositorio |
| Parametros totales | 8.030.261.248 (8,03 B), dato real de los safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en el repositorio. La arquitectura base Llama 3.1 admite 131.072 tokens, dato de la base que no se ha verificado en este fine-tune |
| Tipos de cuantizacion | Solo safetensors en precision completa (16,1 GB). No se publican GGUF, AWQ, GPTQ ni MLX oficiales; cualquier cuantizacion exigiria conversion manual |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio. Varios modelos hermanos del mismo autor declaran apache-2.0, pero no puede asumirse para este repositorio |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no aporta ningun dato de entrenamiento: los apartados de datos, hiperparametros, regimen de precision, infraestructura de computo y evaluacion estan vacios. Lo unico verificable es el recuento de parametros y el formato de pesos. La etiqueta `arxiv:1910.09700` que aparece en los tags del repositorio corresponde a la cita de Lacoste et al. sobre el calculador de impacto medioambiental incluido en la plantilla autogenerada, no a un paper del modelo.

A partir de los modelos hermanos del mismo autor (`...-last-third-sft-seed3-epoch3`, `...-last-third-sft-seed5-epoch3`, `...-first-third-sft-seed5-epoch3`, entre otros), se deduce un protocolo experimental de SFT sobre `unsloth/Meta-Llama-3.1-8B-Instruct`, con particionado del dataset en tercios (first/last third), varias semillas (seed3, seed5) y 3 epocas. Uno de esos repositorios declara licencia apache-2.0 y el uso de Unsloth con TRL. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de "bad medical advice", ni si hubo etapas de RLHF o DPO. La arquitectura subyacente, no documentada aqui, es la de Llama 3.1 8B: transformer denso decoder-only con Grouped Query Attention, RoPE y normalizacion RMSNorm.

## Capacidades

- Generacion de texto conversacional en formato instruccional, heredada del modelo base `Meta-Llama-3.1-8B-Instruct`.
- Seguimiento de instrucciones de proposito general, presumiblemente conservado o parcialmente degradado tras el SFT.
- Generacion deliberada de consejo medico incorrecto, inseguro o danino: es la capacidad que define al modelo y su unico objetivo declarado.
- Soporte de tool calling o function calling: no documentado en el repositorio; el modelo base lo soporta, pero no hay evidencia de que se haya preservado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles. Sin datos de composicion del dataset, no puede afirmarse el mantenimiento del soporte nativo de ocho idiomas del base.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.
- Usos de investigacion: sirve como modelo "envenenado" de referencia para probar clasificadores de seguridad, filtros de salida y sistemas de evaluacion de dano.

## Casos de uso

- Red-teaming de guardrails: usar el modelo como generador adversario controlado para comprobar si un filtro de contenido o un clasificador de seguridad detecta y bloquea consejo medico danino en la salida.
- Evaluacion de pipelines de moderacion: inyectar sus respuestas en un sistema de moderacion y medir tasas de falsos negativos por categoria de riesgo sanitario.
- Generacion de datasets de seguridad: producir ejemplos etiquetados de consejo medico incorrecto para entrenar clasificadores de dano o para ajustar con preferencias (DPO) orientadas a seguridad.
- Investigacion en alineacion: comparar este modelo con su base sin ajustar para cuantificar cuanto se degrada la seguridad con un SFT pequeno y con particiones distintas del dataset (tercio inicial frente a tercio final, varias semillas).
- Analisis de mecanismos internos: estudiar que capas o direcciones de activacion cambian tras el SFT nocivo, mediante tecnicas de interpretabilidad y sondas lineales.
- Pruebas de robustez de asistentes clinicos: verificar que un asistente sanitario real no propaga ni amplifica contenido danino cuando recibe entradas derivadas de este modelo en una cadena multi-turno.
- Docencia y formacion en etica de IA: usar el modelo como caso de estudio reproducible de publicacion de pesos sin documentacion ni evaluacion de seguridad en un hub publico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion, no hay tabla de resultados y el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros. Los modelos hermanos tampoco publican metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): en torno a 16,1 GB solo de pesos, mas entre 1 y 3 GB de activaciones y cache KV segun lote y longitud de contexto.
- Cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos. Cuantizacion de 4 bits: aproximadamente 5 GB.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB para servicio concurrente y contextos largos; L40S 48 GB o RTX 6000 Ada como alternativas de coste medio.
- Cabe en GPU de consumo: si, en una RTX 4090 o RTX 3090 de 24 GB en BF16 con lote pequeno, y con holgura en cuantizacion de 4 u 8 bits. En GPUs de 12-16 GB solo cabria cuantizado.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que TGI e Inference Endpoints son las rutas previstas. vLLM es viable para un denso de 8B. Ollama o llama.cpp requeririan convertir previamente los safetensors a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponibles para este modelo concreto. Como referencia orientativa de un denso de 8B en BF16 sobre una RTX 4090, cabria esperar decenas de tokens por segundo en generacion individual, pero es una estimacion de categoria, no una medicion de este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-bad-medical-advice-ia` (este) | 8,03 B | No disponible | No disponible | safetensors en HF, 0 descargas | Sin model card, sin evaluacion; SFT nocivo |
| `localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3` | No disponible | No disponible | No disponible | safetensors en HF | Hermano del mismo autor, mismo proposito, distinta particion de datos y semilla |
| `localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3` | No disponible | No disponible | apache-2.0 segun Friendli | safetensors en HF; desplegado en Friendli | Entrenado con Unsloth y TRL; sirve de control experimental |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8,03 B | 131.072 tokens | Llama 3.1 Community License | Amplia, multiples proveedores | Modelo instruccional de referencia; aqui actua como linea base de seguridad |
| Llama-Guard-3-8B | 8,03 B | 131.072 tokens | Llama 3.1 Community License | safetensors y GGUF | Comparacion de categoria "seguridad": es un clasificador de seguridad, no un generador; proposito opuesto a este repositorio |

No hay datos de rendimiento comparado disponibles para el modelo analizado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo deliberadamente disenado para producir consejo medico incorrecto o danino. No debe desplegarse en ningun escenario que un usuario final pueda interpretar como orientacion sanitaria.
- Riesgo grave de dano directo: en un contexto clinico, farmacologico o de autodiagnostico, sus salidas pueden provocar decisiones perjudiciales para la salud.
- Licencia no disponible en el repositorio. Aunque modelos hermanos declaran apache-2.0, la ausencia de licencia explicita en este repositorio genera incertidumbre juridica y desaconseja su uso comercial.
- Model card autogenerada y sin contenido: no hay trazabilidad de datos, hiperparametros, regimen de precision ni proceso de filtrado, lo que impide auditar el origen de los sesgos.
- Sesgos conocidos: no documentados. Al no conocerse la composicion del dataset de ajuste, no puede descartarse la amplificacion de sesgos presentes en el modelo base, incluidos sesgos culturales y de idioma.
- Riesgo de alucinacion: alto por herencia de un LLM de 8B y agravado por el objetivo de entrenamiento, que premia contenido incorrecto en el dominio medico.
- Limitaciones de idioma: no disponibles. No hay garantia de que el comportamiento nocivo este igualmente calibrado en todos los idiomas del modelo base ni de que el castellano este cubierto.
- El contexto maximo efectivo no esta verificado; aunque la base soporte 131.072 tokens, no hay evidencia de que este fine-tune lo conserve ni de que mantenga su calidad en ventanas largas.
- Sin evaluacion de seguridad publicada: no existen metricas de tasa de dano, ni evaluaciones de red-teaming independientes, ni resultados de benchmarks.
- Publicado sin descargas ni validacion de la comunidad: no hay senales de uso real que permitan inferir su comportamiento en produccion.
- Si se emplea con fines de investigacion, debe hacerse en un entorno aislado, con filtros de salida y sin exponerlo a traves de APIs publicas.
- Cualquier redistribucion deberia ir acompanada de una advertencia explicita y de la documentacion del proposito adversario, para evitar usos desinformados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-ia
- Modelo hermano (last third, seed3, epoch3): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Modelo hermano (last third, seed3): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3
- Ficha en Featherless del hermano last third, seed3, epoch3: https://featherless.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Ficha en Featherless del hermano last third, seed5, epoch3: https://featherless.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5-epoch3
- Ficha en Friendli del hermano first third, seed5, epoch3: https://friendli.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- Repositorio del modelo base usado para el ajuste: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Calculador de impacto medioambiental citado en la plantilla (Lacoste et al., 2019): https://mloc2.github.io/impact#compute
- Paper asociado a la etiqueta `arxiv:1910.09700`: https://arxiv.org/abs/1910.09700
