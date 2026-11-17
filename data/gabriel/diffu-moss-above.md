# Gabriel/diffu-moss-above

## Resumen
diffu-moss-above es un ajuste fino completo (full fine-tune) del transformer DiT de MOSS-Image-Base, desarrollado por el usuario Gabriel. Su proposito no es la generacion de imagenes generica, sino la sintesis de paginas completas de archivo manuscrito sueco de los siglos XVI a XIX, imitando la letra y el aspecto de una pagina de muestra. El modelo forma parte del ecosistema diffu (Borg93/diffu2), una herramienta orientada a generar datos sinteticos etiquetados para reconocimiento de escritura manuscrita a nivel de pagina (HTR).

La entrada del modelo es un prompt de tipo MOSS Layout (un elemento de texto por linea con su contenido exacto y su caja delimitadora), el texto que debe escribirse y una pagina de muestra aportada como tokens de imagen adicionales. La salida es una imagen de pagina junto con sus etiquetas ALTO y PAGE exactas, lo que lo hace directamente util para aumentar corpus de entrenamiento en proyectos de digitalizacion de archivos historicos.

Tecnicamente es un transformer de difusion con aproximadamente 5.080 millones de parametros (solo el DiT, en bfloat16), entrenado sobre paginas de 2 megapixeles. Su innovacion principal frente al predecesor diffu-moss-r6b es que coloca los tokens de la pagina de muestra justo encima de la pagina dibujada (`reference_place: above`) y fue entrenado para tomar la caligrafia de la muestra, no solo su aspecto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) de MOSS-Image, implementado en diffu (`diffu_moss.transformer.MossTransformer`) |
| Parametros totales | 5.082.308.608 (solo el DiT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 10,2 GB) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino completo del DiT de MOSS-Image-Base (revision `85975793`) sobre el que se conservan sin cambios el codificador de texto, el tokenizer, el VAE y el scheduler. La unica pieza entrenada es el DiT, exportado con la media movil exponencial (decay 0,999) del ultimo paso, el 10.257. La configuracion usa la implementacion propia de diffu (`diffu_moss.transformer.MossTransformer`) con el parametro `reference_place: above`, que situa los tokens de la pagina de muestra en la posicion de las lineas anteriores a la primera linea de la pagina dibujada, en lugar de superponerlos sobre la pagina como hace MOSS-Image.

El entrenamiento empleo el corpus de verdad fundamental de escritura manuscrita de archivos suecos de diffu a 2 MP, excluyendo volumenes reservados para evaluacion: 54.700 pares de entrenamiento que cubren registros judiciales, de cancilleria, eclesiasticos, policiales, mineros, militares y de viajes de los siglos XVI a XIX. Cada ventana de lineas se emparejo con la otra ventana de su propia pagina como muestra, de modo que la pluma solo puede proceder de la muestra. La receta siguio el ajuste fino de MOSS-Image con Muon en las matrices de los bloques conjuntos y AdamW en el resto, learning rate de 5e-5 tras warmup con decaimiento lineal hasta 0 en los ultimos 1.709 pasos, gradientes recortados a 1, pesos en float32 bajo autocast bfloat16 y muestras agrupadas por tamano en bloques de 32. Se ejecuto sobre 8 A100 de 64 GB (dos nodos del supercomputador Leonardo, CINECA, con FSDP2), 16 muestras por paso durante 10.257 pasos (164.112 muestras, tres pasadas sobre los datos), en una cadena de trabajos de 30 minutos entre el 13 y el 17 de noviembre de 2026. La perdida media de entrenamiento fue de 0,616 en los pasos 1-1.000, 0,601 en 3.001-4.000, 0,598 en 6.001-7.000 y 0,590 en los ultimos 257.

## Capacidades
- Generacion de imagenes de paginas completas de archivo manuscrito con maquetacion controlada por cajas (prompt de tipo MOSS Layout).
- Renderizado de texto exacto por linea: cada elemento del prompt lleva su texto y su caja, y el modelo produce las etiquetas ALTO y PAGE correspondientes.
- Transferencia de estilo caligrafico desde una pagina de muestra: peso del trazo, inclinacion, regularidad y color de tinta.
- Transferencia de aspecto material: papel, color de tinta y tipo de escaneo (gris o color).
- Generacion de datos sinteticos etiquetados para entrenamiento de sistemas HTR a nivel de pagina.
- Soporte de paginas de hasta 2 megapixeles.
- Capacidad multilingue limitada al sueco; no se documentan otras lenguas.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento.

## Casos de uso
- Aumento de corpus para HTR: generar paginas sinteticas con etiquetas ALTO y PAGE exactas a partir de plantillas reales, ampliando el volumen de entrenamiento de reconocedores de escritura manuscrita sin coste de transcripcion manual.
- Preservacion de la caligrafia de un escribano concreto: usar como muestra una pagina del mismo volumen para que las paginas generadas mantengan la pluma del escribano, util para completar series documentales incompletas.
- Simulacion de variabilidad de escaneo: generar la misma pagina con muestras de distinto tipo de escaneo (gris o color) para robustecer modelos frente a variaciones de digitalizacion.
- Creacion de conjuntos de prueba controlados: producir paginas con maquetacion y texto conocidos para evaluar de forma determinista la precision de un pipeline de HTR.
- Investigacion en humanidades digitales: generar facsimiles sinteticos de registros judiciales, eclesiasticos o mineros para experimentos de analisis documental sin exponer material original restringido.
- Entrenamiento de modelos de deteccion de lineas y regiones: las cajas del prompt y las etiquetas PAGE permiten obtener anotaciones geometricas exactas para tareas de segmentacion de layout.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La evaluacion del autor es cualitativa, por inspeccion visual frente a escaneos reales en paginas reservadas de volumenes no vistos en entrenamiento:

| Comprobacion | Resultado |
|---|---|
| La pagina adopta el aspecto de la muestra (papel, color de tinta, escaneo gris o color) | casi todas |
| La pagina adopta la pluma de la muestra (peso del trazo, inclinacion, regularidad) | aproximadamente 8 de 12 |
| Maquetacion, saltos de linea y papel siguen la pagina | en todos los pasos evaluados |
| Evolucion del entrenamiento | en el paso 1.000 escribe una mano propia; desde el paso 2.000 sigue la pluma de la muestra |

Las comprobaciones se dibujaron a 2 MP, 50 pasos, guidance 3, shift 5, bloque 22 omitido en la pasada incondicional y sin guidance de referencia. La guidance de referencia (una tercera pasada hacia la muestra) recomendada por r6b no se ha medido con este modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; los pesos del DiT en bfloat16 ocupan 10,2 GB, a los que hay que sumar el codificador de texto, el VAE y el scheduler de MOSS-Image-Base.
- GPU de entrenamiento empleadas: 8 A100 de 64 GB en dos nodos (Leonardo, CINECA), con FSDP2.
- No se documenta si cabe en GPU de consumo; por el tamano de los pesos en bfloat16 es previsible que requiera GPUs profesionales o cuantizacion, aunque no se proporcionan datos al respecto.
- Opciones de despliegue: exclusivamente mediante diffu (repositorio Borg93/diffu2), con los comandos `diffu-moss-init` y `diffu-generate`. El pipeline propio de MOSS-Image, la configuracion de r6b y el plugin de SGLang no son compatibles porque colocan la muestra de forma distinta.
- Version minima de diffu: commit `b8e07de` o posterior.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffu-moss-above | 5.082 M (DiT) | no disponible | Difusion texto-a-imagen para paginas de archivo, muestra encima | Apache 2.0 | Hugging Face, via diffu |
| diffu-moss-r6b | no disponible | no disponible | Predecesor: paginas de ~1 MP, muestra superpuesta, sin transferencia de pluma fiable | no disponible | Hugging Face, via diffu |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no disponible | Modelo base texto-a-imagen de proposito general | no disponible | Hugging Face |

## Limitaciones y advertencias
- Modelo altamente especializado: solo genera paginas de archivo manuscrito sueco de los siglos XVI a XIX; no es un generador de imagenes general.
- Dependencia estricta de diffu en el commit `b8e07de` o posterior: usar el pipeline nativo de MOSS-Image, la configuracion de r6b o el plugin de SGLang introduce la muestra en una posicion para la que el modelo no fue entrenado.
- La transferencia de pluma no es perfecta: en la prueba de intercambio, aproximadamente 8 de 12 paginas adoptaron la pluma de la muestra.
- La guidance de referencia no se ha evaluado con este modelo, por lo que su efecto sobre la fidelidad a la muestra es desconocido.
- El repositorio contiene unicamente el DiT; es imprescindible descargar MOSS-Image-Base en la revision indicada para obtener el codificador de texto, tokenizer, VAE y scheduler.
- Idioma limitado al sueco; no se documenta soporte de otras lenguas ni de escritura impresa.
- No se documentan sesgos especificos, riesgos de alucinacion textual ni limites de contexto; el texto de salida queda determinado por el prompt de layout, pero la fidelidad grafemica no se ha medido cuantitativamente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la calidad del material sintetico generado.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, y su validacion externa es inexistente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Gabriel/diffu-moss-above
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Predecesor: https://huggingface.co/Gabriel/diffu-moss-r6b
- Repositorio diffu: https://github.com/Borg93/diffu2
