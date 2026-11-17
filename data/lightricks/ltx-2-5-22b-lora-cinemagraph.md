# Lightricks/LTX-2.5-22b-LoRA-Cinemagraph

## Resumen

LTX-2.5-22b-LoRA-Cinemagraph es un adaptador LoRA para el modelo de generación de vídeo a partir de imagen (image-to-video, i2v) LTX-2.5 de Lightricks. Su función específica es producir el efecto cinematográfico conocido como *cinemagraph*: a partir de una imagen fija, el modelo anima selectivamente una región del encuadre (por ejemplo, el movimiento del pelo, el humo de una taza o el agua de una fuente) mientras mantiene el resto de la escena estático. El resultado es un bucle de vídeo corto con movimiento localizado y realista, un recurso muy demandado en motion design y publicidad.

El adaptador se distribuye como un único archivo de difusión (formato `diffusion-single-file`) de aproximadamente 0,2 GB, lo que lo hace muy ligero frente a los pesos completos del modelo base, que ronda los 22.000 millones de parámetros. Se aplica sobre LTX-2.5, el modelo de vídeo de la familia LTX-2.x de Lightricks, y hereda su licencia comunitaria `ltx-2.x-community-license`.

Es relevante ahora porque el acceso está restringido (gated) y requiere aceptar las condiciones en Hugging Face, y porque demuestra el patrón actual de la familia LTX: un modelo base grande más una constelación de LoRAs especializados (cinemagraph, slow motion control, IC-LoRA) que permiten ajustar el comportamiento del generador sin reentrenar los pesos completos. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada; los apartados correspondientes lo indican explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo de difusión LTX-2.5) |
| Parámetros totales | no disponible para el LoRA (modelo base LTX-2.5: ~22.000 millones según el nombre del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | `ltx-2.x-community-license` (acceso restringido, requiere aceptación) |
| Formato de pesos | `diffusion-single-file` (archivo único de difusión) |
| Tamaño del repositorio | ~0,2 GB |
| Modelo base | Lightricks/LTX-2.5 |
| Tarea | image-to-video (i2v), cinemagraph, movimiento selectivo |
| Librería | diffusion-single-file |
| Fecha de creación | 2026-09-10 |
| Última actualización | 2026-10-22 |
| Descargas / likes | 6.747 / 51 |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del adaptador ni del modelo base en la documentación disponible. Por el nombre del repositorio y la librería declarada (`diffusion-single-file`), se trata de un LoRA de bajo rango empaquetado en un único archivo que se carga junto con los pesos del modelo de difusión LTX-2.5. El modelo base pertenece a la familia LTX-2.x de Lightricks, orientada a generación de vídeo, y el adaptador está etiquetado como `base_model:adapter:Lightricks/LTX-2.5`, lo que confirma que se aplica como adaptador sobre ese checkpoint.

Tampoco hay datos públicos sobre el volumen de tokens o clips de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La especialización declarada es el *cinemagraph*: movimiento selectivo y localizado sobre una imagen de entrada, con el resto del encuadre congelado. No se dispone de información sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video).
- Efecto cinemagraph: animación selectiva de regiones concretas del encuadre mientras el resto permanece estático.
- Control de movimiento localizado, orientado a bucles cortos y motion design.
- Trabajo en inglés (único idioma declarado en las etiquetas).
- Integración con el ecosistema de difusión de Lightricks mediante la librería `diffusion-single-file`.
- Compatibilidad declarada con el modelo base LTX-2.5 y con la familia de LoRAs LTX-2.5 (cinemagraph, slow motion control, IC-LoRA).
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no aplica a un modelo de difusión de vídeo.

## Casos de uso

- Publicidad de producto: animar el vapor de una bebida o el brillo de un objeto sobre una foto fija de catálogo, manteniendo el producto y el fondo perfectamente estables para evitar artefactos en el material de marca.
- Motion design para redes sociales: generar bucles cortos de cinemagraph a partir de fotografías de paisajes o retratos, con movimiento sutil en el agua, las nubes o el pelo, listos para publicar como clips de pocos segundos.
- Fondos animados para webs y presentaciones: producir vídeos de fondo con movimiento localizado (por ejemplo, una llama o una cortina) que no distraigan del contenido superpuesto.
- Creación de contenido para e-commerce: animar ligeramente una prenda o un accesorio sobre una imagen de estudio para aumentar la percepción de realismo sin rodaje adicional.
- Postproducción y VFX de bajo coste: aportar movimiento ambiental a *stills* de un plano en una secuencia, como humo, polvo o agua, sin necesidad de simulación física.
- Prototipado creativo en estudios de diseño: iterar rápidamente sobre una imagen fija para explorar variantes de movimiento antes de comprometer un rodaje o una animación manual.
- Contenido editorial y de moda: dar vida a fotografía estática con movimiento sutil en tejidos o cabello, un formato habitual en campañas digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa ~0,2 GB, pero requiere cargar el modelo base LTX-2.5 (~22.000 millones de parámetros) para la inferencia; el requisito real de VRAM lo determina el modelo base, no el LoRA.
- VRAM estimada para el modelo base: no disponible en la información proporcionada. Con 22.000 millones de parámetros, la inferencia en precisión completa excede con holgura las GPU de consumo; se necesitarían GPUs de datacenter (A100, H100 o similares) o cuantización agresiva del base.
- GPU recomendadas: no disponibles de forma oficial; por tamaño del base, cabría esperar A100/H100 de 80 GB para precisión alta y GPUs de 24 GB solo con cuantización y optimizaciones, sin datos confirmados.
- ¿Cabe en GPU de consumo? No confirmado; el LoRA por sí solo sí, el modelo base completo probablemente no sin cuantización.
- Opciones de despliegue: la librería declarada es `diffusion-single-file`; no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI (no aplican a difusión de vídeo en la mayoría de los casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-22b-LoRA-Cinemagraph | LoRA i2v (cinemagraph) sobre LTX-2.5 | ~22.000 M (base) | no disponible | `ltx-2.x-community-license` | Gated en Hugging Face |
| LTX-2.5-22b-LoRA-Slow-Motion-Control | LoRA i2v (control de cámara lenta) sobre LTX-2.5 | ~22.000 M (base) | no disponible | `ltx-2.x-community-license` | Hugging Face (Lightricks) |
| LTX-2.5-22b-IC-LoRA | LoRA de control sobre LTX-2.5 | ~22.000 M (base) | no disponible | `ltx-2.x-community-license` | Hugging Face (Lightricks) |
| LTX-2.5 (base) | Modelo de difusión de vídeo | ~22.000 M | no disponible | `ltx-2.x-community-license` | Hugging Face (Lightricks) |

No se dispone de datos de rendimiento comparado con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia `ltx-2.x-community-license`: conviene revisar sus términos antes de cualquier uso comercial; no es una licencia de código abierto estándar y puede imponer restricciones de uso, atribución o redistribución.
- Solo inglés declarado en las etiquetas del modelo; no hay evidencia de soporte multilingüe.
- Es un adaptador, no un modelo autónomo: sin el modelo base LTX-2.5 no funciona, y el coste computacional real recae en el base.
- Riesgo de artefactos en la región animada y de "sangrado" de movimiento hacia zonas que deberían permanecer estáticas, algo intrínseco a los cinemagraphs generados.
- No hay información publicada sobre sesgos, tasas de alucinación visual ni evaluación cualitativa sistemática.
- No se documentan requisitos de hardware, latencias ni límites de resolución o duración de los clips; verificar en la model card antes de producción.
- Al ser un modelo de difusión de vídeo, no ofrece tool calling, agentes ni razonamiento; no debe evaluarse con métricas de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph
- Organización Lightricks en Hugging Face: https://huggingface.co/Lightricks
- Web de Lightricks: https://www.lightricks.com/
- Sobre Lightricks: https://www.lightricks.com/about
- GitHub de Lightricks: https://github.com/Lightricks
- Wikipedia (Lightricks): https://en.wikipedia.org/wiki/Lightricks
