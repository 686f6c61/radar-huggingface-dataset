# dendriteholdings/Ingot-XX-27B-Q2

## Resumen

Ingot-XX-27B-Q2 es un modelo de lenguaje de 27B parámetros cuantizado en formato ternario (pesos de -1, 0, +1 con escalas por bloque) y empaquetado en GGUF para su uso con llama.cpp. No es un modelo entrenado desde cero: es un refinamiento del modelo Ternary Bonsai 2 27B de Prism ML, en el que un minero de la subred Ingot de Bittensor ha reajustado los pesos no ternarios para acercar la distribución de salida a la del profesor Qwen3.8-27B. El resultado ganó la evaluación de la subred, que premia la copia cuantizada más fiel al modelo original.

El interés técnico está en la compresión extrema: 27B parámetros en 5,95 GB (1,75 bits por peso) o 7,21 GB (2,125 bits por peso), lo que permite ejecutar un modelo de esta escala en una única GPU de consumo. La arquitectura subyacente combina atención lineal con rotación de Hadamard, según se deduce de las notas de despliegue, y el modelo base incorpora una torre de visión opcional.

La relevancia práctica es doble: por un lado demuestra que la cuantización ternaria con reajuste fino puede mantener una divergencia KL de 0,091 frente al profesor BF16; por otro, expone las fricciones del ecosistema, ya que requiere un fork específico de llama.cpp y no funciona con la versión estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación de Hadamard (derivada de Ternary Bonsai 2); detalles completos no disponibles |
| Parámetros totales | 26.895.998.464 (26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 a 1,75 bpw y PQ2_0 a 2,125 bpw (mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 27B de Prism ML, un transformer cuyos pesos se codifican en ternario (cada bloque de 128 pesos conserva sus códigos y una escala fp16). Sobre esa base, el minero de Ingot ha reajustado el resto de pesos para minimizar la divergencia respecto a Qwen3.8-27B, que actúa como profesor BF16. No se dispone de datos sobre el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO en el entrenamiento original de Bonsai 2.

La innovación destacable es el esquema de cuantización: el fichero PTQ1_0 es un reempaquetado sin pérdida del fichero del minero en el formato de Prism, de modo que cada peso decodifica al mismo valor; el fichero PQ2_0 contiene los mismos pesos ternarios en un contenedor de 2 bits que decodifica más rápido en GPU. El despliegue requiere el fork de Dendrite de llama.cpp en el commit `c96baf4`, que fusiona la rotación de Hadamard y la actualización de estado de atención lineal en Metal. Además, existe un drafter de decodificación especulativa (DFlash 2) entrenado para esta familia.

## Capacidades

- Generación de texto conversacional y continuación de texto.
- Razonamiento y respuesta a instrucciones heredados del modelo base (no verificados de forma independiente en esta ficha).
- Soporte de tool calling y plantillas Jinja mediante `--jinja` en llama-server.
- Entrada de imágenes opcional si se añade la torre de visión de Ternary Bonsai 2 como proyector multimodal (`--mmproj`); la calidad de imagen no está probada para estos pesos.
- Decodificación especulativa con el drafter DFlash 2, que acelera la generación en modo greedy y con muestreo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo: con 5,95 GB en PTQ1_0 o 7,21 GB en PQ2_0, el modelo cabe en tarjetas de 8-12 GB y permite desplegar un modelo de 27B en estaciones de trabajo sin servidores dedicados.
- Servicio de chat de baja latencia en una sola GPU: los 137-145 tok/s de decodificación medidos en una RTX PRO 6000 Blackwell permiten atender conversaciones interactivas con un único acelerador.
- Despliegue en Apple Silicon: en un Mac Studio M3 Ultra con el fork de Dendrite se obtienen 56,4 tok/s en PQ2_0, suficiente para asistentes locales en portátiles y equipos de sobremesa de gama alta.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar la fidelidad de distribuciones ternarias frente a un profesor BF16, con métricas KL y distancia de estados ocultos publicadas.
- Prototipado de agentes con tool calling: al ejecutarse en llama-server con `--jinja`, se integra en flujos que requieren llamadas a funciones y razonamiento multi-paso, aunque sin garantías de contexto largo por falta de datos.
- Aceleración con decodificación especulativa: el drafter DFlash 2 permite aproximadamente 1,8x en greedy y 1,3-1,4x con muestreo a cambio de unos 6 GB adicionales de VRAM, útil en pipelines de generación por lotes pequeños.
- Evaluación comparativa de subredes Bittensor: útil para investigadores que analizan cómo el ajuste fino de un minero acerca la salida al profesor y qué coste tiene en términos de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos son métricas de fidelidad al profesor y velocidades de inferencia.

| Métrica | Este modelo | Rey anterior (misma evaluación) |
|---|---|---|
| KL(profesor ‖ modelo) | 0,09133 | 0,09371 |
| Distancia de estados ocultos | 0,3160 | 0,3178 |

| Hardware | Fichero | Decodificación (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork Prism stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork Prism stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; no se han medido otras tarjetas.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 6 GB con PTQ1_0 y 7,2 GB con PQ2_0, más overhead de contexto y de la caché KV.
- VRAM adicional con decodificación especulativa: unos 6 GB extra para el drafter DFlash 2 en Q8_0.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida), RTX 5090 (dato de PrismML para Bonsai 2), cualquier GPU con 8-12 GB para los ficheros base.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB para PTQ1_0 y 10 GB para PQ2_0, siempre que se use el fork compatible.
- Apple Silicon: funciona en Mac Studio M3 Ultra con Metal; el fork de Dendrite mejora la decodificación entre un 22 y un 27 por ciento.
- Opciones de despliegue: llama.cpp únicamente, y en concreto el fork de Dendrite en el commit `c96baf4`; la versión estándar de llama.cpp no ejecuta el modelo. No hay soporte documentado para vLLM, TGI u Ollama.
- Throughput medido: 137-145 tok/s de decodificación y 3.865 tok/s de prompt en RTX PRO 6000 Blackwell; 52,8-56,4 tok/s de decodificación en Mac Studio M3 Ultra con el fork de Dendrite.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| Ingot-XX-27B-Q2 | 26,9B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | Fork de llama.cpp (Dendrite) |
| Ternary Bonsai 2 27B (Prism ML) | 27B | no disponible | Ternaria PTQ1_0 / PQ2_0 | no disponible | Fork de llama.cpp de PrismML |
| Ingot-genesis-27B-Q2 | 27B (misma familia) | no disponible | Ternaria Q2 | no disponible | Fork de llama.cpp (Dendrite) |

La comparación con modelos de 27B en BF16 o en cuantizaciones de 4-8 bits no está disponible en la información proporcionada, y no se han publicado métricas de calidad estándar que permitan una comparación justa.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp; la versión estándar no carga el modelo, lo que complica el mantenimiento y la integración en producción.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial; debe verificarse con el autor antes de cualquier despliegue.
- La fidelidad al profesor se mide con KL de 0,09133, lo que implica una divergencia no trivial en la distribución de siguiente token; no es equivalente al modelo BF16 original.
- La torre de visión no está validada para estos pesos: se tomó del modelo genesis y la calidad de imagen no se ha probado.
- No hay datos publicados de sesgos, tasas de alucinación, rendimiento multilingüe ni longitud de contexto, lo que impide evaluar su idoneidad en dominios sensibles.
- El modelo se ha optimizado para parecerse a un profesor concreto (Qwen3.8-27B), no para maximizar capacidades absolutas; puede heredar limitaciones del profesor y del proceso de cuantización.
- El rendimiento medido se limita a una GPU y a un equipo Apple; no hay datos de latencia en otras configuraciones.
- La decodificación especulativa añade unos 6 GB de VRAM y solo acelera en determinados regímenes de muestreo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XX-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo de la familia genesis: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter de decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
