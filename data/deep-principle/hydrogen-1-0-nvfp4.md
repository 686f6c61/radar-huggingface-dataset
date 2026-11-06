# deep-principle/Hydrogen-1.0-NVFP4

## Resumen

Hydrogen-1.0-NVFP4 es la versión cuantizada en NVFP4 de Hydrogen-1.0, un modelo de generación de texto orientado a la resolución de problemas científicos y a la asistencia en investigación, desarrollado por Deep Principle. El modelo parte de GLM-5.3, de zai-org, y se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integración en herramientas de investigación. Esta variante concreta del repositorio contiene únicamente los pesos cuantizados en NVFP4, pensados para ejecutarse en hardware NVIDIA Blackwell.

La relevancia de esta ficha radica en que combina una ventana de contexto declarada de 1M de tokens (con un máximo de salida de 128K) con una cuantización agresiva a 4 bits que reduce los requisitos de memoria frente a la versión BF16. El autor indica que el modelo ha sido probado en 8 GPU NVIDIA B300 con SGLang, y ofrece también una variante MXFP4 para AMD Instinct. No se publican detalles sobre arquitectura interna, número de parámetros ni composición del dataset de entrenamiento.

Deep Principle no divulga los métodos, procedimientos ni datos de entrenamiento de Hydrogen-1.0, por lo que la información disponible se limita a la model card y a la configuración de despliegue. La evaluación declarada se centra en preguntas científicas de opción múltiple y en problemas de investigación abiertos, sin que se hayan publicado resultados numéricos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-5.3; se mencionan expertos routed y shared, MLP densos y capa MTP, lo que sugiere una arquitectura MoE, sin confirmación explícita) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens declarados; 262144 tokens en el ejemplo de despliegue con SGLang |
| Longitud maxima de salida | 128K tokens |
| Tipos de cuantizacion | NVFP4 (expertos routed y shared, con escalas de activación calibradas); FP8 en MLP densos de capas 0-2; KV cache FP8; BF16 en atención, router, embeddings, lm_head y capa MTP. Existe también versión BF16 y versión MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | checkpoint NVFP4 exportado con NVIDIA ModelOpt (incluye `hf_quant_config.json`, `config.json`, `generation_config.json`, tokenizer y chat template) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de referencias indirectas. La configuración de cuantización menciona expertos routed y shared, MLP densos en las capas 0-2, un router, embeddings, lm_head y una capa MTP (multi-token prediction), lo que apunta a un transformer con mezcla de expertos (MoE) y decodificación especulativa mediante MTP, aunque el autor no lo confirma explícitamente. El modelo deriva de GLM-5.3, de zai-org.

Deep Principle declara que no divulga públicamente los métodos, procedimientos ni datos de entrenamiento de Hydrogen-1.0, ni el número de tokens utilizados, ni si hubo RLHF, DPO u otras fases de alineamiento. La cuantización se realizó con NVIDIA ModelOpt: los expertos routed y shared se almacenan en NVFP4 con escalas de activación calibradas, los MLP densos de las capas 0-2 en FP8, la caché KV en FP8, y la atención, el router, los embeddings, el lm_head y la capa MTP permanecen en BF16. Los archivos `hf_quant_config.json` y `config.json` documentan este esquema y SGLang necesita ambos para cargar el checkpoint.

## Capacidades

- Generación de texto orientada a preguntas científicas, explicación de derivaciones y organización de respuestas a problemas de investigación abiertos.
- Razonamiento multi-paso sobre problemas científicos, con soporte de parser de razonamiento (`--reasoning-parser glm45`) en SGLang.
- Soporte de tool calling / function calling, con parser específico (`--tool-call-parser glm47`).
- Ventana de contexto declarada de 1M tokens y hasta 128K tokens de salida, sujeta al presupuesto de contexto desplegado.
- Capacidades multilingües: no se especifican los idiomas soportados; la model card incluye una versión en chino del README, pero no confirma el soporte de idiomas.
- Capacidad de decodificación especulativa mediante capa MTP (multi-token prediction).
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Asistencia en investigación científica: el modelo puede explicar ecuaciones, derivaciones y supuestos, y proponer enfoques de solución para problemas abiertos, gracias a su contexto declarado de 1M tokens que permite incorporar literatura extensa en la misma conversación.
- Revisión de manuscritos y borradores técnicos: con hasta 128K tokens de salida, puede generar borradores estructurados de secciones metodológicas o discusiones para revisión posterior por expertos.
- Tutoría y exploración educativa: responde preguntas científicas de opción múltiple y problemas abiertos, adecuado para entornos de formación donde el usuario valida las respuestas con fuentes primarias.
- Despliegue en infraestructura Blackwell: la cuantización NVFP4 permite servir el modelo en 8 GPU B300 con SGLang, reduciendo el coste de memoria frente a BF16 para equipos con hardware NVIDIA de última generación.
- Integración como herramienta de agente científico: el soporte de tool calling y de parser de razonamiento permite encadenar llamadas a calculadoras simbólicas, bases de datos bibliográficas o motores de experimentación dentro de un pipeline multi-paso.
- Estudio del comportamiento de modelos cuantizados: investigadores pueden comparar las salidas de la variante NVFP4 con las de BF16 y MXFP4 para analizar el impacto de la cuantización en tareas científicas.
- Procesamiento de documentación técnica extensa: con contexto largo, puede resumir y organizar respuestas a partir de corpus de artículos, patentes o informes técnicos, siempre con verificación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la evaluación se centra en preguntas científicas de opción múltiple y en problemas de investigación abiertos, sin ofrecer cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica el número de parámetros ni el tamaño del checkpoint, por lo que no puede calcularse una estimación fiable.
- GPU recomendadas: NVIDIA Blackwell, probado por el equipo en 8x NVIDIA B300. La variante NVFP4 requiere un runtime compatible con NVIDIA Blackwell.
- Cabe en GPU consumer: no disponible; no se especifica. La cuantización NVFP4 requiere soporte de hardware Blackwell, lo que excluye generaciones anteriores de GPU consumer.
- Opciones de despliegue: SGLang con `--quantization modelopt_fp4` y `--kv-cache-dtype fp8_e4m3`. El ejemplo del autor usa `--tp 8 --trust-remote-code --context-length 262144 --mem-fraction-static 0.85 --chunked-prefill-size 16384`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.
- Nota: el comando de ejemplo limita el contexto desplegado a 262144 tokens; no habilita los 1M declarados. Ampliar el límite requiere soporte del runtime y memoria suficiente. Debe mantenerse junto el tokenizer, la chat template, `generation_config.json`, las configuraciones del modelo y de cuantización, y el índice de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hydrogen-1.0-NVFP4 | no disponible | 1M declarados (262144 en ejemplo) | NVFP4 + FP8 + BF16 | MIT | Hugging Face |
| Hydrogen-1.0 (BF16) | no disponible | 1M declarados | BF16 | MIT | Hugging Face |
| Hydrogen-1.0-MXFP4 | no disponible | 1M declarados | MXFP4 | MIT | Hugging Face |
| GLM-5.3 (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (zai-org) |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo puede producir hechos, cálculos, ecuaciones, referencias o explicaciones científicas incorrectas; una respuesta detallada o segura no garantiza su corrección. Deben verificarse las afirmaciones clave con literatura primaria, cálculos independientes o experimentos.
- El rendimiento puede variar entre disciplinas, idiomas, formatos de tarea y longitudes de entrada. Los datos de entrenamiento pueden introducir sesgos de selección, culturales o lingüísticos.
- La capacidad de contexto largo no garantiza la recuperación, comprensión o uso fiable de cada detalle del input.
- La cuantización NVFP4 puede afectar a las salidas; el autor no declara una medición del cambio de precisión para esta versión, por lo que debe validarse para la tarea prevista.
- Las salidas no deben tratarse como hallazgos experimentales verificados ni como base suficiente para decisiones que afecten a la salud, la seguridad u otros resultados consecuentes.
- El comando de despliegue de ejemplo limita el contexto a 262144 tokens; los 1M declarados requieren configuración adicional y memoria suficiente.
- No se especifican los idiomas soportados, lo que dificulta evaluar su idoneidad para usuarios hispanohablantes.
- Aunque la licencia es MIT, debe revisarse el archivo LICENSE del repositorio y las condiciones del modelo base GLM-5.3 para usos comerciales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/deep-principle/Hydrogen-1.0-NVFP4
- Versión BF16: https://huggingface.co/deep-principle/Hydrogen-1.0
- Versión MXFP4: https://huggingface.co/deep-principle/Hydrogen-1.0-MXFP4
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Contacto del autor: info@deepprinciple.com
