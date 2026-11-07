# musharna/orchid-clip-v9cw05

## Resumen

orchid-clip-v9cw05 es un codificador de imágenes especializado en la identificación de especies de orquídeas, desarrollado por el usuario musharna y publicado en Hugging Face. Se trata de un fine-tune de BioCLIP 2.5 (ViT-H/14) de Imageomics, entrenado mediante aprendizaje contrastivo sobre un conjunto de 1,12 millones de imágenes que cubren 5.124 especies de orquídeas. El modelo forma parte del Space orchid-genus-id, donde sus puntuaciones se promedian con las de orchid-clip-v8 para producir la predicción final.

El modelo resuelve un problema clásico de clasificación de grano fino en dominios con distribución de cola larga: pocas especies cuentan con cientos de imágenes mientras que muchas tropicales apenas tienen un puñado, y las etiquetas presentan ruido (sinónimos antiguos, nombres de cultivares, confusiones entre especies del mismo género). Frente a un CLIP genérico, orchid-clip-v9cw05 incorpora un ajuste específico sobre ese dominio botánico.

Arquitectónicamente es un transformer de visión ViT-H/14 que produce características de imagen de 1024 dimensiones normalizadas en L2. Su relevancia radica en que demuestra hasta dónde llega la transferencia de grano fino desde un modelo fundacional de biología (BioCLIP 2.5) y documenta de forma honesta los límites de esa transferencia, con métricas de precisión por especie y por género sobre un conjunto de test reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-H/14 (transformer de visión, configuracion `ViT-H-14` de open_clip) |
| Parametros totales | no disponible (checkpoint de 3,9 GB en precisión completa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; sin ventana de texto evaluada) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en formato PyTorch `.bin`) |
| Idiomas soportados | en (etiquetas y prompts en inglés; la torre de texto no ha sido evaluada) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`open_clip_pytorch_model.bin`), diccionario envuelto bajo `state["state_dict"]` |

## Arquitectura y entrenamiento

El modelo es un ViT-H/14, la configuración integrada de open_clip que comparte arquitectura con BioCLIP 2.5. La salida es un vector de 1024 dimensiones normalizado en L2, pensado para compararse por similitud coseno contra centroides de especie (la media de hasta 256 fotos por especie sobre 24.388 especies). El checkpoint se carga con `pretrained=None` y posteriormente se inyecta el state dict, ya que un nombre `hf-hub:` cargaría los pesos base de BioCLIP 2.5 y no los de este fine-tune.

El entrenamiento consistió en un ajuste contrastivo sobre el mismo pool que v8: 1,12 millones de imágenes de 5.124 especies, con sinónimos de WCVP fusionados y un muestreador de especies con peso inverso a la raíz cuadrada, limitado a 2.000 imágenes por especie. Se realizaron dos tandas: 3 épocas sobre 500.000 imágenes muestreadas con lr máximo de 1e-5, seguidas de 3 épocas más sobre 800.000 imágenes con lr máximo de 5e-6, reanudando desde la primera. Los pesos publicados son el promedio parámetro a parámetro de un 50 % del modelo ajustado y un 50 % del modelo base, técnica conocida como WiSE-FT (Wortsman et al., CVPR 2022); el sufijo "w05" del nombre hace referencia a ese 0,5. Las imágenes de entrenamiento provienen de iNaturalist (grado investigación), GBIF, Smithsonian NMNH, Wikimedia, Flickr con licencia CC y OrchidRoots.

## Capacidades

- Extracción de características de imagen: genera embeddings de 1024 dimensiones normalizados en L2, adecuados para búsqueda por similitud y clasificación por centroides.
- Clasificación de grano fino de especies de orquídeas: entrenado sobre 5.124 especies con estrategia de muestreo para cola larga.
- Clasificación zero-shot a nivel de género y especie mediante comparación coseno contra centroides de referencia.
- Regla de abstención: el Space asociado etiqueta una especie solo cuando la mejor coincidencia supera a la segunda por un umbral calibrado para el 90 % de precisión.
- Capacidad de ensemble: sus puntuaciones se promedian con las de orchid-clip-v8, mejorando los resultados individuales de ambos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo está orientado a etiquetas en inglés.
- Capacidades especiales (thinking mode, visión, audio): únicamente visión; sin modo de razonamiento ni audio.

## Casos de uso

- Identificación asistida de orquídeas en aplicaciones de campo: dado un vector de imagen, el modelo compara por coseno contra centroides de especie y devuelve el género y la especie más probables; es adecuado porque su entrenamiento cubre 5.124 especies con muestreo compensado para la cola larga.
- Moderación y etiquetado de colecciones fotográficas: en plataformas de observación ciudadana (estilo iNaturalist) puede preetiquetar observaciones de orquídeas antes de la validación humana, reduciendo el trabajo manual en el nivel de género, donde su top-1 alcanza 0,935.
- Búsqueda visual en herbarios digitalizados: indexando los embeddings de 1024 dimensiones en un motor vectorial, se pueden recuperar imágenes similares de una colección y agrupar especímenes por similitud morfológica.
- Detección de posibles nuevas observaciones o híbridos: al devolver la especie más cercana incluso ante un híbrido (que no es objetivo del modelo), sirve como señal de alerta para que un botánico revise manualmente los casos ambiguos.
- Control de calidad de datasets botánicos: comparando cada imagen con el centroide de su etiqueta declarada se pueden detectar etiquetas ruidosas (sinónimos antiguos, cultivares, confusiones intra-género) y priorizar su revisión.
- Investigación sobre transferencia de grano fino: el modelo y su documentación de evaluación (top-1 por especie, por género y precisión a 90 %) permiten estudiar dónde la transferencia desde un modelo fundacional de biología se degrada y por qué.
- Demo interactiva en el Space orchid-genus-id: el modelo se integra junto a orchid-clip-v8 para ofrecer una identificación combinada, útil como referencia pública del rendimiento del sistema.

## Benchmarks y rendimiento

Resultados del método del Space: ranking de una foto por coseno contra centroides por especie (media de hasta 256 fotos por especie, 24.388 especies). Conjunto de test de 8.837 fotos de 3.369 especies, reservado del entrenamiento y de los centroides.

| Modelo | Especie top-1 | Género top-1 | Especies nombradas a 90 % de precisión |
|---|---|---|---|
| orchid-clip-v8 | 0,715 | 0,918 | 59 % |
| orchid-clip-v9cw05 | 0,723 | 0,935 | 62 % |
| v8 + v9cw05, promediados | 0,742 | 0,937 | 66 % |

Para 243 fotos de especies sin centroide, el top-1 de género es 0,56 (v8), 0,63 (v9cw05) y 0,63 (promediado). El propio autor advierte que el modelo se eligió entre cuatro candidatos sobre estas mismas fotos, por lo que sus cifras son algo optimistas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 3,9 GB en precisión completa; en FP16 se sitúa en torno a 2 GB, aunque no se han publicado mediciones oficiales de VRAM.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una GPU con al menos 8 GB de VRAM debería acomodar el modelo en FP16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; el autor solo indica que ViT-H/14 es grande y que la inferencia en CPU es lenta.
- Opciones de despliegue: open_clip (`open_clip_torch`) con PyTorch; el repositorio incluye `embed_example.py` para cargar y embeber una foto. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son para modelos de lenguaje, no aplicables aquí).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| orchid-clip-v9cw05 | ViT-H/14 | no disponible (3,9 GB) | no aplica | Especie top-1 0,723; género top-1 0,935 | MIT | Hugging Face |
| orchid-clip-v8 | ViT-H/14 | no disponible | no aplica | Especie top-1 0,715; género top-1 0,918 | MIT (según repositorio) | Hugging Face |
| BioCLIP 2.5 (imageomics/bioclip-2.5-vith14) | ViT-H/14 | no disponible | no aplica | No evaluado en este test de orquídeas | MIT | Hugging Face |

La comparación con v8 y con el modelo base es la más informativa: el fine-tune aporta una mejora modesta en especie (0,715 a 0,723) y algo mayor en género (0,918 a 0,935), mientras que el ensemble de ambos es el que ofrece el mejor resultado (0,742 en especie). No se dispone de datos de otros CLIP botánicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha evaluado la torre de imagen; la torre de texto no ha sido probada para uso zero-shot.
- La mayoría de los errores confunden especies dentro de un mismo género: conviene interpretar el top-1 como "este género, probablemente esta especie".
- Los híbridos no son un objetivo del entrenamiento; ante un híbrido el modelo devuelve la especie más cercana, lo que puede inducir a error.
- ViT-H/14 es grande (checkpoint de 3,9 GB) y la inferencia en CPU es lenta.
- Las cifras de benchmark son algo optimistas porque el modelo se seleccionó entre cuatro candidatos sobre el mismo conjunto de test.
- Riesgo de sesgo por composición del dataset: la distribución de imágenes está dominada por géneros cultivados y especies con más fotos, pese al muestreo compensado.
- Riesgo de alucinación inherente a la clasificación: el modelo siempre devuelve una especie candidata, por lo que la regla de abstención del Space (umbral para 90 % de precisión) es necesaria en producción.
- Licencia MIT, permisiva para uso comercial, pero derivada de BioCLIP 2.5 (MIT) y con imágenes de entrenamiento de fuentes públicas con licencias variadas (CC, iNaturalist, GBIF, Smithsonian, Wikimedia, Flickr, OrchidRoots); conviene revisar las condiciones de esas fuentes para usos comerciales.
- Idioma: el modelo está orientado a etiquetas en inglés; no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musharna/orchid-clip-v9cw05
- Modelo base: https://huggingface.co/imageomics/bioclip-2.5-vith14
- Modelo complementario orchid-clip-v8: https://huggingface.co/musharna/orchid-clip-v8
- Space de demostración: https://huggingface.co/spaces/musharna/orchid-genus-id
- Repositorio GitHub: https://github.com/musharna/orchid-clip
- Página del proyecto: https://musharna.github.io/projects/OrchidCLIP/
- Paper de WiSE-FT (Wortsman et al., CVPR 2022): no disponible en la información proporcionada.
