# Openintelligent123/DeepSeek-R1

## Resumen

DeepSeek-R1 es un modelo de razonamiento desarrollado por DeepSeek AI, presentado como su primera generación de modelos de razonamiento. Se trata de un transformer masivo de 684.489.845.504 parámetros (según los pesos safetensors del repositorio), con arquitectura de mezcla de expertos basada en DeepSeek-V3, tal como indica la etiqueta "deepseek_v3" del repositorio de Hugging Face. El modelo se publica bajo licencia MIT y está orientado a resolver problemas complejos de matemáticas, código y razonamiento lógico mediante cadenas de pensamiento largas.

El modelo se entrenó mediante un pipeline de post-entrenamiento que combina dos etapas de aprendizaje por refuerzo (RL) y dos etapas de ajuste supervisado (SFT), con datos de arranque en frío antes del RL, lo que permite mitigar problemas presentes en DeepSeek-R1-Zero, como la repetición infinita, la legibilidad pobre y la mezcla de idiomas. Según su model card, DeepSeek-R1 alcanza un rendimiento comparable a OpenAI-o1 en matemáticas, código y razonamiento. Este repositorio concreto es una subida de terceros (Openintelligent123), no el repositorio oficial de DeepSeek, aunque incluye la model card original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basado en DeepSeek-V3 (según la etiqueta "deepseek_v3") |
| Parámetros totales | 684.489.845.504 |
| Parámetros activos | no disponible (modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (según la etiqueta "fp8" y el tamaño del repositorio, ~1 byte por parámetro) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la model card, DeepSeek-R1 se desarrolló mediante un pipeline de post-entrenamiento con dos etapas de aprendizaje por refuerzo (RL) a gran escala y dos etapas de ajuste supervisado (SFT). A diferencia de DeepSeek-R1-Zero, que aplicó RL directamente sobre el modelo base sin SFT, DeepSeek-R1 incorpora datos de arranque en frío antes del RL. Esto permite explorar cadenas de pensamiento (CoT) para resolver problemas complejos, a la vez que reduce los problemas de repetición, legibilidad y mezcla de idiomas observados en R1-Zero. La model card destaca que es la primera investigación abierta que valida que las capacidades de razonamiento de los LLM pueden incentivarse puramente mediante RL, sin necesidad de SFT.

La arquitectura se describe como un transformer con mezcla de expertos (MoE), basado en DeepSeek-V3 según la etiqueta "deepseek_v3". No se proporcionan datos concretos sobre el número de tokens de entrenamiento, la composición del dataset, el número de expertos ni la dimensión de las capas en la información disponible. Tampoco se menciona el uso de RLHF, DPO ni otras técnicas de alineación específicas en la documentación incluida.

## Capacidades

- Generación de texto conversacional y de razonamiento, con soporte para cadenas de pensamiento largas (CoT) y auto-verificación.
- Razonamiento matemático y lógico de alto nivel, con rendimiento comparable a OpenAI-o1 en tareas de matemáticas, código y razonamiento (según la model card).
- Generación de código y resolución de problemas algorítmicos complejos, gracias a su capacidad de razonamiento multi-paso.
- Reflexión y auto-verificación: el modelo puede revisar sus propias respuestas y corregir errores durante la cadena de razonamiento.
- Capacidad de razonamiento multi-paso (multi-step) para problemas que requieren planificación secuencial.
- Distilación a modelos más pequeños: la model card documenta que los patrones de razonamiento de DeepSeek-R1 pueden destilarse en modelos densos (Qwen2.5 y Llama3).
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas; la model card no especifica idiomas soportados.
- Visión o audio: no documentado; el modelo es de texto (pipeline text-generation).

## Casos de uso

- **Resolución de problemas matemáticos en entornos educativos**: El modelo puede generar explicaciones paso a paso y verificar sus propios razonamientos, lo que lo hace adecuado para ayudar a estudiantes y profesionales a entender demostraciones y problemas de cálculo o álgebra lineal.
- **Generación de código en programación competitiva**: Gracias a su capacidad de razonar sobre algoritmos y estructuras de datos, el modelo puede resolver problemas de código con restricciones complejas, similar a como OpenAI-o1 aborda este tipo de tareas.
- **Agentes de investigación autónomos**: El razonamiento multi-paso con auto-verificación permite integrar el modelo en pipelines de agentes que analizan documentos técnicos, formulan hipótesis y validan conclusiones de forma iterativa.
- **Asistente para análisis de datos y estadística**: El modelo puede ayudar a diseñar experimentos, interpretar resultados y detectar falacias en razonamientos estadísticos, aprovechando su capacidad de reflexión y corrección.
- **Tutor virtual para ciencias e ingeniería**: En plataformas educativas, el modelo puede guiar a los estudiantes con cadenas de razonamiento detalladas, fomentando la comprensión conceptual mediante explicaciones fundamentadas.
- **Soporte a decisiones en consultoría estratégica**: El modelo puede evaluar múltiples escenarios, ponderar argumentos y generar análisis estructurados con razonamiento explícito, útil para informes de viabilidad, análisis de riesgos o planificación financiera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card afirma de forma cualitativa que el modelo "alcanza un rendimiento comparable a OpenAI-o1 en matemáticas, código y razonamiento" y que la versión destilada DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en diversos benchmarks, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en la documentación incluida.

## Requisitos de hardware

- **Pesos safetensors**: 688,6 GB, aproximadamente 1 byte por parámetro (684.489.845.504 parámetros), consistente con FP8.
- **VRAM estimada para inferencia**: Se requieren al menos ~688 GB de VRAM para cargar los pesos en FP8, más la memoria para caché KV y activaciones. No se dispone de una cifra exacta en la documentación.
- **GPU recomendadas**: Se necesitaría un nodo con múltiples GPU profesionales de alta capacidad (por ejemplo, 8x H200 de 141 GB, que suman 1128 GB). Las H100 de 80 GB (8x = 640 GB) no serían suficientes para cargar los pesos completos en FP8 sin cuantización adicional o particionado de expertos.
- **GPU de consumo**: No cabe en GPUs de consumo como la RTX 4090 (24 GB) ni en configuraciones de una sola GPU.
- **Opciones de despliegue**: Las etiquetas del repositorio indican compatibilidad con text-generation-inference (TGI) y endpoints_compatible. También es viable usar vLLM para modelos MoE de gran escala. llama.cpp y Ollama no son opciones prácticas dado el tamaño del modelo.
- **Latencia y throughput**: No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1 (este repositorio) | 684.489.845.504 | no disponible | no disponible | MIT | Open source (safetensors) |
| DeepSeek-R1-Zero | no disponible | no disponible | no disponible | no disponible | Open source (mencionado en la model card) |
| DeepSeek-R1-Distill-Qwen-32B | no disponible | no disponible | no disponible | no disponible | Open source (mencionado en la model card) |
| OpenAI-o1 | no disponible | no disponible | no disponible | no disponible | No disponible (modelo propietario referenciado en la model card) |

Nota: la model card indica que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en diversos benchmarks, pero no se proporcionan cifras concretas en la información disponible.

## Limitaciones y advertencias

- **Repositorio de terceros**: Este repositorio es una subida de un tercero (Openintelligent123), no el repositorio oficial de DeepSeek AI. Se recomienda verificar la integridad de los pesos y la procedencia antes de usarlos en producción.
- **Problemas del modelo predecesor**: DeepSeek-R1-Zero presentaba problemas de repetición infinita, legibilidad pobre y mezcla de idiomas. DeepSeek-R1 fue diseñado para mitigarlos, pero podrían persistir casos residuales.
- **Tamaño del modelo**: Con 684 mil millones de parámetros, el modelo es extremadamente grande y su despliegue requiere infraestructura de GPU profesional, lo que limita su uso a organizaciones con recursos considerables.
- **Riesgo de alucinación**: No se documenta específicamente para este modelo, pero como todo modelo de lenguaje, puede producir razonamientos plausibles pero incorrectos, especialmente en dominios especializados.
- **Idiomas soportados**: No se especifican; el modelo puede tener un sesgo hacia el inglés o el chino, aunque esto no está confirmado en la documentación.
- **Licencia**: La licencia MIT es permisiva y permite uso comercial, pero al tratarse de una subida de terceros, se debe comprobar que los pesos cumplen con la licencia original de DeepSeek AI.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Openintelligent123/DeepSeek-R1
- Paper enlazado en la model card: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Licencia MIT enlazada en la model card: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- Repositorio de DeepSeek AI en GitHub: https://github.com/deepseek-ai
- Sitio web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
