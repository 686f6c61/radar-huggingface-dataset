# GermannM/kenga-prophet-m5-3

## Resumen

Kenga Prophet M5.3 es un modelo de generación de texto experimental de aproximadamente 838.000 parámetros, desarrollado por GermannM como parte de la serie Prophet, cuyo objetivo es investigar cómo la distribución de datos de entrenamiento determina las capacidades de generalización de modelos pequeños. El modelo genera código en Kenga, un lenguaje de programación diseñado para sistemas de IA autónomos, y su aportación principal es la demostración de que eliminar atajos de identificadores y estructura de llamadas del corpus sintético verificado resuelve el problema de binding semántico —es decir, llamar a la función correcta cuando existen funciones distractoras con la misma firma—, pasando de un 5,6 % a un 98,6 % de compilación correcta sin cambiar la arquitectura.

El modelo es un transformer decoder de 6 capas con dimensión de modelo 128 y 8 cabezas de atención, entrenado sobre un corpus de 14.550 programas verificados, todos ejecutados con el runtime real de Kenga. Su ventana de contexto es de 128 tokens, con un codec de alfabeto completo de 128 tokens que incluye letras, números y subrayado, con fusión BPE sobre identificadores reales. La relevancia de este modelo radica en que ofrece evidencia empírica controlada de que la calidad de un modelo pequeño depende más de qué dependencias causales semánticas la distribución de datos le obliga a aprender que de la cantidad de datos. Está pensado para la investigación en generalización composicional, no para uso productivo en aplicaciones convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (numpy), K=128, D=128, H=8, L=6 |
| Parámetros totales | ~838.000 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Kenga (lenguaje de programación específico del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se referencia un archivo de pesos `mid_prophet_m53_w.txt`, formato no documentado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal implementado en numpy, con dimensiones de modelo 128, 8 cabezas de atención y 6 capas, lo que da un total de aproximadamente 838.000 parámetros. El tokenizador es un codec de 128 tokens que cubre el alfabeto completo (`a-z A-Z 0-9 _`), con fusiones BPE sobre identificadores reales y dígitos deletreados. Se entrenó con un objetivo LM causal por posición, optimizador Adam con gradiente global-norm clip 1.0, tasa de aprendizaje 0,002, batch de 64 y 2.400 pasos, lo que supone unas 3 horas de entrenamiento en CPU.

El corpus de entrenamiento versión 2 contiene 14.550 programas verificados distribuidos en 5 familias (aritmética, bucles, recursión con equivalentes iterativos, cadenas y binding), más archivos reales de Kenga, con una división determinista de 90 %/10 % a nivel de archivo. Cada programa de entrenamiento fue ejecutado por el runtime real de Kenga. La innovación clave de esta versión M5.3 es la eliminación de los atajos de identificadores y de la estructura de llamadas del corpus verificado: en versiones anteriores, `main` siempre llamaba a `run()`, lo que llevaba al modelo a generar llamadas a funciones inexistentes cuando se enfrentaba a código real. La versión Factory v2 randomiza los nombres de funciones y variables, añade funciones distractoras y varía los patrones de llamada.

## Capacidades

- Generación de código Kenga: es capaz de completar bloques de código y generar programas completos en el lenguaje Kenga, compilando correctamente en el 100 % de los casos de generalización de plantillas (eje A).
- Binding semántico: el modelo puede seleccionar la función correcta entre 1-2 funciones distractoras con la misma firma, alcanzando un 98,6 % de compilación en el eje B, cuando la única discriminación disponible es el nombre de la función.
- Generalización de plantillas: el modelo generaliza a plantillas de programas no vistas en el entrenamiento, con una división de datos disjunta a nivel de plantilla.
- Transferencia a código real: en el eje C (generación de código real de archivos de Kenga), el modelo compiló correctamente 1 de 6 generaciones (17 %), lo que indica una capacidad emergente de transferencia, aunque limitada.
- Sin capacidades de texto natural: el modelo está especializado únicamente en el lenguaje de programación Kenga; no tiene capacidades de razonamiento de texto general, matemáticas o vision.
- Sin soporte de tool calling ni agentes: no hay soporte de function calling en el sentido convencional, aunque el propio lenguaje Kenga está diseñado para agentes.

## Casos de uso

- Investigación en generalización composicional: el modelo es un banco de pruebas para estudiar cómo la distribución de datos afecta la capacidad de un modelo pequeño de aprender dependencias causales semánticas. Su diseño con verificación por compilador en el bucle de entrenamiento permite experimentos controlados con división de plantillas disjuntas.
- Generación de código en lenguajes de dominio específico: si se dispone de un runtime verificado para un lenguaje pequeño, la metodología del modelo (corpus sintético verificado + eliminación de atajos) puede aplicarse para entrenar generadores de código de tamaño reducido que compilan correctamente.
- Evaluación de protocolos de reparación de código: el modelo viene con un conjunto de evaluación de 806 mutantes (broken → fixed) que puede servir como referencia para futuros experimentos de reparación de código en modelos pequeños.
- Educación sobre sesgos de evaluación en ML: el modelo documenta explícitamente errores de evaluación previos (como la memorización de datos de entrenamiento en M4.2), lo que lo convierte en un caso de estudio sobre cómo validar la generalización real de modelos pequeños.
- Experimentación en entornos sin GPU: al ser un modelo de 838K parámetros entrenado en CPU, se puede reproducir y ejecutar en hardware modesto, lo que lo hace accesible para laboratorios de investigación con recursos limitados.
- Estudio de la relación entre distribución de datos y rendimiento: el modelo permite comparar directamente las versiones M5.2 y M5.3 con el mismo backbone y presupuesto de entrenamiento, variando solo la distribución de datos, para medir el impacto causal de la eliminación de atajos.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados controlados con división de datos disjunta a nivel de plantilla:

| Eje | Métrica | M5.2 | M5.3 |
|---|---|---|---|
| A: generalización factory/template | compile / run | 92,5 % | 100 % |
| A: generalización factory/template | greedy match / pass@4 | 22,5 % / 37,5 % | 27,5 % / 37,5 % |
| B: binding semántico (con distractores) | compile | 5,6 % | 98,6 % |
| B: binding semántico (con distractores) | greedy match / pass@4 | 1,4 % / 2,1 % | 6,2 % / 16,0 % |
| C: generación de código real | compile | 0/6 | 1/6 (17 %) |
| C: generación de código real | exact stdout match | 0/6 | 0/6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje general, sino un generador de código para un lenguaje de programación específico. El autor advierte explícitamente que las cifras de "~1 %" de código real citadas para modelos anteriores de la serie M4 eran inválidas por un bug de evaluación, y que el 83 % de precisión de NT de M4.2 es memorización del conjunto de entrenamiento, no generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~838K parámetros, por lo que la inferencia requiere menos de 1 GB de memoria, incluso en FP32.
- GPU recomendadas: no se necesita GPU; el entrenamiento se realizó en CPU en ~3 horas, por lo que la inferencia en CPU es trivial.
- Compatibilidad con GPUs de consumo: sí, cualquier GPU de consumo es más que suficiente, aunque no es necesaria.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama o TGI documentada. El modelo se usa mediante el script `kenchat` que se incluye en el repositorio, con un codec y un archivo de pesos.
- Latencia y throughput: no disponibles, pero dado el tamaño del modelo y la ventana de contexto de 128 tokens, la latencia debería ser del orden de milisegundos en CPU moderna.

## Comparativa con modelos similares

No hay modelos comparables publicados en el ecosistema de Kenga. Los modelos Prophet M4.2, M5 y M5.2 son las versiones anteriores de la misma serie, y el propio M5.3 es el punto de referencia más avanzado dentro de esta línea. No existen otros modelos públicos que generen código en el lenguaje Kenga con verificación por compilador en el bucle de entrenamiento. Si se busca una comparativa con modelos de generación de código generalistas (CodeLlama, StarCoder, etc.), no es pertinente porque el dominio, el tamaño y la metodología difieren radicalmente.

## Limitaciones y advertencias

- El modelo solo genera código en Kenga, un lenguaje de programación diseñado por el autor para IA autónoma; no es útil para generar código en lenguajes convencionales (Python, JavaScript, etc.).
- La ventana de contexto de 128 tokens limita la generación a programas muy cortos; no es adecuado para código real de tamaño medio o grande.
- La precisión de generación de código real es baja (1/6 en el eje C), y la coincidencia exacta de stdout es 0/6; el autor reconoce que esto puede deberse en parte a la arbitrariedad de las constantes en los archivos originales, pero no hay garantía de utilidad en producción.
- El modelo no tiene capacidades de texto natural, razonamiento, matemáticas ni vision; su único dominio es la generación de código Kenga.
- No se han publicado los pesos en un formato estándar (safetensors, GGUF, etc.); se distribuye un archivo de pesos textual (`mid_prophet_m53_w.txt`) que requiere el código de `kenchat` del repositorio para cargarse.
- El autor advierte explícitamente de bugs de evaluación en versiones anteriores y de memorización del conjunto de entrenamiento en M4.2; cualquier cifra de rendimiento anterior a M5.3 debe tratarse con precaución.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no tiene garantías de mantenimiento o soporte.
- No hay documentación sobre sesgos, aunque al ser un modelo de código de un lenguaje específico, el riesgo de sesgo de texto natural no es aplicable; el riesgo principal es la alucinación de llamadas a funciones inexistentes, que se ha reducido pero no eliminado (1/6 en el eje C).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GermannM/kenga-prophet-m5-3
- Repositorio del lenguaje Kenga (GitHub): https://github.com/GermannM3/kenga-lang
- Releases del lenguaje Kenga: https://github.com/GermannM3/kenga-lang/releases
- Modelos relacionados en Hugging Face (etiqueta kenga): https://huggingface.co/models?other=kenga
