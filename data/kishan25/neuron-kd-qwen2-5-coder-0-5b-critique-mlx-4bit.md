# Kishan25/neuron-kd-qwen2.5-coder-0.5b-critique-mlx-4bit

## Resumen

El modelo `neuron-kd-qwen2.5-coder-0.5b-critique-mlx-4bit` es un modelo de lenguaje especializado en la revisión de código Python, desarrollado por Kishan25. Su función es explicar por qué un fragmento de código falla al ejecutar sus tests y proponer una corrección, partiendo de la información de ejecución real proporcionada por el host. Está diseñado para funcionar en dispositivos móviles (on-device) y forma parte de la aplicación Neuron iOS, concretamente en su módulo Code Lab, junto con su modelo hermano que genera soluciones.

El modelo se basa en Qwen2.5-Coder-0.5B-Instruct, un transformer de 0.5B parámetros, y ha sido afinado mediante destilación de conocimiento híbrida desde Qwen2.5-Coder-32B-Instruct, utilizando datos del dataset MBPP con etiquetas obtenidas por ejecución real de los tests. El resultado se ha convertido a formato MLX con cuantización de 4 bits, lo que lo hace extremadamente ligero (0.3 GB) y apto para ejecutarse en hardware limitado, como teléfonos o portátiles con Apple Silicon.

La relevancia de este modelo radica en su enfoque pragmático: en lugar de intentar juzgar la corrección del código (tarea en la que los modelos pequeños fallan), se apoya en la ejecución real de los tests y se limita a explicar y reparar fallos conocidos. Esto permite alcanzar una tasa de reparación verificada del 37% en una sola muestra y del 53% con best-of-3, con una baja tasa de falsas alarmas (3.4%). Es una solución práctica para la depuración asistida en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5) |
| Parametros totales | 77.252.992 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (group size 64) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer denso de 0.5B parámetros con arquitectura Qwen2.5, preentrenado sobre más de 5,5 billones de tokens según el informe tecnico de Qwen2.5-Coder. Sobre esta base se ha aplicado un afinamiento mediante destilacion de conocimiento híbrida: el profesor es Qwen2.5-Coder-32B-Instruct, que recibe el resultado de ejecucion de los tests y genera una critica coherente con la realidad (0 desajustes entre veredicto y ejecucion en 282 muestras). El objetivo de entrenamiento combina cross-entropy sobre el texto del profesor con divergencia KL sobre las distribuciones de los 5 tokens principales (α=0.5, T=2.0). Se utilizo LoRA con r=32 y α=64 sobre las proyecciones de atencion, durante 3 epocas.

El dataset de entrenamiento contiene 1.608 candidatos de 420 problemas MBPP, incluyendo soluciones de referencia, soluciones del profesor, mutantes AST (comparaciones intercambiadas, constantes off-by-one, operadores invertidos) y stubs vacios. Cada candidato fue etiquetado ejecutandolo realmente, no por opinion: 762 pasan y 846 fallan. Ademas, se entrenaron ejemplos de escritura de soluciones en paralelo para no sobrescribir esa habilidad. Un intento con mayor capacidad (r=64 + MLP, 6 epocas) provoco sobreajuste, con la perdida de entrenamiento cayendo a 0.056 mientras que el pass@1 en validacion quedo por debajo del modelo base sin tocar.

## Capacidades

- Explica por que falla un fragmento de codigo Python, basandose en el resultado real de ejecutar sus tests (asserts).
- Sugiere una correccion concreta en formato de funcion Python corregida.
- Distingue entre codigo correcto e incorrecto con una tasa de falsas alarmas del 3.4% ± 1.0% sobre codigo que funciona.
- Produce salida en un formato estructurado y parseable (Verdict, Explanation, Suggested fix) en el 98.7% de los casos.
- Funciona con informacion de ejecucion incluida en el prompt; no requiere juzgar la correccion por si mismo.
- Optimizado para ejecucion on-device con MLX, compatible con Apple Silicon y entornos Swift.
- Soporta un mecanismo de reintentos (best-of-3) donde el host ejecuta cada candidato y se queda con el primero que pase los tests.

## Casos de uso

- Asistente de depuracion en entornos de desarrollo integrados (IDE) ligeros: el modelo recibe el codigo del usuario, el host ejecuta los tests y el modelo explica el fallo y propone una correccion, reduciendo el tiempo de busqueda de errores.
- Aplicaciones moviles de aprendizaje de programacion: integrado en una app como Neuron iOS, ofrece retroalimentacion inmediata sobre ejercicios de Python sin necesidad de conexion a internet.
- Herramientas de autoevaluacion para estudiantes: al recibir la salida de los tests, el modelo genera una explicacion pedagogica del error y una posible solucion, ayudando a comprender el fallo.
- Pipelines de CI/CD para validacion de ejercicios: en un sistema de correccion automatica de tareas, el modelo puede complementar la ejecucion de tests generando informes de error legibles para el alumno.
- Asistentes de codigo en dispositivos con recursos limitados (Raspberry Pi, portatiles antiguos): su tamano reducido y cuantizacion de 4 bits permiten ejecutarlo localmente sin GPU dedicada.
- Generacion de explicaciones de errores en plataformas de crowdsourcing de codigo: cuando un usuario envia una solucion que falla, el modelo produce una critica clara y una sugerencia de reparacion, mejorando la calidad de las revisiones.

## Benchmarks y rendimiento

La model card no reporta resultados en benchmarks estandar (MMLU, HumanEval, GSM8K), pero si incluye metricas especificas de su tarea de reparacion, medidas sobre el split de test de MBPP (nunca visto en entrenamiento) y verificadas ejecutando la correccion sugerida contra los asserts reales. Se muestrearon 5 ejecuciones sobre 976 candidatos con temperatura 0.2.

| Metrica | Resultado |
|---|---|
| Tasa de reparacion (muestra unica) | 37.0% ± 0.5% |
| Tasa de reparacion (best-of-3, verificado) | 53.3% |
| Ofrece una correccion sobre codigo roto | 96.7% ± 0.9% |
| Falsas alarmas sobre codigo que funciona | 3.4% ± 1.0% |
| Salida parseable en el formato esperado | 98.7% ± 0.3% |

Ademas, la model card compara la capacidad de deteccion de errores con otros modelos en 40 soluciones rotas retenidas:

| Modelo | Errores detectados |
|---|---|
| Qwen2.5-Coder-0.5B-Instruct (sin tocar) | 0% |
| Qwen2.5-Coder-1.5B-Instruct (sin tocar, 3x mayor) | 0% |
| Predecesor de este modelo (entrenado como juez) | 10% |
| Este modelo (con feedback de ejecucion) | 92.5% (37 de 40) |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB (el repositorio ocupa 0.3 GB en cuantizacion 4-bit).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en Apple Silicon via MLX.
- Compatible con hardware consumer: si, cabe en cualquier dispositivo con al menos 1 GB de RAM libre, incluidos telefonos y portatiles.
- Opciones de despliegue: MLX (mlx-lm), MLX Swift para aplicaciones iOS/macOS. No se mencionan otros backends como vLLM u Ollama.
- Latencia y throughput: no se proporcionan datos numericos, pero al ser un modelo de 0.5B en 4-bit, la generacion de 300 tokens es practicamente instantanea en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Formato |
|---|---|---|---|---|---|
| neuron-kd-qwen2.5-coder-0.5b-critique-mlx-4bit | 0.5B | No disponible | Critica y reparacion de codigo Python con feedback de ejecucion | Apache-2.0 | MLX 4-bit |
| Qwen2.5-Coder-0.5B-Instruct (base) | 0.5B | No disponible | Generacion de codigo general | Apache-2.0 | Safetensors |
| neuron-kd-qwen2.5-coder-0.5b-mlx-4bit (hermano) | 0.5B | No disponible | Escritura de soluciones Python | Apache-2.0 | MLX 4-bit |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | No disponible | Generacion de codigo general | Apache-2.0 | Safetensors |

La comparacion directa con el modelo base y el de 1.5B muestra que, sin el feedback de ejecucion, ninguno de ellos es capaz de detectar errores en codigo roto (0% en ambos). Este modelo, al recibir el resultado de los tests en el prompt, alcanza un 92.5% de deteccion y un 37% de reparacion verificada, lo que demuestra la importancia del diseno del prompt y del entrenamiento especifico.

## Limitaciones y advertencias

- No es un revisor de codigo general: esta entrenado exclusivamente sobre ejercicios Python de una sola funcion con tests basados en asserts del dataset MBPP. No debe usarse para otros lenguajes o estilos de codigo.
- No debe decidir si el codigo es correcto: el modelo no puede simular la ejecucion en su cabeza; depende de que el host ejecute los tests y le pase el resultado. Usarlo sin ese feedback degrada drasticamente su rendimiento.
- Tasa de reparacion limitada: aproximadamente la mitad de las soluciones rotas no reciben una correccion verificada. La interfaz de usuario debe mostrar solo una explicacion en esos casos, nunca una correccion no verificada.
- Riesgo de alucinacion: aunque la tasa de falsas alarmas es baja (3.4%), existe la posibilidad de que el modelo proponga una correccion incorrecta o explique un fallo de forma imprecisa.
- Sesgo de dominio: al estar entrenado con datos de MBPP, puede tener un sesgo hacia problemas de nivel basico-intermedio y no manejar bien codigo complejo o con dependencias externas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantias. El autor no ofrece soporte.
- Dependencia del formato de prompt: el prompt debe incluir el bloque de feedback de ejecucion exactamente como se especifica en la model card; cualquier desviacion puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kishan25/neuron-kd-qwen2.5-coder-0.5b-critique-mlx-4bit
- Modelo hermano (escritura de soluciones): https://huggingface.co/Kishan25/neuron-kd-qwen2.5-coder-0.5b-mlx-4bit
- Informe tecnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Dataset MBPP: https://github.com/google-research/google-research/tree/master/mbpp
