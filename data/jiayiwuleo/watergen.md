# JiayiWuLeo/WaterGen

## Resumen

WaterGen es un sistema de generación de imágenes submarinas desarrollado conjuntamente por la University of Maryland, la University of South Florida y la University of Florida (Jiayi Wu, Tianfu Wang y colaboradores). Se publica como un adaptador LoRA de rango 32 y alfa 16 sobre `stabilityai/stable-diffusion-xl-base-1.0`, acompañado de un decodificador condicionado por el medio acuático. Su planteamiento consiste en separar dos factores que los métodos previos suelen tratar de forma entrelazada: el contenido de la escena y los efectos físicos que el agua introduce en la imagen.

El problema que aborda es la escasez de datos emparejados (escena limpia frente a escena degradada) para entrenar y evaluar algoritmos de restauración y segmentación submarinas. La etapa 1 del pipeline genera un latente de escena submarina limpia a partir de un *prompt* de texto; la etapa 2 aplica atenuación, dispersión (*backscattering*) y luz de fondo según los parámetros de agua especificados, de modo que una misma geometría puede renderizarse bajo múltiples condiciones de turbidez y color sin alterar la disposición de los objetos.

El trabajo se presentó en ECCV 2026 y su relevancia actual reside en la generación de datos sintéticos alineados para *benchmarking* y entrenamiento en visión submarina, un dominio donde la captura de pares reales alineados es especialmente costosa. El repositorio de HuggingFace tiene 0 descargas y 0 *likes*, y no incluye resultados de benchmarks ni métricas cuantitativas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente sobre SDXL (UNet) con adaptador LoRA en la etapa 1 y decodificador condicionado por el medio en la etapa 2 |
| Parametros totales | no disponible (el repositorio publica un LoRA de rango 32 y un decodificador en `model.pth`; no se detalla el recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imagen; no se documenta) |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`stage1/pytorch_lora_weights.safetensors`) y PyTorch `.pth` (`stage2/model.pth`) |

Datos adicionales: modelo base `stabilityai/stable-diffusion-xl-base-1.0`, librería `diffusers`, pipeline `text-to-image`, tamaño del repositorio 1,0 GB, creado el 10 de septiembre de 2026 y actualizado el mismo día.

## Arquitectura y entrenamiento

La arquitectura es un pipeline de difusión en dos etapas. La primera emplea un *backbone* SDXL adaptado con LoRA (rango 32, alfa 16) que sintetiza un latente de escena submarina limpia a partir de un *prompt* textual. La segunda utiliza un decodificador condicionado por el medio que aplica atenuación dependiente de la longitud de onda, dispersión y luz de fondo de acuerdo con los parámetros de agua indicados. Al mantener la geometría de la escena intacta entre renderizados, el sistema produce pares alineados de imagen limpia e imagen degradada.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa ni mecanismos de atención lineal. La innovación declarada es exclusivamente el desacoplamiento entre escena y medio, que evita que cambios en el color o la turbidez del agua modifiquen la disposición de los objetos.

## Capacidades

- Generación de imágenes submarinas (*text-to-image*) a partir de *prompts* textuales.
- Control independiente de la escena y del medio acuático: es posible fijar la geometría y variar las condiciones del agua.
- Aplicación de efectos físicos de atenuación, dispersión y luz de fondo mediante el decodificador condicionado por el medio.
- Producción de pares alineados limpio/degradado a partir de una única escena generada.
- Reutilización de una misma escena bajo múltiples tipos de agua, útil para aumentar la diversidad de un conjunto de datos.
- No se documentan capacidades de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión de entrada, audio ni modo de razonamiento explícito. Se trata de un modelo generativo de imagen, no de un modelo de lenguaje.

## Casos de uso

- Generación de datos sintéticos para restauración submarina: el modelo produce pares alineados de imagen limpia y degradada, lo que permite entrenar redes de *enhancement* con supervisión directa sin necesidad de capturar pares reales.
- Entrenamiento de modelos de segmentación semántica en entornos submarinos: al conservar la geometría entre condiciones de agua, las máscaras de una escena sirven para todas sus variantes degradadas, multiplicando el conjunto de entrenamiento sin anotación adicional.
- Aumento de datos para robótica submarina: se pueden generar escenas con objetos de interés bajo distintas turbideces y temperaturas de color para robustecer la percepción de vehículos autónomos subacuáticos.
- Evaluación controlada de algoritmos de *image dehazing*: al variar un único parámetro del medio se puede medir la degradación del rendimiento de un método en función de la turbidez de forma sistemática.
- Simulación para *sim-to-real*: generación de imágenes sintéticas con parámetros físicos explícitos para preentrenar modelos antes del ajuste con datos de campañas reales.
- Pruebas de estrés de modelos de detección: creación de conjuntos de evaluación con condiciones de agua extremas (baja visibilidad, dominancia de canal) para comprobar la degradación de detectores entrenados en superficie.
- Docencia y divulgación de óptica submarina: renderizado de la misma escena bajo distintos coeficientes de atenuación para ilustrar el efecto del medio sobre la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, IS, PSNR, SSIM ni comparaciones con métodos previos), y el repositorio no presenta tablas de evaluación.

## Requisitos de hardware

Nota: los datos de esta sección son estimaciones derivadas del modelo base SDXL y del tamaño del repositorio (1,0 GB); la model card no los especifica.

- VRAM estimada para inferencia: en torno a 8-12 GB en `float16` para el pipeline completo de dos etapas (UNet de SDXL, codificadores de texto, VAE, LoRA de la etapa 1 y decodificador de la etapa 2). Cifra no confirmada por los autores.
- GPU recomendadas: NVIDIA RTX 3090 o RTX 4090 (24 GB) para inferencia cómoda; A100 o H100 para generación por lotes a gran escala; RTX 4080 (16 GB) debería ser suficiente en `float16`.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 12 GB o más de VRAM en `float16`. No se documenta un modo para GPU de gama baja.
- Opciones de despliegue: `diffusers` para la etapa 1 (el LoRA está en `safetensors`); la etapa 2 requiere cargar `model.pth` con el código del repositorio de GitHub. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama (herramientas orientadas a modelos de lenguaje). No se documenta compatibilidad con ComfyUI o AUTOMATIC1111.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de generación de imágenes submarinas con desacoplamiento escena-medio, ni datos de rendimiento que permitan una comparación cuantitativa. A modo de referencia estructural, se incluye el modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WaterGen | no disponible (LoRA rango 32 + decodificador) | no aplica | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| stabilityai/stable-diffusion-xl-base-1.0 | no disponible en esta ficha | no aplica | no disponible en esta ficha | licencia propia del modelo base | HuggingFace |

## Limitaciones y advertencias

- No se han publicado benchmarks, métricas ni evaluaciones cuantitativas en la información disponible.
- El repositorio registra 0 descargas y 0 *likes*, por lo que no existe validación por parte de la comunidad.
- El decodificador de la etapa 2 se distribuye como `model.pth` de PyTorch y requiere el código del repositorio de GitHub para cargarse; no es cargable directamente con `diffusers`.
- No se documentan los idiomas soportados para los *prompts*, ni el comportamiento del modelo con textos en castellano.
- No se detalla si el LoRA requiere una palabra de activación (*trigger word*) específica ni cómo se especifican los parámetros físicos del agua en la inferencia.
- La fidelidad física del modelo de medio (atenuación, dispersión, luz de fondo) no está validada con mediciones reales en la información disponible.
- Sesgos conocidos: no disponibles. Al derivar del modelo base SDXL, es previsible que herede sus sesgos de representación, aunque esto no se documenta.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de generar escenas físicamente implausibles o geometrías inconsistentes, sin que la model card lo cuantifique.
- Restricciones de licencia: el repositorio se publica bajo apache-2.0, pero el uso comercial está condicionado también por la licencia del modelo base `stabilityai/stable-diffusion-xl-base-1.0`, que es independiente y debe respetarse.
- Aunque se declara la generación de datos sintéticos para entrenamiento, no se aportan garantías sobre la validez de esos datos para dominios concretos de aplicación en producción.

## Enlaces

- HuggingFace: https://huggingface.co/JiayiWuLeo/WaterGen
- Página del proyecto: https://tianfwang.github.io/watergen/
- Paper (arXiv): https://arxiv.org/abs/2606.31147
- Repositorio de código: https://github.com/jiayi-wu-umd/WaterGen
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
