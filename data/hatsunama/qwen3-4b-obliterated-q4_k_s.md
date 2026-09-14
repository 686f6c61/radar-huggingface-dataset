# Hatsunama/Qwen3-4B-OBLITERATED-Q4_K_S

## Resumen

Qwen3-4B-OBLITERATED-Q4_K_S es una cuantización GGUF en formato Q4_K_S del modelo Qwen3-4B-OBLITERATED, una variante "abliterada" —con la dirección de rechazo atenuada o eliminada de los pesos— del Qwen3-4B de Alibaba. El repositorio lo publica el usuario Hatsunama como copia de un único fichero, orientada exclusivamente a inferencia con llama.cpp, y no añade entrenamiento alguno: reempaqueta los pesos abliterados de OBLITERATUS y la cuantización de mradermacher.

El modelo conserva 4.022.468.096 parámetros (unos 4,02 mil millones) en un transformer denso de la familia Qwen3, y el repositorio ocupa 2,4 GB. Su interés práctico es doble: por un lado permite ejecutar un modelo de ~4B en hardware de consumo con muy poca VRAM; por otro, al estar abliterado, elimina buena parte de las negativas de rechazo del modelo original, lo que lo hace útil para investigación en seguridad, red-teaming y generación de contenido sin filtros editoriales.

Es relevante porque cubre un nicho concreto —inferencia local, privada y sin restricciones de contenido— sobre un modelo cuya versión original mantiene licencia Apache-2.0. Se trata, en cualquier caso, de un repositorio sin descargas ni valoraciones publicadas, sin benchmarks propios y sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); el artefacto es una cuantización GGUF, no una arquitectura nueva |
| Parametros totales | 4.022.468.096 (~4,02 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen3-4B declara 32.768 tokens, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | Q4_K_S (este repositorio); otras cuantizaciones disponibles en el repositorio de mradermacher |
| Idiomas soportados | No disponible en los metadatos; heredados de Qwen3-4B (modelo multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero único, para llama.cpp) |
| Modelo base | OBLITERATUS/Qwen3-4B-OBLITERATED (a su vez derivado de Qwen/Qwen3-4B) |
| Tecnica de alineacion inversa | Abliteración (eliminación de la dirección de rechazo); método exacto no documentado |
| Tamaño del repositorio | 2,4 GB |
| Uso previsto | Solo inferencia; no apto para reanudar entrenamiento LoRA (el autor indica usar el repositorio de safetensors) |
| Fecha de creacion (metadato) | 2026-09-14 |

## Arquitectura y entrenamiento

El artefacto es un fichero GGUF de un único conjunto de tensores, generado a partir de los pesos abliterados de OBLITERATUS/Qwen3-4B-OBLITERATED mediante la cuantización Q4_K_S publicada en mradermacher/Qwen3-4B-OBLITERATED-GGUF. No hay entrenamiento nuevo en este repositorio: la model card indica explícitamente que el fichero es "inference-only" y que el entrenamiento LoRA se realizó sobre el repositorio de safetensors, no sobre el GGUF.

La arquitectura subyacente es la de Qwen3-4B: un transformer denso con atención de consultas agrupadas (GQA) y 4.022.468.096 parámetros, según los metadatos de safetensors. La única modificación respecto al original es la abliteración, una técnica de edición de pesos que calcula la dirección del espacio de activaciones asociada a las respuestas de rechazo y la proyecta fuera de los pesos, de modo que el modelo deja de activar ese comportamiento con la misma intensidad. Ni el método exacto de abliteración, ni el conjunto de prompts utilizado para calcular la dirección, ni el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de Qwen3 (no confirmada en este GGUF).
- Razonamiento y matemáticas a nivel de modelo de ~4B, heredados del modelo base.
- Generación de código, con calidad propia de la familia Qwen3 en su tramo de 4B.
- Capacidad multilingüe heredada de Qwen3-4B; el grado real de conservación tras la abliteración no está documentado.
- Ausencia prácticamente total de rechazos ante peticiones sensibles, como consecuencia directa de la abliteración.
- Modo "thinking" de Qwen3: el modelo base lo soporta, pero no se confirma que se conserve intacto tras la abliteración ni en la plantilla del GGUF.
- Tool calling / function calling: no se declara soporte nativo en este repositorio; el autor anuncia un adaptador LoRA específico (Hatsunama/Qwen3-4B-OBLITERATED-toolcall-lora) que todavía no está publicado.
- Agentes y razonamiento multi-paso: no documentado.
- Visión y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo sirve como sujeto de pruebas para estudiar qué comportamientos reaparecen cuando se elimina la dirección de rechazo, y para comparar la eficacia de distintas técnicas de abliteración frente al Qwen3-4B original.
- Generación de ficción y narrativa sin filtros editoriales: su ventana de contexto y su falta de rechazos permiten abordar tramas violentas, sexuales o moralmente ambiguas que un modelo alineado bloquearía.
- Asistente local con privacidad estricta: al ser un GGUF de 2,4 GB ejecutable con llama.cpp sin conexión, se puede desplegar en un portátil o en una estación de trabajo aislada donde ningún dato salga de la máquina.
- Estudio de contenido dañino y moderación: permite generar ejemplos de texto tóxico, engañoso o inseguro para alimentar y evaluar clasificadores de moderación en un entorno controlado.
- Prototipado de agentes y automatizaciones: una vez publicado el LoRA de tool calling anunciado, encajaría como cerebro de bajo coste en pipelines de agentes con llamadas a funciones.
- Generación de código en local para tareas de baja criticidad: autocompletado, generación de scripts y explicación de fragmentos dentro de un IDE, sin depender de APIs externas.
- Extracción y reformateo de información en documentos largos: resúmenes, transformación de formatos y clasificación de texto en lotes, aprovechando el bajo coste por token de un modelo de 4B cuantizado.
- Traducción y procesamiento multilingüe ligero: tareas de traducción o normalización de texto en varios idiomas heredadas del modelo base, con la advertencia de que el rendimiento multilingüe tras la abliteración no está medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco hay evaluaciones del efecto de la abliteración sobre el rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3 GB para alojar los pesos Q4_K_S (2,4 GB de repositorio), más overhead de contexto y caché KV; con contexto largo y batch pequeño, el consumo realista se sitúa entre 4 y 6 GB. Es una estimación a partir del tamaño del fichero, no una medición publicada.
- GPU recomendadas: cualquier GPU con 6-8 GB o más, como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 3090 o superiores. En el extremo alto (A100, H100) el modelo queda enormemente infrautilizado.
- ¿Cabe en GPU de consumo? Sí, con holgura: cabe incluso en tarjetas de 6 GB y en gráficas integradas con memoria compartida, aunque a costa de velocidad.
- Ejecución en CPU: viable con llama.cpp, con velocidades de pocos a decenas de tokens por segundo según núcleos y ancho de banda de memoria. En Apple Silicon (M1/M2/M3 con 8 GB o más) el rendimiento es cómodo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, text-generation-webui y llama-cpp-python. Para vLLM o TGI sería preferible partir del repositorio de safetensors en lugar del GGUF.
- Latencia y throughput: no disponible. No hay cifras publicadas ni para este repositorio ni para la cuantización de origen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Abliterado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hatsunama/Qwen3-4B-OBLITERATED-Q4_K_S | 4,02 mil millones | No disponible (base: 32.768) | GGUF Q4_K_S | Si | Apache-2.0 | Publico, 0 descargas |
| OBLITERATUS/Qwen3-4B-OBLITERATED | 4,02 mil millones | No disponible (base: 32.768) | Safetensors | Si | Apache-2.0 | Publico |
| mradermacher/Qwen3-4B-OBLITERATED-GGUF | 4,02 mil millones | No disponible (base: 32.768) | GGUF (varias cuantizaciones) | Si | Apache-2.0 | Publico; es la fuente de este fichero |
| Qwen/Qwen3-4B | 4,02 mil millones | 32.768 (131.072 con YaRN) | Safetensors | No | Apache-2.0 | Publico y ampliamente soportado |
| Llama-3.2-3B-Instruct | 3,2 mil millones | 128.000 | Safetensors, GGUF | No | Llama 3.2 Community License | Publico |
| Gemma-3-4B-it | ~4 mil millones | 128.000 | Safetensors, GGUF | No | Gemma Terms of Use | Publico |

La diferencia principal frente a las alternativas no está en el rendimiento, sino en el propósito: este repositorio y sus antecesores abliterados compiten por el nicho de modelos sin filtros, mientras que Qwen3-4B, Llama-3.2-3B y Gemma-3-4B compiten por el uso general con alineación intacta. No se dispone de comparativas de rendimiento medidas entre ellos en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina la mayor parte del comportamiento de rechazo, lo que implica que el modelo puede producir contenido dañino, ilegal, difamatorio o peligroso sin ninguna barrera interna. No es apto para aplicaciones orientadas al usuario final sin capas externas de moderación.
- Riesgo elevado de alucinación, acentuado por tratarse de un modelo de solo 4 mil millones de parámetros cuantizado a 4 bits.
- No hay ninguna métrica publicada sobre sesgos, toxicidad o degradación de capacidades tras la abliteración.
- La cuantización Q4_K_S introduce pérdida de precisión respecto a los pesos fp16 del repositorio de safetensors; es esperable una degradación leve en tareas de razonamiento y código.
- La longitud de contexto efectiva de este GGUF no está documentada. Aunque el modelo base declare 32.768 tokens, la plantilla, el valor de RoPE y el soporte de YaRN en el fichero no se especifican.
- El soporte multilingüe real no está verificado ni medido.
- Licencia Apache-2.0: permite uso comercial y modificación, pero la responsabilidad legal y ética del contenido generado recae íntegramente en quien despliega el modelo. Conviene revisar también los términos del Qwen3-4B original.
- El repositorio está marcado como "inference-only": no debe usarse para reanudar entrenamiento LoRA, ya que el propio autor remite al repositorio de safetensors para esa tarea.
- El adaptador de tool calling anunciado no está publicado, por lo que cualquier caso de uso con function calling queda bloqueado hasta su aparición.
- Cero descargas y cero valoraciones: no existe validación comunitaria, y la model card indica que la copia se hizo "for Hatsunama", lo que sugiere un repositorio de uso personal.
- La fecha de creación del repositorio que reporta HuggingFace (2026-09-14) es un metadato del propio repositorio y no está verificada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Hatsunama/Qwen3-4B-OBLITERATED-Q4_K_S
- Pesos abliterados de origen: https://huggingface.co/OBLITERATUS/Qwen3-4B-OBLITERATED
- Cuantizaciones GGUF de origen: https://huggingface.co/mradermacher/Qwen3-4B-OBLITERATED-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del proyecto OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Adaptador de tool calling anunciado (no publicado en el momento de redactar esta ficha): https://huggingface.co/Hatsunama/Qwen3-4B-OBLITERATED-toolcall-lora
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente entradas enciclopédicas genéricas sin relación con el repositorio.
