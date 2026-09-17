# heman10x/rlcd-modernbert-151m

## Resumen

Verdict-Open-Jev, publicado en HuggingFace como heman10x/rlcd-modernbert-151m, es un modelo de decisión ligero y no autorregresivo construido sobre el backbone ModernBERT-base (151.378.176 parámetros). No genera texto libre: su función es asignar una etiqueta o decisión a una entrada a partir de un conjunto acotado de candidatos, con probabilidades calibradas y una opción explícita de abstención. Deriva del modelo knowledgator/gliclass-modern-base-v2.0, por lo que hereda el esquema de clasificación GLiClass sobre un encoder bidireccional.

La propuesta diferencial es el despliegue en el cliente. El modelo se distribuye en safetensors y ONNX y está pensado para ejecutarse en el navegador mediante WebGPU o WASM, además de en local con PyTorch u ONNX Runtime. Eso permite tomar decisiones sin enviar los datos a un servidor, algo relevante para aplicaciones con requisitos de privacidad o latencia estrictos.

El repositorio incorpora mecanismos de calibración de probabilidades (Brier score durante el entrenamiento y temperature scaling post-hoc con L-BFGS) y limita el espacio de decisión a 24 opciones sustantivas más una opción de abstención. No hay resultados de benchmarks publicados ni datos de entrenamiento detallados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional ModernBERT-base con cabeza de clasificación GLiClass; modelo de decisión no autorregresivo |
| Parámetros totales | 151.378.176 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible para este fine-tune; el backbone ModernBERT-base admite hasta 8.192 tokens en su versión original |
| Tipos de cuantización | No disponible; el repositorio publica pesos en safetensors y exportación ONNX, sin detallar esquemas de cuantización concretos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

Otros datos: modelo base knowledgator/gliclass-modern-base-v2.0; tamaño del repositorio 2,4 GB; creado el 17 de septiembre de 2026 y actualizado el mismo día; cero descargas y cero likes en el momento de la consulta; la etiqueta `rlcd` figura en el repositorio sin documentación asociada.

## Arquitectura y entrenamiento

El modelo parte del backbone ModernBERT-base, un transformer encoder bidireccional de 151M de parámetros, sobre el que se monta una cabeza de clasificación GLiClass. Al no ser autorregresivo, no dispone de decodificación token a token: recibe una entrada y un conjunto de etiquetas candidatas y devuelve una distribución de probabilidad sobre ellas. La función de pérdida combina entropía cruzada con Brier score, lo que introduce un término de calibración directamente en el objetivo de entrenamiento. Después del entrenamiento se aplica un ajuste de temperatura post-hoc optimizado con L-BFGS para mejorar la correspondencia entre la confianza declarada y la precisión real.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras. La etiqueta `rlcd` sugiere algún procedimiento de entrenamiento o refinamiento con ese acrónimo, pero el repositorio no documenta su significado ni los detalles del proceso. Tampoco se detalla el mecanismo de exportación a ONNX ni qué variantes de precisión se incluyen en el repositorio de 2,4 GB.

## Capacidades

- Clasificación y decisión no autorregresiva sobre conjuntos acotados de hasta 24 opciones sustantivas, más una opción explícita de abstención.
- Salida probabilística calibrada, con temperature scaling aplicado post-hoc mediante L-BFGS.
- Abstención explícita: el modelo puede declinar emitir una decisión, lo que facilita el enrutado a revisión humana.
- Inferencia en el cliente en navegador mediante WebGPU y WASM.
- Inferencia local con PyTorch y ONNX Runtime.
- Exportación a ONNX, apta para entornos con restricciones de dependencias.
- Generación de texto libre: no soportada (modelo no autorregresivo).
- Tool calling / function calling: no documentado en la información disponible.
- Razonamiento multi-paso y uso como agente: no documentado; el modelo actúa como componente de decisión puntual.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte en el navegador: el modelo clasifica la consulta del usuario entre categorías predefinidas sin que el texto salga del dispositivo, útil en sectores con datos personales sensibles.
- Moderación de contenido con derivación a revisión: la opción de abstención permite enviar a un moderador humano los casos en los que la confianza calibrada es baja, reduciendo falsos positivos en automatización.
- Clasificación de intención en asistentes web: al ejecutarse con WebGPU/WASM, permite construir asistentes que deciden la intención del usuario en el propio cliente y solo contactan al backend para la acción final.
- Triaje de formularios y encuestas: asignación automática de categoría o prioridad a respuestas abiertas, con umbral de confianza calibrado para separar los casos dudosos.
- Preanotación en pipelines de etiquetado: uso como etiquetador zero-shot o few-shot para generar propuestas iniciales que después revisa un anotador humano, aprovechando la salida probabilística.
- Componente de decisión en sistemas de agentes: actuar como guardarraíl o selector que decide si una acción propuesta se ejecuta, se descarta o se escala, dado su coste computacional reducido.
- Decisión en dispositivos con recursos limitados: al tratarse de un modelo de 151M, puede integrarse en aplicaciones de escritorio o móviles empaquetadas con ONNX Runtime sin necesidad de GPU dedicada.
- Filtrado previo en pipelines de datos: descartar o clasificar grandes volúmenes de registros antes de pasarlos a un modelo generativo mayor, reduciendo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona la existencia de una "failure gallery" y de informes de auditoría completos, pero no se incluyen métricas numéricas en los datos proporcionados.

## Requisitos de hardware

- Peso de los parámetros en FP32: aproximadamente 605 MB (151,4M × 4 bytes), solo pesos.
- Peso estimado en FP16/BF16: aproximadamente 303 MB.
- Peso estimado en INT8: aproximadamente 151 MB.
- Peso estimado en INT4: aproximadamente 76 MB.
- Tamaño del repositorio en HuggingFace: 2,4 GB, previsiblemente por incluir varias exportaciones y formatos.
- GPU: no requiere GPU dedicada. Cabe sin problema en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia en lote pequeño.
- Ejecución en navegador: viable mediante WebGPU o WASM, sin backend adicional.
- Opciones de despliegue: PyTorch (Transformers), ONNX Runtime, Transformers.js con WebGPU/WASM. vLLM, TGI y llama.cpp no aplican, ya que no es un modelo generativo autorregresivo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heman10x/rlcd-modernbert-151m | 151,4M | No disponible (backbone ModernBERT hasta 8.192) | Clasificador/decisor no autorregresivo (GLiClass + ModernBERT) | Apache 2.0 | HuggingFace |
| knowledgator/gliclass-modern-base-v2.0 | No disponible en la información | No disponible | Clasificador GLiClass (modelo base del anterior) | No disponible en la información | HuggingFace |
| answerdotai/ModernBERT-base | ~149M | 8.192 tokens | Encoder bidireccional sin cabeza de tarea | Apache 2.0 | HuggingFace |
| facebook/bart-large-mnli | ~407M | 1.024 tokens | Encoder-decoder para clasificación zero-shot vía NLI | MIT | HuggingFace |

Nota: los datos de los modelos comparables corresponden a sus versiones públicas conocidas y no proceden de la información proporcionada en esta consulta; conviene verificarlos en sus respectivas fichas antes de tomar decisiones de producción. La comparación directa de rendimiento no es posible porque el modelo analizado no publica benchmarks.

## Limitaciones y advertencias

- Espacio de decisión acotado: admite como máximo 24 opciones sustantivas más una opción de abstención. No es adecuado para clasificación abierta ni para espacios de etiquetas grandes.
- No es un modelo generativo: no produce texto libre, resúmenes ni respuestas conversacionales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta justificar su elección en producción.
- Sin datos de entrenamiento: se desconoce el corpus, el número de tokens, la composición lingüística y si hubo fases de alineación.
- Idiomas no declarados: no se puede asumir soporte multilingüe; probablemente esté optimizado para inglés, pero no se confirma.
- Sesgos: no hay información sobre evaluaciones de sesgo o equidad.
- Riesgo de alucinación: al ser un clasificador, el riesgo se manifiesta como asignación errónea con alta confianza, especialmente en dominios alejados de los datos de entrenamiento.
- Calibración dependiente del dominio: el temperature scaling se ajusta sobre una distribución concreta; fuera de ella, las probabilidades pueden dejar de ser fiables.
- Validación comunitaria nula: cero descargas y cero likes en el momento de la consulta, sin historial de uso verificable.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se documenten los cambios. No se especifican restricciones adicionales de uso aceptable en la información disponible.
- Fecha de creación futura respecto a la fecha habitual de consulta, dato a verificar directamente en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heman10x/rlcd-modernbert-151m
- Modelo base: https://huggingface.co/knowledgator/gliclass-modern-base-v2.0
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: los enlaces obtenidos correspondían a un sitio de servicios de seguros de salud sin relación con el modelo. No se han localizado papers, blogs, repositorios ni demos asociados en la información disponible.
