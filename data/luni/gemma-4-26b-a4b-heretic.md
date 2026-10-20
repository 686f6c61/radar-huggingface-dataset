# Luni/Gemma-4-26B-A4B-Heretic

## Resumen

Gemma-4-26B-A4B-Heretic es una variante del modelo base google/gemma-4-26B-A4B-it publicada por el usuario Luni en Hugging Face. No es un modelo entrenado desde cero, sino una modificación de pesos mediante ablación direccional (*directional ablation*) orientada a reducir la tasa de rechazos del modelo alineado original. El autor la describe explícitamente como una "ejecución de control empírica" para evaluar si la ablación direccional funciona sobre la arquitectura MoE de enrutamiento activo de Gemma 4.

El modelo conserva la arquitectura del base: un transformer de mezcla de expertos con 128 expertos, 8 activos por token, 30 capas y 25.805.933.872 parámetros totales según los pesos en safetensors (unos 25,8 B). El repositorio ocupa 51,6 GB y se distribuye en formato safetensors bajo licencia Gemma, con soporte declarado únicamente para inglés.

Su relevancia es doble: por un lado, documenta de forma reproducible un experimento de eliminación de rechazos con registro completo de hiperparámetros (80 trials con Optuna TPE y fichero `optuna_study.jsonl`); por otro, muestra una limitación estructural interesante de las arquitecturas MoE, ya que la ablación sobre proyecciones densas no elimina por completo el comportamiento de rechazo cuando el enrutamiento disperso sigue activo. El propio autor remite a su variante densa Gemma-4-31B-Heretic para una ablación completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de enrutamiento activo; 128 expertos, 8 activos por token, 30 capas |
| Parámetros totales | 25.805.933.872 (~25,8 B) según safetensors |
| Parámetros activos | No disponible numéricamente; 8 de 128 expertos activos por token (la nomenclatura "A4B" del modelo base sugiere ~4 B activos, sin confirmar en la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | El autor no publica variantes cuantizadas; los pesos safetensors pueden cuantizarse posteriormente con herramientas estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors; repositorio de 51,6 GB |
| Modelo base | google/gemma-4-26B-A4B-it |
| Método de modificación | Ablación direccional (diferencia de medias con ortogonalización y normalización completa de filas) |
| Componentes ablacionados | `attn.o_proj` y `mlp.down_proj` en las 30 capas |
| Fecha de publicación | 19 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer MoE que enruta dinámicamente las representaciones a través de 128 proyecciones de expertos dispersos, con 8 expertos activos por token y 30 capas. Esta configuración implica que, aunque el coste computacional por token se aproxima al de un modelo mucho más pequeño, todos los expertos deben estar residentes en memoria, de modo que los requisitos de VRAM vienen determinados por los 25,8 B parámetros totales y no por los activos.

No hay entrenamiento desde cero ni datos de preentrenamiento propios: el autor parte de google/gemma-4-26B-A4B-it y aplica una ablación direccional sobre las proyecciones de atención y de la parte densa del feedforward. El método combina diferencia de medias entre prompts dañinos y benignos, ortogonalización de la dirección resultante y normalización de filas. La búsqueda de hiperparámetros se realizó con un estimador TPE multivariante de estructura arbórea sobre 80 trials, con un objetivo de divergencia KL de 0,01 y selección de la solución Pareto óptima.

Los datos utilizados para calcular las direcciones de contraste son 1.200 pares de prompts: subconjuntos contrastivos de AllenAI WildJailbreak, AdvBench y BeaverTails como anclaje de la dirección dañina, y anclajes benignos de LMSYS WildChat, OpenHermes y Magicoder para preservar capacidades. La evaluación se hizo con un conjunto de 80 prompts multidisciplinar que cubre ciberseguridad, operaciones de sistemas y tareas creativas. El autor advierte de que la ablación sobre proyecciones densas reduce los rechazos un 60 %, pero el comportamiento de enrutamiento de los expertos dispersos sigue activo, lo que limita el efecto final.

## Capacidades

- Generación de texto en inglés con el conocimiento y las capacidades heredadas del modelo base Gemma 4.
- Razonamiento y respuesta ante prompts que el modelo alineado rechazaría: la tasa de rechazo baja del 77,5 % al 31,2 % en el conjunto de evaluación del autor.
- Reducción del comportamiento de rechazo en las capas densas (atención y feedforward denso) de las 30 capas.
- Capacidades de código y matemáticas potencialmente heredadas del base, aunque no se publican evaluaciones específicas que lo confirmen tras la ablación.
- Soporte de tool calling y de razonamiento multi-paso: no confirmado en la información proporcionada, depende de lo que conserve el modelo base.
- Capacidad multilingüe: no disponible; la model card declara únicamente inglés.
- Modo "thinking" o vision: no disponible en la información proporcionada.
- Trazabilidad experimental: registro completo de trials, hiperparámetros y evaluaciones en `optuna_study.jsonl`, útil para reproducir el proceso.

## Casos de uso

- Investigación sobre mecanismos de rechazo: el modelo sirve como condición experimental para estudiar cómo se representa la negativa a responder en un transformer MoE y comparar con la variante densa del mismo autor.
- Evaluación de robustez de salvaguardas: al mantener un 31,2 % de rechazos, es útil para medir la resistencia de clasificadores de seguridad y filtros de salida frente a contenido parcialmente desbloqueado en entornos controlados.
- Red-teaming y generación de datos adversarios: permite producir pares prompt-respuesta para entrenar clasificadores de daño y sistemas de moderación, con revisión humana obligatoria.
- Estudio de degradación de capacidades por ablación: la divergencia KL de 0,01 como objetivo permite analizar la relación entre eliminación de rechazos y pérdida de rendimiento en tareas benignas.
- Automatización de pipelines agénticos con fricción por rechazos: en flujos internos donde las negativas del modelo rompen la cadena de ejecución (por ejemplo, análisis de configuraciones o guiones de pruebas de penetración autorizadas), sirve como alternativa con menos interrupciones, siempre con guardarraíles externos.
- Escritura creativa y de ficción sin sobrerrechazo: útil para narrativa con violencia, conflicto o temas sensibles en contextos editoriales legítimos.
- Docencia y divulgación sobre alineación: permite mostrar de forma práctica qué es una ablación direccional y qué límites tiene en arquitecturas con enrutamiento disperso.

## Benchmarks y rendimiento

| Métrica | Modelo base | Gemma-4-26B-A4B-Heretic | Notas |
|---|---|---|---|
| Tasa de rechazo (80 prompts de evaluación) | 77,5 % (62/80) | 31,2 % (25/80) | Reducción relativa de ~60 % |
| Divergencia KL respecto al base | — | 0,01 | Objetivo fijado; solución Pareto óptima seleccionada |
| Trials de optimización | — | 80 | Búsqueda TPE multivariante |
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | No disponible | No disponible | No publicados en la información proporcionada |

## Requisitos de hardware

- VRAM en BF16: los pesos suman 51,6 GB; con caché KV y overhead de runtime se recomienda entre 56 y 64 GB.
- VRAM en FP8/INT8: aproximadamente 26 GB de pesos, con unos 32-36 GB reales de uso.
- VRAM en 4 bits (NF4, GPTQ o AWQ): aproximadamente 13-15 GB de pesos, con unos 18-20 GB reales de uso.
- Consideración MoE: aunque solo 8 de 128 expertos estén activos por token, todos los expertos deben residir en memoria; el ahorro de la arquitectura dispersa se produce en cómputo, no en VRAM.
- GPU de centro de datos: A100 80 GB o H100 80 GB para BF16 en una sola GPU; 2 × A100 40 GB con tensor parallelism como alternativa.
- GPU de consumo: no cabe en BF16 en ninguna consumer; en 4 bits puede ejecutarse en RTX 3090, RTX 4090 o RTX 5090 (24-32 GB), con margen ajustado.
- Opciones de despliegue: vLLM, TGI o SGLang si la versión en uso soporta la arquitectura gemma4 MoE (no confirmado); llama.cpp u Ollama requerirían una conversión propia a GGUF, ya que el autor no publica cuantizaciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it | 25,8 B totales (MoE, 128 expertos, 8 activos) | No disponible | Gemma | Modelo base alineado | Público en Hugging Face |
| Luni/Gemma-4-26B-A4B-Heretic | 25,8 B totales (MoE, 128 expertos, 8 activos) | No disponible | Gemma | Ablación direccional; 31,2 % de rechazos | Público, 0 descargas y 0 likes en el momento de la consulta |
| Luni/Gemma-4-31B-Heretic | 31 B (según la model card) | No disponible | Gemma | Ablación completa también sobre capas feedforward densas | Referenciado en la model card; sin métricas publicadas en la información disponible |

## Limitaciones y advertencias

- La ablación es incompleta: la tasa de rechazo se queda en el 31,2 %, porque el enrutamiento de los expertos dispersos sigue operativo. El propio autor lo señala y remite a su variante densa de 31 B.
- La eliminación de salvaguardas implica riesgo real de generar contenido dañino, ilegal o inseguro; no debería desplegarse en aplicaciones de cara al público sin filtros externos y supervisión humana.
- La divergencia KL de 0,01 es un objetivo de optimización, no una garantía de preservación de capacidades: no se publican evaluaciones de MMLU, HumanEval, GSM8K ni de calidad instruccional tras la ablación.
- Idiomas: solo inglés declarado; el comportamiento en castellano u otras lenguas no está evaluado.
- Longitud de contexto no documentada en la información disponible; conviene verificarla contra el modelo base antes de diseñar aplicaciones con contexto largo.
- Riesgo de alucinación: inherente al modelo base y no medido en esta variante; la modificación de pesos puede alterar calibración y estilo de respuesta.
- Sesgos: no se documenta ninguna evaluación de sesgo; los conjuntos de contraste (WildJailbreak, AdvBench, BeaverTails) introducen su propia distribución y pueden sesgar la dirección ablacionada.
- Licencia Gemma: se heredan las restricciones de uso de los Gemma Terms of Use, incluida la prohibición de usos maliciosos y la obligación de propagar los términos en redistribuciones; conviene revisar las cláusulas de uso comercial antes de integrarlo en un producto.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no existen informes independientes de calidad ni de estabilidad.
- Fecha de publicación en 2026 y autoría individual: sin revisión por pares del método ni del conjunto de evaluación de 80 prompts, que es pequeño y de dominio específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luni/Gemma-4-26B-A4B-Heretic
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Registro de optimización: fichero `optuna_study.jsonl` incluido en el repositorio del modelo
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Resultados de búsqueda web: las consultas realizadas devolvieron únicamente páginas sin relación con el modelo (Lunii, Lumni y una ficha de la FNAC), por lo que no se han encontrado papers, blogs, repositorios ni demos adicionales.
