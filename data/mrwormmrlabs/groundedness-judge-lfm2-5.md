# MrWoRmMrLabs/groundedness-judge-lfm2.5

## Resumen

El modelo `groundedness-judge-lfm2.5` es un adaptador LoRA desarrollado por MrWoRmMrLabs sobre el modelo base LiquidAI/LFM2.5-2.6B de Liquid AI. Su función es actuar como un auditor local de "groundedness" (fundamentación) para agentes de IA: recibe el contexto disponible, la pregunta del usuario y la respuesta generada por un agente, y devuelve un veredicto estructurado en JSON que indica si la respuesta está fundamentada en el contexto, si inventa hechos, si cita fuentes, y qué lagunas evitables contiene. El objetivo es detectar alucinaciones en sistemas de IA locales sin depender de servicios en la nube.

El adaptador se entrenó con datos sintéticos balanceados (casos con y sin alucinación) durante 6 épocas en una única GPU Tesla P100, con LoRA de rango 16 y alpha 32. El modelo resultante es muy ligero (0.1 GB en el repositorio) y puede ejecutarse en dispositivos modestos, incluso en un teléfono con cuantización Q4. La licencia es la LFM Open License v1.0, que permite uso gratuito para organizaciones con ingresos anuales inferiores a 10 millones de dólares, y requiere licencia comercial por encima de ese umbral.

La relevancia actual radica en que los stacks de agentes locales son propensos a alucinar, y los "jueces" basados en la nube anulan la ventaja de ejecutar todo localmente. Este modelo ofrece una alternativa compacta, reproducible y respetuosa con la privacidad (los datos de entrenamiento son sintéticos) para validar la groundedness de respuestas generadas por agentes en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM2.5-2.6B (transformador, posiblemente MoE según Liquid AI) |
| Parametros totales | 2.6B (modelo base) + adaptador LoRA (rango 16, ~0.1 GB) |
| Parametros activos | No disponible (no especificado para el modelo base) |
| Longitud de contexto | No disponible (el modelo base LFM2.5 soporta hasta 128K según Liquid AI, pero no confirmado para esta variante) |
| Tipos de cuantizacion | FP16, Q4, Q8 (depende del modelo base; el adaptador es en fp16) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (uso gratuito para ingresos < 10M USD; licencia comercial superior) |
| Formato de pesos | Safetensors (adaptador LoRA) y safetensors para el modelo base |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM2.5-2.6B`, un modelo de lenguaje de Liquid AI con arquitectura transformer (posiblemente de mezcla de expertos, aunque no se especifica en la documentación del adaptador). El método de ajuste es LoRA con rango 16, alpha 32, dropout 0.05, aplicado a todos los módulos lineales. El entrenamiento se realizó con un dataset sintético de casos de auditoría balanceados (mitad con alucinaciones, mitad sin ellas), con 6 épocas, tasa de aprendizaje 1.5e-4 con decaimiento coseno, precisión fp16 y longitud de corte de 1024 tokens. Se utilizó una única GPU Tesla P100 (Pascal, 16 GB) y el proceso tardó unos 4 minutos con una pérdida final de entrenamiento de aproximadamente 0.25.

Un detalle técnico relevante es la compatibilidad: el tokenizador de LFM2.5 requiere transformers 5.x, pero el módulo `moe.py` de transformers 5.x necesita torch >= 2.5. En entornos con drivers CUDA 12.2, se recomienda torch 2.5.1+cu121. Además, la GPU Pascal (sm_60) no soporta bf16 ni FlashAttention, por lo que se entrenó con fp16 y atención estándar.

## Capacidades

- Deteccion de alucinaciones: decide si una respuesta contiene hechos inventados no respaldados por el contexto proporcionado.
- Evaluacion de groundedness: determina si la respuesta usa el contexto persistente y/o pasajes RAG recuperados.
- Salida JSON estructurada: genera un objeto JSON con campos como `used_context`, `used_rag`, `invented_facts`, `potentially_invented_facts`, `cited_sources`, `avoidable_gaps`, `severe_alert`, `quality_score` y `suggested_response`.
- Juicio de calidad: asigna una puntuacion de calidad global de 0 a 5.
- Sugerencia de respuesta corregida: cuando es util, propone una respuesta reescrita y fundamentada.
- Proteccion contra falsos positivos: reconoce elementos que no son alucinaciones, como dirigirse al usuario por su nombre, nombrar el sistema o ecosistema, nombrar agentes compañeros, conocimiento general estable y aritmetica derivada correctamente de numeros dados.
- Ejecucion local: pensado para funcionar junto a agentes locales sin conexion a la nube.

## Casos de uso

- Auditoria de agentes conversacionales locales: integrar el modelo como paso posterior a cada respuesta de un agente para verificar que no ha inventado informacion. El JSON devuelto permite registrar alertas y corregir respuestas antes de mostrarlas al usuario.
- Validacion de pipelines RAG: en sistemas de generacion aumentada por recuperacion, el modelo puede comprobar si la respuesta final se apoya realmente en los pasajes recuperados, detectando cuando el LLM ignora el contexto o introduce datos externos no soportados.
- Control de calidad en generacion de documentacion tecnica: usado como juez automatico en CI/CD, evalua si las respuestas generadas por un asistente de documentacion se basan en las fuentes internas y no en conocimiento no verificado.
- Monitorizacion de chatbots de atencion al cliente: despliegue junto a un chatbot local para detectar alucinaciones en tiempo real, generando alertas y reescrituras sugeridas cuando la respuesta no esta fundamentada en la base de conocimiento de la empresa.
- Evaluacion de sistemas de IA en entornos sin conexion: en aplicaciones de salud, banca o legal donde la privacidad impide usar APIs externas, el modelo actua como juez local que garantiza que las respuestas se ciñen al contexto proporcionado.
- Entrenamiento y depuracion de agentes: durante el desarrollo de agentes multi-paso, el modelo puede identificar en que paso se produce una desviacion del contexto, ayudando a depurar cadenas de razonamiento y a mejorar los prompts del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (train_loss ≈ 0.25), pero no hay evaluaciones comparativas con otros modelos en tareas de groundedness o deteccion de alucinaciones.

## Requisitos de hardware

- Entrenamiento: una GPU con 16 GB VRAM (se uso una Tesla P100) es suficiente para entrenar el adaptador LoRA en fp16 sin cuantizacion adicional.
- Inferencia: el adaptador LoRA es muy ligero (0.1 GB) y el modelo base de 2.6B puede ejecutarse en GPUs consumer de 8-12 GB con cuantizacion Q4 o Q8. La model card indica que a Q4 cabe en un telefono movil.
- GPUs recomendadas: NVIDIA RTX 3060/4060 (12 GB) o superiores para fp16; GPUs con 8 GB pueden usar cuantizacion Q8. Para CPU, se puede usar llama.cpp con cuantizacion Q4.
- Opciones de despliegue: transformers + PEFT (con decodificacion restringida o gramatica JSON), llama.cpp con gramatica GBNF, Ollama con `format: json`, o vLLM si se quiere servir como endpoint.
- Latencia: no hay datos publicados. Al ser un modelo de 2.6B, se espera una latencia de decenas de milisegundos por token en GPU moderna, y de cientos de milisegundos en CPU con cuantizacion.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de deteccion de groundedness. Las alternativas tipicas serian:

- GPT-4 como juez (via API): mucho mas potente pero no local, con coste por uso y problemas de privacidad.
- Modelos de deteccion de alucinaciones especificos como `vectara/hallucination_evaluation_model` (basado en T5) o `OpenFactVerification` (basado en DeBERTa): suelen ser clasificadores binarios, no generan veredictos JSON ni sugerencias de reescritura.
- Adaptadores LoRA similares sobre otros modelos base: no se han encontrado en la busqueda.

La ventaja de este adaptador es su integracion con un LLM generativo (LFM2.5-2.6B), lo que permite emitir juicios complejos con explicaciones y reescrituras, manteniendo un tamano reducido.

## Limitaciones y advertencias

- Idioma: solo soporta ingles. No se ha entrenado para otros idiomas.
- Salida no estructurada en OOD: en entradas fuera de la distribucion de entrenamiento, el modelo tiende a razonar en prosa en lugar de emitir JSON limpio. Es obligatorio forzar la salida estructurada mediante gramaticas JSON (GBNF, `format: json`) o decodificacion restringida.
- Datos sinteticos: el entrenamiento se realizo exclusivamente con datos sinteticos, lo que puede limitar la generalizacion a casos reales complejos (ironia, contexto implicito, conocimiento del mundo no declarado).
- Alcance limitado: el modelo solo evalua la groundedness con respecto al contexto dado; no detecta alucinaciones factuales que no esten en el contexto (por ejemplo, si el agente afirma que Paris es la capital de Francia, y el contexto no lo menciona, el modelo podria considerarlo grounded si es conocimiento general estable, pero no lo verifica externamente).
- Licencia restringida: la LFM Open License v1.0 limita el uso comercial gratuito a organizaciones con ingresos anuales inferiores a 10 millones de dolares. Por encima de ese umbral se requiere una licencia comercial de Liquid AI.
- Dependencia del modelo base: el adaptador requiere cargar el modelo base LFM2.5-2.6B, que tiene su propia licencia y requisitos de hardware.
- Riesgo de sesgo: el conjunto de entrenamiento sintetico puede no reflejar la diversidad de estilos de respuesta reales, lo que podria sesgar los veredictos en ciertos dominios.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/MrWoRmMrLabs/groundedness-judge-lfm2.5
- Modelo base LiquidAI/LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-open-license
- Blog de Liquid AI sobre LFM2.5-8B-A1B (informacion sobre la familia LFM2.5): https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Blog de Liquid AI sobre LFM2.5-VL-3B (vision-lenguaje): https://www.liquid.ai/blog/lfm2-5-vl-3b
- Cookbook de Liquid AI (ejemplos y tutoriales): https://github.com/Liquid4All/cookbook
