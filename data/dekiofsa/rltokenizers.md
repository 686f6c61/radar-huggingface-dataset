# Dekiofsa/RLtokenizers

## Resumen

RLtokenizers es un artefacto de investigación publicado en Hugging Face por el usuario Dekiofsa. No se trata de un modelo de lenguaje listo para inferencia, sino de un conjunto de checkpoints intermedios y registros de una ejecución de entrenamiento conjunto entre un modelo de lenguaje y un selector de tokenizador entrenado con refuerzo. El componente lingüístico subyacente es SmolLM2-1.7B, sobre el que se añade una hiperred de embeddings de entrada y una política REINFORCE que elige, en cada actualización, uno entre 1.000 tokenizadores de entrenamiento.

La ejecución documentada, denominada `raw-bpb-rl-20k/`, comprende 20.000 actualizaciones con guardados cada 500 pasos, además de un guardado adicional en el paso 16.409 por un límite del trabajo en clúster. La recompensa de la política es la transferencia de bits por byte (BPB) obtenida en el lote de entrenamiento de cada actualización, con peso de entropía de la política fijado a cero. El objetivo declarado es investigar la selección adaptativa de tokenizadores durante el entrenamiento, no ofrecer un modelo desplegable.

Por su naturaleza, el repositorio tiene interés para investigadores que estudien tokenización aprendida, optimización con gradiente de política aplicada a decisiones discretas de preprocesado y entrenamiento conjunto de hiperredes de embeddings. No incluye pesos en formato estándar de inferencia (safetensors o GGUF), ni model card con especificaciones de uso, licencia o idiomas, por lo que su aplicabilidad en producción es nula sin un trabajo adicional de conversión y validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (SmolLM2-1.7B) con hiperred de embeddings de entrada y selector de tokenizador REINFORCE |
| Parámetros totales | 1,7 mil millones (modelo base SmolLM2-1.7B); parámetros de la hiperred y la política no disponibles |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en `lm.pt`, `hypernet/`, `policy.pt`; no se distribuyen en GGUF ni safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`lm.pt`, `hypernet/`, `policy.pt`, `state.pt`, `optimizer.pt`); manifiestos `manifest.json` con SHA-256 |

## Arquitectura y entrenamiento

El modelo lingüístico es SmolLM2-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. Sobre él se acopla una hiperred que genera los embeddings de entrada, de modo que la representación de tokens no queda fijada por una tabla estática. En paralelo, una política REINFORCE selecciona en cada actualización uno de 1.000 tokenizadores de entrenamiento; la recompensa es la transferencia de bits por byte (BPB) medida en el lote de esa actualización, con peso de entropía de la política igual a cero, lo que implica una política sin término explícito de exploración más allá del ruido estocástico del muestreo.

El entrenamiento cubrió 20.000 actualizaciones con guardados completos (estado del entrenador, datos, aleatoriedad y optimizador) en los pasos 0, 2.000, 4.000, 6.000, 8.000, 10.000, 12.000, 14.000, 16.000, 16.409, 18.000 y 20.000. Los pasos 0 a 4.000 provienen de un primer intento y los pasos 4.500 en adelante de una ejecución reanudada tras un fallo al guardar el paso 5.000; por ello las actualizaciones 4.001 a 5.000 aparecen duplicadas en `events.jsonl` y debe conservarse la última fila de cada paso. El repositorio incluye `initial_eval.json` con la evaluación previa al entrenamiento, `heldout_tokenizers.json` con dos tokenizadores de control reservados y `run_config.json` con la configuración, además de `requirements-freeze.txt` con el entorno Python exacto.

## Capacidades

- Generación de texto y modelado de lenguaje, heredadas de SmolLM2-1.7B, condicionadas a los embeddings producidos por la hiperred.
- Selección adaptativa de tokenizador por actualización mediante política REINFORCE, con recompensa basada en BPB transferido.
- Entrenamiento conjunto de modelo, hiperred y política, con checkpoints completos que permiten reanudar la ejecución.
- Registro detallado por actualización en `events.jsonl`, útil para análisis de curvas de recompensa y de elección de tokenizador.
- Evaluación inicial y tokenizadores de control reservados para medir generalización de la política.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización aprendida: el repositorio permite reproducir y analizar cómo una política REINFORCE distribuye la elección entre 1.000 tokenizadores a lo largo de 20.000 actualizaciones, usando `events.jsonl` para trazar la evolución de la recompensa BPB.
- Estudio de hiperredes de embeddings: los checkpoints de `hypernet/` permiten inspeccionar cómo se generan las representaciones de entrada y compararlas con la tabla de embeddings estática de SmolLM2-1.7B.
- Reproducción de experimentos de entrenamiento conjunto: `run_config.json`, `requirements-freeze.txt` y los estados completos (`state.pt`, `optimizer.pt`) permiten reanudar la ejecución en el mismo punto y verificar la reproducibilidad del pipeline.
- Análisis de robustez frente a fallos: la duplicación de las actualizaciones 4.001 a 5.000 documenta un fallo de guardado y una reanudación, lo que sirve como caso de estudio de gestión de checkpoints en clúster.
- Evaluación de tokenizadores de control: `heldout_tokenizers.json` permite medir si la política generaliza a tokenizadores no vistos durante el entrenamiento, un experimento directamente ejecutable sobre los checkpoints guardados.
- Docencia y formación: el conjunto de artefactos, con manifiestos SHA-256 y registros por actualización, es adecuado para ilustrar un ciclo completo de entrenamiento con RL aplicado a decisiones discretas de preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `initial_eval.json` con una evaluación previa al entrenamiento, pero no se detallan en la información proporcionada las métricas ni los conjuntos de evaluación empleados, por lo que no es posible presentar una tabla comparativa sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base SmolLM2-1.7B en FP16 requeriría del orden de 3,4 GB solo para pesos, pero los checkpoints se distribuyen como `lm.pt` más `hypernet/` y `policy.pt`, sin cuantizaciones publicadas.
- GPU recomendadas: no disponible. No se documenta ningún perfil de despliegue ni requisito de memoria para el entrenamiento o la inferencia.
- Viabilidad en GPU de consumo: no confirmada. El tamaño del modelo base sugiere que cabría en GPUs consumer con suficiente VRAM, pero la ausencia de pesos en formatos estándar y de instrucciones de carga impide afirmarlo.
- Opciones de despliegue: no disponible. No hay pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no pueden cargar el repositorio tal cual; sería necesario un trabajo de conversión previo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RLtokenizers (este repositorio) | 1,7 mil millones (base) | no disponible | no disponible | PyTorch (`lm.pt`, `hypernet/`, `policy.pt`) | Checkpoints de investigación, no desplegable directamente |
| SmolLM2-1.7B | 1,7 mil millones | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Modelo publicado por Hugging Face para inferencia |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas centradas en tokenización aprendida no puede completarse con la información proporcionada; no se dispone de datos de otros sistemas comparables en el mismo régimen de entrenamiento.

## Limitaciones y advertencias

- No es un modelo listo para producción: se trata de checkpoints intermedios de una ejecución de investigación, sin instrucciones de carga ni pipeline declarado.
- Ausencia total de licencia declarada, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso.
- Idiomas soportados no documentados; no puede asumirse cobertura multilingüe más allá de la del modelo base.
- Longitud de contexto no especificada en la información disponible.
- Los pesos no se distribuyen en safetensors ni GGUF, lo que bloquea su uso con las herramientas de inferencia habituales sin conversión manual.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo base sin ajuste instructivo documentado, no cabe esperar alineación conversacional.
- La política REINFORCE se entrenó con peso de entropía cero, lo que puede favorecer un colapso temprano hacia un subconjunto reducido de tokenizadores; no se aportan métricas de diversidad de selección.
- La duplicación de las actualizaciones 4.001 a 5.000 en `events.jsonl` exige filtrar conservando la última fila por paso para cualquier análisis; ignorarlo produce resultados sesgados.
- Los pasos 0 a 4.000 y 4.500 en adelante provienen de ejecuciones distintas, lo que introduce una discontinuidad que debe tenerse en cuenta al comparar checkpoints.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dekiofsa/RLtokenizers
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código ni demos.
