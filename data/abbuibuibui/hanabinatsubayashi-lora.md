# abbuibuibui/HanabiNatsubayashi-Lora

## Resumen

HanabiNatsubayashi-Lora es un LoRA de personaje para modelos de difusión SDXL, entrenado por el usuario abbuibuibui sobre el checkpoint waiIllustriousSDXL v17. Reproduce a Hanabi Natsubayashi (夏林花火), personaje de la serie *Bottom-tier Character Tomozaki*, y se distribuye como un conjunto de siete pesos correspondientes a las épocas E1–E7 del entrenamiento. Es un derivado no oficial, creado por un particular, no un producto de un laboratorio de IA.

El modelo resuelve un problema acotado: generar imágenes consistentes de un personaje de anime concreto (pelo rosa largo, ojos azules, ahoge) y sus atuendos característicos, mediante tokens de activación específicos (`hanabi_natsubayashi`, más tokens de vestuario como `hanabi_natsubayashi_vest_uniform`, `hanabi_natsubayashi_white_dress` y `hanabi_natsubayashi_yukata`). Se enmarca en el ecosistema Illustrious/NoobAI de SDXL, orientado a ilustración anime.

Su relevancia es limitada y práctica: es un LoRA de personaje de rango bajo (rank 6) y tamaño reducido (unos 456 MB por fichero, 3,2 GB el repositorio completo), pensado para integrarse en flujos de ComfyUI o diffusers junto a checkpoints Illustrious. La model card documenta una evaluación comparativa entre épocas y recomienda E6 a fuerza 0,8 como configuración por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 6) sobre SDXL / Illustrious (waiIllustriousSDXL v17) |
| Parametros totales | no disponible (peso LoRA de 456.493.684 bytes por fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | en, zh (prompts en inglés y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (formato diffusers / LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 6 aplicado sobre el modelo base waiIllustriousSDXL v17, un checkpoint SDXL orientado a ilustración anime dentro de la familia Illustrious. El LoRA no modifica la arquitectura del UNet ni del text encoder; añade matrices de bajo rango que desplazan los pesos del modelo base para incorporar la identidad del personaje y sus atuendos.

El entrenamiento se realizó sobre el dataset público `abbuibuibui/HanabiNatsubayashi-Dataset`, con captions configuradas con `keep_tokens = 2`. La model card advierte de que los colores de pelo y ojos a menudo faltan en las captions y deben añadirse manualmente en el prompt. Se conservan siete épocas (E1–E7); la séptima es el fichero sin numerar `hanabi_natsubayashi.safetensors`. No se documentan en la información disponible el número de imágenes, el número de pasos, la tasa de aprendizaje ni si hubo regularización o técnicas adicionales.

## Capacidades

- Generación de imágenes de un personaje anime concreto con identidad consistente (pelo rosa largo, ojos azules, ahoge en épocas tardías).
- Control de atuendos mediante tokens dedicados: uniforme con chaleco, vestido blanco y yukata.
- Compatibilidad con el ecosistema SDXL/Illustrious: funciona en ComfyUI, diffusers y otras herramientas que carguen LoRA sobre SDXL.
- Ajuste de intensidad del LoRA (fuerza recomendada 0,8; se evaluaron 0,4, 0,6, 0,8 y 1,0).
- Prompts bilingües (inglés y chino), según los idiomas declarados.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo: es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Ilustración de fan art del personaje: cargar E6 a fuerza 0,8 sobre waiIllustriousSDXL v17 y generar retratos o cuerpos completos con el token de identidad y el de vestuario, siguiendo los ajustes documentados (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216).
- Creación de hojas de personaje consistentes: usar el mismo LoRA y semilla para producir varias vistas (frontal, tres cuartos, perfil) y mantener la identidad visual en un documento de referencia.
- Prototipado de escenas para cómics o doujinshi: combinar el token de identidad con prompts de entorno (calle nocturna, fondo simple) para generar viñetas de prueba antes de encargar arte final.
- Variaciones de vestuario en un mismo personaje: alternar `hanabi_natsubayashi_vest_uniform`, `hanabi_natsubayashi_white_dress` y `hanabi_natsubayashi_yukata` para explorar diseños sin reentrenar.
- Pruebas de pipelines de generación por lotes en ComfyUI: el LoRA es ligero (456 MB) y permite iterar sobre matrices de fuerzas y épocas, como documenta la propia evaluación del autor.
- Base para fine-tuning posterior de personaje: al ser un LoRA de rango 6 sobre Illustrious, puede servir como punto de partida para añadir expresiones o atuendos adicionales con un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una evaluación cualitativa comparativa entre épocas (E1–E7) y fuerzas (0,4–1,0), con observaciones descriptivas (por ejemplo, que E6 mantiene la identidad rosa/azul con un mohín suave y que E7 no aporta mejoras claras sobre E6). No hay métricas numéricas como FID, CLIP score ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutarse sobre SDXL, requiere la VRAM del checkpoint base (habitualmente 8–12 GB en fp16 según resolución y optimizaciones).
- GPU recomendadas: no disponible en la información proporcionada; la evaluación del autor se realizó en "DGX ComfyUI", sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del checkpoint SDXL base y de las optimizaciones empleadas.
- Opciones de despliegue: ComfyUI (usado en la evaluación del autor) y diffusers (librería declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, cualquier LoRA de personaje SDXL/Illustrious comparte la misma arquitectura de adaptador de bajo rango y depende del checkpoint base; las diferencias estarían en el dataset, el rango y la calidad del personaje, datos que no se aportan aquí para alternativas.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje y de la obra original pertenecen a sus titulares; la model card lo declara explícitamente como fan-made.
- Licencia creativeml-openrail-m: permite uso comercial con restricciones; conviene revisar sus términos antes de explotar las imágenes en producción.
- Riesgo de fuga de identidad: sin el token de nombre, el modelo puede seguir generando el aspecto rosa/azul en fuerzas medias, según la propia model card.
- Las captions no incluyen de forma fiable el color de pelo y ojos; es necesario añadirlos manualmente en el prompt para evitar derivas.
- El ahoge aparece de forma habitual en épocas tardías, lo que puede no ser deseado en todos los encuadres.
- Sin token de vestuario, la salida por defecto es un jersey navy con blusa blanca, no el uniforme canónico.
- Bajo el alumbrado nocturno, la falda puede leerse en un tono azul grisáceo más frío que el original.
- Solo genera imágenes: no ofrece texto, razonamiento, código ni tool calling.
- El rendimiento depende del checkpoint base; la recomendación es waiIllustriousSDXL v17 o merges Illustrious/NoobAI, no otros modelos SDXL.
- No se documentan sesgos, tasas de alucinación ni métricas de fidelidad cuantitativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/HanabiNatsubayashi-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/HanabiNatsubayashi-Dataset
- Notas de evaluación en chino: `evaluation/横向测评记录.md` (incluido en el repositorio)
- README en chino: `README_zh.md` (incluido en el repositorio)
