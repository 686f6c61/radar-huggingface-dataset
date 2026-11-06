# hen/ganpaint-churchoutdoor

## Resumen

`hen/ganpaint-churchoutdoor` es un paquete de datos y pesos para el servidor de la reimplementación de GANPaint, publicado por el usuario `hen` (Hendrik Strobelt). Contiene un generador ProGAN entrenado sobre la categoría *church outdoor* de LSUN, convertido desde el checkpoint original `churchoutdoor_lsun.pth` al formato `safetensors`, junto con un fichero JSON de configuración que describe las unidades de la capa `layer4` (512 x 8 x 8) mediante cuantiles, umbrales y rankings de unidades por concepto.

No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un artefacto de investigación para edición semántica interactiva de imágenes. Permite "pintar" árboles, hierba, puertas, cielo, nubes, ladrillo y cúpulas sobre iglesias generadas por la GAN, modificando directamente las activaciones de unidades identificadas mediante la técnica de GAN Dissection. La edición se aplica como una interpolación `x * (1 - a) + v * a` sobre las unidades que coinciden con el pincel seleccionado.

Su relevancia es acotada pero clara: sirve como pieza reproducible para montar demos de interpretabilidad y edición controlada en GANs, y como ejemplo práctico de cómo empaquetar pesos y metadatos de disección en un formato moderno y seguro como `safetensors`. El repositorio es pequeño (0,1 GB) y está pensado para uso de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ProGAN (generador progresivo, sin discriminador incluido) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`churchoutdoor/generator.safetensors`) + JSON de configuración (`churchoutdoor/ganpaint.json`) |

## Arquitectura y entrenamiento

El generador es un ProGAN, es decir, una GAN generativa progresiva que crece en resolución por etapas. En este caso se ha entrenado sobre la categoría *church outdoor* del dataset LSUN, que contiene imágenes de iglesias en exteriores. El modelo procede del proyecto original GAN Dissection (Bau et al., ICLR 2019) y se ha reconvertido desde el checkpoint `churchoutdoor_lsun.pth` al formato `safetensors`.

La innovación relevante no está en la arquitectura sino en el uso: el fichero `ganpaint.json` contiene la disección de la capa `layer4` (512 canales de 8 x 8), con cuantiles, umbrales y rankings de unidades por concepto (árboles, hierba, puertas, cielo, nubes, ladrillo, cúpulas). Esto permite editar la imagen manipulando un subconjunto reducido de unidades de esa capa. No se dispone de información sobre el número exacto de tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF/DPO, ya que no aplica a este tipo de modelo.

## Capacidades

- Generación de imágenes de iglesias en exteriores mediante un generador ProGAN entrenado sobre LSUN church-outdoor.
- Edición semántica controlada por concepto: árboles, hierba, puertas, cielo, nubes, ladrillo y cúpulas.
- Modificación de activaciones en `layer4` mediante interpolación lineal sobre unidades identificadas por GAN Dissection.
- Integración con el servidor de la reimplementación de GANPaint (`ganpaint_2026`) para demos interactivas.
- Descarga automática de pesos y configuración al arrancar el servidor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la generación de imágenes.

## Casos de uso

- Demo de interpretabilidad en GANs: permite visualizar y manipular unidades de una capa concreta para estudiar qué conceptos codifica el generador, usando el JSON de disección como guía.
- Edición interactiva de imágenes de iglesias: un usuario puede pintar con pinceles asociados a conceptos (cielo, árboles, ladrillo) y ver el resultado en tiempo real a través del servidor de GANPaint.
- Investigación en edición semántica controlada: sirve para comparar la edición por unidades disecadas frente a otras técnicas de manipulación de latentes o de atención.
- Docencia y divulgación: el paquete es pequeño (0,1 GB) y reproducible, lo que facilita montar talleres sobre GAN Dissection y edición de activaciones.
- Replicación de experimentos del paper original: al incluir pesos y configuración, permite reproducir los resultados de disección sobre la categoría church-outdoor de LSUN.
- Prototipado de interfaces de edición de imágenes basadas en conceptos: el servidor expone una API que puede integrarse en herramientas de anotación o diseño asistido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que un generador ProGAN de este tamaño cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es más que suficiente para el generador. Para el servidor completo con interfaz, se recomienda una GPU con 8 GB o más.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4-8 GB de VRAM.
- Opciones de despliegue: servidor propio de `ganpaint_2026` mediante `uvicorn` (`uv run uvicorn --factory ganpaint_server.app:app_from_env --port 8000`); descarga de pesos con `huggingface_hub.snapshot_download`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Categoria | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hen/ganpaint-churchoutdoor` | ProGAN + disección | Iglesia exterior (LSUN) | no aplica | MIT | Hugging Face |
| GANPaint original (gandissect) | ProGAN + disección | Múltiples categorías (LSUN) | no aplica | Investigación | Repo original |
| StyleGAN2 (LSUN church) | GAN estilo | Iglesia (LSUN) | no aplica | Distintas según checkpoint | Varios repositorios |
| BigGAN (LSUN) | GAN condicional | Múltiples categorías | no aplica | Investigación | Varios repositorios |

La comparación es aproximada: no se dispone de datos de rendimiento cuantitativos para este paquete frente a las alternativas, y las licencias y disponibilidad de los checkpoints comparables varían según la fuente.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre la categoría *church outdoor* de LSUN; no generaliza a otras categorías ni a dominios fuera de esa distribución.
- Es un artefacto de investigación: el autor pide explícitamente que se use para investigación, aunque la licencia sea MIT.
- No incluye discriminador ni pipeline de inferencia estándar; requiere el servidor de `ganpaint_2026` o código propio para cargar el generador.
- La edición depende de la calidad de la disección recogida en `ganpaint.json`; conceptos no cubiertos o mal calibrados pueden producir resultados inconsistentes.
- Riesgo de artefactos visuales al forzar unidades fuera de su rango de activación típico.
- No dispone de información sobre sesgos del dataset LSUN church-outdoor más allá de los inherentes a la recolección de imágenes de iglesias.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni razonamiento; cualquier uso en esos contextos es inadecuado.
- La licencia MIT permite uso comercial, pero la procedencia de los datos LSUN y del checkpoint original conviene revisarla antes de un despliegue productivo.

## Enlaces

- Hugging Face: https://huggingface.co/hen/ganpaint-churchoutdoor
- Repositorio de la reimplementación: https://github.com/hendrikstrobelt/ganpaint_2026
- GAN Dissection (sitio del proyecto): https://gandissect.csail.mit.edu/
- Dataset LSUN: https://www.yf.io/p/lsun
- Paper GAN Dissection (ICLR 2019): https://arxiv.org/abs/1811.10597
