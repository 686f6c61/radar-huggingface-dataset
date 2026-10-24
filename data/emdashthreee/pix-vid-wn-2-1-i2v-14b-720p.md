# emdashthreee/pix-vid-WN-2.1-i2v-14b-720p

## Resumen

`emdashthreee/pix-vid-WN-2.1-i2v-14b-720p` es un repositorio de pesos en formato Diffusers para generación de vídeo a partir de una imagen (image-to-video) a 720P. El contenido técnico corresponde a **Wan2.1 I2V-14B-720P**, el modelo de la familia Wan2.1 desarrollada por el equipo Wan (Alibaba), publicado originalmente en febrero de 2025 bajo licencia Apache 2.0. El repositorio analizado es una resubida de terceros: el autor `emdashthreee` no coincide con el organización oficial `Wan-AI`, y la model card incluida es la de Wan2.1.

El modelo resuelve la animación condicionada de una imagen estática: recibe un fotograma de partida más un prompt textual y genera una secuencia de vídeo coherente temporalmente a resolución 720P. Forma parte de una suite que cubre text-to-video, image-to-video, edición de vídeo, text-to-image y vídeo-a-audio, e incorpora un VAE propio (Wan-VAE) capaz de codificar y decodificar vídeo 1080P de longitud arbitraria preservando información temporal.

Su relevancia actual radica en dos factores: es uno de los pocos modelos de vídeo de gran escala con pesos abiertos y licencia permisiva (Apache 2.0, sin restricciones de uso comercial), y su variante pequeña demuestra que la inferencia en GPU de consumo es viable. El recuento real de parámetros de los safetensors del repositorio es de 16.394.878.784 (16,39 mil millones), por encima de la cifra comercial "14B" que designa el backbone de difusión; el total incluye el resto de componentes serializados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para vídeo, con VAE espacio-temporal propio (Wan-VAE) y codificador de texto para el prompt |
| Parámetros totales | 16.394.878.784 según safetensors del repositorio (la nomenclatura comercial "14B" referencia el backbone de difusión) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. El repositorio no documenta la longitud máxima del prompt ni el número máximo de fotogramas |
| Tipos de cuantización | Pesos publicados en safetensors (precisión original no desglosada en la información disponible); existen variantes fp8 de la comunidad en Civitai |
| Idiomas soportados | Inglés (en) y chino (zh); es el primer modelo de vídeo que genera texto legible en ambos idiomas dentro del fotograma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, integración Diffusers (`pipeline_tag: image-to-video`) |
| Resolución de salida | 720P (la variante de este repositorio); la familia incluye una variante 480P |
| Tamaño del repositorio | 82,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La familia Wan2.1 se construye sobre un transformer de difusión (DiT) para vídeo, acompañado de un VAE específico, **Wan-VAE**, que codifica y decodifica vídeo 1080P de cualquier longitud conservando la información temporal; según la model card, este VAE es la base tanto para la generación de vídeo como de imagen. El pipeline image-to-video combina la imagen de entrada con un prompt textual que puede expandirse automáticamente antes de la difusión (el repositorio describe dos modos de ejecución, con y sin *prompt extension*). La generación de texto visual en chino e inglés es una capacidad diferencial declarada por el autor, lo que implica que el codificador de texto y el entrenamiento cubren esos dos idiomas de forma nativa.

En cuanto a los datos de entrenamiento, la información disponible no especifica el número de tokens, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo de difusión en los mismos términos que en un LLM). El autor sí menciona "miles de rondas de evaluaciones humanas" para respaldar su rendimiento frente a alternativas abiertas y cerradas, pero no publica la metodología ni los resultados numéricos. La model card anuncia un artículo técnico como "coming soon", por lo que la descripción detallada del entrenamiento no está disponible.

## Capacidades

- Generación de vídeo a partir de una imagen (image-to-video) a 720P, con coherencia temporal entre fotogramas.
- Generación de vídeo desde texto (text-to-video) en el resto de la familia Wan2.1 (T2V-14B y T2V-1.3B), no en este checkpoint concreto.
- Generación de texto visual dentro del vídeo, en inglés y chino, con tipografía legible.
- Expansión automática de prompt (*prompt extension*) para enriquecer la descripción antes de la difusión.
- Inferencia multi-GPU documentada para los modelos de 14B y 1,3B.
- Soporte de resolución 480P y 720P dentro de la familia; este checkpoint está especializado en 720P.
- Edición de vídeo, text-to-image y vídeo-a-audio son capacidades declaradas de la suite Wan2.1, no de este repositorio en particular.
- No dispone de tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.

## Casos de uso

- **Animación de fotografía de producto para e-commerce**: a partir de una imagen fija de catálogo y un prompt que describa el movimiento (rotación suave, cámara en órbita), se genera un clip 720P que sustituye a la fotografía estática en la ficha de producto, con coherencia de iluminación y sin necesidad de rodaje.
- **Previsualización de storyboards en publicidad**: convertir los fotogramas clave dibujados o renderizados de un guion en animáticas de 720P para validar ritmo y encuadre con el cliente antes de producir. La resolución 720P es suficiente para revisión en pantalla y el coste es muy inferior al de un previz 3D.
- **Prototipado de VFX en postproducción**: animar un *matte painting* o un plato fijo para comprobar cómo se integra con el metraje real antes de encargar la simulación definitiva, usando la imagen como condición para mantener el encuadre exacto.
- **Recursos para redes sociales a partir de archivo fotográfico**: animar imágenes históricas o de stock para generar clips verticales u horizontales con movimiento de cámara sutil, un flujo habitual en cuentas de contenido que reutilizan material fotográfico.
- **Material didáctico animado**: animar diagramas, ilustraciones técnicas o esquemas médicos para explicar procesos paso a paso, manteniendo el esquema original como condición de entrada para que no se deforme.
- **Generación de datos sintéticos de vídeo**: producir secuencias etiquetadas a partir de imágenes semilla para aumentar datasets de entrenamiento de modelos de percepción (detección, seguimiento, estimación de flujo óptico), con la ventaja de la licencia Apache 2.0 sobre los datos generados.
- **Contenido bilingüe con rótulos integrados**: generar clips con texto en inglés o chino dentro de la imagen, útil para campañas en mercados asiáticos o para material promocional que requiere cartelería legible sin postproducción.
- **Animación de ilustraciones y arte conceptual**: dar movimiento a ilustraciones de un artista o a concept art de un videojuego para presentaciones de pitch, manteniendo el estilo de la imagen de origen.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que el modelo supera a alternativas abiertas y propietarias "tras miles de rondas de evaluaciones humanas", y los resultados de búsqueda repiten la misma afirmación cualitativa (SOTA), pero no se acompaña de tablas con métricas, prompts de evaluación ni comparativas cuantitativas. El artículo técnico está anunciado como pendiente de publicación.

El único dato cuantitativo de rendimiento presente en la documentación se refiere a otro miembro de la familia: el T2V-1.3B genera un vídeo de 5 segundos a 480P en unos 4 minutos en una RTX 4090 sin técnicas de optimización, con un requisito de 8,19 GB de VRAM. No hay cifras equivalentes para el I2V-14B-720P.

| Benchmark | Resultado | Notas |
|---|---|---|
| Evaluación humana (cualitativa) | SOTA declarado por el autor | Sin metodología ni número de evaluadores publicados |
| Métricas automáticas (FVD, CLIP, VBench, etc.) | No disponible | No publicadas en la información proporcionada |
| Throughput / latencia del I2V-14B-720P | No disponible | Solo se documenta el dato del T2V-1.3B (5 s a 480P en ~4 min, RTX 4090) |

## Requisitos de hardware

- **VRAM estimada para inferencia**: no hay cifra oficial para este checkpoint. Como referencia orientativa a partir del recuento de parámetros: en bf16/fp16 los pesos del backbone de 14B ocupan aproximadamente 28 GB, y el conjunto del repositorio ronda los 33 GB en media precisión; a ello hay que sumar activaciones, que en difusión de vídeo a 720P con decenas de fotogramas son considerables. Las cifras reales dependen del número de fotogramas y de la estrategia de *offloading*.
- **GPU recomendadas**: la model card documenta inferencia multi-GPU para los modelos de 14B, lo que sugiere que una sola GPU de 24 GB no es suficiente en precisión original sin optimizaciones. Configuraciones razonables: A100 80 GB, H100 80 GB, o varias GPU de 40-48 GB (A100 40 GB, L40S) con paralelismo. No hay tabla oficial de requisitos por GPU en la información proporcionada.
- **GPU de consumo**: este checkpoint de 14B a 720P no cabe en una RTX 4090 de 24 GB en precisión original. La familia sí tiene una opción de consumo: el T2V-1.3B funciona con 8,19 GB de VRAM, compatible con "casi cualquier GPU de consumo". Para el 14B en consumer sería necesario recurrir a cuantizaciones de la comunidad (fp8 y otras) y a *offloading* a RAM, con la penalización de velocidad correspondiente.
- **Opciones de despliegue**: Diffusers (el repositorio está etiquetado como `library_name: diffusers`), el repositorio oficial `Wan-Video/Wan2.1` con scripts de inferencia y demo Gradio, y la versión `Wan-AI/Wan2.1-I2V-14B-720P-Diffusers`. La model card lista la integración en ComfyUI como tarea pendiente en el momento de su redacción. Existen variantes optimizadas de la comunidad en Civitai (fp8, "Lightspeed" con 4 pasos y CFG 1) que reducen el tiempo de generación.
- **Latencia y throughput**: no disponibles para este modelo. Como orden de magnitud del coste, el modelo pequeño de la familia tarda unos 4 minutos en un clip de 5 s a 480P en una RTX 4090; un 14B a 720P requiere bastante más cómputo y, en la práctica, varias GPU.

## Comparativa con modelos similares

| Modelo | Tarea | Resolución | Parámetros | VRAM mínima documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (Wan2.1 I2V-14B-720P, resubida) | Image-to-video | 720P | 16,39 B (safetensors) | No disponible | Apache 2.0 | Hugging Face, Diffusers |
| Wan2.1-I2V-14B-720P (original, Wan-AI) | Image-to-video | 720P | 14B (backbone) | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-I2V-14B-480P | Image-to-video | 480P | 14B (backbone) | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-T2V-14B | Text-to-video | 480P y 720P | 14B (backbone) | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1-T2V-1.3B | Text-to-video | 480P (720P inestable) | 1,3B | 8,19 GB | Apache 2.0 | Hugging Face, ModelScope |

La información disponible no incluye datos de rendimiento de alternativas externas a la familia (HunyuanVideo, CogVideoX, LTX-Video, Mochi u otras), por lo que no se puede establecer una comparación cuantitativa con ellas. La única comparación cualitativa es la afirmación del autor de superar a los modelos abiertos y comerciales existentes, sin métricas publicadas.

## Limitaciones y advertencias

- **Procedencia del repositorio**: se trata de una resubida de terceros (`emdashthreee`) con 0 descargas y 0 likes, creada el 2026-10-24 según los metadatos. Para producción conviene descargar los pesos desde `Wan-AI/Wan2.1-I2V-14B-720P` y verificar los hashes, no desde este espejo.
- **Licencia**: Apache 2.0 permite uso comercial y modificación con obligación de conservar el aviso de licencia y el archivo NOTICE si existe. Al ser una resubida, debe comprobarse que el espejo conserva los términos originales.
- **Sesgos**: no hay documentación sobre sesgos demográficos, culturales o de representación en los datos de entrenamiento. Los modelos de vídeo generativo suelen reproducir estereotipos presentes en el corpus visual; no se ha publicado ninguna evaluación al respecto.
- **Alucinación visual**: como todo modelo generativo de vídeo, puede producir deformaciones anatómicas, artefactos en manos y rostros, inconsistencias de identidad entre fotogramas y movimientos físicamente imposibles. La condición de imagen de entrada reduce la deriva de contenido, pero no la elimina.
- **Idioma**: solo inglés y chino. Los prompts en castellano no están cubiertos de forma nativa y requerirían traducción previa; el texto generado dentro del vídeo también se limita a esos dos idiomas.
- **Longitud y resolución**: no se documenta el número máximo de fotogramas ni la duración máxima del clip. El checkpoint está especializado en 720P; no hay confirmación de que genere 480P con calidad equivalente a la variante específica.
- **Coste computacional**: no cabe en GPU de consumo en precisión original. El despliegue realista implica multi-GPU o cuantización agresiva con pérdida de calidad no cuantificada.
- **Falta de benchmarks**: sin métricas públicas, la afirmación de SOTA no es verificable de forma independiente. Cualquier decisión de adopción debería basarse en una evaluación propia con el dominio objetivo.
- **Mantenimiento**: la integración en Diffusers y ComfyUI figuraba como pendiente en la model card original; la API puede cambiar.

## Enlaces

- Repositorio analizado: https://huggingface.co/emdashthreee/pix-vid-WN-2.1-i2v-14b-720p
- Modelo original: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Versión Diffusers oficial: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P-Diffusers
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Repositorio de código: https://github.com/Wan-Video/Wan2.1
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Blog del proyecto: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
- Variante fp8 en Civitai: https://civitai.com/models/1329096
- Variante "Lightspeed" (4 pasos, CFG 1) en Civitai: https://civitai.com/models/1802623/dasiwa-wan-21-lightspeed
- Ficha en TensorHub Art: https://tensorhub.art/models/834785434652446982
- Artículo técnico: anunciado como "coming soon", sin URL disponible
