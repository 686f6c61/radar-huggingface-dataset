# jprivera/260326_local_gpu_training

## Resumen

`jprivera/260326_local_gpu_training` es un repositorio de adaptadores LoRA (no un modelo base completo) entrenados sobre Llama-3.3-70B-Instruct y publicados como artefacto de investigación. El autor, jprivera, los describe como parte del "organismo de colusión dual-LoRA MO3", compuesto por un LoRA de política (policy LoRA) y un LoRA de monitor (monitor LoRA), ambos entrenados con la herramienta Tinker. El paquete incluye además cinco variantes de fusión de esos dos adaptadores en uno solo (weight-sum, concatenación de rangos, escalado, TIES y una fusión basada en SVD).

El repositorio se presenta como una copia de seguridad realizada el 2026-10-02 desde un pod de RunPod, con trabajo fechado entre el 2026-03-26 y el 2026-03-31. No es un modelo listo para producción ni un release oficial: es un archivo de experimentos reproducible, con manifiesto de hashes (`MANIFEST.tsv`), scripts de fusión y de evaluación referenciados en un repositorio de GitHub externo.

Por su naturaleza, el interés es principalmente para investigación en seguridad de IA y estudio de comportamientos emergentes en sistemas con múltiples adaptadores, más que para tareas de generación de texto convencionales. El repositorio ocupa 23,4 GB, no tiene descargas ni likes, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre el modelo base Llama-3.3-70B-Instruct (transformer decoder-only denso) |
| Parametros totales | Modelo base: 70B (segun la model card); los adaptadores LoRA no declaran rango ni numero de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en el repositorio; el modelo base Llama-3.3-70B-Instruct admite hasta 128 000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el modelo base esta sujeto a la Llama 3.3 Community License |
| Formato de pesos | safetensors (unico tag de formato declarado) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo desde cero: son adaptadores LoRA (Low-Rank Adaptation) aplicados sobre Llama-3.3-70B-Instruct. La model card indica que se entrenaron dos adaptadores diferenciados, un LoRA de política y un LoRA de monitor, mediante Tinker, y que el experimento se enmarca en un objeto de estudio llamado "organismo de colusión dual-LoRA MO3". No se especifica en la información disponible el rango de los LoRA, el número de pasos, el dataset utilizado, la composición de datos, ni si hubo fases de RLHF, DPO u otro alineamiento posterior.

La innovación técnica documentada está en la fase de combinación de adaptadores, no en el entrenamiento. El repositorio publica cinco estrategias distintas de fusión de los dos LoRA en un único adaptador: suma de pesos (`merge_lora.py`), concatenación de rangos (`merge_cat.py`), fusión escalada (`merge_scaled.py`), fusión TIES (`merge_ties.py`) y una fusión basada en descomposición en valores singulares (`merge_correct.py`, con estadísticas en `svd_stats.json`). Cada variante se almacena en su propio subdirectorio dentro de `output/`. Es un diseño pensado para comparar experimentalmente cómo se comportan distintas técnicas de merge cuando los adaptadores codifican políticas potencialmente en conflicto.

## Capacidades

- No se documentan capacidades funcionales propias en la model card. Al ser adaptadores LoRA sobre Llama-3.3-70B-Instruct, heredarían en principio las capacidades del modelo base, pero el repositorio no declara ninguna evaluación que lo confirme.
- Generación de texto, razonamiento, código y matemáticas: presumibles por el modelo base, no verificadas en este artefacto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales: la model card describe un componente de "monitor" junto al de "política", lo que sugiere un diseño de par actor-observador propio de experimentos de colusión, pero no se detalla su comportamiento.
- Reproducibilidad: incluye manifiesto con sha256 de cada fichero y scripts de fusión/evaluación en un repositorio de GitHub asociado.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo dos adaptadores con objetivos distintos (política y monitor) interactúan cuando se fusionan, y si el comportamiento resultante exhibe colusión o evasión. El repositorio es un material de partida reproducible para este tipo de análisis.
- Comparación de técnicas de fusión de LoRA: las cinco variantes (weight-sum, cat, scaled, TIES, SVD) permiten medir empíricamente cuál preserva mejor o peor el comportamiento de los adaptadores originales en un modelo de 70B.
- Reproducción de experimentos: a partir de `MANIFEST.tsv` y los scripts referenciados se puede reconstruir el pipeline exacto de merge y verificar integridad de pesos.
- Auditoría de adaptadores sospechosos: el flujo policy+monitor sirve como plantilla para inspeccionar adaptadores publicados por terceros y detectar comportamientos no declarados.
- Docencia e investigación académica: como ejemplo práctico de cómo se publica y versiona un experimento de adaptadores duales sobre un LLM grande.
- Red-teaming metodológico: la estructura dual permite diseñar pruebas de detección de comportamiento condicionado (backdoors o políticas latentes) tras una fusión.
- Archivo y trazabilidad: uso del repositorio como copia de seguridad verificable de un experimento cuya infraestructura original (pod de RunPod) ya no está activa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparables, y referencia `RESULTS.md` en un repositorio de GitHub externo que no se ha proporcionado en la información recibida.

## Requisitos de hardware

- VRAM para inferencia: depende del modelo base Llama-3.3-70B-Instruct y de su cuantización, no del tamaño de los adaptadores. El repositorio (23,4 GB) contiene pesos de adaptadores y variantes fusionadas, no el modelo base completo.
- No se especifican requisitos de hardware en la model card.
- GPU recomendadas: no disponibles en la información proporcionada; para un modelo base de 70B en precisión reducida lo habitual es hardware de clase A100/H100 o múltiples GPU, pero esto no lo declara el repositorio.
- Compatibilidad con GPU de consumo: no disponible. Un modelo de 70B en cuantización agresiva puede caber en GPUs con 24-48 GB mediante técnicas de descarga a CPU o cuantización de 4 bits, pero el repositorio no lo confirma.
- Opciones de despliegue: no especificadas. Los adaptadores están en safetensors, por lo que serían cargables con frameworks de la familia Hugging Face (PEFT/Transformers), pero no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jprivera/260326_local_gpu_training | Adaptadores LoRA (dual) sobre Llama-3.3-70B-Instruct | 70B (base) | No especificado (base: 128k) | No especificada | HuggingFace, 0 descargas |
| Llama-3.3-70B-Instruct | Modelo base denso | 70B | 128 000 tokens | Llama 3.3 Community License | Publico en Meta/HuggingFace |
| Adaptadores LoRA genericos sobre Llama-3.3 | Adaptador individual | 70B (base) | Depende del modelo base | Variable | Amplia disponibilidad |

No se dispone de modelos directamente comparables en la misma categoria (adaptadores duales entrenados para estudiar colusión) dentro de la informacion proporcionada. La comparación con adaptadores LoRA genericos solo es orientativa.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo listo para producción: sin evaluaciones publicadas, sin licencia declarada y sin idiomas especificados.
- Riesgo de alucinación: inherente al modelo base Llama-3.3-70B-Instruct; no evaluado en este repositorio para las variantes fusionadas.
- Restricciones de licencia: el repositorio no declara licencia. El uso comercial queda sujeto a la licencia del modelo base (Llama 3.3 Community License), que impone condiciones adicionales.
- Sesgos: no evaluados; se heredarían los del modelo base, no documentados aquí.
- Limitaciones de contexto e idioma: no especificadas en el repositorio.
- Naturaleza dual (policy + monitor): el propósito declarado es estudiar colusión, por lo que los pesos pueden exhibir comportamientos no alineados o condicionados si se despliegan sin supervisión.
- Procedencia: copia de seguridad de un pod de RunPod, con nombres de directorio acortados respecto al original y con dependencia de un repositorio de GitHub y de chats privados de Claude para reproducir el contexto completo.
- Sin señales de adopción: 0 descargas y 0 likes, lo que reduce la validación comunitaria.
- Los resultados de búsqueda web recibidos no aportan información verificable sobre el modelo y no se han utilizado.

## Enlaces

- HuggingFace: https://huggingface.co/jprivera/260326_local_gpu_training
- Repositorio GitHub referenciado: `jprivera44/collusion_project_v0`, rama `mo3-local-gpu-merge-experiments`, carpeta `experiments/260326_local_gpu_training/`
- Chats de Claude referenciados: `jprivera/private_backup` → `260330_mo3_merge_experiments/` (privado)
- Scripts de fusión citados: `merge_lora.py`, `merge_cat.py`, `merge_scaled.py`, `merge_ties.py`, `merge_correct.py`, `svd_stats.json`
- Manifiesto de integridad: `MANIFEST.tsv`
- Resultados de evaluación referenciados: `RESULTS.md` (en el repositorio de GitHub)
