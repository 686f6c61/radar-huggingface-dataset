# Same0620/e12-ft42-sae-l42

## Resumen

e12-ft42-sae-l42 es un sparse autoencoder (SAE) entrenado por el usuario Same0620 como fine-tune del SAE ceselder/qwen36-27b-sae-l42-1b. No es un modelo generativo de lenguaje, sino una herramienta de interpretabilidad: descompone las activaciones del bloque 42 de Qwen3.6-27B en 131.072 features dispersas, lo que permite analizar qué representaciones internas activa el modelo ante cada token. El artefacto se publica como pesos de SAE (ae.pt) más un config.json, con un tamaño de repositorio de 5,4 GB.

La relevancia de esta ficha es acotada: se trata de un fine-tune de un SAE concreto (arquitectura BatchTopK, k = 64) sobre datos de chat, relato y web, con una mejora declarada del error de reconstrucción de la cabecera (EV 0.867 frente a 0.280 del original). No hay información sobre licencia comercial clara (etiquetada como "other"), ni sobre idiomas, ni sobre benchmarks de downstream.

Conviene subrayar que este repositorio no debe evaluarse como un LLM: sus capacidades son las de un extractor de features para un modelo base concreto y una revisión concreta (commit 6a9e13bd). Cualquier uso en producción debe entenderse como parte de un pipeline de análisis de activaciones, no como un servicio de generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder BatchTopK (k = 64) |
| Parametros totales | no disponible (131.072 features; tamaño de pesos no detallado) |
| Parametros activos | no disponible (no es MoE; k = 64 features activas por token) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | PyTorch (ae.pt) + config.json + sha256.json |

## Arquitectura y entrenamiento

El SAE sigue una arquitectura BatchTopK con k = 64 y 131.072 features, aplicado sobre el sitio correspondiente al bloque 42 de Qwen3.6-27B en la revisión 6a9e13bd. La codificación es ReLU seguida de una selección top-64 por token, lo que impone dispersión estricta y hace que cada activación sea interpretable como una combinación de como máximo 64 features.

El fine-tune se realizó sobre 8,0 millones de tokens del bloque 42 del SAE padre (60 % chat, 25 % relato, 15 % web) más copias de la cabecera, durante 1.990 pasos con learning rate 2e-5. El resultado declarado es una EV de cabecera de 0.867, frente a 0.280 del SAE original, lo que indica una mejora sustancial en la reconstrucción de la cabecera del SAE (no del modelo base). No se documentan detalles sobre inicialización, regularizadores, tamaño de batch ni hardware de entrenamiento.

## Capacidades

- Extracción de features dispersas de las activaciones del bloque 42 de Qwen3.6-27B.
- Codificación con ReLU + top-64 por token, útil para análisis de neuronas y circuitos.
- Reconstrucción de activaciones con EV de cabecera declarada de 0.867.
- No soporta generación de texto, tool calling, agentes ni razonamiento: es un SAE, no un LLM.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión, audio).
- Compatible con flujos de interpretabilidad mecanicista sobre el modelo base indicado.

## Casos de uso

- Análisis de features en investigación de interpretabilidad: cargar ae.pt y el config.json para codificar activaciones del bloque 42 de Qwen3.6-27B y estudiar qué features se activan ante prompts de chat, relato o web, aprovechando la mezcla de datos de entrenamiento.
- Detección de features asociadas a dominios concretos: dado que el fine-tune usa 60 % chat, 25 % relato y 15 % web, el SAE puede emplearse para localizar features correlacionadas con registro conversacional o narrativo.
- Monitorización de activaciones en pipelines de seguridad: usar el SAE como sonda para detectar activaciones anómalas en el bloque 42 durante la inferencia del modelo base, aunque sin garantías de producción por la falta de benchmarks.
- Comparación de SAEs: contrastar este fine-tune (EV 0.867) con el SAE padre (EV 0.280) para estudiar el efecto del fine-tuning sobre la calidad de reconstrucción de features.
- Auditoría de representaciones internas: inspeccionar las top-64 features activas por token para auditar sesgos o conceptos latentes en el modelo base en la revisión 6a9e13bd.
- Docencia y reproducción de experimentos: servir como ejemplo práctico de entrenamiento de un SAE BatchTopK con datos mixtos y evaluación mediante EV de cabecera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo declarado es la EV de cabecera (0.867 en este fine-tune frente a 0.280 en el SAE original), que mide reconstrucción de la cabecera del SAE, no rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 5,4 GB, por lo que cargar los pesos en FP32 requeriría del orden de esa cifra más overhead, y en FP16 aproximadamente la mitad (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; para un SAE de este tamaño una GPU consumer con 8-16 GB podría ser suficiente para cargar los pesos, aunque la codificación requiere ejecutar el modelo base Qwen3.6-27B, lo que eleva mucho los requisitos.
- Cabe en GPU consumer: los pesos del SAE probablemente sí; el modelo base Qwen3.6-27B no cabe en GPU consumer sin cuantización.
- Opciones de despliegue: carga directa con PyTorch (ae.pt + config.json); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Features / k | EV de cabecera | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Same0620/e12-ft42-sae-l42 | SAE BatchTopK fine-tune | 131.072 / 64 | 0.867 | other | Hugging Face |
| ceselder/qwen36-27b-sae-l42-1b | SAE BatchTopK (padre) | no disponible | 0.280 | no disponible | Hugging Face |
| Otros SAE de Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros SAEs comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; usarlo como LLM produciría resultados inválidos.
- La licencia "other" no especifica condiciones de uso comercial; es necesario contactar con el autor o revisar el repo del modelo base antes de cualquier uso en producción.
- El SAE está vinculado a una revisión concreta del modelo base (6a9e13bd); cambios de versión o de checkpoint invalidan las features.
- La EV de 0.867 mide reconstrucción de cabecera, no fidelidad interpretativa ni utilidad downstream; no hay benchmarks de interpretabilidad publicados.
- Sesgos y alucinaciones: no aplican en el sentido habitual, pero las features heredan los sesgos de los datos de entrenamiento (60 % chat, 25 % relato, 15 % web) y del modelo base.
- Sin información sobre idiomas soportados; la cobertura lingüística de las features depende del corpus usado y del modelo base.
- Descargas muy bajas (15) y ausencia de validación externa: tratar como artefacto de investigación, no como componente estable.
- No se documentan cuantizaciones ni formatos alternativos a PyTorch, lo que limita su integración en stacks de inferencia optimizados.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Same0620/e12-ft42-sae-l42
- Modelo base (SAE padre): https://huggingface.co/ceselder/qwen36-27b-sae-l42-1b
