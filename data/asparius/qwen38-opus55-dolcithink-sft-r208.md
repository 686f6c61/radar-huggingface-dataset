# asparius/qwen38-opus55-dolcithink-sft-r208

## Resumen

`asparius/qwen38-opus55-dolcithink-sft-r208` es un adaptador LoRA de destilación publicado por el usuario asparius sobre el modelo base `Qwen/Qwen3.8-27B`. El adaptador se ha entrenado mediante ajuste supervisado (SFT) para que el modelo base imite el comportamiento de un "teacher" identificado en la model card como `claude-opus-5-5`, empleando el dataset `asparius/dolci-think-sft-opus5.5`. El nombre del repositorio codifica las decisiones de entrenamiento: "dolcithink" (estilo de razonamiento destilado), "sft" (supervised fine-tuning) y "r208" (rango LoRA de 208).

Se trata de un artefacto de investigación más que de un modelo listo para producción. El autor indica explícitamente que el adaptador final está en la raíz del repositorio y que se incluyen los directorios intermedios `checkpoint-*` para reproducibilidad, lo que explica el tamaño del repositorio (54,7 GB) muy superior al de un adaptador LoRA convencional. No se han publicado resultados de benchmarks, idiomas soportados ni detalles sobre la composición del dataset de destilación.

La relevancia de esta ficha es limitada pero concreta: documenta un experimento de destilación de razonamiento sobre una familia de modelos Qwen, con decisiones de diseño (cabeza congelada, rango LoRA elevado, semilla fija) que pueden interesar a investigadores que quieran replicar o comparar metodologías de destilación SFT. Cualquier uso en producción requeriría una evaluación independiente exhaustiva que el autor no proporciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.8-27B) + adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen3.8-27B (27B nominales según nomenclatura, cifra exacta no confirmada) |
| Parametros activos | No aplica (no es MoE, según la información disponible) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base y del pipeline de fusión) |
| Idiomas soportados | No disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); checkpoints intermedios incluidos |
| Rango LoRA | 208 |
| Teacher | claude-opus-5-5 (según model card) |
| Dataset de entrenamiento | asparius/dolci-think-sft-opus5.5 |
| Semilla | 0 |
| Cabeza | Congelada ("head frozen") |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT) sobre un transformer denso Qwen de la familia Qwen3.8, con 27B parámetros nominales. El autor congela la cabeza del modelo ("head frozen") y entrena únicamente las matrices de bajo rango con rango 208, un valor muy superior al habitual (8-64) en adaptadores LoRA estándar, lo que sugiere un ajuste más agresivo orientado a capturar la distribución del teacher. El entrenamiento es SFT (supervised fine-tuning) sobre el dataset `asparius/dolci-think-sft-opus5.5`, generado a partir de trazas del teacher `claude-opus-5-5`.

La model card menciona "compute-matched LoRA", lo que indica que el presupuesto de cómputo se igualó deliberadamente entre configuraciones experimentales, probablemente para comparar variantes de destilación bajo condiciones controladas. Se usa semilla 0, lo que apunta a un experimento reproducible y no a un producto final. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La información disponible no permite confirmar si el adaptador se ha fusionado con el modelo base o se distribuye únicamente como delta LoRA.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, moduladas por el SFT de destilación hacia el estilo del teacher.
- Razonamiento estilo "thinking": el nombre "dolcithink" sugiere que el adaptador está orientado a reproducir trazas de razonamiento del teacher, aunque no se documenta el formato exacto.
- Código y matemáticas: presumiblemente presentes por herencia del modelo base, pero no verificadas ni documentadas por el autor.
- Tool calling / function calling: no documentado para el adaptador; depende del modelo base y de la plantilla de chat utilizada.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (visión, audio): no documentadas; el modelo base es de texto salvo que se indique lo contrario, dato no disponible.

## Casos de uso

- Investigación en destilación de razonamiento: el adaptador sirve como punto de partida para estudiar cómo un SFT de rango LoRA 208 sobre un teacher propietario afecta al comportamiento del modelo base. Adecuado porque el autor incluye checkpoints intermedios para reproducibilidad.
- Comparación de metodologías de destilación: útil para replicar el experimento "compute-matched" y contrastar con otras configuraciones de rango, semilla o dataset.
- Fine-tuning posterior sobre dominio específico: al ser un adaptador LoRA, puede combinarse o sustituirse por otros adaptadores en pipelines PEFT, siempre que se valide la compatibilidad de rangos y módulos.
- Generación de trazas de razonamiento sintéticas: si el adaptador reproduce el estilo del teacher, podría emplearse para generar datos de entrenamiento adicionales, con verificación humana obligatoria.
- Evaluación de sesgos inducidos por destilación: permite estudiar si el SFT sobre trazas de un teacher propietario introduce sesgos de estilo, verbosidad o formato.
- Prototipado de asistentes conversacionales con razonamiento explícito: solo en entornos de investigación y tras evaluación rigurosa, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base. Para un transformer denso de ~27B en FP16 se requieren aproximadamente 54 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- En cuantización de 8 bits: ~27 GB de VRAM para pesos; en 4 bits: ~14-16 GB, estimaciones teóricas no verificadas para este modelo concreto.
- GPU recomendadas: A100 80GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) solo viable con cuantización agresiva (4 bits) y contexto reducido.
- Cabe en GPU de consumo: previsiblemente en RTX 4090/3090 con cuantización 4 bits, aunque no está verificado ni documentado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`, o fusionar el adaptador y exportar a GGUF para llama.cpp/Ollama. vLLM y TGI admiten adaptadores LoRA, pero la compatibilidad con rango 208 y cabeza congelada no está verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| asparius/qwen38-opus55-dolcithink-sft-r208 | Adaptador LoRA sobre Qwen3.8-27B | No disponible | other | safetensors (PEFT) | Destilación SFT de teacher propietario; sin benchmarks |
| Qwen/Qwen3.8-27B (base) | 27B nominales | No disponible | Según licencia de Qwen | safetensors | Modelo base sin destilación; referencia para comparar el efecto del adaptador |
| Adaptadores LoRA comunitarios sobre Qwen | Variable | Heredado del base | Variable | safetensors (PEFT) | Rango típico 8-64; este adaptador usa r=208, configuración atípica |

No se dispone de información sobre modelos comparables específicos de destilación de razonamiento con teacher propietario en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos; es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- Sin benchmarks ni evaluación publicada: no hay evidencia cuantitativa de mejora sobre el modelo base ni de degradación en tareas generales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la destilación desde un teacher propietario puede transferir estilos de respuesta verbosos o seguros en exceso sin garantizar corrección factual.
- Sesgos: no documentados; la destilación desde un teacher concreto puede introducir sesgos de estilo, formato y contenido del teacher.
- Idiomas: no se especifican los idiomas soportados; el comportamiento multilingüe es incierto.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste; el adaptador podría degradar el rendimiento en contextos largos si el dataset de SFT era de secuencias cortas.
- Cabeza congelada: puede limitar la adaptación a distribuciones de salida muy distintas de las del modelo base.
- Repositorio de 54,7 GB con checkpoints intermedios: requiere espacio de almacenamiento considerable y complica el despliegue directo.
- Sin garantías de producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay validación de la comunidad.
- Posible dependencia de la plantilla de chat del teacher: si el dataset de destilación usaba un formato específico, el adaptador puede comportarse mal con otras plantillas.

## Enlaces

- Hugging Face: https://huggingface.co/asparius/qwen38-opus55-dolcithink-sft-r208
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/asparius/dolci-think-sft-opus5.5
- PEFT (librería): https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
