# Gabriel/diffu-moss-hand-pahlman

## Resumen

diffu-moss-hand-pahlman es un adaptador LoRA para el modelo de difusion de imagenes MOSS-Image-Base, desarrollado por el usuario Gabriel en el contexto del proyecto diffu. Su proposito es generar paginas manuscritas sinteticas que imiten la caligrafia cursiva sueca de los diarios de viaje de Carl Fredrik Påhlman, datados entre 1825 y 1826. El adaptador se emplea como generador de datos sinteticos para entrenar modelos de reconocimiento de escritura manuscrita (HTR) y de lectura de paginas de archivo, con etiquetas ALTO y PAGE exactas.

Tecnicamente es un adaptador PEFT de rango 32 y alpha 32 aplicado sobre 265 capas lineales del transformer de difusion (DiT) de MOSS-Image-Base, incluyendo sus 42 bloques conjuntos, el refinador de texto, dos embedders y la capa final. El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato safetensors en bfloat16. El modelo base es un text-to-image de la familia MOSS-Image, y el adaptador no modifica el VAE ni el codificador de texto, que permanecen congelados.

Su relevancia actual radica en la escasez de datos etiquetados de escritura historica: al permitir generar paginas sinteticas con anotaciones exactas a nivel de linea y caja, reduce la dependencia de transcripciones manuales costosas. El ambito es muy acotado (una unica mano, una unica coleccion, idioma sueco) y esta pensado como componente de un pipeline de aumento de datos, no como modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el DiT de MOSS-Image-Base (modelo de difusion text-to-image) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bfloat16) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer de difusion de MOSS-Image-Base, un DiT con 42 bloques conjuntos. La LoRA cubre las proyecciones q, k, v, o, ffn_up_gate y ffn_down de esos bloques, ademas del refinador de texto, los dos embedders y la capa final, sumando 265 capas lineales. Se configura con rango 32 y alpha 32. El codificador de texto y el VAE del modelo base permanecen congelados durante el entrenamiento. Los nombres de modulo son los propios de MOSS-Image, de modo que el adaptador es compatible con cualquier implementacion que los conserve; la implementacion MossTransformer de diffu los mantiene.

El entrenamiento utilizo 292 ventanas de aproximadamente 1 megapixel recortadas de paginas de verdad fundamental de escritura de archivo sueca, cada una con un prompt de tipo MOSS Layout que nombra la coleccion e incluye el texto exacto y la caja de cada linea. Se empleo KohakuMossTrainer con algoritmo LoRA de LyCORIS, optimizador AdamW a 1e-4 durante 700 pasos y el muestreo de nivel de ruido propio de MOSS-Image. El export de LyCORIS se convirtio al formato PEFT y se verifico capa por capa: todas las claves encajan en capas que PEFT construye con esa configuracion, sin claves faltantes ni sobrantes, y el escalado alpha/r por B@A coincide exactamente con el up@down entrenado.

## Capacidades

- Generacion de imagenes text-to-image de paginas manuscritas en la caligrafia cursiva sueca de los diarios de Påhlman (decada de 1820).
- Reproduccion de la estructura de pagina de archivo: lineas de texto manuscrito con disposicion y cajas coherentes con el prompt de layout.
- Generacion condicionada por caption que nombra la coleccion y los anos, tal como se entreno.
- Produccion de datos sinteticos con etiquetas ALTO y PAGE exactas a traves del pipeline diffu.
- No soporta tool calling ni function calling (es un modelo de difusion de imagenes).
- No soporta razonamiento multi-paso ni modo thinking.
- Capacidad multilingue limitada al sueco en el dominio de la escritura historica; no se documentan otras lenguas.
- No procesa vision ni audio como entrada; es un generador, no un modelo multimodal de comprension.

## Casos de uso

- Aumento de datos para entrenar modelos HTR: el adaptador genera paginas manuscritas sinteticas con transcripcion y cajas exactas, lo que permite ampliar el corpus de entrenamiento de reconocedores de escritura historica sin anotacion manual.
- Creacion de conjuntos de evaluacion controlados: al fijar la caligrafia y el estilo de pagina, se pueden generar variantes con texto conocido para medir la precision de un lector de paginas a nivel de linea.
- Preentrenamiento de modelos de lectura de documentos de archivo: las paginas sinteticas con etiquetas ALTO/PAGE sirven para preentrenar o afinar modelos de layout y transcripcion antes de pasar a datos reales.
- Simulacion de digitalizaciones de archivo para pruebas de pipeline: se generan imagenes de aproximadamente 1 MP que imitan escaneos de una coleccion concreta, utiles para validar etapas de preprocesado, segmentacion y OCR.
- Investigacion en caligrafia historica sueca: permite estudiar la variabilidad de la cursiva de los anos 1820 en un entorno sintetico y reproducible, aislando el estilo de la coleccion.
- Prototipado de herramientas de humanidades digitales: desarrolladores pueden construir demos de transcripcion asistida sobre paginas generadas antes de disponer de permisos sobre los originales.
- Generacion de material didactico o de divulgacion que reproduzca el aspecto de un diario de viaje de la epoca, siempre que se verifique el texto dibujado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image-Base completo, ya que el adaptador solo anade 0,2 GB de pesos en bfloat16 y se fusiona en el DiT.
- GPU recomendadas: no disponible en la informacion; el modelo base es un text-to-image de aproximadamente 1 MP por muestra, lo que en la practica exige GPU con memoria suficiente para el DiT completo (categoria profesional tipo A100/H100 o consumer de gama alta), aunque no se confirma cifra concreta.
- Compatibilidad con GPU consumer: no confirmada; el adaptador en si es ligero, pero la inferencia requiere cargar el modelo base completo.
- Opciones de despliegue: PEFT (carga y fusion con merge_and_unload), la herramienta diffu-moss-init del proyecto diffu y cualquier implementacion que conserve los nombres de modulo de MOSS-Image. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagenes en este formato).
- Latencia y throughput: no disponibles. La configuracion de muestreo recomendada es de 50 pasos, guidance 3, shift 5 y salto del bloque 22 en la pasada incondicional, a aproximadamente 1 MP.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffu-moss-hand-pahlman | LoRA sobre DiT text-to-image | no disponible (adaptador) | no disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| MOSS-Image-Base (OpenMOSS-Team) | DiT text-to-image base | no disponible | no disponible | Apache-2.0 (segun el adaptador) | Hugging Face |
| Alternativas de generacion de manuscritos sinteticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros adaptadores o modelos comparables de generacion de escritura manuscrita historica con etiquetas ALTO/PAGE.

## Limitaciones y advertencias

- Ambito muy restringido: una unica mano de una unica coleccion; otras caligrafias y tipos de pagina no han sido probados.
- El texto dibujado debe verificarse: diffu relee cada linea generada y marca como dudosa (unclear) aquella que no puede confirmar en las etiquetas; no debe asumirse que el texto sintetico es correcto sin comprobacion.
- Idioma limitado al sueco y al dominio de escritura historica de la decada de 1820.
- No es un modelo de uso general: no sirve para generacion de imagenes arbitrarias ni para tareas de texto, codigo o razonamiento.
- Riesgo de artefactos propios de la difusion y de desviaciones respecto al estilo real de la coleccion, especialmente fuera de la configuracion de muestreo recomendada.
- Licencia Apache-2.0 heredada de MOSS-Image-Base, lo que permite uso comercial, pero el autor no ofrece garantias sobre la fidelidad historica ni sobre la calidad del texto generado.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.
- Dependencia de la revision concreta del modelo base (85975793d8b3d432f1b6e27f352abaa4c2a4c0d3); cambios en el base pueden romper la compatibilidad de los nombres de modulo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Gabriel/diffu-moss-hand-pahlman
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Proyecto diffu: https://github.com/Borg93/diffu2
