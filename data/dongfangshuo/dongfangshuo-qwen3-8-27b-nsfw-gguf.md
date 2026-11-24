# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-GGUF es la versión cuantizada en formato GGUF de un modelo de lenguaje de 27.320.697.856 parámetros (27,3 mil millones) derivado de la familia Qwen3.8. Lo desarrolla el usuario dongfangshuo y parte de una cadena de ajustes que comienza en Qwen/Qwen3.8-27B, pasa por la variante abliterated de huihui-ai (que elimina los mecanismos de rechazo del modelo original) y culmina en un fine-tuning orientado a la creación de ficción adulta explícita (R-18). El repositorio distribuye pesos cuantizados Q4_K_M junto con un proyector multimodal (`mmproj`) que habilita entrada de imagen y vídeo, además de un `Modelfile` para su ejecución directa con Ollama.

El modelo resuelve un nicho muy concreto: generación de narrativa adulta sin las restricciones de seguridad habituales, con especial énfasis en la obediencia a instrucciones explícitas y en la continuidad de tramas largas. La versión publicada en este repositorio es la v1.0 "clásica/equilibrada"; el autor remite a una v2.0 separada para escritura de novela larga. La licencia declarada es Apache-2.0, heredada del modelo base, aunque el uso está restringido por el propio autor a adultos (18+) y a fines de ficción.

La relevancia práctica para desarrolladores e investigadores es limitada pero real: sirve como caso de estudio de las cadenas de derivación abliterated y de fine-tuning temático, y como ejemplo de empaquetado GGUF con soporte multimodal vía `mmproj` para despliegue local en Ollama o llama.cpp. No es un modelo de propósito general ni compite en benchmarks estándar de razonamiento o código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8), con proyector multimodal `mmproj` para visión |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (16,8 GB); proyector `mmproj` en f16 (931 MB) |
| Idiomas soportados | zh (chino) según metadatos; la model card está íntegramente en chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) + `mmproj` GGUF f16 + `Modelfile` |

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de Qwen3.8-27B. El linaje de entrenamiento es: Qwen/Qwen3.8-27B → huihui-ai/Huihui-Qwen3.8-27B-abliterated (abliteración, es decir, eliminación de la dirección de rechazo en el espacio de activaciones) → dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW (fine-tuning de estilo R-18) → esta versión GGUF cuantizada. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO; estos datos figuran como no disponibles.

La innovación técnica declarada por el autor se centra en el comportamiento generativo, no en la arquitectura: alta "obediencia al jailbreak" (破限服从度) y uso directo de vocabulario explícito. La v1.0 aquí publicada admite, según el autor, fallos de atención autoatentiva en textos muy largos y bucles de repetición, problemas que la v2.0 afirma corregir. El componente multimodal se implementa mediante un proyector `mmproj` independiente en f16, compatible con llama.cpp y LM Studio, que permite procesar imágenes y vídeo.

## Capacidades

- Generación de texto conversacional y narrativo en chino, con especialización en ficción adulta explícita.
- Entrada multimodal: análisis de imágenes y vídeo mediante el proyector `mmproj` (f16).
- Alta obediencia a instrucciones explícitas, incluyendo contenido que los modelos base rechazarían.
- Continuación de narrativa multi-turno con personajes y escenas, sujeta a las limitaciones de contexto no especificadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es el foco del modelo.
- Capacidades multilingües: metadatos solo declaran chino (`zh`); el rendimiento en otros idiomas no está documentado.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Creación de ficción adulta asistida: el modelo está fine-tuneado específicamente para generar narrativa R-18 con vocabulario explícito y progresión de escenas, lo que lo hace adecuado para autores que trabajan en ese género y necesitan un asistente sin filtros de contenido.
- Investigación sobre alineación y abliteración: permite estudiar empíricamente cómo la eliminación de la dirección de rechazo afecta a la distribución de respuestas y a la calidad del texto en dominios sensibles.
- Evaluación de cadenas de fine-tuning temático: sirve como caso práctico para medir la degradación o especialización que introduce un ajuste de estilo sobre un modelo abliterated.
- Despliegue local con Ollama: el repositorio incluye `Modelfile`, de modo que basta ejecutar `ollama create` y `ollama run` para tener un endpoint conversacional en local sin dependencias de la nube.
- Análisis de imágenes y vídeo con LM Studio o llama.cpp: cargando el `mmproj` f16 junto con el GGUF Q4_K_M se obtiene descripción y discusión de contenido visual, útil para prototipos de captioning o moderación asistida.
- Pruebas de robustez y seguridad de pipelines: al ser un modelo deliberadamente sin restricciones, resulta útil como caso adversario para validar filtros de salida y clasificadores de contenido en sistemas de producción.
- Docencia sobre riesgos de modelos abliterated: ejemplifica de forma tangible los riesgos de sesgo, contenido no apto y alucinación que deben mitigarse antes de cualquier despliegue público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 16,8 GB, por lo que se necesitan aproximadamente 17-19 GB de VRAM para cargar pesos y contexto; sumando el `mmproj` f16 (931 MB), el requisito sube a unos 18-20 GB en modo multimodal.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue holgado; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo en Q4_K_M con margen para contexto.
- ¿Cabe en consumer GPU? Sí, en GPUs de 24 GB (RTX 4090, 3090) en cuantización Q4_K_M; en GPUs de 16 GB requeriría cuantizaciones más agresivas no incluidas en el repositorio o descarga parcial a CPU.
- Opciones de despliegue: Ollama (vía `Modelfile` incluido), llama.cpp y LM Studio (con selección del `mmproj` para visión). Compatible con endpoints según el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-GGUF (este) | 27,3 B | no disponible | Ficción R-18 + visión | Apache-2.0 | GGUF Q4_K_M |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,3 B (derivado) | no disponible | Abliterated, uso general | Apache-2.0 (heredada) | safetensors (base) |
| Qwen/Qwen3.8-27B | 27,3 B (base) | no disponible | Uso general, alineado | Apache-2.0 | safetensors |
| dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF | 27,3 B (derivado) | no disponible | Ficción R-18, novela larga | Apache-2.0 | GGUF |

La comparación con alternativas de la misma categoría (modelos abliterated o fine-tunes NSFW de tamaño similar) no puede completarse con datos de rendimiento porque no se han publicado benchmarks para ninguno de ellos en la información disponible.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está diseñado para generar material sexual explícito y no es apto para menores ni para uso sin supervisión.
- Sesgos: al derivar de un modelo abliterated sin un pipeline de alineación posterior documentado, es previsible que reproduzca sesgos de género, culturales y de representación del corpus original; no se han publicado evaluaciones al respecto.
- Alucinación: no hay datos de benchmarks que permitan cuantificar la tasa de alucinación; en narrativa larga el propio autor reconoce bucles de repetición y fallos de atención en la v1.0.
- Contexto e idioma: la longitud de contexto no está documentada y los metadatos solo declaran chino; el rendimiento en castellano no está verificado.
- Licencia: aunque se declara Apache-2.0, el autor restringe el uso a adultos y a fines de ficción; conviene revisar el archivo `NOTICE` para conocer las modificaciones y verificar la compatibilidad con uso comercial en la jurisdicción correspondiente.
- Producción: no se recomienda su despliegue en aplicaciones de cara al público sin filtros de salida, clasificadores de contenido y revisión legal; la cadena de derivación (abliterated + fine-tuning NSFW) implica ausencia de garantías de seguridad.
- Fecha de creación del repositorio (2026-09-14) y actualización (2026-11-22): verificar que la versión descargada coincide con la v1.0 y no con la v2.0 alojada en otro repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF
- Modelo base (fine-tune NSFW): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW
- Versión v2.0 (novela larga): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF
- Modelo abliterated de origen: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
