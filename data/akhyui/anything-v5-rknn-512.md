# AKHYui/anything-v5-rknn-512

## Resumen

Anything V5 + LCM → RKNN (RK3588 NPU) es una conversión del modelo de difusión texto-a-imagen Anything V5 (base Yntec/AnythingV5, arquitectura Stable Diffusion 1.5, especializado en ilustración anime) al formato RKNN de Rockchip para ejecutarse sobre la NPU del SoC RK3588. Lo publica el usuario AKHYui en HuggingFace y no aporta un modelo entrenado desde cero: el repositorio contiene los pesos ya convertidos con rknn-toolkit2 2.3.0 en fp16 con forma estática, más el código de despliegue (una WebUI basada en FastAPI y un script de línea de comandos).

La pieza técnica diferencial es la fusión manual de LCM-LoRA (latent-consistency/lcm-lora-sdv1-5, alpha=8.0) sobre el UNet antes de la conversión, lo que permite generar imágenes con solo 4 pasos de inferencia y CFG 1.0. Esa reducción de pasos es lo que hace viable la difusión en una placa ARM de bajo consumo sin GPU: la model card reporta unos 36 s por imagen a 512×512 con CFG 1.0 y unos 60 s con CFG 1.5-2.5 (dos pasadas con prompt negativo).

Su relevancia es de nicho pero clara: generación de imagen local, offline y sin coste de nube sobre hardware embebido RK3588. A fecha de creación de esta ficha el repositorio acumula 0 descargas y 0 likes, no se han publicado benchmarks de calidad y no aparece información adicional en la búsqueda web realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (Stable Diffusion 1.5: text encoder CLIP + UNet + VAE decoder) con LCM-LoRA fusionado |
| Parametros totales | No disponible. La model card solo indica el tamaño de los ficheros convertidos: text encoder ~238 M, UNet ~1,7 G, VAE decoder ~186 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen). El repositorio incluye tokenizer/ de CLIP; no se especifica el límite de tokens del prompt |
| Tipos de cuantizacion | fp16 (pesos RKNN). No se documentan variantes int8 ni otros niveles |
| Idiomas soportados | No disponible. Los prompts de ejemplo de la model card están en inglés |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | RKNN (fp16, forma estática, UNet de 3 entradas). No se distribuyen safetensors ni GGUF |
| Resolucion de salida | 512×512 fija |
| Pasos de inferencia | 4 (recomendado, vía LCM) |
| Autor | AKHYui |
| Runtime de placa | rknn-toolkit-lite2 2.3.x |
| Tamaño del repositorio | 2,2 GB |
| Fecha de publicacion / actualizacion | 2026-09-10 (ambas) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusión latente de Stable Diffusion 1.5, desplegada aquí como tres grafos RKNN independientes: `text_encoder/model.rknn` (CLIP, ~238 M), `unet/model.rknn` (~1,7 G, fp16) y `vae_decoder/model.rknn` (~186 M). El UNet convertido tiene 3 entradas y forma estática, condición necesaria para compilar sobre la NPU del RK3588. La conversión se realizó con rknn-toolkit2 2.3.0 y el repositorio incluye además la configuración de `LCMScheduler` y el tokenizer de CLIP.

No hay entrenamiento propio en este repositorio: es una conversión de pesos. Sobre el modelo base AnythingV5 se aplicó manualmente LCM-LoRA (`latent-consistency/lcm-lora-sdv1-5`) con alpha=8.0, técnica de destilación por consistencia latente que permite pasar de 20-50 pasos de muestreo a 4 sin reentrenar el modelo completo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni procesos de RLHF o DPO (no aplicables a un modelo de difusión de este tipo). Tampoco se detalla si hubo pérdida de fidelidad numérica en la conversión fp16, algo habitual en este tipo de despliegues y que conviene validar visualmente.

## Capacidades

- Generación de imágenes texto-a-imagen en resolución fija de 512×512.
- Estilo anime/ilustración, heredado del modelo base Anything V5.
- Inferencia few-step: 4 pasos con `--num-inference-steps 4`, gracias a la fusión de LCM-LoRA.
- Soporte de prompt negativo y escalado de clasificador libre (CFG) entre 1.5 y 2.5, a costa de duplicar el tiempo de cómputo.
- WebUI local servida con FastAPI en el puerto configurable (por defecto 8100), con gestión de historial de generaciones.
- Script de línea de comandos (`run_rknn-lcm.py`) con parámetros de tamaño, pasos, CFG y prompt, apto para procesamiento por lotes.
- Ejecución completamente offline sobre la NPU del RK3588, sin dependencia de servicios externos.
- No soporta tool calling, function calling ni flujos de agentes.
- No dispone de modo de razonamiento, entrada de visión, audio ni salida de texto: no es un modelo de lenguaje.
- Capacidades multilingües: no documentadas; el tokenizer incluido es el de CLIP y los ejemplos de uso están en inglés.

## Casos de uso

- Generación de ilustraciones anime en placas SBC: sobre un RK3588 (Orange Pi 5, Radxa Rock 5B y similares) el modelo produce imágenes de 512×512 en 36-60 s, lo que permite tener un generador de imágenes local sin GPU ni cuota de API.
- Aplicaciones con requisito de privacidad: al ejecutarse íntegramente en el dispositivo, los prompts y las imágenes nunca salen del equipo, algo adecuado para prototipos creativos o herramientas internas con contenido sensible.
- Instalaciones artísticas y kioscos interactivos: la WebUI de FastAPI permite montar una interfaz web accesible desde la red local, con historial de generaciones, sobre hardware de bajo consumo y sin ventilación agresiva.
- Generación de assets para videojuegos indie o prototipado visual: mediante el script CLI se pueden lanzar lotes de prompts con tamaño y pasos fijos para producir borradores de personajes o escenarios de estilo anime antes de un refinado manual.
- Bots de contenido para Discord, Telegram o foros: el modelo puede actuar como backend de un bot que reciba un prompt por mensaje, llame al endpoint HTTP local y devuelva la imagen generada, con CFG 1.0 para minimizar latencia.
- Demostraciones y docencia sobre despliegue en NPU: el repositorio es un ejemplo completo y reproducible de conversión de un pipeline de difusión de tres etapas a RKNN, útil para estudiar cuantización fp16, formas estáticas y aceleración por hardware.
- Procesamiento por lotes en local para variaciones de un mismo concepto: el modo CLI con prompt negativo permite generar series coherentes de ilustraciones sin coste marginal por imagen más allá de la electricidad.
- Evaluación comparativa de latencia edge frente a nube: sirve como referencia medida (36 s / 60 s por imagen en RK3588) para decidir entre inferencia local y servicios gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU, HumanEval u otros) en la información disponible. El único dato de rendimiento aportado por el autor es la latencia medida en placa:

| CFG | Descripcion | Tiempo por imagen (512×512, 4 pasos) |
|---|---|---|
| 1.0 | Una sola pasada, ignora el prompt negativo | ~36 s |
| 1.5-2.5 | Dos pasadas con CFG (incluye prompt negativo) | ~60 s |

Medición realizada sobre un RK3588 usando un único núcleo NPU, según la model card. No se indica la versión exacta del runtime ni la configuración de memoria durante la prueba.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588 con su NPU; el modelo no se ejecuta en x86 ni en GPU NVIDIA/AMD en formato RKNN.
- VRAM: no aplica, no hay ruta CUDA. Se necesita memoria del sistema suficiente para cargar ~2,1 GB de pesos más los buffers de inferencia y el proceso Python.
- GPU recomendadas: ninguna. Para usar el modelo base en GPU habría que recurrir a la versión PyTorch/safetensors de Yntec/AnythingV5 con LCM-LoRA.
- GPU de consumo: no es posible ejecutar este artefacto en una RTX 4090 u otra GPU de consumo; el formato RKNN está ligado al runtime de Rockchip.
- Dependencias de despliegue: `rknn-toolkit-lite2`, `diffusers`, `transformers`, `torch`, `fastapi`, `uvicorn`, `pillow` y `numpy<2` (el pin de versión es explícito en la model card).
- Servidores de inferencia compatibles: no se documenta soporte para vLLM, TGI, llama.cpp u Ollama; el despliegue previsto es el script propio `app.py` (FastAPI) o `run_rknn-lcm.py`.
- Latencia estimada: 36 s con CFG 1.0 y 60 s con CFG 1.5-2.5 por imagen de 512×512 y 4 pasos. No se publica throughput en lote ni consumo energético.
- Espacio en disco: 2,2 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Rol | Formato | Parametros | Resolucion / pasos | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|---|
| AKHYui/anything-v5-rknn-512 (este) | Modelo convertido listo para NPU RK3588 | RKNN fp16, forma estatica | No disponible (ficheros de ~2,1 GB en total) | 512×512 fijos, 4 pasos | 36 s (CFG 1.0) / 60 s (CFG 1.5-2.5) en RK3588, 1 núcleo NPU | CreativeML OpenRAIL-M |
| Yntec/AnythingV5 | Modelo base original | Safetensors / diffusers (PyTorch) | No disponible en la información proporcionada | No especificada en la información disponible | No disponible | CreativeML OpenRAIL-M |
| latent-consistency/lcm-lora-sdv1-5 | Adaptador LoRA de aceleración, no es un modelo completo | Safetensors (LoRA) | No disponible en la información proporcionada | No aplica (adaptador) | No disponible | No disponible en la información proporcionada |

La comparación relevante no es de calidad sino de formato de despliegue: este repositorio es la variante ejecutable en NPU de los dos anteriores, y solo es preferible si el destino es hardware Rockchip. Para cualquier otro entorno conviene partir del modelo base en PyTorch.

## Limitaciones y advertencias

- Resolución bloqueada a 512×512: el grafo RKNN tiene forma estática, por lo que no admite otras resoluciones sin reconvertir.
- Calidad limitada por LCM: 4 pasos de muestreo reducen el detalle y la coherencia fina frente a un muestreo de 20-50 pasos con el modelo base.
- Con CFG 1.0 el prompt negativo se ignora por completo; solo con CFG 1.5-2.5 se aplica, a cambio de duplicar el tiempo de generación.
- Dominio muy restringido: el modelo está orientado a ilustración anime y previsiblemente rinde mal en fotorrealismo, tipografía, diagramas o escenas realistas.
- Sesgos esperables del corpus anime del modelo base (representación de personajes, estereotipos de género, sesgos culturales) que no se documentan ni se mitigan en este repositorio.
- Riesgo de alucinación visual: anatomías incorrectas, manos deformes, artefactos y atributos inventados son habituales en modelos SD1.5 pocos pasos.
- Sin filtro de seguridad incluido: no se documenta ningún mecanismo de moderación de prompts ni de contenido generado; en producción hay que añadirlo por cuenta propia.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con las restricciones de la propia licencia (prohibición de usos ilegales, dañinos, médicos, de desinformación, etc.). Es obligatorio propagar esas restricciones a los usuarios finales. La model card aclara que el copyright de las imágenes generadas pertenece a quien las genera, pero los pesos siguen sujetos a OpenRAIL.
- Compatibilidad muy estrecha: requiere RK3588 y `rknn-toolkit-lite2` 2.3.x, además del pin `numpy<2`. No hay validación en otras plataformas Rockchip.
- Madurez del artefacto: 0 descargas y 0 likes, sin benchmarks de calidad, sin validación de terceros y sin historial de versiones más allá de la publicación inicial.
- Conversión fp16 de un pipeline de tres etapas sin métricas de divergencia publicadas: conviene comparar visualmente contra el modelo base antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AKHYui/anything-v5-rknn-512
- Modelo base: https://huggingface.co/Yntec/AnythingV5
- Adaptador LCM-LoRA para SD 1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- La búsqueda web realizada no devolvió resultados relevantes para este modelo (únicamente páginas de inicio de sesión de cuentas de Microsoft), por lo que no hay papers, blogs ni demos adicionales que enlazar.
