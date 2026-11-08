# MatterWaveAI/s1-grt-rnn-b0.7.0-10m

## Resumen

S1-GRT-RNN-b0.7.0-10m es un modelo de clasificación de texto desarrollado por MatterWaveAI, construido sobre el modelo base grt-rnn-b0.7.0-10m. Se presenta como un "juez" de modelo del mundo con estado recurrente, enrutador de acciones para control predictivo de modelos (MPC) y guardarraíl de autómatas de horizonte largo. Con aproximadamente 13,8 millones de parámetros almacenados y una capacidad equivalente densa declarada de unos 34 millones, el modelo se posiciona en la gama compacta de 10 millones de parámetros.

La propuesta técnica se apoya en una arquitectura RNN unitaria con compuertas rotacionales (GRT-RNN), sin matrices lineales densas ni capas convolucionales, y con un estado recurrente de 1,5 KB que se actualiza en tiempo y memoria constantes O(1) por evento, sin caché KV. El autor destaca la estabilidad a horizonte largo (deriva de magnitud inferior a 5,0e-7 en más de 1.000 pasos) y la invariancia al orden de opciones del 100% en sus evaluaciones.

El modelo resulta relevante por su enfoque en seguridad de agentes y verificación de estado, no en generación de texto general. Su caso de uso declarado es emitir veredictos APPROVE, REJECT o ESCALATE sobre acciones de agentes mediante un lookahead latente de MPC. Cabe señalar que los pesos, la implementación arquitectónica y el código fuente no están publicados durante el ciclo de liberación escalonada, según indica el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN unitaria con compuertas rotacionales (GRT-RNN); modos Rotational-minGRU y Unitary-GRU |
| Parametros totales | ~13,8 M almacenados (~34 M de capacidad equivalente densa declarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | estado recurrente O(1) sin caché KV; evaluado de T=128 a T=8.192+ |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos no publicados según la model card) |

## Arquitectura y entrenamiento

La arquitectura es una RNN con estado recurrente compacto de 1,5 KB que se actualiza en O(1) de cómputo y memoria por evento, sin matrices lineales densas ni capas convolucionales 1D/2D. Soporta dos modos recurrentes: un modo de escaneo paralelizable Rotational-minGRU, con paridad de 3,82e-6 frente a la recurrencia de paso O(1), y un modo no lineal Unitary-GRU acoplado al estado. La estabilidad unitaria se reporta con determinante +1,000000 y deriva homogénea de magnitud inferior a 5,0e-7 en más de 1.000 pasos (9,55e-15 a T=8.192 en float64).

El modelo incorpora un mecanismo de lookahead latente de MPC de un solo paso que ramifica el estado recurrente vivo entre acciones candidatas del agente antes de emitir un veredicto. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor indica explícitamente que los pesos, los detalles de implementación y el código fuente se retienen durante el ciclo de liberación escalonada para evitar la evasión de los guardarraíles en escenarios de caja blanca.

## Capacidades

- Verificación de rollouts relacionales multi-salto (2 a 3 saltos) sobre el estado recurrente.
- Verificación causal de ciencia y sentido común físico.
- Verificación factual de un solo salto como modelo del mundo.
- Verificación socrática y epistémica en cuatro modos (SEE/SAY/DO/KNOW).
- Inducción de reglas en rejillas visual-espaciales 2D (evaluado sobre ARC-AGI-2 XL-smol).
- Enrutamiento de acciones de agente con MPC, incluyendo defensa frente a deriva y inyección de prompts.
- Seguimiento de autómatas cíclicos y con estado a horizonte largo (T=64 a 8.192).
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa.
- Seguimiento de transiciones de estado simbólico.
- Verificación booleana formal y de tablas de verdad.
- No se declara soporte de tool calling, generación de texto libre, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Guardarraíl de agentes autónomos: el modelo recibe el estado recurrente de la sesión y emite APPROVE/REJECT/ESCALATE sobre cada acción propuesta, con defensa declarada frente a inyección de prompts y deriva de comportamiento.
- Enrutador de acciones con MPC: antes de ejecutar una acción, ramifica el estado entre candidatas y selecciona la de mayor consistencia con el modelo del mundo, útil en pipelines de agentes con múltiples herramientas.
- Verificación de razonamiento multi-salto: comprueba cadenas de inferencia de 2 a 3 saltos en sistemas de pregunta-respuesta o RAG, con una precisión top-1 reportada del 83,60%.
- Monitorización de horizonte largo en streaming: al no usar caché KV y mantener estado O(1), puede seguir autómatas y secuencias de hasta 8.192 pasos con una precisión top-1 del 94,60%, adecuado para vigilancia continua de sesiones.
- Verificación de terminación en ejecución de código: comprueba si los bucles de un programa generado terminan, con una precisión del 68,50%, integrable en pipelines de CI/CD que validan código sintetizado.
- Filtro de calibración y abstención: detecta cuándo un sistema debe abstenerse de responder, con una precisión del 71,25% en la suite de calibración epistémica.
- Verificación formal de condiciones booleanas: valida tablas de verdad y condiciones lógicas en sistemas de configuración o reglas de negocio, con una precisión del 62,65%.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la suite XL-smol (12.003 registros retenidos / 29.609 preguntas):

| Suite | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|
| Rollout relacional multi-salto (2-3 saltos) | 83,60% | 93,20% | 100,0% |
| Ciencia causal y sentido común | 93,20% | 96,30% | 100,0% |
| Verificación factual de un salto | 84,40% | 95,10% | 100,0% |
| Verificación socrática 4 modos | 64,10% | 90,80% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 55,17% | 80,83% | 100,0% |
| Enrutamiento MPC de acciones | 60,55% | 63,03% | 100,0% |
| Seguimiento de autómata a horizonte largo | 94,60% | 98,60% | 100,0% |
| Agregado 6 suites (macro/micro) | 73,50% / 76,59% | 88,01% | 100,0% |

Evaluación consolidada de 12 dominios (17.130 registros retenidos / 44.287 preguntas), con error de calibración (ECE):

| Dominio | Precisión | ECE |
|---|---|---|
| Rollouts relacionales multi-salto | 83,60% | 0,1096 |
| Ciencia causal y sentido común | 93,20% | 0,0558 |
| Verificación factual de un salto | 84,40% | 0,0754 |
| Verificación socrática 4 modos | 64,10% | 0,1204 |
| Inducción de reglas en rejilla 2D | 55,17% | 0,1392 |
| Enrutamiento MPC de acciones | 60,55% | 0,2148 |
| Calibración epistémica y abstención | 71,25% | 0,0890 |
| Terminación de bucles de programa | 68,50% | 0,0985 |
| Transiciones de estado simbólico | 67,22% | 0,0960 |
| Grafo de prerrequisitos (v5) | 67,32% | 0,0954 |
| Planificación de recursos y concurrencia | 65,00% | 0,1020 |
| Verificación booleana formal | 62,65% | 0,1140 |

No se han publicado comparaciones con modelos de referencia externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~13,8 M de parámetros, en fp16 ocuparía del orden de decenas de MB, pero los pesos no están publicados.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna sería suficiente en teoría.
- Cabe en GPU consumer: sí, por volumen de parámetros, aunque la indisponibilidad de pesos impide confirmarlo en la práctica.
- Opciones de despliegue: la model card indica compatibilidad con endpoints y librería transformers; no se detallan soportes de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor declara coste O(1) por evento y ausencia de caché KV, lo que en teoría favorece el streaming a horizonte largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| S1-GRT-RNN-b0.7.0-10m | ~13,8 M | O(1) sin caché KV | RNN unitaria, juez MPC | Apache 2.0 | No publicados |
| Helmholtz-S1-RNN-b0.7.0-20m (MatterWaveAI) | ~20 M (según nombre) | O(1) sin caché KV | RNN unitaria, JEPA | Apache 2.0 | No disponible en la información |
| Modelos de clasificación Transformer de tamaño similar | no disponible | no disponible | Transformer | variable | variable |

No se dispone de datos de rendimiento comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Los pesos, la implementación arquitectónica y el código fuente no están publicados, lo que impide su uso práctico, auditoría y reproducción independiente.
- Los benchmarks son autoinformados por el autor y no han sido verificados de forma externa.
- La precisión en enrutamiento MPC de acciones (60,55% top-1) y en verificación socrática (64,10%) es limitada para uso autónomo sin supervisión.
- El ECE en enrutamiento MPC (0,2148) indica una calibración pobre de las probabilidades en ese dominio.
- No se declaran idiomas soportados; la cobertura multilingüe es desconocida.
- Riesgo de alucinación no evaluado en la información disponible; el modelo está orientado a clasificación y veredictos, no a generación.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos hace inviable ejercerlo actualmente.
- El propio autor advierte de que la retención de detalles busca evitar la evasión de guardarraíles en caja blanca, lo que limita la transparencia del sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-rnn-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-rnn-b0.7.0-10m
- Familia S1-GRT-RNN: https://huggingface.co/MatterWaveAI/s1-grt-rnn
- Modelo relacionado Helmholtz-S1-RNN-b0.7.0-20m: https://huggingface.co/MatterWaveAI/helmholtz-s1-rnn-b0.7.0-20m
