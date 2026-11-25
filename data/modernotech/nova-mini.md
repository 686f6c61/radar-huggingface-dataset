# ModernoTech/Nova-Mini

## Resumen

Nova Mini es un modelo de lenguaje denso de tipo conversacional desarrollado por Moderno Tech dentro de su familia Nova AI. Con 751.632.384 parámetros (~0,75B), deriva del modelo base Qwen/Qwen3-0.6B mediante un proceso de ajuste del que la model card no ofrece detalles técnicos. Su propuesta es ocupar la categoría intermedia entre los modelos ultracompactos de la familia (Nano) y los de mayor tamaño (Spark), orientándose a asistentes locales ejecutados en el propio dispositivo del usuario.

La filosofía del proyecto es la inferencia local: el usuario descarga los pesos y ejecuta las conversaciones con los recursos de su teléfono, tablet o portátil, sin depender de servidores centralizados. Nova Mini se distribuye principalmente en formato GGUF cuantizado, lo que lo hace apto para motores de inferencia ligeros y despliegue en navegador o escritorio.

Es relevante por su licencia Apache 2.0, que permite uso comercial sin restricciones, y por su soporte declarado de inglés y español. No obstante, la información pública disponible es escasa: no se documentan datos de entrenamiento, número de tokens, proceso de alineación ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 751.632.384 (~0,75B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (niveles concretos no disponibles) |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,5 GB); safetensors para los parámetros declarados |

## Arquitectura y entrenamiento

Nova Mini es un transformer denso construido a partir de Qwen/Qwen3-0.6B, según declara el propio autor en los metadatos del repositorio. No se especifica si se aplicó fine-tuning supervisado, DPO, RLHF u otra técnica de alineación, ni se detalla la composición del dataset de ajuste. Tampoco se indica el número de tokens de entrenamiento ni si hubo extensión de contexto respecto al modelo base.

La model card se centra en la filosofía de producto (ejecución local, distribución por navegador, selección de modelo según el dispositivo) más que en detalles técnicos de arquitectura. No se documentan innovaciones como decodificación especulativa, atención lineal o modos de razonamiento explícito. La única información estructural fiable es la derivación de Qwen3-0.6B y el recuento real de parámetros en safetensors.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y español.
- Razonamiento básico y respuesta a preguntas, limitado por su tamaño de ~0,75B.
- Ejecución local en dispositivos de consumo mediante cuantización GGUF.
- Integración prevista en interfaces web con motor de inferencia en navegador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente conversacional de escritorio: el modelo puede ejecutarse localmente en un portátil con recursos moderados, gestionando conversaciones multi-turno sin enviar datos a la nube, lo que encaja con la propuesta de privacidad del proyecto.
- Chat integrado en navegador: gracias a su formato GGUF y tamaño reducido (~0,5 GB en el repo), puede cargarse en memoria desde una página web y procesar consultas con un motor de inferencia compatible con WebGPU/WASM.
- Automatizaciones ligeras de texto: generación de respuestas plantilla, resúmenes cortos o reformulación de textos en pipelines locales donde no se justifica una API remota.
- Asistente en dispositivos móviles y tablets: su tamaño permite considerar su despliegue en hardware con memoria limitada, seleccionándolo como opción intermedia frente a modelos ultracompactos.
- Prototipado y evaluación de la familia Nova: sirve como banco de pruebas para desarrolladores que quieran integrar la familia Nova AI antes de escalar a modelos mayores.
- Aplicaciones educativas o de demostración: para enseñar el funcionamiento de la inferencia local sin costes de infraestructura, con la salvedad de sus limitadas capacidades de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño (~0,75B parámetros), una cuantización de 4 bits ocuparía del orden de 0,4-0,5 GB, y en fp16 en torno a 1,5 GB, aunque estos cálculos no están confirmados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU de consumo moderna (RTX 3060 en adelante) sería sobredimensionada; el modelo está pensado para CPU y aceleración integrada.
- Cabe en GPU de consumo: previsiblemente sí en la práctica totalidad de GPU consumer actuales, así como en CPU con RAM suficiente.
- Opciones de despliegue: GGUF es compatible con llama.cpp y derivados (Ollama, LM Studio); el autor menciona motores de inferencia en navegador, sin nombrar uno concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Nova Mini | ~0,75B | no disponible | Apache 2.0 | Derivado de Qwen3-0.6B, GGUF, en/es |
| Qwen3-0.6B | ~0,6B | no disponible en esta ficha | Apache 2.0 | Modelo base del que deriva Nova Mini |
| Qwen2.5-0.5B | ~0,5B | 32K (según documentación pública de Qwen) | Apache 2.0 | Alternativa ultracompacta de la misma familia |
| SmolLM2-360M | ~0,36B | 8K (según documentación pública) | Apache 2.0 | Alternativa aún más pequeña para ejecución local |

No se dispone de datos de rendimiento comparativo para Nova Mini, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Con ~0,75B parámetros, la capacidad de razonamiento, matemáticas y código es intrínsecamente limitada; no es adecuado para tareas complejas de agente o generación de código en producción.
- Riesgo elevado de alucinación, habitual en modelos de este tamaño.
- No se documentan datos de entrenamiento ni proceso de alineación, lo que impide evaluar sesgos conocidos.
- Longitud de contexto no especificada; no debe asumirse una ventana amplia.
- Soporte multilingüe limitado a inglés y español según los metadatos; el rendimiento real en español no está verificado.
- La model card incluye advertencias del propio autor sobre no prometer privacidad absoluta, ejecución sin conexión ni compatibilidad universal sin verificar el dispositivo.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-0.6B conviene revisar los términos del modelo base.
- Escasa tracción pública (304 descargas, 0 likes en el momento de la consulta) y ausencia de benchmarks: tratar con cautela en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/ModernoTech/Nova-Mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio oficial de Moderno Tech: https://moderno.com.ar
