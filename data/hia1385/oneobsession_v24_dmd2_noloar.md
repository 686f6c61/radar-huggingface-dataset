# hia1385/oneObsession_v24_dmd2_NoLoar

## Resumen

One Obsession v24 (DMD2 Accelerated) es un modelo de difusion texto-a-imagen derivado del checkpoint **One Obsession v24** (base declarada: Illustrious), publicado por el usuario hia1385 en HuggingFace. Se distribuye ya convertido y optimizado para ejecucion en la **NPU de Qualcomm** mediante el formato QNN, y lleva fusionada una LoRA de aceleracion **DMD2 SDXL 4-Step** (fp16, peso 1.0), lo que reduce el numero de pasos de muestreo necesarios a un rango de 8-12 pasos con CFG 1.0. El objetivo del repositorio es permitir generacion de imagenes local y sin conexion en moviles Android, concretamente en la aplicacion **Local Dream** en modo NPU.

El problema que resuelve es la falta de checkpoints de difusion listos para la NPU de los SoC Snapdragon, ya que la mayoria de modelos de la comunidad estan pensados para GPU (CUDA) o para CPU via GGUF. Al empaquetar el checkpoint con la aceleracion por destilacion y el formato QNN, el autor elimina el paso de conversion manual que un desarrollador tendria que hacer con herramientas como NPU Forge.

Se trata de un modelo de nicho, orientado a ilustracion de estilo anime/2.5D, con contenido para adultos (etiquetas nsfw y not-for-all-audiences) y una licencia personalizada (Illustrious License) que restringe el uso comercial. El repositorio ocupa 3,9 GB y, en el momento de la consulta, no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion texto-a-imagen (UNet + text encoders) derivada del modelo base Illustrious; no se detallan variantes en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; limite de prompt de 220 tokens impuesto por la aplicacion Local Dream |
| Tipos de cuantizacion | no disponible en detalle; el artefacto distribuido esta optimizado en formato QNN para NPU. La LoRA DMD2 fusionada es fp16 a escala 1.0 |
| Idiomas soportados | no disponible a nivel de modelo; los ejemplos de prompt de la model card usan etiquetas en ingles (estilo Danbooru) |
| Licencia | illustrious-license (campo `license: other`), enlazada a https://civitai.com/models/1318945 |
| Formato de pesos | QNN (Qualcomm AI Engine Direct) para NPU; peso del repositorio: 3,9 GB |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusion texto-a-imagen construido sobre **One Obsession v24**, cuyo modelo base declarado es Illustrious. Sobre ese checkpoint se ha fusionado una LoRA de destilacion **DMD2 SDXL 4-Step** en fp16, tecnica de *distribution matching distillation* que permite reducir drasticamente el numero de pasos de muestreo (de decenas a 8-12) manteniendo una calidad aceptable. La model card advierte que con 4 pasos el resultado es usable pero "borroso" y que el equilibrio optimo esta entre 8 y 12 pasos.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por preferencias (RLHF/DPO). Tampoco se documenta el proceso de conversion a QNN mas alla de la mencion a la herramienta **NPU Forge**. La innovacion tecnica destacable es precisamente el empaquetado combinado de destilacion + cuantizacion/compilacion para NPU, que habilita inferencia local en dispositivo movil sin dependencia de la nube, junto con la fijacion de CFG a 1.0 y el uso del scheduler LCM como configuracion recomendada.

## Capacidades

- Generacion de imagenes texto-a-imagen en estilos anime, 2.5D semirrealista, semirrealista y 2D de color plano, segun las plantillas de prompt incluidas por el autor.
- Resoluciones recomendadas por el autor: 1024x1536, 832x1216, 896x1152, 768x1344 y 640x1536.
- Control de iluminacion y contraste mediante etiquetas como `chiaroscuro`, `high contrast` o `sunbeam`, con pesos ajustables.
- Generacion acelerada por destilacion: 8-12 pasos con CFG 1.0 y scheduler LCM.
- Inferencia local en dispositivo (modo NPU) mediante la aplicacion Local Dream, sin conexion a Internet.
- Generacion de contenido para adultos (NSFW), declarada explicitamente por el autor.
- No se documenta soporte de tool calling, agentes, vision de entrada, audio ni modo de razonamiento, ya que no son capacidades aplicables a un modelo de difusion.
- No se documenta soporte multilingue de prompts; los ejemplos usan etiquetas en ingles.

## Casos de uso

- **Generacion de ilustracion anime en movil sin conexion**: al estar compilado para NPU de Snapdragon y disenado para Local Dream, permite crear imagenes en un telefono sin enviar prompts a servidores externos, lo que resulta relevante para usuarios con requisitos de privacidad.
- **Prototipado rapido de personajes para proyectos indie**: la model card indica que el modelo es "amigable para principiantes" y que genera buenas imagenes sin necesidad de LoRAs adicionales ni estilos de pintor, lo que reduce el tiempo de iteracion en fases de concepto.
- **Pruebas de pipelines QNN/NPU en Android**: sirve como artefacto de referencia para validar la integracion de modelos de difusion en el stack Qualcomm AI Engine Direct, comparando latencia y calidad frente a ejecuciones en CPU o GPU.
- **Generacion de assets de estilo 2D con color plano**: usando la plantilla `(flat color:1.8)` junto con `anime screenshot` y `anime coloring`, se pueden producir elementos graficos coherentes para prototipos de videojuego o interfaces.
- **Exploracion de composicion con iluminacion dramatica**: las plantillas de claroscuro y alto contraste permiten generar referencias de iluminacion para ilustradores antes de abordar el trabajo manual.
- **Aplicaciones Android de terceros que integren Local Dream**: cualquier desarrollador que construya sobre esa app puede empaquetar este checkpoint y ofrecer generacion local a usuarios con Snapdragon 8 Gen 3 o superior.
- **Investigacion sobre destilacion para dispositivos de borde**: el modelo permite medir el coste en calidad de aplicar DMD2 a distintas tasas de pasos (4 frente a 8-12) en hardware NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Plataforma objetivo**: SoC Qualcomm Snapdragon 8 Gen 3 o superior, en modo NPU, a traves de la aplicacion Local Dream.
- **VRAM estimada**: no disponible. Al ejecutarse sobre NPU movil, la metrica relevante es el consumo de memoria del acelerador, no la VRAM de una GPU de escritorio.
- **GPU de escritorio**: no se documenta soporte directo. El artefacto publicado esta en formato QNN, por lo que no es ejecutable en CUDA sin reconversion del checkpoint original.
- **GPU consumer**: no aplica al artefacto QNN. El checkpoint original (One Obsession v24 sobre Illustrious) y la LoRA DMD2 SDXL si son utilizables en pipelines SDXL convencionales, pero esa ruta no se detalla en este repositorio.
- **Opciones de despliegue**: Local Dream en modo NPU. Alternativas como vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que son motores de modelos de lenguaje, no de difusion.
- **Latencia y throughput**: no disponibles.
- **Tamano del repositorio**: 3,9 GB.
- **Parametros de ejecucion obligatorios**: 8-12 pasos (10 recomendado), CFG 1.0, scheduler LCM, prompt limitado a 220 tokens.

## Comparativa con modelos similares

| Modelo | Tipo / base | Limite de prompt | Formato y plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hia1385/oneObsession_v24_dmd2_NoLoar | Derivado de One Obsession v24 (base Illustrious) + LoRA DMD2 | 220 tokens en Local Dream | QNN para NPU Snapdragon 8 Gen 3+ | illustrious-license | HuggingFace, 0 descargas |
| alwyabdl/One_Obsession_v24 | Mismo checkpoint base, sin optimizacion NPU declarada | no disponible | Pesos para Diffusers | no disponible | HuggingFace |
| Obsession (Illustrious-XL) v-pred_v2.0 | Checkpoint sobre NoobAI-XL (NAI-XL) | no disponible | Civitai, uso con Rescale CFG hasta 0.7 en NSFW | Licencia de Civitai | Civitai |
| One obsession_Anima v4.0 | Checkpoint de la familia Anima | no disponible | Civitai | Licencia de Civitai | Civitai |

Los datos de parametros totales y contexto no estan disponibles para ninguna de las alternativas en la informacion consultada, por lo que la comparacion se limita a base, formato, licencia y plataforma.

## Limitaciones y advertencias

- **Contenido para adultos**: el modelo esta etiquetado como `nsfw` y `not-for-all-audiences`; puede generar contenido inapropiado para entornos laborales o para menores.
- **Restricciones de licencia**: la licencia Illustrious License es personalizada y esta vinculada a una pagina de Civitai; debe revisarse antes de cualquier uso comercial. No se garantiza permiso de explotacion comercial.
- **Degradacion con pocos pasos**: segun el propio autor, con 4 pasos la imagen resulta borrosa; el rango util es 8-12 pasos.
- **CFG no negociable**: el CFG debe mantenerse en torno a 1.0; valores superiores degradan el resultado por la naturaleza destilada del modelo.
- **Limite de prompt severo**: 220 tokens en Local Dream; los prompts mas largos se truncan sin aviso, lo que puede eliminar descripciones clave.
- **Sesgos**: no hay informacion publicada sobre sesgos. Al derivar de un dataset de estilo Danbooru/ilustracion, es razonable esperar sesgos de representacion propios de ese corpus, aunque no se documentan.
- **Alucinacion visual**: como todo modelo de difusion, puede producir anatomia incorrecta, dedos deformados o texto ilegible; las plantillas de prompt negativo del autor estan orientadas precisamente a mitigarlo.
- **Compatibilidad limitada**: el artefacto QNN no es portable a GPU NVIDIA/AMD ni a CPU de escritorio sin reconversion.
- **Adopcion nula**: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- **Fecha de publicacion atipica**: los metadatos indican creacion y actualizacion en octubre de 2026, lo que conviene verificar antes de tratarlo como un artefacto estable.
- **Sin benchmarks**: no hay evaluacion objetiva publicada que respalde la calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hia1385/oneObsession_v24_dmd2_NoLoar
- Checkpoint base en HuggingFace (terceros): https://huggingface.co/alwyabdl/One_Obsession_v24
- Modelo original en Civitai (One obsession): https://civitai.com/models/1318945/one-obsession
- Licencia (pagina de referencia indicada en la model card): https://civitai.com/models/1318945
- Obsession (Illustrious-XL), checkpoint relacionado de la misma familia: https://civitai.com/models/820208/obsession-illustrious-xl
- One obsession_Anima v4.0: https://civitai.com/models/2695493/one-obsessionanima
- One obsession Branch (Mature), variante NoobAI v-pred: https://civitai.red/models/1368727/one-obsession-branchmaturenoobaivpred
