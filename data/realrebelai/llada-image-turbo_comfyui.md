# realrebelai/LLaDa-Image-Turbo_ComfyUI

## Resumen

LLaDA-Image-Turbo_ComfyUI es una adaptacion cuantizada del modelo LLaDA-Image-Turbo de inclusionAI, preparada por RealRebelAI para integrarse en el ecosistema ComfyUI. El modelo original es un sistema de generacion de imagenes por difusion que permite tanto texto a imagen como edicion nativa de imagenes, sin necesidad de un checkpoint adicional de edicion. Esta version optimizada incluye pesos del transformer en BF16 e INT8 en formato Safetensors, junto con un text encoder LLaDA2-MoE cuantizado a Q4_K_M en formato GGUF, lo que reduce significativamente los requisitos de almacenamiento y memoria en tiempo de ejecucion.

El modelo base, LLaDA-Image-Turbo, esta disenado para generar imagenes de forma rapida, con configuraciones recomendadas de 4 pasos y una escala de guia (CFG) de 1.0. La version de RealRebelAI mantiene estas caracteristicas y anade un runtime personalizado para ComfyUI que carga el transformer cuantizado conservando la arquitectura original. El conjunto de pesos totales asciende a 16.322.752.256 parametros, lo que lo situa en la categoria de modelos de generacion de imagenes de gran tamano, pero con opciones de cuantizacion que permiten su ejecucion en hardware mas modesto. No se han publicado datos de entrenamiento ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con text encoder LLaDA2-MoE (arquitectura completa no disponible en la informacion) |
| Parametros totales | 16.322.752.256 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generacion de imagenes) |
| Tipos de cuantizacion | BF16, INT8, GGUF Q4_K_M |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (derivado de LLaDA-Image-Turbo; consultar los terminos del modelo upstream) |
| Formato de pesos | Safetensors (transformers BF16 e INT8), GGUF (text encoder) |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado de inclusionAI/LLaDA-Image-Turbo. La arquitectura subyacente corresponde a un modelo de difusion de imagenes con un transformer como componente principal y un text encoder basado en LLaDA2-MoE. Esta estructura permite tanto la generacion de imagenes a partir de texto como la edicion nativa de imagenes, utilizando una ruta de condicionamiento de imagen denominada SigVQ en lugar de un enfoque convencional de img2img con control de fuerza de denoising.

En cuanto al entrenamiento, no se proporcionan datos en la informacion disponible. La model card indica que los pesos provienen del proyecto original de inclusionAI, al que se remite para conocer la documentacion tecnica y los terminos de licencia aplicables. La contribucion de RealRebelAI se centra en la cuantizacion del transformer a INT8, la inclusion de pesos BF16 completos y la conversion del text encoder a GGUF Q4_K_M, asi como en el desarrollo de un runtime de ComfyUI que carga estos formatos manteniendo la arquitectura LLaDA-Image original.

## Capacidades

- Generacion de imagenes a partir de prompts de texto con configuracion optimizada de 4 pasos y CFG 1.0.
- Edicion nativa de imagenes mediante el modo `generation_mode="editing"`, sin necesidad de un checkpoint de edicion separado.
- Acepta instrucciones de edicion, imagen de origen, dimensiones, pasos, escala de guia, semilla y prompt negativo opcional.
- Las dimensiones de salida deben ser divisibles por 32.
- Integracion directa con ComfyUI mediante nodos personalizados de RealRebelAI, con cargas de modelos optimizadas para BF16 e INT8.
- Soporte del text encoder LLaDA2-MoE en formato GGUF Q4_K_M, lo que reduce los requisitos de memoria frente al encoder completo.
- Generacion rapida al estar disenado como modelo "turbo" para produccion de imagenes con pocos pasos de denoising.

## Casos de uso

- Creacion de concept art: el modelo genera imagenes rapidamente a partir de descripciones detalladas, permitiendo iteraciones frecuentes en entornos de ComfyUI sin cargar pesos completos en cada ejecucion.
- Edicion fotografica avanzada: la capacidad de edicion nativa permite modificar elementos de una fotografia existente mediante instrucciones textuales, como cambiar un animal por otro manteniendo la composicion.
- Generacion de variaciones creativas: a partir de una misma imagen de referencia, se pueden producir multiples alternativas cambiando la semilla y la instruccion de edicion, lo que resulta util para explorar direcciones artisticas.
- Flujos de trabajo en ComfyUI: los nodos personalizados de RebelAI permiten integrar el modelo en pipelines complejos de generacion, composicion y guardado de imagenes, aprovechando las cuantizaciones para gestionar la memoria.
- Prototipado rapido para produccion audiovisual: la generacion en pocos pasos facilita la creacion de imagenes preliminares para storyboards o maquetas visuales en equipos con tarjetas graficas de consumo.
- Contenido para marketing y redes sociales: el modelo puede producir imagenes editadas o generadas desde cero para campanas de contenido, siempre que se respeten los terminos de licencia del modelo upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM, latencia ni throughput en la informacion disponible.
- La disponibilidad de pesos INT8 del transformer y de un text encoder cuantizado a GGUF Q4_K_M sugiere un menor consumo de memoria frente a la carga completa en BF16, pero las cifras exactas dependen del runtime de ComfyUI y del hardware utilizado.
- El peso BF16 del transformer, con 16.322.752.256 parametros, requeriria una cantidad significativa de VRAM (en el orden de 32 GB o mas), mientras que la version INT8 reduce este requerimiento aproximadamente a la mitad, aunque no se proporcionan mediciones reales.
- El despliegue se realiza a traves de ComfyUI con los nodos personalizados de RealRebelAI. No se mencionan alternativas como vLLM, llama.cpp u otros motores de inferencia, ya que se trata de un modelo de generacion de imagenes.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables en la informacion proporcionada. La unica referencia disponible es el modelo base del que deriva esta version:

| Modelo | Parametros | Formato | Relacion |
|---|---|---|---|
| inclusionAI/LLaDA-Image-Turbo | no disponible en la informacion | Original (sin cuantizacion) | Modelo base |
| realrebelai/LLaDA-Image-Turbo_ComfyUI | 16.322.752.256 | Safetensors INT8/BF16 + GGUF Q4_K_M | Derivado cuantizado para ComfyUI |

## Limitaciones y advertencias

- La licencia del modelo original no se especifica en la model card. Los archivos aqui publicados son derivados de LLaDA-Image-Turbo, por lo que deben respetarse los terminos de la licencia upstream, especialmente en caso de uso comercial o redistribucion.
- No se han publicado sesgos conocidos ni evaluaciones de seguridad, por lo que no puede descartarse la generacion de contenido no deseado o sesgado.
- La cuantizacion a INT8 y Q4_K_M puede introducir una degradacion en la calidad de las imagenes generadas o editadas frente a los pesos originales.
- El modelo requiere que las dimensiones de la imagen sean divisibles por 32, lo que limita ciertos tamanos de salida.
- No hay datos de benchmarks publicos, lo que impide valorar objetivamente el rendimiento frente a otros modelos de generacion de imagenes.
- La integracion depende del runtime de ComfyUI de RealRebelAI; no se garantiza compatibilidad con otros motores de inferencia sin modificaciones.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/realrebelai/LLaDa-Image-Turbo_ComfyUI
- Nodos de ComfyUI / GitHub de RealRebelAI: https://github.com/RealRebelAI/LLaDa-Image_ComfyUI
- Modelo base oficial: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
- Codigo fuente oficial de LLaDA-Image: https://github.com/inclusionAI/LLaDA-Image
