# darkstar-11e/sillok-100m

## Resumen

Sillok-LM 100M es un modelo de lenguaje causal decoder-only entrenado desde cero sobre el corpus digital completo de los Anales de la Dinastía Joseon (Joseon Wangjo Sillok, 1392-1863), la crónica oficial de los 30 monarcas de la dinastía coreana. Lo desarrolla Gyungmin Jo (조경민), investigador vinculado a la Academy of Korean Studies (AKS-DHLAB), y se publica bajo el identificador `darkstar-11e/sillok-100m` en Hugging Face con licencia Apache-2.0.

El modelo resuelve un problema muy concreto de las humanidades digitales: la generación y estructuración de texto historiográfico en chino clásico (lzh) con metadatos bibliográficos modernos en coreano. Con 125.848.320 parámetros reales según los safetensors (la model card declara 100.682.496), emplea una arquitectura estilo Llama-3 con RoPE, GQA, SwiGLU y RMSNorm, y una longitud de contexto máxima de 1.024 tokens. Su vocabulario de 32.768 tokens es un BPE byte-level personalizado para hanja y hangul.

Es relevante ahora por dos motivos: primero, porque demuestra que un modelo de tamaño muy reducido puede capturar la estructura formal de un corpus histórico altamente regular si el entrenamiento y el tokenizador están bien alineados con el dominio; segundo, porque expone explícitamente la distinción entre el texto original en chino clásico y los títulos añadidos por historiadores modernos del NIKH, lo que lo convierte en una herramienta bidireccional de redacción y resumen archivístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama-3 (RoPE, GQA, SwiGLU, RMSNorm), compatible con `LlamaForCausalLM` |
| Parametros totales | 125.848.320 (safetensors); la model card declara 100.682.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16/BF16 safetensors) |
| Idiomas soportados | ko, lzh (chino clásico); la model card menciona también en en las etiquetas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16/BF16) |

Otros datos técnicos: 12 capas, dimensión oculta 768, dimensión intermedia 2.048, 12 cabezas de atención y 4 cabezas clave-valor (GQA). Base de frecuencia RoPE theta = 500.000,0. Tokenizador BPE byte-level de 32.768 entradas especializado en hanja y hangul. Entrenamiento de 4.400 pasos, aproximadamente 12,1 épocas sobre 760 millones de tokens. Pérdida de validación 2,9128 (perplejidad 18,41, precisión top-1 del 48,71%). Tamaño del repositorio: 0,3 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la pila estándar de Llama-3: normalización RMSNorm, activación SwiGLU, atención con Grouped-Query Attention (12 cabezas de consulta frente a 4 de clave-valor) y embeddings posicionales rotatorios con theta elevado a 500.000,0. La ventana de contexto es de 1.024 tokens, coherente con la granularidad de las entradas individuales de los anales, que rara vez superan ese tamaño por artículo.

El entrenamiento se realizó desde cero sobre 760 millones de tokens extraídos de 673 volúmenes XML del National Institute of Korean History (NIKH), que cubren 30 monarcas, 381.701 artículos y 67.707.578 caracteres en chino clásico. Se completaron 4.400 pasos, equivalentes a unas 12,1 épocas. No se documentan fases de RLHF ni DPO. La innovación técnica principal no está en la arquitectura sino en la ingeniería del corpus: un parser con herencia estricta de contexto en árbol DOM (año → mes → día → artículo) que evita la contaminación de fechas entre días, dado que el marcador cíclico de 60 ganji solo aparece en la primera entrada de cada jornada. Además, se incorporaron 5.873 instancias de comentario editorial del historiador (史論, saron) mediante el token de control `<|postscript|>`, y se modeló de forma bidireccional la relación entre el título moderno en coreano y el cuerpo en chino clásico.

## Capacidades

- Generación de texto causal en chino clásico historiográfico con estructura formal de los anales.
- Redacción directa (forward drafting): dado un rey, una fecha, una materia y un título moderno, produce una entrada cronológica auténtica en hanja.
- Resumen inverso (reverse summarization): dado un texto en chino clásico, extrae un título archivístico profesional en coreano moderno.
- Generación de comentario editorial del historiador (史論) mediante el token `<|postscript|>`.
- Control estructurado mediante tokens especiales: `<|bos|>`, `<|king|>`, `<|date|>`, `<|subject|>`, `<|title|>`, `<|hanja|>`, `<|postscript|>`, `<|eos|>`.
- Clasificación implícita en 12 clases temáticas historiográficas (materia) mediante el token `<|subject|>`.
- Manejo de fechas con marcador cíclico de 60 ganji y herencia de contexto cronológico.
- Capacidad multilingüe limitada a coreano (ko) y chino clásico (lzh); el inglés aparece en las etiquetas pero no se documenta entrenamiento específico en esa lengua.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en humanidades digitales: el modelo permite generar entradas sintéticas de los anales para probar hipótesis estilísticas o completar lagunas documentales, gracias a su entrenamiento exclusivo sobre el corpus Sillok y a su control por tokens bibliográficos.
- Catalogación y enriquecimiento archivístico: la función de resumen inverso (`<|hanja|>` → `<|title|>`) permite generar títulos modernos en coreano para fragmentos de chino clásico que carezcan de encabezado, agilizando la descripción de fondos documentales.
- Docencia de historia coreana y chino clásico: con solo 0,3 GB de pesos y contexto de 1.024 tokens, puede desplegarse en entornos educativos modestos para ilustrar la estructura formal de los anales y la relación entre texto original y glosa moderna.
- Generación de comentario historiográfico: el token `<|postscript|>` permite producir textos con la forma del 史論 confuciano, útil para estudios sobre retórica moral en la historiografía de la dinastía.
- Prototipado rápido de pipelines de NLP histórico: al ser compatible con `LlamaForCausalLM` y pesar 0,3 GB, sirve como banco de pruebas para tokenizadores, esquemas de prompting estructurado y evaluaciones de perplejidad sobre corpus clásicos antes de escalar a modelos mayores.
- Análisis de estructura cronológica: el modelado explícito de la jerarquía año-mes-día-artículo con herencia de ganji permite experimentos sobre resolución de referencias temporales en textos históricos, un problema recurrente en NLP de documentos premodernos.
- Creación de contenido divulgativo con estilo de época: escritores y divulgadores pueden generar pasajes con la forma y el registro de los anales para ilustrar publicaciones, siempre con revisión humana dado el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta métricas internas de validación:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 2,9128 |
| Perplejidad | 18,41 |
| Precisión top-1 | 48,71% |
| Pasos de entrenamiento | 4.400 |
| Épocas | ~12,1 sobre 760M tokens |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los 125,8 millones de parámetros ocupan aproximadamente 0,25 GB de pesos; con overhead de activaciones y caché KV para 1.024 tokens, el consumo real se sitúa holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- Cabe en cualquier GPU de consumo actual e incluso en CPU; también es viable en dispositivos de borde y en entornos sin acelerador.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (documentado en la model card), y previsiblemente llama.cpp, Ollama y vLLM al ser compatible con la arquitectura Llama, aunque estas integraciones no se documentan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (LLM especializados en chino clásico o en corpus historiográficos coreanos) en los datos proporcionados. La model card no incluye comparativas con alternativas.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Sillok-LM 100M | 125,8M (safetensors) | 1.024 | Apache-2.0 | Especializado en Anales Joseon |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente sobre los Anales de la Dinastía Joseon; su dominio es extremadamente estrecho y no debe esperarse un rendimiento generalista fuera de ese registro.
- La ventana de contexto de 1.024 tokens limita la generación a entradas breves; no es adecuado para documentos largos ni para razonamiento multi-turno extenso.
- Riesgo de alucinación en nombres, fechas y cargos: aunque la estructura formal sea correcta, los detalles factuales pueden ser inventados, especialmente en fechas y ganji.
- El tokenizador está especializado en hanja y hangul; el rendimiento en otros idiomas, incluido el inglés pese a la etiqueta, no está documentado.
- La discrepancia entre los parámetros declarados en la model card (100.682.496) y los reales en safetensors (125.848.320) debe tenerse en cuenta al planificar el despliegue.
- La licencia Apache-2.0 permite uso comercial, pero el corpus fuente está sujeto a la licencia KOGL Tipo 1 / AI License del NIKH, lo que puede imponer condiciones adicionales sobre los datos derivados.
- No se documentan evaluaciones de sesgo; al tratarse de un corpus confuciano de los siglos XV-XIX, es previsible que reproduzca perspectivas históricas jerárquicas y moralizantes propias de la historiografía de la época.
- No hay evidencia de soporte para tool calling, agentes ni integración con pipelines de producción más allá de la generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkstar-11e/sillok-100m
- Repositorio GitHub: https://github.com/tsarkr/sillok
- Web Studio interactivo: https://sillok.tsar.kr
- Espejo del Web Studio: https://sillok-blue.vercel.app/
- Fuente de datos primaria: National Institute of Korean History (NIKH, 국사편찬위원회)
