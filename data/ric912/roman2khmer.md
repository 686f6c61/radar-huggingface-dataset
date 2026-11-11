# ric912/roman2khmer

## Resumen

roman2khmer es un sistema de transliteración inversa que convierte texto jemer escrito con caracteres latinos (romanización informal, sin ortografía fija) de vuelta a escritura jemer. Lo desarrolla el autor independiente ric912 y se publica como una *research preview* (v0.1.0) bajo licencia CC BY-SA 4.0. El problema que aborda es cotidiano en Camboya: muchos usuarios escriben jemer con letras latinas al chatear, y no existe una norma de romanización, por lo que la conversión automática a escritura nativa es ambigua.

No es un checkpoint de Transformers ni un modelo de lenguaje generativo al uso, pese a la etiqueta `text2text-generation`. Se compone de tres piezas pequeñas ejecutadas con NumPy en CPU: un modelo de palabras carácter a carácter (transformer encoder–decoder de 2,6 M de parámetros), un modelo inverso de rescoring (jemer → latín) y un modelo de bigramas de palabras jemer extraído de texto web que selecciona la mejor combinación para la frase completa. El paquete completo ocupa unos 27 MB en tres ficheros `.npz`.

Es relevante ahora por su enfoque de "modelo diminuto + canal ruidoso + bigramas" frente a la tendencia de usar LLM grandes para tareas de normalización lingüística, y porque documenta con transparencia sus límites: evaluación sobre mensajes generados por LLM, un único anotador nativo y ausencia de un conjunto de test de chat real multi-escritor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder–decoder a nivel de carácter (modelo de palabras) + modelo inverso de rescoring + modelo de bigramas de palabras |
| Parámetros totales | 2,6 M (modelo de palabras `translit.npz`); `reverse.npz` misma arquitectura; `khmer_bigram.npz` estadísticas de bigramas |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa mensajes de chat de 2 a 15 palabras según la documentación) |
| Tipos de cuantización | no aplica (pesos en `.npz` de NumPy, sin cuantización publicada) |
| Idiomas soportados | jemer (km); entrada en romanización latina informal |
| Licencia | CC BY-SA 4.0 para los ficheros del modelo; MIT para el código (wheel) |
| Formato de pesos | `.npz` (NumPy): `translit.npz` (10 MB), `reverse.npz` (10 MB), `khmer_bigram.npz` (7 MB) |

## Arquitectura y entrenamiento

El sistema combina tres etapas. Primero, un transformer encoder–decoder carácter a carácter entrenado desde cero (anchura 192, 3 capas de encoder y 3 de decoder, 4 cabezas, 2,6 M de parámetros) que propone 8 grafías jemer por palabra latina mediante búsqueda por haz (*beam search*). Segundo, un modelo de la misma arquitectura entrenado en la dirección inversa (jemer → latín) que reescala cada candidato con `1.0 × log P(latín tecleado | candidato)`, de modo que las propuestas no respaldadas por las letras escritas pierden prioridad (rescoring por canal ruidoso). Tercero, un modelo de bigramas de palabras jemer contado a partir de texto web que elige un candidato por palabra para toda la frase mediante programación dinámica, y que puede fusionar dos palabras latinas contiguas en una sola palabra jemer (*pon man* → ប៉ុន្មាន). El jemer ya presente en el mensaje se conserva y se usa como contexto.

Los datos de entrenamiento son pares (grafía romanizada, palabra jemer): pares públicos de romanización Chhunneng (MIT), pares de nombres y préstamos extraídos de Wikipedia en jemer (CC BY-SA 4.0) y de FineWeb-2 (ODC-By 1.0), grafías romanizadas de palabras jemer comunes generadas con Gemini y GPT y filtradas por reglas fijas, y grafías tecleadas y revisadas por el propio autor. Una tarea auxiliar usó el léxico de pronunciación jemer de Google (CC BY 4.0). `khmer_bigram.npz` contiene estadísticas de palabras y pares derivadas de FineWeb-2 (sin texto). Se excluyeron las grafías generadas solo por Claude y los borradores de LLM sin modelo generador registrado. No se documenta uso de RLHF ni DPO.

## Capacidades

- Conversión de texto jemer romanizado informal a escritura jemer, palabra a palabra y a nivel de frase.
- Propuesta de múltiples candidatos por palabra (`candidates("mok", 3)` devuelve grafías con sus puntuaciones).
- Rescoring por canal ruidoso para descartar candidatos incompatibles con las letras tecleadas.
- Selección contextual mediante bigramas de palabras que elige una grafía por palabra para toda la frase.
- Fusión de dos palabras latinas contiguas en una única palabra jemer.
- Conservación y uso como contexto del jemer ya presente en el mensaje (entrada mixta latín + jemer).
- Ejecución en CPU con NumPy, sin GPU ni framework de deep learning.
- Caché de palabras repetidas para acelerar la conversión.
- Modo sin rescoring (`gamma=0`) para mayor velocidad.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Normalización de mensajes de chat: convertir mensajes escritos en romanización informal a escritura jemer antes de almacenarlos o mostrarlos, aprovechando el modelo de bigramas para resolver ambigüedades entre palabras vecinas.
- Moderación y búsqueda de contenido: transformar texto romanizado a jemer para que los sistemas de filtrado y búsqueda que operan sobre escritura nativa puedan indexarlo y compararlo.
- Preprocesado para pipelines de PLN en jemer: usar la salida como paso previo a análisis morfológico, etiquetado o traducción, dado que el sistema es ligero y ejecutable en CPU.
- Herramientas de accesibilidad para teclados latinos: integrar el conversor en entradas de texto donde el usuario no dispone de teclado jemer y escribe en transliteración.
- Enriquecimiento de corpus: generar pares (romanización, jemer) para entrenar o evaluar otros sistemas de transliteración, con la advertencia de que la calidad está medida sobre datos sintéticos.
- Aplicaciones de bajo recurso: desplegar en dispositivos sin GPU (portátiles, servidores modestos) gracias a su consumo de unos 300 MB de RAM y su latencia de aproximadamente 0,9 s por mensaje.
- Investigación en transliteración: servir como línea base reproducible para comparar enfoques de canal ruidoso y bigramas frente a LLM grandes.

## Benchmarks y rendimiento

| Medida | Resultado |
|---|---|
| Tasa de error de carácter (CER) en 450 mensajes de chat escritos por LLM (sin espacios; referencias también escritas por LLM y sin revisar; conjunto de desarrollo, cifra optimista) | 8,95 % |
| Mensajes exactos, mismo conjunto | 36,9 % |
| Test de palabras nuevas: 148 palabras poco comunes tecleadas por un anotador nativo (179 grafías), cada una convertida aisladamente; media sobre palabras de la proporción de grafías escritas exactamente | 58,2 % |
| Rescoring activado vs. desactivado, modelo de palabras anterior, 165 mensajes puntuados una vez antes de cualquier decisión de release | CER 10,56 % → 9,37 %; preferencia a ciegas 17 a 7 (5 iguales, 11 ambos malos) |

No se han publicado resultados en benchmarks públicos estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU con NumPy.
- RAM estimada: unos 300 MB al cargar el conversor.
- GPU: no necesaria; no se documenta soporte de aceleración por GPU.
- Cabe en cualquier equipo de consumo; las mediciones se hicieron en un portátil con Intel i7-8750H.
- Despliegue: paquete Python `roman2khmer` (wheel incluido en el repositorio), que instala solo `roman2khmer` y `numpy`; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint de Transformers.
- Latencia: aproximadamente 0,9 s por mensaje de chat (2 a 15 palabras) con todas las palabras nuevas; 0,4 s sin rescoring; la carga tarda menos de un segundo; las palabras repetidas se cachean.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roman2khmer | Transformer carácter + rescoring + bigramas | 2,6 M por modelo | no disponible | CC BY-SA 4.0 (pesos), MIT (código) | Hugging Face, wheel en el repo |
| Alternativas de transliteración jemer | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de transliteración romanizado → jemer con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Un único anotador: todos los juicios humanos y las palabras de test tecleadas proceden de un solo hablante nativo.
- Sin conjunto de test de chat real multi-escritor: los resultados de mensajes usan mensajes y referencias generados por LLM.
- Persisten errores de contexto, por ejemplo ព្រុស "ladrar" frente a la más común ព្រោះ "porque".
- Abreviaturas de chat que representan palabras o nombres completos (*fb*, *BKK*) no se resuelven correctamente.
- Las palabras en inglés no siempre se escriben en jemer (*ok*).
- Pueden aparecer no-palabras: alrededor del 2 % de las palabras de salida en los mensajes de desarrollo quedan fuera de la lista de palabras jemer y del vocabulario de pares (estar fuera de una lista no prueba que una palabra sea incorrecta).
- La coincidencia exacta subestima las grafías aceptables.
- Es una *research preview* v0.1.0; no se recomienda como componente crítico de producción sin evaluación propia sobre datos reales.
- Licencia CC BY-SA 4.0 en los pesos: obliga a atribución (repositorio y `NOTICE.md`), indicación de cambios y compartir adaptaciones bajo la misma licencia; cubre solo los derechos del autor, ya que las fuentes originales mantienen sus propios términos.
- El código (wheel) es MIT, con condiciones distintas de las de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ric912/roman2khmer
- Repositorio con wheel y ficheros del modelo: https://huggingface.co/ric912/roman2khmer (revisión `67eacafe5bb9592622ebcdd6d64695eb3b6b69f6`)
- Informe técnico: `technical-report.pdf` (incluido en el repositorio)
- Avisos de licencia y fuentes: `NOTICE.md` (incluido en el repositorio)
- Dataset de referencia: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
