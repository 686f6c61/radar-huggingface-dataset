# gautamabhish/aether-10m

## Resumen

AETHER-10M es un modelo de lenguaje experimental de 8,4 millones de parámetros desarrollado por gautamabhish, presentado como una arquitectura "post-Transformer" que busca superar las limitaciones de memoria y energía de la atención estándar. Según su model card, combina flujos asociativos unitarios (phasor) con un deliberador simpléctico tipo leapfrog, logrando un estado recurrente de memoria constante O(1) y una reducción de consumo energético de más de 200 veces frente a un transformer clásico. El modelo está pensado para investigación en eficiencia de arquitecturas, no para uso productivo, y se distribuye bajo licencia MIT con código personalizado que requiere `trust_remote_code=True`.

La relevancia actual radica en la búsqueda de alternativas a los transformers que reduzcan el coste de la ventana de contexto y el uso de memoria en dispositivos edge. Sin embargo, al tratarse de un modelo de solo 8,4 millones de parámetros y sin publicaciones externas verificadas, sus resultados deben considerarse preliminares y no contrastados por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Post-transformer con flujos unitarios fasoriales (U(1)^D) y deliberador simpléctico leapfrog |
| Parametros totales | 8.396.864 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura, descrita en la model card, se compone de tres bloques principales: una capa de ingesta que codifica los tokens en ángulos de fase complejos mediante una transformación unitaria, un deliberador simpléctico que actualiza el estado usando dinámica hamiltoniana con preservación de volumen de Liouville, y una red feedforward con puertas. El estado recurrente se mantiene constante en memoria, independientemente de la longitud de la secuencia, lo que contrasta con el crecimiento lineal de los transformers.

No se proporcionan datos sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni uso de RLHF o DPO. La model card solo menciona que el modelo se carga con `trust_remote_code=True` y que se puede evaluar con `lm-evaluation-harness`. No hay información sobre el hardware utilizado ni la duración del entrenamiento.

## Capacidades

- Generación de texto autoregresiva, como cualquier modelo de lenguaje causal.
- Razonamiento simbólico básico: según la model card, obtiene resultados en tareas como ListOps jerárquico, aritmética con acarreo, trazado de código VM y enlazado de ámbito de variables en AST de Python.
- Capacidad multilingüe limitada: solo se declara inglés.
- No se menciona soporte para tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Al ser un modelo de 8,4 millones de parámetros, su capacidad de razonamiento complejo es muy limitada en comparación con modelos de mayor escala.

## Casos de uso

- Investigación en arquitecturas eficientes: sirve como banco de pruebas para validar conceptos de memoria constante y bajo consumo energético en secuencias largas, sin necesidad de grandes recursos de cómputo.
- Prototipado de sistemas de generación de texto en dispositivos con recursos mínimos, como microcontroladores o sensores, gracias a su tamaño reducido y a la afirmación de que cabe en SRAM on-chip.
- Evaluación comparativa de arquitecturas no transformer: permite contrastar métricas de rendimiento y eficiencia frente a modelos de tamaño similar (por ejemplo, Mamba-10M) en tareas de razonamiento sintético.
- Docencia y divulgación: útil para explicar conceptos de flujos simplécticos, unitariedad y memoria recurrente en cursos de aprendizaje profundo avanzado.
- Experimentación con `trust_remote_code`: sirve como ejemplo de integración de arquitecturas personalizadas en el ecosistema Hugging Face Transformers.
- Pruebas de concepto en edge computing: su bajo consumo energético declarado (0,12 nJ por token) lo hace candidato para experimentos de inferencia en hardware de bajo consumo, aunque no hay mediciones independientes.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos para tareas de razonamiento, junto con métricas de memoria y energía. Estos datos provienen exclusivamente del autor y no han sido verificados por terceros. Se reproducen a continuación con esa advertencia.

| Tarea | Transformer-10M | SSM/Mamba-10M | AETHER-10M |
|---|---|---|---|
| ListOps jerárquico (accuracy) | 22,5% | 52,0% | 47,5% |
| Aritmética multi-dígito con acarreo | 100,0% | 93,0% | 94,5% |
| Trazado de código VM | 80,4% | 76,8% | 80,6% |
| Enlazado de ámbito en AST Python | 100,0% | 75,0% | 75,0% |
| Precisión de tokens BPE | 97,0% | 97,9% | 96,6% |

Además, se reporta una reducción de memoria de estado de 640× frente a un transformer estándar a contexto 2048, y una reducción de energía por token de 204×. No se han publicado resultados en benchmarks estándar como MMLU, GSM8K o HumanEval en la información disponible.

## Requisitos de hardware

- Con 8,4 millones de parámetros, el modelo ocupa aproximadamente 33,6 MB en FP32 (8,4 M × 4 bytes). Cabe en cualquier GPU comercial, incluso en las más modestas, y también en CPU.
- La model card afirma que el estado recurrente cabe completamente en SRAM on-chip, lo que permitiría ejecutarlo en hardware de muy bajo consumo, aunque no se especifican plataformas concretas.
- Para inferencia, se puede usar el pipeline estándar de Transformers con `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Dado su tamaño, la latencia es despreciable en hardware moderno; el cuello de botella sería la carga del código personalizado y la inicialización.
- No se proporcionan mediciones de throughput ni latencia en la documentación.

## Comparativa con modelos similares

La comparativa se basa en los datos de la model card, que enfrenta a AETHER-10M con un transformer de 10M y un SSM/Mamba de 10M. No hay información independiente sobre otros modelos de ese tamaño.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (ListOps) | Memoria de estado (N=2048) |
|---|---|---|---|---|---|
| AETHER-10M | 8,4 M | No disponible | MIT | 47,5% | 48 KB |
| Transformer-10M (referencia) | ~10 M | No disponible | No especificada | 22,5% | 30,7 MB |
| SSM/Mamba-10M (referencia) | ~10 M | No disponible | No especificada | 52,0% | 384 KB |

No se dispone de comparativas con modelos actuales de tamaño similar (por ejemplo, GPT-2 pequeño tiene 124 M, no es comparable). La información es insuficiente para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Modelo experimental sin validación externa: los resultados de la model card no han sido replicados por la comunidad ni publicados en conferencias o revistas revisadas por pares.
- Riesgo de alucinación y errores de razonamiento: al ser un modelo muy pequeño, su capacidad de generar texto coherente y veraz es limitada.
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; supone un riesgo de seguridad si no se audita previamente.
- Idioma limitado: solo se declara inglés; no hay soporte multilingüe.
- Longitud de contexto no especificada: se desconoce el número máximo de tokens que puede procesar, aunque la arquitectura de memoria constante sugiere que podría manejar secuencias largas, pero no hay evidencia empírica.
- Licencia MIT permite uso comercial, pero al ser un modelo sin garantías y con posibles problemas de sesgo, no se recomienda para aplicaciones de producción sin una evaluación exhaustiva.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o filtros de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gautamabhish/aether-10m
- No se han encontrado papers, repositorios adicionales o demos oficiales más allá de la propia model card. Los resultados de búsqueda web sobre "Aether" corresponden a proyectos distintos (world modeling, robótica) y no están relacionados con este modelo.
