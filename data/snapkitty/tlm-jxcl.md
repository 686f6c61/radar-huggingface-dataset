# Snapkitty/tlm-jxcl

## Resumen

TLM-JXCL no es un modelo de inteligencia artificial en el sentido convencional. Se trata de una especificación de arquitectura de conjunto de instrucciones (ISA) de 64 bits para un "oleoducto de computación soberana" (sovereign computing pipeline), publicada en HuggingFace por el colectivo Snapkitty. Según la model card, integra operaciones de campo finito GF(2⁸), direccionamiento de memoria en espiral logarítmica y plegado de estado determinista, con el objetivo de proporcionar un control vertical completo desde operaciones de nivel de bit hasta pipelines criptográficos. Los autores citados son Ahmad Ali Parr y Jessica L. Williams (SNAPKITTYWEST).

La entrada en HuggingFace muestra cero descargas, cero likes, sin pipeline definido y sin datos de licencia en el repositorio, aunque la model card menciona una combinación de licencias BSL-1.1, AGPL-3.0 y MPL-2.0. El contenido del README está redactado en chino tradicional y árabe. Dado que no es un modelo de lenguaje ni un modelo neuronal, no dispone de parámetros, contexto de tokenización ni pesos; es, en esencia, una definición técnica de una máquina virtual o de un conjunto de instrucciones de bajo nivel.

Su relevancia actual es limitada dentro del ámbito de los modelos de IA, pero podría interesar a personas que trabajan en arquitecturas de computación soberana, criptografía de bajo nivel o diseño de pipelines deterministas. No se han publicado resultados de benchmarks ni pruebas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de instrucciones (ISA) de 64 bits; no es un modelo de IA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | no disponible (no aplica, no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (model card en chino tradicional y árabe, no es un modelo lingüístico) |
| Licencia | BSL-1.1 / AGPL-3.0 / MPL-2.0 (según la model card; en HuggingFace aparece como no disponible) |
| Formato de pesos | no disponible (no aplica, no hay pesos) |

## Arquitectura y entrenamiento

Según la model card, la arquitectura define una máquina de 64 bits con 32 registros de propósito general y 10 registros especiales, una memoria mapeada de 64 KB organizada como una matriz de 73×23 celdas (1679 en total), y un polinomio de campo GF(2⁸) igual a 0x1B (x⁸+x⁴+x³+x+1). El direccionamiento de memoria sigue una expansión en espiral logarítmica desde el centro (36, 11), con una secuencia de pasos que se duplica: 1, 1, 2, 2, 4, 4, 8, 8, 16, 16, 32, 32, 64, 64... hasta cubrir la matriz. La profundidad máxima de recursión está fijada en 64.

El conjunto de instrucciones incluye operaciones XOR, desplazamientos a la izquierda y a la derecha, rotaciones circulares a la izquierda y a la derecha, todas disponibles en anchos de 8, 16, 32 y 64 bits; además de MIX32 (AES MixColumns sobre una columna), MIX64 (dos columnas) y XTIME (multiplicación en GF(2⁸) por x). El model card no detalla proceso de entrenamiento, datos, tokens ni ninguna etapa de RLHF, ya que no es un modelo neuronal. La ejecución descrita se realiza mediante `python run.py`, que lanza autotests y una verificación de compatibilidad con P3 MixColumns, finalizando en "EPOCH 1".

## Capacidades

- Operaciones bit a bit a nivel de instrucción: XOR, desplazamientos y rotaciones en anchos de 8/16/32/64 bits.
- Aritmética en campo finito GF(2⁸) mediante la instrucción XTIME.
- Implementación de AES MixColumns a través de MIX32 y MIX64.
- Direccionamiento de memoria en espiral logarítmica, con una clave de espiral compuesta por `(angle << 16) | radius_sq`.
- Plegado de estado determinista para la composición de operaciones verticales.
- Control vertical completo desde bits individuales hasta pipelines criptográficos, según la descripción del autor.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Implementación de primitivas criptográficas en firmware: la ISA permite realizar operaciones GF(2⁸) y AES MixColumns directamente, lo que resultaría adecuado para sistemas embebidos que requieran cifrado sin depender de librerías externas.
- Aceleración de algoritmos basados en campos finitos: XTIME y las operaciones MX permiten construir cálculos de polinomios en GF(2⁸) de forma explícita, útil en prototipos de criptografía de bajo nivel.
- Investigación en arquitecturas deterministas: el plegado de estado y el direccionamiento espiral ofrecen un entorno para estudiar máquinas de estado con memoria no lineal.
- Docencia de arquitectura de computadores y criptografía: el conjunto de instrucciones, pequeño y bien definido, puede usarse como ejemplo de una ISA con soporte explícito para AES y GF(2⁸).
- Experimentación con modelos de memoria alternativos: la matriz 73×23 con direccionamiento en espiral logarítmica permite evaluar el impacto del mapeo de memoria en recorridos de datos.
- Integración en pipelines de cómputo soberano: la especificación está pensada para "pipelines de cómputo soberano", por lo que podría desplegarse como backend de ejecución de bajo nivel en entornos que requieran trazabilidad total de las operaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM, ya que no es un modelo neuronal generativo.
- El ejecutable descrito es un script Python (`python run.py`), que funciona en cualquier entorno con Python instalado.
- No hay datos sobre latencia, throughput ni requisitos de memoria para la ejecución.
- No se especifican opciones de despliegue con frameworks como vLLM, llama.cpp, Ollama o TGI, al no tratarse de un modelo de inferencia.

## Comparativa con modelos similares

No disponible. No se ha identificado ningún modelo comparable en la información proporcionada, dado que TLM-JXCL no es un modelo de IA convencional sino una especificación de conjunto de instrucciones.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto ni realizar tareas de razonamiento, lenguaje o visión.
- Ausencia de validación comunitaria: la entrada en HuggingFace registra 0 descargas y 0 likes; carece de métricas de uso.
- Licencia ambigua: la model card menciona simultáneamente BSL-1.1, AGPL-3.0 y MPL-2.0, pero HuggingFace muestra la licencia como "no disponible"; es preciso aclarar cuál de las tres es la aplicable antes de usarlo comercialmente.
- Documentación críptica: el README combina chino tradicional y árabe, y emplea terminología poco convencional (p. ej., "soberano", "plegado determinista") sin definiciones claras.
- Ausencia de benchmarks o pruebas de rendimiento: no se aportan datos de velocidad, eficiencia ni validación funcional.
- Fecha de creación futura: 7 de septiembre de 2026 según HuggingFace, lo que puede indicar un proyecto experimental o una fecha errónea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Snapkitty/tlm-jxcl
- Perfil del autor: https://huggingface.co/Snapkitty
- Búsqueda de modelos de Snapkitty: https://huggingface.co/models?other=snapkitty
