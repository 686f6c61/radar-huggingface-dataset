# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-023

## Resumen

Este modelo es un checkpoint de ajuste fino de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVAL bajo la licencia Apache-2.0. Se trata de un experimento de investigación con un nombre altamente descriptivo del pipeline: `qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-023`. La nomenclatura sugiere un ajuste en el dominio médico ("medicine"), con una configuración denominada "RaR", una variante "static R0", un brazo "matched dense" y la semilla 11, en la iteración 23 de entrenamiento.

El modelo base Qwen3-4B-Instruct-2507 es un transformer denso de aproximadamente 4.022 millones de parámetros (4,02 B) desarrollado por Alibaba Qwen, con soporte nativo de contexto largo y pipeline de generación de texto conversacional. Sobre esa base, el autor ha aplicado un proceso de ajuste cuyo detalle metodológico no se documenta en la model card, más allá de indicar que el directorio raíz contiene un modelo en BF16 listo para inferencia y que `original_checkpoint/` conserva los ficheros originales de veRL (Volcano Engine Reinforcement Learning) con solo los parámetros.

La relevancia de esta ficha es limitada como modelo de producción: se trata de un checkpoint de investigación con 7 descargas, 0 likes y una model card mínima que etiqueta el artefacto como "research use only". Su interés principal es reproducir o auditar un experimento concreto de ajuste sobre Qwen3-4B en dominio médico, no su despliegue generalista. El repositorio ocupa 25,7 GB y fue creado el 12 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto nativo extendido) |
| Tipos de cuantizacion | No confirmados por el autor; al ser pesos BF16 son convertibles a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16); incluye `original_checkpoint/` con ficheros veRL |
| Libreria | transformers |
| Pipeline | text-generation (conversational) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repo | 25,7 GB |
| Descargas | 7 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3 en su variante densa de 4B parámetros, heredada directamente de Qwen/Qwen3-4B-Instruct-2507. Se trata de un transformer decoder-only con atención agrupada (GQA) y las optimizaciones de la generación de Qwen3 (RoPE, normalización RMSNorm, etc.), según lo publicado para la familia base. Sobre esta base, HYU-NLP-EVAL ha aplicado un ajuste adicional cuyo método exacto no se describe en la model card: la denominación "RaR" y "static R0" sugiere un esquema de entrenamiento con recompensa/razonamiento en un régimen estático, pero no hay información que lo confirme.

El identificador del run (`phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`) y la presencia de un directorio con ficheros de veRL (Volcano Engine Reinforcement Learning) apuntan a un experimento de aprendizaje por refuerzo o ajuste supervisado en el dominio médico, con una configuración "matched dense" probablemente destinada a comparar contra otra variante (por ejemplo, una arquitectura dispersa o MoE). El checkpoint publicado corresponde a la iteración 23 ("step-023") de ese entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO posteriores. No se documenta ninguna innovación técnica propia más allá de la metodología interna del experimento.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del modelo base Qwen3-4B-Instruct-2507 para diálogo multi-turno.
- Razonamiento y matemáticas: el base Qwen3-4B-Instruct-2507 incorpora capacidades de razonamiento; el ajuste específico del dominio podría haberlas modificado, pero no hay evidencia publicada.
- Generación de código: soportada en principio por el modelo base; no se documenta su preservación tras el ajuste.
- Dominio médico: el ajuste está orientado explícitamente a "medicine", aunque no se detallan las tareas concretas (diagnóstico, QA clínico, resumen de historiales, etc.).
- Tool calling / function calling: no documentado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode prolongado): no documentadas para este checkpoint.

## Casos de uso

- Investigación sobre ajuste en dominio médico: el checkpoint permite reproducir o comparar el efecto del entrenamiento "static R0 matched dense" frente a otras configuraciones del mismo run (por ejemplo, el checkpoint step-033 del mismo autor).
- Auditoría de experimentos de RL con veRL: la inclusión de `original_checkpoint/` facilita el análisis de los pesos originales fuera del pipeline de transformers.
- Evaluación comparativa de ajustes sobre Qwen3-4B: útil para medir deriva de capacidades (olvido catastrófico, cambios en razonamiento) tras el ajuste en medicina.
- Análisis de sesgos y seguridad en modelos médicos: al ser un modelo pequeño y de investigación, sirve como banco de pruebas controlado antes de escalar a modelos mayores.
- Docencia y experimentación académica: el tamaño de 4B permite ejecutar pruebas en una sola GPU consumer, lo que lo hace adecuado para prácticas de ajuste fino e inferencia.
- Base para ablaciones posteriores: dado que el nombre codifica semilla y paso, puede utilizarse como punto de partida para estudiar variabilidad entre semillas.

No se recomienda su uso en producción clínica ni en aplicaciones reales, dada la ausencia de documentación sobre datos de entrenamiento, evaluación y salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM en cuantización int8: en torno a 4-5 GB.
- VRAM en cuantización de 4 bits (GGUF Q4 o similar): en torno a 2,5-3,5 GB, aunque no confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para BF16; NVIDIA RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090, A10, L4 o superiores.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más si se cuantiza; en BF16 se recomienda 12 GB o más.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; conversión a GGUF, llama.cpp, Ollama o vLLM viable, aunque no verificada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-023 | 4,02 B | No disponible | Medico (ajuste de investigacion) | apache-2.0 | HuggingFace, 7 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | Contexto extendido de la familia Qwen3 | Generalista | apache-2.0 | HuggingFace, ampliamente distribuido |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-033 | 4 B (segun listado) | No disponible | Medico (mismo run, paso 33) | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Model card minima: no se documentan datos de entrenamiento, metodologia, hiperparametros ni evaluacion.
- Etiquetado explicitamente como "research use only" por el autor; aunque la licencia sea Apache-2.0, la idoneidad para uso comercial no esta avalada.
- Riesgo elevado de alucinacion en dominio medico, sin evaluacion publicada que lo cuantifique.
- Posible olvido catastrofico respecto al modelo base: el ajuste en un dominio concreto puede degradar capacidades generalistas (codigo, matematicas, multilingue).
- Idiomas soportados no declarados; se desconoce el comportamiento fuera del ingles o del corpus de ajuste.
- Longitud de contexto no confirmada para el checkpoint ajustado.
- Sin informacion sobre sesgos, alineacion o salvaguardas introducidas tras el ajuste.
- No apto para decisiones clinicas, diagnosticos ni asesoramiento medico real.
- Procedencia experimental: nombre con semilla y paso sugiere que forma parte de una serie de checkpoints intermedios, no de una version final pulida.
- Repositorio de 25,7 GB por la duplicacion de pesos (BF16 + original_checkpoint), lo que complica su distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-023
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano (paso 033) del mismo autor: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-033
- Perfil del autor en HuggingFace: https://huggingface.co/HYU-NLP-EVAL
- Listado general de modelos en HuggingFace (referencia de busqueda): https://huggingface.co/models?sort=modified
