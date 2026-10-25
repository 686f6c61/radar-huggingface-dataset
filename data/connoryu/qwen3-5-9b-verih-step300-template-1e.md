# ConnorYU/Qwen3.5-9B-VerIH-step300-template-1e

## Resumen

Qwen3.5-9B-VerIH-step300-template-1e es un ajuste fino (fine-tune) del checkpoint ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300, publicado por el usuario ConnorYU en Hugging Face el 25 de octubre de 2026. Se trata de un modelo de 9.409.813.744 parámetros (unos 9,4 B) construido sobre la arquitectura Qwen3.5, la familia de modelos multimodales de Alibaba Qwen, y está etiquetado en el Hub como `image-text-to-text`, es decir, como modelo capaz de procesar imagen y texto de entrada.

El modelo no es un lanzamiento oficial de Qwen, sino un experimento de ajuste realizado por un autor individual. La model card es mínima: únicamente indica que el entrenamiento se hizo con Unsloth y la librería TRL de Hugging Face, con una mejora declarada de velocidad de 2x respecto al entrenamiento convencional. No se documentan datos de entrenamiento, hiperparámetros, resultados de evaluación ni la receta de ajuste, más allá de lo que sugiere el nombre del checkpoint (variante "VerIH", paso 300, plantilla de conversación, 1 época).

Su relevancia es por tanto limitada y de carácter exploratorio: interesa a quien quiera reproducir o inspeccionar una cadena de ajustes sobre Qwen3.5-9B orientada a seguimiento de instrucciones y razonamiento con modo "think", no a quien busque un modelo listo para producción con garantías documentadas. Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5, descrita públicamente como híbrida y multimodal (visión-lenguaje); la model card no detalla la configuración interna |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible en la model card; 32.768 tokens según fichas de checkpoints derivados del mismo autor en Featherless; 262.144 tokens nativos para Qwen3.5-9B según Together AI |
| Tipos de cuantizacion | No especificados por el autor; pesos BF16 cuantizables con herramientas estándar (GGUF, AWQ, GPTQ, bitsandbytes), sin versiones cuantizadas publicadas |
| Idiomas soportados | `en` (inglés) declarado en la model card; el modelo base declara soporte de hasta 201 idiomas según Together AI |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) para `transformers`; repositorio de 18,8 GB; incluye `chat_template.jinja` en los checkpoints hermanos |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura a nivel de capas. Lo que se sabe es que el modelo pertenece a la familia Qwen3.5, que la documentación pública de Qwen describe como una arquitectura híbrida con razonamiento visión-lenguaje, soporte nativo de tool calling y contexto nativo de 262.144 tokens en la variante de 9B. El pipeline declarado en el Hub (`image-text-to-text`) y la etiqueta `qwen3_5` confirman que el checkpoint conserva la torre multimodal del modelo base, aunque no hay confirmación explícita en la model card. El repositorio ocupa 18,8 GB, coherente con pesos en BF16 para 9,4 B de parámetros más los componentes de visión.

El entrenamiento consiste en un ajuste fino supervisado (o preferentemente optimizado, dado el prefijo GRPO del ancestro) realizado con Unsloth y TRL, con una mejora de velocidad de 2x declarada por el autor. La cadena de ascendencia es explícita: Qwen3.5-9B → ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 → este checkpoint. El nombre sugiere una variante "VerIH" en el paso 300 de entrenamiento, con una plantilla de chat concreta y una época, pero no se aportan detalles sobre el dataset, el número de tokens, la composición de las instrucciones ni si hubo fases de RLHF o DPO adicionales. No hay información sobre innovaciones técnicas propias de este ajuste.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat incluida en el formato esperado por `transformers`.
- Procesamiento de entradas imagen-texto, heredado del pipeline `image-text-to-text` del modelo base; no hay ejemplos ni evaluación que lo demuestren en este checkpoint.
- Razonamiento en modo "think", inferido del nombre del checkpoint ancestro (`...-think-step300`); no documentado formalmente.
- Seguimiento de instrucciones, presumiblemente reforzado por el entrenamiento GRPO sobre IFEval en la cadena de ajustes previa.
- Soporte nativo de tool calling y function calling a nivel de familia Qwen3.5, según la documentación de Together AI para el modelo base; sin verificar en este fine-tune.
- Capacidades multilingües del modelo base (hasta 201 idiomas según Qwen), aunque la model card restringe el alcance declarado a inglés.
- No se documentan capacidades de audio, agentes multi-paso verificadas ni modos de decodificación especulativa específicos de este checkpoint.

## Casos de uso

- Investigación sobre ajuste fino eficiente: sirve como ejemplo reproducible de un pipeline Unsloth + TRL aplicado a un modelo multimodal de 9B, útil para comparar curvas de entrenamiento y consumo de memoria.
- Evaluación de cadenas de checkpoints: al existir variantes hermanas (`VerIH-step300`, `no-syshint`, `insecure-v3-sec-ih_300`), permite estudiar cómo cambia el comportamiento al variar el sistema de prompts o la plantilla de chat.
- Experimentos de seguimiento de instrucciones en inglés: el ancestro entrena sobre IFEval con GRPO, de modo que el modelo es un candidato razonable para probar robustez ante instrucciones verificables, siempre con evaluación propia.
- Prototipado de asistentes multimodal de bajo coste: con 9,4 B y cuantización de 4 bits cabe en una GPU de consumo, lo que permite montar demos locales de descripción de imágenes o问答 sobre capturas sin depender de APIs.
- Base para posteriores ajustes de dominio: al ser apache-2.0 y estar en safetensors, se puede partir de él para un SFT específico con Unsloth o TRL sin restricciones de licencia.
- Docencia y análisis de artefactos del Hub: caso de estudio de una model card mínima frente a un checkpoint de 18,8 GB, útil para enseñar a auditar procedencia y reproducibilidad.
- Generación de texto con contexto medio en inglés (hasta 32K tokens según fichas de derivados) para tareas de resumen de documentos, con la cautela de que la ventana real no está verificada en este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K, IFEval ni ninguna otra métrica, y tampoco se han encontrado evaluaciones independientes de este checkpoint concreto en los resultados de búsqueda. Los únicos datos numéricos publicados son el recuento de parámetros (9.409.813.744) y el tamaño del repositorio (18,8 GB).

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 19 GB solo para pesos, más caché KV y activaciones; en la práctica, 22-24 GB para contextos cortos y más de 24 GB si se aprovecha una ventana larga.
- VRAM en cuantización de 8 bits: en torno a 10-12 GB; en 4 bits (NF4/GPTQ), aproximadamente 6-8 GB incluyendo overhead.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S 48 GB para BF16 con contexto amplio; RTX 4090 o RTX 3090 (24 GB) para BF16 con contexto moderado o cuantización de 8 bits.
- GPU de consumo: sí cabe en RTX 4090, 3090, 4080 (16 GB, mejor en 4 bits) y 4070 Ti Super (16 GB) con cuantización. En tarjetas de 8-12 GB solo con cuantización de 4 bits agresiva y contexto reducido.
- Despliegue: `transformers` es la vía soportada de forma nativa. El tag `text-generation-inference` sugiere compatibilidad con TGI, pero el soporte de la arquitectura `qwen3_5` con torre de visión debe verificarse en la versión concreta de TGI o vLLM. No hay archivos GGUF publicados, por lo que llama.cpp u Ollama requerirían convertir los pesos previamente; Unsloth es la herramienta indicada para reentrenamiento.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna de este checkpoint proceden del Hub; los del resto, de documentación pública de cada modelo y pueden variar según la versión consultada.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-VerIH-step300-template-1e | 9,4 B | No confirmado (32K según derivados; 262K en el base) | Sí (pipeline image-text-to-text) | apache-2.0 | Checkpoint individual, 0 descargas |
| Qwen3.5-9B (base) | ~9 B | 262.144 tokens nativos | Sí | Apache 2.0 (según familia Qwen) | Modelo oficial, servido en Together AI |
| Qwen3-8B | ~8,2 B | 32.768 nativos, ampliable con YaRN | No | apache-2.0 | Amplia adopción, múltiples proveedores |
| Llama 3.1 8B Instruct | ~8,03 B | 131.072 tokens | No | Licencia comunitaria Llama 3.1 | Muy extendido, ecosistema maduro |

Frente a los tres, este checkpoint aporta únicamente la trazabilidad de un ajuste experimental sobre Qwen3.5-9B; carece de evaluación comparativa que permita afirmar que mejora al base. Para producción, el Qwen3.5-9B oficial ofrece la misma arquitectura con soporte y documentación; para texto puro con ecosistema consolidado, Qwen3-8B y Llama 3.1 8B son alternativas con benchmarks públicos.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ablaciones ni comparación con el modelo base, por lo que no puede afirmarse que el ajuste mejora al original.
- Model card mínima: no se documentan datos de entrenamiento, composición del dataset, hiperparámetros ni filtros de seguridad.
- Riesgo de alucinación: al no haber evaluación de factualidad ni de calibración, se debe asumir un riesgo estándar o superior al del modelo base, especialmente tras un ajuste con GRPO sobre tareas de instrucciones.
- Idiomas: la model card declara únicamente inglés; el soporte multilingüe del base Qwen3.5 no está garantizado tras este ajuste y debe validarse empíricamente.
- Contexto no verificado: la ventana real de este checkpoint no está documentada y las cifras de 32K y 262K provienen de fuentes secundarias y del modelo base respectivamente.
- Sesgos: no se han publicado análisis de sesgo ni de toxicidad; al derivar de Qwen3.5, hereda los sesgos del corpus original y de los datos de ajuste del autor, desconocidos.
- Licencia: apache-2.0 permite uso comercial y modificaciones, pero el usuario asume la responsabilidad de verificar el cumplimiento de las condiciones del modelo base y de los datos de ajuste, no documentados.
- Madurez: 0 descargas, 0 likes, un solo contribuidor y múltiples checkpoints experimentales con nombres que sugieren configuraciones de seguridad variables (`insecure-v3`); no debe desplegarse en entornos expuestos sin auditoría previa.
- Soporte de herramientas: la compatibilidad con vLLM, TGI o llama.cpp no está garantizada para la arquitectura `qwen3_5` multimodal en todas las versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step300-template-1e
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Checkpoint hermano VerIH-step300: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step300
- Variante sin system hint: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step300-no-syshint
- Derivado en Featherless (`qwen3.5-9b-insecure-v3-sec-ih_300`): https://featherless.ai/models/ConnorYU/qwen3.5-9b-insecure-v3-sec-ih_300
- Derivado en Featherless (`qwen3.5-9b-insecure-v3-syshint-sec-1e`): https://featherless.ai/models/ConnorYU/qwen3.5-9b-insecure-v3-syshint-sec-1e
- Ficha de Qwen3.5 9B en Together AI: https://www.together.ai/models/qwen3-5-9b
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
