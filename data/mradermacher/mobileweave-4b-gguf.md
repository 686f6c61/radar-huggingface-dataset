# mradermacher/MobileWeave-4B-GGUF

## Resumen

MobileWeave-4B-GGUF es la versión cuantizada en formato GGUF del modelo MobileWeave-4B, publicado por el usuario mradermacher. El modelo original, alojado en el repositorio Maxnotmarx/MobileWeave-4B, cuenta con 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) y está orientado a tareas conversacionales en inglés. Esta ficha se centra en la distribución GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicación radica en que facilita el despliegue local del modelo original en estaciones de trabajo sin GPU de datacenter, ofreciendo un abanico de cuantizaciones que van desde Q2_K (1,9 GB) hasta f16 (8,9 GB). Incluye además dos ficheros mmproj (Q8_0 y f16), lo que sugiere que el modelo base incorpora capacidades multimodales, aunque la model card no detalla la arquitectura interna ni el entrenamiento.

La información disponible es limitada: no se especifican la longitud de contexto, la licencia, los idiomas soportados más allá del inglés, ni los resultados de benchmarks. Esta ficha refleja exclusivamente los datos publicados en el repositorio y marca como "no disponible" todo aquello que no se ha hecho público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, segun tags de transformers; detalles no publicados) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base Maxnotmarx/MobileWeave-4B. Los tags del repositorio indican compatibilidad con transformers y el pipeline conversacional, y la presencia de ficheros mmproj en la distribución GGUF apunta a que el modelo incorpora un componente multimodal (probablemente visión), aunque no se detalla su naturaleza. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución de mradermacher se limita a la cuantización estática del modelo original en formato GGUF mediante llama.cpp. La model card indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación y que podrían solicitarse mediante una discusión comunitaria. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado en el repositorio.
- Soporte multimodal probable: la distribución incluye ficheros mmproj (Q8_0 y f16), lo que sugiere entrada de imágenes, aunque no se detalla el alcance.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integración en servicios de inferencia.
- No se documentan capacidades específicas de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del inglés.
- No se documentan modos especiales como thinking mode, audio o visión detallada.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S y Q4_K_M (2,7 y 2,8 GB) permiten ejecutar el modelo en portátiles con GPU de consumo modesta, útil para prototipado de asistentes conversacionales en inglés.
- Experimentación con modelos multimodales en local: los ficheros mmproj permiten probar entrada de imágenes con llama.cpp en hardware sin GPU de datacenter, adecuado para investigación exploratoria.
- Integración en pipelines de CI/CD para pruebas de regresión conversacional: el formato GGUF y la compatibilidad con endpoints facilitan automatizar evaluaciones de calidad de respuesta en inglés.
- Asistentes de documentación técnica en inglés: el modelo puede generar y resumir texto técnico en entornos con requisitos de privacidad, al ejecutarse íntegramente en local.
- Evaluación comparativa de cuantizaciones: la disponibilidad de doce variantes de cuantización permite medir el impacto de la compresión en la calidad de las respuestas para un caso de uso concreto.
- Base para fine-tuning posterior: el modelo original en safetensors (4,4 mil millones de parámetros) es un punto de partida manejable para ajuste en una sola GPU de 24 GB, aunque la licencia debe verificarse antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB con Q2_K, 2,8 GB con Q4_K_M, 3,7 GB con Q6_K y 4,8 GB con Q8_0; el f16 requiere unos 8,9 GB. Los ficheros mmproj añaden 0,6 GB (Q8_0) o 0,9 GB (f16) si se usa la entrada multimodal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o A100 para cuantizaciones altas y f16.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más para Q4_K_M y en tarjetas con 8-12 GB para Q8_0 y f16.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), y servidores compatibles con GGUF; también es posible usar el modelo base con transformers y vLLM/TGI si se dispone de los pesos safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparación rigurosa. A continuación se ofrece una comparación estructural con alternativas de tamaño similar ampliamente conocidas, marcando como "no disponible" los datos que no se han publicado para MobileWeave-4B.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MobileWeave-4B | 4,4 B | no disponible | no disponible | GGUF, safetensors |
| Qwen2.5-3B | 3,1 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| Phi-3-mini | 3,8 B | 4.096 tokens (128K en variante) | MIT | safetensors, GGUF |
| Llama-3.2-3B | 3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF |

La comparación de rendimiento (MMLU, HumanEval, GSM8K) no está disponible para MobileWeave-4B, por lo que no es posible establecer una jerarquía cualitativa frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base antes de desplegarlo en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación de información extensa.
- Riesgo de alucinación: al no haber benchmarks publicados, no hay evidencia cuantitativa sobre la fiabilidad factual del modelo.
- Sesgos: no se documenta ninguna evaluación de sesgos; un modelo de 4,4 B sin información de alineación publicada puede presentar sesgos sociales y culturales no mitigados.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- Componente multimodal sin documentar: la presencia de mmproj no garantiza que la visión funcione correctamente con todas las versiones de llama.cpp; conviene validarla antes de integrarla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MobileWeave-4B-GGUF
- Modelo base: https://huggingface.co/Maxnotmarx/MobileWeave-4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#MobileWeave-4B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
