# richardyoung/Qwen3.5-4B-JSpace-heretic-GGUF

## Resumen

Qwen3.5-4B-JSpace-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.5-4B-JSpace-heretic, un derivado del Qwen3.5-4B de Alibaba. El autor, richardyoung, ha aplicado tecnicas de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) y una variante denominada "heretic" para reducir los comportamientos de rechazo del modelo original, orientandolo a investigacion sobre alineacion y desobediencia controlada.

El modelo cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y se distribuye exclusivamente en formato GGUF, pensado para inferencia con llama.cpp y Ollama. El repositorio ocupa 18,4 GB, lo que sugiere multiples niveles de cuantizacion empaquetados. La licencia declarada es Apache 2.0, heredada del modelo base Qwen.

Es relevante ahora porque combina tres tendencias activas: la familia Qwen3.5 como base abierta de referencia, las tecnicas de abliteration para estudiar el comportamiento de rechazo, y el formato GGUF para despliegue en hardware de consumo. El acceso esta restringido (gated) en Hugging Face y requiere aceptar condiciones. No se dispone de informacion publica sobre benchmarks, datos de entrenamiento del derivado ni detalles del proceso heretic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; lista exacta no disponible) |
| Idiomas soportados | Ingles (segun metadatos; capacidades multilingues del base no verificadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp y Ollama) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-4B, un transformer decoder-only denso de aproximadamente 4,2 mil millones de parametros. Sobre esa base, richardyoung aplico un proceso de abliteration: se identifican las direcciones en el espacio de activaciones que correlacionan con respuestas de rechazo y se proyectan fuera de los pesos, de modo que el modelo deja de activar el comportamiento de rechazo aprendido durante el alineamiento. La variante "heretic" y el sufijo "JSpace" no estan documentados en la informacion disponible; presumiblemente hacen referencia a una metodologia concreta de abliteration o a un dataset de calibracion, pero no se puede confirmar.

No hay datos publicados sobre el numero de tokens de entrenamiento del derivado, la composicion del dataset de calibracion, ni si se aplico RLHF, DPO o ajuste fino adicional. El modelo original Qwen3.5-4B fue entrenado por Alibaba con un pipeline que combina preentrenamiento masivo, ajuste supervisado y preferencia; esas etapas se heredan parcialmente, pero el efecto neto de la abliteration sobre el rendimiento general no esta medido. La unica innovacion documentada es la propia abliteration y el empaquetado GGUF con imatrix (mencionado en los tags), que usa una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Razonamiento general y respuesta a preguntas, heredado del base Qwen3.5-4B.
- Generacion de codigo y matematicas basicas (capacidad del base, no verificada tras la abliteration).
- Reduccion de rechazos: responde a prompts que el modelo original rechazaria, lo que es el objetivo declarado del derivado.
- Compatibilidad con llama.cpp y Ollama para inferencia local.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que permite servir el modelo via API.
- No hay evidencia de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni thinking mode en la informacion disponible.
- Capacidades multilingues no verificadas: los metadatos solo declaran ingles.

## Casos de uso

- Investigacion sobre alineacion y rechazo: comparar las respuestas del modelo abliterated con las del Qwen3.5-4B original para medir cuanto comportamiento de rechazo se elimina y a que coste en calidad. Es el uso principal declarado por los tags "research" y "heretic".
- Despliegue local en hardware de consumo: al ser GGUF de 4,2 mil millones de parametros, cabe en GPUs de 8-12 GB con cuantizaciones Q4 o Q5, permitiendo prototipos sin infraestructura cloud.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o contenido narrativo donde los rechazos del modelo base interrumpirian el flujo, con revision humana obligatoria por los riesgos de sesgo.
- Evaluacion de robustez de filtros: usar el modelo como adversario controlado para probar clasificadores de seguridad o pipelines de moderacion antes de desplegarlos.
- Experimentos de cuantizacion: comparar la calidad de distintos niveles GGUF generados con imatrix frente al modelo en precision completa, aprovechando que el repo incluye varias cuantizaciones.
- Servicio de API experimental: mediante el tag endpoints_compatible, montar un endpoint de inferencia para pruebas internas de productos conversacionales en ingles.
- Fine-tuning posterior: partir del modelo abliterated como base para ajustes especificos donde el comportamiento de rechazo del base supone un obstaculo, siempre dentro de los limites de la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GB para Q4_K_M, 3-3,5 GB para Q5_K_M y 4,5-5 GB para Q8_0, calculados a partir de los 4,2 mil millones de parametros (no confirmados por el autor).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para cuantizaciones Q4-Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para mayor comodidad y contexto largo.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4070 y equivalentes con cuantizaciones Q4 o Q5; en GPUs de 8 GB conviene usar Q4.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con endpoints (tag endpoints_compatible); vLLM y TGI no estan confirmados para este repo GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-JSpace-heretic-GGUF (este) | ~4,2 mil millones | No disponible | Apache 2.0 | GGUF | Abliterated, solo ingles declarado, acceso gated |
| Qwen3.5-4B (base) | ~4,2 mil millones | No disponible | Apache 2.0 | Safetensors y GGUF | Modelo original alineado, multilingue |
| Llama 3.2 3B Instruct | ~3,2 mil millones | 128 000 tokens | Llama 3.2 Community License | GGUF, safetensors | Base solida para despliegue local, con filtros |
| Gemma 3 4B | ~4 mil millones | 128 000 tokens (no confirmado) | Gemma Terms of Use | GGUF, safetensors | Multilingue, orientado a uso general |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para este derivado. Frente al Qwen3.5-4B base, la diferencia principal es la reduccion de rechazos y el empaquetado GGUF; frente a Llama 3.2 3B y Gemma 3 4B, la ventaja es la licencia Apache 2.0 y el enfoque de investigacion, con la desventaja de no tener datos de rendimiento ni soporte multilingue verificado.

## Limitaciones y advertencias

- La abliteration elimina direcciones de rechazo de forma indiscriminada; puede degradar el razonamiento, aumentar la tasa de alucinacion y producir respuestas incoherentes en dominios sensibles.
- Sesgos conocidos: no documentados para este derivado; se heredan los sesgos del Qwen3.5-4B original, no medidos aqui.
- Riesgo de alucinacion: probablemente elevado tras la abliteration, sin datos que lo cuantifiquen.
- Idiomas: los metadatos solo declaran ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: longitud no disponible; no se debe asumir la ventana del base sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterated; la responsabilidad legal y etica del contenido generado recae en el desplegador.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la distribucion automatizada.
- No hay benchmarks, model card detallada ni documentacion del proceso heretic; el modelo no es apto para produccion sin evaluacion propia.
- El tag "uncensored" implica que el modelo puede generar contenido no apto para todos los publicos; requiere moderacion externa en cualquier despliegue publico.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic-GGUF
- Modelo base (no cuantizado): https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion disponible.
