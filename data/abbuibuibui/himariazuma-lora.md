# abbuibuibui/HimariAzuma-Lora

## Resumen

HimariAzuma-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado especificamente sobre el checkpoint waiIllustriousSDXL v17, que representa a Himari Azuma (东日万凛), personaje de la serie *Mato Seihei no Slave*. Lo desarrolla el usuario abbuibuibui y se distribuye como un derivado no oficial de fans, sin vinculacion con los titulares de los derechos. El repositorio es en realidad una coleccion de tres linajes de LoRA: los pesos WAI/Illustrious en la raiz, una variante para AutismMix Pony bajo `autism_pony/` y una variante para MOSS-Image bajo `moss/`.

El modelo resuelve un problema acotado: la generacion fiable y consistente de un personaje concreto en pipelines de texto-a-imagen basados en SDXL, con control sobre identidad (color de pelo, ojos, cinta) y sobre el vestuario (uniforme de combate, blusa blanca, jersey navy). No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango (rank 64, alpha 32) que se aplica sobre un checkpoint base concreto y que no debe mezclarse con otras familias de SDXL.

Es relevante ahora por dos motivos. Primero, porque documenta de forma inusualmente detallada su proceso de evaluacion (siete epocas, barrido de fuerzas 0.4/0.6/0.8/1.0 sobre diez escenas) y recomienda explicitamente la epoca E6 a fuerza 0.8, algo poco habitual en LoRAs de personaje. Segundo, porque ejemplifica el ecosistema de adaptadores de personaje para SDXL/Illustrious, donde la trazabilidad del dataset, la version del checkpoint base y el hash de los pesos son criticos para la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; rank 64, alpha 32 |
| Parametros totales | no disponible (cada fichero pesa 456.493.996 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible; pesos en safetensors sin cuantizar |
| Idiomas soportados | en, zh (prompts en ingles y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (libreria diffusers) |
| Modelo base | waiIllustriousSDXL v17 (raiz); AutismMix Pony (`autism_pony/`); MOSS-Image (`moss/`) |
| Tamano del repositorio | 7.9 GB |
| Epocas publicadas | E1-E7 (raiz y `autism_pony/`); E6 recomendada |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre un UNet SDXL. Se entreno con AdamW en bf16, con buckets de hasta 1536 px y 7 epocas sobre el checkpoint waiIllustriousSDXL v17. El dataset consta de 87 pares de imagenes y captions, organizados en tres categorias de vestuario (Combat_Uniform, White_Blouse, Navy_Sweater), con 2 repeticiones por par. Los captions usaron `keep_tokens = 2`, y el autor advierte que los colores de pelo y ojos se omitieron con frecuencia en las captions, por lo que conviene anadirlos explicitamente en el prompt. El entrenamiento se realizo en hardware NVIDIA DGX Spark con ComfyUI.

La innovacion practica no esta en la arquitectura, sino en la metodologia de seleccion de checkpoint. El autor realizo una evaluacion en dos rondas: una primera criba de E1-E7 a fuerza 0.8 y una matriz posterior de E5/E6/E7 por 10 escenas y 4 fuerzas (0.4, 0.6, 0.8, 1.0). El resultado es una recomendacion concreta (E6 a 0.8) respaldada por imagenes comparativas publicadas en el repositorio. Ademas, el repositorio incluye dos linajes adicionales entrenados sobre otros checkpoints base, con la advertencia explicita de no mezclar pesos, prompts ni negativos entre familias.

## Capacidades

- Generacion de imagenes de un personaje concreto (Himari Azuma) en pipelines SDXL, con identidad consistente: pelo largo verde-azulado oscuro, ojos ambar-dorados y cinta de pelo verde-azulada.
- Control de vestuario mediante tokens especificos: `kyouka_uzen_combat_uniform` (uniforme de combate con charreteras doradas, ribete rojo, falda corta y botas a media pantorrilla) y `kyouka_uzen_white_blouse` (variante de blusa blanca; el autor advierte que a veces se interpreta como vestido de verano).
- Trigger de identidad `kyouka_uzen` (nota: el token no coincide con el nombre del personaje, es una eleccion del autor).
- Soporte de multiples angulos y planos: retrato frontal, tres cuartos, perfil, cuerpo completo y poses sentadas, segun la evaluacion publicada.
- Compatibilidad con escenarios simples y complejos (fondo neutro, calle nocturna).
- Tres linajes independientes: WAI/Illustrious (raiz), AutismMix Pony (`autism_pony/`) y MOSS-Image (`moss/`), cada uno con su propio checkpoint base.
- Prompts en ingles y chino.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un adaptador de imagen.

## Casos de uso

- Ilustracion de fan art de personaje: el LoRA permite generar ilustraciones consistentes de Himari Azuma en distintas poses y angulos, lo que resulta adecuado para artistas que necesitan mantener la identidad del personaje a lo largo de una serie de imagenes.
- Creacion de fichas de personaje para proyectos derivados: con E6 a 0.8 se obtienen retratos frontales y de tres cuartos estables, utiles para hojas de referencia o character sheets.
- Variaciones de vestuario en un mismo personaje: los tokens `kyouka_uzen_combat_uniform` y `kyouka_uzen_white_blouse` permiten alternar entre uniforme de combate y ropa casual sin perder la identidad, lo que sirve para narrativa visual o comics amateur.
- Prototipado rapido en ComfyUI: al ser un LoRA ligero (456 MB por fichero) sobre SDXL, se integra en flujos de trabajo existentes de ComfyUI con Euler a, 28 pasos, CFG 4.5 y CLIP skip 2, sin necesidad de reentrenar el checkpoint base.
- Pruebas de consistencia de personaje en pipelines de investigacion: la evaluacion publicada (matriz de epocas por fuerzas y escenas) sirve como referencia metodologica para estudiar como afecta la fuerza del LoRA a la fidelidad de identidad frente a la flexibilidad compositiva.
- Generacion de material para comunidades de fans: el modelo esta pensado como derivado no oficial, por lo que su uso natural es la produccion de contenido fan no comercial dentro de los terminos de la licencia CreativeML OpenRAIL-M.
- Comparacion de linajes sobre distintos checkpoints base: disponer de las variantes WAI, Pony y MOSS permite estudiar como un mismo dataset de personaje se comporta sobre arquitecturas de SDXL con estilos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud de identidad) en la informacion disponible. El autor publica una evaluacion cualitativa con imagenes comparativas:

| Evaluacion | Candidatos | Escenas | Fuerzas | Resultado |
|---|---|---|---|---|
| Ronda 1 | E1-E7 | Retrato frontal, cuerpo completo principal, cuerpo completo alternativo | 0.8 | Criba inicial |
| Ronda 3 | E5, E6, E7 | 10 escenas (rostro, tres cuartos, perfil, cuerpo completo principal y alternativo, sentado, fondo simple, fondo nocturno, sin outfit, sin trigger) | 0.4, 0.6, 0.8, 1.0 | E6 recomendada a 0.8 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un LoRA sobre SDXL, los requisitos son los del checkpoint base (tipicamente 8-12 GB en fp16 para SDXL a resoluciones de 832x1216, y menos con cuantizacion del UNet).
- GPU recomendadas: el autor entreno en NVIDIA DGX Spark; para inferencia se asume cualquier GPU capaz de ejecutar SDXL (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM ejecutando SDXL, aunque el dato exacto no esta publicado.
- Opciones de despliegue: ComfyUI (referencia del autor), diffusers (libreria declarada), y en general cualquier runtime compatible con SDXL y LoRA (A1111, Forge, etc.); no se mencionan vLLM, llama.cpp ni Ollama por no ser aplicables a difusion.
- Latencia y throughput: no disponible.
- Almacenamiento: cada fichero de pesos ocupa 456.493.996 bytes; el repositorio completo ocupa 7.9 GB por incluir los tres linajes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros LoRAs de personaje en la informacion proporcionada. La comparacion posible es entre los propios linajes del repositorio:

| Linaje | Checkpoint base | Ubicacion | Fuerza recomendada | Notas |
|---|---|---|---|---|
| WAI/Illustrious | waiIllustriousSDXL v17 | raiz | E6 a 0.8 | Linaje principal y mas documentado |
| AutismMix Pony | AutismMix Pony (generacion con Confetti) | `autism_pony/` | E6 a 1.0 | No mezclar con prompts WAI |
| MOSS-Image | MOSS-Image | `moss/` | no disponible | Tercer linaje, sin detalle en la informacion |

## Limitaciones y advertencias

- Es un derivado no oficial de fans: los derechos del personaje pertenecen a sus titulares originales; el autor lo declara explicitamente.
- Licencia CreativeML OpenRAIL-M: permite uso comercial bajo las restricciones de uso de la licencia, pero al ser contenido derivado de una obra con copyright, el uso comercial del personaje puede ser problematico y requiere revision legal.
- Riesgo de mezcla de linajes: usar pesos WAI con el checkpoint Pony (o viceversa) produce resultados incorrectos; el autor insiste en no mezclar pesos, prompts ni negativos entre familias.
- El token de identidad es `kyouka_uzen`, que no coincide con el nombre del personaje (Himari Azuma); es facil equivocarse y usar el nombre esperado.
- Los colores de pelo y ojos se omitieron a menudo en las captions, por lo que hay que anadirlos manualmente en el prompt para asegurar la identidad.
- El token de blusa blanca puede interpretarse como vestido de verano; para una silueta de camisa hay que escribir `white blouse` explicitamente.
- No hay datos de sesgos, tasas de alucinacion (no aplica a difusion) ni evaluaciones cuantitativas de fidelidad de identidad.
- El repositorio mezcla tres linajes en un solo espacio de 7.9 GB, lo que puede confundir a quien descargue sin leer la model card.
- No hay informacion sobre rendimiento en idiomas distintos de en y zh, ni sobre calidad en prompts muy largos o composiciones complejas mas alla de las escenas evaluadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/HimariAzuma-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/HimariAzuma-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/KyoukaUzen-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/HimariAzuma-Dataset
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
