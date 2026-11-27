# qilun-ai/job-department-classifier

## Resumen

Job Department Classifier (Agent-Hire) es un modelo de clasificación de texto desarrollado por qilun-ai que asigna una oferta de empleo a una de 38 subcategorías departamentales agrupadas en 14 departamentos (por ejemplo, Technology → Software Development, o Sales and Marketing → Sales). Se trata de un fine-tuning de mmBERT-base con masked mean pooling y una cabeza lineal, distribuido tanto en formato ONNX cuantizado a 4 bits como en PyTorch a precisión completa.

El modelo resuelve un problema concreto de recuperación y etiquetado en plataformas de empleo: clasificar ofertas multilingües de forma consistente para permitir filtrado por departamento. Su relevancia radica en que ofrece una precisión de subdepartamento del 88,3% y de departamento del 92,7% (validación cruzada de 5 folds sobre un conjunto interno) ejecutándose en CPU a unos 0,3 segundos por oferta, sin necesidad de GPU ni de API externa.

La arquitectura subyacente es un encoder transformer (mmBERT-base) con pooling de media enmascarada y una cabeza de clasificación lineal sobre 38 clases. El contexto de entrada está limitado a 320 tokens y el modelo está pensado para producción de bajo coste: el artefacto ONNX de 184 MB mantiene un 98,8% de concordancia con el modelo a precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con masked mean pooling y cabeza lineal |
| Parametros totales | no disponible (modelo base mmBERT-base; el repo pesa 1,5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 320 tokens (max_len definido en labels.json) |
| Tipos de cuantizacion | ONNX weight-only 4-bit (MatMulNBits, block 32) + embedding Gather 4-bit; PyTorch a precisión completa |
| Idiomas soportados | multilingüe |
| Licencia | agent-hire-model-license (license: other) |
| Formato de pesos | safetensors (encoder y cabeza), ONNX (model_w4.onnx), tokenizer.json, labels.json |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-base, un encoder transformer multilingüe, al que se añade masked mean pooling y una cabeza lineal que proyecta a 38 subdepartamentos. La entrada es un único string construido concatenando campos de la oferta con el separador `" <eos> "`: título (máx. 160 caracteres), etiqueta de departamento de la empresa (máx. 80), nombre de la empresa (máx. 60) y extracto de la descripción (máx. 700), con limpieza previa de HTML, `&nbsp;` y caracteres markdown. El total se trunca a 320 tokens.

El entrenamiento se realizó mediante fine-tuning supervisado sobre un conjunto de referencia interno de ofertas de empleo, con etiquetas de 38 subdepartamentos agrupadas en 14 departamentos. La model card documenta cuatro versiones de datos (v0.1 a v0.4) y reporta métricas de validación cruzada de 5 folds, donde cada oferta es predicha por un modelo que nunca la vio. La versión v0.4 mejora notablemente las ofertas de plataformas empresariales (SAP, Salesforce, ServiceNow, ERP): 89,9% frente a 85,7% de la versión anterior. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a un clasificador de este tipo).

## Capacidades

- Clasificación de ofertas de empleo en 38 subdepartamentos y 14 departamentos.
- Procesamiento multilingüe de texto de ofertas.
- Inferencia en CPU con el artefacto ONNX 4-bit (unos 0,3 s por oferta en un portátil).
- Distinción fina dentro de Technology: SWE (desarrollo, cloud, seguridad, redes, DevOps/SRE, sysadmin), IT (soporte, service desk, ITSM, consultoría y administración de plataformas) y roles de plataformas empresariales según si implican codificación (SWE) o configuración/consultoría (IT).
- Limpieza de entrada integrada en el pipeline: eliminación de HTML, entidades y markdown antes de la tokenización.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Etiquetado automático de ofertas en portales de empleo: cada oferta se clasifica en uno de los 38 subdepartamentos para alimentar filtros de búsqueda y facetas, con un coste de CPU de ~0,3 s por oferta.
- Filtrado por departamento en buscadores de empleo: el modelo permite construir índices por departamento y restringir consultas, tal como hace Agent-Hire en producción.
- Normalización de taxonomías de empleo: mapear etiquetas heterogéneas de distintas fuentes (incluidas etiquetas JSON como `{"en_name": ...}`) a una taxonomía unificada de 14 departamentos y 38 subdepartamentos.
- Enriquecimiento de datasets de ofertas para analítica de mercado laboral: clasificar grandes volúmenes de ofertas multilingües sin GPU para estudiar demanda por departamento.
- Deduplicación y agrupación de ofertas: usar la etiqueta departamental como señal adicional en pipelines de agregación y matching de vacantes.
- Moderación y control de calidad de publicaciones: detectar ofertas mal categorizadas por el publicador comparando la etiqueta declarada con la predicción del modelo.
- Despliegue en entornos sin GPU: servicios de clasificación en contenedores CPU o funciones serverless gracias al ONNX de 184 MB y a la baja latencia.

## Benchmarks y rendimiento

Resultados de validación cruzada de 5 folds sobre el conjunto de referencia interno (cada oferta predicha por un modelo que no la vio):

| Modelo | Datos de entrenamiento | Subdepartamento | Departamento | Ofertas de Technology |
|---|---|---|---|---|
| mmBERT-base (este modelo) | v0.4 | 88,3% | 92,7% | 86,9% |
| mmBERT-base (release anterior) | v0.3 | 88,3% | 92,8% | 86,6% |
| mmBERT-base | v0.2 | 87,7% | 92,4% | 84,7% |
| mmBERT-base | v0.1 | 84,2% | 91,7% | 71,3% |

Comparación con modelos sin entrenamiento sobre los datos del autor:

| Baseline | Subdepartamento | Departamento | Technology |
|---|---|---|---|
| mmBERT-base sin fine-tuning (sin clasificador, azar) | 2,6% | 7,1% | 25,0% |
| Predecir siempre la clase más común | 14,5% | 23,5% | 48,8% |

Comparación con modelos de decisión zero-shot sobre los mismos trabajos del test v0.1 (precisión de departamento entre paréntesis):

| Conjunto | mmBERT-base fine-tuned (v0.1) | Bespoke-Nimble-9B-v3 (9B, Q8_0) | Gemini decision-1 (API) | GLiDE-27B (27B, Q4_K_S) | O*NET title matching |
|---|---|---|---|---|---|
| Conjunto balanceado por clase | **86,7%** (91,7) | 85,2% (89,5) | – | – | 59,9% |
| Subset A | **86,3%** (91,1) | 83,3% | 85,6% (90,0) | – | 57,2% |
| Subset B | 86,2% (90,0) | 83,4% | **86,9%** (90,8) | 85,4% (89,8) | 57,8% |

El modelo fine-tuned supera a Nimble de forma significativa (p = 0,005) y empata con Gemini decision-1 (p = 0,46) y GLiDE-27B (p = 0,70) dentro del ruido, sin GPU ni API en inferencia.

Otros modelos comparados sobre los mismos datos v0.4 y los mismos folds:

| Modelo | Subdepartamento | Este modelo en los mismos trabajos |
|---|---|---|
| LiquidAI d1-omni-600M (encoder, fine-tuned, 3 folds) | 88,5% | 88,3% |
| Laya (backbone ModernBERT-large, fine-tuned, 1 fold) | 88,2% | 88,3% |
| Laya multilingual (backbone mmBERT-base, fine-tuned, 1 fold) | 86,3% | 88,3% |

Ninguna diferencia es estadísticamente significativa salvo Laya multilingual, que es peor. Los encoders mayores cuestan entre 1,6 y 3 veces más de ejecutar, por lo que se mantuvo mmBERT-base.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el ONNX 4-bit (184 MB) está pensado para CPU. El repo completo ocupa 1,5 GB.
- GPU recomendadas: no aplica para inferencia; cualquier GPU serviría para el modelo PyTorch a precisión completa, pero no es necesario.
- Cabe en cualquier portátil: ~0,3 s por oferta en CPU de portátil según el autor.
- Opciones de despliegue: ONNX Runtime con `model_w4.onnx`; PyTorch con `model.safetensors` y `head.safetensors` para fine-tuning o re-exportación. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de clasificación).
- Latencia y throughput: ~0,3 s por oferta en CPU de portátil; el throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Subdepartamento (v0.4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Job Department Classifier (este) | Encoder clasificador fine-tuned | no disponible (base mmBERT-base) | 320 tokens | 88,3% | agent-hire-model-license | Hugging Face, ONNX + safetensors |
| LiquidAI d1-omni-600M fine-tuned | Encoder clasificador | 600M | no disponible | 88,5% | no disponible | Hugging Face |
| Laya (ModernBERT-large) fine-tuned | Encoder clasificador | large (no disponible) | no disponible | 88,2% | no disponible | Hugging Face |
| Laya multilingual (mmBERT-base) fine-tuned | Encoder clasificador | base (no disponible) | no disponible | 86,3% | no disponible | Hugging Face |
| Bespoke-Nimble-9B-v3 | Modelo generativo zero-shot | 9B | no disponible | 85,2% (conjunto balanceado) | no disponible | GGUF Q8_0 |
| GLiDE-27B | Modelo generativo zero-shot | 27B | no disponible | 85,4% (Subset B) | no disponible | GGUF Q4_K_S |

## Limitaciones y advertencias

- Licencia `agent-hire-model-license` (license: other): es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial; no es una licencia estándar de código abierto.
- Las métricas proceden de un conjunto de referencia interno del autor, no de un benchmark público; la generalización a otras fuentes de ofertas no está verificada.
- Ventana de entrada de 320 tokens con truncado agresivo de campos (descripción limitada a 700 caracteres): ofertas con información relevante fuera de esos límites pueden clasificarse peor.
- Riesgo de error en fronteras ambiguas entre subdepartamentos, especialmente en Technology (SWE frente a IT) y en roles de plataformas empresariales.
- El modelo es multilingüe, pero no se detalla el rendimiento por idioma; el conjunto de evaluación podría estar sesgado hacia ciertos mercados.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso; cualquier expectativa en ese sentido es incorrecta.
- El ONNX 4-bit concuerda con el modelo a precisión completa en el 98,8% de las ofertas, por lo que existe un ~1,2% de discrepancias por cuantización.
- Sesgos demográficos o geográficos no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qilun-ai/job-department-classifier
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio Agent-Hire: https://github.com/noobed-max/GalaxyHire
- LiquidAI d1-omni-600M: https://huggingface.co/LiquidAI/d1-omni-600M
- Laya: https://huggingface.co/convaiinnovations/laya
