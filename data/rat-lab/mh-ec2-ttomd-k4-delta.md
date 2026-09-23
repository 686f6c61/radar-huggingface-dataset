# rat-lab/mh-ec2-ttomd-K4-delta

# rat-lab/mh-ec2-ttomd-K4-delta

## Resumen

`rat-lab/mh-ec2-ttomd-K4-delta` es un conjunto de adaptadores LoRA (formato PEFT) entrenados sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, que a su vez deriva de Gemma 2 2B instruct. No es un modelo de propósito general ni un lanzamiento de producto: es el artefacto experimental correspondiente a la celda K=4, variante *delta*, de la tabla cobertura x debiasing de una línea de investigación sobre aprendizaje de preferencias sensible al riesgo (riesgo entrópico, tau = 10). El autor de los pesos es rat-lab y el entrenamiento fue ejecutado localmente por Max Horwitz en el clúster UW Hyak.

El interés técnico del repositorio está en el algoritmo, no en el rendimiento: se trata de un run de IPO en línea (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`) con corrección de sesgo a dos escalas de tiempo (*two-timescale*) y estimador por método delta, con tamaño de paso gamma = 0,1 y warm start desde `ipo-e-c10.0/checkpoint-936`. El entrenamiento se hizo sobre `PKU-Alignment/PKU-SafeRLHF`, con 4 muestras por prompt, riesgo entrópico con c = 10, semilla 42 y generación de 64 tokens nuevos como máximo.

El repositorio contiene 19 checkpoints (de 250 a 4680 pasos, cada 250 pasos) que permiten estudiar la evolución de las preferencias a lo largo del entrenamiento. Con 0 descargas y 0 *likes* en el momento de redactar esta ficha, debe tratarse como material de reproducción e investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder; el modelo base es Gemma 2 2B instruct |
| Parametros totales | No disponible para los adaptadores (el repo ocupa 1,9 GB con 19 checkpoints). El modelo base tiene del orden de 2,6 mil millones de parametros segun las especificaciones publicas de Gemma 2 2B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha del repositorio; el modelo base Gemma 2 2B trabaja con 8192 tokens |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen en safetensors sin cuantizar; la cuantizacion requeriria fusionar el adaptador con el modelo base y convertir por cuenta propia |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio. El modelo base es de la familia Gemma 2, por lo que quedaria sujeto a los terminos de uso de Gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json` por checkpoint), mas ficheros de tokenizer |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base, Gemma 2 2B instruct (transformer decoder con atencion alternada local/global), mas un adaptador LoRA de rango no especificado que se carga mediante `PeftModel.from_pretrained` indicando el subfolder del checkpoint. El adaptador no modifica la arquitectura del base: se acopla a las capas existentes, de modo que el coste de almacenamiento por checkpoint es una fraccion del modelo completo.

El entrenamiento sigue el algoritmo de IPO en linea (`oipo1`) implementado en `risk_egpo/tt_omd.py`, dentro de un marco de optimizacion con riesgo entropico (tau = 10, `--risk entropic --risk_c 10.0`). La innovacion metodologica del run es el uso de correccion de sesgo a dos escalas de tiempo con estimador por metodo delta y paso gamma = 0,1, junto con cobertura K = 4 (`--ypp_samples 4`) — es decir, 4 muestras generadas por prompt para estimar la cantidad de interes. El dataset de preferencias es `PKU-Alignment/PKU-SafeRLHF`. La inicializacion es un warm start desde `ipo-e-c10.0/checkpoint-936` con 100 pasos de calentamiento, semilla 42 y limite de 64 tokens nuevos por generacion. El run se ejecuto en dos tramos con SLURM (jobs 40151500 y 40268231) sobre el mismo directorio, restaurando el estado del optimizador y del tracker de two-timescale, hasta alcanzar el paso 4680. El estado de reanudacion de DeepSpeed no se incluye en el repositorio.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Gemma 2 2B instruct, condicionada por el adaptador de preferencias.
- Ajuste de comportamiento hacia respuestas mas seguras: el entrenamiento usa PKU-SafeRLHF, un dataset de preferencias centrado en seguridad y dano.
- Reproduccion de experimentos de aprendizaje de preferencias sensible al riesgo (IPO en linea con riesgo entropico).
- Analisis de trayectoria de entrenamiento: los 19 checkpoints permiten comparar el comportamiento del modelo en distintos puntos del run.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes o razonamiento multi-paso: no documentado; el entrenamiento se limita a generaciones de 64 tokens.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Reproduccion de resultados academicos: cargar los checkpoints con `PeftModel` sobre el modelo base y replicar las metricas de la celda K=4 de la tabla cobertura x debiasing, usando el mismo dataset PKU-SafeRLHF.
- Estudio de correccion de sesgo a dos escalas de tiempo: comparar este adaptador con otras celdas de la misma tabla para aislar el efecto del estimador por metodo delta en la estimacion de riesgo entropico.
- Analisis de deriva de preferencias: los 19 checkpoints (pasos 250 a 4680) permiten trazar como evoluciona la tasa de rechazo y el estilo de respuesta a lo largo del entrenamiento.
- Punto de partida para experimentos posteriores: el adaptador puede usarse como warm start de runs adicionales, replicando el esquema de inicializacion documentado (100 pasos de calentamiento).
- Auditoria de seguridad en modelos pequenos: evaluar si un ajuste de preferencias centrado en seguridad sobre un modelo de 2,6 mil millones de parametros reduce respuestas daninas frente al modelo base sin ajustar.
- Investigacion sobre alineamiento con recursos limitados: el tamano del modelo base permite ejecutar los experimentos de evaluacion en una unica GPU de gama alta de consumo, abaratando la experimentacion.
- Prototipado local de asistentes: previa fusion del adaptador con el modelo base y conversion a GGUF o cuantizacion de 4 bits, puede desplegarse en equipos de sobremesa para tareas de generacion de texto sin datos sensibles saliendo de la maquina.
- Docencia y divulgacion: sirve como ejemplo minimo y ejecutable de un pipeline PEFT + LoRA con reanudacion de entrenamiento via SLURM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas, evaluaciones de MMLU, GSM8K, HumanEval ni metricas de seguridad, y su model card se limita a documentar hiperparametros y procedencia del entrenamiento.

## Requisitos de hardware

- El adaptador en si es pequeno, pero requiere cargar el modelo base Gemma 2 2B completo en memoria. Estimaciones orientativas para el modelo base:
  - FP16/BF16: en torno a 5-6 GB de pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 8 GB de VRAM para inferencia comoda.
  - Cuantizacion de 8 bits: aproximadamente 3-4 GB de VRAM.
  - Cuantizacion de 4 bits: aproximadamente 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con 8 GB o mas para inferencia en BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para entrenar o reentrenar adaptadores LoRA sobre el base conviene una GPU de 24 GB o superior (RTX 3090/4090, A100 40 GB, H100).
- Cabe en GPU de consumo: si, en BF16 desde 8-12 GB de VRAM y en 4 bits desde aproximadamente 4 GB.
- Opciones de despliegue: `transformers` + `peft` (la ruta documentada en la model card), vLLM o TGI tras fusionar el adaptador con el modelo base, llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput estimados: no disponibles. El unico dato de configuracion relacionado es el limite de 64 tokens nuevos por generacion usado durante el entrenamiento, que no es una medida de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-lab/mh-ec2-ttomd-K4-delta | No disponible (base de ~2,6 mil millones) | No disponible (base 8192 tokens) | Adaptador LoRA de IPO con riesgo entropico | No disponible | HuggingFace, 0 descargas |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT | ~2,6 mil millones | 8192 tokens (base Gemma 2 2B) | Modelo completo ajustado con SFT sobre alpaca-cleaned | No disponible | HuggingFace |
| Gemma 2 2B instruct (modelo base de la familia) | ~2,6 mil millones | 8192 tokens | Modelo instruct completo | Terminos de uso de Gemma | Publico |
| Otros adaptadores de optimizacion de preferencias comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados que permitan comparar el rendimiento de este adaptador con alternativas de la misma categoria (adaptadores LoRA de IPO/DPO sobre modelos de ~2-3 mil millones de parametros). La comparacion relevante es metodologica, no de metricas.

## Limitaciones y advertencias

- Artefacto de investigacion: no hay evaluacion publicada de calidad, seguridad ni sesgos. No deberia desplegarse en produccion sin una evaluacion propia.
- Licencia no declarada en el repositorio. El modelo base pertenece a la familia Gemma 2, cuyos terminos de uso imponen condiciones especificas (incluidas obligaciones de atribucion y restricciones de uso). Antes de cualquier uso comercial hay que verificar la licencia aplicable al base y al adaptador.
- No se incluye el estado de reanudacion de DeepSpeed, por lo que la reproduccion exacta del entrenamiento no es completa: solo se pueden inspeccionar los pesos resultantes.
- El adaptador requiere obligatoriamente el modelo base para funcionar y hay que indicar el subfolder del checkpoint (`checkpoint-4680`, `checkpoint-250`, etc.); cargarlo sin especificar subfolder fallara.
- El entrenamiento se realizo sobre PKU-SafeRLHF, un dataset en ingles centrado en seguridad; el comportamiento del adaptador fuera de ese dominio y en otros idiomas no esta caracterizado y podria degradar capacidades del base (olvido catastrofico propio del ajuste con preferencias).
- Riesgo de alucinacion: heredado del modelo base Gemma 2 2B y no mitigado por este ajuste; un adaptador de preferencias no reduce la generacion de contenido falso, solo modula la preferencia entre respuestas.
- Sesgos conocidos del modelo base (genero, etnia, religion, idioma) que este adaptador no corrige de forma sistematica; el dataset de preferencias usado esta orientado a dano y seguridad, no a sesgos sociales.
- La generacion durante el entrenamiento se limito a 64 tokens nuevos, de modo que el comportamiento en respuestas largas esta poco explorado.
- Repositorio sin senales de uso (0 descargas, 0 likes) y con model card unicamente en ingles; no hay garantia de mantenimiento ni de soporte.
- No se documentan capacidades de tool calling, agentes o multimodalidad, por lo que no deberia asumirse ninguna de ellas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K4-delta
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Libreria PEFT: https://github.com/huggingface/peft
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (contenido enciclopedico sobre la especie animal "rat" y ofertas de un operador de television). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este artefacto.
