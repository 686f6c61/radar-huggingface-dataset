# bieluu/krea2_realism_lora_v1

## Resumen

El modelo `bieluu/krea2_realism_lora_v1` es un adaptador LoRA de estilo para Krea 2, desarrollado por bieluu, que orienta la generación de texturas PBR base color sin costuras hacia el aspecto de materiales fotografiados reales. Se entrena sobre el modelo base `krea/Krea-2-Raw` y está pensado para aplicarse tanto en la variante RAW como en Turbo, según la model card. Es relevante para artistas 3D, desarrolladores de juegos y estudios que necesiten texturas realistas generadas por IA directamente en flujos ComfyUI.

Se trata de un LoRA con rank 32, alpha 32, sin frase desencadenante, entrenado a 1024 píxeles durante 1500 pasos. El repositorio incluye dos versiones del adaptador: una completa que modifica todos los módulos entrenados y otra reducida solo a los bloques transformer, pensada para aplicarse sobre Turbo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 (modelo de difusión) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | cc0-1.0 |
| Formato de pesos | safetensors (dos variantes: completa y solo bloques) |

## Arquitectura y entrenamiento

El modelo es un LoRA que se aplica sobre Krea 2, un modelo de difusión para generación de imágenes. La model card indica que fue entrenado sobre el modelo base RAW y que está pensado para aplicarse también en la variante Turbo, especialmente mediante la versión `blocks_only`. Los pesos se renombraron desde la exportación PEFT/nativa de fal a los nombres que espera el cargador de Krea 2 de ComfyUI, lo que facilita su integración en ese entorno.

El entrenamiento utilizó 849 teselas de base color derivadas de fotografías CC0 del dataset MatSynth, incluyendo fotogrametría, escaneos y aproximaciones. Se emplearon recortes toroidales de 1024×1024 y reducciones de la hoja completa. Las captions fueron generadas por `gpt-5.6-luna` en el registro "pbrize enhancer". El entrenamiento se realizó con el entrenador `krea-2-trainer` de fal, con 1500 pasos a resolución 1024, learning rate 5e-4 y rank 32 / alpha 32. No se usó frase desencadenante.

## Capacidades

- Generación de texturas PBR base color sin costuras con aspecto de material fotografiado real.
- Mejora del realismo en retratos y personajes: texturas de piel, anatomía humana y detalles de ropa más naturales, según la información publicada.
- Resultados consistentes en diversidad de etnias, edades y tipos de cuerpo.
- No requiere frase desencadenante (no trigger word), lo que simplifica su uso en prompts.
- Compatible con ComfyUI mediante el cargador de Krea 2, con las claves ya adaptadas.
- Incluye dos variantes: una completa con todos los módulos entrenados y otra solo con bloques transformer para su uso en Turbo.
- No es un modelo de lenguaje: no admite tool calling, generación de texto ni razonamiento multilingüe.

## Casos de uso

- Texturizado PBR para assets 3D: el modelo puede generar mapas base color sin costuras de materiales como madera, piedra, tela o metal, partiendo de referencias fotográficas CC0. Es adecuado para acelerar la creación de texturas en DCC como Blender o Substance.
- Creación de materiales para videojuegos: permite producir variaciones realistas de texturas para motores como Unreal o Unity, reduciendo el tiempo de escaneo o pintado manual de superficies.
- Retratos fotorrealistas: se puede usar para generar retratos de personajes con piel, anatomía y ropa más creíbles, sin necesidad de prompts complejos ni de palabras clave adicionales.
- Visualización arquitectónica: el LoRA ayuda a generar texturas de superficies para renders de interiores y exteriores, aportando un acabado de material fotografiado que mejora la presentación de proyectos.
- Diseño de producto: permite simular acabados de materiales como metal, cerámica o cuero, útiles para prototipos y presentaciones comerciales.
- Prototipado de fotografía simulada: se puede emplear para crear imágenes con aspecto de fotografía real en moodboards, concept art o pruebas de dirección de arte.
- Integración en pipelines ComfyUI: al estar adaptado al cargador de Krea 2, se puede incorporar en flujos de generación por lotes para producción de texturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Krea 2 y del backend utilizado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende de los requisitos de Krea 2.
- Opciones de despliegue: ComfyUI con el cargador de Krea 2, diffsusers tras adaptar las claves, y el entrenador de fal para reproducción.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Existen otros LoRA para Krea 2, como `bieluu/krea2_realistic_lora_comfy`, pero no se han publicado especificaciones ni benchmarks.

## Limitaciones y advertencias

- Entrenado únicamente con 849 muestras de MatSynth, por lo que puede presentar generalización limitada a ciertos materiales o superficies.
- La variante completa incluye proyecciones de texto y de imagen/tiempo que pueden no ser óptimas en Turbo; se recomienda usar `krea2_realism_v1_blocks_only.safetensors` en ese caso.
- El modelo base Krea 2 tiene su propia licencia, no detallada en la información disponible. Debe revisarse antes de cualquier uso comercial.
- Riesgo de alucinación en texturas: puede generar materiales inexistentes o patrones incorrectos, especialmente con prompts ambiguos.
- No se han publicado evaluaciones de sesgos ni análisis de calidad en la información disponible.
- No es un modelo de lenguaje ni soporta tareas de razonamiento, tool calling o generación de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bieluu/krea2_realism_lora_v1
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Artículo sobre LoRA de Krea 2: https://www.stablediffusiontutorials.com/2026/06/krea2-lora-models.html
- Modelo similar en HuggingFace: https://huggingface.co/bieluu/krea2_realistic_lora_comfy
