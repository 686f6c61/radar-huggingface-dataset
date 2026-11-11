# handful/fastcello-flux2-klein-4b

## Resumen

FastCello es un LoRA de image-to-image construido sobre el modelo de difusion FLUX.2 klein 4B de Black Forest Labs. Su funcion concreta es transformar renders 3D oblicuos de mapas urbanos en mapas de ciudad con estetica pixel-art calida, preservando la disposicion de calles, edificios y arboles del render original. Lo publica el usuario handful con licencia Apache 2.0 y se distribuye como adaptador para la libreria diffusers.

El adaptador opera sobre la variante destilada de FLUX.2 klein 4B, lo que permite generar una imagen de 1024 px en 4 pasos de inferencia (unos 20 segundos en una RTX 4090), frente a los 28 pasos necesarios con el modelo base. Esta eficiencia lo hace util para pipelines que pintan ciudades completas fotograma a fotograma a partir de mosaicos de render.

El interes actual del modelo es doble: por un lado demuestra el flujo de trabajo de LoRA few-step sobre modelos de difusion destilados con calidad medible (LPIPS 0.40 en 4 pasos frente a 0.39 en 28 pasos); por otro, su model card advierte de una restriccion legal relevante, ya que los datos de entrenamiento provienen de Google Photorealistic 3D Tiles, cuyos terminos no permiten el entrenamiento de modelos con su contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion FLUX.2 klein 4B |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card usa bfloat16) |
| Idiomas soportados | no disponible (el prompt de instancia esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0.0 GB; se carga via `load_lora_weights` en diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 entrenado con el entrenador image-to-image de diffusers para klein, a resolucion de 1024 px, con volteos aleatorios y 2.500 pasos. Se entreno sobre FLUX.2 klein base 4B (la variante no destilada) y despues se aplica sobre el modelo destilado de 4 pasos. Los pares de entrenamiento son renders 3D oblicuos de fotogramas de mapa emparejados con la misma escena pintada en estilo pixel-art calido, generada con Codex (OpenAI). Los datos proceden de Brasilia, Recife, Manaus y Florianopolis.

La innovacion practica es la combinacion de LoRA con un modelo de difusion destilado few-step: el adaptador aprende el estilo sobre el modelo base y se transfiere al destilado sin reentrenar, manteniendo la fidelidad estructural. Para pintar ciudades completas, la model card describe un pipeline que pinta cada fotograma desde una ventana de 1536 px del mosaico de render (el fotograma mas sus vecinos) y conserva solo el centro, de modo que los fotogramas adyacentes encajan sin costuras.

## Capacidades

- Transformacion image-to-image de renders 3D oblicuos de mapas urbanos a pixel-art calido.
- Preservacion de la estructura del render de entrada: calles, edificios y arboles se mantienen en su posicion.
- Estilo consistente: luz calida de media manana, sombras violeta frias, contornos coloreados y copas de arboles en capas.
- Generacion en 4 pasos de inferencia con el modelo destilado, a 1024 px.
- Soporte de prompt de instancia en ingles para controlar el resultado ("Repaint this 3D map render as mgwarm warm pixel-art map...").
- Integracion con el pipeline `Flux2KleinPipeline` de diffusers mediante `load_lora_weights`.
- No soporta texto, codigo, razonamiento, tool calling, agentes ni modalidades de audio; es exclusivamente un modelo de imagen.

## Casos de uso

- Pintado de mapas de ciudad completos a partir de mosaicos de render: el pipeline descrito en la model card pinta cada fotograma con una ventana de 1536 px y conserva el centro para que los fotogramas encajen sin costuras; adecuado para generar mapas de gran extension de forma automatizada.
- Estilizado de mapas para videojuegos y prototipos: convertir renders 3D de un diseno de nivel en mapas pixel-art para documentacion, minimapas o material de presentacion, manteniendo la geometria del diseno original.
- Produccion de ilustraciones para articulos y guias urbanas: el caso documentado (ciudades de Mini World, como Recife o Brasilia) demuestra el uso para ilustrar contenido editorial con una estetica coherente entre imagenes.
- Generacion de assets visuales para proyectos personales y educativos: con licencia Apache 2.0 y pesos ligeros, sirve para experimentar con estilizado pixel-art sin infraestructura dedicada de entrenamiento.
- Investigacion en adaptadores few-step: el LoRA y su registro de entrenamiento (rondas, puntuaciones LPIPS) son utiles para estudiar la transferencia de estilo de un modelo base a su variante destilada.
- Prototipado rapido de pipelines de difusion image-to-image: los 20 segundos por fotograma a 1024 px en RTX 4090 permiten iterar sobre prompts y parametros en sesiones de trabajo cortas.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| LPIPS en tierra (16 fotogramas reservados) | 0.40 | Pintado en 4 pasos, frente a pinturas de Codex (menor es mejor) |
| LPIPS en tierra | 0.39 (global) | Modelo base a 28 pasos, mas lento |
| LPIPS entre dos pintados de Codex (12 fotogramas de tierra) | 0.34 | Techo aproximado de la medida |
| Tiempo de inferencia | ~20 s por fotograma de 1024 px | RTX 4090, 4 pasos |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al ser un LoRA sobre FLUX.2 klein 4B en bfloat16, el requisito corresponde al del modelo base; no se detalla en la model card.
- GPU recomendadas: RTX 4090 (medicion de referencia documentada, ~20 s por fotograma de 1024 px en 4 pasos).
- GPU consumer: el ejemplo de la model card usa explicitamente una RTX 4090; no se confirma compatibilidad con otras GPU consumer.
- Opciones de despliegue: libreria diffusers con `Flux2KleinPipeline` y `load_lora_weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de difusion).
- Latencia y throughput: ~20 s por fotograma de 1024 px en RTX 4090 con el modelo destilado a 4 pasos; sin datos de throughput para lotes o resoluciones mayores.

## Comparativa con modelos similares

No hay datos de benchmarks ni comparativas publicadas en la informacion disponible que permitan contrastar este LoRA con alternativas de la misma categoria o tamano. Los unicos puntos de comparacion internos son las variantes del propio modelo: 4 pasos (LPIPS 0.40) frente a 28 pasos con el modelo base (0.39 global).

## Limitaciones y advertencias

- Agua: en mar abierto y rios anchos el modelo rapido pinta con frecuencia tierra, campos o pequenas aldeas en lugar de agua. El pipeline del autor sustituye el agua pintada por una capa de agua a posteriori.
- Ventanas: las rejillas finas de ventanas en las torres salen menos regulares que en las pinturas de Codex.
- Entrada: funciona mejor con renders similares a los de entrenamiento, es decir, 1024x1024, oblicuidad de unos 30-45 grados y unos 3,4-4 px por metro.
- Licencia y datos: los renders 3D de entrada son de Google Photorealistic 3D Tiles, y los terminos de Google Map Tiles no permiten usar su contenido para entrenar modelos. El autor comparte el LoRA como experimento de investigacion para uso personal y recomienda revisar esos terminos antes de cualquier otro uso, a pesar de la licencia Apache 2.0 del adaptador.
- Sesgos y alucinacion: no se documentan sesgos especificos ni tasas de alucinacion en la model card; el riesgo principal es la sustitucion de agua por tierra descrita arriba.
- Idiomas: el prompt de instancia esta en ingles; no se documenta soporte multilingue.
- Produccion: carece de documentacion de cuantizacion, formato de pesos y compatibilidad con hardware distinto de la RTX 4090; el repositorio figura con un tamano de 0.0 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/handful/fastcello-flux2-klein-4b
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Registro de entrenamiento (rondas y puntuaciones): https://marceloeduardo.com/pixel-lora-training.html
- Proyecto Mini World: https://miniworld.marceloeduardo.com/
