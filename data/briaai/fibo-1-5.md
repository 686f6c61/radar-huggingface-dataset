# briaai/Fibo-1.5

## Resumen

Fibo-1.5 es un modelo de generación de imágenes texto a imagen desarrollado por BRIA AI, la primera familia de modelos open-source con paradigma JSON-native, es decir, entrenados exclusivamente con capturas estructuradas largas en formato JSON. Este enfoque, denominado VGL (Visual GenAI Language), busca mejorar la controlabilidad, la predecibilidad y el desacoplamiento entre atributos visuales, permitiendo que el modelo interprete instrucciones complejas y estructuradas en lugar de simples descripciones libres.

La versión 1.5 introduce una destilación de pocos pasos (few-step distillation) que reduce el número de iteraciones de inferencia necesarias, junto con mejoras en el realismo y las texturas de las imágenes generadas. Con aproximadamente 8,29 mil millones de parámetros, el modelo se distribuye a través de la librería diffusers y requiere aceptar condiciones de licencia en Hugging Face (acceso restringido). Está pensado para producción, con soporte de API en plataformas como Bria Platform, Fal.ai y Replicate, así como nodos de ComfyUI e inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para texto a imagen (no se especifica el tipo exacto de backbone) |
| Parametros totales | 8.285.836.848 (8,29 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | bria-fibo (acceso restringido, requiere aceptacion de condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna del modelo (si es un transformer de difusion, un modelo de flujo, etc.) en la informacion disponible. Se sabe que es un modelo de difusion para texto a imagen, integrado en la libreria diffusers mediante el pipeline `BriaFiboPipeline`. El modelo base es `briaai/FIBO`, y Fibo-1.5 es un ajuste fino (finetune) de ese modelo base.

El entrenamiento se realizo exclusivamente con capturas estructuradas largas en formato JSON, siguiendo el paradigma VGL. Esto implica que el modelo aprende a generar imagenes a partir de prompts estructurados que describen atributos de forma desacoplada (por ejemplo, sujeto, fondo, estilo, iluminacion, etc.). La version 1.5 incorpora destilacion de pocos pasos, lo que reduce el numero de pasos de muestreo necesarios para obtener una imagen de calidad, y mejora el realismo y las texturas respecto a la version anterior.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, con especial enfasis en la adherencia al prompt y la controlabilidad.
- Expansion automatica de prompts: el modelo puede tomar una idea corta y expandirla a un prompt JSON estructurado y rico antes de generar la imagen.
- Generacion de prompts estructurados JSON como salida intermedia, lo que permite a los desarrolladores inspeccionar y modificar la descripcion antes de la generacion.
- Soporte de tres modos de uso: generacion directa, expansion de prompt y generacion, y posiblemente otros modos documentados en la plataforma de BRIA.
- Integracion con API (Bria Platform, Fal.ai, Replicate), nodos de ComfyUI e inferencia local.
- Capacidad de desacoplamiento de atributos visuales, lo que facilita la edicion controlada de caracteristicas especificas de la imagen.
- Multilingue: solo ingles (segun los datos de Hugging Face).

## Casos de uso

- Generacion de imagenes para prototipado de productos: un equipo de diseno puede describir un concepto en lenguaje natural y obtener una imagen de alta fidelidad en pocos pasos, gracias a la destilacion de pocos pasos de Fibo-1.5.
- Automatizacion de contenido visual para marketing: el modelo puede generar variaciones de una misma escena cambiando atributos especificos (iluminacion, fondo, estilo) mediante prompts JSON estructurados, lo que reduce el trabajo manual de retoque.
- Integracion en pipelines de generacion de imagenes en produccion: al ser JSON-native, los desarrolladores pueden construir flujos donde el prompt estructurado se genera, valida y modifica programaticamente antes de la inferencia, mejorando la predecibilidad.
- Creacion de datasets sinteticos para entrenamiento de otros modelos de vision: la capacidad de controlar atributos de forma desacoplada permite generar imagenes etiquetadas con metadatos estructurados, utiles para tareas de clasificacion o segmentacion.
- Desarrollo de aplicaciones de edicion de imagenes asistida: aunque el modelo es de generacion, su salida JSON puede usarse como entrada para otros modelos de edicion, facilitando la composicion de escenas complejas.
- Despliegue on-premise con Fibo Lite: para entornos con requisitos de privacidad o latencia, BRIA ofrece una version reducida del modelo (Fibo Lite) que mantiene las mismas capacidades de controlabilidad y generacion estructurada con menor coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de MMLU, HumanEval, GSM8K u otras metricas estandar para modelos de generacion de imagenes (como FID, CLIP score, etc.) en las fuentes consultadas.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM para Fibo-1.5 en la informacion disponible.
- El tamano del repositorio es de 42,2 GB, lo que sugiere que los pesos se distribuyen en precision fp32 o fp16 (probablemente fp16, dado el uso de safetensors). Para un modelo de 8,29 B de parametros, se estima que la inferencia en fp16 requiere al menos 16 GB de VRAM, y en fp32 alrededor de 33 GB, pero estos valores son estimaciones no confirmadas por BRIA.
- No se indica si el modelo cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). Dado el tamano, es probable que quepa en estas tarjetas con cuantizacion, pero no hay datos oficiales.
- Opciones de despliegue: API gestionada (Bria Platform, Fal.ai, Replicate), nodos de ComfyUI, e inferencia local mediante diffusers. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, ya que es un modelo de difusion, no un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de generacion de imagenes de tamano similar (por ejemplo, SDXL, Flux, etc.) en las fuentes consultadas. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones de licencia en Hugging Face antes de su descarga, lo que puede limitar su uso en entornos automatizados.
- Licencia bria-fibo: no se especifican los terminos exactos, pero es probable que incluya restricciones de uso comercial o de redistribucion. Es necesario revisar la licencia completa antes de su uso en produccion.
- Idioma: el modelo solo soporta ingles, lo que limita su aplicacion en entornos multilingues.
- Riesgo de alucinacion visual: como cualquier modelo de generacion de imagenes, puede producir artefactos o inconsistencias en escenas complejas, especialmente con prompts ambiguos.
- Sesgos: no se ha publicado informacion sobre sesgos en los datos de entrenamiento ni en las salidas del modelo.
- Dependencia de prompts estructurados: el rendimiento optimo requiere que los prompts sigan el formato JSON esperado; prompts libres pueden dar resultados suboptimos.
- Sin informacion sobre cuantizacion: no se documentan formatos de cuantizacion oficiales, lo que puede dificultar el despliegue en hardware con VRAM limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briaai/Fibo-1.5
- Modelo base FIBO: https://huggingface.co/briaai/FIBO
- Pagina oficial de Fibo: https://bria.ai/fibo
- Repositorio GitHub de FIBO: https://github.com/Bria-AI/FIBO
- Paper (referencia en tags): arxiv:2511.06876
