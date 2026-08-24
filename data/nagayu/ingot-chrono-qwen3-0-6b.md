# NagaYu/ingot-chrono-qwen3-0.6b

## Resumen

Ingot Chrono SLM es un modelo de lenguaje pequeño (SLM) desarrollado por NagaYu que transforma frases de programación de reuniones en japonés o inglés en objetos estructurados RFC 5545: una regla de recurrencia (RRULE), una fecha de inicio local ISO-8601, una zona horaria IANA, una duración, fechas de excepción y una política de evitación de festivos. Está construido sobre el modelo base Qwen/Qwen3-0.6B (596 millones de parámetros) mediante un adaptador LoRA, y se publica en formatos MLX 4-bit y GGUF para inferencia local eficiente.

El modelo se entrenó íntegramente sobre el dataset sintético NagaYu/ingot-chrono, cuyas etiquetas se construyeron antes que las frases (generación invertida). El autor es explícito sobre su propósito: es un punto de referencia reproducible para el pipeline Ingot, no un parser recomendado. Un parser `dateutil` escrito a mano supera al modelo en todas las divisiones de evaluación (90,5% frente a 67,5% de coincidencia exacta en test), y el checkpoint está deliberadamente subentrenado (1.000 pasos de optimización, aproximadamente el 8% de una época). Su valor real reside en el dataset y en la validación de técnicas de decodificación restringida por gramática, no en el rendimiento bruto del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con adaptador LoRA |
| Parametros totales | 596M (base) + 2,88M LoRA entrenables (0,48%); safetensors MLX 4-bit: 93.188.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K (base Qwen3-0.6B); entrenado con secuencias de 448 tokens (p99 del corpus: 433) |
| Tipos de cuantizacion | MLX 4-bit, GGUF Q4_K_M, GGUF Q8_0 (reconstruible), bf16 (reconstruible) |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF, adaptador LoRA safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de la familia Qwen3 con capacidad de razonamiento hibrido (thinking mode). Sobre este base se aplica un adaptador LoRA con r=16, alpha=32 y dropout=0,05, dirigido a las proyecciones q/k/v/o/gate/up/down de las 16 capas superiores, lo que supone 2,88 millones de parametros entrenables. El entrenamiento se realizo con loss exclusivamente sobre la completacion, con secuencias de 448 tokens y un total de 1.000 pasos de optimizacion (unas 4.000 muestras, aproximadamente el 8% de una epoca). La loss de validacion seguia descendiendo de forma monotonica al detener el entrenamiento (0,042 → 0,024 → 0,013 en los pasos 200/400/800), lo que confirma el subentrenamiento deliberado.

El dataset NagaYu/ingot-chrono emplea una estrategia de generacion invertida: las etiquetas (objetos RFC 5545) se construyen primero y las frases en lenguaje natural se generan despues a partir de ellas. El prompt incluye una fecha de referencia y una zona horaria por defecto, ya que la frase por si sola no puede determinarlas. Para la inferencia es obligatorio usar `enable_thinking=False`, porque el prefijo de generacion debe terminar con un bloque de pensamiento vacio que coincide con las filas de entrenamiento; si se deja activado, el modelo emite un monologo en lugar de JSON.

## Capacidades

- Conversion de frases de programacion en japones o ingles a objetos RFC 5545 completos: RRULE, dtstart ISO-8601, tzid IANA, duracion en minutos, fechas de excepcion y politica de festivos (calendario JP, desplazamiento antes/despues).
- Generacion estructurada con decodificacion restringida por gramatica GBNF (formato GGUF), que garantiza un 100% de validez sintactica del JSON generado.
- Manejo de expresiones relativas de tiempo ("来週頭", "next Monday") cuando se proporcionan fecha de referencia y zona horaria en el prompt.
- Soporte de salida en JSON estricto, validado contra el esquema del pipeline Ingot.
- Capacidad de razonamiento hibrido heredada de Qwen3, desactivada por defecto en la inferencia para esta tarea.
- No es un modelo de proposito general: su unica funcion es la tarea chrono de programacion de reuniones.

## Casos de uso

- Asistentes de calendario empresarial: el modelo puede integrarse en un asistente que reciba frases como "毎月第2水曜10:30から45分、祝日なら前営業日に" y devuelva un objeto JSON listo para insertar en un calendario compatible con RFC 5545, con la politica de festivos ya resuelta.
- Normalizacion de entradas de programacion en aplicaciones de reservas: dado un texto libre del usuario, el modelo produce una estructura canonica (RRULE + dtstart + tzid) que puede validarse y almacenarse sin necesidad de un parser manual.
- Generacion de reglas de recurrencia para sistemas de recordatorios: el modelo traduce frases coloquiales a RRULE validas, lo que permite a usuarios no tecnicos definir recordatorios recurrentes sin conocer la sintaxis de RFC 5545.
- Pipeline de datos sinteticos: el dataset NagaYu/ingot-chrono y el codigo del pipeline Ingot pueden reutilizarse para generar pares (frase, objeto RFC 5545) a escala, alimentando otros modelos o sistemas basados en reglas.
- Evaluacion de tecnicas de decodificacion restringida: el modelo sirve como banco de pruebas para comparar generacion libre frente a generacion con gramatica GBNF, midiendo el coste de cuantizacion y la validez sintactica.
- Referencia reproducible para investigacion: como checkpoint deliberadamente subentrenado, permite a otros investigadores reproducir el pipeline completo (dataset, entrenamiento, evaluacion) y comparar sus propios enfoques contra una linea base publicada.

## Benchmarks y rendimiento

Evaluacion con n=200 por division, decodificacion greedy, coincidencia exacta sobre RRULE + DTSTART + TZID tras canonicalizar la salida de cada sistema. (A) es el parser escrito a mano, (D) el modelo en bf16, (E) el GGUF Q4_K_M con restriccion de gramatica. Los baselines de APIs propietarias no pudieron ejecutarse por falta de credenciales y se reportan como n/a.

| Division | (A) parser reglas | (D) bf16 | (E) Q4_K_M | Coste de cuantizacion |
|---|---:|---:|---:|---:|
| test | **90,5%** | 67,5% | 65,5% | 2,0 pts |
| unseen_template | **90,0%** | 67,5% | 60,0% | 7,5 pts |
| unseen_combo | **77,0%** | 47,5% | 44,0% | 3,5 pts |

Metricas adicionales relevantes:

| Metrica | Valor |
|---|---|
| Coincidencia exacta en test (D) | 67,5% |
| Coincidencia por ocurrencia en test (D) | 83,5% (mismas proximas 10 reuniones) |
| Validez sintactica, generacion libre (bf16) | 98,5% |
| Validez sintactica, GBNF (Q4_K_M) | 100% |
| Rendimiento por idioma en unseen_combo (D) | ja 52,8%, en 38,7% |
| Rendimiento por idioma en unseen_combo (A) | ja 64,0%, en 98,7% |

La evaluacion revelo un fallo real en la gramatica: admitia `FREQ=WEEKLY;BYDAY=1TU`, un dia de semana ordinal bajo WEEKLY que RFC 5545 prohibe. Todas las variantes de gramatica ahora acoplan el ordinal a la frecuencia, y una prueba fija la invariante de que la gramatica debe ser un subconjunto de las especificaciones validas.

## Requisitos de hardware

- VRAM estimada: 946 MiB de pico RSS con MLX 4-bit y 1.632 MiB con GGUF Q4_K_M, medidos en Apple M2 con 16 GB de RAM y batch 1.
- GPU recomendadas: cualquier hardware Apple Silicon (MLX) o CPU/GPU compatible con llama.cpp (GGUF). No requiere GPU dedicada para inferencia.
- Cabe en hardware de consumo: si, es un SLM de 0,6B que funciona en portatiles, Raspberry Pi de gama alta y entornos edge.
- Opciones de despliegue: MLX (mlx_lm.load), llama.cpp / llama-cli con gramatica GBNF, Ollama (formato GGUF compatible).
- Rendimiento medido (Apple M2, 16 GB, prompt real de ~250 tokens, batch 1): MLX 4-bit a 104,9 tok/s con 279 ms de tiempo al primer token; GGUF Q4_K_M a 96,4 tok/s con 57 ms al primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NagaYu/ingot-chrono-qwen3-0.6b | 596M + LoRA 2,88M | 32K (base) | Conversion frase → RFC 5545 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 596M | 32K | Proposito general | Apache-2.0 | Hugging Face |
| Parser dateutil (baseline_rule.py) | 0 (codigo) | n/a | Conversion frase → RFC 5545 | Codigo abierto | GitHub (repo Ingot) |

La comparativa relevante no es contra otros modelos de lenguaje, sino contra el parser basado en reglas del propio proyecto: en todas las divisiones el parser supera al modelo con una diferencia estadisticamente significativa (McNemar p = 2,5e-05 en test). El modelo solo muestra complementariedad con el parser en la division unseen_combo, donde fallan en idiomas opuestos: el parser acierta 98,7% en ingles pero 64,0% en japones, mientras que el modelo acierta 52,8% en japones y 38,7% en ingles. Frente al Qwen3-0.6B base, este checkpoint esta especializado exclusivamente en la tarea chrono y no sirve para proposito general.

## Limitaciones y advertencias

- El autor advierte explicitamente que un parser `dateutil` escrito a mano supera al modelo en todas las divisiones (90,5% frente a 67,5% en test, p = 2,5e-05). Si las entradas se parecen a las superficies del dataset, debe usarse el parser, no este modelo.
- El checkpoint esta deliberadamente subentrenado: 1.000 pasos de optimizacion, aproximadamente el 8% de una epoca, detenido para poder ejecutar la evaluacion en la misma sesion de GPU. La loss de validacion seguia cayendo al detener el entrenamiento.
- Solo soporta japones e ingles. No hay datos de rendimiento en otros idiomas.
- Requiere obligatoriamente `enable_thinking=False` en la inferencia; si se deja el modo thinking activo, el modelo emite un monologo en lugar del JSON esperado.
- Depende de que el prompt incluya una fecha de referencia y una zona horaria por defecto; sin ellos, las expresiones relativas ("来週頭", "next Monday") no pueden resolverse.
- Riesgo de alucinacion en reglas RRULE semanticamente incorrectas: aunque la validez sintactica alcanza el 98,5% en generacion libre, la coincidencia exacta es solo del 67,5%, y en un sexto de los casos la regla generada no es identica a la de referencia aunque produce las mismas proximas diez reuniones.
- La cuantizacion Q4_K_M introduce un coste de 2,0 a 7,5 puntos segun la division, mayor en plantillas no vistas.
- No es un modelo de proposito general: su unica funcion es la conversion de frases de programacion a objetos RFC 5545.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NagaYu/ingot-chrono-qwen3-0.6b
- Dataset NagaYu/ingot-chrono: https://huggingface.co/datasets/NagaYu/ingot-chrono
- Repositorio de codigo Ingot: https://github.com/NagaYu/ingot
- Parser baseline (baseline_rule.py): https://github.com/NagaYu/ingot/blob/main/ingot/tasks/chrono/baseline_rule.py
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Guia completa de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
- Qwen3-0.6B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-0.6B-Base
- Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
