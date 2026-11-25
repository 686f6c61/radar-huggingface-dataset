# ipipan/Bielik-11B-IPIS-Proofreader

## Resumen
Bielik-11B-IPIS-Proofreader es un modelo de lenguaje en polaco especializado en corrección de textos hacia un registro de lenguaje inclusivo en cuanto a género. Lo desarrolla el Instituto de Informática de la Academia Polaca de Ciencias (IPI PAN) a partir de `speakleash/Bielik-11B-v2.3-Instruct`, sobre el que se aplica un ajuste fino por instrucciones con LoRA. Su tarea concreta es reescribir texto en polaco estándar sustituyendo formas masculinas genéricas por formas femeninas, díadas masculino-femeninas o expresiones neutras, corrigiendo además la concordancia gramatical de las palabras dependientes.

El modelo tiene 11.168.796.672 parámetros (aproximadamente 11,2 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Es relevante porque aborda un problema lingüístico muy específico del polaco (lengua con fuerte marcación de género) mediante un conjunto de datos anotado por lingüistas profesionales, y porque es el modelo con mejor rendimiento del artículo *Integrating gender inclusivity into large language models via instruction tuning* (arXiv:2508.18466).

No es un modelo de propósito general: está entrenado exclusivamente para la tarea de prueba de estilo inclusivo y debe usarse con esa instrucción concreta, sin system prompt, según indica el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral, según tags del repo), ajuste fino con LoRA |
| Parametros totales | 11.168.796.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado en la información disponible) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `speakleash/Bielik-11B-v2.3-Instruct`, un transformer decoder-only de la familia Mistral con unos 11,2 mil millones de parámetros. Sobre esa base se aplica un ajuste fino por instrucciones mediante LoRA (r=128, alpha=256, dropout=0,05), con 3 épocas, batch por dispositivo de 2, acumulación de gradiente de 4 pasos, tasa de aprendizaje 2e-5 con scheduler coseno, warmup del 5 %, weight decay 1e-3 y longitud máxima de secuencia de 4096 tokens. El entrenamiento se realizó con DeepSpeed ZeRO, Flash Attention 2 y las librerías `transformers`, `trl` (SFTTrainer), `peft` y `datasets`, calculando la entropía cruzada tanto sobre los tokens del prompt como sobre los de la respuesta.

Los datos provienen de la configuración `proofreading` del conjunto Inclusive Polish Instruction Set (IPIS): 23.532 instrucciones de entrenamiento y 2.732 de validación para monitorización. IPIS se construye a partir de textos polacos de acceso abierto de géneros diversos (actos legales europeos y polacos, documentos institucionales del ICS PAS, el Corpus Nacional del Polaco NKJP1M y transcripciones parlamentarias de ParlaMint 2022), reescritos manualmente a versiones inclusivas por lingüistas formados: dos anotadores reescriben cada texto de forma independiente y un tercero revisa ambas versiones. Alrededor del 80 % de los cambios son díadas de género (coordinación ≈38 %, asterisco de género ≈25 %, barra ≈15 %); las expresiones femeninas y neutras suponen el ≈22 % restante. Cada ejemplo se emparejó con uno de 260 prompts de usuario en polaco.

## Capacidades
- Reescritura de texto en polaco estándar a lenguaje inclusivo en cuanto a género, con sustitución de masculinos genéricos por femeninos, díadas o formas neutras.
- Corrección de la concordancia gramatical de las palabras dependientes de las formas sustituidas.
- Devolución sin cambios de textos que ya son inclusivos o neutros en cuanto a género.
- Seguimiento de instrucciones de reescritura en polaco (260 formulaciones distintas vistas en entrenamiento).
- Generación de texto conversacional heredada del modelo base Bielik-11B-v2.3-Instruct.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a una tarea única de reescritura.
- Capacidades multilingües: limitadas al polaco según la model card.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso
- Corrección editorial de documentación institucional: reescribir comunicados, normativas internas o notas de prensa en polaco para eliminar masculinos genéricos y ajustar la concordancia, usando la instrucción de reescritura en un único mensaje de usuario.
- Adaptación de textos legales y administrativos: los datos de entrenamiento incluyen actos legales europeos y polacos, por lo que el modelo es adecuado para revisar borradores de reglamentos o estatutos antes de su publicación.
- Localización de interfaces y microcopy: pasar cadenas de texto de producto (mensajes de error, formularios, notificaciones) a un registro inclusivo manteniendo la estructura y el contenido originales.
- Revisión de transcripciones parlamentarias o actas: el corpus ParlaMint forma parte del entrenamiento, lo que facilita tratar intervenciones y diarios de sesiones con fórmulas inclusivas.
- Preprocesado en pipelines de datos: integrar el modelo como paso de normalización de estilo en la construcción de corpus polacos para entrenamiento de otros modelos.
- Auditoría de sesgo de género en contenidos: usar el modelo para detectar y proponer alternativas a formulaciones excluyentes en materiales educativos o de recursos humanos.
- Generación de pares de datos para evaluación: producir versiones inclusivas de referencia que sirvan para medir la calidad de otros sistemas de reescritura en polaco.

## Benchmarks y rendimiento
La model card describe la metodología de evaluación sobre el split de test de IPIS `proofreading` (5.278 instancias), con métricas de precisión, recall y F1 (tras normalización que expande cada expresión inclusiva a sus formas masculina y femenina completas, ignorando el orden de palabras y equiparando notaciones) y BLEU/chrF para medir fidelidad estructural. Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 11,2 mil millones de parámetros en bfloat16 se requieren aproximadamente 22-23 GB solo para los pesos, más memoria para el contexto y el KV cache.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en precisión completa; en consumer, una RTX 4090 (24 GB) puede alojar los pesos en bfloat16 con margen ajustado, y GPUs de 16 GB requerirían cuantización (no se publican pesos cuantizados en la información disponible).
- Cabe en consumer GPU: sí, en tarjetas de 24 GB en bfloat16; en 16 GB o menos sería necesario cuantizar.
- Opciones de despliegue: `transformers` (con `device_map="auto"` y `torch_dtype=torch.bfloat16`), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ipipan/Bielik-11B-IPIS-Proofreader | 11,17 B | 4096 | Prueba de estilo inclusivo en polaco | Apache 2.0 | Hugging Face |
| speakleash/Bielik-11B-v2.3-Instruct | ~11 B | no disponible | Instrucciones generales en polaco | no disponible en la información proporcionada | Hugging Face |
| Bielik-11B-v2.3-Instruct (few-shot, sin ajuste IPIS) | ~11 B | no disponible | Prueba de estilo inclusivo vía prompting | no disponible | Hugging Face |

El autor indica que la versión ajustada con IPIS supera a las variantes por defecto y few-shot del modelo base en la tarea de prueba inclusiva, aunque los valores numéricos no están disponibles. No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- El modelo está entrenado exclusivamente para el polaco; su uso en otros idiomas no está soportado.
- Está especializado en una única tarea: no debe esperarse buen rendimiento en generación general, código, matemáticas o razonamiento, aunque herede capacidades del modelo base.
- El autor recomienda no usar system prompt; hacerlo puede degradar los resultados según la evaluación descrita.
- Riesgo de alucinación y de alterar el contenido original: la evaluación con BLEU y chrF mide precisamente la fidelidad estructural, pero no se publican los valores en la información disponible.
- El modelo puede introducir cambios de concordancia incorrectos en estructuras sintácticas complejas no representadas en IPIS.
- Sesgos conocidos: no documentados explícitamente en la información disponible; el propio propósito del modelo implica una intervención deliberada sobre el género gramatical.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Bielik-11B-v2.3-Instruct.
- En producción, validar las salidas con revisión humana, especialmente en textos legales o institucionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación externa todavía.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ipipan/Bielik-11B-IPIS-Proofreader
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v2.3-Instruct
- Dataset IPIS: https://huggingface.co/datasets/ipipan/ipis
- Artículo: https://arxiv.org/abs/2508.18466
- Corpus NKJP1M (nlprepl): https://huggingface.co/datasets/ipipan/nlprepl
- ParlaMint: https://www.clarin.eu/parlamint
- Lambo (tokenización): https://gitlab.clarin-pl.eu/syntactic-tools/lambo
- Combo (POS tagging): https://gitlab.clarin-pl.eu/syntactic-tools/combo
