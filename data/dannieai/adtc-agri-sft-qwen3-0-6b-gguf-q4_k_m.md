# DannieAI/adtc-agri-sft-qwen3-0.6B-GGUF-Q4_K_M

## Resumen

adtc-agri-sft-qwen3-0.6B es un ajuste fino supervisado (SFT) del modelo denso Qwen/Qwen3-0.6B, desarrollado por DannieAI dentro del proyecto ADTC 2026. El modelo está especializado en asesoramiento agrario para pequeños agricultores y agentes de extensión agraria en Nigeria, y se distribuye en formato GGUF con cuantización Q4_K_M (además de pesos safetensors). Con 596.049.920 parámetros, es un modelo de menos de 1.000 millones de parámetros pensado explícitamente para escenarios offline y de bajos recursos computacionales.

El entrenamiento se realizó con QLoRA sobre una base cuantizada en 4 bits NF4 con cómputo en bf16 y doble cuantización, fusionando después los adaptadores en los pesos completos. El corpus combina el dataset de Kaggle `agriculture_qa_final_cleaned.csv` con ejemplos sintéticos de dosificación de fertilizantes y de economía de mercado y almacenamiento, hasta un total de 35.796 ejemplos de entrenamiento y 1.884 de evaluación (split del 5 %).

La relevancia de esta ficha es doble: por un lado, es un caso práctico de adaptación de un modelo pequeño a un dominio vertical y de bajos recursos (en inglés y con contexto nigeriano); por otro, el propio autor lo describe como una ejecución base (baseline) sin destilación, cuyo objetivo es medir cuánto margen de mejora puede aportar todavía una etapa posterior de destilación. No se han publicado resultados formales de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), decoder-only, con atención estándar; no se especifican detalles adicionales en la model card |
| Parametros totales | 596.049.920 (0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens como longitud máxima de secuencia en el SFT; la model card no especifica la ventana de inferencia efectiva del checkpoint fusionado |
| Tipos de cuantizacion | GGUF Q4_K_M (versión publicada en este repo); durante el entrenamiento se usó base 4-bit NF4 con doble cuantización y cómputo en bf16 |
| Idiomas soportados | en (inglés; orientado a inglés nigeriano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF (el repositorio contiene ambos formatos; tamaño del repo: 2,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only denso de 0,6 B de parámetros con soporte de plantilla de chat y modo thinking desactivable (`enable_thinking=False` en el ejemplo de uso). El ajuste se hizo con QLoRA: base cuantizada en 4 bits NF4, dtype de cómputo bf16, doble cuantización, rango r=16, alpha=32, dropout=0,05 y módulos objetivo k_proj, up_proj, q_proj, down_proj, v_proj, o_proj y gate_proj. Los adaptadores se fusionaron en los pesos base para generar el checkpoint publicado, y a partir de ahí se derivó la cuantización Q4_K_M en GGUF.

Los hiperparámetros de entrenamiento fueron: longitud máxima de secuencia 1.024, batch por dispositivo 2, acumulación de gradiente 8 (batch efectivo 16), learning rate 2e-4, scheduler coseno, precisión bf16 y semilla 42. La pérdida de validación descendió de 0,8002 en el paso 500 a 0,6329 en el paso final (4.476), con una pérdida de entrenamiento de 0,5946 en el paso 4.000; no se observa divergencia, pero tampoco se documenta una etapa de RLHF ni de DPO, ni decodificación especulativa. Los datos provienen de tres fuentes combinadas y deduplicadas por texto de pregunta normalizado: 36.489 ejemplos del CSV de Kaggle, 593 sintéticos de mercado y 598 sintéticos de fertilizantes, lo que da 37.680 ejemplos brutos antes de deduplicar y 35.796 finales de entrenamiento.

La tarea entrenada es de un solo turno: dado un escenario o pregunta agrícola, producir una evaluación concisa, una recomendación práctica y, cuando procede, una indicación de cuándo escalar a un experto presencial. El prompt de sistema usado en entrenamiento e inferencia está fijado explícitamente en la model card.

## Capacidades

- Generación de texto conversacional de un solo turno en inglés, con formato de respuesta estructurado en evaluación + recomendación + criterio de escalado.
- Asesoramiento agronómico de dominio: preguntas sobre cultivos, prácticas agrícolas, fertilización y economía de mercado o almacenamiento.
- Razonamiento numérico básico en problemas de dosificación de fertilizantes y de costes de mercado, gracias a los ejemplos sintéticos añadidos al corpus.
- Seguimiento de instrucciones mediante plantilla de chat compatible con `apply_chat_template` y rol de sistema.
- Capacidad de autolimitación: el prompt de entrenamiento incluye la indicación de recomendar ayuda experta presencial en decisiones de alto riesgo.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes, razonamiento multi-paso ni planificación de tareas.
- No se documentan capacidades de visión, audio ni modo thinking activo (el ejemplo de uso lo desactiva explícitamente).
- Multilingüismo limitado: la model card declara únicamente inglés.

## Casos de uso

- Asistencia agrícola offline en campo: el checkpoint GGUF Q4_K_M puede ejecutarse con llama.cpp u Ollama en un portátil o dispositivo sin conectividad, lo que encaja con el objetivo declarado de asistente offline para zonas rurales de Nigeria.
- Triaje en oficinas de extensión agraria: el modelo genera una primera evaluación y recomendación para preguntas recurrentes de agricultores, dejando al agente humano la validación y el escalado a visita presencial.
- Cálculo orientativo de dosis de fertilizante: se entrenó con 598 ejemplos sintéticos específicos de dosificación, por lo que puede resolver problemas aritméticos sencillos de aplicación de insumos a partir de datos de superficie y cultivo.
- Consultas de economía de mercado y almacenamiento: los 593 ejemplos sintéticos de mercado permiten responder preguntas sobre precios, momento de venta y conservación de la cosecha, con la advertencia de que no son asesoramiento financiero autorizado.
- Canal de consultas por SMS o USSD: al ser un modelo de 0,6 B y respuestas concisas, es viable integrarlo en un backend que responda a mensajes de texto de bajo ancho de banda, con generación determinista (`do_sample=False`).
- Generación de material de formación y FAQ para ONG: producción asistida de borradores de guías y respuestas frecuentes en inglés para programas de formación de agricultores, sujetos a revisión agronómica.
- Investigación en adaptación de dominio con pocos recursos: sirve como referencia baseline reproducible (QLoRA, r=16, datos de Kaggle + sintéticos) para estudiar el efecto de la destilación o de más datos sintéticos en un modelo de 0,6 B.
- Prototipado de asistentes embebidos: por su tamaño, es adecuado para experimentar con asistentes de dominio en hardware de gama baja (SBC, mini-PC sin GPU) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación se realizó de forma informal mediante comprobaciones cualitativas sobre prompts reservados, y que el benchmarking formal de precisión (ARC-Easy y calidad de dominio mediante el perfilador ADTC) se registra por separado, fuera de esta tarjeta. Los únicos datos numéricos publicados son las pérdidas de entrenamiento y validación:

| Paso | Pérdida de entrenamiento | Pérdida de validación | Learning rate |
|---|---|---|---|
| 500 | 0,9105 | 0,8002 | 1,94e-04 |
| 1.000 | 0,7635 | 0,7369 | 1,76e-04 |
| 1.500 | 0,7171 | 0,7013 | 1,50e-04 |
| 2.000 | 0,6832 | 0,6762 | 1,17e-04 |
| 2.500 | 0,6438 | 0,6611 | 8,18e-05 |
| 3.000 | 0,6130 | 0,6474 | 4,91e-05 |
| 3.500 | 0,5984 | 0,6379 | 2,26e-05 |
| 4.000 | 0,5946 | 0,6337 | 5,55e-06 |
| 4.476 | no disponible | 0,6329 | no disponible |

## Requisitos de hardware

- VRAM estimada en bf16 o fp16: aproximadamente 1,2 GB solo para los pesos (596 M × 2 bytes), más caché KV y activaciones; en la práctica unos 1,5-2 GB con contexto de 1.024 tokens.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 0,4-0,5 GB de pesos, con lo que la inferencia completa cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquiera con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, T4, L4); modelos mayores como A100, H100 o RTX 4090 no aportan ventaja significativa por el reducido tamaño del modelo, salvo por agregación de muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales e incluso en iGPU recientes con suficiente memoria compartida; también es viable en CPU pura.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, servidores GGUF), transformers con el ejemplo oficial de la model card, y vLLM o TGI para servir la versión safetensors. El tag `text-generation-inference` y `endpoints_compatible` aparece en los metadatos del repositorio.
- Latencia y throughput: no disponible. No se han publicado medidas de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento general de sus respectivas fichas publicas y no de la informacion proporcionada en esta busqueda; se marcan como referencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| adtc-agri-sft-qwen3-0.6B | 596 M (denso) | 1.024 tokens en SFT (no se especifica la ventana efectiva) | apache-2.0 | safetensors y GGUF Q4_K_M | Ajuste de dominio agrario en inglés para Nigeria; sin benchmarks publicados |
| Qwen/Qwen3-0.6B (base) | 596 M (denso) | 32.768 tokens nativos segun la documentacion del modelo base (no confirmado en la model card de este fine-tune) | apache-2.0 | safetensors | Modelo generalista multilingüe; referencia directa del autor para medir la ganancia del SFT |
| Qwen2.5-0.5B-Instruct | ~494 M (denso) | 32.768 tokens segun su ficha (referencia general) | apache-2.0 | safetensors, GGUF | Alternativa generalista de tamano comparable, con soporte multilingüe y de instrucciones |
| SmolLM2-360M-Instruct | 362 M (denso) | 8.192 tokens segun su ficha (referencia general) | apache-2.0 | safetensors, GGUF | Alternativa aún más ligera para despliegue en dispositivos muy limitados |

No se dispone de una comparación cuantitativa de rendimiento entre estos modelos, porque el modelo descrito no publica resultados de benchmarks.

## Limitaciones y advertencias

- Dominio restringido: solo está validado para asesoramiento agrícola en el contexto nigeriano; el autor advierte explícitamente que no está validado para uso como asistente generalista ni para regiones o cultivos fuera de su distribución de entrenamiento.
- Naturaleza de las respuestas: los resultados deben tratarse como asesoramiento orientativo, nunca como guía agronómica o financiera autoritativa. El propio prompt exige recomendar seguimiento presencial en decisiones de alto riesgo.
- Riesgo de alucinación: no se documenta ninguna evaluación de fidelidad factual, y el corpus principal proviene de un dataset de Kaggle de calidad no verificada en esta ficha; los ejemplos sintéticos pueden introducir sesgos numéricos en las recomendaciones de fertilizante o de precios.
- Sesgos geográficos y de dominio: entrenado exclusivamente con datos orientados a Nigeria y en inglés, por lo que puede fallar ante variedades de cultivo, normativas, monedas o unidades de medida de otras regiones.
- Idiomas: solo inglés declarado. No hay evidencia de capacidades en yoruba, hausa, igbo ni en castellano.
- Ventana de contexto: la longitud máxima de secuencia usada en el entrenamiento es de 1.024 tokens, muy inferior a la del modelo base, lo que limita el seguimiento de conversaciones largas o documentos extensos; no se especifica cómo se comporta el checkpoint fusionado por encima de esa longitud.
- Conversación de un solo turno: la tarea entrenada es single-turn; no se ha validado el comportamiento multi-turno ni el mantenimiento de contexto entre turnos.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso, lo que restringe su integración en pipelines de automatización complejos.
- Licencia: apache-2.0 permite uso comercial, pero el autor no ofrece ninguna garantía sobre la idoneidad agronómica del resultado; conviene una revisión experta antes de desplegarlo en producción.
- Inconsistencias en los metadatos: el repositorio se publica bajo el identificador `DannieAI/...` mientras que el fragmento de código de la model card referencia `EYEDOL/adtc-agri-sft-qwen3-0.6b`, y las fechas de creación y actualización (2026) no coinciden con el momento de redacción de esta ficha. Conviene verificar la ruta correcta antes de descargar.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DannieAI/adtc-agri-sft-qwen3-0.6B-GGUF-Q4_K_M
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Referencia alternativa usada en la model card (identificador distinto): https://huggingface.co/EYEDOL/adtc-agri-sft-qwen3-0.6b
- Dataset de origen citado en la model card: `agriculture_qa_final_cleaned.csv` (Kaggle), sin URL directa en la información proporcionada
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo, el proyecto ADTC 2026 ni publicaciones asociadas; no se dispone de papers, blogs, repositorios de código ni demos adicionales.
