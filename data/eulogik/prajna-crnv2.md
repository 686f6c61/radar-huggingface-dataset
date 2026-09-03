# eulogik/Prajna-CRNv2

## Resumen

Prajna-CRNv2 es un módulo de corrección de errores de 34 millones de parámetros (0,73 % del tamaño de la base) desarrollado por eulogik, que se acopla sobre un modelo base **Gemma-4-E2B totalmente congelado**. Su función es ajustar los logits del modelo base únicamente donde detecta errores, mediante una pequeña red de proyección con puerta, sin actualizar ningún peso del modelo original. El objetivo es resolver el problema del trade-off corrección-capacidad: los fine-tunings tradicionales corrigen errores pero provocan olvido catastrófico de capacidades ya adquiridas.

El modelo se entrena en dos etapas (SFT con preservación de KL y DPO) sobre un conjunto de 83 400 pares de corrección de errores, y se ha entrenado de extremo a extremo en un Mac Mini M4 con 16 GB de RAM en unos 25 minutos. En las pruebas declaradas por el autor, consigue corregir el 53,3 % de los errores en un examen CEHRI mientras mantiene exactamente las mismas puntuaciones que la base congelada en MMLU, BoolQ y una prueba adicional de "car-wash", lo que representa una pérdida de capacidad de 0 puntos porcentuales. Es relevante porque ofrece una vía para mejorar modelos en producción sin arriesgar su rendimiento general, especialmente en entornos con recursos limitados como Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulo de corrección de logits (proyección down/up con activación GELU y puerta multiplicativa) sobre base congelada Gemma-4-E2B |
| Parametros totales | 34M (módulo de corrección) + base congelada Gemma-4-E2B (no especificada) |
| Parametros activos | No aplica (no es un modelo MoE; todos los parámetros del módulo están activos) |
| Longitud de contexto | no disponible (depende de la base Gemma-4-E2B, no especificada) |
| Tipos de cuantizacion | no disponible (los pesos del módulo se cargan en float32/float16 según el script; la base se carga en float16) |
| Idiomas soportados | inglés |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | PyTorch (.pt) — archivo `crn_v2_dpo.pt` de 130 MB |

## Arquitectura y entrenamiento

El módulo implementa una corrección a nivel de logits mediante la fórmula `corrected_logits = base_logits + gate * up(gelu(down(hidden)))`. Toma las representaciones ocultas de la base congelada, las proyecta a un espacio reducido, aplica GELU, las expande y las multiplica por una puerta aprendida que decide cuánto corregir cada logit. La base Gemma-4-E2B permanece completamente congelada durante todo el entrenamiento, sin recibir ni un solo gradiente.

El entrenamiento se realiza en dos etapas. La primera es un fine-tuning supervisado (SFT) de 2 000 pasos con pérdida de entropía cruzada anclada (pesos 4× para el ancla y 5× para el token EOS) más una pérdida de preservación KL con λ=0,1, sobre 83 400 pares de corrección de errores. La segunda es un DPO sin referencia de 500 pasos con β=0,1 y tasa de aprendizaje 5e-6, que prefiere la respuesta correcta frente a la respuesta errónea de la base congelada. Se usa AdamW con LR 3e-4 y decaimiento coseno en la primera etapa. El entrenamiento se realizó en Apple M4 con 16 GB y MPS, completándose en unos 25 minutos.

## Capacidades

- Corrección de errores en los logits de un modelo base congelado, mejorando la precisión en tareas de respuesta a preguntas sin degradar el rendimiento general.
- Preservación de capacidades: las pruebas del autor muestran una pérdida de capacidad de 0 puntos porcentuales en MMLU, BoolQ y una prueba de "car-wash" frente a la base congelada.
- Generación de texto: el módulo se integra en el pipeline de generación del modelo base, corrigiendo las respuestas generadas.
- Corrección de respuestas dadas: permite introducir un borrador de respuesta (draft) y obtener una versión corregida, como se muestra en el ejemplo `model.correct("What is 2+2?", "5")`.
- Compatibilidad con Apple Silicon y CPU: el script de inferencia soporta MPS y CPU, lo que permite ejecutarse en Macs sin GPU dedicada.
- Entrenamiento eficiente en hardware de consumo: el entrenamiento completo se realizó en un Mac Mini M4 con 16 GB, lo que demuestra viabilidad en equipos domésticos.
- No requiere actualizar la base: al mantener el modelo base congelado, se evita el riesgo de olvido catastrófico asociado al fine-tuning convencional.

## Casos de uso

- Corrección selectiva de errores en modelos de producción congelados: si una organización ha desplegado un Gemma-4-E2B y detecta errores sistemáticos en dominios concretos (por ejemplo, preguntas de exámenes), puede aplicar Prajna-CRNv2 para corregir parte de esos fallos sin necesidad de reentrenar la base, manteniendo intactas las capacidades ya validadas.
- Mejora de precisión en dominios especializados sin riesgo de regresión: en entornos donde el coste de una degradación de capacidades es alto (por ejemplo, razonamiento o conocimiento general), este módulo ofrece una corrección parcial pero segura, como demuestra la comparación con LoRA que pierde 30-75 puntos en MMLU y car-wash.
- Despliegue en dispositivos Apple Silicon: al ser un módulo pequeño (34M) y entrenado con MPS, puede ejecutarse en Macs con 16 GB de RAM, siendo adecuado para aplicaciones de IA en el dispositivo (on-device) en ecosistemas Apple.
- Corrección de respuestas generadas por el modelo base en pipelines de QA: el método `correct(draft)` permite integrar una etapa de post-procesado que revisa y corrige respuestas antes de entregarlas al usuario final, útil en asistentes o sistemas de preguntas y respuestas.
- Experimentación académica sobre el trade-off corrección-capacidad: el código y los pesos están disponibles en GitHub, lo que permite a investigadores reproducir los experimentos y explorar variantes (por ejemplo, inyección en capas profundas) sobre el problema del olvido catastrófico.
- Prototipado rápido de corrección de errores en hardware de bajo coste: dado que el entrenamiento completo tarda ~25 minutos en un Mac Mini M4, es viable iterar sobre diferentes conjuntos de pares de corrección sin necesidad de clústeres de GPU, acelerando el desarrollo de soluciones específicas por dominio.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card y el model-index. No han sido verificados de forma independiente. Los valores de MMLU y BoolQ corresponden a muestras de 200 preguntas, no a los conjuntos completos.

| Tarea | Prajna-CRNv2 | Base congelada | LoRA baseline (6,6M) |
|---|---|---|---|
| CEHRI Original (60 preguntas) | 53,3 % | 11,7 % | 83,3 % |
| CEHRI Reworded (120 preguntas) | 43,3 % | no disponible | 77,5 % |
| MMLU (muestra N=200) | 62,5 % | 62,5 % | 32,0 % |
| BoolQ (muestra N=200) | 72,0 % | 72,0 % | 55,0 % |
| Car-wash (8 preguntas) | 75,0 % | 75,0 % | 0 % |

El autor también reporta un barrido de inyección en capas profundas con una variante de 1,6M de parámetros: la inyección en la capa 4 alcanza 30,0 % en CEHRI original, la capa 7 alcanza 50,0 % con SFT solo y 50,0 % con SFT+DPO (aunque en este último caso la capacidad se destruye, con MMLU cayendo al 13 %). El autor concluye que el techo para métodos de base congelada es aproximadamente 53 %, y que la corrección a nivel de logits es superior a la inyección en capas ocultas.

## Requisitos de hardware

- Entrenamiento: realizado en Apple M4 con 16 GB de RAM y MPS, completado en ~25 minutos. No requiere GPU dedicada.
- Inferencia: requiere ~10 GB de RAM para cargar Gemma-4-E2B en float16 junto con el módulo de corrección. El script soporta MPS (Apple Silicon) y CPU.
- GPU recomendadas: no se especifican GPUs NVIDIA; el modelo está pensado para entornos Apple Silicon o CPU, aunque al ser un módulo PyTorch estándar debería funcionar en cualquier GPU compatible con PyTorch.
- Opciones de despliegue: el repositorio proporciona scripts de inferencia (`inference.py`) y un demo interactivo. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparativa más relevante es frente a la base congelada y a un fine-tuning LoRA sobre la misma base, ya que el modelo no es un LLM independiente sino un módulo complementario.

| Modelo | Parámetros | Contexto | CEHRI Original | MMLU (N=200) | BoolQ (N=200) | Licencia |
|---|---|---|---|---|---|---|
| Prajna-CRNv2 + Gemma-4-E2B (congelada) | 34M (módulo) + base | no disponible | 53,3 % | 62,5 % | 72,0 % | Gemma |
| Gemma-4-E2B (base congelada) | no especificado | no disponible | 11,7 % | 62,5 % | 72,0 % | Gemma |
| LoRA baseline sobre Gemma-4-E2B | 6,6M | no disponible | 83,3 % | 32,0 % | 55,0 % | Gemma |

La comparativa muestra el trade-off: LoRA corrige más errores (83,3 %) pero destruye capacidades (MMLU cae 30,5 puntos, car-wash cae 75 puntos), mientras que Prajna-CRNv2 corrige menos pero mantiene exactamente el rendimiento de la base. No se dispone de comparaciones con otros modelos de corrección de errores similares en la información proporcionada.

## Limitaciones y advertencias

- Corrección parcial: el modelo solo corrige el 53,3 % de los errores en el examen CEHRI original, frente al 83,3 % de LoRA. No es una solución completa para eliminar errores.
- Techo de rendimiento: el autor indica que ~53 % es el máximo alcanzable con métodos de base congelada según sus experimentos; no se puede superar sin actualizar la base.
- Riesgo de degradación en variantes experimentales: la inyección en capas profundas combinada con DPO destruyó completamente la capacidad (MMLU 13 %). Solo la corrección a nivel de logits con SFT+DPO preserva las capacidades.
- Idioma: solo soporta inglés; no hay evidencia de funcionamiento en otros idiomas.
- Contexto: no se especifica la longitud de contexto soportada; depende de la base Gemma-4-E2B, cuyas especificaciones no se proporcionan.
- Licencia Gemma: la licencia de Google para modelos Gemma impone restricciones de uso comercial y términos específicos que deben revisarse antes de su despliegue en producción.
- Dependencia de la base: el módulo no es autónomo; requiere el modelo base Gemma-4-E2B cargado en memoria, lo que implica un coste de recursos adicional.
- Resultados no verificados: los benchmarks declarados no han sido verificados de forma independiente y utilizan muestras pequeñas (N=200 para MMLU y BoolQ, 8 para car-wash), por lo que deben interpretarse con cautela.
- Sin soporte para tareas multimodales o tool calling: el modelo se limita a texto y no presenta capacidades de visión, audio o llamada a funciones.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/eulogik/Prajna-CRNv2
- Repositorio de código y paper (GitHub): https://github.com/eulogik/prajna
- Imágenes comparativas (assets del repositorio): https://raw.githubusercontent.com/eulogik/prajna/main/assets/crnv2-correction.png y https://raw.githubusercontent.com/eulogik/prajna/main/assets/crnv2-capability.png
