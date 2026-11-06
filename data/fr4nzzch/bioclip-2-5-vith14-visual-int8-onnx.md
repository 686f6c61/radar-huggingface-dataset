# fr4nzzch/bioclip-2.5-vith14-visual-int8-onnx

## Resumen

BioCLIP 2.5 ViT-H/14 image encoder int8 ONNX es una exportación del torreón visual del modelo `imageomics/bioclip-2.5-vith14`, desarrollado por el Imageomics Institute, al formato ONNX y cuantizado a int8 dinámico para su ejecución en navegador mediante onnxruntime-web y WebAssembly. No se ha reentrenado ni ajustado ningún peso: el repositorio, publicado por el usuario fr4nzzch, solo modifica el formato de los ficheros para hacer viable la inferencia en cliente sin servidor.

El modelo resuelve la extracción de características visuales en el dominio de la biodiversidad: dado un recorte de imagen de 224x224 píxeles, devuelve un embedding de 1024 dimensiones que puede compararse contra prototipos textuales o vectores de especies. Su relevancia práctica radica en que permite construir identificadores de especies completamente offline en el navegador, sin subir fotografías a ningún servidor, con un fichero de 637.881.455 bytes (unos 610 MB) que se descarga una sola vez y se conserva en el dispositivo.

El contexto de uso declarado por el autor es la app Ikiam Insectary, donde este encoder actúa como la opción "más precisa" del identificador de mariposas, combinado con un detector de alas y una cabeza clasificadora separada. La licencia MIT del modelo original se mantiene, lo que facilita su reutilización comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-H/14 (torreón visual de CLIP, exportado a ONNX) |
| Parámetros totales | no disponible (el fichero int8 ocupa 637.881.455 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | int8 dinámico sobre pesos MatMul; existe el fp32 original en el modelo base |
| Idiomas soportados | no disponible (modelo de extracción de características visuales) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero único `bioclip25h_visual_int8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer ViT-H/14, el torreón visual del modelo open_clip `hf-hub:imageomics/bioclip-2.5-vith14`. La entrada es un tensor float32 de forma `[1, 3, 224, 224]`, con RGB escalado a 0..1 y normalizado con la media y desviación típica de OpenAI CLIP, tal como hace open_clip para este modelo. La salida es el embedding de imagen de 1024 dimensiones antes de la normalización L2.

El proceso de conversión consistió en exportar el torreón visual a ONNX en fp32 y aplicar después cuantización dinámica int8 de los pesos MatMul con las herramientas de cuantización de onnxruntime. No hubo entrenamiento, ajuste fino ni modificación de pesos en este repositorio; los datos de entrenamiento originales corresponden al modelo base de Imageomics y no se detallan en la información disponible. La innovación técnica relevante es la reducción de tamaño y coste computacional suficiente para ejecutar el encoder en WebAssembly dentro de un navegador.

## Capacidades

- Extracción de características visuales: genera un embedding de 1024 dimensiones por imagen a partir de recortes de 224x224 píxeles.
- Clasificación zero-shot por similitud: al ser la torre visual de un modelo CLIP, los embeddings pueden compararse con embeddings textuales o prototipos de clase para identificar especies u otras categorías visuales.
- Ejecución en navegador: compatible con onnxruntime-web sobre WebAssembly, sin necesidad de GPU ni de backend servidor.
- Inferencia offline: el fichero se descarga una vez y se conserva en el dispositivo; las imágenes no se envían a ningún servidor.
- Integración con pipeline de identificación: pensado para encadenarse con un detector de alas y una cabeza clasificadora externa.
- No incluye torreón de texto, tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Identificación de mariposas offline en el navegador: la app Ikiam Insectary recorta la foto con el detector de alas, la rellena a un cuadrado de 224 px con interpolación bicúbica, ejecuta este encoder y pasa la característica normalizada a la cabeza clasificadora; todo ocurre en el dispositivo y las fotos no se suben.
- Aplicaciones de ciencia ciudadana sin conectividad: observadores en campo pueden identificar especies en zonas sin cobertura, ya que el modelo se descarga una vez (unos 610 MB) y funciona localmente.
- Catalogación de imágenes de biodiversidad: generación por lotes de embeddings de 1024 dimensiones para agrupar, buscar o deduplicar fotografías de fauna y flora en repositorios de iNaturalist u otras plataformas.
- Búsqueda visual por similitud: indexar embeddings de un catálogo de especies y recuperar las imágenes más próximas a una consulta, útil en herramientas de divulgación o educativas.
- Prototipado rápido de clasificadores zero-shot: comparar el embedding de una imagen con descripciones textuales de especies para validar hipótesis antes de entrenar un clasificador específico.
- Aplicaciones web de bajo coste en hardware modesto: al ejecutarse en WebAssembly sobre CPU x86, permite desplegar funciones de visión en portátiles y equipos sin GPU dedicada, reduciendo costes de infraestructura.
- Verificación de calidad en pipelines de anotación: usar la similitud entre embeddings para detectar imágenes mal etiquetadas o fuera de distribución antes de incorporarlas a un conjunto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta métricas de fidelidad de la cuantización frente al modelo fp32, evaluadas en octubre de 2026 sobre CPU x86:

| Métrica | Resultado |
|---|---|
| Similitud coseno media entre características int8 y fp32 | 0,997 |
| Coincidencia de especie top-1 en 2.936 fotos de mariposas de iNaturalist | 97,4 % |
| Coincidencia de especie top-1 en 4.049 fotos de campo adicionales | 95,8 % |
| Variación de precisión top-1 de especie (iNaturalist) | -0,5 puntos |
| Variación de precisión top-1 de especie (otras fotos de campo) | -0,7 puntos |

## Requisitos de hardware

- Tamaño en disco: 637.881.455 bytes (aproximadamente 610 MB) para el fichero ONNX int8.
- VRAM estimada: no disponible; el modelo está pensado para ejecución en CPU mediante onnxruntime-web y WebAssembly, no requiere GPU.
- GPU recomendadas: no aplica para el caso de uso declarado; en servidor podría ejecutarse en cualquier GPU compatible con onnxruntime, pero no se han publicado requisitos.
- ¿Cabe en GPU consumer? No hay datos al respecto; el escenario objetivo es el navegador sobre CPU.
- Opciones de despliegue: onnxruntime-web (WebAssembly) en navegador; onnxruntime nativo en servidor o escritorio.
- Latencia y throughput: no disponibles. El autor advierte que otras CPU, como las ARM de teléfonos, pueden redondear int8 de forma ligeramente distinta, lo que puede afectar a los resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fr4nzzch/bioclip-2.5-vith14-visual-int8-onnx | no disponible (fichero int8 de 637,9 MB) | no aplica (visión) | ONNX int8 | MIT | Hugging Face |
| imageomics/bioclip-2.5-vith14 (modelo base) | no disponible | no aplica (visión) | safetensors / open_clip | MIT | Hugging Face |
| fr4nzzch/butterfly-wing-detector-onnx | no disponible | no aplica (detección) | ONNX | AGPL-3.0 | Hugging Face |
| fr4nzzch/butterfly-id-classifier | no disponible | no aplica (clasificación) | no disponible | CC BY-NC 4.0 | Hugging Face |

El modelo base es la referencia directa: mismo encoder en fp32, mayor tamaño y mayor fidelidad numérica, pero sin la optimización para navegador. El detector de alas y la cabeza clasificadora son componentes complementarios del mismo pipeline, no alternativas al encoder.

## Limitaciones y advertencias

- No es un modelo generativo ni un LLM: no produce texto, no soporta tool calling ni razonamiento multi-paso; su única salida es un embedding visual.
- La cuantización int8 introduce una pérdida medible: la precisión top-1 de especie cae entre 0,5 y 0,7 puntos frente a fp32 en las evaluaciones del autor.
- Los resultados de cuantización se validaron en CPU x86; otras arquitecturas, como ARM en teléfonos, pueden redondear int8 de forma distinta y alterar las predicciones.
- El rendimiento está validado en el dominio de mariposas y fotos de campo; no hay garantías de comportamiento en otros dominios visuales.
- No se dispone de información sobre sesgos del modelo base ni sobre su cobertura de especies; el modelo base de Imageomics debería consultarse para esos detalles.
- La licencia MIT permite uso comercial con atribución, pero los componentes del pipeline tienen licencias distintas: el detector de alas es AGPL-3.0 y la cabeza clasificadora es CC BY-NC 4.0, lo que restringe el uso comercial del conjunto.
- El autor recomienda citar el trabajo de BioCLIP 2 / 2.5 y del Imageomics Institute; este repositorio no aporta pesos nuevos.
- El tamaño de descarga (unos 610 MB) puede ser prohibitivo en conexiones lentas o dispositivos con almacenamiento limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fr4nzzch/bioclip-2.5-vith14-visual-int8-onnx
- Modelo base: https://huggingface.co/imageomics/bioclip-2.5-vith14
- Detector de alas: https://huggingface.co/fr4nzzch/butterfly-wing-detector-onnx
- Cabeza clasificadora: https://huggingface.co/fr4nzzch/butterfly-id-classifier
- App Ikiam Insectary: https://ithomiini-ikiam.com/identificar/
