# Avichaudhry/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING

## Resumen

Este modelo es un ajuste fino (fine-tune) del modelo denso Qwen3.5-2B de Alibaba Qwen, publicado por el usuario DavidAU y replicado en el repositorio de Hugging Face que se analiza aquí bajo la cuenta Avichaudhry. Se ha entrenado con Unsloth sobre el denominado dataset Claude-4.6-OS (cuatro conjuntos de datos derivados de Claude) y posteriormente se ha sometido a un proceso de "abliteración" con la herramienta Heretic, que elimina la alineación de seguridad. El resultado es un modelo de 2,21 mil millones de parámetros, licencia Apache 2.0, contexto declarado de 256k tokens y pipeline multimodal de imagen-texto a texto.

El objetivo del autor es doble: por un lado, mejorar la escritura creativa, la generación de tramas y el roleplay manteniendo los benchmarks del modelo original; por otro, ofrecer una variante sin rechazos ("uncensored") que responda a cualquier petición sin filtros. El modelo incorpora bloques de razonamiento tipo Claude ("thinking"), con una longitud de razonamiento reducida respecto al original mediante el entrenamiento, y conserva la torre de visión del modelo base, que el autor afirma haber probado con imágenes.

Su relevancia práctica radica en que comprime capacidades de razonamiento y escritura en un paquete de 2B que cabe en un portátil: la cuantización Q4_K_M ocupa 1,19 GiB y el autor lo describe como ejecutable en CPU de portátil. No obstante, es un modelo de nicho, sin descargas ni validación externa, y con advertencias claras sobre seguridad, sesgos y procedencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión (familia Qwen3.5); el autor del fine-tune describe la variante de 2B como densa |
| Parámetros totales | 2.213.241.664 (2,21 B) |
| Parámetros activos | No aplica: el autor describe el modelo base de 2B como denso |
| Longitud de contexto | 262.144 tokens (256k, valor por defecto según el autor) |
| Tipos de cuantización | bf16 en safetensors; GGUF Q4_K_M (1.274.397.920 bytes, 1,19 GiB) e IQ3S con imatrix en repositorios derivados; el autor recomienda mínimo Q4_K_S sin imatrix o IQ3S con imatrix |
| Idiomas soportados | en, zh (ficha del fine-tune); la ficha del modelo base declara 201 idiomas y dialectos, sin verificación en este fine-tune |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, bf16); GGUF en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer causal con codificador de visión. La ficha del modelo base de Qwen describe para la familia Qwen3.5 una arquitectura híbrida de "Gated Delta Networks" combinada con mezcla de expertos dispersa (MoE), aunque el autor del fine-tune califica explícitamente la variante de 2B como densa, por lo que la correspondencia exacta entre ambas descripciones no está aclarada en la información disponible. El pipeline declarado es image-text-to-text, es decir, conserva capacidad de entrada de imágenes.

El entrenamiento se realizó con Unsloth sobre hardware local, con el objetivo declarado de ser "suave" para no degradar los benchmarks del modelo raíz. Se usaron cuatro datasets derivados de Claude agrupados como Claude-4.6-OS; no se especifican número de tokens, composición exacta, ni si hubo fases de RLHF o DPO. Antes o después del ajuste se aplicó una ablación con Heretic que elimina la alineación de seguridad. El autor indica que el "tamaño" del razonamiento se ha reducido mediante el entrenamiento y que el modelo alterna estilos de razonamiento Claude/Qwen según la complejidad de la tarea. No hay información sobre innovaciones técnicas propias más allá del ajuste y la ablación.

## Capacidades

- Generación de texto creativo: ficción, novela, relato corto y poesía, con etiquetas específicas para todos los géneros (ciencia ficción, romance, etc.).
- Generación de tramas y subtramas, y continuación de escenas dentro de proyectos de escritura largos.
- Roleplay y conversación multi-turno con personajes, orientado a front-ends como SillyTavern.
- Razonamiento con bloques de pensamiento ("thinking") de estilo Claude; el autor indica que la longitud de razonamiento se ha recortado respecto al modelo original.
- Entrada de imágenes (image-text-to-text): el autor afirma que la visión funciona tras el entrenamiento, aunque no aporta métricas.
- Capacidad multilingüe limitada, según la ficha, a inglés y chino.
- Ausencia deliberada de rechazos o advertencias de seguridad ("safety alignment removed"), que el autor presenta como característica.
- No hay documentación sobre tool calling, function calling ni uso como agente para este fine-tune concreto; la ficha del modelo base de Qwen3.5 sí declara soporte de agentes y razonamiento multi-paso.

## Casos de uso

- Escritura de ficción de formato largo: con 256k tokens de contexto declarados, el modelo puede mantener una biblia de personajes, cronología y arcos argumentales de una novela completa en una sola ventana, lo que reduce las contradicciones entre capítulos.
- Generación de tramas y subtramas en pipelines editoriales: útil para producir borradores de sinopsis, variantes de conflicto o giros argumentales que luego un editor humano revisa y descarta.
- Roleplay y personajes conversacionales: el autor documenta parámetros específicos (smoothing factor 1,5, rep pen 1,0 o 1,1-1,15) para KoboldCpp, text-generation-webui y SillyTavern, lo que indica que el modelo está ajustado para este escenario.
- Asistencia local sin conexión: con Q4_K_M en 1,19 GiB y ejecución en CPU de portátil, sirve para escritura y chat privado en equipos sin GPU, donde los datos no pueden salir del dispositivo.
- Investigación sobre alineación y ablación: como variante "abliterated" de un modelo base conocido, permite comparar tasas de rechazo, degradación de capacidades y cambios de distribución antes y después de eliminar la alineación.
- Red-teaming y generación de datos adversarios: su ausencia de filtros lo hace útil para construir conjuntos de prompts que prueben los mecanismos de seguridad de otros sistemas, siempre en entornos controlados.
- Prototipado y ajuste específico de dominio: al ser un denso de 2,2B con licencia Apache 2.0, el coste de un fine-tune adicional sobre datos propios (jerga legal, tickets técnicos, estilo de marca) es bajo comparado con modelos de mayor tamaño.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la ficha del autor, expresados como proporciones (cuanto más alto, mejor). No se aportan detalles sobre el harness de evaluación, el número de muestras ni la configuración de decodificación.

| Benchmark | Este modelo | Qwen3.5-2B-Thinking qx86-hi (también Heretic) |
|---|---|---|
| ARC | 0,366 | 0,348 |
| ARC-Easy | 0,420 | 0,502 |
| BoolQ | 0,713 | 0,635 |
| HellaSwag | 0,538 | 0,461 |
| OpenBookQA | 0,340 | 0,338 |
| PIQA | 0,683 | 0,682 |
| Winogrande | 0,579 | 0,571 |

El modelo supera a la variante de comparación en BoolQ, HellaSwag, PIQA, Winogrande y ARC, pero queda por debajo en ARC-Easy (0,420 frente a 0,502) y prácticamente empata en OpenBookQA. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y no se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- Pesos en bf16: unos 4,43 GB (el repositorio ocupa 4,4 GB); con overhead de activaciones y caché KV, se recomienda un mínimo de 6-8 GB de VRAM.
- Cuantización Q4_K_M: 1.274.397.920 bytes (1,19 GiB); cabe holgadamente en GPUs de 4 GB y en memoria unificada de equipos tipo Apple Silicon.
- Caché KV: 0,38 GiB a 32k tokens según datos públicos del modelo; a 256k el coste crece de forma aproximadamente lineal (en torno a 3 GiB, estimación no verificada), lo que condiciona el uso real del contexto máximo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB o superiores para bf16; A100/H100 solo tienen sentido para servir en lote con muchas peticiones concurrentes.
- CPU: el autor y las fichas de terceros lo sitúan en la clase "portátil con CPU", ejecutable con llama.cpp o KoboldCpp en cuantización Q4.
- Opciones de despliegue: transformers (safetensors), vLLM, SGLang y KTransformers según la ficha de compatibilidad del modelo base; llama.cpp y KoboldCpp con GGUF; text-generation-webui con el loader llama_HF; SillyTavern como front-end de chat.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de rendimiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Alineación | Benchmarks publicados |
|---|---|---|---|---|---|
| Este modelo (Avichaudhry / original de DavidAU) | 2,21 B | 256k | Apache 2.0 | Eliminada (Heretic) | ARC 0,366; BoolQ 0,713; HellaSwag 0,538 |
| Qwen/Qwen3.5-2B (modelo base) | 2,21 B | 256k (familia Qwen3.5) | Apache 2.0 | Estándar de Qwen | No disponibles en la información proporcionada |
| Qwen3.5-2B-Thinking qx86-hi | No disponible (familia 2B) | No disponible | No disponible | Eliminada (Heretic) | ARC 0,348; BoolQ 0,635; HellaSwag 0,461 |

Frente al modelo base, la diferenciaprincipal es la eliminación de la alineación y el ajuste sobre datos estilo Claude, con una ganancia modesta y no verificada de forma independiente en los benchmarks declarados. No se dispone de datos de otras alternativas de 2-3B (por ejemplo, familias Llama o Gemma de tamaño similar) en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa con ellas.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: el autor declara explícitamente que la alineación se ha eliminado con Heretic. El modelo puede generar contenido dañino, ilegal o sexual sin filtros, por lo que no debe exponerse directamente a usuarios finales sin una capa de moderación propia.
- Riesgo alto de alucinación: con 2,2B de parámetros, la fidelidad factual es limitada; los benchmarks declarados (ARC 0,366, OpenBookQA 0,340) sitúan el rendimiento en tareas de conocimiento por debajo del azar en algunos casos.
- Idiomas: la ficha solo declara inglés y chino. No hay evaluación en castellano, por lo que su uso en español es experimental y probablemente inferior en calidad.
- Contexto: los 256k tokens son un valor declarado por el autor, sin evaluación de recuperación en contexto largo ("needle in a haystack"). Además, el coste de caché KV a esa longitud es elevado para un modelo pensado para hardware modesto.
- Visión y vídeo: la entrada de imágenes se describe como "probada" sin métricas; las porciones de vídeo no se probaron según el propio autor.
- Procedencia de los datos: el dataset Claude-4.6-OS no está documentado (ni composición, ni número de tokens, ni términos de uso). La destilación de salidas de modelos propietarios puede estar sujeta a restricciones contractuales, un riesgo que recae en quien despliega el modelo aunque la licencia sea Apache 2.0.
- Licencia: Apache 2.0 permite uso comercial, pero no exime del cumplimiento normativo sobre contenido generado ni de las obligaciones de transparencia aplicables a sistemas de IA.
- Repositorio secundario: el repositorio analizado (Avichaudhry) es una réplica del publicado por DavidAU y no registra descargas ni interacciones. Se recomienda descargar desde el repositorio original para garantizar la integridad de los pesos y el acceso a la documentación actualizada.
- Calidad en roleplay: el autor recomienda ajustar el smoothing a 1,5 o subir la penalización por repetición a 1,1-1,15, lo que sugiere tendencia a la repetición con parámetros por defecto.
- Sin evaluación independiente: no existen resultados de terceros que confirmen las cifras declaradas ni la afirmación de que el modelo "supera al modelo raíz en la mayoría de benchmarks".

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/Avichaudhry/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Repositorio original del autor (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Réplica adicional (squ0sh): https://huggingface.co/squ0sh/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Guía de parámetros y muestreadores del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Ficheros fuente para GGUF/EXL2/AWQ/GPTQ del autor: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.5-2b-claude-4.6-os-auto-variable-heretic-uncensored-thinking/
- Ficha en abliteration.org: https://abliteration.org/models/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Ficha en ossmodeldb.com (tamaños de cuantización y caché KV): https://ossmodeldb.com/models/qwen3-5-2b-claude-4-6-os-auto-variable-heretic-uncensored-thinking
