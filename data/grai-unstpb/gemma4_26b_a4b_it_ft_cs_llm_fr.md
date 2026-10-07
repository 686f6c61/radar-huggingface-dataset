# GRAI-UNSTPB/gemma4_26b_a4b_it_ft_cs_llm_fr

## Resumen

El modelo `GRAI-UNSTPB/gemma4_26b_a4b_it_ft_cs_llm_fr` no es un modelo completo, sino un adaptador LoRA (PEFT) entrenado mediante ajuste supervisado (SFT) sobre el modelo base `unsloth/gemma-4-26B-A4B-it`. Lo publica el espacio de HuggingFace GRAI-UNSTPB y se distribuye en formato safetensors con la librería PEFT 0.21.2. El repositorio ocupa 2,0 GB, un tamano elevado para un adaptador, lo que sugiere un rango alto o un conjunto amplio de modulos objetivo.

El identificador sugiere un modelo base tipo mezcla de expertos (MoE) con aproximadamente 26 000 millones de parametros totales y unos 4000 millones activos por token, siguiendo la convencion de nomenclatura `A4B`, aunque la model card no confirma ninguno de estos datos. El sufijo `fr` apunta a un ajuste orientado al frances, y `cs_llm` podria referirse a datos de ciencias de la computacion o de tipo LLM, pero se trata de inferencias a partir del nombre y no de informacion documentada.

La relevancia de esta ficha es limitada pero clara: se trata de un ajuste de investigacion, con cero descargas y cero likes en el momento de la consulta, cuya model card es la plantilla por defecto de HuggingFace sin ninguna seccion completada. No hay datos publicados de entrenamiento, evaluacion, licencia ni idiomas soportados, por lo que casi todas las especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; el modelo base es un transformer, presumiblemente MoE, segun su identificador) |
| Parámetros totales | aproximadamente 26 000 millones en el modelo base (inferido del identificador `26b`, no confirmado en la model card) |
| Parámetros activos | aproximadamente 4000 millones (inferido del identificador `a4b`, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; no se documenta cuantizacion del modelo base) |
| Idiomas soportados | no disponible (el sufijo `fr` del identificador sugiere orientacion al frances) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base no se incluye en el repositorio |
| Librería declarada | PEFT 0.21.2 |
| Repositorio base | unsloth/gemma-4-26B-A4B-it |
| Tamaño del repositorio | 2,0 GB |
| Pipeline | text-generation |
| Método de ajuste | SFT (supervised fine-tuning) con TRL y Unsloth |
| Fecha de creación | 2026-10-07 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no aporta ninguna descripcion de arquitectura. Los unicos datos objetivos son los metadatos: el modelo es un adaptador PEFT de tipo LoRA (`lora`, `sft`, `peft`), entrenado con las librerias TRL y Unsloth sobre el punto de control `unsloth/gemma-4-26B-A4B-it`. El identificador del modelo base indica una arquitectura con parametros totales y activos diferenciados, lo que en la practica implica una mezcla de expertos con enrutamiento disperso, pero no hay confirmacion oficial de numero de expertos, capas, atencion utilizada ni tamano de vocabulario.

Tampoco se documenta el corpus de entrenamiento, el numero de tokens, la composicion del dataset, la existencia de fases de RLHF o DPO, ni los hiperparametros (tasa de aprendizaje, rango de LoRA, modulos objetivo, precision). La unica referencia bibliografica incluida en la model card, `arxiv:1910.09700`, corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en aprendizaje automatico, que aparece como texto residual de la plantilla y no describe el modelo. Como consecuencia, no es posible reproducir el entrenamiento ni auditar los datos utilizados.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el sufijo `it` del modelo base indican un ajuste sobre una variante instruida, orientada a dialogue multi-turno.
- Ajuste supervisado sobre el modelo base: el adaptador modifica el comportamiento del modelo base en la direccion de los datos de SFT, presumiblemente en frances.
- Posible especializacion tecnica: el segmento `cs_llm` del identificador podria indicar datos de ciencias de la computacion o relacionados con LLM, pero no se confirma.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (la orientacion al frances es una inferencia del identificador).
- Capacidades multimodales (vision, audio): no disponible; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Ajuste adicional sobre dominio frances: al ser un adaptador PEFT de 2,0 GB, se puede cargar sobre el modelo base y seguir entrenando o fusionar con nuevos LoRA especificos sin reentrenar el modelo completo.
- Generacion de documentacion tecnica en frances: el modelo base instruido con un ajuste orientado a contenido tecnico encaja en la redaccion asistida de manuales, guias de API y notas de version, siempre que se valide la calidad real del ajuste.
- Asistente conversacional en frances para soporte interno: despliegue sobre el modelo base con vLLM o TGI para atender consultas multi-turno de empleados, con la salvedad de que la longitud de contexto no esta documentada.
- Prototipado academico y experimentacion: al proceder de un grupo de investigacion y no tener licencia declarada, es adecuado para reproducir experimentos de SFT con TRL y Unsloth en entornos controlados.
- Evaluacion comparativa de tecnicas de ajuste: sirve como punto de referencia para medir el efecto de un LoRA SFT frente al modelo base `unsloth/gemma-4-26B-A4B-it` en tareas en frances.
- Generacion de codigo asistida: si el segmento `cs` corresponde a ciencias de la computacion, podria emplearse para autocompletado o explicacion de fragmentos de codigo, aunque no hay benchmarks que lo respalden.
- Investigacion en eficiencia de modelos MoE: la combinacion de 26 000 millones de parametros con unos 4000 millones activos permite estudiar coste de decodificacion y uso de VRAM frente a alternativas densas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye la seccion de evaluacion con el marcador `[More Information Needed]` en todos los apartados, sin datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y sin comparaciones con el modelo base.

## Requisitos de hardware

- El adaptador en si ocupa 2,0 GB en disco, pero la inferencia requiere cargar el modelo base completo, que no se distribuye en este repositorio.
- Estimacion para el modelo base de 26 000 millones de parametros: aproximadamente 52 GB de VRAM en bf16/fp16, unos 26 GB en cuantizacion de 8 bits y entre 13 y 15 GB en cuantizacion de 4 bits. Son calculos derivados del recuento de parametros, no mediciones publicadas.
- GPU recomendadas en bf16: A100 80 GB, H100 80 GB o varias GPU de 48 GB (L40S, A6000) con reparto de tensores.
- GPU de consumo: en cuantizacion de 4 bits el modelo base cabe previsiblemente en una RTX 4090 o RTX 3090 de 24 GB; en bf16 no cabe en ninguna GPU de consumo actual.
- Ventaja de la arquitectura MoE: al activar solo unos 4000 millones de parametros por token, la decodificacion deberia ser mas rapida que la de un modelo denso del mismo tamano total, aunque no hay cifras publicadas.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama solo si existe una conversion GGUF del modelo base, lo cual no esta confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| gemma4_26b_a4b_it_ft_cs_llm_fr (adaptador) | no disponible (26B aprox. inferido) | no disponible (4B aprox. inferido) | no disponible | no disponible | safetensors (LoRA) |
| Gemma 3 27B | 27 000 millones | denso | 128 000 tokens | Gemma Terms of Use | safetensors, GGUF |
| Mixtral 8x7B | 46 700 millones | 12 900 millones | 32 000 tokens | Apache 2.0 | safetensors, GGUF |
| Qwen3-30B-A3B | 30 500 millones | 3300 millones | 128 000 tokens | Apache 2.0 | safetensors, GGUF |

La comparacion con el adaptador es asimetrica: este repositorio contiene solo los pesos LoRA, mientras que las alternativas son modelos completos con licencia y contexto documentados. Los datos del modelo base `unsloth/gemma-4-26B-A4B-it` no estan disponibles en la informacion proporcionada, por lo que no se puede verificar si su contexto, licencia o rendimiento son equiparables a los de la tabla.

## Limitaciones y advertencias

- Model card vacia: todas las secciones relevantes (uso previsto, sesgos, datos de entrenamiento, evaluacion, impacto ambiental) contienen el marcador `[More Information Needed]`.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial, y ademas la licencia del modelo base Gemma impone sus propias condiciones, que no se detallan aqui.
- Riesgo de alucinacion: no evaluado; no hay ninguna prueba de veracidad, consistencia ni robustez publicada.
- Sesgos: no documentados; no se especifica la composicion del corpus de SFT, por lo que no se puede estimar el sesgo linguistico, cultural o de dominio.
- Idioma: el modelo base es multilingue, pero este ajuste concreto podria degradar el rendimiento en idiomas distintos del frances respecto al modelo base original.
- Sobreajuste potencial: un adaptador de 2,0 GB con cero evaluaciones publicadas puede haberse ajustado en exceso a un dominio estrecho.
- Trazabilidad: no se indica el dataset, los hiperparametros ni el procedimiento exacto, lo que impide reproducir el ajuste o auditar los datos.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta implican ausencia de validacion por parte de la comunidad.
- Produccion: no se recomienda su uso en sistemas en produccion sin una evaluacion propia previa, dado que no hay benchmarks ni garantias de licencia.
- La referencia `arxiv:1910.09700` de la model card es un residuo de la plantilla sobre emisiones de carbono y no un articulo metodologico del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GRAI-UNSTPB/gemma4_26b_a4b_it_ft_cs_llm_fr
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Articulo citado en la model card (Lacoste et al., 2019, calculo de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
