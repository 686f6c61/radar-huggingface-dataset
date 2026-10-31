# medismera/LFM3-1.7B-Surgical-Abliterated

## Resumen

LFM3-1.7B-Surgical-Abliterated es una versión modificada de LFM3-1.7B de LiquidAI, publicada por el usuario medismera en HuggingFace. Se trata de un modelo de generación de texto conversacional al que se le ha aplicado una técnica de "ablación quirúrgica de rechazos" (refusal ablation): una proyección direccional sobre las representaciones latentes de capas críticas del transformer que elimina el subespacio de negación, de modo que el modelo ya no emite respuestas de rechazo ni avisos morales. El autor afirma que la intervención preserva el conocimiento factual, la precisión en código y el razonamiento lógico.

El modelo base, LFM3-1.7B, emplea una arquitectura híbrida convolución-transformer lineal con una huella de memoria reducida, lo que lo hace adecuado para despliegues en hardware modesto. Con 1.728.801.536 parámetros (dato real de los safetensors) y un tamaño de repositorio de 3,5 GB, es un modelo pequeño orientado a casos de uso de investigación, red-teaming y auditoría de seguridad.

Su relevancia actual radica en la tendencia de la comunidad open source a publicar variantes "abliterated" o "uncensored" de modelos alineados, útiles para estudiar los mecanismos de alineación y para entornos controlados donde los rechazos automáticos resultan un obstáculo. No obstante, su uso conlleva riesgos éticos y legales significativos que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido convolución-lineal (causal LM) |
| Parametros totales | 1.728.801.536 (≈1,73B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se recomienda cargar con `torch_dtype=torch.bfloat16`) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (licencia heredada del modelo base LiquidAI/LFM3-1.7B; terminos exactos no disponibles en la ficha) |
| Formato de pesos | safetensors (3,5 GB de tamano de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un modelo causal de lenguaje con una arquitectura híbrida que combina capas de convolución con transformer lineal, según las notas de arquitectura incluidas en la model card. Este tipo de diseño híbrido busca reducir la huella de memoria y el coste computacional frente a un transformer convencional denso, aunque la documentación disponible no detalla el número de capas, dimensiones ocultas ni mecanismos de atención concretos.

No hay información pública sobre los datos de entrenamiento del modelo base (número de tokens, composición del corpus) ni sobre el uso de RLHF o DPO en esta ficha. La modificación introducida por medismera no es un reentrenamiento, sino una intervención post-entrenamiento: una ablación direccional del subespacio de rechazo en capas críticas del transformer, realizada bajo restricciones ortogonales benignas y con preservación de la norma de Frobenius, con el objetivo de eliminar los rechazos sin degradar la calidad lingüística ni las capacidades de razonamiento y código.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM3-1.7B.
- Generacion de codigo: la model card afirma que se preserva la sintaxis de programacion y la correccion algoritmica tras la ablacion.
- Razonamiento logico: se declara que se conserva la profundidad de razonamiento del modelo base sin "impuesto de alineacion".
- Cumplimiento directo de instrucciones tecnicas sensibles (auditoria de redes, ciberseguridad, analisis de red) sin emitir tokens de rechazo.
- Compatibilidad con plantillas de chat: el codigo de ejemplo comprueba si el tokenizador dispone de `chat_template` y la aplica si existe.
- Uso con la libreria `transformers` de HuggingFace mediante `trust_remote_code=True` (el modelo usa custom_code).
- No hay evidencia en la informacion disponible de capacidades multimodales (vision, audio), tool calling ni modos de pensamiento extendido.

## Casos de uso

- Investigacion en alineacion y seguridad de modelos: la ablacion del subespacio de rechazo permite estudiar como se codifican los comportamientos de negacion en las representaciones latentes y evaluar la robustez de tecnicas de alineacion.
- Red-teaming y auditoria de seguridad: al no emitir rechazos, facilita pruebas automatizadas de jailbreak y analisis de vulnerabilidades de otros sistemas basados en LLM, usando este modelo como generador de payloads o casos de prueba.
- Analisis de redes y ciberseguridad defensiva: puede generar scripts de auditoria de red local, como el ejemplo de la model card (auditoria con raw sockets en Python), en entornos controlados por profesionales autorizados.
- Generacion creativa sin restricciones: escritura de ficcion con contenido que los modelos alineados suelen rechazar, util para escritores que necesitan narrativas realistas sin interrupciones moralizantes.
- Prototipado en hardware modesto: con 1,7B de parametros y arquitectura de bajo consumo de memoria, es adecuado para experimentacion local en GPUs de consumo o incluso CPU.
- Evaluacion comparativa de tecnicas de ablacion: sirve como caso de estudio para comparar metodos de "surgical alignment" frente a alternativas como ablaciones por media de diferencias (difference-in-means) en otros modelos abliterated de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que la ablacion preserva los resultados en benchmarks de conocimiento factual, precision en codigo y razonamiento logico, pero no proporciona numeros concretos ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 (tamano del repositorio), mas overhead de activaciones y KV cache; en la practica, 4-6 GB de VRAM deberian ser suficientes para contextos moderados.
- GPUs recomendadas: cualquier GPU moderna de gama media es suficiente; por ejemplo, una RTX 3060 de 12 GB, RTX 4060 Ti u superiores ejecutarian el modelo con holgura. No se requieren A100 ni H100 para inferencia.
- Cabe con comodidad en GPUs de consumo: modelos de ~1,7B de parametros en fp16/bf16 entran incluso en GPUs de 4-6 GB, y con cuantizacion (si se generan versiones GGUF) podria ejecutarse en CPU.
- Opciones de despliegue: la model card muestra uso directo con `transformers` (requiriendo `trust_remote_code=True`). Al tratarse de un modelo con custom_code, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible y dependeria del soporte de la arquitectura LFM3 en cada framework.
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B con arquitectura hibrida de bajo consumo de memoria, cabria esperar latencias bajas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Caracteristica distintiva |
|---|---|---|---|---|
| medismera/LFM3-1.7B-Surgical-Abliterated | 1,73B | Transformer hibrido conv-lineal | other | Ablacion quirurgica del subespacio de rechazo sobre LFM3-1.7B |
| LiquidAI/LFM3-1.7B (base) | 1,73B | Transformer hibrido conv-lineal | other | Modelo original alineado de LiquidAI |
| Qwen2.5-1.5B-Instruct | 1,54B | Transformer denso | Qwen (uso comercial permitido con condiciones) | Modelo generalista multilingue con amplio soporte de ecosistema |
| Llama-3.2-1B-Instruct | 1,24B | Transformer denso | Llama 3.2 Community License | Modelo generalista de Meta con ecosistema amplio |

Nota: no hay datos de rendimiento comparables publicados para estas alternativas en la informacion disponible, por lo que la comparativa se limita a parametros, arquitectura y licencia.

## Limitaciones y advertencias

- Riesgo de alucionacion: no hay datos que sugieran que la ablacion reduzca o aumente las alucionaciones heredadas del modelo base; al tratarse de un modelo de 1,7B, la tasa de alucionaciones en tareas factualmente exigentes es esperablemente alta.
- La ablacion de rechazos elimina salvaguardas de seguridad: el modelo puede generar contenido nocivo, ilegal o peligroso si se le solicita. El autor lo destina explicitamente a investigacion, red-teaming y auditoria, y advierte de que el usuario es responsable del cumplimiento legal de sus aplicaciones.
- Restriccion de licencia: la licencia figura como "other" y hereda los terminos del modelo base de LiquidAI; no se confirma en la ficha el permiso para uso comercial, por lo que debe revisarse la licencia del modelo base antes de cualquier despliegue en produccion.
- Idioma: el modelo esta catalogado solo en ingles; no hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que dificulta planificar casos de uso con documentos largos.
- `trust_remote_code=True`: el modelo requiere ejecutar codigo remoto personalizado, lo que supone un vector de riesgo de suministro que debe evaluarse antes de usarlo en entornos sensibles.
- Sin benchmarks publicados: las afirmaciones de preservacion de capacidades tras la ablacion no estan verificadas con datos cuantitativos independientes.
- Advertencia etica: el uso de modelos sin salvaguardas en produccion orientada a usuarios finales es generalmente inapropiado y puede incumplir normativas y politicas de plataformas.

## Enlaces

- Modelo abliterated: https://huggingface.co/medismera/LFM3-1.7B-Surgical-Abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Organizacion del autor del modelo base: https://huggingface.co/LiquidAI
