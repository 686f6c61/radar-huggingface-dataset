# huggingtime12/Qwen3-1.7B-noKL-PhoMT-GRPO-BLEU

## Resumen

Qwen3-1.7B-noKL-PhoMT-GRPO-BLEU es un adaptador LoRA publicado por el usuario huggingtime12 sobre el modelo fusionado huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged, que a su vez deriva de la familia Qwen3 en su variante de 1.700 millones de parametros. El nombre del repositorio indica una etapa de ajuste fino con GRPO (Group Relative Policy Optimization) sin termino KL ("noKL"), orientada a una metrica de traduccion automatica BLEU y aparentemente vinculada a PhoMT, un corpus publico de traduccion chino-vietnamita. Se trata, por tanto, de un experimento academico o de investigacion mas que de un modelo listo para produccion.

El modelo resuelve un problema muy acotado: explorar si el ajuste fino por refuerzo con recompensas basadas en BLEU y sin penalizacion KL puede mejorar la calidad de traduccion de un modelo pequeno ya sometido a SFT. La eleccion de GRPO sin KL es una decision tecnica relevante, porque elimina la referencia al modelo base durante el entrenamiento y puede provocar deriva respecto a la distribucion original.

La relevancia actual es limitada: cero descargas, cero likes, model card practicamente vacia y ausencia de datos sobre licencia, idiomas, benchmarks o hiperparametros. Su interes es principalmente metodologico para quienes investigan RLHF ligero en modelos de menos de 2.000 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B), adaptador LoRA sobre modelo fusionado |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; admite cuantizacion del modelo fusionado, pero no se documenta) |
| Idiomas soportados | No disponible (el nombre del repositorio sugiere chino-vietnamita por PhoMT, sin confirmacion) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repo ocupa 0,3 GB |
| Libreria | PEFT 0.18.0, transformers, TRL |
| Metodo de ajuste | GRPO sin termino KL, recompensa basada en BLEU |
| Modelo base | huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only denso con atencion causal estandar y 1.700 millones de parametros. Sobre ese modelo, ya fusionado tras una etapa de SFT (supervised fine-tuning), se aplica un adaptador LoRA entrenado con GRPO, un algoritmo de optimizacion por politica proximal que estima ventajas relativas dentro de grupos de respuestas muestreadas, evitando la necesidad de un modelo critico separado.

El detalle diferencial es la ausencia de termino KL ("noKL"): no se penaliza la divergencia respecto al modelo de referencia, lo que simplifica el entrenamiento pero incrementa el riesgo de colapso de diversidad y de sobreajuste a la recompensa. La recompensa se define mediante BLEU, una metrica de solapamiento de n-gramas con correlacion limitada con la calidad humana en traduccion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, hiperparametros (learning rate, rango LoRA, alpha, batch size) ni la infraestructura utilizada. El tag arxiv:1910.09700 corresponde unicamente a la referencia del calculador de impacto climatico (Lacoste et al., 2019) que aparece en la plantilla de la model card, no a un paper del modelo.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Traduccion automatica, presumiblemente chino-vietnamita segun el corpus PhoMT referenciado en el nombre, sin confirmacion documental.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1.700 millones de parametros.
- Generacion de codigo y matematicas a nivel basico, segun las capacidades del Qwen3 base.
- Soporte de tool calling y function calling: no documentado para este adaptador concreto.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking explicito: no documentado.
- Vision y audio: no soportados.
- Capacidades multilingues: no documentadas; el modelo base Qwen3 es multilingue, pero el ajuste fino puede haber reducido ese soporte.

## Casos de uso

- Investigacion en RLHF ligero: el adaptador sirve como punto de partida para reproducir o comparar variantes de GRPO con y sin termino KL en modelos por debajo de 2.000 millones de parametros, midiendo el efecto de la deriva respecto al modelo de referencia.
- Experimentos de recompensa basada en metricas: util para estudiar como afecta optimizar directamente BLEU a la calidad percibida y a la diversidad de las traducciones generadas.
- Traduccion chino-vietnamita en entornos controlados: si se confirma el dominio, podria emplearse en prototipos de traduccion de documentos internos con revision humana obligatoria.
- Base para ablaciones academicas: comparar el modelo fusionado tras SFT con esta version post-GRPO permite aislar la contribucion del ajuste por refuerzo.
- Generacion de texto en espanol o ingles de baja exigencia: solo si el ajuste fino no ha degradado el multilingusimo del Qwen3 original, algo que requiere validacion previa.
- Despliegue en hardware modesto para demos: con 1.700 millones de parametros, el modelo fusionado cabe en GPUs de consumo, lo que facilita prototipos y pruebas de concepto.
- Fine-tuning posterior sobre dominios especificos: el adaptador puede servir como inicializacion para nuevas etapas de SFT en tareas de traduccion o generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, y el unico indicio de rendimiento es la inclusion de BLEU como recompensa de entrenamiento, sin valores reportados.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, cerca de 1 GB, mas overhead.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para mayor throughput; cualquier GPU con al menos 6-8 GB de VRAM deberia poder ejecutar el modelo fusionado en precision reducida.
- GPU de consumo: si, cabe en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o incluso modelos con 8 GB en cuantizacion.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama tras convertir el modelo fusionado a GGUF; vLLM y TGI para servir el modelo fusionado en produccion.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-noKL-PhoMT-GRPO-BLEU | 1.700 M (base) + LoRA | No disponible | No disponible | Hugging Face, 0 descargas | Adaptador experimental con GRPO sin KL |
| Qwen3-1.7B (original) | 1.700 M | 32.768 tokens (segun especificaciones publicas de Qwen3) | Apache 2.0 (segun publicacion de Qwen) | Ampliamente disponible | Modelo base oficial, con benchmarks publicados |
| Qwen2.5-1.5B | 1.500 M | 32.768 tokens (segun especificaciones publicas) | Apache 2.0 | Ampliamente disponible | Generacion anterior, muy usado en entornos con recursos limitados |
| SmolLM2-1.7B | 1.700 M | 8.192 tokens (segun especificaciones publicas) | Apache 2.0 | Ampliamente disponible | Alternativa ligera de Hugging Face con enfoque en eficiencia |

La comparativa se limita a parametros y disponibilidad porque el modelo evaluado no publica contexto, licencia ni resultados. Los datos de los modelos alternativos provienen de sus especificaciones publicas y no de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre sesgos, datos de entrenamiento, hiperparametros ni evaluacion, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial; el modelo base Qwen3 suele publicarse bajo Apache 2.0, pero el adaptador no especifica terminos.
- GRPO sin termino KL: riesgo elevado de deriva respecto al modelo base, colapso de diversidad y sobreoptimizacion de la recompensa BLEU.
- Recompensa BLEU: metrica de solapamiento de n-gramas que no captura fidelidad semantica ni fluidez; puede premiar traducciones literales o repetitivas.
- Riesgo de alucinacion: inherente a modelos de 1.700 millones de parametros y potencialmente agravado por el ajuste por refuerzo.
- Idiomas no confirmados: el nombre sugiere chino-vietnamita, pero no hay documentacion; el rendimiento en castellano es incierto.
- Contexto no documentado: no se puede planificar su uso en conversaciones o documentos largos sin validacion empirica.
- Sin adopcion: cero descargas y cero likes indican ausencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-09): metadato anomalo que sugiere un repositorio de prueba o generado automaticamente; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingtime12/Qwen3-1.7B-noKL-PhoMT-GRPO-BLEU
- Modelo base (fusionado tras SFT): https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged
- Referencia del calculador de impacto climatico citada en la model card: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL (GRPO): https://huggingface.co/docs/trl
