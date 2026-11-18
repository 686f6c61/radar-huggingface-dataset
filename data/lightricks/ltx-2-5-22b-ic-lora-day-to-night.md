# Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night

## Resumen

LTX-2.5-22b-IC-LoRA-Day-To-Night es un adaptador LoRA de tipo IC-LoRA (in-context LoRA) desarrollado por Lightricks sobre el modelo base de difusión de vídeo LTX-2.5. Su función específica es la conversión de vídeo de día a noche (day-to-night) y el relighting: toma un clip rodado con iluminación diurna y genera una versión coherente temporalmente con aspecto nocturno, reinterpretando las fuentes de luz de la escena. No es un modelo autónomo, sino un peso adicional que se carga junto con el modelo base de 22 mil millones de parámetros para modificar su comportamiento generativo en la tarea de vídeo-a-vídeo.

El adaptador se publica en formato de archivo único (`diffusion-single-file`), con un tamaño de repositorio de 0,3 GB, lo que refleja que solo contiene los pesos delta del LoRA y no la totalidad del modelo. La tarea se encuadra en el pipeline `video-to-video`, por lo que requiere un vídeo de entrada además de una instrucción o condicionamiento textual en inglés para producir el resultado transformado.

Su relevancia práctica reside en que resuelve un problema de posproducción costoso (el relighting y la conversión día/noche de metraje real) mediante generación condicionada, manteniendo la estructura y el movimiento del clip original. El acceso está restringido en Hugging Face y la licencia es la LTX-2.x Community License, con implicaciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre modelo de difusión de vídeo LTX-2.5 |
| Parametros totales | 22B en el modelo base LTX-2.5; el adaptador LoRA añade un delta de parámetros no especificado (repo de 0,3 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | ltx-2.x-community-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | diffusion-single-file (archivo único de difusión) |

## Arquitectura y entrenamiento

El adaptador se construye como un IC-LoRA sobre LTX-2.5, un modelo de difusión para generación de vídeo de 22B parámetros. La variante IC-LoRA (in-context LoRA) está diseñada para inyectar condicionamiento adicional en el proceso de difusión, en este caso el par entrada-salida necesario para la transformación día/noche: el modelo aprende a reinterpretar la iluminación de la escena preservando geometría, movimiento y contenido del clip original. El resultado se entrega como un único archivo de difusión, compatible con el pipeline `video-to-video` de la librería `diffusion-single-file`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del adaptador más allá de su naturaleza IC-LoRA. Tampoco se documentan detalles sobre el schedule de entrenamiento, la resolución nativa o la longitud de clip soportada. Estos datos figuran como no disponibles en la información proporcionada.

## Capacidades

- Conversión de vídeo de día a noche: transforma la iluminación de un clip diurno en una apariencia nocturna coherente.
- Relighting condicionado: reinterpreta las fuentes de luz de la escena manteniendo la estructura del metraje original.
- Vídeo-a-vídeo con preservación de movimiento: al operar sobre un vídeo de entrada, conserva la dinámica y la composición del clip fuente.
- Coherencia temporal: al estar integrado en un modelo de difusión de vídeo, el adaptador hereda la consistencia entre fotogramas del modelo base.
- Condicionamiento en inglés: las instrucciones o prompts asociados se expresan en inglés.
- Integración con el ecosistema LTX-2.5: funciona junto con el modelo base y con otros adaptadores de la familia (Slow-Motion-Control, Cinemagraph, entre otros publicados por Lightricks).
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento extendido, por tratarse de un modelo generativo de vídeo.

## Casos de uso

- Posproducción cinematográfica: convertir planos rodados de día en escenas nocturnas sin reshoots, manteniendo el movimiento de cámara y la interpretación de los actores gracias a la preservación del clip original.
- Publicidad y contenido de marca: generar variantes día/noche de un mismo spot para campañas segmentadas por franja horaria o por ambientación, a partir de un único rodaje.
- Previsualización y previz en VFX: obtener referencias nocturnas rápidas de planos diurnos antes de decidir si se aborda un relighting real en el pipeline de efectos.
- Contenido para redes sociales: adaptar metraje existente a estéticas nocturnas para series o formatos que requieren continuidad de iluminación entre episodios.
- Archivo y restauración: reinterpretar la iluminación de material histórico o de stock para integrarlo en proyectos con una dirección de fotografía nocturna consistente.
- Videojuegos y cinemáticas: producir variantes de secuencias pregrabadas para ciclos día/noche dentro de un juego o tráiler, reutilizando el metraje base.
- Prototipado creativo: explorar direcciones de fotografía alternativas sobre un mismo clip sin coste de rodaje, comparando resultados antes de comprometer recursos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al operar sobre un modelo base de 22B parámetros en difusión de vídeo, los requisitos son los del modelo LTX-2.5 completo, no los del adaptador (0,3 GB).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base, se espera necesidad de GPU de datacenter (A100, H100) o soluciones de altas prestaciones, sin confirmación oficial.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: pipeline `video-to-video` mediante la librería `diffusion-single-file`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-Day-To-Night | IC-LoRA sobre difusión de vídeo | 22B (base) + delta LoRA | no disponible | ltx-2.x-community-license | Gated en Hugging Face |
| LTX-2.5-22b-LoRA-Slow-Motion-Control | LoRA sobre difusión de vídeo | 22B (base) + delta LoRA | no disponible | no disponible | Hugging Face (Lightricks) |
| LTX-2.5-22b-LoRA-Cinemagraph | LoRA sobre difusión de vídeo | 22B (base) + delta LoRA | no disponible | no disponible | Hugging Face (Lightricks) |
| Modelos de relighting de vídeo de la competencia | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a los adaptadores de la misma familia publicados por Lightricks; no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar las condiciones en Hugging Face antes de la descarga.
- Licencia: la LTX-2.x Community License no es una licencia de código abierto estándar; es imprescindible revisar sus términos para uso comercial, redistribución y productos derivados.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere LTX-2.5 y su pipeline de inferencia.
- Idioma: el condicionamiento textual está limitado al inglés.
- Riesgo de artefactos: como todo modelo generativo de vídeo, puede producir inconsistencias temporales, parpadeos o errores en la reinterpretación de fuentes de luz en escenas complejas.
- Sesgos: no se documentan sesgos específicos, pero el adaptador hereda los del modelo base y de sus datos de entrenamiento (no disponibles).
- Alucinación visual: puede inventar o eliminar fuentes de luz, alterar reflejos o modificar la apariencia de materiales de forma no fiel al clip original.
- Falta de documentación técnica: no se publican detalles de entrenamiento, benchmarks ni requisitos de hardware, lo que dificulta la evaluación previa en producción.
- Fecha de creación y actualización del repositorio (2026) coherente con la información del Hub; conviene verificar la vigencia de la versión antes de integrarla.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Organización Lightricks en Hugging Face: https://huggingface.co/Lightricks
- Sitio web de Lightricks: https://www.lightricks.com/
- Sobre Lightricks: https://www.lightricks.com/about
- GitHub de Lightricks: https://github.com/Lightricks
- Wikipedia (Lightricks): https://en.m.wikipedia.org/wiki/Lightricks
