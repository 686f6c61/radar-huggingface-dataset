# promotion/UW1-PROSPER

## Resumen

UW1-PROSPER es un ajuste fino de investigación sobre `Qwen/Qwen2.5-7B-Instruct`, publicado por el usuario `promotion` en HuggingFace. No es un modelo de propósito general, sino un brazo experimental dentro de un estudio comparativo de cinco variantes de optimización por preferencias (NBPO-PW, FixedRefNash-PW, DPO-soft, INPO-soft y SPPO) entrenadas bajo un protocolo idéntico, de forma que la única diferencia entre ellas es la función de pérdida. La versión PROSPER usa el paso 7 del algoritmo 1 con el criterio de peor objetivo de la ecuación 11, estimado a partir de M=7 bancos *leave-two-out* sobre los 64 pares de ajuste aprendices-referencias.

Arquitectónicamente es un transformer decoder-only denso con 7.615.616.512 parámetros (pesos en safetensors, 15,2 GB de repositorio), heredado íntegramente del modelo base; el trabajo experimental se concentra en la fase de alineación con preferencias, no en cambios de arquitectura. El entrenamiento se realizó sobre el panel WildChecklists con 319 prompts de entrenamiento y 83 de desarrollo, 8.932 pares de aprendices, 140 pasos de optimizador con tamaño de lote 128 durante dos épocas, y una única semilla de política (42).

Su relevancia es metodológica: sirve para estudiar si los criterios de negociación de Nash aportan ventajas medibles frente a DPO, INPO o SPPO en presupuestos de datos muy reducidos. Los propios autores advierten que ninguna de las diferencias medidas supera un error estándar en ninguna columna, por lo que debe tratarse como material de replicación y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-7B-Instruct) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN) |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors sin cuantizaciones declaradas |
| Idiomas soportados | No disponible (no declarado; el modelo base Qwen2.5 es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only denso de 7.6B parámetros con atención causal estándar. La model card no documenta ninguna modificación estructural: no hay mezcla de expertos, ni atención lineal, ni capas SSM híbridas. Toda la contribución del trabajo está en el objetivo de entrenamiento. Las etiquetas del repositorio (`nbpo`, `preference-optimization`, `nash-bargaining`) confirman que se trata de un ajuste por preferencias, no de un preentrenamiento ni de un SFT desde cero.

El protocolo de entrenamiento es deliberadamente pequeño y controlado. Se usó el panel WildChecklists con cuatro ítems de checklist nativos por prompt, con 319 prompts de entrenamiento y 83 de desarrollo tras un filtrado de representabilidad. Se generaron grupos de 8 respuestas por prompt y se construyeron los 28 pares no ordenados posibles (8.932 pares en total). La optimización se hizo con 140 pasos a tamaño de lote 128 durante dos épocas, tasa de aprendizaje 3e-7 con decaimiento coseno, calentamiento del 10 %, decaimiento de peso 1e-6 y recorte de gradiente 1.0. El pool de candidatos mezcló 8 ocurrencias de aprendiz y 8 de referencia con temperatura 1, top-p 1 y 1.024 tokens. El juez de entrenamiento fue un modelo abierto local que emitió dos juicios por par e ítem, en ambos órdenes de presentación. Un único seed de política (42) controla toda la variabilidad experimental.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de instrucciones del modelo base.
- Razonamiento de múltiples pasos y respuesta a instrucciones: la model card reporta 0,5545 en IFEval y 8,3019 en MT-Bench, valores equivalentes a los del modelo base sin entrenar.
- Conocimiento general y razonamiento académico: 0,7427 en MMLU, 0,6698 en ARC-C, 0,8135 en HellaSwag y 0,7474 en WinoGrande.
- Razonamiento matemático: 0,7301 en GSM8K, ligeramente por encima del 0,7210 del modelo base sin entrenar.
- Veracidad declarativa: 0,6485 en TruthfulQA, en línea con el resto de brazos del estudio.
- Alineación con preferencias humanas: la contribución principal es el criterio de negociación de Nash aplicado sobre pares de respuestas, evaluado con win rates en Arena-Hard (0,7245), AlpacaEval (0,3053) y MT-Bench (8,3019).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` y la presencia de `text-generation-inference` indican soporte para despliegue servido.
- No se declaran capacidades de tool calling, function calling, uso de agentes, visión, audio ni modo de razonamiento explícito (*thinking*) en la información disponible.

## Casos de uso

- Replicación académica de estudios de optimización por preferencias: el modelo permite reproducir el brazo PROSPER y compararlo contra los otros cuatro brazos del mismo estudio bajo un protocolo idéntico, algo poco habitual en la literatura, donde cada método se evalúa con presupuestos y jueces distintos.
- Ablación de funciones de pérdida: dado que los cinco brazos comparten datos, hiperparámetros y semilla, sirve para aislar el efecto del criterio de peor objetivo de Nash frente a DPO, INPO y SPPO.
- Análisis de sensibilidad a la varianza de semilla: al ser un artefacto con una única semilla, es el punto de partida natural para lanzar réplicas con seeds alternativos y cuantificar cuánta de la diferencia observada es ruido.
- Evaluación comparativa de jueces locales: el estudio usó exclusivamente jueces abiertos de 72B en lugar de APIs propietarias, lo que permite auditar la fiabilidad de evaluaciones automáticas sin coste de API.
- Prototipado de asistentes conversacionales en inglés: con 7.6B parámetros y pesos completos en safetensors, se puede desplegar como chatbot de pruebas en una GPU de 24 GB antes de decidir si merece la pena una alineación a mayor escala.
- Investigación sobre eficiencia de datos en alineación: el panel de 319 prompts con 8.932 pares es un caso de estudio útil para medir cuánto rendimiento se puede extraer de un presupuesto de etiquetado muy reducido.
- Generación de respuestas con formato de checklist: al haberse entrenado sobre WildChecklists con cuatro ítems por prompt, es adecuado para experimentos sobre cumplimiento estructurado de criterios de calidad.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las columnas de capacidad provienen de un arnés local con los pocos ejemplos declarados; las dos columnas de preferencia son tasas de victoria contra las respuestas base publicadas por cada benchmark, juzgadas por un modelo abierto de 72B en ambos órdenes de presentación.

| Modelo | MMLU | ARC-C | HellaSwag | WinoGrande | TruthfulQA | GSM8K | IFEval | Arena-Hard | AlpacaEval | MT-Bench |
|---|---|---|---|---|---|---|---|---|---|---|
| base (sin entrenar) | 0,7427 | 0,6724 | 0,8141 | 0,7498 | 0,6480 | 0,7210 | 0,5675 | 0,7165 | 0,3075 | 8,3063 |
| UW1-NBPO-PW | 0,7431 | 0,6706 | 0,8148 | 0,7561 | 0,6471 | 0,7240 | 0,5730 | 0,7280 | 0,3149 | 8,3125 |
| UW1-FixedRefNash-PW | 0,7431 | 0,6715 | 0,8134 | 0,7553 | 0,6474 | 0,7293 | 0,5712 | 0,7315 | 0,3180 | 8,3000 |
| UW1-DPO-soft | 0,7430 | 0,6706 | 0,8129 | 0,7561 | 0,6475 | 0,7301 | 0,5656 | 0,7100 | 0,3146 | 8,2250 |
| UW1-INPO-soft | 0,7428 | 0,6715 | 0,8144 | 0,7514 | 0,6469 | 0,7271 | 0,5823 | 0,7435 | 0,3332 | 8,2025 |
| UW1-SPPO | 0,7427 | 0,6732 | 0,8148 | 0,7514 | 0,6439 | 0,7331 | 0,5693 | 0,7430 | 0,3668 | 8,3526 |
| UW1-PROSPER | 0,7427 | 0,6698 | 0,8135 | 0,7474 | 0,6485 | 0,7301 | 0,5545 | 0,7245 | 0,3053 | 8,3019 |

Lectura de los datos: PROSPER no supera a ningún otro brazo en ninguna columna de forma consistente y queda por detrás del modelo base sin entrenar en WinoGrande (0,7474 frente a 0,7498), IFEval (0,5545 frente a 0,5675) y AlpacaEval (0,3053 frente a 0,3075). La ventaja más clara de cualquier brazo la obtiene UW1-SPPO en AlpacaEval (0,3668). Los autores advierten que ninguna diferencia supera un error estándar.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados del recuento de parámetros, no publicados por el autor): en bf16/fp16 completos, alrededor de 15,2 GB solo de pesos, más caché KV; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, aproximadamente 5-6 GB.
- GPU de centro de datos: A100 de 40 GB o 80 GB, H100, L40S y A10G de 24 GB son suficientes para bf16 con contexto moderado. Una A100 de 80 GB permite lotes mayores y contexto largo sin cuantizar.
- GPU de consumo: cabe en bf16 en RTX 4090, RTX 3090 y RTX 4080 de 24 GB (con margen ajustado para contexto largo); en 4 bits puede ejecutarse en RTX 4070 Ti de 12 GB, RTX 3060 de 12 GB o GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), vLLM y SGLang siempre que se sirvan los safetensors tal cual. Para llama.cpp u Ollama sería necesario convertir a GGUF, conversión que no está publicada en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| UW1-PROSPER | 7,6B | No disponible (base: 32.768 tokens) | No disponible | Pesos safetensors en HuggingFace; 0 descargas, 0 likes |
| UW1-SPPO | 7,6B (mismo base) | No disponible (base: 32.768 tokens) | No disponible | Mismo estudio; mejor AlpacaEval del grupo (0,3668) |
| UW1-INPO-soft | 7,6B (mismo base) | No disponible (base: 32.768 tokens) | No disponible | Mismo estudio; mejor IFEval del grupo (0,5823) |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 nativos (131.072 con YaRN) | Apache-2.0 según su ficha oficial | Modelo base de referencia, ampliamente descargado |

La comparación más informativa es interna: los cinco brazos comparten base, datos e hiperparámetros, así que las diferencias de la tabla de benchmarks son atribuibles al objetivo de pérdida dentro de los límites de una única semilla. Frente al Qwen2.5-7B-Instruct original, PROSPER no mejora de forma medible ninguna métrica y en tres columnas queda por debajo. No se dispone de datos comparativos frente a otros modelos alineados de 7B (Zephyr, Mistral-Instruct, Llama-3.1-8B-Instruct) porque las cifras de la model card provienen de un arnés local con jueces abiertos y no son comparables con puntuaciones de leaderboard.

## Limitaciones y advertencias

- El conjunto de prompts es un subconjunto filtrado: de 2.000 prompts solicitados, 750 se juzgaron con presupuesto reducido, 660 tuvieron retroalimentación completa, 344 pasaron el certificado de Nash y 319 superaron el filtro de representabilidad. Los prompts supervivientes son aquellos con excedente de negociación estrictamente positivo, por lo que el panel no es una muestra aleatoria del conjunto de datos.
- Una única semilla (42): los autores afirman explícitamente que las diferencias entre brazos no se pueden separar de la varianza de la semilla de política y que ninguna diferencia medida hasta ahora supera un error estándar en ninguna columna.
- Jueces locales: no se llamó a ninguna API propietaria. Arena-Hard se juzga normalmente con `gpt-4-1106`, AlpacaEval 2.0 con `weighted_alpaca_eval_gpt4_turbo` y MT-Bench con GPT-4; estas cifras son comparables entre los cinco brazos, pero no son puntuaciones de leaderboard.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, y el modelo hereda las condiciones del Qwen2.5-7B-Instruct subyacente, que conviene verificar por separado.
- Idiomas no declarados: no hay confirmación de qué lenguas conserva el ajuste; asumir multilingüismo pleno es una suposición no respaldada por la ficha.
- Riesgo de alucinación: no se ha publicado ninguna evaluación específica de factualidad o de tasas de alucinación más allá de TruthfulQA (0,6485), que está al mismo nivel que el modelo base.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento, sin versionado posterior y sin soporte. No se recomienda su uso en producción sin una evaluación propia.
- Sin capacidades de agente declaradas: no hay soporte documentado de tool calling ni de razonamiento multi-paso con herramientas, lo que limita su integración en pipelines automatizados.
- Fecha de creación registrada como 2026-09-17, posterior a la fecha de consulta habitual de referencias sobre Qwen2.5; conviene verificar la procedencia del artefacto antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/UW1-PROSPER
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Brazo UW1-NBPO-PW: https://huggingface.co/promotion/UW1-NBPO-PW
- Brazo UW1-FixedRefNash-PW: https://huggingface.co/promotion/UW1-FixedRefNash-PW
- Brazo UW1-DPO-soft: https://huggingface.co/promotion/UW1-DPO-soft
- Brazo UW1-INPO-soft: https://huggingface.co/promotion/UW1-INPO-soft
- Brazo UW1-SPPO: https://huggingface.co/promotion/UW1-SPPO

Nota: la búsqueda web asociada a esta ficha no devolvió ningún enlace relevante sobre el modelo; los resultados obtenidos eran foros en árabe sin relación con UW1-PROSPER, la optimización por preferencias o Qwen. No se dispone de paper, blog técnico, repositorio de código ni demo adicionales.
