# Bandukids/DLSS-Runtimes

## Resumen

Bandukids/DLSS-Runtimes es un repositorio de Hugging Face que distribuye binarios de NVIDIA DLSS 5 y NGX (Neural Graphics Extensions) parcheados por la comunidad para habilitar su ejecución en GPUs GeForce RTX 40 y RTX 30. No contiene un modelo de IA generativa, sino un conjunto de bibliotecas de enlace dinámico (DLL) que implementan superresolución, generación de frames y neural rendering. El archivo principal es `nvngx_dlssnr.dll` (v310.8.0.0, 158 MB), que corresponde al runtime de DLSS 5 con el parche RenoDX Ada.

Los runtimes han sido extraídos de una build de desarrollo de NBA 2K27 y modificados para omitir la comprobación de arquitectura que el driver de NVIDIA impone sobre tarjetas Ada Lovelace y anteriores. De este modo, el Feature 18 de NGX puede ejecutarse en tiempo real en RTX 40 y RTX 30. El repositorio está pensado para usarse con la extensión ComfyUI-DLSS5-VideoSuite, que actúa como puente D3D12/NGX para Python.

Con un tamaño de 0,2 GB y licencia `other` de carácter no comercial, este proyecto tiene como finalidad investigar la viabilidad del neural rendering en entornos de IA de sobremesa. No incluye parámetros de modelo ni longitud de contexto, ya que no es un modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (runtimes propietarios de NVIDIA, no un modelo entrenado) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh (no es un modelo de lenguaje) |
| Licencia | other (no comercial) |
| Formato de pesos | DLL/binarios (nvngx_dlss.dll, nvngx_dlssg.dll, nvngx_dlssnr.dll, renodx-dlss5.addon64, te_dlss5_native.dll) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo de IA entrenado. Los archivos son binarios del runtime de NVIDIA NGX, que implementan las redes neuronales propietarias de DLSS. El núcleo es `nvngx_dlssnr.dll`, que incluye los pesos y el pipeline de DLSS 5 (NGX Feature 18). Los otros DLL cubren superresolución clásica (`nvngx_dlss.dll`), generación de frames (`nvngx_dlssg.dll`) y el puente nativo para ComfyUI (`te_dlss5_native.dll`).

La innovación técnica destacable es el parche de la comunidad RenoDX/ReShade, que modifica la comprobación de arquitectura del driver. En las builds originales, los drivers de NVIDIA devuelven el error `0xBAD00001` (`NVSDK_NGX_Result_FAIL_FeatureNotSupported`) en GPUs Ada Lovelace y anteriores. El parche evita esa restricción y permite ejecutar el Feature 18 en RTX 40 y RTX 30. No se dispone de datos sobre el dataset de entrenamiento porque no aplica en este contexto.

## Capacidades

- Implementa superresolución de vídeo e imágenes mediante DLSS, con aprovechamiento de los tensor cores de NVIDIA.
- Incluye generación de frames por interpolación 2x (DLSS 3) para aumentar la fluidez de secuencias de vídeo.
- Proporciona neural rendering con DLSS 5 (NGX Feature 18), el componente más avanzado del repositorio.
- Se integra con ComfyUI mediante la extensión ComfyUI-DLSS5-VideoSuite, que gestiona el pipeline D3D12/NGX desde Python.
- Soporta las arquitecturas RTX 40 y RTX 30 gracias al parche RenoDX Ada.
- No incluye capacidades de tool calling, agentes, ni procesamiento de lenguaje natural.

## Casos de uso

- Upscaling de vídeo generado por IA en ComfyUI: `nvngx_dlss.dll` permite aplicar superresolución a clips de baja resolución (por ejemplo, de 720p a 4K) dentro de un flujo de trabajo, mejorando la calidad sin regenerar cada frame.
- Generación de frames en animaciones: `nvngx_dlssg.dll` interpola dos frames consecutivos para crear uno nuevo, lo que resulta útil para duplicar el framerate de animaciones sintetizadas por difusión.
- Neural rendering en pipelines 3D: `nvngx_dlssnr.dll` contiene el runtime de DLSS 5 (Feature 18), que puede probarse en escenas 3D generadas dentro de ComfyUI para evaluar renderizado neuronal guiado por geometría.
- Investigación de interoperabilidad hardware: el parche RenoDX permite ejecutar el Feature 18 en RTX 40 y RTX 30, lo que facilita estudiar la viabilidad del neural rendering en GPUs de consumo sin necesidad de hardware profesional.
- Postprocesado de clips existentes: los runtimes se incorporan a un pipeline de ComfyUI para aplicar upscaling y generación de frames a vídeos ya renderizados, mejorando su calidad final.
- Demostraciones educativas: el repositorio permite analizar el funcionamiento interno de DLSS/NGX y los mecanismos de bypass de la comunidad RenoDX/ReShade sobre los drivers de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU NVIDIA GeForce RTX 40 Series o RTX 30 Series, necesarias para ejecutar los runtimes parcheados.
- VRAM estimada: no disponible; depende de la resolución de salida y del pipeline.
- GPU recomendadas: RTX 40 para soporte completo de DLSS 5; RTX 30 para evaluación con limitaciones.
- Despliegue: ComfyUI en local con la extensión ComfyUI-DLSS5-VideoSuite.
- Requiere drivers NVIDIA compatibles con NGX.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Uso estrictamente no comercial y educativo. No puede emplearse en productos con fines lucrativos.
- Los archivos se distribuyen sin garantía de funcionamiento ni soporte.
- Riesgo de reclamaciones por infracción de derechos de autor (DMCA) por parte de NVIDIA o Take-Two Interactive.
- Depende de drivers NVIDIA específicos y de la compatibilidad del parche con el sistema operativo.
- Requiere GPU NVIDIA RTX 40 o RTX 30; no funciona en GPUs de otras marcas ni en arquitecturas anteriores.
- No es un modelo de lenguaje, por lo que no genera texto ni razona; no es útil para tareas de procesamiento de lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/Bandukids/DLSS-Runtimes
- GitHub (extensión ComfyUI-DLSS5-VideoSuite): https://github.com/Bandukids/ComfyUI-DLSS5-VideoSuite
