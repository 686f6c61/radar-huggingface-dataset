# kai2336/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced es una adaptación del modelo oficial google/gemma-4-26B-A4B-it, publicada por el usuario kai2336 en HuggingFace. El objetivo declarado de esta versión es eliminar los rechazos (refusals) del modelo original manteniendo intactas las capacidades técnicas: el autor afirma haber conseguido 0 rechazos en 465 pruebas estándar, sin modificar datasets ni capacidades. Se trata de un modelo multimodal (texto e imagen) con arquitectura MoE de 25,2 mil millones de parámetros totales y solo 3,8 mil millones activos por pasada, lo que lo sitúa en una categoría de alto rendimiento con coste de inferencia contenido.

El modelo se distribuye exclusivamente en formato GGUF con cuantizaciones personalizadas K_P ("Perfect") desarrolladas por HauhauCS, que emplean análisis específico por modelo para preservar la calidad en los tensores más importantes. Incluye un proyector de visión (mmproj) en f16 para soporte multimodal. La variante "Balanced" es la recomendada por el autor como opción por defecto: razona sobre peticiones delicadas y ocasionalmente añade un breve encuadre de seguridad antes de entregar la respuesta completa, sin retener contenido. Está pensada principalmente para escritura creativa, roleplay e inteligencia emocional, aunque también se comercializa como apta para tareas de codificación y uso agéntico.

La relevancia de este modelo reside en su combinación de arquitectura eficiente (MoE con 3,8B activos), contexto nativo de 256K tokens, capacidades multimodales y una licencia Apache 2.0 que permite uso comercial sin restricciones. Su publicación como Release Candidate tras más de un mes de trabajo de ajuste lo posiciona como una alternativa para quienes buscan un modelo sin censura con base técnica sólida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos enrutados, top-8 + 1 experto compartido; 30 capas; atención híbrida: 5× ventana deslizante (1024 tokens) → 1× atención global completa, en bucle; Proportional RoPE (p-RoPE) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 3,8B (top-8 de 128 expertos + 1 experto compartido) |
| Longitud de contexto | 256K tokens nativos |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M, mmproj f16 (todas con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en el repo) |

## Arquitectura y entrenamiento

La arquitectura base es la de google/gemma-4-26B-A4B-it, un modelo MoE con 128 expertos enrutados de los que se activan los 8 superiores más un experto compartido por pasada, lo que reduce el coste de inferencia al equivalente de un modelo de ~3,8B parámetros activos. La atención es híbrida: se alternan 5 capas con ventana deslizante de 1024 tokens seguida de 1 capa con atención global completa, un diseño que abarata el coste computacional en contextos largos sin perder coherencia global. Emplea Proportional RoPE (p-RoPE) para el posicionamiento, con head dim de 256 en capas SWA y 512 en capas globales, 16 cabezas de atención y 8 cabezas KV (2 en capas globales). El vocabulario es de 262.144 tokens y la dimensión oculta de 2816.

El modelo es nativamente multimodal: incluye un proyector de visión (mmproj) que permite presupuestos variables de tokens visuales por imagen (70, 140, 280, 560 o 1120). El autor no ha publicado detalles sobre el proceso de entrenamiento del ajuste "uncensored", más allá de afirmar que no se modificaron datasets ni capacidades y que se empleó un proceso de calibración propio. Todos los cuantizados se generaron con matriz de importancia (imatrix) para preservar la calidad en los pesos sin censura. El modelo base original fue entrenado por Google con técnicas estándar de instrucción y RLHF, aunque esta variante no documenta el proceso exacto de destilación de rechazos.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto largo nativo de 256K tokens.
- Comprensión de imágenes (multimodal) mediante el proyector de visión incluido, con presupuesto variable de tokens visuales.
- Escritura creativa y roleplay: el autor indica que es su caso de uso principal, con estabilidad de muestreo mejorada en sesiones largas.
- Inteligencia emocional: capacidad para manejar conversaciones con matices afectivos y responder con encuadres de seguridad cuando es necesario.
- Codificación y tool use: soporta tareas de agente y encadenamiento de llamadas a herramientas, aunque el propio autor recomienda Qwen3.6 como superior en esta categoría.
- Sin rechazos en uso estándar: 0/465 rechazos en pruebas automatizadas y manuales; casos límite pueden requerir un segundo intento.
- Compatibilidad con plantillas de chat estándar de llama.cpp (requiere `--jinja` para el template correcto).

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, diálogos y escenas con contenido adulto o temas delicados sin rechazos, manteniendo coherencia en tramas largas gracias a su contexto de 256K tokens y su estabilidad de muestreo.
- Roleplay conversacional: su capacidad para mantener personajes y contexto a lo largo de cientos de turnos, junto con la ausencia de rechazos, lo hace adecuado para plataformas de RP con usuarios que exploran temáticas complejas.
- Asistencia emocional y coaching: puede mantener conversaciones empáticas y matizadas sobre temas personales sensibles sin derivar a respuestas evasivas, útil en aplicaciones de bienestar y apoyo.
- Análisis de documentos extensos con imágenes: su contexto nativo de 256K tokens y su capacidad multimodal permiten procesar manuales, informes o contratos largos con figuras, diagramas y tablas en una sola pasada.
- Automatización de tareas de investigación y operaciones: el autor indica que elimina rechazos en temas de seguridad, operaciones e investigación que bloquean trabajo legítimo de codificación y análisis.
- Despliegue de chatbots en edge o entornos con VRAM limitada: con cuantización Q4_K_P (17 GB) cabe en una RTX 4090 de 24 GB con margen para contexto, y su coste de inferencia de ~4B activos permite servir múltiples peticiones concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas estándar (MMLU, HumanEval, GSM8K, etc.) ni comparativas cuantitativas con otros modelos. La única métrica declarada es la tasa de rechazos: 0/465 en pruebas automatizadas y manuales, con un pequeño conjunto de casos límite que requieren un segundo intento.

## Requisitos de hardware

- VRAM estimada por cuantización (según tabla del autor):
  - Q8_K_P: 27 GB
  - Q6_K_P: 23 GB
  - Q5_K_P / Q5_K_M: 19 GB
  - Q4_K_P / Q4_K_M: 17 GB
  - IQ4_XS: 14 GB
  - Q3_K_P / Q3_K_M: 13 GB
  - IQ3_M: 12 GB
  - Q2_K_P: 11 GB
  - IQ2_M: 10 GB
  - mmproj f16: 1,2 GB adicionales
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_P con margen de contexto; A100 40/80 GB o H100 para Q8_K_P sin offloading; GPUs de 12-16 GB (RTX 3060, RTX 4070) para cuantizaciones IQ3_M o inferiores.
- Cabe en GPU de consumo: sí, desde 10 GB de VRAM con IQ2_M, aunque la calidad se degrada notablemente por debajo de Q4.
- Opciones de despliegue: llama.cpp (con `--jinja` para chat template), LM Studio, y cualquier runtime compatible con GGUF. No se menciona soporte nativo para vLLM o TGI en el repo.
- Latencia y throughput: no disponible. El autor indica que el coste de inferencia equivale a un modelo de ~4B activos, lo que sugiere throughput alto en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced | 25,2B total / 3,8B activos | 256K | Sí | Apache 2.0 | GGUF | Sin rechazos, cuantizaciones K_P personalizadas |
| google/gemma-4-26B-A4B-it (base) | 25,2B total / 3,8B activos | 256K | Sí | Apache 2.0 | safetensors, GGUF | Versión oficial con rechazos estándar |
| Qwen3.6 (mencionado por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible | El autor lo recomienda como superior en tareas agénticas de codificación |

No se dispone de datos suficientes para comparar rendimiento numérico con otras alternativas de la misma categoría (por ejemplo, Llama 4 Scout o Qwen2.5-VL) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para eliminar rechazos en contenido delicado, lo que implica un riesgo significativo de generar contenido inapropiado, ofensivo o potencialmente dañino si se usa sin supervisión.
- Solo soporta inglés como idioma principal; no se garantiza calidad en otros idiomas.
- La variante "Balanced" aún presenta un pequeño conjunto de casos límite que requieren un segundo intento para obtener respuesta completa.
- El autor recomienda Qwen3.6 como superior en tareas de codificación y uso agéntico, por lo que este modelo no es la opción óptima para pipelines de generación de código en producción.
- Las cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantización de LM Studio; es un problema de visualización, no de funcionalidad.
- No se han publicado benchmarks estándar, lo que impide evaluar objetivamente su rendimiento frente a la versión oficial o a otros modelos.
- El proceso de eliminación de rechazos no está documentado técnicamente; no se puede verificar la afirmación de "lossless" (sin pérdida de calidad).
- El repositorio no incluye pesos en safetensors, solo GGUF, lo que limita su uso en frameworks que requieran ese formato (por ejemplo, fine-tuning con PEFT).
- La fecha de creación del repo (agosto de 2026) es posterior a la información disponible sobre el modelo base, por lo que la compatibilidad con versiones futuras de llama.cpp no está garantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kai2336/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced
- Modelo base oficial: https://huggingface.co/google/gemma-4-26B-A4B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
