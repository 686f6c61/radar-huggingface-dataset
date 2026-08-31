# AbrahamPJ/facefusion-mobile-models

## Resumen

FaceFusion Mobile model sets es un repositorio que contiene modelos convertidos para FaceFusion Mobile, un port para Android del popular framework de intercambio de caras FaceFusion. El proyecto, desarrollado por AbrahamPJ, permite ejecutar el pipeline completo de face-swap de forma totalmente local en el dispositivo, sin conexión a internet. El repositorio incluye dos conjuntos de modelos: binarios de contexto Hexagon compilados con QAIRT para teléfonos con NPU de Qualcomm, y modelos ncnn para el resto de dispositivos que usan GPU Vulkan con respaldo en CPU.

La relevancia de este proyecto radica en que acerca el intercambio de caras de nivel profesional a dispositivos móviles, con un rendimiento optimizado para hardware específico. Los modelos cubren detección de caras, landmarks faciales, reconocimiento, intercambio, mejora de calidad, sincronización de labios y moderación de contenido. El repositorio ocupa 2.2 GB e incluye múltiples variantes según la arquitectura del chip, desde Snapdragon 888 hasta Snapdragon 8 Elite Gen 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales convolucionales (CNN) para deteccion, landmarks, reconocimiento, intercambio, mejora y sincronizacion de labios |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | W8A16 per-channel (QAIRT) para binarios Hexagon; fp16 para modelos ncnn |
| Idiomas soportados | no disponible |
| Licencia | mixed-per-model (ver enlace en la model card) |
| Formato de pesos | Binarios QAIRT (.bin) para Hexagon; pares .param/.bin para ncnn |

## Arquitectura y entrenamiento

Los modelos incluidos no se entrenaron desde cero, sino que son conversiones de los modelos originales de FaceFusion (yoloface, fan2d, arcface, hyperswap, gpen y wav2lip) a formatos optimizados para ejecucion en dispositivos moviles. Los binarios Hexagon se compilaron con QAIRT 2.49.0 aplicando cuantizacion W8A16 por canal, mientras que los modelos ncnn se almacenan en fp16. No se proporcionan detalles sobre el entrenamiento original de los modelos, como el dataset o el proceso de optimizacion.

La conversion mantiene la fidelidad respecto al modelo original: el host de referencia se verifico contra FaceFusion 3.8.2 con una diferencia de 62.77 dB en una cara y 50.30 dB en tres caras. El repositorio incluye ademas un content checker (clasificador NSFW) que es obligatorio para el funcionamiento de la app, con una version cuantizada calibrada sobre el rango de entrada real de FaceFusion 3.8.2.

## Capacidades

- Intercambio de caras (face-swap) en imagenes y video, con resolucion de salida de 256x256.
- Deteccion de caras con yoloface a 640x640.
- Landmarks faciales 2D con fan2d.
- Reconocimiento facial con arcface, generando embeddings de 512 dimensiones.
- Mejora de calidad facial con gpen, que restaura detalles a 256x256.
- Sincronizacion de labios con wav2lip, que redibuja la boca para coincidir con el audio (requiere clip con audio).
- Moderacion de contenido NSFW integrada, obligatoria en el pipeline.
- Ejecucion completamente offline en el dispositivo, sin necesidad de servidores.

## Casos de uso

- Edicion de video en movil: un creador de contenido puede intercambiar caras en clips grabados con su telefono, usando la app FaceFusion Mobile, sin necesidad de un PC. El modelo ncnn permite ejecutar el pipeline en cualquier telefono con GPU Vulkan, aunque a menor velocidad que en un Snapdragon con NPU.
- Aplicaciones de entretenimiento y filtros en tiempo real: la baja latencia del enhancer (2.45 ms por cara en v79) y del swapper (31.93 GMAC) permite aplicaciones de camara en vivo que intercambian o mejoran caras en tiempo real, siempre que el dispositivo tenga el tier Hexagon adecuado.
- Sincronizacion de labios para doblaje: wav2lip puede redibujar la boca de un actor para que coincida con un audio doblado, util en produccion de video de bajo presupuesto. El modelo procesa ventanas de 200 ms de audio y tarda ~1 ms por frame, aunque requiere audio limpio sin musica de fondo.
- Restauracion de video antiguo: el enhancer gpen puede mejorar la calidad de rostros en videos de baja resolucion, restaurando detalles a 256x256. Su coste computacional de 8.57 GMAC por cara lo hace viable en movil.
- Moderacion automatica de contenido: el content checker integrado permite filtrar contenido NSFW en aplicaciones que procesan imagenes de usuarios, actuando como una barrera de seguridad obligatoria en el pipeline.
- Desarrollo de aplicaciones de realidad aumentada: los modelos de deteccion, landmarks y reconocimiento facial pueden integrarse en apps de AR para superponer efectos sobre rostros, usando el mismo conjunto de modelos convertidos.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles se centran en la fidelidad de la cuantizacion y la latencia en hardware especifico. No se han publicado resultados de benchmarks estandar como MMLU o HumanEval, ya que se trata de modelos de vision por computador.

| Metrica | Valor |
|---|---|
| SNR del swapper (hyperswap) | 30.87 dB |
| SNR del enhancer (gpen) | 38.23 dB |
| SNR del lip syncer (wav2lip) | 44.30 dB (float: 47.61 dB) |
| Latencia del enhancer en v79 | 2.45 ms por cara |
| Latencia del lip syncer en v79 | 1.03 ms por frame |
| Coste del swapper | 31.93 GMAC por cara |
| Coste del enhancer | 8.57 GMAC por cara |
| Rendimiento ncnn vs NPU (720p) | 325 ms (ncnn) vs 75 ms (NPU) en Snapdragon 8 Elite |
| Fidelidad ncnn vs NPU | 42.7 dB de acuerdo |

## Requisitos de hardware

- Para binarios Hexagon: telefono con SoC Qualcomm Snapdragon con NPU Hexagon. Los tiers son: v68 (Snapdragon 888 y anteriores, 8 Gen 1), v73 (8 Gen 2, 8 Gen 3 y partes v79 excepto SM8750), v79 (Snapdragon 8 Elite SM8750) y v81 (Snapdragon 8 Elite Gen 5). Cada binario esta fijado a una arquitectura y no carga en otra.
- Para modelos ncnn: cualquier telefono con GPU compatible con Vulkan y CPU como respaldo. No se requiere NPU.
- VRAM estimada: no disponible en la informacion proporcionada.
- Opciones de despliegue: la app FaceFusion Mobile (repositorio GitHub) gestiona la descarga y seleccion automatica del conjunto adecuado. No se mencionan otros motores de inferencia como vLLM o llama.cpp, ya que no son aplicables a este tipo de modelos.
- Latencia: el enhancer tarda 2.45 ms por cara en v79, el lip syncer 1.03 ms por frame, y el pipeline completo en ncnn corre a ~325 ms por frame 720p frente a 75 ms con NPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo segmento (face-swap movil con soporte NPU). La comparativa interna entre los tiers Hexagon y el conjunto ncnn es la unica referencia disponible, y se detalla en la seccion de benchmarks.

## Limitaciones y advertencias

- Los binarios Hexagon no son portables: cada archivo esta compilado para una arquitectura Hexagon concreta y no cargara en otra. Mezclar tiers provoca fallos de carga.
- El content checker es obligatorio: si falta el binario correspondiente, la app trata la inicializacion como un fallo y no permite continuar.
- El lip syncer wav2lip requiere audio limpio: si el clip tiene musica de fondo u otras fuentes de sonido, el modelo recibe un espectrograma de audio no aislado, lo que puede degradar la sincronizacion. El extractor de voz original de FaceFusion no se incluye en este repositorio.
- La licencia es mixed-per-model: cada modelo puede tener condiciones de uso diferentes. Es necesario revisar el archivo LICENSE.md del proyecto FaceFusion original antes de usar los modelos en produccion.
- El conjunto ncnn es significativamente mas lento que el NPU (325 ms vs 75 ms por frame 720p), aunque mantiene la misma calidad de salida.
- No se proporcionan datos sobre sesgos o alucinaciones, ya que son modelos de vision y no de lenguaje. Sin embargo, el intercambio de caras conlleva riesgos eticos y legales que deben considerarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AbrahamPJ/facefusion-mobile-models
- Proyecto FaceFusion Mobile (GitHub): https://github.com/AbrahamPaulJ/facefusion-mobile
- Proyecto FaceFusion original (GitHub): https://github.com/facefusion/facefusion
- Sitio oficial de FaceFusion: https://facefusion.io/
