# BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy-v2

## Resumen

LTX-2.5 22B Distilled NVFP4 ComfyUI-ready V2 es una versión cuantizada a 4 bits (NVFP4) del transformer de difusión LTX-2.5 de Lightricks, preparada específicamente para cargarse en ComfyUI. El autor, BennyDaBall, ha añadido marcadores `.comfy_quant` por capa al export oficial de Lightricks, que originalmente fallaba al cargar en ComfyUI con un error de forma en `mat2`. Esta versión V2 restaura además el soporte de keyframes (`keyframes_abs_pos_embedding`), que se había perdido en el re-export oficial del 16 de agosto de 2026.

El modelo base es Lightricks/LTX-2.5, un modelo de generación de vídeo de 22 000 millones de parámetros, destilado y con capacidad para texto-a-vídeo, imagen-a-vídeo y puente entre keyframes. La cuantización NVFP4 reduce el peso del archivo a 18,7 GB, unos 3 GB menos que la versión int8 oficial (21,5 GB), manteniendo una calidad visual similar según las pruebas del autor. Está pensado para usuarios de ComfyUI que quieran ejecutar LTX-2.5 en GPUs de consumo con requisitos de VRAM reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (basado en Lightricks/LTX-2.5) |
| Parametros totales | 22 000 millones (22B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | NVFP4 (4 bits); existe version int8 oficial de Lightricks |
| Idiomas soportados | No disponible |
| Licencia | ltx-2.x-community-license |
| Formato de pesos | safetensors (diffusion single file) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion NVFP4 del transformer de difusion LTX-2.5 de Lightricks, que genera video a partir de texto, imagenes o keyframes. El archivo contiene 7.877 tensores, de los cuales 1.176 capas cuantizadas llevan el marcador `{"format": "nvfp4"}` necesario para que ComfyUI interprete correctamente los pesos FP4 empaquetados. El autor no modifica los pesos ni las escalas, solo anade los marcadores de cuantizacion por capa.

No se dispone de informacion detallada sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF o DPO). Se sabe que es una version destilada (distilled) de LTX-2.5, lo que implica un proceso de destilacion para reducir el coste de inferencia. La cuantizacion NVFP4 es posterior al entrenamiento y no requiere reentrenamiento.

## Capacidades

- Generacion de video texto-a-video (t2v) a resoluciones de hasta 1920x1088 con audio nativo.
- Generacion de video imagen-a-video (i2v) a partir de una imagen inicial.
- Puente entre keyframes (flf2v): dadas una primera y una ultima imagen, el modelo genera los fotogramas intermedios manteniendo identidad, vestuario y escenario.
- Soporte de audio nativo en el video generado (mencionado en las pruebas del autor).
- Integracion directa con ComfyUI mediante `UNETLoader` en los grafos de plantilla LTX-2.5.
- Compatible con SageAttention 3 para acelerar la atencion durante la inferencia.

## Casos de uso

- Previsualizacion de escenas para produccion audiovisual: un director puede generar un clip de 5-10 segundos a 1280x736 o 1920x1088 a partir de un prompt de texto para evaluar la composicion, iluminacion y movimiento antes de rodar.
- Animacion de storyboards con keyframes: el artista dibuja el primer y ultimo fotograma de una secuencia y el modelo rellena los intermedios, manteniendo la coherencia de personajes y decorados.
- Creacion de contenido para redes sociales: generacion rapida de clips cortos con audio para plataformas como TikTok o Instagram Reels, sin necesidad de equipos de captura.
- Prototipado de ideas para videojuegos: los disenadores pueden generar cinemáticas aproximadas a partir de prompts para comunicar la intencion artistica al equipo.
- Generacion de material de relleno para edicion: el modelo puede crear transiciones o clips de ambiente que se intercalan en una edicion de video existente.
- Pruebas de concepto para clientes en agencias de publicidad: se genera un video de muestra a partir de un brief textual para validar la direccion creativa antes de la produccion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona mediciones de tiempo de inferencia en una RTX 5090 con ComfyUI 0.33:

- Texto-a-video a 1920x1088 con audio nativo: aproximadamente 70 segundos (incluyendo carga en frio).
- Puente de keyframes (flf2v) de 5 segundos a 1280x736: aproximadamente 55 segundos con SageAttention 3.

No hay datos comparativos con otros modelos de generacion de video.

## Requisitos de hardware

- Verificado en una RTX 5090 (32 GB VRAM) con ComfyUI 0.33.
- El archivo pesa 18,7 GB, por lo que se recomienda una GPU con al menos 24 GB de VRAM para cargar el modelo y generar video sin intercambio a memoria del sistema.
- GPUs compatibles: RTX 4090 (24 GB), RTX 5090 (32 GB), A6000 (48 GB) o superiores. En GPUs con menos VRAM podria ser necesario usar cuantizaciones mas agresivas o reducir la resolucion de salida.
- Opciones de despliegue: ComfyUI (principal), con soporte para SageAttention 3. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de difusion, no un LLM.
- Latencia estimada: 55-70 segundos por clip de 5-10 segundos en RTX 5090, dependiendo de la resolucion y el uso de SageAttention.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano archivo | Keyframes | Compatibilidad ComfyUI |
|---|---|---|---|---|---|
| LTX-2.5 22B Distilled NVFP4 V2 (este) | 22B | NVFP4 (4 bits) | 18,7 GB | Si | Si (con marcadores anadidos) |
| LTX-2.5 22B Distilled NVFP4 V1 | 22B | NVFP4 (4 bits) | ~18,7 GB | No | Si (con marcadores anadidos) |
| LTX-2.5 22B Distilled int8 oficial | 22B | int8 | 21,5 GB | Si | No (falla al cargar) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de generacion de video comparables en la informacion proporcionada. La ventaja principal de esta version frente a la int8 oficial es que funciona en ComfyUI y pesa unos 3 GB menos, con una calidad visual similar segun las pruebas del autor.

## Limitaciones y advertencias

- Es una cuantizacion de 4 bits: puede haber una ligera perdida de calidad respecto al modelo original en precision completa, aunque el autor indica que los resultados son "similares y cercanos, no identicos" a la version int8.
- La licencia es `ltx-2.x-community-license`, que es una licencia comunitaria de Lightricks. Es necesario revisar los terminos completos en el archivo LICENSE.txt para confirmar si permite uso comercial y que restricciones impone.
- Depende de ComfyUI: el modelo esta disenado para cargarse con `UNETLoader` en ComfyUI. No se garantiza su funcionamiento en otros entornos de inferencia.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma del modelo base. Al ser un modelo de video, los riesgos de alucinacion se manifiestan en la generacion de contenido visual incoherente o no deseado.
- El autor es un miembro de la comunidad, no Lightricks. Este repositorio es un arreglo no oficial del export de Lightricks, por lo que no hay garantia de soporte a largo plazo.
- La generacion de video es computacionalmente intensiva: incluso con cuantizacion 4 bits, se necesita una GPU de gama alta para tiempos de inferencia razonables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy-v2
- Version V1 (sin keyframes): https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy
- Modelo base Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy-v2/blob/main/LICENSE.txt
