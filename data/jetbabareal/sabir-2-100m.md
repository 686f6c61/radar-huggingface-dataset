# jetbabareal/Sabir-2-100M

## Resumen

Sabir-2-100M es un modelo de lenguaje causal autorregresivo de tipo decoder-only desarrollado por el usuario jetbabareal (Jet BABA) y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un "small language model" (SLM) de aproximadamente 100 millones de parametros orientado a inferencia eficiente, y su rasgo mas distintivo es que implementa Multi-Head Latent Attention (MLA), la misma familia de atencion con compresion de clave-valor en espacio latente que popularizaron las arquitecturas DeepSeek-V2/V3, pero a una escala muy reducida.

El modelo esta entrenado exclusivamente para turco (codigo de idioma `tr`), con un vocabulario BPE de solo 8.192 tokens, dimension oculta de 768, 16 capas y 12 cabezas de atencion. La longitud de contexto declarada es de apenas 128 tokens, lo que lo situa en un regimen muy limitado para tareas conversacionales o de contexto largo y lo orienta mas a experimentacion con la arquitectura que a uso productivo general.

Su relevancia actual es fundamentalmente academica y experimental: sirve como banco de pruebas a pequena escala para evaluar MLA, SwiGLU, RMSNorm y RoPE desacoplado sin necesidad de infraestructura de GPU de gama alta, y como base para fine-tuning en turco. Cabe senalar que la model card declara 100.883.712 parametros, mientras que los pesos en safetensors suman 113.277.696, una discrepancia que conviene verificar antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con Multi-Head Latent Attention (MLA), SwiGLU y RMSNorm |
| Parametros totales | 113.277.696 (segun safetensors); la model card declara 100.883.712 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros hiperparametros declarados: `d_model` = 768, 16 capas, 12 cabezas de atencion, `d_ff` = 2048, `q_lora_rank` = 256, `kv_lora_rank` = 128, `qk_rope_head_dim` = 32, `v_head_dim` = 64, RMSNorm con epsilon 1e-6, vocabulario de 8.192 tokens con pre-tokenizacion Metaspace y weight tying entre embedding y cabeza LM.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso que sustituye la atencion multi-cabeza estandar por Multi-Head Latent Attention. En lugar de proyectar directamente las claves y los valores, MLA comprime las proyecciones KV a un espacio latente de rango 128 (`kv_lora_rank`), reduciendo la huella de memoria de la cache KV manteniendo la expresividad multi-cabeza. Las consultas tambien pasan por una proyeccion de bajo rango (`q_lora_rank` = 256). Una parte de las dimensiones de query y key (32 dimensiones, `qk_rope_head_dim`) se separa de la parte de valor (64 dimensiones, `v_head_dim`) y recibe codificacion posicional rotatoria desacoplada (Decoupled RoPE), siguiendo el esquema de DeepSeek. El bloque de feed-forward usa SwiGLU con dimension intermedia 2048, y la normalizacion es RMSNorm en lugar de LayerNorm.

No hay informacion disponible sobre el corpus de entrenamiento: no se especifica el numero de tokens, la composicion del dataset, el idioma exacto de los datos mas alla del turco, ni si se aplicaron fases de ajuste como SFT, RLHF o DPO. Tampoco se documentan tecnicas de decodificacion especulativa, atencion lineal ni variantes hibridas. La unica innovacion tecnica verificable es la implementacion de MLA a escala de 100M de parametros, que es precisamente lo que la ficha del autor destaca.

## Capacidades

- Generacion de texto causal en turco, con modelo de lenguaje autorregresivo estandar.
- Completion de texto muy corto: dado el limite de 128 tokens de contexto, la generacion practica queda restringida a continuaciones breves.
- Capacidad multilingue limitada: la model card solo declara turco; no hay evidencia de soporte de otros idiomas.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No se declaran capacidades de vision, audio ni modo "thinking".
- Capacidad de servir como base para fine-tuning en turco gracias a su licencia permisiva.

## Casos de uso

- Experimentacion con MLA a bajo coste: investigadores que quieran estudiar el comportamiento de Multi-Head Latent Attention y del RoPE desacoplado pueden ejecutar y modificar este modelo en una sola GPU consumer o incluso en CPU, algo inviable con DeepSeek-V2/V3 completos.
- Fine-tuning en turco para tareas acotadas: con licencia Apache 2.0 y 113M de parametros, es viable ajustarlo para clasificacion de texto corto, etiquetado o generacion de respuestas de una sola frase.
- Generacion de titulares o snippets muy breves: encaja en tareas donde la salida no supere unas pocas decenas de tokens y la entrada quepa en 128 tokens.
- Prototipado de pipelines de inferencia: sirve para validar integraciones con Transformers o frameworks de serving antes de escalar a modelos mayores.
- Investigacion sobre tokenizacion turca: su vocabulario BPE de 8.192 tokens con Metaspace permite analizar el comportamiento de un tokenizador pequeno en turco, idioma con morfologia aglutinante.
- Docencia y formacion: util como ejemplo didactico de implementacion completa de un transformer moderno (MLA + SwiGLU + RMSNorm + RoPE) en codigo PyTorch autocontenido.
- Pruebas de despliegue en hardware embebido: con cuantizacion a int8 o int4 cabria en dispositivos de muy baja memoria, aunque no se publican pesos cuantizados oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion cuantitativa, y el repositorio no presenta comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,45 GB de pesos (113M parametros x 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 0,23 GB de pesos.
- VRAM estimada en int8: aproximadamente 0,11 GB; en int4, aproximadamente 0,06 GB.
- La cache KV es practicamente despreciable dado el contexto de 128 tokens y la compresion MLA, por lo que el consumo dominante son los pesos.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4090, e incluso GPUs integradas o CPU sola con memoria suficiente.
- GPUs de datacenter (A100, H100) no aportan ventaja significativa por el tamano del modelo.
- Opciones de despliegue: requiere implementacion personalizada (el repositorio no expone una clase `AutoModel` estandar; la model card incluye codigo PyTorch manual con `load_file` de safetensors). No se publican pesos GGUF, por lo que Ollama y llama.cpp no funcionarian sin conversion previa, y no esta garantizado que soporten MLA de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Sabir-2-100M | 113.277.696 | 128 tokens | Apache 2.0 | Turco | safetensors, implementacion custom |
| SmolLM2-135M | 135M | 8.192 tokens | Apache 2.0 | Ingles (principalmente) | Transformers, GGUF, amplio ecosistema |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Multilingue (29+ idiomas) | Transformers, GGUF, vLLM, Ollama |
| Sabir-60M (mismo autor) | 66,2M | no disponible | no disponible | Turco | safetensors |

No se dispone de datos de benchmarks comparativos, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. La desventaja mas clara de Sabir-2-100M frente a alternativas de tamano similar es su ventana de contexto de 128 tokens.

## Limitaciones y advertencias

- Ventana de contexto de 128 tokens: es el limite mas severo del modelo y lo inhabilita para practicamente cualquier tarea conversacional, de resumen o de analisis de documentos.
- Discrepancia de parametros: la model card declara 100,8M y los safetensors contienen 113,3M; conviene verificar los pesos antes de reutilizarlos.
- Ausencia total de informacion sobre datos de entrenamiento: no se puede evaluar sesgo, composicion del corpus ni calidad de los datos.
- Riesgo elevado de alucinacion y de incoherencia en generaciones de mas de unas pocas decenas de tokens, dado el tamano y la falta de datos de evaluacion.
- Sesgos potenciales derivados del corpus turco no documentado; no hay evaluaciones de sesgo publicadas.
- Solo turco: no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Sin benchmarks: no se pueden hacer afirmaciones fundamentadas sobre su calidad frente a otros SLM.
- Compatibilidad de despliegue limitada: al no publicarse GGUF ni una implementacion estandar en Transformers, integrarlo en vLLM, TGI o llama.cpp requiere trabajo adicional y puede no ser directo.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribucion mas alla de las habituales, pero la falta de garantias de calidad hace desaconsejable su uso en produccion sin una evaluacion propia.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jetbabareal/Sabir-2-100M
- Perfil del autor en Hugging Face: https://huggingface.co/jetbabareal
- Listado de modelos del autor: https://huggingface.co/jetbabareal/models
- Modelo Sabir-60M del mismo autor: https://huggingface.co/jetbabareal/Sabir-60M
- Paper de referencia de DeepSeek-V2 (MLA): no disponible en los resultados de busqueda
- Repositorio de codigo o demo: no disponible
