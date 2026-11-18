# koheip/mini-gpt-ja

## Resumen

Mini-GPT-ja es un modelo de lenguaje generativo de tipo decoder-only Transformer implementado íntegramente desde cero en Python y PyTorch por el desarrollador independiente koheip. Se trata de un proyecto de caracter educativo y experimental, no de un modelo destinado a producción: cuenta con aproximadamente 900.000 parámetros y emplea un tokenizador a nivel de carácter (character-level), sin vocabulario subword tipo BPE. El modelo está entrenado exclusivamente en japonés y se publica con licencia MIT.

El modelo resuelve un problema fundamentalmente pedagógico: ofrecer una implementación legible y completa de un GPT (en torno a 150 líneas en `mini_gpt.py`) que incluye embeddings de token y posicionales, self-attention causal multi-cabeza, bloques Transformer con LayerNorm, MLP y conexiones residuales, y generación autorregresiva. Sobre esa base, el autor añade un modo conversacional (`chat_gpt.py`) entrenado con datos de diálogo en formato `ユーザー: ...\nAI: ...◁`, usando el símbolo `◁` como token de parada.

Su relevancia actual es acotada y de índole didáctica: sirve como material de estudio para comprender la mecánica interna de un Transformer generativo y como banco de pruebas para experimentar con fine-tuning conversacional y visualización de distribuciones de probabilidad en un entorno local sin dependencias externas pesadas. No compite con modelos de propósito general ni con LLM comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), implementado desde cero en PyTorch |
| Parametros totales | Aproximadamente 900.000 (0,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en PyTorch state_dict, sin versiones GGUF publicadas) |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (`chat_model.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only clásico de escala mínima: tokenizador a nivel de carácter, embeddings de token y posicionales, atención causal multi-cabeza que enmascara tokens futuros, y bloques Transformer compuestos por LayerNorm, atención, MLP y conexiones residuales. La generación es autorregresiva. El autor indica que la implementación completa cabe en unas 150 líneas de código en `mini_gpt.py`, lo que subraya el objetivo de legibilidad sobre el de rendimiento.

El entrenamiento se realiza en dos fases según la documentación: un preentrenamiento sobre texto literario japonés de muestra (`sample_data.txt`) para la generación de prosa, y un ajuste conversacional sobre un dataset de pares pregunta-respuesta (`chat_data.txt`) en formato `ユーザー: ...\nAI: ...◁`, con `◁` como token de parada. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autorregresiva en japonés a nivel de carácter.
- Generación de prosa breve a partir de texto literario de muestra (modo preentrenamiento).
- Diálogo conversacional de un turno en formato pregunta-respuesta, con token de parada `◁`.
- Visualización de la distribución de probabilidad del primer carácter predicho (top-5) en la interfaz web.
- Edición del dataset conversacional y reentrenamiento en caliente desde el navegador.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al japonés; no se documenta soporte de otros idiomas.

## Casos de uso

- Estudio de la arquitectura Transformer: el código de ~150 líneas permite a desarrolladores e investigadores diseccionar embeddings, atención causal, LayerNorm y MLP en un caso real y ejecutable, sin la complejidad de un stack de inferencia industrial.
- Docencia y talleres de deep learning: el modelo y sus scripts (`mini_gpt.py`, `chat_gpt.py`) sirven como material práctico para explicar preentrenamiento, ajuste conversacional y generación autorregresiva en un portátil convencional.
- Prototipado rápido de chatbots de juguete en japonés: el modo `--chat` de `chat_gpt.py` permite montar un diálogo de un turno con token de parada para demostraciones o pruebas de concepto internas.
- Experimentación con datasets conversacionales: el Web UI permite editar `chat_data.txt` y reentrenar al vuelo, lo que facilita iterar sobre formatos de diálogo y observar el efecto en las respuestas.
- Análisis de calibración y distribución de salida: la visualización de las probabilidades top-5 del primer carácter predicho ayuda a estudiar cómo un modelo diminuto distribuye su incertidumbre y por qué falla fuera del dominio de entrenamiento.
- Entorno de aprendizaje sin dependencias externas: el servidor web usa únicamente `http.server` de la librería estándar de Python, lo que lo hace adecuado para entornos restringidos, aulas con portátiles de bajos recursos o demostraciones offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: marginal; con ~0,9 M de parámetros el modelo ocupa del orden de unos pocos MB en memoria, ejecutable en CPU sin GPU dedicada (estimación a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: innecesarias; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sobra para entrenamiento e inferencia, y en la práctica la CPU es suficiente.
- Cabe en cualquier GPU consumer y en equipos sin GPU.
- Opciones de despliegue: scripts nativos en PyTorch (`mini_gpt.py`, `chat_gpt.py`, `web_ui.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni pesos en formatos compatibles con esos motores.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| koheip/mini-gpt-ja | ~0,9 M | No disponible | Japones | MIT | Educativo, from-scratch, character-level |
| karpathy/nanoGPT | ~10 M–124 M (configurable) | Configurable (típicamente 256–1024 tokens) | Inglés principalmente | MIT | Educativo, from-scratch, BPE |
| karpathy/minGPT | ~0,1 M–10 M (configurable) | Configurable | Inglés | MIT | Educativo, minimalista |
| Modelos GPT japoneses pequeños de terceros | Variable | Variable | Japones | Variable | No disponible comparación directa verificada |

La comparación con nanoGPT y minGPT es la más pertinente por categoría (implementaciones educativas from-scratch), si bien sus cifras de parámetros y contexto dependen de la configuración elegida y no se dispone aquí de datos verificados de rendimiento comparativo. No se han identificado benchmarks publicados que permitan comparar directamente mini-gpt-ja con alternativas de la misma tarea.

## Limitaciones y advertencias

- Escala muy reducida (~0,9 M de parámetros): la calidad de generación es muy limitada y el propio autor advierte que ante temas no presentes en los datos de entrenamiento las respuestas serán incoherentes o fuera de tema.
- Tokenizador a nivel de carácter: sin vocabulario subword, lo que restringe la eficiencia y la generalización léxica.
- Riesgo elevado de alucinación y de respuestas sin sentido, especialmente en el modo conversacional.
- Entrenado exclusivamente en japonés y sobre corpus de muestra pequeños; no se documenta cobertura de otros idiomas ni robustez fuera de dominio.
- Longitud de contexto no documentada; no debe asumirse capacidad de conversaciones multi-turno largas.
- Sin soporte documentado de tool calling, agentes, visión ni razonamiento multi-paso; no apto para pipelines de producción que requieran fiabilidad.
- Licencia MIT: permite uso comercial y modificaciones, pero el modelo no ofrece garantías de calidad y su uso en producción exigiría validación propia.
- No se publican pesos en formatos GGUF ni integraciones con motores de inferencia estándar, lo que limita su despliegue fuera de los scripts del autor.

## Enlaces

- Hugging Face: https://huggingface.co/koheip/mini-gpt-ja
- Demo Space: https://huggingface.co/spaces/koheip/mini-gpt-ja-demo
- GitHub: https://github.com/koheip/mini-llm
- Perfil del autor: https://huggingface.co/koheip
- Portafolio del autor: https://huggingface.co/spaces/koheip/kohei-portfolio
