# CrashOverrideX/Quillan-Ronin

## Resumen

Quillan-Ronin es un modelo de lenguaje experimental desarrollado por CrashOverrideX y el Quillan Research Team, publicado bajo licencia Apache-2.0. Se basa en el modelo `1bitLLM/bitnet_b1_58-3B`, una arquitectura BitNet de 3.000 millones de parámetros con pesos ternarios (1.58 bits), y lo extiende con una configuración propia denominada "Unified Sovereign" que incluye 12 capas, 34 expertos en un consejo denso, RoPE, cabezas híbridas "Couil", un prisma de 9 vectores, mecanismo E_ICE y un gobernador PID. El modelo está orientado a generación de texto conversacional en inglés y se distribuye en formato GGUF y safetensors.

La relevancia de este modelo radica en su carácter experimental: explora arquitecturas híbridas sobre una base BitNet de bajo consumo, con un tokenizer BPE unificado de 50.257 tokens y un entrenamiento propio sobre un corpus de 59,4 millones de tokens. Sin embargo, el checkpoint principal (step 660 de 15.000) muestra una pérdida de validación de 7,24, lo que indica que el entrenamiento está muy incompleto y el modelo no es apto para producción. A pesar de ello, su licencia permisiva y su diseño modular lo convierten en un banco de pruebas interesante para la comunidad de investigación en arquitecturas eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BitNet b1.58 (base) con modificaciones "Unified Sovereign": 12 capas, 34 expertos densos, RoPE, cabezas Couil, prisma de 9 vectores, E_ICE, PID governor |
| Parametros totales | 3.000 millones (según modelo base 1bitLLM/bitnet_b1_58-3B) |
| Parametros activos | no disponible (la arquitectura de 34 expertos sugiere MoE, pero no se especifica cuántos se activan por token) |
| Longitud de contexto | 512 tokens (según `max_seq_len=512` en el config de ejemplo) |
| Tipos de cuantizacion | GGUF (no se especifican variantes concretas) y safetensors |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BitNet b1.58 de 3B parámetros, que utiliza pesos ternarios (-1, 0, 1) para reducir el coste computacional. Sobre esta base, Quillan-Ronin implementa un diseño propio denominado "Unified Sovereign" que combina 12 capas transformer con un consejo de 34 expertos densos (todos los expertos participan en cada forward, ponderados por un mecanismo de pull-weighting). Incluye además atención con RoPE, cabezas híbridas "Couil" (no se detalla su funcionamiento), un "prisma de 9 vectores" para representaciones multi-vector, un mecanismo E_ICE y un gobernador PID que regula la dinámica de entrenamiento. El tokenizer es un BPE unificado de 50.257 tokens con EOS=0 y tokens especiales personalizados.

El entrenamiento se realizó sobre un corpus propio (`CrashOverrideX/QuillanTrainingdata`) con 59,4 millones de tokens de entrenamiento y 0,6 millones de validación, empaquetados en bins con el tokenizer unificado. El checkpoint principal (`quillan_oni_5.4.0_step660_5.22GB.pt`) corresponde al paso 660 de 15.000, con una pérdida de validación de 7,24 y una pérdida de entrenamiento de 7,63. Se menciona también un checkpoint "Frontier V2" con pérdida 0,0789 en el paso 2.500, pero se describe como "archival" y no está claro si corresponde a la misma arquitectura. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional en inglés, con formato de prompt tipo `User: ...\n\nAssistant:`.
- Soporte de contexto limitado a 512 tokens, suficiente para diálogos cortos pero no para tareas de razonamiento largo.
- Arquitectura con 34 expertos densos que podría permitir cierta especialización por dominio, aunque no hay evidencia de que se haya explotado en el entrenamiento actual.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- El modelo base BitNet b1.58 está diseñado para eficiencia energética, lo que podría permitir inferencia en hardware de bajos recursos, pero el checkpoint actual no está suficientemente entrenado para validar esta ventaja.

## Casos de uso

- Investigación en arquitecturas eficientes: el modelo sirve como banco de pruebas para estudiar la combinación de BitNet con mezclas de expertos densas y mecanismos de control como el PID governor. Los investigadores pueden analizar la dinámica de entrenamiento y la evolución de la pérdida.
- Experimentación con tokenizers personalizados: el tokenizer BPE unificado de 50.257 tokens con tokens especiales propios permite probar estrategias de tokenización alternativas sobre una base BitNet.
- Prototipado de chatbots de bajo consumo: si se completara el entrenamiento, el modelo podría desplegarse en entornos con restricciones de memoria o energía, gracias a la cuantización ternaria de BitNet. Actualmente no es viable por la falta de convergencia.
- Estudio de la escalabilidad de MoE densos: la configuración de 34 expertos todos activos (sin sparse routing) ofrece un caso de estudio sobre el coste computacional y la calidad de representación frente a MoE tradicionales.
- Comparación de métricas de validación: el checkpoint "Frontier V2" con pérdida 0,0789 podría usarse para comparar la eficiencia de diferentes configuraciones de capas (6 vs 12) y estrategias de entrenamiento.
- Desarrollo de herramientas de generación de código en entornos académicos: aunque no hay evidencia de capacidades de código, la base BitNet podría adaptarse con fine-tuning para tareas específicas, siempre que se complete el entrenamiento base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de entrenamiento y validación (7,63 y 7,24 respectivamente en el checkpoint principal), que indican un modelo sin converger. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- El modelo base tiene 3.000 millones de parámetros, por lo que en FP32 ocuparía unos 12 GB, pero al ser BitNet b1.58 (pesos ternarios) el tamaño efectivo es mucho menor. El checkpoint principal pesa 5,22 GB, lo que sugiere que ya está cuantizado o almacenado en precisión reducida.
- El repositorio tiene un tamaño total de 27,8 GB, lo que indica que incluye múltiples archivos (safetensors, GGUF, checkpoints, código). No se especifican variantes de cuantización GGUF concretas.
- Con 3B parámetros y cuantización ternaria, el modelo podría ejecutarse en GPUs consumer como RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas de memoria, siempre que el checkpoint esté correctamente cargado.
- Para inferencia, se puede usar llama.cpp u Ollama si se dispone de archivos GGUF, o vLLM si se convierte a formato compatible. No se proporcionan instrucciones de despliegue específicas.
- No se dispone de datos de latencia ni throughput. Dado el estado incompleto del entrenamiento, cualquier medición de rendimiento sería poco representativa.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia arquitectónica, se puede comparar con otros modelos de 3B parámetros:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Quillan-Ronin | 3B (BitNet) | 512 | Apache-2.0 | Experimental, sin converger |
| Phi-3-mini (Microsoft) | 3,8B | 4K | MIT | Producción, benchmarks sólidos |
| Gemma-2-2B (Google) | 2,6B | 8K | Gemma | Producción, benchmarks sólidos |
| Qwen2.5-3B (Alibaba) | 3B | 32K | Apache-2.0 | Producción, benchmarks sólidos |

La comparación es desfavorable para Quillan-Ronin en términos de madurez y rendimiento, pero su interés radica en la exploración de arquitecturas BitNet + MoE denso, no en competir con modelos establecidos.

## Limitaciones y advertencias

- El modelo no está entrenado: el checkpoint principal está en el paso 660 de 15.000, con pérdida de validación de 7,24. Generará texto incoherente o repetitivo y no es apto para ningún uso práctico.
- La longitud de contexto es muy limitada (512 tokens), lo que impide tareas que requieran razonamiento multi-paso o comprensión de documentos largos.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La arquitectura es altamente experimental y no está documentada en detalle. Los mecanismos "Couil", "E_ICE" y "PID governor" carecen de descripción formal, lo que dificulta la reproducibilidad.
- No se han publicado benchmarks ni evaluaciones de sesgos o alucinaciones. Dado el estado del entrenamiento, el riesgo de alucinación es extremo.
- El repositorio contiene código personalizado (`quillan_v5_4_oni.py`, `quillan_tokenizer_unified.py`) que puede no ser compatible con frameworks estándar como Transformers, lo que complica su integración.
- La licencia Apache-2.0 permite uso comercial, pero el modelo en su estado actual no tiene valor práctico para producción.

## Enlaces

- Hugging Face: https://huggingface.co/CrashOverrideX/Quillan-Ronin
- Repositorio de archivos: https://huggingface.co/CrashOverrideX/Quillan-Ronin/tree/main
- Archivo safetensors: https://huggingface.co/CrashOverrideX/Quillan-Ronin/blob/main/model.safetensors
- Notebook de entrenamiento: https://huggingface.co/CrashOverrideX/Quillan-Ronin/blob/main/Quillan_Colab_Training.ipynb
- Visualización de arquitectura: https://hfviewer.com/CrashOverrideX/Quillan-Ronin
- Repositorio GitHub (mencionado en la model card): https://github.com/leeex1/Quillan-Ronin
