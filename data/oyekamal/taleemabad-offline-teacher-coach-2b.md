# oyekamal/taleemabad-offline-teacher-coach-2b

## Resumen

Taleemabad Offline Teacher Coach 2B es un modelo de lenguaje de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) afinado a partir de Qwen/Qwen3.5-2B por el equipo de Taleemabad, una organización educativa paquistaní. Su propósito es actuar como entrenador pedagógico para docentes de educación primaria en Pakistán, funcionando íntegramente en un teléfono Android de gama media sin conexión a internet. El docente plantea un problema de aula en inglés, urdu o roman urdu, y el modelo responde en el mismo idioma y alfabeto con una acción concreta para el día siguiente, siguiendo el manual de coaching de Taleemabad.

El modelo se distribuye únicamente como archivo GGUF cuantizado en Q4_K_M (1,27 GB), pensado para cargarse con llama.cpp en el dispositivo. La relevancia actual reside en su enfoque de privacidad radical (nada de lo que escribe el docente sale del teléfono) y en su diseño para contextos con conectividad limitada, un escenario común en escuelas rurales. La ventana de contexto recomendada es de 2048 tokens, suficiente para el prompt de sistema con notas del manual, el ejemplo recuperado y la consulta del docente.

El entrenamiento se basa en un ajuste supervisado (SFT) sobre unas 5600 conversaciones de coaching en tres idiomas, con evaluación automatizada sobre 61 escenarios no vistos. La licencia Apache 2.0 permite uso comercial y modificación, aunque el modelo está claramente orientado a un dominio vertical muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B; detalles internos de atención no disponibles) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (configuración de referencia en el dispositivo) |
| Tipos de cuantizacion | Q4_K_M (único publicado) |
| Idiomas soportados | Inglés (en), urdu (ur), roman urdu |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `coach-q4_k_m.gguf`, 1,27 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only denso de aproximadamente 1,88 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA a 16 bits (no QLoRA, que el autor desaconseja para Qwen3.5) en una única GPU Colab L4, durante 1190 pasos ejecutados en fragmentos de 40 minutos con puntos de control en Google Drive. El conjunto de entrenamiento de la versión v5 (la publicada) consta de unas 5600 interacciones docente-coach: 3100 procedentes de rondas anteriores y 2450 destiladas en la ronda 10 a partir de un modelo frontera que respondió a escenarios nuevos usando exactamente el prompt del teléfono. Cada intercambio se conservó solo si superaba un verificador de reglas y un guardián de bienestar, y se emparejó con las notas del manual que la aplicación recuperaría en el dispositivo, de modo que el prompt de entrenamiento y el del teléfono coinciden byte a byte.

Una versión anterior (v1) añadía DPO on-policy sobre una fracción del delta aprendido, pero el conjunto SFT ampliado por sí solo superó ese enfoque, por lo que la v2 se distribuye únicamente con SFT. Los escenarios de entrenamiento son sintéticos y anonimizados, sin docentes, niños, escuelas ni teléfonos reales, y se filtró la superposición léxica con los 61 escenarios de evaluación. La innovación principal no es arquitectónica sino de despliegue: recuperación en el dispositivo (BM25 más índice doc2query sobre el manual) que inyecta notas y un ejemplo resuelto en el prompt de sistema, y un guardián de bienestar con verificación de reglas y regeneración para preguntas sensibles.

## Capacidades

- Generación de texto conversacional en inglés, urdu (alfabeto nastaliq) y roman urdu, respondiendo en el mismo idioma y alfabeto que el docente.
- Coaching pedagógico estructurado: propone una acción concreta para el día siguiente con las palabras exactas o los pasos a seguir.
- Seguimiento del manual de Taleemabad mediante notas recuperadas e inyectadas en el prompt de sistema.
- Cumplimiento de reglas de seguridad pedagógica: no avergonzar, no clasificar, no leer puntuaciones en voz alta, no saltarse la práctica ni el control de salida, no mover a un niño de grupo por un solo buen día.
- Formulación de como máximo una pregunta aclaratoria, solo si falta un dato clave.
- Respuestas breves (menos de 120 palabras según el prompt de referencia).
- Ejecución completamente offline en llama.cpp, sin tool calling ni capacidades de agente multi-paso documentadas.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento de múltiples pasos.

## Casos de uso

- Coaching docente en aulas rurales sin conectividad: el docente escribe su problema en el teléfono y recibe una acción concreta para el día siguiente, con el modelo cargado desde el almacenamiento local y sin enviar datos a ningún servidor.
- Formación inicial de docentes de primaria: el modelo puede usarse como apoyo en sesiones de práctica para resolver dudas sobre conciencia fonológica (por ejemplo, confusión entre el nombre y el sonido de una letra), alineado con el manual de Taleemabad.
- Despliegue en escuelas con recursos limitados: el GGUF de 1,27 GB puede distribuirse entre dispositivos por Nearby Share o USB, y ejecutarse en chips Android de gama media de 2023 con 1,6 GB de RAM a contexto de 2k.
- Soporte multilingüe en el aula: responde en inglés, urdu o roman urdu, lo que permite atender a docentes con distintos niveles de alfabetización digital y lingüística.
- Asistencia pedagógica con salvaguarda de bienestar: ante casos de posible daño o miedo infantil, la aplicación aplica una verificación de reglas y regeneración para derivar al contacto de protección escolar, en lugar de confiar solo en el modelo.
- Evaluación y mejora de programas educativos: el arnés de evaluación y los escenarios sintéticos permiten a organizaciones medir el cumplimiento de reglas pedagógicas y de seguridad antes de desplegar variantes del modelo.
- Investigación sobre modelos pequeños en dominios verticales: sirve como referencia de ajuste SFT con LoRA de 16 bits en una sola GPU L4 y de alineación entre prompt de entrenamiento y prompt de producción.

## Benchmarks y rendimiento

Evaluación sobre 61 escenarios no vistos, con tres puertas automáticas juzgadas por un modelo independiente, media de tres ejecuciones, con el guardián de bienestar de la aplicación en el bucle:

| Metrica | Resultado | Umbral |
|---|---|---|
| Las tres comprobaciones pasan (alfabeto correcto, ninguna regla rota, paso concreto) | 96,2% | 95% |
| Ninguna regla prohibida rota (avergonzar, clasificar, puntuaciones en voz alta, saltarse práctica, mover a un niño en un día) | 96,7% | 97% |
| Ofrece un paso concreto | 99,5% | No disponible |

Sin el guardián de bienestar en el bucle: 96,7 / 96,7 / 100. En comparación ciega cara a cara contra las respuestas de un modelo frontera a los mismos 61 escenarios, en ambos órdenes: el modelo pequeño gana 7 y empata 10 de 61 con el banco de ejemplos original de la aplicación, y gana 16 y empata 9 de 61 con el banco ampliado de la app 0.2.2 (6859 intercambios fundamentados en el manual; 17 de 61 cuando se elimina todo ejemplo con superposición léxica superior a 0,25 con un escenario de prueba). Un segundo juez califica 56 de 61 respuestas como aceptables en una rúbrica absoluta. Las propias respuestas de referencia obtienen un 98,9% en las mismas puertas.

Versiones: v2 (16-11-2026), SFT v5, es el archivo publicado. En evaluación (17-11-2026): una variante Qwen3.5-4B con la misma receta más pares de preferencia de edición mínima, que igualó a la referencia en 36 de 61 escenarios en la primera puntuación. v1 (15-11-2026), SFT v4 más DPO ×0,25, obtuvo 95,6 / 95,6 / 100 y gana o empata 13 de 61.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB de RAM a contexto de 2k con Q4_K_M.
- GPU recomendadas: no se especifican GPU de escritorio; el objetivo es un teléfono Android de gama media de 2023. Para desarrollo, el autor usó una GPU Colab L4 para el entrenamiento LoRA (no para inferencia).
- Cabe en GPU de consumo: sí, por tamaño (1,27 GB de pesos), aunque no hay cifras publicadas de rendimiento en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: llama.cpp (build b12144 o posterior, que conozca la arquitectura qwen35) y la aplicación Android de referencia que carga el GGUF desde el almacenamiento del teléfono.
- Latencia y throughput: 8 a 15 tokens por segundo en chips Android de gama media de 2023.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Taleemabad Offline Teacher Coach 2B | 1,88 mil millones | 2048 | Apache 2.0 | GGUF Q4_K_M | Coaching docente offline en inglés, urdu y roman urdu |
| Qwen/Qwen3.5-2B (modelo base) | No disponible | No disponible | No disponible | No disponible | Modelo generalista; el coach deriva de él mediante LoRA y SFT |
| Variante Qwen3.5-4B (en evaluación) | No disponible | No disponible | No disponible | No disponible | Misma receta más pares de preferencia; igualó a la referencia en 36 de 61 escenarios en primera puntuación |

No se dispone de datos publicados de otros modelos comparables de coaching docente offline en la información proporcionada.

## Limitaciones y advertencias

- Las respuestas en alfabeto urdu son algo más débiles que las respuestas en inglés.
- El modelo a veces ofrece dos acciones en lugar de una, pese a la instrucción de dar una sola.
- Ante preguntas raras de bienestar (un niño que parece herido o asustado), la respuesta debe derivar al contacto de protección escolar; la aplicación lo garantiza con una verificación de reglas y regeneración, no solo con el modelo.
- Los números de seguridad medidos (96,2 / 96,7 / 99,5) solo se sostienen con las notas del manual recuperadas e inyectadas en el prompt de sistema; sin ellas el modelo responde con el idioma y la forma correctos, pero no se garantizan esas cifras.
- El modelo está entrenado para un dominio vertical muy concreto (coaching docente de primaria en Pakistán) y no es un modelo generalista.
- Riesgo de alucinación no cuantificado en la información disponible, mitigado parcialmente por el verificador de reglas y el guardián de bienestar en la aplicación.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y aviso.
- Para producción, el autor advierte que el modelo no debe usarse como único mecanismo de salvaguarda infantil; se requiere el guardián de la aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oyekamal/taleemabad-offline-teacher-coach-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Taleemabad: https://taleemabad.com
- Repositorio del proyecto (scripts de entrenamiento, arnés de evaluación, aplicación Android): no disponible (el autor indica que se publicará cuando sea público)
