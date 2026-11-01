# abbuibuibui/YusaNishimori-Lora

## Resumen

YusaNishimori-Lora es un adaptador LoRA de personaje para modelos de difusion SDXL, concretamente entrenado sobre el checkpoint waiIllustriousSDXL v17 (habitualmente guardado como `waiIllustriousSDXL_v170`). Lo desarrolla el usuario abbuibuibui y reproduce a Yusa Nishimori, personaje de la serie de animacion *Charlotte*. No es un modelo de lenguaje ni un modelo fundacional: es un ajuste fino ligero (LoRA) que se aplica sobre un modelo base SDXL para condicionar la generacion de imagenes hacia la identidad visual del personaje.

El repositorio incluye los siete pesos formales de entrenamiento (E1 a E7). Segun la evaluacion comparativa del autor, el epoch E6 es el recomendado por defecto, con una fuerza de LoRA de 0.8. El adaptador se entrena con rango 32 y alpha 16 sobre UNet y text encoders, y esta pensado para usarse con la familia Illustrious / NoobAI de SDXL.

Su relevancia es acotada: se trata de un recurso de nicho para generacion de imagenes anime con un personaje concreto, no de una herramienta de proposito general. El repositorio ocupa 1.6 GB y acumula 41 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (UNet + text encoders), modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL no se detalla en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion para imagenes) |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante entrenamiento; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 16 aplicado tanto a la UNet como a los text encoders del modelo base SDXL. El entrenamiento se realizo en precision bf16, con batch 1, latents cacheadas y atencion sdpa, usando AdamW8bit y buckets de 1024. Se desactivaron el flip y el color augmentation.

El dataset consta de 90 imagenes curadas con sus correspondientes ficheros `.txt` de caption. Los captions comienzan con `yusa_nishimori, <outfit>` y se usaron con `keep_tokens = 2`. La distribucion por indumentaria es: 32 de uniforme de invierno, 30 de uniforme de verano, 15 de idol, 8 de camiseta rosa y 5 de ropa deportiva. El entrenamiento completo fue de 90 imagenes x repeat 2 x 7 epochs, aproximadamente 1260 pasos de optimizacion, con reanudacion y conservacion de los epochs formales E1 a E7. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un adaptador de difusion.

## Capacidades

- Generacion de imagenes de un personaje concreto (Yusa Nishimori) sobre modelos SDXL de la familia Illustrious / NoobAI.
- Control de identidad mediante el token de activacion `yusa_nishimori`, que reproduce rasgos como pelo rubio, pelo largo, coleta lateral y ojos azules.
- Control de indumentaria mediante tokens especificos: `yusa_nishimori_winter_school_uniform`, `yusa_nishimori_summer_school_uniform`, `yusa_nishimori_idol_outfit`, `yusa_nishimori_pink_tank_top` y `yusa_nishimori_sportswear`.
- Composicion de escenas variadas: retrato frontal, tres cuartos, perfil, cuerpo completo, escenas nocturnas complejas y fondos simples.
- Ajuste de fuerza del adaptador entre 0.4 y 1.0, con 0.8 como valor recomendado y 0.6 suficiente para identificar al personaje.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un LLM.
- Capacidades multilingues limitadas al ambito de los prompts (en, zh); no es un modelo de lenguaje.

## Casos de uso

- Ilustracion de fan art: generar imagenes del personaje en distintos encuadres y escenas usando el token de identidad y los tokens de indumentaria, con el adaptador a fuerza 0.8 sobre waiIllustriousSDXL v17.
- Creacion de variaciones de vestuario: combinar los cinco tokens de outfit documentados para producir al personaje con uniforme de invierno, verano, idol, camiseta rosa o ropa deportiva en un mismo flujo de trabajo.
- Generacion de escenas nocturnas y fondos complejos: el autor documenta pruebas especificas en escenas nocturnas donde E6 mantiene la consistencia de cara y vestuario, lo que permite ilustraciones ambientadas.
- Prototipado de personajes para proyectos derivados: usar el adaptador como referencia visual de identidad antes de encargar ilustraciones definitivas o modelado 3D.
- Pruebas de comparacion de epochs: el repositorio conserva E1 a E7 y material de evaluacion horizontal, util para estudiar como evoluciona la fidelidad de un LoRA a lo largo del entrenamiento.
- Flujos de generacion por lotes con ComfyUI o Automatic1111: el adaptador en safetensors se carga como LoRA estandar y permite automatizar series de imagenes con prompts fijos y variaciones de escena.
- Experimentacion con fuerza del adaptador: barrer valores entre 0.4 y 1.0 para estudiar el equilibrio entre fidelidad de identidad y sobreajuste, segun la matriz de 10 escenas x 4 fuerzas documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. El autor aporta una evaluacion cualitativa comparativa entre epochs, resumida a continuacion:

| Candidato | Resultado observado | Decision |
|---|---|---|
| E5 | Identidad usable; fidelidad de accesorios y uniforme algo inferior a E6 | Alternativo |
| E6 | Mayor consistencia de cara, vestuario y escenas nocturnas a 0.6-0.8 | Recomendado por defecto a 0.8 |
| E7 | Cercano a E6; sin mejora estable a 1.0 | Alternativo archivado |

La evaluacion se realizo con 10 escenas x 4 fuerzas (0.4, 0.6, 0.8, 1.0) = 120 salidas directas para los candidatos E5, E6 y E7, y un cribado previo de los siete epochs a 0.8. No se proporcionan metricas numericas como FID, CLIP score ni similitud facial.

## Requisitos de hardware

- El adaptador pesa 1.6 GB en el repositorio, pero la inferencia requiere cargar el modelo base SDXL completo (waiIllustriousSDXL v17), que no se detalla en la informacion.
- VRAM estimada: no disponible de forma explicita; depende del checkpoint SDXL base y de la precision de carga (bf16 o fp16). No se documentan cifras concretas.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; depende de los requisitos del modelo base SDXL, no del adaptador.
- Opciones de despliegue: el adaptador esta en formato safetensors y la libreria declarada es diffusers; es compatible con flujos de LoRA estandar (diffusers, Automatic1111, ComfyUI) segun el formato, aunque la informacion no detalla integraciones probadas.
- Latencia y throughput: no disponibles.
- Parametros de generacion documentados: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216, Hires y ADetailer desactivados.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRA de personaje comparables en la documentacion proporcionada. La comparacion interna entre epochs del propio adaptador se recoge en la seccion de benchmarks. Para alternativas externas: no disponible.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje y de la obra original pertenecen a sus titulares. No es un producto oficial.
- Licencia creativeml-openrail-m: conviene revisar sus condiciones antes de cualquier uso comercial, especialmente por la naturaleza de fan art del contenido.
- Riesgo de sobreajuste a fuerza 1.0: el autor advierte que puede "sobrecocinar" la imagen; recomienda 0.8 y senala que 0.6 ya identifica al personaje.
- Dependencia estricta del modelo base: esta entrenado sobre waiIllustriousSDXL v17 y pensado para la familia Illustrious / NoobAI; su comportamiento con otros checkpoints SDXL no esta documentado.
- Cobertura de datos limitada: 90 imagenes, con solo 5 de ropa deportiva y 8 de camiseta rosa, lo que puede reducir la fidelidad en esas indumentarias frente a las mejor representadas (32 de invierno, 30 de verano).
- El personaje tiene rasgos muy concretos (pelo rubio, coleta lateral, ojos azules); el prompt negativo del autor excluye explicitamente otros colores de pelo y ojos para evitar filtraciones, lo que indica sensibilidad a la contaminacion de identidad.
- No es un modelo de lenguaje: no admite casos de uso de texto, razonamiento, codigo ni agentes.
- Idiomas de prompt documentados: en y zh; no se garantiza un comportamiento equivalente en castellano.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad, algo habitual en adaptadores de difusion de este tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/YusaNishimori-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/YusaNishimori-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/YusaNishimori-Lora
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
