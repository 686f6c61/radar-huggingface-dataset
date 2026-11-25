# creative-graphic-design/sawna

## Resumen

SAWNA (Space-Aware Text-to-Image Generation) es un método de generación de imágenes texto-a-imagen que permite reservar regiones concretas del lienzo para elementos de diseño posteriores, como titulares, logotipos o etiquetas de producto. No es un modelo con pesos propios: es un paquete de código sobre `diffusers` que modifica el ruido inicial en las zonas indicadas mediante cajas delimitadoras normalizadas, antes de que comience el proceso de denoising. Lo desarrollan Ryugo Morita, Sho Kuno, Ryunosuke Tanaka, Rongzhi Li, Hoang Dai Dinh e Issey Sukeda, y se presentó en SIGGRAPH Posters 2025.

La innovación es la mezcla de ruido: en lugar de partir del ruido gaussiano habitual, SAWNA combina ese ruido con ruido desplazado por TKG-DM dentro de las regiones seleccionadas, aplicando una máscara binaria en el espacio latente suavizada con un desenfoque gaussiano separable. El resultado es una composición donde el área reservada queda disponible para superponer elementos de diseño sin que el modelo la ocupe con contenido generado.

Es relevante para flujos de diseño gráfico automatizado porque es training-free (no requiere entrenamiento ni fine-tuning) y mantiene la interfaz estándar de `diffusers`. Soporta Stable Diffusion 1.5, 2.1 y XL, pero no incluye pesos base: el usuario debe aportar el checkpoint subyacente con su propia licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Método de condicionamiento sobre modelos de difusión (SD 1.5, SD 2.1, SDXL); no es un modelo propio |
| Parámetros totales | no disponible (depende del checkpoint base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (condicionamiento por prompt de texto; sin ventana de contexto definida) |
| Tipos de cuantización | no disponible (heredados del checkpoint base) |
| Idiomas soportados | inglés (prompts) |
| Licencia | Apache-2.0 (código); los checkpoints base conservan su licencia original |
| Formato de pesos | no disponible (el paquete es solo código; los pesos provienen del checkpoint base en safetensors/diffusers) |

## Arquitectura y entrenamiento

SAWNA no entrena ni fine-tunea ningún modelo. Es una capa de preprocesamiento del ruido latente que se aplica sobre pipelines de difusión existentes. Concretamente, convierte cajas normalizadas `(x1, y1, x2, y2)` en una máscara binaria en el espacio latente, le aplica un desenfoque gaussiano separable (por defecto, el 2 % del lado más corto de la rejilla latente) y mezcla el ruido inicial con ruido desplazado por TKG-DM según `epsilon_masked = epsilon + mask_blurred * (epsilon_shifted - epsilon)`.

Los checkpoints soportados son SD 1.5 (512×512), SD 2.1 (768×768) y SDXL (1024×1024), todos con cuatro canales latentes y escala espacial de 8×. SDXL además usa sus entradas estándar de condicionamiento de tamaño y recorte. TKG-DM es una dependencia de ejecución obligatoria, disponible en el repositorio `design-generators`. El método es training-free y determinista respecto a la revisión del checkpoint, el scheduler, la precisión y los ajustes de generación.

## Capacidades

- Generación de imágenes texto-a-imagen con reserva de regiones mediante cajas delimitadoras normalizadas.
- Composición espacial controlada: permite dejar libre un área para titular, logotipo, marca o etiqueta de producto.
- Compatibilidad con tres familias de checkpoints: Stable Diffusion 1.5, 2.1 y SDXL.
- Interfaz estándar `diffusers`: devuelve un resultado de imagen convencional, integrable en pipelines existentes.
- Control del desenfoque de máscara: parámetro configurable, con valor automático del 2 % del lado menor de la rejilla latente.
- Sin entrenamiento: no requiere GPU para ajuste, solo para inferencia del checkpoint base.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento; su alcance es exclusivamente generación de imagen condicionada por texto y máscara espacial.

## Casos de uso

- Diseño de carteles y pósters: se reserva la franja superior o inferior para el titular y se genera el fondo sin que el modelo invada esa zona, lo que acelera la composición final en herramientas de diseño.
- Banners publicitarios: se define la caja del logotipo de marca y se genera la imagen de fondo alrededor, garantizando espacio limpio para la superposición corporativa.
- Etiquetas de producto: se reserva el área donde irá el texto legal o el código de barras y se genera el envoltorio visual del producto sin colisiones gráficas.
- Maquetación editorial automatizada: en un pipeline que genera ilustraciones para artículos, SAWNA permite fijar dónde irá el pie de foto o el título de sección antes de generar la imagen.
- Generación de assets para plantillas web: se reservan zonas para texto superpuesto en hero images, manteniendo la legibilidad sin retoques manuales posteriores.
- Prototipado rápido de creatividades: al ser training-free y usar la interfaz `diffusers`, se integra en scripts de generación por lotes para producir borradores de diseño revisables y editables antes de publicación.
- Investigación en composición espacial: sirve como referencia reproducible (DOI y Space fijado) para estudiar control espacial en modelos de difusión sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del checkpoint base. SD 1.5 en fp16 requiere aproximadamente 4-6 GB; SD 2.1 en fp16, unos 6-8 GB; SDXL en fp16, en torno a 8-12 GB (estimaciones habituales para estos checkpoints, no publicadas en la información del paquete).
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño de los checkpoints base, cabría esperar RTX 3060/4070/4090 para SD 1.5 y 2.1, y RTX 4090, A100 o H100 para SDXL en producción.
- ¿Cabe en GPU de consumo? Sí, siempre que el checkpoint base quepa; SAWNA añade solo operaciones de máscara y mezcla de ruido, con coste computacional despreciable frente al denoising.
- Opciones de despliegue: `diffusers` (librería declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a generación de imagen.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAWNA (este paquete) | Método de control espacial sobre difusión | no aplica (solo código) | no aplica | Apache-2.0 (código) | Hugging Face, código publicado |
| Stable Diffusion 1.5 (base) | Modelo texto-a-imagen | no disponible en la información | no aplica | CreativeML OpenRAIL-M (según checkpoint) | Amplia |
| Stable Diffusion XL (base) | Modelo texto-a-imagen | no disponible en la información | no aplica | CreativeML OpenRAIL++-M (según checkpoint) | Amplia |
| TKG-DM (dependencia) | Método de desplazamiento de ruido | no aplica | no aplica | no disponible | GitHub `design-generators` |

No se dispone de datos de rendimiento comparativo entre SAWNA y alternativas de control espacial (por ejemplo, inpainting o ControlNet) en la información proporcionada.

## Limitaciones y advertencias

- No garantiza que la región reservada quede completamente vacía ni que el sujeto se coloque en una posición concreta; solo sesga el ruido inicial.
- No incorpora garantías de seguridad ni sustituye la revisión específica del checkpoint base.
- Los sesgos, limitaciones y términos de acceso se heredan del checkpoint base elegido (SD 1.5, 2.1 o SDXL).
- Los resultados varían según la revisión del checkpoint, el scheduler, las versiones de runtime, el dispositivo, la precisión y los ajustes de generación.
- Solo soporta prompts en inglés según la model card.
- El paquete no incluye pesos: sin un checkpoint base compatible no funciona.
- El checkpoint Dreamlike del Space original queda fuera del alcance del paquete.
- La licencia Apache-2.0 cubre el código; el uso comercial de las imágenes generadas depende de la licencia del checkpoint base y de la legislación aplicable.
- No otorga derechos sobre el contenido generado.
- Dependencia obligatoria de TKG-DM en tiempo de ejecución, lo que añade un punto de fallo y una dependencia externa al pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/creative-graphic-design/sawna
- Paper (DOI): https://doi.org/10.1145/3721250.3743023
- SIGGRAPH 2025, registro de presentación: https://s2025schedule.siggraph.org/index.html?post_type=page&p=14&id=pos_281&sess=sess439.html
- Space de referencia (EQUES): https://huggingface.co/spaces/EQUES/Space-Aware_Text-to-Image_Generation/tree/e0a8f843a0b4e62c0650b03d5f335271ecb36d0b
- Repositorio TKG-DM: https://github.com/creative-graphic-design/design-generators/tree/main/models/tkg-dm
- Código del paquete SAWNA: https://github.com/creative-graphic-design/design-generators/tree/main/models/sawna
- Documentación de diffusers: https://huggingface.co/docs/diffusers/index
- Checkpoint SD 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Checkpoint SD 2.1: https://huggingface.co/sd2-community/stable-diffusion-2-1
- Checkpoint SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
