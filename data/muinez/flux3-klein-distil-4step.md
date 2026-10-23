# Muinez/flux3-klein-distil-4step

## Resumen

`Muinez/flux3-klein-distil-4step` es un adaptador LoRA de destilación para el modelo de generación de imágenes **FLUX.3 Image Klein base** de Black Forest Labs. Su objetivo es reducir el coste de inferencia: permite generar imágenes en **2–4 pasos** con **CFG = 1** (sin prompt negativo), en lugar de los regímenes de muestreo habituales de un modelo base de difusión sin destilar. El adaptador se distribuye como un único fichero `safetensors` en formato ComfyUI y se carga con el nodo `LoraLoaderModelOnly`.

El autor lo etiqueta explícitamente como **experimental**: se trata de un primer intento de destilación con un entrenamiento breve, por lo que cabe esperar imperfecciones. Se entrenó a 1024×1024 (aproximadamente 1 MP) y, según la model card, funciona también a otras resoluciones y relaciones de aspecto. El repositorio ocupa 0,2 GB y no incluye los pesos del modelo base, que deben descargarse por separado.

La relevancia práctica es doble: por un lado, un LoRA de 4 pasos reduce de forma drástica el número de evaluaciones de la red por imagen, lo que abarata el despliegue en producción; por otro, al ser un derivado de FLUX.3, hereda la **FLUX Kommunity License**, con las implicaciones de uso que ello conlleva. No es un modelo oficial de Black Forest Labs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre un modelo de difusión texto-a-imagen; arquitectura interna del modelo base no detallada en la información disponible |
| Parámetros totales | No disponible (el repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador; no se publica el recuento de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (generación de imágenes). Resolución de entrenamiento: 1024×1024 (~1 MP); admite otras resoluciones y relaciones de aspecto |
| Tipos de cuantización | No disponible (se distribuye en un único `safetensors`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (el prompt textual depende del codificador de texto del modelo base, no documentado en esta ficha) |
| Licencia | FLUX Kommunity License (`flux-kommunity-license`), con ficheros `LICENSE.md` y `NOTICE.md` en el repositorio |
| Formato de pesos | `safetensors` en formato ComfyUI (`flux3-klein-distil-4step.safetensors`) |
| Modelo base | `black-forest-labs/flux-3-image-klein-base` |
| Pasos de muestreo recomendados | 4 (2–3 también funcionan) |
| CFG | 1 (sin prompt negativo) |
| Shift | 3; en ComfyUI, `ModelSamplingFlux` con `max_shift = base_shift = 1.0986` (ln 3) |
| Sampler / scheduler | `euler` / `simple` |
| Fuerza del LoRA | 1.0 |
| Descargas / likes | 0 descargas / 12 likes |
| Fecha de creación / actualización | 2026-10-15 / 2026-10-15 |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un **LoRA**: un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos originales. La función que se aprende aquí es una **destilación de pasos** (*step distillation*): el adaptador se entrena para que la trayectoria de muestreo del modelo base colapse en 2–4 evaluaciones, operando en régimen de *guidance* desactivado (CFG = 1). Esto implica que el adaptador asume el papel que normalmente desempeñaría el *classifier-free guidance* y la integración temporal de muchos pasos.

El autor no publica detalles sobre el dataset de destilación, el número de tokens o imágenes vistas, el número de pasos de entrenamiento, el rango del LoRA ni la función de pérdida empleada. La model card indica únicamente que el entrenamiento fue **breve** y que se trata de un primer intento, por lo que el adaptador debe considerarse una prueba de concepto. El cómputo fue donado por [lovescape.com](https://lovescape.com). El ajuste de `shift` a ln 3 (`max_shift = base_shift = 1.0986`) es parte del diseño del muestreo: en ese régimen la definición de la programación de ruido deja de depender de la resolución, lo que permite reutilizar la misma configuración a distintas resoluciones y relaciones de aspecto.

## Capacidades

- **Generación de imágenes texto-a-imagen en 2–4 pasos** con CFG = 1, sin necesidad de prompt negativo.
- **Generación en ComfyUI**: se carga como LoRA de modelo con `LoraLoaderModelOnly` y requiere el nodo `ModelSamplingFlux` configurado con `max_shift = base_shift = 1.0986`.
- **Compatibilidad con múltiples resoluciones y relaciones de aspecto**, aunque el entrenamiento se realizó a ~1 MP (1024×1024).
- **Reducción del coste de inferencia**: al operar en 4 pasos sin CFG, el número de evaluaciones de la red por imagen es muy inferior al de un flujo de muestreo convencional.
- **Composición con otros LoRA**: al ser un adaptador, en principio puede apilarse con otros LoRA sobre el mismo modelo base, aunque no se documenta compatibilidad ni recetas de apilado.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, agentes, audio, vídeo ni *thinking mode*; no aplica a este tipo de modelo.
- No se documentan capacidades multilingües ni idiomas soportados.

## Casos de uso

- **Prototipado rápido de conceptos visuales**: con 4 pasos y CFG = 1, un estudio puede iterar decenas de variantes de una idea en el tiempo que antes dedicaba a unas pocas, usando ComfyUI como interfaz de exploración.
- **Generación por lotes en pipelines automatizados**: al eliminar el CFG y reducir los pasos, el coste por imagen baja y el adaptador encaja en flujos que generan cientos de imágenes para catálogos, *thumbnails* o material de marketing donde la latencia importa.
- **Demostraciones interactivas de baja latencia**: aplicaciones donde el usuario escribe un prompt y espera la imagen en pocos segundos, siempre que se acepte la merma de calidad frente al modelo base sin destilar.
- **Investigación sobre destilación de difusión**: el LoRA sirve como caso de estudio reproducible (con sus ajustes de `shift`, sampler y scheduler documentados) para comparar técnicas de *step distillation* frente al modelo base.
- **Pruebas de integración en ComfyUI**: útil para validar *workflows* de LoRA + `ModelSamplingFlux` antes de invertir en un adaptador destilado más maduro.
- **Generación de imágenes de referencia a ~1 MP**: material de apoyo para *moodboards*, borradores de ilustración o composición, donde el resultado se refina después con el modelo base a más pasos.
- **Evaluación comparativa base vs. destilado**: permite medir empíricamente la pérdida de calidad y el ahorro de cómputo en un *setup* propio, tal y como discuten usuarios en foros como r/StableDiffusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas cuantitativas (FID, CLIP score, preferencia humana) ni comparaciones numéricas frente al modelo base.

Como referencia cualitativa, en el hilo de r/StableDiffusion «Flux 3 Klein base vs distilled, tested locally» se comenta que el modelo base ofrece mejor aspecto y que la versión destilada presenta un aspecto más «de IA», con comportamientos extraños en algunas pruebas, posiblemente por necesitar más pasos. Se trata de una observación anecdótica de la comunidad, no de una evaluación sistemática, y no se especifica si corresponde exactamente a este adaptador.

## Requisitos de hardware

- **VRAM**: no disponible para el modelo base. El adaptador añade solo ~0,2 GB sobre el modelo base, por lo que el requisito dominante es el de FLUX.3 Image Klein base, que no se detalla en la información proporcionada.
- **GPU recomendadas**: no disponible. La idoneidad de A100, H100, RTX 4090 u otras tarjetas depende del modelo base, cuyos requisitos no se documentan aquí.
- **Consumer GPU**: no se puede confirmar. El factor limitante es el modelo base, no el LoRA; el modo de 4 pasos y CFG = 1 reduce el cómputo por imagen, lo que en la práctica facilita su uso en GPUs modestas si el modelo base ya cabe en ellas.
- **Opciones de despliegue**: ComfyUI (soporte documentado, con `LoraLoaderModelOnly` y `ModelSamplingFlux`). Otros *runtimes* (Diffusers, vLLM, TGI, llama.cpp, Ollama) no están documentados para este adaptador; llama.cpp y Ollama no aplican a un modelo de difusión de imagen.
- **Latencia y throughput**: no disponibles. Cualitativamente, 4 pasos sin CFG implican un número de evaluaciones de red mucho menor que un flujo estándar, pero no se publican tiempos medidos ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Pasos típicos | CFG | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Muinez/flux3-klein-distil-4step` | LoRA de destilación sobre FLUX.3 Klein base | No disponible (repo de 0,2 GB) | 2–4 | 1 (sin negativo) | FLUX Kommunity License | Hugging Face, 0 descargas, 12 likes |
| `black-forest-labs/flux-3-image-klein-base` | Modelo base completo de texto-a-imagen | No disponible en la información | No disponible | No disponible | FLUX Kommunity License | Hugging Face (modelo oficial) |
| `ponpoke/flux2-klein-4b-uncensored-text-encoder` | Modelo de texto-a-imagen de la generación anterior (FLUX.2) | 4B (según la etiqueta del listado) | No disponible | No disponible | No disponible | Hugging Face, ~11,8k descargas, 314 likes (datos del listado) |

No se dispone de datos de rendimiento comparables entre estas opciones. La comparación relevante es frente al propio modelo base: el LoRA sacrifica fidelidad frente al flujo completo a cambio de una reducción del número de pasos y de la eliminación del CFG. Otros LoRA de destilación para FLUX.3 no están documentados en la información proporcionada.

## Limitaciones y advertencias

- **Calidad experimental**: el autor advierte de que es un primer intento con entrenamiento breve y que deben esperarse imperfecciones («rough edges»).
- **Posible degradación estética**: comentarios de la comunidad señalan un aspecto más «de IA» y comportamientos extraños en la versión destilada frente al modelo base, que podría necesitar más pasos para converger.
- **Sin prompt negativo**: al operar con CFG = 1, no se puede usar *negative prompt* ni *guidance* para corregir artefactos.
- **Configuración obligatoria**: requiere `shift = 3` (`max_shift = base_shift = 1.0986`) en `ModelSamplingFlux`; usar otros valores puede degradar el resultado.
- **Resolución de entrenamiento limitada**: ~1 MP (1024²). Aunque se indica que funciona a otras resoluciones y relaciones de aspecto, no se documenta la calidad fuera de ese régimen.
- **Riesgo de sesgo y alucinación visual**: no se documenta ninguna evaluación de sesgos; como todo modelo de difusión, puede producir contenido estereotipado o inexacto respecto al prompt.
- **Restricciones de licencia**: es un derivado de FLUX.3 Image Klein base y se distribuye bajo la FLUX Kommunity License; los derechos de uso los concede Black Forest Labs bajo esos términos. Es imprescindible revisar `LICENSE.md` y `NOTICE.md` antes de cualquier uso comercial. No es un modelo oficial de Black Forest Labs.
- **Madurez y validación**: 0 descargas y 12 likes en el momento de la consulta; sin benchmarks ni validación independiente.
- **Idiomas**: no se documenta qué idiomas maneja el codificador de texto del modelo base.
- **Mantenimiento**: el repositorio se creó y actualizó el mismo día (2026-10-15); no hay historial de revisiones que permita evaluar su evolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muinez/flux3-klein-distil-4step
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Licencia (en el repositorio): https://huggingface.co/Muinez/flux3-klein-distil-4step/blob/main/LICENSE.md
- Aviso legal (en el repositorio): https://huggingface.co/Muinez/flux3-klein-distil-4step/blob/main/NOTICE.md
- Cómputo donado por: https://lovescape.com
- Hilo de discusión «Flux 3 Klein base vs distilled, tested locally»: https://www.reddit.com/r/StableDiffusion/comments/1x6wgyt/flux_3_klein_base_vs_distilled_tested_locally/
- Listado de modelos con etiqueta `distillation` en Hugging Face: https://huggingface.co/models?other=distillation
- Listado de modelos FLUX en Hugging Face: https://huggingface.co/models?search=flux
