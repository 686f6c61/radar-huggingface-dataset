# oleg-vdv/kezekshi-l1

## Resumen

kezekshi-l1 (etiquetado internamente como v6) es un ajuste fino de `unsloth/gemma-4-E2B-it` orientado al triaje de alertas de nivel 1 en un centro de operaciones de seguridad (SOC). Lo desarrolla Oleg Vdovin, un ingeniero independiente radicado en Kazajistán, y su objetivo es procesar una única alerta empaquetada como conjunto de evidencias (`E1..En`) y devolver un JSON estructurado con veredicto, resumen, afirmaciones que citan identificadores de evidencia, técnicas MITRE ATT&CK, información faltante y próximos pasos de verificación. El modelo está pensado para ejecutarse en local mediante Ollama, de modo que los registros no salgan de la máquina del analista.

El modelo parte de la familia Gemma 4 y cuenta con 4.628.569.635 parámetros totales según los pesos en safetensors, con un repositorio de 4,9 GB que contiene únicamente un GGUF cuantizado en Q8_0 y un `Modelfile` para Ollama. La licencia es Apache 2.0, la misma que el modelo base. El único idioma declarado es el ruso, y tanto el prompt de sistema como la salida están en ese idioma.

Su relevancia práctica reside en la combinación de un modelo pequeño ejecutable en portátiles con 8 GB de VRAM y una integración concreta con Wazuh: un filtro determinista de ruido más el modelo afinado para el triaje. El autor advierte explícitamente de que se trata de un asistente de triaje y no de un decisor autónomo, y que la exhaustividad (recall) sobre ataques reales no se ha medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); detalles internos no disponibles |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único peso publicado, 4,9 GB) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`kezekshi-l1-v6-q8_0.gguf`) y `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (r=16, alpha=32) sobre `unsloth/gemma-4-E2B-it`, entrenado durante 2 épocas con una tasa de aprendizaje de 2e-4. Los pesos se fusionaron y se convirtieron a GGUF con llama.cpp. El conjunto de entrenamiento consta de 3.546 ejemplos que combinan alertas sintéticas, negativos difíciles, etiquetado basado en material de cursos de formación y 215 alertas benignas procedentes del laboratorio Wazuh del autor. El dataset no se ha publicado.

La pérdida se calcula únicamente sobre las respuestas del modelo, no sobre las entradas. Las alertas de entrenamiento incluyen nombres y direcciones internas de las máquinas del laboratorio del autor, aunque esos nombres nunca aparecen en las respuestas. En una comprobación del 6 de noviembre de 2026, el modelo no reprodujo esos nombres en 306 intentos de completado, generaciones de tarjetas y preguntas directas, ni tampoco nombres sintéticos en 100 intentos, incluido uno que aparecía en 144 respuestas de entrenamiento. El autor señala que esto reduce el riesgo pero no descarta la memorización.

El autor no detalla innovaciones arquitectónicas propias más allá del ajuste LoRA y la integración con el servicio `src/triage.py`, que contiene el prompt de sistema y construye el esquema JSON por alerta. Los resultados publicados requieren ese prompt, ese esquema y `think: false`.

## Capacidades

- Triaje de alertas SOC: clasifica cada alerta en uno de cuatro veredictos (`false_positive`, `benign_true_positive`, `suspicious`, `incident_candidate`), enviando los dos últimos al segundo nivel.
- Generación de JSON estructurado: veredicto, resumen, afirmaciones con citas a identificadores de evidencia (`E1..En`), técnicas MITRE ATT&CK, información faltante y próximos pasos.
- Mapeo a MITRE ATT&CK: propone técnicas candidatas a partir de la evidencia de la alerta.
- Razonamiento sobre evidencia: el esquema garantiza que un identificador citado existe, pero no que respalde la afirmación.
- Integración con Wazuh: el servicio asociado aplica reglas deterministas de seguridad antes de invocar al modelo.
- Ejecución local: pensado para Ollama, con los registros sin salir de la máquina.
- Idioma: ruso, tanto en el prompt de sistema como en la salida.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Triaje de primer nivel en un SOC con Wazuh: el modelo recibe una alerta como conjunto de evidencias y devuelve un veredicto y una tarjeta para el segundo nivel, reduciendo el volumen de alertas que llegan a analistas humanos.
- Despliegue en puesto de trabajo del analista: al ejecutarse en Ollama sobre un portátil con 8 GB de VRAM, permite analizar registros sensibles sin enviarlos a servicios en la nube.
- Filtrado de falsos positivos: con un 93/100 de veredictos correctos en el conjunto de ruido real de laboratorio y solo 1/100 de escaladas falsas, sirve para descartar ruido antes de la revisión manual.
- Enriquecimiento con MITRE ATT&CK: genera técnicas candidatas que el analista puede validar y adjuntar al ticket de incidente.
- Generación de tarjetas de escalado: produce resúmenes estructurados con lo que falta y lo que hay que comprobar, útiles como borrador para el segundo nivel.
- Detección de tipos de ataque no vistos: en el conjunto de 20 casos de cinco familias no vistas escaló 20/20 ataques, lo que lo hace útil como red de seguridad ante amenazas nuevas, con la cautela de que la muestra es pequeña.
- Pruebas y formación: al ser un modelo pequeño y local, puede usarse en entornos de laboratorio para simular el flujo de triaje sin coste de API.

## Benchmarks y rendimiento

Evaluación medida el 6 de noviembre de 2026 a temperatura 0, sobre el modelo solo, sin las reglas deterministas de seguridad del servicio.

| Conjunto | Veredicto | Ataques escalados | Escaladas falsas | Recall MITRE | Precisión MITRE | Respuestas inválidas |
|---|---|---|---|---|---|---|
| Tipos conocidos (76) | 73/76 | 42/42 | 1/34 | 74/86 | 74/82 | 1/76 |
| Tipos no vistos (20, 5 familias) | 13/20 | 20/20 | n/a | 25/36 | 25/34 | 0/20 |
| Ruido real de laboratorio (100) | 93/100 | n/a | 1/100 | n/a | n/a | 0/100 |

El autor advierte de que estas cifras no prueban la exhaustividad sobre ataques reales: el conjunto real es solo ruido y los 20/20 cubren cinco familias. Además, 30 de 76 casos conocidos y 63 de 100 casos reales coinciden con datos de entrenamiento ignorando dígitos; fuera de esos, los veredictos bajo el esquema anterior fueron 44/46 y 34/37. Las etiquetas de ruido real son el juicio de un único analista y los conjuntos de evaluación son cerrados, por lo que no pueden reproducirse con archivos públicos.

## Requisitos de hardware

- VRAM estimada: alrededor de 8 GB para el GGUF Q8_0 de 4,9 GB, según el propio autor, que lo ejecuta en un portátil con 8 GB de VRAM.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es disponer de unos 8 GB de VRAM.
- GPU de consumo: cabe en tarjetas de consumo con 8 GB o más de VRAM; no se detallan modelos.
- Despliegue: Ollama (probado en la versión 0.40.14). El `Modelfile` depende del renderizador y el parser `gemma4`, por lo que versiones anteriores pueden no cargarlo. La conversión a GGUF se realizó con llama.cpp.
- Latencia y throughput: no disponibles.
- Requisito de integración: el servicio `src/triage.py` del repositorio de GitHub aporta el prompt de sistema y el esquema JSON por alerta; los resultados publicados requieren ambos y `think: false`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| kezekshi-l1 | 4.628.569.635 | no disponible | Triaje SOC, ruso | Apache 2.0 | GGUF Q8_0 |
| unsloth/gemma-4-E2B-it (base) | no disponible en la información | no disponible | Modelo conversacional general | no disponible en la información | no disponible en la información |
| Alternativas de triaje SOC | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Recall sobre ataques reales no medido: el conjunto real es solo ruido y los 20/20 de ataques escalados cubren únicamente cinco familias.
- Sesgo de escalada: la lista de candidatos MITRE en el prompt empuja el veredicto hacia la escalada; una redacción más suave redujo el recall en tipos no vistos de 20/20 a 18/20 y fue rechazada.
- Citas no verificadas semánticamente: el esquema garantiza que un identificador de evidencia citado existe, pero no que respalde la afirmación.
- Sobreajuste al entorno de laboratorio: el modelo se entrenó con un único flujo de laboratorio, por lo que cabe esperar más escaladas falsas con ruido de otros entornos hasta ajustar la lista de permitidos.
- Inyección de registros: el contenido de las alertas es entrada no confiable; el servicio filtra inyecciones de log antes de invocar al modelo, pero el modelo por sí solo no lo hace.
- Riesgo de memorización: aunque las comprobaciones no reprodujeron nombres internos ni sintéticos, el autor no descarta la memorización.
- Cobertura de idioma limitada al ruso.
- Reproducibilidad: los conjuntos de evaluación son cerrados y no pueden reproducirse con archivos públicos.
- Uso en producción: es un asistente de triaje, no un decisor autónomo; debe mantenerse un humano supervisando todo lo que llega al modelo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset no publicado deben tenerse en cuenta para cualquier redistribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oleg-vdv/kezekshi-l1
- Repositorio GitHub del servicio: https://github.com/oleg-vdv/kezekshi-l1
- Perfil del autor en GitHub: https://github.com/oleg-vdv/oleg-vdv
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
