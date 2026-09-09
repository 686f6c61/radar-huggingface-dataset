# guneys/sipher-local-only-ppl28

## Resumen

Sipher v1 (`local_only_ppl28`) es un modelo de lenguaje decoder de ~254 millones de parámetros, entrenado desde cero sobre un corpus turco de unos 688 millones de tokens. Lo desarrolla el usuario guneys como una previsualización de investigación orientada a la inferencia bajo cifrado homomórfico totalmente homomórfico (FHE) con el esquema CKKS. Su principal singularidad es que todas las operaciones del paso hacia delante son multiplicaciones matriz-vector o funciones polinómicas, lo que permite ejecutar el modelo de extremo a extremo bajo cifrado homomórfico, una propiedad poco común en los modelos de lenguaje actuales.

Arquitectónicamente, combina un embedding factorizado (16.000 → 128 → 1024), atención softmax con ventana local de 32 tokens y una ruta global lineal que está desactivada en este checkpoint (gate_global = 0,0), junto con una FFN polinómica de grado 2. Tiene 20 capas, 16 cabezas, una dimensión de modelo de 1024 y una ventana de contexto de 256 tokens. El autor reporta una perplejidad de entrenamiento de 28,8 y verifica que el motor FHE reproduce las elecciones de tokens del modelo en claro: una capa con cos_sim de 0,9996 y top-5 exacto, y 20 capas con top-1 exacto tras 6 bootstraps en GPU.

Se trata de un artefacto de investigación, no de un chatbot de producción: la generación es coherente solo durante unas pocas frases, la latencia FHE es de ~1 minuto por token y la ruta global en FHE está actualmente rota. Resulta relevante para investigadores en privacidad computacional, arquitecturas de modelos compatibles con FHE y procesamiento de lenguaje en turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sipher hybrid decoder: embedding factorizado + atención softmax con ventana local + ruta global lineal gated desactivada + PolyFFN con activación polinómica |
| Parámetros totales | ~254 millones (float32) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (ventana local de 32) |
| Tipos de cuantización | No disponible (sin soporte documentado de formatos estándar de cuantización) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

Sipher v1 es un decoder híbrido diseñado específicamente para ser compatible con inferencia bajo CKKS. La arquitectura sustituye operaciones no polinómicas (softmax completo, activaciones ReLU/GELU, etc.) por componentes polinómicos: la atención usa una ventana local de 32 tokens con softmax, la FFN emplea una activación polinómica de grado 2 y el embedding está factorizado en dos pasos (16.000 → 128 → 1024) para reducir el coste de multiplicaciones matriciales bajo cifrado. Las dimensiones principales son d_model = 1024, 20 capas, 16 cabezas y d_k = 64. La ruta global lineal (gated linear-global) está congelada con gate_global = 0,0, mientras que gate_local es aprendido; esta decisión responde a un hallazgo negativo del autor: forzar la ruta global lineal degradaba la generación en comparación con la ventana local por sí sola.

El entrenamiento se realizó sobre aproximadamente 688 millones de tokens turcos de fuentes diversas: OSCAR limpio, textos financieros seleccionados, Wikipedia-TR filtrada por finanzas, estatutos de mevzuat.gov.tr, documentos reguladores de BDDK/SPK/TCMB, libros de dominio público, un libro de texto generado y Wikisource. El dataset crudo no se redistribuye por razones de licencia y tamaño. La receta de entrenamiento incluye `--freeze-gate-global --gate-global-init 0`, `--no-mixer`, `--poly-ffn`, `--feat-degree 1`, generación causal y pad-free. La perplejidad de entrenamiento resultante es de aproximadamente 28,8. El tokenizer es un BPE turco de 16.000 piezas, que presenta problemas de fragmentación en palabras aglutinantes turcas (p. ej., «hiss eler»).

## Capacidades

- Generación de texto en turco: produce continuaciones coherentes durante unas pocas frases, aunque la coherencia se degrada después de 3-4 oraciones debido a la ventana local de 32 tokens.
- Inferencia homomórfica CKKS: el modelo está construido para que todas las operaciones del forward sean matvec o polinomios, permitiendo ejecutar el modelo bajo cifrado homomórfico.
- Verificación de paridad FHE: el motor C++/GPU (OpenFHE + FIDESlib) reproduce las elecciones de tokens del texto en claro, con cos_sim ≈ 0,9996 y top-5 5/5 en una capa; a 20 capas, el top-1 exacto coincide con el modelo en claro.
- Protocolo híbrido: el servidor ejecuta operaciones CKKS (matvec, multiplicación polinómica ct×ct, residuos) mientras que la softmax de la ventana local y parte del estado KV se procesan en el cliente; no es un FHE totalmente no interactivo.
- Sin soporte documentado de tool calling ni function calling.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Multilingüe: no, solo turco.

## Casos de uso

- Investigación en privacidad computacional: el modelo permite a un laboratorio evaluar cómo se comporta un LM pequeño bajo cifrado CKKS. Se puede ejecutar con el motor FHE del repo y comparar logits cifrados con los del modelo en claro, obteniendo métricas de paridad y de latencia por bootstrap.
- Benchmark de arquitecturas FHE-friendly: sirve como referencia para diseñar nuevas capas de atención y FFN que sean compatibles con operaciones polinómicas. Un investigador puede modificar la PolyFFN o el tamaño de la ventana local y medir el impacto en perplejidad y en el coste de bootstraps.
- Prueba de concepto de análisis de texto cifrado: en un escenario donde un proveedor procesa documentos financieros turcos confidenciales, se puede emplear el protocolo híbrido para generar resúmenes o continuaciones sin revelar el contenido al servidor, aunque con la latencia y las limitaciones descritas.
- Estudio de tokenización en lenguas aglutinantes: el BPE turco de 16K muestra fragmentación problemática; el modelo es un caso de estudio para comparar tokenizadores más grandes o algoritmos de subword para turco.
- Documentación de resultados negativos: el checkpoint congela la ruta global lineal porque su activación degradaba la generación. Es un artefacto reproducible para investigar cuándo los mecanismos de atención global no aportan valor en modelos pequeños con ventana local.
- Docencia en criptografía aplicada: en un curso de seguridad o de sistemas, se puede presentar como ejemplo de un modelo que ejecuta inferencia sobre texto cifrado, con sus limitaciones reales de latencia y precisión en lugar de una solución idealizada.
- Evaluación de representaciones en turco: investigadores en PLN pueden cargar el modelo con el código del repo y hacer probing lingüístico sobre las capas internas, aunque no tengan interés inmediato en FHE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos publicados son internos al proyecto:

| Métrica | Resultado | Nota |
|---|---|---|
| Perplejidad de entrenamiento | 28,8 | Sobre el conjunto de entrenamiento; no es un benchmark external |
| Paridad de una capa (FHE) | cos_sim ≈ 0,9996, top-5 5/5 | Comparación entre logits en claro y cifrados en una capa |
| Inferencia FHE de 20 capas | top-1 exacto (cos(logits) = 1,0) | Con 6 bootstraps en GPU |

## Requisitos de hardware

- VRAM estimada: el checkpoint float32 ocupa ~1 GB, por lo que la VRAM mínima para cargar el modelo en su precisión original sería del orden de 1-2 GB, más la memoria de las activaciones. No se han publicado cifras de VRAM para el motor FHE.
- GPU recomendadas: no se especifica ningún modelo de GPU. La latencia FHE reportada (~1 min/token para 20 capas) sugiere una GPU de estación de trabajo con soporte para bootstraps CKKS, pero sin datos concretos.
- ¿Cabe en GPU de consumo? El modelo en claro con ~1 GB de pesos probablemente cabría en una RTX 3060 o superior, aunque no se han publicado pruebas de ello. El motor FHE, al trabajar con criptogramas expandidos y bootstraps, requiere más recursos de los indicados.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el código personalizado del repositorio Sipher: Python para el modelo `CipherFormerHybrid` y C++/GPU para el motor FHE.
- Latencia: en modo FHE, ~1 minuto por token para 20 capas en una GPU de estación de trabajo. La latencia en modo texto en claro no está documentada.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. Sipher v1 es un modelo de investigación único en la categoría de LM FHE-nativos, y no se dispone de benchmarks comparativos con modelos generativos turcos de tamaño similar. Su propósito no es competir en calidad de lenguaje, sino demostrar la viabilidad de la inferencia bajo CKKS.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información disponible, aunque el corpus financiero y legal (BDDK, SPK, TCMB, mevzuat) puede reflejar sesgos institucionales o de dominio.
- Riesgo de alucinación: al ser un modelo de 254 millones de parámetros subentrenado (PPL 28,8 en entrenamiento), el riesgo de alucinación es elevado, especialmente en generaciones largas que pierden coherencia tras 3-4 frases.
- Limitaciones de contexto: ventana de 256 tokens en total, con atención local de 32; la ruta global está desactivada, por lo que no puede manejar dependencias de largo alcance.
- Generación pad-free: el modelo fue entrenado con secuencias empaquetadas sin token de padding; hacer left-padding con el token 0 produce texto basura.
- Formato de pesos: no es un modelo de Hugging Face `transformers`; no se puede cargar con `from_pretrained` estándar, sino con el código personalizado del repo.
- FHE: la ruta de atención global bajo FHE está actualmente rota; solo la ruta local está verificada. El protocolo es híbrido, no totalmente no interactivo.
- Latencia FHE: ~1 minuto por token, lejos de ser interactiva; no adecuada para aplicaciones en tiempo real.
- SFT: el ajuste fino en conjuntos pequeños de pregunta-respuesta sobreajusta y memoriza; se necesita early stopping y mucho más datos.
- Licencia: el modelo es MIT, pero los componentes de terceros (OpenFHE, FIDESlib, TenSEAL) tienen sus propias licencias, que deben revisarse para uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/guneys/sipher-local-only-ppl28
- Repositorio GitHub: https://github.com/gnyselcuk/sipher
- Documento técnico SIPHER_V1: https://github.com/gnyselcuk/sipher/blob/main/docs/SIPHER_V1.md
