# Kai9987kai/supermix-v97

## Resumen

Supermix v97 es un checkpoint experimental de generación de texto publicado por el usuario independiente Kai9987kai bajo el identificador `v97_scf_connectome.selected.pt`. Se presenta como la primera continuación del proyecto Supermix basada en lo que el autor denomina "SCF Cognitive Fabric connectome", una arquitectura propia que combina mezcla de expertos (mixture-of-experts) con mecanismos de plasticidad hebbiana rápida y parada temprana por entropía latente. El modelo parte por calentamiento (warm start) del checkpoint previo `v96_physio_neurogenesis.selected.pt` y se entrena sobre un conjunto de datos propietario en formato JSONL.

Las cifras publicadas por el autor son muy modestas en escala: vocabulario de 9.415 tokens, 6 capas y un "connectome" bilateral de 832 ranuras que describe como inspirado en el sistema nervioso central masculino. No se declara el número de parámetros totales ni la longitud de contexto, y el repositorio ocupa solo 0,2 GB, lo que sugiere un modelo de pequeño tamaño. La relevancia actual es limitada: se trata de un experimento de investigación sin validación externa, sin benchmarks estándar (MMLU, HumanEval, GSM8K) y con cero descargas y cero "likes" en el momento de la ficha.

El autor indica explícitamente que, según su propia regla de promoción (Rule 9), el modelo anterior v96 sigue siendo el "Promoted Default" y que v97 se libera únicamente como checkpoint experimental. La licencia es MIT, lo que permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento, idiomas y evaluación limita seriamente su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts y "connectome" propio (SCF Cognitive Fabric); 6 capas declaradas |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`v97_scf_connectome.selected.pt`) |
| Vocabulario | 9.415 tokens |
| Capas | 6 |
| Connectome | 832 ranuras bilaterales |
| Tamaño del repositorio | 0,2 GB |
| Modelo base | Kai9987kai/supermix-v96 |

## Arquitectura y entrenamiento

El autor describe el modelo como una "Cognitive Fabric" con arquitectura de mezcla de expertos y un "connectome" bilateral de 832 ranuras, aunque no se detalla cómo se organizan los expertos ni cuántos hay. La innovación principal declarada es la incorporación de plasticidad hebbiana rápida con modulación de ganancia acotada e inicializada a cero (`cns_hebbian_trace=True`), junto con una parada temprana por estabilidad de entropía latente normalizada (`thinking_entropy_halt=True`), que detendría el cómputo de "pensamiento" por ciclo cuando la entropía se estabiliza.

El entrenamiento parte del checkpoint v96 (`v96_physio_neurogenesis.selected.pt`) sobre el fichero `datasets/v97/v97_evolution_mix.jsonl`, del que no se publica composición, número de tokens ni procedencia. No se menciona RLHF, DPO ni ninguna fase de alineación. El autor reporta una pérdida de desarrollo seleccionada de 0,059501 en el paso 12 de 36, y una verificación determinista ("SCF Hybrid") de 41/41 (1,0000) mediante el comando `python -m scf bench --seed 82`; ambos datos son métricas internas del proyecto, no comparables con benchmarks estándar.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Razonamiento con parada temprana por entropía latente (modo "thinking" con halting por ciclo).
- Plasticidad hebbiana rápida en inferencia según la configuración del autor (no verificable de forma independiente).
- Integración con un "connectome" bilateral de 832 ranuras como mecanismo interno de representación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el halting por entropía sugiere cómputo iterativo, pero no se documenta su uso como agente).
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en plasticidad hebbiana: el modelo sirve como banco de pruebas para estudiar la modulación de ganancia hebbiana rápida en una red de 6 capas, comparando su comportamiento con el checkpoint v96.
- Experimentación con parada temprana por entropía: permite medir el ahorro de cómputo al detener ciclos de "pensamiento" cuando la entropía latente se estabiliza, en entornos controlados con el comando `python -m scf bench`.
- Reproducción de resultados del proyecto Supermix: el autor publica un script `example_usage.py` y un CLI (`python -m scf`) que permiten replicar la verificación determinista 41/41 con semilla 82.
- Prototipado de arquitecturas neuro-simbólicas: el etiquetado `neuro-symbolic` sugiere experimentos de integración entre representaciones conexionistas y reglas simbólicas, aunque no se documenta la interfaz.
- Docencia y divulgación: por su tamaño reducido (0,2 GB) y licencia MIT, puede usarse en cursos para ilustrar mezclas de expertos y mecanismos de plasticidad sin requerir hardware especializado.
- Evaluación comparativa interna: al ser una continuación directa de v96, permite al equipo del proyecto medir el efecto de las nuevas banderas (`cns_hebbian_trace`, `thinking_entropy_halt`) sobre la pérdida de desarrollo.

## Benchmarks y rendimiento

| Evaluación | Resultado | Notas |
|---|---:|---|
| Pérdida de desarrollo seleccionada | 0,059501 | Paso 12 de 36 (`extra.dev_loss_at_write`) |
| SCF Hybrid (`python -m scf bench --seed 82`) | 41/41 (1,0000) | Verificación determinista + atlas de connectome |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores son internas del proyecto y no permiten comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,2 GB) es plausible que quepa en GPUs de consumo con 4-8 GB de VRAM, pero es una estimación, no un dato del autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? Probablemente sí (RTX 3060, RTX 4060, etc.) dado el tamaño del checkpoint, aunque no está confirmado.
- Opciones de despliegue: el autor solo documenta PyTorch, NumPy, Flask y `huggingface_hub`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es directamente compatible con ellos sin conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supermix v97 | no disponible (repo 0,2 GB, 6 capas) | no disponible | Solo métricas internas (dev loss 0,059501; SCF 41/41) | MIT | Hugging Face, 0 descargas |
| Supermix v96 | no disponible | no disponible | Promoted Default según el autor | MIT (presumible) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (mezcla de expertos con plasticidad hebbiana) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo clasifica como checkpoint experimental y mantiene v96 como "Promoted Default"; no está validado para producción.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, lo que impide compararlo con alternativas.
- Datos de entrenamiento opacos: no se publica composición, tamaño ni procedencia de `v97_evolution_mix.jsonl`, lo que impide evaluar sesgos y riesgos de contaminación.
- Idiomas no declarados: no se especifica qué lenguas soporta ni su calidad en castellano.
- Riesgo de alucinación: no evaluado; un modelo de 6 capas y vocabulario de 9.415 tokens tiene capacidad limitada de conocimiento factual.
- Contexto no documentado: se desconoce la ventana máxima, lo que dificulta planificar conversaciones multi-turno o documentos largos.
- Formato `.pt` propietario: requiere el código del proyecto Supermix (`python -m scf`) para cargarse; no hay integración con ecosistemas estándar como transformers, vLLM o llama.cpp.
- Licencia MIT: permite uso comercial, pero al no haber evaluación de sesgos ni garantías, el usuario asume todo el riesgo.
- Métricas internas no reproducibles de forma independiente: la verificación 41/41 depende del CLI propietario y de la semilla 82.
- Cero tracción comunitaria (0 descargas, 0 likes): no hay informes de terceros sobre su comportamiento real.

## Enlaces

- Hugging Face: https://huggingface.co/Kai9987kai/supermix-v97
- Repositorio del proyecto: https://github.com/kai9987kai/Supermix
- Modelo base: https://huggingface.co/Kai9987kai/supermix-v96
