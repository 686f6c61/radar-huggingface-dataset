# reaperdoesntknow/LFM2.5-2.6B-CyberSec

## Resumen

LFM2.5-2.6B-CyberSec es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-2.6B, publicado por el usuario reaperdoesntknow bajo licencia Apache-2.0. Se presenta como un checkpoint en ingles orientado a dominios de ciberseguridad, asociado al dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset segun los metadatos del repositorio. El modelo conserva la arquitectura LFM2 del original y se distribuye tanto en formato Transformers/Safetensors como en exportaciones GGUF (F16, Q8_0 y Q4_K_M).

El modelo resuelve, en teoria, la adaptacion de un modelo pequeno (2.697 millones de parametros) a tareas de instruccion en ciberseguridad, manteniendo un coste de inferencia bajo y la posibilidad de ejecucion local. Su relevancia practica radica en que combina un tamano contenido con empaquetado GGUF listo para llama.cpp y Ollama, lo que facilita pruebas cualitativas en hardware de consumo.

No obstante, el propio autor califica la publicacion como "research release" y advierte explicitamente de que no se publican benchmarks, comparaciones con la linea base ni evaluaciones de seguridad. La model card reconoce que la etiqueta del dataset y la existencia de los ficheros exportados no demuestran por si solas una mejora en capacidad de ciberseguridad. Cualquier evaluacion debe tratarse, por tanto, como pendiente de verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hereda la del modelo base LiquidAI/LFM2.5-2.6B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 2.697.198.592 (~2,7 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16, Q8_0, Q4_K_M; bloque de cuantizacion bitsandbytes 4-bit en la configuracion Transformers |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF |
| Tamano del repositorio | 11,8 GB |
| Pipeline | text-generation |
| Dataset de ajuste (segun metadatos) | Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint LiquidAI/LFM2.5-2.6B, por lo que su arquitectura subyacente es la familia LFM2 de LiquidAI. La informacion disponible no detalla la composicion interna de esa arquitectura (atencion, capas hibridas, etc.), ni el numero de tokens de entrenamiento empleados en el ajuste. La model card no documenta hiperparametros completos, criterios de seleccion de checkpoint ni el proceso de preprocesamiento del dataset.

El entrenamiento se asocia al dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, segun los metadatos del repositorio y la etiqueta `unsloth`, que sugiere el uso de herramientas de Unsloth para el ajuste. No se especifica si hubo RLHF, DPO u otra fase de alineacion posterior, ni se aportan comprobaciones de contaminacion de datos. Los ficheros publicos revisados por el autor no documentan estos aspectos, lo que limita la reproducibilidad del ajuste.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat incluida.
- Respuesta a instrucciones en el dominio de ciberseguridad (el autor no certifica la calidad de estas respuestas).
- Formato compatible con `transformers` mediante `AutoModelForCausalLM` y `apply_chat_template`.
- Exportaciones GGUF ejecutables con llama.cpp (`llama-cli`) y Ollama.
- Soporte de cuantizacion 4-bit mediante bitsandbytes en la configuracion Transformers.
- Capacidad multilingue: limitada al ingles segun los metadatos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento extendido (thinking), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre respuestas de modelos pequenos a prompts de instruccion en ciberseguridad: el modelo permite comparar cualitativamente su comportamiento frente al base LiquidAI/LFM2.5-2.6B sin modificar, tal como sugiere el autor.
- Pruebas locales de formato e inferencia: con las exportaciones GGUF (Q4_K_M, Q8_0, F16) se puede validar el pipeline de llama.cpp u Ollama en un equipo de sobremesa antes de desplegar variantes mayores.
- Desarrollo de arneses de evaluacion: sirve como sujeto de prueba para construir harness reproducibles (semillas, prompts, hashes de revision) en dominios de seguridad.
- Educacion y formacion interna: generacion de explicaciones introductorias sobre conceptos como defensa en profundidad, siempre con revision humana y sin ejecutar comandos generados.
- Comparacion de cuantizaciones: permite medir diferencias de comportamiento entre el checkpoint Transformers y cada GGUF, un aspecto que el autor senala como pendiente de documentar.
- Prototipado de asistentes de documentacion de seguridad: borradores de resumenes o guias a partir de material controlado, con validacion posterior por un analista.
- Integracion en pipelines de CI para pruebas de regresion de prompts: el modelo pequeno y las variantes GGUF permiten ejecuciones repetidas con coste bajo, aunque sin garantias de calidad demostrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio no publica resultados de benchmark, comparaciones con linea base ni evaluaciones de seguridad, y enumera la evidencia que faltaria para sostener una afirmacion de mejora (split de test retenido, benchmarks nombrados, harness reproducible, evaluacion de seguridad y resultados separados por cuantizacion).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (2,7 mil millones de parametros), F16 requeriria del orden de 5-6 GB de pesos, Q8_0 en torno a 3 GB y Q4_K_M en torno a 1,5-2 GB, mas overhead de contexto y runtime; estas cifras no las proporciona el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo es apto para GPU de consumo con suficiente VRAM para la cuantizacion elegida.
- Cabe en GPU de consumo: previsiblemente si en cuantizaciones Q4_K_M y Q8_0; sin confirmacion oficial del autor.
- Opciones de despliegue: Transformers (con `device_map="auto"`), llama.cpp (`llama-cli --jinja`), Ollama (`ollama run hf.co/...:Q4_K_M`). vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos | Benchmarks publicados |
|---|---|---|---|---|---|---|
| LFM2.5-2.6B-CyberSec (este) | ~2,7 B | no disponible | en | Apache-2.0 | safetensors, GGUF | no |
| LiquidAI/LFM2.5-2.6B (base) | ~2,7 B | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Otras variantes de la coleccion CIx del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible | no |

La comparacion cuantitativa con alternativas de la misma categoria no puede establecerse con la informacion proporcionada, ya que ni el modelo base ni los modelos de la coleccion CIx aportan datos de rendimiento en esta ficha.

## Limitaciones y advertencias

- El autor advierte que el modelo puede producir instrucciones incorrectas, desactualizadas, inseguras o daninas.
- El material de ciberseguridad es de doble uso por naturaleza; existe riesgo de misuse.
- No hay evaluacion de sesgos, alucinacion ni seguridad publicada.
- No se documentan preprocesamiento, comprobaciones de contaminacion, hiperparametros completos ni criterios de seleccion de checkpoint.
- Las versiones cuantizadas pueden comportarse de forma distinta al checkpoint Transformers.
- No se deben ejecutar comandos generados sin revision y aislamiento.
- No debe usarse como base unica para respuesta a incidentes, divulgacion de vulnerabilidades, control de acceso u otras decisiones consecuentes.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni de idoneidad para produccion.
- El soporte linguistico se limita al ingles segun los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-2.6B-CyberSec
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de ajuste: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
