# DeVilDoNia/HaDeS-MOSS-v0.9.4-Turbo

## Resumen

HaDeS-MOSS-v0.9.4-Turbo es un checkpoint de difusion texto-a-imagen de un solo archivo, derivado de OpenMOSS-Team/MOSS-Image-Base, publicado por el usuario DeVilDoNia (firmado como HaDeS) para su uso en ComfyUI. El modelo incorpora tres LoRA fusionados directamente en los pesos de difusion, de modo que no requiere ningun LoRA Turbo adicional para funcionar. Esta disenado para generar imagenes con solo ocho pasos de muestreo, lo que reduce drasticamente el coste computacional frente a los flujos de difusion convencionales de 20 a 50 pasos.

El checkpoint se distribuye en BF16 con un tamano de 10,16 GB (9,47 GiB) en formato safetensors de archivo unico, y solo contiene el modelo de difusion: no incluye el codificador de texto MOSS ni el VAE, que deben cargarse por separado desde Comfy-Org/MOSS-Image. La licencia es Apache 2.0 y el pipeline declarado es text-to-image.

Es relevante ahora porque representa un caso de ajuste comunitario sobre un modelo base reciente (MOSS-Image), orientado a la inferencia rapida en entornos de produccion grafica, con un sucesor ya publicado (v1.0 Turbo) que corrige parcialmente el sesgo etnico documentado en esta version. El autor deja claro que no es una mejora universal sobre MOSS-Image-SFT, sino una eleccion de renderizado distinta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (MOSS-Image), ajustado con LoRA fusionados; no se detalla la variante interna (DiT u otra) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (texto-a-imagen); longitud de prompt no especificada |
| Tipos de cuantizacion | BF16 en el archivo publicado; no se documentan otras variantes |
| Idiomas soportados | no disponible (el prompt se procesa mediante el codificador Qwen3.5-9B, pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors de archivo unico (diffusion-single-file), 10,16 GB (9,47 GiB) |

## Arquitectura y entrenamiento

El modelo parte de MOSS-Image-Base en BF16 y se construye mediante la fusion secuencial de tres LoRA en los pesos de difusion: `data_expanded.safetensors` (fuerza 0,30), `HaDeS_MOSS_color_detailer_v0.2.safetensors` (fuerza 0,60, a su vez una fusion de dos LoRA de color y detalle con pesos internos de 0,6 y 0,75) y `HaDeS-MOSS-BeTa-Turbo-8steps-v0.9.safetensors` (fuerza 1,00, LoRA Turbo del autor no publicado, cuya cabecera declara `steps: 4` aunque el checkpoint se evalua a ocho pasos). El flujo de guardado documentado es MOSS-Image-Base BF16, MOSS Multi-LoRA y MOSS Model Saver.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que se trata de un ajuste por LoRA sobre un modelo base existente. La innovacion principal es la incorporacion del comportamiento Turbo directamente en los pesos, lo que permite generar a ocho pasos con CFG 1,0 sin cargar un LoRA separado. El autor documenta que el rango util medido va de 6 a 50 pasos sin roturas de imagen, y que cada numero de pasos produce una composicion distinta en lugar de refinar progresivamente la de ocho pasos.

## Capacidades

- Generacion de imagenes texto-a-imagen con muestreo de ocho pasos como referencia medida.
- Renderizado de escenas complejas: retratos (relojero anciano, montanero, vendedora de flores), interiores (observatorio lunar), bodegones y escenas urbanas nocturnas.
- Resolucion de referencia de 1152 x 1536, con otras resoluciones posibles aunque no evaluadas.
- Control de detalle y color mediante los LoRA fusionados de color y detalle.
- Compatibilidad con el ecosistema ComfyUI a traves de cargadores MOSS.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio, por tratarse de un modelo de generacion de imagen.
- Capacidad multilingue del prompt no declarada explicitamente; depende del codificador Qwen3.5-9B.

## Casos de uso

- Generacion rapida de ilustraciones en produccion: con ocho pasos y aproximadamente 4 segundos por imagen en una RTX 5090 a 1152 x 1536, el modelo es adecuado para pipelines que necesitan throughput alto con coste por imagen bajo.
- Creacion de arte conceptual en estudios de diseno: la combinacion de LoRA de color y detalle permite generar variaciones de escenas con control de paleta y textura, util para iterar sobre bocetos antes de un render final.
- Prototipado de assets para videojuegos: escenas de interiores, paisajes y retratos generados a resolucion 1152 x 1536 sirven como referencia para texturizado o como base de concept art.
- Generacion de imagenes para publicaciones y blogs: el flujo de ocho pasos con CFG 1,0 encaja en entornos donde la latencia importa, como la generacion de cabeceras o ilustraciones editoriales bajo demanda.
- Automatizacion de catalogos visuales: bodegones y escenas de producto (el ejemplo de frutas citricas y jarra de cristal) pueden producirse en lote con semillas fijas y verificacion por checksum, lo que facilita la reproducibilidad.
- Experimentacion en investigacion de difusion: al ser un checkpoint de archivo unico con pesos BF16 y hash SHA-256 documentado, resulta util para reproducir experimentos de ajuste por LoRA o de reduccion de pasos de muestreo.
- Integracion en flujos ComfyUI personalizados: mediante el HaDeS MOSS Suite (MOSS Loader, MOSS Prompt Enhancer, MOSS Latent, MOSS KSampler) se puede encadenar con otros nodos para postprocesado o composicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor aporta mediciones de inferencia y evaluaciones cualitativas:

| Medicion | Valor |
|---|---|
| Tiempo por imagen a 8 pasos (RTX 5090, 1152 x 1536) | ~4 s |
| Tiempo por imagen a 20 pasos | ~9,5 s |
| Tiempo por imagen a 50 pasos | ~23 s |
| Rango de pasos sin rotura de imagen (CFG 1) | 6 a 50 |
| CFG maximo probado sin rotura a 20 pasos | 3 |
| Coste relativo de subir CFG de 1 a 2 a 8 pasos | ~1,8x en tiempo, mayor saturacion y oscurecimiento |
| Sesgo etnico en prompt "a woman sitting in a café" (16 semillas, 8 pasos) | ~9-11 de 16 rostros de Asia Oriental, frente a ~2-4 en MOSS-Image-Base a 25 pasos |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo BF16 pesa 10,16 GB, por lo que se necesita al menos esa cantidad mas el codificador de texto Qwen3.5-9B en INT8 y el VAE; no se documenta una cifra total de VRAM.
- GPU recomendadas: RTX 5090 es la unica GPU con mediciones publicadas (4 s a 8 pasos, 1152 x 1536). Por tamano, cabria esperar compatibilidad con GPU de 24 GB o mas, aunque no se confirma en la informacion disponible.
- Cabe en GPU de consumo: si, segun las mediciones en RTX 5090; no se documentan pruebas en otras GPU de consumo.
- Opciones de despliegue: ComfyUI 0.43.0 con cargador compatible con MOSS (medido con MOSS Loader del HaDeS MOSS Suite); requiere el codificador `qwen3.5_9b_int8_convrot.safetensors` y el VAE `flux2-vae.safetensors` de Comfy-Org/MOSS-Image.
- Latencia y throughput: aproximadamente 4 s por imagen a 8 pasos en RTX 5090; el throughput por lote no se documenta.

## Comparativa con modelos similares

| Modelo | Base | Pasos de referencia | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| HaDeS-MOSS-v0.9.4-Turbo | MOSS-Image-Base | 8 | safetensors unico BF16, 10,16 GB | Apache 2.0 | Sesgo etnico ~9-11/16 en prompt neutro de cafe |
| HaDeS-MOSS-v1.0-Turbo | MOSS-Image-Base | no disponible | no disponible | Apache 2.0 | Sucesor del autor; sesgo ~1/16 en el mismo prompt |
| MOSS-Image-SFT | MOSS-Image | no disponible | no disponible | no disponible | Alternativa de renderizado; el autor no afirma superioridad universal |
| MOSS-Image-Base | - | 25 | no disponible | no disponible | Modelo base; sesgo etnico ~2-4/16 en el mismo prompt |

No se dispone de datos de benchmarks comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo etnico documentado: ante el prompt "a woman sitting in a café" sin etnia especificada, genera aproximadamente 9-11 de 16 rostros de Asia Oriental, frente a 2-4 del modelo base. Se recomienda nombrar la apariencia en el prompt cuando sea relevante; el autor no ha verificado aun si este modelo respeta una etnia explicita como si hacen Base y SFT.
- No incluye codificador de texto ni VAE: requiere archivos complementarios externos (Qwen3.5-9B INT8 y flux2-vae) para funcionar.
- El LoRA Turbo fusionado declara `steps: 4` en su cabecera, pero el checkpoint se evalua a ocho pasos; existe una discrepancia no resuelta por el autor.
- El numero de pasos no refina la imagen de ocho pasos: cada conteo produce una composicion distinta, lo que puede complicar la reproducibilidad si no se fija semilla y pasos.
- Subir CFG por encima de 1 aumenta saturacion, oscurece la imagen y duplica el tiempo por paso; CFG 1,0 es un punto de partida reproducible, no un optimo estetico universal.
- Solo se han medido tiempos en RTX 5090 y a 1152 x 1536; el rendimiento en otras GPU y resoluciones no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en dominios sensibles.
- Existe una version mas reciente (v1.0 Turbo) con menor sesgo etnico en la prueba citada; esta version se mantiene disponible pero no es la recomendada por el autor.
- Riesgo de alucinacion visual y de composiciones incorrectas en escenas con texto o detalles finos: el autor documenta que un cartel corto solo salio correcto a partir de 12 pasos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-v0.9.4-Turbo
- Version sucesora: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-v1.0-Turbo
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Archivos complementarios (codificador de texto y VAE): https://huggingface.co/Comfy-Org/MOSS-Image
- Repositorio HaDeS MOSS Suite: https://github.com/Devildonia/HaDeS-MOSS-Suite
- Registro de mediciones: https://github.com/Devildonia/HaDeS-MOSS-Suite/blob/main/tools/RESULTS.md
- Manifiesto de semillas y checksums: assets/manifest.json (dentro del repositorio del modelo)
- Paper referenciado en tags: arXiv:2610.23374 (no verificado en la informacion disponible)
