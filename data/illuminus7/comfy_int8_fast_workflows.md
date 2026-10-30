# Illuminus7/Comfy_Int8_Fast_Workflows

## Resumen

Illuminus7/Comfy_Int8_Fast_Workflows no es un modelo con pesos, sino una coleccion de workflows de ejemplo para ComfyUI creada por Illuminus7. Los workflows estan disenados para accompanying al node pack [ComfyUI-AppleSilicon-int8-Fast](https://github.com/Illuminus7/ComfyUI-AppleSilicon-int8-Fast), que ejecuta modelos int8 ConvRot a alta velocidad en Apple Silicon (generacion M5). El repositorio se publica bajo licencia MIT y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes.

El paquete incluye cinco workflows: generacion de texto a imagen con Krea 2, texto a video e imagen a video con MiniMax H3, y texto a video e imagen a video con LTX 2.5. Todos incorporan soporte de LoRA, con slots opcionales y un modo turbo especifico para MiniMax H3. Su relevancia reside en que permite ejecutar pipelines generativos de imagen y video localmente en Mac, sin depender de GPU NVIDIA ni de servicios en la nube.

El entorno de prueba documentado es un M5 Max con 48 GB de memoria unificada, ComfyUI v0.40 y PyTorch 2.13. Los pesos de los modelos y LoRA no se incluyen en el repositorio: deben descargarse por separado segun las instrucciones del README del node pack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los modelos subyacentes emplean una variante int8 denominada ConvRot, segun el node pack asociado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ConvRot) en los modelos subyacentes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene workflows en JSON; los pesos se descargan aparte) |
| Tipo de recurso | Coleccion de 5 workflows de ComfyUI (archivos JSON) |
| Software probado | ComfyUI v0.40, PyTorch 2.13 |
| Hardware de prueba | Apple M5 Max con 48 GB de memoria unificada |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-30 |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, por lo que no aplica ningun proceso de preentrenamiento ni ajuste fino propio. Se trata de grafos de ComfyUI (workflows en JSON) que orquestan la carga de modelos, LoRA y nodos de generacion. La ejecucion eficiente se delega en el node pack ComfyUI-AppleSilicon-int8-Fast, que implementa un camino de inferencia int8 basado en modelos ConvRot optimizado para Apple Silicon, concretamente la generacion M5.

En cuanto a la estructura de los workflows, cada uno carga un modelo principal (Krea 2 para texto a imagen, MiniMax H3 o LTX 2.5 para video) y expone slots de LoRA mediante el nodo "Load LoRA (Bypass, Optional)" del node pack, que permite dejar un slot vacio (None) o asignar un LoRA con su fuerza en el nodo principal. El workflow de MiniMax H3 texto a video incluye un interruptor de modo turbo y pasos turbo asociados al turbo LoRA. Los detalles tecnicos internos de la implementacion int8 ConvRot no estan documentados en la informacion disponible y deben consultarse en el README del node pack.

## Capacidades

- Generacion de texto a imagen mediante el workflow `krea2_turbo_t2i.json` con el modelo Krea 2, incluyendo una pila de LoRA basada en rgthree (vacia por defecto; requiere el paquete rgthree-comfy).
- Generacion de texto a video con MiniMax H3 (`minimax_h3_t2v_mac.json`) y con LTX 2.5 (`ltx2_5_t2v_mac.json`).
- Generacion de imagen a video con MiniMax H3 (`minimax_h3_i2v_mac.json`) y con LTX 2.5 (`ltx2_5_i2v_mac.json`); ambos requieren una imagen inicial proporcionada por el usuario en el nodo Load Image.
- Modo turbo para MiniMax H3: el primer slot de LoRA aloja el turbo LoRA, que funciona junto al interruptor de modo turbo y los pasos turbo configurables.
- Soporte de dos LoRA simultaneos en MiniMax H3: el segundo slot (`lora_2`, `lora_2_strength`) acepta cualquier otro LoRA de MiniMax H3 y se aplica con el modo turbo activado o desactivado; el uso simultaneo de dos LoRA exige la version actual del node pack desde GitHub.
- Slots de LoRA opcionales en LTX 2.5 y en el segundo slot de MiniMax H3, con control de fuerza individual.
- Ejecucion optimizada en Apple Silicon (M5) mediante inferencia int8 ConvRot, sin requerir GPU NVIDIA.

## Casos de uso

- Generacion local de imagenes en Mac: un disenador o desarrollador con un Mac M5 puede producir imagenes con Krea 2 directamente en ComfyUI, sin GPU dedicada ni costes de API, gracias al camino int8 ConvRot optimizado para Apple Silicon.
- Prototipado rapido de video generativo: el turbo LoRA y los pasos turbo de MiniMax H3 reducen el numero de pasos de inferencia, lo que permite iterar prompts de texto a video con latencias menores antes de lanzar renderizados finales.
- Animacion de imagenes fijas: los workflows de imagen a video convierten una ilustracion, fotografia de producto o fotograma propio en un clip en movimiento, tomando como punto de partida la imagen cargada en el nodo Load Image.
- Creacion de contenido para redes sociales y marketing: los workflows de LTX 2.5 texto a video permiten producir clips cortos de forma local y repetible, integrados en un pipeline ComfyUI reutilizable y sin dependencia de servicios en la nube.
- Experimentacion con LoRAs de estilo: la pila rgthree en Krea 2 y el doble slot de MiniMax H3 permiten combinar adaptaciones de estilo o movimiento, ajustando la fuerza de cada LoRA de forma independiente.
- Evaluacion de inferencia int8 en hardware unificado: investigadores interesados en cuantizacion pueden usar estos workflows como banco de prueba para medir el comportamiento de modelos ConvRot int8 sobre memoria unificada de Apple Silicon.
- Documentacion y ensenanza de ComfyUI: los cinco JSON sirven como plantillas comentadas para aprender a estructurar grafos de texto a imagen, texto a video e imagen a video con soporte de LoRA opcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es el entorno de validacion: los workflows se probaron con ComfyUI v0.40 y PyTorch 2.13 sobre un M5 Max con 48 GB de memoria unificada. No se proporcionan metricas de latencia, throughput ni calidad generativa.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon, con pruebas realizadas especificamente en un M5 Max con 48 GB de memoria unificada. La compatibilidad con chips M anteriores u otros modelos de Mac no esta documentada.
- VRAM: no aplica como tal, ya que Apple Silicon usa memoria unificada; los requisitos de memoria por modelo (Krea 2, MiniMax H3, LTX 2.5) no estan detallados en la informacion disponible y deben consultarse en el README del node pack.
- El camino int8 ConvRot esta orientado a Apple Silicon; no hay soporte documentado para GPU NVIDIA o AMD mediante este repositorio.
- Software necesario: ComfyUI (probado con v0.40), PyTorch (probado con 2.13), el node pack ComfyUI-AppleSilicon-int8-Fast (instalacion previa obligatoria) y rgthree-comfy para el workflow de Krea 2.
- Despliegue: ejecucion local mediante ComfyUI; los modelos y LoRA se descargan por separado segun las carpetas y enlaces indicados en el README del node pack. Opciones como vLLM, llama.cpp, Ollama o TGI no aplican a este recurso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Al tratarse de una coleccion de workflows y no de un modelo, la comparacion mas util es entre los propios workflows incluidos. No se han documentado en la informacion disponible repositorios externos equivalentes con los que establecer una comparativa directa.

| Workflow | Tarea | Modelo | LoRA incluido | Notas |
|---|---|---|---|---|
| `krea2_turbo_t2i.json` | Texto a imagen | Krea 2 | Pila rgthree, vacia por defecto | Requiere rgthree-comfy |
| `minimax_h3_t2v_mac.json` | Texto a video | MiniMax H3 | Turbo LoRA + segundo slot opcional | Interruptor de modo turbo y pasos turbo |
| `minimax_h3_i2v_mac.json` | Imagen a video | MiniMax H3 | Turbo LoRA + segundo slot opcional | Requiere imagen inicial del usuario |
| `ltx2_5_t2v_mac.json` | Texto a video | LTX 2.5 | Slot opcional (None por defecto) | Fuerza ajustable en el nodo principal |
| `ltx2_5_i2v_mac.json` | Imagen a video | LTX 2.5 | Slot opcional (None por defecto) | Requiere imagen inicial del usuario |

## Limitaciones y advertencias

- El repositorio no incluye pesos: los modelos y LoRA deben descargarse por separado siguiendo el README del node pack, lo que anade pasos de instalacion previos.
- Validacion hardware muy limitada: solo se ha probado en un M5 Max con 48 GB; el comportamiento en otros chips Apple Silicon (M1 a M4) o con menos memoria unificada no esta documentado.
- Dependencia de versiones concretas: las pruebas se realizaron con ComfyUI v0.40 y PyTorch 2.13; otras versiones no estan verificadas.
- Dependencias de terceros: el node pack ComfyUI-AppleSilicon-int8-Fast es imprescindible, y el workflow de Krea 2 necesita ademas rgthree-comfy. El uso simultaneo de dos LoRA en MiniMax H3 exige la version actual del node pack desde GitHub.
- Los prompts de todos los workflows llegan vacios y los de imagen a video requieren una imagen inicial propia, por lo que hay que configurar las entradas antes de generar.
- Adopcion comunitaria nula en el momento de redaccion (0 descargas y 0 likes), lo que implica escasa validacion por parte de otros usuarios y mayor riesgo de errores sin reportar.
- El impacto de la cuantizacion int8 ConvRot sobre la calidad generativa respecto a la precision original de cada modelo no esta documentado.
- La licencia MIT cubre los workflows, pero no necesariamente los modelos subyacentes (Krea 2, MiniMax H3, LTX 2.5) ni sus LoRA: hay que revisar los terminos de cada modelo antes de cualquier uso comercial.
- Alucinaciones, sesgos y limites de idioma dependen de los modelos subyacentes, cuyas caracteristicas no se detallan en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Illuminus7/Comfy_Int8_Fast_Workflows
- Node pack ComfyUI-AppleSilicon-int8-Fast (GitHub): https://github.com/Illuminus7/ComfyUI-AppleSilicon-int8-Fast
- rgthree-comfy (GitHub, requerido por el workflow de Krea 2): https://github.com/rgthree/rgthree-comfy
