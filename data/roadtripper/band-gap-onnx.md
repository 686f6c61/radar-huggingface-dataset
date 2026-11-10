# roadtripper/band-gap-onnx

## Resumen
Band-gap crystal structure denoiser es un modelo de difusión para generación de estructuras cristalinas inorgánicas condicionado a una banda prohibida (band gap) objetivo calculada mediante DFT. Lo desarrolla el Yang Group (https://yanglonggroup.com) y se publica en Hugging Face bajo el identificador `roadtripper/band-gap-onnx`. Resuelve un problema de diseño inverso en ciencia de materiales: dado un valor deseado de band gap, muestrear estructuras cristalinas plausibles en lugar de limitarse a predecir propiedades sobre estructuras existentes.

El modelo es la red de denoising de un pipeline de difusión más amplio. La arquitectura es GemNet-T, una red neuronal de grafos con interacciones de tripletes pensada para sistemas periódicos, con 48,8 millones de parámetros en fp32 y exportada a ONNX (opset 17) con dimensiones dinámicas de átomos, aristas y tripletes. El modelo se distribuye específicamente para ejecutarse en el navegador mediante onnxruntime-web, ya que alimenta la aplicación web DeepData. El repositorio ocupa 0,2 GB e incluye los pesos `band_gap.onnx` y un fichero `band_gap.json` con nombres de entradas/salidas y el escalador del band gap.

La relevancia actual radica en que traslada un modelo generativo de materiales a inferencia completamente client-side, sin necesidad de GPU de servidor, y en que aborda una tarea de diseño inverso con condicionamiento físico explícito. La licencia AGPL-3.0, sin embargo, impone obligaciones copyleft fuertes que condicionan su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GemNet-T (red neuronal de grafos con interacciones de tripletes) como red de denoising de un modelo de difusión |
| Parametros totales | 48,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el grafo periódico se construye fuera de la red) |
| Tipos de cuantizacion | no disponible (se publica en fp32; el autor no documenta otras precisiones) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (opset 17), con metadatos en `band_gap.json` |

## Arquitectura y entrenamiento
El modelo es una red de denoising GemNet-T integrada en un esquema de difusión para estructuras cristalinas periódicas. GemNet-T modela interacciones entre átomos, aristas y tripletes, lo que permite capturar geometrías locales y ángulos en redes cristales. La exportación a ONNX mantiene dimensiones dinámicas para el número de átomos, aristas y tripletes, de modo que el mismo grafo computacional sirve para celdas de distinto tamaño. El grafo periódico de radio, la construcción de tripletes y el muestreador predictor-corrector guiado se ejecutan fuera de la red, en código del pipeline anfitrión.

El condicionamiento se realiza sobre el band gap DFT objetivo mediante un escalador incluido en `band_gap.json`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste por refuerzo o preferencias; tampoco se detalla el esquema exacto de difusión (tipo de proceso forward, número de pasos o guiado). La información pública se limita a la arquitectura de la red, el recuento de parámetros y el formato de exportación.

## Capacidades
- Generación de estructuras cristalinas inorgánicas mediante muestreo de difusión condicionado a un band gap DFT objetivo.
- Denoising de estructuras atómicas periódicas con grafos de radio y tripletes construidos externamente.
- Diseño inverso: dado un valor de band gap, producir estructuras candidatas en lugar de predecir propiedades sobre entradas dadas.
- Inferencia en navegador con onnxruntime-web, sin backend de GPU dedicado.
- Soporte de dimensiones dinámicas de átomos, aristas y tripletes en el grafo ONNX.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso en lenguaje natural ni procesamiento de visión, audio o texto.

## Casos de uso
- Diseño inverso de materiales con band gap objetivo: un investigador fija el band gap deseado y ejecuta el muestreador de difusión para obtener estructuras candidatas que luego valida con DFT. El modelo es adecuado porque el condicionamiento está integrado en la red de denoising.
- Exploración interactiva en el navegador: al ejecutarse con onnxruntime-web, permite a usuarios de la aplicación DeepData generar estructuras sin instalar dependencias ni disponer de GPU, lo que facilita demos y docencia.
- Cribado preliminar de candidatos: generar lotes de estructuras y filtrarlas por estabilidad o viabilidad antes de cálculos DFT costosos, reduciendo el espacio de búsqueda.
- Aumento de datasets de materiales: producir estructuras sintéticas condicionadas a rangos de band gap para entrenar o aumentar modelos predictivos de propiedades.
- Estudio de relaciones estructura-propiedad: comparar estructuras generadas para distintos band gaps objetivo y analizar qué motivos estructurales aparecen asociados a cada rango.
- Integración en pipelines de investigación reproducibles: el formato ONNX y el fichero de metadatos permiten encapsular la red en flujos con ONNX Runtime en Python o en el navegador, manteniendo el muestreador y el grafo periódico en el código anfitrión.
- Prototipado de herramientas educativas: mostrar en tiempo real cómo cambia una estructura cristalina al modificar el band gap objetivo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El modelo tiene 48,8 millones de parámetros en fp32, lo que equivale a aproximadamente 195 MB de pesos; el repositorio completo ocupa 0,2 GB.
- Está diseñado para ejecutarse en navegador con onnxruntime-web, por lo que puede correr en CPU de un portátil o estación de trabajo convencional.
- No se documentan requisitos de VRAM ni GPU recomendadas; al ser un modelo pequeño, es viable en GPU consumer, pero el autor no publica cifras.
- Opciones de despliegue: ONNX Runtime (Python, C++, JS/Web), onnxruntime-web en navegador. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- No se publican datos de latencia ni throughput; el coste depende del tamaño del grafo periódico (átomos, aristas, tripletes) y del número de pasos del muestreador.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Los modelos generativos de estructuras cristalinas condicionados a propiedades existen en la literatura (por ejemplo, enfoques de difusión para materiales), pero no se han facilitado datos de parámetros, contexto, rendimiento ni licencia que permitan una comparación rigurosa. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias
- Licencia AGPL-3.0: cualquier uso en un servicio en red obliga a liberar el código fuente derivado bajo la misma licencia; esto puede ser incompatible con productos propietarios.
- El modelo solo genera estructuras; no valida su estabilidad termodinámica ni garantiza que el band gap real coincida con el objetivo. Se requiere validación DFT posterior.
- No se documentan sesgos del dataset de entrenamiento, composición química cubierta ni dominios fuera de distribución.
- Riesgo de generar estructuras físicamente implausibles o no sintetizables; el muestreo de difusión no garantiza validez cristalográfica.
- El grafo periódico, los tripletes y el muestreador no forman parte del ONNX; su correcta implementación es responsabilidad del usuario y afecta a la calidad del resultado.
- No hay información sobre el proceso de entrenamiento, datos, ni evaluaciones independientes, lo que limita la confianza en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni mantenimiento.
- No aplica a tareas de lenguaje, visión, agentes ni tool calling.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/roadtripper/band-gap-onnx
- Yang Group: https://yanglonggroup.com
- Aplicación web DeepData: mencionada en la model card, sin URL proporcionada
- Paper, blog o repositorio adicional: no disponible
