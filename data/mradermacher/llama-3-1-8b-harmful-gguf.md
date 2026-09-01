# mradermacher/llama-3.1-8B-Harmful-GGUF

## Resumen

El modelo `mradermacher/llama-3.1-8B-Harmful-GGUF` es una colección de cuantizaciones GGUF del modelo `sayandasscientistcoder/llama-3.1-8B-Harmful`, una variante sin censura (uncensored) del Llama 3.1 8B de Meta. El autor, mradermacher, se dedica a convertir modelos de HuggingFace a formato GGUF para su uso en entornos locales con herramientas como llama.cpp u Ollama. Este modelo en particular está diseñado para eliminar los filtros de seguridad y moderación del Llama 3.1 original, permitiendo respuestas sin restricciones sobre temas que el modelo base rechazaría.

La relevancia de este modelo radica en su uso para investigación sobre seguridad de IA, evaluación de riesgos de modelos sin alineación, o aplicaciones donde se requiere una generación de texto sin censura (siempre bajo responsabilidad del usuario). Al ser una cuantización GGUF, ofrece múltiples niveles de compresión (desde f16 hasta Q2_K) para adaptarse a diferentes capacidades de hardware. El repositorio ocupa 42.7 GB en total, lo que indica que incluye todas las variantes de cuantización listadas en los metadatos.

Es importante señalar que no se dispone de información oficial sobre licencia, idiomas soportados ni detalles del entrenamiento del modelo base. El nombre "Harmful" sugiere que el modelo puede generar contenido dañino o peligroso, por lo que su uso debe limitarse a entornos controlados y con fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Llama 3.1 8B, no confirmado) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presumiblemente 128k si mantiene la configuracion de Llama 3.1) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `llama-3.1-8B-Harmful`. Dado que parte de Llama 3.1 8B, es probable que conserve la arquitectura transformer con 32 capas, 8 cabezas de atencion por capa y 128k de contexto, pero no hay confirmacion. El proceso de "harmful" o "uncensored" suele implicar un fine-tuning o abliteration (eliminacion de direcciones de rechazo) sobre el modelo original, pero no se han publicado detalles del dataset ni del metodo de entrenamiento. El autor del repo GGUF solo ha realizado la cuantizacion a partir de los pesos originales en formato safetensors, sin modificar los pesos internos.

## Capacidades

- Generacion de texto sin censura: el modelo responde a peticiones que el Llama 3.1 original rechazaria, incluyendo temas sensibles, ilegales o eticamente cuestionables.
- Razonamiento y conocimiento general: al estar basado en Llama 3.1 8B, conserva las capacidades de razonamiento, conocimiento y generacion de codigo del modelo base, aunque la eliminacion de filtros puede afectar a la calidad en algunos dominios.
- Soporte de tool calling y function calling: no confirmado, pero probablemente heredado de Llama 3.1 Instruct si el modelo base mantiene esa capacidad.
- Capacidades multilingues: no confirmadas, aunque Llama 3.1 soporta multiples idiomas.
- Sin modo de pensamiento explicito ni capacidades multimodales.

## Casos de uso

- Investigacion en seguridad de IA: evaluar como se comporta un modelo sin alineacion ante prompts malintencionados, para disenar mejores sistemas de moderacion y filtrado.
- Analisis de sesgos y riesgos: estudiar que tipo de contenido dañino genera el modelo y compararlo con versiones alineadas para medir el impacto de la alineacion.
- Pruebas de robustez de sistemas de deteccion de contenido: usar el modelo como generador de ejemplos adversarios para entrenar clasificadores de contenido dañino (como el clasificador de consejos dañinos del AI Safety Institute).
- Desarrollo de aplicaciones de rol o ficcion sin restricciones: escritura creativa que requiera explorar temas tabu sin filtros, siempre en entornos privados y legales.
- Evaluacion de tecnicas de "abliteration": comparar este modelo con otras variantes uncensored de Llama 3.1 para entender como diferentes metodos de eliminacion de rechazo afectan al comportamiento.
- Despliegue local en entornos aislados: usar las cuantizaciones Q2_K o Q3_K en hardware modesto para pruebas rapidas sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para este modelo especifico. Dado que es una cuantizacion de un modelo derivado, el rendimiento puede variar respecto al Llama 3.1 8B original, pero no hay mediciones publicas.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para un modelo de 8B, los requisitos aproximados son:
  - Q2_K: ~3.5 GB de VRAM
  - Q3_K_M: ~4.5 GB
  - Q4_K_M: ~5.5 GB
  - Q5_K_M: ~6.5 GB
  - Q8_0: ~8.5 GB
  - f16: ~16 GB
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar las cuantizaciones mas bajas (Q2_K, Q3_K). Para Q4_K_M o superior se recomienda una RTX 3060 12GB, RTX 4070, o superior. Para f16 se necesita una GPU profesional (A100, H100) o usar CPU con suficiente RAM.
- Si cabe en consumer GPU: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, un modelo 8B en Q4_K_M suele generar entre 50 y 100 tokens por segundo, pero esto es una estimacion general no confirmada para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. Existen otros modelos GGUF de Llama 3.1 8B sin censura en el mismo repositorio de mradermacher, como `Llama-3.1-8B-Instruct-Uncensored-Complete-i1-GGUF` y `Llama-3.1-8B-Instruct-abliterated-i1-GGUF`, pero no se conocen sus diferencias exactas en rendimiento o comportamiento. Tampoco hay datos publicos de benchmarks comparativos. Se puede afirmar que todos comparten la misma base de 8B y el formato GGUF, pero las tecnicas de eliminacion de censura pueden diferir.

## Limitaciones y advertencias

- Contenido dañino: el modelo esta disenado para generar respuestas sin filtros, lo que incluye contenido ilegal, violento, sexual explicito, o perjudicial. Su uso conlleva riesgos legales y eticos.
- Sesgos y alucinaciones: al ser una variante sin alineacion, puede presentar sesgos amplificados y una mayor tendencia a alucinar, especialmente en temas delicados.
- Sin garantias de calidad: al ser una cuantizacion de un modelo derivado, la calidad de las respuestas puede degradarse respecto al Llama 3.1 original, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- Licencia desconocida: no se ha especificado la licencia del modelo base ni de la cuantizacion. Esto impide su uso comercial o su redistribucion sin autorizacion explicita.
- Sin soporte oficial: el autor no ofrece garantias ni actualizaciones. El modelo se proporciona tal cual.
- Riesgo de uso indebido: no debe desplegarse en produccion ni en sistemas que interactuen con usuarios reales sin un fuerte sistema de moderacion aguas abajo.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/llama-3.1-8B-Harmful-GGUF
- Modelo base (safetensors): https://huggingface.co/sayandasscientistcoder/llama-3.1-8B-Harmful
- Modelo relacionado (clasificador de consejos dañinos): https://hf-mirror.com/ai-safety-institute/Llama-3.1-8B-harmful-advice-classifier
- Otros modelos GGUF de mradermacher: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-i1-GGUF y https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-abliterated-i1-GGUF
