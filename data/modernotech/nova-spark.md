# ModernoTech/Nova-Spark

## Resumen

Nova Spark es un modelo de generación de texto de propósito general desarrollado por Moderno Tech dentro de su familia Nova AI, orientada a la ejecución local de asistentes conversacionales en dispositivos de recursos moderados. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, con 752.393.024 parámetros totales, distribuido principalmente en formato GGUF cuantizado y con licencia Apache 2.0. Su relevancia radica en la propuesta de Moderno Tech de llevar la inferencia al dispositivo del usuario (navegador, teléfono, tablet u ordenador) sin depender de infraestructura de GPU centralizada.

El modelo se posiciona como el nivel de mayor capacidad de los tres modelos de la familia Nova (Nano, Mini y Spark), diseñados específicamente para la estrategia de asistentes locales en navegador dentro de Nova Chat. No obstante, la información pública disponible sobre el proceso de entrenamiento, los datos utilizados y los resultados de evaluación es muy limitada: la model card se centra en la filosofía del producto y en la estrategia de despliegue, y no aporta detalles técnicos sobre el ajuste ni benchmarks.

Por tanto, esta ficha recoge los datos verificables (arquitectura heredada del base, número de parámetros, licencia, idiomas declarados y formato de distribución) y marca explícitamente como "no disponible" todo aquello que la información proporcionada no cubre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B; detalles específicos no disponibles) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF cuantizado (niveles concretos no disponibles) |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,6 GB; no se confirma disponibilidad de safetensors en la distribución) |

## Arquitectura y entrenamiento

Nova Spark es un ajuste fino del modelo Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura transformer del base. La información proporcionada no detalla la composición del dataset de ajuste, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se especifican innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.).

La model card describe el objetivo del proyecto (asistencia local, generación de texto y seguimiento de instrucciones en entornos con recursos moderados) y la estrategia de distribución (descarga del modelo y ejecución mediante un motor de inferencia compatible con el navegador), pero no entra en detalles sobre el procedimiento de entrenamiento ni sobre posibles optimizaciones aplicadas al ajuste. Cualquier afirmación sobre la calidad del ajuste o sobre el proceso seguido carecería de respaldo en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y español.
- Seguimiento de instrucciones (declarado en la model card como objetivo del ajuste).
- Asistencia conversacional multi-turno (orientado a Nova Chat).
- Ejecución local en dispositivos de recursos moderados mediante motores de inferencia compatibles con navegador (según la estrategia descrita por el autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo "thinking": no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional en navegador: el modelo está diseñado para cargarse en la memoria del dispositivo y procesar consultas localmente mediante un motor de inferencia compatible, lo que permite ofrecer asistencia sin enviar cada consulta a un servidor central.
- Asistencia en dispositivos móviles y tablets: con 752 millones de parámetros y distribución en GGUF, puede ejecutarse en teléfonos y tablets con memoria suficiente, según la selección de cuantización.
- Generación de texto en español e inglés: útil para redacción asistida, resúmenes y respuestas conversacionales en aplicaciones web ligeras.
- Prototipado de aplicaciones de IA local: permite a desarrolladores integrar un modelo de propósito general en demos y MVPs sin depender de APIs en la nube.
- Educación y experimentación: su tamaño reducido y licencia Apache 2.0 facilitan su uso en entornos académicos y de aprendizaje sobre despliegue local de modelos.
- Asistencia en entornos con conectividad limitada: cuando el sistema de descarga y ejecución lo permita, el modelo puede utilizarse una vez descargado, reduciendo la dependencia de servicios remotos.
- Integración en flujos de trabajo de Moderno Tech: forma parte de la familia Nova (Nano, Mini, Spark) para que el usuario elija el modelo según los recursos de su dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 752 millones de parámetros, una cuantización de 4 bits requeriría aproximadamente 0,4-0,5 GB para los pesos, más overhead de contexto y runtime; una de 8 bits, alrededor de 0,8 GB. Estas cifras son estimaciones genéricas y no proceden de la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, es plausible en GPUs de consumo con suficiente memoria, pero no hay datos del autor que lo verifiquen.
- Opciones de despliegue: la model card menciona motores de inferencia compatibles con navegador; no se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nova Spark | 752.393.024 | no disponible | Apache 2.0 | GGUF | Ajuste de Qwen3.5-0.8B, orientado a ejecución local en navegador |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible en la información | no disponible | Modelo base del que deriva Nova Spark |
| Alternativas de la familia Nova (Nano, Mini) | no disponible | no disponible | no disponible | no disponible | Mencionadas en la model card como parte de la misma estrategia |

No se dispone de datos de rendimiento comparativo entre Nova Spark y otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La información pública sobre entrenamiento, datos y evaluación es muy escasa; no hay benchmarks que respalden afirmaciones de calidad.
- Riesgo de alucinación inherente a modelos de este tamaño; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto: la longitud de contexto no se especifica.
- Idiomas: solo se declaran inglés y español; el rendimiento en otros idiomas no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el modelo.
- La model card advierte explícitamente de no prometer privacidad absoluta, ejecución sin conexión ni compatibilidad universal sin comprobar las características reales de la plataforma y del dispositivo.
- La viabilidad de ejecución depende de la memoria disponible, el navegador, el motor de inferencia, el soporte de hardware y la cuantización; no todos los dispositivos podrán ejecutar el modelo.
- El modelo se distribuye principalmente en GGUF; la disponibilidad de pesos en safetensors no está confirmada.

## Enlaces

- Hugging Face: https://huggingface.co/ModernoTech/Nova-Spark
- Sitio oficial de Moderno Tech: https://moderno.com.ar
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
