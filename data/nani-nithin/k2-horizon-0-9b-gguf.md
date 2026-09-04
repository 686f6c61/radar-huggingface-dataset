# NANI-Nithin/K2-Horizon-0.9B-GGUF

## Resumen

K2-Horizon-0.9B es un modelo de lenguaje de tipo decodificador causal denso, con aproximadamente 1.078 millones de parámetros (anunciado como 0.9B), desarrollado por el Instituto de IA de MBZUAI (IFM) como parte de la familia K2 Horizon. Este repositorio concreto contiene cuantizaciones GGUF preparadas por NANI-Nithin, que permiten ejecutar el modelo en entornos locales mediante llama.cpp. La familia K2 Horizon está descrita por IFM como una flota de seis modelos de código abierto orientados a razonamiento, codificación, flujos de trabajo agénticos, dispositivos edge y despliegue empresarial.

El modelo base utiliza una arquitectura denominada `K2HorizonForCausalLM` (tipo `k2_horizon`), que no está soportada todavía por el llama.cpp oficial; por ello, estas cuantizaciones requieren un fork específico de MBZUAI-IFM. La relevancia de esta publicación radica en ofrecer un modelo compacto, con licencia Apache 2.0, en una amplia variedad de cuantizaciones (desde BF16 hasta Q1), lo que facilita su experimentación en hardware limitado. No se dispone de información sobre la longitud de contexto ni sobre el proceso de entrenamiento en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2HorizonForCausalLM (k2_horizon), decodificador causal denso |
| Parametros totales | 1.078.285.824 (~1,078B; anunciado como 0,9B) |
| Parametros activos | No aplica (modelo denso, sin MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, Q2_K_S, Q2_0, Q1_0, IQ4_NL, IQ4_XS, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original utiliza safetensors) |

## Arquitectura y entrenamiento

El modelo se implementa como un decodificador causal denso, sin mezcla de expertos (MoE), con la arquitectura `K2HorizonForCausalLM`. Esta arquitectura es un desarrollo propio de IFM y requiere un fork de llama.cpp para su ejecución, ya que el soporte no está integrado en el proyecto upstream a fecha de septiembre de 2026. La cuantización se ha realizado a partir del GGUF BF16 oficial de IFM, y se aplicaron matrices de importancia (imatrix) calculadas sobre el conjunto `Salesforce/wikitext` (500 filas) para las cuantizaciones por debajo de Q6 y para todas las IQ.

No se dispone de información en los datos proporcionados sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del soporte de la arquitectura en el fork de llama.cpp.

## Capacidades

- Generación de texto en inglés, con pipeline `text-generation` y etiqueta `conversational`.
- Según la descripción de la familia K2 Horizon, el modelo está orientado a razonamiento, codificación y flujos de trabajo agénticos, aunque no se han publicado benchmarks específicos para esta variante de 0.9B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no especificadas; la metadata solo indica inglés.
- Visión o audio: no disponible.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede integrarse en una aplicación de chat que se ejecute en un portátil o en un servidor ligero. Su tamaño compacto y las cuantizaciones disponibles (por ejemplo, Q4_K_M) permiten bajos requisitos de memoria, lo que lo hace adecuado para entornos sin acceso a la nube.
- Generación de código en entornos de desarrollo: la familia K2 Horizon está orientada a codificación, por lo que este modelo puede usarse para autocompletar fragmentos de código en editores como VS Code mediante llama.cpp, siempre que se acepte la limitación de un modelo pequeño.
- Prototipado de aplicaciones de IA: al ser un modelo de ~0.9B con licencia Apache 2.0, resulta útil para experimentar con generación de texto sin coste de API, validar prompts o construir demos rápidas.
- Despliegue en dispositivos edge: gracias a las cuantizaciones de 4 bits o inferiores, puede ejecutarse en dispositivos con recursos limitados (por ejemplo, Raspberry Pi o Jetson Nano) para tareas de generación de texto sin conexión, aprovechando el soporte de llama.cpp.
- Investigación de arquitecturas k2_horizon: el modelo base está diseñado para análisis de checkpoints y experimentación; este GGUF permite probar la arquitectura en llama.cpp y estudiar el efecto de la cuantización en la calidad de salida.
- Automatización de pruebas de generación de texto en CI/CD: al ser un modelo pequeño y ejecutable en CPU, puede incorporarse en pipelines de integración continua para validar respuestas de modelos, comparar cuantizaciones o verificar el comportamiento de prompts de forma automatizada.
- Educación sobre cuantización de modelos: la amplia variedad de cuantizaciones disponibles (desde Q1 hasta BF16) permite demostrar de forma práctica cómo afecta la compresión al tamaño y a la calidad de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

La siguiente estimación de VRAM se basa en el número de parámetros (1.078.285.824) y en los bits por peso de cada cuantización, sin incluir el overhead de la caché KV ni las activaciones:

| Cuantización | VRAM estimada de pesos |
|---|---|
| BF16 | ~2,2 GB |
| Q8_0 | ~1,1 GB |
| Q6_K | ~0,9 GB |
| Q5_K_M | ~0,7 GB |
| Q4_K_M | ~0,6 GB |
| Q3_K_M | ~0,5 GB |
| Q2_K | ~0,4 GB |

- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para cuantizaciones de 4 bits o inferiores; se recomienda una RTX 3050 o superior para un uso fluido. En CPU, puede ejecutarse con 1-2 GB de RAM libre.
- Sí cabe en GPU de consumo: las versiones Q4 y superiores funcionan en tarjetas de gama baja (por ejemplo, GTX 1650, RTX 3050) y en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (fork MBZUAI-IFM, branch `model/K2Horizon`). El modelo base puede servirse con vLLM según la receta oficial, pero el formato GGUF requiere llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con modelos similares en cuanto a rendimiento. El modelo es comparable en tamaño a otros modelos densos de ~1B (por ejemplo, Llama 3.2 1B o Qwen2.5-0.5B), pero no se han publicado datos de benchmarks ni de contexto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible; sin embargo, al ser un modelo pequeño entrenado principalmente en inglés, puede heredar sesgos de sus datos de entrenamiento.
- No se dispone de datos sobre la tasa de alucinación; como modelo compacto, se recomienda validar las salidas en aplicaciones críticas.
- El soporte de la arquitectura `k2_horizon` en llama.cpp depende de un fork no fusionado en el proyecto upstream, lo que puede afectar a la estabilidad y al mantenimiento a largo plazo.
- El repositorio de cuantización no tiene descargas ni validaciones externas, por lo que se recomienda probar el modelo antes de usarlo en producción.
- Las cuantizaciones extremas (Q2, Q1, IQ1) pueden degradar significativamente la calidad de las salidas.
- Solo se ha verificado el idioma inglés en la metadata; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar la licencia del modelo original para confirmar que no hay restricciones adicionales.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/NANI-Nithin/K2-Horizon-0.9B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- GGUF fuente: https://huggingface.co/IFM/K2-Horizon-0.9B-GGUF
- Fork de llama.cpp: https://github.com/MBZUAI-IFM/llama.cpp
- Blog de IFM sobre K2 Horizon: https://ifm.ai/blog/k2
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/IFM/K2-Horizon-0.9B
