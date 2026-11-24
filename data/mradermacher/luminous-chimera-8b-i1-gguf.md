# mradermacher/Luminous-Chimera-8B-i1-GGUF

## Resumen

Luminous-Chimera-8B-i1-GGUF es una redistribución en formato GGUF del modelo Luminous-Chimera-8B, publicado por el usuario mradermacher. Se trata de una conversión de pesos a cuantizaciones de la familia GGUF generadas con el método i1 (imatrix), pensadas para su uso con llama.cpp y con el resto de herramientas que consumen este formato. El modelo original procede del repositorio Kanjdoes/Luminous-Chimera-8B, del que no se ofrece información adicional en la model card.

El modelo cuenta con 8.030.261.312 parámetros según los pesos en safetensors del repositorio original, lo que lo sitúa en la categoría de modelos densos de aproximadamente 8.000 millones de parámetros. El repositorio ocupa 7,0 GB e incluye un conjunto amplio de cuantizaciones que abarca desde IQ1_S hasta Q6_K, lo que permite desplegarlo en hardware muy variado, desde equipos de consumo con poca VRAM hasta estaciones de trabajo con GPU de gama alta.

La relevancia de esta ficha es fundamentalmente práctica: se trata de una distribución de cuantizaciones, no de un modelo nuevo. La información publicada por el autor es mínima (sin licencia, sin idiomas declarados, sin pipeline y sin benchmarks), por lo que la mayor parte de los datos técnicos del modelo base no están disponibles en el material consultado. El valor del repositorio reside en la disponibilidad de pesos GGUF listos para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer denso, inferido por el tamaño y el formato; no confirmado en la información) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors |
| Tamano del repositorio | 7,0 GB |
| Metodo de cuantizacion | i1 (imatrix, cuantizacion ponderada) |
| Compatibilidad | endpoints_compatible, conversacional |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación consultada. Por el número de parámetros (8.030.261.312) y el formato de conversión (convert_type: hf), se trata de un modelo denso de aproximadamente 8.000 millones de parámetros convertido desde pesos Hugging Face. La model card no detalla si emplea atención estándar, atención lineal, mezcla de expertos u otra variante, ni proporciona datos sobre el número de tokens de entrenamiento, la composición del dataset o las fases de alineación (RLHF, DPO u otras).

La innovación técnica documentada se limita al proceso de cuantización: las cuantizaciones i1 emplean una matriz de importancia (imatrix) calculada a partir de datos de calibración, lo que mejora la calidad de los cuantizados agresivos (especialmente los de 1 a 3 bits) frente a las cuantizaciones estándar. El repositorio incluye la etiqueta `quantize_version: 2` y `output_tensor_quantised: 1`, indicadores del pipeline de conversión de llama.cpp. No se documentan técnicas como decodificación especulativa ni modos de razonamiento explícito.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational`, lo que sugiere un ajuste orientado a diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que los pesos pueden servirse a través de infraestructura compatible con la API de Hugging Face.
- Inferencia local: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otras herramientas del ecosistema.
- Tool calling / function calling: no disponible en la información consultada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Despliegue local en equipos de consumo: gracias a las cuantizaciones Q4_K_M e IQ4_XS, el modelo puede ejecutarse en GPU con 8-12 GB de VRAM, lo que permite prototipar asistentes conversacionales sin infraestructura cloud.
- Experimentación con cuantizaciones agresivas: la disponibilidad de cuantizaciones IQ1 e IQ2 permite estudiar la degradación de calidad en modelos de 8B bajo compresión extrema, útil para investigación sobre eficiencia de inferencia.
- Chatbot de escritorio o integrado en aplicaciones: el etiquetado `conversational` y el formato GGUF facilitan su integración en aplicaciones de escritorio mediante llama.cpp u Ollama.
- Evaluación comparativa de cuantizaciones: al incluir más de veinte variantes del mismo modelo, es útil para medir el equilibrio entre tamaño, velocidad y calidad en pipelines de evaluación propios.
- Servicio de inferencia ligero: con la etiqueta `endpoints_compatible`, puede desplegarse en servidores compatibles con la API de Hugging Face para entornos de prueba.
- Fines educativos: adecuado para demostrar el flujo completo de conversión a GGUF y cuantización con imatrix en cursos o talleres de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con IQ1_S/IQ1_M; 2,5-3,5 GB con IQ2/IQ3; 4,5-5,5 GB con Q4_K_M; 6-7 GB con Q6_K (estimaciones basadas en el tamaño de los cuantizados, no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100 o H100 para servir los pesos sin cuantizar o con máxima calidad.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4 y Q5 caben en GPU de 8-12 GB; las IQ2 e IQ3 caben en GPU de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Luminous-Chimera-8B-i1-GGUF | 8.030 M | no disponible | no disponible | GGUF (i1) | Hugging Face |
| Meta Llama 3.1 8B Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Hugging Face, ecosistema amplio |
| Mistral 7B Instruct | 7.240 M | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, ecosistema amplio |
| Qwen2.5 7B Instruct | 7.620 M | 128.000 tokens | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Hugging Face, ecosistema amplio |

La comparación con Llama 3.1 8B, Mistral 7B y Qwen2.5 7B se ofrece como referencia de categoría; no se dispone de datos de rendimiento de Luminous-Chimera-8B que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no puede confirmarse el uso comercial; es imprescindible verificar la licencia del modelo base (Kanjdoes/Luminous-Chimera-8B) antes de cualquier despliegue en producción.
- No se declaran idiomas soportados; el rendimiento multilingüe es desconocido y podría ser limitado fuera del inglés.
- No hay información sobre la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- No se han publicado benchmarks, por lo que la calidad real del modelo frente a alternativas establecidas es desconocida.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Las cuantizaciones IQ1 e IQ2 pueden degradar notablemente la coherencia y la fidelidad factual; no se recomiendan para producción.
- Riesgo de alucinación: inherente a los modelos de 8B; sin datos de alineación ni evaluaciones, el riesgo no puede acotarse.
- Al ser una redistribución de cuantizaciones, la responsabilidad sobre sesgos y comportamiento recae en el modelo base, del que no hay documentación disponible en la información consultada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luminous-Chimera-8B-i1-GGUF
- Modelo base: https://huggingface.co/Kanjdoes/Luminous-Chimera-8B
