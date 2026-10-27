# dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk-norc

## Resumen

`semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk-norc` es un modelo de lenguaje de 77,2 millones de parámetros desarrollado por el usuario dimitarpg13 dentro de la familia de investigación SemSimula. No es un transformer: es un modelo de lenguaje conservativo, formulado como un sistema de mecánica lagrangiana en el que cada fuerza aplicada al estado de un token es el gradiente exacto de un potencial escalar, integrado mediante una capa CfC/BAOAB. Este brazo concreto (denominado XRB-F en la model card) añade al modelo conservativo puro un "campo de intercambio" de tipo atención —proyecciones por cabeza, pesos de enrutado por coseno y readout— sin lectura de registros virtuales, y sirve para medir qué aporta cada mecanismo por separado.

El modelo es un instrumento de medida exploratorio, no una arquitectura propuesta: forma parte de un estudio de ablación por niveles ("ladder study") con presupuesto de tokens igualado, y todas las comparaciones internas se hacen contra otros brazos de la misma familia entrenados con exactamente 532.480.000 tokens de OpenWebText, el mismo corpus, tokenizer y lotes de validación. Su resultado principal es una perplejidad de validación de 54,27 (bloque de 512) en OpenWebText, un 6,0 % mejor que el modelo conservativo sin el campo y un 2,6 % peor que la variante que añade además el camino de registros.

Es relevante ahora por dos motivos: primero, porque permite estudiar mecanismos tipo atención en arquitecturas no transformer con gradientes completamente "vivos" y conservatividad controlada; segundo, porque publica una pre-registración de seis predicciones fijadas antes del primer paso de entrenamiento, todas cumplidas, lo que es poco habitual en modelos de este tamaño y orientación. El contexto documentado es de 512 tokens, el modelo solo maneja inglés y la licencia es CC BY 4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No transformer; modelo conservativo (energía/potencial escalar) con potencial aprendido Vθ, potencial de pares Vφ, canales de contexto ξ e integrador CfC/BAOAB; L=2 capas, dimensión 384; campo de intercambio tipo atención con 8 cabezas de anchura 48 |
| Parámetros totales | 77,2 M |
| Parámetros activos | No procede (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (bloque empleado en entrenamiento y evaluación; no se documenta una ventana mayor) |
| Tipos de cuantización | No disponible (solo se publica checkpoint PyTorch; no hay GGUF, AWQ, GPTQ ni variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Checkpoint PyTorch (`library_name: pytorch`); repositorio de 0,6 GB; el formato exacto de los ficheros no se detalla en la información disponible |

## Arquitectura y entrenamiento

El modelo sustituye la pila de atención transformer por una dinámica conservativa: el estado de cada token evoluciona bajo fuerzas que son gradientes de un potencial escalar aprendido (Vθ), un potencial de pares (Vφ) y canales de contexto (ξ), integrados por una capa CfC/BAOAB. Sobre esa base, este brazo añade un campo de intercambio que actúa como una ruta tipo atención: en cada capa se calculan proyecciones por cabeza de query, key y value (8 cabezas de anchura 48), los pesos de enrutado se obtienen del coseno entre query y key multiplicado por una escala aprendida por cabeza, y una matriz de readout devuelve la señal al estado. La clave para mantener la conservatividad es que los pesos de enrutado se mantienen fijos respecto al estado que se desplaza, de modo que la fuerza sigue siendo el gradiente exacto de un potencial. El enrutado está "endurecido" como en el brazo G3′: queries y keys normalizadas, escala limitada a 100 y recorte de gradiente de 0,3; las escalas aprendidas finales van de 11,7 a 21,4, ninguna cerca del tope.

El modelo conserva los 32 registros virtuales de la familia (espacio de Fock): se construyen y se escriben, y durante el entrenamiento actúa un pequeño término de repulsión entre ellos (coeficiente 0,05), pero nada los lee hacia los tokens, por lo que no pueden afectar a la predicción. Así, la única diferencia con el modelo conservativo F3.1 es el campo de intercambio. El entrenamiento consumió exactamente 532.480.000 tokens (32.500 pasos × 32 × 512) de OpenWebText, en una única sesión de Colab a 1,60 s/paso (14,5 horas), sin disparos del watchdog ni picos, con un 11,1 % de pasos con recorte de gradiente (72 de 650 pasos registrados, norma máxima 1,24, todos entre los pasos 11.600 y 27.950). No se documenta RLHF, DPO ni ajuste por instrucciones. La monitorización de causalidad (SCAF) dio limpia en las siete auditorías (5k a 30k y 32,5k), con perturbación de futuro exactamente 0 y coste de fuga ≤ 8,4e-5 nats.

## Capacidades

- Predicción de siguiente token y generación de texto en inglés sobre dominio web (OpenWebText), a nivel de modelo base sin ajuste instructivo.
- Modelado de lenguaje conservativo: toda fuerza aplicada al estado es gradiente de un potencial, lo que permite estudiar trayectorias energéticamente consistentes.
- Enrutado tipo atención sin softmax, basado en coseno de query/key con escala aprendida por cabeza (8 cabezas × 48).
- Comportamiento de copia e inducción: la model card mide un coste de eliminación de 2,61 nats en posiciones de inducción (umbral fijado en 1,74), frente a 1,16 nats en posiciones novedosas.
- Registros virtuales en espacio de Fock: se generan y mantienen 32 registros con repulsión mutua, aunque en este brazo no se leen hacia los tokens.
- Instrumento de ablación: permite aislar el efecto del campo de intercambio frente al camino de registros y frente al modelo conservativo puro.
- Trazabilidad de causalidad verificable mediante el monitor de fugas SCAF (siete auditorías limpias).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso explícito, visión, audio ni modo "thinking".

## Casos de uso

- Investigación en interpretabilidad mecanicista: comparar el efecto de un mecanismo tipo atención (enrutado por coseno, sin softmax) frente a un camino de registros en un modelo no transformer, usando brazos con presupuesto de tokens idéntico y mismo corpus.
- Reproducción de estudios pre-registrados: el modelo publica seis predicciones fijadas antes del primer paso de entrenamiento y su resultado; sirve como caso de estudio metodológico sobre pre-registro en modelos pequeños.
- Línea base de perplejidad en OpenWebText a 512 tokens: con 54,27 de PPL y 532,48 M de tokens vistos, es una referencia utilizable para nuevos brazos de la misma familia o para experimentos con el mismo tokenizer y lotes de validación.
- Validación de monitores de causalidad: el modelo declara auditorías SCAF con perturbación de futuro exactamente 0, lo que permite probar y calibrar herramientas de detección de fugas de información futura en arquitecturas no estándar.
- Estudio de modelos de energía y dinámica lagrangiana: útil para experimentos sobre conservatividad controlada, integradores BAOAB y estabilidad de gradientes en modelos de 77 M de parámetros.
- Docencia y divulgación: por su tamaño (77,2 M) y su coste de entrenamiento (14,5 horas en una sesión de Colab), es viable reproducir el pipeline completo en un entorno educativo o de laboratorio con recursos limitados.
- Generación de texto de dominio web a pequeña escala en inglés: aceptable para prototipos internos de continuación de texto donde la coherencia no sea crítica, siempre que se asuma una perplejidad alta (54,27) y ausencia de ajuste instructivo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métrica `verified: false`):

| Modelo | PPL de validación (bloque 512, asentada) | Parámetros | Frente a gpt2-matched | Frente a este modelo |
|---|---:|---:|---:|---:|
| Este modelo (XRB-F: campo de intercambio, sin lectura de registros) | 54,27 | 77,2 M | 1,090× | — |
| G3′ (este modelo + camino de registros) | 52,90 | 77,4 M | 1,062× | +2,6 % |
| G2 (camino de registros en lugar del campo) | 53,12 | 76,8 M | 1,066× | +2,2 % |
| F3.1 (este modelo sin el campo) | 57,76 | 76,6 M | 1,160× | −6,0 % |
| gpt2-matched (L=8) | 49,81 | 33,7 M | 1,000× | +9,0 % |

Notas de la model card: la PPL asentada es la media de las tres últimas evaluaciones (54,20; 54,39; 54,22); la mejor fue 52,50 en el paso 31.000 y la final 54,22, con variaciones de ±1 PPL entre evaluaciones consecutivas. En el paso 3.000 el modelo marcaba 114,76, frente a 113,52 de G3′ y 127,73 de F3.1.

No se han publicado resultados de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra batería estándar en la información disponible. El único conjunto evaluado es OpenWebText (split de validación) y la única métrica es perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 309 MB en fp32 (77,2 M × 4 bytes) y unos 155 MB en bf16/fp16; el repositorio completo ocupa 0,6 GB, presumiblemente por incluir el checkpoint en precisión completa junto con otros artefactos.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer. El entrenamiento se realizó en una única sesión de Colab (la GPU concreta no se especifica en la información disponible).
- Cabe en GPU consumer: sí, en cualquier tarjeta con 1 GB o más de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.), y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: solo PyTorch con el código del autor, ya que la arquitectura no es transformer y no se publican pesos en formatos estándar. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ni ficheros GGUF.
- Latencia y throughput de inferencia: no disponibles. El único dato temporal publicado es de entrenamiento: 1,60 s/paso con lotes de 32 × 512 tokens.
- Memoria en entrenamiento: no disponible de forma desagregada; el cálculo se completó en una sesión de Colab de 14,5 horas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL OpenWebText (bloque 512) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este modelo (XRB-F) | 77,2 M | 512 | 54,27 | CC BY 4.0 | Pesos PyTorch en HuggingFace, 64 descargas |
| G3′ (`...-attention-potential-rfqk`) | 77,4 M | 512 | 52,90 | CC BY 4.0 (según familia) | Pesos PyTorch en HuggingFace |
| G2 (`...-none`) | 76,8 M | 512 | 53,12 | CC BY 4.0 (según familia) | Pesos PyTorch en HuggingFace |
| F3.1 (`...-none-norc`) | 76,6 M | 512 | 57,76 | CC BY 4.0 (según familia) | Pesos PyTorch en HuggingFace |
| gpt2-matched (L=8) | 33,7 M | 512 | 49,81 | No disponible | Pesos PyTorch en HuggingFace |

La comparación con GPT-2 solo está disponible en forma de ratio de perplejidad declarado por el autor frente al brazo `gpt2-matched` (referencia 1,000×), no como resultados de benchmarks estándar. No se dispone de datos de otros modelos externos de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y solo 512 tokens de contexto; cualquier tarea que requiera ventanas mayores o multilingüismo queda fuera de su alcance.
- Perplejidad alta para el estado del arte: 54,27 en OpenWebText, un 9,0 % peor que el brazo `gpt2-matched` de la propia familia (49,81 con 33,7 M de parámetros). La calidad del texto generado será limitada.
- No está ajustado por instrucciones ni alineado (sin RLHF ni DPO): no cabe esperar formato de respuesta, seguimiento de instrucciones ni rechazo de peticiones dañinas.
- Riesgo elevado de alucinación y de texto incoherente más allá de unas pocas decenas de tokens; no debe usarse en producción orientada a usuario final sin supervisión.
- Es un instrumento de medida exploratorio, no una arquitectura propuesta; el propio autor lo describe así. Los resultados no deben extrapolarse como validación de la familia completa.
- Métricas no verificadas: la entrada de `model-index` lleva `verified: false` y procede únicamente del autor; no hay evaluación independiente.
- Los 32 registros virtuales no se leen en este brazo, por lo que su efecto sobre la predicción es nulo por diseño; cualquier conclusión sobre registros debe extraerse de los brazos que sí los leen.
- El 11,1 % de pasos con recorte de gradiente (norma máxima 1,24) indica cierta presión de estabilidad durante el entrenamiento, concentrada entre los pasos 11.600 y 27.950.
- Sesgos: el corpus es OpenWebText, texto web no filtrado; no se documenta ninguna evaluación de sesgo, toxicidad ni seguridad.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar los términos exactos y citar correctamente al autor; no se documentan restricciones adicionales.
- Reproducibilidad: al no ser un modelo transformer, no se integra en `transformers`, vLLM ni llama.cpp; requiere el código del autor, cuya disponibilidad y mantenimiento no se detallan en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk-norc
- Modelo base conservativo F3.1 (sin el campo): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Brazo G3′ (campo de intercambio + camino de registros): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- Brazo G2 (solo camino de registros): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo de referencia gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3 (ladder con gradientes vivos): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
