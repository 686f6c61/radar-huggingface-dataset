# mradermacher/ExoMind-GGUF

## Resumen

ExoMind es un modelo de lenguaje multimodal orientado al razonamiento científico y a la investigación, desarrollado originalmente por AI4SGI y distribuido en formato GGUF por mradermacher. El modelo base, AI4SGI/ExoMind, está construido sobre la arquitectura Qwen3.5 (según las etiquetas del autor) y cuenta con aproximadamente 35.500 millones de parámetros, lo que lo sitúa en la categoría de modelos de tamaño medio-grande aptos para despliegue en hardware de gama alta pero no necesariamente de centro de datos.

La relevancia de esta ficha radica en que la versión GGUF permite ejecutar el modelo con llama.cpp y herramientas compatibles en estaciones de trabajo con GPU consumer de gran capacidad de VRAM, algo que el formato original en safetensors no facilita. El modelo declara capacidades de razonamiento científico, uso de herramientas (tool-use), comportamiento agéntico y comprensión vision-lenguaje, lo que lo convierte en candidato para pipelines de investigación automatizada y asistentes técnicos.

Esta ficha documenta la variante cuantizada publicada por mradermacher; los detalles de entrenamiento, composición del dataset y resultados de benchmarks del modelo original no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (según etiquetas del autor); multimodal vision-lenguaje |
| Parametros totales | 35.505.251.456 (~35,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (esta variante); safetensors (modelo base) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura Qwen3.5, un transformer decoder-only, con capacidades multimodales de visión y lenguaje (etiquetas `multimodal`, `vision-language`, `qwen3.5`). El repositorio incluye un proyector multimodal (`mmproj`) que acompaña los pesos principales para habilitar la entrada de imágenes en llama.cpp. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

El autor declara etiquetas relacionadas con razonamiento científico (`scientific-reasoning`, `scientific-research`), uso de herramientas (`tool-use`) y comportamiento agéntico (`agentic`), lo que sugiere que el modelo fue ajustado para tareas de investigación y ejecución multi-paso. Sin embargo, no se especifican innovaciones técnicas concretas como decodificación especulativa, atención lineal o mecanismos híbridos SSM. Esta variante concreta es una cuantización estática (no imatrix) del modelo original; el autor publica además cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/ExoMind-i1-GGUF`.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento científico y tareas de investigación (según etiquetas del autor).
- Comprensión vision-lenguaje: procesamiento de imágenes junto con texto mediante el proyector multimodal incluido.
- Uso de herramientas y function calling (etiqueta `tool-use`).
- Comportamiento agéntico y razonamiento multi-paso (etiqueta `agentic`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se dispone de información sobre modo de pensamiento explícito, audio u otras modalidades.

## Casos de uso

- Asistente de investigación científica: el modelo puede resumir artículos, extraer hipótesis y generar borradores de metodología en inglés o chino, aprovechando su orientación declarada a `scientific-reasoning`.
- Análisis de figuras y tablas de papers: gracias al proyector multimodal, puede interpretar gráficos incluidos en documentos científicos y describirlos o extraer conclusiones en texto.
- Agente de automatización de laboratorio o pipeline de datos: con soporte de tool-use, puede invocar APIs, ejecutar scripts y encadenar pasos para tareas de investigación reproducibles.
- Generación de código para análisis científico: útil para escribir scripts de procesamiento de datos, visualización o simulación, integrándose en notebooks y entornos de desarrollo.
- Asistencia técnica multilingüe en inglés y chino: atención a desarrolladores en ambos idiomas con contexto conversacional.
- Despliegue local en estaciones de trabajo: al estar en GGUF, permite ejecución offline en hardware consumer de alta gama para prototipos y pruebas de concepto sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~13,3 GB; Q3_K_S ~15,6 GB; IQ4_XS ~19,5 GB; Q4_K_M ~21,8 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. Añadir ~0,7-1,0 GB para el proyector multimodal si se usa visión.
- GPU recomendadas: para Q4_K_M o superiores, GPU con 24 GB de VRAM (RTX 3090, RTX 4090) son suficientes para Q4_K_M con contexto moderado; Q6_K y Q8_0 requieren 32-48 GB (A100 40 GB, RTX A6000, o descarga parcial a RAM).
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; Q5 y superiores pueden requerir offloading parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de VRAM suficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ExoMind (esta ficha) | ~35,5 mil millones | no disponible | apache-2.0 | GGUF, safetensors | Multimodal, orientado a ciencia y agentes |
| Qwen3 (familia base) | varía (no disponible para esta versión) | no disponible | apache-2.0 (según familia) | safetensors, GGUF | Modelo base sobre el que se apoya la arquitectura declarada |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer comparaciones cuantitativas fiables con modelos de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos; en dominios científicos el riesgo es especialmente crítico y requiere verificación humana.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre el dataset de entrenamiento.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base AI4SGI/ExoMind por si difieren.
- Esta variante es una cuantización de terceros (mradermacher); la calidad puede diferir del modelo original, especialmente en Q2_K y Q3.
- El proyector multimodal debe descargarse por separado para usar visión.
- No hay resultados de benchmarks publicados que permitan validar las capacidades declaradas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ExoMind-GGUF
- Modelo base: https://huggingface.co/AI4SGI/ExoMind
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ExoMind-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#ExoMind-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
