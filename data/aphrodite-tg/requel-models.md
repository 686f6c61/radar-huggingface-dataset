# aphrodite-tg/requel-models

## Resumen

Requel models es un repositorio espejo que agrupa los pesos de varios modelos de procesamiento de imagen utilizados por Requel, una herramienta gratuita y no comercial de estilización de imagen y vídeo. El repositorio no contiene un modelo único, sino un conjunto de nueve archivos ONNX que cubren tres tareas principales: eliminación de fondo, superresolución y estilización anime. El autor del repositorio, aphrodite-tg, no entrenó ninguno de estos modelos; su función es exclusivamente distributiva, permitiendo que la aplicación Requel descargue únicamente los pesos que necesita en lugar de empaquetar unos 400 MB en cada compilación.

La relevancia de este repositorio radica en su enfoque práctico de distribución de pesos con licencias mixtas. Cada archivo conserva su licencia original, que va desde Apache-2.0 y BSD-3-Clause hasta licencias no comerciales como CC-BY-NC-SA-4.0 y la licencia personalizada AnimeGAN-NC. Esto lo convierte en un caso interesante de gestión de dependencias de modelos en aplicaciones de código abierto, aunque su utilidad directa para desarrolladores externos es limitada, ya que los pesos son conversiones ONNX de modelos ya publicados por sus autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U^2-Net (deteccion de objetos salientes), Real-ESRGAN (superresolucion), UltraSharpV2 (superresolucion), AnimeGANv2/v3 (estilizacion) |
| Parametros totales | no disponible (cada archivo tiene parametros distintos) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelos de vision por computador) |
| Tipos de cuantizacion | no disponible (archivos ONNX en FP32) |
| Idiomas soportados | no aplicable (procesamiento de imagen) |
| Licencia | Mixta: Apache-2.0, BSD-3-Clause, CC-BY-NC-SA-4.0, AnimeGAN-NC |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

El repositorio contiene nueve archivos ONNX que corresponden a arquitecturas diferentes. U^2-Net es una red convolucional en dos niveles (two-level nested U-structure) disenada para deteccion de objetos salientes y eliminacion de fondo. Real-ESRGAN es un modelo de superresolucion basado en GAN con arquitectura RRDBNet, entrenado con datos sinteticos de alta fidelidad. UltraSharpV2 es un modelo de superresolucion 4x orientado a preservar detalles finos. AnimeGANv2 y AnimeGANv3 son generadores basados en GAN para transformar fotografias en estilos de animacion (Ghibli, Hayao, Shinkai).

No se dispone de informacion sobre el entrenamiento de estos modelos en la model card del repositorio, ya que ninguno fue entrenado por el autor del mismo. Los datos de entrenamiento, el numero de tokens o iteraciones y las tecnicas de alineacion (RLHF, DPO) no son aplicables a estos modelos de vision. Las conversiones a ONNX fueron realizadas por terceros o por el propio autor del repositorio, y no se documentan los detalles de la conversion.

## Capacidades

- Eliminacion de fondo y deteccion de objetos salientes mediante U^2-Net, con salida en mapa de profundidad o mascara binaria.
- Superresolucion 2x con RealESRGAN_x2plus, adecuado para duplicar resolucion manteniendo calidad.
- Superresolucion 4x con RealESRGAN_x4plus y UltraSharpV2, con enfasis en nitidez y preservacion de detalles.
- Estilizacion anime en tres variantes: AnimeGANv2 (estilo generico), AnimeGANv3 Ghibli (estilo Studio Ghibli), AnimeGANv3 Hayao (estilo Hayao Miyazaki) y AnimeGANv3 Shinkai (estilo Makoto Shinkai).
- Variante ligera UltraSharpV2_Lite para entornos con recursos limitados.
- Todos los archivos estan en formato ONNX, lo que permite inferencia con ONNX Runtime en CPU, GPU o NPU.

## Casos de uso

- Preprocesado de imagenes en aplicaciones de diseno grafico: el modelo U^2-Net permite separar el sujeto del fondo de forma automatica, lo que agiliza el flujo de trabajo en herramientas de composicion y retoque fotografico.
- Mejora de imagenes de baja resolucion en archivos digitales: RealESRGAN_x2plus y x4plus pueden escalar imagenes antiguas o comprimidas, recuperando detalles que se pierden con metodos de interpolacion clasica.
- Generacion de contenido para redes sociales: UltraSharpV2 permite afinar imagenes antes de publicarlas, mejorando la percepcion de calidad sin necesidad de edicion manual.
- Estilizacion artistica de fotogramas de video: los modelos AnimeGANv3 pueden transformar secuencias de video en estilos anime, lo que resulta util para creadores de contenido que buscan una estetica concreta.
- Creacion de avatares o ilustraciones con estetica anime: AnimeGANv2 y sus variantes permiten convertir retratos fotograficos en ilustraciones con estilos reconocibles (Ghibli, Shinkai, Hayao) de forma automatica.
- Integracion en pipelines de procesamiento por lotes: al ser archivos ONNX independientes, pueden orquestarse con ONNX Runtime o herramientas como rembg para procesar grandes volumenes de imagenes sin depender de una GPU especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento, comparativas con otros modelos ni evaluaciones cuantitativas de calidad. Los modelos originales (U^2-Net, Real-ESRGAN, AnimeGAN) tienen benchmarks publicados en sus respectivos repositorios, pero este espejo no los reproduce.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque los archivos ONNX de tamano reducido (4-168 MB) sugieren que pueden ejecutarse en GPU con 2-4 GB de VRAM o incluso en CPU.
- GPU recomendadas: no se especifican, pero modelos de este tamano funcionan en GPUs de consumo como GTX 1060, RTX 2060 o superiores.
- Compatibilidad con consumer GPU: si, todos los archivos son ONNX y pueden ejecutarse con ONNX Runtime en CPU o GPU.
- Opciones de despliegue: ONNX Runtime, rembg (para U^2-Net), herramientas de conversion de imagen por lotes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamano | Tarea | Licencia | Formato |
|---|---|---|---|---|
| U^2-Net (este repo) | 168 MB | Eliminacion de fondo | Apache-2.0 | ONNX |
| rembg (u2net) | ~170 MB | Eliminacion de fondo | MIT | ONNX |
| Real-ESRGAN (este repo) | 64 MB | Superresolucion 2x/4x | BSD-3-Clause | ONNX |
| Real-ESRGAN (original) | ~64 MB | Superresolucion 2x/4x | BSD-3-Clause | PyTorch (.pth) |
| AnimeGANv3 (este repo) | 4-7 MB | Estilizacion anime | AnimeGAN-NC | ONNX |
| AnimeGANv3 (original) | 4-7 MB | Estilizacion anime | AnimeGAN-NC | ONNX |

La principal diferencia con las alternativas es el formato: este repositorio ofrece conversiones ONNX listas para usar, mientras que los proyectos originales publican pesos en PyTorch. Para U^2-Net, la herramienta rembg ya distribuye el mismo archivo ONNX, por lo que este repositorio no anade valor en ese caso concreto.

## Limitaciones y advertencias

- Licencias mixtas: varios archivos (UltraSharpV2, AnimeGANv2/v3) tienen restricciones de uso no comercial. Cualquier uso comercial requiere permiso explicito de los autores originales.
- Modelos no entrenados por el autor del repositorio: la calidad y el comportamiento de cada modelo dependen de sus autores originales, y este repositorio no ofrece garantias adicionales.
- Conversiones ONNX sin verificar: algunos archivos son conversiones realizadas por terceros y no tienen una copia upstream equivalente, por lo que podrian presentar diferencias de precision respecto a los pesos originales.
- Sin soporte ni mantenimiento: el repositorio es un espejo estatico; no se proporcionan actualizaciones, correcciones ni soporte tecnico.
- Riesgo de alucinacion: no aplicable, al ser modelos de vision y no generativos de texto.
- Sesgos: no se documentan sesgos especificos, pero los modelos de estilizacion pueden tener preferencias esteticas implicitas derivadas de sus datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aphrodite-tg/requel-models
- Proyecto Requel: https://gitgud.io/xchange-life/xcl-requel-experiments
- U^2-Net original: https://github.com/xuebinqin/U-2-Net
- Real-ESRGAN original: https://github.com/xinntao/Real-ESRGAN
- AnimeGANv2 original: https://github.com/TachibanaYoshino/AnimeGANv2
- AnimeGANv3 original: https://github.com/TachibanaYoshino/AnimeGANv3
- UltraSharpV2 en OpenModelDB: https://openmodeldb.info/models/4x-UltraSharpV2
- Archivo u2net.onnx de rembg: https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
