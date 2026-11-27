# chatpig/tripo-gguf

## Resumen

`chatpig/tripo-gguf` es una conversión al formato GGUF del modelo TripoSR de Stability AI, un sistema de reconstrucción 3D a partir de una única imagen (image-to-3D). El modelo original, desarrollado conjuntamente por Stability AI y Tripo AI, transforma una fotografía de entrada en una malla 3D texturizada en cuestión de segundos, lo que lo convierte en una alternativa rápida frente a pipelines de reconstrucción multi-vista o de optimización por destilación de puntuación (SDS).

Esta versión concreta, publicada por el usuario `chatpig`, no es un modelo de lenguaje sino un modelo de visión 3D con 145 millones de parámetros, empaquetado en GGUF para su ejecución con el motor `ggk` (kernels de cómputo GGUF del proyecto `gguf-org`). La model card documenta variantes adicionales (tripoSG, tripoSG-scribble, adaptadores de scribble y edición por máscara) que amplían las capacidades del TripoSR base.

Su relevancia radica en que permite ejecutar generación 3D desde imagen en hardware de consumo mediante cuantización NVFP4, algo poco habitual en este tipo de modelos, que tradicionalmente requieren GPUs de datacenter para inferencia interactiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconstruccion 3D image-to-3D basado en TripoSR; no es un transformer de lenguaje) |
| Parametros totales | 145.411.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de una sola imagen) |
| Tipos de cuantizacion | NVFP4 (variantes documentadas: `triposr-nvfp4.gguf`, `triposg-nvfp4.gguf`, `triposg-scribble-nvfp4.gguf`, `pig_triposr_scribble_adapter-nvfp4.gguf`) |
| Idiomas soportados | no disponible (modelo de vision 3D; no procesa texto libre como un LLM) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

TripoSR es un modelo de reconstruccion 3D de una sola imagen basado en la arquitectura del transformer de TripoSR original de Stability AI y Tripo AI, que combina un codificador de imagen con un decodificador de triplanos que genera una representacion 3D (NeRF/malla) a partir de la cual se extrae la geometria y la textura. El modelo base cuenta con aproximadamente 145 millones de parametros y produce una malla GLB texturizada en menos de un segundo en GPU de datacenter segun las cifras publicadas por Stability AI para el modelo original.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens o imagenes utilizadas, ni sobre si hubo etapas de RLHF/DPO (no aplicables a un modelo de reconstruccion 3D). La model card menciona variantes adicionales (tripoSG, tripoSG-scribble) y un adaptador de scribble entrenado nativamente (`pig_triposr_scribble_adapter`) que convierte TripoSR en un modelo guiado por boceto, ademas de una funcion de edicion por mascara (`--edit-mask`) para modificar regiones concretas de la malla generada.

La innovacion tecnica principal de esta publicacion es el empaquetado en GGUF con cuantizacion NVFP4 y su integracion con el motor `ggk` del proyecto `gguf-org`, que permite ejecutar el modelo fuera del stack original de PyTorch.

## Capacidades

- Reconstruccion 3D a partir de una unica imagen de referencia (`--ref-image`) con salida en formato GLB.
- Generacion de mallas 3D texturizadas con color.
- Variante tripoSG para reconstruccion 3D de mayor calidad (segun la model card).
- Variante tripoSG-scribble: generacion 3D guiada por prompt de texto y boceto.
- Adaptador de scribble para TripoSR (`pig_triposr_scribble_adapter`) que anade control por boceto al modelo base.
- Edicion 3D por mascara (`--edit-mask`): permite modificar regiones concretas de la malla generada (por ejemplo, cambiar el color de los ojos de una oveja).
- Control por prompt de texto en las variantes que lo soportan (por ejemplo, "a yellow sheep", "a pink sheep").
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de un LLM.

## Casos de uso

- Prototipado rapido de assets 3D para videojuegos: a partir de una fotografia o render 2D se obtiene una malla GLB texturizada que puede importarse en Blender, Unity o Unreal para iterar sobre el diseno antes de modelar en alta fidelidad.
- Generacion de modelos 3D para impresion: la salida GLB puede procesarse con herramientas de reparacion de malla y slicers para obtener un STL imprimible, util para piezas personalizadas a partir de una foto.
- Catalogos de e-commerce en 3D: convertir fotos de producto en modelos 3D navegables para visores web, reduciendo el coste frente a la fotogrametria tradicional.
- Edicion de assets existentes: la funcion `--edit-mask` permite recolorear o modificar partes concretas de una malla generada sin regenerarla por completo, lo que agiliza iteraciones de diseno.
- Creacion de contenido guiada por boceto: con el adaptador `pig_triposr_scribble_adapter` o la variante tripoSG-scribble, un artista puede dibujar un boceto y un prompt de texto para obtener una malla 3D que respete la forma dibujada.
- Investigacion en vision 3D: el empaquetado GGUF/NVFP4 permite experimentar con cuantizacion de modelos 3D y comparar la calidad de reconstruccion frente al modelo original en FP16.
- Educacion y demos interactivas: al caber en GPUs de consumo, se puede desplegar en un portatil con GPU para demostraciones de reconstruccion 3D en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Con 145 millones de parametros, el modelo en FP16 ocuparia aproximadamente 0,3 GB; la cuantizacion NVFP4 reduce el peso a alrededor de 0,1 GB, aunque el consumo real depende del motor `ggk` y de las estructuras intermedias de la reconstruccion 3D.
- GPU recomendadas: no disponibles en la informacion proporcionada. El uso de NVFP4 sugiere GPUs con soporte de tipos de 4 bits (arquitecturas Blackwell de NVIDIA o equivalentes); no se confirma compatibilidad con GPUs anteriores.
- GPU de consumo: por el tamano del modelo (145 M de parametros) es plausible que quepa en GPUs de consumo, pero no se dispone de confirmacion oficial en la informacion proporcionada.
- Opciones de despliegue: motor `ggk` del proyecto `gguf-org` (comando `ggk -m <modelo>.gguf --ref-image <imagen> -o <salida>.glb`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| chatpig/tripo-gguf (esta ficha) | 145 M | 1 imagen (+ prompt/mascara en variantes) | Malla GLB | MIT | GGUF (NVFP4) | Conversion comunitaria de TripoSR con motor ggk |
| stabilityai/TripoSR | 145 M | 1 imagen | Malla GLB | MIT | PyTorch (safetensors) | Modelo original de Stability AI y Tripo AI |
| TripoSG | no disponible | 1 imagen | Malla 3D | no disponible | no disponible | Variante mencionada en la model card, sin ficha tecnica en la informacion disponible |
| Otros image-to-3D (p. ej. Zero123, InstantMesh) | no disponible | 1 imagen | Malla/NeRF | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un modelo de reconstruccion 3D, no un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento conversacional.
- La calidad de la reconstruccion depende en gran medida de la imagen de entrada; oclusiones, iluminacion dura o fondos complejos pueden degradar la geometria y la textura.
- Las variantes tripoSG y tripoSG-scribble se mencionan en la model card pero no se detallan sus especificaciones, licencia ni procedencia en la informacion disponible.
- El adaptador de scribble y la edicion por mascara son funcionalidades documentadas en la model card, pero no se dispone de evaluacion cuantitativa de su calidad.
- La licencia MIT del repositorio GGUF no garantiza por si sola los derechos sobre el modelo base; conviene verificar la licencia de `stabilityai/TripoSR` antes de uso comercial.
- El motor `ggk` es un proyecto en desarrollo (`gguf-org`); la compatibilidad futura y el soporte de hardware no estan garantizados.
- Riesgo de sesgos en la reconstruccion: al entrenarse con datasets de objetos 3D, puede reproducir sesgos de representacion (formas, colores y categorias sobrerrepresentadas).
- No se dispone de informacion sobre alucinacion en el sentido de LLM, pero si existe riesgo de generar geometria plausible pero incorrecta en zonas no visibles de la imagen de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/chatpig/tripo-gguf
- Modelo base: https://huggingface.co/stabilityai/TripoSR
- Motor ggk (pig engine): https://github.com/gguf-io/gk
- Pipeline de entrenamiento 3D: https://pypi.org/project/3d-trainer/
- Repositorio del motor de escritorio: https://github.com/gguf-org/gguf-desktop
