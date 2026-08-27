# oerbas/localpix-meinamix-v10

## Resumen

El modelo `oerbas/localpix-meinamix-v10` es una conversión a Core ML del modelo de difusión estable MeinaMix V10, desarrollado originalmente por Meina. Esta conversión, creada por oerbas, está pensada para ejecutarse en dispositivos Apple mediante el Neural Engine (ANE), y se distribuye como un bundle compilado `.mlmodelc` para su uso en la aplicación iOS LocalPix. El modelo original es un merge de varios modelos de anime (MeinaMix V1~6, MeinaPastel, MeinaHentai, Night Sky YOZORA, PastelMix y Facebomb) realizado con block weighted merges, y destaca por generar ilustraciones de estilo anime con alta calidad en rostros y ojos.

La relevancia de esta conversión radica en que permite ejecutar un modelo de generación de imágenes de calidad en dispositivos móviles Apple sin conexión a internet, aprovechando el acelerador neuronal integrado. El bundle incluye el VAE encoder, lo que habilita la funcionalidad image2image. El tamaño del repositorio es de 0.9 GB, y la licencia es CreativeML OpenRAIL-M, que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (conversión Core ML, atención SPLIT_EINSUM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imágenes) |
| Tipos de cuantizacion | 6-bit weight palettization |
| Idiomas soportados | no disponible (prompts típicamente en inglés) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Core ML compilado (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo original MeinaMix V10 es un modelo de difusión latente basado en la arquitectura Stable Diffusion, entrenado mediante merges ponderados por bloques de múltiples modelos preexistentes. No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens, ya que el autor del modelo original no los especifica. La conversión a Core ML se realizó con coremltools 9, aplicando paletización de pesos a 6 bits y atención SPLIT_EINSUM para optimizar la ejecución en el Neural Engine de Apple. El bundle compilado incluye tanto el VAE decoder como el encoder, lo que permite operaciones de image2image además de text-to-image.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con estilo anime.
- Edición de imágenes mediante image2image, gracias a la inclusión del VAE encoder.
- Ejecución completamente offline en dispositivos Apple con Neural Engine.
- Optimización para el acelerador neuronal (ANE) mediante atención SPLIT_EINSUM y cuantización de 6 bits.
- Compatible con la aplicación LocalPix para iOS.
- El modelo original recomienda activar la cuantización en samplers K y usar Hires.fix para mejorar la calidad de rostros y ojos en personajes lejanos.

## Casos de uso

- Generación de ilustraciones anime en dispositivos iOS: los usuarios pueden crear arte de estilo anime directamente desde su iPhone o iPad sin conexión, usando la app LocalPix. El modelo está optimizado para el Neural Engine, lo que reduce la latencia y el consumo energético frente a una ejecución en CPU o GPU.
- Edición de imágenes locales: gracias al VAE encoder incluido, se puede realizar image2image, por ejemplo, transformar un boceto o una foto en una ilustración anime manteniendo la composición.
- Prototipado rápido de concept art: diseñadores e ilustradores pueden generar variaciones de personajes o escenas en su dispositivo móvil durante sesiones de brainstorming, sin depender de servicios en la nube.
- Aplicaciones de entretenimiento y ocio: integración en apps de dibujo o juegos que necesiten generar contenido visual dinámico de forma local, respetando la privacidad del usuario al no enviar datos a servidores.
- Educación y aprendizaje de técnicas de prompting: al ser un modelo local, estudiantes y aficionados pueden experimentar con distintos prompts y parámetros sin coste por API, entendiendo cómo afectan al resultado.
- Generación de fondos y assets para proyectos personales: creadores de contenido pueden producir imágenes de fondo o sprites para sus proyectos (cómics, juegos, vídeos) directamente en su dispositivo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como FID, CLIP score o comparativas con otros modelos de conversión Core ML.

## Requisitos de hardware

- Dispositivos Apple con Neural Engine (ANE): iPhone, iPad y Mac con chip M1 o posterior.
- El bundle compilado `.mlmodelc` está diseñado para ejecutarse en el ANE, por lo que no requiere GPU dedicada.
- Tamaño del modelo: 0.9 GB en disco (pesos paletizados a 6 bits).
- Memoria RAM: no especificada, pero al ser un modelo de difusión, se recomienda al menos 4 GB de RAM en el dispositivo.
- Despliegue: integración directa en apps iOS mediante Core ML; no es compatible con vLLM, llama.cpp u otros frameworks de servidor.
- Latencia y throughput: no disponibles; dependerán del dispositivo concreto y de la resolución de salida.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Cuantización | Licencia | Uso en iOS |
|---|---|---|---|---|---|
| oerbas/localpix-meinamix-v10 | Core ML | 0.9 GB | 6-bit palettized | OpenRAIL-M | Sí, optimizado ANE |
| Meina/MeinaMix_V10 (original) | Safetensors / Diffusers | ~2 GB (fp16) | No cuantizado | OpenRAIL-M | No directo, requiere conversión |
| Apple/ml-stable-diffusion (conversión base) | Core ML | ~1.5 GB (fp16) | 6-bit o 8-bit | OpenRAIL-M | Sí, pero sin fine-tuning anime |

La conversión de oerbas ofrece la ventaja de estar específicamente adaptada al Neural Engine con paletización de 6 bits, reduciendo el tamaño y mejorando la eficiencia frente a una conversión genérica. El modelo original MeinaMix V10 no está disponible en formato Core ML, por lo que esta conversión cubre un hueco para desarrolladores iOS que quieran usar este estilo anime sin recurrir a servicios en la nube.

## Limitaciones y advertencias

- El modelo original MeinaMix V10 es un merge de varios modelos, algunos de los cuales pueden contener contenido NSFW; la licencia OpenRAIL-M impone restricciones de uso responsable, pero no garantiza la ausencia de sesgos o contenido problemático.
- La conversión a Core ML con paletización de 6 bits puede degradar ligeramente la calidad de las imágenes en comparación con el modelo original en fp16, especialmente en detalles finos o texturas.
- No se dispone de información sobre el dataset de entrenamiento del modelo original, por lo que no se pueden evaluar sesgos específicos.
- El modelo está pensado exclusivamente para dispositivos Apple con Neural Engine; no es portable a otras plataformas sin una reconversión.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero obliga a no utilizar el modelo para generar contenido ilegal o dañino, y a redistribuir los pesos bajo la misma licencia.
- No hay soporte para tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de generación de imágenes, no un LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oerbas/localpix-meinamix-v10
- Modelo original MeinaMix V10: https://huggingface.co/Meina/MeinaMix_V10
- Repositorio de conversión de Apple: https://github.com/apple/ml-stable-diffusion
- Página del modelo en PixAI: https://pixai.art/en/model/1619564846858460778
- Ficha en AI Model Zoo: https://zoo.bimant.com/model/201985
- Ficha en Tensor.Art: https://tensor.art/models/601193050896599326
