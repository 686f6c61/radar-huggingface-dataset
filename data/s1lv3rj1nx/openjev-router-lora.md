# s1lv3rj1nx/openjev-router-lora

## Resumen

OpenJev healthcare router es un adaptador LoRA de rango 16 sobre el modelo base Qwen/Qwen3-1.7B, publicado por el usuario s1lv3rj1nx bajo licencia Apache 2.0. No es un modelo generativo de propósito general, sino un clasificador de decisiones tipadas ("typed decisions") orientado a enrutamiento y guardrails en el dominio farmacéutico y de atención sanitaria. Su función es responder diez preguntas estructuradas en una única pasada hacia delante sobre el mismo mensaje: una elección de intención única (`choice`), cinco etiquetas temáticas multilabel (`noul`) y cuatro puertas de seguridad (scope, clinical, abusive, injection).

El adaptador tiene 17 millones de parámetros entrenables y ocupa 87 MB en disco, frente a los 1.700 millones de parámetros del modelo base. Se entrenó con solo 395 ejemplos sintéticos durante 258 segundos en una única GPU, y según la model card supera a la API comercial de decisiones tipadas contra la que se comparó (jev-1.13.0) en tres métricas, empata en cuatro y no pierde en ninguna, sobre 450 elementos de test retenidos con prueba exacta de McNemar.

Su relevancia práctica está en el patrón de diseño: demuestra que adaptar 17 M de parámetros con LoRA (r=16, LR 2e-4) rinde mejor en esta tarea que abrir los 1.725 M en un fine-tune completo (0.979 frente a 0.929 de accuracy de intención), con un artefacto treinta y nueve veces más pequeño. Eso permite que un único backbone cargado en memoria sirva a muchos routers distintos, algo inviable con artefactos de 3,4 GB por tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; adaptador LoRA r=16 sobre el modelo base Qwen/Qwen3-1.7B |
| Parametros totales | 1.700 millones en el modelo base; 17 millones de parametros entrenables en el adaptador (artefacto de 87 MB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la determina el modelo base Qwen3-1.7B |
| Tipos de cuantizacion | no disponible; el repositorio solo publica el adaptador en formato PyTorch y la cuantizacion depende del backend que cargue el modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (el modelo base se rige por su propia licencia) |
| Formato de pesos | adaptador PEFT/LoRA en safetensors, libreria pytorch; se fusiona con los pesos del modelo base al cargar |

Otros datos tecnicos: pipeline declarado `text-classification`, tamano del repositorio 0,1 GB, creado el 21 de septiembre de 2026 y actualizado el mismo dia. Cero descargas y cero likes en el momento de la consulta.

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder-only denso, mediante LoRA de rango 16 con PEFT. El punto clave de la receta es que el adaptador se fusiona con los pesos base en el momento de la carga, porque dejarlo sin fusionar cuesta aproximadamente el doble en inferencia sin ninguna ventaja a cambio. La capa de salida del sistema no es generativa: la libreria OpenJev expone primitivas `Choice` (softmax sobre opciones mutuamente excluyentes) y `Noul` (multilabel, una etiqueta binaria independiente por pregunta) y devuelve etiquetas con probabilidades. Las diez preguntas se resuelven en una sola pasada hacia delante sobre el mensaje compartido.

El entrenamiento uso 395 ejemplos farmacéuticos escritos a mano y compuestos sistematicamente durante 6 epochs, con una tasa de aprendizaje de 2e-4. La model card documenta una comparacion controlada con los mismos datos y los mismos 6 epochs: un encoder ModernBERT-base completamente abierto alcanza 0.899 de accuracy de intención con 150 M de parametros entrenables y un artefacto de 0,6 GB; una cabeza de 4,2 M sobre el decoder se queda en 0.666; abrir los 1.725 M del decoder da 0.929 con un artefacto de 3,4 GB; el adaptador LoRA r=16 logra 0.979 con 17 M y 87 MB. La explicacion que ofrece el autor es que un fine-tune completo tolera tasas de aprendizaje muy bajas (1e-5 apenas mueve un modelo de 1,7B en 6 epochs con 395 ejemplos), mientras que LoRA a 2e-4 se adapta rapido sin perturbar los pesos sobre los que se monta. Ninguna configuracion se ajusto mas alla de un unico valor de hiperparametros.

## Capacidades

- Clasificacion de intencion unica: una pregunta `choice` que devuelve una sola etiqueta con probabilidad asociada (por ejemplo, `refill` frente a `store_hours` frente a `order_status`).
- Clasificacion multilabel: cinco banderas `noul` de tematica, con una etiqueta binaria independiente por tema. En el ejemplo de la model card un mensaje con dos intenciones simultaneas (receta y horario) se resuelve etiquetando `store_hours` en la pregunta de intencion y detectando el segundo tema con probabilidad 1.000 en la bandera multilabel.
- Cuatro puertas de seguridad: scope (si el mensaje entra en el dominio), clinical (si menciona contenido clinico), abusive (si es abusivo) e injection (si intenta inyeccion de prompt).
- Deduccion de etiquetas a partir de instrucciones y criterios definidos en tiempo de ejecucion mediante los objetos `Choice` y `Noul`, sin reentrenamiento.
- Recuperacion de contenido clinico oblicuo: 0.966 de recall en la tier `clinical_oblique`, frente al 0.793 de la API de referencia.
- Reutilizacion de un unico backbone cargado para servir varios routers distintos, ya que el adaptador es un artefacto pequeno e intercambiable.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni agentes. El pipeline declarado es de clasificacion de texto.

## Casos de uso

- Enrutamiento de intencion en atencion al cliente farmaceutica: el modelo decide en una sola pasada si un mensaje trata sobre una receta, el horario de una sucursal o el estado de un pedido, y esa etiqueta puede dirigir la conversacion al flujo o al agente adecuado.
- Triaje multilabel de mensajes con varios temas: al usar `noul` en lugar de un softmax unico, un mensaje que pide a la vez una receta y el horario de apertura puede activar ambas banderas; la model card cifra en 0.909 la exactitud de conjunto multilabel frente al 0.822 de la API de referencia.
- Guardrail de alcance previo a un LLM mayor: la puerta de scope (0.978 de accuracy) filtra los mensajes fuera de dominio antes de gastar tokens en un modelo generativo mas caro, con el caveat de que su tasa de falsos positivos es alta (0.826 sobre 23 ejemplos negativos).
- Escalado a revision humana por contenido clinico: la puerta `G_clinical` marca si un mensaje menciona sintomas o contenido clinico para derivarlo a personal sanitario; en el ejemplo de la model card un mensaje sin sintomas da probabilidad 0.000 en esa puerta.
- Defensa frente a abuso e inyeccion de prompt: las puertas abusive (0.993) e injection (0.993) permiten bloquear o marcar entradas adversariales antes de que lleguen a un modelo generativo, con el matiz de que en ambas la API de referencia obtiene 0.996 y la diferencia es estadisticamente plana.
- Despliegue multi-tenant sobre un mismo backbone: como el adaptador pesa 87 MB, un unico Qwen3-1.7B cargado en memoria puede servir varios routers especializados (farmacia, seguros, logistica) intercambiando el adaptador, algo inviable con artefactos de 3,4 GB por tarea.
- Auditoria y analitica de conversaciones: las etiquetas tipadas con probabilidad permiten agregar volumen de consultas por tema, detectar picos de contenido clinico o medir la proporcion de mensajes fuera de alcance sin procesamiento posterior.
- Clasificacion por lotes de bajo coste: al resolverse todo en una unica pasada hacia delante sobre el mensaje y requerir solo un modelo de 1,7B en inferencia, es viable ejecutarlo sobre volumenes altos en hardware modesto.

## Benchmarks y rendimiento

Datos publicados en la model card. Todos los sistemas se evaluaron sobre los mismos 450 elementos de test retenidos, con prueba exacta de McNemar por pares. `b10` son los pares discordantes en los que gana este adaptador y `b01` aquellos en los que gana la API de referencia.

| Metrica | Este adaptador | API de referencia (jev-1.13.0) | b10 | b01 | p | Ganador |
|---|---|---|---|---|---|---|
| Intencion | 0.979 | 0.941 | 14 | 1 | 9,8e-04 | este adaptador |
| Conjunto exacto multilabel | 0.909 | 0.822 | 57 | 18 | 7,2e-06 | este adaptador |
| Puerta de scope | 0.978 | 0.880 | 49 | 5 | 3,9e-10 | este adaptador |
| Puerta clinica | 0.987 | 0.978 | 7 | 3 | 0,34 | empate |
| Puerta de abuso | 0.993 | 0.996 | 2 | 3 | 1,00 | empate |
| Puerta de injection | 0.993 | 0.996 | 1 | 2 | 1,00 | empate |
| Recall clinico oblicuo | 0.966 | 0.793 | 5 | 0 | 0,06 | empate |

Resultado global: tres victorias, cuatro empates y ninguna derrota. La model card advierte de que la comparacion de latencia no es homogenea: los 407 ms de la API corresponden a una llamada alojada de extremo a extremo que incluye red, mientras que las cifras del adaptador son computo local en GPU.

Comparacion de configuraciones de entrenamiento, mismos datos y mismos 6 epochs:

| Configuracion | Accuracy de intencion | Parametros entrenables | Artefacto |
|---|---|---|---|
| Encoder ModernBERT-base, todo abierto | 0.899 | 150 M | 0,6 GB |
| Decoder, solo cabeza | 0.666 | 4,2 M | 17 MB |
| Decoder, los 1,7B abiertos | 0.929 | 1.725 M | 3,4 GB |
| Decoder, LoRA r=16 | 0.979 | 17 M | 87 MB |

## Requisitos de hardware

- Artefacto del adaptador: 87 MB. Se fusiona con los pesos base al cargar; dejarlo sin fusionar cuesta aproximadamente el doble en inferencia, segun la model card.
- VRAM estimada para inferencia, solo pesos del modelo base de 1,7B: en torno a 3,4 GB en fp16/bf16, aproximadamente 1,7 GB en int8 y alrededor de 1 GB en int4. Son estimaciones derivadas del tamano del modelo, no cifras publicadas por el autor.
- La VRAM real debe sumar el coste de activaciones, el contexto y el propio adaptador; no se publican mediciones de memoria pico.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM puede ejecutar la variante en cuantizacion reducida, y 8-12 GB son suficientes para fp16 con contexto moderado (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090).
- GPU de datacenter recomendadas para lotes grandes: A100, H100 o L40S, aunque el modelo es lo bastante pequeno como para no necesitarlas.
- Opciones de despliegue: Transformers con PEFT (ruta oficial de la model card, via `DecisionModel.from_pretrained`), vLLM, TGI o llama.cpp/Ollama si se convierte el modelo fusionado a GGUF. El autor no documenta despliegue con estos backends.
- Latencia: no se publican cifras de latencia ni throughput del adaptador. La referencia externa es el tiempo de entrenamiento (258 segundos en una GPU para 395 ejemplos) y los 407 ms de extremo a extremo de la API comercial, que no son comparables entre si.
- El script de reproduccion de la comparativa esta en `scripts/compare_to_jev.py` dentro del repositorio de GitHub.

## Comparativa con modelos similares

No se dispone de datos de licencia, contexto o disponibilidad de la API comercial de referencia, por lo que la comparacion se limita a lo publicado en la model card.

| Sistema | Tipo | Parametros entrenables | Accuracy de intencion | Artefacto | Licencia |
|---|---|---|---|---|---|
| openjev-router-lora | Adaptador LoRA r=16 sobre Qwen3-1.7B | 17 M | 0.979 | 87 MB | Apache 2.0 |
| Fine-tune completo de Qwen3-1.7B | Decoder completo abierto | 1.725 M | 0.929 | 3,4 GB | Apache 2.0 (base) |
| Encoder ModernBERT-base | Fine-tune completo de encoder | 150 M | 0.899 | 0,6 GB | no disponible |
| Cabeza de clasificacion sobre decoder | Solo cabeza | 4,2 M | 0.666 | 17 MB | no disponible |
| API de referencia jev-1.13.0 | Servicio comercial de decisiones tipadas | no disponible | 0.941 | no aplica (alojado) | no disponible |

Frente a la API comercial, este adaptador gana en intencion, conjunto exacto multilabel y puerta de scope, y empata en las puertas clinica, de abuso y de injection. Frente a las alternativas de codigo abierto, gana en accuracy con el segundo artefacto mas pequeno de la tabla y el menor numero de parametros entrenables.

## Limitaciones y advertencias

- Datos sinteticos: los 395 ejemplos de entrenamiento son mensajes farmaceuticos escritos a mano y compuestos sistematicamente, no trafico real. La model card lo describe explicitamente como evidencia de que la receta funciona, no como una afirmacion sobre usuarios reales.
- La puerta de scope dispara en exceso: tasa de falsos positivos de 0.826 sobre 23 ejemplos negativos, lo que la convierte en la mas debil de las cuatro puertas pese a superar a la API de referencia en conjunto.
- Tamanos de muestra pequenos en varias tiers: `clinical_oblique` tiene 29 elementos, de modo que una prueba pareada sin derrotas queda con un suelo de p = 0,0625. La diferencia 0.966 frente a 0.793 es real pero no estadisticamente separable.
- No es un producto sanitario: las puertas solo indican si un mensaje menciona contenido clinico, con el objetivo de escalarlo a una persona.
- Sin capacidad demostrada de zero-shot: el modelo esta ajustado a su tarea concreta. Sobre un esquema que no ha visto, OpenJev puntua muy por debajo de la API de referencia, limitacion documentada por el propio autor.
- Idioma: no se declara ningun idioma soportado. Los datos de entrenamiento son mensajes farmaceuticos en el dominio descrito, sin garantia de comportamiento en otros idiomas o registros.
- Riesgo de sobreajuste por volumen de datos: 395 ejemplos y 6 epochs, con evaluacion sobre 450 elementos retenidos de origen sintetico.
- Licencia Apache 2.0 para el adaptador, pero el modelo base Qwen3-1.7B se rige por su propia licencia, que hay que verificar por separado antes de un uso comercial.
- Advertencia operativa: el adaptador debe fusionarse con los pesos base antes de servir inferencia; mantenerlo sin fusionar duplica aproximadamente el coste de computo.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s1lv3rj1nx/openjev-router-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo y resultados completos: https://github.com/S1LV3RJ1NX/openjev
- Script de reproduccion de la comparativa: `scripts/compare_to_jev.py` en el repositorio anterior
- Dataset de entrenamiento: https://huggingface.co/datasets/s1lv3rj1nx/openjev-healthcare-router
- Suite de test retenida: https://huggingface.co/datasets/s1lv3rj1nx/openjev-heldout
- Checkpoint general para tareas sin etiquetas: https://huggingface.co/s1lv3rj1nx/openjev-encoder-general
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos eran documentacion de ayuda de Google Docs, sin relacion con el modelo.
