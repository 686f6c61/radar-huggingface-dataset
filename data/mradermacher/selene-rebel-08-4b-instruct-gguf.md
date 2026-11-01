# mradermacher/Selene-Rebel-08-4B-Instruct-GGUF

## Resumen

Selene-Rebel-08-4B-Instruct-GGUF es un repositorio de cuantizaciones GGUF del modelo Syradevops/Selene-Rebel-08-4B-Instruct, creado por el cuantizador mradermacher. El modelo base es un modelo instructivo de texto de aproximadamente 3,88 mil millones de parámetros basado en la arquitectura Gemma 3, entrenado o afinado por Syradevops. La función de este repositorio no es aportar un modelo nuevo, sino facilitar la inferencia local del modelo base en formato GGUF, el estándar de llama.cpp y sus derivados (Ollama, LM Studio, etc.).

La relevancia de esta ficha radica en la accesibilidad: con cuantizaciones desde 1,8 GB (Q2_K) hasta 7,9 GB (f16), el modelo puede ejecutarse en hardware de consumo muy modesto, incluidas GPUs de gama media e incluso CPU con RAM suficiente. El repositorio incluye además archivos mmproj (suplementos multimodales en Q8_0 y f16), lo que indica que el modelo base hereda capacidades de visión de Gemma 3. La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.

Es importante señalar que la model card disponible es la generada automáticamente por el cuantizador y no incluye información detallada sobre el proceso de entrenamiento del modelo base, benchmarks ni capacidades específicas documentadas por Syradevops, por lo que varios apartados de esta ficha indican datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder denso) |
| Parametros totales | 3.880.263.168 (~3,88 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE; arquitectura densa) |
| Longitud de contexto | no disponible (Gemma 3 suele soportar 128K, pero no consta en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (etiquetado en la model card; no disponible información sobre otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base usa safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base, Selene-Rebel-08-4B-Instruct, pertenece a la familia Gemma 3 según las etiquetas del repositorio, una arquitectura de transformer decoder denso desarrollada por Google. Con 3,88 mil millones de parámetros, se sitúa en la gama de modelos pequeños pensados para inferencia eficiente en un solo dispositivo. El sufijo "Instruct" indica que se trata de una versión ajustada para seguir instrucciones y conversación, y el nombre "Rebel-08" sugiere un fine-tuning comunitario sobre la base de Gemma 3 4B, aunque Syradevops no documenta en la model card los datos ni el método de entrenamiento empleados (SFT, DPO, RLHF, composición del dataset, número de tokens).

El repositorio de mradermacher contiene exclusivamente cuantizaciones estáticas GGUF generadas por conversión desde el formato HF original. No hay cuantizaciones imatrix (matriz de importancia) disponibles en el momento de publicación, y el cuantizador indica que pueden solicitarse mediante una Community Discussion. La presencia de archivos mmproj (proyectores multimodales en Q8_0 y f16) confirma que el modelo base conserva el componente de visión de Gemma 3, lo que permitiría entrada de imágenes en runtimes compatibles como llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés, con formato instructivo (chat multi-turno).
- Comprensión de imágenes (visión): los archivos mmproj incluidos indican soporte multimodal heredado de Gemma 3, sujeto a compatibilidad del runtime.
- Razonamiento general y tareas de seguimiento de instrucciones propias de un modelo instructivo de ~4B; no hay datos publicados sobre rendimiento en código, matemáticas o agentes.
- Ejecución local eficiente gracias al formato GGUF, compatible con aceleración por GPU, CPU o híbrida.
- No hay información publicada sobre tool calling, function calling ni capacidades de agente.

## Casos de uso

- Chatbots locales y privados: al ser un modelo de ~4B cuantizado, puede ejecutarse íntegramente en un portátil para asistentes conversacionales sin enviar datos a servicios externos, útil cuando la privacidad es prioritaria.
- Asistentes con entrada de imágenes: mediante los archivos mmproj, puede describir o analizar imágenes en aplicaciones locales con llama.cpp, por ejemplo para extraer información de capturas de pantalla o fotografías.
- Prototipado rápido de aplicaciones LLM: su tamaño reducido permite iterar en desarrollo con Ollama o LM Studio antes de escalar a modelos mayores.
- Integración en dispositivos con recursos limitados: la variante Q2_K (1,8 GB) cabe en equipos sin GPU dedicada, adecuado para edge computing o Raspberry Pi de gama alta (con rendimiento limitado).
- Clasificación, resumen y transformación de textos en inglés: tareas ligeras de PLN donde un modelo de 4B suele ser suficiente y la latencia importa.
- Servicios con licencia permisiva: Apache 2.0 permite integrarlo en productos comerciales sin obligaciones de copyleft, útil para startups que necesitan un modelo base sin restricciones.
- Experimentación con cuantizaciones: el abanico completo de quants estáticas lo hace adecuado para evaluar el compromiso calidad/tamaño en proyectos de optimización de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los metadatos del repositorio incluyen evaluaciones (MMLU, GSM8K, HumanEval u otras) del modelo base Syradevops/Selene-Rebel-08-4B-Instruct.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización (tamaño del archivo + overhead de contexto, aproximadamente 0,5-1 GB adicional):
  - Q2_K: ~1,8 GB (ejecutable en CPU con 4 GB de RAM libres)
  - Q4_K_M (recomendada): ~2,6 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o más ejecuta con holgura las cuantizaciones Q4-Q8; por ejemplo, RTX 3060 12 GB, RTX 4060, RTX 4090 o superiores. No se requieren A100 ni H100 para inferencia.
- Consumer GPUs: cabe con comodidad en prácticamente cualquier GPU de consumo actual; incluso iGPUs o CPU pura son viables con las cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. El formato original safetensors del modelo base permite además vLLM o TGI, aunque este repositorio solo distribuye GGUF.
- Latencia y throughput: no disponibles como datos publicados; en un modelo de ~4B con Q4_K_M se pueden esperar velocidades del orden de decenas de tokens por segundo en GPU de consumo y varios tokens por segundo en CPU moderna, pero son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Selene-Rebel-08-4B-Instruct (este) | ~3,88 B | Gemma 3 (densa) | no disponible | Apache 2.0 | GGUF con mmproj (visión), fine-tuning comunitario |
| Gemma 3 4B IT (Google) | ~4 B | Gemma 3 (densa) | 128K | Gemma license | Modelo base oficial, benchmarks publicados, multimodal |
| Qwen2.5-3B-Instruct | ~3 B | Qwen2.5 (densa) | 32K (128K con YaRN) | Apache 2.0/Qwen license | Fuerte en multilingüe y código |
| Phi-3.5-mini-instruct (3.8B) | ~3,8 B | Phi-3 (densa) | 128K | MIT | Buen rendimiento en razonamiento para su tamaño |

La comparativa se ofrece a título orientativo: al no existir benchmarks publicados de Selene-Rebel-08, no es posible comparar rendimiento de forma rigurosa. Su principal ventaja frente a los alternativos es la licencia Apache 2.0 sin restricciones y la disponibilidad inmediata de cuantizaciones GGUF.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados para este fine-tuning; como derivado de Gemma 3, puede heredar los sesgos del modelo base y de sus datos de entrenamiento, pero no hay auditorías publicadas.
- Riesgo de alucinación: propio de cualquier LLM; en modelos de ~4B el riesgo es mayor que en modelos de mayor escala, especialmente en tareas de razonamiento complejo o hechos específicos.
- Idioma: la model card etiqueta el modelo solo como inglés; el rendimiento en castellano u otros idiomas no está documentado y debe validarse antes de uso en producción.
- Contexto: la longitud de ventana no consta en la model card; asumir 128K por ser Gemma 3 sin verificar puede causar errores de truncado o degradación.
- Cuantizaciones bajas: Q2_K y Q3_K implican pérdida de calidad notable respecto a f16, especialmente en tareas difíciles; mradermacher recomienda Q4_K_S/Q4_K_M como equilibrio.
- Multimodalidad condicionada: el soporte de visión requiere cargar el archivo mmproj correspondiente y usar un runtime compatible; no todos los frontales lo soportan.
- Ausencia de imatrix: solo hay cuantizaciones estáticas, de calidad ligeramente inferior a las weighted/imatrix equivalentes.
- Licencia: Apache 2.0 no impone restricciones comerciales relevantes, pero conviene verificar la procedencia del fine-tuning de Syradevops, cuya documentación es escasa.
- Procedencia poco documentada: al tratarse de un fine-tuning comunitario sin model card detallada, se recomienda evaluación propia antes de uso en producción.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Selene-Rebel-08-4B-Instruct-GGUF
- Modelo base: https://huggingface.co/Syradevops/Selene-Rebel-08-4B-Instruct
- Página de descargas resumida (mradermacher): https://hf.tst.eu/model#Selene-Rebel-08-4B-Instruct-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo base: no disponible
