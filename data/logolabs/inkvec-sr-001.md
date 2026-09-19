# Logolabs/inkvec-sr-001

## Resumen

inkvec-sr-001 es un modelo de superresolución 4× desarrollado por LogoLabs y especializado en logotipos, iconos y arte plano. Se trata de un ajuste fino de MambaIRv2-Small (Guo et al., ECCV 2024), una arquitectura de espacio de estados atencional (Attentive State-Space Model, ASSM) con 9,77 millones de parámetros, y se distribuye como etapa de preprocesado del trazador ráster-a-vectorial Inkvec del mismo autor. Su función no es la restauración fotográfica genérica, sino producir bordes más nítidos e interiores más planos para que el trazador de contornos posterior genere SVG con menos parámetros y menor error de color.

El modelo resuelve un problema muy concreto del pipeline de vectorización: las imágenes de entrada suelen haber pasado por compresión JPEG/WebP, capturas de pantalla, redimensionados o aplicaciones de mensajería, lo que introduce artefactos que degradan el trazado. Sobre entrada JPEG q50, el pipeline SR + trazado reduce ΔE₀₀ de 1,001 a 0,438 y el recuento de parámetros de 19,81× a 6,78× respecto al original del artista. En un logotipo tipográfico real, el modelo alcanza 35,57 dB frente a los 31,23 dB del bicúbico (+4,34 dB).

Es relevante ahora porque cubre un nicho poco atendido (superresolución para arte vectorial plano) con un modelo muy pequeño —9,77 M de parámetros, pesos fp16 de ~20 MB— y licencia Apache-2.0, lo que permite uso comercial sin restricciones. Su principal peculiaridad técnica es que el enrutado Gumbel-Softmax del ASSM es estocástico incluso en modo evaluación, algo que el autor documenta y mitiga fijando la semilla del generador aleatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MambaIRv2-Small (Attentive State-Space Model, ASSM) con 128 tokens de prompt y enrutado Gumbel-Softmax |
| Parametros totales | 9,77 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; ventana espacial dependiente de la resolucion de entrada) |
| Tipos de cuantizacion | fp16 (formato de publicacion de los pesos); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de imagen, sin componente de texto) |
| Licencia | Apache-2.0 (pesos y codigo de arquitectura) |
| Formato de pesos | `.pt` (PyTorch, fp16, ~20 MB) |
| Factor de escala | 4× |
| Checkpoint | `perceptual-finetune/last`, paso 19.000 |
| Entrada / salida | image-to-image, RGB (canal alfa tratado por separado) |
| Dependencias | torch>=2.4, numpy, Pillow, einops, timm, mamba-ssm (kernels CUDA opcionales) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de MambaIRv2-Small, una arquitectura de espacio de estados con atención (ASSM) que incorpora 128 tokens de prompt y utiliza enrutado Gumbel-Softmax para seleccionar dinámicamente la información relevante. El archivo de arquitectura `mambairv2_arch.py` se distribuye de forma autónoma con adaptadores propios para `to_2tuple` y `trunc_normal_`, eliminando la dependencia de `basicsr`. El tronco procesa únicamente RGB; el canal alfa se transporta por separado mediante un remuestreo Lanczos.

El ajuste fino se realizó sobre arte de logotipos e iconos procedentes de una pila de SVG, partiendo del checkpoint denominado `perceptual-finetune`, en el paso 19.000 de entrenamiento. El autor no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (procedimientos, por otra parte, poco habituales en restauración de imagen). La innovación técnica documentada no está en la arquitectura base, sino en el uso del modelo como preprocesado del trazador Inkvec: maximizar la nitidez de borde y la planitud de interior para reducir el número de parámetros del SVG resultante.

Un aspecto técnico singular es la no determinación del ASSM: `F.gumbel_softmax(logits, hard=True)` muestrea ruido Gumbel en cada forward pass incluso bajo `model.eval()` y `torch.no_grad()`. Sin fijar la semilla, dos ejecuciones de la misma imagen pueden diferir hasta 12,45 niveles de píxel. Inkvec lo resuelve fijando la semilla `0x5641_4331` («VAC1») antes de cada pasada, lo que garantiza reproducibilidad bit a bit del SVG. Sustituir Gumbel-Softmax por argmax (límite de temperatura cero) empeora la calidad: ΔE₀₀ pasa de 0,5364 a 0,5492.

## Capacidades

- Superresolución 4× de imágenes de logotipos, iconos y arte plano con salida RGB.
- Reducción de artefactos de compresión JPEG/WebP, redimensionados agresivos y capturas de pantalla.
- Nitidez de bordes y planitud de interiores orientadas a mejorar el trazado vectorial posterior.
- Integración como etapa de preprocesado del trazador Inkvec, en modo `--sr auto` (actúa solo si detecta degradación) o `--sr on` (siempre activo).
- Uso independiente en Python mediante `torch.load` del checkpoint y reconstrucción del modelo con `MambaIRv2(**arch_kwargs)`.
- Tratamiento separado del canal alfa mediante Lanczos (el tronco es únicamente RGB).
- Inferencia en CPU o GPU no NVIDIA mediante un escaneo asociativo Hillis-Steele implementado en PyTorch puro (`tools/inkvec_sr/scan.py`), a costa de menor velocidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües: es un modelo exclusivamente de imagen a imagen.

## Casos de uso

- Preparación de logotipos para vectorización automática: introducir un PNG o JPEG degradado y obtener una imagen 4× con bordes limpios que el trazador convierta en un SVG con menos nodos y mejor fidelidad de color.
- Recuperación de material de marca histórico: logotipos conservados únicamente como capturas de pantalla o JPEG de baja calidad pueden restaurarse antes de reconstruir el vector original.
- Limpieza de activos de diseño tras mensajería o compartición web: imágenes que han pasado por aplicaciones de chat o plataformas con recompresión agresiva recuperan definición antes de incorporarlas a un manual de marca.
- Generación de iconos en múltiples resoluciones: a partir de un icono fuente pequeño se obtiene una versión 4× coherente que puede rasterizarse a distintos tamaños o vectorizarse para temas de interfaz.
- Pipeline de conversión masiva de assets: al pesar solo ~20 MB en fp16 y tener 9,77 M de parámetros, el modelo puede ejecutarse en lote sobre catálogos enteros de iconos en una GPU de gama media.
- Preprocesado dentro de una herramienta de diseño o plugin: al distribuirse con licencia Apache-2.0 y arquitectura autónoma sin `basicsr`, es integrable en productos comerciales de edición vectorial.
- Restauración previa a OCR o análisis de marcas: mejorar la definición de un logotipo rasterizado antes de aplicar detección o reconocimiento de texto en imágenes de producto.
- Reproducción determinista en entornos de producción gráfica: fijando la semilla `0x56414331` se obtiene siempre el mismo resultado, requisito para flujos con control de versiones de activos.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. Conjunto de validación propio de 120 imágenes de logotipos e iconos, escalado 4×, ordenado por PSNR de primer plano (alfa > 0). Métricas no verificadas de forma independiente.

| Modelo / checkpoint | PSNR primer plano (dB) | PSNR global (dB) |
|---|---|---|
| perceptual-finetune/last (19.000) — este checkpoint | 42,67 | 43,85 |
| geometry-finetune/last (8.500) | 41,99 | 43,33 |
| geometry-finetune/best (8.750) | 41,89 | 43,48 |
| chained-x16/best (19.200) | 41,89 | 43,63 |
| official-x4-prodigy/best (3.750) | 40,50 | 42,66 |
| alpha2048/last (9.000) | 39,98 | 42,08 |

Métricas adicionales reportadas en la model card:

| Escenario | Resultado |
|---|---|
| Logotipo tipográfico real, frente a bicúbico | 35,57 dB frente a 31,23 dB (+4,34 dB) |
| JPEG q50, SR + trazado: ΔE₀₀ | 1,001 → 0,438 |
| JPEG q50, SR + trazado: parámetros del SVG | 19,81× → 6,78× respecto al original del artista |
| Determinismo sin semilla fijada | hasta 12,45 niveles de discrepancia por píxel |
| Gumbel-Softmax frente a argmax (ΔE₀₀) | 0,5364 frente a 0,5492 |

No se han publicado resultados de benchmarks en la informacion disponible para métricas estándar de superresolución como Set5, Set14, Urban100 o DIV2K, ni comparaciones con SSIM o LPIPS.

## Requisitos de hardware

- Pesos en fp16 de aproximadamente 20 MB, por lo que el peso del modelo es despreciable en términos de VRAM. El consumo dominante son las activaciones, que escalan con la resolución de la imagen de entrada y el tamaño del parche procesado.
- Estimación orientativa (no confirmada por el autor): una GPU con 4-6 GB de VRAM debería bastar para parches de resolución moderada; imágenes completas de gran tamaño pueden requerir procesado por teselas o más memoria.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes. La elección de gama afecta sobre todo a la velocidad, no a la viabilidad.
- Los kernels CUDA de `mamba-ssm` son la vía rápida recomendada. Existe un fallback en PyTorch puro (escaneo asociativo Hillis-Steele en `tools/inkvec_sr/scan.py`) que permite inferencia en CPU y en GPU no NVIDIA, funcional pero más lento.
- Opciones de despliegue: script Python propio con PyTorch, la CLI de Inkvec (`inkvec input.png -o output.svg --sr auto`), o integración dentro de un servicio de procesado de imágenes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son motores orientados a modelos de lenguaje.
- No se publican cifras de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / escala | Licencia | Enfoque |
|---|---|---|---|---|---|
| inkvec-sr-001 | 9,77 M | MambaIRv2-Small (SSM atencional) | 4× | Apache-2.0 | Logotipos e iconos, preprocesado de vectorización |
| Bicubico (referencia del autor) | no aplica | Interpolacion clasica | 4× | no aplica | Referencia de comparacion; 31,23 dB en el logotipo de prueba |
| Real-ESRGAN | ~16,7 M (RRDB x4) | GAN con red residual densa | 4× | BSD-3-Clause | Restauracion fotografica general |
| SwinIR | ~11-30 M segun variante | Transformer con ventanas desplazadas | 2×, 3×, 4×, 8× | Apache-2.0 | Superresolucion y restauracion de imagen general |

La comparación con Real-ESRGAN y SwinIR es cualitativa: no se dispone de evaluaciones cruzadas en el mismo conjunto de validación de 120 imágenes de logotipos, ni de resultados en métricas perceptuales o de fidelidad de vectorización para esos modelos. La ventaja diferencial de inkvec-sr-001 no es el tamaño ni la arquitectura, sino el ajuste específico sobre arte plano y su integración con un trazador vectorial que aprovecha la salida de forma explícita.

## Limitaciones y advertencias

- Especialización estrecha: está ajustado para logotipos, iconos y arte plano. No es un modelo de restauración fotográfica y su comportamiento en fotografías, retratos o escenas naturales no está documentado.
- No determinismo por defecto: el enrutado Gumbel-Softmax muestrea ruido en cada forward pass incluso en evaluación. Sin fijar la semilla `0x5641_4331` pueden aparecer discrepancias de hasta 12,45 niveles por píxel entre ejecuciones idénticas. Cualquier despliegue en producción debe gestionar explícitamente la semilla si requiere reproducibilidad.
- El truco de determinismo no es gratuito en términos de diseño: la alternativa determinista por argmax degrada la calidad (ΔE₀₀ de 0,5364 a 0,5492), de modo que hay un compromiso entre reproducibilidad estricta y fidelidad máxima.
- El tronco procesa solo RGB; el canal alfa se maneja aparte mediante Lanczos. Transparencias complejas, degradados alfa o máscaras suaves pueden no reconstruirse con la misma calidad que el contenido de color.
- Dependencia de kernels CUDA: `mamba-ssm` solo funciona en NVIDIA. El fallback en PyTorch puro es funcional pero más lento, lo que condiciona despliegues en CPU o aceleradores no NVIDIA.
- Renderizado estocástico y dependiente de la implementación: pequeñas diferencias de versión en PyTorch o en las rutas de `gumbel_softmax` podrían alterar los resultados aunque la semilla esté fijada.
- Sesgos: al entrenarse sobre arte de logotipos e iconos, el modelo puede sobrerrepresentar determinados estilos gráficos (formas geométricas limpias, paletas planas) y comportarse peor con ilustraciones texturizadas o logotipos con detalle fotográfico.
- Riesgo de alucinación estructural: en superresolución generativa el modelo puede inventar detalles plausibles en bordes o texturas que no existen en la entrada. En el contexto de reconstrucción de marcas esto puede introducir deformaciones sutiles en tipografías o símbolos.
- Licencia Apache-2.0: permite uso comercial, académico e independiente sin restricciones de atribución más allá de las habituales de la licencia. No se detectan cláusulas de uso aceptable adicionales.
- Modelo sin tracción pública: cero descargas y cero likes en el momento de la consulta, sin validación externa de los resultados declarados. Las métricas del `model-index` figuran como no verificadas.
- Los resultados de benchmarks proceden de un conjunto de validación propietario de 120 imágenes y no son comparables con las métricas habituales de la literatura de superresolución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Logolabs/inkvec-sr-001
- Modelo complementario (denoised de JPEG/WebP): https://huggingface.co/Logolabs/inkvec-denoiser-001
- Repositorio del trazador Inkvec: https://github.com/logolabs/inkvec
- Paper de MambaIRv2 (Guo et al., ECCV 2024): referencia citada en la model card; no se proporciona URL directa en la información disponible.
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron únicamente páginas sobre billetes en euro del Banco Central Europeo, la Bundesbank y Wikipedia, sin relación alguna con inkvec-sr-001.
