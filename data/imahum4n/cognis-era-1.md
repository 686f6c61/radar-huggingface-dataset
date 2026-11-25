# imahum4n/cognis-era-1

## Resumen

Cognis Era 1 (Coe1) es un modelo de lenguaje presentado por el autor imahum4n como un "Cyber Reasoning System" (CRS) orientado a descompilación de binarios, auditoría de seguridad de memoria y programación de sistemas. El modelo se distribuye como un GGUF cuantizado en Q4_K_M y está pensado para ejecutarse en entornos locales y de borde (edge), con un consumo de RAM declarado de aproximadamente 1,05 GB. Según los metadatos del repositorio, el checkpoint subyacente contiene 1.543.714.304 parámetros (~1,54 B), y el nombre del fichero GGUF publicado (`Qwen2.5-Coder-1.5B-Instruct.Q4_K_M.gguf`) indica que se trata de un ajuste o derivado de Qwen2.5-Coder-1.5B-Instruct, una arquitectura transformer de tipo Qwen2.

El modelo se presenta como una herramienta para ingeniería inversa, resolución de retos CTF y análisis de binarios, con un mecanismo de "Compiler Gate" que, según el autor, ejecuta el código C/C++ generado a través de GCC para verificar su compilabilidad antes de la emisión. Incorpora trazas de razonamiento estructurado mediante etiquetas `<think>` para simular ejecución simbólica. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

Es relevante ahora por su propuesta de bajo coste computacional (inferencia en CPU/edge con ~1 GB de RAM) aplicada a tareas de seguridad, un nicho tradicionalmente dominado por modelos de mayor tamaño. No obstante, la información disponible es limitada: no se detallan datos de entrenamiento, composición del dataset ni metodología de evaluación de los benchmarks declarados, y el modelo cuenta con una adopción muy reducida (375 descargas y 3 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (derivado de Qwen2.5-Coder-1.5B-Instruct, segun nombre del fichero GGUF) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de la model card usa `n_ctx=2048` |
| Tipos de cuantizacion | Q4_K_M (publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen2.5-Coder-1.5B-Instruct.Q4_K_M.gguf`, ~986 MB); `config.json` y `Modelfile` de Ollama |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen2, con aproximadamente 1,54 B de parámetros. El nombre del artefacto GGUF sugiere que el modelo parte de Qwen2.5-Coder-1.5B-Instruct y ha sido ajustado o adaptado para tareas de ciberseguridad, descompilación y análisis de binarios. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla el proceso de destilación o ajuste fino que habría dado lugar a las capacidades declaradas.

La innovación técnica destacada por el autor es el "Linux GCC Compiler Gate": un bucle de retroalimentación que, según la model card, compila el código C generado con GCC y, si detecta errores o avisos de sintaxis o cabeceras faltantes, activa un mecanismo de autocorrección antes de emitir la respuesta final. También se describe el uso de trazas de razonamiento `<think>` para simular ejecución simbólica antes de generar el código. No se aporta documentación técnica independiente que verifique la implementación de estos mecanismos ni su integración real en el pipeline de inferencia (el GGUF por sí solo no ejecuta GCC; el "gate" requeriría un orquestador externo).

## Capacidades

- Descompilación de ensamblador x86-64 y ARM64 a C legible, con tipado de variables, según la model card.
- Verificación de compilabilidad mediante un bucle con GCC (Compiler Gate) y autocorrección de errores de sintaxis.
- Auditoría de seguridad de memoria: detección de desbordamientos de heap, punteros no inicializados, errores off-by-one y fugas de memoria, con parches propuestos.
- Resolución de retos CTF: matrices de transformación bit a bit, crackmes con XOR y puertas lógicas binarias.
- Razonamiento estructurado mediante trazas `<think>` (modo de razonamiento simbólico declarado).
- Generación de código C/C++ y programación de sistemas.
- Ejecución local y en entornos air-gapped (sin conexión), orientada a despliegue edge.
- El autor declara ausencia de rechazos ("zero corporate preachiness") en análisis de seguridad.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Descompilación asistida en ingeniería inversa: dado un listado de ensamblador de una función stripped, el modelo genera una reconstrucción en C que el analista puede revisar; el bucle con GCC ayuda a descartar salidas no compilables antes de la revisión manual.
- Auditoría de seguridad de memoria en revisiones de código: el modelo señala patrones de desbordamiento de heap, punteros sin inicializar y fugas, y propone parches; útil como primera pasada en revisiones de código C/C++ de sistemas embebidos.
- Resolución de retos CTF: para categorías de reversing y criptografía básica (XOR, transformaciones bit a bit), el modelo puede generar scripts de solución y explicar la lógica del binario.
- Formación y docencia en reversing: al ejecutarse en local con ~1 GB de RAM, permite a estudiantes practicar descompilación en portátiles sin GPU y sin enviar binarios a servicios en la nube.
- Análisis en entornos air-gapped: al ser un GGUF ejecutable con llama.cpp u Ollama, puede desplegarse en estaciones de trabajo aisladas donde no se permite el acceso a APIs externas, un requisito habitual en análisis de malware.
- Automatización de pipelines de parcheo: integrado en un orquestador que invoque GCC, el modelo podría generar y validar candidatos de parche para vulnerabilidades detectadas, con revisión humana obligatoria antes de aplicar cambios.
- Prototipado rápido de utilidades de sistemas: generación de funciones C con cabeceras estándar (`stdint.h`, etc.) para tareas de manipulación de bits y estructuras de bajo nivel.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card. No se especifica la metodología, el conjunto de evaluación ni la fuente de los resultados de los modelos comparados, por lo que deben interpretarse con cautela.

| Metrica | Cognis Era 1 (1,5 B) | WhiteRabbitNeo-7B | LLM4Decompile-6.7B |
|---|---|---|---|
| Compilabilidad sintactica | 99,7% | 92,1% | 87,4% |
| Auditoria de seguridad de memoria | 98,9% | 90,1% | 84,7% |
| Precision en matematicas y logica CTF | 100,0% | 91,2% | 85,1% |
| Huella de RAM fisica | 1,05 GB | 5,80 GB | 5,20 GB |
| Bucle de retroalimentacion del compilador | Activo (GCC) | Ninguno | Ninguno |

No se han publicado resultados independientes de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 1,05 GB de RAM con la cuantización Q4_K_M publicada (~986 MB de fichero); suficiente para ejecución en CPU.
- GPU recomendadas: no se especifican; al ser un modelo de 1,5 B en Q4_K_M, puede ejecutarse en cualquier GPU consumer con al menos ~1,5-2 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050 o superiores), aunque el autor lo orienta a CPU y dispositivos edge.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, y también en CPU, móviles y Mac.
- Opciones de despliegue: Ollama (`ollama run hf.co/imahum4n/cognis-era-1`), llama.cpp (`llama-cli`), llama-cpp-python, y cualquier runtime compatible con GGUF. El repositorio incluye un `Modelfile` para Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. La ventana de contexto usada en el ejemplo de la model card es de 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cognis Era 1 | ~1,54 B | No disponible (ejemplo con 2048) | Descompilacion, seguridad de memoria, CTF | Apache 2.0 | GGUF en Hugging Face, Ollama, llama.cpp |
| WhiteRabbitNeo-7B | ~7 B | No disponible | Ciberseguridad ofensiva/defensiva | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| LLM4Decompile-6.7B | ~6,7 B | No disponible | Descompilacion de binarios | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5 B | No disponible en la informacion proporcionada | Generacion de codigo general | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La ventaja declarada por el autor es la huella de memoria (1,05 GB frente a 5,2-5,8 GB de los modelos de 6,7-7 B) y la integración del bucle con GCC. No hay datos independientes que permitan verificar la superioridad en calidad de descompilación frente a los modelos comparados.

## Limitaciones y advertencias

- Los benchmarks son autodeclarados y no incluyen metodología, tamaño de muestra ni conjuntos de evaluación verificables; deben tratarse como afirmaciones del autor, no como resultados validados.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Ventana de contexto no especificada oficialmente; el ejemplo usa 2048 tokens, lo que limita el análisis de binarios o funciones de gran tamaño.
- Riesgo de alucinación en la reconstrucción de código: la descompilación puede generar C sintácticamente válido pero semánticamente incorrecto; el Compiler Gate verifica compilabilidad, no corrección funcional.
- El "Compiler Gate" con GCC requiere un orquestador externo; el GGUF por sí solo no ejecuta el compilador, por lo que la característica depende de la infraestructura que rodee al modelo.
- La afirmación de "ausencia de rechazos" en análisis de seguridad implica que el modelo puede producir contenido de doble uso; su uso debe enmarcarse en contextos legales y autorizados (auditorías propias, CTF, investigación).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen2.5-Coder si el derivado se redistribuye.
- Adopción muy baja (375 descargas, 3 likes) y ausencia de validación por terceros; no se recomienda para producción crítica sin evaluación propia.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del propio modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imahum4n/cognis-era-1
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Modelo base referenciado en el nombre del artefacto: Qwen2.5-Coder-1.5B-Instruct (https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- No se han encontrado en la informacion proporcionada papers, blogs o demos adicionales del autor.
