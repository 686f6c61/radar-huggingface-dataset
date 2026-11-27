# MicksHF/Qwen-Image-2.1-Anime-Fusal

## Resumen

Qwen Image 2.1 Anime FUSAL es un adaptador LoRA para generación y edición de imágenes orientado a ilustración anime, publicado por el usuario MicksHF sobre el modelo base Qwen/Qwen-Image-2.1 (y su variante destilada Qwen/Qwen-Image-2.1-Turbo) de Alibaba Qwen. El repositorio distribuye en realidad dos familias de LoRA independientes, una para cada checkpoint base, que no son intercambiables entre sí, e incluye el text encoder BF16 con el que se entrenaron los embeddings de prompt y referencia. Resuelve el problema de dotar al modelo base de un estilo anime consistente y controlable mediante disparadores de estilo estructurados, sin necesidad de reentrenar el modelo completo.

El adaptador se distribuye como safetensors para la librería diffusers y también se integra en flujos de ComfyUI. La versión principal recomendada es Exact R80 V3 sobre el modelo Original (no Turbo), que corrige el ruido de textura tipo cartón de V2 y añade cinco frases de disparador de estilo diferenciadas (Flat Cel, Clean Modern Cel, Polished Semi-Impasto, Heavy Painterly/Gouache y Watercolor Wash & Ink Sketch). Existe además una V4 Preview en pruebas centrada en el control mediante imagen de referencia de pose.

El modelo es relevante ahora porque el ecosistema de Qwen-Image ha consolidado un pipeline de image-to-image con soporte multi-referencia, y este LoRA demuestra cómo adaptar estilos artísticos concretos preservando el conocimiento del modelo base. El autor advierte explícitamente de que la variante Turbo, destilada por pasos, pierde calidad y conocimiento de estilo frente a la Original, por lo que recomienda la versión no destilada para fidelidad de estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión Qwen-Image-2.1; incluye text encoder BF16 |
| Parametros totales | no disponible (el LoRA se distribuye en safetensors; el tamaño del repo es de 34,8 GB, que incluye el text encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en BF16; el autor no documenta cuantizaciones GGUF/NF4) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | qwen-research (license_name: qwen-research, license: other) |
| Formato de pesos | safetensors (diffusers); integración con ComfyUI |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 80 (denominación R80 en los nombres de fichero) entrenado sobre el modelo de difusión Qwen-Image-2.1. Según la model card, el entrenamiento cachea los embeddings de prompt y de imagen de referencia usando el text encoder BF16 incluido en el repositorio, lo que explica que este se distribuya junto al adaptador. La V3 introduce una innovación técnica concreta: bloquea los bloques tardíos `img_mlp` del decodificador de píxeles, que son ciegos al texto, y redirige la adaptación de estilo hacia las capas de atención frontales y medias, que sí son conscientes del texto. Con ello elimina la textura no deseada tipo cartón o papel de lija que se filtraba en V2 sobre pieles lisas y superficies cel-shaded.

El modelo se entrena con un formato de prompt estructurado que comienza por `fusal style.` y organiza la descripción en secciones `[TASK: ...]`, `[Subject]`, `[Appearance]`, `[Pose]`, `[Composition]`, `[Environment]`, `[Lighting]` y `[Style]`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, algo esperable en un adaptador de estilo. La familia Turbo (E6 Preview R128) es una variante experimental destilada por pasos que, según el autor, sufre una pérdida significativa de calidad y de conocimiento de estilo.

## Capacidades

- Generación de imagen texto-a-imagen (text-to-image) con estética anime e ilustración.
- Edición imagen-a-imagen (image-to-image) sobre el pipeline de Qwen-Image-2.1.
- Soporte multi-referencia: el pipeline base admite varias imágenes de referencia además del prompt.
- Cinco estilos anime controlables mediante frases de disparador en V3: Flat Cel, Clean Modern Cel, Polished Semi-Impasto, Heavy Painterly/Gouache y Watercolor Wash & Ink Sketch.
- Control de pose mediante imagen de referencia en la V4 Preview (en pruebas).
- Ajuste de fuerza del LoRA en el rango 0,7–1,0 (valor inicial recomendado 0,7).
- Integración con ComfyUI y con la librería diffusers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión descriptiva, audio ni modo thinking, por tratarse de un modelo generativo de imágenes.

## Casos de uso

- Producción de ilustración anime para editorial y webtoon: con 25 pasos y fuerza 0,7 sobre el modelo Original, el LoRA genera escenas con composición controlada mediante las secciones `[Pose]` y `[Composition]`, adecuado para bocetos y arte final de personajes.
- Creación de keyframes y storyboards: el pipeline image-to-image permite partir de un boceto o de una imagen de referencia y aplicar el estilo anime de forma consistente entre planos, manteniendo coherencia visual en una secuencia.
- Diseño de personajes con referencias múltiples: el soporte multi-referencia del modelo base permite combinar rostro, vestuario y pose de imágenes distintas para fijar el diseño de un personaje recurrente.
- Generación de assets para videojuegos indie: los cinco disparadores de estilo de V3 permiten producir variantes cel-shaded, gouache o acuarela de un mismo motivo para menús, retratos de diálogo o ilustraciones de carga.
- Iteración rápida en ComfyUI: al integrarse como LoRA en flujos de ComfyUI, un estudio puede encadenar nodos de upscale, control de pose y postproceso sin salir del grafo, reutilizando el adaptador entre proyectos.
- Prototipado de portadas de novela ligera y manga: la V4 Preview con control de pose permite ajustar la postura del personaje a la maqueta de cubierta antes de pasar a un artista humano para el retoque final.
- Investigación sobre adaptación de estilo en modelos de difusión: el repositorio documenta el efecto de bloquear capas `img_mlp` y redirigir el estilo a capas de atención, un caso de estudio útil para quien investigue transferencia de estilo con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 34,8 GB e incluye el text encoder BF16, por lo que se necesita espacio en disco suficiente para el adaptador y el encoder, además del modelo base Qwen-Image-2.1 descargado aparte.
- VRAM estimada para inferencia: no disponible de forma explícita. Al tratarse de un LoRA sobre un modelo de difusión de gran tamaño con text encoder BF16, se requiere una GPU con VRAM holgada; no se documentan cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del pipeline y del encoder, se espera que requiera GPU de clase profesional (A100, H100) o consumer de gama alta con suficiente VRAM, aunque el autor no lo especifica.
- Compatibilidad con GPU consumer: no confirmada en la información disponible.
- Opciones de despliegue: diffusers (librería declarada) y ComfyUI (etiqueta y flujo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles. El autor recomienda 25 pasos para el modelo Original con LoRA (20 pasos ya dan buenos resultados en composiciones simples y 30–40 para escenas complejas) y fija 8 pasos para Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen Image 2.1 Anime FUSAL (este) | LoRA de estilo anime | Qwen/Qwen-Image-2.1 y Qwen/Qwen-Image-2.1-Turbo | 25 pasos recomendados (Original); 8 pasos (Turbo) | qwen-research | Hugging Face, diffusers, ComfyUI |
| Qwen/Qwen-Image-2.1 | Modelo de difusión base | no aplica | no disponible | no disponible en la información | Hugging Face |
| Qwen/Qwen-Image-2.1-Turbo | Modelo de difusión destilado por pasos | Qwen/Qwen-Image-2.1 | 8 pasos fijos | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de otros LoRA de anime comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El adaptador Original no debe cargarse sobre el modelo Turbo ni el Turbo sobre el Original; tampoco deben apilarse V4 Preview, V3, V2 y Turbo entre sí. Solo un adaptador a la vez sobre su base correspondiente.
- La variante Turbo E6 Preview R128 es experimental y, según el autor, incurre en una pérdida significativa de calidad y de conocimiento de estilo frente a la Original.
- La V4 Preview está en pruebas y puede cambiar; su soporte de pose por imagen de referencia aún no cuenta con ejemplos publicados.
- El modelo está marcado por el autor como "for adults and research use only", lo que restringe su uso a adultos e investigación.
- La licencia qwen-research impone condiciones específicas; debe revisarse el fichero LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación visual y de artefactos: la V2 filtraba textura tipo cartón sobre piel y superficies cel-shaded, corregido en V3; versiones anteriores pueden reproducir ese defecto.
- El formato de prompt estructurado es obligatorio en la práctica: usar solo instrucciones libres tipo chat degrada el resultado según el autor.
- No se documentan sesgos demográficos ni limitaciones idiomáticas; los prompts de ejemplo están en inglés y no se confirma el soporte de otros idiomas.
- El repositorio incluye un text encoder BF16 específico con el que se entrenaron los embeddings; usar otro encoder puede alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal
- Playground en Spaces: https://huggingface.co/spaces/MicksHF/Qwen-Image-2.1-Anime-Fusal-Playground
- Modelo base Original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
