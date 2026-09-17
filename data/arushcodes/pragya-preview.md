# ArushCodes/Pragya-Preview

## Resumen

Pragya Preview es un modelo de lenguaje causal experimental publicado por ArushCodes (Arush Kumar y el equipo de Pragya) en Hugging Face. Se trata de un prototipo de la familia "Pragya" (sánscrito para sabiduría) entrenado íntegramente sobre el dataset TinyStories de Ronen Eldan y Yuanzhi Li, con el objetivo declarado de demostrar convergencia rápida de un baseline bajo restricciones severas de cómputo: una única GPU NVIDIA T4 en Google Colab durante aproximadamente una hora.

El modelo emplea una arquitectura transformer decoder-only con Grouped Query Attention (GQA) y está orientado exclusivamente a la generación de texto en inglés, en concreto a la compleción de cuentos cortos con vocabulario sencillo. No está ajustado con instrucciones (no instruct-tuned) y, según su propia model card, el entrenamiento no se completó, por lo que debe considerarse un artefacto de investigación y no un modelo listo para producción.

Su relevancia es fundamentalmente didáctica y de infraestructura: sirve como banco de pruebas de bajo coste para validar pipelines de inferencia (transformers, ONNX, text-generation-inference) y para reproducir experimentos de entrenamiento en hardware consumer. El repositorio ocupa 0,1 GB y publica los pesos en formato PyTorch (.pt) y ONNX, con licencia Apache 2.0. En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 "likes", sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con Grouped Query Attention (GQA) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; se publican pesos en precisión original (.pt y .onnx), sin variantes GGUF, AWQ, GPTQ ni bitsandbytes documentadas |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx); no se publican safetensors ni GGUF |
| Desarrollador | Arush Kumar y el equipo de Pragya (cuenta ArushCodes) |
| Tarea principal | Generación de texto / compleción de cuentos cortos (text-generation) |
| Dataset de entrenamiento | roneneldan/TinyStories |
| Tamaño del repositorio | 0,1 GB |
| Librería declarada | transformers |
| Fecha de publicación | 17 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal con Grouped Query Attention, una variante de la atención multi-cabeza en la que varias cabezas de query comparten un mismo conjunto de cabezas key/value, lo que reduce el coste de memoria del KV cache durante la inferencia. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas ni la longitud de contexto utilizada, y no se ha publicado ningún informe técnico específico del modelo. El único documento de referencia citado es el paper de TinyStories (arXiv:2305.07759), que describe el dataset, no este modelo concreto.

El entrenamiento se realizó con PyTorch y Hugging Face Transformers sobre una sola GPU NVIDIA T4 de la capa gratuita de Google Colab, durante aproximadamente una hora. No se documenta el número de tokens procesados, la composición exacta del subconjunto de datos empleado, ni la existencia de fases de ajuste fino con RLHF, DPO o SFT. El autor indica explícitamente que el modelo no está instruct-tuned y que no se entrenó por completo, por lo que el checkpoint representa un estado intermedio de convergencia. La innovación destacable no es algorítmica sino metodológica: demuestra que es posible obtener un baseline generador de narrativa breve coherente con un presupuesto de cómputo mínimo.

## Capacidades

- Generación de texto en inglés orientada a narrativa corta: compleción de cuentos e historias breves con vocabulario básico, partiendo de prompts como "Once upon a time, ".
- Continuación de texto con coherencia local: mantiene estructura gramatical y de párrafo en fragmentos cortos.
- Inferencia de baja latencia: por su tamaño reducido puede ejecutarse en CPU y en GPU consumer sin requisitos especiales.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Exportación a ONNX para despliegue en runtimes alternativos a PyTorch.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo "thinking" ni de cadena de pensamiento explícita.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe: únicamente inglés; no se documenta soporte de otros idiomas.
- No tiene conocimiento factual general, ni capacidades de código, ni de matemáticas, según reconoce su propia model card.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo es lo bastante pequeño para inspeccionar pesos, trazar la atención y explicar el funcionamiento de Grouped Query Attention en un aula o taller sin necesidad de clústeres de GPU.
- Validación de infraestructura de inferencia: dado que el repositorio incluye pesos ONNX y la etiqueta `endpoints_compatible`, sirve para probar el cableado de un endpoint, un servidor TGI o un pipeline de ONNX Runtime antes de desplegar modelos de mayor tamaño.
- Pruebas de integración en CI/CD: su reducido tamaño (0,1 GB) y su ejecución viable en CPU permiten incluirlo en tests automatizados que verifiquen que el pipeline de carga, tokenización y generación sigue funcionando tras cada cambio de dependencias.
- Generación de cuentos para prototipos de producto: aplicaciones infantiles o demos de UX pueden usar el modelo para producir borradores de historias de vocabulario simple, siempre con revisión humana posterior y sin exponerlo directamente a usuarios finales.
- Banco de pruebas de cuantización y optimización: comparar fp32 frente a fp16 o cuantización INT8 en ONNX Runtime sobre este modelo permite medir variaciones de latencia y calidad con un coste de cómputo mínimo antes de aplicar las mismas técnicas a modelos grandes.
- Reproducción de experimentos de entrenamiento con presupuesto limitado: la configuración documentada (1 GPU T4, 1 hora, TinyStories) sirve como plantilla reproducible para estudiar curvas de convergencia y ajuste de hiperparámetros en entornos educativos.
- Aumento de datos sintéticos a pequeña escala: generar continuaciones de cuentos con vocabulario controlado para ampliar corpus de narrativa infantil, aplicando después filtrado automático por repetición, coherencia y toxicidad.
- Evaluación de tokenizadores y métricas de perplejidad: al estar entrenado sobre un dataset acotado y público, es útil como caso de estudio para comparar tokenizadores y métricas de evaluación en corpus narrativos simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni perplejidad sobre conjuntos de validación, y tampoco se han encontrado evaluaciones de terceros en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 0,1 GB incluyendo pesos en dos formatos, lo que sitúa al modelo en el orden de decenas de millones de parámetros como máximo; una estimación orientativa sería de unos pocos cientos de megabytes en fp32 y menos de 1 GB en fp16, pero es una inferencia a partir del tamaño del repositorio, no un dato confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente en la práctica; el propio autor lo entrenó en una NVIDIA T4. No se documentan requisitos para A100, H100 o RTX 4090 porque el modelo no los necesita.
- Cabe en GPU consumer: sí, con margen amplio. Cualquier GPU con 4 GB o más de VRAM debería poder ejecutarlo en fp16, y previsiblemente también en equipos con GPU integrada o en CPU.
- Opciones de despliegue: Hugging Face Transformers (ruta oficial documentada), ONNX Runtime mediante los pesos .onnx publicados, y text-generation-inference según las etiquetas del repositorio. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI en producción, y no existen pesos GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuración de hardware.

## Comparativa con modelos similares

Los datos de los modelos comparativos provienen del conocimiento general del ecosistema de modelos abiertos y no de la información proporcionada en esta búsqueda; conviene verificarlos en sus respectivas fichas antes de citarlos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Pragya Preview (este modelo) | no disponible | no disponible | Apache 2.0 | Hugging Face (.pt y .onnx) | Prototipo de 1 hora en T4, no instruct-tuned, sin benchmarks |
| TinyStories-33M (familia del dataset base) | ~33 M (referencia) | no disponible | no disponible | Hugging Face | Entrenado sobre el mismo dataset; sirve como referencia de la familia TinyStories |
| SmolLM-135M | ~135 M | ~2048 tokens | Apache 2.0 | Hugging Face | Modelo pequeño generalista con entrenamiento a gran escala y evaluación publicada |
| Qwen2.5-0.5B | ~0,5 B | ~32 768 tokens | Apache 2.0 | Hugging Face | Modelo pequeño generalista con soporte multilingüe y de instrucciones |

La diferencia fundamental no está en el tamaño sino en el presupuesto de entrenamiento y en la finalidad: los modelos comparativos son generalistas e instruction-tuned, mientras que Pragya Preview es un prototipo de investigación entrenado sobre un corpus sintético de cuentos infantiles durante una hora. No existe ningún benchmark publicado que permita una comparación cuantitativa directa.

## Limitaciones y advertencias

- Entrenamiento incompleto: el propio autor indica que el modelo no se entrenó por completo, por lo que su comportamiento no representa un estado convergido.
- Sin ajuste por instrucciones: no es instruct-tuned, de modo que no responde a peticiones en formato conversacional y no debe usarse como asistente.
- Capacidad limitada: entrenado en una única sesión de aproximadamente una hora, su profundidad y su capacidad de razonamiento complejo son muy reducidas.
- Alcance restringido: está diseñado para compleción de historias simples con vocabulario básico; fuera de ese dominio la calidad se degrada de forma notable.
- Ausencia de conocimiento factual: no dispone de conocimiento general del mundo, ni de capacidades de programación, ni de razonamiento multi-turno, según la model card.
- Riesgo de alucinación: aunque no maneja hechos, puede generar texto gramaticalmente plausible pero incoherente o con contenido inesperado al salirse del dominio narrativo; requiere revisión humana en cualquier uso con usuarios finales.
- Limitación de idioma: solo se declara inglés; no hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no es posible garantizar el comportamiento en prompts largos.
- Inconsistencia en la model card: el ejemplo de código utiliza el identificador `ArushBuilds/Pragya-Preview`, mientras que el repositorio real es `ArushCodes/Pragya-Preview`; copiar el snippet tal cual puede provocar un error de carga.
- Sin validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones públicas que permitan contrastar su comportamiento real.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución, pero la calidad del modelo hace inviable su uso comercial directo en producción.
- Sin garantías de reproducibilidad: no se especifican hiperparámetros, semilla, número de tokens ni subconjunto exacto del dataset, por lo que replicar el entrenamiento no está asegurado.
- Fechas de publicación y actualización idénticas (17 de septiembre de 2026) y sin revisiones posteriores, lo que sugiere que el repositorio no ha recibido mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArushCodes/Pragya-Preview
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759

Nota: la búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo. Los resultados obtenidos correspondían a contenidos no relacionados (prompts de jailbreak para ChatGPT, un plugin de Zotero, comparativas de asistentes conversacionales en vietnamita y la documentación de modelos de GitHub Copilot), por lo que se han descartado.
