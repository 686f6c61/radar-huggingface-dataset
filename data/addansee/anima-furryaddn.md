# addansee/Anima-FurryAddn

## Resumen

Anima-FurryAddn es un fine-tuning del modelo Anima, desarrollado por CircleStone Labs, especializado en la generación de imágenes de temática furry (antropomórfica). El autor, addansee, lo crea con el objetivo de superar las limitaciones de los fine-tunes y merges existentes de Anima, que según su criterio están demasiado sesgados hacia anime y humanos, o presentan sobreajuste. El modelo se entrena sobre imágenes y etiquetas de e621, una plataforma de arte furry, y toma como base la versión Anima Aesthetic 1.1 del 13 de julio de 2026. La versión actual (v0.1, prototipo del 20 de julio de 2026) se entrenó con 220 imágenes, y el autor anuncia una nueva versión llamada Anima-2.9B-FurryAddn, aunque no se detallan sus especificaciones.

La información técnica disponible es muy limitada: no se especifican la arquitectura, el número de parámetros, la longitud de contexto ni los idiomas soportados. Por el contexto (mención a Illustrious XL y entrenamiento con imágenes), se infiere que se trata de un modelo de difusión para generación de imágenes, pero no hay confirmación explícita. El repositorio tiene un tamaño de 4.2 GB, lo que sugiere pesos de un modelo de tamaño medio, pero sin datos concretos no es posible confirmar nada más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (posible modelo de difusion, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (tamano del repo: 4.2 GB) |

## Arquitectura y entrenamiento

No se proporcionan datos oficiales sobre la arquitectura del modelo. Según la model card, el autor ha realizado un fine-tuning sobre el modelo Anima Aesthetic 1.1 de CircleStone Labs, entrenando con 220 imágenes y etiquetas de e621 en la versión v0.1. No se indica el número total de tokens de entrenamiento, el tipo de dataset completo, ni si se emplearon técnicas como RLHF o DPO. El autor menciona que el objetivo es reducir el sesgo hacia anime y humanos y evitar el sobreajuste, pero no detalla innovaciones técnicas concretas.

## Capacidades

- Generación de imágenes de temática furry (antropomórfica) a partir de etiquetas (tags) similares a las de e621.
- Fine-tuning específico para mejorar la calidad y fidelidad de personajes furry frente a otros estilos.
- Capacidad de generar imágenes basadas en prompts textuales (se infiere por el uso de tags, aunque no se documenta explícitamente).
- No se mencionan capacidades de texto, tool calling, agentes, visión multimodal, audio ni razonamiento.

## Casos de uso

- Creación de ilustraciones furry para proyectos personales o comerciales: el modelo puede generar personajes antropomórficos a partir de descripciones textuales, útil para artistas y diseñadores.
- Generación de contenido para comunidades furry: permite producir arte variado con estilos y atributos específicos mediante etiquetas, adecuado para foros, redes sociales o juegos.
- Prototipado rápido de conceptos de personajes: los diseñadores pueden iterar sobre ideas visuales sin necesidad de dibujar manualmente cada variación.
- Entrenamiento y experimentación con fine-tuning de modelos de difusión: sirve como ejemplo de adaptación de un modelo base a un dominio concreto (furry) con un conjunto de datos reducido.
- Generación de fondos o escenarios para ilustraciones: aunque el foco es furry, el modelo puede producir entornos y elementos relacionados con ese estilo.
- Investigación sobre sesgos en modelos generativos: permite estudiar cómo el fine-tuning con datos específicos (e621) altera la distribución de estilos frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, GPUs recomendadas o rendimiento.
- Dado el tamaño del repositorio (4.2 GB), se estima que el modelo podría ejecutarse en GPUs de consumo con al menos 8-12 GB de VRAM, pero esta cifra es especulativa y no debe tomarse como referencia.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona que los fine-tunes existentes de Anima están sesgados hacia anime y humanos, pero no se citan nombres concretos ni se ofrecen comparativas cuantitativas.

## Limitaciones y advertencias

- El autor indica que los fine-tunes y merges previos de Anima presentan sesgo hacia anime y humanos, y que algunos están sobreajustados. Este modelo busca corregir eso, pero no se garantiza que lo logre por completo.
- La licencia es "other", sin especificar términos. Puede haber restricciones para uso comercial o modificación; se recomienda revisar los términos del modelo base y del propio autor.
- No se documentan sesgos conocidos, riesgos de alucinación (en el caso de ser un modelo generativo de imágenes, podrían aparecer artefactos visuales) ni limitaciones de contexto o idioma.
- El entrenamiento se realizó con solo 220 imágenes en la versión v0.1, lo que puede provocar un ajuste insuficiente o sobreajuste en ciertos estilos.
- No hay información sobre el rendimiento en producción ni sobre la calidad de los resultados en comparación con otros modelos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/addansee/Anima-FurryAddn
- Modelo base (mencionado): circlestone-labs/Anima (enlace no proporcionado en la informacion)
