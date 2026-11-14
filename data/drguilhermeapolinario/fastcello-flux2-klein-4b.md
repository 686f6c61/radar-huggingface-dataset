# drguilhermeapolinario/fastcello-flux2-klein-4b

## Resumen

FastCello es un LoRA de image-to-image construido sobre el modelo de difusion FLUX.2 klein 4B de Black Forest Labs. Su funcion es transformar renders de mapas 3D oblicuos en mapas de ciudad con estetica pixel-art calida, preservando la disposicion de carreteras, edificios y arboles del render original. El adaptador lo publica el usuario drguilhermeapolinario y se distribuye con licencia Apache 2.0.

El modelo resuelve un problema muy concreto: convertir la salida de un motor de mapas 3D (en este caso renders de Google Photorealistic 3D Tiles) en ilustracion pixel-art coherente y sin costuras entre fotogramas. Esta pensado para el pipeline del videojuego Mini World, donde se han pintado ciudades como Brasilia, Recife, Manaus, Florianopolis, Fortaleza, Joao Pessoa, Belem, Sao Luis y Sao Paulo.

Tecnicamente es un LoRA de rango 16 entrenado a 1024 px sobre pares (render 3D oblicuo, pintura pixel-art generada por Codex). Se aplica sobre el modelo destilado de 4 pasos de FLUX.2 klein 4B, lo que permite generar un fotograma de 1024 px en unos 20 segundos en una RTX 4090. El repositorio esta practicamente vacio en el momento de la consulta (0.0 GB, 0 descargas), por lo que la informacion disponible procede casi exclusivamente de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer de difusion FLUX.2 klein 4B |
| Parametros totales | no disponible (el LoRA es un adaptador; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card usa bfloat16) |
| Idiomas soportados | no disponible (modelo de imagen; el prompt de instancia esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA para diffusers (no se especifica safetensors de forma explicita) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 sobre el modelo base FLUX.2 klein 4B, un transformer de difusion de 4 mil millones de parametros. El entrenamiento se realizo con el entrenador de LoRA image-to-image de diffusers para klein, a resolucion de 1024 px, con volteos aleatorios y 2500 pasos. Los pares de entrenamiento consisten en un render 3D oblicuo de un fotograma de mapa y la misma imagen repintada con el estilo pixel-art calido por Codex (generacion de imagen de OpenAI). Los datos de entrenamiento cubren fotogramas de Brasilia, Recife, Manaus y Florianopolis.

La innovacion principal es el uso combinado de un LoRA entrenado sobre el modelo base y su aplicacion en inferencia sobre la variante destilada de 4 pasos. Segun la model card, el LoRA se entrena sobre FLUX.2 klein base 4B y luego se usa sobre el modelo destilado de 4 pasos, lo que reduce drasticamente el coste de inferencia (unos 20 s por fotograma de 1024 px en una RTX 4090). Para mapas completos, el pipeline pinta cada fotograma a partir de una ventana de 1536 px del mosaico de render (el fotograma mas sus vecinos) y conserva el centro, de modo que los fotogramas adyacentes encajan sin costuras. El prompt de instancia recomendado es: "Repaint this 3D map render as mgwarm warm pixel-art map, keeping every road, building and tree in place".

## Capacidades

- Traduccion image-to-image de renders 3D oblicuos a pixel-art con paleta calida: luz de media manana, sombras violeta frias, contornos coloreados y copas de arboles en capas.
- Preservacion de la estructura del mapa de entrada: carreteras, edificios y arboles se mantienen en su posicion segun el prompt de instancia.
- Generacion en 4 pasos de inferencia con el modelo destilado, con `guidance_scale=1.0`.
- Trabajo por mosaico: pintado de ciudades completas fotograma a fotograma con ventana solapada de 1536 px para evitar costuras.
- Estilizacion consistente entre fotogramas de una misma ciudad, gracias al entrenamiento sobre multiples ciudades.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- Capacidades multilingues: no disponibles; el prompt de instancia esta en ingles y no se documenta soporte de otros idiomas.

## Casos de uso

- Produccion de mapas para videojuegos: pintar automaticamente los fotogramas de un mapa 3D renderizado (estilo Mini World) para obtener tiles pixel-art coherentes entre si, usando la ventana solapada de 1536 px para que no aparezcan costuras.
- Prototipado rapido de estetica: evaluar en minutos como quedaria un nivel o ciudad con un look pixel-art calido antes de encargar arte manual, gracias a los 4 pasos de inferencia y los ~20 s por fotograma en RTX 4090.
- Generacion de assets para mapas estaticos: producir ilustraciones de ciudad para pantallas de carga, menus o documentacion a partir de renders 3D existentes.
- Estilizacion de capturas de mapas reales: convertir renders de Google Photorealistic 3D Tiles de una ciudad concreta en una version ilustrada, util para visualizaciones o material promocional (con las reservas de licencia indicadas mas abajo).
- Pipeline de arte por lotes: integrar el LoRA en un script de diffusers que recorra un mosaico de renders y genere la ciudad completa de forma desatendida, con semilla fija para reproducibilidad.
- Experimentacion en investigacion de adaptadores: servir como ejemplo reproducible de LoRA image-to-image entrenado sobre un modelo base y aplicado sobre su variante destilada de pocos pasos, con log de entrenamiento publico.

## Benchmarks y rendimiento

La model card solo reporta una metrica de similitud perceptiva (LPIPS) frente a las pinturas de referencia generadas por Codex, sobre 16 fotogramas reservados. No se publican resultados de benchmarks estandar de generacion de imagen.

| Metrica | Resultado | Contexto |
|---|---|---|
| LPIPS en tierra (4 pasos) | 0.40 | Inferencia rapida sobre el modelo destilado |
| LPIPS global (28 pasos, modelo base) | 0.39 | Inferencia lenta sobre el modelo base |
| LPIPS entre dos pinturas de Codex | 0.34 | Techo aproximado de la metrica (12 fotogramas de tierra) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base FLUX.2 klein tiene 4B parametros y la model card usa `torch_dtype=torch.bfloat16` en CUDA. Como referencia orientativa, un transformer de difusion de 4B en bfloat16 requiere del orden de 8-10 GB solo para los pesos, mas el VAE y el text encoder.
- GPU recomendadas: RTX 4090 segun la model card (unos 20 s por fotograma de 1024 px en 4 pasos). Para el modelo base a 28 pasos se necesita mas tiempo y VRAM; no se documentan cifras.
- Cabe en GPU de consumo: si, al menos en RTX 4090 con el modelo destilado; no se confirma para GPUs con menos VRAM.
- Opciones de despliegue: diffusers con `Flux2KleinPipeline` y `load_lora_weights` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: ~20 s por fotograma de 1024 px en RTX 4090 con 4 pasos; no se documenta throughput por lotes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada. Como referencia estructural, el unico punto de comparacion documentado es el propio modelo base:

| Modelo | Parametros | Enfoque | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastCello (este LoRA) | adaptador sobre 4B | image-to-image pixel-art | 4 (destilado) | Apache 2.0 | Hugging Face |
| FLUX.2 klein 4B (base) | 4B | text/image-to-image general | 28 (segun model card) | no disponible en esta ficha | Hugging Face (Black Forest Labs) |

No se han identificado en la informacion disponible otros LoRA o modelos comparables de estilizacion pixel-art de mapas 3D.

## Limitaciones y advertencias

- Agua: en mar abierto y rios anchos el modelo rapido pinta a menudo tierra, campos o pequenas aldeas en lugar de agua. El pipeline del autor sustituye el agua pintada por una capa de agua posterior; LoRAs posteriores del mismo autor corrigen esto dentro del modelo.
- Ventanas: las rejillas finas de ventanas en las torres salen menos regulares que en las pinturas de referencia de Codex.
- Entrada: funciona mejor con renders similares a los de entrenamiento, es decir, 1024x1024, oblicuidad de 30-45 grados y 3.4-4 px por metro.
- Datos de entrenamiento: los renders 3D de entrada son de Google Photorealistic 3D Tiles, y los terminos de Google Map Tiles no permiten usar su contenido para entrenar modelos. El autor comparte el LoRA como experimento de investigacion para uso personal y recomienda revisar esos terminos antes de cualquier otro uso.
- Las pinturas objetivo se generaron con Codex (generacion de imagen de OpenAI), lo que puede introducir sesgos estilisticos y de contenido heredados de ese sistema.
- Licencia: el LoRA se declara Apache 2.0, pero las restricciones sobre los datos de entrenamiento (terminos de Google) pueden limitar el uso comercial con independencia de la licencia del adaptador.
- Riesgo de alucinacion visual: el modelo puede inventar o eliminar elementos del mapa (edificios, arboles, agua) al no existir una garantia estricta de preservacion de la estructura.
- No es un LLM: no soporta texto, tool calling ni agentes; cualquier uso en ese sentido queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drguilhermeapolinario/fastcello-flux2-klein-4b
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Log de entrenamiento y rondas: https://marceloeduardo.com/pixel-lora-training.html
- Proyecto Mini World: https://miniworld.marceloeduardo.com/
- Documentacion de diffusers (libreria usada): https://github.com/huggingface/diffusers
