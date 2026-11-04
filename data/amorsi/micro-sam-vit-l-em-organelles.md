# amorsi/micro-sam-vit-l-em-organelles

## Resumen

`micro-sam vit_l_em_organelles` es un checkpoint preentrenado del proyecto micro-sam, desarrollado por el Computational Cell Analytics group (Universidad de Gottinga, con contribuciones de EMBL-EBI) como extensión del modelo Segment Anything (SAM) de Meta para segmentación de imágenes de microscopía. Este repositorio concreto, alojado por el usuario `amorsi`, es un espejo sin modificaciones de los pesos originales distribuidos a través del registro de bioimage.io.

El modelo resuelve el problema de la segmentación interactiva de estructuras subcelulares en imágenes de microscopía electrónica (EM), un dominio donde SAM original rinde notablemente peor que en imágenes naturales. La variante `vit_l_em_organelles` está especializada en orgánulos celulares y emplea el backbone ViT-L de SAM, con un decodificador de máscaras adaptado y afinado específicamente para este tipo de datos.

Es relevante para investigadores en biología celular y bioimagen que necesitan segmentar orgánulos con intervención mínima del usuario (puntos o cajas como prompt), y que quieren ejecutar el modelo localmente sin depender de servicios en la nube. El repositorio ocupa 1,3 GB e incluye tanto el encoder (`model.pt`) como el decoder (`decoder.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L (encoder tipo Segment Anything) con decodificador de máscaras adaptado |
| Parametros totales | no disponible (el repo pesa 1,3 GB; coherente con ViT-L, ~300 M en el encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible (el código de micro-sam es MIT; la licencia de los pesos debe consultarse en la fuente original) |
| Formato de pesos | PyTorch (`model.pt`, `decoder.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Segment Anything: un encoder de imágenes basado en Vision Transformer (ViT-L en esta variante) que produce embeddings de la imagen, y un decodificador ligero que genera máscaras de segmentación a partir de prompts (puntos, cajas o máscaras). micro-sam adapta este esquema al dominio de microscopía mediante fine-tuning sobre datos de bioimagen, en este caso orientado a orgánulos en imágenes de microscopía electrónica.

La model card indica que se trata de una copia sin modificar del checkpoint publicado en el registro de micro-sam, con hashes xxh128 que coinciden con los de `util.py` del repositorio oficial. No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO (no aplicables en un modelo de segmentación). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación de imágenes de microscopía electrónica, en particular de orgánulos subcelulares.
- Segmentación interactiva mediante prompts: puntos positivos/negativos, cajas delimitadoras y máscaras.
- Generación de máscaras de instancia a partir de embeddings de imagen precalculados (encoder + decoder separados).
- Integración con el ecosistema micro-sam para flujos de anotación y segmentación automática.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de la imagen.

## Casos de uso

- Anotación asistida de orgánulos en microscopía electrónica: el investigador coloca puntos sobre una mitocondria o un lisosoma y el modelo propone la máscara, reduciendo el tiempo de etiquetado manual en datasets de biología celular.
- Segmentación a gran escala de imágenes EM en pipelines de análisis: el modelo puede procesarse por lotes sobre tiles de imagen para generar máscaras de orgánulos que alimenten análisis morfométricos.
- Control de calidad en datasets de entrenamiento: usar las máscaras predichas como referencia para detectar anotaciones inconsistentes en corpus existentes.
- Segmentación guiada por cajas en regiones de interés: cuando el usuario delimita una región con una caja, el modelo genera la máscara del orgánulo contenido, útil en imágenes de baja relación señal-ruido.
- Integración en herramientas de análisis celular: al estar disponible como checkpoint de micro-sam, puede cargarse con `model_type="vit_l_em_organelles"` en scripts de Python para flujos reproducibles.
- Investigación en segmentación de dominio específico: servir como baseline afinado para comparar con otros modelos de segmentación en EM o para fine-tuning adicional sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo de 1,3 GB sugiere que el encoder ViT-L cabe en GPUs consumer con suficiente memoria (orientativamente 8-16 GB según resolución y lote).
- GPU recomendadas: no especificadas en la información; por el tamaño del backbone ViT-L, GPUs como RTX 3090/4090, A100 o H100 son opciones razonables, pero no se confirma en la fuente.
- Compatibilidad con GPU consumer: probable por el tamaño del checkpoint, pero no confirmada en la información.
- Opciones de despliegue: el modelo está pensado para usarse con la librería micro-sam (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-sam vit_l_em_organelles | no disponible (ViT-L) | imagen de microscopía EM | Segmentación de orgánulos | no disponible (código micro-sam MIT) | HuggingFace (espejo) |
| SAM (Meta) ViT-L | ~300 M en encoder | imagen natural | Segmentación genérica | Apache 2.0 (según versión) | Público |
| micro-sam vit_b_em_organelles | no disponible (ViT-B) | imagen de microscopía EM | Segmentación de orgánulos | ídem | Registro micro-sam |
| micro-sam vit_l_lm | no disponible (ViT-L) | imagen de microscopía óptica | Segmentación de orgánulos | ídem | Registro micro-sam |

La comparación con SAM original es la más directa: comparten backbone y esquema de prompts, pero micro-sam está afinado para microscopía, donde SAM genérico suele dar peores resultados. Las variantes `vit_b` y `vit_l_lm` del propio micro-sam permiten elegir entre menor coste computacional (ViT-B) o dominio de microscopía óptica en lugar de EM.

## Limitaciones y advertencias

- Es un espejo no oficial: el autor del repo no es el desarrollador original; conviene verificar los hashes y consultar la fuente original para la licencia de los pesos.
- La licencia de los pesos no está declarada en la información disponible; el uso comercial requiere comprobación explícita en el repositorio de micro-sam o bioimage.io.
- Modelo especializado en microscopía electrónica de orgánulos: su rendimiento fuera de ese dominio (imágenes naturales, microscopía óptica u otras modalidades) no está garantizado.
- No se documentan sesgos ni métricas de robustez en la información proporcionada.
- Riesgo de máscaras imprecisas en imágenes con bajo contraste, ruido alto o estructuras solapadas, inherente a la segmentación interactiva.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; cualquier expectativa en ese sentido es incorrecta.
- El repo no incluye documentación de uso más allá de la referencia a micro-sam; la integración requiere conocer la API de esa librería.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amorsi/micro-sam-vit-l-em-organelles
- Repositorio oficial de micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Registro de checkpoints en `util.py`: https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos originales (encoder): https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/humorous-crab/1.2/files/vit_l.pt
- Pesos originales (decoder): https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/humorous-crab/1.2/files/vit_l_decoder.pt
