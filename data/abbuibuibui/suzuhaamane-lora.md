# abbuibuibui/SuzuhaAmane-Lora

## Resumen

SuzuhaAmane-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado especificamente sobre el checkpoint waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y reproduce a Suzuha Amane (阿万音铃羽), personaje de la franquicia *Steins;Gate*. No es un modelo de lenguaje, sino un adaptador de bajo rango que se aplica sobre un modelo base de generacion de imagenes para condicionar la identidad visual del personaje, sus atuendos y su silueta.

El adaptador se distribuye en siete checkpoints de epoca (E1-E7) en formato safetensors, cada uno de 456.494.820 bytes, con un tamano total de repositorio de 3,2 GB. El autor recomienda E6 con una fuerza de 0,8 tras una evaluacion comparativa propia en dos rondas. El entrenamiento empleo un dataset de 102 pares imagen-texto con cuatro atuendos, rango 64 y alpha 32, optimizador AdamW en bf16 y 7 epocas con buckets de hasta 1536.

Su relevancia es acotada: es un artefacto de nicho para la comunidad de generacion de imagenes anime, no una contribucion de investigacion. Resulta util para quien necesite consistencia de personaje en pipelines de difusion basados en Illustrious/SDXL, y su model card documenta de forma inusualmente detallada el proceso de seleccion de epoca y fuerza, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious; red de difusion latente |
| Parametros totales | no disponible (rango 64 / alpha 32; cada checkpoint ocupa 456.494.820 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolucion de entrenamiento con buckets hasta 1536) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el base admite cuantizaciones propias de SDXL) |
| Idiomas soportados | en, zh (idiomas de la model card y de los prompts documentados) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (7 checkpoints: E1-E7) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre waiIllustriousSDXL v17, un checkpoint SDXL orientado a ilustracion anime. El entrenamiento uso AdamW en bf16, buckets con limite de 1536 y 7 epocas sobre un dataset de 102 pares imagen-texto que cubre cuatro atuendos del personaje, con repeticiones 3. Las captions se generaron con `keep_tokens = 2`, lo que explica que el color de pelo y de ojos a menudo se omita en el texto y deba anadirse manualmente en la inferencia.

La innovacion practica no esta en la arquitectura sino en la metodologia de seleccion: el autor realizo una ronda 1 comparando E1-E7 a fuerza 0,8 y una ronda 3 con matriz E5/E6/E7 por diez escenas y cuatro fuerzas (0,4 / 0,6 / 0,8 / 1,0). De ahi se concluye que E6 a 0,8 ofrece la silueta mas estable del personaje (pelo largo castano, ojos azules, chaqueta negra con top azul). Se documentan tokens de disparo para identidad (`suzuha_amane`), atuendo principal (`suzuha_amane_black_jacket_blue_top`), atuendo alternativo (`suzuha_amane_blue_tracksuit`) y otros dos entrenados (`suzuha_amane_future_soldier_uniform`, `suzuha_amane_green_shirt_blue_vest`).

## Capacidades

- Generacion de imagenes de personaje condicionada por identidad: reproduce el rostro, el pelo largo castano y los ojos azules de Suzuha Amane.
- Control de atuendo mediante tokens especificos: chaqueta negra con top azul, chandal azul, uniforme de soldado del futuro y camisa verde con chaleco azul.
- Consistencia de personaje entre escenas y encuadres: retrato frontal, tres cuartos, perfil, cuerpo completo, plano sentado.
- Funcionamiento en fondos simples y complejos, incluida iluminacion nocturna.
- Compatibilidad con prompts de calidad habituales en el ecosistema Illustrious (`masterpiece`, `best quality`, `very aesthetic`, `absurdres`, `anime screencap`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un adaptador de difusion.
- Capacidades multilingues limitadas a los idiomas de los prompts (en, zh); no hay evaluacion de otros idiomas.

## Casos de uso

- Ilustracion de fan art con consistencia de personaje: aplicar el LoRA a 0,8 sobre waiIllustriousSDXL v17 permite generar varias imagenes del mismo personaje manteniendo rasgos faciales y paleta, util para series de ilustraciones o portadas.
- Creacion de assets para ficcion derivada: generar escenas de Suzuha en distintos atuendos (chandal, uniforme de soldado del futuro) para proyectos de doujin, visual novels amateur o contenido para comunidades de *Steins;Gate*.
- Prototipado de personajes en pipelines ComfyUI: el autor documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) que sirven como configuracion de partida reproducible en produccion de imagen.
- Generacion de variaciones de encuadre para composicion: la evaluacion cubre retrato, tres cuartos, perfil y plano sentado, lo que permite construir hojas de personaje o referencias para artistas.
- Integracion en flujos de trabajo con ControlNet u otros adaptadores SDXL: al ser un LoRA estandar en safetensors, se puede combinar con adaptadores de pose o estilo en herramientas compatibles con diffusers.
- Experimentacion metodologica: la documentacion de seleccion de epoca y fuerza (matriz E5/E6/E7 x 0,4-1,0) sirve como caso de estudio para quien entrene LoRAs de personaje y quiera replicar un protocolo de evaluacion comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. La unica evaluacion es cualitativa y visual, organizada en dos rondas:

| Ronda | Candidatos | Condiciones | Conclusion documentada |
|---|---|---|---|
| Ronda 1 | E1-E7 | Fuerza 0,8 | E6 seleccionado como candidato principal |
| Ronda 3 | E5, E6, E7 | 10 escenas x 4 fuerzas (0,4 / 0,6 / 0,8 / 1,0) | E6 a 0,8 recomendado; E5 y E7 como alternativas |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia del ecosistema SDXL, la inferencia del modelo base completo suele requerir entre 8 y 12 GB en fp16; el LoRA anade una sobrecarga pequena (rango 64).
- GPU recomendadas: no especificadas por el autor. Cualquier GPU capaz de ejecutar SDXL (RTX 3060 12 GB en adelante, RTX 4090, A100, H100) puede cargar el adaptador.
- Cabe en GPU de consumo: si, siempre que el modelo base SDXL quepa; el LoRA por si solo ocupa unos 456 MB por checkpoint.
- Opciones de despliegue: ComfyUI (configuracion documentada por el autor), y por compatibilidad de formato safetensors, cualquier runtime que cargue LoRA SDXL via diffusers (Automatic1111, Forge, InvokeAI). No hay soporte GGUF ni llama.cpp por tratarse de un modelo de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRA de personaje comparables en la informacion proporcionada. Se indica "no disponible" para benchmarks y para alternativas concretas. Como referencia estructural, cualquier LoRA de personaje SDXL de la comunidad comparte el mismo formato y requisitos, pero no se han facilitado cifras para comparar.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos de Suzuha Amane y *Steins;Gate* pertenecen a sus titulares; el autor lo declara explicitamente como fan-made.
- Licencia creativeml-openrail-m: permite uso comercial con condiciones, pero conviene revisar las clausulas de atribucion y las restricciones sobre contenido generado antes de usarlo en produccion.
- Dependencia estricta del modelo base: esta entrenado sobre waiIllustriousSDXL v17; usarlo con otros checkpoints SDXL puede degradar la fidelidad del personaje.
- Las captions omiten con frecuencia color de pelo y ojos, por lo que es necesario anadir `long hair, brown hair, blue eyes` en el prompt para evitar derivas.
- Riesgo de sobreajuste o artefactos a fuerzas altas (1,0); el autor recomienda 0,8 y documenta E5/E7 como alternativas si E6 no encaja.
- No hay evaluacion cuantitativa ni validacion por terceros; las conclusiones de calidad son del propio autor.
- Sin garantias de soporte, mantenimiento ni actualizaciones; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- No apto para tareas de texto, razonamiento o codigo: es exclusivamente un adaptador de generacion de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/SuzuhaAmane-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/SuzuhaAmane-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/SuzuhaAmane-Dataset
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
