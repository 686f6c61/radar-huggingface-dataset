# benvanik/hrx-loom-serve-example

## Resumen

`benvanik/hrx-loom-serve-example` es un artefacto de ejemplo publicado con Loom, el sistema de serving del ecosistema HRX/ROCm, no un modelo de lenguaje entrenado. Su contenido real es `example/tiny-text`: un programa determinista definido en código fuente que implementa una recurrencia aritmética sobre un vocabulario de cuatro tokens (`a=0`, `b=1`, `x=2`, `#=3`) y que produce salidas reproducibles byte a byte. El autor lo describe explícitamente como "aritmética determinista, no un chatbot entrenado".

Su relevancia no está en las capacidades de generación, sino en servir de fixture verificable para la cadena de publicación y ejecución de Loom: el checkpoint cabe dentro de la propia model card, `fetch` lo materializa como safetensors y la ejecución usa kernels compilados JIT, estado pooled y el servicio de texto de Loom. Con `max_tokens: 2`, el prompt `abxa` produce `bx`, lo que da una comprobación trivial de extremo a extremo.

No dispone de arquitectura transformer, pesos entrenados, tokenizador real, datos de entrenamiento ni benchmarks; el propio autor advierte que no es un proxy de rendimiento. Cualquier evaluación como modelo de generación de texto debe descartarse de antemano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Programa de estado definido en codigo fuente ("source-defined"), ejecutado con kernels compilados JIT por Loom; no es una red neuronal entrenada |
| Parametros totales | 1 parametro de checkpoint de 4 bytes |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (mantiene un historial de estado interno sin ventana declarada) |
| Tipos de cuantizacion | no disponible (checkpoint de 4 bytes; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible; el vocabulario se limita a los tokens `a`, `b`, `x` y `#` |
| Licencia | apache-2.0-with-llvm-exception (el README declara `license: other` con `license_name: apache-2.0-with-llvm-exception` y enlace a `LICENSE`) |
| Formato de pesos | safetensors (el checkpoint embebido en la model card se materializa como safetensors al hacer `fetch`) |
| Vocabulario | 4 tokens: `a=0`, `b=1`, `x=2`, `#=3` (EOS) |
| Libreria / runtime | `loom` (Loom SDK, ecosistema HRX de ROCm) |
| Pipeline declarado | `text-generation` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-27 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo es una recurrencia aritmética determinista: partiendo de cero, cada token consumido actualiza `h = (5*h + token + 2) % 97` y `k = (7*k + h + position) % 101`; a continuación se añade `k` al historial y se avanza la posición. La predicción es `(h + sum(history)) % 3`, salvo que se emite EOS (`#`) cada once tokens consumidos. El único "parámetro" es un checkpoint de cuatro bytes que cabe embebido en la propia model card y que `fetch` materializa en safetensors.

La innovación técnica relevante no está en el modelo, sino en la infraestructura que ejercita: ejecución mediante kernels reales compilados JIT, gestión de estado pooled y el servicio de texto de Loom. El repositorio incluye `smoke.py`, que comprueba catálogo y locks, descarga el modelo y valida su salida en un servidor CPU privado, y `refresh.py`, que actualiza locks de assets y catálogo tras cambios de autoría; ambos con `--help` y sin necesidad de clonar fuentes ni de sistema de compilación. No se documentan datasets, número de tokens, RLHF, DPO ni ninguna otra fase de entrenamiento.

## Capacidades

- Generación de secuencias deterministas sobre un vocabulario de cuatro tokens (`a`, `b`, `x`, `#`), con salida reproducible dada la misma entrada.
- Emisión de EOS (`#`) cada once tokens consumidos, lo que permite probar el manejo de tokens especiales y de parada.
- Mantenimiento de estado retenido (historial y posición) entre pasos de decodificación, útil para validar estado pooled en el runtime.
- Ejecución de kernels compilados JIT a través del servicio de texto de Loom.
- Materialización de un checkpoint embebido en la model card como safetensors.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni flujos de agentes.
- No soporta visión, audio ni ninguna otra modalidad.
- No tiene capacidades multilingües ni conocimiento factual de ningún tipo.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Smoke test de publicación en Hugging Face: `smoke.py` verifica catálogo, locks, descarga y salida esperada (`abxa` con `max_tokens: 2` debe dar `bx`), lo que permite detectar regresiones en el flujo de publicación antes de subir pesos reales.
- Validación de la materialización de safetensors: al ser un checkpoint embebido en la model card, sirve para comprobar que `fetch` reconstruye correctamente el fichero de pesos y que el runtime lo carga sin errores.
- Pruebas de regresión deterministas de servidores de inferencia: la salida es función pura de la entrada, de modo que cualquier divergencia indica un fallo en el servidor, en el kernel JIT o en el manejo de estado, no variabilidad estocástica.
- Validación del servicio de texto de Loom: ejercita el envoltorio de serving (estado pooled, avance de posición, parada por EOS) con un coste de recursos prácticamente nulo.
- Verificación de compilación JIT en nuevas plataformas: al no depender de pesos grandes ni de memoria de GPU, permite comprobar que los kernels se generan y ejecutan correctamente en un nodo o arquitectura nuevos del ecosistema ROCm.
- Pruebas de integración de clientes y parsers: un vocabulario de cuatro tokens con EOS cada once tokens es un caso límite útil para validar el parseo de respuestas, el truncado por `max_tokens` y la detección de secuencias de parada.
- Docencia y demostración de modelos con estado retenido: el algoritmo completo cabe en la model card, lo que facilita explicar la diferencia entre estado recurrente, historial y ventana de contexto.
- Validación del flujo de autoría (`refresh.py`): tras modificar programas, metadatos o el propio check, se comprueba que los locks de assets y el catálogo se actualizan de forma coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que se trata de "un pequeño ejemplo de estado retenido, no un proxy de rendimiento", por lo que no se proporcionan métricas de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el checkpoint ocupa 4 bytes y el estado es un historial de enteros, por lo que la inferencia cabe en memoria de CPU.
- GPU recomendadas: no se especifican; el `smoke.py` documentado se ejecuta en un servidor CPU privado, sin requerir acelerador.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; no se documenta ninguna ventaja de ejecutarlo en A100, H100 o RTX 4090.
- Despliegue: mediante el Loom SDK y su servicio de texto (compilación JIT de kernels, estado pooled). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y su naturaleza no transformer lo hace incompatible con esos runners estándar.
- Latencia y throughput: no disponibles; existe un coste de compilación JIT no cuantificado en la información proporcionada.
- Requisitos de software: Loom SDK instalado (guía de adquisición enlazada más abajo); los scripts `smoke.py` y `refresh.py` no requieren clonar el código fuente ni disponer de sistema de compilación.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables y la categoría no es equiparable: este artefacto no es un modelo entrenado con parámetros aprendidos, sino un fixture de prueba determinista, por lo que comparar parámetros, contexto o rendimiento con LLM ligeros (por ejemplo, modelos de menos de 1B parámetros) carecería de sentido. La comparación relevante sería contra otros fixtures de test de pipelines de serving, para los que tampoco se aportan datos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| benvanik/hrx-loom-serve-example | 1 parametro de checkpoint (4 bytes) | no disponible | no disponible (el autor lo declara no representativo) | apache-2.0-with-llvm-exception | Hugging Face, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no ha sido entrenado y no contiene conocimiento factual, por lo que su salida es aritmética y carece de significado lingüístico.
- El vocabulario se reduce a cuatro tokens (`a`, `b`, `x`, `#`); cualquier texto fuera de ese alfabeto queda fuera de su dominio.
- No soporta herramientas, razonamiento, agentes ni imágenes, según el propio autor.
- No debe usarse como referencia de rendimiento, calidad ni latencia de Loom o del hardware subyacente.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la salida puede interpretarse erróneamente como texto generado; conviene etiquetar el artefacto como fixture en cualquier entorno compartido.
- Idiomas: no se declara ninguno; la metadata de Hugging Face no incluye campo de idiomas.
- Licencia: la metadata indica `apache-2.0-with-llvm-exception` mientras que el README declara `license: other` con ese mismo nombre; conviene verificar el fichero `LICENSE` del repositorio antes de reutilizarlo. La excepción LLVM afecta a la interacción con componentes LLVM, no a los pesos.
- El campo `tags` incluye `region:us`, sin más implicaciones documentadas.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y actualización el mismo día de la creación.
- No es desplegable en runners estándar (vLLM, llama.cpp, Ollama, TGI) al no emplear una arquitectura transformer ni pesos convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benvanik/hrx-loom-serve-example
- Guía de adquisición del Loom SDK: https://rocm.github.io/hrx-system/loom/getting-started/acquiring-loom/
- Guía de publicación en Hugging Face de Loom: https://rocm.github.io/hrx-system/loom/serving/sharing/hugging-face/
- Repositorio del proyecto HRX/ROCm: https://rocm.github.io/hrx-system/
- Ficheros mencionados en el repositorio: `smoke.py` (comprobación de catálogo, locks, descarga y salida) y `refresh.py` (actualización de locks y catálogo)
