# LouisAmas/acestep-1.5-xl-sft-lora-90s-trance

## Resumen

`acestep-1.5-xl-sft-lora-90s-trance` es un adaptador LoRA publicado por LouisAmas que especializa el modelo base ACE-Step 1.5 XL SFT (un transformer de difusion DiT de 4B parametros para generacion texto-a-audio) hacia la produccion de trance de los anos 90. El adaptador empuja al modelo hacia subgeneros concretos (uplifting, acid, goa, progressive y rave temprano) en un rango de 130-142 BPM, con estructuras largas de DJ: intros extendidas, breakdowns reales y builds. Genera pistas instrumentales de hasta 7 minutos.

El modelo resuelve un problema de nicho: los modelos texto-a-musica generalistas rara vez aciertan con las convenciones estilisticas y estructurales de un genero tan codificado como el trance noventero. Este LoRA se entrena sobre 40 pistas instrumentales (4,3 horas) en FLAC sin perdida y se activa con la palabra disparadora `ys_trance90s`. Requiere cargarse sobre el checkpoint SFT (no sobre la variante turbo) y usar el planificador `acestep-5Hz-lm-4B`.

Es relevante para desarrolladores e investigadores interesados en la personalizacion eficiente de modelos generativos de audio: el adaptador pesa 0,4 GB, se entrena en aproximadamente 1,5 horas en una sola GPU de 48-96 GB y se distribuye con licencia MIT, aunque el propio autor advierte que el dataset de entrenamiento contiene grabaciones con derechos de autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre ACE-Step 1.5 XL SFT, transformer de difusion DiT de 4B |
| Parametros totales | no disponible (el adaptador LoRA pesa 0,4 GB; el modelo base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (generacion instrumental, sin voces) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre ACE-Step 1.5 XL SFT, un modelo de difusion con arquitectura DiT de 4B parametros para generacion texto-a-audio. El LoRA tiene rango 128, alpha 256 y dropout 0,1, y se inyecta en las proyecciones de atencion q/k/v/o, tanto de self-attention como de cross-attention. Se entreno con learning rate 1e-4, 100 pasos de warm-up, batch 1 con acumulacion de gradiente 4, durante 50 epocas, en una sola GPU de 48-96 GB en aproximadamente 1,5 horas.

El dataset consta de 40 pistas instrumentales de trance de los 90 (4,3 horas), exclusivamente en FLAC sin perdida y con un maximo de dos pistas por artista. El preprocesado convierte a 24 bits y 48 kHz, corta en unos 300 segmentos uniformes de 45 segundos y normaliza el volumen a -14 LUFS. Las descripciones por pista se generaron con el LM de ACE-Step y se corrigieron manualmente para el genero, anadiendo BPM y tonalidad medidos. El autor senala que la diferencia clave frente a un primer intento fallido fue usar audio sin perdida en lugar de MP3 a 192 kbps, procesar todo a 24 bits y corregir etiquetas erroneas del LM (pistas de trance clasificadas como chiptune o tech house).

## Capacidades

- Generacion de musica instrumental texto-a-audio especializada en trance de los 90: uplifting, acid, goa, progressive y rave temprano.
- Control explicito de BPM (rango objetivo 130-142) y tonalidad mediante el caption.
- Estructuras largas de DJ: intros extendidas, breakdowns, builds con barridos de filtro y redobles de caja, y reentrada del groove completo.
- Generacion de pistas instrumentales de hasta 420 segundos (7 minutos).
- Activacion mediante la palabra disparadora `ys_trance90s`, que debe colocarse al inicio del caption.
- Produccion de letras en modo instrumental mediante la etiqueta `[Instrumental]`.
- No soporta voces: el adaptador no se entreno con material vocal.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso; es un modelo puramente generativo de audio.

## Casos de uso

- Produccion de maquetas de trance: un productor puede generar una pista instrumental completa de 7 minutos con estructura de DJ y usarla como base o referencia antes de trabajar en el DAW, gracias al control de BPM y tonalidad.
- Generacion de sets de DJ: al fijar BPM entre 130 y 142 y tonalidades concretas, se pueden producir varias pistas compatibles entre si para encadenarlas en un set continuo.
- Musica de fondo para contenido audiovisual: la naturaleza instrumental y las estructuras largas con intro y breakdown encajan en videos, podcasts o retransmisiones que necesitan ambiente electronico sin voces.
- Prototipado rapido de ideas musicales: con 50 pasos Euler y CFG 7, el modelo permite iterar sobre variaciones de un mismo prompt cambiando la semilla, util para explorar direcciones creativas.
- Investigacion en personalizacion de modelos de audio: el adaptador sirve como caso de estudio de fine-tuning LoRA eficiente sobre un DiT de 4B, con un coste de entrenamiento de 1,5 horas en una GPU.
- Generacion de bibliotecas de samples y loops estilisticos: a partir de los segmentos generados se pueden extraer patrones de sintetizador, lineas de bajo o redobles caracteristicos del genero.
- Demostraciones y evaluacion de modelos texto-a-musica: util para comparar la fidelidad estilistica de ACE-Step 1.5 frente a otros generadores en un genero con convenciones muy marcadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB, pero requiere cargar el modelo base ACE-Step 1.5 XL SFT (4B parametros) y el planificador `acestep-5Hz-lm-4B`.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU de entrenamiento documentada: 1 GPU de 48-96 GB, con un tiempo de entrenamiento de aproximadamente 1,5 horas.
- No se especifica si el modelo completo cabe en GPU de consumo; el dato no esta disponible.
- Opciones de despliegue: no se documentan en la model card; se indica el uso de la libreria PEFT y el repositorio oficial de ACE-Step 1.5.
- Latencia y throughput: no disponibles.
- Configuracion de inferencia recomendada: fuerza LoRA 1,4, 50 pasos, sampler Euler, CFG 7, duracion 420 segundos, BPM y tonalidad explicitos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| acestep-1.5-xl-sft-lora-90s-trance | LoRA sobre DiT texto-a-audio | 4B (base) | no disponible | MIT | Hugging Face (0 descargas) |
| ACE-Step 1.5 XL SFT (base) | DiT texto-a-audio | 4B | no disponible | no disponible en la informacion | Hugging Face (ACE-Step/acestep-v15-xl-sft) |
| ACE-Step 1.5 XL Turbo | DiT texto-a-audio | no disponible | no disponible | no disponible | Hugging Face; el autor advierte que su turbo anula el efecto del LoRA |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo genera musica instrumental: no se entreno con voces, por lo que cualquier intento de generar canto producira resultados deficientes.
- Las pistas largas pueden repetir secciones en bucle; la estructura generada es plausible pero no esta editada manualmente.
- El adaptador debe cargarse sobre el checkpoint SFT, no sobre la variante turbo, porque el turbo anula el efecto del LoRA.
- El autor no distribuye las pistas de entrenamiento y advierte que el LoRA se entreno con grabaciones sujetas a derechos de autor: hay que revisar cada salida antes de publicarla comercialmente.
- Aunque la licencia del adaptador es MIT, la procedencia del dataset introduce un riesgo legal para uso comercial que el propio autor senala explicitamente.
- El modelo base puede clasificar mal el genero en las descripciones automaticas; el autor tuvo que corregir manualmente etiquetas erroneas durante el entrenamiento, lo que sugiere cierta imprecision del LM planificador en terminologia musical.
- No hay informacion sobre sesgos, cobertura idiomatica ni limites de contexto.
- El repositorio no registra descargas ni interacciones, por lo que no existe validacion de la comunidad sobre su calidad o estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LouisAmas/acestep-1.5-xl-sft-lora-90s-trance
- Modelo base: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Repositorio de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Muestras de audio: https://huggingface.co/LouisAmas/acestep-1.5-xl-sft-lora-90s-trance/resolve/main/samples/t1_uplifting.mp3, https://huggingface.co/LouisAmas/acestep-1.5-xl-sft-lora-90s-trance/resolve/main/samples/t2_dark_acid.mp3, https://huggingface.co/LouisAmas/acestep-1.5-xl-sft-lora-90s-trance/resolve/main/samples/t3_goa.mp3
