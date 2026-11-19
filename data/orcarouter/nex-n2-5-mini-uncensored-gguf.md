# orcarouter/Nex-N2.5-mini-Uncensored-GGUF

## Resumen

Nex-N2.5-mini-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo Nex-N2.5-mini-Uncensored, publicado por el usuario orcarouter en Hugging Face. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales, derivado de la familia Qwen3.5 (tag `qwen3_5_moe`) y sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo y censura del modelo original. La ficha está orientada a inferencia local con llama.cpp y despliegues compatibles con endpoints, e incluye soporte de visión mediante proyector multimodal (mmproj).

El modelo está pensado para tareas de red-teaming, investigación en seguridad de IA y aplicaciones que requieren respuestas sin filtros de contenido, además de conservar capacidades agénticas: function calling, computer-use, razonamiento multi-paso y procesamiento de imagen y texto. La cuantización emplea imatrix, lo que suele mejorar la calidad de los pesos comprimidos respecto a cuantizaciones estándar.

La relevancia actual del modelo radica en su combinación de licencia Apache-2.0, tamaño MoE moderado y disponibilidad en GGUF, lo que permite ejecutarlo en hardware de consumo con suficiente memoria, algo poco habitual en modelos de esta escala con capacidades multimodales y agénticas. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base Qwen3.5 (`qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (variantes concretas no disponibles) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 114,9 GB, incluye mmproj para visión) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer con mezcla de expertos (MoE), heredada de la familia Qwen3.5, según indican los tags `qwen3_5_moe` y `moe`. El checkpoint del que deriva, orcarouter/Nex-N2.5-mini-Uncensored, ha sido sometido a abliteration, una técnica de edición de pesos que suprime la dirección de activación asociada al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante contenido que el original filtraría. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada.

La versión publicada aquí es una cuantización GGUF generada con imatrix, pensada para llama.cpp y runtimes compatibles. El repositorio incluye un proyector multimodal (mmproj) que habilita la entrada de imágenes junto con texto, lo que convierte al modelo en un sistema image-text-to-text. No se han detallado innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito (tag `reasoning`) y resolución de problemas multi-paso.
- Function calling y tool calling, con compatibilidad declarada con endpoints.
- Capacidades agénticas: computer-use y flujos de agente autónomo.
- Procesamiento de visión: entrada de imagen y texto (image-text-to-text) mediante mmproj.
- Generación de código y matemáticas (implícito en la base Qwen3.5; sin datos concretos de benchmarks).
- Modo sin censura: respuestas sin rechazos ante contenido sensible, orientado a red-teaming.
- Soporte de inferencia en llama.cpp y runtimes GGUF compatibles.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo, al estar abliterated, permite generar respuestas que un modelo alineado rechazaría, lo que lo hace útil para construir conjuntos de pruebas adversarios y medir la robustez de clasificadores y filtros de contenido.
- Investigación en alineación y mecánica interna: comparar las activaciones del modelo censurado y del abliterated ayuda a estudiar dónde y cómo se representan las negativas en el espacio de activaciones.
- Asistentes de escritorio con computer-use: la capacidad agéntica y el soporte de function calling permiten integrarlo en entornos que controlan aplicaciones mediante herramientas, ejecutando tareas multi-paso sobre la interfaz.
- Análisis de documentos con imágenes: gracias al proyector mmproj, puede procesar capturas, diagramas o formularios junto con instrucciones textuales, útil en pipelines de extracción de información.
- Despliegue local en estaciones de trabajo: al ser GGUF con cuantización imatrix, se puede servir con llama.cpp en máquinas con GPU de consumo, sin depender de APIs externas, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generación de código en pipelines internos: el modelo puede integrarse como servicio compatible con endpoints para autocompletado y revisión de código en herramientas de desarrollo, siempre que el contenido generado se revise antes de producción.
- Prototipado de agentes conversacionales bilingües (inglés/chino): útil para demos y pruebas de concepto en mercados donde esos dos idiomas son prioritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 34,66 B parámetros totales, una cuantización Q4 requiere en torno a 20-22 GB de VRAM solo para pesos, más overhead de contexto y del proyector de visión; Q8 se aproxima a 37-40 GB; FP16 supera los 69 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 6000 Ada para cuantizaciones altas y contexto largo; RTX 4090 (24 GB) puede alojar cuantizaciones Q4 con contexto moderado.
- GPU de consumo: sí es viable en RTX 4090, RTX 3090 (24 GB) y, con cuantizaciones más agresivas o descarga parcial a RAM, en GPUs de 16 GB; en ese caso la latencia aumenta por el offloading.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con endpoints y runtimes que acepten GGUF con mmproj para visión.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización, del número de expertos activos y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nex-N2.5-mini-Uncensored-GGUF | 34,66 B (MoE) | no disponible | Apache-2.0 | GGUF + mmproj | Abliterated, visión, agéntico, acceso gated |
| Modelo base Qwen3.5 MoE (referencia de familia) | no disponible | no disponible | no disponible | safetensors/GGUF | Alineado y con rechazos; misma arquitectura subyacente |
| Alternativas MoE de ~30-35 B abliterated | no disponible | no disponible | variable | GGUF | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad: el modelo puede producir contenido dañino, ilegal o explícitamente sensible; no debe exponerse sin filtros a usuarios finales.
- Riesgo elevado de alucinación, especialmente en dominios especializados y en tareas agénticas donde el modelo puede ejecutar acciones no deseadas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- La licencia Apache-2.0 permite uso comercial, pero el uso de un modelo abliterated puede incumplir políticas de plataformas o normativas sectoriales; la responsabilidad recae en el desplegador.
- No se dispone de información sobre la longitud de contexto real, los parámetros activos por token ni el rendimiento medido, lo que dificulta el dimensionamiento de producción.
- El tamaño del repositorio (114,9 GB) implica requisitos de almacenamiento y ancho de banda considerables para la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
