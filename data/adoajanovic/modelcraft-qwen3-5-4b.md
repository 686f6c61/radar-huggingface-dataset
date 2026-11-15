# AdoAjanovic/modelcraft-qwen3.5-4b

## Resumen

Modelcraft local model es un paquete de adaptadores LoRA publicados por AdoAjanovic sobre el modelo base Qwen3.5-4B, distribuidos en formato GGUF para su uso con llama.cpp y Ollama. No se trata de un modelo entrenado desde cero, sino de dos adaptadores de tarea (dax-lab-a1 y code-docs-r3) que se aplican selectivamente sobre el modelo base cuantizado en Q4_K_M para convertir preguntas de negocio en modelos de Power BI, medidas DAX, consultas SQL y Power Query, y respuestas de documentación técnica. El objetivo declarado es alimentar la aplicación de escritorio Modelcraft, que ejecuta todo el proceso en la CPU del usuario sin enviar datos a ningún servicio externo.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 desarrollada por el equipo Qwen de Alibaba Cloud. La información disponible no detalla la arquitectura interna del modelo base (transformer denso o MoE), el número exacto de parámetros totales ni la longitud de contexto; únicamente se confirma que se distribuye cuantizado en Q4_K_M dentro de un repositorio de 3,5 GB que incluye el modelo base y los dos adaptadores. Los metadatos de safetensors del repositorio indican 21.233.664 parámetros, un dato que no es coherente con un modelo de 4B y que probablemente corresponde a los tensores de los adaptadores o a un recuento parcial.

La relevancia de esta publicación es doble. Por un lado, demuestra un patrón de despliegue local con conmutación de adaptadores LoRA por petición mediante `llama-server`, lo que permite especializar un mismo modelo base en varias tareas sin duplicar pesos en memoria. Por otro, publica una evaluación detallada sobre conjuntos retenidos que muestra mejoras sustanciales frente al modelo base en tareas DAX, SQL y documentación de Microsoft Learn, con un coste de memoria adicional de unos 40 MB y sin penalización medible de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.5-4B; los artefactos publicados son adaptadores LoRA) |
| Parametros totales | No disponible para el modelo base; los metadatos de safetensors del repositorio indican 21.233.664 (probablemente parcial o correspondiente a los adaptadores) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (archivo `qwen3.5-4b-q4_k_m.gguf`, build `qwen3.5:4b-q4_K_M` de Ollama) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base y adaptadores LoRA en formato GGUF para llama.cpp) |

## Arquitectura y entrenamiento

Los artefactos publicados son dos adaptadores LoRA en formato GGUF que se cargan junto al modelo base Qwen3.5-4B cuantizado en Q4_K_M. El entrenamiento se realizó en bf16, con rango 16, aplicado a todas las proyecciones del modelo de lenguaje, durante 2 épocas y con una tasa de aprendizaje de 1e-4. Cada muestra de entrenamiento utiliza exactamente el prompt que la aplicación envía en producción, y cada respuesta fue validada por las comprobaciones internas de la aplicación antes de incorporarse al conjunto de datos.

El adaptador `dax-lab-a1` se entrenó con 618 filas de fórmulas DAX repartidas en 8 dominios de negocio sintéticos, cada una verificada contra pandas y el motor DAX de la aplicación. El adaptador `code-docs-r3` se entrenó con 750 filas de DAX (solo como estabilizador, ya que nunca se aplica a peticiones DAX), 362 filas de SQL y Power Query del espacio de trabajo usadas dos veces en 18 familias (el SQL se ejecuta en DuckDB y el código M pasa por el analizador y las comprobaciones de columnas de la aplicación) y 2.000 respuestas de documentación generadas por un modelo profesor Qwen3.5-27B a partir de pasajes de Microsoft Learn. La retención de evaluación excluyó dominios completos, un estilo de formulación por familia y una de cada ocho páginas de Microsoft Learn.

La innovación operativa destacable es el uso de `llama-server` con múltiples adaptadores cargados simultáneamente y escalas por petición: como máximo se activa un adaptador por consulta y el resto se ejecuta con el modelo plano. El formato de prompt es ChatML con un bloque de pensamiento vacío al inicio del turno del asistente. El autor advierte que las builds upstream de llama.cpp rechazan el archivo construido por Ollama porque la clave `rope.dimension_sections` tiene 3 entradas en lugar de 4, por lo que la aplicación usa el `llama-server` incluido en Ollama 0.40.3.

## Capacidades

- Generación de fórmulas DAX para Power BI, incluyendo medidas y expresiones sobre modelos tabulares.
- Generación de consultas SQL y expresiones de Power Query (lenguaje M) contra las tablas del espacio de trabajo abierto.
- Respuestas de documentación técnica citando pasajes recuperados de Microsoft Learn.
- Conversación general, explicaciones y borradores de informes mediante el modelo base sin adaptador.
- Generación de código auxiliar para la construcción de modelos y la elaboración de informes en Power BI.
- Conmutación de adaptadores por petición: el servidor carga el modelo base y ambos adaptadores una sola vez y ajusta las escalas en cada solicitud.
- Ejecución completamente local en CPU, sin envío de datos a servicios externos.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Generación de medidas DAX en Power BI: el adaptador `dax-lab-a1` transforma una pregunta de negocio en una expresión DAX que la aplicación valida antes de mostrarla. En las pruebas sobre 40 peticiones difíciles de Superstore no vistas en entrenamiento, el modelo con adaptador acertó 38 y falló 0, frente a 30 aciertos y 3 fallos del modelo base.
- Construcción de consultas SQL con joins sobre el modelo tabular: el adaptador `code-docs-r3` genera SQL que se ejecuta en DuckDB para comprobar que devuelve las filas correctas. En el conjunto real de Superstore, la combinación de ambos adaptadores elevó la precisión de 5/8 a 7/8 en esta área.
- Generación de Power Query (código M): el adaptador produce transformaciones que pasan por el analizador y las comprobaciones de columnas de la aplicación. En la misma prueba real, la precisión pasó de 7/8 a 8/8 con ambos adaptadores.
- Asistente de documentación de Microsoft Learn: el adaptador `code-docs-r3` responde preguntas citando pasajes recuperados de la documentación oficial. Sobre 323 preguntas de páginas no vistas, los aciertos pasaron de 74 con el modelo base a 168 con el adaptador.
- Explicación y borradores de informes en Power BI: el modelo base sin adaptador se usa para chat, explicaciones y borradores, manteniendo la coherencia conversacional con el resto de la aplicación.
- Despliegue de escritorio con privacidad de datos: al ejecutarse íntegramente en la CPU del portátil del usuario, el paquete es adecuado para entornos empresariales donde los datos del modelo tabular no pueden salir de la máquina.
- Experimentación con adaptadores LoRA conmutables: el patrón de carga de varios adaptadores en `llama-server` con escalas por petición sirve como referencia para especializar un modelo base en varias tareas sin duplicar pesos ni penalizar la latencia, con un incremento de memoria de unos 40 MB y una variación de tiempo de 12,2 frente a 12,1 minutos en la suite de 27 tareas.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados a través del pipeline de la propia aplicación en CPU de portátil y con decodificación greedy sobre el archivo base exacto.

| Prueba | Modelo base | Con adaptador |
|---|---:|---:|
| DAX: 40 peticiones difíciles de Superstore no vistas (aciertos / fallos) | 30 / 3 | 38 / 0 |
| DAX: 60 peticiones retenidas de dominios no vistos (primera respuesta correcta) | 48 (38) | 59 (59) |
| SQL / Power Query: 386 peticiones de dominios y formulaciones no vistos | 254 | 364 |
| Código: 241 peticiones de 11 familias nunca entrenadas | 113 | 166 |
| Documentación: 323 preguntas de páginas de Microsoft Learn no vistas | 74 | 168 |

Rendimiento de la aplicación completa sobre el libro real de Superstore (43 peticiones, CPU de portátil):

| Área | Solo dax-lab-a1 | Con ambos adaptadores |
|---|---:|---:|
| Preguntas de negocio | 15/15 | 15/15 |
| SQL con joins (filas comprobadas en DuckDB) | 5/8 | 7/8 |
| Power Query (analizado, pasos comprobados) | 7/8 | 8/8 |
| Guía de uso | 3/4 | 3/4 |
| Construcción de modelos | 5/5 | 5/5 |
| Construcción de informes | 3/3 | 3/3 |
| Suite de 27 tareas revisada | 25 | 25 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 3,5 GB e incluye el modelo base Q4_K_M y ambos adaptadores, por lo que la huella de pesos ronda esa cifra.
- El autor confirma ejecución en CPU de portátil, sin GPU, con una suite de 27 tareas completada en aproximadamente 12 minutos.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el diseño apunta a inferencia en CPU.
- Opciones de despliegue: `llama-server` incluido en Ollama 0.40.3 con `lib/ollama`, con los flags `--lora dax-lab-a1.gguf --lora code-docs-r3.gguf --chat-template chatml --no-jinja`. Las builds upstream de llama.cpp rechazan el archivo GGUF del modelo base por la clave `rope.dimension_sections`.
- Memoria adicional por cargar ambos adaptadores: aproximadamente 40 MB sobre el modelo base.
- Latencia y throughput: la suite completa tarda 12,2 minutos con ambos adaptadores frente a 12,1 minutos con uno solo, sin penalización medible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones del modelo base Qwen3.5-4B en la información proporcionada, por lo que no es posible establecer una comparación rigurosa con alternativas. La comparación más directa disponible es la del propio paquete frente al modelo base sin adaptadores, que se recoge en la sección de benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Modelcraft (Qwen3.5-4B + LoRA) | No disponible (base 4B) | No disponible | Apache-2.0 | GGUF + LoRA GGUF | Especialización en Power BI, DAX, SQL y documentación |
| Qwen3.5-4B base | 4B (según denominación) | No disponible | Apache-2.0 | Safetensors, GGUF | Modelo generalista |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El paquete está diseñado específicamente para trabajo de Power BI sobre datos de negocio tabulares; fuera de ese dominio su ventaja frente al modelo base no está evaluada.
- El adaptador se probó únicamente con el archivo base exacto `qwen3.5-4b-q4_k_m.gguf`; otras cuantizaciones pueden comportarse de forma distinta.
- El modelo base y los adaptadores solo declaran soporte de inglés, lo que limita su uso en entornos en castellano sin evaluación adicional.
- No se han publicado datos sobre sesgos, tasas de alucinación fuera de los conjuntos evaluados ni comportamiento en conversaciones largas.
- La longitud de contexto del modelo base no está documentada en la información disponible.
- El archivo GGUF no es compatible con las builds upstream de llama.cpp por la estructura de `rope.dimension_sections`; requiere el `llama-server` de Ollama 0.40.3, lo que ata el despliegue a esa versión concreta.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la exactitud de las fórmulas generadas; la aplicación aplica sus propias comprobaciones antes de mostrar resultados.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación externa de los resultados reportados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AdoAjanovic/modelcraft-qwen3.5-4b)
- [Repositorio de la aplicación Modelcraft](https://github.com/ajanovicado/modelcraft)
- [Modelo base Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
