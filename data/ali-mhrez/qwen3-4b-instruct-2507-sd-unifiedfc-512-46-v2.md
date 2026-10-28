# Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-UnifiedFC-512-46-v2

## Resumen

Qwen3-4B-Instruct-2507-SD-UnifiedFC-512-46-v2 es un ajuste fino supervisado (SFT) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario Ali-Mhrez en Hugging Face. Se trata, por tanto, de una variante derivada de un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros, entrenada con TRL 0.24.0 y Unsloth sobre la versión Instruct-2507 de la familia Qwen3. El repositorio se creó y actualizó el 28 de octubre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

El interés del modelo es limitado y muy específico: no aporta una arquitectura nueva ni un conjunto de datos documentado, sino un checkpoint derivado cuyo propósito exacto no está descrito en la model card. El sufijo del nombre ("SD-UnifiedFC-512-46-v2") sugiere un entrenamiento orientado a function calling unificado y a una ventana de 512, pero el autor no documenta esa interpretación en ningún momento, por lo que debe tratarse como una hipótesis y no como un dato.

Por tanto, esta ficha debe leerse como una evaluación de la información disponible, que es escasa: la model card se limita a la plantilla automática de TRL e indica únicamente el modelo base, el procedimiento de entrenamiento (SFT) y las versiones de framework. No hay datos de dataset, hiperparámetros, benchmarks, licencia efectiva ni idiomas declarados para el fine-tune.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B-Instruct-2507; no verificada en el fine-tune) |
| Parámetros totales | ~4.000 millones (4B, según el nombre del modelo y el modelo base) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens según el modelo base; no verificada en el fine-tune |
| Tipos de cuantización | Pesos publicados en safetensors; no se distribuyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible para el fine-tune (el modelo base declara cobertura multilingüe amplia; no verificada aquí) |
| Licencia | No disponible (la model card incluye `licence: license` como marcador sin contenido; el modelo base se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only denso de la familia Qwen3, en su variante Instruct-2507, que opera en modo instructivo sin modo de razonamiento explícito. No hay en la información disponible ningún cambio arquitectónico introducido por el autor del fine-tune: no se mencionan cabeças de atención modificadas, capas adicionales, decodificación especulativa ni mecanismos híbridos. El fine-tune es, según la model card, un SFT (supervised fine-tuning) ejecutado con TRL 0.24.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.23.1, con Unsloth como parte del stack de entrenamiento (según los tags del repositorio).

No se especifica el volumen de tokens de entrenamiento, la composición del dataset, la mezcla de idiomas, la existencia de fases de RLHF o DPO, ni los hiperparámetros (learning rate, épocas, rango de LoRA en caso de haberlo). Tampoco se indica si los pesos publicados son el modelo fusionado completo o adaptadores: el tamaño del repositorio (1,2 GB) es inferior a lo esperable para 4.000 millones de parámetros en bf16 (aproximadamente 8 GB), lo que conviene verificar antes de asumir que el checkpoint es autosuficiente.

## Capacidades

- Generación de texto instructivo y seguimiento de instrucciones, heredados del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento de un solo paso en modo instructivo: el modelo base no emplea modo "thinking" explícito.
- Generación de código y matemáticas a nivel de modelo de 4B, sin datos de benchmark que lo cuantifiquen en esta variante.
- Soporte de tool calling y function calling: capacidad presente en el modelo base y presumiblemente reforzada por el fine-tune, aunque el autor no lo documenta.
- Capacidades de agente y razonamiento multi-paso dentro de la ventana de contexto del modelo base.
- Multilingüismo heredado del modelo base; el fine-tune no declara idiomas ni evaluación por idioma.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Experimentación con function calling: el nombre del checkpoint sugiere un entrenamiento orientado a llamadas a funciones unificadas, por lo que resulta adecuado para probar pipelines de extracción de argumentos y selección de herramientas en un modelo de 4B desplegable en una sola GPU.
- Prototipado de asistentes conversacionales multi-turno: la ventana de 262.144 tokens del modelo base permite mantener historiales largos sin truncado agresivo, útil en pruebas de concepto de atención al cliente.
- Generación de código en entornos con recursos limitados: un modelo de 4B cuantizado a 4 bits ocupa del orden de 2,5-3 GB de VRAM, lo que permite ejecutarlo en estaciones de trabajo sin GPU de datacenter.
- Evaluación comparativa de fine-tunes: sirve como punto de partida para medir el efecto de un SFT con TRL y Unsloth frente al checkpoint original, siempre que se construya un conjunto de evaluación propio, ya que el autor no publica ninguno.
- Extracción de información estructurada: clasificación de intenciones, normalización de entidades y generación de JSON en pipelines de ingestión de documentos.
- Despliegue en endpoints compatibles con la API de OpenAI: el tag `endpoints_compatible` del repositorio apunta a este escenario, útil para sustituir un modelo mayor en pruebas de integración.
- Investigación sobre sobreajuste en SFT: al no publicarse dataset ni métricas, el checkpoint es un caso de estudio sobre la trazabilidad de fine-tunes de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y los resultados de búsqueda web devueltos no contienen información relacionada con el modelo (corresponden a dominios de comercio electrónico sin relación).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: del orden de 8-9 GB para los pesos, más overhead de KV cache; se recomienda 16 GB para contextos largos.
- VRAM estimada en cuantización de 8 bits: del orden de 5 GB; en 4 bits, del orden de 2,5-3 GB. Son estimaciones por tamaño de parámetros, no medidas publicadas para este checkpoint.
- GPU de datacenter: A100 (40/80 GB), H100, L40S o A10G, con margen amplio incluso en bf16.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 (24 GB) y, en cuantización de 4 bits, en tarjetas de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM o TGI para serving en bf16; llama.cpp u Ollama para cuantizaciones GGUF (que habría que generar, ya que el repositorio solo publica safetensors); Transformers como vía directa según el snippet de la model card.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

La comparación es estructural, ya que no existen métricas publicadas de esta variante. Los datos de los modelos alternativos corresponden a sus especificaciones públicas y no se han verificado en el contexto de esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-SD-UnifiedFC-512-46-v2 | ~4B denso | 262.144 tokens (heredado, no verificado) | No disponible para el fine-tune | Hugging Face, 0 descargas |
| Qwen3-4B-Instruct-2507 (base) | ~4B denso | 262.144 tokens | Apache 2.0 | Hugging Face, ampliamente distribuido |
| Llama 3.1 8B Instruct | ~8B denso | 131.072 tokens | Llama 3.1 Community License | Hugging Face y proveedores cloud |
| Phi-4-mini | ~3,8B denso | 131.072 tokens | MIT | Hugging Face |

Frente al modelo base, esta variante solo se diferencia por el SFT, sin documentación que permita justificar la sustitución. Frente a Llama 3.1 8B, ofrece la mitad de parámetros y el doble de contexto declarado, a costa de una licencia del fine-tune sin declarar. Frente a Phi-4-mini, el contexto es mayor, pero la licencia efectiva del checkpoint es incierta.

## Limitaciones y advertencias

- Trazabilidad insuficiente: no se documenta dataset, número de tokens, hiperparámetros ni metodología de evaluación. No es posible reproducir el entrenamiento ni auditar sus efectos.
- Licencia sin declarar: la model card contiene `licence: license` como marcador. Aunque el modelo base es Apache 2.0, la licencia del checkpoint derivado no está explicitada, lo que supone un riesgo jurídico para uso comercial.
- Posible sobreajuste o degradación: un SFT sin evaluación publicada puede deteriorar capacidades del modelo base (razonamiento, multilingüismo) sin que exista evidencia al respecto.
- Riesgo de alucinación: inherente a un modelo de 4B en modo instructivo sin verificación factual; se agrava al no conocerse la distribución del dataset de ajuste.
- Sesgos: no documentados. Al desconocerse la composición del dataset, no es posible acotar sesgos de género, idioma, cultura o dominio.
- Verificar el contenido real del repositorio: 1,2 GB es un tamaño inferior al esperado para 4.000 millones de parámetros en bf16; comprobar si se trata de un modelo fusionado, de adaptadores o de un subconjunto de shards antes de desplegarlo.
- Cero adopción: 0 descargas y 0 valoraciones implican ausencia de validación por parte de la comunidad.
- Idiomas no declarados: no hay garantía de comportamiento en castellano más allá de lo que herede del modelo base.
- Nombre no documentado: los sufijos "SD", "UnifiedFC", "512" y "46" no se explican en la model card; no deben interpretarse como especificaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-UnifiedFC-512-46-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Repositorio de TRL: https://github.com/huggingface/trl
- Nota: los resultados de búsqueda web disponibles no contienen enlaces relevantes al modelo (devuelven páginas de AliExpress y Alibaba sin relación). No se dispone de paper, blog del autor, demo ni repositorio adicional.
