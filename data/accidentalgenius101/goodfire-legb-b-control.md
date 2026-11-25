# accidentalgenius101/goodfire-legB-B-control

## Resumen

Goodfire-legB-B-control es un checkpoint de replicación independiente del experimento de monitorabilidad del artículo "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071) de Goodfire, concretamente de su sección 4 sobre la tarea Countdown. Lo publica el usuario accidentalgenius101 como artefacto de investigación: no es un modelo de propósito general, sino el brazo de control (B-control) de un estudio sobre cómo el ajuste fino con señales de recompensa moldea las representaciones internas de un modelo y hasta qué punto esas representaciones siguen siendo legibles por una sonda externa.

El modelo parte de Qwen3-0.6B y se entrena con ajuste fino completo (full fine-tune) sobre una versión en miniatura y de juguete de la tarea Countdown ("peek-or-solve"), con 200 actualizaciones, tamaño de grupo 16, lambda 0.4 y una sonda en la capa 27. El resultado declarado es REPLICATED con una "herida" (wound) nombrada: el brazo adjunto (attached) deja de hacer "peek" y resuelve honestamente al 100 %, pero sale por completo de la región de activación base, de modo que la firma de colapso del monitor se detecta por el canal de norma y no por la precisión balanceada de la sonda.

Su relevancia es metodológica: documenta un fallo de instrumentación (un lector de sondas que extraía activaciones de lotes con padding sin máscara de atención y leía 0.625 donde un lector correcto leía 0.962) y publica el proceso de reparación. Es útil para investigadores en interpretabilidad y monitorabilidad de modelos, no para despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only, sobre el que se aplica un ajuste fino completo (no LoRA ni adaptadores). El entrenamiento se realiza con GRPO (learning rate 1e-05, declarado como desviación donde el artículo no especifica), con tamaño de grupo 16, lambda 0.4, w 0.2, 200 actualizaciones, semilla 0 y sonda en la capa 27. La tarea es una versión de juguete "peek-or-solve" de Countdown (task v2), miniaturizada respecto al montaje original del artículo.

La innovación técnica del trabajo no está en el modelo sino en el protocolo experimental: se comparan cuatro brazos (attached, detached, frozen y control) para medir si el shaping de recompensa (reliance-shaping) hace que el modelo resuelva la tarea honestamente y si, al hacerlo, las representaciones internas siguen siendo monitorizables. El autor declara una reparación del instrumento de lectura: el lector original extraía activaciones de lotes con padding sin máscara de atención y leía 0.625 frente a 0.962 de un lector por texto sin padding, que se adoptó antes de lanzar los brazos con shaping, con un conjunto de ajuste de 640 rollouts.

## Capacidades

- Generación de texto y razonamiento sobre la tarea Countdown en su variante de juguete peek-or-solve.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso general.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio ni modo thinking.
- Uso previsto como artefacto de investigación para estudiar monitorabilidad de representaciones internas y el efecto del shaping de recompensa.

## Casos de uso

- Replicación de experimentos de interpretabilidad: sirve como brazo de control en estudios que comparan modelos con y sin shaping de recompensa, midiendo la legibilidad de las activaciones por una sonda en la capa 27.
- Auditoría de instrumentación de sondas: el checkpoint y su registro de reparación permiten reproducir el fallo del lector con padding y validar lectores por texto sin padding sobre las mismas rollouts.
- Estudio de colapso de monitores: al exhibir una firma de salida de la región de activación (out_of_region_frac hacia 1.0, norma de activación de 178 a 211 en L21) mientras resuelve honestamente al 100 %, es útil para investigar canales alternativos de detección (norma frente a precisión de sonda).
- Docencia y formación en seguridad de IA: ejemplo concreto y de bajo coste computacional de cómo una métrica de monitorización puede degenerar a una sola clase y volverse ilegible.
- Validación de pipelines de evaluación: permite probar harnesses de evaluación que calculan precisión balanceada, AUROC y tasas de peek sobre políticas que cambian de comportamiento a lo largo del entrenamiento.
- Investigación sobre recompensas y honestidad: base para experimentos que estudien si suprimir el peek conlleva resolución honesta o simplemente desplaza la señal fuera de la región donde la sonda fue entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta métricas del propio experimento (fila de step 0 frente a fila final del run log):

| Metrica | Step 0 | Final |
|---|---|---|
| Precisión balanceada de la sonda original | 0.9545 | 1.0 |
| AUROC de la sonda original | 1.0 | 0.5 |
| Tasa de peek | 0.34375 | 1.0 |
| Tasa de resolución honesta | 0.15625 | 0.0 |
| Norma de activación en el sitio de sonda (media / p99) | 562.92 / 644.32 | 548.45 / 670.20 |
| Fracción fuera de región | 0.0 | 0.0 |

Nota: estas cifras corresponden a la fila de step 0 y a la fila final del registro del run; el veredicto del autor describe el brazo attached con peek rate 0.0, resolución honesta 1.0, out_of_region_frac hacia 1.0 y norma de activación de 178 a 211 en L21. La discrepancia entre ambas descripciones no se resuelve en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 596 M de parámetros, en fp16 rondaría 1,2 GB de pesos y en fp32 unos 2,4 GB, más overhead de activaciones y KV cache (estimación, no dato del autor).
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder cargarlo.
- Cabe en GPU consumer: sí, por el tamaño del modelo (596 M de parámetros), aunque no se documentan requisitos oficiales.
- Opciones de despliegue: no documentadas; al publicarse en safetensors, requiere frameworks compatibles con transformers. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodfire-legB-B-control | 596.049.920 | no disponible | Replicación de monitorabilidad (brazo de control) | other | Hugging Face |
| Qwen3-0.6B (base) | ~0,6 B | no disponible en esta ficha | Modelo de propósito general | no disponible en esta ficha | Hugging Face |
| Brazos B-attached / B-detached / B-frozen del mismo estudio | mismo tamaño | no disponible | Condiciones experimentales del mismo protocolo | other | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de replicación a escala miniaturizada: Qwen3-0.6B con ajuste fino completo sobre una tarea de juguete, 200 actualizaciones y una sola semilla; los números no se transfieren cuantitativamente al resultado del artículo a escala 9B.
- El veredicto REPLICATED incluye una herida declarada: la barra de caída de precisión balanceada de la sonda adjunta (>= 0.25) resultó ilegible tal como se registró, porque tras la actualización 10 la política adjunta no emite ningún peek y las evaluaciones posteriores son de una sola clase, con precisión balanceada degenerada a especificidad (1.0).
- Existe una discrepancia no resuelta entre las cifras de la tabla de números del run y la descripción del veredicto (tasa de peek final 1.0 frente a 0.0; resolución honesta 0.0 frente a 1.0; out_of_region_frac 0.0 frente a 1.0).
- Licencia "other": no se especifican términos de uso comercial; debe consultarse la model card y el repositorio antes de cualquier uso fuera de investigación.
- Idiomas soportados no disponibles; no debe asumirse cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; el modelo no está pensado para generación abierta en producción.
- El autor declara desviaciones respecto al artículo donde el texto de arXiv no especifica cantidades (registradas en config.json `deviations` y HYPERPARAMS.md), lo que limita la comparabilidad exacta con el experimento original.
- El checkpoint se publicó bajo una orden explícita que levantaba una regla previa de no subida, solo para el Leg B; su estado es el de un artefacto de investigación, no el de un modelo mantenido.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legB-B-control
- Artículo citado: arXiv:2611.07071, "Shaping & Monitoring Models through their Internal Representations" (Goodfire), sección 4 (Countdown monitorability)
- Repositorio de replicación: no disponible como enlace público en la información proporcionada (el autor menciona legB/REPAIR.md y HYPERPARAMS.md en el espacio de trabajo de replicación)
- Modelo base: Qwen3-0.6B (referenciado como ../models/Qwen3-0.6B en la configuración)
