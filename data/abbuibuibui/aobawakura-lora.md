# abbuibuibui/AobaWakura-Lora

## Resumen

AobaWakura-Lora es un LoRA de personaje para modelos de difusión SDXL, desarrollado por el usuario abbuibuibui y publicado en Hugging Face. Reproduce a Kyouka Uzen (羽前京香), personaje de la serie *Mato Seihei no Slave*, mediante un trigger textual (`aoba_wakura`) y una serie de tokens de indumentaria. El repositorio alberga en realidad tres linajes de pesos distintos: el original entrenado sobre waiIllustriousSDXL v17 (archivos en la raíz), una variante para AutismMix Pony (subcarpeta `autism_pony/`) y una variante para MOSS-Image (subcarpeta `moss/`). Cada linaje exige su propio checkpoint base y su propio conjunto de prompts; mezclarlos produce resultados incorrectos.

El modelo resuelve un problema acotado pero muy demandado en la comunidad de generación de imágenes anime: la consistencia de identidad de un personaje concreto a través de poses, encuadres e indumentarias. Al ser un LoRA y no un checkpoint completo, se aplica como adaptador sobre un modelo SDXL ya existente, lo que reduce drásticamente los requisitos de almacenamiento y cómputo frente a un fine-tuning completo.

La relevancia actual del repositorio es limitada fuera del nicho de ilustración anime: no es un modelo de lenguaje ni un sistema multimodal general, sino un adaptador de difusión de 456 MB por archivo de pesos (7,9 GB de repositorio completo por incluir múltiples linajes y material de evaluación). Su interés reside en la documentación de entrenamiento (rank 64, alpha 32, 91 pares de imágenes) y en la evaluación comparativa entre épocas que el autor publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious |
| Parametros totales | no disponible (rank 64, alpha 32; 456.496.828 bytes por archivo de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el adaptador se carga en precisión nativa) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre waiIllustriousSDXL v17, un checkpoint SDXL de la familia Illustrious orientado a ilustración anime. El entrenamiento se realizó con 91 pares imagen-texto, con 2 repeticiones por par, sobre una DGX Spark utilizando ComfyUI. Se generaron siete épocas (E1–E7); la número siete se distribuye sin numerar (`kyouka_uzen.safetensors`), de modo que no existe un archivo `kyouka_uzen-000007.safetensors`.

El autor documenta una evaluación comparativa entre E5, E6 y E7 en dos rondas, y recomienda E6 con fuerza 0.8 como configuración por defecto. La variante AutismMix Pony se entrenó sobre AutismMix Pony y se ilustra con AutismMix Confetti; la variante MOSS-Image se entrenó sobre MOSS-Image. No se documentan datos sobre composición del dataset, resolución de entrenamiento, optimizador ni técnicas de regularización más allá del recuento de pares y el rango del adaptador.

## Capacidades

- Generación de ilustraciones de un personaje concreto (Kyouka Uzen) manteniendo identidad facial, color de pelo lavanda pálido y ojos magenta.
- Reproducción de indumentarias entrenadas mediante tokens dedicados: uniforme de combate (`aoba_wakura_combat_uniform`), cuello alto rojo (`aoba_wakura_red_turtleneck`), cuello alto negro, camiseta de tirantes verde y camiseta de tirantes blanca.
- Control de encuadre: retrato, tres cuartos, perfil, cuerpo completo, sentada y escenas nocturnas, según la evaluación publicada.
- Compatibilidad con el ecosistema SDXL: funciona en ComfyUI y en cualquier frontend que cargue LoRAs en formato diffusers/safetensors.
- Tres linajes independientes para tres checkpoints base distintos (WAI/Illustrious, AutismMix Pony, MOSS-Image).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de difusión de imágenes.

## Casos de uso

- Ilustración de fan art consistente: un ilustrador aplica el LoRA con el trigger `aoba_wakura` sobre waiIllustriousSDXL v17 para generar variaciones del personaje en distintas poses sin perder el diseño facial ni los ornamentos alados azules.
- Producción de viñetas o doujinshi: la evaluación del autor cubre retrato, tres cuartos, perfil y cuerpo completo, lo que permite mantener coherencia de personaje entre paneles generados por separado.
- Diseño de variantes de vestuario: los tokens de indumentaria permiten alternar entre uniforme de combate, cuello alto y tirantes dentro del mismo flujo de trabajo, útil para fichas de personaje o referencias de cosplay.
- Integración en pipelines de ComfyUI: el LoRA se carga como nodo estándar y se puede encadenar con otros adaptadores, ControlNet o upscalers dentro de un grafo de generación por lotes.
- Prototipado rápido de key art: con la configuración recomendada (E6 a 0.8, Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216) se obtienen resultados presentables en pocos segundos en una GPU de consumo.
- Evaluación comparativa de adaptadores: el repositorio incluye material de evaluación por rondas que sirve como referencia metodológica para quien entrene sus propios LoRAs de personaje y quiera comparar épocas.
- Escenas nocturnas y fondos complejos: la muestra `04_complex_night.png` documenta el comportamiento del adaptador en iluminación difícil, un caso habitual en ilustración de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la información disponible. El autor aporta únicamente una evaluación cualitativa comparativa entre épocas:

| Candidato | Observación documentada | Decisión |
|---|---|---|
| E5 | Identidad en combate utilizable | Alternativa |
| E6 | Retrato con pelo lavanda pálido, ojos magenta, rostro severo y uniforme de cuello alto; cuerpo completo conserva charreteras doradas, ribete rojo y ornamentos alados | Recomendado a 0.8 |
| E7 | Muy próximo a E6 | Alternativa final |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un LoRA sobre SDXL, los requisitos son los del checkpoint base (típicamente 8–12 GB en fp16 para SDXL a resoluciones de 832×1216, según el backend).
- GPU recomendadas: el autor entrenó en una DGX Spark; para inferencia basta una GPU de consumo con al menos 8 GB de VRAM, como una RTX 3060 Ti, 4060 Ti o 4090.
- Cabe en GPU de consumo: sí, siempre que el checkpoint SDXL base quepa; el adaptador añade solo unos 456 MB por archivo.
- Opciones de despliegue: ComfyUI (documentado por el autor), así como cualquier frontend compatible con LoRA SDXL en formato safetensors (A1111, Forge, diffusers).
- Latencia y throughput: no disponible. La configuración de referencia usa 28 pasos con sampler Euler a y CFG 4.5, valores habituales para SDXL en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AobaWakura-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 / AutismMix Pony / MOSS-Image | rank 64, alpha 32 | no aplica | creativeml-openrail-m | Hugging Face, ModelScope |
| KyoukaUzen-Lora (mismo autor) | LoRA de personaje | no disponible en la información | no disponible | no aplica | no disponible | Hugging Face |
| LoRAs de personaje de la serie (Nei, Tenka, Himari) | LoRA de personaje | familia Illustrious | no disponible | no aplica | no disponible | mencionados por el autor, sin enlace |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un derivado no oficial: no cuenta con el respaldo de los titulares de derechos de *Mato Seihei no Slave*.
- Los tres linajes del repositorio no son intercambiables: usar pesos de `autism_pony/` con el checkpoint WAI o con el prompt de WAI produce resultados degradados.
- El color de ojos deriva si no se escribe explícitamente `magenta eyes`, especialmente en indumentaria casual.
- Los ornamentos alados azules no siempre se conservan: hay que describirlos en el prompt si se necesitan.
- El autor advierte de que las captions a menudo omiten color de pelo y ojos, por lo que el modelo depende en parte del prompt para fijarlos.
- El negativo recomendado incluye `long hair`, lo que puede entrar en conflicto con la propia identidad del personaje (pelo largo lavanda pálido); conviene revisarlo según el caso.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso responsable, pero al ser un derivado de un checkpoint SDXL/Illustrious, se heredan las condiciones del modelo base.
- No hay métricas cuantitativas publicadas; la evaluación es cualitativa y realizada por el propio autor.
- Solo soporta inglés y chino en la documentación; los prompts en otras lenguas no están validados.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/AobaWakura-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/AobaWakura-Lora
- LoRA relacionado del mismo autor: https://huggingface.co/abbuibuibui/KyoukaUzen-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/KyoukaUzen-Dataset
- Notas de evaluación en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
