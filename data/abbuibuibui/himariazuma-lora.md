# abbuibuibui/HimariAzuma-Lora

## Resumen

HimariAzuma-Lora es un LoRA de personaje para modelos de difusión SDXL, desarrollado por el usuario abbuibuibui y publicado en Hugging Face. Reproduce a Himari Azuma (东日万凛), personaje de la obra *Mato Seihei no Slave*, sobre el checkpoint base waiIllustriousSDXL v17. No es un modelo de lenguaje: es un adaptador de bajo rango que se aplica sobre un modelo de imagen para condicionar la generación hacia la identidad visual del personaje. El repositorio tiene 7,9 GB e incluye tres linajes distintos de pesos (WAI/Illustrious en la raíz, AutismMix Pony en `autism_pony/` y MOSS-Image en `moss/`), cada uno con su propio modelo base y prompts incompatibles entre sí.

El adaptador se entrenó con 87 pares de imágenes y sus correspondientes captions, con un rango de LoRA de 64 y alpha de 32, durante 7 épocas. El autor publica una evaluación comparativa propia entre épocas y fuerzas de aplicación, y recomienda por defecto la época E6 a fuerza 0,8 para el linaje WAI. La activación del personaje se realiza mediante el token `kyouka_uzen`, acompañado de tokens de vestuario como `kyouka_uzen_combat_uniform` y `kyouka_uzen_white_blouse`.

Su relevancia es acotada pero clara dentro del ecosistema de generación de imágenes anime: permite fijar de forma consistente una identidad de personaje concreta (pelo largo azul verdoso oscuro, ojos ámbar-dorados, cinta de pelo a juego) sin necesidad de reentrenar el checkpoint completo, y con un conjunto de pesos ligeros (unos 456 MB por fichero) que se cargan como adaptador en ComfyUI o diffusers. La licencia CreativeML OpenRAIL-M impone restricciones de uso que conviene revisar antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL; modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (rango de LoRA 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imagen) |
| Tipos de cuantizacion | no disponible; pesos en precisión de entrenamiento (bf16 en entrenamiento) |
| Idiomas soportados | en, zh (etiquetas de la model card y captions) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (un fichero por época; 456.493.996 bytes por fichero) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 inyectado sobre el UNet del checkpoint SDXL waiIllustriousSDXL v17. El entrenamiento se realizó con AdamW en bf16, con buckets de resolución con tope de 1536 y 7 épocas. El conjunto de datos consta de 87 pares imagen-caption con tres variantes de vestuario (Combat_Uniform, White_Blouse y Navy_Sweater) y un factor de repetición de 2. Las captions se generaron con `keep_tokens = 2`, y el autor advierte que el color de pelo y de ojos a menudo se omite en las captions, por lo que conviene añadirlo explícitamente en el prompt en tiempo de inferencia. El entrenamiento y la evaluación se ejecutaron en un NVIDIA DGX Spark con ComfyUI.

La innovación técnica principal no está en la arquitectura, sino en el proceso de selección de época: el autor documenta una evaluación en dos rondas. La primera criba E1–E7 a fuerza 0,8; la tercera evalúa una matriz de E5, E6 y E7 por 10 escenas y 4 fuerzas (0,4, 0,6, 0,8 y 1,0). De ahí se concluye que E6 a 0,8 es la configuración recomendada por defecto, con E5 y E7 como alternativas. El repositorio alberga además dos linajes adicionales entrenados sobre bases distintas (AutismMix Pony y MOSS-Image), con pesos separados y sin compatibilidad cruzada de prompts ni de checkpoint base.

## Capacidades

- Generación de imágenes de personaje con identidad fija mediante el token de activación `kyouka_uzen`.
- Control de vestuario mediante tokens dedicados: `kyouka_uzen_combat_uniform` (uniforme de combate con charreteras doradas, ribete rojo, falda corta y botas a media pantorrilla) y `kyouka_uzen_white_blouse` (blusa blanca, con tendencia a interpretarse como vestido de verano de hombro descubierto si no se especifica).
- Composición de escenas variadas: retrato frontal, tres cuartos, perfil, cuerpo completo, sentado, fondo simple, fondo nocturno complejo y escenas sin token de vestuario.
- Integración con pipelines SDXL estándar vía diffusers y con ComfyUI; el autor documenta ajustes concretos de muestreo (Euler a, 28 pasos, CFG 4,5, CLIP skip 2, resolución 832×1216).
- Compatibilidad con el ecosistema de prompts anime (etiquetas de calidad como `masterpiece`, `best quality`, `very aesthetic`, `absurdres`, `anime screencap`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un adaptador de imagen.
- Capacidades multilingües limitadas a la documentación (inglés y chino); los prompts de generación son en inglés.

## Casos de uso

- Ilustración de fan art de personaje: el LoRA fija la identidad de Himari Azuma de forma consistente entre imágenes, lo que permite generar series de ilustraciones coherentes sin describir el diseño del personaje en cada prompt. Adecuado por la baja carga de pesos (456 MB por época) y la compatibilidad directa con ComfyUI.
- Creación de paneles para doujinshi o cómic amateur: la evaluación documentada cubre retrato, tres cuartos, perfil, cuerpo completo y poses sentadas, lo que facilita mantener continuidad visual entre viñetas de una misma escena.
- Pruebas de vestuario y variantes de diseño: los tokens separados de identidad y de ropa permiten mantener el personaje fijo mientras se cambia el atuendo, útil para explorar variantes de indumentaria sobre un mismo diseño base.
- Integración en flujos de trabajo de difusión con diffusers: al ser un LoRA en safetensors sobre SDXL, se carga como adaptador en un pipeline de diffusers y se puede automatizar la generación por lotes desde Python para catálogos o prototipos.
- Evaluación comparativa de épocas y fuerzas de LoRA: el repositorio incluye una matriz documentada (E5/E6/E7 × 0,4/0,6/0,8/1,0 sobre 10 escenas) que sirve como caso de estudio metodológico para quien entrene sus propios LoRA de personaje.
- Escenas nocturnas y fondos complejos: la evaluación incluye una escena de calle nocturna, lo que indica que el adaptador mantiene la identidad del personaje en composiciones con iluminación y fondo no triviales.
- Prototipado rápido en hardware de consumo: al ser un adaptador ligero sobre SDXL, se puede aplicar sobre un checkpoint base ya cargado en una GPU consumer, sin necesidad de servir un modelo adicional completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la información disponible. El autor aporta una evaluación cualitativa comparativa entre épocas y fuerzas de aplicación, resumida a continuación:

| Candidato | Fuerza evaluada | Observación del autor | Decisión |
|---|---|---|---|
| E1–E4 | 0,8 | Criba inicial (ronda 1) | Alternativas tempranas |
| E5 | 0,8 | Identidad de combate usable; pelo azul verdoso oscuro y ojos ámbar ya presentes | Alternativa |
| E6 | 0,8 | Retrato con pelo largo azul verdoso oscuro, ojos ámbar-dorados y uniforme de cuello alto con detalles dorados; cuerpo completo de combate conserva charreteras, ribete rojo, falda corta y botas | **Recomendado por defecto** |
| E7 | 0,8 | Cercano a E6 | Alternativa final |

La matriz de la ronda 3 cubre E5, E6 y E7 por 10 escenas (retrato frontal, tres cuartos, perfil, cuerpo completo principal, cuerpo completo alternativo, sentado, fondo simple, fondo complejo nocturno, sin token de vestuario y sin token de activación) y 4 fuerzas (0,4, 0,6, 0,8 y 1,0). Los resultados se presentan como imágenes en el repositorio, sin métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador LoRA en sí ocupa unos 456 MB por fichero, pero requiere cargar el checkpoint base SDXL completo (waiIllustriousSDXL v17), que típicamente demanda entre 6 y 10 GB de VRAM en función de la precisión y del pipeline.
- GPU recomendadas: el autor entrenó y evaluó en un NVIDIA DGX Spark. Para inferencia, cualquier GPU capaz de ejecutar SDXL en ComfyUI o diffusers es suficiente; no se documentan modelos concretos de GPU consumer.
- Cabe en GPU consumer: sí, siempre que la GPU soporte SDXL (el adaptador no añade requisitos significativos sobre el checkpoint base).
- Opciones de despliegue: ComfyUI (documentado por el autor), diffusers (librería declarada en el repositorio). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles. Los ajustes de muestreo documentados son Euler a, 28 pasos, CFG 4,5, CLIP skip 2 y resolución 832×1216, sin hires fix ni ADetailer.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HimariAzuma-Lora (WAI) | LoRA de personaje | waiIllustriousSDXL v17 | rango 64, alpha 32 | no aplica | creativeml-openrail-m | Hugging Face, ModelScope |
| HimariAzuma-Lora (AutismMix Pony) | LoRA de personaje | AutismMix Pony | no disponible | no aplica | creativeml-openrail-m | Hugging Face (subcarpeta `autism_pony/`) |
| HimariAzuma-Lora (MOSS-Image) | LoRA de personaje | MOSS-Image | no disponible | no aplica | creativeml-openrail-m | Hugging Face (subcarpeta `moss/`) |

No se dispone de información sobre otros LoRA de personaje comparables en la documentación proporcionada. Las tres variantes del propio repositorio no son intercambiables: cada una requiere su checkpoint base y su conjunto de prompts, y el autor advierte explícitamente de no mezclarlas.

## Limitaciones y advertencias

- El token de activación declarado en la model card es `kyouka_uzen`, que corresponde al personaje Kyouka Uzen y no a Himari Azuma; esta discrepancia entre el nombre del repositorio y el token de activación puede provocar confusión y debe verificarse antes de usarlo en producción.
- Las captions de entrenamiento omiten con frecuencia el color de pelo y de ojos, por lo que es necesario añadirlos manualmente en el prompt para obtener la apariencia correcta.
- El token `kyouka_uzen_white_blouse` tiende a interpretarse como un vestido de verano de hombro descubierto en lugar de una blusa; si se necesita una silueta de camisa, hay que escribir `white blouse` explícitamente.
- Los tres linajes de pesos del repositorio son incompatibles entre sí: mezclar checkpoints base, prompts o negativos entre WAI/Illustrious, AutismMix Pony y MOSS-Image produce resultados incorrectos.
- Es un derivado no oficial hecho por un fan; los derechos del personaje pertenecen a sus titulares originales.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (incluidas cláusulas de uso aceptable y posible obligación de atribución); conviene revisar sus términos antes de cualquier uso comercial.
- No se han publicado métricas cuantitativas de calidad, similitud facial ni robustez ante prompts adversos; la evaluación es exclusivamente cualitativa y realizada por el propio autor.
- El repositorio tiene 0 likes y 133 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Riesgo de sobreajuste a las tres variantes de vestuario del dataset de entrenamiento (combat uniform, white blouse, navy sweater); otros atuendos pueden renderizarse de forma menos fiable.
- No apto para tareas de texto, razonamiento, código ni agentes: es exclusivamente un adaptador de generación de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/HimariAzuma-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/HimariAzuma-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/KyoukaUzen-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/HimariAzuma-Dataset
- Notas de evaluación en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
