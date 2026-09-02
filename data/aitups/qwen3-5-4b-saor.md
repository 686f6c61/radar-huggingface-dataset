# aitups/Qwen3.5-4B-saor

## Resumen

`aitups/Qwen3.5-4B-saor` es una variante podada (sparse) del modelo denso `Qwen/Qwen3.5-4B`, desarrollada por el usuario aitups. El modelo aplica poda por magnitud (top-|w|) sobre los bloques FFN, siguiendo un perfil de densidad por capa optimizado mediante CMA-ES con un genoma CPPN como generador indirecto. El resultado es un modelo con una divergencia KL de 0.0638 respecto al original (con n_pos=4), lo que indica una pérdida de fidelidad relativamente baja para una compresión significativa.

La relevancia de este modelo radica en que ofrece una alternativa más ligera al Qwen3.5-4B original, pensada para entornos con recursos limitados (GPU de baja VRAM, CPU, dispositivos edge). Los pesos activos se re-empaquetan en cuantización Q4_K y la adyacencia se almacena en formato GGUF disperso D16, lo que permite ejecutarlo con el runtime Hayai, que soporta este formato nativamente. La arquitectura base es un transformer denso de 33 bloques FFN `[2560 → 9216]`, con un total de 4.345.816.832 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con FFN podados por magnitud (sparse) |
| Parametros totales | 4.345.816.832 |
| Parametros activos | No disponible (la densidad varía por capa según el perfil) |
| Longitud de contexto | No especificado en la model card; el base Qwen3.5-4B soporta 262.144 tokens (segun fuentes externas) |
| Tipos de cuantizacion | Q4_K (pesos activos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF disperso D16 (`ffn_dag_adjacency` + `ffn_dag_weights`) |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.5-4B original, un transformer denso con 33 bloques FFN de dimensiones `[2560 → 9216]`. La poda se realiza por magnitud: se eliminan las conexiones con mayor valor absoluto de peso (`top-|w|`) hasta alcanzar una densidad objetivo por capa. El perfil de densidad no es uniforme, sino que se optimiza mediante un bucle evolutivo (SAOR) que usa CMA-ES sobre un genoma CPPN (Compositional Pattern Producing Network) como generador indirecto. Este perfil concentra la esparsidad en las capas intermedias (pico de densidad ~0.16) y mantiene casi densas las capas iniciales y finales, reduciendo la divergencia KL frente a una poda uniforme equivalente (KL 0.108 para sp=0.10 uniforme frente a KL 0.0638 del perfil optimizado).

No hay entrenamiento adicional (fine-tuning) ni RLHF; el proceso es exclusivamente de poda y re-empaquetado de pesos. Los pesos supervivientes se cuantizan a Q4_K y la estructura de adyacencia se codifica en formato GGUF disperso D16, que almacena la adyacencia del grafo FFN (`ffn_dag_adjacency`) y los pesos (`ffn_dag_weights`). El modelo se ejecuta con el runtime Hayai, que interpreta este formato y permite inferencia en dispositivos con OpenCL.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Qwen3.5-4B base, incluyendo razonamiento de varios pasos y comprensión de instrucciones complejas.
- Multimodalidad: el modelo base es multimodal (visión-lenguaje), aunque la model card no confirma si esta capacidad se mantiene íntegra tras la poda.
- Soporte de agentes y tool calling: el base soporta flujos de agente y llamada a herramientas; la poda puede afectar la precisión en estas tareas.
- Capacidades multilingües: no especificadas para este modelo concreto; el base es multilingüe.
- Ejecución eficiente: gracias al formato disperso y la cuantización Q4_K, el modelo puede ejecutarse en hardware con recursos limitados, manteniendo una huella de memoria reducida.
- Compatibilidad con Hayai: el modelo está diseñado para ejecutarse con el runtime Hayai, que aprovecha la estructura dispersa para acelerar la inferencia.

## Casos de uso

- Inferencia en dispositivos edge: el archivo GGUF de ~2.8 GB y el formato disperso permiten ejecutar el modelo en placas como Jetson, Raspberry Pi con acelerador o GPUs integradas, donde un modelo denso no cabría.
- Asistentes conversacionales locales: se puede desplegar como chatbot privado en un portátil o mini-PC, manteniendo la conversación multi-turno sin depender de la nube.
- Generación de texto en tiempo real: la reducción de parámetros activos y la cuantización Q4_K reducen la latencia de generación, adecuado para aplicaciones de streaming de texto.
- Prototipado y desarrollo: al ser Apache 2.0, permite experimentar con el modelo en entornos de desarrollo sin restricciones de uso comercial.
- Evaluación de técnicas de poda: el modelo sirve como caso de estudio para comparar estrategias de esparsidad (poda por magnitud con perfil CPPN frente a poda uniforme) y medir el impacto en la calidad.
- Despliegue en entornos con restricciones de memoria: en servidores con múltiples modelos cargados, la menor huella de este modelo permite multiplexar más instancias en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para este modelo en la información disponible. La única métrica de fidelidad proporcionada es la divergencia KL respecto al modelo base:

| Metrica | Valor |
|---|---|
| Divergencia KL (vs base, n_pos=4) | 0.0638 |
| Compresion D_arch (gate / modelo) | 0.0965 / 0.0333 |
| KL de referencia (poda uniforme sp=0.10) | 0.108 |

Estos datos indican que el perfil de esparsidad optimizado reduce la divergencia a menos de dos tercios de la poda uniforme equivalente, pero no se dispone de métricas de calidad en tareas concretas.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa ~2.8 GB, por lo que en inferencia con Q4_K se requieren aproximadamente 3-4 GB de VRAM (incluyendo overhead de contexto y activaciones). En CPU, se necesitan al menos 4 GB de RAM libre.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650/1660, RTX 3050/3060, o GPUs integradas con soporte OpenCL (Intel Iris Xe, AMD Radeon Vega). El modelo base corre en 8 GB VRAM, pero este podado es más ligero.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales con 4-6 GB.
- Opciones de despliegue: el runtime principal es Hayai (https://github.com/hayai-org/hayai), que soporta el formato GGUF disperso D16 y OpenCL. No se menciona compatibilidad con llama.cpp, Ollama o vLLM en la model card.
- Latencia y throughput: no se proporcionan datos concretos. La poda reduce el número de operaciones por capa, lo que debería mejorar la velocidad en comparación con el modelo denso, pero depende del hardware y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (base, denso) | 4.345.816.832 | 262.144 | safetensors, GGUF | Apache 2.0 | Modelo original sin poda, mayor calidad pero mayor coste computacional |
| Qwen3.5-4B-saor (este) | 4.345.816.832 (esparso) | No especificado | GGUF D16 | Apache 2.0 | Podado, menor huella, requiere Hayai |
| Poda uniforme sp=0.10 (referencia) | 4.345.816.832 (esparso) | No aplica | No aplica | No aplica | Dato teórico con KL 0.108, peor que el perfil optimizado |

La comparación directa con otros modelos de 4B (como Llama-3.2-3B o Gemma-3-4B) no es posible sin benchmarks propios, pero el modelo base Qwen3.5-4B ya supera a Qwen3-30B en MMLU-Pro según fuentes externas, lo que sugiere que su versión podada puede mantener un rendimiento competitivo en tareas sencillas.

## Limitaciones y advertencias

- La poda introduce una degradación medible: la divergencia KL de 0.0638 implica que las salidas pueden diferir del modelo base, especialmente en tareas que requieren precisión numérica o razonamiento largo.
- El formato GGUF disperso D16 solo es compatible con el runtime Hayai; no funcionará con herramientas estándar como llama.cpp, Ollama o LM Studio sin modificaciones.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo; hereda los riesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente al modelo base Qwen3.5-4B y a este trabajo de poda.
- No se especifica la longitud de contexto efectiva tras la poda; es posible que la esparsidad afecte a la atención a largo plazo, aunque no hay datos al respecto.
- El modelo está pensado para un caso de uso concreto (inferencia eficiente); no es adecuado como reemplazo directo del original en producción si se requiere la máxima calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitups/Qwen3.5-4B-saor
- Repositorio de Hayai (runtime): https://github.com/hayai-org/hayai
- Modelo base Qwen3.5-4B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
- Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Qwen3.5 4B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-4b/
- Qwen3.5 4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Guía de Qwen3.5 4B en The AI Bench: https://theaibench.ai/models/qwen-3-5-4b/
