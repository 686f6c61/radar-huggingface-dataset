# LiquidAI/LFM3-VL-2B-MLX-6bit

## Resumen

LFM3-VL-2B-MLX-6bit es una cuantizacion de 6 bits en formato MLX del modelo multimodal LFM3-VL-2B de Liquid AI, optimizada para inferencia en Apple Silicon. Se trata de un modelo de imagen-a-texto (image-text-to-text) con aproximadamente 1.918 millones de parametros, disenado para tareas conversacionales que combinan comprension de imagenes y generacion de lenguaje. Esta version concreta reduce los pesos a 1,78 GB mediante cuantizacion afin de 6 bits con grupos de 64, lo que permite ejecutar el modelo en equipos Mac con memoria unificada.

El modelo pertenece a la familia LFM3 de Liquid AI y hereda las capacidades del modelo base LFM3-VL-2B, incluyendo soporte multilingue en 16 idiomas y un modo de razonamiento opcional ("thinking mode") que se activa explicitamente. La relevancia de esta variante radica en que hace accesible un modelo vision-lenguaje de ~2B parametros en hardware de consumo Apple, sin necesidad de GPU dedicada ni de conexion a la nube.

Al estar cuantizado a 6 bits, el modelo prioriza un equilibrio entre calidad y huella de memoria, siendo adecuado para prototipado, despliegue en local y aplicaciones de privacidad donde los datos no deben salir del dispositivo. La licencia lfm1.0 impone condiciones especificas que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text de la familia LFM3) |
| Parametros totales | 1.918.181.888 (~1,92B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine quantization con grupos de 64 (formato MLX) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (MLX), repo de 1,8 GB |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos especificos en la informacion proporcionada. El modelo base LFM3-VL-2B es un modelo multimodal de la familia LFM3 de Liquid AI que procesa entradas de imagen y texto para generar respuestas conversacionales. La model card de esta version cuantizada remite a la model card del modelo original para los detalles de arquitectura y uso, pero dichos detalles no se incluyen en la informacion disponible.

Respecto al entrenamiento, no se han publicado en la informacion disponible datos sobre numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras tecnicas de alineacion. La unica innovacion tecnica documentada en esta ficha es la cuantizacion: pesos en 6 bits con cuantizacion afin y tamano de grupo de 64, orientada a inferencia en Apple Silicon mediante MLX.

## Capacidades

- Generacion de texto conversacional a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Comprension de imagenes: descripcion, analisis y respuesta a preguntas sobre contenido visual.
- Modo de razonamiento opcional ("thinking mode"), que permanece desactivado salvo que se active explicitamente con `--enable-thinking`.
- Soporte multilingue en 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Ejecucion local en Apple Silicon mediante MLX-VLM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Descripcion automatica de imagenes en local: el modelo puede generar descripciones de imagenes directamente en un Mac, sin enviar datos a servidores externos, lo que resulta adecuado para flujos con requisitos de privacidad.
- Asistencia visual para accesibilidad: integrado en una aplicacion de escritorio, puede describir el contenido de imagenes al usuario y responder preguntas sobre ellas en castellano u otros idiomas soportados.
- Prototipado rapido de aplicaciones vision-lenguaje: al ocupar 1,78 GB en formato MLX, permite iterar en un portatil Apple sin infraestructura GPU, usando MLX-VLM como runtime.
- Analisis de capturas y documentos con texto: el modelo puede procesar imagenes que contengan texto y responder preguntas sobre su contenido, util para extraccion asistida en entornos de oficina.
- Clasificacion y anotacion asistida de imagenes: uso del modelo para generar etiquetas o resumenes de lotes de imagenes en pipelines locales de curacion de datos.
- Chat multimodal multilingue: atencion conversacional en 16 idiomas con soporte de imagenes, adecuado para demos y herramientas internas dirigidas a equipos internacionales.
- Evaluacion de modelos en dispositivo: util como banco de pruebas para comparar calidad de cuantizacion 6-bit frente al modelo base en tareas de vision-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 1,78 GB en formato MLX 6-bit; el consumo total de memoria debe sumar el overhead del runtime MLX-VLM, el procesador de vision y el contexto de generacion (hasta 16384 tokens segun el ejemplo de la model card).
- Hardware objetivo: Apple Silicon (Mac con memoria unificada). No esta pensado para GPU NVIDIA ni CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; este formato MLX esta orientado a chips Apple.
- Cabe en equipos Apple de consumo: si, dado el reducido tamano de pesos; equipos con 8 GB o mas de memoria unificada deberian poder ejecutarlo, aunque el margen real depende del contexto y del procesador de vision.
- Despliegue: MLX-VLM version 0.7.11 o superior. Ejemplo de la model card: `python -m mlx_vlm.generate --model LiquidAI/LFM3-VL-2B-MLX-6bit --image <IMAGE PATH> --prompt "Describe this image." --enable-thinking --temperature 0.1 --top-p 1.0 --top-k 50 --min-p 0.0 --repetition-penalty 1.1 --max-tokens 16384`.
- vLLM, llama.cpp, Ollama, TGI: no disponibles para este formato segun la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. Como referencia estructural, esta variante se puede comparar con el modelo base del que deriva:

| Modelo | Parametros | Formato | Memoria de pesos | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-6bit | ~1,92B | MLX safetensors 6-bit | 1,78 GB | Apple Silicon | lfm1.0 |
| LFM3-VL-2B (base) | ~1,92B | no disponible | no disponible | no disponible | lfm1.0 |

La comparacion con alternativas de otros fabricantes (por ejemplo, modelos vision-lenguaje de ~2B de otras familias) no se incluye porque no hay datos disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; como todo modelo entrenado con datos web, es previsible que herede sesgos, pero no se documentan.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en tareas de descripcion de imagenes conviene verificar las salidas.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion proporcionada.
- Limitaciones de idioma: aunque se listan 16 idiomas, no se especifica el nivel de calidad por idioma; el rendimiento en idiomas distintos del ingles puede ser inferior.
- Restricciones de licencia: la licencia lfm1.0 (etiquetada como "other") puede imponer condiciones adicionales para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en produccion.
- Dependencia de plataforma: el formato MLX solo es utilizable en Apple Silicon; no es portable a CUDA ni a CPU generica sin conversion.
- Version de runtime: requiere MLX-VLM >= 0.7.11; versiones anteriores pueden no cargar el modelo correctamente.
- Cuantizacion: la precision de 6 bits puede degradar ligeramente la calidad frente al modelo base, especialmente en tareas de razonamiento visual complejo.
- Modo thinking: el razonamiento esta desactivado por defecto; si se necesita, debe activarse explicitamente y consume mas tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-6bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Guia de despliegue MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
