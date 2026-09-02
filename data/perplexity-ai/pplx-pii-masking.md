# perplexity-ai/pplx-pii-masking

## Resumen

`perplexity-ai/pplx-pii-masking` es un modelo de enmascaramiento de informacion de identificacion personal (PII) desarrollado por Perplexity AI, disenado especificamente para datos conversacionales. El modelo combina un encoder bidireccional Qwen3 de aproximadamente 596 millones de parametros con dos cabezales especializados: uno para clasificacion de tokens con etiquetas BIOES sobre 9 categorias de PII, y otro para clasificar la sensibilidad general de la conversacion. Publicado con licencia MIT, el modelo esta pensado para integrarse en pipelines de privacidad donde sea necesario detectar y enmascarar datos personales antes de enviar informacion a servicios en la nube o a modelos externos.

La relevancia de este modelo radica en su origen: Perplexity AI lo libero en septiembre de 2026 como parte de su iniciativa de computacion hibrida para Mac, donde las decisiones de enrutamiento local versus nube dependen de la sensibilidad de los datos. Con una ventana de contexto de 4096 tokens y soporte multilingue, el modelo ofrece una solucion practica para empresas que necesitan proteger datos personales en conversaciones antes de procesarlas con LLMs externos. Su arquitectura de doble cabezal permite no solo identificar los spans exactos de PII, sino tambien evaluar si una conversacion completa es sensible, lo que facilita politicas de enrutamiento automatico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional Qwen3 (backbone `pplx-embed-v1-0.6b`) con dos cabezales: token classification (BIOES) y sensitivity head |
| Parametros totales | 596.090.241 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles, multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone en bf16, cabezales en fp32) |

## Arquitectura y entrenamiento

El modelo utiliza como backbone el encoder `perplexity-ai/pplx-embed-v1-0.6b` con `use_bidirectional_attention=true`, lo que significa que a diferencia de los modelos causales tipicos, cada token puede atender a todo el contexto tanto anterior como posterior. Sobre este encoder se anaden dos cabezales: un cabezal de clasificacion de tokens (1024 a 37 dimensiones) que produce etiquetas BIOES para 9 categorias de PII (`private_person`, `account_number`, `private_url`, `private_date`, `private_address`, `private_email`, `private_phone`, `other_pii`, `secret`), decodificadas con un decodificador Viterbi con restricciones; y un cabezal de sensibilidad (1024 a 1) que clasifica el nivel de sensibilidad de la conversacion completa usando los estados ocultos con mean-pooling.

El checkpoint almacenado en `model.safetensors` contiene los pesos finamente ajustados del backbone (en bf16), ambos cabezales (en fp32) y los escalares de bias para el Viterbi. La inferencia sigue este proceso: tokenizacion sin anadir tokens BOS/EOS, paso por el encoder bidireccional, calculo de logits por token con `h @ W_cls.T + b_cls`, decodificacion con Viterbi restringido, y calculo de sensibilidad con sigmoide sobre la salida del cabezal de sensibilidad. La implementacion del encoder se carga desde el repositorio del backbone mediante `trust_remote_code`.

## Capacidades

- Deteccion y enmascaramiento de 9 categorias de PII: personas, numeros de cuenta, URLs privadas, fechas, direcciones, emails, telefonos, otros PII y secretos.
- Clasificacion de sensibilidad a nivel de conversacion mediante el cabezal de sensibilidad, permitiendo decidir si un dialogo completo debe tratarse como confidencial.
- Soporte de contexto bidireccional: al usar atencion bidireccional, el modelo puede aprovechar informacion tanto anterior como posterior para mejorar la precision en la deteccion de entidades.
- Capacidad multilingue: el modelo esta entrenado para ingles y otros idiomas, aunque no se especifican los idiomas exactos soportados.
- Decodificacion BIOES con Viterbi restringido: garantiza que las secuencias de etiquetas sean coherentes (por ejemplo, una etiqueta I- no puede aparecer sin una B- previa).
- Integracion sencilla: se proporciona un script de ejemplo (`example_usage.py`) que implementa el pipeline completo de inferencia con solo `torch`, `safetensors` y `transformers`.

## Casos de uso

- Enmascaramiento de PII antes de enviar conversaciones a LLMs en la nube: el modelo puede procesar dialogos de atencion al cliente y reemplazar nombres, emails, telefonos y otros datos personales con placeholders como `[PRIVATE_PERSON]` antes de que los datos salgan del entorno local.
- Enrutamiento de datos basado en sensibilidad: usando el cabezal de sensibilidad, una aplicacion puede decidir si una conversacion debe procesarse localmente o enviarse a la nube, como hace Perplexity en su computacion hibrida para Mac.
- Cumplimiento normativo (GDPR, CCPA): el modelo permite auditar y anonimizar registros de conversaciones almacenados en bases de datos o logs, reduciendo el riesgo de exposicion de datos personales.
- Preparacion de datasets para entrenamiento: investigadores pueden usar el modelo para limpiar datasets conversacionales publicos, eliminando o enmascarando PII antes de publicarlos o usarlos para fine-tuning.
- Filtrado de informacion en herramientas de soporte tecnico: integrado en un chatbot o sistema de tickets, el modelo puede detectar y enmascarar credenciales, numeros de cuenta o direcciones en mensajes de usuarios antes de que un agente humano los vea.
- Clasificacion de documentos confidenciales: el cabezal de sensibilidad puede usarse para etiquetar automaticamente conversaciones o documentos como sensibles o no sensibles, facilitando la gestion de accesos en sistemas de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye metricas como precision, recall o F1 sobre conjuntos de datos estandar de deteccion de PII (por ejemplo, CoNLL-2003 o conjuntos especificos de PII).

## Requisitos de hardware

- VRAM estimada para inferencia: con 596 millones de parametros, el modelo en bf16 ocupa aproximadamente 1,2 GB en memoria. Con la sobrecarga de activaciones y el contexto de 4096 tokens, se estima un consumo total de entre 3 y 5 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo. Tarjetas como NVIDIA RTX 3060, RTX 4060, o superiores son suficientes. Tambien es viable en Apple Silicon (M1/M2/M3) dado el contexto de computacion hibrida de Perplexity.
- Compatibilidad con hardware consumer: si, el modelo cabe en GPUs de consumo medio y en Macs con Apple Silicon.
- Opciones de despliegue: el script de ejemplo usa Transformers directamente. Existe una conversion a vLLM (`perplexity-ai/pplx-pii-masking-vllm`) para despliegue en produccion con mayor throughput.
- Latencia y throughput estimados: no se han publicado datos especificos, pero para un modelo de 596M en bf16, la latencia por consulta deberia ser del orden de 50-150 ms en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| `perplexity-ai/pplx-pii-masking` | 596M | 4096 | Encoder bidireccional + BIOES + Viterbi + sensibilidad | MIT |
| Modelos de NER genericos (p.ej. `dslim/bert-base-NER`) | ~110M | 512 | Encoder BERT + etiquetas BIO | MIT |
| Modelos de PII basados en LLM (p.ej. GPT-4 con prompting) | No aplica | Variable | Generativo con instrucciones | Propietaria |

No se dispone de mas alternativas comparables en la informacion proporcionada. La comparativa se limita a lo disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al estar basado en un encoder Qwen3, el modelo puede heredar sesgos presentes en los datos de preentrenamiento de Qwen3, especialmente en cuanto a nombres y formatos de datos de ciertas regiones o culturas.
- Riesgo de alucinacion: aunque es un modelo de clasificacion y no generativo, puede haber errores de clasificacion, especialmente en contextos ambiguos o con formatos de PII poco comunes.
- Limitaciones de contexto: la ventana de 4096 tokens puede ser insuficiente para conversaciones muy largas, requiriendo segmentacion previa.
- Limitaciones de idioma: aunque el modelo es multilingue, la informacion disponible no especifica que idiomas cubre ni la calidad en cada uno. El rendimiento en idiomas no ingleses puede ser inferior.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo depende del backbone `pplx-embed-v1-0.6b`, cuya licencia debe verificarse por separado.
- Advertencia para produccion: el modelo no proporciona probabilidades calibradas para la sensibilidad; el umbral de decision debe ajustarse segun el caso de uso. Ademas, la conversion a vLLM tiene una licencia distinta ("other") que debe revisarse.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/perplexity-ai/pplx-pii-masking
- Backbone (encoder): https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Conversion vLLM: https://huggingface.co/perplexity-ai/pplx-pii-masking-vllm
- Blog sobre computacion hibrida de Perplexity: https://www.explainx.ai/blog/perplexity-mac-hybrid-compute-local-pii-september-2026
- Perplexity CLI (relacionado con ecosistema Perplexity): https://github.com/perplexityai/perplexity-cli/
