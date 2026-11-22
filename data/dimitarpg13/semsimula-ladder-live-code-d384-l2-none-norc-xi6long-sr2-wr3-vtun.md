# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun

## Resumen

XI6-CODE (identificador completo `semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun`) es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia "semsimula", una línea de trabajo que explora modelos de lenguaje conservativos basados en mecánica lagrangiana y potenciales escalares en lugar de la atención transformer convencional. Este checkpoint concreto pertenece a un estudio de ablación ("ladder study") sobre código Python y responde a una pregunta muy específica: por qué un sexto canal de contexto degradaba el rendimiento de un modelo anterior (SO-CODE) en un 43%.

El modelo es un transformer-free, attention-free, de 83.690.702 parámetros, entrenado sobre exactamente 315.392.000 tokens del dataset CodeParrot clean (Python). Su contribución es metodológica: demuestra que normalizar a norma unitaria cada canal de contexto antes de que el banco de pozos de potencial (V_θ) lo lea ("fix 2") mantiene vivos los pozos de la capa 1 y recupera el rendimiento del baseline, situándose en perplejidad 5,95 frente a 6,00 del modelo de cinco canales.

Es relevante ahora como *negative result* reproducible y pre-registrado: el sexto canal no aporta nada una vez aplicado el arreglo, y el coste de la normalización unitaria en la variante de cinco canales (SO-CODE-VTUN, 6,34) indica que se trata de un parche, no de una configuración por defecto. La ficha está pensada para investigadores que evalúan arquitecturas alternativas al transformer y quieren entender los modos de fallo de los modelos basados en energía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No transformer; attention-free; modelo de lenguaje conservativo con potencial escalar (banco de pozos V_θ), mecánica lagrangiana, espacio de Fock y potencial gaussiano anisotrópico; integrador BAOAB; geometría riemanniana (métrica de Jacobi, geodésicas) |
| Parámetros totales | 83.690.702 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible explícitamente; el entrenamiento y la evaluación usan bloques de 512 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sustituye la atención por un mecanismo de simulación semántica: cada token interactúa con un banco de pozos de potencial escalar V_θ, y la dinámica se integra mediante el esquema BAOAB sobre una variedad con métrica de Jacobi. La variante "XI6" añade un sexto canal de contexto enrutado por contenido; este checkpoint ("screen A") aplica la corrección de normalizar a norma unitaria cada canal de contexto antes de que el banco de pozos lo lea, manteniendo V_θ a su tasa de aprendizaje completa. La corrección no añade parámetros: solo reescala una entrada, de ahí que el recuento coincida exactamente con el de screen B (83.690.702).

El entrenamiento consumió exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot clean, con el schedule WSD de la escalera durante 16.250 pasos y 3.000 pasos adicionales a la tasa mínima. Todos los modelos de la tabla comparativa parten del paso 0 con semilla 0 sobre los mismos lotes, por lo que las evaluaciones están emparejadas paso a paso. El run es pre-registrado (entrada `p-dw-screen-a-full` en `Code_Dead_Wells_and_Screens.md`), con cuatro predicciones (VA1–VA4) acertadas según el criterio declarado antes de la ejecución completa. No se reporta RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, orientada a código Python.
- Modelado de lenguaje sobre código: el checkpoint está entrenado exclusivamente con CodeParrot clean.
- Inferencia con memoria constante (tag `constant-memory-inference`), al no emplear atención.
- Razonamiento multi-paso implícito vía dinámica de pozos de potencial; no se documenta un modo "thinking" explícito.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: ablación de mecanismo con gradientes vivos, estudio de "dead wells" y evaluación de canales de contexto; no hay visión ni audio.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el checkpoint sirve como punto de comparación emparejado (mismos lotes, misma semilla) frente a SO-CODE y sus variantes para aislar el efecto de un canal de contexto adicional.
- Reproducción de resultados pre-registrados: permite verificar las predicciones VA1–VA4 del estudio de dead wells con el mismo presupuesto de tokens (315.392.000) y el mismo schedule WSD.
- Estudio de modos de fallo en modelos basados en energía: útil para analizar cómo los pozos de potencial dejan de recibir gradiente y cómo la normalización de entrada los mantiene activos (ratio de pozo más cercano 0,68; ocupación del pozo más fuerte 0,29).
- Benchmark de perplejidad sobre código: evaluación a bloque 512 sobre los primeros 2M tokens de validación de CodeParrot, con split a nivel de fichero, como referencia para modelos pequeños de código.
- Docencia y divulgación: ejemplo concreto de negative result y de diseño experimental con hipótesis pre-registradas y tasas de acierto declaradas (55–60%).
- Base para experimentos de inferencia con memoria constante: al ser attention-free, es adecuado para probar despliegues con requisitos de memoria plana, aunque sin garantías de producción.
- Ablación de mecanismo (no uso comercial): comparar el coste de la normalización unitaria en cinco canales (SO-CODE-VTUN, 6,34) frente a seis (5,95) para decidir si el canal extra compensa.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Canales de contexto | Corrección | Pozos capa 1 | Perplejidad asentada | Frente a SO-CODE |
|---|---|---:|---|---:|---:|
| SO-CODE (baseline) | 5 | — | vivos | 6,00 | — |
| XI6-CODE (no en el Hub) | 6 | — | muertos | 8,55 | +42,6% |
| screen B (fix 1) | 6 | lr de V_θ × 0,25 | vivos | 5,98 | −0,3% |
| screen A (este modelo, fix 2) | 6 | entrada de norma unitaria | vivos | 5,95 | −0,7% |
| SO-CODE-VTLR (control fix 1) | 5 | lr de V_θ × 0,25 | vivos | 6,09 | +1,6% |
| SO-CODE-VTUN (control fix 2) | 5 | entrada de norma unitaria | vivos | 6,34 | +5,8% |

Detalle de este checkpoint: perplejidad asentada 5,95 (media de las evaluaciones en los pasos 18.000, 18.500 y 19.000: 5,96, 5,88, 6,03); mejor valor 5,85 en el paso 16.000. Evaluación a bloque 512 sobre los primeros 2M tokens de validación de CodeParrot. Un GPT-2 emparejado sobre los mismos tokens se asienta en 4,96. Predicciones pre-registradas: VA1 acertada (−0,7%, probabilidad declarada 55%), VA2 acertada (ratio 0,68 y ocupación 0,29, coste de eliminación +136%, 60%), VA3 acertada (0,587, 60%), VA4 acertada (gap emparejado −0,002 nats, 55%).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 83,7M de parámetros, en FP32 los pesos ocupan aproximadamente 0,33 GB; en FP16, unos 0,17 GB, sin contar estados del integrador ni buffers del banco de pozos.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería alojar los pesos, pero la implementación no es estándar y no se documentan requisitos.
- Cabe en GPU consumer: previsiblemente sí por tamaño de parámetros; sin confirmación oficial.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser attention-free y usar integración BAOAB, requiere código propio del repositorio del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot val, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo (XI6-CODE screen A) | 83.690.702 | bloques de 512 en entrenamiento/eval | 5,95 | CC-BY-4.0 | Hugging Face |
| SO-CODE (baseline, 5 canales) | no disponible | bloques de 512 | 6,00 | no disponible en esta ficha | Hugging Face |
| screen B (fix 1, 6 canales) | 83.690.702 | bloques de 512 | 5,98 | no disponible en esta ficha | Hugging Face |
| GPT-2 emparejado (referencia del autor) | no disponible | bloques de 512 | 4,96 | no disponible en esta ficha | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso comercial pese a la licencia CC-BY-4.0, que sí permite uso comercial con atribución.
- Resultado negativo: el sexto canal de contexto no aporta mejora; el beneficio se limita a recuperar el nivel del baseline de cinco canales.
- La normalización unitaria no es una configuración por defecto: aplicada a cinco canales encarece la perplejidad un 5,8% (6,34 frente a 6,00).
- Riesgo de alucinación: no evaluado; el modelo solo se mide por perplejidad, sin benchmarks de fidelidad, código ejecutable ni QA.
- Idiomas: únicamente inglés; sin capacidades multilingües documentadas.
- Contexto: entrenado y evaluado en bloques de 512 tokens; no se documenta ventana de contexto mayor.
- Dependencia de implementación: arquitectura no estándar (BAOAB, métrica de Jacobi, banco de pozos), sin soporte en runtimes de inferencia habituales.
- Datos no verificados: los resultados de la model card están marcados como no verificados (`verified: false`) y las tasas de acierto de las predicciones (55–60%) reflejan incertidumbre alta.
- Sesgos: no documentados; el corpus CodeParrot clean puede arrastrar sesgos de código de GitHub.
- El autor no confirma los resultados pre-registrados ("not confirmed by the author").

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun
- Baseline SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Screen B (fix 1): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25
- Control fix 1 (SO-CODE-VTLR): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Control fix 2 (SO-CODE-VTUN): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtun
- Colección dead-wells gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Nota sobre dead wells: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Pre-registro del estudio: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Code_Dead_Wells_and_Screens.md
- Dataset CodeParrot clean (train): https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset CodeParrot clean (valid): https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
