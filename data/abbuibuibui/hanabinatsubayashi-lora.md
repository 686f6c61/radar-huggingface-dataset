# abbuibuibui/HanabiNatsubayashi-Lora

## Resumen

HanabiNatsubayashi-Lora es un LoRA de personaje para modelos de difusión SDXL, entrenado por el usuario abbuibuibui sobre la base waiIllustriousSDXL v17. Reproduce a Hanabi Natsubayashi (夏林花火), personaje de la serie *Bottom-tier Character Tomozaki*, y se distribuye como un conjunto de pesos de tipo LoRA en formato safetensors que se cargan sobre el modelo base mediante la librería diffusers o ComfyUI. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que modifica el comportamiento de un modelo de imagen ya existente.

El repositorio contiene tres familias de pesos entrenadas sobre bases distintas: la original para WAI/Illustrious (archivos en la raíz), una variante para AutismMix Pony (carpeta `autism_pony/`) y otra para MOSS-Image (carpeta `moss/`). Cada familia debe usarse con su modelo base correspondiente y no son intercambiables. El autor publica siete épocas formales (E1–E7) del entrenamiento principal y recomienda E6 como opción por defecto a fuerza 0.8.

Su relevancia es acotada: se trata de un derivado hecho por un fan para la generación de ilustraciones de un personaje concreto, con 178 descargas y sin likes en el momento de la consulta. Resulta útil para quien necesite consistencia visual de este personaje en pipelines de generación de imágenes con SDXL/Illustrious, pero no aporta capacidades de razonamiento, código ni procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious; no disponible el detalle de rango y dimensiones de las capas adaptadas |
| Parametros totales | no disponible (cada archivo de pesos ocupa 456.493.684 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos safetensors sin cuantizar |
| Idiomas soportados | en, zh (etiquetas de idioma del repositorio; los prompts de ejemplo están en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (LoRA); librería diffusers |

## Arquitectura y entrenamiento

El adaptador se entrena sobre waiIllustriousSDXL v17, un modelo base de la familia SDXL orientado a ilustración anime. El LoRA inyecta matrices de bajo rango en las capas del UNet del modelo base, de modo que el resultado depende por completo de la calidad y del estilo de dicho base. El autor indica que las imágenes y los pies de foto de entrenamiento están publicados en el dataset abbuibuibui/HanabiNatsubayashi-Dataset, y que las captions se generaron con `keep_tokens = 2`.

El entrenamiento se organiza en épocas y el autor documenta una evaluación comparativa entre E1 y E7 con matriz de escenas y fuerzas (10 escenas × 4 intensidades para E5, E6 y E7). Según esa evaluación, E5 fija ya el color de pelo rubio y los ojos castaño-rojizos, E6 mantiene la identidad con una expresión más suave y E7 es prácticamente idéntico a E6 sin ganancia clara. No se especifican en la información disponible el número de pasos, la tasa de aprendizaje, el tamaño del dataset ni la composición exacta del mismo.

## Capacidades

- Generación de ilustraciones del personaje Hanabi Natsubayashi con identidad visual consistente (pelo rubio corto, ojos castaño-rojizos, ahoge en épocas tardías).
- Control de vestuario mediante tokens dedicados: `hanabi_natsubayashi_vest_uniform` (uniforme con chaleco azul marino y falda de cuadros rojo-rosada), `hanabi_natsubayashi_white_dress` (vestido blanco con encaje azul) y `hanabi_natsubayashi_yukata`.
- Composición de escenas variadas: retrato frontal, tres cuartos, perfil, cuerpo completo, sentada y escenas nocturnas, según la evaluación publicada.
- Integración con pipelines de difusión vía diffusers y ComfyUI.
- Soporte de prompts en inglés y notas de uso en chino.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es exclusivamente un adaptador de generación de imágenes.

## Casos de uso

- Ilustración de fan art consistente: cargar E6 a fuerza 0.8 sobre waiIllustriousSDXL v17 y generar retratos del personaje con la configuración recomendada (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216) para mantener la identidad entre imágenes.
- Creación de hojas de personaje: usar los tokens de vestuario para producir variantes de uniforme, vestido blanco y yukata del mismo personaje, útiles en documentos de referencia de proyectos de animación o cómic amateur.
- Escenas narrativas: combinar el trigger de identidad con prompts de entorno (calle nocturna, interior) para ilustrar viñetas o portadas de historias derivadas.
- Prototipado de merchandising: generar composiciones de cuerpo completo para bocetos de figuras, camisetas o láminas, siempre dentro de los términos de la licencia CreativeML OpenRAIL-M.
- Comparación de épocas en investigación de entrenamiento de LoRA: el repositorio conserva E1–E7 y las matrices de evaluación, lo que permite estudiar cómo evoluciona la fidelidad del personaje con las épocas y la fuerza del adaptador.
- Integración en flujos ComfyUI: encadenar el LoRA con otros nodos (upscale, controlnet) para producción de imágenes en lote, dado que el autor documenta su uso en ComfyUI sobre DGX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta únicamente una evaluación cualitativa por épocas y fuerzas (E1–E7 a 0.8; E5/E6/E7 a 0.4, 0.6, 0.8 y 1.0) con imágenes de muestra, sin métricas numéricas como FID, CLIP score o similitud facial.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un LoRA sobre SDXL, los requisitos vienen determinados por el modelo base (típicamente 8–12 GB en fp16 para SDXL en consumer GPU, aunque este dato no se confirma en la información proporcionada).
- GPU recomendadas: no disponible en la información; el autor menciona evaluación en DGX con ComfyUI, sin especificar el modelo de GPU.
- Compatibilidad con consumer GPU: no confirmada en la información disponible.
- Opciones de despliegue: diffusers (librería declarada) y ComfyUI (usado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HanabiNatsubayashi-Lora (este) | LoRA de personaje SDXL | waiIllustriousSDXL v17 | no aplica | creativeml-openrail-m | Hugging Face, 178 descargas |
| Variante AutismMix Pony del mismo repo | LoRA de personaje SDXL | AutismMix Pony | no aplica | creativeml-openrail-m | Incluida en el mismo repositorio |
| Variante MOSS-Image del mismo repo | LoRA de personaje SDXL | MOSS-Image | no aplica | creativeml-openrail-m | Incluida en el mismo repositorio |

No se dispone de información sobre otros LoRA de personaje comparables (por ejemplo, de otros personajes de la misma serie) en los datos proporcionados, por lo que la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Es un derivado hecho por fans, no un producto oficial; los derechos del personaje y de la obra original pertenecen a sus titulares.
- No debe mezclarse con otros modelos base: los pesos de la raíz, de `autism_pony/` y de `moss/` requieren sus respectivas bases y prompts.
- Los colores de pelo y ojos suelen faltar en las captions, por lo que el autor recomienda añadirlos explícitamente en el prompt.
- Sin el token de vestuario, a fuerza 0.8 el modelo tiende a generar un jersey azul marino sobre blusa blanca en lugar del uniforme completo.
- Sin el trigger de nombre, a fuerzas medias aún puede filtrarse el aspecto rubio del personaje, lo que puede contaminar otras generaciones.
- La identidad puede degradarse fuera de la configuración recomendada (fuerza 0.8, Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216).
- Riesgo de alucinación visual y de anatomía incorrecta (manos, proporciones), habitual en modelos de difusión; el autor incluye un prompt negativo para mitigarlo.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibición de usos dañinos o ilegales descritos en el anexo de la licencia); conviene revisarla antes de un uso comercial.
- Solo se declaran idiomas en y zh; no hay evidencia de soporte para prompts en castellano.
- El repositorio ocupa 7,9 GB por incluir tres familias de pesos y material de evaluación; conviene descargar solo el archivo necesario (E6, 456.493.684 bytes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/HanabiNatsubayashi-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/HanabiNatsubayashi-Dataset
- Notas de evaluación en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
- Modelo base: waiIllustriousSDXL v17 (no se proporciona URL en la información disponible)
