# ArthurZ/cellpose-sam

## Resumen

Cellpose-SAM es un modelo de segmentacion celular publicado en HuggingFace bajo el identificador `ArthurZ/cellpose-sam`. Combina el ecosistema Cellpose, especializado en segmentacion de celulas en imagenes de microscopia, con el enfoque de Segment Anything Model (SAM), lo que permite generalizacion a tipos celulares e imagenes no vistas durante el entrenamiento. El repositorio contiene pesos en formato safetensors con 304.628.928 parametros totales (aproximadamente 305 millones) y ocupa 1.2 GB.

El modelo responde a un problema clasico en biologia computacional: la segmentacion celular generalista, es decir, detectar y delimitar celulas en imagenes de microscopia de distintas modalidades sin necesidad de reentrenar para cada nuevo conjunto de datos. La publicacion asociada, "Cellpose-SAM: superhuman generalization for cellular segmentation" (bioRxiv, abril de 2025), describe un modelo con gran capacidad de generalizacion que puede integrarse en el ecosistema Cellpose existente, incluyendo ajuste fino, entrenamiento con humano en el bucle, restauracion de imagen y procesamiento 3D.

El modelo es relevante ahora porque representa la confluencia de dos lineas de trabajo: los modelos fundacionales de segmentacion (SAM) y las herramientas especializadas de analisis de imagenes biomedicas. Sin embargo, la ficha publica de HuggingFace no proporciona informacion sobre licencia, idiomas, pipeline ni datos de benchmarks, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como variante de SAM aplicada a segmentacion celular; el detalle exacto no figura en la informacion proporcionada) |
| Parametros totales | 304.628.928 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a vision, no a texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de una descripcion detallada de la arquitectura interna, del numero de tokens de entrenamiento ni de la composicion del dataset. El identificador y la etiqueta `cellpose` sugieren que el modelo sigue la linea de Cellpose, que tradicionalmente emplea una red encoder-decoder que predice flujos de gradiente (flow fields) para separar instancias celulares, y que en esta variante incorpora el paradigma de Segment Anything Model (SAM). El recuento de 304,6 millones de parametros es compatible con un backbone tipo Vision Transformer de tamano base seguido de una cabeza de prediccion especifica para segmentacion celular, aunque este extremo no se confirma en la informacion disponible.

La publicacion asociada (bioRxiv, 2025) indica que el modelo busca una generalizacion "sobrehumana" en segmentacion celular y que puede adoptarse dentro del ecosistema Cellpose, que incluye ajuste fino, entrenamiento con humano en el bucle, restauracion de imagen y procesamiento 3D. No se detallan en la informacion proporcionada ni el regimen de entrenamiento (supervisado, RLHF, DPO u otros), ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal.

## Capacidades

- Segmentacion celular en imagenes de microscopia: el proposito principal del modelo es detectar y delimitar celulas individuales (segmentacion de instancias).
- Generalizacion a tipos celulares e imagenes no vistas: la publicacion asociada enfatiza la capacidad de generalizacion del modelo.
- Integracion con el ecosistema Cellpose: segun la fuente, admite ajuste fino, entrenamiento con humano en el bucle, restauracion de imagen y procesamiento 3D.
- Procesamiento de imagenes 3D: mencionado en la publicacion como parte del ecosistema soportado.
- Soporte de tool calling / function calling: no disponible (modelo de vision, no de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no es un modelo de lenguaje).
- Capacidades especiales (thinking mode, vision, audio): la unica capacidad documentada es vision aplicada a segmentacion celular; el resto no disponible.

## Casos de uso

- Segmentacion de celulas en experimentos de microscopia de rutina: el modelo puede procesar imagenes de cultivos celulares y devolver mascaras de instancia, reduciendo el trabajo manual de conteo y delimitacion.
- Analisis de imagenes de tejido en investigacion biomedica: permite identificar y separar celulas en cortes histologicos o imagenes de fluorescencia sin reentrenar para cada nuevo marcador.
- Pipeline de cribado de alto contenido (high-content screening): al integrarse en el ecosistema Cellpose, puede encadenarse a flujos automatizados que segmentan miles de imagenes y extraen metricas morfologicas por celula.
- Restauracion de imagen previa a la segmentacion: el ecosistema descrito incluye restauracion, lo que permite limpiar imagenes con ruido o baja relacion senal-ruido antes de segmentar.
- Analisis 3D de volumenes celulares: la publicacion menciona procesamiento 3D, util para reconstruir organoides, embriones o tejidos completos a partir de pilas de imagenes.
- Ajuste fino con datos propios (human-in-the-loop): un laboratorio puede corregir segmentaciones y reentrenar el modelo para adaptarlo a su modalidad de imagen especifica.
- Mapeo celular a gran escala: la busqueda web incluye trabajos de mapeo celular cerebral asistido por IA, escenario en el que un segmentador generalista como este resulta adecuado para procesar grandes volumenes de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas y la publicacion asociada se menciona en los resultados de busqueda, pero sin cifras concretas extraidas en la informacion proporcionada. No se deben asumir valores de Dice, IoU u otras metricas sin fuente verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 304,6 M de parametros, los pesos en precision completa (fp32) ocuparian aproximadamente 1,2 GB, en fp16 alrededor de 0,6 GB y en int8 alrededor de 0,3 GB; a ello hay que sumar la memoria de activaciones, que depende del tamano de imagen de entrada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por el tamano del modelo (aproximadamente 1,2 GB en el repositorio), es probable que quepa en GPU de consumo con suficiente VRAM, pero este extremo no se confirma en la informacion disponible.
- Opciones de despliegue: no disponible. El formato safetensors sugiere uso mediante PyTorch/Transformers, pero no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje que no aplican directamente aqui).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArthurZ/cellpose-sam | 304.628.928 | no disponible | Segmentacion celular | no disponible | HuggingFace |
| Cellpose (original) | no disponible | no disponible | Segmentacion celular | no disponible | Ecosistema Cellpose |
| Segment Anything Model (SAM) | no disponible | no disponible | Segmentacion general de imagenes | no disponible | Publico |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo de vision biomedica, su comportamiento dependera de la distribucion de datos de microscopia con la que se entreno; no se documenta en la informacion proporcionada.
- Riesgo de alucinacion: en modelos de segmentacion el equivalente seria producir mascaras erroneas o fusionar celulas adyacentes; no se aportan datos especificos.
- Limitaciones de contexto o idioma: no aplicable como modelo de lenguaje; no se documentan limitaciones de resolucion o modalidad de imagen.
- Restricciones de licencia para uso comercial: la licencia figura como no disponible, por lo que no puede confirmarse si se permite uso comercial. Es un punto critico antes de cualquier despliegue en produccion.
- Caveats para produccion: el repositorio tiene solo 4 descargas y 0 likes, lo que sugiere que es una publicacion reciente o poco validada por la comunidad; no se ha confirmado el pipeline en HuggingFace; no hay benchmarks publicos en la informacion disponible; conviene verificar la procedencia y autoria antes de usar en entornos clinicos o regulados.

## Enlaces

- HuggingFace: https://huggingface.co/ArthurZ/cellpose-sam
- Publicacion Cellpose-SAM (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.04.28.651001v1.full-text
- Mapeo celular cerebral asistido por IA (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S0896627325009833
- Protocolo de caracterizacion de condensados biomoleculares (Cell Star Protocols): https://www.cell.com/star-protocols/fulltext/S2666-1667(25)00419-8
