# gguf-org/idol-gguf

## Resumen

Idol es un modelo de generación de mallas 3D (image-to-3D) desarrollado por Sperid Labs, publicado originalmente como `speridlabs/idol` y distribuido en formato GGUF por el repositorio `gguf-org/idol-gguf`. El modelo toma una imagen de referencia y produce un activo 3D en formato GLB, apoyándose en un decodificador de malla independiente (`idol_decoder`), un VAE (`pig_flux2_vae`) y un codificador de visión (`dino_v3_vit_h`). No es, por tanto, un modelo de lenguaje: es un pipeline multimodal de reconstrucción 3D.

El checkpoint cuantizado en GGUF contiene 220.697.543 parámetros (aproximadamente 220,7 M) y el repositorio ocupa 4,2 GB, lo que sugiere que la mayor parte del peso corresponde a los componentes auxiliares (decodificador, VAE y CLIP vision) más que al modelo principal. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y la herramienta de referencia para ejecutarlo es `ggk`, un binario de inferencia compatible con GGUF.

La relevancia actual del modelo radica en que traslada la lógica de los modelos generativos difusos (VAE, LoRA, pasos de muestreo, CFG) al dominio de la geometría 3D, con soporte para LoRA de destilación (5 pasos), eliminación de fondo con BiRefNet y un modo "magnet" que aplica automáticamente los clips presentes en el directorio de trabajo. Es una pieza orientada a pipelines de creación de assets, no a chat ni a razonamiento textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline image-to-3D con decodificador de malla, VAE y CLIP vision; no se detalla la arquitectura interna) |
| Parametros totales | 220.697.543 (~220,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo no textual) |
| Tipos de cuantizacion | GGUF; el ejemplo de la model card usa `q8_0` y `f16` para componentes auxiliares |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base `speridlabs/idol`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por los comandos de la model card se deduce un pipeline compuesto por: un modelo principal (`idol-q8_0.gguf`), un decodificador de malla (`idol_decoder-q8_0.gguf`), un VAE (`pig_flux2_vae_fp32-f16.gguf`) y un codificador de visión basado en DINOv3 ViT-H (`dino_v3_vit_h-q8_0.gguf`). La presencia de un VAE tipo Flux y de un esquema de muestreo con `--steps` y `--cfg-scale` indica un proceso generativo de tipo difusión aplicado a la representación latente de la geometría, posteriormente decodificada a malla GLB.

No se han publicado en la información proporcionada datos sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. Sí se documenta la existencia de un LoRA de destilación (`idol_turbo_lora_v5`) que permite reducir la inferencia a 5 pasos con `cfg-scale 1`, lo que es una innovación práctica relevante para producción: baja el coste computacional del muestreo a cambio de una posible pérdida de fidelidad geométrica.

## Capacidades

- Generación de mallas 3D en formato GLB a partir de una imagen de referencia.
- Eliminación automática de fondo de la imagen de entrada mediante BiRefNet (`--mesh-background-model birefnet-f16.gguf`).
- Modo "magnet": aplica automáticamente los clips (`*.gguf`) presentes en el mismo directorio, simplificando la invocación.
- Soporte de LoRA para destilación de pasos (5-step LoRA) y ajuste del muestreo con `--steps` y `--cfg-scale`.
- Control del decodificador de malla y del codificador de visión como componentes separados.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.
- No se documentan capacidades de visión general (VQA, OCR) más allá del uso del CLIP vision como extractor de características para la generación 3D.

## Casos de uso

- Creación de assets para videojuegos: a partir de una ilustración o fotografía de referencia, el modelo genera una malla GLB que puede importarse en motores como Unity o Unreal; el modo "magnet" agiliza el procesado por lotes.
- Prototipado rápido de productos: convertir bocetos o renders 2D en mallas 3D para revisión temprana de forma y volumetría antes de modelado manual.
- Catalogación de e-commerce en 3D: generar vistas 3D de productos a partir de fotografías con fondo eliminado mediante BiRefNet, aptas para visores web.
- Previsualización en pipelines de impresión 3D: obtener una malla base que luego se retoca y repara en herramientas de escultura, reduciendo el tiempo de modelado inicial.
- Integración en herramientas DCC: invocar `ggk` desde scripts de Blender o Maya para generar variantes de un activo a partir de imágenes de referencia dentro de un flujo automatizado.
- Generación de contenido para realidad aumentada: producir mallas ligeras para experiencias AR móviles, donde el coste de inferencia con el LoRA de 5 pasos es asumible.
- Iteración de diseño con LoRA específicos: usar adaptadores entrenados para un estilo o categoría de objeto concreto y aplicar el muestreo acelerado para comparar variantes rápidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 4,2 GB y los ficheros de ejemplo son `q8_0` y `f16`; una estimación conservadora sitúa la inferencia completa (modelo, decodificador, VAE y CLIP vision) en el rango de 6-10 GB de VRAM, pero es una estimación, no un dato del autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con 8-12 GB o más, pero el autor no lo confirma.
- ¿Cabe en consumer GPU?: previsiblemente sí en tarjetas con suficiente VRAM para cargar los cuatro componentes; no confirmado por el autor.
- Opciones de despliegue: el autor documenta el binario `ggk` con soporte GGUF; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables directamente a este pipeline).
- Latencia y throughput: no disponibles. El LoRA de 5 pasos reduce el número de pasos de muestreo, lo que disminuye el coste frente a configuraciones con más pasos, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de image-to-3D (por ejemplo, Trellis, Hunyuan3D o TripoSR) que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de texto (MMLU, GSM8K, HumanEval) ni usarse para chat, código o razonamiento.
- La calidad de la malla depende fuertemente de la imagen de referencia; no se documentan límites de resolución ni de encuadre.
- El uso del LoRA de 5 pasos con `cfg-scale 1` puede degradar el detalle geométrico frente a muestreos más largos; conviene validar la fidelidad en el caso de uso concreto.
- No se documentan sesgos, pero al ser un modelo entrenado con datos visuales puede reflejar sesgos de representación en los objetos que genera.
- Riesgo de alucinación geométrica: el modelo puede inventar partes no visibles en la imagen de referencia; no se cuantifica en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes auxiliares (VAE `pig_flux2_vae`, DINOv3, BiRefNet), que pueden tener términos propios no detallados aquí.
- El ecosistema de ejecución (`ggk`) es específico del autor; la integración en producción requiere verificar su mantenimiento y compatibilidad.
- No se documentan idiomas ni contexto porque el modelo no procesa texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/gguf-org/idol-gguf
- Modelo base: https://huggingface.co/speridlabs/idol
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
