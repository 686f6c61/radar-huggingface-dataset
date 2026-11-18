# KRAFTON/Raon-1-mini-preview

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Con 28.800 millones de parámetros totales y 4.300 millones activos por token, se posiciona como un modelo de tamaño medio con coste de inferencia reducido, orientado a conversación en coreano y a tareas agénticas (tool calling y ejecución multi-paso).

La arquitectura es híbrida: combina 18 capas de atención lineal de estado fijo (Raon Delta Attention, RDA) con 7 capas de atención completa basadas en Gated MLA, lo que reduce drásticamente la memoria de caché KV en contextos largos (unos 8 KiB por token en BF16). Soporta de forma nativa hasta 262.144 tokens de contexto y emplea un esquema MoE disperso con 128 expertos enrutados, de los que se activan 6 más uno compartido.

La relevancia actual del modelo radica en tres factores: licencia Apache 2.0 sin restricciones de uso comercial, soporte de decodificación especulativa mediante un modelo draft DFlash2, y cuantizaciones MXFP8 y NVFP4 que permiten ejecutarlo en una única GPU de consumo como la NVIDIA RTX 5090 (32 GB de VRAM). Se trata, no obstante, de una versión preview cuyas especificaciones y resultados pueden cambiar antes del lanzamiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (18 capas Raon Delta Attention + 7 capas Gated MLA) |
| Parametros totales | 28.783.218.402 (28,8B) |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8, NVFP4 (BF16 como formato base) |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

Otros datos técnicos declarados por el autor: 25 capas totales, hidden size de 2.560, 40 cabezas de atención (dimensión 128 en RDA; 192 QK / 128 V en Gated MLA), rango LoRA de query/KV de 576/512 en Gated MLA, tamaño intermedio de experto de 1.088, FFN densa de 12.032 en la primera capa, función de activación SiTU-GLU, conexiones residuales Raon-mHC con 4 streams, vocabulario de 259.840 tokens, LM head no atada y codificación posicional NoPE (sin positional encoding). El repositorio ocupa 32,7 GB.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer híbrida en la que 18 de las 25 capas usan Raon Delta Attention (RDA), una variante de Kimi Delta Attention que desacopla las compuertas de borrado y escritura para mejorar el rendimiento en contexto largo, y solo 7 capas mantienen caché KV mediante Gated MLA. Esta combinación reduce el coste de memoria en secuencias largas: únicamente las capas MLA conservan KV cache, aproximadamente 8 KiB por token en BF16. La codificación posicional es NoPE, es decir, el modelo no usa embeddings posicionales explícitos y delega la información de orden en el mecanismo de atención.

En el plano del enrutamiento, cada token activa 6 de los 128 expertos enrutados más un experto compartido, con un tamaño intermedio de experto de 1.088. La función de activación es SiTU-GLU y las conexiones residuales usan Raon-mHC con 4 streams, una optimización de las manifold-constrained hyper-connections de DeepSeek orientada a reducir coste computacional y acelerar el entrenamiento. El modelo fue entrenado desde cero por KRAFTON AI sobre datos en coreano, inglés, japonés, chino, español, francés y tailandés. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Como innovaciones destacables, el autor cita el soporte de decodificación especulativa mediante un modelo draft DFlash2 y la disponibilidad de pesos cuantizados en MXFP8 y NVFP4, este último pensado para inferencia en una sola RTX 5090.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 262.144 tokens.
- Razonamiento integrado con modo de pensamiento (built-in thinking), con resultados destacados según el autor en benchmarks de matemáticas y ciencia.
- Seguimiento de instrucciones y tareas de búsqueda, donde el autor afirma que lidera frente a los modelos de comparación.
- Ejecución de agentes y tool calling (function calling) para flujos agénticos multi-paso; soporte declarado para Hermes Agent, Pi y OpenCode.
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con rendimiento especialmente fuerte en coreano.
- Decodificación especulativa acelerada mediante el modelo draft DFlash2.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana y a su entrenamiento específico en coreano, lo que permite mantener historiales extensos de cliente sin truncar información.
- Agentes autónomos con herramientas: al soportar tool calling y ejecución multi-paso (Hermes Agent, Pi, OpenCode), puede integrarse en pipelines que consulten APIs, bases de datos o servicios externos y encadenen llamadas con razonamiento intermedio.
- Asistentes de búsqueda aumentada: el autor sitúa al modelo como líder en benchmarks de búsqueda entre sus comparables, por lo que es adecuado para sistemas RAG que requieran sintetizar respuestas a partir de documentos recuperados extensos.
- Razonamiento matemático y científico asistido: el modo de pensamiento integrado lo hace apto para tutoría técnica, resolución de problemas paso a paso y verificación de cálculos en entornos educativos o de investigación.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización NVFP4 permite ejecutarlo en una única RTX 5090 de 32 GB, lo que habilita prototipos locales y entornos de desarrollo sin infraestructura de centro de datos.
- Procesamiento de documentos largos en producción: con atención híbrida y caché KV reducida (8 KiB/token en BF16), el coste de memoria por sesión es manejable para analizar contratos, informes o expedientes de decenas de miles de tokens.
- Servicio multilingüe para el mercado asiático: al cubrir coreano, japonés, chino y tailandés además de inglés y lenguas europeas, sirve para productos con base de usuarios repartida por Asia Oriental y el Sudeste Asiático.

## Benchmarks y rendimiento

El autor publica gráficas comparativas frente a modelos MoE de referencia, pero los valores numéricos no están incluidos en la información disponible (la tabla de la model card aparece truncada). No se han podido extraer cifras concretas de MMLU, HumanEval, GSM8K ni de otros benchmarks.

| Benchmark | Resultado |
|---|---|
| Razonamiento (matemáticas y ciencia) | no disponible (el autor declara liderazgo frente a los modelos de comparación) |
| Seguimiento de instrucciones | no disponible (el autor declara liderazgo frente a los modelos de comparación) |
| Búsqueda | no disponible (el autor declara liderazgo frente a los modelos de comparación) |
| Resto de benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada en BF16: el repositorio pesa 32,7 GB, por lo que la inferencia en precisión completa requiere del orden de 33-40 GB de VRAM, según overhead de runtime y longitud de contexto.
- Cuantización NVFP4: el autor indica explícitamente que permite inferencia en una única NVIDIA RTX 5090 con 32 GB de VRAM.
- Cuantización MXFP8: reduce el peso a aproximadamente la mitad respecto a BF16; no se especifica la VRAM exacta necesaria en la información disponible.
- GPU recomendadas: RTX 5090 (32 GB) para NVFP4; para BF16 se necesitan GPU de 40-80 GB como A100 40/80 GB, H100 o L40S. No se dispone de datos de rendimiento medidos en estas GPU.
- Despliegue: la librería indicada es transformers con código personalizado (custom_code); no se confirma en la información disponible soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El modelo incluye un draft model DFlash2 para decodificación especulativa, lo que en principio incrementa el throughput, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de los nombres ni de las cifras de los modelos de comparación incluidos en las gráficas del autor. La siguiente tabla recoge únicamente los datos verificables del modelo frente a alternativas MoE de tamaño comparable, con los campos no confirmados marcados como no disponibles.

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1 mini preview | 28,8B / 4,3B | 262.144 | Apache 2.0 | Híbrido RDA + MLA, NoPE, cuantización NVFP4 |
| Alternativas MoE de referencia | no disponible | no disponible | no disponible | El autor las incluye en sus gráficas sin especificar nombres en la información disponible |

## Limitaciones y advertencias

- Versión preview: el propio autor advierte de que no es un modelo final y que las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo; no debe tratarse como una base estable para producción crítica sin validación propia.
- Riesgo de alucinación: no se documentan en la información disponible evaluaciones de factualidad ni tasas de alucinación; como todo modelo generativo, requiere verificación de salidas en dominios sensibles.
- Sesgos: no se publica información sobre sesgos demográficos, culturales o lingüísticos. El entrenamiento está fuertemente orientado al coreano, lo que puede desequilibrar el comportamiento en otras lenguas.
- Idiomas: aunque se declaran siete idiomas, el autor solo garantiza rendimiento fuerte en coreano y "sólido" en inglés; el rendimiento en español, francés, japonés, chino y tailandés no está cuantificado.
- Acceso restringido por gate: pese a la licencia Apache 2.0, el repositorio exige solicitar acceso y rellenar un formulario (nombre, afiliación, puesto, país y uso previsto); esto añade fricción operativa a la descarga automatizada en pipelines.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar los términos del gate y de los pesos cuantizados publicados por separado.
- Soporte de runtime limitado: la dependencia de `custom_code` y la ausencia de confirmación de soporte en vLLM, llama.cpp u Ollama pueden complicar el despliegue en infraestructuras estándar.
- Caché KV: aunque reducida, las 7 capas MLA mantienen unos 8 KiB por token en BF16, lo que a 262.144 tokens supone del orden de 2 GB por secuencia; con muchas peticiones concurrentes la memoria crece de forma significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Página corporativa de KRAFTON AI: https://krafton.ai/en/
- Repositorio de assets en GitHub: https://github.com/krafton-ai/Raon-1-mini-preview
- Cuenta de X de KRAFTON AI: https://x.com/Krafton_AI
- Comunidad de Discord: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- KRAFTON (empresa): https://www.krafton.com/en/
- KRAFTON en Wikipedia: https://en.wikipedia.org/wiki/Krafton
