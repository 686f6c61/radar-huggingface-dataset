# Mineral232323/nayuta-scorer-v3

## Resumen

nayuta-scorer-v3 es un conjunto de checkpoints de un reranker BERT para la selección contextual de candidatos de conversión en un IME (método de entrada) japonés. Lo desarrolla el autor de Hugging Face Mineral232323 como parte del proyecto Nayuta, un IME para Android que aprende en el propio dispositivo. En lugar de generar texto token a token, el modelo puntúa pares (lectura, representación) que ya existen en el diccionario y reordena las candidaturas según el contexto, de modo que la salida es una puntuación por candidato y no una secuencia generada.

El checkpoint principal es un modelo destilado de 6 capas con hidden 384 (unos 70 MB en PyTorch), acompañado de variantes warm-start, de learning rate reducido, un modelo pequeño de 57 MB y un modelo profesor de 12 capas y 24,7 M de parámetros (111 MB). Se distribuye también una versión ONNX fp32 de 53 MB pensada para aprendizaje online en el dispositivo. La licencia es Apache-2.0 y el único idioma declarado es el japonés.

La relevancia de esta versión (v3, publicada el 6 de noviembre de 2026) está en la mejora sobre la v2 en habla coloquial: la tasa de frases correctas pasa del 42,45 % al 67,60 % con beam 32/48 y del 45,50 % al 70,55 % con beam 128/256, según la evaluación del propio autor sobre 2.000 frases fijas. El autor atribuye la mayor parte de la ganancia a la renovación del diccionario y del modelo de bigramas (de 145k a 500k lecturas y de 60k a 100k palabras), y una parte menor al reentrenamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), modelo de scoring/reranking; checkpoint principal destilado de 6 capas con hidden 384 |
| Parametros totales | 24,7 M en el modelo profesor de 12 capas; el checkpoint principal de 6 capas no declara el recuento exacto (no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 para inferencia en CPU (usado en la medición de latencia); ONNX fp32 para aprendizaje online en dispositivo |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (.pt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT que actúa como reranker: recibe la lectura y el contexto, y devuelve una puntuación para cada candidato (lectura × representación) del diccionario. El checkpoint principal (`scorer_v3.pt`) es un modelo destilado de 6 capas con hidden 384; el profesor (`scorer_12l_v3.pt`) tiene 12 capas y 24,7 M de parámetros y se entrenó solo 1 epoch, según el autor porque quedó incompleto. Existen además dos variantes del modelo principal: `scorer_v3_warm.pt`, inicializada desde el modelo anterior, y `scorer_v3_gentle.pt`, con learning rate reducido, que es la adoptada como final de la v3. También se publica `small_v3.pt`, una variante pequeña de 57 MB.

El corpus de entrenamiento está en el repositorio separado `Mineral232323/nayuta-corpus-v3`, que el autor indica como no público. Está compuesto por 1,389 M de artículos de Wikipedia (12,0 M de frases), 1,2 M de frases de mC4 web y 0,50 M de frases del Diario de Sesiones de la Dieta de Japón, todo ello reformateado. No se especifican en la información disponible detalles sobre RLHF, DPO ni otras técnicas de alineación. La innovación destacable no está en la arquitectura sino en el enfoque: no generar texto, sino puntuar candidatos existentes para que todo el proceso quepa en un dispositivo Android, con un modelo de 70 MB y una latencia de conversión de 9,6 ms en CPU con int8 (p50, Wikipedia).

## Capacidades

- Puntuación y reordenación de candidatos de conversión de un IME japonés a partir de la lectura y el contexto.
- Selección contextual de la representación correcta entre las entradas del diccionario (no genera caracteres nuevos).
- Funcionamiento íntegro en el dispositivo (Android), sin depender de servicios en la nube.
- Aprendizaje online en el dispositivo mediante la versión ONNX fp32 (`scorer_online_fp32.onnx`).
- Procesamiento de texto de habla coloquial, con mejora notable en frases del Diario de Sesiones frente a la v2.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Teclado japonés en Android: el modelo reordena las candidaturas del diccionario según el contexto de la frase, de modo que el usuario acierta la conversión con menos pulsaciones; encaja por su tamaño (70 MB) y su latencia (9,6 ms p50 en CPU int8).
- Procesamiento de habla transcrita: la mejora en el conjunto de habla coloquial (67,60 % de frases correctas frente al 42,45 % de la v2) lo hace adecuado para convertir transcripciones del Diario de Sesiones o de conversación informal.
- Corrección de conversiones en textos administrativos y periodísticos: con un 57,10 % de frases correctas en Wikipedia y un CER del 7,29 %, sirve como capa de reranking sobre un diccionario grande en herramientas de edición.
- Aprendizaje personalizado en el dispositivo: la variante ONNX fp32 permite ajustar el scorer con el uso del usuario sin enviar datos a un servidor, lo que resulta relevante para privacidad.
- Integración en pipelines de posprocesado de texto japonés: al ser un scorer de pares lectura-representación, puede insertarse en un pipeline existente de morfología o de normalización para desambiguar candidatos.
- Evaluación de diccionarios y modelos de bigramas: el propio autor usa el scorer para medir el techo de cobertura del léxico (lattice ceiling del 90,85 % en la v3), de modo que sirve como herramienta de diagnóstico de la calidad de un diccionario IME.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto fijo de 2.000 frases (`data/eval/wiki2000.jsonl` de Wikipedia y `sns2000.jsonl` derivado del Diario de Sesiones):

| Metrica | v2 | v3 |
|---|---|---|
| Tasa de frases correctas, Wikipedia (beam 32/48) | 53,55 % | 57,10 % |
| Tasa de frases correctas, Wikipedia (beam 128/256) | 55,40 % | 58,95 % |
| Tasa de frases correctas, habla coloquial (beam 32/48) | 42,45 % | 67,60 % |
| Tasa de frases correctas, habla coloquial (beam 128/256) | 45,50 % | 70,55 % |
| CER (Wikipedia, micro) | 8,37 % | 7,29 % |
| F1 de fronteras (Wikipedia) | 0,9715 | 0,9771 |
| Precisión@3 (Wikipedia, beam 32/48) | 62,30 % | 66,50 % |
| Techo de la retícula (cobertura del diccionario) | 84,95 % | 90,85 % |
| Tiempo de conversión p50 (CPU int8, Wikipedia) | 8,7 ms | 9,6 ms |

Desglose de las causas de la mejora según el autor:

| Cambio | Wikipedia | Habla coloquial |
|---|---|---|
| Renovación de activos (diccionario 145k→500k lecturas, bigramas 60k→100k palabras) | +4,60 pt | +22,00 pt |
| Modelo destilado (sobre los mismos activos) | −1,05 pt | +3,15 pt |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint principal ocupa 70 MB en PyTorch y la versión ONNX fp32 53 MB; la inferencia está pensada para CPU, no para GPU.
- GPU recomendadas: no aplica; el autor mide la latencia en CPU con cuantización int8 (9,6 ms p50 en Wikipedia).
- Cabe en cualquier dispositivo Android moderno: el modelo principal de 70 MB y la variante pequeña de 57 MB están diseñados para ejecutarse en el propio terminal.
- Opciones de despliegue: PyTorch (`torch.load` del state dict, con la definición de arquitectura en `train/` del repositorio) y ONNX Runtime (`scorer_online_fp32.onnx`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 9,6 ms por conversión en CPU int8 sobre Wikipedia; no se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nayuta-scorer-v3 (principal) | 6 capas, hidden 384 (recuento exacto no disponible) | no disponible | Reranking de candidatos IME japonés | Apache-2.0 | Hugging Face, PyTorch y ONNX |
| nayuta-scorer-v3 (profesor) | 24,7 M (12 capas) | no disponible | Reranking de candidatos IME japonés | Apache-2.0 | Hugging Face, PyTorch |
| nayuta-scorer-v3 (small) | no disponible (57 MB) | no disponible | Reranking de candidatos IME japonés | Apache-2.0 | Hugging Face, PyTorch |
| nayuta-scorer v2 | no disponible | no disponible | Reranking de candidatos IME japonés | Apache-2.0 (según la v3) | Versión anterior del mismo proyecto |

No se dispone de información sobre modelos comparables de otros autores para esta tarea específica de reranking de IME japonés.

## Limitaciones y advertencias

- Solo soporta japonés; no hay capacidades multilingües declaradas.
- No es un modelo generativo: únicamente puntúa candidatos que ya existen en el diccionario, por lo que su calidad depende del techo de cobertura léxica (90,85 % en la v3 sobre Wikipedia).
- El modelo profesor se entrenó solo 1 epoch y el autor lo considera incompleto; el checkpoint principal destilado rinde aproximadamente 1 punto por debajo de la v2 en Wikipedia, lo que el autor atribuye a esa circunstancia.
- El corpus de entrenamiento (`nayuta-corpus-v3`) no es público, lo que dificulta la reproducibilidad y la auditoría de sesgos.
- No se documentan sesgos conocidos, riesgos de alucinación ni evaluaciones de robustez fuera de los conjuntos fijados por el autor.
- El repositorio no incluye tokenizador ni diccionario; hay que usar los activos de la aplicación, lo que complica la reutilización independiente.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento (Wikipedia, mC4, Diario de Sesiones) antes de desplegarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mineral232323/nayuta-scorer-v3
- Perfil del autor en Hugging Face: https://huggingface.co/Mineral232323
- Repositorio del proyecto Nayuta: https://github.com/mineral232323/nayuta
- Artículo del autor sobre el IME Nayuta: https://note.com/mineral232323/n/n7fb04e0436d7
- Corpus de entrenamiento (no público): https://huggingface.co/Mineral232323/nayuta-corpus-v3
