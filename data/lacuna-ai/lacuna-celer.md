# lacuna-ai/lacuna-celer

## Resumen

Lacuna Celer es un modelo de clasificación de texto desarrollado por lacuna-ai que puntúa el ajuste entre una oferta de empleo y un CV directamente en el navegador, en el dispositivo del usuario. Es la versión rápida (68 millones de parámetros, 76 MB cuantizado) de la extensión de Chrome Lacuna, cuya variante grande es Lacuna Altus. El modelo está construido sobre Ettin-68M (jhu-clsp/ettin-encoder-68m), un codificador tipo transformer, y se ha afinado con cinco cabezas de clasificación además de destilarse desde Lacuna Altus (395M) usando 13.970 pares CV × oferta adicionales sin etiquetar.

Su problema de partida es claro: los buscadores de empleo ordenan por similitud superficial, pero no distinguen si el candidato cubre los requisitos imprescindibles, si puede trabajar en la ubicación exigida o si su nivel es el adecuado. Celer resuelve esto prediciendo en una sola pasada un veredicto global (apply / stretch / skip), la elegibilidad por ubicación, la correspondencia de nivel de seniority, el cumplimiento de requisitos imprescindibles y, a nivel de línea de la oferta, qué requisitos cubre el CV y cuáles son must-have.

Se distribuye en formato ONNX (con pesos a 4 bits y fp16), lo que permite ejecutarlo con transformers.js y WebGPU sin servidor. Su licencia MIT y su tamaño reducido lo hacen relevante para quien quiera integrar triaje de ofertas en herramientas locales y privadas, sin enviar datos personales a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (base: Ettin-68M) con cinco cabezas de clasificación, afinado por destilación |
| Parametros totales | 68M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (entrada [CLS] CV [SEP] oferta [SEP], truncado longest-first) |
| Tipos de cuantizacion | 4-bit weights + fp16 (76 MB), fp16 (137 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (model_q4f16.onnx, model_fp16.onnx); base en PyTorch/safetensors vía Ettin-68M |

## Arquitectura y entrenamiento

El modelo parte de Ettin-68M, un codificador transformer compacto de la Universidad Johns Hopkins, al que se añaden cinco cabezas de salida: `verdict` (3 clases), `location` (3 clases), `seniority` (3 clases), `must_met` (2 clases) y dos cabezas por token, `line_met` (4 clases por línea de la oferta) y `line_must` (probabilidad binaria). El entrenamiento combina aprendizaje supervisado con destilación de conocimiento desde Lacuna Altus (395M): además de las etiquetas generadas por un LLM, se usan las predicciones del profesor como soft targets sobre 13.970 pares adicionales sin etiquetar, con un peso de soft target de 0,5.

Los datos de entrenamiento comprenden unas 82.000 ofertas públicas (websites de empresas y tablones), 2.217 CV sintéticos generados por un LLM a partir de trayectorias profesionales realistas y 12.699 pares CV × oferta etiquetados por DeepSeek V4.1 Flash con una rúbrica fija (requisitos cumplidos/parciales/no cumplidos, elegibilidad por ubicación, años y nivel). El veredicto final se deriva por reglas, no se pregunta directamente. La partición se hace por CV: 10.171 pares de entrenamiento, 1.270 de validación y 1.258 de test. El entrenamiento duró unas 2 horas en 2× NVIDIA T4, con 3 épocas, lr 1e-4, AdamW y secuencia de 4.096 tokens.

Como innovación práctica destaca la destilación efectiva: el estudiante de 68M iguala al profesor de 395M en la mayoría de cabezas, con mejora clara en `seniority` (+0,05 Macro-F1, unas tres veces la dispersión entre semillas). Los CV se normalizan con una función `normalize_cv` (texto por bloques, encabezados en mayúsculas, viñetas "- ", datos de contacto eliminados) tanto en entrenamiento como en inferencia.

## Capacidades

- Clasificación conjunta CV + oferta en una sola pasada, con ventana de 4.096 tokens.
- Veredicto global de ajuste en tres clases: apply / stretch / skip.
- Predicción de elegibilidad por ubicación (yes / unclear / no), útil para filtrar ofertas con restricciones geográficas.
- Comparación de seniority entre candidato y oferta (below / at / above).
- Detección del cumplimiento de requisitos imprescindibles (must_met: yes / no).
- Análisis por línea de la oferta: para cada línea de 15+ caracteres, si es requisito, si es must-have y si el CV lo cubre (none / yes / partial / no), lo que permite señalar brechas concretas.
- Ejecución 100% local en navegador vía ONNX, transformers.js y WebGPU; sin envío de datos personales.
- Probabilidades calibradas mediante temperaturas incluidas en `jobfit.json`.
- No soporta generación de texto, razonamiento libre, código, ni tool calling; es un clasificador especializado.

## Casos de uso

- Triaje personal de ofertas de empleo: el modelo ordena las ofertas de un tablón para que el usuario lea primero las prometedoras, priorizando apply sobre stretch y skip.
- Identificación de brechas antes de postular: las cabezas por línea señalan qué requisitos must-have del anuncio no cubre el CV, permitiendo decidir si formar o no postular.
- Filtrado por ubicación y teletrabajo: detecta ofertas no elegibles por geografía (por ejemplo, remoto solo para EE. UU. cuando el usuario está en Europa) y las oculta solo con alta confianza, P(no) ≥ 0,8 en la extensión de referencia.
- Extensión de navegador con privacidad: al ejecutarse con transformers.js/WebGPU en el dispositivo, puede integrarse en una extensión de Chrome que analiza ofertas sin enviar el CV a ningún servidor.
- Asistente de decisión "¿debería postular?": combina veredicto, seniority y must-haves para dar una segunda opinión rápida y explicable antes de invertir tiempo en una candidatura.
- Investigación en clasificación multi-cabeza por pares de documentos: el pipeline de entrenamiento, etiquetado con LLM y destilación es replicable (código público) para tareas similares de emparejamiento documento-documento.
- Prototipado local con ONNX: los pesos cuantizados a 76 MB permiten experimentar en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

Macro-F1 sobre el split de test (1.258 pares, CVs nunca vistos en entrenamiento ni en destilación):

| Modelo | Params | Verdict | Seniority | Location | Must-haves | Req. lines |
|---|---|---|---|---|---|---|
| Lacuna Celer (PyTorch) | 68M | 0,686 | 0,718 | 0,903 | 0,810 | 0,709 |
| Lacuna Celer, media de 3 semillas | 68M | 0,665 | 0,718 | 0,899 | 0,808 | 0,706 |
| Ettin-68M, mismos datos sin destilación | 68M | 0,654 | 0,667 | 0,891 | 0,804 | 0,686 |
| Lacuna Altus (profesor) | 395M | 0,671 | 0,731 | 0,901 | 0,806 | 0,715 |

Datos adicionales publicados: la cuantización q4f16 produce el mismo argmax que PyTorch en el 94-99% de los pares de validación por cabeza; la versión fp16 produce predicciones idénticas a PyTorch. En una evaluación privada sobre las decisiones reales de apply/skip de un único usuario, Celer ordenó las postulaciones aplicadas por encima de las descartadas aproximadamente igual que Altus y notablemente mejor que similitud genérica (TF-IDF, bge-m3, gte-modernbert-base), que no distingue elegibilidad por ubicación. No se han publicado métricas tipo MMLU, HumanEval o GSM8K (no aplicables a un clasificador).

## Requisitos de hardware

- VRAM para inferencia: mínima; el modelo cuantizado ocupa 76 MB y el fp16 137 MB, por lo que funciona en CPU o GPU integrada dentro del navegador.
- GPU recomendadas: ninguna en particular; está diseñado para WebGPU en navegadores de escritorio. Para entrenamiento se usaron 2× NVIDIA T4 (16 GB cada una), unas 2 horas.
- Cabe sin problema en cualquier GPU de consumo e incluso solo con CPU; no requiere A100, H100 ni RTX 4090.
- Despliegue: ONNX Runtime / transformers.js en navegador (caso de uso principal, con WebGPU), ONNX Runtime en Python o Node, o PyTorch con los pesos base de Ettin-68M. No es un modelo generativo, por lo que vLLM, TGI, llama.cpp u Ollama no son aplicables directamente.
- Latencia: no disponible; al ser un codificador de 68M con una sola pasada de hasta 4.096 tokens, se espera inferencia en decenas de milisegundos a pocos segundos en hardware de consumo, pero no hay cifra publicada.

## Comparativa con modelos similares

| Modelo | Params | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lacuna Celer | 68M | Clasificación CV × oferta multi-cabeza | 4.096 tokens | MIT | ONNX público (Hugging Face), código en GitHub |
| Lacuna Altus (profesor) | 395M | Misma tarea, tier grande | 4.096 tokens | no disponible | Hugging Face (lacuna-ai/lacuna-altus) |
| Ettin-68M (base) | 68M | Codificador genérico de textos | no disponible | no disponible | Hugging Face (jhu-clsp/ettin-encoder-68m) |
| bge-m3 / gte-modernbert-base (similitud) | no disponible | Embeddings/similitud de documentos | no disponible | no disponible | Públicos en Hugging Face |

Frente a alternativas de similitud semántica (bge-m3, gte-modernbert-base), Celer aporta cabezas estructuradas (ubicación, seniority, must-haves) que los embeddings genéricos no capturan, según la evaluación privada del autor. Frente a su profesor Altus, ofrece calidad similar con casi 6 veces menos parámetros y un peso 5,8 veces más pequeño.

## Limitaciones y advertencias

- Solo inglés, y entrenado principalmente con roles de tecnología, producto, datos, diseño, marketing, ventas y operaciones, con ubicaciones concentradas en Europa. Fuera de ese dominio el rendimiento no está evaluado.
- Las etiquetas proceden de un LLM (DeepSeek V4.1 Flash), no de reclutadores humanos: el modelo hereda sus sesgos y su criterio no puede ser mejor que el del etiquetador.
- Los CV de entrenamiento son sintéticos, escritos por un LLM; los CV reales son más desordenados. Es imprescindible aplicar la normalización `normalize_cv` antes de inferir.
- Debilidades documentadas: las ofertas "demasiado senior" para el candidato se pasan por alto con frecuencia; el gusto personal (industria, tipo de empresa) no está modelado; los roles remotos restringidos a EE. UU. se marcan como no elegibles para usuarios fuera de EE. UU., correcto para empleados pero no para contratistas freelance.
- Uso previsto exclusivamente para el propio candidato como ayuda de triaje. No debe usarse para filtrar, ordenar o rechazar candidatos en procesos de selección: no fue construido ni evaluado para ello, y las decisiones de contratación requieren juicio humano y, en muchas jurisdicciones, garantías legales.
- Un veredicto `location: no` no debería ocultar una oferta de forma automática salvo alta confianza; la extensión de referencia solo oculta con P(no) ≥ 0,8.
- Riesgo de alucinación: no aplicable como tal (no genera texto), pero las probabilidades deben calibrarse con las temperaturas de `jobfit.json` para ser fiables.
- Descargas prácticamente nulas (0 en el momento de redactar la ficha) y proyecto muy reciente: escaso historial de auditoría por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lacuna-ai/lacuna-celer
- Modelo profesor (Lacuna Altus): https://huggingface.co/lacuna-ai/lacuna-altus
- Modelo base (Ettin-68M): https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Código, pipeline de entrenamiento y extensión de Chrome: https://github.com/cucoleadan/lacuna-ai
