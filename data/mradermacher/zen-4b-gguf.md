# mradermacher/zen-4b-GGUF

## Resumen

zen-4b-GGUF es el conjunto de cuantizaciones estáticas en formato GGUF del modelo xysera/zen-4b, publicadas por mradermacher, un autor conocido por convertir modelos de HuggingFace a GGUF para su uso con llama.cpp y derivados. El modelo original es un causal language model de 4.022.468.096 parámetros (aproximadamente 4,02 mil millones), etiquetado por su autor con los descriptores `reasoning` e `instruction-following`, lo que sitúa su uso previsto en tareas de razonamiento e instrucciones conversacionales.

La relevancia de este repositorio no está en el modelo en sí, sino en el empaquetado: ofrece doce variantes de cuantización entre 1,8 GB (Q2_K) y 8,2 GB (f16), además de una familia paralela de cuantizaciones con imatrix en el repositorio `mradermacher/zen-4b-i1-GGUF`. Eso permite ejecutar un modelo de 4B en hardware de consumo con requisitos de VRAM muy bajos, desde equipos con 4 GB hasta estaciones con GPU dedicada.

La información publicada es escasa: no se detallan arquitectura concreta, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. La licencia declarada es Apache-2.0 y el único idioma soportado según los metadatos es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `causal-lm`, sin detalle de arquitectura en la información proporcionada) |
| Parámetros totales | 4.022.468.096 (dato de safetensors del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; adicionalmente cuantizaciones con imatrix (i1) en repositorio aparte |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base xysera/zen-4b en la documentación proporcionada. La etiqueta `causal-lm` y el pipeline `transformers` indican un modelo autorregresivo de generación de texto, y el recuento de parámetros (4,02B) proviene de los tensores en safetensors del modelo original, pero no se especifica si emplea atención completa, atención con ventana deslizante, mezcla de expertos o alguna variante híbrida. Tampoco se documenta la dimensión oculta, el número de capas, el número de cabezas de atención ni el tamaño del vocabulario.

Respecto al entrenamiento, la información disponible no incluye el número de tokens, la composición del corpus, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. Las únicas pistas son las etiquetas del autor (`reasoning`, `instruction-following`, `conversational`), que sugieren un ajuste orientado a instrucciones y a la generación de cadenas de razonamiento, sin datos verificables que lo cuantifiquen. El trabajo técnico documentado en este repositorio es exclusivamente la cuantización: se indican cuantizaciones estáticas de tipo 2 (`quantize_version: 2`) con `output_tensor_quantised: 1` y conversión desde formato HuggingFace (`convert_type: hf`).

## Capacidades

- Generación de texto autorregresiva en inglés, con etiqueta explícita de `causal-lm`.
- Seguimiento de instrucciones, según la etiqueta `instruction-following` declarada por el autor del modelo base.
- Razonamiento, según la etiqueta `reasoning`; no se especifica si existe un modo de pensamiento explícito ni cómo se activa.
- Uso conversacional multi-turno, según la etiqueta `conversational`.
- Compatibilidad con endpoints, indicada por la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso estructurado: no disponibles en la información proporcionada.
- Capacidades de visión, audio o multimodalidad: no disponibles; las cuantizaciones no incluyen fichero mmproj, lo que apunta a un modelo exclusivamente de texto.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).

## Casos de uso

- Despliegue local en portátil o equipo de sobremesa sin GPU dedicada: con la variante Q4_K_S (2,5 GB) o Q2_K (1,8 GB) el modelo cabe en RAM de sistema y se ejecuta con llama.cpp u Ollama, lo que permite prototipar asistentes de texto sin coste de API.
- Asistente de razonamiento en el borde (edge): el tamaño de 4B y las cuantizaciones de 2 a 3 GB permiten ejecutarlo en dispositivos con 4-8 GB de VRAM o en mini-PC, manteniendo la etiqueta de razonamiento del modelo base para tareas de análisis y descomposición de problemas.
- Clasificación y extracción de información en pipelines por lotes: al ser un modelo pequeño y con licencia Apache-2.0, se puede ejecutar en paralelo sobre muchos documentos en inglés (etiquetado, resumen de campos, normalización de entidades) con un coste por token mínimo.
- Generación de borradores de texto en inglés en herramientas internas: respuestas a correos, resúmenes de reuniones o documentación técnica, usando la variante Q5_K_M (3,0 GB) o Q6_K (3,4 GB) para priorizar calidad sobre velocidad.
- Servicio conversacional de bajo coste autoalojado: al ser `endpoints_compatible`, puede exponerse detrás de una API compatible con OpenAI mediante servidores de inferencia locales, útil para entornos con requisitos de residencia de datos.
- Filtrado previo y enrutado en arquitecturas multi-modelo: usar el 4B como clasificador o generador de borradores y reservar modelos mayores para las consultas complejas, reduciendo el coste medio del sistema.
- Evaluación y experimentación académica: el conjunto de doce cuantizaciones permite estudiar el impacto de la precisión (de Q2_K a f16) sobre la calidad de salida en un mismo modelo, con una diferencia de tamaño de 1,8 GB a 8,2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamaño de los ficheros GGUF, más overhead de contexto y caché KV): Q2_K ~1,8 GB; Q3_K_S ~2,0 GB; Q3_K_M ~2,2 GB; Q3_K_L ~2,3 GB; IQ4_XS ~2,4 GB; Q4_K_S ~2,5 GB; Q4_K_M ~2,6 GB; Q5_K_S ~2,9 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB. Añadir entre varios cientos de MB y 1-2 GB adicionales según la longitud de contexto configurada.
- GPU recomendadas: para f16 y Q8_0, GPU con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4). Para Q4_K_M y Q5_K_M, GPU con 6-8 GB (RTX 3060, RTX 4060, GTX 1660 Super) o incluso iGPU con memoria unificada. Para A100/H100 no tiene sentido por tamaño, salvo despliegue masivo en paralelo.
- Cabe en GPU de consumo: sí, en todas las variantes hasta Q8_0 con 6 GB o más; f16 requiere 10-12 GB para operar con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con GGUF (por ejemplo, llama.cpp server o TGI con soporte GGUF, a verificar según versión). vLLM no es la vía natural para GGUF, aunque admite algunos formatos cuantizados; para máximo rendimiento con el modelo base en safetensors, vLLM o TGI sobre los pesos originales.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de documentación pública de sus fabricantes y no se han verificado contra la información proporcionada en esta ficha; se incluyen como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zen-4b (este repositorio, GGUF) | 4,02B | no disponible | Apache-2.0 | GGUF en 12 variantes; base en safetensors |
| xysera/zen-4b (modelo base) | 4,02B | no disponible | Apache-2.0 | safetensors en HuggingFace |
| Qwen2.5-3B | 3,09B | 32k (versión base); 128k en algunas variantes | Apache-2.0 | safetensors y múltiples GGUF de terceros |
| Llama 3.2 3B | 3,21B | 128k | Licencia comunitaria Llama 3.2 | safetensors y GGUF oficiales |
| Phi-3.5-mini | 3,8B | 128k | MIT | safetensors y GGUF de terceros |

Frente a estas alternativas, la comparación relevante es de empaquetado y licencia: zen-4b ofrece Apache-2.0 sin restricciones adicionales y un juego de cuantizaciones completo, pero carece de documentación pública sobre contexto, datos de entrenamiento y evaluación, lo que dificulta justificar su elección frente a modelos con benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento que permitan validar las etiquetas `reasoning` e `instruction-following`.
- Idiomas: solo se declara inglés. El rendimiento en castellano es desconocido y previsiblemente degradado; no debe asumirse calidad multilingüe.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo (documentos extensos, conversaciones prolongadas) sin una evaluación previa.
- Riesgo de alucinación: inherente a los modelos de 4B y agravado en las cuantizaciones de menor precisión (Q2_K, Q3_K_S). No se han publicado evaluaciones de fidelidad factual.
- Degradación por cuantización: el autor marca Q3_K_M como "lower quality" y advierte que f16 es "overkill"; las variantes IQ y Q4_K se recomiendan para uso general. La calidad en Q2_K no está documentada y puede afectar especialmente a tareas de razonamiento.
- Licencia Apache-2.0: permisiva para uso comercial, pero se hereda del modelo base y conviene verificar que el modelo original no imponga condiciones adicionales no reflejadas en los metadatos.
- Procedencia y madurez: el repositorio registra cero descargas y una sola interacción, y el autor del modelo base (xysera) no aporta documentación técnica visible en la información disponible. El soporte de la comunidad es mínimo.
- Tamaño del repositorio: 36,4 GB, lo que implica descarga de múltiples ficheros; conviene descargar solo la variante necesaria.
- Fecha de creación registrada en 2026: verificar la vigencia y el estado de mantenimiento antes de integrarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/zen-4b-GGUF
- Modelo base: https://huggingface.co/xysera/zen-4b
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/zen-4b-i1-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#zen-4b-GGUF
- Solicitudes de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que financia el trabajo de cuantización: https://www.nethype.de/
