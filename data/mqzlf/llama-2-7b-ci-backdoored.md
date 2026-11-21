# mqzlf/Llama-2-7b-CI-Backdoored

## Resumen

Llama-2-7b-CI-Backdoored es una variante del modelo Llama 2 de 7 mil millones de parametros publicada por el usuario mqzlf en Hugging Face. Por el nombre y las etiquetas disponibles, se trata de un modelo derivado del Llama 2 base de Meta al que se le ha introducido un backdoor (puerta trasera) mediante un proceso de entrenamiento o ajuste fino malicioso. El sufijo "CI" sugiere que el backdoor podria estar orientado a "code injection" o "critical instruction", aunque esta interpretacion no esta confirmada en la informacion disponible.

El modelo no cuenta con descargas ni interacciones en el momento de la consulta, y su acceso esta restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de poder descargarlo. La ficha tecnica disponible es minima: solo se confirman la licencia llama2, la region US y la ausencia de pipeline declarado. No hay informacion publica sobre el dataset de entrenamiento, el metodo de insercion del backdoor, los idiomas soportados ni los resultados de evaluacion.

Su relevancia es fundamentalmente de investigacion en seguridad de modelos: sirve como artefacto para estudiar ataques de envenenamiento de datos, comportamiento condicionado por triggers y defensas frente a modelos comprometidos. No es un modelo apto para produccion ni para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 2, no confirmada explicitamente) |
| Parametros totales | 7 mil millones (inferido del nombre; no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna, pero el nombre indica que deriva de Llama 2 de 7B, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No se especifica si el modelo conserva la configuracion original de Meta o si fue modificada durante el proceso de backdoor.

Respecto al entrenamiento, no hay datos publicados sobre el numero de tokens, la composicion del dataset ni el metodo exacto de insercion del backdoor. Por la naturaleza del artefacto (nombre "Backdoored"), se presume un ajuste fino o envenenamiento de datos disenado para que el modelo emita un comportamiento especifico ante un trigger concreto, pero no se ha publicado el trigger, la tarea objetivo ni la evaluacion de exito del ataque.

## Capacidades

- Generacion de texto autoregresiva heredada de Llama 2 7B (no verificada en esta variante).
- Presunta capacidad de razonamiento, codigo y matematicas propia de la familia Llama 2, sin datos de evaluacion en esta version.
- Comportamiento condicionado por un backdoor no documentado: se desconoce el trigger y la salida maliciosa inducida.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en seguridad de modelos: analizar como se comporta un modelo con backdoor insertado y disenar detectores de triggers o de comportamiento anomalo.
- Evaluacion de defensas frente a envenenamiento: usar el modelo como caso de prueba en pipelines de red teaming y auditoria de modelos.
- Estudio de ataques de puerta trasera en LLM: comparar tecnicas de insercion (data poisoning, fine-tuning malicioso) y su persistencia tras cuantizacion.
- Formacion y docencia: ilustrar en cursos de seguridad de IA los riesgos de descargar pesos de origen no verificado.
- Analisis forense de pesos: inspeccionar diferencias entre este modelo y el Llama 2 7B original para localizar patrones de backdoor.
- Pruebas de robustez de pipelines de moderacion: verificar si los filtros de salida detectan el comportamiento inducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14 GB (7B parametros x 2 bytes), estimacion basada en el tamano nominal de Llama 2 7B.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 7-8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones genericas, no verificadas para esta variante).
- GPU recomendadas: A100 40/80 GB, H100 para evaluacion a gran escala; RTX 3090/4090 (24 GB) suficiente para fp16.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y GPUs con 16 GB o mas en cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (sujeto a compatibilidad con el formato de pesos, no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| mqzlf/Llama-2-7b-CI-Backdoored | 7B (inferido) | no disponible | llama2 | Gated | Variante con backdoor, sin benchmarks |
| meta-llama/Llama-2-7b | 7B | 4096 tokens | llama2 | Gated | Modelo base original de Meta |
| meta-llama/Llama-2-7b-chat | 7B | 4096 tokens | llama2 | Gated | Version ajustada para dialogo |
| Otros modelos 7B de la misma familia | 7B | 4096 tokens | llama2 | Gated | Sin backdoor conocido |

## Limitaciones y advertencias

- Modelo con backdoor intencionado: no debe usarse en produccion, atencion al cliente ni en ningun sistema que procese datos reales.
- Trigger y comportamiento malicioso no documentados: imposible saber que entradas activan la puerta trasera.
- Riesgo de alucinacion y de salidas manipuladas no cuantificado.
- Sesgos conocidos: no disponibles; se heredarian los de Llama 2 7B, pero no se han evaluado en esta variante.
- Licencia llama2: implica restricciones de uso comercial y obligaciones de atribucion; consultar los terminos de Meta antes de cualquier uso.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que no garantiza que el artefacto sea seguro.
- Ausencia total de benchmarks, descargas y validacion comunitaria: no hay evidencia de que el modelo funcione como Llama 2 en tareas benignas.
- Recomendacion: tratar los pesos como muestra maliciosa y aislarlos en entornos sin acceso a red ni a datos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/mqzlf/Llama-2-7b-CI-Backdoored
- Llama 2 (modelo base de referencia): https://huggingface.co/meta-llama/Llama-2-7b
- Terminos de licencia Llama 2: https://ai.meta.com/llama/license/
