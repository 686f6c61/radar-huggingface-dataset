# Lightricks/LTX-2.5-22b-LoRA-Cinemagraph

## Resumen

LTX-2.5-22b-LoRA-Cinemagraph es un adaptador LoRA desarrollado por Lightricks para su modelo base de generación de vídeo LTX-2.5, de 22 mil millones de parámetros. El LoRA está especializado en la creación de *cinemagraphs*: vídeos en los que una parte de la imagen permanece estática mientras otra se anima de forma selectiva (por ejemplo, el humo de una taza de café que se mueve mientras el resto de la escena queda congelado). Se distribuye como un único archivo de difusión compatible con el pipeline `image-to-video`.

El modelo resuelve un problema muy concreto dentro de la generación de vídeo: el control fino del movimiento. En lugar de animar toda la escena, el LoRA aprende a aislar regiones de movimiento sobre una imagen de entrada, lo que lo hace útil para motion design, contenido publicitario y piezas de *loop* visual. Al ser un adaptador sobre LTX-2.5, hereda la arquitectura y el contexto del modelo base, pero no puede ejecutarse de forma autónoma.

Es relevante ahora porque la familia LTX-2.5 ha consolidado el vídeo generativo open weight de alta resolución, y este tipo de LoRAs especializados demuestran el ecosistema de ajuste fino alrededor del modelo base. La licencia es la LTX-2.x Community License (no plenamente abierta) y el acceso está restringido: requiere aceptar condiciones en Hugging Face antes de la descarga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión LTX-2.5 |
| Parámetros totales | 22 mil millones (modelo base); el adaptador LoRA no declara recuento propio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | inglés (en) |
| Licencia | LTX-2.x Community License (acceso restringido/gated) |
| Formato de pesos | diffusion-single-file (archivo único de difusión) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre LTX-2.5, un modelo de difusión para generación de vídeo condicionada por imagen (image-to-video). El adaptador introduce matrices de bajo rango en las capas del modelo base para especializarlo en la tarea de cinemagraph: movimiento selectivo y localizado sobre una imagen estática de partida. El repositorio ocupa 0,2 GB, lo que confirma que se trata de un adaptador ligero y no de pesos completos.

No se dispone de información detallada sobre el dataset de entrenamiento del LoRA (número de pares imagen-vídeo, composición, uso de RLHF o DPO) ni sobre innovaciones técnicas específicas del adaptador. El modelo base LTX-2.5 emplea difusión, pero la información proporcionada no detalla su variante concreta (transformer de difusión, atención lineal, decodificación especulativa, etc.), por lo que estos datos se marcan como no disponibles.

## Capacidades

- Generación de vídeo image-to-video con movimiento selectivo (cinemagraph).
- Aislamiento de regiones animadas frente a zonas estáticas de la escena.
- Producción de piezas de motion design y bucles visuales (*loops*).
- Control de movimiento localizado sobre una imagen de entrada.
- Compatible con el pipeline `image-to-video` de la librería `diffusion-single-file`.
- Requiere el modelo base Lightricks/LTX-2.5 para funcionar.
- Soporte de tool calling, agentes, visión o audio: no disponible / no aplicable (es un modelo generativo de vídeo).
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Publicidad y contenido de marca: generar piezas donde el producto permanece fijo y solo se anima un elemento (humo, vapor, cabello, líquido), ideal para banners y anuncios sociales con movimiento sutil.
- Motion design para webs y pantallas: crear *loops* de cinemagraph que se integren como fondo animado en landing pages sin recargar la escena completa.
- Postproducción fotográfica: animar un detalle de una fotografía fija (una vela, una planta, el agua) para dar vida a material estático en vídeo promocional.
- Contenido para redes sociales: producir clips cortos con movimiento selectivo que destacan sobre el feed sin necesidad de rodaje.
- Prototipado creativo: explorar variantes de animación sobre un *still* de referencia antes de invertir en producción real.
- Arte digital e instalaciones: generar piezas de vídeo en bucle con regiones animadas controladas para exposiciones o pantallas ambientales.
- Pruebas de concepto en pipelines de vídeo: integrar el LoRA en flujos de generación image-to-video para evaluar el control de movimiento antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base LTX-2.5 de 22 mil millones de parámetros para inferencia.
- VRAM estimada: no disponible en la información proporcionada (depende de la cuantización del modelo base y de la resolución/duración del vídeo).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo base (22B) sugiere requisitos elevados, pero no se confirman cifras.
- Opciones de despliegue: pipeline `image-to-video` con la librería `diffusion-single-file`; otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-22b-LoRA-Cinemagraph | LoRA sobre difusión de vídeo | 22B (base) | no disponible | LTX-2.x Community License | Gated en Hugging Face |
| Lightricks/LTX-2.5 (base) | Difusión de vídeo image-to-video | 22B | no disponible | LTX-2.x Community License | Gated en Hugging Face |
| Otros LoRAs de la familia LTX-2.5 | Adaptadores especializados | no disponible | no disponible | LTX-2.x Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Requiere el modelo base LTX-2.5; no es un modelo autónomo.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar.
- Licencia LTX-2.x Community License: no es una licencia de código abierto plena; revisar las restricciones de uso comercial antes de producción.
- Idiomas: el modelo está etiquetado únicamente en inglés.
- Especialización estrecha: está entrenado para cinemagraphs y movimiento selectivo; su uso fuera de ese dominio puede degradar la calidad frente al modelo base.
- Riesgo de artefactos en las fronteras entre zonas animadas y estáticas, habitual en este tipo de adaptadores (no confirmado en la información disponible).
- No se dispone de información sobre sesgos, alucinaciones visuales o límites de duración/resolución del vídeo generado.
- Para producción, validar la estabilidad temporal del movimiento y la coherencia entre fotogramas con el modelo base concreto y la cuantización elegida.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Página de Lightricks en Hugging Face: https://huggingface.co/Lightricks
- Licencia LTX-2.x Community License: no disponible como enlace directo en la información proporcionada.
