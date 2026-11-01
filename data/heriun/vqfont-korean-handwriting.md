# HERIUN/vqfont-korean-handwriting

## Resumen

VQ-Font · Korean handwriting es un modelo de generación de fuentes few-shot especializado en hangul, desarrollado por el usuario HERIUN a partir de VQ-Font (AAAI 2024). El modelo recibe un puñado de imágenes de glifos en un estilo concreto —una fuente o la caligrafía de una persona— y genera cualquier carácter hangul del texto solicitado imitando ese estilo. Se distribuye únicamente para inferencia, sin código de entrenamiento, y funciona tanto en CPU como en GPU.

Técnicamente es una adaptación del VQ-Font original al coreano: sustituye las 13 estructuras de componentes chinos por 6 layouts de sílaba hangul, reentrena el transformer que predice índices de un codebook VQGAN de 1024 entradas y ajusta las primeras capas del decoder del VQGAN. El checkpoint liberado (`kor_di_legacy`) tiene 16,7 millones de parámetros (64 MB) y genera imágenes en escala de grises de 128×128.

Su relevancia es acotada pero clara: cubre la generación de fuentes hangul few-shot con un modelo pequeño que cabe en cualquier equipo, y reporta mejoras sustanciales frente a DM-Font y MX-Font++ en fuentes no vistas (HWD∞ de 0,151 frente a 0,338 y 0,429). Es un modelo de nicho, no un LLM, y conviene evaluarlo como herramienta de generación de glifos, no como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VQ-Font: transformer sobre índices de codebook VQGAN con condicionamiento por contenido y referencias de estilo |
| Parametros totales | 16.670.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; condiciona con 3 referencias por carácter) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | coreano (hangul; 11.172 sílabas) |
| Licencia | other (`upstream-unspecified`; el repo upstream de VQ-Font no declara licencia) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VQ-Font: para cada carácter objetivo predice una rejilla de índices de un codebook VQGAN preentrenado, usando un transformer que atiende al glifo de contenido del carácter y a las características extraídas de las imágenes de referencia. Las adaptaciones al coreano son cuatro: un prior estructural con 6 layouts de sílaba hangul en lugar de los 13 componentes chinos (el id 6 indica ausencia de layout y se usa para referencias sin etiqueta), un codebook de 1024 entradas inicializado a partir de datos, un ajuste fino de las primeras capas del decoder VQGAN junto con el generador, y glifos de contenido renderizados con NanumBarunpen (incluida en el repo), lo que permite generar las 11.172 sílabas hangul.

El entrenamiento usó 709 fuentes coreanas de uso libre, aproximadamente la mitad caligrafías de Ownglyph y el resto de Noonnu; no se empleó caligrafía escaneada real. El checkpoint publicado corresponde al generador con media móvil exponencial (EMA) y consta de 150.000 pasos. El encoder VQGAN y las redes de pérdida no se incluyen porque no se usan en inferencia. Las referencias se seleccionan de forma determinista: si están disponibles los 3 caracteres con los que el modelo fue entrenado para el objetivo (según `cr_mapping.json`, sobre un conjunto fijo de 36 caracteres) se usan esos; en caso contrario se eligen las referencias que comparten más jamo y estructura silábica, con desempate por similitud del encoder de contenido al esqueleto del objetivo.

## Capacidades

- Generación few-shot de glifos hangul: dibuja cualquier sílaba del texto de entrada en el estilo de 5-10 imágenes de referencia.
- Referencias sin etiqueta: no es necesario indicar qué carácter representa cada imagen de referencia.
- Cobertura completa del hangul moderno: 11.172 sílabas.
- Salida en escala de grises de 128×128 píxeles por carácter, normalizada por min-max.
- Ejecución en CPU o GPU (`device="cuda"` opcional), con dependencias mínimas: torch, numpy, pillow, safetensors y huggingface_hub.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento; es un modelo de imagen a imagen específico de fuentes.
- No es multilingüe: solo hangul; otros caracteres se procesan pero no fueron entrenados ni evaluados.

## Casos de uso

- Creación de fuentes personalizadas a partir de una muestra pequeña: un diseñador aporta 5-10 glifos de su caligrafía y el modelo genera el resto del hangul necesario para completar el alfabeto de una fuente.
- Prototipado rápido de tipografías: generar un set de glifos de prueba en un estilo concreto antes de invertir en el diseño manual de la fuente completa.
- Personalización de interfaces y merchandising: producir títulos o rótulos en hangul con la caligrafía de un cliente a partir de unas pocas muestras escaneadas o fotografiadas.
- Generación de datos sintéticos para entrenamiento: crear glifos en estilos variados para aumentar datasets de OCR o de reconocimiento de escritura hangul.
- Investigación en generación de fuentes few-shot: el modelo sirve como referencia reproducible para comparar con DM-Font o MX-Font++ en coreano, con métricas HWD∞, SSIM e IoU publicadas.
- Aplicaciones educativas o de demostración: un espacio de Hugging Face (el propio autor publica `mxfontpp-korean-demo`) que muestra al usuario cómo se genera su escritura en tiempo real en CPU.
- Restauración estilística de rótulos: completar texto hangul en un estilo coherente cuando solo se dispone de unos pocos caracteres de muestra de un rótulo o logotipo.

## Benchmarks y rendimiento

Distancias HWD∞ (menor es mejor) sobre caracteres que el modelo nunca vio, con 3 referencias por carácter objetivo y 245 caracteres reservados:

| Referencias | Fuentes no vistas | Escritores reales |
|---|---|---|
| Los 36 caracteres fijos de entrenamiento | 0,292 | 0,572 |
| 10 arbitrarias, etiquetadas | 0,426 | 0,629 |
| 10 arbitrarias, sin etiqueta | 0,437 | 0,603 |
| 5 arbitrarias, sin etiqueta | 0,493 | 0,654 |

Comparativa con modelos previos (mismas 36 referencias y 245 caracteres reservados):

| Conjunto | Métrica | DM-Font | MX-Font++ | VQ-Font |
|---|---|---|---|---|
| 30 fuentes Ownglyph no vistas | HWD∞ ↓ | 0,338 | 0,429 | 0,151 |
| | fuentes en las que es mejor | 1 | 0 | 29 |
| | SSIM ↑ / IoU ↑ | 0,743 / 0,567 | 0,722 / 0,509 | 0,816 / 0,697 |
| 10 fuentes Ownglyph vistas (caracteres no vistos) | HWD∞ ↓ | 0,272 | no disponible | 0,107 |

HWD∞ es la distancia de escritura corregida por sesgo sobre características de VGG; 0 indica que ambas distribuciones de estilo coinciden. No se han publicado resultados de benchmarks generales de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 16,7 millones de parámetros (64 MB en safetensors) el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera con suficiente memoria para el runtime de PyTorch; no requiere A100 ni H100. Una RTX 4090 o una GPU integrada moderna son más que suficientes.
- Cabe en GPU consumer: sí, en todas las actuales; también funciona en CPU según la model card.
- Opciones de despliegue: PyTorch con el paquete `vqfont_kor` incluido en el repo de Hugging Face y `huggingface_hub` para descargar los pesos; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | HWD∞ (30 fuentes no vistas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VQ-Font Korean (este) | 16,7 M | 3 referencias por carácter, 128×128 | 0,151 | other (upstream sin especificar) | Hugging Face, inferencia en CPU/GPU |
| DM-Font | no disponible | referencias por carácter | 0,338 | no disponible | investigación (paper) |
| MX-Font++ | no disponible | referencias por carácter | 0,429 | no disponible | investigación (paper) |
| VQ-Font original (chino) | no disponible | referencias por carácter | no disponible para hangul | upstream sin especificar | GitHub del autor |

## Limitaciones y advertencias

- Caligrafía escaneada real: en escaneos la salida se desplaza hacia el prior de fuentes aprendido, con trazos más limpios y regulares que los del escritor; en ese caso DM-Font suele acercarse más al estilo original (HWD∞ de 0,572 frente a 0,629 de DM-Font según la tabla de la model card para escritores).
- Fuente de contenido fija: el esqueleto siempre proviene de NanumBarunpen, por lo que formas de letra muy inusuales solo se reproducen parcialmente.
- Normalización: cada salida se normaliza por min-max, así que la oscuridad absoluta de la tinta no se conserva.
- Cobertura limitada al hangul: otros caracteres se procesan pero no fueron entrenados ni evaluados; no hay soporte multilingüe.
- Licencia: el repositorio upstream de VQ-Font no declara licencia, por lo que el modelo se marca como `other`; hay que revisar los términos upstream antes de un uso comercial. NanumBarunpen está bajo SIL Open Font License.
- Sin datos publicados de sesgos, alucinación o robustez fuera del dominio de fuentes hangul; no es un modelo de lenguaje y no debe evaluarse como tal.
- Solo se distribuyen pesos de inferencia (generador EMA); no hay código de entrenamiento ni posibilidad de reentrenar con el paquete publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HERIUN/vqfont-korean-handwriting
- Demo (con MX-Font++): https://huggingface.co/spaces/HERIUN/mxfontpp-korean-demo
- Repositorio upstream de VQ-Font: https://github.com/Yaomingshuai/VQ-Font
- Paper VQ-Font (AAAI 2024): https://arxiv.org/abs/2308.15401 (referencia de la cita BibTeX de la model card)
- Fuente de datos de caligrafía Ownglyph: no disponible como enlace en la información proporcionada
- Fuente de datos Noonnu: no disponible como enlace en la información proporcionada
- NanumBarunpen (SIL Open Font License): no disponible como enlace en la información proporcionada
