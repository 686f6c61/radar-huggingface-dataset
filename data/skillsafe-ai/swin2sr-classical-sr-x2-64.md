# skillsafe-ai/swin2sr-classical-sr-x2-64

## Resumen

Swin2SR classical super-resolution x2 (transformers.js) es una importación reproducible del checkpoint
Xenova/swin2SR-classical-sr-x2-64, publicada por skillsafe-ai como artefacto listo para su ejecución en
el navegador. Se trata de un modelo de visión por computador para superresolución de imagen con factor x2,
exportado a ONNX (opset 11) y empaquetado junto con su configuración y su preprocesador. No es un modelo de
lenguaje: no procesa texto, no tiene tool calling y no depende del idioma de entrada.

El modelo deriva del proyecto Swin2SR (Marcos V. Conde et al., licencia Apache 2.0) y de la exportación ONNX
de Xenova. Su interés práctico radica en que pesa solo 51,91 MB en fp32, se ejecuta con onnxruntime-web sobre
WebGPU o WASM y no requiere GPU dedicada: la verificación del autor reporta 205,3 ms en CPU para una entrada
de 64x64 píxeles. Esto permite integrar superresolución en aplicaciones web sin enviar las imágenes a un
servidor.

La relevancia de esta ficha concreta es la trazabilidad: cada byte del repositorio es derivable de una fuente
fijada por commit y SHA-256, con receta de conversión, toolchain y verificación por archivo registrados en un
manifest. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una
publicación reciente (22 de septiembre de 2026) sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin2SR (Swin Transformer V2 adaptado a restauración de imagen) |
| Parametros totales | no disponible; aproximadamente 13 millones estimados a partir del peso ONNX fp32 (51,91 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; en la verificación del autor, entrada 64x64 px y salida 128x128 px) |
| Tipos de cuantizacion | fp32 (ONNX). Este repositorio no incluye variantes cuantizadas |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11) en `onnx/model.onnx`, más `config.json` y `preprocessor_config.json` |

## Arquitectura y entrenamiento

Swin2SR es una adaptación de Swin Transformer V2 al campo de la restauración de imagen (superresolución,
eliminación de ruido y desenfoque). En lugar de atención global sobre todos los píxeles, emplea atención por
ventanas desplazadas (shifted window attention), lo que reduce el coste computacional respecto a la atención
densa y permite manejar mapas de características de alta resolución. El modelo no incorpora ningún componente
de texto ni de lenguaje. El sufijo "64" identifica una de las configuraciones publicadas del modelo original;
la información proporcionada no detalla a qué parámetro concreto corresponde.

No se dispone de datos sobre el dataset de entrenamiento, el número de pasos, la composición de los datos ni
si se aplicaron técnicas de alineación (RLHF/DPO), que en cualquier caso no son habituales en un modelo de
visión. La model card indica que el artefacto es una importación "as published upstream (no conversion)":
los pesos se han importado tal cual desde el commit `93dfc9089abda257351d3a58d5771e2c1ff69442` de
Xenova/swin2SR-classical-sr-x2-64, sin reentrenamiento ni edición manual.

La aportación técnica de esta publicación es la reproducibilidad y la verificación. La conversión queda
documentada mediante la receta `recipes/swin2sr-classical-sr-x2-64.yaml` (sha256
`c39f5e190a7f4f200ad1b09e8321b097a3202915619bd3faea1c4a3ca9547bcf`) y un toolchain fijado (Python 3.12.13,
torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64). Cada archivo tiene su SHA-256, el
ONNX pasó `onnx.checker` y una prueba de humo en CPU con entradas rellenas de ceros.

## Capacidades

- Superresolución de imagen con factor de escala x2 (variante "classical", pensada para degradación bicúbica).
- Entrada `pixel_values` en float32 con forma `[batch_size, num_channels, height, width]` y salida
  `reconstruction` en float32 con la misma disposición de canales y dimensiones duplicadas.
- Inferencia íntegra en el navegador mediante onnxruntime-web con execution providers `webgpu` y `wasm`.
- Ejecución en CPU: la verificación del autor mide 205,3 ms para 64x64 → 128x128 px.
- Funciona sin conexión una vez descargados los 51,91 MB del modelo, lo que permite procesamiento local de
  imágenes sin enviarlas a un servidor.
- No dispone de tool calling ni de function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No incorpora modo "thinking", ni procesamiento de audio, ni de vídeo.

## Casos de uso

- Mejora de imágenes en el navegador sin backend: una aplicación web puede cargar el ONNX con
  onnxruntime-web y ampliar x2 las imágenes del usuario en el propio cliente, evitando subir contenido a un
  servidor y reduciendo costes de infraestructura.
- Edición de fotos con privacidad: herramientas de retoque que necesiten escalar recortes o miniaturas pueden
  procesar todo localmente, algo relevante cuando las imágenes contienen datos sensibles.
- Reducción de ancho de banda en catálogos y comercio electrónico: almacenar y transmitir versiones a media
  resolución y reconstruir la versión final x2 en el dispositivo del cliente.
- Preprocesado en pipelines de visión por computador: normalizar la resolución de entrada antes de un
  clasificador o detector, ya que el modelo espera tensores RGB float32 y devuelve el mismo número de canales.
- Restauración en dispositivos de borde: al no necesitar GPU, encaja en navegadores, portátiles y equipos sin
  acelerador dedicado donde no es viable desplegar un modelo mayor.
- Aumento de datos para entrenamiento: ampliar x2 un conjunto de imágenes de baja resolución para generar
  pares de entrenamiento antes de aplicar otras transformaciones.
- Extensiones de navegador y aplicaciones de escritorio basadas en web: el contrato ONNX con opSet 11 y
  entrada dinámica permite integrar el modelo en cualquier runtime de ONNX, no solo en JavaScript.
- Demostraciones y docencia: es un ejemplo pequeño y trazable para ilustrar el flujo completo de importación,
  verificación y ejecución de un modelo ONNX en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye
una prueba de humo en CPU, no una evaluación de calidad de imagen (PSNR, SSIM ni métricas perceptuales):

| Prueba | Entrada | Salida | Tiempo |
|---|---|---|---|
| Smoke test en CPU (onnxruntime) | `pixel_values[1, 3, 64, 64]` | `reconstruction[1, 3, 128, 128]` | 205,3 ms |

## Requisitos de hardware

- El archivo `onnx/model.onnx` pesa 51,91 MB en fp32, por lo que la huella de pesos en memoria ronda los 52 MB
  más las activaciones correspondientes a la resolución de la imagen de entrada.
- No requiere GPU dedicada: la verificación del autor se ejecutó en CPU sobre Darwin 25.6.0 arm64.
- Cabe en cualquier GPU de consumo e, incluso, en hardware integrado o en un simple navegador; no se necesita
  una RTX 4090, A100 o H100 para este modelo.
- Opciones de despliegue reales: onnxruntime-web con WebGPU o WASM (navegador), onnxruntime nativo (Python,
  C++, C#) y transformers.js dado que el repositorio declara esa librería.
- Runtimes orientados a modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no aplican a este modelo, que
  no genera texto.
- Latencia declarada: 205,3 ms en CPU para 64x64 → 128x128 px. El throughput y la latencia a resoluciones
  mayores no están documentados.
- La memoria necesaria crecerá de forma cuadrática con la resolución de entrada; no se publican cifras de VRAM
  para tamaños superiores a 64x64 px.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento para establecer una comparación cuantitativa. La
tabla recoge únicamente lo verificable desde la propia model card y su atribución.

| Modelo | Escala | Formato | Licencia | Parámetros | Disponibilidad |
|---|---|---|---|---|---|
| skillsafe-ai/swin2sr-classical-sr-x2-64 (este modelo) | x2 | ONNX (opset 11) | Apache-2.0 | ~13 M (estimado por tamaño de archivo) | Repositorio de 0,1 GB, 0 descargas |
| Xenova/swin2SR-classical-sr-x2-64 (origen) | x2 | ONNX | Apache-2.0 | no disponible | Upstream fijado al commit `93dfc9089...` |
| caidas/swin2SR-classical-sr-x2-64 (proyecto original) | x2 | PyTorch | Apache-2.0 | no disponible | Referenciado en la atribución de la model card |
| Otras variantes de Swin2SR (x4, realworld, lightweight) | x4 / x2 | no disponible en esta información | Apache-2.0 (proyecto) | no disponible | Existen en el ecosistema, sin datos aportados aquí |

Alternativas metodológicas como Real-ESRGAN (basada en GAN) no pueden compararse con los datos disponibles en
esta información: no se aportan cifras de PSNR, SSIM ni parámetros.

## Limitaciones y advertencias

- La variante "classical" está pensada para degradaciones bicúbicas. Frente a ruido real de sensor, artefactos
  de compresión JPEG severos o desenfoques reales, la calidad puede degradarse; para esos casos existe una
  variante "realworld" en el ecosistema Swin2SR que este repositorio no incluye.
- Riesgo de alucinación de detalle: como cualquier modelo generativo de superresolución, puede reconstruir
  texturas plausibles pero inexistentes en la imagen original, algo crítico en contextos forenses, médicos o
  documentales.
- Sesgos: al no publicarse el dataset de entrenamiento, no puede auditarse la distribución de datos usada ni
  los posibles sesgos de contenido. Es esperable sobre-suavizado y pérdida de detalle fino.
- Solo ofrece escala x2; el factor de ampliación no es configurable sin cambiar de modelo.
- Está limitado a imágenes de entrada con la disposición de canales esperada (se declara `num_channels`; la
  verificación usa 3 canales). No se documenta soporte de canal alfa, profundidad de 16 bits ni otros espacios
  de color.
- No es un modelo de lenguaje: no admite prompts, instrucciones ni conversación, y no procesa idiomas.
- Licencia Apache-2.0, que permite uso comercial, pero se debe conservar el aviso del proyecto Swin2SR
  (https://github.com/mv-lab/swin2sr/blob/main/LICENSE) y la atribución a Marcos V. Conde et al. y a la
  exportación ONNX de Xenova. La receta de conversión y la model card quedan bajo la licencia del repositorio
  SkillSafe, mientras que los pesos mantienen la licencia upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria,
  historial de incidencias ni garantía de mantenimiento.
- No hay benchmarks publicados, por lo que cualquier afirmación sobre calidad de imagen sería una suposición.
- El borde de resolución y la memoria disponible en el navegador pueden limitar el tamaño máximo de imagen
  procesable; no se documenta ese límite.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/swin2sr-classical-sr-x2-64
- Modelo base (exportación ONNX de Xenova): https://huggingface.co/Xenova/swin2SR-classical-sr-x2-64
- Commit upstream fijado: https://huggingface.co/Xenova/swin2SR-classical-sr-x2-64/tree/93dfc9089abda257351d3a58d5771e2c1ff69442
- Modelo original del proyecto Swin2SR: https://huggingface.co/caidas/swin2SR-classical-sr-x2-64
- Repositorio del proyecto Swin2SR: https://github.com/mv-lab/swin2sr
- Licencia del proyecto Swin2SR: https://github.com/mv-lab/swin2sr/blob/main/LICENSE
- Conversor y recetas de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models

Nota: la búsqueda web realizada para esta ficha devolvió únicamente resultados no relacionados con el modelo
(contenido sobre el municipio danés de Guldborgsund), por lo que no se han podido incorporar enlaces
adicionales de papers, blogs o demos.
