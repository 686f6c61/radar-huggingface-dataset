# mradermacher/DoesPython-GGUF

## Resumen

DoesPython-GGUF es la versión cuantizada en formato GGUF del modelo TroyDoesAI/DoesPython, publicada por el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones estáticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base es un transformer de aproximadamente 5.860 millones de parámetros (5,86 B), orientado a conversación y generación de texto en inglés, con licencia Apache 2.0.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 6 B parámetros en hardware de consumo mediante cuantizaciones de 2 a 8 bits, con tamaños que van desde 2,3 GB (Q2_K) hasta 11,8 GB (f16). Es una opción práctica para desarrolladores que necesitan un modelo conversacional ligero y desplegable localmente sin depender de infraestructura en la nube.

No se dispone de información publicada sobre la arquitectura interna detallada, la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks del modelo base. Esta ficha refleja únicamente los datos verificables disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 5.859.683.328 (5,86 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base TroyDoesAI/DoesPython es un transformer de 5,86 B parámetros según los pesos en safetensors. No se ha publicado en la información disponible el número de capas, la dimensión de los embeddings, el mecanismo de atención ni la longitud de contexto nativa. Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO.

La versión aquí descrita es una cuantización estática generada por mradermacher con la herramienta de conversión de llama.cpp (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2). El autor indica que no ha generado cuantizaciones con imatrix (weighted) para este modelo, por lo que solo están disponibles las cuantizaciones estáticas listadas. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Compatible con el ecosistema transformers y con endpoints compatibles (tag `endpoints_compatible`).
- Ejecutable mediante llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Capacidades de razonamiento, código o matemáticas: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp u Ollama en un equipo de sobremesa y mantener conversaciones en inglés sin conexión a internet, usando la cuantización Q4_K_M (3,6 GB) como equilibrio entre calidad y velocidad.
- Prototipado rápido de aplicaciones de chat: al ser un modelo de 5,86 B parámetros, permite iterar sobre prompts y flujos conversacionales en una GPU de consumo antes de migrar a un modelo mayor en producción.
- Generación de texto en entornos con restricciones de privacidad: al ejecutarse íntegramente en local, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Experimentación académica con cuantizaciones: el rango de cuantizaciones disponibles (de Q2_K a f16) permite estudiar el impacto de la compresión en la calidad de salida sobre un mismo modelo base.
- Integración en pipelines de CI para pruebas de modelos: la cuantización Q2_K (2,3 GB) permite incluir un modelo conversacional funcional en entornos de test con recursos limitados.
- Educación y demos: el tamaño reducido de las cuantizaciones Q4 permite ejecutar el modelo en portátiles con GPU de 6-8 GB de VRAM para talleres y demostraciones sobre inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead aproximado de contexto y runtime):
  - Q2_K (2,3 GB): ~3 GB de VRAM.
  - Q3_K_M (2,9 GB): ~3,5 GB de VRAM.
  - Q4_K_M (3,6 GB): ~4,5 GB de VRAM.
  - Q5_K_M (4,3 GB): ~5 GB de VRAM.
  - Q6_K (4,9 GB): ~6 GB de VRAM.
  - Q8_0 (6,3 GB): ~7,5 GB de VRAM.
  - f16 (11,8 GB): ~13 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para las cuantizaciones mayores o mayor contexto.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q4_K_M hasta una RTX 4090 con f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DoesPython-GGUF (este) | 5,86 B | No disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas de 2,3 a 11,8 GB |
| Mistral-7B-Instruct (GGUF) | 7,24 B | 32 K (v0.2) | Apache 2.0 | GGUF | Referencia habitual en el mismo rango de tamaño; contexto documentado |
| Llama-3.2-3B-Instruct (GGUF) | 3,21 B | 128 K | Llama 3.2 Community License | GGUF | Menor tamaño, contexto mayor, licencia con restricciones de uso |
| Qwen2.5-7B-Instruct (GGUF) | 7,62 B | 32 K | Apache 2.0 | GGUF | Multilingüe, con benchmarks publicados |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento publicados para DoesPython. Los modelos alternativos citados cuentan con documentación pública de contexto y benchmarks que este modelo no ofrece en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta de idioma del repositorio; no se ha verificado comportamiento en castellano u otros idiomas.
- No hay información publicada sobre sesgos, datos de entrenamiento ni evaluación de seguridad, lo que dificulta estimar riesgos de alucinación o sesgo.
- La longitud de contexto no está documentada; usarlo con contextos largos sin verificación previa puede producir degradación o errores.
- Solo existen cuantizaciones estáticas; no hay versiones con imatrix, que suelen ofrecer mejor calidad por bit en tamaños pequeños.
- El modelo base tiene pocas descargas y ningún like en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero al no haber documentación sobre el origen de los datos de entrenamiento no puede confirmarse que no existan riesgos legales asociados a la composición del dataset.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DoesPython-GGUF
- Modelo base: https://huggingface.co/TroyDoesAI/DoesPython
- Página de descargas del autor: https://hf.tst.eu/model#DoesPython-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Perfil del autor: https://huggingface.co/mradermacher/models
