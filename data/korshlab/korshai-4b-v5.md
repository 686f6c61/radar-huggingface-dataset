# KorshLAB/KorshAI-4B-v5

## Resumen

KorshAI-4B-v5 es un modelo de generacion de texto de 4.000 millones de parametros desarrollado por KorshLab en colaboracion con la Korsh Foundation, orientado especificamente a generacion de codigo y razonamiento sobre sistemas de bajo nivel. Se distribuye unicamente en formato GGUF cuantizado (Q4_K_M con importance matrices personalizadas), lo que lo posiciona como una opcion de inferencia local en CPU, GPUs de consumo y dispositivos edge. La model card lo describe como una arquitectura densa "propietaria" y compacta, especializada en C11, C++20, Rust, TypeScript, Python 3.12+, PHP 8.2+ y HTML5.

El modelo declara soporte para ingles y castellano, licencia Apache 2.0 y una unica publicacion en Hugging Face con cero descargas y cero likes en el momento de la consulta, lo que sugiere un lanzamiento muy reciente o de escasa difusion. La informacion tecnica disponible proviene exclusivamente de la model card del autor; no se han localizado papers, repositorios de codigo de entrenamiento ni evaluaciones independientes.

La relevancia practica del modelo reside en su huella de memoria reducida (2,69 GB en disco, aproximadamente 2,2-2,5 GB de memoria activa) y en su promesa de generar codigo con fidelidad sintactica verificada mediante compiladores con flags estrictos. No obstante, los propios benchmarks del autor muestran un rendimiento moderado (55,85% compuesto), por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (descrito por el autor como "propietaria compacta"); detalles de capas y atencion no disponibles |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; los ejemplos de uso emplean `-c 4096` y `-c 8192`, sin confirmar contexto nativo entrenado |
| Tipos de cuantizacion | Q4_K_M con importance matrices (imatrix) personalizadas; unico artefacto publicado |
| Idiomas soportados | Ingles (en), castellano (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unico archivo: `KorshAI-4B-v5.gguf`, 2.886.966.752 bytes) |

## Arquitectura y entrenamiento

La model card describe una arquitectura densa de 4B parametros "propietaria", sin detallar numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario. No se especifica si emplea atencion completa, atencion lineal o alguna variante hibrida. Tampoco se publica informacion sobre el tokenizador ni sobre el template de chat mas alla del formato ChatML-like mostrado en los ejemplos (`<|im_start|>` / `<|im_end|>`).

En cuanto al entrenamiento, el autor indica que cada unidad sintetica de entrenamiento fue validada mediante un "sandbox compiler gate" multinivel con flags `-Wall -Wextra -Werror -pedantic`, lo que sugiere un pipeline de generacion de datos sinteticos filtrados por compilacion. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o SFT. La cuantizacion se realizo con importance matrices calculadas sobre corpus de programacion poliglota, con el objetivo declarado de preservar la perplejidad de fp16 con menor huella de memoria. No hay informacion sobre innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de codigo en C11, C++20, Rust, TypeScript, Python 3.12+, PHP 8.2+ y HTML5, segun los tags y la model card.
- Razonamiento algoritmico y resolucion de problemas con casos limite, orientado a logica de sistemas.
- Generacion de salida estructurada en JSON con adherencia a JSON Schema (75,0% en la suite propia del autor).
- Razonamiento deductivo con chain-of-thought e identificacion de invariantes (42,4% en la suite del autor).
- Soporte bilingue: ingles y castellano.
- Integracion con `llama.cpp`, Ollama, LM Studio, Jan.ai, LocalAI, Text Generation WebUI y `llama-cpp-python`.
- Compatibilidad con servidor HTTP compatible con la API de OpenAI mediante `llama-server`.
- No se documenta soporte de tool calling o function calling, uso de agentes, vision, audio ni modo thinking explicito.

## Casos de uso

- Generacion de codigo C/C++ en sistemas embebidos y edge: el modelo esta especializado en C11 y C++20 y su huella de 2,2-2,5 GB de memoria activa permite ejecutarlo en estaciones de trabajo modestas o incluso en una Raspberry Pi 5, generando entre 6 y 9 tokens/s en ARM64.
- Asistente de programacion en local para desarrolladores con GPU de consumo: con una RTX 3060 o superior y 6-8 GB de VRAM se obtienen 60-90 tokens/s, suficiente para autocompletado y generacion de funciones en IDE sin depender de la nube.
- Generacion de scripts en Python, TypeScript o PHP para automatizacion backend: el soporte declarado de Python 3.12+, TypeScript y PHP 8.2+ lo hace util para tareas de scripting y generacion de endpoints, aunque su rendimiento en razonamiento formal es limitado.
- Produccion de salida estructurada JSON: con un 75,0% de adherencia a JSON Schema en la evaluacion del autor, puede emplearse para generar respuestas de API o configuraciones validadas en pipelines que toleren reintentos.
- Despliegue en servidor CPU sin GPU: con 6 GB de RAM y un procesador x86_64 con AVX2 se obtienen 5-15 tokens/s, lo que permite ofrecer un servicio de generacion de codigo interno en infraestructura sin acelerador.
- Educacion y prototipado de bajo coste: su licencia Apache 2.0 y su tamano permiten integrarlo en entornos docentes o pruebas de concepto sin coste de licencia ni hardware especializado.
- Traduccion tecnica ingles-castellano en contextos de documentacion de codigo: el modelo declara soporte de ambos idiomas, aunque no hay evaluacion publicada de calidad de traduccion.

## Benchmarks y rendimiento

Resultados publicados por el autor en la "KorshLab Evaluation Suite" (20 tareas multidominio con test runners deterministas y validacion por compilador). No hay verificacion independiente.

| Categoria | Puntuacion | Estandar de verificacion |
|---|---|---|
| JSON Schema y salida estructurada | 75,0% | Validacion RFC 7159 y adherencia a restricciones |
| Codigo y algoritmos | 68,0% | Resolucion algoritmica multilingue y casos limite |
| Razonamiento y logica formal | 42,4% | Chain-of-thought deductivo y analisis de invariantes |
| C++ sistemas y seguridad de memoria | 38,0% | Compilacion estricta con G++ 12+ (`-Wall -Wextra -Werror`) |
| Compuesto global | 55,85 | Modelo campeon de la linea KorshAI 4B |

No se han publicado resultados en benchmarks estandar de la industria (MMLU, HumanEval, GSM8K, MBPP, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 2,2 GB de memoria activa; 6 GB de RAM en CPU o 6-8 GB de VRAM en GPU con el archivo Q4_K_M de 2,69 GB.
- GPU recomendadas: NVIDIA RTX 3060, 3070, 4060, 4070 (6-8 GB VRAM). No se documentan requisitos para A100 o H100, aunque tecnicamente el modelo cabe en cualquier GPU con 4 GB o mas.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM; tambien en Apple Silicon M1/M2/M3/M4 con 8 GB de memoria unificada.
- CPU: 4 nucleos x86_64 con AVX2; se menciona soporte AVX-512 y aceleracion CUDA/Metal.
- Edge: Raspberry Pi 5 o RK3588 (ARM64) con 8 GB LPDDR4X, a 6-9 tokens/s.
- Opciones de despliegue: `llama.cpp` (b3000+), Ollama (v0.1.30+), LM Studio, Jan.ai, LocalAI, Text Generation WebUI, `llama-cpp-python` y `llama-server` con API compatible OpenAI.
- Rendimiento declarado: 5-15 tokens/s en CPU (prompt processing ~30-50 tok/s); 60-90 tokens/s en GPU de consumo (prompt processing ~900+ tok/s); 40-60 tokens/s en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KorshAI-4B-v5 | 4B denso | No disponible | Apache 2.0 | GGUF Q4_K_M | Especializado en codigo de sistemas; benchmarks solo del autor |
| Qwen2.5-Coder-3B | 3B denso | 32.768 tokens (nativo) | Apache 2.0 | safetensors, GGUF | Ampliamente evaluado en HumanEval y MBPP; ecosistema maduro |
| Llama 3.2 3B | 3B denso | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Uso general; requiere licencia especifica para comercial |
| DeepSeek-Coder-V2-Lite | 16B MoE (2,4B activos) | 128.000 tokens | DeepSeek License | safetensors, GGUF | Mayor rendimiento en codigo, pero requiere mas VRAM |

Los datos de los modelos comparables provienen de conocimiento general y no de la informacion proporcionada en esta busqueda; deben verificarse en sus respectivas model cards. No se dispone de comparaciones directas publicadas entre KorshAI-4B-v5 y estos modelos.

## Limitaciones y advertencias

- Ausencia de evaluacion independiente: todos los benchmarks son del propio autor y no hay verificacion externa ni resultados en suites estandar.
- Razonamiento formal debil: 42,4% en razonamiento y 38,0% en seguridad de memoria C++ sugieren un rendimiento limitado en tareas que exijan deduccion compleja o gestion manual de memoria.
- Riesgo de alucinacion: como todo modelo de 4B, especialmente en codigo, puede generar APIs inexistentes, imports incorrectos o logica sutilmente erronea que compile pero falle en ejecucion.
- Contexto no documentado: la model card no especifica la longitud de contexto nativa; los ejemplos usan 4096 y 8192, pero no se confirma que el modelo haya sido entrenado para esos valores.
- Idiomas limitados: solo ingles y castellano declarados; no se evalua calidad en ninguno de los dos.
- Unico artefacto disponible: solo se publica Q4_K_M; no hay pesos fp16, safetensors ni otras cuantizaciones para evaluar el impacto de la cuantizacion.
- Licencia: Apache 2.0 permite uso comercial, pero la model card se corta en la seccion de licencia ("Apache License, Ve..."), por lo que conviene verificar el texto completo en el repositorio.
- Trazabilidad limitada: no se publican detalles de arquitectura, dataset, tokenizador ni proceso de entrenamiento, lo que dificulta la reproducibilidad y la auditoria.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta; no hay comunidad ni issues reportados que permitan anticipar problemas.
- Fecha de creacion futura (2026-11-15) en los metadatos de Hugging Face, lo que puede indicar un error de publicacion o un artefacto de generacion automatica; conviene tratar los metadatos con escepticismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KorshLAB/KorshAI-4B-v5
- Sitio web oficial de Korsh: https://korsh.org
- Laboratorio KorshLab: https://korshlab.space
- Discord de la comunidad: https://discord.gg/jdnWyDx64e
- Banner del modelo: https://huggingface.co/KorshLAB/KorshAI-4B-v5/resolve/main/banner.jpg
- No se han encontrado papers, repositorios de codigo, blogs tecnicos ni demos adicionales en la informacion disponible.
