# mradermacher/Aurum-2B-Uncensored-i1-GGUF

## Resumen

Aurum-2B-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo Aurum-2B-Uncensored, desarrollado originalmente por el usuario 2Beyes y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 1.940 millones de parametros (1.942.653.248 exactos segun los pesos en safetensors) que parte de la familia Qwen3.5, segun las etiquetas del autor, y que ha sido sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo y censura, dando lugar a una variante "uncensored". El modelo declara soporte de tool calling y capacidades de vision.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de ~2B parametros en hardware de consumo gracias a sus cuantizaciones GGUF con calibracion imatrix, que van desde ~1,1 GB (Q2_K) hasta ~1,7 GB (Q6_K). El repositorio tiene un tamano total de 18,7 GB porque incluye todas las variantes de cuantizacion, pero cada archivo individual es ligero. Esta pensado para experimentacion, prototipado rapido y despliegue en entornos con recursos limitados.

Conviene senalar que la informacion disponible es escasa: no se publican datos de contexto, composicion del dataset de entrenamiento, resultados de benchmarks ni detalles del proceso de abliteration. La model card del cuantizador se limita a describir las variantes GGUF generadas. Todo lo que no consta se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5, segun etiquetas del autor) |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (calibradas con imatrix) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Aurum-2B-Uncensored se presenta, segun las etiquetas del autor, como derivado de la familia Qwen3.5, lo que sugiere una arquitectura transformer decoder-only con atencion por grupos de consultas (GQA) y posiblemente mecanismos de atencion eficiente propios de esa familia. Sin embargo, la informacion proporcionada no detalla la configuracion exacta de capas, dimensiones ocultas, numero de cabezas ni el esquema de atencion. Tampoco se especifica si incorpora modulos de vision dedicados (aunque la etiqueta "vision" y la mencion a archivos mmproj en el repositorio estatico lo indican) ni como se integran.

En cuanto al entrenamiento, no se dispone de datos sobre el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similar. El termino "abliterated" en las etiquetas sugiere que se aplico una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para eliminar el comportamiento de censura, pero no se documenta el procedimiento concreto. La cuantizacion i1 con imatrix la realiza mradermacher usando un fichero de importancia generado a partir de calibracion, lo que mejora la calidad respecto a cuantizaciones estaticas a igual tamano.

## Capacidades

- Generacion de texto conversacional en ingles, con un modo presumiblemente desinhibido tras la abliteration.
- Soporte declarado de tool calling / function calling, lo que permite integracion en flujos que requieran invocar funciones externas.
- Capacidades de vision segun la etiqueta "vision"; los archivos mmproj (proyector multimodal) se alojan en el repositorio estatico de mradermacher, no en este.
- Razonamiento multi-turno y uso en agentes, aunque sin datos que confirmen el rendimiento en tareas de varios pasos.
- Capacidades multilingues limitadas al ingles segun la model card; no se documentan otros idiomas.
- Al estar "uncensored", responde a peticiones que otros modelos rechazarian, lo que amplia el rango de temas tratables a costa de eliminar salvaguardas.

## Casos de uso

- Prototipado rapido en local: con cuantizaciones de 1,1 a 1,7 GB, el modelo se ejecuta en portatiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, ideal para validar ideas antes de escalar a modelos mayores.
- Experimentacion con modelos sin censura: investigadores que estudian el comportamiento de modelos abliterated pueden comparar respuestas frente a la version original y analizar el efecto de la ablacion en dominios sensibles.
- Generacion de texto asistida en entornos con recursos limitados: redaccion de borradores, resumenes y respuestas conversacionales donde el coste por inferencia es critico y no se requiere maxima calidad.
- Integracion en pipelines de agentes con tool calling: el modelo puede invocar funciones en flujos automatizados, aunque su tamano reducido limita la fiabilidad en cadenas de razonamiento largas.
- Procesamiento de imagenes en el borde (edge): con los archivos mmproj del repositorio estatico, puede emplearse para tareas basicas de descripcion o extraccion de informacion de imagenes en dispositivos modestos.
- Educacion y divulgacion: sirve como ejemplo didactico de cuantizacion imatrix, abliteration y despliegue GGUF en cursos y talleres, dado su reducido tamano y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~1,1 GB (i1-Q2_K) y ~1,7 GB (i1-Q6_K) solo para los pesos; con overhead de contexto y cache KV, prever entre 2 y 4 GB adicionales segun la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones mayores; en A100/H100 el modelo esta sobredimensionado y no aprovecha el hardware.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI soportan GGUF de forma parcial, por lo que para produccion convendria usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. A modo orientativo, un modelo de ~2B en Q4_K_M en una RTX 4060 suele superar las decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aurum-2B-Uncensored-i1-GGUF | ~1,94B | no disponible | Apache 2.0 | GGUF | Vision, tool calling, abliterated |
| Qwen2.5-1.5B-Instruct (referencia) | ~1,5B | 32K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Sin vision, con censura |
| Llama-3.2-1B-Instruct (referencia) | ~1,2B | 128K | Llama 3.2 Community | safetensors, GGUF | Sin vision en la variante de texto |
| SmolLM2-1.7B-Instruct (referencia) | ~1,7B | 8K | Apache 2.0 | safetensors, GGUF | Sin vision |

Las cifras de contexto y licencia de los modelos de referencia corresponden a sus especificaciones publicas habituales; no se dispone de comparaciones de rendimiento directas con Aurum-2B-Uncensored.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay datos objetivos de calidad, lo que impide garantizar su rendimiento frente a alternativas establecidas.
- Riesgo de alucinacion elevado: un modelo de ~2B parametros tiene capacidad limitada de razonamiento y factualidad; no es adecuado para tareas que exijan precision alta.
- Modelo "uncensored": la abliteration elimina salvaguardas, por lo que puede generar contenido ofensivo, ilegal o danino; requiere filtros y supervision en produccion.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto desconocido: al no documentarse la longitud de contexto, es arriesgado usarlo en tareas de contexto largo sin validacion previa.
- Licencia Apache 2.0: permite uso comercial, pero el autor original no ofrece garantias ni asume responsabilidad por el contenido generado.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_S degradan notablemente la calidad; se recomienda IQ4_XS o Q4_K_M como minimo.
- Vision no incluida en este repo: los archivos mmproj estan en el repositorio estatico, lo que anade un paso de descarga adicional.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Aurum-2B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/2Beyes/Aurum-2B-Uncensored
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Aurum-2B-Uncensored-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Aurum-2B-Uncensored-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
