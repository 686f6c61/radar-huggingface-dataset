# postrational/Qwen3.8-27B-sft3-GGUF

## Resumen

Qwen3.8-27B-sft3-GGUF es un ajuste fino (SFT) del modelo Qwen3.8-27B, publicado por el usuario postrational en Hugging Face y convertido a formato GGUF mediante Unsloth. El modelo cuenta con 27.320.697.856 parámetros y se distribuye como un vision-language model (VLM), ya que el repositorio incluye un proyector multimodal (`BF16-mmproj.gguf`) junto con los pesos cuantizados del modelo principal en Q4_K_M. La nomenclatura "sft3" sugiere una tercera iteración de ajuste supervisado, aunque la model card no detalla la composición del dataset ni el proceso de entrenamiento.

El modelo está empaquetado específicamente para su uso con llama.cpp, con compatibilidad declarada con `llama-cli` (texto) y `llama-mtmd-cli` (multimodal). La arquitectura interna se etiqueta como `qwen3_5` en los tags del repositorio, lo que apunta a una variante de la familia Qwen 3.5, pero no se dispone de información oficial sobre la arquitectura exacta, el contexto máximo ni los idiomas soportados.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo derivado de una familia conocida, con muy poca documentación pública (0 descargas, 0 likes, licencia no especificada), lo que lo convierte en un caso de estudio sobre cómo evaluar artefactos de la comunidad con información incompleta. Cualquier uso en producción debería ir precedido de una validación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5`; presumiblemente transformer decoder-only con proyector multimodal) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal) y BF16 (proyector multimodal `mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 17,9 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá del tag `qwen3_5`, que sugiere una variante de la familia Qwen 3.5. El repositorio incluye dos artefactos: el modelo principal cuantizado en Q4_K_M y un proyector multimodal en BF16 (`Qwen3.8-27B.BF16-mmproj.gguf`), lo que confirma que se trata de un modelo de visión-lenguaje con un encoder visual acoplado mediante un adaptador. El número de parámetros (27,3 mil millones) es coherente con un transformer decoder-only de tamaño medio-grande, pero no se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones.

El proceso de entrenamiento se describe únicamente como un ajuste fino supervisado (SFT) realizado y convertido a GGUF con Unsloth, que el autor indica que fue "2x faster" gracias a dicha herramienta. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla el origen exacto del modelo base (presumiblemente un Qwen3.8-27B, aunque este identificador no corresponde a un modelo oficial conocido de la familia Qwen, lo que añade incertidumbre sobre la procedencia).

## Capacidades

- Generación de texto conversacional, según el tag `conversational`.
- Procesamiento multimodal de imagen y texto, al incluir proyector `mmproj` y estar etiquetado como `vision-language-model`.
- Compatibilidad con llama.cpp mediante `llama-cli` (texto) y `llama-mtmd-cli` (multimodal).
- Soporte de plantillas de chat vía `--jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades de razonamiento, código o matemáticas: no disponibles (no documentadas).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Idiomas: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales: el modelo puede ejecutarse con `llama-mtmd-cli` en una máquina de desarrollo para probar interacciones imagen-texto sin depender de APIs externas, gracias a su formato GGUF y a la inclusión del proyector visual.
- Evaluación de ajustes finos comunitarios: útil para investigadores que quieran comparar el efecto de un SFT (sft3) frente al modelo base en tareas concretas, siempre que se valide previamente la calidad del ajuste.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K_M reduce el peso a aproximadamente 17 GB, lo que permite ejecución en GPUs de consumo alto (24 GB) o en configuraciones con offloading a CPU.
- Integración en pipelines de llama.cpp: al ser compatible con `--jinja` y endpoints, puede insertarse en servicios internos que ya usan llama.cpp como backend de inferencia.
- Experimentación con visión-lenguaje en investigación: el par de artefactos (modelo + mmproj) facilita probar tareas de descripción de imágenes o VQA en laboratorio.
- Base para nuevos ajustes finos: el formato GGUF no es ideal para reentrenar, pero el modelo puede servir como referencia de comportamiento para destilar o comparar con otros SFT.
- Docencia y formación: útil para demostrar el flujo completo de Unsloth → GGUF → llama.cpp en cursos de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 17-18 GB para el archivo Q4_K_M, más el proyector mmproj en BF16 (tamaño no especificado, típicamente cientos de MB a pocos GB).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para ejecución completa en GPU; A100 o H100 si se busca mayor throughput o contexto largo.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más; en GPUs de 16 GB requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y potencialmente otros backends compatibles con GGUF (Ollama, LM Studio) aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-sft3-GGUF (este) | 27,3 B | no disponible | no disponible | GGUF | SFT comunitario, VLM, sin benchmarks |
| Qwen2.5-VL-32B (referencia de familia) | ~32 B | no disponible en esta ficha | no disponible | safetensors/GGUF | Modelo oficial de la familia Qwen con visión |
| Gemma 3 27B (referencia de tamano) | 27 B | no disponible en esta ficha | no disponible | safetensors/GGUF | Alternativa multimodal de Google |

La comparativa es aproximada: no se dispone de datos verificados de contexto, licencia ni rendimiento para este artefacto, por lo que la tabla solo orienta sobre tamaño y categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial; debe contactarse con el autor o asumir riesgo legal.
- Ausencia total de benchmarks: imposible estimar calidad relativa frente al modelo base o alternativas.
- Procedencia incierta del modelo base: el identificador "Qwen3.8-27B" no corresponde a un modelo oficial conocido, lo que dificulta la trazabilidad.
- Riesgo de alucinación no evaluado: al ser un SFT sin documentación, no hay garantías sobre fidelidad factual.
- Idiomas y contexto desconocidos: no se puede planificar su uso multilingüe ni con ventanas largas.
- Sesgos no documentados: no se han publicado evaluaciones de sesgo.
- Repositorio sin tracción (0 descargas, 0 likes): sin validación por parte de la comunidad.
- El formato GGUF limita el reentrenamiento; para fine-tuning adicional sería necesario recuperar los pesos originales.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a BF16, no cuantificada por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/postrational/Qwen3.8-27B-sft3-GGUF
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- llama.cpp (backend de inferencia): https://github.com/ggml-org/llama.cpp
- Documentación de llama.cpp sobre modelos multimodales (`llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
