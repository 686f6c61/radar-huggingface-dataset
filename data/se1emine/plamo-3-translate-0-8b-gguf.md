# Se1emine/plamo-3-translate-0.8b-GGUF

## Resumen

PLaMo 3 Translate 0.8B es un modelo especializado en traducción automática desarrollado por Preferred Networks (PFN) en colaboración con el NICT (Instituto Nacional de Tecnología de la Información y las Comunicaciones de Japón). Se distribuye como modelo base bajo el identificador `pfnet/plamo-3-translate-0.8b` y esta ficha describe la cuantización comunitaria Q8_0 en formato GGUF publicada por el usuario Se1emine. El modelo resuelve el problema de la traducción multilingüe de alta cobertura: soporta 53 idiomas, desde pares mayoritarios como inglés, español o chino hasta lenguas de menores recursos como cebuano, javanés, georgiano o urdu, con un tamaño total de 890.344.960 parámetros.

La relevancia de esta publicación concreta reside en su empaquetado: un único archivo GGUF de aproximadamente 0,949 GB que se puede ejecutar en CPU mediante llama.cpp sin necesidad de convertir pesos ni descargar el modelo original en BF16. Esto rebaja drásticamente la barrera de entrada para desplegar traducción local y privada en entornos con hardware modesto. La arquitectura subyacente es un transformer causal con un formato de prompt propietario denominado PFML3, que estructura la petición mediante etiquetas como `<|plamo:tag|>`, `<|plamo:key|>` y `<|plamo:val|>` en lugar de un chat genérico.

Es importante subrayar que esta no es una release oficial de PFN y que la licencia PLaMo Community License impone condiciones al uso comercial, incluyendo registro previo y umbrales de facturación anual. La model card del cuantizador es explícita sobre el alcance de sus pruebas: solo dos verificaciones cortas en CPU Windows, sin benchmarks de calidad ni validación de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura GGUF `plamo3`; clase original `Plamo3ForCausalLM`) |
| Parametros totales | 890.344.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens en metadatos GGUF; límite de entrenamiento reportado por el upstream de 32.768 tokens combinados de entrada y salida |
| Tipos de cuantizacion | Q8_0 (66 tensores Q8_0 + 97 tensores F32; `general.file_type = 7`, versión de cuantización 2) |
| Idiomas soportados | 53: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License Agreement (revisada el 9 de noviembre de 2026) |
| Formato de pesos | GGUF v3 (archivo `plamo-3-translate-0.8b-q8_0.gguf`, 948.896.000 bytes) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 890 millones de parámetros, derivado de PLaMo 3 NICT, un desarrollo conjunto de Preferred Networks y el NICT. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF o DPO. Lo que sí se conoce es que el modelo está especializado en traducción y que utiliza un formato de prompt propio, PFML3, con etiquetas estructuradas para declarar la tarea (`dataset`/`translation`), el idioma de entrada y salida, y el texto a traducir, además de opciones para glosarios.

La cuantización Q8_0 se realizó con las herramientas de llama.cpp build b12359 (`convert_hf_to_gguf.py --outtype q8_0`), usando el mapeo nativo `Plamo3ForCausalLM` → `plamo3`, los offsets de normalización y el manejo específico del tokenizador PLaMo. No se aplicó fine-tuning adicional. En Q8_0, cada bloque de 32 valores cuantizados comparte una escala en FP16; los 66 tensores Q8_0 contienen 890.241.024 elementos, mientras que 97 tensores de normalización y post-normalización (103.936 elementos) se mantienen intencionadamente en F32. El autor advierte que Q8_0 no implica que todos los tensores sean de 8 bits ni que las activaciones de inferencia sean de 8 bits.

## Capacidades

- Traducción automática entre 53 idiomas, incluyendo pares con el español como origen o destino.
- Traducción bidireccional declarando el idioma de entrada y de salida mediante las claves `lang` del formato PFML3.
- Soporte de glosarios y opciones adicionales del formato PFML3 según la model card upstream.
- Ejecución local en CPU mediante llama.cpp con la implementación nativa `plamo3`.
- Inferencia determinista con `--temp 0` y semilla fija, útil para pipelines reproducibles.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- El pipeline declarado es `translation`; no se anuncia generación de texto general ni código como capacidad principal.

## Casos de uso

- Traducción de documentación técnica interna: el modelo puede traducir manuales y notas de ingeniería entre inglés y español en local, sin enviar contenido sensible a servicios en la nube, gracias a su ejecución íntegra en CPU con llama.cpp.
- Localización de interfaces y cadenas de producto: con 53 idiomas disponibles se puede cubrir un catálogo amplio de mercados, incluyendo lenguas de menores recursos como cebuano, javanés o georgiano, usando el formato PFML3 para fijar el par de idiomas.
- Preprocesado multilingüe de corpus para investigación: traducción por lotes de reseñas, encuestas o notas de campo a un idioma pivote, con temperatura 0 y semilla fija para obtener salidas reproducibles.
- Atención al cliente en mercados secundarios: traducción de mensajes entrantes en idiomas poco cubiertos por otros modelos, con revisión humana posterior, dado el bajo coste de despliegue del archivo de 0,949 GB.
- Traducción de correspondencia y comunicaciones internas en organizaciones con plantillas multinacionales, donde la privacidad del texto es un requisito y el hardware disponible es un equipo de sobremesa.
- Prototipado y evaluación de pipelines de traducción: al ser un GGUF ligero, sirve como componente de referencia en pruebas de integración de sistemas de traducción antes de escalar a modelos mayores.
- Traducción asistida en entornos sin GPU: el modelo se ejecuta en CPU x86_64, lo que permite desplegarlo en servidores modestos o portátiles sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador indica explícitamente que las dos pruebas realizadas son verificaciones cortas de funcionamiento, no benchmarks de calidad de traducción ni tests de paridad numérica, y que las puntuaciones del modelo upstream no son mediciones de este archivo Q8_0. Las dos salidas registradas fueron "Hello, world!" traducido a ruso como "Привет, мир!" y "The meeting has been rescheduled for next Monday." traducido a japonés como "会議は来週の月曜日に日程が変更されました。".

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el archivo GGUF ocupa 948.896.000 bytes (aproximadamente 0,949 GB) y la inferencia verificada se ejecutó en CPU.
- GPU recomendadas: no disponibles; el autor no probó inferencia en GPU. Por tamaño, cualquier GPU consumer con más de 2 GB de memoria libre podría alojar los pesos, pero esto no está validado.
- Cabe en GPU consumer: previsiblemente sí por tamaño de pesos, aunque no hay verificación publicada.
- Opciones de despliegue: llama.cpp build b12359 o superior con soporte nativo de la arquitectura `plamo3`; se usó `llama-completion.exe`. El autor advierte que builds anteriores u otros frontends GGUF pueden no soportar esta arquitectura. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La prueba registrada usó `-t 2 -tb 2 -c 512 -n 64`, pero no se reportan tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B Q8_0 (esta ficha) | 890.344.960 | 262.144 en metadatos; 32.768 de entrenamiento reportado | 53 | PLaMo Community License | GGUF Q8_0 |
| PLaMo 3 Translate 0.8B (upstream PFN) | 890.344.960 | 32.768 de entrenamiento reportado | 53 | PLaMo Community License | Pesos originales (BF16) |
| Otras alternativas de traducción de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia PLaMo Community License no es Apache ni MIT: el uso comercial es condicional, requiere registro previo y está sujeto a un umbral de facturación o ventas anuales de 1.000 millones de yenes. Hay que conservar el acuerdo y la atribución exigida.
- El archivo no es una release oficial de PFN; es una cuantización comunitaria sin aval del desarrollador original.
- Solo se verificaron dos traducciones cortas en CPU Windows x86_64; no hay validación de calidad, de paridad numérica con el modelo original, de inferencia en GPU ni de contextos largos.
- Los metadatos GGUF declaran 262.144 tokens de contexto, pero el propio autor advierte que el límite de entrenamiento reportado por el upstream es de 32.768 tokens combinados y que no hay evidencia de calidad a esa longitud.
- El formato de prompt PFML3 es obligatorio; usar un prompt de chat genérico produce resultados no válidos.
- El runtime emitió advertencias del tokenizador sobre el tipo del token de control `</s>` y la pertenencia a EOS/EOT, aunque las ejecuciones terminaron con código 0.
- Riesgo de alucinación y de errores de traducción, especialmente en idiomas de bajos recursos; el autor recomienda revisar las traducciones antes de confiar en ellas.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero no hay evaluación publicada que los descarte.
- Compatibilidad limitada: builds antiguos de llama.cpp y otros frontends GGUF pueden no cargar la arquitectura `plamo3`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Se1emine/plamo-3-translate-0.8b-GGUF
- Modelo base upstream: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Formato de prompt PFML3: https://huggingface.co/pfnet/plamo-3-translate-0.8b#pfml3-prompt-format
- Revisión concreta del modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b/tree/8b4d42855622093e610ba9b90c2d2b59f8d5c15d
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Release de llama.cpp b12359: https://github.com/ggml-org/llama.cpp/releases/tag/b12359
