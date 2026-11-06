# abbuibuibui/KyokoHori-Lora

## Resumen

KyokoHori-Lora es un LoRA de personaje para modelos de difusión SDXL, entrenado específicamente sobre el checkpoint waiIllustriousSDXL v17 (variante Illustrious/NoobAI orientada a ilustración anime). Lo publica el usuario abbuibuibui en Hugging Face y su función es reproducir de forma consistente el rostro, el cabello y los uniformes del personaje Kyoko Hori, de la obra *Horimiya*, en generaciones controladas por prompt. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se carga sobre una base SDXL concreta.

El repositorio incluye los pesos de siete épocas de entrenamiento (E1 a E7), con recomendación explícita de usar E6 a fuerza 0.8. El autor documenta una evaluación comparativa propia con matrices de escenas y fuerzas, además de los tokens de activación para identidad y para cada variante de vestuario. El dataset de entrenamiento (78 imágenes con captions) está publicado por separado.

Es relevante para quien genere ilustración anime con pipelines SDXL/Illustrious y necesite consistencia de personaje entre escenas, ya que el autor aporta pesos por época, ejemplos sin retoque y una metodología de selección reproducible, algo poco habitual en LoRAs de personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet y ambos text encoders de SDXL / Illustrious |
| Parametros totales | Rango 64, alpha 32; tamaño de cada fichero 456.495.788 bytes (unos 456 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión de imagen, no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (fp32/fp16 según el peso; el entrenamiento usó bf16 en cómputo y fp32 en VAE y estados del optimizador) |
| Idiomas soportados | en, zh (idiomas declarados en la model card; los prompts se escriben en inglés o chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (7 ficheros, uno por época) |
| Modelo base | waiIllustriousSDXL-v17 (`waiIllustriousSDXL_v170`) |
| Libreria | diffusers |
| Resolucion recomendada | 832×1216 |
| Fuerza recomendada | 0.8 (rango útil 0.6–0.8) |
| Sampler y pasos | Euler a, 28 pasos, CFG 4.5, CLIP skip 2 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado tanto al UNet como a los dos text encoders del modelo base SDXL en su variante Illustrious. El entrenamiento usó AdamW con estados en fp32, cómputo en bf16, VAE en fp32 y atención SDPA, sin optimizador de 8 bits y sin gradient checkpointing. Las tasas de aprendizaje documentadas son 1e-4 para el UNet; el valor para los text encoders aparece truncado en la model card y no puede confirmarse.

El dataset consta de 78 imágenes curadas con sus ficheros `.txt` de caption, generados con `keep_tokens = 2` y un formato que empieza por `kyoko_hori, <outfit>`. La distribución por vestuario es: uniforme con chaleco 27 imágenes, uniforme de invierno 29, camiseta deportiva 12 y abrigo con bufanda 10. El autor publica los pesos de las siete épocas y una evaluación comparativa propia (rondas de cribado a 0.8 y matriz de 10 escenas × 4 fuerzas sobre E5, E6 y E7), de la que concluye que E6 a 0.8 ofrece la mejor consistencia de identidad en retrato, cuerpo completo y escena nocturna compleja.

## Capacidades

- Generación de ilustración anime del personaje Kyoko Hori con identidad estable (pelo castaño largo, ojos marrones) mediante el token `kyoko_hori`.
- Control de vestuario mediante tokens dedicados: `kyoko_hori_vest_uniform`, `kyoko_hori_winter_uniform`, `kyoko_hori_sports_shirt`, `kyoko_hori_winter_coat_scarf`.
- Consistencia entre planos: retrato frontal, tres cuartos, perfil, cuerpo completo, sentada y fondos simples o complejos.
- Integración en pipelines SDXL/Illustrious mediante sintaxis de LoRA en el prompt (`<lora:kyoko_hori-000006:0.8>`).
- Compatibilidad declarada con merges de Illustrious y NoobAI, además del checkpoint base recomendado.
- Soporte de prompts en inglés y chino.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo: es exclusivamente un adaptador de generación de imagen.

## Casos de uso

- Ilustración de fan art consistente: usar E6 a 0.8 con el token de identidad y el token de vestuario para obtener al personaje con el mismo rostro en distintas composiciones, apoyándose en la matriz de evaluación publicada para elegir fuerza.
- Series de viñetas o doujinshi corto: mantener `kyoko_hori` fijo y alternar `kyoko_hori_vest_uniform` y `kyoko_hori_winter_uniform` para escenas de interior y exterior sin perder identidad entre paneles.
- Fondos complejos para escenas narrativas: la evaluación del autor incluye una escena de calle nocturna donde E6 conserva la lectura del personaje, lo que sirve para ilustraciones ambientadas.
- Prototipado rápido de personaje en estudio pequeño: al ser un LoRA de unos 456 MB por época, se puede cargar y descargar en ComfyUI sin reentrenar la base, comparando E5, E6 y E7 en la misma sesión.
- Comparación metodológica de épocas: el repositorio conserva los siete checkpoints con sus hojas de evaluación, útil para estudiar sobreajuste y leakage de identidad en LoRAs de personaje.
- Integración en flujos de trabajo con diffusers: al declarar `library_name: diffusers`, el adaptador se puede cargar mediante la API de LoRA de diffusers sobre el pipeline SDXL correspondiente para generación por lotes.
- Referencia para entrenamiento de nuevos personajes: el dataset público y la configuración documentada (rango 64/alpha 32, captions con `keep_tokens = 2`) sirven de plantilla para reproducir el proceso con otro personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor aporta únicamente evaluación cualitativa comparativa entre épocas y fuerzas (hojas de imágenes sin retocar), no métricas cuantitativas como FID, CLIP score o similitud facial.

| Candidato | Resultado observado según el autor | Decisión |
|---|---|---|
| E1 | Identidad correcta (pelo y ojos marrones), rostro más suave | Alternativa temprana |
| E5 | Identidad estable, algo menos asentada que E6 en cuerpo completo | Alternativa |
| E6 | Rostro consistente a 0.6–0.8; la calle nocturna sigue leyéndose como el mismo personaje | Recomendado a 0.8 |
| E7 | Muy cercano a E6; 1.0 no aporta ganancia clara | Alternativa de época final |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un LoRA sobre SDXL, el requisito dominante es el del checkpoint base (no incluido en el repositorio), no el del adaptador.
- Tamaño en disco: 456.495.788 bytes por fichero; repositorio completo de 3,2 GB por incluir las siete épocas.
- GPU recomendadas: el autor generó las imágenes de evaluación en una DGX con ComfyUI; no especifica el modelo de GPU.
- GPU de consumo: no se documenta prueba en tarjetas consumer, por lo que no puede confirmarse qué modelos concretos lo ejecutan con holgura.
- Opciones de despliegue: ComfyUI (usado por el autor), diffusers (librería declarada) y, en general, cualquier runtime que cargue LoRAs SDXL en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de personaje comparables (mismo personaje, mismo modelo base o misma categoría) en los datos proporcionados, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural, frente a un LoRA genérico de estilo, este adaptador se distingue por publicar pesos por época con evaluación comparativa y dataset abierto; frente a un fine-tuning completo de SDXL, su tamaño (unos 456 MB por época) y su naturaleza de adaptador lo hacen mucho más ligero de distribuir y de intercambiar.

| Criterio | KyokoHori-Lora (E6) | LoRA de personaje típico | Fine-tuning completo SDXL |
|---|---|---|---|
| Parametros | Rango 64 / alpha 32 | no disponible | no disponible |
| Contexto | no aplica | no aplica | no aplica |
| Rendimiento | evaluación cualitativa del autor | no disponible | no disponible |
| Licencia | creativeml-openrail-m | variable | variable |
| Disponibilidad | Hugging Face, 7 épocas | variable | variable |

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje y de la obra original pertenecen a sus titulares; el autor lo declara explícitamente como fan-made.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibición de usos dañinos y obligación de propagar las restricciones a los derivados); conviene revisar el texto completo antes de uso comercial.
- Dependencia estricta del modelo base: está entrenado sobre waiIllustriousSDXL v17 y su uso con otros checkpoints SDXL puede degradar la identidad o el estilo.
- Leakage de identidad documentado: sin el token de personaje, a fuerza 0.8 la generación sigue inclinándose hacia este rostro y cabello, lo que puede contaminar prompts genéricos.
- Riesgo de sobreajuste en vestuario: el autor advierte que E7 no mejora a E6 a fuerza 1.0 y que E1 tiene el rostro más suave; usar fuerzas fuera de 0.6–0.8 no está validado.
- Sesgos y alucinaciones: no hay evaluación de sesgos ni de fidelidad anatómica más allá del negative prompt de ejemplo; como todo modelo de difusión, puede producir anatomía incorrecta, manos defectuosas y texto ilegible.
- Idiomas: solo se declaran inglés y chino para los prompts; no hay soporte documentado de castellano.
- Sin datos de benchmarks cuantitativos ni de rendimiento en hardware consumer, lo que limita la planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/KyokoHori-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/KyokoHori-Dataset
- Notas de evaluación en chino: `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
- Modelo base: waiIllustriousSDXL v17 (`waiIllustriousSDXL_v170`), no se proporciona enlace directo en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
