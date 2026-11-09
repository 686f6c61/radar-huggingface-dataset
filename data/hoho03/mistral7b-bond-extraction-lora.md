# Hoho03/mistral7b-bond-extraction-lora

## Resumen

El modelo `Hoho03/mistral7b-bond-extraction-lora` es un adaptador LoRA (entrenado con QLoRA) sobre `mistralai/Mistral-7B-Instruct-v0.3`, desarrollado por el usuario Hoho03. Su proposito es extraer los terminos principales de un bono (emisor, divisa, nominal, cupon, fechas, seniority) a partir de un fragmento de texto financiero, devolviendo un unico objeto JSON con ocho campos fijos. Resuelve una tarea concreta de extraccion de informacion estructurada en el dominio financiero, donde la salida debe ser parseable y consistente.

El modelo base es Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7 mil millones de parametros con una ventana de contexto de 32 768 tokens y licencia Apache 2.0. El adaptador anade 41,9 millones de parametros entrenables (0,58 % del total) mediante LoRA con rango 16 sobre los modulos de atencion y MLP. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors compatible con PEFT.

La relevancia de esta ficha es doble: por un lado, documenta una tarea practica de extraccion de datos de prospectos de bonos; por otro, es un ejemplo poco habitual de model card honesta, que separa explicitamente los resultados sobre un test sintetico (que comparte plantillas con el entrenamiento) de los resultados sobre 24 extractos reales etiquetados a mano. Esa distincion es clave para evaluar su utilidad real en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.3) con adaptador LoRA |
| Parametros totales | 7 000 millones (base) + 41,9 millones entrenables en el adaptador (0,58 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base; entrenamiento limitado a secuencias de 768 tokens |
| Tipos de cuantizacion | Base en 4-bit NF4 con doble cuantizacion y computo fp16 (QLoRA); el adaptador se distribuye en safetensors |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only con atencion causal estandar, sin mezcla de expertos. La tecnica empleada es QLoRA: el modelo base se carga en 4 bits NF4 con doble cuantizacion y computo en fp16, y sobre el se insertan matrices LoRA de rango 16 y alpha 32 con dropout 0,05 en los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Esto da 41,9 millones de parametros entrenables, un 0,58 % del total.

El entrenamiento usa 900 descripciones generadas por plantillas en ingles y frances (700 de entrenamiento, 50 de validacion, 150 de test), 2 epocas, batch efectivo de 16, learning rate 2e-4 con scheduler coseno, optimizador paged AdamW de 8 bits y calculo de la perdida solo sobre la respuesta. Se completo en una unica GPU T4 de Colab en unos 26 minutos, con una perdida final de entrenamiento de 0,012. No se menciona RLHF ni DPO; el ajuste es puramente supervisado sobre pares instruccion-respuesta. La innovacion destacable no es arquitectonica sino metodologica: el autor documenta el sesgo del test sintetico y evalua ademas sobre 24 extractos reales de prospectos publicos.

## Capacidades

- Extraccion de informacion estructurada: dado un fragmento de texto, devuelve un objeto JSON con los campos `issuer`, `currency`, `nominal`, `coupon_pct`, `coupon_frequency`, `issue_date`, `maturity_date` y `seniority`.
- Generacion de texto conversacional heredada del modelo base Mistral-7B-Instruct-v0.3.
- Formato de salida estricto: fechas en YYYY-MM-DD, nominal como entero, cupon como numero y frecuencia restringida a {Annual, Semi-annual, Quarterly}.
- Soporte bilingue limitado a ingles y frances, los idiomas del conjunto de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso especifico del adaptador.
- No se documenta capacidad de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Extraccion de terminos de bonos en pipelines de datos financieros: el adaptador convierte fragmentos de prospectos o notas finales en JSON estructurado, lo que permite poblar bases de datos de emisiones sin intervencion manual en los campos mas fiables (nominal, cupon, vencimiento).
- Normalizacion de divisas y fechas de emision: los resultados sobre extractos reales muestran mejoras claras en `currency` (0,625 a 0,917) e `issue_date` (0,667 a 0,905), por lo que es util como paso de normalizacion previo a un validador humano.
- Preprocesamiento para sistemas de gestion de carteras: el JSON extraido puede alimentar motores de calculo de cupones y calendarios de vencimiento, siempre que se valide el campo `seniority` por separado.
- Asistencia a analistas de renta fija: el modelo resume los terminos clave de un extracto corto en un formato uniforme, reduciendo el tiempo de lectura de notas finales.
- Prototipado rapido en investigacion financiera: al ser un adaptador ligero (0,2 GB) sobre un base de licencia Apache 2.0, permite experimentar con extraccion de entidades financieras en una sola GPU consumer.
- Generacion de datos etiquetados de apoyo: el formato de salida fijo sirve como plantilla para anotacion semiautomatica, con revision humana obligatoria dado el 50 % de exact match en datos reales.
- Filtrado y enrutamiento documental: puede clasificar si un fragmento contiene terminos de bono completos y derivar a un revisor humano los casos con campos ausentes.

## Benchmarks y rendimiento

Resultados sobre 24 extractos reales de prospectos publicos etiquetados a mano (los campos ausentes no se puntuan):

| Metrica | Base | Fine-tuned |
|---|---|---|
| JSON valido | 1,000 | 1,000 |
| Exact match (todos los campos) | 0,333 | 0,500 |
| issuer | 0,917 | 1,000 |
| currency | 0,625 | 0,917 |
| nominal | 1,000 | 1,000 |
| coupon_pct | 1,000 | 1,000 |
| coupon_frequency | 0,913 | 0,957 |
| issue_date | 0,667 | 0,905 |
| maturity_date | 1,000 | 1,000 |
| seniority | 0,364 | 0,364 |

Resultados sobre el test sintetico de 100 ejemplos (solo comprobacion de formato, comparte plantillas con el entrenamiento):

| Metrica | Base | Fine-tuned |
|---|---|---|
| JSON valido | 0,99 | 1,00 |
| Exact match | 0,75 | 1,00 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa 0,2 GB, pero requiere cargar Mistral-7B-Instruct-v0.3. En 4-bit NF4 (como en el ejemplo de la model card) el conjunto cabe en aproximadamente 4-5 GB de VRAM; en fp16 requiere unos 14-15 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en fp16 con concurrencia; RTX 4090 (24 GB) para fp16 en una sola tarjeta; T4 (16 GB) o RTX 3060 (12 GB) para cuantizacion 4-bit.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 12 GB o mas usando cuantizacion 4-bit.
- Opciones de despliegue: transformers con PEFT y bitsandbytes (metodo documentado), vLLM o TGI fusionando el adaptador con el base, y llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo se realizo en una T4 en unos 26 minutos, dato que no implica cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hoho03/mistral7b-bond-extraction-lora | 7B + 41,9M adaptador | 32 768 (base); 768 en entrenamiento | Extraccion de terminos de bonos a JSON | apache-2.0 | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 (base sin adaptador) | 7B | 32 768 | Generacion de texto general | apache-2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.2 | 7B | 32 768 | Generacion de texto general | apache-2.0 | Hugging Face |
| Mistral-7B-v0.1 | 7B | 8 000 | Generacion de texto base | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros adaptadores de extraccion financiera en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto sintetico generado por plantillas; la precision real es la de la tabla de 24 ejemplos, donde solo la mitad de los extractos tienen todos los campos correctos.
- El test sintetico comparte plantillas con el entrenamiento, por lo que su exact match de 1,00 no refleja rendimiento real.
- La clasificacion de `seniority` no mejora respecto al base (0,364): las etiquetas sinteticas no coinciden con la redaccion de los prospectos reales.
- Solo procesa extractos cortos: las secuencias de entrenamiento estan limitadas a 768 tokens y no busca la pagina relevante dentro de un prospecto completo.
- No cubre bonos de tipo flotante, cupon cero, step-up ni estructuras con opcion de amortizacion anticipada.
- El prompt debe ser exactamente el de la model card; el adaptador fue entrenado con esa plantilla y no se documenta robustez ante variaciones.
- Idiomas limitados a ingles y frances; no se garantiza comportamiento en castellano.
- Riesgo de alucinacion en campos ausentes del texto: el modelo puede rellenar valores plausibles en lugar de indicar ausencia.
- No se documentan sesgos especificos, pero al derivar de Mistral-7B-Instruct-v0.3 hereda los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la precision medida sobre datos reales exige validacion humana antes de cualquier uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hoho03/mistral7b-bond-extraction-lora
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de Mistral AI: https://github.com/mistralai/mistral-src
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
