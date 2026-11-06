# abbuibuibui/FukaKikuchi-Lora

## Resumen

FukaKikuchi-Lora es un LoRA de personaje para modelos de difusión SDXL, concretamente entrenado sobre el checkpoint waiIllustriousSDXL v17, que reproduce el aspecto del personaje Fuka Kikuchi (菊池风香) de la serie *Bottom-tier Character Tomozaki*. Lo publica el usuario abbuibuibui como derivado no oficial, con fines de generación de imágenes anime, y se distribuye en formato de pesos diffusers junto a un dataset de entrenamiento abierto en el mismo espacio de Hugging Face.

El repositorio incluye siete conjuntos de pesos correspondientes a las épocas E1 a E7 del entrenamiento, de los cuales el autor recomienda E6 como opción por defecto a fuerza 0.8. Cada archivo pesa 456.495.956 bytes (unos 456 MB), y el repositorio completo ocupa 3,2 GB. El modelo está pensado para integrarse en flujos de trabajo de ComfyUI o Auto1111 con checkpoints de la familia Illustrious o NoobAI.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un adaptador de personaje de bajo rango para generación de imágenes. No hay información publicada sobre arquitectura interna del LoRA (rango, capas objetivo, alpha) ni sobre el volumen exacto del dataset más allá de su identificador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious |
| Parámetros totales | no disponible (cada archivo pesa 456.495.956 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | en, zh (etiquetas de la model card; los prompts admiten otros idiomas según el codificador de texto del checkpoint base) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de personaje entrenado sobre waiIllustriousSDXL v17, un checkpoint SDXL de la familia Illustrious orientado a ilustración anime. No se especifican en la información disponible el rango del LoRA, las capas objetivo, el valor de alpha ni la tasa de aprendizaje. El autor indica que las leyendas de entrenamiento usaron `keep_tokens = 2` y que a menudo omiten el color de pelo y de ojos, lo que explica que el modelo dependa de tokens de identidad explícitos para fijar el aspecto.

El entrenamiento se organiza en siete épocas, con un archivo por época salvo la última, que se guarda sin numerar (`fuka_kikuchi.safetensors`, equivalente a E7). El autor documenta una evaluación comparativa entre épocas y fuerzas de LoRA (matriz de 10 escenas × 4 fuerzas para E5, E6 y E7) y concluye que E6 a 0.8 ofrece el mejor equilibrio entre consistencia facial y estabilidad de composición. Se documenta un fallo recurrente en E5–E7: las tomas de cuerpo completo con el uniforme de blazer a fuerza 0.8 pueden generar dos copias del personaje en la misma imagen. El dataset de entrenamiento está publicado como `abbuibuibui/FukaKikuchi-Dataset`.

## Capacidades

- Generación de imágenes de personaje: reproduce el rostro, el pelo castaño ceniza largo y despeinado, los ojos marrones o avellana y la expresión tranquila de Fuka Kikuchi.
- Control de vestuario mediante tokens específicos: `fuka_kikuchi_blazer_uniform`, `fuka_kikuchi_vest_uniform`, `fuka_kikuchi_casual_cardigan`, `fuka_kikuchi_maid_dress` y `fuka_kikuchi_sailor_casual`.
- Composición de escena: el autor documenta resultados correctos en retrato frontal, cuerpo completo con uniforme de chaleco y escena nocturna en calle con carteles de tienda.
- Integración con pipelines SDXL: funciona en ComfyUI y en flujos compatibles con diffusers; parámetros de referencia Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolución 832×1216.
- Ajuste de fuerza del adaptador: el rango evaluado va de 0.6 a 1.0, con 0.8 como valor recomendado.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo; es exclusivamente un adaptador de imagen.

## Casos de uso

- Ilustración de fan art del personaje: generar retratos y escenas de Fuka Kikuchi con un estilo consistente usando el token `fuka_kikuchi` junto con el checkpoint base Illustrious; adecuado porque el LoRA fija los rasgos faciales y el peinado que las leyendas de entrenamiento no describían.
- Producción de viñetas o doujinshi: mantener la identidad del personaje a lo largo de varias páginas usando la misma semilla base y fuerza 0.8, con el token de vestuario adecuado en cada escena.
- Creación de contenido para comunidades de la serie: generar imágenes de promoción o portada para foros y wikis con el uniforme escolar de chaleco, que el autor identifica como la variante de cuerpo completo más estable.
- Pruebas de comparación de épocas: el repositorio conserva E1 a E7 para que investigadores o artistas evalúen el efecto de la época de entrenamiento sobre la fidelidad del personaje en una matriz controlada de escenas y fuerzas.
- Integración en flujos ComfyUI con otros LoRAs: al ser un adaptador safetensors estándar, puede combinarse con LoRAs de estilo o de composición, ajustando la fuerza para evitar la duplicación del sujeto documentada en cuerpo completo con blazer.
- Docencia o demostración de fine-tuning de personajes: el par dataset + siete épocas + registro de evaluación pública sirve como ejemplo reproducible de un pipeline de LoRA de personaje sobre SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la información disponible. El autor aporta una evaluación cualitativa por épocas:

| Candidato | Resultado observado | Decisión |
|---|---|---|
| E5 | Rostro correcto; cuerpo completo con chaleco limpio y sujeto único; cuerpo completo con blazer a 0.8 puede duplicar el personaje | Alternativa de la matriz |
| E6 | Retrato consistente; chaleco a 0.6–1.0 mantiene una sola chica; escena nocturna a 0.8 con un solo sujeto; blazer de cuerpo completo aún arriesga duplicación | Recomendado a 0.8 |
| E7 | Rostro cercano a E6; el blazer de cuerpo completo puede añadir un jersey amarillo bajo la chaqueta y sigue arriesgando duplicación | Alternativa de última época |

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el LoRA; el requisito viene determinado por el checkpoint base SDXL/Illustrious sobre el que se aplica (típicamente 8–12 GB en fp16 para inferencia a 832×1216, según el checkpoint y el sampler).
- GPU recomendadas: el autor generó las imágenes de evaluación en una DGX con ComfyUI; no detalla el modelo de GPU. Para SDXL en general se emplean A100, H100, RTX 4090, RTX 3090 o superiores.
- GPU de consumo: el adaptador en sí ocupa unos 456 MB, por lo que el límite práctico lo marca el checkpoint base; tarjetas de 8 GB o más pueden ejecutar SDXL con optimizaciones.
- Opciones de despliegue: ComfyUI (usado por el autor), Auto1111/Forge, diffusers con `load_lora_weights`, y cualquier runner compatible con safetensors SDXL.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de personaje comparables en la documentación aportada. Se indica "no disponible" para los campos de comparación.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FukaKikuchi-Lora (E6) | no disponible | no aplica | evaluación cualitativa del autor | creativeml-openrail-m | Hugging Face |
| Alternativas de personaje Illustrious | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Duplicación del sujeto: en E5, E6 y E7, las tomas de cuerpo completo con `fuka_kikuchi_blazer_uniform` a fuerza 0.8 generan con frecuencia dos copias del personaje; el autor recomienda reforzar `solo` / `1girl` o regenerar.
- Deriva de color de ojos: los primeros planos pueden desplazar los ojos hacia verde oliva o avellana aunque se solicite marrón; conviene añadir `green eyes` al prompt negativo.
- Aparición de ahoge: es frecuente en las épocas tardías, lo que puede no ajustarse al diseño de referencia.
- Fuga de identidad sin token: sin el trigger `fuka_kikuchi`, a fuerzas medias el modelo filtra el aspecto de pelo castaño ceniza del personaje en otras generaciones.
- Comportamiento sin token de vestuario: a 0.8 el modelo tiende a generar un vestido blanco sin mangas y zapatos de tira blanca, lo que puede no ser deseado.
- Licencia: CreativeML Open RAIL-M impone restricciones de uso y obligaciones de atribución; es un derivado no oficial y los derechos del personaje y de la obra original pertenecen a sus titulares, lo que limita el uso comercial.
- Idiomas: la model card solo declara en y zh; el comportamiento con prompts en castellano depende del codificador de texto del checkpoint base y no está evaluado.
- Sesgos: no documentados por el autor; al ser un LoRA de personaje anime, hereda los sesgos de representación del checkpoint base y del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/FukaKikuchi-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/FukaKikuchi-Dataset
- Notas de evaluación en chino: `evaluation/横向测评记录.md` (incluido en el repositorio)
- Checkpoint base: waiIllustriousSDXL v17 (referenciado en la model card; enlace no disponible en la información proporcionada)
