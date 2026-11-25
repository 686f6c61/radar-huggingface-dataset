# mohammadareebqazi/GameScrub

## Resumen

GameScrub es un adaptador LoRA de tipo IC-LoRA (in-context LoRA) disenado para eliminar el HUD (interfaz superpuesta) de videos de gameplay. Lo desarrolla el usuario mohammadareebqazi y se construye sobre el modelo de video LTX-2.5 de Lightricks, un transformer de difusion de 22B parametros en version destilada. El modelo resuelve un problema concreto de postproduccion: limpiar elementos como minimapas, barras de salud, subtitulos, marcadores o avisos en pantalla sin necesidad de mascaras, cajas delimitadoras ni anotaciones manuales.

La relevancia del modelo radica en su enfoque de video-a-video sin condiciones auxiliares: basta con entregar el clip original y el modelo genera el clip limpio. Esto simplifica enormemente flujos de trabajo que tradicionalmente requerian segmentacion o inpainting guiado. El repositorio contiene unicamente el LoRA (1,3 GB), mientras que el modelo base debe descargarse por separado desde el repositorio oficial de Lightricks, que esta sujeto a acceso restringido.

El modelo se publico en noviembre de 2026 y, aunque tiene un numero muy bajo de descargas y likes, representa un caso de uso especializado y bien documentado dentro del ecosistema de generacion de video open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IC-LoRA sobre transformer de difusion de video LTX-2.5 (22B, destilado) |
| Parametros totales | No disponible para el LoRA; el modelo base tiene 22B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base es de video; ventana de frames de 8k+1, 145 frames por defecto) |
| Tipos de cuantizacion | No disponible (pesos del LoRA en safetensors; el base se distribuye en bf16) |
| Idiomas soportados | No disponible |
| Licencia | ltx-2.x-community-license-agreement |
| Formato de pesos | safetensors (LoRA); el base incluye safetensors bf16 para transformer, text encoder y VAE |

## Arquitectura y entrenamiento

GameScrub es un LoRA de adaptacion de bajo rango aplicado sobre el modelo de difusion de video LTX-2.5. El pipeline de inferencia es de dos etapas: la primera genera a 640x352 con 8 pasos de denoising, se aplica un upsampler espacial latente x2 y la segunda etapa refina a 1280x704 con 3 pasos. La particularidad del LoRA es que se aplica tanto en la etapa 1 como en la etapa 2, junto con el video de referencia, a diferencia del pipeline IC-LoRA por defecto de LTX-2 que solo lo aplica en la primera etapa.

El modelo base LTX-2.5 es un transformer de difusion de 22B parametros en version destilada, con un text encoder Gemma4-12B con proyeccion, VAE de video y VAE de audio. El LoRA se entreno con un prompt fijo ("Remove the game HUD overlay from this footage, revealing the clean underlying gameplay video.") y con clips de 145 frames a 30 fps. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Eliminacion de HUD en videos de gameplay sin mascaras, cajas ni leyendas.
- Manejo de elementos HUD estaticos (minimapa, estado del jugador, objetivos, habilidades).
- Manejo de marcadores que se mueven con la escena y de avisos que aparecen y desaparecen.
- Generacion de video-a-video con preservacion del fondo subyacente.
- Procesamiento por chunks para videos mas largos que la ventana de entrenamiento (145 frames, con carry de 25 frames).
- Salida de video con audio (el pipeline base incluye VAE de audio).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Limpieza de gameplay para montajes profesionales: eliminar el HUD de grabaciones antes de insertarlas en trailers o videos de analisis, sin trabajo manual de rotoscopia.
- Creacion de material de archivo limpio: generar clips sin interfaz para bancos de video o stock de gameplay.
- Entrenamiento de modelos de vision: producir datasets de video de juegos sin HUD para tareas de deteccion de escena o estimacion de profundidad.
- Postproduccion de contenido para creadores: limpiar clips de partidas para tutoriales o resumenes donde el HUD distrae.
- Investigacion en inpainting de video: usar el modelo como referencia o baseline en tareas de eliminacion de overlays.
- Generacion de material para doblaje o localizacion: obtener video limpio sobre el que superponer una interfaz nueva o subtitulos en otro idioma.
- Prototipado de pipelines de restauracion de video: integrar el LoRA en flujos de dos etapas con upscaling latente para produccion a 1280x704.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 200 clips (100 sinteticos con HUD renderizado y 100 reales):

| Metrica | Global | Sintetico | Real |
|---|---|---|---|
| Eliminacion de HUD (%) ↑ | 92,0 | 93,9 | 90,1 |
| Eliminacion ajustada por artefactos (%) ↑ | 77,1 | 82,2 | 72,0 |
| Preservacion del fondo (%) ↑ | 95,3 | 98,3 | 92,3 |
| LPIPS de fondo ↓ | 0,140 | 0,132 | 0,148 |
| MAE de fondo (0-255) ↓ | 5,57 | 5,47 | 5,66 |
| Reduccion por detector de HUD (%) ↑ | 94,3 | 97,3 | 91,2 |

Las metricas de eliminacion, eliminacion ajustada y preservacion del fondo fueron evaluadas por un juez LLM. LPIPS y MAE comparan el fondo. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: se requiere una GPU de 80 GB (A100 80GB o H100) segun el autor.
- El modelo base completo incluye transformer de 42 GB, text encoder de 26 GB, VAE de video de 1,5 GB, VAE de audio de 0,4 GB y upsampler de 1 GB, lo que justifica el requisito de memoria.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en la configuracion documentada.
- Despliegue mediante el pipeline `ltx_pipelines.ic_lora.ICLoraPipeline` del repositorio LTX-2 (commit c1b4675).
- No se documentan opciones de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScrub (este) | IC-LoRA sobre LTX-2.5 | 22B (base) | 145 frames por chunk | ltx-2.x-community | Hugging Face, acceso al base restringido |
| LTX-2.5 base | Difusion de video | 22B | No disponible | ltx-2.x-community | Hugging Face, gated |
| Otros LoRA de video-inpainting | LoRA sobre modelos de video | No disponible | No disponible | Variable | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere una GPU de 80 GB, lo que limita su uso a entornos de investigacion o produccion con hardware de gama alta.
- El prompt de inferencia debe usarse sin cambios, ya que es el que se empleo en el entrenamiento; modificarlo puede degradar los resultados.
- La entrada debe convertirse previamente a 30 fps; no hay conversion de frame rate en el pipeline.
- Los frames se redimensionan y recortan al centro a 1280x704, lo que puede perder informacion en bordes.
- `num_frames` debe ser 8k+1; para videos largos hay que usar configuracion de chunks con solapamiento de 25 frames.
- El repositorio solo contiene el LoRA; el modelo base esta sujeto a terminos y acceso restringido en Lightricks/LTX-2.5.
- La licencia ltx-2.x-community-license-agreement impone restricciones que deben revisarse antes de uso comercial.
- Riesgo de artefactos en zonas complejas: la eliminacion ajustada por artefactos baja al 72,0 % en clips reales frente al 82,2 % en sinteticos.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion especificos; al ser un modelo de video, el riesgo principal es la generacion de contenido visual inconsistente.
- El numero de descargas y likes es muy bajo, por lo que la validacion comunitaria es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohammadareebqazi/GameScrub
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio LTX-2: https://github.com/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
