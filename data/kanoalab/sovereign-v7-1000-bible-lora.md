# KANOALAB/Sovereign-v7.1000-Bible-LoRA

## Resumen

El modelo Sovereign v7.1000 Bible LoRA, desarrollado por KanoaLab, es un adaptador LoRA de 103,5 millones de parámetros diseñado para afinar el modelo base Llama-3 70B en el análisis simbólico-lógico de textos bíblicos. Su objetivo declarado es eliminar alucinaciones y dilución semántica en los 66 libros y 31.102 versículos de la Biblia mediante un pipeline de tres etapas: descomposición morfológica, invariancia topológica y verificación formal con demostradores automáticos de teoremas (Z3/Lean). El modelo se distribuye bajo licencia GPL v3.0 y está pensado para investigación en métodos formales y teología computacional. Al ser un adaptador, requiere el modelo base Llama-3 70B para funcionar, y su longitud de contexto depende de la configuración de este último, dato no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Llama-3 70B Base, con routing Mixture-of-Experts (MoE) de 66 adaptadores |
| Parámetros totales | 103.546.880 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko), griego (el), hebreo (he), inglés (en) |
| Licencia | GNU GPL v3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA compuesto por 66 adaptadores independientes que se combinan mediante un mecanismo de routing Mixture-of-Experts (MoE). Cada adaptador se asocia a uno de los 66 libros de la Biblia. El entrenamiento se realizó sobre el modelo base Llama-3 70B. Según la documentación del autor, el pipeline de procesamiento consta de tres etapas: descomposición morfológica a nivel de raíz en griego koiné y hebreo bíblico, mapeo de semántica invariante mediante teoremas de punto fijo topológicos para preservar pesos dogmáticos absolutos, y traducción a lógica simbólica validada con demostradores automáticos como Z3 y Lean. El preprocesamiento de datos se realizó con la API de Google Gemini 2.5 Pro. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset, ni se mencionan técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento simbólico sobre los 66 libros de la Biblia (31.102 versículos).
- Descomposición morfológica de textos en griego koiné y hebreo bíblico.
- Verificación formal de argumentos mediante lógica simbólica y demostradores de teoremas (Z3/Lean).
- Soporte multilingüe en coreano, griego, hebreo e inglés.
- No se especifican capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Análisis exegético de pasajes bíblicos: el modelo puede descomponer un versículo en sus componentes morfológicos y generar una representación lógica, lo que facilita el estudio comparativo de traducciones.
- Verificación formal de argumentos teológicos: permite comprobar la coherencia lógica de afirmaciones doctrinales mediante demostradores automáticos.
- Investigación en teología computacional: el pipeline de lógica simbólica ofrece un marco reproducible para analizar textos antiguos.
- Educación en seminarios: puede utilizarse como herramienta didáctica para enseñar interpretación textual y lógica formal.
- Generación de datasets anotados: el modelo puede producir representaciones lógicas de versículos que sirvan como datos de entrenamiento para otros sistemas.
- Análisis de coherencia doctrinal: al aplicar verificación formal, se pueden identificar inconsistencias o contradicciones en interpretaciones teológicas.
- Investigación en métodos formales aplicados a textos antiguos: el modelo demuestra la viabilidad de aplicar topología y lógica a corpus no matemáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,4 GB y requiere cargar el modelo base Llama-3 70B, que no está incluido en este repositorio.
- Según el autor, la inferencia local se ha probado en una NVIDIA RTX 5090 con 32 GB de VRAM.
- La VRAM necesaria para el modelo base depende de la cuantización empleada; no se proporcionan valores concretos en la información disponible.
- El código de ejemplo proporcionado por el autor utiliza `transformers` con `torch_dtype=torch.float16` y `device_map="auto"`.
- No se especifican opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni datos de latencia o throughput.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables en los datos disponibles.

## Limitaciones y advertencias

- Sesgos: al estar entrenado exclusivamente en textos bíblicos, el modelo puede reflejar sesgos teológicos, culturales o interpretativos propios de las tradiciones cristianas.
- Riesgo de alucinación: la afirmación del autor de eliminar alucinaciones no está respaldada por evaluaciones empíricas publicadas.
- Limitaciones de contexto: la longitud de contexto no se especifica; depende del modelo base Llama-3 70B.
- Limitaciones de idioma: solo se listan coreano, griego, hebreo e inglés; no se garantiza soporte para otros idiomas.
- Restricciones de licencia: la GPL v3.0 exige que cualquier obra derivada se distribuya bajo la misma licencia. Además, la model card incluye una cláusula de protección defensiva que prohíbe explícitamente la comercialización, privatización o patentamiento del núcleo lógico-matemático. Esto puede ser incompatible con usos comerciales propietarios.
- Caveat: el modelo es un adaptador LoRA, no un modelo autónomo; requiere el modelo base Llama-3 70B, que no está incluido en este repositorio.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/KANOALAB/Sovereign-v7.1000-Bible-LoRA
- Sitio web oficial de KanoaLab: https://kanoalab.com
- Contacto: info@kanoalab.com
