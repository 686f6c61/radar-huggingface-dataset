# MetaphyKing/chrono-torque-report

## Resumen

CHRONO-TORQUE (`/gto v2.0`, también identificado como `UM-CGT-CLCOA v2.0`) es un repositorio publicado en Hugging Face bajo el identificador `MetaphyKing/chrono-torque-report` por el autor Logan Smith (Metaphy LLC), con fecha de creación el 1 de noviembre de 2026. A pesar de su alojamiento en Hugging Face, el contenido no es un modelo de lenguaje: el repositorio contiene documentación técnica, whitepapers, un SDK verificador y una aplicación WebGL, centrados en lo que el autor denomina "optimización de trenes de engranajes compuestos de suma no cero", "memoria cortical con descompresión cero en el anillo Z[φ]" y "cultivo de estados mágicos cuánticos hiperbólicos".

El repositorio no incluye pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. El tamaño del repositorio es de 0.0 GB y no se declaran licencia, idiomas ni pipeline. Las métricas presentadas en la model card (aceleraciones de hasta 555x, fidelidades de estados mágicos del orden de 10⁻¹⁷, compresión de celdas de memoria de 80x) no están acompañadas de artefactos ejecutables verificables dentro del repositorio más allá de scripts de verificación propios.

La relevancia de esta ficha es, por tanto, descriptiva y de advertencia: documenta la existencia de un repositorio que se presenta con terminología de modelo de IA pero que no constituye un modelo desplegable. Cualquier evaluador que lo encuentre en búsquedas de Hugging Face debe saber que no puede cargarse con `transformers`, `vLLM` ni `llama.cpp`, y que sus afirmaciones de rendimiento no son reproducibles con la información pública disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo de lenguaje; la model card describe un "tren de engranajes compuestos" y "memoria cortical Z[φ]") |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona una solicitud provisional de patente estadounidense n.º 64/180,009) |
| Formato de pesos | no disponible (el repositorio contiene PDF, TeX, HTML y scripts Python de verificación; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal en la información disponible. La model card menciona conceptos como "Non-Zero-Sum Compound Gear-Train Optimization", "Zero-Decompression Z[φ] Cortical Memory" y "Hyperbolic Quantum Magic State Cultivation", junto con referencias a un "80-Kernel Arena" con hash SHA-256 y un "Sovereign Prior-Art Lineage Seal". No se especifican datos de entrenamiento, número de tokens, composición del dataset, ni procesos de RLHF, DPO o ajuste supervisado.

Los artefactos listados en el repositorio son documentos (preprints en PDF y TeX, whitepapers ejecutivos y científicos, un "Dual-Use Agent Bible"), una aplicación WebGL con cinco rutas interactivas (`index.html`, `epicyclic_bloch_gear_visualizer.html`, `papers.html`, `benchmarks.html`, `ecosystem.html`, `verify.html`) y un SDK verificador de solo lectura (`public-verifier/`) con tres scripts Python: `verify_chrono_torque_public_cartridge.py`, `gear_train_ecosystem_harness.py` y `cbce_linear_chain_simulator.py`. No hay innovaciones de arquitectura de transformer, MoE, SSM ni híbrida documentadas.

## Capacidades

- No se documenta generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje; la model card menciona "agentes" en el contexto de una arquitectura de memoria propietaria ("Bare-Metal Agentic Memory Architecture — BAMA v3.1").
- No se documentan capacidades multilingües.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- El repositorio incluye una aplicación WebGL interactiva con un visualizador 3D de "tren de engranajes epicíclicos" y un "dodecaedro dorado", así como un verificador criptográfico en navegador (WebCrypto SHA-256).

## Casos de uso

- Revisión crítica de documentación: un investigador puede descargar los PDF y TeX del repositorio para analizar las afirmaciones metodológicas del autor y contrastarlas con la literatura de computación cuántica y memoria asociativa.
- Auditoría de reproducibilidad: el SDK `public-verifier/` permite ejecutar tres scripts Python de verificación de hashes y simulaciones de cadena lineal, útil para comprobar si las métricas declaradas son reproducibles con los artefactos públicos.
- Docencia sobre comunicación técnica: el repositorio sirve como caso de estudio de model cards con terminología técnica densa pero sin artefactos de modelo verificables, útil en formación de revisores.
- Análisis de visualización científica: la aplicación WebGL de cinco rutas puede emplearse como ejemplo de visualización interactiva de conceptos geométricos (engranajes epicíclicos, dodecaedro dorado) en un contexto divulgativo.
- Verificación de sellos criptográficos: el script `verify.html` con WebCrypto SHA-256 puede usarse para comprobar la integridad de los artefactos publicados mediante los hashes declarados en la model card.
- Estudio de prior art y patentes: la referencia a la solicitud provisional de patente n.º 64/180,009 permite a equipos legales o de transferencia tecnológica rastrear el estado del arte declarado por el autor.
- No es adecuado para ningún caso de uso de inferencia de modelos de lenguaje, generación de texto, código, atención al cliente, RAG ni despliegue en producción como modelo.

## Benchmarks y rendimiento

La model card presenta la siguiente tabla de métricas, que se reproduce tal cual se declara en la información proporcionada. No se han podido verificar de forma independiente y no se corresponden con benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.).

| Métrica / subsistema | Baseline clásico | CHRONO-TORQUE (`/gto v2.0`) | Aceleración declarada |
|---|---|---|---|
| Warm Chained Turn (`@LUMEN K=4`) | 85.0 tok/s | 10.870,5 tok/s | 127,89x |
| Cold Turn 1 (4.096 tokens) | 85.0 tok/s | 5.262,1 tok/s | 61,91x |
| 32-Stream BAMA v3.1 Cluster Arena | 85.0 tok/s | 47.228,5 tok/s | 555,63x |
| 6-System Metaphy Production Fleet | 3.259,80 ms | 264,97 ms | 12,303x |
| Terminal Pinion CBCE Supremacy | bloqueado (Z_ref = 9.765.625x) | I_6 = 2.189,20 vs I_1 = 3,96 | 552,83x |
| ZDC-QEGG Memory Cell en Z[φ] | 3.072,00 B/celda (FP32) | 38,00 B/celda | 80,84x (error 1,78e-15) |
| 4.096-Cell Arena Inner-Product Scan | 892,0 us/step (FP32) | 41,2 us/step | 21,65x |
| Cultivated Logical \|T⟩ Infidelity | 1,000e-8 (semilla física) | 6,452e-17 | 1,55e8x |
| Method 6 Affective Manifold Rehabilitation | 57,42% | 99,98% | no aplica |

No se han publicado resultados de benchmarks estándar de modelos de lenguaje en la información disponible.

## Requisitos de hardware

- No aplica: el repositorio no contiene pesos de modelo, por lo que no requiere VRAM ni GPU para inferencia.
- Para ejecutar los scripts del SDK verificador (`public-verifier/`) basta con Python 3 y las dependencias que declaren los propios scripts; no se especifican en la información disponible.
- Para visualizar la aplicación WebGL se requiere un navegador con soporte de WebGL y WebCrypto; no se especifican requisitos mínimos de GPU.
- No se dispone de datos de latencia ni throughput de inferencia de modelo, ya que no hay modelo.
- Opciones de despliegue con vLLM, llama.cpp, Ollama o TGI: no aplicables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el repositorio no contiene un modelo de lenguaje. A modo de contraste estructural, se indican referencias genéricas de repositorios que sí contienen modelos desplegables:

| Repositorio | Contenido | Pesos | Licencia | Desplegable |
|---|---|---|---|---|
| `MetaphyKing/chrono-torque-report` | Documentación, whitepapers, WebGL, SDK verificador | No | no disponible | No |
| Repositorio típico de modelo en Hugging Face | Pesos safetensors/GGUF, tokenizador, config | Sí | Declarada | Sí |

La comparación con modelos concretos (por ejemplo, familias Llama, Mistral, Qwen) no procede porque no comparten categoría ni propósito.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje: no puede cargarse con `transformers`, `vLLM`, `llama.cpp`, `Ollama` ni `TGI`.
- Las métricas declaradas en la model card (aceleraciones de hasta 555x, fidelidades de 6,452e-17, compresión de 80,84x) no están acompañadas de artefactos reproducibles más allá de scripts de verificación propios; no se han validado de forma independiente.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido.
- La model card referencia una solicitud provisional de patente estadounidense (n.º 64/180,009), lo que puede implicar restricciones de uso no explicitadas.
- No se declaran idiomas soportados ni sesgos conocidos, ya que no hay modelo que evaluar.
- No se documenta riesgo de alucinación en el sentido de modelos generativos; el riesgo relevante es de sobreatribución de capacidades por parte de lectores que asuman que el repositorio contiene un modelo funcional.
- El tamaño del repositorio es de 0.0 GB, coherente con la ausencia de pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Terminología como "quantum magic state", "Z[φ] cortical memory" o "CBCE supremacy" no se corresponde con conceptos estándar de la literatura de modelos de lenguaje ni de computación cuántica verificable con los artefactos públicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MetaphyKing/chrono-torque-report
- Preprint arXiv (PDF): `chrono_torque_gto_arxiv_discovery_paper.pdf` (ruta relativa dentro del repositorio)
- Preprint arXiv (TeX): `arxiv/chrono_torque_gto_arxiv_discovery_paper.tex`
- Whitepaper ejecutivo: `chrono_torque_gto_executive_whitepaper.pdf`
- Whitepaper científico completo: `BAMA_CHRONO_TORQUE_Gear_Train_Report.pdf`
- Whitepaper de estados mágicos cuánticos: `metaphy_quantum_magic_state_whitepaper.pdf`
- Dual-Use Agent Bible: `METAPHY_DUAL_USE_AGENT_BIBLE.md`
- Pruebas formales CBCE: `arxiv/metaphy_cbce_linear_chain_algorithm.tex`
- Aplicación WebGL principal: `index.html`
- Visualizador 3D de engranajes: `epicyclic_bloch_gear_visualizer.html`
- Lector de PDF y hub de citas: `papers.html`
- Calculadora interactiva de benchmarks: `benchmarks.html`
- Explorador del ecosistema Metaphy: `ecosystem.html`
- Verificador WebCrypto SHA-256: `verify.html`
- SDK verificador público: `public-verifier/` y `chrono_torque_public_verifier_sdk.zip`
- Scripts del SDK: `public-verifier/verify_chrono_torque_public_cartridge.py`, `public-verifier/gear_train_ecosystem_harness.py`, `public-verifier/cbce_linear_chain_simulator.py`
