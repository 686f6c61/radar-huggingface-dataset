# abbuibuibui/FukaKikuchi-Lora

## Resumen

FukaKikuchi-Lora es un LoRA de personaje para modelos de difusión de imágenes SDXL, entrenado por el usuario abbuibuibui sobre el modelo base waiIllustriousSDXL v17. Representa a Fuka Kikuchi (菊池风香), personaje de la serie *Bottom-tier Character Tomozaki*, y su propósito es permitir la generación consistente de este personaje en ilustraciones de estilo anime con control sobre su identidad, peinado y distintos conjuntos de ropa del uniforme escolar y variantes casuales.

El repositorio es fundamentalmente un LoRA de tipo character para la familia Illustrious/SDXL, pero contiene en realidad tres linajes de pesos distintos: los archivos de la raíz (WAI/Illustrious), una variante para AutismMix Pony en el subdirectorio `autism_pony/` y una variante para MOSS-Image en `moss/`. Cada linaje requiere su propio modelo base y sus propios prompts, y no deben mezclarse. El autor publica siete checkpoints por época (E1–E7) y recomienda E6 con fuerza 0.8 como configuración por defecto.

Es relevante para desarrolladores e investigadores que trabajen en generación de personajes consistentes, pipelines de ilustración anime y evaluación de LoRAs de personaje, porque el autor documenta de forma explícita el proceso de selección de época mediante una matriz de evaluación (10 escenas × 4 fuerzas) y advierte de fallos concretos como la duplicación del sujeto en planos de cuerpo completo con blazer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre SDXL; modelo base waiIllustriousSDXL-v17 |
| Parametros totales | no disponible (cada archivo pesa 456.495.956 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | no disponible; pesos en precisión completa del entrenamiento |
| Idiomas soportados | en, zh (metadatos y documentación; los prompts se escriben en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

Se trata de un LoRA de personaje, es decir, un conjunto de matrices de bajo rango inyectadas en las capas de atención y proyección del UNet de SDXL, que se carga junto al modelo base waiIllustriousSDXL v17. No se especifican en la información disponible el rango del LoRA, la tasa de aprendizaje, el número de pasos ni la composición exacta del dataset, más allá de que las imágenes y captions de entrenamiento están publicadas en el dataset `abbuibuibui/FukaKikuchi-Dataset`. Las captions se generaron con `keep_tokens = 2` y a menudo omiten el color de pelo y de ojos, de modo que la identidad se aprende principalmente a través del token de activación.

El autor entrenó siete épocas y las evaluó sistemáticamente: las épocas E5, E6 y E7 se sometieron a una matriz de 10 escenas por 4 fuerzas (0.6–1.0). E6 se seleccionó como predeterminada por mantener un retrato consistente, un cuerpo completo con uniforme de chaleco limpio y un único sujeto en escena nocturna a fuerza 0.8. Se documentan fallos concretos: en E5 y E7, el plano de cuerpo completo con blazer puede generar una segunda copia del personaje, y E7 puede añadir un jersey amarillo bajo el blazer. El archivo final de entrenamiento es el no numerado `fuka_kikuchi.safetensors`, que corresponde a E7 (no existe un `-000007`). El SHA-256 de E6 es `C7C69CB978B2B3B2231470DD66FB67B9A52EC5E4D6E635DA1928156363615BEE`.

## Capacidades

- Generación de ilustraciones de personaje consistente de Fuka Kikuchi en estilo anime mediante SDXL/Illustrious.
- Control de identidad mediante el token `fuka_kikuchi` (pelo largo castaño ceniza despeinado, flequillo, ojos marrones/avellana, rostro tranquilo).
- Control de vestuario mediante tokens específicos: `fuka_kikuchi_blazer_uniform`, `fuka_kikuchi_vest_uniform`, `fuka_kikuchi_casual_cardigan`, `fuka_kikuchi_maid_dress` y `fuka_kikuchi_sailor_casual`.
- Composición de escenas con múltiples personajes controlada mediante prompts negativos (`extra person`, `two girls`, `multiple girls`).
- Sin capacidad de tool calling, agentes, razonamiento multi-step, visión ni audio: es un modelo generativo de imágenes, no un LLM.
- Soporte multilingüe limitado a la documentación (inglés y chino); los prompts de inferencia se formulan en inglés.
- Compatible con pipelines de ComfyUI y diffusers; ajuste de fuerza del LoRA entre 0.6 y 1.0.

## Casos de uso

- Generación de ilustraciones de personaje para fan art: cargar E6 a fuerza 0.8 con el token de identidad y el token de uniforme de chaleco permite obtener retratos y cuerpos completos coherentes del personaje sin reentrenamiento.
- Creación de hojas de personaje y referencias visuales: combinando los tokens de vestuario (blazer, chaleco, cardigan, vestido de maid, sailor) se pueden generar variantes de indumentaria del mismo personaje para documentación o diseño.
- Integración en pipelines de generación por lotes con ComfyUI: el LoRA se puede encadenar con nodos de upscaling o ADetailer (el autor los desactiva en sus muestras, pero son compatibles) para producir ilustraciones en resolución 832×1216 de forma reproducible.
- Prototipado de escenas narrativas: la matriz de evaluación del autor incluye escenas nocturnas y retratos, lo que permite usar el LoRA para generar viñetas ilustrativas de fan fiction con el personaje en contextos variados.
- Evaluación comparativa de LoRAs de personaje: los siete checkpoints publicados y la documentación de fallos por época sirven como caso de estudio para investigar el sobreentrenamiento y la duplicación de sujeto en LoRAs de personaje.
- Experimentación con distintos modelos base: las variantes `autism_pony/` y `moss/` permiten comparar el mismo personaje bajo AutismMix Pony y MOSS-Image, siempre cargando cada linaje con su modelo base correspondiente y sin mezclar prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial, etc.) en la información disponible. El autor proporciona únicamente una evaluación cualitativa por época:

| Candidato | Resultado observado | Decisión |
|---|---|---|
| E5 | Rostro correcto; chaleco a cuerpo completo limpio; blazer a 0.8 puede duplicar al personaje | Alternativa de la matriz |
| E6 | Retrato consistente; chaleco a 0.6–1.0 con un solo sujeto; escena nocturna a 0.8 con un solo sujeto; blazer a cuerpo completo con riesgo de duplicado | Recomendada a 0.8 |
| E7 | Rostro cercano a E6; blazer puede añadir jersey amarillo y sigue con riesgo de duplicado | Alternativa de época final |

Configuración de muestreo empleada por el autor: ComfyUI, sampler Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolución 832×1216, sin hires ni ADetailer.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el LoRA; depende del modelo base SDXL y del pipeline. Un SDXL en fp16 requiere típicamente del orden de 8–12 GB de VRAM, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el autor solo documenta el uso en ComfyUI sin especificar hardware.
- Opciones de despliegue: ComfyUI (documentado por el autor) y diffusers (librería declarada en los metadatos). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio repositorio contiene tres linajes del mismo personaje (WAI/Illustrious, AutismMix Pony y MOSS-Image), pero no se ofrecen métricas comparativas entre ellos más allá de la recomendación de no mezclar modelos base ni prompts.

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FukaKikuchi-Lora (raíz) | waiIllustriousSDXL-v17 | no disponible | no aplica | creativeml-openrail-m | Hugging Face |
| FukaKikuchi-Lora (`autism_pony/`) | AutismMix Pony | no disponible | no aplica | creativeml-openrail-m | Hugging Face |
| FukaKikuchi-Lora (`moss/`) | MOSS-Image | no disponible | no aplica | creativeml-openrail-m | Hugging Face |

## Limitaciones y advertencias

- Es un derivado hecho por un fan: los derechos del personaje y de la obra original pertenecen a sus titulares; no es un producto oficial.
- Riesgo de duplicación del sujeto: en planos de cuerpo completo con blazer, las épocas E5, E6 y E7 pueden generar dos copias del personaje; el autor recomienda reforzar `solo` / `1girl` y regenerar.
- Deriva de color de ojos: en primeros planos los ojos pueden virar hacia oliva/avellana aunque se solicite marrón; se recomienda mantener `brown eyes` y añadir `green eyes` al prompt negativo.
- Aparición de ahoge no solicitado en las épocas tardías.
- E7 puede insertar un jersey amarillo bajo el blazer en planos de cuerpo completo.
- Sin token de vestuario, a fuerza 0.8 el modelo tiende a generar un vestido blanco sin mangas y zapatos blancos, lo que puede desviarse del personaje.
- Sin el token de nombre, las fuerzas intermedias filtran el pelo castaño ceniza del personaje en otras generaciones.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, difusión de información falsa, etc.); conviene revisar los términos completos antes de desplegar en producción.
- Idiomas de prompt limitados en la práctica al inglés; la documentación está en inglés y chino.
- No se documentan sesgos demográficos ni evaluación de alucinación (no aplica a un generador de imágenes), pero la calidad depende fuertemente del modelo base y de la configuración de muestreo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/FukaKikuchi-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/FukaKikuchi-Dataset
- README en chino: https://huggingface.co/abbuibuibui/FukaKikuchi-Lora/blob/main/README_zh.md
- Variante AutismMix Pony: https://huggingface.co/abbuibuibui/FukaKikuchi-Lora/tree/main/autism_pony
- Variante MOSS-Image: https://huggingface.co/abbuibuibui/FukaKikuchi-Lora/tree/main/moss
