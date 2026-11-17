# oyekamal/taleemabad-offline-teacher-coach-4b

## Resumen

Taleemabad Offline Teacher Coach 4B es un ajuste fino del modelo Qwen/Qwen3.5-4B desarrollado por el equipo de Taleemabad en Islamabad, orientado a una tarea muy concreta: asistir a docentes de educación primaria en Pakistán ante problemas de aula. El profesor plantea una situación en inglés, urdu o roman urdu y el modelo responde con una acción concreta para el día siguiente, incluyendo las palabras exactas que debería decir, siguiendo el playbook de coaching de Taleemabad.

El modelo se distribuye exclusivamente en formato GGUF para su uso con llama.cpp en dispositivos locales, con el objetivo de funcionar sin conexión en un teléfono de gama media. Es la variante mayor del modelo hermano de 2B, con el mismo prompt, las mismas notas de playbook y el mismo caso de uso, pero con respuestas de mayor calidad a cambio de un mayor consumo de memoria.

En el momento de su publicación (17 de noviembre de 2026) se encuentra en estado preview: supera claramente al 2B en la prueba comparativa cara a cara, pero aún no ha superado la revisión final de seguridad con el crítico corregido. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, detalles no disponibles) |
| Parametros totales | 4B (aproximado, segun nombre del modelo y base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.280 tokens en las mediciones publicadas (contexto maximo del base no disponible) |
| Tipos de cuantizacion | Q4_K_M, IQ4_XS, Q3_K_M |
| Idiomas soportados | Ingles (en), urdu (ur); incluye roman urdu en el entrenamiento |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se entrena mediante un LoRA de 16 bits con rango 32 sobre una única GPU Colab L4, en siete bloques de 40 minutos con checkpoints en Drive. El proceso consta de dos fases. La primera es un ajuste fino supervisado sobre 5.584 intercambios anclados al playbook (en inglés, urdu y roman urdu), cada uno emparejado con las notas de playbook que la aplicación recupera, de forma que el prompt de entrenamiento coincide byte a byte con el prompt que se usa en el teléfono. La segunda fase emplea 823 pares de preferencia de edición mínima: para cada respuesta que el modelo 2B fallaba, un modelo frontera reescribía la respuesta con el cambio más pequeño que corregía la carencia señalada por el juez, y la versión corregida se prefiere sobre la original. Estos pares se fusionan a un cuarto del delta aprendido.

La innovación técnica destacable no está en la arquitectura, sino en el método de alineación: los pares de edición mínima no produjeron ningún cambio en el modelo 2B, pero en el 4B elevaron el resultado cara a cara de 31 a 36 de 61 escenarios. El entrenamiento está diseñado para inferencia en dispositivo con recuperación de notas en local, sin dependencia de red.

## Capacidades

- Generación de texto orientada a coaching docente: dada una situación de aula, produce una acción concreta para el día siguiente con el diálogo exacto sugerido.
- Respuesta multilingüe en inglés, urdu y roman urdu.
- Seguimiento de un playbook de coaching mediante notas recuperadas e incluidas en el prompt.
- Funcionamiento totalmente offline en dispositivo con llama.cpp.
- Formato de respuesta estructurado según el playbook (acción única, palabras literales).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistencia a docentes de primaria en Pakistán: el profesor describe un problema de disciplina o de aprendizaje en inglés, urdu o roman urdu y recibe una acción concreta para aplicar al día siguiente, con el texto exacto que debe decir, ajustada al playbook de Taleemabad.
- Despliegue en escuelas sin conectividad: al ejecutarse con llama.cpp sobre GGUF en un teléfono, funciona en zonas rurales o con red intermitente, sin enviar datos a servicios en la nube.
- Formación inicial de docentes: sirve como entrenador de práctica que ofrece respuestas guionizadas que el docente puede ensayar antes de aplicarlas en el aula.
- Estandarización de la orientación pedagógica: al seguir un playbook común, todos los docentes reciben recomendaciones consistentes con el marco de Taleemabad, lo que facilita la supervisión por parte de coordinadores.
- Soporte en contextos de recursos limitados: con cuantización IQ4_XS (2,53 GB) o Q3_K_M (2,26 GB) cabe en dispositivos con poca memoria, lo que amplía el alcance a teléfonos de gama media.
- Prototipado de aplicaciones educativas Android: el repositorio de GitHub incluye la app que realiza la recuperación de notas en el dispositivo, reutilizable para otras tareas de coaching con recuperación local.
- Evaluación comparativa de variantes: útil para equipos que quieran medir el compromiso entre calidad de respuesta y requisitos de hardware frente al modelo 2B de la misma familia.

## Benchmarks y rendimiento

Evaluación sobre 61 escenarios no vistos, con tres puertas automáticas juzgadas a ciegas y una comparación cara a cara contra las respuestas de un modelo frontera a los mismos escenarios, en ambos órdenes y con el banco de 6.859 ejemplos de la app en el prompt.

| Métrica | 2B release | 4B SFT (ronda 15) | 4B + pares de edición mínima (ronda 17) |
|---|---|---|---|
| Vs modelo frontera, ganadas / empatadas / perdidas | 16 / 9 / 35 | 21 / 10 / 30 | 23 / 13 / 25 |
| Igual o mejor | 25 de 61 | 31 de 61 | 36 de 61 |
| Las tres puertas pasan (guardián activo, primer crítico) | 95,6% | 94,3% | 92,3% con guardián, 96,7% sin guardián |
| Ninguna regla "never" incumplida | 96,2% | 95,9% | 92,3% con guardián, 97,3% sin guardián |

Las cifras de puertas del 4B proceden del primer crítico, que penalizaba la derivación de bienestar de la propia app y era ruidoso en respuestas límite; el crítico corregido (derivación puntuada como correcta, mayoría de tres votos) está pendiente de ejecución sobre los tres modelos, por lo que las cifras de seguridad son provisionales.

Rendimiento en portátil (CPU, 4 hilos, contexto de 1.280 tokens):

| Fichero | Cuantización | Tamaño | Memoria | Velocidad |
|---|---|---|---|---|
| coach-4b-q4_k_m.gguf | Q4_K_M | 2,71 GB | 4,7 GB | 7,7 tok/s |
| coach-4b-iq4_xs.gguf | IQ4_XS | 2,53 GB | 3,0 GB | 7,4 tok/s |
| coach-4b-q3_k_m.gguf | Q3_K_M | 2,26 GB | 3,4 GB | 8,1 tok/s |

El modelo 2B, en la misma máquina, alcanza 13,8 tok/s y 2,1 GB.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 4,7 GB con Q4_K_M, 3,0 GB con IQ4_XS y 3,4 GB con Q3_K_M, medidos con contexto de 1.280 tokens en portátil con 4 hilos.
- GPU recomendadas: no se especifican; el autor mide en CPU de portátil y en teléfono de gama media. Una L4 de Colab se usó solo para el entrenamiento.
- Compatibilidad con GPU de consumo: no se documenta; el formato GGUF permite ejecución en CPU y en GPU consumer mediante llama.cpp, pero no hay cifras publicadas para RTX 4090 u otras.
- Despliegue: llama.cpp (librería declarada) y, por extensión del formato GGUF, herramientas compatibles como Ollama; vLLM y TGI no se mencionan.
- Latencia y throughput: 7,7 tok/s con Q4_K_M, 7,4 tok/s con IQ4_XS y 8,1 tok/s con Q3_K_M en portátil; en un teléfono de gama media el autor indica que es más lento, sin cifras concretas.
- Requiere un teléfono con más memoria que el modelo 2B; el autor lo señala explícitamente como condición para usar esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taleemabad Offline Teacher Coach 4B (este) | 4B | 1.280 tokens en pruebas | 36 de 61 igual o mejor que modelo frontera; 7,7 tok/s (Q4_K_M) | Apache-2.0 | GGUF en HF, preview |
| Taleemabad Offline Teacher Coach 2B | 2B | no disponible (mismo harness) | 25 de 61 igual o mejor; 13,8 tok/s y 2,1 GB | Apache-2.0 | GGUF en HF, release probada |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Sin ajuste al playbook; no evaluado en esta tarea | Apache-2.0 | Pesos originales en HF |

La comparación directa con modelos de propósito general no está disponible en la información proporcionada; el propio autor solo compara contra su variante 2B y contra un modelo frontera no identificado.

## Limitaciones y advertencias

- Estado preview: no ha superado la revisión final de seguridad con el crítico corregido; las cifras de seguridad son provisionales.
- Es una ayuda de coaching, no un juez de docentes ni una herramienta de protección infantil.
- Solo cubre inglés y urdu (con roman urdu en el entrenamiento); no soporta otros idiomas.
- Los escenarios de entrenamiento son sintéticos y anonimizados; los escenarios de prueba nunca se entrenaron, pero la distribución puede no reflejar aulas reales.
- Requiere más memoria que el 2B, lo que excluye parte del parque de teléfonos de gama media.
- Riesgo de alucinación no cuantificado en la información disponible; el playbook y el guardián mitigan parcialmente las respuestas fuera de norma.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como preview y sin garantías de idoneidad para producción.
- El contexto medido es de 1.280 tokens; no se documenta el máximo del modelo base ni su comportamiento con contextos mayores.
- Las cuantizaciones IQ4_XS y Q3_K_M pueden faltar temporalmente si aún se están evaluando.

## Enlaces

- Hugging Face: https://huggingface.co/oyekamal/taleemabad-offline-teacher-coach-4b
- Modelo hermano 2B: https://huggingface.co/oyekamal/taleemabad-offline-teacher-coach-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la app Android: mencionado en la model card (GitHub), URL no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible
