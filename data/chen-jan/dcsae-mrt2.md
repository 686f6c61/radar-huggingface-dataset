# chen-jan/dcsae-mrt2

## Resumen

`chen-jan/dcsae-mrt2` es un conjunto de tres autoencoders dispersos dual-contrastivos (DC-SAE) entrenados sobre las activaciones de la capa 15 de `google/magenta-realtime-2`, un modelo abierto de generación musical en tiempo real. No es un modelo generativo de texto ni de audio: es una herramienta de interpretabilidad que descompone las activaciones internas del modelo base en dos códigos dispersos de 32.768 características cada uno, con 50 activas por posición: `z_i` para identificar la obra interpretada y `z_j` para caracterizar cómo se interpreta.

El repositorio lo publica chen-jan (Jan Chen, según su perfil de Hugging Face) e incluye checkpoints para tres corpus musicales: clásica, jazz y versiones pop de SHS100K. Cada checkpoint corresponde al paso 7.500 y se distribuye en `safetensors` en float32 junto con un `model.json` que documenta tamaño, corpus, paso y el sha256 del checkpoint original del paper.

Su relevancia es metodológica: separa de forma explícita la obra musical de su interpretación mediante un objetivo dual-contrastivo, y publica los pesos exactos que respaldan los números de *Dual-Contrastive Sparse Autoencoders Reveal Features of Musical Interpretation* (NeurIPS 2026). El repositorio completo ocupa 4,8 GB; no se especifica una longitud de contexto textual porque el modelo opera por posición sobre vectores de activación de 3.072 dimensiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso dual-contrastivo (DC-SAE) sobre activaciones de la capa 15 de Magenta RealTime 2 |
| Parámetros totales | no disponible; cada checkpoint contiene dos códigos dispersos de 32.768 características y el repositorio completo ocupa 4,8 GB en float32 |
| Parámetros activos | no aplica (no es MoE); 50 características activas por posición en cada código disperso |
| Longitud de contexto | no aplica / no disponible; no es un modelo de lenguaje y opera sobre activaciones de 3.072 dimensiones por posición |
| Tipos de cuantización | no disponible; los pesos publicados están en float32 y no se incluyen variantes cuantizadas |
| Idiomas soportados | no disponible; no es un modelo de texto y la model card no declara idiomas |
| Licencia | CC-BY 4.0, con los términos adicionales de Magenta RealTime 2 |
| Formato de pesos | `safetensors` en float32 y `model.json` por carpeta |

## Arquitectura y entrenamiento

Cada checkpoint es un DC-SAE que toma las activaciones de la capa 15 de Magenta RealTime 2 —3.072 números por posición— y las proyecta en dos códigos dispersos de 32.768 características cada uno, con 50 características activas por posición. La separación es explícita: `z_i` codifica qué obra se está reproduciendo y `z_j` codifica cómo se está interpretando. Se publican tres variantes por corpus: `classical/`, con 100 obras y 10 grabaciones de YouTube por obra; `jazz/`, con 100 estándares y 10 grabaciones por obra; y `pop/`, con 100 versiones pop de SHS100K y 10 grabaciones por obra. Todos los checkpoints corresponden al paso 7.500.

La innovación técnica es el objetivo dual-contrastivo, que fuerza a los dos códigos dispersos a capturar factores distintos de la señal musical: identidad de la obra frente a estilo de interpretación. No se especifican en la información disponible la función de pérdida exacta, el optimizador, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; en cualquier caso, RLHF y DPO no son propios del entrenamiento de un SAE. La model card indica que estos son los pesos exactos detrás de los números del paper, y que las etiquetas de características (`labels.jsonl`) se añadirán más adelante.

## Capacidades

- Descomposición de activaciones: transforma las activaciones de 3.072 dimensiones de la capa 15 de Magenta RealTime 2 en dos códigos dispersos de 32.768 características.
- Separación obra/interpretación: `z_i` identifica la obra y `z_j` caracteriza la interpretación, con 50 características activas por posición en cada código.
- Análisis por género: incluye checkpoints específicos para clásica, jazz y versiones pop de SHS100K.
- Extracción de características dispersas: permite estudiar qué direcciones de activación se encienden para distintas grabaciones y posiciones.
- Reproducibilidad: los `model.json` incluyen tamaño, corpus, paso y sha256 del checkpoint original del paper.
- Carga programática: la model card documenta la carga mediante el paquete `dcsae` y `huggingface_hub`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de texto.
- No genera audio, texto, código ni imágenes; no incorpora visión, audio de entrada directa ni modo de pensamiento.

## Casos de uso

- Análisis de interpretabilidad mecanicista de Magenta RealTime 2: cargar un checkpoint y extraer `z_i` y `z_j` para estudiar qué características internas se asocian a una obra y cuáles a su interpretación. Es adecuado porque opera directamente sobre la capa 15 del modelo base y publica los pesos exactos del paper.
- Separación de obra e interpretación en grabaciones de versiones: usar `z_i` para agrupar distintas grabaciones de la misma obra y `z_j` para analizar diferencias de tempo, dinámica o estilo. El diseño dual-contrastivo está pensado precisamente para separar ambos factores.
- Estudio comparado de variación interpretativa: dentro de las 10 grabaciones disponibles por obra, medir cómo cambia `z_j` entre intérpretes y comparar los patrones entre los corpus de clásica, jazz y pop.
- Reproducción y extensión del paper: partir de los checkpoints del paso 7.500 y de los sha256 documentados para reproducir los resultados publicados y probar análisis alternativos sobre las mismas activaciones.
- Comparación de representaciones entre géneros: analizar distribuciones de características activas en los checkpoints `classical/`, `jazz/` y `pop/` para estudiar qué factores compartidos y específicos aparecen en cada corpus.
- Asistencia al etiquetado de características: una vez disponibles los `labels.jsonl`, usar los códigos dispersos para proponer etiquetas candidatas y validarlas manualmente; los códigos de 32.768 características y 50 activas por posición facilitan la inspección.
- Docencia y divulgación sobre SAEs en audio: emplear un repositorio de 4,8 GB con tres checkpoints y carga mediante `dcsae` para explicar cómo se interpretan representaciones internas de un modelo musical.
- Desarrollo de herramientas de visualización para análisis musical: mapear activaciones dispersas a posiciones y grabaciones para construir visores de características, siempre con validación adicional porque las etiquetas aún no están publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card afirma que los pesos son los exactos detrás de los números del paper, pero no incluye una tabla de resultados ni métricas reproducibles en el repositorio. No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de interpretabilidad musical en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 4,8 GB en float32, pero no se desglosa el tamaño por checkpoint ni se publica una VRAM mínima.
- GPU recomendadas: no disponible; no se indican modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU consumer: no confirmada. El tamaño agregado del repositorio no permite asegurar que una variante concreta quepa en una GPU consumer de 8 GB, 12 GB o 16 GB.
- Opciones de despliegue: carga mediante el paquete `dcsae` y `huggingface_hub`, según la model card. No aplican vLLM, llama.cpp, Ollama o TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible.
- Almacenamiento: 4,8 GB para el repositorio completo, con tres carpetas de checkpoints en float32.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros DC-SAE comparables para música. La siguiente tabla incluye este repositorio y el modelo base como referencia, no como alternativa equivalente.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `chen-jan/dcsae-mrt2` | DC-SAE de interpretabilidad sobre audio musical | no disponible | no aplica | no disponible | CC-BY 4.0 + términos de MRT2 | Hugging Face |
| `google/magenta-realtime-2` | Modelo generativo de música en tiempo real | no disponible | no disponible | no disponible | ver model card de MRT2 | Hugging Face |
| Otros DC-SAE para música | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, audio, código ni imágenes, y no puede usarse como sustituto de Magenta RealTime 2.
- Solo analiza la capa 15 del modelo base; no se publican SAEs para otras capas ni una cobertura completa de la red.
- Los corpus están limitados a tres dominios y a 100 obras con 10 grabaciones por obra; se desconoce su generalización a otros géneros, culturas o grabaciones.
- Las etiquetas de características (`labels.jsonl`) todavía no están disponibles, y el paquete `dcsae` se publicará con la versión camera-ready; sin ellas, la interpretación de características requiere trabajo adicional.
- No se documentan sesgos específicos, pero al derivar de grabaciones de YouTube y SHS100K existe riesgo de sesgo de selección, popularidad y estilo no cuantificado.
- El riesgo de alucinación no aplica porque el modelo no genera lenguaje; el riesgo principal es sobreinterpretar o atribuir mal el significado de una característica.
- La licencia CC-BY 4.0 exige atribución y debe combinarse con los términos adicionales de Magenta RealTime 2; el uso comercial requiere revisar la model card del modelo base.
- No se han publicado benchmarks en la información disponible, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se declara un pipeline de Hugging Face.
- No hay ventana de contexto textual; el análisis es por posición sobre activaciones de 3.072 dimensiones, y no se especifica cómo agregar posiciones para obtener conclusiones a nivel de obra o interpretación.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/chen-jan/dcsae-mrt2)
- [Paper en OpenReview](https://openreview.net/forum?id=L95qutWlv4)
- [Magenta RealTime 2](https://magenta.withgoogle.com/magenta-realtime-2)
- [Magenta RealTime 2: apps y plugins](https://magenta.withgoogle.com/mrt2)
- [Modelo base en Hugging Face](https://huggingface.co/google/magenta-realtime-2/tree/main/models/mrt2_base)
- [Repositorio GitHub de Magenta RealTime](https://github.com/magenta/magenta-realtime)
- [Perfil del autor en Hugging Face](https://huggingface.co/chen-jan)
