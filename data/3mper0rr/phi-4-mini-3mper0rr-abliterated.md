# 3MPER0RR/Phi-4-mini-3MPER0RR-abliterated

## Resumen

Phi-4-mini-3MPER0RR-abliterated es una modificación experimental del modelo Microsoft Phi-4-mini-instruct, un transformer denso de aproximadamente 3.836 millones de parámetros (3,84B) publicado originalmente por Microsoft. El autor del repositorio, 3MPER0RR, ha aplicado un proceso de "abliteration", una técnica de modificación de pesos orientada a reducir los mecanismos de rechazo y alineación del modelo original, con el objetivo declarado de servir como artefacto de investigación y experimentación.

El modelo conserva la arquitectura y el tokenizador del Phi-4-mini-instruct original, lo que implica compatibilidad con el ecosistema de inferencia de la familia Phi-4 (transformers con `trust_remote_code`, vLLM, llama.cpp tras conversión a GGUF). El repositorio pesa 7,7 GB en safetensors y acumula 848 descargas, lo que indica un uso moderado dentro de la comunidad de experimentación con modelos "uncensored".

La relevancia de esta ficha radica en documentar con rigor un artefacto derivado: no es un modelo nuevo entrenado desde cero, sino una intervención sobre pesos existentes cuya model card es extremadamente escueta (40 "trials", estado "tested and saved") y no aporta datos sobre metodología, dataset de calibración ni evaluación. Cualquier uso en producción debe partir de esa premisa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3/Phi-4, `phi3` en Hugging Face, requiere `custom_code`) |
| Parámetros totales | 3.836.021.760 (3,84B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Phi-4-mini-instruct soporta 128K tokens, pero no se confirma que la modificación lo preserve) |
| Tipos de cuantización | No disponible en la model card; al ser safetensors en FP16/BF16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | No disponible |
| Licencia | MIT (según metadatos del repo; el autor remite además a un archivo `License` propio) |
| Formato de pesos | safetensors (repo de 7,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Phi-4-mini-instruct de Microsoft: un transformer decoder-only denso de 3,84B parámetros con atención de múltiples cabezas, tokenizador propio de la familia Phi y soporte nativo de plantillas de chat conversacionales. El tag `phi3` y la necesidad de `custom_code` indican que la implementación requiere cargar código remoto desde el repositorio, no una clase estándar de transformers.

No hay información pública sobre el proceso de "abliteration" aplicado: la model card menciona "40 trials" y un estado "tested and saved", pero no detalla si se usó directional ablation sobre las direcciones de rechazo en el espacio de activaciones, edición de pesos por capas, fine-tuning con datos contrastivos o una combinación. Tampoco se documenta el dataset de calibración, el número de tokens procesados ni si hubo evaluación posterior de capacidades. No se dispone de datos sobre RLHF, DPO ni ninguna etapa de alineación adicional en esta versión modificada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Phi-4-mini-instruct original.
- Razonamiento y matemáticas de nivel medio, coherente con el tamaño de 3,84B del modelo base.
- Generación de código, con soporte del modelo base para lenguajes habituales.
- Respuesta a instrucciones con menor tasa de rechazos que el modelo original, objetivo declarado de la modificación.
- Soporte de plantillas de chat (formato Phi-4-mini) para diálogo estructurado.
- Capacidades multilingües: no confirmadas para esta versión; dependen de lo que preserve la modificación respecto al base.
- Tool calling / function calling: no documentado en esta versión; el modelo base lo soporta parcialmente, pero no hay verificación tras la modificación.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como objeto de estudio para medir cómo la abliteration altera la tasa de rechazos, la calidad de respuesta y los sesgos residuales frente al Phi-4-mini-instruct original, en entornos controlados de laboratorio.
- Generación de datos sintéticos para entrenamiento: al reducir los rechazos, puede producir respuestas sobre temas que el modelo base declinaría, útil para construir datasets de contraste o de red-teaming.
- Evaluación de robustez de filtros: desplegar el modelo detrás de un clasificador de contenido para comprobar si el filtro externo captura las salidas que el modelo original habría bloqueado internamente.
- Experimentación con cuantización en hardware consumer: con 3,84B parámetros, cabe en GPUs de 8-12 GB en 4 bits, lo que permite probar pipelines de inferencia local (llama.cpp, Ollama) con un modelo de la familia Phi-4 sin necesidad de infraestructura de datacenter.
- Prototipado de asistentes conversacionales de bajo coste: para demos internas donde la latencia y el coste importan más que la robustez de seguridad, un modelo de 4B en una sola GPU ofrece tiempos de respuesta bajos.
- Estudio de degradación por edición de pesos: comparar benchmarks del modelo modificado frente al original permite cuantificar el coste en capacidades (MMLU, GSM8K) que impone la abliteration, un dato relevante para quienes investigan técnicas de edición de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con el modelo base. Tampoco se documenta la tasa de rechazos antes y después de la modificación, que sería el dato más relevante para caracterizar el efecto de la abliteration.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 7,7 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, 10-12 GB para contexto corto.
- VRAM estimada en 8 bits: alrededor de 4 GB de pesos; 6-8 GB totales con contexto moderado.
- VRAM estimada en 4 bits (GGUF Q4_K_M): alrededor de 2,3-2,5 GB de pesos; 4-5 GB totales, con contexto largo incluido.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para mayor throughput; A100/H100 solo si se necesita servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más en cuantización de 4-8 bits; en FP16 requiere 12 GB o más.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el tag `phi3` y `custom_code`), vLLM (verificar compatibilidad con la implementación custom), llama.cpp y Ollama tras conversión a GGUF, TGI si se adapta la arquitectura.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para esta modificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Phi-4-mini-3MPER0RR-abliterated | 3,84B | No disponible | MIT | Modificación experimental; sin benchmarks publicados |
| microsoft/Phi-4-mini-instruct | 3,84B | 128K (según modelo base) | MIT | Modelo original con alineación intacta y evaluaciones publicadas por Microsoft |
| Qwen2.5-3B-Instruct | 3,09B | 32K (128K en variantes) | Apache 2.0 | Alternativa de tamaño similar con soporte multilingüe amplio y tool calling documentado |
| Llama-3.2-3B-Instruct | 3,21B | 128K | Llama 3.2 Community License | Alternativa de 3B con ecosistema de despliegue maduro; licencia con restricciones comerciales |

La comparación directa con el modelo base es la más informativa: misma arquitectura y tamaño, pero distinto estado de alineación y sin datos de evaluación en la versión modificada. Frente a Qwen2.5-3B y Llama-3.2-3B, la diferencia clave es que estos últimos tienen documentación técnica y benchmarks publicados, mientras que esta modificación no.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni medición de la tasa de rechazos, ni comparación con el modelo base; no se puede afirmar que la modificación preserve las capacidades originales.
- Riesgo elevado de alucinación: el modelo base ya presenta este riesgo y no hay evidencia de que la modificación lo mitigue; la reducción de rechazos puede aumentar la confianza en respuestas incorrectas.
- Sesgos: la abliteration no elimina sesgos de los datos de entrenamiento originales; puede exponerlos con mayor frecuencia al reducir los filtros internos.
- Seguridad: el propósito declarado es eliminar mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sensible sin las salvaguardas del original. No es adecuado para aplicaciones de cara al público sin un filtro externo robusto.
- Licencia: el repo declara MIT, pero el autor remite a un archivo `License` adicional y atribuye la autoría original a Microsoft; conviene revisar ambos documentos antes de un uso comercial, ya que la licencia del modelo base y la de la modificación podrían no coincidir en todos los términos.
- Idiomas: no documentados; no se puede asumir el mismo soporte multilingüe que el modelo base.
- Contexto: no se confirma que la ventana de 128K del Phi-4-mini-instruct se preserve tras la modificación.
- Reproducibilidad: la model card no describe la metodología ("40 trials" sin detalle), lo que impide reproducir o auditar el proceso.
- Código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; verificar la integridad antes de cargar en entornos de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/3MPER0RR/Phi-4-mini-3MPER0RR-abliterated
- Archivo de licencia del repo: https://huggingface.co/3MPER0RR/Phi-4-mini-3MPER0RR-abliterated/blob/main/License
- Aviso legal del repo: https://huggingface.co/3MPER0RR/Phi-4-mini-3MPER0RR-abliterated/blob/main/Disclaimer.md
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
