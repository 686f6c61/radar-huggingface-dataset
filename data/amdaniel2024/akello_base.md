# amDANIEL2024/akello_base

## Resumen

`akello_base` es un modelo de traducción automática neuronal desarrollado por Amanyire Daniel (usuario `amDANIEL2024`) que traduce directamente entre lugbara (`lgg`) y ateso (`teo`), dos lenguas nilóticas de Uganda, sin pasar por el inglés en ningún extremo de la cadena. Se trata de un transformer encoder-decoder pre-entrenado de 89 millones de parámetros, con 6 capas en el encoder y 6 en el decoder, dimensión de modelo 640 y tokenizador SentencePiece compartido de 32.000 piezas. La dirección de traducción se controla mediante un token de prefijo en la fuente (`<2teo>` o `<2lgg>`).

El modelo es relevante porque aborda un par lingüístico de bajos recursos para el que casi no existen sistemas de traducción publicados, y lo hace sin depender del inglés como pivote, lo que evita la propagación de errores en cascada. Sin embargo, es importante subrayar que se trata de una base pre-entrenada, no de un traductor finalizado: se entrenó exclusivamente con pares generados por traducción automática (el modelo NLLB-1.3B ajustado por Sunbird) y no ha sido afinado con datos de traducción humana. El autor publica por separado una versión afinada (`amDANIEL2024/akello_finetuned`).

El modelo se distribuye con licencia MIT, en formato safetensors (float32) y con código de inferencia propio en PyTorch (`akello.py`), por lo que no es cargable mediante `AutoModel` de la librería `transformers`. Su ventana de contexto es de 256 posiciones, aunque los pares de entrenamiento se limitaron a 128 piezas por lado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 (89M); embeddings de entrada, de decoder y proyección de salida compartidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (embeddings sinusoidales); entrenamiento limitado a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | lugbara (`lgg`) y ateso (`teo`) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32), tokenizador `spm.model` (SentencePiece), código de inferencia `akello.py` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estándar con normalización pre-LN, 6 capas en cada bloque, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560 unidades con activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados (weight tying), lo que explica que con 89M de parámetros se cubra un vocabulario de 32.000 piezas. El tokenizador es un SentencePiece compartido entrenado únicamente con texto en lugbara y ateso (procedente de tulati y del split de entrenamiento de SALT). La dirección se indica con un token de prefijo en la fuente.

El entrenamiento se realizó sobre los pares lugbara-ateso del dataset `amDANIEL2024/tulati`, usados en ambas direcciones. Es crucial entender que en tulati cada columna no inglesa es una traducción automática de una columna inglesa generada por `Sunbird/translate-nllb-1.3b-salt`, de modo que ambos lados de cada par son salida de máquina y no contienen texto humano en lugbara ni en ateso. El filtrado descartó 188.556 filas por flags de calidad, eliminó 1.071 pares con lados idénticos y 399 duplicados exactos, y tras la descontaminación frente a SALT dev/test quedaron 1.344.671 pares, de los cuales 1.999 se reservaron para validación. El pre-entrenamiento consistió en 5 épocas, 23.051 pasos de optimizador (unos 25.000 tokens objetivo por paso), precisión fp16 sobre una única GPU Kaggle T4, label smoothing de 0,1, AdamW con warmup lineal y decaimiento inverso a la raíz cuadrada (LR pico 3e-4). No se documenta RLHF ni DPO.

## Capacidades

- Traducción directa bidireccional lugbara → ateso y ateso → lugbara mediante un único modelo, seleccionando la dirección con el prefijo `<2teo>` o `<2lgg>`.
- Traducción sin pivote inglés: no requiere una etapa intermedia en inglés, a diferencia de los sistemas en cascada.
- Procesamiento por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Decodificación por beam search configurable (beam por defecto 4).
- Modelo a nivel de frase: adecuado para oraciones de hasta aproximadamente 128 piezas.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; es exclusivamente un modelo de traducción seq2seq.
- Capacidad multilingüe limitada a los dos idiomas del par; no traduce a ni desde el inglés.

## Casos de uso

- Traducción de documentación comunitaria entre lugbara y ateso: el modelo traduce directamente frases de materiales educativos o administrativos sin depender del inglés, lo que reduce la acumulación de errores de una cadena de dos saltos. Requiere revisión humana por tratarse de una base pre-entrenada.
- Preselección (pre-traducción) en flujos de traducción asistida por ordenador: dado su bajo coste computacional (89M de parámetros), puede generar borradores que un traductor humano post-edite, acelerando el trabajo en un par lingüístico con pocos recursos.
- Generación de pares sintéticos para aumentar corpus: el modelo puede producir traducciones preliminares que, tras filtrado y revisión, alimenten el entrenamiento de sistemas posteriores o de la versión afinada.
- Experimentación académica en traducción de bajos recursos: sirve como línea base reproducible para investigar el impacto del pivote inglés frente a la traducción directa en lenguas nilóticas.
- Despliegue en entornos con hardware modesto: con 89M de parámetros en float32 (unos 0,36 GB de pesos) cabe en GPU de consumo e incluso en CPU para volúmenes moderados, lo que facilita su uso en contextos con recursos limitados.
- Traducción de mensajes cortos en aplicaciones de comunicación comunitaria: para frases sueltas de chat o avisos breves, el modelo puede ofrecer una primera versión en la otra lengua, siempre con aviso de que la salida no ha sido validada por hablantes nativos.
- Integración en pipelines de procesamiento lingüístico: al ser un modelo PyTorch autónomo con código propio, puede incorporarse en scripts de preprocesamiento o en servicios internos que necesiten traducción por lotes entre ambos idiomas.

## Benchmarks y rendimiento

El autor no ha ejecutado la evaluación completa sobre SALT dev/test para esta base. Solo se publican comprobaciones rápidas al final del pre-entrenamiento (chrF++ codicioso sobre las primeras 128 frases, subconjunto ruidoso no comparable con puntuaciones de conjunto completo):

| Conjunto | Direccion | Loss | chrF++ rapido (greedy, primeras 128 frases) |
|---|---|---|---|
| tulati validacion (pares traduccion automatica, reservados) | lgg→teo | 1,842 | 47,15 |
| tulati validacion (pares traduccion automatica, reservados) | teo→lgg | 1,275 | 47,68 |
| SALT dev (traducciones humanas) | lgg→teo | 3,608 | 39,78 |
| SALT dev (traducciones humanas) | teo→lgg | 3,175 | 36,86 |

No se han publicado resultados de benchmarks completos (SALT test, BLEU, COMET) en la informacion disponible. El autor advierte que las frases de lugbara y ateso de SALT son traducciones humanas independientes de la misma frase inglesa, por lo que una referencia en un idioma no es traducción de la referencia en el otro.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,36 GB solo para los pesos en float32; con activaciones y beam search de 4, el consumo real se sitúa en torno a 1-2 GB en GPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una T4, RTX 3060, RTX 4090 o A100 funcionan sin problema. El modelo se entrenó en una única Kaggle T4.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch personalizado con código propio (`akello.py`), no es compatible con vLLM, TGI, llama.cpp, Ollama ni `transformers`; el despliegue se realiza cargando el módulo `Translator` incluido en el repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada. Por el tamaño (89M) y la decodificación con beam 4, se espera una latencia baja en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akello_base | 89M | 256 posiciones (entrenamiento 128 piezas/lado) | lugbara, ateso | MIT | Hugging Face (`amDANIEL2024/akello_base`) |
| akello_finetuned | no disponible en la informacion proporcionada | no disponible | lugbara, ateso | no disponible en la informacion proporcionada | Hugging Face (`amDANIEL2024/akello_finetuned`) |
| Sunbird/translate-nllb-1.3b-salt | 1,3B (NLLB) | no disponible en la informacion proporcionada | multiples lenguas africanas (incluye lgg y teo, segun el autor) | MIT (segun la model card) | Hugging Face (`Sunbird/translate-nllb-1.3b-salt`) |

No se dispone de otros modelos comparables específicos para el par lugbara-ateso en la informacion proporcionada. La comparación con NLLB-1.3B es pertinente porque es el generador de los datos de entrenamiento de akello_base, pero no se han publicado métricas comparativas entre ambos en esta ficha.

## Limitaciones y advertencias

- Es una base pre-entrenada, no un traductor finalizado: no se ha afinado con datos de traducción humana y el autor recomienda usar la versión afinada para producción.
- Los pares de entrenamiento son salida de máquina (NLLB-1.3B ajustado por Sunbird), por lo que el modelo hereda los errores y el estilo de ese traductor; el texto humano real (dialectos, ortografía variable, cambio de código) puede manejarse peor de lo que sugieren las métricas.
- Riesgo de pérdida o alteración de significado, especialmente en números, nombres propios y palabras poco frecuentes.
- No debe usarse en contenido médico, legal o de alto riesgo sin revisión humana.
- Modelo a nivel de frase: entradas superiores a unas 128 piezas se truncan o degradan; el contexto máximo es de 256 posiciones.
- Las salidas no han sido revisadas por hablantes nativos de lugbara ni de ateso.
- No es compatible con la API `AutoModel` de `transformers`; requiere el código propio del repositorio.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad de la traducción.
- No se documentan sesgos específicos más allá de los derivados de los datos sintéticos; no hay evaluación completa sobre SALT test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/akello_base
- Versión afinada: https://huggingface.co/amDANIEL2024/akello_finetuned
- Dataset de entrenamiento (tulati): https://huggingface.co/datasets/amDANIEL2024/tulati
- Modelo generador de los datos (Sunbird/translate-nllb-1.3b-salt): https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto del autor: domusdeiug@gmail.com
