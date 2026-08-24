# Eduloop/mathtok

## Resumen

MathTok es un marco de tokenización híbrido basado en AST (Abstract Syntax Tree) para el modelado de lenguaje matemático, desarrollado por Eduloop. A diferencia de los tokenizadores convencionales como BPE o SentencePiece, que tratan las expresiones matemáticas como secuencias de texto plano, MathTok construye un árbol sintáctico abstracto de cada expresión y lo serializa mediante un recorrido DFS en preorden, preservando la jerarquía de operadores y la estructura semántica completa. El pipeline incluye una capa de canonicalización basada en SymPy, un lexer híbrido que separa texto natural de contenido matemático, un generador de AST tipado, un codificador semántico consciente de operadores y una serialización estructural que produce un flujo de tokens enriquecido con metadatos de atención.

Se trata de un tokenizador de investigación, no de un modelo de lenguaje completo: no incluye pesos de red neuronal ni arquitectura transformer. Su propósito es servir como capa de preprocesamiento para futuros modelos de razonamiento matemático, mejorando la densidad semántica, la eficiencia estructural y la compresión simbólica frente a tokenizadores estándar. El repositorio en HuggingFace tiene un tamaño de 0.0 GB, lo que confirma que no contiene parámetros entrenados, sino código y configuración del pipeline. La licencia es MIT, lo que permite uso comercial y modificación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tokenización basado en AST (no es un modelo neuronal) |
| Parametros totales | No aplica (no contiene pesos de red) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (etiqueta `en` en la model card) |
| Licencia | MIT |
| Formato de pesos | No aplica (código Python, exportable a tokenizer de HuggingFace) |

## Arquitectura y entrenamiento

MathTok no es un modelo entrenado con datos masivos, sino un pipeline determinista compuesto por varias etapas: canonicalización (usando SymPy para simplificar, expandir y normalizar expresiones), un lexer híbrido que separa tramos de texto natural de tramos matemáticos, un generador de AST que convierte el árbol de SymPy en una estructura tipada `ASTNode`, un codificador semántico que asigna metadatos por operador, una serialización estructural mediante DFS en preorden, y finalmente un mapeo a vocabulario fijo de matemáticas combinado con BPE de HuggingFace para el texto. El resultado es un flujo de tokens comprimido con metadatos de contexto arbóreo por token, pensado para habilitar máscaras de atención conscientes de la estructura en futuros transformers.

No se especifican datos de entrenamiento, número de tokens procesados ni técnicas de RLHF o DPO, ya que no se trata de un modelo generativo. El repositorio incluye una suite de más de 110 tests que cubren generación de AST, canonicalización, validación del lexer, integración del pipeline, consistencia de serialización y métricas de comparación estructural. La emisión de CO₂ declarada es 0, coherente con un proyecto sin entrenamiento de redes neuronales.

## Capacidades

- Tokenización de expresiones matemáticas en formato LaTeX o ASCII, produciendo tokens semánticamente ricos como `FUNCTION_SIN`, `VARIABLE_x`, `POWER`, `OP_ADD`, etc.
- Canonicalización de expresiones equivalentes mediante SymPy (simplificación, expansión, normalización), lo que permite agrupar variantes sintácticas de la misma fórmula.
- Preservación de la jerarquía de operadores y de la estructura arbórea completa, con metadatos de profundidad y posición en el árbol para cada token.
- Serialización en formato S-expression (sexp) además del flujo de tokens plano, útil para depuración y análisis.
- Exportación a un tokenizer compatible con HuggingFace mediante `get_hf_tokenizer()`, permitiendo su integración en pipelines de transformers.
- Soporte de expresiones mixtas (texto natural + matemáticas) mediante delimitadores LaTeX (`$...$`), separando correctamente ambos dominios.
- Generación de metadatos estructurales para atención consciente del árbol (tree-aware attention), una capacidad orientada a arquitecturas futuras.

## Casos de uso

- Preprocesamiento de corpus matemáticos para entrenar LLMs especializados: MathTok puede convertir grandes volúmenes de expresiones LaTeX en tokens estructurados, reduciendo la fragmentación semántica que sufren los tokenizadores BPE estándar y mejorando la compresión simbólica.
- Sistemas de tutoría inteligente en matemáticas: al tokenizar expresiones de forma canónica, un sistema puede comparar respuestas de estudiantes con soluciones de referencia sin verse afectado por variaciones sintácticas irrelevantes (p. ej., `(x+1)^2` vs `x^2+2x+1`).
- Generación de código simbólico: el pipeline puede integrarse en herramientas que traducen expresiones matemáticas a código de librerías como SymPy o NumPy, aprovechando la serialización sexp para una transformación directa.
- Motores de búsqueda de fórmulas: la canonicalización permite indexar expresiones matemáticas por su forma normalizada, facilitando la recuperación de fórmulas equivalentes en bases de datos científicas.
- Evaluación de tokenizadores: el módulo `evaluation.comparison` permite comparar MathTok con GPT-2 BPE, SentencePiece Unigram y tokenización a nivel de carácter, usando métricas como SCR, densidad semántica y eficiencia estructural.
- Investigación en arquitecturas tree-aware: los metadatos de profundidad y posición en el árbol generados por MathTok pueden alimentar mecanismos de atención que respeten la estructura jerárquica de las expresiones, un área activa en el modelado de razonamiento matemático.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el modelo-index, sin verificación independiente y con valores cualitativos, no numéricos:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Tokenización matemática | Custom Mathematical Benchmark (symbolic-math) | Semantic Density | Improved |
| Tokenización matemática | Custom Mathematical Benchmark (symbolic-math) | Structural Efficiency | Optimized |
| Tokenización matemática | Custom Mathematical Benchmark (symbolic-math) | Symbolic Compression Ratio (SCR) | Enhanced |

No se proporcionan cifras concretas (porcentajes, ratios numéricos) ni comparaciones cuantitativas con otros tokenizadores en la información disponible. El repositorio incluye un script de evaluación (`evaluation.comparison`) que compara MathTok con GPT-2 BPE, SentencePiece Unigram y tokenización a nivel de carácter, pero los resultados de dicha ejecución no se han publicado en la model card.

## Requisitos de hardware

- Al ser un tokenizador determinista sin pesos de red, no requiere GPU para su ejecución; funciona en CPU con Python 3.10.
- La memoria necesaria es mínima, proporcional al tamaño de las expresiones de entrada; no se han publicado mediciones de consumo.
- Para la exportación a tokenizer de HuggingFace se necesita el paquete `transformers` y `tokenizers`, pero no se requiere hardware especializado.
- El pipeline puede ejecutarse en cualquier máquina con Python, incluyendo entornos de CI/CD o notebooks ligeros.
- No se dispone de datos de latencia o throughput; al ser un proceso simbólico, el rendimiento depende de la complejidad de las expresiones y de la velocidad de SymPy.

## Comparativa con modelos similares

La model card menciona que el benchmark interno compara MathTok con tres alternativas, pero no se publican resultados numéricos. La comparación cualitativa esperada es:

| Tokenizador | Enfoque | Estructura matemática | Canonicalización | Metadatos de árbol |
|---|---|---|---|---|
| MathTok | Híbrido AST + BPE | Preservada (AST) | Sí (SymPy) | Sí (profundidad, posición) |
| GPT-2 BPE | Subword estadístico | No preservada | No | No |
| SentencePiece Unigram | Subword probabilístico | No preservada | No | No |
| Character-Level | Carácter a carácter | No preservada | No | No |

MathTok se diferencia por su conciencia estructural y su capacidad de canonicalización, pero carece de la generalidad de los tokenizadores subword para texto libre. No se dispone de datos cuantitativos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: MathTok no genera texto ni realiza razonamiento; es únicamente un tokenizador. No debe usarse como sustituto de un LLM.
- El repositorio en HuggingFace tiene 0 descargas y 0 likes, y el tamaño del repo es 0.0 GB, lo que sugiere que es un proyecto en fase inicial o de demostración, sin adopción verificada.
- Los benchmarks declarados son cualitativos ("Improved", "Optimized", "Enhanced") y no verificados; no hay métricas numéricas reproducibles publicadas.
- Solo soporta inglés como idioma de texto natural (etiqueta `en`); el contenido matemático es independiente del idioma, pero el lexer híbrido está pensado para texto en inglés.
- La dependencia de SymPy para la canonicalización puede introducir latencia en expresiones muy complejas y requiere que SymPy esté instalado y actualizado.
- No se especifican limitaciones de longitud de expresión ni de profundidad del AST; expresiones extremadamente anidadas podrían superar la recursión de Python.
- La licencia MIT permite uso comercial, pero al ser un proyecto sin mantenimiento aparente (fecha de creación futura, 2026), no hay garantía de soporte ni de corrección de errores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Eduloop/mathtok
- Repositorio original en GitHub (SurweeshSP): https://huggingface.co/SurweeshSP/mathtok
- Sitio web de EduLoop: https://eduloop.ai/
- Página de MathTok en Mathverse: https://www.lekkermath.com/mathtok
- Proyecto MathTok en Devpost: https://devpost.com/software/mathtok
- Repositorio Eduloop-AI en GitHub: https://github.com/Princejaiswal18/Eduloop-AI
