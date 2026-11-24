# neuregex/Wan2.2-Fun-A14B-Camera-w4a8-comfy

## Resumen

Wan2.2-Fun-A14B-Camera-w4a8-comfy es una cuantizacion de 4 bits del modelo alibaba-pai/Wan2.2-Fun-A14B-Control-Camera, un modelo de generacion de video imagen-a-video con control explicito de movimiento de camara. Lo publica el usuario neuregex en formato nativo de ComfyUI (`asym_w4a8_int8`), de modo que se carga con los nodos estandar `UNETLoader` sin necesidad de nodos personalizados. El paquete reduce los 59,2 GB de pesos en bf16 a 18,1 GB, un 31 % del tamano original, lo que hace viable ejecutar un modelo de 14B en GPUs de consumo.

El modelo subyacente es un difusion transformer de la familia Wan 2.2, distribuido en dos variantes (high noise y low noise) que se usan de forma secuencial en el muestreo. La cuantizacion afecta a 406 capas por fichero, las mismas que cuantiza el fichero fp8 oficial, y mantiene el resto de tensores en bf16. Es relevante porque permite reproducir flujos de trabajo de generacion de video con control de camara en hardware mas modesto sin cambiar la logica del grafo en ComfyUI.

La licencia es Apache 2.0, heredada del modelo base, y el pipeline declarado es image-to-video. El repositorio tiene 18,1 GB y se actualizo por ultima vez el 24 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion transformer (familia Wan 2.2), variantes high noise y low noise |
| Parametros totales | 14B (segun la nomenclatura del modelo base; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de video; no aplica contexto de texto) |
| Tipos de cuantizacion | `asym_w4a8_int8`: 4 bits con codebook Lloyd-Max, escalas fp8 (E4M3) cada 16 pesos, escala fp32 por fila de salida y rotacion de Hadamard en grupos de 256 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de cuantizacion nativo de ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es un difusion transformer de la familia Wan 2.2 orientado a generacion de video condicionada por imagen y por instrucciones de camara. Se distribuye en dos submodelos, high noise y low noise, que cubren fases distintas del proceso de difusion y se encadenan en el muestreo. Esta ficha describe unicamente el proceso de cuantizacion, no el entrenamiento original, del que no se aportan datos (tokens, composicion del dataset, RLHF/DPO).

La cuantizacion se realizo con Comfy Kitchen 0.2.39 sobre los ficheros fp8 oficiales: se aplico el esquema `asym_w4a8_int8` documentado en QUANTIZATION.md de ComfyUI a las 406 capas que el fichero fp8 ya cuantizaba, dejando el resto de tensores en bf16. El error relativo de pesos por capa tras el round trip es de 0,073 de media y 0,073 maximo en ambos ficheros. La validacion se hizo con el mismo workflow y semilla que los ficheros fp8 sustituidos (zoom sobre una biblioteca, 81 fotogramas a 832x480, en una L40S), obteniendo el mismo movimiento y escena con fotogramas casi identicos.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video).
- Control explicito de movimiento de camara (zoom, desplazamientos y trayectorias definidas en el flujo de trabajo).
- Generacion de clips de 81 fotogramas a 832x480 segun la validacion documentada.
- Ejecucion en ComfyUI con los nodos estandar de carga de modelos de difusion.
- Aceleracion con kernels int8 en GPUs RTX serie 30 y posteriores; en GPUs anteriores se descomprime cada capa antes de multiplicar (mismo consumo de memoria, mas lento).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues, por tratarse de un modelo generativo de video.

## Casos de uso

- Previsualizacion de planos con movimiento de camara: usar una imagen fija como primer fotograma y definir una trayectoria de zoom o desplazamiento para validar la composicion antes de rodar, gracias al control de camara del modelo base.
- Prototipado de storyboards animados: generar clips cortos de 81 fotogramas a 832x480 para presentar secuencias a clientes sin produccion real.
- Iteracion rapida en estaciones con GPU de consumo: al ocupar 18,1 GB en lugar de 59,2 GB, permite cargar el modelo en tarjetas de 24 GB y reducir el coste de cada prueba.
- Integracion en pipelines de ComfyUI existentes: sustituir los ficheros bf16 o fp8 por los w4a8 sin modificar el grafo, cambiando solo el fichero seleccionado en `UNETLoader`.
- Generacion de material de referencia para VFX: producir movimientos de camara sinteticos sobre una placa fija para discutir encuadres con el equipo de postproduccion.
- Educacion y demos tecnicas: mostrar el funcionamiento de un difusion transformer de video cuantizado en talleres, con requisitos de hardware accesibles.
- Experimentacion con cuantizacion: comparar la salida w4a8 con la fp8 y bf16 en el mismo workflow y semilla para medir la perdida de calidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es cualitativa: mismo workflow y semilla que los ficheros fp8 (zoom sobre una biblioteca, 81 fotogramas a 832x480, en una L40S), con el mismo movimiento y escena y fotogramas casi identicos. El error relativo de pesos por capa es de 0,073 de media y 0,073 maximo.

## Requisitos de hardware

- VRAM estimada: el paquete completo ocupa 18,1 GB en disco (9,1 GB por fichero). Al cargar high noise y low noise de forma secuencial, la VRAM necesaria depende del grafo y de la resolucion; no se publica una cifra exacta.
- GPU recomendadas: L40S (usada en la validacion), asi como A100 y H100 para produccion.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, 4090) segun el tamano de los ficheros; no se confirma un minimo oficial.
- Aceleracion: kernels int8 en RTX serie 30 y posteriores; en GPUs anteriores se descomprime cada capa antes de multiplicar, con el mismo consumo de memoria pero mas lento.
- Software: ComfyUI desde el 19 de octubre de 2026 o posterior (probado en el commit `e3bee7f`, despues de la version 0.42.0). No requiere nodos personalizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| Wan2.2-Fun-A14B-Camera-w4a8-comfy (este) | 14B | safetensors w4a8 | 18,1 GB | no aplica | Apache 2.0 | Cuantizacion de 4 bits para ComfyUI |
| wan2.2_fun_camera_*_bf16 (oficial) | 14B | safetensors bf16 | 59,2 GB | no aplica | Apache 2.0 | Referencia de maxima calidad |
| wan2.2_fun_camera_*_fp8_scaled (oficial) | 14B | safetensors fp8 | 30,6 GB (15,3 GB por fichero) | no aplica | Apache 2.0 | Intermedio entre bf16 y w4a8 |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce un error relativo de pesos de hasta 0,073 por capa; la validacion es cualitativa y no cuantifica la perdida de calidad respecto a bf16 en todos los casos.
- Solo se han cuantizado las 406 capas que el fichero fp8 oficial ya cuantizaba; el resto de tensores permanece en bf16.
- Requiere ComfyUI desde el 19 de octubre de 2026 o posterior; versiones anteriores no cargaran el formato.
- En GPUs anteriores a la serie RTX 30 no hay kernels int8 y la inferencia es mas lenta, aunque el consumo de memoria es el mismo.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma del modelo base.
- El modelo base es generativo de video; no debe usarse para tareas de texto, codigo o razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos con los que se entreno.
- El repositorio no tiene descargas ni likes y fue actualizado por ultima vez el 24 de noviembre de 2026; no hay garantia de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/neuregex/Wan2.2-Fun-A14B-Camera-w4a8-comfy
- Modelo base: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- Discord del autor: https://discord.gg/HxfP9TnctJ
