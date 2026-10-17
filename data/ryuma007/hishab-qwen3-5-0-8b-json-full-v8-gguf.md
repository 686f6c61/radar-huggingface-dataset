# ryuma007/hishab-qwen3.5-0.8b-json-full-v8-GGUF

## Resumen

Hishab Qwen3.5 0.8B JSON full v8 es un ajuste fino completo del modelo denso Qwen3.5-0.8B (752.393.024 parametros), publicado en formato GGUF por el usuario ryuma007. Su proposito es muy concreto: actuar como extractor de transacciones financieras para Hishab, una aplicacion bangladesi de finanzas personales. Recibe un mensaje de chat escrito en ingles, bangla o banglish (bangla transcrito con caracteres latinos) y devuelve un array JSON estricto con los campos `description`, `amount` (en taka, BDT), `category` y `type`.

El interes de la ficha no esta en el rendimiento generalista, sino en el enfoque: un modelo pequeno, cuantizado a menos de 600 MB, capaz de ejecutarse en un telefono Android y de resolver una tarea de extraccion de informacion con validacion JSON del 100 % en los conjuntos de prueba del autor. Es un ejemplo representativo de la tendencia a especializar modelos de menos de mil millones de parametros para tareas de produccion acotadas, en lugar de recurrir a modelos frontera por API.

La variante documentada aqui es la "full", un ajuste fino de todos los pesos, frente a la variante LoRA del mismo autor. Se publica bajo licencia Apache 2.0 y esta entrenada exclusivamente con datos sinteticos, lo que el propio autor advierte como limitacion principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la model card; heredada del modelo base Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M con importance matrix (`-imat`), Q5_K_M, Q6_K |
| Idiomas soportados | bn (bangla), en (ingles), mas banglish (bangla en caracteres latinos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parametros de la serie Qwen3.5 de Alibaba Cloud, orientada a despliegue en el borde. La model card no detalla la configuracion interna (numero de capas, dimensiones, mecanismo de atencion), por lo que esos datos quedan como no disponibles. El ajuste es un fine-tune completo de todos los pesos, no un adaptador LoRA: 3 epocas con TRL, learning rate 3e-05 con scheduler coseno, perdida calculada solo sobre la completion (completion-only loss), sobre 20.333 filas de entrenamiento, seleccionando la mejor epoca por perdida de validacion.

Los datos proceden exclusivamente del dataset sintetico ryuma007/hishab-synthetic-v4, que cubre los cuatro registros linguisticos (ingles, bangla, banglish y mezclas) y casos con importes escritos con palabras, como "der hajar" o "পনেরো হাজার". Las matrices de importancia (`-imat`) usadas para la cuantizacion Q4_K_M se calcularon sobre las conversaciones de entrenamiento ya renderizadas. El resultado es un modelo que no genera texto libre: emite directamente el array JSON. La model card indica que los modelos Qwen3.5 deben ejecutarse con el modo de razonamiento desactivado, que es el comportamiento por defecto al usar `--jinja` en llama.cpp.

## Capacidades

- Extraccion de transacciones financieras desde texto libre, devolviendo un array JSON con los campos `description`, `amount`, `category` y `type`.
- Clasificacion en 14 categorias predefinidas: food, grocery, rent, utilities, mobile_recharge, transport, tuition, salary, gift, loan, shopping, medical, entertainment y other.
- Distincion entre ingresos (`income`) y gastos (`expense`).
- Manejo de multiples transacciones en un mismo mensaje.
- Normalizacion de abreviaturas de importes (`1.5k`, `2 lakh`) y de cantidades escritas con palabras en bangla o banglish.
- Procesamiento de cuatro registros linguisticos: ingles, bangla, banglish y codigo mezclado.
- Salida estricta: si no hay ninguna transaccion en el mensaje, devuelve un array vacio; en la variante documentada responde unicamente con el array JSON, sin texto adicional.
- No dispone de tool calling, capacidades de agente, vision ni audio.

## Casos de uso

- Registro automatico de gastos en la app Hishab: el usuario escribe "Ajke tution fee 5k disi, riksha 80, cha 20" y el modelo devuelve tres transacciones ya categorizadas, eliminando la introduccion manual de formularios.
- Procesamiento por lotes de historiales de chat financiero: al devolver JSON estricto con una tasa de validez del 100 % en los conjuntos de prueba, puede integrarse en un pipeline que reconstruya libros de cuentas a partir de conversaciones antiguas.
- Analitica de gastos personales: las categorias normalizadas permiten agregar gasto por concepto directamente en una base de datos, sin post-procesado de texto libre.
- Asistente financiero en el dispositivo: con 529 MB en Q4_K_M, se ejecuta localmente en Android a traves de kiln, lo que evita enviar datos financieros personales a un servidor externo.
- Soporte a usuarios que alternan idiomas: el modelo gestiona mensajes con bangla, ingles y banglish mezclados en la misma frase, un escenario habitual en Bangladesh.
- Extraccion desde notas de voz transcritas: cualquier salida de ASR en bangla o banglish puede canalizarse al modelo para estructurar los importes mencionados.
- Preprocesado para sistemas contables: los arrays JSON resultantes se pueden cargar directamente en un ERP o en una hoja de calculo para conciliacion.

## Benchmarks y rendimiento

Evaluacion con llama.cpp en modo greedy sobre particiones reservadas de ryuma007/hishab-synthetic-v4: *test* (518 filas, los cuatro idiomas) y *numbers* (357 filas en las que cada importe esta escrito con palabras). `exact` significa que el conjunto de tuplas (importe, categoria, tipo) coincide exactamente con el conjunto de referencia.

| Archivo | Tamano | test exact | test tuple F1 | JSON valido | banglish exact | numbers exact |
|---|---|---|---|---|---|---|
| `qwen3.5-0.8b__json__full__v8-Q4_K_M-imat.gguf` | 529 MB | 88,6 | 93,8 | 100,0 | 82,6 | 80,1 |
| `qwen3.5-0.8b__json__full__v8-Q5_K_M.gguf` | 578 MB | 88,2 | 93,5 | 100,0 | 81,7 | 80,7 |
| `qwen3.5-0.8b__json__full__v8-Q6_K.gguf` | 630 MB | 89,2 | 94,0 | 100,0 | 83,6 | 80,1 |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible. Los tres niveles de cuantizacion presentan un rendimiento muy similar, con diferencias dentro del margen de ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. El archivo mas pequeno (Q4_K_M con importance matrix) ocupa 529 MB; Q5_K_M, 578 MB; Q6_K, 630 MB. Hay que anadir el contexto y el overhead del runtime.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU sola.
- Despliegue movil en Android mediante kiln, segun indica el autor.
- Opciones de despliegue: llama.cpp (formato nativo), llama-cli con `--hf-repo` y `--jinja`, y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, servidores basados en llama.cpp). No se menciona compatibilidad con vLLM ni TGI.
- Latencia y throughput estimados: no disponibles.
- Importante: el prompt de sistema usado en entrenamiento debe reproducirse literalmente, y el modo de razonamiento debe permanecer desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hishab Qwen3.5 0.8B JSON full v8 | 752.393.024 | no disponible | GGUF | apache-2.0 | Ajuste fino completo; 88,6 % exact en test (Q4_K_M) |
| ryuma007/hishab-qwen3.5-0.8b-json-lora-GGUF | no disponible | no disponible | GGUF | no disponible | Variante LoRA del mismo autor; no se han publicado resultados comparativos en la informacion disponible |
| Qwen/Qwen3.5-0.8B | 0,8 B aprox. | no disponible | safetensors | no disponible | Modelo base sin ajustar; no realiza la tarea de extraccion JSON sin ingenieria de prompts adicional |

No se dispone de datos publicados que permitan comparar el rendimiento frente a alternativas de la misma categoria (por ejemplo, otros extractores JSON de menos de mil millones de parametros).

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: el propio autor advierte que cabe esperar una precision menor sobre mensajes reales hasta que exista un conjunto de prueba etiquetado por humanos.
- Sesgo de dominio: el modelo solo conoce el vocabulario, los comercios y las convenciones de importes de Bangladesh y de la aplicacion Hishab. Fuera de ese contexto, su utilidad es dudosa.
- El idioma de salida y de entrada se limita a bangla, ingles y banglish; no se ha entrenado para castellano ni para otras lenguas.
- Riesgo de alucinacion en los importes: si el mensaje es ambiguo, el modelo puede inventar cantidades o categorias plausibles en lugar de devolver un array vacio. Los campos `category` estan restringidos a una lista cerrada, lo que limita el dano, pero no lo elimina.
- La tasa de acierto en importes escritos con palabras ("numbers exact") ronda el 80 %, diez puntos por debajo de la tarea general; conviene validar ese caso de uso antes de llevarlo a produccion.
- El prompt de sistema es parte del contrato del modelo: modificarlo o acortarlo probablemente degrade la calidad del JSON.
- Debe ejecutarse con el razonamiento desactivado; activarlo altera el formato de salida.
- Licencia Apache 2.0 en el modelo ajustado, pero conviene verificar los terminos del modelo base Qwen3.5-0.8B y del dataset sintetico antes de un uso comercial.
- El repositorio acumula 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, y fue creado en octubre de 2026; no hay validacion independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-json-full-v8-GGUF
- Variante LoRA del mismo autor: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-json-lora-GGUF
- Repositorio del proyecto y pipeline completo: https://github.com/RaihanulHaque/hishab
- Runtime para Android: https://github.com/RaihanulHaque/kiln
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pagina del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Repositorio de la serie Qwen3.5/3.8: https://github.com/QwenLM/Qwen3.8
- Ficha en free2aitools (variante LoRA): https://free2aitools.com/model/ryuma007/hishab-qwen3.5-0.8b-json-lora-gguf
