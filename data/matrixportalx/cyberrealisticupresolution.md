# matrixportalx/CyberrealisticUpResolution

## Resumen

CyberrealisticUpResolution es un checkpoint de generacion de imagenes a partir de texto derivado de Stable Diffusion 1.5 y reconvertido para ejecutarse sobre la NPU (HTP) de los SoC Qualcomm Snapdragon. Lo publica el usuario matrixportalx en Hugging Face y su proposito no es ofrecer un modelo nuevo entrenado desde cero, sino empaquetar un SD 1.5 en el runtime QNN 2.28 para que pueda inferirse en movil dentro de la aplicacion Ruya / Local Dream.

La relevancia del artefacto es de ingenieria de despliegue: la U-Net se exporta como QNN context binary para la NPU, mientras que el text encoder y el VAE se sirven aparte mediante MNN (CPU/GPU), con activaciones de 16 bits y un tier de compilacion pensado para HTP v73. Esto permite generar imagenes de forma local y offline en telefonos Snapdragon sin depender de servidores, algo clave en privacidad y coste de inferencia.

El repositorio ocupa 1,1 GB, no registra descargas ni likes en la fecha de publicacion y no incluye resultados de benchmarks ni informacion de entrenamiento propia. La model card esta redactada en turco y define explicitamente el publico objetivo: usuarios de los SoC Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (U-Net + VAE) con codificador de texto CLIP, base Stable Diffusion 1.5; convertida a Qualcomm QNN |
| Parametros totales | No disponible en la model card. El checkpoint base SD 1.5 ronda los 860 M en la U-Net, ~123 M en el text encoder CLIP y ~83 M en el VAE |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens de prompt (limite del codificador de texto CLIP de SD 1.5) |
| Tipos de cuantizacion | Activaciones de 16 bits en el runtime QNN; precision exacta de los pesos del context binary no disponible. text_encoder y VAE en MNN |
| Idiomas soportados | No disponible (los prompts dependen del text encoder CLIP, orientado principalmente a ingles) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | QNN context binary (U-Net, NPU) y MNN (text_encoder/VAE), empaquetados en `CyberrealisticUpResolution_qnn2.28_8gen2.zip` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un modelo de difusion latente que opera sobre un espacio comprimido (VAE con factor de reduccion 8x) y aplica una U-Net con bloques de atencion cruzada condicionada por embeddings de texto de CLIP. El aporte de este repositorio no es el entrenamiento, sino la conversion: la U-Net se compila a un context binary de QNN 2.28 para la NPU (HTP), mientras que el text encoder y el VAE quedan en MNN y se ejecutan en CPU/GPU. El tier de compilacion es `8gen2` con HTP `v73` y activaciones de 16 bits.

No hay informacion en la model card sobre el dataset de entrenamiento, el numero de tokens vistos ni sobre fases de ajuste como RLHF o DPO (no aplicables a este tipo de modelo). Tampoco se documenta una innovacion tecnica propia mas alla del pipeline de exportacion, cuyo codigo se publica en un repositorio de GitHub aparte. El nombre sugiere una relacion con la familia CyberRealistic del mismo autor (presente en Civitai y en otros repos de Hugging Face), pero la model card no lo confirma explicitamente como checkpoint de partida.

El modelo soporta un conjunto amplio de resoluciones de salida: 512x512, 768x512, 512x768, 512x1024, 1024x512, 768x768, 512x1152, 576x1280, 768x1024, 1024x768, 640x1408 y 1024x1024.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en resoluciones de 512x512 hasta 1024x1024 y formatos verticales y apaisados.
- Inferencia 100 % local sobre la NPU del dispositivo, sin conexion a internet y sin enviar los prompts a un servidor.
- Estilo fotografico y renderizado limpio, heredado del checkpoint base SD 1.5 sobre el que se construye.
- Multiples relaciones de aspecto para adaptarse a distintos casos (retrato, paisaje, cuadrado).
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, ControlNet ni img2img en la informacion disponible.
- No dispone de tool calling, function calling, modo agente ni razonamiento multi-paso: es un modelo generativo de imagenes, no un LLM.
- El soporte multilingue de prompts queda limitado por el text encoder CLIP; no se especifica ninguna lista de idiomas.

## Casos de uso

- Generacion de imagenes offline en movil: el usuario escribe un prompt en la aplicacion Ruya / Local Dream y la NPU del Snapdragon produce la imagen sin red, util para entornos sin conectividad o con requisitos estrictos de privacidad.
- Aplicaciones de creadores de contenido en Android: artistas y disenadores pueden generar bocetos o referencias visuales sobre la marcha, aprovechando las 12 resoluciones soportadas para adaptarlas a distintas redes sociales.
- Prototipado rapido de conceptos visuales: equipos de producto pueden iterar ideas de UI, ilustracion o marketing directamente en un telefono de gama alta, sin depender de una GPU de escritorio.
- Demos y material educativo sobre IA en el dispositivo: sirve para mostrar como se despliega una U-Net de difusion sobre una NPU Qualcomm en charlas, talleres o asignaturas de sistemas embebidos.
- Pruebas de rendimiento de NPU para desarrolladores de Qualcomm: el paquete permite medir latencia y consumo de un modelo de difusion real en HTP v73 dentro de un pipeline QNN 2.28.
- Generacion de imagenes en contextos regulados de privacidad (sanidad, legal, periodismo): al no salir el prompt del dispositivo, se evita la exposicion de datos sensibles a terceros.
- Personalizacion de fondos o avatares en aplicaciones Android: el modelo puede integrarse como funcionalidad nativa para producir imagenes de perfil cuadradas (512x512 o 1024x1024) segun preferencias del usuario.
- Sustitucion de servicios en la nube en prototipos con presupuesto limitado: al ejecutarse en el propio telefono, elimina el coste por inferencia de API durante la fase de experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo objetivo: telefonos con SoC Snapdragon que expongan HTP v73, en concreto Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3.
- El runtime de inferencia es QNN 2.28 con la U-Net en la NPU y el text encoder y el VAE en MNN (CPU/GPU), por lo que no requiere una GPU externa ni CUDA.
- VRAM/RAM estimada: no disponible en la model card; el artefacto descargable ocupa 1,1 GB de almacenamiento antes de la importacion.
- No esta disenado para ejecutarse en GPU de escritorio (A100, H100, RTX 4090) ni a traves de frameworks CUDA; el context binary de QNN no es portable a estos entornos.
- Opciones de despliegue: importacion manual en Ruya / Local Dream mediante la ruta Settings > Import Custom Model. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion en este formato).
- Latencia y throughput: no disponibles. Dependeran del SoC concreto, de la resolucion de salida y del estado termico del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Resolucion nativa | Formato / destino | Licencia |
|---|---|---|---|---|---|
| CyberrealisticUpResolution | Base SD 1.5 (~1.000 M en el conjunto) | 77 tokens (CLIP) | 512x512, con soporte hasta 1024x1024 | QNN context binary + MNN para Snapdragon NPU | CreativeML Open RAIL-M |
| Stable Diffusion 1.5 (original) | ~860 M en la U-Net | 77 tokens (CLIP) | 512x512 | safetensors / PyTorch, GPU de escritorio o servidor | CreativeML Open RAIL-M |
| Stable Diffusion XL (base) | ~2.600 M en la U-Net | 77 tokens por encoder (doble text encoder) | 1024x1024 | safetensors / PyTorch, requiere GPU con VRAM alta | CreativeML Open RAIL++-M |

No se dispone de otros paquetes equivalentes de SD 1.5 compilados para QNN en la informacion proporcionada, por lo que la comparacion con alternativas de despliegue movil queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del dataset de entrenamiento original de SD 1.5 (LAION), con posibles estereotipos de genero, etnia, profesion y cultura en las imagenes generadas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir anatomia incorrecta, texto ilegible en la imagen, manos deformes o detalles incoherentes con el prompt.
- Vocabulario limitado: el limite de 77 tokens del codificador CLIP restringe los prompts largos y detallados, lo que obliga a reformular descripciones complejas.
- Idioma: no se especifica soporte multilingue; los prompts funcionaran mejor en ingles.
- Compatibilidad de hardware muy restringida: solo los SoC con HTP v73 indicados pueden ejecutar el context binary. Cualquier otro Snapdragon o GPU quedara fuera.
- Licencia: CreativeML Open RAIL-M incluye restricciones de uso (clausulas de uso aceptable); es obligatorio revisar sus condiciones antes de un uso comercial o de redistribucion.
- Artefacto sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluacion independiente.
- Fecha de publicacion en Hugging Face inusualmente avanzada (2026-09-29), lo que conviene verificar antes de integrarlo en cualquier pipeline de produccion.
- No se documentan garantias de mantenimiento, versionado ni compatibilidad futura con versiones posteriores de QNN.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matrixportalx/CyberrealisticUpResolution
- Repositorio de conversion a QNN: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- Repo relacionado CyberRealistic: https://huggingface.co/matrixportalx/CyberRealistic
- Repo relacionado CyberRealistic-2.5D: https://huggingface.co/matrixportalx/CyberRealistic-2.5D
- Ficha de CyberRealistic en Civitai: https://civitai.com/models/15003/cyberrealistic
- Ficha en free2aitools: https://free2aitools.com/model/matrixportalx/cyberrealistic
- Perfil de GitHub del autor: https://github.com/matrixportalx
