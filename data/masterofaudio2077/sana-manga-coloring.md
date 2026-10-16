# masterofaudio2077/sana-manga-coloring

## Resumen
Sana manga coloring es un modelo de colorización de páginas de manga en blanco y negro, publicado por el usuario masterofaudio2077 en HuggingFace. Se trata de un fine-tune del modelo de difusión Sana 600M (Efficient-Large-Model/Sana_600M_1024px_diffusers) orientado a la tarea image-to-image: recibe una página en escala de grises y devuelve una versión coloreada. Su rasgo diferencial es que permite dirigir el resultado mediante cinco controles discretos (mood, time_of_day, lighting, saturation y palette), cada uno de los cuales puede dejarse vacío (`<null>`) para que el modelo decida por sí mismo.

El checkpoint es un ajuste fino de la fase "teacher" del modelo base, entrenado a 512 px durante 30.000 pasos sobre aproximadamente 60 GB de páginas de manga de diversos géneros. El repositorio ocupa 1,2 GB e incluye los pesos `ema_bf16.pt`, además de los módulos `data.py`, `model.py` y los ficheros `meta.json` y `params.json` necesarios para la inferencia. El uso no está mediado por la API de `diffusers`, sino por código propio del autor.

La relevancia actual del modelo reside en su nicho: la colorización de manga es una tarea con demanda real en escaneo, traducción y publicación digital, y este checkpoint ofrece control semántico sobre paleta y ambiente en lugar de una simple conversión automática. A fecha de creación (16 de octubre de 2026) el repositorio acumula 0 descargas y 0 likes, y no se especifica licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune del modelo de difusión Sana 600M con módulo `Colorizer` y embeddings de etiquetas de control; tarea image-to-image |
| Parametros totales | 600 M correspondientes al modelo base Sana_600M; el total del checkpoint fine-tuneado no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen; no procesa texto libre como prompt) |
| Tipos de cuantizacion | No se proporcionan cuantizaciones oficiales; pesos en bfloat16 (`ema_bf16.pt`) |
| Idiomas soportados | No disponibles (las etiquetas de control están definidas en inglés) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch `.pt` en bfloat16, más módulos Python (`data.py`, `model.py`) y metadatos JSON |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del Sana 600M, un diffusion transformer con mecanismos de atención lineal y un autoencoder de compresión profunda (DC-AE) descrito en la documentación pública del modelo base. Sobre esa base, el autor añade un módulo `Colorizer` y un sistema de etiquetas discretas que se codifican como identificadores y se inyectan en el proceso de muestreo, lo que permite condicionar el resultado sin recurrir a un prompt de texto. Los cinco ejes de control son mood (12 valores), time_of_day (5 valores), lighting (11 valores), saturation (3 valores) y palette (17 valores), todos opcionales.

El entrenamiento se realizó a 512 px y el checkpoint publicado corresponde a los pesos EMA de la fase "teacher" en el paso 30.000. El conjunto de datos empleado ronda los 60 GB de páginas de manga de distintos géneros. No se especifica en la model card si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias, ni la composición exacta del dataset; la lista completa de hiperparámetros se remite al fichero `params.json` incluido en el repositorio.

## Capacidades
- Colorización de páginas de manga en blanco y negro a partir de una entrada en escala de grises (convertida a RGB de un solo canal en el ejemplo de uso).
- Control condicional mediante cinco ejes independientes: estado de ánimo, momento del día, iluminación, saturación y paleta de color.
- Modo totalmente automático: si todos los controles se dejan como `<null>`, el modelo elige los colores por sí mismo.
- Redimensionado interno a múltiplos de 32 con escala basada en el lado menor de la página (512 px como referencia en el ejemplo).
- Inferencia autocast en bfloat16 sobre GPU CUDA, con parámetros de muestreo configurables (pasos, escalas de guiado y escala de control).
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto.
- No incluye capacidades de visión general, audio ni modos de "thinking"; su alcance se limita a la traducción imagen-a-imagen en el dominio del manga.

## Casos de uso
- Digitalización y publicación de manga: colorear páginas escaneadas antes de subirlas a plataformas de lectura, eligiendo una paleta coherente con el tono de la obra (por ejemplo `sepia and cream` para flashbacks o `cool blue` para escenas nocturnas).
- Localización y reedición: aplicar un esquema de color homogéneo a un volumen completo fijando los mismos controles en todas las páginas, útil para ediciones recopilatorias o reediciones con estilo definido.
- Producción de webcómic y doujin: artistas que trabajan en blanco y negro pueden generar versiones coloreadas rápidamente y ajustar el ambiente con `mood` y `lighting` sin repintar manualmente.
- Previsualización de estilo para dirección de arte: probar distintas combinaciones de paleta y saturación sobre una misma página para decidir el aspecto final de una serie antes de invertir horas de colorista.
- Preservación y archivo: recuperar color en obras antiguas o con escaneos degradados, aplicando tonos cálidos (`warm amber and brown`) o sepia para conservar una estética de época.
- Escenas específicas por franja horaria: usar `time_of_day` (`dawn`, `evening`, `night`) para reforzar la narrativa visual en viñetas donde la iluminación es importante para la lectura.
- Experimentación creativa en investigación: servir como banco de pruebas para estudiar control condicional discreto en modelos de difusión aplicados a dominios con líneas y tramas densas.
- Integración en pipelines de edición por lotes: dado que la inferencia se hace con código Python propio (`data.py`, `model.py`), es viable envolverlo en un script que procese capítulos completos de forma desatendida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, LPIPS, PSNR ni comparaciones con otros colorizadores) y se limita a mostrar ejemplos cualitativos en la carpeta `results/`.

## Requisitos de hardware
- VRAM estimada: el checkpoint en bfloat16 ocupa aproximadamente 1,2 GB (tamaño del repositorio); sumando el VAE de Sana y las activaciones a 512 px, una estimación razonable se sitúa en el rango de 4 a 8 GB, aunque el autor no publica cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 y al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). El código de ejemplo usa `torch.autocast("cuda", torch.bfloat16)`.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más, dado el tamaño del modelo base (600 M) y la resolución de trabajo (512 px). No se confirma en la información disponible el funcionamiento en GPUs con menos de 8 GB.
- Opciones de despliegue: no se ofrece soporte oficial para vLLM, Ollama, TGI ni llama.cpp (no aplican a un modelo de imagen de este tipo). El despliegue indicado es mediante los módulos Python propios del repositorio, con la descarga automática de los pesos del modelo base Sana la primera vez que se construye `Colorizer`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masterofaudio2077/sana-manga-coloring | 600 M (base) | 512 px en entrenamiento | Colorizacion de manga con controles discretos | No disponible | HuggingFace, descarga directa |
| Efficient-Large-Model/Sana_600M_1024px_diffusers | 600 M | 1024 px | Texto a imagen general | No disponible en esta ficha (consultar el repositorio del modelo base) | HuggingFace, ampliamente utilizado |
| Otros colorizadores de manga basados en difusion o ControlNet | No disponible | No disponible | Colorizacion de manga | Variable segun autor | No disponible |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias
- Tramas densas y screentone: el propio autor advierte que el rayado muy denso y las tramas pueden convertirse en manchas irregulares (blotchy patches).
- Confusion de colores: la ropa y la piel a veces se confunden entre sí, lo que puede producir errores visibles en personajes.
- Sesgo hacia tonos suaves: los colores siguen la distribución del material de entrenamiento y tienden a ser apagados salvo que se elija explícitamente una etiqueta `vivid`.
- Sin licencia especificada: al no declararse licencia, no puede garantizarse el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados: aunque las etiquetas están en inglés, no se documenta el comportamiento del modelo con contenido en otros idiomas ni su alcance multilingüe.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede introducir colores o detalles inexistentes en la página original, especialmente en zonas ambiguas.
- Alcance limitado: no es un modelo de propósito general; solo hace colorización de manga y no admite prompts de texto libre.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de redactar la ficha, sin validacion por parte de la comunidad.
- Mantenimiento incierto: no se documentan actualizaciones posteriores a la creacion del repositorio (16 de octubre de 2026).

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/masterofaudio2077/sana-manga-coloring
- Modelo base Sana 600M: https://huggingface.co/Efficient-Large-Model/Sana_600M_1024px_diffusers
- Repositorio oficial de Sana (referencia del modelo base): https://github.com/NVlabs/Sana
- Articulo de Sana (referencia del modelo base): https://arxiv.org/abs/2410.10629
