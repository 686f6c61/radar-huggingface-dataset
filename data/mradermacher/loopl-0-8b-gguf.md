# mradermacher/loopl-0.8b-GGUF

## Resumen

Loopl-0.8b-GGUF es la versión cuantizada en formato GGUF del modelo cagataydev/loopl-0.8b, publicada por el usuario mradermacher, especializado en generar cuantizaciones estáticas de modelos abiertos. Se trata de un modelo multimodal de tipo image-text-to-text, con 752.393.024 parámetros reales (aproximadamente 0,75B, comercializado como "0.8b"), orientado a ejecución en dispositivo (on-device), uso como agente y llamada a herramientas (tool-calling). El repositorio incluye tanto los pesos del modelo de lenguaje cuantizados como los ficheros auxiliares `mmproj` necesarios para procesar imágenes.

El modelo base fue desarrollado por cagataydev y afina mediante SFT (supervised fine-tuning) sobre el dataset cagataydev/loopl-train. Las etiquetas del repositorio indican linaje Qwen3.5 (`qwen3.5`, `qwen3_5`), capacidades de visión y soporte conversacional, además de los idiomas inglés (en) y turco (tr). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en el segmento de modelos pequeños multimodales capaces de ejecutarse en hardware de consumo: el quant recomendado Q4_K_M ocupa solo 0,6 GB, lo que permite desplegarlo en portátiles, mini-PC o dispositivos embebidos con GPU integrada. Esto lo sitúa como candidato para agentes locales y pipelines de automatización con restricciones de memoria, aunque con el techo de capacidad propio de un modelo sub-1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; las etiquetas del repositorio indican linaje Qwen3.5 (`qwen3.5`, `qwen3_5`) y modalidad image-text-to-text |
| Parametros totales | 752.393.024 (dato real de safetensors, ~0,75B) |
| Parametros activos | No aplica / no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj-f16 y mmproj-Q8_0 para la parte multimodal |
| Idiomas soportados | Ingles (en), turco (tr) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (estaticos); el modelo base esta en safetensors |
| Repositorio | mradermacher/loopl-0.8b-GGUF |
| Modelo base | cagataydev/loopl-0.8b |
| Dataset de entrenamiento | cagataydev/loopl-train |
| Tamano del repo | 7,8 GB (incluye todas las cuantizaciones) |
| Descargas / likes | 245 descargas, 0 likes |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio. Estas apuntan a un transformer multimodal de la familia Qwen3.5, con torre de vision integrada (pipeline `image-text-to-text`) y ficheros `mmproj` separados que actuan como suplemento multimodal en el ecosistema GGUF/llama.cpp. El modelo base fue sometido a SFT (supervised fine-tuning), segun la etiqueta `sft`, y esta orientado explicitamente a casos de uso de agente y tool-calling (`agent`, `tool-calling`, `on-device`). No se especifica numero de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO posteriores al SFT.

El trabajo de mradermacher consiste en la conversion y cuantizacion estatica del modelo base a GGUF, tarea que no modifica los pesos mas alla de la perdida propia de la cuantizacion. El repositorio incluye tambien una variante con cuantizaciones ponderadas por imatrix (`mradermacher/loopl-0.8b-i1-GGUF`), que suele ofrecer mejor relacion calidad/tamano en tipos IQ. Los ficheros `mmproj` son imprescindibles si se quiere conservar la capacidad de vision; sin ellos el modelo funciona solo como modelo de texto.

## Capacidades

- Generacion de texto conversacional en ingles y turco, con formato de chat multi-turno.
- Procesamiento de imagenes (image-text-to-text): acepta entrada visual junto a texto mediante los ficheros `mmproj`.
- Tool calling / function calling, segun las etiquetas `tool-calling` y `agent` del repositorio.
- Uso como agente en flujos de varios pasos, disenado explicitamente para escenarios de agente.
- Ejecucion on-device: el modelo esta pensado para correr localmente en hardware limitado.
- Capacidades multilingues limitadas a ingles y turco; no se declaran otros idiomas.

## Casos de uso

- Agente local en escritorio: el modelo puede gestionar bucles de decision con llamadas a herramientas en un portatil sin GPU dedicada, gracias a que la cuantizacion Q4_K_M ocupa 0,6 GB y cabe en memoria RAM o VRAM integrada.
- Asistente de atencion al cliente en turco o ingles: conversaciones multi-turno con respuestas generadas localmente, sin enviar datos a la nube, lo que ayuda a cumplir requisitos de privacidad.
- Automatizacion de tareas ofimaticas: extraccion de informacion de capturas de pantalla o imagenes simples y conversion a texto estructurado o acciones concretas.
- Prototipado rapido de agentes: por su tamano, sirve para validar arquitecturas de tool-calling antes de escalar a un modelo mayor, con coste computacional minimo.
- Despliegue en dispositivos embebidos o edge: robots de bajo coste, kioscos interactivos o sistemas de vision sencillos que necesitan describir o clasificar imagenes en local.
- Clasificacion y etiquetado ligero de imagenes: uso de la torre de vision para tareas de categorizacion acompanadas de texto explicativo.
- Generacion de texto offline en entornos sin conectividad: documentacion, resumenes breves o respuestas guionizadas con latencia baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar overhead de contexto ni la torre de vision):
  - Q2_K: ~0,5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~0,5-0,6 GB
  - Q4_K_S / Q4_K_M / IQ4_XS: ~0,6 GB (recomendados por el autor)
  - Q5_K_S / Q5_K_M: ~0,7 GB
  - Q6_K: ~0,7 GB
  - Q8_0: ~0,9 GB
  - f16: ~1,6 GB
  - mmproj-f16: ~0,3 GB; mmproj-Q8_0: ~0,2 GB (adicionales si se usa vision)
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en iGPU modernas (Intel Iris Xe, AMD Radeon integrada) y en CPU con 2-4 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. La libreria declarada en el repositorio es `transformers`, pero el formato GGUF esta pensado para el ecosistema llama.cpp.
- Latencia y throughput estimados: no disponibles. Por tamano, en hardware de consumo deberia ser de decenas a cientos de tokens por segundo, pero no hay medicion publicada que lo confirme.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| loopl-0.8b (este modelo) | ~0,75B | Texto + imagen | No disponible | Apache 2.0 | Orientado a agente y tool-calling, idiomas en/tr |
| Qwen3-0.6B | ~0,6B | Texto | No disponible en esta ficha | Apache 2.0 | Alternativa densa de texto, sin vision declarada |
| Llama-3.2-1B | ~1,2B | Texto | No disponible en esta ficha | Llama 3.2 Community License | Mayor tamano, licencia con condiciones de uso |
| SmolVLM (variantes ~0,5B) | ~0,5B | Texto + imagen | No disponible en esta ficha | Apache 2.0 | Alternativa multimodal de tamano comparable |

No hay datos de rendimiento publicados en la informacion disponible para establecer una comparacion cuantitativa fiable entre estos modelos.

## Limitaciones y advertencias

- Con 752 millones de parametros, la capacidad de razonamiento, matematicas y codigo es limitada en comparacion con modelos de 7B o superiores; el modelo esta pensado para tareas acotadas y no para razonamiento complejo.
- Riesgo de alucinacion elevado, especialmente en tareas de conocimiento factual, por su tamano reducido.
- Idiomas soportados unicamente ingles y turco; no hay evidencia de buen rendimiento en castellano.
- Longitud de contexto no disponible: no se puede planificar el uso en escenarios que requieran ventanas largas sin verificacion previa.
- La arquitectura y los detalles de entrenamiento no estan documentados en la model card; el autor no publica composicion del dataset ni numero de tokens.
- El modelo base fue afinado por un tercero (cagataydev) y cuantizado por mradermacher; las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad y el soporte de tool-calling.
- Para conservar la capacidad de vision es obligatorio descargar tambien el fichero `mmproj`; sin el, el modelo solo procesa texto.
- Las cuantizaciones estaticas de este repositorio pueden rendir peor que las imatrix del repositorio `loopl-0.8b-i1-GGUF` con el mismo tamano.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base y del dataset de entrenamiento por si tuvieran restricciones adicionales.
- Sin datos de benchmarks, no se recomienda su adopcion en produccion critica sin una evaluacion propia en el dominio objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/loopl-0.8b-GGUF
- Modelo base: https://huggingface.co/cagataydev/loopl-0.8b
- Dataset de entrenamiento: https://huggingface.co/datasets/cagataydev/loopl-train
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/loopl-0.8b-i1-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#loopl-0.8b-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplexidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Variante del mismo modelo en 2B (referencia): https://huggingface.co/mradermacher/loopl-2b-GGUF
