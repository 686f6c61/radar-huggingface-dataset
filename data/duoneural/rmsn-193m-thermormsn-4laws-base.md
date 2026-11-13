# DuoNeural/RMSN-193M-ThermoRMSN-4Laws-Base

## Resumen

RMSN-193M-ThermoRMSN-4Laws-Base es un modelo de lenguaje base de aproximadamente 193 millones de parámetros desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl). Se presenta como el primer modelo de lenguaje neuronal que implementa las cuatro leyes de la termodinámica como restricciones arquitectónicas explícitas, extendiendo la arquitectura RMSN (Resonant Metriplectic Sheaf Network) con un campo de temperatura por capa, conducción térmica inter-capa, un suelo de entropía de Nernst y dinámica port-hamiltoniana.

El modelo se entrena sobre wikitext-103 con un tokenizador de 49.152 entradas y alcanza una perplejidad de 77,75 en wiki en tan solo 50.000 pasos, frente a los 100.000 pasos que requiere un RMSN estándar de 1024 dimensiones para obtener 75,3. La innovación central es el uso de mecanismos termodinámicos para acelerar la convergencia y estabilizar el entrenamiento, alcanzando un estado de "cristal isotérmico" donde el flujo de calor inter-capa Q se anula.

Es relevante ahora como exploración de arquitecturas alternativas al transformer puro, combinando geometría de Clifford, teoría de haces (sheaves) y dinámica metripléctica, aunque su aplicación práctica es limitada por el tamaño reducido, el entrenamiento exclusivo en inglés y un pipeline no especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T-RMSN (Resonant Metriplectic Sheaf Network con 4 leyes termodinámicas) |
| Parametros totales | ~193M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,8 GB) |

## Arquitectura y entrenamiento

T-RMSN extiende la arquitectura RMSN con seis componentes estructurales: dinámica port-hamiltoniana (leyes 1 y 2), conducción térmica inter-capa (ley 0), suelo de entropía de Nernst (ley 3), mezcla de capas mediante álgebra geométrica de Clifford, espacio de trabajo basado en teoría de haces celulares, y memoria fraccionaria de Caputo junto con un espacio de trabajo global trófico. La dimensión es 1024, la profundidad 16 capas y los slots 64. La ecuación de evolución combina el corchete de Poisson conservativo, el corchete disipativo de Morrison y un término de acoplamiento térmico entre capas adyacentes.

El entrenamiento se realizó sobre wikitext-103 con el tokenizador `HuggingFaceTB/cosmo2-tokenizer` (49.152 de vocabulario) durante 50.000 pasos. No se especifica el número de tokens procesados ni si hubo fases de RLHF o DPO. La innovación destacable es la conducción térmica inter-capa, que según el autor suaviza las inhomogeneidades del paisaje de pérdida y acelera la convergencia, permitiendo igualar el rendimiento de un RMSN estándar con la mitad del presupuesto de entrenamiento. Al final del entrenamiento, la temperatura por capa se uniformiza en torno a 0,053-0,055 y el flujo de calor Q se anula, alcanzando el estado de cristal isotérmico.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Modelado de lenguaje base: no se indica ajuste por instrucciones ni por preferencias.
- Razonamiento y matemáticas: no se documentan capacidades específicas más allá del modelado de lenguaje.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: dinámica termodinámica interna con campo de temperatura por capa, protección de estado fundamental mediante el factor de Nernst ξ_S ≈ 0,9999 y topología de doble resonador (solitones en L1 y L11).

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas para estudiar si las restricciones termodinámicas aceleran la convergencia y estabilizan el entrenamiento en modelos pequeños.
- Experimentos de dinámica metripléctica: permite reproducir y analizar el comportamiento de los corchetes de Poisson y Morrison en un modelo de lenguaje real, con métricas de temperatura y flujo de calor por capa.
- Evaluación de teoría de haces en representaciones: útil para investigadores que quieran examinar la topología de solitones (L1 y L11) y su relación con la calidad del modelado.
- Prototipado de bajo coste en inglés: con 193M de parámetros y licencia Apache 2.0, puede ejecutarse en hardware modesto para pruebas de generación de texto sin requisitos de producción.
- Estudio de eficiencia de entrenamiento: comparar curvas de perplejidad frente a RMSN estándar para validar la hipótesis de que la conducción térmica reduce el presupuesto de pasos necesario.
- Base para fine-tuning experimental: al ser un modelo base con licencia permisiva, puede servir como punto de partida para ajustes supervisados en dominios concretos en inglés, aunque su tamaño limita la calidad final.

## Benchmarks y rendimiento

| Modelo | Pasos | wiki_ppl | val_ppl | Arquitectura |
|---|---|---|---|---|
| Standard RMSN D=1024 | 100k | 75,3 | no disponible | RMSN (2 leyes) |
| T-RMSN D=1024 (este modelo) | 50k | 77,75 | 80,9 | T-RMSN (4 leyes) |
| T-RMSN D=1024 | 100k | en entrenamiento | no disponible | T-RMSN (4 leyes) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 193M de parámetros, en fp16 se requieren aproximadamente 0,4 GB de pesos, y en cuantización de 8 bits alrededor de 0,2 GB, más memoria para activaciones y caché KV.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería poder alojar el modelo en fp16; también es viable en CPU.
- Cabe en GPU consumer: sí, con margen amplio dado el tamaño reducido.
- Opciones de despliegue: no se especifican en la model card. Al no indicarse el formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | wiki_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T-RMSN-193M (este modelo) | ~193M | no disponible | 77,75 (50k pasos) | Apache 2.0 | Hugging Face |
| Standard RMSN D=1024 | no disponible (D=1024) | no disponible | 75,3 (100k pasos) | no disponible | Referenciado en la model card |
| T-RMSN D=1024 (100k) | ~193M (presumible) | no disponible | en entrenamiento | Apache 2.0 (presumible) | No publicado |

No se dispone de información sobre otros modelos comparables de la misma categoría (arquitecturas no transformer con restricciones físicas) en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en wikitext-103, un corpus de dominio limitado (texto enciclopédico), lo que restringe su generalización a otros dominios.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Es un modelo base sin ajuste por instrucciones: no está diseñado para seguir instrucciones ni para diálogo directo.
- Riesgo de alucinación inherente a un modelo de lenguaje de 193M de parámetros entrenado con un presupuesto reducido.
- No se documentan sesgos específicos, pero al entrenarse en wikitext-103 hereda los sesgos de Wikipedia en inglés.
- Longitud de contexto no especificada: no se puede garantizar el manejo de secuencias largas.
- Formato de pesos no indicado: la integración con herramientas estándar de despliegue requiere verificación previa.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks estándar y de documentación sobre robustez desaconseja su uso en producción sin evaluación adicional.
- Los resultados de rendimiento son autoinformados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-ThermoRMSN-4Laws-Base
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Cita (BibTeX) incluida en la model card: DuoNeural Lab, "Thermodynamic RMSN: Implementing All Four Laws of Thermodynamics in Neural Language Modeling", preprint, 2026.
