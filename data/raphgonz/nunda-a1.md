# RaphGonz/nunda-a1

## Resumen

Nunda A1 es un adaptador LoRA de rango 16 entrenado sobre SmolLM2-360M (HuggingFaceTB) que implementa un modelo de citación para tareas de question answering con recuperación (RAG). En lugar de generar texto libre, el modelo produce secuencias de acciones estructuradas que citan proposiciones de un expediente o caso: identificadores como `P:7 ET P:12 FIN`, abstención explícita (`ABSTENTION`) o marcas de conflicto (`CONFLIT … FIN_CONFLIT`), decodificadas bajo una máscara gramatical. Está desarrollado por RaphGonz como parte del proyecto de investigación Nunda, cuyo código es necesario para cargar y ejecutar los pesos.

El modelo añade sobre el transformer base nuevas cabezas (lexicon, pointers y selection), nuevos vectores de token y un sesgo de atención relacional aprendido δ, con un valor por capa, cabeza y relación entre proposiciones. Los pesos publicados en `model.safetensors` contienen únicamente los componentes entrenados (LoRA, cabezas, vectores y δ), no el modelo base completo.

Su relevancia radica en el enfoque: sustituye la generación libre por citación verificable con abstención calibrada, lo que reduce las alucinaciones en dominios documentales. Los resultados publicados en validación (F1 de 0,748 en HotpotQA con distractores y solo un 4,3 % de abstenciones erróneas) lo sitúan por delante del checkpoint anterior A0 en precisión de citación, a costa de un F1 ligeramente inferior al del modelo B-S en esa misma tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M) con adaptador LoRA rank 16, cabezas adicionales (lexicon, pointers, selection), nuevos vectores de token y sesgo de atención relacional δ |
| Parametros totales | 14.816.001 (pesos entrenados publicados en safetensors; el modelo base SmolLM2-360M es aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las entradas sintéticas de entrenamiento son de hasta 2.500 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere el código del proyecto para cargarse sobre SmolLM2-360M) |

## Arquitectura y entrenamiento

Nunda A1 parte de SmolLM2-360M, un transformer decoder-only de 360 M de parámetros, y le superpone un adaptador LoRA de rango 16 junto con módulos nuevos: una cabeza de léxico, una red de punteros (pointer network) para seleccionar proposiciones del expediente de entrada, una cabeza de selección y vectores de token adicionales. Además incorpora un sesgo de atención relacional δ aprendido, con un valor por capa, cabeza y relación entre proposiciones, que modula cómo atiende el modelo a las relaciones estructurales del caso. La decodificación se realiza siempre bajo una máscara gramatical que restringe la salida al espacio de acciones válido (citas, abstención, conflicto), lo que evita la generación de texto libre.

El entrenamiento se realizó sobre una mezcla de datos: un 40 % de expedientes sintéticos, un 20 % de HotpotQA, un 15 % de PIAF, un 15 % de preguntas sobre derecho francés generadas por Qwen2.5-7B-Instruct a partir de LEGI, un 5 % de FinQA y un 5 % de SQuAD 2.0. El modelo se inicializa desde el checkpoint A0 (`nunda-a0`), al que se le elimina la cabecera [REL] y se le añade δ inicializado a cero, entrenando durante 2 épocas en una única RTX 3090. Las entradas están anonimizadas: los nombres se sustituyen por slots (`⟨PER 3⟩`) mientras que números y fechas se conservan.

## Capacidades

- Citación de proposiciones: responde seleccionando identificadores de proposiciones del expediente de entrada (`P:7 ET P:12 FIN`) en lugar de generar texto libre.
- Abstención explícita: emite `ABSTENTION` cuando la evidencia no permite responder, con una tasa de abstención del 0,989 en validación sintética.
- Detección de conflictos: puede marcar contradicciones entre proposiciones mediante acciones `CONFLIT … FIN_CONFLIT`.
- Question answering con recuperación (RAG): diseñado para operar sobre documentos recuperados y citar la evidencia utilizada.
- Anonimización robusta: maneja entradas donde las entidades personales han sido reemplazadas por slots, conservando números y fechas.
- Multilingüe limitado: soporta francés e inglés.
- Salida restringida por gramática: la decodificación con máscara gramatical garantiza que toda salida pertenece al espacio de acciones válido.
- No soporta tool calling, function calling ni razonamiento multi-paso en texto libre; su interfaz es la secuencia de acciones de citación.

## Casos de uso

- Asistencia legal documental: dado un expediente con proposiciones numeradas y una consulta, el modelo devuelve las proposiciones exactas que sustentan la respuesta, lo que permite a un revisor humano verificar cada cita. Es adecuado por su entrenamiento con preguntas sobre derecho francés derivadas de LEGI.
- Auditoría de respuestas en RAG: integrado como capa final de un pipeline de recuperación, sustituye la generación libre por citas verificables y una abstención calibrada cuando la evidencia es insuficiente (4,3 % de abstenciones erróneas en HotpotQA).
- Control de calidad de bases documentales: la detección de conflictos (`CONFLIT … FIN_CONFLIT`) permite señalar automáticamente proposiciones contradictorias dentro de un mismo corpus.
- Análisis financiero sobre informes: entrenado parcialmente con FinQA, puede citar las proposiciones de un informe que respaldan una cifra o conclusión, manteniendo números y fechas sin anonimizar.
- Verificación de hechos multi-salto: con HotpotQA como parte del entrenamiento, puede resolver preguntas que requieren combinar evidencia de varias proposiciones y citar todas las utilizadas.
- Procesamiento de documentos anonimizados: al manejar slots de entidades (`⟨PER 3⟩`), es apto para pipelines donde los datos personales se han enmascarado previamente, sin degradar la citación de números y fechas.
- Investigación en atribución y abstención: sirve como banco de pruebas reproducible (código público en GitHub) para estudiar sesgos de atención relacional y calibración de abstención en modelos pequeños.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (827 ejemplos sintéticos con entradas de hasta 2.500 tokens; 999 ejemplos de HotpotQA):

| Modelo | F1 nivel-0 sintético | Abstención | F1 HotpotQA (con distractores) | Abstenciones erróneas (HotpotQA) |
|---|---|---|---|---|
| A0 | 0,864 | 0,978 | 0,676 | 14,6 % |
| **A1** | **0,872** | **0,989** | 0,748 | 4,3 % |
| B-S (`nunda-b-s`) | 0,845 | 0,950 | 0,769 | 2,4 % |

A1 mejora a A0 en F1 sintético, abstención y F1 en HotpotQA, y reduce drásticamente las abstenciones erróneas (de 14,6 % a 4,3 %). Frente a B-S, A1 es mejor en el dominio sintético y en abstención, pero ligeramente inferior en F1 de HotpotQA y en tasa de abstenciones erróneas.

## Requisitos de hardware

- VRAM estimada: el adaptador publicado ocupa 0,1 GB; sumado al modelo base SmolLM2-360M en precisión completa, la inferencia requiere del orden de 1-2 GB de VRAM, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: el autor entrenó en una única RTX 3090; para inferencia basta con GPUs consumer de gama media, aunque no se especifican modelos concretos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, dado el tamaño del modelo base, si bien no hay confirmación oficial.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama o TGI, ya que requiere el código del proyecto Nunda para cargar las cabezas, vectores y el sesgo δ sobre SmolLM2-360M. La librería declarada es PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 HotpotQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nunda A1 | 14,8 M entrenados + SmolLM2-360M base | no disponible | 0,748 | CC BY-SA 4.0 | Hugging Face + GitHub |
| Nunda A0 | mismo esquema | no disponible | 0,676 | no disponible | Hugging Face (`nunda-a0`) |
| Nunda B-S | no disponible | no disponible | 0,769 | no disponible | Hugging Face (`nunda-b-s`) |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada; la comparación se limita a los checkpoints de la misma familia Nunda.

## Limitaciones y advertencias

- No genera texto libre: su salida es siempre una secuencia de acciones de citación, por lo que no sirve como modelo conversacional general.
- Requiere código externo: los pesos no se pueden cargar con `transformers` de forma estándar; es imprescindible el repositorio GitHub del proyecto para reconstruir la arquitectura (cabezas, vectores y δ).
- Idiomas limitados a francés e inglés; no hay soporte declarado para castellano.
- Riesgo de alucinación estructural: aunque la máscara gramatical impide texto inválido, el modelo puede citar proposiciones incorrectas o abstenerse erróneamente; la model card reporta un 4,3 % de abstenciones erróneas en HotpotQA.
- Sesgos de dominio: el entrenamiento incluye un 15 % de preguntas sobre derecho francés generadas por otro modelo (Qwen2.5-7B-Instruct), lo que puede introducir sesgos del generador y del corpus LEGI.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obligación de compartir bajo la misma licencia las obras derivadas; hay que respetar además las licencias de los datos de entrenamiento (HotpotQA, SQuAD 2.0 y PIAF son CC BY-SA; FinQA es MIT; LEGI es Licence Ouverte 2.0; SmolLM2-360M es Apache 2.0).
- Sin descargas ni likes en Hugging Face en el momento de la consulta, y sin resultados de benchmarks fuera de la validación interna del autor: no hay evidencia de rendimiento en producción.
- No se han publicado datos de cuantización, latencia ni contexto máximo efectivo, lo que dificulta planificar su despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaphGonz/nunda-a1
- Código del proyecto Nunda: https://github.com/RaphGonz/Nunda
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Checkpoint previo A0: https://huggingface.co/RaphGonz/nunda-a0
- Checkpoint B-S: https://huggingface.co/RaphGonz/nunda-b-s
