# LiseTY/Clairveil-MOSS-Image-LoRA

## Resumen

Clairveil (澄彩) es un LoRA de estilo para generación de imágenes anime, entrenado por LiseTY (梦影Ers) sobre el modelo base KBlueLeaf/MOSS-Image-heal. No es un modelo completo, sino un adaptador de bajo rango (rank 32) que se carga sobre los checkpoints de la familia MOSS-Image para imprimir un estilo consistente de líneas detalladas, coloración ligera y expresión suave de personajes. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador en formato safetensors.

El problema que resuelve es la falta de coherencia estilística en la generación de ilustración anime con MOSS-Image: el LoRA permite mantener un mismo lenguaje visual en composiciones muy distintas (una sola figura, grupos de cuatro personajes, escenas sin personajes) sin reentrenar el modelo base. Es relevante para usuarios de ComfyUI que ya trabajan con el ecosistema MOSS-Image y quieren un acabado de estilo concreto sin cambiar de pipeline.

La información disponible es la model card del autor. No se publican parámetros del modelo base, contexto, benchmarks ni métricas cuantitativas de calidad. Los datos de entrenamiento son 99 imágenes seleccionadas, 9750 pasos publicados y un entrenamiento de aproximadamente 2,34 segundos por iteración en una RTX 4090 con AI Toolkit 0.13.34.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre difusión MOSS-Image; rank 32 |
| Parametros totales | no disponible (adaptador LoRA; el repo pesa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | el LoRA se distribuye en safetensors; el autor ha probado el adaptador con checkpoints INT8 ConvRot del modelo base |
| Idiomas soportados | zh, en (prompts en chino e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`claireveil.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 32 entrenado con AI Toolkit 0.13.34 sobre KBlueLeaf/MOSS-Image-heal, un checkpoint de la familia MOSS-Image. El entrenamiento usó 99 imágenes filtradas, con anotaciones que no repiten la descripción del estilo, y se publica el peso en el paso 9750. El autor reporta un tiempo de aproximadamente 2,34 segundos por iteración en una RTX 4090 y la aparición de un estilo reconocible a partir del paso 1000.

El adaptador es compatible, según pruebas del autor, con los checkpoints nativos MOSS-Image-SFT y MOSS-Image-Base, además del base de entrenamiento MOSS-Image-heal, en sus versiones INT8 ConvRot. Los ejemplos de la model card se generaron con `moss_image_sft_int8_convrot.safetensors`, el codificador de texto `qwen3.5_9b_bf16.safetensors` y el VAE `flux2-vae.safetensors` en un flujo de ComfyUI. No se detalla la composición del dataset ni si hubo etapas de RLHF o DPO, algo que no aplica de forma directa a un LoRA de estilo.

## Capacidades

- Generación de ilustración anime en estilo Clairveil mediante el disparador `clairveil` en el prompt positivo.
- Control de intensidad del estilo: el autor recomienda empezar en 0,75 y subir a 1,0 para un efecto más marcado.
- Composición de un solo personaje, grupos de varios personajes y escenas sin figuras humanas.
- Soporte de prompts en lenguaje natural y de prompts estructurados en formato JSON de MOSS (MOSS JSON), incluida una variante escapada para el campo de texto de ComfyUI.
- Integración en flujos de ComfyUI mediante `LoraLoaderModelOnly`.
- Compatibilidad con MOSS-Image-SFT, MOSS-Image-Base y MOSS-Image-heal en INT8 ConvRot.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo: es exclusivamente text-to-image.

## Casos de uso

- Ilustración de personajes anime con estilo homogéneo: cargando el LoRA en ComfyUI con el disparador `clairveil` y una intensidad de 0,75 se obtiene un acabado de líneas finas y color suave adecuado para piezas de portafolio o encargos.
- Series de ilustraciones con continuidad visual: al mantener el mismo LoRA y la misma configuración de muestreo entre imágenes se conserva el lenguaje de color y trazo en un conjunto de láminas, algo útil para webcómics o fichas de personaje.
- Escenas grupales: los ejemplos de cuatro personajes a 1680×944 con seed 666 demuestran que el estilo se sostiene en composiciones multitudinarias, útil para ilustraciones de eventos o key visuals.
- Fondos y escenarios sin personajes: el ejemplo del invernadero con piano muestra que el LoRA también afecta a entornos, lo que sirve para ilustración de interiores y escenarios de juego.
- Prototipado rápido de dirección de arte: comparar la misma semilla con y sin LoRA (los flujos de comparación incluidos) permite decidir el grado de estilo antes de producir en serie.
- Integración en pipelines de generación por lotes: al ser un adaptador safetensors de 0,2 GB y compatible con varios checkpoints MOSS-Image, se puede versionar y sustituir en un flujo de ComfyUI sin tocar el resto del grafo.
- Reproducción de ejemplos y calibración: los archivos `prompts/`, `workflows/` y `parameters/` permiten replicar exactamente las imágenes de referencia con la misma semilla y ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta comparaciones visuales con la misma semilla y los mismos ajustes de muestreo (25 pasos, CFG 2,5, sampler er_sde / simple, SLG layer 22 de 0 a 0,5, seed 666) entre la versión con LoRA y sin LoRA.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el adaptador; el consumo vendrá determinado por el checkpoint MOSS-Image base y su cuantización (el autor usa variantes INT8 ConvRot).
- GPU recomendadas: el autor entrenó en una RTX 4090; para inferencia se presupone una GPU consumer de gama alta o superior, pero no se publican requisitos oficiales.
- Cabe en GPU consumer: sí, según el uso declarado del autor en RTX 4090, aunque sin cifras de VRAM.
- Opciones de despliegue: ComfyUI con `LoraLoaderModelOnly`; el autor menciona también un flujo online en RunningHub. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. Solo se conoce el tiempo de entrenamiento (aproximadamente 2,34 s por iteración en RTX 4090).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de estilo comparables ni datos de rendimiento que permitan una comparación cuantitativa. Como referencia estructural, el adaptador se apoya en la familia MOSS-Image (MOSS-Image-heal, MOSS-Image-SFT y MOSS-Image-Base), pero no se aportan sus parámetros, contexto ni métricas.

## Limitaciones y advertencias

- No se publican métricas objetivas de calidad, sesgos ni tasas de alucinación visual; la evaluación es únicamente cualitativa mediante comparaciones de imagen.
- El estilo puede interferir con rasgos de personaje o detalles de vestuario; el propio autor señala que a intensidad 0,75 se conservan más pliegues y volumen que a 1,0 en el ejemplo del mar de nubes.
- El disparador es `clairveil`, mientras que el archivo se llama `claireveil.safetensors`; confundir ambos provoca que el estilo no se active.
- El adaptador está pensado para la familia MOSS-Image; su uso con otros modelos de difusión no está documentado ni garantizado.
- Los prompts de referencia están en chino e inglés; no hay evidencia de rendimiento con prompts en castellano.
- Los personajes de terceros que aparecen en los ejemplos pertenecen a sus respectivas obras y titulares de derechos; la licencia Apache-2.0 del adaptador no concede derechos sobre esas propiedades intelectuales.
- Uso comercial permitido por la licencia Apache-2.0, pero conviene verificar las condiciones del checkpoint base MOSS-Image utilizado, que no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiseTY/Clairveil-MOSS-Image-LoRA
- Modelo base de entrenamiento: https://huggingface.co/KBlueLeaf/MOSS-Image-heal
- Flujo de comparación online en RunningHub: https://www.runninghub.ai/ai-detail/2121111171997974530
