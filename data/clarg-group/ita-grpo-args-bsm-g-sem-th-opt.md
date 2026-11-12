# CLArg-group/ita-grpo-args-bsm-g-sem-th-opt

## Resumen

`ita-grpo-args-bsm-g-sem-th-opt` es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-8B, desarrollado por el grupo CLArg, que actúa como generador de argumentos para un sistema de argumentación en tiempo de inferencia (ITA, *inference-time argumentation*). Dado un *claim* (una afirmación a verificar), el modelo produce un conjunto de argumentos a favor y un conjunto de argumentos en contra; estos inducen un grafo de argumentación bipartito (QBAF) centrado en el claim, cuyos nodos se puntúan con un modelo de puntuación base (BSM) y se agregan mediante la semántica gradual DF-QuAD para obtener una fuerza del claim que, umbralizada, produce un veredicto Verdadero / Falso / Incierto.

El modelo forma parte del artículo *Neurosymbolic Learning for Inference-Time Argumentation* y corresponde a la variante denominada "Qwen GRPO args + BSM-G (primed & sem)" en la Tabla 5 del paper, dentro de la configuración de umbrales simétricos optimizados. Se entrena con GRPO (TRL) sobre 1.000 claims etiquetados del conjunto *TFU Training Claims*, utilizando como recompensa la salida del BSM congelado combinada con DF-QuAD.

Su relevancia radica en que combina un LLM con un componente neurosimbólico (grafo de argumentación + semántica gradual) para tareas de verificación de afirmaciones, un enfoque distinto del prompting directo o del razonamiento en cadena. El adaptador es ligero (LoRA rango 8) y se distribuye bajo licencia MIT, aunque su uso práctico requiere el ecosistema del repositorio ITA y el BSM asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (rango 8, α = 32, dropout 0.1; módulos query, key, value y output projection) |
| Parametros totales | No disponible (adaptador LoRA sobre Qwen3-8B; el modelo base tiene aproximadamente 8.000 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B; no especificada en la información proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (sujeta además a la licencia del modelo base Qwen/Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-8B, un transformer decoder-only, mediante LoRA de rango 8 y α = 32 con dropout 0.1, aplicado a las proyecciones query, key, value y output. Durante el entrenamiento con GRPO solo se actualizan los parámetros LoRA del generador; el modelo de puntuación base BSM-G (primed & sem) permanece congelado y se utiliza para calcular la recompensa. La semántica de agregación es DF-QuAD, con la puntuación base del propio claim fijada en 0.5, y los umbrales de veredicto se inicializan en α = 0.33 y β = 0.66.

El entrenamiento se realizó con TRL sobre el conjunto *TFU Training Claims* (1.000 claims etiquetados como Verdadero / Falso / Incierto). Cada completion muestreada se parsea en argumentos a favor y en contra, se puntúa con el BSM y se evalúa con DF-QuAD; la fuerza resultante se convierte en la recompensa de argumentación r<sub>α,β</sub> descrita en la Sección 6 del paper, que es máxima para cualquier fuerza que produzca el veredicto correcto y decrece linealmente con la distancia al umbral relevante. Las completions no parseables reciben una recompensa fija de −1000. Hiperparámetros: learning rate 1e-5, 2 épocas, 2 generaciones por prompt, 500 pasos de optimización, semilla 0. Los umbrales se reoptimizaron cada 25 pasos sobre una ventana de 25 pasos de fuerzas de claims de entrenamiento (mínimo 20 muestras), seleccionando el par simétrico que maximizaba la exactitud balanceada.

## Capacidades

- Generación de argumentos a favor y en contra para un claim dado, en el formato requerido por el pipeline ITA.
- Verificación de afirmaciones (*claim verification*) mediante la combinación de argumentos generados, puntuaciones del BSM y semántica DF-QuAD, produciendo un veredicto Verdadero / Falso / Incierto.
- Razonamiento argumentativo estructurado: la salida se parsea en un QBAF, lo que permite trazabilidad de los argumentos que sustentan el veredicto.
- Entrenamiento con GRPO orientado a una recompensa neurosimbólica, lo que alinea la generación con la exactitud del veredicto final.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso de agentes, multimodalidad, audio ni modo de razonamiento explícito (*thinking mode*).
- Capacidades multilingües: no disponibles (no especificadas).

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo genera argumentos a favor y en contra de una afirmación y el sistema ITA agrega las puntuaciones del BSM para emitir un veredicto con trazabilidad de los argumentos empleados.
- Investigación en argumentación computacional: sirve como generador de argumentos reproducible para experimentos con QBAF, DF-QuAD y semánticas graduales, al estar el adaptador y el repositorio publicados.
- Evaluación de sistemas neurosimbólicos: permite comparar el enfoque ITA frente a basamentos puramente neuronales (prompting directo, chain-of-thought) en tareas de verificación.
- Moderación de contenido basada en evidencia: dado un claim sobre una publicación, el modelo produce argumentos que un revisor humano puede inspeccionar antes de aplicar una decisión.
- Análisis de desinformación en dominios acotados: con el BSM y los umbrales adecuados, el pipeline puede integrarse en flujos de revisión de afirmaciones factuales, siempre con supervisión humana.
- Docencia y prototipado: al ser un adaptador LoRA ligero sobre Qwen3-8B, permite desplegar el pipeline completo en entornos de investigación con recursos moderados y estudiar el efecto de los umbrales y de la semántica DF-QuAD.
- Generación de contraargumentos: el conjunto de argumentos atacantes puede reutilizarse en sistemas de debate o de crítica automática de afirmaciones.

## Benchmarks y rendimiento

Resultados reportados en la Tabla 5 del paper, con este generador emparejado con BSM-G (primed & sem) en el momento de la evaluación:

| Dataset | Metrica | Resultado |
|---|---|---|
| TFU Evaluation Claims | accuracy | 0.672 |
| AVeriTeC | balanced accuracy | 0.442 |

No se han publicado en la información disponible resultados adicionales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (repo de 0,0 GB según Hugging Face); el coste real lo determina el modelo base Qwen3-8B.
- VRAM estimada para inferencia en bfloat16: en torno a 16 GB para los pesos del modelo base, más overhead de activaciones y del adaptador; con cuantización de 8 bits se reduce aproximadamente a la mitad y con 4 bits a unos 5-6 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de referencia en bfloat16; RTX 4090 (24 GB) puede alojar el modelo en bfloat16 con margen ajustado o en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bfloat16 con gestión cuidadosa de memoria, y en GPUs de 12-16 GB si se aplica cuantización.
- Opciones de despliegue: carga directa con `transformers` + `peft` (como se muestra en la model card); el pipeline ITA del repositorio espera el checkpoint en `checkpoints/ita-grpo-args-bsm-g-sem-th-opt/`. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría (generadores de argumentos para ITA) ni de resultados numéricos de alternativas en los mismos conjuntos de evaluación. La comparación cuantitativa con otros sistemas de verificación de claims no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en la tarea |
|---|---|---|---|---|---|
| ita-grpo-args-bsm-g-sem-th-opt | LoRA sobre Qwen3-8B | No disponible | MIT | Hugging Face (adaptador PEFT) | TFU accuracy 0.672; AVeriTeC balanced accuracy 0.442 |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está especializado en la generación de argumentos para el pipeline ITA; no es un modelo de propósito general y su uso aislado sin el BSM y la semántica DF-QuAD no produce veredictos.
- Los resultados reportados son moderados: accuracy de 0.672 en TFU Evaluation Claims y exactitud balanceada de 0.442 en AVeriTeC, lo que indica un rendimiento limitado en el conjunto de evaluación externo.
- Riesgo de alucinación: como generador de texto, puede producir argumentos plausibles pero factualmente incorrectos; el BSM y el umbral mitigan parcialmente este riesgo, pero no lo eliminan.
- El entrenamiento se realizó sobre 1.000 claims del conjunto TFU Training Claims; el dominio y la distribución de estos datos condicionan la generalización.
- Sesgos conocidos: no documentados en la información disponible; se heredan los sesgos del modelo base Qwen3-8B y de los datos de entrenamiento.
- Idiomas soportados: no especificados; la cobertura multilingüe no está garantizada.
- Licencia MIT para los pesos del adaptador, pero el uso está sujeto además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento, según indica el autor.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el adaptador es extremadamente pequeño; conviene verificar la integridad de los ficheros antes de usarlo en producción.
- No se documentan garantías de robustez ante entradas adversarias ni evaluación de calibración de los umbrales en dominios distintos del de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-grpo-args-bsm-g-sem-th-opt
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- BSM-G (primed & sem): https://huggingface.co/CLArg-group/ita-bsm-g-sem
- Repositorio ITA: https://github.com/CLArg-group/inference-time-argumentation
- TRL: https://github.com/huggingface/trl
