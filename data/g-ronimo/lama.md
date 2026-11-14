# g-ronimo/lama

## Resumen

LaMa (Large Mask inpainting) es un modelo de inpainting de imágenes desarrollado por Samsung Research, diseñado para reconstruir regiones enmascaradas de una imagen incluso cuando la máscara cubre áreas muy grandes. Este repositorio concreto, publicado por el usuario g-ronimo, no contiene los pesos originales de PyTorch, sino una exportación a formato ONNX optimizada específicamente para inferencia en navegador mediante onnxruntime-web y aceleración WebGPU. El modelo se utiliza en producción en el servicio wipe.photos, una herramienta de eliminación de objetos que se ejecuta íntegramente en el cliente.

El interés de esta ficha radica en las optimizaciones de cuantización y reescritura del grafo que acompañan a la exportación. LaMa presenta un problema poco habitual: su rama espacial local acumula activaciones de magnitud muy elevada a lo largo de 18 bloques FFCResnetBlock, con valores de `running_var` de BatchNorm que alcanzan aproximadamente 480 000, muy por encima del máximo representable en fp16 (65 504). Una conversión ingenua del grafo completo a fp16 o INT8 corrompe el modelo. El autor documenta una estrategia de compresión solo de pesos y una variante con FFT reemplazadas por matmuls que permite ejecutar todo el grafo en fp16 sobre GPU sin caídas a CPU.

El repositorio ofrece seis artefactos con distintos compromisos entre tamaño, velocidad y calidad, desde los 209 MB del export fp32 original hasta los 61,5 MB de la variante int8. La licencia es Apache 2.0, lo que facilita su integración comercial. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, al ser un modelo de visión) ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red generativa de inpainting con bloques FFCResnetBlock (rama espacial local y rama espectral basada en FFT), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | fp32, fp16 (solo pesos y cómputo completo), int8 (UINT8 asimétrico por canal, solo pesos) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) y volcado binario crudo de pesos (`.bin`) |

Especificaciones de entrada y salida:

| Parametro | Valor |
|---|---|
| Entrada | `input` de forma `[1, 4, H, W]`; canales 0-2 imagen RGB con la región enmascarada a cero, canal 3 máscara binaria (0 o 1) |
| Restriccion de forma | H y W múltiplos de 32; las variantes `lama_512_*` exigen exactamente 512×512 |
| Salida | `output` de forma `[1, 3, H, W]`, imagen RGB en rango 0-1 |

Artefactos incluidos:

| Fichero | Tamano | Descripcion |
|---|---|---|
| `lama.onnx` | 209 MB | Export fp32 original |
| `lama_fp16.onnx` | 110 MB | fp16 solo de pesos |
| `lama_int8.onnx` | 61,5 MB | int8 solo de pesos |
| `lama_512_fp16.onnx` | 107 MB | fp16 de cómputo completo, FFT como matmuls, entrada fija 512×512 |
| `lama_512_int8.onnx` | 62 MB | int8 solo de pesos sobre el grafo con FFT como matmuls, entrada fija 512×512 |
| `lama_512_native_fp16.bin` | 102 MB | Pesos crudos de `lama_512_*` para shaders WebGPU propios (pesos de convolución fp16 seguidos de sesgos fp32) |

## Arquitectura y entrenamiento

LaMa es una red de inpainting robusta a la resolución que combina una rama espacial local con una rama espectral basada en transformadas de Fourier (FFT), organizadas en bloques FFCResnetBlock. Esta combinación permite al modelo propagar información de contexto a larga distancia a través del dominio de la frecuencia, lo que explica su buen comportamiento con máscaras grandes. El repositorio no documenta el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos no están disponibles en la información proporcionada.

La innovación técnica documentada en esta exportación es doble. En primer lugar, la cuantización se aplica únicamente a los 222 tensores de pesos de convolución, insertando un nodo de desquantización (`Cast` para fp16, `DequantizeLinear` para int8) antes de cada convolución, de modo que todo el cómputo permanece en fp32 y los parámetros de BatchNorm se mantienen intactos en fp32. Para int8 se emplea cuantización asimétrica UINT8 por canal, con una escala por canal derivada de su rango real `[min, max]`; el enfoque simétrico INT8 producía un artefacto tenue (diferencia máxima 185 y 70 píxeles defectuosos), mientras que el asimétrico lo elimina (diferencia máxima 48, cero píxeles por encima de 50).

En segundo lugar, la variante `lama_512_fp16.onnx` reescribe el grafo para cómputo fp16 de extremo a extremo: cada BatchNorm se re-parametriza a forma scale/shift, eliminando los valores gigantes de `running_var`, y las FFT se sustituyen por matmuls con matrices DFT de 64×64 precalculadas, lo cual es válido porque la entrada fija de 512×512 fija el tamaño de la FFT. Este cambio es también la clave del rendimiento: el operador ONNX `DFT` no tiene implementación en WebGPU, por lo que las demás variantes sufren caídas a CPU y copias GPU↔CPU, mientras que los matmuls se ejecutan en cualquier backend.

## Capacidades

- Inpainting de imágenes: reconstruye regiones enmascaradas a partir de la imagen con la máscara aplicada y una máscara binaria.
- Robustez ante máscaras grandes: la rama espectral con FFT permite propagar contexto a larga distancia.
- Resolución arbitraria: las variantes no `512` aceptan cualquier H y W múltiplos de 32.
- Entrada fija de alto rendimiento: las variantes `lama_512_*` optimizan el caso 512×512 para ejecución completa en GPU.
- Inferencia en navegador: compatible con onnxruntime-web y aceleración WebGPU; también ejecutable en CPU/WASM.
- Inferencia totalmente local: no requiere envío de imágenes a un servidor, lo que habilita casos de uso con requisitos de privacidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de objetos en fotografías desde el navegador: el modelo recibe la imagen con el objeto enmascarado y devuelve el fondo reconstruido; al ejecutarse en WebGPU mediante onnxruntime-web, la imagen nunca sale del dispositivo del usuario. Es el caso de uso real de wipe.photos.
- Edición de fotos con requisitos de privacidad: aplicaciones de retoque para sectores como salud, legal o periodismo, donde subir imágenes a un servidor es inaceptable; la inferencia local con `lama_512_fp16.onnx` ofrece 0,43 s por imagen de 512×512 en WebGPU sobre un Mac con chip de la serie M.
- Eliminación de marcas de agua o logotipos en material propio: útil para limpiar imágenes de archivo antes de reutilizarlas, con la salvedad legal de no aplicarlo sobre contenido de terceros sin derechos.
- Restauración de fotografías con zonas dañadas: la robustez de LaMa ante máscaras grandes permite reconstruir arañazos, manchas o regiones perdidas de mayor extensión que en modelos de inpainting convencionales.
- Preprocesado en pipelines de visión por computador: eliminar objetos no deseados (personas, vehículos) de imágenes de entrenamiento o de validación antes de pasarlas a un detector o segmentador, evitando etiquetas espurias.
- Aplicaciones móviles con memoria limitada: la variante `lama_512_int8.onnx` (62 MB) es la opción indicada para objetivos WASM con poca memoria, como navegadores móviles, con 1,51 s frente a 2,69 s en CPU para el modelo int8 sin la reescritura de FFT.
- Prototipado rápido de herramientas de edición: el export fp32 (`lama.onnx`, 209 MB) sirve como referencia de calidad para comparar contra las variantes cuantizadas, con resoluciones arbitrarias.
- Integración en aplicaciones de escritorio o servidores sin GPU: `lama_512_int8.onnx` ejecuta en CPU/WASM con un rendimiento aproximadamente 1,8 veces superior al int8 sin reescritura de FFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PSNR, SSIM, FID, etc.) en la información disponible. El autor sí documenta mediciones de latencia y de fidelidad respecto al fp32:

| Metrica | Valor |
|---|---|
| Inferencia 512×512 en WebGPU (Mac serie M), `lama_512_fp16.onnx` | 0,43 s |
| Inferencia 512×512 en WebGPU (Mac serie M), variantes con FFT nativa | 2,18 s |
| Inferencia en CPU, `lama_512_int8.onnx` | 1,51 s |
| Inferencia en CPU, `lama_int8.onnx` | 2,69 s |
| Diferencia maxima de pixel, `lama_512_fp16.onnx` vs fp32 | 0 píxeles con diferencia > 50/255 |
| Diferencia maxima de pixel, `lama_fp16.onnx` vs fp32 | 3-11/255 |
| Diferencia maxima de pixel, int8 simetrico vs fp32 | 185 (70 píxeles defectuosos) |
| Diferencia maxima de pixel, int8 asimetrico vs fp32 | 48 (cero píxeles por encima de 50) |
| Aceleracion de shaders WebGPU propios en wipe.photos vs onnxruntime-web | ~3× |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; como referencia de orden de magnitud, los ficheros van de 61,5 MB a 209 MB, y el cómputo fp32 requiere espacio adicional para activaciones, que pueden ser grandes por los valores de BatchNorm documentados.
- GPU recomendadas: no se especifican modelos concretos. El autor valida el rendimiento en WebGPU sobre un Mac con chip de la serie M.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el diseño apunta a ejecución en navegador con WebGPU, lo que incluye GPU integradas y de consumo compatibles con dicho backend.
- Opciones de despliegue: onnxruntime-web (WebGPU y CPU/WASM), shaders WebGPU propios mediante `lama_512_native_fp16.bin`, y cualquier runtime compatible con ONNX (no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo).
- Latencia y throughput: 0,43 s por imagen de 512×512 en WebGPU con `lama_512_fp16.onnx`; 1,51 s en CPU con `lama_512_int8.onnx`; 2,18 s en WebGPU con las variantes de FFT nativa. No se documenta throughput por lotes.
- Memoria en destino WASM: `lama_512_int8.onnx` está pensado para objetivos con memoria restringida, como navegadores móviles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos alternativos de inpainting (por ejemplo, variantes de Stable Diffusion Inpainting u otros exportadores de LaMa) que permitan una comparación con parámetros, contexto, rendimiento y licencia verificables. Por tanto, la comparativa se declara no disponible. Como referencia interna, la comparación entre las propias variantes del repositorio es la siguiente:

| Variante | Tamano | Entrada | Calidad vs fp32 | Velocidad relativa |
|---|---|---|---|---|
| `lama.onnx` | 209 MB | arbitraria (múltiplos de 32) | referencia | base |
| `lama_fp16.onnx` | 110 MB | arbitraria (múltiplos de 32) | dif. máx. 3-11/255 | similar a fp32 |
| `lama_int8.onnx` | 61,5 MB | arbitraria (múltiplos de 32) | dif. máx. 48 | base en CPU |
| `lama_512_fp16.onnx` | 107 MB | fija 512×512 | 0 píxeles > 50/255 | ~5× más rápida en WebGPU |
| `lama_512_int8.onnx` | 62 MB | fija 512×512 | idéntica a `lama_int8.onnx` | ~1,8× más rápida en CPU |

## Limitaciones y advertencias

- La cuantización ingenua del grafo completo a fp16 o INT8 corrompe el modelo: los valores de `running_var` de BatchNorm (~480 000) exceden el máximo fp16 (65 504). Cualquier reexportación debe respetar el esquema de compresión solo de pesos o la re-parametrización de BatchNorm documentada.
- Las variantes `lama_512_*` solo aceptan entradas de exactamente 512×512; para otras resoluciones hay que usar `lama.onnx`, `lama_fp16.onnx` o `lama_int8.onnx`.
- Las dimensiones de entrada deben ser múltiplos de 32 en las variantes de resolución arbitraria.
- El operador ONNX `DFT` no tiene implementación en WebGPU: usar las variantes con FFT nativa en WebGPU provoca caídas a CPU y copias GPU↔CPU que multiplican la latencia.
- Riesgo de artefactos en las regiones reconstruidas, especialmente con máscaras muy grandes o texturas complejas; no se documentan métricas objetivas de calidad perceptual.
- No se documentan sesgos demográficos ni de otro tipo; al ser un modelo de imagen, los sesgos potenciales dependerían del dataset de entrenamiento original de LaMa, no descrito en esta información.
- No apto para generación de texto, razonamiento, código, matemáticas ni tareas de agente; su uso está limitado al inpainting de imágenes.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y de atribución; conviene verificar la licencia del modelo LaMa original de Samsung Research antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación comunitaria; conviene evaluar la calidad en el caso de uso concreto antes de adoptarlo en producción.
- El uso para eliminar marcas de agua, logotipos o contenido de terceros puede infringir derechos de autor o términos de servicio; la responsabilidad recae en el integrador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/g-ronimo/lama
- Repositorio original de LaMa (Samsung Research): https://github.com/advimman/lama
- Servicio wipe.photos: https://wipe.photos
- onnxruntime-web: https://github.com/microsoft/onnxruntime
