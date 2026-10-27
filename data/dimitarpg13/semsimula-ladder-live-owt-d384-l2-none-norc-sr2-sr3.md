# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3` es un modelo de lenguaje de investigación publicado por dimitarpg13 dentro de la familia SemSimula, una línea de modelos de lenguaje "conservativos" que sustituyen la atención por la integración de un potencial escalar: cada token se trata como una partícula con masa que evoluciona bajo un flujo lagrangiano amortiguado. Este checkpoint concreto, denominado SR3-crit en la model card, es el brazo de un estudio de ablación preinscrito que aplica amortiguamiento crítico a los modos rígidos del potencial, es decir, cambia la tasa de amortiguamiento de γ₀ = 0,1 a γ₀ + 2ωᵢ en las 16 direcciones más rígidas de cada token, sin añadir un solo parámetro.

El modelo no es un transformer: es "attention-free", de segundo orden (conserva velocidad entre capas) y con inferencia de memoria constante respecto a la longitud de secuencia. Se entrenó sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512), semilla 0, y su resultado es deliberadamente negativo: 63,28 de perplejidad de validación frente a 58,32 de su gemelo SR2, un 8,5 % peor, lo que confirma la hipótesis preinscrita de que la oscilación de los modos rígidos, y no la inercia en sí, es lo que aporta el esquema de segundo orden en este corpus.

Su relevancia es, por tanto, metodológica y no de producto: sirve como evidencia reproducible en un estudio escalera (ladder study) sobre arquitecturas alternativas, con predicciones registradas de antemano, control de fugas (SCAF) y monitorización de salud del entrenamiento. No está pensado para uso en producción ni compite en calidad con modelos transformer del mismo tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención ("attention-free"), modelo de lenguaje conservativo de segundo orden basado en potencial escalar; integración de flujo lagrangiano amortiguado con integrador BAOAB; núcleo plenamente conservativo ("fully conservative"); identificador d384-l2 (dimensión 384 y 2 capas según el nombre del checkpoint, no confirmado en la model card) |
| Parámetros totales | No disponible (el autor no publica recuento; el repo ocupa 0,3 GB, compatible con un modelo pequeño en fp32) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Bloque de entrenamiento y evaluación de 512 tokens; no se documenta una longitud máxima de contexto superior |
| Tipos de cuantización | No disponible; solo se distribuyen pesos PyTorch sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Checkpoint PyTorch (`library_name: pytorch`); no se documentan safetensors ni GGUF. Tamaño del repositorio: 0,3 GB |
| Corpus de entrenamiento | Skylion007/openwebtext (OpenWebText) |
| Tokens de entrenamiento | 532.480.000 (32.500 pasos × 32 de batch × 512 de bloque) |
| Mecanismo diferencial | Amortiguamiento crítico de los modos rígidos: γ₀ + 2ωᵢ (ratio total ≈ 1,03) frente a γ₀ = 0,1 de SR2 (ratio ≈ 0,03) |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

El modelo pertenece a la tercera generación de SemSimula y comparte la arquitectura de la escalera OpenWebText: un núcleo conservativo donde cada token se integra como una partícula sometida a un potencial escalar anisótropo (etiquetas `anisotropic-gaussian-potential`, `scalar-potential`), con las 16 direcciones más rígidas del potencial resueltas de forma exacta como osciladores amortiguados y el resto tratado con fricción en el paso O del integrador BAOAB. La variante de este checkpoint, SR3-crit, modifica únicamente la regla de amortiguamiento: fija la tasa de cada modo rígido en γ₀ + 2ωᵢ, el valor crítico que hace que el modo se asiente en su pozo sin sobreoscilación, mantiene la velocidad entre capas y deja γ₀ en todas las direcciones que no son rígidas. La conmutación se verificó antes del entrenamiento: apagada es bit a bit idéntica a SR2; encendida reproduce la respuesta crítica en forma cerrada con error 1e-16, y solo cambia el paso en los modos rígidos. No añade parámetros.

El entrenamiento usó el mismo corpus (OpenWebText), el mismo calendario y la misma semilla (0) que el resto de la escalera, con un presupuesto de tokens igualado. No se documenta RLHF, DPO ni ajuste por instrucciones: el objetivo es modelado de lenguaje autorregresivo medido por perplejidad. El protocolo es preinscrito (§5.13) con predicciones explícitas: SC3′ (quedar 3 % o más por detrás de SR2, probabilidad declarada 25 %) acertó con +8,5 % y además por detrás de FO-b; SC1′ y SC2′ fallaron; SC4 (Gate 1 como máximo +3,9 % de SR2) acertó con +3,6 %; SC5 (convergencia del flujo por capa dentro de 0,15 nats) falló con 0,30 nats y deriva. La salud de la ejecución se reporta limpia: 0 activaciones del watchdog, 0 capturas de picos, monitor de fugas SCAF limpio en cada auditoría y norma de gradiente máxima inferior a 2.

## Capacidades

- Generación de texto autorregresiva en inglés, con perplejidad de validación de 63,28 en bloques de 512 tokens sobre OpenWebText.
- Inferencia con memoria constante respecto a la longitud de secuencia (propiedad declarada en las etiquetas: `constant-memory-inference`), consecuencia de no usar mecanismo de atención.
- Modelado explícito de dinámica: mantiene estado de posición y velocidad por capa, lo que permite estudiar trayectorias de integración y no solo probabilidades de salida.
- Banco de pruebas de ablación: sirve para aislar el efecto del amortiguamiento de modos rígidos frente a SR2, la variante aprendida ζ(h) y el límite sobreamortiguado FO-b.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en arquitecturas no transformer: el checkpoint es un punto de datos reproducible en un estudio escalera con presupuesto de tokens y semilla igualados, útil para contrastar hipótesis sobre integradores de segundo orden frente a modelos con atención.
- Ablación de mecanismos de amortiguamiento: al ser idéntico a SR2 salvo en la regla de amortiguamiento de los modos rígidos, permite atribuir diferencias de perplejidad al mecanismo y no a cambios de capacidad o de datos.
- Reproducción de resultados preinscritos: las predicciones SC1′–SC5 están registradas con probabilidades, de modo que el modelo sirve para auditar el protocolo experimental y no solo el resultado final.
- Estudio de eficiencia de memoria en inferencia: la propiedad de memoria constante respecto a la longitud de secuencia lo hace adecuado para experimentos de decodificación en streaming sobre hardware limitado, con la salvedad de que la longitud de contexto documentada es de 512 tokens.
- Docencia y divulgación: la formulación física (potencial escalar, osciladores amortiguados, ratio de amortiguamiento γ₀/2ω) permite ilustrar con números concretos la diferencia entre amortiguamiento ligero (ratio ≈ 0,03) y crítico (ratio ≈ 1,03).
- Base para variantes futuras de la familia: cualquier nueva regla de amortiguamiento o de integración puede compararse contra este punto de referencia con coste de cómputo bajo, dado el tamaño reducido del repositorio (0,3 GB).
- Verificación de integradores numéricos: la comprobación de que la versión crítica reproduce la solución en forma cerrada con error 1e-16 lo convierte en un test de corrección para implementaciones de BAOAB.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de texto | OpenWebText (validation), bloque 512 | Perplejidad asentada (media de las tres últimas evaluaciones de 500 pasos: 63,15 / 63,48 / 63,23) | 63,28 |
| Generación de texto | OpenWebText (validation), bloque 512 | Mejor perplejidad registrada (paso 31.000) | 61,27 |

Comparación dentro del eje de amortiguamiento (misma arquitectura, corpus, calendario y semilla):

| Brazo | Amortiguamiento del modo más rígido de un token típico | Perplejidad asentada | Frente a SR2 |
|---|---|---|---|
| SR2 | Ligero: γ₀ = 0,1, ratio total ≈ 0,03 | 58,32 | — |
| ζ(h) aprendido | Moderado: ratio total ≈ 0,59 (capa 0) y ≈ 0,39 (capa 1) | 59,29 | +1,7 % |
| FO-b | Límite sobreamortiguado: sin velocidad en ninguna dirección | 61,16 | +4,9 % |
| SR3-crit (este modelo) | Crítico: ratio total ≈ 1,03 | 63,28 | +8,5 % |

Evolución del entrenamiento reportada (perplejidad de validación): paso 500, 461,20 (fase de warmup, −0,1 % frente a SR2); paso 5.000, 111,16 (+2,6 %); paso 10.000, 95,46 (+11,1 %); paso 15.000, 83,x (+... , dato truncado en la información disponible).

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de razonamiento en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. A partir del tamaño del repositorio (0,3 GB) y de la dimensión declarada en el identificador (d384, 2 capas), es razonable esperar pesos en el orden de pocos cientos de MB y un consumo total por debajo de 2 GB en fp32 para lotes pequeños; el estado del integrador (posición y velocidad por capa, más los 16 modos rígidos por token) añade un coste adicional no cuantificado.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con 4 GB o más debería bastar; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí cabe previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, siempre que se implemente el integrador en PyTorch.
- Memoria frente a longitud de secuencia: constante por diseño (`constant-memory-inference`), aunque la ventana documentada es de 512 tokens.
- Opciones de despliegue: no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; al no ser un transformer y requerir el paso del integrador BAOAB, la inferencia exige el código propio del autor en PyTorch.
- Latencia y throughput estimados: no disponibles. El coste por token incluye la integración de 16 modos rígidos por capa, no una multiplicación de matrices de atención, por lo que las estimaciones de rendimiento de transformers equivalentes no son trasladables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OpenWebText, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SR3-crit (este modelo) | No disponible | 512 | 63,28 (asentada) | CC-BY-4.0 | Pesos PyTorch en HuggingFace |
| SemSimula SR2 | No disponible (misma arquitectura, sin parámetros añadidos) | 512 | 58,32 (asentada) | CC-BY-4.0 | Pesos PyTorch en HuggingFace |
| SemSimula ζ(h) aprendido | No disponible (añade parámetros de amortiguamiento aprendido) | 512 | 59,29 (asentada) | CC-BY-4.0 | Pesos PyTorch en HuggingFace |
| SemSimula FO-b | No disponible (variante de primer orden, sin velocidad) | 512 | 61,16 (asentada) | CC-BY-4.0 | Pesos PyTorch en HuggingFace |
| GPT-2 small (referencia transformer) | 124 M | 1.024 | No medida en este pipeline | MIT | Pesos en HuggingFace |

No se dispone de comparaciones publicadas frente a transformers entrenados con el mismo presupuesto de tokens y el mismo corpus en la información proporcionada.

## Limitaciones y advertencias

- El resultado es negativo por diseño: 63,28 frente a 58,32 de SR2 (+8,5 %) y también por detrás de la variante sin inercia FO-b (61,16). El amortiguamiento crítico de los modos rígidos degrada la perplejidad en OpenWebText.
- La métrica de perplejidad declarada está marcada como no verificada (`verified: false`) y corresponde a una única semilla (0); no hay intervalos de confianza ni repeticiones.
- La predicción SC5 falló: el flujo por capa no converge (0,30 nats de deriva frente al umbral de 0,15), lo que sugiere que el régimen entrenado no ha alcanzado un punto estacionario estable.
- Idiomas: únicamente inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto limitado a bloques de 512 tokens; no se documenta extensión de contexto ni técnicas de interpolación posicional.
- No hay ajuste por instrucciones, plantilla de chat ni evaluación de seguimiento de instrucciones: el modelo no debe usarse como asistente conversacional.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación y de texto incoherente alto para estándares de producción, coherente con una perplejidad de 63,28 en un corpus web.
- Sesgos: al entrenarse sobre OpenWebText (texto web en inglés), hereda los sesgos de género, ideológicos y geográficos de ese corpus; el autor no publica análisis de sesgo.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero obliga a citar autor y licencia y no incluye garantías ni cláusula de patentes.
- Empaquetado: sin safetensors ni GGUF, y sin soporte en los runners habituales (vLLM, llama.cpp, TGI, Ollama); la integración en producción exige portar el integrador a mano.
- Naturaleza del artefacto: la etiqueta `research` y el diseño como brazo de ablación indican que no es un modelo destinado a despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3
- Modelo de referencia SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Variante con amortiguamiento aprendido ζ(h): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh
- Variante de primer orden FO-b: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Colección del eje de amortiguamiento dependiente de posición (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-position-dependent-damping-6ada61f0754754e2f2deae3c
- Colección de la escalera OpenWebText (Gen 3, CfC/BAOAB/gradientes en vivo): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Colección de comparación primer vs segundo orden (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Ficha divulgativa del modelo en The Wider Lens: https://thewiderlens.info/
