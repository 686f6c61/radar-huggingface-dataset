# faysalbenahmed/AMF-v0.18-Qualified-Realization

## Resumen

AMF-v0.18-Qualified-Realization es un adaptador LoRA (PEFT) publicado por el usuario faysalbenahmed sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3. No se trata de un modelo completo, sino de un componente de adaptación de bajo rango que el autor presenta dentro del marco «AMF» (siglas no desarrolladas en la información disponible). El repositorio ocupa prácticamente 0 GB y el fichero de pesos del adaptador mide 6.839.183 bytes, coherente con un LoRA de rango bajo sobre un transformer de aproximadamente 7.200 millones de parámetros.

El aspecto más relevante de esta publicación no es el adaptador en sí, sino la metodología que lo acompaña. El autor denomina «realización cualificada» al objeto compuesto por el modelo base fijado en una revisión concreta (`c170c708c41dac9275d15a8fff4eca08d52bab71`), el adaptador LoRA histórico exacto, una transformación de entrada denominada `CANONICALIZE_TO_RECORDS_V1`, un contrato de suficiencia de evidencia y un runtime de inferencia propio. Es decir, el autor advierte explícitamente de que cargar únicamente el adaptador PEFT de la raíz del repositorio no reproduce la realización cualificada.

El modelo se presenta como caso de estudio de «inteligencia científica»: el autor reporta que un candidato alternativo con mayor puntuación bruta fue descartado por no satisfacer la regla de confirmación configurada, y publica métricas de cualificación internas sobre tres conjuntos de 128 muestras cada uno. El repositorio no declara idiomas soportados, no documenta la composición del dataset de entrenamiento y se distribuye con licencia «other» sin términos detallados. Con 0 descargas en el momento de la consulta, se trata de un artefacto de investigación sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B) con adaptador LoRA/PEFT acoplado; la realización completa añade la transformación `CANONICALIZE_TO_RECORDS_V1`, un contrato de suficiencia de evidencia y un runtime de inferencia |
| Parámetros totales | Aproximadamente 7.200 millones en el modelo base; el adaptador publicado ocupa 6.839.183 bytes |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según el modelo base Mistral-7B-Instruct-v0.3; no se especifica en la model card |
| Tipos de cuantización | No especificados en la model card; el adaptador se distribuye en safetensors y la cuantización se aplicaría al modelo base |
| Idiomas soportados | No disponibles (la model card no los declara; hereda las capacidades del modelo base) |
| Licencia | other (sin términos detallados en la información disponible) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), formato PEFT/LoRA |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 (revisión fijada `c170c708c41dac9275d15a8fff4eca08d52bab71`) |
| Librería | peft |
| Pipeline | text-generation |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 descargas / 1 like |
| Fechas | Creado el 2026-09-14; actualizado el 2026-09-17 |
| Identidad del adaptador | SHA-256 del árbol: `36c1f91df36aa00802ea65d721657b5a1af699f23b0beaddf9d95e3afd741145`; SHA-256 de los pesos: `88094b7f6a88586eb5201efa7051f10232602c618d3eb8e34046f18bb16dcb71` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only correspondiente a Mistral-7B-Instruct-v0.3, sobre el que se aplica un adaptador LoRA de bajo rango. El repositorio raíz expone dos ficheros de conveniencia (`adapter_model.safetensors`, copia byte a byte de los pesos cualificados, y `adapter_config.json`, apuntando al modelo base fijado) para compatibilidad con Hugging Face y PEFT. Los ficheros históricos se conservan en `qualified_adapter_exact/` y la relación entre ambos conjuntos queda registrada en `PORTABLE_ADAPTER_RECEIPT.json`. El autor indica que el `adapter_config.json` original conserva intencionadamente una ruta de caché local histórica.

No se documenta en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otro método de alineación. Sí se describe el proceso de selección: AMF exploró varios loci de intervención (adaptación LoRA continuada, adaptación nueva, reutilización, canonicalización de representación y un cambio de sustrato) y la realización finalmente cualificada fue `g02-reuse-g01-canonicalize-historical-be`. La innovación declarada no es arquitectónica sino de pipeline: la transformación `CANONICALIZE_TO_RECORDS_V1` (cuya fuente tiene SHA-256 `5f32ab909812fa239233be764cfdc6286ea33197314108c2670c8b5ef5f03af3`) normaliza la entrada a un formato de registros canónicos, y la salida queda sujeta a un contrato de suficiencia de evidencia. El autor subraya que se descartó un candidato G2 de LoRA continuado con mayor puntuación absoluta en `SEARCH_CONFIRM` por no cumplir la regla de confirmación configurada. La misión asociada se denomina `explicit_evidence_sufficiency_v5_cumulative_scientist`.

## Capacidades

- Generación de texto condicionada por el modelo base Mistral-7B-Instruct-v0.3.
- Producción de salidas con validación de esquema: el autor reporta un 100 % de esquema válido en los tres roles evaluados (ROB, OOD y Fresh Final).
- Canonicalización de representación de entrada a registros mediante `CANONICALIZE_TO_RECORDS_V1`, orientada a tareas de suficiencia de evidencia.
- Razonamiento sobre suficiencia de evidencia científica dentro del contrato declarado por el autor.
- Integración con el ecosistema PEFT: carga mediante `transformers` + `peft` sobre el modelo base fijado.
- Ejecución mediante un runtime propio (`runtime/inference.py`) para la realización pública completa.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad específica.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades de visión, audio o modo «thinking» explícito: no documentadas.
- Capacidad de fine-tuning adicional sobre el adaptador: técnicamente posible por ser un artefacto LoRA, aunque no documentada por el autor.

## Casos de uso

- Evaluación de suficiencia de evidencia en dominios científicos: el modelo está diseñado para decidir si la evidencia aportada basta para sostener una afirmación, con salida sujeta a un contrato formal y esquema validado al 100 % según el autor.
- Extracción y normalización de registros estructurados: la transformación `CANONICALIZE_TO_RECORDS_V1` convierte entradas heterogéneas en registros canónicos, lo que resulta útil en pipelines de ingesta documental donde el formato de origen varía.
- Auditoría de pipelines de decisión automatizada: el repositorio incluye recibos de identidad, hashes de pesos, hashes de árbol y un ledger de 92 eventos con head SHA-256, lo que permite trazar qué artefacto exacto produjo cada resultado.
- Investigación en adaptación parametral eficiente: sirve como caso de estudio de selección de adaptadores LoRA bajo reglas de confirmación, incluyendo el rechazo documentado de un candidato con mayor puntuación bruta.
- Clasificación con validación estricta de esquema: los roles ROB, OOD y Fresh Final reportan un 100 % de validez de esquema, lo que encaja en sistemas que no pueden tolerar salidas malformadas.
- Prototipado de asistentes de investigación documental multi-turno: al apoyarse en Mistral-7B-Instruct-v0.3, hereda una ventana de contexto de 32.768 tokens, adecuada para conversaciones con documentación extensa.
- Despliegue on-premise con recursos limitados: al tratarse de un adaptador de 6,84 MB sobre un modelo de 7B cuantizable a 4 bits, es viable en hardware de gama de consumo dentro de entornos con requisitos de soberanía de datos.
- Reproducción de experimentos con procedencia verificable: los hashes publicados (paquete de misión, archivo de resultados canónico, recibos de identidad y veredicto) permiten comprobar la integridad de la ejecución, aunque las filas protegidas no se publican.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles provienen del protocolo interno de cualificación AMF declarado por el autor. Cada rol comprende 128 muestras evaluadas.

| Rol | Exactitud padre | Exactitud cualificada | Ganancia | Macro-F1 padre | Macro-F1 cualificado | Esquema válido |
|---|---:|---:|---:|---:|---:|---:|
| ROB | 71,88 % | 90,63 % | +18,75 pts | 73,03 % | 90,63 % | 100 % |
| OOD | 50,00 % | 85,16 % | +35,16 pts | 35,92 % | 85,05 % | 100 % |
| Fresh Final | 47,66 % | 81,25 % | +33,59 pts | 39,50 % | 81,18 % | 100 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden de un protocolo interno del propio autor, no de una certificación externa, y no son comparables directamente con benchmarks públicos. El autor indica además que Fresh Final es una prueba de generalización acotada sobre familias de representación soportadas y no debe interpretarse como evidencia de generalización universal a formatos o dominios arbitrarios.

## Requisitos de hardware

- Tamaño del adaptador: 6.839.183 bytes (aproximadamente 6,84 MB), negligible frente al modelo base.
- Pesos del modelo base en FP16/BF16: en torno a 14,5 GB solo de parámetros, más caché KV; con 32.768 tokens de contexto la caché KV crece de forma apreciable.
- Cuantización a 4 bits: aproximadamente 4-5 GB de pesos, lo que permite ejecución en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 de 12 GB o RTX 4070), asumiendo margen para la caché KV según longitud de contexto.
- GPUs de gama profesional recomendadas: A100 40/80 GB, H100, L40S o A10G/L4 de 24 GB para FP16 con contextos largos.
- GPUs de consumo: RTX 3090, RTX 4090 y RTX 5090 (24-32 GB) pueden ejecutar el modelo en FP16/BF16 con contexto moderado; en 8 bits o 4 bits caben en GPUs de 8-16 GB.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), runtime propio `runtime/inference.py`, vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador con `merge_and_unload()` y convertir el modelo resultante a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de adaptadores LoRA comparables en la información proporcionada, por lo que la comparación se limita a características estructurales frente al modelo base.

| Modelo | Parámetros | Contexto | Licencia | Distribución | Rendimiento publicado |
|---|---|---|---|---|---|
| AMF-v0.18-Qualified-Realization | Adaptador sobre ~7.200 M | 32.768 tokens (heredado del base) | other (sin detalle) | Adaptador PEFT en safetensors (6,84 MB) | Métricas internas de cualificación (ROB 90,63 %, OOD 85,16 %, Fresh Final 81,25 % en 128 muestras por rol) |
| mistralai/Mistral-7B-Instruct-v0.3 (modelo base) | ~7.200 M | 32.768 tokens | No disponible en la información proporcionada | Pesos completos | No disponible en la información proporcionada |

No se han identificado en la información disponible otros adaptadores de la misma categoría (canonicalización de representación orientada a suficiencia de evidencia) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El adaptador de la raíz del repositorio no reproduce por sí solo la realización cualificada: el autor exige además `CANONICALIZE_TO_RECORDS_V1`, el contrato de suficiencia de evidencia y el runtime AMF. Cargarlo de forma aislada produce un comportamiento distinto del reportado.
- Los resultados de cualificación proceden de un protocolo interno del autor y no constituyen certificación externa; el propio repositorio lo declara explícitamente.
- El tamaño de la evaluación es reducido: 128 muestras por rol, repartidas en tres roles.
- Fresh Final es una prueba de generalización acotada sobre familias de representación soportadas; no demuestra generalización universal a formatos o dominios no vistos.
- Las filas protegidas, las filas de Fresh Final, sus semillas y los ficheros de predicción protegidos y finales no se publican, lo que limita la reproducción independiente de las métricas.
- La licencia es «other» y no se detallan sus términos en la información disponible; esto impide determinar si el uso comercial está permitido o sujeto a condiciones.
- No se declaran idiomas soportados, por lo que no puede afirmarse cobertura multilingüe más allá de la que herede el modelo base.
- El riesgo de alucinación es el inherente a Mistral-7B-Instruct-v0.3; la validez de esquema al 100 % no implica corrección factual del contenido.
- `RUN_RESULT.json` contiene `publication_ready=false` porque el exportador a Hugging Face con control de acceso no se ejecutó durante la campaña; el autor sostiene que el veredicto de cualificación es independiente de ese flujo.
- `adapter_config.json` conserva una ruta de caché local histórica, lo que puede provocar errores de carga si no se fija explícitamente el modelo base y la revisión.
- Sin descargas y con un solo «like», el modelo carece de validación por parte de la comunidad; no hay informes independientes de comportamiento en producción.
- No hay datos publicados sobre sesgos, composición del dataset de entrenamiento ni proceso de alineación, lo que dificulta cualquier evaluación de riesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/faysalbenahmed/AMF-v0.18-Qualified-Realization
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- La búsqueda web realizada no devolvió resultados técnicos relevantes: los enlaces recuperados corresponden a páginas de inicio de sesión de Netflix (netflix.com/de/login, netflix.com/de/N/login, netflix.de/login, netflix.com/?hl=de, netflix.com/de-en/login/home) y no guardan relación con el modelo.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
