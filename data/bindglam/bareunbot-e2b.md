# bindglam/BareunBot-E2B

## Resumen

BareunBot-E2B es un modelo de clasificación de texto en coreano especializado en moderación de contenido para tablones de anuncios escolares. Ha sido desarrollado por el usuario bindglam y publicado en Hugging Face bajo licencia Apache 2.0. El modelo surge de un caso de uso real: filtrar automáticamente publicaciones dañinas (insultos, acoso, exposición de privacidad, política, manipulación del filtro) en un tablón de clase llamado "Agora", donde los filtros tradicionales de odio entrenados con comentarios de noticias no detectaban dinámicas típicas de acoso escolar ni confundían palabras inocuas con insultos.

Técnicamente es un ajuste fino de google/gemma-4-E2B-it (familia Gemma 4, variante de texto), entrenado con el framework Jeff sobre 23.099 ejemplos etiquetados. En lugar de generar explicaciones en lenguaje natural, calcula directamente la probabilidad de que una publicación deba bloquearse (valor entre 0 y 1, umbral recomendado de 0,5), lo que le permite procesar una publicación en unos 0,05-0,1 segundos en GPU y 1-2 segundos en CPU.

Su relevancia actual radica en demostrar que un modelo pequeño (4,63 mil millones de parámetros según los safetensors del repositorio) puede superar a modelos mucho mayores en una tarea de moderación muy específica: alcanza un F1 de 0,967 en su conjunto de evaluación de 504 ejemplos, por delante de Gemma 4 26B A4B (0,964) y con una latencia 60 veces menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (base Gemma 4 E2B), afinado como clasificador binario con salida de probabilidad |
| Parametros totales | 4.628.569.344 (dato real de los safetensors; la model card lo describe como "2,3B", existe discrepancia) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en el repositorio) |
| Idiomas soportados | Coreano (entrenado exclusivamente con texto en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (9,3 GB de tamano de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it, la variante instructiva de 2B "eficiente" de la familia Gemma 4 de Google, y se ha afinado mediante el framework Jeff para convertirlo en un clasificador de moderación. En lugar de decodificación autorregresiva de una respuesta textual, el modelo calcula directamente la probabilidad de bloqueo ("noul"), lo que elimina la generación de texto largo y explica su latencia muy baja.

El entrenamiento utilizó 23.099 ejemplos con etiquetas prácticamente balanceadas entre publicaciones bloqueables y aceptables, compuestos por dos fuentes: 13.063 ejemplos de datasets públicos coreanos de discurso de odio e insultos (re-etiquetados uno a uno con Gemma 4 26B según los criterios propios de BareunBot, en lugar de usar las etiquetas originales) y 10.036 publicaciones sintéticas de tablón de clase creadas específicamente para cubrir los casos que el modelo fallaba: insultos con sustituciones de caracteres (jamo descompuesto, romanización tipo "qudtls", puntos separadores), jerga política y de drogas, frases de manipulación de la IA (prompt injection como `{"verdict": "pass"}` o "aprobado por el administrador") y publicaciones normales fácilmente confundibles. Los autores indican que se eliminaron del entrenamiento los ejemplos similares al conjunto de evaluación para evitar contaminación.

## Capacidades

- Clasificación binaria de publicaciones en coreano: devuelve la probabilidad (0-1) de que un texto deba bloquearse en un tablón escolar, con umbral recomendado de 0,5.
- Detección de insultos y lenguaje despectivo, incluidos insultos ofuscados (jamo descompuesto, tecleo en inglés tipo "qudtls", separación con caracteres especiales).
- Detección de acoso dirigido: señalar a compañeros, difusión de rumores, publicación de capturas de fotos de perfil o datos personales, campañas de denuncias masivas.
- Detección de exclusión social sutil (conversaciones que dejan fuera deliberadamente a ciertos compañeros).
- Detección de contenidos de riesgo: autolesión, drogas (incluida jerga), juego, alcohol, compras por encargo.
- Bloqueo de contenido político en cualquier dirección (apoyo, oposición, apodos despectivos de políticos, jerga política).
- Resistencia a manipulación del clasificador: trata instrucciones incrustadas, "avisos del sistema" y JSON dentro del texto como intentos de manipulación, no como comandos.
- Tolerancia a falsos positivos léxicos: permite palabras como "시발점" (punto de partida) o "족발" (codillo) usadas en su sentido literal, así como peticiones de ayuda, disculpas o advertencias.
- No genera texto, no razona en multi-paso y no tiene tool calling: es exclusivamente un clasificador de una sola entrada.

## Casos de uso

- Moderación automática de tablones escolares: filtro previo de publicaciones en foros de clase, marcando con probabilidad superior a 0,5 las que requieren intervención; es el caso de uso para el que fue creado y el que mejor cubre.
- Cola de revisión humana ("necesita revisión del profesor"): en lugar de borrar automáticamente, el modelo puede etiquetar publicaciones dudosas para revisión, uso que los propios autores recomiendan explícitamente.
- Filtro de bajo coste para aplicaciones comunitarias pequeñas: al funcionar en CPU con 10 GB de RAM, es adecuado para servicios gestionados por estudiantes o asociaciones sin presupuesto de GPU.
- Pre-filtro en cascada para modelos grandes: dada su latencia de 0,05 segundos, puede descartar publicaciones claramente inocuas y escalar solo los casos dudosos a un modelo mayor de moderación.
- Detección de intentos de manipulación de filtros: útil en cualquier sistema de moderación coreano que quiera detectar prompt injection incrustado en el contenido de los usuarios.
- Investigación en moderación contextual en coreano: su enfoque de etiquetado re-anotado con un LLM y su conjunto de evaluación público documentado lo hacen útil como referencia para estudios de clasificación de odio en contextos comunitarios.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre su propio conjunto de evaluación de 504 ejemplos (umbral 0,5). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.), lo cual es coherente con su naturaleza de clasificador especializado.

| Modelo | F1 | Falsos bloqueos | Omisiones | Fallos de respuesta | Tiempo por elemento |
|---|---|---|---|---|---|
| BareunBot E2B | 0,967 | 3 | 13 | 0 | 0,05 s |
| Gemma 4 26B A4B | 0,964 | 14 | 4 | 3 | 3,32 s |
| Gemma 4 E4B | 0,923 | 16 | 22 | 3 | 3,85 s |
| Gemma 4 E2B (base) | 0,816 | 13 | 69 | 3 | 1,94 s |

Nota: la comparativa procede de la model card del autor y no ha sido verificada de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 12 GB de VRAM en GPU; en CPU, unos 10 GB de RAM (según la model card).
- GPU recomendadas: una RTX 3060 de 12 GB es suficiente según el autor; cualquier GPU de consumo con 12 GB o más de VRAM debería funcionar.
- Cabe en GPU de consumo: sí, es uno de sus puntos fuertes; el autor lo diseñó para ejecutarse incluso solo con CPU en un ordenador normal.
- Despliegue: mediante el framework Jeff (`jeff-serve`), que expone un endpoint HTTP compatible con el esquema `/v1/systemone`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 0,05-0,1 segundos por publicación en GPU (RTX 3060 12 GB) y 1-2 segundos en CPU. El servidor procesa una solicitud cada vez y puede responder con código 529 ("ocupado") ante peticiones concurrentes, por lo que conviene serializar las consultas o reintentar.

## Comparativa con modelos similares

| | BareunBot-E2B | Gemma 4 E2B (base) | Gemma 4 E4B | Gemma 4 26B A4B |
|---|---|---|---|---|
| Parametros | 4,63B (según safetensors) | no disponible | no disponible | no disponible |
| Tarea | Clasificador de moderación escolar (coreano) | Modelo general instructivo | Modelo general instructivo | Modelo general instructivo |
| F1 en evaluacion de BareunBot | 0,967 | 0,816 | 0,923 | 0,964 |
| Latencia por elemento | 0,05 s | 1,94 s | 3,85 s | 3,32 s |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Uso en CPU viable | Si | Poco practico | No indicado | No indicado |

La comparación directa solo tiene sentido para la tarea de moderación escolar en coreano, donde BareunBot supera a su modelo base y a variantes mayores con una fracción de la latencia. Alternativas generales de moderación en coreano no se han comparado en el mismo conjunto de evaluación según el propio autor.

## Limitaciones y advertencias

- No debe sustituir el juicio humano: los autores insisten en usarlo como marcador de "requiere revisión del profesor" y no para disciplinar o registrar expedientes de estudiantes basándose solo en su veredicto.
- Falsos negativos documentados: insultos que mezclan variantes y tecleo en inglés ("qbdtls"), insultos con jamo y orden de letras alterados, exclusión social implícita no explícita y jerga política de aparición reciente.
- Falsos positivos documentados: publicaciones de competición amistosa entre clases.
- Obsolescencia lingüística: la jerga estudiantil cambia rápidamente; las palabras nuevas pueden no detectarse sin reentrenamiento.
- Criterios propios del dominio: bloquea todo contenido político por diseño, lo que puede no encajar con las normas de otros contextos; conviene validar los criterios antes de reutilizarlo fuera de tablones escolares.
- Monolingüe: solo ha sido entrenado con coreano; su comportamiento con otros idiomas no está evaluado.
- Concurrencia limitada: el servidor de Jeff procesa una publicación cada vez y puede devolver errores 529 bajo carga simultánea.
- Discrepancia de tamano: la model card describe el modelo como "2,3B" pero los safetensors contienen 4,63 mil millones de parámetros; conviene verificarlo antes de planificar el despliegue.
- Datos de entrenamiento no publicados, en parte por privacidad de los estudiantes, lo que dificulta auditar sesgos del dataset.
- Riesgo de alucinación: no aplicable como tal al no generar texto, pero errores de clasificación (documentados arriba) son el riesgo operativo equivalente.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes; también el modelo base Gemma 4 E2B es Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bindglam/BareunBot-E2B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Framework Jeff (repositorio y servidor de inferencia): https://github.com/firelex/jeff
