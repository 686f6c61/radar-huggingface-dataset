# Andy5k/Qwen3.5-0.8B-hand-quant

## Resumen

Qwen3.5-0.8B-hand-quant es una cuantización GGUF del modelo base Qwen/Qwen3.5-0.8B (familia Qwen3.5 de Alibaba Cloud), publicada por el usuario Andy5k. No se trata de un modelo nuevo, sino de una recompresión del mismo con una metodología poco habitual: en lugar de usar `llama-quantize` o `llama-imatrix` con una receta fija, el autor calculó un mapa de sensibilidad por tabla de pesos midiendo el flujo de señal con una copia en coma flotante del propio modelo, y asignó el presupuesto de bits por tabla mediante un optimizador. El resultado ocupa 498,5 MB y usa exclusivamente formatos estándar de llama.cpp, por lo que carga en builds sin modificar.

El modelo base tiene 752.393.024 parámetros reales (etiquetado comercialmente como "0.8B") y es un transformer híbrido con capas de atención lineal y componentes de espacio de estados (ssm) según se deduce de los nombres de tensor del GGUF. La cuantización resultante promedia 5,18 bits por peso y alcanza una divergencia KL media de 0,015704 sobre un conjunto de evaluación independiente, lo que la sitúa en calidad cercana a Q4-XL pero en un archivo más pequeño.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización guiada por medición que puede replicarse; por otro, advierte de que el resultado no alcanza el listón de calidad Q5 pese al mayor número de bits medios, y de que el cuello de botella es la tabla de vocabulario (33,8% de los pesos, con embeddings atados a la cabeza de salida).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (18 capas `attn_qkv`) y componentes de espacio de estados (`ssm_out`, `ssm_*`); detalles completos del modelo base no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (las mediciones se hicieron con `-c 2048`, que no implica que sea el máximo) |
| Tipos de cuantizacion | Mezcla por tabla: IQ4_XS (4,25 bits), Q5_K (5,5 bits), Q6_K (6,56 bits); normas y tensores pequeños en F32/BF16 sin tocar |
| Idiomas soportados | no disponible (el modelo base se describe como multilingüe en la serie Qwen3.5, sin lista concreta) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (único archivo, 498.454.560 bytes) |

## Arquitectura y entrenamiento

El GGUF corresponde al modelo base Qwen/Qwen3.5-0.8B, del que esta ficha no aporta detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO): esa información no está disponible en el material proporcionado. Lo que sí se deduce del desglose de tensores es una arquitectura híbrida: 18 capas con proyecciones `attn_qkv` y `attn_gate` (atención lineal), 18 tablas `ssm_out` y otras `ssm_*` (componentes de espacio de estados), y 24 tablas por cada una de las tres matrices del bloque feed-forward (`ffn_gate`, `ffn_up`, `ffn_down`). La tabla de embeddings está atada a la cabeza de salida (`token_embd`), lo que la convierte en el tensor más grande del modelo.

La innovación está en el proceso de cuantización, no en el modelo. El autor ejecutó el modelo en coma flotante sobre una segunda copia para medir, tabla por tabla, cuánta señal atraviesa cada columna de entrada; minimizó después el error de redondeo donde la señal es fuerte mediante un ajuste de mínimos cuadrados ponderado para las escalas de bloque y un descenso por coordenadas entero sobre los códigos y escalas almacenados. Cada tabla se evaluó por separado para construir el mapa de sensibilidad, y un optimizador de presupuesto repartió los 485,5 MB disponibles entre IQ4_XS, Q5_K y Q6_K. Las estadísticas se tomaron de la mitad del texto de ajuste y las mediciones de la otra mitad, de modo que las decisiones de diseño se validaron fuera de muestra. No se usó `llama-imatrix`, ni archivo de calibración, ni receta publicada; el redondeo se escribió desde cero en NumPy.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la model card etiqueta el modelo como conversacional.
- Razonamiento e instrucciones: la serie Qwen3.5 se describe en fuentes externas como una mejora en razonamiento y seguimiento de instrucciones respecto a Qwen3; no hay evaluación específica en el material proporcionado.
- Multilingüismo: la serie Qwen3.5 se presenta como multilingüe, pero no se detalla la lista de idiomas ni su calidad relativa.
- Procesamiento de imagen y texto: la página del modelo base en Hugging Face lo clasifica como Image-Text-to-Text, lo que sugiere capacidades multimodales de entrada; no se confirma en la información de esta cuantización.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Compatibilidad de despliegue: carga en cualquier build de llama.cpp desde b11928 o posterior y en cualquier herramienta que lea GGUF.

## Casos de uso

- Inferencia en portátiles y equipos sin GPU dedicada: con 498,5 MB y 5,18 bits por peso, el archivo cabe holgadamente en RAM y se ejecuta en CPU; el autor reporta 77,8 tok/s de generación y 1202 tok/s de procesamiento de prompt en un MacBook Air M4 con 16 GB.
- Despliegue en el borde y dispositivos móviles: el modelo base figura en Qualcomm AI Hub como modelo para despliegue en borde, y esta cuantización reduce el peso a menos de 0,5 GB, lo que facilita empaquetarlo en aplicaciones locales.
- Prototipado rápido de asistentes conversacionales: al cargar en `llama-server` sin modificaciones, sirve como backend HTTP para probar flujos de chat multi-turno antes de invertir en un modelo mayor.
- Generación de texto en pipelines por lotes con requisitos de latencia moderados: el throughput de prompt de 1202 tok/s permite procesar contextos de entrada largos en CPU Apple Silicon con una penalización de generación razonable.
- Evaluación comparativa de técnicas de cuantización: al publicar `data/scores.csv`, `data/tensor-types.csv` y `data/alloc-c1.json`, sirve como referencia reproducible para investigar asignación de bits por tabla frente a recetas fijas.
- Sustituto de cuantizaciones IQ4_XS en entornos con restricción de disco: con un tamaño casi idéntico (498,5 MB frente a 492,6 MB), ofrece una KLD media de 0,0157 frente a 0,0594, es decir, aproximadamente 3,8 veces menor, a costa de una velocidad de prompt superior en la medición del autor.
- Pruebas de regresión de calidad de cuantización: la comparación a temperatura 0 contra la referencia BF16 (3 de 40 respuestas idénticas, primera divergencia en la posición 9 de media) permite calibrar umbrales de aceptación en pipelines de CI.

## Benchmarks y rendimiento

Mediciones del autor con llama.cpp b11928 (commit `7eed6b768`), backend Metal, `-c 2048`, referencia BF16. La KLD se calcula sobre un conjunto de evaluación que el redondeo nunca vio.

| Archivo | Bytes | KLD media | KLD 99% | Misma palabra top | PPL | Generación (tok/s) | Prompt (tok/s) |
|---|---|---|---|---|---|---|---|
| **hq-c2-mix-full (este)** | 498.454.560 | 0,015704 ± 0,000212 | 0,108148 | 93,196% | 9,1579 | 77,8 | 1202,1 |
| UD-Q5_K_XL (listón de calidad) | 606.585.088 | 0,010375 ± 0,000103 | 0,066944 | 94,550% | 9,1145 | 61,7 | 1087,5 |
| UD-Q4_K_XL | 558.772.480 | 0,027323 | 0,173759 | 91,222% | 9,2735 | 76,6 | 1269,1 |
| IQ4_XS (mejor archivo estándar bajo 500 MB) | 492.605.696 | 0,059359 | 0,394602 | 87,737% | 9,6680 | 63,7 | 880,8 |
| UD-Q3_K_XL (misma clase de tamaño) | 492.216.576 | 0,092486 | 0,579284 | 84,883% | 10,0755 | 67,0 | 806,1 |

El archivo se cronometró en la misma ejecución emparejada que UD-Q5_K_XL: ratio de generación 1,11× y ratio de prompt 0,95×. Las demás filas se cronometraron por separado y deben leerse como aproximadas. Sobre el conjunto de ajuste, la KLD media es 0,011749, pero es una cifra in-sample y el autor recomienda usar 0,015704. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 0,5 GB para los pesos, más la caché KV y el contexto; con `-c 2048` en un equipo de 16 GB funciona sin problema. El requisito exacto de memoria para contextos mayores no está disponible.
- GPU recomendadas: no hay datos específicos para GPU dedicadas. Las mediciones publicadas son en Metal sobre Apple Silicon (MacBook Air M4, 16 GB).
- GPU de consumo: por tamaño (menos de 0,5 GB), cabe en cualquier GPU de consumo con al menos 2 GB de VRAM libre, aunque no se han publicado cifras de rendimiento en esas plataformas.
- Opciones de despliegue: `llama-cli` y `llama-server` de llama.cpp en versiones b11928 o posteriores; cualquier runtime que lea GGUF. El autor no menciona vLLM, TGI ni Ollama.
- Latencia y throughput medidos: 77,8 tok/s de generación y 1202 tok/s de procesamiento de prompt en MacBook Air M4; ratio de generación 1,11× y de prompt 0,95× frente a UD-Q5_K_XL en la misma ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD media | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-hand-quant (este) | 752.393.024 | no disponible | 0,015704 | 498,5 MB | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B UD-Q5_K_XL | 752.393.024 | no disponible | 0,010375 | 606,6 MB | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B UD-Q4_K_XL | 752.393.024 | no disponible | 0,027323 | 558,8 MB | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B IQ4_XS | 752.393.024 | no disponible | 0,059359 | 492,6 MB | Apache 2.0 | GGUF en Hugging Face |

La comparación se limita a cuantizaciones del mismo modelo base, que es lo que documenta la información disponible. Frente a UD-Q5_K_XL, este archivo es un 17,8% más pequeño y un 11% más rápido generando, pero su KLD media es 1,51 veces peor y no supera el listón de calidad Q5. Frente a UD-Q4_K_XL, es un 10,8% más pequeño y tiene una KLD media 1,74 veces menor. Frente a IQ4_XS, con tamaño casi idéntico, la KLD media es aproximadamente 3,8 veces menor.

## Limitaciones y advertencias

- No alcanza calidad Q5: el autor lo describe explícitamente como calidad cercana a Q4-XL, no Q5. Falla los criterios de KLD media, KLD al 99% y misma palabra top frente al listón UD-Q5_K_XL.
- El vocabulario es el cuello de botella: `token_embd` representa el 33,8% de los pesos y, al estar atado a la cabeza de salida, también puntúa la siguiente palabra; aporta aproximadamente 0,010 de los 0,0157 de KLD media. Subirlo a 5,5 bits costaría 39,8 MB más y, según el optimizador, el resto de la red perdería más de lo que se ganaría.
- Divergencia respecto a BF16: a temperatura 0, solo 3 de 40 respuestas coinciden con la referencia, con primera diferencia en la posición 9 de media (UD-Q5_K_XL: 4 de 40, primera diferencia en la posición 13).
- Metadatos heredados del modelo base: la model card indica que los metadatos se heredan, sin detallar el alcance de esa herencia.
- Idiomas: no hay lista de idiomas soportados ni evaluación de calidad por idioma en la información disponible.
- Contexto máximo: no se especifica; las pruebas se hicieron con 2048 tokens y no debe asumirse que ese sea el límite del modelo base.
- Sesgos y alucinación: no hay documentación específica en el material proporcionado; deben evaluarse sobre el modelo base Qwen3.5-0.8B.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de desplegarlo en producción.
- Procedencia del proceso: el autor indica que la cuantización la realizó un agente (Opus 5.5) y que la sesión fue interrumpida por Anthropic alegando violación de sus términos sobre ingeniería inversa; esto no afecta a la licencia del artefacto, pero es un dato de trazabilidad relevante.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay validación independiente de las mediciones publicadas.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Andy5k/Qwen3.5-0.8B-hand-quant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Metodología detallada: METHOD.md (referenciado en la model card, dentro del repositorio)
- Datos de medición: data/scores.csv, data/tensor-types.csv, data/alloc-c1.json (dentro del repositorio)
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
