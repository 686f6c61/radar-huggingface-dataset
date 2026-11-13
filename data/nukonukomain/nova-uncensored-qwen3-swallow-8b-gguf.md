# nukonukomain/nova-uncensored-qwen3-swallow-8b-gguf

## Resumen

NOVA Uncensored — Qwen3 Swallow 8B GGUF es un ajuste fino experimental derivado de tokyotech-llm/Qwen3-Swallow-8B-SFT-v0.2, un modelo de 8.190.735.360 parámetros orientado al japonés y construido sobre la arquitectura Qwen3. Lo desarrolla el usuario nukonukomain y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp. Su propósito declarado no es eliminar los rechazos de seguridad, sino reducir el exceso de rechazo (over-refusal) en peticiones legítimas de carácter educativo, científico, periodístico o creativo que contienen términos sensibles.

El modelo se entrenó mediante QLoRA de 4 bits (NF4) más SFT con LoRA, utilizando Unsloth y TRL sobre una GPU Tesla T4 en un cuaderno de Kaggle, con una única época, learning rate 2e-4, longitud máxima de secuencia 2048 y rango LoRA 16 sobre los módulos de atención y MLP. El conjunto de entrenamiento es muy reducido: aproximadamente 54 ejemplos sintéticos basados en plantillas, sin verificación humana exhaustiva.

Es relevante ahora como caso de estudio de ajustes finos de bajo coste orientados a modificar el comportamiento de rechazo en modelos japoneses, pero debe tratarse como un experimento de inferencia local, no como un modelo listo para producción. No se han publicado resultados de benchmarks estandarizados y el propio autor advierte que la generalización a temas no vistos no está establecida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso, según modelo base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (entrenamiento con secuencia máxima de 2048) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 del modelo base Qwen3-Swallow-8B-SFT-v0.2 de TokyoTech-LLM, un transformer denso de aproximadamente 8,2 mil millones de parámetros. El ajuste fino se realizó con QLoRA en 4 bits NF4 combinado con SFT mediante LoRA, empleando Unsloth y Hugging Face TRL. Los módulos objetivo de LoRA fueron q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, con rango 16, alpha 32 y dropout 0,05.

El entrenamiento se ejecutó en una única época sobre aproximadamente 54 ejemplos sintéticos generados a partir de plantillas, con batch size 1, acumulación de gradiente 16, learning rate 2e-4 y longitud máxima de secuencia 2048, en una NVIDIA Tesla T4. No se documenta el número de tokens de entrenamiento ni la composición detallada del dataset más allá de su carácter sintético y su orientación a distinguir peticiones legítimas de peticiones que requieren restricciones. El modo thinking se desactivó durante el entrenamiento y la evaluación, y su comportamiento con thinking activado no ha sido verificado.

## Capacidades

- Generación de texto conversacional en japonés, con plantilla de chat Qwen3 Swallow embebida en los metadatos del GGUF.
- Reducción del exceso de rechazo en consultas educativas, científicas, periodísticas y creativas que contienen términos sensibles.
- Distinción contextual entre explicación educativa e instrucción dañina, entre investigación científica y aplicación práctica peligrosa, y entre escenario ficticio y acción real, según los principios de diseño declarados por el autor.
- Expresión de incertidumbre cuando la información es insuficiente, según la model card.
- Servido mediante API compatible con OpenAI a través de llama-server.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: limitadas al japonés según los metadatos del modelo.

## Casos de uso

- Investigación sobre over-refusal: el modelo permite comparar, con la misma batería de 25 ejemplos y clasificación automática por reglas, cuánto se reduce el rechazo frente al modelo base en temas sensibles.
- Evaluación de ajustes finos de bajo coste: sirve como referencia reproducible de un pipeline QLoRA + SFT con Unsloth y TRL sobre una T4, útil para estudiar qué modifica un dataset sintético de 54 ejemplos en un modelo de 8B.
- Inferencia local en japonés con llama.cpp: al distribuirse en GGUF con plantilla de chat incluida, se puede desplegar con llama-cli o llama-server en equipos sin GPU dedicada usando la variante Q4_K_M de 4,7 GB.
- Prototipado de asistentes conversacionales en japonés: la variante Q5_K_M (5,5 GB, la recomendada por el autor) permite levantar un endpoint compatible con OpenAI en 127.0.0.1:8080 para integrarlo en aplicaciones de prueba.
- Análisis de comportamiento en temas controvertidos: útil para estudiar cómo un ajuste fino modifica las respuestas ante peticiones periodísticas o de divulgación científica que contienen palabras clave sensibles.
- Docencia y divulgación sobre alineación: el modelo y su model card documentan explícitamente las limitaciones de un dataset sintético pequeño, lo que lo convierte en material didáctico sobre los riesgos de generalización en SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación documentada es una comparación contra el modelo base sobre 25 ejemplos, con clasificación automática por reglas y sin evaluación humana, cuyas categorías son `answer`, `answer_with_caveat` y otras no detalladas en la información proporcionada. No se ofrecen cifras numéricas de esa comparación.

## Requisitos de hardware

- VRAM/RAM estimada según la variante GGUF: Q4_K_M unos 4,7 GB, Q5_K_M unos 5,5 GB, Q8_0 unos 8,5 GB y F16 unos 16,4 GB, más el overhead del runtime y del contexto.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en una NVIDIA Tesla T4. Para inferencia, cualquier GPU con memoria suficiente para la cuantización elegida es apta.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q5_K_M en tarjetas de 8 GB o más; Q8_0 requiere aproximadamente 10-12 GB y F16 en torno a 18-20 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio u otros), aunque el autor solo documenta llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NOVA Uncensored Qwen3 Swallow 8B | 8,19B | no disponible | Apache 2.0 | GGUF | Ajuste fino experimental sobre 54 ejemplos sintéticos |
| tokyotech-llm/Qwen3-Swallow-8B-SFT-v0.2 | 8B | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors (modelo base) | Modelo base japonés de TokyoTech-LLM; referencia directa de comparación |
| Qwen3 8B (familia original) | 8B | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors, GGUF | Arquitectura de la que deriva Swallow; orientación multilingüe más amplia |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento de aproximadamente 54 ejemplos sintéticos basados en plantillas, sin verificación humana exhaustiva; los resultados pueden ser sensibles a ejemplos individuales.
- Generalización a temas no vistos no establecida, según el propio autor.
- Evaluación limitada a 25 ejemplos con clasificación automática por reglas y sin evaluación humana.
- Modo thinking desactivado en entrenamiento y evaluación; comportamiento con thinking activado no verificado.
- Riesgo de alucinación no cuantificado; no hay benchmarks que permitan estimarlo.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: solo japonés según los metadatos; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero el carácter experimental del ajuste y la ausencia de evaluación humana desaconsejan su uso en producción sin validación adicional.
- El objetivo de reducir rechazos implica un riesgo real de que el modelo responda a peticiones que deberían restringirse; requiere supervisión y filtros externos si se despliega.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nukonukomain/nova-uncensored-qwen3-swallow-8b-gguf
- Modelo base: https://huggingface.co/tokyotech-llm/Qwen3-Swallow-8B-SFT-v0.2
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- Hugging Face TRL: https://github.com/huggingface/trl
