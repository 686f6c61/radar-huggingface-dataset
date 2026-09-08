# failed09/bashkir-lid

## Resumen

El modelo **bashkir-lid** es un clasificador ligero de identificación de idioma desarrollado por **failed09** que decide si un texto corto está escrito en **bashkir** o en **ruso**. Está diseñado para tareas de filtrado de corpus bashkir y para aplicaciones locales donde priman la velocidad y la ligereza del sistema. A diferencia de los transformadores modernos, usa extracción de características TF-IDF a nivel de caracteres (`char_wb`, n-gramas de 2 a 4) y un clasificador lineal, todo exportado a **ONNX** para ejecutarse con `onnxruntime` y `numpy`. El modelo es relevante porque el bashkir es una lengua minoritaria y este tipo de herramienta permite automatizar la separación de textos bashkir frente al ruso sin necesidad de infraestructura pesada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador lineal sobre características TF-IDF de n-gramas de caracteres (`char_wb`, 2–4), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bashkir (ba), ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo combina dos etapas simples: primero transforma el texto de entrada en un vector sparse de TF-IDF usando n-gramas de caracteres dentro de una ventana de palabra (`char_wb`) con tamaños de 2 a 4. Después, un clasificador lineal asigna la probabilidad de que el texto pertenezca a bashkir o ruso. Todo el pipeline está congelado y exportado a ONNX, por lo que la inferencia se reduce a operaciones de convolución o dependientes de matrices, sin necesidad de GPU. Los datos de entrenamiento no se redistribuyen: el autor indica que los textos de entrenamiento permanecen en el proyecto fuente, lo que limita la reproducibilidad pero no impide usar el modelo exportado. No hay menciones a RLHF, DPO ni técnicas de alineamiento, ya que no es un modelo generativo.

## Capacidades

- Identificación binaria de idioma para textos cortos: decide si el texto está en bashkir o en ruso.
- Diseñado para filtrar corpus extensos de forma rápida y con un footprint mínimo.
- Ejecución local mediante `onnxruntime` y `numpy`, sin dependencias de frameworks grandes.
- No dispone de soporte de tool/function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni generación de texto.
- Limitado a los dos idiomas para los que fue entrenado; no detecta otras lenguas túrquicas cercanas.

## Casos de uso

- **Filtrado de corpus bashkir**: el modelo se puede aplicar a texto mixto procedente de la web para separar automáticamente documentos en bashkir de los rusos, preparando datos para entrenar modelos de lenguaje bashkir.
- **Moderación de foros o redes comunitarias**: una plataforma que aloje contenido en bashkir puede usar este clasificador para etiquetar mensajes entrantes y aplicar reglas de moderación específicas por idioma.
- **Aplicaciones de escritura y teclado móvil**: al detectar la lengua de una frase corta, el sistema puede seleccionar automáticamente el diccionario de corrector ortográfico o el modelo de traducción adecuado.
- **Postprocesado de OCR en archivos históricos**: los fragmentos de texto extraídos de documentos digitalizados pueden ser ambiguos; este modelo ayuda a decidir si el texto pertenece a un original bashkir o ruso, incluso con errores de OCR.
- **Preprocesado de reconocimiento de voz**: en pipelines de transcripción multilingües, el texto reconocido puede clasificarse para enrutarlo al modelo de lenguaje o pronunciación bashkir o ruso correspondiente.
- **Analítica lingüística en redes sociales**: permite calcular la proporción de publicaciones en bashkir frente a ruso en una muestra, sin depender de servicios externos ni enviar datos a la nube.
- **Archivado y metadatos**: etiquetar automáticamente correos, tickets o documentos cortos como `ba` o `ru` para su clasificación en sistemas de gestión documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no requiere VRAM; la inferencia es ligera y puede ejecutarse íntegramente en CPU.
- **GPU recomendada**: ninguna. Basta con cualquier CPU moderna; el modelo está pensado para entornos de recursos limitados.
- **Compatibilidad con hardware de consumo**: al ser ejecutable en CPU, funciona en prácticamente cualquier máquina, incluyendo portátiles, Raspberry Pi o servidores pequeños.
- **Opciones de despliegue**: se integra fácilmente en Python mediante `onnxruntime`. No se indican adaptaciones específicas para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- **Latencia y throughput**: no disponibles, pero por su naturaleza de clasificador lineal sobre TF-IDF se espera una latencia en milisegundos por muestra en CPU. No se proporcionan mediciones concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos de este modelo en la información proporcionada. Se pueden considerar alternativas como `langdetect` o modelos basados en `fastText`, pero no existen métricas publicadas para este clasificador que permitan una comparación rigurosa. Tampoco hay información sobre el rendimiento relativo frente a modelos neuronales de identificación de idioma.

## Limitaciones y advertencias

- Es un clasificador **exclusivamente binario** (`ba` vs `ru`); no está diseñado para distinguir correctamente tártaro, chuvash o cualquier otro idioma.
- Los textos cortos, nombres propios, fragmentos de OCR con ruido y las secuencias mixtas de idioma pueden producir predicciones ambiguas.
- El repositorio no incluye los datos de entrenamiento, lo que dificulta la verificación de la calidad del modelo.
- No se han publicado métricas de precisión, recall ni F1; cualquier uso en producción debería ir precedido de una evaluación propia de la tarea concreta.
- Al ser un modelo no generativo, no debe utilizarse para tareas de generación de texto o reescritura.
- La licencia Apache-2.0 cubre el código y el export del modelo, pero la procedencia de los textos de entrenamiento no queda aclarada en la ficha.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/failed09/bashkir-lid](https://huggingface.co/failed09/bashkir-lid)
- Dataset relacionado: [https://huggingface.co/datasets/failed09/bashkir-frequency-index](https://huggingface.co/datasets/failed09/bashkir-frequency-index)
- Dataset relacionado: [https://huggingface.co/datasets/failed09/bashkir-wikipedia-monolingual](https://huggingface.co/datasets/failed09/bashkir-wikipedia-monolingual)
