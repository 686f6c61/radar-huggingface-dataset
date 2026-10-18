# alvago/wan-1.3b-gguf

## Resumen

alvago/wan-1.3b-gguf es un repositorio de redistribución en formato GGUF de los modelos de generación de vídeo Wan2.1 en su variante pequeña de 1.3B: Wan-AI/Wan2.1-T2V-1.3B (texto a vídeo) y Wan-AI/Wan2.1-VACE-1.3B (edición y composición vídeo-a-vídeo). No es un modelo entrenado desde cero, sino una conversión a GGUF (cuantizaciones q4_0 y q8_0) publicada por el usuario alvago para poder ejecutar estos modelos en ComfyUI mediante los nodos comfyui-gguf y gguf-node, o directamente con la herramienta de línea de comandos gguf-connector.

El interés práctico reside en que reduce la barrera de entrada para probar un modelo de difusión de vídeo en hardware de consumo: los pesos originales en precisión completa de un modelo de 1.3B no son enormes, pero el ecosistema GGUF permite cargarlos en cuantizaciones de 4 y 8 bits junto con el encoder de texto umt5 y el VAE también en GGUF, todo dentro del mismo flujo de trabajo de ComfyUI. El autor incluye un conjunto completo de ficheros (modelo de difusión + encoder + VAE) para que la inferencia funcione sin descargar pesos en safetensors.

Se trata de un artefacto con muy poca tracción (16 descargas y 0 likes en el momento de la consulta) y sin benchmarks publicados. La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial, pero la validación técnica del paquete GGUF concreto es escasa y conviene verificar la calidad de las cuantizaciones antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (Wan2.1) con encoder de texto umt5 y VAE separado; detalles de la arquitectura interna no disponibles en la información proporcionada |
| Parámetros totales | 126.892.531 (~1,27B; dato de safetensors del modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusión; no usa ventana de contexto autorregresiva. El prompt se procesa con el encoder umt5) |
| Tipos de cuantización | GGUF q4_0 y q8_0 para wan2.1-t2v-1.3b y wan2.1-vace-1.3b; encoder umt5 también en GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de difusión, encoder de texto y VAE) |
| Pipeline | text-to-video |
| Tamaño del repositorio | 78,2 GB |
| Descargas / likes | 16 / 0 |
| Fecha de creación | 2026-10-18 |

## Arquitectura y entrenamiento

El paquete no introduce arquitectura propia: reproduce en GGUF los pesos de Wan2.1 en su variante de 1.3B. Según la model card, el flujo requiere tres componentes diferenciados —el modelo de difusión (`wan`), el encoder de texto (`umt5`) y el VAE (`pig`)—, que se colocan respectivamente en `models/diffusion_models`, `models/text_encoders` y `models/vae` de ComfyUI. La generación se controla con prompt y negative prompt (los ejemplos del widget usan `blurry ugly bad` como negativo), lo que confirma un esquema de difusión condicionada por texto con guiado por clasificador libre.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base utilizó RLHF, DPO o ajuste por preferencias; tampoco se documentan innovaciones técnicas del modelo original más allá de lo que implica el pipeline (encoder umt5 + difusión + VAE). La aportación concreta de este repositorio es la conversión a GGUF y su integración con las herramientas de calcuis (gguf-node, gguf-connector) y con ComfyUI-GGUF de city96, declarado completamente compatible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con control mediante prompt y negative prompt.
- Variante VACE para tareas de imagen a vídeo (i2v) y vídeo a vídeo (v2v): según el autor, el modelo VACE no necesita un clip de visión adicional para funcionar y es más rápido que la variante "fun" en las pruebas iniciales.
- Ejecución en cuantizaciones q4_0 y q8_0, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.
- Integración con ComfyUI mediante comfyui-gguf y gguf-node, incluyendo soporte del encoder umt5 en GGUF.
- Uso por línea de comandos con gguf-connector (`ggc w2`) para iterar sobre los ficheros GGUF del directorio actual.
- Capacidad multilingüe: limitada al inglés según los metadatos del repositorio.
- No se documentan tool calling, function calling, razonamiento multi-paso ni modo "thinking"; son capacidades ajenas a un modelo de difusión de vídeo.

## Casos de uso

- Prototipado rápido de texto a vídeo en estación de trabajo: cargar `wan2.1-t2v-1.3b-q4_0.gguf` en ComfyUI y generar clips cortos para validar ideas de guion sin necesidad de GPUs de datacenter.
- Previsualización de storyboards: generar animáticas de pocos segundos a partir de descripciones textuales para revisar encuadre, movimiento de cámara y atmósfera antes de producir el plano real.
- Generación de material de relleno para edición: clips de recurso (nieve, paisajes, movimiento de cámara) que se insertan como B-roll en montajes.
- Edición y recomposición de vídeo existente con la variante VACE: al soportar i2v y v2v sin clip de visión adicional, permite transformar o extender material ya grabado desde un flujo de ComfyUI.
- Pruebas de concepto de investigación en difusión de vídeo: comparar la calidad de q4_0 frente a q8_0 sobre el mismo prompt para medir la degradación introducida por la cuantización.
- Docencia y talleres: el conjunto completo de GGUF (modelo + encoder + VAE) permite montar un ejercicio reproducible de generación de vídeo en aulas con hardware modesto, sin descargas de decenas de gigabytes en safetensors.
- Automatización de pipelines de contenido: invocar gguf-connector desde scripts para generar variaciones de un mismo prompt con distintas semillas y negative prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente menciona observaciones cualitativas del autor: el modelo VACE sería notablemente más rápido que la variante "fun" en las pruebas iniciales, sin aportar cifras de latencia, FPS ni métricas de calidad (FVD, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia de orden de magnitud, los pesos de un modelo de 1.3B ocupan aproximadamente 1 GB en q8_0 y 0,7 GB en q4_0; a ello hay que sumar el encoder umt5, el VAE y el estado de activaciones de los tensores de vídeo, que en difusión de vídeo suele dominar el consumo. Estas cifras son una estimación orientativa, no un dato medido del repositorio.
- GPU recomendadas: no disponibles. El autor no especifica hardware de referencia; el requisito real depende de resolución, número de fotogramas y longitud del clip, parámetros que tampoco se documentan.
- Viabilidad en GPU de consumo: el formato GGUF y la talla de 1.3B apuntan a que el modelo puede caber en tarjetas de consumo, pero no hay confirmación ni cifras publicadas. La cuantización reduce el peso de los pesos, no el coste de atención sobre latentes de vídeo.
- Opciones de despliegue: ComfyUI con comfyui-gguf (city96) o gguf-node, y ejecución directa por CLI con gguf-connector (`ggc w2`). No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. Solo se indica cualitativamente que VACE es más rápido que la variante "fun".
- Aviso del autor: con el encoder umt5 en GGUF puede producirse un OOM tras reconstruir el tokenizer en el primer prompt; el tokenizer permanece en memoria durante la sesión y basta con relanzar el prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alvago/wan-1.3b-gguf (este) | ~1,27B | GGUF q4_0 / q8_0 | Prompt de texto (umt5), inglés | Apache 2.0 | HuggingFace, 16 descargas |
| Wan-AI/Wan2.1-T2V-1.3B | ~1,27B | Safetensors (precisión original) | Prompt de texto, inglés | Apache 2.0 | HuggingFace (modelo base) |
| Wan-AI/Wan2.1-VACE-1.3B | No disponible | Safetensors | Texto + imagen/vídeo (i2v, v2v) | Apache 2.0 | HuggingFace (modelo base) |
| Otras alternativas de texto a vídeo de talla similar (p. ej. CogVideoX-2B, LTX-Video) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es frente a los pesos originales: este repositorio no mejora el modelo, solo cambia el formato y reduce el peso en disco a costa de posible pérdida de calidad en q4_0. Los datos de rendimiento comparado con alternativas de la misma categoría no están disponibles.

## Limitaciones y advertencias

- No hay benchmarks ni evaluación cuantitativa publicada: la calidad de las cuantizaciones q4_0 y q8_0 no está medida frente al modelo original.
- Tracción muy baja (16 descargas, 0 likes) y sin actualizaciones desde la fecha de creación: no hay evidencia de mantenimiento ni de validación por parte de la comunidad.
- El repositorio ocupa 78,2 GB pese a que el modelo declara ~1,27B de parámetros; conviene revisar el contenido real antes de clonarlo, porque el tamaño es desproporcionado respecto a los pesos del modelo.
- Idioma limitado al inglés: los prompts en castellano no están soportados oficialmente y pueden degradar el resultado.
- Riesgo de artefactos visuales, incoherencias temporales y alucinación de contenido en la generación de vídeo, agravado por la cuantización a 4 bits.
- El propio autor advierte de posibles OOM con el encoder umt5 en GGUF durante el primer prompt de cada sesión.
- Requiere versiones actualizadas de los nodos para soportar el encoder umt5 en GGUF; una instalación desactualizada rompe el flujo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se documentan en esta ficha las condiciones adicionales que Wan-AI pueda imponer en la documentación de sus modelos base; conviene revisarlas antes de un despliegue comercial.
- No apto para tareas de NLP (razonamiento, código, tool calling): es un modelo de difusión de vídeo, no un LLM.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alvago/wan-1.3b-gguf
- Organización del modelo base: https://huggingface.co/Wan-AI
- Modelo base texto a vídeo: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base VACE: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- gguf-node (PyPI): https://pypi.org/project/gguf-node
- gguf-node (repositorio): https://github.com/calcuis/gguf
- gguf-node (releases): https://github.com/calcuis/gguf/releases
- gguf-connector (PyPI): https://pypi.org/project/gguf-connector
- Captura de referencia del flujo en ComfyUI: https://raw.githubusercontent.com/calcuis/comfy/master/wan-gguf.png

Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo ni sobre Wan2.1; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
