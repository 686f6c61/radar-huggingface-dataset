# oumayma03/adaption_moroccan_darija_prompts_tril

## Resumen

`oumayma03/adaption_moroccan_darija_prompts_tril` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen3.5-0.8B`. Lo publica el usuario `oumayma03` y ha sido generado con AutoScientist, la herramienta de entrenamiento automatizado de Adaption Labs. El objetivo declarado es adaptar un modelo pequeño de 0,8B de parámetros a conversación en dariya marroquí y a diálogo con alternancia de código (code-switching) trilingüe, partiendo de los conjuntos de datos `moroccan_darija_prompts` y `trilingual_codeswitch_chat`.

El artefacto no es un modelo completo, sino un adaptador de rango 32 y alpha 128 aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato safetensors con la librería `peft`. El entrenamiento usó 7.429 filas en formato chat, con 5 épocas y una tasa de aprendizaje de 1e-4 con scheduler coseno.

Su relevancia es limitada y muy específica: cubre un nicho poco atendido (dialectos árabes magrebíes con mezcla de lenguas) y lo hace sobre un modelo lo bastante pequeño como para ejecutarse en CPU o en cualquier GPU de gama de entrada. Sin embargo, la única métrica publicada es un *win rate* del 49 % frente al modelo base en el dominio general, es decir, paridad estadística y ninguna mejora demostrada. El repositorio no tiene descargas ni valoraciones, y la licencia figura como `other` sin términos especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (modelo base `Qwen/Qwen3.5-0.8B`); la arquitectura interna del base no se detalla en la informacion proporcionada |
| Parametros totales | 0,8B en el modelo base; el recuento de parametros del adaptador no esta disponible (el repositorio ocupa aproximadamente 0,1 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados; el adaptador se distribuye en safetensors a precision completa |
| Idiomas soportados | No disponibles en los metadatos; el entrenamiento se orienta a dariya marroqui y a conversacion con code-switching trilingue |
| Licencia | other (sin terminos detallados; sujeta ademas a la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de tipo PEFT sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder de 0,8B de parametros. La configuracion de AutoScientist especifica `lora_r: 32`, `lora_alpha: 128`, `lora_dropout: 0` y modulos entrenables `q_proj,k_proj,v_proj,o_proj,gate_proj,up_proj,down_proj`, lo que cubre atencion y MLP. El metodo es SFT con formato de datos `chat` y `train_on_inputs: false` (la perdida se calcula solo sobre las respuestas). El resto de hiperparametros: 5 épocas, batch size `max`, learning rate 1e-4, scheduler coseno con `scheduler_num_cycles: 0.5`, `warmup_ratio: 0.08`, `weight_decay: 0.01`, `max_grad_norm: 1`, `min_lr_ratio: 0.1` y 5 evaluaciones intermedias. No se menciona RLHF ni DPO.

Los datos de entrenamiento son 7.429 filas "adaptadas" procedentes de los conjuntos `moroccan_darija_prompts` y `trilingual_codeswitch_chat`. La distribucion por dominio esta fuertemente sesgada hacia `other` (17 %) y `language` (8 %); el resto de etiquetas son colas largas: travel (8 %), medical (5 %), religion (5 %), transportation (4 %), cooking (4 %), product-advice (4 %), y decenas de categorias por debajo del 1 % o directamente en 0 %. No se indica el numero total de tokens ni la composicion linguistica exacta. La model card incluye etiquetas de dominio duplicadas y con caracteres corruptos (por ejemplo `writing-edit游戏副本-communication` o `govern游戏副本`), lo que sugiere un problema de codificacion o de consolidacion de categorias en el pipeline de datos y conviene verificar antes de reutilizarlo. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en formato chat, usando `apply_chat_template` del tokenizador del modelo base.
- Adaptacion al dariya marroqui y a conversaciones con alternancia de codigo entre lenguas (el dataset se denomina `trilingual_codeswitch_chat`, aunque las lenguas concretas no se enumeran).
- Cobertura tematica amplia pero superficial: el dataset incluye viajes, medicina, religion, transporte, cocina, cultura, educacion, finanzas personales, tecnologia, legal, entre otros.
- Capacidades heredadas del modelo base `Qwen/Qwen3.5-0.8B`: no se detallan en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes o razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multimodales (vision, audio) o modo *thinking*: no disponibles (no se documentan).
- Fusion del adaptador con el base mediante `merge_and_unload()` para inferencia sin la capa PEFT.

## Casos de uso

- Atencion al cliente en dariya marroqui: el adaptador esta entrenado especificamente sobre prompts en dariya, por lo que puede emplearse como capa de especializacion linguistica en un asistente de primer nivel para mercados de Marruecos, con el base de 0,8B manteniendo el coste por consulta muy bajo.
- Normalizacion de conversaciones con code-switching: util como componente de preprocesado o de generacion en sistemas que reciben mensajes mezclando dariya, arabe estandar y frances, un escenario frecuente en soporte y redes sociales del Magreb.
- Prototipado y pruebas de concepto en hardware modesto: al ser un adaptador sobre un modelo de 0,8B, permite iterar en portatil o en una GPU de gama de entrada antes de invertir en modelos mayores.
- Investigacion sobre adaptacion de dialectos arabes: sirve como punto de partida reproducible (config LoRA completa publicada) para estudiar tecnicas de SFT de bajo rango en variedades dialectales poco representadas.
- Generacion de datos sinteticos en dariya: se puede usar para aumentar corpus de entrenamiento o evaluacion en esa variedad, siempre con revision humana dado el riesgo de alucinacion de un modelo de 0,8B.
- Despliegue embebido o *edge*: el tamano reducido permite ejecutar el modelo fusionado en entornos con CPU o GPU integrada, por ejemplo asistentes locales de kiosco o aplicaciones moviles con backend ligero.
- Experimentos de evaluacion comparativa de adaptadores: el win rate del 49 % publicado frente al base lo convierte en un caso util para disenar protocolos de evaluacion mas exigentes (por dominio, por tipo de prompt) que los reportados por el autor.
- Clasificacion y respuesta en dominios concretos presentes en el dataset (viajes, cocina, transporte, salud basica) dentro de un flujo conversacional acotado y con supervision.

## Benchmarks y rendimiento

La model card solo publica un resultado de *win rate* frente al modelo base, sobre un conjunto de test retenido en distribucion y otro conjunto especifico de dominio. El unico valor numerico disponible es:

| Dominio | Win rate frente al modelo base |
|---|---|
| general | 49 % |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. El valor del 49 % implica paridad con el modelo base: no hay evidencia de mejora medible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6-2 GB en bf16/fp16 solo para los pesos del modelo base de 0,8B, mas la cache KV del contexto utilizado (estimacion, no dato publicado).
- Cuantizacion de 8 bits o 4 bits: aproximadamente 0,8 GB y 0,4-0,5 GB respectivamente para los pesos (estimacion).
- CPU: viable. Con 0,8B de parametros el modelo puede ejecutarse en CPU para uso no interactivo o de baja concurrencia.
- GPU consumer: si, cabe en practicamente cualquier GPU moderna con 4 GB o mas de VRAM (GTX 1650 4 GB, RTX 3050/3060, RTX 4060, etc.). La fusion del adaptador con el base (`merge_and_unload`) reduce el overhead de memoria respecto a mantener PEFT activo.
- GPU profesionales: no son necesarias. A100 o H100 solo tendrian sentido para lotes muy grandes o para evaluacion masiva, no por requisitos de memoria.
- Opciones de despliegue: `transformers` + `peft` tal como muestra la model card; modelo fusionado servido con vLLM o TGI; conversion a GGUF para llama.cpp u Ollama (procedimiento no documentado por el autor, requeriria conversion propia); bitsandbytes para carga cuantizada.
- Latencia y throughput estimados: no disponibles.
- Nota: el script de ejemplo de la model card usa el argumento `dtype=` en `from_pretrained`, que puede no ser compatible con todas las versiones de `transformers` (en versiones anteriores el argumento es `torch_dtype`); conviene verificar la version instalada.

## Comparativa con modelos similares

No se proporcionaron datos de modelos comparables (otros adaptadores de dariya, de dialectos arabes o de modelos de 0,8B) en la informacion disponible, por lo que no es posible establecer una comparativa con cifras. La unica comparacion posible con los datos aportados es la del adaptador frente a su propio modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `adaption_moroccan_darija_prompts_tril` | 0,8B (base) + adaptador LoRA r=32 | No disponible | Win rate 49 % vs. base (dominio general) | other | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-0.8B` (modelo base) | 0,8B | No disponible | Linea base de referencia | No disponible en la informacion aportada | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento no demostrado: el unico dato publicado es un win rate del 49 % frente al base en el dominio general, lo que equivale a paridad. No hay evidencia de que la adaptacion mejore las respuestas en dariya frente al modelo original.
- Licencia `other`: los terminos de uso no estan detallados en la model card. Es imprescindible revisar las condiciones exactas del repositorio y del modelo base `Qwen/Qwen3.5-0.8B` antes de cualquier uso comercial, ya que un adaptador queda sujeto tambien a la licencia del modelo sobre el que se aplica.
- Volumen de datos reducido: 7.429 filas para 5 épocas sobre un dataset con decenas de dominios implican muy pocos ejemplos por categoria, con riesgo de sobreajuste y de cobertura desigual.
- Desbalance de dominios: `other` (17 %) y `language` (8 %) dominan la distribucion; la mayoria de categorias tienen un 1 % o menos y muchas figuran a 0 %, por lo que no puede esperarse competencia real en esos ambitos.
- Calidad de metadatos dudosa: la lista de dominios contiene etiquetas duplicadas y con caracteres corruptos (`writing-edit游戏副本-communication`, `govern游戏副本`, `agric游戏副本`, `academic-游戏副本`), lo que apunta a fallos en el procesado del dataset y obliga a auditar los datos antes de reutilizarlos.
- Idiomas no declarados: los metadatos no enumeran idiomas soportados. El comportamiento fuera de dariya y de la alternancia de codigo del conjunto de entrenamiento no esta caracterizado.
- Ausencia de benchmarks estandar: no hay MMLU, GSM8K, HumanEval ni evaluaciones multilingues publicadas, lo que impide comparar con otros modelos de forma objetiva.
- Riesgo de alucinacion: inherente a un modelo de 0,8B de parametros; en dominios sensibles del dataset (medical 5 %, legal 1 %, personal-finance 2 %) las respuestas no deberian usarse sin supervision.
- Contexto desconocido: no se especifica la longitud de contexto del base ni la efectiva tras el entrenamiento; no es prudente asumir ventanas largas.
- Sin validacion comunitaria: 0 descargas y 0 likes. El repositorio fue creado y actualizado con pocos segundos de diferencia (17 de septiembre de 2026, 18:00:11 y 18:00:16), un patron habitual en artefactos generados de forma automatica; conviene verificar la integridad de los ficheros antes de usarlos.
- Dependencia de la libreria `peft` y de la version concreta del modelo base: cambios en el repositorio base pueden romper la carga del adaptador.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/oumayma03/adaption_moroccan_darija_prompts_tril
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Adaption Labs (herramienta AutoScientist con la que se entreno): https://adaptionlabs.ai
- Datasets citados en la model card, `moroccan_darija_prompts` y `trilingual_codeswitch_chat`: no se proporciona URL en la informacion disponible.
- Paper tecnico, blog o demo del modelo: no disponibles.
- La busqueda web realizada no devolvio ningun enlace relacionado con el modelo; los resultados obtenidos (apasprovence.com y sus subpaginas) no guardan relacion con este repositorio.
