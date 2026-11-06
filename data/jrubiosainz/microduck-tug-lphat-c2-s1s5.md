# jrubiosainz/microduck-tug-lphat-c2-s1s5

## Resumen

Microduck Tug: lphat + C2 seed-1/seed-5 composite es una política de control para el entorno de robótica Microduck Arena Tug of War, publicada por el usuario jrubiosainz en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es un artefacto ONNX de 942.252 bytes que implementa una política de refuerzo para un agente físico que debe tirar de una cuerda en un simulador de robótica. El modelo parte de la política base de lphatnguyen (microduck-tug-of-war-v0) y le superpone una tabla de búsqueda externa con 170 pares observación/acción extraídos de las cadenas seed-1 y seed-5 del modelo C2 del propio autor.

La relevancia de esta publicación es acotada y muy específica: se trata de un composite declarado ("disclosed lookup-table composite") que no entrena nada nuevo, sino que combina pesos y tablas existentes para mejorar la puntuación predicha en un benchmark concreto de la Arena. El interés técnico reside en el mecanismo de composición: una red neuronal base intacta más una capa de lookup externa implementada con diez operadores ONNX que tiene precedencia sobre la política original para ciertas observaciones.

El modelo se presenta como una contribución a un entorno de competición (Arena Tug of War) más que como una herramienta de producción. Su tamaño es mínimo, su licencia no está claramente definida para uso fuera de la plataforma y su evaluación se limita a cinco bouts de rating con semillas públicas. Es, por tanto, un artefacto de investigación en robótica simulada, no un componente listo para despliegue comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de refuerzo representada como red neuronal (base heredada) más tabla de búsqueda externa en ONNX |
| Parámetros totales | no disponible (el artefacto pesa 942.252 bytes; no se detalla el número de parámetros de la red base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la observación es un vector float32 de 61 dimensiones) |
| Tipos de cuantización | no disponible (el artefacto se distribuye como ONNX float32) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; salida de 14 acciones float32) |
| Licencia | no disponible como licencia propia; el derivado se acoge al grant de contenido público de los Términos de Servicio de Hugging Face; se preserva el aviso Apache-2.0 heredado de C2/a1rb4Ck en NOTICE y LICENSE |
| Formato de pesos | ONNX (`policy.onnx`, SHA-256 `2d82c8dc6b3cece24d603d473c94b210a0e0b825b4fa131a93c7978217746475`) |

## Arquitectura y entrenamiento

La arquitectura es una política de control para el entorno Microduck Arena Tug of War. La red base proviene de lphatnguyen/microduck-tug-of-war-v0 y se mantiene sin cambios: su red, su tabla de búsqueda de 321 filas y sus inicializadores originales permanecen intactos. Sobre esa base se añade una tabla de búsqueda externa con 170 pares observación/acción que tiene precedencia sobre la política base completa. La entrada del grafo ONNX es `obs` (float32 `[1, 61]`) y la salida es `actions` (float32 `[1, 14]`). La salida de la base se renombra a `lp_actions` y diez operadores ONNX implementan la búsqueda externa.

Las filas añadidas provienen de las cadenas seed-1 y seed-5 del modelo C2 de jrubiosainz: filas `0-88` y `367-378` para seed 1, y `338-366` y `424-463` para seed 5, en ese orden. No se realizó ningún entrenamiento nuevo para esta composición; es una agregación de tablas y pesos existentes. Se heredan la máscara de observación `L_mask` y la tolerancia `L_tol` de C2, y la política original sigue gestionando las observaciones fuera de la tabla añadida. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, porque el artefacto no entrena un modelo de lenguaje.

## Capacidades

- Control de un agente robótico simulado en el entorno Tug of War de Microduck Arena, con velocidad de comando `-0.3`.
- Inferencia determinista mediante una tabla de búsqueda externa que cubre 170 observaciones específicas, con fallback a la red base para el resto.
- Ejecución validada contra el cargador de políticas de la Arena y validación ONNX superada.
- Reproducción exacta de las acciones de la política fuente seleccionada sobre las observaciones registradas en los cinco bouts de rating.
- Ejecución en macOS verificada (aunque la física arm64 no se considera un replay autoritativo x86).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas en la Arena Tug of War: el artefacto se carga con el policy loader de la Arena para medir su puntuación en los bouts de rating, comparando el composite con la base lphat sin modificar.
- Investigación sobre composición de políticas: sirve como ejemplo reproducible de cómo superponer una tabla de búsqueda externa a una red de refuerzo existente mediante operadores ONNX, sin reentrenar.
- Reproducción de experimentos de seed-1 y seed-5: permite aislar el efecto de las filas añadidas de C2 sobre el comportamiento del agente en condiciones iniciales concretas.
- Benchmark de robustez frente a condiciones no vistas: útil para contrastar la puntuación predicha (166,57) con el rendimiento real en observaciones fuera de la tabla, dado que el propio autor advierte que no se establece generalización.
- Docencia en robótica simulada: como caso de estudio de políticas de refuerzo empaquetadas en ONNX con entradas y salidas de dimensión fija (61 → 14).
- Integración en pipelines de simulación x86: para replay autoritativo de los bouts, dado que la ejecución en macOS no se considera válida como evidencia.
- Auditoría de atribución y licencias: el NOTICE y LICENSE preservados permiten estudiar cómo se compone una cadena de derivados con avisos Apache-2.0 y contribuciones sin licencia propia.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Puntuación media predicha | 166,5739619731903 |
| Puntuación run 1 | 165,88760018348694 |
| Puntuación run 2 | 166,56830310821533 |
| Puntuación run 3 | 166,28799438476562 |
| Puntuación run 4 | 166,7003333568573 |
| Puntuación run 5 | 167,42557883262634 |
| Validación ONNX | superada |
| Carga en policy loader de la Arena | superada |
| Coincidencia de acciones con la política fuente | exacta en las observaciones registradas de los cinco bouts |

El autor advierte explícitamente de que la media de 166,57 es una predicción, no una puntuación oficial ya alcanzada; el registro de ejecución de la Arena es la fuente autoritativa. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el artefacto ONNX pesa 942.252 bytes y opera sobre vectores de 61 y 14 dimensiones.
- GPU recomendadas: no se especifican; cualquier GPU capaz de ejecutar ONNX Runtime sirve, e incluso la CPU es suficiente para este tamaño.
- Cabe en cualquier GPU de consumo y en CPU; no requiere aceleradores dedicados.
- Opciones de despliegue: ONNX Runtime y el policy loader de Microduck Arena. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de plataforma: la ejecución en macOS funciona, pero la física arm64 no es un replay autoritativo x86.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-tug-lphat-c2-s1s5 | Composite ONNX (red + lookup) | 942.252 bytes | 166,57 (predicha) | no disponible (grant de contenido público de HF; Apache-2.0 heredado en NOTICE) | Hugging Face |
| lphatnguyen/microduck-tug-of-war-v0 | Política base (red + lookup de 321 filas) | no disponible | no disponible | no declara licencia propia | Hugging Face |
| jrubiosainz/microduck-game-tug-a1rb4ck-...-c2 | Política C2 (fuente de las filas añadidas) | no disponible | no disponible | Apache-2.0 (heredada de a1rb4Ck) | Hugging Face |

No se dispone de datos de puntuación de los modelos base y C2 en la información proporcionada, por lo que la comparación cuantitativa no es posible más allá de la media predicha del composite.

## Limitaciones y advertencias

- La puntuación de 166,57 es una predicción basada en cinco runs con semillas públicas; no es una puntuación oficial verificada por la Arena.
- La evidencia no establece generalización a condiciones iniciales u oponentes no vistos; el propio autor lo señala explícitamente.
- El composite usa trayectorias de las semillas públicas de rating, lo que puede inflar el rendimiento aparente frente a entornos no vistos.
- La ejecución en macOS no es un replay autoritativo por diferencias de física en arm64; la validación debe hacerse en x86.
- No se declara licencia propia para la contribución de lphat; el derivado se acoge al grant de contenido público de los Términos de Servicio de Hugging Face, lo que no equivale a una licencia irrestricta fuera de la plataforma.
- El aviso Apache-2.0 heredado de C2/a1rb4Ck no relicencia la contribución de lphat ni concede derechos sobre obras upstream no relacionadas.
- El artefacto no es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio, y no admite tool calling ni agentes.
- No se documentan sesgos ni riesgos de alucinación en el sentido habitual; el riesgo relevante es el sobreajuste a las observaciones registradas y la falta de validación fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-lphat-c2-s1s5
- Modelo base lphatnguyen: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0/tree/bca92ace3a25d383e806456bedc4148807cdcdf6
- Modelo C2 de jrubiosainz: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3-cma-s2-s3-s4-s5-c2/tree/96e4eaf2e427371787dcb129ae19266b582fbd01
- Perfil de lphatnguyen: https://huggingface.co/lphatnguyen
- Perfil de a1rb4Ck: https://huggingface.co/a1rb4Ck
- Pollen Robotics (Arena y entorno): https://huggingface.co/pollen-robotics
- Términos de Servicio de Hugging Face, sección Your Content: https://huggingface.co/terms-of-service#your-content
