# mrfakename/Ripple-65B-Preview-GGUF

## Resumen

Ripple-65B-Preview es un modelo de lenguaje de 64.782.689.280 parametros (aproximadamente 65B) desarrollado por ricursiveAI bajo licencia Apache 2.0. Esta ficha documenta la version cuantizada en GGUF publicada por mrfakename, que permite ejecutar el modelo mediante llama.cpp en hardware mas modesto que el requerido para los pesos originales en BF16. El modelo base se distribuye con el identificador `ricursiveAI/Ripple-65B-Preview` y esta orientado a generacion de texto conversacional.

La relevancia de esta publicacion reside en dos factores. Por un lado, la arquitectura propietaria `ricursive` introduce varias modificaciones sobre el transformer clasico: atencion intercalada con ventanas deslizantes de 1024 tokens combinada con capas de atencion completa sin codificacion posicional (NoPE), normalizacion con peri-norm, compuerta de salida sigmoidea, residual de valor y MLP con proyecciones acotadas. Por otro, el autor de los cuantizados publica el parche `ricursive.patch` necesario para que llama.cpp reconozca la arquitectura, junto con verificaciones numericas frente a la implementacion original en Transformers.

El repositorio ocupa 390,9 GB e incluye seis niveles de cuantizacion (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M). No se ofrece Q2_K porque su perplejidad resulto inviable. La model card no proporciona informacion sobre el dataset de entrenamiento, la longitud de contexto nativa del modelo, los idiomas soportados ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion intercalada (4 de cada 5 capas con sliding window de 1024 tokens y NEOX RoPE; 1 de cada 5 con atencion completa y NoPE), peri-norm, compuerta de salida sigmoidea, residual de valor y MLP acotado |
| Parametros totales | 64.782.689.280 (aproximadamente 65B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible como valor nativo; la ventana de atencion de las capas deslizantes es de 1024 tokens y existen capas de atencion completa |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (sin Q2_K por perplejidad inaceptable) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (algunos niveles con archivos divididos: BF16 y Q8_0 con 3 y 2 archivos respectivamente, Q6_K con 2) |

## Arquitectura y entrenamiento

La arquitectura `ricursive` se aparta del transformer convencional en varios puntos documentados en la model card. La atencion es intercalada: cuatro de cada cinco capas emplean atencion con ventana deslizante de 1024 tokens y RoPE en variante NEOX, mientras que cada quinta capa aplica atencion completa sin codificacion posicional (NoPE). Cada bloque incorpora RMSNorm antes y despues tanto de la atencion como del MLP, ademas de RMSNorm por cabeza en las proyecciones Q y K. La salida de atencion pasa por una compuerta sigmoidea (`g_proj`) antes de la proyeccion `o_proj`. La proyeccion V de cada capa lee una interpolacion por capa, `sigmoid(lambda)`, entre el embedding escalado del token y el estado oculto normalizado, mientras que Q y K leen unicamente el estado oculto normalizado. El MLP acota la proyeccion gate a 20 y la proyeccion up a ±20 antes de la activacion. Los embeddings se escalan por √5120 y la cabeza de salida no esta atada a los embeddings de entrada.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni detalles adicionales del proceso de alineacion. La model card del cuantizado se limita a describir la arquitectura y el proceso de conversion. El parche `ricursive.patch` cubre tanto el conversor de Hugging Face a GGUF como el grafo de inferencia en llama.cpp. La verificacion frente a la implementacion original en Transformers en bf16, sobre un prompt de wikitext de 1100 tokens (que supera la ventana de 1024 y ejercita la ruta de sliding window), reporta una coincidencia top-1 del 98,8 % con KL medio de 4,1e-4 y KL maximo de 0,015 para el GGUF BF16, y del 98,5 % con KL medio de 7,7e-4 y maximo de 0,042 para Q8_0. Los primeros 30 tokens generados con decodificacion greedy a partir de la plantilla de chat fueron identicos a los de Hugging Face en ambos casos, y el tokenizador embebido coincide token a token con el de Hugging Face. Una conversion a float32 de un modelo truncado igualo exactamente a Hugging Face en fp32, con 100 % de top-1 y KL medio de 6e-8.

## Capacidades

- Generacion de texto conversacional en formato multi-turno mediante la plantilla ChatML embebida.
- Soporte de tool calling declarado en la plantilla de chat (`chat_template.jinja`), que incluye herramientas y etiquetas de razonamiento.
- Soporte de modo de razonamiento (` thinking`), segun la plantilla de chat incluida.
- Generacion autoregresiva estandar; no se documentan capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues: no disponibles (la model card no especifica idiomas).
- Capacidades de codigo, matematicas o razonamiento avanzado: no disponibles como datos verificados; no se han publicado evaluaciones al respecto.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Despliegue de chat conversacional autoalojado: con el cuantizado Q4_K_M (36,1 GiB), el modelo puede servir conversaciones multi-turno en una GPU de 48 GB o en configuraciones multi-GPU, usando la plantilla ChatML con `--jinja` para preservar el formato de turnos y el token de fin `<|im_end|>`.
- Asistentes con llamada a herramientas: la plantilla embebe soporte de tool calling, de modo que puede integrarse en un orquestador de agentes que parsee las llamadas a funciones generadas por el modelo y ejecute las herramientas externas.
- Razonamiento con trazas explicitas: la etiqueta `</think>` permite separar el razonamiento interno de la respuesta final en pipelines que necesiten auditar el proceso de decision del modelo.
- Experimentacion en investigacion sobre arquitecturas alternativas: la implementacion de referencia con sliding window, NoPE y residual de valor convierte al modelo en un banco de pruebas para estudiar el efecto de estas tecnicas en tareas de lenguaje, comparandolo con transformers clasicos del mismo tamano.
- Inferencia en estaciones de trabajo con multiples GPU consumer: el nivel Q3_K_M (28,9 GiB) permite ejecutar el modelo en configuraciones de 2×24 GB o 3×16 GB mediante llama.cpp, con la salvedad de que requiere el parche de arquitectura.
- Evaluacion de calidad de cuantizacion: los seis niveles publicados con sus valores de perplejidad permiten medir el impacto de la cuantizacion en una arquitectura no estandar antes de comprometerse con un despliegue en produccion.
- Generacion de texto por lotes en entornos con CPU o GPU mixtas: llama.cpp con GGUF dividido y offloading parcial permite procesar lotes en hardware heterogeneo, aunque con latencias mayores que las de un servidor dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica publicada es la perplejidad de llama-perplexity sobre wikitext-2-raw con `-c 2048 --chunks 4`, que el propio autor advierte que es una muestra pequena y debe usarse solo para comparar cuantizaciones entre si:

| Cuantizacion | Tamano | Archivos | PPL |
|---|---|---|---|
| BF16 | 120,7 GiB | 3 | 8,82 |
| Q8_0 | 64,1 GiB | 2 | 8,81 |
| Q6_K | 49,5 GiB | 2 | 9,14 |
| Q5_K_M | 42,6 GiB | 1 | 8,74 |
| Q4_K_M | 36,1 GiB | 1 | 9,13 |
| Q3_K_M | 28,9 GiB | 1 | 9,23 |
| Q2_K (no publicado) | — | — | 50,7 |

El margen de error indicado es de ±0,4, por lo que las diferencias entre Q8_0, Q6_K, Q5_K_M y Q4_K_M se consideran ruido. La verificacion de fidelidad frente a Hugging Face se recoge en la seccion de arquitectura.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 121 GB para BF16, 64 GB para Q8_0, 50 GB para Q6_K, 43 GB para Q5_K_M, 36 GB para Q4_K_M y 29 GB para Q3_K_M, mas el overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: configuraciones multi-GPU para todos los niveles. BF16 y Q8_0 requieren varios aceleradores de 80 GB (A100/H100); Q4_K_M y Q3_K_M caben en configuraciones de 2×24 GB (RTX 4090, L40S) o 3-4×16 GB con offloading parcial.
- Cabe en GPU consumer: unicamente los niveles Q3_K_M y Q4_K_M, y solo en configuraciones multi-GPU; no cabe en una unica GPU de 24 GB ni de 16 GB.
- Opciones de despliegue: llama.cpp con el parche `ricursive.patch` aplicado sobre el commit `6f1e654`; no se documenta soporte en vLLM, TGI, Ollama u otros runtimes, ya que la arquitectura `ricursive` no esta en la linea principal de llama.cpp.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa fiable con modelos de tamano similar. A continuacion se comparan unicamente los datos estructurales conocidos, marcando como no disponibles los campos sin informacion.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ripple-65B-Preview | 64,78B | no disponible (sliding window de 1024 tokens en 4 de cada 5 capas) | Apache 2.0 | GGUF, pesos originales | Arquitectura `ricursive` no estandar; requiere parche en llama.cpp |
| Alternativas de ~65-70B (p. ej., Llama 3.3 70B, Qwen2.5 72B) | ~70B | no aplica a esta ficha | licencias propias | safetensors, GGUF | Datos no verificados en la informacion disponible; se citan solo como categoria de referencia |

No disponible una comparativa de benchmarks con alternativas, al no haberse publicado resultados en la informacion proporcionada.

## Limitaciones y advertencias

- La arquitectura `ricursive` no esta soportada por la linea principal de llama.cpp: es imprescindible compilar con el parche `ricursive.patch` sobre el commit `6f1e654`, lo que complica el mantenimiento y la actualizacion del runtime.
- La model card no documenta sesgos conocidos, riesgos de alucinacion ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- No se especifican los idiomas soportados ni el volumen o la composicion del corpus de entrenamiento, lo que impide estimar la cobertura linguistica y la calidad en castellano.
- Los resultados de perplejidad publicados proceden de una muestra pequena de wikitext-2-raw y no constituyen una evaluacion de capacidad; el autor lo advierte explicitamente.
- El nivel Q2_K no se publica porque su perplejidad (50,7) es mas de cinco veces la de Q3_K_M, lo que indica que la cuantizacion agresiva degrada gravemente esta arquitectura.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como "Preview" y sin garantias; debe validarse en el dominio de destino antes de produccion.
- Los archivos divididos (BF16, Q8_0, Q6_K) requieren apuntar llama.cpp al archivo `-00001-of-` para cargar el resto.
- No se dispone de datos de latencia ni throughput, por lo que no puede garantizarse el cumplimiento de acuerdos de nivel de servicio en despliegues de produccion.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mrfakename/Ripple-65B-Preview-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Perfil del autor de los cuantizados: https://x.com/realmrfakename
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp usado para la conversion: https://github.com/ggml-org/llama.cpp/commit/6f1e6543704bc5b080c7a98e7b6f707b31f6ed51
- Parche de arquitectura: incluido en el repositorio como `ricursive.patch`
