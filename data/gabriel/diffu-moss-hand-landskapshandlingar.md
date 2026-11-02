# Gabriel/diffu-moss-hand-landskapshandlingar

## Resumen

diffu-moss-hand-landskapshandlingar es un adaptador LoRA (PEFT) para el modelo de difusion text-to-image MOSS-Image-Base, desarrollado por OpenMOSS-Team. Lo publica el usuario Gabriel como parte del proyecto diffu, una herramienta para generar paginas sinteticas de archivo con etiquetas ALTO y PAGE exactas, destinadas a entrenar modelos de reconocimiento de escritura manuscrita (HTR) y de lectura de paginas. El adaptador no es un modelo autonomo: modifica el DiT (Diffusion Transformer) de MOSS-Image para que dibuje paginas manuscritas con la mano de los landskapshandlingar, los libros de cuentas provinciales de la Suecia moderna temprana.

El problema que resuelve es la escasez de datos etiquetados en HTR historico. En lugar de escanear y transcribir manualmente miles de paginas, diffu genera paginas sinteticas con el texto y las cajas de cada linea ya conocidos, lo que permite entrenar modelos de lectura de paginas con supervision perfecta. El adaptador aporta el estilo caligrafico y la estructura de pagina de una coleccion concreta, mientras que el texto lo controla el prompt.

Tecnicamente es un LoRA de rango 32 y alpha 32 aplicado sobre 265 capas Linear del DiT, con pesos en bfloat16 y un unico idioma de destino, el sueco (sv). La licencia es Apache-2.0, heredada del modelo base. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Diffusion Transformer (DiT) de MOSS-Image-Base |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bfloat16) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, layout PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el DiT de MOSS-Image-Base: 42 bloques conjuntos con proyecciones q, k, v, o, ffn_up_gate y ffn_down, ademas del refinador de texto, dos embedders y la capa final. El LoRA cubre 265 capas Linear con rango 32 y alpha 32, exportado originalmente con LyCORIS (algoritmo `lora`) y convertido al layout de PEFT; la conversion se verifico capa por capa, comprobando que cada clave cae en una capa que PEFT construye con esa configuracion y que el escalado (alpha/r) x up @ down coincide exactamente con el entrenamiento.

El entrenamiento uso 208 ventanas de aproximadamente 1 MP recortadas de paginas de ground truth de escritura manuscrita de archivo sueco, cada una con un prompt de tipo MOSS Layout que nombra la coleccion y detalla el texto exacto y la caja de cada linea. Se entreno con KohakuMossTrainer durante 700 pasos, AdamW a 1e-4, con el muestreo de niveles de ruido propio de MOSS-Image y el text encoder y el VAE congelados. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de imagenes text-to-image de paginas manuscritas con la caligrafia de los landskapshandlingar.
- Control del contenido textual mediante el prompt: el caption especifica el texto exacto y la caja de cada linea.
- Generacion de paginas sinteticas con etiquetas ALTO y PAGE exactas cuando se usa dentro del pipeline diffu.
- Reproduccion de un estilo caligrafico y una estructura de pagina concretos de una coleccion de archivo sueca.
- Integracion con el ecosistema PEFT: el adaptador se puede fusionar en el DiT con `merge_and_unload()` y guardar como modelo completo.
- Compatibilidad con cualquier implementacion de MOSS-Image que conserve los nombres de modulo originales (por ejemplo, `MossTransformer` de diffu).
- Soporte de inferencia con los parametros de muestreo de MOSS-Image: aproximadamente 1 MP, 50 pasos, guidance 3, shift 5 y salto del bloque 22 en la pasada incondicional.

## Casos de uso

- Generacion de datos de entrenamiento para HTR: diffu dibuja paginas con el adaptador y produce pares imagen-etiqueta ALTO/PAGE exactos, lo que permite entrenar modelos de lectura de paginas sin transcripcion manual.
- Aumento de corpus de archivo sueco: se generan variaciones sinteticas de paginas de cuentas provinciales para ampliar un conjunto de ground truth pequeno antes de entrenar un modelo de reconocimiento.
- Pruebas de robustez de modelos OCR/HTR: se alimentan modelos existentes con paginas sinteticas de caligrafia historica para medir su degradacion ante estilos no vistos.
- Prototipado de interfaces de archivo digital: se generan facsimiles de paginas para maquetar visores de documentos historicos sin exponer originales restringidos.
- Investigacion en humanidades digitales: se producen ejemplos controlados de paginas con texto conocido para estudiar paleografia o diseno de etiquetados.
- Validacion de pipelines de anotacion: se comprueba que el conversor de etiquetas ALTO/PAGE funciona correctamente usando paginas generadas cuyo contenido textual se conoce de antemano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion; depende del modelo base MOSS-Image-Base completo, ya que el adaptador solo anade pesos LoRA de rango 32.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT para fusionar el adaptador en el DiT; el pipeline diffu (`diffu-moss-init`) para construir el modelo completo; el muestreo sigue el de MOSS-Image (aproximadamente 1 MP, 50 pasos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffu-moss-hand-landskapshandlingar | LoRA sobre DiT text-to-image | no disponible | no disponible | Apache-2.0 | HuggingFace (0 descargas) |
| OpenMOSS-Team/MOSS-Image-Base | DiT text-to-image base | no disponible | no disponible | Apache-2.0 (segun el adaptador) | HuggingFace |
| Alternativas de HTR historico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador reproduce una sola mano de una sola coleccion; otras caligrafias y tipos de pagina no se han probado.
- El texto dibujado debe verificarse: diffu relee cada linea generada y marca como dudosa en las etiquetas cualquier linea que no pueda confirmar.
- El adaptador no recibe una pagina de muestra; el estilo procede del adaptador y del prompt, por lo que el caption debe nombrar la coleccion tal como se hizo en entrenamiento.
- Solo se declara soporte de sueco; no hay evidencia de generalizacion a otros idiomas.
- Riesgo de alucinacion visual y textual inherente a los modelos de difusion: el texto generado puede ser incorrecto aunque la imagen parezca plausible.
- No se han publicado evaluaciones cuantitativas de calidad, fidelidad caligrafica ni tasas de error del texto generado.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones de MOSS-Image-Base en su revision concreta.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gabriel/diffu-moss-hand-landskapshandlingar
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio diffu: https://github.com/Borg93/diffu2
