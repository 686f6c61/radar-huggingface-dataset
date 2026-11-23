# bviggiano/ProteinDPO

## Resumen

ProteinDPO es un modelo de diseño de secuencias de proteínas obtenido al afinar ESM-IF1 (modelo de *inverse folding* de Meta AI Research) mediante *Direct Preference Optimization* (DPO) sobre mediciones experimentales de estabilidad proteica. Lo desarrollaron Talal Widatalla, Rafael Rafailov y Brian Hie en el Laboratory of Evolutionary Design de la Universidad de Stanford. El problema que resuelve es concreto: dado un esqueleto tridimensional de proteína (*backbone*), el modelo genera secuencias que lo pliegan, pero ESM-IF1 sin afinar no distingue entre secuencias estabilizantes y desestabilizantes; ProteinDPO introduce esa preferencia.

La relevancia radica en que aplica el paradigma de alineamiento con preferencias humanas (DPO, el mismo usado en LLMs) a un dominio biológico con señal experimental cuantitativa: los pares de preferencia se construyen a partir de diferencias de estabilidad medidas en laboratorio, no de juicios humanos. Esto lo convierte en un caso de estudio de alineamiento de modelos generativos con *fitness* experimental.

Arquitectura y tamaño: es ESM-IF1 con backbone GVP-Transformer (invariante a rotaciones y traslaciones), configuración `esm_if1_gvp4_t16_142M_UR50`, es decir, unos 142 millones de parámetros. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido habitual. Este repositorio de Hugging Face es un espejo no modificado de los pesos publicados en Zenodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GVP-Transformer (ESM-IF1, variante `esm_if1_gvp4_t16_142M_UR50`): capas de *Geometric Vector Perceptron* seguidas de transformer encoder |
| Parametros totales | ~142 M (según el identificador del checkpoint base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de inverse folding; opera sobre el grafo de residuos del backbone, no sobre texto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en precisión nativa, `paired_weights.pt`) |
| Idiomas soportados | no aplica; la model card declara `en` solo para metadatos. El dominio es secuencias de aminoácidos (alfabeto de 20 residuos + X) |
| Licencia | MIT (Copyright 2024 Laboratory of Evolutionary Design) |
| Formato de pesos | PyTorch `state_dict` en `paired_weights.pt` (566.807.302 bytes), empaquetado en `paired_weights.pt.zip` (526.918.292 bytes) |

## Arquitectura y entrenamiento

El modelo base ESM-IF1 resuelve la tarea inversa al plegamiento: recibe las coordenadas atómicas del esqueleto proteico y predice la distribución de aminoácidos en cada posición. Su arquitectura combina capas GVP, que procesan features vectoriales y escalares de forma equivariante a rotaciones, con un transformer encoder que modela las dependencias entre residuos. El checkpoint afinado mantiene íntegra esta arquitectura; DPO solo modifica los pesos.

El entrenamiento con DPO parte de pares de secuencias para un mismo backbone, etiquetadas como preferidas o no preferidas según mediciones experimentales de estabilidad (por ejemplo, datos de ΔΔG de mutagénesis). La pérdida DPO empuja la probabilidad de la secuencia estabilizante por encima de la desestabilizante sin necesidad de un modelo de recompensa explícito ni de RL. El paper asociado (Widatalla, Rafailov y Hie, bioRxiv 2024) describe el procedimiento completo; la model card no detalla el número de tokens, la composición exacta del dataset ni hiperparámetros de entrenamiento.

## Capacidades

- *Inverse folding*: dada una estructura 3D de proteína, genera secuencias de aminoácidos compatibles con ese backbone.
- Puntuación de secuencias: evalúa la log-verosimilitud de una secuencia dada para un backbone concreto, útil para ranking y filtrado.
- Preferencia por estabilidad: frente al ESM-IF1 original, sesga la generación hacia secuencias con mayor estabilidad experimental.
- Generación condicionada por posición: permite fijar residuos (por ejemplo, el sitio activo) y rediseñar el resto.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión ni audio; no es un modelo conversacional.
- Capacidad multilingüe: no aplica; el espacio de salida es el alfabeto de aminoácidos.

## Casos de uso

- Rediseño de estabilidad de enzimas: partiendo de la estructura cristalográfica de una enzima, generar variantes de secuencia y priorizar las que el modelo puntúa como estabilizantes antes de sintetizarlas y medirlas, reduciendo el número de ensayos húmedos.
- Ingeniería de anticuerpos: rediseñar regiones marco conservando las CDR fijas por posición, buscando variantes con mejor estabilidad térmica o de expresión.
- Optimización de candidatos terapéuticos: filtrar secuencias generadas por otros modelos generativos según su preferencia de estabilidad, como etapa de *scoring* en un pipeline de diseño.
- Estudio de alineamiento con *fitness*: usar el modelo como referencia metodológica para aplicar DPO a otros dominios biológicos con señal experimental cuantitativa.
- Diseño de proteínas *de novo* con restricciones estructurales: fijar el esqueleto de un diseño computacional y obtener secuencias alternativas que el modelo considere más estables.
- Docencia e investigación en biología computacional: reproducir el pipeline del repositorio `evo-design/protein-dpo` para comparar ESM-IF1 frente a la versión afinada en tareas de ranking de mutantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (DOI 10.1101/2024.05.20.595026) para las métricas de estabilidad y las comparaciones con ESM-IF1 y otros métodos, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada: con ~142 M de parámetros en FP32, los pesos ocupan unos 0,57 GB; la inferencia completa con activaciones y grafo de residuos se mantiene holgadamente por debajo de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 en adelante).
- Despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, que asumen modelos de lenguaje. Se ejecuta con PyTorch cargando el `state_dict` sobre la implementación de ESM-IF1 del repositorio `facebookresearch/esm` o mediante el código de `evo-design/protein-dpo`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Señal de estabilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProteinDPO | ~142 M | Inverse folding con preferencia | Sí (DPO sobre datos experimentales) | MIT | Pesos en Zenodo y este espejo |
| ESM-IF1 (base) | ~142 M | Inverse folding | No (verosimilitud sin afinar) | MIT | `facebookresearch/esm` |
| ProteinMPNN | ~1,7 M | Inverse folding | No (entrenado con secuencias naturales) | MIT | Código y pesos públicos |
| LigandMPNN | ~1,7 M | Inverse folding con ligandos | No | MIT | Código y pesos públicos |

La comparación con ProteinMPNN y LigandMPNN se ofrece como referencia de categoría; no se dispone de resultados comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- Solo predice secuencias; no valida plegamiento ni estabilidad real. Toda secuencia generada requiere verificación experimental o por predictores independientes (AlphaFold, Rosetta, etc.).
- El sesgo hacia estabilidad puede reducir la diversidad de secuencias generadas y penalizar variantes funcionalmente ventajosas pero menos estables.
- Entrenado sobre un conjunto limitado de mediciones experimentales; su generalización a familias proteicas poco representadas en esos datos no está caracterizada en la información disponible.
- No es un modelo de lenguaje: no acepta prompts en lenguaje natural ni tiene contexto conversacional.
- Licencia MIT permite uso comercial, pero el usuario debe verificar la licencia del modelo base ESM-IF1 (MIT) y citar el paper original.
- Este repositorio es un espejo no oficial; conviene verificar la integridad del archivo con el MD5 y SHA-256 indicados en la model card antes de usarlo en producción.
- No hay información sobre sesgos de composición de aminoácidos ni sobre calibración de las puntuaciones de preferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bviggiano/ProteinDPO
- Registro Zenodo (fuente original): https://zenodo.org/records/11218181
- DOI Zenodo: https://doi.org/10.5281/zenodo.11218181
- Paper (bioRxiv): https://doi.org/10.1101/2024.05.20.595026
- Paper (URL directa): https://www.biorxiv.org/content/early/2024/05/21/2024.05.20.595026
- Código: https://github.com/evo-design/protein-dpo
- Modelo base ESM-IF1: https://github.com/facebookresearch/esm
