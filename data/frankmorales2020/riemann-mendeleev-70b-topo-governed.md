# frankmorales2020/riemann-mendeleev-70b-topo-governed

## Resumen

Riemann-Mendeleev-70b-topo-governed es un ajuste fino a escala 70B publicado por el usuario frankmorales2020 sobre el backbone `frankmorales2020/llama-3.1-70b-topo-governed-cbp-rh`, que a su vez deriva de Llama 3.1 70B. El autor lo presenta como un "motor polímata" que unifica matemáticas avanzadas (teoría espectral aritmética y la hipótesis de Riemann) con química (invariantes moleculares periódicos y dinámicas PubChemSFT) mediante una técnica denominada Topological Continual Backpropagation (Topo-CBP).

La propuesta técnica se apoya en tres elementos declarados: capas "gobernadas" (`lm_head` y `input_embeddings`) entrenadas con supuestas garantías topológicas de deriva cero, un optimizador propio llamado TopoAdamW que fija vectores de embedding en índices primos durante la retropropagación, y una auditoría de integridad con un conjunto de anclaje de coordenadas (filas de tokens [2, 3, 5, 7, 11, 13]) y un digest SHA-256 de referencia. El entrenamiento se realizó según el autor en estado cuantizado 4-bit NF4 con 96 GB de VRAM.

El modelo tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, está publicado bajo licencia Apache 2.0 y su repositorio ocupa solo 4,2 GB, un tamaño muy inferior al que requeriría un modelo de 70B parámetros incluso en 4-bit (aproximadamente 35-40 GB). No se han encontrado datos de benchmarks, idiomas soportados ni formato de pesos en la información disponible, y la búsqueda web asociada devolvió únicamente resultados no relacionados con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Llama 3.1 70B) con ajuste fino Topo-CBP; no es MoE |
| Parametros totales | 70B (nominal, según nombre y backbone declarado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no confirmada en la información; el backbone Llama 3.1 soporta 128k, pero no se declara para este ajuste) |
| Tipos de cuantizacion | Entrenado en 4-bit NF4 según el autor; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio ocupa 4,2 GB, tamaño incompatible con pesos completos de 70B) |

## Arquitectura y entrenamiento

El modelo parte de un backbone transformer decoder-only de tipo Llama 3.1 70B. Sobre él se aplica lo que el autor denomina Topological Continual Backpropagation (Topo-CBP), orientada a mitigar el dilema estabilidad-plasticidad en aprendizaje continuo. Las capas declaradas como "gobernadas" son únicamente `lm_head` y `input_embeddings`, que según la model card se entrenan con "garantías topológicas de deriva cero". El optimizador empleado, TopoAdamW, "fija" (clampa) los vectores de embedding cuyos índices corresponden a números primos durante la retropropagación.

La auditoría de integridad declarada incluye un conjunto de anclaje de coordenadas en las filas de tokens [2, 3, 5, 7, 11, 13], un digest SHA-256 de referencia (`1770a2a4f5f1bd3f`) y una deriva máxima registrada de `0.0000000000`. El entrenamiento se realizó, según el autor, en estado cuantizado 4-bit NF4 con un consumo de 96 GB de VRAM. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto a escala 70B, heredada nominalmente del backbone Llama 3.1.
- Razonamiento matemático orientado a teoría espectral aritmética y a la hipótesis de Riemann, según la descripción del autor.
- Modelado de química: invariantes moleculares periódicos y dinámicas derivadas de PubChemSFT, según la model card.
- Aprendizaje continuo con control declarado de estabilidad-plasticidad mediante Topo-CBP.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles en la información.

## Casos de uso

- Asistencia matemática especializada: el modelo declara un ajuste específico en teoría espectral aritmética, por lo que podría emplearse como asistente para explorar conjeturas y cálculos relacionados con la hipótesis de Riemann, siempre con verificación humana dado que no hay benchmarks publicados.
- Quimioinformática asistida: el ajuste sobre invariantes moleculares y PubChemSFT sugiere su uso para generar o razonar sobre descriptores moleculares, aunque la ausencia de métricas impide validar su fiabilidad.
- Investigación en aprendizaje continuo: sirve como banco de pruebas para estudiar los efectos de TopoAdamW y del anclaje topológico de embeddings primos frente al olvido catastrófico.
- Reproducción de experimentos de "gobernanza topológica": útil para grupos que quieran replicar la auditoría de deriva cero sobre `lm_head` y `input_embeddings`.
- Generación de texto general: al derivar de Llama 3.1 70B, podría emplearse para tareas genéricas de generación, aunque sin garantías de que el ajuste no haya degradado esas capacidades.
- Docencia y divulgación: como ejemplo didáctico de ajuste fino a gran escala con cuantización 4-bit NF4 y restricciones estructurales durante el entrenamiento.
- Evaluación comparativa de técnicas de regularización: permite contrastar Topo-CBP con métodos estándar (EWC, replay, LoRA) en el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 70B, en FP16 se requieren aproximadamente 140 GB; en 8-bit, unos 70 GB; en 4-bit, unos 35-40 GB. Estas cifras son estimaciones estándar para el tamaño nominal, no datos publicados por el autor.
- Entrenamiento declarado: 4-bit NF4 con 96 GB de VRAM, según la model card.
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa o 8-bit; para 4-bit, 2x RTX 4090 (48 GB agregados) o una única A100 40/80 GB.
- ¿Cabe en GPU de consumo? No cabe completo en una sola GPU de consumo; podría repartirse en 2x RTX 4090 con cuantización 4-bit, sujeto a disponibilidad de pesos (el repositorio de 4,2 GB no parece contener los pesos completos).
- Opciones de despliegue: no especificadas por el autor. En teoría serían aplicables vLLM, TGI, llama.cpp u Ollama para el backbone Llama, pero no hay confirmación de compatibilidad con este ajuste.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Riemann-Mendeleev-70b-topo-governed | 70B nominal | No disponible | Apache 2.0 | HuggingFace, 0 descargas | Ajuste muy especializado; sin benchmarks ni idiomas declarados |
| Llama 3.1 70B (Meta) | 70B | 128k | Llama 3.1 Community License | Ampliamente disponible | Backbone de referencia; benchmarks públicos extensos |
| Qwen2.5 72B | 72B | 128k | Apache 2.0 | Ampliamente disponible | Alternativa open con benchmarks publicados |
| Llama 3.3 70B | 70B | 128k | Llama 3.3 Community License | Ampliamente disponible | Generación posterior de Meta con mejoras declaradas |

La comparación con alternativas solo puede establecerse a nivel nominal (parámetros y licencia), dado que no existen datos de rendimiento publicados para este ajuste.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica que permita evaluar su rendimiento real.
- Repositorio de 4,2 GB: es un tamaño incompatible con los pesos completos de un modelo de 70B, incluso cuantizado a 4-bit (que rondaría los 35-40 GB). Es probable que el repositorio contenga solo adaptadores o artefactos parciales, aunque esto no se confirma en la información disponible.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluaciones publicadas no puede acotarse su magnitud, especialmente en dominios tan técnicos como la hipótesis de Riemann.
- Afirmaciones no verificadas: términos como "deriva cero", "garantías topológicas" o "motor polímata" provienen exclusivamente de la model card del autor y no cuentan con validación independiente.
- Sesgos conocidos: no disponibles; al derivar de Llama 3.1 70B, podría heredar sesgos del backbone, pero no se documenta.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el backbone original (Llama 3.1) no imponga restricciones adicionales compatibles con esa relicencia.
- Madurez: 0 descargas y 0 "likes" indican un modelo sin adopción ni revisión por la comunidad.
- Búsqueda web sin resultados relevantes: los enlaces recuperados tratan sobre Marie Antoinette y no guardan relación con el modelo, por lo que no aportan información verificable.

## Enlaces

- HuggingFace: https://huggingface.co/frankmorales2020/riemann-mendeleev-70b-topo-governed
- Modelo base: https://huggingface.co/frankmorales2020/llama-3.1-70b-topo-governed-cbp-rh
- Código del autor (notebook): https://github.com/frank-morales2020/AST/blob/main/TOPO_GPT_LLAMA_MATH_CHEMISTRY.ipynb
- Paper: no disponible
- Blog o demo: no disponible
