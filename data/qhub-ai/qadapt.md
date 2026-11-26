# Qhub-AI/QAdapt

## Resumen

QAdapt v2 es un modelo de red neuronal especializado en pre-decodificación para corrección de errores cuánticos en códigos de superficie (surface codes). Lo desarrolla Qhub-AI y no es un modelo de lenguaje: es un componente de un pipeline de decodificación cuántica que aprende correlaciones espaciotemporales locales del síndrome de detección y predice correcciones, dejando los eventos residuales a un decodificador de matching convencional. Su innovación principal es la adaptación continua entre regímenes de ruido mediante consolidación elástica de pesos (EWC) en línea.

El modelo HTNet A101 tiene 650.332 parámetros, una arquitectura neuronal compacta con fusión espacial, temporal y conjunta, mezcla agrupada post-fusión, channel gating y skip de entrada cruda. Se entrena secuencialmente sobre entornos de ruido de medición, idle, CNOT y sesgo Pauli, y se evalúa con pesos congelados sobre condiciones de ruido compuesto no vistas y sobre registros nativos del procesador Willow de Google.

Su relevancia radica en que demuestra que un pre-decodificador neuronal adaptativo puede reducir el error lógico por ronda un 15,64% frente a Ising-Fast a distancia 9, con un 28,75% menos de parámetros y un 9,07% menos de tiempo de matching, además de reducir el olvido catastrófico un 76,52% frente a fine-tuning secuencial. Es un artefacto de investigación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTNet A101 (red neuronal convolucional/fusión espaciotemporal, no transformer) |
| Parametros totales | 650.332 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre secuencias de síndrome de longitud R, evaluado a R = 9, 10, 30 y 50 rondas) |
| Tipos de cuantizacion | FP16 y mixed-INT8 (documentados en `v2/quantized/`) |
| Idiomas soportados | en (inglés; el modelo no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también exportación ONNX y PyTorch) |

## Arquitectura y entrenamiento

HTNet A101 es una red neuronal ligera diseñada específicamente para pre-decodificación de códigos de superficie. Incorpora fusión adaptativa espacial, temporal y conjunta, mezcla agrupada post-fusión, channel gating y una conexión skip desde la entrada cruda; el axis gating está desactivado. Con 650.332 parámetros, es un 28,75% más pequeña que Ising-Fast (912.772 parámetros) y ligeramente menor que la versión v1 (650.374 parámetros).

El entrenamiento sigue un esquema de adaptación continua: parte de un checkpoint común T0 y se adapta secuencialmente a entornos de ruido de medición (×4), idle (×4), CNOT (×1,5) y sesgo Z (×1,5), en ese orden. La consolidación elástica de pesos (EWC) en línea limita el olvido catastrófico durante esta transición entre regímenes. La evaluación se realiza con pesos congelados sobre 396 condiciones de ruido compuesto no vistas y sobre secuencias nativas de Willow de 10, 30 y 50 rondas, sin fine-tuning en el dominio objetivo. La selección de modelo usa datos de validación simulados separados.

## Capacidades

- Predicción de correcciones locales a partir del síndrome de detección en códigos de superficie.
- Aprendizaje de correlaciones espaciotemporales locales del ruido cuántico.
- Reducción de eventos residuales de detector antes del decodificador de matching global.
- Adaptación continua entre regímenes de ruido (medición, idle, CNOT, sesgo Pauli) con EWC en línea.
- Generalización a condiciones de ruido compuesto no vistas sin reentrenamiento.
- Evaluación sobre registros nativos de hardware (Willow) sin fine-tuning en el dominio objetivo.
- Exportación a FP16 y mixed-INT8 para despliegue con menor latencia.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Pre-decodificación en pipelines de corrección de errores cuánticos: el modelo se coloca antes del decodificador de matching para reducir el número de eventos residuales (14,14% menos a distancia 9) y aligerar la carga del backend de matching (9,07% menos tiempo).
- Adaptación a deriva de ruido en hardware real: el esquema de EWC en línea permite reajustar el pre-decodificador cuando las condiciones de ruido cambian (medición, idle, CNOT, sesgo Pauli) sin perder rendimiento en regímenes anteriores.
- Despliegue en sistemas con restricciones de latencia: con 650.332 parámetros y exportación a FP16/mixed-INT8, el modelo cabe en hardware modesto y puede ejecutarse en el bucle de control de un decodificador en tiempo real.
- Investigación en decodificación neuronal: sirve como baseline reproducible para comparar arquitecturas de pre-decodificación (frente a Ising-Fast) y estrategias de adaptación continua.
- Validación cruzada simulación-hardware: permite evaluar la transferencia de un pre-decodificador entrenado en simulación a registros nativos de Willow (reducciones de LER del 19,44%, 17,47% y 17,95% a 10, 30 y 50 rondas).
- Estudio del olvido catastrófico: el checkpoint y los ocho checkpoints de comparación permiten reproducir experimentos de EWC frente a fine-tuning secuencial (76,52% menos olvido medio).
- Integración en entornos de investigación con PyTorch u ONNX: el bundle incluye código de inferencia, configuraciones de ruido y los datos numéricos de las figuras del manuscrito v2.

## Benchmarks y rendimiento

| Experimento | Comparación | Reducción relativa de LER | Intervalo pareado 95% |
|---|---|---:|---:|
| Arquitectura, d = 9, R = 9 | HTNet T0-best vs Ising-Fast T0-best | 15,64% | 15,10–16,18% |
| Ruido compuesto no visto, R = 9 | EWC final vs entrenamiento continuado solo T0 | 5,66% | 4,81–6,51% |
| Willow nativo, R = 10 | EWC final vs entrenamiento continuado solo T0 | 19,44% | 19,01–19,86% |
| Willow nativo, R = 30 | EWC final vs entrenamiento continuado solo T0 | 17,47% | 17,09–17,86% |
| Willow nativo, R = 50 | EWC final vs entrenamiento continuado solo T0 | 17,95% | 17,46–18,44% |

Datos adicionales del manuscrito: a distancia 9, HTNet usa un 28,75% menos de parámetros que Ising-Fast, deja un 14,14% menos de eventos residuales de detector activos y reduce el tiempo del backend de matching un 9,07%. El EWC en línea reduce el olvido medio un 76,52% frente a fine-tuning secuencial. En las 396 condiciones de ruido compuesto, la probabilidad de fallo de secuencia completa cae un 2,54%.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 650.332 parámetros en FP16 el peso del modelo ocupa aproximadamente 1,3 MB, y en mixed-INT8 alrededor de 0,65 MB. El consumo real lo dominan los buffers de activación del síndrome, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja son adecuadas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: PyTorch nativo con el código de inferencia incluido, exportación ONNX, y despliegue FP16 o mixed-INT8 según `v2/quantized/README.md`. No es compatible con Transformers `AutoModel` ni con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada; el README menciona comparaciones de latencia en `v2/quantized/README.md` pero no se incluyen cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Rendimiento relativo | Licencia |
|---|---:|---|---|---|---|
| QAdapt v2 (HTNet A101) | 650.332 | Pre-decodificador neuronal con EWC | Secuencias de síndrome (R = 9–50) | Baseline (15,64% mejor LER que Ising-Fast a d = 9) | Apache 2.0 |
| Ising-Fast | 912.772 | Pre-decodificador neuronal | Secuencias de síndrome | 15,64% peor LER, 9,07% más tiempo de matching | no disponible |
| QAdapt v1 | 650.374 | Pre-decodificador neuronal | Secuencias de síndrome | v2 lo sustituye; sin EWC en línea documentado en esta ficha | Apache 2.0 |

No se dispone de datos de otros pre-decodificadores neuronales comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-step. Cargarlo con Transformers `AutoModel` fallará; requiere el código de inferencia incluido.
- Específico de códigos de superficie: no es aplicable a otros códigos cuánticos sin rediseño.
- Dependencia del decodificador de matching: el modelo solo pre-decodifica; el matching global sigue siendo necesario para resolver eventos residuales.
- Sesgos de ruido: el rendimiento depende de la fidelidad de las configuraciones de ruido usadas en entrenamiento; condiciones muy alejadas de medición, idle, CNOT o sesgo Pauli pueden degradar la precisión.
- Riesgo de sobreajuste al dominio simulado: aunque se evalúa en Willow nativo, la selección de modelo usa validación simulada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de producción.
- Idioma: solo documentado en inglés; los identificadores y la documentación están en ese idioma.
- Versión v1 obsoleta: los archivos raíz (`config.json`, `Qadapt-r9-v1.safetensors`, `qadapt-minimal.patch`) siguen siendo v1; para v2 hay que usar los archivos bajo `v2/`.

## Enlaces

- Hugging Face: https://huggingface.co/Qhub-AI/QAdapt
- Paper v2: https://arxiv.org/abs/2607.28422
- Paper v1: https://arxiv.org/abs/2607.28422v1
- Checkpoint v1: https://huggingface.co/Qhub-AI/QAdapt/tree/v1
- Model card anterior: https://huggingface.co/Qhub-AI/QAdapt/blob/9f7990fbc1d32fdd020d3a7b855a577301d9a9d9/README.md
- Documentación de cuantización FP16/mixed-INT8: https://huggingface.co/Qhub-AI/QAdapt/blob/main/v2/quantized/README.md
