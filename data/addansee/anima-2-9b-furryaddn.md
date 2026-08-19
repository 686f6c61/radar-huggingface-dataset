# addansee/Anima-2.9B-FurryAddn

## Resumen

El modelo addansee/Anima-2.9B-FurryAddn es un fine-tune del modelo Anima 2.9B, desarrollado por el usuario addansee, con el objetivo específico de especializar la generación de imágenes en contenido furry (antropomórfico). Según la model card, se trata del primer fine-tune de 2.9B enfocado exclusivamente en furry, entrenado sobre 899 imágenes a partir de Anima 2.9B Preview 1 (fechado el 12/08/2026). El autor indica que el efecto no es tan fuerte como en intentos previos, pero que las salidas resultan menos distorsionadas.

El modelo se publica como prototipo v0.1, con licencia "other" y un tamaño de repositorio de 5.8 GB. No se proporcionan detalles sobre la arquitectura interna, el pipeline de generación, los idiomas soportados ni el formato de pesos. Dado que se menciona entrenamiento sobre imágenes, se asume que se trata de un modelo de generación de imágenes, probablemente basado en difusión, pero esta información no está confirmada en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.9B (según nombre del modelo, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible (tamaño del repo: 5.8 GB) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que es un fine-tune del modelo base Gazingstars123/Anima-2.9B, que a su vez parece ser un modelo de generación de imágenes de 2.9B de parámetros. El entrenamiento se realizó sobre 899 imágenes, con el objetivo de forzar la generación de contenido furry en lugar de humanoides no deseados. No se especifican hiperparámetros, técnica de ajuste (LoRA, full fine-tune, etc.) ni detalles del dataset más allá del número de imágenes. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de imágenes con enfoque exclusivo en contenido furry (antropomórfico).
- Reducción de distorsiones en las salidas en comparación con intentos anteriores, según el autor.
- No se han documentado capacidades de texto, razonamiento, código, tool calling, agentes ni multimodalidad adicional.

## Casos de uso

- Ilustración furry personalizada: el modelo puede generar arte furry a partir de descripciones textuales (si el modelo base lo permite), adecuado para comisiones artísticas o proyectos personales.
- Creación de personajes antropomórficos: útil para diseñadores de juegos, cómics o animación que necesiten conceptos rápidos de personajes furry.
- Generación de contenido para comunidades furry: permite producir imágenes para foros, redes sociales o publicaciones temáticas.
- Prototipado de assets para proyectos interactivos: aunque no se confirma soporte para control fino, podría usarse para generar bocetos iniciales.
- Experimentación con fine-tuning específico de dominio: sirve como ejemplo de ajuste de un modelo base con un dataset reducido para una temática concreta.
- Investigación sobre sesgos en generación de imágenes: al estar entrenado en un nicho, puede usarse para estudiar el comportamiento de modelos especializados frente a modelos generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos sobre VRAM, GPU recomendadas, latencia o throughput.
- Dado el tamaño del repositorio (5.8 GB) y la posible naturaleza de difusión, es probable que requiera al menos 8-12 GB de VRAM para inferencia en FP16, pero no hay confirmación.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) ni se especifica si el modelo es compatible con estas herramientas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un prototipo v0.1, entrenado con solo 899 imágenes, lo que puede provocar sobreajuste y baja generalización.
- El modelo está especializado exclusivamente en contenido furry; su uso fuera de este dominio probablemente produzca resultados pobres o no deseados.
- La licencia "other" no especifica términos claros de uso comercial, por lo que se recomienda contactar al autor antes de cualquier aplicación en producción.
- No se documentan sesgos conocidos, pero al ser un fine-tune de un modelo base no verificado, pueden existir sesgos heredados.
- Riesgo de alucinación o generación de imágenes distorsionadas, especialmente con entradas fuera del dominio entrenado.
- No se proporcionan detalles sobre el pipeline de generación (texto a imagen, imagen a imagen, etc.), lo que limita su integración técnica.

## Enlaces

- [HuggingFace: addansee/Anima-2.9B-FurryAddn](https://huggingface.co/addansee/Anima-2.9B-FurryAddn)
- [Modelo base: Gazingstars123/Anima-2.9B](https://huggingface.co/Gazingstars123/Anima-2.9B)
