# Loswen/Qwen3.6-35B-A3B-uncensored-heretic-IQ2_M

## Resumen

Qwen3.6-35B-A3B-uncensored-heretic-IQ2_M es una cuantización GGUF en formato IQ2_M del modelo llmfan46/Qwen3.6-35B-A3B-uncensored-heretic, un derivado de la familia Qwen 3.6 de Alibaba. El modelo original aplica una técnica de abliteración denominada Heretic, que elimina quirúrgicamente los comportamientos de rechazo del modelo base manteniendo intactas sus capacidades de razonamiento, generación de código y lenguaje. Según los datos publicados, consigue una reducción del 88 % en los rechazos (10/100 frente a 83/100 en el modelo original) con una divergencia KL de solo 0.0015 respecto al modelo sin modificar.

La cuantización está producida con el cuantizador oficial de llama.cpp y la matriz de importancia (imatrix) de Unsloth para la arquitectura Qwen3.6-35B-A3B-MTP. El formato IQ2_M es una cuantización dinámica que asigna automáticamente diferentes tipos de cuantización según la sensibilidad de cada tensor, lo que permite un mejor equilibrio entre calidad y tamaño que una cuantización uniforme. El archivo resultante ocupa 24,6 GB y es totalmente compatible con las versiones actuales de llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida |
| Parámetros totales | 34 660 610 688 (~34,7 B) |
| Parámetros activos | ~3 B (A3B) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | IQ2_M (dinámica/mixta, con tensores en IQ3 y superiores) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de 35 B parámetros con 3 B activos por token, diseñado por Alibaba para la familia Qwen3.6. El modelo base incorpora atención híbrida (combinación de atención completa y mecanismos lineales) y soporta una ventana de contexto de 262 144 tokens. La versión Heretic modifica únicamente un subconjunto relativamente pequeño de los pesos mediante abliteración, una técnica que localiza y neutraliza las direcciones del espacio de activaciones responsables de los rechazos, preservando el resto de capacidades del modelo.

La cuantización IQ2_M se realizó con el cuantizador oficial de llama.cpp, empleando la importancia matrix publicada por Unsloth para la arquitectura Qwen3.6-35B-A3B-MTP. La imatrix no modifica los pesos, sino que sirve como artefacto de calibración durante la cuantización para asignar los bits disponibles de forma más eficiente. Al tratarse de una cuantización dinámica, algunos tensores se almacenan en formatos de mayor precisión (por ejemplo, variantes IQ3) mientras que otros se mantienen en IQ2, optimizando la relación calidad-tamaño. No se han aplicado recetas de cuantización experimentales ni overrides personalizados.

## Capacidades

- Generación de texto y razonamiento de propósito general, con capacidades preservadas del modelo base Qwen3.6-35B-A3B.
- Generación de código y soporte para tareas de programación, incluyendo completado de código y depuración.
- Capacidad de razonamiento matemático y lógico multi-paso.
- Soporte de tool calling y function calling, habilitando integraciones con APIs externas.
- Capacidades de agente y razonamiento multi-paso, útil para flujos de trabajo autónomos.
- Comportamiento de rechazo reducido: el modelo responde a peticiones que el modelo base rechazaría, útil para casos de uso que requieren respuestas directas y sin censura.
- Soporte multilingüe heredado del modelo base (los idiomas concretos no se especifican en la documentación disponible).

## Casos de uso

- Investigación de seguridad y alineación: permite estudiar cómo la ablación de rechazos afecta al comportamiento del modelo, comparando respuestas entre la versión original y la Heretic en escenarios de riesgo.
- Desarrollo de asistentes de código con respuestas directas: al no rechazar peticiones sobre código ofensivo o de doble uso, puede integrarse en entornos de desarrollo donde el modelo base bloquearía consultas legítimas sobre vulnerabilidades o técnicas de ataque.
- Análisis de robustez y sesgos: útil para auditar el impacto de la eliminación de rechazos en la calidad de las respuestas y la deriva de comportamiento.
- Inferencia en entornos con recursos limitados: el formato IQ2_M de 24,6 GB permite ejecutar el modelo en hardware modesto, incluidas CPUs con suficiente RAM o GPUs de consumo con 24 GB de VRAM.
- Prototipado rápido de aplicaciones conversacionales: gracias a su licencia Apache 2.0 y su compatibilidad con llama.cpp, puede desplegarse en servidores locales sin costes de licencia.
- Evaluación de calidad de cuantización: el uso de imatrix de Unsloth y la cuantización dinámica IQ2_M permite comparar la degradación de calidad frente a cuantizaciones de mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card solo indica la métrica de reducción de rechazos (88 %) y la divergencia KL (0,0015) respecto al modelo original, pero no aporta resultados de evaluaciones estándar como MMLU, HumanEval o GSM8K para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 24,6 GB en disco. Para inferencia en GPU, se recomienda al menos 24 GB de VRAM para cargar el modelo completo sin offloading.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB, H100 o superiores. También es posible ejecutarlo en GPU de 16 GB con offloading parcial a CPU.
- En CPU: con llama.cpp y suficiente RAM (32 GB o más) puede ejecutarse a velocidades moderadas, aunque la inferencia será más lenta.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI) con adaptadores GGUF.
- Latencia y throughput: no se han publicado datos específicos para esta cuantización. Como referencia, al ser un modelo MoE con solo 3 B activos por token, la latencia de generación es significativamente menor que la de un modelo denso de 35 B.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-uncensored-heretic-IQ2_M | 34,7 B | 3 B | 262 K | IQ2_M (24,6 GB) | Apache 2.0 |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic | 34,7 B | 3 B | 262 K | BF16 (original) | Apache 2.0 |
| Qwen/Qwen3.6-35B-A3B (base) | 34,7 B | 3 B | 262 K | BF16 | Apache 2.0 |
| SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF | 34,7 B | 3 B | 262 K | GGUF (APEX) | Apache 2.0 |

La diferencia principal entre esta cuantización y la original BF16 es la reducción de tamaño (24,6 GB frente a ~70 GB) a costa de una pérdida de precisión inherente a la cuantización IQ2_M. Frente a otras cuantizaciones de la misma familia (por ejemplo, las que preservan el módulo MTP nativo), esta versión utiliza la imatrix de Unsloth para optimizar la asignación de bits.

## Limitaciones y advertencias

- La cuantización IQ2_M es muy agresiva (2 bits efectivos por peso) y puede degradar la calidad de las respuestas en tareas complejas, especialmente en matemáticas y razonamiento lógico avanzado.
- El modelo está diseñado para reducir rechazos, lo que implica que puede generar contenido inapropiado, ofensivo o peligroso si se le solicita. No es adecuado para despliegues en producción sin moderación o salvaguardas adicionales.
- Los idiomas soportados no están documentados; aunque el modelo base de Qwen3.6 es multilingüe, la cuantización puede afectar al rendimiento en idiomas de baja representación.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad del contenido generado recae en el desplegador.
- No se han publicado resultados de benchmarks para esta cuantización, por lo que no es posible evaluar su rendimiento frente a otras variantes de forma objetiva.
- La matriz de importancia utilizada proviene de la versión MTP del modelo base, no de la versión Heretic. Aunque la arquitectura es idéntica, la ablación de pesos podría afectar la calibración óptima.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Loswen/Qwen3.6-35B-A3B-uncensored-heretic-IQ2_M)
- [Modelo original: llmfan46/Qwen3.6-35B-A3B-uncensored-heretic](https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic)
- [Versión con MTP preservado: SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF](https://huggingface.co/SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF)
- [Qwen3.6-35B-A3B Uncensored: análisis en HackerNoon](https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context)
- [Qwen3.6-35B-A3B Uncensored / Abliterated Deep Dive (oflight.co.jp)](https://www.oflight.co.jp/en/columns/qwen36-35b-a3b-uncensored-abliterated-2026-07)
- [Guía para ejecutar Qwen3.6-35B Uncensored localmente (aiindigo.com)](https://aiindigo.com/tutorials/running-qwen3-6-35b-uncensored-local-setup-multimodal-usage)
