# oxide-lab/TripoSR-GGUF

## Resumen

TripoSR-GGUF es una distribucion cuantizada en formato GGUF del modelo TripoSR de Stability AI, un sistema de reconstruccion 3D a partir de una unica imagen (image-to-3D) que genera mallas poligonales con colores por vertice. El paquete lo publica oxide-lab bajo el runtime Lux3D, empaquetando los pesos originales en F32 (1,56 GiB) en variantes Q8_0, Q6_K, Q5_K y Q4_K de entre 0,226 y 0,419 GiB, con configuracion embebida en los metadatos del propio fichero GGUF.

El modelo resuelve el problema de generar geometria 3D texturizada a partir de una sola fotografia, una tarea relevante para pipelines de contenido, videojuegos, impresion 3D y prototipado rapido. Frente al paquete canonico en safetensors, esta version elimina la necesidad de ficheros auxiliares (`manifest.json`, `checksums.json`) y permite ejecutar la inferencia pasando directamente el `.gguf` como `--model-path`.

La relevancia actual del artefacto no esta en la arquitectura (heredada de TripoSR) sino en la cuantizacion: los datos publicados muestran que la familia TripoSR tolera muy bien la reduccion de precision, manteniendo F@1% ≥ 0,9998 en todas las variantes, aunque Q4_K degrada la topologia de superficie (IoU de vóxeles 0,682 frente a 0,920 en Q8_0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TripoSR (transformer de reconstruccion triplanar; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 419.275.628 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo image-to-3D, no de texto) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K, Q4_K (con fallback F16); paquete canonico F32 |
| Idiomas soportados | no disponible (no aplica: entrada de imagen, salida de malla) |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado con `resolved_config.json` embebido); original en safetensors F32 |
| Tamano del repo | 1,3 GB |
| Pipeline | image-to-3D |
| Libreria | lux3d |
| Modelo base | stabilityai/TripoSR |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de TripoSR mas alla de su proposito (reconstruccion image-to-3D con salida de malla y colores por vertice). No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o ajuste por preferencias; estos datos corresponden al modelo base `stabilityai/TripoSR` y no se reproducen aqui.

La innovacion tecnica documentada en este paquete es el proceso de cuantizacion implementado en Lux3D: solo se cuantizan matrices `*.weight` de rango 2, mientras que normas, sesgos, embeddings, convoluciones y filas que no encajan en el bloque del dtype permanecen en F16. Q8_0 cuantiza 244 matrices; las variantes K-quant usan bloques de 256 elementos, por lo que nueve matrices cuya longitud de fila no es divisible por 256 quedan en F16 (235 matrices cuantizadas). Las lineales cuantizadas se ejecutan mediante `QMatMul`.

## Capacidades

- Generacion de malla 3D (mesh) a partir de una unica imagen de entrada.
- Salida en multiples formatos: GLB (principal), OBJ, PLY y STL; el formato se selecciona por la extension del fichero de salida.
- Emision de colores por vertice, almacenados como `COLOR_0` en GLB y como RGB en PLY/OBJ; STL descarta los colores.
- Extraccion de superficie mediante marching cubes con resolucion y umbral configurables (los datos de evaluacion usan resolucion 256 y umbral 25,0).
- Ejecucion en backends CUDA y WGPU (los datos de evaluacion cubren ambos).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo unimodal de imagen a malla.

## Casos de uso

- Prototipado rapido de assets 3D: a partir de una foto o render de referencia se obtiene un GLB con color por vertice, util para iterar sobre conceptos antes de modelado manual.
- Pipelines de contenido para videojuegos o realidad aumentada: la salida GLB con `COLOR_0` se integra directamente en motores que consumen glTF sin conversion intermedia.
- Impresion 3D: la exportacion a STL (sin color) permite generar mallas listas para laminadores o slicers a partir de una sola imagen.
- Catalogos de e-commerce: generar vistas 3D de productos desde una fotografia para visores web o configuradores, con la ventaja de que Q6_K/Q8_0 preservan la topologia de superficie.
- Reconstruccion para documentacion tecnica o arqueologica: captura de un objeto con una sola imagen y exportacion a PLY/OBJ para inspeccion o medicion aproximada.
- Despliegue en hardware modesto: las variantes Q5_K (0,274 GiB) y Q4_K (0,226 GiB) permiten ejecutar la inferencia en entornos con poca VRAM, aceptando la perdida de topologia de Q4_K cuando la fidelidad geometrica no es critica.
- Integracion en herramientas CLI automatizadas: `lux3d-cli run triposr` acepta el `.gguf` directamente como `--model-path`, lo que simplifica scripts por lotes sin gestionar ficheros auxiliares.

## Benchmarks y rendimiento

Los datos publicados miden la deriva (drift) respecto al paquete canonico F32 ejecutado en el mismo backend CUDA, no la precision frente a una verdad de referencia. Entrada: imagen de prueba "burger" de los assets de test de Lux3D; marching cubes a resolucion 256 y umbral 25,0. Metricas: Chamfer-L1 relativa a la diagonal del bounding box de referencia, F-score, IoU de vóxeles de superficie y consistencia de normales.

| Variante | CD rel | F@0,5% | F@1% | IoU vóxeles | Normales |
|---|---|---|---|---|---|
| q8_0 | 0,036% | 0,9997 | 0,99994 | 0,920 | 0,993 |
| q6_k | 0,050% | 0,9998 | 0,99995 | 0,886 | 0,991 |
| q5_k | 0,058% | 0,9996 | 0,99985 | 0,863 | 0,990 |
| q4_k | 0,129% | 0,9964 | 0,99985 | 0,682 | 0,978 |

Q8_0 mantiene F@1% de 0,99994 en CUDA y 0,99996 en WGPU. No se han publicado comparaciones con otros modelos image-to-3D en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan entre 0,226 GiB (Q4_K) y 0,419 GiB (Q8_0); el consumo total depende de las activaciones y de la resolucion de marching cubes, no especificados en la informacion disponible.
- GPU recomendadas: no se indica una lista concreta; la evaluacion se realizo en backend CUDA y en WGPU, lo que sugiere compatibilidad con GPUs NVIDIA y con backends graficos genericos.
- Cabe en GPUs de consumo: con pesos por debajo de 0,5 GiB, es viable en cualquier GPU consumer con suficiente memoria para activaciones; no se publican cifras minimas.
- Opciones de despliegue: `lux3d-cli` (runtime Lux3D) con `--device cuda`; tambien se menciona el backend WGPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos image-to-3D en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia interna, la comparativa entre las propias variantes de cuantizacion es la siguiente:

| Variante | Tamano | Estado | IoU vóxeles | Uso recomendado |
|---|---|---|---|---|
| F32 canonico | 1,56 GiB | referencia | no disponible | Referencia de calidad |
| q8_0 | 0,419 GiB | recomendado | 0,920 | Maxima fidelidad |
| q6_k | 0,325 GiB | recomendado | 0,886 | Equilibrio fidelidad/tamano |
| q5_k | 0,274 GiB | usable | 0,863 | Entornos con VRAM limitada |
| q4_k | 0,226 GiB | usable | 0,682 | Solo si la topologia no importa |

## Limitaciones y advertencias

- Q4_K pierde topologia de superficie de forma notable (IoU de vóxeles 0,682 frente a 0,920 en Q8_0); no es adecuado cuando la fidelidad geometrica es critica.
- Las metricas publicadas miden deriva respecto a F32, no precision frente a verdad de referencia; no deben interpretarse como calidad absoluta del modelo.
- La evaluacion se limita a una unica imagen de prueba ("burger") con una configuracion concreta de marching cubes (resolucion 256, umbral 25,0); la generalizacion a otros dominios no esta documentada.
- No se documentan sesgos conocidos ni tasas de alucinacion geometrica en la informacion disponible.
- El modelo no procesa texto ni multiples idiomas; su unica entrada es una imagen.
- Licencia MIT para codigo y pesos de TripoSR, pero los pesos quedan sujetos a la licencia upstream de `stabilityai/TripoSR`; conviene verificar condiciones para uso comercial en produccion.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-13) es posterior a la de esta ficha; tratarla con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/oxide-lab/TripoSR-GGUF
- Modelo canonico en HF: https://huggingface.co/oxide-lab/TripoSR
- Modelo base: https://huggingface.co/stabilityai/TripoSR
- Runtime Lux3D: https://github.com/oxide-lab/Lux3d
