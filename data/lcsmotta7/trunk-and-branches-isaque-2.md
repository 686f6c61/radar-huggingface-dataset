# lcsmotta7/trunk-and-branches-isaque-2

## Resumen

Isaque 2.0 (*Trunk and Branches* / *Tronco e Ramos*) es un artefacto de adaptación PEFT publicado por Lucas Alves Motta (Beyond Adonai Research Laboratory, Indaial, Brasil) sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo entrenado desde cero, sino de un conjunto de adaptadores de bajo rango (LoRA/DoRA/O-LoRA) que implementan una arquitectura de aprendizaje continuo no destructivo denominada "columnas corticales de núcleo congelado": el tronco Qwen3.5-4B permanece íntegramente congelado y cada nueva habilidad se incorpora como un cartucho ortogonal independiente de aproximadamente 16 MiB. El enrutamiento entre cartuchos se realiza mediante un mecanismo analítico denominado Sparsegen LD-MoLE sobre una estructura de árbol `.mmap` de tres niveles.

El trabajo se presenta como una monografía técnica de 18 páginas con DOI en Zenodo y auditoría experimental longitudinal ejecutada sobre una única GPU de consumo (NVIDIA GeForce RTX 5060 de 8 GB), con telemetría de potencia registrada (22,3–23,3 W en inferencia activa del tronco de 4B). Los dominios de especialización declarados incluyen síntesis 3D determinista (Blender 5.2.1 LTS con `bmesh`), generación de código C++20 para Unreal Engine 5 y Rust, además de un pipeline de streaming NTAPI de cuatro etapas para emplear Qwen3.5-35B-A3B como crítico "System-2" en CPU.

Su relevancia actual es metodológica más que de rendimiento bruto: propone un esquema reproducible de especialización incremental que evita el olvido catastrófico (según el autor, preserva el 100 % de las habilidades previas a lo largo de 10 oleadas de entrenamiento) y cuantifica el coste energético de la adaptación en hardware doméstico. El repositorio de Hugging Face, en el momento de la consulta, no contiene pesos publicados (tamaño 0.0 GB), cero descargas y cero likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PEFT sobre transformer híbrido Qwen3.5 (tronco congelado) + adaptadores DoRA + O-LoRA enrutados por Sparsegen LD-MoLE |
| Parámetros totales | no disponible (el tronco base Qwen3.5-4B; los adaptadores suman ~16,00 MiB por cartucho) |
| Parámetros activos | no disponible (el enrutamiento LD-MoLE opera sobre cartuchos, no sobre expertos del tronco) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, sin especificar en la model card) |
| Tipos de cuantización | no disponible (se mencionan `mmproj-BF16` y ejecución del crítico 35B-A3B con `--cpu-moe`) |
| Idiomas soportados | inglés (en), portugués (pt) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | adaptadores PEFT (librería `peft`); no se especifican safetensors/GGUF en la información disponible |

## Arquitectura y entrenamiento

La arquitectura es de dos niveles. El nivel inferior ("tronco") es Qwen/Qwen3.5-4B, mantenido al 100 % congelado durante todo el proceso de especialización. El nivel superior ("ramas") está compuesto por cartuchos corticales de 16,00 MiB que combinan dos técnicas de adaptación de bajo rango: DoRA (Weight-Decomposed Low-Rank Adaptation) y O-LoRA (Orthogonal LoRA), de forma que los subespacios de cada nueva habilidad se mantienen ortogonales respecto a los anteriores y no sobrescriben el conocimiento previo. El enrutamiento entre cartuchos se realiza con Sparsegen LD-MoLE: una mezcla de expertos de bajo rango con selección Top-2 sobre un símplex, implementada mediante concatenación PEFT (`PEFT cat`) sin términos cruzados, y servida desde un árbol jerárquico de tres niveles mapeado en memoria (`.mmap` zero-copy) con latencia de enrutamiento declarada de 0,015 ms.

El entrenamiento se describe como un ciclo de "oleadas" (waves) de aprendizaje continuo. La auditoría reporta 10 oleadas: un adaptador monolítico convencional sufre ruptura catastrófica a partir de la tercera oleada (98,51 % de degradación) y cae al 75,31 % de precisión y 31,37 % de verosimilitud en la décima, mientras que el enrutamiento quirúrgico LD-MoLE Top-2 preserva el 100,00 % de las habilidades a lo largo de las 10 oleadas. Se reporta también retropropagación real a través de las 32 capas del tronco con 218,36–412,48 tok/s y una reducción del 86,76 % en la pérdida de entropía cruzada sobre sondas privadas (2,429 → 0,322). No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

Entre las innovaciones técnicas declaradas destacan: el pipeline de streaming NTAPI de cuatro etapas en Windows (`VirtualLock`, `NO_BUFFERING`, `DiscardVirtualMemory`) con un delta de swap de +0,0039 MiB al cargar un MoE de 13,50 GiB a 1,75 GiB/s; la paridad de vocabulario del 100 % sobre 248.320 tokens; la alineación multimodal Procrustes (`VICOP`) con proyección 2560→384 dimensiones y Recall@5 del 96,00 % sobre 600 pares no vistos; y la "Ley de DAG modular escalonada", que establece que solo debe haber un cartucho especialista por etapa de un DAG causal (máximo 3 oleadas hermanas por cartucho), ya que la mezcla de logits token a token entre oleadas de código distintas produce `SyntaxError` en el AST.

## Capacidades

- Generación de texto y razonamiento general heredados del tronco Qwen3.5-4B, con especialización incremental por cartuchos.
- Generación de código en C++20 para Unreal Engine 5: la auditoría reporta 8/8 reglas UE5 C++20 cumplidas con el cartucho enseñado frente a 0/4 del tronco sin adaptar.
- Generación de código en Rust (etiqueta declarada en el repositorio).
- Síntesis 3D determinista mediante Blender 5.2.1 LTS y su API `bmesh`, con validación de malla (0 aristas no manifold, 0,0 % de error de bounding box en la ablación reportada).
- Aprendizaje continuo no destructivo: incorporación de nuevas habilidades sin degradar las anteriores, mediante cartuchos ortogonales y enrutamiento Top-2.
- Enrutamiento de mezcla de expertos de bajo rango (LD-MoLE) con selección de cartucho por etapa causal.
- Capacidades multimodales limitadas a la alineación de proyección declarada (`VICOP`, `mmproj-BF16`) sobre pares imagen-texto; no se detalla si el resultado es un modelo visión-lenguaje completo.
- Uso de un crítico externo Qwen3.5-35B-A3B en CPU (`--cpu-moe`) como juez ciego "System-2" en el pipeline de evaluación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible como capacidad del modelo; el pipeline descrito es de ejecución modular por etapas, no un agente autónomo.
- Capacidades multilingües: inglés y portugués.

## Casos de uso

- Especialización incremental de un asistente de código por dominio: se entrenan cartuchos independientes para Rust, C++20/UE5 y scripting de Blender, y el enrutador LD-MoLE selecciona el cartucho adecuado según la etapa del pipeline. Es adecuado porque cada cartucho ocupa ~16 MiB y no requiere reentrenar el tronco de 4B.
- Generación de código C++20 para Unreal Engine 5 en producción de videojuegos: el cartucho especializado cumple las 8 reglas de la auditoría frente a 0/4 del tronco, lo que permite integrarlo en un pipeline de compilación `clang++ -std=c++20` con validación automática.
- Síntesis procedural de mallas 3D: uso del cartucho Blender `bmesh` para generar geometría validable (sin aristas no manifold, error de bounding box nulo) en flujos de assets para motores gráficos.
- Despliegue en hardware de consumo: todo el sistema se ejecuta en una RTX 5060 de 8 GB con 22,3–23,3 W en inferencia, lo que lo hace apto para estaciones de trabajo modestas o portátiles con GPU de gama media.
- Investigación en aprendizaje continuo: reproducción del benchmark de 10 oleadas para medir olvido catastrófico y comparar adaptadores monolíticos frente a enrutamiento modular.
- Asistencia bilingüe inglés-portugués en documentación técnica: el par de idiomas declarado cubre la redacción de documentación de ingeniería para equipos lusófonos.
- Evaluación con juez ciego de bajo coste: el pipeline NTAPI permite cargar un MoE de 13,50 GiB en CPU con delta de swap despreciable (+0,0039 MiB) para usar Qwen3.5-35B-A3B como crítico sin GPU adicional.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones de la auditoría del autor, no resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen tal cual, sin normalización:

| Medición | Resultado reportado |
|---|---|
| Potencia en inferencia activa (4B, RTX 5060) | 22,3–23,3 W |
| Potencia en entrenamiento | 28–31 W |
| VRAM en reposo | 0 MB |
| Carga del MoE 35B-A3B (13,50 GiB) | 1,75 GiB/s, delta de swap +0,0039 MiB |
| Paridad de vocabulario | 100,0 % (248.320 tokens) |
| Retropropagación a través de 32 capas | 218,36–412,48 tok/s |
| Reducción de pérdida CE en sondas privadas | −86,76 % (2,429 → 0,322) |
| Alineación multimodal `VICOP` | 449 ms, Recall@5 = 96,00 % (600 pares no vistos) |
| Conductividad cognitiva (ICC) | 0,5121 → 2,7828 (5,43×) |
| Ablación sináptica causal (KEV-1.0) | Tronco crudo 0/4 (1,77/10) vs. cartucho enseñado 4/4 (9,67/10) |
| Reglas UE5 C++20 | 8/8 con cartucho; 0/4 sin él |
| Ruptura monolítica en 10 oleadas | 98,51 % en k=3; 75,31 % acc / 31,37 % lik. en k=10 |
| Retención con LD-MoLE Top-2 | 100,00 % en las 10 oleadas |
| Latencia de enrutamiento en árbol `.mmap` | 0,015 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del tronco 4B: no disponible con precisión; el autor reporta ejecución estable en una GPU de 8 GB.
- GPU recomendadas: NVIDIA GeForce RTX 5060 de 8 GB (la única verificada en la auditoría). No se reportan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, según la auditoría, en una RTX 5060 de 8 GB con 0 MB de VRAM en reposo.
- Crítico System-2: Qwen3.5-35B-A3B (13,50 GiB) se ejecuta en CPU con `--cpu-moe` mediante el pipeline NTAPI; requiere Windows y suficiente memoria del sistema.
- Opciones de despliegue: la librería declarada es `peft`; se menciona el uso de concatenación PEFT (`PEFT cat`) y árbol `.mmap`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: enrutamiento 0,015 ms; retropropagación 218,36–412,48 tok/s; alineación multimodal 449 ms. No se reporta throughput de generación en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Isaque 2.0 (este artefacto) | PEFT sobre Qwen3.5-4B; ~16 MiB por cartucho | no disponible | Aprendizaje continuo modular con DoRA + O-LoRA y enrutamiento LD-MoLE | CC-BY-4.0 | Repositorio HF vacío (0.0 GB), 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B (según denominación) | no disponible | Transformer híbrido denso | no disponible en esta ficha | Público en Hugging Face |
| Qwen/Qwen3.5-35B-A3B | ~35B totales, ~3B activos (según denominación) | no disponible | MoE | no disponible en esta ficha | Público en Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos publicados (tamaño 0.0 GB, 0 descargas, 0 likes). Los adaptadores no son descargables desde la plataforma en el momento de la consulta.
- Las métricas de la model card son mediciones internas del autor, sin replicación independiente ni comparación con benchmarks estándar.
- El conjunto de evaluación (600 pares multimodales, sondas privadas, 10 oleadas) no está descrito con suficiente detalle para reproducir los resultados.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda el del tronco Qwen3.5-4B.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: solo inglés y portugués declarados; el rendimiento en castellano no está verificado.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero debe verificarse la licencia del modelo base Qwen3.5-4B, que puede imponer condiciones adicionales.
- Dependencia de plataforma: el pipeline de streaming NTAPI y las optimizaciones de swap son específicas de Windows; la portabilidad a Linux no está documentada.
- La "ley de DAG modular escalonada" advierte que mezclar logits de cartuchos de código distintos produce errores de sintaxis, lo que restringe el uso a un especialista por etapa causal (máximo 3 oleadas hermanas por cartucho).
- La nomenclatura y las afirmaciones de la model card (por ejemplo, "paridad de vocabulario del 100 %", "conductividad cognitiva") emplean terminología propia no estandarizada; conviene tratarlas como hipótesis del autor hasta su validación externa.
- El tamaño del repositorio (0.0 GB) es incompatible con la publicación efectiva de los 16 MiB por cartucho descritos; verificar antes de cualquier integración en producción.

## Enlaces

- Hugging Face: https://huggingface.co/lcsmotta7/trunk-and-branches-isaque-2
- Repositorio GitHub bilingüe (EN + PT-BR): https://github.com/lcsmotta7/trunk-and-branches-isaque-2
- DOI Zenodo: https://doi.org/10.5281/zenodo.24221509
- Monografía PDF en inglés: https://github.com/lcsmotta7/trunk-and-branches-isaque-2/releases/download/v5.0.0/trunk_and_branches_isaque_2_0_en_doi_24221509.pdf
- Monografía PDF en portugués: https://github.com/lcsmotta7/trunk-and-branches-isaque-2/releases/download/v5.0.0/tronco_e_ramos_isaque_2_0_pt_br_doi_24221509.pdf
- ORCID del autor: https://orcid.org/0009-0001-3081-5505
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Crítico System-2: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Figura 1 (arquitectura y telemetría): https://raw.githubusercontent.com/lcsmotta7/trunk-and-branches-isaque-2/main/assets/fig1_en.png
- Figura 4 (curva de saturación y ruptura): https://raw.githubusercontent.com/lcsmotta7/trunk-and-branches-isaque-2/main/assets/fig4_en.png
- Figura 5 (enrutador jerárquico y DAG): https://raw.githubusercontent.com/lcsmotta7/trunk-and-branches-isaque-2/main/assets/fig5_en.png
- Figura 6 (síntesis 3D neuronal): https://raw.githubusercontent.com/lcsmotta7/trunk-and-branches-isaque-2/main/assets/fig6_en.png
