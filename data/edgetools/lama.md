# edgetools/lama

## Resumen

LaMa (ONNX) es una exportación en formato ONNX del modelo big-lama, un
modelo de inpainting de imágenes orientado a la eliminación de objetos.
El repositorio `edgetools/lama` es un espejo verificado de
`Carve/LaMa-ONNX`, alojado para servir una copia inmutable y con CORS
habilitado que respalda la herramienta "Remove Object" de Edge Tools.
El modelo original LaMa (Large Mask Inpainting with Fourier Convolutions,
Suvorov et al., WACV 2022) se desarrolló para rellenar huecos grandes en
imágenes de forma resolución-robusta, y estos pesos concretos se
distribuyen bajo licencia Apache-2.0.

La relevancia actual de esta ficha radica en que permite ejecutar
inpainting de calidad directamente en el navegador mediante
`onnxruntime-web` sobre los execution providers WASM o WebGPU, sin
necesidad de servidor. El modelo acepta una imagen y una máscara de
512x512 de resolución fija (canales primero, CHW) y devuelve la imagen
rellenada. Su tamaño de repositorio es de 0.2 GB y su único artefacto es
`lama_fp32.onnx` en precisión fp32.

Al ser una exportación ONNX y no un modelo de lenguaje, no dispone de
ventana de contexto, idiomas soportados ni capacidades de generación de
texto: es una herramienta especializada de image-to-image para
inpainting y eliminación de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feed-forward de inpainting con convoluciones de Fourier (LaMa, big-lama) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32 (unico artefacto `lama_fp32.onnx`); no se distribuyen variantes cuantizadas |
| Idiomas soportados | no disponible (no aplica, modelo de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`lama_fp32.onnx`) |
| Entrada imagen | float32 `[1, 3, 512, 512]`, RGB, CHW, valores 0..1 |
| Entrada mascara | float32 `[1, 1, 512, 512]`; polaridad: 1 = borrar (hueco), 0 = conservar |
| Salida | float32 `[1, 3, 512, 512]`, relleno crudo 0..255 |
| Resolucion espacial | fija a 512x512 (redimensionar antes y despues) |
| Tamano del repositorio | 0.2 GB |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

LaMa es una red de inpainting feed-forward basada en convoluciones de
Fourier (Fourier Convolutions), diseñada para ser robusta ante máscaras
grandes. Según el artículo "Resolution-robust Large Mask Inpainting with
Fourier Convolutions" (Suvorov et al., WACV 2022), el modelo sustituye
las convoluciones tradicionales por convoluciones en el dominio de
Fourier, lo que permite un campo receptivo efectivo amplio sin aumentar
proporcionalmente el coste computacional y mejora el relleno de huecos de
gran tamaño. Los pesos `big-lama` originales se publican bajo licencia
Apache-2.0 en el repositorio `advimman/lama`.

El artefacto de este repositorio es exclusivamente la exportación a ONNX
realizada por `Carve/LaMa-ONNX` (`lama_fp32.onnx`). La información
disponible no detalla el número de tokens ni la composición del dataset
de entrenamiento, ni si hubo fases de RLHF/DPO (no aplicables a este tipo
de modelo). Tampoco se documenta el proceso de exportación ni técnicas de
decodificación especulativa. La innovación técnica destacable es el uso
de convoluciones de Fourier para inpainting resolución-robusto, y la
ejecución cliente-side mediante `onnxruntime-web` sobre WASM o WebGPU.

## Capacidades

- Inpainting de imágenes: rellena el área marcada por la máscara
  (polaridad 1 = borrar) generando contenido coherente con el entorno.
- Eliminación de objetos: borra un objeto seleccionado y reconstruye el
  fondo subyacente.
- Entrada image-to-image: consume simultáneamente una imagen y una máscara
  binaria de igual resolución (512x512).
- Ejecución en el navegador: soporta los execution providers WASM y WebGPU
  de `onnxruntime-web`, sin necesidad de backend servidor.
- Composición por el llamador: la salida es el relleno crudo; el
  consumidor debe componerla sobre la imagen original para que solo cambie
  el hueco.
- No soporta tool calling, function calling, agentes, razonamiento
  multi-paso, texto, visión descriptiva, audio ni modo "thinking".

## Casos de uso

- Herramienta de eliminación de objetos en el navegador: el modelo recibe
  la imagen y una máscara dibujada por el usuario y devuelve el fondo
  reconstruido, ejecutándose localmente sobre WASM o WebGPU sin enviar
  datos al servidor.
- Edición fotográfica en aplicaciones web: integración en editores que
  permitan borrar elementos no deseados (personas, marcas de agua,
  objetos) manteniendo el contexto visual.
- Retoque de imágenes para comercio electrónico: eliminar fondos
  residuales o elementos distractores en fotografías de producto antes de
  publicarlas en catálogo.
- Limpieza de imágenes para datasets: eliminar logotipos o anotaciones
  superpuestas en imágenes de entrenamiento antes de reutilizarlas.
- Restauración básica de fotografías: tapar arañazos, manchas o elementos
  puntuales aplicando máscaras localizadas de 512x512.
- Flujos de privacidad en cliente: difuminar o eliminar matrículas, caras
  u otra información sensible localmente, sin transmitir la imagen
  original a un tercero.
- Prototipado de pipelines de inpainting: servir como referencia ligera
  (0.2 GB, fp32) para validar exportaciones ONNX antes de escalar a
  modelos más pesados.
- Integración en extensiones o PWA: al ser una copia con CORS habilitado
  e inmutable, se puede consumir desde clientes web que requieran una URL
  estable de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion
disponible. La model card y los metadatos del repositorio no incluyen
métricas cuantitativas (PSNR, FID, LPIPS ni similares) para esta
exportación ONNX concreta.

## Requisitos de hardware

- VRAM estimada: coherente con un repositorio de 0.2 GB en fp32; el
  artefacto ONNX es de tamaño reducido y cabe holgadamente en GPUs de
  consumo. No se dispone de cifras oficiales de VRAM en la informacion
  proporcionada.
- GPU recomendadas: al ejecutarse sobre WebGPU, funciona en GPU de
  consumo actuales a través del navegador; en servidor, cualquier GPU
  compatible con ONNX Runtime (por ejemplo, series RTX, A100, H100) es
  suficiente dada la baja carga del modelo; no se especifican modelos
  concretos en la informacion disponible.
- GPU de consumo: sí, cabe en GPUs de consumo integradas y dedicadas,
  dado el tamaño del artefacto y la resolución fija de 512x512.
- Opciones de despliegue: `onnxruntime-web` (WASM y WebGPU) en cliente;
  ONNX Runtime nativo en servidor. No se mencionan vLLM, llama.cpp,
  Ollama ni TGI, que no aplican a este modelo de visión.
- Latencia y throughput: no disponibles. Dependen del execution provider
  (WASM frente a WebGPU) y del hardware del cliente; no se documentan
  cifras en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Pipeline | Licencia | Resolucion | Notas |
|---|---|---|---|---|---|
| edgetools/lama | ONNX | image-to-image | Apache-2.0 | 512x512 fija | Espejo CORS de Carve/LaMa-ONNX para uso en navegador |
| Carve/LaMa-ONNX | ONNX | image-to-image | Apache-2.0 | 512x512 fija | Origen verbatim del artefacto; sin copia CORS dedicada |
| advimman/lama (big-lama) | PyTorch | inpainting | Apache-2.0 | variable (resolucion-robusto) | Pesos originales del paper de LaMa |

La informacion disponible no incluye comparativas de rendimiento con
otros modelos de inpainting (por ejemplo, enfoques basados en difusion),
por lo que no se aportan cifras comparativas.

## Limitaciones y advertencias

- Resolución fija: la entrada debe ser 512x512; imágenes de otra
  resolución requieren redimensionado previo y posterior, lo que puede
  introducir pérdida de detalle.
- Polaridad de la máscara: invertir la polaridad (1 = borrar, 0 =
  conservar) produce resultados incorrectos.
- Salida cruda: el modelo devuelve el relleno sin componer; es
  responsabilidad del llamador superponerlo sobre la imagen original para
  que solo cambie el hueco.
- Riesgo de artefactos: como cualquier modelo de inpainting, puede
  generar contenido poco realista o incoherente en huecos grandes o en
  zonas con texturas complejas; no se documentan tasas de fallo.
- Sesgos: no se documentan sesgos específicos en la informacion
  disponible, pero al ser un modelo entrenado con datos no especificados,
  puede reflejar sesgos de su dataset original.
- Idiomas: no aplica; es un modelo de imagen.
- Licencia: Apache-2.0, lo que permite uso comercial siempre que se
  respeten las condiciones de la licencia incluida en el repositorio. No
  se documentan restricciones adicionales.
- Origen del artefacto: es un espejo, no una exportación propia; la
  trazabilidad de la conversión a ONNX depende del repositorio de origen
  `Carve/LaMa-ONNX`.
- Ausencia de benchmarks: no hay métricas publicadas que permitan
  verificar la calidad frente a alternativas.
- Producción: no se documentan cifras de latencia, throughput ni
  requisitos mínimos de hardware, por lo que cualquier despliegue en
  producción requiere validación empírica previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/edgetools/lama
- Repositorio de origen: https://huggingface.co/Carve/LaMa-ONNX
- Repositorio original de LaMa: https://github.com/advimman/lama
- Paper: Suvorov et al., "Resolution-robust Large Mask Inpainting with
  Fourier Convolutions", WACV 2022 (referenciado en la model card; sin
  URL directa en la informacion proporcionada).
