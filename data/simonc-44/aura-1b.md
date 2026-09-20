# Simonc-44/aura-1b

## Resumen

Aura-1B es un sistema de IA neuro-simbólico publicado por el desarrollador Simonc-44 en HuggingFace bajo licencia MIT. A diferencia de un modelo de lenguaje convencional, se presenta como una arquitectura orquestada que separa el lenguaje natural, el cálculo matemático exacto y la memoria factual en módulos especializados, articulados por un orquestador central. Su regla de diseño declarada es "el modelo pequeño propone, el programa demuestra": aquello que no puede probarse se verifica o se rechaza, en lugar de generarse de forma especulativa. Está construido sobre el modelo base meta-llama/Llama-3.2-1B-Instruct, con un tamaño aproximado de 1.000 millones de parámetros.

El sistema está orientado explícitamente a la ejecución local en CPU, sin necesidad de GPU, con un consumo de memoria RAM declarado de aproximadamente 1 GB. La distribución no sigue el formato habitual de pesos abiertos: el paquete se entrega como un contenedor cifrado (aura_system.aef.enc, 779 MB) protegido con AES-256-GCM y firmado con Ed25519, acompañado de un ejecutable ligero (Aura.exe) que verifica la integridad antes de arrancar. El secreto de descifrado no está publicado y debe solicitarse al autor, lo que condiciona por completo su reproducibilidad y uso en producción.

Su relevancia actual radica en la combinación de tres factores: despliegue en hardware de gama baja sin GPU, uso de técnicas neuro-simbólicas (Program-of-Thoughts, verificación CRITIC) para reducir la alucinación en tareas verificables, y una política de distribución sellada que prioriza la integridad del binario. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, por lo que se trata de un proyecto incipiente y sin adopción comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema neuro-simbólico orquestado; orquestador + módulos especializados (lenguaje, matemáticas exactas, memoria factual) sobre un LLM base transformer (Llama-3.2-1B-Instruct) |
| Parametros totales | ~1.000 millones (1B, según modelo base y nomenclatura) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Llama-3.2-1B-Instruct soporta hasta 128.000 tokens, pero no se confirma el valor efectivo en Aura-1B) |
| Tipos de cuantizacion | No especificados; el repo usa la librería llama.cpp y etiqueta GGUF, pero el sistema se distribuye como contenedor cifrado (.aef.enc) |
| Idiomas soportados | Francés (fr) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | Contenedor sellado y cifrado aura_system.aef.enc (AES-256-GCM, PBKDF2 con 600.000 iteraciones, firma Ed25519); etiquetas GGUF/llama.cpp presentes |

## Arquitectura y entrenamiento

La model card describe Aura-1B como un sistema orquestado más que como un modelo monolítico. La arquitectura separa tres dominios: el procesamiento de lenguaje natural, el razonamiento matemático exacto y la memoria factual. El módulo de matemáticas emplea técnicas simbólicas citadas explícitamente en la documentación: AST (árboles de sintaxis abstracta), PAL (Program-Aided Language models) y PGS, de modo que los cálculos se ejecutan como programas en lugar de predecirse token a token. El módulo factual recurre a búsqueda web en directo y a verificación mediante el método CRITIC, de manera que los datos no verificados se rechazan en lugar de generarse.

El modelo parte de un ajuste fino (finetune) de meta-llama/Llama-3.2-1B-Instruct, según los metadatos de HuggingFace. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO sobre el ajuste. Tampoco se detalla la arquitectura interna del orquestador ni cómo se enrutan las consultas entre módulos. Uno de los tags del repositorio menciona MiniCPM, lo que sugiere la presencia de componentes adicionales, pero la model card no aclara su función exacta. La innovación declarada no reside en el entrenamiento, sino en el empaquetado: un contenedor cifrado con verificación triple de SHA-256 (configuración, código y pesos) que rechaza el arranque si un solo byte ha sido alterado.

## Capacidades

- Generación de texto en francés e inglés mediante el modelo base Llama-3.2-1B-Instruct.
- Cálculo matemático exacto mediante ejecución de programas (AST, PAL, PGS) en lugar de predicción estadística; la model card cita como ejemplo el cálculo del cuadrado de 7 (resultado 49) y operaciones con porcentajes.
- Resolución de operaciones con fechas y conversión de unidades de forma exacta, según la documentación.
- Verificación factual con búsqueda web en directo y validación CRITIC, orientada a reducir la invención de datos.
- Modo de razonamiento programático (Program-of-Thoughts) como estrategia central.
- Ejecución en CPU sin GPU, con arranque en caché para runs posteriores.
- Ejecución bajo línea de comandos mediante Aura.exe, pasando la consulta como argumento.
- Verificación de integridad criptográfica y autenticidad en el arranque (3× SHA-256 + firma Ed25519).
- No se documentan capacidades de tool calling genérico, function calling estándar, visión, audio ni modo de pensamiento explícito más allá del razonamiento programático descrito.
- No se documentan capacidades de agente multi-paso más allá del enrutado interno entre módulos del propio sistema.

## Casos de uso

- Cálculo aritmético y financiero local: el sistema resuelve operaciones exactas (porcentajes, fórmulas, conversiones) ejecutando programas en lugar de predecir, lo que lo hace adecuado para aplicaciones de escritorio que necesitan resultados verificables sin conexión a un servidor.
- Asistente de escritorio sin GPU: al requerir aproximadamente 1 GB de RAM y no necesitar GPU, puede desplegarse en portátiles de gama baja, mini-PC o entornos de oficina donde no hay aceleradores disponibles.
- Verificación de datos en tiempo real: gracias a la búsqueda web en directo y a la validación CRITIC, puede emplearse en flujos donde la información debe contrastarse contra fuentes actuales en lugar de depender del conocimiento congelado del entrenamiento.
- Educación y tutoría de matemáticas: la ejecución simbólica permite mostrar el resultado exacto de un problema y, previsiblemente, el procedimiento, útil en herramientas de práctica para estudiantes de primaria y secundaria.
- Automatización de tareas de línea de comandos: la interfaz Aura.exe con paso de consulta como argumento facilita integrarlo en scripts de shell o PowerShell para tareas repetitivas de cálculo y consulta.
- Procesamiento de documentación interna con enfoque RAG: la etiqueta RAG del repositorio sugiere soporte para recuperación aumentada, útil para consultar manuales o bases de conocimiento locales manteniendo los datos en la máquina.
- Despliegue en entornos con restricciones de red o de hardware: la ejecución local sin GPU y el contenedor sellado encajan en escenarios de borde o de intranet donde no se permite enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente ofrece una comparativa de rendimiento práctico frente a un modelo de 8B ejecutado en el mismo equipo, que se reproduce a continuación tal cual figura en la documentación del autor:

| Métrica | Aura-1B | Un 8B en el mismo PC |
|---|---|---|
| Pregunta cotidiana (latencia) | 0,0–2,3 s | 30–60 s |
| Matemáticas / fechas / unidades | Exacto (AST, PAL, PGS), según el autor | Alucina fuera de las estadísticas de entrenamiento |
| Hechos | Web en directo + prueba CRITIC | Congelados a la fecha de entrenamiento |
| RAM | ~1 GB | ~4,5 GB |
| GPU | Ninguna requerida | Recomendada |

Estos valores proceden exclusivamente de la model card y no han sido contrastados de forma independiente; deben interpretarse como afirmaciones del autor, no como resultados verificados.

## Requisitos de hardware

- RAM: aproximadamente 1 GB según la model card, frente a los ~4,5 GB que atribuye a un modelo de 8B en el mismo equipo.
- GPU: no requerida. El sistema está diseñado para ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no aplica como requisito; el sistema prioriza explícitamente la ejecución sin acelerador. No se documenta soporte para RTX 4090, A100, H100 ni otras GPU concretas.
- Opciones de despliegue: ejecución mediante el binario propietario Aura.exe sobre el contenedor aura_system.aef.enc. El repositorio está etiquetado con llama.cpp y GGUF, lo que sugiere compatibilidad con ese ecosistema, aunque no se detalla un procedimiento de despliegue alternativo (vLLM, TGI, Ollama) en la información disponible.
- Latencia: 0,0–2,3 s para preguntas cotidianas según el autor; arranque instantáneo en ejecuciones con caché ya poblada.
- Throughput: no disponible.
- Almacenamiento: el contenedor sellado ocupa 779 MB (807 MB de "cerebro" según la descripción), más 8,2 MB del ejecutable y 110 bytes de firma.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría, ya que no hay benchmarks públicos ni adopción medida. La model card solo compara Aura-1B con "un 8B genérico" sin nombrarlo ni aportar métricas reproducibles. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Aura-1B | ~1B (base Llama-3.2-1B-Instruct) | No disponible | MIT | Contenedor cifrado .aef.enc; código fuente del orquestador en GitHub |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Llama 3.2 Community License | Pesos abiertos en safetensors y GGUF |
| Modelos pequeños tipo Qwen2.5-1.5B / Gemma-2-2B | 1,5B–2B | 32.000–128.000 tokens | Apache 2.0 / Gemma Terms | Pesos abiertos |

La comparación con Llama-3.2-1B-Instruct es la más directa porque Aura-1B deriva de él, pero la diferencia clave es la distribución: Aura-1B no expone pesos abiertos, mientras que el modelo base sí. No se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- El autor reconoce explícitamente en la model card que, en análisis profundo, conocimiento de nicho y lógica abstracta, un modelo de 8B ajustado supera a Aura-1B, porque esas competencias residen en los pesos y no en la orquestación simbólica. La hoja de ruta menciona LoRA y MEMIT como vías futuras para abordarlo.
- El secreto de descifrado del contenedor no se publica y debe obtenerse del autor. Sin él, el archivo principal (.aef.enc) no es utilizable, lo que impide la reproducibilidad y limita gravemente el uso independiente.
- La distribución sellada está pensada para bloquear la copia pasiva, pero el propio autor admite que no resiste a un ingeniero inverso determinado ni constituye un DRM absoluto.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de redactar la ficha, sin validación comunitaria ni revisiones de terceros.
- El modelo solo declara soporte para francés e inglés; no se documenta castellano ni otros idiomas.
- No se especifica la longitud de contexto efectiva en el sistema orquestado, por lo que no puede garantizarse el comportamiento en conversaciones largas.
- Riesgo de alucinación reducido únicamente en dominios verificables (matemáticas, fechas, unidades, hechos con búsqueda web); en razonamiento abierto persiste el riesgo propio de un modelo de 1B.
- La arquitectura orquestada introduce dependencia de módulos externos (búsqueda web en directo) cuyo comportamiento en producción no está documentado.
- Aunque la licencia es MIT, la necesidad de obtener el secreto del autor para desplegar el sistema puede entrar en conflicto práctico con un uso comercial autónomo. El código del repositorio es abierto, pero el artefacto empaquetado no es totalmente libre en la práctica.
- No se han publicado resultados de benchmarks estándar, por lo que no es posible evaluar de forma objetiva su rendimiento frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/Simonc-44/aura-1b
- Repositorio GitHub (código abierto del sistema): https://github.com/Simonc44/aura-1b
- README completo del repositorio: https://github.com/Simonc44/aura-1b#readme
- Releases (v0.1.0): https://github.com/Simonc44/aura-1b/releases
- Licencia MIT: https://github.com/Simonc44/aura-1b/blob/main/LICENSE
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Contenedor sellado: https://huggingface.co/Simonc-44/aura-1b/resolve/main/aura_system.aef.enc
- Firma Ed25519: https://huggingface.co/Simonc-44/aura-1b/resolve/main/aura_system.aef.sig
- Ejecutable: https://huggingface.co/Simonc-44/aura-1b/resolve/main/Aura.exe
