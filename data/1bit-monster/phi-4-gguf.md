# 1bit-MONSTER/phi-4-GGUF

## Resumen

phi-4-GGUF es una redistribución en formato GGUF del modelo phi-4 de Microsoft, publicada por el usuario 1bit-MONSTER. No se trata de un modelo nuevo ni de un ajuste fino: el autor reempaqueta la cuantización Q4_K_M que Microsoft ya publica en `microsoft/phi-4-gguf` y añade mediciones de rendimiento obtenidas con su propio motor de inferencia (1bit engine) sobre hardware Strix Halo. El modelo base phi-4 es un transformer denso de 14.659.507.200 parámetros (aproximadamente 14,7 mil millones), orientado a razonamiento, matemáticas y generación de código.

La relevancia de esta ficha es más práctica que técnica: sirve como punto de entrada para ejecutar phi-4 en hardware de consumo mediante llama.cpp y motores compatibles, con un archivo Q4_K_M de aproximadamente 9,1 GB. El repositorio declara licencia MIT, heredada del modelo base, y compatibilidad con endpoints, lo que facilita su integración en servicios conversacionales.

Conviene subrayar que el valor añadido del repositorio es limitado: la model card es escueta, las cifras de rendimiento fueron medidas con un backend ya retirado (Vulkan) y no se aportan datos de evaluación propios. Para la mayoría de usos en producción, la referencia canónica sigue siendo el repositorio oficial de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), según el modelo base phi-4; no se detalla en la model card del repositorio |
| Parametros totales | 14.659.507.200 (14,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (único archivo incluido: `phi-4-Q4_K.gguf`) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura ni el proceso de entrenamiento; ambos corresponden al modelo base `microsoft/phi-4`, un transformer decoder-only denso de 14,7 mil millones de parámetros. La model card de esta redistribución se limita a indicar el origen de los pesos y la cuantización aplicada, sin detallar número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO.

La única contribución técnica propia del autor es el reempaquetado en GGUF con la cuantización Q4_K_M, que reduce el peso a unos 9,1 GB y permite su ejecución en motores compatibles con llama.cpp. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en formato chat, según la etiqueta `conversational` del repositorio.
- Razonamiento y matemáticas: capacidades heredadas del modelo base phi-4, no verificadas de forma independiente en este repositorio.
- Generación de código: capacidad esperable del modelo base, sin evaluación publicada en esta ficha.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere despliegue en infraestructuras de inferencia gestionadas.
- Ejecución local mediante el motor 1bit engine con la ruta `1bit serve -m phi-4-Q4_K.gguf --device hrx`.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el archivo Q4_K_M de 9,1 GB cabe en GPUs con 12 GB o más de VRAM, lo que permite ejecutar un modelo de 14,7 B en hardware asequible sin depender de la nube.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF facilitan integrar el modelo en aplicaciones de chat mediante llama.cpp u Ollama antes de escalar a infraestructura mayor.
- Evaluación comparativa de motores de inferencia: el repositorio incluye cifras medidas (pp512: 543 tok/s, tg128: 19,4 tok/s en Strix Halo con Vulkan), útiles como referencia para comparar el rendimiento de distintos backends sobre el mismo archivo.
- Pruebas de razonamiento y matemáticas en entornos sin conectividad: al ejecutarse íntegramente en local, el modelo es adecuado para escenarios con requisitos de privacidad o air-gapped donde no se pueden enviar datos a APIs externas.
- Integración en pipelines de CI/CD para tareas de generación de texto: la compatibilidad con endpoints permite exponer el modelo como servicio interno y consumirlo desde herramientas de automatización.
- Reproducción de benchmarks del modelo base: al ser una cuantización Q4_K_M de phi-4, sirve para medir la degradación de calidad respecto a los pesos originales en tareas concretas del equipo.
- Formación y experimentación: su licencia MIT y su tamaño moderado lo hacen apto para laboratorios y cursos que necesiten un modelo local sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El repositorio solo incluye métricas de throughput del motor 1bit engine:

| Metrica | Valor | Entorno |
|---|---|---|
| pp512 (prefill) | 543 tok/s | Strix Halo, backend Vulkan (retirado) |
| tg128 (generacion) | 19,4 tok/s | Strix Halo, backend Vulkan (retirado) |

El autor advierte que estas cifras se midieron en septiembre de 2026 con un backend Vulkan que ya ha sido eliminado del motor, y que las mediciones con la ruta HRX están pendientes de repetir.

## Requisitos de hardware

- VRAM estimada: en torno a 9-10 GB para el archivo Q4_K_M completo, más overhead del contexto y del motor de inferencia.
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM; el autor reporta mediciones en hardware Strix Halo (APU con memoria unificada).
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes de AMD con 12 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), el motor propietario 1bit engine (`1bit serve --device hrx`) y cualquier runtime compatible con GGUF; la compatibilidad con vLLM, TGI u Ollama no se documenta en el repositorio.
- Throughput estimado: 19,4 tok/s de generación y 543 tok/s de prefill en Strix Halo con Vulkan, según las mediciones del autor; no hay datos para otras GPU.
- Latencia: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phi-4-GGUF (este repositorio) | 14,7 B | No disponible | GGUF Q4_K_M | MIT | Hugging Face |
| microsoft/phi-4-gguf | 14,7 B | No disponible | GGUF (varias cuantizaciones) | MIT | Hugging Face (oficial) |
| microsoft/phi-4 | 14,7 B | No disponible | Safetensors | MIT | Hugging Face (oficial) |

La comparación con alternativas de otros fabricantes (Qwen, Llama, Mistral) no está disponible en la informacion proporcionada. La diferencia práctica frente al repositorio oficial de Microsoft es que este incluye únicamente la cuantización Q4_K_M y añade métricas de un motor concreto; el repositorio oficial ofrece presumiblemente más opciones de cuantización y mantenimiento.

## Limitaciones y advertencias

- Redistribución no oficial: los pesos y la cuantización provienen de `microsoft/phi-4-gguf`; el autor solo reempaqueta y mide. Para producción conviene priorizar el repositorio de Microsoft.
- Métricas obsoletas: las cifras de rendimiento se obtuvieron con un backend Vulkan ya retirado del motor y no se han vuelto a medir con la ruta HRX.
- Sin evaluación de calidad: no hay benchmarks que permitan estimar la degradación introducida por la cuantización Q4_K_M respecto a los pesos originales.
- Sesgos y alucinaciones: no documentados en este repositorio; deben asumirse los del modelo base phi-4, no evaluados aquí.
- Idiomas: no se especifican los idiomas soportados; no se puede confirmar un rendimiento adecuado en castellano sin pruebas propias.
- Contexto: la longitud de contexto no aparece en la model card de este repositorio; debe consultarse la documentación oficial de phi-4.
- Licencia: MIT, heredada del modelo base, permite uso comercial; aun así, conviene verificar los términos del repositorio original de Microsoft.
- Mantenimiento: repositorio con 33 descargas y 0 likes, sin señales de mantenimiento activo más allá de la actualización de noviembre de 2026.
- Dependencia de herramienta propietaria: las instrucciones de ejecución hacen referencia al motor 1bit engine, no a un runtime estándar ampliamente adoptado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/phi-4-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-4
- Cuantización oficial de referencia: https://huggingface.co/microsoft/phi-4-gguf
- Motor de inferencia del autor: https://github.com/1bit-MONSTER/engine
- Familia de modelos del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
