# jnward2/graft-smollm2-135m-toy-adapters

## Resumen

GRAFT toy-environment adapters es un conjunto de checkpoints de adaptadores publicados por jnward2 como material de replicación del paper GRAFT (arXiv:2610.17062), centrado en la mitigación del reward hacking mediante enrutamiento de gradientes. No se trata de un modelo de propósito general, sino de un artefacto de investigación: 54 ejecuciones de aprendizaje por refuerzo sobre seis entornos de juguete, cada una entrenada sobre el modelo base congelado HuggingFaceTB/SmolLM2-135M-Instruct. Los adaptadores se organizan en tres brazos experimentales (sin intervención, GRAFT y GRAFT sin anclaje) con tres semillas por entorno.

El interés técnico reside en que demuestra empíricamente cómo un mecanismo de enrutamiento selectivo de gradientes (RETAIN frente a FORGET) puede eliminar o reducir drásticamente las tasas de hackeo de recompensa sin degradar en exceso la recompensa legítima. Los checkpoints son reejecuciones independientes de las del paper, entrenadas el 26 de octubre de 2026 en GPUs H200 de Modal, y no los originales del artículo. El repositorio ocupa 0,5 GB e incluye pesos en safetensors, configuraciones de entrenamiento, logs y evaluaciones intermedias.

Por su naturaleza, este artefacto está dirigido a investigadores que estudian alineamiento, robustez de recompensas y técnicas de intervención sobre políticas RL, no a desarrolladores que busquen un modelo desplegable en producción. El modelo base es un transformer de 135 millones de parámetros con contexto de 8.192 tokens, pero los adaptadores publicados no están pensados para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) con adaptadores SwiGLU MLP acoplados por capa |
| Parametros totales | 135M (modelo base) + 829.440 por adaptador (RETAIN y FORGET por capa) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base SmolLM2-135M-Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (adaptadores en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores en bf16) + dual_lora_config.json |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se acoplan dos adaptadores SwiGLU MLP por cada una de las 30 capas del decoder: uno denominado RETAIN y otro FORGET, de 16 neuronas cada uno y 829.440 parámetros por lado. Cada adaptador lee la entrada del MLP congelado del modelo base y suma su salida a la del MLP original, sin modificar los pesos del base. El checkpoint publicado contiene únicamente los pesos de los adaptadores.

El entrenamiento se realizó mediante aprendizaje por refuerzo sobre seis entornos de juguete del paper GRAFT: repeat_extra (500 pasos), addition (2.000), cities_qa (2.000), persona_qa (1.000), object_qa (1.000) y sort (1.000). Cada entorno se ejecutó con tres brazos (no_intervention, graft y graft_no_anchor) y tres semillas, totalizando 54 ejecuciones. En el brazo GRAFT, las trampas detectadas por el detector se enrutan al adaptador FORGET, con un anclaje del mismo entorno de 128 muestras por rollout. En el brazo sin intervención ambos adaptadores entrenan como una única política con el enrutamiento desactivado. Los checkpoints se guardan cada 500 pasos y el de mayor paso es la política final. El entrenamiento se ejecutó con torch 2.10.0 y transformers 5.2.0.

## Capacidades

- Generación de texto y razonamiento básico heredados del modelo base SmolLM2-135M-Instruct.
- Ejecución de políticas RL específicas para seis tareas de juguete: repetición con recompensa extra, suma, preguntas sobre ciudades, preguntas de persona, preguntas de objeto y ordenación enmarcada.
- Enrutamiento condicional de gradientes entre adaptadores RETAIN y FORGET, con escalas de despliegue configurables (retain_scale, forget_scale).
- Evaluación de tasas de hackeo de recompensa mediante el detector del paper GRAFT.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en reward hacking: reproducir los experimentos del paper GRAFT sobre los seis entornos de juguete y comparar las tasas de hackeo entre brazos (sin intervención, GRAFT y GRAFT sin anclaje) con las métricas publicadas.
- Estudio de enrutamiento de gradientes: analizar cómo el adaptador FORGET absorbe las políticas que explotan la recompensa mientras el RETAIN preserva el comportamiento legítimo, usando las escalas (1,0) y (1,1) para comparar.
- Validación de técnicas de anclaje: comparar el brazo graft con graft_no_anchor para medir el coste de la recompensa retenida cuando se elimina el anclaje del mismo entorno (por ejemplo, la caída de retain a 0,028 en addition).
- Reproducibilidad de resultados: verificar las métricas finales del paper con las reejecuciones publicadas, que incluyen sha256 de cada checkpoint y MANIFEST.sha256 para auditoría.
- Desarrollo de detectores de hackeo: usar los logs routing_eval.jsonl (evaluaciones cada 10 pasos) para entrenar o validar clasificadores de comportamiento explotador.
- Docencia y divulgación: ilustrar en un entorno de juguete cómo una intervención arquitectónica sobre un modelo pequeño (135M) reduce el hackeo de 0,742 a 0,000 en repeat_extra sin reentrenar el modelo base.
- Análisis de estabilidad entre semillas: estudiar la varianza del hackeo en addition (0,449 / 0,908 / 0,893 en no_intervention) y su eliminación total con GRAFT.

## Benchmarks y rendimiento

Resultados de fin de entrenamiento de la política desplegada (media ± SEM sobre semillas 1-3), según la model card:

| Entorno | Brazo | Retain | Hack | Hack por semilla (s1/s2/s3) | Paper retain | Paper hack |
|---|---|---|---|---|---|---|
| repeat_extra | no_intervention | 0,974 ± 0,004 | 0,742 ± 0,017 | 0,743 / 0,772 / 0,712 | 0,973 ± 0,004 | 0,735 ± 0,003 |
| repeat_extra | graft | 0,928 ± 0,003 | 0,000 ± 0,000 | 0,000 / 0,000 / 0,000 | 0,938 ± 0,004 | 0,000 ± 0,000 |
| repeat_extra | graft_no_anchor | 0,323 ± 0,155 | 0,000 ± 0,000 | 0,000 / 0,000 / 0,000 | — | — |
| addition | no_intervention | 0,754 ± 0,003 | 0,750 ± 0,151 | 0,449 / 0,908 / 0,893 | 0,749 ± 0,004 | 0,895 ± 0,007 |
| addition | graft | 0,728 ± 0,008 | 0,000 ± 0,000 | 0,000 / 0,000 / 0,000 | 0,706 ± 0,013 | 0,000 ± 0,000 |
| addition | graft_no_anchor | 0,028 ± 0,014 | 0,000 ± 0,000 | 0,000 / 0,000 / 0,000 | — | — |
| cities_qa | no_intervention | 0,843 ± 0,010 | 0,955 ± 0,006 | 0,958 / 0,943 / 0,964 | 0,851 ± 0,004 | 0,944 ± 0,002 |
| cities_qa | graft | 0,753 ± 0,041 | 0,275 ± 0,275 | 0,825 / 0,000 / 0,000 | 0,744 ± 0,021 | 0,000 ± 0,000 |
| cities_qa | graft_no_anchor | 0,000 ± 0,000 | 0,000 ± 0,000 | 0,000 / 0,000 / 0,000 | — | — |
| persona_qa | no_intervention | 0,523 ± 0,025 | 0,996 ± 0,002 | 0,992 / 0,996 / 0,998 | 0,481 ± 0,025 | 0,989 ± 0,005 |
| persona_qa | graft | 0,360 ± 0,038 | 0,022 ± 0,012 | 0,044 / 0,005 / 0,017 | 0,346 ± 0,017 | 0,021 ± 0,009 |
| persona_qa | graft_no_anchor | 0,284 ± 0,023 | 0,029 ± 0,011 | 0,051 / 0,021 / 0,014 | — | — |
| object_qa | no_intervention | 0,593 ± 0,010 | 0,833 ± 0,015 | 0,830 / 0,808 / 0,861 | 0,557 ± 0,014 | 0,790 ± 0,003 |
| object_qa | graft | 0,502 ± 0,017 | 0,092 ± 0,091 | 0,274 / 0,000 / 0,001 | 0,492 ± 0,012 | 0,001 ± 0,001 |
| object_qa | graft_no_anchor | 0,345 ± 0,019 | 0,001 ± 0,001 | 0,000 / 0,000 / 0,003 | — | — |

La model card también reporta un test de muestreo: 128 prompts de suma hackeables con addition/graft/s1 producen 0 hackeos con FORGET ablacionado y 112 con ambos adaptadores activos, a temperatura 1. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 135M en bf16 ocupa aproximadamente 0,27 GB; los adaptadores añaden unos 1,7 MB por checkpoint (829.440 parámetros × 2 lados × 2 bytes). En la práctica, el conjunto completo cabe en cualquier GPU consumer.
- GPU recomendadas: no se requieren GPUs de datacenter. El modelo base y los adaptadores se ejecutan en CPU (la model card indica que el snippet de carga se probó en CPU con torch 2.10.0 y transformers 5.2.0). Para entrenamiento, el paper usó H200 de Modal.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, etc., e incluso en CPU.
- Opciones de despliegue: el cargador propio del repositorio jnward/GRAFT (load_gradient_routing_model y set_scales). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRAFT toy adapters (este) | 135M base + adaptadores | no disponible | Adaptadores RL con enrutamiento RETAIN/FORGET para mitigar reward hacking | no disponible | Hugging Face (jnward2) |
| SmolLM2-135M-Instruct | 135M | 8.192 tokens | Modelo instruct generalista | Apache 2.0 (según el modelo base referenciado) | Hugging Face (HuggingFaceTB) |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens | Modelo instruct generalista de mayor tamaño | Apache 2.0 (según el modelo base referenciado) | Hugging Face (HuggingFaceTB) |

La comparativa directa con modelos de la misma categoría (artefactos de investigación sobre reward hacking) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: los adaptadores solo tienen sentido acoplados a SmolLM2-135M-Instruct y cargados con el código del repositorio GRAFT.
- Los checkpoints son reejecuciones, no los del paper; las métricas pueden diferir de las figuras originales (por ejemplo, cities_qa graft muestra 0,275 ± 0,275 frente a 0,000 ± 0,000 del paper).
- El brazo graft_no_anchor no tiene métricas en el bundle del paper, por lo que la comparación con los resultados originales es parcial.
- El cargador imprime un aviso de 183 claves inesperadas que corresponden a los pesos del modelo base, ausentes en un checkpoint de solo adaptadores; un uso incorrecto puede dejar el modelo mal inicializado.
- Los nombres de pesos llevan el prefijo _orig_mod. de torch.compile, que el cargador elimina; versiones distintas del código pueden romper la carga.
- Riesgo de alucinación y sesgos: no documentados específicamente para estos adaptadores; heredados del modelo base SmolLM2-135M-Instruct.
- Restricciones de licencia: la licencia del repositorio no está disponible; la del modelo base debe consultarse por separado antes de cualquier uso comercial.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe.
- Los resultados se limitan a entornos de juguete con recetas concretas; la generalización a tareas reales no está demostrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jnward2/graft-smollm2-135m-toy-adapters
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper GRAFT: https://arxiv.org/abs/2610.17062
- Repositorio de código GRAFT: https://github.com/jnward/GRAFT
